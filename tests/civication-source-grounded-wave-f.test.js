'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Content = require('../js/Civication/lifestory/lifestoryContent.js');
const State = require('../js/Civication/lifestory/lifestoryState.js');
const Runner = require('../js/Civication/lifestory/lifestoryRunner.js');
const root = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const manifest = read(Content.MANIFEST_PATH);
const register = read('data/Civication/lifestory/editorial/inspiration/waveASixthInstallmentsV1.json');
const fourth = read('data/Civication/lifestory/editorial/inspiration/waveAFourthInstallmentsV1.json');
const fifth = read('data/Civication/lifestory/editorial/inspiration/waveAFifthInstallmentsV1.json');
const life = read(manifest.life.scenes).scenes;
function contentFor(roleId) {
  const entry=manifest.roles[roleId];
  return Content.buildContent({
    role:read(entry.role),
    roleThreads:read(entry.threads),
    roleScenes:read(entry.scenes),
    lifeThreads:read(manifest.life.threads),
    lifeScenes:read(manifest.life.scenes),
    phaseDefinitions:read(manifest.shared.phaseDefinitions)
  });
}
const base = contentFor('arbeidsledig');
const another = contentFor('renholder');
const planner = contentFor('arealplanlegger');
const sourceEntries = new Map(fourth.stories.map(s=>[s.story_type_id.toLowerCase(),s]));
const eEntries = new Map(fifth.stories.map(s=>[s.story_type_id.toLowerCase(),s]));
function possibleStatuses(arc) {
  const from = arc==='c01'||arc==='c05' ? eEntries.get(arc) : sourceEntries.get(arc);
  assert.ok(from);
  const raw = arc==='c01'||arc==='c05' ? life : read(sourceEntries.get(arc).runtime_path).scenes;
  const prefix = arc==='c01'||arc==='c05' ? 'wave_e_'+arc+'_dag12_' : 'wave_d_'+arc+'_';
  const flag = arc==='c01'||arc==='c05' ? 'wa_e_'+arc+'_etterspill' : 'wa_d_'+arc+'_status';
  return raw.filter(s=>s.id.startsWith(prefix))
    .flatMap(s=>s.valg.filter(c=>c.effekter?.flagg?.[flag]).map(c=>({
      status:c.effekter.flagg[flag],sourceId:s.id,sourceChoice:c.id,flag
    })));
}
function seed(source, arc, prev, day) {
  source.livsdag=day;
  State.applyEffects(source,{flagg:{[prev.flag]:prev.status}});
  source.arkiv.push({dag:day,livsdag:day,rolle:source.rolle,sceneId:prev.sourceId,
    valgId:prev.sourceChoice,threadId:prev.sourceId.startsWith('wave_e_')?'wave_e_'+arc:'wave_d_'+arc});
  source.spilteScener.push(prev.sourceId);
  State.capturePrivateStory(source);
}
function options(state,content,arc) {
  return Runner.getCandidateScenes(state,content).filter(s=>s.id.startsWith('wave_f_'+arc+'_'));
}
test('All eight source-grounded stories have 68 distinct scenes / 136 choices and preserved references',()=>{
  const f=life.filter(s=>s.id.startsWith('wave_f_'));
  assert.equal(f.length,68);
  assert.equal(f.reduce((n,s)=>n+s.valg.length,0),136);
  assert.equal(new Set(f.map(s=>s.id)).size,68);
  assert.equal(register.total_authored_scenes,217);
  assert.equal(register.total_authored_choices,434);
  assert.equal(register.stories.length,8);
  for(const story of register.stories) {
    const earlier=sourceEntries.get(story.id);
    assert.deepEqual(story.source_problem_ids,earlier.problem_ids);
    assert.deepEqual(story.source_work_ids,earlier.work_ids);
    assert.deepEqual(story.scene_ids,f.filter(s=>s.threadId==='wave_f_'+story.id).map(s=>s.id));
    assert.ok(story.scene_ids.length>=8);
    for(const s of f.filter(s=>s.threadId==='wave_f_'+story.id)){
      assert.equal(Object.keys(s.conditions?.flagg||{}).length,1);
      assert.ok(s.valg.every(c=>c.tekst&&c.konsekvensTekst&&Object.keys(c.effekter?.flagg||{}).length===1));
      assert.ok(s.etterValgDager.dager>=4);
      assert.ok(s.livsdagFra>=12);
      assert.ok(s.prioritet<=5 || s.fase!=='formiddag'&&s.fase!=='ettermiddag');
    }
  }
});
test('All 68 recorded outcomes unlock one later scene, never an invented earlier scene',()=>{
  for(const entry of register.stories){
    const arc=entry.id;
    const predecessors=possibleStatuses(arc);
    assert.equal(predecessors.length,entry.scene_ids.length,'author every actual prior choice for '+arc);
    assert.equal(new Set(predecessors.map(s=>s.status)).size,predecessors.length);
    const phases={c01:'kveld',c02:'kveld',c03:'kveld',c05:'ettermiddag',c06:'kveld',c07:'kveld',c17:'kveld',c23:'kveld'};
    for(const choice of predecessors){
      const state=State.createInitialState(base);
      const earlier=arc==='c01'||arc==='c05'?12:sourceEntries.get(arc).days[0];
      seed(state,arc,choice,earlier);
      state.fase=phases[arc];
      state.livsdag=Math.max(earlier+3,entry.minimum_livsdag);
      if(state.livsdag-earlier===3) assert.equal(options(state,base,arc).length,0);
      state.livsdag=Math.max(earlier+4,entry.minimum_livsdag);
      const hits=options(state,base,arc);
      assert.equal(hits.length,1,arc+':'+choice.status);
      assert.equal(hits[0].id,'wave_f_'+arc+'_'+choice.status);
      const wrong=State.createInitialState(base);wrong.fase=phases[arc];wrong.livsdag=99;
      wrong.tidligereValg[choice.flag]=choice.status;
      State.reconcileContent(wrong,base);
      assert.equal(options(wrong,base,arc).length,0,'flag without recorded day is not history');
    }
  }
});
test('Complete Wave D->F private history follows role changes and never duplicates archive',()=>{
  const from=State.createInitialState(base);
  const arc='c23';
  const prior=possibleStatuses(arc)[0];
  seed(from,arc,prior,16);
  const afterJob=State.selectRole(from,another);
  assert.equal(afterJob.tidligereValg[prior.flag],prior.status);
  assert.equal(afterJob.privatHistorie.flaggDager[prior.flag],16);
  afterJob.livsdag=22;afterJob.fase='kveld';
  const s=options(afterJob,another,arc)[0];
  assert.equal(s.id,'wave_f_c23_'+prior.status);
  Runner.applyChoice(afterJob,another,s.id,'behold');
  const value=afterJob.tidligereValg.wa_f_c23_status;
  assert.ok(value);
  const planned=State.selectRole(afterJob,planner);
  assert.equal(planned.tidligereValg.wa_f_c23_status,value);
  assert.equal(planned.arkiv.filter(e=>e.sceneId===s.id).length,1);
  const returned=State.selectRole(planned,base);
  assert.equal(returned.arkiv.filter(e=>e.sceneId===s.id).length,1);
  assert.equal(returned.spilteScener.filter(id=>id===s.id).length,1);
});
test('Role-specific continuations keep exclusive current chapters without private episodes intruding',()=>{
  const from=State.createInitialState(base);
  const prior=possibleStatuses('c01')[0];seed(from,'c01',prior,12);
  from.livsdag=30;from.fase='kveld';
  const continuation=read('data/Civication/lifestory/continuations/musikk_med_mira.json');
  const withContinuation=Content.appendContinuation(base,continuation);
  assert.equal(options(from,withContinuation,'c01').length,0);
  assert.equal(Runner.hasPendingPrivateScenes(from,withContinuation),false);
  assert.ok(options(from,base,'c01').length>0);
});

