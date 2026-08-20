import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturTheoryIntegrity } from '../tools/audit-litteratur-theory-integrity.mjs';

test('Litteratur strict theory integrity proves all 28 canonical major fields without rewriting content', () => {
  const r=auditLitteraturTheoryIntegrity({checkReport:false});
  assert.equal(r.subject_id,'litteratur');
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.proof_scope,'per_canonical_major_field');
  assert.equal(r.completion_status_read_only,true);
  assert.equal(r.content_rewrite_required,false);
  assert.equal(r.rules.fixed_theorist_quota_forbidden,true);
  assert.equal(r.rules.named_people_require_claim_bound_work_or_research_contribution,true);
  assert.equal(r.summary.canonicalMajorFields,28);
  assert.equal(r.summary.fieldsStrictlyProven,28);
  assert.equal(r.summary.expandedFullFieldAreas,18);
  assert.equal(r.summary.chapterOverviewAreas,10);
  assert.equal(r.summary.substantiveContentGapsProven,0);
  assert.equal(r.fields.length,28);
  assert.ok(r.fields.every(field=>field.strictlyProven===true));
  assert.ok(r.fields.every(field=>field.verifiedProseBoundClaims>=4));
  assert.ok(r.fields.every(field=>field.scholarlyUsedSources>=2));
  assert.ok(r.fields.every(field=>field.theoryBearingParagraphs>=2));
  assert.ok(r.fields.every(field=>field.rivalOrAlternativeParagraphs>=2));
  assert.ok(r.fields.every(field=>field.limitationOrInferenceParagraphs>=2));
});
