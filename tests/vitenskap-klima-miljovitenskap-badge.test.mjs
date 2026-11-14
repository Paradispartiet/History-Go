import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url);
const json=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const badge=json('data/badges/vitenskap.json');
const manifest=json('data/badges/vitenskap_klima_miljovitenskap_candidate_v1.json');
const preceding={
  "naturvitenskap": "bilder/merker/vitenskap/brodert/naturvitenskap.webp",
  "teknologi": "bilder/merker/vitenskap/brodert/teknologi.webp",
  "matematikk": "bilder/merker/vitenskap/brodert/matematikk.webp",
  "informasjonsteknologi": "bilder/merker/vitenskap/brodert/informasjonsteknologi.webp",
  "forskning_og_metode": "bilder/merker/vitenskap/brodert/forskning_og_metode.webp",
  "astronomi_og_fysikk": "bilder/merker/vitenskap/brodert/astronomi_og_fysikk.webp",
  "kjemi_og_materialvitenskap": "bilder/merker/vitenskap/brodert/kjemi_og_materialvitenskap.webp",
  "teknologi_og_ingeniorfag": "bilder/merker/vitenskap/brodert/teknologi_og_ingeniorfag_v7.webp",
  "data_programvare_og_algoritmer": "bilder/merker/vitenskap/brodert/data_programvare_og_algoritmer_v7.webp",
  "nettverk_og_digital_infrastruktur": "bilder/merker/vitenskap/brodert/nettverk_og_digital_infrastruktur_v7.webp",
  "elektronikk_robotikk_og_automatisering": "bilder/merker/vitenskap/brodert/elektronikk_robotikk_og_automatisering.webp",
  "medisin": "bilder/merker/vitenskap/brodert/medisin.webp",
  "psykologi_og_hjerne": "bilder/merker/vitenskap/brodert/psykologi_og_hjerne.webp",
  "vitenskapshistorie": "bilder/merker/vitenskap/brodert/vitenskapshistorie.webp",
  "vitenskaps_og_teknologihistorie": "bilder/merker/vitenskap/brodert/vitenskaps_og_teknologihistorie.webp"
};

test('Klima og miljøvitenskap: full serie 16/16, hovedmerke og alle 15 tidligere merkeillustrasjoner bevart',()=>{
 assert.equal(badge.id,'vitenskap');
 assert.equal(badge.name,'Vitenskap & teknologi');
 assert.equal(badge.color,'#6A5AE0');
 assert.equal(badge.secondaryColor,'#FFFFFF');
 assert.equal(badge.image,'bilder/merker/vitenskap/brodert/vitenskap.webp');
 assert.equal(badge.sub.length,16);
 assert.equal(Object.keys(badge.subBadgeImages).length,16);
 assert.deepEqual(new Set(Object.keys(badge.subBadgeImages)),new Set(badge.sub));
 assert.ok(existsSync(new URL(badge.image,root)));
 for(const [id,path] of Object.entries(preceding)){
  assert.equal(badge.subBadgeImages[id],path,id+' original path changed');
  assert.ok(existsSync(new URL(path,root)),id+' original file missing');
 }
 assert.equal(manifest.status,'integrated');
 assert.equal(manifest.categoryId,'vitenskap');
 assert.equal(manifest.id,'klima_og_miljovitenskap');
 assert.equal(manifest.activeLocale,'nb');
 assert.equal(manifest.localesActive,false);
 assert.equal(manifest.quality.integrated,true);
 assert.equal(manifest.binaryTransfer.verifiedInRepository,true);
 assert.equal(badge.subBadgeImages[manifest.id],manifest.variants.nb.path);
});

test('Klima og miljøvitenskap: five original, transparent, hash-locked 1024px WebP files with full localized title and footer',()=>{
 const headings={
  "nb": "KLIMA- OG MILJØVITENSKAP",
  "en": "CLIMATE AND ENVIRONMENTAL SCIENCE",
  "es": "CIENCIA CLIMÁTICA Y AMBIENTAL",
  "pt": "CIÊNCIA DO CLIMA E DO AMBIENTE",
  "fr": "SCIENCES DU CLIMAT ET DE L’ENVIRONNEMENT"
};
 const footers={
  "nb": "VITENSKAP & TEKNOLOGI",
  "en": "SCIENCE & TECHNOLOGY",
  "es": "CIENCIA Y TECNOLOGÍA",
  "pt": "CIÊNCIA E TECNOLOGIA",
  "fr": "SCIENCE ET TECHNOLOGIE"
};
 assert.deepEqual(Object.keys(manifest.variants).sort(),['en','es','fr','nb','pt']);
 assert.equal(manifest.design.noProgressCounters,true);
 assert.equal(manifest.design.fullParentCategoryAtBottom,true);
 for(const [lang,v] of Object.entries(manifest.variants)){
  assert.equal(v.heading,headings[lang],lang);
  assert.equal(v.footer,footers[lang],lang);
  assert.doesNotMatch(v.heading+v.footer,/\d+\/\d+/,lang);
  assert.equal(v.path,lang==='nb'?'bilder/merker/vitenskap/brodert/klima_og_miljovitenskap.webp':'bilder/merker/vitenskap/locales/'+lang+'/klima_og_miljovitenskap.webp',lang);
  const b=readFileSync(new URL(v.path,root));
  assert.equal(b.toString('ascii',0,4),'RIFF',lang);
  assert.equal(b.toString('ascii',8,12),'WEBP',lang);
  assert.equal(b.toString('ascii',12,16),'VP8X',lang);
  assert.equal(b.readUIntLE(24,3)+1,1024,lang);
  assert.equal(b.readUIntLE(27,3)+1,1024,lang);
  assert.notEqual(b[20]&16,0,lang+' alpha missing');
  assert.equal(b.length,v.bytes,lang);
  assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang);
  assert.equal(createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex'),v.gitBlobSha,lang);
 }
});
