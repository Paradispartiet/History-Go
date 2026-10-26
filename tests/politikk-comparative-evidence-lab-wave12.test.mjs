import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const script = fs.readFileSync('js/politikk-evidence-workshop.js', 'utf8');
const css = fs.readFileSync('css/politikk-curriculum.css', 'utf8');
const browser = fs.readFileSync('tests/politikk-comparative-evidence-lab-browser.test.mjs', 'utf8');
const pack = JSON.parse(fs.readFileSync('data/quiz/politikk/politikk_subject_pathways_v1.json', 'utf8'));

test('Bølge 12: sammenligning og to caseoppgaver bruker én eksisterende rubrikk', () => {
  assert.match(script, /const CASE_TASKS = Object\.freeze/);
  for (const id of ['comparison', 'poland', 'hungary']) {
    assert.match(script, new RegExp("id: '" + id + "'"));
  }
  assert.match(script, /const CASE_REVIEW = Object\.freeze/);
  assert.match(script, /CASE_REVIEW\[activeTask\.id\]/);
  assert.match(script, /SELF_REVIEW\.forEach/);
  assert.match(script, /rubricFields\.forEach/);
  assert.match(script, /caseSelect\.addEventListener\('change'/);
  assert.match(script, /sourceLinks\(taskSet\.questions\[criterion\.questionIndex\]\)/);
  assert.match(script, /taskSet = activeTask\.id === 'poland' \? poland : comparison/);
  assert.match(browser, /taskSelect\.selectOption\('poland'\)/);
  assert.match(browser, /taskSelect\.selectOption\('hungary'\)/);
  assert.match(css, /\.politikk-evidence-case-select/);
  assert.match(css, /\.politikk-evidence-task-source/);
});

test('Bølge 12: kanoniske spørsmål, kilder, progresjon og Knowledge er uendret', () => {
  assert.equal(pack.subject_id, 'politikk');
  assert.equal(pack.sets.length, 2, 'no additional quiz sets');
  assert.deepEqual(pack.sets.map(s => s.questions.length), [5, 5]);
  assert.equal(pack.production_context.active_question_count, 10);
  assert.equal(new Set(pack.sets.flatMap(s => s.questions.map(q => q.primary_knowledge_unit_id))).size, 10);
  for (const set of pack.sets) {
    for (const question of set.questions) {
      assert.ok(question.source.some(source => /^https:\/\/odihr\.osce\.org\//.test(source.url)));
    }
  }
  assert.doesNotMatch(script, /localStorage|sessionStorage|setItem\(|captureQuizKnowledgeClaims|masteryRecorded/);
  assert.doesNotMatch(script, /innerHTML\s*=/);
  assert.match(script, /Teksten vurderes ikke automatisk/);
  assert.match(script, /Ingen har kontrollert eller vurdert friteksten automatisk/);
});

test('Bølge 12: oppgaveskifte fjerner gammel tekst, anbefaling og vurdering', () => {
  assert.match(script, /note\.value = ''/);
  assert.match(script, /selectors\.forEach\(select => \{ select\.value = ''; \}\)/);
  assert.match(script, /selfReview\.hidden = true/);
  assert.match(script, /plan\.hidden = true/);
  assert.match(script, /taskEvidence\.replaceChildren\(\)/);
  assert.match(browser, /new case clears prior self-review/);
  assert.match(browser, /no prior text is reused/);
});
