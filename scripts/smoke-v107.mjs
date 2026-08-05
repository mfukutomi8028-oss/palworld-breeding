import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });

async function openApp(context, suffix) {
  const page = await context.newPage();
  const errors = [];
  const room = `ci-v107-${suffix}-${Date.now()}`;
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

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const { page, errors } = await openApp(context, "desktop");

  const runtime = await page.evaluate(() => {
    const current = window.eval("state");
    return { palCount: current.pals.length, guideUnlocked: current.guideUnlocked };
  });
  if (runtime.palCount !== 299) throw new Error(`Expected 299 Pals, got ${runtime.palCount}`);
  if (runtime.guideUnlocked) throw new Error("Guide mode must be locked by default");

  // With no discoveries, names stay visible but every record-picker image is hidden.
  await page.click("#addRecord");
  await page.click('#recordDialog [data-open-picker="recordParentA"]');
  await page.waitForSelector("#palPickerDialog[open] [data-picker-pal]");
  const initialPicker = await page.locator("#palPickerGrid [data-picker-pal]").evaluateAll(buttons => ({
    total: buttons.length,
    hidden: buttons.filter(button => button.querySelector("img")?.getAttribute("src")?.includes("unknown-pal-v8.svg")).length,
    namesPresent: buttons.every(button => Boolean(button.querySelector("strong")?.textContent?.trim())),
  }));
  if (initialPicker.total !== 299 || initialPicker.hidden !== 299 || !initialPicker.namesPresent) {
    throw new Error(`Initial discovery picker leaked images: ${JSON.stringify(initialPicker)}`);
  }
  await page.evaluate(() => { document.querySelector("#palPickerDialog")?.close(); document.querySelector("#recordDialog")?.close(); });

  // Unset egg display is text only.
  const unsetEgg = await page.evaluate(() => {
    const host = document.createElement("div");
    host.innerHTML = eggChip({ mutation: false, eggType: "" });
    return { text: host.textContent.trim(), images: host.querySelectorAll("img").length };
  });
  if (unsetEgg.text !== "未設定" || unsetEgg.images !== 0) {
    throw new Error(`Unset egg still uses an image: ${JSON.stringify(unsetEgg)}`);
  }

  // Seed three discovered Pals without writing Firebase.
  const seeded = await page.evaluate(() => {
    const current = window.eval("state");
    const [a, b, c] = current.pals.slice(0, 3);
    current.records = [normalizeRecord({
      id: "ci-v107-discovered",
      parentA: a.name,
      parentB: b.name,
      resultPal: c.name,
      eggType: "",
      mutation: false,
      recorder: current.currentUser,
      note: "v107 test",
      favorites: {},
      updatedAt: Date.now(),
    }, "ci-v107-discovered")];
    renderAll();
    return { ids: [a.id, b.id, c.id] };
  });

  await page.click("#addRecord");
  await page.click('#recordDialog [data-open-picker="recordParentA"]');
  await page.waitForSelector("#palPickerDialog[open] [data-picker-pal]");
  const discoveryPicker = await page.locator("#palPickerGrid [data-picker-pal]").evaluateAll((buttons, knownIds) => {
    const rows = buttons.map(button => ({
      id: button.dataset.pickerPal,
      src: button.querySelector("img")?.getAttribute("src") || "",
      name: button.querySelector("strong")?.textContent?.trim() || "",
    }));
    return {
      total: rows.length,
      knownReal: rows.filter(row => knownIds.includes(row.id)).every(row => row.src.includes("assets/pals/")),
      unknownHidden: rows.filter(row => !knownIds.includes(row.id)).every(row => row.src.includes("unknown-pal-v8.svg")),
      namesPresent: rows.every(row => Boolean(row.name)),
    };
  }, seeded.ids);
  if (discoveryPicker.total !== 299 || !discoveryPicker.knownReal || !discoveryPicker.unknownHidden || !discoveryPicker.namesPresent) {
    throw new Error(`Discovery picker visibility is incorrect: ${JSON.stringify(discoveryPicker)}`);
  }

  const undiscovered = page.locator("#palPickerGrid .picker-pal.is-undiscovered").first();
  await undiscovered.click();
  const selectedSrc = await page.locator('#recordDialog [data-picker-shell="recordParentA"] img').getAttribute("src");
  if (!selectedSrc?.includes("unknown-pal-v8.svg")) throw new Error("Selected undiscovered Pal exposed its image before saving");
  await page.evaluate(() => document.querySelector("#recordDialog")?.close());

  // Discovery Paldex renders its whole available set without paging.
  await page.click('[data-view="paldex"]');
  if (await page.locator("#paldexGrid [data-pal-detail]").count() !== 3) throw new Error("Discovery Paldex did not render all discovered Pals");
  if (!(await page.locator("#paldexLoadMore").isHidden())) throw new Error("Load-more button is visible in discovery Paldex");

  // Hidden guide mode renders all 299 cards at once.
  await page.click('[data-view="settings"]');
  await page.click("#guideModeToggle");
  await page.click('[data-view="paldex"]');
  if (await page.locator("#paldexGrid [data-pal-detail]").count() !== 299) throw new Error("Unlocked Paldex did not render all 299 Pals at once");
  if (!(await page.locator("#paldexLoadMore").isHidden())) throw new Error("Obsolete load-more button is visible after unlock");

  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const { page, errors } = await openApp(context, "mobile");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) throw new Error(`Mobile horizontal overflow: ${overflow}px`);
  if (errors.length) throw new Error(`Mobile browser errors: ${errors.join(" | ")}`);
  await context.close();
}

await browser.close();
console.log("v107 smoke tests passed: hidden undiscovered images, text-only unset eggs, and full Paldex rendering.");
