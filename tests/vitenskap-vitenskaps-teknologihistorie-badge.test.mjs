import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url);
const readJSON=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const registry=readJSON('data/badges/vitenskap.json');
const manifest=readJSON('data/badges/vitenskap_vitenskaps_teknologihistorie_candidate_v1.json');
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
  "elektronikk_robotikk_og_automatisering": "bilder/merker/vitenskap/brodert/elektronikk_robotikk_og_automatisering.webp",
  "medisin": "bilder/merker/vitenskap/brodert/medisin.webp",
  "psykologi_og_hjerne": "bilder/merker/vitenskap/brodert/psykologi_og_hjerne.webp",
  "vitenskapshistorie": "bilder/merker/vitenskap/brodert/vitenskapshistorie.webp"
};

test('Teknologihistorie: 14 previous science images and original main badge preserved',()=>{
 assert.equal(registry.id,'vitenskap');
 assert.equal(registry.name,'Vitenskap & teknologi');
 assert.equal(registry.color,'#6A5AE0');
 assert.equal(registry.secondaryColor,'#FFFFFF');
 assert.equal(registry.image,manifest.parentBadgeReference.path);
 assert.equal(registry.sub.length,16);
 assert.ok(registry.sub.includes(manifest.id));
 assert.equal(manifest.status,'integrated');
 assert.equal(manifest.quality.integrated,true);
 assert.equal(manifest.quality.binaryVerifiedInRepository,true);
 assert.ok(Object.keys(registry.subBadgeImages).length>=15);
 for(const [id,path] of Object.entries(previous)){
   assert.equal(registry.subBadgeImages[id],path,id+' existing path changed');
   assert.ok(existsSync(new URL(path,root)),id+' original missing');
 }
 assert.equal(registry.subBadgeImages[manifest.id],manifest.variants.nb.path);
});

test('Teknologihistorie: five exact transparent WebP files with localized complete category footers',()=>{
 const expected={
 nb:['VITENSKAPS- OG TEKNOLOGIHISTORIE','VITENSKAP & TEKNOLOGI'],
 en:['HISTORY OF SCIENCE AND TECHNOLOGY','SCIENCE & TECHNOLOGY'],
 es:['HISTORIA DE LA CIENCIA Y LA TECNOLOGÍA','CIENCIA Y TECNOLOGÍA'],
 pt:['HISTÓRIA DA CIÊNCIA E DA TECNOLOGIA','CIÊNCIA E TECNOLOGIA'],
 fr:['HISTOIRE DES SCIENCES ET DES TECHNOLOGIES','SCIENCE ET TECHNOLOGIE']
 };
 assert.deepEqual(Object.keys(manifest.variants).sort(),['en','es','fr','nb','pt']);
 assert.equal(manifest.design.fullParentCategoryAtBottom,true);
 assert.equal(manifest.design.noProgressCounters,true);
 assert.equal(manifest.localesActive,false);
 assert.equal(manifest.activeLocale,'nb');
 for(const [lang,v] of Object.entries(manifest.variants)){
  assert.deepEqual([v.heading,v.footer],expected[lang],lang);
  assert.doesNotMatch(v.heading+v.footer,/\d+\/\d+/,lang);
  const path=lang==='nb'?'bilder/merker/vitenskap/brodert/vitenskaps_og_teknologihistorie.webp':'bilder/merker/vitenskap/locales/'+lang+'/vitenskaps_og_teknologihistorie.webp';
  assert.equal(v.path,path,lang);
  const b=readFileSync(new URL(path,root));
  assert.equal(b.toString('ascii',0,4),'RIFF',lang);
  assert.equal(b.toString('ascii',8,12),'WEBP',lang);
  assert.equal(b.toString('ascii',12,16),'VP8X',lang);
  assert.equal(b.readUIntLE(24,3)+1,1024,lang);
  assert.equal(b.readUIntLE(27,3)+1,1024,lang);
  assert.notEqual(b[20]&16,0,lang+' needs transparency');
  assert.equal(b.length,v.bytes,lang);
  assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang);
  assert.equal(createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex'),v.gitBlobSha,lang);
 }
});