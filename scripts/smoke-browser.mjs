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
  const room = `ci-v106-${suffix}-${Date.now()}`;
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

  // Forward hint page uses fixed position choices instead of revealing name length.
  await page.evaluate(({aId,cId}) => {
    const runtimeState=window.eval("state");
    runtimeState.hintMode="forward";
    runtimeState.pickerValues.hintParentA=aId;
    runtimeState.pickerValues.hintParentB=cId;
    resetHintProgress();
    switchView("hints");
  }, seeded);
  if (await page.locator('[data-hint-mode="forward"].is-active').count() !== 1) throw new Error("Forward hint tab is not active");
  if (await page.locator('#hintBoard [data-forward-position^="english|"]').count() !== 7) throw new Error("English hint does not have seven fixed positions");
  if (await page.locator('#hintBoard [data-forward-position^="japanese|"]').count() !== 7) throw new Error("Japanese hint does not have seven fixed positions");
  if (await page.locator("#hintBoard .hint-answer").count()) throw new Error("Hint answer is visible before being requested");
  await page.click('[data-hint-action="elements"]');
  await page.click('[data-hint-action="number"]');
  await page.click('[data-forward-position="english|last"]');
  await page.click('[data-forward-position="japanese|middle"]');
  await page.click('[data-hint-action="silhouette"]');
  if (await page.locator("#hintBoard .hint-result-image--silhouette").count() !== 1) throw new Error("Silhouette hint did not render");
  if (await page.locator("#hintBoard .hint-position.is-revealed").count() !== 2) throw new Error("Selected character positions were not revealed independently");
  await page.click('[data-hint-action="answer"]');
  if (await page.locator("#hintBoard .hint-answer").count() !== 1) throw new Error("Explicit answer reveal did not work");

  // Find a target + known parent combination with multiple possible other parents.
  const reverseSeed = await page.evaluate(() => {
    const runtimeState=window.eval("state");
    let selected=null;
    for(const [targetId,combos] of runtimeState.reverseMatrix.entries()){
      const candidatesByKnown=new Map();
      for(const combo of combos){
        for(const [knownId,candidateId] of [[combo.a,combo.b],[combo.b,combo.a]]){
          if(!candidatesByKnown.has(knownId))candidatesByKnown.set(knownId,new Set());
          candidatesByKnown.get(knownId).add(candidateId);
        }
      }
      for(const [knownId,candidates] of candidatesByKnown.entries()){
        if(candidates.size>=2){selected={targetId,knownId,candidateIds:Array.from(candidates)};break;}
      }
      if(selected)break;
    }
    if(!selected)throw new Error("No reverse hint combination with multiple candidates was found");
    const target=getPal(selected.targetId),known=getPal(selected.knownId),marker=runtimeState.pals.find(pal=>pal.id!==target.id&&pal.id!==known.id);
    runtimeState.records.push(normalizeRecord({
      id:"ci-reverse-discovery-marker",
      parentA:known.name,
      parentB:marker.name,
      resultPal:target.name,
      eggType:"",
      mutation:false,
      recorder:runtimeState.currentUser,
      note:"reverse hint discovery marker",
      favorites:{},
      updatedAt:Date.now()-1,
    },"ci-reverse-discovery-marker"));
    runtimeState.hintMode="reverse";
    runtimeState.pickerValues.hintReverseTarget=target.id;
    runtimeState.pickerValues.hintReverseParentA=known.id;
    resetHintProgress();
    switchView("hints");
    return {targetId:target.id,knownId:known.id};
  });
  if (!reverseSeed.targetId || !reverseSeed.knownId) throw new Error("Reverse hint seed is invalid");
  if (await page.locator('[data-hint-mode="reverse"].is-active').count() !== 1) throw new Error("Reverse hint tab is not active");
  const reverseCards=page.locator("#hintBoard .reverse-hint-card:not(.reverse-hint-card--discovered)");
  if (await reverseCards.count() < 2) throw new Error("Reverse hints did not render multiple independent candidates");
  const firstReverse=reverseCards.nth(0),secondReverse=reverseCards.nth(1);
  if (await firstReverse.locator('[data-reverse-position*="|english|"]').count() !== 7) throw new Error("Reverse English hint does not keep a fixed seven-position layout");
  if (await firstReverse.locator('[data-reverse-position*="|japanese|"]').count() !== 7) throw new Error("Reverse Japanese hint does not keep a fixed seven-position layout");
  await firstReverse.locator('[data-reverse-position$="|english|first"]').click();
  await firstReverse.locator('[data-reverse-position$="|japanese|last"]').click();
  if (await firstReverse.locator(".hint-position.is-revealed").count() !== 2) throw new Error("First reverse candidate did not retain its selected positions");
  if (await secondReverse.locator(".hint-position.is-revealed").count() !== 0) throw new Error("Revealing one reverse candidate affected another candidate");
  await firstReverse.locator('[data-reverse-action$="|answer"]').click();
  if (await page.locator("#hintBoard .reverse-hint-card .hint-answer").count() !== 1) throw new Error("Reverse candidate answer reveal did not stay candidate-specific");

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

// Mobile layout includes both hint tabs without horizontal overflow.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const { page, errors } = await openApp(context, "mobile");
  await page.evaluate(() => switchView("hints"));
  if (await page.locator("[data-hint-mode]").count() !== 2) throw new Error("Mobile hint mode tabs are missing");
  await page.click('[data-hint-mode="reverse"]');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) throw new Error(`Mobile horizontal overflow: ${overflow}px`);
  if (errors.length) throw new Error(`Mobile browser errors: ${errors.join(" | ")}`);
  await context.close();
}

await browser.close();
console.log("Browser smoke tests passed for forward and reverse hints, fixed position reveals, discovery locking, guide mode, favorite spacing, image outage, and mobile layout.");
