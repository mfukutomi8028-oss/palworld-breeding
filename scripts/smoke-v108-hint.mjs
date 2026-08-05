import { chromium } from "playwright";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const room = `ci-v108-hint-${Date.now()}`;

await page.addInitScript(roomId => {
  localStorage.setItem(`pal-breeding-current-user:${roomId}`, "福冨");
  localStorage.setItem("palBoardRecorder", "福冨");
}, room);

await page.goto(`${baseUrl}#room=${room}`, {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await page.waitForFunction(
  () => document.querySelector("#app")?.dataset.ready === "true",
  null,
  { timeout: 60000 },
);
await page.waitForFunction(
  () => document.querySelector("#bootScreen")?.classList.contains("is-hidden"),
  null,
  { timeout: 10000 },
);

const audit = await page.evaluate(() => {
  const short = HINT_POSITION_DEFINITIONS.map(position => hintCharacterAt("ムラクモ", position.key));
  const long = HINT_POSITION_DEFINITIONS.map(position => hintCharacterAt("Fenglope", position.key));
  const host = document.createElement("div");
  host.innerHTML = positionHintPanel(
    "japanese",
    "ヒント4・日本語名",
    "ムラクモ",
    [],
    "forward",
  );
  const buttons = Array.from(host.querySelectorAll(".hint-position")).map(button => ({
    label: button.querySelector("span")?.textContent || "",
    value: button.querySelector("strong")?.textContent || "",
    disabled: button.disabled,
    unavailable: button.classList.contains("is-unavailable"),
  }));
  return { short, long, buttons };
});

const expectedShort = ["ム", "ラ", "ク", "モ", "×", "×", "×"];
const expectedLong = ["F", "e", "n", "g", "o", "p", "e"];

if (JSON.stringify(audit.short) !== JSON.stringify(expectedShort)) {
  throw new Error(`Short Japanese hint is incorrect: ${JSON.stringify(audit)}`);
}
if (JSON.stringify(audit.long) !== JSON.stringify(expectedLong)) {
  throw new Error(`Long English positional hint regressed: ${JSON.stringify(audit)}`);
}
if (audit.buttons.map(button => button.label).join("|") !== "1文字目|2文字目|3文字目|4文字目|5文字目|6文字目|7文字目") {
  throw new Error(`Short-name labels are incorrect: ${JSON.stringify(audit.buttons)}`);
}
if (!audit.buttons.slice(0, 4).every(button => button.value === "?" && !button.disabled && !button.unavailable)) {
  throw new Error(`Available short-name cards are incorrect: ${JSON.stringify(audit.buttons)}`);
}
if (!audit.buttons.slice(4).every(button => button.value === "×" && button.disabled && button.unavailable)) {
  throw new Error(`Unused short-name cards are incorrect: ${JSON.stringify(audit.buttons)}`);
}

await context.close();
await browser.close();
console.log("v108 hint smoke test passed: ムラクモ / × padding / long-name positional hints.");
