const PAL_SOURCE_URL = "https://palworld-lab.com/pals/";
const PAL_SOURCE_PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(PAL_SOURCE_URL)}`;
const PAL_CACHE_KEY = "pal-breeding-board:palworld-lab-pals:v4";
const SAMPLE_PREFIX = "sample-";

const WORKS = ["火おこし", "水やり", "種まき", "発電", "手作業", "採集", "伐採", "採掘", "製薬", "冷却", "運搬", "牧場"];
const ELEMENTS = ["無属性", "炎属性", "水属性", "草属性", "雷属性", "氷属性", "地属性", "闇属性", "竜属性"];
const EXCLUDED_IMAGE_ALTS = new Set([
  ...ELEMENTS,
  ...WORKS,
  "X", "ポスト", "URLコピー", "テーマの選択", "ダーク", "ライト", "自動",
  "パルワールド配合・攻略ラボ", "火おこし", "水やり", "種まき", "発電", "手作業", "採集", "伐採", "採掘", "製薬", "冷却", "運搬", "牧場"
]);

// 起動直後・外部取得失敗時の最低限の内蔵データ。
// Palworld Labの画像URLが分かっているものは優先して使う。
const EMBEDDED_PALS = [
  { no: "001", name: "モコロン", en: "Lamball", elements: ["無属性"], work: ["手作業", "運搬", "牧場"], icon: "https://palworld-lab.com/_astro/001.DJmpYbIq_1vhnwH.webp" },
  { no: "002", name: "ツッパニャン", en: "Cattiva", elements: ["無属性"], work: ["手作業", "採集", "採掘", "運搬"], icon: "https://palworld-lab.com/_astro/002.CqEJyq_i_6gvU0.webp" },
  { no: "003", name: "タマコッコ", en: "Chikipi", elements: ["無属性"], work: ["採集", "牧場"], icon: "https://palworld-lab.com/_astro/003.DmHGHkzB_1XPiUh.webp" },
  { no: "004", name: "クルリス", en: "Lifmunk", elements: ["草属性"], work: ["種まき", "手作業", "採集", "伐採", "製薬"], icon: "https://palworld-lab.com/_astro/004.Cnnye9S1_GBlpx.webp" },
  { no: "005", name: "キツネビ", en: "Foxparks", elements: ["炎属性"], work: ["火おこし"], icon: "https://palworld-lab.com/_astro/005.De-0Pa55_LYewp.webp" },
  { no: "006", name: "カモノスケ", en: "Fuack", elements: ["水属性"], work: ["水やり", "手作業", "運搬"], iconKey: "ColorfulBird" },
  { no: "007", name: "ボルトラ", en: "Sparkit", elements: ["雷属性"], work: ["発電", "手作業", "運搬"], iconKey: "ElecCat" },
  { no: "008", name: "エテッパ", en: "Tanzee", elements: ["草属性"], work: ["種まき", "手作業", "採集", "伐採", "運搬"], iconKey: "Monkey" },
  { no: "009", name: "ヒノコジカ", en: "Rooby", elements: ["炎属性"], work: ["火おこし"], iconKey: "FlameDeer" },
  { no: "010", name: "ペンタマ", en: "Pengullet", elements: ["水属性", "氷属性"], work: ["水やり", "手作業", "冷却", "運搬"], icon: "https://palworld-lab.com/_astro/010.DQvWPP3E_2oiW8l.webp" },
  { no: "011", name: "キャプペン", en: "Penking", elements: ["水属性", "氷属性"], work: ["水やり", "手作業", "採掘", "冷却", "運搬"], icon: "https://palworld-lab.com/_astro/011.Cqis32qe_Z13PKJd.webp" },
  { no: "012", name: "パチグリ", en: "Jolthog", elements: ["雷属性"], work: ["発電"], iconKey: "Hedgehog" },
  { no: "013", name: "ナエモチ", en: "Gumoss", elements: ["草属性", "地属性"], work: ["種まき"], iconKey: "PlantSlime" },
  { no: "014", name: "タマモ", en: "Vixy", elements: ["無属性"], work: ["採集", "牧場"], iconKey: "CuteFox" },
  { no: "015", name: "ホウロック", en: "Hoocrates", elements: ["闇属性"], work: ["採集"], iconKey: "Owl" },
  { no: "016", name: "チョロゾウ", en: "Teafant", elements: ["水属性"], work: ["水やり"], iconKey: "Elephant" },
  { no: "017", name: "ンダコアラ", en: "Depresso", elements: ["闇属性"], work: ["手作業", "採掘", "運搬"], iconKey: "NegativeKoala" },
  { no: "018", name: "ミルカルビ", en: "Mozzarina", elements: ["無属性"], work: ["牧場"], iconKey: "CowPal" },
  { no: "019", name: "イノボウ", en: "Rushoar", elements: ["地属性"], work: ["採掘"], iconKey: "Boar" },
  { no: "020", name: "ルナティ", en: "Nox", elements: ["闇属性"], work: ["採集"], iconKey: "NaughtyCat" },
  { no: "031", name: "シャーキッド", en: "Gobfin", elements: ["水属性"], work: ["水やり", "手作業", "運搬"], iconKey: "SharkKid" },
  { no: "032", name: "シメナワ", en: "Hangyu", elements: ["地属性"], work: ["手作業", "採集", "運搬"], iconKey: "WindChimes" },
  { no: "033", name: "ササゾー", en: "Mossanda", elements: ["草属性"], work: ["種まき", "手作業", "伐採", "運搬"], icon: "https://palworld-lab.com/_astro/033.CO0kQvDM_Z1mep1i.webp", iconKey: "GrassPanda" },
  { no: "034", name: "メリポップ", en: "Woolipop", elements: ["無属性"], work: ["牧場"], iconKey: "SweetsSheep" },
  { no: "035", name: "ベリゴート", en: "Caprity", elements: ["草属性"], work: ["種まき", "牧場"], iconKey: "BerryGoat" },
  { no: "036", name: "メルパカ", en: "Melpaca", elements: ["無属性"], work: ["牧場"], iconKey: "Alpaca" },
  { no: "037", name: "ツノガミ", en: "Eikthyrdeer", elements: ["無属性"], work: ["伐採"], iconKey: "Deer" },
  { no: "038", name: "ホークウィン", en: "Nitewing", elements: ["無属性"], work: ["採集"], iconKey: "HawkBird" },
  { no: "040", name: "ヘルゴート", en: "Incineram", elements: ["炎属性", "闇属性"], work: ["火おこし", "手作業", "採掘", "運搬"], iconKey: "Baphomet" },
  { no: "041", name: "パピテフ", en: "Cinnamoth", elements: ["草属性"], work: ["種まき", "製薬"], iconKey: "FlowerDinosaur" },
  { no: "042", name: "アルパオー", en: "Arsox", elements: ["炎属性"], work: ["火おこし", "伐採"], iconKey: "FlameBuffalo" },
  { no: "043", name: "ニャンバット", en: "Tombat", elements: ["闇属性"], work: ["採集", "採掘", "運搬"], iconKey: "CatBat" },
  { no: "044", name: "ラブマンダー", en: "Lovander", elements: ["無属性"], work: ["手作業", "採掘", "製薬", "運搬"], iconKey: "PinkLizard" },
  { no: "045", name: "ボルゼクス", en: "Beakon", elements: ["雷属性"], work: ["発電", "採集", "運搬"], iconKey: "ThunderBird" },
  { no: "055", name: "オコチョ", en: "Chillet", elements: ["氷属性", "竜属性"], work: ["採集", "冷却"], icon: "https://palworld-lab.com/_astro/055.C3DznTNK_Z1ESlKf.webp" },
  { no: "055B", name: "モモチョ", en: "Chillet Ignis", elements: ["炎属性", "竜属性"], work: ["火おこし", "採集"], iconKey: "WeaselDragonFire" },
  { no: "056", name: "ライコーン", en: "Univolt", elements: ["雷属性"], work: ["発電", "伐採"], iconKey: "Kirin" },
  { no: "057", name: "フブキツネ", en: "Foxcicle", elements: ["氷属性"], work: ["冷却"], iconKey: "IceFox" },
  { no: "058", name: "サラブレイズ", en: "Pyrin", elements: ["炎属性"], work: ["火おこし", "伐採"], iconKey: "FireKirin" },
  { no: "059", name: "イヌズマ", en: "Rayhound", elements: ["雷属性"], work: ["発電"], iconKey: "ThunderDog" },
  { no: "060", name: "シラヌイ", en: "Kitsun", elements: ["炎属性"], work: ["火おこし"], iconKey: "AmaterasuWolf" },
  { no: "061", name: "マスクロウ", en: "Leezpunk", elements: ["闇属性"], work: ["手作業", "採集", "運搬"], iconKey: "LizardMan" },
  { no: "064", name: "フラリーナ", en: "Petallia", elements: ["草属性"], work: ["種まき", "手作業", "採集", "製薬", "運搬"], iconKey: "LilyQueen" },
  { no: "065", name: "ラベロット", en: "Verdash", elements: ["草属性"], work: ["種まき", "手作業", "採集", "伐採", "運搬"], iconKey: "GrassRabbitMan" },
  { no: "067", name: "ドリタス", en: "Digtoise", elements: ["地属性"], work: ["採掘"], iconKey: "DrillGame" },
  { no: "070", name: "フラリーナ", en: "Petallia", elements: ["草属性"], work: ["種まき", "手作業", "採集", "製薬", "運搬"], iconKey: "LilyQueen" },
  { no: "071", name: "カバネドリ", en: "Vanwyrm", elements: ["炎属性", "闇属性"], work: ["火おこし", "運搬"], iconKey: "BirdDragon" },
  { no: "072", name: "ビーナイト", en: "Beegarde", elements: ["草属性"], work: ["種まき", "手作業", "採集", "伐採", "製薬", "運搬", "牧場"], iconKey: "SoldierBee" },
  { no: "073", name: "クインビーナ", en: "Elizabee", elements: ["草属性"], work: ["種まき", "手作業", "採集", "伐採", "製薬"], iconKey: "QueenBee" },
    { no: "075", name: "ツジギリ", en: "Bushi", elements: ["炎属性"], work: ["火おこし", "手作業", "採集", "伐採", "運搬"], iconKey: "Ronin" },
  { no: "076", name: "フォレーナ", en: "Wixen", elements: ["炎属性"], work: ["火おこし", "手作業", "運搬"], iconKey: "FoxMage" },
  { no: "077", name: "クレメーオ", en: "Katress", elements: ["闇属性"], work: ["手作業", "製薬", "運搬"], iconKey: "CatMage" },
  { no: "080", name: "シルキーヌ", en: "Sibelyx", elements: ["氷属性"], work: ["製薬", "冷却", "牧場"], iconKey: "SilkWorm" },
  { no: "082", name: "アズレーン", en: "Azurobe", elements: ["水属性", "竜属性"], work: ["水やり"], iconKey: "BlueDragon" },
  { no: "083", name: "ツンドラー", en: "Reindrix", elements: ["氷属性"], work: ["伐採", "冷却"], iconKey: "IceDeer" },
  { no: "085", name: "ペコドン", en: "Relaxaurus", elements: ["竜属性", "水属性"], work: ["水やり", "運搬"], iconKey: "LazyDragon" },
  { no: "085B", name: "パリピドン", en: "Relaxaurus Lux", elements: ["竜属性", "雷属性"], work: ["発電", "運搬"], iconKey: "LazyDragonElectric" },
  { no: "086", name: "ラブラドン", en: "Broncherry", elements: ["草属性"], work: ["種まき"], iconKey: "SakuraSaurus" },
  { no: "086B", name: "スプラドン", en: "Broncherry Aqua", elements: ["水属性"], work: ["水やり"], iconKey: "SakuraSaurusWater" },
      { no: "098", name: "ジオラーヴァ", en: "Astegon", elements: ["竜属性", "闇属性"], work: ["採掘"], iconKey: "BlackMetalDragon" },
  { no: "099", name: "デスティング", en: "Menasting", elements: ["地属性", "闇属性"], work: ["伐採", "採掘"], iconKey: "DarkScorpion" },
  { no: "100", name: "アヌビス", en: "Anubis", elements: ["地属性"], work: ["手作業", "採掘", "運搬"], icon: "https://palworld-lab.com/_astro/100.qJj5_Az6_Zuceq3.webp" },
  { no: "101", name: "レヴィドラ", en: "Jormuntide", elements: ["竜属性", "水属性"], work: ["水やり"], iconKey: "Umihebi" },
  { no: "101B", name: "アグニドラ", en: "Jormuntide Ignis", elements: ["竜属性", "炎属性"], work: ["火おこし"], iconKey: "UmihebiFire" },
  { no: "102", name: "スザク", en: "Suzaku", elements: ["炎属性"], work: ["火おこし"], iconKey: "Suzaku" },
  { no: "102B", name: "シヴァ", en: "Suzaku Aqua", elements: ["水属性"], work: ["水やり"], iconKey: "SuzakuWater" },
  { no: "103", name: "エレパンダ", en: "Grizzbolt", elements: ["雷属性"], work: ["発電", "手作業", "伐採", "運搬"], iconKey: "ElecPanda" },
  { no: "105", name: "ホルス", en: "Faleris", elements: ["炎属性"], work: ["火おこし", "運搬"], iconKey: "Horus" },
  { no: "107", name: "ゼノグリフ", en: "Shadowbeak", elements: ["闇属性"], work: ["採集"], iconKey: "BlackGriffon" },
  { no: "110", name: "グレイシャル", en: "Frostallion", elements: ["氷属性"], work: ["冷却"], iconKey: "IceHorse" },
  { no: "110B", name: "グレイシャドウ", en: "Frostallion Noct", elements: ["闇属性"], work: ["採集"], iconKey: "BlackFurDragon" },
  { no: "111", name: "ジェッドラン", en: "Jetragon", elements: ["竜属性"], work: ["採集"], iconKey: "JetDragon" },
  { no: "テラ01", name: "クトゥルフのめだま", en: "Eye of Cthulhu", elements: ["闇属性"], work: ["運搬"], icon: "https://palworld-lab.com/_astro/10001.BJliejgN_1xzcGC.webp" }
];

const LEGACY_ENGLISH_TO_JP = {
  lamball: "モコロン", cattiva: "ツッパニャン", chikipi: "タマコッコ", lifmunk: "クルリス", foxparks: "キツネビ",
  pengullet: "ペンタマ", penking: "キャプペン", sparkit: "ボルトラ", daedream: "ネムラム", rushoar: "イノボウ",
  melpaca: "メルパカ", eikthyrdeer: "ツノガミ", nitewing: "ホークウィン", incineram: "ヘルゴート", mossanda: "ササゾー",
  beegarde: "ビーナイト", elizabee: "クインビーナ", chillet: "オコチョ", "chilletignis": "モモチョ", univolt: "ライコーン",
  rayhound: "イヌズマ", kitsun: "シラヌイ", tombat: "ニャンバット", lovander: "ラブマンダー", bushi: "ツジギリ",
  beakon: "ボルゼクス", ragnahawk: "イグニクス", katress: "クレメーオ", wixen: "フォレーナ", verdash: "ラベロット",
  relaxaurus: "ペコドン", "relaxauruslux": "パリピドン", broncherry: "ラブラドン", "broncherryaqua": "スプラドン", anubis: "アヌビス",
  jormuntide: "レヴィドラ", "jormuntideignis": "アグニドラ", suzaku: "スザク", "suzakuaqua": "シヴァ", grizzbolt: "エレパンダ",
  faleris: "ホルス", menasting: "デスティング", blazamut: "ボルカイザー", shadowbeak: "ゼノグリフ"
};

const ROOM_ID = getRoomId();
const state = {
  records: [],
  selectedId: null,
  firebaseReady: false,
  db: null,
  dbApi: null,
  dbRef: null,
  palSource: "内蔵リスト",
  palMap: new Map(),
  palNames: [],
  pickers: {},
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
  palDataState: $("palDataState"),
};

init();

async function init() {
  mergePalData(EMBEDDED_PALS, "内蔵リスト");
  setupPalOptions();
  setupEvents();
  setupPalPickers();
  await setupStorage();
  render();
  loadCachedPalData();
  loadPalworldLabData();
}

function mergePalData(list, sourceLabel) {
  if (!Array.isArray(list) || list.length === 0) return;
  for (const raw of list) {
    const name = normalizePalDisplayName(raw.name);
    if (!name) continue;
    const existing = state.palMap.get(name) || {};
    state.palMap.set(name, {
      ...existing,
      ...raw,
      name,
      elements: Array.isArray(raw.elements) ? raw.elements : existing.elements || [],
      work: Array.isArray(raw.work) ? raw.work : existing.work || [],
      sortKey: raw.sortKey ?? existing.sortKey ?? makeSortKey(raw.no, name),
      source: raw.source || sourceLabel,
    });
    if (raw.en) {
      LEGACY_ENGLISH_TO_JP[normalizeKey(raw.en)] = name;
    }
  }
  state.palNames = Array.from(state.palMap.values())
    .sort((a, b) => String(a.sortKey).localeCompare(String(b.sortKey), "ja", { numeric: true }) || a.name.localeCompare(b.name, "ja"))
    .map(p => p.name);
  state.palSource = sourceLabel;
  updatePalDataState();
}

function loadCachedPalData() {
  try {
    const cached = JSON.parse(localStorage.getItem(PAL_CACHE_KEY) || "null");
    if (cached?.pals?.length >= 100) {
      mergePalData(cached.pals, `Palworld Labキャッシュ ${cached.pals.length}種`);
      setupPalOptions(true);
      render();
      refreshPickerPreviews();
    }
  } catch (error) {
    console.warn("Pal cache read failed", error);
  }
}

async function loadPalworldLabData() {
  updatePalDataState("Palworld Labから最新一覧を確認中…");
  const endpoints = [PAL_SOURCE_URL, PAL_SOURCE_PROXY_URL];
  let lastError = null;
  for (const url of endpoints) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const html = await response.text();
      const pals = parsePalworldLabHtml(html);
      if (pals.length < 100) throw new Error(`取得数が少なすぎます: ${pals.length}`);
      localStorage.setItem(PAL_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), pals }));
      mergePalData(pals, `Palworld Lab同期済み ${pals.length}種`);
      setupPalOptions(true);
      render();
      refreshPickerPreviews();
      toast(`Palworld Labから${pals.length}種類のパル情報を読み込みました`);
      return;
    } catch (error) {
      lastError = error;
      console.warn("Palworld Lab sync failed:", url, error);
    }
  }
  updatePalDataState(`${state.palSource}で起動中 / 外部同期失敗`);
  console.warn("Palworld Lab sync gave up:", lastError);
}

function parsePalworldLabHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const map = new Map();
  for (const img of doc.querySelectorAll("img[alt][src]")) {
    const alt = img.getAttribute("alt")?.trim();
    if (!isLikelyPalName(alt)) continue;
    const rawSrc = img.getAttribute("src");
    const icon = new URL(rawSrc, PAL_SOURCE_URL).href;
    const no = inferNoFromSrc(icon) || inferNoFromNearText(img);
    if (!map.has(alt)) {
      map.set(alt, {
        no,
        name: alt,
        icon,
        sortKey: makeSortKey(no, alt),
        source: "Palworld Lab",
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey, "ja", { numeric: true }));
}

function isLikelyPalName(name) {
  if (!name || EXCLUDED_IMAGE_ALTS.has(name)) return false;
  if (name.length > 24) return false;
  if (/(属性|フィルター|ソート|検索|画像|アイコン|ボタン|Section|Logo|Twitter|X|OBS|Tier|URL|攻略|一覧|ツール|シミュレーター)/.test(name)) return false;
  if (/^[0-9]+[A-Za-z]?$/.test(name)) return false;
  if (!/[ぁ-んァ-ン一-龠]/.test(name)) return false;
  return true;
}

function inferNoFromSrc(src) {
  const match = src.match(/\/([0-9]{3,5}[A-Z]?|1000[0-9])\./);
  if (!match) return "";
  const raw = match[1];
  if (raw.length >= 5) return `テラ${raw.slice(-2)}`;
  return raw;
}

function inferNoFromNearText(img) {
  const row = img.closest("tr, li, article, div");
  const text = row?.textContent || "";
  const match = text.match(/(\d{3}[A-Z]?|ﾃﾗ\d{2})/);
  return match?.[1] || "";
}

function makeSortKey(no, name) {
  const raw = String(no || "");
  const tera = raw.match(/(?:テラ|ﾃﾗ)(\d+)/);
  if (tera) return `9000-${tera[1].padStart(3, "0")}-${name}`;
  const normal = raw.match(/(\d+)([A-Z])?/);
  if (normal) return `${normal[1].padStart(4, "0")}${normal[2] || ""}-${name}`;
  return `9999-${name}`;
}

function updatePalDataState(text = null) {
  if (!elements.palDataState) return;
  const label = text || state.palSource;
  elements.palDataState.textContent = label;
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

function setupPalOptions(keepValues = false) {
  const oldParent = keepValues ? elements.parentFilter.value : "";
  const oldResult = keepValues ? elements.resultFilter.value : "";
  const datalist = $("palOptions");
  if (datalist) datalist.innerHTML = state.palNames.map(name => `<option value="${escapeHtml(name)}"></option>`).join("");
  if (keepValues) {
    elements.parentFilter.value = oldParent;
    elements.resultFilter.value = oldResult;
  }
  refreshPickerPreviews();
}

function setupEvents() {
  [elements.parentFilter, elements.resultFilter, elements.elementFilter, elements.workFilter, elements.statusFilter, elements.favoriteOnly, elements.unverifiedOnly, elements.searchInput, elements.sortSelect]
    .forEach(el => el?.addEventListener("input", render));

  $("clearFilters").addEventListener("click", () => {
    elements.parentFilter.value = "";
    elements.resultFilter.value = "";
    elements.elementFilter.value = "";
    elements.workFilter.value = "";
    elements.statusFilter.value = "";
    elements.favoriteOnly.checked = false;
    elements.unverifiedOnly.checked = false;
    elements.searchInput.value = "";
    refreshPickerPreviews();
    render();
  });

  document.querySelectorAll("[data-clear-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const target = $(button.dataset.clearFilter);
      if (!target) return;
      target.value = "";
      updatePickerPreview(button.dataset.clearFilter);
      target.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });

  $("addRecord").addEventListener("click", () => openDialog());
  $("cancelDialog").addEventListener("click", () => elements.recordDialog.close());
  $("closeDetail").addEventListener("click", () => { state.selectedId = null; render(); });
  $("copyRoomLink").addEventListener("click", copyRoomLink);

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

function setupPalPickers() {
  for (const id of ["parentA", "parentB", "resultPal", "parentFilter", "resultFilter"]) {
    const input = $(id);
    if (!input) continue;
    const picker = input.closest(".pal-picker");
    const preview = picker?.querySelector(".pal-picker-preview");
    const list = picker?.querySelector(".pal-suggestions");
    state.pickers[id] = { input, picker, preview, list };

    input.addEventListener("input", () => {
      updatePickerPreview(id);
      renderPickerSuggestions(id);
    });
    input.addEventListener("focus", () => renderPickerSuggestions(id));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hidePickerSuggestions(id);
    });
  }

  document.addEventListener("click", (event) => {
    for (const id of Object.keys(state.pickers)) {
      if (!state.pickers[id].picker.contains(event.target)) hidePickerSuggestions(id);
    }
  });
}

function updatePickerPreview(id) {
  const picker = state.pickers[id];
  if (!picker?.preview) return;
  const name = normalizePalName(picker.input.value);
  if (!name && id.endsWith("Filter")) {
    picker.preview.innerHTML = `<span class="pal-icon small filter-any"><span class="pal-fallback">全</span></span>`;
    return;
  }
  picker.preview.innerHTML = palIcon(name, "small");
}

function refreshPickerPreviews() {
  for (const id of Object.keys(state.pickers)) updatePickerPreview(id);
}

function renderPickerSuggestions(id) {
  const picker = state.pickers[id];
  if (!picker?.list) return;
  const raw = picker.input.value.trim();
  const query = normalizeSearch(raw);
  const isFilter = id.endsWith("Filter");
  const candidates = state.palNames
    .filter(name => {
      const meta = getPalMeta(name);
      const target = normalizeSearch([name, meta?.en, meta?.no].filter(Boolean).join(" "));
      return !query || target.includes(query);
    });

  const clearButton = isFilter
    ? `<button type="button" class="pal-suggestion clear-choice" data-name="">${palIcon("", "small")}<span><strong>すべて</strong><small>絞り込みを解除</small></span></button>`
    : "";

  if (!candidates.length) {
    picker.list.innerHTML = clearButton || `<div class="pal-suggestion is-empty">候補にありません。このまま自由入力もできます。</div>`;
  } else {
    picker.list.innerHTML = clearButton + candidates.map(name => {
      const meta = getPalMeta(name) || {};
      const sub = [meta.no, meta.elements?.join("・")].filter(Boolean).join(" / ");
      return `<button type="button" class="pal-suggestion" data-name="${escapeHtml(name)}">${palIcon(name, "small")}<span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(sub || meta.en || "")}</small></span></button>`;
    }).join("");
  }
  picker.list.querySelectorAll("button[data-name]").forEach(button => {
    button.addEventListener("click", () => {
      picker.input.value = button.dataset.name;
      updatePickerPreview(id);
      hidePickerSuggestions(id);
      picker.input.dispatchEvent(new Event("input", { bubbles: true }));
      picker.input.focus();
    });
  });
  picker.list.hidden = false;
}

function hidePickerSuggestions(id) {
  const list = state.pickers[id]?.list;
  if (list) list.hidden = true;
}

async function copyRoomLink() {
  const url = `${location.origin}${location.pathname}#room=${ROOM_ID}`;
  try {
    await navigator.clipboard.writeText(url);
    toast("共有リンクをコピーしました");
  } catch {
    prompt("このURLを友人に共有してください", url);
  }
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

