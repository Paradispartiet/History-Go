import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import test from 'node:test';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const source=read('data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json'),runtime=read('data/runtime/place-open/toyen_trafo.json'),release=read('reports/collection-images/toyen-trafo-illustration-release-2026-11-18.json');
const sizes=b=>{assert.equal(b.subarray(0,4).toString(),'RIFF');assert.equal(b.subarray(8,12).toString(),'WEBP');assert.equal(b.readUInt32LE(4)+8,b.length);const chunk=b.subarray(12,16).toString();if(chunk==='VP8 ')return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];if(chunk==='VP8X')return [b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1];if(chunk==='VP8L'){const n=b.readUInt32LE(21);return [(n&0x3fff)+1,((n>>14)&0x3fff)+1]};throw Error('unsupported WebP')};
test('Tøyen Objects: illustrated images have exact canonical hashes and disclosure',()=>{
assert.equal(release.historicalPhotoAccuracyApproved,false);assert.equal(release.sourcePhotographsInspected,false);
assert.equal(source.objects.length,2);assert.equal(runtime.place.objects.length,2);
for(let i=0;i<2;i++){const a=source.objects[i],b=runtime.place.objects[i],m=release.objects[i];
assert.equal(a.id,b.id);assert.equal(a.id,m.id);assert.equal(a.image,b.image);assert.equal(a.image,m.canonicalImage);
assert.equal(a.imageKind,'illustration');assert.equal(b.imageKind,'illustration');
assert.deepEqual(a.imageMeta,b.imageMeta);assert.equal(a.imageMeta.mediaType,'image/webp');
assert.equal(a.imageMeta.sourcePhotoVisuallyVerified,false);assert.equal(a.imageMeta.sourcePhotoNotReproduced,true);
assert.match(a.imageMeta.disclosure,/Illustrasjon.*ikke fotografi/);assert.match(a.imageAlt,/Illustrasjon/);
assert.equal(a.imageMeta.archivalId,m.archiveReference);
assert.equal(a.imageMeta.credit,m.credit);assert.ok(!a.image.includes('/candidates/'));
const bytes=fs.readFileSync(a.image);
assert.equal(bytes.length,m.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),m.sha256);assert.deepEqual(sizes(bytes),[900,520]);
}
});
test('Tøyen real source photographs are still explicitly uninspected',()=>{
for(let i=0;i<2;i++){const name=i===0?'toyen-trafo-apparatpult-1916-photo-source.json':'toyen-trafo-transformatorkjerne-1918-photo-source.json';
const photo=read('reports/collection-images/'+name);
assert.equal(photo.canonicalCurrentAsset,release.objects[i].canonicalImage);
assert.equal(photo.publishable,false);assert.equal(photo.editorialApproval,false);
assert.equal(photo.sourceOriginalDownloaded,false);assert.equal(photo.sourceImageBytesSha256,null);}
});
