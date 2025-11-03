import React from "react";
import { getRank, checkCompletedSet } from "../utils/game";
import type { GameState, Card as CardType } from "../types/game";
import styles from "../styles/Card.module.css";

interface CardProps {
	data: CardType;
	index: number;
	game: GameState;
	setGame: React.Dispatch<React.SetStateAction<GameState>>;
	deckIndex: number;
}

const Card: React.FC<CardProps> = ({
	data,
	index,
	game,
	setGame,
	deckIndex,
}) => {
	if (!data || !data.rank) return null;

	let mouseX: number;
	let mouseY: number;
	let selectedCards: HTMLElement[] = [];

	const dragStart = (event: React.DragEvent<HTMLDivElement>): void => {
		if (data.isDown) return;

		const currentCard = event.currentTarget;
		const deck = game.decks[deckIndex];
		const currentCardIndex = parseInt(currentCard.getAttribute("data-index") || "0");

		let topOpenCardIndex = -1;
		for (let i = 20; i >= 0; i--) {
			const cardElement = document.querySelector(`[data-deck-index="${deckIndex}"][data-index="${i}"]`) as HTMLElement;
			if (cardElement && cardElement.getAttribute("data-isdown") === "false") {
				topOpenCardIndex = i;
				break;
			}
		}

		if (data.isDown) return;

		selectedCards.length = 0;
		selectedCards.push(currentCard);

		let currentRank = getRank(currentCard.getAttribute("data-original-rank") || "0");

		for (let i = currentCardIndex + 1; i < 20; i++) {
			const cardElement = document.querySelector(`[data-deck-index="${deckIndex}"][data-index="${i}"]`) as HTMLElement;
			if (!cardElement) break;
			if (cardElement.getAttribute("data-isdown") === "true") break;
			const siblingRank = getRank(cardElement.getAttribute("data-original-rank") || "0");
			if (currentRank !== siblingRank + 1) break;
			selectedCards.push(cardElement);
			currentRank = siblingRank;
		}

		mouseX = event.pageX;
		mouseY = event.pageY;
	};

	const dragOver = (event: React.DragEvent<HTMLDivElement>): void => {
		event.preventDefault();
		event.stopPropagation();
	};

	const drag = (event: React.DragEvent<HTMLDivElement>): void => {
		const diffX = event.pageX - mouseX;
		const diffY = event.pageY - mouseY;
		selectedCards.forEach((card, index) => {
			card.classList.add(styles.dragging);
			const originalTop = index * 30;
			card.style.transform = `translate(${diffX}px,${diffY + originalTop}px)`;
		});
	};

	const dragEnd = (event: React.DragEvent<HTMLDivElement>): void => {
		if (!selectedCards.length) return;
		selectedCards.forEach((card) => {
			card.style.visibility = "hidden";
		});
		const xEndPoint = event.pageX;
		const yEndPoint = event.pageY;
		const dropTarget = document.elementFromPoint(xEndPoint, yEndPoint) as HTMLElement;
		selectedCards.forEach((card, index) => {
			card.style.visibility = "visible";
			card.classList.remove(styles.dragging);
			const originalTop = index * 30;
			card.style.transform = `translate(0px,${originalTop}px)`;
		});
		if (!dropTarget) {
			selectedCards = [];
			return;
		}
		const isDraggingSelf = selectedCards.some(card => card === dropTarget);
		if (isDraggingSelf) {
			selectedCards = [];
			return;
		}
		let targetDeckIndex = -1;
		const targetElement = dropTarget.closest(".card, .cardHolder") as HTMLElement;
		if (!targetElement) {
			selectedCards = [];
			return;
		}
		if (targetElement.classList.contains("card")) {
			targetDeckIndex = parseInt(targetElement.getAttribute("data-deck-index") || "-1");
		} 
		else if (targetElement.classList.contains("cardHolder")) {
			targetDeckIndex = parseInt(targetElement.id);
		}
		else {
			const cardHolder = targetElement.closest(".cardHolder");
			if (cardHolder) {
				targetDeckIndex = parseInt(cardHolder.id);
			}
		}
		if (targetDeckIndex === -1) {
			selectedCards = [];
			return;
		}
		const sourceDeckIndex = parseInt(selectedCards[0].getAttribute("data-deck-index") || "-1");
		if (sourceDeckIndex === targetDeckIndex) {
			selectedCards = [];
			return;
		}
		let isValidMove = false;
		if (game.decks[targetDeckIndex].length === 0) {
			isValidMove = true;
		} else {
			const targetDeck = game.decks[targetDeckIndex];
			const topCard = targetDeck[targetDeck.length - 1];
			if (!topCard.isDown) {
				const targetCardRank = getRank(topCard.rank);
				const topSelectedCardRank = getRank(selectedCards[0].getAttribute("data-original-rank") || "0");
				isValidMove = topSelectedCardRank === targetCardRank - 1;
			}
		}
		if (isValidMove) {
			const tempDecks = [...game.decks];
			const selectedCardsStartingIndex = parseInt(
				selectedCards[0].getAttribute("data-index") || "0"
			);
			const selectedCardsCount = selectedCards.length;
			const transferCards = tempDecks[sourceDeckIndex].splice(selectedCardsStartingIndex, selectedCardsCount);
			tempDecks[targetDeckIndex].push(...transferCards);
			setGame((prevState) => ({
				...prevState,
				decks: tempDecks,
				moveCount: prevState.moveCount + 1,
			}));
			checkAndRemoveCompletedSets(tempDecks, setGame);
			checkFaceUp(tempDecks);
		}
		selectedCards = [];
	};

	const checkFaceUp = (decks: CardType[][]): void => {
		for (let i = 0; i < decks.length; i++) {
			if (decks[i].length > 0 && decks[i][decks[i].length - 1].isDown) {
				decks[i][decks[i].length - 1].isDown = false;
			}
		}
	};

	const checkAndRemoveCompletedSets = (
		decks: CardType[][],
		setGame: React.Dispatch<React.SetStateAction<GameState>>
	): void => {
		let completedSets = 0;
		for (let i = 0; i < decks.length; i++) {
			const deck = decks[i];
			const completedSet = checkCompletedSet(deck);
			if (completedSet) {
				const setStartIndex = deck.length - 13;
				if (setStartIndex >= 0) {
					deck.splice(setStartIndex, 13);
					completedSets++;
				}
			}
		}
		if (completedSets > 0) {
			setGame((prevState) => ({
				...prevState,
				completed: prevState.completed + completedSets,
			}));
		}
	};

	const isNotSelectable = (currentCard: HTMLElement): boolean => {
		if (currentCard.getAttribute("data-isdown") === "true") {
			return true;
		}
		const selectedCardsRanks: number[] = [];
		const selectedCardsOriginal: string[] = [];
		let checkCard = currentCard;
		const currentOriginalRank = currentCard.getAttribute("data-original-rank") || "0";
		const currentNumericRank = getRank(currentOriginalRank);
		selectedCardsRanks.push(currentNumericRank);
		selectedCardsOriginal.push(currentOriginalRank);
		let siblingCard = currentCard.nextElementSibling as HTMLElement;
		while (siblingCard && siblingCard.classList.contains("card")) {
			if (siblingCard.getAttribute("data-isdown") === "true") {
				break;
			}
			const originalRank = siblingCard.getAttribute("data-original-rank") || "0";
			const numericRank = getRank(originalRank);
			selectedCardsRanks.push(numericRank);
			selectedCardsOriginal.push(originalRank);
			siblingCard = siblingCard.nextElementSibling as HTMLElement;
		}
		if (selectedCardsRanks.length === 1) {
			return false;
		}
		for (let i = 0; i < selectedCardsRanks.length - 1; i++) {
			const currentRank = selectedCardsRanks[i];
			const nextRank = selectedCardsRanks[i + 1];
			if (currentRank !== nextRank + 1) {
				return true;
			}
		}
		return false;
	};

	return (
		<div
			draggable={true}
			data-rank={getRank(data.rank).toString()}
			data-original-rank={data.rank}
			onDragStart={dragStart}
			onDragOver={dragOver}
			onDrag={drag}
			onDragEnd={dragEnd}
			data-deck-index={deckIndex.toString()}
			data-isdown={data.isDown.toString()}
			data-index={index.toString()}
			className={styles.card}
		/>
	);
};

export default Card;
