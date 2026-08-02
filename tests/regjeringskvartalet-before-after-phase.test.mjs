import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const place = readJson('data/places/politikk/oslo/places_politikk/regjeringskvartalet.json');
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

test('Begge bilder har verifisert Commons-proveniens, dato, fotograf og CC BY-SA 4.0', () => {
  const images = [
    {
      url: data.beforeImage,
      meta: data.beforeImageMeta,
      date: '2008-07-01',
      author: 'Geir Hval (www.MacWhale.eu)'
    },
    {
      url: data.nowImage,
      meta: data.nowImageMeta,
      date: '2026-04-13',
      author: 'Helge Høifødt'
    }
  ];

  for (const image of images) {
    assert.ok(URL.canParse(image.url));
    assert.equal(new URL(image.url).protocol, 'https:');
    assert.equal(new URL(image.url).hostname, 'commons.wikimedia.org');
    assert.match(new URL(image.url).pathname, /Special:Redirect\/file\//);
    assert.equal(image.meta.source, 'wikimedia_commons');
    assert.equal(image.meta.date, image.date);
    assert.equal(image.meta.author, image.author);
    assert.equal(image.meta.license, 'CC BY-SA 4.0');
    assert.equal(image.meta.licenseUrl, 'https://creativecommons.org/licenses/by-sa/4.0/');
    assert.equal(image.meta.verified, true);
    assert.equal(image.meta.verifiedAt, '2026-08-02');
    assert.ok(URL.canParse(image.meta.sourcePage));
    assert.equal(new URL(image.meta.sourcePage).hostname, 'commons.wikimedia.org');
    assert.match(image.meta.modifications, /ikke lokalt beskåret, oppskalert eller bearbeidet/);
  }

  assert.equal(data.sources.length, 4);
  assert.equal(new Set(data.sources).size, 4);
  assert.ok(data.sources.every(source => URL.canParse(source) && new URL(source).protocol === 'https:'));
});

test('Før/etter-teksten bevarer bildets inferensgrense og juliåpningene eies ikke av nå-bildet', () => {
  assert.match(data.now, /ikke de senere åpningene av minnestedet 19\. juli/);
  assert.match(data.now, /22\. juli-senteret 22\. juli 2026/);
  assert.match(data.change, /forklarer heller ikke alene hvorfor enkelte bygg ble revet eller bevart/);
  assert.match(data.change, /hvilken samfunnseffekt/);
  assert.ok(!data.change.includes('beviser'));
  assert.ok(!data.change.includes('viser hele'));
});

test('Eksisterende popup-runtime viser eksterne HTTPS-bilder med kreditering og kildelenke', () => {
  assert.match(runtime, /safeHttpsUrl\(item\.url\)/);
  assert.match(runtime, /item\.meta\?\.credit \|\| item\.meta\?\.author/);
  assert.match(runtime, /item\.meta\?\.license/);
  assert.match(runtime, /Bildekilde ↗/);
  assert.match(runtime, /rel="noopener noreferrer"/);
});

test('Fasekortet lukker chronology, åpner Før/etter for review og peker bare videre til Nyheter', () => {
  assert.match(report, /\| 2 \| Kildebelagt chronology og Historie-fane \| \*\*GODKJENT – PR #4666, merge `ba71c8684a0b8f8eb5470ee9c256728122661c0f`\*\* \|/);
  assert.match(report, /\| Før\/etter \| PASS – fase 4 \|/);
  assert.match(report, /\| 4 \| Før\/etter \| \*\*KLAR FOR REVIEW\*\* \|/);
  assert.match(report, /\| 5 \| Nyheter \| \*\*NESTE AKTIVE FASE ETTER MERGE AV FASE 4\*\* \|/);
  assert.match(report, /ikke produksjonsklart/);
});
