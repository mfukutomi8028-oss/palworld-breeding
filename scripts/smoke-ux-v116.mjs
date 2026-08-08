import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const page = await context.newPage();
const errors = [];
const room = `ci-ux-v116-${Date.now()}`;

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

// Hint 4: missing Japanese-name slots must be hidden until the card is opened.
const hintFixture = await page.evaluate(() => {
  const initial = document.createElement("div");
  initial.innerHTML = positionHintPanel("japanese", "ヒント4・日本語名", "ネムラム", [], "forward");
  const initialButtons = [...initial.querySelectorAll("[data-forward-position]")];
  const missingInitial = initialButtons[6];
  const revealed = document.createElement("div");
  revealed.innerHTML = positionHintPanel("japanese", "ヒント4・日本語名", "ネムラム", ["last"], "forward");
  const missingRevealed = revealed.querySelector('[data-forward-position="japanese|last"]');
  const reverse = document.createElement("div");
  reverse.innerHTML = positionHintPanel("japanese", "ヒント4・日本語名", "ネムラム", [], "reverse", "fixture-pal");
  return {
    initialText: missingInitial?.querySelector("strong")?.textContent || "",
    initialDisabled: Boolean(missingInitial?.disabled),
    revealedText: missingRevealed?.querySelector("strong")?.textContent || "",
    revealedClass: missingRevealed?.className || "",
    revealedDisabled: Boolean(missingRevealed?.disabled),
    reverseHasHiddenMissing: reverse.querySelector('[data-reverse-position="fixture-pal|japanese|last"] strong')?.textContent === "?",
  };
});
if (hintFixture.initialText !== "?" || hintFixture.initialDisabled) throw new Error(`Japanese hint missing slot is exposed before click: ${JSON.stringify(hintFixture)}`);
if (hintFixture.revealedText !== "×" || !hintFixture.revealedClass.includes("is-missing") || !hintFixture.revealedDisabled) throw new Error(`Japanese hint missing slot does not reveal like romaji hint: ${JSON.stringify(hintFixture)}`);
if (!hintFixture.reverseHasHiddenMissing) throw new Error("Reverse Japanese hint exposes a missing slot before click");

// Compare tray: keep selection, but do not leak the tray into other main views.
await page.evaluate(() => {
  const current = window.eval("state");
  current.guideUnlocked = true;
  current.selectedPalId = getPal("モコロン").id;
  switchView("paldex");
  renderPaldex();
});
await page.waitForFunction(() => document.querySelector("#palDetail [data-compare-pal]"), null, { timeout: 60000 });
await page.locator("#palDetail [data-compare-pal]").first().click();
await page.waitForFunction(() => document.querySelectorAll("#palCompareTray [data-compare-remove]").length === 1, null, { timeout: 10000 });
if (!(await page.locator("#palCompareTray").isVisible())) throw new Error("Compare tray should be visible inside Paldex after selection");

await page.evaluate(() => switchView("records"));
await page.waitForTimeout(100);
if (await page.locator("#palCompareTray").isVisible()) throw new Error("Compare tray leaked into records view");
const hiddenState = await page.evaluate(() => ({
  view: window.eval("state").currentView,
  bodyView: document.body.dataset.currentView,
  selectedCount: document.querySelectorAll("#palCompareTray [data-compare-remove]").length,
}));
if (hiddenState.view !== "records" || hiddenState.bodyView !== "records" || hiddenState.selectedCount !== 1) throw new Error(`Compare state was not preserved while hidden: ${JSON.stringify(hiddenState)}`);

await page.evaluate(() => switchView("paldex"));
await page.waitForTimeout(100);
if (!(await page.locator("#palCompareTray").isVisible())) throw new Error("Compare tray did not return when Paldex was reopened");
if (await page.locator("#palCompareTray [data-compare-remove]").count() !== 1) throw new Error("Compare selection was lost after navigation");

// Version shown in settings must follow the release version in config.js.
await page.evaluate(() => switchView("settings"));
await page.waitForFunction(() => document.querySelector("#systemStatus")?.textContent.includes("サイト版"));
const versionState = await page.evaluate(() => ({
  configured: window.palSiteVersion,
  statusText: document.querySelector("#systemStatus")?.textContent || "",
}));
if (versionState.configured !== "116" || !versionState.statusText.includes("v116")) throw new Error(`Site version is inconsistent: ${JSON.stringify(versionState)}`);

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(100);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("UX v116 smoke tests passed: Japanese hint reveal, scoped compare tray, current site version, and mobile layout.");
