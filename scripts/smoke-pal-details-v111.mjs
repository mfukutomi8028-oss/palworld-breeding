import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const page = await context.newPage();
const errors = [];
const room = `ci-pal-details-v111-${Date.now()}`;

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
await page.waitForFunction(() => document.querySelector("#paldexPurpose") && document.querySelector("#paldexGrid .paldex-card-shell-v120"), null, { timeout: 60000 });
await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));

const openProfileByName = async name => {
  const card = page.locator("#paldexGrid [data-pal-detail]", { hasText: name }).first();
  await card.waitFor();
  const shell = card.locator("xpath=ancestor::article[contains(@class,'paldex-card-shell-v120')]");
  await shell.locator("[data-pal-profile-open]").click();
  await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 5000 });
};

const closeProfile = async () => {
  await page.locator("#palDetail [data-pal-profile-close]").click();
  await page.waitForFunction(() => !document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 5000 });
  await page.waitForSelector("#paldexGrid .paldex-card-shell-v120");
};

await page.evaluate(() => {
  const current = window.eval("state");
  current.guideUnlocked = true;
  switchView("paldex");
  renderPaldex();
});
await openProfileByName("モコロン");
await page.waitForFunction(() => document.querySelector("#palDetail")?.textContent.includes("モコモコの盾"));

const lamballText = await page.locator("#palDetail").innerText();
for (const expected of ["モコモコの盾", "平凡なタマゴ", "食事量", "100", "騎乗ダッシュ値", "550", "水上ダッシュ", "165"]) {
  if (!lamballText.includes(expected)) throw new Error(`Lamball detail is missing ${expected}`);
}
if (!(await page.locator('#paldexSort option[value="rideSprintDesc"]').count())) throw new Error("Movement sort options are missing");
if (!(await page.locator('#paldexPurpose option[value="air"]').count())) throw new Error("Purpose filters are missing");

await page.locator('#palDetail [data-compare-pal]').click();
await closeProfile();
await openProfileByName("ツッパニャン");
await page.waitForFunction(() => document.querySelector("#palDetail")?.textContent.includes("猫の手も借りたい"));
await page.locator('#palDetail [data-compare-pal]').click();
if (await page.locator("#palCompareItems .pal-compare-chip").count() !== 2) throw new Error("Two Pals were not added to comparison");
await page.locator("[data-compare-open]").click();
if (!(await page.locator("#palCompareDialog").evaluate(dialog => dialog.open))) throw new Error("Comparison dialog did not open");
if (await page.locator("#palCompareDialog thead th").count() !== 3) throw new Error("Comparison table has the wrong number of columns");
if (!(await page.locator("#palCompareDialog tbody th", { hasText: "食事量" }).count())) throw new Error("Food comparison row is missing");
await page.evaluate(() => document.querySelector("#palCompareDialog")?.close());

await closeProfile();
await page.selectOption("#paldexPurpose", "air");
await page.waitForTimeout(100);
const filteredCount = await page.locator("#paldexGrid [data-pal-detail]").count();
if (filteredCount < 1) throw new Error("Air-mount filter returned no Pals");

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(150);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("Pal detail smoke tests passed: full-profile fixed data, filters, sorting, comparison, and mobile layout.");
