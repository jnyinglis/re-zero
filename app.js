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
};

console.log("Loading state...");
let state = loadState();
console.log("State loaded:", !!state, "Tasks:", state?.tasks?.length || 0);

if (!state.guide) {
  state.guide = clone(defaultState.guide);
}
if (typeof state.settings.guideMode !== "boolean") {
  state.settings.guideMode = defaultState.settings.guideMode;
}

console.log("State initialization complete:", state);

const guideFlow = [
  { key: "intro", mode: "intro", label: "Introduction" },
  { key: "listInstructions", mode: "listInstructions", label: "List Building Instructions" },
  { key: "listAction", mode: "list", label: "List Building" },
  { key: "scanInstructions", mode: "scanInstructions", label: "Scanning Instructions" },
  { key: "scanAction", mode: "scan", label: "Scanning" },
  { key: "actionInstructions", mode: "actionInstructions", label: "Action Instructions" },
  { key: "actionAction", mode: "action", label: "Action" },
  { key: "maintainInstructions", mode: "maintainInstructions", label: "Maintenance Instructions" },
  { key: "maintainAction", mode: "maintain", label: "Maintenance" },
  { key: "reflectInstructions", mode: "reflectInstructions", label: "Reflection Instructions" },
  { key: "reflectAction", mode: "reflect", label: "Reflection" },
];

const guideStepIndexByKey = guideFlow.reduce((map, step, index) => {
  map[step.key] = index;
  return map;
}, {});

const guideLabels = guideFlow.reduce((map, step) => {
  map[step.key] = step.label;
  return map;
}, {});

let currentMode = "list";
if (state.settings.guideMode && state.guide.started) {
  ensureGuideIndex();
  const step = guideFlow[state.guide.activeIndex];
  currentMode = step ? step.mode : "list";
}
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
  settings: [
    "Tune scanning to fit your rhythm—changes apply immediately.",
    "Resistance Zero works best when it matches your instincts.",
    "Come back here anytime to tweak how the app feels.",
  ],
};

const coachTips = [
  "Scanning chips away resistance. Keep passing through!",
  "If a dotted task resists, split it and keep moving.",
  "Re-entry isn’t failure—it’s the Resistance Zero rhythm.",
  "Stay in one mode at a time to feel the guidance working.",
  "Delete the stale. Make space for the effortless.",
];

const elements = (() => {
  try {
    console.log("Initializing elements...");
    const els = {
      guidanceBar: document.getElementById("guidanceBar"),
      coachTips: document.getElementById("coachTips"),
      introPage: document.getElementById("introPage"),
      modeSection: document.getElementById("modeSection"),
      startRezero: document.getElementById("startRezero"),
      panels: {
        listInstructions: document.getElementById("listInstructions"),
        list: document.getElementById("listMode"),
        scanInstructions: document.getElementById("scanInstructions"),
        scan: document.getElementById("scanMode"),
        actionInstructions: document.getElementById("actionInstructions"),
        action: document.getElementById("actionMode"),
        maintainInstructions: document.getElementById("maintainInstructions"),
        maintain: document.getElementById("maintainMode"),
        reflectInstructions: document.getElementById("reflectInstructions"),
        reflect: document.getElementById("reflectMode"),
      },
      taskForm: document.getElementById("taskForm"),
      taskText: document.getElementById("taskText"),
      taskResistance: document.getElementById("taskResistance"),
      taskLevel: document.getElementById("taskLevel"),
      taskNotes: document.getElementById("taskNotes"),
      listPreview: document.getElementById("listPreview"),
      scanDirectionButtons: Array.from(document.querySelectorAll(".scan-direction")),
      modeButtons: [],
      startScan: document.getElementById("scanStart"),
      scanView: document.getElementById("scanProgress"),
      scanStatus: document.getElementById("scanCounter"),
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
      guide: {
        controls: document.getElementById("guideControls"),
        prev: document.getElementById("guidePrev"),
        next: document.getElementById("guideNext"),
        progress: document.getElementById("guideProgressLabel"),
        listStart: document.getElementById("startListBuilding"),
        scanAdvance: document.getElementById("startScanningStage"),
        actionAdvance: document.getElementById("startActionStage"),
        maintainAdvance: document.getElementById("startMaintenanceStage"),
        reflectAdvance: document.getElementById("startReflectionStage"),
      },
    };

    // Check for missing critical elements
    const critical = ['actionList', 'maintenanceList', 'listPreview'];
    const missing = critical.filter(key => !els[key]);
    if (missing.length > 0) {
      console.warn("Missing critical elements:", missing);
    }

    console.log("Elements initialized successfully");
    return els;
  } catch (error) {
    console.error("Elements initialization failed:", error);
    return {
      // Return minimal fallback elements
      actionList: null,
      maintenanceList: null,
      listPreview: null,
      panels: {},
      guide: {},
      metrics: {},
      insights: {},
      modeButtons: []
    };
  }
})();

if (elements.startRezero) {
  elements.startRezero.addEventListener("click", () => startResZeroFlow());
}

if (elements.guide.listStart) {
  elements.guide.listStart.addEventListener("click", () => moveToNextStep());
}

if (elements.guide.scanAdvance) {
  elements.guide.scanAdvance.addEventListener("click", () => moveToNextStep());
}

if (elements.guide.actionAdvance) {
  elements.guide.actionAdvance.addEventListener("click", () => moveToNextStep());
}

