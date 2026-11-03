import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const path='bilder/merker/film_tv/undermerker/visningssteder-brodert-v1.webp';
const expectedHash='abb3129cccd305b3c4e338c09a6299320cbd2a988a81cae103631a9086ac4618';
const prior={
  "spillefilm": "bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp",
  "kortfilm": "bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp",
  "dokumentarfilm": "bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp",
  "tv_serier": "bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp",
  "nyheter_og_reportasje": "bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp",
  "klassikere": "bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp",
  "norsk_film_og_tv": "bilder/merker/film_tv/undermerker/norsk_film_og_tv-brodert-v1.webp",
  "filmfestivaler": "bilder/merker/film_tv/undermerker/filmfestivaler-brodert-v3.webp",
  "filmlocations": "bilder/merker/film_tv/undermerker/filmlocations-brodert-v3.webp",
  "film_og_tv_produksjon": "bilder/merker/film_tv/undermerker/film_og_tv_produksjon-brodert-v1.webp",
  "arkiv_og_kanon": "bilder/merker/film_tv/undermerker/arkiv_og_kanon-brodert-v1.webp"
};
test('Visningssteder v1 is the twelfth Film & TV badge and verified alpha WebP',()=>{
 const film=load('data/badges/film_tv.json');
 const manifest=load('data/badges/underbadge_batch01_production.json');
 const asset=manifest.families.film_tv.assets.find(x=>x.id==='visningssteder');
 assert.equal(film.color.toUpperCase(),'#C2188B');
 assert.equal(film.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(manifest.status,'seven_scenekunst_twelve_film_active_complete');
 assert.equal(film.subBadgeImages.visningssteder,path);
 assert.equal(film.sub.length,12);
 assert.equal(Object.keys(film.subBadgeImages).length,12);
 assert.equal(asset.status,'integrated');
 assert.equal(asset.selectedImage,path);
 assert.deepEqual(asset.quality,{visualApproved:true,technicalApproved:true});
 assert.equal(asset.productionBrief.topLabel,'VISNINGSSTEDER');
 assert.equal(asset.productionBrief.bottomLabel,'FILM & TV');
 assert.equal(asset.visualReview.result,'approved');
 assert.equal(asset.sha256,expectedHash);
 const b=readFileSync(new URL('../'+path,import.meta.url));
 assert.equal(b.length,577588);
 assert.equal(b.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(b.readUInt32LE(4)+8,b.length);
 assert.equal(b.subarray(8,12).toString('ascii'),'WEBP');
 assert.equal(b.subarray(12,16).toString('ascii'),'VP8X');
 assert.ok(b[20]&0x10,'alpha flag');
 assert.equal(b.readUIntLE(24,3)+1,1024);
 assert.equal(b.readUIntLE(27,3)+1,1024);
 assert.equal(createHash('sha256').update(b).digest('hex'),expectedHash);
});
test('all eleven earlier Film & TV and seven Scenekunst badges stay unchanged',()=>{
 const film=load('data/badges/film_tv.json');
 const scene=load('data/badges/scenekunst.json');
 const {visningssteder,...earlier}=film.subBadgeImages;
 assert.equal(visningssteder,path);
 assert.deepEqual(earlier,prior);
 assert.equal(Object.keys(scene.subBadgeImages).length,7);
 for(const id of scene.sub)assert.ok(scene.subBadgeImages[id]);
});
