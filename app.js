const DEFAULT_PROJECT_NAME = "세종천안 2공구 (주)한화";
// 일차 슬롯: 일반 모드는 기존처럼 기본 5개. 관리자 모드에서 전체 2일차 표시나 추가/삭제/이름변경을 조정합니다.
const DEFAULT_DAY_SLOT_COUNT = 5;
const TWO_DAY_SLOT_COUNT = 2;
const MAX_DAY_SLOT_COUNT = 12;
const DEFAULT_TEMPERATURE_SLOT_COUNT = 2;
const MAX_TEMPERATURE_SLOT_COUNT = 12;
const DAY_SLOT_LIST_STORAGE_KEY = "concrete-photo-board-ui:day-slots";
const TEMPERATURE_SLOT_LIST_STORAGE_KEY = "concrete-photo-board-ui:temperature-slots";
const DAY_SLOT_EXTRA_HIDDEN_STORAGE_KEY = "concrete-photo-board-ui:day-slot-extra-hidden";
const PRINT_DAY_LABEL_BLIND_STORAGE_KEY = "concrete-photo-board-ui:print-day-label-blind";
const DAY_SLOT_LABELS_STORAGE_KEY = "concrete-photo-board-ui:day-slot-labels";
const BOARD_SETTINGS_FALLBACK_PREFIX = "concrete-photo-board-ui:board-settings:";
const STORAGE_CLEANUP_QUEUE_KEY = "concrete-photo-board-ui:storage-cleanup-queue";
const BOARD_RESULT_PANEL_OPEN_STORAGE_KEY = "concrete-photo-board-ui:board-result-panel-open";
const BOARD_RESULT_VIEW_STORAGE_KEY = "concrete-photo-board-ui:board-result-view";
const BOARD_RESULT_VIEWS = {
  ALL: "all",
  MONTH: "month",
  DAY: "day",
};
const PHOTO_TYPES = {
  CURING: "curing",
  TEMPERATURE: "temperature",
};
const PHOTO_MISSING_TEXT = "사진 미등록";
const RAIN_HOLD_TEXT = "우천으로 인한 양생 대기";
const DEFAULT_PHOTO_TYPE = PHOTO_TYPES.CURING;
// 관리자 모드: 검색창에 "관리자" 입력 시 토글. 온도측정 탭·등록정보 표시·파괴적 작업(삭제/타설일 변경)을 관리자 모드로 통합합니다.
const ADMIN_MODE_STORAGE_KEY = "concrete-photo-board-ui:admin";
const ADMIN_TOGGLE_CODE = "관리자";
// 구 버전 "온도 표시/숨김"(표시·숨김) 개인 설정 키 — init에서 정리 후 관리자 모드로 흡수합니다.
const LEGACY_TEMPERATURE_VISIBILITY_STORAGE_KEY = "concrete-photo-board-ui:temperature-visible";
const PHOTO_TYPE_CONFIG = {
  [PHOTO_TYPES.CURING]: {
    label: "습윤양생",
    sectionTitle: "습윤양생 사진",
    contentText: "습윤양생",
    shortLabel: "양생",
    missingText: PHOTO_MISSING_TEXT,
    slotLabel: (slot) => `${slot}일차`,
    slotDateLabel: (slot) => formatDayDate(slot),
    slotCompactLabel: (slot) => formatCompactDayDate(slot),
  },
  [PHOTO_TYPES.TEMPERATURE]: {
    label: "온도측정",
    sectionTitle: "온도측정 사진",
    contentText: "온도측정",
    shortLabel: "측정",
    missingText: PHOTO_MISSING_TEXT,
    slotLabel: (slot) => `측정 ${slot}`,
    slotDateLabel: () => "필요 시",
    slotCompactLabel: () => "순번",
  },
};
const LOCAL_PREFIX = "curing-photo-board:";
const META_DRAFT_PREFIX = `${LOCAL_PREFIX}meta-draft:`;
const SUPABASE_JS_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
const HEIC2ANY_URL = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";
const JSPDF_URL = "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js";
const SCRIPT_LOAD_TIMEOUT_MS = 10000;
const WEATHER_FUNCTION_NAME = "kma-weather";
const WEATHER_STATION_ID = "494";
const WEATHER_STATION_NAME = "세종고운 AWS";
const WEATHER_STATION_DISTANCE_KM = 3.7;
const WEATHER_REQUEST_TIMEOUT_MS = 12000;
const STORAGE_DISPLAY_LIMIT_BYTES = 1024 * 1024 * 1024;
const ESTIMATED_PHOTO_BYTES = 450 * 1024;
const IMAGE_MAX_WIDTH = 1280;
const IMAGE_MAX_HEIGHT = 853;
const IMAGE_QUALITY = 0.7;
const PRINT_PAGE_GROUP_SIZE = 2; // 사진대지 1페이지당 일차 수(2일차 = 사진 2장). 일차 수에 맞춰 페이지가 자동 증감합니다.
const PRINT_MM_SCALE = 6;
const PRINT_PAGE_WIDTH_MM = 210;
const PRINT_PAGE_HEIGHT_MM = 297;
const PRINT_TABLE_WIDTH_MM = 152.02;
const PRINT_TABLE_HEIGHT_MM = 210.1;
const PRINT_TITLE_TOP_MARGIN_MM = 30;
const PRINT_LABEL_WIDTH_MM = 22.03;
const PRINT_MAIN_WIDTH_MM = 113.91;
const PRINT_DAY_WIDTH_MM = 16.08;
const PRINT_PHOTO_ROW_HEIGHT_MM = 84;
const PRINT_INFO_ROW_HEIGHT_MM = 10.525;
const DELETED_BOARD_PROJECT_NAME = "__deleted_photo_board__";
const DELETED_BOARD_LABEL = "[삭제됨]";
const HIDDEN_BOARD_CODES_STORAGE_KEY = "concrete-photo-board-ui:hidden-board-codes";
const PRINT_PHOTO_WIDTH_MM = 120;
const PRINT_PHOTO_HEIGHT_MM = 80;
const STANDARD_DOCUMENT_MIN_ZOOM = 0.75;
const STANDARD_DOCUMENT_MAX_ZOOM = 3;
const STANDARD_DOCUMENT_ZOOM_STEP = 0.25;
const STANDARD_DOCUMENT_PAGE_WIDTH = 1488;
const STANDARD_DOCUMENT_PAGE_HEIGHT = 2103;
const STANDARD_DOCUMENTS = {
  kcs: {
    title: "KCS 14 20 41 : 2025 서중 콘크리트",
    pages: buildStandardDocumentPages("standards/kcs-14-20-41-2025/pages", 11),
  },
  excs: {
    title: "EXCS 14 20 41 : 2021 서중 콘크리트",
    pages: buildStandardDocumentPages("standards/excs-14-20-41-2021/pages", 8),
  },
};
const STANDARD_DOCUMENT_SEARCH_INDEX = window.STANDARD_DOCUMENT_SEARCH_INDEX || {};

function buildStandardDocumentPages(folder, pageCount) {
  return Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;
    return {
      pageNumber,
      src: `${folder}/page-${String(pageNumber).padStart(2, "0")}.webp`,
      width: STANDARD_DOCUMENT_PAGE_WIDTH,
      height: STANDARD_DOCUMENT_PAGE_HEIGHT,
    };
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createDefaultBoardSettings() {
  return {
    daySlots: Array.from({ length: DEFAULT_DAY_SLOT_COUNT }, (_, index) => index + 1),
    temperatureSlots: Array.from({ length: DEFAULT_TEMPERATURE_SLOT_COUNT }, (_, index) => index + 1),
    extraDaySlotsHidden: false,
    dayLabels: {},
  };
}

const elements = {
  standardButton: document.getElementById("standardButton"),
  standardPanel: document.getElementById("standardPanel"),
  standardDocViewer: document.getElementById("standardDocViewer"),
  standardDocTitle: document.getElementById("standardDocTitle"),
  standardDocPageLabel: document.getElementById("standardDocPageLabel"),
  standardDocZoomOut: document.getElementById("standardDocZoomOut"),
  standardDocZoomIn: document.getElementById("standardDocZoomIn"),
  standardDocZoomLabel: document.getElementById("standardDocZoomLabel"),
  standardDocClose: document.getElementById("standardDocClose"),
  standardDocStage: document.getElementById("standardDocStage"),
  standardDocPages: document.getElementById("standardDocPages"),
  standardDocSearchInput: document.getElementById("standardDocSearchInput"),
  standardDocSearchCount: document.getElementById("standardDocSearchCount"),
  searchButton: document.getElementById("searchButton"),
  printButton: document.getElementById("printButton"),
  newBoardButton: document.getElementById("newBoardButton"),
  dayBlindButton: document.getElementById("dayBlindButton"),
  boardSearchBar: document.getElementById("boardSearchBar"),
  boardSearchInput: document.getElementById("boardSearchInput"),
  clearSearchButton: document.getElementById("clearSearchButton"),
  boardResultToggleButton: document.getElementById("boardResultToggleButton"),
  boardResultFilter: document.getElementById("boardResultFilter"),
  boardResultViewButtons: Array.from(document.querySelectorAll("[data-board-result-view]")),
  boardResultCount: document.getElementById("boardResultCount"),
  boardResultSummary: document.getElementById("boardResultSummary"),
  weatherAuditPanel: document.getElementById("weatherAuditPanel"),
  storageMeterText: document.getElementById("storageMeterText"),
  storageMeterBar: document.getElementById("storageMeterBar"),
  boardListSection: document.getElementById("boardListSection"),
  boardListExpandButton: document.getElementById("boardListExpandButton"),
  boardList: document.getElementById("boardList"),
  projectNameInput: document.getElementById("projectNameInput"),
  pourPartInput: document.getElementById("pourPartInput"),
  pourDateInput: document.getElementById("pourDateInput"),
  prevPourDateButton: document.getElementById("prevPourDateButton"),
  nextPourDateButton: document.getElementById("nextPourDateButton"),
  photoSectionTitle: document.getElementById("photoSectionTitle"),
  photoTypeTabs: document.getElementById("photoTypeTabs"),
  summaryList: document.getElementById("summaryList"),
  dayGrid: document.getElementById("dayGrid"),
  printArea: document.getElementById("printArea"),
  photoViewer: document.getElementById("photoViewer"),
  photoViewerImage: document.getElementById("photoViewerImage"),
  photoViewerClose: document.getElementById("photoViewerClose"),
  syncStatus: document.getElementById("syncStatus"),
  toast: document.getElementById("toast"),
};

const config = window.CONCRETE_PHOTO_CONFIG || {};
let dbClient = null;
let weatherLoadState = "idle";
let weatherLoadError = "";
let weatherDailyByDate = new Map();
let weatherFetchedAt = "";
let weatherPersistenceAvailable = false;
let weatherPersistenceMessage = "";
let weatherLiveWarning = "";
let weatherMismatchFilterActive = false;
let realtimeChannel = null;
let metaSaveTimer = null;
let isMetaSaveInProgress = false;
let metaSavePromise = null;
let pendingMetaSaveOptions = null;
let atomicPhotoRpcAvailable = null;
let atomicDeleteMarkRpcAvailable = null;
let atomicDeletePurgeRpcAvailable = null;
let boardSettingsColumnAvailable = null;
let boardSettingsSaveChain = Promise.resolve();
let boardSettingsRevision = 0;
let boardSettingsSaveCount = 0;
let deletedBoardCleanupPromise = null;
const deletedBoardCleanupRetryAt = new Map();
let lastSyncedMeta = { projectName: "", pourPart: "", pourDate: "" };
let boardList = [];
let boardSearchQuery = "";
let isBoardResultPanelOpen = loadBoardResultPanelOpen();
let boardResultViewMode = loadBoardResultViewMode();
let boardResultSelectedGroup = null;
let boardListRenderFrame = 0;
let isBoardSearchComposing = false;
let isFilePickerOpen = false;
let filePickerClearTimer = null;
let pendingRealtimeRefresh = false;
let activePhotoMutationCount = 0;
let boardLoadToken = 0;
let entryLoadSequence = 0;
let printPreviewRenderToken = 0;
let printPreviewTimer = null;
let activePhotoType = DEFAULT_PHOTO_TYPE;
let pasteTargetDay = null;
let lastPhotoViewerTrigger = null;
let printImageCache = {
  signature: "",
  images: [],
};
let isAdminMode = loadAdminMode();
let activeStandardDocumentKey = "";
let activeStandardDocumentPage = 1;
let standardDocumentZoom = 1;
let standardDocumentSearchMatches = [];
let standardDocumentScrollFrame = 0;

let state = {
  shareCode: "",
  boardId: null,
  projectName: DEFAULT_PROJECT_NAME,
  pourPart: "",
  pourDate: "",
  createdAt: "",
  entries: {},
  settings: createDefaultBoardSettings(),
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  state.shareCode = ensureShareCode();
  bindEvents();
  cleanupLegacyPreferences();
  applyAdminModeUi();
  setSyncStatus("저장소를 확인하는 중입니다.");

  if (canUseCloud()) {
    await setupCloudMode();
  } else {
    if (state.shareCode) {
      loadLocalBoard();
    } else {
      resetCurrentBoard();
    }
    await loadBoardList();
    setSyncStatus("현재 브라우저에만 저장됩니다. 공유 저장소 연결을 확인해 주세요.");
  }

  renderAll();
  loadWeatherData().catch(() => {});

  // 현장 통신이 약할 수 있어, PDF 생성용 라이브러리를 미리 받아둔다. (실패해도 무시)
  ensureJsPdf().catch(() => {});
}

function bindEvents() {
  elements.standardButton.addEventListener("click", toggleStandardPanel);
  elements.standardPanel.addEventListener("click", handleStandardPanelClick);
  elements.searchButton.addEventListener("click", toggleBoardSearch);
  elements.boardSearchInput.addEventListener("compositionstart", () => {
    isBoardSearchComposing = true;
  });
  elements.boardSearchInput.addEventListener("compositionend", () => {
    isBoardSearchComposing = false;
    handleBoardSearchInput();
  });
  elements.boardSearchInput.addEventListener("input", () => {
    if (isBoardSearchComposing) return;
    handleBoardSearchInput();
  });
  elements.boardSearchInput.addEventListener("keyup", () => {
    if (isBoardSearchComposing) return;
    handleBoardSearchInput();
  });
  elements.boardSearchInput.addEventListener("change", handleBoardSearchInput);
  elements.boardSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      clearBoardSearch();
      return;
    }
    if (event.key === "Enter" && applyAdminCode(elements.boardSearchInput.value)) {
      event.preventDefault();
    }
  });
  elements.boardSearchInput.addEventListener("paste", () => {
    window.setTimeout(handleBoardSearchInput, 0);
  });
  elements.clearSearchButton.addEventListener("click", clearBoardSearch);
  elements.boardResultToggleButton?.addEventListener("click", toggleBoardResultPanel);
  elements.boardResultFilter?.addEventListener("click", handleBoardResultFilterClick);
  elements.weatherAuditPanel?.addEventListener("click", handleWeatherAuditClick);
  elements.boardListExpandButton?.addEventListener("click", toggleBoardListExpanded);
  elements.printButton.addEventListener("click", handlePrint);
  elements.newBoardButton.addEventListener("click", createNewBoard);
  elements.dayBlindButton?.addEventListener("click", toggleDaySlotBlindMode);
  elements.prevPourDateButton.addEventListener("click", () => shiftPourDate(-1));
  elements.nextPourDateButton.addEventListener("click", () => shiftPourDate(1));
  elements.photoTypeTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-photo-type]");
    if (!button) return;
    setActivePhotoType(button.dataset.photoType);
  });
  window.addEventListener("popstate", () => {
    syncUrlToCurrentBoard();
  });
  elements.summaryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-summary-day]");
    if (!button) return;

    const card = elements.dayGrid.querySelector(`[data-day-card="${button.dataset.summaryDay}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  elements.boardList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-board-code]");
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      deleteBoardByShareCode(deleteButton.dataset.deleteBoardCode).catch(console.error);
      return;
    }

    const button = event.target.closest("[data-board-code]");
    if (!button) return;
    openBoard(button.dataset.boardCode);
  });
  [elements.projectNameInput, elements.pourPartInput, elements.pourDateInput].forEach((input) => {
    input.addEventListener("input", () => {
      pullMetaFromInputs();
      saveMetaDraft();
      queueMetaSave();
      renderMetaPreview();
    });
    input.addEventListener("change", flushMetaSave);
    input.addEventListener("blur", flushMetaSave);
  });

  window.addEventListener("pagehide", () => {
    if (isFilePickerOpen) return;
    flushMetaSave({ silent: true });
  });
  document.addEventListener("visibilitychange", () => {
    if (isFilePickerOpen) return;
    if (document.visibilityState === "hidden") {
      flushMetaSave({ silent: true });
    }
  });
  window.addEventListener("focus", endFilePickSoon);

  elements.dayGrid.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".file-control")) {
      beginFilePick();
    }
  });

  elements.dayGrid.addEventListener("click", (event) => {
    if (event.target.closest(".file-control")) {
      beginFilePick();
    }
  });

  elements.dayGrid.addEventListener("change", async (event) => {
    const target = event.target;
    if (!target.matches("input[type='file']")) return;

    const day = Number(target.dataset.day);
    const photoType = normalizePhotoType(target.dataset.photoType);
    const files = Array.from(target.files || []);
    target.value = "";
    window.clearTimeout(filePickerClearTimer);
    isFilePickerOpen = false;
    if (!day || !files.length) return;

    await handlePhotoSelection(photoType, day, files);
    await flushPendingRealtimeRefresh();
  });

  elements.dayGrid.addEventListener("click", async (event) => {
    const rainButton = event.target.closest("[data-rain-day]");
    if (rainButton) {
      await toggleRainHold(Number(rainButton.dataset.rainDay));
      return;
    }

    const pasteSlot = event.target.closest("[data-paste-day]");
    if (pasteSlot) {
      setPasteTarget(Number(pasteSlot.dataset.pasteDay));
      return;
    }

    const previewButton = event.target.closest("[data-preview-day]");
    if (previewButton) {
      openPhotoViewer(Number(previewButton.dataset.previewDay), previewButton.dataset.previewType);
      return;
    }

    const addSlotButton = event.target.closest("[data-add-slot]");
    if (addSlotButton) {
      await addPhotoSlot(addSlotButton.dataset.addSlot || activePhotoType);
      return;
    }

    const renameButton = event.target.closest("[data-rename-day]");
    if (renameButton) {
      await renameDaySlot(Number(renameButton.dataset.renameDay));
      return;
    }

    const removeButton = event.target.closest("[data-remove-day]");
    if (removeButton) {
      await removePhotoSlot(removeButton.dataset.removeType || PHOTO_TYPES.CURING, Number(removeButton.dataset.removeDay));
      return;
    }

    const deleteButton = event.target.closest("[data-delete-day]");
    if (!deleteButton) return;

    const day = Number(deleteButton.dataset.deleteDay);
    await deletePhoto(normalizePhotoType(deleteButton.dataset.deleteType), day);
  });

  elements.photoViewerClose.addEventListener("click", closePhotoViewer);
  elements.photoViewer.addEventListener("pointerdown", closePhotoViewerOnBackdrop);
  elements.photoViewer.addEventListener("click", closePhotoViewerOnBackdrop);
  elements.standardDocClose.addEventListener("click", closeStandardDocumentViewer);
  elements.standardDocZoomOut.addEventListener("click", () => adjustStandardDocumentZoom(-STANDARD_DOCUMENT_ZOOM_STEP));
  elements.standardDocZoomIn.addEventListener("click", () => adjustStandardDocumentZoom(STANDARD_DOCUMENT_ZOOM_STEP));
  elements.standardDocSearchInput.addEventListener("input", handleStandardDocumentSearchInput);
  elements.standardDocSearchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    moveToStandardDocumentSearchMatch(event.shiftKey ? -1 : 1);
  });
  elements.standardDocStage.addEventListener("scroll", handleStandardDocumentScroll, { passive: true });
  document.addEventListener("keydown", handleGlobalKeydown);
  document.addEventListener("paste", handleClipboardPaste);
}

function setPasteTarget(day) {
  if (!day) return;
  pasteTargetDay = day;
  elements.dayGrid.querySelectorAll(".empty-photo.paste-armed").forEach((el) => {
    el.classList.remove("paste-armed");
  });
  const slot = elements.dayGrid.querySelector(`[data-paste-day="${day}"]`);
  if (slot) slot.classList.add("paste-armed");
}

async function handleClipboardPaste(event) {
  const items = event.clipboardData && event.clipboardData.items;
  if (!items) return;

  let file = null;
  for (const item of items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      file = item.getAsFile();
      break;
    }
  }
  if (!file) return;

  event.preventDefault();

  if (!pasteTargetDay) {
    showToast("먼저 사진을 넣을 일차 칸을 한 번 눌러 선택해 주세요.");
    return;
  }
  if (!state.shareCode || (dbClient && !state.boardId)) {
    showToast("새 대지를 먼저 만들어 주세요.");
    return;
  }

  const day = pasteTargetDay;
  const photoType = activePhotoType;
  const pastedFile = normalizePastedImageName(file, day, photoType);

  const ok = await handlePhotoUpload(photoType, day, pastedFile);
  if (ok) {
    pasteTargetDay = null;
    await loadBoardList();
    renderAll();
    await flushPendingRealtimeRefresh();
  }
}

function normalizePastedImageName(file, day, photoType) {
  const hasName = file.name && file.name.trim() && file.name !== "image.png";
  if (hasName) return file;
  const ext = (file.type && file.type.split("/")[1]) || "png";
  const safeName = `paste-${normalizePhotoType(photoType)}-day-${day}-${Date.now()}.${ext}`;
  try {
    return new File([file], safeName, { type: file.type || "image/png" });
  } catch {
    return file;
  }
}

function toggleStandardPanel() {
  const willOpen = elements.standardPanel.hidden;
  elements.standardPanel.hidden = !willOpen;
  elements.standardButton.setAttribute("aria-expanded", String(willOpen));
}

function handleStandardPanelClick(event) {
  const button = event.target.closest("[data-standard-doc]");
  if (!button) return;
  openStandardDocumentViewer(button.dataset.standardDoc);
}

function handleGlobalKeydown(event) {
  if (!elements.photoViewer.hidden) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePhotoViewer();
    } else if (event.key === "Tab") {
      trapDialogFocus(elements.photoViewer, event);
    }
    return;
  }

  if (elements.standardDocViewer.hidden) return;

  if (event.key === "Escape") {
    closeStandardDocumentViewer();
    return;
  }

  if (event.key === "+" || event.key === "=") {
    adjustStandardDocumentZoom(STANDARD_DOCUMENT_ZOOM_STEP);
    return;
  }

  if (event.key === "-") {
    adjustStandardDocumentZoom(-STANDARD_DOCUMENT_ZOOM_STEP);
  }
}

function trapDialogFocus(container, event) {
  const focusable = Array.from(
    container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
  ).filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
  if (!focusable.length) {
    event.preventDefault();
    container.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openStandardDocumentViewer(documentKey) {
  const documentConfig = STANDARD_DOCUMENTS[documentKey];
  if (!documentConfig) return;

  activeStandardDocumentKey = documentKey;
  activeStandardDocumentPage = 1;
  standardDocumentZoom = 1;
  resetStandardDocumentSearch();
  elements.standardDocViewer.hidden = false;
  document.body.classList.add("viewer-open");
  renderStandardDocumentPage({ resetScroll: true });
  elements.standardDocClose.focus({ preventScroll: true });
}

function closeStandardDocumentViewer() {
  elements.standardDocViewer.hidden = true;
  elements.standardDocPages.replaceChildren();
  elements.standardDocPages.removeAttribute("data-document-key");
  activeStandardDocumentKey = "";
  resetStandardDocumentSearch();
  document.body.classList.remove("viewer-open");
}

function adjustStandardDocumentZoom(delta) {
  const nextZoom = clamp(
    Math.round((standardDocumentZoom + delta) / STANDARD_DOCUMENT_ZOOM_STEP) * STANDARD_DOCUMENT_ZOOM_STEP,
    STANDARD_DOCUMENT_MIN_ZOOM,
    STANDARD_DOCUMENT_MAX_ZOOM,
  );

  if (nextZoom === standardDocumentZoom) return;
  standardDocumentZoom = nextZoom;
  renderStandardDocumentZoom();
}

function renderStandardDocumentPage({ resetScroll = false, scrollToPage = false } = {}) {
  const documentConfig = getActiveStandardDocument();
  if (!documentConfig) return;

  activeStandardDocumentPage = clamp(activeStandardDocumentPage, 1, documentConfig.pages.length);
  renderStandardDocumentPages(documentConfig);
  updateStandardDocumentStatus();
  renderStandardDocumentZoom();
  renderStandardDocumentSearchState();
  preloadStandardDocumentPage(documentConfig.pages[activeStandardDocumentPage]);
  preloadStandardDocumentPage(documentConfig.pages[activeStandardDocumentPage - 2]);

  if (resetScroll || scrollToPage) {
    requestAnimationFrame(() => {
      scrollStandardDocumentPageIntoView(activeStandardDocumentPage, { behavior: "auto" });
    });
  }
}

function renderStandardDocumentPages(documentConfig) {
  if (elements.standardDocPages.dataset.documentKey === activeStandardDocumentKey) return;

  const fragment = document.createDocumentFragment();
  documentConfig.pages.forEach((page) => {
    const figure = document.createElement("figure");
    figure.className = "standard-doc-page";
    figure.dataset.standardPage = String(page.pageNumber);

    const image = document.createElement("img");
    image.className = "standard-doc-page-image";
    image.src = page.src;
    image.alt = `${documentConfig.title} ${page.pageNumber}쪽`;
    image.width = page.width;
    image.height = page.height;
    image.loading = page.pageNumber <= 2 ? "eager" : "lazy";
    image.decoding = "async";
    image.draggable = false;
    image.addEventListener("error", () => {
      showToast("전문 이미지를 불러오지 못했습니다.");
    });

    figure.appendChild(image);
    const highlightLayer = document.createElement("div");
    highlightLayer.className = "standard-doc-highlight-layer";
    figure.appendChild(highlightLayer);
    fragment.appendChild(figure);
  });

  elements.standardDocPages.replaceChildren(fragment);
  elements.standardDocPages.dataset.documentKey = activeStandardDocumentKey;
  renderStandardDocumentSearchHighlights();
}

function updateStandardDocumentStatus() {
  const documentConfig = getActiveStandardDocument();
  if (!documentConfig) return;

  elements.standardDocTitle.textContent = documentConfig.title;
  elements.standardDocPageLabel.textContent = `${activeStandardDocumentPage} / ${documentConfig.pages.length}쪽`;
}

function renderStandardDocumentZoom() {
  elements.standardDocZoomLabel.textContent = `${Math.round(standardDocumentZoom * 100)}%`;
  elements.standardDocZoomOut.disabled = standardDocumentZoom <= STANDARD_DOCUMENT_MIN_ZOOM;
  elements.standardDocZoomIn.disabled = standardDocumentZoom >= STANDARD_DOCUMENT_MAX_ZOOM;
  const imageWidth = standardDocumentZoom === 1 ? "min(100%, 1040px)" : `${Math.round(100 * standardDocumentZoom)}%`;
  elements.standardDocPages.style.setProperty("--standard-doc-image-width", imageWidth);
}

function getActiveStandardDocument() {
  return STANDARD_DOCUMENTS[activeStandardDocumentKey] || null;
}

function preloadStandardDocumentPage(page) {
  if (!page) return;
  const image = new Image();
  image.src = page.src;
}

function scrollStandardDocumentPageIntoView(pageNumber, { behavior = "smooth" } = {}) {
  const pageElement = elements.standardDocPages.querySelector(`[data-standard-page="${pageNumber}"]`);
  if (!pageElement) return;

  const relativePageTop = pageElement.offsetTop - elements.standardDocPages.offsetTop;
  elements.standardDocStage.scrollTo({
    left: 0,
    top: Math.max(0, relativePageTop - 8),
    behavior,
  });
}

function handleStandardDocumentScroll() {
  if (elements.standardDocViewer.hidden || standardDocumentScrollFrame) return;

  standardDocumentScrollFrame = requestAnimationFrame(() => {
    standardDocumentScrollFrame = 0;
    syncStandardDocumentPageFromScroll();
  });
}

function syncStandardDocumentPageFromScroll() {
  const documentConfig = getActiveStandardDocument();
  if (!documentConfig) return;

  const stageRect = elements.standardDocStage.getBoundingClientRect();
  const referenceY = stageRect.top + Math.min(180, elements.standardDocStage.clientHeight * 0.32);
  const pageElements = Array.from(elements.standardDocPages.querySelectorAll("[data-standard-page]"));
  let currentPage = activeStandardDocumentPage;
  let smallestDistance = Number.POSITIVE_INFINITY;

  pageElements.forEach((pageElement) => {
    const rect = pageElement.getBoundingClientRect();
    const isVisible = rect.bottom > stageRect.top + 12 && rect.top < stageRect.bottom - 12;
    if (!isVisible) return;

    const distance = Math.abs(rect.top - referenceY);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      currentPage = Number(pageElement.dataset.standardPage);
    }
  });

  if (currentPage === activeStandardDocumentPage) return;
  activeStandardDocumentPage = clamp(currentPage, 1, documentConfig.pages.length);
  updateStandardDocumentStatus();
  renderStandardDocumentSearchState();
}

function resetStandardDocumentSearch() {
  standardDocumentSearchMatches = [];
  if (elements.standardDocSearchInput) {
    elements.standardDocSearchInput.value = "";
  }
  renderStandardDocumentSearchHighlights();
  renderStandardDocumentSearchState();
}

function handleStandardDocumentSearchInput() {
  const query = elements.standardDocSearchInput.value;
  standardDocumentSearchMatches = findStandardDocumentSearchMatches(activeStandardDocumentKey, query);
  renderStandardDocumentSearchHighlights();
  renderStandardDocumentSearchState();

  if (standardDocumentSearchMatches.length) {
    const nextMatch =
      standardDocumentSearchMatches.find((match) => match.page >= activeStandardDocumentPage) ||
      standardDocumentSearchMatches[0];
    activeStandardDocumentPage = nextMatch.page;
    updateStandardDocumentStatus();
    renderStandardDocumentSearchState();
    scrollStandardDocumentPageIntoView(activeStandardDocumentPage, { behavior: "auto" });
  }
}

function findStandardDocumentSearchMatches(documentKey, query) {
  const normalizedQuery = normalizeStandardDocumentSearchText(query);
  if (!normalizedQuery) return [];

  const pages = STANDARD_DOCUMENT_SEARCH_INDEX[documentKey] || [];
  return pages
    .map((page) => ({
      page: page.page,
      boxes: findStandardDocumentSearchBoxes(page, normalizedQuery),
    }))
    .filter((match) => match.boxes.length);
}

function findStandardDocumentSearchBoxes(page, normalizedQuery) {
  const items = page.items || [];
  const normalizedText = [];
  const charMap = [];

  items.forEach((item, itemIndex) => {
    const itemChars = Array.from(String(item.text || "").normalize("NFKC").toLocaleLowerCase("ko-KR"))
      .filter((char) => !/\s/.test(char));

    itemChars.forEach((char, offset) => {
      normalizedText.push(char);
      charMap.push({
        itemIndex,
        offset,
        length: itemChars.length,
      });
    });
  });

  const haystack = normalizedText.join("");
  const boxes = [];
  let matchIndex = haystack.indexOf(normalizedQuery);

  while (matchIndex >= 0) {
    const touchedItems = new Map();
    const matchEnd = matchIndex + normalizedQuery.length;

    for (let index = matchIndex; index < matchEnd; index += 1) {
      const mapped = charMap[index];
      if (!mapped) continue;
      const itemRange = touchedItems.get(mapped.itemIndex) || {
        first: mapped.offset,
        last: mapped.offset,
        length: mapped.length,
      };
      itemRange.first = Math.min(itemRange.first, mapped.offset);
      itemRange.last = Math.max(itemRange.last, mapped.offset);
      touchedItems.set(mapped.itemIndex, itemRange);
    }

    touchedItems.forEach((range, itemIndex) => {
      const item = items[itemIndex];
      if (!item || !range.length) return;
      const characterWidth = item.w / range.length;
      boxes.push({
        x: item.x + characterWidth * range.first,
        y: item.y,
        w: Math.max(characterWidth * (range.last - range.first + 1), 0.3),
        h: item.h,
      });
    });

    matchIndex = haystack.indexOf(normalizedQuery, matchIndex + normalizedQuery.length);
  }

  return boxes;
}

function renderStandardDocumentSearchHighlights() {
  elements.standardDocPages.querySelectorAll(".standard-doc-highlight-layer").forEach((layer) => {
    layer.replaceChildren();
  });

  standardDocumentSearchMatches.forEach((match) => {
    const pageElement = elements.standardDocPages.querySelector(`[data-standard-page="${match.page}"]`);
    const layer = pageElement?.querySelector(".standard-doc-highlight-layer");
    if (!layer) return;

    const fragment = document.createDocumentFragment();
    match.boxes.forEach((box) => {
      const highlight = document.createElement("span");
      highlight.className = "standard-doc-search-highlight";
      highlight.style.left = `${box.x}%`;
      highlight.style.top = `${box.y}%`;
      highlight.style.width = `${box.w}%`;
      highlight.style.height = `${box.h}%`;
      fragment.appendChild(highlight);
    });
    layer.appendChild(fragment);
  });
}

function moveToStandardDocumentSearchMatch(direction) {
  const query = elements.standardDocSearchInput.value;
  if (!normalizeStandardDocumentSearchText(query)) return;

  if (!standardDocumentSearchMatches.length) {
    showToast("검색 결과가 없습니다.");
    return;
  }

  const orderedMatches = standardDocumentSearchMatches;
  const nextMatch =
    direction > 0
      ? orderedMatches.find((match) => match.page > activeStandardDocumentPage) || orderedMatches[0]
      : [...orderedMatches].reverse().find((match) => match.page < activeStandardDocumentPage) ||
        orderedMatches[orderedMatches.length - 1];

  activeStandardDocumentPage = nextMatch.page;
  updateStandardDocumentStatus();
  renderStandardDocumentSearchState();
  scrollStandardDocumentPageIntoView(activeStandardDocumentPage, { behavior: "auto" });
}

function renderStandardDocumentSearchState() {
  if (!elements.standardDocSearchCount) return;

  const query = elements.standardDocSearchInput?.value || "";
  const hasQuery = Boolean(normalizeStandardDocumentSearchText(query));
  const currentMatchIndex = standardDocumentSearchMatches.findIndex((match) => match.page === activeStandardDocumentPage);

  if (!hasQuery) {
    elements.standardDocSearchCount.textContent = "0건";
  } else if (!standardDocumentSearchMatches.length) {
    elements.standardDocSearchCount.textContent = "0건";
  } else if (currentMatchIndex >= 0) {
    elements.standardDocSearchCount.textContent = `${currentMatchIndex + 1}/${standardDocumentSearchMatches.length}건`;
  } else {
    elements.standardDocSearchCount.textContent = `${standardDocumentSearchMatches.length}건`;
  }

}

function normalizeStandardDocumentSearchText(text) {
  return String(text || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/\s+/g, "");
}

function canUseCloud() {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey && config.bucket);
}

async function setupCloudMode() {
  try {
    await ensureSupabaseClient();
    dbClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    flushStorageCleanupQueue().catch(console.warn);
    if (state.shareCode) {
      const usedDraft = await loadCloudBoard();
      if (usedDraft) {
        await saveMeta();
      }
      await subscribeToChanges();
    } else {
      resetCurrentBoard();
    }
    await loadBoardList();
    setSyncStatus("실시간 공유 저장소에 연결되었습니다.");
  } catch (error) {
    console.error(error);
    showToast("실시간 연결에 실패해서 이 브라우저에만 저장합니다.");
    dbClient = null;
    loadLocalBoard();
    await loadBoardList();
    setSyncStatus("실시간 연결에 실패했습니다.\n인터넷 연결을 확인한 뒤 새로고침해 주세요.");
  }
}

function ensureShareCode() {
  const url = new URL(window.location.href);
  const shareCode = url.searchParams.get("board") || "";
  clearBoardUrlParam(url);
  return shareCode;
}

function syncUrlToCurrentBoard() {
  clearBoardUrlParam();
}

function clearBoardUrlParam(sourceUrl = null) {
  const url = sourceUrl || new URL(window.location.href);
  if (!url.searchParams.has("board")) return;
  url.searchParams.delete("board");
  window.history.replaceState({}, "", url.toString());
}

function createShareCode() {
  return `board-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function resetCurrentBoard(options = {}) {
  activePhotoType = DEFAULT_PHOTO_TYPE;
  const shareCode = options.keepShareCode ? state.shareCode : "";
  state = {
    shareCode,
    boardId: null,
    projectName: DEFAULT_PROJECT_NAME,
    pourPart: "",
    pourDate: toDateInputValue(new Date()),
    createdAt: "",
    entries: {},
    settings: createDefaultBoardSettings(),
  };
  lastSyncedMeta = { projectName: state.projectName, pourPart: state.pourPart, pourDate: state.pourDate };
  syncInputsFromState();
}

function loadLocalBoard() {
  const shareCode = state.shareCode;
  const saved = localStorage.getItem(LOCAL_PREFIX + state.shareCode);
  state = {
    shareCode,
    boardId: null,
    projectName: DEFAULT_PROJECT_NAME,
    pourPart: "",
    pourDate: toDateInputValue(new Date()),
    createdAt: "",
    entries: {},
    settings: loadBoardSettingsFallback(shareCode) || getLegacyBoardSettings(),
  };

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = {
        ...state,
        ...parsed,
        shareCode,
        boardId: null,
        entries: normalizeEntries(parsed.entries || {}),
        settings: normalizeBoardSettings(parsed.settings, {
          fallback: loadBoardSettingsFallback(shareCode) || getLegacyBoardSettings(),
        }),
      };
      state.projectName = normalizeProjectName(state.projectName);
    } catch (error) {
      console.warn("Local board parse failed", error);
    }
  }

  if (!state.pourDate) {
    state.pourDate = toDateInputValue(new Date());
  }

  applyMetaDraft("");
  lastSyncedMeta = { projectName: state.projectName, pourPart: state.pourPart, pourDate: state.pourDate };
  syncInputsFromState();
  saveLocalBoard();
}

