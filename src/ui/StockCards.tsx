import React, { useState, useEffect } from "react";
import styles from "../styles/StockCards.module.css";
import type { GameState, Card } from "../types/game";
import { dealStockRow, tableauHasEmptyColumn } from "../utils/game";
import { showError } from "../utils/toaster";

interface StockCardsProps {
  index: number;
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  deck: Card[];
  highlightDeal?: boolean;
}

const StockCards: React.FC<StockCardsProps> = ({
  index,
  game,
  setGame,
  deck,
  highlightDeal = false,
}) => {
  const [isShown, setIsShown] = useState<boolean>(true);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setIsShown(true);
  }, [game.decks]);

  const blocked = tableauHasEmptyColumn(game.decks);

  const handleCardSplit = (): void => {
    if (!deck || deck.length === 0) return;
    if (blocked) {
      setShake(true);
      showError("Fill empty columns before dealing.");
      return;
    }

    const result = dealStockRow(game.decks, index);
    if (!result) return;

    setGame((prevState) => ({
      ...prevState,
      decks: result.decks,
      moveCount: prevState.moveCount + 1,
      completed: prevState.completed + result.completedDelta,
    }));

    setIsShown(false);
  };

  if (!deck || deck.length === 0) return null;

  const remainingStockPiles = game.decks
    .slice(10)
    .filter((p) => p.length > 0).length;

  const label = blocked
    ? "Fill empty columns before dealing from the stock"
    : `Deal one face-up card to each column (${deck.length} in this pile, ${remainingStockPiles} stock pile(s) left)`;

  return (
    <>
      {isShown && (
        <div
          className={`${styles.stockDeck}${blocked ? ` ${styles.blocked}` : ""}${shake ? ` ${styles.shake}` : ""}`}
          data-index={index.toString()}
          data-hint={highlightDeal ? "deal" : undefined}
          data-stock-remaining={remainingStockPiles}
          data-blocked={blocked ? "true" : "false"}
          role="button"
          tabIndex={0}
          title={label}
          aria-label={label}
          aria-disabled={blocked}
          onClick={handleCardSplit}
          onAnimationEnd={() => setShake(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCardSplit();
            }
          }}
        />
      )}
    </>
  );
};

export default StockCards;
