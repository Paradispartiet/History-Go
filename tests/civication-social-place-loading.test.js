#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../js/Civication/systems/CivicationSocialPlaceResolver.js'), 'utf8');
const manifestPath = 'data/places/manifest.json';
const tick = () => new Promise(resolve => setImmediate(resolve));
function resolver(fetch, window = {}) {
  vm.runInNewContext(source, { window, fetch, console: { warn() {} } });
  return window.CivicationSocialPlaceResolver;
}
const response = data => ({ ok: true, json: async () => data });

(async () => {
  // Delay decoding as well as fetching: concurrent callers must wait for the
  // same complete source set, while at most six source requests are active.
  const files = Array.from({ length: 200 }, (_, i) => `places/source_${i}.json`);
  const rows = files.map((_, i) => ({ id: i < 2 ? 'shared' : `place_${i}`,
    name: `Source ${i}`, category: i % 2 ? 'sport' : 'by',
    quiz_profile: { place_type: i % 2 ? 'stadion' : 'park' }, lat: 59 + i / 1000, lon: 10 }));
  const calls = [];
  let active = 0, peak = 0, release;
  const gate = new Promise(resolve => { release = resolve; });
  const window = {};
  const api = resolver(async url => {
    calls.push(url);
    if (url === manifestPath) return response({ files });
    if (url.includes('brands_by_place')) return response({});
    if (url.includes('brands_master')) return response([]);
    const i = files.indexOf(url.slice(5));
    assert(i >= 0, `Unexpected source URL: ${url}`);
    active++;
    peak = Math.max(peak, active);
    await gate;
    return { ok: true, json: async () => {
      // Complete out of order, including the two conflicting IDs.
      for (let n = 0; n < (6 - i % 6); n++) await tick();
      active--;
      return i % 2 ? { places: [rows[i]] } : [rows[i]];
    } };
  }, window);
  let secondDone = false;
  const first = api.loadPlaces();
  const second = api.loadPlaces().then(value => { secondDone = true; return value; });
  const initialized = api.init();
  await tick();
  assert.equal(secondDone, false, 'A concurrent caller must not receive a placeholder cache');
  assert.equal(api.getPlaceById('shared'), null, 'No partial source index is published');
  assert.equal(calls.filter(url => url === manifestPath).length, 1);
  assert(peak > 1 && peak <= 6, `Source concurrency is ${peak}`);
  // An independently populated cache cannot bypass the already running load.
  window.PLACES = [{ id: 'late_cache', name: 'Late cache' }];
  const late = api.loadPlaces();
  release();
  const [a, b, init, c] = await Promise.all([first, second, initialized, late]);
  assert.strictEqual(a, b);
  assert.strictEqual(a, init.places);
  assert.strictEqual(a, c);
  assert.deepEqual(Array.from(a, row => row.id), rows.map(row => row.id));
  assert.equal(api.getPlaceById('shared').name, 'Source 0');
  assert.equal(api.getSocialPlaceByLocationId('place:place_2').socialPlaceType, 'park_public_space');
  assert.equal(api.getSocialPlaceByLocationId('place:place_3').socialPlaceType, 'sport_football');
  assert.equal(api.getPlaceById('place_3').quiz_profile.place_type, 'stadion');
  assert.equal(peak <= 6, true);
  assert.equal(active, 0);
  assert.equal(calls.filter(url => url.startsWith('data/places/source_')).length, files.length);
  const callCount = calls.length;
  assert.strictEqual(await api.loadPlaces(), a);
  assert.equal(calls.length, callCount, 'Completed source set is cached');

  // A transient manifest failure is retryable, rather than a permanent empty cache.
  let manifestAttempts = 0;
  const recover = resolver(async url => {
    if (url === manifestPath && ++manifestAttempts === 1) throw new Error('temporary network failure');
    return response(url === manifestPath ? { files: [files[0]] } : [rows[0]]);
  });
  assert.equal((await recover.loadPlaces()).length, 0);
  assert.equal((await recover.loadPlaces()).length, 1);
  assert.equal(manifestAttempts, 2);

  // A failed source still yields available rows for this call, but is retried
  // on the next call; both init() and lookup see the recovered complete data.
  let sourceAttempts = 0;
  const partial = resolver(async url => {
    if (url === manifestPath) return response({ files: files.slice(0, 2) });
    if (url.includes('brands_by_place')) return response({});
    if (url.includes('brands_master')) return response([]);
    if (url === `data/${files[1]}` && ++sourceAttempts === 1) return { ok: false, status: 503 };
    return response([rows[files.indexOf(url.slice(5))]]);
  });
  assert.equal((await partial.init()).places.length, 1);
  assert.equal((await partial.init()).places.length, 2);
  assert.equal(sourceAttempts, 2);

  // Preserve the supported preloaded-cache path without writing History Go state.
  const preloaded = [rows[0]];
  const cachedWindow = { PLACES: preloaded };
  const cached = resolver(() => { throw new Error('Preloaded cache must not fetch'); }, cachedWindow);
  const cachedRows = await cached.loadPlaces();
  assert.notStrictEqual(cachedRows, preloaded);
  assert.deepEqual(Array.from(cachedRows), preloaded);
  assert.strictEqual(cachedWindow.PLACES, preloaded);
  assert.equal(cached.getPlaceById('shared').name, 'Source 0');
  cached.clearCacheForTesting();
  assert.equal(cached.getPlaceById('shared'), null);
  assert.equal((await cached.loadPlaces()).length, 1);

  let emptyCalls = 0;
  const empty = resolver(async () => { emptyCalls++; return response({ files: [] }); });
  assert.equal((await empty.loadPlaces()).length, 0);
  assert.equal((await empty.loadPlaces()).length, 0);
  assert.equal(emptyCalls, 1);
  console.log(`civication source loading ok: ${files.length} sources, peak ${peak}, shared completion, stable order, retry and cache`);
})().catch(error => { console.error(error); process.exitCode = 1; });
