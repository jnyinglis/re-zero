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
    guideMode: false,
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
    view: "instructions",
  },
};

let state = loadState();
if (!state.guide) {
  state.guide = clone(defaultState.guide);
}
if (typeof state.settings.guideMode !== "boolean") {
  state.settings.guideMode = defaultState.settings.guideMode;
}
if (!state.guide.view || !["instructions", "workspace"].includes(state.guide.view)) {
  state.guide.view = "instructions";
}

const guideFlow = [
  { key: "list", mode: "list", label: "List Building" },
  { key: "scan", mode: "scan", label: "Scanning" },
  { key: "action", mode: "action", label: "Action" },
  { key: "maintain", mode: "maintain", label: "Maintenance" },
  { key: "reflect", mode: "reflect", label: "Reflection" },
];

const guideStepIndexByKey = guideFlow.reduce((map, step, index) => {
  map[step.key] = index;
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
    settings: document.getElementById("settingsMode"),
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
  settings: {
    scanDirection: document.getElementById("settingsScanDirection"),
    guideMode: document.getElementById("settingsGuideMode"),
  },
  guide: {
    controls: document.getElementById("guideControls"),
    prev: document.getElementById("guidePrev"),
    next: document.getElementById("guideNext"),
    progress: document.getElementById("guideProgressLabel"),
    intro: document.getElementById("guideIntroPage"),
    listInstructions: document.getElementById("listInstructions"),
    builder: document.getElementById("listBuilderContent"),
    startRezero: document.getElementById("startRezero"),
    listStart: document.getElementById("startListBuilding"),
    scanInstructions: document.getElementById("scanInstructions"),
    scanWorkspace: document.getElementById("scanWorkspace"),
    scanAdvance: document.getElementById("startScanningStage"),
    actionInstructions: document.getElementById("actionInstructions"),
    actionContent: document.getElementById("actionContent"),
    actionAdvance: document.getElementById("startActionStage"),
    maintainInstructions: document.getElementById("maintainInstructions"),
    maintainContent: document.getElementById("maintainContent"),
    maintainAdvance: document.getElementById("startMaintenanceStage"),
    reflectInstructions: document.getElementById("reflectInstructions"),
    reflectContent: document.getElementById("reflectContent"),
    reflectAdvance: document.getElementById("startReflectionStage"),
  },
};

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

if (elements.guide.startRezero) {
  elements.guide.startRezero.addEventListener("click", () => startGuideSession());
}

if (elements.guide.listStart) {
  elements.guide.listStart.addEventListener("click", () => {
    moveToGuideStep("list", { view: "workspace" });
    setTimeout(() => elements.taskText?.focus(), 0);
  });
}

if (elements.guide.scanAdvance) {
  elements.guide.scanAdvance.addEventListener("click", () => moveToGuideStep("scan", { view: "workspace" }));
}

if (elements.guide.actionAdvance) {
  elements.guide.actionAdvance.addEventListener("click", () => moveToGuideStep("action", { view: "workspace" }));
}

if (elements.guide.maintainAdvance) {
  elements.guide.maintainAdvance.addEventListener("click", () => moveToGuideStep("maintain", { view: "workspace" }));
}

if (elements.guide.reflectAdvance) {
  elements.guide.reflectAdvance.addEventListener("click", () => moveToGuideStep("reflect", { view: "workspace" }));
}

if (elements.guide.prev) {
  elements.guide.prev.addEventListener("click", () => {
    if (!state.guide.started) return;
    const currentStep = getCurrentGuideStep();
    if (!currentStep) return;
    if (state.guide.view === "workspace") {
      moveToGuideStep(currentStep.key, { view: "instructions" });
      return;
    }
    navigateGuide(-1);
  });
}

if (elements.guide.next) {
  elements.guide.next.addEventListener("click", () => handleGuideNext());
}

if (elements.settings.guideMode) {
  elements.settings.guideMode.checked = state.settings.guideMode;
  elements.settings.guideMode.addEventListener("change", (event) => {
    toggleGuideMode(event.target.checked);
  });
}

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

if (elements.settings.scanDirection) {
  elements.settings.scanDirection.value = state.settings.scanDirection;
  elements.settings.scanDirection.addEventListener("change", (event) => {
    state.settings.scanDirection = event.target.value;
    saveState();
    highlightScanDirection();
    render();
  });
}

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

function moveToGuideStep(key, options = {}) {
  const index = guideStepIndexByKey[key];
  if (typeof index !== "number") return;
  state.guide.started = true;
  state.guide.activeIndex = index;
  state.guide.view = options.view === "workspace" ? "workspace" : "instructions";
  const step = guideFlow[index];
  setMode(step ? step.mode : "list", { overrideGuideStep: true });
}

function startGuideSession() {
  moveToGuideStep("list", { view: "instructions" });
}

function toggleGuideMode(enabled) {
  state.settings.guideMode = enabled;
  if (!enabled) {
    state.guide.started = false;
    state.guide.activeIndex = 0;
    state.guide.view = "instructions";
    render();
    return;
  }
  state.guide.started = false;
  state.guide.activeIndex = 0;
  state.guide.view = "instructions";
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
  state.guide.view = "instructions";
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
  state.guide.view = "instructions";
  setMode("list", { overrideGuideStep: true });
}

function updateGuidance() {
  let message = "";
  const currentStep = getCurrentGuideStep();
  const guideEnabled = isGuideModeEnabled();
  if (guideEnabled && currentMode === "list" && !state.guide.started) {
    message = "Guide mode is ready. Press Start Rezero to move through the cycle.";
  } else if (guideEnabled && currentStep && state.guide.view !== "workspace") {
    message = `Review the instructions for ${currentStep.label}.`;
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
    intro,
    listInstructions,
    builder,
    controls,
    prev,
    next,
    progress,
    scanInstructions,
    scanWorkspace,
    actionInstructions,
    actionContent,
    maintainInstructions,
    maintainContent,
    reflectInstructions,
    reflectContent,
  } = elements.guide;

  const currentStep = getCurrentGuideStep();
  const stepKey = currentStep?.key;

  const view = state.guide?.view === "workspace" ? "workspace" : "instructions";
  const showingInstructions = guideEnabled && state.guide.started && view !== "workspace";
  const showingWorkspace = guideEnabled && state.guide.started && view === "workspace";

  if (intro) {
    const showIntro = guideEnabled && !state.guide.started && currentMode === "list";
    intro.classList.toggle("hidden", !showIntro);
  }

  if (listInstructions) {
    const showListInstructions =
      guideEnabled &&
      state.guide.started &&
      currentMode === "list" &&
      stepKey === "list" &&
      showingInstructions;
    listInstructions.classList.toggle("hidden", !showListInstructions);
  }

  if (builder) {
    const showBuilder =
      currentMode === "list" &&
      (!guideEnabled || (state.guide.started && stepKey === "list" && showingWorkspace));
    builder.classList.toggle("hidden", !showBuilder);
  }

  if (scanInstructions) {
    const showScanInstructions =
      guideEnabled &&
      state.guide.started &&
      currentMode === "scan" &&
      stepKey === "scan" &&
      showingInstructions;
    scanInstructions.classList.toggle("hidden", !showScanInstructions);
  }
  if (scanWorkspace) {
    const showScanWorkspace =
      currentMode === "scan" &&
      (!guideEnabled || (state.guide.started && stepKey === "scan" && showingWorkspace));
    scanWorkspace.classList.toggle("hidden", !showScanWorkspace);
  }

  if (actionInstructions) {
    const showActionInstructions =
      guideEnabled &&
      state.guide.started &&
      currentMode === "action" &&
      stepKey === "action" &&
      showingInstructions;
    actionInstructions.classList.toggle("hidden", !showActionInstructions);
  }
  if (actionContent) {
    const showActionContent =
      currentMode === "action" &&
      (!guideEnabled || (state.guide.started && stepKey === "action" && showingWorkspace));
    actionContent.classList.toggle("hidden", !showActionContent);
  }

  if (maintainInstructions) {
    const showMaintainInstructions =
      guideEnabled &&
      state.guide.started &&
      currentMode === "maintain" &&
      stepKey === "maintain" &&
      showingInstructions;
    maintainInstructions.classList.toggle("hidden", !showMaintainInstructions);
  }
  if (maintainContent) {
    const showMaintainContent =
      currentMode === "maintain" &&
      (!guideEnabled || (state.guide.started && stepKey === "maintain" && showingWorkspace));
    maintainContent.classList.toggle("hidden", !showMaintainContent);
  }

  if (reflectInstructions) {
    const showReflectInstructions =
      guideEnabled &&
      state.guide.started &&
      currentMode === "reflect" &&
      stepKey === "reflect" &&
      showingInstructions;
    reflectInstructions.classList.toggle("hidden", !showReflectInstructions);
  }
  if (reflectContent) {
    const showReflectContent =
      currentMode === "reflect" &&
      (!guideEnabled || (state.guide.started && stepKey === "reflect" && showingWorkspace));
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
    if (prev) {
      prev.textContent = "Previous";
      prev.disabled = true;
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
    if (showingWorkspace) {
      prev.textContent = "Instructions";
      prev.disabled = false;
    } else {
      prev.textContent = "Previous";
      prev.disabled = stepIndex === 0;
    }
  }

  if (next) {
    next.textContent = stepIndex === totalSteps - 1 ? "Finish" : "Next";
  }
}

function renderListPreview() {
  elements.listPreview.innerHTML = "";
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

function renderSettingsPanel() {
  if (elements.settings.scanDirection) {
    elements.settings.scanDirection.value = state.settings.scanDirection;
  }
  if (elements.settings.guideMode) {
    elements.settings.guideMode.checked = state.settings.guideMode;
  }
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

setMode(currentMode);
