const IMG_BASE = "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/";

const PAL_META = {
  "モコロン": { en: "Lamball", image: "SheepBall", element: "無属性", work: ["手作業", "運搬", "牧場"] },
  "ツッパニャン": { en: "Cattiva", image: "PinkCat", element: "無属性", work: ["手作業", "採集", "採掘", "運搬"] },
  "タマコッコ": { en: "Chikipi", image: "ChickenPal", element: "無属性", work: ["採集", "牧場"] },
  "クルリス": { en: "Lifmunk", image: "Carbunclo", element: "草属性", work: ["種まき", "手作業", "採集", "伐採", "製薬"] },
  "キツネビ": { en: "Foxparks", image: "Kitsunebi", element: "炎属性", work: ["火おこし"] },
  "ペンタマ": { en: "Pengullet", image: "Penguin", element: "水属性", work: ["水やり", "手作業", "冷却", "運搬"] },
  "キャプペン": { en: "Penking", image: "CaptainPenguin", element: "水属性", work: ["水やり", "手作業", "採掘", "冷却", "運搬"] },
  "ボルトラ": { en: "Sparkit", image: "ElecCat", element: "雷属性", work: ["発電", "手作業", "運搬"] },
  "ネムラム": { en: "Daedream", image: "DreamDemon", element: "闇属性", work: ["手作業", "採集", "運搬"] },
  "イノボウ": { en: "Rushoar", image: "Boar", element: "地属性", work: ["採掘"] },
  "メルパカ": { en: "Melpaca", image: "Alpaca", element: "無属性", work: ["牧場"] },
  "ツノガミ": { en: "Eikthyrdeer", image: "Deer", element: "無属性", work: ["伐採"] },
  "ホークウィン": { en: "Nitewing", image: "HawkBird", element: "無属性", work: ["採集"] },
  "ヘルゴート": { en: "Incineram", image: "Baphomet", element: "炎属性", work: ["火おこし", "手作業", "採掘", "運搬"] },
  "ササゾー": { en: "Mossanda", image: "GrassPanda", element: "草属性", work: ["種まき", "手作業", "伐採", "運搬"] },
  "ビーナイト": { en: "Beegarde", image: "SoldierBee", element: "草属性", work: ["種まき", "手作業", "採集", "伐採", "製薬", "運搬", "牧場"] },
  "クインビーナ": { en: "Elizabee", image: "QueenBee", element: "草属性", work: ["種まき", "手作業", "採集", "伐採", "製薬"] },
  "オコチョ": { en: "Chillet", image: "WeaselDragon", element: "氷属性", work: ["採集", "冷却"] },
  "モモチョ": { en: "Chillet Ignis", image: "WeaselDragonFire", element: "炎属性", work: ["火おこし", "採集"] },
  "ライコーン": { en: "Univolt", image: "Kirin", element: "雷属性", work: ["発電", "伐採"] },
  "イヌズマ": { en: "Rayhound", image: "ThunderDog", element: "雷属性", work: ["発電"] },
  "シラヌイ": { en: "Kitsun", image: "AmaterasuWolf", element: "炎属性", work: ["火おこし"] },
  "ニャンバット": { en: "Tombat", image: "CatBat", element: "闇属性", work: ["採集", "採掘", "運搬"] },
  "ラブマンダー": { en: "Lovander", image: "PinkLizard", element: "無属性", work: ["手作業", "採掘", "製薬", "運搬"] },
  "ツジギリ": { en: "Bushi", image: "Ronin", element: "炎属性", work: ["火おこし", "手作業", "採集", "伐採", "運搬"] },
  "ライバード": { en: "Beakon", image: "ThunderBird", element: "雷属性", work: ["発電", "採集", "運搬"] },
  "イグニクス": { en: "Ragnahawk", image: "RedArmorBird", element: "炎属性", work: ["火おこし", "運搬"] },
  "クレメーオ": { en: "Katress", image: "CatMage", element: "闇属性", work: ["手作業", "製薬", "運搬"] },
  "フォレーナ": { en: "Wixen", image: "FoxMage", element: "炎属性", work: ["火おこし", "手作業", "運搬"] },
  "ラベロット": { en: "Verdash", image: "GrassRabbitMan", element: "草属性", work: ["種まき", "手作業", "採集", "伐採", "運搬"] },
  "ペコドン": { en: "Relaxaurus", image: "LazyDragon", element: "竜属性", work: ["水やり", "運搬"] },
  "パリピドン": { en: "Relaxaurus Lux", image: "LazyDragonElectric", element: "竜属性", work: ["発電", "運搬"] },
  "ラブラドン": { en: "Broncherry", image: "SakuraSaurus", element: "草属性", work: ["種まき"] },
  "スプラドン": { en: "Broncherry Aqua", image: "SakuraSaurusWater", element: "水属性", work: ["水やり"] },
  "アヌビス": { en: "Anubis", image: "Anubis", element: "地属性", work: ["手作業", "採掘", "運搬"] },
  "レヴィドラ": { en: "Jormuntide", image: "Umihebi", element: "竜属性", work: ["水やり"] },
  "アグニドラ": { en: "Jormuntide Ignis", image: "UmihebiFire", element: "竜属性", work: ["火おこし"] },
  "スザク": { en: "Suzaku", image: "Suzaku", element: "炎属性", work: ["火おこし"] },
  "シヴァ": { en: "Suzaku Aqua", image: "SuzakuWater", element: "水属性", work: ["水やり"] },
  "エレパンダ": { en: "Grizzbolt", image: "ElecPanda", element: "雷属性", work: ["発電", "手作業", "伐採", "運搬"] },
  "ホルス": { en: "Faleris", image: "Horus", element: "炎属性", work: ["火おこし", "運搬"] },
  "デスティング": { en: "Menasting", image: "DarkScorpion", element: "闇属性", work: ["伐採", "採掘"] },
  "ボルカノン": { en: "Blazamut", image: "VolcanicMonster", element: "炎属性", work: ["火おこし", "採掘"] },
  "ゼノグリフ": { en: "Shadowbeak", image: "BlackGriffon", element: "闇属性", work: ["採集"] },
};

