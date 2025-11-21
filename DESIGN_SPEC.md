# Resistance Zero - Technical Design Specification

**Version:** 1.0
**Last Updated:** November 21, 2025
**Status:** Production

---

## Executive Summary

Resistance Zero is a single-page React application that implements Mark Forster's Resistance Zero task management methodology. The system transforms resistance into a navigation tool, helping users identify and complete tasks by scanning their task list and marking items with zero resistance.

The application features a guided 5-mode workflow (List Building, Scanning, Action, Maintenance, Reflection), sophisticated task management including parent/child relationships, time tracking, and progressive web app (PWA) capabilities for offline usage.

**Key Characteristics:**
- **Philosophy-First Design**: Every feature supports the Resistance Zero methodology
- **Guided Workflow**: Acts as an expert coach, not a passive tool
- **Minimalist Architecture**: React + Context API, no external state libraries
- **Offline-First**: PWA with service worker caching
- **Mobile-Responsive**: Touch-optimized interface with hamburger menu
- **Zero Backend**: Client-side only with localStorage persistence

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    React Application                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         AppStateProvider (Context API)           │  │  │
│  │  │  ┌──────────────┬──────────────┬──────────────┐ │  │  │
│  │  │  │   IntroPage  │   MainApp    │   Settings   │ │  │  │
│  │  │  └──────────────┴──────────────┴──────────────┘ │  │  │
│  │  │  ┌──────────────────────────────────────────┐   │  │  │
│  │  │  │  5 Mode Components (List, Scan, etc.)    │   │  │  │
│  │  │  └──────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │  Service Worker   │  │ localStorage│  │   IndexedDB  │  │
│  │  (Cache Assets)   │  │  (State)    │  │  (Future)    │  │
│  └───────────────────┘  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Architecture

```
User Action
    ↓
Component Event Handler
    ↓
State Update (setState/updateState)
    ↓
React Context Update
    ↓
useEffect Hook Triggers
    ↓
localStorage Sync
    ↓
Component Re-render
    ↓
UI Update
```

### 1.3 Component Hierarchy

```
App.jsx (Root)
├── ThemeProvider
├── AppStateProvider (Context)
│   ├── MobileMenu
│   ├── Header (Guidance + PWA Install)
│   ├── IntroPage (Welcome Screen)
│   │   └── "Start ResZero" → begins guide
│   ├── MainApp (Mode Router)
│   │   ├── ListMode
│   │   │   ├── ListInstructions
│   │   │   └── ListAction
│   │   │       ├── Task Input
│   │   │       ├── Task List (Grouped by Day)
│   │   │       └── SplitTaskPanel (Modal)
│   │   ├── ScanMode
│   │   │   ├── ScanInstructions
│   │   │   └── ScanAction
│   │   │       ├── Scan Progress Display
│   │   │       ├── Current Task Card
│   │   │       ├── Skip/Mark Buttons
│   │   │       └── Recently Scanned Section
│   │   ├── ActionMode
│   │   │   ├── ActionInstructions
│   │   │   └── ActionAction
│   │   │       ├── Marked Tasks List
│   │   │       ├── TaskCard (Parent/Child Support)
│   │   │       └── TaskDetailView (Modal)
│   │   │           ├── Task Editing
│   │   │           ├── Timer Controls
│   │   │           ├── Metadata Fields
│   │   │           └── Action Buttons
│   │   ├── MaintenanceMode
│   │   │   ├── MaintenanceInstructions
│   │   │   └── MaintenanceAction
│   │   │       └── Archive Buttons
│   │   └── ReflectionMode
│   │       ├── ReflectionInstructions
│   │       └── ReflectionAction
│   │           ├── Daily Stats
│   │           ├── Completed Tasks
│   │           └── Archived Tasks
│   ├── GuideControls (Prev/Next Navigation)
│   ├── Footer (Metrics + Tips)
│   └── UpdateToast (Service Worker Updates)
└── Settings Modal
    ├── Theme Selector
    ├── Export/Import Data
    └── Reset Data
```

---

## 2. Technical Stack

### 2.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework with hooks |
| **Vite** | 6.0.1 | Build tool and dev server |
| **JavaScript** | ES2022 | Application language (no TypeScript) |
| **CSS** | CSS3 | Styling with custom properties |
| **localStorage** | Browser API | State persistence |
| **Service Worker** | Browser API | PWA and offline caching |

### 2.2 Development Dependencies

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 4.0.8 | Test runner |
| **React Testing Library** | 16.3.0 | Component testing |
| **@testing-library/jest-dom** | 6.9.1 | DOM matchers |
| **jsdom** | 27.2.0 | DOM environment for tests |
| **@vitejs/plugin-react** | 4.3.4 | React Fast Refresh |

### 2.3 Font & Design Assets

- **Primary Font**: Hanken Grotesk (Google Fonts)
- **Fallback Stack**: System fonts (Segoe UI, Roboto, Helvetica, Arial)
- **Icons**: SVG icons (embedded in components)
- **Manifest Icons**: 192×192, 512×512, SVG formats

### 2.4 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **PWA Features**: Service Worker, Web App Manifest, Install Prompt
- **localStorage**: Required (fallback to default state on failure)
- **JavaScript**: ES2022 features (crypto.randomUUID, structuredClone)

---

## 3. State Management

### 3.1 Context Architecture

