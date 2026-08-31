import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const placePath = 'data/places/politikk/oslo/places_politikk/regjeringskvartalet.json';
const placeBuffer = fs.readFileSync(placePath);
const place = JSON.parse(placeBuffer.toString('utf8'));
const context = readJson('data/quiz/production_context/politikk/regjeringskvartalet.json');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const data = place.for_na;

test('Regjeringskvartalet har et komplett Før/etter-par med Johan Nygaardsvolds plass som felles anker', () => {
  assert.ok(data);
  assert.equal(data.title, 'Samme plass, nytt regjeringsanlegg');
  assert.match(data.beforeImageLabel, /Johan Nygaardsvolds plass.*1\. juli 2008/);
  assert.match(data.nowImageLabel, /Johan Nygaardsvolds plass.*13\. april 2026/);
  assert.match(data.before, /Høyblokka og Y-blokka/);
  assert.match(data.now, /A-blokka/);
  assert.match(data.change, /felles fysisk anker/);
  assert.match(data.change, /ikke identiske/);
  assert.match(data.change, /ikke hele Regjeringskvartalets transformasjon/);
  assert.equal(data.lookFor.length, 3);
  assert.ok(data.lookFor.some(item => /Høyblokkas/.test(item)));
  assert.ok(data.lookFor.some(item => /Y-blokka.*A-blokka/.test(item)));
});

test('Begge bilder har Commons-proveniens og synlig fotograf/lisens innenfor canonical for_na-kontrakt', () => {
  const images = [
    {
      url: data.beforeImage,
      label: data.beforeImageLabel,
      sourcePage: 'https://commons.wikimedia.org/wiki/File:Regjeringskvartalet_H-blokk_Johan_Nygaardsvolds_plass_Oslo_Norway_(2008.07.01).jpg',
      author: /Geir Hval/,
      date: /1\. juli 2008/
    },
    {
      url: data.nowImage,
      label: data.nowImageLabel,
      sourcePage: 'https://commons.wikimedia.org/wiki/File:Official_opening_Regjeringskvartalet_April_13th_2026.jpg',
      author: /Helge Høifødt/,
      date: /13\. april 2026/
    }
  ];

  assert.equal('beforeImageMeta' in data, false);
  assert.equal('nowImageMeta' in data, false);

  for (const image of images) {
    assert.ok(URL.canParse(image.url));
    assert.equal(new URL(image.url).protocol, 'https:');
    assert.equal(new URL(image.url).hostname, 'commons.wikimedia.org');
    assert.match(new URL(image.url).pathname, /Special:Redirect\/file\//);
    assert.match(image.label, image.author);
    assert.match(image.label, image.date);
    assert.match(image.label, /CC BY-SA 4\.0/);
    assert.ok(data.sources.includes(image.sourcePage));
  }

  assert.equal(data.sources.length, 4);
  assert.equal(new Set(data.sources).size, 4);
  assert.ok(data.sources.every(source => URL.canParse(source) && new URL(source).protocol === 'https:'));

  const licenseLink = place.externalLinks.find(link => link.url === 'https://creativecommons.org/licenses/by-sa/4.0/');
  assert.ok(licenseLink);
  assert.equal(licenseLink.label, 'Creative Commons – CC BY-SA 4.0-lisens');
  assert.equal(licenseLink.verifiedAt, '2026-08-02');
});

test('Før/etter-teksten bevarer bildets inferensgrense og juliåpningene eies ikke av nå-bildet', () => {
  assert.match(data.now, /ikke de senere åpningene av minnestedet 19\. juli/);
  assert.match(data.now, /22\. juli-senteret 22\. juli 2026/);
  assert.match(data.change, /forklarer heller ikke alene hvorfor enkelte bygg ble revet eller bevart/);
  assert.match(data.change, /hvilken samfunnseffekt/);
  assert.ok(!data.change.includes('beviser'));
  assert.ok(!data.change.includes('viser hele'));
});

test('Eksisterende popup-runtime viser bildeetikettene og løfter kilder/lisens til brukerrettede lenker', () => {
  assert.match(runtime, /safeHttpsUrl\(item\.url\)/);
  assert.match(runtime, /<strong>\$\{esc\(item\.label\)\}<\/strong>/);
  assert.match(runtime, /strings\(place\?\.for_na\?\.sources/);
  assert.match(runtime, /const configuredLinks = \[place, \.\.\.list\(articles\)\]/);
  assert.match(runtime, /type: "image_source", label: "Bilde- og sammenligningskilde"/);
  assert.match(runtime, /rel="noopener noreferrer"/);
});

test('Den deterministiske quiz-konteksten er synkronisert med canonical place-fil', () => {
  const target = context.source_files.target;
  assert.equal(target.path, placePath);
  assert.equal(target.bytes, placeBuffer.byteLength);
  assert.equal(target.sha256, createHash('sha256').update(placeBuffer).digest('hex'));
  assert.equal(target.bytes, 28118);
  assert.equal(target.sha256, '9e763ff92cf5d1bb9f1aff6e314389796c016078a4b189397336d219137c3514');
});

test('Fasekortet bevarer den godkjente Før/etter-fasen gjennom senere popupfaser', () => {
  assert.match(report, /\| 2 \| Kildebelagt chronology og Historie-fane \| \*\*GODKJENT – PR #4666, merge `ba71c8684a0b8f8eb5470ee9c256728122661c0f`\*\* \|/);
  assert.match(report, /\| Før\/etter \| PASS – fase 4 \|/);
  assert.match(report, /\| 4 \| Før\/etter \| \*\*GODKJENT – PR #4667, merge `dd31ba5d7852eba372c82477e9fc40a5f563b5ca`\*\* \|/);
  assert.match(report, /\| 12 \| Brands \| \*\*GODKJENT – PR #4673, merge `f4e078f06422747dd6f1ee34985d9c5752bcb3b6`\*\* \|/);
  assert.match(report, /\| 13 \| Badges, fagverk, alle åtte popupfaner, rundinger og full UI-\/produksjonsaudit \| \*\*(?:KLAR FOR REVIEW – FULL UI-\/PRODUKSJONSAUDIT PASS|GODKJENT – PR #[0-9]+, merge `[0-9a-f]{40}`)\*\* \|/);
});
