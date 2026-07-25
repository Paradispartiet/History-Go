import fs from 'node:fs';
import path from 'node:path';

const domainId = 'his_velferd_rett_hverdagsliv';
const files = [
  'data/fag/historie/fagkart_historie_canonical_v4_5.json',
  'data/fag/historie/historiepensum_canonical_v4_5.json',
  'data/fag/historie/emner_historie_canonical_v4_5.json',
  'data/fag/historie/methods_historie_canonical_v4_5.json',
  'data/fag/historie/emnemapping_historie_canonical_v4_5.json',
  'data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json',
  'data/fag/historie/historie_v5_blueprint.json',
  'data/fag/historie/historie_v5_contract.json'
];

const docs = Object.fromEntries(files.map((file) => [file, JSON.parse(fs.readFileSync(file, 'utf8'))]));

function walk(value, visit, currentPath = '$') {
  if (!value || typeof value !== 'object') return;
  if (!Array.isArray(value)) visit(value, currentPath);
  if (Array.isArray(value)) value.forEach((item, index) => walk(item, visit, `${currentPath}[${index}]`));
  else Object.entries(value).forEach(([key, child]) => walk(child, visit, `${currentPath}.${key}`));
}

function directStrings(object) {
  const result = [];
  for (const value of Object.values(object)) {
    if (typeof value === 'string') result.push(value);
    if (Array.isArray(value)) result.push(...value.filter((item) => typeof item === 'string'));
  }
  return result;
}

function recordsMatching(ids) {
  const output = {};
  for (const [file, doc] of Object.entries(docs)) {
    const matches = [];
    walk(doc, (object, objectPath) => {
      const direct = directStrings(object);
      const matched = ids.filter((id) => direct.includes(id));
      if (matched.length) matches.push({ path: objectPath, matched_ids: matched, object });
    });
    output[file] = matches;
  }
  return output;
}

const firstPass = recordsMatching([domainId]);
const domainRecords = Object.entries(firstPass).flatMap(([file, records]) => records.map((record) => ({ file, ...record })));
const ids = new Set([domainId]);
for (const { object } of domainRecords) {
  for (const [key, value] of Object.entries(object)) {
    if (typeof value === 'string' && /(^id$|_id$)/.test(key)) ids.add(value);
    if (Array.isArray(value) && /(_ids$|^emner$|^methods$|^hooks$)/.test(key)) {
      value.filter((item) => typeof item === 'string').forEach((item) => ids.add(item));
    }
  }
}

const exactRecords = recordsMatching([...ids]);
const summary = Object.fromEntries(Object.entries(exactRecords).map(([file, records]) => [file, records.length]));
const output = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  discovered_ids: [...ids].sort(),
  record_counts: summary,
  records_by_file: exactRecords
};

const outPath = 'reports/historie-canonical-migration/velferd-phase5-precise-audit.json';
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
console.log(`Wrote ${outPath}`);