import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const leksikonPath = 'data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json';
const articles = readJson(leksikonPath);
const main = articles.find(article => article.id === 'regjeringskvartalet_hovedartikkel');
const languagePath = 'data/leksikon/sprak/places/europe/norway/oslo/regjeringskvartalet.json';
const language = readJson(languagePath);
const languageManifest = readJson('data/leksikon/sprak/manifest.json');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');

test('Regjeringskvartalet har et lite canonical Språkleksikon for Mer', () => {
  assert.equal(languageManifest.place_files.regjeringskvartalet, languagePath);
  assert.equal(language.place_id, 'regjeringskvartalet');
  assert.equal(language.source_checked_at, '2026-08-02');
  assert.deepEqual(language.entries.map(entry => entry.id), [
    'regjeringskvartalet_regjeringskvartal',
    'regjeringskvartalet_utovende_makt',
    'regjeringskvartalet_departement',
    'regjeringskvartalet_naturbetong',
    'regjeringskvartalet_perimetersikring'
  ]);
  assert.equal(new Set(language.entries.map(entry => entry.id)).size, 5);
});

test('Hvert oppslag er stedskoblet, kontekstualisert og kildebelagt', () => {
  for (const entry of language.entries) {
    assert.deepEqual(entry.linked_to, { kind: 'place', id: 'regjeringskvartalet' });
    assert.ok(entry.meaning.length >= 75);
    assert.ok(entry.context.length >= 90);
    assert.ok(entry.tags.length >= 3);
    assert.equal(entry.sources.length, 1);
    assert.ok(entry.sources[0].label.length >= 20);
    assert.match(entry.sources[0].url, /^https:\/\//);
  }
});

test('Mer-tolkningen skiller observasjon, betydning og inferensgrenser', () => {
  assert.equal(main.version, 3);
  assert.equal(main.interpretation.what_to_notice.length, 3);
  assert.equal(main.interpretation.why_it_matters.length, 3);
  assert.equal(main.interpretation.counterpoints.length, 3);
  assert.equal(main.interpretation.source_checked_at, '2026-08-02');
  assert.equal(main.interpretation.sources.length, 5);
  assert.ok(main.interpretation.sources.every(source => source.startsWith('https://')));
  assert.match(main.interpretation.what_to_notice.join(' '), /fysisk område.*institusjoner/i);
  assert.match(main.interpretation.why_it_matters.join(' '), /utøvende makten.*departementene/i);
  assert.match(main.interpretation.counterpoints.join(' '), /beviser ikke.*styringskvalitet/i);
});

test('Mer holder Knowledge, funfacts, relasjoner og Objects i sine canonicale eierflater', () => {
  for (const key of ['knowledge', 'funfacts', 'relations', 'artifacts', 'objects']) {
    assert.equal(Object.hasOwn(main, key), false, `uventet Mer-filler: ${key}`);
  }
  assert.match(report, /Knowledge i Mer er N\/A.*quizpakken/s);
  assert.match(report, /Funfacts er N\/A.*trivialisere/s);
  assert.match(report, /Curated relations er N\/A.*People-\/relasjonsdata/s);
  assert.match(report, /Artifacts\/Objects er N\/A.*fase 11/s);
});

test('Eksisterende Mer-renderer viser tolkning, Språkleksikon og sikre kildelenker', () => {
  assert.match(runtime, /function languageCards\(items\)/);
  assert.match(runtime, /item\?\.context/);
  assert.match(runtime, /class="hg-place-more-source"/);
  assert.match(runtime, /target="_blank" rel="noopener noreferrer"/);
  assert.match(runtime, /section\("Legg merke til"/);
  assert.match(runtime, /section\("Hvorfor det betyr noe"/);
  assert.match(runtime, /section\("Motpunkter"/);
  assert.match(runtime, /section\("Språkleksikon", languageCards\(languageEntries\)\)/);
});

test('Fasekortet lukker Kilder, åpner Mer og peker videre til Objects', () => {
  assert.match(report, /\| 7 \| Brukerrettede Kilder \| \*\*GODKJENT – PR #4670, merge `318119d72d63838d487bbaeec85bda2dd58209b1`\*\* \|/);
  assert.match(report, /\| Mer \| PASS – fase 8 \|/);
  assert.match(report, /\| 8 \| Mer \| \*\*GODKJENT – PR #4671, merge `5effd690c06502b68a5870ca2bc089459fac56b9`\*\* \|/);
  assert.match(report, /\| 12 \| Brands \| \*\*KLAR FOR REVIEW – N\/A MED EVIDENS\*\* \|/);
  assert.match(report, /ikke produksjonsklart/);
});
