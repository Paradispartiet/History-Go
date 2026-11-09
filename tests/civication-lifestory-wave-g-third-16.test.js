#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../js/Civication/lifestory/lifestoryContent');
const S = require('../js/Civication/lifestory/lifestoryState');
const R = require('../js/Civication/lifestory/lifestoryRunner');
const root = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const manifest = read(C.MANIFEST_PATH);
const build = id => {
  const m = manifest.roles[id];
  return C.buildContent({
    role: read(m.role), roleThreads: read(m.threads), roleScenes: read(m.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions),
    lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes)
  });
};
const base = build('arbeidsledig'), renholder = build('renholder');
const thirdStatuses = {
  c01: ['grense_staar', 'samtaletema_valgt'],
  c02: ['krav_egne', 'kommentar_etterspurt'],
  c03: ['sporsmaal_formulert', 'bilde_holdt_tilbake'],
  c05: ['usendt_bevart', 'kvittering_kontrollert'],
  c06: ['forbehold_uavklart', 'ansvar_identifisert'],
  c07: ['tid_ikke_reservert', 'skriftlig_rammesporsmal'],
  c17: ['drift_venter', 'ferdigkrav_notert'],
  c23: ['stillhet_respektert', 'internt_rettet']
};
// This historical batch keeps its fixed 64-scene baseline; C09 is a later extension.
const all = base.scenes.filter(s => s.id.startsWith('wave_g_') && !s.id.startsWith('wave_g_c01_c09_'));
assert.equal(all.length, 64, 'Wave G first four batches: 64 scenes');
assert.equal(all.reduce((sum,s) => sum+s.valg.length,0),128,'128 authored choices');
const third = all.filter(s => {
  const story = s.threadId.slice('wave_g_'.length);
  return thirdStatuses[story]?.includes(s.conditions?.flagg?.['wa_f_'+story+'_status']);
});
assert.equal(third.length, 16, 'third batch includes 16 branched scenes');

let acted = 0;
for (const [story, values] of Object.entries(thirdStatuses)) {
  const pair = third.filter(s => s.threadId === 'wave_g_' + story);
  assert.equal(pair.length, 2, 'two outcomes in ' + story);
  for (const scene of pair) {
    assert.equal(scene.etterValgDager.flagg,'wa_f_'+story+'_status');
    assert.equal(scene.etterValgDager.dager,4);
    assert.equal(scene.livsdagFra,26);
    assert.ok(scene.tekst.length>250,'written story, not placeholder');
    assert.equal(scene.valg.length,2);
    assert.equal(new Set(scene.valg.map(v=>v.effekter.flagg['wa_g_'+story+'_status'])).size,2);
    assert.ok(scene.valg.every(v=>v.konsekvensTekst?.length>=70 && !v.effekter?.meters?.penger));
    const anchor='wa_f_'+story+'_status', desired=scene.conditions.flagg[anchor];
    const old = base.scenes.find(s=>s.id.startsWith('wave_f_'+story+'_') &&
      s.valg.some(v=>v.effekter.flagg[anchor]===desired));
    assert.ok(old,'Wave F actually produces '+desired);
    const oldChoice=old.valg.find(v=>v.effekter.flagg[anchor]===desired);
    for(const choice of scene.valg){
      const state=S.createInitialState(base);
      state.dag=22;
      state.livsdag=22;
      state.fase=old.fase;
      state.tidligereValg={...old.conditions.flagg};
      state.privatHistorie={
        flagg:{...state.tidligereValg},
        flaggDager:{[old.etterValgDager.flagg]:18},
        spilteScener:[],arkiv:[],relasjoner:{}
      };
      assert.equal(R.sceneDue(state,old),true);
      assert.equal(R.conditionsMet(state,old),true);
      R.applyChoice(state,base,old.id,oldChoice.id);
      assert.equal(state.tidligereValg[anchor],desired);
      assert.equal(state.privatHistorie.flaggDager[anchor],22);
      assert.ok(state.privatHistorie.arkiv.some(e=>e.sceneId===old.id));
      state.dagFerdig=false;
      state.fase=scene.fase;
      state.livsdag=25;
      assert.equal(R.sceneDue(state,scene),false);
      state.livsdag=26;
      assert.equal(R.sceneDue(state,scene),true);
      assert.ok(R.getCandidateScenes(state,base).some(s=>s.id===scene.id));
      const sibling=pair.find(s=>s.id!==scene.id);
      assert.ok(!R.getCandidateScenes(state,base).some(s=>s.id===sibling.id),
        'unselected sibling must remain blocked');
      R.applyChoice(state,base,scene.id,choice.id);
      const outcome=choice.effekter.flagg['wa_g_'+story+'_status'];
      assert.equal(state.tidligereValg['wa_g_'+story+'_status'],outcome);
      assert.ok(state.privatHistorie.arkiv.some(e=>e.sceneId===scene.id));
      const next=S.selectRole(JSON.parse(JSON.stringify(state)),renholder);
      assert.equal(next.tidligereValg[anchor],desired);
      assert.equal(next.tidligereValg['wa_g_'+story+'_status'],outcome);
      const back=S.selectRole(next,base);
      assert.ok(back.arkiv.some(e=>e.sceneId===scene.id&&e.valgId===choice.id));
      assert.equal(back.tidligereValg['wa_g_'+story+'_status'],outcome);
      acted++;
    }
  }
}
console.log('Wave G third batch: 16 scenes, 32 played choices, 8 histories, full F anchor and role-switch persistence OK ('+acted+').');


