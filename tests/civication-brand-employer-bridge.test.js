#!/usr/bin/env node
const assert = require('assert');

const storage = {};
global.localStorage = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null; },
  setItem(k, v) { storage[k] = String(v); }
};

const state = { active: null, inbox: [] };
global.CivicationState = {
  setActivePosition(pos) { state.active = { ...pos }; },
  getActivePosition() { return state.active; },
  getInbox() { return state.inbox; },
  setInbox(next) { state.inbox = Array.isArray(next) ? next : []; }
};

global.HG_CiviEngine = {
  getInbox() { return state.inbox; },
  setInbox(next) { state.inbox = Array.isArray(next) ? next : []; }
};

const offers = [];
let employerCalls = 0;
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
    employerCalls += 1;
    return [];
  }
};

require('../js/Civication/systems/civicationBlockedJobMessages.js');
const bridge = require('../js/Civication/systems/civicationBrandEmployerBridge.js');
bridge.boot();

// A Blocking enqueues message and does not store offer
offers.length = 0;
state.inbox = [];
const blocked = global.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Ekspeditør / butikkmedarbeider', threshold: 1, points_at_offer: 1 });
assert.deepStrictEqual(blocked, { ok: false, reason: 'no_unlocked_brand_employer', career_id: 'naeringsliv', role_scope: 'ekspeditor' });
assert.strictEqual(offers.length, 0);
assert.strictEqual(state.inbox.length, 1);
assert.strictEqual(state.inbox[0].status, 'pending');
assert.strictEqual(state.inbox[0].event.source_type, 'blocked_job');
assert.strictEqual(state.inbox[0].event.mail_class, 'opportunity_blocked');
assert.strictEqual(state.inbox[0].event.career_id, 'naeringsliv');
assert.strictEqual(state.inbox[0].event.role_scope, 'ekspeditor');

// B Cooldown/pending prevents spam
const blockedAgain = global.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Ekspeditør / butikkmedarbeider', threshold: 1, points_at_offer: 1 });
assert.strictEqual(blockedAgain.ok, false);
assert.strictEqual(state.inbox.length, 1);

// C Existing pending blocked message prevents duplicate
state.inbox = [{
  id: 'existing-envelope',
  status: 'pending',
  createdAt: Date.now(),
  event: {
    id: 'existing',
    source_type: 'blocked_job',
    mail_class: 'opportunity_blocked',
    career_id: 'naeringsliv',
    role_scope: 'ekspeditor',
    reason: 'no_unlocked_brand_employer'
  }
}];
const blockedPending = global.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Ekspeditør / butikkmedarbeider', threshold: 1, points_at_offer: 1 });
assert.strictEqual(blockedPending.ok, false);
assert.strictEqual(state.inbox.length, 1);
assert.strictEqual(state.inbox[0].event.id, 'existing');

// D Non-ekspeditør unaffected
const callsBefore = employerCalls;
const nonEksp = global.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Fagarbeider', threshold: 2, points_at_offer: 2 });
assert.strictEqual(nonEksp.ok, true);
assert.strictEqual(nonEksp.offer.title, 'Fagarbeider');
assert.strictEqual(employerCalls, callsBefore);
assert.strictEqual(state.inbox.filter(m => m?.event?.source_type === 'blocked_job').length, 1);

// E Unlocked employer succeeds without blocked message
global.CivicationBrandAccess.getUnlockedBrandEmployers = function () {
  employerCalls += 1;
  return [{
    brand_id: 'narvesen', brand_name: 'Narvesen', brand_type: 'retail', brand_group: 'convenience',
    sector: 'kiosk', place_id: 'place_x', access_source: 'unlocked_place', employer_context: { source: 'HGBrands', brand_id: 'narvesen' }
  }];
};
state.inbox = [];
const pushed = global.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Ekspeditør / butikkmedarbeider', threshold: 1, points_at_offer: 1 });
assert.strictEqual(pushed.ok, true);
assert.strictEqual(pushed.offer.brand_id, 'narvesen');
assert.strictEqual(state.inbox.length, 0);

// active position persistence
const accepted = global.CivicationJobs.acceptOffer('naeringsliv:1');
assert.strictEqual(accepted.ok, true);
const active = global.CivicationState.getActivePosition();
assert.strictEqual(active.brand_id, 'narvesen');

console.log('civication brand employer bridge ok');
