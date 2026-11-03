import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const place=load('data/places/sport/europa/norway/oslo_sport/toyenbadet.json');
const person=load('data/people/politikk/oslo/toyenbadet/anne_lindboe.json')[0];
const claims=load('data/people/claims/politikk/oslo/toyenbadet/anne_lindboe.claims.json');
const staging=load('data/people/staging/toyenbadet_people_20261103.json');
const manifest=load('data/people/manifest.json');
const attribution=load('data/people/media/toyenbadet_anne_lindboe_asset.json');
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');

test('Anne Lindboe: a named participant at the opening, not a made-up founder',()=>{
  assert.equal(person.id,'anne_lindboe');
  assert.equal(person.placeId,'toyenbadet');
  assert.ok(person.places.includes('toyenbadet'));
  assert.equal(person.year,2025);
  assert.match(person.desc,/6. januar 2025/);
  assert.match(person.popupDesc,/svømmeopplæring/);
  assert.ok(person.source_urls.some(x=>x.includes('bygg.no')));
  assert.ok(person.source_urls.some(x=>x.includes('aktuelt.oslo.kommune.no')));
  assert.deepEqual(place.place_card_profile.collection_ids,['people','objects','brands','competitions']);
  assert.ok(manifest.files.includes('people/politikk/oslo/toyenbadet/anne_lindboe.json'));
  assert.ok(manifest.priorityFilesByPlace.toyenbadet?.includes('people/politikk/oslo/toyenbadet/anne_lindboe.json'));
});

test('Licensed original source photo: actual WebP pixels, exact provenance, correct identity and no 2025 location claim',()=>{
  assert.equal(person.imageMeta.sourcePage,'https://commons.wikimedia.org/wiki/File:Anne_Lindboe_(1).jpg');
  assert.equal(person.imageMeta.creator,'Helfla');
  assert.equal(person.imageMeta.license,'CC BY-SA 4.0');
  assert.equal(person.imageMeta.reviewStatus,'manually_approved');
  assert.equal(person.profileStatus,'ready_people_v1');
  assert.equal(attribution.personId,'anne_lindboe');
  assert.equal(attribution.license,'CC BY-SA 4.0');
  assert.equal(attribution.reviewStatus,'manually_approved');
  assert.equal(attribution.capturePlaceNotClaimed.includes('NOT at Tøyenbadet'),true);
  for(const key of ['image','cardImage']){
    const p=person[key],buf=fs.readFileSync(p);
    assert.ok(p.startsWith('bilder/kort/people/')&&p.endsWith('.webp'));
    assert.equal(buf.toString('ascii',0,4),'RIFF');
    assert.equal(buf.toString('ascii',8,12),'WEBP');
    assert.ok(buf.length>12000);
    assert.equal(sha256(buf),attribution.derivatives.find(x=>x.path===p)?.sha256);
  }
});

test('All seven place-linked claims map to sentences without leaking four blocked People drafts',()=>{
  assert.equal(claims.person_id,'anne_lindboe');
  assert.equal(claims.claims.length,7);
  const keys=new Set(claims.claims.map(x=>x.id));
  for(const c of claims.claims){
    assert.equal(c.status,'verified');
    assert.ok(c.source_url.startsWith('https://'));
    assert.ok(c.source_location.length>10);
  }
  for(const kind of ['desc','popupDesc']){
    const sentences=person[kind].split(/(?<=[.!?])\s+(?=[A-ZÆØÅ])/).filter(Boolean);
    assert.equal(claims.sentence_claim_map[kind].length,sentences.length);
    for(const c of claims.sentence_claim_map[kind]) assert.ok(c.claim_ids.length>0&&c.claim_ids.every(id=>keys.has(id)));
  }
  assert.equal(staging.profiles.length,4);
  assert.ok(staging.profiles.every(p=>p.portrait_gate.status==='blocked_rights_identification'));
  assert.ok(manifest.files.every(p=>!p.endsWith('toyenbadet_people_20261103.json')));
});
