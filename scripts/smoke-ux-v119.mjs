import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const page = await context.newPage();
const errors = [];
const room = `ci-ux-v119-${Date.now()}`;

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
const learnsetRows = Object.fromEntries(moves.map(([id,level], index) => [`DarkScorpion${String(index).padStart(3,"0")}`, { PalId: "DarkScorpion", WazaID: `EPalWazaID::${id}`, Level: level }]));
const learnsetFixture = [{ Type: "CompositeDataTable", Name: "DT_WazaMasterLevel", Rows: learnsetRows }];
const attackNamesFixture = Object.fromEntries(moves.map(([id,,name]) => [`EPalWazaID::${id}`, name]));
const skillsFixture = { game_version: "1.0", skills: moves.map(([, ,name,,element,power,ct]) => ({ name, element, power, cooldown_seconds: ct, description: `${name} effect` })) };
const nameFixture = Object.fromEntries(moves.map(([id,,,ja]) => [`ACTION_SKILL_${id}`, { TextData: { LocalizedString: ja } }]));
const descFixture = Object.fromEntries(moves.map(([id,,,ja]) => [`ACTION_SKILL_${id}`, { TextData: { LocalizedString: `${ja}の日本語効果説明` } }]));

await page.route("**/*2026-07-06.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(partnerFixture) }));
await page.route("**/DT_WazaMasterLevel.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(learnsetFixture) }));
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
await page.waitForFunction(() => document.querySelector("#palDetail [data-partner-ranks-v119] .partner-effects-v119"), null, { timeout: 10000 });
await page.waitForFunction(() => document.querySelector("#palDetail .skill-list-v119"), null, { timeout: 10000 });

const partnerText = (await page.locator("#palDetail [data-partner-ranks-v119]").innerText()).replace(/\s+/g, " ");
if (!partnerText.includes("雷属性パルのドロップ増加") || !/40.*50.*60.*70.*80/.test(partnerText)) throw new Error(`Menasting drop rank mismatch: ${partnerText}`);
if (!partnerText.includes("プレイヤー防御力") || !/5.*6.*7.*8.*10/.test(partnerText)) throw new Error(`Menasting defense rank mismatch: ${partnerText}`);

await page.locator('#palDetail [data-work-star-v119="3"]').click();
const workText = (await page.locator("#palDetail [data-work-ranks-v119]").innerText()).replace(/\s+/g, " ");
if (!/伐採\s*Lv\.4/.test(workText) || !/採掘\s*Lv\.7/.test(workText)) throw new Error(`Menasting ★3 work levels mismatch: ${workText}`);

const skillText = (await page.locator("#palDetail .skill-list-v119").innerText()).replace(/\s+/g, " ");
for (const expected of ["Lv.1", "マッドシュート", "Lv.35", "ジャンピングスティンガー", "Lv.50", "ダークレーザー", "Lv.70", "ダークウィスプ", "CT 30秒"]) {
  if (!skillText.includes(expected)) throw new Error(`Skill progression missing ${expected}: ${skillText}`);
}

const statText = (await page.locator("#palDetail .pal-stats-rank-v118").innerText()).replace(/\s+/g, " ");
if (!statText.includes("位 / 299")) throw new Error(`Stat ranks were not rendered: ${statText}`);

const sourceText = (await page.locator("#palDetail").innerText()).replace(/\s+/g, " ");
for (const hiddenText of ["PalDB", "参照:", "palworld-kb", "固定データ取得日", "ゲーム抽出データ"]) {
  if (sourceText.includes(hiddenText)) throw new Error(`Visible source label remained: ${hiddenText}`);
}

const overlap = await page.evaluate(() => {
  const reset = document.querySelector("#paldexResetFilters")?.getBoundingClientRect();
  const purpose = document.querySelector("#paldexPurpose")?.closest("label")?.getBoundingClientRect();
  if (!reset || !purpose) return null;
  const intersects = !(reset.right <= purpose.left || reset.left >= purpose.right || reset.bottom <= purpose.top || reset.top >= purpose.bottom);
  return { intersects, reset: { x: reset.x, y: reset.y, w: reset.width, h: reset.height }, purpose: { x: purpose.x, y: purpose.y, w: purpose.width, h: purpose.height } };
});
if (!overlap || overlap.intersects) throw new Error(`Paldex reset/purpose overlap: ${JSON.stringify(overlap)}`);

const starFilter = await page.evaluate(() => {
  const work = document.querySelector("#paldexWork");
  const mining = [...work.options].find(option => option.textContent.includes("採掘"));
  if (!mining) return { skipped: true };
  work.value = mining.value;
  document.querySelector("#paldexWorkStar").value = "4";
  window.eval("state").paldexWorkStarV119 = 4;
  document.querySelector("#paldexWorkMin").value = "8";
  renderPaldex();
  return { skipped: false, hasMenasting: filteredPals().some(pal => pal.name === "デスティング") };
});
if (!starFilter.skipped && !starFilter.hasMenasting) throw new Error(`★4 work-level filtering did not include Menasting at Mining Lv.8: ${JSON.stringify(starFilter)}`);

const layout = await page.evaluate(() => {
  const overview = document.querySelector("#palDetail .pal-growth-overview-v119")?.getBoundingClientRect();
  const skills = document.querySelector("#palDetail .progression-skills-v119")?.getBoundingClientRect();
  if (!overview || !skills) return null;
  return { below: skills.top >= overview.bottom - 2, widthRatio: skills.width / overview.width };
});
if (!layout || !layout.below || layout.widthRatio < 0.95) throw new Error(`Growth layout is not full-width below overview: ${JSON.stringify(layout)}`);

await page.evaluate(() => {
  const dialog = document.querySelector("#userDialog");
  dialog.showModal();
  dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
if (await page.locator("#userDialog").getAttribute("open") !== null) throw new Error("Dialog backdrop click did not close userDialog");

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(150);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("UX v119 smoke tests passed: exact work stars, Lv70 learnsets, source cleanup, star-aware filtering, non-overlapping toolbar, full-width skills, backdrop close and mobile layout.");
