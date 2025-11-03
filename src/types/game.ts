export interface Card {
	rank: string;
	isDown: boolean;
	deck?: number;
}

export interface GameState {
	decks: Card[][];
	completed: number;
	moveCount: number;
}

export interface GameInit {
	decks: Card[][];
	cards: Card[];
}

export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'; 