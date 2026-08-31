import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import sharp from 'sharp';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const manifest = readJson('data/people/manifest.json');
const people = manifest.files.flatMap(file => {
  const value = readJson(`data/people/${file.slice('people/'.length)}`);
  return Array.isArray(value) ? value : Array.isArray(value.people) ? value.people : [value];
});
const linked = people.filter(person =>
  person.placeId === 'regjeringskvartalet' || person.places?.includes('regjeringskvartalet')
);
const visible = linked.filter(person => !person.roundHoldbacks?.includes('regjeringskvartalet'));
const attributions = readJson('data/people/people_image_attributions.json');
const attributionIds = new Set(attributions.map(row => row.personId));

test('22 canonical People remain linked while the visible round contains 21 image-ready profiles', () => {
  assert.equal(linked.length, 22);
  assert.equal(visible.length, 21);
  const jystad = linked.find(person => person.id === 'sverre_jystad');
  assert.ok(jystad);
  assert.deepEqual(jystad.roundHoldbacks, ['regjeringskvartalet']);
  assert.match(jystad.roundHoldbackReason, /identitetskontrollert/);

  for (const person of visible) {
    assert.ok(person.image, person.id);
    assert.ok(person.cardImage, person.id);
    assert.ok(fs.existsSync(person.image), `${person.id}: image`);
    assert.ok(fs.existsSync(person.cardImage), `${person.id}: cardImage`);
    assert.ok(person.imageMeta, `${person.id}: imageMeta`);
    assert.ok(['wikimedia_commons', 'history_go_editorial_illustration'].includes(person.imageMeta.source), person.id);
    assert.match(person.imageMeta.license, /^(Public domain|CC0|CC BY)/i, person.id);
    assert.ok(person.imageMeta.licenseUrl.startsWith('https://'), person.id);
    assert.ok(attributionIds.has(person.id), `${person.id}: attribution`);
  }
});

test('editorial portraits are transparently disclosed and contain real alpha pixels', async () => {
  const illustrations = visible.filter(person => person.imageMeta.source === 'history_go_editorial_illustration');
  assert.equal(illustrations.length, 5);
  for (const person of illustrations) {
    assert.equal(person.imageMeta.mediaType, 'editorial_illustration', person.id);
    assert.equal(person.imageMeta.background, 'transparent', person.id);
    assert.match(person.imageMeta.disclosure, /illustrasjon/i, person.id);
    assert.match(person.imageMeta.disclosure, /ikke fotografi/i, person.id);
    for (const file of new Set([person.image, person.cardImage])) {
      const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let transparent = 0;
      let opaque = 0;
      for (let i = info.channels - 1; i < data.length; i += info.channels) {
        if (data[i] === 0) transparent++;
        if (data[i] === 255) opaque++;
      }
      assert.ok(transparent > 0, `${person.id}: transparent pixels`);
      assert.ok(opaque > 0, `${person.id}: opaque subject`);
    }
  }
});

test('Statsbygg supplies its officially sourced identity asset with referential-use metadata', () => {
  const brands = readJson('data/brands/brands_master.json');
  const mapping = readJson('data/brands/brands_by_place.json').regjeringskvartalet;
  const statsbygg = brands.find(brand => brand.id === 'statsbygg');
  assert.equal(mapping.length, 14);
  assert.ok(statsbygg);
  assert.equal(statsbygg.logo, undefined);
  assert.ok(fs.existsSync(statsbygg.image));
  assert.equal(statsbygg.imageMeta.source, 'statsbygg_official_identity');
  assert.equal(statsbygg.imageMeta.assetKind, 'logo');
  assert.equal(statsbygg.imageMeta.rightsBasis, 'referential_identification');
  assert.equal(statsbygg.imageMeta.noEndorsement, true);

  const loader = fs.readFileSync('js/brands/brands_loader.js', 'utf8');
  const placeCard = fs.readFileSync('js/ui/place-card.js', 'utf8');
  const popup = fs.readFileSync('js/ui/popup-utils.js', 'utf8');
  assert.match(loader, /image: asString\(raw\?\.image\)/);
  assert.match(placeCard, /resolved\?\.logo \|\| resolved\?\.image/);
  assert.match(popup, /brand\.logo \|\| brand\.image/);
});