const EN_TO_JP = Object.fromEntries(Object.entries(PAL_META).flatMap(([jp, meta]) => [
  [meta.en.toLowerCase(), jp],
  [meta.en.replace(/\s+/g, "").toLowerCase(), jp]
]));

const PAL_NAMES = Object.keys(PAL_META).sort((a, b) => a.localeCompare(b, "ja"));
const ROOM_ID = getRoomId();
const SAMPLE_PREFIX = "sample-";

const state = {
  records: [],
  selectedId: null,
  firebaseReady: false,
  db: null,
  dbApi: null,
  dbRef: null,
};

const $ = (id) => document.getElementById(id);
const elements = {
  parentFilter: $("parentFilter"),
  resultFilter: $("resultFilter"),
  elementFilter: $("elementFilter"),
  workFilter: $("workFilter"),
  statusFilter: $("statusFilter"),
  favoriteOnly: $("favoriteOnly"),
  unverifiedOnly: $("unverifiedOnly"),
  searchInput: $("searchInput"),
  sortSelect: $("sortSelect"),
  recordRows: $("recordRows"),
  emptyState: $("emptyState"),
  emptyTitle: $("emptyTitle"),
  emptyText: $("emptyText"),
  detailBody: $("detailBody"),
  recordDialog: $("recordDialog"),
  recordForm: $("recordForm"),
  toast: $("toast"),
};

init();

async function init() {
  setupPalOptions();
  setupEvents();
  await setupStorage();
  render();
}

function getRoomId() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  const fromHash = params.get("room");
  if (fromHash) return sanitizeRoom(fromHash);
  const existing = localStorage.getItem("palBoardRoomId");
  if (existing) {
    history.replaceState(null, "", `#room=${existing}`);
    return existing;
  }
  const created = `room-${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem("palBoardRoomId", created);
  history.replaceState(null, "", `#room=${created}`);
  return created;
}

function sanitizeRoom(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60) || "default";
}

function setupPalOptions() {
  const datalist = $("palOptions");
  datalist.innerHTML = PAL_NAMES.map(name => `<option value="${escapeHtml(name)}"></option>`).join("");
  const options = [`<option value="">すべて</option>`, ...PAL_NAMES.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)].join("");
  elements.parentFilter.innerHTML = options;
  elements.resultFilter.innerHTML = options;
}

