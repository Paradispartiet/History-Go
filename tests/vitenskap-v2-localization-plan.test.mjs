import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL('../'+path, import.meta.url), 'utf8'));
const plan = read('data/badges/vitenskap_v2_localization_20261112.json');
const candidates = read('data/badges/vitenskap_v2_candidates_20261112.json');
const active = read('data/badges/vitenskap.json');
const audit = read('data/badges/vitenskap_legacy_illustration_review_20261112.json');

test('All five science v2 candidates have a complete localized text plan but remain inactive', () => {
  assert.equal(plan.categoryId, 'vitenskap');
  assert.equal(plan.status, 'translations_prepared_artwork_pending');
  assert.deepEqual(plan.languageOrder, ['nb', 'en', 'es', 'pt', 'fr']);
  assert.equal(plan.items.length, 5);
  assert.equal(active.sub.length, 16);
  assert.equal(Object.keys(active.subBadgeImages).length, 16);
  assert.equal(candidates.state, 'stored_candidate_not_active');
  const ids = new Set();
  for (const item of plan.items) {
    assert.ok(!ids.has(item.id), 'duplicate ID: '+item.id);
    ids.add(item.id);
    assert.ok(active.sub.includes(item.id), item.id);
    const original = candidates.items.find(candidate => candidate.id === item.id);
    assert.ok(original, item.id + ' has no original');
    assert.equal(item.sourceNorwegianCandidate.path, original.path);
    assert.equal(item.sourceNorwegianCandidate.gitBlobSha, original.gitBlobSha);
    assert.equal(item.activeNorwegianPath, active.subBadgeImages[item.id]);
    assert.notEqual(original.path, active.subBadgeImages[item.id]);
    assert.deepEqual(Object.keys(item.variants).sort(), [...plan.languageOrder].sort());
    assert.equal(item.variants.nb.path, original.path);
    assert.equal(item.variants.nb.gitBlobSha, original.gitBlobSha);
    for (const locale of plan.languageOrder) {
      const variant = item.variants[locale];
      assert.ok(variant.heading.length >= 10, locale+' '+item.id+' missing title');
      assert.ok(variant.footer.length >= 20, locale+' '+item.id+' missing complete footer');
      assert.equal(variant.footer, audit.footerTranslation[locale]);
      assert.ok(variant.visualReviewRequired);
      assert.doesNotMatch(variant.heading+' '+variant.footer, /\\b[0-9]+\\/[0-9]+\\b/);
      if (locale === 'nb') assert.equal(variant.status, 'candidate_verified_existing');
      else {
        assert.equal(variant.status, 'not_generated');
        assert.equal(variant.path, 'bilder/merker/vitenskap/locales/'+locale+'/'+item.id+'.webp');
        assert.equal('gitBlobSha' in variant, false, 'do not fabricate binary checksums');
      }
    }
  }
  assert.deepEqual([...ids].sort(), candidates.items.map(item=>item.id).sort());
});
