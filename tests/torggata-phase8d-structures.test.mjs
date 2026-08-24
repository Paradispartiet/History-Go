import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const place = JSON.parse(fs.readFileSync("data/places/by/oslo/places/torggata.json", "utf8"));
const audit = JSON.parse(fs.readFileSync("reports/place-production/torggata-phase8d-structures-audit-v1.json", "utf8"));
const production = JSON.parse(fs.readFileSync("data/places/production/torggata.json", "utf8"));
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

test("8D is historical and its own-place Structures collection is retired by 8F", () => {
  assert.equal(audit.result, "PASS");
  assert.deepStrictEqual(audit.included.map(item => item.id), ["torggata_eldorado_torggata_9", "torggata_bad_torggata_16"]);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "structures"), false);
  assert.ok(production.identity.excludes.includes("Eldorado som egen bygning/institusjon"));
  assert.ok(production.identity.excludes.includes("Torggata bad som egen bygning/institusjon"));
  assert.match(workcard, /Structures-poster for Eldorado og Torggata Bad er fjernet/);
});

test("current runtime selects related places, not Structures", () => {
  const w = runtime();
  assert.equal(w.HGPlaceRounds.getFourth(place), "related");
  assert.deepStrictEqual(Array.from(w.HGPlaceRounds.get(place)).map(item => item.id), ["people", "objects", "brands", "related"]);
  assert.deepStrictEqual(Array.from(w.HGPlaceRounds.getItems(place, "related")).map(item => item.id), ["storgata", "youngstorget", "eldorado_bokhandel"]);
  assert.equal(Array.from(w.HGPlaceRounds.get(place)).some(item => item.id === "structures"), false);
});
