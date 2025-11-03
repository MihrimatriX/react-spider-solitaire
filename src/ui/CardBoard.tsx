import React, { useState, useEffect } from "react";
import { initiateGame } from "../utils/game";
import CardHolder from "./CardHolder";
import styles from "../styles/CardBoard.module.css";
import Header from "./Header";
import CardBoardBottom from "./CardBoardBottom";
import { GameState } from "../types/game";
import { showError, showWonPopup } from "../utils/toaster";

const CardBoard: React.FC = () => {
	const [game, setGame] = useState<GameState>({
		decks: [],
		completed: 0,
		moveCount: 0,
	});
	const [gameHistory, setGameHistory] = useState<GameState[]>([]);
	const [canUndo, setCanUndo] = useState<boolean>(false);
	const [gameKey, setGameKey] = useState<number>(0);

	useEffect(() => {
		startNewGame();
	}, []);

	useEffect(() => {
		checkGameCompletion();
	}, [game.completed]);

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

	const checkGameCompletion = (): void => {
		if (game.completed === 8) {
			setTimeout(() => {
				showWonPopup(startNewGame);
			}, 500);
		}
	};

	const handleUndo = (): void => {
		if (gameHistory.length > 0) {
			const previousState = gameHistory[gameHistory.length - 1];
			setGame(previousState);
			setGameHistory((prev) => prev.slice(0, -1));
			setCanUndo(gameHistory.length > 1);
		}
	};

	const handleHint = (): void => {
		const completedSets = game.decks.filter(
			(deck) =>
				deck.length >= 13 &&
				deck.every((card, index) => {
					if (index === 0) return card.rank === "K";
					if (index === 1) return card.rank === "Q";
					if (index === 2) return card.rank === "J";
					if (index === 3) return card.rank === "10";
					if (index === 4) return card.rank === "9";
					if (index === 5) return card.rank === "8";
					if (index === 6) return card.rank === "7";
					if (index === 7) return card.rank === "6";
					if (index === 8) return card.rank === "5";
					if (index === 9) return card.rank === "4";
					if (index === 10) return card.rank === "3";
					if (index === 11) return card.rank === "2";
					if (index === 12) return card.rank === "A";
					return false;
				})
		);

		if (completedSets.length > 0) {
			showError("Completed set found! You can complete this set.");
		} else {
			showError("No completable sets found. Continue arranging cards.");
		}
	};

	const updateGameWithHistory = (
		newGameState: React.SetStateAction<GameState>
	): void => {
		setGameHistory((prev) => [...prev, game]);
		setGame(newGameState);
		setCanUndo(true);
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
			/>
			<div className={styles.board}>
				{game.decks.slice(0, 10).map((deck, index) => (
					<CardHolder
						deck={deck}
						game={game}
						deckIndex={index}
						setGame={updateGameWithHistory}
						key={`pile${index}`}
					/>
				))}
			</div>
			<CardBoardBottom
				game={game}
				setGame={updateGameWithHistory}
				stockDecks={game.decks.slice(10)}
			/>
		</div>
	);
};

export default CardBoard;
