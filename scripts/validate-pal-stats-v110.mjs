import fs from "node:fs";

const pals = JSON.parse(fs.readFileSync("data/pals-v1.json", "utf8"));
const snapshot = JSON.parse(fs.readFileSync("data/pal-stats-v1.json", "utf8"));

if (!Array.isArray(pals.records) || pals.records.length !== 299) {
  throw new Error(`Expected 299 Pal records, got ${pals.records?.length}`);
}
if (!Array.isArray(snapshot.records) || snapshot.records.length !== 299 || snapshot.count !== 299) {
  throw new Error(`Expected 299 PalDB stat rows, got ${snapshot.records?.length}`);
}

const byName = new Map(snapshot.records.map(record => [record.name, record]));
const seenNumbers = new Set();
for (const pal of pals.records) {
  for (const key of ["hp", "attack", "defense", "statTotal"]) {
    if (!Number.isInteger(pal[key]) || pal[key] <= 0) {
      throw new Error(`${pal.name}: invalid ${key}=${pal[key]}`);
    }
  }
  if (pal.statTotal !== pal.hp + pal.attack + pal.defense) {
    throw new Error(`${pal.name}: total mismatch`);
  }
  const snapshotRow = byName.get(pal.name);
  if (!snapshotRow) throw new Error(`${pal.name}: missing from fixed PalDB stat snapshot`);
  if (
    snapshotRow.hp !== pal.hp ||
    snapshotRow.attack !== pal.attack ||
    snapshotRow.defense !== pal.defense ||
    snapshotRow.total !== pal.statTotal
  ) {
    throw new Error(`${pal.name}: snapshot and Pal master differ`);
  }
  const identity = `${pal.number}:${pal.name}`;
  if (seenNumbers.has(identity)) throw new Error(`Duplicate Pal stat identity: ${identity}`);
  seenNumbers.add(identity);
}

const lamball = pals.records.find(record => record.name === "Lamball");
if (!lamball || [lamball.hp, lamball.attack, lamball.defense, lamball.statTotal].join("/") !== "70/70/70/210") {
  throw new Error(`Lamball verification failed: ${JSON.stringify(lamball)}`);
}

console.log("Validated 299 fixed PalDB HP/Attack/Defense/Total rows; Lamball is 70/70/70/210.");
