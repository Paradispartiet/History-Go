import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { materializeHelseStrictCompletionV1 } from '../scripts/materialize-helse-strict-completion-v1.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

test('Helse strict completion closes 12/12 without weakening safety', () => {
  const result = materializeHelseStrictCompletionV1();
  const pensum = read('data/fag/helse/helsepensum_canonical_v1.json');
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status = read('data/fagverk/subject_status.json').subjects.find((entry) => entry.id === 'helse');
  assert.deepEqual(result, {
    schema: 'history_go_helse_strict_completion_audit_v1',
    version: '1.0.0',
    subject_id: 'helse',
    status: 'complete',
    editorialStatus: 'complete',
    fulltextDomains: 12,
    canonicalMajorFields: 12,
    fieldsStrictlyProven: 12,
    registeredChapters: 12,
    verifiedClaims: 384,
    modelObjects: 24,
    scholarlySources: 24,
    actualProseBindings: 72,
    substantiveContentGapsProven: 0,
    clinicalSafety: 'blocking_general_non_individualizing',
    nextSubject: 'utdanning',
  });
  assert.equal(pensum.complete_ready, true);
  assert.equal(pensum.status, 'complete');
  assert.equal(status.editorialStatus, 'complete');
  assert.equal(status.nextGate, 'complete');
  assert.equal(registry.editorialPlan.nextGate, 'complete');
  assert.equal(registry.editorialPlan.strictCompletionProof.status, 'strictly_proven');
  assert.equal(registry.editorialPlan.strictCompletionProof.safety, 'blocking_general_non_individualizing');
});