**File:** `src/context/AppStateContext.jsx`

The application uses React Context API for global state management with localStorage persistence. No external libraries (Redux, MobX, Zustand) are used.

**Context Provider Structure:**

```javascript
<AppStateProvider>
  {children}
</AppStateProvider>
```

**Context Hook:**

```javascript
const {
  state,           // Application state object
  setState,        // Full state replacement
  updateState,     // Partial state merge
  scanSession,     // Active scan session (not persisted)
  setScanSession,  // Update scan session
  activeTimer,     // Currently running timer (not persisted)
  setActiveTimer   // Update active timer
} = useAppState()
```

### 3.2 State Schema

**Storage Key:** `rz-state-v1`

```javascript
{
  // Task Management
  tasks: Task[],              // All tasks (active, completed, archived)
  listEntries: ListEntry[],   // Task appearances in the list

  // User Settings
  settings: {
    scanDirection: 'forward' | 'backward',
    guideMode: boolean,
    splitPreference: 'replace' | 'keep' | 'archive',
    inheritNotesOnSplit: boolean,
    theme: 'auto' | 'light' | 'dark'
  },

  // Metrics
  metrics: {
    totalScans: number,
    dottedToday: number
  },

  // Daily Statistics
  daily: {
    'YYYY-MM-DD': {
      scans: number,
      marks: number,
      minutes: number
    }
  },

  // UI State
  tipsIndex: number,           // Current coaching tip index
  guide: {
    started: boolean,          // Whether guided workflow has begun
    activeIndex: number        // Current step (0-11)
  }
}
```

### 3.3 Non-Persisted State

These state values exist in memory only and reset on page reload:

- **scanSession**: Current scanning session data
- **activeTimer**: Currently running task timer with setInterval ID

### 3.4 State Persistence

**Save Trigger:**
```javascript
useEffect(() => {
  saveState(state)
}, [state])
```

**Save Function:**
```javascript
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Unable to save state', error)
  }
}
```

**Load Function:**
```javascript
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = JSON.parse(raw)

  // Merge with defaults to handle schema evolution
  return {
    ...defaultState,
    ...parsed,
    settings: { ...defaultState.settings, ...parsed.settings }
  }
}
```

### 3.5 State Migration

**Migration Logic:**
- Automatically creates `listEntries` for existing tasks if missing
- Merges new settings fields with defaults
- Adds missing task properties (tags, childIds, isCollapsed)
- Preserves backward compatibility with older state versions

---

## 4. Data Models

### 4.1 Task Object

**File:** `src/utils/taskUtils.js`

```javascript
{
  // Identity
  id: string,                    // UUID

  // Core Properties
  text: string,                  // Task description
  status: 'active' | 'completed' | 'archived' | 'replaced',

  // Resistance Zero Properties
  resistance: number | null,     // 0-10 scale (optional)
  level: 'project' | 'step' | 'meta' | 'unspecified',
  marked: boolean,               // Zero-resistance marker
  lastMarkedOn: string | null,   // 'YYYY-MM-DD'

  // Metadata
  notes: string,                 // Additional details
  tags: string[],                // Lightweight labels

  // Tracking Metrics
  touches: number,               // Total interactions
  scanCount: number,             // Times scanned
  markedCount: number,           // Times marked
  reentries: number,             // Times re-entered

  // Timestamps
  createdAt: number,             // Unix timestamp
  updatedAt: number,             // Unix timestamp
  completedAt: number | null,    // Unix timestamp
  archivedAt: number | null,     // Unix timestamp

  // Activity Logs
  timeLogs: TimeLog[],           // Time tracking sessions
  touchLogs: TouchLog[],         // Interaction history

  // Hierarchy (Parent/Child)
  parentId: string | null,       // Parent task ID
  childIds: string[],            // Child task IDs
  isCollapsed: boolean,          // UI state for parents

  // Deprecated (kept for migration)
  subtasks: [],                  // Legacy field (unused)
}
```

### 4.2 List Entry Object

Represents an appearance of a task in the work list. Tasks can have multiple entries when re-entered.

```javascript
{
  id: string,                    // UUID
  taskId: string,                // Reference to task
  createdAt: number,             // When added to list
  actionedAt: number | null,     // When completed/re-entered
  status: 'active' | 'actioned'  // Entry status
}
```

### 4.3 Time Log Object

Records time spent on a task in a single session.

```javascript
{
  id: string,                    // UUID
  startedAt: number,             // Unix timestamp
  endedAt: number | null,        // Unix timestamp (null if running)
  duration: number | null,       // Milliseconds (null if running)
  notes: string                  // Optional session notes
}
```

### 4.4 Touch Log Object

Records interactions with a task for resistance tracking.

```javascript
{
  timestamp: number,             // Unix timestamp
  context: 'scan' | 'action' | 'list',
  action: string | null,         // Specific action taken
  touchNumber: number            // Sequential touch count
}
```

### 4.5 Scan Session Object

Manages the active scanning session (not persisted).

```javascript
{
  order: string[],               // Array of task IDs in scan order
  index: number,                 // Current position
  startedAt: number,             // Session start timestamp
  recentTasks: RecentTask[]      // Last 10 scanned tasks
}
```

**Recent Task Entry:**
```javascript
{
  taskId: string,
  entryId: string,
  index: number,
  marked: boolean
}
```

### 4.6 Daily Stats Object

Statistics for a specific day.

