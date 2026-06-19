#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function load(rel) { vm.runInThisContext(fs.readFileSync(path.join(repoRoot, rel), 'utf8'), { filename: rel }); }

const store = new Map();
global.window = global;
global.DEBUG = false;
global.Event = class Event { constructor(type) { this.type = type; } };
global.dispatchEvent = () => {};
global.localStorage = {
  getItem(key) { return store.has(key) ? store.get(key) : null; },
  setItem(key, value) { store.set(key, String(value)); },
  removeItem(key) { store.delete(key); }
};

load('js/Civication/systems/civicationEventChannels.js');
load('js/Civication/systems/civicationMailEngine.js');
load('js/Civication/systems/civicationIncomingFlow.js');

const flow = global.CivicationIncomingFlow;

flow.enqueueBatch([
  { id: 'job-1', subject: 'Task', source_type: 'workday', event_type: 'workday', task_id: 't1' },
  { id: 'job-2', subject: 'Boss', event_type: 'job_consequence' }
], { batch_id: 'work-am', batch_kind: 'workday', channel: 'job', phase_tag: 'work' });
assert.deepStrictEqual(flow.getPendingJobMails().map(item => item.event.id).sort(), ['job-1', 'job-2']);

flow.enqueueBatch([
  { id: 'priv-1', subject: 'Home', event_type: 'private_message' },
  { id: 'priv-2', subject: 'Evening', event_type: 'evening_problem' }
], { batch_id: 'eve', batch_kind: 'evening', channel: 'private', phase_tag: 'evening' });
assert.deepStrictEqual(flow.getPendingPrivateMessages().map(item => item.event.id).sort(), ['priv-1', 'priv-2']);

flow.enqueueBatch({ events: [{
  id: 'choice-work', source_type: 'workday', task_id: 't2', channel: 'job', event_type: 'workday',
  choices: [{ id: 'A', next_on_choice: 'follow-A' }, { id: 'B', followup_on_choice: 'follow-B' }, { id: 'C', triggers_on_choice: 'follow-C' }],
  followups: [
    { id: 'follow-A', subject: 'A result' },
    { id: 'follow-B', subject: 'B result', channel: 'job' },
    { id: 'follow-C', subject: 'C result' }
  ]
}] }, { channel: 'job', batch_kind: 'workday', phase_tag: 'work' });
assert.strictEqual(flow.enqueueFollowup('choice-work', 'A', { ok: true }).ok, true);
assert(flow.getPendingJobMails().some(item => item.event.id === 'follow-A'), 'workday followup should stay in job channel');
assert.strictEqual(global.CivicationEventChannels.getMessageChannel(flow.getInbox().find(item => item.event.id === 'follow-A').event), 'job');
assert.strictEqual(flow.enqueueFollowup('choice-work', 'B', { ok: true }).ok, true);
assert(flow.getPendingJobMails().some(item => item.event.id === 'follow-B'), 'choice B should trigger a distinct followup');

flow.enqueueBatch([{ id: 'private-choice', channel: 'private', phase_tag: 'evening', event_type: 'private_message', choices: [{ id: 'C', next_on_choice: 'private-follow' }], followups: [{ id: 'private-follow', subject: 'Private result', phase_tag: 'evening' }] }], { channel: 'private', batch_kind: 'private_arc', phase_tag: 'evening' });
flow.enqueueFollowup('private-choice', 'C', { ok: true });
assert(flow.getPendingPrivateMessages().some(item => item.event.id === 'private-follow'), 'private/evening followup should stay private');
assert.notStrictEqual(flow.getActiveWorkdayItem()?.event?.id, 'private-follow', 'private/evening followup must not become active workday');

const consequence = flow.normalizeConsequences(
  { delta: { autonomy: -1 }, brand_consequence: { delta: { trust: 2 } } },
  { consequences: { stress: 3 } },
  { consequences: { pc: 20 } }
);
assert.deepStrictEqual(consequence.delta, { autonomy: -1, trust: 2, stress: 3, pc: 20 });

flow.enqueueBatch([{ id: 'stagnation-mail', career_outcome: 'stagnation', subject: 'Standing still' }], { channel: 'job', event_type: 'milestone' });
assert.strictEqual(global.CivicationEventChannels.classifyEvent(flow.getInbox().find(item => item.event.id === 'stagnation-mail').event), 'milestone');
assert.strictEqual(global.CivicationEventChannels.getMessageChannel(flow.getInbox().find(item => item.event.id === 'stagnation-mail').event), 'job');

flow.enqueueBatch([{ id: 'debug-mail', source_type: 'debug', mail_type: 'status', subject: 'Debug' }], { channel: 'system', event_type: 'system' });
assert(!flow.getPendingPrivateMessages().some(item => item.event.id === 'debug-mail'), 'system/debug should not be private');
assert(global.CivicationEventChannels.splitInboxByMessageChannel(flow.getInbox()).system.some(item => item.event.id === 'debug-mail'));

console.log('civication-incoming-flow.test.js passed');
