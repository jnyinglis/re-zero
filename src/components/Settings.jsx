import { useAppState, STORAGE_KEY, defaultState } from '../context/AppStateContext'

export default function Settings({ onClose }) {
  const { state, setState, updateState } = useAppState()

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resistance-zero-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)

        // Validate that it has the expected structure
        if (imported && typeof imported === 'object' && 'tasks' in imported) {
          setState(imported)
          alert('Data imported successfully!')
          onClose()
        } else {
          alert('Invalid data format. Please select a valid Resistance Zero backup file.')
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('Failed to import data. The file may be corrupted.')
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This will delete all tasks, settings, and metrics. This action cannot be undone.')) {
      if (window.confirm('This is your final warning. All your data will be permanently deleted. Continue?')) {
        setState({ ...defaultState })
        alert('All data has been reset.')
        onClose()
      }
    }
  }

  const handleThemeChange = (theme) => {
    updateState({
      settings: {
        ...state.settings,
        theme,
      },
    })
  }

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>Settings</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="settings-modal-content">
          {/* Theme Setting */}
          <section className="setting-group">
            <h3>Appearance</h3>
            <div className="setting-option">
              <div className="setting-info">
                <div className="setting-label">Theme</div>
                <div className="setting-description">Choose your preferred color scheme</div>
              </div>
              <select
                value={state.settings.theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="theme-select"
              >
                <option value="auto">Auto (System)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </section>

          {/* Data Management */}
          <section className="setting-group">
            <h3>Data Management</h3>

            <div className="setting-option-vertical">
              <div className="setting-info">
                <div className="setting-label">Export Data</div>
                <div className="setting-description">Download all your tasks and settings as a JSON file</div>
              </div>
              <button
                onClick={handleExport}
                className="settings-btn primary"
              >
                Export Database
              </button>
            </div>

            <div className="setting-option-vertical">
              <div className="setting-info">
                <div className="setting-label">Import Data</div>
                <div className="setting-description">Restore from a previously exported backup file</div>
              </div>
              <label className="settings-btn secondary file-input-label">
                Import Database
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="setting-option-vertical danger-zone">
              <div className="setting-info">
                <div className="setting-label">Reset All Data</div>
                <div className="setting-description">Delete all tasks, settings, and metrics permanently</div>
              </div>
              <button
                onClick={handleReset}
                className="settings-btn danger"
              >
                Reset to Empty
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
