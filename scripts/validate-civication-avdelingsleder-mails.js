#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const roleScope = 'avdelingsleder';
const category = 'naeringsliv';

const requiredMailFields = ['id','mail_type','mail_family','role_scope','subject','summary','situation','task_domain','competency','pressure','choice_axis','consequence_axis','narrative_arc','choices'];
function readJson(p){const full=path.join(root,p);assert(fs.existsSync(full),`Missing file: ${p}`);return JSON.parse(fs.readFileSync(full,'utf8'));}

const roleModel = readJson(`data/Civication/roleModels/${category}/${roleScope}.json`);
const plan = readJson(`data/Civication/mailPlans/${category}/${roleScope}_plan.json`);
const files = [
`data/Civication/mailFamilies/${category}/job/${roleScope}_intro_v2.json`,
`data/Civication/mailFamilies/${category}/job/${roleScope}_job.json`,
`data/Civication/mailFamilies/${category}/conflict/${roleScope}_conflict.json`,
`data/Civication/mailFamilies/${category}/event/${roleScope}_event.json`,
`data/Civication/mailFamilies/${category}/story/${roleScope}_story.json`,
`data/Civication/mailFamilies/${category}/people/${roleScope}_people.json`,
`data/Civication/mailFamilies/${category}/micro/${roleScope}_micro.json`
];
const families=new Map(); const mails=[];
for(const file of files){const cat=readJson(file); assert.strictEqual(cat.category,category); assert.strictEqual(cat.role_scope,roleScope);
for(const fam of cat.families||[]){families.set(fam.id,fam); for(const m of fam.mails||[]) mails.push(m);} }
assert.strictEqual(roleModel.role_scope,roleScope); assert.strictEqual(roleModel.role_id,'naer_avdelingsleder'); assert.strictEqual(plan.role_scope,roleScope); assert.strictEqual(plan.id,'avdelingsleder_naeringsliv_v1');
for(const step of plan.sequence||[]) for(const f of step.allowed_families||[]) assert(families.has(f),`Plan missing family: ${f}`);
for(const f of roleModel.mail_integration?.recommended_mail_families||[]) assert(families.has(f),`Recommended missing family: ${f}`);
const ids=new Set();
for(const m of mails){ for(const k of requiredMailFields) assert(m[k]!==undefined && m[k]!=='' ,`Missing ${k} in ${m.id}`); assert.strictEqual(m.role_scope,roleScope); assert(Array.isArray(m.situation)&&m.situation.length>0,`bad situation ${m.id}`); assert(Array.isArray(m.choices)&&m.choices.length>=2,`choices>=2 ${m.id}`); assert(!ids.has(m.id),`dup ${m.id}`); ids.add(m.id);
for(const c of m.choices){assert(c.id!==undefined&&c.id!=='',`choice.id ${m.id}`); assert(c.label,`choice.label ${m.id}`); assert(c.effect!==undefined,`choice.effect ${m.id}`); assert(Array.isArray(c.tags),`choice.tags ${m.id}`); assert(String(c.feedback||'').trim(),`choice.feedback ${m.id}`);} }

console.log('Avdelingsleder Civication validation OK.');
