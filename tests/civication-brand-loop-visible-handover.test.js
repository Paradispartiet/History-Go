#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');
function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}
function makeStorage() {
  const store = new Map();
  return { getItem(k) { return store.has(k) ? store.get(k) : null; }, setItem(k, v) { store.set(String(k), String(v)); }, removeItem(k) { store.delete(k); } };
}

global.window = global;
global.localStorage = makeStorage();
global.Event = class Event { constructor(type) { this.type = type; } };
global.document = { readyState: 'complete', addEventListener() {} };
global.dispatchEvent = () => {};
global.addEventListener = () => {};

global.CivicationMailEngine = null;

loadScript('js/Civication/core/civicationState.js');
loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
loadScript('js/Civication/systems/civicationBrandJobState.js');
loadScript('js/Civication/systems/civicationBrandJobProgression.js');
loadScript('js/Civication/systems/civicationEventChannels.js');

CivicationState.setActivePosition({ brand_id: 'norli', brand_name: 'Norli', career_id: 'naeringsliv', role_id: 'naer_ekspeditor' });

const before = CivicationState.getInbox().find((item) => item?.status === 'pending' && item?.event?.source_type === 'brand_progression');
assert.strictEqual(before, undefined);

['m1', 'm2', 'm3'].forEach((id) => {
  const res = CivicationBrandJobState.applyChoiceConsequences({
    id,
    source_type: 'planned',
    role_scope: 'ekspeditor',
    brand_id: 'norli',
    brand_name: 'Norli',
    mail_family: 'kundemote_og_service',
    mail_type: 'job',
    mail_tags: ['brand_mail']
  }, {
    id: 'A',
    tags: ['kunde'],
    effect: 1
  });
  assert.strictEqual(res.ok, true);
});

const state = CivicationBrandJobState.getState();
assert((state.byBrandRole['norli:ekspeditor'].metrics.kundetillit || 0) >= 3);
assert(state.last_change && state.last_change.delta && state.last_change.delta.kundetillit > 0);

const pendingMilestone = CivicationState.getInbox().find((item) => item?.status === 'pending' && item?.event?.source_type === 'brand_progression');
assert(pendingMilestone);
assert.strictEqual(CivicationEventChannels.classifyEvent(pendingMilestone.event), 'milestone');

console.log('civication-brand-loop-visible-handover.test.js passed');
