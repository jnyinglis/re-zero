# Product Requirements Document  
**App Name:** *Resistance Zero* (working title)  
**Authoring Basis:** Mark Forster’s *Resistance Zero System* and supporting writings/comments  

---

## 1. Purpose  
The purpose of the app is to help users manage tasks by **transforming resistance into a guiding principle**. Instead of fighting procrastination, the app leverages resistance signals: tasks are scanned until some feel effortless (“zero resistance”), and those are actioned first. Repeated scanning naturally lowers resistance on avoided tasks until they become actionable【7†source】.  

The app is not just a passive list manager — it acts as an **expert guide**, providing structure, prompts, and nudges so that users experience the full benefit of the Resistance Zero method.  

---

## 2. Key Learnings from Mark Forster’s Writings  

- **Scanning Matters**: Full list scans are essential. Each scan is a “micro-assessment” that reduces resistance, even for dreaded tasks【7†source】.  
- **Scan Direction**: Mark initially favored backward scanning (end-to-start) to bring older tasks into play, but later confirmed forward scanning works too. The main rule: **pick one direction and stick with it**【7†source】.  
- **Tasks Are Flexible**: A “task” can be a full project or a tiny substep—users define their own granularity【7†source】.  
- **Resistance Falls Over Time**: Loathsome tasks eventually soften and become doable, without force【7†source】.  
- **Deletion and Evolution**: Some tasks eventually stand out for deletion (“delete me!”). This is an important part of list hygiene【7†source】.  
- **Little and Often**: Small, regular actions are more effective than large bursts【7†source】.  
- **Clumping Effect**: Re-entered/repeated tasks tend to cluster, making progress more visible【7†source】.  
- **Intuition and Flow**: The system relies on intuition over prioritization or categorization【7†source】.
- **Lightweight Organization**: While the list remains flat and uncategorized, lightweight tags can help identify related tasks (e.g., project names) without imposing rigid structure.  

---

## 3. Goals  

- Provide a **guided digital environment** for applying Resistance Zero.
- Reinforce Mark's principle that resistance itself is a navigational aid, not an enemy.
- Avoid "productivity app bloat" (rigid categorization, complex hierarchies, prioritization, gamification) that undermines intuitive scanning.
- Support **lightweight tags** for practical organization (projects, contexts) without imposing rigid structure.
- Position the app as an **expert companion** that teaches, prompts, and reinforces the process.  

---

## 4. Modes of Work & Actions  
The app guides users through a repeating cycle of five modes. Each mode has specific actions and built-in prompts.  

### 1. **List Building Mode**
Purpose: Capture everything that isn't tied to a calendar/time.
- Add tasks quickly at any level (project, step, or meta-task).
- Re-enter recurring tasks when needed.
- **Tag Visibility**: Tags (if assigned during Action Mode) are displayed alongside tasks for easy identification.
- **App Guidance**: Prompts user to "get it out of your head" and ensures list stays uncategorized and flat.  

### 2. **Scanning Mode**
Purpose: Reduce resistance and surface actionable tasks.
- Perform a **full scan** of the list (forward or backward, user-chosen).
- Mark tasks with zero resistance.
- Keep scan direction consistent.
- **Tag Visibility**: Tags are displayed alongside tasks to provide context during scanning.
- **App Guidance**: Enforces full scans, encourages quick intuitive passes, warns against switching direction frequently.

### 3. **Action Mode**
Purpose: Convert marked tasks into progress.
- Take **some action** (not necessarily completion) on each marked task.
- Work "little and often."
- **Re-entry**: If the task is not complete, it is moved to the **end of the list** to reduce resistance and promote clumping.
- **App Guidance**: Reminds user that even 2 minutes of progress counts, and that re-entry is expected.
- **Time Tracking**: Option to start/stop a timer on a task to record time spent for productivity review or billing purposes.
- **Tagging**: Ability to add tags to tasks (e.g., project names, contexts, client names) for organization and filtering. Tags are lightweight identifiers that help group related tasks without imposing hierarchical structure.
- Optional: assign resistance rating (0–10).
- Optional: attach additional task metadata (e.g., notes, billing category).
- Optional: mark the **level** of a task (Project, Step, Meta). Defaults to "Unspecified" unless user chooses or app infers.    

