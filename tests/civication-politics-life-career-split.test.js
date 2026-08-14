#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const Resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
const badge = readJson('data/badges/politikk.json');
const evidence = readJson('data/Civication/politikkCareerLifeEvidence.json');
const audit = readJson('data/Civication/badgeCareerAuditPolicy.json');
const careerRulesRaw = readJson('data/Civication/hg_careers.json');
const careers = Array.isArray(careerRulesRaw) ? careerRulesRaw : careerRulesRaw.careers;
const politicsCareer = careers.find((career) => career.career_id === 'politikk');

const expectedTiers = [
  ['Samfunnsengasjert borger',5],['Aktivist',10],['Tillitsvalgt',15],['Organisasjonssekretær',25],
  ['Politisk rådgiver',40],['Kommunestyrerepresentant',60],['Ordfører',85],['Fylkespolitiker',115],
  ['Stortingsrepresentant',150],['Komitéleder',190],['Statssekretær',240],['Statsråd (minister)',300],
  ['Partileder',380],['Statsminister',500],['Demokratianalytiker',650],['Statsvitenskapelig ekspert',800]
];
const pureLife = ['Samfunnsengasjert borger','Aktivist','Tillitsvalgt','Kommunestyrerepresentant','Fylkespolitiker','Komitéleder','Partileder','Demokratianalytiker','Statsvitenskapelig ekspert'];
const jobs = [
  ['Organisasjonssekretær',1,'direct',[],'politikk_organisasjonsarbeid'],
  ['Politisk rådgiver',2,'appointment_required',['employer_appointment'],'politikk_politisk_radgivning'],
  ['Ordfører',2,'appointment_required',['election_or_mandate'],'politikk_kommunal_ledelse'],
  ['Stortingsrepresentant',2,'appointment_required',['election_or_mandate'],'politikk_parlamentarisk_arbeid'],
  ['Statssekretær',2,'appointment_required',['public_office_appointment'],'politikk_regjeringsledelse'],
  ['Statsråd (minister)',3,'appointment_required',['public_office_appointment'],'politikk_regjeringsledelse'],
  ['Statsminister',3,'appointment_required',['public_office_appointment'],'politikk_regjeringsledelse']
];

assert.strictEqual(badge.id, 'politikk');
assert.strictEqual(badge.tiers.length, 16);
assert.deepStrictEqual(badge.tiers.map((tier) => [tier.label,tier.threshold]), expectedTiers);
assert.strictEqual(badge.career_life_evidence, 'data/Civication/politikkCareerLifeEvidence.json');
assert.deepStrictEqual(evidence.canonical_decision.pure_life_or_practice_tiers, pureLife);
assert.deepStrictEqual(evidence.canonical_decision.formal_job_tiers, jobs.map(([title]) => title));
assert.deepStrictEqual(evidence.canonical_decision.review_left_open, []);
assert.deepStrictEqual(evidence.salary_mapping.existing_politikk_bands_pc_per_week, {'1':6,'2':10,'3':18});
assert.ok(evidence.sources.length >= 8);

const politicsAudit = audit.badges.politikk;
assert.strictEqual(politicsAudit.length, 16);
assert.strictEqual(politicsAudit.filter((row) => row[3] === 'review').length, 0);
assert.deepStrictEqual(politicsAudit.find((row) => row[0] === 'Aktivist'), ['Aktivist','activism_practice','not_job','replace',[]]);
assert.deepStrictEqual(politicsAudit.find((row) => row[0] === 'Tillitsvalgt'), ['Tillitsvalgt','representative_mandate','not_job','replace',[]]);
assert.deepStrictEqual(politicsAudit.find((row) => row[0] === 'Politisk rådgiver'), ['Politisk rådgiver','political_staff_position','appointment_required','keep_with_gate',['employer_appointment']]);
assert.deepStrictEqual(politicsAudit.find((row) => row[0] === 'Statsminister'), ['Statsminister','appointed_political_office','appointment_required','keep_with_gate',['public_office_appointment']]);
assert.deepStrictEqual(politicsAudit.find((row) => row[0] === 'Demokratianalytiker'), ['Demokratianalytiker','expertise_status','not_job','replace',[]]);
assert.deepStrictEqual(politicsAudit.find((row) => row[0] === 'Statsvitenskapelig ekspert'), ['Statsvitenskapelig ekspert','expertise_status','not_job','replace',[]]);

