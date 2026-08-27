import React from "react";
import styles from "../styles/CardBoardBottom.module.css";
import StockCards from "./StockCards";
import type { GameState, Card } from "../types/game";

interface CardBoardBottomProps {
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  stockDecks: Card[][];
  highlightDeal?: boolean;
}

const CardBoardBottom: React.FC<CardBoardBottomProps> = ({
  game,
  setGame,
  stockDecks,
  highlightDeal = false,
}) => {
  const firstStock = stockDecks.findIndex((d) => d.length > 0);
  return (
    <div className={styles.bottomCardBoard}>
      {stockDecks.map((stockDeck, index) => (
        <StockCards
          key={index}
          game={game}
          setGame={setGame}
          deck={stockDeck}
          index={index}
          highlightDeal={highlightDeal && index === firstStock}
        />
      ))}
    </div>
  );
};

export default CardBoardBottom;
