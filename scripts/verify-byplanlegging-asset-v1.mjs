#!/usr/bin/env node
// Byplanlegging (7/10) candidate contract. Does not activate images.
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const c=read('data/badges/byplanlegging_candidate_v1.json');
const by=read('data/badges/by.json');
assert.equal(c.id,'byplanlegging');
assert.equal(c.categoryId,'by');
assert.deepEqual(c.size,[1024,1024]);
assert.equal(c.status,'candidate_pending_binary_upload');
assert.equal(by.sub.length,10);
assert.deepEqual(Object.keys(by.subBadgeImages),[
  'klassisk_arkitektur','modernisme','funksjonalisme',
  'brutalisme','postmodernisme','samtidsarkitektur'
]);
assert.equal(by.subBadgeImages.byplanlegging,undefined,'Do not activate pending artwork');
assert.deepEqual(Object.keys(c.variants),['nb','en','es','pt','fr']);

let absent=[];
for (const [locale,v] of Object.entries(c.variants)) {
  const file=new URL(v.path,root);
  if(!existsSync(file)) {absent.push(locale);continue}
  const buf=readFileSync(file);
  assert.equal(buf.length,v.bytes,locale+' bytes');
  assert.equal(buf.toString('ascii',0,4),'RIFF',locale+' RIFF');
  assert.equal(buf.toString('ascii',8,12),'WEBP',locale+' WebP');
  assert.equal(buf.toString('ascii',12,16),'VP8X',locale+' VP8X');
  assert.equal(buf.readUIntLE(24,3)+1,1024,locale+' width');
  assert.equal(buf.readUIntLE(27,3)+1,1024,locale+' height');
  assert.ok(buf[20]&0x10,locale+' transparent alpha flag');
  assert.equal(createHash('sha256').update(buf).digest('hex'),v.sha256,locale+' SHA-256');
}
if(process.argv.includes('--require-assets')) {
  assert.equal(absent.length,0,'Missing WebP files: '+absent.join(','));
}
if(absent.length)console.log('Byplanlegging candidate awaiting files: '+absent.join(', '));
else console.log('Byplanlegging: all 5 WebP files verified; still needs visual approval and activation.');
