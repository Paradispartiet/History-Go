import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const data = JSON.parse(read('data/quiz/politikk/politikk_subject_pathways_v1.json'));
const script = read('js/politikk-evidence-workshop.js');
const html = read('fagverk.html');
const ui = read('js/fagverk.js');
const css = read('css/politikk-curriculum.css');

test('Bølge 10: komparativ øvelse bygger på de to aktive femtrinnssettene', () => {
  assert.equal(data.status, 'pilot_active');
  assert.equal(data.sets.length, 2);
  assert.deepEqual(data.sets.map(set => set.questions.length), [5, 5]);
  assert.match(script, /pathway_politikk_demokratisk_tilbakegang_polen_2023/);
  assert.match(script, /pathway_politikk_valgintegritet_ungarn_2022_polen_2023/);
  assert.match(script, /comparison\.questions\[step\.questionIndex\]/);
  assert.match(script, /poland\.questions\[0\]/);
  assert.match(script, /source\.url/);
  const comparison = data.sets[1];
  for (const index of [0, 1, 3, 4]) {
    const question = comparison.questions[index];
    assert.ok(question.knowledge_payload.summary.length > 80);
    assert.ok(question.source.some(x => /^https:\/\/odihr\.osce\.org\//.test(x.url)));
    assert.ok(question.source.every(x => x.inference_boundary.length > 70));
  }
  assert.equal(new Set(data.sets.flatMap(set => set.questions.map(q => q.primary_knowledge_unit_id))).size, 10);
});

test('Bølge 10: verkstedet er synlig, tilgjengelig og har tre uavhengige evidenssteg', () => {
  assert.match(ui, /id="politikkEvidenceWorkshopStart"/);
  assert.match(ui, /id="politikkEvidenceWorkshop"/);
  assert.match(ui, /HGPolitikkEvidenceWorkshop\?\.start/);
  assert.match(html, /<script src="js\/politikk-evidence-workshop\.js"><\/script>/);
  assert.ok(html.indexOf('js/politikk-evidence-workshop.js') < html.indexOf('js/fagverk.js'));
  for (const stage of ['belegg', 'mekanisme', 'avgrensning']) assert.match(script, new RegExp("id: '" + stage + "'"));
  for (const index of [3, 1, 4]) assert.match(script, new RegExp('questionIndex: ' + index));
  assert.match(script, /aria-pressed/);
  assert.match(script, /aria-live/);
  assert.match(script, /htmlFor = note\.id/);
  assert.match(css, /@media \(max-width: 640px\)/);
});

test('Bølge 10: ingen ny kanon, ingen skjult poenggivning og ingen falsk skrivevurdering', () => {
  assert.match(script, /lagres ikke som mestring/);
  assert.match(script, /Teksten vurderes ikke automatisk/);
  assert.doesNotMatch(script, /localStorage|sessionStorage|captureQuizKnowledgeClaims|quiz_progress|masteryRecorded|setItem\(/);
  assert.doesNotMatch(script, /innerHTML\s*=/);
  assert.match(script, /replaceChildren/);
  assert.equal(data.production_context.active_question_count, 10);
  assert.ok(!data.sets.some(s => /wave10/.test(s.set_id)));
});
