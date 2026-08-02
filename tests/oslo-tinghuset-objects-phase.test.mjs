import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import sharp from 'sharp';

const place = JSON.parse(fs.readFileSync('data/places/politikk/oslo/places_politikk/tinghuset.json', 'utf8'));
const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');
const objects = Array.isArray(place.objects) ? place.objects : [];
const byId = new Map(objects.map(object => [object.id, object]));

const expectedIds = [
  'tinghuset_lex_portalis',
  'tinghuset_oivind_astein_marmorblokker',
  'tinghuset_rettssal_250_skilt'
];

test('Oslo tinghus has exactly three distinct, physical and place-specific Objects', () => {
  assert.deepEqual([...byId.keys()].sort(), expectedIds);
  assert.equal(new Set(objects.map(object => object.title)).size, 3);
  for (const object of objects) {
    assert.equal(object.physicalObject, true, object.id);
    assert.equal(object.placeSpecific, true, object.id);
    assert.ok(object.desc.length >= 100, object.id);
    assert.ok(object.whereToFind.length >= 25, object.id);
    assert.ok(Array.isArray(object.source_urls) && object.source_urls.length >= 1, object.id);
    assert.ok(object.source_urls.every(url => url.startsWith('https://')), object.id);
    assert.ok(fs.existsSync(object.image), object.id);
    assert.ok(fs.existsSync(object.cardImage), object.id);
  }
});

test('the two art Objects preserve their documented Oslo tinghus identities', () => {
  const lex = byId.get('tinghuset_lex_portalis');
  assert.match(lex.desc, /to 32 meter høye veggfelt/);
  assert.match(lex.desc, /porselensplater/);
  assert.match(lex.desc, /Grunnloven/);
  assert.match(lex.whereToFind, /sentralhallen/);

  const marble = byId.get('tinghuset_oivind_astein_marmorblokker');
  assert.match(marble.desc, /32 utstikkende blokker/);
  assert.match(marble.desc, /hvit fauskemarmor/);
  assert.match(marble.whereToFind, /hovedfasaden/);
  assert.match(marble.imageMeta.representationScope, /ikke en nøyaktig reproduksjon/);
});

test('generated Object illustrations are disclosed and have real transparent backgrounds', async () => {
  const generated = objects.filter(object => object.imageMeta?.source === 'history_go_editorial_illustration');
  assert.equal(generated.length, 2);

  for (const object of generated) {
    assert.equal(object.imageMeta.mediaType, 'editorial_illustration', object.id);
    assert.equal(object.imageMeta.background, 'transparent', object.id);
    assert.equal(object.imageMeta.reviewStatus, 'object_identity_and_editorial_review_passed', object.id);
    assert.match(object.imageMeta.disclosure, /Redaksjonell illustrasjon.*ikke fotografi/i, object.id);
    assert.match(object.imageMeta.referenceImage, /^https:\/\/digitaltmuseum\.no\//, object.id);
    assert.ok(object.imageMeta.objectReference.length >= 50, object.id);

    for (const file of [object.image, object.cardImage]) {
      assert.match(file, /\.png$/i, file);
      const metadata = await sharp(file).metadata();
      assert.equal(metadata.hasAlpha, true, file);
      const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let transparentPixels = 0;
      let opaquePixels = 0;
      let greenFringePixels = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const alpha = data[i + info.channels - 1];
        if (alpha === 0) transparentPixels++;
        if (alpha === 255) opaquePixels++;
        if (alpha >= 64 && green > red * 1.45 && green > blue * 1.45 && green > 90) greenFringePixels++;
      }
      assert.ok(transparentPixels > 0, `${file} lacks transparent background pixels`);
      assert.ok(opaquePixels > 0, `${file} lacks an opaque object`);
      assert.equal(greenFringePixels, 0, `${file} retains a visible chroma-key fringe`);
    }
  }
});

test('phase report marks Objects complete while Brands remains open', () => {
  assert.match(report, /Status: \*\*PASS – fase 11\*\*/);
  assert.match(report, /tre canonicale, fysiske og stedsspesifikke Objects/);
  assert.match(report, /Brands-rundingen fortsatt er åpen/);
  assert.match(report, /Status for samlet sted: \*\*under sanering – ikke produksjonsklart\*\*/);
});
