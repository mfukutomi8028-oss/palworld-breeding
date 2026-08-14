import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const page = await context.newPage();
const errors = [];
const room = `ci-ux-v118-${Date.now()}`;

page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
page.on("console", message => {
  const text = message.text();
  if (message.type() === "error" && !text.startsWith("Failed to load resource:")) errors.push(`console: ${text}`);
});

const partnerFixture = {
  partnerSkills: {
    DarkScorpion: {
      id: "DarkScorpion",
      description: "被动: ElementAddDrop_Thunder(1★=40 2★=50 3★=60 4★=70 5★=80) | TrainerDEF(1★=5 2★=6 3★=7 4★=8 5★=10)",
      values: [],
    },
  },
};
const moves = [
  ["MudShot",1,"Bog Blast","マッドシュート","Ground",40,2],
  ["PoisonShot",7,"Poison Blast","ポイズンシュート","Dark",30,2],
  ["DarkWave",15,"Shadow Burst","シャドウバースト","Dark",80,4],
  ["ThrowRock",22,"Stone Cannon","ストーンキャノン","Ground",120,8],
  ["ShadowBall",30,"Nightmare Ball","ナイトメアボール","Dark",300,16],
  ["Unique_DarkScorpion_Pierce",35,"Jumping Stinger","ジャンピングスティンガー","Ground",350,16],
  ["RockLance",40,"Rock Lance","ロックランス","Ground",400,20],
  ["DarkLaser",50,"Dark Laser","ダークレーザー","Dark",450,20],
  ["DarkLegion",70,"Dark Whisp","ダークウィスプ","Dark",600,30],
];
const learnsetFixture = Object.fromEntries(moves.map(([id,level], index) => [`DarkScorpion${String(index).padStart(3,"0")}`, { PalID: "DarkScorpion", WazaID: `EPalWazaID::${id}`, Level: level }]));
const attackNamesFixture = Object.fromEntries(moves.map(([id,,name]) => [`EPalWazaID::${id}`, name]));
const skillsFixture = { game_version: "1.0", skills: moves.map(([, ,name,,element,power,ct]) => ({ name, element, power, cooldown_seconds: ct, description: `${name} effect` })) };
const nameFixture = Object.fromEntries(moves.map(([id,,,ja]) => [`ACTION_SKILL_${id}`, { TextData: { LocalizedString: ja } }]));
const descFixture = Object.fromEntries(moves.map(([id,,,ja]) => [`ACTION_SKILL_${id}`, { TextData: { LocalizedString: `${ja}の日本語効果説明` } }]));

await page.route("**/*2026-07-06.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(partnerFixture) }));
await page.route("**/DataTable/Waza/WazaMasterLevel.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(learnsetFixture) }));
await page.route("**/resources/data/en-GB/attacks.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(attackNamesFixture) }));
await page.route("**/data/active_skills.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(skillsFixture) }));
await page.route("**/DataTable/Text/SkillNameText.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(nameFixture) }));
await page.route("**/DataTable/Text/SkillDescText.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(descFixture) }));

await context.addInitScript(roomId => {
  localStorage.setItem(`pal-breeding-current-user:${roomId}`, "福冨");
  localStorage.setItem(`pal-breeding-guide-mode:${roomId}`, "1");
}, room);

await page.goto(`${baseUrl}#room=${room}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForFunction(() => document.querySelector("#app")?.dataset.ready === "true", null, { timeout: 60000 });
await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));

await page.evaluate(() => {
  const pal = getPal("デスティング");
  if (!pal) throw new Error("Menasting/デスティング is missing");
  const current = window.eval("state");
  current.guideUnlocked = true;
  current.selectedPalId = pal.id;
  switchView("paldex");
  renderPaldex();
});
await page.waitForFunction(() => document.querySelector("#palDetail [data-partner-ranks-v118] table"), null, { timeout: 10000 });

const partnerRows = await page.locator("#palDetail .rank-table-v118 tbody tr").allTextContents();
if (!partnerRows.some(text => text.includes("雷属性パルのドロップ増加") && /40.*50.*60.*70.*80/.test(text))) throw new Error(`Menasting drop rank row mismatch: ${partnerRows.join(" | ")}`);
if (!partnerRows.some(text => text.includes("プレイヤー防御力") && /5.*6.*7.*8.*10/.test(text))) throw new Error(`Menasting defense rank row mismatch: ${partnerRows.join(" | ")}`);

const skillText = (await page.locator("#palDetail .skill-list-v118").innerText()).replace(/\s+/g, " ");
for (const expected of ["Lv.1", "マッドシュート", "Lv.40", "ロックランス", "Lv.50", "ダークレーザー", "Lv.70", "ダークウィスプ", "CT 30秒"]) {
  if (!skillText.includes(expected)) throw new Error(`Skill progression missing ${expected}: ${skillText}`);
}

const statText = (await page.locator("#palDetail .pal-stats-rank-v118").innerText()).replace(/\s+/g, " ");
if (!statText.includes("位 / 299")) throw new Error(`Stat ranks were not rendered: ${statText}`);

const workSteps = (await page.locator("#palDetail .work-rank-steps-v118").innerText()).replace(/\s+/g, " ");
if (!workSteps.includes("★1") || !workSteps.includes("1項目が+1") || !workSteps.includes("★4") || !workSteps.includes("全作業適性が+1")) throw new Error(`Work rank rules mismatch: ${workSteps}`);

const workSort = await page.evaluate(() => ({
  values: [...document.querySelectorAll("#paldexSort option")].map(option => option.value),
  minExists: Boolean(document.querySelector("#paldexWorkMin")),
}));
if (!workSort.values.includes("workDesc") || !workSort.values.includes("workAsc") || !workSort.minExists) throw new Error(`Work controls missing: ${JSON.stringify(workSort)}`);

const sortCheck = await page.evaluate(() => {
  const current = window.eval("state");
  const workSelect = document.querySelector("#paldexWork");
  const mining = [...workSelect.options].find(option => option.textContent.includes("採掘"));
  if (!mining) return { skipped: true, options: [...workSelect.options].map(option => option.textContent) };
  workSelect.value = mining.value;
  current.paldexSort = "workDesc";
  document.querySelector("#paldexSort").value = "workDesc";
  renderPaldex();
  const pals = filteredPals();
  return { skipped: false, first: pals.slice(0, 12).map(pal => pal.works.find(item => item.name === mining.value)?.level || 0) };
});
if (!sortCheck.skipped) {
  const filtered = sortCheck.first.filter(Boolean);
  for (let i = 1; i < filtered.length; i += 1) if (filtered[i] > filtered[i - 1]) throw new Error(`Work descending sort failed: ${JSON.stringify(sortCheck)}`);
}

await page.evaluate(() => {
  const dialog = document.querySelector("#userDialog");
  dialog.showModal();
  dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
if (await page.locator("#userDialog").getAttribute("open") !== null) throw new Error("Dialog backdrop click did not close userDialog");

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(100);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("UX v118 smoke tests passed: Menasting stars/skills, stat ranks, work sorting/filter UI, backdrop close, and mobile layout.");
