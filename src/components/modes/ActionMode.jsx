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
  updateTaskMetadata,
  splitTask,
  toggleCollapse,
  getVisibleTasks,
  areAllChildrenComplete
} from '../../utils/taskUtils'
import SplitTaskPanel from '../SplitTaskPanel'
import TaskCard from '../TaskCard'

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

function TaskDetailView({ task, onClose, onComplete, onReenter, onUpdate, onSplit }) {
  const [editedTask, setEditedTask] = useState(task)
  const [timerDisplay, setTimerDisplay] = useState(0)
  const [tagInput, setTagInput] = useState('')
  const [showSplitPanel, setShowSplitPanel] = useState(false)

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

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (!trimmedTag) return

    const tags = editedTask.tags || []
    if (tags.includes(trimmedTag)) {
      // Tag already exists, don't add duplicate
      setTagInput('')
      return
    }

    const updated = { ...editedTask, tags: [...tags, trimmedTag] }
    setEditedTask(updated)
    onUpdate(updated)
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove) => {
    const tags = (editedTask.tags || []).filter(tag => tag !== tagToRemove)
    const updated = { ...editedTask, tags }
    setEditedTask(updated)
    onUpdate(updated)
  }

  const handleSplitConfirm = (newTaskTexts, splitMode, inheritNotes) => {
    onSplit(editedTask.id, newTaskTexts, splitMode, inheritNotes)
    setShowSplitPanel(false)
    onClose() // Close the detail view after splitting
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

            <label htmlFor="tag-input">
              Tags
            </label>
            <div className="tag-input-container">
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag (e.g., project name, context)"
                className="tag-input"
              />
              <button onClick={handleAddTag} className="add-tag-btn" type="button">
                Add
              </button>
            </div>
            {editedTask.tags && editedTask.tags.length > 0 && (
              <div className="tags-display">
                {editedTask.tags.map(tag => (
                  <span key={tag} className="tag-badge">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag-btn"
                      type="button"
                      aria-label={`Remove ${tag} tag`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

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
          <button onClick={() => setShowSplitPanel(true)} className="secondary">
            Split Task
          </button>
          <button onClick={() => onReenter(editedTask.id)} className="secondary">
            Re-enter Task
          </button>
          <button onClick={() => onComplete(editedTask.id)} className="primary">
            Complete Task
          </button>
        </div>
      </div>

      {showSplitPanel && (
        <SplitTaskPanel
          task={editedTask}
          onConfirm={handleSplitConfirm}
          onCancel={() => setShowSplitPanel(false)}
        />
      )}
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

  const handleSplitTask = (taskId, newTaskTexts, splitMode, inheritNotes) => {
    const taskToSplit = state.tasks.find(t => t.id === taskId)
    if (!taskToSplit) return

    // Split the task using the utility function
    const { parentTask, childTasks } = splitTask(taskToSplit, newTaskTexts, {
      mode: splitMode,
      inheritNotes
    })

    // Find the index of the original task in the task list
    const taskIndex = state.tasks.findIndex(t => t.id === taskId)

    let updatedTasks
    if (splitMode === 'replace') {
      // Replace original with child tasks
      updatedTasks = [
        ...state.tasks.slice(0, taskIndex),
        ...childTasks,
        ...state.tasks.slice(taskIndex + 1)
      ]
    } else {
      // Keep or archive parent, insert children after parent
      updatedTasks = [
        ...state.tasks.slice(0, taskIndex),
        parentTask,
        ...childTasks,
        ...state.tasks.slice(taskIndex + 1)
      ]
    }

    // Update list entries
    let updatedListEntries = state.listEntries

    if (splitMode === 'replace' || splitMode === 'archive') {
      // Mark parent's list entries as actioned
      updatedListEntries = state.listEntries.map(e =>
        e.taskId === taskId && e.status === 'active' ? markEntryActioned(e) : e
      )
    } else if (splitMode === 'keep') {
      // Keep parent entry but mark as actioned
      updatedListEntries = state.listEntries.map(e =>
        e.taskId === taskId && e.status === 'active' ? markEntryActioned(e) : e
      )
    }

    // Add list entries for child tasks
    const childEntries = childTasks.map(child => createListEntry(child.id))
    updatedListEntries = [...updatedListEntries, ...childEntries]

    // Update split preference in settings
    const updatedSettings = {
      ...state.settings,
      splitPreference: splitMode,
      inheritNotesOnSplit: inheritNotes
    }

    updateState({
      tasks: updatedTasks,
      listEntries: updatedListEntries,
      settings: updatedSettings
    })

    setSelectedTaskId(null)
  }

  const handleToggleCollapse = (taskId) => {
    const tasks = state.tasks.map(t =>
      t.id === taskId ? toggleCollapse(t) : t
    )
    updateState({ tasks })
  }

  const handleCompleteParent = (taskId) => {
    completeTask(taskId)
  }

  const markedTasks = state.tasks.filter(t => t.status === 'active' && t.marked)
  const visibleMarkedTasks = getVisibleTasks(markedTasks)
  const selectedTask = selectedTaskId ? state.tasks.find(t => t.id === selectedTaskId) : null

  return (
    <div className="mode-panel">
      <h2>Act on marked tasks</h2>
      <div className="task-list">
        {visibleMarkedTasks.length === 0 ? (
          <p>Mark tasks in Scanning mode to see them here.</p>
        ) : (
          visibleMarkedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              tasks={state.tasks}
              onToggleCollapse={handleToggleCollapse}
              onCompleteParent={handleCompleteParent}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, flex: 1 }}>{task.text}</h3>
                  {hasActiveTimer(task) && (
                    <span className="timer-indicator" title="Timer running">⏱️</span>
                  )}
                </header>
                <footer style={{ display: 'flex', gap: '0.5rem' }}>
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
              </div>
            </TaskCard>
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
          onSplit={handleSplitTask}
        />
      )}
    </div>
  )
}

const ActionMode = { Instructions, Action }
export default ActionMode
