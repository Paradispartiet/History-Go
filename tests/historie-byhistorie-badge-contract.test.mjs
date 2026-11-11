import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url);
const bin=(p)=>readFileSync(new URL(p,root));
const read=(p)=>JSON.parse(bin(p).toString('utf8'));
const gitSHA=(b)=>createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');
const protectedFiles={
  'bilder/merker/historie.PNG':'b74e316e34af8a4009c1e53bc5d7bd3c96849f14',
  'bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp':'cda06198c91da713a17bf84bdc26e4b7aea71d93',
  'bilder/merker/historie/undermerker/middelalder-brodert-v1.webp':'2837fae1f07d67b620a67551f7baf6de26a43f04',
  'bilder/merker/historie/undermerker/tidlig_modernetid-brodert-v1.webp':'d31a90232fc5d2b6754a5695db3da705af426184',
  'bilder/merker/historie/undermerker/attenhundretallet-brodert-v1.webp':'aaff24e81d940bc60d463e9aa2b9dd0d502ebc8f',
  'bilder/merker/historie/undermerker/nittenhundre_1900_1945-brodert-v1.webp':'8e3efbd0699364d6139990799b82159a42d9dee9',
  'bilder/merker/historie/undermerker/etterkrigstid-brodert-v1.webp':'1415330db451469b02869664fc578ec47281593c',
  'bilder/merker/historie/undermerker/samtidshistorie-brodert-v1.webp':'5a790c33a22ce5ab1507b813c8829f43dbdecb17'
};
test('Byhistorie må bevare alle eksisterende Historie-merker byte-identisk',()=>{
  for(const [path,sha] of Object.entries(protectedFiles)) assert.equal(gitSHA(bin(path)),sha,path);
});
test('Byhistorie: brun Historie-palett og riktig tekst i fem språk',()=>{
  const a=read('data/badges/historie_byhistorie_candidate_v1.json');
  const c=read('data/badges/historie.json');
  assert.equal(c.image,'bilder/merker/historie.PNG');
  assert.equal(c.color,'#603E1E');
  assert.equal(c.secondaryColor,'#D6A127');
  assert.equal(c.sub.length,14);
  assert.equal(a.id,'byhistorie');
  assert.equal(a.palette.primary,c.color);
  assert.equal(a.palette.secondary,c.secondaryColor);
  assert.equal(a.palette.text,'#F5E8CE');
  assert.equal(a.design.typography.forbidProgressFraction,true);
  assert.equal(a.design.typography.legibleAtPixels,128);
  assert.deepEqual(Object.fromEntries(Object.entries(a.variants).map(([k,v])=>[k,[v.heading,v.footer]])),{
    nb:['BYHISTORIE','HISTORIE'],
    en:['URBAN HISTORY','HISTORY'],
    es:['HISTORIA URBANA','HISTORIA'],
    pt:['HISTÓRIA URBANA','HISTÓRIA'],
    fr:['HISTOIRE URBAINE','HISTOIRE']
  });
  assert.equal(a.localesActive,false);
  assert.equal(c.subBadgeImages?.samtidshistorie,'bilder/merker/historie/undermerker/samtidshistorie-brodert-v1.webp');
  if(a.quality.integrated){
    assert.equal(a.quality.visualApproved,true);
    assert.equal(a.quality.binaryVerified,true);
    assert.equal(c.subBadgeImages?.byhistorie,a.sourceImage);
  }else assert.equal(c.subBadgeImages?.byhistorie,undefined);
});
test('Byhistorie: bare en komplett hash-verifisert femspråklig originalpakke kan aktiveres',()=>{
  const a=read('data/badges/historie_byhistorie_candidate_v1.json');
  const entries=Object.entries(a.variants);
  const present=entries.filter(([,v])=>existsSync(new URL(v.path,root)));
  assert.ok(present.length===0||present.length===5,'Aldri en delvis femspråkspakke');
  if(!present.length){
    assert.equal(a.quality.integrated,false);
    assert.equal(a.quality.binaryVerified,false);
    return;
  }
  for(const [l,v] of entries){
    const b=bin(v.path);
    assert.equal(b.toString('ascii',0,4),'RIFF',l);
    assert.equal(b.toString('ascii',8,12),'WEBP',l);
    assert.equal(b.toString('ascii',12,16),'VP8X',l);
    assert.equal(b.readUIntLE(24,3)+1,1024,l+' width');
    assert.equal(b.readUIntLE(27,3)+1,1024,l+' height');
    assert.ok(b[20]&0x10,l+' requires transparency');
    assert.equal(b.length,v.bytes,l+' file length');
    assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,l+' SHA256');
    assert.equal(gitSHA(b),v.gitBlobSha,l+' Git blob SHA');
  }
  assert.equal(a.quality.binaryVerified,true);
});
