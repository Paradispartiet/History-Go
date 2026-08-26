import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { buildEpokePlaceIndex, geographyForPlace, serializeEpokePlaceIndex } from "../scripts/build-epoke-place-index.mjs";

test("generated epoch-place index is deterministic and current", () => {
  const index = buildEpokePlaceIndex();
  assert.equal(
    fs.readFileSync("data/epoker/epoke-place-index.json", "utf8"),
    serializeEpokePlaceIndex(index)
  );
  assert.equal(index.contract, "source-backed-history-coverage-v1");
  assert.equal(index.version, 4);
  assert.equal(index.locations.contract, "canonical-place-geography-v1");
  assert.equal(index.stats.canonical_claim_count, 315);
  assert.equal(index.stats.canonical_source_count, 256);
  assert.equal(index.stats.place_evidence_link_count, 325);
  assert.equal(index.stats.period_case_count, 9);
});

test("canonical place geography separates Oslo, Lisboa and other countries deterministically", () => {
  const index = buildEpokePlaceIndex();
  assert.deepEqual(index.locations.places.torggata, {
    country_id: "no", country_label: "Norge", city_id: "oslo", city_label: "Oslo", source: "canonical_source_path"
  });
  assert.deepEqual(index.locations.places.lisbon_city, {
    country_id: "pt", country_label: "Portugal", city_id: "lisboa", city_label: "Lisboa", source: "canonical_source_path"
  });
  assert.deepEqual(index.locations.places.wembley_stadium_london, {
    country_id: "gb", country_label: "Storbritannia", city_id: "london", city_label: "London", source: "canonical_source_path"
  });
  assert.equal(index.stats.located_place_count, index.stats.canonical_place_count);
  assert.ok(index.stats.city_located_place_count >= 850);
  assert.deepEqual(index.locations.unknown_place_ids, []);

  assert.deepEqual(geographyForPlace({ id: "unknown", sourceFile: "places/custom/unknown.json" }), {
    country_id: "", country_label: "", city_id: "", city_label: "", source: "unknown"
  });
});

test("history index supports multi-epoch places without changing primary categories", () => {
  const index = buildEpokePlaceIndex();
  const epochs = index.domains.historie.epochs;
  const memberships = new Map();
  const categories = new Set();
  for (const [epochId, group] of Object.entries(epochs)) {
    for (const place of group.places) {
      categories.add(place.category);
      const ids = memberships.get(place.place_id) || [];
      ids.push(epochId);
      memberships.set(place.place_id, ids);
    }
  }
  assert.ok(index.stats.indexed_place_count >= 120, "expected the canonical place-evidence corpus to be materialized");
  assert.ok([...memberships.values()].some((ids) => ids.length >= 3), "a place may carry evidence in several periods");
  assert.ok(categories.size >= 3, "History must include places from several unchanged primary categories");
});

