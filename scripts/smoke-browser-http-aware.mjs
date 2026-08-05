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
writeFileSync(runtimePath, source, "utf8");

try {
  await import(`./.smoke-browser-http-aware-runtime.mjs?run=${Date.now()}`);
} finally {
  try { unlinkSync(runtimePath); } catch {}
}
