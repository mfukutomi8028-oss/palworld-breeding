import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const config = read("config.js");
const index = read("index.html");
const readme = read("README.md");
const changelog = read("CHANGELOG.md");

const match = config.match(/window\.palSiteVersion\s*=\s*["'](\d+)["']/);
if (!match) throw new Error("config.js does not define window.palSiteVersion");
const version = match[1];

if (!readme.includes(`# パル配合ノート v${version}`)) throw new Error(`README current version does not match v${version}`);
if (!readme.includes("[CHANGELOG.md](CHANGELOG.md)")) throw new Error("README does not link to CHANGELOG.md");
if (/##\s+v\d+\s+修正内容/u.test(readme)) throw new Error("README still contains legacy per-version update sections");

const latest = changelog.match(/^##\s+v(\d+)\b/m)?.[1];
if (latest !== version) throw new Error(`CHANGELOG latest version v${latest || "?"} does not match v${version}`);

for (const asset of [`config.js?v=${version}`, `app-core.js?v=${version}`, `style-ux-v${version}.css?v=${version}`, `app-ux-v${version}.js?v=${version}`]) {
  if (!index.includes(asset)) throw new Error(`index.html is missing current release asset: ${asset}`);
}

console.log(`Site release metadata is consistent at v${version}.`);
