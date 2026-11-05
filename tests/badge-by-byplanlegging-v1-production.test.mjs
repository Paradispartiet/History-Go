import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const image='bilder/merker/by/undermerker/byplanlegging-brodert-v1.webp';
const hashes={
 nb:'68591bec74019f83bfa3e23c99e82e157ba0fb8b477cf5df628078df08d35540',
 en:'8b8e5e3d1ca8d7ba492b71dee92e5c2f9b9eefeb77b181943e72663efe99cd9f',
 es:'f44bf1f2fcc9bd2abab90ea4a9c49592be2390bb1a499f2e112dfa5f68abdcf5',
 pt:'3780e31f89305f921a84f407b2633391cdcce5485d7a384c9dc5eca18dbce809',
 fr:'223dc2d0d99cef6c374af45a67f72643f9148a6ba082bf9f0d08e22eafbe428b'
};
const previous={
 klassisk_arkitektur:'bilder/merker/by/undermerker/klassisk_arkitektur-brodert-v2.webp',
 modernisme:'bilder/merker/by/undermerker/modernisme-brodert-v1.webp',
 funksjonalisme:'bilder/merker/by/undermerker/funksjonalisme-brodert-v1.webp',
 brutalisme:'bilder/merker/by/undermerker/brutalisme-brodert-v1.webp',
 postmodernisme:'bilder/merker/by/undermerker/postmodernisme-brodert-v1.webp',
 samtidsarkitektur:'bilder/merker/by/undermerker/samtidsarkitektur-brodert-v1.webp'
};
test('Byplanlegging 7/10 is registered without replacing six protected By originals',()=>{
 const by=read('data/badges/by.json'),plan=read('data/badges/underbadge_batch01_production.json');
 assert.equal(by.sub.length,10);
 assert.deepEqual(by.subBadgeImages,{...previous,byplanlegging:image});
 const a=plan.families.by.assets.find(x=>x.id==='byplanlegging');
 assert.equal(a.status,'integrated');
 assert.equal(a.selectedImage,image);
 assert.deepEqual(a.quality,{visualApproved:true,technicalApproved:true});
 assert.equal(a.sha256,hashes.nb);
 for(const id of by.sub.slice(7))assert.equal(by.subBadgeImages[id],undefined);
});
test('Byplanlegging exact WebP plus four translated files have verified transparent headers and hashes',()=>{
 const c=read('data/badges/byplanlegging_candidate_v1.json');
 const manifest=read('data/badges/badge_locale_images_candidates.json');
 assert.equal(c.status,'integrated');
 assert.equal(c.quality.registered,true);
 assert.equal(manifest.status,'review_required_not_active');
 assert.equal(manifest.entries.length,56);
 assert.deepEqual(Object.keys(c.variants),['nb','en','es','pt','fr']);
 const entries=manifest.entries.filter(e=>e.category==='by'&&e.id==='byplanlegging');
 assert.deepEqual(entries.map(e=>e.locale),['en','es','pt','fr']);
 for(const [lc,v] of Object.entries(c.variants)){
  assert.equal(v.sha256,hashes[lc]);
  const file=readFileSync(new URL(v.path,root));
  assert.equal(file.length,v.bytes,lc);
  assert.equal(file.toString('ascii',0,4),'RIFF',lc);
  assert.equal(file.toString('ascii',8,12),'WEBP',lc);
  const encoding=file.toString('ascii',12,16);
  assert.ok(['VP8X','VP8L'].includes(encoding),lc+' valid extended/lossless WebP');
  if(lc==='nb')assert.equal(encoding,'VP8X','active original remains extended WebP');
  if(encoding==='VP8X'){
    assert.equal(file.readUIntLE(24,3)+1,1024,lc+' width');
    assert.equal(file.readUIntLE(27,3)+1,1024,lc+' height');
    assert.ok(file[20]&0x10,lc+' alpha channel');
  }else{
    assert.equal(file[20],0x2f,lc+' lossless WebP signature');
    const bits=file.readUInt32LE(21);
    assert.equal((bits&0x3fff)+1,1024,lc+' width');
    assert.equal(((bits>>>14)&0x3fff)+1,1024,lc+' height');
    assert.ok((bits>>>28)&1,lc+' alpha channel');
  }
  assert.equal(createHash('sha256').update(file).digest('hex'),v.sha256,lc);
  if(lc!=='nb'){
   const localeEntry=entries.find(e=>e.locale===lc);
   assert.equal(localeEntry.sha256,v.sha256);
   assert.equal(localeEntry.originalSha256,hashes.nb);
   assert.equal(localeEntry.footer,v.footer);
  }
 }
 assert.deepEqual(manifest.skipped.filter(e=>e.category==='by').map(e=>e.id),
   ['infrastruktur','monumenter_og_landemerker','bolig_og_bomiljo']);
});
