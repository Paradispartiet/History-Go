import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const place = JSON.parse(fs.readFileSync("data/places/by/oslo/places/torggata.json", "utf8"));
const production = JSON.parse(fs.readFileSync("data/places/production/torggata.json", "utf8"));
const backlog = JSON.parse(fs.readFileSync("reports/place-production/torggata-quality-improvement-backlog-v1.json", "utf8"));
const roundsSource = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");
const contract = fs.readFileSync("data/places/README_place_rounds.md", "utf8");
const checklist = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST.md", "utf8");
const audit = fs.readFileSync("reports/place-production/torggata-phase8f-round-coherence-audit-v1.md", "utf8");
const workcard = fs.readFileSync("reports/place-production/torggata-workcard-current.md", "utf8");
const windows = new Set();
afterEach(() => { for (const w of windows) w.close(); windows.clear(); });

function runtime(nextPlace = place, extraPlaces = []) {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="' + nextPlace.id + '"><div class="pc-body"><div class="pc-title-row"><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div></div><div id="pcPeopleList"></div><div id="pcBrandsList"></div></div></div></body>', { url:"https://history-go.test/", runScripts:"outside-only" });
  windows.add(dom.window);
  dom.window.PLACES = [nextPlace, ...extraPlaces];
  dom.window.eval(roundsSource);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded", { bubbles:true }));
  return dom.window;
}

test("Torggata legacy profile is adapted to a full four-cell grid plus separate Badge", () => {
  assert.deepStrictEqual(place.round_profile.content_round_ids, ["people", "images", "brands", "related"]);
  assert.equal(place.round_profile.schema, "history_go_place_round_profile_v1");
  assert.match(place.round_profile.reason, /enslig Objects-post/);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "objects"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "structures"), false);
  assert.deepStrictEqual(place.related_place_ids, ["storgata", "youngstorget", "eldorado_bokhandel"]);

  const w = runtime();
  assert.deepStrictEqual(Array.from(w.HGPlaceRounds.get(place)).map(def => def.id), ["people", "objects", "brands", "related"]);
  assert.equal(w.HGPlaceRounds.getItems(place, "images").length, 0);
  assert.equal(w.HGPlaceRounds.getItems(place, "related").length, 3);
  assert.equal(w.HGPlaceRounds.badge.id, "badges");
});

test("own places appear only as explicit relations, not parent objects or structures", () => {
  assert.ok(production.identity.excludes.includes("Youngstorget som eget sted"));
  assert.ok(production.identity.excludes.includes("Eldorado som egen bygning/institusjon"));
  assert.ok(production.identity.excludes.includes("Torggata bad som egen bygning/institusjon"));
  assert.equal(Object.prototype.hasOwnProperty.call(place, "objects"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "structures"), false);
  assert.deepStrictEqual(place.related_place_ids, ["storgata", "youngstorget", "eldorado_bokhandel"]);
  assert.match(audit, /related.*annet History GO-place/is);
  assert.match(audit, /Torggata Bad brukes ikke som bilde, Object, Structure eller hovedanker/);
});

test("legacy profiles are filtered when possible and otherwise fall back to category defaults", () => {
  const invalid = JSON.parse(JSON.stringify(place));
  invalid.id = "invalid_profile";
  invalid.round_profile.content_round_ids = ["people", "images", "brands", "images"];
  const w1 = runtime(invalid);
  assert.deepStrictEqual(Array.from(w1.HGPlaceRounds.getConfigured(invalid)), ["people", "objects", "brands", "structures"]);
  assert.deepStrictEqual(Array.from(w1.HGPlaceRounds.get(invalid)).map(def => def.id), ["people", "objects", "brands", "structures"]);

  const undocumented = JSON.parse(JSON.stringify(place));
  undocumented.id = "undocumented_profile";
  undocumented.round_profile.reason = "   ";
  const w2 = runtime(undocumented);
  assert.equal(w2.HGPlaceRounds.getConfigured(undocumented), null);
  assert.deepStrictEqual(Array.from(w2.HGPlaceRounds.get(undocumented)).map(def => def.id), ["people", "objects", "brands", "structures"]);

  const empty = JSON.parse(JSON.stringify(place));
  empty.id = "empty_profile";
  empty.related_place_ids = [];
  const w3 = runtime(empty);
  assert.deepStrictEqual(Array.from(w3.HGPlaceRounds.getConfigured(empty)), ["people", "objects", "brands", "related"]);
  assert.deepStrictEqual(Array.from(w3.HGPlaceRounds.get(empty)).map(def => def.id), ["people", "objects", "brands", "related"]);
});

test("backlog closes all five content findings and queues manual re-QA", () => {
  const finding = backlog.findings.find(item => item.id === "objects_structures_round_overlap");
  assert.equal(finding.workflow_status, "RESOLVED_PHASE_8F");
  assert.deepStrictEqual(finding.resolution.current_rounds, ["people", "images", "brands", "related"]);
  assert.equal(finding.resolution.badge_separate, true);
  assert.ok(backlog.findings.every(item => item.workflow_status?.startsWith("RESOLVED_PHASE_")));
  assert.deepStrictEqual(backlog.active_phase, { id:"final_closeout", status:"READY_TO_MERGE" });
  assert.equal(backlog.sequence.find(item => item.id === "objects_structures_round_overlap").status, "RESOLVED");
  assert.equal(backlog.sequence.find(item => item.id === "manual_ui_and_content_reqa").status, "RESOLVED");
});

test("contracts preserve legacy evidence while keeping the visual grid full", () => {
  assert.match(contract, /alltid en full, fast 2 × 2-komposisjon/i);
  assert.match(contract, /"place_card_profile"[\s\S]*"collection_ids"/);
  assert.match(contract, /Objects og Structures kan ha hver sin faste flate/);
  assert.match(contract, /egen canonical oppføring vises bare som eksplisitt relasjon/);
  assert.match(checklist, /nye\/fullproduserte steder bruker `place_card_profile\.collection_ids`/);
  assert.match(workcard, /Torggata = SLUTTGODKJENT FOR CLOSEOUT-MERGE/);
});
