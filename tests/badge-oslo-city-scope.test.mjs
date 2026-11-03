import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p, import.meta.url));
const json=p=>JSON.parse(read(p).toString('utf8'));
const city=json('data/badges/cities/oslo.json');
const by=json('data/badges/by.json');
const imagePath='bilder/merker/by/cities/oslo-by-brodert-v1.webp';
const sha='58689595400dded9dbf65ee476c72250e4d4a856334c17e08008dba2b0b5a1b3';

test('Oslo city badge is a dedicated alpha WebP, not a global category replacement',()=>{
 assert.equal(city.cityId,'oslo');
 assert.equal(city.categoryId,'by');
 assert.equal(city.country,'NO');
 assert.equal(city.sourceFilePrefix,'places/by/oslo/');
 assert.equal(city.scope,'explicit_city_source_path_only');
 assert.equal(city.globalCategoryOverride,false);
 assert.equal(city.notForOtherCities,true);
 assert.equal(city.image,imagePath);
 assert.equal(city.color,'#808080');
 assert.equal(city.secondaryColor,'#404040');
 assert.equal(by.image,'bilder/merker/by-brodert-v6.webp');
 assert.equal(by.subBadgeImages?.by_oslo,undefined);
 const b=read(imagePath);
 assert.equal(b.length,537770);
 assert.equal(b.toString('ascii',0,4),'RIFF');
 assert.equal(b.toString('ascii',8,12),'WEBP');
 assert.equal(b.toString('ascii',12,16),'VP8X');
 assert.ok(b[20]&0x10,'alpha flag');
 assert.equal(b.readUIntLE(24,3)+1,1024);
 assert.equal(b.readUIntLE(27,3)+1,1024);
 assert.equal(createHash('sha256').update(b).digest('hex'),sha);
});

for(const path of ['js/map.ts','js/map.js']){
 test(path+' restricts Oslo artwork to Oslo By source files only',()=>{
  const src=read(path).toString('utf8');
  const match=src.match(/function badgeImageForPlace\(place\) \{[\s\S]*?\n\s+\}/);
  assert.ok(match,'scoped resolver exists');
  assert.match(src,/badgeSrcForPlace = badgeImageForPlace\(p\)/);
  assert.match(src,/badgeSrc: badgeSrcForPlace/);
  assert.match(src,/feature\.properties\.badgeSrc/);
  const context={placeBadgeImages:new Map([['by','bilder/merker/by-brodert-v6.webp'],['historie','bilder/merker/historie.PNG']]),badgeCategoryId:x=>String(x||'').toLowerCase()};
  vm.runInNewContext('const OSLO_CITY_BADGE='+JSON.stringify(imagePath)+';\n'+match[0]+'\nthis.resolve=badgeImageForPlace;',context);
  const f=context.resolve;
  assert.equal(f({category:'by',sourceFile:'data/places/by/oslo/places/torggata.json'}),imagePath);
  assert.equal(f({category:'by',sourceFile:'places/by/oslo/places/radhusplassen.json'}),imagePath);
  for(const sourceFile of ['data/places/by/america/brazil/criciuma/a.json','data/places/by/akershus/places/a.json','data/places/by/oslofjord/places/a.json','','data/places/historie/oslo/places/a.json']){
   assert.equal(f({category:'by',sourceFile}),'bilder/merker/by-brodert-v6.webp',sourceFile);
  }
  assert.equal(f({category:'historie',sourceFile:'data/places/historie/oslo/places/a.json'}),'bilder/merker/historie.PNG');
 });
}
