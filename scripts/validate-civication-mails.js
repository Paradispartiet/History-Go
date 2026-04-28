#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const mailRoot = path.join(repoRoot, 'data', 'Civication', 'mailFamilies');
const workModelPath = path.join(repoRoot, 'data', 'Civication', 'workModels', 'naeringsliv_work_model.json');

const errors = [];
const warnings = [];
const seenIds = new Map();

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${rel(filePath)}: invalid JSON: ${error.message}`);
    return null;
  }
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateChoice(file, mail, choice, index) {
  const prefix = `${rel(file)} -> ${mail.id} -> choices[${index}]`;
  for (const field of ['id', 'label', 'feedback']) {
    if (!isNonEmptyString(choice?.[field])) errors.push(`${prefix}: missing ${field}`);
  }
  if (!Number.isFinite(Number(choice?.effect))) errors.push(`${prefix}: missing numeric effect`);
  if (!Array.isArray(choice?.tags) || choice.tags.length === 0) errors.push(`${prefix}: missing non-empty tags`);
}

function validateMail(file, mail, familyId, workModel) {
  const prefix = `${rel(file)} -> ${mail?.id || '(missing id)'}`;
  const required = ['id', 'mail_type', 'mail_family', 'subject', 'summary', 'situation', 'choices'];

  for (const field of required) {
    if (field === 'situation') {
      if (!Array.isArray(mail?.situation) || mail.situation.length === 0) errors.push(`${prefix}: missing non-empty situation`);
    } else if (field === 'choices') {
      if (!Array.isArray(mail?.choices) || mail.choices.length === 0) errors.push(`${prefix}: missing non-empty choices`);
    } else if (!isNonEmptyString(mail?.[field])) {
      errors.push(`${prefix}: missing ${field}`);
    }
  }

  if (isNonEmptyString(mail?.id)) {
    if (seenIds.has(mail.id)) errors.push(`${prefix}: duplicate id also in ${seenIds.get(mail.id)}`);
    else seenIds.set(mail.id, rel(file));
  }

  if (mail?.mail_family && familyId && mail.mail_family !== familyId) {
    warnings.push(`${prefix}: mail_family '${mail.mail_family}' differs from family id '${familyId}'`);
  }

  const isNaeringsliv = rel(file).includes('mailFamilies/naeringsliv/');
  if (isNaeringsliv && mail?.source_type !== 'thread') {
    for (const field of ['task_domain', 'competency', 'pressure', 'choice_axis', 'consequence_axis']) {
      if (!isNonEmptyString(mail?.[field])) warnings.push(`${prefix}: recommended work-model field missing: ${field}`);
    }

    if (workModel) {
      const domains = new Set((workModel.task_domains || []).map(x => x.id));
      const competencies = new Set((workModel.competencies || []).map(x => x.id));
      const pressures = new Set(workModel.pressures || []);
      const axes = new Set((workModel.choice_axes || []).map(x => x.id));
      const consequences = new Set((workModel.consequence_axes || []).map(x => x.id));

      if (mail.task_domain && !domains.has(mail.task_domain)) warnings.push(`${prefix}: unknown task_domain '${mail.task_domain}'`);
      if (mail.competency && !competencies.has(mail.competency)) warnings.push(`${prefix}: unknown competency '${mail.competency}'`);
      if (mail.pressure && !pressures.has(mail.pressure)) warnings.push(`${prefix}: unknown pressure '${mail.pressure}'`);
      if (mail.choice_axis && !axes.has(mail.choice_axis)) warnings.push(`${prefix}: unknown choice_axis '${mail.choice_axis}'`);
      if (mail.consequence_axis && !consequences.has(mail.consequence_axis)) warnings.push(`${prefix}: unknown consequence_axis '${mail.consequence_axis}'`);
    }
  }

  (mail?.choices || []).forEach((choice, index) => validateChoice(file, mail, choice, index));
}

function validateCatalog(file, workModel) {
  const json = readJson(file);
  if (!json) return;

  if (!Array.isArray(json.families) || json.families.length === 0) {
    errors.push(`${rel(file)}: missing non-empty families array`);
    return;
  }

  json.families.forEach((family, familyIndex) => {
    const familyPrefix = `${rel(file)} -> families[${familyIndex}]`;
    if (!isNonEmptyString(family?.id)) errors.push(`${familyPrefix}: missing id`);
    if (!Array.isArray(family?.mails) || family.mails.length === 0) errors.push(`${familyPrefix}: missing non-empty mails`);
    (family?.mails || []).forEach(mail => validateMail(file, mail, family.id, workModel));

    (family?.threads || []).forEach(thread => {
      const threadMail = {
        ...thread,
        mail_type: thread.mail_type || json.mail_type || 'thread',
        mail_family: thread.mail_family || family.id,
        source_type: 'thread'
      };
      validateMail(file, threadMail, family.id, workModel);
    });
  });
}

function main() {
  const workModel = fs.existsSync(workModelPath) ? readJson(workModelPath) : null;
  const files = walk(mailRoot);
  files.forEach(file => validateCatalog(file, workModel));

  warnings.forEach(warning => console.warn(`WARN: ${warning}`));

  if (errors.length) {
    errors.forEach(error => console.error(`ERROR: ${error}`));
    console.error(`FAIL: ${errors.length} errors, ${warnings.length} warnings`);
    process.exit(1);
  }

  console.log(`PASS: validated ${files.length} Civication mail family files, ${seenIds.size} mail/thread ids`);
  if (warnings.length) console.log(`WARNINGS: ${warnings.length}`);
}

main();
