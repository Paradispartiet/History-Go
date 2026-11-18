import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const readJson = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const approved = [
  { id: 'tegning_og_grafikk', manifest: 'data/badges/kunst_tegning_og_grafikk_v2_candidate_20261117.json' },
  { id: 'design_og_form', manifest: 'data/badges/kunst_design_og_form_v2_candidate_20261118.json' },
];
const hex = (data, algorithm) => createHash(algorithm).update(data).digest('hex');

test('Kunst: activate only two approved underbadges with byte-identical originals', () => {
  const category = readJson('data/badges/kunst.json');
  assert.equal(category.id, 'kunst');
  assert.equal(category.image, 'bilder/merker/kunst-brodert.webp');
  assert.equal(category.sub.length, 10);
  assert.deepEqual(Object.keys(category.subBadgeImages || {}).sort(), approved.map(x => x.id).sort());
  for (const { id, manifest } of approved) {
    const info = readJson(manifest);
    assert.equal(info.id, id);
    assert.equal(info.images.app.width, 1024);
    assert.equal(info.images.app.height, 1024);
    assert.equal(info.images.app.alpha, true);
    assert.equal(info.approval?.visualApproved === true || info.quality?.visualApprovedByUser === true, true);
    assert.equal(category.subBadgeImages[id], info.images.app.path);
    for (const [kind, expected] of Object.entries(info.images)) {
      if (!expected.path) continue; // A source render is not an active badge asset.
      const bytes = readFileSync(new URL(expected.path, root)); // Missing binary must fail.
      assert.equal(bytes.length, expected.bytes, id + ' ' + kind + ' byte count');
      assert.equal(hex(bytes, 'sha256'), expected.sha256, id + ' ' + kind + ' SHA-256');
      assert.equal(hex(Buffer.concat([Buffer.from('blob ' + bytes.length + '\0'), bytes]), 'sha1'),
        expected.gitBlobSha, id + ' ' + kind + ' Git blob');
    }
  }
});
