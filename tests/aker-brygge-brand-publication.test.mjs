import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ids=['cos','olivia','rorbua','tiger_of_sweden','wiersholm'];
const manifest=read('data/brands/aker_brygge_asset_attributions.json');
const master=read('data/brands/brands_master.json');
const runtime=read('data/runtime/place-open/aker_brygge.json');
test('All five visible Aker Brygge Brands use reviewed authentic local logo bytes and provenance',()=>{
 assert.deepEqual(runtime.brands.map(b=>b.id),ids);
 assert.deepEqual(runtime.place.place_card_profile.collection_ids,['people','brands','structures']);
 assert.deepEqual(manifest.coverage,{required:5,verified:5});
 assert.deepEqual(manifest.entries.map(e=>e.brandId),ids);
 for(const e of manifest.entries){
  const b=master.find(b=>b.id===e.brandId);
  assert.deepEqual(runtime.brands.find(b=>b.id===e.brandId),b);
  assert.equal(b.logo,e.assetPath);
  const bytes=fs.readFileSync(b.logo);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),e.assetSha256);
  assert.deepEqual(bytes,fs.readFileSync(e.candidatePath),'Original approved candidate must not be redesigned');
  assert.equal(e.publicationApproved,true);
  assert.equal(e.placeRelationship.status,'CURRENT_SITE_CONFIRMED');
  assert.deepEqual(b.imageMeta,e.imageMeta);
  assert.equal(b.imageMeta.reviewStatus,'approved');
  assert.equal(b.imageMeta.usageContext,'referential_identification');
  assert.equal(b.imageMeta.noEndorsement,true);
  assert.match(b.imageMeta.sourcePage,/^https:\/\//);
  assert.ok(b.imageMeta.credit&&b.imageMeta.transformation&&b.imageMeta.rightsBasis);
  assert.ok(b.desc&&b.source_urls.includes(e.placeRelationship.sourceUrl));
  if(b.id==='cos'){
   assert.equal(b.imageMeta.credit,'Ansonng17');assert.equal(b.imageMeta.license,'CC BY-SA 4.0');
   assert.equal(b.imageMeta.sourcePage,'https://commons.wikimedia.org/wiki/File:COS_Logo.png');
  }else {assert.equal(b.imageMeta.license,'');assert.equal(b.imageMeta.rightsBasis,'referential_trademark_identification');}
 }
});
test('Logo attribution escapes metadata and rejects unsafe source and licence links',()=>{
 const src=fs.readFileSync('js/ui/popup-utils.js','utf8');
 const start=src.indexOf('function renderBrandAssetCredit('),end=src.indexOf('\nwindow.showBrandPopup',start);
 assert.ok(start>0&&end>start);
 const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const ctx={URL,hgEsc:esc,hgEscAttr:esc};vm.createContext(ctx);vm.runInContext(src.slice(start,end),ctx);
 const hostile=ctx.renderBrandAssetCredit({logo:'local.webp',imageMeta:{credit:'<img src=x onerror=alert(1)>',sourcePage:'javascript:alert(1)',license:'<script>bad</script>',licenseUrl:'https://user:password@example.com',noEndorsement:true}});
 assert.ok(!hostile.includes('<img')&&!hostile.includes('<script')&&!hostile.includes('href='));
 assert.ok(hostile.includes('&lt;img')&&hostile.includes('identifikasjon'));
 const cos=ctx.renderBrandAssetCredit(master.find(b=>b.id==='cos'));
 assert.ok(cos.includes('Ansonng17')&&cos.includes('CC BY-SA 4.0')&&cos.includes('rel="noopener noreferrer"'));
 assert.equal(ctx.renderBrandAssetCredit({logo:'old.webp'}),'','Legacy metadata absence remains supported');
});
