import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const json = path => JSON.parse(read(path));
const text = value => String(value == null ? "" : value).trim();

const runtime = read("js/ui/sprakatlas-map-experience-v3.js");
const config = read("js/config.js");
const language = read("js/ui/place-language-layer.js");
const docs = read("docs/SPRAKATLAS_MAP_EXPERIENCE_V3.md");
const workflow = read(".github/workflows/language-layer-checks.yml");
const manifest = json("data/leksikon/sprak/manifest.json");
const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");

test("Språkatlas map v3 is paced directly after the canonical language layer", () => {
  assert.match(
    config,
    /js\/ui\/place-language-layer\.js[\s\S]{0,120}js\/ui\/sprakatlas-map-experience-v3\.js[\s\S]{0,120}js\/ui\/place-popup-direct-tabs\.js/
  );
  assert.match(runtime, /HGMap\?\.getMap/);
  assert.match(runtime, /maplibregl\?\.Marker/);
  assert.match(runtime, /HGMapView\?\.openPlace/);
  assert.match(runtime, /HGMapView\?\.showMap/);
  assert.match(runtime, /map\.flyTo/);
  assert.match(runtime, /map\.fitBounds/);
});

test("v3 derives marker rows only from explicit canonical atlas relations", () => {
  assert.match(runtime, /if \(kind === "local"\) return list\(row\?\.localIds\)\.includes\(id\)/);
  assert.match(runtime, /if \(kind === "region"\) return list\(row\?\.regionIds\)\.includes\(id\)/);
  assert.match(runtime, /row\?\.place\?\.lon \?\? row\?\.place\?\.lng/);
  assert.doesNotMatch(runtime, /nearest|haversine|distanceTo|geograph.*infer|region.*contains.*coordinate/i);
  assert.match(language, /host\.dataset\.atlasPlaceSelection = selectionId/);
  assert.match(runtime, /data-atlas-place-selection/);
  assert.match(runtime, /MutationObserver/);
});

test("documented_seed profiles remain outside explicit product Place links", () => {
  const linkedLocalIds = new Set();
  for (const relative of Object.values(manifest.place_files || {})) {
    const article = json(relative);
    for (const id of article.atlas_local_ids || []) linkedLocalIds.add(text(id));
  }

  const seeds = (atlas.local_varieties || []).filter(row => row.profile_status === "documented_seed");
  assert.ok(seeds.length >= 1, "expected documented_seed research queue");
  for (const seed of seeds) {
    assert.equal(
      linkedLocalIds.has(text(seed.id)),
      false,
      `${seed.id}: documented_seed must not gain an inferred Place link`
    );
  }
});

test("the existing accessible atlas list remains canonical navigation and gains a map action", () => {
  assert.match(language, /data-atlas-open-place/);
  assert.match(language, /HGMapView\?\.openPlace/);
  assert.match(runtime, /data-sprakatlas-show-map/);
  assert.match(runtime, /Vis stedet på kartet/);
  assert.match(runtime, /steder på kartet/);
  assert.match(docs, /Språkatlas → kartopplevelse v3/);
  assert.match(docs, /HGMapView\.openPlace\(\)/);
});

test("language CI owns v3 syntax and regression checks", () => {
  assert.match(workflow, /js\/ui\/sprakatlas-map-experience-v3\.js/);
  assert.match(workflow, /node --check js\/ui\/sprakatlas-map-experience-v3\.js/);
  assert.match(workflow, /tests\/sprakatlas-map-v3\.test\.mjs/);
});
