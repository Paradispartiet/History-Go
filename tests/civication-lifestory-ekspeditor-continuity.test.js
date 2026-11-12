#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Content = require('../js/Civication/lifestory/lifestoryContent.js');
const State = require('../js/Civication/lifestory/lifestoryState.js');
const Runner = require('../js/Civication/lifestory/lifestoryRunner.js');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const manifest = read('data/Civication/lifestory/manifest.json');
const entry = manifest.roles.ekspeditor;
const content = Content.buildContent({ role: read(entry.role), roleScenes: read(entry.scenes),
  roleThreads: read(entry.threads), phaseDefinitions: read(manifest.shared.phaseDefinitions),
  lifeScenes: read(manifest.life.scenes), lifeThreads: read(manifest.life.threads) });
const ordinary = scene => scene.valg.find(c => !c.skills_requirement).id;
function play(state, sceneId, choiceId) {
  assert(Runner.getCandidateScenes(state, content).some(s => s.id === sceneId), sceneId + ' must actually be available');
  return Runner.applyChoice(state, content, sceneId, choiceId);
}
function until(state, id) {
  for (let n = 0; n < 60; n++) {
    const scene = Runner.selectNextScene(state, content);
    assert(scene, 'scene missing before ' + id);
    if (scene.id === id) return;
    play(state, scene.id, ordinary(scene));
  }
  assert.fail('did not reach ' + id);
}
function start(opening = 'aapne_raskt') {
  const s = State.createInitialState(content);
  until(s, 'apning_01_forste_okt');
  const before = s.meters.integritet;
  play(s, 'apning_01_forste_okt', opening);
  if (opening === 'aapne_raskt') assert.equal(s.meters.integritet, before, 'on-time shift start must not imply neglected work');
  until(s, 'prisfeil_02_koen');
  return s;
}
function finishDay(s) {
  for (let n = 0; !s.dagFerdig && n < 60; n++) {
    const scene = Runner.selectNextScene(s, content);
    assert(scene);
    play(s, scene.id, ordinary(scene));
  }
  assert(s.dagFerdig, 'day terminates');
}

