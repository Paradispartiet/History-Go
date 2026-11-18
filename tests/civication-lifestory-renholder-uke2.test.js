#!/usr/bin/env node
// Renholder uke 2: arbeid, avtale og mottak må holdes atskilt.
// Dette tester rollelokal Life Story etter en faktisk spilt første uke.
// Ansettelse og dag-8-utbetaling er bevist i egen ekte browser-E2E (#7303).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

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
}
console.log("renholder week-2 day 8–9: 4 truthful plan/work/receipt paths passed");
