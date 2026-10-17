// Content-batch verification: real runner, real chapter bindings, no browser fixture.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const root = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const clone = v => JSON.parse(JSON.stringify(v));
const manifest = read(C.MANIFEST_PATH);
const bindings = read('data/Civication/lifestory/editorial/inspiration/waveAChapterBindingsV1.json');
const blueprints = read('data/Civication/lifestory/editorial/inspiration/waveARoleStoryBlueprintsV1.json');
const seen = new Set();
let runs = 0, reloads = 0;
function base(role) {
  const e = manifest.roles[role];
  return C.buildContent({ role: read(e.role), roleThreads: read(e.threads), roleScenes: read(e.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes) });
}
function playTo(state, content, end, overrides = {}, visit = () => {}) {
  let guard = 0;
  while (true) {
    while (!state.dagFerdig) {
      const scene = R.selectNextScene(state, content);
      if (!scene) { R.advance(state, content); continue; }
      const id = overrides[scene.id] || scene.valg[0].id;
      visit(state, scene, id);
      const past = clone(state.arkiv), oldFlags = clone(state.tidligereValg);
      const oldMoney = state.meters.penger;
      R.applyChoice(state, content, scene.id, id);
      assert.deepEqual(state.arkiv.slice(0, past.length), past, 'choice preserves previous archive');
      if (scene.id.startsWith('wave_a_')) {
        const choice = scene.valg.find(c => c.id === id);
        assert.ok(choice);
        assert.equal(state.meters.penger, oldMoney, 'new fiction cannot spend or grant money');
        for (const [k, v] of Object.entries(oldFlags)) if (!k.startsWith('wa_')) assert.deepEqual(state.tidligereValg[k], v);
        seen.add(scene.id + '/' + id);
      }
      const serialized = JSON.stringify(state);
      state = clone(state);
      S.reconcileContent(state, content);
      assert.equal(JSON.stringify(state), serialized, 'reload preserves complete state');
      reloads++;
      assert.ok(++guard < 1000, 'day sequence terminates');
    }
    if (state.dag === end) return state;
    R.startNextDay(state, content);
  }
}
function explore(content, start, end, initial = {}) {
  const queue = [initial], covered = new Set(), finals = [];
  while (queue.length) {
    const override = queue.shift(), actual = { ...initial };
    const final = playTo(clone(start), content, end, override, (s, scene, chosen) => {
      if (scene.id.startsWith('wave_a_')) {
        const key = scene.id + '/' + chosen;
        if (!covered.has(key)) {
          covered.add(key);
          for (const other of scene.valg) if (other.id !== chosen && !covered.has(scene.id + '/' + other.id)) {
            queue.push({ ...actual, [scene.id]: other.id });
          }
        }
      }
      actual[scene.id] = chosen;
    });
    finals.push(final);
    assert.ok(++runs < 300, 'bounded content exploration');
  }
  return finals;
}
const a = base('arbeidsledig');
const finals = explore(a, S.createInitialState(a), 7);
for (const state of finals) {
  const f = state.tidligereValg;
  assert.equal(!!f.wa_c01_tur_gjennomfort && !!f.wa_c01_tur_avlyst, false);
  if (f.wa_c01_tur_gjennomfort) assert.equal(f.wa_c01_tur_avtalt, true);
  if (f.wa_c01_svar === 'nei') assert.ok(!f.wa_c01_tur_avtalt);
  if (f.wa_c05_valg === 'ringt' && f.wa_c05_oppfolging === 'spurt') assert.ok(!f.wa_c05_kvittering);
  if (f.wa_c05_avslutning === 'mottak_dokumentert') assert.ok(f.wa_c05_kvittering);
}
const roleStarts = { renholder: base('renholder'), arealplanlegger: base('arealplanlegger') };
for (const c of Object.values(roleStarts)) explore(c, S.createInitialState(c), 4);