// These cases intentionally leave real work pending before a saved day rollover.
for (const stage of ['investigation', 'report', 'check']) for (const resumeDay of [2, 3]) {
  let s = start();
  play(s, 'prisfeil_02_koen', stage === 'investigation' ? 'gjett_pris' : 'rett_synlig');
  if (stage === 'investigation') play(s, 'prisfeil_03_undersok_etter_snarevei', 'la_sta_apent');
  else if (stage === 'report') play(s, 'prisfeil_03_meld_avvik', 'utsett_melding');
  else {
    play(s, 'prisfeil_03_meld_avvik', 'send_notat');
    play(s, 'prisfeil_04_lene_bekrefter', 'kontroller_selv');
    play(s, 'prisfeil_05_sjekk_selv', 'ikke_kontrollert');
  }
  assert(!s.tidligereValg.eksp_life_pris_etterkontroll_verifisert);
  finishDay(s);
  s = Runner.startNextDay(JSON.parse(JSON.stringify(s)), content);
  const base = stage === 'investigation' ? 'prisfeil_03_undersok_etter_snarevei'
    : stage === 'report' ? 'prisfeil_03_meld_avvik' : 'prisfeil_05_sjekk_selv';
  if (resumeDay === 3) {
    until(s, base + '_d2');
    play(s, base + '_d2', stage === 'investigation' ? 'la_sta_apent' : stage === 'report' ? 'utsett_melding' : 'ikke_kontrollert');
    finishDay(s);
    s = Runner.startNextDay(JSON.parse(JSON.stringify(s)), content);
  }
  const suffix = '_d' + resumeDay;
  until(s, base + suffix);
  if (stage === 'investigation') play(s, base + suffix, 'sjekk_selv');
  if (stage !== 'check') {
    play(s, 'prisfeil_03_meld_avvik' + suffix, 'send_notat');
    play(s, 'prisfeil_04_lene_bekrefter' + suffix, 'amir_kontrollerer');
    assert(!s.tidligereValg.eksp_life_pris_etterkontroll_verifisert);
    assert.equal(Runner.selectNextScene(s, content).id, 'prisfeil_05_amir_sjekker' + suffix, 'only agreed delegated check appears');
    play(s, 'prisfeil_05_amir_sjekker' + suffix, 'registrer_amir');
    assert(s.tidligereValg.eksp_life_pris_etterkontroll_amir);
    assert(!s.tidligereValg.eksp_life_pris_etterkontroll_egen);
  } else play(s, base + suffix, 'kontroller_39');
  assert(s.tidligereValg.eksp_life_pris_etterkontroll_verifisert);
  assert.equal(s.threadState.prisfeilen_i_koen.status, 'completed');
  assert(Runner.getSymposium(s, content).tidslinje.some(row => row.sceneId.endsWith(suffix) && row.threadId === 'prisfeilen_i_koen'));
  finishDay(s);
  if (resumeDay === 2) s = Runner.startNextDay(JSON.parse(JSON.stringify(s)), content);
  assert(!Runner.getCandidateScenes(s, content).some(row => row.id.startsWith('prisfeil')), 'completed task cannot recover again');
}
for (const ending of ['full_lukking', 'laas_presis']) {
  const s = start();
  until(s, 'lukking_01_fem_minutter');
  const integrity = s.meters.integritet;
  play(s, 'lukking_01_fem_minutter', ending);
  assert(s.meters.integritet >= integrity, 'agreed handover must not penalize integrity');
  assert(s.tidligereValg.ryddet_for_neste_skift);
  assert(!s.tidligereValg.laaste_presis, 'ordinary handover cannot record locking the shop');
  assert(!s.tidligereValg.tok_nokkelansvar);
}
const own = start(), colleague = start();
const ownBefore = own.meters.integritet, colleagueBefore = colleague.meters.integritet;
const visibility = colleague.meters.synlighet;
play(own, 'prisfeil_02_koen', 'rett_synlig');
play(colleague, 'prisfeil_02_koen', 'rop_paa_amir');
assert.equal(colleague.meters.integritet - colleagueBefore, own.meters.integritet - ownBefore);
assert(colleague.meters.synlighet >= visibility, 'sound help-seeking must not incur an unexplained visibility penalty');
console.log('Ekspeditor continuity: 6 real day-2/day-3 recovery paths at 3 stages, actor attribution, no replay, ordinary shift and sound help-seeking OK');


// Day three: real choices, no fabricated history or meter/flag injection.
const Endings = require('../js/Civication/lifestory/lifestoryEndings.js');
assert.equal(Endings.resolveEnding(State.createInitialState(content), content).id,
  'arbeid_og_restoppgaver', 'without evidence, the ending must not invent achievements');
