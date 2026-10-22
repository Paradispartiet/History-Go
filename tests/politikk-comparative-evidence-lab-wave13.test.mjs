import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const script = fs.readFileSync('js/politikk-evidence-workshop.js', 'utf8');
const browser = fs.readFileSync('tests/politikk-comparative-evidence-lab-browser.test.mjs', 'utf8');
const pack = JSON.parse(fs.readFileSync('data/quiz/politikk/politikk_subject_pathways_v1.json', 'utf8'));

test('Bølge 13: alle tre skriveoppgavene har egne skrivestøtter uten automatisk tekstanalyse', () => {
  for (const id of ['comparison', 'poland', 'hungary']) {
    assert.match(script, new RegExp("id: '" + id + "'"));
  }
  assert.equal((script.match(/revisionStarter:/g) || []).length, 3);
  assert.equal((script.match(/instructions:/g) || []).length, 3);
  assert.match(script, /const instructions = element\('p', 'politikk-evidence-instructions', activeTask\.instructions\)/);
  assert.match(script, /instructions\.textContent = activeTask\.instructions/);
  assert.match(script, /activeTask\.revisionStarter/);
  assert.match(script, /Teksten vurderes ikke automatisk/);
  assert.match(script, /Ingen har kontrollert eller vurdert friteksten automatisk/);
  assert.doesNotMatch(script, /localStorage|sessionStorage|setItem\(/);
  assert.doesNotMatch(script, /innerHTML\s*=/);
  assert.match(browser, /country-specific instructions for Poland/);
  assert.match(browser, /country-specific instructions for Hungary/);
});

test('Bølge 13: egenvurdering prioriterer forbedringsbehov og beholder fire sporbare råd', () => {
  assert.match(script, /const priority = \{ improve: 0, uncertain: 1, clear: 2 \}/);
  assert.match(script, /rated\.sort\(/);
  assert.match(script, /item\.dataset\.criterion = baseCriterion\.id/);
  assert.match(script, /politikk-evidence-first-step/);
  assert.match(script, /\(lead \? 'Start her – ' : 'Deretter – '\)/);
  assert.match(browser, /first revision priority/);
  assert.match(browser, /Hungary mechanism gets priority/);
});

test('Bølge 13: faglige kilder og quiz-/Knowledge-struktur består', () => {
  assert.equal(pack.subject_id, 'politikk');
  assert.equal(pack.sets.length, 2);
  assert.deepEqual(pack.sets.map(set => set.questions.length), [5, 5]);
  assert.equal(pack.production_context.active_question_count, 10);
  for (const set of pack.sets) {
    for (const question of set.questions) {
      assert.ok(question.source.some(source => /^https:\/\/odihr\.osce\.org\//.test(source.url)));
    }
  }
});
