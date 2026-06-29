const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
function runScript(window, file) {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(code, window.__vmContext, { filename: file });
}
function createDom() {
  const dom = new JSDOM('<!doctype html><div id="caravanProfileSummary"></div>', { url: 'https://example.test/profile.html', runScripts: 'outside-only' });
  dom.window.__vmContext = dom.getInternalVMContext();
  dom.window.console = console;
  return dom;
}

(async () => {
  let dom = createDom();
  runScript(dom.window, 'js/caravan-profile.js');
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  dom.window.HG_CARAVAN_PROFILE_DEBUG.render();
  assert.match(dom.window.document.getElementById('caravanProfileSummary').textContent, /Karavanedata er ikke lastet ennå/);

  dom = createDom();
  const w = dom.window;
  w.HG_CARAVAN = {
    routes: [{ id: 'italia', title: 'Italia', subtitle: 'Oslo til Roma' }],
    stages: [{ id: 's1', route_id: 'italia' }, { id: 's2', route_id: 'italia' }],
    badges: [{ id: 'b1', title: 'Første steg' }, { id: 'b2', title: 'Valgets vei' }]
  };
  w.HG_CARAVAN_PROGRESS = {
    getAll: () => ({ progress: { italia: { s1: { hest: { status: 'completed', updatedAt: '2026-01-02T00:00:00.000Z' } }, s2: { sykkel: { status: 'completed', updatedAt: '2026-01-03T00:00:00.000Z' } } } } }),
    getRouteSummary: (routeId, mode) => ({ routeId, mode, completed: mode === 'hest' || mode === 'sykkel' ? 1 : 0, total: 2 })
  };
  w.HG_CARAVAN_EVENT_LOG = { getAll: () => ({ entries: [{ choice_id: 'help', travel_mode: 'hest', createdAt: '2026-01-04T00:00:00.000Z' }] }) };
  w.HG_CARAVAN_DIARY = { getEntries: () => [{ type: 'event_choice', title: 'Hendelsesvalg: hjalp bonden', createdAt: '2026-01-04T00:00:00.000Z' }, { type: 'consequence', title: 'Konsekvens brukt: Vann -10', createdAt: '2026-01-05T00:00:00.000Z' }] };
  w.HG_CARAVAN_BADGES = { summary: () => ({ total: 2, unlocked: 1 }), getUnlocked: () => ({ b1: { unlockedAt: '2026-01-06T00:00:00.000Z' } }), getAllBadges: () => w.HG_CARAVAN.badges };
  w.HG_CARAVAN_RESOURCES = { getAll: () => ({ resources: { italia: { hest: { energi: 80, vann: 90, hvile: 70, hestehelse: 95, utstyr: 100 } } } }) };
  runScript(w, 'js/caravan-profile.js');
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  w.HG_CARAVAN_PROFILE_DEBUG.render();
  const text = w.document.getElementById('caravanProfileSummary').textContent;
  assert.match(text, /Italia/);
  assert.match(text, /Hest: 1\/2 etapper fullført/);
  assert.match(text, /Sykkel: 1\/2 etapper fullført/);
  assert.match(text, /1\/2 låst opp/);
  assert.match(text, /1 valg logget/);
  assert.match(text, /Konsekvens brukt: Vann -10/);
  assert.match(text, /Energi 80/);
  assert.strictEqual(w.HG_CARAVAN_PROFILE_DEBUG.getSummary().stagesCompletedByMode.hest, 1);
  console.log('caravan-profile.test.js passed');
})();