function dayThree(pressure = 'kort_pause', overrides = {}) {
  let s = State.createInitialState(content);
  const seen = new Set();
  for (let n = 0; n < 180 && s.dag < 3; n++) {
    if (s.dagFerdig) {
      const before = s.arkiv.map(x => [x.sceneId, x.valgId]);
      s = Runner.startNextDay(JSON.parse(JSON.stringify(s)), content);
      assert.deepEqual(s.arkiv.map(x => [x.sceneId, x.valgId]), before);
      continue;
    }
    const scene = Runner.selectNextScene(s, content);
    assert(scene, 'three-day route has a real next scene');
    const candidates = scene.valg.filter(c => !c.skills_requirement);
    let choice = candidates[0].id;
    if (s.dag === 1) choice = candidates.slice().sort((a,b) =>
      (a.effekter?.meters?.energi || 0) - (b.effekter?.meters?.energi || 0))[0].id;
    if (scene.id === 'd2_morgen_vaktpress_etter_stenging') { choice = pressure; seen.add(scene.id); }
    if (scene.id === 'd2_ettermiddag_nokkelen') choice = 'ta_ansvaret';
    play(s, scene.id, overrides[scene.id] || choice);
  }
  assert.equal(s.dag, 3);
  assert(seen.has('d2_morgen_vaktpress_etter_stenging'), 'actual low-capacity day-one choices reach day-two support request');
  return s;
}
function priceRequest(pressure = 'kort_pause') {
  const s = dayThree(pressure);
  until(s, 'd3_stamkunden_prismatch');
  return s;
}
for (const choice of ['hold_regelen_vennlig', 'tilby_det_du_kan', 'gi_etter_igjen']) {
  let s = priceRequest();
  const prior = s.arkiv.map(x => [x.sceneId,x.valgId]);
  assert(!s.tidligereValg.fant_lovlig_losning, 'unverified history cannot supply a day-three solution');
  play(s, 'd3_stamkunden_prismatch', choice);
  assert(!s.tidligereValg.fant_lovlig_losning, 'first response is not verified eligibility or a sale');
  assert(!s.tidligereValg.d3_pris_lene_avklart, 'return authority does not decide a prismatch request');
  if (choice === 'hold_regelen_vennlig') {
    play(s, 'd3_pris_02_lene_svarer', 'forklar_og_gjennomfor');
    assert(s.tidligereValg.d3_pris_handel_avklart);
    assert(s.tidligereValg.d3_pris_lene_avklart);
    assert(!s.tidligereValg.d3_pris_medlemspris_brukt);
  } else if (choice === 'tilby_det_du_kan') {
    play(s, 'd3_pris_02_medlemsvilkar', 'kontroller_og_gjennomfor');
    assert(s.tidligereValg.d3_pris_medlemsvilkar_kontrollert);
    assert(s.tidligereValg.d3_pris_medlemspris_brukt);
    assert(s.tidligereValg.d3_pris_handel_avklart);
    assert(s.tidligereValg.fant_lovlig_losning);
  } else {
    assert(s.tidligereValg.d3_pris_avvik_apent);
    assert(!s.tidligereValg.d3_pris_avvik_meldt);
    play(s, 'd3_pris_02_meld_avslag', 'meld_avviket');
    assert(s.tidligereValg.d3_pris_avvik_meldt);
    assert(!s.tidligereValg.d3_pris_ansvar_bekreftet);
    play(s, 'd3_pris_03_lene_bekrefter', 'registrer_mottaket');
    assert(s.tidligereValg.d3_pris_ansvar_bekreftet);
    assert(s.tidligereValg.d3_pris_avvik_apent, 'receipt is not correction of the unauthorized discount');
    assert.equal(s.threadState.kunden_som_tror_du_bestemmer.status, 'escalated');
  }
  s = JSON.parse(JSON.stringify(s));
  assert.deepEqual(s.arkiv.slice(0,prior.length).map(x=>[x.sceneId,x.valgId]), prior);
  assert.equal(s.arkiv.filter(x=>x.sceneId==='d3_stamkunden_prismatch').length,1);
  const timeline = Runner.getSymposium(s,content).tidslinje;
  assert(timeline.some(x=>x.sceneId==='d3_stamkunden_prismatch' && x.valgId===choice));
}
// Waiting must not silently complete a transaction or its follow-up.
for (const route of ['manager', 'member', 'report']) {
  const s = priceRequest();
  play(s, 'd3_stamkunden_prismatch', route==='manager'?'hold_regelen_vennlig':route==='member'?'tilby_det_du_kan':'gi_etter_igjen');
  if (route==='manager') play(s, 'd3_pris_02_lene_svarer','avvent_kunden');
  else if(route==='member') play(s,'d3_pris_02_medlemsvilkar','avvent_kunden');
  else play(s,'d3_pris_02_meld_avslag','utsett_melding');
  assert(!s.tidligereValg.d3_pris_handel_avklart);
  assert.equal(s.threadState.kunden_som_tror_du_bestemmer.status,'escalated');
  if(route==='report') assert(!s.tidligereValg.d3_pris_avvik_meldt);
}
for (const pressure of ['kort_pause','be_om_stotte','press_videre']) {
  const s = dayThree(pressure);
  const id = pressure==='kort_pause'?'d3_ettermiddag_pause_virket'
    :pressure==='be_om_stotte'?'d3_ettermiddag_kollegastotten':'d3_ettermiddag_presset_sitter';
  until(s,id);
  const visibility = s.meters.synlighet;
  play(s,id,pressure==='kort_pause'?'foresla_felles_pauser':pressure==='be_om_stotte'?'hjelp_vikaren':'si_fra_nu');
  assert(s.meters.synlighet>=visibility, 'planning or receiving sound relief does not cost status');
  if(pressure==='kort_pause') {
    assert(s.tidligereValg.ekspeditor_pauser_avtalt);
    assert(!s.tidligereValg.d3_pause_gjennomfort, 'a confirmed future break plan is not a taken break');
    const scene = content.scenes.find(x=>x.id===id);
    assert.equal(scene.avsender,'butikksjef', 'manager speaks for staffing authority');
  } else if(pressure==='be_om_stotte') {
    assert(s.tidligereValg.d3_stotte_vikar_egen_kontroll);
    assert(!s.tidligereValg.d3_stotte_amir_kontroll_bekreftet);
  } else assert(s.tidligereValg.ekspeditor_brøt_pressmønster);
  assert.equal(s.threadState.arbeidsrytme_og_overskudd.status,'completed');
  finishDay(s);
  assert(Endings.resolveEnding(s,content));
}
let delegated = dayThree('be_om_stotte');
until(delegated,'d3_ettermiddag_kollegastotten');
play(delegated,'d3_ettermiddag_kollegastotten','del_med_amir');
assert(delegated.tidligereValg.d3_stotte_amir_opplaering_venter);
assert(!delegated.tidligereValg.ekspeditor_stotte_gitt_videre);
play(delegated,'d3_stotte_02_amir_resultat','kontroller_resultatet');
assert(delegated.tidligereValg.d3_stotte_amir_kontroll_bekreftet);
assert(!delegated.tidligereValg.d3_stotte_amir_opplaering_venter);
assert(!delegated.tidligereValg.ekspeditor_stotte_gitt_videre, 'Amir keeps the credit for his own instruction');
let unresolved = dayThree('press_videre');
until(unresolved,'d3_ettermiddag_presset_sitter');
play(unresolved,'d3_ettermiddag_presset_sitter','press_igjen');
assert.equal(unresolved.threadState.arbeidsrytme_og_overskudd.status,'escalated');
// A partially matching legacy flag may not invent a composite achievement.
for (const ending of content.role.endings.filter(x=>!x.standard)) {
  assert.equal(Object.keys(ending.kriterier.flagg).length,1, 'each authored claim has one concrete evidence flag');
  assert.deepEqual(Object.keys(ending.kriterier),['flagg'], 'no meter hit can amplify an unrelated partial claim');
}
console.log('Ekspeditor day three: actual price checks, unresolved variants, three support paths, actor attribution and neutral endings OK');

