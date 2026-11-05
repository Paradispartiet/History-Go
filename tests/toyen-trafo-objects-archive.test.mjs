import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const source='data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json';
const id=['toyen_trafo_apparatpult_1916','toyen_trafo_transformatorkjerne_1918'];
test('Tøyen trafo: two distinct archived technical Objects qualify, not building features',()=>{
 const p=read(source);assert.deepEqual(p.objects.map(x=>x.id),id);
 assert.deepEqual(p.place_card_profile.collection_ids,['people','objects']);
 for(const [i,o] of p.objects.entries()){
  assert.equal(o.physicalObject,true);
  assert.ok(o.archiveReference.includes('A-20138/Ua/0004/'));
  assert.ok(o.placeSpecificReason.includes('Oslo byarkiv'));
  assert.equal(o.source_urls.length,2);
  assert.ok(o.image.startsWith('bilder/objects/toyen_trafo_'));
  const svg=fs.readFileSync(o.image,'utf8');
  assert.match(svg,/ILLUSTRASJON – IKKE FOTOGRAFI/);
  assert.match(svg,/not|ikke|skjematisk|Skjematisk|Tolkning/);
  assert.equal(o.imageKind,'illustration');
  assert.equal(o.imageMeta.sourcePhotoNotReproduced,true);
  assert.match(o.imageMeta.representationLimits,/ikke|ingen|ukjent/i);
  assert.match(o.location,/ukjent/);
 }
 assert.ok(!p.objects.some(o=>/vinduer|tarnhjelm/.test(o.id)));
});
test('Tøyen trafo: generated Place-open data retains People, Brands and new Objects',()=>{
 const r=read('data/runtime/place-open/toyen_trafo.json');
 assert.deepEqual(r.place.objects.map(x=>x.id),id);
 assert.deepEqual(r.people.map(x=>x.id),['thorvald_astrup','kari_rolfsen']);
 assert.ok(r.people.every(x=>x.image.endsWith('.webp')));
 assert.deepEqual(r.brands.map(x=>x.id),['oslo_teatersenter','unge_kunstneres_samfund']);
 assert.deepEqual(r.place.place_card_profile.collection_ids,['people','objects']);
 assert.equal(r.stories.length,1);
 assert.equal(r.lesespor.length,4);
 assert.equal(r.language.entries.length,6);
});
