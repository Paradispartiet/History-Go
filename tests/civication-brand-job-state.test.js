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
  return {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(String(k), String(v)); },
    removeItem(k) { store.delete(k); },
    clear() { store.clear(); }
  };
}

function bootstrap(activePosition = null) {
  global.window = global;
  global.localStorage = makeStorage();
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  const events = [];
  global.dispatchEvent = (ev) => { events.push(ev?.type); };
  global.addEventListener = () => {};
  global.location = { href: 'http://localhost/Civication.html' };

  global.CivicationEventEngine = function CivicationEventEngine() {};
  global.CivicationEventEngine.prototype.getPendingEvent = function getPendingEvent() { return this.__pending || null; };
  global.CivicationEventEngine.prototype.answer = async function answer() { return { ok: true }; };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationBrandJobState.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');

  global.CivicationState.setActivePosition(activePosition);
  return { events };
}

(async function run() {
  // A + B
  let env = bootstrap(null);
  let res = global.CivicationBrandJobState.applyChoiceConsequences({ source_type: 'planned', role_scope: 'ekspeditor' }, { id: 'c1', tags: ['kunde'] });
  assert.strictEqual(res.changed, false);
  assert.strictEqual(localStorage.getItem('hg_brand_job_state_v1'), null);

  env = bootstrap({ brand_id: 'norli', brand_name: 'Norli', career_id: 'naeringsliv', role_id: 'naer_ekspeditor' });
  res = global.CivicationBrandJobState.applyChoiceConsequences({ id: 'm_generic', source_type: 'planned', role_scope: 'ekspeditor' }, { id: 'c1', tags: ['kunde'] });
  assert.strictEqual(res.changed, false);

  // C
  res = global.CivicationBrandJobState.applyChoiceConsequences({ id: 'm_n1', source_type: 'planned', role_scope: 'ekspeditor', brand_id: 'norli', brand_name: 'Norli', mail_tags: ['brand_mail'] }, { id: 'c2', tags: ['kunde', 'kvalitet', 'fag'], effect: 1 });
  assert.strictEqual(res.changed, true);
  let state = global.CivicationBrandJobState.getState();
  let key = 'norli:ekspeditor';
  assert((state.byBrandRole[key].metrics.kundetillit || 0) > 0);
  assert((state.byBrandRole[key].metrics.brand_tillit || 0) > 0);
  assert((state.byBrandRole[key].metrics.faglighet || 0) > 0);

  // D
  env = bootstrap({ brand_id: 'narvesen', brand_name: 'Narvesen', career_id: 'naeringsliv', role_id: 'naer_ekspeditor' });
  res = global.CivicationBrandJobState.applyChoiceConsequences({ id: 'm_na1', source_type: 'planned', role_scope: 'ekspeditor', brand_id: 'narvesen', brand_name: 'Narvesen', mail_tags: ['brand_mail'] }, { id: 'c3', tags: ['tempo', 'snarvei'], effect: -1 });
  state = global.CivicationBrandJobState.getState();
  key = 'narvesen:ekspeditor';
  assert((state.byBrandRole[key].metrics.driftsflyt || 0) > 0);
  assert((state.byBrandRole[key].metrics.stress || 0) > 0);
  assert((state.byBrandRole[key].metrics.risiko || 0) > 0);
  assert((state.byBrandRole[key].metrics.brand_tillit || 0) < 0);

  // E
  env = bootstrap({ brand_id: 'norli', brand_name: 'Norli', career_id: 'naeringsliv', role_id: 'naer_ekspeditor' });
  res = global.CivicationBrandJobState.applyChoiceConsequences({ id: 'm_wrong', source_type: 'planned', role_scope: 'ekspeditor', brand_id: 'narvesen', mail_tags: ['brand_mail'] }, { id: 'c1', tags: ['kunde'] });
  assert.strictEqual(res.changed, false);

  // F + H
  res = global.CivicationBrandJobState.applyChoiceConsequences({ id: 'm_once', source_type: 'planned', role_scope: 'ekspeditor', brand_id: 'norli', brand_name: 'Norli', mail_tags: ['brand_mail'] }, { id: 'c_once', tags: ['kunde'] });
  assert.strictEqual(res.changed, true);
  const eventCountAfterFirst = env.events.filter((e) => e === 'updateProfile').length;
  res = global.CivicationBrandJobState.applyChoiceConsequences({ id: 'm_once', source_type: 'planned', role_scope: 'ekspeditor', brand_id: 'norli', brand_name: 'Norli', mail_tags: ['brand_mail'] }, { id: 'c_once', tags: ['kunde'] });
  assert.strictEqual(res.changed, false);
  state = global.CivicationBrandJobState.getState();
  key = 'norli:ekspeditor';
  assert.strictEqual(state.byBrandRole[key].history.length, 1);
  assert.strictEqual(env.events.filter((e) => e === 'updateProfile').length, eventCountAfterFirst);

  // G answer integration: applies on ok true
  const engine = new global.CivicationEventEngine();
  engine.__pending = {
    event: {
      id: 'mail_int_1',
      source_type: 'planned',
      role_scope: 'ekspeditor',
      brand_id: 'norli',
      brand_name: 'Norli',
      mail_tags: ['brand_mail'],
      choices: [{ id: 'yes', tags: ['kunde'] }]
    }
  };
  await engine.answer('mail_int_1', 'yes');
  state = global.CivicationBrandJobState.getState();
  assert((state.byBrandRole['norli:ekspeditor'].metrics.kundetillit || 0) > 0);

  // G fail path: no apply on ok false
  const base = JSON.stringify(state);
  global.CivicationEventEngine.prototype.answer = async function answerFail() { return { ok: false }; };
  global.CivicationMailRuntime.patchEventEngine();
  const engineFail = new global.CivicationEventEngine();
  engineFail.__pending = { event: { id: 'mail_int_fail', source_type: 'planned', role_scope: 'ekspeditor', brand_id: 'norli', mail_tags: ['brand_mail'], choices: [{ id: 'no', tags: ['kvalitet'] }] } };
  await engineFail.answer('mail_int_fail', 'no');
  assert.strictEqual(JSON.stringify(global.CivicationBrandJobState.getState()), base);

  console.log('civication brand job state ok');
})();
