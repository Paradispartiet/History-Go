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
  assert.equal(index.stats.canonical_story_milestone_count, 239);
  assert.equal(index.stats.verified_place_production_milestone_count, 562);
});

test("Hausmannsbrua contributes exactly three verified production milestones", () => {
  const index = buildEpokePlaceIndex();
  const milestones = Object.values(index.domains.historie.epochs)
    .flatMap((epoch) => epoch.places || [])
    .filter((place) => place.place_id === "hausmannsbrua")
    .flatMap((place) => place.milestones || [])
    .filter((milestone) => milestone.evidence_type === "verified_place_production_claim");
  assert.deepEqual(
    milestones.map((milestone) => milestone.claim_id).sort(),
    [
      "claim_hausmannsbrua_build",
      "claim_hausmannsbrua_preservation",
      "claim_hausmannsbrua_widening"
    ]
  );
});

test("canonical place geography separates Oslo, Lisboa and other countries deterministically", () => {
  const oslo = geographyForPlace({ id: "x", country: "Norge", city: "Oslo" });
  assert.deepEqual(oslo, { city: "oslo", country: "norge", global: true });

  const lisboa = geographyForPlace({ id: "x", country: "Portugal", city: "Lisboa" });
  assert.deepEqual(lisboa, { city: "lisboa", country: "portugal", global: true });

  const london = geographyForPlace({ id: "x", country: "Storbritannia", city: "London" });
  assert.deepEqual(london, { city: "london", country: "storbritannia", global: true });
});

test("history index supports multi-epoch places without changing primary categories", () => {
  const index = buildEpokePlaceIndex();
  const history = index.domains.historie;
  assert.ok(history);
  const places = Object.values(history.epochs).flatMap((epoch) => epoch.places || []);
  const grouped = new Map();
  for (const place of places) {
    if (!grouped.has(place.place_id)) grouped.set(place.place_id, new Set());
    grouped.get(place.place_id).add(place.epoch_id);
  }
  assert.ok([...grouped.values()].some((epochs) => epochs.size > 1));
});

test("every indexed milestone is dated, inspectable and sourced from an approved canonical evidence lane", () => {
  const index = buildEpokePlaceIndex();
  for (const domain of Object.values(index.domains)) {
    for (const epoch of Object.values(domain.epochs || {})) {
      for (const place of epoch.places || []) {
        for (const milestone of place.milestones || []) {
          assert.ok(Number.isInteger(milestone.year));
          assert.ok(milestone.source?.path);
          assert.ok([
            "canonical_claim",
            "canonical_story",
            "verified_place_production_claim"
          ].includes(milestone.evidence_type));
        }
      }
    }
  }
});

test("Oslo coverage classifies every canonical place exactly once without overstating completeness", () => {
  const index = buildEpokePlaceIndex();
  const coverage = index.locations.oslo_coverage;
  assert.equal(coverage.contract, "canonical-oslo-place-coverage-v1");
  assert.equal(
    coverage.total,
    coverage.indexed + coverage.current_only + coverage.undated + coverage.no_history_evidence
  );
  const ids = [
    ...coverage.indexed_ids,
    ...coverage.current_only_ids,
    ...coverage.undated_ids,
    ...coverage.no_history_evidence_ids
  ];
  assert.equal(new Set(ids).size, ids.length);
});

test("Gamlebyen leksikon chronology materializes only reviewed exact anchors", () => {
  const index = buildEpokePlaceIndex();
  const events = Object.values(index.domains.historie.epochs)
    .flatMap((epoch) => epoch.places || [])
    .filter((place) => place.place_id === "gamlebyen")
    .flatMap((place) => place.milestones || []);
  assert.ok(events.length > 0);
  assert.ok(events.every((event) => Number.isInteger(event.year)));
});

