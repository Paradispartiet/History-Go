import fs from 'node:fs';
import path from 'node:path';

const R = 'politikk-normer-vertical-2026-07-24';
const DOMAIN = 'normer_identitet_hverdagsliv';
const BASE = process.env.POLITIKK_BASE || 'data/fag/politikk';
const REPORT_BASE = process.env.POLITIKK_REPORT_BASE || 'reports/politikk-canonical-migration';
const read = (name) => JSON.parse(fs.readFileSync(path.join(BASE, name), 'utf8'));
const fagkart = read('fagkart_politikk_canonical_v4_5.json');
const emner = read('emner_politikk_canonical_v4_5.json');
const methods = read('methods_politikk_canonical_v4_5.json');
const mapping = read('emnemapping_politikk_canonical_v4_5.json');
const pensum = read('politikkpensum_canonical_v4_5.json');
const generator = read('quiz_generator_rules_politikk_v5_1_source_priority_patch.json');
const blueprints = JSON.parse(fs.readFileSync(path.join(REPORT_BASE, 'normer-identitet-question-blueprints.json'), 'utf8'));

let pass = 0;
const ok = (value, message) => {
  if (!value) throw new Error(`FAIL | ${message}`);
  console.log(`PASS | ${message}`);
  pass += 1;
};

const domain = fagkart.categories.find((item) => item.id === DOMAIN);
ok(domain?.quality_revision === R, 'Fagkartdomenet har ny revisjon');
ok(domain?.topic_hooks?.length === 10, 'Domenet har 10 hooks');
ok(domain?.generator_profile_id === DOMAIN, 'Domenet peker til aktiv generatorprofil');
for (const hook of domain.topic_hooks) {
  ok(hook.quality_revision === R, `Hook ${hook.id} har ny revisjon`);
  ok(typeof hook.definition === 'string' && hook.definition.length > 80, `Hook ${hook.id} har presis definisjon`);
  ok(typeof hook.core_problem === 'string' && hook.core_problem.length > 60, `Hook ${hook.id} har kjerneproblem`);
  ok(hook.mechanisms?.length >= 6, `Hook ${hook.id} har praksis- og håndhevingsmekanismer`);
  ok(hook.critical_distinctions?.length >= 4, `Hook ${hook.id} har fire kritiske distinksjoner`);
  ok(hook.theory_lenses?.length === 3, `Hook ${hook.id} har tre målrettede teorispor`);
  ok(hook.case_anchors?.length >= 3, `Hook ${hook.id} har caseankre`);
  ok(hook.required_anchor_types?.length >= 4, `Hook ${hook.id} har kildeankertyper`);
  ok(hook.recommended_method_ids?.length >= 3, `Hook ${hook.id} har målrettede metoder`);
  ok(hook.generator_constraints?.require_norm_rule_or_category_identification === true, `Hook ${hook.id} krever regel eller kategori`);
  ok(hook.generator_constraints?.require_actor_or_institution_identification === true, `Hook ${hook.id} krever aktør eller institusjon`);
  ok(hook.generator_constraints?.require_practice_or_enforcement_mechanism === true, `Hook ${hook.id} krever praksis eller håndheving`);
  ok(hook.generator_constraints?.require_observable_consequence === true, `Hook ${hook.id} krever observerbar konsekvens`);
  ok(hook.generator_constraints?.require_critical_distinction === true, `Hook ${hook.id} krever distinksjon`);
  ok(hook.generator_constraints?.require_population_and_denominator_for_group_claims === true, `Hook ${hook.id} krever populasjon og nevner for gruppepåstand`);
  ok(hook.generator_constraints?.ban_identity_essence_questions === true, `Hook ${hook.id} forbyr identitetsessens som forklaring`);
  ok(hook.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, `Hook ${hook.id} forbyr løsrevet teoretikernavn`);
}

