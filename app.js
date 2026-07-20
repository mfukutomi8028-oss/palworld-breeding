const PAL_SOURCE_URL = "https://palworld-lab.com/pals/";
const PAL_SOURCE_PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(PAL_SOURCE_URL)}`;
const PAL_CACHE_KEY = "pal-breeding-board:palworld-lab-pals:v49";
const PALDB_SOURCE_URL = "https://paldb.cc/ja/Pals";
const PALDB_SOURCE_PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(PALDB_SOURCE_URL)}`;
const PALDB_CACHE_KEY = "pal-breeding-board:paldb-icons:v49";
const CURRENT_PAL_LOCALIZATION_URLS = [
  "https://raw.githubusercontent.com/zaigie/palworld-server-tool/f45a48ef25ce08a5311a27e55b17062ba0bb4362/web/src/assets/pal.json",
  "https://cdn.jsdelivr.net/gh/zaigie/palworld-server-tool@f45a48ef25ce08a5311a27e55b17062ba0bb4362/web/src/assets/pal.json"
];
const CURRENT_PAL_ICON_MANIFEST_URLS = [
  "https://raw.githubusercontent.com/bowenchen-1/palworld-guide/bbe68288a4404ea22467d53b73aee15a70abaa97/data/sources/palworld-icon-manifest.json",
  "https://cdn.jsdelivr.net/gh/bowenchen-1/palworld-guide@bbe68288a4404ea22467d53b73aee15a70abaa97/data/sources/palworld-icon-manifest.json"
];
const CURRENT_PALDB_DATA_URLS = [
  "https://raw.githubusercontent.com/bowenchen-1/palworld-guide/bbe68288a4404ea22467d53b73aee15a70abaa97/data/sources/paldb-1.0-20260715.json",
  "https://cdn.jsdelivr.net/gh/bowenchen-1/palworld-guide@bbe68288a4404ea22467d53b73aee15a70abaa97/data/sources/paldb-1.0-20260715.json"
];
const CURRENT_ROSTER_CACHE_KEY = "pal-breeding-board:current-roster:v50";
const PASSIVE_SOURCE_URL = "https://palworld-lab.com/passives/";
const PASSIVE_SOURCE_PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(PASSIVE_SOURCE_URL)}`;
const PASSIVE_CACHE_KEY = "pal-breeding-board:palworld-lab-passives:v1";
const SAMPLE_PREFIX = "sample-";

const WORKS = ["火おこし", "水やり", "種まき", "発電", "手作業", "採集", "伐採", "採掘", "製薬", "冷却", "運搬", "牧場"];
const ELEMENTS = ["無属性", "炎属性", "水属性", "草属性", "雷属性", "氷属性", "地属性", "闇属性", "竜属性"];
const EGG_TYPES = [
  {
    "name": "平凡なタマゴ",
    "key": "plain",
    "size": "通常",
    "icon": "assets/eggs/plain.png",
    "aliases": [
      "平凡なタマゴ",
      "平凡な",
      "平凡",
      "普通",
      "へいぼん",
      "normal",
      "common"
    ]
  },
  {
    "name": "平凡なデカタマゴ",
    "key": "plain",
    "size": "デカ",
    "icon": "assets/eggs/plain.png",
    "aliases": [
      "平凡なデカタマゴ",
      "平凡なデカ",
      "平凡なタマゴ",
      "平凡な",
      "平凡",
      "普通",
      "へいぼん",
      "normal",
      "common",
      "デカ",
      "平凡なデカたまご",
      "平凡な デカタマゴ",
      "平凡なのデカタマゴ",
      "デカ平凡なタマゴ",
      "デカ平凡な"
    ]
  },
  {
    "name": "平凡なキョダイタマゴ",
    "key": "plain",
    "size": "キョダイ",
    "icon": "assets/eggs/plain.png",
    "aliases": [
      "平凡なキョダイタマゴ",
      "平凡なキョダイ",
      "平凡なタマゴ",
      "平凡な",
      "平凡",
      "普通",
      "へいぼん",
      "normal",
      "common",
      "キョダイ",
      "平凡なキョダイたまご",
      "平凡な キョダイタマゴ",
      "平凡なのキョダイタマゴ",
      "キョダイ平凡なタマゴ",
      "キョダイ平凡な"
    ]
  },
  {
    "name": "熱を帯びたタマゴ",
    "key": "scorching",
    "size": "通常",
    "icon": "assets/eggs/scorching.png",
    "aliases": [
      "熱を帯びたタマゴ",
      "熱を帯びた",
      "熱",
      "あつ",
      "炎",
      "ほのお",
      "fire",
      "scorching"
    ]
  },
  {
    "name": "熱を帯びたデカタマゴ",
    "key": "scorching",
    "size": "デカ",
    "icon": "assets/eggs/scorching.png",
    "aliases": [
      "熱を帯びたデカタマゴ",
      "熱を帯びたデカ",
      "熱を帯びたタマゴ",
      "熱を帯びた",
      "熱",
      "あつ",
      "炎",
      "ほのお",
      "fire",
      "scorching",
      "デカ",
      "熱を帯びたデカたまご",
      "熱を帯びた デカタマゴ",
      "熱を帯びたのデカタマゴ",
      "デカ熱を帯びたタマゴ",
      "デカ熱を帯びた"
    ]
  },
  {
    "name": "熱を帯びたキョダイタマゴ",
    "key": "scorching",
    "size": "キョダイ",
    "icon": "assets/eggs/scorching.png",
    "aliases": [
      "熱を帯びたキョダイタマゴ",
      "熱を帯びたキョダイ",
      "熱を帯びたタマゴ",
      "熱を帯びた",
      "熱",
      "あつ",
      "炎",
      "ほのお",
      "fire",
      "scorching",
      "キョダイ",
      "熱を帯びたキョダイたまご",
      "熱を帯びた キョダイタマゴ",
      "熱を帯びたのキョダイタマゴ",
      "キョダイ熱を帯びたタマゴ",
      "キョダイ熱を帯びた"
    ]
  },
  {
    "name": "しめったタマゴ",
    "key": "damp",
    "size": "通常",
    "icon": "assets/eggs/damp.png",
    "aliases": [
      "しめったタマゴ",
      "しめった",
      "湿った",
      "水",
      "みず",
      "water",
      "damp"
    ]
  },
  {
    "name": "しめったデカタマゴ",
    "key": "damp",
    "size": "デカ",
    "icon": "assets/eggs/damp.png",
    "aliases": [
      "しめったデカタマゴ",
      "しめったデカ",
      "しめったタマゴ",
      "しめった",
      "湿った",
      "水",
      "みず",
      "water",
      "damp",
      "デカ",
      "しめったデカたまご",
      "しめった デカタマゴ",
      "しめったのデカタマゴ",
      "デカしめったタマゴ",
      "デカしめった"
    ]
  },
  {
    "name": "しめったキョダイタマゴ",
    "key": "damp",
    "size": "キョダイ",
    "icon": "assets/eggs/damp.png",
    "aliases": [
      "しめったキョダイタマゴ",
      "しめったキョダイ",
      "しめったタマゴ",
      "しめった",
      "湿った",
      "水",
      "みず",
      "water",
      "damp",
      "キョダイ",
      "しめったキョダイたまご",
      "しめった キョダイタマゴ",
      "しめったのキョダイタマゴ",
      "キョダイしめったタマゴ",
      "キョダイしめった"
    ]
  },
  {
    "name": "新緑のタマゴ",
    "key": "verdant",
    "size": "通常",
    "icon": "assets/eggs/verdant.png",
    "aliases": [
      "新緑のタマゴ",
      "新緑の",
      "新緑",
      "草",
      "くさ",
      "grass",
      "verdant"
    ]
  },
  {
    "name": "新緑のデカタマゴ",
    "key": "verdant",
    "size": "デカ",
    "icon": "assets/eggs/verdant.png",
    "aliases": [
      "新緑のデカタマゴ",
      "新緑のデカ",
      "新緑のタマゴ",
      "新緑の",
      "新緑",
      "草",
      "くさ",
      "grass",
      "verdant",
      "デカ",
      "新緑のデカたまご",
      "新緑の デカタマゴ",
      "新緑ののデカタマゴ",
      "デカ新緑のタマゴ",
      "デカ新緑の"
    ]
  },
  {
    "name": "新緑のキョダイタマゴ",
    "key": "verdant",
    "size": "キョダイ",
    "icon": "assets/eggs/verdant.png",
    "aliases": [
      "新緑のキョダイタマゴ",
      "新緑のキョダイ",
      "新緑のタマゴ",
      "新緑の",
      "新緑",
      "草",
      "くさ",
      "grass",
      "verdant",
      "キョダイ",
      "新緑のキョダイたまご",
      "新緑の キョダイタマゴ",
      "新緑ののキョダイタマゴ",
      "キョダイ新緑のタマゴ",
      "キョダイ新緑の"
    ]
  },
  {
    "name": "ビリビリのタマゴ",
    "key": "electric",
    "size": "通常",
    "icon": "assets/eggs/electric.png",
    "aliases": [
      "ビリビリのタマゴ",
      "ビリビリの",
      "ビリビリ",
      "びりびり",
      "雷",
      "かみなり",
      "electric"
    ]
  },
  {
    "name": "ビリビリのデカタマゴ",
    "key": "electric",
    "size": "デカ",
    "icon": "assets/eggs/electric.png",
    "aliases": [
      "ビリビリのデカタマゴ",
      "ビリビリのデカ",
      "ビリビリのタマゴ",
      "ビリビリの",
      "ビリビリ",
      "びりびり",
      "雷",
      "かみなり",
      "electric",
      "デカ",
      "ビリビリのデカたまご",
      "ビリビリの デカタマゴ",
      "ビリビリののデカタマゴ",
      "デカビリビリのタマゴ",
      "デカビリビリの"
    ]
  },
  {
    "name": "ビリビリのキョダイタマゴ",
    "key": "electric",
    "size": "キョダイ",
    "icon": "assets/eggs/electric.png",
    "aliases": [
      "ビリビリのキョダイタマゴ",
      "ビリビリのキョダイ",
      "ビリビリのタマゴ",
      "ビリビリの",
      "ビリビリ",
      "びりびり",
      "雷",
      "かみなり",
      "electric",
      "キョダイ",
      "ビリビリのキョダイたまご",
      "ビリビリの キョダイタマゴ",
      "ビリビリののキョダイタマゴ",
      "キョダイビリビリのタマゴ",
      "キョダイビリビリの"
    ]
  },
  {
    "name": "ゴツゴツしたタマゴ",
    "key": "rocky",
    "size": "通常",
    "icon": "assets/eggs/rocky.png",
    "aliases": [
      "ゴツゴツしたタマゴ",
      "ゴツゴツした",
      "ゴツゴツ",
      "ごつごつ",
      "地",
      "じめん",
      "ground",
      "rocky"
    ]
  },
  {
    "name": "ゴツゴツしたデカタマゴ",
    "key": "rocky",
    "size": "デカ",
    "icon": "assets/eggs/rocky.png",
    "aliases": [
      "ゴツゴツしたデカタマゴ",
      "ゴツゴツしたデカ",
      "ゴツゴツしたタマゴ",
      "ゴツゴツした",
      "ゴツゴツ",
      "ごつごつ",
      "地",
      "じめん",
      "ground",
      "rocky",
      "デカ",
      "ゴツゴツしたデカたまご",
      "ゴツゴツした デカタマゴ",
      "ゴツゴツしたのデカタマゴ",
      "デカゴツゴツしたタマゴ",
      "デカゴツゴツした"
    ]
  },
  {
    "name": "ゴツゴツしたキョダイタマゴ",
    "key": "rocky",
    "size": "キョダイ",
    "icon": "assets/eggs/rocky.png",
    "aliases": [
      "ゴツゴツしたキョダイタマゴ",
      "ゴツゴツしたキョダイ",
      "ゴツゴツしたタマゴ",
      "ゴツゴツした",
      "ゴツゴツ",
      "ごつごつ",
      "地",
      "じめん",
      "ground",
      "rocky",
      "キョダイ",
      "ゴツゴツしたキョダイたまご",
      "ゴツゴツした キョダイタマゴ",
      "ゴツゴツしたのキョダイタマゴ",
      "キョダイゴツゴツしたタマゴ",
      "キョダイゴツゴツした"
    ]
  },
  {
    "name": "凍てつくタマゴ",
    "key": "frozen",
    "size": "通常",
    "icon": "assets/eggs/frozen.png",
    "aliases": [
      "凍てつくタマゴ",
      "凍てつく",
      "いてつく",
      "氷",
      "こおり",
      "ice",
      "frozen"
    ]
  },
  {
    "name": "凍てつくデカタマゴ",
    "key": "frozen",
    "size": "デカ",
    "icon": "assets/eggs/frozen.png",
    "aliases": [
      "凍てつくデカタマゴ",
      "凍てつくデカ",
      "凍てつくタマゴ",
      "凍てつく",
      "いてつく",
      "氷",
      "こおり",
      "ice",
      "frozen",
      "デカ",
      "凍てつくデカたまご",
      "凍てつく デカタマゴ",
      "凍てつくのデカタマゴ",
      "デカ凍てつくタマゴ",
      "デカ凍てつく"
    ]
  },
  {
    "name": "凍てつくキョダイタマゴ",
    "key": "frozen",
    "size": "キョダイ",
    "icon": "assets/eggs/frozen.png",
    "aliases": [
      "凍てつくキョダイタマゴ",
      "凍てつくキョダイ",
      "凍てつくタマゴ",
      "凍てつく",
      "いてつく",
      "氷",
      "こおり",
      "ice",
      "frozen",
      "キョダイ",
      "凍てつくキョダイたまご",
      "凍てつく キョダイタマゴ",
      "凍てつくのキョダイタマゴ",
      "キョダイ凍てつくタマゴ",
      "キョダイ凍てつく"
    ]
  },
  {
    "name": "暗黒タマゴ",
    "key": "dark",
    "size": "通常",
    "icon": "assets/eggs/dark.png",
    "aliases": [
      "暗黒タマゴ",
      "暗黒",
      "あんこく",
      "闇",
      "やみ",
      "dark"
    ]
  },
  {
    "name": "暗黒デカタマゴ",
    "key": "dark",
    "size": "デカ",
    "icon": "assets/eggs/dark.png",
    "aliases": [
      "暗黒デカタマゴ",
      "暗黒デカ",
      "暗黒タマゴ",
      "暗黒",
      "あんこく",
      "闇",
      "やみ",
      "dark",
      "デカ",
      "暗黒デカたまご",
      "暗黒 デカタマゴ",
      "暗黒のデカタマゴ",
      "デカ暗黒タマゴ",
      "デカ暗黒"
    ]
  },
  {
    "name": "暗黒キョダイタマゴ",
    "key": "dark",
    "size": "キョダイ",
    "icon": "assets/eggs/dark.png",
    "aliases": [
      "暗黒キョダイタマゴ",
      "暗黒キョダイ",
      "暗黒タマゴ",
      "暗黒",
      "あんこく",
      "闇",
      "やみ",
      "dark",
      "キョダイ",
      "暗黒キョダイたまご",
      "暗黒 キョダイタマゴ",
      "暗黒のキョダイタマゴ",
      "キョダイ暗黒タマゴ",
      "キョダイ暗黒"
    ]
  },
  {
    "name": "竜のタマゴ",
    "key": "dragon",
    "size": "通常",
    "icon": "assets/eggs/dragon.png",
    "aliases": [
      "竜のタマゴ",
      "竜の",
      "竜",
      "りゅう",
      "ドラゴン",
      "dragon"
    ]
  },
  {
    "name": "竜のデカタマゴ",
    "key": "dragon",
    "size": "デカ",
    "icon": "assets/eggs/dragon.png",
    "aliases": [
      "竜のデカタマゴ",
      "竜のデカ",
      "竜のタマゴ",
      "竜の",
      "竜",
      "りゅう",
      "ドラゴン",
      "dragon",
      "デカ",
      "竜のデカたまご",
      "竜の デカタマゴ",
      "竜ののデカタマゴ",
      "デカ竜のタマゴ",
      "デカ竜の"
    ]
  },
  {
    "name": "竜のキョダイタマゴ",
    "key": "dragon",
    "size": "キョダイ",
    "icon": "assets/eggs/dragon.png",
    "aliases": [
      "竜のキョダイタマゴ",
      "竜のキョダイ",
      "竜のタマゴ",
      "竜の",
      "竜",
      "りゅう",
      "ドラゴン",
      "dragon",
      "キョダイ",
      "竜のキョダイたまご",
      "竜の キョダイタマゴ",
      "竜ののキョダイタマゴ",
      "キョダイ竜のタマゴ",
      "キョダイ竜の"
    ]
  }
];
const EXCLUDED_IMAGE_ALTS = new Set([
  ...ELEMENTS,
  ...WORKS,
  "X", "ポスト", "URLコピー", "テーマの選択", "ダーク", "ライト", "自動",
  "パルワールド配合・攻略ラボ", "火おこし", "水やり", "種まき", "発電", "手作業", "採集", "伐採", "採掘", "製薬", "冷却", "運搬", "牧場"
]);

const EMBEDDED_PASSIVES = [
  "ダイヤモンドボディ", "ヌシ", "永炎", "永久機関", "希少", "鬼神", "吸血鬼", "救世主", "侵略者", "神速",
  "絶食の極み", "超絶技巧", "伝説", "波乗り王", "不動明王の心", "魔女", "ダイエットマスター", "モチベーター", "ワーカーホリック", "泳ぐのが得意",
  "炎帝", "海皇", "屈強な肉体", "堅城の軍師", "鉱山のチーフ", "高貴", "職人気質", "神龍", "精霊王", "聖天",
  "走るのが得意", "地帝", "突撃指揮者", "脳筋", "博愛主義者", "伐採リーダー", "氷帝", "無限のスタミナ", "冥王", "雷帝",
  "冷静沈着", "獰猛", "アブノーマル", "うぬぼれ屋", "オラオラ系", "コンデンサ", "サディスト", "しなやかスイム", "すばしこい", "せっかち",
  "ドラゴンキラー", "ポジティブ思考", "まじめ", "マゾヒスト", "火遊び好き", "健康優良児", "硬い皮膚", "高温体質", "社畜", "小食",
  "水遊び好き", "絶縁体", "粗暴", "草木の香り", "耐震構造", "大地の力", "日焼け好き", "防水加工", "防草効果", "未知の生体細胞",
  "無の境地", "夜の帳", "夜行性", "勇敢", "陽キャラ", "竜の血族", "良い毛並み", "冷血", "うたれ弱い", "ことなかれ主義者",
  "サボり癖", "すぐ骨折する", "のんびり屋さん", "ビビり", "みすぼらしい", "引きこもり", "手加減", "食いしんぼ", "精神が不安定", "破滅願望",
  "不器用", "無限の胃袋"
];

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
  { no: "68", name: "クインビーナ", en: "Elizabee", elements: ["草属性"], work: ["種まき", "手作業", "採集", "伐採", "製薬"], iconKey: "QueenBee" },
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


const CURRENT_CRITICAL_PALS = [
  { no: "68", name: "クインビーナ", en: "Elizabee", elements: ["草属性"], work: ["種まき", "手作業", "採集", "伐採", "製薬"], iconKey: "QueenBee", icon: paldbIconUrlFromKey("QueenBee"), source: "Palworld 1.0重要補正" },
  { no: "96", name: "ライバード", en: "Beakon", elements: ["雷属性"], work: ["発電", "採集", "運搬"], iconKey: "ThunderBird", icon: paldbIconUrlFromKey("ThunderBird"), source: "Palworld 1.0重要補正" }
];

const V1_RELEASE_FALLBACK_PALS = [
  { name: "フユマル", en: "Smokie Cryst", iconKey: "BlackPuppy_Ice", icon: paldbIconUrlFromKey("BlackPuppy_Ice"), source: "Palworld 1.0内蔵" },
  { name: "シャオロン", en: "Shaolong", iconKey: "BlueSkyDragon", icon: paldbIconUrlFromKey("BlueSkyDragon"), source: "Palworld 1.0内蔵" },
  { name: "バトラビー", en: "Lapiron", iconKey: "BrownRabbit", icon: paldbIconUrlFromKey("BrownRabbit"), source: "Palworld 1.0内蔵" },
  { name: "ハグミー", en: "Needoll", iconKey: "CactusDoll", icon: paldbIconUrlFromKey("CactusDoll"), source: "Palworld 1.0内蔵" },
  { name: "ハグユー", en: "Needoll Noct", iconKey: "CactusDoll_Dark", icon: paldbIconUrlFromKey("CactusDoll_Dark"), source: "Palworld 1.0内蔵" },
  { name: "リオリネ", en: "Amione", iconKey: "ClioneTwins", icon: paldbIconUrlFromKey("ClioneTwins"), source: "Palworld 1.0内蔵" },
  { name: "ポワワ", en: "Clovee", iconKey: "CloverFairy", icon: paldbIconUrlFromKey("CloverFairy"), source: "Palworld 1.0内蔵" },
  { name: "ラピエール", en: "Dupin", iconKey: "ClownRabbit", icon: paldbIconUrlFromKey("ClownRabbit"), source: "Palworld 1.0内蔵" },
  { name: "オモシガメ", en: "Tetroise", iconKey: "CubeTurtle", icon: paldbIconUrlFromKey("CubeTurtle"), source: "Palworld 1.0内蔵" },
  { name: "オシロガメ", en: "Tetroise Primo", iconKey: "CubeTurtle_Neutral", icon: paldbIconUrlFromKey("CubeTurtle_Neutral"), source: "Palworld 1.0内蔵" },
  { name: "ポポフィア", en: "Souffline", iconKey: "DandelionGirl", icon: paldbIconUrlFromKey("DandelionGirl"), source: "Palworld 1.0内蔵" },
  { name: "マジョルナ", en: "Majex", iconKey: "DarkFlameFox", icon: paldbIconUrlFromKey("DarkFlameFox"), source: "Palworld 1.0内蔵" },
  { name: "シェルガドラ", en: "Aegidron", iconKey: "DomeArmorDragon", icon: paldbIconUrlFromKey("DomeArmorDragon"), source: "Palworld 1.0内蔵" },
  { name: "ノンビリリ", en: "Slowatt", iconKey: "ElecLizard", icon: paldbIconUrlFromKey("ElecLizard"), source: "Palworld 1.0内蔵" },
  { name: "パチマル", en: "Puffolt", iconKey: "ElecPomeranian", icon: paldbIconUrlFromKey("ElecPomeranian"), source: "Palworld 1.0内蔵" },
  { name: "デンツム", en: "Snock", iconKey: "ElecSnail", icon: paldbIconUrlFromKey("ElecSnail"), source: "Palworld 1.0内蔵" },
  { name: "ドンツム", en: "Snock Lux", iconKey: "ElecSnail_Ground", icon: paldbIconUrlFromKey("ElecSnail_Ground"), source: "Palworld 1.0内蔵" },
  { name: "チェリーナ", en: "Petallia Ignis", iconKey: "FlowerDoll_Fire", icon: paldbIconUrlFromKey("FlowerDoll_Fire"), source: "Palworld 1.0内蔵" },
  { name: "ノクサージュ", en: "Dandilord", iconKey: "FlowerPrince", icon: paldbIconUrlFromKey("FlowerPrince"), source: "Palworld 1.0内蔵" },
  { name: "モコチッチ", en: "Muffly", iconKey: "FluffyBird", icon: paldbIconUrlFromKey("FluffyBird"), source: "Palworld 1.0内蔵" },
  { name: "センコ", en: "Flaracle", iconKey: "FoxExorcist", icon: paldbIconUrlFromKey("FoxExorcist"), source: "Palworld 1.0内蔵" },
  { name: "ニャンシー", en: "Wispaw", iconKey: "GhostBlackCat", icon: paldbIconUrlFromKey("GhostBlackCat"), source: "Palworld 1.0内蔵" },
  { name: "レイバーン", en: "Eidrolon", iconKey: "GhostDragon", icon: paldbIconUrlFromKey("GhostDragon"), source: "Palworld 1.0内蔵" },
  { name: "ヘルバーン", en: "Eidrolon Ignis", iconKey: "GhostDragon_Fire", icon: paldbIconUrlFromKey("GhostDragon_Fire"), source: "Palworld 1.0内蔵" },
  { name: "グラスメアリ", en: "Nitemary Botan", iconKey: "GhostRabbit_Grass", icon: paldbIconUrlFromKey("GhostRabbit_Grass"), source: "Palworld 1.0内蔵" },
  { name: "ウゴクゾー", en: "Dualith", iconKey: "GrassGolem", icon: paldbIconUrlFromKey("GrassGolem"), source: "Palworld 1.0内蔵" },
  { name: "ノロウゾー", en: "Dualith Noct", iconKey: "GrassGolem_Dark", icon: paldbIconUrlFromKey("GrassGolem_Dark"), source: "Palworld 1.0内蔵" },
  { name: "モリタロス", en: "Elgrove", iconKey: "GrassMinotaur", icon: paldbIconUrlFromKey("GrassMinotaur"), source: "Palworld 1.0内蔵" },
  { name: "ユキタロス", en: "Elgrove Cryst", iconKey: "GrassMinotaur_Ice", icon: paldbIconUrlFromKey("GrassMinotaur_Ice"), source: "Palworld 1.0内蔵" },
  { name: "フードール", en: "Hoodle", iconKey: "HoodGhost", icon: paldbIconUrlFromKey("HoodGhost"), source: "Palworld 1.0内蔵" },
  { name: "チョコザラシ", en: "Polapup Terra", iconKey: "IceSeal_Ground", icon: paldbIconUrlFromKey("IceSeal_Ground"), source: "Palworld 1.0内蔵" },
  { name: "ゴウカブキ", en: "Renjishi", iconKey: "KabukiMan", icon: paldbIconUrlFromKey("KabukiMan"), source: "Palworld 1.0内蔵" },
  { name: "オーマンボ", en: "Solmora", iconKey: "KingSunfish", icon: paldbIconUrlFromKey("KingSunfish"), source: "Palworld 1.0内蔵" },
  { name: "トノサマンボ", en: "Solmora Lux", iconKey: "KingSunfish_Thunder", icon: paldbIconUrlFromKey("KingSunfish_Thunder"), source: "Palworld 1.0内蔵" },
  { name: "グランジーラ", en: "Panthalus", iconKey: "KingWhale", icon: paldbIconUrlFromKey("KingWhale"), source: "Palworld 1.0内蔵" },
  { name: "レイコーン", en: "Univolt Cryst", iconKey: "Kirin_Ice", icon: paldbIconUrlFromKey("Kirin_Ice"), source: "Palworld 1.0内蔵" },
  { name: "ユキツネ", en: "Foxparks Cryst", iconKey: "Kitsunebi_Ice", icon: paldbIconUrlFromKey("Kitsunebi_Ice"), source: "Palworld 1.0内蔵" },
  { name: "ヴィランタン", en: "Loomen", iconKey: "LanternButler", icon: paldbIconUrlFromKey("LanternButler"), source: "Palworld 1.0内蔵" },
  { name: "モモンパ", en: "Herbil", iconKey: "LeafMomonga", icon: paldbIconUrlFromKey("LeafMomonga"), source: "Palworld 1.0内蔵" },
  { name: "ニャルル", en: "Valentail", iconKey: "LongCat", icon: paldbIconUrlFromKey("LongCat"), source: "Palworld 1.0内蔵" },
  { name: "ハナミズチ", en: "Ophydia", iconKey: "LotusDragon", icon: paldbIconUrlFromKey("LotusDragon"), source: "Palworld 1.0内蔵" },
  { name: "カレッパ", en: "Tanzee Ignis", iconKey: "Monkey_Fire", icon: paldbIconUrlFromKey("Monkey_Fire"), source: "Palworld 1.0内蔵" },
  { name: "モノクローナ", en: "Solenne", iconKey: "MonochromeQueen", icon: paldbIconUrlFromKey("MonochromeQueen"), source: "Palworld 1.0内蔵" },
  { name: "ホシノコ", en: "Wistella", iconKey: "MoonChild", icon: paldbIconUrlFromKey("MoonChild"), source: "Palworld 1.0内蔵" },
  { name: "モスローン", en: "Silvance", iconKey: "Mothman", icon: paldbIconUrlFromKey("Mothman"), source: "Palworld 1.0内蔵" },
  { name: "ヨミーラ", en: "Gildra", iconKey: "MummyPal", icon: paldbIconUrlFromKey("MummyPal"), source: "Palworld 1.0内蔵" },
  { name: "マシュリー", en: "Mycora", iconKey: "MushroomLady", icon: paldbIconUrlFromKey("MushroomLady"), source: "Palworld 1.0内蔵" },
  { name: "ライトロット", en: "Starryon Primo", iconKey: "NightBlueHorse_Neutral", icon: paldbIconUrlFromKey("NightBlueHorse_Neutral"), source: "Palworld 1.0内蔵" },
  { name: "ユメンダコ", en: "Gloopie Primo", iconKey: "OctopusGirl_Neutral", icon: paldbIconUrlFromKey("OctopusGirl_Neutral"), source: "Palworld 1.0内蔵" },
  { name: "ウラミィ", en: "Bakemi", iconKey: "OniGhostGirl", icon: paldbIconUrlFromKey("OniGhostGirl"), source: "Palworld 1.0内蔵" },
  { name: "リーファン", en: "Leafan", iconKey: "PandaGirl", icon: paldbIconUrlFromKey("PandaGirl"), source: "Palworld 1.0内蔵" },
  { name: "ヨモギウサ", en: "Ribbuny Botan", iconKey: "PinkRabbit_Grass", icon: paldbIconUrlFromKey("PinkRabbit_Grass"), source: "Palworld 1.0内蔵" },
  { name: "モモンチュラ", en: "Tarantriss", iconKey: "PurpleSpider", icon: paldbIconUrlFromKey("PurpleSpider"), source: "Palworld 1.0内蔵" },
  { name: "フラペック", en: "Tropicaw", iconKey: "RedFlowerBird", icon: paldbIconUrlFromKey("RedFlowerBird"), source: "Palworld 1.0内蔵" },
  { name: "ジオルドン", en: "Pierdon", iconKey: "RockBeast", icon: paldbIconUrlFromKey("RockBeast"), source: "Palworld 1.0内蔵" },
  { name: "フロスドン", en: "Pierdon Cryst", iconKey: "RockBeast_Ice", icon: paldbIconUrlFromKey("RockBeast_Ice"), source: "Palworld 1.0内蔵" },
  { name: "ポチムネ", en: "Pupperai", iconKey: "SamuraiDog", icon: paldbIconUrlFromKey("SamuraiDog"), source: "Palworld 1.0内蔵" },
  { name: "ブッサンダー", en: "Prixter Lux", iconKey: "ScorpionMan_Electric", icon: paldbIconUrlFromKey("ScorpionMan_Electric"), source: "Palworld 1.0内蔵" },
  { name: "セクメト", en: "Sekhmet", iconKey: "Sekhmet", icon: paldbIconUrlFromKey("Sekhmet"), source: "Palworld 1.0内蔵" },
  { name: "ネモフィ", en: "Lapure", iconKey: "SleeveRabbit", icon: paldbIconUrlFromKey("SleeveRabbit"), source: "Palworld 1.0内蔵" },
  { name: "ユキボウ", en: "Snugloo", iconKey: "SmallYeti", icon: paldbIconUrlFromKey("SmallYeti"), source: "Palworld 1.0内蔵" },
  { name: "メドゥーナ", en: "Venusa", iconKey: "SnakeGirl", icon: paldbIconUrlFromKey("SnakeGirl"), source: "Palworld 1.0内蔵" },
  { name: "ドスコイヌ", en: "Bulldosu", iconKey: "SumoDog", icon: paldbIconUrlFromKey("SumoDog"), source: "Palworld 1.0内蔵" },
  { name: "メリコロネ", en: "Woolipop Terra", iconKey: "SweetsSheep_Ground", icon: paldbIconUrlFromKey("SweetsSheep_Ground"), source: "Palworld 1.0内蔵" },
  { name: "オオタチウオ", en: "Skutlass", iconKey: "SwordCutlassfish", icon: paldbIconUrlFromKey("SwordCutlassfish"), source: "Palworld 1.0内蔵" },
  { name: "ヒノタチウオ", en: "Skutlass Ignis", iconKey: "SwordCutlassfish_Fire", icon: paldbIconUrlFromKey("SwordCutlassfish_Fire"), source: "Palworld 1.0内蔵" },
  { name: "アルセーヴ", en: "Roujay", iconKey: "ThiefBird", icon: paldbIconUrlFromKey("ThiefBird"), source: "Palworld 1.0内蔵" },
  { name: "チルバード", en: "Beakon Cryst", iconKey: "ThunderBird_Ice", icon: paldbIconUrlFromKey("ThunderBird_Ice"), source: "Palworld 1.0内蔵" },
  { name: "フリーズマ", en: "Rayhound Cryst", iconKey: "ThunderDog_Ice", icon: paldbIconUrlFromKey("ThunderDog_Ice"), source: "Palworld 1.0内蔵" },
  { name: "ダイナモフ", en: "Dynamoff", iconKey: "ThunderFluffyBird", icon: paldbIconUrlFromKey("ThunderFluffyBird"), source: "Palworld 1.0内蔵" },
  { name: "カプリリス", en: "Carnibora", iconKey: "VenusFlytrap", icon: paldbIconUrlFromKey("VenusFlytrap"), source: "Palworld 1.0内蔵" },
  { name: "マグマンダー", en: "Moldron", iconKey: "VolcanoDragon", icon: paldbIconUrlFromKey("VolcanoDragon"), source: "Palworld 1.0内蔵" },
  { name: "ブリザンダー", en: "Moldron Cryst", iconKey: "VolcanoDragon_Ice", icon: paldbIconUrlFromKey("VolcanoDragon_Ice"), source: "Palworld 1.0内蔵" },
  { name: "コスモディア", en: "Celesdir Noct", iconKey: "WhiteDeer_Dark", icon: paldbIconUrlFromKey("WhiteDeer_Dark"), source: "Palworld 1.0内蔵" },
  { name: "ソワレーヌ", en: "Sibelyx Primo", iconKey: "WhiteMoth_Neutral", icon: paldbIconUrlFromKey("WhiteMoth_Neutral"), source: "Palworld 1.0内蔵" },
  { name: "マグナイト", en: "Knocklem Ignis", iconKey: "WingGolem_Fire", icon: paldbIconUrlFromKey("WingGolem_Fire"), source: "Palworld 1.0内蔵" }
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

const PAL_NAME_ALIASES = {
  "フブキジカ": "ツンドラー",
  "ふぶきじか": "ツンドラー",
  "フブキシカ": "ツンドラー",
  "ふぶきしか": "ツンドラー"
};

const PALDB_STATIC_ICONS = [
  {
    "no": "1",
    "iconKey": "SheepBall",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SheepBall_icon_normal.webp"
  },
  {
    "no": "2",
    "iconKey": "PinkCat",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_PinkCat_icon_normal.webp"
  },
  {
    "no": "3",
    "iconKey": "ChickenPal",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_ChickenPal_icon_normal.webp"
  },
  {
    "no": "4",
    "iconKey": "Carbunclo",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Carbunclo_icon_normal.webp"
  },
  {
    "no": "5",
    "iconKey": "Kitsunebi",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Kitsunebi_icon_normal.webp"
  },
  {
    "no": "5B",
    "iconKey": "Kitsunebi_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Kitsunebi_Ice_icon_normal.webp"
  },
  {
    "no": "6",
    "iconKey": "BluePlatypus",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BluePlatypus_icon_normal.webp"
  },
  {
    "no": "6B",
    "iconKey": "BluePlatypus_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BluePlatypus_Fire_icon_normal.webp"
  },
  {
    "no": "7",
    "iconKey": "ElecCat",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_ElecCat_icon_normal.webp"
  },
  {
    "no": "8",
    "iconKey": "Monkey",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Monkey_icon_normal.webp"
  },
  {
    "no": "9",
    "iconKey": "FlameBambi",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FlameBambi_icon_normal.webp"
  },
  {
    "no": "10",
    "iconKey": "Penguin",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Penguin_icon_normal.webp"
  },
  {
    "no": "10B",
    "iconKey": "Penguin_Electric",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Penguin_Electric_icon_normal.webp"
  },
  {
    "no": "11",
    "iconKey": "CaptainPenguin",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CaptainPenguin_icon_normal.webp"
  },
  {
    "no": "11B",
    "iconKey": "CaptainPenguin_Black",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CaptainPenguin_Black_icon_normal.webp"
  },
  {
    "no": "12",
    "iconKey": "Hedgehog",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Hedgehog_icon_normal.webp"
  },
  {
    "no": "12B",
    "iconKey": "Hedgehog_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Hedgehog_Ice_icon_normal.webp"
  },
  {
    "no": "13",
    "iconKey": "PlantSlime",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_PlantSlime_icon_normal.webp"
  },
  {
    "no": "14",
    "iconKey": "CuteFox",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CuteFox_icon_normal.webp"
  },
  {
    "no": "15",
    "iconKey": "WizardOwl",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WizardOwl_icon_normal.webp"
  },
  {
    "no": "16",
    "iconKey": "Ganesha",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Ganesha_icon_normal.webp"
  },
  {
    "no": "17",
    "iconKey": "NegativeKoala",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_NegativeKoala_icon_normal.webp"
  },
  {
    "no": "18",
    "iconKey": "WoolFox",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WoolFox_icon_normal.webp"
  },
  {
    "no": "19",
    "iconKey": "DreamDemon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_DreamDemon_icon_normal.webp"
  },
  {
    "no": "20",
    "iconKey": "Boar",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Boar_icon_normal.webp"
  },
  {
    "no": "21",
    "iconKey": "NightFox",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_NightFox_icon_normal.webp"
  },
  {
    "no": "22",
    "iconKey": "CuteMole",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CuteMole_icon_normal.webp"
  },
  {
    "no": "23",
    "iconKey": "NegativeOctopus",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_NegativeOctopus_icon_normal.webp"
  },
  {
    "no": "23B",
    "iconKey": "NegativeOctopus_Neutral",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_NegativeOctopus_Neutral_icon_normal.webp"
  },
  {
    "no": "24",
    "iconKey": "Bastet",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Bastet_icon_normal.webp"
  },
  {
    "no": "24B",
    "iconKey": "Bastet_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Bastet_Ice_icon_normal.webp"
  },
  {
    "no": "25",
    "iconKey": "FlyingManta",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FlyingManta_icon_normal.webp"
  },
  {
    "no": "25B",
    "iconKey": "FlyingManta_Thunder",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FlyingManta_Thunder_icon_normal.webp"
  },
  {
    "no": "26",
    "iconKey": "Garm",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Garm_icon_normal.webp"
  },
  {
    "no": "27",
    "iconKey": "ColorfulBird",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_ColorfulBird_icon_normal.webp"
  },
  {
    "no": "28",
    "iconKey": "FlowerRabbit",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FlowerRabbit_icon_normal.webp"
  },
  {
    "no": "29",
    "iconKey": "CowPal",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CowPal_icon_normal.webp"
  },
  {
    "no": "30",
    "iconKey": "LittleBriarRose",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LittleBriarRose_icon_normal.webp"
  },
  {
    "no": "31",
    "iconKey": "SharkKid",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SharkKid_icon_normal.webp"
  },
  {
    "no": "31B",
    "iconKey": "SharkKid_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SharkKid_Fire_icon_normal.webp"
  },
  {
    "no": "32",
    "iconKey": "WindChimes",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WindChimes_icon_normal.webp"
  },
  {
    "no": "32B",
    "iconKey": "WindChimes_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WindChimes_Ice_icon_normal.webp"
  },
  {
    "no": "33",
    "iconKey": "GrassPanda",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GrassPanda_icon_normal.webp"
  },
  {
    "no": "33B",
    "iconKey": "GrassPanda_Electric",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GrassPanda_Electric_icon_normal.webp"
  },
  {
    "no": "34",
    "iconKey": "SweetsSheep",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SweetsSheep_icon_normal.webp"
  },
  {
    "no": "35",
    "iconKey": "BerryGoat",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BerryGoat_icon_normal.webp"
  },
  {
    "no": "35B",
    "iconKey": "BerryGoat_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BerryGoat_Dark_icon_normal.webp"
  },
  {
    "no": "36",
    "iconKey": "Alpaca",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Alpaca_icon_normal.webp"
  },
  {
    "no": "37",
    "iconKey": "Deer",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Deer_icon_normal.webp"
  },
  {
    "no": "37B",
    "iconKey": "Deer_Ground",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Deer_Ground_icon_normal.webp"
  },
  {
    "no": "38",
    "iconKey": "HawkBird",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_HawkBird_icon_normal.webp"
  },
  {
    "no": "39",
    "iconKey": "PinkRabbit",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_PinkRabbit_icon_normal.webp"
  },
  {
    "no": "39B",
    "iconKey": "PinkRabbit_Grass",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_PinkRabbit_Grass_icon_normal.webp"
  },
  {
    "no": "40",
    "iconKey": "Baphomet",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Baphomet_icon_normal.webp"
  },
  {
    "no": "40B",
    "iconKey": "Baphomet_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Baphomet_Dark_icon_normal.webp"
  },
  {
    "no": "41",
    "iconKey": "CuteButterfly",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CuteButterfly_icon_normal.webp"
  },
  {
    "no": "42",
    "iconKey": "FlameBuffalo",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FlameBuffalo_icon_normal.webp"
  },
  {
    "no": "43",
    "iconKey": "LazyCatfish",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LazyCatfish_icon_normal.webp"
  },
  {
    "no": "43B",
    "iconKey": "LazyCatfish_Gold",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LazyCatfish_Gold_icon_normal.webp"
  },
  {
    "no": "44",
    "iconKey": "DarkCrow",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_DarkCrow_icon_normal.webp"
  },
  {
    "no": "45",
    "iconKey": "LizardMan",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LizardMan_icon_normal.webp"
  },
  {
    "no": "45B",
    "iconKey": "LizardMan_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LizardMan_Fire_icon_normal.webp"
  },
  {
    "no": "46",
    "iconKey": "Werewolf",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Werewolf_icon_normal.webp"
  },
  {
    "no": "46B",
    "iconKey": "Werewolf_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Werewolf_Ice_icon_normal.webp"
  },
  {
    "no": "47",
    "iconKey": "Eagle",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Eagle_icon_normal.webp"
  },
  {
    "no": "48",
    "iconKey": "RobinHood",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_RobinHood_icon_normal.webp"
  },
  {
    "no": "48B",
    "iconKey": "RobinHood_Ground",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_RobinHood_Ground_icon_normal.webp"
  },
  {
    "no": "49",
    "iconKey": "Gorilla",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Gorilla_icon_normal.webp"
  },
  {
    "no": "49B",
    "iconKey": "Gorilla_Ground",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Gorilla_Ground_icon_normal.webp"
  },
  {
    "no": "50",
    "iconKey": "SoldierBee",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SoldierBee_icon_normal.webp"
  },
  {
    "no": "51",
    "iconKey": "QueenBee",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_QueenBee_icon_normal.webp"
  },
  {
    "no": "52",
    "iconKey": "NaughtyCat",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_NaughtyCat_icon_normal.webp"
  },
  {
    "no": "53",
    "iconKey": "MopBaby",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_MopBaby_icon_normal.webp"
  },
  {
    "no": "54",
    "iconKey": "MopKing",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_MopKing_icon_normal.webp"
  },
  {
    "no": "55",
    "iconKey": "WeaselDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WeaselDragon_icon_normal.webp"
  },
  {
    "no": "55B",
    "iconKey": "WeaselDragon_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WeaselDragon_Fire_icon_normal.webp"
  },
  {
    "no": "56",
    "iconKey": "Kirin",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Kirin_icon_normal.webp"
  },
  {
    "no": "57",
    "iconKey": "IceFox",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_IceFox_icon_normal.webp"
  },
  {
    "no": "58",
    "iconKey": "FireKirin",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FireKirin_icon_normal.webp"
  },
  {
    "no": "58B",
    "iconKey": "FireKirin_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FireKirin_Dark_icon_normal.webp"
  },
  {
    "no": "59",
    "iconKey": "IceDeer",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_IceDeer_icon_normal.webp"
  },
  {
    "no": "60",
    "iconKey": "ThunderDog",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_ThunderDog_icon_normal.webp"
  },
  {
    "no": "61",
    "iconKey": "AmaterasuWolf",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_AmaterasuWolf_icon_normal.webp"
  },
  {
    "no": "61B",
    "iconKey": "AmaterasuWolf_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_AmaterasuWolf_Dark_icon_normal.webp"
  },
  {
    "no": "62",
    "iconKey": "RaijinDaughter",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_RaijinDaughter_icon_normal.webp"
  },
  {
    "no": "62B",
    "iconKey": "RaijinDaughter_Water",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_RaijinDaughter_Water_icon_normal.webp"
  },
  {
    "no": "63",
    "iconKey": "Mutant",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Mutant_icon_normal.webp"
  },
  {
    "no": "64",
    "iconKey": "FlowerDinosaur",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FlowerDinosaur_icon_normal.webp"
  },
  {
    "no": "64B",
    "iconKey": "FlowerDinosaur_Electric",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FlowerDinosaur_Electric_icon_normal.webp"
  },
  {
    "no": "65",
    "iconKey": "Serpent",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Serpent_icon_normal.webp"
  },
  {
    "no": "65B",
    "iconKey": "Serpent_Ground",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Serpent_Ground_icon_normal.webp"
  },
  {
    "no": "66",
    "iconKey": "GhostBeast",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GhostBeast_icon_normal.webp"
  },
  {
    "no": "67",
    "iconKey": "DrillGame",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_DrillGame_icon_normal.webp"
  },
  {
    "no": "68",
    "iconKey": "CatBat",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CatBat_icon_normal.webp"
  },
  {
    "no": "69",
    "iconKey": "PinkLizard",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_PinkLizard_icon_normal.webp"
  },
  {
    "no": "70",
    "iconKey": "LavaGirl",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LavaGirl_icon_normal.webp"
  },
  {
    "no": "71",
    "iconKey": "BirdDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BirdDragon_icon_normal.webp"
  },
  {
    "no": "71B",
    "iconKey": "BirdDragon_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BirdDragon_Ice_icon_normal.webp"
  },
  {
    "no": "72",
    "iconKey": "Ronin",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Ronin_icon_normal.webp"
  },
  {
    "no": "72B",
    "iconKey": "Ronin_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Ronin_Dark_icon_normal.webp"
  },
  {
    "no": "73",
    "iconKey": "ThunderBird",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_ThunderBird_icon_normal.webp"
  },
  {
    "no": "74",
    "iconKey": "RedArmorBird",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_RedArmorBird_icon_normal.webp"
  },
  {
    "no": "75",
    "iconKey": "CatMage",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CatMage_icon_normal.webp"
  },
  {
    "no": "75B",
    "iconKey": "CatMage_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CatMage_Fire_icon_normal.webp"
  },
  {
    "no": "76",
    "iconKey": "FoxMage",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FoxMage_icon_normal.webp"
  },
  {
    "no": "76B",
    "iconKey": "FoxMage_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FoxMage_Dark_icon_normal.webp"
  },
  {
    "no": "77",
    "iconKey": "GrassRabbitMan",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GrassRabbitMan_icon_normal.webp"
  },
  {
    "no": "78",
    "iconKey": "VioletFairy",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_VioletFairy_icon_normal.webp"
  },
  {
    "no": "79",
    "iconKey": "WhiteMoth",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WhiteMoth_icon_normal.webp"
  },
  {
    "no": "80",
    "iconKey": "FairyDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FairyDragon_icon_normal.webp"
  },
  {
    "no": "80B",
    "iconKey": "FairyDragon_Water",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FairyDragon_Water_icon_normal.webp"
  },
  {
    "no": "81",
    "iconKey": "Kelpie",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Kelpie_icon_normal.webp"
  },
  {
    "no": "81B",
    "iconKey": "Kelpie_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Kelpie_Fire_icon_normal.webp"
  },
  {
    "no": "82",
    "iconKey": "BlueDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BlueDragon_icon_normal.webp"
  },
  {
    "no": "82B",
    "iconKey": "BlueDragon_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BlueDragon_Ice_icon_normal.webp"
  },
  {
    "no": "83",
    "iconKey": "WhiteTiger",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WhiteTiger_icon_normal.webp"
  },
  {
    "no": "83B",
    "iconKey": "WhiteTiger_Ground",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WhiteTiger_Ground_icon_normal.webp"
  },
  {
    "no": "84",
    "iconKey": "Manticore",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Manticore_icon_normal.webp"
  },
  {
    "no": "84B",
    "iconKey": "Manticore_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Manticore_Dark_icon_normal.webp"
  },
  {
    "no": "85",
    "iconKey": "LazyDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LazyDragon_icon_normal.webp"
  },
  {
    "no": "85B",
    "iconKey": "LazyDragon_Electric",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LazyDragon_Electric_icon_normal.webp"
  },
  {
    "no": "86",
    "iconKey": "SakuraSaurus",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SakuraSaurus_icon_normal.webp"
  },
  {
    "no": "86B",
    "iconKey": "SakuraSaurus_Water",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SakuraSaurus_Water_icon_normal.webp"
  },
  {
    "no": "87",
    "iconKey": "FlowerDoll",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FlowerDoll_icon_normal.webp"
  },
  {
    "no": "88",
    "iconKey": "VolcanicMonster",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_VolcanicMonster_icon_normal.webp"
  },
  {
    "no": "88B",
    "iconKey": "VolcanicMonster_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_VolcanicMonster_Ice_icon_normal.webp"
  },
  {
    "no": "89",
    "iconKey": "KingAlpaca",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_KingAlpaca_icon_normal.webp"
  },
  {
    "no": "89B",
    "iconKey": "KingAlpaca_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_KingAlpaca_Ice_icon_normal.webp"
  },
  {
    "no": "90",
    "iconKey": "GrassMammoth",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GrassMammoth_icon_normal.webp"
  },
  {
    "no": "90B",
    "iconKey": "GrassMammoth_Ice",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GrassMammoth_Ice_icon_normal.webp"
  },
  {
    "no": "91",
    "iconKey": "Yeti",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Yeti_icon_normal.webp"
  },
  {
    "no": "91B",
    "iconKey": "Yeti_Grass",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Yeti_Grass_icon_normal.webp"
  },
  {
    "no": "92",
    "iconKey": "HerculesBeetle",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_HerculesBeetle_icon_normal.webp"
  },
  {
    "no": "92B",
    "iconKey": "HerculesBeetle_Ground",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_HerculesBeetle_Ground_icon_normal.webp"
  },
  {
    "no": "93",
    "iconKey": "FengyunDeeper",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FengyunDeeper_icon_normal.webp"
  },
  {
    "no": "94",
    "iconKey": "CatVampire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CatVampire_icon_normal.webp"
  },
  {
    "no": "95",
    "iconKey": "SkyDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SkyDragon_icon_normal.webp"
  },
  {
    "no": "95B",
    "iconKey": "SkyDragon_Grass",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SkyDragon_Grass_icon_normal.webp"
  },
  {
    "no": "96",
    "iconKey": "KingBahamut",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_KingBahamut_icon_normal.webp"
  },
  {
    "no": "96B",
    "iconKey": "KingBahamut_Dragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_KingBahamut_Dragon_icon_normal.webp"
  },
  {
    "no": "97",
    "iconKey": "HadesBird",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_HadesBird_icon_normal.webp"
  },
  {
    "no": "97B",
    "iconKey": "HadesBird_Electric",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_HadesBird_Electric_icon_normal.webp"
  },
  {
    "no": "98",
    "iconKey": "BlackMetalDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BlackMetalDragon_icon_normal.webp"
  },
  {
    "no": "99",
    "iconKey": "DarkScorpion",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_DarkScorpion_icon_normal.webp"
  },
  {
    "no": "99B",
    "iconKey": "DarkScorpion_Ground",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_DarkScorpion_Ground_icon_normal.webp"
  },
  {
    "no": "100",
    "iconKey": "Anubis",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Anubis_icon_normal.webp"
  },
  {
    "no": "101",
    "iconKey": "Umihebi",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Umihebi_icon_normal.webp"
  },
  {
    "no": "101B",
    "iconKey": "Umihebi_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Umihebi_Fire_icon_normal.webp"
  },
  {
    "no": "102",
    "iconKey": "Suzaku",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Suzaku_icon_normal.webp"
  },
  {
    "no": "102B",
    "iconKey": "Suzaku_Water",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Suzaku_Water_icon_normal.webp"
  },
  {
    "no": "103",
    "iconKey": "ElecPanda",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_ElecPanda_icon_normal.webp"
  },
  {
    "no": "104",
    "iconKey": "LilyQueen",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LilyQueen_icon_normal.webp"
  },
  {
    "no": "104B",
    "iconKey": "LilyQueen_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LilyQueen_Dark_icon_normal.webp"
  },
  {
    "no": "105",
    "iconKey": "Horus",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Horus_icon_normal.webp"
  },
  {
    "no": "105B",
    "iconKey": "Horus_Water",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Horus_Water_icon_normal.webp"
  },
  {
    "no": "106",
    "iconKey": "ThunderDragonMan",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_ThunderDragonMan_icon_normal.webp"
  },
  {
    "no": "107",
    "iconKey": "BlackGriffon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BlackGriffon_icon_normal.webp"
  },
  {
    "no": "108",
    "iconKey": "SaintCentaur",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SaintCentaur_icon_normal.webp"
  },
  {
    "no": "109",
    "iconKey": "BlackCentaur",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BlackCentaur_icon_normal.webp"
  },
  {
    "no": "110",
    "iconKey": "IceHorse",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_IceHorse_icon_normal.webp"
  },
  {
    "no": "110B",
    "iconKey": "IceHorse_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_IceHorse_Dark_icon_normal.webp"
  },
  {
    "no": "111",
    "iconKey": "JetDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_JetDragon_icon_normal.webp"
  },
  {
    "no": "112",
    "iconKey": "NightLady",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_NightLady_icon_normal.webp"
  },
  {
    "no": "112B",
    "iconKey": "NightLady_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_NightLady_Dark_icon_normal.webp"
  },
  {
    "no": "113",
    "iconKey": "MoonQueen",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_MoonQueen_icon_normal.webp"
  },
  {
    "no": "114",
    "iconKey": "KendoFrog",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_KendoFrog_icon_normal.webp"
  },
  {
    "no": "114B",
    "iconKey": "KendoFrog_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_KendoFrog_Dark_icon_normal.webp"
  },
  {
    "no": "115",
    "iconKey": "LeafPrincess",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LeafPrincess_icon_normal.webp"
  },
  {
    "no": "116",
    "iconKey": "MushroomDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_MushroomDragon_icon_normal.webp"
  },
  {
    "no": "116B",
    "iconKey": "MushroomDragon_Dark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_MushroomDragon_Dark_icon_normal.webp"
  },
  {
    "no": "117",
    "iconKey": "SmallArmadillo",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SmallArmadillo_icon_normal.webp"
  },
  {
    "no": "118",
    "iconKey": "CandleGhost",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_CandleGhost_icon_normal.webp"
  },
  {
    "no": "119",
    "iconKey": "ScorpionMan",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_ScorpionMan_icon_normal.webp"
  },
  {
    "no": "120",
    "iconKey": "WingGolem",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WingGolem_icon_normal.webp"
  },
  {
    "no": "121",
    "iconKey": "GuardianDog",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GuardianDog_icon_normal.webp"
  },
  {
    "no": "122",
    "iconKey": "SifuDog",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SifuDog_icon_normal.webp"
  },
  {
    "no": "123",
    "iconKey": "FeatherOstrich",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_FeatherOstrich_icon_normal.webp"
  },
  {
    "no": "124",
    "iconKey": "MimicDog",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_MimicDog_icon_normal.webp"
  },
  {
    "no": "125",
    "iconKey": "DarkAlien",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_DarkAlien_icon_normal.webp"
  },
  {
    "no": "126",
    "iconKey": "WhiteAlienDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WhiteAlienDragon_icon_normal.webp"
  },
  {
    "no": "127",
    "iconKey": "DarkMechaDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_DarkMechaDragon_icon_normal.webp"
  },
  {
    "no": "128",
    "iconKey": "GhostRabbit",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GhostRabbit_icon_normal.webp"
  },
  {
    "no": "129",
    "iconKey": "NightBlueHorse",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_NightBlueHorse_icon_normal.webp"
  },
  {
    "no": "130",
    "iconKey": "WhiteShieldDragon",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WhiteShieldDragon_icon_normal.webp"
  },
  {
    "no": "131",
    "iconKey": "BlackPuppy",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BlackPuppy_icon_normal.webp"
  },
  {
    "no": "132",
    "iconKey": "WhiteDeer",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_WhiteDeer_icon_normal.webp"
  },
  {
    "no": "133",
    "iconKey": "MysteryMask",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_MysteryMask_icon_normal.webp"
  },
  {
    "no": "134",
    "iconKey": "GrimGirl",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GrimGirl_icon_normal.webp"
  },
  {
    "no": "135",
    "iconKey": "PurpleSpider",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_PurpleSpider_icon_normal.webp"
  },
  {
    "no": "136",
    "iconKey": "BlueThunderHorse",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BlueThunderHorse_icon_normal.webp"
  },
  {
    "no": "137",
    "iconKey": "SnowTigerBeastman",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SnowTigerBeastman_icon_normal.webp"
  },
  {
    "no": "138",
    "iconKey": "BlueberryFairy",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BlueberryFairy_icon_normal.webp"
  },
  {
    "no": "139",
    "iconKey": "BadCatgirl",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_BadCatgirl_icon_normal.webp"
  },
  {
    "no": "140",
    "iconKey": "GoldenHorse",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GoldenHorse_icon_normal.webp"
  },
  {
    "no": "141",
    "iconKey": "LeafMomonga",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LeafMomonga_icon_normal.webp"
  },
  {
    "no": "142",
    "iconKey": "IceWitch",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_IceWitch_icon_normal.webp"
  },
  {
    "no": "143",
    "iconKey": "SnowPeafowl",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_SnowPeafowl_icon_normal.webp"
  },
  {
    "no": "144",
    "iconKey": "TropicalOstrich",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_TropicalOstrich_icon_normal.webp"
  },
  {
    "no": "145",
    "iconKey": "Plesiosaur",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_Plesiosaur_icon_normal.webp"
  },
  {
    "no": "146",
    "iconKey": "IceCrocodile",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_IceCrocodile_icon_normal.webp"
  },
  {
    "no": "147",
    "iconKey": "IceSeal",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_IceSeal_icon_normal.webp"
  },
  {
    "no": "148",
    "iconKey": "TentacleTurtle",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_TentacleTurtle_icon_normal.webp"
  },
  {
    "no": "148B",
    "iconKey": "TentacleTurtle_Ground",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_TentacleTurtle_Ground_icon_normal.webp"
  },
  {
    "no": "149",
    "iconKey": "JellyfishGhost",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_JellyfishGhost_icon_normal.webp"
  },
  {
    "no": "150",
    "iconKey": "JellyfishFairy",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_JellyfishFairy_icon_normal.webp"
  },
  {
    "no": "151",
    "iconKey": "OctopusGirl",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_OctopusGirl_icon_normal.webp"
  },
  {
    "no": "152",
    "iconKey": "StuffedShark",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_StuffedShark_icon_normal.webp"
  },
  {
    "no": "152B",
    "iconKey": "StuffedShark_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_StuffedShark_Fire_icon_normal.webp"
  },
  {
    "no": "153",
    "iconKey": "GhostAnglerfish",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GhostAnglerfish_icon_normal.webp"
  },
  {
    "no": "153B",
    "iconKey": "GhostAnglerfish_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_GhostAnglerfish_Fire_icon_normal.webp"
  },
  {
    "no": "154",
    "iconKey": "IceNarwhal",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_IceNarwhal_icon_normal.webp"
  },
  {
    "no": "154B",
    "iconKey": "IceNarwhal_Fire",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_IceNarwhal_Fire_icon_normal.webp"
  },
  {
    "no": "155",
    "iconKey": "PoseidonOrca",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_PoseidonOrca_icon_normal.webp"
  },
  {
    "no": "156",
    "iconKey": "LegendDeer",
    "icon": "https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_LegendDeer_icon_normal.webp"
  }
];

const PALDB_JP_ICON_OVERRIDES = {
  "ベノッポ": "MushroomDragon_Dark",
  "キノッポ": "MushroomDragon",
  "カバネドリ": "BirdDragon",
  "グラクレス": "HerculesBeetle",
  "クレメーオ": "CatMage",
  "オーマサンダ": "ThunderDragonMan",
  "アヌビス": "Anubis",
  "ササゾー": "GrassPanda",
  "ライゾー": "GrassPanda_Electric",
  "シメナワ": "WindChimes",
  "オバケナワ": "WindChimes_Ice",
  "イシス": "Bastet",
  "ツララジカ": "IceDeer",
  "レヴィドラ": "Umihebi",
  "アグニドラ": "Umihebi_Fire",
  "スザク": "Suzaku",
  "シヴァ": "Suzaku_Water",
  "ホルス": "Horus",
  "エレパンダ": "ElecPanda",
  "ゼノグリフ": "BlackGriffon",
  "クインビーナ": "QueenBee",
  "ライバード": "ThunderBird"
};

const PALDB_OVERRIDE_PRIORITY_NAMES = new Set();

const ROOM_ID = getRoomId();
const UNKNOWN_PAL_ICON = "assets/pal-unknown.png";
const UNKNOWN_PAL_LABEL = "未発見";
const DEFAULT_RECORDERS = ["福冨", "森井"];
const DEFAULT_RECORDER_COLORS = {
  "福冨": "#3c92df",
  "森井": "#4ebd69"
};
const RECORDER_STORAGE_KEY = "palBoardRecorder";
const RECORDER_LIST_STORAGE_PREFIX = "pal-breeding-recorders:";
const RECORDER_COLOR_STORAGE_PREFIX = "pal-breeding-recorder-colors:";
const WORLD_NAME_STORAGE_PREFIX = "pal-breeding-world-name:";
const state = {
  records: [],
  selectedId: null,
  firebaseReady: false,
  db: null,
  dbApi: null,
  dbRef: null,
  dbMetaRef: null,
  palSource: "内蔵リスト",
  recorders: loadRecorderList(),
  recorderColors: loadRecorderColors(),
  currentRecorder: localStorage.getItem(RECORDER_STORAGE_KEY) || "",
  worldName: localStorage.getItem(worldNameLocalKey()) || "",
  palMap: new Map(),
  palNames: [],
  paldbIcons: [...PALDB_STATIC_ICONS],
  passiveNames: [...EMBEDDED_PASSIVES],
  pickers: {},
  passivePickers: {},
  eggPickers: {},
  eggQuickSize: "通常",
  filterIconMap: {},
  selectedElements: [],
  selectedWorks: [],
  currentView: "records",
};

const $ = (id) => document.getElementById(id);
const elements = {
  parentFilter: $("parentFilter"),
  resultFilter: $("resultFilter"),
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
  userDialog: $("userDialog"),
  userForm: $("userForm"),
  startupRecorder: $("startupRecorder"),
  currentRecorderSelect: $("currentRecorderSelect"),
  currentRecorderLabel: $("currentRecorderLabel"),
  currentRecorderDot: $("currentRecorderDot"),
  manageUsers: $("manageUsers"),
  recorderManageDialog: $("recorderManageDialog"),
  recorderManageForm: $("recorderManageForm"),
  closeRecorderManage: $("closeRecorderManage"),
  newRecorderName: $("newRecorderName"),
  newRecorderColor: $("newRecorderColor"),
  recorderList: $("recorderList"),
  worldNameInput: $("worldNameInput"),
  worldNameBadge: $("worldNameBadge"),
  toast: $("toast"),
  dialogMessage: $("dialogMessage"),
  palDataState: $("palDataState"),
};

init();

async function init() {
  mergePalData(EMBEDDED_PALS, "内蔵リスト");
  mergePalData(CURRENT_CRITICAL_PALS, "Palworld 1.0重要補正");
  mergePalData(V1_RELEASE_FALLBACK_PALS, "Palworld 1.0内蔵");
  try { verifyBuiltInReleaseData(); } catch (error) { console.warn("Palworld 1.0内蔵データ検証警告:", error); }
  loadCachedCurrentRoster();
  setupPalOptions();
  syncRecorderUi();
  syncWorldNameUi();
  setupEvents();
  setupPalPickers();
  setupEggPickers();
  setupIconFilters();
  await setupStorage();
  render();

  // 1.0では図鑑番号が全面的に再編されたため、旧Palworld Lab/旧PalDB HTMLキャッシュは
  // 読み込まず、バージョン固定された構造化データだけを同期します。
  void loadCurrentRosterData();
  showUserDialogIfNeeded();
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
  applyPaldbIconsToPalMap(false);
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

function setupPassiveOptions(keepValues = false) {
  const oldValues = keepValues ? getPassiveInputs().map(input => input.value) : [];
  state.passiveNames = uniqueStrings(state.passiveNames).sort((a, b) => a.localeCompare(b, "ja"));
  const datalist = $("passiveOptions");
  if (datalist) datalist.innerHTML = state.passiveNames.map(name => `<option value="${escapeHtml(name)}"></option>`).join("");
  if (keepValues) getPassiveInputs().forEach((input, index) => { input.value = oldValues[index] || ""; });
}

function loadCachedPassiveData() {
  try {
    const cached = JSON.parse(localStorage.getItem(PASSIVE_CACHE_KEY) || "null");
    if (cached?.passives?.length >= 50) {
      state.passiveNames = uniqueStrings([...state.passiveNames, ...cached.passives]);
      setupPassiveOptions(true);
    }
  } catch (error) {
    console.warn("Passive cache read failed", error);
  }
}

async function loadPassiveData() {
  const endpoints = [PASSIVE_SOURCE_URL, PASSIVE_SOURCE_PROXY_URL];
  let lastError = null;
  for (const url of endpoints) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const html = await response.text();
      const passives = parsePassivesHtml(html);
      if (passives.length < 50) throw new Error(`取得数が少なすぎます: ${passives.length}`);
      state.passiveNames = uniqueStrings([...state.passiveNames, ...passives]);
      localStorage.setItem(PASSIVE_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), passives: state.passiveNames }));
      setupPassiveOptions(true);
      toast(`Palworld Labから${passives.length}種類のパッシブ候補を読み込みました`);
      return;
    } catch (error) {
      lastError = error;
      console.warn("Passive sync failed:", url, error);
    }
  }
  console.warn("Passive sync gave up:", lastError);
}

function parsePassivesHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const found = [];
  for (const link of doc.querySelectorAll("a")) {
    const text = link.textContent.replace(/\s+/g, " ").trim();
    const name = text.split(" ")[0];
    if (isLikelyPassiveName(name)) found.push(name);
  }
  const bodyText = doc.body?.textContent || "";
  for (const name of EMBEDDED_PASSIVES) {
    if (bodyText.includes(name)) found.push(name);
  }
  return uniqueStrings(found);
}

function isLikelyPassiveName(name) {
  if (!name || name.length > 18) return false;
  if (!/[ぁ-んァ-ン一-龠]/.test(name)) return false;
  if (/(一覧|ツール|攻略|ポスト|URL|フィルター|すべて|次へ|前へ|テーマ|ダーク|ライト|自動|手術台|ボス|レイド|野生|特殊|攻撃|防御|属性|移動速度|作業速度|満腹度|その他)/.test(name)) return false;
  return true;
}

function parseFilterIconsFromLabHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const targets = new Set([...ELEMENTS, "夜行性", ...WORKS]);
  const icons = {};
  for (const img of doc.querySelectorAll("img[alt][src]")) {
    const alt = img.getAttribute("alt")?.trim();
    if (!targets.has(alt) || icons[alt]) continue;
    icons[alt] = new URL(img.getAttribute("src"), PAL_SOURCE_URL).href;
  }
  return icons;
}

function applyFilterIcons(icons) {
  if (!icons || !Object.keys(icons).length) return;
  state.filterIconMap = { ...state.filterIconMap, ...icons };
  document.querySelectorAll(".icon-filter-button").forEach(button => {
    const value = button.dataset.value;
    const icon = state.filterIconMap[value];
    const img = button.querySelector("img");
    if (icon && img) img.src = icon;
  });
}

function uniqueStrings(list) {
  return Array.from(new Set((list || []).map(value => String(value || "").trim()).filter(Boolean)));
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
      applyFilterIcons(parseFilterIconsFromLabHtml(html));
      const pals = parsePalworldLabHtml(html);
      if (pals.length < 100) throw new Error(`取得数が少なすぎます: ${pals.length}`);
      localStorage.setItem(PAL_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), pals }));
      mergePalData(pals, `Palworld Lab同期済み ${pals.length}種`);
      setupPalOptions(true);
      render();
      refreshPickerPreviews();
      toast(`Palworld Labから${pals.length}種類のパル情報を読み込みました`);
      applyPaldbIconsToPalMap(true);
      loadPaldbData();
      return;
    } catch (error) {
      lastError = error;
      console.warn("Palworld Lab sync failed:", url, error);
    }
  }
  updatePalDataState(`${state.palSource}で起動中 / 外部同期失敗`);
  console.warn("Palworld Lab sync gave up:", lastError);
}



function verifyBuiltInReleaseData() {
  const names = new Set(V1_RELEASE_FALLBACK_PALS.map(pal => pal.name));
  const required = ["ポチムネ", "シャオロン", "モリタロス", "マグナイト"];
  if (V1_RELEASE_FALLBACK_PALS.length < 72 || required.some(name => !names.has(name))) {
    throw new Error("Palworld 1.0の内蔵追加パルデータが不足しています");
  }
  const queen = CURRENT_CRITICAL_PALS.find(pal => pal.name === "クインビーナ");
  const beakon = CURRENT_CRITICAL_PALS.find(pal => pal.name === "ライバード");
  if (queen?.iconKey !== "QueenBee" || beakon?.iconKey !== "ThunderBird") {
    throw new Error("重要パルの画像紐づけが不正です");
  }
}

function loadCachedCurrentRoster() {
  try {
    const cached = JSON.parse(localStorage.getItem(CURRENT_ROSTER_CACHE_KEY) || "null");
    if (cached?.pals?.length >= 250) {
      verifyCriticalCurrentMappings(cached.pals);
      mergePalData(cached.pals, `Palworld 1.0スナップショット ${cached.pals.length}種`);
    }
  } catch (error) {
    localStorage.removeItem(CURRENT_ROSTER_CACHE_KEY);
    console.warn("Current roster cache read failed", error);
  }
}

function cleanCurrentPalName(value) {
  const name = String(value || "").trim();
  if (!name || name === "-" || /(?:\(BOSS\)|\(襲撃\)|\(狂暴化した\))/.test(name)) return "";
  return name;
}

function currentIconKeyFromAsset(value) {
  return (String(value || "").match(/^T_(.+)_icon_normal$/i) || [])[1] || "";
}

const CURRENT_ELEMENT_MAP = {
  "无": "無属性",
  "無": "無属性",
  "火": "炎属性",
  "水": "水属性",
  "雷": "雷属性",
  "草": "草属性",
  "暗": "闇属性",
  "龙": "竜属性",
  "龍": "竜属性",
  "地": "地属性",
  "冰": "氷属性",
  "氷": "氷属性"
};

const CURRENT_WORK_MAP = {
  "生火": "火おこし",
  "浇水": "水やり",
  "澆水": "水やり",
  "播种": "種まき",
  "播種": "種まき",
  "发电": "発電",
  "發電": "発電",
  "手工": "手作業",
  "采集": "採集",
  "採集": "採集",
  "伐木": "伐採",
  "采矿": "採掘",
  "採礦": "採掘",
  "制药": "製薬",
  "製藥": "製薬",
  "冷却": "冷却",
  "搬运": "運搬",
  "搬運": "運搬",
  "牧场": "牧場",
  "牧場": "牧場"
};

function parseCurrentElements(value) {
  return uniqueStrings(
    String(value || "")
      .split(/[\/／,，;；]/)
      .map(part => CURRENT_ELEMENT_MAP[part.trim()] || "")
  );
}

function parseCurrentWork(value) {
  const result = [];
  for (const part of String(value || "").split(/[；;]/)) {
    const label = part.replace(/\s*Lv\.\s*\d+.*/i, "").trim();
    const mapped = CURRENT_WORK_MAP[label];
    if (mapped && !result.includes(mapped)) result.push(mapped);
  }
  return result;
}

function buildLocalizationMaps(localization) {
  const ja = localization?.ja || {};
  const en = localization?.en || {};
  const japaneseByEnglish = new Map();

  for (const [internalId, englishName] of Object.entries(en)) {
    if (/^(?:BOSS_|RAID_|GYM_|PREDATOR_|SUMMON_|POLICE_|Quest_|NPC_)/i.test(internalId)) continue;
    const japaneseName = cleanCurrentPalName(ja[internalId]);
    if (!japaneseName) continue;
    const englishKey = normalizeKey(String(englishName || "").replace(/\(BOSS\)|\(Raid\)/gi, ""));
    if (englishKey && !japaneseByEnglish.has(englishKey)) japaneseByEnglish.set(englishKey, japaneseName);
  }

  return { ja, japaneseByEnglish };
}

function buildCurrentRoster(localization, manifest, paldbData) {
  const { ja, japaneseByEnglish } = buildLocalizationMaps(localization);
  const iconByEnglish = new Map();

  for (const row of manifest?.partnerSkills || []) {
    const iconKey = currentIconKeyFromAsset(row.displayIconAsset);
    if (!iconKey) continue;
    iconByEnglish.set(normalizeKey(row.pal), {
      iconKey,
      number: String(row.palNumber || "").trim()
    });
  }

  const pals = [];
  const seenNames = new Set();

  for (const row of paldbData?.records || []) {
    const englishName = String(row.name || "").trim();
    const iconInfo = iconByEnglish.get(normalizeKey(englishName)) || {};
    const iconKey = iconInfo.iconKey || "";
    const japaneseName =
      cleanCurrentPalName(ja[iconKey]) ||
      japaneseByEnglish.get(normalizeKey(englishName)) ||
      "";

    if (!japaneseName || seenNames.has(japaneseName)) continue;
    seenNames.add(japaneseName);

    pals.push({
      no: String(row.number || iconInfo.number || "").trim(),
      name: japaneseName,
      en: englishName,
      elements: parseCurrentElements(row.elements),
      work: parseCurrentWork(row.work),
      iconKey,
      icon: iconKey ? paldbIconUrlFromKey(iconKey) : "",
      sortKey: makeSortKey(row.number || iconInfo.number, japaneseName),
      source: "Palworld 1.0現行図鑑"
    });
  }

  return pals;
}

function verifyCriticalCurrentMappings(pals) {
  const byName = new Map(pals.map(pal => [pal.name, pal]));
  const queen = byName.get("クインビーナ");
  const beakon = byName.get("ライバード");
  if (!queen || queen.iconKey !== "QueenBee") {
    throw new Error(`クインビーナの画像紐づけが不正です: ${queen?.iconKey || "未取得"}`);
  }
  if (!beakon || beakon.iconKey !== "ThunderBird") {
    throw new Error(`ライバードの画像紐づけが不正です: ${beakon?.iconKey || "未取得"}`);
  }
}

async function fetchFirstCurrentJson(urls, label) {
  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn(`${label}の取得に失敗しました:`, url, error);
    }
  }
  throw lastError || new Error(`${label}を取得できませんでした`);
}

async function loadCurrentRosterData() {
  try {
    const [localization, manifest, paldbData] = await Promise.all([
      fetchFirstCurrentJson(CURRENT_PAL_LOCALIZATION_URLS, "日本語名データ"),
      fetchFirstCurrentJson(CURRENT_PAL_ICON_MANIFEST_URLS, "画像対応表"),
      fetchFirstCurrentJson(CURRENT_PALDB_DATA_URLS, "PalDB 1.0図鑑データ")
    ]);
    const pals = buildCurrentRoster(localization, manifest, paldbData);
    if (pals.length < 250) throw new Error(`現行図鑑の取得数が少なすぎます: ${pals.length}`);
    verifyCriticalCurrentMappings(pals);

    const newPalNames = new Set(V1_RELEASE_FALLBACK_PALS.map(pal => pal.name));
    const matchedNewPals = pals.filter(pal => newPalNames.has(pal.name));
    if (matchedNewPals.length < 65) {
      throw new Error(`1.0追加パルの照合数が少なすぎます: ${matchedNewPals.length}`);
    }

    localStorage.setItem(CURRENT_ROSTER_CACHE_KEY, JSON.stringify({
      fetchedAt: Date.now(),
      version: paldbData.version || "1.0.0",
      pals
    }));
    mergePalData(pals, `Palworld 1.0現行図鑑 ${pals.length}種`);
    setupPalOptions(true);
    render();
    refreshPickerPreviews();
    console.info(`Palworld 1.0現行図鑑から${pals.length}種類（追加パル照合${matchedNewPals.length}種）を読み込みました`);
  } catch (error) {
    console.warn("Current roster sync failed; using built-in 1.0 fallback", error);
  }
}


function loadCachedPaldbData() {
  try {
    const cached = JSON.parse(localStorage.getItem(PALDB_CACHE_KEY) || "null");
    if (cached?.icons?.length) {
      mergePaldbIconData(cached.icons, false);
      setupPalOptions(true);
      refreshPickerPreviews();
    }
  } catch (error) {
    console.warn("PalDB cache read failed", error);
  }
}

async function loadPaldbData() {
  const endpoints = [PALDB_SOURCE_URL, PALDB_SOURCE_PROXY_URL];
  let lastError = null;
  for (const url of endpoints) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const html = await response.text();
      const icons = parsePaldbHtml(html);
      if (icons.length < 100) throw new Error(`PalDBの取得数が少なすぎます: ${icons.length}`);
      localStorage.setItem(PALDB_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), icons }));
      mergePaldbIconData(icons, false);
      setupPalOptions(true);
      render();
      refreshPickerPreviews();
      console.info(`PalDBから${icons.length}件のパル情報を読み込みました`);
      return;
    } catch (error) {
      lastError = error;
      console.warn("PalDB sync failed:", url, error);
    }
  }
  console.warn("PalDB sync gave up:", lastError);
}

const PALDB_ELEMENT_BY_CODE = {
  "00": "無属性",
  "01": "炎属性",
  "02": "水属性",
  "03": "雷属性",
  "04": "草属性",
  "05": "闇属性",
  "06": "竜属性",
  "07": "地属性",
  "08": "氷属性"
};

const PALDB_WORK_BY_CODE = {
  "00": "火おこし",
  "01": "水やり",
  "02": "種まき",
  "03": "発電",
  "04": "手作業",
  "05": "採集",
  "06": "伐採",
  "07": "採掘",
  "08": "製薬",
  "10": "冷却",
  "11": "運搬",
  "12": "牧場"
};

function parsePaldbHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const pals = [];
  const seen = new Set();

  for (const img of doc.querySelectorAll("img[alt][src]")) {
    const alt = img.getAttribute("alt") || "";
    const compactAlt = alt.replace(/[^A-Za-z0-9]/g, "");
    if (!/^T.+iconnormal$/i.test(compactAlt)) continue;
    if (/palwork|element/i.test(compactAlt)) continue;

    const icon = normalizePaldbImageUrl(img.getAttribute("src"));
    if (!icon) continue;

    const block = findPaldbPalBlock(img, doc);
    const text = block?.textContent || "";
    const no = (text.match(/#\s*(\d+[A-Z]?)/i) || [])[1] || "";
    if (!no) continue;

    const displayName = findPaldbDisplayName(block);
    if (!isLikelyPalName(displayName)) continue;

    const noKey = normalizePalNoKey(no);
    const key = `${noKey}:${normalizeKey(displayName)}:${icon}`;
    if (!noKey || seen.has(key)) continue;
    seen.add(key);

    const iconKey = inferPaldbIconKey(icon);
    const elements = extractPaldbElements(block);
    const work = extractPaldbWorks(block);

    pals.push({
      no,
      name: displayName,
      displayName,
      icon,
      iconKey,
      elements,
      work,
      sortKey: makeSortKey(no, displayName),
      source: "PalDB同期"
    });
  }

  return pals;
}


function normalizePaldbImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("https://cdn.paldb.cc/")) return raw;
  if (raw.startsWith("/image/")) return `https://cdn.paldb.cc${raw}`;
  try {
    return new URL(raw, PALDB_SOURCE_URL).href;
  } catch {
    return "";
  }
}

