import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const leksikonPath = 'data/leksikon/places/oslo/politikk/leksikon_oslo_tinghus.json';
const articles = readJson(leksikonPath);
const main = articles.find(article => article.id === 'tinghuset_hovedartikkel');
const languagePath = 'data/leksikon/sprak/places/europe/norway/oslo/tinghuset.json';
const language = readJson(languagePath);
const languageManifest = readJson('data/leksikon/sprak/manifest.json');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const styles = fs.readFileSync('css/place-popup-tabs.css', 'utf8');
const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');

test('Oslo tinghus has a small, canonical language glossary for More', () => {
  assert.equal(languageManifest.place_files.tinghuset, languagePath);
  assert.equal(language.place_id, 'tinghuset');
  assert.equal(language.source_checked_at, '2026-08-01');
  assert.deepEqual(language.entries.map(entry => entry.id), [
    'tinghuset_tinghus',
    'tinghuset_tingrett',
    'tinghuset_enedommersak',
    'tinghuset_meddomsrettssak',
    'tinghuset_offentlig_rettsmote'
  ]);
  assert.equal(new Set(language.entries.map(entry => entry.id)).size, 5);
});

test('Every glossary entry is place-linked, contextualized and source-backed', () => {
  for (const entry of language.entries) {
    assert.deepEqual(entry.linked_to, { kind: 'place', id: 'tinghuset' });
    assert.ok(entry.meaning.length >= 55);
    assert.ok(entry.context.length >= 60);
    assert.ok(entry.tags.length >= 3);
    assert.equal(entry.sources.length, 1);
    assert.ok(entry.sources[0].label.length >= 18);
    assert.match(entry.sources[0].url, /^https:\/\//);
  }
});

test('More interpretation separates observation, significance and limits', () => {
  assert.equal(main.version, 3);
  assert.equal(main.interpretation.what_to_notice.length, 3);
  assert.equal(main.interpretation.why_it_matters.length, 3);
  assert.equal(main.interpretation.counterpoints.length, 3);
  assert.equal(main.interpretation.source_checked_at, '2026-08-01');
  assert.equal(main.interpretation.sources.length, 5);
  assert.ok(main.interpretation.sources.every(source => source.startsWith('https://')));
  assert.match(main.interpretation.what_to_notice.join(' '), /tinghus.*bygningen.*tingrett.*domstolen/i);
  assert.match(main.interpretation.why_it_matters.join(' '), /Offentlige rettsmøter.*hovedregelen/);
  assert.match(main.interpretation.counterpoints.join(' '), /beviser ikke.*rettssikkerheten/i);
});

test('The More renderer shows glossary context and safe source links', () => {
  assert.match(runtime, /function languageCards\(items\)/);
  assert.match(runtime, /item\?\.context/);
  assert.match(runtime, /class="hg-place-more-source"/);
  assert.match(runtime, /target="_blank" rel="noopener noreferrer"/);
  assert.match(runtime, /section\("Språkleksikon", languageCards\(languageEntries\)\)/);
  assert.match(styles, /\.hg-place-tab-card \.hg-place-more-source/);
  assert.match(styles, /\.hg-place-language-card \.hg-place-language-context/);
});

test('All eight popup phases are complete without opening later sanitation work', () => {
  for (const [phase, number] of [
    ['Om', 1], ['Historie', 2], ['Fortellinger', 3], ['Før/etter', 4],
    ['Nyheter', 5], ['Lesespor', 6], ['Kilder', 7], ['Mer', 8]
  ]) assert.match(report, new RegExp(`\\| ${phase.replace('/', '\\/')} \\| PASS – fase ${number} \\|`));
  assert.match(report, /Knowledge er derfor ikke synkronisert ennå/);
  assert.match(report, /Status for samlet sted: \*\*under sanering – ikke produksjonsklart\*\*/);
});
