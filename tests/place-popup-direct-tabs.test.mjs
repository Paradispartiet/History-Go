import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const baseTabs = read("js/ui/place-popup-tabs.js");
const directTabs = read("js/ui/place-popup-direct-tabs.js");
const css = read("css/place-popup-tabs.css");
const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");
const popupContract = read("docs/PLACE_POPUP_SYSTEM.md");

test("Mer er ikke en brukerrettet sluttfane", () => {
  assert.match(baseTabs, /\["more", "Mer"\]/, "legacy-hydratoren kan fortsatt ha staging-panelet under migreringen");
  assert.match(directTabs, /moreTab\?\.remove\(\)/);
  assert.match(directTabs, /morePanel\.remove\(\)/);
  assert.match(directTabs, /staging-panel/);
  assert.doesNotMatch(popupContract, /Popupen har åtte faste grunnfaner/);
  assert.match(popupContract, /ingen brukerrettet [`*]*Mer[`*]*-fane/i);
});

test("alle kjente Mer-eiere får direkte faner", () => {
  for (const label of [
    "Spor & objekter",
    "Legg merke til",
    "Betydning",
    "Motpunkter",
    "Relasjoner",
    "Kunnskap",
    "Observasjoner",
    "Språk"
  ]) {
    assert.ok(directTabs.includes(label), `mangler direktefane: ${label}`);
  }
  assert.match(directTabs, /hg-place-relations-section/);
  assert.match(directTabs, /hg-place-knowledge-section/);
  assert.match(directTabs, /hg-place-observations-section/);
  assert.match(directTabs, /data\.generated === "more"/);
});

test("fanestripen er én horisontalt scrollbar og touch-vennlig linje", () => {
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /flex-wrap:\s*nowrap/);
  assert.match(css, /white-space:\s*nowrap/);
  assert.match(css, /-webkit-overflow-scrolling:\s*touch/);
  assert.match(css, /scroll-snap-type:\s*x proximity/);
  assert.match(directTabs, /scrollIntoView/);
  assert.match(directTabs, /inline:\s*"nearest"/);
});

test("place-checklisten krever dialektord ved Språkleksikon-produksjon", () => {
  assert.match(checklist, /dialektord/i);
  assert.match(checklist, /lokale uttrykk/i);
  assert.match(checklist, /Språkleksikon[\s\S]*kildebelagt/i);
  assert.match(checklist, /skal ikke diktes|ikke dikt/i);
});
