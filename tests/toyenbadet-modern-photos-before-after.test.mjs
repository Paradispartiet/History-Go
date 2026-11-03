import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import test from 'node:test';

const place = JSON.parse(fs.readFileSync('data/places/sport/europa/norway/oslo_sport/toyenbadet.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('bilder/places/candidates/oslo-vferdig-20261103/toyenbadet_modern_media_candidates.json', 'utf8'));
const sha256 = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const newImage = 'bilder/places/candidates/oslo-vferdig-20261103/toyenbadet_2026_marek_lumi_glass.webp';
const oldImage = 'bilder/places/candidates/oslo-vferdig-20261103/toyenbadet_historic_2013_hero.webp';

test('Tøyenbadet: real 2026 exterior has licensed original, local WebP and correct metadata', () => {
  assert.equal(place.image, newImage);
  assert.equal(place.imageMeta.sourcePage, 'https://unsplash.com/photos/modern-glass-building-with-park-path-HR21MwYowNY');
  assert.equal(place.imageMeta.creator, 'Marek Lumi');
  assert.equal(place.imageMeta.license, 'Unsplash License');
  assert.equal(place.imageMeta.licenseUrl, 'https://unsplash.com/license');
  assert.equal(place.imageLicense, 'Unsplash License');
  assert.equal(place.imageCredit, 'Marek Lumi / Unsplash');
  assert.match(place.imageCaption, /2026/);
  const file = fs.readFileSync(newImage);
  assert.ok(file.length > 30000, 'image must be an actual photo file');
  assert.equal(file.toString('ascii', 0, 4), 'RIFF');
  assert.equal(file.toString('ascii', 8, 12), 'WEBP');
  assert.equal(sha256(file), place.imageMeta.outputSha256);
  assert.ok(!Object.hasOwn(place, 'cardImage'), 'legacy cardImage is forbidden');
});

test('Tøyenbadet: two original historical photographs remain available and correctly labeled', () => {
  assert.ok(fs.existsSync(oldImage));
  assert.equal(place.frontImage, 'bilder/places/candidates/oslo-vferdig-20261103/toyenbadet_historic_1980_portrait.webp');
  assert.equal(place.frontImageMeta.license, 'CC BY 4.0');
  assert.equal(place.for_na.beforeImage, oldImage);
  assert.equal(place.for_na.beforeImageMeta.creator, 'Chell Hill');
  assert.equal(place.for_na.beforeImageMeta.license, 'CC BY-SA 3.0');
  assert.equal(place.for_na.beforeImageMeta.date, '2013-05-25');
  assert.equal(place.for_na.nowImage, newImage);
  assert.equal(place.for_na.nowImageMeta.creator, 'Marek Lumi');
  assert.equal(place.for_na.nowImageMeta.date, '2026-09-28');
  assert.match(place.for_na.now, /6. januar 2025/);
});

test('Tøyenbadet: before/after is substantive, source-based and honest about differing camera positions', () => {
  for (const section of ['before', 'now', 'change']) {
    assert.ok(place.for_na[section].length >= 350, section + ' must be substantial');
  }
  assert.match(place.for_na.change, /forskjellige synsvinkler/);
  assert.ok(place.for_na.sources.includes('https://oslobyleksikon.no/side/T%C3%B8yenbadet'));
  assert.ok(place.for_na.sources.includes('https://unsplash.com/photos/modern-glass-building-with-park-path-HR21MwYowNY'));
  assert.ok(place.for_na.lookFor.length >= 3);
  const image = manifest.assets.find(x => x.path === newImage);
  assert.ok(image);
  assert.equal(image.assetSha256, place.imageMeta.outputSha256);
  const other = manifest.assets.find(x => x.path.endsWith('toyenbadet_2026_marek_lumi_bicycle.webp'));
  assert.ok(other && fs.existsSync(other.path));
  assert.notEqual(other.path, place.image);
  assert.notEqual(other.path, place.for_na.nowImage);
  assert.equal(place.place_card_profile.collection_ids.length, 1, 'other collections must not be activated without validated member previews');
});
