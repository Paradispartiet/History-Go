import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const plan=read('data/badges/underbadge_batch01_production.json');
const firstPilotKeys=['scenekunst/teater','by/klassisk_arkitektur','film_tv/spillefilm'];
const approvedMain={
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
test('nine candidate WebPs match the exact 29 registered undercategories without activation',()=>{
 assert.equal(plan.version,1);
 assert.equal(plan.status,'nine_images_uploaded_not_approved');
 assert.deepEqual(plan.pilot.map(p=>p.categoryId+'/'+p.subId),firstPilotKeys);
 const counts={scenekunst:7,by:10,film_tv:12};
 let total=0,uploaded=0;
 for(const [id,count] of Object.entries(counts)){
  const parent=read('data/badges/'+id+'.json'),family=plan.families[id];
  assert.equal(family.parentImage,parent.image);
  assert.equal(family.primaryColor.toUpperCase(),parent.color.toUpperCase());
  assert.equal(family.secondaryColor.toUpperCase(),parent.secondaryColor.toUpperCase());
  assert.equal(family.assets.length,count);
  assert.deepEqual(family.assets.map(a=>a.id),parent.sub);
  assert.equal(parent.subBadgeImages,undefined,id+' underbadges cannot be enabled before visual signoff');
  for(const asset of family.assets){
   const path='bilder/merker/'+id+'/undermerker/'+asset.id+'-brodert-v1.webp';
   assert.equal(asset.proposedFile,path);
   assert.equal(asset.selectedImage,null,id+'/'+asset.id);
   assert.equal(asset.quality.visualApproved,false);
   assert.ok(asset.label.length>=3&&asset.motif.length>=25);
   if(asset.status==='rendered_candidate'){
     uploaded++;
     assert.equal(asset.candidateImage,path);
     assert.equal(asset.letteringInsideBorder,true);
     assert.equal(asset.width,1024);
     assert.equal(asset.height,1024);
     const content=readFileSync(resolve(root,path));
     assert.equal(content.length,asset.bytes,id+'/'+asset.id+' bytes');
     assert.equal(content.toString('ascii',0,4),'RIFF');
     assert.equal(content.toString('ascii',8,12),'WEBP');
     assert.equal(content.toString('ascii',12,16),'VP8X');
     assert.equal(content.readUIntLE(24,3)+1,1024);
     assert.equal(content.readUIntLE(27,3)+1,1024);
     assert.equal(createHash('sha256').update(content).digest('hex'),asset.sha256,id+'/'+asset.id+' SHA-256');
   }else{
     assert.equal(asset.status,'planned');
     assert.ok(!existsSync(resolve(root,path)));
   }
   total++;
  }
 }
 assert.equal(total,29);
 assert.equal(uploaded,9);
 assert.equal(plan.families.scenekunst.assets.filter(a=>a.status==='rendered_candidate').length,7);
});
test('all nine protected main and 15 approved Religion/Vitenskap underbadge files remain untouched',()=>{
 for(const [id,path] of Object.entries(approvedMain)){
  const badge=read('data/badges/'+id+'.json');
  assert.equal(badge.image,path,id+' main image');
  assert.ok(existsSync(resolve(root,path)),path);
 }
 for(const [id,n] of [['religion',8],['vitenskap',7]]){
  const original=read('data/badges/'+id+'_underbadge_artwork.json');
  assert.equal(original.assets.length,n);
  for(const asset of original.assets)assert.ok(existsSync(resolve(root,asset.image)),asset.image);
 }
});
