#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');

const badge = readJson('data/badges/by.json');
const evidence = readJson('data/Civication/byCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const career = careers.find((item) => item.career_id === 'by');

const jobs = [
['Studentassistent',5,1,'qualification_required',['relevant_education_or_employer_qualification'],'by_assistent'],
['Praktikant (arkitektur/plan)',10,1,'direct',[],'by_assistent'],
['Prosjektmedarbeider',15,1,'direct',[],'by_assistent'],
['Saksbehandler (plan/bygg)',25,1,'direct',[],'by_saksbehandler'],
['Førstekonsulent',40,1,'direct',[],'by_saksbehandler'],
['Rådgiver (byutvikling)',60,2,'direct',[],'by_radgiver_plan'],
['Seniorrådgiver (byutvikling)',85,2,'direct',[],'by_radgiver_plan'],
['Arealplanlegger',115,2,'qualification_required',['relevant_education_or_employer_qualification'],'by_radgiver_plan'],
['Byplanlegger',150,2,'qualification_required',['relevant_education_or_employer_qualification'],'by_radgiver_plan'],
['Prosjektleder (byutvikling)',190,2,'direct',[],'by_prosjektleder'],
['Seksjonsleder',240,3,'appointment_required',['employer_appointment'],'by_prosjektleder'],
['Arkitekt',300,3,'qualification_required',['relevant_architecture_education_or_employment'],'by_arkitekt'],
['Seniorarkitekt',380,3,'qualification_required',['relevant_architecture_education_or_employment'],'by_arkitekt'],
['Fagsjef (plan/bygg)',500,3,'appointment_required',['employer_appointment'],'by_prosjektleder'],
['Byarkitekt',650,3,'appointment_required',['employer_appointment'],'by_arkitekt'],
['Direktør (byutvikling)',800,3,'appointment_required',['employer_appointment'],'by_prosjektleder']
];

assert.deepStrictEqual(badge.tiers.map(t=>[t.label,t.threshold]), jobs.map(([t,th])=>[t,th]));
assert.strictEqual(badge.career_life_evidence,'data/Civication/byCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers,jobs.map(([t])=>t));
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers,[]);
assert.deepStrictEqual(evidence.canonical_decision.review_left_open,[]);
assert.ok(evidence.sources.length >= 7);
assert.ok(career);
assert.deepStrictEqual(career.economy.salary_by_tier, {'1':6,'2':9,'3':15});
assert.deepStrictEqual(career.cross_requirements, {'3':[{'badge':'naeringsliv','min_tier':2},{'badge':'politikk','min_tier':1}]});
const auditRows = audit.badges.by;
assert.strictEqual(auditRows.length,16);
assert.strictEqual(auditRows.filter(row=>row[3]==='review').length,0);

for (const [title,threshold,salaryTier,policy,qualificationIds,scope] of jobs) {
  const tier = badge.tiers.find(t=>t.label===title);
  const expected = {title,policy};
  if (qualificationIds.length) expected.qualification_ids = qualificationIds;
  expected.salary_tier = salaryTier;
  expected.role_scope = scope;
  assert.deepStrictEqual(tier.career_offer, expected, `${title}: career_offer`);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'by',title}),scope,`${title}: resolver`);
}

