import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createListEntry } from '../utils/taskUtils'

const STORAGE_KEY = 'rz-state-v1'

const defaultState = {
  tasks: [],
  listEntries: [],
  settings: {
    scanDirection: 'forward',
    guideMode: true,
  },
  metrics: {
    totalScans: 0,
    dottedToday: 0,
  },
  daily: {},
  tipsIndex: 0,
  guide: {
    started: false,
    activeIndex: 0,
  },
}

const AppStateContext = createContext()

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}

export function AppStateProvider({ children }) {
  const [state, setState] = useState(() => loadState())
  const [scanSession, setScanSession] = useState(null)
  const [activeTimer, setActiveTimer] = useState(null)

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state)
  }, [state])

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const value = {
    state,
    setState,
    updateState,
    scanSession,
    setScanSession,
    activeTimer,
    setActiveTimer,
  }

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return clone(defaultState)

    const parsed = JSON.parse(raw)
    const tasks = (parsed.tasks || []).map(task => ({
      ...task,
      lastDottedOn: task.lastDottedOn || null,
    }))

    const guide = parsed.guide
      ? { ...clone(defaultState.guide), ...parsed.guide }
      : clone(defaultState.guide)

    // Migration: create list entries for existing tasks if they don't exist
    let listEntries = parsed.listEntries || []
    if (listEntries.length === 0 && tasks.length > 0) {
      // Migrate: create list entries for all active tasks
      listEntries = tasks
        .filter(task => task.status === 'active')
        .map(task => createListEntry(task.id))
    }

    return {
      ...clone(defaultState),
      ...parsed,
      tasks,
      listEntries,
      daily: parsed.daily || {},
      guide,
    }
  } catch (error) {
    console.warn('Unable to load saved data', error)
    return clone(defaultState)
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Unable to save state', error)
  }
}

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value))
}
