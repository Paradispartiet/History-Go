import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

const mappingFiles = fs
  .readdirSync(path.join(ROOT, "data", "Civication", "map"))
  .filter((name) => /^historyGoPlaceMapping\..+\.json$/.test(name));
const approvedRetiredIds = new Set([
  "vulkan_murvegger",
  "hausmannsgate_aksen",
  "kolstadgata_toyen_vegger",
  "gronland_underganger",
  "nybrua_pilarrom",
  "schweigaards_gate_lodalen",
  "kuba_akselpassasjer",
  "grunerlokka_bakgardsvegger",
  "brenneriveien_ingens_gate",
]);

test("Civication-mappinger peker bare på aktive canonicale Places", () => {
  const places = new Map();
  for (const row of readJson("data/places/places_index.json")) {
    const data = readJson(`data/${row.sourceFile}`);
    const candidates = Array.isArray(data) ? data : Array.isArray(data.places) ? data.places : [data];
    const place = candidates.find((candidate) => String(candidate.id) === String(row.id));
    assert.ok(place, `${row.id}: sourceFile mangler canonical Place`);
    places.set(String(row.id), { ...place, __canonicalSourceFile: row.sourceFile });
  }

  for (const file of mappingFiles) {
    const data = readJson(`data/Civication/map/${file}`);
    for (const [mappingId, mapping] of Object.entries(data.mappings ?? {})) {
      const place = places.get(String(mapping.historyGoPlaceId));
      if (!place) {
        assert.equal(
          mapping.historyGoPlaceStatus,
          "retired_source_snapshot",
          `${file}/${mappingId}: ukjent historyGoPlaceId uten eksplisitt snapshot-status`,
        );
        assert.ok(
          approvedRetiredIds.has(String(mapping.historyGoPlaceId)),
          `${file}/${mappingId}: snapshot-ID er ikke godkjent`,
        );
        continue;
      }
      assert.equal(mapping.name, place.name, `${file}/${mappingId}: name`);
      assert.equal(mapping.lat, place.lat, `${file}/${mappingId}: lat`);
      assert.equal(mapping.lon, place.lon, `${file}/${mappingId}: lon`);
      assert.deepEqual(
        mapping.emne_ids ?? [],
        place.emne_ids ?? [],
        `${file}/${mappingId}: emne_ids`,
      );
      assert.ok(
        [data.sourceFile, place.__canonicalSourceFile].includes(mapping.historyGoSourceFile),
        `${file}/${mappingId}: historyGoSourceFile`,
      );
    }
  }
});

test("begge Civication-auditer bruker split-manifestets canonicale indeks", () => {
  for (const relativePath of [
    "scripts/audit-civication-historygo-place-mapping.mts",
    "scripts/audit-civication-city-map-entries.mts",
  ]) {
    const source = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
    assert.match(source, /PLACES_INDEX_FILE/);
    assert.doesNotMatch(
      source,
      /placesFile:\s*path\.join\(ROOT,\s*"data",\s*"places",/,
      `${relativePath} har fortsatt en slettet monolittisk Place-kilde`,
    );
  }
});
