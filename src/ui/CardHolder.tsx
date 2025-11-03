import React from "react";
import Card from "./Card";
import styles from "../styles/CardHolder.module.css";
import type { GameState, Card as CardType } from "../types/game";

interface CardHolderProps {
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  deck: CardType[];
  deckIndex: number;
}

const CardHolder: React.FC<CardHolderProps> = ({
  game,
  setGame,
  deck,
  deckIndex,
}) => {
  const validCards = deck.filter((card) => card && card.rank);

  return (
    <div
      className={`${styles.cardHolder} cardHolder`}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      id={deckIndex.toString()}
      data-deck-index={deckIndex.toString()}
      data-testid="card-holder"
    >
      {validCards.map((card, index) => (
        <Card
          data={card}
          key={`${card.rank}-${deckIndex}-${index}`}
          index={index}
          deckIndex={deckIndex}
          game={game}
          setGame={setGame}
        />
      ))}
    </div>
  );
};

export default CardHolder;
