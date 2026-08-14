import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

const phase8c = readJson('reports/place-production/torggata-phase8c-brands-audit-v1.json');
const phase13 = readJson('reports/place-production/torggata-phase13-brands-audit-v1.json');
const byPlace = readJson('data/brands/brands_by_place.json');
const master = readJson('data/brands/brands_master.json');
const visualContract = readFileSync(new URL('../docs/BRAND_ASSETS.md', import.meta.url), 'utf8');

const placeId = 'torggata_oslo';
const canonicalIds = byPlace[placeId]?.brand_ids ?? [];
const masterIds = new Set(master.map((brand) => brand.id));

test('Torggata fase 13 beholder den kildebårne 8C-utvelgelsen uten drift', () => {
  assert.deepEqual(canonicalIds, phase8c.brand_ids);
  assert.deepEqual(canonicalIds, phase13.brand_ids);
  assert.equal(canonicalIds.length, 13);
  assert.equal(new Set(canonicalIds).size, canonicalIds.length);
});

test('alle 13 canonical Torggata-brands finnes fortsatt i masteren', () => {
  const missing = canonicalIds.filter((id) => !masterIds.has(id));
  assert.deepEqual(missing, []);
});

test('mappingen er godkjent, men fase 13 forblir åpen til logoporten er 13 av 13', () => {
  assert.equal(phase8c.checks.approved, true);
  assert.equal(phase8c.checks.all_brand_ids_in_master, true);
  assert.equal(phase8c.checks.all_have_source_refs, true);
  assert.equal(phase8c.checks.all_have_torggata_place_ref, true);
  assert.equal(phase8c.checks.brand_count_is_rule_driven_not_quota, true);
  assert.equal(phase13.checks.approved, false);
  assert.equal(phase13.checks.canonicalMappingApproved, true);
  assert.equal(phase13.checks.canonicalMatchesPhase8C, true);
  assert.equal(phase13.checks.allBrandIdsInMaster, true);
  assert.equal(phase13.checks.brandCountIsRuleDrivenNotQuota, true);
  assert.equal(phase13.checks.logoCompletenessRequiredForCloseout, true);
  assert.equal(phase13.checks.documentaryPhotoCountsAsLogo, false);
  assert.equal(phase13.checks.nameFallbackCountsAsLogo, false);
  assert.equal(phase13.checks.phaseMayCloseBefore13Of13LogoCoverage, false);
  assert.equal(phase13.counts.requiredLogoOrWordmarkAssets, 13);
  assert.equal(phase13.status, 'PÅGÅR');
});

test('den canonical visuelle kontrakten krever 100 prosent logo-/ordmerkedekning', () => {
  assert.match(visualContract, /logo completeness = 100 %/);
  assert.match(visualContract, /13 brands betyr 13 verifiserte logo-\/ordmerke-assets/);
  assert.match(visualContract, /Dokumentarfoto.*erstatter ikke logoporten/s);
  assert.match(visualContract, /Ingen fase-closeout med navnefallback/);
});

test('Familien forblir eksplisitt holdback fremfor en duplisert ANGST-entry', () => {
  assert.deepEqual(phase13.holdbacks.map((item) => item.brandId), ['familien']);
});