const pensumDomain = pensum.domains.find((item) => item.domain_id === DOMAIN);
const expectedEmneIds = new Set(pensumDomain.emne_ids);
const profiledEmnes = emner.filter((item) => item.domain_profiles?.[DOMAIN]?.quality_revision === R);
ok(profiledEmnes.length === 9, 'Ni emner har domenespesifikk normprofil');
ok(profiledEmnes.every((item) => expectedEmneIds.has(item.emne_id)), 'Alle normprofiler tilhører pensumets emneliste');
for (const emne of profiledEmnes) {
  const profile = emne.domain_profiles[DOMAIN];
  ok(profile.definition?.length > 70, `Emne ${emne.emne_id} har domenedefinisjon`);
  ok(profile.core_concepts?.length >= 6, `Emne ${emne.emne_id} har kjernebegreper`);
  ok(profile.key_questions?.length >= 3, `Emne ${emne.emne_id} har konkrete spørsmål`);
  ok(profile.mechanisms?.length >= 6, `Emne ${emne.emne_id} har mekanismer`);
  ok(profile.distinguish_from?.length >= 4, `Emne ${emne.emne_id} har distinksjoner`);
  ok(profile.recommended_method_ids?.length >= 3, `Emne ${emne.emne_id} har målrettede metoder`);
  ok(profile.canonical_thinker_ids?.length === 3, `Emne ${emne.emne_id} har tre teorispor`);
  ok(profile.generator_constraints?.require_norm_rule_or_category_identification === true, `Emne ${emne.emne_id} krever regel eller kategori`);
  ok(profile.generator_constraints?.require_observable_consequence === true, `Emne ${emne.emne_id} krever observerbar konsekvens`);
  ok(profile.generator_constraints?.require_population_and_denominator_for_group_claims === true, `Emne ${emne.emne_id} krever populasjonsgrunnlag`);
  ok(profile.generator_constraints?.ban_identity_essence_questions === true, `Emne ${emne.emne_id} forbyr identitetsessens`);
  ok(profile.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, `Emne ${emne.emne_id} forbyr løsrevet teoretikernavn`);
}

const methodIds = new Set(methods.methods.map((method) => method.method_id));
const profiledMethods = methods.methods.filter((method) => method.domain_profiles?.[DOMAIN]?.quality_revision === R);
ok(profiledMethods.length === 16, 'Seksten metoder har norm- og identitetsprofil');
for (const method of profiledMethods) {
  const profile = method.domain_profiles[DOMAIN];
  ok(profile.mechanism_focus?.length >= 3, `Metode ${method.method_id} har mekanismeprofil`);
  ok(profile.critical_distinctions?.length >= 3, `Metode ${method.method_id} har distinksjoner`);
  ok(profile.source_requirements?.length >= 3, `Metode ${method.method_id} har kildekrav`);
  ok(profile.case_anchor_types?.length >= 4, `Metode ${method.method_id} har caseankertyper`);
  ok(profile.anti_patterns?.some((item) => item.includes('gruppeessens')), `Metode ${method.method_id} forbyr gruppeessens som forklaring`);
}

const mappings = [];
for (const item of mapping) {
  for (const candidate of item.mappings || []) {
    if (candidate.fagkart_kategori === DOMAIN) mappings.push(candidate);
  }
}
ok(mappings.length === 20, 'Tjue mappinger finnes for domenet');
for (const item of mappings) {
  ok(item.quality_revision === R, `Mapping ${item.topic_hook} har ny revisjon`);
  ok(item.claim_basis_required === true, `Mapping ${item.topic_hook} krever claim basis`);
  ok(item.norm_rule_or_category_required === true, `Mapping ${item.topic_hook} krever regel eller kategori`);
  ok(item.actor_or_institution_required === true, `Mapping ${item.topic_hook} krever aktør eller institusjon`);
  ok(item.mechanism_options?.length >= 6, `Mapping ${item.topic_hook} har mekanismer`);
  ok(item.observable_consequence_required === true, `Mapping ${item.topic_hook} krever observerbar konsekvens`);
  ok(item.critical_distinction_options?.length >= 4, `Mapping ${item.topic_hook} har distinksjoner`);
  ok(item.theory_lenses?.length === 3, `Mapping ${item.topic_hook} har tre teorispor`);
  ok(item.recommended_method_ids?.length >= 3, `Mapping ${item.topic_hook} har målrettede metoder`);
  ok(item.recommended_method_ids.every((id) => methodIds.has(id)), `Mapping ${item.topic_hook} peker til gyldige metoder`);
  ok(item.generator_constraints?.require_population_and_denominator_for_group_claims === true, `Mapping ${item.topic_hook} krever populasjon og nevner`);
  ok(item.generator_constraints?.ban_identity_essence_questions === true, `Mapping ${item.topic_hook} forbyr identitetsessens`);
  ok(item.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, `Mapping ${item.topic_hook} forbyr løsrevet teoretikernavn`);
}

