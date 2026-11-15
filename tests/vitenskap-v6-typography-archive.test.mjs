import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const bytes = path => readFileSync(new URL('../' + path, import.meta.url));
const json = path => JSON.parse(bytes(path).toString('utf8'));
const v6 = json('data/badges/vitenskap_v6_typography_candidates_20261113.json');
const v5 = json('data/badges/vitenskap_v5_candidates_20261112.json');
const localization = json('data/badges/vitenskap_v2_localization_20261112.json');
const active = json('data/badges/vitenskap.json');
const sha256 = b => createHash('sha256').update(b).digest('hex');
const gitBlob = b => createHash('sha1')
  .update(Buffer.from('blob ' + b.length + String.fromCharCode(0)))
  .update(b).digest('hex');

test('all 16 larger-heading v6 revisions are archived with exact Git blob and SHA256', () => {
  assert.equal(v6.categoryId, 'vitenskap');
  assert.equal(v6.status, '16_v6_typography_artworks_archived_unapproved_nonactive');
  assert.equal(v6.visualSignoffRequired, true);
  assert.equal(v6.noActiveBadgeChanged, true);
  assert.equal(v6.norwegianSourcesAndV5ArchivedOriginalsPreserved, true);
  assert.equal(v6.items.length, 16);
  const seen = new Set();
  for (const item of v6.items) {
    const key = item.id + '/' + item.locale;
    assert.ok(!seen.has(key), 'duplicate: ' + key);
    seen.add(key);
    assert.ok(['en','es','pt','fr'].includes(item.locale));
    assert.notEqual(item.id, 'matematikk');
    assert.equal(item.status, 'stored_v6_candidate_unapproved_nonactive');
    assert.equal(item.path,
      'bilder/merker/vitenskap/kandidater/revisjoner/' + item.locale + '/' + item.id + '-v6-two-line.webp');
    assert.ok(!Object.values(active.subBadgeImages).includes(item.path));
    const before = v5.items.find(x => x.id === item.id && x.locale === item.locale);
    assert.ok(before, 'missing v5 source: ' + key);
    assert.equal(item.source, before.path);
    assert.equal(item.sourceSHA256, before.sha256);
    assert.equal(sha256(bytes(before.path)), before.sha256);
    const names = localization.items.find(x => x.id === item.id);
    assert.ok(names);
    assert.equal(item.title, names.variants[item.locale].heading);
    assert.equal(item.footer, names.variants[item.locale].footer);
    assert.equal(item.split.join(' '), item.title);
    assert.ok(item.firstLineSize >= 45);
    assert.ok(item.secondLineSize >= 42);
    assert.equal(item.alphaBeforeEncodingIdentical, true);
    assert.equal(item.lowerArtBeforeEncodingIdentical, true);
    const data = bytes(item.path);
    assert.equal(data.length, item.bytes);
    assert.equal(sha256(data), item.sha256);
    assert.equal(gitBlob(data), item.gitBlobSha);
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    assert.equal(data.toString('ascii', 12, 16), 'VP8X');
    assert.equal(data.readUIntLE(24, 3) + 1, 1024);
    assert.equal(data.readUIntLE(27, 3) + 1, 1024);
    assert.notEqual(data[20] & 16, 0, 'missing alpha: ' + key);
  }
  assert.equal(seen.size, 16);
});

test('larger headings remain candidates; original active art and v6 contact sheet stay verifiable', () => {
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  assert.ok(Object.values(active.subBadgeImages).every(p => !p.includes('-v6-')));
  assert.ok(v6.completeParentCategoryNameInEachArtwork);
  const poster = bytes(v6.contactSheet);
  assert.equal(sha256(poster), v6.contactSheetIntegrity.sha256);
  assert.equal(gitBlob(poster), v6.contactSheetIntegrity.gitBlobSha);
  assert.equal(poster.length, v6.contactSheetIntegrity.bytes);
  assert.equal(poster[0], 0xff);
  assert.equal(poster[1], 0xd8);
});
