import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('Filmklassikere: correct two labels and independent image required before activation',()=>{
 const f=read('data/badges/film_tv.json'),m=read('data/badges/underbadge_batch01_production.json');
 const a=m.families.film_tv.assets.find(a=>a.id==='klassikere'),b=a.productionBrief;
 assert.equal(f.color.toUpperCase(),'#C2188B');
 assert.equal(f.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(a.status,'planned');
 assert.equal(a.selectedImage,null);
 assert.equal(f.subBadgeImages?.klassikere,undefined);
 assert.equal(b.upperLabel,'FILMKLASSIKERE');
 assert.equal(b.lowerLabel,'FILM & TV');
 assert.equal(b.status,'artwork_required_no_accepted_image');
 assert.equal(b.visualApproved,false);assert.equal(b.technicalApproved,false);
 assert.equal(b.selectedImage,null);
 assert.equal(b.imagePath,'bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp');
 assert.ok(b.avoid.includes('nyheter_og_reportasje_label'));
 assert.ok(b.distinctFrom.includes('spillefilm'));
 assert.ok(b.mandatory.includes('single_independent_emblem'));
});
test('Prior Film & TV and Scenekunst underbadges are preserved unchanged',()=>{
 const f=read('data/badges/film_tv.json'),s=read('data/badges/scenekunst.json');
 assert.deepEqual(f.subBadgeImages,{
  spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
  kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
  dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
  tv_serier:'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp',
  nyheter_og_reportasje:'bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp'
 });
 assert.equal(Object.keys(s.subBadgeImages).length,7);
 for(const id of s.sub)assert.ok(s.subBadgeImages[id]);
});
