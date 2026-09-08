import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const j = p => JSON.parse(fs.readFileSync(p, "utf8"));

test("Gamle Deichman place metadata", () => {
  const p = j("data/places/litteratur/oslo/places_litteratur/gamle_deichman.json");
  assert.equal(p.production_status, "complete");
  assert.deepEqual(p.address, { street: "Arne Garborgs plass", number: "4", postcode: "0179", city: "Oslo", country: "NO" });
  assert.equal(p.lat, 59.91655515223004);
  assert.equal(p.lon, 10.74636730347388);
});

test("Gamle Deichman PlaceCard and Fagverk", () => {
  const p = j("data/places/litteratur/oslo/places_litteratur/gamle_deichman.json");
  assert.deepEqual(p.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.equal(p.fagverk.lenses.length, 5);
  assert.equal(p.fagverk.guiding_questions.length, 6);
  assert.equal(p.fagverk.concepts.length, 12);
  assert.equal(p.fagverk.observable_traces.length, 3);
});

test("Gamle Deichman quiz contract", () => {
  const q = j("data/quiz/litteratur/gamle_deichman.json");
  assert.equal(q.sets.length, 5);
  assert.deepEqual(q.sets.map(s => s.questions.length), [7, 7, 7, 7, 7]);
  const qq = q.sets.flatMap(s => s.questions);
  assert.equal(qq.length, 35);
  const qc = qq.reduce((m, x) => (m[x.question_type] = (m[x.question_type] || 0) + 1, m), {});
  assert.deepEqual(qc, { fact: 21, context: 7, concept: 7 });
});

test("Gamle Deichman language Lesespor and chronology", () => {
  const lang = j("data/leksikon/sprak/places/europe/norway/oslo/gamle-deichman.json");
  assert.equal(lang.entries.length, 6);
  const lesDoc = j("data/lesespor/oslo/lesespor_oslo_litteratur.json");
  const lesItems = Array.isArray(lesDoc) ? lesDoc : lesDoc.items;
  assert.ok(Array.isArray(lesItems));
  const les = lesItems.filter(x => x.place_ids?.includes("gamle_deichman"));
  assert.equal(les.length, 4);
  const leks = j("data/leksikon/places/oslo/litteratur/leksikon_gamle_deichman.json");
  assert.equal(leks[0].chronology.length, 7);
});

test("Gamle Deichman quality report", () => {
  assert.equal(j("reports/place-production/gamle-deichman-phase1-24-gate-audit-v1.json").quality_score.total, 30);
});

test("Gamle Deichman runtime hydration", () => {
  const runtime = j("data/runtime/place-open/gamle_deichman.json");
  assert.ok(runtime.language);
  assert.ok(runtime.leksikon.length >= 1);
  assert.equal(runtime.lesespor.length, 4);
});

test("Gamle Deichman runtime People", () => {
  const runtime = j("data/runtime/place-open/gamle_deichman.json");
  const ids = new Set(runtime.people.map(x => x.id));
  for (const id of ["carl_deichman", "nils_reiersen", "axel_revold"]) assert.ok(ids.has(id), id);
  for (const id of ["vogt", "andersen", "krag", "obstfelder", "hamsun", "garborg", "christian_norberg_schulz", "rolf_stenersen", "institusjonen_fritt_ord", "eckbos_legat"]) assert.ok(!ids.has(id), id);
});

test("Gamle Deichman image assets", () => {
  const p = j("data/places/litteratur/oslo/places_litteratur/gamle_deichman.json");
  assert.ok(fs.existsSync("bilder/QuizCards/Gamle_Deichman.webp"));
  assert.ok(fs.existsSync(p.frontImage));
});
