import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));

const place = readJson('data/places/by/oslo/places/torggata.json');
const article = readJson('data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json');
const runtime = read('js/ui/place-popup-tabs.js');

assert.equal(article.place_id, 'torggata');
assert.equal(article.version, 5);
assert.ok(Array.isArray(article.externalLinks));
assert.equal(new Set(article.externalLinks.map(link => link.url)).size, article.externalLinks.length, 'Torggata-leksikonet skal ikke ha duplikate externalLinks-URL-er');
assert.ok(article.externalLinks.every(link => String(link.url || '').startsWith('https://')));
assert.ok(article.externalLinks.every(link => String(link.label || '').length >= 12));
assert.ok(!article.externalLinks.some(link => /audit|report|internal|production/i.test(`${link.label} ${link.url}`)));

const configuredLinks = [...(place.externalLinks || []), ...(article.externalLinks || [])];
const configuredUrls = new Set(configuredLinks.map(link => link.url));
const configuredLabels = new Set(configuredLinks.map(link => link.label));

const expectedSafeSourceUrls = new Map([
  ['Oslo byleksikon – Torggata', ['https://oslobyleksikon.no/side/Torggata', 'https://oslobyleksikon.no/index.php/Torggata']],
  ['Oslo byleksikon – Eldorado', ['https://oslobyleksikon.no/index.php?title=Eldorado']],
  ['Oslo byleksikon – Torggata bad', ['https://oslobyleksikon.no/index.php/Torggata_bad']],
  ['Store norske leksikon – lydfilm', ['https://snl.no/lydfilm']],
  ['Rockefeller – booking og utleie', ['https://www.rockefeller.no/booking-utleie']],
  ['Torggata Gateforening – Om Torggata', ['https://www.torggata.oslo.no/om-torggata/']],
  ['OpenStreetMap – navngitt Torggata-geometri', ['https://www.openstreetmap.org/way/467290774']]
]);

for (const label of place.source_summary.safe_sources) {
  assert.ok(expectedSafeSourceUrls.has(label), `mangler forventet URL-mapping for safe source: ${label}`);
  assert.ok(expectedSafeSourceUrls.get(label).some(url => configuredUrls.has(url)), `safe source mangler klikkbar HTTPS-lenke: ${label}`);
}

assert.ok(place.for_na.sources.every(sourceUrl => /^https:\/\//.test(sourceUrl)), 'Før/etter-kilder skal være HTTPS');
for (const sourcePage of [place.for_na.beforeImageMeta.sourcePage, place.for_na.nowImageMeta.sourcePage]) {
  assert.ok(place.for_na.sources.includes(sourcePage), `bildekilde mangler i canonical Før/etter-kilder: ${sourcePage}`);
}

for (const label of [
  'Oslo byleksikon – Eldorado',
  'Oslo byleksikon – Torggata bad',
  'Arkitektur skaper verdi – Torggata',
  'TØI – Konflikter mellom gående og syklende',
  'Wikimedia Commons – Torggata før ombyggingen (2009)',
  'Wikimedia Commons – Torggata etter ombyggingen (2017)'
]) {
  assert.ok(configuredLabels.has(label), `mangler navngitt Kilder-lenke: ${label}`);
}

assert.match(runtime, /const configuredLinks = \[place, \.\.\.list\(articles\)\]\.flatMap/);
assert.match(runtime, /const beforeAfterLinks = \[/);
assert.match(runtime, /uniqueBy\(\[\.\.\.configuredLinks, \.\.\.beforeAfterLinks\]\.filter\(link => link\.url\), link => link\.url\)/);
assert.ok(runtime.indexOf('...configuredLinks, ...beforeAfterLinks') >= 0, 'navngitte configuredLinks skal komme før generiske før/etter-lenker');

console.log('Torggata phase 7E sources regression: PASS');
