import fs from "node:fs";

const [paldbPath, localizationPath, enginePath, manifestPath] = process.argv.slice(2);
if (![paldbPath, localizationPath, enginePath, manifestPath].every(Boolean)) {
  throw new Error("Usage: node scripts/diagnose-v102-loader.mjs <paldb.json> <localization.json> <engine.html> <manifest.json>");
}

const paldb = JSON.parse(fs.readFileSync(paldbPath, "utf8"));
const localization = JSON.parse(fs.readFileSync(localizationPath, "utf8"));
const engineText = fs.readFileSync(enginePath, "utf8");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const normalizeText = value => String(value || "").normalize("NFKC").toLowerCase().replace(/[\s\u3000・_\-ーｰ'’.()]/g, "");
const normalizeNumber = value => {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim().toUpperCase();
  if (!raw || ["NULL", "NONE", "N/A", "NA", "-"].includes(raw)) return "";
  const match = raw.match(/^(\d+)([A-Z]*)$/);
  return match ? `${match[1].padStart(3, "0")}${match[2]}` : raw;
};

const marker = "const DATA = ";
const start = engineText.indexOf(marker);
if (start < 0) throw new Error("PalCalc DATA marker not found");
const jsonStart = start + marker.length;
const jsonEnd = engineText.indexOf(";\nconst ", jsonStart);
if (jsonEnd < 0) throw new Error("PalCalc DATA end marker not found");
const engine = JSON.parse(engineText.slice(jsonStart, jsonEnd));

const en = localization.en || {};
const ja = localization.ja || localization.jp || {};
const translations = new Map();
for (const [id, enRaw] of Object.entries(en)) {
  const enName = String(enRaw || "").replace(/\(BOSS\)|\(Raid\)/gi, "").trim();
  const jaName = String(ja[id] || "").replace(/（ボス）|\(BOSS\)|（レイド）|\(Raid\)/gi, "").trim();
  if (enName && jaName && !translations.has(enName)) translations.set(enName, jaName);
}

const manifestRows = Array.isArray(manifest.partnerSkills) ? manifest.partnerSkills : [];
const manifestByNumber = new Map();
const manifestByName = new Map();
for (const row of manifestRows) {
  const number = normalizeNumber(row.palNumber);
  const name = normalizeText(row.pal);
  if (number && !manifestByNumber.has(number)) manifestByNumber.set(number, row);
  if (name && !manifestByName.has(name)) manifestByName.set(name, row);
}

const engineByDeck = new Map();
const engineByName = new Map();
for (const [code, pal] of Object.entries(engine.pals || {})) {
  const deck = normalizeNumber(pal.deck);
  const item = { code, ...pal };
  if (deck) engineByDeck.set(deck, item);
  if (pal.name) engineByName.set(normalizeText(pal.name), item);
}

const records = Array.isArray(paldb.records) ? paldb.records : [];
const pals = records.map((record, order) => {
  const enName = String(record.name || "").trim();
  const number = normalizeNumber(record.number);
  const id = number || `special-${order}`;
  const enginePal = (number && engineByDeck.get(number)) || engineByName.get(normalizeText(enName));
  const imageRow = (number && manifestByNumber.get(number)) || manifestByName.get(normalizeText(enName));
  return {
    id,
    no: number || "—",
    name: translations.get(enName) || enName,
    enName,
    power: Number(enginePal?.rank ?? record.breedingPower),
    engineCode: enginePal?.code || "",
    imageName: imageRow?.pal || "",
    imageFile: imageRow?.displayIconFile || "",
  };
}).filter(pal => pal.name && Number.isFinite(pal.power));

const knownDecks = new Set(pals.map(pal => pal.no).filter(no => no && no !== "—"));
for (const [code, enginePal] of Object.entries(engine.pals || {})) {
  const number = normalizeNumber(enginePal.deck);
  if (!number || knownDecks.has(number)) continue;
  const enName = String(enginePal.name || code);
  const imageRow = manifestByNumber.get(number) || manifestByName.get(normalizeText(enName));
  pals.push({
    id: number,
    no: number,
    name: translations.get(enName) || enName,
    enName,
    power: Number(enginePal.rank),
    engineCode: code,
    imageName: imageRow?.pal || "",
    imageFile: imageRow?.displayIconFile || "",
  });
  knownDecks.add(number);
}

const idGroups = new Map();
for (const pal of pals) {
  const group = idGroups.get(pal.id) || [];
  group.push(pal);
  idGroups.set(pal.id, group);
}
const duplicateIds = [...idGroups.entries()].filter(([, group]) => group.length > 1);
const noEngine = pals.filter(pal => !pal.engineCode);
const noImage = pals.filter(pal => !pal.imageFile);
const invalidPower = pals.filter(pal => !Number.isFinite(pal.power));

console.log(JSON.stringify({
  paldbRows: records.length,
  localizationEnglishRows: Object.keys(en).length,
  localizationJapaneseRows: Object.keys(ja).length,
  engineRows: Object.keys(engine.pals || {}).length,
  manifestRows: manifestRows.length,
  finalPals: pals.length,
  uniqueIds: idGroups.size,
  duplicateIds: duplicateIds.map(([id, group]) => ({ id, names: group.map(p => p.enName) })),
  noEngine: noEngine.map(p => ({ id: p.id, name: p.enName, power: p.power })),
  noImage: noImage.map(p => ({ id: p.id, name: p.enName })),
  invalidPower,
}, null, 2));

if (duplicateIds.length) throw new Error(`Duplicate Pal IDs detected: ${idGroups.size}/${pals.length}`);
if (!pals.length) throw new Error("No Pals survived the v102 loader");
