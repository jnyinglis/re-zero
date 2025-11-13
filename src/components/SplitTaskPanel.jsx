import { useState, useRef, useEffect } from 'react'
import { useAppState } from '../context/AppStateContext'

export default function SplitTaskPanel({ task, onConfirm, onCancel }) {
  const { state } = useAppState()
  const [taskLines, setTaskLines] = useState(['', '', ''])
  const [splitMode, setSplitMode] = useState(state.settings.splitPreference || 'replace')
  const [inheritNotes, setInheritNotes] = useState(state.settings.inheritNotesOnSplit || false)
  const textareaRef = useRef(null)

  // Auto-focus textarea when panel opens
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleTextChange = (e) => {
    const lines = e.target.value.split('\n')
    setTaskLines(lines)
  }

  const handleConfirm = () => {
    // Filter out empty lines
    const validLines = taskLines.filter(line => line.trim().length > 0)

    if (validLines.length === 0) {
      alert('Please enter at least one task')
      return
    }

    onConfirm(validLines, splitMode, inheritNotes)
  }

  const handleKeyDown = (e) => {
    // Allow Escape to cancel
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="split-panel-backdrop" onClick={onCancel}>
      <div className="split-panel" onClick={(e) => e.stopPropagation()}>
        <div className="split-panel-header">
          <h3>Splitting: {task.text}</h3>
          <button className="close-btn" onClick={onCancel} aria-label="Close">×</button>
        </div>

        <div className="split-panel-content">
          <label htmlFor="split-textarea">
            <strong>Enter tasks (one per line)</strong>
          </label>
          <textarea
            id="split-textarea"
            ref={textareaRef}
            value={taskLines.join('\n')}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Task 1&#10;Task 2&#10;Task 3"
            rows="8"
            className="split-textarea"
          />

          <div className="split-options">
            <label>
              <strong>After splitting:</strong>
            </label>

            <div className="split-mode-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="splitMode"
                  value="replace"
                  checked={splitMode === 'replace'}
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <span>Replace original task with split items (recommended)</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="splitMode"
                  value="keep"
                  checked={splitMode === 'keep'}
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <span>Keep original as parent task</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="splitMode"
                  value="archive"
                  checked={splitMode === 'archive'}
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <span>Archive original task</span>
              </label>
            </div>

            {task.notes && task.notes.trim().length > 0 && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={inheritNotes}
                  onChange={(e) => setInheritNotes(e.target.checked)}
                />
                <span>Copy notes to each new task</span>
              </label>
            )}
          </div>
        </div>

        <div className="split-panel-footer">
          <button onClick={onCancel} className="secondary">
            Cancel
          </button>
          <button onClick={handleConfirm} className="primary">
            Create Tasks
          </button>
        </div>
      </div>
    </div>
  )
}
