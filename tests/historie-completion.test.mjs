import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { auditHistorySemanticHookAlignment } from '../tools/audit-historie-semantic-hook-alignment.mjs';
import { auditHistorySourceAuthority } from '../tools/audit-historie-source-authority.mjs';
import { auditHistoryCompletion } from '../tools/audit-historie-completion.mjs';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

test('Historie semantic hook alignment is canonical and curated blueprints are reconciled', () => {
  const result = auditHistorySemanticHookAlignment();
  assert.equal(result.status, 'PASS');
  assert.equal(result.canonical_emner, 230);
  assert.equal(result.unique_primary_semantic_keys, 230);
  assert.equal(result.curated_mismatches, 0);
  assert.ok(result.curated_blueprint_rows > 0);
});

test('Historie source authority and evidence are completion-grade', () => {
  const result = auditHistorySourceAuthority();
  assert.equal(result.status, 'PASS');
  assert.equal(result.editorial_profiles_with_academic_secondary, 18);
  assert.equal(result.theory_evidence_ready, 230);
  assert.ok(result.fulltext_claims_traced >= 150);
  assert.equal(result.canonical_sources_used_in_fulltext, result.sources_with_concrete_location);
});

test('Historie holistic completion contract remains closed and terminal', () => {
  const result = auditHistoryCompletion();
  assert.equal(result.status, 'PASS');
  assert.equal(result.canonical_domains, 23);
  assert.equal(result.registered_chapters, 23);
  assert.equal(result.uniquely_owned_emner, 230);
  assert.equal(result.covered_periods, 9);
  assert.equal(result.unresolved_identity_blockers, 0);
  assert.equal(result.generated_chapters, 18);
  assert.equal(result.hand_built_chapters, 5);
  assert.equal(result.semantic_sections_locked_to_primary_hook, 180);

  const status = readJson('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'historie');
  assert.equal(status.editorialStatus, 'complete');
  assert.equal(status.nextGate, 'maintenance_source_refresh_and_place_case_expansion');

  const gapReport = readJson('reports/fagverk/historie-completion-gap-report.json');
  assert.equal(gapReport.status, 'resolved_completion_gaps');
  assert.deepEqual(gapReport.open_blockers, []);
});
