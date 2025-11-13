import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReflectionMode from './ReflectionMode'
import { useAppState } from '../../context/AppStateContext'

// Mock the AppStateContext
vi.mock('../../context/AppStateContext', () => ({
  useAppState: vi.fn()
}))

describe('ReflectionMode', () => {
  let mockState
  let mockUpdateState

  beforeEach(() => {
    mockUpdateState = vi.fn()
    mockState = {
      tasks: [],
      daily: {},
      guide: {
        started: true,
        activeIndex: 4
      }
    }

    useAppState.mockReturnValue({
      state: mockState,
      updateState: mockUpdateState
    })
  })

  describe('Action component - Daily Stats Display', () => {
    it('should display zero stats when daily data is empty', () => {
      const { Action } = ReflectionMode
      render(<Action />)

      expect(screen.getByText(/Scans today: 0/i)).toBeInTheDocument()
      expect(screen.getByText(/Tasks marked today: 0/i)).toBeInTheDocument()
      expect(screen.getByText(/Minutes logged: 0/i)).toBeInTheDocument()
    })

    it('should display actual stats when daily data exists for today', () => {
      const today = new Date().toISOString().slice(0, 10)
      mockState.daily[today] = {
        scans: 5,
        marks: 3,
        minutes: 45
      }

      const { Action } = ReflectionMode
      render(<Action />)

      expect(screen.getByText(/Scans today: 5/i)).toBeInTheDocument()
      expect(screen.getByText(/Tasks marked today: 3/i)).toBeInTheDocument()
      expect(screen.getByText(/Minutes logged: 45/i)).toBeInTheDocument()
    })

    it('should handle partial daily data with defaults', () => {
      const today = new Date().toISOString().slice(0, 10)
      mockState.daily[today] = {
        scans: 2
        // marks and minutes missing
      }

      const { Action } = ReflectionMode
      render(<Action />)

      expect(screen.getByText(/Scans today: 2/i)).toBeInTheDocument()
      expect(screen.getByText(/Tasks marked today: 0/i)).toBeInTheDocument()
      expect(screen.getByText(/Minutes logged: 0/i)).toBeInTheDocument()
    })

    it('should display completed and archived tasks', () => {
      mockState.tasks = [
        { id: '1', text: 'Task 1', status: 'completed' },
        { id: '2', text: 'Task 2', status: 'archived' },
        { id: '3', text: 'Task 3', status: 'active' }
      ]

      const { Action } = ReflectionMode
      render(<Action />)

      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
      expect(screen.queryByText('Task 3')).not.toBeInTheDocument()
    })
  })
})
