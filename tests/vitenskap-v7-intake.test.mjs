import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const bytes = path => readFileSync(new URL('../' + path, import.meta.url));
const read = path => bytes(path).toString('utf8');
const intake = JSON.parse(read('data/badges/vitenskap_v7_candidate_intake_20261113.json'));
const archived = JSON.parse(read('data/badges/vitenskap_v7_archived_candidates_20261113.json'));
const active = JSON.parse(read('data/badges/vitenskap.json'));
const sha256 = b => createHash('sha256').update(b).digest('hex');
const gitBlob = b => createHash('sha1')
  .update(Buffer.from('blob ' + b.length + String.fromCharCode(0)))
  .update(b).digest('hex');

test('v7 records exactly three real high-resolution, stored but inactive candidates', () => {
  assert.equal(intake.categoryId, 'vitenskap');
  assert.equal(intake.version, 'v7');
  assert.equal(intake.status, 'three_exact_v7_binary_candidates_archived_unapproved_nonactive');
  assert.equal(intake.binaryTransferCompleted, true);
  assert.equal(intake.actualStoredCount, 3);
  assert.equal(intake.activation, 'not_approved_not_active');
  assert.equal(intake.doNotChangeActiveRegistry, true);
  assert.equal(intake.requiredFooter, 'VITENSKAP & TEKNOLOGI');
  assert.equal(intake.expected.length, 3);
  assert.equal(archived.status, 'three_exact_v7_binary_candidate_artworks_archived_not_active');
  assert.equal(archived.visualSignoffRequired, true);
  assert.equal(archived.activationRequiresSeparatePR, true);
  assert.equal(archived.activeRegisterUnchanged, true);
  assert.equal(archived.norwegianApprovedOriginalsPreserved, true);
  assert.equal(archived.itemCount, 3);
  assert.equal(archived.items.length, 3);
  assert.deepEqual(new Set(intake.expected.map(x => x.id)), new Set([
    'teknologi_og_ingeniorfag',
    'data_programvare_og_algoritmer',
    'nettverk_og_digital_infrastruktur'
  ]));
  const archiveItems = new Map(archived.items.map(x => [x.id, x]));
  assert.equal(archiveItems.size, 3);
  for (const item of intake.expected) {
    assert.equal(item.file, item.id + '-v7-brodert-kandidat.webp');
    assert.ok(/^[a-f0-9]{64}$/.test(item.sha256));
    assert.ok(/^[a-f0-9]{40}$/.test(item.gitBlobSha));
    const entry = archiveItems.get(item.id);
    assert.ok(entry, 'archive record missing: ' + item.id);
    const path = 'bilder/merker/vitenskap/kandidater/revisjoner/nb/' +
      item.id + '-v7-brodert.webp';
    assert.equal(entry.path, path);
    assert.equal(entry.status, 'stored_unapproved_nonactive');
    assert.equal(entry.visualSignoffRequired, true);
    assert.equal(entry.sha256, item.sha256);
    assert.equal(entry.gitBlobSha, item.gitBlobSha);
    assert.equal(entry.bytes, item.bytes);
    const data = bytes(path);
    assert.equal(data.length, item.bytes);
    assert.equal(sha256(data), item.sha256);
    assert.equal(gitBlob(data), item.gitBlobSha);
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    assert.equal(data.toString('ascii', 12, 16), 'VP8X');
    assert.notEqual(data[20] & 16, 0, 'transparent alpha channel required');
    assert.equal(data.readUIntLE(24, 3) + 1, 1024);
    assert.equal(data.readUIntLE(27, 3) + 1, 1024);
    assert.ok(!Object.values(active.subBadgeImages).includes(path));
  }
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  assert.ok(Object.values(active.subBadgeImages).every(x =>
    x.startsWith('bilder/merker/vitenskap/brodert/') && !x.includes('v7')));
});

test('idempotent importer verifies exact bytes and never overwrites approved art', () => {
  const script = read('scripts/import-vitenskap-v7-candidates.py');
  assert.match(script, /def verify_archived/);
  assert.match(script, /digest\(data\) == expected/);
  assert.match(script, /im\.mode == "RGBA"/);
  assert.match(script, /im\.size == \(1024, 1024\)/);
  assert.match(script, /refusing|Refusing/);
  assert.match(script, /original_catalog_bytes/);
  assert.match(script, /activationRequiresSeparatePR/);
  assert.match(script, /if ARCHIVE\.exists\(\):/);
  assert.ok(!script.includes('data/badges/vitenskap.json", "w"'));
});