if (elements.guide.maintainAdvance) {
  elements.guide.maintainAdvance.addEventListener("click", () => moveToNextStep());
}

if (elements.guide.reflectAdvance) {
  elements.guide.reflectAdvance.addEventListener("click", () => moveToNextStep());
}

if (elements.guide.prev) {
  elements.guide.prev.addEventListener("click", () => moveToPrevStep());
}

if (elements.guide.next) {
  elements.guide.next.addEventListener("click", () => moveToNextStep());
}

// Add event listener for scan button
document.getElementById("beginScanBtn")?.addEventListener("click", () => {
  if (!state.tasks.some((t) => t.status === "active")) {
    alert("Add tasks in List Building mode to start scanning.");
    return;
  }
  startSimplifiedScan();
});

// Add event listeners for scan controls
document.getElementById("skipTask")?.addEventListener("click", () => {
  advanceNewScan(false);
});

document.getElementById("dotTask")?.addEventListener("click", () => {
  advanceNewScan(true);
});

document.getElementById("finishScan")?.addEventListener("click", () => {
  finishNewScan();
});

// Settings panel removed - guide mode is always enabled

// Quick add functionality
document.getElementById("quickAddBtn").addEventListener("click", () => {
  const text = elements.taskText.value.trim();
  if (!text) return;

  // Check if user wants to add more details
  if (text.includes("!") || text.includes("#")) {
    // Show expanded form for detailed entry
    document.getElementById("pendingTaskText").value = text;
    document.getElementById("expandedForm").classList.remove("hidden");
    elements.taskText.value = "";
  } else {
    // Quick add with defaults
    const task = createTask({
      text,
      resistance: null,
      level: "unspecified",
      notes: "",
    });
    state.tasks.push(task);
    saveState();
    elements.taskText.value = "";
    elements.taskText.focus();
    render();
  }
});

// Handle Enter key in quick add
elements.taskText.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    document.getElementById("quickAddBtn").click();
  }
});

// Expanded form submission
elements.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = document.getElementById("pendingTaskText").value.trim();
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
  document.getElementById("expandedForm").classList.add("hidden");
  elements.taskText.focus();
  render();
});

// Cancel expanded form
document.getElementById("cancelForm").addEventListener("click", () => {
  document.getElementById("expandedForm").classList.add("hidden");
  elements.taskForm.reset();
  elements.taskText.focus();
});

elements.scanDirectionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.settings.scanDirection = btn.dataset.direction;
    saveState();
    highlightScanDirection();
  });
});

// Settings panel removed - scanDirection is handled internally

// Simplified scanning event listeners
document.getElementById("beginScanBtn")?.addEventListener("click", () => {
  if (!state.tasks.some((t) => t.status === "active")) {
    alert("Add tasks in List Building mode to start scanning.");
    return;
  }
  startSimplifiedScan();
});

document.getElementById("skipTask")?.addEventListener("click", () => advanceNewScan(false));
document.getElementById("dotTask")?.addEventListener("click", () => advanceNewScan(true));
document.getElementById("finishScan")?.addEventListener("click", () => finishNewScan());

// Scan direction setting
function setMode(mode, options = {}) {
  if (isGuideModeEnabled() && mode !== "settings") {
    ensureGuideIndex();
    if (!state.guide.started) {
      state.guide.activeIndex = 0;
      const initialStep = guideFlow[state.guide.activeIndex];
      mode = initialStep ? initialStep.mode : "list";
    } else if (!options.overrideGuideStep) {
      const step = guideFlow[state.guide.activeIndex];
      mode = step ? step.mode : "list";
    }
  }

  currentMode = mode;
  elements.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  Object.entries(elements.panels).forEach(([key, panel]) => {
    panel.classList.toggle("hidden", key !== mode);
  });

  // Show scan start screen when entering scan mode
  if (mode === "scan") {
    const scanStart = document.getElementById("scanStart");
    const scanProgress = document.getElementById("scanProgress");
    if (scanStart) scanStart.style.display = "flex";
    if (scanProgress) scanProgress.classList.add("hidden");
  }

  updateGuidance();
  render();
}

function isGuideModeEnabled() {
  return Boolean(state.settings.guideMode);
}

function ensureGuideIndex() {
  if (!state.guide) {
    state.guide = clone(defaultState.guide);
  }
  if (
    typeof state.guide.activeIndex !== "number" ||
    state.guide.activeIndex < 0 ||
    state.guide.activeIndex >= guideFlow.length
  ) {
    state.guide.activeIndex = 0;
  }
}

function getCurrentGuideStep() {
  if (!isGuideModeEnabled()) return null;
  ensureGuideIndex();
  return guideFlow[state.guide.activeIndex] || null;
}

function moveToGuideStep(key) {
  const index = guideStepIndexByKey[key];
  if (typeof index !== "number") return;
  state.guide.started = true;
  state.guide.activeIndex = index;
  const step = guideFlow[index];
  setMode(step ? step.mode : "list", { overrideGuideStep: true });
}

function startGuideSession() {
  moveToGuideStep("list");
}

function toggleGuideMode(enabled) {
  state.settings.guideMode = enabled;
  if (!enabled) {
    state.guide.started = false;
    state.guide.activeIndex = 0;
    render();
    return;
  }
  state.guide.started = false;
  state.guide.activeIndex = 0;
  setMode("list", { overrideGuideStep: true });
}