test("every indexed milestone is dated, inspectable and sourced from an approved canonical evidence lane", () => {
  const index = buildEpokePlaceIndex();
  const allowedTypes = new Set(["leksikon_chronology", "canonical_place_claim"]);
  for (const group of Object.values(index.domains.historie.epochs)) {
    for (const place of group.places) {
      assert.ok(place.source_file.startsWith("places/"), `primary source file missing for ${place.place_id}`);
      for (const milestone of place.milestones) {
        assert.ok(Number.isFinite(milestone.year), `${place.place_id}:${milestone.id} must be dated`);
        assert.ok(
          milestone.source_file.startsWith("data/leksikon/") || milestone.source_file.startsWith("data/fag/historie/"),
          `${place.place_id}:${milestone.id} must point to canonical History evidence`
        );
        assert.ok(allowedTypes.has(milestone.evidence_type), `${place.place_id}:${milestone.id} has an unknown evidence type`);
        assert.ok(milestone.sources.length > 0, `${place.place_id}:${milestone.id} must have a source`);
        assert.ok(milestone.sources.every((source) => /^https?:\/\//.test(source.url)));
        if (milestone.evidence_type === "canonical_place_claim") assert.ok(milestone.claim_id, `${place.place_id}:${milestone.id} lacks claim id`);
      }
    }
  }
});

test("every epoch and parallel track has substantial canonical place coverage", () => {
  const index = buildEpokePlaceIndex();
  for (const [epochId, group] of Object.entries(index.domains.historie.epochs)) {
    assert.ok(group.placeCount >= 15, `${epochId} has insufficient place coverage`);
    assert.ok(group.milestoneCount >= 30, `${epochId} has insufficient milestone coverage`);
  }
  for (const [trackId, group] of Object.entries(index.domains.historie.parallel_tracks)) {
    assert.ok(group.placeCount >= 10, `${trackId} has insufficient cross-period place coverage`);
    assert.ok(group.milestoneCount >= 30, `${trackId} has insufficient cross-period milestone coverage`);
  }
  const modules = JSON.parse(fs.readFileSync("data/fag/historie/period_modules_historie_v1.json", "utf8"));
  const sourceById = new Map(modules.sources.map((source) => [source.source_id, source]));
  const placeIds = new Set(JSON.parse(fs.readFileSync("data/places/places_index.json", "utf8")).map((place) => place.id));
  assert.ok(modules.cases.every((periodCase) => placeIds.has(periodCase.place_id)));
  assert.ok(modules.cases.every((periodCase) => periodCase.source_ids.length >= 2 && periodCase.source_ids.every((id) => /^https?:\/\//.test(sourceById.get(id)?.url || ""))));
  assert.ok(modules.cases.some((periodCase) => periodCase.place_id === "lisbon_teatro_romano"), "Lisboa's canonical Roman Theatre case must remain in Fagverk coverage");
  const materializedCases = Object.values(index.domains.historie.epochs).flatMap((group) => group.places.flatMap((place) => (
    place.period_cases.map((periodCase) => ({ place_id: place.place_id, ...periodCase }))
  )));
  assert.ok(materializedCases.length >= modules.cases.length);
  assert.ok(materializedCases.every((periodCase) => !("year" in periodCase)), "undated Fagverk cases must not receive invented years");
  assert.ok(materializedCases.every((periodCase) => periodCase.sources.length >= 2 && periodCase.sources.every((source) => /^https?:\/\//.test(source.url))));
  assert.ok(materializedCases.some((periodCase) => periodCase.place_id === "lisbon_teatro_romano"));
});

test("epoch places expose existing source-inspectable people, works and stories without copying popup prose", () => {
  const index = buildEpokePlaceIndex();
  assert.ok(index.stats.connected_people_count >= 30);
  assert.ok(index.stats.connected_work_count >= 90);
  assert.ok(index.stats.connected_story_count >= 100);
  const uniquePlaces = [...new Map(Object.values(index.domains.historie.epochs).flatMap((group) => group.places).map((place) => [place.place_id, place])).values()];
  assert.ok(uniquePlaces.some((place) => place.connections.person_ids.length));
  assert.ok(uniquePlaces.some((place) => place.connections.works.length));
  assert.ok(uniquePlaces.some((place) => place.connections.stories.length));
  const peopleManifest = JSON.parse(fs.readFileSync("data/runtime/people-all.json", "utf8"));
  const canonicalPeopleIds = new Set(peopleManifest.files.flatMap((file) => (
    JSON.parse(fs.readFileSync(file, "utf8")).map((person) => person.id)
  )));
  assert.ok(uniquePlaces.every((place) => place.connections.person_ids.every((id) => canonicalPeopleIds.has(id))));
});

test("parallel tracks remain separate cross-period relations", () => {
  const index = buildEpokePlaceIndex();
  const history = JSON.parse(fs.readFileSync("data/epoker/epoker_historie.json", "utf8"));
  assert.deepEqual(
    Object.keys(index.domains.historie.parallel_tracks).sort(),
    history.parallel_epoker.map((track) => track.id).sort()
  );
  assert.ok(Object.values(index.domains.historie.parallel_tracks).some((track) => track.milestoneCount > 0));
  assert.equal(Object.keys(index.domains.historie.epochs).length, history.epoker.length);
});

test("every History epoch has distinct analysis grounded in its Fagverk periods", () => {
  const history = JSON.parse(fs.readFileSync("data/epoker/epoker_historie.json", "utf8"));
  const periodGuides = JSON.parse(fs.readFileSync("data/fag/historie/period_guides_historie_v1.json", "utf8"));
  const guideById = new Map(periodGuides.guides.map((guide) => [guide.period_id, guide]));
  const prose = new Set();
  for (const epoch of history.epoker) {
    const analysis = epoch.analysis;
    assert.ok(analysis, `${epoch.id} lacks analysis`);
    for (const field of ["what_changed", "what_continued", "power_and_conflict", "visible_traces"]) {
      assert.ok(String(analysis[field] || "").length >= 80, `${epoch.id}.${field} is too shallow`);
      const normalized = analysis[field].toLowerCase().replace(/[^a-zæøå0-9]+/g, " ").trim();
      assert.equal(prose.has(normalized), false, `${epoch.id}.${field} duplicates another epoch`);
      prose.add(normalized);
    }
    assert.ok(Array.isArray(analysis.guiding_questions) && analysis.guiding_questions.length >= 2);
    const linkedPeriods = new Set((epoch.fagverk_links || []).flatMap((link) => link.period_ids || []));
    assert.ok(analysis.basis_period_ids.every((periodId) => linkedPeriods.has(periodId)), `${epoch.id} has an unlinked analysis basis`);
    for (const periodId of linkedPeriods) {
      const guide = guideById.get(periodId);
      assert.ok(guide, `${epoch.id} references missing period guide ${periodId}`);
      assert.equal(guide.editorial_status, "complete");
      assert.ok(guide.sections.length >= 3 && guide.sections.flatMap((section) => section.paragraphs).length >= 6, `${periodId} lacks full overview prose`);
      assert.ok(guide.core_concepts.length >= 8);
    }
  }
});
