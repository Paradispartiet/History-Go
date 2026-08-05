#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const readJson = async (relative) => JSON.parse(await readFile(path.resolve(ROOT, relative), 'utf8'));
const arr = (v) => Array.isArray(v) ? v : [];
const clean = (v) => String(v ?? '').trim();
const failures = [];
let passes = 0;
function check(condition, reason, details = {}) {
  if (condition) passes += 1;
  else failures.push({ reason, ...details });
}
function uniqueIds(items, key) {
  const ids = items.map((item) => clean(item?.[key])).filter(Boolean);
  return ids.length === new Set(ids).size;
}

const P = {
  manifest: 'data/fag/fag_manifest.json',
  pensum: 'data/fag/teknologi/teknologipensum_canonical_v3.json',
  emner: 'data/fag/teknologi/emner_teknologi_canonical_v3.json',
  fagkart: 'data/fag/teknologi/fagkart_teknologi_canonical_v3.json',
  methods: 'data/fag/teknologi/methods_teknologi_canonical_v3.json',
  contract: 'data/fag/teknologi/editorial_contract_teknologi_v3.json',
  legacy: 'data/fag/teknologi/canonical_legacy_status_v3.json',
  overrides: 'data/fag/teknologi/teknologi_scientific_v2/topic_alignment_overrides_v2_1.json',
  subjectPackage: 'data/quiz/teknologi/teknologi_subject_pathways_v1.json',
  report: 'reports/teknologi-editorial-v3-validation.json'
};

const [manifest, pensum, emner, fagkart, methodsDoc, contract, legacy, overridesDoc, subjectPackage] = await Promise.all([
  readJson(P.manifest), readJson(P.pensum), readJson(P.emner), readJson(P.fagkart), readJson(P.methods), readJson(P.contract), readJson(P.legacy), readJson(P.overrides), readJson(P.subjectPackage)
]);

const specialization = manifest.vitenskap?.specializations?.teknologi || {};
check(specialization.canonicalModelVersion === '3.0', 'manifestet peker ikke til Teknologi 3.0');
check(specialization.pensum === 'teknologi/teknologipensum_canonical_v3.json', 'manifestet har feil v3-pensum');
check(specialization.emner === 'teknologi/emner_teknologi_canonical_v3.json', 'manifestet har feil v3-emnefil');
check(specialization.fagkart === 'teknologi/fagkart_teknologi_canonical_v3.json', 'manifestet har feil v3-fagkart');
check(specialization.methods === 'teknologi/methods_teknologi_canonical_v3.json', 'manifestet har feil v3-metodefil');
check(specialization.editorialContract === 'teknologi/editorial_contract_teknologi_v3.json', 'manifestet mangler v3-redaksjonskontrakt');
check(specialization.editorialStatus === 'reviewed_and_operationalized', 'manifestet mangler redaksjonell status');

const modules = arr(pensum.modules);
const topics = arr(emner);
const categories = arr(fagkart.categories);
const methods = arr(methodsDoc.methods);
const hooks = categories.flatMap((category) => arr(category.topic_hooks));
check(pensum.version === '3.0', 'pensum har feil versjon');
check(fagkart.version === '3.0-canonical', 'fagkart har feil versjon');
check(methodsDoc.version === '3.0', 'metodefil har feil versjon');
check(modules.length === 12, 'pensum skal ha 12 moduler', { actual: modules.length });
check(topics.length === 48, 'emnefil skal ha 48 emner', { actual: topics.length });
check(categories.length === 12, 'fagkart skal ha 12 områder', { actual: categories.length });
check(methods.length === 35, 'metodefil skal ha 35 metoder', { actual: methods.length });
check(hooks.length === 36, 'fagkart skal ha 36 hooks', { actual: hooks.length });
check(uniqueIds(modules, 'module_id'), 'dupliserte modul-ID-er');
check(uniqueIds(topics, 'emne_id'), 'dupliserte emne-ID-er');
check(uniqueIds(categories, 'id'), 'dupliserte område-ID-er');
check(uniqueIds(methods, 'method_id'), 'dupliserte metode-ID-er');
check(uniqueIds(hooks, 'id'), 'dupliserte hook-ID-er');

const topicIds = new Set(topics.map((t) => t.emne_id));
const methodIds = new Set(methods.map((m) => m.method_id));
const categoryIds = new Set(categories.map((c) => c.id));
const theoryIds = new Set(categories.flatMap((c) => arr(c.theory_objects).map((t) => t.id)));
const genericWhy = 'Emnet gjør det mulig å analysere';
const whyValues = topics.map((t) => clean(t.why_it_matters));
check(whyValues.every((value) => value && !value.startsWith(genericWhy)), 'generisk why_it_matters-mal finnes fortsatt');
check(new Set(whyValues).size === topics.length, 'why_it_matters er ikke unikt per emne');
check(new Set(topics.map((t) => t.level)).size === 3, 'emnefilen har ikke tre nivåer');

