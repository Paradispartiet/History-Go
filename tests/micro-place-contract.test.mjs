import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { applyMicroPlaceQuizPolicy } from "../scripts/validate-place-description-production-v4_2_policy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const schema = JSON.parse(read("data/places/regler/micro_place_profile_v1.schema.json"));
const runtime = read("js/ui/micro-place-card.js");
const rounds = read("js/ui/place-rounds-visual-collections.js");
const subcategory = read("js/ui/place-subcategory-collections.js");
const windows = new Set();
afterEach(() => { for (const window of windows) window.close(); windows.clear(); });

function fixture(places) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="placeCard"><div class="pc-body"><div class="pc-title-row"><div id="pcBadgesIcon"></div></div><div class="pc-grid"><div class="pc-frontcard"></div><div class="pc-side-stack"><div class="pc-icons-quad"></div></div><div id="pcEventsBox" class="pc-events-quad"></div></div><div id="pcLesespor"></div></div><footer><button id="pcInfo"></button><button id="pcQuiz"></button><button id="pcVisit"></button><button id="pcRoute"></button><button id="pcObserve"></button><button id="pcNote"></button></footer></div></body></html>`, {
    url:"https://history-go.test/",
    runScripts:"outside-only"
  });
  const window = dom.window;
  windows.add(window);
  window.PLACES = places;
  window.requestAnimationFrame = callback => { callback(); return 1; };
  window.openPlaceCard = async place => {
    window.document.getElementById("placeCard").dataset.currentPlaceId = place.id;
    return true;
  };
  window.eval(runtime);
  window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles:true }));
  return window;
}

test("Micro Place schema owns a reduced canonical tier without a parallel category", () => {
  assert.equal(schema.properties.schema.const, "history_go_micro_place_profile_v1");
  assert.ok(schema.properties.kind.enum.includes("lesekiosk"));
  assert.ok(schema.properties.kind.enum.includes("gjenvinningsstasjon"));
  assert.deepEqual(schema.properties.quizMode.enum, ["none", "place"]);
  const types = read("schemas/place.ts");
  assert.match(types, /PlaceTier = "standard" \| "micro"/);
  assert.match(types, /micro_place_profile\?: MicroPlaceProfileV1/);
  assert.match(read("docs/MICRO_PLACE_CONTRACT.md"), /content tier inside canonical Place/);
});

test("Micro Place renders one compact identity panel and restores a standard card", async () => {
  const micro = {
    id:"lesekiosk_test",
    category:"litteratur",
    subcategory_id:"lesekiosk",
    placeTier:"micro",
    micro_place_profile:{
      schema:"history_go_micro_place_profile_v1",
      kind:"lesekiosk",
      currentStatus:"active",
      sourceUrl:"https://example.test/source",
      sourceLocation:"official list",
      verifiedAt:"2026-08-26",
      quizMode:"none"
    }
  };
  const standard = { id:"standard", category:"historie" };
  const window = fixture([micro, standard]);
  await window.openPlaceCard(micro);
  const card = window.document.getElementById("placeCard");
  const panel = window.document.getElementById("pcMicroIdentity");
  assert.equal(card.classList.contains("is-micro-place"), true);
  assert.equal(card.dataset.placeTier, "micro");
  assert.equal(card.dataset.microQuiz, "none");
  assert.equal(panel.hidden, false);
  assert.match(panel.textContent, /Lesekiosk/);
  assert.match(panel.textContent, /Aktivt sted/);

  await window.openPlaceCard(standard);
  assert.equal(card.classList.contains("is-micro-place"), false);
  assert.equal(card.dataset.placeTier, "standard");
  assert.equal(panel.hidden, true);
});

test("collection runtimes explicitly leave Micro Places out of full grids", () => {
  assert.match(rounds, /function isMicroPlace\(place\)/);
  assert.match(rounds, /if \(isMicroPlace\(place\)\) return \[\]/);
  assert.match(rounds, /return "micro_place_profile_v1"/);
  assert.match(subcategory, /placeTier\)\.toLowerCase\(\) !== "micro"/);
});

test("Micro Place policy waives only quiz volume for an explicit quizMode=none", () => {
  const microPacket = "data/places/production/grefsen_gjenvinningsstasjon.json";
  const standardPacket = "data/places/production/christiania_torv.json";
  const report = applyMicroPlaceQuizPolicy({
    errorCount: 3,
    issues: [
      { code:"too_few_quiz_questions", packetFile:microPacket },
      { code:"source_not_authoritative", packetFile:microPacket },
      { code:"too_few_quiz_questions", packetFile:standardPacket }
    ]
  });
  assert.equal(report.errorCount, 2);
  assert.equal(report.microPlacePolicy.removedQuizIssueCount, 1);
  assert.deepEqual(report.issues.map(issue => issue.code), ["source_not_authoritative", "too_few_quiz_questions"]);
});
