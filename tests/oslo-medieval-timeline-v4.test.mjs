import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const index = JSON.parse(fs.readFileSync("data/epoker/epoke-place-index.json", "utf8"));

function chronologyMilestones(placeId) {
  return Object.values(index.domains.historie.epochs)
    .flatMap((group) => group.places)
    .filter((place) => place.place_id === placeId)
    .flatMap((place) => place.milestones)
    .filter((milestone) => milestone.evidence_type === "leksikon_chronology");
}

function years(placeId) {
  return [...new Set(chronologyMilestones(placeId).map((milestone) => milestone.year))].sort((a, b) => a - b);
}

test("Gamlebyen tranche materializes only reviewed exact anchors", () => {
  assert.deepEqual(years("clemenskirken_ruin_oslo"), [1920, 1970, 2000]);
  assert.deepEqual(years("minneparken_gamlebyen"), [1932, 2024]);
  assert.deepEqual(years("saxegarden"), [1334, 1624]);
  assert.equal(chronologyMilestones("clemenskirken_ruin_oslo").some((milestone) => milestone.year === 1135), false);
});

test("Gamlebyen tranche closes exactly three Oslo coverage gaps", () => {
  const coverage = index.domains.historie.oslo_coverage;
  assert.equal(coverage.dated_evidence_place_count, 186);
  assert.equal(coverage.awaiting_source_backed_history_count, 379);
  for (const placeId of ["clemenskirken_ruin_oslo", "minneparken_gamlebyen", "saxegarden"]) {
    assert.equal(coverage.places.find((place) => place.place_id === placeId)?.status, "dated_evidence");
  }
});
