import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const json = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const hash = (algorithm, data) => createHash(algorithm).update(data).digest('hex');
const gitBlobSha = (data) => createHash('sha1').update(Buffer.concat([
  Buffer.from('blob ' + data.length), Buffer.from([0]), data
])).digest('hex');

test('Kunst: Street Art og Kunsthistorie v2 er aktive, med eksakte WebP-filer', () => {
  const kunst = json('data/badges/kunst.json');
  assert.equal(kunst.image, 'bilder/merker/kunst-brodert.webp');
  assert.deepEqual(Object.keys(kunst.subBadgeImages || {}).sort(), [...kunst.sub].sort());

  for (const id of ['street_art', 'kunsthistorie']) {
    const candidate = json('data/badges/kunst_' + id + '_v2_candidate_20261119.json');
    assert.equal(candidate.id, id);
    assert.equal(kunst.subBadgeImages[id], candidate.images.app.path);
    assert.equal(candidate.version, 'v2');
    assert.equal(candidate.status, 'active');
    assert.equal(candidate.quality.visualApprovedByUser, true);
    assert.equal(candidate.quality.active, true);
    assert.equal(candidate.quality.appAndMasterInRepository, true);
    assert.equal(candidate.highResolutionPngSource.repositoryUploaded, false);
    assert.equal(Object.keys(candidate.images).length, 2);
    for (const [kind, item] of Object.entries(candidate.images)) {
      const data = readFileSync(new URL(item.path, root));
      assert.equal(data.length, item.bytes, id + ' ' + kind + ' bytes');
      assert.equal(hash('sha256', data), item.sha256, id + ' ' + kind + ' SHA-256');
      assert.equal(gitBlobSha(data), item.gitBlobSha, id + ' ' + kind + ' Git SHA');
      assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF');
      assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP');
      assert.equal(item.alpha, true);
    }
  }
});
