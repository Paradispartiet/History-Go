const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mailFamiliesDir = path.join(root, 'data', 'Civication', 'mailFamilies');

function listJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJsonFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.json') ? [fullPath] : [];
  });
}

function normalizeLabel(label) {
  return String(label || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function choiceSignature(mail) {
  const labels = Array.isArray(mail?.choices)
    ? mail.choices.map((choice) => normalizeLabel(choice?.label)).filter(Boolean)
    : [];
  if (labels.length < 2) return '';
  return labels.sort().join(' || ');
}

function collectMails(value, out = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectMails(item, out));
  } else if (value && typeof value === 'object') {
    if (value.id && Array.isArray(value.choices) && value.role_scope && value.mail_type) {
      out.push(value);
    }
    Object.values(value).forEach((item) => collectMails(item, out));
  }
  return out;
}

const mails = listJsonFiles(mailFamiliesDir)
  .flatMap((file) => collectMails(JSON.parse(fs.readFileSync(file, 'utf8'))));

const seen = new Map();
const failures = [];

for (const mail of mails) {
  const signature = choiceSignature(mail);
  if (!signature) continue;

  const key = [mail.role_scope || '', mail.mail_type || '', signature].join('\u0000');
  const previous = seen.get(key);
  if (!previous) {
    seen.set(key, mail);
    continue;
  }

  const differentContext = previous.subject !== mail.subject
    || previous.person_id !== mail.person_id
    || previous.task_domain !== mail.task_domain;
  const explicitlyShared = previous.shared_choice_pair === true && mail.shared_choice_pair === true;

  if (differentContext && !explicitlyShared) {
    failures.push([
      `role_scope: ${mail.role_scope}`,
      `mail_type: ${mail.mail_type}`,
      `mail_ids: ${previous.id} <-> ${mail.id}`,
      `subjects: ${previous.subject || '(none)'} <-> ${mail.subject || '(none)'}`,
      `task_domains: ${previous.task_domain || '(none)'} <-> ${mail.task_domain || '(none)'}`,
      `choice_signature: ${signature}`
    ].join('\n'));
  }
}

assert.strictEqual(
  failures.length,
  0,
  `Duplicate Civication mail choice-label pairs found in the same role_scope + mail_type:\n\n${failures.join('\n\n')}`
);

console.log(`Checked ${mails.length} Civication mails (all mail_types) for duplicate choice-label pairs.`);