// Fourth production batch: play both authored decisions from each newly
// reachable Wave F outcome and verify branch isolation and private persistence.
const fourthStatuses = {
  c01: ['spurt_om_hans_dag', 'grense_for_uka'],
  c02: ['egne_vilkar', 'sammenligning_foreslaatt'],
  c03: ['testplan_skisse', 'arbeid_satt_paa_pause'],
  c05: ['bilag_merket', 'avklaring_notert'],
  c06: ['mote_ikke_bekreftet', 'agenda_utkast'],
  c07: ['tilbud_lagt_bort', 'ny_forespoersel_kreves'],
  c17: ['ingen_falsk_dato', 'observasjon_skilt'],
  c23: ['spredning_uavklart', 'lenke_til_original']
};
const fourth = all.filter(scene => {
  const story=scene.threadId.slice('wave_g_'.length);
  return fourthStatuses[story]?.includes(scene.conditions?.flagg?.['wa_f_'+story+'_status']);
});
assert.equal(fourth.length,16,'Fourth batch includes 16 different F continuations');
let fourthChoices=0;
for(const [story,statuses] of Object.entries(fourthStatuses)){
  const siblings=fourth.filter(x=>x.threadId==='wave_g_'+story);
  assert.equal(siblings.length,2,'two different new outcomes for '+story);
  for(const scene of siblings){
    const key='wa_f_'+story+'_status';
    const expected=scene.conditions.flagg[key];
    assert.ok(statuses.includes(expected));
    assert.equal(scene.livsdagFra,26);
    assert.equal(scene.etterValgDager.flagg,key);
    assert.equal(scene.etterValgDager.dager,4);
    assert.ok(scene.tekst.length>250,'authored prose '+scene.id);
    assert.equal(scene.valg.length,2);
    assert.equal(new Set(scene.valg.map(x=>x.effekter.flagg['wa_g_'+story+'_status'])).size,2);
    const precursor=base.scenes.find(x=>x.threadId==='wave_f_'+story &&
      x.valg.some(c=>c.effekter?.flagg?.[key]===expected));
    assert.ok(precursor,'predecessor is real: '+expected);
    const originalChoice=precursor.valg.find(x=>x.effekter.flagg[key]===expected);
    for(const decision of scene.valg){
      assert.ok(decision.konsekvensTekst.length>=70);
      assert.ok(!decision.effekter?.meters?.penger,'no synthetic payment');
      const state=S.createInitialState(base);
      state.dag=22;
      state.livsdag=22;
      state.fase=precursor.fase;
      state.tidligereValg={...precursor.conditions.flagg};
      state.privatHistorie={flagg:{...state.tidligereValg},flaggDager:{[precursor.etterValgDager.flagg]:18},spilteScener:[],arkiv:[],relasjoner:{}};
      assert.equal(R.sceneDue(state,precursor),true);
      assert.equal(R.conditionsMet(state,precursor),true);
      R.applyChoice(state,base,precursor.id,originalChoice.id);
      assert.equal(state.tidligereValg[key],expected);
      assert.equal(state.privatHistorie.flaggDager[key],22);
      state.dagFerdig=false;
      state.fase=scene.fase;
      state.livsdag=25;
      assert.equal(R.sceneDue(state,scene),false);
      state.livsdag=26;
      assert.equal(R.sceneDue(state,scene),true);
      assert.ok(R.getCandidateScenes(state,base).some(x=>x.id===scene.id));
      assert.ok(!R.getCandidateScenes(state,base).some(x=>x.threadId===scene.threadId &&
        x.id!==scene.id && x.id.startsWith('wave_g_') && x.conditions?.flagg?.[key]!==expected),'no other F outcome leaks');
      R.applyChoice(state,base,scene.id,decision.id);
      const outcome=decision.effekter.flagg['wa_g_'+story+'_status'];
      assert.equal(state.tidligereValg['wa_g_'+story+'_status'],outcome);
      assert.ok(state.privatHistorie.arkiv.some(x=>x.sceneId===scene.id));
      const switched=S.selectRole(JSON.parse(JSON.stringify(state)),renholder);
      assert.equal(switched.tidligereValg['wa_g_'+story+'_status'],outcome);
      const returned=S.selectRole(switched,base);
      assert.ok(returned.arkiv.some(x=>x.sceneId===scene.id && x.valgId===decision.id));
      fourthChoices++;
    }
  }
}
assert.equal(fourthChoices,32);
console.log('Fourth batch: 16 scenes and 32 decisions, real Wave F anchor, delay, branch gate and job-change archive OK');

