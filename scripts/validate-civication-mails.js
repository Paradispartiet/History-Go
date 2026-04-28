#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const familiesRoot = path.resolve(__dirname, '../data/Civication/mailFamilies');
const modelPath = path.resolve(__dirname, '../data/Civication/workModels/naeringsliv_work_model.json');
const required = ['id','mail_type','mail_family','role_scope','subject','summary','situation','task_domain','competency','pressure','choice_axis','consequence_axis','narrative_arc','choices'];
const ids = new Set();
const domains = new Set();
let ekspeditorCount = 0;

function collectJsonFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

for (const file of collectJsonFiles(familiesRoot)) {
  if (!file.includes('/naeringsliv/') || !/ekspeditor_.*\.json$/.test(file)) continue;
  const raw = fs.readFileSync(file, 'utf8');
  const catalog = JSON.parse(raw);
  assert(Array.isArray(catalog.families) && catalog.families.length > 0, `Catalog families missing: ${file}`);
  for (const family of catalog.families) {
    assert(Array.isArray(family.mails) && family.mails.length > 0, `Family mails missing: ${file}#${family.id}`);
    for (const mail of family.mails) {
      for (const key of required) assert(mail[key] !== undefined && mail[key] !== '', `Missing ${key} in ${mail.id}`);
      assert(!ids.has(mail.id), `Duplicate id ${mail.id}`); ids.add(mail.id);
      assert(Array.isArray(mail.situation) && mail.situation.length > 0, `situation must be non-empty array in ${mail.id}`);
      assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `Need >=2 choices in ${mail.id}`);
      for (const c of mail.choices) {
        assert(c.id !== undefined && c.id !== '', `choice.id missing in ${mail.id}`);
        assert(c.label !== undefined && c.label !== '', `choice.label missing in ${mail.id}`);
        assert(c.effect !== undefined, `choice.effect missing in ${mail.id}`);
        assert(Array.isArray(c.tags), `choice.tags missing in ${mail.id}`);
        assert(c.feedback !== undefined && String(c.feedback).trim().length > 0, `choice.feedback missing in ${mail.id}`);
      }
      if (mail.role_scope === 'ekspeditor') {
        ekspeditorCount += 1;
        domains.add(mail.task_domain);
      }
    }
  }
}

assert(ekspeditorCount >= 44, `Need >=44 ekspeditor mails, got ${ekspeditorCount}`);
assert(domains.size >= 5, `Need >=5 task domains among ekspeditor mails, got ${domains.size}`);
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
assert(!Object.prototype.hasOwnProperty.call(model, 'mails'), 'work model must not include top-level mails');

console.log(`Validation OK: ${ids.size} mails total, ${ekspeditorCount} ekspeditor mails, ${domains.size} ekspeditor task domains.`);
