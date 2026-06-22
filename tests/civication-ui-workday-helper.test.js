#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

global.window = global;
global.document = {
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
global.localStorage = {
  getItem() { return null; },
  setItem() {},
  removeItem() {}
};
global.Event = function Event(type) { this.type = type; };
global.addEventListener = function () {};

const channelsFile = path.join(__dirname, '..', 'js/Civication/systems/civicationEventChannels.js');
vm.runInThisContext(fs.readFileSync(channelsFile, 'utf8'), { filename: channelsFile });
const uiFile = path.join(__dirname, '..', 'js/Civication/ui/CivicationUI.js');
vm.runInThisContext(fs.readFileSync(uiFile, 'utf8'), { filename: uiFile });

function setInbox(inbox) {
  global.CivicationMailEngine = { getInbox: () => inbox };
  global.CivicationState = {
    getInbox: () => inbox,
    getActivePosition: () => ({ title: 'Ekspeditør', brand_name: 'Testbutikk' }),
    getState: () => ({ career: { progress: {}, contract: {} } })
  };
}

setInbox([
  { status: 'pending', event: { id: 'private-evening', source_type: 'life', phase_tag: 'evening', subject: 'Kveld' } },
  { status: 'pending', event: { id: 'workday-1', source_type: 'workday', task_domain: 'cash_desk', subject: 'Kasse' } }
]);
assert.strictEqual(global.CivicationUI.getActiveWorkdayInboxItem().event.id, 'workday-1');

setInbox([
  { status: 'pending', event: { id: 'private-evening', source_type: 'life', phase_tag: 'evening', subject: 'Kveld' } }
]);
assert.strictEqual(global.CivicationUI.getActiveWorkdayInboxItem(), null);

setInbox([
  { status: 'pending', event: { id: 'job-task-mail', channel: 'job', task_id: 'task-2', subject: 'Arbeidsoppgave' } }
]);
assert.strictEqual(global.CivicationUI.getActiveWorkdayInboxItem().event.id, 'job-task-mail');

// --- read-only workday snapshot ---

// exposed both on CivicationUI and as the registered global
assert.strictEqual(typeof global.CivicationUI.getCurrentWorkdaySnapshot, 'function', 'snapshot exported on CivicationUI');
assert.strictEqual(global.HG_CiviWorkdaySnapshot, global.CivicationUI.getCurrentWorkdaySnapshot, 'global aliases the same fn');

// active job: snapshot mirrors the workday model fields the panel renders
setInbox([
  { status: 'pending', event: { id: 'workday-1', source_type: 'workday', task_id: 'task-9', subject: 'Kasse', situation: ['Lang kø ved kassa.'] } }
]);
global.CivicationState.getState = () => ({
  stability: 'WARNING',
  career: { progress: { answeredCount: 2, expectedCount: 5, completionRate: 0.4, daysSinceStart: 4 }, contract: { fireAfterDays: 14 } }
});
const snap = global.HG_CiviWorkdaySnapshot();
assert.strictEqual(snap.hasActiveJob, true, 'has active job');
assert.strictEqual(snap.roleLabel, 'Ekspeditør', 'role label');
assert.strictEqual(snap.placeLabel, 'Testbutikk', 'place/brand label');
assert.strictEqual(snap.statusLabel, 'Advarsel', 'WARNING -> Advarsel');
assert.strictEqual(snap.taskTitle, 'Kasse', 'task title from event subject');
assert.strictEqual(snap.taskDescription, 'Lang kø ved kassa.', 'description from situation');
assert.deepStrictEqual(snap.weekProgress, { answered: 2, expected: 5, pct: 40 }, 'week progress');
assert.strictEqual(snap.contractPressure.daysLeft, 10, 'days left = 14 - 4');
assert.strictEqual(snap.pendingEvent.id, 'workday-1', 'pending event surfaced');

// no active job: snapshot still returns a safe shape (no throw, hasActiveJob false)
global.CivicationState.getActivePosition = () => null;
const empty = global.HG_CiviWorkdaySnapshot();
assert.strictEqual(empty.hasActiveJob, false, 'no active job -> false');
assert.strictEqual(empty.roleLabel, '—', 'no role label');
assert.ok(empty.weekProgress && empty.contractPressure, 'shape intact when no job');

console.log('civication-ui-workday-helper.test.js passed');
