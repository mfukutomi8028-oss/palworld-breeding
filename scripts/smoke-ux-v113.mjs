import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const page = await context.newPage();
const errors = [];
const room = `ci-ux-v114-${Date.now()}`;

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
  switchView("paldex");
  renderPaldex();
});
await page.waitForSelector("#paldexGrid .paldex-card-shell-v120");

const openProfileByName = async name => {
  const card = page.locator("#paldexGrid [data-pal-detail]", { hasText: name }).first();
  await card.waitFor();
  const shell = card.locator("xpath=ancestor::article[contains(@class,'paldex-card-shell-v120')]");
  await shell.locator("[data-pal-profile-open]").click();
  await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 10000 });
};

const closeProfile = async () => {
  await page.locator("#palDetail [data-pal-profile-close]").click();
  await page.waitForFunction(() => !document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 10000 });
  await page.waitForSelector("#paldexGrid .paldex-card-shell-v120");
};

await openProfileByName("モコロン");
await page.waitForFunction(() => document.querySelector("#palDetail .partner-skill-card-v113")?.textContent.includes("羊毛"), null, { timeout: 60000 });

if (!(await page.locator('#palDetail .pal-primary-actions-v113 [data-compare-pal]').isVisible())) throw new Error("Prominent comparison action is missing from the Pal profile");
if (!(await page.locator('#palDetail .pal-primary-actions-v113 [data-pal-breeding-target]').isVisible())) throw new Error("Prominent breeding action is missing from the Pal profile");
const lowActionVisible = await page.locator("#palDetail .pal-extra-heading__actions").evaluateAll(nodes => nodes.some(node => getComputedStyle(node).display !== "none"));
if (lowActionVisible) throw new Error("Legacy low-position Pal actions are still visible");

const partnerText = await page.locator("#palDetail .partner-skill-card-v113").innerText();
for (const expected of ["モコモコの盾", "牧場ドロップ", "盾", "羊毛"]) {
  if (!partnerText.includes(expected)) throw new Error(`Detailed partner skill is missing ${expected}`);
}
const partnerIconLocator = page.locator("#palDetail .partner-skill-icon-image-v113");
const partnerIcon = await partnerIconLocator.getAttribute("src");
if (!partnerIcon?.includes("T_icon_skill_pal_")) throw new Error(`Unexpected partner icon: ${partnerIcon}`);
const partnerPresentation = await partnerIconLocator.evaluate(element => ({
  opacity: Number.parseFloat(getComputedStyle(element).opacity),
  draggable: element.draggable,
  userSelect: getComputedStyle(element).userSelect,
}));
if (!(partnerPresentation.opacity > 0.4 && partnerPresentation.opacity < 0.9)) throw new Error(`Partner mask opacity regression: ${JSON.stringify(partnerPresentation)}`);
if (partnerPresentation.draggable) throw new Error("Partner skill icon must not be draggable");

if (!(await page.locator("#palDetail .element-icon-v113").count())) throw new Error("Element icon was not rendered");
if (!(await page.locator("#palDetail .work-icon-v113").count())) throw new Error("Work-suitability icon was not rendered");
const elementSrc = await page.locator("#palDetail .element-icon-v113").first().getAttribute("src");
if (!elementSrc?.includes("T_Icon_element_s_00.webp")) throw new Error(`Unexpected Neutral icon: ${elementSrc}`);
const workSrc = await page.locator("#palDetail .work-icon-v113").first().getAttribute("src");
if (!workSrc?.includes("T_icon_palwork_")) throw new Error(`Unexpected work icon: ${workSrc}`);
const profileElementBoxInitial = await page.locator("#palDetail .element-icon-v113").first().boundingBox();
if (!profileElementBoxInitial || profileElementBoxInitial.width > 24 || profileElementBoxInitial.height > 24) throw new Error(`Profile element icon is oversized: ${JSON.stringify(profileElementBoxInitial)}`);

