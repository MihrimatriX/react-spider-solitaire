import React, { useState, useEffect, useRef } from "react";
import { initiateGame, listGameHints, type GameHint } from "../utils/game";
import CardHolder from "./CardHolder";
import styles from "../styles/CardBoard.module.css";
import Header from "./Header";
import CardBoardBottom from "./CardBoardBottom";
import { GameState } from "../types/game";
import { showInfo, showWonPopup } from "../utils/toaster";

const cloneGameState = (g: GameState): GameState => ({
  completed: g.completed,
  moveCount: g.moveCount,
  decks: g.decks.map((col) => col.map((c) => ({ ...c }))),
});

const CardBoard: React.FC = () => {
  const [game, setGame] = useState<GameState>({
    decks: [],
    completed: 0,
    moveCount: 0,
  });
  const [, setGameHistory] = useState<GameState[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [gameKey, setGameKey] = useState<number>(0);
  const [hint, setHint] = useState<GameHint | null>(null);
  const [paused, setPaused] = useState(false);
  const hintSkipRef = useRef(0);
  const winPopupScheduledRef = useRef(false);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (game.completed < 8) {
      winPopupScheduledRef.current = false;
      return;
    }
    if (winPopupScheduledRef.current) return;
    winPopupScheduledRef.current = true;
    const t = window.setTimeout(() => {
      showWonPopup(() => {
        winPopupScheduledRef.current = false;
        startNewGame();
      });
    }, 500);
    return () => window.clearTimeout(t);
  }, [game.completed]);

  useEffect(() => {
    setHint(null);
    hintSkipRef.current = 0;
  }, [game.moveCount, game.completed, gameKey]);

  useEffect(() => {
    setPaused(false);
  }, [gameKey]);

  const startNewGame = (): void => {
    const init = initiateGame();
    const newGameState: GameState = {
      decks: init.decks,
      completed: 0,
      moveCount: 0,
    };
    setGame(newGameState);
    setGameHistory([]);
    setCanUndo(false);
    setGameKey((prev) => prev + 1);
  };

  const handleUndo = (): void => {
    setGameHistory((prev) => {
      if (prev.length === 0) return prev;
      const previousState = prev[prev.length - 1];
      setGame(previousState);
      setCanUndo(prev.length - 1 > 0);
      return prev.slice(0, -1);
    });
  };

  const handleHint = (): void => {
    const hints = listGameHints(game.decks);
    const h = hints[hintSkipRef.current % hints.length];
    hintSkipRef.current += 1;
    setHint(h);
    showInfo(h.text);
  };

  const updateGameWithHistory = (
    next: React.SetStateAction<GameState>,
  ): void => {
    setGame((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      setGameHistory((h) => [...h, cloneGameState(prev)]);
      setCanUndo(true);
      return resolved;
    });
  };

  return (
    <div key={gameKey}>
      <Header
        completed={game.completed}
        moveCount={game.moveCount}
        onNewGame={startNewGame}
        onUndo={handleUndo}
        onHint={handleHint}
        canUndo={canUndo}
        sessionKey={gameKey}
        paused={paused}
        onPauseChange={setPaused}
      />
      <div className={styles.table}>
        <div className={styles.board} data-testid="card-board">
          {game.decks.slice(0, 10).map((deck, index) => (
            <CardHolder
              deck={deck}
              game={game}
              deckIndex={index}
              setGame={updateGameWithHistory}
              hint={hint}
              key={`pile${index}`}
            />
          ))}
        </div>
        <CardBoardBottom
          game={game}
          setGame={updateGameWithHistory}
          stockDecks={game.decks.slice(10)}
          highlightDeal={hint?.kind === "deal"}
        />
        {paused && (
          <button
            type="button"
            className={styles.pauseOverlay}
            onClick={() => setPaused(false)}
            aria-label="Resume game"
          >
            Paused
            <span>Click to resume</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CardBoard;
