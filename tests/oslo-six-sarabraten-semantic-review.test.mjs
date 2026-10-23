import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixFullquizReview } from '../scripts/build-oslo-six-fullquiz-review.mjs';

const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));

test('Sarabråten does not repeat wheelboat Sara or quiz disputed ski-race year as unambiguous fact',()=>{
  const q=buildOsloSixFullquizReview().places.find(p=>p.place_id==='sarabraten')
    .sets.flatMap(x=>x.questions);
  const audit=read('reports/place-production/sarabraten-quiz-semantic-uncertainty-review-20261023.json');
  assert.equal(q.length,21);
  assert.equal(audit.status,'TWO_REWRITTEN_CANDIDATES_NOT_PUBLISHED');
  const source=new Map(audit.changes.map(x=>[x.question_id,x]));
  assert.equal(source.size,2);
  for(const id of ['sarabraten_review_quiz_16','sarabraten_review_quiz_21']){
    const question=q.find(x=>x.id===id),evidence=source.get(id);
    assert.ok(question && evidence);
    assert.equal(question.question,evidence.new_question);
    assert.equal(question.answer,evidence.correct_answer);
    assert.equal(question.source_url,evidence.primary_url);
    assert.equal(question.runtime_registered,false);
    assert.ok(question.knowledge.length>50);
    assert.equal(question.options[question.answerIndex],question.answer);
  }
  assert.ok(q.some(x=>x.answer==='Sara'));
  assert.equal(q.filter(x=>x.answer==='Sara').length,1);
  assert.ok(q.every(x=>!x.question.includes('tidsrom ble Sarabråtrennet')));
  assert.ok(q.every(x=>!x.answer.includes('1902–1928')));
  assert.deepEqual(new Set(audit.disputed_sarabraten_ski_race_start.map(x=>x.reported_start)),new Set([1900,1902]));
  assert.ok(Object.values(audit.release_hold).every(x=>x===false));
});