function setupEvents() {
  [elements.parentFilter, elements.resultFilter, elements.elementFilter, elements.workFilter, elements.statusFilter, elements.favoriteOnly, elements.unverifiedOnly, elements.searchInput, elements.sortSelect]
    .forEach(el => el.addEventListener("input", render));

  $("clearFilters").addEventListener("click", () => {
    elements.parentFilter.value = "";
    elements.resultFilter.value = "";
    elements.elementFilter.value = "";
    elements.workFilter.value = "";
    elements.statusFilter.value = "";
    elements.favoriteOnly.checked = false;
    elements.unverifiedOnly.checked = false;
    elements.searchInput.value = "";
    render();
  });

  $("addRecord").addEventListener("click", () => openDialog());
  $("cancelDialog").addEventListener("click", () => elements.recordDialog.close());
  $("closeDetail").addEventListener("click", () => { state.selectedId = null; render(); });
  $("copyRoomLink").addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#room=${ROOM_ID}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("共有リンクをコピーしました");
    } catch {
      prompt("このURLを友人に共有してください", url);
    }
  });

  elements.recordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveFromForm();
  });

  $("deleteRecord").addEventListener("click", async () => {
    const id = $("recordId").value;
    if (!id) return;
    if (!confirm("この配合記録を削除しますか？")) return;
    await deleteRecord(id);
    elements.recordDialog.close();
  });
}

async function setupStorage() {
  const config = window.firebaseConfig;
  if (config?.apiKey && config?.databaseURL) {
    try {
      const appMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
      const dbMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js");
      const app = appMod.initializeApp(config);
      state.db = dbMod.getDatabase(app);
      state.dbApi = dbMod;
      state.dbRef = dbMod.ref(state.db, `rooms/${ROOM_ID}/records`);
      dbMod.onValue(state.dbRef, async (snapshot) => {
        const value = snapshot.val() || {};
        const entries = Object.entries(value);
        const sampleIds = entries.filter(([id]) => id.startsWith(SAMPLE_PREFIX)).map(([id]) => id);
        const realEntries = entries.filter(([id]) => !id.startsWith(SAMPLE_PREFIX));
        state.records = realEntries.map(([id, record]) => normalizeRecord({ ...record, id })).filter(Boolean);
        state.firebaseReady = true;
        updateConnectionState("共同編集ON", true);
        ensureSelected();
        render();

        if (sampleIds.length) {
          await Promise.all(sampleIds.map(id => dbMod.remove(dbMod.ref(state.db, `rooms/${ROOM_ID}/records/${id}`))));
          toast("以前のサンプル記録を削除しました");
        }
      }, (error) => {
        console.warn("Firebase read failed:", error);
        updateConnectionState("接続エラー", false);
        toast("Firebaseの読み込み権限を確認してください。", true);
      });
      return;
    } catch (error) {
      console.warn("Firebase setup failed:", error);
      updateConnectionState("ローカル保存", false);
      toast("Firebase設定を確認してください。ローカル保存で起動します。", true);
    }
  }

  const saved = localStorage.getItem(localKey());
  const localRecords = saved ? JSON.parse(saved) : [];
  state.records = localRecords.map(normalizeRecord).filter(record => record && !record.id.startsWith(SAMPLE_PREFIX));
  if (localRecords.length !== state.records.length) persistLocal();
  updateConnectionState("ローカル保存", false);
  ensureSelected();
}

function updateConnectionState(text, online) {
  const el = $("connectionState");
  el.innerHTML = `<span class="live-dot" style="background:${online ? "#39ce64" : "#ffb02e"}; box-shadow:0 0 0 4px ${online ? "rgba(57,206,100,.18)" : "rgba(255,176,46,.2)"}"></span>${text}`;
}

function localKey() { return `pal-breeding-records:${ROOM_ID}`; }
function persistLocal() { localStorage.setItem(localKey(), JSON.stringify(state.records)); }

function normalizeRecord(record) {
  if (!record) return null;
  return {
    id: record.id || crypto.randomUUID(),
    parentA: normalizePalName(record.parentA),
    parentB: normalizePalName(record.parentB),
    resultPal: normalizePalName(record.resultPal),
    passives: Array.isArray(record.passives) ? record.passives.map(String).map(s => s.trim()).filter(Boolean) : splitTags(record.passives),
    status: record.status || "確認中",
    recorder: record.recorder || "福冨",
    note: record.note || "",
    gameVersion: record.gameVersion || "",
    favorite: Boolean(record.favorite),
    checked: {
      bred: Boolean(record.checked?.bred),
      screenshot: Boolean(record.checked?.screenshot),
      passive: Boolean(record.checked?.passive),
      battle: Boolean(record.checked?.battle)
    },
    updatedAt: Number(record.updatedAt || Date.now())
  };
}