### 4. **Maintenance Mode**
Purpose: Keep the list clean and relevant.
- Delete tasks that now "stand out" as irrelevant.
- Archive deleted tasks for reflection.
- Re-enter recurring tasks when needed.
- **Data Management**: Export task data for backup, import from previous backups, or reset the app to start fresh.
- **App Guidance**: Suggests reviewing long-dormant tasks, nudges when items seem stale.  

### 5. **Reflection Mode**
Purpose: Notice progress and patterns.
- Review completed and deleted tasks.
- Observe clumping and resistance trends.
- Track total **time spent per task/project** for reporting and billing.
- Filter and review tasks by tags to see project-level progress.
- Minimal reflection to avoid overthinking.
- **App Guidance**: Provides optional insights ("Notice how resistance dropped here," "This type of task tends to cluster").  

---

## 5. Task Levels & Splitting

### 5.1 Task Levels
- Tasks can exist at **any level**: Project (broad initiative), Step (concrete action), or Meta (thinking/review).
- By default, tasks are added without requiring a level.
- **Optional indication**: User can mark a task's level if desired.

### 5.2 Task Splitting

**Purpose**: Task Splitting allows a user to break a task into smaller, actionable fragments at the moment of execution, without losing momentum or needing to navigate to a different screen. The feature supports ReZero's core principle: never let a task create resistance because it feels too big, unclear, or intimidating.

The split-task workflow must be nearly instantaneous, accessible from any mode where a task is visible, and maintain the original task's context, history, and metadata.

**Goals**:
1. Reduce friction when a user encounters a task that is too large to tackle.
2. Preserve the user's flow during scanning, deciding, or working.
3. Make splitting intuitive and low-cognitive-load, not a separate planning operation.
4. Keep the task list clean and linear, avoiding nested sub-projects unless explicitly chosen.

**Non-Goals**:
- Do not turn tasks into full project hierarchies by default.
- Do not introduce complex project management UI patterns (Gantt, boards, etc.).
- Do not require the user to pre-define all steps of a split task.

**Triggering a Split**:
A task can be split from:
- List Building
- Action Mode

Primary Trigger: A "Split Task" action (icon or gesture, e.g., swipe downwards or long-press → "Split").

**Split Editor Panel**:
A lightweight editor slides up showing:
- Task title at the top ("Splitting: [task name]")
- A list of empty lines, ready for immediate typing
- Keyboard automatically open

Rules:
- Each line becomes a new task
- Pressing "Return" creates the next line
- Blank lines are ignored

**Confirming Split**:
Action button: "Create Tasks"

Options presented (remembered per user preference):
1. Replace original task with the split items
2. Keep original as a parent
3. Archive original task after splitting

Default: Replace (most ReZero-aligned: keep the list lean).

**Metadata Inheritance**:
Each split task inherits:
- tags
- project/area
- priority weighting (if used)
- scheduling metadata (if any)
- notes (optionally copied or left with the parent only)

**Ordering**:
Split tasks appear immediately below the original task's position, maintaining chronological and spatial continuity.

**Parent Mode (Optional)**:
If user chooses to keep the original task:
- It becomes a container card (lightweight, not a project)
- Completion requires all split tasks to be done
- It collapses/expands like a simple outline
- Container cards are visually distinct but minimal

**Completion Behavior**:
- When all split items are complete:
  - If parent exists, offer an automatic "Complete parent" prompt.
  - If parent does not exist, no extra action is needed.

**Editing a Split Task**:
Split tasks behave like normal tasks. There is no structural penalty for editing, moving, or merging them later.

**UX/UI Principles**:
- Speed first: splitting must take <2 seconds to initiate.
- No heavy dialogs.
- Minimal typing friction.
- No modal traps.
- Inline animation that shows the original task "bursting" into smaller items to reinforce mental context.
- Subtle indentation for parent mode (if enabled).
- Keyboard focus always defaults to the first new split item line.

