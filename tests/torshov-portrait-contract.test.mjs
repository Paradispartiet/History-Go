import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

test('Torshov documentary image is an actual local 900x1200 WebP, source and credit preserved',async()=>{
 const place=JSON.parse(fs.readFileSync('data/places/by/oslo/places/torshov.json','utf8'));
 const runtime=JSON.parse(fs.readFileSync('data/runtime/place-open/torshov.json','utf8'));
 assert.equal(place.id,'torshov');
 assert.equal(place.image,'https://commons.wikimedia.org/wiki/Special:Redirect/file/Torshov%20Aerial%202018%20(185922)%20(cropped).jpg?width=1280');
 assert.equal(place.frontImage,'bilder/places/by/torshov_front_portrait.webp');
 assert.equal(runtime.place.frontImage,place.frontImage);
 const buffer=fs.readFileSync(place.frontImage);
 const meta=await sharp(buffer).metadata();
 assert.equal(meta.format,'webp');
 assert.equal(meta.width,900);
 assert.equal(meta.height,1200);
 assert.equal(place.frontImageMeta.outputSha256,createHash('sha256').update(buffer).digest('hex'));
 assert.equal(place.frontImageMeta.license,'CC BY-SA 4.0');
 assert.equal(place.frontImageMeta.creator,'Tore Sætre');
 assert.match(place.frontImageMeta.transformation,/Torshov og Sandaker/);
 assert.equal(place.frontImageMeta.reviewStatus,'pending_editorial_crop_review');
});
test('Torshov remains a single canonical place with original quiz and geo baseline',()=>{
 const p=JSON.parse(fs.readFileSync('data/places/by/oslo/places/torshov.json','utf8'));
 const q=JSON.parse(fs.readFileSync('data/quiz/by/torshov_oslo_v1_sets.json','utf8'));
 assert.equal(p.id,'torshov');
 assert.equal(p.coordStatus,'verified_geometry');
 assert.equal(q.targetId,'torshov');
 assert.equal(q.sets.length,1);
 assert.equal(q.sets[0].questions.length,10);
 assert.equal(new Set(q.sets[0].questions.map(x=>x.id)).size,10);
});
