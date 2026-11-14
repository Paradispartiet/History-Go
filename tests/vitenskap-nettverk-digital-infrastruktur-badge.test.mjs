import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const json = p => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const manifest = json('data/badges/vitenskap_nettverk_digital_infrastruktur_candidate_v1.json');
const badge = json('data/badges/vitenskap.json');
const previous = {
  naturvitenskap:'bilder/merker/vitenskap/brodert/naturvitenskap.webp',
  teknologi:'bilder/merker/vitenskap/brodert/teknologi.webp',
  matematikk:'bilder/merker/vitenskap/brodert/matematikk.webp',
  informasjonsteknologi:'bilder/merker/vitenskap/brodert/informasjonsteknologi.webp',
  forskning_og_metode:'bilder/merker/vitenskap/brodert/forskning_og_metode.webp',
  astronomi_og_fysikk:'bilder/merker/vitenskap/brodert/astronomi_og_fysikk.webp',
  kjemi_og_materialvitenskap:'bilder/merker/vitenskap/brodert/kjemi_og_materialvitenskap.webp',
  teknologi_og_ingeniorfag:'bilder/merker/vitenskap/brodert/teknologi_og_ingeniorfag.webp',
  data_programvare_og_algoritmer:'bilder/merker/vitenskap/brodert/data_programvare_og_algoritmer.webp'
};
test('Network badge preserves the established science family and old originals during v7 proposal', () => {
  assert.equal(manifest.categoryId, 'vitenskap');
  assert.equal(manifest.id, 'nettverk_og_digital_infrastruktur');
  assert.equal(manifest.status, 'integrated');
  assert.equal(badge.image, manifest.parentBadgeReference.path);
  assert.equal(badge.color, '#6A5AE0');
  assert.equal(badge.secondaryColor, '#FFFFFF');
  assert.equal(badge.sub.length, 16);
  assert.ok(badge.sub.includes(manifest.id));
  for (const [id, path] of Object.entries(previous)) {
    const replacement = ['teknologi_og_ingeniorfag','data_programvare_og_algoritmer'].includes(id)
      ? 'bilder/merker/vitenskap/brodert/' + id + '_v7.webp' : path;
    assert.equal(badge.subBadgeImages[id], replacement, id + ' changed unexpectedly');
    assert.ok(existsSync(new URL(path, root)), id + ' previous original is missing');
  }
  assert.ok(Object.keys(badge.subBadgeImages).length >= 10);
  assert.equal(badge.subBadgeImages[manifest.id],
    'bilder/merker/vitenskap/brodert/nettverk_og_digital_infrastruktur_v7.webp');
  assert.ok(existsSync(new URL(manifest.variants.nb.path,root)), 'Previous network badge must remain for rollback');
  assert.equal(manifest.quality.binaryVerifiedInRepository, true);
  assert.equal(manifest.quality.integrated, true);
});
test('Network badge: five exact translated 1024px transparent WebP files and correct texts', () => {
  assert.deepEqual(Object.keys(manifest.variants).sort(), ['en','es','fr','nb','pt']);
  assert.equal(manifest.design.noProgressCounters, true);
  assert.equal(manifest.localesActive, false);
  assert.equal(manifest.activeLocale, 'nb');
  const labels = {
    nb:['NETTVERK OG','DIGITAL INFRASTRUKTUR'],
    en:['NETWORKS AND','DIGITAL INFRASTRUCTURE'],
    es:['REDES E','INFRAESTRUCTURA DIGITAL'],
    pt:['REDES E','INFRAESTRUTURA DIGITAL'],
    fr:['RÉSEAUX ET','INFRASTRUCTURE NUMÉRIQUE']
  };
  for (const [lang,asset] of Object.entries(manifest.variants)) {
    assert.deepEqual(asset.lines, labels[lang],lang);
    assert.equal(asset.title, asset.lines.join(' '),lang);
    assert.doesNotMatch(asset.title, /\d+\s*\/\s*\d+/,lang);
    const expected = lang==='nb' ? 'bilder/merker/vitenskap/brodert/nettverk_og_digital_infrastruktur.webp'
      : 'bilder/merker/vitenskap/locales/'+lang+'/nettverk_og_digital_infrastruktur.webp';
    assert.equal(asset.path,expected,lang);
    const bytes=readFileSync(new URL(asset.path,root));
    assert.equal(bytes.toString('ascii',0,4),'RIFF',lang);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',lang);
    assert.equal(bytes.toString('ascii',12,16),'VP8X',lang);
    assert.equal(bytes.readUIntLE(24,3)+1,1024,lang);
    assert.equal(bytes.readUIntLE(27,3)+1,1024,lang);
    assert.ok(bytes[20]&0x10,lang+' missing alpha');
    assert.equal(bytes.length,asset.bytes,lang);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,lang);
    const blob=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
    assert.equal(blob,asset.gitBlobSha,lang);
  }
});
