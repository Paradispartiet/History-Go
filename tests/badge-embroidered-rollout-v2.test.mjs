import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const manifest=read('data/badges/embroidered_rollout_v2.json');
const protectedImages={
  historie:'bilder/merker/historie.PNG',
  sport:'bilder/merker/sport.PNG',
  politikk:'bilder/merker/politikk.PNG',
  naeringsliv:'bilder/merker/naeringsliv3.webp',
  subkultur:'bilder/merker/Subkultur3.PNG',
  religion:'bilder/merker/religion-godkjent.webp',
  kunst:'bilder/merker/kunst-brodert.webp',
  media:'bilder/merker/media-brodert-lysbla.webp',
  vitenskap:'bilder/merker/vitenskap/brodert/vitenskap.webp'
};
test('batch 02 music and theatre art is full-sized hash-verified WebP',()=>{
  assert.deepEqual(manifest.assets.map(x=>x.id).sort(),['musikk','scenekunst']);
  for(const x of manifest.assets){
    const reg=read('data/badges/'+x.id+'.json');
    assert.equal(reg.image,x.image);assert.equal(reg.color.toUpperCase(),x.color);
    assert.equal(reg.secondaryColor.toUpperCase(),x.secondaryColor);
    const path=resolve(root,x.image);assert.ok(existsSync(path));
    const bin=readFileSync(path);
    assert.equal(bin.length,x.bytes);
    assert.equal(bin.toString('ascii',0,4),'RIFF');assert.equal(bin.toString('ascii',8,12),'WEBP');
    assert.equal(bin.toString('ascii',12,16),'VP8X');
    assert.equal(bin.readUIntLE(24,3)+1,1024);assert.equal(bin.readUIntLE(27,3)+1,1024);
    assert.equal(createHash('sha256').update(bin).digest('hex'),x.sha256);
  }
});
test('nine approved artwork paths remain unchanged',()=>{
  for(const [id,image] of Object.entries(protectedImages)) assert.equal(read('data/badges/'+id+'.json').image,image);
});
test('fifteen existing Religion and Vitenskap underbadges remain present',()=>{
  for(const [id,count] of [['religion',8],['vitenskap',7]]){
    const v=read('data/badges/'+id+'_underbadge_artwork.json');
    assert.equal(v.assets.length,count);
    assert.equal(v.parentImage,read('data/badges/'+id+'.json').image);
    for(const x of v.assets)assert.ok(existsSync(resolve(root,x.image)));
  }
});
