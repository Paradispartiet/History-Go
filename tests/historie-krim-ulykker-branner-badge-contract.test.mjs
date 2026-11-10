import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root = new URL('../', import.meta.url);
const get = path => readFileSync(new URL(path, root));
const json = path => JSON.parse(get(path).toString('utf8'));
const gitSha = bytes => createHash('sha1').update(Buffer.from('blob ' + bytes.length)).update(Buffer.from([0])).update(bytes).digest('hex');
const protectedBlobs = {
  'bilder/merker/historie.PNG':'b74e316e34af8a4009c1e53bc5d7bd3c96849f14',
  'bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp':'cda06198c91da713a17bf84bdc26e4b7aea71d93',
  'bilder/merker/historie/undermerker/middelalder-brodert-v1.webp':'2837fae1f07d67b620a67551f7baf6de26a43f04',
  'bilder/merker/historie/undermerker/tidlig_modernetid-brodert-v1.webp':'d31a90232fc5d2b6754a5695db3da705af426184',
  'bilder/merker/historie/undermerker/attenhundretallet-brodert-v1.webp':'aaff24e81d940bc60d463e9aa2b9dd0d502ebc8f',
  'bilder/merker/historie/undermerker/nittenhundre_1900_1945-brodert-v1.webp':'8e3efbd0699364d6139990799b82159a42d9dee9',
  'bilder/merker/historie/undermerker/etterkrigstid-brodert-v1.webp':'1415330db451469b02869664fc578ec47281593c',
  'bilder/merker/historie/undermerker/samtidshistorie-brodert-v1.webp':'5a790c33a22ce5ab1507b813c8829f43dbdecb17',
  'bilder/merker/historie/undermerker/byhistorie-brodert-v1.webp':'2ba0f83c8e7cd120312f88e97ba03bc295d2a63c',
  'bilder/merker/historie/undermerker/industrihistorie-brodert-v1.webp':'8b70ae9e76eb790ac0352dd18b911017ef9e665e',
  'bilder/merker/historie/undermerker/krigshistorie-brodert-v1.webp':'174713e5f69eab72be2d0bcd8cda6ac596b14f1a',
  'bilder/merker/historie/undermerker/sosialhistorie-brodert-v1.webp':'2c0f10a8945b8c7e885b25c273c81a8c68b79ef7',
  'bilder/merker/historie/undermerker/kulturminner_og_bevaring-brodert-v1.webp':'081c7cfc3561c750a36d56a0d16379e51b525a29'
};
test('Historie: hovedmerket og tolv integrerte originaler er urørte', () => {
 for (const [path,sha] of Object.entries(protectedBlobs)) assert.equal(gitSha(get(path)),sha,path);
});
test('Krim, ulykker og branner: norsk aktivert, fem språk og kategori beholdt', () => {
 const c=json('data/badges/historie.json');
 const m=json('data/badges/historie_krim_ulykker_og_branner_candidate_v1.json');
 assert.equal(c.sub.length,14);
 assert.equal(c.color,'#603E1E');assert.equal(c.secondaryColor,'#D6A127');
 assert.equal(c.image,'bilder/merker/historie.PNG');
 assert.equal(c.subBadgeImages[m.id],m.sourceImage);
 assert.equal(m.status,'integrated');assert.equal(m.quality.binaryVerified,true);
 assert.equal(m.quality.integrated,true);assert.equal(m.localesActive,false);
 assert.equal(m.design.typography.forbidProgressFraction,true);
 assert.equal(m.palette.primary,c.color);
 assert.deepEqual(Object.fromEntries(Object.entries(m.variants).map(([lang,v]) => [lang,[v.heading,v.footer]])),{
   nb:['KRIM, ULYKKER OG BRANNER','HISTORIE'],
   en:['CRIME, ACCIDENTS & FIRES','HISTORY'],
   es:['CRÍMENES, ACCIDENTES E INCENDIOS','HISTORIA'],
   pt:['CRIMES, ACIDENTES E INCÊNDIOS','HISTÓRIA'],
   fr:['CRIMES, ACCIDENTS ET INCENDIES','HISTOIRE']});
 assert.equal(m.seriesProgress.integrated,13);
});
test('Krim, ulykker og branner: alle fem WebP er originale verifiserte 1024x1024 RGBA', () => {
 const m=json('data/badges/historie_krim_ulykker_og_branner_candidate_v1.json');
 for(const [lang,v] of Object.entries(m.variants)){
   const b=get(v.path);
   assert.equal(b.toString('ascii',0,4),'RIFF',lang);
   assert.equal(b.toString('ascii',8,12),'WEBP',lang);
   assert.equal(b.toString('ascii',12,16),'VP8X',lang);
   assert.equal(b.readUIntLE(24,3)+1,1024,lang);
   assert.equal(b.readUIntLE(27,3)+1,1024,lang);
   assert.ok((b[20]&16)!==0,lang+' alpha');
   assert.equal(b.length,v.bytes,lang+' bytes');
   assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' sha256');
   assert.equal(gitSha(b),v.gitBlobSha,lang+' git blob');
 }
});
