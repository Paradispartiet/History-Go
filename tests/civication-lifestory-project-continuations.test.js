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
const base = C.buildContent(raw), descriptors = base.role.symposium.fortsettelser;
const packs = Object.fromEntries(descriptors.map(n => [n.id, read(n.path)]));
const projects = descriptors.filter(n => n.etterDag === 7 && n.fraTraad === 'prosjektet_og_lea');
let primary = null;
globalThis.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: primary }) };
function selectRole(scope) {
  const b = base.role.symposium.rollebroer.find(b => b.role_scope === scope);
  primary = { badge_id: b.badge_id, label: b.navn };
}
function restore(state) {
  let c = C.buildContent(clone(raw));
  for (const id of R.getContinuationIds(state)) c = C.appendContinuation(c, packs[id]);
  S.reconcileContent(state, c);
  return c;
}
function week(overrides = {}) {
  let s = S.createInitialState(base);
  while (true) {
    while (!s.dagFerdig) {
      const scene = R.selectNextScene(s, base);
      R.applyChoice(s, base, scene.id, overrides[scene.id] || scene.valg[0].id);
      s = clone(s);
    }
    if (s.dag === 7) return s;
    R.startNextDay(s, base);
  }
}
const seen = new Set();
let runs = 0, reloads = 0;
function explore(start, content, pack, verify) {
  const queue = [{}], covered = new Set(), finals = [];
  while (queue.length) {
    let s = clone(start), c = content;
    const overrides = queue.shift(), actual = {};
    while (true) {
      while (!s.dagFerdig) {
        const scene = R.selectNextScene(s, c);
        assert.ok(scene && pack.scenes.some(p => p.id === scene.id), 'every new day has an authored scene');
        const chosen = overrides[scene.id] || scene.valg[0].id, key = scene.id + '/' + chosen;
        if (!covered.has(key)) {
          covered.add(key); seen.add(key);
          for (const other of scene.valg) if (other.id !== chosen && !covered.has(scene.id + '/' + other.id)) queue.push({ ...actual, [scene.id]: other.id });
        }
        actual[scene.id] = chosen;
        R.applyChoice(s, c, scene.id, chosen);
        const text = JSON.stringify(s);
        s = clone(s); c = restore(s); reloads++;
        assert.equal(JSON.stringify(s), text, 'reload leaves the complete saved story unchanged');
        verify(s, c);
      }
      if (s.dag === pack.sisteDag) break;
      R.startNextDay(s, c);
    }
    assert.ok(E.isFinalDay(s, c));
    assert.equal(s.threadState[pack.hovedtraad].status, 'completed');
    const text = JSON.stringify(s);
    assert.throws(() => R.startNextDay(s, c), /neste kapittel/);
    assert.equal(JSON.stringify(s), text, 'cannot skip into an empty future day');
    finals.push(s); runs++;
    assert.ok(runs < 1000);
  }
  return finals;
}
const pasts = [
  { d2_en_retning: 'prosjekt' },
  { d2_en_retning: 'prosjekt', d3_prosjekt_invitasjon: 'dag6', d6_prosjekt_moetet: 'avgrens' },
  { d2_en_retning: 'prosjekt', d3_prosjekt_invitasjon: 'egen_tid' }
];
let savedFirst, savedSecond;
for (const first of projects) for (const [index, past] of pasts.entries()) {
  let s = week(past);
  const old = clone(s), originalText = JSON.stringify(base), firstEnding = E.resolveEnding(s, base);
  selectRole(first.role_scope);
  assert.ok(R.canStartContinuation(s, base, first));
  const c = C.appendContinuation(base, packs[first.id]);
  R.startContinuation(s, base, c, first.id, firstEnding);
  assert.deepEqual(s.arkiv, old.arkiv);
  assert.deepEqual(s.tidligereValg, old.tidligereValg);
  assert.deepEqual(s.meters, old.meters);
  assert.deepEqual(s.relasjoner, old.relasjoner);
  assert.equal(JSON.stringify(base), originalText);
  assert.ok(R.selectNextScene(s, c).id.endsWith(['etter_modellen', 'etter_samtalen', 'uten_mote'][index]));
  const finals = explore(s, c, packs[first.id], (now, active) => {
    assert.deepEqual(now.arkiv.slice(0, old.arkiv.length), old.arkiv);
    assert.deepEqual(now.kapittelArkiv[0].ending, firstEnding);
    assert.equal(now.meters.penger, old.meters.penger);
    assert.equal(now.threadState.nav_og_meldekortet.status, 'completed');
    const prefix = first.id.replace('_med_lea', '');
    const meeting = R.getSymposium(now, active).moter.find(m => m.id === prefix + '_samtale10');
    if (now.tidligereValg[prefix + '_mote_avbrutt']) {
      assert.equal(meeting.status, 'avbrutt');
      assert.ok(!now.tidligereValg[prefix + '_mote_gjennomfort']);
      assert.ok(!now.spilteScener.includes('d10_' + prefix + '_mote'));
    }
    for (const [key, value] of Object.entries(old.tidligereValg)) assert.deepEqual(now.tidligereValg[key], value);
  });
  savedFirst = finals[0];
  for (const second of descriptors.filter(n => n.etterFortsettelser?.includes(first.id))) {
    s = clone(savedFirst);
    const archive = clone(s.arkiv), priorChapter = clone(s.kapittelArkiv), priorEnding = E.resolveEnding(s, c);
    // A different primary role can take over at a completed chapter boundary.
    selectRole(second.role_scope);
    assert.equal(R.isContinuationPaused(s, c), false);
    assert.ok(R.canStartContinuation(s, c, second));
    const nextContent = C.appendContinuation(c, packs[second.id]);
    R.startContinuation(s, c, nextContent, second.id, priorEnding);
    assert.deepEqual(s.fortsettelser, [first.id, second.id]);
    assert.deepEqual(s.kapittelArkiv.slice(0, 1), priorChapter);
    assert.deepEqual(s.kapittelArkiv[1], { tittel: c.role.symposium.tittel, fraDag: 8, tilDag: 10, ending: priorEnding });
    savedSecond = explore(s, nextContent, packs[second.id], now => {
      assert.deepEqual(now.arkiv.slice(0, archive.length), archive);
      assert.deepEqual(now.kapittelArkiv[0], priorChapter[0]);
      assert.deepEqual(now.kapittelArkiv[1].ending, priorEnding);
      assert.equal(now.meters.penger, old.meters.penger);
    })[0];
  }
}
// Mira's legacy one-id save also upgrades to the ordered chapter ledger.
for (const past of [{}, { d5_booker: 'avsta', d9_mira_forberedelse: 'avlys' }, { d8_mira_etter_settet: 'hjemme' }]) {
  let s = week(past), first = descriptors[0], c = C.appendContinuation(base, packs[first.id]);
  selectRole(first.role_scope);
  R.startContinuation(s, base, c, first.id, E.resolveEnding(s, base));
  while (true) {
    while (!s.dagFerdig) { const scene = R.selectNextScene(s, c); R.applyChoice(s, c, scene.id, past[scene.id] || scene.valg[0].id); }
    if (s.dag === 10) break;
    R.startNextDay(s, c);
  }
  delete s.fortsettelser;
  assert.deepEqual(R.getContinuationIds(s), ['musikk_med_mira']);
  assert.deepEqual(restore(s), c);
  const before = clone(s), second = descriptors.find(n => n.id === 'musikk_foresporselen');
  const nextContent = C.appendContinuation(c, packs[second.id]);
  R.startContinuation(s, c, nextContent, second.id, E.resolveEnding(s, c));
  const expectedOpening = before.tidligereValg.mira_ny_prove_gjennomfort ? 'd11_musikk_etter_proven' : before.tidligereValg.mira_ny_prove_avbrutt ? 'd11_musikk_etter_avlysningen' : 'd11_musikk_uten_avtale';
  assert.equal(R.selectNextScene(s, nextContent).id, expectedOpening);
  explore(s, nextContent, packs[second.id], now => {
    assert.deepEqual(now.arkiv.slice(0, before.arkiv.length), before.arkiv);
    assert.equal(now.meters.penger, before.meters.penger);
    assert.ok(!now.tidligereValg.musikk_foresporsel_booking);
    if (now.tidligereValg.musikk_foresporsel_dato_frigjort) assert.ok(!now.tidligereValg.musikk_foresporsel_beholdt_hold);
  });
}
for (const p of Object.values(packs).filter(p => p.id !== 'musikk_med_mira')) for (const scene of p.scenes) for (const choice of scene.valg) assert.ok(seen.has(scene.id + '/' + choice.id), 'played ' + scene.id + '/' + choice.id);
// Unknown, reordered, duplicate and impossible chains fail before any save.
for (const bad of [ { fortsettelser: ['x'], fortsettelseId: 'y' }, { fortsettelser: ['x', 'x'], fortsettelseId: 'x' }, { fortsettelser: [], fortsettelseId: 'x' }, { fortsettelser: 'x', fortsettelseId: 'x' } ]) assert.throws(() => R.getContinuationIds(bad), /kapittelrekkefølge/);
assert.throws(() => restore({ ...savedSecond, fortsettelser: [...savedSecond.fortsettelser].reverse(), fortsettelseId: savedSecond.fortsettelser[0] }), /ugyldig/);
assert.throws(() => C.appendContinuation(base, packs.frilans_neste_steg), /ugyldig/);
assert.throws(() => C.appendContinuation(C.appendContinuation(base, packs.musikk_med_mira), packs.frilans_neste_steg), /ugyldig/);
for (const modify of [p => { p.scenes = p.scenes.filter(s => s.dag !== 9); }, p => { p.scenes[0].stedId = 'unknown'; }, p => { p.role_scope = 'unknown'; }]) {
  const bad = clone(packs.sideprosjekt_med_lea); modify(bad); assert.throws(() => C.appendContinuation(base, bad));
}
for (const modify of [d => { d.etterFortsettelser = ['unknown']; }, d => { d.etterFortsettelser = [d.id]; }, d => { d.etterFortsettelser = ['sideprosjekt_med_lea', 'sideprosjekt_med_lea']; }]) {
  const bad = clone(raw); modify(bad.role.symposium.fortsettelser.find(n => n.id === 'frilans_neste_steg')); assert.throws(() => C.buildContent(bad));
}
const first = projects[0], c = C.appendContinuation(base, packs[first.id]);
const paused = week(pasts[0]); selectRole(first.role_scope);
R.startContinuation(paused, base, c, first.id, E.resolveEnding(paused, base));
const pending = R.selectNextScene(paused, c), pausedText = JSON.stringify(paused);
primary = null;
assert.ok(R.isContinuationPaused(paused, c));
assert.throws(() => R.applyChoice(paused, c, pending.id, pending.valg[0].id), /ikke tilgjengelig/);
R.advance(paused, c); assert.equal(JSON.stringify(paused), pausedText);
const wrong = week(pasts[0]);
assert.ok(!R.canStartContinuation(wrong, base, first));
assert.throws(() => R.startContinuation(wrong, base, c, first.id, E.resolveEnding(wrong, base)), /ikke tilgjengelig/);
delete globalThis.CivicationLifePositions;
console.log(`Project continuation core: ${runs} complete chapter paths, ${seen.size} choices, ${reloads} reloads; all nine role handoffs verified.`);

