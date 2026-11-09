#!/usr/bin/env node
'use strict';
// C09 is a continuation of the same Jonas history; no new NPC or work role.
// Film source research is recorded in docs/CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');

const root = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const manifest = read(C.MANIFEST_PATH);
const build = roleId => {
  const r = manifest.roles[roleId];
  return C.buildContent({
    role: read(r.role), roleThreads: read(r.threads), roleScenes: read(r.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
  });
};
const c = build('arbeidsledig');
const care = build('renholder');
const planning = build('arealplanlegger');
const prefix = 'wave_g_c01_c09_';
const scenes = c.scenes.filter(s => s.id.startsWith(prefix));
const first = scenes.find(s => s.id.endsWith('dag35_rytmen_endrer_seg'));
const shared = scenes.find(s => s.id.endsWith('dag36_svar_uten_lovnad'));
const proposed = scenes.find(s => s.id.endsWith('dag36_svar_pa_tur'));
const conflict = scenes.find(s => s.id.endsWith('dag36_rett_opp_antakelsen'));
const reflection = scenes.find(s => s.id.endsWith('dag37_en_ny_rytme'));
const walk = scenes.find(s => s.id.endsWith('dag38_den_avtalte_turen'));
const clone = state => JSON.parse(JSON.stringify(state));
assert.equal(scenes.length, 6, 'exactly six new Jonas scenes');
assert.ok([first, shared, proposed, conflict, reflection, walk].every(Boolean));
assert.ok(scenes.every(s => s.threadId === 'wave_g_c01' && s.fase === 'kveld'));
assert.deepEqual(scenes.map(s => s.livsdagFra), [35, 36, 36, 36, 37, 38]);
assert.ok(scenes.every(s => !/lost in translation|bob|charlotte|bruno|pietro/i.test(s.tekst)),
  'no copyrighted film character, copied film story or film-as-canon claim');
const normal = first.valg.find(v => v.id === 'si_det_direkte');
const room = first.valg.find(v => v.id === 'gi_rom');
assert.equal(normal.effekter.flagg.c09_jonas_inngang, room.effekter.flagg.c09_jonas_inngang,
  'direct answer and space share the next scene');
assert.notDeepEqual(normal.effekter.meters, room.effekter.meters,
  'shared scene does not mean identical meter consequences');

function due(roleContent, st, day) {
  st.livsdag = day;
  st.dag = day;
  st.fase = 'kveld';
  st.dagFerdig = false;
  return R.getCandidateScenes(st, roleContent).filter(s => s.id.startsWith(prefix));
}
function play(roleContent, st, sc, val) {
  assert.ok(R.getCandidateScenes(st, roleContent).some(s => s.id === sc.id),
    sc.id + ' must be a playable candidate');
  R.applyChoice(st, roleContent, sc.id, val);
  assert.ok(st.arkiv.some(e => e.sceneId === sc.id && e.valgId === val),
    'choice and response recorded in Symposium');
  assert.ok(st.privatHistorie.arkiv.some(e => e.sceneId === sc.id && e.valgId === val),
    'private journal retains the actual action');
  return clone(st); // Real serialization boundary; future choices use the reloaded state.
}

const branches = [
  {start: 'si_det_direkte', day36: shared, answer: 'takk_og_lev_videre', status: 'avklart'},
  {start: 'gi_rom', day36: shared, answer: 'kort_svar', status: 'kort'},
  {start: 'foreslaa_kort_tur', day36: proposed, answer: 'bekreft_turen', status: 'tur_avtalt', walk: true},
  {start: 'foreslaa_kort_tur', day36: proposed, answer: 'avslaa_turen', status: 'tur_ikke_avtalt'},
  {start: 'tolk_som_avvisning', day36: conflict, answer: 'rett_opp', status: 'beskyldning_rettet'},
  {start: 'tolk_som_avvisning', day36: conflict, answer: 'hold_fast', status: 'beskyldning_aapen'}
];
let validated = 0;
for (const roleContent of [c, care, planning]) {
  const role = roleContent.role.id;
  for (const br of branches) {
    let st = S.createInitialState(roleContent);
    assert.equal(due(roleContent, st, 34).length, 0,
      role + ': no C09 scene before day 35');
    let got = due(roleContent, st, 35);
    assert.deepEqual(got.map(s => s.id), [first.id], 'only new C09 opening on day 35');
    st = play(roleContent, st, first, br.start);
    assert.equal(due(roleContent, st, 35).length, 0, 'opening may not replay');
    got = due(roleContent, st, 36);
    assert.deepEqual(got.map(s => s.id), [br.day36.id],
      role + ': wrong day-36 branch must not appear');
    st = play(roleContent, st, br.day36, br.answer);
    assert.equal(st.tidligereValg.c09_jonas_svar_etterspill, br.status);
    assert.equal(due(roleContent, st, 36).length, 0, 'reply may not replay');
    assert.deepEqual(due(roleContent, st, 37).map(s => s.id), [reflection.id]);
    st = play(roleContent, st, reflection, 'skille_fakta_og_frykt');
    const walkCandidates = due(roleContent, st, 38);
    assert.deepEqual(walkCandidates.map(s => s.id), br.walk ? [walk.id] : [],
      'a proposed or declined walk is never an appointment');
    if (br.walk) {
      assert.equal(st.tidligereValg.c09_jonas_tur_status, 'bekreftet');
      st = play(roleContent, st, walk, 'hold_det_hverdagslig');
      assert.equal(st.tidligereValg.c09_jonas_tur_status, 'gjennomfort');
      assert.equal(due(roleContent, st, 39).length, 0);
    } else {
      assert.notEqual(st.tidligereValg.c09_jonas_tur_status, 'gjennomfort');
    }
    const other = roleContent === care ? c : care;
    const switched = S.selectRole(clone(st), other);
    const back = S.selectRole(switched, roleContent);
    for (const e of st.arkiv.filter(e => e.sceneId.startsWith(prefix))) {
      assert.ok(back.arkiv.some(x => x.sceneId === e.sceneId && x.valgId === e.valgId),
        'C09 Symposium entries survive work role switches');
    }
    assert.equal(back.tidligereValg.c09_jonas_svar_etterspill, br.status);
    validated++;
  }
}
console.log('C09 Jonas: ' + validated + ' research-grounded branches, confirmed-only walk, preserved archives and cross-role state OK');
