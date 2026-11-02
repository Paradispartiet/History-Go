import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
test('Dokumentarfilm cannot activate a recycled Kortfilm badge',()=>{
 const film=read('data/badges/film_tv.json');
 const plan=read('data/badges/underbadge_batch01_production.json');
 const asset=plan.families.film_tv.assets.find(x=>x.id==='dokumentarfilm');
 const brief=asset.productionBrief;
 assert.equal(film.color.toUpperCase(),'#C2188B');
 assert.equal(film.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(film.subBadgeImages?.dokumentarfilm,undefined);
 assert.equal(asset.status,'planned');
 assert.equal(asset.selectedImage,null);
 assert.equal(brief.status,'artwork_required_no_accepted_image');
 assert.equal(brief.titleInsidePatch,'DOKUMENTARFILM');
 assert.notEqual(brief.titleInsidePatch,'KORTFILM');
 assert.equal(brief.palette.primary.toUpperCase(),film.color.toUpperCase());
 assert.equal(brief.palette.secondary.toUpperCase(),film.secondaryColor.toUpperCase());
 assert.ok(brief.avoid.includes('kortfilm_label'));
 assert.equal(brief.visualApproved,false);
 assert.equal(brief.selectedImage,null);
 assert.equal(brief.targetPath,'bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp');
});
test('Previously approved Film & TV and Scenekunst underbadge links remain',()=>{
 const film=read('data/badges/film_tv.json');
 assert.equal(film.subBadgeImages.spillefilm,'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp');
 assert.equal(film.subBadgeImages.kortfilm,'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp');
 const scene=read('data/badges/scenekunst.json');
 assert.equal(scene.sub.length,7);
 assert.equal(Object.keys(scene.subBadgeImages).length,7);
});