function normalizePalDisplayName(name) {
  return String(name || "").replace(/\s+/g, " ").trim();
}

function normalizePalName(name) {
  const raw = normalizePalDisplayName(name);
  if (!raw) return "";
  if (state.palMap.has(raw)) return raw;
  const key = normalizeKey(raw);
  return LEGACY_ENGLISH_TO_JP[key] || raw;
}

function normalizeKey(value) {
  return String(value || "").toLowerCase().replace(/[\s_\-・'’\.]/g, "");
}

function normalizeSearch(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function stripId(record) { const { id, ...rest } = record; return rest; }

function palFilterMatches(palName, filterValue) {
  const filter = normalizeSearch(filterValue);
  if (!filter) return true;
  const meta = getPalMeta(palName) || {};
  const target = normalizeSearch([palName, meta.en, meta.no].filter(Boolean).join(" "));
  return target.includes(filter);
}

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
  const query = normalizeSearch(elements.searchInput.value);
  const parent = elements.parentFilter.value;
  const result = elements.resultFilter.value;
  const element = elements.elementFilter.value;
  const work = elements.workFilter.value;
  const status = elements.statusFilter.value;
  let records = [...state.records];

  records = records.filter(record => {
    const meta = getPalMeta(record.resultPal) || {};
    const englishNames = [record.parentA, record.parentB, record.resultPal].map(name => getPalMeta(name)?.en || "");
    const searchTarget = normalizeSearch([record.parentA, record.parentB, record.resultPal, ...englishNames, record.recorder, record.note, record.status, ...record.passives].join(" "));
    const recordElements = meta.elements || (meta.element ? [meta.element] : []);
    const recordWorks = meta.work || [];
    const parentHit = !parent || [record.parentA, record.parentB]
      .some(name => palFilterMatches(name, parent));
    const resultHit = !result || palFilterMatches(record.resultPal, result);
    return (!query || searchTarget.includes(query)) &&
      parentHit &&
      resultHit &&
      (!element || recordElements.includes(element)) &&
      (!work || recordWorks.includes(work)) &&
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
    <div class="detail-toolbar">
      <button class="secondary-button" data-detail-action="delete" type="button">削除</button>
      <button class="primary-button" data-detail-action="edit" type="button">編集する</button>
    </div>
    <div class="recipe-line">
      ${recipePal("親A", record.parentA)}
      <div class="recipe-symbol">＋</div>
      ${recipePal("親B", record.parentB)}
      <div class="recipe-symbol">→</div>
      ${recipePal("結果", record.resultPal)}
    </div>
    <div class="detail-section"><h3>パッシブ候補</h3><div class="tag-list">${renderTags(record.passives)}</div></div>
    <div class="detail-section"><h3>メモ</h3><div class="note-box ${record.note ? "" : "is-empty"}">${escapeHtml(record.note || "メモはまだありません。編集ボタンから入力できます。")}</div></div>
    <div class="detail-section"><h3>確認チェックリスト</h3><div class="check-list">
      ${checkLine(record.checked.bred, "実際に配合済み")}
      ${checkLine(record.checked.screenshot, "スクリーンショット確認")}
      ${checkLine(record.checked.passive, "パッシブ継承確認")}
      ${checkLine(record.checked.battle, "実戦・拠点性能確認")}
    </div></div>
    <div class="detail-section"><h3>記録情報</h3>
      <p>${statusBadge(record.status)}</p>
      <p><strong>記録者：</strong>${escapeHtml(record.recorder)}</p>
      <p><strong>更新日時：</strong>${formatDate(record.updatedAt, true)}</p>
    </div>`;

  elements.detailBody.querySelector("[data-detail-action='edit']")?.addEventListener("click", () => openDialog(record.id));
  elements.detailBody.querySelector("[data-detail-action='delete']")?.addEventListener("click", async () => {
    if (!confirm("この配合記録を削除しますか？")) return;
    await deleteRecord(record.id);
  });
}

function getPalMeta(name) {
  return state.palMap.get(normalizePalName(name));
}

function palInline(name) {
  return `<span class="pal-inline">${palIcon(name)}<span>${escapeHtml(name || "未入力")}</span></span>`;
}

function recipePal(label, name) {
  return `<div class="recipe-pal"><small>${label}</small>${palIcon(name, "large")}<span>${escapeHtml(name || "未入力")}</span></div>`;
}

function palIcon(name, size = "normal") {
  const normalized = normalizePalName(name);
  const meta = getPalMeta(normalized);
  const sizeClass = size === "large" ? " large" : size === "small" ? " small" : "";
  if (!normalized) return `<span class="pal-icon${sizeClass} filter-any"><span class="pal-fallback">全</span></span>`;
  const letter = escapeHtml((normalized || "?").slice(0, 1));
  if (!meta) return `<span class="pal-icon${sizeClass} unknown"><span class="pal-fallback">${letter}</span></span>`;
  const paldbUrl = meta.iconKey ? `https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_${encodeURIComponent(meta.iconKey)}_icon_normal.webp` : "";
  const url = meta.icon || paldbUrl;
  const fallbackUrl = meta.icon && paldbUrl && meta.icon !== paldbUrl ? paldbUrl : "";
  const title = [normalized, meta.en, meta.no].filter(Boolean).join(" / ");
  if (!url) return `<span class="pal-icon${sizeClass} unknown" title="${escapeHtml(title)}"><span class="pal-fallback">${letter}</span></span>`;
  const fallbackAttr = fallbackUrl ? ` data-fallback="${escapeHtml(fallbackUrl)}"` : "";
  return `<span class="pal-icon${sizeClass}" title="${escapeHtml(title)}"><img src="${escapeHtml(url)}"${fallbackAttr} alt="${escapeHtml(normalized)}" loading="lazy" onerror="if(this.dataset.fallback&&!this.dataset.usedFallback){this.dataset.usedFallback='1';this.src=this.dataset.fallback;}else{this.closest('.pal-icon').classList.add('unknown');this.replaceWith(Object.assign(document.createElement('span'),{className:'pal-fallback',textContent:'${letter}'}));}"></span>`;
}

function renderTags(tags) {
  if (!tags?.length) return `<span class="tag subtle">未設定</span>`;
  return tags.map(tag => `<span class="tag ${tagType(tag)}">${escapeHtml(tag)}</span>`).join("");
}

function tagType(tag) {
  if (["職人気質", "まじめ", "社畜", "ワーカーホリック", "発電", "運搬", "採掘", "伐採", "拠点", "作業"].some(key => tag.includes(key))) return "work";
  if (["脳筋", "獰猛", "希少", "伝説", "走るのが得意", "神速", "すばしこい", "鬼神", "不真面目"].some(key => tag.includes(key))) return "battle";
  return "";
}

function statusBadge(status) {
  const className = status === "実機確認済み" ? "status-verified" : status === "育成候補" ? "status-candidate" : "status-pending";
  const icon = status === "実機確認済み" ? "✓" : status === "育成候補" ? "★" : "…";
  return `<span class="status-badge ${className}">${icon} ${escapeHtml(status)}</span>`;
}

function checkLine(checked, text) { return `<div class="check-item ${checked ? "is-checked" : ""}"><span class="check-box">${checked ? "✓" : ""}</span><span>${escapeHtml(text)}</span></div>`; }

function openDialog(id = null) {
  const record = id ? state.records.find(r => r.id === id) : null;
  $("dialogTitle").textContent = record ? "配合記録を編集" : "新しい配合記録";
  $("recordId").value = record?.id || "";
  $("parentA").value = record?.parentA || "";
  $("parentB").value = record?.parentB || "";
  $("resultPal").value = record?.resultPal || "";
  $("recorder").value = record?.recorder || "福冨";
  $("status").value = record?.status || "確認中";
  $("passives").value = record?.passives?.join(", ") || "";
  $("note").value = record?.note || "";
  $("checkedBred").checked = Boolean(record?.checked?.bred);
  $("checkedScreenshot").checked = Boolean(record?.checked?.screenshot);
  $("checkedPassive").checked = Boolean(record?.checked?.passive);
  $("checkedBattle").checked = Boolean(record?.checked?.battle);
  $("deleteRecord").style.visibility = record ? "visible" : "hidden";
  refreshPickerPreviews();
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

  if (!record.parentA || !record.parentB || !record.resultPal) {
    toast("親A・親B・結果パルは必須です。", true);
    return;
  }

  const missing = [record.parentA, record.parentB, record.resultPal].filter(name => !getPalMeta(name));
  if (missing.length) {
    const ok = confirm(`候補リストにないパル名があります：${missing.join("、")}\nこのまま保存しますか？`);
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
  toast.timer = setTimeout(() => elements.toast.classList.remove("show"), 3200);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
}