test('Calling NAV never silently sends missing employment documentation',()=>{
  const unemployment=read(manifest.roles.arbeidsledig.scenes).scenes;
  const initial=unemployment.find(s=>s.id==='meldekort_01_fristen');
  const call=initial.valg.find(v=>v.id==='ring_veilederen');
  assert.equal(call.effekter.flagg.sendte_meldekortet,true);
  assert.equal(call.effekter.flagg.ryddet_dokumentasjon,undefined);
  const documents=unemployment.find(s=>s.id==='d1_nav_dokumentene');
  assert.deepEqual(documents.conditions.flagg.ryddet_dokumentasjon,{finnes:false});
  assert.ok(documents.valg.some(v=>v.effekter?.flagg?.ryddet_dokumentasjon===true));
});

test('Every Wave F alternative produces its recorded effect and survives later life days',()=>{
  let verified=0;
  for (const entry of register.stories) {
    const arc=entry.id;
    const phases={c01:'kveld',c02:'kveld',c03:'kveld',c05:'ettermiddag',c06:'kveld',c07:'kveld',c17:'kveld',c23:'kveld'};
    for (const predecessor of possibleStatuses(arc)) {
      for (const id of ['behold','avgrens']) {
        const state=State.createInitialState(base);
        const earlier=arc==='c01'||arc==='c05'?12:sourceEntries.get(arc).days[0];
        seed(state,arc,predecessor,earlier);
        state.fase=phases[arc];
        state.livsdag=Math.max(earlier+4,entry.minimum_livsdag);
        const [scene]=options(state,base,arc);
        assert.equal(scene.id,'wave_f_'+arc+'_'+predecessor.status);
        const choice=scene.valg.find(c=>c.id===id);
        assert.ok(choice);
        const oldMeters={...state.meters},oldRelations={...state.relasjoner};
        Runner.applyChoice(state,base,scene.id,id);
        assert.equal(options(state,base,arc).length,0,
          'a resolved Wave F scene must not reappear or jump to another choice branch');
        for (const [key,delta] of Object.entries(choice.effekter.meters||{})) {
          const next=oldMeters[key]+delta;
          assert.equal(state.meters[key],key==='penger'?next:Math.max(0,Math.min(100,next)),scene.id+' / '+id+' / '+key);
        }
        for (const [key,delta] of Object.entries(choice.effekter.relasjoner||{})) {
          assert.equal(state.relasjoner[key],Math.max(0,Math.min(100,oldRelations[key]+delta)),scene.id+' / '+id+' / '+key);
        }
        const newMeterValues={...state.meters},newRelations={...state.relasjoner};
        // The already-recorded choice, its archive entry, and all meters remain
        // unchanged when life days advance. Only a later authored event may change them.
        state.livsdag+=3;
        State.capturePrivateStory(state);
        assert.deepEqual(state.meters,newMeterValues);
        assert.deepEqual(state.relasjoner,newRelations);
        assert.equal(state.tidligereValg['wa_f_'+arc+'_status'],choice.effekter.flagg['wa_f_'+arc+'_status']);
        assert.equal(state.arkiv.filter(e=>e.sceneId===scene.id).length,1);
        assert.equal(state.spilteScener.filter(x=>x===scene.id).length,1);
        verified++;
      }
    }
  }
  assert.equal(verified,136);
});

