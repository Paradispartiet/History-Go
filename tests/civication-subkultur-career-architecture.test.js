#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const badge = readJson('data/badges/subkultur.json');
const evidence = readJson('data/Civication/subcultureCareerEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const career = careers.find(row => row.career_id === 'subkultur');

const EXPECTED = [
  ['Observør',5,'Kulturhusvert','direct',[],1,'subkultur_arrangementsdrift'],
  ['Deltaker',10,'Arrangementscrew','direct',[],1,'subkultur_arrangementsdrift'],
  ['Hakkekylling',15,'Produksjonsassistent','direct',[],1,'subkultur_arrangementsdrift'],
  ['Gatesmart',25,'Kulturmedarbeider','direct',[],1,'subkultur_arrangementsdrift'],
  ['Crew',40,'Arrangementsplanlegger','direct',[],2,'subkultur_program_og_koordinering'],
  ['Gangster',60,'Kulturkonsulent','direct',[],2,'subkultur_program_og_koordinering'],
  ['Dandy',85,'Booking- og innholdskoordinator','direct',[],2,'subkultur_program_og_koordinering'],
  ['Kultfigur',115,'Produsent','direct',[],3,'subkultur_produksjon_og_prosjekt'],
  ['Trendsetter',150,'Prosjektleder (kulturarrangement)','direct',[],3,'subkultur_produksjon_og_prosjekt'],
  ['Undergrunnsikon',190,'Produksjonsleder','appointment_required',['employer_appointment'],3,'subkultur_produksjonsledelse'],
  ['Legend',240,'Daglig leder (kulturarena)','appointment_required',['employer_appointment'],3,'subkultur_kulturarena_ledelse']
];

assert.strictEqual(badge.career_life_evidence, 'data/Civication/subcultureCareerEvidence.json');
assert.deepStrictEqual(badge.tiers.map(t => [t.label,t.threshold]), EXPECTED.map(([l,t]) => [l,t]));
assert.deepStrictEqual(evidence.canonical_decision.life_position_tiers, EXPECTED.map(([l]) => l));
assert.deepStrictEqual(evidence.canonical_decision.formal_job_unlocks, EXPECTED.map(([, ,j]) => j));
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.canonical_decision.salary_by_job_band, {'1':4,'2':7,'3':13});
assert.strictEqual(evidence.sources.utdanning_arrangementsplanlegger.checked_at, '2026-08-14');
assert.ok(career, 'Subkultur economy exists');
assert.deepStrictEqual(career.economy.salary_by_tier, {'1':4,'2':7,'3':13});

const auditRows = new Map((audit.badges.subkultur || []).map(row => [row[0], row]));
for (const [lifeLabel, threshold, jobTitle, policy, quals, salaryTier, scope] of EXPECTED) {
  const tier = badge.tiers.find(row => row.label === lifeLabel);
  assert.strictEqual(tier.life_position.employment_independent, true, `${lifeLabel}: employment independent`);
  assert.strictEqual(tier.career_offer, undefined, `${lifeLabel}: life status must not become career_offer`);
  assert.strictEqual(tier.career_unlock.title, jobTitle, `${lifeLabel}: job title`);
  assert.strictEqual(tier.career_unlock.policy, policy, `${lifeLabel}: policy`);
  assert.deepStrictEqual(tier.career_unlock.qualification_ids || [], quals, `${lifeLabel}: qualifications`);
  assert.strictEqual(tier.career_unlock.salary_tier, salaryTier, `${lifeLabel}: salary tier`);
  assert.strictEqual(tier.career_unlock.role_scope, scope, `${lifeLabel}: role scope`);
  assert.strictEqual(evidence.tier_to_career[lifeLabel], jobTitle);
  assert.strictEqual(evidence.roles[jobTitle].scope, scope);
  assert.strictEqual(evidence.roles[jobTitle].salary_tier, salaryTier);
  assert.strictEqual(auditRows.get(lifeLabel)?.[2], 'not_job', `${lifeLabel}: audit not_job`);
  assert.strictEqual(auditRows.get(lifeLabel)?.[3], 'replace', `${lifeLabel}: audit replaces formal job track, not Badge label`);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'subkultur', title:jobTitle}), scope, `${jobTitle}: resolver`);
}

