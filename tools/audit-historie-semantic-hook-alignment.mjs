#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];

const BLUEPRINT_FILES = [
  'reports/historie-canonical-migration/industri-arbeid-question-blueprints.json',
  'reports/historie-canonical-migration/velferd-question-blueprints.json',
  'reports/historie-canonical-migration/byhistorie-question-blueprints.json'
];

export function auditHistorySemanticHookAlignment() {
  const emners = list(readJson('data/fag/historie/emner_historie_canonical_v4_5.json'));
  const mappings = list(readJson('data/fag/historie/emnemapping_historie_canonical_v4_5.json'));
  const fagkart = readJson('data/fag/historie/fagkart_historie_canonical_v4_5.json');
  const theories = list(readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json'));

  assert.equal(emners.length, 230, 'Historie skal ha 230 canonicale kompatibilitetsemner');
  const emneById = new Map(emners.map((emne) => [emne.emne_id, emne]));
  assert.equal(emneById.size, 230, 'Canonical emne-ID-er må være unike');

  const hookById = new Map();
  for (const category of list(fagkart.categories)) {
    for (const hook of list(category.topic_hooks)) {
      assert.ok(!hookById.has(hook.id), `Duplisert History hook-id ${hook.id}`);
      hookById.set(hook.id, hook);
    }
  }
  const theoryByHookId = new Map(theories.map((theory) => [theory.source_hook_id, theory]));
  const mappingByEmne = new Map(mappings.map((mapping) => [mapping.emne_id, mapping]));

  const primaryKeys = [];
  const canonicalMismatches = [];
  for (const emne of emners) {
    const primaryHooks = list(emne.primary_theory_hooks);
    if (primaryHooks.length !== 1) {
      canonicalMismatches.push({ emne_id: emne.emne_id, role: 'primary', hook_id: null, reasons: [`primary_hook_count_${primaryHooks.length}`] });
      continue;
    }

    const primaryHookId = primaryHooks[0];
    primaryKeys.push(primaryHookId);
    const mappedHooks = list(mappingByEmne.get(emne.emne_id)?.mappings).map((row) => row.topic_hook);
    const checkCanonicalHook = (hookId, role) => {
      const hook = hookById.get(hookId);
      const reasons = [];
      if (!hook) reasons.push('missing_hook');
      if (hook && !list(hook.emne_ids).includes(emne.emne_id)) reasons.push('hook_missing_emne');
      if (!theoryByHookId.has(hookId)) reasons.push('missing_theory');
      if (!mappedHooks.includes(hookId)) reasons.push('missing_mapping');
      if (role === 'secondary' && hookId === primaryHookId) reasons.push('same_as_primary');
      if (reasons.length) canonicalMismatches.push({ emne_id: emne.emne_id, role, hook_id: hookId, reasons });
    };

    checkCanonicalHook(primaryHookId, 'primary');
    for (const secondaryHookId of list(emne.secondary_theory_hooks)) {
      checkCanonicalHook(secondaryHookId, 'secondary');
    }
  }

  assert.equal(unique(primaryKeys).length, 230, 'Canonicale primærhooks må være unike for alle 230 emner');
  assert.deepEqual(
    canonicalMismatches,
    [],
    `Canonical History hook-kjeder er inkonsistente: ${canonicalMismatches.map((row) => `${row.emne_id}:${row.role}:${row.hook_id || 'none'}[${row.reasons.join('+')}]`).join(', ')}`
  );

  const blueprintRows = BLUEPRINT_FILES.flatMap((file) => list(readJson(file)).map((row) => ({ ...row, blueprint_file: file })));
  assert.ok(blueprintRows.length > 0, 'Ingen kuraterte History semantic-blueprints funnet');
  assert.equal(unique(blueprintRows.map((row) => row.emne_id)).length, blueprintRows.length, 'Samme emne finnes i flere kuraterte semantic-blueprints');

  const curatedMismatches = [];
  for (const blueprint of blueprintRows) {
    const emne = emneById.get(blueprint.emne_id);
    assert.ok(emne, `${blueprint.blueprint_file}: ukjent emne ${blueprint.emne_id}`);
    assert.ok(blueprint.primary_hook_id, `${blueprint.emne_id}: kuratert blueprint mangler primary_hook_id`);
    const editorialHookIds = unique([blueprint.primary_hook_id, blueprint.secondary_hook_id]);
    for (const editorialHookId of editorialHookIds) {
      const hook = hookById.get(editorialHookId);
      const reasons = [];
      if (!hook) reasons.push('missing_hook');
      if (hook && !list(hook.emne_ids).includes(blueprint.emne_id)) reasons.push('hook_missing_emne');
      if (!theoryByHookId.has(editorialHookId)) reasons.push('missing_theory');
      if (reasons.length) {
        curatedMismatches.push({
          emne_id: blueprint.emne_id,
          editorial_hook_id: editorialHookId,
          blueprint_file: blueprint.blueprint_file,
          reasons
        });
      }
    }
  }

  assert.deepEqual(
    curatedMismatches,
    [],
    `Kuraterte redaksjonelle History-hooks mangler gyldig hook/emne/teorikjede: ${curatedMismatches.map((row) => `${row.emne_id}:${row.editorial_hook_id}[${row.reasons.join('+')}]`).join(', ')}`
  );

  return {
    status: 'PASS',
    canonical_emners: emners.length,
    unique_primary_semantic_keys: unique(primaryKeys).length,
    canonical_hook_mismatches: 0,
    curated_blueprint_rows: blueprintRows.length,
    curated_editorial_hook_mismatches: 0,
    canonical_identity_preserved: unique(primaryKeys).length === 230,
    blueprint_files: BLUEPRINT_FILES
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(auditHistorySemanticHookAlignment(), null, 2));
}
