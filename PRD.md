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

---

## 3. Goals  

- Provide a **guided digital environment** for applying Resistance Zero.  
- Reinforce Mark’s principle that resistance itself is a navigational aid, not an enemy.  
- Avoid “productivity app bloat” (categorization, tagging, prioritization, gamification) that undermines intuitive scanning.  
- Position the app as an **expert companion** that teaches, prompts, and reinforces the process.  

---

## 4. Modes of Work & Actions  
The app guides users through a repeating cycle of five modes. Each mode has specific actions and built-in prompts.  

### 1. **List Building Mode**  
Purpose: Capture everything that isn’t tied to a calendar/time.  
- Add tasks quickly at any level (project, step, or meta-task).  
- Re-enter recurring tasks when needed.  
- Optional: assign resistance rating (0–10).  
- Optional: attach additional task metadata (e.g., project code, billing category).  
- Optional: mark the **level** of a task (Project, Step, Meta). Defaults to “Unspecified” unless user chooses or app infers.  
- **App Guidance**: Prompts user to “get it out of your head” and ensures list stays uncategorized and flat.  

### 2. **Scanning Mode**  
Purpose: Reduce resistance and surface actionable tasks.  
- Perform a **full scan** of the list (forward or backward, user-chosen).  
- Dot tasks with zero resistance.  
- Keep scan direction consistent.  
- **App Guidance**: Enforces full scans, encourages quick intuitive passes, warns against switching direction frequently.  

### 3. **Action Mode**  
Purpose: Convert dotted tasks into progress.  
- Take **some action** (not necessarily completion) on each dotted task.  
- Work “little and often.”  
- **Re-entry**: If the task is not complete, it is moved to the **end of the list** to reduce resistance and promote clumping.  
- **App Guidance**: Reminds user that even 2 minutes of progress counts, and that re-entry is expected.  
- **Time Tracking**: Option to start/stop a timer on a task to record time spent for productivity review or billing purposes.  

### 4. **Maintenance Mode**  
Purpose: Keep the list clean and relevant.  
- Delete tasks that now “stand out” as irrelevant.  
- Archive deleted tasks for reflection.  
- Re-enter recurring tasks when needed.  
- **App Guidance**: Suggests reviewing long-dormant tasks, nudges when items seem stale.  

### 5. **Reflection Mode**  
Purpose: Notice progress and patterns.  
- Review completed and deleted tasks.  
- Observe clumping and resistance trends.  
- Track total **time spent per task/project** for reporting and billing.  
- Minimal reflection to avoid overthinking.  
- **App Guidance**: Provides optional insights (“Notice how resistance dropped here,” “This type of task tends to cluster”).  

---

## 5. Task Levels & Splitting  
- Tasks can exist at **any level**: Project (broad initiative), Step (concrete action), or Meta (thinking/review).  
- By default, tasks are added without requiring a level.  
- **Optional indication**: User can mark a task’s level if desired.  
- **Splitting**: If a task is split into smaller tasks, the original task remains in the list by default and is automatically marked as a **Project**.  
- Subtasks created from it can be **optionally linked** to the project for reporting, analytics, and billing.  
- The user can later choose to delete the project entry when it feels resolved or redundant.  

---

## 6. User Stories  

1. *As a user, I want to enter tasks quickly* without worrying about structure, categories, or deadlines.  
2. *As a user, I want to scan my list in a consistent direction (forward or backward)* and mark tasks with zero resistance.  
3. *As a user, I want the app to remind me that scanning lowers resistance*, so I don’t skip scans.  
4. *As a user, I want to take small steps on each dotted task* so I feel constant movement.  
5. *As a user, I want tasks to reappear at the end of the list if not completed* so resistance continues to drop.  
6. *As a user, I want the app to nudge me to delete irrelevant tasks* when they naturally “stand out.”  
7. *As a user, I want recurring tasks to re-enter automatically*, supporting the “clumping” principle.  
8. *As a user, I want a minimal history of completed tasks* so I can see progress without clutter.  
9. *As a user, I want the app to act as a coach*, teaching and reinforcing the process as I work.  
10. *As a user, I want to track time spent on tasks for billing and productivity review*, with data attached to each task.  
11. *As a user, I want to split big tasks into smaller ones while still keeping the original project entry*, so I don’t lose sight of the big picture.  

---

## 7. Functional Requirements  

### Core Features
- **Task List (Long List)**: One flat, uncategorized list.  
- **Scanning Mode**: Choose forward or backward; app guides user to remain consistent.  
- **Dotting Mechanism**: One-tap mark for “ready” tasks.  
- **Action Prompting**: App encourages small, immediate steps.  
- **Re-entry**: Incomplete tasks are automatically moved to the **end of the list** until finished or deleted.  

### Resistance & Progress Tracking
- Optional resistance scale (0–10).  
- Automatic lowering of resistance over repeated scans.  
- Progress reminders: “You’ve touched this task 3 times — resistance is dropping.”  

### Deletion / Archiving
- Swipe to delete tasks when intuition says “no longer relevant.”  
- Archive with timestamps for reflection.  

### Task Metadata & Time Tracking
- Allow attaching additional info (e.g., project code, billing tag, notes).  
- Integrated timer for logging time spent on each task.  
- Reports on time usage per task, project, or date range.  

### Task Levels & Linking
- Tasks may be optionally marked as Project, Step, or Meta.  
- If a task is **split into smaller tasks**, the original becomes a Project-level entry.  
- Subtasks can be optionally linked back to the project for aggregation (time, progress).  
- Linking is lightweight and does not create hierarchy in the list view — the list remains flat.  

### Guidance Layer
- Contextual prompts embedded in each mode.  
- Explanations and encouragement drawn directly from Forster’s principles.  
- Occasional expert tips (e.g., “Re-entry is expected, not failure”).  

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
- Reduced rate of “abandoned” tasks.  
- User-reported satisfaction with app’s guidance.  
- Feedback indicating reduced procrastination.  
- **Time tracking adoption rate** and reports generated (billing, productivity).  
- % of tasks split into smaller tasks and their completion rate.  

---

## 10. Future Enhancements  

- **Integrations**: Calendar (for set-time tasks).  
- **Analytics**: Compare forward vs backward scan efficiency.  
- **Community / Sharing**: Optional discussion groups.  
- **AI Coaching**: Personalized suggestions for breaking down tasks.  
- **Export Options**: CSV/PDF reports of time logs for billing clients.  

---

## 11. Risks  

- Users may demand conventional features (priorities, due dates) that dilute the philosophy.  
- Over-engineering could undermine the intuitive simplicity of the method.  
- Allowing frequent toggling of scan direction could reduce effectiveness.  
- If the guidance layer feels too heavy-handed, users may abandon the app.  
- Time tracking must remain optional to avoid adding friction for users uninterested in it.  
- Linking projects and subtasks must remain optional to avoid hierarchical complexity.  
