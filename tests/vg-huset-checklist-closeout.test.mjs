import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const load = path => JSON.parse(fs.readFileSync(path, "utf8"));
const path = "data/places/media/oslo/places_oslo_media/vg_huset.json";
const place = load(path);
const factual = load("data/places/production/vg_huset.json");
const workflow = load("data/places/workflow/vg_huset.json");
const registry = load("data/fagverk/fagverk_registry.json");
const index = load("data/places/places_index.json");
const runtime = load("data/runtime/place-open/vg_huset.json");
const sets = load("data/quiz/media/vg_huset_sets.json");
const allReading = load("data/lesespor/oslo/lesespor_oslo_media.json");
const reading = allReading.items.filter(item => item.place_ids?.includes("vg_huset"));

test("VG-huset represents the 1994 physical building, not the 1945 newspaper", () => {
  assert.equal(place.id, "vg_huset");
  assert.equal(place.year, 1994);
  assert.equal(factual.metadataSnapshot.year, 1994);
  assert.match(factual.identity.represents, /1994/);
  assert.match(place.fagverk.intro, /1944/);
  assert.match(place.fagverk.intro, /1945/);
  assert.match(place.fagverk.intro, /1994/);
  assert.equal(runtime.place.year, 1994);
  const placeIndex = Array.isArray(index) ? index.find(item => item.id === "vg_huset")
    : (index.places || index.items || []).find(item => item.id === "vg_huset");
  assert.equal(placeIndex?.year, 1994, "places_index must reflect corrected year");
});

test("VG-huset Fagverk is curated, indexed, and grounded in direct sources", () => {
  const f = place.fagverk;
  assert.equal(f.level, "full");
  assert.equal(f.status, "curated");
  assert.equal(runtime.place.fagverk.status, "curated");
  assert.equal(registry.placeLinks.vg_huset.status, "curated");
  assert.ok(f.article.length >= 5);
  assert.ok(f.lenses.length >= 3 && f.lenses.length <= 5);
  assert.ok(f.guiding_questions.length >= 4);
  assert.ok(f.observable_traces.length >= 2);
  assert.ok(f.source_urls.length >= 4);
  const sources = new Set(place.externalLinks.map(link => link.url));
  assert.ok(f.source_urls.every(url => sources.has(url)), "each Fagverk source has a named visible link");
});

test("all four selected VG-huset collections have real members and previews", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.deepEqual(runtime.place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.equal(runtime.people.length, 5);
  assert.ok(runtime.people.every(person => person.image || person.imageCard || person.cardImage));
  assert.equal(runtime.place.objects.length, 1);
  assert.equal(runtime.place.productions.length, 1);
  assert.ok(runtime.brands.some(brand => brand.id === "vg"));
  for (const type of ["people", "objects", "brands", "productions"]) {
    assert.equal(workflow.collections[type].status, "PASS");
  }
});

test("quiz and reading tracks are materialized; conditional modules have explicit decisions", () => {
  assert.equal(sets.sets.length, 4);
  assert.deepEqual(sets.sets.map(set => set.questions.length), [7, 7, 7, 7]);
  assert.equal(workflow.modules.quiz.status, "PASS");
  assert.equal(workflow.modules.quizcard.status, "PASS");
  assert.equal(reading.length, 5);
  assert.equal(runtime.lesespor.length, 5);
  assert.deepEqual(runtime.lesespor.map(item => item.id), reading.map(item => item.id));
  assert.equal(workflow.modules.reading_tracks.status, "PASS");
  for (const type of ["before_after", "news"]) {
    assert.equal(workflow.modules[type].status, "BEGRUNNET_NA");
    assert.ok(workflow.modules[type].reason.length > 30);
  }
});

test("V3 workflow requires documented visual evidence to complete", () => {
  assert.equal(workflow.schema, "history_go_place_production_workflow_v3");
  assert.equal(workflow.profile.id, "major");
  assert.equal(workflow.manual_reviews.final_ui.status, "PASS");
  assert.equal(workflow.state, "complete");
  assert.deepEqual(workflow.blockers, []);
  assert.match(workflow.manual_reviews.final_ui.evidence, /screenshot-based/i);
  assert.match(workflow.manual_reviews.final_ui.evidence, /not native Safari/i);
  const visualReport = "reports/place-production/vg-huset-final-ui-review-20261010.md";
  const visualData = "reports/visual-qa/vg-huset/20261010/visual-audit.json";
  assert.ok(fs.existsSync(visualReport));
  const evidence = load(visualData);
  assert.deepEqual(evidence.profiles.map((profile) => profile.profile), ["mobile", "ipad", "desktop"]);
  assert.ok(evidence.profiles.every((profile) =>
    profile.issues.length === 0
      && profile.pageErrors.length === 0
      && profile.popups.length === 4
      && profile.fagverkPage?.unfinished?.hidden === true
      && profile.fagverkPage?.coverageLabel === "KURATERT STEDSFAGVERK"
  ));
  const workcard = load("reports/place-production/vg-huset-workcard-current.json");
  const quality = load("reports/place-production/vg-huset-quality-gate-current.json");
  assert.equal(workcard.state, "complete");
  assert.equal(quality.derived_state, "complete");
});
