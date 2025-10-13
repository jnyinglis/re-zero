import { useAppState } from '../context/AppStateContext'

const coachTips = [
  "Scanning chips away resistance. Keep passing through!",
  "If a dotted task resists, split it and keep moving.",
  "Re-entry isn't failure—it's the Resistance Zero rhythm.",
  "Stay in one mode at a time to feel the guidance working.",
  "Delete the stale. Make space for the effortless.",
]

export default function Footer() {
  const { state } = useAppState()

  if (!state.guide.started) {
    return null
  }

  const totalTasks = state.tasks.length
  const dottedTasks = state.tasks.filter(t => t.dotted && t.status === 'active').length
  const activeTasks = state.tasks.filter(t => t.status === 'active').length
  const tip = coachTips[state.tipsIndex % coachTips.length]
  // eslint-disable-next-line no-undef
  const version = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : 'dev'

  return (
    <footer className="app-footer">
      <div id="metrics">
        <span>Total Tasks: {totalTasks}</span>
        <span>Dotted: {dottedTasks}</span>
        <span>Active: {activeTasks}</span>
        <span className="version">v{version}</span>
      </div>
      <div id="coachTips">{tip}</div>
    </footer>
  )
}
