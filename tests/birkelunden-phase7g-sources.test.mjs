import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));
const sha256 = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const place = readJson('data/places/by/oslo/places/birkelunden.json');
const production = readJson('data/places/production/birkelunden.json');
const article = readJson('data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json');
const runtime = read('js/ui/place-popup-tabs.js');
const audit = read('reports/place-production/birkelunden-phase7g-sources-audit-v1.md');
const workcard = read('reports/place-production/birkelunden-workcard-current.md');

assert.equal(article.place_id, 'birkelunden');
assert.equal(article.version, 3);
assert.equal(article.suppress_untitled_legacy_articles, true);
assert.deepEqual(article.wikiText, []);
assert.deepEqual(article.facts, []);
assert.deepEqual(article.chronology, []);

assert.ok(Array.isArray(article.externalLinks));
assert.equal(article.externalLinks.length, 7, '7G skal ha fem kjerne-evidenskilder og to navngitte Før/etter-bildekilder');
assert.equal(new Set(article.externalLinks.map(link => link.url)).size, 7, 'externalLinks skal være URL-deduplisert');
assert.ok(article.externalLinks.every(link => String(link.url || '').startsWith('https://')));
assert.ok(article.externalLinks.every(link => String(link.label || '').length >= 12));
assert.ok(!article.externalLinks.some(link => /audit|report|internal|production|claim.bank|source.pack/i.test(`${link.label} ${link.url}`)));

const configuredUrls = new Set(article.externalLinks.map(link => link.url));
const configuredLabels = new Set(article.externalLinks.map(link => link.label));
const safeMappings = new Map([
  ['Oslo kommune – Birkelunden', 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/birkelunden'],
  ['Oslo byleksikon – Birkelunden', 'https://oslobyleksikon.no/side/Birkelunden'],
  ['Riksantikvaren – Birkelunden, Murbyens hjerte', 'https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/'],
  ['Pensjonistforbundet – Vår historie', 'https://www.pensjonistforbundet.no/om-oss/var-historie'],
  ['OpenStreetMap way 3236549 – Birkelunden', 'https://www.openstreetmap.org/way/3236549']
]);

assert.equal(place.source_summary.safe_sources.length, 5);
for (const label of place.source_summary.safe_sources) {
  assert.ok(safeMappings.has(label), `safe source mangler eksplisitt URL-mapping: ${label}`);
  assert.ok(configuredUrls.has(safeMappings.get(label)), `safe source mangler klikkbar Kilder-lenke: ${label}`);
}

for (const url of place.for_na.sources) {
  assert.ok(configuredUrls.has(url), `Før/etter-kilde mangler meningsfull configured link: ${url}`);
}
for (const sourcePage of [place.for_na.beforeImageMeta.sourcePage, place.for_na.nowImageMeta.sourcePage]) {
  assert.ok(configuredUrls.has(sourcePage), `Før/etter-bildekilde mangler meningsfull configured link: ${sourcePage}`);
}

for (const label of [
  'Oslo Museum / Oslobilder – Birkelunden ca. 1930 (OB.Z02741)',
  'Wikimedia Commons – Birkelunden fontene og musikkpaviljong (2013)'
]) {
  assert.ok(configuredLabels.has(label), `mangler navngitt bildekilde: ${label}`);
}

assert.match(runtime, /const configuredLinks = \[place, \.\.\.list\(articles\)\]\.flatMap/);
assert.match(runtime, /const beforeAfterLinks = \[/);
assert.match(runtime, /uniqueBy\(\[\.\.\.configuredLinks, \.\.\.beforeAfterLinks\]\.filter\(link => link\.url\), link => link\.url\)/);
assert.ok(runtime.indexOf('...configuredLinks, ...beforeAfterLinks') >= 0, 'navngitte configuredLinks skal vinne før generiske Før/etter-lenker ved URL-deduplisering');

assert.equal(sha256(place.desc), production.textHashes.desc, '7G skal ikke endre fase-5 desc');
assert.equal(sha256(place.popupDesc), production.textHashes.popupDesc, '7G skal ikke endre fase-5 popupDesc');
assert.equal(place.spatial_profile.area_m2, 16300);

assert.match(audit, /syv dedupliserte HTTPS-lenker/i);
assert.match(audit, /ingen intern/i);
assert.match(audit, /OpenStreetMap/);
assert.match(audit, /Oslobilder/);
assert.match(audit, /Wikimedia Commons/);
assert.match(workcard, /## 7G – Kilder/);

console.log('Birkelunden phase 7G sources regression: PASS');
