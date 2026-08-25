import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directTabs = fs.readFileSync(path.join(root, "js/ui/place-popup-direct-tabs.js"), "utf8");

const expectedTabs = [
  ["language", "Språk"],
  ["objects", "Spor & objekter"],
  ["notice", "Legg merke til"],
  ["meaning", "Betydning"],
  ["counterpoints", "Motpunkter"],
  ["relations", "Relasjoner"],
  ["knowledge", "Kunnskap"],
  ["observations", "Observasjoner"]
];

test("alle tidligere Mer-familier er faste synlige direktefaner", () => {
  assert.match(directTabs, /const DIRECT_TABS = Object\.freeze\(\[/);
  for (const [id, label] of expectedTabs) {
    assert.ok(directTabs.includes(`["${id}", "${label}"]`), `mangler fast direktefane ${label}`);
  }
  assert.match(directTabs, /ensureAllDirectTabs\(tablist, panelWrap\)/);
  assert.match(directTabs, /ensureEmptyState\(panel, id\)/);
});

test("Mer forblir skjult staging og tomme direktefaner beholdes", () => {
  assert.match(directTabs, /moreTab\?\.remove\(\)/);
  assert.match(directTabs, /morePanel\.remove\(\)/);
  assert.match(directTabs, /data-direct-tab-empty|dataset\.directTabEmpty/);
  assert.doesNotMatch(directTabs, /DIRECT_TABS\.filter/);
});
