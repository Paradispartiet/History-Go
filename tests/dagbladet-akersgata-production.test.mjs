import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import {deriveWorkflowState, deriveSelectedCollections, loadWorkflowRecord} from '../scripts/place-production-v3-lib.mjs';
import {validateRepository} from '../scripts/validate-place-description-production-v4_2.mjs';
import {applySourceLedLengthPolicy} from '../scripts/validate-place-description-production-v4_2_policy.mjs';
import {checkPlaceTranslationFreshness} from '../scripts/check-place-i18n-freshness.mjs';
const id='dagbladet_akersgata';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const place=read(`data/places/media/oslo/places_oslo_media/${id}.json`);
const runtime=read(`data/runtime/place-open/${id}.json`);
const workflow=loadWorkflowRecord(id);
test('opening payload preserves the physical 1967 address anchor and reviewed chronology',()=>{
 assert.equal(runtime.place.year,1967);
 assert.deepEqual(runtime.place.address,place.address);
 assert.match(runtime.place.popupDesc,/1967 til 2008/);
 assert.match(runtime.place.popupDesc,/grunnlagt i 1869/);
 assert.equal(runtime.place.lat,59.914542408879896);
 assert.equal(runtime.place.lon,10.74304201409404);
 assert.deepEqual(applySourceLedLengthPolicy(validateRepository()).issues.filter(x=>x.packetFile===`data/places/production/${id}.json`),[]);
 assert.deepEqual(checkPlaceTranslationFreshness(id).errors,[]);
});
test('curated Fagverk is navigable and every source is exposed in the place',()=>{
 assert.equal(read('data/fagverk/fagverk_registry.json').placeLinks[id].status,'curated');
 assert.equal(runtime.place.fagverk.level,'full');
 assert.deepEqual(runtime.place.fagverk,place.fagverk);
 assert.ok(place.fagverk.source_urls.every(url=>place.externalLinks.some(x=>x.url===url)));
 assert.equal(runtime.lesespor.length,5);
});
test('selected collections contain genuine local member previews including a disclosed illustration',async()=>{
 assert.deepEqual(deriveSelectedCollections(workflow),place.place_card_profile.collection_ids);
 assert.deepEqual(runtime.place.place_card_profile.collection_ids,['people','brands','productions']);
 assert.equal(runtime.people.length,4);
 for(const person of runtime.people){
   assert.equal(person.profileStatus,'ready_people_v1');
   const meta=await sharp(person.image).metadata();
   assert.ok(meta.width>0&&meta.height>0);
   assert.ok(person.imageMeta.sourcePage.startsWith('https://'));
 }
 const illustration=runtime.people.find(x=>x.id==='sissel_benneche_osvold');
 assert.equal(illustration.imageMeta.mediaType,'editorial_illustration');
 assert.match(illustration.imageMeta.disclosure,/ikke fotografi/);
 const {data,info}=await sharp(illustration.image).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let clear=false,opaque=false;
 for(let i=3;i<data.length;i+=info.channels){clear ||= data[i]===0;opaque ||= data[i]===255;}
 assert.ok(clear&&opaque,'actual transparent background and opaque subject');
 assert.ok(runtime.brands.some(x=>x.id==='dagbladet'&&fs.existsSync(x.logo)));
});
test('normal quiz opens with concrete knowledge, and QuizCard is loaded from its registered collection',()=>{
 const quiz=read(`data/quiz/media/${id}_sets.json`);
 assert.deepEqual(quiz.sets.map(x=>x.questions.length),[7,7,7,7]);
 for(const q of quiz.sets.slice(0,2).flatMap(x=>x.questions)){
   assert.ok(q.primary_knowledge_unit_id);
   assert.ok(q.sources.length);
   assert.doesNotMatch(q.question,/\bmetode|teori|kildekritikk|source review|canonical\b/i);
   assert.equal(q.answer,q.options[q.answerIndex]);
 }
 assert.ok(read('data/quizcards/media/manifest.json').collections.includes(`${id}_quizkort_v1.json`));
 const card=read(`data/quizcards/media/${id}_quizkort_v1.json`).cards[0];
 assert.equal(card.questions.length,10);
 assert.deepEqual(card.questions.map(x=>x.answer),card.answerKey.map(x=>x.answer));
});
test('serial publication preserves separate image and own-place dates',async()=>{
 assert.equal(workflow.collections.productions.status,'PASS');
 const [publication]=runtime.place.productions;
 assert.equal(publication.entityType,'serial_publication');
 assert.deepEqual(publication.placePeriod,{from:1967,to:2008});
 assert.equal(publication.imageMeta.publishedAt,'1905-01-02');
 assert.match(publication.name,/faksimile 1905/);
 assert.match(publication.desc,/før redaksjonen flyttet hit/);
 assert.match(publication.desc,/Public domain/);
 assert.notEqual(publication.image,place.frontImage);
 const meta=await sharp(publication.image).metadata();
 assert.equal(meta.width,599);
 assert.equal(meta.height,836);
 const claims=new Set(read(`data/places/production/${id}.json`).claims.map(x=>x.id));
 assert.ok(publication.claim_ids.every(id=>claims.has(id)));
});
test('an unfinished qualified collection still blocks a hypothetical UI approval',()=>{
 assert.equal(workflow.collections.objects.status,'BEGRUNNET_NA');
 const proposed=structuredClone(workflow);
 proposed.collections.productions.status='BLOCKED';
 proposed.manual_reviews.final_ui={status:'PASS',evidence:'hypothetical approval'};
 assert.equal(deriveWorkflowState(proposed),'blocked');
});
