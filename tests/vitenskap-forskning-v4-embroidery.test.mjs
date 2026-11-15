import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const json = path => JSON.parse(read(path).toString('utf8'));
const v4 = json('data/badges/vitenskap_forskning_v4_embroidered_candidates_20261112.json');
const active = json('data/badges/vitenskap.json');
const fr3 = json('data/badges/vitenskap_forskning_fr_internal_labels_v3.json');
const other3 = json('data/badges/vitenskap_forskning_internal_locales_v3_20261112.json');
const originalNorwegian = json('data/badges/vitenskap_v2_candidates_20261112.json');
const expectedLocales = ['en', 'es', 'fr', 'pt'];

test('Research v4 preserves the active registry and all four v3 originals', () => {
  assert.equal(v4.categoryId, 'vitenskap');
  assert.equal(v4.subBadgeId, 'forskning_og_metode');
  assert.equal(v4.status, 'non_active_visual_revision_pending');
  assert.equal(v4.activeRegistryUnchanged, true);
  assert.equal(v4.sourcesV3Preserved, true);
  assert.equal(originalNorwegian.items.length, 5);
  assert.equal(active.sub.length, 16);
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  assert.equal(
    active.subBadgeImages.forskning_og_metode,
    'bilder/merker/vitenskap/brodert/forskning_og_metode.webp'
  );
  assert.equal(v4.items.length, 4);
  assert.deepEqual(v4.items.map(item => item.locale).sort(), expectedLocales);

  for (const item of v4.items) {
    const original = item.locale === 'fr'
      ? fr3
      : other3.items.find(candidate => candidate.locale === item.locale);
    assert.ok(original);
    assert.equal(item.source, original.path);
    assert.notEqual(item.path, item.source);
    assert.ok(item.path.startsWith('bilder/merker/vitenskap/kandidater/revisjoner/' + item.locale + '/'));
    assert.equal(item.status, 'non_active_embroidery_preview_pending_visual_review');
    assert.ok(!Object.values(active.subBadgeImages).includes(item.path));
    assert.ok(read(item.source).length > 100_000, item.source);
    assert.equal(item.metrics.sourceAlphaIdentical, true);
    assert.equal(item.metrics.centralArtworkBytePreservedBeforeEncoding, true);
    assert.ok(item.metrics.goldPixelsEnhanced > 1000);
    assert.ok(item.metrics.purpleFeltPixelsEnhanced > 1000);
    assert.ok(item.centerMeanCodecDifference < 6);
  }
});

test('All four transparent v4 WebP binaries match SHA256 and Git blob hash', () => {
  for (const item of v4.items) {
    const bytes = read(item.path);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.equal(bytes.toString('ascii', 12, 16), 'VP8X');
    assert.equal(bytes.readUIntLE(24, 3) + 1, 1024);
    assert.equal(bytes.readUIntLE(27, 3) + 1, 1024);
    assert.notEqual(bytes[20] & 16, 0);
    assert.equal(bytes.length, item.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256);
    const sha = createHash('sha1')
      .update(Buffer.from('blob ' + bytes.length))
      .update(Buffer.from([0]))
      .update(bytes).digest('hex');
    assert.equal(sha, item.gitBlobSha);
    assert.notEqual(createHash('sha256').update(read(item.source)).digest('hex'), item.sha256);
  }
});
