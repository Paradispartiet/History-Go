import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const plan=read('data/badges/underbadge_batch01_production.json');
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
test('batch 01 designs describe 29 real category sub-IDs without activating images',()=>{
 assert.equal(plan.version,1);
 assert.equal(plan.status,'design_only');
 const counts={scenekunst:7,by:10,film_tv:12};
 const pilotIds=plan.pilot.map(p=>p.categoryId+'/'+p.subId);
 assert.deepEqual(pilotIds,['scenekunst/teater','by/klassisk_arkitektur','film_tv/spillefilm']);
 let total=0;
 for(const [id,count] of Object.entries(counts)){
  const parent=read('data/badges/'+id+'.json');
  const family=plan.families[id];
  assert.equal(family.categoryId,id);
  assert.equal(family.parentImage,parent.image,id+' parent image unchanged');
  assert.equal(family.primaryColor.toUpperCase(),parent.color.toUpperCase(),id+' color');
  assert.equal(family.secondaryColor.toUpperCase(),parent.secondaryColor.toUpperCase(),id+' secondary');
  assert.equal(family.assets.length,count);
  assert.deepEqual(family.assets.map(a=>a.id),parent.sub,id+' preserves category order and IDs');
  assert.equal(parent.subBadgeImages,undefined,id+' images must not be activated yet');
  for(const asset of family.assets){
   assert.ok(asset.label.length>=3);
   assert.ok(asset.motif.length>=25);
   assert.ok(asset.avoid.length>=8);
   assert.equal(asset.status,'planned');
   assert.equal(asset.selectedImage,null);
   assert.equal(asset.quality.visualApproved,false);
   assert.equal(asset.quality.technicalApproved,false);
   assert.equal(asset.proposedFile,'bilder/merker/'+id+'/undermerker/'+asset.id+'-brodert-v1.webp');
   assert.ok(!existsSync(resolve(root,asset.proposedFile)),'candidate image unexpectedly present without status change: '+asset.id);
   total++;
  }
 }
 assert.equal(total,29);
});
test('nine protected main images and fifteen approved underbadges remain linked',()=>{
 for(const [id,path] of Object.entries(protectedMain)){
  assert.equal(read('data/badges/'+id+'.json').image,path,id);
  assert.ok(existsSync(resolve(root,path)),path);
 }
 for(const [id,n] of [['religion',8],['vitenskap',7]]){
  const m=read('data/badges/'+id+'_underbadge_artwork.json');
  assert.equal(m.assets.length,n);
  for(const a of m.assets)assert.ok(existsSync(resolve(root,a.image)),a.image);
 }
});
