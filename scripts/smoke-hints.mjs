import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
const room = `ci-hints-v109-${Date.now()}`;

page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
page.on("console", message => {
  const text = message.text();
  if (message.type() === "error" && !text.startsWith("Failed to load resource:")) errors.push(`console: ${text}`);
});
await page.addInitScript(roomId => {
  localStorage.setItem(`pal-breeding-current-user:${roomId}`, "福冨");
  localStorage.setItem("palBoardRecorder", "福冨");
}, room);
await page.goto(`${baseUrl}#room=${room}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForFunction(() => document.querySelector("#app")?.dataset.ready === "true", null, { timeout: 60000 });
await page.waitForFunction(() => document.querySelector("#bootScreen")?.classList.contains("is-hidden"), null, { timeout: 10000 });
await page.evaluate(() => document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()));

const audit = await page.evaluate(() => {
  const current = window.eval("state");
  const maxLength = Math.max(...current.pals.map(pal => romajiConsonantHint(pal.name).length));
  const slotCount = romajiHintSlotCount();
  const emptyNames = current.pals.filter(pal => romajiConsonantHint(pal.name).length === 0).map(pal => pal.name);
  const panel = document.createElement("div");
  panel.innerHTML = romajiHintPanel("ムラクモ", ["slot-0", `slot-${slotCount - 1}`], "forward");
  const buttons = Array.from(panel.querySelectorAll(".hint-position"));
  return {
    murakumo: romajiConsonantHint("ムラクモ").join(""),
    glaciale: romajiConsonantHint("グレイシャル").join(""),
    smallKana: romajiConsonantHint("ニャット").join(""),
    vowelOnly: romajiConsonantHint("アヌビス").join(""),
    longMark: romajiConsonantHint("モー").join(""),
    slotCount,
    maxLength,
    emptyNames,
    firstValue: buttons[0]?.querySelector("strong")?.textContent || "",
    lastValue: buttons.at(-1)?.querySelector("strong")?.textContent || "",
    lastMissing: buttons.at(-1)?.classList.contains("is-missing") || false,
  };
});

if (audit.murakumo !== "MRKM") throw new Error(`ムラクモの子音が不正です: ${JSON.stringify(audit)}`);
if (audit.glaciale !== "GRISYR") throw new Error(`グレイシャルの子音が不正です: ${JSON.stringify(audit)}`);
if (audit.smallKana !== "NYTT") throw new Error(`小さいゃ・っの処理が不正です: ${JSON.stringify(audit)}`);
if (audit.vowelOnly !== "ANBS") throw new Error(`母音だけの文字が保持されていません: ${JSON.stringify(audit)}`);
if (audit.longMark !== "Mー") throw new Error(`伸ばし棒が保持されていません: ${JSON.stringify(audit)}`);
if (audit.slotCount !== Math.max(7, audit.maxLength)) throw new Error(`全候補の枠数が最長名基準ではありません: ${JSON.stringify(audit)}`);
if (audit.emptyNames.length) throw new Error(`ローマ字ヒントを作れないパルがあります: ${audit.emptyNames.join(", ")}`);
if (audit.firstValue !== "M" || audit.lastValue !== "×" || !audit.lastMissing) throw new Error(`開示済み文字または赤い×の状態が不正です: ${JSON.stringify(audit)}`);

const seeded = await page.evaluate(() => {
  const current = window.eval("state");
  let selected = null;
  for (const combo of current.matrix.values()) {
    const a = getPal(combo.a), b = getPal(combo.b), child = getPal(combo.childId);
    if (a && b && child && a.id !== b.id) { selected = { a, b, child }; break; }
  }
  if (!selected) throw new Error("ヒント用の配合を取得できません");
  current.records = [];
  current.guideUnlocked = true;
  current.hintMode = "forward";
  current.pickerValues.hintParentA = selected.a.id;
  current.pickerValues.hintParentB = selected.b.id;
  resetHintProgress();
  switchView("hints");
  return { aId: selected.a.id, bId: selected.b.id };
});

const romajiButtons = page.locator('#hintBoard [data-forward-position^="romaji|"]');
if (await romajiButtons.count() !== audit.slotCount) throw new Error("画面上のローマ字子音枠数が統一されていません");
await romajiButtons.first().click();
if (await page.locator('#hintBoard [data-forward-position^="romaji|"].is-revealed').count() !== 1) throw new Error("ローマ字子音を位置単位で開示できません");

await page.click('[data-forward-plan]');
if (!(await page.locator('#recordDialog').evaluate(dialog => dialog.open))) throw new Error("試す予定の登録画面が開きません");
const planned = await page.evaluate(() => {
  const current = window.eval("state");
  return {
    parentA: current.pickerValues.recordParentA,
    parentB: current.pickerValues.recordParentB,
    result: current.pickerValues.recordResult,
  };
});
if (planned.parentA !== seeded.aId || planned.parentB !== seeded.bId || planned.result) throw new Error(`試す予定への引き継ぎが不正です: ${JSON.stringify(planned)}`);
await page.evaluate(() => document.querySelector('#recordDialog')?.close());

await page.evaluate(() => {
  const current = window.eval("state");
  const a = getPal(current.pickerValues.hintParentA), b = getPal(current.pickerValues.hintParentB);
  current.records = [normalizeRecord({
    id: "ci-v109-pending",
    parentA: a.name,
    parentB: b.name,
    resultPal: "",
    eggType: "",
    mutation: false,
    recorder: current.currentUser,
    note: "hint trial",
    favorites: {},
    updatedAt: Date.now(),
  }, "ci-v109-pending")];
  renderHints();
});
if (await page.locator('[data-forward-plan]').count()) throw new Error("登録済み親ペアに試す予定ボタンが重複表示されています");
if (await page.locator('[data-hint-edit-record]').count() < 1) throw new Error("確認中の既存記録を開く導線がありません");

if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
await context.close();
await browser.close();
console.log("Hint smoke tests passed: romaji consonants, dynamic slots, red ×, and discovery trial planning.");
