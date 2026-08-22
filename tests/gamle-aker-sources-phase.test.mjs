import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const place = readJson('data/places/historie/oslo/places_historie/gamle_aker_kirke.json');
const staticLeksikon = fs.readFileSync('data/leksikon/places/oslo/historie/gamle_aker_kirke.html', 'utf8');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/gamle-aker-kirke-historie-v1.md', 'utf8');

test('Gamle Aker har en kuratert brukerrettet Kilder-flate', () => {
  assert.equal(place.id, 'gamle_aker_kirke');
  assert.equal(place.source_summary.safe_sources.length, 5);
  assert.equal(place.externalLinks.length, 7);
  assert.equal(new Set(place.externalLinks.map(link => link.url)).size, 7);
  assert.ok(place.externalLinks.every(link => link.label.length >= 30));
  assert.ok(place.externalLinks.every(link => URL.canParse(link.url) && new URL(link.url).protocol === 'https:'));
  assert.ok(place.externalLinks.every(link => link.lang === 'nb'));
  assert.ok(place.externalLinks.every(link => link.verifiedAt === '2026-08-22'));
});

test('Kildene dekker historie, dagens bruk, kulturminnevern, rehabilitering og bilder', () => {
  const types = new Set(place.externalLinks.map(link => link.type));
  for (const type of [
    'scholarly',
    'official',
    'heritage',
    'local_history',
    'current_project',
    'image_archive'
  ]) assert.ok(types.has(type), `mangler kildetype ${type}`);

  const urls = new Set(place.externalLinks.map(link => link.url));
  for (const url of [
    'https://snl.no/Gamle_Aker_kirke',
    'https://www.kirken.no/nn-NO/fellesrad/kirkeneioslo/menigheter/sthans/forsideoppslag/gamle-aker/',
    'https://riksantikvaren.no/eksempelsamling/energieffektivisering/gamle-aker-med-ny-energi/',
    'https://oslobyleksikon.no/side/Gamle_Aker_kirke',
    'https://www.kirken.no/sthans/rehabilitering',
    place.for_na.beforeImageMeta.sourcePage,
    place.for_na.nowImageMeta.sourcePage
  ]) assert.ok(urls.has(url), `mangler brukerrettet lenke ${url}`);
});

test('Interne produksjonsdata og uavklarte påstander holdes utenfor sikre kilder', () => {
  const safe = place.source_summary.safe_sources.join(' ').toLowerCase();
  assert.doesNotMatch(safe, /history go|quiz|story|wonderkammer|audit|report\/place-production|internal/);
  assert.equal(place.source_summary.hold_back_sources.length, 4);
  const holdBack = place.source_summary.hold_back_sources.join(' ');
  assert.match(holdBack, /eldre trekirke/);
  assert.match(holdBack, /Olav Kyrre/);
  assert.match(holdBack, /førkristent tingsted/);
  assert.match(holdBack, /1715.*1725/);
});

test('Statisk Leksikon-side viser den samme kontrollerte kildepakken', () => {
  const sourceSection = staticLeksikon.match(/<section aria-labelledby="kilder">[\s\S]*?<\/section>/)?.[0] ?? '';
  const hrefs = [...sourceSection.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(new Set(hrefs), new Set(place.externalLinks.map(link => link.url)));
  assert.match(sourceSection, /ulike årstall for Thomas Blix-inventaret/);
  assert.doesNotMatch(sourceSection, /Existing History Go|Wonderkammer|relations:|place data:/i);
});

test('Eksisterende runtime dedupliserer Kilder og åpner eksterne lenker sikkert', () => {
  assert.match(runtime, /includeProfileLabels \? uniqueBy\(strings\(sourceProfile\?\.safe_sources/);
  assert.match(runtime, /const configuredLinks = \[place, \.\.\.list\(articles\)\]/);
  assert.match(runtime, /const beforeAfterLinks = \[/);
  assert.match(runtime, /uniqueBy\(\[\.\.\.configuredLinks, \.\.\.beforeAfterLinks\]/);
  assert.match(runtime, /target="_blank" rel="noopener noreferrer"/);
});

test('Fasekortet lukker Kilder og åpner direktefanefasen', () => {
  assert.match(report, /\| 6 \| Lesespor \| \*\*GODKJENT – PR #4658, merge `c78cb05353bfb61eb68fef74ee9f115dfacc3a8b`\*\* \|/);
  assert.match(report, /\| Kilder \| PASS – fase 7 \|/);
  assert.match(report, /\| 7 \| Brukerrettede Kilder \| \*\*GODKJENT – PR #5184, merge `31af12e8852cca6d7c2da2ef2e5fdab480a287c2`\*\* \|/);
  assert.match(report, /\| 8 \| Mer \| \*\*GODKJENT – PR #5186, merge `3bc252d347b3dd8561155bdbd49c354378401767`\*\* \|/);
  assert.match(report, /\| 9 \| Quizåpning 2 × 7 og Knowledge \| \*\*KLAR FOR REVIEW – 3 × 7, KNOWLEDGE-LINKET\*\* \|/);
  assert.match(report, /Ingen ny hovedflate eller runtimevariant er innført/);
});
