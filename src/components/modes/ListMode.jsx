import { useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { createTask, createListEntry, getEntriesByDay, formatDate, splitTask, markEntryActioned } from '../../utils/taskUtils'
import SplitTaskPanel from '../SplitTaskPanel'

function Instructions() {
  const { updateState, state } = useAppState()

  return (
    <div className="instructions-panel">
      <h2>Step 1: List Building</h2>
      <p className="step-intro">
        Empty your head into one flat list. Capture everything that isn't tied to a calendar or specific time.
      </p>
      <div className="instruction-details">
        <h3>What to do:</h3>
        <ul>
          <li>Add tasks quickly at any level</li>
          <li>Keep the list flat and uncategorized</li>
          <li>Include everything that's on your mind</li>
        </ul>
      </div>
      <button onClick={() => updateState({ guide: { ...state.guide, activeIndex: state.guide.activeIndex + 1 }})} className="start-step-btn">
        Start List Building
      </button>
    </div>
  )
}

function Action() {
  const { state, updateState } = useAppState()
  const [taskText, setTaskText] = useState('')
  const [splitTaskId, setSplitTaskId] = useState(null)

  const handleQuickAdd = () => {
    if (!taskText.trim()) return
    const task = createTask({ text: taskText.trim(), resistance: null, level: 'unspecified', notes: '' })
    const listEntry = createListEntry(task.id)
    updateState({
      tasks: [...state.tasks, task],
      listEntries: [...state.listEntries, listEntry]
    })
    setTaskText('')
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
      // Keep parent entry active
      // Don't mark as actioned - parent stays in list until children complete
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

    setSplitTaskId(null)
  }

  const entriesByDay = getEntriesByDay(state.listEntries, state.tasks)
  const splitTask_toSplit = splitTaskId ? state.tasks.find(t => t.id === splitTaskId) : null

  return (
    <div className="mode-panel">
      <div className="list-builder">
        <div className="quick-add">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
            placeholder="Add a task..."
            className="quick-task-input"
          />
          <button onClick={handleQuickAdd} className="quick-add-btn">+</button>
        </div>
        <div className="task-list-view">
          {entriesByDay.length === 0 && <div className="no-tasks-message"><p>Start by adding your first task</p></div>}
          {entriesByDay.map(({ day, entries }) => (
            <div key={day} className="day-group">
              <div className="day-divider">{formatDate(day)}</div>
              <ul className="task-list-items">
                {entries.map(({ entry, task }) => (
                  <li key={entry.id} className={entry.status === 'actioned' ? 'actioned' : ''}>
                    <div className="task-item-content">
                      <span className="task-content">
                        {task.text}
                        {task.marked ? ' • marked' : ''}
                      </span>
                      {task.tags && task.tags.length > 0 && (
                        <span className="task-tags">
                          {task.tags.map(tag => (
                            <span key={tag} className="tag-badge-small">
                              {tag}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                    {entry.status === 'active' && (
                      <button
                        onClick={() => setSplitTaskId(task.id)}
                        className="split-task-btn"
                        title="Split task into smaller tasks"
                        aria-label="Split task"
                      >
                        ✂️
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {splitTask_toSplit && (
        <SplitTaskPanel
          task={splitTask_toSplit}
          onConfirm={(newTaskTexts, splitMode, inheritNotes) =>
            handleSplitTask(splitTask_toSplit.id, newTaskTexts, splitMode, inheritNotes)
          }
          onCancel={() => setSplitTaskId(null)}
        />
      )}
    </div>
  )
}

const ListMode = { Instructions, Action }
export default ListMode
