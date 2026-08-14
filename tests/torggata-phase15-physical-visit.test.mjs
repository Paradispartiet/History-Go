import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const place = JSON.parse(fs.readFileSync("data/places/by/oslo/places/torggata.json", "utf8"));
const audit = JSON.parse(fs.readFileSync("reports/place-production/torggata-phase15-physical-visit-audit-v1.json", "utf8"));
const bundle = fs.readFileSync("js/ui/place-card-quizcards-patch.js", "utf8");
const physicalSource = fs.readFileSync("js/visits/physicalVisits.ts", "utf8");

test("Torggata fase 15 bruker canonical fysisk visit-gate og holder quiz separat", async () => {
  assert.equal(place.id, "torggata");
  assert.equal(place.lat, 59.91700148933685);
  assert.equal(place.lon, 10.75330911912394);
  assert.equal(place.r, 180);
  assert.equal(place.coordStatus, "verified_geometry");

  const dom = new JSDOM("<!doctype html><body><button id=\"pcVisit\">Besøk</button><button id=\"pcClose\">Lukk</button></body>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const w = dom.window;
  let hasPosition = false;
  let distance = 500;
  let physicalWrites = 0;
  w.TEST_MODE = false;
  w.visited = {};
  w.HG_I18N = { t: (_key, fallback) => fallback };
  w.getPos = () => hasPosition ? { lat: place.lat, lon: place.lon } : null;
  w.distMeters = () => distance;
  w.getPlaceDistanceTargets = candidate => [{ lat: candidate.lat, lon: candidate.lon, r: candidate.r }];
  w.saveVisitedFromQuiz = id => { physicalWrites += 1; w.visited[String(id)] = true; };
  w.openPlaceCard = async () => undefined;
  w.showToast = () => undefined;
  w.pulseMarker = () => undefined;
  w.setInterval = () => 1;
  w.clearInterval = () => undefined;

  w.eval(bundle);
  assert.equal(w.saveVisitedFromQuiz("torggata"), false);
  assert.equal(w.visited.torggata, undefined);
  assert.equal(physicalWrites, 0);

  await w.openPlaceCard(place);
  let button = w.document.getElementById("pcVisit");
  assert.equal(button.disabled, true);
  assert.equal(button.textContent, "Henter posisjon…");

  hasPosition = true;
  await w.openPlaceCard(place);
  button = w.document.getElementById("pcVisit");
  assert.equal(button.disabled, true);
  assert.equal(button.textContent, "Gå nærmere: 320 m");
  button.click();
  assert.equal(physicalWrites, 0);

  distance = 180;
  await w.openPlaceCard(place);
  button = w.document.getElementById("pcVisit");
  assert.equal(button.disabled, false);
  assert.equal(button.textContent, "Registrer besøk");
  button.click();
  assert.equal(physicalWrites, 1);
  assert.equal(w.visited.torggata, true);
  assert.equal(w.document.getElementById("pcVisit").textContent, "Besøkt ✅");
  dom.window.close();

  assert.ok(physicalSource.includes("getPlaceDistanceTargets(place)"));
  assert.ok(physicalSource.includes('reason: "too_far"'));
  assert.ok(physicalSource.includes("runtime.saveVisitedFromQuiz = function saveVisitedFromQuizDeprecated()"));
  for (const field of ["visited", "visited_places", "physical_visit", "checkin", "check_in"]) assert.equal(Object.hasOwn(place, field), false);
  assert.equal(audit.status, "approved_existing");
});
