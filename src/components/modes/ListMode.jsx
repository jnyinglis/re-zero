import { useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { createTask, createListEntry, getEntriesByDay, formatDate } from '../../utils/taskUtils'

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

  const entriesByDay = getEntriesByDay(state.listEntries, state.tasks)

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
                    <span className="task-content">
                      {task.text}
                      {task.dotted ? ' • dotted' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const ListMode = { Instructions, Action }
export default ListMode
