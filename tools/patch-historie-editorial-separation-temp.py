#!/usr/bin/env python3
from pathlib import Path

file = Path('tools/materialize-historie-editorial-chapters.mjs')
source = file.read_text()

read_anchor = "const status = readJson('data/fagverk/subject_status.json');\n"
read_insert = read_anchor + "const editorialTheoryDocument = readJson('data/fag/historie/editorial_theory_overrides_historie_v1.json');\n"
if "const editorialTheoryDocument =" not in source:
    if read_anchor not in source:
        raise SystemExit('materializer status read anchor missing')
    source = source.replace(read_anchor, read_insert, 1)

map_anchor = "const historiographySourceById = new Map(historiographyDocument.sources.map((item) => [item.source_id, item]));\n"
map_insert = map_anchor + """const hookById = new Map();
for (const category of list(fagkart.categories)) {
  for (const hook of list(category.topic_hooks)) {
    if (hookById.has(hook.id)) throw new Error(`Duplisert History hook-id ${hook.id}`);
    hookById.set(hook.id, hook);
  }
}
const editorialOverrideByEmneId = new Map(list(editorialTheoryDocument.overrides).map((row) => [row.emne_id, row]));
const resolvedLegacyEditorialIds = new Set(list(editorialTheoryDocument.resolved_legacy_question_surface_ids).map((row) => row.legacy_emne_id));
const editorialBlueprintByEmneId = new Map();
for (const blueprintFile of list(editorialTheoryDocument.source_blueprint_files)) {
  for (const row of list(readJson(blueprintFile))) {
    if (!emneById.has(row.emne_id)) {
      if (!resolvedLegacyEditorialIds.has(row.emne_id)) throw new Error(`${blueprintFile}: uavklart legacy editorial emne ${row.emne_id}`);
      continue;
    }
    if (editorialBlueprintByEmneId.has(row.emne_id)) throw new Error(`${row.emne_id}: duplisert aktiv editorial blueprint`);
    editorialBlueprintByEmneId.set(row.emne_id, row);
  }
}
for (const emneId of editorialOverrideByEmneId.keys()) {
  if (!emneById.has(emneId)) throw new Error(`Editorial override peker på ukjent emne ${emneId}`);
  if (editorialBlueprintByEmneId.has(emneId)) throw new Error(`${emneId}: både blueprint og override skaper uklar editorial precedence`);
}
"""
if "const editorialOverrideByEmneId =" not in source:
    if map_anchor not in source:
        raise SystemExit('materializer map anchor missing')
    source = source.replace(map_anchor, map_insert, 1)

start = source.find('function theoryPackage(category, emne) {')
end = source.find('\nfunction claimParagraph', start)
if start < 0 or end < 0:
    raise SystemExit('materializer theoryPackage boundaries missing')
replacement = r'''function theoryPackage(category, emne) {
  const semanticHookId = list(emne.primary_theory_hooks)[0];
  if (!semanticHookId) throw new Error(`${category.id}/${emne.emne_id}: mangler primary_theory_hooks`);
  if (!list(category.topic_hooks).some((item) => item.id === semanticHookId)) throw new Error(`${category.id}/${emne.emne_id}: semantisk hook ${semanticHookId} finnes ikke i fagkartkategorien`);
  const semanticHook = hookById.get(semanticHookId);
  if (!semanticHook) throw new Error(`${semanticHookId}: mangler canonical hook`);
  if (!list(semanticHook.emne_ids).includes(emne.emne_id)) throw new Error(`${semanticHookId}: mangler canonical primary association for ${emne.emne_id}`);

  const override = editorialOverrideByEmneId.get(emne.emne_id);
  const blueprint = editorialBlueprintByEmneId.get(emne.emne_id);
  if (override && blueprint) throw new Error(`${emne.emne_id}: både override og blueprint er aktive`);
  const editorialHookId = override?.editorial_primary_hook_id || blueprint?.primary_hook_id || semanticHookId;
  const editorialSecondaryHookId = override?.editorial_secondary_hook_id || blueprint?.secondary_hook_id || null;
  const hook = hookById.get(editorialHookId);
  if (!hook) throw new Error(`${category.id}/${emne.emne_id}: editorial hook ${editorialHookId} finnes ikke`);
  const theory = theoryByHookId.get(editorialHookId);
  if (!theory) throw new Error(`${editorialHookId}: mangler teoriobjekt`);
  if (editorialSecondaryHookId) {
    if (!hookById.has(editorialSecondaryHookId)) throw new Error(`${editorialSecondaryHookId}: editorial secondary hook finnes ikke`);
    if (!theoryByHookId.has(editorialSecondaryHookId)) throw new Error(`${editorialSecondaryHookId}: editorial secondary hook mangler teoriobjekt`);
  }
  const theoryEvidence = evidenceByTheoryId.get(theory.theory_id);
  if (!theoryEvidence || theoryEvidence.status !== 'evidence_ready') throw new Error(`${theory.theory_id}: mangler ferdig evidens`);
  const claims = list(theoryEvidence.claim_ids).map((id) => claimById.get(id)).filter(Boolean);
  if (!claims.length) throw new Error(`${theory.theory_id}: mangler claims`);
  return { emneId: emne.emne_id, semanticHookId, editorialHookId, editorialSecondaryHookId, semanticHook, hook, theory, theoryEvidence, claims };
}
'''
source = source[:start] + replacement + source[end:]

field_anchor = "    semanticHookId: pack.semanticHookId,\n    theoryId: pack.theory.theory_id,"
field_replacement = "    semanticHookId: pack.semanticHookId,\n    editorialHookId: pack.editorialHookId,\n    editorialSecondaryHookId: pack.editorialSecondaryHookId,\n    theoryId: pack.theory.theory_id,"
if '    editorialHookId: pack.editorialHookId,' not in source:
    if field_anchor not in source:
        raise SystemExit('materialized section semantic hook anchor missing')
    source = source.replace(field_anchor, field_replacement, 1)

source = source.replace(
    '  const theoryIds = packages.map((pack) => pack.theory.theory_id);',
    '  const theoryIds = unique(packages.map((pack) => pack.theory.theory_id));',
    1
)
source = source.replace(
    "      semanticPrimaryHookRequired: true,\n      causalFrameworkRequired: true,",
    "      semanticPrimaryHookRequired: true,\n      separateEditorialTheoryHookRequired: true,\n      causalFrameworkRequired: true,",
    1
)
source = source.replace(
    "      editorialProfiles: 'data/fag/historie/editorial_profiles_historie_v1.json',\n      historiographyEvidence:",
    "      editorialProfiles: 'data/fag/historie/editorial_profiles_historie_v1.json',\n      editorialTheoryOverrides: 'data/fag/historie/editorial_theory_overrides_historie_v1.json',\n      historiographyEvidence:",
    1
)
source = source.replace(
    'atten generator-eide kapitler med semantisk låste primærhooks, håndredigerte fagprofiler',
    'atten generator-eide kapitler med semantisk låste primærhooks, separat kuraterte editorial theory hooks, håndredigerte fagprofiler',
    1
)

file.write_text(source)
print('History editorial separation patch installed')
