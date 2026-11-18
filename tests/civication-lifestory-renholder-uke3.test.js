#!/usr/bin/env node
// Renholder uke 3: actual played work, truthful complaint handling, handover
// and save/reload. Story dialogue must never mint jobs, money or approvals.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const manifest = read("data/Civication/lifestory/manifest.json");
const entry = manifest.roles.renholder;
const Content = require("../js/Civication/lifestory/lifestoryContent.js");
const State = require("../js/Civication/lifestory/lifestoryState.js");
const Runner = require("../js/Civication/lifestory/lifestoryRunner.js");
const Endings = require("../js/Civication/lifestory/lifestoryEndings.js");
const raw = {
  role:read(entry.role), phaseDefinitions:read(manifest.shared.phaseDefinitions),
  roleThreads:read(entry.threads), roleScenes:read(entry.scenes),
  lifeThreads:read(manifest.life.threads), lifeScenes:read(manifest.life.scenes)
};
const content = Content.buildContent(raw);
const scenes = raw.roleScenes.scenes.filter(s=>s.dag>=15 && s.dag<=21);
assert.equal(scenes.length,23,"23 authored third-week scenes");
assert.deepEqual([...new Set(scenes.map(s=>s.dag))].sort((a,b)=>a-b),[15,16,17,18,19,20,21]);
assert.equal(new Set(scenes.map(s=>s.id)).size,23,"no duplicate week-three scene IDs");
assert.ok(scenes.every(s=>s.threadId==="renholder_uke2_oppfolging"),"continue the existing thread");
assert.ok(raw.role.ukesluttDager.includes(21));
const ending=raw.role.endings.find(e=>e.id==="uke3_sporbar_avslutning");
assert.ok(ending && ending.kreverAlleKriterier===true);
assert.deepEqual(Object.keys(ending.kriterier.flagg).sort(),[
  "ren_u3_d15_arbeid_utfort","ren_u3_d21_kari_mottatt",
  "ren_u3_d21_rapport_sendt","ren_u3_d21_ukeoppsummert"
].sort());

function playDay(state,picks,label){
  let count=0;
  while(!state.dagFerdig){
    const scene=Runner.selectNextScene(state,content);
    assert.ok(scene,label+": playable scene on day "+state.dag);
    const choice=picks[scene.id] || scene.valg.find(v=>!v.skills_requirement)?.id;
    assert.ok(choice && scene.valg.some(v=>v.id===choice),label+": valid choice for "+scene.id);
    Runner.applyChoice(state,content,scene.id,choice);
    assert.ok(++count<125,label+": day terminates");
  }
}
function advance(state){
  const day=state.dag;
  assert.ok(state.dagFerdig);
  Runner.startNextDay(state,content);
  assert.equal(state.dag,day+1,"real day progression");
}
const cases=[
  {name:"documented_closeout",picks:{},complete:true},
  {name:"open_work_and_draft",picks:{
    ren_u3_d15_arbeid:"registrer_rest",
    ren_u3_d16_materiell:"meld_mangel",ren_u3_d16_mangel:"behold_rest",
    ren_u3_d17_klage:"be_om_tid",ren_u3_d17_avklaring:"overlever_klage",
    ren_u3_d18_hms:"stans_tungt",ren_u3_d18_avvent:"meld_behov",
    ren_u3_d19_tilkomst:"rom_opptatt",ren_u3_d19_opptatt:"meld_rest",
    ren_u3_d20_avstemming:"be_om_tallkontroll",
    ren_u3_d20_uavklart_liste:"behold_utkast",
    ren_u3_d21_rapport:"lagre_utkast",ren_u3_d21_utkast:"behold_som_utkast"
  },complete:false},
  {name:"draft_after_work",picks:{
    ren_u3_d21_rapport:"lagre_utkast",ren_u3_d21_utkast:"behold_som_utkast"
  },complete:false},
  {name:"unconfirmed_receipt",picks:{
    ren_u3_d21_mottak:"avvent_svar"
  },complete:false},
  {name:"closed_room_but_real_alternative",picks:{
    ren_u3_d19_tilkomst:"rom_opptatt",ren_u3_d19_opptatt:"vask_korridor"
  },complete:true}
];

