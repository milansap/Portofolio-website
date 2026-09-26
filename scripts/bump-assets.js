/*
  Cache-busting for the static site.

  Cloudflare (in front of GitHub Pages) caches CSS/JS for hours but HTML for
  minutes, so after a push visitors can get the new index.html with the old
  scripts — and the animations break. This stamps every local asset URL in
  index.html with a hash of the file's contents (?v=1a2b3c4d), so a changed
  file always gets a new URL and is fetched fresh.

  Run before committing:  npm run bump
*/
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const assets = ["assets/newcss.css", "assets/ptj.js", "assets/contact.js"];

let html = fs.readFileSync(htmlPath, "utf8");
let changed = 0;

for (const asset of assets) {
  const hash = crypto
    .createHash("md5")
    .update(fs.readFileSync(path.join(root, asset)))
    .digest("hex")
    .slice(0, 8);
  const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(["'])${escaped}(?:\\?v=[^"']*)?\\1`, "g");
  if (!pattern.test(html)) {
    console.warn(`! ${asset} is not referenced in index.html`);
    continue;
  }
  html = html.replace(pattern, `$1${asset}?v=${hash}$1`);
  console.log(`${asset}?v=${hash}`);
  changed++;
}

fs.writeFileSync(htmlPath, html);
console.log(`Updated ${changed} asset URL(s) in index.html`);
