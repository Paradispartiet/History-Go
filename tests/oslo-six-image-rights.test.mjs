import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));

test('six-place image shortlist has four licensable subjects and two explicit no-image holds', () => {
  const pack = read('reports/place-production/oslo-six-image-rights-shortlist-20261022.json');
  const gates = read('reports/place-production/oslo-six-places-integration-gates-20261022.json');
  assert.equal(pack.status, 'SOURCE_PAGES_REVIEWED_12_CROPS_STAGED_NOT_REGISTERED');
  assert.equal(pack.places.length, 6);
  assert.deepEqual(pack.places.map(p => p.place_id), gates.places.map(p => p.place_id));
  const ready = pack.places.filter(p => p.lead_candidate !== null);
  assert.equal(ready.length, 4);
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
  assert.equal(ruins.status, 'NO_SAFE_PRIMARY_RUIN_IMAGE_APPROVED');
  assert.equal(tegl.status, 'HARD_HOLD_NO_BUILDING_IDENTITY_IMAGE');
  assert.equal(ruins.lead_candidate, null);
  assert.equal(tegl.lead_candidate, null);
  assert.match(ruins.alternates[0].reason_not_primary, /not surviving foundation/);
  assert.match(tegl.rejected_misidentification.reason, /DIFFERENT TEGLVERK/);
  assert.equal(gates.places.at(-1).geographical_anchor.status, 'HOLD');
  assert.ok(pack.requirements.some(x => x.includes('WebP')));
});