async function loadCloudBoard(options = {}) {
  const requestedShareCode = state.shareCode;
  const requestedEntrySequence = ++entryLoadSequence;
  const shouldSyncInputs = options.syncInputs !== false;
  const createIfMissing = options.createIfMissing === true;
  if (loadHiddenBoardCodes().has(requestedShareCode)) {
    resetCurrentBoard({ keepShareCode: true });
    clearMetaDraft();
    return null;
  }

  const { data: board, error } = await dbClient
    .from("photo_boards")
    .select("*, photo_entries(*)")
    .eq("share_code", requestedShareCode)
    .maybeSingle();

  if (error) throw error;
  if (state.shareCode !== requestedShareCode) return null;

  if (board) {
    if (isDeletedBoardRecord(board)) {
      resetCurrentBoard({ keepShareCode: true });
      clearMetaDraft();
      return null;
    }

    state.boardId = board.id;
    state.projectName = normalizeProjectName(board.project_name || DEFAULT_PROJECT_NAME);
    state.pourPart = board.pour_part || "";
    state.pourDate = board.pour_date || toDateInputValue(new Date());
    state.createdAt = board.created_at || "";
    state.settings = getBoardSettingsForRecord(board, requestedShareCode);
    lastSyncedMeta = { projectName: state.projectName, pourPart: state.pourPart, pourDate: state.pourDate };
  } else if (createIfMissing) {
    const createPayload = {
      share_code: requestedShareCode,
      project_name: DEFAULT_PROJECT_NAME,
      pour_part: "",
      pour_date: toDateInputValue(new Date()),
    };
    if (boardSettingsColumnAvailable !== false) {
      createPayload.settings = normalizeBoardSettings(state.settings);
    }
    let { data: created, error: insertError } = await dbClient
      .from("photo_boards")
      .insert(createPayload)
      .select("*")
      .single();
    if (insertError && Object.prototype.hasOwnProperty.call(createPayload, "settings") && isMissingBackendFeature(insertError, "settings")) {
      boardSettingsColumnAvailable = false;
      delete createPayload.settings;
      ({ data: created, error: insertError } = await dbClient
        .from("photo_boards")
        .insert(createPayload)
        .select("*")
        .single());
    }

    if (insertError) throw insertError;
    if (state.shareCode !== requestedShareCode) return null;

    state.boardId = created.id;
    state.projectName = normalizeProjectName(created.project_name || DEFAULT_PROJECT_NAME);
    state.pourPart = created.pour_part || "";
    state.pourDate = created.pour_date || toDateInputValue(new Date());
    state.createdAt = created.created_at || "";
    state.settings = getBoardSettingsForRecord(created, requestedShareCode);
    lastSyncedMeta = { projectName: state.projectName, pourPart: state.pourPart, pourDate: state.pourDate };
  } else {
    resetCurrentBoard({ keepShareCode: true });
  }

  const usedDraft = shouldSyncInputs && (board || createIfMissing) ? applyMetaDraft(board?.updated_at || "") : false;
  if (!board && !createIfMissing) {
    clearMetaDraft();
  }
  if (board?.photo_entries && requestedEntrySequence === entryLoadSequence) {
    applyCloudEntries(board.photo_entries);
  } else {
    await loadCloudEntries();
  }
  if (shouldSyncInputs) {
    syncInputsFromState();
  }

  return usedDraft;
}

async function loadCloudEntries() {
  const requestedBoardId = state.boardId;
  const requestedSequence = ++entryLoadSequence;
  if (!requestedBoardId) {
    state.entries = {};
    return;
  }

  const { data, error } = await dbClient
    .from("photo_entries")
    .select("*")
    .eq("board_id", requestedBoardId)
    .order("day_no", { ascending: true });

  if (error) throw error;
  if (state.boardId !== requestedBoardId || requestedSequence !== entryLoadSequence) return;

  applyCloudEntries(data || []);
}

function applyCloudEntries(entries) {
  state.entries = {};
  (entries || []).forEach((row) => {
    state.entries[row.day_no] = cloudRowToEntry(row);
  });
}

function cloudRowToEntry(row) {
  const memo = parseEntryMemo(row?.memo);
  return {
    dayNo: Number(row?.day_no || 0),
    photoUrl: row?.photo_url || "",
    photoPath: row?.photo_path || "",
    uploadedAt: row?.uploaded_at || "",
    verifiedAt: memo.photos?.[PHOTO_TYPES.CURING]?.verifiedAt || "",
    verifiedAtSource: memo.photos?.[PHOTO_TYPES.CURING]?.verifiedAtSource || "",
    capturedAt: memo.photos?.[PHOTO_TYPES.CURING]?.capturedAt || "",
    capturedAtSource: memo.photos?.[PHOTO_TYPES.CURING]?.capturedAtSource || "",
    rainHold: memo.rainHold,
    photos: memo.photos || {},
  };
}

async function loadBoardList() {
  if (dbClient) {
    await loadCloudBoardList();
  } else {
    loadLocalBoardList();
  }
  await reconcileCurrentBoardEntries();
}

function loadHiddenBoardCodes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HIDDEN_BOARD_CODES_STORAGE_KEY) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : []);
  } catch {
    return new Set();
  }
}

function saveHiddenBoardCode(shareCode) {
  if (!shareCode) return;
  try {
    const hidden = loadHiddenBoardCodes();
    hidden.add(String(shareCode));
    localStorage.setItem(HIDDEN_BOARD_CODES_STORAGE_KEY, JSON.stringify(Array.from(hidden)));
  } catch {
    // 무시
  }
}

function isDeletedBoardRecord(board) {
  const projectName = board?.project_name ?? board?.projectName ?? "";
  const pourPart = board?.pour_part ?? board?.pourPart ?? "";
  const deletedAt = board?.deleted_at ?? board?.deletedAt ?? "";
  return Boolean(deletedAt) || projectName === DELETED_BOARD_PROJECT_NAME || String(pourPart).startsWith(DELETED_BOARD_LABEL);
}

async function loadCloudBoardList() {
  const hiddenBoardCodes = loadHiddenBoardCodes();
  let { data, error } = await fetchCloudBoardListRows(boardSettingsColumnAvailable !== false);
  if (error && boardSettingsColumnAvailable !== false && (
    isMissingBackendFeature(error, "settings") || isMissingBackendFeature(error, "deleted_at")
  )) {
    boardSettingsColumnAvailable = false;
    ({ data, error } = await fetchCloudBoardListRows(false));
  }
  if (error) throw error;
  if (boardSettingsColumnAvailable !== false) boardSettingsColumnAvailable = true;

  const deletedBoards = (data || []).filter(isDeletedBoardRecord);
  scheduleDeletedBoardCleanup(deletedBoards);

  boardList = (data || []).filter((board) => {
    return board.share_code && board.pour_date && !hiddenBoardCodes.has(board.share_code) && !isDeletedBoardRecord(board);
  }).map((board) => {
    const pourPart = board.pour_part || "미입력";
    const entries = board.photo_entries || [];
    const settings = getBoardSettingsForRecord(board, board.share_code);
    return {
      boardId: board.id,
      shareCode: board.share_code,
      projectName: normalizeProjectName(board.project_name || DEFAULT_PROJECT_NAME),
      pourPart,
      searchText: normalizeSearchText(pourPart),
      pourDate: board.pour_date || "",
      createdAt: board.created_at || "",
      updatedAt: board.updated_at || "",
      entries,
      settings,
      completedCount: countCompletedEntries(entries, PHOTO_TYPES.CURING, null, { pourDate: board.pour_date || "" }),
      temperatureCount: countCompletedEntries(entries, PHOTO_TYPES.TEMPERATURE),
      photoCount: countPhotoEntries(entries),
    };
  });
}

async function fetchCloudBoardListRows(includeExtendedColumns) {
  const columns = includeExtendedColumns
    ? "id, share_code, project_name, pour_part, pour_date, created_at, updated_at, settings, deleted_at, photo_entries(day_no, photo_url, photo_path, memo)"
    : "id, share_code, project_name, pour_part, pour_date, created_at, updated_at, photo_entries(day_no, photo_url, photo_path, memo)";
  return dbClient
    .from("photo_boards")
    .select(columns)
    .order("pour_date", { ascending: false })
    .order("created_at", { ascending: false });
}

function scheduleDeletedBoardCleanup(boards) {
  if (!dbClient || deletedBoardCleanupPromise || !boards?.length) return;
  const now = Date.now();
  const targets = boards
    .filter((board) => now >= Number(deletedBoardCleanupRetryAt.get(board.id) || 0))
    .map((board) => ({
      boardId: board.id,
      shareCode: board.share_code || "",
      entries: board.photo_entries || [],
    }));
  if (!targets.length) return;

  deletedBoardCleanupPromise = (async () => {
    for (const target of targets) {
      try {
        const result = await deleteCloudBoardTarget(target);
        if (!result.deleted || result.cleanupPending || result.status === "unknown") {
          throw new Error("Deleted board cleanup remains pending.");
        }
        deletedBoardCleanupRetryAt.delete(target.boardId);
      } catch (error) {
        deletedBoardCleanupRetryAt.set(target.boardId, Date.now() + 5 * 60 * 1000);
        console.warn("Deleted board cleanup will be retried later", error);
      }
    }
  })().finally(() => {
    deletedBoardCleanupPromise = null;
  });
}