for (const label of pureLife) {
  const tier = badge.tiers.find((item) => item.label === label);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.strictEqual(tier.career_offer, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
}
for (const [title,salaryTier,policy,qualificationIds,scope] of jobs) {
  const tier = badge.tiers.find((item) => item.label === title);
  assert.strictEqual(tier.career_offer.title, title);
  assert.strictEqual(tier.career_offer.salary_tier, salaryTier);
  assert.strictEqual(tier.career_offer.policy, policy);
  assert.deepStrictEqual(tier.career_offer.qualification_ids || [], qualificationIds);
  assert.strictEqual(tier.career_offer.role_scope, scope);
  assert.strictEqual(tier.life_position, undefined);
  assert.strictEqual(Resolver.resolveCareerRoleScope({career_id:'politikk', title, role_scope:scope}), scope);
}
assert.ok(politicsCareer);
assert.deepStrictEqual(politicsCareer.economy.salary_by_tier, {'1':6,'2':10,'3':18});

for (const [scope,titles] of Object.entries(evidence.canonical_decision.work_worlds)) {
  const model = readJson(`data/Civication/roleModels/politikk/${scope}.json`);
  const grammar = readJson(`data/Civication/workGrammars/politikk/${scope}.json`);
  assert.strictEqual(model.version, 2);
  assert.strictEqual(model.category, 'politikk');
  assert.strictEqual(model.role_scope, scope);
  assert.strictEqual(model.source.evidence, 'data/Civication/politikkCareerLifeEvidence.json');
  assert.deepStrictEqual(model.badge_titles, titles);
  assert.ok(model.competence_axes.length >= 6);
  assert.ok(model.ideal_type_problems.length >= 5);
  assert.ok(model.authority_boundaries.cannot.length >= 4);
  assert.strictEqual(grammar.version, 2);
  assert.strictEqual(grammar.role_scope, scope);
  assert.deepStrictEqual(grammar.badge_binding.badge_titles, titles);
  assert.ok(grammar.task_families.length >= 5);
  assert.ok(grammar.work_loops.length >= 2);
  assert.ok(grammar.practice_stories.length >= 5);
  assert.ok(grammar.quality_axes.length >= 6);
  assert.ok(grammar.authority_boundary.may_not.length >= 4);
}

const meritsSource = fs.readFileSync(path.join(ROOT, 'js/Civication/merits-and-jobs.js'), 'utf8');
const guardSource = fs.readFileSync(path.join(ROOT, 'js/Civication/systems/civicationCareerRealityGuard.js'), 'utf8');
const pushed = [];
let qualifications = new Set();
const sandbox = {console,setTimeout:()=>0,clearTimeout:()=>{},fetch:async()=>({ok:true,json:async()=>({})}),localStorage:{getItem:()=>null,setItem:()=>{}},document:{addEventListener:()=>{}},CustomEvent:function(type,init){this.type=type;this.detail=init?.detail;},Event:function(type){this.type=type;},showToast:()=>{},pulseBadge:()=>{},catIdFromDisplay:(value)=>value,deriveTierFromPoints:()=>({tierIndex:0}),module:{exports:{}},exports:{},window:{BADGES:[badge],HG_CAREERS:[politicsCareer],CivicationJobs:{pushOffer(offer){pushed.push(offer);return {ok:true,offer};},canReceiveNewOffers:()=>true,getOffers:()=>[]},CivicationQualifications:{hasAll(ids){return ids.every((id)=>qualifications.has(id));}},CivicationState:{getActivePosition:()=>null},dispatchEvent:()=>{}}};
sandbox.window.window=sandbox.window;sandbox.globalThis=sandbox.window;vm.createContext(sandbox);
vm.runInContext(meritsSource,sandbox,{filename:'merits-and-jobs.js'});
vm.runInContext(guardSource,sandbox,{filename:'civicationCareerRealityGuard.js'});
for (const label of pureLife) {
  const tier=badge.tiers.find((item)=>item.label===label);
  const result=sandbox.window.CivicationJobs.pushOffer({career_id:'politikk',title:label,threshold:tier.threshold,points_at_offer:9999});
  assert.strictEqual(result.ok,false,`${label}: mandat/livsposisjon må stoppes før jobb-lageret`);
  assert.strictEqual(result.reason,'life_position_not_job');
}
assert.strictEqual(pushed.length,0);
let result=sandbox.window.CivicationJobs.pushOffer({career_id:'politikk',title:'Organisasjonssekretær',threshold:25});
assert.strictEqual(result.ok,true);
qualifications=new Set();
result=sandbox.window.CivicationJobs.pushOffer({career_id:'politikk',title:'Politisk rådgiver',threshold:40});assert.strictEqual(result.ok,false);assert.strictEqual(result.reason,'career_qualification_required');
qualifications=new Set(['employer_appointment']);result=sandbox.window.CivicationJobs.pushOffer({career_id:'politikk',title:'Politisk rådgiver',threshold:40});assert.strictEqual(result.ok,true);
qualifications=new Set();
for (const title of ['Ordfører','Stortingsrepresentant']) {result=sandbox.window.CivicationJobs.pushOffer({career_id:'politikk',title});assert.strictEqual(result.ok,false);}
qualifications=new Set(['election_or_mandate']);
for (const title of ['Ordfører','Stortingsrepresentant']) {result=sandbox.window.CivicationJobs.pushOffer({career_id:'politikk',title});assert.strictEqual(result.ok,true);}
result=sandbox.window.CivicationJobs.pushOffer({career_id:'politikk',title:'Statsminister',threshold:500});assert.strictEqual(result.ok,false,'valg/mandat alene skal ikke materialisere Statsminister');
qualifications=new Set(['employer_appointment']);result=sandbox.window.CivicationJobs.pushOffer({career_id:'politikk',title:'Statsminister',threshold:500});assert.strictEqual(result.ok,false,'arbeidsgiverutnevnelse skal ikke materialisere Statsminister');
qualifications=new Set(['public_office_appointment']);
for (const title of ['Statssekretær','Statsråd (minister)','Statsminister']) {result=sandbox.window.CivicationJobs.pushOffer({career_id:'politikk',title});assert.strictEqual(result.ok,true,`${title}: offentlig utnevnelse skal åpne rollen`);}

console.log('civication politics life-career split ok: 9 life/mandate/expertise tiers / 7 formal positions / 5 high-quality work worlds');
