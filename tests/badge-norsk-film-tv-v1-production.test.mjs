import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('Norsk film og TV requires genuine correctly labeled embroidered artwork before activation',()=>{
 const f=read('data/badges/film_tv.json'),m=read('data/badges/underbadge_batch01_production.json');
 const a=m.families.film_tv.assets.find(x=>x.id==='norsk_film_og_tv'),b=a.productionBrief;
 assert.equal(f.color.toUpperCase(),'#C2188B');
 assert.equal(f.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(a.status,'planned');
 assert.equal(a.selectedImage,null);
 assert.equal(f.subBadgeImages?.norsk_film_og_tv,undefined);
 assert.equal(b.topLabel,'NORSK FILM OG TV');
 assert.equal(b.bottomLabel,'FILM & TV');
 assert.equal(b.bottomRelativeSize,0.48);
 assert.equal(b.status,'artwork_required_no_accepted_image');
 assert.equal(b.visualApproved,false);
 assert.equal(b.technicalApproved,false);
 assert.equal(b.selectedImage,null);
 assert.equal(b.targetPath,'bilder/merker/film_tv/undermerker/norsk_film_og_tv-brodert-v1.webp');
 assert.ok(b.avoid.includes('ANIMASJON_label'));
 assert.ok(b.avoid.includes('copyrighted_film_still'));
 assert.ok(b.requirements.includes('visual_review_before_activation'));
});
test('six Film & TV and seven Scenekunst underbadges are preserved',()=>{
 const f=read('data/badges/film_tv.json'),s=read('data/badges/scenekunst.json');
 const expected={
 spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
 kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
 dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp',
 tv_serier:'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp',
 nyheter_og_reportasje:'bilder/merker/film_tv/undermerker/nyheter_og_reportasje-brodert-v1.webp',
 klassikere:'bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp'
 };
 assert.deepEqual(f.subBadgeImages,expected);
 assert.equal(Object.keys(s.subBadgeImages).length,7);
 for(const id of s.sub)assert.ok(s.subBadgeImages[id]);
});
