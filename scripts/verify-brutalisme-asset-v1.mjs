#!/usr/bin/env node
// Focused source-integrity check for Brutalisme 4/10.
// Use --require-assets during activation; candidates without binaries remain inactive.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = p => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const rec = read('data/badges/brutalisme_candidate_v1.json');
const by = read('data/badges/by.json');
assert.equal(rec.id, 'brutalisme');
assert.deepEqual(rec.size,[1024,1024]);
assert.equal(by.sub.length,10);
assert.equal(by.subBadgeImages.klassisk_arkitektur,'bilder/merker/by/undermerker/klassisk_arkitektur-brodert-v2.webp');
assert.equal(by.subBadgeImages.modernisme,'bilder/merker/by/undermerker/modernisme-brodert-v1.webp');
assert.equal(by.subBadgeImages.funksjonalisme,'bilder/merker/by/undermerker/funksjonalisme-brodert-v1.webp');
const pending = [];
for (const [lang, v] of Object.entries(rec.variants)) {
  const path = new URL(v.path, root);
  if (!existsSync(path)) {pending.push(lang); continue;}
  const file = readFileSync(path);
  assert.equal(file.length,v.bytes,lang+' file size');
  assert.equal(file.toString('ascii',0,4),'RIFF',lang+' RIFF signature');
  assert.equal(file.toString('ascii',8,12),'WEBP',lang+' WebP signature');
  assert.equal(file.toString('ascii',12,16),'VP8X',lang+' extended WebP header');
  assert.equal(file.readUIntLE(24,3)+1,1024,lang+' width');
  assert.equal(file.readUIntLE(27,3)+1,1024,lang+' height');
  assert.ok((file[20] & 0x10) !== 0,lang+' alpha channel');
  assert.equal(createHash('sha256').update(file).digest('hex'),v.sha256,lang+' checksum');
}
if (process.argv.includes('--require-assets')) {
  assert.equal(pending.length,0,'Missing locale images: '+pending.join(','));
}
if (rec.status === 'integrated_v1_active') {
  assert.equal(by.subBadgeImages.brutalisme,rec.sourceImage,'active By image routing');
  assert.deepEqual(rec.quality,{visualApproved:true,technicalApproved:true,registered:true});
  assert.equal(pending.length,0,'integrated badge cannot have missing WebP files');
}
if (pending.length) console.log('Brutalisme awaits source files: '+pending.join(', '));
else console.log('Brutalisme: five WebP files and source hashes verified.');