function chapterState(firstId, prior = {}) {
  const week = playTo(S.createInitialState(a), a, 7, prior);
  const descriptor = a.role.symposium.fortsettelser.find(d => d.id === firstId);
  const bridge = a.role.symposium.rollebroer.find(b => b.role_scope === descriptor.role_scope);
  globalThis.CivicationLifePositions = { getLifeContext: () => ({ primary_life_position: { badge_id: bridge.badge_id, label: bridge.navn } }) };
  const c = C.appendContinuation(a, read(descriptor.path));
  assert.ok(R.canStartContinuation(week, a, descriptor));
  const past = clone(week.arkiv);
  R.startContinuation(week, a, c, firstId, { id: 'test-boundary' });
  assert.deepEqual(week.arkiv, past);
  return [c, week];
}
for (const prior of [{}, { d8_mira_etter_settet: 'hjemme' }, { d8_mira_etter_settet: 'pause' }, { d9_mira_forberedelse: 'avlys' }]) {
  const [c, s] = chapterState('musikk_med_mira');
  for (const final of explore(c, s, 10, prior)) {
    assert.ok(!final.tidligereValg.wa_c02_booking);
    if (final.tidligereValg.musikk_videre_valg === 'pause') assert.ok(!final.tidligereValg.wa_c02_valg);
  }
}
{
  const [c, s] = chapterState('sideprosjekt_med_lea', { d2_en_retning: 'prosjekt' });
  for (const final of explore(c, s, 10)) {
    const f = final.tidligereValg;
    assert.ok(!(f.wa_c03_test_gjennomfort && f.wa_c03_avlyst));
    if (f.wa_c03_test_gjennomfort) assert.equal(f.wa_c03_avtalt, true);
    const descriptor = c.role.symposium.fortsettelser.find(d => d.id === 'sideprosjekt_neste_steg');
    const next = C.appendContinuation(c, read(descriptor.path));
    const before = clone(final.arkiv);
    R.startContinuation(final, c, next, descriptor.id, { id: 'test-boundary' });
    for (const end of explore(next, final, 13)) {
      assert.deepEqual(end.arkiv.slice(0, before.length), before);
      const e = end.tidligereValg;
      if (e.wa_c23_rettelse === 'en') assert.ok(['en_avklart', 'ansvar_tilbake'].includes(e.wa_c23_avslutning));
      if (e.wa_c23_rettelse === 'begge') assert.ok(['en_bekreftet_en_uavklart', 'foreslaatt_oppfolging'].includes(e.wa_c23_avslutning));
      if (e.wa_c23_rettelse === 'ikke_bekreftet') assert.ok(['minnet_om_aapent_sporsmal', 'uavklart'].includes(e.wa_c23_avslutning));
    }
  }
}
for (const prior of [{}, { d8_arvid_etter_oppdraget: 'avstand' }]) {
  const [c, s] = chapterState('miljo_med_arvid', { d2_en_retning: 'miljo' });
  for (const final of explore(c, s, 10, prior)) {
    const f = final.tidligereValg;
    if (f.arvid_valg8 === 'avstand') assert.ok(!f.wa_c07_invitasjon);
    if (f.wa_c07_vakt_gjennomfort) assert.equal(f.wa_c07_vakt_avtalt, true);
    if (f.wa_c07_bare_gjest) assert.ok(!f.wa_c07_vakt_avtalt);
    assert.ok(!(f.wa_c07_vakt_gjennomfort && f.wa_c07_vakt_avlyst));
  }
}
// A completed save is not retroactively populated with invented new memories.
const legacy = clone(finals[0]);
for (const key of Object.keys(legacy.tidligereValg)) if (key.startsWith('wa_')) delete legacy.tidligereValg[key];
legacy.arkiv = legacy.arkiv.filter(e => !e.sceneId.startsWith('wave_a_'));
legacy.spilteScener = legacy.spilteScener.filter(id => !id.startsWith('wave_a_'));
for (const key of Object.keys(legacy.threadState)) if (key.startsWith('wave_a_')) delete legacy.threadState[key];
S.reconcileContent(legacy, a);
assert.ok(!Object.keys(legacy.tidligereValg).some(k => k.startsWith('wa_')));
assert.ok(!legacy.arkiv.some(e => e.sceneId.startsWith('wave_a_')));
const old = clone(finals[0]);
const switched = S.selectRole(clone(old), roleStarts.renholder);
const back = S.selectRole(switched, a);
assert.deepEqual(back.arkiv, old.arkiv);
assert.deepEqual(back.tidligereValg, old.tidligereValg);

let sceneCount = 0, choiceCount = 0;
assert.equal(bindings.stories.length, 8);
for (const b of bindings.stories) {
  const bp = blueprints.blueprints.find(x => x.blueprint_id === b.blueprint_id);
  assert.ok(bp && bp.story_type_ids.includes(b.story_type_id));
  assert.deepEqual(b.work_ids, bp.work_ids);
  const scenes = read(b.runtime_path).scenes.filter(s => b.scene_ids.includes(s.id));
  assert.equal(scenes.length, b.scene_ids.length);
  for (const scene of scenes) {
    sceneCount++;
    for (const choice of scene.valg) {
      choiceCount++;
      assert.ok(seen.has(scene.id + '/' + choice.id), 'actually played ' + scene.id + '/' + choice.id);
      for (const flag of Object.keys(choice.effekter.flagg)) assert.ok(flag.startsWith('wa_'), 'batch has its own historical flags');
    }
  }
}
console.log(JSON.stringify({ stories: 8, scenes: sceneCount, choices: choiceCount, runs, reloads, status: 'passed' }));
