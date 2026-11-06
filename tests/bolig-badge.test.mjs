import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
test('Bolig og bomiljø completes By 10/10, with nine previous badges preserved',()=>{
 const by=read('data/badges/by.json'),spec=read('data/badges/bolig_candidate_v1.json');
 assert.equal(by.sub.length,10);
 assert.equal(Object.keys(by.subBadgeImages).length,10);
 assert.deepEqual(Object.keys(by.subBadgeImages),by.sub);
 assert.equal(by.subBadgeImages.bolig_og_bomiljo,spec.sourceImage);
 assert.equal(spec.quality.registered,true);
 assert.equal(spec.quality.repositoryBinaryVerified,true);
 assert.equal(spec.localesActive,false);
});
test('Five Bolig og bomiljø WebPs have exact hash, 1024 square and alpha',()=>{
 const spec=read('data/badges/bolig_candidate_v1.json');
 for(const [locale,v] of Object.entries(spec.variants)){
  const b=readFileSync(new URL(v.path,root));
  assert.equal(b.length,v.bytes,locale+' byte size');
  assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,locale+' hash');
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
  const chunk=b.toString('ascii',12,16);
  if(chunk==='VP8X'){
   assert.equal(b.readUIntLE(24,3)+1,1024);
   assert.equal(b.readUIntLE(27,3)+1,1024);
   assert.ok((b[20]&0x10)!==0);
  }else if(chunk==='VP8L'){
   const bits=b.readUInt32LE(21);
   assert.equal((bits&0x3fff)+1,1024);
   assert.equal(((bits>>>14)&0x3fff)+1,1024);
   assert.ok((bits>>>28)&1);
  }else assert.fail('Unsupported WebP chunk '+chunk);
 }
 const locales=read('data/badges/badge_locale_images_candidates.json');
 const entries=locales.entries.filter(x=>x.category==='by'&&x.id==='bolig_og_bomiljo');
 assert.equal(entries.length,4);
 assert.deepEqual(entries.map(x=>x.locale),['en','es','pt','fr']);
 assert.ok(!locales.skipped.some(x=>x.category==='by'&&x.id==='bolig_og_bomiljo'));
});
