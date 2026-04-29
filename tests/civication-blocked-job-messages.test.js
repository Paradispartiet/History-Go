#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'Civication.html'), 'utf8');
const blockedIdx = html.indexOf('js/Civication/systems/civicationBlockedJobMessages.js');
const bridgeIdx = html.indexOf('js/Civication/systems/civicationBrandEmployerBridge.js');
const meritsIdx = html.indexOf('js/Civication/merits-and-jobs.js');
assert.ok(blockedIdx !== -1, 'blocked-job script should be referenced in Civication.html');
assert.ok(bridgeIdx !== -1, 'brand-employer bridge script should be referenced in Civication.html');
assert.ok(meritsIdx !== -1, 'merits-and-jobs script should be referenced in Civication.html');
assert.ok(blockedIdx < bridgeIdx, 'blocked-job script should load before brand-employer bridge');
assert.ok(bridgeIdx < meritsIdx, 'brand-employer bridge should load before merits-and-jobs');

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
assert.strictEqual(inbox[0].status, 'pending');
assert.ok(Number.isFinite(inbox[0].createdAt));
assert.strictEqual(inbox[0].event.source_type, 'blocked_job');

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

const directShapeWrites = inbox.filter(item => item && item.source_type === 'blocked_job');
assert.strictEqual(directShapeWrites.length, 0);

const bootSource = fs.readFileSync(path.join(__dirname, '..', 'js/Civication/CivicationBoot.js'), 'utf8');
assert.ok(
  bootSource.includes('const existing = document.querySelector(`script[src="${src}"]`);'),
  'boot loader should check for existing script before append'
);
assert.ok(
  bootSource.includes('if (window.CivicationBlockedJobMessages?.enqueueNoUnlockedBrandEmployerMessage) return true;'),
  'blocked-job ensure-loader should short-circuit when runtime already exists'
);

console.log('civication blocked job messages ok');
