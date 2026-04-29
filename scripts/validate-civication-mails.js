#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const familiesRoot = path.resolve(__dirname, '../data/Civication/mailFamilies');
const modelPath = path.resolve(__dirname, '../data/Civication/workModels/naeringsliv_work_model.json');
const required = ['id','mail_type','mail_family','role_scope','subject','summary','situation','task_domain','competency','pressure','choice_axis','consequence_axis','narrative_arc','choices'];
const ids = new Set();
const domains = new Set();
const brandCounts = new Map();
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

function norm(value) {
  return String(value || '').trim();
}

function isEkspeditorRuntimeCatalog(file) {
  return file.includes('/naeringsliv/') && /ekspeditor_.*\.json$/.test(file);
}

function expectedBrandIdFromFile(file) {
  const normalized = file.replace(/\\/g, '/');
  if (!normalized.includes('/brand/')) return '';
  const name = path.basename(file, '.json');
  const match = name.match(/^ekspeditor_(.+)$/);
  return match ? match[1] : '';
}

function assertNonEmpty(value, label) {
  assert(norm(value).length > 0, `${label} missing or empty`);
}

for (const file of collectJsonFiles(familiesRoot)) {
  if (!isEkspeditorRuntimeCatalog(file)) continue;

  const expectedBrandId = expectedBrandIdFromFile(file);
  const isBrandCatalog = !!expectedBrandId;
  const raw = fs.readFileSync(file, 'utf8');
  const catalog = JSON.parse(raw);

  assert(Array.isArray(catalog.families) && catalog.families.length > 0, `Catalog families missing: ${file}`);

  if (isBrandCatalog) {
    assert.strictEqual(norm(catalog.brand_id), expectedBrandId, `Catalog brand_id must match filename in ${file}`);
    assertNonEmpty(catalog.brand_name, `Catalog brand_name in ${file}`);
    assertNonEmpty(catalog.brand_role, `Catalog brand_role in ${file}`);
  }

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

      if (isBrandCatalog) {
        assert.strictEqual(norm(mail.role_scope), 'ekspeditor', `Brand mail must stay ekspeditor-scoped in ${mail.id}`);
        assert.strictEqual(norm(mail.brand_id), expectedBrandId, `Brand mail brand_id mismatch in ${mail.id}`);
        assert.strictEqual(norm(mail.brand_name), norm(catalog.brand_name), `Brand mail brand_name mismatch in ${mail.id}`);
        assert.strictEqual(norm(mail.brand_role), norm(catalog.brand_role), `Brand mail brand_role mismatch in ${mail.id}`);
        brandCounts.set(expectedBrandId, (brandCounts.get(expectedBrandId) || 0) + 1);
      }
    }
  }
}

assert(ekspeditorCount >= 44, `Need >=44 ekspeditor mails, got ${ekspeditorCount}`);
assert(domains.size >= 5, `Need >=5 task domains among ekspeditor mails, got ${domains.size}`);
assert((brandCounts.get('norli') || 0) >= 1, 'Need at least one Norli brand-specific ekspeditor mail');
assert((brandCounts.get('narvesen') || 0) >= 1, 'Need at least one Narvesen brand-specific ekspeditor mail');
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
assert(!Object.prototype.hasOwnProperty.call(model, 'mails'), 'work model must not include top-level mails');

const brandSummary = [...brandCounts.entries()].map(([brand, count]) => `${brand}:${count}`).join(', ') || 'none';
console.log(`Validation OK: ${ids.size} mails total, ${ekspeditorCount} ekspeditor mails, ${domains.size} ekspeditor task domains, brand mails ${brandSummary}.`);