for (const topic of topics) {
  check(topicIds.has(topic.emne_id) && topic.emne_id.startsWith('em_tek_'), 'ugyldig emne-ID', { emne_id: topic.emne_id });
  check(categoryIds.has(topic.area_id), 'emne peker til ukjent område', { emne_id: topic.emne_id, area_id: topic.area_id });
  check(['grunnnivå', 'mellomnivå', 'avansert'].includes(topic.progression_stage), 'emne mangler korrekt progresjonsstadium', { emne_id: topic.emne_id });
  check(clean(topic.definition).length >= 40, 'emne har for kort definisjon', { emne_id: topic.emne_id });
  check(clean(topic.why_it_matters).length >= 120, 'emne har for svak særskilt relevans', { emne_id: topic.emne_id });
  check(arr(topic.learning_outcomes).length >= 3, 'emne mangler læringsutbytte', { emne_id: topic.emne_id });
  check(arr(topic.concept_ids).length >= 3, 'emne mangler begreper', { emne_id: topic.emne_id });
  check(arr(topic.method_ids).length >= 1 && arr(topic.method_ids).every((id) => methodIds.has(id)), 'emne har ugyldige metoder', { emne_id: topic.emne_id });
  check(arr(topic.theory_ids).length >= 1 && arr(topic.theory_ids).every((id) => theoryIds.has(id)), 'emne har ugyldige teorier', { emne_id: topic.emne_id });
  check(arr(topic.claim_classes).length >= 2, 'emne mangler påstandsklasser', { emne_id: topic.emne_id });
  check(arr(topic.evidence_requirements).length >= 4, 'emne mangler evidenskrav', { emne_id: topic.emne_id });
  check(arr(topic.mandatory_failure_modes).length >= 3, 'emne mangler feilmodi', { emne_id: topic.emne_id });
  check(arr(topic.comparison_basis).length >= 3, 'emne mangler sammenligningsgrunnlag', { emne_id: topic.emne_id });
  check(clean(topic.boundary_note).length >= 50, 'emne mangler faggrense', { emne_id: topic.emne_id });
  check(clean(topic.assessment_prompt).length >= 80, 'emne mangler vurderingsoppgave', { emne_id: topic.emne_id });
  check(topic.source_gate === 'blocked_without_external_source_anchor_and_locator', 'emne mangler blokkerende kildeport', { emne_id: topic.emne_id });
  check(topic.requires_uncertainty_statement === true, 'emne mangler usikkerhetskrav', { emne_id: topic.emne_id });
  check(arr(topic.prerequisite_emne_ids).every((id) => topicIds.has(id)), 'emne har ugyldig forkunnskap', { emne_id: topic.emne_id });
  check(arr(topic.advances_to_emne_ids).every((id) => topicIds.has(id)), 'emne har ugyldig videreføring', { emne_id: topic.emne_id });
}

for (const override of arr(overridesDoc.overrides)) {
  const topic = topics.find((item) => item.emne_id === override.topic_id);
  check(Boolean(topic), 'alignment override mangler emne', { topic_id: override.topic_id });
  if (!topic) continue;
  check(topic.alignment_override_applied === true, 'alignment override er ikke markert anvendt', { topic_id: override.topic_id });
  check(arr(override.preferred_method_ids).every((id) => arr(topic.method_ids).includes(id)), 'foretrukket metode mangler etter override', { topic_id: override.topic_id });
  check(arr(override.preferred_theory_ids).every((id) => arr(topic.theory_ids).includes(id)), 'foretrukket teori mangler etter override', { topic_id: override.topic_id });
  check(arr(override.claim_classes).every((id) => arr(topic.claim_classes).includes(id)), 'påstandsklasse mangler etter override', { topic_id: override.topic_id });
  check(clean(topic.alignment_reason) === clean(override.reason), 'override-begrunnelse mangler', { topic_id: override.topic_id });
}

for (const method of methods) {
  check(method.method_id.startsWith('met_tek_'), 'ugyldig metode-ID', { method_id: method.method_id });
  check(categoryIds.has(method.area_id), 'metode peker til ukjent område', { method_id: method.method_id, area_id: method.area_id });
  check(method.editorial_status === 'operationalized_v3', 'metode er ikke operasjonalisert', { method_id: method.method_id });
  check(clean(method.purpose).length >= 50, 'metode mangler formål', { method_id: method.method_id });
  check(arr(method.procedure).length >= 6, 'metode mangler full prosedyre', { method_id: method.method_id });
  check(arr(method.required_inputs).length >= 4, 'metode mangler datakrav', { method_id: method.method_id });
  check(arr(method.required_observations).length >= 3, 'metode mangler observabler', { method_id: method.method_id });
  check(arr(method.limitations).length >= 3, 'metode mangler begrensninger', { method_id: method.method_id });
  check(arr(method.ethics).length >= 2, 'metode mangler etikk', { method_id: method.method_id });
  check(arr(method.deliverables).length >= 2, 'metode mangler leveranser', { method_id: method.method_id });
  check(arr(method.quality_gates).length >= 6, 'metode mangler kvalitetsporter', { method_id: method.method_id });
  check(arr(method.blocked_when).length >= 4, 'metode mangler blokkering', { method_id: method.method_id });
  check(arr(method.applicable_emne_ids).length >= 1 && arr(method.applicable_emne_ids).every((id) => topicIds.has(id)), 'metode mangler gyldige emnekoblinger', { method_id: method.method_id });
}

