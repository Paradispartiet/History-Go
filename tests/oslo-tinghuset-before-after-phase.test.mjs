import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));

const placePath = 'data/places/politikk/oslo/places_politikk/tinghuset.json';
const place = readJson(placePath);
const data = place.for_na;
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const styles = fs.readFileSync('css/place-popup-tabs.css', 'utf8');
const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');

test('Oslo tinghus has a complete, place-specific before/after comparison', () => {
  assert.equal(place.id, 'tinghuset');
  assert.equal(data.title, 'Fra bygårder til tinghus');
  assert.match(data.before, /Rosenkrantz’ plass 4/);
  assert.match(data.before, /1938/);
  assert.match(data.now, /samme adresse/);
  assert.match(data.now, /1994/);
  assert.match(data.change, /flere lave by- og bakgårdsbygninger/);
  assert.match(data.change, /domstolskvartal/);
  assert.equal(data.lookFor.length, 3);
  assert.equal(data.sources.length, 5);
  assert.ok(data.sources.every(source => source.startsWith('https://')));
});

test('The historical and current images are local, distinct and rights-cleared', () => {
  assert.equal(data.beforeImageLabel, 'Rosenkrantz’ plass 4, september 1938');
  assert.equal(data.nowImageLabel, 'Oslo tinghus, 19. september 2022');
  assert.notEqual(data.beforeImage, data.nowImage);
  assert.ok(fs.existsSync(data.beforeImage));
  assert.ok(fs.existsSync(data.nowImage));
  assert.ok(fs.statSync(data.beforeImage).size > 250_000);
  assert.ok(fs.statSync(data.nowImage).size > 250_000);

  assert.equal(data.beforeImageMeta.license, 'CC BY 4.0');
  assert.equal(data.beforeImageMeta.credit, 'Ukjent fotograf / Oslo Museum, Byhistorisk samling');
  assert.match(data.beforeImageMeta.sourcePage, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.equal(data.beforeImageMeta.verified, true);

  assert.equal(data.nowImageMeta.license, 'CC BY-SA 4.0');
  assert.equal(data.nowImageMeta.credit, 'Ssu / Wikimedia Commons');
  assert.match(data.nowImageMeta.modifications, /Nedskalert.*uten beskjæring/);
  assert.match(data.nowImageMeta.sourcePage, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.equal(data.nowImageMeta.verified, true);
});

test('Before/after renderer exposes dates, attribution and image source', () => {
  assert.match(runtime, /beforeImageLabel/);
  assert.match(runtime, /beforeImageMeta/);
  assert.match(runtime, /item\.meta\?\.credit/);
  assert.match(runtime, /Bildekilde ↗/);
  assert.match(runtime, /rel="noopener noreferrer"/);
  assert.match(styles, /\.hg-place-before-after-media figcaption\{\s*display: grid;/);
  assert.match(styles, /\.hg-place-before-after-media figcaption a\{/);
});

test('Phase report marks only Before/after complete and keeps later phases open', () => {
  assert.match(report, /\| Før\/etter \| PASS – fase 4 \|/);
  assert.match(report, /\| Nyheter \| Ikke startet \|/);
  assert.match(report, /Status for samlet sted: \*\*under sanering – ikke produksjonsklart\*\*/);
});
