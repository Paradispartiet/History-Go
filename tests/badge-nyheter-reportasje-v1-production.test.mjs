import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const path='bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp';
test('Nyheter og reportasje: actual WebP, correct labels and active manifest',()=>{
 const f=read('data/badges/film_tv.json'),m=read('data/badges/underbadge_batch01_production.json');
 const a=m.families.film_tv.assets.find(x=>x.id==='nyheter_og_reportasje'),b=a.productionBrief;
 assert.equal(f.color.toUpperCase(),'#C2188B');
 assert.equal(f.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(f.subBadgeImages.nyheter_og_reportasje,path);
 assert.equal(a.selectedImage,path);
 assert.equal(a.status,'integrated');
 assert.equal(a.quality.visualApproved,true);
 assert.equal(a.quality.technicalApproved,true);
 assert.equal(a.visualReview.upperLabel,'NYHETER OG REPORTASJE');
 assert.equal(a.visualReview.lowerLabel,'FILM & TV');
 assert.equal(b.status,'fulfilled_v1_active');
 assert.equal(b.selectedImage,path);
 assert.equal(b.visualApproved,true);
 assert.equal(b.technicalApproved,true);
 const raw=readFileSync(new URL('../'+path,import.meta.url));
 assert.equal(raw.length,477942);
 assert.equal(raw.toString('ascii',0,4),'RIFF');
 assert.equal(raw.toString('ascii',8,12),'WEBP');
 assert.equal(raw.toString('ascii',12,16),'VP8X');
 assert.ok((raw[20]&0x10)!==0,'WebP has alpha channel');
 assert.equal(raw.readUIntLE(24,3)+1,1024);
 assert.equal(raw.readUIntLE(27,3)+1,1024);
 assert.equal(createHash('sha256').update(raw).digest('hex'),a.sha256);
});
test('Four prior Film & TV and seven Scenekunst links remain protected',()=>{
 const film=read('data/badges/film_tv.json'),scene=read('data/badges/scenekunst.json');
 const expected={
  spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
  kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
  dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
  tv_serier:'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp'
 };
 for(const [id,file] of Object.entries(expected))assert.equal(film.subBadgeImages[id],file);
 assert.equal(Object.keys(film.subBadgeImages).length,5);
 assert.equal(Object.keys(scene.subBadgeImages).length,7);
 for(const id of scene.sub)assert.ok(scene.subBadgeImages[id],id);
});
