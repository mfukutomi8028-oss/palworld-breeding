import fs from "node:fs";

const payload = JSON.parse(fs.readFileSync("data/pal-ui-v113.json", "utf8"));
const fail = message => { throw new Error(message); };
const assertLocalIcon = (value, label) => {
  const path = String(value || "");
  if (!path.startsWith("assets/paldb-ui-v113/")) fail(`${label}: icon is not localized: ${path}`);
  if (!fs.existsSync(path)) fail(`${label}: localized icon file is missing: ${path}`);
};

if (payload.count !== 299 || !Array.isArray(payload.records) || payload.records.length !== 299) {
  fail(`Expected 299 Pal UI records, got ${payload.records?.length}`);
}
if (payload.schemaVersion !== 114) fail(`Expected schemaVersion 114, got ${payload.schemaVersion}`);
if (payload.iconStorage?.mode !== "local-snapshot") fail(`Unexpected icon storage mode: ${payload.iconStorage?.mode}`);
if (!Number.isInteger(payload.iconStorage?.uniqueFiles) || payload.iconStorage.uniqueFiles < 100) fail(`Localized icon file count is too low: ${payload.iconStorage?.uniqueFiles}`);
if (Object.keys(payload.elementIcons || {}).length !== 9) fail("Expected 9 element icons");
if (Object.keys(payload.workIcons || {}).length !== 12) fail("Expected 12 work-suitability icons");
if (payload.coverage?.partnerDescriptions !== 299) fail(`Partner descriptions coverage is ${payload.coverage?.partnerDescriptions}`);
if (payload.coverage?.partnerIcons !== 299) fail(`Partner icon coverage is ${payload.coverage?.partnerIcons}`);
if (!Number.isInteger(payload.coverage?.dropRows) || payload.coverage.dropRows < 1000) fail("Drop rows coverage is unexpectedly low");
if (payload.coverage?.dropIcons !== payload.coverage?.dropRows) fail(`Drop icon coverage ${payload.coverage?.dropIcons}/${payload.coverage?.dropRows}`);
if (!Number.isInteger(payload.coverage?.levelRows) || payload.coverage.levelRows < 1) fail(`Level-conditioned drop coverage is invalid: ${payload.coverage?.levelRows}`);
if (!Number.isInteger(payload.coverage?.conditionIcons) || payload.coverage.conditionIcons < 1) fail(`Drop condition icon coverage is invalid: ${payload.coverage?.conditionIcons}`);
if (!Number.isInteger(payload.coverage?.bossRows) || payload.coverage.bossRows < 1) fail(`Boss drop coverage is invalid: ${payload.coverage?.bossRows}`);

for (const [label, icon] of Object.entries(payload.elementIcons)) {
  if (!/\/elements\/T_Icon_element_s_\d{2}\.webp$/.test(icon)) fail(`Invalid element icon ${label}: ${icon}`);
  assertLocalIcon(icon, `element ${label}`);
}
for (const [label, icon] of Object.entries(payload.workIcons)) {
  if (!/\/work\/T_icon_palwork_\d{2}\.webp$/.test(icon)) fail(`Invalid work icon ${label}: ${icon}`);
  assertLocalIcon(icon, `work ${label}`);
}

const names = new Set();
for (const record of payload.records) {
  if (!record.name || names.has(record.name)) fail(`Missing or duplicate Pal name: ${record.name}`);
  names.add(record.name);
  if (!record.partnerSkill?.name) fail(`${record.name}: partner skill name missing`);
  if (!record.partnerSkill?.description) fail(`${record.name}: partner skill description missing`);
  assertLocalIcon(record.partnerSkill?.icon, `${record.name} partner skill`);
  for (const drop of record.drops || []) {
    if (!drop.item || !drop.quantity || !drop.probability) fail(`${record.name}: malformed drop row ${JSON.stringify(drop)}`);
    if (!/^\d+(?:[–-]\d+)?$/.test(drop.quantity)) fail(`${record.name}: invalid drop quantity ${drop.quantity}`);
    if (!/^\d+(?:\.\d+)?%$/.test(drop.probability)) fail(`${record.name}: invalid drop probability ${drop.probability}`);
    if (drop.level && !/^\d+$/.test(drop.level)) fail(`${record.name}: invalid drop level ${drop.level}`);
    if (typeof drop.isBoss !== "boolean") fail(`${record.name}: isBoss is not boolean`);
    assertLocalIcon(drop.icon, `${record.name} drop ${drop.item}`);
    if (drop.conditionIcon) assertLocalIcon(drop.conditionIcon, `${record.name} drop condition ${drop.item}`);
  }
}

const lamball = payload.records.find(record => record.name === "Lamball");
if (!lamball) fail("Lamball record missing");
if (lamball.partnerSkill.name !== "モコモコの盾") fail(`Unexpected Lamball partner skill: ${lamball.partnerSkill.name}`);
if (!lamball.partnerSkill.description.includes("盾") || !lamball.partnerSkill.description.includes("羊毛")) fail("Lamball partner description is incomplete");
const wool = lamball.drops.find(drop => drop.item === "羊毛" && !drop.level);
if (!wool) fail(`Lamball wool drop missing: ${JSON.stringify(lamball.drops.slice(0, 3))}`);
if (wool.quantity !== "1–3" || wool.probability !== "100%") fail(`Lamball wool drop mismatch: ${JSON.stringify(wool)}`);
if (!wool.icon.includes("T_itemicon_Material_Wool.webp")) fail(`Lamball wool icon mismatch: ${wool.icon}`);

const lyleen = payload.records.find(record => record.name === "Lyleen");
if (!lyleen) fail("Lyleen record missing");
const findLyleenDrop = (item, level = "") => lyleen.drops.find(drop => drop.item === item && String(drop.level || "") === level);
const expectedLyleen = [
  ["高品質な回復薬", "", "1–3", "100%"],
  ["きれいな花", "", "1–2", "100%"],
  ["革新的な技術書", "", "1", "10%"],
  ["世界樹の聖水", "70", "1–3", "50%"],
  ["古代文明の朽ちた遺物", "70", "1–10", "10%"],
  ["草の輝石", "80", "10–20", "100%"],
  ["古代文明の朽ちた遺物", "80", "30–50", "100%"],
];
for (const [item, level, quantity, probability] of expectedLyleen) {
  const drop = findLyleenDrop(item, level);
  if (!drop) fail(`Lyleen drop missing: ${item} Lv.${level || "-"}`);
  if (drop.quantity !== quantity || drop.probability !== probability) fail(`Lyleen drop mismatch: ${JSON.stringify(drop)}`);
  if (/\s\d+(?:[–-]\d+)?$/.test(drop.item)) fail(`Quantity leaked into Lyleen item label: ${drop.item}`);
}
const lyleenBoss = findLyleenDrop("草の輝石", "80");
if (!lyleenBoss?.isBoss) fail(`Lyleen Lv.80 row is missing boss marker: ${JSON.stringify(lyleenBoss)}`);
if (!lyleenBoss?.conditionIcon) fail(`Lyleen Lv.80 row is missing PalDB condition icon: ${JSON.stringify(lyleenBoss)}`);
assertLocalIcon(lyleenBoss.conditionIcon, "Lyleen Lv.80 boss condition");

console.log(`Validated v114 rich UI data: ${payload.records.length} Pals, ${payload.coverage.dropRows} drops, ${payload.coverage.levelRows} level rows, ${payload.coverage.conditionIcons} condition icons, ${payload.coverage.bossRows} boss rows.`);
