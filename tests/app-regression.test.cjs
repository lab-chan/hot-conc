const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");

function createElement() {
  return {
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    remove() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    setAttribute() {},
    removeAttribute() {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    style: {},
    dataset: {},
    value: "",
    innerHTML: "",
    textContent: "",
    hidden: false,
    disabled: false,
  };
}

function createAppContext() {
  const values = new Map();
  const testConsole = Object.create(console);
  testConsole.warn = () => {};
  const localStorage = {
    get length() { return values.size; },
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
    clear() { values.clear(); },
    key(index) { return Array.from(values.keys())[index] || null; },
  };
  const elements = new Map();
  const document = {
    activeElement: null,
    visibilityState: "visible",
    body: createElement(),
    head: createElement(),
    addEventListener() {},
    removeEventListener() {},
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElement());
      return elements.get(id);
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return createElement(); },
  };
  const windowObject = {
    CONCRETE_PHOTO_CONFIG: {},
    STANDARD_DOCUMENT_SEARCH_INDEX: {},
    location: { href: "http://localhost/" },
    history: { replaceState() {} },
    crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000000" },
    addEventListener() {},
    removeEventListener() {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame(callback) { return setTimeout(callback, 0); },
    cancelAnimationFrame: clearTimeout,
    confirm() { return true; },
    prompt() { return null; },
  };
  windowObject.window = windowObject;

  const context = vm.createContext({
    window: windowObject,
    document,
    localStorage,
    navigator: { userAgent: "node" },
    console: testConsole,
    URL,
    Date,
    Intl,
    Map,
    Set,
    JSON,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Promise,
    RegExp,
    Error,
    DOMException,
    AbortController,
    fetch: async () => { throw new Error("network disabled in unit tests"); },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  });
  vm.runInContext(appSource, context, { filename: "app.js" });
  return context;
}

function evaluate(context, expression) {
  return vm.runInContext(expression, context);
}

test("일차 날짜 계산은 월·연도 경계를 안정적으로 넘는다", () => {
  const context = createAppContext();
  assert.equal(evaluate(context, 'getDateKeyForPourDay("2026-12-31", 2)'), "2027-01-01");
  assert.equal(evaluate(context, 'getDateKeyForPourDay("2026-02-28", 2)'), "2026-03-01");
  assert.equal(evaluate(context, 'getDateKeyForPourDay("잘못된 날짜", 1)'), "");
});

test("미래 일차 사진은 등록돼도 완료로 집계하지 않는다", () => {
  const context = createAppContext();
  assert.equal(
    evaluate(context, 'isCompletedEntry({ photoUrl: "x" }, PHOTO_TYPES.CURING, { pourDate: "2099-01-01", dayNo: 1 })'),
    false,
  );
  assert.equal(
    evaluate(context, 'isCompletedEntry({ photoUrl: "x" }, PHOTO_TYPES.CURING, { pourDate: "2020-01-01", dayNo: 1 })'),
    true,
  );
});

test("우천대기는 최종 강수 자료가 확인된 경우에만 완료다", () => {
  const context = createAppContext();
  evaluate(context, 'weatherDailyByDate = new Map([["2020-01-01", { rainMm: 2.5, isFinal: true }]])');
  assert.equal(
    evaluate(context, 'isCompletedEntry({ rainHold: true }, PHOTO_TYPES.CURING, { pourDate: "2020-01-01", dayNo: 1 })'),
    true,
  );
  evaluate(context, 'weatherDailyByDate = new Map([["2020-01-01", { rainMm: 0, isFinal: true }]])');
  assert.equal(
    evaluate(context, 'isCompletedEntry({ rainHold: true }, PHOTO_TYPES.CURING, { pourDate: "2020-01-01", dayNo: 1 })'),
    false,
  );
  evaluate(context, "weatherDailyByDate = new Map()");
  assert.equal(
    evaluate(context, 'isCompletedEntry({ rainHold: true }, PHOTO_TYPES.CURING, { pourDate: "2020-01-01", dayNo: 1 })'),
    false,
  );
});

test("대지 설정은 정규화되고 다른 대지 설정과 섞이지 않는다", () => {
  const context = createAppContext();
  const normalized = JSON.parse(evaluate(
    context,
    'JSON.stringify(normalizeBoardSettings({ daySlots: [3, 1, 3], temperatureSlots: [2], extraDaySlotsHidden: true, dayLabels: { 1: " 첫날 " } }))',
  ));
  assert.deepEqual(normalized, {
    daySlots: [1, 3],
    temperatureSlots: [2],
    extraDaySlotsHidden: true,
    dayLabels: { 1: "첫날" },
  });

  const progress = JSON.parse(evaluate(
    context,
    'JSON.stringify(getBoardCuringProgress({ pourDate: "2020-01-01", entries: { 1: { photoUrl: "x" } }, settings: { daySlots: [1, 2] } }))',
  ));
  assert.deepEqual(progress, { completed: 1, total: 2, complete: false });
});