---

## 5.3 Data Management

### 5.3.1 Export Functionality

**Purpose**: Allow users to create a backup of all their task data, settings, and progress for safekeeping, migration to another device, or archival purposes.

**Export Format**: JSON file containing the complete application state:
- All tasks (active, completed, archived) with full metadata
- List entries and current list order
- Settings (scan direction, guide mode preferences, split preferences)
- Metrics and daily statistics
- Guide progress
- Time tracking data
- Tags and task relationships

**Export Options**:
- **Full Export**: Complete state backup including all historical data
- **Active Tasks Only**: Export only active tasks and current settings (for starting fresh on a new device while preserving work-in-progress)

**File Naming**: Auto-generated filename with timestamp (e.g., `resistance-zero-backup-2025-11-14.json`)

**Goals**:
1. Provide peace of mind through data backup capability
2. Enable device migration or multi-device workflow
3. Support archival of completed projects
4. Allow sharing of task structures (without forcing cloud sync)

**Non-Goals**:
- Do not create a complex backup versioning system
- Do not force automatic cloud backup (keep it user-initiated)
- Do not export to multiple formats initially (JSON only)

### 5.3.2 Import Functionality

**Purpose**: Restore previously exported data, merge tasks from another source, or migrate data from another device.

**Import Modes**:
1. **Replace**: Completely replace current data with imported data (with confirmation prompt)
2. **Merge**: Add imported tasks to existing tasks (avoiding duplicates by ID)
3. **Preview**: Show what will be imported before confirming

**Safety Features**:
- **Automatic Backup**: Before any import, automatically create a backup of current state
- **Validation**: Verify imported file structure and data integrity
- **Conflict Resolution**: For merge mode, handle duplicate task IDs gracefully
- **Undo Option**: Allow reverting to pre-import state for a limited time

**Import Flow**:
1. User selects "Import Data" and chooses file
2. App validates file format and displays preview of what will be imported
3. User selects import mode (Replace/Merge)
4. App creates automatic backup of current state
5. Import executes with progress indicator
6. Success confirmation with option to undo

**Goals**:
1. Safe restoration of backed-up data
2. Easy migration between devices
3. Merging of task lists from different sources (e.g., work and personal)
4. Protection against accidental data loss during import

**Non-Goals**:
- Do not create complex merge conflict resolution UI
- Do not support importing from other task management apps initially
- Do not auto-sync between devices

### 5.3.3 Initialize (Reset) Functionality

**Purpose**: Reset the application to its default state, clearing all data and settings. Useful for starting completely fresh, clearing test data, or troubleshooting.

**Initialize Options**:
1. **Full Reset**: Clear all data and return to welcome screen (as if first-time user)
2. **Reset Tasks Only**: Clear all tasks but preserve settings and preferences
3. **Reset Settings Only**: Return settings to defaults but preserve tasks

**Safety Features**:
- **Automatic Backup**: Before reset, automatically create and download a backup file
- **Confirmation Dialog**: Multi-step confirmation to prevent accidental resets
  - First prompt: "Are you sure you want to reset?"
  - Second prompt: Shows what will be deleted and confirms backup was created
- **No Immediate Auto-Delete**: Backup remains in browser downloads for user to save
- **Grace Period**: Option to restore from backup for 24 hours after reset (stored in separate localStorage key)

**Initialize Flow**:
1. User selects "Reset App" or "Initialize"
2. App displays reset options (Full/Tasks Only/Settings Only)
3. App creates automatic backup and prompts download
4. Confirmation dialog shows what will be cleared
5. User confirms (with safety checkbox or typed confirmation)
6. App resets to selected state
7. Success message with link to restore from backup if needed

**Use Cases**:
- New user wants to restart after exploring the app
- User wants to start a new project phase with clean slate
- Troubleshooting: clearing corrupted data
- Demonstration/teaching: resetting to show fresh user experience

