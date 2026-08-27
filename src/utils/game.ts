import _ from "lodash";
import type { Card, GameInit, CardRank } from "../types/game";

const cardInfo = {
  rank: [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ] as CardRank[],
  value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
};

export const initiateGame = (): GameInit => {
  let cards: Card[] = [],
    decks: Card[][];

  cardInfo["rank"].forEach((rank) => {
    for (let i = 1; i <= 8; i++) {
      cards.push({
        rank: rank,
        isDown: true,
      });
    }
  });

  let shuffledCards = _.shuffle(cards);
  const firstPile = _.chunk(shuffledCards.slice(0, 24), 6);
  const secondPile = _.chunk(shuffledCards.slice(24, 54), 5);
  const stockCardsPile = _.chunk(shuffledCards.slice(54), 10);
  decks = [...firstPile, ...secondPile, ...stockCardsPile];

  for (let i = 0; i <= 9; i++) {
    if (decks[i].length > 0) {
      decks[i][decks[i].length - 1].isDown = false;
    }
  }

  return {
    decks: decks,
    cards: shuffledCards,
  };
};

export const getRank = (rank: string): number => {
  if (rank === "K" || rank === "Q" || rank === "J" || rank === "A") {
    switch (rank) {
      case "K":
        return 13;
      case "Q":
        return 12;
      case "J":
        return 11;
      case "A":
        return 1;
      default:
        return 0;
    }
  } else {
    return parseInt(rank);
  }
};

export const isSameSuit = (_card1: Card, _card2: Card): boolean => {
  return true;
};

export const isValidMove = (
  selectedCard: Card,
  targetCard: Card | null,
): boolean => {
  if (selectedCard.isDown) return false;
  if (!targetCard) return true;
  if (targetCard.isDown) return false;
  const selectedRank = getRank(selectedCard.rank);
  const targetRank = getRank(targetCard.rank);
  return selectedRank === targetRank - 1;
};

/** Completed K→A run in tableau; startIndex is the index within the full column array. */
export type CompletedSetResult = { startIndex: number; cards: Card[] };

export const checkCompletedSet = (deck: Card[]): CompletedSetResult | null => {
  const faceUpCards = deck.filter((card) => !card.isDown);
  if (faceUpCards.length < 13) return null;

  const deckIndexOfNthFaceUp = (n: number): number => {
    let seen = 0;
    for (let d = 0; d < deck.length; d++) {
      if (!deck[d].isDown) {
        if (seen === n) return d;
        seen++;
      }
    }
    return -1;
  };

  for (let i = faceUpCards.length - 13; i >= 0; i--) {
    const potentialSet = faceUpCards.slice(i, i + 13);
    if (getRank(potentialSet[0].rank) === 13) {
      let isValidSet = true;
      for (let j = 0; j < 12; j++) {
        const currentRank = getRank(potentialSet[j].rank);
        const nextRank = getRank(potentialSet[j + 1].rank);
        if (currentRank !== nextRank + 1) {
          isValidSet = false;
          break;
        }
      }
      if (isValidSet) {
        const startIndex = deckIndexOfNthFaceUp(i);
        if (startIndex >= 0) {
          return { startIndex, cards: potentialSet };
        }
      }
    }
  }
  return null;
};

/** True if from `start` through the bottom of the column is face-up and strictly descending (single-suit Spider). */
export const isValidDescendingRun = (deck: Card[], start: number): boolean => {
  if (start < 0 || start >= deck.length) return false;
  if (deck[start].isDown) return false;
  for (let i = start; i < deck.length - 1; i++) {
    if (deck[i + 1].isDown) return false;
    if (getRank(deck[i].rank) !== getRank(deck[i + 1].rank) + 1) return false;
  }
  return true;
};

export const flipNewlyExposedCards = (decks: Card[][]): void => {
  for (let i = 0; i < 10; i++) {
    const col = decks[i];
    if (col.length > 0 && col[col.length - 1].isDown) {
      col[col.length - 1] = { ...col[col.length - 1], isDown: false };
    }
  }
};

export const removeCompletedSetsFromTableau = (decks: Card[][]): number => {
  let completedSets = 0;
  for (let i = 0; i < 10; i++) {
    const deck = decks[i];
    let result = checkCompletedSet(deck);
    while (result) {
      deck.splice(result.startIndex, 13);
      completedSets++;
      result = checkCompletedSet(deck);
    }
  }
  return completedSets;
};

/** Spider: cannot deal a stock row while any tableau column is empty. */
export const tableauHasEmptyColumn = (decks: Card[][]): boolean =>
  decks.slice(0, 10).some((col) => (col?.length ?? 0) === 0);

