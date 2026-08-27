import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { audit } from '../scripts/audit-utdanning-assessment-educational-measurement-fulltext-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));

test('Vurdering og pedagogiske målinger løser 32 source-first claims med gjensidig fulltekstspor', () => {
  const report = audit();
  assert.deepEqual(report.counts, {
    domainsCovered: 7,
    targetDomains: 14,
    modules: 4,
    sections: 8,
    paragraphs: 32,
    verifiedClaims: 32,
    inspectableSources: 13,
    assessmentQuestions: 8,
    decisionScenarios: 6,
    nextSourceBriefDomains: 1,
  });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 29);
});

test('Utdanning står 7/14 uten prematur completion og Spesialpedagogikk er neste port', () => {
  const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'utdanning');
  const registry = read('data/fagverk/fagverk_registry.json').subjects.utdanning;
  const pensum = read('data/fag/utdanning/utdanningpensum_canonical_v1.json');
  assert.deepEqual([status.navigationStatus, status.assessmentStatus, status.editorialStatus], ['materialized', 'audited', 'chapters_in_progress']);
  assert.equal(registry.editorialPlan.registeredChapterCount, 7);
  assert.equal(registry.editorialPlan.completedSourceBriefCount, 8);
  assert.equal(pensum.domains.filter((domain) => domain.status === 'materialized').length, 7);
  assert.equal(pensum.domains[6].domain_id, 'vurdering_pedagogiske_malinger');
  assert.notEqual(status.editorialStatus, 'complete');
});

test('vurderingsoppgavene er claimbundne uten skår- eller elevfatalisme', () => {
  const assessment = read('data/fagverk/utdanning/vurdering-pedagogiske-malinger-validitet-reliabilitet-og-bruk/assessment.json');
  assert.equal(assessment.questions.length, 8);
  for (const row of assessment.questions) {
    assert.equal(row.answer, row.options[row.answerIndex]);
    assert.equal(row.learner_typing, false);
    assert.ok(row.source.length >= 2);
  }
});
