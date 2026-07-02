#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function makeStorage() { const store = new Map(); return { getItem:k=>store.has(k)?store.get(k):null, setItem:(k,v)=>store.set(String(k),String(v)), removeItem:k=>store.delete(String(k)), clear:()=>store.clear() }; }
function makeFetch(rootDir) { return async function fetchMock(url) { const clean = String(url || '').split('?')[0].replace(/^\/+/, ''); const fullPath = path.resolve(rootDir, clean); if (!fullPath.startsWith(rootDir)) return { ok:false, status:400, async json(){return null;} }; try { const body = await fs.promises.readFile(fullPath, 'utf8'); return { ok:true, status:200, async json(){return JSON.parse(body);} }; } catch { return { ok:false, status:404, async json(){return null;} }; } }; }
function loadScript(relPath) { vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath }); }
function setup() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);
  global.CivicationCalendar = { getPhase: () => 'morning', setPhase() {}, advanceByMinutes() {} };
  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  global.CivicationPsyche = { getAutonomy: () => 50, updateIntegrity() {}, updateVisibility() {}, updateEconomicRoom() {}, updateTrust() {}, checkBurnout() {}, processCollapse() {} };
  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/day/dayChoiceDirector.js');
  loadScript('js/Civication/systems/day/dayConsequences.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');
  global.CivicationState.setActivePosition({ career_id: 'naeringsliv', title: 'Controller', role_key: 'controller', role_id: 'naer_controller' });
}
function ids(runtime) { return (runtime.items || []).map(row => String(row.event?.id || '')).filter(Boolean); }

async function run() {
  setup();
  const active = global.CivicationState.getActivePosition();
  const date = new Date().toISOString().slice(0, 10);
  const stableA = await global.CivicationDailyMailBuilder.buildQueue(active, { date });
  const stableB = await global.CivicationDailyMailBuilder.buildQueue(active, { date });
  assert.strictEqual(stableA.runtime_instance_key, '', 'normal runtime should not get random runtime key');
  assert.deepStrictEqual(ids(stableA), ids(stableB), 'normal non-forceNew daily builds should keep stable ids');

  const forcedA = await global.CivicationDailyMailBuilder.buildQueue(active, { date, forceNew: true });
  const forcedB = await global.CivicationDailyMailBuilder.buildQueue(active, { date, forceNew: true });
  assert(forcedA.runtime_instance_key && forcedB.runtime_instance_key, 'forceNew runtimes should carry runtime_instance_key');
  assert.notStrictEqual(forcedA.runtime_instance_key, forcedB.runtime_instance_key, 'two forceNew runs should get distinct runtime keys');
  const forceNewGeneratedIds = (runtime) => (runtime.items || [])
    .map(row => row.event || {})
    .filter(event => event.source_type !== 'planned')
    .map(event => String(event.id || ''))
    .filter(Boolean);
  const aIds = forceNewGeneratedIds(forcedA);
  const bIds = forceNewGeneratedIds(forcedB);
  assert(aIds.length && bIds.length, 'forceNew builds should produce generated/wrapped ids');
  assert.strictEqual(aIds.some(id => bIds.includes(id)), false, 'two forceNew runs on same date should not collide on generated daily ids');

  const wrapped = forcedA.items.find(row => row.event?.source_type === 'daily_extra' && row.event?.source_mail_id);
  assert(wrapped, 'forceNew day should include a source-backed daily extra mail');
  assert(wrapped.event.id.includes(wrapped.event.source_mail_id), 'daily wrapper id should remain traceable to source_mail_id');
  assert.strictEqual(wrapped.event.daily_mail_meta?.source_mail_id, wrapped.event.source_mail_id, 'daily metadata should preserve source_mail_id');

  console.log('civication-daily-mail-force-new-ids.test.js passed');
}
run().catch(error => { console.error(error); process.exit(1); });
