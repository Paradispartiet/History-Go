import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const brands = readJson('data/brands/brands_master.json');
const brandsByPlace = readJson('data/brands/brands_by_place.json');
const place = readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
const brandRules = readJson('data/brands/brand_rules_v1_1.json');
const roundsContract = fs.readFileSync('data/places/README_place_rounds.md', 'utf8');
const standard = fs.readFileSync('docs/PLACE_STANDARD.md', 'utf8');
const runtime = fs.readFileSync('js/ui/place-rounds-visual-collections.js', 'utf8');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');

test('Canonical Brand-register mangler foreløpig Regjeringskvartalet, men null treff beviser ikke N/A', () => {
  assert.ok(Array.isArray(brands));
  assert.equal(Object.hasOwn(brandsByPlace, 'regjeringskvartalet'), false);
  assert.equal(brands.some(brand => {
    const value = JSON.stringify(brand).toLowerCase();
    return value.includes('regjeringskvartalet');
  }), false);
  assert.equal(Object.hasOwn(place, 'brands'), false);
  assert.equal(Object.hasOwn(place, 'brand_ids'), false);
  assert.match(brandRules.place_production_gate.na_rule, /Zero hits.*not evidence of N\/A/i);
});

test('Canonical Brand-definisjon omfatter profesjonelle og arkitektoniske identiteter', () => {
  assert.equal(brandRules.status, 'canonical_brand_definition');
  assert.ok(brandRules.inclusion_rules.include.some(value => /architecture firms/i.test(value)));
  assert.ok(brands.some(brand => brand.brand_type === 'architecture_brand'));
  assert.ok(brands.some(brand => brand.brand_type === 'professional_brand'));
  assert.match(roundsContract, /profesjonelle firmaer, arkitektur- og ingeniørfirmaer/);
  assert.match(standard, /Brands-semantikken eies av `data\/brands\/brand_rules_v1_1\.json`/);
});

test('Den tidligere N/A-konklusjonen er eksplisitt underkjent og kandidatene er gjenåpnet', () => {
  assert.match(standard, /Manglende relevant innhold kan være N\/A\. Glemt kontroll kan ikke være N\/A/);
  assert.match(report, /N\/A-konklusjonen er \*\*underkjent\*\*/);
  for (const candidate of [
    'Team Urbis', 'Nordic Office of Architecture', 'COWI', 'Rambøll',
    'Aas-Jakobsen', 'Asplan Viak', 'Bjørbekk & Lindheim', 'SLA',
    'Veidekke', 'Hent', 'Skanska', 'Agaia', 'Mebyr'
  ]) assert.match(report, new RegExp(candidate, 'i'), candidate);
});

test('Fast rundingsprofil beholdes mens Brand-innholdet korrigeres', () => {
  assert.match(roundsContract, /vanlig: people · objects · brands/);
  assert.match(runtime, /const GENERAL_ROUNDS = Object\.freeze\(\["people", "objects", "brands"\]\)/);
  assert.doesNotMatch(runtime, /regjeringskvartalet/);
});

test('Fasehistorikken beholdes, men dagens status gjenåpner Brands og Quiz', () => {
  assert.match(report, /\| 11 \| Objects \| \*\*GODKJENT – PR #4672, merge `1b8b277cc70b4a26f332091194de667d1a32da53`\*\* \|/);
  assert.match(report, /\| 12 \| Brands \| \*\*GODKJENT – PR #4673, merge `f4e078f06422747dd6f1ee34985d9c5752bcb3b6`\*\* \|/);
  assert.match(report, /Status: \*\*korrigering pågår.*Quiz og Brands er gjenåpnet/s);
  assert.match(report, /Korrigert produksjonsmål: `major_10x7`/);
  assert.match(report, /ikke samlet produksjonsklart/);
});
