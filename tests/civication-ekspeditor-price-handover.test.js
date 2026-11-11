#!/usr/bin/env node
// Regression: a completed sale must not imply an accepted or verified price repair.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const firstId = 'job_ekspeditor_week1_price_error_in_queue';

function harness() {
  const storage = new Map();
  const w = {
    console, Date, Promise, Map, Set, Object, Array, String, Number, Boolean, JSON, Math,
    localStorage: {
      getItem: k => storage.get(String(k)) ?? null,
      setItem: (k, v) => storage.set(String(k), String(v)),
      removeItem: k => storage.delete(String(k))
    },
    document: { readyState: 'complete', addEventListener() {} },
    addEventListener() {}, dispatchEvent() {},
    Event: class Event { constructor(type) { this.type = type; } },
    CivicationCalendar: { getPhase: () => 'morning', advanceByMinutes() {} },
    fetch: async url => {
      const rel = String(url).split('?')[0].replace(/^\/+/, '');
      const file = path.resolve(root, rel);
      assert(file.startsWith(root + path.sep), 'fetch must stay inside repository');
      if (!fs.existsSync(file)) return { ok: false, status: 404, json: async () => null };
      const text = fs.readFileSync(file, 'utf8');
      return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text };
    }
  };
  w.window = w;
  w.globalThis = w;
  const context = vm.createContext(w);
  for (const file of [
    'core/civicationState.js', 'core/civicationEventEngine.js',
    'systems/civicationEventChannels.js', 'systems/civicationCareerRoleResolver.js',
    'systems/civicationSceneInteraction.js', 'systems/day/dayChoiceDirector.js',
    'systems/day/dayConsequences.js', 'systems/civicationMailRuntime.js',
    'systems/civicationWorkdayMailBuilder.js'
  ]) vm.runInContext(fs.readFileSync(path.join(root, 'js/Civication', file), 'utf8'), context, { filename: file });
  w.CivicationState.setActivePosition({
    career_id: 'naeringsliv', role_scope: 'ekspeditor', role_key: 'ekspeditor',
    role_id: 'naer_ekspeditor', title: 'Ekspeditør / butikkmedarbeider'
  });
  w.CivicationState.setInbox([]);
  const engine = new w.CivicationEventEngine();
  engine.__civiSuppressImmediateFollowup = true;
  w.HG_CiviEngine = engine;
  const flags = () => new Set(w.CivicationState.getMailBranchState().flags || []);
  const pending = () => w.CivicationState.getInbox().find(row => row.status === 'pending')?.event;
  async function answer(id, choiceId) {
    assert.equal(pending()?.id, id, 'answer only the actual pending scene');
    const result = await engine.answer(id, choiceId);
    assert.equal(result.ok, true, `${id}/${choiceId} must succeed`);
    return result;
  }
  return { w, engine, flags, pending, answer };
}

async function start(choiceId) {
  const h = harness();
  await h.engine.onAppOpen({ force: true });
  assert.equal(h.pending()?.id, firstId);
  assert.equal(h.pending().source_type, 'planned');
  assert.equal(h.w.CivicationSceneCatalog.inspect().source_format, 'compiled_scene_registry_v1');
  await h.answer(firstId, choiceId);
  assert(!h.flags().has('ekspeditor_pris_overtatt'), 'sale is not an accepted handover');
  assert(!h.flags().has('ekspeditor_pris_retting_kontrollert'), 'sale is not a verified source repair');
  return h;
}

async function report(h) {
  const thread = h.pending();
  assert(thread?.source_type === 'thread');
  assert(h.w.CivicationSceneInteraction.classify(thread).actionable, 'price consequence must offer a real follow-up action');
  await h.answer(thread.id, 'A');
  assert(h.flags().has('ekspeditor_pris_kontrollert'));
  assert(h.flags().has('ekspeditor_pris_handel_rettet'));
  assert(h.flags().has('ekspeditor_pris_meldt'));
  assert(!h.flags().has('ekspeditor_pris_overtatt'), 'sending report cannot invent receipt');
  assert.equal(h.pending()?.id, 'ekspeditor_prisavvik_mottatt');
}

