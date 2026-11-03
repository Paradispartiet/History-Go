import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const imagePath='bilder/merker/by/undermerker/postmodernisme-brodert-v1.webp';
const expected='f87aa141d10d49d7b0737691fbb78ba436b93a3ba61a48238c4bef60f640bc12';
test('By Postmodernisme is fifth original 1024px WebP without altering other badges',()=>{
 const by=read('data/badges/by.json'), prod=read('data/badges/underbadge_batch01_production.json');
 assert.equal(by.sub.length,10);
 assert.equal(Object.keys(by.subBadgeImages).length,5);
 assert.deepEqual(by.subBadgeImages,{
  klassisk_arkitektur:'bilder/merker/by/undermerker/klassisk_arkitektur-brodert-v2.webp',
  modernisme:'bilder/merker/by/undermerker/modernisme-brodert-v1.webp',
  funksjonalisme:'bilder/merker/by/undermerker/funksjonalisme-brodert-v1.webp',
  brutalisme:'bilder/merker/by/undermerker/brutalisme-brodert-v1.webp',
  postmodernisme:imagePath,
 });
 assert.equal(by.color,'#808080');
 assert.equal(by.secondaryColor,'#404040');
 const asset=prod.families.by.assets.find(x=>x.id==='postmodernisme');
 assert.equal(asset.status,'integrated');
 assert.equal(asset.selectedImage,imagePath);
 assert.deepEqual(asset.quality,{visualApproved:true,technicalApproved:true});
 const file=readFileSync(new URL(imagePath,root));
 assert.equal(file.length,478508);
 assert.equal(file.toString('ascii',0,4),'RIFF');
 assert.equal(file.toString('ascii',8,12),'WEBP');
 assert.equal(file.toString('ascii',12,16),'VP8X');
 assert.ok(file[20]&0x10);
 assert.equal(file.readUIntLE(24,3)+1,1024);
 assert.equal(file.readUIntLE(27,3)+1,1024);
 assert.equal(createHash('sha256').update(file).digest('hex'),expected);
 for(const id of by.sub.slice(5)) assert.equal(by.subBadgeImages[id],undefined);
});