ok(pensumDomain?.status === 'complete_revised', 'Pensum markerer domenet complete_revised');
ok(pensumDomain?.quality_revision === R, 'Pensum har ny kvalitetsrevisjon');
ok(pensumDomain?.generator_profile === DOMAIN, 'Pensum dokumenterer aktiv generatorprofil');
ok(pensumDomain?.revised_method_ids?.length === 16, 'Pensum peker til 16 reviderte metodeprofiler');
ok(pensumDomain?.vertical_chain_status?.fagkart_hooks_revised === 10, 'Pensum dokumenterer 10 reviderte hooks');
ok(pensumDomain?.vertical_chain_status?.emne_domain_profiles_revised === 9, 'Pensum dokumenterer 9 emneprofiler');
ok(pensumDomain?.vertical_chain_status?.mappings_revised === 20, 'Pensum dokumenterer 20 reviderte mappinger');

const profile = generator.domain_quality_profiles?.[DOMAIN];
ok(profile?.status === 'complete_revised' && profile?.quality_revision === R, 'Generatorprofilen er aktiv og komplett revidert');
ok(profile?.revised_hook_ids?.length === 10, 'Generatorprofilen peker til 10 hooks');
ok(profile?.revised_emne_ids?.length === 9, 'Generatorprofilen peker til 9 emner');
ok(profile?.revised_method_ids?.length === 16, 'Generatorprofilen peker til 16 metoder');
ok(profile?.generator_constraints?.require_norm_rule_or_category_identification === true, 'Generatorprofilen krever regel eller kategori');
ok(profile?.generator_constraints?.require_observable_consequence === true, 'Generatorprofilen krever observerbar konsekvens');
ok(profile?.generator_constraints?.require_population_and_denominator_for_group_claims === true, 'Generatorprofilen krever populasjon og nevner');
ok(profile?.generator_constraints?.ban_identity_essence_questions === true, 'Generatorprofilen forbyr identitetsessens');
ok(profile?.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, 'Generatorprofilen forbyr løsrevet teoretikernavn');

ok(blueprints.length === 10, 'Det finnes 10 representative spørsmålsplaner');
for (const blueprint of blueprints) {
  ok(Boolean(blueprint.source_anchor), `Spørsmålsplan ${blueprint.blueprint_id} har kildeanker`);
  ok(Boolean(blueprint.claim_basis), `Spørsmålsplan ${blueprint.blueprint_id} har claim basis`);
  ok(Boolean(blueprint.emne_id), `Spørsmålsplan ${blueprint.blueprint_id} har emne`);
  ok(methodIds.has(blueprint.method_id), `Spørsmålsplan ${blueprint.blueprint_id} har gyldig metode`);
  ok(Boolean(blueprint.rule_or_category), `Spørsmålsplan ${blueprint.blueprint_id} har regel eller kategori`);
  ok(Boolean(blueprint.enforcement_or_practice_mechanism), `Spørsmålsplan ${blueprint.blueprint_id} har håndheving eller praksis`);
  ok(Boolean(blueprint.observable_consequence), `Spørsmålsplan ${blueprint.blueprint_id} har observerbar konsekvens`);
  ok(Boolean(blueprint.critical_distinction), `Spørsmålsplan ${blueprint.blueprint_id} har distinksjon`);
  ok(Boolean(blueprint.theory_lens?.concept), `Spørsmålsplan ${blueprint.blueprint_id} bruker teoribegrep`);
}

ok(!fs.existsSync('data/fag/politikk/kvalitetslag_v1'), 'Ingen kvalitetslag-overlay finnes');
console.log(`PASS: ${pass}`);
console.log('RESULTAT: PASS');
