'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const E = require('../js/Civication/lifestory/lifestoryEndings');
const root = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const clone = v => JSON.parse(JSON.stringify(v));
const manifest = read(C.MANIFEST_PATH), entry = manifest.roles.arbeidsledig;
const raw = { role: read(entry.role), roleThreads: read(entry.threads), roleScenes: read(entry.scenes), phaseDefinitions: read(manifest.shared.phaseDefinitions), lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes) };
const base = C.buildContent(raw);
const descriptors = base.role.symposium.fortsettelser.filter(n => n.role_scope === 'subkultur_gangster');
const packs = descriptors.map(n => read(n.path));
const contents = [C.appendContinuation(base, packs[0])];
contents.push(C.appendContinuation(contents[0], packs[1]));
let primary = { badge_id: 'subkultur', label: 'Gangster' };
globalThis.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: primary }) };
function restore(s) {
  let c = C.buildContent(clone(raw));
  for (const id of R.getContinuationIds(s)) c = C.appendContinuation(c, packs.find(p => p.id === id));
  S.reconcileContent(s, c);
  return c;
}
function week(overrides) {
  const s = S.createInitialState(base);
  while (true) {
    while (!s.dagFerdig) {
      const scene = R.selectNextScene(s, base);
      R.applyChoice(s, base, scene.id, overrides[scene.id] || (scene.id === 'd2_en_retning' ? 'miljo' : scene.valg[0].id));
    }
    if (s.dag === 7) return s;
    R.startNextDay(s, base);
  }
}
const seen = new Set(), endings = new Set(), openings = new Set();
let paths = 0, reloads = 0, finalSave;
function verify(s, c, old, pack) {
  assert.deepEqual(s.arkiv.slice(0, old.arkiv.length), old.arkiv);
  for (const [k, v] of Object.entries(old.tidligereValg)) assert.deepEqual(s.tidligereValg[k], v, 'preserved ' + k);
  assert.equal(s.meters.penger, old.meters.penger, 'no implicit payment');
  assert.equal(s.threadState.nav_og_meldekortet.status, 'completed');
  const meetings = R.getSymposium(s, c).moter;
  const oldMeeting = meetings.find(m => m.id === 'amir_oppdrag');
  assert.equal(oldMeeting.status, old.tidligereValg.amir_oppdrag_gjennomfort ? 'gjennomfort' : old.tidligereValg.amir_oppdrag_avbrutt ? 'avbrutt' : 'avslaatt');
  const meeting = meetings.find(m => m.id === 'arvid_prat9');
  if (s.tidligereValg.arvid_prat9_avbrutt) {
    assert.equal(meeting.status, 'avbrutt');
    assert.ok(!s.tidligereValg.arvid_prat9_gjennomfort);
  }
  if (s.tidligereValg.arvid_valg8 === 'avstand') {
    assert.equal(meeting, undefined, 'no meeting is invented when contact is left alone');
    assert.ok(!s.spilteScener.includes('d9_arvid_praten'));
    assert.ok(!s.tidligereValg.arvid_prat9_avtalt && !s.tidligereValg.arvid_prat9_gjennomfort);
  }
  if (s.tidligereValg.arvid_valg11 === 'avstand') {
    assert.ok(!s.spilteScener.some(id => ['d12_arvid_navnet', 'd12_arvid_avklaringen', 'd13_arvid_forventningen'].includes(id)));
  }
  assert.equal(new Set(s.spilteScener).size, s.spilteScener.length);
  assert.ok(pack.scenes.every(scene => !scene.avsender || c.role.personer.some(p => p.id === scene.avsender)));
}
// All choice combinations, including repairs after overpromising; each
// branch is replayed from the same actual save, then rebuilt after every choice.
function explore(start, content, pack, old) {
  const finals = [];
  function visit(s, c) {
    if (s.dagFerdig) {
      if (s.dag < pack.sisteDag) {
        R.startNextDay(s, c);
        return visit(s, c);
      }
      assert.equal(s.threadState[pack.hovedtraad].status, 'completed');
      const ending = E.resolveEnding(s, c);
      assert.equal(ending.id, 'arvid' + pack.sisteDag + '_' + s.tidligereValg['arvid_retning' + pack.sisteDag]);
      endings.add(ending.id);
      const text = JSON.stringify(s);
      assert.throws(() => R.startNextDay(s, c), /neste kapittel/);
      assert.equal(JSON.stringify(s), text);
      finals.push(s); paths++;
      return;
    }
    const scene = R.selectNextScene(s, c);
    assert.ok(scene && pack.scenes.some(p => p.id === scene.id), 'every day has authored content');
    for (const choice of scene.valg) {
      seen.add(scene.id + '/' + choice.id);
      const next = clone(s);
      R.applyChoice(next, c, scene.id, choice.id);
      const serialized = JSON.stringify(next), restored = clone(next), restoredContent = restore(restored);
      reloads++;
      assert.equal(JSON.stringify(restored), serialized, 'complete save survives reload unchanged');
      verify(restored, restoredContent, old, pack);
      visit(restored, restoredContent);
    }
  }
  visit(clone(start), content);
  return finals;
}
const pasts = [
  {}, { d6_amir_etterpa: 'trekk_ut' },
  { d5_amir_oppmotet: 'ga_hjem' }, { d5_amir_oppmotet: 'ga_hjem', d6_amir_etterpa: 'trekk_ut' },
  { d4_amir_rammen: 'trekk_deg' },
  { d4_amir_rammen: 'trekk_deg', d6_amir_praten: 'avslutt' },
  { d4_amir_rammen: 'trekk_deg', d5_amir_uten_oppmote: 'avstand' }
];
for (const pub of ['avklar', 'ja_uten_ramme']) for (const past of pasts) {
  const s = week({ ...past, d3_amir_pub: pub }), old = clone(s), firstEnding = E.resolveEnding(s, base);
  assert.ok(R.canStartContinuation(s, base, descriptors[0]));
  R.startContinuation(s, base, contents[0], packs[0].id, firstEnding);
  assert.deepEqual(s.meters, old.meters);
  assert.deepEqual(s.relasjoner, old.relasjoner);
  const expected = old.tidligereValg.amir_avstand ? 'etter_avstanden' : old.tidligereValg.amir_oppdrag_gjennomfort ? 'etter_oppdraget' : old.tidligereValg.amir_oppdrag_avbrutt ? 'etter_avbruddet' : 'etter_neiet';
  assert.equal(R.selectNextScene(s, contents[0]).id, 'd8_arvid_' + expected);
  openings.add(expected);
  for (const first of explore(s, contents[0], packs[0], old)) {
    const prior = clone(first), chapterEnding = E.resolveEnding(first, contents[0]);
    R.startContinuation(first, contents[0], contents[1], packs[1].id, chapterEnding);
    assert.deepEqual(first.kapittelArkiv, [
      { tittel: base.role.symposium.tittel, fraDag: 1, tilDag: 7, ending: firstEnding },
      { tittel: contents[0].role.symposium.tittel, fraDag: 8, tilDag: 10, ending: chapterEnding }
    ]);
    const expected11 = prior.tidligereValg.arvid_retning10 === 'kontakt' ? 'med_kontakt' : prior.tidligereValg.arvid_retning10 === 'press' ? 'etter_presset' : 'med_avstand';
    assert.equal(R.selectNextScene(first, contents[1]).id, 'd11_arvid_' + expected11);
    for (const final of explore(first, contents[1], packs[1], prior)) {
      assert.deepEqual(final.kapittelArkiv, first.kapittelArkiv);
      assert.deepEqual(final.fortsettelser, packs.map(p => p.id));
      assert.ok(!base.role.symposium.fortsettelser.some(n => R.canStartContinuation(final, contents[1], n)));
      finalSave = final;
    }
  }
}
assert.equal(openings.size, 4);
assert.equal(endings.size, 6);
for (const p of packs) for (const scene of p.scenes) for (const choice of scene.valg) assert.ok(seen.has(scene.id + '/' + choice.id), 'played ' + scene.id + '/' + choice.id);
const s = week({}), text = JSON.stringify(s);
for (const wrong of [null, { badge_id: 'musikk', label: 'Gangster' }, { badge_id: 'subkultur', label: 'Crew' }]) {
  primary = wrong;
  assert.ok(!R.canStartContinuation(s, base, descriptors[0]));
  assert.throws(() => R.startContinuation(s, base, contents[0], packs[0].id, E.resolveEnding(s, base)), /ikke tilgjengelig/);
  assert.equal(JSON.stringify(s), text);
}
primary = { badge_id: 'subkultur', label: 'Gangster' };
R.startContinuation(s, base, contents[0], packs[0].id, E.resolveEnding(s, base));
const pending = R.selectNextScene(s, contents[0]);
primary = null;
assert.ok(R.isContinuationPaused(s, contents[0]));
assert.throws(() => R.applyChoice(s, contents[0], pending.id, pending.valg[0].id), /ikke tilgjengelig/);
assert.throws(() => C.appendContinuation(base, packs[1]), /ugyldig/);
assert.throws(() => C.appendContinuation(C.appendContinuation(base, read(base.role.symposium.fortsettelser[0].path)), packs[1]), /ugyldig/);
delete globalThis.CivicationLifePositions;
console.log(`Arvid core: ${paths} complete chapter paths, ${seen.size} choices, ${reloads} reloads; four first-week histories and six endings verified.`);

