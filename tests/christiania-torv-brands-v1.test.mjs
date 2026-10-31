import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

const read = (p) => JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const master = read('data/brands/brands_master.json');
const catalog = read('data/brands/brands_catalog.json');
const byPlace = read('data/brands/brands_by_place.json');
const place = read('data/places/by/oslo/places/christiania_torv.json');
const attribution = read('data/brands/christiania_torv_asset_attributions.json');
const audit = read('reports/place-production/christiania-torv-brands-v1.json');
const ids = ['brasserie_hansken', 'kafe_celsius'];

test('Christiania Torv has two directly documented independent venue identities', () => {
  assert.deepEqual(byPlace.christiania_torv, ids);
  assert.equal(place.id, 'christiania_torv');
  assert.equal(place.lat, 59.9102351);
  assert.equal(place.lon, 10.7395879);
  assert.equal(new Set(byPlace.christiania_torv).size, 2);
  for (const id of ids) {
    const matches = master.filter(b => b.id === id);
    assert.equal(matches.length, 1, id);
    assert.equal(matches[0].state, 'catalog');
    assert.ok(matches[0].place_ids.includes('christiania_torv'));
    assert.ok(matches[0].source_urls.length >= 2);
    assert.equal(catalog.filter(b => b.id === id).length, 1);
  }
});

test('both brands have actual local WebP sign crops and exact media provenance', () => {
  assert.deepEqual(attribution.assets.map(a => a.brandId), ids);
  for (const id of ids) {
    const brand = master.find(b => b.id === id);
    const asset = attribution.assets.find(a => a.brandId === id);
    assert.equal(brand.logo, asset.path);
    assert.match(asset.path, /^bilder\/kort\/brands\/[a-z0-9_]+\.webp$/);
    assert.ok(existsSync(new URL('../' + asset.path, import.meta.url)));
    assert.ok(statSync(new URL('../' + asset.path, import.meta.url)).size > 3000);
    assert.equal(asset.noEndorsement, true);
    assert.equal(asset.generated, false);
    assert.equal(asset.reconstructed, false);
    assert.equal(asset.sourceForm, 'authentic_photographed_sign_wordmark');
    assert.ok(asset.sourcePage.startsWith('https://'));
    assert.ok(asset.sourceSha256.match(/^[a-f0-9]{64}$/));
    assert.equal(asset.reviewStatus, 'source_verified_visual_review_pending');
  }
  assert.equal(attribution.visualReviewPending, true);
});

test('legacy unaudited names remain excluded from the published square mapping', () => {
  const rejected = ['brasserie_france','filter_musikk','fjord_restaurant','pascal','skuld','statholdergaarden','stress','tom_wood'];
  for (const id of rejected) assert.ok(!byPlace.christiania_torv.includes(id));
  assert.equal(audit.publicationStatus, 'assets_generated_source_verified_visual_review_pending');
  assert.equal(audit.coverage.localAssetFiles, 2);
});
