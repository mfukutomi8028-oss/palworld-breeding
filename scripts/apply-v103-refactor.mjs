import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}
function write(path, content) {
  fs.writeFileSync(path, content);
}
function replaceOnce(content, search, replacement, label) {
  const index = content.indexOf(search);
  if (index < 0) throw new Error(`Replacement target not found: ${label}`);
  if (content.indexOf(search, index + search.length) >= 0) throw new Error(`Replacement target is not unique: ${label}`);
  return content.slice(0, index) + replacement + content.slice(index + search.length);
}
function replaceRegexOnce(content, pattern, replacement, label) {
  const matches = [...content.matchAll(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`))];
  if (matches.length !== 1) throw new Error(`Expected one regex match for ${label}, got ${matches.length}`);
  return content.replace(pattern, replacement);
}

let core = read("app-core.js");
core = replaceOnce(core, 'const VERSION = "101";', 'const VERSION = "103";', "site version");
core = replaceOnce(core, 'const DATA_VERSION = "Palworld 1.0 / PalCalc engine 2026-07-19 (299 forms・164 unique combos)";', 'const DATA_VERSION = "Palworld 1.0 / local snapshot 2026-08-05 (299 forms・164 unique combos)";', "data version");
core = replaceOnce(core, 'const UNKNOWN_PAL_ICON = "assets/unknown-pal-v8.png";', 'const UNKNOWN_PAL_ICON = "assets/unknown-pal-v8.svg";', "unknown Pal icon");
core = replaceOnce(core, "async function loadPalData(){", "async function loadLegacyPalData(){", "legacy loader rename");
write("app-core.js", core);

let records = read("app-records.js");
records = replaceOnce(records, "function palImageAttrs(", "function legacyPalImageAttrs(", "legacy palImageAttrs rename");
records = replaceOnce(records, "function palChip(", "function legacyPalChip(", "legacy palChip rename");
records = replaceRegexOnce(
  records,
  /function renderConnectionStates\(\)\{[\s\S]*?\}\nfunction renderHeader/,
  `function renderConnectionStates(){const connection=byId("connectionState");connection.className="connection"+(state.firebaseState==="online"?" is-online":state.firebaseState==="error"?" is-error":"");connection.innerHTML=\`<i></i><span>\${state.firebaseState==="online"?"共同編集ON":state.firebaseState==="error"?"接続エラー":state.firebaseState==="local"?"ローカル保存":"接続中"}</span>\`;const badge=byId("dataBadge");const coreReady=["ready","cache"].includes(state.dataState);const imageIssue=["partial","error"].includes(state.imageDataState);badge.className="data-badge"+(coreReady?" is-ready":state.dataState==="error"?" is-error":"");const label=state.dataState==="error"?"配合データ取得失敗":imageIssue?"画像データ一部取得失敗":state.dataState==="cache"||state.imageDataState==="cache"?"保存済み1.0データ":"1.0データ準備完了";badge.innerHTML=\`<i></i><span>\${label}</span>\`;badge.title=state.dataError||label;}\nfunction renderHeader`,
  "connection state renderer",
);
write("app-records.js", records);

let review = read("app-review.js");
review = replaceRegexOnce(
  review,
  /function renderSystemStatus\(\)\{[\s\S]*?\}\nfunction selectUser/,
  `function renderSystemStatus(){const imageStatus=state.imageDataState==="ready"?\`\${state.iconVerifiedCount||0}体 / ローカル画像\`:state.imageDataState==="cache"?\`\${state.iconVerifiedCount||0}体 / 保存済み画像\`:state.imageDataState==="partial"?\`一部未照合（\${state.iconVerifiedCount||0}体）\`:state.imageDataState==="error"?"画像取得失敗・代替画像を使用":"準備中";byId("systemStatus").innerHTML=[["共同編集",state.firebaseState==='online'?"Firebase接続中":state.firebaseState==='local'?"ローカル保存":"接続確認中"],["パルデータ",state.pals.length?\`\${state.pals.length}体 / \${state.dataState}\`:"取得失敗"],["画像データ",imageStatus],["配合マトリクス",state.matrixReady?\`\${state.matrix.size.toLocaleString()}組を準備済み\`:"準備中"],["ルームID",state.roomId],["サイト版",\`v\${VERSION}\`],["データ版",DATA_VERSION]].map(([l,v])=>\`<div class="system-status__item"><span>\${l}</span><strong>\${escapeHtml(v)}</strong></div>\`).join('');}\nfunction selectUser`,
  "system status renderer",
);
write("app-review.js", review);

let actions = read("app-actions.js");
actions = replaceOnce(
  actions,
  "byId('clearLocalCache').addEventListener('click',()=>{localStorage.removeItem(CACHE_KEYS.pals);localStorage.removeItem(CACHE_KEYS.localization);location.reload();});",
  "byId('clearLocalCache').addEventListener('click',()=>{clearPalDataCaches();location.reload();});",
  "data cache clear action",
);
write("app-actions.js", actions);

let index = read("index.html");
index = index.replaceAll("?v=102", "?v=103").replace('src="pal-images.js?v=103"', 'src="app-data.js?v=103"');
if (!index.includes('src="app-data.js?v=103"') || index.includes("pal-images.js")) throw new Error("index data runtime replacement failed");
write("index.html", index);

let config = read("config.js");
config = replaceOnce(config, 'window.palSiteVersion = "101";', 'window.palSiteVersion = "103";', "config version");
write("config.js", config);

for (const path of ["pal-images.js", "test.txt", ".github/workflows/refactor-v103.yml", "scripts/apply-v103-refactor.mjs"]) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
