#!/usr/bin/env node
// Civication Life Story: rolle nummer to — Renholder.
// Validerer fortellingspakken (de fire lovene via buildContent), spiller hele
// Dag 1 gjennom Day Runner, og verifiserer at Dag 2 forgrenes på Dag 1
// (avviksmelding => vernerunde-oppfølging, ikke glatt gulv-etterspillet).
// Verifiserer også dev-/testparameteren (?lifestoryRole= / localStorage);
// roller fortjenes gjennom quiz — standard uten jobb er arbeidsledig.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");

const ROOT = path.join(__dirname, "..");
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const manifest = readJson("data/Civication/lifestory/manifest.json");
const roleEntry = manifest.roles.renholder;
assert.ok(roleEntry, "manifestet må ha rollen renholder");
assert.ok(manifest.roles.arealplanlegger, "pilotrollen skal fortsatt ligge i manifestet");

const raw = {
  role: readJson(roleEntry.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(roleEntry.threads),
  roleScenes: readJson(roleEntry.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};

// --- Pakken består de fire lovene (buildContent kaster ellers) ---
const content = Content.buildContent(raw);
assert.strictEqual(content.role.id, "renholder");
assert.strictEqual(raw.roleThreads.threads.length, 9, "fem opprinnelige arbeidstråder og fire C17-ledd");
assert.ok(content.threads.length >= 9, "arbeidstråder + delte privattråder");
assert.ok(raw.roleThreads.threads.every((t) => t.type === "arbeidsliv"), "rolletrådene er arbeidsliv");

// Rollens kjernekonflikter fra FWG-en er representert som tråder.
const threadIds = raw.roleThreads.threads.map((t) => t.id);
assert.deepStrictEqual(threadIds.sort(), [
  "rommet_som_saa_rent_ut", "ryggen_sier_fra", "soelet_i_fellesarealet",
  "tidsvinduet_krymper", "usynlig_arbeid", "wave_a_c17", "wave_b_c17", "wave_c_c17", "wave_d_c17"
].sort());

// Personene kommer fra rollens actor-grammatikk og finnes i startState.
for (const person of ["driftsleder", "erfaren_kollega", "kontorbruker", "verneombud"]) {
  assert.ok(typeof content.role.startState.relasjoner[person] === "number",
    `relasjonen ${person} mangler i startState`);
}

// Privatlivsscenene er rolle-agnostiske: ingen delt livsscene refererer
// rollespesifikke tråder i conditions (det ville brukket andre roller).
for (const scene of raw.lifeScenes.scenes) {
  for (const threadId of Object.keys(scene.conditions?.threads || {})) {
    assert.ok(raw.lifeThreads.threads.some((t) => t.id === threadId),
      `livsscene ${scene.id} betinger på ikke-delt tråd "${threadId}"`);
  }
}

// --- Dag 1: privat morgen først, deretter renholder-scenene ---
let state = State.createInitialState(content);
assert.strictEqual(state.rolle, "renholder");
assert.strictEqual(state.meters.penger, 340);
assert.strictEqual(state.meters.synlighet, 28, "usynlig arbeid: lav synlighet fra start");
assert.strictEqual(state.relasjoner.erfaren_kollega, 55);

let view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "privat_morgen_start", "dagen starter privat (delt livsscene)");

Runner.applyChoice(state, content, "privat_morgen_start", view.scene.valg[0].id);
view = Runner.getView(state, content);
assert.strictEqual(view.scene.id, "rommet_01_melding", "første jobbscene: rommet som så rent ut");

// Hygienisk rent-valget låser opp oppfølgingen med Kari i formiddagsfasen.
const integritetFoer = state.meters.integritet;
const result = Runner.applyChoice(state, content, "rommet_01_melding", "beroeringspunkter");
assert.deepStrictEqual(result.laasteOpp, ["rommet_02_standard"]);
assert.strictEqual(state.meters.integritet, integritetFoer + 5);
assert.strictEqual(state.tidligereValg.tok_hygienisk_rent, true);
assert.match(result.konsekvensTekst, /Romlista:.*håndtak.*Lukten.*drift/i,
  "renholderen skal registrere utført arbeid og gi luktproblemet videre");

// --- Spill resten av dag 1 deterministisk (alltid første valg) ---
// Første valg i soel_01_krise er meld_avvik => flagget meldte_avvik settes,
// og sølet-tråden eskalerer. Det er forgreningsgrunnlaget for dag 2.
let guard = 0;
while (!state.dagFerdig) {
  const scene = Runner.selectNextScene(state, content);
  assert.ok(scene, "det skal alltid finnes en scene til dagen er ferdig");
  Runner.applyChoice(state, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 50, "dagen må terminere");
}

const spilteFaser = new Set(state.arkiv.map((entry) => entry.fase));
assert.deepStrictEqual([...spilteFaser].sort(), ["ettermiddag", "formiddag", "kveld", "morgen"],
  "alle fire faser ble spilt");
const spilteScener = state.arkiv.map((e) => e.sceneId);
for (const kjerne of ["rommet_01_melding", "rommet_02_standard", "tidsvindu_01_telefon", "soel_01_krise", "rygg_01_vurdering", "usynlig_01_melding"]) {
  assert.ok(spilteScener.includes(kjerne), `kjernescenen ${kjerne} ble spilt på dag 1`);
}
assert.strictEqual(state.tidligereValg.meldte_avvik, true, "første valg i sølet var å melde avvik");
assert.strictEqual(state.threadState.soelet_i_fellesarealet.status, "escalated");
const meetingRoomHistory = Runner.getSymposium(JSON.parse(JSON.stringify(state)), content).tidslinje
  .filter((entry) => entry.sceneId === "rommet_01_melding");
assert.strictEqual(meetingRoomHistory.length, 1);
assert.strictEqual(meetingRoomHistory[0].valgId, "beroeringspunkter");
assert.strictEqual(meetingRoomHistory[0].konsekvensTekst, result.konsekvensTekst);

// --- Dag 2 leser dag 1: avviket ble meldt => vernerunden, ikke etterspillet ---
State: {
  state = Runner.startNextDay(state, content);
}
assert.strictEqual(state.dag, 2);
const dag2Kandidater = Runner.getCandidateScenes(state, content).map((s) => s.id);
assert.ok(dag2Kandidater.includes("d2_avvik_fulgt_opp"),
  "meldt avvik => Ole følger opp med vernerunden");
assert.ok(!dag2Kandidater.includes("d2_glatt_gulv_etterspill"),
  "etterspill-scenen skal ikke være kandidat når avviket ble meldt");

// Spill dag 2 til ende — ingen krasj, og runde-med-Amina-scenen inngår.
guard = 0;
while (!state.dagFerdig) {
  const scene = Runner.selectNextScene(state, content);
  if (!scene) break; // tom fase avsluttes trygt av runneren via getView/advance
  Runner.applyChoice(state, content, scene.id, scene.valg[0].id);
  assert.ok(++guard < 50, "dag 2 må terminere");
}
assert.ok(state.arkiv.some((e) => e.sceneId === "d2_runde_med_amina"), "Amina-runden ble spilt på dag 2");

// --- Motsatt gren: ikke meldt avvik => etterspillet, ikke vernerunden ---
let state2 = State.createInitialState(content);
guard = 0;
while (!state2.dagFerdig) {
  const scene = Runner.selectNextScene(state2, content);
  assert.ok(scene, "dag 1 (gren 2) skal ha scener");
  // Velg tørk-og-gå i sølet, ellers første valg.
  const valgId = scene.id === "soel_01_krise" ? "toerk_og_gaa" : scene.valg[0].id;
  Runner.applyChoice(state2, content, scene.id, valgId);
  assert.ok(++guard < 50, "dag 1 (gren 2) må terminere");
}
assert.ok(!("meldte_avvik" in state2.tidligereValg), "avviket ble ikke meldt i gren 2");
state2 = Runner.startNextDay(state2, content);
const gren2Kandidater = Runner.getCandidateScenes(state2, content).map((s) => s.id);
assert.ok(gren2Kandidater.includes("d2_glatt_gulv_etterspill"),
  "ikke meldt avvik => Kari spør om det glatte gulvet");
assert.ok(!gren2Kandidater.includes("d2_avvik_fulgt_opp"),
  "vernerunde-scenen skal ikke være kandidat uten meldt avvik");

for (const [choiceId, expectedLog] of [
  ["synlig_runde", /håndtak og brytere gjenstår/],
  ["spor_amina", /Amina tar håndtak og brytere/]
]) {
  const roomState = State.createInitialState(content);
  const morning = Runner.getView(roomState, content).scene;
  Runner.applyChoice(roomState, content, morning.id, morning.valg[0].id);
  const roomScene = Runner.getView(roomState, content).scene;
  assert.strictEqual(roomScene.id, "rommet_01_melding");
  const roomResult = Runner.applyChoice(roomState, content, roomScene.id, choiceId);
  assert.deepStrictEqual(roomResult.laasteOpp, ["rommet_02_standard"]);
  assert.match(roomResult.konsekvensTekst, expectedLog);
}

// --- Min dag-UI: dev-parameteren finnes, startkontrakten står ---
const uiSource = fs.readFileSync(path.join(ROOT, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
assert.ok(uiSource.includes('DEFAULT_ROLE_ID = "arbeidsledig"'),
  "startkontrakten: du starter arbeidsledig (jobb via quiz/merker)");
assert.ok(uiSource.includes("lifestoryRole"), "dev-/testparameteren ?lifestoryRole= finnes");
assert.ok(uiSource.includes("civication_lifestory_role_v1"), "dev-parameteren persisteres i localStorage");

console.log("civication lifestory renholder ok (" + state.arkiv.length + " scener over 2 dager, begge dag-2-grener verifisert)");

// Capacity replies are not executed rooms. All evidence is earned through real scenes.
const roomFlag = (s,k) => s.tidligereValg[k] === true;
function chooseRoom(s,id,choice) {
  assert.strictEqual(Runner.selectNextScene(s,content)?.id,id,'actual next room case: '+id);
  return Runner.applyChoice(s,content,id,choice);
}
function reachRoom(s,id) {
  for(let n=0;n<90;n++) {
    const sc=Runner.selectNextScene(s,content);assert.ok(sc,'reachable scene '+id);
    if(sc.id===id)return;
    Runner.applyChoice(s,content,sc.id,sc.valg.find(v=>!v.skills_requirement).id);
  }
  assert.fail('failed to reach '+id);
}
function roomRequest(id='ta_stille') {
  const s=State.createInitialState(content);
  reachRoom(s,'tidsvindu_01_telefon');
  const relation=s.relasjoner.driftsleder, visibility=s.meters.synlighet;
  chooseRoom(s,'tidsvindu_01_telefon',id);
  assert.ok(!roomFlag(s,'tok_ekstra_rom'),'a phone reply is not extra rooms performed');
  assert.ok(!roomFlag(s,'delte_sonen'),'proposal is not a confirmed division');
  assert.ok(!roomFlag(s,'ren_tid_wc3_spiller'));
  if(id==='sett_grense') {
    assert.ok(s.relasjoner.driftsleder>=relation,'capacity boundary is not automatically punished');
    assert.ok(s.meters.synlighet>=visibility);
  }
  return s;
}
const workFlags=['ren_tid_wc3_spiller','ren_tid_korridor3_amina','ren_tid_kontorer_spiller','ren_tid_trapp_spiller'];
const variants=[
 ['ta_stille','prioriter_toaletter','tid_03_toaletter','utfor_og_kontroller'],
 ['ja_men_si_fra','bekreft_deling','tid_03_toaletter','utfor_og_kontroller'],
 ['sett_grense','behold_egen_rute','tid_03_egen_rute','utfor_og_kontroller'],
 ['foreslaa_bytte','bekreft_deling','tid_03_toaletter','utfor_og_kontroller']
];
for(const [start,plan,execution,action] of variants) {
 let s=roomRequest(start);
 chooseRoom(s,'tid_02_kari_prioriterer',plan);
 assert.ok(roomFlag(s,'ren_tid_plan_bekreftet'));
 assert.ok(workFlags.every(k=>!roomFlag(s,k)),'a confirmed plan is not performed work');
 assert.strictEqual(roomFlag(s,'delte_sonen'),plan==='bekreft_deling');
 chooseRoom(s,execution,action);
 if(plan==='behold_egen_rute') {
   assert.ok(roomFlag(s,'ren_tid_kontorer_spiller')&&roomFlag(s,'ren_tid_trapp_spiller'));
   assert.ok(!roomFlag(s,'tok_ekstra_rom'));
   assert.ok(!roomFlag(s,'ren_tid_wc3_spiller'));
 } else {
   assert.ok(roomFlag(s,'ren_tid_wc3_spiller')&&roomFlag(s,'tok_ekstra_rom'));
   assert.ok(!roomFlag(s,'ren_tid_kontorer_spiller'));
   assert.ok(roomFlag(s,'ren_tid_kontorer_utsatt'));
 }
 if(plan==='bekreft_deling') {
   assert.ok(roomFlag(s,'ren_tid_amina_venter'));
   assert.ok(!roomFlag(s,'ren_tid_korridor3_amina'));
   chooseRoom(s,'tid_04_amina_resultat','registrer_amina');
   assert.ok(roomFlag(s,'ren_tid_korridor3_amina'));
   assert.ok(!roomFlag(s,'ren_tid_amina_venter'));
   assert.ok(!roomFlag(s,'ren_tid_korridor3_spiller'),'Amina retains her own work');
 }
 assert.ok(!roomFlag(s,'ren_tid_kari_mottatt'));
 chooseRoom(s,'tid_05_kari_mottar','overlever_status');
 assert.ok(roomFlag(s,'ren_tid_kari_mottatt'));
 const before=s.arkiv.map(x=>[x.sceneId,x.valgId]);
 s=JSON.parse(JSON.stringify(s));
 assert.deepStrictEqual(s.arkiv.map(x=>[x.sceneId,x.valgId]),before);
 assert.ok(Runner.getSymposium(s,content).tidslinje.some(x=>x.sceneId===execution&&x.valgId===action));
 // Complete all seven authored days without injecting history or resetting room evidence.
 let guard=0;
 while(true) {
   if(s.dagFerdig) { if(s.dag===7)break; s=Runner.startNextDay(JSON.parse(JSON.stringify(s)),content); }
   const sc=Runner.selectNextScene(s,content);assert.ok(sc);
   Runner.applyChoice(s,content,sc.id,sc.valg.find(v=>!v.skills_requirement).id);
   assert.ok(++guard<220);
 }
 assert.ok(roomFlag(s,'ren_tid_kari_mottatt'));
 assert.strictEqual(new Set(s.arkiv.map(x=>x.sceneId)).size,s.arkiv.length,'no replay across seven days');
 assert.strictEqual(s.tidligereValg.wa_d_c17_status,'andre_rom_tilbudt','the actual C17 route still ends with the warehouse blocked');
}
// Pending plan, work, colleague result and receiver remain distinct.
let pending=roomRequest('sett_grense');
chooseRoom(pending,'tid_02_kari_prioriterer','avvent_plan');
assert.ok(!roomFlag(pending,'ren_tid_plan_bekreftet'));
assert.ok(workFlags.every(k=>!roomFlag(pending,k)));
assert.strictEqual(pending.threadState.tidsvinduet_krymper.status,'escalated');
let undone=roomRequest();
chooseRoom(undone,'tid_02_kari_prioriterer','prioriter_toaletter');
chooseRoom(undone,'tid_03_toaletter','meld_ikke_utfort');
assert.ok(roomFlag(undone,'ren_tid_egen_oppgave_venter'));
assert.ok(!roomFlag(undone,'ren_tid_wc3_spiller'));
chooseRoom(undone,'tid_05_kari_mottar','avvent_mottak');
assert.ok(!roomFlag(undone,'ren_tid_kari_mottatt'));
let waiting=roomRequest('foreslaa_bytte');
chooseRoom(waiting,'tid_02_kari_prioriterer','bekreft_deling');
chooseRoom(waiting,'tid_03_toaletter','utfor_og_kontroller');
chooseRoom(waiting,'tid_04_amina_resultat','avvent_resultat');
chooseRoom(waiting,'tid_05_kari_mottar','overlever_status');
assert.ok(roomFlag(waiting,'ren_tid_amina_venter'));
assert.ok(!roomFlag(waiting,'ren_tid_korridor3_amina'));
for(let [s,pendingFlag] of [[pending,'ren_tid_plan_venter'],[undone,'ren_tid_egen_oppgave_venter'],[waiting,'ren_tid_amina_venter']]) {
 for(let n=0;!s.dagFerdig&&n<90;n++) {
   const sc=Runner.selectNextScene(s,content);assert.ok(sc);
   Runner.applyChoice(s,content,sc.id,sc.valg.find(v=>!v.skills_requirement).id);
 }
 s=Runner.startNextDay(JSON.parse(JSON.stringify(s)),content);
 while(!s.dagFerdig) {
   const sc=Runner.selectNextScene(s,content);assert.ok(sc);
   Runner.applyChoice(s,content,sc.id,sc.valg.find(v=>!v.skills_requirement).id);
 }
 assert.strictEqual(s.threadState.tidsvinduet_krymper.status,'escalated','day-two review cannot resolve pending earlier work');
 assert.ok(roomFlag(s,pendingFlag),'the specific outstanding step survives review and reload');
 assert.ok(!roomFlag(s,'ren_tid_korridor3_amina'));
}
console.log('Renholder capacity: all four replies, three confirmed plans, both actors, pending variants and actual seven-day persistence OK');

// A later actual receipt can resolve only that missing step, not perform other work.
let receipt=roomRequest();
chooseRoom(receipt,'tid_02_kari_prioriterer','prioriter_toaletter');
chooseRoom(receipt,'tid_03_toaletter','utfor_og_kontroller');
chooseRoom(receipt,'tid_05_kari_mottar','avvent_mottak');
assert.ok(roomFlag(receipt,'ren_tid_mottak_venter'));
assert.ok(!roomFlag(receipt,'ren_tid_kari_mottatt'));
while(!receipt.dagFerdig) {
 const sc=Runner.selectNextScene(receipt,content);assert.ok(sc);
 Runner.applyChoice(receipt,content,sc.id,sc.valg.find(v=>!v.skills_requirement).id);
}
receipt=Runner.startNextDay(JSON.parse(JSON.stringify(receipt)),content);
reachRoom(receipt,'d2_standard_ekstra_rom');
chooseRoom(receipt,'d2_standard_ekstra_rom','vis_tidsregnskap');
assert.ok(roomFlag(receipt,'ren_tid_kari_mottatt'));
assert.ok(!roomFlag(receipt,'ren_tid_mottak_venter'));
assert.ok(roomFlag(receipt,'ren_tid_wc3_spiller'));
assert.ok(!roomFlag(receipt,'ren_tid_kontorer_spiller'));
assert.ok(roomFlag(receipt,'ren_tid_kontorer_utsatt'));
let separate=roomRequest('foreslaa_bytte');
chooseRoom(separate,'tid_02_kari_prioriterer','bekreft_deling');
chooseRoom(separate,'tid_03_toaletter','meld_ikke_utfort');
chooseRoom(separate,'tid_04_amina_resultat','registrer_amina');
assert.ok(roomFlag(separate,'ren_tid_korridor3_amina'));
assert.ok(!roomFlag(separate,'ren_tid_wc3_spiller'));
assert.ok(roomFlag(separate,'ren_tid_egen_oppgave_venter'));
console.log('Renholder: later actual receipt and independently completed colleague work remain separate from unfinished own rooms');

// A request for ergonomic support is not demonstrated or learned technique.
let support=State.createInitialState(content);
reachRoom(support,'rygg_01_vurdering');
chooseRoom(support,'rygg_01_vurdering','spor_ole');
assert.ok(!support.tidligereValg.laerte_teknikk,'asking Ole cannot establish learned technique');

const learnedFlag=(s,k)=>s.tidligereValg[k]===true;
function finishLearningDay(s){
 for(let n=0;!s.dagFerdig;n++){
  assert.ok(n<130,'learning route terminates');
  const scene=Runner.selectNextScene(s,content);assert.ok(scene);
  Runner.applyChoice(s,content,scene.id,scene.valg.find(v=>!v.skills_requirement).id);
 }
 return s;
}
const burdenRoutes=[['bekreft_plan','utfor_transport'],['bekreft_plan','stopp_og_meld'],['avvent_plan',null]];
const learningRoutes=[
 ['bare_jobbe',null,null,null],
 ...['laer_metoden','foreslaa_forbedring'].flatMap(start=>[
  [start,'utsett_demonstrasjon',null,null],
  [start,'se_demonstrasjon','avbryt_og_spor',null],
  [start,'se_demonstrasjon','utfor_ovelsen','faa_tilbakemelding'],
  [start,'se_demonstrasjon','utfor_ovelsen','avvent_tilbakemelding']
 ])
];
let learningRouteCount=0;
for(const initial of ['ta_pausen','press_gjennom','spor_ole'])for(const [plan,work] of burdenRoutes)for(const receipt of ['bekreft_mottak','avvent_mottak'])for(const [learn,demo,practice,feedback] of learningRoutes){
 let s=State.createInitialState(content);reachRoom(s,'rygg_01_vurdering');chooseRoom(s,'rygg_01_vurdering',initial);
 assert.equal(learnedFlag(s,'tok_pausen'),initial==='ta_pausen');
 assert.ok(!learnedFlag(s,'laerte_teknikk')&&!learnedFlag(s,'ren_bel_transport_utfort'));
 assert.notEqual(s.threadState.ryggen_sier_fra.status,'completed');
 chooseRoom(s,'rygg_02_plan',plan);assert.ok(!learnedFlag(s,'ren_bel_transport_utfort'),'plan is not transport');
 if(work)chooseRoom(s,'rygg_03_transport',work);
 assert.equal(learnedFlag(s,'ren_bel_transport_utfort'),work==='utfor_transport');
 chooseRoom(s,'rygg_04_mottak',receipt);
 assert.equal(learnedFlag(s,'ren_bel_mottatt'),receipt==='bekreft_mottak');
 assert.equal(learnedFlag(s,'ren_bel_transport_utfort'),work==='utfor_transport','receipt cannot move bags');
 assert.ok(!learnedFlag(s,'ren_soel_tralle_utbedret'),'renholdsvogn does not repair kaffetralle');
 finishLearningDay(s);s=Runner.startNextDay(JSON.parse(JSON.stringify(s)),content);reachRoom(s,'d2_runde_med_amina');
 const relation=s.relasjoner.erfaren_kollega;
 chooseRoom(s,'d2_runde_med_amina',learn);
 assert.ok(!learnedFlag(s,'laerte_soneprioritering')&&!learnedFlag(s,'ren_opp_demo_sett')&&!learnedFlag(s,'ren_opp_ovelse_utfort'),'reply/proposal is not learning');
 if(learn==='bare_jobbe')assert.equal(s.relasjoner.erfaren_kollega,relation,'deferring training is not automatically punished');
 if(demo){chooseRoom(s,'opp_02_demonstrasjon',demo);assert.ok(!learnedFlag(s,'laerte_soneprioritering')&&!learnedFlag(s,'ren_opp_ovelse_utfort'),'watching is not own practice');}
 if(practice){chooseRoom(s,'opp_03_egen_ovelse',practice);assert.ok(!learnedFlag(s,'laerte_soneprioritering'),'practice still needs feedback');}
 if(feedback)chooseRoom(s,'opp_04_tilbakemelding',feedback);
 assert.equal(learnedFlag(s,'ren_opp_demo_sett'),demo==='se_demonstrasjon');
 assert.equal(learnedFlag(s,'ren_opp_ovelse_utfort'),practice==='utfor_ovelsen');
 assert.equal(learnedFlag(s,'ren_opp_tilbakemelding'),feedback==='faa_tilbakemelding');
 assert.equal(learnedFlag(s,'laerte_soneprioritering'),feedback==='faa_tilbakemelding');
 assert.ok(!learnedFlag(s,'laerte_teknikk'),'no general lifting qualification');
 assert.ok(!learnedFlag(s,'ren_tid_korridor3_spiller'),'Amina retains her earlier room work');
 const proof=JSON.parse(JSON.stringify(s.tidligereValg));const archive=JSON.parse(JSON.stringify(s.arkiv));
 s=JSON.parse(JSON.stringify(s));assert.deepEqual(s.arkiv,archive);
 for(const row of archive.filter(x=>x.sceneId.startsWith('rygg_')||x.sceneId.startsWith('opp_'))){
  assert.ok(Runner.getSymposium(s,content).tidslinje.some(x=>x.sceneId===row.sceneId&&x.valgId===row.valgId&&x.konsekvensTekst===row.konsekvensTekst));
 }
 finishLearningDay(s);
 while(s.dag<7){s=Runner.startNextDay(JSON.parse(JSON.stringify(s)),content);finishLearningDay(s);}
 for(const k of Object.keys(proof).filter(k=>k.startsWith('ren_bel_')||k.startsWith('ren_opp_')))assert.equal(s.tidligereValg[k],proof[k],'specific evidence survives seven days '+k);
 assert.equal(s.tidligereValg.wa_d_c17_status,'andre_rom_tilbudt');
 learningRouteCount++;
}
assert.equal(learningRouteCount,162);
console.log('Renholder learning: 162 actual routes; plan/work/receipt, demo/practice/feedback, deferred and interrupted variants, exact Symposium and seven-day persistence OK');
// Compatibility fixture: a legacy save can contain historical learning flags,
// but those flags are not new demonstration/practice/feedback events.
let legacyLearning=State.createInitialState(content);
legacyLearning.tidligereValg.laerte_teknikk=true;
legacyLearning.tidligereValg.laerte_soneprioritering=true;
legacyLearning=JSON.parse(JSON.stringify(legacyLearning));
assert.ok(!legacyLearning.tidligereValg.ren_opp_demo_sett&&!legacyLearning.tidligereValg.ren_opp_ovelse_utfort&&!legacyLearning.tidligereValg.ren_opp_tilbakemelding);
assert.ok(!Runner.getCandidateScenes(legacyLearning,content).some(x=>x.id.startsWith('opp_')),'legacy learning does not unlock new training scenes');
assert.equal(Runner.getSymposium(legacyLearning,content).tidslinje.length,0,'no invented archive from old flags');
// Player-facing training feedback must explain the observed result, not storage flags.
for(const scene of raw.roleScenes.scenes.filter(x=>x.id==='d2_runde_med_amina'||x.id.startsWith('opp_')||x.id.startsWith('rygg_'))){
 const text=[scene.tekst,...scene.valg.flatMap(v=>[v.tekst,v.konsekvensTekst])].join(' ');
 assert.doesNotMatch(text,/læringsmarkør|tidligereValg|ren_opp_|ren_bel_/i,'technical implementation leaked into scene '+scene.id);
}
