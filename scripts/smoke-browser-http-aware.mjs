import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const directory = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(directory, "smoke-browser.mjs");
const runtimePath = join(directory, ".smoke-browser-http-aware-runtime.mjs");
let source = readFileSync(sourcePath, "utf8");

const original = `  page.on("pageerror", error => errors.push(\`pageerror: \${error.message}\`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(\`console: \${message.text()}\`);
  });`;
const replacement = `  page.on("pageerror", error => errors.push(\`pageerror: \${error.message}\`));
  page.on("response", response => {
    if (response.status() >= 400) errors.push(\`http \${response.status()}: \${response.url()}\`);
  });
  page.on("console", message => {
    const text = message.text();
    if (message.type() === "error" && !text.startsWith("Failed to load resource:")) errors.push(\`console: \${text}\`);
  });`;

if (!source.includes(original)) {
  throw new Error("Could not install HTTP-aware browser diagnostics.");
}
source = source.replace(original, replacement);

const updates = [
  [
    `  if (await page.locator('#hintBoard [data-forward-position^="english|"]').count() !== 7) throw new Error("English hint does not have seven fixed positions");`,
    `  const forwardRomajiSlots = await page.evaluate(() => romajiHintSlotCount());\n  if (await page.locator('#hintBoard [data-forward-position^="romaji|"]').count() !== forwardRomajiSlots) throw new Error("Romaji consonant hint does not use the global longest-name slot count");`,
  ],
  [
    `  await page.click('[data-forward-position="english|last"]');`,
    `  await page.click('[data-forward-position="romaji|slot-0"]');`,
  ],
  [
    `  await page.click('[data-forward-position="japanese|middle"]');`,
    `  await page.locator('[data-forward-position^="japanese|"]:not(:disabled)').first().click();`,
  ],
  [
    `  if (await firstReverse.locator('[data-reverse-position*="|english|"]').count() !== 7) throw new Error("Reverse English hint does not keep a fixed seven-position layout");`,
    `  const reverseRomajiSlots = await page.evaluate(() => romajiHintSlotCount());\n  if (await firstReverse.locator('[data-reverse-position*="|romaji|"]').count() !== reverseRomajiSlots) throw new Error("Reverse Romaji hint does not use the global longest-name slot count");`,
  ],
  [
    `  await firstReverse.locator('[data-reverse-position$="|english|first"]').click();`,
    `  await firstReverse.locator('[data-reverse-position*="|romaji|"]:not(:disabled)').first().click();`,
  ],
  [
    `  await firstReverse.locator('[data-reverse-position$="|japanese|last"]').click();`,
    `  await firstReverse.locator('[data-reverse-position*="|japanese|"]:not(:disabled)').first().click();`,
  ],
];

for (const [before, after] of updates) {
  if (!source.includes(before)) throw new Error(`Could not update legacy hint regression step: ${before}`);
  source = source.replace(before, after);
}

source = source.replace(
  "Forward hint page uses fixed position choices instead of revealing name length.",
  "Forward hint page uses a global fixed slot count instead of revealing each name length.",
);
writeFileSync(runtimePath, source, "utf8");

try {
  await import(`./.smoke-browser-http-aware-runtime.mjs?run=${Date.now()}`);
} finally {
  try { unlinkSync(runtimePath); } catch {}
}
