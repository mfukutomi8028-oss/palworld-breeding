import fs from "node:fs";

const growth = JSON.parse(fs.readFileSync("data/pal-growth-v1.json", "utf8"));
const stats = JSON.parse(fs.readFileSync("data/pal-stats-v1.json", "utf8"));

if (growth.count !== 299 || !Array.isArray(growth.records) || growth.records.length !== 299) {
  throw new Error(`Growth snapshot must contain 299 records, got ${growth.records?.length}`);
}
if (stats.count !== 299 || !Array.isArray(stats.records) || stats.records.length !== 299) {
  throw new Error(`Stat snapshot must contain 299 records, got ${stats.records?.length}`);
}

const growthByName = new Map(growth.records.map(record => [record.enName, record]));
if (growthByName.size !== 299) throw new Error("Growth snapshot English names are not unique; matching would be ambiguous");

for (const record of growth.records) {
  if (!record.enName) throw new Error("Growth record without enName");
  if (!record.partnerSkill || !Array.isArray(record.partnerSkill.stars) || record.partnerSkill.stars.length !== 5) {
    throw new Error(`${record.enName}: expected five Partner Skill star rows`);
  }
  const stars = record.partnerSkill.stars.map(row => Number(row.star));
  if (stars.join(",") !== "0,1,2,3,4") throw new Error(`${record.enName}: invalid star sequence ${stars}`);
  if (!Array.isArray(record.activeSkills)) throw new Error(`${record.enName}: activeSkills is not an array`);
  for (const skill of record.activeSkills) {
    if (!Number.isFinite(Number(skill.level)) || !skill.name || !skill.element) {
      throw new Error(`${record.enName}: invalid skill ${JSON.stringify(skill)}`);
    }
    if (skill.ct !== null && !Number.isFinite(Number(skill.ct))) throw new Error(`${record.enName}/${skill.name}: invalid CT`);
    if (skill.power !== null && !Number.isFinite(Number(skill.power))) throw new Error(`${record.enName}/${skill.name}: invalid power`);
  }
}

if (Number(growth.partnerStarCoverage) !== 299) throw new Error(`Partner-star coverage ${growth.partnerStarCoverage}/299`);
if (Number(growth.activeSkillCoverage) < 295) throw new Error(`Active-skill coverage too low: ${growth.activeSkillCoverage}/299`);

function statRow(name) {
  const matches = stats.records.filter(row => row.enName === name);
  if (!matches.length) throw new Error(`Missing stat row: ${name}`);
  const complete = matches.find(row => [row.hp,row.attack,row.defense,row.statTotal].every(value => Number.isFinite(Number(value))));
  if (!complete) throw new Error(`No complete stat row for ${name}`);
  return complete;
}

function assertStats(name, hp, attack, defense, total) {
  const row = statRow(name);
  const actual = [row.hp, row.attack, row.defense, row.statTotal].map(Number);
  const expected = [hp, attack, defense, total];
  if (actual.join(",") !== expected.join(",")) throw new Error(`${name} stats ${actual} != ${expected}`);
}

assertStats("Lamball", 70, 70, 70, 210);
assertStats("Menasting", 100, 100, 130, 330);

const lamball = growthByName.get("Lamball");
const lamballByLevel = new Map(lamball.activeSkills.map(skill => [Number(skill.level), skill]));
for (const [level, name, ct, power] of [[40,"パワーボム",8,120],[50,"パルブラスト",20,450],[70,"ホーリーバースト",30,700]]) {
  const skill = lamballByLevel.get(level);
  if (!skill || skill.name !== name || Number(skill.ct) !== ct || Number(skill.power) !== power) {
    throw new Error(`Lamball Lv${level} mismatch: ${JSON.stringify(skill)}`);
  }
}

const menasting = growthByName.get("Menasting");
const star0 = (menasting.partnerSkill.stars[0].effects || []).join(" ");
const star4 = (menasting.partnerSkill.stars[4].effects || []).join(" ");
for (const token of ["40", "5"]) if (!star0.includes(token)) throw new Error(`Menasting ★0 missing ${token}: ${star0}`);
for (const token of ["80", "10"]) if (!star4.includes(token)) throw new Error(`Menasting ★4 missing ${token}: ${star4}`);
const menasting40 = menasting.activeSkills.find(skill => Number(skill.level) === 40);
if (!menasting40 || menasting40.name !== "ロックランス" || Number(menasting40.ct) !== 20 || Number(menasting40.power) !== 400) {
  throw new Error(`Menasting Lv40 mismatch: ${JSON.stringify(menasting40)}`);
}

const oversized = growth.records.flatMap(record => (record.activeSkills || []).filter(skill => JSON.stringify(skill).length > 1500));
if (oversized.length) throw new Error("Growth snapshot contains unexpectedly long copied prose");

console.log(`Validated v118: ${growth.records.length} Pals, Partner Skills ${growth.partnerStarCoverage}/299, Active Skills ${growth.activeSkillCoverage}/299; stat rows remain 299 even where English form names repeat.`);
