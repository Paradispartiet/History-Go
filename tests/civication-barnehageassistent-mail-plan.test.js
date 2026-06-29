#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function makeStorage(){const store=new Map();return{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(String(k),String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};}
function makeFetch(rootDir){return async function fetchMock(url){const clean=String(url||'').split('?')[0].replace(/^\/+/, '');const fullPath=path.resolve(rootDir, clean);if(!fullPath.startsWith(rootDir)) return {ok:false,status:400,async json(){return null}};try{const body=await fs.promises.readFile(fullPath,'utf8');return {ok:true,status:200,async json(){return JSON.parse(body)}};}catch{return {ok:false,status:404,async json(){return null}};}}}
function loadScript(relPath){vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath),'utf8'),{filename:relPath});}
function readJson(relPath){return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath),'utf8'));}

async function run(){
  global.window=global; global.localStorage=makeStorage(); global.location={href:'http://localhost/Civication.html'};
  global.Event=class Event{constructor(type){this.type=type;}}; global.document={readyState:'complete',addEventListener(){}};
  global.addEventListener=()=>{}; global.dispatchEvent=()=>{}; global.fetch=makeFetch(repoRoot);
  global.CivicationCalendar={getPhase:()=> 'morning', setPhase(){}, advanceByMinutes(){}};
  global.HG_CapitalMaintenance={maintain:()=>null}; global.HG_Lifestyle={addTags:()=>null};
  global.CivicationPsyche={getAutonomy:()=>50, updateIntegrity(){}, updateVisibility(){}, updateEconomicRoom(){}, updateTrust(){}, checkBurnout(){}, processCollapse(){}};

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/day/dayChoiceDirector.js');
  loadScript('js/Civication/systems/day/dayConsequences.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');
  loadScript('js/Civication/systems/civicationMailPlanDebug.js');

  const category='sosial_laering'; const role='barnehageassistent';
  const roleModel=readJson(`data/Civication/roleModels/${category}/${role}.json`);
  assert.strictEqual(roleModel.role_scope, role, 'roleModel finnes og har riktig role_scope');
  for (const field of ['core_narrative','daily_work','responsibilities','work_environment','career_path','required_knowledge','challenges','dilemmas','related_people','related_places','mail_integration','competence_axes','ideal_type_problems']) {
    assert(roleModel[field] !== undefined, `roleModel should include ${field}`);
  }
  assert(JSON.stringify(roleModel).includes('Den lange dagen på avdelingen'), 'roleModel should include hovedcase');

  const plan=readJson(`data/Civication/mailPlans/${category}/${role}_plan.json`);
  assert.strictEqual(plan.role_scope, role, 'mailPlan finnes og har riktig role_scope');
  assert.strictEqual(plan.sequence.length, 8, 'mailPlan should have 8 steps');

  const expectedTypes=['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
  const minimums={job:12,people:10,conflict:8,story:6,event:4,micro:16,followup:8,knowledge:8,consequence:8};
  const requiredMailFields=['id','mail_type','mail_family','role_scope','phase','priority','place_id','subject','summary','purpose','stakes','situation','task_domain','task_kind','competency','pressure','choice_axis','consequence_axis','narrative_arc','learning_focus','choices'];
  const catalogs=expectedTypes.map(type => readJson(`data/Civication/mailFamilies/${category}/${type}/${role}_${type}.json`));
  const familiesById=new Map(); const runtimeTypes=new Set();
  for (const catalog of catalogs) {
    assert.strictEqual(catalog.role_scope, role, `${catalog.mail_type} catalog should match role_scope`);
    assert.strictEqual(catalog.category, category, `${catalog.mail_type} catalog should match category`);
    const mails=(catalog.families||[]).flatMap(family => { familiesById.set(family.id, {type: catalog.mail_type, family}); return family.mails || []; });
    assert(mails.length >= minimums[catalog.mail_type], `${catalog.mail_type} should include minimum volume`);
    runtimeTypes.add(catalog.mail_type);
    for (const mail of mails) {
      for (const field of requiredMailFields) assert(mail[field] !== undefined && mail[field] !== null, `${mail.id} should declare ${field}`);
      assert.strictEqual(mail.role_scope, role, `${mail.id} should stay in role scope`);
      assert.strictEqual(mail.mail_type, catalog.mail_type, `${mail.id} should have matching mail_type`);
      assert(mail.from || mail.sender || mail.person_id, `${mail.id} should have sender/person`);
      assert(Array.isArray(mail.situation) && mail.situation.length > 0, `${mail.id} should have situation`);
      assert(Array.isArray(mail.learning_focus) && mail.learning_focus.length > 0, `${mail.id} should have learning_focus`);
      assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should have at least two choices`);
    }
  }
  for (const type of expectedTypes) assert(runtimeTypes.has(type), `runtime catalog set should include ${type}`);

  const allowed=[...new Set((plan.sequence||[]).flatMap(step => step.allowed_families || []))];
  for (const familyId of allowed) assert(familiesById.has(familyId), `allowed_families should exist as family.id: ${familyId}`);
  assert(familiesById.has('mikrovalg_avdeling'), 'micro family exists even when used as fallback');

  const knowledgeText=JSON.stringify(catalogs.find(c => c.mail_type === 'knowledge')).toLowerCase();
  for (const term of ['tilknytning','overgangssituasjoner','lek','språkstøtte','barns medvirkning','observasjon','grensesetting','konfliktdemping','foreldresamarbeid','rammeplan','sikkerhet','bemanning','emosjonelt arbeid']) {
    assert(knowledgeText.includes(term), `knowledge mails should connect to ${term}`);
  }

  const active={career_id:category,title:'Barnehageassistent',role_key:role,role_id:role};
  global.CivicationState.setActivePosition(active);
  const runtime=await global.CivicationDailyMailBuilder.buildQueue(active,{date:'2026-06-29'});
  assert(runtime && runtime.role_scope === role, 'DailyMailBuilder should build barnehageassistent runtime');
  assert(runtime.items.length > 0, 'DailyMailBuilder should build full day queue');
  const expectedPhases=['morning','forenoon','workday','lunch','afternoon','dinner','evening','day_end'];
  assert.deepStrictEqual([...new Set(runtime.items.map(row => row.phase))], expectedPhases, 'fasene dekker full dag');
  const builtTypes=new Set(runtime.items.map(row => row.event?.mail_type).filter(Boolean));
  assert(builtTypes.size > 2, 'runtime inkluderer flere mail_type');
  assert(builtTypes.has('job') && [...builtTypes].some(type => type !== 'job'), 'runtime includes job and non-job mails');
  for (const row of runtime.items.filter(row => row.event?.source_type !== 'daily_generated')) {
    const mail=row.event || {};
    for (const field of ['learning_focus','narrative_arc','choice_axis','consequence_axis']) assert(mail[field] !== undefined && mail[field] !== null, `${mail.id} should keep ${field}`);
    assert(mail.from || mail.sender || mail.person_id || mail.source, `${mail.id} should have concrete sender`);
    assert(mail.task_domain || mail.pressure, `${mail.id} should have concrete task or pressure`);
    assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should keep choices`);
  }
  const sourceIds=runtime.items.map(row => String(row.event?.source_mail_id || row.event?.id || '').toLowerCase());
  assert(!sourceIds.some(id => /debug|gap|undefined|null/.test(id)), 'ingen debug gaps i source ids');
  const dayText=JSON.stringify(runtime.items.map(row => row.event || {})).toLowerCase();
  for (const term of ['overgang','frilek','forelder','observasjon','slitasje','dagslutt']) assert(dayText.includes(term), `Day 1 should include ${term}`);

  console.log('Barnehageassistent Day 1 audit map:');
  console.table(runtime.items.map((row,index)=>({index,phase:row.phase,slot:row.slot,type:row.event?.mail_type,id:row.event?.source_mail_id||row.event?.id,subject:row.event?.subject})));
}
run().catch(error => { console.error(error); process.exit(1); });
