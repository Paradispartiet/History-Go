import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const readJson = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const phase8c = readJson('reports/place-production/torggata-phase8c-brands-audit-v1.json');
const phase13 = readJson('reports/place-production/torggata-phase13-brands-audit-v1.json');
const byPlace = readJson('data/brands/brands_by_place.json');
const master = readJson('data/brands/brands_master.json');
const attributions = readJson('data/brands/brand_asset_attributions.json');
const visualContract = readFileSync(new URL('../docs/BRAND_ASSETS.md', import.meta.url), 'utf8');
const canonicalIds = byPlace.torggata ?? [];
const masterById = new Map(master.map((b) => [b.id, b]));
const attrById = new Map(attributions.assets.map((a) => [a.brandId, a]));
const allowedKinds = new Set(['logo','historic_wordmark','historic_brandmark']);

test('Torggata fase 13 beholder den kildebårne 8C-populasjonen uten drift', () => {
  assert.equal(phase8c.result, 'PASS');
  assert.deepEqual(canonicalIds, phase8c.final_mapping);
  assert.deepEqual(canonicalIds, phase13.brand_ids);
  assert.equal(canonicalIds.length, 13);
  assert.equal(new Set(canonicalIds).size, 13);
});

test('alle 13 canonical brands har lokal verifisert logo eller autentisk ordmerke', () => {
  for (const id of canonicalIds) {
    const brand = masterById.get(id);
    assert.ok(brand, `missing master record ${id}`);
    assert.equal(brand.state, 'catalog');
    assert.match(brand.logo, /^bilder\/kort\/brands\/[a-z0-9_]+\.webp$/);
    assert.ok(existsSync(new URL(`../${brand.logo}`, import.meta.url)), `missing local logo ${id}`);
    const a = attrById.get(id);
    assert.ok(a, `missing attribution ${id}`);
    assert.equal(a.path, brand.logo);
    assert.ok(allowedKinds.has(a.assetKind), `invalid asset kind ${id}`);
    assert.equal(a.reviewStatus, 'manually_approved');
    assert.equal(a.usageContext, 'referential_identification');
    assert.equal(a.noEndorsement, true);
    assert.equal(a.generated, false);
    assert.equal(a.reconstructed, false);
    assert.ok(a.sourcePage);
    assert.ok(a.rightsBasis);
  }
  assert.equal(attrById.size, 13);
  assert.deepEqual(attributions.coverage, { required:13, reviewed:13, missing:0, percent:100 });
});

test('fase 13 er GODKJENT først ved 13 av 13 visuell identitetsdekning', () => {
  assert.equal(phase13.status, 'GODKJENT');
  assert.equal(phase13.checks.approved, true);
  assert.equal(phase13.checks.canonicalMappingApproved, true);
  assert.equal(phase13.checks.logoCompletenessRequiredForCloseout, true);
  assert.equal(phase13.checks.logoCoverageIs100Percent, true);
  assert.equal(phase13.checks.noGeneratedOrReconstructedLogos, true);
  assert.equal(phase13.counts.requiredLogoOrWordmarkAssets, 13);
  assert.equal(phase13.counts.logoOrWordmarkAssets, 13);
  assert.equal(phase13.counts.missingLogoOrWordmarkAssets, 0);
  assert.equal(phase13.counts.logoCoveragePercent, 100);
});

test('canonical kontrakt låser 100 prosent og avviser fallback som closeout', () => {
  assert.match(visualContract, /logo completeness = 100 %/);
  assert.match(visualContract, /13 brands betyr 13 verifiserte logo-\/ordmerke-assets/);
  assert.match(visualContract, /navnefallback.*ikke/si);
});

test('Familien forblir holdback fremfor duplisert ANGST-entry', () => {
  assert.deepEqual(phase13.holdbacks.map((item) => item.brandId), ['familien']);
});