test('The only recorded crossing observation is a single 15-minute interval',()=>{
  const planning=read(manifest.roles.arealplanlegger.scenes).scenes;
  const observed=planning.find(s=>s.id==='wave_b_c06_observasjonen');
  const continuation=life.find(s=>s.id==='wave_f_c06_tidsrom_synlig');
  assert.ok(observed.tekst.includes('07.45 til 08.00'));
  assert.ok(continuation.tekst.includes('07.45 til 08.00'));
  assert.doesNotMatch(continuation.tekst,/tre morgener/i);
});

test('Predecessor decisions have enduring personal consequences before Wave F begins',()=>{
  let checked=0;
  for (const entry of register.stories) {
    const arc=entry.id,prior=possibleStatuses(arc);
    const earlier=arc==='c01'||arc==='c05'?12:sourceEntries.get(arc).days[0];
    const sourceScenes=arc==='c01'||arc==='c05'?life:read(sourceEntries.get(arc).runtime_path).scenes;
    const sceneById=new Map(sourceScenes.map(s=>[s.id,s]));
    for (const item of prior) {
      const scene=sceneById.get(item.sourceId);
      const choice=scene.valg.find(c=>c.id===item.sourceChoice);
      assert.ok(choice);
      const state=State.createInitialState(base);
      seed(state,arc,item,earlier);
      const before={...state.meters},rels={...state.relasjoner};
      State.applyEffects(state,{meters:choice.effekter.meters,relasjoner:choice.effekter.relasjoner});
      for(const [key,delta] of Object.entries(choice.effekter.meters||{})){
        const value=before[key]+delta;
        assert.equal(state.meters[key],key==='penger'?value:Math.max(0,Math.min(100,value)));
      }
      for(const [key,delta] of Object.entries(choice.effekter.relasjoner||{})){
        assert.equal(state.relasjoner[key],Math.max(0,Math.min(100,rels[key]+delta)));
      }
      const meters={...state.meters},relations={...state.relasjoner};
      state.livsdag=Math.max(earlier+4,entry.minimum_livsdag);
      State.capturePrivateStory(state);
      assert.deepEqual(state.meters,meters);
      assert.deepEqual(state.relasjoner,relations);
      assert.equal(state.tidligereValg[item.flag],item.status);
      checked++;
    }
  }
  assert.equal(checked,68);
});


