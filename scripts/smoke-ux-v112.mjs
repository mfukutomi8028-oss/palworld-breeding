import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const page = await context.newPage();
const errors = [];
const room = `ci-ux-v112-${Date.now()}`;

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
await page.waitForFunction(() => document.querySelector("#paldexPurpose") && document.querySelector("#paldexResetFilters"), null, { timeout: 60000 });
await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));

await page.evaluate(() => openRecordDialog(""));
await page.click("#openEggPicker");
if (await page.locator("#eggPickerDialog .egg-size-tab").count() !== 3) throw new Error("Egg size selector must have exactly 3 choices");
if (await page.locator("#eggPickerDialog .egg-kind-option").count() !== 9) throw new Error("Egg type selector must show exactly 9 egg kinds");
if (await page.locator("#eggPickerDialog .egg-option").count() !== 0) throw new Error("Legacy 27-item egg grid is still visible");
await page.locator('#eggPickerDialog [data-egg-size="デカ"]').click();
if (await page.locator("#eggPickerDialog .egg-kind-option").count() !== 9) throw new Error("Changing egg size duplicated egg kinds");
await page.locator('#eggPickerDialog [data-egg-choice="平凡なデカタマゴ"]').click();
const largeSelection = await page.locator("#openEggPicker").getAttribute("data-value");
if (largeSelection !== "平凡なデカタマゴ") throw new Error(`Large egg selection is incorrect: ${largeSelection}`);
await page.click("#openEggPicker");
await page.locator('#eggPickerDialog [data-egg-size="通常"]').click();
await page.locator('#eggPickerDialog [data-egg-choice="熱を帯びたタマゴ"]').click();
const normalSelection = await page.locator("#openEggPicker").getAttribute("data-value");
if (normalSelection !== "熱を帯びたタマゴ" || normalSelection.includes("通常")) throw new Error(`Normal egg name should have no size prefix: ${normalSelection}`);
await page.evaluate(() => document.querySelector("#recordDialog")?.close());

await page.evaluate(() => {
  const current = window.eval("state");
  current.guideUnlocked = true;
  switchView("paldex");
  renderPaldex();
});
await page.waitForSelector("#paldexGrid .paldex-card-shell-v120");

const openLamballProfile = async () => {
  const card = page.locator("#paldexGrid [data-pal-detail]", { hasText: "モコロン" }).first();
  await card.waitFor();
  const shell = card.locator("xpath=ancestor::article[contains(@class,'paldex-card-shell-v120')]");
  await shell.locator("[data-pal-profile-open]").click();
  await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 5000 });
};

await openLamballProfile();
await page.waitForFunction(() => document.querySelector("#palDetail")?.textContent.includes("モコモコの盾"));
await page.waitForFunction(() => document.querySelector("#palDetail .pal-advanced-stats-v112"), null, { timeout: 60000 });
let detailText = await page.locator("#palDetail").innerText();
for (const removed of ["このルームで発見した作り方", "このルームで発見した派生先", "このパルを作れる配合", "このパルを親にした配合"]) {
  if (detailText.includes(removed)) throw new Error(`Redundant breeding section remains: ${removed}`);
}
for (const expected of ["配合記録へのショートカット", "詳細ステータス"]) {
  if (!detailText.includes(expected)) throw new Error(`Enhanced Pal detail is missing: ${expected}`);
}
await page.locator("#palDetail .pal-advanced-stats-v112 summary").click();
detailText = await page.locator("#palDetail").innerText();
for (const expected of ["近接攻撃係数", "捕獲補正", "オス確率"]) {
  if (!detailText.includes(expected)) throw new Error(`Opened advanced stats are missing: ${expected}`);
}

if (!new URLSearchParams((await page.evaluate(() => location.hash)).replace(/^#/, "")).get("pal")) throw new Error("Pal profile deep link was not added to the URL");
if (!(await page.locator("#palDetail .pal-profile-nav-v112").isVisible())) throw new Error("Pal profile navigation is not visible");
if (!(await page.locator("#palDetail [data-pal-breeding-target]").count())) throw new Error("Pal profile breeding shortcut is missing");
await page.locator("#palDetail [data-pal-profile-close]").click();
await page.waitForFunction(() => !document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"));
await page.waitForSelector("#paldexGrid .paldex-card-shell-v120");

await page.fill("#paldexSearch", "モコロン");
await page.selectOption("#paldexSort", "attackDesc");
await page.click("#paldexResetFilters");
if (await page.inputValue("#paldexSearch") !== "") throw new Error("Paldex reset did not clear search");
if (await page.inputValue("#paldexSort") !== "numberAsc") throw new Error("Paldex reset did not restore number sort");

const lamballId = await page.evaluate(() => getPal("モコロン").id);
await page.goto(`${baseUrl}#room=${room}&pal=${encodeURIComponent(lamballId)}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForFunction(() => document.querySelector("#app")?.dataset.ready === "true", null, { timeout: 60000 });
await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 60000 });
const directState = await page.evaluate(() => ({ view: window.eval("state").currentView, selected: window.eval("state").selectedPalId }));
if (directState.view !== "paldex" || directState.selected !== lamballId) throw new Error(`Direct Pal profile route failed: ${JSON.stringify(directState)}`);

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(150);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("UX v112 smoke tests passed: compact egg picker, full Paldex profiles, deep links, reset controls, and mobile layout.");
