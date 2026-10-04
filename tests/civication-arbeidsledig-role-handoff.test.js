#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const source = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const role = read('data/Civication/lifestory/roles/arbeidsledig/role.json');
const catalog = read('data/Civication/lifePositionCatalog.json');
const bridges = role.symposium.rollebroer.filter((b) => Number.isFinite(b.threshold));
const manifest = read('data/Civication/narratives/manifest.json');
const streams = bridges.map((b) => read(b.narrative));
assert.equal(bridges.length, 19);
assert.equal(new Set(manifest.streams.map((s) => s.id)).size, manifest.streams.length);
for (let i = 0; i < bridges.length; i++) {
  const bridge = bridges[i], stream = streams[i];
  assert.equal(stream.schema, 'civication_narrative_stream_v1');
  assert.ok(manifest.streams.some((s) => s.path === bridge.narrative && s.id === stream.id));
}

function fixture() {
  const storage = new Map();
  const host = { children: [], querySelector() { return this.children.at(-1) || null; }, appendChild(child) { this.children.push(child); } };
  let suggestion = null;
  const document = {
    getElementById(id) { return id === 'activeJobCard' ? host : null; },
    createElement() {
      const controls = new Map();
      return { style: {}, innerHTML: '', setAttribute() {}, remove() { host.children = host.children.filter((c) => c !== this); },
        querySelector(selector) {
          if (selector === '[data-civi-life-suggestion-activate]' && !this.innerHTML.includes('data-civi-life-suggestion-activate')) return null;
          if (!controls.has(selector)) controls.set(selector, { listeners: {}, addEventListener(event, fn) { this.listeners[event] = fn; } });
          return controls.get(selector);
        }
      };
    }
  };
  const window = {
    CIVI_LIFE_POSITION_CATALOG: catalog,
    BADGES: catalog.badges.map((b) => ({ id: b.badge_id, name: b.badge_id, tiers: [] })),
    CivicationState: { getActivePosition() { return null; } },
    CivicationLifestoryUI: { getRoleSuggestion() { return suggestion; } },
    CivicationJsonStore: { async fetchJson(p) {
      if (p === 'data/Civication/narratives/manifest.json') return manifest;
      const i = bridges.findIndex((b) => b.narrative === p);
      return i >= 0 ? streams[i] : null;
    } },
    dispatchEvent() {}, addEventListener() {}, setTimeout() {}
  };
  const sandbox = vm.createContext({ window, document, console, Event: class {}, localStorage: {
    getItem(k) { return storage.get(k) || null; }, setItem(k, v) { storage.set(k, v); }
  } });
  for (const p of ['js/Civication/systems/civicationLifePositionRuntime.js', 'js/Civication/systems/civicationNarrativeSceneSource.js', 'js/Civication/ui/CivicationLifePositionUI.js']) vm.runInContext(source(p), sandbox);
  return { window, storage, host, suggest(b) { suggestion = b; window.CivicationLifePositionUI.render(); return host.children.at(-1); } };
}

(async () => {
  for (const bridge of bridges) {
    const f = fixture(), api = f.window.CivicationLifePositions, narrative = f.window.CivicationNarrativeSceneSource;
    const before = await narrative.getActivationSnapshot({ state: {}, active: null });
    assert.equal(before.matched_stream_ids.length, 0, 'et forslag alene åpner ingen narrativ');
    let block = f.suggest(bridge);
    assert.ok(block.innerHTML.includes('Ikke tilgjengelig ennå'));
    assert.equal(block.querySelector('[data-civi-life-suggestion-activate]'), null);
    assert.equal(api.activate(bridge.badge_id, bridge.navn).reason, 'life_position_locked');
    assert.equal(api.getLifeContext().primary_life_position, null);
    f.storage.set('merits_by_category', JSON.stringify({ [bridge.badge_id]: { points: bridge.threshold } }));
    block = f.suggest(bridge);
    assert.ok(block.innerHTML.includes('Tilgjengelig.'));
    assert.equal(api.getLifeContext().primary_life_position, null, 'visning aktiverer ikke identiteten');
    block.querySelector('[data-civi-life-suggestion-activate]').listeners.click();
    assert.equal(api.getLifeContext().primary_life_position.label, bridge.navn);
    assert.equal(api.getLifeContext().employment.formal_status, 'no_formal_job');
    const expected = read(bridge.narrative).id;
    const after = await narrative.getActivationSnapshot({ state: {}, active: null });
    assert.ok(after.matched_stream_ids.includes(expected), bridge.role_scope + ': aktiv rolle åpner riktig stream');
    const events = await narrative.getSourceScenes({ state: {}, active: null, phaseId: 'afternoon', candidate_stream_ids: [expected] });
    assert.ok(events.length, bridge.role_scope + ': riktig stream gir ekte scener');
    assert.equal(events[0].narrative_stream_id, expected);
    assert.equal(events[0].channel, 'private');
    assert.equal(events[0].career_id, '');
    assert.ok(events[0].choices.length >= 2);
    const reloaded = fixture();
    for (const [k, v] of f.storage) reloaded.storage.set(k, v);
    assert.equal(reloaded.window.CivicationLifePositions.getLifeContext().primary_life_position.label, bridge.navn);
  }
  const f = fixture();
  f.storage.set('merits_by_category', JSON.stringify({ by: { points: 5 }, naeringsliv: { points: 10 } }));
  assert.equal(f.window.CivicationLifePositions.activate('by', 'Byvandrer').ok, true);
  const bridge = bridges.find((b) => b.navn === 'Sideprosjektbygger');
  f.suggest(bridge).querySelector('[data-civi-life-suggestion-activate]').listeners.click();
  assert.equal(f.window.CivicationLifePositions.getLifeContext().active_life_positions.length, 2);
  assert.equal(f.window.CivicationLifePositions.getLifeContext().primary_life_position.label, 'Sideprosjektbygger');
  console.log('arbeidsledig role handoff ok: 19 locked/unlocked roles, explicit profile choice, actual private narrative events, reload and parallel roles');
})().catch((e) => { console.error(e); process.exitCode = 1; });
