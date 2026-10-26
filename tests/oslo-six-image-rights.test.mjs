import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));

test('five correct licensed images found while Kristiania Teglverk remains without a safe photo', () => {
  const pack = read('reports/place-production/oslo-six-image-rights-shortlist-20261022.json');
  const gates = read('reports/place-production/oslo-six-places-integration-gates-20261022.json');
  assert.equal(pack.status, 'SOURCE_PAGES_REVIEWED_15_CROPS_STAGED_NOT_REGISTERED');
  assert.equal(pack.places.length, 6);
  assert.deepEqual(pack.places.map(p => p.place_id), gates.places.map(p => p.place_id));
  const ready = pack.places.filter(p => p.lead_candidate !== null);
  assert.equal(ready.length, 5);
  for (const p of ready) {
    const c = p.lead_candidate;
    assert.equal(p.status, 'LICENSE_PAGE_CHECKED_IMAGE_ASSETS_STAGED_NOT_BOUND');
    assert.equal(p.asset_paths.length, 3);
    assert.match(c.page, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(c.author.length > 1);
    assert.ok(['CC BY 2.5', 'CC BY 3.0', 'CC BY-SA 3.0', 'public_domain_dedication_by_author'].includes(c.license));
    assert.ok(c.original_dimensions.every(n => Number.isInteger(n) && n > 1500));
    assert.ok(c.subject.length > 30);
    assert.ok(c.next.includes('crop') || c.next.includes('composition') || c.next.includes('attribution'));
  }
  const ruins = pack.places.find(p => p.place_id === 'sarabraten');
  const tegl = pack.places.find(p => p.place_id === 'kristiania_teglverk_bryn');
  assert.equal(ruins.status, 'LICENSE_PAGE_CHECKED_IMAGE_ASSETS_STAGED_NOT_BOUND');
  assert.equal(ruins.asset_paths.length,3);
  assert.equal(tegl.status, 'HARD_HOLD_NO_BUILDING_IDENTITY_IMAGE');
  assert.equal(ruins.lead_candidate.author, 'Kjetil Ree');
  assert.match(ruins.lead_candidate.subject, /stein/);
  assert.equal(ruins.lead_candidate.license, 'CC BY-SA 3.0');
  assert.equal(tegl.lead_candidate, null);
  assert.equal(tegl.unapproved_identity_review_candidate.status,
    'LICENSE_CHECKED_PHOTOGRAPH_SITE_IDENTITY_NOT_YET_SIGNED_OFF');
  assert.equal(tegl.unapproved_identity_review_candidate.author, 'Roy Olsen');
  assert.equal(tegl.unapproved_identity_review_candidate.license, 'CC BY-SA 3.0');
  assert.equal(tegl.unapproved_identity_review_candidate.original_dimensions[0], 1920);
  assert.ok(tegl.unapproved_identity_review_candidate.not_cleared_for.includes('active_PlaceCard'));
  assert.ok(tegl.unapproved_identity_review_candidate.identity_note.includes('ring-kiln'));
  assert.match(ruins.alternates[0].reason_not_primary, /not surviving foundation/);
  assert.match(tegl.rejected_misidentification.reason, /DIFFERENT TEGLVERK/);
  assert.equal(gates.places.at(-1).geographical_anchor.status, 'HOLD');
  assert.ok(pack.completed_requirements.some(x => x.includes('WebP')));
  assert.ok(pack.requirements.some(x => x.includes('mobile/desktop')));
});
