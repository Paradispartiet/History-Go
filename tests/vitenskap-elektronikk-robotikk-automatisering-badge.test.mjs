import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const json = path => JSON.parse(readFileSync(new URL(path,root),'utf8'));
const manifest = json('data/badges/vitenskap_elektronikk_robotikk_automatisering_candidate_v1.json');
const badge = json('data/badges/vitenskap.json');
const existing = {
  naturvitenskap:'bilder/merker/vitenskap/brodert/naturvitenskap.webp',
  teknologi:'bilder/merker/vitenskap/brodert/teknologi.webp',
  matematikk:'bilder/merker/vitenskap/brodert/matematikk.webp',
  informasjonsteknologi:'bilder/merker/vitenskap/brodert/informasjonsteknologi.webp',
  forskning_og_metode:'bilder/merker/vitenskap/brodert/forskning_og_metode.webp',
  astronomi_og_fysikk:'bilder/merker/vitenskap/brodert/astronomi_og_fysikk.webp',
  kjemi_og_materialvitenskap:'bilder/merker/vitenskap/brodert/kjemi_og_materialvitenskap.webp',
  teknologi_og_ingeniorfag:'bilder/merker/vitenskap/brodert/teknologi_og_ingeniorfag.webp',
  data_programvare_og_algoritmer:'bilder/merker/vitenskap/brodert/data_programvare_og_algoritmer.webp',
  nettverk_og_digital_infrastruktur:'bilder/merker/vitenskap/brodert/nettverk_og_digital_infrastruktur.webp'
};

test('Robotikk: Vitenskap-original og ti tidligere undermerker bevares', () => {
  assert.equal(manifest.categoryId,'vitenskap');
  assert.equal(manifest.id,'elektronikk_robotikk_og_automatisering');
  assert.equal(badge.image,'bilder/merker/vitenskap/brodert/vitenskap.webp');
  assert.equal(badge.color,'#6A5AE0');
  assert.equal(badge.secondaryColor,'#FFFFFF');
  assert.equal(badge.sub.length,16);
  assert.ok(badge.sub.includes(manifest.id));
  assert.equal(Object.keys(badge.subBadgeImages).length,11);
  for (const [id,path] of Object.entries(existing)) {
    assert.equal(badge.subBadgeImages[id],path,id+' changed');
    assert.ok(existsSync(new URL(path,root)),id+' asset missing');
  }
  assert.equal(badge.subBadgeImages[manifest.id],manifest.sourceImage);
  assert.equal(manifest.parentBadgeReference.path,badge.image);
});

test('Robotikk: korrekt topptekst og fullt hovedkategorinavn nederst på alle fem språk', () => {
  assert.equal(manifest.status,'integrated');
  assert.equal(manifest.design.topUsesCanonicalNorwegianName,true);
  assert.equal(manifest.design.bottomUsesFullParentCategoryName,true);
  assert.equal(manifest.design.translatedBothFields,true);
  assert.equal(manifest.design.noProgressCounters,true);
  assert.equal(manifest.localesActive,false);
  assert.equal(manifest.activeLocale,'nb');
  assert.deepEqual(Object.keys(manifest.variants).sort(),['en','es','fr','nb','pt']);
  const expected={
    nb:['ELEKTRONIKK, ROBOTIKK OG AUTOMATISERING','VITENSKAP & TEKNOLOGI'],
    en:['ELECTRONICS, ROBOTICS AND AUTOMATION','SCIENCE & TECHNOLOGY'],
    es:['ELECTRÓNICA, ROBÓTICA Y AUTOMATIZACIÓN','CIENCIA Y TECNOLOGÍA'],
    pt:['ELETRÔNICA, ROBÓTICA E AUTOMAÇÃO','CIÊNCIA E TECNOLOGIA'],
    fr:['ÉLECTRONIQUE, ROBOTIQUE ET AUTOMATISATION','SCIENCES ET TECHNOLOGIES']
  };
  for (const [lang, fields] of Object.entries(expected)) {
    const v=manifest.variants[lang];
    assert.deepEqual([v.heading,v.footer],fields,lang);
    assert.doesNotMatch(v.heading+v.footer,/\d+\/\d+/,lang);
    assert.equal(v.path,'bilder/merker/vitenskap/'+(lang==='nb'?'brodert':'locales/'+lang)+'/elektronikk_robotikk_og_automatisering.webp');
  }
});

test('Robotikk: alle fem byte-låste WebP-originaler finnes i repo', () => {
  assert.equal(manifest.binaryTransfer.verifiedInRepository,true);
  for(const [lang,v] of Object.entries(manifest.variants)){
    const b=readFileSync(new URL(v.path,root));
    assert.equal(b.toString('ascii',0,4),'RIFF',lang);
    assert.equal(b.toString('ascii',8,12),'WEBP',lang);
    assert.equal(b.toString('ascii',12,16),'VP8X',lang);
    assert.equal(b.readUIntLE(24,3)+1,1024,lang);
    assert.equal(b.readUIntLE(27,3)+1,1024,lang);
    assert.ok((b[20]&16)!==0,lang+' missing alpha');
    assert.equal(b.length,v.bytes,lang);
    assert.equal(createHash('sha256').update(b).digest('hex'),v.sha256,lang);
    const blob=createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
    assert.equal(blob,v.gitBlobSha,lang);
  }
});
