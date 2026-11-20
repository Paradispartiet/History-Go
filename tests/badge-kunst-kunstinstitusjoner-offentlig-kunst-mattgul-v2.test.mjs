import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const json = p => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const sha256 = data => createHash('sha256').update(data).digest('hex');
const gitBlob = data => createHash('sha1').update(Buffer.concat([
  Buffer.from('blob ' + data.length), Buffer.from([0]), data
])).digest('hex');

test('Kunst: Kunstinstitusjoner og Offentlig kunst v2 are active with exact app/master WebP', () => {
  const kunst = json('data/badges/kunst.json');
  assert.equal(kunst.image, 'bilder/merker/kunst-brodert.webp');
  assert.deepEqual(Object.keys(kunst.subBadgeImages || {}).sort(), [...kunst.sub].sort());
  for (const id of ['kunstinstitusjoner', 'offentlig_kunst']) {
    const candidate = json('data/badges/kunst_' + id + '_v2_candidate_20261119.json');
    assert.equal(candidate.id, id);
    assert.equal(kunst.subBadgeImages[id], candidate.images.app.path);
    assert.equal(candidate.version, 'v2');
    assert.equal(candidate.status, 'active');
    assert.equal(candidate.quality.visualApprovedByUser, true);
    assert.equal(candidate.quality.active, true);
    assert.equal(candidate.quality.appAndMasterInRepository, true);
    assert.equal(candidate.highResolutionPngSource.repositoryUploaded, false);
    assert.deepEqual(Object.keys(candidate.images).sort(), ['app', 'master']);
    for (const [kind, file] of Object.entries(candidate.images)) {
      const bytes = readFileSync(new URL(file.path, root));
      assert.equal(bytes.length, file.bytes, id + ' ' + kind + ' bytes');
      assert.equal(sha256(bytes), file.sha256, id + ' ' + kind + ' SHA-256');
      assert.equal(gitBlob(bytes), file.gitBlobSha, id + ' ' + kind + ' Git SHA');
      assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
      assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
      assert.equal(file.alpha, true);
    }
  }
});