function loadLocalBoardList() {
  const hiddenBoardCodes = loadHiddenBoardCodes();
  boardList = Object.keys(localStorage)
    .filter((key) => key.startsWith(LOCAL_PREFIX) && !key.startsWith(META_DRAFT_PREFIX))
    .map((key) => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || "{}");
        const entries = parsed.entries || {};
        const pourPart = parsed.pourPart || "미입력";
        const shareCode = key.slice(LOCAL_PREFIX.length);
        const settings = normalizeBoardSettings(parsed.settings, {
          fallback: loadBoardSettingsFallback(shareCode) || getLegacyBoardSettings(),
        });
        return {
          shareCode,
          projectName: normalizeProjectName(parsed.projectName || DEFAULT_PROJECT_NAME),
          pourPart,
          searchText: normalizeSearchText(pourPart),
          pourDate: parsed.pourDate || "",
          createdAt: parsed.createdAt || parsed.updatedAt || "",
          updatedAt: parsed.updatedAt || "",
          entries,
          settings,
          completedCount: countCompletedEntries(entries, PHOTO_TYPES.CURING, null, { pourDate: parsed.pourDate || "" }),
          temperatureCount: countCompletedEntries(entries, PHOTO_TYPES.TEMPERATURE),
          photoCount: countPhotoEntries(entries),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((board) => Boolean(board.pourDate) && !hiddenBoardCodes.has(board.shareCode) && !isDeletedBoardRecord(board))
    .sort((a, b) => {
      const dateCompare = (b.pourDate || "").localeCompare(a.pourDate || "");
      if (dateCompare) return dateCompare;
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
}

async function reconcileCurrentBoardEntries() {
  if (!state.shareCode) return;

  const current = boardList.find((board) => board.shareCode === state.shareCode);
  if (!current) return;

  const detailCount = countCompletedEntries(state.entries || {}, PHOTO_TYPES.CURING, null, { pourDate: state.pourDate });
  const detailPhotoCount = countPhotoEntries(state.entries || {});
  const listCount = Number(current.completedCount || 0);
  const listPhotoCount = Number(current.photoCount ?? current.completedCount ?? 0);
  if (detailCount === listCount && detailPhotoCount === listPhotoCount) return;

  if (dbClient && state.boardId) {
    await loadCloudEntries();
  } else if (!dbClient) {
    loadLocalBoard();
  }
}

function countVisibleBoardPhotos() {
  return boardList.reduce((sum, board) => sum + Number(board.photoCount ?? board.completedCount ?? 0), 0);
}

async function shiftPourDate(offset) {
  const current = elements.pourDateInput.value || state.pourDate || toDateInputValue(new Date());
  const next = addDays(current, offset);
  elements.pourDateInput.value = toDateInputValue(next);
  pullMetaFromInputs();
  await saveMeta();
  boardResultSelectedGroup = null;
  renderAll();
}

async function subscribeToChanges() {
  if (!dbClient || !state.boardId) return;
  if (realtimeChannel) {
    await dbClient.removeChannel(realtimeChannel);
  }

  realtimeChannel = dbClient
    .channel(`curing-board-${state.shareCode}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "photo_boards",
      },
      async (payload) => {
        if (shouldDeferRealtimeRefresh()) {
          pendingRealtimeRefresh = true;
          return;
        }

        if (payload.new?.share_code === state.shareCode || payload.old?.share_code === state.shareCode) {
          const inputFocused = isMetaInputFocused();
          await loadCloudBoard({ syncInputs: !inputFocused });
          if (inputFocused) {
            renderMetaPreview();
          } else {
            renderAll();
          }
        }
        await loadBoardList();
        renderBoardList();
        renderStorageMeter();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "photo_entries",
      },
      async (payload) => {
        if (shouldDeferRealtimeRefresh()) {
          pendingRealtimeRefresh = true;
          return;
        }

        if (payload.new?.board_id === state.boardId || payload.old?.board_id === state.boardId) {
          await loadCloudEntries();
          renderAll();
        }
        await loadBoardList();
        renderBoardList();
        renderStorageMeter();
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setSyncStatus("실시간 공유 저장소에 연결되었습니다.");
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setSyncStatus("실시간 수신이 불안정합니다. 저장은 계속 시도합니다.");
      }
    });
}

function syncInputsFromState() {
  state.projectName = normalizeProjectName(state.projectName);
  elements.projectNameInput.value = state.projectName || DEFAULT_PROJECT_NAME;
  elements.pourPartInput.value = state.pourPart || "";
  elements.pourDateInput.value = state.pourDate || "";
}

function pullMetaFromInputs() {
  state.projectName = normalizeProjectName(elements.projectNameInput.value || DEFAULT_PROJECT_NAME);
  state.pourPart = elements.pourPartInput.value;
  state.pourDate = elements.pourDateInput.value || "";
}

function queueMetaSave() {
  window.clearTimeout(metaSaveTimer);
  metaSaveTimer = window.setTimeout(() => saveMeta({ allowConfirm: false }).catch(console.error), 300);
}

function flushMetaSave(options = {}) {
  pullMetaFromInputs();
  saveMetaDraft();
  window.clearTimeout(metaSaveTimer);
  metaSaveTimer = null;
  saveMeta({ ...options, allowConfirm: options.silent ? false : options.allowConfirm !== false }).catch(console.error);
}

function saveMeta(options = {}) {
  const incoming = normalizeMetaSaveOptions(options);
  pendingMetaSaveOptions = pendingMetaSaveOptions
    ? {
        silent: pendingMetaSaveOptions.silent && incoming.silent,
        allowConfirm: pendingMetaSaveOptions.allowConfirm || incoming.allowConfirm,
      }
    : incoming;

  if (metaSavePromise) return metaSavePromise;

  metaSavePromise = (async () => {
    while (pendingMetaSaveOptions) {
      const nextOptions = pendingMetaSaveOptions;
      pendingMetaSaveOptions = null;
      try {
        await saveMetaOnce(nextOptions);
      } catch (error) {
        console.error(error);
        showToast("사진대지 정보 저장에 실패했습니다. 잠시 뒤 다시 시도해 주세요.");
      }
    }
  })().finally(async () => {
    metaSavePromise = null;
    isMetaSaveInProgress = false;
    await flushPendingRealtimeRefresh();
  });

  return metaSavePromise;
}

function normalizeMetaSaveOptions(options = {}) {
  const silent = options.silent === true;
  return {
    silent,
    allowConfirm: !silent && options.allowConfirm !== false,
  };
}

async function saveMetaOnce(options = {}) {
  const silent = options.silent === true;
  const allowConfirm = options.allowConfirm !== false && !silent;
  isMetaSaveInProgress = true;

  try {
  pullMetaFromInputs();

  if (!state.pourDate) {
    state.pourDate = lastSyncedMeta.pourDate || toDateInputValue(new Date());
    elements.pourDateInput.value = state.pourDate;
    if (!silent) showToast("타설일은 비워둘 수 없어요.");
  }

  if (!state.shareCode) return;
  if (dbClient && !state.boardId) return;

  const saveContext = {
    shareCode: state.shareCode,
    boardId: state.boardId,
    projectName: state.projectName,
    pourPart: state.pourPart,
    pourDate: state.pourDate,
  };
  const syncedAtStart = { ...lastSyncedMeta };

  const dirtyFields = {
    projectName: saveContext.projectName !== syncedAtStart.projectName,
    pourPart: saveContext.pourPart !== syncedAtStart.pourPart,
    pourDate: saveContext.pourDate !== syncedAtStart.pourDate,
  };
  const hasMetaChange = Object.values(dirtyFields).some(Boolean);
  if (!hasMetaChange) return;

  if (countPhotoEntries(state.entries || {}) > 0 && metaChangedFromSynced(saveContext, syncedAtStart)) {
    if (!allowConfirm) return;
    const ok = window.confirm(
      `이미 사진이 등록된 대지입니다.\n\n${describeMetaChange(saveContext, syncedAtStart)}\n\n이대로 저장할까요?`
    );
    if (!ok) {
      if (isCurrentBoard(saveContext)) {
        revertMetaInputsToSynced(syncedAtStart);
        clearMetaDraftIfMatches(saveContext.shareCode, saveContext);
        renderMetaPreview();
      }
      return;
    }
  }

  if (dbClient && saveContext.boardId) {
    const updatePayload = {};
    if (dirtyFields.projectName) updatePayload.project_name = saveContext.projectName;
    if (dirtyFields.pourPart) updatePayload.pour_part = saveContext.pourPart;
    if (dirtyFields.pourDate) updatePayload.pour_date = saveContext.pourDate || null;
    const { data: savedBoard, error } = await dbClient
      .from("photo_boards")
      .update(updatePayload)
      .eq("id", saveContext.boardId)
      .select("project_name, pour_part, pour_date, updated_at")
      .maybeSingle();

    if (error || !savedBoard) {
      console.error(error);
      showToast("사진대지 정보 저장에 실패했습니다.");
      return;
    }

    const savedMeta = {
      projectName: normalizeProjectName(savedBoard.project_name || DEFAULT_PROJECT_NAME),
      pourPart: savedBoard.pour_part || "",
      pourDate: savedBoard.pour_date || saveContext.pourDate,
    };
    clearMetaDraftIfMatches(saveContext.shareCode, saveContext);
    if (isCurrentBoard(saveContext)) {
      applySavedMetaResponse(saveContext, syncedAtStart, savedMeta, dirtyFields);
      lastSyncedMeta = savedMeta;
    }
    try {
      await loadBoardList();
    } catch (refreshError) {
      console.warn("Saved board list refresh failed", refreshError);
      pendingRealtimeRefresh = true;
    }
    renderBoardList();
    renderStorageMeter();
  } else {
    saveLocalBoard();
    clearMetaDraftIfMatches(saveContext.shareCode, saveContext);
    if (isCurrentBoard(saveContext)) {
      lastSyncedMeta = {
        projectName: saveContext.projectName,
        pourPart: saveContext.pourPart,
        pourDate: saveContext.pourDate,
      };
    }
    try {
      await loadBoardList();
    } catch (refreshError) {
      console.warn("Saved local board list refresh failed", refreshError);
    }
    renderBoardList();
    renderStorageMeter();
  }
  } finally {
    // saveMeta()의 큐 루프가 후속 변경을 이어서 저장한 뒤 플래그를 해제합니다.
  }
}

function applySavedMetaResponse(saveContext, syncedAtStart, savedMeta, dirtyFields) {
  const fields = [
    ["projectName", elements.projectNameInput],
    ["pourPart", elements.pourPartInput],
    ["pourDate", elements.pourDateInput],
  ];
  fields.forEach(([field, input]) => {
    const expectedCurrent = dirtyFields[field] ? saveContext[field] : syncedAtStart[field];
    const currentValue = field === "projectName"
      ? normalizeProjectName(input.value || DEFAULT_PROJECT_NAME)
      : String(input.value || "");
    if (currentValue !== String(expectedCurrent || "")) return;
    state[field] = savedMeta[field];
    input.value = savedMeta[field];
  });
}

function isCurrentBoard(context) {
  return state.shareCode === context.shareCode && state.boardId === context.boardId;
}

function metaChangedFromSynced(meta = state, synced = lastSyncedMeta) {
  return meta.pourPart !== synced.pourPart || meta.pourDate !== synced.pourDate;
}

function describeMetaChange(meta = state, synced = lastSyncedMeta) {
  const lines = [];
  if (meta.pourPart !== synced.pourPart) {
    lines.push(`타설부위: ${synced.pourPart || "(미입력)"} → ${meta.pourPart || "(미입력)"}`);
  }
  if (meta.pourDate !== synced.pourDate) {
    lines.push(`타설일: ${synced.pourDate || "(미입력)"} → ${meta.pourDate || "(미입력)"}`);
  }
  return lines.join("\n");
}

function revertMetaInputsToSynced(synced = lastSyncedMeta) {
  state.pourPart = synced.pourPart;
  state.pourDate = synced.pourDate;
  elements.pourPartInput.value = state.pourPart;
  elements.pourDateInput.value = state.pourDate;
}

function saveMetaDraft() {
  try {
    localStorage.setItem(
      META_DRAFT_PREFIX + state.shareCode,
      JSON.stringify({
        projectName: state.projectName,
        pourPart: state.pourPart,
        pourDate: state.pourDate,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.warn("Meta draft save failed", error);
  }
}

function applyMetaDraft(remoteUpdatedAt) {
  try {
    const saved = localStorage.getItem(META_DRAFT_PREFIX + state.shareCode);
    if (!saved) return false;

    const draft = JSON.parse(saved);
    const draftTime = Date.parse(draft.updatedAt || "");
    const remoteTime = Date.parse(remoteUpdatedAt || "");
    if (remoteUpdatedAt && (!draftTime || draftTime <= remoteTime)) {
      clearMetaDraft();
      return false;
    }

    state.projectName = normalizeProjectName(draft.projectName || DEFAULT_PROJECT_NAME);
    state.pourPart = typeof draft.pourPart === "string" ? draft.pourPart : "";
    state.pourDate = draft.pourDate || state.pourDate || toDateInputValue(new Date());
    return true;
  } catch (error) {
    console.warn("Meta draft apply failed", error);
    clearMetaDraft();
    return false;
  }
}

function clearMetaDraft(shareCode = state.shareCode) {
  try {
    localStorage.removeItem(META_DRAFT_PREFIX + shareCode);
  } catch {
    // Ignore storage cleanup errors.
  }
}

function clearMetaDraftIfMatches(shareCode, meta) {
  try {
    const key = META_DRAFT_PREFIX + shareCode;
    const saved = localStorage.getItem(key);
    if (!saved) return;
    const draft = JSON.parse(saved);
    const matches =
      normalizeProjectName(draft.projectName) === normalizeProjectName(meta.projectName) &&
      String(draft.pourPart || "") === String(meta.pourPart || "") &&
      String(draft.pourDate || "") === String(meta.pourDate || "");
    if (matches) localStorage.removeItem(key);
  } catch (error) {
    console.warn("Meta draft cleanup failed", error);
  }
}

async function saveEntry(day, photoType = activePhotoType, patch = null) {
  if (!state.shareCode || (dbClient && !state.boardId)) {
    showToast("새 대지를 먼저 만들어 주세요.");
    return false;
  }

  const saved = await persistEntry(day, photoType, patch);
  if (!saved) return false;

  try {
    await loadBoardList();
  } catch (error) {
    console.warn("Saved entry list refresh failed", error);
    pendingRealtimeRefresh = Boolean(dbClient);
  }
  renderAll();
  return true;
}

async function persistEntry(day, photoType = activePhotoType, patch = null) {
  const entry = getEntry(day);
  const normalizedType = normalizePhotoType(photoType);
  const slotLabel = getPhotoSlotLabel(day, normalizedType);
  const previousPhoto = patch?.photo ? getTypedPhoto(entry, normalizedType) : null;
  const previousRainHold = isRainHoldEntry(entry);

  if (dbClient && state.boardId) {
    const atomicResult = await persistEntryAtomically(day, normalizedType, entry, patch);
    if (atomicResult.supported) {
      if (patch) {
        patch.usedAtomic = true;
        patch.replacedPhotoPath = atomicResult.oldPhotoPath || "";
        patch.keepNewPathOnFailure = atomicResult.cleanupSafe === false;
      }
      if (!atomicResult.saved) {
        showToast(
          atomicResult.backendUpgradeRequired
            ? "서버 업데이트가 필요합니다. 관리자에게 데이터베이스 업데이트를 요청해 주세요."
            : `${slotLabel} 저장에 실패했습니다.`,
        );
      }
      return atomicResult.saved;
    }
    return false;
  } else {
    if (patch?.photo) setTypedPhoto(entry, normalizedType, patch.photo);
    if (typeof patch?.rainHold === "boolean") entry.rainHold = patch.rainHold;
    const saved = saveLocalBoard();
    if (!saved) restoreEntryPatch(entry, normalizedType, previousPhoto, previousRainHold, patch);
    return saved;
  }
}

function restoreEntryPatch(entry, photoType, previousPhoto, previousRainHold, patch) {
  if (patch?.photo && previousPhoto) setTypedPhoto(entry, photoType, previousPhoto);
  if (typeof patch?.rainHold === "boolean") entry.rainHold = previousRainHold;
}

async function persistEntryAtomically(day, photoType, entry, patch = null) {
  if (!dbClient || !state.boardId) {
    return { supported: false, saved: false };
  }
  if (atomicPhotoRpcAvailable === false) {
    return { supported: true, saved: false, backendUpgradeRequired: true, cleanupSafe: true };
  }

  const requestedBoardId = state.boardId;
  const photo = patch?.photo || getTypedPhoto(entry, photoType);
  const rainHold = typeof patch?.rainHold === "boolean" ? patch.rainHold : isRainHoldEntry(entry);
  let data = null;
  let error = null;
  try {
    ({ data, error } = await dbClient.rpc("save_photo_entry_atomic", {
      p_board_id: requestedBoardId,
      p_day_no: Number(day),
      p_photo_type: photoType,
      p_photo_url: photo.photoUrl || null,
      p_photo_path: photo.photoPath || null,
      p_size_bytes: Number(photo.sizeBytes || 0),
      p_captured_at: photo.capturedAt || null,
      p_captured_at_source: photo.capturedAtSource || null,
      p_rain_hold: rainHold,
      p_mutate_photo: Boolean(patch?.photo),
    }));
  } catch (requestError) {
    error = requestError;
  }

  if (error) {
    if (isMissingBackendFeature(error, "save_photo_entry_atomic")) {
      atomicPhotoRpcAvailable = false;
      console.warn("Atomic photo save RPC is unavailable; cloud writes are paused until the server is updated.");
      return { supported: true, saved: false, backendUpgradeRequired: true, cleanupSafe: true };
    }

    atomicPhotoRpcAvailable = true;
    console.error(error);
    const verification = await verifyCloudEntryWrite(day, requestedBoardId, photoType, patch);
    return {
      supported: true,
      saved: verification.confirmed,
      oldPhotoPath: "",
      cleanupSafe: verification.cleanupSafe,
    };
  }

  atomicPhotoRpcAvailable = true;
  const result = Array.isArray(data) ? data[0] : data;
  const row = result?.entry || result;
  if (!row) return { supported: true, saved: false };
  if (state.boardId === requestedBoardId) {
    state.entries[Number(row.day_no || day)] = cloudRowToEntry(row);
  }
  return {
    supported: true,
    saved: true,
    oldPhotoPath: result?.old_photo_path || "",
    cleanupSafe: true,
  };
}

async function verifyCloudEntryWrite(day, boardId, photoType, patch) {
  if (!dbClient || !boardId || !patch) return { confirmed: false, cleanupSafe: false };
  try {
    const { data: row, error } = await dbClient
      .from("photo_entries")
      .select("*")
      .eq("board_id", boardId)
      .eq("day_no", day)
      .maybeSingle();
    if (error) throw error;
    if (!row) {
      const expectedDelete = Boolean(patch.photo) && !patch.photo.photoUrl && !patch.photo.photoPath;
      return { confirmed: expectedDelete, cleanupSafe: true };
    }

    const savedEntry = cloudRowToEntry(row);
    const actualPhoto = getTypedPhoto(savedEntry, photoType);
    const photoMatches = !patch.photo || (
      String(actualPhoto.photoPath || "") === String(patch.photo.photoPath || "") &&
      String(actualPhoto.photoUrl || "") === String(patch.photo.photoUrl || "")
    );
    const rainMatches = typeof patch.rainHold !== "boolean" || isRainHoldEntry(savedEntry) === patch.rainHold;
    const confirmed = photoMatches && rainMatches;
    if (confirmed && state.boardId === boardId) {
      state.entries[Number(row.day_no || day)] = savedEntry;
    }
    return { confirmed, cleanupSafe: true };
  } catch (error) {
    console.warn("Photo save result could not be verified", error);
    return { confirmed: false, cleanupSafe: false };
  }
}

function isMissingBackendFeature(error, featureName = "") {
  const code = String(error?.code || "");
  const message = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`;
  return (
    code === "PGRST202" ||
    code === "PGRST204" ||
    code === "42883" ||
    (featureName && message.includes(featureName) && /not find|does not exist|schema cache/i.test(message))
  );
}

function saveLocalBoard() {
  if (!state.shareCode) return false;

  try {
    localStorage.setItem(
      LOCAL_PREFIX + state.shareCode,
      JSON.stringify({
        projectName: state.projectName,
        pourPart: state.pourPart,
        pourDate: state.pourDate,
        createdAt: state.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entries: normalizeEntries(state.entries),
        settings: normalizeBoardSettings(state.settings),
      })
    );
    renderStorageMeter();
    return true;
  } catch (error) {
    console.error(error);
    showToast("브라우저 저장공간이 부족합니다. 실시간 저장소 연결이 필요합니다.");
    return false;
  }
}

async function handlePhotoUpload(photoType, day, file) {
  const normalizedType = normalizePhotoType(photoType);
  const typeConfig = getPhotoTypeConfig(normalizedType);
  const slotLabel = getPhotoSlotLabel(day, normalizedType);
  if (!state.shareCode || (dbClient && !state.boardId)) {
    showToast("새 대지를 먼저 만들어 주세요.");
    return false;
  }

  if (!isImageFile(file)) {
    showToast("이미지 파일만 등록할 수 있습니다.");
    return false;
  }

  beginPhotoMutation();
  let image = null;
  let committed = false;
  let photoPatch = null;
  try {
    showToast(`${slotLabel} ${typeConfig.label} 사진을 압축하는 중입니다.`);
    image = await preparePhotoEntry(normalizedType, day, file);
    const entry = getEntry(day);
    const patch = photoPatch = {
      photo: image.nextPhoto,
      rainHold: normalizedType === PHOTO_TYPES.CURING ? false : isRainHoldEntry(entry),
    };
    const saved = await saveEntry(day, normalizedType, patch);
    if (!saved) {
      if (!patch.keepNewPathOnFailure) await cleanupNewPhotoPath(image.newPath);
      return false;
    }
    committed = true;
    await cleanupOldPhotoPath(
      patch.usedAtomic ? (patch.replacedPhotoPath || image.oldPath) : image.oldPath,
      image.newPath,
    );
    return true;
  } catch (error) {
    console.error(error);
    if (image?.newPath && !committed && !photoPatch?.keepNewPathOnFailure) {
      await cleanupNewPhotoPath(image.newPath);
    }
    showToast("사진 등록에 실패했습니다. 다른 사진이나 JPG 사진으로 다시 시도해 주세요.");
    return false;
  } finally {
    await endPhotoMutation();
  }
}

async function handlePhotoSelection(photoType, startDay, files) {
  const normalizedType = normalizePhotoType(photoType);
  const typeConfig = getPhotoTypeConfig(normalizedType);
  if (files.length <= 1) {
    await handlePhotoUpload(normalizedType, startDay, files[0]);
    return;
  }

  if (!state.shareCode || (dbClient && !state.boardId)) {
    showToast("새 대지를 먼저 만들어 주세요.");
    return;
  }

  const imageFiles = files.filter(isImageFile);
  if (!imageFiles.length) {
    showToast("이미지 파일만 등록할 수 있습니다.");
    return;
  }

  const targetDays = days(normalizedType).filter((day) => day >= startDay);
  if (!targetDays.length) return;

  const maxCount = Math.min(targetDays.length, imageFiles.length);
  const overwriteCount = targetDays.slice(0, maxCount).filter((day) => hasEntryPhoto(getEntry(day), normalizedType)).length;
  if (overwriteCount) {
    const ok = window.confirm(`기존 ${typeConfig.label} 사진 ${overwriteCount}장을 새 사진으로 바꿀까요?`);
    if (!ok) return;
  }

  let completed = 0;
  let failed = 0;
  let fileIndex = 0;
  const startLabel = getPhotoSlotLabel(targetDays[0], normalizedType);
  beginPhotoMutation();
  try {
    showToast(`${startLabel}부터 ${typeConfig.label} 사진 ${maxCount}장을 등록하는 중입니다.`);
    for (const day of targetDays) {
      if (fileIndex >= imageFiles.length) break;

      let savedForDay = false;
      while (!savedForDay && fileIndex < imageFiles.length) {
        const file = imageFiles[fileIndex];
        fileIndex += 1;
        let image = null;
        let committed = false;
        let photoPatch = null;

        try {
          image = await preparePhotoEntry(normalizedType, day, file);
          const entry = getEntry(day);
          const patch = photoPatch = {
            photo: image.nextPhoto,
            rainHold: normalizedType === PHOTO_TYPES.CURING ? false : isRainHoldEntry(entry),
          };
          const saved = await persistEntry(day, normalizedType, patch);
          if (!saved) {
            throw new Error(`${getPhotoSlotLabel(day, normalizedType)} 저장 실패`);
          }
          committed = true;
          await cleanupOldPhotoPath(
            patch.usedAtomic ? (patch.replacedPhotoPath || image.oldPath) : image.oldPath,
            image.newPath,
          );
          completed += 1;
          savedForDay = true;
        } catch (error) {
          console.error(error);
          if (image?.newPath && !committed && !photoPatch?.keepNewPathOnFailure) {
            await cleanupNewPhotoPath(image.newPath);
          }
          failed += 1;
        }
      }
    }

    try {
      await loadBoardList();
    } catch (error) {
      console.warn("Saved entries list refresh failed", error);
      pendingRealtimeRefresh = Boolean(dbClient);
    }
    renderAll();

    const overflowCount = Math.max(0, imageFiles.length - targetDays.length - failed);
    const invalidCount = files.length - imageFiles.length;
    const overflowText = getOverflowPhotoText(overflowCount, normalizedType);
    const invalidText = invalidCount > 0 ? ` 이미지가 아닌 파일 ${invalidCount}개는 제외했습니다.` : "";
    const failedText = failed > 0 ? ` 처리 실패 ${failed}장은 건너뛰었습니다.` : "";
    const doneText = completed > 0
      ? `${typeConfig.label} 사진 ${completed}장을 등록했습니다.`
      : `${typeConfig.label} 사진을 등록하지 못했습니다.`;
    showToast(`${doneText}${overflowText}${invalidText}${failedText}`);
  } catch (error) {
    console.error(error);
    await loadBoardList();
    renderAll();
    showToast(`${completed}장 등록 후 중단됐습니다. 실패한 사진은 다시 시도해 주세요.`);
  } finally {
    await endPhotoMutation();
  }
}

async function preparePhotoEntry(photoType, day, file) {
  const normalizedType = normalizePhotoType(photoType);
  const uploadContext = {
    client: dbClient,
    boardId: state.boardId,
    shareCode: state.shareCode,
  };
  const uploadFile = await prepareImageFile(file);
  const image = await resizeImage(uploadFile);
  const entry = getEntry(day);
  const previousPhoto = getTypedPhoto(entry, normalizedType);
  const oldPath = previousPhoto.photoPath;
  const uploadedAt = new Date().toISOString();
  let newPath = "";
  const nextPhoto = {
    photoUrl: image.dataUrl,
    photoPath: "",
    uploadedAt,
    verifiedAt: dbClient ? "" : uploadedAt,
    verifiedAtSource: dbClient ? "" : "device",
    capturedAt: "",
    capturedAtSource: "",
    sizeBytes: image.blob.size,
  };

  if (uploadContext.client && uploadContext.boardId) {
    if (state.boardId !== uploadContext.boardId || state.shareCode !== uploadContext.shareCode) {
      throw new Error("Photo board changed while preparing the upload.");
    }
    const objectId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const path = `${uploadContext.shareCode}/${normalizedType}/day-${day}-${objectId}.jpg`;
    let uploadError = null;
    try {
      ({ error: uploadError } = await uploadContext.client.storage
        .from(config.bucket)
        .upload(path, image.blob, {
          contentType: "image/jpeg",
          upsert: false,
        }));
    } catch (requestError) {
      uploadError = requestError;
    }

    if (uploadError) {
      await uploadContext.client.storage.from(config.bucket).remove([path]).catch(() => {});
      throw uploadError;
    }
    newPath = path;
    try {
      const { data } = uploadContext.client.storage.from(config.bucket).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("Uploaded photo URL is unavailable.");
      Object.assign(nextPhoto, {
        photoUrl: data.publicUrl,
        photoPath: path,
      });
    } catch (error) {
      await uploadContext.client.storage.from(config.bucket).remove([path]).catch(console.error);
      throw error;
    }
  }

  return {
    ...image,
    oldPath,
    newPath,
    previousPhoto,
    nextPhoto,
  };
}

async function cleanupOldPhotoPath(oldPath, newPath) {
  if (!dbClient || !oldPath || oldPath === newPath) return;
  try {
    const { error } = await dbClient.storage.from(config.bucket).remove([oldPath]);
    if (error) {
      queueStorageCleanupPath(oldPath);
      console.warn("Replaced photo storage cleanup failed", error);
    }
  } catch (error) {
    queueStorageCleanupPath(oldPath);
    console.warn("Replaced photo storage cleanup failed", error);
  }
}

async function cleanupNewPhotoPath(newPath) {
  if (!dbClient || !newPath) return;
  try {
    const { error } = await dbClient.storage.from(config.bucket).remove([newPath]);
    if (error) {
      queueStorageCleanupPath(newPath);
      console.warn("Failed photo upload cleanup failed", error);
    }
  } catch (error) {
    queueStorageCleanupPath(newPath);
    console.warn("Failed photo upload cleanup failed", error);
  }
}

function queueStorageCleanupPath(path) {
  if (!path) return;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_CLEANUP_QUEUE_KEY) || "[]");
    const paths = new Set(Array.isArray(saved) ? saved.filter(Boolean).map(String) : []);
    paths.add(String(path));
    localStorage.setItem(STORAGE_CLEANUP_QUEUE_KEY, JSON.stringify(Array.from(paths).slice(-500)));
  } catch {
    // 재시도 목록 저장 실패는 원래 사진 저장 결과를 되돌리지 않습니다.
  }
}

async function flushStorageCleanupQueue() {
  if (!dbClient) return;
  let paths = [];
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_CLEANUP_QUEUE_KEY) || "[]");
    paths = Array.isArray(saved) ? Array.from(new Set(saved.filter(Boolean).map(String))) : [];
  } catch {
    return;
  }
  if (!paths.length) return;
  const { error } = await dbClient.storage.from(config.bucket).remove(paths);
  if (error) throw error;
  try {
    localStorage.removeItem(STORAGE_CLEANUP_QUEUE_KEY);
  } catch {
    // 이미 파일은 정리됐으므로 다음 재시도에서 같은 경로 삭제를 반복해도 안전합니다.
  }
}

