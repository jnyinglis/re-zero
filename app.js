const STORAGE_KEY = "rz-state-v1";
const today = () => new Date().toISOString().slice(0, 10);
const clone = (value) =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const defaultState = {
  tasks: [],
  settings: {
    scanDirection: "forward",
  },
  metrics: {
    totalScans: 0,
    dottedToday: 0,
  },
  daily: {},
  tipsIndex: 0,
};

let state = loadState();
let currentMode = "list";
let scanSession = null;
let activeTimer = null;

const guidanceByMode = {
  list: [
    "Empty your head. Capture everything without judging it.",
    "Projects, steps, meta-thoughts—all belong in one flat list.",
    "Re-entry is a feature: add recurring tasks freely.",
  ],
  scan: [
    "Choose a direction and stick with it. Scanning melts resistance.",
    "Dot only what feels effortless right now—no forcing.",
    "Quick passes beat deliberation. Trust the hunches.",
  ],
  action: [
    "Little and often wins. Even two minutes moves the needle.",
    "After you act, re-enter unfinished work at the end of the list.",
    "Notice how dotted tasks invite you forward—flow with them.",
  ],
  maintain: [
    "Listen for tasks that now say ‘delete me’.",
    "Archiving preserves history without cluttering your list.",
    "Recurring items can be re-entered as soon as they’re needed.",
  ],
  reflect: [
    "Celebrate touch counts: resistance is already lower.",
    "Look for clumps of similar wins—they reveal momentum.",
    "Keep reflection light. Notice and move forward.",
  ],
};

const coachTips = [
  "Scanning chips away resistance. Keep passing through!",
  "If a dotted task resists, split it and keep moving.",
  "Re-entry isn’t failure—it’s the Resistance Zero rhythm.",
  "Stay in one mode at a time to feel the guidance working.",
  "Delete the stale. Make space for the effortless.",
];

const elements = {
  guidanceBar: document.getElementById("guidanceBar"),
  coachTips: document.getElementById("coachTips"),
  modeButtons: Array.from(document.querySelectorAll(".mode-button")),
  panels: {
    list: document.getElementById("listMode"),
    scan: document.getElementById("scanMode"),
    action: document.getElementById("actionMode"),
    maintain: document.getElementById("maintainMode"),
    reflect: document.getElementById("reflectMode"),
  },
  taskForm: document.getElementById("taskForm"),
  taskText: document.getElementById("taskText"),
  taskResistance: document.getElementById("taskResistance"),
  taskLevel: document.getElementById("taskLevel"),
  taskNotes: document.getElementById("taskNotes"),
  listPreview: document.getElementById("listPreview"),
  scanDirectionButtons: Array.from(document.querySelectorAll(".scan-direction")),
  startScan: document.getElementById("startScan"),
  scanView: document.getElementById("scanView"),
  scanStatus: document.getElementById("scanStatus"),
  actionList: document.getElementById("actionList"),
  maintenanceList: document.getElementById("maintenanceList"),
  completedList: document.getElementById("completedList"),
  archivedList: document.getElementById("archivedList"),
  metrics: {
    total: document.getElementById("metricTotalTasks"),
    dotted: document.getElementById("metricDotted"),
    active: document.getElementById("metricActive"),
  },
  insights: {
    scans: document.getElementById("insightScans"),
    dots: document.getElementById("insightDots"),
    minutes: document.getElementById("insightMinutes"),
  },
};

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

elements.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.taskText.value.trim();
  if (!text) return;
  const task = createTask({
    text,
    resistance: elements.taskResistance.value ? Number(elements.taskResistance.value) : null,
    level: elements.taskLevel.value,
    notes: elements.taskNotes.value.trim(),
  });
  state.tasks.push(task);
  saveState();
  elements.taskForm.reset();
  elements.taskText.focus();
  render();
});

elements.scanDirectionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.settings.scanDirection = btn.dataset.direction;
    saveState();
    highlightScanDirection();
  });
});

elements.startScan.addEventListener("click", () => {
  if (!state.tasks.some((t) => t.status === "active")) {
    elements.scanStatus.textContent = "Add tasks in List Building mode to start scanning.";
    return;
  }
  beginScan();
});

function setMode(mode) {
  currentMode = mode;
  elements.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  Object.entries(elements.panels).forEach(([key, panel]) => {
    panel.classList.toggle("hidden", key !== mode);
  });
  updateGuidance();
  render();
}

