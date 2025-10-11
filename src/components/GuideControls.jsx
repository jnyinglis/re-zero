import { useAppState } from '../context/AppStateContext'

const guideFlow = [
  { key: 'intro', mode: 'intro', label: 'Introduction' },
  { key: 'listInstructions', mode: 'listInstructions', label: 'List Building Instructions' },
  { key: 'listAction', mode: 'list', label: 'List Building' },
  { key: 'scanInstructions', mode: 'scanInstructions', label: 'Scanning Instructions' },
  { key: 'scanAction', mode: 'scan', label: 'Scanning' },
  { key: 'actionInstructions', mode: 'actionInstructions', label: 'Action Instructions' },
  { key: 'actionAction', mode: 'action', label: 'Action' },
  { key: 'maintainInstructions', mode: 'maintainInstructions', label: 'Maintenance Instructions' },
  { key: 'maintainAction', mode: 'maintain', label: 'Maintenance' },
  { key: 'reflectInstructions', mode: 'reflectInstructions', label: 'Reflection Instructions' },
  { key: 'reflectAction', mode: 'reflect', label: 'Reflection' },
]

export default function GuideControls() {
  const { state, updateState, scanSession, setScanSession } = useAppState()

  const currentStep = guideFlow[state.guide.activeIndex]
  const isInstructionStep = currentStep?.mode.includes('Instructions')
  const stepNumber = Math.floor((state.guide.activeIndex - 1) / 2) + 1

  const handlePrev = () => {
    if (isInstructionStep) {
      if (state.guide.activeIndex > 1) {
        updateState({
          guide: { ...state.guide, activeIndex: state.guide.activeIndex - 1 }
        })
      } else {
        // Back to intro
        updateState({
          guide: { started: false, activeIndex: 0 }
        })
      }
    } else {
      // Back to instructions
      updateState({
        guide: { ...state.guide, activeIndex: state.guide.activeIndex - 1 }
      })
    }
  }

  const handleNext = () => {
    // Check if canceling scan
    if (currentStep?.mode === 'scan' && scanSession) {
      setScanSession(null)
      return
    }

    // Normal next
    if (state.guide.activeIndex < guideFlow.length - 1) {
      updateState({
        guide: { ...state.guide, activeIndex: state.guide.activeIndex + 1 }
      })
    } else {
      // Restart cycle
      updateState({
        guide: { ...state.guide, activeIndex: 1 }
      })
    }
  }

  const isNextDisabled = isInstructionStep || (currentStep?.mode === 'list' && state.tasks.length === 0)
  const nextText = scanSession ? 'Cancel' :
    state.guide.activeIndex === guideFlow.length - 1 ? 'Start New Cycle' : 'Next Step'
  const prevText = isInstructionStep
    ? (state.guide.activeIndex === 1 ? 'Back to Intro' : 'Previous Step')
    : 'Instructions'

  return (
    <div id="guideControls" className="guide-controls">
      <button
        id="guidePrev"
        className="guide-nav-btn"
        onClick={handlePrev}
      >
        {prevText}
      </button>
      <div id="guideProgressLabel" className="guide-progress">
        Step {stepNumber} of 5
      </div>
      {!isInstructionStep && (
        <button
          id="guideNext"
          className={`guide-nav-btn ${scanSession ? 'cancel' : 'primary'}`}
          onClick={handleNext}
          disabled={isNextDisabled}
        >
          {nextText}
        </button>
      )}
    </div>
  )
}
