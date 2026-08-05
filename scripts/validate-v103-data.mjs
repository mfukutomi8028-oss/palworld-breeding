import fs from "node:fs";
import path from "node:path";

const palsData = JSON.parse(fs.readFileSync("data/pals-v1.json", "utf8"));
const localization = JSON.parse(fs.readFileSync("data/pal-localization-ja-v1.json", "utf8"));
const breeding = JSON.parse(fs.readFileSync("data/breeding-v1.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("data/pal-images-v1.json", "utf8"));

const normalizeText = value => String(value || "").normalize("NFKC").toLowerCase().replace(/[\s\u3000・_\-ーｰ'’.()]/g, "");
const normalizeNumber = value => {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim().toUpperCase();
  if (!raw || ["NULL", "NONE", "N/A", "NA", "-", "—", "–", "―"].includes(raw)) return "";
  const match = raw.match(/^(\d+)([A-Z]*)$/);
  return match ? `${match[1].padStart(3, "0")}${match[2]}` : "";
};
const stableSpecialId = (enginePal, name, order) => {
  const key = String(enginePal?.code || normalizeText(name) || order).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `special-${key || order}`;
};

const palRows = Array.isArray(palsData.records) ? palsData.records : [];
const imageRows = Array.isArray(manifest.partnerSkills) ? manifest.partnerSkills : [];
if (palRows.length !== 299) throw new Error(`Expected 299 Pal rows, got ${palRows.length}`);
if (Object.keys(breeding.pals || {}).length !== 299) throw new Error(`Expected 299 breeding forms, got ${Object.keys(breeding.pals || {}).length}`);
if (!Array.isArray(breeding.unique) || breeding.unique.length !== 164) throw new Error(`Expected 164 unique breeding rows, got ${breeding.unique?.length}`);
if (imageRows.length !== 300) throw new Error(`Expected 300 image manifest rows, got ${imageRows.length}`);
if (!localization.en || !(localization.ja || localization.jp)) throw new Error("Localization structure is invalid");

const engineByDeck = new Map();
const engineByName = new Map();
for (const [code, pal] of Object.entries(breeding.pals)) {
  const item = { code, ...pal };
  const deck = normalizeNumber(pal.deck);
  if (deck) engineByDeck.set(deck, item);
  if (pal.name) engineByName.set(normalizeText(pal.name), item);
}

const imageByDeck = new Map();
const imageByName = new Map();
for (const row of imageRows) {
  const deck = normalizeNumber(row.palNumber);
  if (deck && !imageByDeck.has(deck)) imageByDeck.set(deck, row);
  if (row.pal && !imageByName.has(normalizeText(row.pal))) imageByName.set(normalizeText(row.pal), row);
}

const resolved = palRows.map((row, order) => {
  const name = String(row.name || "").trim();
  const deck = normalizeNumber(row.number);
  const engine = (deck && engineByDeck.get(deck)) || engineByName.get(normalizeText(name));
  const image = (deck && imageByDeck.get(deck)) || imageByName.get(normalizeText(name));
  const id = deck || stableSpecialId(engine, name, order);
  return { id, deck, name, engine, image };
});

const ids = new Set(resolved.map(row => row.id));
if (ids.size !== resolved.length) {
  const groups = new Map();
  for (const row of resolved) groups.set(row.id, [...(groups.get(row.id) || []), row.name]);
  throw new Error(`Duplicate IDs: ${JSON.stringify([...groups].filter(([, names]) => names.length > 1))}`);
}
const missingEngine = resolved.filter(row => !row.engine);
if (missingEngine.length) throw new Error(`Missing breeding mappings: ${missingEngine.map(row => row.name).join(", ")}`);
const missingImages = resolved.filter(row => !row.image);
if (missingImages.length) throw new Error(`Missing image mappings: ${missingImages.map(row => row.name).join(", ")}`);

const missingFiles = [];
for (const row of resolved) {
  const filename = String(row.image.displayIconFile || "").split(/[\\/]/).pop();
  const file = path.join("assets", "pals", filename);
  if (!filename || !fs.existsSync(file)) missingFiles.push(`${row.name}:${file}`);
}
if (missingFiles.length) throw new Error(`Missing local Pal images: ${missingFiles.join(", ")}`);

const unnumbered = resolved.filter(row => !row.deck);
if (unnumbered.length !== 11) throw new Error(`Expected 11 unnumbered special Pals, got ${unnumbered.length}`);
if (new Set(unnumbered.map(row => row.id)).size !== unnumbered.length) throw new Error("Unnumbered special Pal IDs are not unique");

const requiredExistingNames = ["Green Slime", "Blue Slime", "Red Slime", "Purple Slime", "Illuminant Slime", "Rainbow Slime", "Enchanted Sword", "Cave Bat", "Illuminant Bat", "Eye of Cthulhu", "Demon Eye"];
for (const name of requiredExistingNames) {
  if (!resolved.some(row => row.name === name)) throw new Error(`Required unnumbered Pal missing: ${name}`);
}

// Core data must remain valid even when image data is unavailable.
const coreOnlyIds = new Set(resolved.map(row => row.id));
if (coreOnlyIds.size !== 299) throw new Error("Core data depends on the image manifest");

console.log(`Validated ${resolved.length} Pals, ${unnumbered.length} unique unnumbered IDs, ${imageRows.length} image rows and all local image files.`);
console.log("Core Pal and breeding data remains valid without using the image manifest at runtime.");
