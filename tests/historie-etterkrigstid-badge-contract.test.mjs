import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root=new URL('../',import.meta.url);
const file=(path)=>readFileSync(new URL(path,root));
const read=(path)=>JSON.parse(file(path).toString('utf8'));
const blobSHA=(b)=>createHash('sha1').update(Buffer.from('blob '+b.length)).update(Buffer.from([0])).update(b).digest('hex');

const approved={
 'bilder/merker/historie.PNG':'b74e316e34af8a4009c1e53bc5d7bd3c96849f14',
 'bilder/merker/historie/undermerker/forhistorie-brodert-v1.webp':'cda06198c91da713a17bf84bdc26e4b7aea71d93',
 'bilder/merker/historie/undermerker/middelalder-brodert-v1.webp':'2837fae1f07d67b620a67551f7baf6de26a43f04',
 'bilder/merker/historie/undermerker/tidlig_modernetid-brodert-v1.webp':'d31a90232fc5d2b6754a5695db3da705af426184',
 'bilder/merker/historie/undermerker/attenhundretallet-brodert-v1.webp':'aaff24e81d940bc60d463e9aa2b9dd0d502ebc8f',
 'bilder/merker/historie/undermerker/nittenhundre_1900_1945-brodert-v1.webp':'8e3efbd0699364d6139990799b82159a42d9dee9'
};

test('Tidligere Historie-originaler forblir byte-identiske',()=>{
 for(const [p,hash] of Object.entries(approved)) assert.equal(blobSHA(file(p)),hash,p);
});

test('Etterkrigstid beholder brun Historie-identitet, ren tekst og fem språk',()=>{
 const a=read('data/badges/historie_etterkrigstid_candidate_v1.json');
 const c=read('data/badges/historie.json');
 assert.equal(c.image,'bilder/merker/historie.PNG');
 assert.equal(c.color,'#603E1E');
 assert.equal(c.secondaryColor,'#D6A127');
 assert.equal(c.sub.length,14);
 assert.equal(a.palette.primary,c.color);
 assert.equal(a.palette.secondary,c.secondaryColor);
 assert.equal(a.palette.text,'#F5E8CE');
 assert.equal(a.design.typography.forbidProgressFraction,true);
 assert.equal(a.design.typography.top,'ETTERKRIGSTID');
 assert.equal(a.design.typography.bottom,'HISTORIE');
 assert.equal(a.design.typography.legibleAtPixels,128);
 assert.deepEqual(Object.fromEntries(Object.entries(a.variants).map(([k,v])=>[k,[v.heading,v.footer]])),{
  nb:['ETTERKRIGSTID','HISTORIE'],
  en:['POSTWAR ERA','HISTORY'],
  es:['POSGUERRA','HISTORIA'],
  pt:['PÓS-GUERRA','HISTÓRIA'],
  fr:['APRÈS-GUERRE','HISTOIRE']
 });
 assert.equal(a.localesActive,false);
 if(a.quality.integrated){
  assert.equal(a.quality.binaryVerified,true);
  assert.equal(a.quality.visualApproved,true);
  assert.equal(c.subBadgeImages?.etterkrigstid,a.sourceImage);
 }else{
  assert.equal(c.subBadgeImages?.etterkrigstid,undefined);
 }
});

test('Fem originale Etterkrigstid-WebP må være fullstendige og hash-identiske før aktivering',()=>{
 const a=read('data/badges/historie_etterkrigstid_candidate_v1.json');
 const all=Object.entries(a.variants);
 const present=all.filter(([_,v])=>existsSync(new URL(v.path,root)));
 assert.ok(present.length===0||present.length===5,'Aldri delvis binæroverføring');
 if(present.length===0){
  assert.equal(a.quality.binaryVerified,false);
  assert.equal(a.quality.integrated,false);
  return;
 }
 for(const [lang,v] of all){
  const b=file(v.path);
  assert.equal(b.toString('ascii',0,4),'RIFF',lang);
  assert.equal(b.toString('ascii',8,12),'WEBP',lang);
  assert.equal(b.toString('ascii',12,16),'VP8X',lang);
  assert.equal(b.readUIntLE(24,3)+1,1024,lang+' width');
  assert.equal(b.readUIntLE(27,3)+1,1024,lang+' height');
  assert.ok(b[20]&0x10,lang+' alpha');
  assert.equal(b.length,v.bytes,lang+' length');
  assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang+' SHA256');
  assert.equal(blobSHA(b),v.gitBlobSha,lang+' gitBlobSHA');
 }
 assert.equal(a.quality.binaryVerified,true);
});
