import React, { useState, useEffect } from "react";
import styles from "../styles/Header.module.css";

interface HeaderProps {
  completed: number;
  moveCount: number;
  onNewGame: () => void;
  onUndo?: () => void;
  onHint?: () => void;
  canUndo?: boolean;
  /** When this changes (e.g. new deal), the timer resets — keeps win → Play Again in sync. */
  sessionKey?: number;
  paused?: boolean;
  onPauseChange?: (paused: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  completed,
  moveCount,
  onNewGame,
  onUndo,
  onHint,
  canUndo = false,
  sessionKey = 0,
  paused,
  onPauseChange,
}) => {
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (paused === undefined) return;
    setIsRunning(!paused && completed < 8);
  }, [paused, completed]);

  useEffect(() => {
    if (completed === 8) setIsRunning(false);
  }, [completed]);

  useEffect(() => {
    setTimer(0);
    if (paused === true || completed >= 8) {
      setIsRunning(false);
      return;
    }
    setIsRunning(true);
  }, [sessionKey]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNewGame = (): void => {
    setTimer(0);
    setIsRunning(true);
    onPauseChange?.(false);
    onNewGame();
  };

  const togglePause = (): void => {
    if (completed === 8) return;
    const willPause = isRunning;
    setIsRunning(!willPause);
    onPauseChange?.(willPause);
  };

  const isGameCompleted = completed === 8;
  const userPaused = !isRunning && !isGameCompleted;

  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>
        <button type="button" className={styles.btn} onClick={handleNewGame}>
          🎮 New Game
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.undoBtn} ${
            !canUndo || userPaused ? styles.disabled : ""
          }`}
          onClick={() => onUndo?.()}
          disabled={!canUndo || userPaused}
        >
          ↩️ Undo
        </button>
        <button
          type="button"
          className={`${styles.btn} ${userPaused ? styles.disabled : ""}`}
          onClick={() => onHint?.()}
          title="Highlight a suggested move"
          disabled={userPaused}
        >
          💡 Hint
        </button>
      </div>
      <div className={styles.centerSection}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Completed:</span>
            <span
              className={`${styles.statValue} ${
                isGameCompleted ? styles.completed : ""
              }`}
            >
              {completed}/8 {isGameCompleted && "🎉"}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Moves:</span>
            <span className={styles.statValue}>{moveCount}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Time:</span>
            <span className={styles.statValue}>{formatTime(timer)}</span>
          </div>
        </div>
      </div>
      <div className={styles.rightSection}>
        <button
          type="button"
          className={`${styles.btn} ${styles.iconBtn} ${
            isGameCompleted ? styles.disabled : ""
          }`}
          onClick={togglePause}
          disabled={isGameCompleted}
          title={
            isGameCompleted
              ? "Game finished"
              : isRunning
                ? "Pause game"
                : "Resume game"
          }
        >
          {isRunning ? "⏸️" : "▶️"}
        </button>
      </div>
    </div>
  );
};

export default Header;
