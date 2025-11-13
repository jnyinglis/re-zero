import { useAppState } from '../../context/AppStateContext'
import { touchTask, markTaskMarked, getActiveEntries } from '../../utils/taskUtils'
import { incrementDailyStat } from '../../utils/dailyStats'

function Instructions() {
  const { state, updateState } = useAppState()
  return (
    <div className="instructions-panel">
      <h2>Step 2: Scanning</h2>
      <p className="step-intro">Move through your list in one smooth pass. Mark anything that feels effortless.</p>
      <div className="instruction-details">
        <h3>What to do:</h3>
        <ul>
          <li>Pass through quickly - don't overthink</li>
          <li>Mark tasks that feel effortless</li>
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

    // Increment daily scan count
    const updatedDaily = incrementDailyStat(state.daily, 'scans')
    updateState({ daily: updatedDaily })
  }

  const advanceScan = (shouldMark) => {
    if (!scanSession) return
    const taskId = scanSession.order[scanSession.index]
    const task = state.tasks.find(t => t.id === taskId)

    let updatedDaily = state.daily
    if (task) {
      touchTask(task, 'scan', shouldMark ? 'mark' : 'skip')
      if (shouldMark) {
        task.marked = true
        task.lastMarkedOn = new Date().toISOString().slice(0, 10)
        // Increment daily marks count
        updatedDaily = incrementDailyStat(state.daily, 'marks')
      }
      updateState({ tasks: state.tasks, daily: updatedDaily })
    }

    // Add current entry to recent tasks
    const listEntry = state.listEntries.find(e => e.taskId === taskId && e.status === 'active')
    const recentTasks = [
      ...scanSession.recentTasks.filter(rt => rt.entryId !== listEntry?.id),
      { taskId, entryId: listEntry?.id, index: scanSession.index, marked: shouldMark }
    ].slice(-10) // Keep last 10 entries

    if (scanSession.index + 1 >= scanSession.order.length) {
      setScanSession(null)
    } else {
      setScanSession({ ...scanSession, index: scanSession.index + 1, recentTasks })
    }
  }

  const toggleMarked = (taskId) => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) return

    const wasMarked = task.marked
    task.marked = !task.marked

    let updatedDaily = state.daily
    if (task.marked) {
      task.lastMarkedOn = new Date().toISOString().slice(0, 10)
      // Increment marks when marking
      updatedDaily = incrementDailyStat(state.daily, 'marks')
    } else {
      task.lastMarkedOn = null
      // Decrement marks when unmarking
      const today = new Date().toISOString().slice(0, 10)
      const currentStats = state.daily[today] || { scans: 0, marks: 0, minutes: 0 }
      updatedDaily = {
        ...state.daily,
        [today]: {
          ...currentStats,
          marks: Math.max(0, (currentStats.marks || 0) - 1)
        }
      }
    }

    // Update the recentTasks to reflect the new marked state
    const recentTasks = scanSession.recentTasks.map(rt =>
      rt.taskId === taskId ? { ...rt, marked: task.marked } : rt
    )

    updateState({ tasks: state.tasks, daily: updatedDaily })
    setScanSession({ ...scanSession, recentTasks })
  }

  const activeEntries = getActiveEntries(state.listEntries)

  if (!scanSession) {
    return (
      <div className="mode-panel">
        <div className="scan-start">
          <div className="scan-instructions">
            <h2>Ready to scan?</h2>
            <p>Go through each task quickly and mark what feels effortless.</p>
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
              <div className="task-meta">
                {currentTask.level}
                {currentTask.tags && currentTask.tags.length > 0 && (
                  <span className="task-tags">
                    {currentTask.tags.map(tag => (
                      <span key={tag} className="tag-badge-small">
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>
            <div className="scan-actions">
              <button onClick={() => advanceScan(false)} className="scan-btn secondary">Skip</button>
              <button onClick={() => advanceScan(true)} className="scan-btn primary">Mark</button>
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
                  className={entry.marked ? 'marked' : ''}
                  onClick={() => toggleMarked(entry.taskId)}
                >
                  <span className="task-content">
                    {entry.task.text}
                  </span>
                  {entry.task.tags && entry.task.tags.length > 0 && (
                    <span className="task-tags">
                      {entry.task.tags.map(tag => (
                        <span key={tag} className="tag-badge-small">
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
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
