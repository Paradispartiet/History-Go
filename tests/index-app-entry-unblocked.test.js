#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const appEntry = html.indexOf('<script type="module" src="./js/app.js?v=20260824-area-square-dom3"></script>');
assert.ok(appEntry >= 0, "index must contain the cache-busted app entry");

for (const src of [
  "js/debug/HGTestMode.js",
  "js/i18n.js",
  "dist/web/knowledge.js",
  "dist/web/hgInsights.js",
  "dist/web/knowledgeV2.js",
  "js/hgSocialGuards.js",
  "js/knowledgeMatch.js",
  "js/progress/profileProgressReader.js",
  "js/ui/place-card-status-surface.js",
  "js/ui/header-menu.js",
  "js/ui/psychology-room-entry.js"
]) {
  assert.ok(!html.includes(`<script src="${src}"></script>`), `${src} must not parser-block app entry`);
  assert.ok(html.includes(`"${src}"`), `${src} must remain in the post-ready loader`);
}

assert.ok(html.includes('window.addEventListener("hg:appReady"'), "secondary runtime must load only after appReady");
console.log("index app entry is not parser-blocked by secondary runtime scripts");