// Each of the six authored endings is reachable through actual complete weeks.
const leavePriceOpen = { prisfeil_02_koen: 'gjett_pris',
  prisfeil_03_undersok_etter_snarevei: 'la_sta_apent',
  prisfeil_03_undersok_etter_snarevei_d2: 'la_sta_apent',
  prisfeil_03_undersok_etter_snarevei_d3: 'la_sta_apent' };
const ownTraining = { ny_kollega_01_midt_i_koen: 'hjelp_kort',
  ny_kollega_02_vis_pantekort: 'vis_en_gang', ny_kollega_03_vikar_forklarer: 'sjekk_forklaringen' };
const endingsSeen = new Set();
for (const [expected, overrides] of [
  ['trygg_paa_gulvet', {}],
  ['mistet_tilliten', { d3_stamkunden_prismatch: 'gi_etter_igjen' }],
  ['faar_ting_unna', { ...leavePriceOpen, lukking_01_fem_minutter: 'kutt_hjornene' }],
  ['nokkelbaerer', { ...leavePriceOpen }],
  ['butikksjef_emne', { ...leavePriceOpen, ...ownTraining, d2_ettermiddag_nokkelen: 'en_uke_til' }],
  ['arbeid_og_restoppgaver', { ...leavePriceOpen, ny_kollega_01_midt_i_koen: 'send_til_amir',
    d2_ettermiddag_nokkelen: 'en_uke_til' }]
]) {
  let s = State.createInitialState(content);
  for (let n = 0; n < 240; n++) {
    if (s.dagFerdig) {
      if (s.dag === 3) break;
      s = Runner.startNextDay(JSON.parse(JSON.stringify(s)),content); continue;
    }
    const sc = Runner.selectNextScene(s,content);
    assert(sc, 'complete ending route has a scene');
    const choices = sc.valg.filter(x=>!x.skills_requirement);
    const chosen = overrides[sc.id] || (s.dag===1 ? choices.slice().sort((a,b)=>
      (a.effekter?.meters?.energi||0)-(b.effekter?.meters?.energi||0)) : choices)[0].id;
    play(s,sc.id,chosen);
  }
  assert(s.dag===3 && s.dagFerdig);
  const e = Endings.resolveEnding(s,content);
  assert.equal(e.id,expected, 'complete actual history resolves the intended evidence-specific ending');
  const authored = content.role.endings.find(x=>x.id===e.id);
  if (!authored.standard) assert(s.tidligereValg[Object.keys(authored.kriterier.flagg)[0]] === true);
  const timeline = Runner.getSymposium(s,content).tidslinje;
  assert.deepEqual(timeline.map(x=>[x.sceneId,x.valgId]),s.arkiv.map(x=>[x.sceneId,x.valgId]));
  const restored = JSON.parse(JSON.stringify(s));
  assert.deepEqual(Endings.resolveEnding(restored,content),e, 'same evidence resolves same ending after reload');
  assert.equal(new Set(s.arkiv.map(x=>x.sceneId)).size,s.arkiv.length, 'no replayed scenes in completed week');
  endingsSeen.add(e.id);
}
assert.equal(endingsSeen.size,6);
let pendingAmir = dayThree('be_om_stotte');
until(pendingAmir,'d3_ettermiddag_kollegastotten');
play(pendingAmir,'d3_ettermiddag_kollegastotten','del_med_amir');
play(pendingAmir,'d3_stotte_02_amir_resultat','avvent_resultat');
assert(pendingAmir.tidligereValg.d3_stotte_amir_opplaering_venter);
assert(!pendingAmir.tidligereValg.d3_stotte_amir_kontroll_bekreftet);
assert.equal(pendingAmir.threadState.arbeidsrytme_og_overskudd.status,'escalated');
console.log('Ekspeditor: all six evidenced endings and unresolved delegated instruction follow actual saved three-day routes');

// A new transaction may not remove the escalation of an earlier waiting return.
for (const route of ['manager','member']) {
 const s = dayThree('kort_pause', {retur_01_uten_kvittering:'hent_lene',
   retur_02_hva_er_grunnen:'be_om_tid_til_bevis'});
 until(s,'d3_stamkunden_prismatch');
 assert(s.tidligereValg.retur_kjopsbevis_venter);
 assert.equal(s.threadState.kunden_som_tror_du_bestemmer.status,'escalated');
 play(s,'d3_stamkunden_prismatch',route==='manager'?'hold_regelen_vennlig':'tilby_det_du_kan');
 assert.equal(s.threadState.kunden_som_tror_du_bestemmer.status,'escalated','new request preserves older escalation');
 play(s,route==='manager'?'d3_pris_02_lene_svarer':'d3_pris_02_medlemsvilkar',
   route==='manager'?'forklar_og_gjennomfor':'kontroller_og_gjennomfor');
 assert(s.tidligereValg.d3_pris_handel_avklart);
 assert(s.tidligereValg.retur_kjopsbevis_venter);
 assert.equal(s.threadState.kunden_som_tror_du_bestemmer.status,'escalated','one completed sale does not resolve the other case');
}
