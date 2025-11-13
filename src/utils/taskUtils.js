export function createTask({ text, resistance, level, notes, parentId = null }) {
  const now = Date.now()
  return {
    id: randomId(),
    text,
    resistance,
    level,
    notes,
    tags: [],
    marked: false,
    lastMarkedOn: null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    touches: 0,
    scanCount: 0,
    markedCount: 0,
    reentries: 0,
    completedAt: null,
    archivedAt: null,
    timeLogs: [],
    touchLogs: [],
    parentId,
    subtasks: [],
    childIds: [],
    isCollapsed: false,
  }
}

export function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).slice(2, 10)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function touchTask(task, context, action = null) {
  const now = Date.now()

  if (!task.touchLogs) {
    task.touchLogs = []
  }

  task.touches += 1
  task.updatedAt = now

  task.touchLogs.push({
    timestamp: now,
    context,
    action,
    touchNumber: task.touches
  })

  if (context === 'scan') {
    task.scanCount += 1
  }

  if (typeof task.resistance === 'number' && task.resistance > 0) {
    task.resistance = Math.max(0, task.resistance - 1)
  }

  return task
}

export function markTaskMarked(task, daily, bumpDaily) {
  if (!task || task.marked) return task

  task.marked = true
  task.lastMarkedOn = today()
  task.markedCount = (task.markedCount || 0) + 1
  bumpDaily(task.lastMarkedOn, 'marks', 1)

  return task
}

export function clearTaskMark(task, daily, bumpDaily) {
  if (!task || !task.marked) return task

  const markedDay = task.lastMarkedOn
  task.marked = false
  task.lastMarkedOn = null

  if (markedDay === today()) {
    bumpDaily(today(), 'marks', -1)
  }

  return task
}

export function createListEntry(taskId) {
  const now = Date.now()
  return {
    id: randomId(),
    taskId,
    createdAt: now,
    actionedAt: null,
    status: 'active',
  }
}

export function markEntryActioned(entry) {
  return {
    ...entry,
    actionedAt: Date.now(),
    status: 'actioned',
  }
}

export function getActiveEntries(listEntries) {
  return listEntries.filter(entry => entry.status === 'active')
}