function navigateGuide(direction) {
  if (!state.guide.started) return;
  ensureGuideIndex();
  const nextIndex = Math.min(
    guideFlow.length - 1,
    Math.max(0, state.guide.activeIndex + direction)
  );
  if (nextIndex === state.guide.activeIndex) return;
  state.guide.activeIndex = nextIndex;
  const step = guideFlow[state.guide.activeIndex];
  setMode(step ? step.mode : "list", { overrideGuideStep: true });
}

function handleGuideNext() {
  if (!state.guide.started) return;
  ensureGuideIndex();
  if (state.guide.activeIndex >= guideFlow.length - 1) {
    restartGuideFlow();
    return;
  }
  navigateGuide(1);
}

function restartGuideFlow() {
  state.guide.started = false;
  state.guide.activeIndex = 0;
  setMode("list", { overrideGuideStep: true });
}

function updateGuidance() {
  let message = "";
  const currentStep = getCurrentGuideStep();
  if (
    isGuideModeEnabled() &&
    currentMode === "list" &&
    (!state.guide.started || currentStep?.key === "welcome")
  ) {
    message = "Guide mode is ready. Press Start to move through the cycle.";
  } else {
    const messages = guidanceByMode[currentMode] || [];
    message = messages[Math.floor(Math.random() * messages.length)] || "";
  }
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

function createTask({ text, resistance, level, notes, parentId = null }) {
  const now = Date.now();
  return {
    id: randomId(),
    text,
    resistance,
    level,
    notes,
    dotted: false,
    lastDottedOn: null,
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
    parentId, // Link to parent project
    subtasks: [], // Array of linked subtask IDs
  };
}

function render() {
  highlightScanDirection();
  updateNavigation();
  renderListPreview();
  renderActionList();
  renderMaintenanceList();
  renderReflection();
  renderSettingsPanel();
  updateMetrics();
  updateGuideUI();
  if (currentMode === "scan") {
    renderScanView();
  }
  saveState();
}

function updateNavigation() {
  const guideEnabled = isGuideModeEnabled();
  elements.modeButtons.forEach((button) => {
    button.classList.remove("hidden-button");
    button.disabled = guideEnabled && button.dataset.mode === currentMode;
  });

  if (!guideEnabled) {
    return;
  }

  const currentStep = getCurrentGuideStep();
  const activeMode = currentStep ? currentStep.mode : null;

  elements.modeButtons.forEach((button) => {
    const mode = button.dataset.mode;
    const isSettings = mode === "settings";
    const isActiveStep = mode === activeMode;
    if (isSettings || isActiveStep) {
      button.classList.remove("hidden-button");
      button.disabled = mode === currentMode;
    } else {
      button.classList.add("hidden-button");
    }
  });
}

function updateGuideUI() {
  const guideEnabled = isGuideModeEnabled();
  const {
    welcome,
    builder,
    controls,
    prev,
    next,
    progress,
    scanLanding,
    scanWorkspace,
    actionLanding,
    actionContent,
    maintainLanding,
    maintainContent,
    reflectLanding,
    reflectContent,
  } = elements.guide;

  const currentStep = getCurrentGuideStep();
  const stepKey = currentStep?.key;

  if (welcome) {
    const showWelcome = guideEnabled && currentMode === "list" && stepKey === "welcome";
    welcome.classList.toggle("hidden", !showWelcome);
  }

  if (builder) {
    const showBuilder = currentMode === "list" && (!guideEnabled || stepKey === "list");
    builder.classList.toggle("hidden", !showBuilder);
  }

  if (scanLanding) {
    const showScanLanding = guideEnabled && currentMode === "scan" && stepKey === "scanLanding";
    scanLanding.classList.toggle("hidden", !showScanLanding);
  }
  if (scanWorkspace) {
    const showScanWorkspace = currentMode === "scan" && (!guideEnabled || stepKey === "scan");
    scanWorkspace.classList.toggle("hidden", !showScanWorkspace);
  }

  if (actionLanding) {
    const showActionLanding = guideEnabled && currentMode === "action" && stepKey === "actionLanding";
    actionLanding.classList.toggle("hidden", !showActionLanding);
  }
  if (actionContent) {
    const showActionContent = currentMode === "action" && (!guideEnabled || stepKey === "action");
    actionContent.classList.toggle("hidden", !showActionContent);
  }

  if (maintainLanding) {
    const showMaintainLanding =
      guideEnabled && currentMode === "maintain" && stepKey === "maintainLanding";
    maintainLanding.classList.toggle("hidden", !showMaintainLanding);
  }
  if (maintainContent) {
    const showMaintainContent =
      currentMode === "maintain" && (!guideEnabled || stepKey === "maintain");
    maintainContent.classList.toggle("hidden", !showMaintainContent);
  }

  if (reflectLanding) {
    const showReflectLanding =
      guideEnabled && currentMode === "reflect" && stepKey === "reflectLanding";
    reflectLanding.classList.toggle("hidden", !showReflectLanding);
  }
  if (reflectContent) {
    const showReflectContent =
      currentMode === "reflect" && (!guideEnabled || stepKey === "reflect");
    reflectContent.classList.toggle("hidden", !showReflectContent);
  }

  if (!controls) {
    return;
  }

  const showControls = guideEnabled && state.guide.started && currentMode !== "settings";
  controls.classList.toggle("hidden", !showControls);

  if (!showControls) {
    if (progress) {
      progress.textContent = "";
    }
    if (next) {
      next.textContent = "Next";
    }
    return;
  }

  ensureGuideIndex();
  const stepIndex = state.guide.activeIndex;
  const totalSteps = guideFlow.length;

  if (progress) {
    const label = currentStep?.label || capitalize(stepKey || "");
    progress.textContent = `Step ${stepIndex + 1} of ${totalSteps}: ${label}`;
  }

  if (prev) {
    prev.disabled = stepIndex === 0;
  }

  if (next) {
    next.textContent = stepIndex === totalSteps - 1 ? "Finish" : "Next";
  }
}

function renderListPreview() {
  // Defensive element checking
  const listPreview = elements?.listPreview || document.getElementById("listPreview");
  if (!listPreview) {
    console.warn("listPreview element not found");
    return;
  }

  // Defensive state checking
  if (!state || !state.tasks) {
    console.warn("State or tasks not available for renderListPreview");
    listPreview.innerHTML = "<li>Loading tasks...</li>";
    return;
  }

  listPreview.innerHTML = "";
  state.tasks
    .filter((task) => task.status === "active")
    .forEach((task) => {
      const item = document.createElement("li");
      item.classList.add("swipeable");
      item.dataset.taskId = task.id;

      // Add visual cues for project relationships
      let prefix = "";
      let badges = "";

      if (task.parentId) {
        prefix = "⤷ "; // Subtask arrow
        item.classList.add("subtask");
      }

      if (task.level === "project" || (task.subtasks && task.subtasks.length > 0)) {
        badges += " 🔹";
        item.classList.add("project");
      } else if (task.level === "step") {
        badges += " 🔸";
      } else if (task.level === "meta") {
        badges += " 💭";
      }

      const dottedText = task.dotted ? " • dotted" : "";
      item.innerHTML = `
        <span class="task-content">
          ${prefix}${task.text}${badges}${dottedText}
        </span>
      `;

      // Add click handler for projects to show rollup
      if (task.level === "project" || (task.subtasks && task.subtasks.length > 0)) {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => showProjectRollup(task.id));
      }

      addSwipeToDelete(item, task.id);
      elements.listPreview.appendChild(item);
    });
}

