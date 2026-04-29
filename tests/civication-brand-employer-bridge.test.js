#!/usr/bin/env node
const assert = require('assert');

global.localStorage = { getItem() { return null; }, setItem() {} };

const state = { active: null };
global.CivicationState = {
  setActivePosition(pos) { state.active = { ...pos }; },
  getActivePosition() { return state.active; }
};

const offers = [];
global.CivicationJobs = {
  __brandEmployerBridgePatched: false,
  pushOffer(payload) {
    offers.push(payload);
    return { ok: true, offer: payload };
  },
  acceptOffer() {
    const offer = offers[offers.length - 1];
    state.active = { ...offer };
    return { ok: true, offer };
  }
};

global.CivicationBrandAccess = {
  getUnlockedBrandEmployers() {
    return [{
      brand_id: 'narvesen',
      brand_name: 'Narvesen',
      brand_type: 'retail',
      brand_group: 'convenience',
      sector: 'kiosk',
      place_id: 'place_x',
      employer_context: { source: 'HGBrands', brand_id: 'narvesen' }
    }];
  }
};

const bridge = require('../js/Civication/systems/civicationBrandEmployerBridge.js');
bridge.boot();

// D job offer enrichment
const pushed = global.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Ekspeditør / butikkmedarbeider', threshold: 1, points_at_offer: 1 });
assert.strictEqual(pushed.ok, true);
assert.strictEqual(pushed.offer.brand_id, 'narvesen');
assert.strictEqual(pushed.offer.brand_name, 'Narvesen');
assert.strictEqual(pushed.offer.employer_context.source, 'HGBrands');

// E active position persistence
const accepted = global.CivicationJobs.acceptOffer('naeringsliv:1');
assert.strictEqual(accepted.ok, true);
const active = global.CivicationState.getActivePosition();
assert.strictEqual(active.brand_id, 'narvesen');
assert.strictEqual(active.brand_name, 'Narvesen');
assert.strictEqual(active.employer_context.source, 'HGBrands');

console.log('civication brand employer bridge ok');