```javascript
{
  scans: number,                 // Scan sessions started
  marks: number,                 // Tasks marked
  minutes: number                // Time logged (from timers)
}
```

---

## 5. Core Features & Workflows

### 5.1 Guided Workflow System

The application implements a 11-step guided workflow that teaches users the Resistance Zero methodology.

**Guide Steps:**

| Index | Mode | Component | Purpose |
|-------|------|-----------|---------|
| 0 | Intro | (IntroPage) | Welcome screen |
| 1 | List | Instructions | Explain list building |
| 2 | List | Action | Add tasks to list |
| 3 | Scan | Instructions | Explain scanning |
| 4 | Scan | Action | Perform scan session |
| 5 | Action | Instructions | Explain taking action |
| 6 | Action | Action | Work on marked tasks |
| 7 | Maintenance | Instructions | Explain maintenance |
| 8 | Maintenance | Action | Archive stale tasks |
| 9 | Reflection | Instructions | Explain reflection |
| 10 | Reflection | Action | Review progress |

**Navigation Rules:**

1. **Instructions → Action**: Button click advances
2. **Action → Next Mode**: Button click advances (with validation)
3. **Last Step → First Step**: "Start New Cycle" button
4. **Validation**: Cannot advance from List mode with 0 tasks

**Implementation:**

```javascript
// MainApp.jsx
const guideIndex = state.guide.activeIndex

if (guideIndex === 1) return <ListInstructions />
if (guideIndex === 2) return <ListAction />
if (guideIndex === 3) return <ScanInstructions />
// ... etc
```

### 5.2 List Entry System

**Concept:** Tasks can appear in the list multiple times through re-entry. Each appearance is tracked separately.

**Workflow:**

1. **Create Task**: `createTask()` → creates task object
2. **Add to List**: `createListEntry(taskId)` → creates active entry
3. **Take Action**: Mark entry as `actioned` when completed/re-entered
4. **Re-entry**: Create new entry at end of list

**Benefits:**

- Tracks task appearances over time
- Supports "clumping effect" (repeated tasks cluster)
- Enables day-based grouping in List Mode
- Preserves history without duplicating task data

**Key Functions:**

```javascript
// Create entry
const entry = createListEntry(taskId)

// Mark as actioned
const actionedEntry = markEntryActioned(entry)

// Get active entries
const activeEntries = getActiveEntries(state.listEntries)

// Group by day
const grouped = getEntriesByDay(state.listEntries, state.tasks)
```

### 5.3 Task Splitting System

**Purpose:** Break large/ambiguous tasks into smaller actionable pieces without losing momentum.

**Three Split Modes:**

#### Replace Mode (Default)
- Parent task status → `'replaced'`
- Parent archived with timestamp
- Children replace parent in list
- Parent list entries marked `actioned`
- Children get new list entries
- **Best for:** Ambiguous tasks that need clarification

#### Keep Mode
- Parent becomes project container
- Parent level → `'project'`
- Children get `parentId = parent.id`
- Parent gets `childIds` array
- Parent stays in list until all children complete
- Supports collapse/expand
- **Best for:** True project/subtask relationships

#### Archive Mode
- Parent status → `'archived'`
- Parent archived with timestamp
- Children added to list
- Parent entries marked `actioned`
- **Best for:** Replacing obsolete tasks

**Metadata Inheritance:**

```javascript
childTask = {
  tags: [...parentTask.tags],              // Copy all tags
  resistance: parentTask.resistance,       // Inherit resistance
  level: parentTask.level === 'project' ? 'step' : parentTask.level,
  notes: inheritNotes ? parentTask.notes : '',
  parentId: mode === 'keep' ? parentTask.id : null
}
```

**UI Flow:**

1. Click "✂️ Split" button
2. Modal opens with textarea (auto-focused)
3. Enter subtasks (one per line)
4. Choose split mode
5. Toggle "Inherit notes" if desired
6. Click "Split Task"
7. Modal closes, children appear in list

**Performance Target:** <2 seconds from click to completion

### 5.4 Parent/Child Task System

**Visual Indicators:**

- **Parent Tasks**: Show completion count "X/Y completed"
- **Parent Tasks**: Collapse/expand button (▼ / ▶)
- **Child Tasks**: Visual indentation via CSS class
- **Completion Prompt**: "Complete parent task?" when all children done

**Completion Behavior:**

```javascript
// Check if all children complete
const allComplete = areAllChildrenComplete(parentId, tasks)

if (allComplete) {
  // Show prompt to complete parent
  <button onClick={completeParent}>Complete parent task?</button>
}
```

**Collapse/Expand:**

```javascript
// Toggle collapsed state
const updatedTask = toggleCollapse(task)

// Get visible tasks (hide children of collapsed parents)
const visibleTasks = getVisibleTasks(tasks)
```

### 5.5 Time Tracking System

**Features:**

- Start/Stop timer on individual tasks
- Live timer display (updates every second)
- Multiple sessions per task
- Session notes
- Total time calculation
- Minutes logged to daily stats

**Data Flow:**

```javascript
// Start timer
startTaskTimer(task) → creates time log with endedAt: null

// Stop timer
stopTaskTimer(task, notes) → sets endedAt, calculates duration

// Get current time
getCurrentSessionTime(task) → Date.now() - startedAt

// Get total time
getTotalTaskTime(task) → sum of all log durations

// Format duration
formatDuration(milliseconds) → "2h 15m" or "45m 30s"
```

