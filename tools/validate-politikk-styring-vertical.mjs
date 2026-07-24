import fs from 'node:fs';

const DOMAIN = 'styring_institusjoner_forvaltning';
const REVISION = 'politikk-styring-vertical-2026-07-24';
const paths = {
  fagkart: 'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
  emner: 'data/fag/politikk/emner_politikk_canonical_v4_5.json',
  methods: 'data/fag/politikk/methods_politikk_canonical_v4_5.json',
  mapping: 'data/fag/politikk/emnemapping_politikk_canonical_v4_5.json',
  pensum: 'data/fag/politikk/politikkpensum_canonical_v4_5.json',
  generator: 'data/fag/politikk/quiz_generator_rules_politikk_v5_1_source_priority_patch.json',
  blueprints: 'reports/politikk-canonical-migration/styring-forvaltning-question-blueprints.json'
};
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = [];
const pass = [];
const check = (condition, message) => (condition ? pass : fail).push(message);
const nonEmpty = (value) => Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value && typeof value === 'object';

const fagkart = read(paths.fagkart);
const emnerDoc = read(paths.emner);
const methodsDoc = read(paths.methods);
const mappings = read(paths.mapping);
const pensum = read(paths.pensum);
const generator = read(paths.generator);
const blueprints = read(paths.blueprints);

const category = fagkart.categories.find((item) => item.id === DOMAIN);
check(Boolean(category), 'Fagkartdomenet finnes');
check(category?.topic_hooks?.length === 10, 'Fagkartdomenet har 10 hooks');

const hookFields = ['definition', 'core_problem', 'mechanisms', 'critical_distinctions', 'theory_lenses', 'case_anchors', 'anti_reduction'];
for (const hook of category?.topic_hooks ?? []) {
  for (const field of hookFields) check(nonEmpty(hook[field]), `Hook ${hook.id} har ${field}`);
  check(hook.quality_revision === 'politikk-styring-2026-07-24', `Hook ${hook.id} beholder direkte fagkartrevisjon`);
}

const hookEmneIds = [...new Set((category?.topic_hooks ?? []).flatMap((hook) => hook.emne_ids ?? []))];
const emner = emnerDoc.emner ?? emnerDoc.topics ?? emnerDoc;
const emneById = new Map(emner.map((emne) => [emne.emne_id ?? emne.id, emne]));
check(hookEmneIds.length === 16, 'Hookene dekker 16 unike emner');
for (const id of hookEmneIds) {
  const emne = emneById.get(id);
  check(Boolean(emne), `Emne ${id} finnes`);
  check((emne?.key_questions ?? []).length === 3, `Emne ${id} har tre nøkkelspørsmål`);
  check((emne?.canonical_thinker_ids ?? []).length === 3, `Emne ${id} har tre målrettede teorispor`);
}

const revisedMethods = Object.values(methodsDoc.methods).filter((method) => method.quality_revision === REVISION);
check(revisedMethods.length === 12, '12 metoder er direkte revidert');
const methodFields = ['analytical_question', 'evidence_inputs', 'mechanism_focus', 'critical_distinctions', 'compatible_anchor_types', 'question_build_sequence', 'output_requirements', 'anti_patterns'];
for (const method of revisedMethods) {
  for (const field of methodFields) check(nonEmpty(method[field]), `Metode ${method.method_id} har ${field}`);
  check(method.external_claim_basis_required === true, `Metode ${method.method_id} krever ekstern claim_basis`);
  check(method.mechanism_explanation_required === true, `Metode ${method.method_id} krever mekanisme`);
  check(method.critical_distinction_required === true, `Metode ${method.method_id} krever distinksjon`);
}

const targetMappings = mappings.flatMap((entry) => (entry.mappings ?? []).filter((mapping) => mapping.fagkart_kategori === DOMAIN).map((mapping) => ({ entry, mapping })));
check(targetMappings.length >= 16, 'Minst 16 mappinger er koblet til domenet');
check(targetMappings.every(({ mapping }) => mapping.quality_revision === REVISION), 'Alle domenemappinger har ny revisjon');
check(targetMappings.every(({ mapping }) => (mapping.recommended_method_ids ?? []).length >= 2), 'Alle domenemappinger har målrettede metoder');
check(targetMappings.every(({ mapping }) => (mapping.mechanism_options ?? []).length > 0), 'Alle domenemappinger har mekanismer');
check(targetMappings.every(({ mapping }) => (mapping.critical_distinction_options ?? []).length > 0), 'Alle domenemappinger har distinksjoner');
check(targetMappings.every(({ mapping }) => (mapping.theory_lenses ?? []).length > 0), 'Alle domenemappinger har målrettede teorispor');
check(targetMappings.every(({ mapping }) => mapping.theory_depth === 'targeted'), 'Alle domenemappinger bruker målrettet teoridybde');
check(targetMappings.every(({ mapping }) => (mapping.norwegian_thinker_ids ?? []).every((id) => (mapping.thinker_ids ?? []).includes(id))), 'Norske teorireferanser er del av hookets målrettede teorispor');
check(targetMappings.every(({ mapping }) => mapping.generator_constraints?.ban_theorist_name_as_answer_without_concept === true), 'Alle domenemappinger forbyr løsrevet teoretikernavn');

const profile = generator.domain_quality_profiles?.[DOMAIN];
check(profile?.status === 'complete_revised', 'Generatorprofilen er aktiv og komplett revidert');
check(profile?.revised_method_ids?.length === 12, 'Generatorprofilen peker til 12 reviderte metoder');
check(generator.hard_rules?.require_case_mechanism_distinction_chain === true, 'Generatoren krever case–mekanisme–distinksjon');
check(generator.hard_rules?.ban_theorist_name_as_answer_without_concept === true, 'Generatoren forbyr løsrevet teoretikernavn');

const pensumDomain = pensum.domains.find((item) => item.domain_id === DOMAIN);
check(pensumDomain?.status === 'complete_revised', 'Pensum markerer domenet complete_revised');
check(pensumDomain?.vertical_chain_status?.generator_profile_active === true, 'Pensum dokumenterer aktiv generatorprofil');

check(blueprints.length === 10, 'Det finnes 10 representative spørsmålsplaner');
check(blueprints.every((item) => item.claim_basis === 'REQUIRED_EXTERNAL_SOURCE'), 'Alle spørsmålsplaner krever ekstern kilde');
check(blueprints.every((item) => item.mechanism && item.critical_distinction && item.method_id && item.emne_id), 'Alle spørsmålsplaner har emne, metode, mekanisme og distinksjon');

check(!fs.existsSync('data/fag/politikk/kvalitetslag_v1'), 'Ingen kvalitetslag-overlay finnes');

console.log(`# Politikk vertikal validering – ${REVISION}`);
console.log(`PASS: ${pass.length}`);
for (const item of pass) console.log(`PASS | ${item}`);
if (fail.length) {
  console.log(`FAIL: ${fail.length}`);
  for (const item of fail) console.log(`FAIL | ${item}`);
  process.exitCode = 1;
} else {
  console.log('RESULTAT: PASS');
}
