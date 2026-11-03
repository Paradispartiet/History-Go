import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const approved={
 teater:{file:'bilder/merker/scenekunst/undermerker/teater-brodert-v2.webp',sha:'bfa38522935c7895a495a2b470b77120e9164037c5832e6125d8448f305948ad',bytes:449234,version:'v2'},
 musikkteater:{file:'bilder/merker/scenekunst/undermerker/musikkteater-brodert-v3.webp',sha:'af61d254d71bc8bf5c29609c8839c352553c9b2b79973e48d1cbd8e72e0ab650',bytes:390198,version:'v3'}
};
test('Teater v2 and Musikkteater v3 are both active and byte-identical to reviewed WebP assets',()=>{
 const registry=read('data/badges/scenekunst.json');
 const manifest=read('data/badges/underbadge_batch01_production.json');
 assert.equal(manifest.status,'seven_scenekunst_active_remaining_by_film_pending');
 assert.equal(registry.color.toUpperCase(),'#C96E8B');
 assert.equal(registry.secondaryColor.toUpperCase(),'#808080');
 assert.equal(Object.keys(registry.subBadgeImages).length,7);
 assert.deepEqual(new Set(Object.keys(registry.subBadgeImages)),new Set(registry.sub));
 for(const [id,expected] of Object.entries(approved)){
  const asset=manifest.families.scenekunst.assets.find(x=>x.id===id),c=asset.replacementCandidate;
  assert.equal(asset.selectedImage,expected.file);
  assert.equal(registry.subBadgeImages[id],expected.file);
  assert.equal(c.version,expected.version);
  assert.equal(c.selectedImage,expected.file);
  assert.equal(c.status,'active');
  assert.equal(c.visualApproved,true);
  assert.equal(c.repositoryUploaded,true);
  assert.equal(c.technicalApproved,true);
  assert.equal(c.letteringInsideBorder,true);
  assert.equal(c.primaryColor.toUpperCase(),registry.color.toUpperCase());
  assert.equal(c.secondaryColor.toUpperCase(),registry.secondaryColor.toUpperCase());
  const bytes=readFileSync(new URL('../'+expected.file,import.meta.url));
  assert.equal(bytes.length,expected.bytes);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.readUInt32LE(4)+8,bytes.length);
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(bytes.toString('ascii',12,16),'VP8X');
  assert.equal(bytes.readUIntLE(24,3)+1,1024);
  assert.equal(bytes.readUIntLE(27,3)+1,1024);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),expected.sha);
  assert.equal(c.sha256,expected.sha);
 }
});
test('Existing five Scenekunst underbadges remain mapped to original approved versions',()=>{
 const r=read('data/badges/scenekunst.json');
 const before={
  sceneproduksjon:'sceneproduksjon-brodert-v3.webp',
  regi:'regi-brodert-v3.webp',
  dramaturgi:'dramaturgi-brodert-v3.webp',
  dans:'dans-brodert-v2.webp',
  performance:'performance-brodert-v2.webp'
 };
 for(const [id,file] of Object.entries(before)){
  assert.equal(r.subBadgeImages[id],'bilder/merker/scenekunst/undermerker/'+file);
  const manifest=read('data/badges/underbadge_batch01_production.json');
  const asset=manifest.families.scenekunst.assets.find(x=>x.id===id);
  assert.equal(asset.selectedImage,r.subBadgeImages[id]);
 }
});
