import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const source='bilder/merker/by/undermerker/samtidsarkitektur-brodert-v1.webp';
const sha='147c5114f96cd883343bca5f45931a78de25d8070f795f9d77696daa316fbb88';
test('Samtidsarkitektur is sixth original 1024px embroidered By image',()=>{
 const by=read('data/badges/by.json'),plan=read('data/badges/underbadge_batch01_production.json');
 assert.equal(by.sub.length,10);
 // The sixth original must survive both the pre-Byplanlegging (6) and
 // approved Byplanlegging 7/10 (7) layouts without admitting unknown assets.
 assert.equal(by.sub[5],'samtidsarkitektur');
 assert.equal(by.sub[6],'byplanlegging');
 const seventh=by.subBadgeImages.byplanlegging;
 assert.ok(seventh===undefined||seventh==='bilder/merker/by/undermerker/byplanlegging-brodert-v1.webp');
 assert.equal(Object.keys(by.subBadgeImages).length,seventh===undefined?6:7);
 assert.equal(by.subBadgeImages.samtidsarkitektur,source);
 const a=plan.families.by.assets.find(x=>x.id==='samtidsarkitektur');
 assert.equal(a.status,'integrated');
 assert.equal(a.selectedImage,source);
 assert.deepEqual(a.quality,{visualApproved:true,technicalApproved:true});
 const b=readFileSync(new URL(source,root));
 assert.equal(b.length,505184);
 assert.equal(b.toString('ascii',0,4),'RIFF');
 assert.equal(b.toString('ascii',8,12),'WEBP');
 assert.equal(b.toString('ascii',12,16),'VP8X');
 assert.equal(b.readUIntLE(24,3)+1,1024);
 assert.equal(b.readUIntLE(27,3)+1,1024);
 assert.ok(b[20]&0x10);
 assert.equal(createHash('sha256').update(b).digest('hex'),sha);
 for(const id of by.sub.slice(seventh===undefined?6:7))assert.equal(by.subBadgeImages[id],undefined);
});
test('Samtidsarkitektur EN ES PT FR variants are stored but inactive',()=>{
 const manifest=read('data/badges/badge_locale_images_candidates.json');
 const entries=manifest.entries.filter(x=>x.category==='by'&&x.id==='samtidsarkitektur');
 assert.equal(entries.length,4);
 assert.deepEqual(entries.map(x=>x.locale).sort(),['en','es','fr','pt']);
 for(const e of entries){
  assert.equal(e.originalSha256,sha);
  assert.ok(existsSync(new URL(e.path,root)));
  const b=readFileSync(new URL(e.path,root));
  assert.equal(b.length,e.bytes);
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
  const encoding=b.toString('ascii',12,16);
  assert.ok(['VP8X','VP8L'].includes(encoding),'valid extended or lossless WebP');
  if(encoding==='VP8X'){
   assert.equal(b.readUIntLE(24,3)+1,1024);
   assert.equal(b.readUIntLE(27,3)+1,1024);
   assert.ok(b[20]&0x10,'extended alpha present');
  }else{
   assert.equal(b[20],0x2f,'lossless WebP signature');
   const bits=b.readUInt32LE(21);
   assert.equal((bits&0x3fff)+1,1024);
   assert.equal(((bits>>>14)&0x3fff)+1,1024);
   assert.ok((bits>>>28)&1,'lossless alpha present');
  }
  assert.equal(createHash('sha256').update(b).digest('hex'),e.sha256);
 }
 assert.equal(manifest.status,'review_required_not_active');
});
