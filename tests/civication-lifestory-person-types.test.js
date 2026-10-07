const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const E = require('../js/Civication/lifestory/lifestoryEndings');
const root = path.join(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const manifest = read(C.MANIFEST_PATH), entry = manifest.roles.arbeidsledig;
const raw = { role: read(entry.role), roleThreads: read(entry.threads), roleScenes: read(entry.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions), lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes) };
const base = C.buildContent(raw);
const types = base.role.personer.filter(p => p.persontype);
const index = read('data/Civication/historyPeople_index.json');
const people = new Map(Object.values(index.categories).flat().map(p => [p.id, p]));
const routes = { lea: ['prosjekt', 'sideprosjekt_med_lea', 'sideprosjekt_neste_steg'],
  mira: ['musikk', 'musikk_med_mira', 'musikk_foresporselen'], amir: ['miljo', 'miljo_med_arvid', 'miljo_navnet_ditt'] };
function bridge(ids) {
  let stored = JSON.stringify(Object.fromEntries(ids.map(id => [id, true])));
  const sandbox = { window: { localStorage: { getItem: () => stored },
    fetch: async () => ({ ok: true, json: async () => clone(index) }) } };
  sandbox.localStorage = sandbox.window.localStorage;
  sandbox.fetch = sandbox.window.fetch;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/Civication/systems/civicationHistoryPeopleBridge.js'), 'utf8'), sandbox);
  const api = sandbox.window.CivicationHistoryPeopleBridge;
  api.setCollection = ids => { stored = JSON.stringify(Object.fromEntries(ids.map(id => [id, true]))); };
  api.stored = () => stored;
  return api;
}
let played = 0;
function play(type, id, b) {
  let content = base, state = S.createInitialState(content);
  S.bindPersonTypes(state, content, b);
  const cast = state.personRepresentanter?.[type.id] ? clone(state.personRepresentanter[type.id]) : null;
  const [route, first, second] = routes[type.id];
  let primary = null;
  globalThis.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: primary }) };
  const trace = [];
  for (let day = 1; day <= 13; day++) {
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, content);
      const choice = scene.id === 'd2_en_retning' ? route : scene.valg[0].id;
      R.applyChoice(state, content, scene.id, choice);
      trace.push([scene.id, choice]);
      state = clone(state);
      S.bindPersonTypes(state, content, b);
      if (cast) assert.deepEqual(state.personRepresentanter[type.id], cast, 'representative survives every reload');
      played++;
    }
    if (day === 13) break;
    if (day === 7 || day === 10) {
      const descriptor = content.role.symposium.fortsettelser.find(n => n.id === (day === 7 ? first : second));
      const role = content.role.symposium.rollebroer.find(p => p.role_scope === descriptor.role_scope);
      primary = { label: role.navn, badge_id: role.badge_id };
      const previous = JSON.stringify(state.arkiv), ending = E.resolveEnding(state, content);
      const next = C.appendContinuation(content, read(descriptor.path));
      R.startContinuation(state, content, next, descriptor.id, ending);
      assert.equal(JSON.stringify(state.arkiv), previous, 'new chapters preserve the exact archive');
      content = next;
    } else R.startNextDay(state, content);
  }
  if (id) {
    assert.equal(state.personRepresentanter[type.id].personId, id);
    assert.ok(state.arkiv.some(a => a.personRepresentanter?.[type.id]?.personId === id));
    assert.ok(JSON.stringify(state.arkiv).includes(people.get(id).name));
    assert.ok(!/\b(?:Lea|Mira|Arvid)\b/.test(JSON.stringify(state.arkiv)));
  }
  return { trace, state, content };
}

