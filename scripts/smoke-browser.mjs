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
      guideUnlocked: runtime.guideUnlocked,
    };
  });
}

async function openApp(context, suffix) {
  const page = await context.newPage();
  const errors = [];
  const room = `ci-v105-${suffix}-${Date.now()}`;
  await page.addInitScript(roomId => {
    localStorage.setItem(`pal-breeding-current-user:${roomId}`, "福冨");
    localStorage.setItem("palBoardRecorder", "福冨");
  }, room);
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  await page.goto(`${baseUrl}#room=${room}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.querySelector("#app")?.dataset.ready === "true", null, { timeout: 60000 });
  await page.waitForFunction(() => document.querySelector("#bootScreen")?.classList.contains("is-hidden"), null, { timeout: 10000 });
  await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));
  return { page, errors };
}

async function auditLazyPalImages(page, requestedCount = 30) {
  const locator = page.locator(".pal-card-button img");
  const total = Math.min(requestedCount, await locator.count());
  const results = [];
  for (let index = 0; index < total; index += 1) {
    const image = locator.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(async element => {
      if (element.complete && element.naturalWidth > 0) return;
      await new Promise(resolve => {
        const finish = () => { clearTimeout(timer); resolve(); };
        const timer = setTimeout(finish, 15000);
        element.addEventListener("load", finish, { once: true });
        element.addEventListener("error", finish, { once: true });
      });
    });
    results.push(await image.evaluate(element => ({
      currentSrc: element.currentSrc,
      width: element.naturalWidth,
      alt: element.getAttribute("alt"),
    })));
  }
  return results;
}

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
  if (runtime.guideUnlocked) throw new Error("Guide mode must be locked by default");

  // Record entry remains unrestricted so newly discovered Pals can always be registered.
  await page.click("#addRecord");
  await page.click('#recordDialog [data-open-picker="recordParentA"]');
  await page.waitForSelector("#palPickerDialog[open] [data-picker-pal]");
  const pickerButtons = page.locator("#palPickerGrid [data-picker-pal]");
  if (await pickerButtons.count() !== runtime.palCount) throw new Error("Record parent picker does not expose all Pals");
  await page.evaluate(() => { document.querySelector("#palPickerDialog")?.close(); document.querySelector("#recordDialog")?.close(); });

  const seeded = await page.evaluate(() => {
    const runtimeState = window.eval("state");
    const [a,b,c] = runtimeState.pals.slice(0,3);
    runtimeState.records = [normalizeRecord({
      id:"ci-discovered-record",
      parentA:a.name,
      parentB:b.name,
      resultPal:c.name,
      eggType:"平凡なタマゴ",
      mutation:false,
      recorder:runtimeState.currentUser,
      note:"discovery test",
      favorites:{[runtimeState.currentUser]:true},
      updatedAt:Date.now(),
    },"ci-discovered-record")];
    renderAll();
    const unknownCombo = runtimeState.matrix.get(pairKey(a.id,c.id));
    return {aId:a.id,bId:b.id,cId:c.id,unknownChild:getPal(unknownCombo?.childId)?.name || ""};
  });

  // Discovery mode Paldex shows only Pals that occur in room records.
  await page.click('[data-view="paldex"]');
  if (await page.locator("#paldexGrid [data-pal-detail]").count() !== 3) throw new Error("Discovery Paldex did not limit itself to three recorded Pals");
  if (!(await page.locator("#paldexCount").textContent()).includes("発見 3 / 299体")) throw new Error("Discovery count is incorrect");

  // Undiscovered breeding result must not leak into the result panel.
  await page.evaluate(({aId,cId}) => {
    const runtimeState=window.eval("state");
    runtimeState.pickerValues.breedParentA=aId;
    runtimeState.pickerValues.breedParentB=cId;
    switchView("breeding");
  }, seeded);
  const lockedResultText = await page.locator("#pairChildResult").textContent();
  if (!lockedResultText.includes("未発見")) throw new Error("Undiscovered breeding result is not hidden");
  if (seeded.unknownChild && lockedResultText.includes(seeded.unknownChild)) throw new Error("Undiscovered child name leaked in discovery mode");

  // Hint page reveals clues progressively and does not show the answer initially.
  await page.evaluate(({aId,cId}) => {
    const runtimeState=window.eval("state");
    runtimeState.pickerValues.hintParentA=aId;
    runtimeState.pickerValues.hintParentB=cId;
    resetHintProgress();
    switchView("hints");
  }, seeded);
  if (await page.locator("#hintBoard .hint-step").count() < 5) throw new Error("Progressive hint steps are missing");
  if (await page.locator("#hintBoard .hint-answer").count()) throw new Error("Hint answer is visible before being requested");
  await page.click('[data-hint-action="elements"]');
  await page.click('[data-hint-action="number"]');
  await page.click('[data-hint-action="number"]');
  await page.click('[data-hint-action="english"]');
  await page.click('[data-hint-action="japanese"]');
  await page.click('[data-hint-action="silhouette"]');
  if (await page.locator("#hintBoard .hint-result-image--silhouette").count() !== 1) throw new Error("Silhouette hint did not render");
  await page.click('[data-hint-action="answer"]');
  if (await page.locator("#hintBoard .hint-answer").count() !== 1) throw new Error("Explicit answer reveal did not work");

  // Favorite panel needs deliberate outer and row spacing.
  await page.click('[data-view="favorites"]');
  const favoriteSpacing = await page.evaluate(() => ({
    panel: parseFloat(getComputedStyle(document.querySelector("#view-favorites>.panel")).paddingRight),
    row: parseFloat(getComputedStyle(document.querySelector("#favoriteList .record-row")).paddingRight),
  }));
  if (favoriteSpacing.panel < 20 || favoriteSpacing.row < 20) throw new Error(`Favorite spacing is too small: ${JSON.stringify(favoriteSpacing)}`);

  // The unobtrusive settings control unlocks the complete strategy dataset locally.
  await page.click('[data-view="settings"]');
  await page.click("#guideModeToggle");
  if (!(await page.evaluate(() => window.eval("state").guideUnlocked))) throw new Error("Hidden guide toggle did not unlock all Pals");
  await page.click('[data-view="paldex"]');
  if (!(await page.locator("#paldexCount").textContent()).includes("299体")) throw new Error("Unlocked Paldex does not report all 299 Pals");
  await page.waitForSelector(".pal-card-button img");
  const imageAudit = await auditLazyPalImages(page, 30);
  const broken = imageAudit.filter(image => image.width <= 0 || !image.currentSrc.includes("/assets/pals/"));
  if (broken.length) throw new Error(`Local Pal image audit failed: ${JSON.stringify(broken.slice(0,5))}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  await context.close();
}

// Image manifest outage must not damage names, numbers or full guide mode.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route("**/data/pal-images-v1.json", route => route.abort());
  await context.route("**/palworld-icon-manifest.json", route => route.abort());
  const { page } = await openApp(context, "image-outage");
  const runtime = await inspectRuntime(page);
  if (runtime.palCount !== 299 || runtime.uniqueIds !== 299) throw new Error(`Image outage damaged core data: ${JSON.stringify(runtime)}`);
  if (runtime.dataState === "error") throw new Error("Image outage was treated as core data failure");
  if (runtime.imageDataState !== "error") throw new Error(`Expected imageDataState=error, got ${runtime.imageDataState}`);
  await page.evaluate(() => { window.eval("state").guideUnlocked=true; renderAll(); });
  await page.click('[data-view="paldex"]');
  const labels = await page.locator(".pal-card-button__no").allTextContents();
  if (!labels.some(label => /No\.\d/.test(label))) throw new Error("Pal numbers disappeared during image outage");
  await context.close();
}

// Mobile layout includes the new hint page without horizontal overflow.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const { page, errors } = await openApp(context, "mobile");
  await page.evaluate(() => switchView("hints"));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) throw new Error(`Mobile horizontal overflow: ${overflow}px`);
  if (errors.length) throw new Error(`Mobile browser errors: ${errors.join(" | ")}`);
  await context.close();
}

await browser.close();
console.log("Browser smoke tests passed for discovery locking, progressive hints, hidden guide mode, favorite spacing, image outage, and mobile layout.");
