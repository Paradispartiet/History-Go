#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const sorted = (values) => [...values].sort();

export function auditHistorySemanticHookAlignment() {
  const pensum = readJson('data/fag/historie/historiepensum_canonical_v4_5.json');
  const emners = list(readJson('data/fag/historie/emner_historie_canonical_v4_5.json'));
  const mappings = list(readJson('data/fag/historie/emnemapping_historie_canonical_v4_5.json'));
  const fagkart = readJson('data/fag/historie/fagkart_historie_canonical_v4_5.json');
  const theories = list(readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json'));
  const editorial = readJson('data/fag/historie/editorial_theory_overrides_historie_v1.json');

  assert.equal(editorial?.policy?.semantic_identity_source, 'emner_historie_canonical_v4_5.primary_theory_hooks[0]', 'Editorial-registryen må bevare canonical semantic identity');
  assert.equal(editorial?.policy?.editorial_hooks_do_not_redefine_semantic_identity, true, 'Editorial hooks må være et separat analyselag');
  assert.equal(editorial?.policy?.editorial_hooks_may_repeat, true, 'Editorial hooks må kunne gjenbrukes uten å bli semantic identity');

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
  assert.equal(mappingByEmne.size, emners.length, 'Alle canonicale emner skal ha én mapping-rad');

  const primaryKeys = [];
  const canonicalMismatches = [];
  for (const emne of emners) {
    const primaryHooks = list(emne.primary_theory_hooks);
    const secondaryHooks = list(emne.secondary_theory_hooks);
    if (primaryHooks.length !== 1) {
      canonicalMismatches.push({ emne_id: emne.emne_id, role: 'primary', hook_id: null, reasons: [`primary_hook_count_${primaryHooks.length}`] });
      continue;
    }

    const primaryHookId = primaryHooks[0];
    primaryKeys.push(primaryHookId);
    const mappingRows = list(mappingByEmne.get(emne.emne_id)?.mappings);
    const primaryMappedHooks = mappingRows.filter((row) => row.mapping_tier === 'primary').map((row) => row.topic_hook);
    const secondaryMappedHooks = mappingRows.filter((row) => row.mapping_tier === 'secondary').map((row) => row.topic_hook);

    const primaryHook = hookById.get(primaryHookId);
    const primaryReasons = [];
    if (!primaryHook) primaryReasons.push('missing_hook');
    if (primaryHook && !list(primaryHook.emne_ids).includes(emne.emne_id)) primaryReasons.push('missing_primary_ownership');
    if (primaryHook && list(primaryHook.emne_ids).length !== 1) primaryReasons.push(`primary_owner_count_${list(primaryHook.emne_ids).length}`);
    if (!theoryByHookId.has(primaryHookId)) primaryReasons.push('missing_theory');
    if (!primaryMappedHooks.includes(primaryHookId)) primaryReasons.push('missing_primary_mapping');
    if (primaryReasons.length) canonicalMismatches.push({ emne_id: emne.emne_id, role: 'primary', hook_id: primaryHookId, reasons: primaryReasons });

    for (const secondaryHookId of secondaryHooks) {
      const secondaryReasons = [];
      if (!hookById.has(secondaryHookId)) secondaryReasons.push('missing_hook');
      if (!theoryByHookId.has(secondaryHookId)) secondaryReasons.push('missing_theory');
      if (!secondaryMappedHooks.includes(secondaryHookId)) secondaryReasons.push('missing_secondary_mapping');
      if (secondaryHookId === primaryHookId) secondaryReasons.push('same_as_primary');
      if (secondaryReasons.length) canonicalMismatches.push({ emne_id: emne.emne_id, role: 'secondary', hook_id: secondaryHookId, reasons: secondaryReasons });
    }
  }

  assert.equal(unique(primaryKeys).length, 230, 'Canonicale primærhooks må være unike for alle 230 emner');
  assert.deepEqual(
    canonicalMismatches,
    [],
    `Canonical History hook-kjeder er inkonsistente: ${canonicalMismatches.map((row) => `${row.emne_id}:${row.role}:${row.hook_id || 'none'}[${row.reasons.join('+')}]`).join(', ')}`
  );

  const blueprintFiles = list(editorial.source_blueprint_files);
  assert.equal(blueprintFiles.length, 3, 'Editorial-registryen skal peke på tre kuraterte blueprint-filer');
  const resolvedLegacyRows = list(editorial.resolved_legacy_question_surface_ids);
  const resolvedLegacyIds = new Set(resolvedLegacyRows.map((row) => row.legacy_emne_id));
  assert.equal(resolvedLegacyIds.size, resolvedLegacyRows.length, 'Resolved legacy question-surface IDs skal være unike');

  const activeBlueprintRows = [];
  const observedLegacyIds = new Set();
  const unresolvedLegacy = [];
  for (const file of blueprintFiles) {
    for (const row of list(readJson(file))) {
      assert.ok(row.emne_id, `${file}: blueprint mangler emne_id`);
      assert.ok(row.primary_hook_id, `${file}/${row.emne_id}: mangler primary_hook_id`);
      if (emneById.has(row.emne_id)) {
        activeBlueprintRows.push({ ...row, blueprint_file: file });
      } else if (resolvedLegacyIds.has(row.emne_id)) {
        observedLegacyIds.add(row.emne_id);
        for (const hookId of unique([row.primary_hook_id, row.secondary_hook_id])) {
          assert.ok(hookById.has(hookId), `${file}/${row.emne_id}: resolved legacy editorial hook ${hookId} finnes ikke`);
          assert.ok(theoryByHookId.has(hookId), `${file}/${row.emne_id}: resolved legacy editorial hook ${hookId} mangler teoriobjekt`);
        }
      } else {
        unresolvedLegacy.push(`${file}:${row.emne_id}`);
      }
    }
  }
  assert.deepEqual(unresolvedLegacy, [], `Uavklarte legacy blueprint-ID-er: ${unresolvedLegacy.join(', ')}`);
  assert.deepEqual(sorted(observedLegacyIds), sorted(resolvedLegacyIds), 'Alle og bare dokumenterte legacy blueprint-ID-er skal være observert');
  assert.equal(new Set(activeBlueprintRows.map((row) => row.emne_id)).size, activeBlueprintRows.length, 'Aktive blueprint-emner skal være unike på tvers av filer');

  const curatedMismatches = [];
  for (const blueprint of activeBlueprintRows) {
    for (const editorialHookId of unique([blueprint.primary_hook_id, blueprint.secondary_hook_id])) {
      const reasons = [];
      if (!hookById.has(editorialHookId)) reasons.push('missing_hook');
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

  const overrides = list(editorial.overrides);
  assert.equal(new Set(overrides.map((row) => row.emne_id)).size, overrides.length, 'Editorial override-emner skal være unike');
  const activeBlueprintIds = new Set(activeBlueprintRows.map((row) => row.emne_id));
  for (const row of overrides) {
    assert.ok(emneById.has(row.emne_id), `Editorial override peker på ukjent canonical emne ${row.emne_id}`);
    assert.ok(!activeBlueprintIds.has(row.emne_id), `${row.emne_id}: både aktiv blueprint og explicit override skaper uklar editorial precedence`);
    assert.ok(row.editorial_primary_hook_id, `${row.emne_id}: mangler editorial primary hook`);
    for (const editorialHookId of unique([row.editorial_primary_hook_id, row.editorial_secondary_hook_id])) {
      const reasons = [];
      if (!hookById.has(editorialHookId)) reasons.push('missing_hook');
      if (!theoryByHookId.has(editorialHookId)) reasons.push('missing_theory');
      if (reasons.length) curatedMismatches.push({ emne_id: row.emne_id, editorial_hook_id: editorialHookId, blueprint_file: 'explicit_override', reasons });
    }
  }

  assert.deepEqual(
    curatedMismatches,
    [],
    `Kuraterte redaksjonelle History-hooks mangler gyldig hook/teorikjede: ${curatedMismatches.map((row) => `${row.emne_id}:${row.editorial_hook_id}[${row.reasons.join('+')}]`).join(', ')}`
  );

  const curatedDomains = new Set([
    'his_byhistorie_stedsendring',
    'his_industri_arbeid_sosialhistorie',
    'his_velferd_rett_hverdagsliv'
  ]);
  const expectedEditorialEmneIds = new Set(list(pensum.domains)
    .filter((domain) => curatedDomains.has(domain.domain_id))
    .flatMap((domain) => list(domain.emne_ids)));
  assert.equal(expectedEditorialEmneIds.size, 30, 'Tre kuraterte Historie-domener skal dekke 30 aktive emner');
  const coveredEditorialEmneIds = new Set([
    ...activeBlueprintRows.map((row) => row.emne_id),
    ...overrides.map((row) => row.emne_id)
  ]);
  assert.deepEqual(sorted(coveredEditorialEmneIds), sorted(expectedEditorialEmneIds), 'Editorial blueprint + override skal dekke nøyaktig 30/30 aktive emner');

  return {
    status: 'PASS',
    canonical_emners: emners.length,
    unique_primary_semantic_keys: unique(primaryKeys).length,
    canonical_hook_mismatches: 0,
    active_curated_blueprint_rows: activeBlueprintRows.length,
    explicit_editorial_overrides: overrides.length,
    resolved_legacy_question_surface_ids: resolvedLegacyIds.size,
    curated_editorial_hook_mismatches: 0,
    curated_editorial_coverage: coveredEditorialEmneIds.size,
    canonical_identity_preserved: unique(primaryKeys).length === 230,
    editorial_layer_separate_from_ownership: true,
    blueprint_files: blueprintFiles
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(auditHistorySemanticHookAlignment(), null, 2));
}