(async () => {
  // Both sound routes and both repairable mistakes reach the same main story.
  for (const initial of ['A', 'D', 'B', 'C']) {
    const h = await start(initial);
    await report(h);
    await h.answer('ekspeditor_prisavvik_mottatt', 'A');
    assert(h.flags().has('ekspeditor_pris_overtatt'));
    assert(!h.flags().has('ekspeditor_pris_retting_kontrollert'));
    assert.equal(h.pending()?.id, 'ekspeditor_prisavvik_kontroller_retting');
    await h.answer(h.pending().id, 'A');
    assert(h.flags().has('ekspeditor_pris_grunnlag_rettet'));
    assert(h.flags().has('ekspeditor_pris_retting_kontrollert'));
    assert.equal(h.w.CivicationState.getState().mail_runtime_v1.step_index, 1, 'follow-ups do not advance planned sequence');
    const history = h.w.CivicationState.getState().mail_runtime_v1.history;
    assert.equal(history.length, 4, 'sale, report, receipt and verification each recorded once');
    assert.equal(history[0].choice_id, initial);
    await h.engine.onAppOpen({ force: true });
    assert.notEqual(h.pending()?.id, firstId, 'solved price encounter does not repeat');
    assert.equal(h.pending()?.mail_plan_meta?.step_index, 1, 'private-life step still follows');
    const replay = await h.engine.answer(firstId, initial);
    assert.equal(replay.ok, false, 'consumed sale cannot be answered twice');
  }
  const unreported = await start('A');
  await unreported.answer(unreported.pending().id, 'B');
  assert(!unreported.flags().has('ekspeditor_pris_meldt'));
  assert(!unreported.flags().has('ekspeditor_pris_overtatt'));
  assert(!unreported.flags().has('ekspeditor_pris_retting_kontrollert'));

  const deferred = await start('A');
  await report(deferred);
  await deferred.answer(deferred.pending().id, 'A');
  await deferred.answer(deferred.pending().id, 'B');
  assert(deferred.flags().has('ekspeditor_pris_overtatt'));
  assert(deferred.flags().has('ekspeditor_pris_kontroll_venter'));
  assert(!deferred.flags().has('ekspeditor_pris_retting_kontrollert'), 'unfinished checking stays unfinished');

  const delegated = await start('D');
  await report(delegated);
  await delegated.answer(delegated.pending().id, 'B');
  assert(delegated.flags().has('ekspeditor_pris_overtatt'));
  assert(!delegated.flags().has('ekspeditor_pris_retting_kontrollert'));
  assert.equal(delegated.pending()?.id, 'ekspeditor_prisavvik_amir_kontroll');
  await delegated.answer(delegated.pending().id, 'A');
  assert(delegated.flags().has('ekspeditor_pris_kontrollert_av_amir'));
  assert(delegated.flags().has('ekspeditor_pris_retting_kontrollert'));
  for (const finalChoice of ['A', 'B']) {
    const h = await start('D');
    await report(h);
    await h.answer(h.pending().id, 'B');
    await h.answer('ekspeditor_prisavvik_amir_kontroll', 'B');
    assert(h.flags().has('ekspeditor_pris_kontrollert_av_amir'));
    assert(!h.flags().has('ekspeditor_pris_retting_kontrollert'));
    assert.equal(h.pending()?.id, 'ekspeditor_prisavvik_kontroller_retting');
    await h.answer(h.pending().id, finalChoice);
    assert.equal(h.flags().has('ekspeditor_pris_retting_kontrollert'), finalChoice === 'A');
    assert.equal(h.flags().has('ekspeditor_pris_kontroll_venter'), finalChoice === 'B');
    assert.equal(h.w.CivicationState.getState().mail_runtime_v1.step_index, 1);
  }
  console.log('Ekspeditør price handover: 4 complete paths + unreported, deferred, delegated and 2 extra own-check paths OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