**Goals**:
1. Provide safe way to start completely fresh
2. Support troubleshooting scenarios
3. Enable demonstration/testing workflows
4. Maintain data safety through automatic backup

**Non-Goals**:
- Do not make reset easily accessible (prevent accidents)
- Do not support partial deletion of tasks (use Maintenance mode for that)
- Do not sync reset across devices

### 5.3.4 UI Placement Recommendations

The data management features should be accessible but not intrusive, aligned with the minimalist philosophy while ensuring users can find them when needed.

**Recommended Primary Location: Maintenance Mode**

Maintenance Mode is the natural home for data management features because:
- It's already focused on "housekeeping" tasks (archiving, deleting)
- Users are in a maintenance mindset, considering what to keep/discard
- Export/backup conceptually aligns with archiving
- It's a dedicated mode rather than always-visible UI

**Implementation in Maintenance Mode**:
- Add a "Data Management" section below the task list
- Three buttons in a dedicated panel:
  - **Export Data** (with icon: download/save symbol)
  - **Import Data** (with icon: upload/restore symbol)
  - **Reset App** (with icon: caution/refresh symbol, visually distinct)
- Minimal visual weight - small buttons or links, not prominent
- Expandable help text explaining each option

**Recommended Secondary Location: Settings Icon in Footer**

For quicker access across all modes:
- Small settings gear icon in the Footer (right side)
- Opens a compact Settings modal/panel with:
  - Scan direction preference (already in settings)
  - Data management options (Export, Import, Reset)
  - Guide mode toggle
  - Link to help/documentation
- Modal closes after action is complete or user dismisses

**Alternative: Intro Page (for Initialize only)**

Add a subtle "Start Fresh" or "Reset Progress" link on the IntroPage:
- For users who want to restart the guided experience
- Only appears if app has existing data
- Provides quick path to reset without entering the app

**Recommended Approach**:
1. **Primary**: Add data management section to Maintenance Mode (most discoverable, thematically appropriate)
2. **Secondary**: Add settings icon to Footer for cross-mode access (convenience)
3. **Tertiary**: Add "Reset" option to IntroPage for users returning to start fresh

**UI/UX Principles**:
- Keep visual prominence minimal (these are infrequent operations)
- Group all data management in one location per mode
- Use clear, non-technical labels ("Export" not "Backup", "Reset" not "Initialize")
- Provide inline help text or tooltips
- Make destructive actions (Import-Replace, Reset) visually distinct with warning colors
- Always show confirmation dialogs for destructive operations

---

## 6. User Stories  

1. *As a user, I want to enter tasks quickly* without worrying about structure, categories, or deadlines.
2. *As a user, I want to scan my list in a consistent direction (forward or backward)* and mark tasks with zero resistance.
3. *As a user, I want the app to remind me that scanning lowers resistance*, so I don't skip scans.
4. *As a user, I want to take small steps on each marked task* so I feel constant movement.
5. *As a user, I want tasks to reappear at the end of the list if not completed* so resistance continues to drop.
6. *As a user, I want the app to nudge me to delete irrelevant tasks* when they naturally “stand out.”  
7. *As a user, I want recurring tasks to re-enter automatically*, supporting the “clumping” principle.  
8. *As a user, I want a minimal history of completed tasks* so I can see progress without clutter.  
9. *As a user, I want the app to act as a coach*, teaching and reinforcing the process as I work.
10. *As a user, I want to track time spent on tasks for billing and productivity review*, with data attached to each task.
11. *As a user, I want to split big tasks into smaller ones while still keeping the original project entry*, so I don't lose sight of the big picture.
12. *As a user, I want to add tags to tasks during Action Mode* (e.g., project names, contexts) so I can identify related tasks at a glance.
13. *As a user, I want to see tags displayed when building my list and scanning* so I have context about which project or area each task relates to.
14. *As a user, when a task feels too large to start*, I want to instantly split it into smaller pieces, so I can make progress without spending time planning.
15. *As a user, when I start a task and discover it requires more steps*, I want to split it mid-flow, so I can capture the steps without breaking focus.
16. *As a user, when scanning a long list*, I want to split a task without navigating away, so the scan rhythm remains uninterrupted.
17. *As a user, I want the option for the original task to be replaced with its split items, or kept as a parent/story card with child items*, so I can choose the structure that suits the task.
18. *As a user, I want to export all my task data* so I can back it up safely or move it to another device.
19. *As a user, I want to import previously exported data* so I can restore my tasks after switching devices or recover from data loss.
20. *As a user, I want the app to automatically back up my data before any destructive operation* so I never lose my work accidentally.
21. *As a user, I want to reset the app to start completely fresh* without manually deleting every task.
22. *As a user, I want clear warnings before any data-destructive operations* so I don't accidentally delete my work.

