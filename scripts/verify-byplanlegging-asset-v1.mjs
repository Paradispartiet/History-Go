#!/usr/bin/env node
// Byplanlegging (7/10) production contract; verify exact original and locale assets.
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
assert.equal(c.status,'integrated');
assert.equal(c.quality.registered,true);
assert.equal(c.quality.technicalApproved,true);
assert.equal(by.sub.length,10);
assert.deepEqual(Object.keys(by.subBadgeImages),[
  'klassisk_arkitektur','modernisme','funksjonalisme',
  'brutalisme','postmodernisme','samtidsarkitektur','byplanlegging'
]);
assert.equal(by.subBadgeImages.byplanlegging,c.sourceImage,'Activate original only');
assert.deepEqual(Object.keys(c.variants),['nb','en','es','pt','fr']);

for (const [locale,v] of Object.entries(c.variants)) {
  const file=new URL(v.path,root);
  assert.ok(existsSync(file),locale+' missing WebP');
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
console.log('Byplanlegging 7/10: all five pinned WebP files are verified; original is active and locale files remain inactive.');
