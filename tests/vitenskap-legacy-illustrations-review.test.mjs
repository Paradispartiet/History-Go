import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const json = path => JSON.parse(read(path).toString('utf8'));
const registry = json('data/badges/vitenskap.json');
const audit = json('data/badges/vitenskap_legacy_illustration_review_20261112.json');

test('Vitenskap: alle 16 undermerker er aktive med ekte WebP-filer', () => {
  assert.equal(registry.id, 'vitenskap');
  assert.equal(registry.name, 'Vitenskap & teknologi');
  assert.equal(registry.color, '#6A5AE0');
  assert.equal(registry.image, audit.mainBadgePath);
  assert.equal(registry.sub.length, 16);
  assert.equal(Object.keys(registry.subBadgeImages).length, 16);
  for (const id of registry.sub) {
    const image = registry.subBadgeImages[id];
    assert.ok(image, id + ': manglende bildefilregistrering');
    assert.match(image, /^bilder\/merker\/vitenskap\/brodert\/[a-z_]+\.webp$/);
    const bytes = read(image);
    assert.ok(bytes.length > 3000, image + ': tom bildefil');
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  }
});

test('Vitenskap: sju eldre originaler bevares til en ferdig godkjent enkeltmerke-revisjon', () => {
  assert.equal(audit.categoryId, 'vitenskap');
  assert.equal(audit.activeSubbadges, 16);
  assert.equal(audit.reviewedOlderOriginals, 7);
  assert.equal(audit.items.length, 7);
  assert.deepEqual(audit.locales, ['nb','en','es','pt','fr']);
  assert.equal(audit.footerTranslation.nb, 'VITENSKAP & TEKNOLOGI');
  const names = new Set();
  for (const item of audit.items) {
    assert.ok(!names.has(item.id), item.id + ': duplicated');
    names.add(item.id);
    assert.ok(registry.sub.includes(item.id));
    assert.equal(item.bottomTextNB, audit.footerTranslation.nb);
    assert.ok(item.topTextNB.length > 5);
    assert.ok(item.newIllustrationMotif.length > 20);
    if (item.revisionStatus === 'awaiting_correct_single_badge_artwork') {
      assert.equal(registry.subBadgeImages[item.id], item.currentPath);
      const bytes = read(item.currentPath);
      const actual = createHash('sha1')
        .update(Buffer.from('blob ' + bytes.length + '\0')).update(bytes).digest('hex');
      assert.equal(actual, item.baselineGitBlobSha, item.id + ': original updated before approved revision');
    } else {
      // An intentionally revised badge requires a separately updated review contract.
      assert.fail(item.id + ': update the upgrade contract before changing the revision status');
    }
  }
});
