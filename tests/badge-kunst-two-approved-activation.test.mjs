import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const readJson = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const approved = [
  {
    "id": "tegning_og_grafikk",
    "manifest": "data/badges/kunst_tegning_og_grafikk_v2_candidate_20261117.json"
  },
  {
    "id": "design_og_form",
    "manifest": "data/badges/kunst_design_og_form_v2_candidate_20261118.json"
  },
  {
    "id": "maleri",
    "manifest": "data/badges/kunst_maleri_v2_candidate_20261119.json"
  },
  {
    "id": "skulptur",
    "manifest": "data/badges/kunst_skulptur_v2_candidate_20261119.json"
  },
  {
    "id": "fotokunst",
    "manifest": "data/badges/kunst_fotokunst_v2_candidate_20261119.json"
  },
  {
    "id": "samtidskunst",
    "manifest": "data/badges/kunst_samtidskunst_v2_candidate_20261119.json"
  },
  {
    "id": "street_art",
    "manifest": "data/badges/kunst_street_art_v2_candidate_20261119.json"
  },
  {
    "id": "kunsthistorie",
    "manifest": "data/badges/kunst_kunsthistorie_v2_candidate_20261119.json"
  },
  {
    "id": "kunstinstitusjoner",
    "manifest": "data/badges/kunst_kunstinstitusjoner_v2_candidate_20261119.json"
  },
  {
    "id": "offentlig_kunst",
    "manifest": "data/badges/kunst_offentlig_kunst_v2_candidate_20261119.json"
  }
];
const hex = (data, algorithm) => createHash(algorithm).update(data).digest('hex');

test('Kunst: all ten visually approved underbadges are activated with exact image files', () => {
  const category = readJson('data/badges/kunst.json');
  assert.equal(category.id, 'kunst');
  assert.equal(category.image, 'bilder/merker/kunst-brodert.webp');
  assert.equal(category.sub.length, 10);
  assert.deepEqual(Object.keys(category.subBadgeImages || {}).sort(), category.sub.slice().sort());
  assert.deepEqual(approved.map(x => x.id).sort(), category.sub.slice().sort());
  for (const { id, manifest } of approved) {
    const info = readJson(manifest);
    assert.equal(info.id, id);
    assert.equal(info.images.app.width, 1024);
    assert.equal(info.images.app.height, 1024);
    if (info.images.app.alpha !== undefined) assert.equal(info.images.app.alpha, true);
    assert.equal(info.approval?.visualApproved === true || info.approval?.visualApprovedByUser === true || info.quality?.visualApprovedByUser === true, true, id + ' visual approval');
    assert.equal(category.subBadgeImages[id], info.images.app.path);
    for (const [kind, expected] of Object.entries(info.images)) {
      if (!expected.path) continue;
      const bytes = readFileSync(new URL(expected.path, root));
      assert.equal(bytes.length, expected.bytes, id + ' ' + kind + ' byte count');
      assert.equal(hex(bytes, 'sha256'), expected.sha256, id + ' ' + kind + ' SHA-256');
      assert.equal(hex(Buffer.concat([Buffer.from('blob ' + bytes.length + '\0'), bytes]), 'sha1'), expected.gitBlobSha, id + ' ' + kind + ' Git blob');
    }
  }
});
