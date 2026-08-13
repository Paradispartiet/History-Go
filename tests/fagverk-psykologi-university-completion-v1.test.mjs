import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiUniversityCompletion } from '../scripts/audit-fagverk-psykologi-university-completion-v1.mjs';

test('Psykologi har 58/58 selvstendige universitetsartikler med full dybde og evidens', () => {
  const { report } = auditPsykologiUniversityCompletion({ checkReport: false });
  assert.equal(report.status, 'psykologi_university_completion_complete');
  assert.equal(report.coverage.canonicalDomainCount, 6);
  assert.equal(report.coverage.canonicalEmneCount, 58);
  assert.equal(report.articles.requiredCount, 58);
  assert.equal(report.articles.materializedCount, 58);
  assert.ok(Object.values(report.articles.articleWordCounts).every((count) => count >= 550));
  assert.ok(report.articles.totalEditorialWordCount >= 60000);
  assert.deepEqual(report.coverage.domainArticleCounts, {
    fagtradisjoner_teori_sinnet: 14,
    kognisjon_folelser_atferd: 8,
    psykisk_helse_institusjoner_behandling: 12,
    sosialpsykologi_normalitet_stigma: 8,
    traume_krise_resiliens_omsorg: 7,
    utvikling_oppvekst_laring: 9
  });
});

test('canonicalt begrepsregister dekker eksakt alle core_concepts og alle anvendte fagfelt', () => {
  const { report } = auditPsykologiUniversityCompletion({ checkReport: false });
  assert.equal(report.concepts.requiredCanonicalTermCount, 136);
  assert.equal(report.concepts.materializedCount, 136);
  assert.equal(report.concepts.exactCanonicalTermCoverage, true);
  assert.equal(report.appliedFields.requiredCount, 6);
  assert.equal(report.appliedFields.materializedCount, 6);
  assert.deepEqual(report.appliedFields.areaIds, [
    'clinical_health',
    'work_organizational',
    'educational_school',
    'culture',
    'environment_community',
    'quantitative_psychometrics'
  ]);
});

test('sluttporten bevarer klinisk sikkerhet og AHA-isolasjon', () => {
  const { report } = auditPsykologiUniversityCompletion({ checkReport: false });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.gates.noAhaRuntimeActivation, true);
  assert.deepEqual(report.evidence.runtime.scannedRoots, ['js', 'data/integrations', 'data/historygo', 'data/psychology']);
  assert.deepEqual(report.evidence.runtime.referencingFiles, []);
  assert.equal(report.complete, true);
  assert.equal(report.gates.allArticlesMeetUniversityDepth, true);
});
