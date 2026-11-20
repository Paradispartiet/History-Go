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
    const beforeMoney=state.meters.penger;
    Runner.applyChoice(state,content,scene.id,choice);
    if(scene.id.startsWith("ren_u3_"))assert.equal(state.meters.penger,beforeMoney,
      label+": authored job story cannot produce payroll");
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
  let week2Archive=null;
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
      assert.equal(Endings.isFinalDay(state,content),false,"week 2 is not the new final story day");
    }
    if(day>=15){
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

// V1 integrated seam: the separate organic browser test earns eight quiz sets,
// accepts employment and answers real jobmail. Starting at that acceptance
// boundary, replay the published Renholder role for 21 days with real calendar,
// wage engine and authenticated CloudSave API (in-memory transport, not live UI).
const vm=require("node:vm");
function v1Store(seed={}){
  const m=new Map(Object.entries(seed));
  return {
    get length(){return m.size;},
    key(i){return [...m.keys()][i]??null;},
    getItem(k){return m.get(k)??null;},
    setItem(k,v){m.set(k,String(v));},
    removeItem(k){m.delete(k);}
  };
}
const v1Json=(store,k,defaultValue)=>JSON.parse(store.getItem(k)||JSON.stringify(defaultValue));
function v1Environment(store,remote){
  const win={
    localStorage:store,setInterval(){},dispatchEvent(){},
    document:{getElementById:()=>null,addEventListener(){}},
    HistoryGoAHAAuth:{
      getSession:async()=>({user:{id:"renholder-v1-test-user"}}),
      getClient:async()=>({
        from(table){
          assert.equal(table,"aha_imports");
          return {
            select(){return this;},eq(){return this;},
            async maybeSingle(){return {data:remote.record,error:null};},
            async upsert(row){remote.record=row;remote.writes++;return {error:null};}
          };
        }
      })
    }
  };
  const math=Object.create(Math);math.random=()=>1;
  const ctx=vm.createContext({
    window:win,localStorage:store,Math:math,Date,console,
    weekKey:()=>"2026-W46",deriveTierFromPoints:()=>({tierIndex:0}),
    Event:class{constructor(type){this.type=type;}},
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
    setTimeout(){return 0;},clearTimeout(){}
  });
  const catalog=read("data/Civication/hg_careers.json");
  win.HG_CAREERS=catalog.careers;
  win.CIVI_CAREER_RULES=[{global_rules:catalog.global_rules}];
  win.BADGES=[{id:"naeringsliv",tiers:[{threshold:8,label:"Renholder"}]}];
  win.CivicationObligationEngine={getQuizCountLastWeek:()=>2};
  win.CivicationState={
    getState(){return v1Json(store,"hg_civi_state_v1",{});},
    setState(patch){
      const next={...this.getState(),...patch};
      store.setItem("hg_civi_state_v1",JSON.stringify(next));return next;
    },
    getWallet(){return v1Json(store,"hg_civi_wallet_v1",{balance:0,last_tick_day_index:1});},
    updateWallet(w){store.setItem("hg_civi_wallet_v1",JSON.stringify(w));},
    getActivePosition(){return v1Json(store,"hg_active_position_v1",null);},
    setActivePosition(p){store.setItem("hg_active_position_v1",JSON.stringify(p));}
  };
  for(const script of [
    "js/Civication/core/civicationCalendar.js",
    "js/Civication/core/civicationEconomyEngine.js"
  ])vm.runInContext(fs.readFileSync(path.join(ROOT,script),"utf8"),ctx);
  return {win,loadCloud(){
    vm.runInContext(fs.readFileSync(path.join(ROOT,"js/Civication/core/CivicationCloudSave.js"),"utf8"),ctx);
    return win.CivicationCloudSave;
  }};
}
async function verifyV1AccountJourney(){
  const previous=global.CivicationJsonStore;
  global.CivicationJsonStore={fetchJson:async p=>read(p)};
  try{
    const store=v1Store({hg_civi_wallet_v1:JSON.stringify({balance:100,last_tick_day_index:1})});
    const remote={record:null,writes:0};
    const game=v1Environment(store,remote);
    const completed={};
    for(const [name,count] of [["grand_hotel_sets",3],["borsen_oslo_sets",4],["cafe_engebret_sets",1]]){
      const quiz=read("data/quiz/naeringsliv/"+name+".json");
      assert.equal(quiz.categoryId,"naeringsliv");
      for(const set of quiz.sets.slice(0,count)){
        assert.ok(set.set_id);
        completed[set.set_id]={completed:true};
      }
    }
    assert.equal(Object.keys(completed).length,8);
    store.setItem("hg_quiz_sets_v1",JSON.stringify(completed));
    store.setItem("merits_by_category",JSON.stringify({naeringsliv:{points:8}}));
    store.setItem("hg_badge_tiers_v1",JSON.stringify({naeringsliv:0}));
    const job={career_id:"naeringsliv",role_key:"renholder",title:"Renholder"};
    game.win.CivicationState.setActivePosition(job);
    store.setItem("hg_job_history_v1",JSON.stringify([{...job,started_day_index:1}]));
    const calendar=game.win.CivicationCalendar;
    const economy=game.win.CivicationEconomyEngine;
    const wallet=()=>game.win.CivicationState.getWallet();
    const state=State.createInitialState(content);
    const payouts=[];
    let choices=0;
    for(let day=1;day<=21;day++){
      assert.equal(calendar.getClock().dayIndex,day);
      assert.equal(state.dag,day);
      const prior=state.arkiv.length;
      playDay(state,{},"V1 calendar day "+day);
      choices+=state.arkiv.length-prior;
      store.setItem("civication_lifestory_v1",JSON.stringify(state));
      economy.recordCompletedDay(day);
      economy.recordCompletedDay(day);
      const records=wallet().completed_game_days_v1||[];
      assert.equal(records.length,(day-1)%7+1,"one earned work record per day");
      assert.ok(records.every(row=>row.careerId==="naeringsliv"&&row.weeklyNet>0));
      const before=wallet().balance;
      if(day<21)advance(state);
      calendar.advanceByMinutes(24*60);
      assert.equal(calendar.getClock().dayIndex,day+1);
      economy.tickWeekly();
      const pay=day%7===0?Math.floor(records.reduce((sum,row)=>sum+row.weeklyNet,0)/7):0;
      assert.equal(wallet().balance,before+pay,"only earned game-week wages");
      if(pay){
        assert.equal(wallet().last_tick_day_index,day+1);
        assert.deepEqual(wallet().completed_game_days_v1,[]);
        payouts.push(day+1);
      }
      economy.tickWeekly();
      assert.equal(wallet().balance,before+pay,"no double payout");
    }
    assert.deepEqual(payouts,[8,15,22]);
    assert.ok(choices>75);
    assert.equal(Endings.resolveEnding(state,content).id,"uke3_sporbar_avslutning");
    assert.equal(game.win.CivicationState.getActivePosition().title,"Renholder");
    const savedBalance=wallet().balance,savedArchive=JSON.parse(JSON.stringify(state.arkiv));
    const cloud=game.loadCloud();await cloud.ready;await cloud.flush();
    assert.equal(remote.writes,1);
    for(const key of ["merits_by_category","hg_quiz_sets_v1","hg_badge_tiers_v1",
      "hg_active_position_v1","hg_job_history_v1","hg_civi_calendar_v1",
      "hg_civi_wallet_v1","civication_lifestory_v1"]){
      assert.equal(remote.record.payload.state[key],store.getItem(key),"cloud saved "+key);
    }
    const newStore=v1Store(),reopened=v1Environment(newStore,remote);
    const secondCloud=reopened.loadCloud();await secondCloud.ready;
    assert.equal(reopened.win.CivicationCalendar.getClock().dayIndex,22);
    assert.equal(reopened.win.CivicationState.getWallet().balance,savedBalance);
    assert.deepEqual(v1Json(newStore,"civication_lifestory_v1",{}).arkiv,savedArchive);
    assert.equal(v1Json(newStore,"civication_lifestory_v1",{}).dag,21);
    assert.equal(v1Json(newStore,"hg_active_position_v1",{}).title,"Renholder");
    assert.equal(v1Json(newStore,"merits_by_category",{}).naeringsliv.points,8);
    assert.equal(Object.keys(v1Json(newStore,"hg_quiz_sets_v1",{})).length,8);
    reopened.win.CivicationEconomyEngine.tickWeekly();
    await secondCloud.flush();
    assert.equal(reopened.win.CivicationState.getWallet().balance,savedBalance);
    assert.equal(remote.writes,1,"unchanged cloud save not duplicated");
    console.log("renholder V1: 21 authored days, payroll days 8/15/22 and restored account state passed");
  }finally{
    if(previous===undefined)delete global.CivicationJsonStore;
    else global.CivicationJsonStore=previous;
  }
}
verifyV1AccountJourney().catch(error=>{console.error(error);process.exitCode=1;});

