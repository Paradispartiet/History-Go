#!/usr/bin/env node
// Renholder uke 2: arbeid, avtale og mottak må holdes atskilt.
// Dette tester rollelokal Life Story etter en faktisk spilt første uke.
// Ansettelse og dag-8-utbetaling er bevist i egen ekte browser-E2E (#7303).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");
function read(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
}
const manifest = read("data/Civication/lifestory/manifest.json");
const entry = manifest.roles.renholder;
const raw = {
  role: read(entry.role),
  phaseDefinitions: read(manifest.shared.phaseDefinitions),
  roleThreads: read(entry.threads),
  roleScenes: read(entry.scenes),
  lifeThreads: read(manifest.life.threads),
  lifeScenes: read(manifest.life.scenes)
};
const content = Content.buildContent(raw);
const ids = raw.roleScenes.scenes.filter(scene => scene.dag === 8 || scene.dag === 9).map(scene => scene.id);
assert.deepEqual(ids.sort(), [
  "ren_u2_d8_ukeplan",
  "ren_u2_d9_tilkomst",
  "ren_u2_d9_soner",
  "ren_u2_d9_belastning",
  "ren_u2_d9_kari_mottak"
].sort());
assert.equal(raw.roleThreads.threads.filter(t => t.id === "renholder_uke2_oppfolging").length, 1);
assert.equal(raw.roleThreads.threads.find(t => t.id === "renholder_uke2_oppfolging").startDag, 8);

function playDay(state, picks = {}, label = "") {
  let steps = 0;
  while (!state.dagFerdig) {
    const scene = Runner.selectNextScene(state, content);
    assert.ok(scene, label + ": found playable scene on day " + state.dag);
    const chosen = picks[scene.id] || scene.valg.find(v => !v.skills_requirement)?.id;
    assert.ok(chosen, label + ": choice exists for " + scene.id);
    Runner.applyChoice(state, content, scene.id, chosen);
    assert.ok(++steps < 120, label + ": day terminates");
  }
  assert.equal(state.dagFerdig, true, label + ": day completed");
  return state;
}
function nextDay(state) {
  assert.equal(state.dagFerdig, true);
  const before = state.dag;
  Runner.startNextDay(state, content);
  assert.equal(state.dag, before + 1, "one story-day rollover");
  return state;
}

// Generate an ordinary first-week archive via the production runner. No
// invented job, progress, receipt, payment, or direct state mutation.
const week1 = State.createInitialState(content);
for (let day = 1; day <= 7; day++) {
  assert.equal(week1.dag, day);
  playDay(week1, {}, "week 1 day " + day);
  if (day < 7) nextDay(week1);
}
const earlierArchive = week1.arkiv.map(row => [row.sceneId, row.valgId]);
assert.ok(earlierArchive.length > 30, "first week is genuinely played");
assert.ok(!week1.spilteScener.includes("ren_u2_d8_ukeplan"), "week two did not fire early");

const cases = [
  {choice:"ettersporr_tilkomst", branch:"ren_u2_d9_tilkomst",
    plan:"tilkomst", day9:"behold_sperring", status:"tilkomst_uavklart", receipt:"overlever_kari"},
  {choice:"avklar_andre_soner", branch:"ren_u2_d9_soner",
    plan:"soner", day9:"utfor_korridor", status:"korridor_utfort", receipt:"overlever_kari"},
  {choice:"avklar_andre_soner", branch:"ren_u2_d9_soner",
    plan:"soner", day9:"meld_hindring", status:"korridor_utsatt", receipt:"behold_utkast"},
  {choice:"ta_opp_belastning", branch:"ren_u2_d9_belastning",
    plan:"belastning", day9:"stopp_uforsvarlig", status:"sikker_tilkomst_venter", receipt:"behold_utkast"}
];