function updateGuidance() {
  const messages = guidanceByMode[currentMode] || [];
  const message = messages[Math.floor(Math.random() * messages.length)] || "";
  elements.guidanceBar.textContent = message;
  const tip = coachTips[state.tipsIndex % coachTips.length];
  elements.coachTips.textContent = tip;
  state.tipsIndex = (state.tipsIndex + 1) % coachTips.length;
}

function highlightScanDirection() {
  elements.scanDirectionButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.direction === state.settings.scanDirection);
  });
}

function createTask({ text, resistance, level, notes }) {
  const now = Date.now();
  return {
    id: randomId(),
    text,
    resistance,
    level,
    notes,
    dotted: false,
    status: "active",
    createdAt: now,
    updatedAt: now,
    touches: 0,
    scanCount: 0,
    dottedCount: 0,
    reentries: 0,
    completedAt: null,
    archivedAt: null,
    timeLogs: [],
  };
}

function render() {
  highlightScanDirection();
  renderListPreview();
  renderActionList();
  renderMaintenanceList();
  renderReflection();
  updateMetrics();
  if (currentMode === "scan") {
    renderScanView();
  }
  saveState();
}

function renderListPreview() {
  elements.listPreview.innerHTML = "";
  state.tasks
    .filter((task) => task.status === "active")
    .forEach((task) => {
      const item = document.createElement("li");
      item.textContent = `${task.text}${task.dotted ? " • dotted" : ""}`;
      elements.listPreview.appendChild(item);
    });
}

function beginScan() {
  const tasks = getActiveTasks();
  const ordered = state.settings.scanDirection === "forward" ? tasks : [...tasks].reverse();
  scanSession = {
    order: ordered.map((task) => task.id),
    index: 0,
    startedAt: Date.now(),
  };
  elements.scanStatus.textContent = "Scanning in progress. Move quickly and trust intuition.";
  renderScanView();
}

function renderScanView() {
  if (!scanSession) {
    elements.scanView.classList.remove("active");
    elements.scanView.textContent = "Tap Start Scan to begin a full pass.";
    return;
  }

  if (scanSession.index >= scanSession.order.length) {
    completeScan();
    return;
  }

  const taskId = scanSession.order[scanSession.index];
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.status !== "active") {
    scanSession.index += 1;
    renderScanView();
    return;
  }

  elements.scanView.classList.add("active");
  elements.scanView.innerHTML = "";

  const container = document.createElement("div");
  container.className = "task-card";

  const header = document.createElement("header");
  const title = document.createElement("h3");
  title.textContent = task.text;
  const badges = document.createElement("div");
  badges.className = "badges";
  if (task.level && task.level !== "unspecified") {
    const badge = document.createElement("span");
    badge.className = `badge ${task.level}`;
    badge.textContent = task.level;
    badges.appendChild(badge);
  }
  if (typeof task.resistance === "number") {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = `Resistance: ${task.resistance}`;
    badges.appendChild(badge);
  }
  header.appendChild(title);
  header.appendChild(badges);

  const notes = document.createElement("p");
  notes.className = "muted";
  notes.textContent = task.notes || "";

  const footer = document.createElement("footer");
  const dotButton = document.createElement("button");
  dotButton.className = "primary";
  dotButton.textContent = task.dotted ? "Undot" : "Dot (zero resistance)";
  dotButton.addEventListener("click", () => {
    toggleDot(task.id);
  });

  const skipButton = document.createElement("button");
  skipButton.textContent = "Next";
  skipButton.addEventListener("click", () => advanceScan());

  footer.appendChild(dotButton);
  footer.appendChild(skipButton);

  if (task.notes) {
    container.append(header, notes, footer);
  } else {
    container.append(header, footer);
  }

  elements.scanView.appendChild(container);
}

function advanceScan() {
  if (!scanSession) return;
  const taskId = scanSession.order[scanSession.index];
  const task = state.tasks.find((t) => t.id === taskId);
  if (task) {
    task.touches += 1;
    task.scanCount += 1;
    task.updatedAt = Date.now();
    if (typeof task.resistance === "number" && task.resistance > 0) {
      task.resistance = Math.max(0, task.resistance - 1);
    }
  }
  scanSession.index += 1;
  saveState();
  renderScanView();
}