// --- C09 source-audited Jonas continuation; this is part of the existing Wave G story. ---
{
const c = base;
const care = renholder;
const prefix = 'wave_g_c01_c09_';
const scenes = c.scenes.filter(s => s.id.startsWith(prefix));
const first = scenes.find(s => s.id.endsWith('dag35_rytmen_endrer_seg'));
const shared = scenes.find(s => s.id.endsWith('dag36_svar_uten_lovnad'));
const proposed = scenes.find(s => s.id.endsWith('dag36_svar_pa_tur'));
const conflict = scenes.find(s => s.id.endsWith('dag36_rett_opp_antakelsen'));
const reflection = scenes.find(s => s.id.endsWith('dag37_en_ny_rytme'));
const walk = scenes.find(s => s.id.endsWith('dag38_den_avtalte_turen'));
const clone = state => JSON.parse(JSON.stringify(state));
const previousWaveG = c.scenes.find(s => s.id === 'wave_g_c01_hverdagsrytmen');
const sourceFlag = 'wa_f_c01_status';
assert.ok(previousWaveG, 'new C09 must follow an existing Wave G Jonas decision');
assert.ok(c.scenes.some(s => s.id.startsWith('wave_f_c01_') &&
  s.valg.some(v => v.effekter?.flagg?.[sourceFlag] === 'vennskap_pa_egne_vilkar')),
  'Wave G predecessor has real author-created Wave F provenance');
function playPriorJonas(roleContent, st) {
  st.tidligereValg[sourceFlag] = 'vennskap_pa_egne_vilkar';
  st.privatHistorie ||= {flagg: {}, flaggDager: {}, spilteScener: [], arkiv: [], relasjoner: {}};
  st.privatHistorie.flagg[sourceFlag] = 'vennskap_pa_egne_vilkar';
  st.privatHistorie.flaggDager[sourceFlag] = 18;
  st.livsdag = 26;
  st.dag = 26;
  st.fase = 'kveld';
  st.dagFerdig = false;
  assert.ok(R.getCandidateScenes(st, roleContent).some(s => s.id === previousWaveG.id),
    'Wave G must really be playable from an earlier Jonas response');
  R.applyChoice(st, roleContent, previousWaveG.id, 'behold');
  assert.equal(st.tidligereValg.wa_g_c01_status, 'hilsen_uten_krav');
  assert.ok(st.privatHistorie.arkiv.some(e => e.sceneId === previousWaveG.id),
    'Wave G prior decision is archived');
  return clone(st);
}
assert.equal(scenes.length, 6, 'exactly six new Jonas scenes');
assert.ok(scenes.every(s => s.etterValgDager?.flagg === sourceFlag &&
  s.etterValgDager.dager === 4), 'all six C09 scenes have a prior-choice time anchor');
assert.ok([first, shared, proposed, conflict, reflection, walk].every(Boolean));
assert.ok(scenes.every(s => s.threadId === 'wave_g_c01' && s.fase === 'kveld'));
assert.deepEqual(scenes.map(s => s.livsdagFra), [35, 36, 36, 36, 37, 38]);
assert.ok(scenes.every(s => !/lost in translation|bob|charlotte|bruno|pietro/i.test(s.tekst)),
  'no copyrighted film character, copied film story or film-as-canon claim');
const normal = first.valg.find(v => v.id === 'si_det_direkte');
const room = first.valg.find(v => v.id === 'gi_rom');
assert.equal(normal.effekter.flagg.wa_g_c01_c09_jonas_inngang, room.effekter.flagg.wa_g_c01_c09_jonas_inngang,
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
for (const roleContent of [c, care]) {
  const role = roleContent.role.id;
  for (const br of branches) {
    let st = S.createInitialState(roleContent);
    assert.deepEqual(due(roleContent, st, 35), [],
      'Jonas C09 must not start without prior choices');
    st = playPriorJonas(roleContent, st);
    assert.equal(due(roleContent, st, 34).length, 0,
      role + ': no C09 scene before day 35');
    st.privatHistorie.flaggDager[sourceFlag] = 33;
    assert.deepEqual(due(roleContent, st, 35), [],
      'C09 cannot skip a minimum four-day interval');
    st.privatHistorie.flaggDager[sourceFlag] = 18;
    let got = due(roleContent, st, 35);
    assert.deepEqual(got.map(s => s.id), [first.id], 'only new C09 opening on day 35');
    st = play(roleContent, st, first, br.start);
    assert.equal(due(roleContent, st, 35).length, 0, 'opening may not replay');
    got = due(roleContent, st, 36);
    assert.deepEqual(got.map(s => s.id), [br.day36.id],
      role + ': wrong day-36 branch must not appear');
    st = play(roleContent, st, br.day36, br.answer);
    assert.equal(st.tidligereValg.wa_g_c01_c09_jonas_svar_etterspill, br.status);
    assert.equal(due(roleContent, st, 36).length, 0, 'reply may not replay');
    assert.deepEqual(due(roleContent, st, 37).map(s => s.id), [reflection.id]);
    st = play(roleContent, st, reflection, 'skille_fakta_og_frykt');
    const walkCandidates = due(roleContent, st, 38);
    assert.deepEqual(walkCandidates.map(s => s.id), br.walk ? [walk.id] : [],
      'a proposed or declined walk is never an appointment');
    if (br.walk) {
      assert.equal(st.tidligereValg.wa_g_c01_c09_jonas_tur_status, 'bekreftet');
      st = play(roleContent, st, walk, 'hold_det_hverdagslig');
      assert.equal(st.tidligereValg.wa_g_c01_c09_jonas_tur_status, 'gjennomfort');
      assert.equal(due(roleContent, st, 39).length, 0);
    } else {
      assert.notEqual(st.tidligereValg.wa_g_c01_c09_jonas_tur_status, 'gjennomfort');
    }
    const other = roleContent === care ? c : care;
    const switched = S.selectRole(clone(st), other);
    assert.equal(switched.tidligereValg.wa_g_c01_c09_jonas_svar_etterspill, br.status,
      'C09 ending must survive entry into the other role');
    assert.equal(switched.privatHistorie.flagg.wa_g_c01_c09_jonas_svar_etterspill, br.status,
      'C09 flags must remain in the shared private snapshot');
    assert.ok(switched.privatHistorie.arkiv.some(e => e.sceneId === first.id),
      'C09 scene remains in Symposium while playing another role');
    if (br.walk) {
      assert.equal(switched.tidligereValg.wa_g_c01_c09_jonas_tur_status, 'gjennomfort');
    }
    const back = S.selectRole(switched, roleContent);
    for (const e of st.arkiv.filter(e => e.sceneId.startsWith(prefix))) {
      assert.ok(back.arkiv.some(x => x.sceneId === e.sceneId && x.valgId === e.valgId),
        'C09 Symposium entries survive work role switches');
    }
    assert.equal(back.tidligereValg.wa_g_c01_c09_jonas_svar_etterspill, br.status);
    validated++;
  }
}
console.log('C09 Jonas: ' + validated + ' research-grounded branches, confirmed-only walk, preserved archives and cross-role state OK');

}
