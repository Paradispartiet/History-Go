import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { materializeUtdanningStrictCompletionV1 } from '../scripts/materialize-utdanning-strict-completion-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

test('Utdanning strict completion lukker 14/14 uten å svekke elev- og evidensgrenser', () => {
  const result = materializeUtdanningStrictCompletionV1();
  const pensum = read('data/fag/utdanning/utdanningpensum_canonical_v1.json');
  const registry = read('data/fagverk/fagverk_registry.json').subjects.utdanning;
  const status = read('data/fagverk/subject_status.json').subjects.find((entry) => entry.id === 'utdanning');
  assert.equal(result.status, 'complete');
  assert.equal(result.fulltextDomains, 14);
  assert.equal(result.fieldsStrictlyProven, 14);
  assert.equal(result.verifiedClaims, 448);
  assert.equal(result.six_part_quality_review.total, 29);
  assert.equal(pensum.complete_ready, true);
  assert.equal(pensum.status, 'complete');
  assert.equal(status.editorialStatus, 'complete');
  assert.equal(status.nextGate, 'complete');
  assert.equal(registry.editorialPlan.nextGate, 'complete');
  assert.equal(registry.editorialPlan.strictCompletionProof.status, 'strictly_proven');
  assert.equal(registry.editorialPlan.strictCompletionProof.safety, 'general_education_no_automatic_individual_decision');
});
