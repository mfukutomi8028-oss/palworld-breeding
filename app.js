const PAL_SOURCE_URL = "https://palworld-lab.com/pals/";
const PAL_SOURCE_PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(PAL_SOURCE_URL)}`;
const PAL_CACHE_KEY = "pal-breeding-board:palworld-lab-pals:v14";
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
  { no: "073", name: "クインビーナ", en: "Elizabee", elements: ["草属性"], work: ["種まき", "手作業", "採集", "伐採", "製薬"], iconKey: "QueenBee" },
    { no: "075", name: "ツジギリ", en: "Bushi", elements: ["炎属性"], work: ["火おこし", "手作業", "採集", "伐採", "運搬"], iconKey: "Ronin" },
  { no: "076", name: "フォレーナ", en: "Wixen", elements: ["炎属性"], work: ["火おこし", "手作業", "運搬"], iconKey: "FoxMage" },
  { no: "077", name: "クレメーオ", en: "Katress", elements: ["闇属性"], work: ["手作業", "製薬", "運搬"], iconKey: "CatMage" },
  { no: "080", name: "シルキーヌ", en: "Sibelyx", elements: ["氷属性"], work: ["製薬", "冷却", "牧場"], iconKey: "SilkWorm" },
  { no: "082", name: "アズレーン", en: "Azurobe", elements: ["水属性", "竜属性"], work: ["水やり"], iconKey: "BlueDragon" },
  { no: "083", name: "ツンドラー", en: "Reindrix", elements: ["氷属性"], work: ["伐採", "冷却"], iconKey: "IceDeer" },
  { no: "083", name: "フブキジカ", en: "Reindrix", elements: ["氷属性"], work: ["伐採", "冷却"], iconKey: "IceDeer" },
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
const UNKNOWN_PAL_ICON = "assets/pal-unknown.png";
const UNKNOWN_PAL_LABEL = "未発見";
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
  passiveNames: [...EMBEDDED_PASSIVES],
  pickers: {},
  passivePickers: {},
  eggPickers: {},
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
  toast: $("toast"),
  dialogMessage: $("dialogMessage"),
  palDataState: $("palDataState"),
};

init();

async function init() {
  mergePalData(EMBEDDED_PALS, "内蔵リスト");
  setupPalOptions();
  setupEvents();
  setupPalPickers();
  setupEggPickers();
  setupIconFilters();
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
  [elements.parentFilter, elements.resultFilter, elements.statusFilter, elements.unverifiedOnly, elements.searchInput, elements.sortSelect]
    .forEach(el => el?.addEventListener("input", render));

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
    });
    input.addEventListener("focus", () => renderEggSuggestions(id));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hideEggSuggestions(id);
    });
  }

  document.addEventListener("click", (event) => {
    for (const id of Object.keys(state.eggPickers)) {
      if (!state.eggPickers[id].picker.contains(event.target)) hideEggSuggestions(id);
    }
  });
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
  if (state.palMap.has(raw)) return raw;

  const kana = hiraToKata(raw).normalize("NFKC");
  if (state.palMap.has(kana)) return kana;

  const key = normalizeKey(kana);
  return LEGACY_ENGLISH_TO_JP[key] || kana;
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
  const label = meta?.name || normalizeEggName(name) || "タマゴ";
  const url = meta?.icon || "assets/plain-egg.png";
  return `<span class="egg-icon${sizeClass}" title="${escapeHtml(label)}"><img src="${escapeHtml(url)}" alt="${escapeHtml(label)}" loading="lazy"></span>`;
}

function eggInline(name) {
  const normalized = normalizeEggName(name);
  if (!normalized) return `<span class="tag subtle">未設定</span>`;
  return `<span class="egg-inline">${eggIcon(normalized)}<span>${escapeHtml(normalized)}</span></span>`;
}

function eggSearchTarget(egg) {
  return normalizeSearch([egg.name, ...(egg.aliases || [])].join(" "));
}

function normalizeRecorder(value) {
  const raw = String(value || "").trim();
  if (raw.includes("森")) return "森井";
  return "福冨";
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
      (state.currentView !== "favorites" || record.favorite) &&
      (!elements.favoriteOnly || !elements.favoriteOnly.checked || record.favorite) &&
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
        <td class="favorite-cell"><button class="star-button ${record.favorite ? "is-favorite" : ""}" data-action="favorite" title="お気に入り">★</button></td>
        <td>${palInline(record.parentA)}</td>
        <td>${palInline(record.parentB)}</td>
        <td>${resultPalInline(record.resultPal, record.status)}</td>
        <td>${eggInline(record.eggType)}</td>
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
    elements.detailBody.innerHTML = `<div class="info-hint">一覧から配合記録を選択すると、親パル・結果パル・メモをここで確認できます。</div>`;
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
      ${recipePal("結果", record.resultPal || "未確認")}
    </div>
    <div class="detail-section"><h3>タマゴの種類</h3>${eggInline(record.eggType)}</div>
    <div class="detail-section"><h3>メモ</h3><div class="note-box ${record.note ? "" : "is-empty"}">${escapeHtml(record.note || "メモはまだありません。編集ボタンから入力できます。")}</div></div>
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

function hasWorkTrait(meta, work) {
  if (!meta) return false;
  if (work === "夜行性") {
    const explicit = meta.nocturnal;
    if (typeof explicit === "boolean") return explicit;
    return (meta.elements || []).includes("闇属性");
  }
  return (meta.work || []).includes(work);
}

function palInline(name) {
  return `<span class="pal-inline">${palIcon(name)}<span>${escapeHtml(name || "未入力")}</span></span>`;
}

function resultPalInline(name, status = "確認中") {
  if (!name && normalizeStatus(status) === "確認中") {
    return `<span class="result-pending">未確認</span>`;
  }
  return palInline(name);
}

function recipePal(label, name) {
  return `<div class="recipe-pal"><small>${label}</small>${palIcon(name, "large")}<span>${escapeHtml(name || "未入力")}</span></div>`;
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
  const paldbUrl = meta.iconKey ? `https://cdn.paldb.cc/image/Pal/Texture/PalIcon/Normal/T_${encodeURIComponent(meta.iconKey)}_icon_normal.webp` : "";
  const url = meta.icon || paldbUrl;
  const fallbackUrl = meta.icon && paldbUrl && meta.icon !== paldbUrl ? paldbUrl : UNKNOWN_PAL_ICON;
  const title = [normalized, meta.en, meta.no].filter(Boolean).join(" / ");
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


function showDialogMessage(message) {
  if (!elements.dialogMessage) return;
  elements.dialogMessage.textContent = message;
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
  $("recorder").value = normalizeRecorder(record?.recorder || localStorage.getItem("palBoardRecorder") || "福冨");
  $("note").value = record?.note || "";
  $("deleteRecord").style.visibility = record ? "visible" : "hidden";
  refreshPickerPreviews();
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
    recorder: normalizeRecorder($("recorder").value),
    status: $("resultPal").value.trim() ? "配合確認済み" : "確認中",
    passives: [],
    note: $("note").value.trim(),
    favorite: existing?.favorite || false,
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
  localStorage.setItem("palBoardRecorder", record.recorder);

  const duplicate = findDuplicateBreedingPair(record);
  if (duplicate) {
    state.selectedId = duplicate.id;
    render();
    const duplicateResult = duplicate.resultPal ? ` → ${duplicate.resultPal}` : "";
    const message = `同じ親の組み合わせは既に登録されています：${duplicate.parentA} ＋ ${duplicate.parentB}${duplicateResult}`;
    showDialogMessage(message);
    toast(message, true);
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
  record.favorite = !record.favorite;
  record.updatedAt = Date.now();
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