function normalizePalName(name) {
  const raw = String(name || "").trim();
  if (!raw) return "";
  if (PAL_META[raw]) return raw;
  return EN_TO_JP[raw.toLowerCase()] || EN_TO_JP[raw.replace(/\s+/g, "").toLowerCase()] || raw;
}

function stripId(record) { const { id, ...rest } = record; return rest; }

function ensureSelected() {
  if (!state.selectedId && state.records.length) state.selectedId = state.records[0].id;
  if (state.selectedId && !state.records.some(r => r.id === state.selectedId)) state.selectedId = state.records[0]?.id || null;
}

function render() {
  const filtered = getFilteredRecords();
  renderKpis();
  renderRows(filtered);
  renderDetail();
}

function getFilteredRecords() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const parent = elements.parentFilter.value;
  const result = elements.resultFilter.value;
  const element = elements.elementFilter.value;
  const work = elements.workFilter.value;
  const status = elements.statusFilter.value;
  let records = [...state.records];

  records = records.filter(record => {
    const meta = PAL_META[record.resultPal] || {};
    const englishNames = [record.parentA, record.parentB, record.resultPal].map(name => PAL_META[name]?.en || "");
    const searchTarget = [record.parentA, record.parentB, record.resultPal, ...englishNames, record.recorder, record.note, record.status, record.gameVersion, ...record.passives].join(" ").toLowerCase();
    return (!query || searchTarget.includes(query)) &&
      (!parent || record.parentA === parent || record.parentB === parent) &&
      (!result || record.resultPal === result) &&
      (!element || meta.element === element) &&
      (!work || (meta.work || []).includes(work)) &&
      (!status || record.status === status) &&
      (!elements.favoriteOnly.checked || record.favorite) &&
      (!elements.unverifiedOnly.checked || record.status !== "実機確認済み");
  });

  const sort = elements.sortSelect.value;
  records.sort((a, b) => {
    if (sort === "updatedAsc") return a.updatedAt - b.updatedAt;
    if (sort === "resultAsc") return a.resultPal.localeCompare(b.resultPal, "ja");
    if (sort === "statusAsc") return a.status.localeCompare(b.status, "ja");
    return b.updatedAt - a.updatedAt;
  });
  return records;
}

function renderKpis() {
  const total = state.records.length;
  const verified = state.records.filter(r => r.status === "実機確認済み").length;
  const candidates = state.records.filter(r => r.status === "育成候補").length;
  const memos = state.records.filter(r => r.note.trim()).length;
  $("totalCount").textContent = `${total}件`;
  $("verifiedCount").textContent = `${verified}件`;
  $("candidateCount").textContent = `${candidates}件`;
  $("memoCount").textContent = `${memos}件`;
  $("verifiedRate").textContent = total ? `${Math.round((verified / total) * 100)}%` : "0%";
}

function renderRows(records) {
  const isEmpty = records.length === 0;
  elements.emptyState.hidden = !isEmpty;
  if (isEmpty) {
    if (state.records.length === 0) {
      elements.emptyTitle.textContent = "まだ配合記録がありません";
      elements.emptyText.textContent = "「新しい配合記録を追加」から、友人と記録を始めてください。";
    } else {
      elements.emptyTitle.textContent = "条件に合う記録がありません";
      elements.emptyText.textContent = "絞り込み条件を変更してください。";
    }
  }

  elements.recordRows.innerHTML = records.map(record => {
    const selected = record.id === state.selectedId ? "selected" : "";
    return `
      <tr class="${selected}" data-id="${record.id}">
        <td class="favorite-cell"><button class="star-button ${record.favorite ? "is-favorite" : ""}" data-action="favorite" title="お気に入り">★</button></td>
        <td>${palInline(record.parentA)}</td>
        <td>${palInline(record.parentB)}</td>
        <td>${palInline(record.resultPal)}</td>
        <td><div class="tag-list">${renderTags(record.passives)}</div></td>
        <td>${statusBadge(record.status)}</td>
        <td><span class="recorder-cell"><span class="tiny-avatar">${escapeHtml(record.recorder.slice(0, 1) || "?")}</span>${escapeHtml(record.recorder)}</span></td>
        <td class="memo-cell" title="${escapeHtml(record.note)}">${escapeHtml(record.note || "—")}</td>
        <td>${formatDate(record.updatedAt)}</td>
      </tr>`;
  }).join("");

  elements.recordRows.querySelectorAll("tr").forEach(row => {
    row.addEventListener("click", (event) => {
      const id = row.dataset.id;
      if (event.target.closest("[data-action='favorite']")) {
        toggleFavorite(id);
        return;
      }
      state.selectedId = id;
      render();
    });
    row.addEventListener("dblclick", () => openDialog(row.dataset.id));
  });
}