**Daily Stats Integration:**

When timer stops:
```javascript
const duration = activeTimer.duration
const minutes = Math.floor(duration / 60000)
addMinutesToDaily(state.daily, minutes)
```

### 5.6 Tagging System

**Characteristics:**

- Lightweight labels (not categories)
- Multiple tags per task
- No hierarchy or filtering (yet)
- Display only (organization aid)

**Use Cases:**

- Project names ("Acme Redesign")
- Contexts ("@office", "@home")
- Client names ("ClientA", "ClientB")
- Categories ("writing", "coding", "admin")

**Implementation:**

```javascript
// Task object
task.tags = ['project-alpha', '@office', 'urgent']

// Display
task.tags.map(tag => (
  <span className="tag">{tag}</span>
))

// Add tag
task.tags.push(newTag)

// Remove tag
task.tags = task.tags.filter(t => t !== tagToRemove)
```

### 5.7 Resistance Tracking

**Concept:** Each scan automatically reduces resistance, making tasks more actionable over time.

**Implementation:**

```javascript
function touchTask(task, context, action) {
  task.touches += 1

  if (context === 'scan') {
    task.scanCount += 1
  }

  // Auto-decrement resistance
  if (typeof task.resistance === 'number' && task.resistance > 0) {
    task.resistance = Math.max(0, task.resistance - 1)
  }

  // Log the touch
  task.touchLogs.push({
    timestamp: Date.now(),
    context,
    action,
    touchNumber: task.touches
  })

  return task
}
```

**Coaching Messages:**

- "You've touched this task 3 times — resistance is dropping."
- "This task has been scanned 5 times."
- "Re-entry is expected, not failure."

---

## 6. Mode-by-Mode Documentation

### 6.1 List Building Mode

**Purpose:** Capture all tasks in a flat, uncategorized list.

**Philosophy:**
- Brain dump without structure
- No priorities, categories, or deadlines
- Get everything out of your head
- List can be any size

**Components:**

#### ListInstructions
- Explains list building philosophy
- "Start List Building" button to advance

#### ListAction
- **Quick-Add Input**: Enter key to add tasks
- **Task List**: Grouped by day (Today, Yesterday, dates)
- **Split Button**: ✂️ icon on each task
- **Tag Display**: Shows tags inline with task text
- **Entry Status**: Visual indicator for actioned entries

**UI Elements:**

```javascript
<input
  type="text"
  placeholder="Add a task..."
  onKeyDown={e => {
    if (e.key === 'Enter') {
      const task = createTask({ text: e.target.value })
      const entry = createListEntry(task.id)
      // Add to state
    }
  }}
/>
```

**Grouped Display:**

```javascript
const grouped = getEntriesByDay(state.listEntries, state.tasks)

grouped.map(group => (
  <section>
    <h3>{formatDate(group.day)}</h3>
    {group.entries.map(({ entry, task }) => (
      <TaskCard task={task} entry={entry} />
    ))}
  </section>
))
```

**Validation:**

- Cannot advance to Scan mode with 0 active entries

### 6.2 Scanning Mode

**Purpose:** Reduce resistance and surface actionable tasks through full-list scanning.

**Philosophy:**
- Scan entire list in one direction
- Mark tasks with zero resistance (feel effortless)
- Quick intuitive passes (no overthinking)
- Each scan reduces resistance
- Direction consistency matters

**Components:**

#### ScanInstructions
- Explains scanning process
- Emphasizes direction consistency
- "Start Scanning" button to advance

#### ScanAction

**Pre-Scan State:**
- "Begin" button to start session
- Button disabled if no active entries

**During Scan:**
- **Progress Display**: "Task X of Y"
- **Current Task**: Text, level, tags displayed
- **Action Buttons**:
  - "Skip" → Mark as touched, move to next
  - "Mark" → Mark as zero-resistance, move to next
- **Recent Tasks**: Last 10 scanned (clickable to toggle mark)

**Scan Session Management:**

```javascript
// Start session
const order = getActiveEntries(state.listEntries).map(e => e.taskId)
setScanSession({
  order,
  index: 0,
  startedAt: Date.now(),
  recentTasks: []
})

// Increment daily scans
incrementDailyStat(state.daily, 'scans')

// On Skip
touchTask(currentTask, 'scan', 'skip')
setScanSession({ ...session, index: index + 1 })

// On Mark
touchTask(currentTask, 'scan', 'mark')
markTaskMarked(currentTask)
incrementDailyStat(state.daily, 'marks')
setScanSession({
  ...session,
  index: index + 1,
  recentTasks: [{ taskId, entryId, index, marked: true }, ...recent]
})

// Session complete
if (index === order.length - 1) {
  setScanSession(null)
}
```

**Touch Tracking:**

Every task touched during scan:
- `touches` incremented
- `scanCount` incremented
- `resistance` decremented by 1 (if numeric)
- Touch log entry added

### 6.3 Action Mode

**Purpose:** Take action on marked tasks, working "little and often."

**Philosophy:**
- Focus on marked (zero-resistance) tasks only
- Even 2 minutes of progress counts
- Re-entry is expected for incomplete tasks
- Completion is optional per action
- Start timers for billing/productivity tracking

**Components:**

#### ActionInstructions
- Explains action philosophy
- Encourages small steps
- "Start Taking Action" button to advance

