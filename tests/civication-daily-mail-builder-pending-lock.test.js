#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

function setup(inbox) {
  global.window = global;
  global.document = { readyState: 'complete', addEventListener() {} };
  global.localStorage = { getItem() { return '[]'; }, setItem() {}, removeItem() {} };
  global.Event = function Event(type) { this.type = type; };
  global.dispatchEvent = function () {};
  global.addEventListener = function () {};
  global.CivicationMailEngine = { getInbox() { return inbox; } };
  global.CivicationState = { getInbox() { return inbox; }, getState() { return {}; }, setState() {} };
  global.CivicationEventEngine = function CivicationEventEngine() {};
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');
}

function run() {
  const staleStatusMail = {
    id: 'nav-status-1',
    status: 'pending',
    resolved: false,
    event: {
      id: 'nav-status-1',
      subject: 'Din sak er registrert',
      kind: 'Innkommende'
    }
  };

  setup([staleStatusMail]);
  assert.strictEqual(
    global.CivicationDailyMailBuilder.hasBlockingPendingAction(),
    false,
    'pending inbox items without choices must not block daily/job mail enqueue'
  );

  staleStatusMail.event.choices = [{ id: 'answer', label: 'Svar' }];
  assert.strictEqual(
    global.CivicationDailyMailBuilder.hasBlockingPendingAction(),
    true,
    'pending inbox items with choices still block until answered'
  );

  staleStatusMail.status = 'resolved';
  staleStatusMail.resolved = true;
  assert.strictEqual(
    global.CivicationDailyMailBuilder.hasBlockingPendingAction(),
    false,
    'resolved inbox items must not block daily/job mail enqueue'
  );

  console.log('PASS: Civication DailyMailBuilder pending lock test completed.');
}

run();