function inferPaldbIconKey(url) {
  const match = String(url || "").match(/\/T_([^/]+?)_icon_normal\.webp/i);
  return match?.[1] || "";
}

function extractPaldbElements(block) {
  if (!block) return [];
  const found = new Set();
  for (const img of block.querySelectorAll("img[alt][src]")) {
    const text = `${img.getAttribute("alt") || ""} ${img.getAttribute("src") || ""}`;
    const match = text.match(/TIconelements(\d{2})/i);
    const element = match ? PALDB_ELEMENT_BY_CODE[match[1]] : "";
    if (element) found.add(element);
  }
  return Array.from(found);
}

function extractPaldbWorks(block) {
  if (!block) return [];
  const found = new Set();
  for (const img of block.querySelectorAll("img[alt][src]")) {
    const text = `${img.getAttribute("alt") || ""} ${img.getAttribute("src") || ""}`;
    const match = text.match(/Ticonpalwork(\d{2})/i);
    const work = match ? PALDB_WORK_BY_CODE[match[1]] : "";
    if (work) found.add(work);
  }
  return Array.from(found);
}

function findPaldbPalBlock(img, doc) {
  let node = img.parentElement;
  while (node && node !== doc.body) {
    const text = node.textContent || "";
    if (/#\s*\d+[A-Z]?/.test(text) && text.length < 700) return node;
    node = node.parentElement;
  }
  return img.closest("tr, li, article, div");
}

function findPaldbDisplayName(block) {
  if (!block) return "";
  const links = Array.from(block.querySelectorAll("a"))
    .map(link => (link.textContent || "").trim())
    .filter(Boolean)
    .filter(text => !/^#?\d+[A-Z]?$/i.test(text))
    .filter(text => !/Image:/i.test(text));
  return links[0] || "";
}

function mergePaldbIconData(list, shouldRender = true) {
  if (!Array.isArray(list) || !list.length) return;
  const validList = list.filter(item => normalizePalNoKey(item.no) && (item.icon || item.iconKey));
  const merged = new Map();
  for (const item of [...PALDB_STATIC_ICONS, ...(state.paldbIcons || []), ...validList]) {
    const key = `${normalizePalNoKey(item.no)}:${item.iconKey || inferPaldbIconKey(item.icon) || item.icon || ""}`;
    if (!key || key === ":") continue;
    merged.set(key, item);
  }
  state.paldbIcons = Array.from(merged.values());

  const palEntries = validList
    .filter(item => isLikelyPalName(item.name || item.displayName))
    .map(item => ({
      no: item.no,
      name: item.name || item.displayName,
      displayName: item.displayName || item.name,
      icon: item.icon,
      paldbIcon: item.icon,
      iconKey: item.iconKey || inferPaldbIconKey(item.icon),
      elements: Array.isArray(item.elements) ? item.elements : [],
      work: Array.isArray(item.work) ? item.work : [],
      sortKey: item.sortKey ?? makeSortKey(item.no, item.name || item.displayName),
      source: item.source || "PalDB同期"
    }));

  if (palEntries.length) mergePalData(palEntries, `PalDB同期済み ${palEntries.length}種`);
  applyPaldbIconsToPalMap(shouldRender);
}

function normalizePalNoKey(no) {
  const value = String(no || "").trim().toUpperCase();
  // 通常のパルNoだけをPalDB画像Noと照合します。
  // 例: 083 -> 83, 104B -> 104B
  // ただし「テラ01」のような特殊IDは No.01 と誤判定しないよう除外します。
  const match = value.match(/^0*(\d+)([A-Z])?$/);
  if (!match) return "";
  return `${Number(match[1])}${match[2] || ""}`;
}

function getPaldbStaticIconByNo(no) {
  const noKey = normalizePalNoKey(no);
  if (!noKey) return null;
  return PALDB_STATIC_ICONS.find(item => normalizePalNoKey(item.no) === noKey) || null;
}

function paldbIconUrlFromKey(iconKey) {
  const key = String(iconKey || "").trim();
  return key ? `https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_${encodeURIComponent(key)}_icon_normal.webp` : "";
}

function applyPaldbIconsToPalMap(shouldRender = true) {
  if (!state.paldbIcons?.length || !state.palMap?.size) return;

  const byNo = new Map();
  const byEn = new Map();
  const byIconKey = new Map();

  // 1.0では図鑑Noが再編されたため、Noは最後のフォールバックにだけ使います。
  // iconKey（ゲーム内部ID）と日本語/英語名の一致を優先します。
  for (const item of [...PALDB_STATIC_ICONS, ...state.paldbIcons]) {
    const noKey = normalizePalNoKey(item.no);
    const iconKey = item.iconKey || inferPaldbIconKey(item.icon);
    if (noKey && !byNo.has(noKey)) byNo.set(noKey, item);
    if (iconKey && !byIconKey.has(normalizeKey(iconKey))) byIconKey.set(normalizeKey(iconKey), item);
    const enKey = normalizeKey(item.displayName || item.en);
    if (enKey && !byEn.has(enKey)) byEn.set(enKey, item);
  }

  for (const [name, meta] of state.palMap.entries()) {
    const noItem = byNo.get(normalizePalNoKey(meta.no));
    const existingIconKey = meta.iconKey ? normalizeKey(meta.iconKey) : "";
    const overrideKey = PALDB_JP_ICON_OVERRIDES[name] || PALDB_JP_ICON_OVERRIDES[normalizePalName(name)] || "";
    const overrideItem = overrideKey ? byIconKey.get(normalizeKey(overrideKey)) : null;

    const iconKeyItem = existingIconKey ? byIconKey.get(existingIconKey) : null;
    const nameItem =
      byEn.get(normalizeKey(meta.en)) ||
      byEn.get(normalizeKey(name));
    // 1.0で図鑑番号が大幅に変わったため、旧Noより明示的なiconKey・名称を優先します。
    const item =
      overrideItem ||
      iconKeyItem ||
      nameItem ||
      noItem;

    if (item?.icon) {
      meta.paldbIcon = item.icon;
      if (item.iconKey) meta.iconKey = item.iconKey;
      state.palMap.set(name, meta);
    } else if (overrideKey) {
      meta.paldbIcon = paldbIconUrlFromKey(overrideKey);
      meta.iconKey = overrideKey;
      state.palMap.set(name, meta);
    }
  }

  if (shouldRender) {
    render();
    refreshPickerPreviews();
  }
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
  [elements.parentFilter, elements.resultFilter, elements.statusFilter, elements.unverifiedOnly, elements.searchInput, elements.sortSelect]
    .forEach(el => el?.addEventListener("input", render));

  elements.currentRecorderSelect?.addEventListener("change", () => {
    setCurrentRecorder(elements.currentRecorderSelect.value);
  });

  elements.userForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    setCurrentRecorder(elements.startupRecorder.value);
    elements.userDialog.close();
    toast(`${getCurrentRecorder()}で開始しました`);
  });

  elements.manageUsers?.addEventListener("click", () => {
    renderRecorderManager();
    elements.recorderManageDialog?.showModal();
    elements.newRecorderName?.focus();
  });
  elements.closeRecorderManage?.addEventListener("click", () => elements.recorderManageDialog?.close());
  elements.recorderManageForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await addRecorderFromForm();
  });

  let worldNameTimer = null;
  elements.worldNameInput?.addEventListener("input", () => {
    state.worldName = elements.worldNameInput.value.trim();
    syncWorldNameUi(false);
    clearTimeout(worldNameTimer);
    worldNameTimer = setTimeout(() => saveWorldName(), 450);
  });

  document.querySelectorAll(".nav-item[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      state.currentView = button.dataset.view || "records";
      syncNavItems();
      render();
    });
  });

  $("clearFilters").addEventListener("click", () => {
    elements.parentFilter.value = "";
    elements.resultFilter.value = "";
    state.selectedElements = [];
    state.selectedWorks = [];
    syncIconFilterButtons();
    elements.statusFilter.value = "";
    if (elements.favoriteOnly) elements.favoriteOnly.checked = false;
    elements.unverifiedOnly.checked = false;
    elements.searchInput.value = "";
    state.currentView = "records";
    syncNavItems();
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
  $("copyRoomLink")?.addEventListener("click", copyRoomLink);

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

function setupIconFilters() {
  document.querySelectorAll(".icon-filter-button").forEach(button => {
    button.addEventListener("click", () => {
      const type = button.dataset.filterType;
      const value = button.dataset.value;
      const key = type === "element" ? "selectedElements" : "selectedWorks";
      const list = new Set(state[key]);
      if (list.has(value)) list.delete(value); else list.add(value);
      state[key] = Array.from(list);
      syncIconFilterButtons();
      render();
    });
  });
  syncIconFilterButtons();
}

function syncIconFilterButtons() {
  document.querySelectorAll('.icon-filter-button').forEach(button => {
    const type = button.dataset.filterType;
    const value = button.dataset.value;
    const active = type === 'element' ? state.selectedElements.includes(value) : state.selectedWorks.includes(value);
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function syncNavItems() {
  document.querySelectorAll(".nav-item[data-view]").forEach(button => {
    const active = button.dataset.view === state.currentView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
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

function setupPassivePickers() {
  for (const id of ["passive1", "passive2", "passive3", "passive4"]) {
    const input = $(id);
    if (!input) continue;
    const picker = input.closest(".passive-picker");
    const list = picker?.querySelector(".passive-suggestions");
    state.passivePickers[id] = { input, picker, list };
    input.addEventListener("input", () => renderPassiveSuggestions(id));
    input.addEventListener("focus", () => renderPassiveSuggestions(id));
    input.addEventListener("keydown", (event) => { if (event.key === "Escape") hidePassiveSuggestions(id); });
  }

  document.addEventListener("click", (event) => {
    for (const id of Object.keys(state.passivePickers)) {
      if (!state.passivePickers[id].picker.contains(event.target)) hidePassiveSuggestions(id);
    }
  });
}

function renderPassiveSuggestions(id) {
  const picker = state.passivePickers[id];
  if (!picker?.list) return;
  const query = normalizeSearch(picker.input.value);
  const used = new Set(getPassiveInputs().filter(input => input.id !== id).map(input => input.value.trim()).filter(Boolean));
  const candidates = state.passiveNames
    .filter(name => !used.has(name))
    .filter(name => !query || normalizeSearch(name).includes(query))
    .slice(0, 80);
  if (!candidates.length) {
    picker.list.innerHTML = `<div class="passive-suggestion is-empty">候補にありません。このまま自由入力できます。</div>`;
  } else {
    picker.list.innerHTML = candidates.map(name => `<button type="button" class="passive-suggestion" data-name="${escapeHtml(name)}"><span class="passive-dot"></span><strong>${escapeHtml(name)}</strong></button>`).join("");
  }
  picker.list.querySelectorAll("button[data-name]").forEach(button => {
    button.addEventListener("click", () => {
      picker.input.value = button.dataset.name;
      hidePassiveSuggestions(id);
      picker.input.dispatchEvent(new Event("input", { bubbles: true }));
      picker.input.focus();
    });
  });
  picker.list.hidden = false;
}

function hidePassiveSuggestions(id) {
  const list = state.passivePickers[id]?.list;
  if (list) list.hidden = true;
}

function getPassiveInputs() {
  return ["passive1", "passive2", "passive3", "passive4"].map(id => $(id)).filter(Boolean);
}

function collectPassiveInputs() {
  return uniqueStrings(getPassiveInputs().map(input => input.value)).slice(0, 4);
}

function updatePickerPreview(id) {
  const picker = state.pickers[id];
  if (!picker?.preview) return;
  const name = normalizePalName(picker.input.value);
  if (!name && id.endsWith("Filter")) {
    picker.preview.innerHTML = `<span class="pal-icon small filter-any"><span class="pal-fallback">全</span></span>`;
    return;
  }
  picker.preview.innerHTML = palIcon(name, "small", { reveal: isPalDiscovered(name) });
}

function refreshPickerPreviews() {
  for (const id of Object.keys(state.pickers)) updatePickerPreview(id);
  refreshEggPreviews();
}

function renderPickerSuggestions(id) {
  const picker = state.pickers[id];
  if (!picker?.list) return;
  const raw = picker.input.value.trim();
  // normalizeSearchでひらがな→カタカナ変換して比較します。
  const query = normalizeSearch(raw);
  const isFilter = id.endsWith("Filter");
  const candidates = state.palNames
    .filter(name => {
      const meta = getPalMeta(name);
      const target = normalizeSearch([name, meta?.displayName, meta?.no].filter(Boolean).join(" "));
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
      return `<button type="button" class="pal-suggestion" data-name="${escapeHtml(name)}">${palIcon(name, "small", { reveal: isPalDiscovered(name) })}<span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(sub || meta.en || "")}</small></span></button>`;
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


function setupEggPickers() {
  for (const id of ["eggType"]) {
    const input = $(id);
    if (!input) continue;
    const picker = input.closest(".egg-picker");
    const preview = picker?.querySelector(".egg-picker-preview");
    const list = picker?.querySelector(".egg-suggestions");
    state.eggPickers[id] = { input, picker, preview, list };

    input.addEventListener("input", () => {
      updateEggPreview(id);
      renderEggSuggestions(id);
      renderEggQuickSelect();
    });
    input.addEventListener("focus", () => renderEggSuggestions(id));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hideEggSuggestions(id);
    });
  }

  const quick = $("eggQuickSelect");
  quick?.addEventListener("click", (event) => {
    const sizeButton = event.target.closest("[data-egg-size]");
    if (sizeButton && quick.contains(sizeButton)) {
      setEggQuickSize(sizeButton.dataset.eggSize);
      return;
    }

    const eggButton = event.target.closest("[data-egg-key]");
    if (eggButton && quick.contains(eggButton)) {
      selectQuickEgg(eggButton.dataset.eggKey);
    }
  });

  renderEggQuickSelect();

  document.addEventListener("click", (event) => {
    for (const id of Object.keys(state.eggPickers)) {
      if (!state.eggPickers[id].picker.contains(event.target)) hideEggSuggestions(id);
    }
  });
}

function getEggBaseTypes() {
  return EGG_TYPES.filter(egg => egg.size === "通常");
}

function getEggByKeyAndSize(key, size = state.eggQuickSize) {
  return EGG_TYPES.find(egg => egg.key === key && egg.size === size) ||
    EGG_TYPES.find(egg => egg.key === key && egg.size === "通常") ||
    null;
}

function eggBaseLabel(name) {
  return String(name || "").replace(/タマゴ$/, "");
}

function setEggQuickSize(size = "通常") {
  const allowed = ["通常", "デカ", "キョダイ"];
  state.eggQuickSize = allowed.includes(size) ? size : "通常";

  const input = $("eggType");
  const current = getEggMeta(input?.value || "");
  if (input && current?.key) {
    const next = getEggByKeyAndSize(current.key, state.eggQuickSize);
    if (next) {
      input.value = next.name;
      updateEggPreview("eggType");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  renderEggQuickSelect();
}

function selectQuickEgg(key) {
  const input = $("eggType");
  if (!input) return;

  if (!key) {
    input.value = "";
  } else {
    const egg = getEggByKeyAndSize(key, state.eggQuickSize);
    if (!egg) return;
    input.value = egg.name;
  }

  updateEggPreview("eggType");
  hideEggSuggestions("eggType");
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function renderEggQuickSelect() {
  const quick = $("eggQuickSelect");
  const input = $("eggType");
  if (!quick || !input) return;

  const current = getEggMeta(input.value);
  if (current?.size) state.eggQuickSize = current.size;

  const sizes = ["通常", "デカ", "キョダイ"];
  const activeKey = current?.key || "";

  quick.innerHTML = `
    <div class="egg-quick-head">
      <span>すばやく選択</span>
      <button type="button" class="egg-quick-clear" data-egg-key="">未設定にする</button>
    </div>
    <div class="egg-size-tabs" role="group" aria-label="タマゴの大きさ">
      ${sizes.map(size => `<button type="button" class="egg-size-tab ${state.eggQuickSize === size ? "is-active" : ""}" data-egg-size="${escapeHtml(size)}">${escapeHtml(size)}</button>`).join("")}
    </div>
    <div class="egg-type-quick-grid">
      ${getEggBaseTypes().map(egg => {
        const selected = activeKey === egg.key;
        const selectedEgg = getEggByKeyAndSize(egg.key, state.eggQuickSize) || egg;
        return `<button type="button" class="egg-type-quick ${selected ? "is-active" : ""}" data-egg-key="${escapeHtml(egg.key)}" title="${escapeHtml(selectedEgg.name)}">
          ${eggIcon(selectedEgg.name, "small")}
          <span>${escapeHtml(eggBaseLabel(egg.name))}</span>
        </button>`;
      }).join("")}
    </div>`;
}

function updateEggPreview(id) {
  const picker = state.eggPickers[id];
  if (!picker?.preview) return;
  picker.preview.innerHTML = eggIcon(picker.input.value, "small");
}

function refreshEggPreviews() {
  for (const id of Object.keys(state.eggPickers)) updateEggPreview(id);
}

function renderEggSuggestions(id) {
  const picker = state.eggPickers[id];
  if (!picker?.list) return;
  const query = normalizeSearch(picker.input.value);
  const candidates = EGG_TYPES
    .filter(egg => !query || eggSearchTarget(egg).includes(query))
    .slice(0, 30);

  const clearButton = `<button type="button" class="pal-suggestion egg-suggestion clear-choice" data-name=""><span class="egg-icon small empty"><span class="pal-fallback">—</span></span><span><strong>未設定</strong><small>タマゴを記録しない</small></span></button>`;

  if (!candidates.length) {
    picker.list.innerHTML = clearButton + `<div class="pal-suggestion is-empty">候補にありません。このまま自由入力もできます。</div>`;
  } else {
    picker.list.innerHTML = clearButton + candidates.map(egg => {
      return `<button type="button" class="pal-suggestion egg-suggestion" data-name="${escapeHtml(egg.name)}">${eggIcon(egg.name, "small")}<span><strong>${escapeHtml(egg.name)}</strong><small>${escapeHtml(egg.size || "通常")} / 画像は種類ごとに共通</small></span></button>`;
    }).join("");
  }

  picker.list.querySelectorAll("button[data-name]").forEach(button => {
    button.addEventListener("click", () => {
      picker.input.value = button.dataset.name;
      updateEggPreview(id);
      hideEggSuggestions(id);
      picker.input.dispatchEvent(new Event("input", { bubbles: true }));
      picker.input.focus();
    });
  });
  picker.list.hidden = false;
}

function hideEggSuggestions(id) {
  const list = state.eggPickers[id]?.list;
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
      state.dbMetaRef = dbMod.ref(state.db, `rooms/${ROOM_ID}/meta`);
      dbMod.onValue(state.dbMetaRef, (snapshot) => {
        const meta = snapshot.val() || {};
        if (Array.isArray(meta.recorders)) {
          setRecorderList(meta.recorders, { persist: false, silent: true });
        }
        if (meta.recorderColors && typeof meta.recorderColors === "object") {
          setRecorderColors(meta.recorderColors, { persist: false, silent: true });
        }
        if (typeof meta.worldName === "string") {
          state.worldName = meta.worldName.trim();
          localStorage.setItem(worldNameLocalKey(), state.worldName);
          syncWorldNameUi();
        } else if (state.worldName) {
          saveWorldName();
        }
      }, (error) => console.warn("Firebase meta read failed:", error));
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
  const resultPal = normalizePalName(record.resultPal);
  return {
    id: record.id || crypto.randomUUID(),
    parentA: normalizePalName(record.parentA),
    parentB: normalizePalName(record.parentB),
    resultPal,
    eggType: normalizeEggName(record.eggType),
    passives: normalizePassives(record.passives),
    status: resultPal ? "配合確認済み" : "確認中",
    recorder: normalizeRecorder(record.recorder),
    note: record.note || "",
    favorites: normalizeFavorites(record.favorites, record.favorite, record.recorder),
    favorite: Boolean(record.favorite),
    updatedAt: Number(record.updatedAt || Date.now())
  };
}

function normalizePalDisplayName(name) {
  return String(name || "").normalize("NFKC").replace(/\s+/g, " ").trim();
}

function hiraToKata(value) {
  return String(value || "").replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

function normalizePalName(name) {
  const raw = normalizePalDisplayName(name);
  if (!raw) return "";
  const rawAlias = PAL_NAME_ALIASES[raw];
  if (rawAlias) return rawAlias;
  if (state.palMap.has(raw)) return raw;

  const kana = hiraToKata(raw).normalize("NFKC");
  const kanaAlias = PAL_NAME_ALIASES[kana];
  if (kanaAlias) return kanaAlias;
  if (state.palMap.has(kana)) return kana;

  const key = normalizeKey(kana);
  return PAL_NAME_ALIASES[key] || LEGACY_ENGLISH_TO_JP[key] || kana;
}

function normalizeKey(value) {
  return hiraToKata(String(value || ""))
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000_\-ーｰ・'’\.]/g, "");
}


function normalizeEggName(value) {
  const raw = normalizePalDisplayName(value);
  if (!raw) return "";
  const rawKey = normalizeSearch(raw);
  const found = EGG_TYPES.find(egg =>
    normalizeSearch(egg.name) === rawKey ||
    egg.aliases?.some(alias => normalizeSearch(alias) === rawKey || normalizeSearch(`${alias}タマゴ`) === rawKey)
  );
  if (found) return found.name;
  return hiraToKata(raw).normalize("NFKC");
}

function getEggMeta(name) {
  const normalized = normalizeEggName(name);
  if (!normalized) return null;
  return EGG_TYPES.find(egg => egg.name === normalized) || null;
}

function eggIcon(name, size = "normal") {
  const meta = getEggMeta(name);
  const sizeClass = size === "large" ? " large" : size === "small" ? " small" : "";
  const eggClass = meta?.key ? ` egg-${meta.key}` : " egg-plain";
  const label = meta?.name || normalizeEggName(name) || "タマゴ";
  const url = meta?.icon || "assets/plain-egg.png";
  return `<span class="egg-icon${sizeClass}${eggClass}" title="${escapeHtml(label)}"><img src="${escapeHtml(url)}" alt="${escapeHtml(label)}" loading="lazy"></span>`;
}

function eggInline(name) {
  const normalized = normalizeEggName(name);
  if (!normalized) return `<span class="tag subtle">未設定</span>`;
  return `<span class="egg-inline">${eggIcon(normalized)}<span>${escapeHtml(normalized)}</span></span>`;
}

function eggSearchTarget(egg) {
  return normalizeSearch([egg.name, ...(egg.aliases || [])].join(" "));
}

function recorderListLocalKey() {
  return `${RECORDER_LIST_STORAGE_PREFIX}${ROOM_ID}`;
}

function recorderColorLocalKey() {
  return `${RECORDER_COLOR_STORAGE_PREFIX}${ROOM_ID}`;
}

function sanitizeRecorderName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .trim()
    .slice(0, 12);
}

function normalizeColor(value, fallback = "#9067e9") {
  const raw = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw.toLowerCase() : fallback;
}

function uniqueRecorderList(list) {
  const result = [];
  for (const value of Array.isArray(list) ? list : []) {
    const name = sanitizeRecorderName(value);
    if (name && !result.includes(name)) result.push(name);
  }
  for (const name of DEFAULT_RECORDERS) {
    if (!result.includes(name)) result.push(name);
  }
  return result.length ? result : [...DEFAULT_RECORDERS];
}

function defaultRecorderColor(name) {
  const normalized = sanitizeRecorderName(name);
  if (DEFAULT_RECORDER_COLORS[normalized]) return DEFAULT_RECORDER_COLORS[normalized];
  const palette = ["#9067e9", "#ff9f43", "#ef5d68", "#21b6a8", "#8f7a4a", "#64748b"];
  let sum = 0;
  for (const ch of normalized) sum += ch.charCodeAt(0);
  return palette[sum % palette.length];
}

function loadRecorderList() {
  try {
    const saved = JSON.parse(localStorage.getItem(recorderListLocalKey()) || "null");
    if (Array.isArray(saved)) return uniqueRecorderList(saved);
  } catch (error) {
    console.warn("Recorder list read failed", error);
  }
  return [...DEFAULT_RECORDERS];
}

function loadRecorderColors() {
  const colors = {};
  try {
    const saved = JSON.parse(localStorage.getItem(recorderColorLocalKey()) || "null");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      for (const [name, color] of Object.entries(saved)) {
        const normalized = sanitizeRecorderName(name);
        if (normalized) colors[normalized] = normalizeColor(color, defaultRecorderColor(normalized));
      }
    }
  } catch (error) {
    console.warn("Recorder colors read failed", error);
  }
  for (const name of DEFAULT_RECORDERS) colors[name] = colors[name] || DEFAULT_RECORDER_COLORS[name];
  return colors;
}

function normalizeRecorder(value) {
  const raw = sanitizeRecorderName(value);
  const options = state?.recorders?.length ? state.recorders : DEFAULT_RECORDERS;
  if (!raw) return options[0] || DEFAULT_RECORDERS[0];
  const exact = options.find(name => normalizeKey(name) === normalizeKey(raw));
  if (exact) return exact;

  const loose = options.find(name =>
    (raw.includes("森") && name.includes("森")) ||
    (raw.includes("福") && name.includes("福"))
  );
  return loose || raw;
}

function recorderColor(name) {
  const recorder = normalizeRecorder(name);
  return normalizeColor(state.recorderColors?.[recorder], defaultRecorderColor(recorder));
}

function recorderBadgeStyle(name) {
  const color = recorderColor(name);
  return `--recorder-color:${escapeHtml(color)};`;
}

function getCurrentRecorder() {
  const options = state.recorders?.length ? state.recorders : DEFAULT_RECORDERS;
  const saved = sanitizeRecorderName(state.currentRecorder || localStorage.getItem(RECORDER_STORAGE_KEY) || "");
  const exact = options.find(name => normalizeKey(name) === normalizeKey(saved));
  return exact || options[0] || DEFAULT_RECORDERS[0];
}

function setCurrentRecorder(value, options = {}) {
  state.currentRecorder = normalizeRecorder(value);
  localStorage.setItem(RECORDER_STORAGE_KEY, state.currentRecorder);
  syncRecorderUi();
  render();
  if (!options.silent) toast(`現在のユーザーを${state.currentRecorder}にしました`);
}

function setRecorderList(list, options = {}) {
  state.recorders = uniqueRecorderList(list);
  for (const name of state.recorders) {
    state.recorderColors[name] = normalizeColor(state.recorderColors[name], defaultRecorderColor(name));
  }
  localStorage.setItem(recorderListLocalKey(), JSON.stringify(state.recorders));
  localStorage.setItem(recorderColorLocalKey(), JSON.stringify(state.recorderColors));

  if (!state.recorders.includes(getCurrentRecorder())) {
    state.currentRecorder = state.recorders[0] || DEFAULT_RECORDERS[0];
    localStorage.setItem(RECORDER_STORAGE_KEY, state.currentRecorder);
  }
  syncRecorderUi();
  renderRecorderManager();
  if (options.persist !== false) saveRecorderSettings();
  if (!options.silent) render();
}

function setRecorderColors(colors, options = {}) {
  const next = { ...(state.recorderColors || {}) };
  if (colors && typeof colors === "object" && !Array.isArray(colors)) {
    for (const [name, color] of Object.entries(colors)) {
      const recorder = sanitizeRecorderName(name);
      if (recorder) next[recorder] = normalizeColor(color, defaultRecorderColor(recorder));
    }
  }
  for (const name of state.recorders) {
    next[name] = normalizeColor(next[name], defaultRecorderColor(name));
  }
  state.recorderColors = next;
  localStorage.setItem(recorderColorLocalKey(), JSON.stringify(state.recorderColors));
  syncRecorderUi();
  renderRecorderManager();
  if (options.persist !== false) saveRecorderSettings();
  if (!options.silent) render();
}

async function saveRecorderSettings() {
  localStorage.setItem(recorderListLocalKey(), JSON.stringify(state.recorders));
  localStorage.setItem(recorderColorLocalKey(), JSON.stringify(state.recorderColors));
  if (state.firebaseReady && state.dbApi && state.db && state.dbMetaRef) {
    try {
      await state.dbApi.update(state.dbMetaRef, {
        recorders: state.recorders,
        recorderColors: state.recorderColors,
        recordersUpdatedAt: Date.now()
      });
    } catch (error) {
      console.warn("Recorder settings save failed:", error);
      toast("ユーザー設定の保存に失敗しました。", true);
    }
  }
}

const saveRecorderList = saveRecorderSettings;

function syncRecorderOptions(selectElement) {
  if (!selectElement) return;
  const current = getCurrentRecorder();
  selectElement.innerHTML = state.recorders
    .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join("");
  if (state.recorders.includes(current)) selectElement.value = current;
}

function syncRecorderUi() {
  const current = getCurrentRecorder();
  syncRecorderOptions(elements.currentRecorderSelect);
  syncRecorderOptions(elements.startupRecorder);
  if (elements.currentRecorderSelect) elements.currentRecorderSelect.value = current;
  if (elements.startupRecorder) elements.startupRecorder.value = current;
  if (elements.currentRecorderLabel) elements.currentRecorderLabel.textContent = current;
  if (elements.currentRecorderDot) {
    elements.currentRecorderDot.textContent = current.slice(0, 1);
    elements.currentRecorderDot.style.setProperty("--recorder-color", recorderColor(current));
  }
}

function showUserDialogIfNeeded() {
  if (localStorage.getItem(RECORDER_STORAGE_KEY)) return;
  if (!elements.userDialog?.showModal) return;
  syncRecorderUi();
  elements.startupRecorder.value = getCurrentRecorder();
  elements.userDialog.showModal();
}

function renderRecorderManager() {
  if (!elements.recorderList) return;
  const current = getCurrentRecorder();
  elements.recorderList.innerHTML = state.recorders.map(name => {
    const isCurrent = name === current;
    const disableDelete = state.recorders.length <= 1;
    const color = recorderColor(name);
    return `<div class="recorder-list-item ${isCurrent ? "is-current" : ""}">
      <span class="recorder-badge custom" style="${recorderBadgeStyle(name)}"><span class="recorder-avatar">${escapeHtml(name.slice(0, 1))}</span><span>${escapeHtml(name)}</span></span>
      <div class="recorder-list-actions">
        <label class="recorder-color-control" title="ユーザーカラー">
          <input type="color" value="${escapeHtml(color)}" data-color-recorder="${escapeHtml(name)}" />
        </label>
        ${isCurrent ? `<span class="current-user-chip">選択中</span>` : `<button type="button" class="mini-action-button" data-select-recorder="${escapeHtml(name)}">選択</button>`}
        <button type="button" class="mini-action-button danger" data-delete-recorder="${escapeHtml(name)}" ${disableDelete ? "disabled" : ""}>削除</button>
      </div>
    </div>`;
  }).join("");

  elements.recorderList.querySelectorAll("[data-select-recorder]").forEach(button => {
    button.addEventListener("click", () => setCurrentRecorder(button.dataset.selectRecorder));
  });
  elements.recorderList.querySelectorAll("[data-delete-recorder]").forEach(button => {
    button.addEventListener("click", async () => deleteRecorder(button.dataset.deleteRecorder));
  });
  elements.recorderList.querySelectorAll("[data-color-recorder]").forEach(input => {
    input.addEventListener("input", () => {
      const recorder = normalizeRecorder(input.dataset.colorRecorder);
      state.recorderColors[recorder] = normalizeColor(input.value, defaultRecorderColor(recorder));
      localStorage.setItem(recorderColorLocalKey(), JSON.stringify(state.recorderColors));
      syncRecorderUi();
      render();
    });
    input.addEventListener("change", async () => {
      const recorder = normalizeRecorder(input.dataset.colorRecorder);
      state.recorderColors[recorder] = normalizeColor(input.value, defaultRecorderColor(recorder));
      await saveRecorderSettings();
      renderRecorderManager();
      toast(`${recorder}のカラーを変更しました`);
    });
  });
}

async function addRecorderFromForm() {
  const name = sanitizeRecorderName(elements.newRecorderName?.value || "");
  const color = normalizeColor(elements.newRecorderColor?.value || "", defaultRecorderColor(name));
  if (!name) {
    toast("追加するユーザー名を入力してください。", true);
    return;
  }
  if (state.recorders.some(existing => normalizeKey(existing) === normalizeKey(name))) {
    toast("同じユーザー名が既にあります。", true);
    return;
  }
  state.recorders.push(name);
  state.recorderColors[name] = color;
  elements.newRecorderName.value = "";
  if (elements.newRecorderColor) elements.newRecorderColor.value = defaultRecorderColor(name);
  setRecorderList(state.recorders, { silent: true });
  await saveRecorderSettings();
  toast(`${name}を追加しました`);
}

async function deleteRecorder(name) {
  const target = normalizeRecorder(name);
  if (state.recorders.length <= 1) {
    toast("ユーザーは最低1人必要です。", true);
    return;
  }
  if (!confirm(`${target}をユーザー一覧から削除しますか？\\n既存の配合記録の記録者名は残ります。`)) return;
  const nextList = state.recorders.filter(item => item !== target);
  const wasCurrent = getCurrentRecorder() === target;
  delete state.recorderColors[target];
  setRecorderList(nextList, { silent: true });
  if (wasCurrent) setCurrentRecorder(state.recorders[0], { silent: true });
  await saveRecorderSettings();
  toast(`${target}を削除しました`);
}

function worldNameLocalKey() {
  return `${WORLD_NAME_STORAGE_PREFIX}${ROOM_ID}`;
}

function syncWorldNameUi(updateInput = true) {
  const value = String(state.worldName || "").trim();
  if (updateInput && elements.worldNameInput && document.activeElement !== elements.worldNameInput) {
    elements.worldNameInput.value = value;
  }
  if (elements.worldNameBadge) {
    elements.worldNameBadge.hidden = !value;
    elements.worldNameBadge.innerHTML = value
      ? `<span class="world-label">WORLD</span><span class="world-name">🌏 ${escapeHtml(value)}</span>`
      : "";
  }
}

async function saveWorldName() {
  state.worldName = String(state.worldName || "").trim();
  localStorage.setItem(worldNameLocalKey(), state.worldName);
  syncWorldNameUi(false);
  if (state.firebaseReady && state.dbApi && state.db && state.dbMetaRef) {
    try {
      await state.dbApi.update(state.dbMetaRef, { worldName: state.worldName, updatedAt: Date.now() });
    } catch (error) {
      console.warn("World name save failed:", error);
    }
  }
}

function normalizeFavorites(value, legacyFavorite = false, legacyRecorder = "") {
  const favorites = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [name, checked] of Object.entries(value)) {
      if (checked) favorites[normalizeRecorder(name)] = true;
    }
  }
  if (!Object.keys(favorites).length && legacyFavorite) {
    favorites[normalizeRecorder(legacyRecorder || getCurrentRecorder())] = true;
  }
  return favorites;
}

function isRecordFavorite(record, recorder = getCurrentRecorder()) {
  return Boolean(record?.favorites?.[normalizeRecorder(recorder)]);
}

function normalizeStatus(value) {
  const raw = String(value || "").trim();
  if (raw === "実機確認済み") return "配合確認済み";
  if (raw === "育成候補") return "確認中";
  if (raw === "配合確認済み") return "配合確認済み";
  return "確認中";
}

function normalizeSearch(value) {
  return hiraToKata(String(value || ""))
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000]/g, "");
}

function stripId(record) { const { id, ...rest } = record; return rest; }

function breedingPairKey(parentA, parentB) {
  const names = [parentA, parentB]
    .map(name => normalizeKey(normalizePalName(name)))
    .filter(Boolean)
    .sort();
  return names.length === 2 ? names.join("::") : "";
}

function findDuplicateBreedingPair(record) {
  const key = breedingPairKey(record.parentA, record.parentB);
  if (!key) return null;
  return state.records.find(existing =>
    existing.id !== record.id &&
    breedingPairKey(existing.parentA, existing.parentB) === key
  ) || null;
}


function palFilterMatches(palName, filterValue) {
  const filter = normalizeSearch(filterValue);
  if (!filter) return true;
  const meta = getPalMeta(palName) || {};
  const target = normalizeSearch([palName, meta.displayName, meta.no].filter(Boolean).join(" "));
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
  refreshPickerPreviews();
}

function getFilteredRecords() {
  const query = normalizeSearch(elements.searchInput.value);
  const parent = elements.parentFilter.value;
  const result = elements.resultFilter.value;
  const selectedElements = state.selectedElements;
  const selectedWorks = state.selectedWorks;
  const status = elements.statusFilter.value;
  let records = [...state.records];

  records = records.filter(record => {
    const meta = getPalMeta(record.resultPal) || {};
    const englishNames = [record.parentA, record.parentB, record.resultPal].map(name => getPalMeta(name)?.en || "");
    const searchTarget = normalizeSearch([record.parentA, record.parentB, record.resultPal, record.eggType, ...englishNames, record.recorder, record.note, record.status].join(" "));
    const recordElements = meta.elements || (meta.element ? [meta.element] : []);
    const recordWorks = meta.work || [];
    const parentHit = !parent || [record.parentA, record.parentB]
      .some(name => palFilterMatches(name, parent));
    const resultHit = !result || palFilterMatches(record.resultPal, result);
    return (!query || searchTarget.includes(query)) &&
      parentHit &&
      resultHit &&
      (!selectedElements.length || selectedElements.some(element => recordElements.includes(element))) &&
      (!selectedWorks.length || selectedWorks.every(work => hasWorkTrait(meta, work))) &&
      (!status || normalizeStatus(record.status) === status) &&
      (state.currentView !== "favorites" || isRecordFavorite(record)) &&
      (!elements.favoriteOnly || !elements.favoriteOnly.checked || isRecordFavorite(record)) &&
      (!elements.unverifiedOnly.checked || normalizeStatus(record.status) !== "配合確認済み");
  });

  const sort = elements.sortSelect.value;
  records.sort((a, b) => {
    if (sort === "updatedAsc") return a.updatedAt - b.updatedAt;
    if (sort === "resultAsc") return a.resultPal.localeCompare(b.resultPal, "ja");
    if (sort === "statusAsc") return normalizeStatus(a.status).localeCompare(normalizeStatus(b.status), "ja");
    return b.updatedAt - a.updatedAt;
  });
  return records;
}

function renderKpis() {
  const total = state.records.length;
  const verified = state.records.filter(r => normalizeStatus(r.status) === "配合確認済み").length;
  const pending = state.records.filter(r => normalizeStatus(r.status) === "確認中").length;
  const memos = state.records.filter(r => r.note.trim()).length;
  $("totalCount").textContent = `${total}件`;
  $("verifiedCount").textContent = `${verified}件`;
  $("pendingCount").textContent = `${pending}件`;
  $("memoCount").textContent = `${memos}件`;
  $("verifiedRate").textContent = total ? `${Math.round((verified / total) * 100)}%` : "0%";
}

function renderRows(records) {
  const isEmpty = records.length === 0;
  elements.emptyState.hidden = !isEmpty;
  if (isEmpty) {
    if (state.records.length === 0) {
      elements.emptyTitle.textContent = "まだ配合記録がありません";
      elements.emptyText.textContent = "「新しい配合記録を追加」から記録を始めてください。";
    } else if (state.currentView === "favorites") {
      elements.emptyTitle.textContent = "お気に入り記録がありません";
      elements.emptyText.textContent = "一覧の星を押すと、ここに表示されます。";
    } else {
      elements.emptyTitle.textContent = "条件に合う記録がありません";
      elements.emptyText.textContent = "絞り込み条件を変更してください。";
    }
  }

  elements.recordRows.innerHTML = records.map(record => {
    const selected = record.id === state.selectedId ? "selected" : "";
    return `
      <tr class="${selected}" data-id="${record.id}">
        <td class="favorite-cell"><button class="star-button ${isRecordFavorite(record) ? "is-favorite" : ""}" data-action="favorite" title="${escapeHtml(getCurrentRecorder())}のお気に入り">★</button></td>
        <td>${palRecordCard(record.parentA, { role: "parent" })}</td>
        <td>${palRecordCard(record.parentB, { role: "parent" })}</td>
        <td>${palRecordCard(record.resultPal, { role: "result", status: record.status })}</td>
        <td>${eggInline(record.eggType)}</td>
        <td>${statusBadge(record.status)}</td>
        <td>${recorderBadge(record.recorder)}</td>
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
    elements.detailBody.innerHTML = `<div class="info-hint">一覧から配合記録を選択すると、親パル・結果パル・メモをここで確認できます。</div>`;
    return;
  }
  elements.detailBody.innerHTML = `
    <div class="detail-toolbar">
      <button class="secondary-button" data-detail-action="delete" type="button">削除</button>
      <button class="primary-button" data-detail-action="edit" type="button">編集する</button>
    </div>
    <div class="recipe-line">
      ${recipePal("親A", record.parentA, { role: "parent" })}
      <div class="recipe-symbol">＋</div>
      ${recipePal("親B", record.parentB, { role: "parent" })}
      <div class="recipe-symbol">→</div>
      ${recipePal("結果", record.resultPal || "未確認", { role: "result", status: record.status })}
    </div>
    <div class="detail-section"><h3>タマゴの種類</h3>${eggInline(record.eggType)}</div>
    <div class="detail-section"><h3>メモ</h3><div class="note-box ${record.note ? "" : "is-empty"}">${escapeHtml(record.note || "メモはまだありません。編集ボタンから入力できます。")}</div></div>
    <div class="detail-section"><h3>記録情報</h3>
      <p>${statusBadge(record.status)}</p>
      <p><strong>記録者：</strong>${recorderBadge(record.recorder)}</p>
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

function hasWorkTrait(meta, work) {
  if (!meta) return false;
  if (work === "夜行性") {
    const explicit = meta.nocturnal;
    if (typeof explicit === "boolean") return explicit;
    return (meta.elements || []).includes("闇属性");
  }
  return (meta.work || []).includes(work);
}

function recorderBadge(name) {
  const recorder = normalizeRecorder(name);
  return `<span class="recorder-badge custom" style="${recorderBadgeStyle(recorder)}"><span class="recorder-avatar">${escapeHtml(recorder.slice(0, 1))}</span><span>${escapeHtml(recorder)}</span></span>`;
}

function pendingPalIcon(size = "normal") {
  const sizeClass = size === "large" ? " large" : size === "small" ? " small" : "";
  return `<span class="pal-icon${sizeClass} locked pending-pal-icon" title="未確認"><img src="${UNKNOWN_PAL_ICON}" alt="${UNKNOWN_PAL_LABEL}" loading="lazy"></span>`;
}

function palInline(name) {
  return `<span class="pal-inline">${palIcon(name)}<span>${escapeHtml(name || "未入力")}</span></span>`;
}

function resultPalInline(name, status = "確認中") {
  return palRecordCard(name, { role: "result", status });
}

function palRecordCard(name, options = {}) {
  const role = options.role || "parent";
  const status = normalizeStatus(options.status || "");
  const isResult = role === "result";
  const isVerified = isResult && status === "配合確認済み";
  const isPending = isResult && !name;
  const className = [
    "pal-record-card",
    isResult ? "is-result" : "is-parent",
    isVerified ? "is-verified" : "",
    isPending ? "is-pending" : ""
  ].filter(Boolean).join(" ");
  const label = isPending ? "未確認" : (name || "未入力");
  const icon = isPending ? pendingPalIcon("small") : palIcon(name, "small");
  return `<span class="${className}">${icon}<span class="pal-record-name">${escapeHtml(label)}</span></span>`;
}

function recipePal(label, name, options = {}) {
  const role = options.role || "parent";
  const status = normalizeStatus(options.status || "");
  const isResult = role === "result";
  const isVerified = isResult && status === "配合確認済み";
  const isPending = isResult && (!name || name === "未確認");
  const className = [
    "recipe-pal",
    isResult ? "is-result" : "is-parent",
    isVerified ? "is-verified" : "",
    isPending ? "is-pending" : ""
  ].filter(Boolean).join(" ");
  const displayName = isPending ? "未確認" : (name || "未入力");
  const icon = isPending ? pendingPalIcon("large") : palIcon(name, "large");
  return `<div class="${className}"><small>${escapeHtml(label)}</small>${icon}<span>${escapeHtml(displayName)}</span></div>`;
}

function palIcon(name, size = "normal", options = {}) {
  const normalized = normalizePalName(name);
  const sizeClass = size === "large" ? " large" : size === "small" ? " small" : "";
  if (!normalized) return `<span class="pal-icon${sizeClass} filter-any"><span class="pal-fallback">全</span></span>`;

  const reveal = options.reveal ?? isPalDiscovered(normalized);
  if (!reveal) {
    return `<span class="pal-icon${sizeClass} locked" title="${escapeHtml(normalized)} / 画像は記録後に表示"><img src="${UNKNOWN_PAL_ICON}" alt="${UNKNOWN_PAL_LABEL}" loading="lazy"></span>`;
  }

  const meta = getPalMeta(normalized);
  if (!meta) {
    return `<span class="pal-icon${sizeClass} locked" title="${escapeHtml(normalized)}"><img src="${UNKNOWN_PAL_ICON}" alt="${UNKNOWN_PAL_LABEL}" loading="lazy"></span>`;
  }
  const noItem = getPaldbStaticIconByNo(meta.no);
  const noUrl = noItem?.icon || "";
  const overrideKey = PALDB_JP_ICON_OVERRIDES[normalized] || "";
  const overrideUrl = paldbIconUrlFromKey(overrideKey);
  const iconKeyUrl = paldbIconUrlFromKey(meta.iconKey);
  // 旧図鑑Noは1.0で変動しているため、明示的なiconKeyを最優先します。
  const paldbUrl = overrideUrl || iconKeyUrl || meta.paldbIcon || noUrl;
  const labUrl = meta.icon || "";
  const url = paldbUrl || labUrl;
  const fallbackUrl = paldbUrl && labUrl && paldbUrl !== labUrl ? labUrl : UNKNOWN_PAL_ICON;
  const title = [normalized, meta.displayName, meta.no].filter(Boolean).join(" / ");
  if (!url) return `<span class="pal-icon${sizeClass} locked" title="${escapeHtml(title)}"><img src="${UNKNOWN_PAL_ICON}" alt="${UNKNOWN_PAL_LABEL}" loading="lazy"></span>`;
  const fallbackAttr = fallbackUrl ? ` data-fallback="${escapeHtml(fallbackUrl)}"` : "";
  return `<span class="pal-icon${sizeClass}" title="${escapeHtml(title)}"><img src="${escapeHtml(url)}"${fallbackAttr} alt="${escapeHtml(normalized)}" loading="lazy" onerror="if(this.dataset.fallback&&!this.dataset.usedFallback){this.dataset.usedFallback='1';this.src=this.dataset.fallback;}else{this.src='${UNKNOWN_PAL_ICON}';this.closest('.pal-icon').classList.add('locked');}"></span>`;
}

function getDiscoveredPalSet() {
  const set = new Set();
  for (const record of state.records) {
    [record.parentA, record.parentB, record.resultPal]
      .map(normalizePalName)
      .filter(Boolean)
      .forEach(name => set.add(name));
  }
  return set;
}

function isPalDiscovered(name) {
  const normalized = normalizePalName(name);
  if (!normalized) return false;
  return getDiscoveredPalSet().has(normalized);
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
  const normalized = normalizeStatus(status);
  const className = normalized === "配合確認済み" ? "status-verified" : "status-pending";
  if (normalized === "配合確認済み") {
    return `<span class="status-badge ${className}">✓ ${escapeHtml(normalized)}</span>`;
  }
  return `<span class="status-badge ${className}">${escapeHtml(normalized)}</span>`;
}

function checkLine(checked, text) { return `<div class="check-item ${checked ? "is-checked" : ""}"><span class="check-box">${checked ? "✓" : ""}</span><span>${escapeHtml(text)}</span></div>`; }


function showDialogMessage(message, options = {}) {
  if (!elements.dialogMessage) return;
  const detail = options.detail ? `<div class="dialog-message-detail">${escapeHtml(options.detail)}</div>` : "";
  elements.dialogMessage.innerHTML = `<div class="dialog-message-title">${escapeHtml(message)}</div>${detail}`;
  elements.dialogMessage.hidden = false;
}

function clearDialogMessage() {
  if (!elements.dialogMessage) return;
  elements.dialogMessage.textContent = "";
  elements.dialogMessage.hidden = true;
}

function openDialog(id = null) {
  const record = id ? state.records.find(r => r.id === id) : null;
  $("dialogTitle").textContent = record ? "配合記録を編集" : "新しい配合記録";
  $("recordId").value = record?.id || "";
  $("parentA").value = record?.parentA || "";
  $("parentB").value = record?.parentB || "";
  $("resultPal").value = record?.resultPal || "";
  $("eggType").value = record?.eggType || "";
  clearDialogMessage();
  $("note").value = record?.note || "";
  $("deleteRecord").style.visibility = record ? "visible" : "hidden";
  refreshPickerPreviews();
  refreshEggPreviews();
  renderEggQuickSelect();
  elements.recordDialog.showModal();
}

async function saveFromForm() {
  clearDialogMessage();
  const id = $("recordId").value || crypto.randomUUID();
  const existing = state.records.find(r => r.id === id);
  const record = normalizeRecord({
    id,
    parentA: $("parentA").value.trim(),
    parentB: $("parentB").value.trim(),
    resultPal: $("resultPal").value.trim(),
    eggType: $("eggType").value.trim(),
    recorder: getCurrentRecorder(),
    status: $("resultPal").value.trim() ? "配合確認済み" : "確認中",
    passives: [],
    note: $("note").value.trim(),
    favorites: existing?.favorites || {},
    favorite: isRecordFavorite(existing),
    updatedAt: Date.now()
  });

  if (!record.parentA || !record.parentB) {
    toast("親A・親Bは必須です。", true);
    return;
  }
  if (record.status === "配合確認済み" && !record.resultPal) {
    toast("配合確認済みにする場合は、結果パルを入力してください。", true);
    return;
  }
  const duplicate = findDuplicateBreedingPair(record);
  if (duplicate) {
    const duplicateResult = duplicate.resultPal ? ` → ${duplicate.resultPal}` : "";
    const detail = `${duplicate.parentA} ＋ ${duplicate.parentB}${duplicateResult}`;
    showDialogMessage("この組み合わせは既に登録済みです", { detail });
    toast("同じ親の組み合わせは既に登録されています", true);
    return;
  }

  const missing = [record.parentA, record.parentB, record.resultPal].filter(name => name && !getPalMeta(name));
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
  const recorder = getCurrentRecorder();
  record.favorites = { ...(record.favorites || {}) };
  record.favorites[recorder] = !record.favorites[recorder];
  if (!record.favorites[recorder]) delete record.favorites[recorder];
  record.favorite = isRecordFavorite(record);
  // お気に入りの登録・解除は配合記録の内容変更ではないため、updatedAtは更新しません。
  await persistRecord(record);
  render();
}

function splitTags(value) {
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  return String(value || "").split(/[,、]/).map(s => s.trim()).filter(Boolean);
}

function normalizePassives(value) {
  return uniqueStrings(Array.isArray(value) ? value : splitTags(value)).slice(0, 4);
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
