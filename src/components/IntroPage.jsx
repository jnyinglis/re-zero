import { useAppState } from '../context/AppStateContext'

export default function IntroPage() {
  const { state, updateState } = useAppState()

  const handleStart = () => {
    updateState({
      guide: {
        ...state.guide,
        started: true,
        activeIndex: 1,
      }
    })
  }

  if (state.guide.started) {
    return null
  }

  return (
    <section id="introPage" className="intro-page">
      <div className="intro-content">
        <h2>Welcome to Resistance Zero</h2>
        <p className="intro-description">
          Resistance Zero transforms procrastination into a navigation tool. Instead of fighting resistance,
          we use it as guidance - scanning tasks until some feel effortless, then acting on those first.
        </p>
        <div className="process-overview">
          <h3>The 5-Step Process:</h3>
          <ol className="process-steps">
            <li><strong>List Building</strong> – Capture everything into one flat list</li>
            <li><strong>Scanning</strong> – Pass through quickly and dot zero-resistance tasks</li>
            <li><strong>Action</strong> – Take small steps on dotted items</li>
            <li><strong>Maintenance</strong> – Clear completed and irrelevant tasks</li>
            <li><strong>Reflection</strong> – Notice progress and patterns</li>
          </ol>
        </div>
        <button onClick={handleStart} className="start-rezero-btn">
          Start ResZero
        </button>
      </div>
    </section>
  )
}
