import React from "react";
import Card from "./Card";
import styles from "../styles/CardHolder.module.css";
import type { GameState, Card as CardType } from "../types/game";
import type { GameHint } from "../utils/game";

interface CardHolderProps {
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  deck: CardType[];
  deckIndex: number;
  hint?: GameHint | null;
}

const CardHolder: React.FC<CardHolderProps> = ({
  game,
  setGame,
  deck,
  deckIndex,
  hint = null,
}) => {
  const validCards = deck.filter((card) => card && card.rank);

  const isEmpty = validCards.length === 0;

  const isHintSource = hint?.from === deckIndex;
  const isHintTarget = hint?.to === deckIndex;
  const hintHolder =
    isHintTarget && isEmpty ? "target" : isHintSource && isEmpty ? "source" : undefined;

  return (
    <div
      className={`${styles.cardHolder} cardHolder${isEmpty ? ` ${styles.emptyColumn}` : ""}`}
      id={deckIndex.toString()}
      data-deck-index={deckIndex.toString()}
      data-empty-column={isEmpty ? "true" : "false"}
      data-hint={hintHolder}
      data-testid="card-holder"
    >
      {validCards.map((card, index) => {
        let cardHint: "source" | "target" | undefined;
        if (isHintSource && (hint?.kind === "complete" || index >= (hint?.start ?? 0))) {
          cardHint = "source";
        } else if (isHintTarget && index === validCards.length - 1) {
          cardHint = "target";
        }
        return (
          <Card
            data={card}
            key={`${card.rank}-${deckIndex}-${index}`}
            index={index}
            deckIndex={deckIndex}
            game={game}
            setGame={setGame}
            hint={cardHint}
          />
        );
      })}
    </div>
  );
};

export default CardHolder;
