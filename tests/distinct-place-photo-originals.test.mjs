import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDistinctPhotoPair, photoFieldsChanged, placeRows } from '../scripts/check-distinct-place-photos.mjs';

const a = 'a'.repeat(64);
const b = 'b'.repeat(64);
const fixture = () => ({
  image:'bilder/places/one.webp',
  frontImage:'bilder/places/two.webp',
  imageMeta:{sourcePage:'https://commons.wikimedia.org/wiki/File:One.jpg',sourceSha256:a,originalId:'flickr-1'},
  frontImageMeta:{sourcePage:'https://commons.wikimedia.org/wiki/File:Two.jpg',sourceSha256:b,originalId:'flickr-2'},
});
test('two licensed and separately sourced originals are allowed', () => {
  assert.deepEqual(validateDistinctPhotoPair(fixture(), {requireBoth:true}), []);
});
test('reject same source even when output WebP crops and paths differ', () => {
  const p=fixture();p.frontImageMeta.sourceSha256=a;
  assert.match(validateDistinctPhotoPair(p).join(' '), /same original sourceSha256/);
});
test('reject identical original URL and identifier', () => {
  const p=fixture();p.frontImageMeta.sourcePage=p.imageMeta.sourcePage;p.frontImageMeta.originalId=p.imageMeta.originalId;
  assert.match(validateDistinctPhotoPair(p).join(' '), /same original sourcePage/);
  assert.match(validateDistinctPhotoPair(p).join(' '), /same original originalId/);
});
test('reject identical local image path', () => {
  const p=fixture();p.frontImage=p.image;
  assert.match(validateDistinctPhotoPair(p).join(' '), /same asset path/);
});
test('require original hashes and source URLs, not just different filenames', () => {
  const p=fixture();delete p.frontImageMeta.sourceSha256;delete p.frontImageMeta.sourcePage;
  const issues=validateDistinctPhotoPair(p).join(' ');
  assert.match(issues,/needs a SHA256/);
  assert.match(issues,/needs a documented original source URL/);
});
test('unphotographed draft is allowed in changed audit, but not publication gate', () => {
  assert.deepEqual(validateDistinctPhotoPair({image:'',frontImage:''}), []);
  assert.equal(validateDistinctPhotoPair({image:'',frontImage:''},{requireBoth:true}).length,1);
});

test('grouped and array place files retain per-place original-photo checks', () => {
  const first={id:'one',...fixture()};
  const second={id:'two',...fixture(),frontImage:'bilder/places/second.webp'};
  const old=[first,second];
  const updated=[first,{...second,frontImageMeta:{...second.frontImageMeta,sourceSha256:second.imageMeta.sourceSha256}}];
  assert.equal(placeRows(old).length,2);
  assert.equal(placeRows({places:updated}).length,2);
  assert.equal(photoFieldsChanged(old[0],updated[0]),false);
  assert.equal(photoFieldsChanged(old[1],updated[1]),true);
  assert.match(validateDistinctPhotoPair(updated[1]).join(' '),/same original sourceSha256/);
});
