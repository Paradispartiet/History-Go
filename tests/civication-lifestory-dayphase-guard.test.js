#!/usr/bin/env node
// Life Story / Min dag owns the normal day surface. The legacy DayPhase UI may
// still run in explicit legacy/debug mode, but must not create or prepend its
// own panel when #civiLifestoryPanel is present in normal mode.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.parentElement = null;
    this.className = '';
    this._id = '';
    this._innerHTML = '';
  }
  set id(value) { this._id = String(value || ''); }
  get id() { return this._id; }
  set innerHTML(value) { this._innerHTML = String(value || ''); }
  get innerHTML() { return this._innerHTML; }
  get firstElementChild() { return this.children[0] || null; }
  get previousElementSibling() {
    if (!this.parentElement) return null;
    const index = this.parentElement.children.indexOf(this);
    return index > 0 ? this.parentElement.children[index - 1] : null;
  }
  get nextElementSibling() {
    if (!this.parentElement) return null;
    const index = this.parentElement.children.indexOf(this);
    return index >= 0 && index < this.parentElement.children.length - 1 ? this.parentElement.children[index + 1] : null;
  }
  insertBefore(child, anchor) {
    if (child.parentElement) {
      const oldIndex = child.parentElement.children.indexOf(child);
      if (oldIndex >= 0) child.parentElement.children.splice(oldIndex, 1);
    }
    child.parentElement = this;
    const anchorIndex = anchor ? this.children.indexOf(anchor) : -1;
    if (anchorIndex >= 0) this.children.splice(anchorIndex, 0, child);
    else this.children.push(child);
    return child;
  }
  appendChild(child) { return this.insertBefore(child, null); }
  addEventListener() {}
}

function collectHtml(element) {
  if (!element) return '';
  return String(element.innerHTML || '') + element.children.map(collectHtml).join('');
}

function findById(element, id) {
  if (!element) return null;
  if (element.id === id) return element;
  for (const child of element.children) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

function createDocument({ withLifestory }) {
  const root = new FakeElement('body');
  const panels = new FakeElement('main');
  panels.className = 'civi-panels';
  root.appendChild(panels);
  if (withLifestory) {
    const section = new FakeElement('section');
    section.id = 'civiLifestorySection';
    const panel = new FakeElement('div');
    panel.id = 'civiLifestoryPanel';
    panel.innerHTML = '<h3>NÅ</h3><p>Min dag</p>';
    section.appendChild(panel);
    panels.appendChild(section);
  }
  return {
    body: root,
    createElement: (tagName) => new FakeElement(tagName),
    getElementById: (id) => findById(root, id),
    querySelector: (selector) => selector === '.civi-panels' ? panels : null,
    addEventListener() {}
  };
}

function loadDayPhase({ legacyEnabled, withLifestory }) {
  const documentRef = createDocument({ withLifestory });
  global.window = global;
  global.document = documentRef;
  global.CIVICATION_LEGACY_ENABLED = legacyEnabled;
  global.addEventListener = function () {};
  global.CivicationDayProgression = {
    inspect: () => ({ phase: 'morning', phaseLabel: 'Morgen', dayIndex: 1, nextPhase: 'work', openItemsInPhase: 0 })
  };
  delete global.CivicationDayPhaseUI;
  const code = fs.readFileSync(path.join(repoRoot, 'js/Civication/ui/CivicationDayPhaseUI.js'), 'utf8');
  vm.runInThisContext(code, { filename: 'js/Civication/ui/CivicationDayPhaseUI.js' });
  return documentRef;
}

const html = fs.readFileSync(path.join(repoRoot, 'Civication.html'), 'utf8');
assert.ok(html.includes('id="civiLifestoryPanel"'), 'normal Civication.html includes Min dag panel');

const loader = require('../js/Civication/civicationShellLoader.js');
assert.ok(!loader.DAY_SCRIPTS.includes('js/Civication/ui/CivicationDayPhaseUI.js'), 'DayPhaseUI is not in standard DAY_SCRIPTS');
assert.ok(loader.LEGACY_DEBUG_SCRIPTS.includes('js/Civication/ui/CivicationDayPhaseUI.js'), 'DayPhaseUI is only available through legacy/debug loading');

let documentRef = loadDayPhase({ legacyEnabled: false, withLifestory: true });
assert.strictEqual(global.CivicationDayPhaseUI.render(), false, 'normal mode blocks DayPhaseUI when Min dag exists');
assert.ok(documentRef.getElementById('civiLifestoryPanel'), 'Min dag remains after day-load attempt');
assert.strictEqual(documentRef.getElementById('civiDayPhasePanel'), null, 'normal mode does not create civiDayPhasePanel');
assert.ok(!collectHtml(documentRef.body).includes('Dagens fase'), 'legacy Dagens fase text is not rendered in normal mode');

documentRef = loadDayPhase({ legacyEnabled: true, withLifestory: true });
assert.strictEqual(global.CivicationDayPhaseUI.render(), true, 'legacy/debug mode can render DayPhaseUI explicitly');
assert.ok(documentRef.getElementById('civiDayPhasePanel').innerHTML.includes('Dagens fase'), 'legacy/debug render still works');

for (const file of [
  'civicationMailEngine.js',
  'civicationDailyMailBuilder.js',
  'dayProgressionController.js',
  'civicationNextActionSelector.js',
  'civicationWorkdayRuntime.js',
  'civicationPrivatePhaseMailBuilder.js',
  'civicationWorkdayMailBuilder.js'
]) {
  assert.ok(loader.DAY_SCRIPTS.some((src) => src.endsWith(file)), `${file} still loads in day layer without owning main surface`);
}

console.log('civication lifestory/dayphase guard ok');
