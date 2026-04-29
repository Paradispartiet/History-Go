#!/usr/bin/env node
const assert = require('assert');

function setupStorage(seed = {}) {
  const store = { ...seed };
  global.localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }
  };
}

function loadAccess() {
  delete require.cache[require.resolve('../js/Civication/systems/civicationBrandAccess.js')];
  return require('../js/Civication/systems/civicationBrandAccess.js');
}

function resetGlobals() {
  global.HGBrands = { all: [] };
  global.BRANDS_MASTER = [];
  global.BRANDS = [];
  global.BRANDS_BY_PLACE = {};
}

resetGlobals();
setupStorage({ visited_places: JSON.stringify({}) });
let access = loadAccess();

// A locked brand should not be offered
global.HGBrands.all = [{ id: 'narvesen', name: 'Narvesen', sector: 'kiosk_retail', brand_type: 'retail' }];
global.BRANDS_BY_PLACE = { place_x: ['narvesen'] };
assert.deepStrictEqual(access.getUnlockedBrandEmployers({ career_id: 'naeringsliv', role_scope: 'ekspeditor' }), []);

// B unlocked brand should be offered
setupStorage({ visited_places: JSON.stringify(['place_x']) });
access = loadAccess();
const unlocked = access.getUnlockedBrandEmployers({ career_id: 'naeringsliv', role_scope: 'ekspeditor' });
assert.strictEqual(unlocked.length, 1);
assert.strictEqual(unlocked[0].brand_id, 'narvesen');

// C dead/signage excluded
global.HGBrands.all = [{ id: 'old', name: 'Old', sector: 'kiosk', brand_type: 'signage', status: 'dead' }];
global.BRANDS_BY_PLACE = { place_x: ['old'] };
const blocked = access.getUnlockedBrandEmployers({ career_id: 'naeringsliv', role_scope: 'ekspeditor' });
assert.deepStrictEqual(blocked, []);

// F no global catalog leakage
global.HGBrands.all = [{ id: 'master_only', name: 'Master Only', sector: 'kiosk', brand_type: 'retail' }];
global.BRANDS_MASTER = global.HGBrands.all;
global.BRANDS_BY_PLACE = { other_place: ['master_only'] };
setupStorage({ visited_places: JSON.stringify(['place_x']) });
access = loadAccess();
const leaked = access.getUnlockedBrandEmployers({ career_id: 'naeringsliv', role_scope: 'ekspeditor' });
assert.deepStrictEqual(leaked, []);

// G generic keys should not become place ids
setupStorage({
  visited_places: JSON.stringify({
    points: 99,
    version: 1,
    updated_at: 1234,
    place_x: true
  })
});
global.HGBrands.all = [{ id: 'narvesen', name: 'Narvesen', sector: 'kiosk_retail', brand_type: 'retail' }];
global.BRANDS_BY_PLACE = { place_x: ['narvesen'], points: ['narvesen'] };
access = loadAccess();
const ignoreGeneric = access.getUnlockedBrandEmployers({ career_id: 'naeringsliv', role_scope: 'ekspeditor' });
assert.strictEqual(ignoreGeneric.length, 1);
assert.strictEqual(ignoreGeneric[0].place_id, 'place_x');

// H access_source should be returned and prefer quiz/unlocked over visited
setupStorage({
  visited_places: JSON.stringify(['place_x']),
  hg_unlocks_v1: JSON.stringify({ place_x: true }),
  quiz_progress: JSON.stringify({ place_x: { completed: true } })
});
access = loadAccess();
const preferredAccess = access.getUnlockedBrandEmployers({ career_id: 'naeringsliv', role_scope: 'ekspeditor' });
assert.strictEqual(preferredAccess[0].access_source, 'completed_place_quiz');

setupStorage({
  visited_places: JSON.stringify(['place_x']),
  hg_unlocks_v1: JSON.stringify({ place_x: true })
});
access = loadAccess();
const unlockedAccess = access.getUnlockedBrandEmployers({ career_id: 'naeringsliv', role_scope: 'ekspeditor' });
assert.strictEqual(unlockedAccess[0].access_source, 'unlocked_place');

console.log('civication brand access ok');
