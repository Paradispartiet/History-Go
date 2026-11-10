import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const get=p=>readFileSync(new URL(p,root));
const json=p=>JSON.parse(get(p).toString('utf8'));
const git=b=>createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');
const protectedBlobs={
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
  "bilder/merker/historie/undermerker/krigshistorie-brodert-v1.webp": "174713e5f69eab72be2d0bcd8cda6ac596b14f1a",
  "bilder/merker/historie/undermerker/sosialhistorie-brodert-v1.webp": "2c0f10a8945b8c7e885b25c273c81a8c68b79ef7",
  "bilder/merker/historie/undermerker/kulturminner_og_bevaring-brodert-v1.webp": "081c7cfc3561c750a36d56a0d16379e51b525a29",
  "bilder/merker/historie/undermerker/krim_ulykker_og_branner-brodert-v1.webp": "ef274faad88d99b784b1ef7dc1f5f41c12735ad7"
};
test('Migrasjon: Historie-hovedmerket og alle tretten tidligere undermerker er originale',()=>{
 for(const [path,hash] of Object.entries(protectedBlobs)) assert.equal(git(get(path)),hash,path);
});
test('Migrasjon: norsk aktiv, de fire andre språkene inaktive, hele serien 14 av 14',()=>{
 const m=json('data/badges/historie_migrasjon_og_minoritetshistorie_candidate_v1.json');
 const c=json('data/badges/historie.json');
 assert.equal(c.sub.length,14);assert.equal(Object.keys(c.subBadgeImages).length,14);
 assert.equal(c.image,'bilder/merker/historie.PNG');
 assert.equal(c.color,'#603E1E');assert.equal(c.secondaryColor,'#D6A127');
 assert.equal(c.subBadgeImages[m.id],m.sourceImage);
 assert.equal(m.palette.primary,c.color);assert.equal(m.palette.secondary,c.secondaryColor);
 assert.equal(m.status,'integrated');assert.equal(m.quality.integrated,true);
 assert.equal(m.quality.binaryVerified,true);assert.equal(m.localesActive,false);
 assert.equal(m.seriesProgress.integrated,14);assert.equal(m.seriesProgress.total,14);
 assert.equal(m.design.typography.forbidProgressFraction,true);
 assert.deepEqual(Object.fromEntries(Object.entries(m.variants).map(([lang,v])=>[lang,[v.heading,v.footer]])),{
  nb:['MIGRASJON OG MINORITETSHISTORIE','HISTORIE'],
  en:['MIGRATION & MINORITY HISTORY','HISTORY'],
  es:['MIGRACIÓN E HISTORIA DE LAS MINORÍAS','HISTORIA'],
  pt:['MIGRAÇÃO E HISTÓRIA DAS MINORIAS','HISTÓRIA'],
  fr:['MIGRATION ET HISTOIRE DES MINORITÉS','HISTOIRE']
 });
 for(const v of Object.values(m.variants))assert.equal(/\b14\s*\/\s*14\b/.test(v.heading+' '+v.footer),false);
});
test('Migrasjon: alle fem WebP, 1024², transparens, SHA-256 og Git-blob',()=>{
 const m=json('data/badges/historie_migrasjon_og_minoritetshistorie_candidate_v1.json');
 assert.equal(m.binaryTransfer.verifiedInRepository,true);
 for(const [lang,v] of Object.entries(m.variants)){
  const b=get(v.path);
  assert.equal(b.toString('ascii',0,4),'RIFF',lang);
  assert.equal(b.toString('ascii',8,12),'WEBP',lang);
  assert.equal(b.toString('ascii',12,16),'VP8X',lang);
  assert.equal(b.readUIntLE(24,3)+1,1024,lang);
  assert.equal(b.readUIntLE(27,3)+1,1024,lang);
  assert.ok((b[20]&16)!==0,lang+' alpha');
  assert.equal(b.length,v.bytes,lang+' bytes');
  assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' SHA256');
  assert.equal(git(b),v.gitBlobSha,lang+' Git blob');
 }
});