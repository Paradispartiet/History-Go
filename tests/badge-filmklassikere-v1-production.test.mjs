import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('Filmklassikere correct labels, real WebP, SHA and registered image',()=>{
 const f=read('data/badges/film_tv.json'),m=read('data/badges/underbadge_batch01_production.json');
 const a=m.families.film_tv.assets.find(a=>a.id==='klassikere'),b=a.productionBrief;
 const path='bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp';
 assert.equal(f.color.toUpperCase(),'#C2188B');
 assert.equal(f.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(a.status,'integrated');
 assert.equal(a.selectedImage,path);
 assert.equal(f.subBadgeImages.klassikere,path);
 assert.equal(a.quality.visualApproved,true);
 assert.equal(a.quality.technicalApproved,true);
 assert.equal(b.upperLabel,'FILMKLASSIKERE');
 assert.equal(b.lowerLabel,'FILM & TV');
 assert.equal(b.status,'fulfilled_v1_active');
 assert.equal(b.visualApproved,true);
 assert.equal(b.technicalApproved,true);
 assert.equal(b.selectedImage,path);
 assert.equal(b.visualAcceptance.imageFileApproved,true);
 assert.equal(b.visualAcceptance.status,'approved_independent_embroidery_asset');
 assert.equal(b.visualAcceptance.imageFileSHA256,a.sha256);
 const bytes=readFileSync(new URL('../'+path,import.meta.url));
 assert.equal(bytes.length,477120);
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.equal(bytes.toString('ascii',12,16),'VP8X');
 assert.equal(bytes.readUIntLE(24,3)+1,1024);
 assert.equal(bytes.readUIntLE(27,3)+1,1024);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'39b28542ca4ca9215c54d8810df6e57bac1816a9000c1bbd6943c957d11550d5');
});
test('Five prior Film & TV and seven Scenekunst underbadge links remain intact',()=>{
 const f=read('data/badges/film_tv.json'),s=read('data/badges/scenekunst.json');
 const prior={
  spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
  kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
  dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
  tv_serier:'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp',
  nyheter_og_reportasje:'bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp'
 };
 assert.equal(Object.keys(f.subBadgeImages).length,6);
 for(const [id,path] of Object.entries(prior))assert.equal(f.subBadgeImages[id],path);
 assert.equal(Object.keys(s.subBadgeImages).length,7);
 for(const id of s.sub)assert.ok(s.subBadgeImages[id]);
});
