import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const brands = readJson('data/brands/brands_master.json');
const brandsByPlace = readJson('data/brands/brands_by_place.json');
const place = readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
const brandRules = readJson('data/brands/brand_rules_v1_1.json');
const routing = readJson('data/badges/place_production_routing_v1.json');
const audit = readJson('reports/place-production/regjeringskvartalet-brands-v2.json');
const roundsContract = fs.readFileSync('data/places/README_place_rounds.md', 'utf8');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');

const expectedIds = [
  'statsbygg', 'koro', 'nordic_office_of_architecture', 'cowi', 'ramboll',
  'aas_jakobsen', 'asplan_viak', 'bjorbekk_lindheim', 'sla', 'veidekke',
  'hent', 'skanska', 'agaia', 'mebyr'
];
const byId = new Map(brands.map(brand => [brand.id, brand]));

test('Regjeringskvartalet har fjorten canonicale Brand-koblinger', () => {
  assert.deepEqual(brandsByPlace.regjeringskvartalet, expectedIds);
  assert.equal(new Set(expectedIds).size, 14);
  assert.equal(Object.hasOwn(place, 'brands'), false);
  assert.equal(Object.hasOwn(place, 'brand_ids'), false);
  for (const id of expectedIds) {
    const brand = byId.get(id);
    assert.ok(brand, id);
    assert.deepEqual(
      brand.place_ids,
      id === 'statsbygg' ? ['regjeringskvartalet', 'tullin', '22_juli_senteret'] : ['regjeringskvartalet']
    );
    assert.equal(brand.state, 'catalog');
    assert.equal(brand.verification, 'verified');
    assert.ok(brand.source_urls.length >= 2);
    assert.ok(brand.source_urls.every(url => url.startsWith('https://')));
    assert.match(brand.popupdesc, /Regjeringskvartal/i);
  }
});

test('Brand-settet dekker arkitektur, rådgivning, entreprise og offentlige aktørbrands', () => {
  const types = new Set(expectedIds.map(id => byId.get(id).brand_type));
  for (const type of [
    'architecture_brand', 'engineering_brand', 'consulting_brand',
    'landscape_architecture_brand', 'contractor_brand', 'public_builder', 'public_art'
  ]) assert.ok(types.has(type), type);
  assert.equal(brandRules.status, 'canonical_brand_definition');
  assert.match(brandRules.place_production_gate.na_rule, /Zero hits.*not evidence of N\/A/i);
});

test('Kandidatauditen dokumenterer både inkludering, holdback og logoavgjørelse', () => {
  assert.equal(audit.result, 'PASS');
  assert.equal(audit.included.length, 14);
  assert.equal(audit.held_back.length, 4);
  assert.deepEqual(audit.included.map(item => item.id), expectedIds);
  assert.ok(audit.included.every(item => item.score >= 8));
  assert.ok(audit.included.every(item => item.visual_decision === 'name_fallback_no_logo_copied'));
  for (const candidate of ['Team Urbis', 'departementene', 'arkitekter og kunstnere som personer', '22. juli-senteret']) {
    assert.ok(audit.held_back.some(item => item.candidate === candidate), candidate);
  }
  assert.match(audit.logo_policy, /Ingen logo er kopiert, generert eller rekonstruert/);
});

test('Politikk følger firefeltskontrakten med hendelser og vedtak som kategoriuttrykk', () => {
  assert.match(roundsContract, /\| `politikk` \| People · Objects · Brands · Productions \| \*\*Hendelser og vedtak\*\* \|/);
  assert.deepEqual(routing.badges.politikk.candidate_collections, [
    'people', 'objects', 'brands', 'productions'
  ]);
  assert.equal(routing.rules.full_place_collection_count, 4);
  assert.equal(routing.rules.related_is_placecard_collection, false);
  assert.match(roundsContract, /Related er ikke en PlaceCard-samling/);
});

test('Rapporten markerer Brands, Quiz og samlet sluttkontroll som ferdig', () => {
  assert.match(report, /\| Brands \| \*\*PASS – fase 15/);
  assert.match(report, /\| Quiz \| \*\*PASS – fase 14/);
  assert.match(report, /Status: \*\*PRODUKSJONSKLAR – fase 17 PASS/);
  assert.match(report, /\| 16 \| Ny samlet sluttkontroll på fersk `main` \| \*\*PASS/);
});