export const dealStockRow = (
  decks: Card[][],
  stockPileIndex: number,
): { decks: Card[][]; completedDelta: number } | null => {
  if (tableauHasEmptyColumn(decks)) return null;
  const stockIdx = 10 + stockPileIndex;
  const pile = decks[stockIdx];
  if (!pile?.length) return null;

  const next = decks.map((col) => [...col]);
  const dealt = pile.map((c) => ({ ...c, isDown: false }));
  for (let i = 0; i < 10 && i < dealt.length; i++) {
    next[i].push(dealt[i]);
  }
  next[stockIdx] = [];

  let completedDelta = 0;
  for (let guard = 0; guard < 24; guard++) {
    const step = removeCompletedSetsFromTableau(next);
    if (step === 0) break;
    completedDelta += step;
    flipNewlyExposedCards(next);
  }
  return { decks: next, completedDelta };
};

export type GameHintKind = "complete" | "move" | "deal" | "empty" | "stuck";

export type GameHint = {
  kind: GameHintKind;
  text: string;
  from?: number;
  to?: number;
  start?: number;
};

const runLengthFromBottom = (col: Card[]): number => {
  if (!col.length || col[col.length - 1].isDown) return 0;
  let n = 1;
  for (let i = col.length - 2; i >= 0; i--) {
    if (col[i].isDown) break;
    if (getRank(col[i].rank) !== getRank(col[i + 1].rank) + 1) break;
    n++;
  }
  return n;
};

const scoreMove = (src: Card[], start: number, dst: Card[]): number => {
  const mover = src[start];
  const moving = src.length - start;
  let score = 0;
  if (start > 0 && src[start - 1].isDown) score += 100;
  if (start === 0) score += 35;
  const breaksRun =
    start > 0 &&
    !src[start - 1].isDown &&
    getRank(src[start - 1].rank) === getRank(mover.rank) + 1;
  if (breaksRun) score -= 80;
  if (dst.length === 0) {
    score += getRank(mover.rank) === 13 ? 25 : 8;
  } else {
    score += 10 + Math.min(runLengthFromBottom(dst), 6);
  }
  return score + Math.min(moving, 8);
};

const describeMove = (
  src: Card[],
  start: number,
  from: number,
  dst: Card[],
  to: number,
): string => {
  const extra = src.length - start - 1;
  const onto = dst.length === 0 ? "an empty space" : dst[dst.length - 1].rank;
  const extras = extra > 0 ? ` and ${extra} more` : "";
  let why = "";
  if (start > 0 && src[start - 1].isDown) why = " Turns a hidden card up.";
  else if (start === 0) why = " Clears the column.";
  return `Move ${src[start].rank}${extras} onto ${onto} (column ${from + 1} → column ${to + 1}).${why}`;
};

const STUCK: GameHint = {
  kind: "stuck",
  text: "No obvious move — try Undo or a different stack, or start a New Game.",
};

/** Ranked suggestions; first click = best, later clicks cycle alternatives. */
export const listGameHints = (decks: Card[][]): GameHint[] => {
  for (let c = 0; c < 10; c++) {
    if (checkCompletedSet(decks[c] ?? [])) {
      return [
        {
          kind: "complete",
          text: `Column ${c + 1} has a full King-to-Ace run — it clears after your next move.`,
          from: c,
        },
      ];
    }
  }

  const moves: (GameHint & { score: number })[] = [];
  for (let from = 0; from < 10; from++) {
    const src = decks[from] ?? [];
    for (let start = 0; start < src.length; start++) {
      if (src[start].isDown) continue;
      if (!isValidDescendingRun(src, start)) continue;
      for (let to = 0; to < 10; to++) {
        if (from === to) continue;
        const dst = decks[to] ?? [];
        const targetTop = dst.length === 0 ? null : dst[dst.length - 1];
        if (targetTop?.isDown) continue;
        if (!isValidMove(src[start], targetTop)) continue;
        // Relocating a whole column onto another empty column changes nothing.
        if (start === 0 && dst.length === 0) continue;
        moves.push({
          kind: "move",
          from,
          to,
          start,
          score: scoreMove(src, start, dst),
          text: describeMove(src, start, from, dst, to),
        });
      }
    }
  }

  if (moves.length) {
    moves.sort((a, b) => b.score - a.score);
    return moves.map((m) => ({
      kind: m.kind,
      text: m.text,
      from: m.from,
      to: m.to,
      start: m.start,
    }));
  }

  if (tableauHasEmptyColumn(decks)) {
    const emptyAt = decks.findIndex(
      (col, i) => i < 10 && (col?.length ?? 0) === 0,
    );
    return [
      {
        kind: "empty",
        text: "Fill empty columns before you can deal from the stock.",
        to: emptyAt >= 0 ? emptyAt : undefined,
      },
    ];
  }

  if (decks.slice(10, 15).some((d) => (d?.length ?? 0) > 0)) {
    return [
      {
        kind: "deal",
        text: "No tableau move — deal a row from the stock.",
      },
    ];
  }

  return [STUCK];
};

export const findGameHint = (decks: Card[][], skip = 0): GameHint => {
  const hints = listGameHints(decks);
  return hints[skip % hints.length] ?? STUCK;
};
