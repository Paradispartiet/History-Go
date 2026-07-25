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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function walk(value, visit, currentPath = '$') {
  if (!value || typeof value !== 'object') return;
  if (!Array.isArray(value)) visit(value, currentPath);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${currentPath}[${index}]`));
  } else {
    for (const [key, child] of Object.entries(value)) {
      walk(child, visit, `${currentPath}.${key}`);
    }
  }
}

function directValues(object) {
  const values = [];
  for (const value of Object.values(object)) {
    if (typeof value === 'string') values.push(value);
    else if (Array.isArray(value)) values.push(...value.filter((item) => typeof item === 'string'));
  }
  return values;
}

const docs = Object.fromEntries(files.map((file) => [file, readJson(file)]));
const domainObjects = [];
for (const [file, doc] of Object.entries(docs)) {
  walk(doc, (object, objectPath) => {
    const values = directValues(object);
    if (values.includes(domainId)) domainObjects.push({ file, path: objectPath, object });
  });
}

const idSet = new Set([domainId]);
for (const entry of domainObjects) {
  const object = entry.object;
  for (const [key, value] of Object.entries(object)) {
    if (/(_ids|^emner$|^methods$|^hooks$)/.test(key) && Array.isArray(value)) {
      value.filter((item) => typeof item === 'string').forEach((item) => idSet.add(item));
    }
    if (/(_id$|^id$)/.test(key) && typeof value === 'string') idSet.add(value);
  }
}

const relevant = {};
for (const [file, doc] of Object.entries(docs)) {
  const matches = [];
  walk(doc, (object, objectPath) => {
    const text = JSON.stringify(object);
    const matchedIds = [...idSet].filter((id) => text.includes(`\"${id}\"`));
    if (matchedIds.length > 0) matches.push({ path: objectPath, matched_ids: matchedIds, object });
  });
  relevant[file] = matches;
}

const output = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  source_files: files,
  discovered_ids: [...idSet].sort(),
  domain_objects: domainObjects,
  relevant_objects_by_file: relevant
};

const outPath = 'reports/historie-canonical-migration/velferd-phase5-complete-audit.json';
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
console.log(`Domain objects: ${domainObjects.length}`);
console.log(`Discovered IDs: ${idSet.size}`);
for (const [file, matches] of Object.entries(relevant)) console.log(`${file}: ${matches.length} relevant objects`);