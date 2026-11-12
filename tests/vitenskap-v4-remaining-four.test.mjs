import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const raw = p => readFileSync(new URL('../' + p, import.meta.url));
const read = p => JSON.parse(raw(p).toString('utf8'));
const plan = read('data/badges/vitenskap_v2_localization_20261112.json');
const v2 = read('data/badges/vitenskap_v2_locale_candidates_artwork_20261112.json');
const v4 = read('data/badges/vitenskap_v4_remaining_four_locales_20261112.json');
const active = read('data/badges/vitenskap.json');

const ids = [
  'informasjonsteknologi',
  'matematikk',
  'astronomi_og_fysikk',
  'kjemi_og_materialvitenskap',
];
const locales = ['en', 'es', 'pt', 'fr'];

test('All 16 science v4 candidates are traceable and remain outside the active registry', () => {
  assert.equal(v4.categoryId, 'vitenskap');
  assert.equal(v4.status, 'sixteen_v4_candidates_not_approved_or_active');
  assert.equal(v4.activeBadgeRegistryUnchanged, true);
  assert.equal(v4.existingNorwegianAndV2AssetsPreserved, true);
  assert.deepEqual(v4.ids, ids);
  assert.deepEqual(v4.locales, locales);
  assert.equal(v4.items.length, 16);
  assert.equal(v2.items.length, 20);
  assert.equal(active.sub.length, 16);
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  const keys = new Set();
  for (const item of v4.items) {
    assert.ok(ids.includes(item.id));
    assert.ok(locales.includes(item.locale));
    const key = item.id + ':' + item.locale;
    assert.equal(keys.has(key), false, 'duplicate ' + key);
    keys.add(key);
    assert.equal(
      item.path,
      'bilder/merker/vitenskap/kandidater/revisjoner/'
        + item.locale + '/' + item.id + '-v4-broderi.webp',
    );
    const original = v2.items.find(x => x.id === item.id && x.locale === item.locale);
    assert.ok(original, 'missing corresponding source v2 ' + key);
    assert.equal(original.path, item.source);
    assert.equal(original.gitBlobSha, item.sourceGitBlobSha);
    assert.notEqual(original.path, item.path);
    assert.ok(raw(item.source).length > 100_000);
    assert.equal(item.status, 'candidate_pending_individual_visual_review_not_active');
    assert.equal(active.subBadgeImages[item.id], 'bilder/merker/vitenskap/brodert/' + item.id + '.webp');
    assert.ok(!Object.values(active.subBadgeImages).includes(item.path));
    const localized = plan.items.find(p => p.id === item.id).variants[item.locale];
    assert.equal(item.heading, localized.heading);
    assert.equal(item.footer, localized.footer);
    assert.equal(item.metrics.sourceAlphaIdentical, true);
    assert.equal(item.metrics.centralArtworkBytePreservedBeforeEncoding, true);
    assert.ok(item.metrics.goldPixelsEnhanced > 1000);
    assert.ok(item.metrics.purpleFeltPixelsEnhanced > 1000);
    assert.ok(item.centerMeanCodecDifference < 6);
  }
  assert.equal(keys.size, 16);
});

test('All 16 v4 originals have exact WebP and Git-blob SHA checksums', () => {
  for (const item of v4.items) {
    const buf = raw(item.path);
    assert.equal(buf.toString('ascii', 0, 4), 'RIFF');
    assert.equal(buf.toString('ascii', 8, 12), 'WEBP');
    assert.equal(buf.toString('ascii', 12, 16), 'VP8X');
    assert.equal(buf.readUIntLE(24, 3) + 1, 1024);
    assert.equal(buf.readUIntLE(27, 3) + 1, 1024);
    assert.ok((buf[20] & 16) !== 0, item.path + ' lost alpha flag');
    assert.equal(buf.length, item.bytes);
    assert.equal(createHash('sha256').update(buf).digest('hex'), item.sha256);
    const blob = createHash('sha1')
      .update(Buffer.from('blob ' + buf.length))
      .update(Buffer.from([0]))
      .update(buf).digest('hex');
    assert.equal(blob, item.gitBlobSha, item.path);
    assert.notEqual(
      createHash('sha256').update(raw(item.source)).digest('hex'),
      item.sha256,
      'new asset must differ from v2 candidate',
    );
  }
  assert.ok(raw(v4.contactSheet).length > 50_000, 'missing overview sheet');
});
