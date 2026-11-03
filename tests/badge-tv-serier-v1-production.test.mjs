import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const path='bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp';
test('TV-serier WebP is linked and has both embroidered category labels',()=>{
 const f=read('data/badges/film_tv.json'),m=read('data/badges/underbadge_batch01_production.json');
 const a=m.families.film_tv.assets.find(x=>x.id==='tv_serier'),b=a.productionBrief;
 assert.equal(f.color.toUpperCase(),'#C2188B');
 assert.equal(f.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(f.subBadgeImages.tv_serier,path);
 assert.equal(a.status,'integrated');assert.equal(a.selectedImage,path);
 assert.equal(a.quality.visualApproved,true);assert.equal(a.quality.technicalApproved,true);
 assert.equal(b.status,'fulfilled_v1_active');assert.equal(b.selectedImage,path);
 assert.equal(b.titleInsidePatch,'TV-SERIER');assert.equal(b.parentLabelInsidePatch,'FILM & TV');
 assert.equal(b.labelRules.parentSizeRelativeToSubcategory,0.48);
 assert.equal(b.labelRules.textEmbroidered,true);
 assert.equal(b.palette.primary.toUpperCase(),f.color.toUpperCase());
 assert.equal(b.palette.secondary.toUpperCase(),f.secondaryColor.toUpperCase());
 assert.equal(b.visualApproved,true);
 const bytes=readFileSync(new URL('../'+path,import.meta.url));
 assert.equal(bytes.length,448212);assert.equal(a.bytes,bytes.length);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.equal(bytes.toString('ascii',12,16),'VP8X');
 assert.equal(bytes.readUIntLE(24,3)+1,1024);assert.equal(bytes.readUIntLE(27,3)+1,1024);
 assert.equal(bytes[20]&16,16,'WebP alpha flag');
 const sha=createHash('sha256').update(bytes).digest('hex');
 assert.equal(sha,'63fe4ce0804be6842605359abee6501350ce1b012239157e6c76aa6b3d047a44');assert.equal(a.sha256,sha);
});
test('Previously approved Film & TV and Scenekunst images remain linked',()=>{
 const film=read('data/badges/film_tv.json'),scene=read('data/badges/scenekunst.json');
 assert.deepEqual(film.subBadgeImages,{
 spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
 kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
 dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
 tv_serier:path
 });
 assert.equal(Object.keys(scene.subBadgeImages).length,7);
 for(const id of scene.sub)assert.ok(scene.subBadgeImages[id]);
});
