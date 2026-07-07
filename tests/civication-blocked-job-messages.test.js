#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Lastekontrakten for v1 bor nå i legacy-loaderen (Civication v2 laster ikke
// disse i hovedflyten) — se docs/civication-life-story-system.md §11.
const { LEGACY_SCRIPTS } = require('../js/Civication/civicationLegacyLoader.js');
const blockedIdx = LEGACY_SCRIPTS.indexOf('js/Civication/systems/civicationBlockedJobMessages.js');
const bridgeIdx = LEGACY_SCRIPTS.indexOf('js/Civication/systems/civicationBrandEmployerBridge.js');
const meritsIdx = LEGACY_SCRIPTS.indexOf('js/Civication/merits-and-jobs.js');
assert.ok(blockedIdx !== -1, 'blocked-job script should be referenced in the legacy loader');
assert.ok(bridgeIdx !== -1, 'brand-employer bridge script should be referenced in the legacy loader');
assert.ok(meritsIdx !== -1, 'merits-and-jobs script should be referenced in the legacy loader');
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

// Ansvarsdelingen etter boot-splitten: script-once-dedupen bor i
// CivicationShellBoot (skallets datalaster), mens blocked-job ensure-loaderen
// bor i CivicationDayBoot (dag-/mail-laget).
const shellBootSource = fs.readFileSync(path.join(__dirname, '..', 'js/Civication/CivicationShellBoot.js'), 'utf8');
const dayBootSource = fs.readFileSync(path.join(__dirname, '..', 'js/Civication/CivicationDayBoot.js'), 'utf8');
// Implementation-agnostic: the loader must detect an already-present <script>
// and skip re-appending. It currently scans document.scripts (more robust than
// a querySelector match), so assert the dedup *behaviour*, not an exact string.
assert.ok(
  /document\.scripts|querySelector\(\s*`?script\[src/.test(shellBootSource),
  'boot loader should look for an already-loaded script before appending'
);
assert.ok(
  /if\s*\(\s*existing\s*\)/.test(shellBootSource),
  'boot loader should short-circuit when the script already exists'
);
assert.ok(
  dayBootSource.includes('if (window.CivicationBlockedJobMessages?.enqueueNoUnlockedBrandEmployerMessage) return true;'),
  'blocked-job ensure-loader should short-circuit when runtime already exists'
);

console.log('civication blocked job messages ok');
