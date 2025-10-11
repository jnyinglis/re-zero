import { useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { createTask } from '../../utils/taskUtils'

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
    updateState({ tasks: [...state.tasks, task] })
    setTaskText('')
  }

  const handleDelete = (taskId) => {
    updateState({ tasks: state.tasks.filter(t => t.id !== taskId) })
  }

  const activeTasks = state.tasks.filter(t => t.status === 'active')

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
          <ul className="task-list-items">
            {activeTasks.map(task => (
              <li key={task.id}>
                <span className="task-content">{task.text}{task.dotted ? ' • dotted' : ''}</span>
              </li>
            ))}
          </ul>
          {activeTasks.length === 0 && <div className="no-tasks-message"><p>Start by adding your first task</p></div>}
        </div>
      </div>
    </div>
  )
}

const ListMode = { Instructions, Action }
export default ListMode
