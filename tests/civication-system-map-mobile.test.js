// The 3D city must remain readable beneath the system map controls on phones.
// UI-only defaults: no change to places, story, calendar or click targets.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/Civication/ui/CivicationSystemMap.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/civi-system-map.css'), 'utf8');

function initAtWidth(width) {
  const events = new Map();
  const win = {
    innerWidth: width,
    addEventListener: (name, fn) => events.set(name, fn)
  };
  const doc = { addEventListener: () => {} };
  vm.runInNewContext(source, {
    window: win, document: doc,
    clearTimeout: () => {},
    setTimeout: () => 1
  });
  const state = () => JSON.parse(JSON.stringify(win.CivicationSystemMap.getPresentationState()));
  return { win, events, state };
}

test('mobile map starts with HUD and zone details minimized', () => {
  const { state } = initAtWidth(390);
  assert.deepEqual(state(), { hudMinimized: true, panelMinimized: true, zonesHidden: true });
});

test('desktop preserves expanded information cards', () => {
  const { state } = initAtWidth(1024);
  assert.deepEqual(state(), { hudMinimized: false, panelMinimized: false, zonesHidden: true });
});

test('untouched map controls adapt when viewport changes size', () => {
  const { win, events, state } = initAtWidth(1024);
  win.innerWidth = 390;
  events.get('resize')();
  assert.equal(state().hudMinimized, true);
  assert.equal(state().panelMinimized, true);
  win.innerWidth = 1024;
  events.get('resize')();
  assert.equal(state().hudMinimized, false);
  assert.equal(state().panelMinimized, false);
});

test('mobile minimized controls leave the map and zoom controls accessible', () => {
  assert.match(source, /hudTouched=true;hudMinimized=!hudMinimized/);
  assert.match(source, /panelTouched=true;panelMinimized=!panelMinimized/);
  assert.match(source, /Sone · \$\{esc\(zone.name\)\}/);
  assert.match(css, /@media \(max-width:740px\)/);
  assert.match(css, /is-hud-minimized \.civi-system-title strong\{\s*display:none/);
  assert.match(css, /\.civi-system-close\{\s*top:62px;\s*right:12px;\s*bottom:auto;/);
  assert.match(css, /\.civi-system-panel\.is-minimized\{\s*left:10px;\s*right:auto;/);
});
