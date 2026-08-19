#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const source = execFileSync("git", ["show", "HEAD^:scripts/coordinate-branch-job.mjs"], { cwd: root, encoding: "utf8" });
const startMarker = 'tests = appendUnique(tests, "Språkatlas → Steder bruker canonical språkfiler", `';
const endMarker = 'writeText("tests/place-language-dialect-scope.test.mjs", tests);';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error("Could not locate Språkatlas test-template block");

const lines = [
  'tests = appendUnique(tests, "Språkatlas → Steder bruker canonical språkfiler", [',
  '  "",',
  '  "test(\\\"Språkatlas → Steder bruker canonical språkfiler og area-Places uten parallell koblingsdatabase\\\", () => {",',
  '  "  const atlas = json(\\\"data/leksikon/sprak/norge_atlas_v1.json\\\");",',
  '  "  const schema = json(\\\"data/leksikon/sprak/schema_v2.json\\\");",',
  '  "  const places = loadPlacesById();",',
  '  "  const localIds = new Set((atlas.local_varieties || []).map(row => text(row.id)));",',
  '  "  assert.equal(schema.properties.atlas_local_ids.type, \\\"array\\\");",',
  '  "  assert.equal(schema.properties.atlas_local_ids.uniqueItems, true);",',
  '  "  const expected = new Map([[\\\"bergen\\\", \\\"Bergen\\\"], [\\\"valle_setesdal\\\", \\\"Valle i Setesdal\\\"], [\\\"narvik\\\", \\\"Narvik\\\"], [\\\"aal\\\", \\\"Ål\\\"]]);",',
  '  "  for (const [placeId, name] of expected) {",',
  '  "    const place = places.get(placeId);",',
  '  "    assert.ok(place, placeId + \\\": nytt canonical område-Place mangler\\\");",',
  '  "    assert.equal(place.name, name);",',
  '  "    assert.equal(place.placeScope, \\\"area\\\", placeId + \\\": talemålsanker må være area-Place\\\");",',
  '  "    assert.equal(place.category, \\\"by\\\");",',
  '  "    assert.equal(place.coordStatus, \\\"verified_geometry\\\");",',
  '  "    assert.equal(place.coordRole, \\\"area_anchor\\\");",',
  '  "    assert.equal(place.sourceProvider, \\\"official_address\\\");",',
  '  "    assert.equal(place.geocodeAccuracy, \\\"semantic_anchor\\\");",',
  '  "    assert.match(text(place.coordNote), /representativt områdeanker/i);",',
  '  "    assert.match(text(place.coordNote), /ikke en påstått.*grense/i);",',
  '  "    const relative = languageManifest.place_files?.[placeId];",',
  '  "    assert.ok(relative, placeId + \\\": Språkleksikon-fil mangler i manifestet\\\");",',
  '  "    const article = json(relative);",',
  '  "    assert.equal(article.atlas_local_ids?.length, 1, placeId + \\\": skal peke til én lokal atlasprofil\\\");",',
  '  "    assert.ok(localIds.has(article.atlas_local_ids[0]), placeId + \\\": ukjent atlas_local_id\\\");",',
  '  "    const profile = (atlas.local_varieties || []).find(row => row.id === article.atlas_local_ids[0]);",',
  '  "    assert.equal(profile?.profile_status, \\\"evidence_materialized\\\", placeId + \\\": Place skal ikke materialiseres fra tynn lokalprofil\\\");",',
  '  "    assert.ok((article.entries || []).length >= 4, placeId + \\\": trenger minst fire kildebelagte språkspor\\\");",',
  '  "    for (const entry of article.entries || []) {",',
  '  "      assert.equal(entry.layer, \\\"dialect\\\");",',
  '  "      assert.ok((entry.sources || []).length >= 2, entry.id + \\\": trenger minst to kilder\\\");",',
  '  "    }",',
  '  "  }",',
  '  "  for (const [placeId, relative] of Object.entries(languageManifest.place_files || {})) {",',
  '  "    const article = json(relative);",',
  '  "    for (const localId of article.atlas_local_ids || []) {",',
  '  "      assert.ok(localIds.has(localId), relative + \\\": atlas_local_ids peker til ukjent profil \\\" + localId);",',
  '  "      const place = places.get(placeId);",',
  '  "      assert.ok(place, relative + \\\": koblet Place mangler\\\");",',
  '  "      if ((article.entries || []).some(entry => isDialectEntry(entry, article))) assert.equal(place.placeScope, \\\"area\\\", relative + \\\": dialektkoblet Place må være area\\\");",',
  '  "    }",',
  '  "  }",',
  '  "});",',
  '  "",',
  '  "test(\\\"Språkatlas og PlaceCard har toveis navigasjon med ufullstendighetsvern\\\", () => {",',
  '  "  const runtime = read(\\\"js/ui/place-language-layer.js\\\");",',
  '  "  const buildIndex = read(\\\"tools/build_places_index.mts\\\");",',
  '  "  const placeType = read(\\\"schemas/place.ts\\\");",',
  '  "  assert.match(runtime, /function\\\\s+loadAtlasPlaceIndex\\\\s*\\\\(/);",',
  '  "  assert.match(runtime, /data-atlas-open-place/);",',
  '  "  assert.match(runtime, /HGMapView\\\\?\\\\.openPlace/);",',
  '  "  assert.match(runtime, /data-atlas-jump-local/);",',
  '  "  assert.match(runtime, /Se talemålet i Språkatlas/);",',
  '  "  assert.match(runtime, /Utforsk steder med dokumenterte språkspor/);",',
  '  "  assert.match(runtime, /Listen er ikke komplett/);",',
  '  "  assert.match(runtime, /ikke et kart over hvor talemålet finnes/);",',
  '  "  assert.match(buildIndex, /\\\'placeScope\\\'/, \\\"places_index må bevare area-eierskap i runtime\\\");",',
  '  "  assert.match(placeType, /placeScope\\\\?:\\\\s*string/);",',
  '  "});",',
  '  ""',
  '].join("\\n"));',
  ''
];
const safeTestBlock = lines.join("\n");
const fixed = source.slice(0, start) + safeTestBlock + source.slice(end);
const tempPath = path.join(root, "scripts", ".sprakatlas-place-links-generated.mjs");
fs.writeFileSync(tempPath, fixed, "utf8");
try {
  await import(pathToFileURL(tempPath).href + "?run=" + Date.now());
} finally {
  fs.rmSync(tempPath, { force: true });
}
