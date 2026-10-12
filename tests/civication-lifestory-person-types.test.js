'use strict';

// A collected History Go person must never perform fictional Civication acts.
// Preserve old saved archives, scene IDs, choices and actor relationships.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');

const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const manifest = read(C.MANIFEST_PATH);
const entry = manifest.roles.arbeidsledig;
const raw = {
  role: read(entry.role), roleThreads: read(entry.threads), roleScenes: read(entry.scenes),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
};
const base = C.buildContent(raw);
const types = base.role.personer.filter(p => p.persontype);
const aliases = { mira: 'Mira', lea: 'Lea', amir: 'Arvid' };

(async () => {
  assert.deepEqual(types.map(p => p.id).sort(), ['amir', 'lea', 'mira']);
  assert.deepEqual(Object.fromEntries(types.map(p => [p.id, p.fiktivtNavn])), aliases);
  assert.ok(types.every(p => !("representanter" in p.persontype)), 'fictional role data must contain no historical candidate IDs');
  const invalid = clone(raw);
  invalid.role.personer.find(p => p.id === 'mira').persontype.representanter = ['mari_boine'];
  assert.throws(() => C.buildContent(invalid), /persontype/, 'mixed fictional/historical cast must fail validation');

  // No runtime lookup from collected People, even if the former bridge exists.
  let bridgeCalls = 0;
  const forbiddenBridge = {
    getCollectedByIds() { bridgeCalls++; throw new Error('Historical People must not be cast'); },
    load() { bridgeCalls++; throw new Error('Historical People must not be loaded for Life Story'); }
  };
  const blank = S.createInitialState(base);
  const mechanics = clone({ relasjoner: blank.relasjoner, meters: blank.meters, tidligereValg: blank.tidligereValg });
  S.bindPersonTypes(blank, base, forbiddenBridge);
  assert.equal(bridgeCalls, 0);
  for (const person of types) {
    const cast = blank.personRepresentanter[person.id];
    assert.equal(cast.kind, 'fictional');
    assert.equal(cast.personId, null);
    assert.equal(cast.navn, aliases[person.id]);
    assert.equal(cast.typeId, person.persontype.id);
  }
  assert.deepEqual({ relasjoner: blank.relasjoner, meters: blank.meters, tidligereValg: blank.tidligereValg }, mechanics);

  // Visible names are consistent, including Norwegian possessive forms.
  assert.equal(S.presentText(blank, base, 'Medmusikeren og medmusikerens skisse; prosjektbyggeren og prosjektbyggerens idé; miljøkontakten og miljøkontaktens brev.'),
    'Mira og Miras skisse; Lea og Leas idé; Arvid og Arvids brev.');
  assert.equal(S.presentText(blank, base, 'prosjektet_og_lea'), 'prosjektet_og_lea', 'internal IDs must remain unchanged');
  assert.equal(S.presentText(blank, base, 'miljoet_og_miljøkontakten'), 'miljoet_og_miljøkontakten', 'internal namespaced IDs remain unchanged');
  assert.equal(S.presentText(blank, base, 'Mira, Lea og Arvid'), 'Mira, Lea og Arvid');
  for (const p of types) {
    assert.ok(S.sceneMentionsPerson({ avsender: p.id, tittel: 'Test', tekst: 'En ny avtale' }, p));
    assert.ok(S.sceneMentionsPerson({ avsender: null, tekst: 'Samtalen med ' + p.fiktivtNavn }, p));
  }

  // A legacy save may have already displayed a genuine historical person's
  // name as the fiction actor. Preserve every byte of the old archive entry.
  const legacy = S.createInitialState(base);
  legacy.personRepresentanter = {
    mira: { typeId: 'medmusiker', personId: 'mari_boine', navn: 'Mari Boine', placeId: 'oslo', beskrivelse: 'Ekte person' },
    lea: { typeId: 'prosjektbygger', personId: 'peter_emil_steen', navn: 'Peter Emil Steen' },
    amir: { typeId: 'miljokontakt', personId: 'sossen_krohg', navn: 'Sossen Krohg' }
  };
  const previousEntry = {
    dag: 3, fase: 'formiddag', sceneId: 'd3_mira_telefon', sceneTittel: 'Mari Boine spør',
    threadId: 'musikken_og_mira', valgId: 'ja', valgTekst: 'Svar Mari Boine',
    konsekvensTekst: 'Tidligere dialog med Mari Boine',
    personRepresentanter: { mira: clone(legacy.personRepresentanter.mira) }
  };
  legacy.arkiv = [previousEntry];
  legacy.spilteScener = ['d3_mira_telefon'];
  const originalArchive = JSON.stringify(legacy.arkiv);
  const originalChoiceState = JSON.stringify(legacy.tidligereValg);
  const originalRelations = JSON.stringify(legacy.relasjoner);
  S.bindPersonTypes(legacy, base, forbiddenBridge);
  S.bindPersonTypes(legacy, base, forbiddenBridge);
  assert.equal(bridgeCalls, 0);
  assert.equal(JSON.stringify(legacy.arkiv), originalArchive, 'legacy archive must never be rewritten');
  assert.equal(JSON.stringify(legacy.tidligereValg), originalChoiceState);
  assert.equal(JSON.stringify(legacy.relasjoner), originalRelations);
  for (const [id, name] of Object.entries(aliases)) {
    assert.equal(legacy.personRepresentanter[id].personId, null);
    assert.equal(legacy.personRepresentanter[id].navn, name);
  }
  const historicalTimeline = R.getSymposium(legacy, base).tidslinje.find(x => x.sceneId === previousEntry.sceneId);
  assert.equal(historicalTimeline.sceneTittel, previousEntry.sceneTittel);
  assert.equal(historicalTimeline.person.navn, 'Mari Boine', 'old timeline retains its original actor snapshot');

  // The same player choices are executable independently of all collected People.
  function playFirstWeek(direction) {
    const state = S.createInitialState(base);
    S.bindPersonTypes(state, base, forbiddenBridge);
    while (true) {
      while (!state.dagFerdig) {
        const scene = R.selectNextScene(state, base);
        assert.ok(scene, 'scene exists on day ' + state.dag);
        const selection = scene.id === 'd2_en_retning' ? direction : scene.valg[0].id;
        R.applyChoice(state, base, scene.id, selection);
        if (scene.id === 'd3_mira_telefon') {
          assert.ok(state.arkiv.at(-1).sceneTittel.includes('Mira'));
          assert.equal(state.arkiv.at(-1).personRepresentanter?.mira?.personId, null);
        }
      }
      if (state.dag === 7) return state;
      R.startNextDay(state, base);
    }
  }
  for (const direction of ['musikk', 'prosjekt', 'miljo']) {
    const state = playFirstWeek(direction);
    assert.equal(state.dag, 7);
    assert.ok(state.arkiv.length > 10);
    assert.ok(Object.values(state.personRepresentanter).every(x => x.personId === null));
  }
  assert.equal(bridgeCalls, 0);

  // All existing continuations use the same renderer and the three fixed
  // identities. Raw JSON identifiers, conditions and effects are untouched.
  const packs = base.role.symposium.fortsettelser.map(descriptor => read(descriptor.path));
  assert.equal(packs.length, 45);
  for (const pack of packs) {
    for (const scene of pack.scenes) {
      const before = clone(scene);
      for (const value of [scene.tittel, scene.tekst, ...scene.valg.flatMap(v => [v.tekst, v.konsekvensTekst])]) {
        const shown = S.presentText(blank, base, value);
        assert.ok(!shown.includes('Mari Boine') && !shown.includes('Sossen Krohg') && !shown.includes('Peter Emil Steen'));
      }
      assert.deepEqual(scene, before);
    }
  }

  // Full browser load works without the historical People bridge. Even with
  // collected People present, fiction stays fiction, including after reload.
  const dom = new JSDOM('<section id="civiLifestoryPanel"></section>', {
    url: 'https://example.test/Civication.html', runScripts: 'outside-only'
  });
  const w = dom.window;
  const savedCollection = JSON.stringify({ mari_boine: true, sossen_krohg: true, peter_emil_steen: true });
  w.localStorage.setItem('people_collected', savedCollection);
  const requested = [];
  w.fetch = async url => {
    requested.push(String(url));
    assert.ok(!String(url).includes('historyPeople_index'), 'Life Story must not fetch historical cast');
    return { ok: true, json: async () => read(String(url)) };
  };
  for (const file of [
    'js/Civication/lifestory/lifestoryContent.js',
    'js/Civication/lifestory/lifestoryState.js',
    'js/Civication/lifestory/lifestoryRunner.js',
    'js/Civication/lifestory/lifestoryEndings.js',
    'js/Civication/ui/CivicationLifestoryUI.js'
  ]) w.eval(fs.readFileSync(path.join(root, file), 'utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  const tick = () => new Promise(resolve => setImmediate(resolve));
  for (let i=0;i<150 && !w.CivicationLifestoryUI.getCurrentSceneInfo();i++) await tick();
  const panel = w.document.getElementById('civiLifestoryPanel');
  for (let guard=0;guard<60;guard++) {
    const info=w.CivicationLifestoryUI.getCurrentSceneInfo();
    assert.ok(info,'browser booted');
    if(info.sceneId==='d3_mira_telefon')break;
    const button=panel.querySelector(info.dagFerdig?'[data-lifestory-next-day]'
      :info.sceneId==='d2_en_retning'?'[data-lifestory-choice="musikk"]':'[data-lifestory-choice]');
    assert.ok(button,'playable choice/day '+info.sceneId);button.click();
  }
  assert.equal(w.CivicationLifestoryUI.getCurrentSceneInfo().sceneId,'d3_mira_telefon');
  assert.ok(panel.querySelector('.civi-lifestory-scene').textContent.includes('Mira'));
  assert.ok(panel.textContent.includes('Mira'));
  assert.ok(!panel.textContent.includes('Mari Boine'));
  assert.ok(!panel.textContent.includes('Dramatisert historie med History Go-personer'));
  assert.equal(w.localStorage.getItem('people_collected'), savedCollection);
  const presentBefore = w.localStorage.getItem(S.STORAGE_KEY);
  w.CivicationLifestoryUI.render();
  assert.equal(w.localStorage.getItem(S.STORAGE_KEY), presentBefore, 'render must be pure');
  assert.ok(requested.length && requested.every(p => !p.includes('historyPeople_index')));
  dom.window.close();

  // Old save imported into the actual browser UI: archive remains literal and
  // shows a separate disclosure rather than treating real People as new cast.
  const previous = clone(legacy);
  previous.personRepresentanter = {
    mira: { typeId: 'medmusiker', personId: 'mari_boine', navn: 'Mari Boine' }
  };
  const legacyDom = new JSDOM('<section id="civiLifestoryPanel"></section>', {
    url: 'https://example.test/Civication.html', runScripts: 'outside-only'
  });
  const oldWin = legacyDom.window;
  oldWin.localStorage.setItem(S.STORAGE_KEY, JSON.stringify(previous));
  oldWin.fetch=async url=>({ok:true,json:async()=>read(String(url))});
  for(const file of [
    'js/Civication/lifestory/lifestoryContent.js',
    'js/Civication/lifestory/lifestoryState.js',
    'js/Civication/lifestory/lifestoryRunner.js',
    'js/Civication/lifestory/lifestoryEndings.js',
    'js/Civication/ui/CivicationLifestoryUI.js'
  ]) oldWin.eval(fs.readFileSync(path.join(root,file),'utf8'));
  oldWin.document.dispatchEvent(new oldWin.Event('DOMContentLoaded'));
  for (let i=0;i<150 && !oldWin.CivicationLifestoryUI.getCurrentSceneInfo();i++) await tick();
  const oldPanel=oldWin.document.getElementById('civiLifestoryPanel');
  assert.ok(oldPanel.textContent.includes('Mari Boine'), 'archive text is displayed literally');
  assert.ok(oldPanel.querySelector('[data-lifestory-legacy-people]'), 'explain archival history-person legacy');
  const stored=oldWin.CivicationLifestoryState.load();
  assert.equal(JSON.stringify(stored.arkiv),originalArchive);
  assert.equal(stored.personRepresentanter.mira.personId,null);
  assert.equal(stored.personRepresentanter.mira.navn,'Mira');
  legacyDom.window.close();
  delete globalThis.CivicationLifePositions;
  console.log('Life Story fictional cast: 3 stable identities, 45 unchanged chapters, week paths, browser and immutable legacy archive verified.');
})().catch(error=>{console.error(error);process.exitCode=1;});
