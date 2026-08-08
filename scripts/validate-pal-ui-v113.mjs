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
if (payload.iconStorage?.mode !== "local-snapshot") fail(`Unexpected icon storage mode: ${payload.iconStorage?.mode}`);
if (!Number.isInteger(payload.iconStorage?.uniqueFiles) || payload.iconStorage.uniqueFiles < 100) fail(`Localized icon file count is too low: ${payload.iconStorage?.uniqueFiles}`);
if (Object.keys(payload.elementIcons || {}).length !== 9) fail("Expected 9 element icons");
if (Object.keys(payload.workIcons || {}).length !== 12) fail("Expected 12 work-suitability icons");
if (payload.coverage?.partnerDescriptions !== 299) fail(`Partner descriptions coverage is ${payload.coverage?.partnerDescriptions}`);
if (payload.coverage?.partnerIcons !== 299) fail(`Partner icon coverage is ${payload.coverage?.partnerIcons}`);
if (!Number.isInteger(payload.coverage?.dropRows) || payload.coverage.dropRows < 1000) fail("Drop rows coverage is unexpectedly low");
if (payload.coverage?.dropIcons !== payload.coverage?.dropRows) fail(`Drop icon coverage ${payload.coverage?.dropIcons}/${payload.coverage?.dropRows}`);

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
    if (!drop.item || !drop.probability) fail(`${record.name}: malformed drop row`);
    assertLocalIcon(drop.icon, `${record.name} drop ${drop.item}`);
  }
}

const lamball = payload.records.find(record => record.name === "Lamball");
if (!lamball) fail("Lamball record missing");
if (lamball.partnerSkill.name !== "モコモコの盾") fail(`Unexpected Lamball partner skill: ${lamball.partnerSkill.name}`);
if (!lamball.partnerSkill.description.includes("盾") || !lamball.partnerSkill.description.includes("羊毛")) fail("Lamball partner description is incomplete");
if (!lamball.partnerSkill.icon.endsWith("T_icon_skill_pal_005.webp")) fail(`Unexpected Lamball partner icon: ${lamball.partnerSkill.icon}`);
const wool = lamball.drops.find(drop => drop.item === "羊毛");
if (!wool) fail(`Lamball wool drop missing: ${JSON.stringify(lamball.drops.slice(0, 3))}`);
if (wool.quantity !== "1–3" || wool.probability !== "100%") fail(`Lamball wool drop mismatch: ${JSON.stringify(wool)}`);
if (!wool.icon.includes("T_itemicon_Material_Wool.webp")) fail(`Lamball wool icon mismatch: ${wool.icon}`);

console.log(`Validated v113 rich UI data: ${payload.records.length} Pals, ${payload.coverage.partnerIcons} partner icons, ${payload.coverage.dropIcons}/${payload.coverage.dropRows} drop icons, ${payload.iconStorage.uniqueFiles} localized files.`);