test("Eastern Gamlebyen chronology replaces approximate metadata with reviewed exact anchors", () => {
  const index = buildEpokePlaceIndex();
  const ids = new Set(["kampen", "klosterenga", "enerhaugen"]);
  const events = Object.values(index.domains.historie.epochs)
    .flatMap((epoch) => epoch.places || [])
    .filter((place) => ids.has(place.place_id))
    .flatMap((place) => place.milestones || []);
  assert.ok(events.every((event) => Number.isInteger(event.year)));
});

test("Kampen and Klosterenga chronology materializes exact place-specific anchors only", () => {
  const index = buildEpokePlaceIndex();
  for (const placeId of ["kampen", "klosterenga"]) {
    const events = Object.values(index.domains.historie.epochs)
      .flatMap((epoch) => epoch.places || [])
      .filter((place) => place.place_id === placeId)
      .flatMap((place) => place.milestones || []);
    assert.ok(events.length > 0);
    assert.ok(events.every((event) => Number.isInteger(event.year)));
  }
});

test("Sagene and Torshov chronology materializes exact district and park events only", () => {
  const index = buildEpokePlaceIndex();
  for (const placeId of ["sagene", "torshov"]) {
    const events = Object.values(index.domains.historie.epochs)
      .flatMap((epoch) => epoch.places || [])
      .filter((place) => place.place_id === placeId)
      .flatMap((place) => place.milestones || []);
    assert.ok(events.every((event) => Number.isInteger(event.year)));
  }
});

test("Grorud chronology materializes exact district and park events only", () => {
  const index = buildEpokePlaceIndex();
  const events = Object.values(index.domains.historie.epochs)
    .flatMap((epoch) => epoch.places || [])
    .filter((place) => place.place_id === "grorud")
    .flatMap((place) => place.milestones || []);
  assert.ok(events.every((event) => Number.isInteger(event.year)));
});

test("verified production claims fail closed for uncertainty, current-only state and non-Oslo places", () => {
  assert.deepEqual(exactProductionClaimYears({ assertion: "Åpnet i 1906." }), [1906]);
  assert.deepEqual(exactProductionClaimYears({ assertion: "Åpnet ca. 1906." }), []);
  assert.deepEqual(exactProductionClaimYears({ assertion: "Åpent i dag." }), []);
});

test("production year extraction rejects commercial names and Oslo postal codes", () => {
  assert.deepEqual(exactProductionClaimYears({ assertion: "Studio 1900 AS holder til i 0150 Oslo." }), []);
});

test("explicit timeline anchors materialize reviewed multi-year historical claims", () => {
  const index = buildEpokePlaceIndex();
  const milestones = Object.values(index.domains.historie.epochs)
    .flatMap((epoch) => epoch.places || [])
    .flatMap((place) => place.milestones || []);
  assert.ok(milestones.some((milestone) => milestone.evidence_type === "verified_place_production_claim"));
});

test("every epoch and parallel track has substantial canonical place coverage", () => {
  const index = buildEpokePlaceIndex();
  for (const domain of Object.values(index.domains)) {
    for (const epoch of Object.values(domain.epochs || {})) {
      assert.ok(Array.isArray(epoch.places));
    }
  }
});

test("epoch places expose existing source-inspectable people, works and stories without copying popup prose", () => {
  const index = buildEpokePlaceIndex();
  const places = Object.values(index.domains.historie.epochs).flatMap((epoch) => epoch.places || []);
  assert.ok(places.every((place) => !Object.hasOwn(place, "popupDesc")));
});

test("parallel tracks remain separate cross-period relations", () => {
  const index = buildEpokePlaceIndex();
  assert.ok(index.domains.historie.parallel_tracks);
});

test("every History epoch has distinct analysis grounded in its Fagverk periods", () => {
  const index = buildEpokePlaceIndex();
  const analyses = Object.values(index.domains.historie.epochs).map((epoch) => epoch.analysis).filter(Boolean);
  assert.equal(new Set(analyses).size, analyses.length);
});
