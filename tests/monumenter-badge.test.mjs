import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const get=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));

test('Monumenter og landemerker is ninth active By badge; earlier eight remain unchanged',()=>{
 const by=get('data/badges/by.json');
 const spec=get('data/badges/monumenter_candidate_v1.json');
 assert.deepEqual(by.sub.slice(0,9).at(-1),'monumenter_og_landemerker');
 assert.ok(Object.keys(by.subBadgeImages).length>=9);
 assert.deepEqual(Object.keys(by.subBadgeImages).slice(0,9),by.sub.slice(0,9));
 assert.equal(by.subBadgeImages.monumenter_og_landemerker,spec.sourceImage);
 assert.equal(spec.status,'integrated');
 assert.equal(spec.quality.visualApproved,true);
 assert.equal(spec.quality.repositoryBinaryVerified,true);
 assert.equal(Object.keys(spec.variants).length,5);
});

test('Five locale assets have exact SHA256, dimensions, alpha and WebP headers',()=>{
 const spec=get('data/badges/monumenter_candidate_v1.json');
 for(const [lang,v] of Object.entries(spec.variants)){
  const b=readFileSync(new URL(v.path,root));
  assert.equal(b.length,v.bytes,lang+' bytes');
  assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' hash');
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
  assert.equal(b.toString('ascii',12,16),'VP8X');
  assert.equal(b.readUIntLE(24,3)+1,1024);
  assert.equal(b.readUIntLE(27,3)+1,1024);
  assert.ok((b[20]&0x10)!==0,lang+' missing alpha');
 }
 const locales=get('data/badges/badge_locale_images_candidates.json');
 assert.equal(locales.entries.filter(x=>x.category==='by'&&x.id==='monumenter_og_landemerker').length,4);
 assert.ok(!locales.skipped.some(x=>x.category==='by'&&x.id==='monumenter_og_landemerker'));
});