test('A booked performance requires an explicit acceptance, not just a request for terms', () => {
  const unemployment = read(manifest.roles.arbeidsledig.scenes).scenes;
  const booking = unemployment.find(scene => scene.id === 'd5_booker');
  const accepted = booking.valg.find(choice => choice.id === 'skriftlig');
  const declined = booking.valg.find(choice => choice.id === 'avsta');
  assert.match(accepted.tekst, /^Bekreft at du stiller/);
  assert.equal(accepted.effekter.flagg.booking_bekreftet, true);
  assert.equal(declined.effekter.flagg.booking_bekreftet, undefined);
  assert.equal(declined.effekter.flagg.booking_avslaatt, true);
});


test('Wave F workplace memories remain truthful when the player changes jobs', () => {
  const cases = [
    { arc: 'c06', priorStatus: 'kontroll_ikke_ferdig', newRole: another,
      expectedTitle: 'Den ubesvarte fagkontrollen',
      outdated: /På kontoret snakker Eirik om hvor mange saker som må ut denne uka/ },
    { arc: 'c17', priorStatus: 'plan_forespurt', newRole: planner,
      expectedTitle: 'Hylla står der fremdeles',
      outdated: /Du låser deg inn på jobb og ser for deg lagerdøren/ }
  ];
  for (const item of cases) {
    const prior = possibleStatuses(item.arc).find(row => row.status === item.priorStatus);
    assert.ok(prior, 'earlier decision must exist for ' + item.arc);
    const from = State.createInitialState(base);
    const earlier = sourceEntries.get(item.arc).days[0];
    seed(from, item.arc, prior, earlier);
    const changed = State.selectRole(from, item.newRole);
    changed.fase = 'kveld';
    changed.livsdag = Math.max(earlier + 4, 22);
    const candidates = options(changed, item.newRole, item.arc);
    const scene = candidates.find(row => row.id === 'wave_f_' + item.arc + '_' + item.priorStatus);
    assert.ok(scene, 'the personal continuation should still be playable after a job change');
    assert.equal(scene.tittel, item.expectedTitle);
    assert.doesNotMatch(scene.tekst, item.outdated,
      'the past workplace must not be narrated as a current job');
    const choice = scene.valg[0];
    assert.equal(Runner.applyChoice(changed, item.newRole, scene.id, choice.id).state, changed);
    assert.equal(changed.arkiv.filter(row => row.sceneId === scene.id).length, 1);
    assert.equal(changed.privatHistorie.arkiv.filter(row => row.sceneId === scene.id).length, 1);
  }
});
