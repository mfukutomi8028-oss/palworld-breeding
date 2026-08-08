import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const room = `ci-ux-v115-${Date.now()}`;

await context.addInitScript(roomId => {
  localStorage.setItem(`pal-breeding-current-user:${roomId}`, "福冨");
  localStorage.setItem(`pal-breeding-guide-mode:${roomId}`, "1");
}, room);

const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
page.on("console", message => {
  const text = message.text();
  if (message.type() === "error" && !text.startsWith("Failed to load resource:")) errors.push(`console: ${text}`);
});

await page.goto(`${baseUrl}#room=${room}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForFunction(() => document.querySelector("#app")?.dataset.ready === "true", null, { timeout: 60000 });
await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));

const palId = await page.evaluate(() => {
  const current = window.eval("state");
  current.guideUnlocked = true;
  const pal = getPal("モコロン");
  current.selectedPalId = pal.id;
  switchView("paldex");
  renderPaldex();
  return pal.id;
});

await page.waitForFunction(() => {
  return document.querySelector("#paldexGrid .element-icon-v113") &&
    document.querySelector("#paldexGrid .pal-card-work-icons-v113 .work-icon-v113") &&
    document.querySelector("#palDetail .element-icon-v113") &&
    document.querySelector("#palDetail .work-icon-v113");
}, null, { timeout: 60000 });

async function sizeOf(locator, label) {
  const box = await locator.first().boundingBox();
  if (!box) throw new Error(`${label} is not visible`);
  return box;
}
function within(box, min, max, label) {
  if (box.width < min || box.width > max || box.height < min || box.height > max) {
    throw new Error(`${label} size is outside ${min}-${max}px: ${JSON.stringify(box)}`);
  }
}

within(await sizeOf(page.locator("#paldexGrid .element-icon-v113"), "Paldex card element icon"), 18, 24, "Paldex card element icon");
within(await sizeOf(page.locator("#paldexGrid .pal-card-work-icons-v113 .work-icon-v113"), "Paldex card work icon"), 17, 22, "Paldex card work icon");
within(await sizeOf(page.locator("#palDetail .element-icon-v113"), "Preview element icon"), 20, 24, "Preview element icon");
within(await sizeOf(page.locator("#palDetail .work-icon-v113"), "Preview work icon"), 18, 22, "Preview work icon");
const portrait = await page.locator("#palDetail .pal-detail-hero > img").first().boundingBox();
if (!portrait || portrait.width < 100 || portrait.height < 100) throw new Error(`Main Pal portrait was accidentally reduced: ${JSON.stringify(portrait)}`);

await page.locator("#palDetail [data-pal-profile-open]").click();
await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 10000 });
const profileRoute = await page.evaluate(() => ({
  view: window.eval("state").currentView,
  hash: location.hash,
}));
if (profileRoute.view !== "paldex" || new URLSearchParams(profileRoute.hash.replace(/^#/, "")).get("pal") !== palId) {
  throw new Error(`Pal profile route did not open correctly: ${JSON.stringify(profileRoute)}`);
}
within(await sizeOf(page.locator("#palDetail .element-icon-v113"), "Profile element icon"), 20, 24, "Profile element icon");
within(await sizeOf(page.locator("#palDetail .work-icon-v113"), "Profile work icon"), 18, 22, "Profile work icon");

// Regression: leaving a profile through the left navigation must not be bounced
// back to Paldex by the remaining `pal` hash parameter.
await page.locator('.nav__item[data-view="records"]').click();
await page.waitForFunction(() => window.eval("state").currentView === "records", null, { timeout: 10000 });
const afterNav = await page.evaluate(() => ({
  view: window.eval("state").currentView,
  hash: location.hash,
  profileOpen: document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"),
  title: document.title,
}));
const afterNavParams = new URLSearchParams(afterNav.hash.replace(/^#/, ""));
if (afterNav.view !== "records") throw new Error(`Left navigation did not leave Pal profile: ${JSON.stringify(afterNav)}`);
if (afterNavParams.get("room") !== room) throw new Error(`Room hash was lost while leaving profile: ${afterNav.hash}`);
if (afterNavParams.has("pal")) throw new Error(`Pal hash remained after leaving profile: ${afterNav.hash}`);
if (afterNav.profileOpen) throw new Error("Pal profile class remained after left navigation");
if (afterNav.title !== "パル配合ノート") throw new Error(`Document title was not reset after leaving profile: ${afterNav.title}`);

// Deep links must still restore the profile when a pal parameter is explicitly supplied.
await page.evaluate(({ roomId, selectedPalId }) => {
  location.hash = `room=${encodeURIComponent(roomId)}&pal=${encodeURIComponent(selectedPalId)}`;
}, { roomId: room, selectedPalId: palId });
await page.waitForFunction(() => window.eval("state").currentView === "paldex" && document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 10000 });
const restored = await page.evaluate(() => ({
  hash: location.hash,
  selected: window.eval("state").selectedPalId,
  view: window.eval("state").currentView,
}));
if (restored.selected !== palId || restored.view !== "paldex") throw new Error(`Direct profile route no longer restores correctly: ${JSON.stringify(restored)}`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("UX v115 smoke tests passed: larger element/work icons, profile exit navigation, room preservation, and deep-link restoration.");