#### ActionAction

**Main View:**
- Shows all marked tasks (`marked: true`, `status: 'active'`)
- Parent/child support with collapse/expand
- Each task card displays:
  - Task text
  - Timer indicator (⏱️ if running)
  - "More" button → Opens detail modal
  - "✂️ Split" button → Opens split panel
  - "Re-enter" button → Re-enters task
  - "Complete" button → Completes task

**TaskDetailView Modal:**

Comprehensive task editing interface:

1. **Task Text**: Editable textarea
2. **Optional Details**:
   - Resistance slider (0-10)
   - Level dropdown (unspecified/project/step/meta)
   - Tags input (add/remove chips)
   - Notes textarea
3. **Time Tracking**:
   - Start/Stop timer button
   - Current session time or total time display
   - Session count
4. **Activity Metrics**:
   - Touches count
   - Scans count
   - Re-entries count
   - Marked count
5. **Action Buttons**:
   - Split Task
   - Re-enter Task
   - Complete Task

**Re-entry Workflow:**

```javascript
function reenterTask(task) {
  // Stop timer if running
  if (hasActiveTimer(task)) {
    stopTaskTimer(task)
    const minutes = Math.floor(duration / 60000)
    addMinutesToDaily(state.daily, minutes)
  }

  // Unmark task
  clearTaskMark(task)

  // Increment reentry counter
  task.reentries += 1

  // Mark current list entry as actioned
  const activeEntry = state.listEntries.find(e =>
    e.taskId === task.id && e.status === 'active'
  )
  markEntryActioned(activeEntry)

  // Create new entry at end of list
  const newEntry = createListEntry(task.id)
  state.listEntries.push(newEntry)
}
```

**Complete Workflow:**

```javascript
function completeTask(task) {
  // Stop timer if running
  if (hasActiveTimer(task)) {
    stopTaskTimer(task)
    addMinutesToDaily(state.daily, minutes)
  }

  // Update task status
  task.status = 'completed'
  task.completedAt = Date.now()
  task.marked = false

  // Mark all list entries as actioned
  state.listEntries.forEach(entry => {
    if (entry.taskId === task.id && entry.status === 'active') {
      markEntryActioned(entry)
    }
  })
}
```

**Parent Task Completion:**

```javascript
if (areAllChildrenComplete(task.id, state.tasks)) {
  <div className="complete-parent-prompt">
    <p>All child tasks are complete!</p>
    <button onClick={() => completeTask(task)}>
      Complete parent task?
    </button>
  </div>
}
```

### 6.4 Maintenance Mode

**Purpose:** Keep list clean by archiving stale/irrelevant tasks.

**Philosophy:**
- Some tasks naturally "stand out" for deletion
- Archive preserves history for reflection
- Simple one-button workflow
- No restore functionality (intentional)

**Components:**

#### MaintenanceInstructions
- Explains maintenance philosophy
- Encourages trusting intuition
- "Start Maintenance" button to advance

#### MaintenanceAction

**Display:**
- Shows all active tasks with active list entries
- Single "Archive" button per task
- No additional actions

**Archive Workflow:**

```javascript
function archiveTask(task) {
  // Update task status
  task.status = 'archived'
  task.archivedAt = Date.now()
  task.marked = false

  // Remove all list entries
  state.listEntries = state.listEntries.filter(e =>
    e.taskId !== task.id
  )
}
```

### 6.5 Reflection Mode

**Purpose:** Notice progress and patterns without overthinking.

**Philosophy:**
- Celebrate wins
- Observe clumping and resistance trends
- Minimal analysis to avoid perfectionism
- Review time spent for billing/productivity

**Components:**

#### ReflectionInstructions
- Explains reflection philosophy
- Encourages noticing patterns
- "Start Reflection" button to advance

#### ReflectionAction

**Displays:**

1. **Daily Stats** (Today):
   ```javascript
   const todayKey = getTodayKey()
   const todayStats = state.daily[todayKey] || { scans: 0, marks: 0, minutes: 0 }

   <section>
     <h3>Today's Activity</h3>
     <p>Scans: {todayStats.scans}</p>
     <p>Tasks Marked: {todayStats.marks}</p>
     <p>Minutes Logged: {Math.round(todayStats.minutes)}</p>
   </section>
   ```

2. **Completed Tasks**:
   ```javascript
   const completed = state.tasks.filter(t => t.status === 'completed')

   completed.map(task => (
     <article>
       <p>{task.text}</p>
       <small>{new Date(task.completedAt).toLocaleDateString()}</small>
     </article>
   ))
   ```

3. **Archived Tasks**:
   ```javascript
   const archived = state.tasks.filter(t => t.status === 'archived')

   archived.map(task => (
     <article>
       <p>{task.text}</p>
       <small>{new Date(task.archivedAt).toLocaleDateString()}</small>
     </article>
   ))
   ```

**Coaching Prompts:**
- "Notice how resistance dropped on these tasks over time."
- "This type of task tends to cluster together."
- "You completed X tasks this week!"

---

## 7. Progressive Web App (PWA)

### 7.1 Manifest Configuration

**File:** `public/manifest.json`

