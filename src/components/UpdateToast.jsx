import { useState, useEffect } from 'react'

export default function UpdateToast() {
  const [show, setShow] = useState(false)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/re-zero/service-worker.js')
        .then(reg => {
          setRegistration(reg)

          if (reg.waiting) {
            setShow(true)
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShow(true)
              }
            })
          })
        })
        .catch(err => console.error('SW registration failed:', err))
    }
  }, [])

  const handleRefresh = () => {
    registration?.waiting?.postMessage({ type: 'sw.skipWaiting' })
    window.location.reload()
  }

  if (!show) return null

  return (
    <div className="update-toast" role="status" aria-live="polite">
      <span className="update-message">A new version of Resistance Zero is available.</span>
      <div className="update-actions">
        <button onClick={handleRefresh} className="update-btn primary">
          Refresh now
        </button>
        <button onClick={() => setShow(false)} className="update-btn">
          Later
        </button>
      </div>
    </div>
  )
}
