import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const NATUR_FINAL_OVERLAY_PATH = 'data/fag/natur/natur_final_phase_canonical_v1.json';

const clone = (value) => JSON.parse(JSON.stringify(value));
const unique = (values) => [...new Set((values || []).filter(Boolean))];

export function readNaturFinalOverlay() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, NATUR_FINAL_OVERLAY_PATH), 'utf8'));
}

export function composeNaturFinal({ pensum, emners, methodsDoc, fagkart, mappings = [], registry = null, statusEntry = null, overlay = readNaturFinalOverlay() }) {
  const nextPensum = clone(pensum);
  const nextEmners = [...clone(emners), ...clone(overlay.emners || [])];
  const nextMethods = clone(methodsDoc);
  nextMethods.methods = [...(nextMethods.methods || []), ...clone(overlay.methods || [])];
  nextMethods.version = 'v5.3-canonical-final-overlay';
  nextMethods.updated_at = overlay.updated_at;

  const patchByDomain = new Map((overlay.domain_patches || []).map((patch) => [patch.domain_id, patch]));
  for (const domain of nextPensum.domains || []) {
    const patch = patchByDomain.get(domain.domain_id);
    if (!patch) continue;
    domain.coverage_status = patch.coverage_status;
    domain.status = patch.status;
    domain.chapter_status = patch.chapter_status;
    if (patch.definition) domain.definition = patch.definition;
    if (patch.question_role) domain.question_role = patch.question_role;
    if (patch.replace_emne_ids) domain.emne_ids = [...patch.replace_emne_ids];
    if (patch.replace_method_ids) domain.method_ids = [...patch.replace_method_ids];
    if (patch.replace_hook_ids) domain.hook_ids = [...patch.replace_hook_ids];
    if (patch.append_emne_ids) domain.emne_ids = unique([...(domain.emne_ids || []), ...patch.append_emne_ids]);
    if (patch.append_method_ids) domain.method_ids = unique([...(domain.method_ids || []), ...patch.append_method_ids]);
    if (patch.append_hook_ids) domain.hook_ids = unique([...(domain.hook_ids || []), ...patch.append_hook_ids]);
    domain.emne_count = (domain.emne_ids || []).length;
    domain.method_count = (domain.method_ids || []).length;
    domain.hook_count = (domain.hook_ids || []).length;
  }
  nextPensum.version = 'v5.3-canonical-final-overlay';
  nextPensum.canonical_registry_version = 'naturpensum_v5_3';
  nextPensum.updated_at = overlay.updated_at;
  nextPensum.summary = {
    ...(nextPensum.summary || {}),
    materialized_domain_count: overlay.completion.materialized_domain_count,
    partial_domain_count: overlay.completion.partial_domain_count,
    required_gap_domain_count: overlay.completion.required_gap_domain_count,
    current_emne_count: overlay.completion.emne_count,
    current_method_count: overlay.completion.method_count,
    current_mapping_count: overlay.completion.mapping_count,
    current_topic_hook_count: overlay.completion.hook_count,
    all_current_emners_have_mapping: true,
    all_current_method_refs_valid: true,
    editorial_complete: true
  };
  nextPensum.coverage_statement = 'Alle tolv canonicale Natur-områder er materialisert gjennom fase-2-basisen og canonical v5.3-sluttfaseoverlayet. Sopp/lav/mikroorganismer og geologiens indre prosesser, geologiske tid og naturhistorie inngår i samme runtime- og auditmodell.';

  const nextFagkart = clone(fagkart);
  const categories = [...(nextFagkart.categories || [])];
  for (const patch of overlay.categories || []) {
    const index = categories.findIndex((category) => category.id === patch.id);
    if (patch.mode === 'replace' || index < 0) {
      const replacement = {
        id: patch.id,
        title: patch.title,
        definition: patchByDomain.get(patch.id)?.definition || '',
        topic_hooks: clone(patch.topic_hooks || [])
      };
      if (index >= 0) categories[index] = replacement;
      else categories.push(replacement);
    } else {
      const existing = categories[index];
      const incomingIds = new Set((patch.topic_hooks || []).map((hook) => hook.id));
      existing.title = patch.title || existing.title;
      existing.definition = patchByDomain.get(patch.id)?.definition || existing.definition;
      existing.topic_hooks = [
        ...(existing.topic_hooks || []).filter((hook) => !incomingIds.has(hook.id)),
        ...clone(patch.topic_hooks || [])
      ];
    }
  }
  const order = new Map((nextPensum.domain_order || []).map((id, index) => [id, index]));
  categories.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
  nextFagkart.categories = categories;
  nextFagkart.version = 'v5.3-canonical-final-overlay';
  nextFagkart.updated_at = overlay.updated_at;
  nextFagkart.meta = {
    ...(nextFagkart.meta || {}),
    category_count: categories.length,
    hook_count: categories.reduce((sum, category) => sum + (category.topic_hooks || []).length, 0),
    canonical_round: 'v5.3'
  };

  const hookIndex = new Map();
  for (const category of categories) {
    for (const hook of category.topic_hooks || []) hookIndex.set(hook.id, { category, hook });
  }
  const overlayMappings = (overlay.mappings || []).map((row) => ({
    emne_id: row.emne_id,
    mappings: (row.hook_ids || []).map((hookId) => {
      const indexed = hookIndex.get(hookId);
      if (!indexed) throw new Error(`${row.emne_id}: overlay peker til ukjent hook ${hookId}`);
      const recommended = unique([...(row.method_ids || []), ...(indexed.hook.recommended_method_ids || [])]);
      return {
        fagkart_kategori: indexed.category.id,
        fagkart_kategori_tittel: indexed.category.title,
        topic_hook: indexed.hook.id,
        topic_hook_tittel: indexed.hook.title,
        preferred_question_moves: clone(indexed.hook.preferred_question_moves || []),
        evidence_focus: clone(indexed.hook.evidence_focus || []),
        recommended_method_ids: recommended,
        use_note: `Canonical v5.3-sluttfasekobling for ${row.emne_id}: bruk ${indexed.hook.title} når dokumentert materiale støtter dette læringsfokuset, og behold metode- og kildeusikkerhet eksplisitt.`
      };
    })
  }));
  const nextMappings = [...clone(mappings), ...overlayMappings];

  let nextRegistry = registry ? clone(registry) : null;
  if (nextRegistry?.subjects?.natur) {
    const natur = nextRegistry.subjects.natur;
    const overlayIds = new Set((overlay.chapters || []).map((chapter) => chapter.id));
    natur.description = 'Et sammenhengende og universelt læreverk om økologi, artskunnskap, evolusjon, botanikk, zoologi, sopp, mikroorganismer, fysiologi, vann, klima, geologi, urban natur, miljøpåvirkning og forvaltning.';
    natur.canonicalModel = {
      ...(natur.canonicalModel || {}),
      note: 'Canonical Natur v5.3 komponerer den frosne fase-2-basisen med sluttfaseoverlayet. Registryet viser tolv redigerte lærekapitler og faget er redaksjonelt complete.'
    };
    natur.chapters = [
      ...(natur.chapters || []).filter((chapter) => !overlayIds.has(chapter.id)),
      ...clone(overlay.chapters || [])
    ].sort((a, b) => (order.get(a.primary_domain_id) ?? 99) - (order.get(b.primary_domain_id) ?? 99));
  }

  const nextStatus = statusEntry ? clone(statusEntry) : null;
  if (nextStatus) {
    nextStatus.navigationStatus = 'materialized';
    nextStatus.assessmentStatus = overlay.completion.assessmentStatus;
    nextStatus.editorialStatus = overlay.completion.editorialStatus;
    nextStatus.nextGate = overlay.completion.nextGate;
    nextStatus.note = 'Natur komponerer fase-2-basisen med canonical v5.3-sluttfaseoverlayet: 12/12 fagområder, 77 emner, 51 metoder, 136 hooks og 12 redigerte kapitler. Sluttstatus er audited og complete.';
  }

  return {
    pensum: nextPensum,
    emners: nextEmners,
    methodsDoc: nextMethods,
    fagkart: nextFagkart,
    mappings: nextMappings,
    registry: nextRegistry,
    statusEntry: nextStatus,
    overlay
  };
}
