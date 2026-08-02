import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const brands = readJson('data/brands/brands_master.json');
const brandsByPlace = readJson('data/brands/brands_by_place.json');
const place = readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
const roundsContract = fs.readFileSync('data/places/README_place_rounds.md', 'utf8');
const standard = fs.readFileSync('docs/PLACE_STANDARD.md', 'utf8');
const runtime = fs.readFileSync('js/ui/place-rounds-visual-collections.js', 'utf8');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');

test('Canonical Brand-register har ingen Regjeringskvartalet-kandidat eller stedskobling', () => {
  assert.ok(Array.isArray(brands));
  assert.equal(Object.hasOwn(brandsByPlace, 'regjeringskvartalet'), false);
  assert.equal(brands.some(brand => {
    const value = JSON.stringify(brand).toLowerCase();
    return value.includes('regjeringskvartalet');
  }), false);
  assert.equal(Object.hasOwn(place, 'brands'), false);
  assert.equal(Object.hasOwn(place, 'brand_ids'), false);
});

test('N/A-vurderingen avviser institusjoner, prosjektaktører og personer som filler', () => {
  for (const candidate of [
    'Statsbygg', 'KORO', 'Statsministerens kontor', 'departementene',
    'Team Urbis', 'arkitektkontorer', 'entreprenører', 'kunstnere', 'Picasso'
  ]) assert.match(report, new RegExp(candidate, 'i'), candidate);
  assert.match(report, /Statsbygg er byggherre\/prosjektaktør, ikke et forbrukermerke/);
  assert.match(report, /KORO er statens fagorgan.*ikke et Brand/s);
  assert.match(report, /ingen tom `brands`-liste, lokal `brand_ids`-kuratering, ny master-record eller falsk logo/i);
});

test('N/A er kontraktsfestet som kontrollert fravær, ikke glemt innhold', () => {
  assert.match(roundsContract, /Brands betyr \*\*bedrifter og kjente merker med dokumentert stedskobling\*\*/);
  assert.match(standard, /Manglende relevant innhold kan være N\/A\. Glemt kontroll kan ikke være N\/A/);
  assert.match(report, /Brands er derfor \*\*N\/A med fanespesifikk begrunnelse og evidenspeker\*\*/);
  assert.match(report, /brands_master\.json.*brands_by_place\.json.*eksplisitt søkt/s);
});

test('Fast rundingsprofil beholdes selv om Brands er redaksjonelt N/A', () => {
  assert.match(roundsContract, /vanlig: people · objects · brands/);
  assert.match(runtime, /const GENERAL_ROUNDS = Object\.freeze\(\["people", "objects", "brands"\]\)/);
  assert.doesNotMatch(runtime, /regjeringskvartalet/);
});

test('Fasekortet lukker Objects, godkjenner Brands-N/A og åpner sluttfasen', () => {
  assert.match(report, /\| 11 \| Objects \| \*\*GODKJENT – PR #4672, merge `1b8b277cc70b4a26f332091194de667d1a32da53`\*\* \|/);
  assert.match(report, /\| Brands \| N\/A – fase 12 \|/);
  assert.match(report, /\| 12 \| Brands \| \*\*KLAR FOR REVIEW – N\/A MED EVIDENS\*\* \|/);
  assert.match(report, /\| 13 \| Badges, fagverk, alle åtte popupfaner, rundinger og full UI-\/produksjonsaudit \| \*\*NESTE AKTIVE FASE ETTER MERGE AV FASE 12\*\* \|/);
  assert.match(report, /ikke produksjonsklart/);
});

// Phase 13 bootstrap trigger; removed from the final diff.
