import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const path='bilder/merker/film_tv/undermerker/arkiv_og_kanon-brodert-v1.webp';
const hash='c7d0699c85ae42de9bc94c73bf670e324637d22838f5273a4558c2d57a7ab5f2';
test('Arkiv og filmkanon: approved v1 and alpha WebP',()=>{
 const film=load('data/badges/film_tv.json');
 const manifest=load('data/badges/underbadge_batch01_production.json');
 const badge=manifest.families.film_tv.assets.find(x=>x.id==='arkiv_og_kanon');
 assert.equal(film.color.toUpperCase(),'#C2188B');
 assert.equal(film.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(film.subBadgeImages.arkiv_og_kanon,path);
 assert.equal(Object.keys(film.subBadgeImages).length,11);
 assert.equal(manifest.status,'seven_scenekunst_eleven_film_active_remaining_film_pending');
 assert.equal(badge.status,'integrated');
 assert.equal(badge.selectedImage,path);
 assert.deepEqual(badge.quality,{visualApproved:true,technicalApproved:true});
 assert.equal(badge.productionBrief.topLabel,'ARKIV OG FILMKANON');
 assert.equal(badge.productionBrief.bottomLabel,'FILM & TV');
 assert.equal(badge.sha256,hash);
 const b=readFileSync(new URL('../'+path,import.meta.url));
 assert.equal(b.length,587992);
 assert.equal(b.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(b.subarray(8,12).toString('ascii'),'WEBP');
 assert.equal(b.subarray(12,16).toString('ascii'),'VP8X');
 assert.ok((b[20]&0x10)!==0,'alpha');
 assert.equal(b.readUIntLE(24,3)+1,1024);
 assert.equal(b.readUIntLE(27,3)+1,1024);
 assert.equal(createHash('sha256').update(b).digest('hex'),hash);
});
test('all ten previous Film & TV and seven Scenekunst badge refs preserved',()=>{
 const film=load('data/badges/film_tv.json');
 const scene=load('data/badges/scenekunst.json');
 const {arkiv_og_kanon,...before}=film.subBadgeImages;
 assert.equal(arkiv_og_kanon,path);
 assert.deepEqual(before,{
  "spillefilm": "bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp",
  "kortfilm": "bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp",
  "dokumentarfilm": "bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp",
  "tv_serier": "bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp",
  "nyheter_og_reportasje": "bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp",
  "klassikere": "bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp",
  "norsk_film_og_tv": "bilder/merker/film_tv/undermerker/norsk_film_og_tv-brodert-v1.webp",
  "filmfestivaler": "bilder/merker/film_tv/undermerker/filmfestivaler-brodert-v3.webp",
  "filmlocations": "bilder/merker/film_tv/undermerker/filmlocations-brodert-v3.webp",
  "film_og_tv_produksjon": "bilder/merker/film_tv/undermerker/film_og_tv_produksjon-brodert-v1.webp"
});
 assert.equal(Object.keys(scene.subBadgeImages).length,7);
 for(const id of scene.sub) assert.ok(scene.subBadgeImages[id]);
});
