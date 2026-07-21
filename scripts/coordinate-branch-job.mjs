#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const PLACE_ID = "hovedoya";
const PLACE_FILE = "data/places/natur/oslo/places_oslo_natur_hovedsteder/hovedoya.json";
const SPLIT_MANIFEST = "data/places/natur/oslo/places_oslo_natur_hovedsteder_manifest.json";
const TEST_FILE = "tests/hovedoya-mapped-species-inventory.test.js";
const REPORT_FILE = "reports/hovedoya-mapped-species-inventory.md";
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

async function loadCards(manifestFile) {
  const manifest = await readJson(manifestFile);
  const base = path.dirname(manifestFile);
  const cards = new Map();
  for (const ref of manifest.files || []) {
    const file = String(ref).startsWith("data/") ? String(ref) : path.join(base, String(ref)).replaceAll("\\", "/");
    const data = await readJson(file);
    const entries = Array.isArray(data) ? data : Array.isArray(data?.cards) ? data.cards : Array.isArray(data?.species) ? data.species : [];
    for (const card of entries) if (card?.id) cards.set(card.id, card);
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

function inventoryEntry(id, sourceSet, cards) {
  const card = cards.get(id);
  assert.ok(card, "Mangler artskort for " + id);
  const maps = [...sourceSet].sort();
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
assert.equal(flora.length, 21);
assert.equal(fauna.length, 1);
assert.equal(flora.length + fauna.length, 22);
assert.equal(new Set([...flora, ...fauna].map(item => item.id)).size, 22);

place.nature_profile.species_inventory = {
  source_maps: MAP_FILES,
  flora,
  fauna,
  total_species: 22,
  rule: "all_active_mapped_species_for_place"
};

const signature = Array.isArray(place.quiz_profile?.signature_features) ? place.quiz_profile.signature_features : [];
const geologyFeature = "kalkrik berggrunn med tørrbakker, skogholt og strandsoner";
if (!signature.includes(geologyFeature)) signature.push(geologyFeature);
place.quiz_profile = {
  ...place.quiz_profile,
  signature_features: signature,
  notes: "Knytt spørsmål om flora til de 21 aktive plantekortene i species_inventory. Stokkand er eneste aktive faunakort i denne kartunionen; andre arter skal ikke legges til uten ny dokumentasjon."
};

await writeJson(PLACE_FILE, place);
const placeBytes = Buffer.from(serialize(place), "utf8");
const sha256 = crypto.createHash("sha256").update(placeBytes).digest("hex");
const split = await readJson(SPLIT_MANIFEST);
const splitEntry = split.places.find(item => item.id === PLACE_ID);
assert.ok(splitEntry, "Mangler Hovedøya i split-manifest");
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
  const entry = read(file).places?.hovedoya;
  for (const id of entry?.flora || []) flora.add(typeof id === "string" ? id : id.id);
  for (const id of entry?.fauna || []) fauna.add(typeof id === "string" ? id : id.id);
}
const inventory = place.nature_profile?.species_inventory;
test("Hovedøya inventory matches active nature maps", () => {
  assert.ok(inventory);
  assert.equal(inventory.rule, "all_active_mapped_species_for_place");
  assert.deepEqual([...new Set(inventory.flora.map(item => item.id))].sort(), [...flora].sort());
  assert.deepEqual([...new Set(inventory.fauna.map(item => item.id))].sort(), [...fauna].sort());
  assert.equal(inventory.total_species, flora.size + fauna.size);
  assert.equal(inventory.total_species, 22);
  assert.equal(inventory.flora.length, 21);
  assert.equal(inventory.fauna.length, 1);
});
test("Hovedøya inventory entries expose names, latin and map evidence", () => {
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

const report = `# Hovedøya – aktivt artsinventar\n\n- Flora: **${flora.length}**\n- Fauna: **${fauna.length}**\n- Totalt: **${flora.length + fauna.length}**\n- Kildekart: ${MAP_FILES.map(file => "\`${basename(file)}\`").join(", ")}\n- Regel: \`all_active_mapped_species_for_place\`\n\nAlle arts-ID-er finnes allerede som kanoniske kort. Det er ikke opprettet eller gjettet nye arter. Inventaret er generert som eksakt union av de aktive Hovedøya-koblingene i Oslo-naturkartene.\n`;
await writeText(REPORT_FILE, report);

for (const [command, args] of [
  ["node", [TEST_FILE]],
  ["npx", ["tsx", "tools/validate_nature_maps.mts"]]
]) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log("Hovedøya species_inventory OK: 21 flora + 1 fauna = 22 arter");
