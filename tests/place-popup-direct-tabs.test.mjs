import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const baseTabs = read("js/ui/place-popup-tabs.js");
const directTabs = read("js/ui/place-popup-direct-tabs.js");
const ownershipRouting = read("js/ui/place-collection-knowledge-routing.js");
const popupLoader = read("js/ui/place-card-status-surface.js");
const css = read("css/place-popup-tabs.css");
const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");
const popupContract = read("docs/PLACE_POPUP_SYSTEM.md");

test("Mer er bare et internt staging-panel", () => {
  assert.match(baseTabs, /\["more", "Mer"\]/, "legacy-hydratoren kan beholde staging-panelet");
  assert.match(baseTabs, /if \(id !== "more"\) tablist\.appendChild\(button\)/, "staging-panelet får aldri synlig fane");
  assert.match(css, /data-place-tab="more"[\s\S]*?display:none !important/, "CSS-fallback skjuler Mer");
  assert.match(directTabs, /data-place-tab=\\?"\$\{MORE_ID\}\\?"|data-place-tab=\\?"more\\?"/);
  assert.match(directTabs, /morePanel\.remove\(\)/);
  assert.match(popupContract, /ingen brukerrettet [`*]*Mer[`*]*-fane/i);
});

test("bare Språk er definert som valgfri direktefane", () => {
  assert.match(directTabs, /visibleOptionalTabs:\s*\["language"\]/);
  assert.doesNotMatch(directTabs, /const DIRECT_TABS\s*=/);
  for (const id of ["objects", "notice", "meaning", "counterpoints", "relations", "knowledge", "observations"]) {
    assert.ok(directTabs.includes(`"${id}"`), `mangler eksplisitt opprydding av gammel direktefane ${id}`);
  }
  assert.match(directTabs, /ensureLanguageTab\(tablist, panelWrap\)/);
  assert.match(popupContract, /Språk[\s\S]*valgfri/i);
});

test("tidligere Mer-innhold rutes til canonical eierflater", () => {
  assert.match(directTabs, /heading === "spor og objekter" \|\| heading === "legg merke til"/);
  assert.match(directTabs, /storeSupplement\(placeId, "objects", node\)/);
  assert.match(directTabs, /hg-place-relations-section/);
  assert.match(directTabs, /storeSupplement\(placeId, "people", node\)/);
  assert.match(directTabs, /heading === "hvorfor det betyr noe"/);
  assert.match(directTabs, /heading === "motpunkter"/);
  assert.match(directTabs, /hg-place-knowledge-section/);
  assert.match(directTabs, /hg-place-observations-section/);
  assert.match(directTabs, /moveToAbout\(node, panelWrap\)/);
  assert.match(ownershipRouting, /data-collection-supplement=\\?"objects\\?"/);
  assert.match(ownershipRouting, /data-collection-supplement=\\?"people-relations\\?"/);
  assert.match(ownershipRouting, /Ikke legg rene place→place-relasjoner i People/);
});

test("eierflatrutingen lastes sammen med PlaceCard og popup", () => {
  assert.match(popupLoader, /ensureScript\("js\/ui\/place-popup-direct-tabs\.js"\)/);
  assert.match(popupLoader, /ensureScript\("js\/ui\/place-collection-knowledge-routing\.js"\)/);
  assert.match(directTabs, /void result\.then\(route\)/, "async popup rutes etter at den er bygget");
  assert.match(directTabs, /try \{ decoratePopup\(\); \} catch/, "allerede åpen popup kan repareres ved installasjon");
});

test("fanestripen for grunnfaner og eventuell Språk forblir horisontal og touch-vennlig", () => {
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /flex-wrap:\s*nowrap/);
  assert.match(css, /white-space:\s*nowrap/);
  assert.match(css, /-webkit-overflow-scrolling:\s*touch/);
  assert.match(css, /scroll-snap-type:\s*x proximity/);
});

test("place-checklisten beholder dialektkrav og eierflater", () => {
  assert.match(checklist, /dialektord/i);
  assert.match(checklist, /lokale uttrykk/i);
  assert.match(checklist, /Språkleksikon[\s\S]*kildebelagt/i);
  assert.match(checklist, /skal ikke diktes|ikke dikt/i);
  assert.match(checklist, /eierflat|Objects|People/i);
});
