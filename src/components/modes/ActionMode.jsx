import { useState, useEffect } from 'react'
import { useAppState } from '../../context/AppStateContext'
import {
  createListEntry,
  markEntryActioned,
  startTaskTimer,
  stopTaskTimer,
  getCurrentSessionTime,
  getTotalTaskTime,
  formatDuration,
  hasActiveTimer,
  updateTaskMetadata
} from '../../utils/taskUtils'

function Instructions() {
  const { state, updateState } = useAppState()
  return (
    <div className="instructions-panel">
      <h2>Step 3: Action</h2>
      <p className="step-intro">Follow the marks you created. Small moves count.</p>
      <button onClick={() => updateState({ guide: { ...state.guide, activeIndex: state.guide.activeIndex + 1 }})} className="start-step-btn">Start Taking Action</button>
    </div>
  )
}

function TaskDetailView({ task, onClose, onComplete, onReenter, onUpdate }) {
  const [editedTask, setEditedTask] = useState(task)
  const [timerDisplay, setTimerDisplay] = useState(0)

  useEffect(() => {
    if (hasActiveTimer(editedTask)) {
      const interval = setInterval(() => {
        setTimerDisplay(getCurrentSessionTime(editedTask))
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setTimerDisplay(0)
    }
  }, [editedTask])

  const handleFieldUpdate = (field, value) => {
    const updated = { ...editedTask, [field]: value }
    setEditedTask(updated)
    onUpdate(updated)
  }

  const handleStartTimer = () => {
    const updated = startTaskTimer({ ...editedTask })
    setEditedTask(updated)
    onUpdate(updated)
  }

  const handleStopTimer = () => {
    const updated = stopTaskTimer({ ...editedTask })
    setEditedTask(updated)
    onUpdate(updated)
  }

  const totalTime = getTotalTaskTime(editedTask)
  const isTimerActive = hasActiveTimer(editedTask)

  return (
    <div className="task-detail-backdrop" onClick={onClose}>
      <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail-header">
          <h2>Task Details</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="task-detail-content">
          {/* Task Text */}
          <div className="detail-section">
            <label htmlFor="task-text">
              <strong>Task</strong>
            </label>
            <textarea
              id="task-text"
              value={editedTask.text}
              onChange={(e) => handleFieldUpdate('text', e.target.value)}
              rows="3"
              className="task-text-input"
            />
          </div>

          {/* Metadata Section */}
          <div className="detail-section metadata-section">
            <h3>Optional Details</h3>

            <label htmlFor="resistance-slider">
              Resistance Level: <strong>{editedTask.resistance ?? 'Not set'}</strong>
            </label>
            <input
              id="resistance-slider"
              type="range"
              min="0"
              max="10"
              value={editedTask.resistance ?? 5}
              onChange={(e) => handleFieldUpdate('resistance', parseInt(e.target.value))}
              className="resistance-slider"
            />
            <div className="slider-labels">
              <span>0 - Zero resistance</span>
              <span>10 - High resistance</span>
            </div>

            <label htmlFor="task-level">
              Task Level
            </label>
            <select
              id="task-level"
              value={editedTask.level || 'unspecified'}
              onChange={(e) => handleFieldUpdate('level', e.target.value)}
              className="task-level-select"
            >
              <option value="unspecified">Unspecified</option>
              <option value="project">Project</option>
              <option value="step">Step</option>
              <option value="meta">Meta</option>
            </select>

            <label htmlFor="task-notes">
              Notes
            </label>
            <textarea
              id="task-notes"
              value={editedTask.notes || ''}
              onChange={(e) => handleFieldUpdate('notes', e.target.value)}
              rows="4"
              placeholder="Add notes, project code, billing category, etc."
              className="task-notes-input"
            />
          </div>

          {/* Time Tracking Section */}
          <div className="detail-section timer-section">
            <h3>Time Tracking</h3>

            <div className="timer-display">
              {isTimerActive ? (
                <>
                  <div className="timer-active-indicator">● Recording</div>
                  <div className="timer-value">{formatDuration(timerDisplay)}</div>
                  <button onClick={handleStopTimer} className="timer-btn stop-btn">
                    Stop Timer
                  </button>
                </>
              ) : (
                <>
                  <div className="timer-value">
                    {totalTime > 0 ? `Total: ${formatDuration(totalTime)}` : 'No time logged'}
                  </div>
                  <button onClick={handleStartTimer} className="timer-btn start-btn">
                    Start Timer
                  </button>
                </>
              )}
            </div>

            {editedTask.timeLogs && editedTask.timeLogs.length > 0 && (
              <div className="time-logs-summary">
                <strong>Sessions logged:</strong> {editedTask.timeLogs.filter(log => log.duration).length}
              </div>
            )}
          </div>

          {/* Activity Metrics */}
          <div className="detail-section activity-metrics">
            <h3>Activity History</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Touches</span>
                <span className="metric-value">{editedTask.touches || 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Scans</span>
                <span className="metric-value">{editedTask.scanCount || 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Re-entries</span>
                <span className="metric-value">{editedTask.reentries || 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Marked</span>
                <span className="metric-value">{editedTask.markedCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="task-detail-footer">
          <button onClick={() => onReenter(editedTask.id)} className="secondary">
            Re-enter Task
          </button>
          <button onClick={() => onComplete(editedTask.id)} className="primary">
            Complete Task
          </button>
        </div>
      </div>
    </div>
  )
}

function Action() {
  const { state, updateState } = useAppState()
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  const completeTask = (taskId) => {
    const tasks = state.tasks.map(t =>
      t.id === taskId ? { ...t, status: 'completed', completedAt: Date.now(), marked: false } : t
    )

    // Stop any active timer
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex !== -1 && hasActiveTimer(tasks[taskIndex])) {
      tasks[taskIndex] = stopTaskTimer(tasks[taskIndex])
    }

    // Mark all list entries for this task as actioned
    const listEntries = state.listEntries.map(e =>
      e.taskId === taskId && e.status === 'active' ? markEntryActioned(e) : e
    )

    updateState({ tasks, listEntries })
    setSelectedTaskId(null)
  }

  const reenterTask = (taskId) => {
    const tasks = state.tasks.map(t =>
      t.id === taskId ? { ...t, marked: false, reentries: (t.reentries || 0) + 1 } : t
    )

    // Stop any active timer
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex !== -1 && hasActiveTimer(tasks[taskIndex])) {
      tasks[taskIndex] = stopTaskTimer(tasks[taskIndex])
    }

    // Mark current list entry as actioned
    const listEntries = state.listEntries.map(e =>
      e.taskId === taskId && e.status === 'active' ? markEntryActioned(e) : e
    )

    // Create new list entry at the end
    const newEntry = createListEntry(taskId)

    updateState({ tasks, listEntries: [...listEntries, newEntry] })
    setSelectedTaskId(null)
  }

  const handleTaskUpdate = (updatedTask) => {
    const tasks = state.tasks.map(t =>
      t.id === updatedTask.id ? updatedTask : t
    )
    updateState({ tasks })
  }

  const markedTasks = state.tasks.filter(t => t.status === 'active' && t.marked)
  const selectedTask = selectedTaskId ? state.tasks.find(t => t.id === selectedTaskId) : null

  return (
    <div className="mode-panel">
      <h2>Act on marked tasks</h2>
      <div className="task-list">
        {markedTasks.length === 0 ? (
          <p>Mark tasks in Scanning mode to see them here.</p>
        ) : (
          markedTasks.map(task => (
            <article key={task.id} className="task-card">
              <header>
                <h3>{task.text}</h3>
                {hasActiveTimer(task) && (
                  <span className="timer-indicator" title="Timer running">⏱️</span>
                )}
              </header>
              <footer>
                <button onClick={() => setSelectedTaskId(task.id)} className="secondary">
                  More
                </button>
                <button onClick={() => reenterTask(task.id)} className="secondary">
                  Re-enter
                </button>
                <button onClick={() => completeTask(task.id)} className="primary">
                  Complete
                </button>
              </footer>
            </article>
          ))
        )}
      </div>

      {selectedTask && (
        <TaskDetailView
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onComplete={completeTask}
          onReenter={reenterTask}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  )
}

const ActionMode = { Instructions, Action }
export default ActionMode
