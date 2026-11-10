import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=(p)=>readFileSync(new URL(p,root));
const json=(p)=>JSON.parse(read(p).toString('utf8'));
const git=(b)=>createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');
const expected={
  "nb": [
    "INDUSTRIHISTORIE",
    "HISTORIE"
  ],
  "en": [
    "INDUSTRIAL HISTORY",
    "HISTORY"
  ],
  "es": [
    "HISTORIA INDUSTRIAL",
    "HISTORIA"
  ],
  "pt": [
    "HISTÓRIA INDUSTRIAL",
    "HISTÓRIA"
  ],
  "fr": [
    "HISTOIRE INDUSTRIELLE",
    "HISTOIRE"
  ]
};
const hashes={
  "nb": {
    "bytes": 452918,
    "gitBlobSha": "8b70ae9e76eb790ac0352dd18b911017ef9e665e",
    "sha256": "9246ed235bfe5251758448d42bff47e2113f4a9456bc01b500869a49594c9e39"
  },
  "en": {
    "bytes": 410406,
    "gitBlobSha": "ba50d004c605f18a990623faabbf298ed8ec93dc",
    "sha256": "e43662d63ee3b82de71d72d6f109bcc5205ea038e16ac1de1b13e6bb5c41f711"
  },
  "es": {
    "bytes": 411240,
    "gitBlobSha": "33b39604045294039e38dd57d1b28ba704c5612e",
    "sha256": "12f0cffb40c42bda85bfb0d12ab998430412cc3844f3e3a84f914bbb9f3e7428"
  },
  "pt": {
    "bytes": 411622,
    "gitBlobSha": "bca97af69e7cabba5b711889be9a81f3de642428",
    "sha256": "8ff1ba05655ef9006365389511116f5132c83626065372c8e8676a140c8f5a5d"
  },
  "fr": {
    "bytes": 411040,
    "gitBlobSha": "2d318f7dfc79753a73ccde8a75bb5382b45140e2",
    "sha256": "e2019b7e08aaf707d38fee81518857c9086219aa88cb62a3b7214dc95df925b1"
  }
};
test('Industrihistorie har riktig Historie-farge, tekster og norsk aktivering',()=>{
 const m=json('data/badges/historie_industrihistorie_candidate_v1.json');
 const c=json('data/badges/historie.json');
 assert.equal(m.id,'industrihistorie');
 assert.equal(c.color,'#603E1E');
 assert.equal(c.secondaryColor,'#D6A127');
 assert.equal(m.palette.primary,c.color);
 assert.equal(m.palette.secondary,c.secondaryColor);
 assert.equal(m.palette.text,'#F5E8CE');
 assert.equal(m.design.typography.forbidProgressFraction,true);
 assert.equal(m.localesActive,false);
 assert.equal(c.image,'bilder/merker/historie.PNG');
 assert.equal(c.subBadgeImages.industrihistorie,m.sourceImage);
 assert.equal(Object.keys(c.subBadgeImages).length,9);
 assert.equal(m.quality.integrated,true);
 assert.equal(m.quality.visualApproved,true);
 assert.equal(m.quality.binaryVerified,true);
 for(const [lang,txt] of Object.entries(expected)){
  assert.equal(m.variants[lang].heading,txt[0]);
  assert.equal(m.variants[lang].footer,txt[1]);
 }
});
test('Fem originaler: WebP 1024px, alpha og eksakte SHA-256/Git-hasher',()=>{
 const m=json('data/badges/historie_industrihistorie_candidate_v1.json');
 for(const [lang,want] of Object.entries(hashes)){
  const b=read(m.variants[lang].path);
  assert.equal(b.length,want.bytes,lang+' size');
  assert.equal(b.toString('ascii',0,4),'RIFF');
  assert.equal(b.toString('ascii',8,12),'WEBP');
  assert.equal(b.toString('ascii',12,16),'VP8X');
  assert.equal(b.readUIntLE(24,3)+1,1024);
  assert.equal(b.readUIntLE(27,3)+1,1024);
  assert.ok(b[20]&0x10,lang+' alpha');
  assert.equal(createHash('sha256').update(b).digest('hex'),want.sha256,lang+' sha256');
  assert.equal(git(b),want.gitBlobSha,lang+' git');
 }
});
test('Åtte tidligere Historie-merker består og forblir registrert',()=>{
 const c=json('data/badges/historie.json');
 const originals=['forhistorie','middelalder','tidlig_modernetid','attenhundretallet','nittenhundre_1900_1945','etterkrigstid','samtidshistorie','byhistorie'];
 for(const id of originals){
  assert.equal(c.subBadgeImages[id], 'bilder/merker/historie/undermerker/'+id+'-brodert-v1.webp');
  assert.ok(read(c.subBadgeImages[id]).length>1000,id);
 }
});
