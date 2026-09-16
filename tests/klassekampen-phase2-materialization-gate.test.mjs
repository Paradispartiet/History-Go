import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const EXACT_BASELINE = 'aa874f06159ed5dae49a2db7a78f0a6e47b458a6';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const WORKCARD_PATH = path.join(
  ROOT,
  'reports/place-production/klassekampen-workcard-current.json',
);

const EXPECTED_CANDIDATES = Object.freeze({
  people: ['mari_skurdal'],
  objects: ['klassekampen_forste_utgave_1969'],
  brands: ['klassekampen'],
  productions: [
    'klassekampen_avis',
    'klassekampen_bokmagasinet',
    'klassekampen_musikkmagasinet',
    'klassekampen_eavis',
  ],
});

const EXPECTED_ACTIONS = Object.freeze({
  mari_skurdal: 'reuse_existing',
  klassekampen_forste_utgave_1969: 'materialize',
  klassekampen: 'materialize',
  klassekampen_avis: 'materialize',
  klassekampen_bokmagasinet: 'materialize',
  klassekampen_musikkmagasinet: 'materialize',
  klassekampen_eavis: 'materialize',
});

function readWorkcard() {
  return JSON.parse(fs.readFileSync(WORKCARD_PATH, 'utf8'));
}

function requireResolvedText(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert.ok(value.trim(), `${label} must not be empty`);
  assert.doesNotMatch(
    value,
    /\b(?:pending|candidate|unknown|tbd|todo)\b/i,
    `${label} must be a resolved decision, not provisional text`,
  );
}

function requireDecision(decisions, collection, id) {
  const decision = decisions?.[collection]?.find((entry) => entry?.id === id);
  assert.ok(decision, `Missing Phase 2 decision for ${collection}/${id}`);
  assert.equal(
    decision.action,
    EXPECTED_ACTIONS[id],
    `${collection}/${id} must preserve the locked reuse/materialize action`,
  );
  requireResolvedText(decision.asset_role, `${collection}/${id}.asset_role`);
  requireResolvedText(
    decision.provenance_decision,
    `${collection}/${id}.provenance_decision`,
  );
  requireResolvedText(decision.asset_path, `${collection}/${id}.asset_path`);
  assert.ok(
    decision.asset_path.startsWith('bilder/'),
    `${collection}/${id}.asset_path must be a repository-local bilder/ asset`,
  );
  return decision;
}

test('Klassekampen Phase 2 stays closed until exact workcard decisions are explicit', () => {
  const workcard = readWorkcard();

  assert.equal(workcard.placeId, 'klassekampen_redaksjon');
  assert.equal(workcard.productionProfile, 'standard');
  assert.equal(workcard.profileStatus, 'confirmed');

  for (const [collection, ids] of Object.entries(EXPECTED_CANDIDATES)) {
    assert.deepEqual(
      workcard.collectionStatus?.[collection]?.candidate_members,
      ids,
      `${collection} candidate IDs drifted before Phase 2 authorization`,
    );
  }

  const gate = workcard.phase2Materialization;
  assert.ok(
    gate,
    'Phase 2 materialization requires workcard.phase2Materialization; candidate_members alone are not authorization',
  );
  assert.equal(
    gate.status,
    'AUTHORIZED',
    'Phase 2 must remain closed until the workcard explicitly says AUTHORIZED',
  );
  assert.equal(
    gate.baseline_exact_sha,
    EXACT_BASELINE,
    'Phase 2 authorization must remain anchored to the audited exact baseline',
  );

  const mari = requireDecision(gate.decisions, 'people', 'mari_skurdal');
  assert.equal(
    mari.canonical_owner,
    'people',
    'Mari Skurdal must reuse the existing canonical People owner',
  );

  const firstIssue = requireDecision(
    gate.decisions,
    'objects',
    'klassekampen_forste_utgave_1969',
  );
  assert.equal(
    firstIssue.entity_role,
    'signature_object',
    'The 1969 first issue may be the sole Object only when explicitly authorized as the signature object',
  );
  assert.equal(firstIssue.canonical_owner, 'objects');
  assert.match(
    firstIssue.provenance_source ?? '',
    /commons\.wikimedia\.org\/wiki\/File:Klassekampen_no_1_1969\.jpg/i,
    'The signature Object must retain the documented Commons first-issue provenance source',
  );

  const brand = requireDecision(gate.decisions, 'brands', 'klassekampen');
  assert.equal(brand.canonical_owner, 'brands');
  assert.equal(
    brand.brand_type,
    'media_brand',
    'Klassekampen may materialize only as the documented media_brand type',
  );
  assert.equal(
    brand.usage_context,
    'referential_identification',
    'Brand use must remain referential identification',
  );
  assert.equal(
    brand.endorsement_claimed,
    false,
    'Brand materialization must not imply endorsement',
  );
  assert.match(
    brand.provenance_source ?? '',
    /commons\.wikimedia\.org\/wiki\/File:Klassekampen_logo\.gif/i,
    'Brand authorization requires the documented Commons wordmark provenance source',
  );

  const productionDecisions = EXPECTED_CANDIDATES.productions.map((id) =>
    requireDecision(gate.decisions, 'productions', id),
  );
  for (const decision of productionDecisions) {
    assert.equal(
      decision.canonical_owner,
      'productions',
      `${decision.id} must remain a Production and must not be materialized as an Object`,
    );
  }

  const allDecisions = [mari, firstIssue, brand, ...productionDecisions];
  const previewPaths = allDecisions.map((decision) => decision.asset_path);
  assert.equal(
    new Set(previewPaths).size,
    previewPaths.length,
    'Each Phase 2 member needs its own local preview asset; previews must not be reused across collections',
  );
});
