import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const place = readJson('data/places/historie/oslo/places_historie/gamle_aker_kirke.json');
const leksikon = fs.readFileSync('data/leksikon/places/oslo/historie/gamle_aker_kirke.html', 'utf8');
const report = fs.readFileSync('reports/place-production/gamle-aker-kirke-historie-v1.md', 'utf8');

test('Gamle Aker has a curated user-facing source surface', () => {
  assert.equal(place.id, 'gamle_aker_kirke');
  assert.equal(place.source_summary.safe_sources.length, 7);
  assert.equal(place.externalLinks.length, 7);
  assert.equal(new Set(place.externalLinks.map(link => link.url)).size, 7);
  assert.ok(place.externalLinks.every(link => link.label.length >= 12));
  assert.ok(place.externalLinks.every(link => link.url.startsWith('https://')));
  assert.ok(place.externalLinks.every(link => link.lang === 'nb'));
  assert.ok(place.externalLinks.every(link => link.verifiedAt === '2026-08-02'));
});

test('Sources cover history, current use, conservation and both image records', () => {
  const types = new Set(place.externalLinks.map(link => link.type));
  for (const type of [
    'scholarly',
    'official',
    'heritage',
    'local_history',
    'current_project',
    'image_archive'
  ]) assert.ok(types.has(type), `missing source type ${type}`);
});

test('Internal production material stays out of the user-facing source surface', () => {
  const labels = place.source_summary.safe_sources.join(' ').toLowerCase();
  assert.doesNotMatch(labels, /existing history go|quiz data|story data|internal|audit|production report/);
  assert.ok(place.source_summary.hold_back_sources.every(note => !place.externalLinks.some(link => link.label === note)));
  assert.doesNotMatch(leksikon, /Existing History Go/);
});

test('The leksikon Sources section exposes the same seven external URLs', () => {
  assert.match(leksikon, /<h2 id="kilder">Kilder<\/h2>/);
  for (const link of place.externalLinks) assert.match(leksikon, new RegExp(link.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('The phase report advances Lesespor and marks Sources complete', () => {
  assert.match(report, /\| Lesespor \| PASS – fase 6 \|/);
  assert.match(report, /\| Kilder \| PASS – fase 7 \|/);
  assert.match(report, /\| 6 \| Lesespor \| \*\*GODKJENT – PR #4658/);
  assert.match(report, /\| 7 \| Brukerrettede Kilder \| \*\*KLAR FOR REVIEW/);
});
