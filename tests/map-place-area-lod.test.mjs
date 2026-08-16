import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const json = relative => JSON.parse(read(relative));

const source = read("js/map.ts");
const legacy = read("js/map.js");
const dist = read("dist/web/map.js");

test("kartets detalj-LOD bruker canonical placeScope=area og zoom 12", () => {
  assert.match(source, /PLACE_DETAIL_MIN_ZOOM\s*=\s*12/);
  assert.match(source, /PLACE_SCOPE_AREA\s*=\s*"area"/);
  assert.match(source, /place\?\.placeScope/);
  assert.match(source, /isAreaPlace:\s*isAreaPlace\(p\) \? 1 : 0/);
  assert.match(source, /\[">=", \["zoom"\], PLACE_DETAIL_MIN_ZOOM\]/);
  assert.match(source, /\["==", \["get", "isAreaPlace"\], 1\]/);

  const areaFn = source.match(/function isAreaPlace\(place\) \{[\s\S]*?\n  \}/)?.[0] || "";
  assert.match(areaFn, /placeScope/);
  assert.doesNotMatch(areaFn, /coordRole|coordType|area_anchor|district_anchor/);
});

test("samme LOD-filter beskytter prikk, halo, label og klikkeflate", () => {
  for (const layer of ["L_GLOW", "L_DOTS", "L_LAB", "L_HIT"]) {
    const pattern = new RegExp(`id: ${layer},\\n\\s*filter: PLACE_ZOOM_LOD_FILTER`);
    assert.match(source, pattern, `mangler LOD-filter på ${layer}`);
  }
});

test("eksplisitte område-Places har placeScope, mens geometriske area_anchor ikke arver scope", () => {
  const manifest = json("data/places/manifest.json");
  const byId = new Map();
  for (const rel of manifest.files || []) {
    const file = path.join(root, "data", rel);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const items = Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : [data];
    for (const place of items) {
      if (place?.id) byId.set(place.id, place);
    }
  }
  const getPlace = id => {
    const place = byId.get(id);
    assert.ok(place, `mangler Place ${id} i canonical manifest`);
    return place;
  };

  for (const id of ["sagene", "lisbon_alfama", "son_ladested", "etnesjoen_tettstad", "svartlamon_trondheim"]) {
    assert.equal(getPlace(id).placeScope, "area", `${id}: mangler canonical area scope`);
  }
  assert.notEqual(getPlace("st_hanshaugen_park").placeScope, "area", "park med area_anchor skal ikke bli område-Place automatisk");
  assert.notEqual(getPlace("radhusplassen").placeScope, "area", "torg/plass med area_anchor skal ikke bli område-Place automatisk");
});

test("permanent scope-audit låser semantikk uten områdekvote", () => {
  const audit = read("scripts/audit-place-scope.mjs");
  assert.match(audit, /placeScope/);
  assert.match(audit, /district_anchor/);
  assert.match(audit, /boligomrade/);
  assert.match(audit, /ladested/);
  assert.doesNotMatch(audit, /minimum|min_count|quota/i);
});

test("TypeScript source og begge committed runtime-builds inneholder område-LOD", () => {
  for (const [name, code] of [["source", source], ["legacy", legacy], ["dist", dist]]) {
    assert.match(code, /isAreaPlace/, `${name}: mangler isAreaPlace`);
    assert.match(code, /placeScope/, `${name}: mangler canonical placeScope`);
    assert.match(code, /PLACE_DETAIL_MIN_ZOOM|12/, `${name}: mangler detaljzoom`);
  }
});
