import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const data=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const manifest=data('data/badges/embroidered_rollout_v1.json');
const expectedProtected={
  "historie": "bilder/merker/historie.PNG",
  "sport": "bilder/merker/sport.PNG",
  "politikk": "bilder/merker/politikk.PNG",
  "naeringsliv": "bilder/merker/naeringsliv3.webp",
  "subkultur": "bilder/merker/Subkultur3.PNG",
  "religion": "bilder/merker/religion-godkjent.webp",
  "kunst": "bilder/merker/kunst-brodert.webp",
  "media": "bilder/merker/media-brodert-lysbla.webp",
  "vitenskap": "bilder/merker/vitenskap/brodert/vitenskap.webp"
};

test('four real embroidered WebPs are selected, valid and hash-verified',()=>{
  assert.equal(manifest.assets.length,4);
  const ids=manifest.assets.map(x=>x.id).sort();
  assert.deepEqual(ids,['by','film_tv','litteratur','natur']);
  for(const item of manifest.assets){
    const badge=data('data/badges/'+item.id+'.json');
    assert.equal(badge.image,item.image,item.id+' image');
    assert.equal(badge.color.toUpperCase(),item.color,item.id+' color');
    assert.equal(badge.secondaryColor.toUpperCase(),item.secondaryColor,item.id+' secondary color');
    const path=resolve(root,item.image);
    assert.ok(existsSync(path),item.id+' file missing');
    const file=readFileSync(path);
    assert.equal(file.length,item.bytes,item.id+' file size');
    assert.equal(file.toString('ascii',0,4),'RIFF',item.id);
    assert.equal(file.toString('ascii',8,12),'WEBP',item.id);
    assert.equal(file.toString('ascii',12,16),'VP8X',item.id);
    assert.equal(file.readUIntLE(24,3)+1,item.width,item.id+' width');
    assert.equal(file.readUIntLE(27,3)+1,item.height,item.id+' height');
    assert.equal(createHash('sha256').update(file).digest('hex'),item.sha256,item.id+' checksum');
  }
});

test('five approved originals and four newer completed badges remain unchanged',()=>{
  for(const [id,image] of Object.entries(expectedProtected)){
    const badge=data('data/badges/'+id+'.json');
    assert.equal(badge.image,image,id+' protected artwork path');
    assert.ok(existsSync(resolve(root,image)),id+' approved artwork missing');
  }
});

test('existing Religion and Vitenskap underbadge files remain linked',()=>{
  for(const [id,expected] of [['religion',8],['vitenskap',7]]){
    const index=data('data/badges/'+id+'_underbadge_artwork.json');
    const parent=data('data/badges/'+id+'.json');
    assert.equal(index.assets.length,expected,id+' underbadge count');
    assert.equal(index.parentImage,parent.image,id+' parent image');
    for(const asset of index.assets)assert.ok(existsSync(resolve(root,asset.image)),asset.image);
  }
});
