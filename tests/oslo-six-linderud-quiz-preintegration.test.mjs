import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = (p) => JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const draft = load('reports/place-production/linderud-gard-quiz-preintegration-20261022.json');
const brief = load('data/quiz/production_briefs/historie/linderud_gard.json');
const manifest = load('data/quiz/manifest.json');
const gate = load('reports/place-production/oslo-six-places-integration-gates-20261022.json');
const editorial = readFileSync(new URL('../reports/place-production/oslo-six-places-editorial-20261022.md', import.meta.url), 'utf8');

test('Linderud: exactly four distinct sets of seven with source/claim/answer consistency', () => {
  assert.equal(draft.status, 'STAGING_ONLY_NOT_REGISTERED_OR_PLAYABLE');
  assert.equal(draft.source_review, 'pending_fulltext_review');
  assert.equal(draft.profile.proposed, 'normal');
  assert.equal(draft.profile.confirmed, false);
  assert.equal(draft.sets.length, 4);
  const ids = new Set();
  const claims = new Map(brief.claims.map(c => [c.claim_id, c]));
  for (const [index, set] of draft.sets.entries()) {
    assert.equal(set.set_id, 'historie_linderud_gard_set_' + (index + 1));
    assert.equal(set.questions.length, 7, set.set_id);
    for (const [position, question] of set.questions.entries()) {
      assert.equal(question.id, 'linderud_gard_quiz_' + String(index * 7 + position + 1).padStart(2, '0'));
      assert.ok(!ids.has(question.id), 'duplicate ID: ' + question.id);
      ids.add(question.id);
      assert.equal(question.placeId, draft.place_id);
      assert.equal(question.targetId, draft.place_id);
      assert.equal(question.categoryId, 'historie');
      assert.equal(question.quiz_id, set.set_id + '_q' + (position + 1));
      assert.equal(question.question_scope, 'place');
      assert.equal(question.review_status, 'pending_original_source_fulltext_review');
      assert.equal(question.options.length, 4, question.id);
      assert.equal(new Set(question.options).size, 4, question.id);
      assert.equal(question.options[question.answerIndex], question.answer, question.id);
      assert.ok(question.question.length > 20 && question.knowledge.length > 30, question.id);
      const claim = claims.get(question.claim_id);
      assert.ok(claim, question.id + ': unknown claim');
      assert.equal(question.claim_basis, claim.statement, question.id);
      assert.deepEqual(question.source, claim.source_ids, question.id);
      for (const sourceId of question.source) {
        assert.equal(draft.sources[sourceId], brief.sources[sourceId].url, question.id + ':' + sourceId);
      }
    }
  }
  assert.equal(ids.size, 28);
  assert.equal(draft.forbidden_exact_facts.length, 2);
});

test('Linderud: exactly ten selected questions preserve editorial QuizCard wording and answers', () => {
  const block = editorial.split('## Linderud gård (\`linderud_gard\`)')[1].split('\n## Ekebergrestauranten')[0];
  assert.ok(block);
  const rows = block.split('\n').filter(s => /^\|\s*\d+\s*\|/.test(s));
  assert.equal(rows.length, 10);
  assert.equal(draft.quizcard_selection.length, 10);
  assert.equal(new Set(draft.quizcard_selection).size, 10);
  const byId = new Map(draft.sets.flatMap(s => s.questions).map(q => [q.id, q]));
  for (const [index, id] of draft.quizcard_selection.entries()) {
    const columns = rows[index].split('|').slice(1, -1).map(s => s.trim());
    const q = byId.get(id);
    assert.ok(q, 'QuizCard selection must reference fullquiz question: ' + id);
    assert.equal(q.question, columns[1], id);
    assert.equal(q.answer, columns[2], id);
  }
});

test('Linderud: staging has not bypassed any publication gates', () => {
  const place = gate.places.find(p => p.place_id === draft.place_id);
  assert.ok(place);
  assert.equal(place.release_status, 'BLOCKED');
  assert.equal(place.geographical_anchor.status, 'HOLD');
  assert.ok(Object.values(place.publication_gates).every(passed => passed === false));
  assert.ok(Object.values(brief.publication_gate).every(passed => passed === false));
  assert.ok(Object.values(brief.sources).filter(s => s.source_type !== 'media')
    .every(s => s.review_status === 'pending'));
  assert.ok(!(manifest.sets || []).some(s => s.targetId === draft.place_id));
  assert.ok(!(manifest.targets || []).some(s => s.targetId === draft.place_id));
  assert.ok(!(manifest.files || []).some(f => f.includes('linderud_gard')));
});


test('Linderud quiz prompts keep source-year ambiguity in explanation, not player-facing question', () => {
  const questions=draft.sets.flatMap(s=>s.questions);
  const q=questions.find(x=>x.id==='linderud_gard_quiz_05');
  assert.ok(q);
  assert.equal(q.question,'Når ble Linderud gårds hovedbygning reist?');
  assert.equal(q.answer,'Tidlig på 1700-tallet');
  assert.match(q.knowledge,/Kildene spriker/);
  assert.ok(questions.every(x=>!/formulert uten|omstridt eksakt år/i.test(x.question)));
  assert.notEqual(draft.publication_hold?.status,'PUBLISHED');
});