for (const category of categories) {
  check(['strong', 'developing', 'blocked'].includes(category.coverage_status), 'område mangler evidensbasert dekningsstatus', { area_id: category.id });
  check(category.editorial_status === 'reviewed_v3', 'område er ikke redaksjonelt gjennomgått', { area_id: category.id });
  check(arr(category.canonical_mechanisms).length >= 5, 'område mangler mekanismer', { area_id: category.id });
  check(arr(category.preferred_evidence).length >= 3, 'område mangler evidensprofil', { area_id: category.id });
  check(arr(category.mandatory_failure_modes).length >= 3, 'område mangler feilprofil', { area_id: category.id });
  check(arr(category.comparison_basis).length >= 4, 'område mangler sammenligningsgrunnlag', { area_id: category.id });
  check(clean(category.boundary_note).length >= 60, 'område mangler faggrense', { area_id: category.id });
  check(arr(category.focus).length === 4 && arr(category.focus).every((id) => topicIds.has(id)), 'område har feil emnedekning', { area_id: category.id });
}

for (const module of modules) {
  check(module.editorial_status === 'reviewed_v3', 'modul er ikke redaksjonelt gjennomgått', { module_id: module.module_id });
  check(arr(module.emner).length === 4 && arr(module.emner).every((id) => topicIds.has(id)), 'modul har feil emner', { module_id: module.module_id });
  check(arr(module.learning_outcomes).length >= 3, 'modul mangler læringsutbytte', { module_id: module.module_id });
  check(arr(module.required_evidence).length >= 3, 'modul mangler evidenskrav', { module_id: module.module_id });
  check(arr(module.mastery_criteria).length >= 3, 'modul mangler mestringskriterier', { module_id: module.module_id });
  check(arr(module.emne_progression).length === 4, 'modul mangler emneprogresjon', { module_id: module.module_id });
}

check(contract.version === '3.0' && contract.status === 'canonical', 'redaksjonskontrakten er ikke canonical v3');
check(contract.required_counts?.emner === 48 && contract.required_counts?.methods === 35, 'redaksjonskontrakten har feil tellinger');
check(contract.editorial_gates?.all_alignment_overrides_applied === true, 'kontrakten håndhever ikke alignment overrides');
check(contract.editorial_gates?.methods_operationalized === true, 'kontrakten håndhever ikke operasjonaliserte metoder');
check(clean(contract.production_blocking_rule).length >= 100, 'kontrakten mangler produksjonsblokkering');

const superseded = new Set(arr(legacy.superseded_read_only));
for (const expected of [
  'data/fag/teknologi/teknologipensum_canonical_v1.json',
  'data/fag/teknologi/emner_teknologi_canonical_v1.json',
  'data/fag/teknologi/fagkart_teknologi_canonical_v1.json',
  'data/fag/teknologi/methods_teknologi_canonical_v1.json',
  'data/fag/teknologi/teknologipensum_canonical_v2_4.json',
  'data/fag/teknologi/emner_teknologi_canonical_v2_4.json',
  'data/fag/teknologi/fagkart_teknologi_canonical_v2_4.json',
  'data/fag/teknologi/methods_teknologi_canonical_v2_4.json'
]) check(superseded.has(expected), 'legacy-registeret mangler fil', { expected });
check(!Object.values(specialization).some((value) => typeof value === 'string' && (value.includes('canonical_v1.json') || value.includes('canonical_v2_4.json'))), 'manifestet peker fortsatt til legacy canonical-fil');

const resolved = subjectPackage.production_context?.resolved_files || {};
check(subjectPackage.editorial_version === '3.0', 'subject pathway mangler v3-redaksjonsversjon');
check(resolved.pensum === P.pensum && resolved.emner === P.emner && resolved.fagkart === P.fagkart && resolved.methods === P.methods, 'subject pathway peker ikke til v3 canonical-filer');
check(resolved.editorial_contract === P.contract, 'subject pathway mangler redaksjonskontrakt');
check(arr(subjectPackage.production_context?.required_inputs_loaded).includes('editorialContract'), 'subject pathway laster ikke redaksjonskontrakten');

const report = {
  status: failures.length ? 'failed' : 'passed',
  version: '3.0',
  subject_id: 'teknologi',
  passes,
  failures_count: failures.length,
  counts: { modules: modules.length, areas: categories.length, emner: topics.length, methods: methods.length, hooks: hooks.length, alignment_overrides: arr(overridesDoc.overrides).length },
  failures
};
await mkdir(path.dirname(path.resolve(ROOT, P.report)), { recursive: true });
await writeFile(path.resolve(ROOT, P.report), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (failures.length) {
  console.error(`Technology editorial V3: ${passes} PASS / ${failures.length} FAIL`);
  for (const failure of failures.slice(0, 50)) console.error(`- ${failure.reason}: ${JSON.stringify(failure)}`);
  process.exit(1);
}
console.log(`Technology editorial V3: ${passes} PASS / 0 FAIL`);
