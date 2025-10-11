import { useAppState } from '../../context/AppStateContext'

function Instructions() {
  const { state, updateState } = useAppState()
  return (
    <div className="instructions-panel">
      <h2>Step 5: Reflection</h2>
      <p className="step-intro">Take a breath and notice what shifted.</p>
      <button onClick={() => updateState({ guide: { ...state.guide, activeIndex: state.guide.activeIndex + 1 }})} className="start-step-btn">Start Reflection</button>
    </div>
  )
}

function Action() {
  const { state } = useAppState()

  const completedTasks = state.tasks.filter(t => t.status === 'completed')
  const archivedTasks = state.tasks.filter(t => t.status === 'archived')

  const today = new Date().toISOString().slice(0, 10)
  const dailyStats = state.daily[today] || { scans: 0, dots: 0, minutes: 0 }

  return (
    <div className="mode-panel">
      <h2>Reflection</h2>
      <div className="reflection-insights">
        <div className="insight">Scans today: {dailyStats.scans || 0}</div>
        <div className="insight">Tasks dotted today: {dailyStats.dots || 0}</div>
        <div className="insight">Minutes logged: {Math.round(dailyStats.minutes || 0)}</div>
      </div>
      <div className="reflection-lists">
        <div>
          <h3>Completed</h3>
          <ul>
            {completedTasks.map(task => (
              <li key={task.id} className="reflection-item">{task.text}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Archived</h3>
          <ul>
            {archivedTasks.map(task => (
              <li key={task.id} className="reflection-item">{task.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const ReflectionMode = { Instructions, Action }
export default ReflectionMode
