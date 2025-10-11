import { useAppState } from '../../context/AppStateContext'

function Instructions() {
  const { state, updateState } = useAppState()
  return (
    <div className="instructions-panel">
      <h2>Step 4: Maintenance</h2>
      <p className="step-intro">Clear space so only what's alive stays in view.</p>
      <button onClick={() => updateState({ guide: { ...state.guide, activeIndex: state.guide.activeIndex + 1 }})} className="start-step-btn">Start Maintenance</button>
    </div>
  )
}

function Action() {
  const { state, updateState } = useAppState()

  const archiveTask = (taskId) => {
    const tasks = state.tasks.map(t => 
      t.id === taskId ? { ...t, status: 'archived', archivedAt: Date.now() } : t
    )
    updateState({ tasks })
  }

  const activeTasks = state.tasks.filter(t => t.status === 'active')

  return (
    <div className="mode-panel">
      <h2>Maintenance</h2>
      <div className="task-list">
        {activeTasks.map(task => (
          <article key={task.id} className="task-card">
            <header><h3>{task.text}</h3></header>
            <footer>
              <button onClick={() => archiveTask(task.id)} className="destructive">Archive</button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}

const MaintenanceMode = { Instructions, Action }
export default MaintenanceMode
