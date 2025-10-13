import { useAppState } from '../../context/AppStateContext'
import { touchTask, markTaskDotted, getActiveEntries } from '../../utils/taskUtils'

function Instructions() {
  const { state, updateState } = useAppState()
  return (
    <div className="instructions-panel">
      <h2>Step 2: Scanning</h2>
      <p className="step-intro">Move through your list in one smooth pass. Dot anything that feels effortless.</p>
      <div className="instruction-details">
        <h3>What to do:</h3>
        <ul>
          <li>Pass through quickly - don't overthink</li>
          <li>Dot tasks that feel effortless</li>
          <li>Complete the full scan</li>
        </ul>
      </div>
      <button onClick={() => updateState({ guide: { ...state.guide, activeIndex: state.guide.activeIndex + 1 }})} className="start-step-btn">Start Scanning</button>
    </div>
  )
}

function Action() {
  const { state, updateState, scanSession, setScanSession } = useAppState()

  const startScan = () => {
    const activeEntries = getActiveEntries(state.listEntries)
    setScanSession({
      order: activeEntries.map(e => e.taskId),
      index: 0,
      startedAt: Date.now(),
      recentTasks: []
    })
  }

  const advanceScan = (shouldDot) => {
    if (!scanSession) return
    const taskId = scanSession.order[scanSession.index]
    const task = state.tasks.find(t => t.id === taskId)

    if (task) {
      touchTask(task, 'scan', shouldDot ? 'dot' : 'skip')
      if (shouldDot) {
        task.dotted = true
        task.lastDottedOn = new Date().toISOString().slice(0, 10)
      }
      updateState({ tasks: state.tasks })
    }

    // Add current entry to recent tasks
    const listEntry = state.listEntries.find(e => e.taskId === taskId && e.status === 'active')
    const recentTasks = [
      ...scanSession.recentTasks.filter(rt => rt.entryId !== listEntry?.id),
      { taskId, entryId: listEntry?.id, index: scanSession.index, dotted: shouldDot }
    ].slice(-10) // Keep last 10 entries

    if (scanSession.index + 1 >= scanSession.order.length) {
      setScanSession(null)
    } else {
      setScanSession({ ...scanSession, index: scanSession.index + 1, recentTasks })
    }
  }

  const toggleDotted = (taskId) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return

    task.dotted = !task.dotted
    if (task.dotted) {
      task.lastDottedOn = new Date().toISOString().slice(0, 10)
    } else {
      task.lastDottedOn = null
    }

    // Update the recentTasks to reflect the new dotted state
    const recentTasks = scanSession.recentTasks.map(rt =>
      rt.taskId === taskId ? { ...rt, dotted: task.dotted } : rt
    )

    updateState({ tasks: state.tasks })
    setScanSession({ ...scanSession, recentTasks })
  }

  const activeEntries = getActiveEntries(state.listEntries)

  if (!scanSession) {
    return (
      <div className="mode-panel">
        <div className="scan-start">
          <div className="scan-instructions">
            <h2>Ready to scan?</h2>
            <p>Go through each task quickly and dot what feels effortless.</p>
          </div>
          <button onClick={startScan} className="big-scan-button" disabled={activeEntries.length === 0}>Begin</button>
        </div>
      </div>
    )
  }

  const currentTask = state.tasks.find(t => t.id === scanSession.order[scanSession.index])

  // Get recent entries with task details, most recent first
  const recentEntries = scanSession.recentTasks.map(rt => ({
    ...rt,
    task: state.tasks.find(t => t.id === rt.taskId)
  })).filter(rt => rt.task).reverse()

  return (
    <div className="mode-panel">
      <div className="scan-progress">
        <div className="scan-header">
          <span>{scanSession.index + 1} / {scanSession.order.length}</span>
        </div>
        {currentTask && (
          <>
            <div className="current-task">
              <h3>{currentTask.text}</h3>
              <div className="task-meta">{currentTask.level}</div>
            </div>
            <div className="scan-actions">
              <button onClick={() => advanceScan(false)} className="scan-btn secondary">Skip</button>
              <button onClick={() => advanceScan(true)} className="scan-btn primary">Dot</button>
            </div>
          </>
        )}

        {recentEntries.length > 0 && (
          <div className="recent-entries">
            <h4>Recently Scanned</h4>
            <ul className="recent-entries-list">
              {recentEntries.map((entry) => (
                <li
                  key={entry.entryId}
                  className={entry.dotted ? 'dotted' : ''}
                  onClick={() => toggleDotted(entry.taskId)}
                >
                  <span className="task-content">
                    {entry.task.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

const ScanMode = { Instructions, Action }
export default ScanMode
