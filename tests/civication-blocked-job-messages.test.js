#!/usr/bin/env node
const assert = require('assert');

const store = {};
global.localStorage = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); }
};

let inbox = [];
global.HG_CiviEngine = {
  getInbox() { return inbox; },
  setInbox(next) { inbox = Array.isArray(next) ? next : []; }
};

const blocked = require('../js/Civication/systems/civicationBlockedJobMessages.js');

const first = blocked.enqueueNoUnlockedBrandEmployerMessage({
  career_id: 'naeringsliv',
  role_scope: 'ekspeditor',
  reason: 'no_unlocked_brand_employer'
});
assert.strictEqual(first.ok, true);
assert.strictEqual(first.enqueued, true);
assert.strictEqual(inbox.length, 1);
assert.strictEqual(inbox[0].source_type, 'blocked_job');

const second = blocked.enqueueNoUnlockedBrandEmployerMessage({
  career_id: 'naeringsliv',
  role_scope: 'ekspeditor',
  reason: 'no_unlocked_brand_employer'
});
assert.strictEqual(second.skipped, 'already_pending');
assert.strictEqual(inbox.length, 1);

inbox[0].status = 'archived';
const third = blocked.enqueueNoUnlockedBrandEmployerMessage({
  career_id: 'naeringsliv',
  role_scope: 'ekspeditor',
  reason: 'no_unlocked_brand_employer'
});
assert.strictEqual(third.skipped, 'cooldown');
assert.strictEqual(inbox.length, 1);

console.log('civication blocked job messages ok');
