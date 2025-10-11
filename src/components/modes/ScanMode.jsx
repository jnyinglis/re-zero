import { useAppState } from '../../context/AppStateContext'
import { touchTask, markTaskDotted } from '../../utils/taskUtils'

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
    const tasks = state.tasks.filter(t => t.status === 'active')
    setScanSession({
      order: tasks.map(t => t.id),
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

    if (scanSession.index + 1 >= scanSession.order.length) {
      setScanSession(null)
    } else {
      setScanSession({ ...scanSession, index: scanSession.index + 1 })
    }
  }

  const activeTasks = state.tasks.filter(t => t.status === 'active')

  if (!scanSession) {
    return (
      <div className="mode-panel">
        <div className="scan-start">
          <div className="scan-instructions">
            <h2>Ready to scan?</h2>
            <p>Go through each task quickly and dot what feels effortless.</p>
          </div>
          <button onClick={startScan} className="big-scan-button" disabled={activeTasks.length === 0}>Begin</button>
        </div>
      </div>
    )
  }

  const currentTask = state.tasks.find(t => t.id === scanSession.order[scanSession.index])

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
      </div>
    </div>
  )
}

const ScanMode = { Instructions, Action }
export default ScanMode
