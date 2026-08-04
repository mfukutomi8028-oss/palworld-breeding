import fs from "node:fs";

const [paldbPath, manifestPath, treePath] = process.argv.slice(2);
if (!paldbPath || !manifestPath || !treePath) {
  throw new Error("Usage: node scripts/validate-pal-images.mjs <paldb.json> <manifest.json> <tree.json>");
}

const paldb = JSON.parse(fs.readFileSync(paldbPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const tree = JSON.parse(fs.readFileSync(treePath, "utf8"));
const records = Array.isArray(paldb.records) ? paldb.records : [];
const icons = Array.isArray(manifest.partnerSkills) ? manifest.partnerSkills : [];
const paths = new Set((tree.tree || []).map(entry => entry.path));

const normalizeNumber = value => {
  const raw = String(value || "").trim().toUpperCase();
  const match = raw.match(/^(\d+)([A-Z]*)$/);
  return match ? `${match[1].padStart(3, "0")}${match[2]}` : raw;
};
const normalizeName = value => String(value || "").normalize("NFKC").toLowerCase().replace(/[\s_\-'.()]/g, "");
const canonicalPath = value => `public/icons/palworld/${String(value || "").replace(/^partner_skills\//, "partner-skills/")}`;

const byNumber = new Map();
for (const row of icons) {
  const key = normalizeNumber(row.palNumber);
  if (byNumber.has(key)) throw new Error(`Duplicate manifest Pal number: ${key}`);
  byNumber.set(key, row);
}

const missingRows = [];
const nameMismatches = [];
const missingFiles = [];
for (const record of records) {
  const key = normalizeNumber(record.number);
  const row = byNumber.get(key);
  if (!row) {
    missingRows.push(`${key}:${record.name}`);
    continue;
  }
  if (normalizeName(record.name) !== normalizeName(row.pal)) {
    nameMismatches.push(`${key}:${record.name} != ${row.pal}`);
  }
  const path = canonicalPath(row.displayIconFile);
  if (!paths.has(path)) missingFiles.push(path);
}

if (records.length !== 300) throw new Error(`Expected 300 PalDB rows, got ${records.length}`);
if (icons.length !== 300) throw new Error(`Expected 300 manifest rows, got ${icons.length}`);
if (missingRows.length) throw new Error(`Missing manifest rows: ${missingRows.join(", ")}`);
if (nameMismatches.length) throw new Error(`Pal/image name mismatches: ${nameMismatches.join(", ")}`);
if (missingFiles.length) throw new Error(`Missing icon files: ${missingFiles.join(", ")}`);

for (const number of ["007", "041", "058", "085", "097", "108", "129", "132", "135", "137", "186"]) {
  const row = byNumber.get(number);
  if (!row) throw new Error(`Required screenshot review Pal missing: ${number}`);
  const path = canonicalPath(row.displayIconFile);
  if (!paths.has(path)) throw new Error(`Required screenshot review image missing: ${number} ${path}`);
}

console.log(`Validated ${records.length} Pal records against ${icons.length} canonical image mappings.`);
console.log("All mapped image files exist in the fixed source tree.");
