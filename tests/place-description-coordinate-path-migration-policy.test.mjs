import assert from 'node:assert/strict';
import test from 'node:test';
import { applyCanonicalPlaceOnboardingScopePolicy } from '../scripts/validate-place-description-production-v4_2_policy.mjs';

const oldPlace = 'data/places/by/oslo/existing_place/existing_place.json';
const newPlace = 'data/places/religion/oslo/existing_place/existing_place.json';
const oldEvidenceFile = 'data/coordinate-evidence/oslo/by/existing_place.json';
const newEvidenceFile = 'data/coordinate-evidence/oslo/religion/existing_place.json';

function baseEvidence() {
  return {
    placeId: 'existing_place',
    evidenceStatus: 'applied_to_place',
    placeFile: oldPlace,
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: 59.91, lon: 10.74, r: 60, coordStatus: 'verified', coordSource: 'geonorge_adresser_v1', coordType: 'address_point', coordNote: 'old note' },
    identity: { currentName: 'Existing Place', locationIdentity: 'same building' },
    requiredEvidence: ['address'],
    evidence: [{ kind: 'address', source: 'geonorge', status: 'verified' }],
    addressCandidates: [{ id: 'address-1' }],
    sourceObjectCandidates: [{ id: 'source-1' }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: 59.91, lon: 10.74 }],
    decision: { status: 'verified' },
    notes: ['old']
  };
}

function changedEntries() {
  return [
    { status: 'R095', previousFile: oldPlace, file: newPlace },
    { status: 'M', file: 'data/places/manifest.json' },
    { status: 'M', file: 'data/places/production/existing_place.json' },
    { status: 'M', file: 'data/places/places_index.json' },
    { status: 'R095', previousFile: oldEvidenceFile, file: newEvidenceFile },
    { status: 'M', file: 'data/coordinate-evidence/manifest.json' },
    { status: 'M', file: 'reports/coordinate-evidence-audit.md' },
    { status: 'A', file: 'tests/place-description-coordinate-path-migration-policy.test.mjs' }
  ];
}

function rawReport() {
  return { packetCount: 1, readyPacketCount: 1, errorCount: 2, issues: [
    { code: 'generated_index_in_description_pr', message: 'index' },
    { code: 'mixed_description_and_coordinate_scope', message: 'coordinates' }
  ] };
}

test('existing Place category migration may carry unchanged coordinate evidence to the new path', () => {
  const before = baseEvidence();
  const after = structuredClone(before);
  after.placeFile = newPlace;
  after.coordinateDecision = 'candidate_ready_for_production';
  after.currentCoordinate.coordNote = 'new migration note';
  after.notes = ['old', 'category path migrated without coordinate change'];
  const report = applyCanonicalPlaceOnboardingScopePolicy(rawReport(), changedEntries(), {
    base: 'base', head: 'head',
    readJsonAtRef: (ref, file) => ref === 'base' && file === oldEvidenceFile ? before : ref === 'head' && file === newEvidenceFile ? after : null
  });
  assert.equal(report.prScopePolicy.existingPlaceCoordinatePathMigration, true);
  assert.equal(report.prScopePolicy.removedCoordinateScopeIssueCount, 1);
  assert.equal(report.errorCount, 0);
});

test('existing Place category migration still blocks a real coordinate change', () => {
  const before = baseEvidence();
  const after = structuredClone(before);
  after.placeFile = newPlace;
  after.currentCoordinate.lat = 59.92;
  const report = applyCanonicalPlaceOnboardingScopePolicy(rawReport(), changedEntries(), {
    base: 'base', head: 'head',
    readJsonAtRef: (ref, file) => ref === 'base' && file === oldEvidenceFile ? before : ref === 'head' && file === newEvidenceFile ? after : null
  });
  assert.equal(report.prScopePolicy.existingPlaceCoordinatePathMigration, false);
  assert.equal(report.prScopePolicy.removedCoordinateScopeIssueCount, 0);
  assert.deepEqual(report.issues.map((issue) => issue.code), ['mixed_description_and_coordinate_scope']);
});
