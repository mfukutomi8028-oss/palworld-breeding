import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const room = `ci-ux-v117-${Date.now()}`;

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

// Fresh new-record form must start with no egg, regardless of DOM history.
await page.evaluate(() => openRecordDialog(""));
if (await page.locator("#openEggPicker").getAttribute("data-value") !== "") {
  throw new Error("Fresh record dialog did not start with an empty egg value");
}

// Select a real egg through the v112 two-step picker.
await page.click("#openEggPicker");
await page.locator('#eggPickerDialog [data-egg-size="通常"]').click();
await page.locator('#eggPickerDialog [data-egg-choice="平凡なタマゴ"]').click();
if (await page.locator("#openEggPicker").getAttribute("data-value") !== "平凡なタマゴ") {
  throw new Error("Egg selection was not applied");
}

// Re-open the picker and explicitly clear the selection.
await page.click("#openEggPicker");
await page.locator("#eggPickerDialog [data-egg-unset]").click();
const unsetValue = await page.locator("#openEggPicker").getAttribute("data-value");
if (unsetValue !== "") throw new Error(`Explicit egg unset kept stale value: ${unsetValue}`);
const unsetText = (await page.locator("#openEggPicker").innerText()).trim();
if (!unsetText.includes("タマゴを選択")) throw new Error(`Unset egg button did not return to placeholder: ${unsetText}`);

// Reproduce the original second bug: leave a selected egg in the previous
// dialog, close it, then open a brand-new record. The previous egg must not leak.
await page.click("#openEggPicker");
await page.locator('#eggPickerDialog [data-egg-size="デカ"]').click();
await page.locator('#eggPickerDialog [data-egg-choice="平凡なデカタマゴ"]').click();
if (await page.locator("#openEggPicker").getAttribute("data-value") !== "平凡なデカタマゴ") {
  throw new Error("Precondition failed: large egg was not selected");
}
await page.evaluate(() => document.querySelector("#recordDialog")?.close());
await page.evaluate(() => openRecordDialog(""));
const freshValue = await page.locator("#openEggPicker").getAttribute("data-value");
if (freshValue !== "") throw new Error(`New record inherited previous egg value: ${freshValue}`);

// Existing record editing must still restore its saved egg.
const editId = await page.evaluate(() => {
  const current = window.eval("state");
  const id = `egg-edit-${Date.now()}`;
  current.records.push({
    id,
    parentA: "モコロン",
    parentB: "ツッパニャン",
    resultPal: "タマコッコ",
    eggType: "平凡なキョダイタマゴ",
    mutation: false,
    recorder: current.currentUser || "福冨",
    note: "",
    favorites: {},
    status: "verified",
    updatedAt: Date.now(),
  });
  document.querySelector("#recordDialog")?.close();
  openRecordDialog(id);
  return id;
});
if (!editId) throw new Error("Existing-record test setup failed");
const editValue = await page.locator("#openEggPicker").getAttribute("data-value");
if (editValue !== "平凡なキョダイタマゴ") throw new Error(`Existing record egg was not restored: ${editValue}`);

// Mobile regression: no new horizontal overflow.
await page.evaluate(() => document.querySelector("#recordDialog")?.close());
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(100);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("UX v117 smoke tests passed: explicit egg unset, fresh-record reset, edit restoration, and mobile layout.");
