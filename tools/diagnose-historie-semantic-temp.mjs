#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const list = (v) => Array.isArray(v) ? v : [];
const unique = (v) => [...new Set(v.filter(Boolean))];

const emners = list(read('data/fag/historie/emner_historie_canonical_v4_5.json'));
const mappings = list(read('data/fag/historie/emnemapping_historie_canonical_v4_5.json'));
const fagkart = read('data/fag/historie/fagkart_historie_canonical_v4_5.json');
const theories = list(read('data/fag/historie/theory_objects_historie_canonical_v5_5.json'));
const hookById = new Map();
for (const category of list(fagkart.categories)) for (const hook of list(category.topic_hooks)) hookById.set(hook.id, hook);
const theoryByHook = new Map(theories.map((row) => [row.source_hook_id, row]));
const mappingByEmne = new Map(mappings.map((row) => [row.emne_id, row]));
const emneById = new Map(emners.map((row) => [row.emne_id, row]));

const blueprintFiles = {
  industri: 'reports/historie-canonical-migration/industri-arbeid-question-blueprints.json',
  velferd: 'reports/historie-canonical-migration/velferd-question-blueprints.json',
  byhistorie: 'reports/historie-canonical-migration/byhistorie-question-blueprints.json'
};
const blueprints = Object.fromEntries(Object.entries(blueprintFiles).map(([family, file]) => [family, list(read(file))]));

const fail = (phase, rows) => {
  if (!rows.length) {
    console.log(JSON.stringify({ phase, status: 'PASS', mismatches: 0 }, null, 2));
    return;
  }
  console.error(JSON.stringify({ phase, status: 'FAIL', mismatches: rows.length, rows }, null, 2));
  process.exitCode = 1;
};

const canonicalRows = (role, dimension) => {
  const rows = [];
  for (const emne of emners) {
    const hooks = role === 'primary' ? list(emne.primary_theory_hooks) : list(emne.secondary_theory_hooks);
    if (role === 'primary' && hooks.length !== 1) {
      rows.push({ emne_id: emne.emne_id, hook_id: null, reason: `primary_hook_count_${hooks.length}` });
      continue;
    }
    const mapped = new Set(list(mappingByEmne.get(emne.emne_id)?.mappings).map((row) => row.topic_hook));
    for (const hookId of hooks) {
      if (dimension === 'ownership') {
        const hook = hookById.get(hookId);
        if (!hook) rows.push({ emne_id: emne.emne_id, hook_id: hookId, reason: 'missing_hook' });
        else if (!list(hook.emne_ids).includes(emne.emne_id)) rows.push({ emne_id: emne.emne_id, hook_id: hookId, reason: 'hook_missing_emne' });
      } else if (dimension === 'theory' && !theoryByHook.has(hookId)) {
        rows.push({ emne_id: emne.emne_id, hook_id: hookId, reason: 'missing_theory' });
      } else if (dimension === 'mapping' && !mapped.has(hookId)) {
        rows.push({ emne_id: emne.emne_id, hook_id: hookId, reason: 'missing_mapping' });
      }
    }
  }
  return rows;
};

const blueprintStructure = () => {
  const rows = Object.entries(blueprints).flatMap(([family, items]) => items.map((row) => ({ ...row, family })));
  const mismatches = [];
  const seen = new Map();
  for (const row of rows) {
    if (!row.emne_id || !emneById.has(row.emne_id)) mismatches.push({ family: row.family, emne_id: row.emne_id || null, reason: 'unknown_emne' });
    if (!row.primary_hook_id) mismatches.push({ family: row.family, emne_id: row.emne_id, reason: 'missing_primary_hook_id' });
    if (seen.has(row.emne_id)) mismatches.push({ family: row.family, emne_id: row.emne_id, reason: `duplicate_emne_with_${seen.get(row.emne_id)}` });
    else seen.set(row.emne_id, row.family);
  }
  return mismatches;
};

const curatedRows = (family, dimension) => {
  const rows = [];
  for (const bp of blueprints[family]) {
    for (const hookId of unique([bp.primary_hook_id, bp.secondary_hook_id])) {
      if (dimension === 'ownership') {
        const hook = hookById.get(hookId);
        if (!hook) rows.push({ emne_id: bp.emne_id, hook_id: hookId, reason: 'missing_hook' });
        else if (!list(hook.emne_ids).includes(bp.emne_id)) rows.push({ emne_id: bp.emne_id, hook_id: hookId, reason: 'hook_missing_emne' });
      } else if (dimension === 'theory' && !theoryByHook.has(hookId)) {
        rows.push({ emne_id: bp.emne_id, hook_id: hookId, reason: 'missing_theory' });
      }
    }
  }
  return rows;
};

const phase = process.argv[2];
assert.ok(phase, 'Phase argument required');
if (phase === 'primary-ownership') fail(phase, canonicalRows('primary', 'ownership'));
else if (phase === 'primary-theory') fail(phase, canonicalRows('primary', 'theory'));
else if (phase === 'primary-mapping') fail(phase, canonicalRows('primary', 'mapping'));
else if (phase === 'secondary-ownership') fail(phase, canonicalRows('secondary', 'ownership'));
else if (phase === 'secondary-theory') fail(phase, canonicalRows('secondary', 'theory'));
else if (phase === 'secondary-mapping') fail(phase, canonicalRows('secondary', 'mapping'));
else if (phase === 'blueprint-structure') fail(phase, blueprintStructure());
else {
  const match = /^(byhistorie|industri|velferd)-(ownership|theory)$/.exec(phase);
  assert.ok(match, `Unknown phase ${phase}`);
  fail(phase, curatedRows(match[1], match[2]));
}