async function deletePhoto(photoType, day, { skipConfirm = false } = {}) {
  const normalizedType = normalizePhotoType(photoType);
  const typeConfig = getPhotoTypeConfig(normalizedType);
  const slotLabel = getPhotoSlotLabel(day, normalizedType);
  const entry = getEntry(day);
  const previousPhoto = getTypedPhoto(entry, normalizedType);
  if (!previousPhoto.photoUrl) return true;
  if (!skipConfirm) {
    const ok = window.confirm(`${slotLabel} ${typeConfig.label} 사진을 삭제할까요?`);
    if (!ok) return false;
  }

  endFilePickNow();
  beginPhotoMutation();

  try {
    const patch = {
      photo: {
        photoUrl: "",
        photoPath: "",
        uploadedAt: "",
        verifiedAt: "",
        verifiedAtSource: "",
        capturedAt: "",
        capturedAtSource: "",
        sizeBytes: 0,
      },
      rainHold: isRainHoldEntry(entry),
    };
    const saved = await saveEntry(day, normalizedType, patch);
    if (!saved) {
      showToast(`${slotLabel} ${typeConfig.label} 사진 삭제 저장에 실패했습니다.`);
      return false;
    }

    const removedPath = patch.usedAtomic
      ? (patch.replacedPhotoPath || previousPhoto.photoPath)
      : previousPhoto.photoPath;
    await cleanupOldPhotoPath(removedPath, "");
    return true;
  } finally {
    await endPhotoMutation();
  }
}

async function toggleRainHold(day) {
  if (!day) return;
  if (!state.shareCode || (dbClient && !state.boardId)) {
    showToast("새 대지를 먼저 만들어 주세요.");
    return;
  }

  const entry = getEntry(day);
  const previousRainHold = isRainHoldEntry(entry);
  if (!previousRainHold && hasEntryPhoto(entry, PHOTO_TYPES.CURING)) {
    showToast("사진이 등록된 일차는 사진 삭제 후 우천대기로 변경해 주세요.");
    return;
  }

  beginPhotoMutation();
  try {
    const saved = await saveEntry(day, PHOTO_TYPES.CURING, { rainHold: !previousRainHold });
    if (!saved) {
      showToast(`${day}일차 우천 설정 저장에 실패했습니다.`);
    }
  } finally {
    await endPhotoMutation();
  }
}

function getEntry(day) {
  if (!state.entries[day]) {
    state.entries[day] = {
      dayNo: day,
      photoUrl: "",
      photoPath: "",
      uploadedAt: "",
      sizeBytes: 0,
      rainHold: false,
      photos: {},
    };
  }
  normalizeEntryShape(state.entries[day]);
  return state.entries[day];
}

function normalizePhotoType(photoType) {
  return Object.values(PHOTO_TYPES).includes(photoType) ? photoType : DEFAULT_PHOTO_TYPE;
}

function getPhotoTypeConfig(photoType = activePhotoType) {
  return PHOTO_TYPE_CONFIG[normalizePhotoType(photoType)] || PHOTO_TYPE_CONFIG[DEFAULT_PHOTO_TYPE];
}

function getPhotoSlotLabel(slot, photoType = activePhotoType) {
  const normalizedType = normalizePhotoType(photoType);
  // 습윤양생 일차는 관리자가 지정한 사용자 이름을 우선 사용(없으면 "N일차").
  if (normalizedType === PHOTO_TYPES.CURING) {
    const custom = getDaySlotCustomLabel(slot);
    if (custom) return custom;
  }
  const config = getPhotoTypeConfig(normalizedType);
  return config.slotLabel ? config.slotLabel(slot) : `${slot}일차`;
}

function getPhotoSlotDateLabel(slot, photoType = activePhotoType) {
  const config = getPhotoTypeConfig(photoType);
  return config.slotDateLabel ? config.slotDateLabel(slot) : formatDayDate(slot);
}

function getPhotoSlotCompactLabel(slot, photoType = activePhotoType) {
  const config = getPhotoTypeConfig(photoType);
  return config.slotCompactLabel ? config.slotCompactLabel(slot) : formatCompactDayDate(slot);
}

function getOverflowPhotoText(count, photoType = activePhotoType) {
  if (count <= 0) return "";
  if (normalizePhotoType(photoType) === PHOTO_TYPES.TEMPERATURE) {
    return ` ${count}장은 등록 가능한 측정 칸을 넘어 제외했습니다.`;
  }
  return ` ${count}장은 등록 가능한 일차 칸을 넘어 제외했습니다.`;
}

function setActivePhotoType(photoType) {
  const nextType = normalizePhotoType(photoType);
  // 온도측정 탭은 관리자 모드에서만 선택 가능(일반 모드에서는 흡수되어 접근 불가).
  if (nextType === PHOTO_TYPES.TEMPERATURE && !isAdminMode) {
    return;
  }
  if (activePhotoMutationCount > 0 && activePhotoType !== nextType) {
    showToast("현재 저장 작업이 끝난 뒤 사진 종류를 바꿔 주세요.");
    return;
  }
  if (activePhotoType === nextType) {
    renderPhotoTypeControls();
    return;
  }

  activePhotoType = nextType;
  renderSummary();
  if (!isFilePickerOpen) {
    renderDayGrid();
  }
  renderPrintArea();
  renderPhotoTypeControls();
}

function renderPhotoTypeControls() {
  const configForActive = getPhotoTypeConfig(activePhotoType);
  if (elements.photoSectionTitle) {
    elements.photoSectionTitle.textContent = configForActive.sectionTitle;
  }

  elements.photoTypeTabs?.querySelectorAll("[data-photo-type]").forEach((button) => {
    const buttonPhotoType = normalizePhotoType(button.dataset.photoType);
    const selected = buttonPhotoType === activePhotoType;
    const isTemperatureButton = buttonPhotoType === PHOTO_TYPES.TEMPERATURE;
    const hideTemperatureButton = isTemperatureButton && !isAdminMode;
    button.setAttribute("aria-selected", String(selected));
    button.hidden = hideTemperatureButton;
    button.disabled = hideTemperatureButton;
    button.tabIndex = hideTemperatureButton ? -1 : 0;
    if (hideTemperatureButton) {
      button.setAttribute("aria-hidden", "true");
    } else {
      button.removeAttribute("aria-hidden");
    }
    button.classList.toggle("active", selected);
    button.classList.toggle("temperature-stealth-tab", hideTemperatureButton);
    button.classList.toggle("temperature-visible-tab", isTemperatureButton && isAdminMode);
  });
}

// ===== 관리자 모드 =====
function loadAdminMode() {
  try {
    return localStorage.getItem(ADMIN_MODE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setAdminMode(on) {
  isAdminMode = Boolean(on);
  if (!isAdminMode) weatherMismatchFilterActive = false;
  try {
    localStorage.setItem(ADMIN_MODE_STORAGE_KEY, isAdminMode ? "1" : "0");
  } catch {
    // 개인 설정 저장 실패는 사진 저장과 별개로 조용히 무시합니다.
  }
  applyAdminModeUi();

  // 관리자 모드를 끄면서 온도측정 탭을 보고 있었다면 습윤양생으로 되돌립니다.
  if (!isAdminMode && activePhotoType === PHOTO_TYPES.TEMPERATURE) {
    activePhotoType = PHOTO_TYPES.CURING;
    renderPhotoTypeControls();
  } else {
    renderPhotoTypeControls();
  }
  renderAll();
  if (isAdminMode) loadWeatherData().catch(() => {});
}

function applyAdminModeUi() {
  document.body.classList.toggle("admin-mode", isAdminMode);
  // 타설일은 관리자 모드에서만 편집 가능(일반 모드는 잠금).
  if (elements.pourDateInput) elements.pourDateInput.readOnly = !isAdminMode;
  if (elements.prevPourDateButton) elements.prevPourDateButton.disabled = !isAdminMode;
  if (elements.nextPourDateButton) elements.nextPourDateButton.disabled = !isAdminMode;
  renderDaySlotBlindButton();
}

function getWeatherFunctionUrl() {
  if (config.weatherFunctionUrl) return String(config.weatherFunctionUrl);
  if (!config.supabaseUrl) return "";
  return `${String(config.supabaseUrl).replace(/\/$/, "")}/functions/v1/${WEATHER_FUNCTION_NAME}`;
}

async function loadWeatherData({ force = false } = {}) {
  if (!force && (weatherLoadState === "loading" || weatherLoadState === "loaded")) return;

  const functionUrl = getWeatherFunctionUrl();
  if (!functionUrl) {
    weatherLoadState = "error";
    weatherLoadError = "기상 조회 주소가 설정되지 않았습니다.";
    renderWeatherDataIfVisible();
    return;
  }

  weatherLoadState = "loading";
  weatherLoadError = "";
  weatherLiveWarning = "";
  renderWeatherDataIfVisible();

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), WEATHER_REQUEST_TIMEOUT_MS);
  const headers = { Accept: "application/json" };
  if (config.supabaseAnonKey) {
    headers.apikey = config.supabaseAnonKey;
  }

  try {
    const url = new URL(functionUrl);
    url.searchParams.set("stationId", WEATHER_STATION_ID);
    if (force) url.searchParams.set("refresh", String(Date.now()));
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      let detail = "";
      try {
        const errorPayload = await response.json();
        detail = String(errorPayload?.error || "");
      } catch {
        // 응답 본문이 JSON이 아니면 상태 코드만 표시합니다.
      }
      throw new Error(detail || `기상 조회 실패 (${response.status})`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.items) ? payload.items : [];
    const nextMap = new Map();
    items.forEach((item) => {
      const date = String(item?.date || "");
      const rainMm = Number(item?.rainMm);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(rainMm)) return;
      nextMap.set(date, {
        date,
        rainMm: Math.max(0, rainMm),
        isFinal: item?.isFinal !== false,
        fetchedAt: String(item?.fetchedAt || payload?.fetchedAt || ""),
        source: String(item?.source || payload?.source?.name || "기상청"),
      });
    });

    weatherDailyByDate = nextMap;
    weatherFetchedAt = String(payload?.fetchedAt || "");
    weatherPersistenceAvailable = payload?.persistence?.available === true;
    weatherPersistenceMessage = String(payload?.persistence?.message || "");
    weatherLiveWarning = String(payload?.warning || "");
    weatherLoadState = "loaded";
  } catch (error) {
    weatherLoadState = "error";
    weatherLoadError = error?.name === "AbortError"
      ? "기상 조회 시간이 초과됐습니다."
      : error?.message || "기상자료를 확인하지 못했습니다.";
  } finally {
    window.clearTimeout(timeoutId);
    renderWeatherDataIfVisible();
  }
}

function renderWeatherDataIfVisible() {
  if (isAdminMode) renderWeatherAuditPanel();
  renderBoardList();
  if (activePhotoType === PHOTO_TYPES.CURING) {
    renderSummary();
    if (!isFilePickerOpen) renderDayGrid();
  }
}

function getDayDateKey(day) {
  if (!state.pourDate) return "";
  return getDateKeyForPourDay(state.pourDate, day);
}

function getDateKeyForPourDay(pourDate, day) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(pourDate || ""));
  const dayNo = Number(day);
  if (!match || !Number.isInteger(dayNo) || dayNo < 1) return "";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + dayNo - 1));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function getSeoulTodayDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function getWeatherRecord(date) {
  const value = weatherDailyByDate.get(date);
  if (typeof value === "number") {
    return { date, rainMm: value, isFinal: date < getSeoulTodayDateKey(), fetchedAt: "", source: "기상청" };
  }
  return value || null;
}

function isPourDayDue(pourDate, dayNo, today = getSeoulTodayDateKey()) {
  const date = getDateKeyForPourDay(pourDate, dayNo);
  return Boolean(date) && date <= today;
}

function getRainAuditStatus(pourDate, dayNo) {
  const date = getDateKeyForPourDay(pourDate, dayNo);
  const today = getSeoulTodayDateKey();
  if (!date) return "no-data";
  if (date > today) return "future";
  const weather = getWeatherRecord(date);
  if (date === today || weather?.isFinal === false) return "pending";
  if (!weather) return "no-data";
  return Number(weather.rainMm) > 0 ? "confirmed" : "mismatch";
}

function renderWeatherProof(day, rainHold) {
  if (!isAdminMode || activePhotoType !== PHOTO_TYPES.CURING) return "";

  const date = getDayDateKey(day);
  let className = "weather-proof admin-only";
  let text = "기상청 확인 중";
  let title = `${WEATHER_STATION_NAME} 일강수량을 확인하는 중입니다.`;

  if (!date) {
    className += " is-unavailable";
    text = "타설일 입력 필요";
    title = "타설일을 입력하면 날짜별 강수량을 확인합니다.";
  } else if (weatherLoadState === "error") {
    className += " is-unavailable";
    text = "기상자료 연결 필요";
    title = weatherLoadError || "기상자료를 확인하지 못했습니다.";
  } else if (weatherLoadState === "loaded") {
    if (!weatherDailyByDate.has(date)) {
      className += " is-unavailable";
      text = "기상자료 없음 · 확인 불가";
      title = `${date} ${WEATHER_STATION_NAME} 자료를 확인할 수 없습니다.`;
    } else {
      const record = getWeatherRecord(date);
      const rainMm = Number(record?.rainMm || 0);
      const rainText = formatRainMm(rainMm);
      const fetchedText = record?.fetchedAt ? ` · 수집 ${formatDateTime(record.fetchedAt)}` : "";
      if (date === getSeoulTodayDateKey() || record?.isFinal === false) {
        className += " is-pending";
        text = `기상청 집계 중 · ${rainText}`;
        title = `${date} ${WEATHER_STATION_NAME} 당일 누적강수량 ${rainText}이며 최종값은 다음 날 확정됩니다.${fetchedText}`;
      } else if (rainMm > 0) {
        className += " is-rain";
        text = `기상청 ✓ 비 확인 · ${rainText}`;
        title = `${date} ${WEATHER_STATION_NAME} 일강수량 ${rainText}${fetchedText}`;
      } else if (rainHold) {
        className += " is-mismatch";
        text = "기상청 ⚠ 미관측·현장확인 · 0mm";
        title = `${date} ${WEATHER_STATION_NAME} 일강수량은 0mm입니다. 국지성 강수 가능성이 있어 현장 확인이 필요합니다.${fetchedText}`;
      } else {
        className += " is-dry";
        text = "기상청 비 미관측 · 0mm";
        title = `${date} ${WEATHER_STATION_NAME} 일강수량 0mm${fetchedText}`;
      }
    }
  }

  return `<span class="${className}" title="${escapeAttribute(title)}">${escapeHtml(text)}</span>`;
}

function formatRainMm(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "0mm";
  return `${Number.isInteger(number) ? number.toFixed(0) : number.toFixed(1)}mm`;
}

function isBoardRainHoldEntry(entry) {
  return isRainHoldEntry(entry) || parseEntryMemo(entry?.memo).rainHold;
}

function getBoardRainAuditRecords(board) {
  return getEntryItems(board?.entries || {})
    .filter(({ entry }) => isBoardRainHoldEntry(entry))
    .map(({ dayNo }) => {
      const date = getDateKeyForPourDay(board?.pourDate, dayNo);
      const weather = date ? getWeatherRecord(date) : null;
      const status = getRainAuditStatus(board?.pourDate, dayNo);
      return {
        board,
        dayNo,
        date,
        weather,
        status,
      };
    });
}

function getRainAuditStats(sourceBoards = boardList) {
  const records = (sourceBoards || []).flatMap(getBoardRainAuditRecords);
  return {
    records,
    registered: records.length,
    confirmed: records.filter((record) => record.status === "confirmed").length,
    mismatch: records.filter((record) => record.status === "mismatch").length,
    noData: records.filter((record) => record.status === "no-data").length,
    pending: records.filter((record) => record.status === "pending" || record.status === "future").length,
  };
}

function handleWeatherAuditClick(event) {
  const refreshButton = event.target.closest("[data-weather-refresh]");
  if (refreshButton) {
    loadWeatherData({ force: true }).catch(console.error);
    return;
  }

  const filterButton = event.target.closest("[data-weather-mismatch-filter]");
  if (filterButton) {
    weatherMismatchFilterActive = !weatherMismatchFilterActive;
    renderWeatherAuditPanel();
    renderBoardList();
    return;
  }

  const recordButton = event.target.closest("[data-weather-board-code]");
  if (recordButton) openBoard(recordButton.dataset.weatherBoardCode).catch(console.error);
}

function renderWeatherAuditPanel() {
  if (!elements.weatherAuditPanel) return;
  if (!isAdminMode) {
    elements.weatherAuditPanel.innerHTML = "";
    return;
  }

  const stats = getRainAuditStats();
  const mismatches = stats.records.filter((record) => record.status === "mismatch");
  const persistenceClass = weatherPersistenceAvailable ? "is-ok" : "is-warning";
  let connectionText = "기상자료 확인 대기";
  let connectionClass = "is-loading";

  if (weatherLoadState === "loading") {
    connectionText = "기상청 자료를 확인하는 중입니다.";
  } else if (weatherLoadState === "error") {
    connectionText = weatherLoadError || "기상자료를 확인하지 못했습니다.";
    connectionClass = "is-error";
  } else if (weatherLoadState === "loaded") {
    connectionClass = persistenceClass;
    if (!weatherPersistenceAvailable) {
      connectionText = weatherPersistenceMessage || "과거 기상자료 영구 저장 연결을 확인해 주세요.";
    } else if (weatherLiveWarning) {
      connectionText = `실시간 조회 지연 · 저장된 과거자료로 표시 중 (${weatherLiveWarning})`;
      connectionClass = "is-warning";
    } else {
      const fetchedText = weatherFetchedAt ? ` · 최근 조회 ${formatDateTime(weatherFetchedAt)}` : "";
      connectionText = `과거 기상자료 자동 저장 정상${fetchedText}`;
    }
  }

  const mismatchList = mismatches.length
    ? `<div class="weather-audit-mismatch-list" aria-label="기상청 미관측 목록">
        ${mismatches.map((record) => `
          <button class="weather-audit-record" type="button" data-weather-board-code="${escapeAttribute(record.board.shareCode)}">
            <span>${escapeHtml(record.date || "날짜 없음")}</span>
            <strong>${escapeHtml(record.board.pourPart || "미입력")}</strong>
            <small>${escapeHtml(`${record.dayNo}일차 · 0mm · 현장확인 필요`)}</small>
          </button>
        `).join("")}
      </div>`
    : `<p class="weather-audit-empty">현재 기상청 0mm 불일치 건이 없습니다.</p>`;

  elements.weatherAuditPanel.innerHTML = `
    <div class="weather-audit-heading">
      <div>
        <strong>기상청 우천 검증</strong>
        <p>${escapeHtml(`${WEATHER_STATION_NAME} ${WEATHER_STATION_ID} · 현장 약 ${WEATHER_STATION_DISTANCE_KM}km · 일강수량 0mm 초과 시 비 확인`)}</p>
      </div>
      <button class="small-button weather-refresh-button" type="button" data-weather-refresh ${weatherLoadState === "loading" ? "disabled" : ""}>다시 조회</button>
    </div>
    <div class="weather-audit-stats">
      <span><small>우천 등록</small><strong>${stats.registered}</strong></span>
      <span class="is-confirmed"><small>강수 확인</small><strong>${stats.confirmed}</strong></span>
      <span class="is-mismatch"><small>0mm·현장확인</small><strong>${stats.mismatch}</strong></span>
      <span class="is-no-data"><small>자료 없음</small><strong>${stats.noData}</strong></span>
      <span class="is-pending"><small>미도래·집계 중</small><strong>${stats.pending}</strong></span>
    </div>
    <div class="weather-audit-toolbar">
      <span class="weather-audit-connection ${connectionClass}">${escapeHtml(connectionText)}</span>
      <button class="small-button weather-mismatch-filter ${weatherMismatchFilterActive ? "active" : ""}" type="button" data-weather-mismatch-filter aria-pressed="${weatherMismatchFilterActive}">
        ${weatherMismatchFilterActive ? "전체 대지 보기" : `불일치 ${stats.mismatch}건만 보기`}
      </button>
    </div>
    ${mismatchList}
    <p class="weather-audit-note">0mm는 허위 판정이 아니라 ‘기상청 미관측’입니다. 국지성 소나기 가능성이 있어 현장자료를 함께 확인하세요.</p>
  `;
}

function cleanupLegacyPreferences() {
  // 구 버전 "온도 표시/숨김" 개인 설정을 정리하고 관리자 모드로 흡수합니다.
  try {
    localStorage.removeItem(LEGACY_TEMPERATURE_VISIBILITY_STORAGE_KEY);
  } catch {
    // 무시
  }
}

// ===== 일차 슬롯 구성(관리자 편집) =====
function cleanBoardSlotList(list, fallback, maxCount) {
  const cleaned = Array.from(
    new Set((Array.isArray(list) ? list : []).map(Number).filter((value) => Number.isInteger(value) && value >= 1))
  )
    .sort((a, b) => a - b)
    .slice(0, maxCount);
  return cleaned.length ? cleaned : [...fallback];
}

function cleanDaySlotLabels(labels) {
  if (!labels || typeof labels !== "object" || Array.isArray(labels)) return {};
  return Object.fromEntries(
    Object.entries(labels)
      .map(([day, label]) => [String(Number(day)), typeof label === "string" ? label.trim().slice(0, 80) : ""])
      .filter(([day, label]) => Number.isInteger(Number(day)) && Number(day) >= 1 && label)
  );
}

function readSettingsObject(value) {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeBoardSettings(value, { fallback = null } = {}) {
  const defaults = createDefaultBoardSettings();
  const fallbackSource = readSettingsObject(fallback);
  const source = readSettingsObject(value);
  const base = {
    daySlots: cleanBoardSlotList(fallbackSource.daySlots, defaults.daySlots, MAX_DAY_SLOT_COUNT),
    temperatureSlots: cleanBoardSlotList(
      fallbackSource.temperatureSlots,
      defaults.temperatureSlots,
      MAX_TEMPERATURE_SLOT_COUNT
    ),
    extraDaySlotsHidden:
      typeof fallbackSource.extraDaySlotsHidden === "boolean" ? fallbackSource.extraDaySlotsHidden : false,
    dayLabels: cleanDaySlotLabels(fallbackSource.dayLabels),
  };

  return {
    daySlots: Array.isArray(source.daySlots)
      ? cleanBoardSlotList(source.daySlots, base.daySlots, MAX_DAY_SLOT_COUNT)
      : base.daySlots,
    temperatureSlots: Array.isArray(source.temperatureSlots)
      ? cleanBoardSlotList(source.temperatureSlots, base.temperatureSlots, MAX_TEMPERATURE_SLOT_COUNT)
      : base.temperatureSlots,
    extraDaySlotsHidden:
      typeof source.extraDaySlotsHidden === "boolean" ? source.extraDaySlotsHidden : base.extraDaySlotsHidden,
    dayLabels:
      source.dayLabels && typeof source.dayLabels === "object"
        ? cleanDaySlotLabels(source.dayLabels)
        : base.dayLabels,
  };
}

function readLegacySlotList(key, count, maxCount) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    return cleanBoardSlotList(raw, Array.from({ length: count }, (_, index) => index + 1), maxCount);
  } catch {
    return Array.from({ length: count }, (_, index) => index + 1);
  }
}

