import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '../../src/ui/Card'
import type { GameState, Card as CardType } from '../../src/types/game'

// Mock the CSS module
vi.mock('../../src/styles/Card.module.css', () => ({
  default: {
    card: 'card-class',
    dragging: 'dragging-class'
  }
}))

const mockSetGame = vi.fn()

const createMockGameState = (): GameState => ({
  decks: [
    [
      { rank: 'K', isDown: false },
      { rank: 'Q', isDown: false },
      { rank: 'J', isDown: false }
    ],
    [
      { rank: 'A', isDown: false }
    ],
    []
  ],
  cards: [],
  completed: 0,
  moveCount: 0,
  startTime: Date.now(),
  isPaused: false
})

const renderCard = (props: {
  data: CardType
  index: number
  game: GameState
  deckIndex: number
}) => {
  return render(
    <Card
      {...props}
      setGame={mockSetGame}
    />
  )
}

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render card with valid data', () => {
      const cardData: CardType = { rank: 'K', isDown: false }
      const game = createMockGameState()
      
      const { container } = renderCard({
        data: cardData,
        index: 0,
        game,
        deckIndex: 0
      })

      // Should render a div element
      expect(container.firstChild).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('card-class')
    })

    it('should render face-down card', () => {
      const cardData: CardType = { rank: 'Q', isDown: true }
      const game = createMockGameState()
      
      const { container } = renderCard({
        data: cardData,
        index: 1,
        game,
        deckIndex: 0
      })

      // Should render a div element
      expect(container.firstChild).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('card-class')
    })

    it('should return null for invalid card data', () => {
      const invalidCardData = {} as CardType
      const game = createMockGameState()
      
      const { container } = renderCard({
        data: invalidCardData,
        index: 0,
        game,
        deckIndex: 0
      })

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Card Properties', () => {
    it('should handle different card ranks', () => {
      const cardData: CardType = { rank: 'A', isDown: false }
      const game = createMockGameState()
      
      const { container } = renderCard({
        data: cardData,
        index: 0,
        game,
        deckIndex: 1
      })

      // Should render successfully
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should handle number cards', () => {
      const cardData: CardType = { rank: '10', isDown: false }
      const game = createMockGameState()
      
      const { container } = renderCard({
        data: cardData,
        index: 0,
        game,
        deckIndex: 2
      })

      // Should render successfully
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty rank', () => {
      const cardData: CardType = { rank: '', isDown: false }
      const game = createMockGameState()
      
      const { container } = renderCard({
        data: cardData,
        index: 0,
        game,
        deckIndex: 0
      })

      // Should handle empty rank gracefully
      expect(container.firstChild).toBeNull()
    })

    it('should handle undefined data', () => {
      const undefinedData = undefined as unknown as CardType
      const game = createMockGameState()
      
      const { container } = renderCard({
        data: undefinedData,
        index: 0,
        game,
        deckIndex: 0
      })

      // Should handle undefined data gracefully
      expect(container.firstChild).toBeNull()
    })
  })
}) 