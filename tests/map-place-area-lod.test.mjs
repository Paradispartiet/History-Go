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

test("kartets detalj-LOD bruker canonical area_anchor og zoom 12", () => {
  assert.match(source, /PLACE_DETAIL_MIN_ZOOM\s*=\s*12/);
  assert.match(source, /coordRole === "area_anchor"/);
  assert.match(source, /coordType === "district_anchor"/);
  assert.match(source, /isAreaPlace:\s*isAreaPlace\(p\) \? 1 : 0/);
  assert.match(source, /\[">=", \["zoom"\], PLACE_DETAIL_MIN_ZOOM\]/);
  assert.match(source, /\["==", \["get", "isAreaPlace"\], 1\]/);
});

test("samme LOD-filter beskytter prikk, halo, label og klikkeflate", () => {
  for (const layer of ["L_GLOW", "L_DOTS", "L_LAB", "L_HIT"]) {
    const pattern = new RegExp(`id: ${layer},\\n\\s*filter: PLACE_ZOOM_LOD_FILTER`);
    assert.match(source, pattern, `mangler LOD-filter på ${layer}`);
  }
});

test("område-Places i dagens data har canonical area_anchor", () => {
  const sagene = json("data/places/by/oslo/places/sagene.json");
  const torshov = json("data/places/by/oslo/places/torshov.json");
  const son = json("data/places/by/akershus/son_ladested/son_ladested.json");
  assert.equal(sagene.coordRole, "area_anchor");
  assert.equal(torshov.coordRole, "area_anchor");
  assert.equal(son.coordRole, "area_anchor");
});

test("TypeScript source og begge committed runtime-builds inneholder område-LOD", () => {
  for (const [name, code] of [["source", source], ["legacy", legacy], ["dist", dist]]) {
    assert.match(code, /isAreaPlace/ , `${name}: mangler isAreaPlace`);
    assert.match(code, /PLACE_DETAIL_MIN_ZOOM|place_detail_min_zoom|12/, `${name}: mangler detaljzoom`);
  }
});
