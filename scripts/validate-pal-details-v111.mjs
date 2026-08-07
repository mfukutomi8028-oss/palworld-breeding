import fs from "node:fs";

function fail(message) {
  throw new Error(message);
}

const detailPath = "data/pal-details-v1.json";
if (!fs.existsSync(detailPath)) fail(`${detailPath} is missing`);
const payload = JSON.parse(fs.readFileSync(detailPath, "utf8"));
const records = payload.records;
if (!Array.isArray(records) || records.length !== 299 || payload.count !== 299) {
  fail(`Expected 299 detail records, got records=${records?.length} count=${payload.count}`);
}

const names = new Set();
const allowedMountTypes = new Set(["陸上", "空中", "水上"]);
let partnerNameCount = 0;
let dropCount = 0;
let groundCount = 0;
let airCount = 0;
let waterCount = 0;

for (const record of records) {
  const name = String(record.name || "").trim();
  if (!name || names.has(name)) fail(`Missing or duplicate English Pal name: ${name}`);
  names.add(name);
  if (!String(record.sourceUrl || "").includes("paldb.cc/ja/")) fail(`${name}: Japanese PalDB source URL is missing`);
  if (Object.hasOwn(record, "summary")) fail(`${name}: long Summary prose must not be stored`);
  if (Object.hasOwn(record.partnerSkill || {}, "description")) fail(`${name}: full partner-skill description must not be stored`);
  if (!record.stats || !record.movement || !Array.isArray(record.mountTypes) || !Array.isArray(record.drops)) {
    fail(`${name}: invalid detail structure`);
  }
  for (const key of ["run", "rideSprint", "stamina"]) {
    if (!Number.isFinite(Number(record.movement[key]))) fail(`${name}: movement.${key} is missing`);
  }
  if (!Number.isFinite(Number(record.stats.rarity)) || !Number.isFinite(Number(record.stats.breedingPower))) {
    fail(`${name}: required Stats values are missing`);
  }
  if (record.partnerSkill?.name) partnerNameCount += 1;
  if (record.drops.length) dropCount += 1;
  for (const type of record.mountTypes) {
    if (!allowedMountTypes.has(type)) fail(`${name}: unknown mount type ${type}`);
    if (type === "陸上") groundCount += 1;
    if (type === "空中") airCount += 1;
    if (type === "水上") waterCount += 1;
  }
  const tags = record.partnerSkill?.effectTags;
  if (!Array.isArray(tags) || tags.length > 8) fail(`${name}: invalid partner-skill effect tags`);
}

if (partnerNameCount < 250) fail(`Too few Japanese partner-skill names: ${partnerNameCount}`);
if (dropCount < 100) fail(`Too few Pals with drop data: ${dropCount}`);
if (!groundCount || !airCount || !waterCount) fail(`Mount classifications are incomplete: ground=${groundCount}, air=${airCount}, water=${waterCount}`);

const lamball = records.find(record => record.name === "Lamball");
if (!lamball) fail("Lamball detail is missing");
const lamballExpected = {
  partnerSkill: "モコモコの盾",
  food: 100,
  egg: "平凡なタマゴ",
  run: 400,
  rideSprint: 550,
  swim: 120,
  swimDash: 165,
  stamina: 100,
};
const lamballActual = {
  partnerSkill: lamball.partnerSkill?.name,
  food: lamball.stats?.food,
  egg: lamball.stats?.egg,
  run: lamball.movement?.run,
  rideSprint: lamball.movement?.rideSprint,
  swim: lamball.movement?.swim,
  swimDash: lamball.movement?.swimDash,
  stamina: lamball.movement?.stamina,
};
if (JSON.stringify(lamballActual) !== JSON.stringify(lamballExpected)) {
  fail(`Lamball verification failed: ${JSON.stringify(lamballActual)}`);
}

const index = fs.readFileSync("index.html", "utf8");
const actionsPosition = index.indexOf("app-actions.js?v=110");
const detailsPosition = index.indexOf("app-pal-details-v111.js?v=111");
if (!index.includes("style-pal-details-v111.css?v=111")) fail("v111 detail CSS is not loaded");
if (actionsPosition < 0 || detailsPosition < 0 || detailsPosition < actionsPosition) {
  fail("v111 detail runtime must load after app-actions.js");
}

const runtime = fs.readFileSync("app-pal-details-v111.js", "utf8");
for (const required of ["paldexPurpose", "rideSprintDesc", "palCompareDialog", "partnerSkill", "mountTypes", "pal-details-v1.json?v=111"]) {
  if (!runtime.includes(required)) fail(`v111 runtime is missing ${required}`);
}

const css = fs.readFileSync("style-pal-details-v111.css", "utf8");
if (css.split("{").length !== css.split("}").length) fail("v111 CSS braces are unbalanced");

const hintSmoke = fs.readFileSync("scripts/smoke-hints.mjs", "utf8");
if (!hintSmoke.includes('audit.murakumo !== "MRKM"') || !hintSmoke.includes('audit.glaciale !== "GRISYR"')) {
  fail("Required romaji-consonant hint examples are not under regression test");
}

console.log(`Validated 299 Pal details. Partner skills=${partnerNameCount}, drops=${dropCount}, mounts=${groundCount}/${airCount}/${waterCount}.`);
