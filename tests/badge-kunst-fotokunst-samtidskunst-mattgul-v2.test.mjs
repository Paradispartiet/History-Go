import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const base = new URL('../', import.meta.url);
const readJSON = path => JSON.parse(readFileSync(new URL(path, base), 'utf8'));
const sha256 = data => createHash('sha256').update(data).digest('hex');
const blobSha = data => createHash('sha1')
  .update(Buffer.concat([Buffer.from('blob ' + data.length), Buffer.from([0]), data]))
  .digest('hex');

test('Kunst v2: Fotokunst and Samtidskunst remain unapproved candidates with verified WebPs', () => {
  const kunst = readJSON('data/badges/kunst.json');
  assert.equal(kunst.image, 'bilder/merker/kunst-brodert.webp');
  assert.deepEqual(Object.keys(kunst.subBadgeImages || {}).sort(), ['design_og_form', 'tegning_og_grafikk']);

  for (const id of ['fotokunst', 'samtidskunst']) {
    const candidate = readJSON('data/badges/kunst_' + id + '_v2_candidate_20261119.json');
    assert.equal(candidate.id, id);
    assert.equal(candidate.status, 'candidate_pending_visual_approval');
    assert.equal(candidate.quality.visualApprovedByUser, false);
    assert.equal(candidate.quality.active, false);
    assert.equal(candidate.highResolutionPngSource.repositoryUploaded, false);
    assert.deepEqual(Object.keys(candidate.images).sort(), ['app', 'master']);

    for (const [kind, image] of Object.entries(candidate.images)) {
      const bytes = readFileSync(new URL(image.path, base));
      assert.equal(bytes.length, image.bytes, id + ' ' + kind + ' size');
      assert.equal(sha256(bytes), image.sha256, id + ' ' + kind + ' sha256');
      assert.equal(blobSha(bytes), image.gitBlobSha, id + ' ' + kind + ' git sha');
      assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
      assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
    }
  }
});
