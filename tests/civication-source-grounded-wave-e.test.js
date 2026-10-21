#!/usr/bin/env node
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const Content = require("../js/Civication/lifestory/lifestoryContent");
const State = require("../js/Civication/lifestory/lifestoryState");
const Runner = require("../js/Civication/lifestory/lifestoryRunner");
const Endings = require("../js/Civication/lifestory/lifestoryEndings");
const manifest = read(Content.MANIFEST_PATH);
const register = read("data/Civication/lifestory/editorial/inspiration/waveAFifthInstallmentsV1.json");
const preceding = read("data/Civication/lifestory/editorial/inspiration/waveAFourthInstallmentsV1.json");

function pack(roleId) {
  const role = manifest.roles[roleId];
  return Content.buildContent({
    role: read(role.role), roleThreads: read(role.threads), roleScenes: read(role.scenes),
    lifeThreads: read(manifest.life.threads), lifeScenes: read(manifest.life.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions)
  });
}
function clock(state,day,phase) {
  state.livsdag=day;state.fase=phase;state.dagFerdig=false;
  if (state.dag>day) state.dag=day;
}
function eligible(state,content,arc) {
  return Runner.getCandidateScenes(state,content).filter(s=>s.id.startsWith("wave_e_"+arc+"_"));
}
function restorePast(state,arc,status) {
  const suffix=arc==="c01"?"selskap_uten_rad_avtal_grense":"mottak_uten_vedtak_skill_mottak";
  const id="wave_d_"+arc+"_"+suffix;
  state.tidligereValg["wa_d_"+arc+"_status"]=status;
  state.spilteScener.push(id);
  state.arkiv.push({sceneId:id,valgId:"forankre",dag:7,livsdag:7,rolle:"arbeidsledig",threadId:"wave_d_"+arc});
  State.hydratePrivateStory(state,State.capturePrivateStory(state));
}

test("Wave E authors 24 scenes / 48 choices, preserves source links and validates across roles",()=>{
  const shared=read(manifest.life.scenes).scenes.filter(s=>/^wave_e_c0[15]_/.test(s.id));
  assert.equal(shared.length,24);
  assert.equal(shared.reduce((n,s)=>n+s.valg.length,0),48);
  assert.equal(register.expected_total_scenes,149);
  assert.equal(register.expected_total_choices,298);
  for(const item of register.stories){
    const from=preceding.stories.find(s=>s.story_type_id===item.story_type_id);
    assert.deepEqual(item.work_ids,from.work_ids);
    assert.deepEqual(item.problem_ids,from.problem_ids);
    assert.deepEqual(item.scene_ids,shared.filter(s=>s.id.startsWith("wave_e_"+item.story_type_id.toLowerCase()+"_")).map(s=>s.id));
  }
  for(const role of ["arbeidsledig","renholder","arealplanlegger","ekspeditor"]){
    const content=pack(role);
    assert.equal(content.scenes.filter(s=>/^wave_e_c0[15]_/.test(s.id)).length,24);
    assert.ok(content.threads.find(t=>t.id==="wave_e_c01"));
    assert.ok(content.threads.find(t=>t.id==="wave_e_c05"));
  }
});

test("all 16 Wave D outcomes reach exactly one later scene, never before day 9",()=>{
  const content=pack("renholder");
  for(const arc of ["c01","c05"]){
    const variants=read(manifest.roles.arbeidsledig.scenes).scenes
      .filter(s=>s.id.startsWith("wave_d_"+arc+"_"))
      .flatMap(s=>s.valg.map(v=>v.effekter.flagg["wa_d_"+arc+"_status"]));
    assert.equal(variants.length,8);
    for(const status of variants){
      const state=State.createInitialState(content);
      restorePast(state,arc,status);
      clock(state,8,arc==="c01"?"kveld":"ettermiddag");
      assert.equal(eligible(state,content,arc).length,0);
      clock(state,9,arc==="c01"?"kveld":"ettermiddag");
      const scenes=eligible(state,content,arc);
      assert.deepEqual(scenes.map(s=>s.id),["wave_e_"+arc+"_dag9_"+status]);
      assert.equal(Endings.isFinalDay(state,content),false);
    }
  }
});

test("cross-job history stays unique and a follow-up needs 3 further life-days",()=>{
  const unemployed=pack("arbeidsledig"),cleaner=pack("renholder"),planner=pack("arealplanlegger");
  let state=State.createInitialState(unemployed);
  state.dag=7;state.livsdag=7;restorePast(state,"c01","hilsen_uten_avtale");
  restorePast(state,"c05","kontrollkilde_notert");
  state=State.selectRole(state,cleaner);
  assert.equal(state.livsdag,7);
  assert.equal(state.tidligereValg.wa_d_c01_status,"hilsen_uten_avtale");
  assert.equal(state.tidligereValg.wa_d_c05_status,"kontrollkilde_notert");
  clock(state,9,"kveld");
  let scene=eligible(state,cleaner,"c01")[0];
  assert.equal(scene.id,"wave_e_c01_dag9_hilsen_uten_avtale");
  Runner.applyChoice(state,cleaner,scene.id,"forste");
  assert.equal(state.tidligereValg.wa_e_c01_retning,"forespoersel");
  assert.equal(state.privatHistorie.flaggDager.wa_e_c01_retning,9);
  state=State.selectRole(state,planner);
  clock(state,11,"kveld");
  assert.equal(eligible(state,planner,"c01").length,0);
  clock(state,12,"kveld");
  scene=eligible(state,planner,"c01")[0];
  assert.equal(scene.id,"wave_e_c01_dag12_forespoersel");
  Runner.applyChoice(state,planner,scene.id,"andre");
  assert.equal(state.tidligereValg.wa_e_c01_etterspill,"nytt_forslag");
  state=State.selectRole(state,unemployed);
  assert.equal(state.spilteScener.filter(id=>id==="wave_e_c01_dag9_hilsen_uten_avtale").length,1);
  assert.equal(state.arkiv.filter(e=>e.sceneId==="wave_e_c01_dag12_forespoersel").length,1);
  assert.equal(state.tidligereValg.wa_e_c01_etterspill,"nytt_forslag");
});

test("old save without a recorded Wave D scene cannot manufacture a later chapter",()=>{
  const content=pack("renholder");
  const state=State.createInitialState(content);
  state.tidligereValg.wa_d_c05_status="kontrollkilde_notert";
  State.reconcileContent(state,content);
  clock(state,15,"ettermiddag");
  assert.equal(eligible(state,content,"c05").length,0);
  assert.equal(Runner.getCandidateScenes(state,content).filter(s=>/^wave_e_c0[15]_/.test(s.id)).length,0,
    "the original C01/C05 Wave E chapter cannot be invented from a bare old flag");
  assert.equal(state.arkiv.length,0);
  assert.ok(!state.spilteScener.some(x=>x.startsWith("wave_e_")));
});
