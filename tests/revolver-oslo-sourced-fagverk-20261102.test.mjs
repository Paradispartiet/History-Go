import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const source = read("data/places/subkultur/oslo/places_subkultur/revolver_oslo.json");
const runtime = read("data/runtime/place-open/revolver_oslo.json");
const registry = read("data/fagverk/fagverk_registry.json");

test("Revolver identity, location and existing category are preserved", () => {
  assert.equal(source.id, "revolver_oslo");
  assert.equal(source.category, "musikk");
  assert(source.secondaryBadgeIds.includes("subkultur"));
  assert.equal(source.address.number, "32B");
  assert.equal(source.coordSourceId, "geonorge-adresser-v1:0301:14943:32B");
  assert.equal(source.lat, 59.91699988365845);
  assert.equal(source.lon, 10.749742822662785);
  assert.equal(source.year, 2007);
});
test("Revolver has sourced editorial history rather than production instructions", () => {
  assert(source.desc.includes("2007"));
  assert(source.desc.includes("Nordhagen"));
  assert(source.popupDesc.includes("Ball'Em Up"));
  assert(source.popupDesc.includes("26. mai 2021"));
  assert(!/I History Go|Spørsmål bør|quizprofil|metaformulering/i.test(source.popupDesc));
  const links = source.externalLinks.map((l) => l.url);
  assert(links.some((x) => x.includes("subjekt.no/2017/")));
  assert(links.some((x) => x.includes("osloworld.no/")));
  assert(links.some((x) => x.includes("oslonytt.com/")));
  assert(links.some((x) => x.includes("virksomhet.brreg.no/")));
});
test("Dedicated curated Fagverk and canonical chapters are registered", () => {
  const f = source.fagverk;
  assert.equal(f.schema, "history_go_place_fagverk_v2");
  assert.equal(f.status, "curated");
  assert.equal(f.article.length, 3);
  assert.equal(f.lenses.length, 3);
  assert(f.article.every((x) => x.length > 300));
  assert(f.source_urls.length >= 6);
  assert(f.chapter_ids.includes("historisk-musikkvitenskap-historiografi"));
  assert(f.chapter_ids.includes("institusjoner-okonomi-politikk-offentlighet"));
  const link = registry.placeLinks.revolver_oslo;
  assert.equal(link.sourceFile, "places/subkultur/oslo/places_subkultur/revolver_oslo.json");
  assert.equal(link.field, "fagverk");
  assert.equal(link.status, "curated");
});
test("Published Place-open content matches canonical data", () => {
  assert.equal(runtime.place.id, source.id);
  for(const key of ["desc", "popupDesc", "externalLinks", "fagverk"]) {
    assert.deepEqual(runtime.place[key], source[key]);
  }
});
