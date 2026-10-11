import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { loadWorkflowRecord, deriveWorkflowState, deriveSelectedCollections } from '../scripts/place-production-v3-lib.mjs';
import { validateRepository } from '../scripts/validate-place-description-production-v4_2.mjs';
const id='arbeiderbladet_youngstorget';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const place=read(`data/places/media/oslo/places_oslo_media/${id}.json`);
const runtime=read(`data/runtime/place-open/${id}.json`);
const workflow=loadWorkflowRecord(id);
test('historic editorial site preserves the dated physical identity and current address evidence',()=>{
 const raw=read('reports/place-production/arbeiderbladet-youngstorget-intake-20261011/address.json');
 const address=raw.adresser.find(x=>x.adressetekst==='Youngstorget 2');
 assert.deepEqual([place.lat,place.lon],[address.representasjonspunkt.lat,address.representasjonspunkt.lon]);
 assert.equal(place.year,1934);
 assert.equal(place.coordRole,'historical_anchor');
 assert.match(place.coordNote,/stedfestingverifisert=false/);
 assert.match(place.popupDesc,/Dagsavisen fra 1998/);
 assert.match(place.popupDesc,/etter at redaksjonen hadde forlatt Youngstorget/);
 assert.equal(runtime.place.popupDesc,place.popupDesc);
 assert.deepEqual(validateRepository().issues.filter(x=>x.packetFile===`data/places/production/${id}.json`),[]);
});
test('Fagverk exposes political parallelism and two distinguishable sourced cases',()=>{
 assert.equal(runtime.place.fagverk.level,'full');
 const article=place.fagverk.article.join('\n');
 assert.match(article,/Hallin og.*Mancini/);
 assert.match(article,/første dokumenterte caset.*1974–1975/);
 assert.match(article,/andre dokumenterte caset.*1988/);
 assert.match(article,/ikke nødvendigvis en faktamotsetning/);
 assert.ok(place.fagverk.source_urls.every(url=>place.externalLinks.some(x=>x.url===url)));
 assert.equal(read('data/fagverk/fagverk_registry.json').placeLinks[id].field,'fagverk');
 assert.equal(runtime.lesespor.length,4);
});
test('reused People keep primary anchors and explicit overlap evidence',()=>{
 assert.deepEqual(runtime.people.map(x=>x.id).sort(),['harald_stanghelle','martin_tranmael']);
 const t=runtime.people.find(x=>x.id==='martin_tranmael');
 const s=runtime.people.find(x=>x.id==='harald_stanghelle');
 assert.equal(t.placeId,'var_frelsers_gravlund');
 assert.equal(s.placeId,'aftenposten_akersgata');
 assert.match(t.popupDesc,/1934–1940 og 1945–1949/);
 for(const p of runtime.people){
  const c=read(p.claimsFile);
  assert.ok(c.field_claim_map[`places[${id}]`]?.length);
  assert.equal(p.profileStatus,'ready_people_v1');
  assert.ok(fs.existsSync(p.image));
 }
});
test('paper facsimile and current wordmark do not acquire false historical dates',async()=>{
 const [publication]=place.productions;
 assert.equal(publication.entityType,'serial_publication');
 assert.deepEqual(publication.placePeriod,{from:1934,to:1988});
 assert.equal(publication.imageMeta.publishedAt,'1884-05');
 assert.match(publication.desc,/femti år før innflyttingen/);
 assert.match(publication.desc,/Public domain/);
 const image=await sharp(publication.image).metadata();
 assert.deepEqual([image.width,image.height],[1345,1805]);
 const b=runtime.brands.find(x=>x.id==='dagsavisen');
 assert.ok(b);
 assert.equal(b.imageMeta.originalSha256,crypto.createHash('sha256').update(fs.readFileSync(b.logo)).digest('hex'));
 assert.match(b.popupdesc,/fremstilles ikke som et skilt/);
 assert.deepEqual(deriveSelectedCollections(workflow),['people','brands','productions']);
});
test('Story is a dated conflict with attributable perspectives and no invented person binding',()=>{
 const stories=read(`data/stories/stories_${id}.json`);
 assert.equal(stories.length,1);
 assert.equal(stories[0].episode.date,'1988');
 assert.deepEqual(stories[0].related_people,[]);
 assert.ok(stories[0].sources.some(x=>x.url==='https://www.arbark.no/eldok/DNA1987_1.pdf'));
 assert.match(stories[0].story,/tilbakeblikk/);
 assert.match(stories[0].story,/forskjellige spørsmål/);
});
test('checkpoint cannot imply complete before separate quiz and real UI approval',()=>{
 const proposed=structuredClone(workflow);
 proposed.modules.quiz.status='BLOCKED';
 proposed.manual_reviews.final_ui={status:'PASS',evidence:'hypothetical'};
 assert.equal(deriveWorkflowState(proposed),'blocked');
 assert.equal(workflow.collections.objects.status,'BEGRUNNET_NA');
 assert.equal(workflow.modules.before_after.status,'BEGRUNNET_NA');
});