```json
{
  "name": "Resistance Zero",
  "short_name": "ResZero",
  "description": "Task management using the Resistance Zero methodology",
  "start_url": "/re-zero/index.html",
  "display": "standalone",
  "theme_color": "#2563eb",
  "background_color": "#0f172a",
  "icons": [
    {
      "src": "/re-zero/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/re-zero/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/re-zero/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

### 7.2 Service Worker

**File:** `public/service-worker.js`

**Features:**

1. **Cache Versioning**: Build-time injection of git commit hash
2. **Install Event**: Pre-cache core assets
3. **Fetch Event**: Network-first with cache fallback
4. **Activate Event**: Clean up old caches
5. **Update Notification**: PostMessage to clients

**Cache Strategy:**

```javascript
// Install: Pre-cache assets
const CACHE_NAME = `rz-cache-${BUILD_VERSION}`
const urlsToCache = [
  '/re-zero/',
  '/re-zero/index.html',
  '/re-zero/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

// Fetch: Network first, then cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const cloned = response.clone()
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, cloned)
        })
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Activate: Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    })
  )
})
```

**Update Notification:**

```javascript
// Service Worker
self.addEventListener('activate', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'UPDATE_AVAILABLE' })
    })
  })
})

// UpdateToast.jsx
useEffect(() => {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'UPDATE_AVAILABLE') {
      setShowUpdate(true)
    }
  })
}, [])
```

### 7.3 Install Prompt

**File:** `src/components/Header.jsx`

```javascript
const [deferredPrompt, setDeferredPrompt] = useState(null)

useEffect(() => {
  const handler = e => {
    e.preventDefault()
    setDeferredPrompt(e)
  }

  window.addEventListener('beforeinstallprompt', handler)
  return () => window.removeEventListener('beforeinstallprompt', handler)
}, [])

const handleInstall = async () => {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const result = await deferredPrompt.userChoice

  if (result.outcome === 'accepted') {
    setDeferredPrompt(null)
  }
}

return (
  deferredPrompt && (
    <button onClick={handleInstall}>Install App</button>
  )
)
```

---

## 8. UI/UX Design System

### 8.1 Theme System

**Three Modes:**
- **Auto**: Respects `prefers-color-scheme`
- **Light**: Force light theme
- **Dark**: Force dark theme

**Implementation:**

```javascript
// App.jsx
function ThemeProvider({ children }) {
  const { state } = useAppState()

  useEffect(() => {
    const root = document.documentElement

    if (state.settings.theme === 'auto') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', state.settings.theme)
    }
  }, [state.settings.theme])

  return children
}
```

**CSS:**

```css
/* Default (Light) */
:root {
  --bg: #fafaf9;
  --text: #1c1917;
  --primary: #6366f1;
}

/* Dark Theme */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --bg: #1c1917;
    --text: #fafaf9;
    --primary: #818cf8;
  }
}

/* Force Dark */
[data-theme="dark"] {
  --bg: #1c1917;
  --text: #fafaf9;
  --primary: #818cf8;
}