let firstWeekHistory=null;
for(const route of cases){
  const state=State.createInitialState(content);
  let week2Archive=null, moneyBeforeWeek3=null;
  for(let day=1;day<=21;day++){
    assert.equal(state.dag,day,route.name+": day");
    playDay(state,route.picks,route.name);
    if(day===7){
      const rows=state.arkiv.map(x=>[x.sceneId,x.valgId]);
      if(firstWeekHistory===null)firstWeekHistory=rows;
      assert.deepEqual(rows,firstWeekHistory,"week-one history stays unchanged");
    }
    if(day===14){
      week2Archive=state.arkiv.map(x=>[x.sceneId,x.valgId]);
      moneyBeforeWeek3=state.meters.penger;
      assert.equal(Endings.isFinalDay(state,content),false,"week 2 is not the new final story day");
    }
    if(day>=15){
      assert.equal(state.meters.penger,moneyBeforeWeek3,
        "narrative choice is never a payroll event");
      const serialized=JSON.parse(JSON.stringify(state));
      assert.deepEqual(serialized.arkiv,state.arkiv,"save/reload archive");
      assert.deepEqual(serialized.tidligereValg,state.tidligereValg,"save/reload evidence");
    }
    if(day!==21)advance(state);
  }
  assert.equal(state.dag,21);
  assert.equal(Endings.isFinalDay(state,content),true);
  assert.deepEqual(state.arkiv.slice(0,week2Archive.length).map(x=>[x.sceneId,x.valgId]),
    week2Archive,"entire week-two history survives");
  assert.equal(new Set(state.arkiv.map(x=>x.sceneId)).size,state.arkiv.length,
    "scenes never replay");
  assert.equal(state.tidligereValg.ren_u3_d15_arbeid_utfort===true,
    route.picks.ren_u3_d15_arbeid!=="registrer_rest","work needs real choice");
  assert.equal(state.tidligereValg.ren_u3_d21_rapport_sendt===true,
    route.picks.ren_u3_d21_rapport!=="lagre_utkast","draft is not sent");
  assert.equal(state.tidligereValg.ren_u3_d21_kari_mottatt===true,
    route.picks.ren_u3_d21_rapport!=="lagre_utkast" &&
      route.picks.ren_u3_d21_mottak!=="avvent_svar",
    "receipt is not inferred from transmission");
  assert.equal(state.tidligereValg.ren_u3_d21_ukeoppsummert,true);
  assert.equal(Endings.resolveEnding(state,content)?.id==="uke3_sporbar_avslutning",
    route.complete,"strict third-week ending requires all four facts");
  if(route.picks.ren_u3_d16_materiell==="meld_mangel")
    assert.ok(!state.tidligereValg.ren_u3_d16_arbeid_utfort,"unmarked material cannot silently become completed work");
  if(route.picks.ren_u3_d17_klage==="be_om_tid")
    assert.ok(!state.tidligereValg.ren_u3_d17_etterkontroll_utfort,"unvisited room has no completed recheck");
  if(route.picks.ren_u3_d18_hms==="stans_tungt")
    assert.ok(!state.tidligereValg.ren_u3_d18_arbeid_utfort,"HMS request is not performed work");
  if(route.picks.ren_u3_d19_tilkomst==="rom_opptatt")
    assert.ok(!state.tidligereValg.ren_u3_d19_arbeid_utfort,"occupied room remains uncleaned");
  assert.ok(!state.tidligereValg.ren_u2_drift_utbedret,"report or request does not repair the building");
  const symposium=Runner.getSymposium(JSON.parse(JSON.stringify(state)),content);
  assert.ok(symposium.tidslinje.some(x=>x.sceneId==="ren_u3_d21_ukeslutt"),
    "week-three closeout is actually archived in Symposium");
}
console.log("renholder week 3 day 15–21: five real routes, evidence, history and strict ending passed");
