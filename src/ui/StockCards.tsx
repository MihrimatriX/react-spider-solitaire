import React, { useState, useEffect } from "react";
import styles from "../styles/StockCards.module.css";
import type { GameState, Card } from "../types/game";

interface StockCardsProps {
  index: number;
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  deck: Card[];
}

const StockCards: React.FC<StockCardsProps> = ({
  index,
  game,
  setGame,
  deck,
}) => {
  const [isShown, setIsShown] = useState<boolean>(true);

  useEffect(() => {
    setIsShown(true);
  }, [game.decks]);

  const handleCardSplit = (): void => {
    if (!deck || deck.length === 0) return;

    const tempDecks = [...game.decks];
    
    // Stock destesindeki kartları aç
    const cardsToDeal = deck.map(card => ({ ...card, isDown: false }));
    
    // İlk 10 desteye birer kart dağıt
    for (let i = 0; i < 10 && i < cardsToDeal.length; i++) {
      tempDecks[i].push(cardsToDeal[i]);
    }
    
    // Stock destesini temizle
    tempDecks[10 + index] = [];

    setGame((prevState) => ({
      ...prevState,
      decks: tempDecks,
      moveCount: prevState.moveCount + 1,
    }));

    setIsShown(false);
  };

  if (!deck || deck.length === 0) return null;

  return (
    <>
      {isShown && (
        <div
          className={styles.stockDeck}
          data-index={index.toString()}
          onClick={handleCardSplit}
          style={{ cursor: 'pointer' }}
        />
      )}
    </>
  );
};

export default StockCards;
