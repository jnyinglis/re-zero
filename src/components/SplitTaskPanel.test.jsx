import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SplitTaskPanel from './SplitTaskPanel'
import { AppStateProvider } from '../context/AppStateContext'

// Mock task
const mockTask = {
  id: 'task-1',
  text: 'Write annual report',
  tags: ['work'],
  notes: 'Important notes',
  resistance: 5,
  level: 'project'
}

// Wrapper with AppStateProvider
const renderWithProvider = (ui, options = {}) => {
  return render(
    <AppStateProvider>
      {ui}
    </AppStateProvider>,
    options
  )
}

describe('SplitTaskPanel', () => {
  let onConfirm
  let onCancel

  beforeEach(() => {
    onConfirm = vi.fn()
    onCancel = vi.fn()
  })

  it('should render with task title', () => {
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    expect(screen.getByText('Splitting: Write annual report')).toBeInTheDocument()
  })

  it('should auto-focus textarea on mount', () => {
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const textarea = screen.getByLabelText(/enter tasks/i)
    expect(textarea).toHaveFocus()
  })

  it('should allow entering multiple tasks', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const textarea = screen.getByLabelText(/enter tasks/i)
    await user.clear(textarea)
    await user.type(textarea, 'Task 1\nTask 2\nTask 3')

    expect(textarea.value).toBe('Task 1\nTask 2\nTask 3')
  })

  it('should call onConfirm with valid task texts', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const textarea = screen.getByLabelText(/enter tasks/i)
    await user.clear(textarea)
    await user.type(textarea, 'Task 1\nTask 2')

    const createButton = screen.getByText('Create Tasks')
    await user.click(createButton)

    expect(onConfirm).toHaveBeenCalledWith(
      ['Task 1', 'Task 2'],
      'replace',
      false
    )
  })

  it('should not call onConfirm when no valid tasks entered', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const textarea = screen.getByLabelText(/enter tasks/i)
    await user.clear(textarea)

    const createButton = screen.getByText('Create Tasks')
    await user.click(createButton)

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('should allow selecting split mode', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const keepRadio = screen.getByLabelText(/keep original as parent/i)
    await user.click(keepRadio)

    const textarea = screen.getByLabelText(/enter tasks/i)
    await user.clear(textarea)
    await user.type(textarea, 'Task 1')

    const createButton = screen.getByText('Create Tasks')
    await user.click(createButton)

    expect(onConfirm).toHaveBeenCalledWith(['Task 1'], 'keep', false)
  })

  it('should allow selecting archive mode', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const archiveRadio = screen.getByLabelText(/archive original task/i)
    await user.click(archiveRadio)

    const textarea = screen.getByLabelText(/enter tasks/i)
    await user.clear(textarea)
    await user.type(textarea, 'Task 1')

    const createButton = screen.getByText('Create Tasks')
    await user.click(createButton)

    expect(onConfirm).toHaveBeenCalledWith(['Task 1'], 'archive', false)
  })

  it('should show notes inheritance checkbox when task has notes', () => {
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    expect(screen.getByLabelText(/copy notes to each new task/i)).toBeInTheDocument()
  })

  it('should not show notes checkbox when task has no notes', () => {
    const taskWithoutNotes = { ...mockTask, notes: '' }
    renderWithProvider(
      <SplitTaskPanel
        task={taskWithoutNotes}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    expect(screen.queryByLabelText(/copy notes to each new task/i)).not.toBeInTheDocument()
  })

  it('should pass inheritNotes flag when checkbox is checked', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const inheritCheckbox = screen.getByLabelText(/copy notes to each new task/i)
    await user.click(inheritCheckbox)

    const textarea = screen.getByLabelText(/enter tasks/i)
    await user.clear(textarea)
    await user.type(textarea, 'Task 1')

    const createButton = screen.getByText('Create Tasks')
    await user.click(createButton)

    expect(onConfirm).toHaveBeenCalledWith(['Task 1'], 'replace', true)
  })

  it('should call onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it('should call onCancel when backdrop is clicked', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const backdrop = document.querySelector('.split-panel-backdrop')
    await user.click(backdrop)

    expect(onCancel).toHaveBeenCalled()
  })

  it('should call onCancel when Escape key is pressed', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const textarea = screen.getByLabelText(/enter tasks/i)
    await user.click(textarea)
    await user.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalled()
  })

  it('should default to replace mode', () => {
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const replaceRadio = screen.getByLabelText(/replace original task/i)
    expect(replaceRadio).toBeChecked()
  })

  it('should filter empty lines when confirming', async () => {
    const user = userEvent.setup()
    renderWithProvider(
      <SplitTaskPanel
        task={mockTask}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )

    const textarea = screen.getByLabelText(/enter tasks/i)
    await user.clear(textarea)
    await user.type(textarea, 'Task 1\n\n  \nTask 2\n')

    const createButton = screen.getByText('Create Tasks')
    await user.click(createButton)

    expect(onConfirm).toHaveBeenCalledWith(['Task 1', 'Task 2'], 'replace', false)
  })
})
