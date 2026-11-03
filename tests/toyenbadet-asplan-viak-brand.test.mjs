import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const json = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const place=json('data/places/sport/europa/norway/oslo_sport/toyenbadet.json');
const master=json('data/brands/brands_master.json');
const mapped=json('data/brands/brands_by_place.json');
const manifest=json('data/brands/asplan_viak_logo_provenance.json');

test('Asplan Viak: single canonical Brand identity shared across documented projects', () => {
  const matches=master.filter(x=>x.id==='asplan_viak');
  assert.equal(matches.length,1);
  const brand=matches[0];
  assert.deepEqual(mapped.toyenbadet,['asplan_viak']);
  assert.deepEqual(brand.place_ids,['regjeringskvartalet','toyenbadet']);
  assert.match(brand.popupdesc,/Tøyenbadet/);
  assert.ok(brand.source_urls.includes('https://www.asplanviak.no/profilmanual/'));
  assert.equal(brand.logo,'bilder/kort/brands/asplan_viak.webp');
  assert.equal(brand.imageMeta.reviewStatus,'manually_approved');
  assert.equal(brand.imageMeta.noEndorsement,true);
});

test('Official brandmark is authentic, locally image-backed and not an invented logo', () => {
  assert.equal(manifest.sourcePage,'https://www.asplanviak.no/profilmanual/');
  assert.match(manifest.sourceAsset,/asplanviak_logo_hovedlogo_minthvit_rgb\.png$/);
  assert.equal(manifest.rightsBasis.includes('referential_trademark_identification'),true);
  assert.equal(manifest.noEndorsement,true);
  assert.equal(manifest.reviewStatus,'manually_approved');
  const file=fs.readFileSync(manifest.path);
  assert.equal(file.toString('ascii',0,4),'RIFF');
  assert.equal(file.toString('ascii',8,12),'WEBP');
  assert.ok(file.length>4000);
  assert.equal(crypto.createHash('sha256').update(file).digest('hex'),manifest.assetSha256);
  assert.equal(master.find(x=>x.id==='asplan_viak').imageMeta.assetSha256,manifest.assetSha256);
});

test('Tøyenbadet: Brands and NM competitions are only chosen image-backed collections', () => {
  assert.deepEqual(place.place_card_profile.collection_ids,['people','objects','brands','competitions']);
  assert.equal(place.competitions.length,1);
  assert.ok(fs.existsSync(place.competitions[0].image));
  assert.equal(place.competitions[0].id,'nm_langbane_2026_toyenbadet');
  assert.equal(place.place_card_profile.collection_ids.includes('people'),true);
  assert.equal(place.objects.length,2);
});
