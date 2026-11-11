import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("favorittvelgeren er aktiv bare i kartdock ved badgevelgeren", () => {
  const html = read("index.html"), app = read("js/app.js");
  const picker = read("js/ui/home-favorite-map-picker.js");
  const css = read("css/home-favorite-map-picker.css");
  assert.match(html, /css\/home-favorite-map-picker\.css\?v=20261111-safe-map1/);
  assert.match(html, /js\/app\.js\?v=20261111-safe-map1/);
  assert.match(app, /loadHomeFavoriteMapPicker/);
  assert.match(app, /initHomeFavoriteMapPicker/);
  assert.match(app, /bootCritical[\s\S]*loadHomeFavoriteMapPicker/);
  assert.doesNotMatch(app, /resetFavoriteMapOnHotfix/);
  assert.match(picker, /document\.querySelector\("\.map-controls"\)/);
  assert.match(picker, /dock\?\.querySelector\("\.hg-map-category-filter"\)/);
  assert.match(picker, /dock\.insertBefore\(host, badgeFilter\)/);
  assert.match(picker, /hgMapFavoriteTrigger/);
  assert.doesNotMatch(picker, /document\.getElementById\("nearbyFavoritesFilterBtn"\)/);
  assert.doesNotMatch(picker, /HGNearbyFilters\?\.setFavoritesOnly/);
  assert.match(css, /\.hg-map-favorite-filter\s*\{/);
  assert.match(css, /\.hg-home-favorite-map-picker\[hidden\]/);
  assert.match(read("js/map-controls-runtime.ts"), /\.hg-map-category-filter/);
});

test("tomt favorittsett kan ikke gi blankt forsidekart ved oppstart", () => {
  const app=read("js/app.js");
  assert.match(app, /restoreFavoriteMapSafely/);
  assert.match(app, /HGFavoritePlaces\?\.count\?\.\(\)/);
  assert.match(app, /setFavoriteViewOnly\(false\)/);
});

test("original navigasjon, stedskort og profilkart er urørt", () => {
  assert.match(read("tests/index-real-touch-debug-browser.mjs"), /exerciseFavoriteMapPicker/);
  assert.match(read("js/map.ts"), /setFavoriteViewOnly/);
  assert.match(read("js/ui/nearbyFilterControls.ts"), /nearbyFavoritesFilterBtn/);
});
