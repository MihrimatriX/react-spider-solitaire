import _ from "lodash";
import type { Card, GameInit, CardRank } from "../types/game";

const cardInfo = {
	rank: [ "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as CardRank[],
	value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
};

export const initiateGame = (): GameInit => {
	let cards: Card[] = [], decks: Card[][];

	cardInfo["rank"].forEach((rank) => {
		for (let i = 1; i <= 8; i++) {
			cards.push({
				rank: rank,
				isDown: true
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
		cards: shuffledCards
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

export const isSameSuit = (card1: Card, card2: Card): boolean => {
	return true;
};

export const isValidMove = (selectedCard: Card, targetCard: Card | null): boolean => {
	if (!targetCard) return true;
	if (targetCard.isDown) return false;
	const selectedRank = getRank(selectedCard.rank);
	const targetRank = getRank(targetCard.rank);
	return selectedRank === targetRank - 1;
};

export const checkCompletedSet = (deck: Card[]): Card[] | null => {
	const faceUpCards = deck.filter(card => !card.isDown);
	if (faceUpCards.length < 13) return null;
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
				return potentialSet;
			}
		}
	}
	return null;
};