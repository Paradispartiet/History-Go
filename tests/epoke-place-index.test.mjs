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
  assert.equal(index.contract, "source-backed-dated-leksikon-chronology");
  assert.equal(index.version, 3);
  assert.equal(index.locations.contract, "canonical-place-geography-v1");
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
  assert.ok(index.stats.indexed_place_count >= 40, "expected a meaningful source-backed corpus");
  assert.ok([...memberships.values()].some((ids) => ids.length >= 3), "a place may carry evidence in several periods");
  assert.ok(categories.size >= 3, "History must include places from several unchanged primary categories");
});

test("every indexed milestone is dated, inspectable and sourced from leksikon chronology", () => {
  const index = buildEpokePlaceIndex();
  for (const group of Object.values(index.domains.historie.epochs)) {
    for (const place of group.places) {
      assert.ok(place.source_file.startsWith("places/"), `primary source file missing for ${place.place_id}`);
      for (const milestone of place.milestones) {
        assert.ok(Number.isFinite(milestone.year), `${place.place_id}:${milestone.id} must be dated`);
        assert.ok(milestone.source_file.startsWith("data/leksikon/"), `${place.place_id}:${milestone.id} must point to leksikon`);
        assert.ok(milestone.sources.length > 0, `${place.place_id}:${milestone.id} must have a source`);
        assert.ok(milestone.sources.every((source) => /^https?:\/\//.test(source.url)));
      }
    }
  }
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
  }
});