// Real DOM, loader and storage: complete chain restores, a role can change
// at the boundary, failed fetch preserves state, and restart returns to day 1.
async function uiTest() {
  async function boot(saved, scope) {
    const dom = new JSDOM('<!doctype html><body class="civi-app"><div id="civiLifestoryPanel"></div></body>', { url: 'http://localhost/Civication.html', runScripts: 'outside-only' });
    const w = dom.window; let role = scope, fail = false;
    w.localStorage.setItem('civication_lifestory_v1', JSON.stringify(saved));
    w.console.error = () => {};
    w.fetch = async p => ({ ok: !(fail && String(p).includes('/continuations/')), json: async () => read(String(p)) });
    w.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: role }) };
    for (const n of ['lifestoryContent','lifestoryState','lifestoryRunner','lifestoryEndings']) w.eval(fs.readFileSync(path.join(root, 'js/Civication/lifestory/' + n + '.js'), 'utf8'));
    w.eval(fs.readFileSync(path.join(root,'js/Civication/ui/CivicationLifestoryUI.js'),'utf8'));
    for (let i=0;i<40 && !w.CivicationLifestoryUI.getCurrentSceneInfo();i++) await new Promise(r=>setTimeout(r,5));
    return { dom,w,panel:w.document.getElementById('civiLifestoryPanel'),fail(v){fail=v;},role(v){role=v;w.dispatchEvent(new w.Event('updateProfile'));} };
  }
  const selected = { badge_id:'naeringsliv',label:'Frilanser' };
  const ui = await boot(savedFirst, selected);
  assert.equal(ui.panel.querySelector('[data-lifestory-paused]'), null, 'completed boundary can hand off');
  const next = ui.panel.querySelector('[data-lifestory-continue="frilans_neste_steg"]');
  assert.ok(next);
  const text = ui.w.localStorage.getItem('civication_lifestory_v1');
  ui.fail(true); next.click(); await new Promise(r=>setTimeout(r,20));
  assert.equal(ui.w.localStorage.getItem('civication_lifestory_v1'), text);
  assert.ok(ui.panel.querySelector('[role="alert"]'));
  ui.fail(false); ui.panel.querySelector('[data-lifestory-continue]').click(); await new Promise(r=>setTimeout(r,20));
  const continued = JSON.parse(ui.w.localStorage.getItem('civication_lifestory_v1'));
  assert.equal(continued.dag,11); assert.equal(continued.kapittelArkiv.length,2);
  const reloaded = await boot(continued, null);
  assert.ok(reloaded.panel.querySelector('[data-lifestory-paused]'));
  assert.equal(reloaded.w.localStorage.getItem('civication_lifestory_v1'), JSON.stringify(continued));
  reloaded.role(selected);
  assert.equal(reloaded.w.CivicationLifestoryUI.getCurrentSceneInfo().sceneId,'d11_frilans_nytt_sporsmal');
  const last = await boot(savedSecond, selected);
  assert.equal(last.w.localStorage.getItem('civication_lifestory_v1'),JSON.stringify(savedSecond));
  assert.equal(last.panel.querySelector('[data-lifestory-continue]'),null);
  last.panel.querySelector('[data-lifestory-restart]').click();
  const fresh=JSON.parse(last.w.localStorage.getItem('civication_lifestory_v1'));
  assert.equal(fresh.dag,1); assert.equal(fresh.fortsettelseId,undefined); assert.equal(fresh.fortsettelser,undefined); assert.equal(fresh.kapittelArkiv,undefined);
  for (const u of [ui,reloaded,last]) u.dom.window.close();
}
uiTest().then(()=>console.log('Project continuation DOM: chain restore, boundary handoff, atomic retry, pause/resume and restart passed.')).catch(e=>{console.error(e);process.exitCode=1;});