for (const [scope,titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/by/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/by/${scope}.json`);
  assert.strictEqual(model.version,2);
  assert.strictEqual(model.role_scope,scope);
  assert.deepStrictEqual(model.badge_titles,titles);
  assert.ok(model.competence_axes.length >= 6);
  assert.ok(model.ideal_type_problems.length >= 5);
  assert.ok(model.authority_boundaries.cannot.length >= 4);
  assert.strictEqual(grammar.version,2);
  assert.strictEqual(grammar.role_scope,scope);
  assert.deepStrictEqual(grammar.badge_binding.badge_titles,titles);
  assert.ok(grammar.task_families.length >= 5);
  assert.ok(grammar.work_loops.length >= 2);
  assert.ok(grammar.practice_stories.length >= 5);
  assert.ok(grammar.quality_axes.length >= 6);
  assert.ok(grammar.authority_boundary.may_not.length >= 4);
  if (scope === 'by_radgiver_plan') {
    assert.ok(grammar.story_world?.simulation_promise, 'Arealplanlegger story_world må bevares');
    assert.ok(grammar.practice_stories.length >= 8, 'Arealplanlegger er complete_reference_v2 og krever minst åtte historier');
    assert.ok(grammar.fag_bindings?.required_concepts?.length > 0, 'Arealplanlegger må beholde faglig story-grunnlag');
    assert.strictEqual(grammar.mail_generation_contract?.minimum_counts?.micro,16);
    assert.strictEqual(grammar.mail_generation_contract?.minimum_counts?.followup,8);
    assert.strictEqual(grammar.mail_generation_contract?.minimum_counts?.knowledge,8);
    assert.strictEqual(grammar.mail_generation_contract?.minimum_counts?.consequence,8);
    assert.strictEqual(grammar.day_one_contract?.title,'Kartet ser ryddig ut');
  }
}

const meritsSource = fs.readFileSync(path.join(ROOT,'js/Civication/merits-and-jobs.js'),'utf8');
const guardSource = fs.readFileSync(path.join(ROOT,'js/Civication/systems/civicationCareerRealityGuard.js'),'utf8');
const pushed=[]; let qualifications=new Set();
const sandbox={console,setTimeout:()=>0,clearTimeout:()=>{},fetch:async()=>({ok:true,json:async()=>({})}),localStorage:{getItem:()=>null,setItem:()=>{}},document:{addEventListener:()=>{}},
CustomEvent:function(t,i){this.type=t;this.detail=i?.detail},Event:function(t){this.type=t},showToast:()=>{},pulseBadge:()=>{},catIdFromDisplay:v=>v,deriveTierFromPoints:()=>({tierIndex:0}),module:{exports:{}},exports:{},
window:{BADGES:[badge],HG_CAREERS:[career],CivicationJobs:{pushOffer(o){pushed.push(o);return {ok:true,offer:o}},canReceiveNewOffers:()=>true,getOffers:()=>[]},
CivicationQualifications:{hasAll(ids){return ids.every(id=>qualifications.has(id))}},CivicationState:{getActivePosition:()=>null},
calculateWeeklySalary:(c,i)=>Number(c?.economy?.salary_by_tier?.[String(Number(i)+1)]||0),dispatchEvent:()=>{}}};
sandbox.window.window=sandbox.window;sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
vm.runInContext(meritsSource,sandbox,{filename:'merits-and-jobs.js'});vm.runInContext(guardSource,sandbox,{filename:'civicationCareerRealityGuard.js'});

let r=sandbox.window.CivicationJobs.pushOffer({career_id:'by',title:'Studentassistent',threshold:5,points_at_offer:5});
assert.strictEqual(r.ok,false); assert.strictEqual(r.reason,'career_qualification_required');
qualifications=new Set(['relevant_education_or_employer_qualification']);
r=sandbox.window.CivicationJobs.pushOffer({career_id:'by',title:'Studentassistent',threshold:5,points_at_offer:5}); assert.strictEqual(r.ok,true);
qualifications=new Set();
r=sandbox.window.CivicationJobs.pushOffer({career_id:'by',title:'Arkitekt',threshold:300,points_at_offer:300}); assert.strictEqual(r.ok,false);
qualifications=new Set(['relevant_architecture_education_or_employment']);
r=sandbox.window.CivicationJobs.pushOffer({career_id:'by',title:'Arkitekt',threshold:300,points_at_offer:300}); assert.strictEqual(r.ok,true);
qualifications=new Set();
r=sandbox.window.CivicationJobs.pushOffer({career_id:'by',title:'Direktør (byutvikling)',threshold:800,points_at_offer:800}); assert.strictEqual(r.ok,false);
qualifications=new Set(['employer_appointment']);
r=sandbox.window.CivicationJobs.pushOffer({career_id:'by',title:'Direktør (byutvikling)',threshold:800,points_at_offer:800}); assert.strictEqual(r.ok,true);
assert.strictEqual(sandbox.window.calculateWeeklySalary(career,0),6);
assert.strictEqual(sandbox.window.calculateWeeklySalary(career,1),9);
assert.strictEqual(sandbox.window.calculateWeeklySalary(career,2),15);
console.log('civication By career architecture ok: 16 formal jobs / 5 work worlds / legacy Arealplanlegger mail-story contracts / economy 6-9-15');
