import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

test('original illustrated Tøyen torg pair is independent and visibly disclosed, not a fake photo-source claim', () => {
  const p=JSON.parse(fs.readFileSync('data/places/by/oslo/places/toyen_torg.json','utf8'));
  assert.deepEqual(validateDistinctPhotoPair(p,{requireBoth:true}),[]);
  assert.match(validateDistinctPhotoPair({...p,frontImage:p.image}).join(' '),/same asset path|same original illustration bytes/);
  assert.match(validateDistinctPhotoPair({...p,frontImage:'bilder/illustrasjoner/places/not-a-real-front.svg'}).join(' '),/missing from the repository/);
});


test('diagnostic: compute SHA256 for two independently licensed Politihuset source photos', async () => {
  const originalSources = [
    ['image', 'https://upload.wikimedia.org/wikipedia/commons/5/57/Politihuset.jpg'],
    ['frontImage', 'https://upload.wikimedia.org/wikipedia/commons/0/05/Gr%C3%B8nlandsleiret_44_%E2%80%93_Gr%C3%B8nland_politistasjon_%282022%29_2.jpg'],
  ];
  for (const [label, url] of originalSources) {
    try {
      const response = await fetch(url, {
        headers: {'User-Agent': 'History-Go/1.0 (https://github.com/Paradispartiet/History-Go; image attribution audit)'},
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw Error('HTTP '+response.status);
      const bytes = Buffer.from(await response.arrayBuffer());
      const sha = createHash('sha256').update(bytes).digest('hex');
      console.log('POLITIHUSET_SOURCE_SHA256', label, sha, bytes.length, url);
    } catch (e) {
      console.warn('POLITIHUSET_SOURCE_SHA256_UNAVAILABLE',label,String(e));
    }
  }
});
