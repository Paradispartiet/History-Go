import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const expected=['cos','olivia','rorbua','tiger_of_sweden','wiersholm'];
const excluded=['haavind','lund_hagem','simonsen_vogt_wiig','wikborg_rein'];
const review=read('reports/place-production/aker-brygge-brands-place-and-asset-review-2026-11-20.json');
const closeout=read('reports/place-production/aker-brygge-brands-mapping-closeout-2026-11-20.json');
const runtime=read('data/runtime/place-open/aker_brygge.json');

test('Only positively sourced Aker Brygge Brand relationships enter the generated payload',()=>{
 const mapping=read('data/brands/brands_by_place.json').aker_brygge;
 assert.deepEqual(mapping,expected);
 assert.deepEqual(runtime.brands.map(b=>b.id),expected);
 assert.deepEqual(closeout.activePlaceLinks,expected);
 for(const id of mapping){
  const evidence=review.entries.find(e=>e.brandId===id)?.placeRelationship;
  assert.equal(evidence?.status,'CURRENT_SITE_CONFIRMED');
  assert.match(evidence.sourceUrl,/^https:\/\//);
  assert.ok(evidence.sourceLocation&&evidence.finding);
 }
});

test('Removed place links preserve Brand identities and sourced candidate evidence',async()=>{
 const registry=read('data/brands/brands_master.json');
 assert.deepEqual(closeout.removedLinks.map(e=>e.brandId),excluded);
 for(const id of excluded){
  assert.ok(registry.some(b=>b.id===id),`Canonical Brand lost: ${id}`);
  assert.ok(!runtime.brands.some(b=>b.id===id),`Unsupported place link reintroduced: ${id}`);
  const decision=closeout.removedLinks.find(e=>e.brandId===id);
  assert.equal(decision.decision,'REMOVE_UNSUPPORTED_PLACE_LINK_KEEP_CANONICAL_BRAND');
  assert.ok(decision.currentAddressEvidence.sourceUrl&&decision.additionalSource.url&&decision.reinstatementRule);
 }
 // Archive integrity is independent of the live place-mapping population.
 assert.equal(review.entries.length,9);
 for(const entry of review.entries){
  for(const [path,sha] of [[entry.originalPath,entry.originalSha256],[entry.candidatePath,entry.candidateSha256]]){
   assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),sha,path);
  }
  const meta=await sharp(entry.candidatePath).metadata();
  assert.deepEqual([meta.width,meta.height,meta.format],[900,520,'webp']);
 }
});

test('Publication preserves sourced Brand boundaries and the two Structure members',()=>{
 const place=read('data/places/by/oslo/places/aker_brygge.json');
 assert.deepEqual(place.place_card_profile.collection_ids,['people','brands','structures']);
 assert.deepEqual(runtime.place.place_card_profile,place.place_card_profile);
 assert.deepEqual(runtime.place.structures.map(s=>s.id),['aker_brygge_verkstedhallene_miljo','aker_brygge_torrdokken_historisk_1929']);
 assert.equal(closeout.placecardBrandsEnabled,false);
 assert.equal(closeout.vFerdig,false);
});

