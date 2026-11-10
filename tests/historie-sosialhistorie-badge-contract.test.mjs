import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root = new URL('../',import.meta.url);
const bin = p => readFileSync(new URL(p,root));
const json = p => JSON.parse(bin(p).toString('utf8'));
const git = b => createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');
const originals = {
  "bilder/merker/historie.PNG": "b74e316e34af8a4009c1e53bc5d7bd3c96849f14",
  "bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp": "cda06198c91da713a17bf84bdc26e4b7aea71d93",
  "bilder/merker/historie/undermerker/middelalder-brodert-v1.webp": "2837fae1f07d67b620a67551f7baf6de26a43f04",
  "bilder/merker/historie/undermerker/tidlig_modernetid-brodert-v1.webp": "d31a90232fc5d2b6754a5695db3da705af426184",
  "bilder/merker/historie/undermerker/attenhundretallet-brodert-v1.webp": "aaff24e81d940bc60d463e9aa2b9dd0d502ebc8f",
  "bilder/merker/historie/undermerker/nittenhundre_1900_1945-brodert-v1.webp": "8e3efbd0699364d6139990799b82159a42d9dee9",
  "bilder/merker/historie/undermerker/etterkrigstid-brodert-v1.webp": "1415330db451469b02869664fc578ec47281593c",
  "bilder/merker/historie/undermerker/samtidshistorie-brodert-v1.webp": "5a790c33a22ce5ab1507b813c8829f43dbdecb17",
  "bilder/merker/historie/undermerker/byhistorie-brodert-v1.webp": "2ba0f83c8e7cd120312f88e97ba03bc295d2a63c",
  "bilder/merker/historie/undermerker/industrihistorie-brodert-v1.webp": "8b70ae9e76eb790ac0352dd18b911017ef9e665e",
  "bilder/merker/historie/undermerker/krigshistorie-brodert-v1.webp": "174713e5f69eab72be2d0bcd8cda6ac596b14f1a"
};
const expected = {
  "nb": {
    "bytes": 381102,
    "sha256": "96ef4b4868d094c6bf645f24788903a715a49999dcdc932d0a4f657258cd0ca6",
    "gitBlobSha": "2c0f10a8945b8c7e885b25c273c81a8c68b79ef7"
  },
  "en": {
    "bytes": 380382,
    "sha256": "bc8ac464620e9b1ac9b42971cef45c449e1d2e0d127cf85a5c938d178f853061",
    "gitBlobSha": "91d3b3743bf69a015127cb473c0eb244633b15fa"
  },
  "es": {
    "bytes": 382030,
    "sha256": "33b9d2e6c9133fe4b57be2dbb8e592d142856ee6fe6800f6d2c3575a0a140b0d",
    "gitBlobSha": "8e0e840c962bc803f9e4fc11f26b690b14559810"
  },
  "pt": {
    "bytes": 381862,
    "sha256": "261e8d5db6179b608fe18aed8d7ed3312106eb742d83cafdbfe211a6d2fee768",
    "gitBlobSha": "3387ae39bc45563caa1c12df97471204a71fb4f7"
  },
  "fr": {
    "bytes": 382310,
    "sha256": "84c60dc85af694e5abb91142a0a919f2728de526e2c2f096dfbce1138b7cfb46",
    "gitBlobSha": "fb30d0eb7fbeea27d1425374992575ebde8fe810"
  }
};
test('Historie: parent badge and all 10 earlier approved underbadges unchanged',()=>{
  for(const [path,sha] of Object.entries(originals))assert.equal(git(bin(path)),sha,path);
});
test('Sosialhistorie: exact category palette, labels and locale activation',()=>{
  const m=json('data/badges/historie_sosialhistorie_candidate_v1.json');
  const c=json('data/badges/historie.json');
  assert.equal(c.image,'bilder/merker/historie.PNG');
  assert.equal(c.color,'#603E1E');
  assert.equal(c.secondaryColor,'#D6A127');
  assert.equal(c.sub.length,14);
  assert.ok(Object.keys(c.subBadgeImages).length>=11);
  assert.equal(c.subBadgeImages.sosialhistorie,m.sourceImage);
  assert.equal(m.palette.primary,c.color);
  assert.equal(m.palette.secondary,c.secondaryColor);
  assert.equal(m.palette.text,'#F5E8CE');
  assert.equal(m.design.typography.forbidProgressFraction,true);
  assert.equal(m.design.typography.noExternalCaption,true);
  assert.equal(m.status,'integrated');
  assert.equal(m.localesActive,false);
  for(const flag of ['artworkProduced','visualApproved','binaryVerified','integrated'])assert.equal(m.quality[flag],true);
  assert.equal(m.visualReview.noProgressNumberChecked,true);
  assert.deepEqual(Object.fromEntries(Object.entries(m.variants).map(([lang,v])=>[lang,[v.heading,v.footer]])),{
     nb:['SOSIALHISTORIE','HISTORIE'],
     en:['SOCIAL HISTORY','HISTORY'],
     es:['HISTORIA SOCIAL','HISTORIA'],
     pt:['HISTÓRIA SOCIAL','HISTÓRIA'],
     fr:['HISTOIRE SOCIALE','HISTOIRE']
  });
});
test('Sosialhistorie: five real transparent 1024px WebPs match exact SHA-256 and Git hashes',()=>{
  const m=json('data/badges/historie_sosialhistorie_candidate_v1.json');
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
   assert.equal(v.gitBlobSha,want.gitBlobSha,lang+' manifest Git SHA');
   assert.equal(createHash('sha256').update(b).digest('hex'),want.sha256,lang+' SHA-256');
   assert.equal(git(b),want.gitBlobSha,lang+' Git SHA');
  }
});
