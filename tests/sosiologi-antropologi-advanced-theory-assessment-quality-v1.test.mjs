import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  evaluateSourceEvidence,
  buildOverlays,
  buildDomainPackages,
} from '../scripts/materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const canon = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_reading_canon_v1.json');
const contract = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_fulltext_refresh_v1.json');
const evidence = read('data/fag/politikk/sosiologi_antropologi/advanced_theory_source_evidence_v1.json');
const production = read('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json');

test('60 advanced sociology questions discriminate neighbouring concepts without fixed-answer leakage', () => {
  const gate = evaluateSourceEvidence(canon, evidence);
  const overlays = buildOverlays(canon, contract);
  const packages = buildDomainPackages(overlays, production, gate);
  const indexCounts = [0, 0, 0];
  let inspected = 0;

  assert.equal(overlays.length, 7);
  assert.equal(canon.works.length, 20);

  for (const overlay of overlays) {
    const pkg = packages.find((p) => p.domain_id === overlay.domain_id);
    assert.ok(pkg, `Missing domain package: ${overlay.domain_id}`);
    const committed = read(pkg.paths.assessment);
    assert.deepEqual(committed, pkg.assessment, `Generator output drift: ${pkg.paths.assessment}`);

    for (const work of overlay.works) {
      assert.equal(work.theory_units.length, 3, `Expected three concepts in ${work.id}`);
      const analyticQuestions = work.theory_units.map((unit) => unit.analytic_question);
      assert.equal(new Set(analyticQuestions).size, 3, `Cannot distinguish concepts in ${work.id}`);

      for (const unit of work.theory_units) {
        const id = `advq-${unit.id}`;
        const question = committed.questions.find((q) => q.id === id);
        assert.ok(question, `Missing assessment: ${id}`);
        assert.equal(question.options.length, 3, id);
        assert.equal(new Set(question.options).size, 3, id);
        assert.deepEqual([...question.options].sort(), [...analyticQuestions].sort(), id);
        assert.equal(question.answer, unit.analytic_question, id);
        assert.equal(question.options[question.answerIndex], question.answer, id);
        assert.equal(question.claim_id, `advclaim-${unit.id}`, id);
        assert.ok([0, 1, 2].includes(question.answerIndex), id);
        indexCounts[question.answerIndex] += 1;
        inspected += 1;
      }
    }
  }
  assert.equal(inspected, 60);
  assert.deepEqual(indexCounts, [20, 20, 20]);
});
