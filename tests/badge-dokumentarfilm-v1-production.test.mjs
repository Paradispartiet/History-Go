import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const imagePath='bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp';
const knownSHA='5930257ad941f0d8359283bd55411a6085def63c114ade5b3fedd463bfc58b2d';
test('Dokumentarfilm WebP has correct identity and is activated only after visual QA',()=>{
 const film=read('data/badges/film_tv.json');
 const manifest=read('data/badges/underbadge_batch01_production.json');
 const asset=manifest.families.film_tv.assets.find(x=>x.id==='dokumentarfilm');
 const brief=asset.productionBrief;
 assert.equal(film.color.toUpperCase(),'#C2188B');
 assert.equal(film.secondaryColor.toUpperCase(),'#E7F8FF');
 assert.equal(film.subBadgeImages.dokumentarfilm,imagePath);
 assert.equal(asset.status,'integrated');
 assert.equal(asset.selectedImage,imagePath);
 assert.deepEqual(asset.quality,{visualApproved:true,technicalApproved:true});
 assert.equal(brief.approved,true);
 assert.equal(brief.visualApproved,true);
 assert.equal(brief.selectedImage,imagePath);
 assert.equal(brief.titleInsidePatch,'DOKUMENTARFILM');
 assert.equal(brief.parentLabelInsidePatch,'FILM & TV');
 assert.equal(brief.parentLabelPosition,'embroidered curved uppercase lettering INSIDE the lower inner rim');
 assert.equal(brief.parentLabelSizeRelativeToTitle,0.48);
 assert.equal(brief.parentLabelSecondaryThreadColor.toUpperCase(),film.secondaryColor.toUpperCase());
 assert.ok(brief.imageRules.includes('parent_label_FILM_AND_TV_inside_bottom_rim'));
 assert.equal(manifest.style.parentCategoryLabel.rule,'mandatory_for_all_new_subbadges');
 assert.notEqual(brief.titleInsidePatch,'KORTFILM');
 assert.equal(brief.palette.primary.toUpperCase(),film.color.toUpperCase());
 assert.equal(brief.palette.secondary.toUpperCase(),film.secondaryColor.toUpperCase());
 assert.equal(brief.targetPath,imagePath);
 const buffer=readFileSync(new URL('../'+imagePath,import.meta.url));
 assert.equal(buffer.length,474110);
 assert.equal(buffer.toString('ascii',0,4),'RIFF');
 assert.equal(buffer.readUInt32LE(4)+8,buffer.length);
 assert.equal(buffer.toString('ascii',8,12),'WEBP');
 assert.equal(buffer.toString('ascii',12,16),'VP8X');
 assert.ok(buffer[20]&0x10,'alpha channel');
 assert.equal(buffer.readUIntLE(24,3)+1,1024);
 assert.equal(buffer.readUIntLE(27,3)+1,1024);
 assert.equal(createHash('sha256').update(buffer).digest('hex'),knownSHA);
 assert.equal(asset.sha256,knownSHA);
 assert.equal(brief.sha256,knownSHA);
});
test('Other approved Film & TV and seven Scenekunst image links remain unchanged',()=>{
 const film=read('data/badges/film_tv.json');
 assert.deepEqual(film.subBadgeImages,{
  spillefilm:'bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp',
  kortfilm:'bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp',
  dokumentarfilm:imagePath
 });
 const scene=read('data/badges/scenekunst.json');
 assert.equal(scene.sub.length,7);
 assert.equal(Object.keys(scene.subBadgeImages).length,7);
 for(const id of scene.sub)assert.ok(scene.subBadgeImages[id],id);
});
