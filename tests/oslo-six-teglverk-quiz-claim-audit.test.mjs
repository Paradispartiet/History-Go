import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixRemainingFullquizReview } from '../scripts/build-oslo-six-remaining-fullquiz-review.mjs';

const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));

test('all 21 Kristiania Teglverk candidate facts have explicit source correspondence, no release signoff',()=>{
  const report=read('reports/place-production/kristiania-teglverk-quiz-claim-audit-20261023.json');
  const pack=buildOsloSixRemainingFullquizReview();
  const place=pack.places.find(p=>p.place_id==='kristiania_teglverk_bryn');
  assert.equal(report.place_id,place.place_id);
  assert.equal(report.mode,'EDITORIAL_PRIMARY_SOURCE_CORRESPONDENCE_NOT_FINAL_APPROVAL');
  assert.equal(report.coverage.claim_topics_checked,21);
  assert.equal(report.coverage.question_finally_approved,0);
  assert.equal(report.questions.length,21);
  assert.equal(place.status,'EDITORIAL_SOURCE_REVIEW_NOT_V1');
  assert.equal(place.quiz_manifest_registered,false);
  assert.equal(place.knowledge_synced,false);
  const original=place.sets.flatMap(set=>set.questions);
  assert.equal(original.length,21);
  const auditById=new Map(report.questions.map(r=>[r.question_id,r]));
  assert.equal(auditById.size,21);
  for(const [index,question] of original.entries()){
    const proof=auditById.get(question.id);
    assert.ok(proof,'Missing primary-source trace: '+question.id);
    assert.equal(proof.original_source_fact_correspondence,'FOUND');
    assert.ok(proof.source_correspondence.length>30);
    assert.ok(proof.evidence_url.startsWith('https://'));
    assert.equal(proof.claim_editor_signoff,false);
    assert.equal(proof.distractor_editor_signoff,false);
    assert.equal(proof.quiz_runtime_approved,false);
    assert.equal(question.runtime_registered,false);
    assert.ok(question.source_url.startsWith('https://'));
    assert.ok(question.options.length===4&&question.options[question.answerIndex]===question.answer);
    assert.ok(!/adressekonflikt|adressen.*HOLD|14\/18-konflikten/i.test(question.knowledge),
      'Unresolved production address question leaked into user learning: '+question.id);
    if(index>=10)assert.equal(question.source_url,report.primary_source.url);
  }
  assert.ok(report.source_method_limits.some(x=>x.includes('GPS')));
  assert.equal(report.publication_status,'NOT_PLAYABLE_NO_PIN_NO_QUIZ_MANIFEST_WRITE');
});
