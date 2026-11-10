import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("favorittkartvelgeren ligger i den faste kartdock ved badgevelgeren", () => {
  const picker = read("js/ui/home-favorite-map-picker.js");
  const css = read("css/home-favorite-map-picker.css");
  assert.match(picker, /document\.querySelector\("\.map-controls"\)/);
  assert.match(picker, /dock\?\.querySelector\("\.hg-map-category-filter"\)/);
  assert.match(picker, /dock\.insertBefore\(host, badgeFilter\)/);
  assert.match(picker, /hgMapFavoriteTrigger/);
  assert.doesNotMatch(picker, /document\.getElementById\("nearbyFavoritesFilterBtn"\)/);
  assert.match(css, /\.hg-map-favorite-filter\s*\{/);
  assert.match(css, /order:\s*998/);
  assert.match(css, /bottom:\s*calc\(100% \+ 8px\)/);
  assert.doesNotMatch(css, /#nearbyListContainer \.hg-home-favorite-map-picker/);
});

test("favorittknappen kan opprettes selv om kartdock lastes senere", () => {
  const picker = read("js/ui/home-favorite-map-picker.js");
  assert.match(picker, /MutationObserver/);
  assert.match(picker, /ensureVisible/);
  assert.match(picker, /window\.HGHomeFavoriteMapPicker = \{ init: ensureVisible/);
  assert.match(picker, /data-favorite-view="favorites"/);
  assert.match(picker, /data-favorite-style/);
});

test("index henter ny favorittvelger og beholder kartbadgevelgeren", () => {
  const html = read("index.html");
  const app = read("js/app.js");
  assert.match(html, /css\/home-favorite-map-picker\.css\?v=20261110-mapdock2/);
  assert.match(html, /js\/app\.js\?v=20261110-mapdock2/);
  assert.match(app, /js\/ui\/home-favorite-map-picker\.js\?v=20261110-mapdock2/);
  assert.match(app, /HGHomeFavoriteMapPicker\?\.init\?\.\(\)/);
  assert.match(read("js/map-controls-runtime.ts"), /\.hg-map-category-filter/);
});