export function createTask({ text, resistance, level, notes, parentId = null }) {
  const now = Date.now()
  return {
    id: randomId(),
    text,
    resistance,
    level,
    notes,
    dotted: false,
    lastDottedOn: null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    touches: 0,
    scanCount: 0,
    dottedCount: 0,
    reentries: 0,
    completedAt: null,
    archivedAt: null,
    timeLogs: [],
    touchLogs: [],
    parentId,
    subtasks: [],
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

export function markTaskDotted(task, daily, bumpDaily) {
  if (!task || task.dotted) return task

  task.dotted = true
  task.lastDottedOn = today()
  task.dottedCount = (task.dottedCount || 0) + 1
  bumpDaily(task.lastDottedOn, 'dots', 1)

  return task
}

export function clearTaskDot(task, daily, bumpDaily) {
  if (!task || !task.dotted) return task

  const dottedDay = task.lastDottedOn
  task.dotted = false
  task.lastDottedOn = null

  if (dottedDay === today()) {
    bumpDaily(today(), 'dots', -1)
  }

  return task
}