/* Force Light */
[data-theme="light"] {
  --bg: #fafaf9;
  --text: #1c1917;
  --primary: #6366f1;
}
```

### 8.2 Color System

**Light Theme (Stone Palette):**
```css
--bg: #fafaf9;           /* stone-50 */
--surface: #ffffff;       /* white */
--border: #e7e5e4;       /* stone-200 */
--primary: #6366f1;      /* indigo-500 */
--accent: #8b5cf6;       /* purple-500 */
--danger: #ef4444;       /* red-500 */
--text: #1c1917;         /* stone-900 */
--text-secondary: #57534e; /* stone-600 */
```

**Dark Theme:**
```css
--bg: #1c1917;           /* stone-900 */
--surface: #292524;      /* stone-800 */
--border: #44403c;       /* stone-700 */
--primary: #818cf8;      /* indigo-400 */
--accent: #a78bfa;       /* purple-400 */
--danger: #f87171;       /* red-400 */
--text: #fafaf9;         /* stone-50 */
--text-secondary: #d6d3d1; /* stone-300 */
```

### 8.3 Typography

**Font Family:**
```css
body {
  font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont,
               'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

**Scale:**
- Base: 16px
- Small: 14px
- Large: 18px
- Heading: 24px, 20px, 18px

### 8.4 Spacing System

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
```

### 8.5 Shadow System

```css
/* Light Theme */
--shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

/* Dark Theme */
--shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
```

### 8.6 Responsive Design

**Breakpoints:**
```css
--mobile: 0-640px
--tablet: 641px-1024px
--desktop: 1025px+
```

**Mobile-First Approach:**
```css
.container {
  padding: 1rem;
}

@media (min-width: 641px) {
  .container {
    padding: 2rem;
  }
}

@media (min-width: 1025px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

**Touch Targets:**
- Minimum: 44×44px
- Buttons: 48px height
- Icons: 24×24px clickable area

---

## 9. Testing Strategy

### 9.1 Test Configuration

**File:** `vitest.config.js`

```javascript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  }
})
```

**Setup File:** `src/test/setup.js`

```javascript
import '@testing-library/jest-dom'
```

### 9.2 Test Coverage

**Utility Tests:**

1. **taskUtils.test.js**
   - Task creation
   - Task splitting (all modes)
   - Parent/child relationships
   - Collapse/expand
   - Metadata inheritance
   - Completion checks

2. **dailyStats.test.js**
   - Today key generation
   - Stat incrementing
   - Minutes tracking

**Component Tests:**

1. **SplitTaskPanel.test.jsx**
   - Modal rendering
   - Text input
   - Split mode selection
   - Inherit notes toggle
   - Submit functionality

2. **ReflectionMode.test.jsx**
   - Daily stats display
   - Zero stats fallback
   - Completed tasks list
   - Archived tasks list

### 9.3 Test Patterns

**Component Test Example:**

```javascript
import { render, screen } from '@testing-library/react'
import { AppStateProvider } from '../context/AppStateContext'
import ReflectionAction from '../components/modes/ReflectionMode'

test('displays daily stats', () => {
  const testState = {
    daily: {
      '2025-11-21': { scans: 5, marks: 10, minutes: 45 }
    },
    tasks: []
  }

  render(
    <AppStateProvider initialState={testState}>
      <ReflectionAction />
    </AppStateProvider>
  )

  expect(screen.getByText(/5/)).toBeInTheDocument()
  expect(screen.getByText(/10/)).toBeInTheDocument()
  expect(screen.getByText(/45/)).toBeInTheDocument()
})
```

**Utility Test Example:**

```javascript
import { splitTask, createTask } from '../utils/taskUtils'

test('replace mode archives parent', () => {
  const parent = createTask({ text: 'Big task' })
  const { parentTask, childTasks } = splitTask(
    parent,
    ['Subtask 1', 'Subtask 2'],
    { mode: 'replace' }
  )

  expect(parentTask.status).toBe('replaced')
  expect(parentTask.archivedAt).toBeTruthy()
  expect(childTasks).toHaveLength(2)
})
```

### 9.4 Running Tests

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

---

## 10. Build & Deployment

### 10.1 Build Configuration

**File:** `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const gitCommit = execSync('git rev-parse --short HEAD')
  .toString()
  .trim()

export default defineConfig({
  plugins: [react()],
  base: '/re-zero/',
  define: {
    __GIT_COMMIT__: JSON.stringify(gitCommit)
  }
})
```

### 10.2 Build Process

**Command:** `npm run build`

**Steps:**

1. **Vite Build**:
   - Bundles React application
   - Injects `__GIT_COMMIT__` constant
   - Outputs to `dist/` directory
   - Hashes asset filenames

2. **Service Worker Injection**:
   ```javascript
   // scripts/inject-sw-version.js
   const fs = require('fs')
   const path = require('path')
   const { execSync } = require('child_process')

   const commit = execSync('git rev-parse --short HEAD').toString().trim()
   const swPath = path.join(__dirname, '../dist/service-worker.js')

   let sw = fs.readFileSync(swPath, 'utf8')
   sw = sw.replace('BUILD_VERSION_PLACEHOLDER', commit)
   fs.writeFileSync(swPath, sw)

   console.log(`Service worker version: ${commit}`)
   ```

### 10.3 Deployment

**Target:** GitHub Pages

**Workflow:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Deployment URL:** `https://jnyinglis.github.io/re-zero/`

### 10.4 Version Display

**Footer Component:**

```javascript
const gitCommit = typeof __GIT_COMMIT__ !== 'undefined'
  ? __GIT_COMMIT__
  : 'dev'

return (
  <footer>
    <small>Version: {gitCommit}</small>
  </footer>
)
```

---

## 11. Performance Optimizations

### 11.1 React Optimizations

**useCallback for Stable References:**

```javascript
const updateState = useCallback((updates) => {
  setState(prev => ({ ...prev, ...updates }))
}, [])
```

**Conditional Rendering:**

```javascript
{state.guide.started && <Footer />}
{!state.guide.started && <Header />}
```

**Lazy State Initialization:**

```javascript
const [state, setState] = useState(() => loadState())
```

### 11.2 Vite Optimizations

- Fast Hot Module Replacement (HMR)
- Tree-shaking for unused code
- Code splitting (automatic)
- Asset optimization (images, CSS)
- Hashed filenames for cache busting

### 11.3 Service Worker Caching

- Pre-cache critical assets on install
- Network-first for dynamic content
- Cache-first for static assets
- Automatic cleanup of old caches

### 11.4 localStorage Strategy

- Single useEffect for all state changes
- JSON serialization
- Graceful fallback on errors
- No debouncing needed (writes are fast)

---

## 12. Accessibility

### 12.1 Semantic HTML

```html
<main>
  <section>
    <h2>List Building</h2>
    <article class="task-card">...</article>
  </section>
</main>
```

### 12.2 ARIA Labels

```javascript
<button aria-label="Split task">✂️</button>
<button aria-label="Start timer">⏱️</button>
<div role="status" aria-live="polite">
  {updateMessage}
</div>
```

### 12.3 Keyboard Navigation

- Tab order follows visual order
- Enter key to submit forms
- Escape key to close modals
- Focus management in modals

### 12.4 Visual Accessibility

- High contrast colors (4.5:1 minimum)
- Clear focus indicators
- Readable font sizes (16px base)
- Touch-friendly targets (44×44px)

---

## 13. Future Enhancements

### 13.1 Planned Features

1. **Tag Filtering**
   - Filter list by tag in List/Reflection modes
   - Preserve flat list philosophy
   - Optional feature (hidden by default)

2. **Tag-Based Reports**
   - Time spent per tag
   - Completion rates per tag
   - Export to CSV/PDF

3. **Calendar Integration**
   - Sync with Google Calendar / Apple Calendar
   - Time-based tasks separate from list
   - One-way sync (calendar → app)

4. **Analytics Dashboard**
   - Resistance trends over time
   - Forward vs backward scan efficiency
   - Completion patterns
   - Re-entry frequency

5. **Cloud Sync**
   - Optional account creation
   - Multi-device synchronization
   - End-to-end encryption
   - Offline-first with conflict resolution

6. **AI Coaching**
   - Personalized task splitting suggestions
   - Resistance pattern recognition
   - Optimal scan timing recommendations

7. **Export Options**
   - CSV export with all metadata
   - PDF reports for billing
   - Markdown export for archives

### 13.2 Architecture for Future Features

**API Layer (Future):**

```javascript
// services/api.js
export async function syncTasks(tasks) {
  const response = await fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify(tasks)
  })
  return response.json()
}
```

**Modular Feature Flags:**

```javascript
const features = {
  tagFiltering: false,
  cloudSync: false,
  aiCoaching: false
}

{features.tagFiltering && <TagFilter />}
```

---

## 14. Security & Privacy

### 14.1 Data Storage

- **Client-Side Only**: No server, no database
- **localStorage**: Plain text (not sensitive data)
- **No Tracking**: No analytics, no telemetry
- **No Cookies**: No third-party cookies

### 14.2 Future Considerations

If cloud sync is added:
- End-to-end encryption
- Zero-knowledge architecture
- GDPR compliance
- Data export/deletion

---

## 15. Appendix

### 15.1 File Structure

```
re-zero/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon.svg
├── src/
│   ├── components/
│   │   ├── modes/
│   │   │   ├── ListMode.jsx
│   │   │   ├── ScanMode.jsx
│   │   │   ├── ActionMode.jsx
│   │   │   ├── MaintenanceMode.jsx
│   │   │   └── ReflectionMode.jsx
│   │   ├── Footer.jsx
│   │   ├── GuideControls.jsx
│   │   ├── Header.jsx
│   │   ├── IntroPage.jsx
│   │   ├── MainApp.jsx
│   │   ├── MobileMenu.jsx
│   │   ├── Settings.jsx
│   │   ├── SplitTaskPanel.jsx
│   │   ├── TaskCard.jsx
│   │   └── UpdateToast.jsx
│   ├── context/
│   │   └── AppStateContext.jsx
│   ├── test/
│   │   └── setup.js
│   ├── utils/
│   │   ├── dailyStats.js
│   │   ├── dailyStats.test.js
│   │   ├── taskUtils.js
│   │   └── taskUtils.test.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── scripts/
│   └── inject-sw-version.js
├── .github/
│   └── workflows/
│       └── deploy.yml
├── CLAUDE.md
├── PRD.md
├── DESIGN_SPEC.md (this file)
├── package.json
├── vite.config.js
├── vitest.config.js
└── README.md
```

### 15.2 Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^27.2.0",
    "vite": "^6.0.1",
    "vitest": "^4.0.8"
  }
}
```

### 15.3 Browser APIs Used

- **localStorage**: State persistence
- **Service Worker**: PWA caching and updates
- **Web App Manifest**: PWA installation
- **beforeinstallprompt**: Install prompt
- **crypto.randomUUID**: UUID generation
- **structuredClone**: Deep cloning
- **prefers-color-scheme**: Theme detection

### 15.4 Coding Conventions

**JavaScript:**
- ES2022 features
- Arrow functions preferred
- Destructuring where appropriate
- Template literals for strings
- Optional chaining (`?.`)
- Nullish coalescing (`??`)

**React:**
- Functional components only
- Hooks (useState, useEffect, useCallback, useContext)
- Props destructuring
- JSX fragments `<>...</>`
- Conditional rendering with `&&`

**CSS:**
- Custom properties (CSS variables)
- Mobile-first media queries
- BEM-inspired class names
- Semantic selectors

**File Naming:**
- Components: PascalCase (e.g., `TaskCard.jsx`)
- Utilities: camelCase (e.g., `taskUtils.js`)
- Tests: `.test.js` or `.test.jsx` suffix
- Styles: `styles.css` (single file)

---

## 16. Glossary

**Active Entry**: A list entry that hasn't been actioned yet
**Actioned**: A list entry that has been completed or re-entered
**Archive**: Permanently remove task from active work (preserved for reflection)
**Child Task**: A task created from splitting, with a parentId
**Clumping**: Pattern where re-entered tasks naturally cluster together
**Completed**: Task finished and won't return to list
**Entry**: An appearance of a task in the work list
**Level**: Task categorization (project/step/meta/unspecified)
**List Entry**: A record of a task appearing in the work list
**Marked**: Task identified as having zero resistance
**Parent Task**: A task that has been split into children
**Re-entry**: Moving an incomplete task to the end of the list
**Replace Mode**: Split mode that archives parent and shows only children
**Keep Mode**: Split mode that keeps parent as container with children
**Archive Mode**: Split mode that archives parent separately from children
**Resistance**: Psychological friction felt toward a task (0-10 scale)
**Scan**: Full pass through task list to identify zero-resistance items
**Split**: Break a task into smaller subtasks
**Tag**: Lightweight label for task organization
**Time Log**: Record of time spent on a task in one session
**Touch**: Any interaction with a task (scan, action, etc.)
**Touch Log**: Historical record of task interactions
**Zero Resistance**: State where task feels effortless to start

---

**Document End**
