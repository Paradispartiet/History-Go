#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function setupDom() {
  const elements = new Map();

  function createElement(id) {
    return {
      id,
      innerHTML: '',
      querySelector() { return null; },
      querySelectorAll() { return []; },
      classList: { toggle() {} }
    };
  }

  return {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElement(id));
      return elements.get(id);
    },
    addEventListener() {},
    readyState: 'complete'
  };
}

function run() {
  global.window = global;
  global.localStorage = { getItem() { return '[]'; } };
  global.Event = function Event(type) { this.type = type; };
  global.dispatchEvent = function () {};
  global.addEventListener = function () {};
  global.setTimeout = function (fn) { fn(); return 0; };
  global.CivicationMiniSectionsUI = { openPopup() {} };
  global.document = setupDom();

  const openWithChoices = {
    id: 'mail-open-1',
    status: 'open',
    resolved: false,
    event: {
      id: 'mail-open-1',
      source_type: 'workday',
      subject: 'Valg må tas',
      choices: [{ id: 'accept', label: 'Aksepter' }]
    }
  };

  const resolvedItem = {
    id: 'mail-resolved-1',
    status: 'resolved',
    resolved: true,
    event: {
      id: 'mail-resolved-1',
      source_type: 'workday',
      subject: 'Allerede avklart',
      choices: [{ id: 'noop', label: 'Ignorer' }]
    }
  };

  const inbox = [openWithChoices, resolvedItem];

  global.CivicationMailEngine = {
    getInbox() { return inbox; }
  };

  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/ui/CivicationInboxTopActionUI.js');

  const actionable = global.CivicationInboxTopActionUI.getActionable();
  assert.strictEqual(actionable.length, 1, 'status=open should be actionable');
  assert.strictEqual(actionable[0].id, 'mail-open-1', 'open item should be returned');

  global.CivicationInboxTopActionUI.renderSections();
  const html = global.document.getElementById('civiInbox').innerHTML;

  assert.ok(html.includes('1 åpne'), 'open count should include status=open item');
  assert.ok(html.includes('is-pending'), 'open item should render with is-pending class');
  assert.ok(html.includes('Åpen'), 'open item should render open status label');
  assert.ok(html.includes('data-civi-inbox-answer="1"'), 'open item with choices should render response button');

  console.log('PASS: Civication inbox open status rendering test completed.');
}

run();
