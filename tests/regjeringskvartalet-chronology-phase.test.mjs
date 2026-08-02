import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const leksikon = readJson('data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json');
const article = leksikon.find(entry => entry.id === 'regjeringskvartalet_hovedartikkel');
const stories = readJson('data/stories/stories_regjeringskvartalet.json');
const production = readJson('data/places/politikk-production/regjeringskvartalet.json');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');

test('Regjeringskvartalets hovedartikkel har tolv unike og kildebelagte chronology-punkter', () => {
  assert.ok(article);
  assert.equal(article.version, 2);
  assert.equal(article.chronology.length, 12);
  assert.equal(new Set(article.chronology.map(entry => entry.id)).size, 12);
  assert.deepEqual(
    article.chronology.map(entry => entry.id),
    [
      'chrono_rkv_1883',
      'chrono_rkv_1887_1891',
      'chrono_rkv_1906',
      'chrono_rkv_1939',
      'chrono_rkv_1946',
      'chrono_rkv_1958',
      'chrono_rkv_1969',
      'chrono_rkv_1978_2012',
      'chrono_rkv_2011',
      'chrono_rkv_2020_2021',
      'chrono_rkv_2026_04',
      'chrono_rkv_2026_07'
    ]
  );

  for (const entry of article.chronology) {
    assert.ok(Number.isInteger(entry.year));
    assert.ok(entry.period);
    assert.ok(entry.desc);
    assert.equal(entry.confidence, 'high');
    assert.ok(entry.sources.length >= 1);
    assert.ok(entry.sources.every(source => URL.canParse(source) && new URL(source).protocol === 'https:'));
  }
});

test('Kronologien dekker de manglende samlokaliseringsforsøkene og skiller åpningene i 2026', () => {
  const byId = new Map(article.chronology.map(entry => [entry.id, entry]));
  assert.match(byId.get('chrono_rkv_1883').desc, /Justisdepartementet/);
  assert.match(byId.get('chrono_rkv_1887_1891').period, /1887–1891/);
  assert.match(byId.get('chrono_rkv_1939').desc, /uten vinner/);
  assert.match(byId.get('chrono_rkv_1946').desc, /Erling Viksjø/);
  assert.match(byId.get('chrono_rkv_1978_2012').period, /1978–2012/);
  assert.match(byId.get('chrono_rkv_2020_2021').desc, /byggearbeidene starter i januar 2021/);
  assert.match(byId.get('chrono_rkv_2026_04').period, /13\. april/);
  assert.match(byId.get('chrono_rkv_2026_07').desc, /19\. juli.*22\. juli/);

  const officialCount = article.chronology.filter(entry =>
    entry.sources.some(source => new URL(source).hostname === 'www.regjeringen.no')
  ).length;
  assert.equal(officialCount, 12);
});

test('Chronology er korte hendelsesrecords og de tre narrative Stories er urørt som egen flate', () => {
  assert.equal(stories.length, 3);
  assert.deepEqual(
    stories.map(story => story.id),
    [
      'st_regjeringskvartalet_empire_til_regjering',
      'st_regjeringskvartalet_hoyblokka_kunsten',
      'st_regjeringskvartalet_terror_2011'
    ]
  );
  assert.ok(stories.every(story => story.quality_profile === 'episode_v1'));
  assert.ok(article.chronology.every(entry => !entry.desc.includes('\n')));
  assert.ok(article.chronology.every(entry => entry.desc.length < 240));
  assert.equal(production.chronologyStories.status, 'PASS');
  assert.equal(production.chronologyStories.chronologyReviewed, true);
  assert.equal(production.chronologyStories.storiesReviewed, true);
});

test('Fasekortet lukker Historie og åpner bare Før/etter som neste fase', () => {
  assert.match(report, /\| 0 \| Nullmåling, identitetsgate og saneringsplan \| \*\*GODKJENT – PR #4665, merge `c00d94430ea82da5afb4f0e1b10ead2b504f6ff8`\*\* \|/);
  assert.match(report, /\| Historie \| PASS – fase 2 \|/);
  assert.match(report, /\| 2 \| Kildebelagt chronology og Historie-fane \| \*\*KLAR FOR REVIEW\*\* \|/);
  assert.match(report, /\| 4 \| Før\/etter \| \*\*NESTE AKTIVE FASE ETTER MERGE AV FASE 2\*\* \|/);
  assert.match(report, /Chronology er utvidet fra seks til tolv unike, kildebelagte hendelser/);
  assert.match(report, /\| 13 \| Badges, fagverk, alle åtte popupfaner, rundinger og full UI-\/produksjonsaudit \| \*\*(?:KLAR FOR REVIEW – FULL UI-\/PRODUKSJONSAUDIT PASS|GODKJENT – PR #[0-9]+, merge `[0-9a-f]{40}`)\*\* \|/);
});
