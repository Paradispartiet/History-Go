import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path,root));
const load = path => JSON.parse(read(path).toString('utf8'));
const blobSha = b => createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');

test('1900–1945 badge: existing Historie badge and approved periods are unchanged',()=>{
  const originals={
    'bilder/merker/historie.PNG':'b74e316e34af8a4009c1e53bc5d7bd3c96849f14',
    'bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp':'cda06198c91da713a17bf84bdc26e4b7aea71d93',
    'bilder/merker/historie/undermerker/middelalder-brodert-v1.webp':'2837fae1f07d67b620a67551f7baf6de26a43f04',
    'bilder/merker/historie/undermerker/tidlig_modernetid-brodert-v1.webp':'d31a90232fc5d2b6754a5695db3da705af426184',
    'bilder/merker/historie/undermerker/attenhundretallet-brodert-v1.webp':'aaff24e81d940bc60d463e9aa2b9dd0d502ebc8f'
  };
  for(const [path,sha] of Object.entries(originals)) assert.equal(blobSha(read(path)),sha,path);
});

test('1900–1945 badge: five text variants, Historie brown, no progress number',()=>{
  const a=load('data/badges/historie_1900_1945_candidate_v1.json');
  const c=load('data/badges/historie.json');
  assert.equal(c.color,'#603E1E');
  assert.equal(c.secondaryColor,'#D6A127');
  assert.equal(c.image,'bilder/merker/historie.PNG');
  assert.equal(c.sub.length,14);
  assert.equal(a.palette.primary,'#603E1E');
  assert.equal(a.palette.secondary,'#D6A127');
  assert.equal(a.palette.text,'#F5E8CE');
  assert.equal(a.design.typography.forbidProgressFraction,true);
  assert.deepEqual(Object.keys(a.variants),['nb','en','es','pt','fr']);
  const expected={nb:'HISTORIE',en:'HISTORY',es:'HISTORIA',pt:'HISTÓRIA',fr:'HISTOIRE'};
  for(const [lang,label] of Object.entries(expected)){
    assert.equal(a.variants[lang].heading,'1900–1945');
    assert.equal(a.variants[lang].footer,label);
  }
  assert.equal(a.quality.visualApproved,true);
  assert.equal(a.visualReview.noProgressFractionChecked,true);
  assert.equal(a.visualReview.categoryColorsChecked,true);
  assert.equal(a.quality.binaryVerified,true);
  assert.equal(a.quality.integrated,true);
  assert.equal(a.localesActive,false);
  assert.equal(c.subBadgeImages.nittenhundre_1900_1945,a.sourceImage);
});

test('1900–1945 badge: five byte-identical WebP originals match Git SHA and SHA-256 manifest',()=>{
  const a=load('data/badges/historie_1900_1945_candidate_v1.json');
  for(const [lang,v] of Object.entries(a.variants)){
    const b=read(v.path);
    assert.equal(b.length,v.bytes,lang+' bytes');
    assert.equal(blobSha(b),v.gitBlobSha,lang+' Git blob');
    assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' SHA-256');
    assert.equal(b.toString('ascii',0,4),'RIFF');
    assert.equal(b.toString('ascii',8,12),'WEBP');
    assert.equal(b.toString('ascii',12,16),'VP8X');
    assert.ok((b[20]&0x10)!==0,lang+' alpha');
    assert.equal(b.readUIntLE(24,3)+1,1024,lang+' width');
    assert.equal(b.readUIntLE(27,3)+1,1024,lang+' height');
  }
});
