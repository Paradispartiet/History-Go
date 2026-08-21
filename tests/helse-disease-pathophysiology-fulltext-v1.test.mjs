import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { audit } from '../scripts/audit-helse-disease-pathophysiology-fulltext-v1.mjs';

const read = (f) => JSON.parse(fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));

test('sykdom/patofysiologi løser 32 briefclaims med bidireksjonelt fulltekstspor', () => {
  const r = audit();
  assert.deepEqual(r.counts, { domainsCovered: 3, targetDomains: 12, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 14, assessmentQuestions: 8, decisionScenarios: 6 });
  assert.ok(Object.values(r.gates).every(Boolean));
  assert.equal(r.six_part_quality_review.total, 29);
});

test('Helse er 3/12 uten prematur strict eller editorial completion', () => {
  const s = read('data/fagverk/subject_status.json').subjects.find((x) => x.id === 'helse');
  const r = read('data/fagverk/fagverk_registry.json').subjects.helse;
  assert.deepEqual([s.navigationStatus, s.assessmentStatus, s.editorialStatus], ['materialized', 'audited', 'chapters_in_progress']);
  assert.equal(r.editorialPlan.registeredChapterCount, 3);
  assert.equal(r.editorialPlan.targetDomainCount, 12);
  assert.equal(s.nextGate, 'disease_pathophysiology_full_chapter_complete_next_domain_source_brief');
  assert.notEqual(s.editorialStatus, 'complete');
});

test('assessment og claim-locators er svar-, kilde- og sikkerhetskonsistente', () => {
  const a = read('data/fagverk/helse/sykdom-og-patofysiologi-mekanisme-skade-og-systemsvikt/assessment.json');
  const c = read('data/fagverk/helse/sykdom-og-patofysiologi-mekanisme-skade-og-systemsvikt/claims.json');
  assert.equal(a.questions.length, 8);
  assert.ok(a.questions.every((x) => x.answer === x.options[x.answerIndex] && x.source.length >= 3 && x.safety_mode === 'general_non_individualizing'));
  assert.ok(c.claims.every((x) => x.source_locators.length === x.source_ids.length && x.source_locators.every((r) => r.location)));
});