---

## 7. Functional Requirements  

### Core Features
- **Task List (Long List)**: One flat, uncategorized list.
- **Scanning Mode**: Choose forward or backward; app guides user to remain consistent.
- **Marking Mechanism**: One-tap mark for "ready" tasks.
- **Action Prompting**: App encourages small, immediate steps.
- **Re-entry**: Incomplete tasks are automatically moved to the **end of the list** until finished or deleted.

### Resistance & Progress Tracking
- Optional resistance scale (0–10).  
- Automatic lowering of resistance over repeated scans.  
- Progress reminders: “You’ve touched this task 3 times — resistance is dropping.”  

### Deletion / Archiving
- Swipe to delete tasks when intuition says “no longer relevant.”  
- Archive with timestamps for reflection.  

### Task Metadata, Tags & Time Tracking
- **Tags**: Lightweight labels added during Action Mode (e.g., "ClientA", "HomeProject", "Writing") that help identify related tasks. Tags are visible in List Building and Scanning modes.
- Tags can be added, edited, or removed when actioning tasks.
- Multiple tags can be assigned to a single task.
- Tags do not impose hierarchy or rigid categorization—the list remains flat.
- Allow attaching additional info (e.g., notes, billing category).
- Integrated timer for logging time spent on each task.
- Reports on time usage per task, tag, or date range.  

### Task Levels & Linking
- Tasks may be optionally marked as Project, Step, or Meta.
- If a task is **split into smaller tasks**, the original becomes a Project-level entry.
- Subtasks can be optionally linked back to the project for aggregation (time, progress).
- Linking is lightweight and does not create hierarchy in the list view — the list remains flat.

### Task Splitting
- **Quick access**: Split action available from task detail view, inline task rows, scan mode, and execution screen.
- **Split editor**: Lightweight panel with task title, multi-line input for new tasks, auto-open keyboard.
- **Immediate creation**: Each line creates a new task; blank lines ignored.
- **Split options**: User can choose to replace original, keep as parent, or archive original (preference remembered).
- **Metadata inheritance**: Split tasks inherit tags, project/area, priority, scheduling, and optionally notes.
- **Position preservation**: Split tasks appear immediately below original task position.
- **Parent mode**: Optional container cards that collapse/expand, require all children complete.
- **Auto-completion**: When all split items complete, prompt to complete parent (if exists).
- **No penalties**: Split tasks behave like normal tasks with full editing capabilities.

### Guidance Layer
- Contextual prompts embedded in each mode.
- Explanations and encouragement drawn directly from Forster's principles.
- Occasional expert tips (e.g., "Re-entry is expected, not failure").

### Data Management
- **Export**: Generate JSON backup file containing complete app state (tasks, settings, metrics, tags, time logs)
- **Export options**: Full export or active tasks only
- **Import**: Restore from previously exported JSON file
- **Import modes**: Replace all data, merge with existing, or preview before importing
- **Automatic backup**: Before any destructive operation (import-replace, reset), automatically create backup
- **Reset/Initialize**: Clear all data or selectively reset tasks/settings
- **Safety confirmations**: Multi-step confirmation dialogs for destructive operations
- **Undo capability**: Limited-time ability to revert destructive operations
- **File validation**: Verify integrity and structure of imported data before applying
- **Accessibility**: Primary location in Maintenance Mode, secondary access via settings icon
- **Error handling**: Clear messages for import failures, corrupted files, or validation errors

