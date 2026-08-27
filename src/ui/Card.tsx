import React, { useRef } from "react";
import {
  getRank,
  isValidMove,
  isValidDescendingRun,
  flipNewlyExposedCards,
  removeCompletedSetsFromTableau,
} from "../utils/game";
import type { GameState, Card as CardType } from "../types/game";
import styles from "../styles/Card.module.css";

interface CardProps {
  data: CardType;
  index: number;
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  deckIndex: number;
  hint?: "source" | "target";
}

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  cards: HTMLElement[];
  hover: HTMLElement | null;
};

const SNAP_MS = 180;
let snapTimer: ReturnType<typeof setTimeout> | undefined;

const findColumnAtPoint = (clientX: number, clientY: number): number => {
  const board = document.querySelector("[data-testid=card-board]");
  if (board) {
    const br = board.getBoundingClientRect();
    if (clientY < br.top - 16) return -1;
  }
  const holders = document.querySelectorAll<HTMLElement>(
    "[data-testid=card-holder]",
  );
  let best = -1;
  let bestDx = Infinity;
  holders.forEach((h) => {
    const r = h.getBoundingClientRect();
    if (clientY < r.top - 16) return;
    const pad = 14;
    if (clientX < r.left - pad || clientX > r.right + pad) return;
    const dx = Math.abs(clientX - (r.left + r.right) / 2);
    if (dx < bestDx) {
      bestDx = dx;
      best = Number(h.dataset.deckIndex);
    }
  });
  return best;
};

const holderForColumn = (deckIndex: number): HTMLElement | null =>
  document.querySelector(`[data-testid=card-holder][data-deck-index="${deckIndex}"]`);

const setDropHover = (
  session: DragSession,
  el: HTMLElement | null,
): void => {
  if (session.hover === el) return;
  session.hover?.removeAttribute("data-drop-hover");
  if (el) el.setAttribute("data-drop-hover", "true");
  session.hover = el;
};

const clearDragStyles = (cards: HTMLElement[], animate: boolean): void => {
  if (snapTimer !== undefined) window.clearTimeout(snapTimer);
  snapTimer = undefined;
  cards.forEach((c) => {
    c.style.transition = animate
      ? `transform ${SNAP_MS}ms ease-out`
      : "none";
    c.style.transform = "translate(0px, 0px)";
  });
  const finish = () => {
    cards.forEach((c) => {
      c.classList.remove(styles.dragging);
      c.style.transform = "";
      c.style.transition = "";
      c.style.zIndex = c.getAttribute("data-index") || "";
      c.style.visibility = "";
      c.style.pointerEvents = "";
    });
  };
  if (!animate) {
    finish();
    return;
  }
  snapTimer = window.setTimeout(() => {
    snapTimer = undefined;
    finish();
  }, SNAP_MS + 20);
};

const Card: React.FC<CardProps> = ({
  data,
  index,
  game,
  setGame,
  deckIndex,
  hint,
}) => {
  const dragRef = useRef<DragSession | null>(null);

  if (!data || !data.rank) return null;

  const column = game.decks[deckIndex] ?? [];
  const canDrag = !data.isDown && isValidDescendingRun(column, index);

  const pointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!canDrag || event.button !== 0) return;
    event.preventDefault();
    const cards: HTMLElement[] = [];
    for (let i = index; i < column.length; i++) {
      const el = document.querySelector<HTMLElement>(
        `[data-deck-index="${deckIndex}"][data-index="${i}"]`,
      );
      if (!el) break;
      cards.push(el);
    }
    if (!cards.length) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* untrusted events / jsdom */
    }
    cards.forEach((c, i) => {
      c.classList.add(styles.dragging);
      c.style.transition = "none";
      c.style.zIndex = String(1000 + i);
    });
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cards,
      hover: null,
    };
  };

  const pointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const session = dragRef.current;
    if (!session || event.pointerId !== session.pointerId) return;
    const dx = event.clientX - session.startX;
    const dy = event.clientY - session.startY;
    session.cards.forEach((c) => {
      c.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    const col = findColumnAtPoint(event.clientX, event.clientY);
    setDropHover(session, col >= 0 && col !== deckIndex ? holderForColumn(col) : null);
  };

  const pointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    const session = dragRef.current;
    if (!session || event.pointerId !== session.pointerId) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    setDropHover(session, null);

    const targetDeckIndex = findColumnAtPoint(event.clientX, event.clientY);
    const sourceDeckIndex = deckIndex;
    const snapBack = () => clearDragStyles(session.cards, true);

    if (
      targetDeckIndex < 0 ||
      targetDeckIndex > 9 ||
      targetDeckIndex === sourceDeckIndex
    ) {
      snapBack();
      return;
    }

    const targetDeck = game.decks[targetDeckIndex];
    const targetTop =
      targetDeck.length === 0 ? null : targetDeck[targetDeck.length - 1];
    const topMovedCard: CardType = {
      rank: data.rank,
      isDown: false,
    };
    if (!isValidMove(topMovedCard, targetTop)) {
      snapBack();
      return;
    }

    const tempDecks = game.decks.map((col) => [...col]);
    const transferCards = tempDecks[sourceDeckIndex].splice(
      index,
      session.cards.length,
    );
    tempDecks[targetDeckIndex].push(...transferCards);
    flipNewlyExposedCards(tempDecks);
    let completedDelta = 0;
    for (let guard = 0; guard < 24; guard++) {
      const step = removeCompletedSetsFromTableau(tempDecks);
      if (step === 0) break;
      completedDelta += step;
      flipNewlyExposedCards(tempDecks);
    }
    clearDragStyles(session.cards, false);
    setGame((prevState) => ({
      ...prevState,
      decks: tempDecks,
      moveCount: prevState.moveCount + 1,
      completed: prevState.completed + completedDelta,
    }));
  };

  return (
    <div
      draggable={false}
      data-can-drag={canDrag ? "true" : "false"}
      data-rank={getRank(data.rank).toString()}
      data-original-rank={data.rank}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      data-deck-index={deckIndex.toString()}
      data-isdown={data.isDown.toString()}
      data-index={index.toString()}
      data-hint={hint}
      className={styles.card}
      style={{
        top: index * 30,
        zIndex: hint ? 80 + index : index,
        ["--deal-delay" as string]: `${deckIndex * 40}ms`,
      }}
    />
  );
};

export default Card;
