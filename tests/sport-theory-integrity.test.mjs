import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSportTheoryIntegrity } from '../tools/audit-sport-theory-integrity.mjs';

test('Sport strict theory integrity proves every canonical major field (6/6)',()=>{
  const r=auditSportTheoryIntegrity();
  assert.equal(r.subject_id,'sport');
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.proof_scope,'per_canonical_major_field');
  assert.equal(r.profile,'hybrid');
  assert.equal(r.completion_status_read_only,true);
  assert.equal(r.content_rewrite_required,false);
  assert.equal(r.health_safety,'verified_group_evidence_not_individual_medical_or_performance_advice');
  assert.deepEqual(r.summary,{canonicalMajorFields:6,fieldsStrictlyProven:6,theoryObjects:12,scholarlySources:12,personWorkBindings:12,claimBindings:12,actualProseBindings:12,theorySourceProseBindings:12,universalArticlesValidated:116,substantiveContentGapsProven:0});
  assert.deepEqual(r.lockedBaseline,{topics:116,methods:109,canonicalTopicHooks:60,qualityTheoryHooks:56,theoryUnits:56,thinkers:183,primaryWorks:123,registeredChapters:6,sections:54,paragraphs:162,claims:162,chapterSources:74,peerReviewedSources:25,standaloneArticles:116,canonicalConcepts:140,totalArticleWords:134923});
  assert.equal(r.fields.length,6);
  assert.ok(r.fields.every(field=>field.strictlyProven===true&&field.theoryObjectCount===2&&field.personWorkBindingCount===2&&field.actualProseBindingCount===2&&field.universalArticleGate===true&&field.healthSafetyGuard===true));
});