function toggleDot(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  task.dotted = !task.dotted;
  task.updatedAt = Date.now();
  if (task.dotted) {
    task.dottedCount += 1;
    bumpDaily(today(), "dots", 1);
    elements.scanStatus.textContent = "Nice! Dotting marks the effortless tasks.";
  } else {
    elements.scanStatus.textContent = "Dot removed. Keep scanning.";
  }
  saveState();
  render();
}

function completeScan() {
  elements.scanStatus.textContent = "Scan complete. Move to Action mode when ready.";
  elements.scanView.classList.remove("active");
  elements.scanView.textContent = "Scan finished. Great work.";
  state.metrics.totalScans += 1;
  bumpDaily(today(), "scans", 1);
  scanSession = null;
  saveState();
  render();
}

function renderActionList() {
  if (currentMode !== "action") return;
  elements.actionList.innerHTML = "";
  const dottedTasks = state.tasks.filter((task) => task.status === "active" && task.dotted);
  if (dottedTasks.length === 0) {
    elements.actionList.textContent = "Dot tasks in Scanning mode to see them here.";
    return;
  }

  dottedTasks.forEach((task) => {
    const card = buildTaskCard(task, {
      showTimer: true,
      actions: [
        {
          label: task.dotted ? "Clear Dot" : "Dot",
          onClick: () => toggleDot(task.id),
        },
        {
          label: "Progress Made",
          onClick: () => progressTask(task.id),
        },
        {
          label: "Complete",
          onClick: () => completeTask(task.id),
          className: "primary",
        },
      ],
    });
    elements.actionList.appendChild(card);
  });
}

function renderMaintenanceList() {
  if (currentMode !== "maintain") return;
  elements.maintenanceList.innerHTML = "";
  const activeTasks = state.tasks.filter((task) => task.status === "active");
  if (activeTasks.length === 0) {
    elements.maintenanceList.textContent = "Nothing to prune. Add tasks or re-enter recurring work.";
    return;
  }
  activeTasks.forEach((task) => {
    const card = buildTaskCard(task, {
      actions: [
        {
          label: "Archive",
          onClick: () => archiveTask(task.id),
          className: "destructive",
        },
      ],
    });
    elements.maintenanceList.appendChild(card);
  });
}

function renderReflection() {
  if (currentMode !== "reflect") return;
  const day = today();
  const dailyStats = state.daily[day] || { scans: 0, dots: 0, minutes: 0 };
  elements.insights.scans.textContent = `Scans today: ${dailyStats.scans || 0}`;
  elements.insights.dots.textContent = `Tasks dotted today: ${dailyStats.dots || 0}`;
  elements.insights.minutes.textContent = `Minutes logged: ${Math.round(dailyStats.minutes || 0)}`;

  elements.completedList.innerHTML = "";
  elements.archivedList.innerHTML = "";

  state.tasks
    .filter((task) => task.status === "completed")
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
    .forEach((task) => {
      const item = document.createElement("li");
      item.className = "reflection-item";
      item.textContent = `${task.text} • ${(task.timeLogs.reduce((acc, log) => acc + log.minutes, 0) || 0).toFixed(1)} min`;
      elements.completedList.appendChild(item);
    });

  state.tasks
    .filter((task) => task.status === "archived")
    .sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0))
    .forEach((task) => {
      const item = document.createElement("li");
      item.className = "reflection-item";
      item.textContent = `${task.text} • touched ${task.touches} times`;
      elements.archivedList.appendChild(item);
    });
}

