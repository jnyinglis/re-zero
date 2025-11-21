import { useState } from 'react'
import Settings from './Settings'

export default function MobileMenu() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setShowSettings(true)}
        aria-label="Open settings menu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  )
}
