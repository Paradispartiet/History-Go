import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';

const place = JSON.parse(fs.readFileSync('data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json','utf8'));
const workcard = JSON.parse(fs.readFileSync('reports/place-production/toyen-trafo-workcard-current.json','utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');

test('Tøyen trafo has two distinct documentary Place images without deprecated cardImage',async()=>{
  assert.equal(place.id,'toyen_trafo');
  assert.match(place.image,/1931/);
  assert.equal(place.frontImage,'bilder/places/toyen_trafo_front_portrait.webp');
  assert.notEqual(place.frontImage,place.image);
  assert.equal(Object.hasOwn(place,'cardImage'),false);
  const buf=fs.readFileSync(place.frontImage),info=await sharp(buf).metadata();
  assert.equal(info.format,'webp');assert.equal(info.width,900);assert.equal(info.height,1350);
  assert.ok(info.height>info.width);
  assert.equal(place.frontImageMeta.sha256,hash(buf));
  assert.equal(place.frontImageMeta.creator,'Bjoertvedt');
  assert.match(place.frontImageMeta.sourcePage,/Oslo_T%C3%B6yen_Trafostasjon/);
  assert.equal(place.frontImageMeta.license,'CC BY-SA 3.0 NO');
  const original=fs.readFileSync(place.frontImageMeta.sourceFile);
  const o=await sharp(original).metadata();
  assert.equal(o.width,4142);assert.equal(o.height,3111);
  assert.equal(hash(original),place.frontImageMeta.sourceSha256);
});

test('Production candidate remains explicitly blocked, without filler or false vFerdig',()=>{
  assert.deepEqual(place.place_card_profile.collection_ids,['people','objects','brands']);
  assert.match(workcard.collection_status.category_expression,/BLOCKED/);
  assert.equal(workcard.editorial_status,'not_vferdig');
});
