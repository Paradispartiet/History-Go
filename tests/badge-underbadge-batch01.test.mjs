import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const plan=read('data/badges/underbadge_batch01_production.json');
const pilotKeys=new Set(['scenekunst/teater','by/klassisk_arkitektur','film_tv/spillefilm']);
const protectedMain={
  historie:'bilder/merker/historie.PNG',
  sport:'bilder/merker/sport.PNG',
  politikk:'bilder/merker/politikk.PNG',
  naeringsliv:'bilder/merker/naeringsliv3.webp',
  subkultur:'bilder/merker/Subkultur3.PNG',
  religion:'bilder/merker/religion-godkjent.webp',
  kunst:'bilder/merker/kunst-brodert.webp',
  media:'bilder/merker/media-brodert-lysbla.webp',
  vitenskap:'bilder/merker/vitenskap/brodert/vitenskap.webp'
};
test('29 production designs track registered undercategories without activating unapproved artwork',()=>{
 assert.equal(plan.version,1);
 assert.equal(plan.status,'three_images_uploaded_not_approved');
 const counts={scenekunst:7,by:10,film_tv:12};
 assert.deepEqual(plan.pilot.map(p=>p.categoryId+'/'+p.subId),[...pilotKeys]);
 let total=0,uploaded=0;
 for(const [id,count] of Object.entries(counts)){
   const parent=read('data/badges/'+id+'.json');
   const family=plan.families[id];
   assert.equal(family.parentImage,parent.image);
   assert.equal(family.primaryColor.toUpperCase(),parent.color.toUpperCase());
   assert.equal(family.secondaryColor.toUpperCase(),parent.secondaryColor.toUpperCase());
   assert.equal(family.assets.length,count);
   assert.deepEqual(family.assets.map(a=>a.id),parent.sub);
   assert.equal(parent.subBadgeImages,undefined,id+' category underbadges must not be activated yet');
   for(const asset of family.assets){
     assert.equal(asset.selectedImage,null);
     assert.equal(asset.quality.visualApproved,false);
     assert.ok(asset.label.length>=3&&asset.motif.length>=25);
     const key=id+'/'+asset.id;
     const p='bilder/merker/'+id+'/undermerker/'+asset.id+'-brodert-v1.webp';
     assert.equal(asset.proposedFile,p);
     if(pilotKeys.has(key)){
       uploaded++;
       assert.equal(asset.status,'rendered_candidate');
       assert.equal(asset.candidateImage,p);
       assert.equal(asset.letteringInsideBorder,true);
       assert.equal(asset.width,1024);
       assert.equal(asset.height,1024);
       const bytes=readFileSync(resolve(root,p));
       assert.equal(bytes.length,asset.bytes);
       assert.equal(bytes.toString('ascii',0,4),'RIFF');
       assert.equal(bytes.toString('ascii',8,12),'WEBP');
       assert.equal(bytes.toString('ascii',12,16),'VP8X');
       assert.equal(bytes.readUIntLE(24,3)+1,1024);
       assert.equal(bytes.readUIntLE(27,3)+1,1024);
       assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
     } else {
       assert.equal(asset.status,'planned');
       assert.equal(asset.selectedImage,null);
       assert.ok(!existsSync(resolve(root,p)));
     }
     total++;
   }
 }
 assert.equal(total,29);
 assert.equal(uploaded,3);
});
test('approved main badges and fifteen Religion/Vitenskap underbadges still exist',()=>{
 for(const [id,p] of Object.entries(protectedMain)){
   assert.equal(read('data/badges/'+id+'.json').image,p,id);
   assert.ok(existsSync(resolve(root,p)),p);
 }
 for(const [id,count] of [['religion',8],['vitenskap',7]]){
   const registered=read('data/badges/'+id+'_underbadge_artwork.json');
   assert.equal(registered.assets.length,count);
   for(const x of registered.assets)assert.ok(existsSync(resolve(root,x.image)),x.image);
 }
});
