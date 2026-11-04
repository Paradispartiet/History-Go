import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));

test('Byplanlegging candidate documents five languages while six prior By badges remain active',()=>{
 const candidate=read('data/badges/byplanlegging_candidate_v1.json');
 const by=read('data/badges/by.json');
 assert.equal(candidate.categoryId,'by');
 assert.equal(candidate.id,'byplanlegging');
 assert.equal(candidate.status,'candidate_pending_binary_upload');
 assert.equal(candidate.quality.registered,false);
 assert.deepEqual(candidate.size,[1024,1024]);
 assert.deepEqual(Object.keys(candidate.variants),['nb','en','es','pt','fr']);
 assert.deepEqual(by.subBadgeImages,{
  klassisk_arkitektur:'bilder/merker/by/undermerker/klassisk_arkitektur-brodert-v2.webp',
  modernisme:'bilder/merker/by/undermerker/modernisme-brodert-v1.webp',
  funksjonalisme:'bilder/merker/by/undermerker/funksjonalisme-brodert-v1.webp',
  brutalisme:'bilder/merker/by/undermerker/brutalisme-brodert-v1.webp',
  postmodernisme:'bilder/merker/by/undermerker/postmodernisme-brodert-v1.webp',
  samtidsarkitektur:'bilder/merker/by/undermerker/samtidsarkitektur-brodert-v1.webp'
 });
 assert.equal(by.subBadgeImages.byplanlegging,undefined,'Do not activate unmerged art');
});

test('Any uploaded Byplanlegging WebP must match pinned original and locale hashes',()=>{
 const c=read('data/badges/byplanlegging_candidate_v1.json');
 for(const [locale,info] of Object.entries(c.variants)){
  assert.match(info.sha256,/^[a-f0-9]{64}$/);
  assert.ok(info.bytes>400000);
  const p=new URL(info.path,root);
  if(!existsSync(p))continue; // Draft PR: binary files are not yet uploaded.
  const bytes=readFileSync(p);
  assert.equal(bytes.length,info.bytes,locale+' size');
  assert.equal(bytes.toString('ascii',0,4),'RIFF',locale);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',locale);
  assert.equal(bytes.toString('ascii',12,16),'VP8X',locale);
  assert.equal(bytes.readUIntLE(24,3)+1,1024,locale);
  assert.equal(bytes.readUIntLE(27,3)+1,1024,locale);
  assert.ok(bytes[20]&0x10,locale+' alpha');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),info.sha256,locale);
 }
});