function renderDetail() {
  const record = state.records.find(r => r.id === state.selectedId);
  if (!record) {
    elements.detailBody.innerHTML = `<div class="info-hint">一覧から配合記録を選択すると、親パル・結果パル・パッシブ候補・確認チェックをここで確認できます。</div>`;
    return;
  }
  elements.detailBody.innerHTML = `
    <div class="recipe-line">
      ${recipePal("親A", record.parentA)}
      <div class="recipe-symbol">＋</div>
      ${recipePal("親B", record.parentB)}
      <div class="recipe-symbol">→</div>
      ${recipePal("結果", record.resultPal)}
    </div>
    <div class="detail-section"><h3>パッシブ候補</h3><div class="tag-list">${renderTags(record.passives)}<span class="tag">＋候補を追加</span></div></div>
    <div class="detail-section"><h3>メモ</h3><div class="note-box">${escapeHtml(record.note || "メモはまだありません。")}</div></div>
    <div class="detail-section"><h3>確認チェックリスト</h3><div class="check-list">
      ${checkLine(record.checked.bred, "実際に配合済み")}
      ${checkLine(record.checked.screenshot, "スクリーンショット確認")}
      ${checkLine(record.checked.passive, "パッシブ継承確認")}
      ${checkLine(record.checked.battle, "実戦・拠点性能確認")}
    </div></div>
    <div class="detail-section"><h3>記録情報</h3>
      <p>${statusBadge(record.status)}</p>
      <p><strong>記録者：</strong>${escapeHtml(record.recorder)}</p>
      <p><strong>ゲーム版：</strong>${escapeHtml(record.gameVersion || "未入力")}</p>
      <p><strong>更新日時：</strong>${formatDate(record.updatedAt, true)}</p>
    </div>
    <div class="detail-actions"><button class="secondary-button" data-detail-action="delete" type="button">削除</button><button class="primary-button" data-detail-action="edit" type="button">編集する</button></div>`;

  elements.detailBody.querySelector("[data-detail-action='edit']")?.addEventListener("click", () => openDialog(record.id));
  elements.detailBody.querySelector("[data-detail-action='delete']")?.addEventListener("click", async () => {
    if (!confirm("この配合記録を削除しますか？")) return;
    await deleteRecord(record.id);
  });
}

function palInline(name) {
  return `<span class="pal-inline">${palIcon(name)}<span>${escapeHtml(name || "未入力")}</span></span>`;
}

function recipePal(label, name) {
  return `<div class="recipe-pal"><small>${label}</small>${palIcon(name)}<span>${escapeHtml(name || "未入力")}</span></div>`;
}

function palIcon(name) {
  const meta = PAL_META[name];
  if (!meta) return `<span class="pal-icon"><span class="pal-fallback">${escapeHtml((name || "?").slice(0, 1))}</span></span>`;
  const url = `${IMG_BASE}T_${meta.image}_icon_normal.webp`;
  return `<span class="pal-icon" title="${escapeHtml(`${name} / ${meta.en}`)}"><img src="${url}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'pal-fallback',textContent:'${escapeHtml(name.slice(0,1))}'}))"></span>`;
}

function renderTags(tags) {
  if (!tags?.length) return `<span class="tag">未設定</span>`;
  return tags.map(tag => `<span class="tag ${tagType(tag)}">${escapeHtml(tag)}</span>`).join("");
}

function tagType(tag) {
  if (["職人気質", "まじめ", "社畜", "ワーカーホリック", "発電特化", "運搬", "採掘", "伐採", "拠点"].some(key => tag.includes(key))) return "work";
  if (["脳筋", "獰猛", "希少", "伝説", "走るのが得意", "神速", "すばしこい"].some(key => tag.includes(key))) return "battle";
  return "";
}

