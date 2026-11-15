#!/usr/bin/env node
// Guard free-licensed historical photo, dated caption, actual local bytes, and
// fail-closed Historie gate F. The 2007 image is NEVER a current 2026 status proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const readJson=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const place=readJson('data/places/historie/oslo/places_historie_oslo_kultureiendommer_batch_11/minneparken_gamlebyen.json');
const history=readJson('data/places/historie-production/minneparken_gamlebyen.json');
const PHOTO='bilder/places/minneparken_gamlebyen_2007.jpg';
function jpegDimensions(b){
  assert.equal(b[0],0xff);
  assert.equal(b[1],0xd8);
  let p=2;
  while(p+8<b.length){
    if(b[p]!==0xff){p++;continue;}
    while(b[p]===0xff)p++;
    const marker=b[p++];
    if(marker===0xd9||marker===0xda)break;
    if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
    const size=b.readUInt16BE(p);
    if(size<2||p+size>b.length)throw Error('Truncated JPEG marker');
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
      return {height:b.readUInt16BE(p+3),width:b.readUInt16BE(p+5)};
    }
    p+=size;
  }
  throw Error('No JPEG frame marker found');
}

test('Historic Minneparken photo is an actual versioned JPEG with verified source dimensions',()=>{
 assert.equal(place.id,'minneparken_gamlebyen');
 assert.equal(place.image,PHOTO);
 assert.equal('cardImage' in place,false,'Revised Place must not carry retired cardImage');
 assert.notEqual(place.frontImage,PHOTO,'Standing collectible must use a separate original');
 const bytes=fs.readFileSync(path.join(root,PHOTO));
 assert.ok(bytes.length>200000&&bytes.length<6000000,'Unexpected historical photo byte size');
 assert.deepEqual(jpegDimensions(bytes),{width:3072,height:2304});
});

test('Historical-only photo has public-domain provenance and visible dated caption',()=>{
 const meta=place.imageMeta;
 assert.equal(meta.historicalOnly,true);
 assert.equal(meta.creator,'Helge Høifødt');
 assert.equal(meta.sourcePage,'https://commons.wikimedia.org/wiki/File:Ruinparken1.JPG');
 assert.match(meta.license,/public domain|pd-self/i);
 assert.equal(meta.date,'2007-07-15');
 assert.match(meta.historicalCaption,/2007/);
 assert.match(meta.historicalCaption,/2024/);
 assert.match(place.imageCredit,/Helge Høifødt/);
 assert.match(place.imageCaption,/2007/);
 assert.match(place.imageSourceUrl,/commons.wikimedia.org/);
});

test('Canonical runtime index exposes the dated photograph and historical caption',()=>{
 const index=readJson('data/places/places_index.json');
 assert.ok(Array.isArray(index),'Expected canonical places_index array');
 const placeInIndex=index.find(row=>row.id==='minneparken_gamlebyen');
 assert.ok(placeInIndex,'Minneparken missing from runtime index');
 assert.equal(placeInIndex.image,PHOTO,'Runtime index must carry historical photo');
 assert.equal('cardImage' in placeInIndex,false,'Runtime index must not retain retired cardImage');
 assert.equal(placeInIndex.frontImage,place.frontImage,'Runtime must carry the separate standing front image');
 assert.equal(placeInIndex.imageMeta?.historicalOnly,true,'Runtime index must carry historicalOnly flag');
 assert.match(placeInIndex.imageMeta.historicalCaption,/2007/,'Runtime index must carry dated caption');
 assert.match(placeInIndex.imageMeta.historicalCaption,/2024/);
});

test('Historic 2007 image cannot certify present-condition gate F or Historie ready',()=>{
 assert.ok(!history.gates.F.evidenceRefs?.includes('imageMeta'));
 if(history.gates.F.status==='PASS'){
  assert.ok(history.presentTrace.sourceIds.includes('source_minneparken_visit_2026'));
  const source=history.sources.find(s=>s.id==='source_minneparken_visit_2026');
  assert.equal(source.url,'https://kolsas.rotary.no/no/nyhetsdetaljer/201');
  assert.match(source.sourceLocation,/9\. juni 2026/);
  assert.match(source.limitations,/Ikke faglig befaring/);
 } else assert.equal(history.status,'blocked');
});
