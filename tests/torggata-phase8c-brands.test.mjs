import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const master = readJson('data/brands/brands_master.json');
const byPlace = readJson('data/brands/brands_by_place.json');
const rules = readJson('data/brands/brand_rules_v1_1.json');
const audit = readJson('reports/place-production/torggata-phase8c-brands-audit-v1.json');
const place = readJson('data/places/by/oslo/places/torggata.json');
const loader = fs.readFileSync('js/brands/brands_loader.js', 'utf8');
const placeCard = fs.readFileSync('js/ui/place-card.js', 'utf8');
const workcard = fs.readFileSync('reports/place-production/torggata-workcard-current.md', 'utf8');

const expected = [
  'angst', 'john_dee', 'eldorado_bokhandel', 'jernia_torggata',
  'oslo_sportslager', 'norli_eldorado', 'oslo_bar_bowling', 'oslo_street_food',
  'adelsten', 'ludvig_jensen_co', 'pm_jensen', 'karl_a_jensen_forretning',
  'ingwald_nielsen'
];
const removed = ['arakataka', 'big_dipper', 'justisen', 'the_villa', 'tilt'];
const byId = new Map(master.map(item => [item.id, item]));

test('Torggata 8C har bare reviderte canonical brand-mappinger', () => {
  assert.deepEqual(byPlace.torggata, expected);
  assert.equal(new Set(expected).size, expected.length);
  for (const id of removed) assert.equal(byPlace.torggata.includes(id), false, id);
  assert.equal(Object.hasOwn(place, 'brands'), false);
  assert.equal(Object.hasOwn(place, 'brand_ids'), false);
});

test('alle 8C-brands er catalog, kildebårne og temporalmerket', () => {
  for (const id of expected) {
    const brand = byId.get(id);
    assert.ok(brand, id);
    assert.equal(brand.state, 'catalog', id);
    assert.ok(['verified', 'verified_legacy'].includes(brand.verification), id);
    assert.equal(brand.verified_at, '2026-08-11', id);
    assert.ok(Array.isArray(brand.place_ids) && brand.place_ids.includes('torggata'), id);
    assert.ok(Array.isArray(brand.source_urls) && brand.source_urls.length >= 2, id);
    assert.ok(brand.source_urls.every(url => /^https:\/\//.test(url)), id);
    assert.match(brand.popupdesc, /Torggata/i, id);
    assert.ok(['active', 'dead'].includes(brand.status), id);
  }
});

test('historiske brands kan ikke presenteres som nåværende', () => {
  for (const id of ['eldorado_bokhandel', 'adelsten', 'ludvig_jensen_co', 'pm_jensen', 'karl_a_jensen_forretning', 'ingwald_nielsen']) {
    const brand = byId.get(id);
    assert.equal(brand.status, 'dead', id);
    assert.equal(brand.verification, 'verified_legacy', id);
  }
  assert.ok(byId.get('jernia_torggata').aliases.includes('Stensbak'));
  assert.ok(byId.get('adelsten').aliases.includes('Adelsten Jensen'));
});

test('audit dokumenterer kandidatfunn, holdback, logo og null kvote', () => {
  assert.equal(audit.result, 'PASS');
  assert.deepEqual(audit.final_mapping, expected);
  assert.deepEqual(audit.removed_legacy_mappings, removed);
  assert.equal(audit.included.length, expected.length);
  assert.ok(audit.included.every(item => item.score >= 8));
  assert.ok(audit.included.every(item => item.visual_decision === 'name_fallback_no_logo_copied'));
  for (const candidate of ['Arakataka', 'Big Dipper', 'Justisen', 'The Villa', 'Tilt', 'Rockefeller', 'Stensbak']) {
    assert.ok(audit.held_back.some(item => item.candidate.includes(candidate)), candidate);
  }
  assert.match(audit.logo_policy, /Ingen logo er kopiert, generert eller rekonstruert/);
  assert.match(audit.quota_policy, /Ingen antallskvote/);
});

test('brand-reglene og runtime bruker catalog-mappingen uten stedsspesifikk særkode', () => {
  assert.equal(rules.status, 'canonical_brand_definition');
  assert.match(rules.place_production_gate.na_rule, /Zero hits.*not evidence of N\/A/i);
  assert.match(loader, /BRANDS_BY_PLACE_PATH/);
  assert.match(loader, /filter\(item => item\.state === ["']catalog["']\)/);
  assert.match(loader, /window\.BRANDS_BY_PLACE = this\.byPlace/);
  assert.match(placeCard, /window\.BRANDS_BY_PLACE/);
  assert.match(placeCard, /window\.HGBrands\?\.getById/);
  assert.doesNotMatch(loader, /torggata/);
});

test('workcard beholder Brands som godkjent i sluttstatusen', () => {
  assert.match(workcard, /\| 13\. Brands \| \*\*GODKJENT\*\*/);
  assert.match(workcard, /13\/13 canonical brands/);
  assert.match(workcard, /\| 8\. PlaceCard-samlinger \| \*\*GODKJENT ETTER RE-QA\*\*/);
  assert.match(workcard, /Torggata = SLUTTGODKJENT FOR CLOSEOUT-MERGE/);
  assert.doesNotMatch(workcard, /\| 8\. Rundinger \| \*\*PÅGÅR – 8C Brands\*\*/);
});
