import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));
const sha256 = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const place = readJson('data/places/by/oslo/places/birkelunden.json');
const production = readJson('data/places/production/birkelunden.json');
const manifest = readJson('data/leksikon/manifest.json');
const popupRuntime = read('js/ui/place-popup-v2.js');
const tabsRuntime = read('js/ui/place-popup-tabs.js');

assert.equal(place.id, 'birkelunden');
assert.equal(place.spatial_profile.area_m2, 16300, 'Om skal bruke det offisielle parkarealet 16,3 daa');
assert.equal(place.spatial_profile.place_form, 'offentlig_park');
assert.ok(place.spatial_profile.canonical_scope.includes('16,3 dekar'));
assert.ok(place.spatial_profile.canonical_scope.includes('116 dekar'));

assert.equal(sha256(place.desc), production.textHashes.desc, 'fase-5 desc/hash må være urørt');
assert.equal(sha256(place.popupDesc), production.textHashes.popupDesc, 'fase-5 popupDesc/hash må være urørt');
assert.equal(production.status, 'ready_v4_2');

const nature = place.nature_profile;
assert.equal(nature.review_status, 'source_audited_visible_layer');
assert.equal(nature.verified_at, '2026-08-23');
assert.match(nature.summary, /autentiske bjørkelunder/i);
assert.match(nature.summary, /140 år/i);
assert.match(nature.summary, /1984–86/);
assert.doesNotMatch(nature.summary, /pollinator/i, 'udokumentert pollinatorpåstand skal ikke rendres i Om');
assert.doesNotMatch(nature.summary, /mildere lokalklima/i, 'udokumentert lokalklimapåstand skal ikke rendres i Om');
assert.doesNotMatch(nature.summary, /leveområde/i, 'udokumentert habitatpåstand skal ikke rendres i Om');
assert.ok(Array.isArray(nature.sources) && nature.sources.length >= 2, 'synlig Nature-lag må ha inspectable kilder');
for (const source of nature.sources) {
  assert.match(String(source.url || ''), /^https:\/\//, 'Nature-kilder må være inspectable HTTPS');
}

const canonicalLeksikonPath = 'data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json';
assert.ok(manifest.files.includes(canonicalLeksikonPath), 'canonical Birkelunden Leksikon-owner må være manifest-loadet');
const canonicalArticle = readJson(canonicalLeksikonPath);
assert.equal(canonicalArticle.place_id, 'birkelunden');
assert.equal(canonicalArticle.title, 'Birkelunden');
assert.equal(canonicalArticle.type, 'main');
assert.equal(canonicalArticle.suppress_untitled_legacy_articles, true);
assert.deepEqual(canonicalArticle.wikiText, [], 'Leksikon-owner skal ikke duplisere canonical Om-artikkel');
assert.deepEqual(canonicalArticle.facts, [], 'Leksikon-owner skal ikke injisere parallelle facts i Om');
assert.deepEqual(canonicalArticle.chronology, [], 'Leksikon-owner skal ikke injisere parallell chronology i Historie');
assert.ok(canonicalArticle.sources.length >= 2);

const ownedArticles = [];
for (const file of manifest.files || []) {
  if (!fs.existsSync(file)) continue;
  const value = readJson(file);
  const rows = Array.isArray(value) ? value : [value];
  for (const row of rows) {
    if (String(row?.place_id || row?.placeId || '') === 'birkelunden') ownedArticles.push({ file, row });
  }
}
const main = ownedArticles.find(({ row }) => String(row?.title || row?.name || '').trim().toLowerCase() === 'birkelunden');
assert.ok(main, 'Birkelunden må ha en navngitt Leksikon main-owner');
assert.equal(main.file, canonicalLeksikonPath);
const visibleArticles = main.row.suppress_untitled_legacy_articles === true
  ? ownedArticles.filter(({ row }) => row === main.row || Boolean(String(row?.title || row?.name || row?.label || '').trim()))
  : ownedArticles;
assert.ok(visibleArticles.includes(main));
assert.equal(
  visibleArticles.some(({ row }) => row !== main.row && !String(row?.title || row?.name || row?.label || '').trim()),
  false,
  'untitled legacy Birkelunden-artikler skal ikke være popup-synlige'
);

assert.match(tabsRuntime, /suppress_untitled_legacy_articles/, 'popuphydratoren må respektere eksisterende legacy-suppression');
assert.match(tabsRuntime, /visibleArticlesForPopup\(articles, main\)/);
assert.match(popupRuntime, /function renderNatureLandscape\(place\)/, 'Nature-summary er en faktisk Om-flate og må derfor være source-auditert');
assert.match(popupRuntime, /formatArea\(profile\.area_m2 \|\| profile\.areaM2\)/, 'spatialrenderer må bruke area_m2');
assert.doesNotMatch(popupRuntime, /function renderTemporalSection\(/, '7A skal ikke lage en parallell temporalrenderer i Om');

console.log('Birkelunden phase 7A about regression: PASS');