function addSwipeToDelete(item, taskId) {
  let startX = 0;
  let currentX = 0;
  let pointerId = null;

  const resetPosition = () => {
    item.style.transform = "";
    item.classList.remove("dragging");
    item.dataset.swiping = "false";
  };

  const completeDeletion = () => {
    item.classList.remove("dragging");
    item.classList.add("deleting");
    setTimeout(() => deleteTask(taskId), 160);
  };

  const endGesture = (event) => {
    if (event.pointerId !== pointerId) return;
    try {
      item.releasePointerCapture(pointerId);
    } catch (error) {
      // Ignore release errors on unsupported browsers
    }
    const deltaX = Math.min(currentX - startX, 0);
    if (deltaX < -90) {
      completeDeletion();
    } else {
      resetPosition();
    }
    pointerId = null;
  };

  const cancelGesture = (event) => {
    if (pointerId === null || event.pointerId !== pointerId) return;
    try {
      item.releasePointerCapture(pointerId);
    } catch (error) {
      // Ignore release errors on unsupported browsers
    }
    pointerId = null;
    resetPosition();
  };

  item.addEventListener("pointerdown", (event) => {
    pointerId = event.pointerId;
    startX = event.clientX;
    currentX = startX;
    item.dataset.swiping = "false";
    item.classList.add("dragging");
    item.setPointerCapture(pointerId);
  });

  item.addEventListener("pointermove", (event) => {
    if (pointerId === null || event.pointerId !== pointerId) return;
    currentX = event.clientX;
    let deltaX = currentX - startX;
    if (deltaX > 0) {
      deltaX *= 0.3;
    }
    if (Math.abs(deltaX) > 6) {
      item.dataset.swiping = "true";
    }
    item.style.transform = `translateX(${Math.min(deltaX, 0)}px)`;
  });

  item.addEventListener("pointerup", endGesture);
  item.addEventListener("pointercancel", cancelGesture);
  item.addEventListener("lostpointercapture", cancelGesture);

  item.addEventListener("click", (event) => {
    if (item.dataset.swiping === "true") {
      event.preventDefault();
      event.stopPropagation();
    }
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
  if (elements.scanStatus) {
    elements.scanStatus.textContent = "Scanning in progress. Move quickly and trust intuition.";
  }
  renderScanView();
}

function renderScanView() {
  if (!elements.scanView) {
    return;
  }
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
  const wasDotted = task.dotted;
  if (wasDotted) {
    clearTaskDot(task);
  } else {
    markTaskDotted(task);
  }
  task.updatedAt = Date.now();
  if (elements.scanStatus) {
    if (!wasDotted) {
      elements.scanStatus.textContent = "Nice! Dotting marks the effortless tasks.";
    } else {
      elements.scanStatus.textContent = "Dot removed. Keep scanning.";
    }
  }
  saveState();
  render();
}

function completeScan() {
  if (elements.scanStatus) {
    elements.scanStatus.textContent = "Scan complete. Move to Action mode when ready.";
  }
  if (elements.scanView) {
    elements.scanView.classList.remove("active");
    elements.scanView.textContent = "Scan finished. Great work.";
  }
  state.metrics.totalScans += 1;
  bumpDaily(today(), "scans", 1);
  scanSession = null;
  saveState();
  render();
}

function renderActionList() {
  if (currentMode !== "action") return;

  // Defensive element checking
  const actionList = elements?.actionList || document.getElementById("actionList");
  if (!actionList) {
    console.warn("actionList element not found");
    return;
  }

  // Defensive state checking
  if (!state || !state.tasks) {
    console.warn("State or tasks not available for renderActionList");
    actionList.textContent = "Loading tasks...";
    return;
  }

  actionList.innerHTML = "";
  const dottedTasks = state.tasks.filter((task) => task.status === "active" && task.dotted);
  if (dottedTasks.length === 0) {
    actionList.textContent = "Dot tasks in Scanning mode to see them here.";
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
          label: "Split Task",
          onClick: () => showSplitDialog(task.id),
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

  // Defensive element checking
  const maintenanceList = elements?.maintenanceList || document.getElementById("maintenanceList");
  if (!maintenanceList) {
    console.warn("maintenanceList element not found");
    return;
  }

  // Defensive state checking
  if (!state || !state.tasks) {
    console.warn("State or tasks not available for renderMaintenanceList");
    maintenanceList.textContent = "Loading tasks...";
    return;
  }

  maintenanceList.innerHTML = "";
  const activeTasks = state.tasks.filter((task) => task.status === "active");
  if (activeTasks.length === 0) {
    maintenanceList.textContent = "Nothing to prune. Add tasks or re-enter recurring work.";
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

  // Defensive state checking
  if (!state || !state.tasks) {
    console.warn("State or tasks not available for renderReflection");
    return;
  }

  // Defensive element checking
  const completedList = elements?.completedList || document.getElementById("completedList");
  const archivedList = elements?.archivedList || document.getElementById("archivedList");
  const insights = elements?.insights || {
    scans: document.getElementById("insightScans"),
    dots: document.getElementById("insightDots"),
    minutes: document.getElementById("insightMinutes")
  };

  if (!completedList || !archivedList) {
    console.warn("Reflection list elements not found");
    return;
  }

  const day = today();
  const dailyStats = state.daily[day] || { scans: 0, dots: 0, minutes: 0 };

  if (insights.scans) insights.scans.textContent = `Scans today: ${dailyStats.scans || 0}`;
  if (insights.dots) insights.dots.textContent = `Tasks dotted today: ${dailyStats.dots || 0}`;
  if (insights.minutes) insights.minutes.textContent = `Minutes logged: ${Math.round(dailyStats.minutes || 0)}`;

  completedList.innerHTML = "";
  archivedList.innerHTML = "";

  state.tasks
    .filter((task) => task.status === "completed")
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
    .forEach((task) => {
      const item = document.createElement("li");
      item.className = "reflection-item";
      item.textContent = `${task.text} • ${(task.timeLogs.reduce((acc, log) => acc + log.minutes, 0) || 0).toFixed(1)} min`;
      completedList.appendChild(item);
    });

  state.tasks
    .filter((task) => task.status === "archived")
    .sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0))
    .forEach((task) => {
      const item = document.createElement("li");
      item.className = "reflection-item";
      item.textContent = `${task.text} • touched ${task.touches} times`;
      archivedList.appendChild(item);
    });
}

function renderSettingsPanel() {
  // Settings panel removed - no longer needed
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
  clearTaskDot(task);
  task.reentries += 1;
  task.updatedAt = Date.now();
  state.tasks.push(task);
  saveState();
  render();
}

function deleteTask(taskId) {
  const index = state.tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return;
  if (isTimerRunning(taskId)) {
    stopTimer();
  }
  const [task] = state.tasks.splice(index, 1);
  if (task) {
    clearTaskDot(task);
  }
  render();
}

function completeTask(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  if (isTimerRunning(taskId)) stopTimer();
  clearTaskDot(task);
  task.status = "completed";
  task.completedAt = Date.now();
  task.updatedAt = Date.now();
  saveState();
  render();
}

function archiveTask(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  if (isTimerRunning(taskId)) stopTimer();
  clearTaskDot(task);
  task.status = "archived";
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
  const updatedValue = state.daily[day][key] + increment;
  state.daily[day][key] = key === "dots" ? Math.max(0, updatedValue) : updatedValue;
  if (key === "dots") {
    state.metrics.dottedToday = Math.max(0, state.metrics.dottedToday + increment);
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
    const tasks = (parsed.tasks || []).map((task) => ({
      lastDottedOn: null,
      ...task,
      lastDottedOn: task.lastDottedOn || null,
    }));
    const guide = parsed.guide
      ? { ...clone(defaultState.guide), ...parsed.guide }
      : clone(defaultState.guide);
    return {
      ...clone(defaultState),
      ...parsed,
      tasks,
      daily: parsed.daily || {},
      guide,
    };
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

// Simplified scanning function
function startSimplifiedScan() {
  const scanStart = document.getElementById("scanStart");
  if (scanStart) {
    scanStart.style.display = "none";
  }
  beginNewScan();
}

// New improved scanning functions
function beginNewScan() {
  const tasks = getActiveTasks();
  const ordered = state.settings.scanDirection === "forward" ? tasks : [...tasks].reverse();
  scanSession = {
    order: ordered.map((task) => task.id),
    index: 0,
    startedAt: Date.now(),
    recentTasks: [] // Track last few scanned tasks
  };

  const scanProgress = document.getElementById("scanProgress");
  if (scanProgress) {
    scanProgress.classList.remove("hidden");
  }
  renderNewScanView();
}

function renderNewScanView() {
  if (!scanSession || scanSession.index >= scanSession.order.length) {
    finishNewScan();
    return;
  }

  const currentTaskId = scanSession.order[scanSession.index];
  const currentTask = state.tasks.find((t) => t.id === currentTaskId);

  if (!currentTask || currentTask.status !== "active") {
    scanSession.index += 1;
    renderNewScanView();
    return;
  }

  // Update counter
  document.getElementById("scanCounter").textContent =
    `${scanSession.index + 1} / ${scanSession.order.length}`;

  // Render current task
  const currentTaskEl = document.getElementById("currentTask");
  currentTaskEl.innerHTML = `
    <h3>${currentTask.text}</h3>
    <div class="task-meta">
      ${currentTask.level && currentTask.level !== "unspecified" ? `${currentTask.level} • ` : ""}
      ${typeof currentTask.resistance === "number" ? `Resistance: ${currentTask.resistance}` : ""}
    </div>
  `;

  // Render recent tasks (last 3-4)
  renderRecentTasks();
}

function renderRecentTasks() {
  const recentTasksList = document.getElementById("recentTasksList");
  recentTasksList.innerHTML = "";

  if (!scanSession || !scanSession.recentTasks) return;

  const recentTasks = scanSession.recentTasks.slice(-4); // Show last 4

  recentTasks.forEach(taskId => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const item = document.createElement("div");
    item.className = `recent-task-item ${task.dotted ? "dotted" : ""}`;

    item.innerHTML = `
      <span class="recent-task-text">${task.text}</span>
      <button class="recent-task-toggle ${task.dotted ? "dotted" : ""}"
              data-task-id="${task.id}">
        ${task.dotted ? "Dotted" : "Undotted"}
      </button>
    `;

    // Add click handler for toggle
    const toggleBtn = item.querySelector(".recent-task-toggle");
    toggleBtn.addEventListener("click", () => {
      toggleTaskDot(task.id);
      renderRecentTasks(); // Re-render to update state
    });

    recentTasksList.appendChild(item);
  });
}

function markTaskDotted(task) {
  if (!task || task.dotted) return;

  task.dotted = true;
  task.lastDottedOn = today();
  task.dottedCount = (task.dottedCount || 0) + 1;
  bumpDaily(task.lastDottedOn, "dots", 1);
}

function clearTaskDot(task) {
  if (!task || !task.dotted) return;

  const dottedDay = task.lastDottedOn;
  task.dotted = false;
  task.lastDottedOn = null;

  if (dottedDay === today()) {
    bumpDaily(today(), "dots", -1);
  }
}

function advanceNewScan(shouldDot) {
  const currentTaskId = scanSession.order[scanSession.index];
  const currentTask = state.tasks.find((t) => t.id === currentTaskId);

  if (currentTask) {
    // Update task state
    currentTask.touches += 1;
    currentTask.scanCount += 1;
    currentTask.updatedAt = Date.now();

    if (shouldDot) {
      markTaskDotted(currentTask);
    }

    if (typeof currentTask.resistance === "number" && currentTask.resistance > 0) {
      currentTask.resistance = Math.max(0, currentTask.resistance - 1);
    }

    // Add to recent tasks
    scanSession.recentTasks.push(currentTaskId);
  }

  scanSession.index += 1;
  saveState();
  renderNewScanView();
}

function toggleTaskDot(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const wasDotted = task.dotted;
  if (wasDotted) {
    clearTaskDot(task);
  } else {
    markTaskDotted(task);
  }

  task.updatedAt = Date.now();
  saveState();

  // Only re-render recent tasks if we're in an active scan
  if (scanSession && scanSession.recentTasks) {
    renderRecentTasks();
  }
  render();
}

function finishNewScan() {
  const scanProgress = document.getElementById("scanProgress");
  const scanStart = document.getElementById("scanStart");

  if (scanProgress) scanProgress.classList.add("hidden");
  if (scanStart) {
    scanStart.style.display = "flex";
    scanStart.innerHTML = `
      <div class="scan-instructions">
        <h2>Scan complete!</h2>
        <p>Great work! Move to Action mode to work on dotted tasks.</p>
      </div>
      <button id="beginScanBtn" class="big-scan-button">Scan Again</button>
    `;

    // Re-attach event listener
    const newBtn = document.getElementById("beginScanBtn");
    if (newBtn) {
      newBtn.addEventListener("click", () => {
        if (!state.tasks.some((t) => t.status === "active")) {
          alert("Add tasks in List Building mode to start scanning.");
          return;
        }
        startSimplifiedScan();
      });
    }
  }

  state.metrics.totalScans += 1;
  bumpDaily(today(), "scans", 1);
  scanSession = null;
  saveState();
  render();
  updateGuideControls(); // Update button from "Cancel" back to "Next Step"
}

// Task splitting and project functions
function showSplitDialog(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const dialog = document.createElement("div");
  dialog.className = "split-dialog";
  dialog.innerHTML = `
    <div class="split-dialog-content">
      <h3>Split "${task.text}" into smaller tasks</h3>
      <p>The original task will become a project. Add subtasks below:</p>

      <div class="subtask-list" id="subtaskList">
        <input type="text" class="subtask-input" placeholder="First subtask..." />
        <input type="text" class="subtask-input" placeholder="Second subtask..." />
      </div>

      <button type="button" id="addSubtaskInput">+ Add another subtask</button>

      <div class="dialog-actions">
        <button type="button" class="dialog-secondary" id="cancelSplit">Cancel</button>
        <button type="button" class="dialog-primary" id="confirmSplit">Split Task</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // Event listeners
  document.getElementById("addSubtaskInput").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "subtask-input";
    input.placeholder = "Another subtask...";
    document.getElementById("subtaskList").appendChild(input);
  });

  document.getElementById("cancelSplit").addEventListener("click", () => {
    document.body.removeChild(dialog);
  });

  document.getElementById("confirmSplit").addEventListener("click", () => {
    const inputs = dialog.querySelectorAll(".subtask-input");
    const subtasks = Array.from(inputs)
      .map(input => input.value.trim())
      .filter(text => text.length > 0);

    if (subtasks.length > 0) {
      splitTask(taskId, subtasks);
    }
    document.body.removeChild(dialog);
  });
}

function splitTask(parentTaskId, subtaskTexts) {
  const parentTask = state.tasks.find(t => t.id === parentTaskId);
  if (!parentTask) return;

  // Convert parent to project
  parentTask.level = "project";
  parentTask.updatedAt = Date.now();

  // Find parent task index to insert subtasks after it
  const parentIndex = state.tasks.findIndex(t => t.id === parentTaskId);

  // Create subtasks
  const newSubtasks = subtaskTexts.map(text => {
    const subtask = createTask({
      text,
      resistance: null,
      level: "step",
      notes: "",
      parentId: parentTaskId
    });
    return subtask;
  });

  // Insert subtasks right after parent in the list
  state.tasks.splice(parentIndex + 1, 0, ...newSubtasks);

  // Link subtasks to parent
  parentTask.subtasks = newSubtasks.map(st => st.id);

  saveState();
  render();
}

function showProjectRollup(projectId) {
  const project = state.tasks.find(t => t.id === projectId);
  if (!project) return;

  const linkedSubtasks = state.tasks.filter(t => t.parentId === projectId);

  // Calculate aggregated stats
  const totalSubtasks = linkedSubtasks.length;
  const completedSubtasks = linkedSubtasks.filter(t => t.status === "completed").length;
  const totalTime = linkedSubtasks.reduce((acc, task) => {
    return acc + task.timeLogs.reduce((sum, log) => sum + log.minutes, 0);
  }, 0);

  const dialog = document.createElement("div");
  dialog.className = "project-rollup";
  dialog.innerHTML = `
    <div class="rollup-content">
      <div class="rollup-header">
        <h3>🔹 ${project.text}</h3>
        <button type="button" id="closeRollup">✕</button>
      </div>

      <div class="rollup-stats">
        <div class="rollup-stat">
          <div class="rollup-stat-value">${totalSubtasks}</div>
          <div class="rollup-stat-label">Total Subtasks</div>
        </div>
        <div class="rollup-stat">
          <div class="rollup-stat-value">${completedSubtasks}</div>
          <div class="rollup-stat-label">Completed</div>
        </div>
        <div class="rollup-stat">
          <div class="rollup-stat-value">${totalTime.toFixed(1)}h</div>
          <div class="rollup-stat-label">Time Logged</div>
        </div>
      </div>

      <h4>Linked Subtasks:</h4>
      <div class="subtask-list">
        ${linkedSubtasks.map(task => `
          <div class="subtask-item">
            <span>⤷ ${task.text}</span>
            <span class="task-status">${task.status === "completed" ? "✓" : task.dotted ? "•" : ""}</span>
          </div>
        `).join("")}
      </div>

      <div class="dialog-actions">
        <button type="button" class="dialog-secondary" id="unlinkSubtasks">Unlink All</button>
        <button type="button" class="dialog-primary" id="closeRollup2">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // Event listeners
  document.getElementById("closeRollup").addEventListener("click", () => {
    document.body.removeChild(dialog);
  });

  document.getElementById("closeRollup2").addEventListener("click", () => {
    document.body.removeChild(dialog);
  });

  document.getElementById("unlinkSubtasks").addEventListener("click", () => {
    unlinkSubtasks(projectId);
    document.body.removeChild(dialog);
  });
}

function unlinkSubtasks(projectId) {
  const project = state.tasks.find(t => t.id === projectId);
  if (!project) return;

  // Remove parent links from subtasks
  state.tasks.forEach(task => {
    if (task.parentId === projectId) {
      task.parentId = null;
    }
  });

  // Clear subtask array from project
  project.subtasks = [];

  // If project has no more subtasks, convert back to regular task
  if (project.level === "project") {
    project.level = "unspecified";
  }

  saveState();
  render();
}

// New flow management functions
function startResZeroFlow() {
  state.guide.started = true;
  state.guide.activeIndex = 1; // Start at first instruction step
  saveState();
  showCurrentStep();
}

function showCurrentStep() {
  const step = guideFlow[state.guide.activeIndex];
  if (!step) return;

  // Hide intro page
  if (elements.introPage) {
    elements.introPage.classList.add("hidden");
  }

  // Show mode section and guide controls
  if (elements.modeSection) {
    elements.modeSection.classList.remove("hidden");
  }
  if (elements.guide.controls) {
    elements.guide.controls.classList.remove("hidden");
  }

  // Hide all panels
  Object.values(elements.panels).forEach(panel => {
    if (panel) panel.classList.add("hidden");
  });

  // Show current panel
  const targetPanel = elements.panels[step.mode];
  if (targetPanel) {
    targetPanel.classList.remove("hidden");
  }

  updateGuideControls();
}

function updateGuideControls() {
  const step = guideFlow[state.guide.activeIndex];
  if (!step) return;

  // Fix step numbering: instructions and action for same step should have same number
  // Index 1,2 = Step 1; Index 3,4 = Step 2; etc.
  const stepNumber = Math.floor((state.guide.activeIndex - 1) / 2) + 1;
  const isInstructionStep = step.mode.includes("Instructions");

  // Update progress label
  if (elements.guide.progress) {
    elements.guide.progress.textContent = `Step ${stepNumber} of 5`;
  }

  // Update button text
  if (elements.guide.prev) {
    if (isInstructionStep) {
      elements.guide.prev.textContent = state.guide.activeIndex === 1 ? "Back to Intro" : "Previous Step";
      elements.guide.prev.style.display = "inline-block";
    } else {
      elements.guide.prev.textContent = "Instructions";
      elements.guide.prev.style.display = "inline-block";
    }
  }

  // Update next button text and visibility
  if (elements.guide.next) {
    // Remove any existing disabled state
    elements.guide.next.disabled = false;
    elements.guide.next.classList.remove("disabled");

    if (state.guide.activeIndex === guideFlow.length - 1) {
      elements.guide.next.textContent = "Start New Cycle";
      elements.guide.next.style.display = "inline-block";
    } else {
      if (isInstructionStep) {
        // Hide the next button on instruction steps since user should use the step-specific button
        elements.guide.next.style.display = "none";
      } else {
        // Check if we're in scan mode and actively scanning
        if (step.mode === "scan" && scanSession) {
          elements.guide.next.textContent = "Cancel";
          elements.guide.next.style.display = "inline-block";
          // Add a data attribute to track that this is a cancel button
          elements.guide.next.dataset.action = "cancel-scan";
        } else {
          elements.guide.next.textContent = "Next Step";
          elements.guide.next.style.display = "inline-block";
          // Remove cancel action data attribute
          delete elements.guide.next.dataset.action;
        }
      }
    }
  }
}

function moveToNextStep() {
  // Check if this is a cancel action during scanning
  if (elements.guide.next && elements.guide.next.dataset.action === "cancel-scan") {
    // Cancel the scanning session
    scanSession = null;

    // Reset the scan UI
    const scanProgress = document.getElementById("scanProgress");
    const scanStart = document.getElementById("scanStart");
    if (scanProgress) scanProgress.classList.add("hidden");
    if (scanStart) {
      scanStart.style.display = "flex";
      scanStart.innerHTML = `
        <div class="scan-instructions">
          <h2>Ready to scan?</h2>
          <p>Go through each task quickly and dot what feels effortless.</p>
        </div>
        <button id="beginScanBtn" class="big-scan-button">Begin</button>
      `;

      // Re-attach event listener
      const newBtn = document.getElementById("beginScanBtn");
      if (newBtn) {
        newBtn.addEventListener("click", () => {
          if (!state.tasks.some((t) => t.status === "active")) {
            alert("Add tasks in List Building mode to start scanning.");
            return;
          }
          startSimplifiedScan();
        });
      }
    }

    // Update the controls to show "Next Step" again
    updateGuideControls();
    return;
  }

  // Normal next step logic
  if (state.guide.activeIndex < guideFlow.length - 1) {
    state.guide.activeIndex++;
  } else {
    // Start new cycle
    state.guide.activeIndex = 1; // Back to first instruction step (skip intro)
  }
  saveState();
  showCurrentStep();
}

function moveToPrevStep() {
  const step = guideFlow[state.guide.activeIndex];
  const isInstructionStep = step?.mode.includes("Instructions");

  if (isInstructionStep) {
    // Go to previous step or intro
    if (state.guide.activeIndex > 1) {
      state.guide.activeIndex--;
    } else {
      // Go back to intro
      state.guide.activeIndex = 0;
      state.guide.started = false;
      if (elements.introPage) {
        elements.introPage.classList.remove("hidden");
      }
      if (elements.modeSection) {
        elements.modeSection.classList.add("hidden");
      }
      if (elements.guide.controls) {
        elements.guide.controls.classList.add("hidden");
      }
      Object.values(elements.panels).forEach(panel => {
        if (panel) panel.classList.add("hidden");
      });
      saveState();
      return;
    }
  } else {
    // Go back to instructions for this step
    state.guide.activeIndex--;
  }

  saveState();
  showCurrentStep();
}

// Initialize the flow
if (state.guide.started) {
  showCurrentStep();
} else {
  // Show intro page and hide all guide elements
  if (elements.introPage) {
    elements.introPage.classList.remove("hidden");
  }
  if (elements.modeSection) {
    elements.modeSection.classList.add("hidden");
  }
  if (elements.guide.controls) {
    elements.guide.controls.classList.add("hidden");
  }
  Object.values(elements.panels).forEach(panel => {
    if (panel) panel.classList.add("hidden");
  });
}
