import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { placeSourceHash } from '../scripts/check-place-i18n-freshness.mjs';

const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const canonicalPath = 'data/places/by/oslo/places/akerselva.json';
const runtimePath = 'data/runtime/place-open/akerselva.json';

test('Akerselva content translations match current canonical article', () => {
  const place = read(canonicalPath);
  const sourceHash = placeSourceHash(place);
  const canonicalParagraphs = place.popupDesc.split(/\n\s*\n/).length;
  assert.equal(canonicalParagraphs, 8);
  assert.equal(place.name, 'Akerselva');
  assert.ok(place.desc.includes('Maridalsvannet'));
  for (const lang of ['en', 'es', 'pt']) {
    const entry = read('data/i18n/content/places/' + lang + '.json').akerselva;
    assert.ok(entry, 'Missing Akerselva translation: ' + lang);
    assert.equal(entry._sourceHash, sourceHash, 'Stale source hash: ' + lang);
    assert.equal(entry.name, 'Akerselva');
    assert.ok(entry.desc.length >= place.desc.length * 0.8);
    assert.equal(entry.popupDesc.split(/\n\s*\n/).length, canonicalParagraphs);
    assert.ok(entry.popupDesc.length >= place.popupDesc.length * 0.75);
    assert.notEqual(entry.desc, place.desc);
    assert.notEqual(entry.popupDesc, place.popupDesc);
    for (const anchor of ['1696', '1840', '1986', '1990', '2011', '2014', 'Sissel Rønbeck', 'Midgardsormen', 'Hjula Væverier', 'Myrens Verksted']) {
      assert.ok(entry.popupDesc.includes(anchor), lang + ': missing historical anchor ' + anchor);
    }
  }
});

test('Akerselva image rights and published place-open source stay aligned', () => {
  const place = read(canonicalPath);
  const runtime = read(runtimePath).place;
  assert.equal(runtime.id, place.id);
  for (const key of ['name','desc','popupDesc','image','cardImage','imageCredit','imageLicense','imageLicenseUrl','imageSourceUrl','frontImage','frontImageMeta']) {
    assert.deepEqual(runtime[key], place[key], 'runtime parity for ' + key);
  }
  assert.equal(place.image, place.cardImage);
  assert.equal(place.imageLicense, 'CC BY-SA 4.0');
  assert.match(place.imageCredit, /Reem78/);
  assert.equal(place.imageLicenseUrl, 'https://creativecommons.org/licenses/by-sa/4.0/');
  assert.equal(place.imageSourceUrl, 'https://commons.wikimedia.org/wiki/File:The_Akerselva_river_in_Oslo.jpg');
  assert.ok(place.image.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/'));
  assert.ok(place.frontImage.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/'));
  assert.notEqual(place.frontImage, place.image, 'The portrait must use an independent original');
  assert.equal(place.frontImageMeta.orientation, 'portrait');
  assert.equal(place.frontImageMeta.aspectRatio, '2:3');
  assert.equal(place.frontImageMeta.creator, 'Ryan Hodnett');
  assert.equal(place.frontImageMeta.license, 'CC BY-SA 4.0');
  assert.ok(place.frontImageMeta.sourcePage.includes('2020-08-06'));
  assert.match(place.frontImageMeta.viewpoint, /Nydalsdammen/);

});


test('Akerselva 1990 Spigerverket spill names hydrochloric acid, not sulphuric acid', () => {
  const place = read(canonicalPath);
  const runtime = read(runtimePath).place;
  assert.match(place.popupDesc, /saltsyre fra Spigerverket/);
  assert.doesNotMatch(place.popupDesc, /svovelsyre fra Spigerverket/);
  assert.equal(runtime.popupDesc, place.popupDesc);
  const expected = { en: 'hydrochloric acid from Spigerverket', es: 'ácido clorhídrico procedente de Spigerverket', pt: 'ácido clorídrico proveniente de Spigerverket' };
  const disallowed = { en: 'sulphuric acid from Spigerverket', es: 'ácido sulfúrico procedente de Spigerverket', pt: 'ácido sulfúrico proveniente de Spigerverket' };
  for (const lang of ['en', 'es', 'pt']) {
    const article = read('data/i18n/content/places/' + lang + '.json').akerselva.popupDesc;
    assert.ok(article.includes(expected[lang]), lang + ': correct acid missing');
    assert.ok(!article.includes(disallowed[lang]), lang + ': superseded acid still present');
  }
});
