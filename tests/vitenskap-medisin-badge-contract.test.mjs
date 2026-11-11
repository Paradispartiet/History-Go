import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const json=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const badge=json('data/badges/vitenskap.json');
const manifest=json('data/badges/vitenskap_medisin_candidate_v1.json');
const previous={
  "naturvitenskap": "bilder/merker/vitenskap/brodert/naturvitenskap.webp",
  "teknologi": "bilder/merker/vitenskap/brodert/teknologi.webp",
  "matematikk": "bilder/merker/vitenskap/brodert/matematikk.webp",
  "informasjonsteknologi": "bilder/merker/vitenskap/brodert/informasjonsteknologi.webp",
  "forskning_og_metode": "bilder/merker/vitenskap/brodert/forskning_og_metode.webp",
  "astronomi_og_fysikk": "bilder/merker/vitenskap/brodert/astronomi_og_fysikk.webp",
  "kjemi_og_materialvitenskap": "bilder/merker/vitenskap/brodert/kjemi_og_materialvitenskap.webp",
  "teknologi_og_ingeniorfag": "bilder/merker/vitenskap/brodert/teknologi_og_ingeniorfag.webp",
  "data_programvare_og_algoritmer": "bilder/merker/vitenskap/brodert/data_programvare_og_algoritmer.webp",
  "nettverk_og_digital_infrastruktur": "bilder/merker/vitenskap/brodert/nettverk_og_digital_infrastruktur.webp",
  "elektronikk_robotikk_og_automatisering": "bilder/merker/vitenskap/brodert/elektronikk_robotikk_og_automatisering.webp"
};
test('Medisin: 12 active science underbadges, previous eleven images unchanged',()=>{
 assert.equal(manifest.categoryId,'vitenskap');
 assert.equal(manifest.id,'medisin');
 assert.equal(manifest.status,'integrated');
 assert.equal(badge.name,'Vitenskap & teknologi');
 assert.equal(badge.color,'#6A5AE0');
 assert.equal(badge.secondaryColor,'#FFFFFF');
 assert.equal(badge.sub.length,16);
 assert.ok(badge.sub.includes('medisin'));
 assert.equal(badge.image,manifest.parentBadgeReference.path);
 assert.ok(Object.keys(badge.subBadgeImages).length>=12, 'Medisin and its existing science badges must remain active');
 assert.equal(badge.subBadgeImages.medisin,manifest.variants.nb.path);
 for(const [id,path] of Object.entries(previous)){
  assert.equal(badge.subBadgeImages[id],path,id+' changed');
  assert.ok(existsSync(new URL(path,root)),id+' original WebP missing');
 }
 assert.equal(manifest.activeLocale,'nb');
 assert.equal(manifest.localesActive,false);
 assert.equal(manifest.design.noProgressCounters,true);
});
test('Medisin: five 1024 px transparent WebP originals with translated main-category footers',()=>{
 const expected={
  nb:['MEDISIN','VITENSKAP & TEKNOLOGI'],
  en:['MEDICINE','SCIENCE & TECHNOLOGY'],
  es:['MEDICINA','CIENCIA Y TECNOLOGÍA'],
  pt:['MEDICINA','CIÊNCIA E TECNOLOGIA'],
  fr:['MÉDECINE','SCIENCE ET TECHNOLOGIE']
 };
 assert.deepEqual(Object.keys(manifest.variants).sort(),Object.keys(expected).sort());
 for(const [lang,v] of Object.entries(manifest.variants)){
   assert.deepEqual([v.heading,v.footer],expected[lang]);
   const bytes=readFileSync(new URL(v.path,root));
   assert.equal(bytes.toString('ascii',0,4),'RIFF',lang);
   assert.equal(bytes.toString('ascii',8,12),'WEBP',lang);
   assert.equal(bytes.toString('ascii',12,16),'VP8X',lang);
   assert.equal(bytes.readUIntLE(24,3)+1,1024,lang);
   assert.equal(bytes.readUIntLE(27,3)+1,1024,lang);
   assert.ok(bytes[20]&16,lang+' has no transparency');
   assert.equal(bytes.length,v.bytes,lang);
   assert.equal(createHash('sha256').update(bytes).digest('hex'),v.sha256,lang);
   const blob=createHash('sha1').update(Buffer.from('blob '+bytes.length)).update(Buffer.from([0])).update(bytes).digest('hex');
   assert.equal(blob,v.gitBlobSha,lang);
 }
});