for (const [scope, titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/subkultur/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/subkultur/${scope}.json`);
  assert.strictEqual(model.schema, 'civication_role_model_v2', `${scope}: roleModel schema v2`);
  assert.ok(Number(model.version) >= 2, `${scope}: roleModel revision v2+`);
  assert.strictEqual(model.role_scope, scope);
  assert.deepStrictEqual(model.badge_titles, titles);
  assert.ok(model.competence_axes.length >= 6, `${scope}: competence axes`);
  assert.ok(model.ideal_type_problems.length >= 5, `${scope}: ideal problems`);
  assert.ok(model.authority_boundaries.cannot.length >= 4, `${scope}: authority boundary`);
  assert.strictEqual(grammar.schema, 'civication_work_grammar_v2', `${scope}: FWG schema v2`);
  assert.ok(Number(grammar.version) >= 2, `${scope}: FWG revision v2+`);
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding.badge_titles, titles);
  assert.ok(grammar.task_families.length >= 5, `${scope}: task families`);
  assert.ok(grammar.work_loops.length >= 2, `${scope}: loops`);
  assert.ok(grammar.practice_stories.length >= 5, `${scope}: practice stories`);
  assert.ok(grammar.quality_axes.length >= 6, `${scope}: quality axes`);
  const forbiddenActions = grammar.authority_boundary?.may_not ?? grammar.authority_boundary?.cannot;
  assert.ok(Array.isArray(forbiddenActions) && forbiddenActions.length >= 4, `${scope}: authority boundary prohibitions`);
}

const pushes = [];
let qualifications = new Set();
let activePosition = null;
const sandbox = {
  console, setTimeout:()=>0, clearTimeout:()=>{}, fetch:async()=>({ok:true,json:async()=>({})}),
  localStorage:{getItem:()=>null,setItem:()=>{}}, document:{addEventListener:()=>{}},
  CustomEvent:function(t,i){this.type=t;this.detail=i?.detail}, Event:function(t){this.type=t},
  showToast:()=>{}, pulseBadge:()=>{}, catIdFromDisplay:v=>v, deriveTierFromPoints:()=>({tierIndex:0}),
  module:{exports:{}}, exports:{},
  window:{
    BADGES:[badge], HG_CAREERS:[career],
    CivicationJobs:{pushOffer(o){pushes.push(o);return {ok:true,offer:o}},canReceiveNewOffers:()=>true,getOffers:()=>[]},
    CivicationQualifications:{hasAll(ids){return ids.every(id=>qualifications.has(id))}},
    CivicationState:{getActivePosition:()=>activePosition},
    calculateWeeklySalary:(careerRow,tierIndex)=>Number(careerRow?.economy?.salary_by_tier?.[String(Number(tierIndex)+1)]||0),
    dispatchEvent:()=>{}
  }
};
sandbox.window.window=sandbox.window; sandbox.globalThis=sandbox.window; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT,'js/Civication/merits-and-jobs.js'),'utf8'),sandbox,{filename:'merits-and-jobs.js'});
vm.runInContext(fs.readFileSync(path.join(ROOT,'js/Civication/systems/civicationCareerRealityGuard.js'),'utf8'),sandbox,{filename:'civicationCareerRealityGuard.js'});

let result = sandbox.window.CivicationJobs.pushOffer({career_id:'subkultur',title:'Gangster',threshold:60,points_at_offer:60});
assert.strictEqual(result.ok,true);
assert.strictEqual(pushes.at(-1).title,'Kulturkonsulent');
assert.strictEqual(pushes.at(-1).badge_tier_label,'Gangster');
assert.strictEqual(Resolver.resolveCareerRoleScope(pushes.at(-1)),'subkultur_program_og_koordinering');
activePosition = pushes.at(-1);
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 5),7,
  'Kulturkonsulent salary resolves through Badge threshold -> career_unlock.salary_tier 2');

result = sandbox.window.CivicationJobs.pushOffer({career_id:'subkultur',title:'Undergrunnsikon',threshold:190,points_at_offer:190});
assert.strictEqual(result.ok,false);
assert.strictEqual(result.reason,'career_qualification_required');
qualifications = new Set(['employer_appointment']);
result = sandbox.window.CivicationJobs.pushOffer({career_id:'subkultur',title:'Undergrunnsikon',threshold:190,points_at_offer:190});
assert.strictEqual(result.ok,true);
assert.strictEqual(pushes.at(-1).title,'Produksjonsleder');
assert.strictEqual(Resolver.resolveCareerRoleScope(pushes.at(-1)),'subkultur_produksjonsledelse');
activePosition = pushes.at(-1);
assert.strictEqual(sandbox.window.calculateWeeklySalary(career, 9),13,
  'Produksjonsleder salary resolves through Badge threshold -> career_unlock.salary_tier 3');

async function runtimeIntegration() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {url:'http://localhost/Civication.html',runScripts:'outside-only'});
  const {window} = dom;
  window.fetch = async requestPath => {
    const rel = String(requestPath || '').replace(/^\.?\//,'');
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return {ok:false,status:404,json:async()=>null,text:async()=>''};
    const text = fs.readFileSync(abs,'utf8');
    return {ok:true,status:200,json:async()=>JSON.parse(text),text:async()=>text};
  };
  window.eval(fs.readFileSync(path.join(ROOT,'js/Civication/systems/civicationCareerRoleResolver.js'),'utf8'));
  window.eval(fs.readFileSync(path.join(ROOT,'js/Civication/systems/civicationRoleModelRuntime.js'),'utf8'));
  for (const [, , jobTitle, , , , scope] of EXPECTED) {
    const resolved = await window.CivicationRoleModelRuntime.resolveRoleModelPath({career_id:'subkultur',title:jobTitle});
    assert.strictEqual(resolved.role_scope,scope,`${jobTitle}: runtime scope`);
    assert.strictEqual(resolved.strategy,'canonical_role_scope',`${jobTitle}: shared canonical model wins`);
    assert.strictEqual(resolved.path,`data/Civication/roleModels/subkultur/${scope}.json`);
    const model = await window.CivicationRoleModelRuntime.loadRoleModel({career_id:'subkultur',title:jobTitle});
    assert.strictEqual(model.schema,'civication_role_model_v2');
    assert.ok(Number(model.version) >= 2);
  }
}

runtimeIntegration().then(()=>{
  console.log('civication Subkultur career architecture ok: 11 life positions / 11 separate jobs / 5 v2-schema work worlds / economy 4-7-13');
}).catch(error=>{console.error(error);process.exit(1);});