function buildTaskCard(task, options = {}) {
  const card = document.createElement("article");
  card.className = "task-card";

  const header = document.createElement("header");
  const title = document.createElement("h3");
  title.textContent = task.text;
  header.appendChild(title);

  const detail = document.createElement("div");
  detail.className = "muted";
  const bits = [];
  if (task.level && task.level !== "unspecified") bits.push(capitalize(task.level));
  if (typeof task.resistance === "number") bits.push(`Resistance ${task.resistance}`);
  bits.push(`Touches ${task.touches}`);
  if (task.reentries) bits.push(`Re-entries ${task.reentries}`);
  detail.textContent = bits.join(" • ");

  const actions = document.createElement("footer");

  if (options.showTimer) {
    const timer = document.createElement("div");
    timer.className = "timer-controls";
    const status = document.createElement("span");
    status.textContent = formatTimerStatus(task.id);
    timer.appendChild(status);

    const toggleTimer = document.createElement("button");
    toggleTimer.textContent = isTimerRunning(task.id) ? "Stop Timer" : "Start Timer";
    toggleTimer.addEventListener("click", () => toggleTaskTimer(task.id));
    timer.appendChild(toggleTimer);

    actions.appendChild(timer);
  }

  (options.actions || []).forEach((action) => {
    const btn = document.createElement("button");
    btn.textContent = action.label;
    if (action.className) btn.classList.add(action.className);
    btn.addEventListener("click", action.onClick);
    actions.appendChild(btn);
  });

  card.append(header, detail);
  if (task.notes) {
    const notes = document.createElement("div");
    notes.className = "muted";
    notes.textContent = task.notes;
    card.appendChild(notes);
  }
  card.appendChild(actions);
  return card;
}

function formatTimerStatus(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return "";
  const totalMinutes = task.timeLogs.reduce((acc, log) => acc + log.minutes, 0);
  if (isTimerRunning(taskId)) {
    const now = Date.now();
    const elapsed = (now - activeTimer.startedAt) / 60000;
    return `Timing… ${(totalMinutes + elapsed).toFixed(1)} min logged`;
  }
  return `${totalMinutes.toFixed(1)} min logged`;
}

function isTimerRunning(taskId) {
  return activeTimer && activeTimer.taskId === taskId;
}

function toggleTaskTimer(taskId) {
  if (isTimerRunning(taskId)) {
    stopTimer();
  } else {
    startTimer(taskId);
  }
  render();
}

function startTimer(taskId) {
  stopTimer();
  activeTimer = {
    taskId,
    startedAt: Date.now(),
  };
}

function stopTimer() {
  if (!activeTimer) return;
  const task = state.tasks.find((t) => t.id === activeTimer.taskId);
  if (!task) {
    activeTimer = null;
    return;
  }
  const elapsedMinutes = (Date.now() - activeTimer.startedAt) / 60000;
  task.timeLogs.push({ minutes: elapsedMinutes, finishedAt: Date.now() });
  bumpDaily(today(), "minutes", elapsedMinutes);
  task.updatedAt = Date.now();
  activeTimer = null;
  saveState();
}

function progressTask(taskId) {
  const index = state.tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return;
  if (isTimerRunning(taskId)) stopTimer();
  const [task] = state.tasks.splice(index, 1);
  task.reentries += 1;
  task.updatedAt = Date.now();
  task.dotted = false;
  state.tasks.push(task);
  saveState();
  render();
}

function completeTask(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  if (isTimerRunning(taskId)) stopTimer();
  task.status = "completed";
  task.dotted = false;
  task.completedAt = Date.now();
  task.updatedAt = Date.now();
  saveState();
  render();
}

function archiveTask(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  if (isTimerRunning(taskId)) stopTimer();
  task.status = "archived";
  task.dotted = false;
  task.archivedAt = Date.now();
  task.updatedAt = Date.now();
  saveState();
  render();
}

function updateMetrics() {
  const total = state.tasks.length;
  const dotted = state.tasks.filter((task) => task.dotted && task.status === "active").length;
  const active = state.tasks.filter((task) => task.status === "active").length;
  elements.metrics.total.textContent = `Total Tasks: ${total}`;
  elements.metrics.dotted.textContent = `Dotted: ${dotted}`;
  elements.metrics.active.textContent = `Active: ${active}`;
}

function getActiveTasks() {
  return state.tasks.filter((task) => task.status === "active");
}

function bumpDaily(day, key, increment) {
  if (!state.daily[day]) {
    state.daily[day] = { scans: 0, dots: 0, minutes: 0 };
  }
  state.daily[day][key] += increment;
  if (key === "dots") {
    state.metrics.dottedToday += increment;
  }
  saveState();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...clone(defaultState), ...parsed, tasks: parsed.tasks || [], daily: parsed.daily || {} };
  } catch (error) {
    console.warn("Unable to load saved data", error);
    return clone(defaultState);
  }
}

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2, 10);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Unable to save state", error);
  }
}

window.addEventListener("beforeunload", () => {
  stopTimer();
  saveState();
});

setMode("list");
