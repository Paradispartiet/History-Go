import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const place = JSON.parse(fs.readFileSync("data/places/by/oslo/places/torggata.json", "utf8"));
const audit = fs.readFileSync("reports/place-production/torggata-phase8b-objects-audit-v1.md", "utf8");
const roundsSource = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");
const workcard = fs.readFileSync("reports/place-production/torggata-workcard-current.md", "utf8");
const windows = new Set();
afterEach(() => { for (const w of windows) w.close(); windows.clear(); });

function runtime() {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="torggata"><div class="pc-body"><div class="pc-title-row"></div><div class="pc-icons-quad"></div></div></div></body>', { url:"https://history-go.test/", runScripts:"outside-only" });
  windows.add(dom.window);
  dom.window.PLACES = [place];
  dom.window.eval(roundsSource);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded", { bubbles:true }));
  return dom.window;
}

test("8B is retained as a historical snapshot but the one-item Objects round is retired", () => {
  assert.match(audit, /Status: \*\*GODKJENT/);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "objects"), false);
  assert.deepStrictEqual(place.round_profile.content_round_ids, ["people", "images", "brands", "related"]);
  assert.match(place.round_profile.reason, /enslig Objects-post/);
  assert.match(workcard, /Den enslige Objects-posten er fjernet fra canonical place-data/);
});

test("Civication is neither promoted to canonical Objects nor selected as a round", () => {
  const w = runtime();
  assert.equal(w.HGVisualPlaceRounds.ids.includes("civication"), false);
  assert.equal(Array.from(w.HGPlaceRounds.get(place)).includes("objects"), false);
  assert.ok((place.civication_store || []).some(item => item.id === "torggata_for_na_bildekort"));
});
