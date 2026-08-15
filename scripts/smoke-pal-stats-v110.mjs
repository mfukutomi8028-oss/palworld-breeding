import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const room = `ci-pal-stats-v110-${Date.now()}`;
const errors = [];

await page.addInitScript(roomId => {
  localStorage.setItem(`pal-breeding-current-user:${roomId}`, "福冨");
  localStorage.setItem("palBoardRecorder", "福冨");
  localStorage.setItem(`pal-breeding-guide-mode:${roomId}`, "1");
}, room);
page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
page.on("console", message => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});

await page.goto(`${baseUrl}#room=${room}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForFunction(() => document.querySelector("#app")?.dataset.ready === "true", null, { timeout: 60000 });
await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));
await page.click('[data-view="paldex"]');
await page.waitForSelector("#paldexGrid .pal-card-button");

const runtime = await page.evaluate(() => {
  const current = window.eval("state");
  const lamball = current.pals.find(pal => pal.enName === "Lamball");
  return {
    count: current.pals.length,
    lamball: lamball && {
      hp: lamball.hp,
      attack: lamball.attack,
      defense: lamball.defense,
      total: lamball.statTotal,
    },
  };
});
if (runtime.count !== 299) throw new Error(`Expected 299 Pals, got ${runtime.count}`);
if (JSON.stringify(runtime.lamball) !== JSON.stringify({ hp: 70, attack: 70, defense: 70, total: 210 })) {
  throw new Error(`Lamball runtime stats are incorrect: ${JSON.stringify(runtime.lamball)}`);
}

const cardCount = await page.locator("#paldexGrid .pal-card-button").count();
if (cardCount !== 299) throw new Error(`Expected 299 Paldex cards, got ${cardCount}`);
const lamballCard = page.locator('#paldexGrid .pal-card-button:has-text("モコロン")').first();
await lamballCard.waitFor();
const lamballValues = await lamballCard.locator(".pal-stats strong").allTextContents();
if (lamballValues.join("/") !== "70/70/70/210") {
  throw new Error(`Lamball card stats are incorrect: ${lamballValues.join("/")}`);
}

await page.selectOption("#paldexSort", "totalDesc");
const totalsDesc = (await page.locator("#paldexGrid .pal-card-button .pal-stats strong:nth-child(1)").count()) >= 0
  ? await page.locator("#paldexGrid .pal-card-button").evaluateAll(cards => cards.map(card => Number(card.querySelectorAll(".pal-stats strong")[3]?.textContent)))
  : [];
for (let index = 1; index < totalsDesc.length; index += 1) {
  if (totalsDesc[index - 1] < totalsDesc[index]) {
    throw new Error(`Total descending sort failed at ${index}: ${totalsDesc[index - 1]} < ${totalsDesc[index]}`);
  }
}

await page.selectOption("#paldexSort", "hpAsc");
const hpAsc = await page.locator("#paldexGrid .pal-card-button").evaluateAll(cards => cards.map(card => Number(card.querySelectorAll(".pal-stats strong")[0]?.textContent)));
for (let index = 1; index < hpAsc.length; index += 1) {
  if (hpAsc[index - 1] > hpAsc[index]) {
    throw new Error(`HP ascending sort failed at ${index}: ${hpAsc[index - 1]} > ${hpAsc[index]}`);
  }
}

const currentLamballCard = page.locator('#paldexGrid .pal-card-button:has-text("モコロン")').first();
const lamballShell = currentLamballCard.locator("xpath=ancestor::article[contains(@class,'paldex-card-shell-v120')]");
await lamballShell.locator("[data-pal-profile-open]").click();
await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 5000 });
await page.waitForSelector("#palDetail .pal-stats--detail strong");
const detailValues = await page.locator("#palDetail .pal-stats--detail strong").allTextContents();
if (detailValues.join("/") !== "70/70/70/210") {
  throw new Error(`Lamball detail stats are incorrect: ${detailValues.join("/")}`);
}
if (errors.length) throw new Error(errors.join(" | "));

await browser.close();
console.log("Paldex PalDB stat display, sorting, and full-profile detail smoke test passed.");
