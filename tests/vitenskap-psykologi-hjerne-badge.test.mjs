import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const manifest = read('data/badges/vitenskap_psykologi_og_hjerne_candidate_v1.json');
const science = read('data/badges/vitenskap.json');
const oldIds = [
  'naturvitenskap','teknologi','matematikk','informasjonsteknologi',
  'forskning_og_metode','astronomi_og_fysikk','kjemi_og_materialvitenskap',
  'teknologi_og_ingeniorfag','data_programvare_og_algoritmer',
  'nettverk_og_digital_infrastruktur','elektronikk_robotikk_og_automatisering','medisin'
];
const id = 'psykologi_og_hjerne';

test('Psykologi: eksisterende tolv originalmerker bevares og kandidat aktiveres ikke uten bilder', () => {
  assert.equal(manifest.id, id);
  assert.equal(manifest.categoryId, 'vitenskap');
  assert.equal(science.id, 'vitenskap');
  assert.equal(science.name, 'Vitenskap & teknologi');
  assert.equal(science.color, '#6A5AE0');
  assert.equal(science.secondaryColor, '#FFFFFF');
  assert.equal(science.image, manifest.parentBadgeReference.path);
  assert.equal(science.sub.length, 16);
  assert.ok(science.sub.includes(id));
  const revisedIds = new Set(['teknologi_og_ingeniorfag','data_programvare_og_algoritmer','nettverk_og_digital_infrastruktur']);
  for (const oldId of oldIds) {
    const oldOriginal = 'bilder/merker/vitenskap/brodert/' + oldId + '.webp';
    const expected = revisedIds.has(oldId)
      ? 'bilder/merker/vitenskap/brodert/' + oldId + '_v7.webp' : oldOriginal;
    assert.equal(science.subBadgeImages[oldId], expected, oldId + ' changed unexpectedly');
    assert.ok(existsSync(new URL(expected, root)), oldId + ' registered file missing');
    assert.ok(existsSync(new URL(oldOriginal, root)), oldId + ' historical original missing');
  }
  assert.ok(['candidate','integrated'].includes(manifest.status));
  assert.ok(Object.keys(science.subBadgeImages).length >=
    (manifest.status === 'integrated' ? 13 : 12), 'Previously integrated science badges must remain present');
  assert.equal(science.subBadgeImages[id],
    manifest.status === 'integrated' ? manifest.variants.nb.path : undefined);
});
test('Psykologi: fem språk, full hovedkategori nederst og låste hashverdier', () => {
  assert.deepEqual(Object.keys(manifest.variants).sort(), ['en','es','fr','nb','pt']);
  assert.equal(manifest.design.fullParentCategoryAtBottom, true);
  assert.equal(manifest.design.noProgressCounters, true);
  assert.equal(manifest.localesActive, false);
  const expected = {
    nb: ['PSYKOLOGI OG HJERNE','VITENSKAP & TEKNOLOGI'],
    en: ['PSYCHOLOGY AND BRAIN','SCIENCE & TECHNOLOGY'],
    es: ['PSICOLOGÍA Y CEREBRO','CIENCIA Y TECNOLOGÍA'],
    pt: ['PSICOLOGIA E CÉREBRO','CIÊNCIA E TECNOLOGIA'],
    fr: ['PSYCHOLOGIE ET CERVEAU','SCIENCE ET TECHNOLOGIE']
  };
  for (const [lang, variant] of Object.entries(manifest.variants)) {
    assert.deepEqual([variant.heading,variant.footer],expected[lang],lang);
    assert.doesNotMatch(variant.heading+variant.footer, /\d+\/\d+/);
    const target = lang === 'nb'
      ? 'bilder/merker/vitenskap/brodert/psykologi_og_hjerne.webp'
      : 'bilder/merker/vitenskap/locales/'+lang+'/psykologi_og_hjerne.webp';
    assert.equal(variant.path, target, lang);
    assert.match(variant.sha256,/^[a-f0-9]{64}$/);
    assert.match(variant.gitBlobSha,/^[a-f0-9]{40}$/);
    assert.ok(variant.bytes>100000);
    const asset=new URL(variant.path,root);
    if(manifest.status === 'candidate') {
      assert.equal(existsSync(asset),false,lang+' must remain pending without verified binary');
      continue;
    }
    const bytes=readFileSync(asset);
    assert.equal(bytes.toString('ascii',0,4),'RIFF',lang);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',lang);
    assert.equal(bytes.toString('ascii',12,16),'VP8X',lang);
    assert.equal(bytes.readUIntLE(24,3)+1,1024,lang);
    assert.equal(bytes.readUIntLE(27,3)+1,1024,lang);
    assert.notEqual(bytes[20]&16,0,lang+' must have alpha');
    assert.equal(bytes.length,variant.bytes,lang);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),variant.sha256,lang);
    assert.equal(createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex'),variant.gitBlobSha,lang);
  }
  if (manifest.status === 'integrated') {
    assert.equal(manifest.quality.binaryVerifiedInRepository, true);
    assert.equal(manifest.binaryTransfer.verifiedInRepository, true);
    assert.equal(manifest.quality.integrated, true);
  } else {
    assert.equal(manifest.quality.integrated, false);
  }
});
