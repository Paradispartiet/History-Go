import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import crypto from 'node:crypto';

const p=JSON.parse(fs.readFileSync('data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json','utf8'));
test('Tøyen trafo hero actually depicts the building in a separate 2010 source photo',async()=>{
 assert.equal(p.image,'bilder/places/toyen_trafo_hero_2010.webp');
 assert.equal(p.frontImage,'bilder/places/toyen_trafo_front_portrait.webp');
 assert.notEqual(p.image,p.frontImage);
 assert.equal(Object.hasOwn(p,'cardImage'),false);
 assert.equal(p.imageComposition.heroPosition,'52% 38%');
 assert.equal(p.imageLicense,'CC BY-SA 3.0');
 assert.ok(p.imageSourceUrl.includes('T%C3%B8yenTrafo001.jpg'));
 assert.ok(p.imageMeta.historicalCompanion.sourcePage.includes('1931_OMU_OB.Z12059'));
 const old=fs.readFileSync(p.imageMeta.sourceFile),n=await sharp(old).metadata();
 assert.equal(n.format,'jpeg');assert.equal(n.width,800);assert.equal(n.height,535);
 assert.equal(crypto.createHash('sha1').update(old).digest('hex'),p.imageMeta.sourceFileSha1);
 const file=fs.readFileSync(p.image),m=await sharp(file).metadata();
 assert.equal(m.format,'webp');assert.equal(m.width,800);assert.equal(m.height,535);
 assert.equal(crypto.createHash('sha256').update(file).digest('hex'),p.imageMeta.sha256);
 assert.ok(p.externalLinks.some(x=>x.url.includes('1931_OMU_OB.Z12059')));
});
