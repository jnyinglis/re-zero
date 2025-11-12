import { useState, useEffect } from 'react'
import { useAppState } from '../context/AppStateContext'

export default function Header() {
  const { state } = useAppState()
  const [guidance, setGuidance] = useState('')
  const [showInstall, setShowInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  const guidanceByMode = {
    list: [
      "Empty your head. Capture everything without judging it.",
      "Projects, steps, meta-thoughts—all belong in one flat list.",
      "Re-entry is a feature: add recurring tasks freely.",
    ],
    scan: [
      "Choose a direction and stick with it. Scanning melts resistance.",
      "Mark only what feels effortless right now—no forcing.",
      "Quick passes beat deliberation. Trust the hunches.",
    ],
    action: [
      "Little and often wins. Even two minutes moves the needle.",
      "After you act, re-enter unfinished work at the end of the list.",
      "Notice how marked tasks invite you forward—flow with them.",
    ],
    maintain: [
      "Listen for tasks that now say 'delete me'.",
      "Archiving preserves history without cluttering your list.",
      "Recurring items can be re-entered as soon as they're needed.",
    ],
    reflect: [
      "Celebrate touch counts: resistance is already lower.",
      "Look for clumps of similar wins—they reveal momentum.",
      "Keep reflection light. Notice and move forward.",
    ],
  }

  useEffect(() => {
    const messages = guidanceByMode.list || []
    const message = messages[Math.floor(Math.random() * messages.length)] || ''
    setGuidance(message)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstall(false)
    }
    setDeferredPrompt(null)
  }

  // Hide header when not on intro page
  if (state.guide.started) {
    return null
  }

  return (
    <header className="app-header">
      <h1>Resistance Zero</h1>
      <div className="guidance" id="guidanceBar">{guidance}</div>
      {showInstall && (
        <button
          className="install-btn"
          type="button"
          onClick={handleInstall}
        >
          Install App
        </button>
      )}
    </header>
  )
}
