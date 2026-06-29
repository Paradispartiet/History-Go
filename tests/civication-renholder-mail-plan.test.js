#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function makeStorage(){const store=new Map();return{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(String(k),String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};}
function makeFetch(rootDir){return async function fetchMock(url){const clean=String(url||'').split('?')[0].replace(/^\/+/, '');const fullPath=path.resolve(rootDir, clean);if(!fullPath.startsWith(rootDir)) return {ok:false,status:400,async json(){return null}};try{const body=await fs.promises.readFile(fullPath,'utf8');return {ok:true,status:200,async json(){return JSON.parse(body)}};}catch{return {ok:false,status:404,async json(){return null}};}}}
function loadScript(relPath){vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath),'utf8'),{filename:relPath});}
function readJson(relPath){assert(fs.existsSync(path.join(repoRoot, relPath)), `${relPath} should exist`); return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath),'utf8'));}

async function run(){
  global.window=global; global.localStorage=makeStorage(); global.location={href:'http://localhost/Civication.html'};
  global.Event=class Event{constructor(type){this.type=type;}}; global.document={readyState:'complete',addEventListener(){}};
  global.addEventListener=()=>{}; global.dispatchEvent=()=>{}; global.fetch=makeFetch(repoRoot);
  global.CivicationCalendar={getPhase:()=> 'morning', setPhase(){}, advanceByMinutes(){}};
  global.HG_CapitalMaintenance={maintain:()=>null}; global.HG_Lifestyle={addTags:()=>null};
  global.CivicationPsyche={getAutonomy:()=>50, updateIntegrity(){}, updateVisibility(){}, updateEconomicRoom(){}, updateTrust(){}, checkBurnout(){}, processCollapse(){}};
  for (const script of ['js/Civication/core/civicationState.js','js/Civication/core/civicationEventEngine.js','js/Civication/systems/civicationEventChannels.js','js/Civication/systems/civicationCareerRoleResolver.js','js/Civication/systems/day/dayChoiceDirector.js','js/Civication/systems/day/dayConsequences.js','js/Civication/systems/civicationMailRuntime.js','js/Civication/systems/civicationDailyMailBuilder.js','js/Civication/systems/civicationMailPlanDebug.js']) loadScript(script);

  const category='naeringsliv'; const role='renholder'; const roleId='naer_renholder';
  const roleModel=readJson(`data/Civication/roleModels/${category}/${role}.json`);
  assert.strictEqual(roleModel.category, category, 'roleModel finnes og har riktig category');
  assert.strictEqual(roleModel.role_scope, role, 'roleModel finnes og har riktig role_scope');
  assert.strictEqual(roleModel.role_id, roleId, 'roleModel følger canonical role_id');
  assert.strictEqual(roleModel.role_key, role, 'roleModel følger canonical role_key');
  assert(JSON.stringify(roleModel).includes('Rommet må være klart før noen vet at du var der'), 'roleModel har hovedcase');
  for (const field of ['person_map','conflict_map','competence_axes','history_go_targets']) assert(roleModel[field], `roleModel should include ${field}`);

  const plan=readJson(`data/Civication/mailPlans/${category}/${role}_plan.json`);
  assert.strictEqual(plan.category, category, 'mailPlan finnes og har riktig category');
  assert.strictEqual(plan.role_scope, role, 'mailPlan finnes og har riktig role_scope');
  assert.strictEqual(plan.role_id, roleId, 'mailPlan følger canonical role_id');
  assert.strictEqual(plan.role_key, role, 'mailPlan følger canonical role_key');
  assert(plan.sequence.length >= 8, 'mailPlan has playable sequence');

  const expectedTypes=['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
  const minimums={job:12,people:10,conflict:8,story:6,event:4,micro:16,followup:8,knowledge:8,consequence:8};
  const required=['id','mail_type','mail_family','role_scope','phase','priority','place_id','subject','summary','purpose','stakes','situation','task_domain','task_kind','competency','pressure','choice_axis','consequence_axis','narrative_arc','learning_focus','choices'];
  const catalogs=expectedTypes.map(type => readJson(`data/Civication/mailFamilies/${category}/${type}/${role}_${type}.json`));
  const familiesById=new Map();
  for (const catalog of catalogs) {
    assert.strictEqual(catalog.category, category, `${catalog.mail_type} catalog category`);
    assert.strictEqual(catalog.role_scope, role, `${catalog.mail_type} catalog role_scope`);
    const mails=[];
    for (const family of catalog.families || []) { familiesById.set(family.id, {type: catalog.mail_type, family}); mails.push(...(family.mails || [])); }
    assert(mails.length >= minimums[catalog.mail_type], `${catalog.mail_type} should include minimum volume`);
    for (const mail of mails) {
      for (const field of required) assert(mail[field] !== undefined && mail[field] !== null, `${mail.id} should declare ${field}`);
      assert.strictEqual(mail.role_scope, role, `${mail.id} should stay scoped`);
      assert.strictEqual(mail.mail_type, catalog.mail_type, `${mail.id} should match catalog type`);
      assert(mail.from || mail.sender || mail.person_id, `${mail.id} should have sender/person`);
      assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should have at least two choices`);
    }
  }
  for (const familyId of [...new Set((plan.sequence||[]).flatMap(step => step.allowed_families || []))]) assert(familiesById.has(familyId), `allowed_families finnes som family.id: ${familyId}`);

  const knowledgeText=JSON.stringify(catalogs.find(c => c.mail_type === 'knowledge')).toLowerCase();
  for (const term of ['hygiene','smittevern','ergonomi','kjemikaliesikkerhet','avvik','arbeidsmiljø','renholdsplan','kontaktflater','toalettsoner','avfall','lukt','verdighet']) assert(knowledgeText.includes(term), `knowledge mails should connect to ${term}`);

  const active={career_id:category,title:'Renholder',role_key:role,role_id:roleId};
  global.CivicationState.setActivePosition(active);
  const runtime=await global.CivicationDailyMailBuilder.buildQueue(active,{date:'2026-06-29'});
  assert(runtime && runtime.role_scope === role, 'DailyMailBuilder bygger renholder runtime');
  assert.strictEqual(runtime.role_id, roleId, 'runtime keeps canonical role_id');
  assert.deepStrictEqual([...new Set(runtime.items.map(row => row.phase))], ['morning','forenoon','workday','lunch','afternoon','dinner','evening','day_end'], 'fasene dekker full dag');
  const runtimeTypes=new Set(runtime.items.map(row => row.event?.mail_type).filter(Boolean));
  assert(runtimeTypes.size > 2, 'runtime inkluderer flere mail_type');
  assert(runtimeTypes.has('job') && [...runtimeTypes].some(type => type !== 'job'), 'runtime inkluderer job og ikke-jobb');
  const dayText=JSON.stringify(runtime.items.map(row => row.event || {})).toLowerCase();
  for (const term of ['hygiene','renhold','kropp','smittevern','dagslutt']) assert(dayText.includes(term), `Day 1 should include ${term}`);

  const index=fs.readFileSync(path.join(repoRoot,'docs/CIVICATION_ROLE_PACK_INDEX.md'),'utf8');
  assert(!/\|[^\n]*broken_mapping[^\n]*renholder/i.test(index), 'ingen broken_mapping for renholder i Role Pack Index');
  assert(!/^\- broken_mapping: [1-9]/m.test(index), 'ingen broken_mapping gjenoppstår i Role Pack Index');
  console.log('Renholder Civication role pack OK');
}
run().catch(error => { console.error(error); process.exit(1); });
