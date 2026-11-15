import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const file = path => readFileSync(new URL('../' + path, import.meta.url));
const json = path => JSON.parse(file(path).toString('utf8'));
const v5 = json('data/badges/vitenskap_v5_candidates_20261112.json');
const v4 = json('data/badges/vitenskap_v4_remaining_four_locales_20261112.json');
const research = json('data/badges/vitenskap_forskning_v4_embroidered_candidates_20261112.json');
const active = json('data/badges/vitenskap.json');
const expectedIds = [
  'informasjonsteknologi', 'matematikk', 'forskning_og_metode',
  'astronomi_og_fysikk', 'kjemi_og_materialvitenskap',
];
const expectedLocales = ['en', 'es', 'pt', 'fr'];
const hash = (alg, bytes) => createHash(alg).update(bytes).digest('hex');
const gitBlob = bytes => hash('sha1',
  Buffer.concat([Buffer.from('blob ' + bytes.length + String.fromCharCode(0)), bytes]));

test('All 20 archived v5 science badges have exact binary checksums and retain original v4 sources', () => {
  assert.equal(v5.categoryId, 'vitenskap');
  assert.equal(v5.status, 'twenty_v5_candidates_stored_not_approved_or_active');
  assert.equal(v5.sourceCandidateCount, 20);
  assert.equal(v5.items.length, 20);
  assert.equal(v5.visualSignoffRequired, true);
  assert.equal(v5.requiresExplicitActivationPR, true);
  assert.equal(v5.activeRegistryUnchanged, true);
  assert.equal(v5.norwegianOriginalsAndV4CandidatesPreserved, true);
  const originals = [...v4.items, ...research.items.map(item => ({...item, id:'forskning_og_metode'}))];
  assert.equal(originals.length, 20);
  const keys = new Set();
  for (const record of v5.items) {
    assert.ok(expectedIds.includes(record.id));
    assert.ok(expectedLocales.includes(record.locale));
    const key = record.id + '/' + record.locale;
    assert.ok(!keys.has(key), 'duplicate ' + key);
    keys.add(key);
    assert.equal(record.status, 'stored_v5_candidate_not_active_or_approved');
    assert.equal(record.path, 'bilder/merker/vitenskap/kandidater/revisjoner/'
      + record.locale + '/' + record.id + '-v5-broderi.webp');
    const previous = originals.find(item => item.id === record.id && item.locale === record.locale);
    assert.ok(previous, 'missing v4 origin for ' + key);
    assert.equal(record.source, previous.path);
    assert.equal(record.sourceGitBlobSha, previous.gitBlobSha);
    const bytes = file(record.path);
    const originalBytes = file(record.source);
    assert.equal(gitBlob(originalBytes), previous.gitBlobSha);
    assert.equal(bytes.length, record.bytes);
    assert.equal(hash('sha256', bytes), record.sha256);
    assert.equal(gitBlob(bytes), record.gitBlobSha);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.equal(bytes.toString('ascii', 12, 16), 'VP8X');
    assert.equal(bytes.readUIntLE(24, 3) + 1, 1024);
    assert.equal(bytes.readUIntLE(27, 3) + 1, 1024);
    assert.ok((bytes[20] & 16) !== 0, 'alpha missing: ' + key);
    assert.equal(record.metrics.outsideBandChangesBeforeEncoding, 0);
    assert.equal(record.metrics.sourceAlphaIdentical, true);
    assert.equal(record.metrics.centralArtworkIdenticalBeforeEncoding, true);
    assert.ok(record.centerMeanCodecDifference < 6);
    assert.ok(record.metrics.modifiedPixelsInBands > 10000);
    assert.ok(!Object.values(active.subBadgeImages).includes(record.path));
  }
  assert.equal(keys.size, 20);
});

test('Science v5 mobile review gallery has exact provenance and remains non-active', () => {
  assert.deepEqual(v5.mobileSizesReviewed, [96, 160]);
  const bytes = file(v5.mobileGallery);
  assert.equal(bytes.length, v5.mobileGalleryIntegrity.bytes);
  assert.equal(hash('sha256', bytes), v5.mobileGalleryIntegrity.sha256);
  assert.equal(gitBlob(bytes), v5.mobileGalleryIntegrity.gitBlobSha);
  assert.equal(bytes[0], 0xff);
  assert.equal(bytes[1], 0xd8);
  assert.equal(active.sub.length, 16);
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  for (const [id, path] of Object.entries(active.subBadgeImages)) {
    assert.equal(path, 'bilder/merker/vitenskap/brodert/' + id + '.webp');
    assert.ok(!path.includes('-v5-'));
  }
  assert.equal(v5.mapUsesMainBadge, true);
  assert.equal(v5.placeCardUsesActiveUnderbadgeWithMainFallback, true);
});