function getLegacyBoardSettings() {
  let extraDaySlotsHidden = false;
  let dayLabels = {};
  try {
    extraDaySlotsHidden = localStorage.getItem(DAY_SLOT_EXTRA_HIDDEN_STORAGE_KEY) === "1";
    dayLabels = JSON.parse(localStorage.getItem(DAY_SLOT_LABELS_STORAGE_KEY) || "{}");
  } catch {
    // 구 버전 개인 설정이 없으면 기본값을 사용합니다.
  }
  return normalizeBoardSettings({
    daySlots: readLegacySlotList(DAY_SLOT_LIST_STORAGE_KEY, DEFAULT_DAY_SLOT_COUNT, MAX_DAY_SLOT_COUNT),
    temperatureSlots: readLegacySlotList(
      TEMPERATURE_SLOT_LIST_STORAGE_KEY,
      DEFAULT_TEMPERATURE_SLOT_COUNT,
      MAX_TEMPERATURE_SLOT_COUNT
    ),
    extraDaySlotsHidden,
    dayLabels,
  });
}

function loadBoardSettingsFallback(shareCode) {
  if (!shareCode) return null;
  try {
    const saved = localStorage.getItem(BOARD_SETTINGS_FALLBACK_PREFIX + shareCode);
    return saved ? normalizeBoardSettings(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
}

function saveBoardSettingsFallback(shareCode, settings) {
  if (!shareCode) return false;
  try {
    localStorage.setItem(BOARD_SETTINGS_FALLBACK_PREFIX + shareCode, JSON.stringify(normalizeBoardSettings(settings)));
    return true;
  } catch {
    return false;
  }
}

function clearBoardSettingsFallback(shareCode) {
  try {
    localStorage.removeItem(BOARD_SETTINGS_FALLBACK_PREFIX + shareCode);
  } catch {
    // 정리 실패는 서버 저장 결과에 영향을 주지 않습니다.
  }
}

function hasBoardSettingsFields(value) {
  const source = readSettingsObject(value);
  return ["daySlots", "temperatureSlots", "extraDaySlotsHidden", "dayLabels"].some((key) =>
    Object.prototype.hasOwnProperty.call(source, key)
  );
}

function getBoardSettingsForRecord(board, shareCode) {
  const hasSettingsColumn = Boolean(board && Object.prototype.hasOwnProperty.call(board, "settings"));
  if (hasSettingsColumn) boardSettingsColumnAvailable = true;
  const localFallback = loadBoardSettingsFallback(shareCode);
  const migrationFallback = localFallback || getLegacyBoardSettings();
  return normalizeBoardSettings(board?.settings, {
    fallback: hasBoardSettingsFields(board?.settings) ? null : migrationFallback,
  });
}

function updateBoardListSettings(shareCode, settings) {
  const board = boardList.find((item) => item.shareCode === shareCode);
  if (board) board.settings = normalizeBoardSettings(settings);
}

function updateBoardSettings(mutator) {
  if (!state.shareCode) return Promise.resolve(false);
  const previous = normalizeBoardSettings(state.settings);
  const draft = normalizeBoardSettings(previous);
  const mutated = typeof mutator === "function" ? mutator(draft) || draft : mutator;
  const next = normalizeBoardSettings(mutated, { fallback: previous });
  if (JSON.stringify(previous) === JSON.stringify(next)) return Promise.resolve(true);

  const context = {
    shareCode: state.shareCode,
    boardId: state.boardId,
    revision: ++boardSettingsRevision,
    previous,
    next,
  };
  state.settings = next;
  updateBoardListSettings(context.shareCode, next);
  printImageCache = { signature: "", images: [] };
  renderAll();

  const persist = () => persistBoardSettingsChange(context);
  boardSettingsSaveCount += 1;
  const promise = boardSettingsSaveChain.then(persist, persist);
  boardSettingsSaveChain = promise
    .catch(() => {})
    .finally(async () => {
      boardSettingsSaveCount = Math.max(0, boardSettingsSaveCount - 1);
      await flushPendingRealtimeRefresh();
    });
  return promise;
}

async function persistBoardSettingsChange(context) {
  let saved = false;
  let error = null;

  if (!dbClient || !context.boardId) {
    if (state.shareCode === context.shareCode) {
      saved = saveLocalBoard();
    } else {
      saved = saveBoardSettingsFallback(context.shareCode, context.next);
    }
  } else if (boardSettingsColumnAvailable !== false) {
    const result = await dbClient
      .from("photo_boards")
      .update({ settings: context.next })
      .eq("id", context.boardId)
      .select("id, settings")
      .maybeSingle();
    error = result.error;
    if (error && isMissingBackendFeature(error, "settings")) {
      boardSettingsColumnAvailable = false;
      error = null;
    } else if (!error) {
      boardSettingsColumnAvailable = true;
      saved = Boolean(result.data);
      if (saved) clearBoardSettingsFallback(context.shareCode);
    }
  }

  if (!saved && !error && dbClient && context.boardId && boardSettingsColumnAvailable === false) {
    saved = saveBoardSettingsFallback(context.shareCode, context.next);
  }

  if (saved) return true;

  if (error) console.error(error);
  if (
    state.shareCode === context.shareCode &&
    state.boardId === context.boardId &&
    boardSettingsRevision === context.revision
  ) {
    state.settings = context.previous;
    updateBoardListSettings(context.shareCode, context.previous);
    renderAll();
  }
  showToast("일차 설정을 저장하지 못했습니다. 다시 시도해 주세요.");
  return false;
}

function getStoredDaySlotList(settings = state.settings) {
  return normalizeBoardSettings(settings).daySlots;
}

function saveDaySlotList(list) {
  return updateBoardSettings((settings) => {
    settings.daySlots = cleanBoardSlotList(list, [1], MAX_DAY_SLOT_COUNT);
    return settings;
  });
}

function getStoredTemperatureSlotList(settings = state.settings) {
  return normalizeBoardSettings(settings).temperatureSlots;
}

function saveTemperatureSlotList(list) {
  return updateBoardSettings((settings) => {
    settings.temperatureSlots = cleanBoardSlotList(list, [1], MAX_TEMPERATURE_SLOT_COUNT);
    return settings;
  });
}

function loadExtraDaySlotHiddenMode(settings = state.settings) {
  return normalizeBoardSettings(settings).extraDaySlotsHidden;
}

function saveExtraDaySlotHiddenMode(enabled) {
  return updateBoardSettings((settings) => {
    settings.extraDaySlotsHidden = Boolean(enabled);
    return settings;
  });
}

function loadPrintDayLabelBlindMode() {
  try {
    return localStorage.getItem(PRINT_DAY_LABEL_BLIND_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function savePrintDayLabelBlindMode(enabled) {
  try {
    localStorage.setItem(PRINT_DAY_LABEL_BLIND_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // 무시
  }
}

function renderDaySlotBlindButton() {
  if (!elements.dayBlindButton) return;

  const enabled = loadPrintDayLabelBlindMode();
  elements.dayBlindButton.setAttribute("aria-pressed", String(enabled));
  elements.dayBlindButton.classList.toggle("active", enabled);
  elements.dayBlindButton.title = enabled ? "인쇄 일차 표시" : "인쇄 일차 블라인드";
  elements.dayBlindButton.setAttribute("aria-label", enabled ? "인쇄 일차 표시" : "인쇄 일차 블라인드");
}

async function setAllBoardsToTwoDaySlots() {
  if (!isAdminMode) return;

  const ok = window.confirm(
    "현재 사진대지를 1·2일차만 보이도록 변경합니다.\n\n3일차 이후 사진은 삭제하지 않고 블라인드 처리합니다."
  );
  if (!ok) return;

  const saved = await updateBoardSettings((settings) => {
    settings.daySlots = Array.from({ length: TWO_DAY_SLOT_COUNT }, (_, index) => index + 1);
    settings.extraDaySlotsHidden = true;
    return settings;
  });
  if (!saved) return;
  pasteTargetDay = null;
  renderAll();
  showToast("현재 사진대지를 2일차 기준으로 표시합니다.");
}

function toggleDaySlotBlindMode() {
  if (!isAdminMode) return;

  const enabled = !loadPrintDayLabelBlindMode();
  savePrintDayLabelBlindMode(enabled);
  printImageCache = { signature: "", images: [] };
  renderAll();
  showToast(enabled ? "인쇄 표의 일차 문구를 가렸습니다." : "인쇄 표의 일차 문구를 표시합니다.");
}

function getEntryItems(entries) {
  if (Array.isArray(entries)) {
    return entries.map((entry, index) => ({
      entry,
      dayNo: getEntryDayNo(entry, index + 1),
    }));
  }

  return Object.entries(entries || {}).map(([key, entry]) => ({
    entry,
    dayNo: getEntryDayNo(entry, key),
  }));
}

function getEntryDayNo(entry, fallback) {
  const dayNo = Number(entry?.dayNo ?? entry?.day_no ?? fallback);
  return Number.isInteger(dayNo) && dayNo >= 1 ? dayNo : 0;
}

function hasDaySlotData(entry) {
  return (
    hasEntryPhoto(entry, PHOTO_TYPES.CURING) ||
    isBoardRainHoldEntry(entry)
  );
}

function hasTemperatureSlotData(entry) {
  return hasEntryPhoto(entry, PHOTO_TYPES.TEMPERATURE);
}

// 실제 표시 일차 = 설정된 슬롯 ∪ 이미 사진/데이터가 있는 일차(블라인드가 꺼져 있을 때만 하위 호환 표시).
function getDaySlotList(entries = state.entries, settings = state.settings) {
  const set = new Set(getStoredDaySlotList(settings));
  if (!loadExtraDaySlotHiddenMode(settings)) {
    getEntryItems(entries).forEach(({ entry, dayNo }) => {
      if (!dayNo || !entry || !hasDaySlotData(entry)) return;
      set.add(dayNo);
    });
  }
  return Array.from(set).sort((a, b) => a - b);
}

function getTemperatureSlotList(entries = state.entries, settings = state.settings) {
  const set = new Set(getStoredTemperatureSlotList(settings));
  getEntryItems(entries).forEach(({ entry, dayNo }) => {
    if (!dayNo || !entry || !hasTemperatureSlotData(entry)) return;
    set.add(dayNo);
  });
  return Array.from(set).sort((a, b) => a - b);
}

function getPhotoSlotList(photoType = activePhotoType, entries = state.entries, settings = state.settings) {
  const normalizedType = normalizePhotoType(photoType);
  return normalizedType === PHOTO_TYPES.TEMPERATURE
    ? getTemperatureSlotList(entries, settings)
    : getDaySlotList(entries, settings);
}

function getDaySlotCount(entries = state.entries, settings = state.settings) {
  return getDaySlotList(entries, settings).length;
}

async function addDaySlot() {
  const list = getStoredDaySlotList();
  const displayed = getDaySlotList();
  if (displayed.length >= MAX_DAY_SLOT_COUNT) {
    showToast(`일차는 최대 ${MAX_DAY_SLOT_COUNT}개까지 추가할 수 있습니다.`);
    return;
  }
  const nextDay = (displayed[displayed.length - 1] || 0) + 1;
  list.push(nextDay);
  const saved = await saveDaySlotList(list);
  if (!saved) return;
  showToast(`${getPhotoSlotLabel(nextDay, PHOTO_TYPES.CURING)}을(를) 추가했습니다.`);
}

async function addTemperatureSlot() {
  const list = getStoredTemperatureSlotList();
  const displayed = getTemperatureSlotList();
  if (displayed.length >= MAX_TEMPERATURE_SLOT_COUNT) {
    showToast(`측정 칸은 최대 ${MAX_TEMPERATURE_SLOT_COUNT}개까지 추가할 수 있습니다.`);
    return;
  }
  const nextSlot = (displayed[displayed.length - 1] || 0) + 1;
  list.push(nextSlot);
  const saved = await saveTemperatureSlotList(list);
  if (!saved) return;
  showToast(`${getPhotoSlotLabel(nextSlot, PHOTO_TYPES.TEMPERATURE)}을(를) 추가했습니다.`);
}

async function addPhotoSlot(photoType = activePhotoType) {
  if (normalizePhotoType(photoType) === PHOTO_TYPES.TEMPERATURE) {
    await addTemperatureSlot();
    return;
  }
  await addDaySlot();
}

async function removeDaySlot(day) {
  const dayNo = Number(day);
  if (!Number.isInteger(dayNo) || dayNo < 1) return;
  if (getDaySlotList().length <= 1) {
    showToast("최소 1개의 일차는 남겨야 합니다.");
    return;
  }

  const entry = state.entries[dayNo];
  const photoCount = entry && hasEntryPhoto(entry, PHOTO_TYPES.CURING) ? 1 : 0;
  const hadRainHold = entry && isRainHoldEntry(entry);
  const label = getPhotoSlotLabel(dayNo, PHOTO_TYPES.CURING);

  const confirmed = await confirmDangerousAction({
    title: `${label} 삭제`,
    message:
      photoCount > 0
        ? `${label}에 등록된 습윤양생 사진 ${photoCount}장이 함께 삭제됩니다. 되돌릴 수 없습니다.`
        : `${label} 칸을 삭제합니다.`,
    confirmLabel: "삭제",
    countdownSeconds: photoCount > 0 ? 3 : 0,
  });
  if (!confirmed) return;

  beginPhotoMutation();
  try {
    // 사진이 있으면 먼저 저장소에서 삭제
    if (entry) {
      if (hasEntryPhoto(entry, PHOTO_TYPES.CURING)) {
        const deleted = await deletePhoto(PHOTO_TYPES.CURING, dayNo, { skipConfirm: true });
        if (!deleted) return;
      }
      if (hadRainHold && !hasEntryPhoto(entry, PHOTO_TYPES.CURING)) {
        const cleared = await persistEntry(dayNo, PHOTO_TYPES.CURING, { rainHold: false });
        if (!cleared) {
          showToast(`${label} 우천 설정을 지우지 못해 일차 삭제를 중단했습니다.`);
          return;
        }
      }
    }

    const remaining = getStoredDaySlotList().filter((value) => value !== dayNo);
    const saved = await saveDaySlotList(remaining);
    if (!saved) return;
    showToast(`${label}을(를) 삭제했습니다.`);
  } finally {
    await endPhotoMutation();
  }
}

async function removeTemperatureSlot(slot) {
  const slotNo = Number(slot);
  if (!Number.isInteger(slotNo) || slotNo < 1) return;
  if (getTemperatureSlotList().length <= 1) {
    showToast("최소 1개의 측정 칸은 남겨야 합니다.");
    return;
  }

  const entry = state.entries[slotNo];
  const hasPhoto = entry && hasEntryPhoto(entry, PHOTO_TYPES.TEMPERATURE);
  const label = getPhotoSlotLabel(slotNo, PHOTO_TYPES.TEMPERATURE);

  const confirmed = await confirmDangerousAction({
    title: `${label} 삭제`,
    message: hasPhoto
      ? `${label}에 등록된 온도측정 사진이 함께 삭제됩니다. 되돌릴 수 없습니다.`
      : `${label} 칸을 삭제합니다.`,
    confirmLabel: "삭제",
    countdownSeconds: hasPhoto ? 3 : 0,
  });
  if (!confirmed) return;

  beginPhotoMutation();
  try {
    if (entry && hasPhoto) {
      const deleted = await deletePhoto(PHOTO_TYPES.TEMPERATURE, slotNo, { skipConfirm: true });
      if (!deleted) return;
    }

    const remaining = getStoredTemperatureSlotList().filter((value) => value !== slotNo);
    const saved = await saveTemperatureSlotList(remaining);
    if (!saved) return;
    showToast(`${label}을(를) 삭제했습니다.`);
  } finally {
    await endPhotoMutation();
  }
}

async function removePhotoSlot(photoType, slot) {
  if (normalizePhotoType(photoType) === PHOTO_TYPES.TEMPERATURE) {
    await removeTemperatureSlot(slot);
    return;
  }
  await removeDaySlot(slot);
}

async function renameDaySlot(day) {
  const dayNo = Number(day);
  if (!Number.isInteger(dayNo) || dayNo < 1) return;
  const labels = loadDaySlotLabels();
  const current = typeof labels[dayNo] === "string" ? labels[dayNo] : "";
  const input = window.prompt(
    `${dayNo}번째 칸의 이름을 입력하세요. (비우면 "${dayNo}일차"로 표시)`,
    current
  );
  if (input === null) return; // 취소
  const trimmed = input.trim();
  if (trimmed) {
    labels[dayNo] = trimmed;
  } else {
    delete labels[dayNo];
  }
  const saved = await saveDaySlotLabels(labels);
  if (!saved) return;
  showToast("일차 이름을 변경했습니다.");
}

function loadDaySlotLabels(settings = state.settings) {
  return normalizeBoardSettings(settings).dayLabels;
}

function saveDaySlotLabels(map) {
  return updateBoardSettings((settings) => {
    settings.dayLabels = cleanDaySlotLabels(map);
    return settings;
  });
}

function getDaySlotCustomLabel(day, settings = state.settings) {
  const value = loadDaySlotLabels(settings)[Number(day)];
  return typeof value === "string" ? value.trim() : "";
}

// ===== 위험 작업 확인 다이얼로그(사진 개수 표시 + 카운트다운) =====
function confirmDangerousAction({ title, message, confirmLabel = "삭제", countdownSeconds = 0 } = {}) {
  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const dialogId = `confirm-dialog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="${dialogId}-title" aria-describedby="${dialogId}-message">
        <h3 id="${dialogId}-title" class="confirm-title"></h3>
        <p id="${dialogId}-message" class="confirm-message"></p>
        <div class="confirm-actions">
          <button type="button" class="small-button confirm-cancel">취소</button>
          <button type="button" class="small-button danger-button confirm-ok"></button>
        </div>
      </div>
    `;
    overlay.querySelector(".confirm-title").textContent = title || "확인";
    overlay.querySelector(".confirm-message").textContent = message || "";
    const okButton = overlay.querySelector(".confirm-ok");
    const cancelButton = overlay.querySelector(".confirm-cancel");

    let remaining = Math.max(0, Math.round(countdownSeconds));
    let timer = 0;

    const updateOkLabel = () => {
      if (remaining > 0) {
        okButton.disabled = true;
        okButton.textContent = `${confirmLabel} (${remaining})`;
      } else {
        okButton.disabled = false;
        okButton.textContent = confirmLabel;
      }
    };

    const cleanup = (result) => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener("keydown", onKeydown, true);
      overlay.remove();
      if (previousFocus?.isConnected && typeof previousFocus.focus === "function") previousFocus.focus();
      resolve(result);
    };

    const onKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cleanup(false);
      } else if (event.key === "Tab") {
        trapDialogFocus(overlay, event);
      }
    };

    okButton.addEventListener("click", () => cleanup(true));
    cancelButton.addEventListener("click", () => cleanup(false));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) cleanup(false);
    });
    document.addEventListener("keydown", onKeydown, true);

    updateOkLabel();
    if (remaining > 0) {
      timer = window.setInterval(() => {
        remaining -= 1;
        updateOkLabel();
        if (remaining <= 0) window.clearInterval(timer);
      }, 1000);
    }

    document.body.appendChild(overlay);
    cancelButton.focus();
  });
}

function normalizeEntryShape(entry) {
  if (!entry.photos || typeof entry.photos !== "object") {
    entry.photos = {};
  }

  if (!entry.dayNo && entry.day_no) {
    entry.dayNo = entry.day_no;
  }

  const memo = parseEntryMemo(entry.memo);
  if (memo.rainHold && entry.rainHold === undefined) {
    entry.rainHold = true;
  }

  const memoCuringPhoto = memo.photos?.[PHOTO_TYPES.CURING];
  if (memoCuringPhoto) {
    if (!entry.verifiedAt) {
      entry.verifiedAt = memoCuringPhoto.verifiedAt || memoCuringPhoto.verified_at || "";
    }
    if (!entry.capturedAt) {
      entry.capturedAt = memoCuringPhoto.capturedAt || memoCuringPhoto.captured_at || "";
    }
    if (!entry.capturedAtSource) {
      entry.capturedAtSource = memoCuringPhoto.capturedAtSource || memoCuringPhoto.captured_at_source || "";
    }
    if (!entry.verifiedAtSource) {
      entry.verifiedAtSource = memoCuringPhoto.verifiedAtSource || memoCuringPhoto.verified_at_source || "";
    }
    if (!entry.sizeBytes && memoCuringPhoto.sizeBytes) {
      entry.sizeBytes = Number(memoCuringPhoto.sizeBytes || 0);
    }
  }

  if (memo.photos?.[PHOTO_TYPES.TEMPERATURE] && !entry.photos[PHOTO_TYPES.TEMPERATURE]) {
    entry.photos[PHOTO_TYPES.TEMPERATURE] = memo.photos[PHOTO_TYPES.TEMPERATURE];
  }

  return entry;
}

function normalizeEntries(entries) {
  Object.values(entries || {}).forEach(normalizeEntryShape);
  return entries || {};
}

function isRainHoldEntry(entry) {
  return entry?.rainHold === true || entry?.rainHold === "true";
}

function getTypedPhoto(entry, photoType = activePhotoType) {
  const normalizedType = normalizePhotoType(photoType);
  const source = normalizeEntryShape(entry || {});

  if (normalizedType === PHOTO_TYPES.CURING) {
    return {
      photoUrl: source.photoUrl || source.photo_url || "",
      photoPath: source.photoPath || source.photo_path || "",
      uploadedAt: source.uploadedAt || source.uploaded_at || "",
      verifiedAt: source.verifiedAt || source.verified_at || "",
      verifiedAtSource: source.verifiedAtSource || source.verified_at_source || "",
      capturedAt: source.capturedAt || source.captured_at || "",
      capturedAtSource: source.capturedAtSource || source.captured_at_source || "",
      sizeBytes: Number(source.sizeBytes || 0),
    };
  }

  const typed = source.photos?.[normalizedType] || {};
  return {
    photoUrl: typed.photoUrl || typed.photo_url || "",
    photoPath: typed.photoPath || typed.photo_path || "",
    uploadedAt: typed.uploadedAt || typed.uploaded_at || "",
    verifiedAt: typed.verifiedAt || typed.verified_at || "",
    verifiedAtSource: typed.verifiedAtSource || typed.verified_at_source || "",
    capturedAt: typed.capturedAt || typed.captured_at || "",
    capturedAtSource: typed.capturedAtSource || typed.captured_at_source || "",
    sizeBytes: Number(typed.sizeBytes || 0),
  };
}

function setTypedPhoto(entry, photoType, photo) {
  const normalizedType = normalizePhotoType(photoType);
  normalizeEntryShape(entry);

  if (normalizedType === PHOTO_TYPES.CURING) {
    entry.photoUrl = photo.photoUrl || "";
    entry.photoPath = photo.photoPath || "";
    entry.uploadedAt = photo.uploadedAt || "";
    entry.verifiedAt = photo.verifiedAt || "";
    entry.verifiedAtSource = photo.verifiedAtSource || "";
    entry.capturedAt = photo.capturedAt || "";
    entry.capturedAtSource = photo.capturedAtSource || "";
    entry.sizeBytes = Number(photo.sizeBytes || 0);
    delete entry.photos[PHOTO_TYPES.CURING];
    return;
  }

  entry.photos[normalizedType] = {
    photoUrl: photo.photoUrl || "",
    photoPath: photo.photoPath || "",
    uploadedAt: photo.uploadedAt || "",
    verifiedAt: photo.verifiedAt || "",
    verifiedAtSource: photo.verifiedAtSource || "",
    capturedAt: photo.capturedAt || "",
    capturedAtSource: photo.capturedAtSource || "",
    sizeBytes: Number(photo.sizeBytes || 0),
  };
}

function clearTypedPhoto(entry, photoType) {
  setTypedPhoto(entry, photoType, {
    photoUrl: "",
    photoPath: "",
    uploadedAt: "",
    verifiedAt: "",
    verifiedAtSource: "",
    capturedAt: "",
    capturedAtSource: "",
    sizeBytes: 0,
  });
}

function hasEntryPhoto(entry, photoType = PHOTO_TYPES.CURING) {
  return Boolean(getTypedPhoto(entry, photoType).photoUrl);
}

function isCompletedEntry(entry, photoType = PHOTO_TYPES.CURING, context = {}) {
  const normalizedType = normalizePhotoType(photoType);
  if (normalizedType !== PHOTO_TYPES.CURING) return hasEntryPhoto(entry, normalizedType);
  if (!isPourDayDue(context.pourDate, context.dayNo)) return false;
  if (hasEntryPhoto(entry, PHOTO_TYPES.CURING)) return true;
  if (!isBoardRainHoldEntry(entry)) return false;
  return getRainAuditStatus(context.pourDate, context.dayNo) === "confirmed";
}

function countCompletedEntries(entries, photoType = PHOTO_TYPES.CURING, visibleDaySet = null, context = {}) {
  return getEntryItems(entries).filter(({ entry, dayNo }) => {
    if (visibleDaySet && !visibleDaySet.has(dayNo)) return false;
    return isCompletedEntry(entry, photoType, { ...context, dayNo });
  }).length;
}

