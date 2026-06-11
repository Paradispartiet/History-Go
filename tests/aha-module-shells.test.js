const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Shared = require('../js/ahaModules.js');
const modules = [
  require('../js/ahaLists.js'),
  require('../js/ahaPaths.js'),
  require('../js/ahaGroups.js'),
  require('../js/ahaAvisa.js')
];

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName;
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.textContent = '';
  }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, handler) { this[`on${name}`] = handler; }
}

const fakeDocument = { createElement: (tagName) => new FakeElement(tagName, fakeDocument) };
const descendants = (element) => [element, ...(element.children || []).flatMap(descendants)];
const findText = (element, text) => descendants(element).find((child) => child.textContent === text);
const findClass = (element, className) => descendants(element).find((child) => child.className === className);

const expectations = [
  ['Lists', 'Organize saved AHA items.', 'Open lists', 'No lists yet.'],
  ['Paths', 'Build ordered learning routes.', 'Open paths', 'No paths yet.'],
  ['Groups', 'Group related AHA material.', 'Open groups', 'No groups yet.'],
  ['AHAavisa', 'Collect drafts and published AHA notes.', 'Open AHAavisa', 'No AHAavisa notes yet.']
];

modules.forEach((moduleRenderer, index) => {
  const element = new FakeElement('section', fakeDocument);
  const result = moduleRenderer.render(element, { items: [] });
  const [title, purpose, action, emptyState] = expectations[index];

  assert.strictEqual(result.status, 'empty', `${title} derives empty health from its existing item input`);
  assert(findText(element, title), `${title} renders its normalized title`);
  assert(findText(element, purpose), `${title} renders its short purpose`);
  assert(findText(element, 'Empty'), `${title} renders a textual health badge`);
  assert(findText(element, action), `${title} renders its normalized primary action label`);
  assert.strictEqual(findText(element, action).disabled, true, `${title} keeps unavailable actions disabled`);
  assert(findText(element, emptyState), `${title} renders its normalized empty state`);
  assert.strictEqual(element.attributes['aria-labelledby'], `${moduleRenderer.config.id}-title`);
  assert.strictEqual(findClass(element, 'aha-module-health aha-module-health--empty').attributes.role, 'status');
});

const contentElement = new FakeElement('section', fakeDocument);
modules[0].render(contentElement, {
  healthStatus: 'ready',
  items: [{ id: 'existing' }],
  primaryAction: { onClick() {} },
  renderContent(body) { body.appendChild(Object.assign(new FakeElement('article', fakeDocument), { textContent: 'Existing list content' })); },
  advancedDetails: ['Read-only module diagnostic.']
});
assert(findText(contentElement, 'Ready'), 'explicit existing module health is preserved');
assert(findText(contentElement, 'Existing list content'), 'existing module content can render inside the shell');
assert(findText(contentElement, 'Advanced details'), 'technical detail is placed in a collapsed details element');
assert.strictEqual(findText(contentElement, 'Advanced details').tagName, 'summary');

const errorElement = new FakeElement('section', fakeDocument);
modules[1].render(errorElement, { error: new Error('raw secret error') });
assert(findText(errorElement, 'Could not read module data.'), 'module read errors use normalized copy');
assert.strictEqual(descendants(errorElement).some((node) => node.textContent.includes('raw secret error')), false, 'raw errors are not rendered');

const missingElement = new FakeElement('section', fakeDocument);
modules[2].render(missingElement, { dataSourceAvailable: false });
assert(findText(missingElement, 'Missing'), 'missing module data has textual health');
assert(findText(missingElement, 'No module data found.'), 'missing data source uses normalized empty copy');

Shared.HEALTH_STATUSES.forEach((status) => {
  assert.strictEqual(Shared.normalizeHealthStatus(status), status, `supports ${status} module health`);
});
assert.strictEqual(Shared.normalizeHealthStatus('not-a-status'), 'unknown');

const sources = ['ahaModules.js', 'ahaLists.js', 'ahaPaths.js', 'ahaGroups.js', 'ahaAvisa.js']
  .map((file) => fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'))
  .join('\n');
assert.strictEqual(/autoSync|syncFromDatabase/.test(sources), false, 'module shells do not introduce auto-sync');
assert.strictEqual(/localStorage\.setItem/.test(sources), false, 'module shells do not persist UI state');
assert.strictEqual(/createClient\s*\(|\.from\s*\(/.test(sources), false, 'module shells do not create or query a database client');
assert.strictEqual(/writeAhaManualSyncAuditLog|syncHistoryGoPayload/.test(sources), false, 'module shells do not write audit or sync data');
assert.strictEqual(/JSON\.stringify/.test(sources), false, 'module shells do not dump full payloads or audit JSON');
assert.strictEqual(/(postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@|sk_live_|service_role\s*[:=])/.test(sources), false, 'module shells contain no credentials');

const homeSource = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
['ahaLists.js', 'ahaPaths.js', 'ahaGroups.js', 'ahaAvisa.js'].forEach((file) => {
  assert.strictEqual(homeSource.includes(file), false, `Home does not eagerly load ${file}`);
});

console.log('AHA module shell tests passed.');
