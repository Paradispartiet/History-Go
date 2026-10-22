import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync('js/politikk-evidence-workshop.js', 'utf8');
const css = fs.readFileSync('css/politikk-curriculum.css', 'utf8');
const browser = fs.readFileSync('tests/politikk-comparative-evidence-lab-browser.test.mjs', 'utf8');
const canon = JSON.parse(fs.readFileSync('data/quiz/politikk/politikk_subject_pathways_v1.json', 'utf8'));

test('Bølge 11: fire forskjellige, konkrete egenvurderingskriterier knyttet til eksisterende belegg', () => {
  for (const criterion of ['belegg', 'sammenligning', 'mekanisme', 'forbehold']) {
    assert.match(js, new RegExp("id: '" + criterion + "'"), criterion);
  }
  for (const title of ['Kildebelegg', 'Sammenlignbarhet', 'Mekanisme og årsak', 'Usikkerhet og anbefalinger']) {
    assert.ok(js.includes(title), title);
  }
  for (const level of ['improve', 'uncertain', 'clear']) {
    assert.ok(js.includes("['" + level + "',"), level);
  }
  assert.ok(js.includes('sourceLinks(comparison.questions[criterion.questionIndex])'));
  assert.ok(js.includes('criterion.next[selectors[index].value]'));
  assert.ok(js.includes('Dette er egenvurdering, ikke automatisk retting, karakter eller mestring.'));
  assert.ok(js.includes('Ingen har kontrollert eller vurdert friteksten automatisk.'));
  assert.equal(canon.sets.length, 2);
  assert.equal(canon.production_context.active_question_count, 10);
  assert.equal(new Set(canon.sets.flatMap(set => set.questions.map(q => q.primary_knowledge_unit_id))).size, 10);
});

test('Bølge 11: endringer i elevteksten ugyldiggjør tidligere egenvurdering og visning', () => {
  assert.match(js, /note\.addEventListener\('input'/);
  assert.match(js, /selectors\.forEach\(select => \{ select\.value = ''; \}\)/);
  assert.match(js, /plan\.hidden = true;/);
  assert.match(js, /selfReview\.hidden = true;/);
  assert.match(js, /unanswered\.focus\(\)/);
  assert.match(js, /select\.addEventListener\('change'/);
  assert.match(browser, /new draft requires renewed self-review/);
  assert.match(browser, /changing the self-review invalidates old advice/);
  assert.match(css, /politikk-evidence-rubric-grid/);
  assert.match(css, /@media \(max-width: 640px\) \{ \.politikk-evidence-rubric-grid/);
});

test('Bølge 11: tiltak er eksplisitt valgt av elevens egen vurdering – ikke skjult maskinell fritekstanalyse', () => {
  assert.doesNotMatch(js, /localStorage|sessionStorage|quiz_progress|setItem\(|fetch\([^)]*note|fetch\([^)]*own/);
  assert.doesNotMatch(js, /innerHTML\s*=/);
  assert.match(js, /element\('p', '', criterion\.heading \+ ': ' \+ criterion\.next\[selectors\[index\]\.value\]\)/);
  assert.match(browser, /\[data-criterion\]/);
});