function getEntryCompletionDisplay(entry, photoType, dayNo, pourDate = state.pourDate) {
  const normalizedType = normalizePhotoType(photoType);
  const hasPhoto = hasEntryPhoto(entry, normalizedType);
  if (normalizedType !== PHOTO_TYPES.CURING) {
    return { complete: hasPhoto, statusText: hasPhoto ? "등록" : "미등록" };
  }

  const due = isPourDayDue(pourDate, dayNo);
  if (hasPhoto) {
    return {
      complete: due,
      statusText: due ? "등록" : "사전등록·미집계",
    };
  }

  if (!isBoardRainHoldEntry(entry)) return { complete: false, statusText: "미등록" };
  const rainStatus = getRainAuditStatus(pourDate, dayNo);
  if (rainStatus === "confirmed") return { complete: true, statusText: "우천확인" };
  if (rainStatus === "future") return { complete: false, statusText: "우천예정·미집계" };
  if (rainStatus === "mismatch") return { complete: false, statusText: "우천 현장확인" };
  if (rainStatus === "no-data") return { complete: false, statusText: "우천 자료없음" };
  return { complete: false, statusText: "우천 확인중" };
}

function countPhotoEntries(entries, visibleDaySet = null) {
  return getEntryItems(entries).reduce((count, { entry, dayNo }) => {
    if (visibleDaySet && !visibleDaySet.has(dayNo)) return count;
    return count + Object.values(PHOTO_TYPES).filter((photoType) => hasEntryPhoto(entry, photoType)).length;
  }, 0);
}

function getEmptyPhotoText(day, photoType = activePhotoType) {
  if (normalizePhotoType(photoType) === PHOTO_TYPES.CURING && isRainHoldEntry(getEntry(day))) {
    return RAIN_HOLD_TEXT;
  }

  return getPhotoTypeConfig(photoType).missingText;
}

function getPrintMissingPhotoText(day, photoType = activePhotoType) {
  return getEmptyPhotoText(day, photoType);
}

function parseEntryMemo(memo) {
  if (!memo) return { rainHold: false, photos: {} };
  if (typeof memo === "object") {
    return normalizeEntryMemo(memo);
  }

  try {
    const parsed = JSON.parse(memo);
    return normalizeEntryMemo(parsed);
  } catch {
    return { rainHold: false, photos: {} };
  }
}

function serializeEntryMemo(entry) {
  const photos = {
    ...(entry?.photos || {}),
  };
  const curingMeta = {
    verifiedAt: entry?.verifiedAt || entry?.verified_at || "",
    verifiedAtSource: entry?.verifiedAtSource || entry?.verified_at_source || "",
    capturedAt: entry?.capturedAt || entry?.captured_at || "",
    capturedAtSource: entry?.capturedAtSource || entry?.captured_at_source || "",
    sizeBytes: Number(entry?.sizeBytes || 0),
  };
  if (curingMeta.verifiedAt || curingMeta.verifiedAtSource || curingMeta.capturedAt || curingMeta.capturedAtSource || curingMeta.sizeBytes) {
    photos[PHOTO_TYPES.CURING] = {
      ...(photos[PHOTO_TYPES.CURING] || {}),
      ...curingMeta,
    };
  }

  const memo = normalizeEntryMemo({
    rainHold: isRainHoldEntry(entry),
    photos,
  });
  const hasPhotos = Object.values(memo.photos || {}).some(hasPhotoMemoData);
  if (!memo.rainHold && !hasPhotos) return "";
  return JSON.stringify(memo);
}

function normalizeEntryMemo(memo) {
  const normalized = {
    rainHold: memo?.rainHold === true || memo?.rainHold === "true",
    photos: {},
  };

  const curing = normalizePhotoMemo(
    memo?.photos?.[PHOTO_TYPES.CURING] || memo?.curing || memo?.curingPhoto || {},
    {
      photoUrl: memo?.photoUrl || memo?.photo_url || "",
      photoPath: memo?.photoPath || memo?.photo_path || "",
      uploadedAt: memo?.uploadedAt || memo?.uploaded_at || "",
      verifiedAt: memo?.verifiedAt || memo?.verified_at || "",
      verifiedAtSource: memo?.verifiedAtSource || memo?.verified_at_source || "",
      capturedAt: memo?.capturedAt || memo?.captured_at || memo?.takenAt || memo?.taken_at || "",
      capturedAtSource: memo?.capturedAtSource || memo?.captured_at_source || "",
      sizeBytes: memo?.sizeBytes || memo?.size_bytes || 0,
    }
  );
  if (hasPhotoMemoData(curing)) {
    normalized.photos[PHOTO_TYPES.CURING] = curing;
  }

  const temperature = memo?.photos?.[PHOTO_TYPES.TEMPERATURE] || memo?.temperature || memo?.temperaturePhoto || {};
  const normalizedTemperature = normalizePhotoMemo(temperature, {
    photoUrl: memo?.temperaturePhotoUrl || "",
    photoPath: memo?.temperaturePhotoPath || "",
    uploadedAt: memo?.temperatureUploadedAt || "",
    verifiedAt: memo?.temperatureVerifiedAt || "",
    verifiedAtSource: memo?.temperatureVerifiedAtSource || "",
    capturedAt: memo?.temperatureCapturedAt || memo?.temperatureTakenAt || "",
    capturedAtSource: memo?.temperatureCapturedAtSource || "",
    sizeBytes: memo?.temperatureSizeBytes || 0,
  });

  if (hasPhotoMemoData(normalizedTemperature)) {
    normalized.photos[PHOTO_TYPES.TEMPERATURE] = normalizedTemperature;
  }

  return normalized;
}

function normalizePhotoMemo(photo, fallback = {}) {
  const source = photo || {};
  return {
    photoUrl: source.photoUrl || source.photo_url || fallback.photoUrl || "",
    photoPath: source.photoPath || source.photo_path || fallback.photoPath || "",
    uploadedAt: source.uploadedAt || source.uploaded_at || fallback.uploadedAt || "",
    verifiedAt: source.verifiedAt || source.verified_at || fallback.verifiedAt || "",
    verifiedAtSource: source.verifiedAtSource || source.verified_at_source || fallback.verifiedAtSource || "",
    capturedAt: source.capturedAt || source.captured_at || source.takenAt || source.taken_at || fallback.capturedAt || "",
    capturedAtSource: source.capturedAtSource || source.captured_at_source || fallback.capturedAtSource || "",
    sizeBytes: Number(source.sizeBytes || source.size_bytes || fallback.sizeBytes || 0),
  };
}

function hasPhotoMemoData(photo) {
  return Boolean(
    photo?.photoUrl ||
    photo?.photoPath ||
    photo?.uploadedAt ||
    photo?.verifiedAt ||
    photo?.verifiedAtSource ||
    photo?.capturedAt ||
    photo?.capturedAtSource ||
    Number(photo?.sizeBytes || 0)
  );
}

function renderAll() {
  renderPhotoTypeControls();
  renderDaySlotBlindButton();
  renderBoardListExpandButton();
  renderWeatherAuditPanel();
  renderBoardList();
  renderSummary();
  if (!isFilePickerOpen) {
    renderDayGrid();
  }
  renderPrintArea();
  renderStorageMeter();
}

function renderMetaPreview() {
  renderPhotoTypeControls();
  renderDaySlotBlindButton();
  renderBoardListExpandButton();
  renderWeatherAuditPanel();
  renderSummary();
  if (!isFilePickerOpen) {
    renderDayGrid();
  }
  renderPrintArea();
}

function beginFilePick() {
  window.clearTimeout(filePickerClearTimer);
  isFilePickerOpen = true;
  filePickerClearTimer = window.setTimeout(() => {
    isFilePickerOpen = false;
    flushPendingRealtimeRefresh();
  }, 120000);
}

function endFilePickSoon() {
  window.clearTimeout(filePickerClearTimer);
  filePickerClearTimer = window.setTimeout(() => {
    isFilePickerOpen = false;
    flushPendingRealtimeRefresh();
  }, 800);
}

function endFilePickNow() {
  window.clearTimeout(filePickerClearTimer);
  isFilePickerOpen = false;
}

function beginPhotoMutation() {
  activePhotoMutationCount += 1;
}

async function endPhotoMutation() {
  activePhotoMutationCount = Math.max(0, activePhotoMutationCount - 1);
  await flushPendingRealtimeRefresh();
}

function shouldDeferRealtimeRefresh() {
  return isFilePickerOpen || activePhotoMutationCount > 0 || isMetaSaveInProgress || boardSettingsSaveCount > 0;
}

async function flushPendingRealtimeRefresh() {
  if (!pendingRealtimeRefresh || shouldDeferRealtimeRefresh() || !dbClient) return;
  pendingRealtimeRefresh = false;

  try {
    const inputFocused = isMetaInputFocused();
    await loadCloudBoard({ syncInputs: !inputFocused });
    await loadCloudEntries();
    await loadBoardList();
    if (inputFocused) {
      renderMetaPreview();
    } else {
      renderAll();
    }
    renderStorageMeter();
  } catch (error) {
    console.error(error);
    pendingRealtimeRefresh = true;
  }
}

function getBoardCuringProgress(board) {
  const entries = board?.entries || {};
  const daySlots = getDaySlotList(entries, board?.settings);
  const visibleDaySet = new Set(daySlots);
  const total = Math.max(daySlots.length, 1);
  const completed = countCompletedEntries(entries, PHOTO_TYPES.CURING, visibleDaySet, {
    pourDate: board?.pourDate || "",
  });
  return {
    completed,
    total,
    complete: completed >= total,
  };
}

function getBoardResultStats(boards) {
  const list = boards || [];
  return {
    total: list.length,
    completed: list.filter((board) => getBoardCuringProgress(board).complete).length,
  };
}

function renderBoardList() {
  cancelScheduledBoardListRender();
  renderBoardListExpandButton();

  const visibleBoards = getVisibleBoardList();
  renderBoardResultControls(visibleBoards);
  if (!visibleBoards.length) {
    elements.boardList.innerHTML = `
      <div class="empty-list">
        ${escapeHtml(getEmptyBoardListText())}
      </div>
    `;
    return;
  }

  elements.boardList.innerHTML = visibleBoards
    .map((board) => {
      const active = board.shareCode === state.shareCode;
      const progress = getBoardCuringProgress(board);
      const boardTemperatureSlots = getTemperatureSlotList(board.entries || {}, board.settings);
      const visibleTemperatureSet = new Set(boardTemperatureSlots);
      const temperatureCount = countCompletedEntries(board.entries || {}, PHOTO_TYPES.TEMPERATURE, visibleTemperatureSet);
      const rainAudit = getRainAuditStats([board]);
      return `
        <div class="board-list-item ${active ? "active" : ""} ${progress.complete ? "" : "incomplete"}">
          <button class="board-open-button" type="button" data-board-code="${escapeAttribute(board.shareCode)}" aria-current="${active ? "true" : "false"}" aria-label="${escapeAttribute(`${formatListDate(board.pourDate)} ${board.pourPart} 사진대지 열기`)}">
            <span class="board-date">${escapeHtml(formatListDate(board.pourDate))}</span>
            <span class="board-part">${escapeHtml(board.pourPart)}</span>
            <span class="board-counts">
              <span class="board-count ${progress.complete ? "complete" : ""}">${progress.completed}/${progress.total} 양생</span>
              ${
                temperatureCount > 0
                  ? `<span class="board-count temperature">${temperatureCount}장 측정</span>`
                  : ""
              }
              ${
                isAdminMode && rainAudit.mismatch > 0
                  ? `<span class="board-count weather-mismatch">우천 ${rainAudit.mismatch}건 확인</span>`
                  : ""
              }
            </span>
          </button>
          ${
            isAdminMode
              ? `<button class="board-list-delete-button admin-only" type="button" data-delete-board-code="${escapeAttribute(board.shareCode)}" title="사진대지 삭제" aria-label="${escapeAttribute(board.pourPart)} 사진대지 삭제">×</button>`
              : ""
          }
        </div>
      `;
    })
    .join("");
}

function toggleBoardListExpanded() {
  if (!elements.boardListSection) return;

  const expanded = !elements.boardListSection.classList.contains("board-list-expanded");
  elements.boardListSection.classList.toggle("board-list-expanded", expanded);
  renderBoardListExpandButton();
}

function renderBoardListExpandButton() {
  if (!elements.boardListExpandButton || !elements.boardListSection) return;

  const expanded = elements.boardListSection.classList.contains("board-list-expanded");
  elements.boardListExpandButton.setAttribute("aria-expanded", String(expanded));
  elements.boardListExpandButton.setAttribute("aria-label", expanded ? "사진대지 목록 접기" : "사진대지 목록 펼치기");
  elements.boardListExpandButton.title = expanded ? "사진대지 목록 접기" : "사진대지 목록 펼치기";

  const icon = elements.boardListExpandButton.querySelector(".button-icon");
  if (icon) icon.textContent = expanded ? "▴" : "▾";
}

function getVisibleBoardList() {
  const searchedBoards = getBoardSearchFilteredList();
  const selection = getActiveBoardResultSelection();
  const selectedBoards = selection
    ? searchedBoards.filter((board) => getBoardResultGroupKey(board, selection.mode) === selection.key)
    : searchedBoards;

  if (!isAdminMode || !weatherMismatchFilterActive) return selectedBoards;
  return selectedBoards.filter((board) => getRainAuditStats([board]).mismatch > 0);
}

function getBoardSearchFilteredList(sourceBoards = boardList) {
  const query = normalizeSearchText(boardSearchQuery);
  if (!query) return sourceBoards;

  return sourceBoards.filter((board) => (board.searchText || normalizeSearchText(board.pourPart)).includes(query));
}

function renderBoardResultControls(visibleBoards = getVisibleBoardList()) {
  const mode = normalizeBoardResultViewMode(boardResultViewMode);
  const searchedBoards = getBoardSearchFilteredList();
  const groups = getBoardResultGroups(mode, searchedBoards);

  renderBoardResultToggleButton();

  if (elements.boardResultFilter) {
    elements.boardResultFilter.hidden = !isBoardResultPanelOpen;
  }

  elements.boardResultViewButtons?.forEach((button) => {
    const active = normalizeBoardResultViewMode(button.dataset.boardResultView) === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (elements.boardResultCount) {
    elements.boardResultCount.textContent = getBoardResultCountText(visibleBoards);
  }
  renderBoardResultSummary(groups);
}

function renderBoardResultToggleButton() {
  if (!elements.boardResultToggleButton) return;

  elements.boardResultToggleButton.setAttribute("aria-expanded", String(isBoardResultPanelOpen));
  elements.boardResultToggleButton.setAttribute("aria-label", isBoardResultPanelOpen ? "사진대지 결과 닫기" : "사진대지 결과 보기");
  elements.boardResultToggleButton.title = isBoardResultPanelOpen ? "사진대지 결과 닫기" : "사진대지 결과 보기";
  elements.boardResultToggleButton.classList.toggle("active", isBoardResultPanelOpen);
}

function renderBoardResultSummary(groups) {
  if (!elements.boardResultSummary) return;

  if (!isBoardResultPanelOpen) {
    elements.boardResultSummary.innerHTML = "";
    return;
  }

  if (!groups.length) {
    elements.boardResultSummary.innerHTML = `<div class="board-result-empty">${escapeHtml(getEmptyBoardListText())}</div>`;
    return;
  }

  const activeSelection = getActiveBoardResultSelection();
  const mode = normalizeBoardResultViewMode(boardResultViewMode);
  elements.boardResultSummary.innerHTML = `
    <div class="board-result-summary-grid">
      ${groups
        .map((group) => {
          const active = activeSelection?.mode === mode && activeSelection?.key === group.key;
          return `
            <div class="board-result-cell ${active ? "active" : ""}">
              <span class="board-result-label" title="${escapeAttribute(group.title)}">${escapeHtml(group.label)}</span>
              <button class="board-result-count-button" type="button" data-board-result-group-key="${escapeAttribute(group.key)}" title="${escapeAttribute(formatBoardResultStatsTitle(group.title, group.stats))}">
                <span>전체 ${group.stats.total}</span>
                <span class="board-result-count-divider" aria-hidden="true">/</span>
                <span>완료 ${group.stats.completed}</span>
              </button>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function handleBoardResultFilterClick(event) {
  const groupButton = event.target.closest("[data-board-result-group-key]");
  if (groupButton) {
    handleBoardResultGroupClick(groupButton.dataset.boardResultGroupKey);
    return;
  }

  const button = event.target.closest("[data-board-result-view]");
  if (!button) return;

  setBoardResultViewMode(button.dataset.boardResultView);
}

function toggleBoardResultPanel() {
  isBoardResultPanelOpen = !isBoardResultPanelOpen;
  if (!isBoardResultPanelOpen) {
    boardResultSelectedGroup = null;
  }
  saveBoardResultPanelOpen();
  renderBoardList();
}

function setBoardResultViewMode(mode) {
  const nextMode = normalizeBoardResultViewMode(mode);
  if (nextMode === boardResultViewMode) return;

  boardResultViewMode = nextMode;
  boardResultSelectedGroup = null;
  saveBoardResultPreference(BOARD_RESULT_VIEW_STORAGE_KEY, boardResultViewMode);
  renderBoardList();
}

function handleBoardResultGroupClick(groupKey) {
  const mode = normalizeBoardResultViewMode(boardResultViewMode);
  const group = getBoardResultGroups(mode, getBoardSearchFilteredList()).find((item) => item.key === groupKey);
  if (!group || !group.boards.length) return;

  if (group.boards.length === 1) {
    openBoard(group.boards[0].shareCode).catch(console.error);
    return;
  }

  boardResultSelectedGroup = { mode, key: group.key };
  renderBoardList();
  elements.boardList?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  showToast(`${formatBoardResultStatsTitle(group.title, group.stats)}을 목록에 표시했습니다.`);
}

function getActiveBoardResultSelection() {
  if (!isBoardResultPanelOpen || !boardResultSelectedGroup) return null;

  const mode = normalizeBoardResultViewMode(boardResultViewMode);
  if (boardResultSelectedGroup.mode !== mode) return null;
  return boardResultSelectedGroup;
}

function getBoardResultGroups(mode = boardResultViewMode, sourceBoards = getBoardSearchFilteredList()) {
  const normalizedMode = normalizeBoardResultViewMode(mode);
  if (normalizedMode === BOARD_RESULT_VIEWS.ALL) {
    return [
      {
        key: BOARD_RESULT_VIEWS.ALL,
        label: "전체",
        title: "전체",
        boards: sourceBoards,
        stats: getBoardResultStats(sourceBoards),
      },
    ].filter((group) => group.boards.length);
  }

  const groupMap = new Map();
  sourceBoards.forEach((board) => {
    const key = getBoardResultGroupKey(board, normalizedMode);
    if (!key) return;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        label: getBoardResultGroupLabel(normalizedMode, key),
        title: getBoardResultGroupTitle(normalizedMode, key),
        boards: [],
        stats: { total: 0, completed: 0 },
      });
    }
    groupMap.get(key).boards.push(board);
  });

  return Array.from(groupMap.values())
    .map((group) => ({
      ...group,
      stats: getBoardResultStats(group.boards),
    }))
    .sort((a, b) => b.key.localeCompare(a.key));
}

function getBoardResultGroupKey(board, mode = boardResultViewMode) {
  const normalizedMode = normalizeBoardResultViewMode(mode);
  if (normalizedMode === BOARD_RESULT_VIEWS.ALL) return BOARD_RESULT_VIEWS.ALL;
  if (normalizedMode === BOARD_RESULT_VIEWS.MONTH) return getBoardDateMonth(board.pourDate);
  if (normalizedMode === BOARD_RESULT_VIEWS.DAY) return normalizeBoardResultDay(board.pourDate);
  return "";
}

function getBoardDateMonth(dateValue) {
  const day = normalizeBoardResultDay(dateValue);
  return day ? day.slice(0, 7) : "";
}

function getBoardResultCountText(visibleBoards = getVisibleBoardList()) {
  return formatBoardResultStatsTitle(getBoardResultScopeLabel(), getBoardResultStats(visibleBoards));
}

function getBoardResultScopeLabel() {
  const mode = normalizeBoardResultViewMode(boardResultViewMode);
  const selection = getActiveBoardResultSelection();
  if (selection) return getBoardResultGroupTitle(mode, selection.key);
  if (mode === BOARD_RESULT_VIEWS.MONTH) return "월별";
  if (mode === BOARD_RESULT_VIEWS.DAY) return "일자별";
  return "전체";
}

function getEmptyBoardListText() {
  if (isAdminMode && weatherMismatchFilterActive) return "기상청 0mm 불일치 대지가 없습니다.";
  if (normalizeSearchText(boardSearchQuery)) return "검색 결과가 없습니다.";
  if (getActiveBoardResultSelection()) return `${getBoardResultScopeLabel()} 결과가 없습니다.`;
  return "등록된 사진대지가 없습니다.";
}

function getBoardResultGroupLabel(mode, key) {
  const normalizedMode = normalizeBoardResultViewMode(mode);
  if (normalizedMode === BOARD_RESULT_VIEWS.MONTH) return formatBoardResultMonthShort(key);
  if (normalizedMode === BOARD_RESULT_VIEWS.DAY) return formatBoardResultDayShort(key);
  return "전체";
}

function getBoardResultGroupTitle(mode, key) {
  const normalizedMode = normalizeBoardResultViewMode(mode);
  if (normalizedMode === BOARD_RESULT_VIEWS.MONTH) return formatBoardResultMonth(key);
  if (normalizedMode === BOARD_RESULT_VIEWS.DAY) return formatBoardResultDay(key);
  return "전체";
}

function formatBoardResultStatsTitle(label, stats) {
  const resultStats = stats || { total: 0, completed: 0 };
  if (label === "전체") {
    return `전체 ${resultStats.total}건 / 완료 ${resultStats.completed}건`;
  }
  return `${label} 전체 ${resultStats.total}건 / 완료 ${resultStats.completed}건`;
}

function normalizeBoardResultViewMode(mode) {
  return Object.values(BOARD_RESULT_VIEWS).includes(mode) ? mode : BOARD_RESULT_VIEWS.ALL;
}

function normalizeBoardResultMonth(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}$/.test(text) ? text : "";
}

