import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const ROOT = process.cwd();
const place = JSON.parse(fs.readFileSync(path.join(ROOT, "data/places/by/oslo/places/torggata.json"), "utf8"));
const roundsSource = fs.readFileSync(path.join(ROOT, "js/ui/place-rounds-visual-collections.js"), "utf8");
const windows = new Set();
afterEach(() => { for (const w of windows) w.close(); windows.clear(); });

const OBJECT_ID = "torggata_byrute_8_sykkelskilt";
const COMMONS_PAGE = "https://commons.wikimedia.org/wiki/File:Skilt_for_byrute_8_for_sykkel_Oslo_2020.jpg";
const IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/6/66/Skilt_for_byrute_8_for_sykkel_Oslo_2020.jpg";
const REJECTED_LEGACY_IDS = [
  "torggata_gateskilt",
  "torggata_sykkel_gagate_symbol",
  "torggata_serveringssone_markor",
  "torggata_for_na_bildekort",
];

function makeRuntime() {
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="torggata"><div class="pc-body"><div class="pc-title-row"><h2></h2></div><div class="pc-icons-quad"></div></div></div></body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  windows.add(w);
  w.PLACES = [place];
  w.eval(roundsSource);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  return w;
}

test("8B materializes a canonical Objects collection without a numeric quota", () => {
  assert.ok(Array.isArray(place.objects), "Torggata must own canonical place.objects");
  assert.ok(place.objects.length >= 1, "8B must contain the verified physical object");
  const object = place.objects.find(item => item.id === OBJECT_ID);
  assert.ok(object, `${OBJECT_ID} must be materialized`);
  assert.equal(object.physicalObject, true);
  assert.equal(object.placeSpecific, true);
  assert.equal(object.image, IMAGE_URL);
  assert.equal(object.imageMeta?.sourceUrl, COMMONS_PAGE);
  assert.equal(object.imageMeta?.author, "Helge Høifødt");
  assert.equal(object.imageMeta?.license, "CC BY-SA 4.0");
  assert.equal(object.imageMeta?.verified, true);
  assert.ok(Array.isArray(object.source_urls) && object.source_urls.includes(COMMONS_PAGE));
});

test("legacy Civication cards are not silently promoted into canonical Objects", () => {
  const ids = new Set((place.objects || []).map(item => item.id));
  for (const legacyId of REJECTED_LEGACY_IDS) {
    assert.equal(ids.has(legacyId), false, `${legacyId} must remain out of canonical place.objects`);
  }
  assert.ok((place.civication_store || []).some(item => item.id === "torggata_for_na_bildekort" && item.physicalObject === false));
});

test("canonical runtime reads the verified object from place.objects", () => {
  const w = makeRuntime();
  const items = Array.from(w.HGPlaceRounds.getItems(place, "objects"));
  const object = items.find(item => item.id === OBJECT_ID);
  assert.ok(object, "HGPlaceRounds must expose the canonical Torggata Object");
  assert.equal(object.image, IMAGE_URL);
  assert.match(object.title, /Byrute 8/);
});

test("8B does not revive Civication as a PlaceCard round", () => {
  const w = makeRuntime();
  assert.ok(w.HGVisualPlaceRounds.ids.includes("objects"));
  assert.equal(w.HGVisualPlaceRounds.ids.includes("civication"), false);
});