async function uiTest() {
  async function boot(saved, role) {
    const dom = new JSDOM('<!doctype html><body class="civi-app"><div id="civiLifestoryPanel"></div></body>', { url: 'http://localhost/Civication.html', runScripts: 'outside-only' });
    const w = dom.window; let fail = false, selected = role;
    w.localStorage.setItem('civication_lifestory_v1', JSON.stringify(saved));
    w.console.error = () => {};
    w.fetch = async p => ({ ok: !(fail && String(p).includes('/continuations/')), json: async () => read(String(p)) });
    w.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: selected }) };
    for (const n of ['lifestoryContent', 'lifestoryState', 'lifestoryRunner', 'lifestoryEndings']) w.eval(fs.readFileSync(path.join(root, 'js/Civication/lifestory/' + n + '.js'), 'utf8'));
    w.eval(fs.readFileSync(path.join(root, 'js/Civication/ui/CivicationLifestoryUI.js'), 'utf8'));
    for (let i = 0; i < 50 && !w.CivicationLifestoryUI.getCurrentSceneInfo(); i++) await new Promise(r => setTimeout(r, 5));
    return { dom, w, panel: w.document.getElementById('civiLifestoryPanel'), fail(v) { fail = v; }, role(v) { selected = v; w.dispatchEvent(new w.Event('updateProfile')); } };
  }
  const role = { badge_id: 'subkultur', label: 'Gangster' }, prior = week({});
  const ui = await boot(prior, role), before = ui.w.localStorage.getItem('civication_lifestory_v1');
  assert.ok(ui.panel.textContent.includes('Arvid'));
  ui.fail(true); ui.panel.querySelector('[data-lifestory-continue="miljo_med_arvid"]').click();
  await new Promise(r => setTimeout(r, 20));
  assert.equal(ui.w.localStorage.getItem('civication_lifestory_v1'), before);
  assert.ok(ui.panel.querySelector('[role="alert"]'));
  ui.fail(false); ui.panel.querySelector('[data-lifestory-continue="miljo_med_arvid"]').click();
  await new Promise(r => setTimeout(r, 20));
  const continued = JSON.parse(ui.w.localStorage.getItem('civication_lifestory_v1'));
  assert.equal(continued.dag, 8);
  const paused = await boot(continued, null);
  assert.ok(paused.panel.querySelector('[data-lifestory-paused]'));
  assert.equal(paused.w.localStorage.getItem('civication_lifestory_v1'), JSON.stringify(continued));
  paused.role(role);
  assert.equal(paused.w.CivicationLifestoryUI.getCurrentSceneInfo().sceneId, 'd8_arvid_etter_oppdraget');
  const final = await boot(finalSave, role);
  assert.equal(final.w.localStorage.getItem('civication_lifestory_v1'), JSON.stringify(finalSave));
  assert.equal(final.panel.querySelector('[data-lifestory-next-day]'), null);
  assert.equal(final.panel.querySelector('[data-lifestory-continue]'), null);
  assert.ok(final.panel.textContent.includes(finalSave.kapittelArkiv[0].ending.navn));
  final.panel.querySelector('[data-lifestory-restart]').click();
  const fresh = JSON.parse(final.w.localStorage.getItem('civication_lifestory_v1'));
  assert.equal(fresh.dag, 1); assert.equal(fresh.fortsettelser, undefined);
  for (const u of [ui, paused, final]) u.dom.window.close();
}
uiTest().then(() => console.log('Arvid DOM: atomic retry, pause/resume, complete chain restore and restart passed.')).catch(e => { console.error(e); process.exitCode = 1; });