function normalizeBoardResultDay(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function loadBoardResultPanelOpen() {
  try {
    return localStorage.getItem(BOARD_RESULT_PANEL_OPEN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function loadBoardResultViewMode() {
  try {
    return normalizeBoardResultViewMode(localStorage.getItem(BOARD_RESULT_VIEW_STORAGE_KEY));
  } catch {
    return BOARD_RESULT_VIEWS.ALL;
  }
}

function saveBoardResultPanelOpen() {
  saveBoardResultPreference(BOARD_RESULT_PANEL_OPEN_STORAGE_KEY, isBoardResultPanelOpen ? "1" : "0");
}

function saveBoardResultPreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 개인 보기 설정 저장 실패는 무시합니다.
  }
}

function scheduleBoardListRender() {
  cancelScheduledBoardListRender();
  const schedule = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : (callback) => window.setTimeout(callback, 16);
  boardListRenderFrame = schedule(() => {
    boardListRenderFrame = 0;
    renderBoardList();
  });
}

function cancelScheduledBoardListRender() {
  if (!boardListRenderFrame) return;
  if (window.cancelAnimationFrame) {
    window.cancelAnimationFrame(boardListRenderFrame);
  } else {
    window.clearTimeout(boardListRenderFrame);
  }
  boardListRenderFrame = 0;
}

function toggleBoardSearch() {
  const willOpen = elements.boardSearchBar.hidden;
  elements.boardSearchBar.hidden = !willOpen;
  elements.searchButton.setAttribute("aria-expanded", String(willOpen));

  if (willOpen) {
    elements.boardSearchInput.focus();
    elements.boardSearchInput.select();
    return;
  }

  if (boardSearchQuery) {
    boardSearchQuery = "";
    elements.boardSearchInput.value = "";
    renderBoardList();
  }
  elements.boardSearchInput.blur();
}

function clearBoardSearch() {
  boardSearchQuery = "";
  boardResultSelectedGroup = null;
  elements.boardSearchInput.value = "";
  renderBoardList();
  elements.boardSearchInput.focus();
}

function handleBoardSearchInput() {
  const value = elements.boardSearchInput.value;
  if (applyAdminCode(value)) return;

  boardSearchQuery = value;
  boardResultSelectedGroup = null;
  scheduleBoardListRender();
}

function applyAdminCode(value) {
  // 검색창에 "관리자" 입력 시 관리자 모드 온/오프 토글.
  if (!isAdminCode(value)) return false;

  setAdminMode(!isAdminMode);
  boardSearchQuery = "";
  elements.boardSearchInput.value = "";
  renderBoardList();
  showToast(isAdminMode ? "관리자 모드를 켰습니다." : "관리자 모드를 껐습니다.");
  return true;
}

function isAdminCode(value) {
  const normalized = normalizeSearchText(value).replace(/["'`“”‘’]/g, "");
  return normalized === ADMIN_TOGGLE_CODE || normalized.includes(ADMIN_TOGGLE_CODE);
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/\s+/g, "");
}

function renderSummary() {
  const photoType = activePhotoType;
  elements.summaryList.innerHTML = days(photoType)
    .map((day) => {
      const entry = getEntry(day);
      const rainHold = photoType === PHOTO_TYPES.CURING && isRainHoldEntry(entry);
      const slotLabel = getPhotoSlotLabel(day, photoType);
      const completion = getEntryCompletionDisplay(entry, photoType, day, state.pourDate);
      return `
        <button class="summary-item ${completion.complete ? "done" : ""} ${rainHold ? "rain-hold" : ""}" type="button" data-summary-day="${day}">
          <strong>${escapeHtml(slotLabel)}</strong>
          <small>${escapeHtml(getPhotoSlotCompactLabel(day, photoType))}</small>
          <span class="summary-status">${escapeHtml(completion.statusText)}</span>
        </button>
      `;
    })
    .join("");
}

async function renderStorageMeter() {
  if (!elements.storageMeterText || !elements.storageMeterBar) return;

  const usage = getKnownPhotoBytes();
  const quota = getStorageDisplayLimitBytes();
  const percent = quota ? Math.min(100, Math.round((usage / quota) * 100)) : 0;
  elements.storageMeterText.textContent = `${formatBytes(usage)} / ${formatBytes(quota)}`;
  elements.storageMeterBar.style.width = `${percent}%`;
  elements.storageMeterBar.classList.toggle("warn", percent >= 80);
}

function renderDayGrid() {
  const photoType = activePhotoType;
  const typeConfig = getPhotoTypeConfig(photoType);
  const canEditSlots = isAdminMode && (photoType === PHOTO_TYPES.CURING || photoType === PHOTO_TYPES.TEMPERATURE);
  const canRenameSlots = isAdminMode && photoType === PHOTO_TYPES.CURING;
  const maxSlotCount = photoType === PHOTO_TYPES.TEMPERATURE ? MAX_TEMPERATURE_SLOT_COUNT : MAX_DAY_SLOT_COUNT;
  let gridHtml = days(photoType)
    .map((day) => {
      const entry = getEntry(day);
      const photo = getTypedPhoto(entry, photoType);
      const hasPhoto = Boolean(photo.photoUrl);
      const rainHold = photoType === PHOTO_TYPES.CURING && isRainHoldEntry(entry);
      const emptyPhotoText = getEmptyPhotoText(day, photoType);
      const slotLabel = getPhotoSlotLabel(day, photoType);
      const slotDateLabel = getPhotoSlotDateLabel(day, photoType);
      const completion = getEntryCompletionDisplay(entry, photoType, day, state.pourDate);
      return `
        <article class="day-card ${completion.complete ? "complete" : ""} ${hasPhoto && !completion.complete ? "pre-registered" : ""} ${rainHold ? "rain-hold" : ""}" data-day-card="${day}">
          <div class="day-card-header">
            <h3>${escapeHtml(slotLabel)}</h3>
            ${
              photoType === PHOTO_TYPES.CURING
                ? `<button class="rain-toggle ${rainHold ? "active" : ""}" type="button" data-rain-day="${day}" aria-pressed="${rainHold}" title="${escapeAttribute(slotLabel)} 우천 대기 표시" aria-label="${escapeAttribute(slotLabel)} 우천 대기 표시">
                    <span aria-hidden="true">☔</span>
                  </button>`
                : ""
            }
            ${
              canEditSlots
                ? `<span class="slot-admin-controls ${canRenameSlots ? "" : "single"} admin-only">
                    ${
                      canRenameSlots
                        ? `<button class="icon-mini" type="button" data-rename-day="${day}" title="일차 이름 변경" aria-label="${escapeAttribute(slotLabel)} 이름 변경"><span aria-hidden="true">✎</span></button>`
                        : ""
                    }
                    <button class="icon-mini danger" type="button" data-remove-day="${day}" data-remove-type="${escapeAttribute(photoType)}" title="${escapeAttribute(slotLabel)} 삭제" aria-label="${escapeAttribute(slotLabel)} 삭제"><span aria-hidden="true">🗑</span></button>
                  </span>`
                : ""
            }
            <span class="date-pill">${escapeHtml(slotDateLabel)}</span>
            ${renderWeatherProof(day, rainHold)}
          </div>
          <div class="photo-preview" data-photo-slot="${day}">
            ${
              hasPhoto
                ? `<button class="photo-preview-button" type="button" data-preview-day="${day}" data-preview-type="${escapeAttribute(photoType)}" title="${escapeAttribute(slotLabel)} 사진 크게 보기">
                    <img src="${escapeAttribute(photo.photoUrl)}" alt="${escapeAttribute(slotLabel)} ${escapeAttribute(typeConfig.label)} 사진" loading="lazy" decoding="async">
                  </button>`
                : `<button class="empty-photo ${rainHold ? "rain-hold" : ""}" type="button" data-paste-day="${day}" title="여기를 누른 뒤 Ctrl+V로 붙여넣기" aria-label="${escapeAttribute(`${slotLabel} ${typeConfig.label} 사진 붙여넣기 대상 선택`)}"><span>${escapeHtml(emptyPhotoText)}</span></button>`
            }
          </div>
          <div class="day-card-body">
            <div class="upload-row">
              <div class="file-control">
                <label class="file-control-title" for="camera-${day}">▣ 촬영</label>
                <input id="camera-${day}" class="file-input" data-day="${day}" data-photo-type="${escapeAttribute(photoType)}" type="file" accept="image/*" capture="environment" aria-label="${escapeAttribute(slotLabel)} ${escapeAttribute(typeConfig.label)} 사진 촬영">
              </div>
              <div class="file-control">
                <label class="file-control-title" for="gallery-${day}">＋ 첨부</label>
                <input id="gallery-${day}" class="file-input" data-day="${day}" data-photo-type="${escapeAttribute(photoType)}" type="file" accept="image/*" multiple aria-label="${escapeAttribute(slotLabel)} ${escapeAttribute(typeConfig.label)} 사진 첨부">
              </div>
              ${
                hasPhoto
                  ? `<button class="small-button danger-button" type="button" data-delete-day="${day}" data-delete-type="${escapeAttribute(photoType)}" aria-label="${escapeAttribute(`${slotLabel} ${typeConfig.label} 사진 삭제`)}">
                      <span class="button-icon" aria-hidden="true">×</span>
                      <span>삭제</span>
                    </button>`
                  : ""
              }
            </div>
            ${hasPhoto && isAdminMode ? `<div class="uploaded-meta admin-only">${renderUploadedMeta(photo)}</div>` : ""}
          </div>
        </article>
      `;
    })
    .join("");

  if (canEditSlots && getPhotoSlotList(photoType).length < maxSlotCount) {
    const addLabel = photoType === PHOTO_TYPES.TEMPERATURE ? "측정 추가" : "일차 추가";
    gridHtml += `
      <article class="day-card add-slot-card admin-only">
        <button type="button" class="add-slot-button" data-add-slot="${escapeAttribute(photoType)}" title="${escapeAttribute(addLabel)}">
          <span class="add-slot-plus" aria-hidden="true">＋</span>
          <span>${escapeHtml(addLabel)}</span>
        </button>
      </article>
    `;
  }

  elements.dayGrid.innerHTML = gridHtml;

  if (pasteTargetDay) {
    const armed = elements.dayGrid.querySelector(`[data-paste-day="${pasteTargetDay}"]`);
    if (armed) armed.classList.add("paste-armed");
    else pasteTargetDay = null;
  }
}

function renderPrintArea() {
  const signature = getPrintImageSignature();
  const token = ++printPreviewRenderToken;

  window.clearTimeout(printPreviewTimer);

  if (printImageCache.signature === signature && Array.isArray(printImageCache.images)) {
    renderPrintPreviewImages(printImageCache.images);
    return;
  }

  elements.printArea.innerHTML = `<div class="print-render-loading">출력 미리보기 준비 중</div>`;
  printPreviewTimer = window.setTimeout(async () => {
    try {
      const { images } = await getPrintPageImages();
      if (token !== printPreviewRenderToken) return;
      renderPrintPreviewImages(images);
    } catch (error) {
      console.error(error);
      if (token !== printPreviewRenderToken) return;
      elements.printArea.innerHTML = `<div class="print-render-loading">출력 미리보기를 만들지 못했습니다.</div>`;
    }
  }, 80);
}

function renderPrintPreviewImages(images) {
  if (!images.length) {
    elements.printArea.innerHTML = `<div class="print-render-loading">${escapeHtml(getPhotoTypeConfig(activePhotoType).sectionTitle)} 미등록</div>`;
    return;
  }

  elements.printArea.innerHTML = images
    .map((src, index) => {
      return `<img class="print-raster-page" src="${escapeAttribute(src)}" alt="사진대지 ${index + 1}쪽">`;
    })
    .join("");
}

function getPrintTextLengthScore(text) {
  return Array.from(String(text)).reduce((score, char) => {
    return score + (char.charCodeAt(0) <= 0x7f ? 0.55 : 1);
  }, 0);
}

function renderUploadedMeta(photo) {
  if (!photo.photoUrl) return "";
  const verifiedTime = photo.verifiedAt ? formatDateTime(photo.verifiedAt) : "";
  const uploadedTime = photo.uploadedAt ? formatDateTime(photo.uploadedAt) : "";
  if (photo.verifiedAtSource === "server" && verifiedTime) {
    return `서버 검증 ${escapeHtml(verifiedTime)} · 자동 압축`;
  }
  if (photo.verifiedAtSource === "device" && verifiedTime) {
    return `기기 등록 ${escapeHtml(verifiedTime)} · 서버 검증 아님 · 자동 압축`;
  }
  if (verifiedTime) {
    return `기존 등록 ${escapeHtml(verifiedTime)} · 검증 출처 미확인 · 자동 압축`;
  }
  if (uploadedTime) {
    return `등록 ${escapeHtml(uploadedTime)} · 서버 검증 전 · 자동 압축`;
  }
  return "등록일시 없음 · 서버 검증 전 · 자동 압축";
}

function openPhotoViewer(day, photoType = activePhotoType) {
  const normalizedType = normalizePhotoType(photoType);
  const typeConfig = getPhotoTypeConfig(normalizedType);
  const photo = getTypedPhoto(getEntry(day), normalizedType);
  if (!photo.photoUrl) return;

  lastPhotoViewerTrigger = document.activeElement;
  elements.photoViewerImage.src = photo.photoUrl;
  elements.photoViewerImage.alt = `${getPhotoSlotLabel(day, normalizedType)} ${typeConfig.label} 사진`;
  elements.photoViewer.hidden = false;
  document.body.classList.add("viewer-open");
  elements.photoViewerClose.focus();
}

function closePhotoViewerOnBackdrop(event) {
  if (event.target === elements.photoViewer) {
    closePhotoViewer();
  }
}

function closePhotoViewer() {
  const wasOpen = !elements.photoViewer.hidden;
  elements.photoViewer.hidden = true;
  elements.photoViewerImage.removeAttribute("src");
  elements.photoViewerImage.alt = "";
  document.body.classList.remove("viewer-open");
  if (wasOpen && lastPhotoViewerTrigger?.isConnected && typeof lastPhotoViewerTrigger.focus === "function") {
    lastPhotoViewerTrigger.focus();
  }
  lastPhotoViewerTrigger = null;
}

function getPrintImageSignature() {
  const photoType = activePhotoType;
  const printSlots = getPrintSlots(photoType);
  const entries = days(photoType).map((day) => {
    const entry = getEntry(day);
    const photo = getTypedPhoto(entry, photoType);
    return [
      day,
      photo.photoUrl || "",
      photo.uploadedAt || "",
      photo.verifiedAt || "",
      photo.verifiedAtSource || "",
      photo.capturedAt || "",
      photoType === PHOTO_TYPES.CURING && isRainHoldEntry(entry),
    ];
  });

  return JSON.stringify({
    photoType,
    projectName: state.projectName || "",
    pourPart: state.pourPart || "",
    pourDate: state.pourDate || "",
    printSlots,
    entries,
    dayLabels: normalizeBoardSettings(state.settings).dayLabels,
    printDayLabelBlind: loadPrintDayLabelBlindMode(),
  });
}

function getPrintSlots(photoType = activePhotoType) {
  const normalizedType = normalizePhotoType(photoType);
  if (normalizedType === PHOTO_TYPES.CURING) return days(normalizedType);

  return days(normalizedType).filter((day) => hasEntryPhoto(getEntry(day), normalizedType));
}

function getPrintPageGroups(photoType = activePhotoType) {
  const normalizedType = normalizePhotoType(photoType);
  // 일차 수에 맞춰 페이지 그룹을 동적으로 구성(페이지당 PRINT_PAGE_GROUP_SIZE일차).
  const slots = getPrintSlots(normalizedType);
  const groups = [];
  for (let index = 0; index < slots.length; index += PRINT_PAGE_GROUP_SIZE) {
    const group = slots.slice(index, index + PRINT_PAGE_GROUP_SIZE);
    while (group.length < PRINT_PAGE_GROUP_SIZE) group.push(null);
    groups.push(group);
  }
  return groups;
}

async function getPrintPageImages() {
  const signature = getPrintImageSignature();
  if (printImageCache.signature === signature && Array.isArray(printImageCache.images)) {
    return { images: printImageCache.images, failedCount: printImageCache.failedCount || 0 };
  }

  const photoType = activePhotoType;
  const groups = getPrintPageGroups(photoType);
  const photos = await loadPrintPhotos(photoType);
  const failedCount = countPrintPhotoFailures(photos);
  const images = groups.map((group) => createPrintPageImage(group, photos, photoType));
  printImageCache = { signature, images, failedCount };
  return { images, failedCount };
}

async function loadPrintPhotos(photoType = activePhotoType) {
  const normalizedType = normalizePhotoType(photoType);
  const slots = getPrintSlots(normalizedType);
  const photoPairs = await Promise.all(
    slots.map(async (day) => {
      const photoUrl = getTypedPhoto(getEntry(day), normalizedType).photoUrl;
      if (!photoUrl) return [day, { image: null, failed: false }];
      const image = await loadPrintPhoto(photoUrl);
      return [day, { image, failed: !image }];
    })
  );

  return Object.fromEntries(photoPairs);
}

function countPrintPhotoFailures(photos) {
  return Object.values(photos || {}).filter((info) => info && info.failed).length;
}

function loadPrintPhoto(src) {
  return new Promise((resolve) => {
    const image = new Image();
    if (!String(src).startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function createPrintPageImage(group, photos, photoType = activePhotoType) {
  let canvas = drawPrintPage(group, photos, true, photoType);
  try {
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.warn("Photo canvas export failed. Retrying without photos.", error);
    canvas = drawPrintPage(group, photos, false, photoType);
    return canvas.toDataURL("image/png");
  }
}

function printMm(value) {
  return value * PRINT_MM_SCALE;
}

function printPt(value) {
  return value * (96 / 72) * (PRINT_MM_SCALE / (96 / 25.4));
}

function drawPrintPage(group, photos, allowPhotos, photoType = activePhotoType) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(printMm(PRINT_PAGE_WIDTH_MM));
  canvas.height = Math.round(printMm(PRINT_PAGE_HEIGHT_MM));

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPrintTitle(ctx);
  drawPrintProjectName(ctx);
  drawPrintTable(ctx, group, photos, allowPhotos, photoType);

  return canvas;
}

function drawPrintTitle(ctx) {
  const pageWidth = printMm(PRINT_PAGE_WIDTH_MM);
  const titleY = printMm(PRINT_TITLE_TOP_MARGIN_MM);
  const fontPx = printPt(22);

  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.font = `900 ${fontPx}px "HYHeadLine-M", "Malgun Gothic", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("사 진 대 지", pageWidth / 2, titleY);

  const metrics = ctx.measureText("사 진 대 지");
  const underlineY = titleY + fontPx + printMm(1);
  ctx.lineWidth = printMm(0.45);
  ctx.strokeStyle = "#000000";
  ctx.beginPath();
  ctx.moveTo(pageWidth / 2 - metrics.width / 2, underlineY);
  ctx.lineTo(pageWidth / 2 + metrics.width / 2, underlineY);
  ctx.stroke();
  ctx.restore();
}

function drawPrintProjectName(ctx) {
  const tableX = printMm((PRINT_PAGE_WIDTH_MM - PRINT_TABLE_WIDTH_MM) / 2);
  const titleHeightMm = 22 * 25.4 / 72;
  const tableY = printMm(PRINT_TITLE_TOP_MARGIN_MM + titleHeightMm + 16.9);
  const text = `□ ${normalizeProjectName(state.projectName || DEFAULT_PROJECT_NAME)}`;
  const fontPx = printPt(11);
  const textY = tableY - printMm(5.8);

  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.font = `${fontPx}px "Batang", "HCR Batang", serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(fitPrintCanvasText(ctx, text, printMm(PRINT_TABLE_WIDTH_MM)), tableX, textY);
  ctx.restore();
}

function drawPrintTable(ctx, group, photos, allowPhotos, photoType = activePhotoType) {
  const tableX = printMm((PRINT_PAGE_WIDTH_MM - PRINT_TABLE_WIDTH_MM) / 2);
  const titleHeightMm = 22 * 25.4 / 72;
  const tableY = printMm(PRINT_TITLE_TOP_MARGIN_MM + titleHeightMm + 16.9);
  const blockHeight = printMm(PRINT_TABLE_HEIGHT_MM / 2);

  group.forEach((day, index) => {
    drawPrintBlockCanvas(ctx, day, tableX, tableY + blockHeight * index, photos, allowPhotos, photoType);
  });
}

function drawPrintBlockCanvas(ctx, day, x, y, photos, allowPhotos, photoType = activePhotoType) {
  const tableW = printMm(PRINT_TABLE_WIDTH_MM);
  const labelW = printMm(PRINT_LABEL_WIDTH_MM);
  const mainW = printMm(PRINT_MAIN_WIDTH_MM);
  const dayW = printMm(PRINT_DAY_WIDTH_MM);
  const photoH = printMm(PRINT_PHOTO_ROW_HEIGHT_MM);
  const infoH = printMm(PRINT_INFO_ROW_HEIGHT_MM);
  const contentH = printMm(PRINT_INFO_ROW_HEIGHT_MM);
  const infoY = y + photoH;
  const contentY = infoY + infoH;

  drawPrintCell(ctx, x, y, tableW, photoH);
  drawPrintCell(ctx, x, infoY, labelW, infoH);
  drawPrintCell(ctx, x + labelW, infoY, mainW, infoH);
  drawPrintCell(ctx, x + labelW + mainW, infoY, dayW, infoH);
  drawPrintCell(ctx, x, contentY, labelW, contentH);
  drawPrintCell(ctx, x + labelW, contentY, mainW + dayW, contentH);

  if (!day) return;

  const photoInfo = photos[day] || { image: null, failed: false };
  drawPrintPhoto(ctx, day, x, y, tableW, photoH, photoInfo, allowPhotos, photoType);
  drawCenteredPrintText(ctx, "위  치", x, infoY, labelW, infoH, 13, "Batang, serif");
  drawPrintMainTextCanvas(ctx, state.pourPart || "", x + labelW, infoY, mainW, infoH, {
    breakAfterFirstBracket: true,
  });
  if (!loadPrintDayLabelBlindMode()) {
    drawCenteredPrintText(ctx, getPhotoSlotLabel(day, photoType), x + labelW + mainW, infoY, dayW, infoH, 13, "Batang, serif");
  }
  drawCenteredPrintText(ctx, "내  용", x, contentY, labelW, contentH, 13, "Batang, serif");
  drawPrintMainTextCanvas(ctx, getPhotoTypeConfig(photoType).contentText, x + labelW, contentY, mainW + dayW, contentH);
}

function drawPrintCell(ctx, x, y, width, height) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = Math.max(1, printMm(0.12));
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

function drawPrintPhoto(ctx, day, x, y, width, height, photoInfo, allowPhotos, photoType = activePhotoType) {
  const info = photoInfo || { image: null, failed: false };
  const photoW = printMm(PRINT_PHOTO_WIDTH_MM);
  const photoH = printMm(PRINT_PHOTO_HEIGHT_MM);
  const photoX = x + (width - photoW) / 2;
  const photoY = y + (height - photoH) / 2;

  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(photoX, photoY, photoW, photoH);

  if (allowPhotos && info.image) {
    drawCoverImage(ctx, info.image, photoX, photoY, photoW, photoH);
  } else if (info.failed) {
    drawCenteredPrintText(ctx, "사진 불러오기 실패", photoX, photoY, photoW, photoH, 13, "Batang, serif");
  } else {
    drawCenteredPrintText(ctx, getPrintMissingPhotoText(day, photoType), photoX, photoY, photoW, photoH, 13, "Batang, serif");
  }

  ctx.restore();
}

function drawCoverImage(ctx, image, x, y, width, height) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sw = image.naturalHeight * targetRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = image.naturalWidth / targetRatio;
    sy = (image.naturalHeight - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function drawCenteredPrintText(ctx, text, x, y, width, height, fontPt, fontFamily) {
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.font = `${printPt(fontPt)}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + width / 2, y + height / 2);
  ctx.restore();
}

function drawPrintMainTextCanvas(ctx, text, x, y, width, height, options = {}) {
  const paddingX = printMm(1.8);
  const fontPt = getPrintCanvasFontPt(text);
  const fontPx = printPt(fontPt);
  const lineHeight = fontPx * 1.12;
  const textX = x + paddingX;
  const textWidth = width - paddingX * 2;

  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.font = `${fontPx}px "Batang", "HCR Batang", serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const lines = getPrintCanvasLines(ctx, text, textWidth, 2, options);
  const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, textX, startY + index * lineHeight);
  });

  ctx.restore();
}

function getPrintCanvasFontPt(text) {
  const lengthScore = getPrintTextLengthScore(text);
  if (lengthScore > 70) return 10;
  if (lengthScore > 52) return 11.5;
  return 13;
}

function getPrintCanvasLines(ctx, value, maxWidth, maxLines, options = {}) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return [""];
  if (ctx.measureText(text).width <= maxWidth) return [text];

  const segments = getPrintCanvasSegments(text, options);
  const lines = [];

  segments.forEach((segment) => {
    if (lines.length >= maxLines) return;
    wrapPrintCanvasSegment(ctx, segment, maxWidth).forEach((line) => {
      if (lines.length < maxLines) {
        lines.push(line);
      }
    });
  });

  if (!lines.length) return [""];

  const hasHiddenText = segments.join(" ").length > lines.join(" ").length;
  if (hasHiddenText && lines.length >= maxLines) {
    lines[maxLines - 1] = fitPrintCanvasText(ctx, lines[maxLines - 1], maxWidth, "…");
  }

  return lines.slice(0, maxLines);
}

function getPrintCanvasSegments(text, options = {}) {
  if (!options.breakAfterFirstBracket || getPrintTextLengthScore(text) <= 18) {
    return [text];
  }

  const chars = Array.from(text);
  const majorCommaBreakIndex = findTopLevelPrintBreakIndex(chars, [",", "，", "、"], (source, index) => {
    return source.slice(index + 1).join("").trimStart().toUpperCase().startsWith("STA.");
  });
  if (majorCommaBreakIndex >= 0) {
    return [
      chars.slice(0, majorCommaBreakIndex + 1).join("").trim(),
      chars.slice(majorCommaBreakIndex + 1).join("").trim(),
    ].filter(Boolean);
  }

  const closeBracketIndex = chars.findIndex((char, index) => {
    return [")", "]", "}"].includes(char) && index < chars.length - 1;
  });

  if (closeBracketIndex >= 0) {
    return [
      chars.slice(0, closeBracketIndex + 1).join("").trim(),
      chars.slice(closeBracketIndex + 1).join("").trim(),
    ].filter(Boolean);
  }

  const commaBreakIndex = findTopLevelPrintBreakIndex(chars, [",", "，", "、"]);
  if (commaBreakIndex >= 0) {
    return [
      chars.slice(0, commaBreakIndex + 1).join("").trim(),
      chars.slice(commaBreakIndex + 1).join("").trim(),
    ].filter(Boolean);
  }

  return [text];
}

function findTopLevelPrintBreakIndex(chars, delimiters, predicate = null) {
  let depth = 0;
  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    if (["(", "[", "{"].includes(char)) {
      depth += 1;
      continue;
    }
    if ([")", "]", "}"].includes(char)) {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (
      depth === 0 &&
      delimiters.includes(char) &&
      index < chars.length - 1 &&
      (!predicate || predicate(chars, index))
    ) {
      return index;
    }
  }
  return -1;
}

function wrapPrintCanvasSegment(ctx, segment, maxWidth) {
  if (ctx.measureText(segment).width <= maxWidth) return [segment];

  const tokens = segment.split(/(\s+)/).filter(Boolean);
  const lines = [];
  let line = "";

  tokens.forEach((token) => {
    const candidate = `${line}${token}`;
    if (!line || ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      return;
    }

    lines.push(fitPrintCanvasText(ctx, line.trim(), maxWidth));
    line = token.trimStart();
  });

  if (line) {
    lines.push(fitPrintCanvasText(ctx, line.trim(), maxWidth));
  }

  return lines;
}

function fitPrintCanvasText(ctx, text, maxWidth, suffix = "") {
  let chars = Array.from(String(text || ""));
  while (chars.length && ctx.measureText(`${chars.join("")}${suffix}`).width > maxWidth) {
    chars.pop();
  }
  return `${chars.join("")}${suffix}`;
}

async function handlePrint() {
  if (!state.shareCode || (dbClient && !state.boardId)) {
    showToast("먼저 사진대지를 선택하거나 만들어 주세요.");
    return;
  }
  if (activePhotoMutationCount > 0) {
    showToast("현재 저장 작업이 끝난 뒤 PDF를 만들어 주세요.");
    return;
  }

  elements.printButton.disabled = true;
  beginPhotoMutation();
  showToast("출력 파일을 준비하는 중입니다.");
  try {
    const { images, failedCount } = await getPrintPageImages();
    if (!images.length) {
      showToast(`${getPhotoTypeConfig(activePhotoType).sectionTitle}이 없습니다.`);
      return;
    }

    if (failedCount > 0) {
      showToast(`사진 ${failedCount}장을 불러오지 못해 '사진 불러오기 실패'로 표시됩니다. 잠시 후 다시 시도해 보세요.`);
    }

    const saved = await savePrintPdf(images);
    if (saved) {
      const savedText = isKakaoInAppBrowser() ? "PDF 다운로드를 시작합니다." : "PDF를 저장했습니다.";
      showToast(failedCount > 0 ? `${savedText} (일부 사진 로드 실패)` : savedText);
      return;
    }

    // PDF 생성 실패 시(라이브러리 미로딩 등) 기존 인쇄 창 방식으로 폴백
    openPrintWindowFallback(images);
  } catch (error) {
    console.error(error);
    showToast("출력 파일을 만들지 못했습니다.");
  } finally {
    elements.printButton.disabled = false;
    await endPhotoMutation();
  }
}

async function savePrintPdf(images) {
  let jsPdfCtor = null;
  try {
    jsPdfCtor = await ensureJsPdf();
  } catch (error) {
    console.error("jsPDF 로드 실패", error);
    return false;
  }
  if (!jsPdfCtor) return false;

  try {
    const pdf = new jsPdfCtor({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const pageH = 297;
    images.forEach((src, index) => {
      if (index > 0) pdf.addPage();
      pdf.addImage(src, "PNG", 0, 0, pageW, pageH, undefined, "FAST");
    });

    const filename = buildPdfFilename();

    if (isKakaoInAppBrowser()) {
      const blob = pdf.output("blob");
      return await deliverPdfViaStorage(blob, filename);
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("PDF 생성 실패", error);
    return false;
  }
}

async function deliverPdfViaStorage(blob, filename) {
  if (!dbClient || !state.shareCode) return false;

  const path = `${state.shareCode}/pdf/${normalizePhotoType(activePhotoType)}.pdf`;
  const { error: uploadError } = await dbClient.storage
    .from(config.bucket)
    .upload(path, blob, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    console.error("PDF 업로드 실패", uploadError);
    return false;
  }

  const { data } = dbClient.storage.from(config.bucket).getPublicUrl(path, { download: filename });
  if (!data?.publicUrl) return false;

  window.location.href = data.publicUrl;
  return true;
}

function buildPdfFilename() {
  const part = (state.pourPart || "사진대지").replace(/[\\/:*?"<>|]/g, "_").trim() || "사진대지";
  const typeLabel = getPhotoTypeConfig(activePhotoType).label || "";
  const date = state.pourDate ? `_${state.pourDate}` : "";
  return `${part}_${typeLabel}${date}.pdf`;
}

function openPrintWindowFallback(images) {
  if (isKakaoInAppBrowser()) {
    showToast("카톡 안에서는 PDF 저장이 막힐 수 있습니다. 오른쪽 위 ··· → 다른 브라우저로 열어 주세요.");
    return;
  }
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("PDF 저장에 실패했고 새 창도 차단됐습니다. 팝업을 허용한 뒤 다시 눌러 주세요.");
    return;
  }
  writeRasterPrintDocument(printWindow, images);
  showToast("PDF 저장 대신 인쇄 창을 열었습니다. '대상: PDF로 저장'을 선택하세요.");
}

function writeRasterPrintDocument(printWindow, images) {
  const pages = images
    .map((src, index) => `<img class="page" src="${escapeAttribute(src)}" alt="사진대지 ${index + 1}쪽">`)
    .join("");

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8">
        <meta name="color-scheme" content="light">
        <meta name="darkreader-lock">
        <title>사진대지 PDF 출력</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          html, body {
            margin: 0;
            padding: 0;
            background: #fff !important;
            color: #000 !important;
            color-scheme: light;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page {
            display: block;
            width: 210mm;
            height: 297mm;
            margin: 0;
            background: #fff !important;
            page-break-after: always;
            break-after: page;
            filter: none !important;
            mix-blend-mode: normal !important;
          }
          .page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          @media screen {
            body {
              display: grid;
              gap: 12px;
              justify-content: center;
              padding: 12px;
            }
            .page {
              border: 1px solid #ddd;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            }
          }
        </style>
      </head>
      <body>
        ${pages}
        <script>
          (() => {
            const images = Array.from(document.images);
            let remaining = images.length;
            const start = () => setTimeout(() => {
              window.focus();
              window.print();
            }, 100);
            const done = () => {
              remaining -= 1;
              if (remaining <= 0) start();
            };
            if (!remaining) {
              start();
              return;
            }
            images.forEach((image) => {
              if (image.complete) {
                done();
              } else {
                image.onload = done;
                image.onerror = done;
              }
            });
          })();
        </script>
      </body>
    </html>`);
  printWindow.document.close();
}

async function createNewBoard() {
  if (activePhotoMutationCount > 0) {
    showToast("현재 저장 작업이 끝난 뒤 새 사진대지를 만들어 주세요.");
    return;
  }

  endFilePickNow();
  window.clearTimeout(metaSaveTimer);
  metaSaveTimer = null;
  const token = ++boardLoadToken;
  if (state.shareCode) {
    await saveMeta();
    if (token !== boardLoadToken) return;
  }
  await boardSettingsSaveChain;
  if (token !== boardLoadToken) return;
  activePhotoType = DEFAULT_PHOTO_TYPE;

  const shareCode = createShareCode();
  clearBoardUrlParam();

  state = {
    shareCode,
    boardId: null,
    projectName: DEFAULT_PROJECT_NAME,
    pourPart: "",
    pourDate: toDateInputValue(new Date()),
    entries: {},
    settings: getLegacyBoardSettings(),
  };
  lastSyncedMeta = { projectName: state.projectName, pourPart: state.pourPart, pourDate: state.pourDate };
  boardResultSelectedGroup = null;

  if (dbClient) {
    await loadCloudBoard({ createIfMissing: true });
    await subscribeToChanges();
  } else {
    syncInputsFromState();
    saveLocalBoard();
  }

  await loadBoardList();
  renderAll();
  showToast("새 사진대지를 만들었습니다.");
}

async function deleteCurrentBoard() {
  await deleteBoardByShareCode(state.shareCode);
}

async function deleteBoardByShareCode(shareCode) {
  if (!isAdminMode) {
    showToast("관리자 모드에서만 사진대지를 삭제할 수 있습니다.");
    return;
  }
  if (!shareCode) {
    showToast("삭제할 사진대지가 없습니다.");
    return;
  }
  if (activePhotoMutationCount > 0) {
    showToast("현재 저장 작업이 끝난 뒤 사진대지를 삭제해 주세요.");
    return;
  }

  let target = null;
  try {
    target = await loadBoardDeleteTarget(shareCode);
  } catch (error) {
    console.error(error);
    showToast("삭제할 사진대지를 확인하지 못했습니다.");
    return;
  }
  if (!target) {
    showToast("삭제할 사진대지를 찾지 못했습니다.");
    await loadBoardList();
    renderBoardList();
    return;
  }

  const photoCount = countPhotoEntries(target.entries || {});
  const pourPart = target.pourPart || "미입력";
  const confirmed = await confirmDangerousAction({
    title: "사진대지 삭제",
    message:
      photoCount > 0
        ? `${pourPart} 사진대지와 등록된 사진 ${photoCount}장이 함께 삭제됩니다. 되돌릴 수 없습니다.`
        : `${pourPart} 사진대지를 삭제합니다.`,
    confirmLabel: "삭제",
    countdownSeconds: photoCount > 0 ? 3 : 0,
  });
  if (!confirmed) return;

  endFilePickNow();
  window.clearTimeout(metaSaveTimer);
  metaSaveTimer = null;
  if (metaSavePromise) await metaSavePromise;
  await boardSettingsSaveChain;

  const deletedShareCode = shareCode;
  const deletingCurrent = state.shareCode === deletedShareCode;
  const nextShareCode = boardList.find((board) => board.shareCode !== deletedShareCode)?.shareCode || "";
  let deleteResult = { deleted: false, cleanupPending: false, status: "active" };

  try {
    if (target.boardId && dbClient) {
      if (deletingCurrent && realtimeChannel) {
        await dbClient.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }

      deleteResult = await deleteCloudBoardTarget(target);
    } else {
      localStorage.removeItem(LOCAL_PREFIX + deletedShareCode);
      deleteResult = { deleted: true, cleanupPending: false, status: "deleted" };
    }

    if (deleteResult.status === "unknown") {
      if (deletingCurrent && dbClient && state.boardId && !realtimeChannel) {
        await subscribeToChanges().catch(console.error);
      }
      showToast("삭제 결과를 확인하지 못했습니다. 연결이 복구되면 대지 목록에서 상태를 다시 확인해 주세요.");
      return;
    }
    if (!deleteResult.deleted) {
      throw new Error("Board deletion was not confirmed.");
    }
    localStorage.removeItem(META_DRAFT_PREFIX + deletedShareCode);
    localStorage.removeItem(BOARD_SETTINGS_FALLBACK_PREFIX + deletedShareCode);
  } catch (error) {
    console.error(error);
    if (deletingCurrent && dbClient && state.boardId && !realtimeChannel) {
      await subscribeToChanges().catch(console.error);
    }
    showToast(
      isBackendUpgradeRequiredError(error)
        ? "서버 업데이트가 필요해 사진대지를 삭제하지 않았습니다. 데이터베이스 업데이트 후 다시 시도해 주세요."
        : "사진대지 삭제에 실패했습니다.",
    );
    return;
  }

  saveHiddenBoardCode(deletedShareCode);
  boardList = boardList.filter((board) => board.shareCode !== deletedShareCode);
  try {
    await loadBoardList();
  } catch (error) {
    console.warn("Deleted board list refresh failed", error);
    pendingRealtimeRefresh = Boolean(dbClient);
  }

  if (deletingCurrent) {
    state.shareCode = "";
    state.boardId = null;

    if (nextShareCode && boardList.some((board) => board.shareCode === nextShareCode)) {
      await openBoard(nextShareCode);
    } else {
      resetCurrentBoard();
      syncUrlToCurrentBoard();
      try {
        await loadBoardList();
      } catch (error) {
        console.warn("Empty board list refresh failed", error);
      }
      renderAll();
    }
  } else {
    renderAll();
  }

  showToast(
    deleteResult.cleanupPending
      ? "사진대지는 삭제 처리했습니다. 남은 서버 파일은 다음 정리 때 다시 처리됩니다."
      : "사진대지를 삭제했습니다."
  );
}

async function loadBoardDeleteTarget(shareCode) {
  if (!shareCode) return null;

  if (!dbClient) {
    if (shareCode === state.shareCode) {
      return {
        shareCode,
        boardId: null,
        pourPart: state.pourPart || "",
        entries: normalizeEntries(state.entries || {}),
      };
    }

    const saved = localStorage.getItem(LOCAL_PREFIX + shareCode);
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved);
      return {
        shareCode,
        boardId: null,
        pourPart: parsed.pourPart || "",
        entries: normalizeEntries(parsed.entries || {}),
      };
    } catch (error) {
      console.warn("Local board delete target parse failed", error);
      return null;
    }
  }

  if (shareCode === state.shareCode && state.boardId) {
    return {
      shareCode,
      boardId: state.boardId,
      pourPart: state.pourPart || "",
      entries: normalizeEntries(state.entries || {}),
    };
  }

  const listBoard = boardList.find((board) => board.shareCode === shareCode);
  const { data, error } = await dbClient
    .from("photo_boards")
    .select("*")
    .eq("share_code", shareCode)
    .maybeSingle();
  if (error) throw error;
  const board = data || (listBoard?.boardId ? {
    id: listBoard.boardId,
    share_code: listBoard.shareCode,
    project_name: listBoard.projectName,
    pour_part: listBoard.pourPart,
  } : null);
  if (!board || isDeletedBoardRecord(board)) return null;

  const entries = {};
  const { data: entryRows, error: entryError } = await dbClient
    .from("photo_entries")
    .select("*")
    .eq("board_id", board.id);
  if (entryError) throw entryError;

  (entryRows || []).forEach((row) => {
    const memo = parseEntryMemo(row.memo);
    entries[row.day_no] = {
      dayNo: row.day_no,
      photoUrl: row.photo_url || "",
      photoPath: row.photo_path || "",
      uploadedAt: row.uploaded_at || "",
      verifiedAt: memo.photos?.[PHOTO_TYPES.CURING]?.verifiedAt || "",
      verifiedAtSource: memo.photos?.[PHOTO_TYPES.CURING]?.verifiedAtSource || "",
      capturedAt: memo.photos?.[PHOTO_TYPES.CURING]?.capturedAt || "",
      capturedAtSource: memo.photos?.[PHOTO_TYPES.CURING]?.capturedAtSource || "",
      rainHold: memo.rainHold,
      photos: memo.photos || {},
    };
  });

  return {
    shareCode,
    boardId: board.id,
    pourPart: board.pour_part || "",
    entries: normalizeEntries(entries),
  };
}

async function deleteCloudBoardTarget(target) {
  if (!dbClient || !target?.boardId) {
    return { deleted: false, cleanupPending: false, status: "active" };
  }

  const markStatus = await markCloudBoardDeletedAtomically(target.boardId);
  if (markStatus === "unknown") {
    return { deleted: false, cleanupPending: false, status: "unknown" };
  }
  if (markStatus === "missing") {
    return { deleted: true, cleanupPending: false, status: "deleted" };
  }

  let latestEntries = null;
  try {
    latestEntries = await loadCloudBoardEntriesForDeletion(target.boardId);
  } catch (error) {
    console.warn("Deleted board entry cleanup deferred", error);
    return { deleted: true, cleanupPending: true, status: "deleted" };
  }
  const photoPaths = collectBoardPhotoPaths(latestEntries, target.shareCode);

  try {
    await removeBoardStoragePaths(photoPaths);
  } catch (error) {
    console.warn("Board storage cleanup deferred", error);
    return { deleted: true, cleanupPending: true, status: "deleted" };
  }

  if (atomicDeletePurgeRpcAvailable === false) {
    return { deleted: true, cleanupPending: true, status: "deleted" };
  }

  let data = null;
  let error = null;
  try {
    ({ data, error } = await dbClient.rpc("purge_photo_board", { p_board_id: target.boardId }));
  } catch (requestError) {
    error = requestError;
  }
  if (error && isMissingBackendFeature(error, "purge_photo_board")) {
    atomicDeletePurgeRpcAvailable = false;
    console.warn("Atomic board purge RPC is unavailable; cleanup is paused until the server is updated.");
    return { deleted: true, cleanupPending: true, status: "deleted" };
  }
  if (error) {
    atomicDeletePurgeRpcAvailable = true;
    console.warn("Atomic board purge deferred", error);
    return { deleted: true, cleanupPending: true, status: "deleted" };
  }

  atomicDeletePurgeRpcAvailable = true;
  if (data === false) {
    try {
      const remaining = await fetchCloudBoardDeleteRecord(target.boardId);
      return {
        deleted: !remaining || isDeletedBoardRecord(remaining),
        cleanupPending: Boolean(remaining),
        status: !remaining || isDeletedBoardRecord(remaining) ? "deleted" : "active",
      };
    } catch (verificationError) {
      console.warn("Board purge result could not be verified", verificationError);
      return { deleted: true, cleanupPending: true, status: "deleted" };
    }
  }
  return { deleted: true, cleanupPending: false, status: "deleted" };
}

async function markCloudBoardDeletedAtomically(boardId) {
  if (atomicDeleteMarkRpcAvailable === false) {
    throw createBackendUpgradeRequiredError("mark_photo_board_deleted");
  }

  let error = null;
  try {
    ({ error } = await dbClient.rpc("mark_photo_board_deleted", { p_board_id: boardId }));
  } catch (requestError) {
    error = requestError;
  }

  if (error && isMissingBackendFeature(error, "mark_photo_board_deleted")) {
    atomicDeleteMarkRpcAvailable = false;
    throw createBackendUpgradeRequiredError("mark_photo_board_deleted");
  }
  if (!error) {
    atomicDeleteMarkRpcAvailable = true;
    return "marked";
  }

  atomicDeleteMarkRpcAvailable = true;
  try {
    const verified = await fetchCloudBoardDeleteRecord(boardId);
    if (!verified) return "missing";
    if (isDeletedBoardRecord(verified)) return "marked";
  } catch (verificationError) {
    console.warn("Board tombstone result could not be verified", verificationError);
    return "unknown";
  }
  throw error;
}

function createBackendUpgradeRequiredError(featureName) {
  const error = new Error(`Backend update required: ${featureName}`);
  error.code = "BACKEND_UPGRADE_REQUIRED";
  return error;
}

function isBackendUpgradeRequiredError(error) {
  return error?.code === "BACKEND_UPGRADE_REQUIRED";
}

async function loadCloudBoardEntriesForDeletion(boardId) {
  const { data, error } = await dbClient
    .from("photo_entries")
    .select("*")
    .eq("board_id", boardId);
  if (error) throw error;
  return data || [];
}

async function fetchCloudBoardDeleteRecord(boardId) {
  const { data, error } = await dbClient
    .from("photo_boards")
    .select("*")
    .eq("id", boardId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

function collectBoardPhotoPaths(entries, shareCode = "") {
  const paths = new Set();
  getEntryItems(entries).forEach(({ entry }) => {
    Object.values(PHOTO_TYPES).forEach((photoType) => {
      const photo = getTypedPhoto(entry, photoType);
      if (photo.photoPath) paths.add(photo.photoPath);
    });
  });
  if (shareCode) {
    paths.add(`${shareCode}/pdf/${PHOTO_TYPES.CURING}.pdf`);
    paths.add(`${shareCode}/pdf/${PHOTO_TYPES.TEMPERATURE}.pdf`);
  }
  return Array.from(paths);
}

async function removeBoardStoragePaths(paths) {
  if (!dbClient || !paths.length) return true;
  const { error } = await dbClient.storage.from(config.bucket).remove(paths);
  if (error) throw error;
  return true;
}

async function openBoard(shareCode) {
  if (!shareCode) return;
  if (activePhotoMutationCount > 0) {
    showToast("현재 저장 작업이 끝난 뒤 다른 타설부위를 열어 주세요.");
    return;
  }

  const token = ++boardLoadToken;
  endFilePickNow();
  window.clearTimeout(metaSaveTimer);
  metaSaveTimer = null;
  activePhotoType = DEFAULT_PHOTO_TYPE;
  if (state.shareCode && shareCode !== state.shareCode) {
    await saveMeta();
    if (token !== boardLoadToken) return;
  }
  await boardSettingsSaveChain;
  if (token !== boardLoadToken) return;

  const selectedBoard = boardList.find((board) => board.shareCode === shareCode);
  clearBoardUrlParam();
  state = {
    shareCode,
    boardId: null,
    projectName: selectedBoard?.projectName || DEFAULT_PROJECT_NAME,
    pourPart: selectedBoard?.pourPart || "",
    pourDate: selectedBoard?.pourDate || toDateInputValue(new Date()),
    createdAt: selectedBoard?.createdAt || "",
    entries: {},
    settings: normalizeBoardSettings(selectedBoard?.settings, {
      fallback: loadBoardSettingsFallback(shareCode) || getLegacyBoardSettings(),
    }),
  };
  syncInputsFromState();
  closePhotoViewer();
  renderAll();

  if (dbClient) {
    const loaded = await loadCloudBoard();
    if (loaded === null || token !== boardLoadToken || state.shareCode !== shareCode) return;
    await subscribeToChanges();
  } else {
    loadLocalBoard();
  }

  if (token !== boardLoadToken || state.shareCode !== shareCode) return;
  await loadBoardList();
  if (token !== boardLoadToken || state.shareCode !== shareCode) return;
  renderAll();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

function setSyncStatus(message) {
  if (elements.syncStatus) {
    elements.syncStatus.textContent = message;
  }
}

function isMetaInputFocused() {
  return [elements.projectNameInput, elements.pourPartInput, elements.pourDateInput].includes(document.activeElement);
}

function getKnownPhotoBytes() {
  const listPhotoCount = countVisibleBoardPhotos();
  const currentPhotoCount = countPhotoEntries(state.entries || {});
  return Math.max(listPhotoCount, currentPhotoCount) * ESTIMATED_PHOTO_BYTES;
}

async function prepareImageFile(file) {
  if (!isHeicFile(file)) return file;

  showToast("휴대폰 사진 형식을 변환하는 중입니다.");
  await ensureHeicConverter();
  const converted = await window.heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: IMAGE_QUALITY,
  });

  return Array.isArray(converted) ? converted[0] : converted;
}

async function ensureHeicConverter() {
  if (window.heic2any) return;
  await loadScript(HEIC2ANY_URL);
  if (!window.heic2any) {
    throw new Error("HEIC converter unavailable");
  }
}

function resizeImage(file, maxWidth = IMAGE_MAX_WIDTH, maxHeight = IMAGE_MAX_HEIGHT) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        const ratio = Math.min(1, maxWidth / img.width, maxHeight / img.height);
        const width = Math.max(1, Math.round(img.width * ratio));
        const height = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, width, height);
        const blob = await canvasToJpegBlob(canvas, IMAGE_QUALITY);

        URL.revokeObjectURL(url);
        resolve({
          blob,
          dataUrl: await blobToDataUrl(blob),
        });
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };

    img.src = url;
  });
}

function canvasToJpegBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image conversion failed"));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image read failed"));
    reader.readAsDataURL(blob);
  });
}

function isImageFile(file) {
  if (file.type && file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || "");
}

function isHeicFile(file) {
  return /hei(c|f)/i.test(file.type || "") || /\.(heic|heif)$/i.test(file.name || "");
}

function days(photoType = activePhotoType, entries = state.entries) {
  return getPhotoSlotList(photoType, entries);
}

function formatDayDate(day) {
  if (!state.pourDate) return "타설일 미입력";
  return formatMonthDay(addDays(state.pourDate, day - 1));
}

function formatCompactDayDate(day) {
  if (!state.pourDate) return "-";
  const date = addDays(state.pourDate, day - 1);
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(dateValue, offset) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return date;
}

function formatMonthDay(date) {
  return date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}

function formatListDate(value) {
  if (!value) return "날짜 없음";
  const date = new Date(`${value}T00:00:00`);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = date.toLocaleDateString("ko-KR", { weekday: "short" });
  return `${month}.${day}.(${weekday})`;
}

function formatBoardResultMonth(value) {
  const month = normalizeBoardResultMonth(value);
  if (!month) return "월별";
  const [year, monthNumber] = month.split("-");
  return `${year}년 ${Number(monthNumber)}월`;
}

function formatBoardResultMonthShort(value) {
  const month = normalizeBoardResultMonth(value);
  if (!month) return "월";
  const [, monthNumber] = month.split("-");
  return `${Number(monthNumber)}월`;
}

function formatBoardResultDay(value) {
  const day = normalizeBoardResultDay(value);
  if (!day) return "일자별";
  const date = new Date(`${day}T00:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dateNumber = date.getDate();
  const weekday = date.toLocaleDateString("ko-KR", { weekday: "short" });
  return `${year}년 ${month}월 ${dateNumber}일(${weekday})`;
}

function formatBoardResultDayShort(value) {
  const day = normalizeBoardResultDay(value);
  if (!day) return "일자";
  const date = new Date(`${day}T00:00:00`);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dateNumber = String(date.getDate()).padStart(2, "0");
  const weekday = date.toLocaleDateString("ko-KR", { weekday: "short" });
  return `${month}.${dateNumber}.(${weekday})`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatBytes(bytes) {
  if (!bytes) return "0KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${Math.round(bytes / 1024 / 1024)}MB`;
  return `${Math.round(bytes / 1024 / 1024 / 1024)}GB`;
}

function getStorageDisplayLimitBytes() {
  const configuredMb = Number(config.storageLimitMb);
  if (configuredMb > 0) {
    return configuredMb * 1024 * 1024;
  }

  return STORAGE_DISPLAY_LIMIT_BYTES;
}

function ensureSupabaseClient() {
  if (window.supabase) return Promise.resolve();
  return loadScript(SUPABASE_JS_URL);
}

async function ensureJsPdf() {
  const getCtor = () => {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (window.jsPDF) return window.jsPDF;
    return null;
  };
  if (getCtor()) return getCtor();
  await loadScript(JSPDF_URL);
  return getCtor();
}

function isKakaoInAppBrowser() {
  return /KAKAOTALK/i.test(navigator.userAgent);
}

function loadScript(src, timeoutMs = SCRIPT_LOAD_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    let timeoutId = 0;
    let targetScript = existing;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      if (!targetScript) return;
      targetScript.removeEventListener("load", onLoad);
      targetScript.removeEventListener("error", onError);
    };

    const onLoad = () => {
      if (targetScript) targetScript.dataset.loaded = "true";
      cleanup();
      resolve();
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const onTimeout = () => {
      cleanup();
      if (targetScript && targetScript.dataset.loaded !== "true") {
        targetScript.remove();
      }
      reject(new Error(`Script load timeout: ${src}`));
    };

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      timeoutId = window.setTimeout(onTimeout, timeoutMs);
      return;
    }

    const script = document.createElement("script");
    targetScript = script;
    script.src = src;
    script.async = true;
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    timeoutId = window.setTimeout(onTimeout, timeoutMs);
    document.head.appendChild(script);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function normalizeProjectName(value) {
  const text = String(value == null ? "" : value).trim();
  return text || DEFAULT_PROJECT_NAME;
}
