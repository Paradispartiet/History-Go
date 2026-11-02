import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
test('TV-serier badge must have correct top and bottom embroidered labels',()=>{
 const f=read('data/badges/film_tv.json'),m=read('data/badges/underbadge_batch01_production.json');
 const a=m.families.film_tv.assets.find(a=>a.id==='tv_serier'),b=a.productionBrief;
 assert.equal(f.color.toUpperCase(),'#C2188B');
 assert.equal(f.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(f.subBadgeImages?.tv_serier,undefined);
 assert.equal(a.status,'planned');assert.equal(a.selectedImage,null);
 assert.equal(b.status,'artwork_required_no_accepted_image');
 assert.equal(b.titleInsidePatch,'TV-SERIER');
 assert.equal(b.parentLabelInsidePatch,'FILM & TV');
 assert.equal(b.labelRules.parentSizeRelativeToSubcategory,0.48);
 assert.equal(b.labelRules.textEmbroidered,true);
 assert.equal(b.palette.primary.toUpperCase(),f.color.toUpperCase());
 assert.equal(b.palette.secondary.toUpperCase(),f.secondaryColor.toUpperCase());
 assert.equal(b.visualApproved,false);assert.equal(b.selectedImage,null);
 assert.ok(b.strictAvoid.includes('dokumentarfilm_label'));
 assert.ok(b.strictAvoid.includes('contact_sheet_crop'));
 assert.equal(b.targetPath,'bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp');
});
test('Existing Film & TV and Scenekunst image links remain protected',()=>{
 const film=read('data/badges/film_tv.json'),scene=read('data/badges/scenekunst.json');
 assert.deepEqual(film.subBadgeImages,{
 spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
 kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
 dokumentarfilm:'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp'
 });
 assert.equal(Object.keys(scene.subBadgeImages).length,7);
 for(const id of scene.sub)assert.ok(scene.subBadgeImages[id]);
});
