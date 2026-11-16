import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root = new URL('../', import.meta.url);
const readJson = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const specs = {
  modernisme: {bytes: 620110, sha256: '55334d30bd8f0f8312518276a8fb39db44b90dae3566d72ea319df5460b35c61', previous: '39d0403eb18789c1526c1f1825fa0caccca199958784c479039fb3cf152aaa5e'},
  funksjonalisme: {bytes: 570028, sha256: 'd3bc62261a9705fb6c3eff142df53e45cd8a29d31c93e19a7ac9a391bfbcdf7f', previous: '207af148f525ca0c767d06b1cf84b87b05ec89b87dde35fc9f232a844b74b6f1'},
  bolig_og_bomiljo: {bytes: 571816, sha256: 'f11425ff75d4995b817761a0baa064e9dd6eb0f3dc9da0160f853748a31358de', previous: '5558254adb020c3f6675b2b2e7bf69bfe1f495223a231b3eab79462081e33d5b'}
};
const prefix = 'bilder/merker/by/undermerker/';
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
function assertTransparent1024WebP(bytes, id) {
  assert.equal(bytes.toString('ascii',0,4), 'RIFF', id);
  assert.equal(bytes.readUInt32LE(4)+8, bytes.length, id+' RIFF size');
  assert.equal(bytes.toString('ascii',8,12), 'WEBP', id);
  const mode=bytes.toString('ascii',12,16);
  if (mode==='VP8X') {
    assert.equal(bytes.readUIntLE(24,3)+1,1024,id+' width');
    assert.equal(bytes.readUIntLE(27,3)+1,1024,id+' height');
    assert.ok(bytes[20]&0x10,id+' alpha');
  } else if (mode==='VP8L') {
    assert.equal(bytes[20],0x2f,id+' VP8L signature');
    const bits=bytes.readUInt32LE(21);
    assert.equal((bits&0x3fff)+1,1024,id+' width');
    assert.equal(((bits>>>14)&0x3fff)+1,1024,id+' height');
    assert.ok((bits>>>28)&1,id+' alpha');
  } else assert.fail(id+' unsupported WebP mode '+mode);
}

test('By v2 preserves exact original images for first three activated badges alongside newer active versions',()=>{
  const by=readJson('data/badges/by.json');
  const prod=readJson('data/badges/underbadge_batch01_production.json');
  assert.equal(by.image,'bilder/merker/by-brodert-v6.webp');
  assert.equal(by.sub.length,10);
  assert.deepEqual(Object.keys(by.subBadgeImages),by.sub);
  assert.equal(Object.keys(by.subBadgeImages).length,10);
  const laterActivated = {
    klassisk_arkitektur: 'klassisk_arkitektur-brodert-v3.webp',
    brutalisme: 'brutalisme-brodert-v2.webp',
    postmodernisme: 'postmodernisme-brodert-v2.webp',
    samtidsarkitektur: 'samtidsarkitektur-brodert-v2.webp',
    byplanlegging: 'byplanlegging-brodert-v2.webp',
    infrastruktur: 'infrastruktur-brodert-v2.webp',
    monumenter_og_landemerker: 'monumenter_og_landemerker-brodert-v2.webp'
  };
  for(const [id,file] of Object.entries(laterActivated)) {
    assert.equal(by.subBadgeImages[id],prefix+file,id+' separately activated artwork');
  }
  for(const [id,spec] of Object.entries(specs)) {
    const file=prefix+id+'-brodert-v2.webp';
    const original=prefix+id+'-brodert-v1.webp';
    const rec=prod.families.by.assets.find(x=>x.id===id);
    assert.ok(rec,id+' production record');
    assert.equal(by.subBadgeImages[id],file,id+' active path');
    assert.equal(rec.selectedImage,file,id+' manifest path');
    assert.equal(rec.bytes,spec.bytes,id+' size manifest');
    assert.equal(rec.sha256,spec.sha256,id+' hash manifest');
    assert.equal(rec.previousActive.path,original,id+' previous path');
    assert.equal(rec.previousActive.sha256,spec.previous,id+' previous sha');
    const bytes=readFileSync(new URL(file,root));
    assertTransparent1024WebP(bytes,id);
    assert.equal(bytes.length,spec.bytes,id+' size');
    assert.equal(hash(bytes),spec.sha256,id+' sha256');
    const old=readFileSync(new URL(original,root));
    assert.equal(hash(old),spec.previous,id+' v1 remains byte-identical');
  }
  assert.equal(readJson('data/badges/bolig_candidate_v1.json').localesActive,false,'translations remain inactive');
});
