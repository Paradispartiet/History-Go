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
test('nine original v1 candidates and five active Scenekunst images are registered correctly',()=>{
 assert.equal(plan.version,1);
 assert.equal(plan.status,'five_scenekunst_active_one_v1_pending_remaining_rework');
 assert.deepEqual(plan.pilot.map(p=>p.categoryId+'/'+p.subId),firstPilotKeys);
 const counts={scenekunst:7,by:10,film_tv:12};
 const activated={"sceneproduksjon":"bilder/merker/scenekunst/undermerker/sceneproduksjon-brodert-v3.webp","regi":"bilder/merker/scenekunst/undermerker/regi-brodert-v3.webp","dramaturgi":"bilder/merker/scenekunst/undermerker/dramaturgi-brodert-v3.webp","dans":"bilder/merker/scenekunst/undermerker/dans-brodert-v2.webp","performance":"bilder/merker/scenekunst/undermerker/performance-brodert-v2.webp"};
 let total=0,uploaded=0;
 for(const [id,count] of Object.entries(counts)){
  const parent=read('data/badges/'+id+'.json'),family=plan.families[id];
  assert.equal(family.parentImage,parent.image);
  assert.equal(family.primaryColor.toUpperCase(),parent.color.toUpperCase());
  assert.equal(family.secondaryColor.toUpperCase(),parent.secondaryColor.toUpperCase());
  assert.equal(family.assets.length,count);
  assert.deepEqual(family.assets.map(a=>a.id),parent.sub);
  if(id==='scenekunst') assert.deepEqual(parent.subBadgeImages,activated);
  else assert.equal(parent.subBadgeImages,undefined,id+' other underbadges remain inactive');
  for(const asset of family.assets){
   const path='bilder/merker/'+id+'/undermerker/'+asset.id+'-brodert-v1.webp';
   assert.equal(asset.proposedFile,path);
   assert.equal(asset.selectedImage,id==='scenekunst'&&activated[asset.id]?activated[asset.id]:null,id+'/'+asset.id);
   assert.equal(asset.quality.visualApproved,false);
   assert.ok(asset.label.length>=3&&asset.motif.length>=25);
   if(asset.status==='rendered_candidate'||asset.status==='rework_required'){
     if(asset.status==='rework_required'){
       assert.equal(asset.visualReview?.result,'rejected',id+'/'+asset.id);
       assert.ok(asset.visualReview.reason.length>25);
       assert.equal(asset.quality.visualApproved,false);
     }
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
 assert.equal(plan.families.scenekunst.assets.filter(a=>a.status==='rendered_candidate').length,0);
 assert.equal(plan.families.scenekunst.assets.filter(a=>a.status==='rework_required').length,7);
 assert.equal(plan.families.film_tv.assets.filter(a=>a.status==='rework_required').length,1);
 assert.equal(plan.families.by.assets.filter(a=>a.status==='rendered_candidate').length,1);
});
test('Dans and Performance v2 are uploaded, verified and activated',()=>{
 const expected={
  dans:{bytes:442262,sha256:'ca83f80cc601841cc660b163b15c8df606b0d820660a40d946c00f8d986ef93d'},
  performance:{bytes:348476,sha256:'ef3ecddf2bad45be308126e04c3888ce102bac2fd3e7efffba45e8c645b62fec'}
 };
 const parent=read('data/badges/scenekunst.json');
 for(const [id,record] of Object.entries(expected)){
  const asset=plan.families.scenekunst.assets.find(x=>x.id===id);
  const v2=asset.replacementCandidate;
  const path='bilder/merker/scenekunst/undermerker/'+id+'-brodert-v2.webp';
  assert.equal(v2.version,'v2');
  assert.equal(asset.selectedImage,path);
  assert.equal(parent.subBadgeImages[id],path);
  assert.equal(v2.proposedImage,path);
  assert.equal(v2.selectedImage,path);
  assert.equal(v2.status,'active');
  assert.equal(v2.repositoryUploaded,true);
  assert.equal(v2.visualApproved,true);
  assert.equal(v2.letteringInsideBorder,true);
  assert.equal(v2.primaryColor.toUpperCase(),plan.families.scenekunst.primaryColor.toUpperCase());
  assert.equal(v2.secondaryColor.toUpperCase(),plan.families.scenekunst.secondaryColor.toUpperCase());
  const buf=readFileSync(resolve(root,path));
  assert.equal(buf.length,record.bytes);
  assert.equal(v2.bytes,record.bytes);
  assert.equal(buf.toString('ascii',0,4),'RIFF');
  assert.equal(buf.readUInt32LE(4)+8,buf.length);
  assert.equal(buf.toString('ascii',8,12),'WEBP');
  assert.equal(buf.readUIntLE(24,3)+1,1024);
  assert.equal(buf.readUIntLE(27,3)+1,1024);
  assert.equal(createHash('sha256').update(buf).digest('hex'),record.sha256);
  assert.equal(v2.sha256,record.sha256);
 }
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

test('Scenekunst v3 images are traceable, activated, and verified',()=>{
 const activated={"sceneproduksjon":"bilder/merker/scenekunst/undermerker/sceneproduksjon-brodert-v3.webp","regi":"bilder/merker/scenekunst/undermerker/regi-brodert-v3.webp","dramaturgi":"bilder/merker/scenekunst/undermerker/dramaturgi-brodert-v3.webp"};
 const expected={
  sceneproduksjon:'760f3690f092be148a52a64e10c3ec9e2daf517faf500c7c279546fdb2cc8de8',
  regi:'dd079e22ebbcb2a3304582aed087e22f42a422bf3652d588b756b2ad17ce005f',
  dramaturgi:'4ac17ef33751f174ca73642c70a7338b3e5da0d760f5a317107d91456812f3ab'
 };
 for(const [id,digest] of Object.entries(expected)){
  const asset=plan.families.scenekunst.assets.find(a=>a.id===id);
  assert.ok(asset,id+' registered');
  const v3=asset.replacementCandidate;
  assert.equal(v3.version,'v3');
  assert.equal(v3.sha256,digest,id+' independently pinned SHA-256');
  assert.equal(v3.proposedImage,'bilder/merker/scenekunst/undermerker/'+id+'-brodert-v3.webp');
  assert.equal(v3.width,1024);
  assert.equal(v3.height,1024);
  assert.equal(v3.primaryColor.toUpperCase(),plan.families.scenekunst.primaryColor.toUpperCase());
  assert.equal(v3.secondaryColor.toUpperCase(),plan.families.scenekunst.secondaryColor.toUpperCase());
  assert.equal(v3.visualApproved,true);
  assert.equal(v3.selectedImage,activated[id]);
  assert.equal(asset.selectedImage,activated[id]);
  const dest=resolve(root,v3.proposedImage);
  if(!v3.repositoryUploaded){
   assert.equal(v3.status,'local_candidate_pending_upload_and_approval');
   assert.ok(!existsSync(dest),id+' not recorded as uploaded, so file should not yet exist');
   continue;
  }
  assert.equal(v3.status,'active');
  assert.ok(existsSync(dest),id+' is recorded as uploaded');
  const buf=readFileSync(dest);
  assert.equal(buf.length,v3.bytes,id+' byte count');
  assert.equal(buf.toString('ascii',0,4),'RIFF');
  assert.equal(buf.readUInt32LE(4)+8,buf.length,'valid RIFF size');
  assert.equal(buf.toString('ascii',8,12),'WEBP');
  const subtype=buf.toString('ascii',12,16);
  let width,height,hasAlpha;
  if(subtype==='VP8X'){
   width=buf.readUIntLE(24,3)+1;
   height=buf.readUIntLE(27,3)+1;
   hasAlpha=!!(buf[20]&0x10);
  }else if(subtype==='VP8L'){
   assert.equal(buf[20],0x2f,'VP8L signature');
   const bits=buf.readUInt32LE(21);
   width=(bits&0x3fff)+1;
   height=((bits>>>14)&0x3fff)+1;
   hasAlpha=!!(bits&0x10000000);
  }else assert.fail(id+' unexpected WebP subtype '+subtype);
  assert.equal(width,1024,id+' width');
  assert.equal(height,1024,id+' height');
  assert.ok(hasAlpha,id+' WebP alpha channel');
  assert.equal(createHash('sha256').update(buf).digest('hex'),digest,id+' file SHA-256');
 }
});
