import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
const room = `ci-pal-growth-v118-${Date.now()}`;

page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
page.on("console", message => {
  const text = message.text();
  if (message.type() === "error" && !text.startsWith("Failed to load resource:")) errors.push(`console: ${text}`);
});

await page.addInitScript(roomId => {
  localStorage.setItem(`pal-breeding-current-user:${roomId}`, "福冨");
  localStorage.setItem(`pal-breeding-guide-mode:${roomId}`, "1");
}, room);
await page.goto(`${baseUrl}#room=${room}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForFunction(() => document.querySelector("#app")?.dataset.ready === "true", null, { timeout: 60000 });
await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));

await page.evaluate(() => {
  const current = window.eval("state");
  current.guideUnlocked = true;
  current.selectedPalId = getPal("モコロン").id;
  switchView("paldex");
  renderPaldex();
});
await page.waitForFunction(() => document.querySelector("#palDetail .pal-growth")?.textContent.includes("★強化シミュレーター"), null, { timeout: 60000 });

// Species-stat ranks are visible directly beside all four base stats.
const rankBadges = page.locator("#palDetail .pal-stats--detail .pal-stat-rank");
if (await rankBadges.count() !== 4) throw new Error(`Expected four species-stat rank badges, got ${await rankBadges.count()}`);
for (const text of await rankBadges.allTextContents()) {
  if (!/\d+位 \/ 299/.test(text)) throw new Error(`Invalid stat-rank label: ${text}`);
}

// Lamball learnset representative values.
const lamballDetail = await page.locator("#palDetail").innerText();
for (const value of ["Lv.40", "パワーボム", "120", "Lv.50", "パルブラスト", "450", "Lv.70", "ホーリーバースト", "700"]) {
  if (!lamballDetail.includes(value)) throw new Error(`Lamball growth detail is missing ${value}`);
}

// Work Suitability must stay at base values through ★3 and only increase at ★4.
const workSnapshot = async () => page.locator("#palDetail .growth-work-chip").allTextContents();
const baseWork = await workSnapshot();
await page.locator('#palDetail [data-growth-star$="|1"]').click();
await page.waitForTimeout(50);
const star1Work = await workSnapshot();
if (JSON.stringify(baseWork) !== JSON.stringify(star1Work)) throw new Error(`Work suitability changed before ★4: ${JSON.stringify({baseWork, star1Work})}`);
await page.locator('#palDetail [data-growth-star$="|4"]').click();
await page.waitForTimeout(50);
const star4Work = await workSnapshot();
if (!star4Work.length || star4Work.some(text => !text.includes("+1"))) throw new Error(`★4 did not increase all Lamball work suitabilities: ${JSON.stringify(star4Work)}`);

// Menasting exact Partner Skill values and representative Lv40 skill.
await page.evaluate(() => {
  const current = window.eval("state");
  current.selectedPalId = getPal("デスティング").id;
  renderPaldex();
});
await page.waitForFunction(() => document.querySelector("#palDetail .pal-growth")?.textContent.includes("スチールスコーピオン"));
let menastingText = await page.locator("#palDetail .pal-growth").innerText();
if (!menastingText.includes("40") || !menastingText.includes("5")) throw new Error(`Menasting ★0 values missing: ${menastingText}`);
await page.locator('#palDetail [data-growth-star$="|4"]').click();
await page.waitForTimeout(50);
menastingText = await page.locator("#palDetail .pal-growth").innerText();
for (const value of ["80", "10", "Lv.40", "ロックランス", "400"]) {
  if (!menastingText.includes(value)) throw new Error(`Menasting ★4/detail is missing ${value}`);
}

// Work suitability sorting follows the selected work type and exposes the level on cards.
await page.selectOption("#paldexWork", { label: "採掘" });
await page.selectOption("#paldexSort", "workDesc");
await page.waitForTimeout(80);
const scoreTexts = (await page.locator("#paldexGrid .paldex-work-score strong").allTextContents()).slice(0, 20);
if (!scoreTexts.length) throw new Error("Work-suitability sort score badges are missing");
const levels = scoreTexts.map(text => Number((text.match(/Lv\.(\d+)/) || [])[1])).filter(Number.isFinite);
for (let index = 1; index < levels.length; index += 1) {
  if (levels[index] > levels[index - 1]) throw new Error(`Mining work sort is not descending: ${levels.join(",")}`);
}
await page.selectOption("#paldexSort", "workAsc");
await page.waitForTimeout(80);
const ascTexts = (await page.locator("#paldexGrid .paldex-work-score strong").allTextContents()).slice(0, 20);
const ascLevels = ascTexts.map(text => Number((text.match(/Lv\.(\d+)/) || [])[1])).filter(Number.isFinite);
for (let index = 1; index < ascLevels.length; index += 1) {
  if (ascLevels[index] < ascLevels[index - 1]) throw new Error(`Mining work sort is not ascending: ${ascLevels.join(",")}`);
}

// Modal backdrop behaves like ×/Cancel, while an inside click does not close it.
await page.click('[data-view="records"]');
await page.click("#addRecord");
await page.click('#recordDialog [data-open-picker="recordParentA"]');
await page.waitForSelector("#palPickerDialog[open]");
await page.locator("#palPickerSearch").click();
if (!(await page.locator("#palPickerDialog").evaluate(dialog => dialog.open))) throw new Error("Inside picker click unexpectedly closed the dialog");
await page.mouse.click(2, 2);
await page.waitForFunction(() => !document.querySelector("#palPickerDialog")?.open);
await page.evaluate(() => document.querySelector("#recordDialog")?.close());

// Mobile layout remains usable with the added detail sections.
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => {
  const current = window.eval("state");
  current.selectedPalId = getPal("モコロン").id;
  switchView("paldex");
  renderPaldex();
});
await page.waitForTimeout(100);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("v118 browser smoke passed: ranks, Partner Skills, learnsets, ★4 work suitability, work sorting, backdrop-close, and mobile layout.");
