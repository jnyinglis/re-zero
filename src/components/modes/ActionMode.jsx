import { useAppState } from '../../context/AppStateContext'
import { createListEntry, markEntryActioned } from '../../utils/taskUtils'

function Instructions() {
  const { state, updateState } = useAppState()
  return (
    <div className="instructions-panel">
      <h2>Step 3: Action</h2>
      <p className="step-intro">Follow the dots you created. Small moves count.</p>
      <button onClick={() => updateState({ guide: { ...state.guide, activeIndex: state.guide.activeIndex + 1 }})} className="start-step-btn">Start Taking Action</button>
    </div>
  )
}

function Action() {
  const { state, updateState } = useAppState()

  const completeTask = (taskId) => {
    const tasks = state.tasks.map(t =>
      t.id === taskId ? { ...t, status: 'completed', completedAt: Date.now(), dotted: false } : t
    )

    // Mark all list entries for this task as actioned
    const listEntries = state.listEntries.map(e =>
      e.taskId === taskId && e.status === 'active' ? markEntryActioned(e) : e
    )

    updateState({ tasks, listEntries })
  }

  const reenterTask = (taskId) => {
    const tasks = state.tasks.map(t =>
      t.id === taskId ? { ...t, dotted: false, reentries: (t.reentries || 0) + 1 } : t
    )

    // Mark current list entry as actioned
    const listEntries = state.listEntries.map(e =>
      e.taskId === taskId && e.status === 'active' ? markEntryActioned(e) : e
    )

    // Create new list entry at the end
    const newEntry = createListEntry(taskId)

    updateState({ tasks, listEntries: [...listEntries, newEntry] })
  }

  const dottedTasks = state.tasks.filter(t => t.status === 'active' && t.dotted)

  return (
    <div className="mode-panel">
      <h2>Act on dotted tasks</h2>
      <div className="task-list">
        {dottedTasks.length === 0 ? (
          <p>Dot tasks in Scanning mode to see them here.</p>
        ) : (
          dottedTasks.map(task => (
            <article key={task.id} className="task-card">
              <header><h3>{task.text}</h3></header>
              <footer>
                <button onClick={() => reenterTask(task.id)} className="secondary">Re-enter</button>
                <button onClick={() => completeTask(task.id)} className="primary">Complete</button>
              </footer>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

const ActionMode = { Instructions, Action }
export default ActionMode
