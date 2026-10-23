import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixFullquizReview } from '../scripts/build-oslo-six-fullquiz-review.mjs';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));

test('Ekeberg has 21 individually source-mapped draft questions, including nonrepeating municipal operating concession',()=>{
  const audit=load('reports/place-production/ekebergrestauranten-quiz-line-source-review-20261023.json');
  const quiz=buildOsloSixFullquizReview().places.find(p=>p.place_id==='ekebergrestauranten');
  assert.equal(audit.status,'TWENTY_ONE_QUESTION_PRIMARY_SOURCE_READ_AND_MAPPED_RELEASE_HOLD');
  assert.equal(audit.source_fulltext_read,true);
  assert.equal(audit.reviewed_claims.length,21);
  assert.equal(quiz.sets.flatMap(x=>x.questions).length,21);
  const q=quiz.sets.flatMap(x=>x.questions);
  assert.deepEqual(audit.reviewed_claims.map(x=>x.question_id),q.map(x=>x.id));
  for(const entry of audit.reviewed_claims){
    assert.ok(Number.isInteger(entry.source_text_line_locator));
    assert.ok(entry.source_text_line_locator>=10&&entry.source_text_line_locator<=20);
    assert.equal(entry.primary_source,'https://oslobyleksikon.no/side/Ekebergrestauranten');
    assert.equal(entry.primary_claim_alignment,'MATCHES_REFERENCED_ARTICLE');
    assert.equal(entry.release_approval,false);
    assert.ok(entry.claim_topic.trim().length>=8);
    assert.ok(entry.secondary_corroboration_sources.every(s=>s.startsWith('https://')));
    const match=q.find(x=>x.id===entry.question_id);
    assert.equal(match.source_url,entry.primary_source);
    assert.equal(match.runtime_registered,false);
  }
  const duplicateReplacement=q[17], colour=q[16];
  assert.match(colour.question,/farge/);
  assert.equal(colour.answer,'Varm brunfarge');
  assert.match(duplicateReplacement.question,/konsesjon/);
  assert.equal(duplicateReplacement.answer,'Oslo Folkerestauranter');
  assert.equal(duplicateReplacement.options.length,4);
  assert.doesNotMatch(duplicateReplacement.knowledge,/furutre|furustamme/i);
  assert.ok(new Set(audit.reviewed_claims.map(x=>x.claim_topic)).size===21);
  assert.equal(audit.safety.canonical_quiz_profile_confirmed,false);
  assert.equal(audit.safety.quiz_manifest_registered,false);
  assert.equal(audit.safety.knowledge_synced,false);
  assert.equal(audit.safety.geographical_anchor_approved,false);
});