(async () => {
  assert.deepEqual(types.map(p => p.persontype.id).sort(), ['medmusiker', 'miljokontakt', 'prosjektbygger']);
  const all = types.flatMap(p => p.persontype.representanter);
  assert.equal(new Set(all).size, 6);
  for (const id of all) assert.ok(people.has(id), 'explicit candidate exists in canonical History Go index: ' + id);
  const empty = bridge([]); await empty.load();
  const unrelated = bridge(['munch']); await unrelated.load();
  let blank = S.createInitialState(base); S.bindPersonTypes(blank, base, unrelated);
  assert.equal(blank.personRepresentanter, undefined, 'an unrelated collected person cannot fill a type');
  for (const type of types) {
    const reference = play(type, null, empty);
    for (const id of type.persontype.representanter) {
      const b = bridge([id]); await b.load();
      const originalCollection = b.stored();
      const result = play(type, id, b);
      assert.deepEqual(result.trace, reference.trace, 'actor does not change gameplay');
      for (const field of ['tidligereValg', 'meters', 'relasjoner', 'threadState', 'fortsettelser']) {
        assert.deepEqual(result.state[field], reference.state[field], 'same story mechanics: ' + field);
      }
      const before = clone(result.state.personRepresentanter[type.id]), archive = JSON.stringify(result.state.arkiv);
      assert.equal(b.stored(), originalCollection, 'story binding never writes the collection');
      b.setCollection(all.filter(candidate => candidate !== id));
      S.bindPersonTypes(result.state, result.content, b);
      assert.deepEqual(result.state.personRepresentanter[type.id], before, 'new/lost collection cannot recast the story');
      assert.equal(JSON.stringify(result.state.arkiv), archive);
      assert.equal(originalCollection, JSON.stringify({ [id]: true }), 'bridge only reads History Go collection');
      const legacy = clone(reference.state); delete legacy.personRepresentanter;
      for (const e of legacy.arkiv) delete e.personRepresentanter;
      legacy.arkiv[0].sceneTittel = 'Tidligere møte med Lea, Mira og Arvid';
      const old = JSON.stringify(legacy.arkiv);
      S.bindPersonTypes(legacy, result.content, b);
      assert.equal(JSON.stringify(legacy.arkiv), old, 'legacy prose is never rewritten');
      assert.equal(legacy.personRepresentanter[type.id].personId, null, 'legacy events are not retroactively attributed');
    }
  }
  const b = bridge(all); await b.load();
  blank = S.createInitialState(base); S.bindPersonTypes(blank, base, b);
  assert.equal(S.presentText(blank, base, 'Prosjektbyggerens skisse; medmusikeren; miljøkontakten.'),
    'Jens Jacob Jensens skisse; Bugge Wesseltoft; Attila Horvath.');
  assert.equal(S.presentText(blank, base, 'prosjektet_og_lea'), 'prosjektet_og_lea', 'technical IDs remain untouched');
  for (const mutate of [p => p.representanter.push(p.representanter[0]), p => p.representanter = [], p => p.id = 'invalid type']) {
    const bad = clone(raw); mutate(bad.role.personer.find(p => p.id === 'lea').persontype);
    assert.throws(() => C.buildContent(bad), /persontype/);
  }

  // Actual production Content/State/Runner/Bridge/UI, including async boot.
  const dom = new JSDOM('<section id="civiLifestoryPanel"></section>', { url: 'https://example.test/Civication.html', runScripts: 'outside-only' });
  const w = dom.window;
  w.localStorage.setItem('people_collected', JSON.stringify({ mari_boine: true, sossen_krohg: true, peter_emil_steen: true }));
  const collected = w.localStorage.getItem('people_collected');
  w.fetch = async url => ({ ok: true, json: async () => read(String(url)) });
  for (const file of ['js/Civication/lifestory/lifestoryContent.js', 'js/Civication/lifestory/lifestoryState.js',
    'js/Civication/lifestory/lifestoryRunner.js', 'js/Civication/lifestory/lifestoryEndings.js',
    'js/Civication/systems/civicationHistoryPeopleBridge.js', 'js/Civication/ui/CivicationLifestoryUI.js']) w.eval(fs.readFileSync(path.join(root, file), 'utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  const tick = () => new Promise(resolve => setImmediate(resolve));
  for (let i = 0; i < 100 && !w.CivicationLifestoryState.load()?.personRepresentanter; i++) await tick();
  const saved = w.CivicationLifestoryState.load();
  assert.equal(saved.personRepresentanter.mira.personId, 'mari_boine');
  assert.equal(saved.personRepresentanter.amir.personId, 'sossen_krohg');
  assert.equal(saved.personRepresentanter.lea.personId, 'peter_emil_steen');
  const panel = w.document.getElementById('civiLifestoryPanel');
  assert.ok(panel.textContent.includes('Type: Medmusikeren'));
  assert.ok(panel.textContent.includes('Mari Boine'));
  assert.ok(panel.textContent.includes('Sossen Krohg'));
  assert.ok(panel.textContent.includes('Peter Emil Steen'));
  assert.ok(!/\b(?:Lea|Mira|Arvid)\b/.test(panel.textContent));
  // Move through real buttons to the first actual music call.
  for (let guard = 0; guard < 50; guard++) {
    const info = w.CivicationLifestoryUI.getCurrentSceneInfo();
    if (info.sceneId === 'd3_mira_telefon') break;
    const btn = panel.querySelector(info.dagFerdig ? '[data-lifestory-next-day]'
      : info.sceneId === 'd2_en_retning' ? '[data-lifestory-choice="musikk"]' : '[data-lifestory-choice]');
    assert.ok(btn); btn.click();
  }
  assert.equal(w.CivicationLifestoryUI.getCurrentSceneInfo().sceneId, 'd3_mira_telefon');
  assert.ok(panel.querySelector('.civi-lifestory-scene').textContent.includes('Mari Boine'));
  assert.ok(panel.textContent.includes('Dramatisert historie'));
  const before = w.localStorage.getItem(S.STORAGE_KEY);
  w.CivicationLifestoryUI.render(); w.CivicationLifestoryUI.render();
  assert.equal(w.localStorage.getItem(S.STORAGE_KEY), before, 'render is read-only');
  assert.equal(w.localStorage.getItem('people_collected'), collected, 'Civication never writes collection');
  while (!w.CivicationLifestoryState.load().dagFerdig) panel.querySelector('[data-lifestory-choice]').click();
  panel.querySelector('[data-lifestory-restart]').click();
  for (let i = 0; i < 100 && !w.CivicationLifestoryState.load()?.personRepresentanter; i++) await tick();
  const fresh = w.CivicationLifestoryState.load();
  assert.equal(fresh.dag, 1);
  assert.equal(fresh.arkiv.length, 0);
  assert.equal(fresh.personRepresentanter.mira.personId, 'mari_boine', 'restart binds the current collection again');
  dom.window.close(); delete globalThis.CivicationLifePositions;
  // Real choice-only references from the review: display their disclosure
  // before selecting, in feedback and in the summary after reloading.
  // Choosing the other option must not invent a person event.
  for (const fixture of [
    { chapters: ['frilans_med_lea', 'frilans_neste_steg'], scene: 'd13_frilans_vurdering', choice: 'avslutt',
      type: 'lea', person: 'peter_emil_steen', flag: 'frilans_neste_valg', value: 'undersok' },
    { chapters: ['miljo_med_arvid', 'miljo_navnet_ditt'], scene: 'd13_arvid_rettet', choice: 'trekk',
      type: 'amir', person: 'sossen_krohg', flag: 'arvid_utkast12', value: 'rettet' }
  ]) {
    let active = base;
    for (const id of fixture.chapters) active = C.appendContinuation(active, read(base.role.symposium.fortsettelser.find(p => p.id === id).path));
    const scene = active.scenes.find(s => s.id === fixture.scene), type = types.find(p => p.id === fixture.type);
    assert.equal(S.sceneMentionsPerson(scene, type), false);
    assert.equal(S.sceneMentionsPerson(scene, type, scene.valg.find(c => c.id === fixture.choice)), true);
    for (const choice of scene.valg) {
      const fixtureState = S.createInitialState(active), fixtureBridge = bridge([fixture.person]);
      await fixtureBridge.load(); S.bindPersonTypes(fixtureState, active, fixtureBridge);
      Object.assign(fixtureState, { dag: 13, fase: scene.fase, fortsettelser: fixture.chapters,
        fortsettelseId: fixture.chapters.at(-1), spilteScener: active.scenes.filter(s => s.id !== scene.id).map(s => s.id) });
      fixtureState.tidligereValg[fixture.flag] = fixture.value;
      fixtureState.threadState[scene.threadId] = { status: 'active', step: 0, lastSceneId: null };
      const role = active.role.symposium.rollebroer.find(p => p.role_scope === active.fortsettelse.role_scope);
      async function boot(savedState) {
        const d = new JSDOM('<section id="civiLifestoryPanel"></section>', { url: 'https://example.test/Civication.html', runScripts: 'outside-only' });
        const win = d.window;
        win.localStorage.setItem(S.STORAGE_KEY, JSON.stringify(savedState));
        win.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: { label: role.navn, badge_id: role.badge_id } }) };
        win.fetch = async url => ({ ok: true, json: async () => read(String(url)) });
        for (const file of ['lifestoryContent', 'lifestoryState', 'lifestoryRunner', 'lifestoryEndings']) win.eval(fs.readFileSync(path.join(root, 'js/Civication/lifestory/' + file + '.js'), 'utf8'));
        win.eval(fs.readFileSync(path.join(root, 'js/Civication/ui/CivicationLifestoryUI.js'), 'utf8'));
        win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
        for (let i = 0; i < 100 && !win.CivicationLifestoryUI.getCurrentSceneInfo(); i++) await tick();
        return d;
      }
      const d = await boot(fixtureState), win = d.window, p = win.document.getElementById('civiLifestoryPanel');
      assert.equal(win.CivicationLifestoryUI.getCurrentSceneInfo().sceneId, scene.id);
      assert.ok(p.querySelector('.civi-lifestory-scene [data-lifestory-dramatized]'), 'choice-only reference is disclosed before selection');
      p.querySelector('[data-lifestory-choice="' + choice.id + '"]').click();
      const namesPerson = choice.id === fixture.choice;
      assert.equal(!!p.querySelector('.civi-lifestory-konsekvens [data-lifestory-dramatized]'), namesPerson);
      assert.equal(!!p.querySelector('.civi-lifestory-summary > [data-lifestory-dramatized]'), namesPerson);
      const saved = win.CivicationLifestoryState.load();
      assert.equal(!!saved.arkiv.at(-1).personRepresentanter?.[fixture.type], namesPerson, 'unchosen references are not archived');
      const ending = win.CivicationLifestoryEndings.resolveEnding(saved, active);
      const authoredEnding = active.role.endings.find(e => e.id === ending.id);
      const endingNamesPerson = S.sceneMentionsPerson({ tittel: authoredEnding.navn, tekst: authoredEnding.tekst }, type);
      assert.equal(!!p.querySelector('.civi-lifestory-ending [data-lifestory-dramatized]'), endingNamesPerson, 'the ending discloses its own person references');
      if (namesPerson) assert.ok(p.querySelector('.civi-lifestory-konsekvens').textContent.includes(people.get(fixture.person).name));
      d.window.close();
      const reloaded = await boot(saved);
      assert.equal(!!reloaded.window.document.querySelector('.civi-lifestory-summary > [data-lifestory-dramatized]'), namesPerson, 'summary disclosure survives reload');
      assert.equal(!!reloaded.window.document.querySelector('.civi-lifestory-ending [data-lifestory-dramatized]'), endingNamesPerson, 'ending disclosure survives reload');
      reloaded.window.close();
    }
  }
  console.log(`Person types: 6 canonical representatives, 9 complete day-13 journeys, ${played} choices; frozen cast, legacy archives and actual DOM verified.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
