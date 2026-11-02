import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
test('Spillefilm v2 requires independent approved artwork before any activation',()=>{
 const film=read('data/badges/film_tv.json');
 const manifest=read('data/badges/underbadge_batch01_production.json');
 const a=manifest.families.film_tv.assets.find(x=>x.id==='spillefilm');
 const brief=a.redesignBrief;
 assert.equal(film.image,'bilder/merker/film_tv-brodert-v5.webp');
 assert.equal(film.color.toUpperCase(),'#C2188B');
 assert.equal(film.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(film.subBadgeImages?.spillefilm,undefined);
 assert.equal(a.selectedImage,null);
 assert.equal(a.status,'rework_required');
 assert.equal(brief.approved,false);
 assert.equal(brief.selectedImage,null);
 assert.equal(brief.labelInsideBorder,'SPILLEFILM');
 assert.equal(brief.primaryColor.toUpperCase(),film.color.toUpperCase());
 assert.equal(brief.secondaryColor.toUpperCase(),film.secondaryColor.toUpperCase());
 assert.ok(brief.strictlyAvoid.includes('movie_camera'));
 assert.ok(brief.strictlyAvoid.includes('contact_sheet_crop'));
 assert.ok(brief.mustHave.includes('embroidered_curved_upper_label_inside_patch'));
});
test('Seven Scenekunst underbadge links remain untouched',()=>{
 const scene=read('data/badges/scenekunst.json');
 assert.equal(Object.keys(scene.subBadgeImages).length,7);
 for(const id of scene.sub)assert.ok(scene.subBadgeImages[id],id);
});