---

## 8. Non-Functional Requirements  

- **Minimalist UI**: Avoid clutter, categories, or priorities.  
- **Cross-Platform**: iOS, Android, and Web.  
- **Offline-first**: Lists available without internet.  
- **Lightweight Storage**: Simple local database with optional cloud sync.  
- **Accessibility**: Clear typography and keyboard navigation.  

---

## 9. Success Metrics  

- High % of tasks completed with *lower resistance over time*.
- Daily active usage (scans completed).
- Reduced rate of "abandoned" tasks.
- User-reported satisfaction with app's guidance.
- Feedback indicating reduced procrastination.
- **Time tracking adoption rate** and reports generated (billing, productivity).
- % of tasks split into smaller tasks and their completion rate.
- **Tag adoption rate** and whether tags help users maintain context without adding friction.  

---

## 10. Future Enhancements

- **Integrations**: Calendar (for set-time tasks).
- **Analytics**: Compare forward vs backward scan efficiency.
- **Tag Filtering**: Optional filtering by tags in List Building or Reflection modes (without breaking the flat list philosophy).
- **Tag-based Reports**: Time and completion analytics grouped by tag.
- **Community / Sharing**: Optional discussion groups.
- **AI Coaching**: Personalized suggestions for breaking down tasks.
- **Advanced Export Options**: CSV/PDF reports of time logs for billing clients, with tag-based grouping (JSON export is already implemented).
- **Import from Other Apps**: Support importing tasks from other task management systems (Todoist, Things, etc.).
- **Encrypted Backups**: Optional password-protected export files for sensitive task data.
- **Automated Scheduled Backups**: Optional automatic daily/weekly exports to local storage or cloud.
- **Cloud Sync**: Optional cloud synchronization between devices (while maintaining offline-first principle).  

---

## 11. Risks

- Users may demand conventional features (priorities, due dates) that dilute the philosophy.
- Over-engineering could undermine the intuitive simplicity of the method.
- Allowing frequent toggling of scan direction could reduce effectiveness.
- If the guidance layer feels too heavy-handed, users may abandon the app.
- Time tracking must remain optional to avoid adding friction for users uninterested in it.
- Linking projects and subtasks must remain optional to avoid hierarchical complexity.
- **Tags could encourage over-categorization**: Users might create too many tags or spend excessive time organizing. Tags must remain lightweight and optional to avoid this pitfall.
- **Tag visibility must not clutter the interface**: Tag display should be subtle and not distract from the core scanning experience.
- **Task splitting could encourage over-planning**: Users might split tasks excessively instead of taking action. The split UI must remain fast and low-friction to avoid this.
- **Parent mode could create hierarchy bloat**: If not carefully designed, parent/child relationships could undermine the flat list philosophy. Parent mode must remain optional and minimal.
- **Split workflow interruption**: If splitting takes too long or requires too many decisions, it could break the user's flow and increase resistance instead of reducing it.
- **Data loss during import**: Users could accidentally replace all their data with an old backup or incorrect file. Automatic backups and clear confirmations are essential.
- **File corruption or invalid imports**: Users might try to import corrupted files or files from incompatible sources. Robust validation and clear error messages are required.
- **Export/Import complexity**: If the export/import flow requires too many steps or decisions, users may avoid using it for backups, defeating the purpose.
- **Reset feature misuse**: Users might accidentally reset their app, losing all data. Multi-step confirmations and automatic backups before reset are critical.
- **Backup file management**: Users may accumulate many backup files and become confused about which is current. Clear file naming with timestamps helps, but user education is needed.
- **Large file sizes**: As task lists grow with time tracking and metadata, export files could become large. Consider compression or selective export options.
- **Privacy concerns**: Export files contain all user data in plain text JSON. Users should be warned not to share backup files containing sensitive task information.
