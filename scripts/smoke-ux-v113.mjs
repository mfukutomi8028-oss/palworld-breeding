import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
const page = await context.newPage();
const errors = [];
const room = `ci-ux-v113-${Date.now()}`;

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
await page.waitForFunction(() => document.querySelector("#palDetail .partner-skill-card-v113")?.textContent.includes("羊毛"), null, { timeout: 60000 });

if (!(await page.locator('#palDetail .pal-detail-hero [data-pal-profile-open]').isVisible())) throw new Error("Prominent detail-page action is missing from the Pal hero");
if (!(await page.locator('#palDetail .pal-detail-hero [data-compare-pal]').isVisible())) throw new Error("Prominent comparison action is missing from the Pal hero");
const lowActionVisible = await page.locator("#palDetail .pal-extra-heading__actions").evaluateAll(nodes => nodes.some(node => getComputedStyle(node).display !== "none"));
if (lowActionVisible) throw new Error("Legacy low-position Pal actions are still visible");

const partnerText = await page.locator("#palDetail .partner-skill-card-v113").innerText();
for (const expected of ["モコモコの盾", "牧場ドロップ", "盾", "羊毛"]) {
  if (!partnerText.includes(expected)) throw new Error(`Detailed partner skill is missing ${expected}`);
}
const partnerIcon = await page.locator("#palDetail .partner-skill-icon-image-v113").getAttribute("src");
if (!partnerIcon?.includes("T_icon_skill_pal_005.webp")) throw new Error(`Unexpected partner icon: ${partnerIcon}`);

if (!(await page.locator("#palDetail .element-icon-v113").count())) throw new Error("Element icon was not rendered");
if (!(await page.locator("#palDetail .work-icon-v113").count())) throw new Error("Work-suitability icon was not rendered");
const elementSrc = await page.locator("#palDetail .element-icon-v113").first().getAttribute("src");
if (!elementSrc?.includes("T_Icon_element_s_00.webp")) throw new Error(`Unexpected Neutral icon: ${elementSrc}`);
const workSrc = await page.locator("#palDetail .work-icon-v113").first().getAttribute("src");
if (!workSrc?.includes("T_icon_palwork_")) throw new Error(`Unexpected work icon: ${workSrc}`);

const drops = page.locator("#palDetail .pal-extra-v111 details", { hasText: "主なドロップ" });
await drops.evaluate(node => { node.open = true; });
await page.waitForFunction(() => document.querySelector("#palDetail .pal-drop-row-v113")?.textContent.includes("羊毛"));
const woolRow = page.locator("#palDetail .pal-drop-row-v113", { hasText: "羊毛" }).first();
const woolText = await woolRow.innerText();
if (!woolText.includes("1–3") || !woolText.includes("100%")) throw new Error(`Wool quantity/rate missing: ${woolText}`);
const woolIcon = await woolRow.locator(".pal-drop-icon-image-v113").getAttribute("src");
if (!woolIcon?.includes("T_itemicon_Material_Wool.webp")) throw new Error(`Unexpected Wool icon: ${woolIcon}`);

const workIconsOnCards = await page.locator("#paldexGrid .pal-card-work-icons-v113 .work-icon-v113").count();
if (workIconsOnCards < 1) throw new Error("Paldex cards do not show work-suitability icons");

const cattiva = page.locator('#paldexGrid [data-pal-detail="002"]');
await cattiva.dblclick();
await page.waitForFunction(() => document.querySelector("#view-paldex")?.classList.contains("is-pal-profile-open"), null, { timeout: 10000 });
const route = await page.evaluate(() => ({ hash: location.hash, selected: window.eval("state").selectedPalId }));
const params = new URLSearchParams(route.hash.replace(/^#/, ""));
if (params.get("pal") !== "002" || route.selected !== "002") throw new Error(`Paldex double-click route failed: ${JSON.stringify(route)}`);
if (!(await page.locator('#palDetail .pal-primary-actions-v113 [data-compare-pal]').isVisible())) throw new Error("Full profile lacks prominent compare action");
if (!(await page.locator('#palDetail .pal-primary-actions-v113 [data-pal-breeding-target]').isVisible())) throw new Error("Full profile lacks breeding shortcut");

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(150);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile horizontal overflow detected: ${overflow}px`);

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("UX v113 smoke tests passed: prominent actions, detailed partner skills, icons, drop data, double-click profiles, and mobile layout.");
