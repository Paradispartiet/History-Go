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

console.log('civication-ui-workday-helper.test.js passed');
