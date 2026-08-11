import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const place = readJson('data/places/politikk/oslo/places_politikk/tinghuset.json');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');

test('Oslo tinghus has a curated user-facing source surface', () => {
  assert.equal(place.id, 'tinghuset');
  assert.equal(place.source_summary.safe_sources.length, 7);
  assert.equal(place.externalLinks.length, 17);
  assert.equal(new Set(place.externalLinks.map(link => link.url)).size, 17);
  assert.ok(place.externalLinks.every(link => link.label.length >= 12));
  assert.ok(place.externalLinks.every(link => link.url.startsWith('https://')));
  assert.ok(place.externalLinks.every(link => link.lang === 'nb'));
  assert.ok(place.externalLinks.every(link => link.verifiedAt === '2026-08-01'));
});

test('Sources cover the institution, law, operation, history, case and images', () => {
  const types = new Set(place.externalLinks.map(link => link.type));
  for (const type of [
    'official',
    'law',
    'art_and_architecture',
    'annual_report',
    'local_history',
    'case_history',
    'case_analysis',
    'court_judgment',
    'public_inquiry',
    'image_archive'
  ]) assert.ok(types.has(type), `missing source type ${type}`);
});

test('Internal production material stays out of the safe source list', () => {
  const safe = place.source_summary.safe_sources.join(' ').toLowerCase();
  assert.doesNotMatch(safe, /audit|coordinate|quiz|claim|report\/place-production|internal/);
  assert.ok(place.source_summary.hold_back_sources.every(note => !place.externalLinks.some(link => link.label === note)));
});

test('The renderer deduplicates links and does not print raw before/after URLs as labels', () => {
  assert.match(runtime, /includeProfileLabels \? uniqueBy\(strings\(sourceProfile\?\.safe_sources/);
  assert.match(runtime, /const beforeAfterLinks = \[/);
  assert.match(runtime, /uniqueBy\(\[\.\.\.configuredLinks, \.\.\.beforeAfterLinks\]/);
  assert.doesNotMatch(runtime, /\.\.\.strings\(place\?\.for_na\?\.sources[\s\S]{0,160}value => value\);/);
  assert.match(runtime, /target="_blank" rel="noopener noreferrer"/);
});

test('The existing source profile is not rendered twice inside the Sources tab', () => {
  assert.match(runtime, /hasExistingSourceProfile = Boolean\(tabs\.panels\.sources\.querySelector\("\.hg-place-sources-section"\)\)/);
  assert.match(runtime, /renderSources\(place,\s*visibleArticles,\s*!hasExistingSourceProfile\)/);
});

test('Phase report keeps Sources complete when More is completed', () => {
  assert.match(report, /\| Kilder \| PASS – fase 7 \|/);
  assert.match(report, /\| Mer \| PASS – fase 8 \|/);
  assert.match(report, /Status for samlet sted: \*\*under sanering – ikke produksjonsklart\*\*/);
});
