import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });

async function inspectRuntime(page) {
  return page.evaluate(() => {
    const runtime = window.eval("state");
    return {
      ready: document.querySelector("#app")?.dataset.ready,
      dataBadge: document.querySelector("#dataBadge")?.textContent?.trim(),
      dataState: runtime.dataState,
      imageDataState: runtime.imageDataState,
      palCount: runtime.pals.length,
      uniqueIds: new Set(runtime.pals.map(pal => pal.id)).size,
      verifiedImages: runtime.iconVerifiedCount || 0,
      unnumberedIds: runtime.pals.filter(pal => pal.no === "—").map(pal => pal.id),
    };
  });
}

async function openApp(context, suffix) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  await page.goto(`${baseUrl}#room=ci-v103-${suffix}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.querySelector("#app")?.dataset.ready === "true", null, { timeout: 60000 });
  if (await page.locator("dialog[open]").count()) await page.keyboard.press("Escape");
  return { page, errors };
}

// Normal load: all core and image data should come from the repository itself.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const { page, errors } = await openApp(context, "normal");
  const runtime = await inspectRuntime(page);
  if (runtime.palCount !== 299) throw new Error(`Expected 299 Pals, got ${runtime.palCount}`);
  if (runtime.uniqueIds !== 299) throw new Error(`Expected 299 unique IDs, got ${runtime.uniqueIds}`);
  if (runtime.dataState === "error") throw new Error(`Core data failed: ${runtime.dataBadge}`);
  if (!["ready", "cache"].includes(runtime.imageDataState)) throw new Error(`Image data not ready: ${runtime.imageDataState}`);
  if (runtime.verifiedImages !== 299) throw new Error(`Expected 299 verified images, got ${runtime.verifiedImages}`);
  if (new Set(runtime.unnumberedIds).size !== 11) throw new Error(`Expected 11 unique unnumbered IDs, got ${runtime.unnumberedIds.length}`);

  await page.click('[data-view="paldex"]');
  await page.waitForSelector(".pal-card-button img");
  const imageAudit = await page.evaluate(() => {
    const images = [...document.querySelectorAll(".pal-card-button img")].slice(0, 30);
    return images.map(image => ({ src: image.getAttribute("src"), width: image.naturalWidth, alt: image.getAttribute("alt") }));
  });
  const broken = imageAudit.filter(image => image.width <= 0 || !image.src?.includes("assets/pals/"));
  if (broken.length) throw new Error(`Local Pal image audit failed: ${JSON.stringify(broken.slice(0, 5))}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  await context.close();
}

// Image manifest outage: core data, names, numbers and breeding must remain usable.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/data/pal-images-v1.json", route => route.abort());
  await context.route("**/palworld-icon-manifest.json", route => route.abort());
  const { page } = await openApp(context, "image-outage");
  const runtime = await inspectRuntime(page);
  if (runtime.palCount !== 299 || runtime.uniqueIds !== 299) throw new Error(`Image outage damaged core Pal data: ${JSON.stringify(runtime)}`);
  if (runtime.dataState === "error") throw new Error("Image outage was incorrectly treated as a core data failure");
  if (runtime.imageDataState !== "error") throw new Error(`Expected imageDataState=error, got ${runtime.imageDataState}`);
  await page.click('[data-view="paldex"]');
  await page.waitForSelector(".pal-card-button");
  const labels = await page.locator(".pal-card-button__no").allTextContents();
  if (!labels.some(label => /No\.\d/.test(label))) throw new Error("Pal numbers disappeared during image outage");
  await context.close();
}

// Mobile layout smoke test.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const { page, errors } = await openApp(context, "mobile");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) throw new Error(`Mobile horizontal overflow: ${overflow}px`);
  if (errors.length) throw new Error(`Mobile browser errors: ${errors.join(" | ")}`);
  await context.close();
}

await browser.close();
console.log("Browser smoke tests passed for normal load, image outage, and mobile layout.");
