import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const bin=p=>readFileSync(new URL(p,root));
const json=p=>JSON.parse(bin(p).toString('utf8'));
const git=b=>createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');
const expected={
  "nb": {
    "bytes": 350018,
    "sha256": "1411f60ad2ce6328f5f12b35dd7ed015376e59dd9314b109b9fd7708fa627b92",
    "gitBlobSha": "174713e5f69eab72be2d0bcd8cda6ac596b14f1a"
  },
  "en": {
    "bytes": 350018,
    "sha256": "d64642548a1749c8f1c21e541002a1b878f59f7cb9f7db9a7069318e944103dc",
    "gitBlobSha": "92ea3c65003a7732a5dd2b317b2544e55fd3fb45"
  },
  "es": {
    "bytes": 350410,
    "sha256": "331b86d14d80daee97e3551921f217048ad5516f38b82ded426a0d94dc922088",
    "gitBlobSha": "7b7c8f872903896bf2795c6c89908df0c0d054c6"
  },
  "pt": {
    "bytes": 350766,
    "sha256": "922990052824095f6019ba49f00ae04c8b3b1c788befc5e8796b0290866b3064",
    "gitBlobSha": "ea4286510b52f7a11743c484f832ee9617996e37"
  },
  "fr": {
    "bytes": 350522,
    "sha256": "fb3e7e5eeaf2cec82c0970eb3a2741bb12894aa6f00e79f03827b6e8e0a48d98",
    "gitBlobSha": "6f2a5de73a2808f4ac336df5ca24226e57938fda"
  }
};
const protectedFiles={
  "bilder/merker/historie.PNG": "b74e316e34af8a4009c1e53bc5d7bd3c96849f14",
  "bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp": "cda06198c91da713a17bf84bdc26e4b7aea71d93",
  "bilder/merker/historie/undermerker/middelalder-brodert-v1.webp": "2837fae1f07d67b620a67551f7baf6de26a43f04",
  "bilder/merker/historie/undermerker/tidlig_modernetid-brodert-v1.webp": "d31a90232fc5d2b6754a5695db3da705af426184",
  "bilder/merker/historie/undermerker/attenhundretallet-brodert-v1.webp": "aaff24e81d940bc60d463e9aa2b9dd0d502ebc8f",
  "bilder/merker/historie/undermerker/nittenhundre_1900_1945-brodert-v1.webp": "8e3efbd0699364d6139990799b82159a42d9dee9",
  "bilder/merker/historie/undermerker/etterkrigstid-brodert-v1.webp": "1415330db451469b02869664fc578ec47281593c",
  "bilder/merker/historie/undermerker/samtidshistorie-brodert-v1.webp": "5a790c33a22ce5ab1507b813c8829f43dbdecb17",
  "bilder/merker/historie/undermerker/byhistorie-brodert-v1.webp": "2ba0f83c8e7cd120312f88e97ba03bc295d2a63c",
  "bilder/merker/historie/undermerker/industrihistorie-brodert-v1.webp": "8b70ae9e76eb790ac0352dd18b911017ef9e665e"
};
test('Historie hovedmerke og ni godkjente undermerker har identiske Git SHA-1',()=>{
 for(const [path,sha] of Object.entries(protectedFiles))assert.equal(git(bin(path)),sha,path);
});
test('Krigshistorie har korrekt brun palett, topp/bunntekst og bare norsk aktivert',()=>{
 const m=json('data/badges/historie_krigshistorie_candidate_v1.json');
 const c=json('data/badges/historie.json');
 assert.equal(c.image,'bilder/merker/historie.PNG');
 assert.equal(c.color,'#603E1E');
 assert.equal(c.secondaryColor,'#D6A127');
 assert.equal(c.sub.length,14);
 assert.ok(Object.keys(c.subBadgeImages).length>=10,'Ti integrerte originalmerker må forbli registrert etter senere utvidelser');
 assert.equal(c.subBadgeImages.krigshistorie,m.sourceImage);
 assert.equal(m.palette.primary,c.color);
 assert.equal(m.palette.secondary,c.secondaryColor);
 assert.equal(m.palette.text,'#F5E8CE');
 assert.equal(m.design.typography.forbidProgressFraction,true);
 assert.equal(m.design.typography.noExternalCaption,true);
 assert.equal(m.status,'integrated');
 assert.equal(m.localesActive,false);
 assert.equal(m.quality.artworkProduced,true);
 assert.equal(m.quality.visualApproved,true);
 assert.equal(m.quality.binaryVerified,true);
 assert.equal(m.quality.integrated,true);
 assert.deepEqual(Object.fromEntries(Object.entries(m.variants).map(([k,v])=>[k,[v.heading,v.footer]])),{
   nb:['KRIGSHISTORIE','HISTORIE'],en:['WAR HISTORY','HISTORY'],es:['HISTORIA BÉLICA','HISTORIA'],pt:['HISTÓRIA DAS GUERRAS','HISTÓRIA'],fr:['HISTOIRE DES GUERRES','HISTOIRE']
 });
});
test('Krigshistorie: fem ekte WebP med alfa, dimensjon og eksakt SHA-256/Git SHA',()=>{
 const m=json('data/badges/historie_krigshistorie_candidate_v1.json');
 for(const [lang,want] of Object.entries(expected)){
  const v=m.variants[lang],b=bin(v.path);
  assert.equal(b.toString('ascii',0,4),'RIFF',lang);
  assert.equal(b.toString('ascii',8,12),'WEBP',lang);
  assert.equal(b.toString('ascii',12,16),'VP8X',lang);
  assert.equal(b.readUIntLE(24,3)+1,1024,lang+' width');
  assert.equal(b.readUIntLE(27,3)+1,1024,lang+' height');
  assert.ok(b[20]&0x10,lang+' alpha');
  assert.equal(b.length,want.bytes,lang+' size');
  assert.equal(v.bytes,want.bytes,lang+' manifest size');
  assert.equal(v.sha256,want.sha256,lang+' manifest SHA-256');
  assert.equal(v.gitBlobSha,want.gitBlobSha,lang+' manifest git SHA');
  assert.equal(createHash('sha256').update(b).digest('hex'),want.sha256,lang+' SHA-256');
  assert.equal(git(b),want.gitBlobSha,lang+' Git SHA');
 }
});
