import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root=new URL('../',import.meta.url);
const bytes=p=>readFileSync(new URL(p,root));
const read=p=>JSON.parse(bytes(p).toString('utf8'));
const gitSha=b=>createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');
const protectedFiles={
  'bilder/merker/historie.PNG':'b74e316e34af8a4009c1e53bc5d7bd3c96849f14',
  'bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp':'cda06198c91da713a17bf84bdc26e4b7aea71d93',
  'bilder/merker/historie/undermerker/middelalder-brodert-v1.webp':'2837fae1f07d67b620a67551f7baf6de26a43f04',
  'bilder/merker/historie/undermerker/tidlig_modernetid-brodert-v1.webp':'d31a90232fc5d2b6754a5695db3da705af426184',
  'bilder/merker/historie/undermerker/attenhundretallet-brodert-v1.webp':'aaff24e81d940bc60d463e9aa2b9dd0d502ebc8f',
  'bilder/merker/historie/undermerker/nittenhundre_1900_1945-brodert-v1.webp':'8e3efbd0699364d6139990799b82159a42d9dee9',
  'bilder/merker/historie/undermerker/etterkrigstid-brodert-v1.webp':'1415330db451469b02869664fc578ec47281593c'
};

test('Samtidshistorie: hovedmerket og seks tidligere undermerker er uendret',()=>{
  for(const [path,expected] of Object.entries(protectedFiles))
    assert.equal(gitSha(bytes(path)),expected,path);
});

test('Samtidshistorie: riktig Historie-farge, topptekst, bunntekst og fem språk',()=>{
  const cat=read('data/badges/historie.json');
  const badge=read('data/badges/historie_samtidshistorie_candidate_v1.json');
  assert.equal(cat.image,'bilder/merker/historie.PNG');
  assert.equal(cat.color,'#603E1E');
  assert.equal(cat.secondaryColor,'#D6A127');
  assert.equal(cat.sub.length,14);
  assert.equal(badge.palette.primary,cat.color);
  assert.equal(badge.palette.secondary,cat.secondaryColor);
  assert.equal(badge.palette.text,'#F5E8CE');
  assert.equal(badge.design.typography.forbidProgressFraction,true);
  assert.equal(badge.design.typography.noExternalCaption,true);
  assert.equal(badge.design.typography.legibleAtPixels,128);
  assert.deepEqual(Object.fromEntries(Object.entries(badge.variants).map(([k,v])=>[k,[v.heading,v.footer]])),{
    nb:['SAMTIDSHISTORIE','HISTORIE'],
    en:['CONTEMPORARY','HISTORY'],
    es:['CONTEMPORÁNEA','HISTORIA'],
    pt:['CONTEMPORÂNEA','HISTÓRIA'],
    fr:['CONTEMPORAINE','HISTOIRE']
  });
  assert.equal(badge.localesActive,false);
  if(badge.quality.integrated){
    assert.equal(badge.quality.binaryVerified,true);
    assert.equal(badge.quality.visualApproved,true);
    assert.equal(cat.subBadgeImages?.samtidshistorie,badge.sourceImage);
  }else{
    assert.equal(cat.subBadgeImages?.samtidshistorie,undefined);
  }
});

test('Samtidshistorie: de fem WebP-originalene er komplette og hash-identiske',()=>{
  const badge=read('data/badges/historie_samtidshistorie_candidate_v1.json');
  const items=Object.entries(badge.variants);
  const present=items.filter(([lang,v])=>existsSync(new URL(v.path,root)));
  assert.ok(present.length===0||present.length===5,'Aldri delvis originalpakke');
  if(present.length===0){
    assert.equal(badge.quality.binaryVerified,false);
    assert.equal(badge.quality.integrated,false);
    return;
  }
  for(const [lang,v] of items){
    const b=bytes(v.path);
    assert.equal(b.toString('ascii',0,4),'RIFF',lang);
    assert.equal(b.toString('ascii',8,12),'WEBP',lang);
    assert.equal(b.toString('ascii',12,16),'VP8X',lang);
    assert.equal(b.readUIntLE(24,3)+1,1024,lang+' width');
    assert.equal(b.readUIntLE(27,3)+1,1024,lang+' height');
    assert.ok(b[20]&0x10,lang+' alpha');
    assert.equal(b.length,v.bytes,lang+' bytes');
    assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' sha256');
    assert.equal(gitSha(b),v.gitBlobSha,lang+' git blob sha');
  }
  assert.equal(badge.quality.binaryVerified,true);
});
