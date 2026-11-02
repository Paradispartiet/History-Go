import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('Nyheter og reportasje requires correct dual stitched labels before activation',()=>{
 const f=read('data/badges/film_tv.json');
 const m=read('data/badges/underbadge_batch01_production.json');
 const a=m.families.film_tv.assets.find(x=>x.id==='nyheter_og_reportasje');
 const b=a.productionBrief;
 assert.equal(f.color.toUpperCase(),'#C2188B');
 assert.equal(f.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(a.status,'planned');assert.equal(a.selectedImage,null);
 assert.equal(f.subBadgeImages?.nyheter_og_reportasje,undefined);
 assert.equal(b.status,'artwork_required_no_accepted_image');
 assert.equal(b.upperLabel,'NYHETER OG REPORTASJE');
 assert.equal(b.lowerLabel,'FILM & TV');
 assert.equal(b.visualApproved,false);assert.equal(b.technicalApproved,false);
 assert.equal(b.selectedImage,null);
 assert.ok(b.mustHave.includes('precisely_spelled_upper_label'));
 assert.ok(b.distinctFrom.includes('tv_serier'));
 assert.equal(b.imagePath,'bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp');
});
test('All approved earlier Film and Scenekunst image links are preserved',()=>{
 const film=read('data/badges/film_tv.json'),scene=read('data/badges/scenekunst.json');
 assert.deepEqual(film.subBadgeImages,{
 spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
 kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
 dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
 tv_serier:'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp'
 });
 assert.equal(Object.keys(scene.subBadgeImages).length,7);
 for(const id of scene.sub)assert.ok(scene.subBadgeImages[id],id);
});
