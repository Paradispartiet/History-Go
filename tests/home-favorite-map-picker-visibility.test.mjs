import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("sikkerhetsrettelse: index laster ikke favorittoverlegget som blokkerte iPad-interaksjon", () => {
  const html = read("index.html");
  const app = read("js/app.js");
  assert.doesNotMatch(html, /home-favorite-map-picker\.css/);
  assert.doesNotMatch(app, /loadHomeFavoriteMapPicker|initHomeFavoriteMapPicker/);
  assert.match(app, /resetFavoriteMapOnHotfix/);
  assert.match(app, /HGMap\?\.setFavoriteViewOnly\?\.\(false\)/);
  assert.match(html, /js\/app\.js\?v=20261111-touch-rollback1/);
  assert.match(html, /id="map"/);
  assert.match(app, /loadMap/);
});

test("kartets vanlige badgevelger og Utforsk forblir i kildekoden", () => {
  assert.match(read("js/map-controls-runtime.ts"), /\.hg-map-category-filter/);
  assert.match(read("js/ui/nearbyFilterControls.ts"), /nearbyFavoritesFilterBtn/);
  assert.match(read("js/map.ts"), /setFavoriteViewOnly/);
});