export function getEntriesByDay(listEntries, tasks) {
  // Group entries by day with task information
  const grouped = {}

  listEntries.forEach(entry => {
    const task = tasks.find(t => t.id === entry.taskId)
    if (!task) return

    const day = new Date(entry.createdAt).toISOString().slice(0, 10)
    if (!grouped[day]) {
      grouped[day] = []
    }
    grouped[day].push({ entry, task })
  })

  // Convert to sorted array
  return Object.keys(grouped)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(day => ({
      day,
      entries: grouped[day]
    }))
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dateStr = date.toISOString().slice(0, 10)
  const todayStr = today.toISOString().slice(0, 10)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (dateStr === todayStr) return 'Today'
  if (dateStr === yesterdayStr) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function startTaskTimer(task) {
  const now = Date.now()

  if (!task.timeLogs) {
    task.timeLogs = []
  }

  // Check if there's already an active timer
  const activeTimer = task.timeLogs.find(log => !log.endedAt)
  if (activeTimer) {
    return task // Already has an active timer
  }

  task.timeLogs.push({
    id: randomId(),
    startedAt: now,
    endedAt: null,
    duration: null,
    notes: ''
  })

  task.updatedAt = now

  return task
}

export function stopTaskTimer(task, notes = '') {
  const now = Date.now()

  if (!task.timeLogs) {
    return task
  }

  const activeTimer = task.timeLogs.find(log => !log.endedAt)
  if (!activeTimer) {
    return task // No active timer
  }

  activeTimer.endedAt = now
  activeTimer.duration = now - activeTimer.startedAt
  activeTimer.notes = notes

  task.updatedAt = now

  return task
}

export function getCurrentSessionTime(task) {
  if (!task.timeLogs) {
    return 0
  }

  const activeTimer = task.timeLogs.find(log => !log.endedAt)
  if (!activeTimer) {
    return 0
  }

  return Date.now() - activeTimer.startedAt
}

export function getTotalTaskTime(task) {
  if (!task.timeLogs || task.timeLogs.length === 0) {
    return 0
  }

  return task.timeLogs.reduce((total, log) => {
    if (log.duration) {
      return total + log.duration
    }
    return total
  }, 0)
}

export function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${seconds}s`
  }
}

export function hasActiveTimer(task) {
  if (!task.timeLogs) {
    return false
  }
  return task.timeLogs.some(log => !log.endedAt)
}

export function updateTaskMetadata(task, updates) {
  const now = Date.now()

  return {
    ...task,
    ...updates,
    updatedAt: now
  }
}

/**
 * Split a task into multiple smaller tasks
 * @param {object} parentTask - The task to split
 * @param {string[]} newTaskTexts - Array of text for new tasks (one per line)
 * @param {object} options - Split options
 * @param {string} options.mode - 'replace', 'keep', or 'archive'
 * @param {boolean} options.inheritNotes - Whether to copy notes to child tasks
 * @returns {object} - { parentTask, childTasks }
 */
export function splitTask(parentTask, newTaskTexts, options = {}) {
  const { mode = 'replace', inheritNotes = false } = options
  const now = Date.now()

  // Filter out empty lines
  const validTexts = newTaskTexts.filter(text => text.trim().length > 0)

  if (validTexts.length === 0) {
    return { parentTask, childTasks: [] }
  }

  // Create child tasks with inherited metadata
  const childTasks = validTexts.map(text => {
    const childTask = createTask({
      text: text.trim(),
      resistance: parentTask.resistance,
      level: parentTask.level === 'project' ? 'step' : parentTask.level,
      notes: inheritNotes ? parentTask.notes : '',
      parentId: mode === 'keep' ? parentTask.id : null
    })

    // Inherit tags
    childTask.tags = [...(parentTask.tags || [])]

    return childTask
  })

  // Get child IDs
  const childIds = childTasks.map(t => t.id)

  // Update parent based on mode
  let updatedParent = { ...parentTask, updatedAt: now }

  if (mode === 'keep') {
    // Parent becomes a container
    updatedParent.childIds = childIds
    updatedParent.level = 'project'
    updatedParent.marked = false // Unmark parent when split
  } else if (mode === 'archive') {
    // Archive the parent
    updatedParent.status = 'archived'
    updatedParent.archivedAt = now
  } else if (mode === 'replace') {
    // Parent will be removed/replaced - mark for deletion
    updatedParent.status = 'replaced'
    updatedParent.archivedAt = now
  }

  return { parentTask: updatedParent, childTasks }
}

/**
 * Check if all child tasks of a parent are complete
 * @param {string} parentId - The parent task ID
 * @param {object[]} tasks - Array of all tasks
 * @returns {boolean} - True if all children are complete
 */
export function areAllChildrenComplete(parentId, tasks) {
  const parent = tasks.find(t => t.id === parentId)
  if (!parent || !parent.childIds || parent.childIds.length === 0) {
    return false
  }

  const children = tasks.filter(t => parent.childIds.includes(t.id))
  return children.length > 0 && children.every(child => child.status === 'completed')
}

/**
 * Toggle collapse state of a parent task
 * @param {object} task - The parent task
 * @returns {object} - Updated task
 */
export function toggleCollapse(task) {
  if (!task.childIds || task.childIds.length === 0) {
    return task
  }

  return {
    ...task,
    isCollapsed: !task.isCollapsed,
    updatedAt: Date.now()
  }
}

/**
 * Get visible tasks (filtering out collapsed children)
 * @param {object[]} tasks - Array of all tasks
 * @returns {object[]} - Filtered tasks
 */
export function getVisibleTasks(tasks) {
  const collapsedParents = new Set(
    tasks
      .filter(t => t.isCollapsed && t.childIds && t.childIds.length > 0)
      .map(t => t.id)
  )

  return tasks.filter(task => {
    // Hide if parent is collapsed
    if (task.parentId && collapsedParents.has(task.parentId)) {
      return false
    }
    return true
  })
}

/**
 * Check if a task is a parent (has children)
 * @param {object} task - The task to check
 * @returns {boolean}
 */
export function isParentTask(task) {
  return task.childIds && task.childIds.length > 0
}
