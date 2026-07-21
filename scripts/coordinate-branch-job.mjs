#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const PLACE_ID = "noklevann";
const PLACE_FILE = "data/places/natur/oslo/places_oslo_natur_hovedsteder/noklevann.json";
const SPLIT_MANIFEST = "data/places/natur/oslo/places_oslo_natur_hovedsteder_manifest.json";
const TEST_FILE = "tests/noklevann-mapped-species-inventory.test.js";
const REPORT_FILE = "reports/noklevann-mapped-species-inventory.md";
const MAP_FILES = [
  "data/natur/nature_place_map.json",
  "data/natur/nature_bird_place_map.json",
  "data/natur/nature_oslo_expansion_place_map.json",
  "data/natur/nature_routes_place_map.json"
];
const abs = file => path.join(ROOT, file);
const readJson = async file => JSON.parse(await fs.readFile(abs(file), "utf8"));
const serialize = value => JSON.stringify(value, null, 2) + "\n";
const writeJson = async (file, value) => {
  await fs.mkdir(path.dirname(abs(file)), { recursive: true });
  await fs.writeFile(abs(file), serialize(value), "utf8");
};
const writeText = async (file, value) => {
  await fs.mkdir(path.dirname(abs(file)), { recursive: true });
  await fs.writeFile(abs(file), value.endsWith("\n") ? value : value + "\n", "utf8");
};
const ids = value => Array.isArray(value) ? value.map(item => typeof item === "string" ? item : item?.id).filter(Boolean) : [];
const basename = file => path.basename(file);

function collectCards(value, cards) {
  if (Array.isArray(value)) {
    for (const item of value) collectCards(item, cards);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (typeof value.id === "string" && (value.title || value.latin || value.taxonomy)) cards.set(value.id, value);
  for (const key of ["items", "cards", "species"]) if (Array.isArray(value[key])) collectCards(value[key], cards);
}

async function loadCards(manifestFile) {
  const manifest = await readJson(manifestFile);
  const base = path.dirname(manifestFile);
  const cards = new Map();
  for (const ref of manifest.files || []) {
    const file = String(ref).startsWith("data/") ? String(ref) : path.join(base, String(ref)).replaceAll("\\", "/");
    collectCards(await readJson(file), cards);
  }
  return cards;
}

const place = await readJson(PLACE_FILE);
assert.equal(place.id, PLACE_ID);
assert.ok(place.nature_profile);

const floraSources = new Map();
const faunaSources = new Map();
for (const mapFile of MAP_FILES) {
  const map = await readJson(mapFile);
  const entry = map.places?.[PLACE_ID];
  if (!entry) continue;
  for (const id of ids(entry.flora)) {
    if (!floraSources.has(id)) floraSources.set(id, new Set());
    floraSources.get(id).add(basename(mapFile));
  }
  for (const id of ids(entry.fauna)) {
    if (!faunaSources.has(id)) faunaSources.set(id, new Set());
    faunaSources.get(id).add(basename(mapFile));
  }
}

const floraCards = await loadCards("data/natur/flora/manifest.json");
const faunaCards = await loadCards("data/natur/fauna/manifest.json");
function inventoryEntry(id, sources, cards) {
  const card = cards.get(id);
  assert.ok(card, "Mangler artskort for " + id);
  const maps = [...sources].sort();
  return {
    id,
    name: card.title || card.taxonomy?.norsk_navn || id,
    latin: card.latin || card.taxonomy?.latin_navn || null,
    status: "aktiv_kartkobling",
    map: maps[0],
    maps
  };
}
const flora = [...floraSources.entries()].map(([id, sources]) => inventoryEntry(id, sources, floraCards));
const fauna = [...faunaSources.entries()].map(([id, sources]) => inventoryEntry(id, sources, faunaCards));
const total = flora.length + fauna.length;
assert.ok(total > 0, "Nøklevann mangler aktive kartarter");
assert.equal(new Set([...flora, ...fauna].map(item => item.id)).size, total);

place.nature_profile.species_inventory = {
  source_maps: MAP_FILES,
  flora,
  fauna,
  total_species: total,
  rule: "all_active_mapped_species_for_place"
};
const signature = Array.isArray(place.quiz_profile?.signature_features) ? place.quiz_profile.signature_features : [];
const feature = "skogkledde bredder med vannkant, fugleliv og sammenheng til Ljanselvas vassdrag";
if (!signature.includes(feature)) signature.push(feature);
place.quiz_profile = {
  ...place.quiz_profile,
  signature_features: signature,
  notes: "Knytt artsoppgaver til de " + flora.length + " aktive plantekortene og " + fauna.length + " aktive faunakortene i species_inventory. Andre arter skal ikke legges til uten ny dokumentasjon."
};

await writeJson(PLACE_FILE, place);
const sha256 = crypto.createHash("sha256").update(Buffer.from(serialize(place), "utf8")).digest("hex");
const split = await readJson(SPLIT_MANIFEST);
const splitEntry = split.places.find(item => item.id === PLACE_ID);
assert.ok(splitEntry, "Mangler Nøklevann i split-manifest");
splitEntry.sha256 = sha256;
split.generated_at = new Date().toISOString();
await writeJson(SPLIT_MANIFEST, split);

const test = `import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("${PLACE_FILE}");
const mapFiles = ${JSON.stringify(MAP_FILES)};
const flora = new Set();
const fauna = new Set();
for (const file of mapFiles) {
  const entry = read(file).places?.noklevann;
  for (const id of entry?.flora || []) flora.add(typeof id === "string" ? id : id.id);
  for (const id of entry?.fauna || []) fauna.add(typeof id === "string" ? id : id.id);
}
const inventory = place.nature_profile?.species_inventory;
test("Nøklevann inventory matches active nature maps", () => {
  assert.ok(inventory);
  assert.equal(inventory.rule, "all_active_mapped_species_for_place");
  assert.deepEqual([...new Set(inventory.flora.map(item => item.id))].sort(), [...flora].sort());
  assert.deepEqual([...new Set(inventory.fauna.map(item => item.id))].sort(), [...fauna].sort());
  assert.equal(inventory.total_species, flora.size + fauna.size);
  assert.ok(inventory.total_species > 0);
});
test("Nøklevann inventory entries expose names, latin and map evidence", () => {
  for (const item of [...inventory.flora, ...inventory.fauna]) {
    assert.ok(item.id);
    assert.ok(item.name);
    assert.ok(item.latin);
    assert.equal(item.status, "aktiv_kartkobling");
    assert.ok(Array.isArray(item.maps) && item.maps.length >= 1);
  }
  assert.ok(place.quiz_profile.signature_features.length >= 4);
});
`;
await writeText(TEST_FILE, test);
const report = [
  "# Nøklevann – aktivt artsinventar",
  "",
  "- Flora: **" + flora.length + "**",
  "- Fauna: **" + fauna.length + "**",
  "- Totalt: **" + total + "**",
  "- Kildekart: " + MAP_FILES.map(file => "`" + basename(file) + "`").join(", "),
  "- Regel: `all_active_mapped_species_for_place`",
  "",
  "Alle arts-ID-er finnes allerede som kanoniske kort. Det er ikke opprettet eller gjettet nye arter. Inventaret er eksakt union av de aktive Nøklevann-koblingene i Oslo-naturkartene."
].join("\n");
await writeText(REPORT_FILE, report);

for (const [command, args] of [["node", [TEST_FILE]], ["npx", ["tsx", "tools/validate_nature_maps.mts"]]]) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log("Nøklevann species_inventory OK:", flora.length, "flora +", fauna.length, "fauna =", total, "arter");
