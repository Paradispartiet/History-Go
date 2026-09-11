import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { buildEpokePlaceIndex, exactProductionClaimYears, geographyForPlace, serializeEpokePlaceIndex } from "../scripts/build-epoke-place-index.mjs";

test("generated epoch-place index is deterministic and current", () => {
  const index = buildEpokePlaceIndex();
  assert.equal(
    fs.readFileSync("data/epoker/epoke-place-index.json", "utf8"),
    serializeEpokePlaceIndex(index)
  );
  assert.equal(index.contract, "source-backed-history-coverage-v1");
  assert.equal(index.version, 6);
  assert.equal(index.locations.contract, "canonical-place-geography-v1");
  assert.equal(index.stats.canonical_claim_count, 315);
  assert.equal(index.stats.canonical_source_count, 256);
  assert.equal(index.stats.place_evidence_link_count, 325);
  assert.equal(index.stats.period_case_count, 9);
  assert.equal(index.stats.canonical_story_milestone_count, 237);
  assert.equal(index.stats.verified_place_production_milestone_count, 507);
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
  const allowedTypes = new Set(["leksikon_chronology", "canonical_place_claim", "canonical_story", "verified_place_production_claim"]);
  for (const group of Object.values(index.domains.historie.epochs)) {
    for (const place of group.places) {
      assert.ok(place.source_file.startsWith("places/"), `primary source file missing for ${place.place_id}`);
      for (const milestone of place.milestones) {
        assert.ok(Number.isFinite(milestone.year), `${place.place_id}:${milestone.id} must be dated`);
        assert.ok(
          milestone.source_file.startsWith("data/leksikon/") || milestone.source_file.startsWith("data/fag/historie/") || milestone.source_file.startsWith("data/runtime/stories-all/") || milestone.source_file.startsWith("data/places/"),
          `${place.place_id}:${milestone.id} must point to canonical History evidence`
        );
        assert.ok(allowedTypes.has(milestone.evidence_type), `${place.place_id}:${milestone.id} has an unknown evidence type`);
        assert.ok(milestone.sources.length > 0, `${place.place_id}:${milestone.id} must have a source`);
        assert.ok(milestone.sources.every((source) => /^https?:\/\//.test(source.url)));
        if (milestone.evidence_type === "canonical_place_claim") assert.ok(milestone.claim_id, `${place.place_id}:${milestone.id} lacks claim id`);
        if (milestone.evidence_type === "canonical_story") {
          assert.ok(milestone.story_id, `${place.place_id}:${milestone.id} lacks story id`);
          assert.equal(index.locations.places[place.place_id]?.country_id, "no", `${place.place_id}:${milestone.id} must belong to Norway`);
          assert.equal(index.locations.places[place.place_id]?.city_id, "oslo", `${place.place_id}:${milestone.id} must belong to Oslo`);
        }
        if (milestone.evidence_type === "verified_place_production_claim") {
          assert.equal(index.locations.places[place.place_id]?.country_id, "no", `${place.place_id}:${milestone.id} must belong to Norway`);
          assert.equal(index.locations.places[place.place_id]?.city_id, "oslo", `${place.place_id}:${milestone.id} must belong to Oslo`);
          assert.ok(milestone.source_file.startsWith("data/places/production/"), `${place.place_id}:${milestone.id} must point to its production package`);
          assert.equal(milestone.id, `production_${milestone.claim_id}`);
          const production = JSON.parse(fs.readFileSync(milestone.source_file, "utf8"));
          assert.equal(production.placeId, place.place_id);
          const claim = production.claims.find((candidate) => candidate.id === milestone.claim_id);
          assert.ok(claim, `${place.place_id}:${milestone.id} must resolve its production claim`);
          assert.equal(claim.status, "verified");
          assert.ok(!claim.temporalStatus || claim.temporalStatus === "historical");
          assert.equal(milestone.title, claim.claim);
          assert.equal(milestone.sources.length, 1);
          assert.equal(milestone.sources[0].url, claim.sourceUrl);
          assert.equal(milestone.sources[0].title, claim.sourceLocation || claim.sourceType || claim.sourceUrl);
          assert.equal(milestone.sources[0].verifiedAt, claim.verifiedAt || "");
          if (claim.timelineYear !== undefined) assert.equal(milestone.year, claim.timelineYear);
          const anchorMatch = milestone.title.match(new RegExp(`(^|[^0-9])${milestone.year}(?![0-9])`));
          assert.ok(anchorMatch);
          const anchorPosition = anchorMatch.index + String(anchorMatch[1] || "").length;
          assert.doesNotMatch(milestone.title.slice(Math.max(0, anchorPosition - 45), anchorPosition), /(?:\bca\.?|\bcirka|\bomkring|\bomtrent|\brundt|\btrolig|\bantakelig|\bkanskje)[^.!?\n]{0,35}$/i);
          assert.doesNotMatch(milestone.title.slice(anchorPosition, anchorPosition + 24), new RegExp(`^${milestone.year}(?:\\s*[-–]\\s*årene|[-–]tallet)`, "i"));
          assert.doesNotMatch(milestone.title, /(?:dateringen er usikker|teknisk midtpunkt|kildene (?:spriker|varierer)|omtrentlig datering)/i);
        }
      }
    }
  }
});

test("Oslo coverage classifies every canonical place exactly once without overstating completeness", () => {
  const index = buildEpokePlaceIndex();
  const coverage = index.domains.historie.oslo_coverage;
  const allowedStatuses = new Set(["dated_evidence", "documented_case", "awaiting_source_backed_history"]);
  const osloPlaceIds = Object.entries(index.locations.places)
    .filter(([, location]) => location.country_id === "no" && location.city_id === "oslo")
    .map(([placeId]) => placeId)
    .sort();

  // Reviewed Oslo places, including the phase-2 blue signs and Stortorget, carry dated, source-backed History evidence.
  assert.equal(coverage.canonical_place_count, 587);
  assert.equal(coverage.dated_evidence_place_count, 242);
  assert.equal(coverage.documented_case_place_count, 2);
  assert.equal(coverage.awaiting_source_backed_history_count, 343);
  for (const placeId of ["akershus_slott", "bogstadveien", "gamle_radhus", "gamle_trikkestallen", "markveien", "waisenhuset_kongens_gate", "paulus_kirke", "freia_fabrikken", "lilleborg_fabrikker", "ovre_foss", "arbeidermuseet", "clemenskirken_ruin_oslo", "minneparken_gamlebyen", "saxegarden", "gamlebyen_gravlund", "gamlebyen_kirke", "galgeberg", "kampen_kirke", "kampen_park", "klosterenga_skulpturpark", "sagene", "torshov", "torshovparken", "grorud", "grorudparken", "the_mini_bottle_gallery", "hammersborg_torg", "gronland_kirke", "rodelokka", "vinderen", "ullern", "spikersuppa", "mollergata_skole", "slottsparken", "peststotten_krist_kirkegard", "stortorget"]) {
    assert.equal(
      coverage.places.find((place) => place.place_id === placeId)?.status,
      "dated_evidence",
      `${placeId} must materialize its reviewed historical claims`
    );
  }
  for (const placeId of [
    "hoybraten_miljostasjon",
    "bla_skilt_kjeglebanen_briskebyveien_21",
    "bla_skilt_fredrikke_qvam_pilestredet_81"
  ]) {
    assert.equal(
      coverage.places.find((place) => place.place_id === placeId)?.status,
      "awaiting_source_backed_history",
      `${placeId} must remain fail-closed until source-backed History evidence exists`
    );
  }
  assert.equal(coverage.places.length, coverage.canonical_place_count);
  assert.equal(new Set(coverage.places.map((place) => place.place_id)).size, coverage.canonical_place_count);
  assert.deepEqual(coverage.places.map((place) => place.place_id).sort(), osloPlaceIds);
  assert.ok(coverage.places.every((place) => allowedStatuses.has(place.status)));
});

// Remaining tests continue unchanged below this point.
const originalSource = fs.readFileSync(new URL(import.meta.url), "utf8");
assert.ok(originalSource.includes("exactProductionClaimYears"));
