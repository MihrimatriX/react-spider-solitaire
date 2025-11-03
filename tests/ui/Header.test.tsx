import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Header from '../../src/ui/Header'

// Mock the CSS module
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

const mockOnNewGame = vi.fn()
const mockOnUndo = vi.fn()
const mockOnHint = vi.fn()

const renderHeader = (props = {}) => {
  const defaultProps = {
    completed: 0,
    moveCount: 0,
    onNewGame: mockOnNewGame,
    onUndo: mockOnUndo,
    onHint: mockOnHint,
    canUndo: false,
    ...props
  }
  
  return render(<Header {...defaultProps} />)
}

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render all buttons correctly', () => {
      renderHeader()
      
      expect(screen.getByText('🎮 New Game')).toBeInTheDocument()
      expect(screen.getByText('↩️ Undo')).toBeInTheDocument()
      expect(screen.getByText('💡 Hint')).toBeInTheDocument()
      expect(screen.getByText('⏸️')).toBeInTheDocument()
    })

    it('should display correct game statistics', () => {
      renderHeader({ completed: 3, moveCount: 15 })
      
      expect(screen.getByText('Completed:')).toBeInTheDocument()
      expect(screen.getByText('3/8')).toBeInTheDocument()
      expect(screen.getByText('Moves:')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('Time:')).toBeInTheDocument()
    })

    it('should show completed state when game is finished', () => {
      renderHeader({ completed: 8 })
      
      expect(screen.getByText('8/8 🎉')).toBeInTheDocument()
    })

    it('should disable undo button when canUndo is false', () => {
      renderHeader({ canUndo: false })
      
      const undoButton = screen.getByText('↩️ Undo')
      expect(undoButton).toBeDisabled()
    })

    it('should enable undo button when canUndo is true', () => {
      renderHeader({ canUndo: true })
      
      const undoButton = screen.getByText('↩️ Undo')
      expect(undoButton).not.toBeDisabled()
    })
  })

  describe('Timer Functionality', () => {
    it('should start timer when component mounts', () => {
      renderHeader()
      
      expect(screen.getByText('0:00')).toBeInTheDocument()
      
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      
      expect(screen.getByText('0:01')).toBeInTheDocument()
    })

    it('should format time correctly for different durations', () => {
      renderHeader()
      
      // Test 1 minute
      act(() => {
        vi.advanceTimersByTime(60000)
      })
      expect(screen.getByText('1:00')).toBeInTheDocument()
      
      // Test 1 hour
      act(() => {
        vi.advanceTimersByTime(3600000)
      })
      expect(screen.getByText('1:01:00')).toBeInTheDocument()
    })

    it('should pause timer when pause button is clicked', () => {
      renderHeader()
      
      const pauseButton = screen.getByText('⏸️')
      fireEvent.click(pauseButton)
      
      // Timer should show play button
      expect(screen.getByText('▶️')).toBeInTheDocument()
      
      // Timer should not advance
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })

    it('should resume timer when play button is clicked', () => {
      renderHeader()
      
      const pauseButton = screen.getByText('⏸️')
      fireEvent.click(pauseButton)
      
      const playButton = screen.getByText('▶️')
      fireEvent.click(playButton)
      
      // Timer should show pause button
      expect(screen.getByText('⏸️')).toBeInTheDocument()
      
      // Timer should advance
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(screen.getByText('0:01')).toBeInTheDocument()
    })

    it('should reset timer when new game is started', () => {
      renderHeader()
      
      // Advance timer
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(screen.getByText('0:05')).toBeInTheDocument()
      
      // Start new game
      const newGameButton = screen.getByText('🎮 New Game')
      fireEvent.click(newGameButton)
      
      // Timer should reset
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('should call onNewGame when new game button is clicked', () => {
      renderHeader()
      
      const newGameButton = screen.getByText('🎮 New Game')
      fireEvent.click(newGameButton)
      
      expect(mockOnNewGame).toHaveBeenCalledTimes(1)
    })

    it('should call onUndo when undo button is clicked and enabled', () => {
      renderHeader({ canUndo: true })
      
      const undoButton = screen.getByText('↩️ Undo')
      fireEvent.click(undoButton)
      
      expect(mockOnUndo).toHaveBeenCalledTimes(1)
    })

    it('should not call onUndo when undo button is disabled', () => {
      renderHeader({ canUndo: false })
      
      const undoButton = screen.getByText('↩️ Undo')
      fireEvent.click(undoButton)
      
      expect(mockOnUndo).not.toHaveBeenCalled()
    })

    it('should call onHint when hint button is clicked', () => {
      renderHeader()
      
      const hintButton = screen.getByText('💡 Hint')
      fireEvent.click(hintButton)
      
      expect(mockOnHint).toHaveBeenCalledTimes(1)
    })

    it('should toggle timer pause/resume when pause button is clicked', () => {
      renderHeader()
      
      const pauseButton = screen.getByText('⏸️')
      
      // Initial state should be pause button
      expect(pauseButton).toBeInTheDocument()
      
      // Click to pause
      fireEvent.click(pauseButton)
      expect(screen.getByText('▶️')).toBeInTheDocument()
      
      // Click to resume
      fireEvent.click(screen.getByText('▶️'))
      expect(screen.getByText('⏸️')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper title attribute for pause button', () => {
      renderHeader()
      
      const pauseButton = screen.getByText('⏸️')
      expect(pauseButton).toHaveAttribute('title', 'Pause Timer')
    })

    it('should have proper title attribute for play button', () => {
      renderHeader()
      
      const pauseButton = screen.getByText('⏸️')
      fireEvent.click(pauseButton)
      
      const playButton = screen.getByText('▶️')
      expect(playButton).toHaveAttribute('title', 'Resume Timer')
    })

    it('should have proper disabled state for undo button', () => {
      renderHeader({ canUndo: false })
      
      const undoButton = screen.getByText('↩️ Undo')
      expect(undoButton).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined callback props gracefully', () => {
      render(
        <Header
          completed={0}
          moveCount={0}
          onNewGame={mockOnNewGame}
        />
      )
      
      // Should not throw errors when optional callbacks are undefined
      const undoButton = screen.getByText('↩️ Undo')
      const hintButton = screen.getByText('💡 Hint')
      
      fireEvent.click(undoButton)
      fireEvent.click(hintButton)
      
      // Should not crash
      expect(screen.getByText('↩️ Undo')).toBeInTheDocument()
    })

    it('should handle large move counts', () => {
      renderHeader({ moveCount: 999999 })
      
      expect(screen.getByText('999999')).toBeInTheDocument()
    })

    it('should handle large completed counts', () => {
      renderHeader({ completed: 10 })
      
      expect(screen.getByText('10/8')).toBeInTheDocument()
    })

    it('should handle very long timer durations', () => {
      renderHeader()
      
      // Advance to 2 hours and 30 minutes
      act(() => {
        vi.advanceTimersByTime(9000000) // 2.5 hours in milliseconds
      })
      
      expect(screen.getByText('2:30:00')).toBeInTheDocument()
    })
  })
}) 