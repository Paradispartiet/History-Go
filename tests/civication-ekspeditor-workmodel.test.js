#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const file = path.resolve(__dirname,'../data/Civication/workModels/naeringsliv_work_model.json');
const model = JSON.parse(fs.readFileSync(file,'utf8'));
const mails = model.mails.filter(m=>m.role_scope==='ekspeditor');
assert(mails.length>=40,'Need >=40');
const ids = new Set();
const domains = new Set();
for (const m of mails){
  assert(!ids.has(m.id),`duplicate ${m.id}`); ids.add(m.id);
  assert(m.situation && String(m.situation).trim(),'empty situation');
  assert(Array.isArray(m.choices) && m.choices.length>=2,'need 2 choices');
  m.choices.forEach(c=>{ assert(c.tags?.length,'tags'); assert(c.feedback,'feedback'); });
  domains.add(m.task_domain);
}
assert(domains.size>=5,'need 5 domains');
console.log('ekspeditor workmodel ok', mails.length);
