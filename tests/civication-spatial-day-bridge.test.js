#!/usr/bin/env node
const assert = require('assert');

function memoryStorage() {
  const m = new Map();
  return {
    getItem(k) { return m.has(String(k)) ? m.get(String(k)) : null; },
    setItem(k, v) { m.set(String(k), String(v)); },
    removeItem(k) { m.delete(String(k)); },
    clear() { m.clear(); }
  };
}

global.window = global;
global.document = undefined;
global.localStorage = memoryStorage();
global.CustomEvent = function CustomEvent(type, init) { this.type = type; this.detail = init?.detail; };
global.dispatchEvent = () => true;
global.addEventListener = () => {};

global.CIVI_MAP_DISTRICTS = [
  { id: 'sentrum', name: 'Sentrum' },
  { id: 'sagene', name: 'Sagene' }
];

global.CivicationState = {
  getActivePosition() {
    return {
      title: 'Journalist',
      brand_name: 'Redaksjonen',
      employer_context: { district: 'sentrum', place_id: 'pressehuset' }
    };
  },
  getInbox() { return []; }
};
global.CivicationHome = {
  getState() { return { home: { district: 'sagene', status: 'settled' } }; }
};

const bridge = require('../js/Civication/systems/civicationSpatialDayBridge.js');

{
  const ctx = bridge.normalizeMapContext({ place_id: 'stortinget', district_id: 'sentrum', label: 'Stortinget', purpose: 'meeting' });
  assert.deepStrictEqual(ctx, {
    place_id: 'stortinget', district_id: 'sentrum', label: 'Stortinget', purpose: 'meeting',
    relevance: 'contextual', action_label: 'Vis på kart', source: 'explicit'
  });
}

{
  const ctx = bridge.resolveMailContext({
    id: 'm1', phase_tag: 'workday', place_id: 'stortinget', place_name: 'Stortinget', task_domain: 'meeting'
  });
  assert.strictEqual(ctx.place_id, 'stortinget');
  assert.strictEqual(ctx.label, 'Stortinget');
  assert.strictEqual(ctx.source, 'mail');
}

{
  const ctx = bridge.resolveMailContext({ id: 'm2', phase_tag: 'workday', mail_class: 'daily_workday', subject: 'Skriv saken' });
  assert.strictEqual(ctx.place_id, 'pressehuset');
  assert.strictEqual(ctx.district_id, 'sentrum');
  assert.strictEqual(ctx.label, 'Redaksjonen');
  assert.strictEqual(ctx.purpose, 'work');
  assert.strictEqual(ctx.source, 'active_position');
}

{
  const ctx = bridge.resolveMailContext({ id: 'm3', phase_tag: 'morning', mail_class: 'daily_private' });
  assert.strictEqual(ctx.place_id, null);
  assert.strictEqual(ctx.district_id, 'sagene');
  assert.strictEqual(ctx.label, 'Hjemme i Sagene');
  assert.strictEqual(ctx.purpose, 'home');
}

{
  const ctx = bridge.resolveMailContext({ id: 'm4', phase_tag: 'evening', mail_class: 'daily_private', subject: 'Treff noen' });
  assert.strictEqual(ctx, null, 'bridge must not invent an evening place');
}

const runtimeItems = [
  { status: 'delivered', event: { id: 'now', subject: 'Møte redaktøren', phase_tag: 'workday', place_id: 'pressehuset', place_name: 'Pressehuset' } },
  { status: 'queued', event: { id: 'next', subject: 'Møte på Stortinget', phase_tag: 'afternoon', place_id: 'stortinget', place_name: 'Stortinget' } },
  { status: 'queued', event: { id: 'later', subject: 'Hjem og oppsummer', phase_tag: 'day_end', mail_class: 'daily_private' } }
];
global.CivicationDailyMailBuilder = { inspect() { return { runtime: { items: runtimeItems } }; } };
global.CivicationNextActionSelector = { getCurrent() { return { id: 'now', subject: 'Møte redaktøren', phase: 'workday' }; } };

{
  const plan = bridge.getDayPlan();
  assert.deepStrictEqual(plan.map((x) => x.state), ['now', 'next', 'later']);
  assert.deepStrictEqual(plan.map((x) => x.id), ['now', 'next', 'later']);
  assert.strictEqual(plan[0].map_context.place_id, 'pressehuset');
  assert.strictEqual(plan[1].map_context.place_id, 'stortinget');
  assert.strictEqual(plan[2].map_context.district_id, 'sagene');
}

{
  let store = {
    byId: { task_now: { id: 'task_now', mail_id: 'now', status: 'open' } },
    byMailId: { now: 'task_now' },
    order: ['task_now']
  };
  global.CivicationTaskEngine = {
    getStore() { return JSON.parse(JSON.stringify(store)); },
    setStore(next) { store = next; return next; },
    getTaskByMailId(mailId) { const id = store.byMailId[mailId]; return id ? store.byId[id] : null; }
  };
  const count = bridge.backfillOpenTaskContexts();
  assert.strictEqual(count, 1);
  assert.strictEqual(store.byId.task_now.map_context.place_id, 'pressehuset');
  assert.strictEqual(bridge.backfillOpenTaskContexts(), 0, 'backfill must be idempotent');
}

console.log('civication spatial day bridge ok');
