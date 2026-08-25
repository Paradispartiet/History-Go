import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directTabs = fs.readFileSync(path.join(root, "js/ui/place-popup-direct-tabs.js"), "utf8");
const ownership = fs.readFileSync(path.join(root, "js/ui/place-collection-knowledge-routing.js"), "utf8");

test("gamle Mer-familier blir ikke faste popupfaner", () => {
  assert.doesNotMatch(directTabs, /const DIRECT_TABS\s*=/);
  assert.match(directTabs, /visibleOptionalTabs:\s*\["language"\]/);
  assert.match(directTabs, /REMOVED_DIRECT_TAB_IDS/);
  assert.match(directTabs, /cleanupOldDirectTabs\(tablist, panelWrap\)/);
});

test("Objects og People eier sine tidligere Mer-lag", () => {
  assert.match(directTabs, /storeSupplement\(placeId, "objects", node\)/);
  assert.match(directTabs, /storeSupplement\(placeId, "people", node\)/);
  assert.match(ownership, /objectsSupplement/);
  assert.match(ownership, /peopleSupplement/);
  assert.match(ownership, /kind === "objects"/);
  assert.match(ownership, /\["objects", "people"\]\.includes\(kind\)/);
});

test("Betydning, motpunkter og generell kunnskap blir stedskunnskap under Om", () => {
  assert.match(directTabs, /heading === "hvorfor det betyr noe"/);
  assert.match(directTabs, /heading === "motpunkter"/);
  assert.match(directTabs, /hg-place-knowledge-section/);
  assert.match(directTabs, /hg-place-observations-section/);
  assert.match(directTabs, /moveToAbout\(node, panelWrap\)/);
});

test("ingen innholdsfamilie gjeninnfører Mer eller en generell restfane", () => {
  assert.match(directTabs, /morePanel\.remove\(\)/);
  assert.doesNotMatch(directTabs, /extra-/);
  assert.doesNotMatch(directTabs, /"Tillegg"/);
  assert.doesNotMatch(directTabs, /ensureEmptyState/);
});
