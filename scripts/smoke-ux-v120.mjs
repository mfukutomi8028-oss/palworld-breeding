import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const page = await context.newPage();
const errors = [];
const room = `ci-ux-v120-${Date.now()}`;
let jormuntideCode = "Umihebi";

page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
page.on("console", message => {
  const text = message.text();
  if (message.type() === "error" && !text.startsWith("Failed to load resource:")) errors.push(`console: ${text}`);
});

const partnerFixture = { partnerSkills: {} };
const attackNamesFixture = { "EPalWazaID::SeaGush": "Geyser Gush" };
const skillsFixture = {
  game_version: "1.0",
  skills: [{
    name: "Geyser Gush",
    element: "Water",
    power: 600,
    cooldown_seconds: 30,
    description: "Erupts massive pillars of water beneath and around the enemy.",
  }],
};
const nameFixture = [{
  Type: "CompositeDataTable",
  Name: "DT_SkillNameText",
  Rows: {
    ACTION_SKILL_SeaGush: { TextData: { LocalizedString: "水柱噴出", SourceString: "水柱噴出" } },
  },
}];
const descFixture = [{
  Type: "CompositeDataTable",
  Name: "DT_SkillDescText",
  Rows: {
    ACTION_SKILL_SeaGush: { TextData: { LocalizedString: "敵のいる地点とその周囲に\r\n大量の水柱を噴出させる。", SourceString: "敵のいる地点とその周囲に\r\n大量の水柱を噴出させる。" } },
  },
}];

await page.route("**/*2026-07-06.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(partnerFixture) }));
await page.route("**/DT_WazaMasterLevel.json", route => {
  const rows = {
    [`${jormuntideCode}SeaGush`]: { PalId: jormuntideCode, WazaID: "EPalWazaID::SeaGush", Level: 70 },
  };
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ Type: "CompositeDataTable", Name: "DT_WazaMasterLevel", Rows: rows }]) });
});
await page.route("**/resources/data/en-GB/attacks.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(attackNamesFixture) }));
await page.route("**/data/active_skills.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(skillsFixture) }));
await page.route("**/Text/DT_SkillNameText.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(nameFixture) }));
await page.route("**/Text/DT_SkillDescText.json", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(descFixture) }));

await context.addInitScript(roomId => {
  localStorage.setItem(`pal-breeding-current-user:${roomId}`, "福冨");
  localStorage.setItem(`pal-breeding-guide-mode:${roomId}`, "1");
}, room);

await page.goto(`${baseUrl}#room=${room}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForFunction(() => document.querySelector("#app")?.dataset.ready === "true", null, { timeout: 60000 });
await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));

jormuntideCode = await page.evaluate(() => {
  const pal = getPal("レヴィドラ");
  if (!pal) throw new Error("Jormuntide/レヴィドラ is missing");
  const current = window.eval("state");
  current.guideUnlocked = true;
  switchView("paldex");
  renderPaldex();
  return pal.engineCode;
});
if (!jormuntideCode) throw new Error("Jormuntide engine code is missing");

await page.waitForSelector("#paldexGrid .paldex-card-shell-v120");
const filterState = await page.evaluate(() => ({
  min: Boolean(document.querySelector("#paldexWorkMin")),
  star: Boolean(document.querySelector("#paldexWorkStar")),
  previewVisible: Boolean(document.querySelector("#palDetail")?.offsetParent),
  actionCount: document.querySelectorAll("#paldexGrid .paldex-card-actions-v120").length,
  cardCount: document.querySelectorAll("#paldexGrid [data-pal-detail]").length,
}));
if (filterState.min || filterState.star) throw new Error(`Low-value work filters remain: ${JSON.stringify(filterState)}`);
if (filterState.previewVisible) throw new Error(`Paldex preview panel is still visible: ${JSON.stringify(filterState)}`);
if (!filterState.cardCount || filterState.actionCount !== filterState.cardCount) throw new Error(`Card actions were not added to every card: ${JSON.stringify(filterState)}`);

const jormuntideCard = page.locator("#paldexGrid [data-pal-detail]").filter({ hasText: "レヴィドラ" }).first();
if (!(await jormuntideCard.count())) throw new Error("Jormuntide card is missing");
await jormuntideCard.click();
await page.waitForTimeout(320);
const singleClickState = await page.evaluate(() => ({
  profile: document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"),
  modal: Boolean(document.querySelector("#palModal[open]")),
  previewVisible: Boolean(document.querySelector("#palDetail")?.offsetParent),
}));
if (singleClickState.profile || singleClickState.modal || singleClickState.previewVisible) throw new Error(`Single click still opens a preview: ${JSON.stringify(singleClickState)}`);

const shell = jormuntideCard.locator("xpath=ancestor::article[contains(@class,'paldex-card-shell-v120')]");
await shell.locator("[data-compare-pal]").click();
await page.waitForTimeout(50);
if (await page.locator("#palCompareTray").getAttribute("hidden") !== null) throw new Error("Compare action did not add the Pal to the compare tray");

await shell.locator("[data-pal-profile-open]").click();
await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 5000 });
await page.waitForFunction(() => document.querySelector("#palDetail .skill-list-v119"), null, { timeout: 10000 });

const lv70 = (await page.locator("#palDetail .skill-list-v119").innerText()).replace(/\s+/g, " ");
for (const expected of ["Lv.70", "水柱噴出", "敵のいる地点とその周囲に 大量の水柱を噴出させる。", "威力 600", "CT 30秒"]) {
  if (!lv70.includes(expected)) throw new Error(`Jormuntide Lv70 localization missing ${expected}: ${lv70}`);
}

const workPlacement = await page.evaluate(() => {
  const sections = [...document.querySelectorAll("#palDetail .pal-detail-body > .detail-section")];
  const work = sections.find(section => section.querySelector(":scope > h3")?.textContent?.trim() === "作業適性");
  const growth = work?.querySelector(".work-growth-inline-v120");
  const sideStillHasWork = Boolean(document.querySelector("#palDetail .pal-growth-side-v119 .work-growth-inline-v120"));
  return { hasWorkSection: Boolean(work), embedded: Boolean(growth), sideStillHasWork };
});
if (!workPlacement.hasWorkSection || !workPlacement.embedded || workPlacement.sideStillHasWork) throw new Error(`Work growth placement mismatch: ${JSON.stringify(workPlacement)}`);

await page.locator("#palDetail [data-pal-profile-close]").click();
await page.waitForFunction(() => !document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"));
await page.waitForSelector("#paldexGrid .paldex-card-shell-v120");
const menastingCard = page.locator("#paldexGrid [data-pal-detail]").filter({ hasText: "デスティング" }).first();
if (await menastingCard.count()) {
  await menastingCard.dblclick({ delay: 60 });
  await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 5000 });
  const hashHasPal = await page.evaluate(() => new URLSearchParams(location.hash.replace(/^#/, "")).has("pal"));
  if (!hashHasPal) throw new Error("Double-click did not preserve direct profile navigation");
}

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(150);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("UX v120 smoke tests passed: simplified filters, no quick preview, card detail/compare actions, double-click profile, current Japanese Lv70 skill text, work-star placement, and mobile layout.");
