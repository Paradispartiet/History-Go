#!/usr/bin/env node
// Verifiserer at alle Civication-kartmotorene bruker den felles History Go-stedmenyen.

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const layer = read("js/Civication/ui/CivicationHistoryGoPlaceLayer.js");
const canvas = read("js/Civication/ui/CivicationCanvasMap.js");
const three = read("js/Civication/ui/CivicationThreeMap.js");
const css = read("css/civi-map-miniatures.css");

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log("  ok  -", name);
  } catch (error) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", error && error.message);
  }
}

console.log("Civication History Go-stedmeny");

check("History Go-laget eksporterer felles åpne- og lukke-API", () => {
  assert.match(layer, /window\.CivicationHistoryGoPlaceLayer\s*=\s*\{[\s\S]*?openPlaceMenu,[\s\S]*?closePlaceMenu,/);
});

check("SVG-miniatyrer åpner meny ved klikk og tastatur", () => {
  const miniature = layer.match(/function buildMiniature\([\s\S]*?\n  \}/);
  assert.ok(miniature, "fant ikke buildMiniature");
  assert.ok((miniature[0].match(/openPlaceMenu\(place\)/g) || []).length >= 2);
  assert.doesNotMatch(miniature[0], /visitHistoryGoPlace|location\.href/);
});

check("History Go-navigasjon ligger bak menyvalget Besøk i History Go", () => {
  assert.match(layer, /function visitHistoryGoPlace\(placeId\)[\s\S]*?window\.location\.href/);
  assert.match(layer, /data-place-action="visit">Besøk i History Go/);
  assert.match(layer, /data-place-action="visit"[\s\S]*?visitHistoryGoPlace\(_activeMenuPlace\.id\)/);
});

check("Dra dit sender lokalt travel-request-event uten progresjonslagring", () => {
  const travelHandler = layer.match(/function handleTravelToPlace\(place\) \{[\s\S]*?\n  \}/);
  assert.ok(travelHandler, "fant ikke handleTravelToPlace");
  assert.match(travelHandler[0], /civi:historyGoPlaceTravelRequested/);
  assert.match(travelHandler[0], /detail: \{ placeId: place\.id, place, source: "CivicationHistoryGoPlaceLayer" \}/);
  assert.match(travelHandler[0], /"Mål satt: " \+ \(place\.name \|\| place\.id\)/);
  assert.doesNotMatch(travelHandler[0], /localStorage|visited_places|merits_by_category|quiz_progress/);
  assert.doesNotMatch(travelHandler[0], /Reisehandling er registrert lokalt|travel-motoren finnes/);
});

check("Canvas-kartet delegerer place-objektet til felles meny", () => {
  assert.match(canvas, /openHistoryGoPlaceMenu\(best\.place\)/);
  assert.match(canvas, /CivicationHistoryGoPlaceLayer[\s\S]*?menu\.openPlaceMenu\(place\)/);
  assert.doesNotMatch(canvas, /navigate\(best\.place\.id\)/);
});

check("Three-kartet slår opp place og delegerer til felles meny", () => {
  const openPlace = three.match(/function openPlace\(placeId\)[\s\S]*?\n  \}/);
  assert.ok(openPlace, "fant ikke openPlace");
  assert.match(openPlace[0], /\(_places \|\| \[\]\)\.find/);
  assert.match(openPlace[0], /menu\.openPlaceMenu\(place \|\| placeId\)/);
  assert.ok(openPlace[0].indexOf("menu.openPlaceMenu") < openPlace[0].indexOf("window.location.href"), "fallback må komme etter menydelegasjon");
});

check("menyen bruker body-overlay med avtalt stacking og safe areas", () => {
  assert.match(layer, /document\.body\.appendChild\(root\)/);
  assert.match(css, /\.civi-hg-place-menu\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?z-index:\s*10020;/);
  assert.match(css, /env\(safe-area-inset-top\)/);
});

if (failures) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