for (const c of cases) {
  const state = JSON.parse(JSON.stringify(week1));
  nextDay(state);
  assert.equal(state.dag, 8);
  assert.ok(Runner.getCandidateScenes(state, content).some(s => s.id === "ren_u2_d8_ukeplan"),
    "day 8 opens the new real work-plan decision");
  playDay(state, {ren_u2_d8_ukeplan:c.choice}, c.plan + " day 8");
  assert.equal(state.tidligereValg.ren_u2_spor, c.plan);
  assert.equal(state.tidligereValg.ren_u2_korridor_utfort, undefined,
    "a day-8 plan never marks cleaning as performed");
  assert.equal(state.tidligereValg.ren_u2_kari_mottatt, undefined,
    "day-8 plan is not a receipt");

  nextDay(state);
  assert.equal(state.dag, 9);
  const branchScene = raw.roleScenes.scenes.find(x => x.id === c.branch);
  assert.ok(branchScene && Runner.conditionsMet(state,branchScene),
    "day-9 branch follows the actual day-8 choice");
  for (const id of ["ren_u2_d9_tilkomst", "ren_u2_d9_soner", "ren_u2_d9_belastning"]) {
    const row = raw.roleScenes.scenes.find(x => x.id === id);
    assert.equal(Runner.conditionsMet(state,row), id === c.branch, "only matching branch is eligible");
  }
  playDay(state, {[c.branch]:c.day9,ren_u2_d9_kari_mottak:c.receipt}, c.plan + " day 9");
  assert.equal(state.tidligereValg.ren_u2_d9_status, c.status);
  assert.equal(state.tidligereValg.ren_u2_korridor_utfort === true,c.day9==="utfor_korridor",
    "only an actually played corridor work choice counts as completed");
  assert.equal(state.tidligereValg.ren_u2_kari_mottatt===true,c.receipt==="overlever_kari",
    "a note left as draft is not a confirmed handover");
  assert.equal(state.tidligereValg.ren_u2_kari_mottak_venter===true,c.receipt==="behold_utkast",
    "pending receipt is explicitly separate");
  assert.ok(!state.tidligereValg.ren_u2_lager_utfort,
    "no branch fabricates access or completes the blocked storage room");
  assert.ok(!state.tidligereValg.ren_u2_drift_utbedret,
    "drift contact is not a repair");
  const visited = state.arkiv.map(row => row.sceneId);
  assert.equal(visited.filter(id => id === c.branch).length, 1);
  assert.equal(visited.filter(id => id === "ren_u2_d9_kari_mottak").length, 1);
  assert.equal(new Set(visited).size,visited.length,"scenes are never played twice");
  assert.deepEqual(state.arkiv.slice(0,earlierArchive.length).map(row => [row.sceneId,row.valgId]),
    earlierArchive,"week-1 history survives week-2 choices");
  const restored = JSON.parse(JSON.stringify(state));
  assert.deepEqual(restored.tidligereValg,state.tidligereValg,"choice evidence survives save/reload");
  assert.ok(Runner.getSymposium(restored,content).tidslinje.some(x=>x.sceneId===c.branch && x.valgId===c.day9),
    "Symposium records the actual chosen response");
// The same actually played first-week state continues through day 14.
  // Every conditional branch is reached from a choice, never inserted flags.
  const week2Picks = c.plan === "tilkomst" ? {
    ren_u2_d10_status:"ettersend_status",ren_u2_d10_runde:"utfor_rom204",
    ren_u2_d10_egenkontroll:"vis_egenkontroll",ren_u2_d11_soel:"ta_avgrenset_runde",
    ren_u2_d11_rengjor:"vask_etter_sikring",ren_u2_d12_metode:"bruk_kjent_metode",
    ren_u2_d12_arbeid:"utfor_kontrollert",ren_u2_d13_tilkomst:"verifiser_fri",
    ren_u2_d13_lagerarbeid:"vask_lager",ren_u2_d14_oversikt:"skille_kategorier",
    ren_u2_d14_rapport:"send_status",ren_u2_d14_kari_mottak:"bekreft_mottak",
    ren_u2_d14_ukeslutt:"for_oppfolging"
  } : c.receipt === "behold_utkast" ? {
    ren_u2_d10_status:"behold_utkast",ren_u2_d10_runde:"utsett_runde",
    ren_u2_d10_utsatt:"meld_restliste",ren_u2_d11_soel:"be_om_risikovurdering",
    ren_u2_d11_avklaring:"overlever_sperret",ren_u2_d12_metode:"avklar_metode",
    ren_u2_d12_veiledning:"for_behov",ren_u2_d13_tilkomst:"fremdeles_sperret",
    ren_u2_d13_sperret:"registrer_rest",ren_u2_d14_oversikt:"be_om_hjelp",
    ren_u2_d14_rapport:"lagre_utkast",ren_u2_d14_utkast:"behold_som_utkast",
    ren_u2_d14_ukeslutt:"avklar_kapasitet"
  } : {
    ren_u2_d10_status:"ettersend_status",ren_u2_d10_runde:"utfor_korridor",
    ren_u2_d10_egenkontroll:"ettersporr_kvalitet",ren_u2_d11_soel:"ta_avgrenset_runde",
    ren_u2_d11_rengjor:"stans_ved_tvil",ren_u2_d12_metode:"bruk_kjent_metode",
    ren_u2_d12_arbeid:"utfor_kontrollert",ren_u2_d13_tilkomst:"fremdeles_sperret",
    ren_u2_d13_sperret:"ta_korridor",ren_u2_d14_oversikt:"skille_kategorier",
    ren_u2_d14_rapport:"send_status",ren_u2_d14_kari_mottak:"avvent_svar",
    ren_u2_d14_ukeslutt:"for_oppfolging"
  };
  const balanceBeforeStory = state.meters.penger;
  for (let day = 10; day <= 14; day++) {
    nextDay(state);
    assert.equal(state.dag, day);
    const daysBefore = new Set(state.arkiv.map(x => x.sceneId));
    playDay(state, week2Picks, c.plan + " day " + day);
    const today = state.arkiv.filter(row => row.dag === day && row.sceneId.startsWith("ren_u2_"));
    assert.ok(today.length >= 2, "day " + day + " has at least two authored decisions");
    assert.ok(today.every(row => !daysBefore.has(row.sceneId)), "new scenes did not replay earlier chapters");
    const saved = JSON.parse(JSON.stringify(state));
    assert.deepEqual(saved.arkiv, state.arkiv, "day " + day + " archive survives serialization");
    assert.deepEqual(saved.tidligereValg, state.tidligereValg, "day " + day + " flags survive save/reload");
  }
  assert.equal(state.meters.penger,balanceBeforeStory,
    "Life Story choices do not mint salaries; wallet payroll belongs to canonical economy");
  assert.ok(!state.tidligereValg.ren_u2_drift_utbedret,
    "a status message must never fabricate a technical repair");
  const verified = state.tidligereValg.ren_u2_d13_lager_tilkomst === "fri";
  assert.equal(state.tidligereValg.ren_u2_lager_utfort===true,
    verified && week2Picks.ren_u2_d13_lagerarbeid==="vask_lager",
    "only actual work after verified physical access completes the blocked room");
  assert.equal(state.tidligereValg.ren_u2_d14_rapport_sendt===true,
    week2Picks.ren_u2_d14_rapport==="send_status",
    "draft cannot be silently sent");
  assert.equal(state.tidligereValg.ren_u2_d14_kari_mottatt===true,
    week2Picks.ren_u2_d14_kari_mottak==="bekreft_mottak",
    "sending and receiving are separate actions");
  assert.ok(state.tidligereValg.ren_u2_uke2_oppsummert);
  const complete = state.tidligereValg.ren_u2_d10_arbeid_utfort===true
    && state.tidligereValg.ren_u2_d14_rapport_sendt===true
    && state.tidligereValg.ren_u2_d14_kari_mottatt===true;
  const Endings=require("../js/Civication/lifestory/lifestoryEndings.js");
  assert.equal(Endings.isFinalDay(state,content),true);
  assert.equal(Endings.resolveEnding(state,content)?.id==="uke2_sporbar_avslutning",complete,
    "the week-two ending requires all actual work/report/receipt evidence");
  assert.deepEqual(state.arkiv.slice(0,earlierArchive.length).map(row => [row.sceneId,row.valgId]),
    earlierArchive,"first-week history remains unchanged through day 14");
  assert.equal(new Set(state.arkiv.map(x => x.sceneId)).size,state.arkiv.length,
    "no duplicated scenes through two weeks");
  assert.ok(Runner.getSymposium(JSON.parse(JSON.stringify(state)),content).tidslinje.some(row=>
    row.sceneId==="ren_u2_d14_ukeslutt"),"Symposium contains the played week-two closeout");
}
const weekTwo = raw.roleScenes.scenes.filter(scene => scene.dag >= 10 && scene.dag <= 14);
assert.equal(weekTwo.length,18);
assert.deepEqual([...new Set(weekTwo.map(scene => scene.dag))].sort(),[10,11,12,13,14]);
assert.ok(roleEndingsAreSafe(), "week-two ending must be strict and evidence based");
function roleEndingsAreSafe() {
  const ending=raw.role.endings.find(e=>e.id==="uke2_sporbar_avslutning");
  return !!ending && ending.kreverAlleKriterier === true
    && Object.keys(ending.kriterier.flagg).length===4
    && Object.values(ending.kriterier.flagg).every(v=>v===true)
    && raw.role.ukesluttDager.includes(14);
}