test("등록 시각은 서버 검증·기기 등록·미검증을 구분한다", () => {
  const context = createAppContext();
  const server = evaluate(context, 'renderUploadedMeta({ photoUrl: "x", verifiedAt: "2020-01-01T00:00:00Z", verifiedAtSource: "server" })');
  const device = evaluate(context, 'renderUploadedMeta({ photoUrl: "x", verifiedAt: "2020-01-01T00:00:00Z", verifiedAtSource: "device" })');
  const pending = evaluate(context, 'renderUploadedMeta({ photoUrl: "x", uploadedAt: "2020-01-01T00:00:00Z" })');
  assert.match(server, /서버 검증/);
  assert.match(device, /서버 검증 아님/);
  assert.match(pending, /서버 검증 전/);
});

test("삭제 표시와 RPC 계약이 코드와 마이그레이션에 함께 존재한다", () => {
  const context = createAppContext();
  assert.equal(evaluate(context, 'isDeletedBoardRecord({ deleted_at: "2026-01-01T00:00:00Z" })'), true);
  assert.match(appSource, /rpc\("save_photo_entry_atomic"/);
  assert.match(appSource, /rpc\("mark_photo_board_deleted"/);
  assert.match(appSource, /rpc\("purge_photo_board"/);

  const migration = fs.readFileSync(
    path.join(root, "supabase", "migrations", "20260723010000_harden_photo_data.sql"),
    "utf8",
  );
  assert.match(migration, /returns jsonb/i);
  assert.match(migration, /old_photo_path/i);
  assert.match(migration, /verifiedAtSource/);
  assert.match(migration, /for update/i);
  assert.match(migration, /security invoker/i);
  assert.match(migration, /curing photo and rainHold cannot coexist/i);
  assert.match(migration, /p_mutate_photo boolean default true/i);
  assert.match(migration, /photo_entries must be changed through save_photo_entry_atomic/i);
  assert.match(migration, /set_config\('app\.photo_entry_atomic_write', 'on', true\)/i);
  assert.match(migration, /photo_entries must be deleted through purge_photo_board/i);
  assert.match(migration, /set_config\('app\.photo_entry_atomic_delete', 'on', true\)/i);
  assert.match(migration, /photo_boards must be deleted through purge_photo_board/i);
  assert.match(migration, /set_config\('app\.photo_board_atomic_delete', 'on', true\)/i);
  assert.match(migration, /notify pgrst, 'reload schema'/i);
});

test("원자 저장 RPC가 없으면 위험한 호환 저장으로 강등하지 않는다", async () => {
  const context = createAppContext();
  evaluate(context, 'dbClient = {}; state.boardId = "00000000-0000-4000-8000-000000000001"; atomicPhotoRpcAvailable = false');
  const result = await evaluate(
    context,
    'persistEntryAtomically(1, PHOTO_TYPES.CURING, {}, { rainHold: true })',
  );
  assert.equal(result.supported, true);
  assert.equal(result.saved, false);
  assert.equal(result.backendUpgradeRequired, true);
  assert.doesNotMatch(appSource, /\.from\("photo_entries"\)[\s\S]{0,500}\.upsert\(/);
});

test("삭제 결과 불명확 상태는 로컬 숨김 처리 전에 중단한다", async () => {
  const context = createAppContext();
  evaluate(
    context,
    'atomicDeleteMarkRpcAvailable = null; dbClient = { rpc: async () => ({ error: { code: "NETWORK", message: "offline" } }) }; fetchCloudBoardDeleteRecord = async () => { throw new Error("offline"); }',
  );
  assert.equal(
    await evaluate(context, 'markCloudBoardDeletedAtomically("00000000-0000-4000-8000-000000000001")'),
    "unknown",
  );
  assert.match(appSource, /markStatus === "unknown"/);
  assert.match(appSource, /deleteResult\.status === "unknown"/);
  assert.match(appSource, /삭제 결과를 확인하지 못했습니다/);
});

test("날짜 입력과 대지 열기 컨트롤은 실제 레이블·버튼이다", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /<label[^>]+for="pourDateInput"/);
  assert.match(appSource, /<button class="board-open-button"/);
  assert.match(appSource, /button\.hidden = hideTemperatureButton/);
  assert.match(appSource, /button\.disabled = hideTemperatureButton/);
  assert.match(html, /styles\.css\?v=20260723-3/);
  assert.match(html, /app\.js\?v=20260723-3/);
});