function statusBadge(status) {
  const className = status === "実機確認済み" ? "status-verified" : status === "育成候補" ? "status-candidate" : "status-pending";
  const icon = status === "実機確認済み" ? "✓" : status === "育成候補" ? "★" : "…";
  return `<span class="status-badge ${className}">${icon} ${escapeHtml(status)}</span>`;
}

function checkLine(checked, text) { return `<label><input type="checkbox" ${checked ? "checked" : ""} disabled /> ${escapeHtml(text)}</label>`; }

function openDialog(id = null) {
  const record = id ? state.records.find(r => r.id === id) : null;
  $("dialogTitle").textContent = record ? "配合記録を編集" : "新しい配合記録";
  $("recordId").value = record?.id || "";
  $("parentA").value = record?.parentA || "";
  $("parentB").value = record?.parentB || "";
  $("resultPal").value = record?.resultPal || "";
  $("recorder").value = record?.recorder || "福冨";
  $("status").value = record?.status || "確認中";
  $("gameVersion").value = record?.gameVersion || "";
  $("passives").value = record?.passives?.join(", ") || "";
  $("note").value = record?.note || "";
  $("checkedBred").checked = Boolean(record?.checked?.bred);
  $("checkedScreenshot").checked = Boolean(record?.checked?.screenshot);
  $("checkedPassive").checked = Boolean(record?.checked?.passive);
  $("checkedBattle").checked = Boolean(record?.checked?.battle);
  $("deleteRecord").style.visibility = record ? "visible" : "hidden";
  elements.recordDialog.showModal();
}

async function saveFromForm() {
  const id = $("recordId").value || crypto.randomUUID();
  const existing = state.records.find(r => r.id === id);
  const record = normalizeRecord({
    id,
    parentA: $("parentA").value.trim(),
    parentB: $("parentB").value.trim(),
    resultPal: $("resultPal").value.trim(),
    recorder: $("recorder").value.trim() || "福冨",
    status: $("status").value,
    gameVersion: $("gameVersion").value.trim(),
    passives: splitTags($("passives").value),
    note: $("note").value.trim(),
    favorite: existing?.favorite || false,
    checked: {
      bred: $("checkedBred").checked,
      screenshot: $("checkedScreenshot").checked,
      passive: $("checkedPassive").checked,
      battle: $("checkedBattle").checked
    },
    updatedAt: Date.now()
  });

  if (!PAL_META[record.parentA] || !PAL_META[record.parentB] || !PAL_META[record.resultPal]) {
    const ok = confirm("入力されたパル名の一部が候補リストにありません。このまま保存しますか？");
    if (!ok) return;
  }

  const index = state.records.findIndex(r => r.id === id);
  if (index >= 0) state.records[index] = record;
  else state.records.unshift(record);
  state.selectedId = id;
  await persistRecord(record);
  elements.recordDialog.close();
  toast("配合記録を保存しました");
  render();
}

async function persistRecord(record) {
  if (state.firebaseReady && state.dbApi && state.db) {
    await state.dbApi.set(state.dbApi.ref(state.db, `rooms/${ROOM_ID}/records/${record.id}`), stripId(record));
  } else {
    persistLocal();
  }
}

async function deleteRecord(id) {
  state.records = state.records.filter(r => r.id !== id);
  ensureSelected();
  if (state.firebaseReady && state.dbApi && state.db) {
    await state.dbApi.remove(state.dbApi.ref(state.db, `rooms/${ROOM_ID}/records/${id}`));
  } else {
    persistLocal();
  }
  toast("配合記録を削除しました");
  render();
}

async function toggleFavorite(id) {
  const record = state.records.find(r => r.id === id);
  if (!record) return;
  record.favorite = !record.favorite;
  record.updatedAt = Date.now();
  await persistRecord(record);
  render();
}

function splitTags(value) {
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  return String(value || "").split(/[,、]/).map(s => s.trim()).filter(Boolean);
}

function formatDate(timestamp, detail = false) {
  const date = new Date(Number(timestamp));
  const opt = detail ? { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" } : { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
  return new Intl.DateTimeFormat("ja-JP", opt).format(date);
}

function toast(message, warn = false) {
  elements.toast.textContent = message;
  elements.toast.style.background = warn ? "rgba(138, 89, 0, .94)" : "rgba(23, 48, 74, .94)";
  elements.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => elements.toast.classList.remove("show"), 2800);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
}
