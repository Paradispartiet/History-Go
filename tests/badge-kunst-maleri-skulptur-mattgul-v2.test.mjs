import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const base = new URL('../', import.meta.url);
const json = relative => JSON.parse(readFileSync(new URL(relative, base), 'utf8'));
const sha256 = data => createHash('sha256').update(data).digest('hex');
const blobSha = data => createHash('sha1')
  .update(Buffer.concat([Buffer.from('blob ' + data.length), Buffer.from([0]), data]))
  .digest('hex');

test('Kunst v2: matte-yellow Maleri and Skulptur stay candidates with byte-identical WebP assets', () => {
  const kunst = json('data/badges/kunst.json');
  assert.equal(kunst.image, 'bilder/merker/kunst-brodert.webp');
  assert.deepEqual(Object.keys(kunst.subBadgeImages || {}).sort(), ['design_og_form', 'tegning_og_grafikk']);
  for (const id of ['maleri', 'skulptur']) {
    const p = json('data/badges/kunst_' + id + '_v2_candidate_20261119.json');
    assert.equal(p.id, id);
    assert.equal(p.status, 'candidate_pending_visual_approval');
    assert.equal(p.quality.active, false);
    assert.equal(p.quality.visualApprovedByUser, false);
    assert.equal(p.highResolutionPngSource.repositoryUploaded, false);
    assert.equal(Object.keys(p.images).length, 2);
    for (const [kind, image] of Object.entries(p.images)) {
      const data = readFileSync(new URL(image.path, base));
      assert.equal(data.length, image.bytes, id + ' ' + kind + ' bytes');
      assert.equal(sha256(data), image.sha256, id + ' ' + kind + ' sha256');
      assert.equal(blobSha(data), image.gitBlobSha, id + ' ' + kind + ' git SHA');
      assert.equal(data.subarray(0, 4).toString('ascii'), 'RIFF');
      assert.equal(data.subarray(8, 12).toString('ascii'), 'WEBP');
    }
  }
});