const drops = page.locator("#palDetail .pal-extra-v111 details", { hasText: "主なドロップ" });
await drops.evaluate(node => { node.open = true; });
await page.waitForFunction(() => document.querySelector("#palDetail .pal-drop-row-v113")?.textContent.includes("羊毛"));
const woolRow = page.locator("#palDetail .pal-drop-row-v113", { hasText: "羊毛" }).first();
const woolText = await woolRow.innerText();
if (!woolText.includes("1–3") || !woolText.includes("100%")) throw new Error(`Wool quantity/rate missing: ${woolText}`);
const woolIcon = await woolRow.locator(".pal-drop-icon-image-v113").getAttribute("src");
if (!woolIcon?.includes("T_itemicon_Material_Wool.webp")) throw new Error(`Unexpected Wool icon: ${woolIcon}`);

await closeProfile();
await openProfileByName("リリクイン");
await page.waitForFunction(() => document.querySelectorAll("#palDetail .pal-drop-row-v113").length >= 20, null, { timeout: 10000 });
const lyleenRows = await page.locator("#palDetail .pal-drop-row-v113").evaluateAll(rows => rows.map(row => ({
  item: row.querySelector(".pal-drop-name-v113")?.textContent?.trim() || "",
  condition: row.querySelector(".pal-drop-condition-v114")?.textContent?.trim() || "",
  quantity: row.querySelector(".pal-drop-qty-v113 strong")?.textContent?.trim() || "",
  probability: row.querySelector(".pal-drop-prob-v113 strong")?.textContent?.trim() || "",
  conditionIcon: row.querySelector(".pal-drop-condition-icon-v114")?.getAttribute("src") || "",
})));
const findRow = (item, condition = "") => lyleenRows.find(row => row.item === item && row.condition.includes(condition));
const normalPotion = lyleenRows.find(row => row.item === "高品質な回復薬" && !row.condition);
if (!normalPotion || normalPotion.quantity !== "1–3" || normalPotion.probability !== "100%") throw new Error(`Lyleen normal drop mismatch: ${JSON.stringify(normalPotion)}`);
const relic70 = findRow("古代文明の朽ちた遺物", "Lv.70");
if (!relic70 || relic70.quantity !== "1–10" || relic70.probability !== "10%") throw new Error(`Lyleen Lv.70 relic mismatch: ${JSON.stringify(relic70)}`);
const grass80 = findRow("草の輝石", "Lv.80");
if (!grass80 || grass80.quantity !== "10–20" || grass80.probability !== "100%") throw new Error(`Lyleen Lv.80 drop mismatch: ${JSON.stringify(grass80)}`);
if (!grass80.conditionIcon.includes("/conditions/")) throw new Error(`Lyleen Lv.80 boss condition icon missing: ${JSON.stringify(grass80)}`);
if (lyleenRows.some(row => /\s\d+(?:[–-]\d+)?$/.test(row.item))) throw new Error(`Quantity leaked into Lyleen item label: ${JSON.stringify(lyleenRows.filter(row => /\s\d+(?:[–-]\d+)?$/.test(row.item)).slice(0, 3))}`);

await closeProfile();
const workIconsOnCards = await page.locator("#paldexGrid .pal-card-work-icons-v113 .work-icon-v113").count();
if (workIconsOnCards < 1) throw new Error("Paldex cards do not show work-suitability icons");

const cattiva = page.locator('#paldexGrid [data-pal-detail="002"]');
await cattiva.dblclick({ delay: 60 });
await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 10000 });
const route = await page.evaluate(() => ({ hash: location.hash, selected: window.eval("state").selectedPalId }));
const params = new URLSearchParams(route.hash.replace(/^#/, ""));
if (params.get("pal") !== "002" || route.selected !== "002") throw new Error(`Paldex double-click route failed: ${JSON.stringify(route)}`);
if (!(await page.locator('#palDetail .pal-primary-actions-v113 [data-compare-pal]').isVisible())) throw new Error("Full profile lacks prominent compare action");
if (!(await page.locator('#palDetail .pal-primary-actions-v113 [data-pal-breeding-target]').isVisible())) throw new Error("Full profile lacks breeding shortcut");
const profileElementBox = await page.locator("#palDetail .element-icon-v113").first().boundingBox();
if (!profileElementBox || profileElementBox.width > 24 || profileElementBox.height > 24) throw new Error(`Profile element icon is oversized: ${JSON.stringify(profileElementBox)}`);

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(150);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("UX v114 smoke tests passed: full-profile partner icons, structured drops, card work icons, double-click routing, and mobile layout.");
