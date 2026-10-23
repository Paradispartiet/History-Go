import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {auditOsloSixV1Readiness} from '../scripts/audit-oslo-six-v1-release.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));

for(const [id,category,sourceId] of [['ekebergrestauranten','by','geonorge-adresser-v1:0301:13868:15'],['frognerseteren','historie','geonorge-adresser-v1:0301:13070:200']])test(id+' onboarding is one manifest-owned source with real imagery, quiz, Fagverk and Knowledge',()=>{
  const manifest=read('data/places/manifest.json');
  const paths=manifest.files.filter(p=>p.endsWith('/'+id+'.json'));
  assert.equal(paths.length,1);
  const p=read('data/'+paths[0]),packet=read('data/places/production/'+id+'.json');
  assert.equal(packet.placeFile,'data/'+paths[0]);
  assert.equal(packet.identity.status,'resolved');
  assert.equal(p.sourceProvider,'official_address');
  assert.equal(p.sourceObjectId,sourceId);
  assert.equal(p.coordRole,'display_marker');
  assert.equal(p.r,60);
  assert.notEqual(p.frontImage,p.image);
  for(const field of ['desc','popupDesc'])assert.equal(packet.textHashes[field],createHash('sha256').update(p[field]).digest('hex'));
  for(const field of ['image','frontImage']){
    const image=fs.readFileSync(p[field]);
    assert.equal(image.subarray(8,12).toString(),'WEBP');
    assert.ok(p.externalLinks.some(link=>link.type==='image_source'&&link.previewImage===p[field]&&link.credit&&link.license));
  }
  assert.ok(p.frontImageMeta.height>p.frontImageMeta.width);
  assert.equal(p.fagverk.status,'curated');
  assert.equal(read('data/fagverk/fagverk_registry.json').placeLinks[id].sourceFile,paths[0]);
  const qs=read('data/quiz/'+category+'/'+id+'_sets.json').sets.flatMap(s=>s.questions);
  assert.equal(qs.length,21);
  const card=read('data/quizcards/'+category+'/oslo_six_20261023.json').cards.find(c=>c.targetId===id);
  assert.equal(card.questions.length,10);
  const km=read('data/knowledge/knowledge_manifest.json');
  const units=[...read('data/knowledge/knowledge_units.generated.json').units,
    ...read('data/knowledge/'+km.runtime.subjectCanonicalRegistries[category].knowledge_units).units];
  const byId=new Map(units.map(u=>[u.knowledge_unit_id,u]));
  for(const q of qs){
    assert.equal(q.options[q.answerIndex],q.answer);
    const unit=byId.get(q.primary_knowledge_unit_id);
    assert.ok(unit,q.id);
    assert.equal(q.knowledge_unit_ids.map(id=>byId.get(id)?.canonical_claim).join(' '),q.knowledge);
  }
  for(const c of card.questions){
    const q=qs.find(q=>q.id===c.sourceQuestionId);
    assert.equal(c.question,q.question);
    assert.equal(c.answer,q.answer);
    assert.deepEqual(c.options,q.options);
    assert.deepEqual(c.knowledge_unit_ids,q.knowledge_unit_ids);
  }
  assert.equal(read('data/runtime/place-open/'+id+'.json').place.frontImage,p.frontImage);
});

test('canonical onboarding cannot certify the four remaining draft Places',()=>{
  const audit=auditOsloSixV1Readiness();
  assert.equal(audit.canonical_candidates,2);
  assert.equal(audit.published_v1,0);
  const remaining=audit.places.filter(p=>!['ekebergrestauranten','frognerseteren'].includes(p.place_id));
  assert.equal(remaining.length,4);
  assert.ok(remaining.every(p=>p.status==='STAGING_ONLY_NOT_V1'&&Object.values(p.live).every(x=>x===false)));
});