// Payroll is deliberately a separate boundary from story dialogue.
// Replay the canonical game calendar/wallet: seven actual employed days are
// accrued as daily checkpoints, then paid once at day 15. The end-of-week job
// can be lost without erasing already-earned wages.
{
  function storage(seed = {}) {
    const map = new Map(Object.entries(seed));
    return {
      get length() { return map.size; },
      key(i) { return [...map.keys()][i] ?? null; },
      getItem(key) { return map.get(key) ?? null; },
      setItem(key, value) { map.set(key, String(value)); },
      removeItem(key) { map.delete(key); }
    };
  }
  const json = (store, key, fallback) => JSON.parse(store.getItem(key) || JSON.stringify(fallback));
  function earnedWeekEnvironment(store) {
    const window = {
      localStorage: store, setInterval() {}, dispatchEvent() {},
      document: { getElementById: () => null, addEventListener() {} }
    };
    window.HG_CAREERS = read("data/Civication/hg_careers.json").careers;
    const catalog = read("data/Civication/hg_careers.json");
    window.CIVI_CAREER_RULES = [{ global_rules: catalog.global_rules }];
    window.BADGES = [{ id:"naeringsliv", tiers:[{threshold:0,label:"Renholder"}] }];
    window.CivicationObligationEngine = { getQuizCountLastWeek: () => 2 };
    window.CivicationState = {
      getState() { return json(store,"hg_civi_state_v1",{}); },
      setState(patch) {
        const state = { ...this.getState(), ...patch };
        store.setItem("hg_civi_state_v1",JSON.stringify(state));
        return state;
      },
      getWallet() { return json(store,"hg_civi_wallet_v1",{balance:0,last_tick_day_index:8}); },
      updateWallet(wallet) { store.setItem("hg_civi_wallet_v1",JSON.stringify(wallet)); },
      getActivePosition() { return json(store,"hg_active_position_v1",null); },
      setActivePosition(position) { store.setItem("hg_active_position_v1",JSON.stringify(position)); }
    };
    const safeMath = Object.create(Math);
    safeMath.random = () => 1;
    const context = vm.createContext({
      window, localStorage:store, Math:safeMath, Date, console,
      weekKey:()=>"2026-W44",deriveTierFromPoints:()=>({tierIndex:0}),
      Event:class { constructor(type){this.type=type;} },
      CustomEvent:class { constructor(type,opts){this.type=type;this.detail=opts?.detail;} },
      clearTimeout(){},setTimeout(){return 0;}
    });
    for (const script of [
      "js/Civication/core/civicationCalendar.js",
      "js/Civication/core/civicationEconomyEngine.js"
    ]) vm.runInContext(fs.readFileSync(path.join(ROOT,script),"utf8"),context);
    return window;
  }
  const store = storage({
    hg_civi_wallet_v1:JSON.stringify({balance:110,last_tick_day_index:8}),
    merits_by_category:JSON.stringify({naeringsliv:{points:8}})
  });
  const app = earnedWeekEnvironment(store);
  const calendar = app.CivicationCalendar, wallet = () => app.CivicationState.getWallet();
  const economy = app.CivicationEconomyEngine;
  calendar.advanceByMinutes(7*24*60); // A completed first week is the fixture boundary.
  assert.equal(calendar.getClock().dayIndex,8);
  app.CivicationState.setActivePosition({career_id:"naeringsliv",role_key:"renholder",title:"Renholder"});
  const initialBalance = wallet().balance;
  for (let day = 8; day <= 14; day++) {
    assert.equal(calendar.getClock().dayIndex,day);
    economy.recordCompletedDay(day);
    economy.recordCompletedDay(day); // Replay is idempotent.
    assert.equal(wallet().completed_game_days_v1.length,day-7,"one work record per played day");
    economy.tickWeekly();
    assert.equal(wallet().balance,initialBalance,"no salary before the seven actual workdays");
    calendar.advanceByMinutes(24*60);
  }
  assert.equal(calendar.getClock().dayIndex,15);
  const earned = wallet().completed_game_days_v1;
  assert.equal(earned.length,7);
  assert.ok(earned.every(r=>r.careerId==="naeringsliv" && r.weeklyNet > 0));
  const expected = Math.floor(earned.reduce((sum,r)=>sum+r.weeklyNet,0)/7);
  assert.ok(expected>0,"a full workweek has earned positive catalog salary");
  app.CivicationState.setActivePosition(null); // A legitimate job end before payday.
  economy.tickWeekly();
  assert.equal(wallet().balance,initialBalance+expected,"week-2 accrued wages survive job end");
  assert.equal(wallet().last_tick_day_index,15,"week-2 settlement uses game day 15");
  assert.equal(wallet().completed_game_days_v1.length,0,"settled workday records are consumed");
  economy.tickWeekly();
  assert.equal(wallet().balance,initialBalance+expected,"the same week cannot be paid twice");
  const restored = earnedWeekEnvironment(store);
  restored.CivicationCalendar.advanceByMinutes(14*24*60);
  restored.CivicationEconomyEngine.tickWeekly();
  assert.equal(wallet().balance,initialBalance+expected,"reload cannot duplicate settled salary");
}

console.log("renholder week-2 day 8–14: 4 actual playthroughs, plan/work/receipt/blocked access, ending and save/reload contracts passed");
