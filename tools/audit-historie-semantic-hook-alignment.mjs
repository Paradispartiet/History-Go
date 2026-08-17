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
  const emner = list(readJson('data/fag/historie/emner_historie_canonical_v4_5.json'));
  const mappings = list(readJson('data/fag/historie/emnemapping_historie_canonical_v4_5.json'));
  const fagkart = readJson('data/fag/historie/fagkart_historie_canonical_v4_5.json');
  const theories = list(readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json'));

  assert.equal(emner.length, 230, 'Historie skal ha 230 canonicale kompatibilitetsemner');
  const emneById = new Map(emner.map((emne) => [emne.emne_id, emne]));
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
  for (const emne of emner) {
    const primaryHooks = list(emne.primary_theory_hooks);
    assert.equal(primaryHooks.length, 1, `${emne.emne_id}: completion krever nøyaktig én canonical primærhook`);
    const primaryHookId = primaryHooks[0];
    primaryKeys.push(primaryHookId);
    const primaryHook = hookById.get(primaryHookId);
    assert.ok(primaryHook, `${emne.emne_id}: ukjent primærhook ${primaryHookId}`);
    assert.ok(list(primaryHook.emne_ids).includes(emne.emne_id), `${emne.emne_id}: primærhook ${primaryHookId} eier ikke emnet`);
    assert.ok(theoryByHookId.has(primaryHookId), `${emne.emne_id}: primærhook ${primaryHookId} mangler teoriobjekt`);
    const mappedHooks = list(mappingByEmne.get(emne.emne_id)?.mappings).map((row) => row.topic_hook);
    assert.ok(mappedHooks.includes(primaryHookId), `${emne.emne_id}: mappinglaget bekrefter ikke primærhook ${primaryHookId}`);

    for (const secondaryHookId of list(emne.secondary_theory_hooks)) {
      const secondaryHook = hookById.get(secondaryHookId);
      assert.ok(secondaryHook, `${emne.emne_id}: ukjent sekundærhook ${secondaryHookId}`);
      assert.ok(list(secondaryHook.emne_ids).includes(emne.emne_id), `${emne.emne_id}: sekundærhook ${secondaryHookId} eier ikke emnet`);
      assert.ok(theoryByHookId.has(secondaryHookId), `${emne.emne_id}: sekundærhook ${secondaryHookId} mangler teoriobjekt`);
      assert.ok(mappedHooks.includes(secondaryHookId), `${emne.emne_id}: mappinglaget bekrefter ikke sekundærhook ${secondaryHookId}`);
      assert.notEqual(secondaryHookId, primaryHookId, `${emne.emne_id}: samme hook kan ikke være både primær og sekundær`);
    }
  }
  assert.equal(unique(primaryKeys).length, 230, 'Canonicale primærhooks må være unike for alle 230 emner');

  const blueprintRows = BLUEPRINT_FILES.flatMap((file) => list(readJson(file)).map((row) => ({ ...row, blueprint_file: file })));
  assert.ok(blueprintRows.length > 0, 'Ingen kuraterte History semantic-blueprints funnet');
  assert.equal(unique(blueprintRows.map((row) => row.emne_id)).length, blueprintRows.length, 'Samme emne finnes i flere kuraterte semantic-blueprints');

  const curatedMismatches = [];
  for (const blueprint of blueprintRows) {
    const emne = emneById.get(blueprint.emne_id);
    assert.ok(emne, `${blueprint.blueprint_file}: ukjent emne ${blueprint.emne_id}`);
    const actualPrimary = list(emne.primary_theory_hooks)[0];
    const actualSecondary = list(emne.secondary_theory_hooks)[0] || null;
    if (actualPrimary !== blueprint.primary_hook_id || actualSecondary !== (blueprint.secondary_hook_id || null)) {
      curatedMismatches.push({
        emne_id: blueprint.emne_id,
        title: blueprint.title,
        expected_primary: blueprint.primary_hook_id,
        actual_primary: actualPrimary,
        expected_secondary: blueprint.secondary_hook_id || null,
        actual_secondary: actualSecondary,
        blueprint_file: blueprint.blueprint_file
      });
    }
  }
  assert.deepEqual(curatedMismatches, [], `Kuraterte History-hooks er semantisk feilordnet: ${curatedMismatches.map((row) => `${row.emne_id}:${row.actual_primary}->${row.expected_primary}`).join(', ')}`);

  return {
    status: 'PASS',
    canonical_emner: emners.length,
    unique_primary_semantic_keys: unique(primaryKeys).length,
    curated_blueprint_rows: blueprintRows.length,
    curated_mismatches: 0,
    blueprint_files: BLUEPRINT_FILES
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(auditHistorySemanticHookAlignment(), null, 2));
}
