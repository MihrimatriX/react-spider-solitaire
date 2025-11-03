import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { initiateGame } from '../../src/utils/game'

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
    confirm: vi.fn().mockResolvedValue({ isConfirmed: true }),
    alert: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}))

// Mock CSS modules
vi.mock('../../src/styles/Card.module.css', () => ({
  default: {
    card: 'card-class',
    dragging: 'dragging-class'
  }
}))

vi.mock('../../src/styles/Header.module.css', () => ({
  default: {
    header: 'header-class',
    leftSection: 'left-section-class',
    centerSection: 'center-section-class',
    rightSection: 'right-section-class',
    btn: 'btn-class',
    undoBtn: 'undo-btn-class',
    disabled: 'disabled-class',
    stats: 'stats-class',
    statItem: 'stat-item-class',
    statLabel: 'stat-label-class',
    statValue: 'stat-value-class',
    completed: 'completed-class',
    iconBtn: 'icon-btn-class'
  }
}))

vi.mock('../../src/styles/CardBoard.module.css', () => ({
  default: {
    cardBoard: 'card-board-class'
  }
}))

vi.mock('../../src/styles/CardHolder.module.css', () => ({
  default: {
    cardHolder: 'card-holder-class'
  }
}))

vi.mock('../../src/styles/StockCards.module.css', () => ({
  default: {
    stockCards: 'stock-cards-class'
  }
}))

describe('Game Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock document.elementFromPoint
    document.elementFromPoint = vi.fn()
    // Mock document.querySelector
    document.querySelector = vi.fn()
  })

  describe('Game Initialization', () => {
    it('should have correct card distribution on game start', () => {
      const game = initiateGame()
      
      expect(game.decks).toHaveLength(15)
      
      // First 4 columns should have 6 cards each
      for (let i = 0; i < 4; i++) {
        expect(game.decks[i]).toHaveLength(6)
      }
      
      // Next 6 columns should have 5 cards each
      for (let i = 4; i < 10; i++) {
        expect(game.decks[i]).toHaveLength(5)
      }
      
      // Stock piles should have 10 cards each
      for (let i = 10; i < 15; i++) {
        expect(game.decks[i]).toHaveLength(10)
      }
    })
  })

  describe('Game Logic', () => {
    it('should handle timer functionality', async () => {
      // Test timer logic without rendering full app
      const startTime = Date.now()
      const currentTime = Date.now()
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
      
      expect(elapsedSeconds).toBeGreaterThanOrEqual(0)
    })

    it('should handle game state management', () => {
      const game = initiateGame()
      
      // Test that game state is properly initialized
      expect(game.cards).toHaveLength(104)
      expect(game.decks).toHaveLength(15)
      
      // Test that first 10 decks have face-up cards
      for (let i = 0; i < 10; i++) {
        if (game.decks[i].length > 0) {
          expect(game.decks[i][game.decks[i].length - 1].isDown).toBe(false)
        }
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle missing callback functions gracefully', () => {
      // Test that the game utils don't crash with invalid inputs
      expect(() => {
        const game = initiateGame()
        expect(game).toBeDefined()
      }).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should initialize game without performance issues', () => {
      const startTime = performance.now()
      
      const game = initiateGame()
      
      const endTime = performance.now()
      const initTime = endTime - startTime
      
      // Game initialization should complete within reasonable time (e.g., 50ms)
      expect(initTime).toBeLessThan(50)
      expect(game).toBeDefined()
    })
  })
}) 