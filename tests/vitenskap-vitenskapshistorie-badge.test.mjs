import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root = new URL('../',import.meta.url);
const readJSON = path => JSON.parse(readFileSync(new URL(path,root),'utf8'));
const badge = readJSON('data/badges/vitenskap.json');
const manifest = readJSON('data/badges/vitenskap_vitenskapshistorie_candidate_v1.json');
const legacy = {"naturvitenskap":"bilder/merker/vitenskap/brodert/naturvitenskap.webp","teknologi":"bilder/merker/vitenskap/brodert/teknologi.webp","matematikk":"bilder/merker/vitenskap/brodert/matematikk.webp","informasjonsteknologi":"bilder/merker/vitenskap/brodert/informasjonsteknologi.webp","forskning_og_metode":"bilder/merker/vitenskap/brodert/forskning_og_metode.webp","astronomi_og_fysikk":"bilder/merker/vitenskap/brodert/astronomi_og_fysikk.webp","kjemi_og_materialvitenskap":"bilder/merker/vitenskap/brodert/kjemi_og_materialvitenskap.webp","teknologi_og_ingeniorfag":"bilder/merker/vitenskap/brodert/teknologi_og_ingeniorfag_v7.webp","data_programvare_og_algoritmer":"bilder/merker/vitenskap/brodert/data_programvare_og_algoritmer_v7.webp","nettverk_og_digital_infrastruktur":"bilder/merker/vitenskap/brodert/nettverk_og_digital_infrastruktur_v7.webp","elektronikk_robotikk_og_automatisering":"bilder/merker/vitenskap/brodert/elektronikk_robotikk_og_automatisering.webp","medisin":"bilder/merker/vitenskap/brodert/medisin.webp","psykologi_og_hjerne":"bilder/merker/vitenskap/brodert/psykologi_og_hjerne.webp"};

test('Vitenskapshistorie: thirteen earlier embroidered science badges preserved',()=>{
 assert.equal(badge.name,'Vitenskap & teknologi');
 assert.equal(badge.color,'#6A5AE0');
 assert.equal(badge.secondaryColor,'#FFFFFF');
 assert.equal(badge.sub.length,16);
 assert.ok(badge.sub.includes('vitenskapshistorie'));
 assert.equal(badge.image,'bilder/merker/vitenskap/brodert/vitenskap.webp');
 assert.equal(manifest.status,'integrated');
 assert.ok(Object.keys(badge.subBadgeImages).length>=14);
 for(const [id,path] of Object.entries(legacy)){
  assert.equal(badge.subBadgeImages[id],path,id+' changed');
  assert.ok(existsSync(new URL(path,root)),path+' missing');
 }
 assert.equal(badge.subBadgeImages[manifest.id],manifest.variants.nb.path);
});
test('Vitenskapshistorie: complete five translated science badges with exact binary checksums',()=>{
 assert.deepEqual(Object.keys(manifest.variants).sort(),['en','es','fr','nb','pt']);
 assert.equal(manifest.localesActive,false);
 assert.equal(manifest.activeLocale,'nb');
 assert.equal(manifest.design.fullParentCategoryAtBottom,true);
 assert.equal(manifest.design.noProgressCounters,true);
 assert.equal(manifest.quality.binaryVerifiedInRepository,true);
 const footer={nb:'VITENSKAP & TEKNOLOGI',en:'SCIENCE & TECHNOLOGY',es:'CIENCIA Y TECNOLOGÍA',pt:'CIÊNCIA E TECNOLOGIA',fr:'SCIENCE ET TECHNOLOGIE'};
 for(const [lang,v] of Object.entries(manifest.variants)){
  assert.equal(v.footer,footer[lang]);
  assert.doesNotMatch(v.heading+v.footer,/\d+\/\d+/);
  assert.ok(v.heading.length>7);
  const path=lang==='nb'
    ? 'bilder/merker/vitenskap/brodert/vitenskapshistorie.webp'
    : 'bilder/merker/vitenskap/locales/'+lang+'/vitenskapshistorie.webp';
  assert.equal(v.path,path,lang);
  const bytes=readFileSync(new URL(v.path,root));
  assert.equal(bytes.toString('ascii',0,4),'RIFF',lang);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',lang);
  assert.equal(bytes.toString('ascii',12,16),'VP8X',lang);
  assert.equal(bytes.readUIntLE(24,3)+1,1024,lang);
  assert.equal(bytes.readUIntLE(27,3)+1,1024,lang);
  assert.notEqual(bytes[20]&16,0,lang+' no alpha');
  assert.equal(bytes.length,v.bytes,lang);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),v.sha256,lang);
  assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),v.gitBlobSha,lang);
 }
});
