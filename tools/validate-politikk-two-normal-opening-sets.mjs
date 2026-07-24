import fs from 'node:fs';

const RULES_PATH = 'data/fag/politikk/quiz_generator_rules_politikk_v5_1_source_priority_patch.json';
const PENSUM_PATH = 'data/fag/politikk/politikkpensum_canonical_v4_5.json';
const BLUEPRINT_PATH = 'reports/politikk-canonical-migration/politikk-two-normal-opening-sets-blueprints.json';
const REVISION = 'politikk-two-normal-opening-sets-2026-07-24';
const rules = JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'));
const pensum = JSON.parse(fs.readFileSync(PENSUM_PATH, 'utf8'));
const blueprints = JSON.parse(fs.readFileSync(BLUEPRINT_PATH, 'utf8'));
let pass = 0;
const ok = (value, message) => {
  if (!value) throw new Error(`FAIL | ${message}`);
  console.log(`PASS | ${message}`);
  pass += 1;
};

ok(pensum.domains.length === 6, 'Politikkpensum har seks domener');
for (const domain of pensum.domains) {
  ok(domain.status === 'complete_revised', `Domene ${domain.domain_id} er complete_revised`);
  ok(Boolean(domain.quality_revision), `Domene ${domain.domain_id} har kvalitetsrevisjon`);
  const profileActive = domain.vertical_chain_status?.generator_profile_active === true
    || Boolean(domain.generator_profile)
    || Boolean(domain.generator_profile_id)
    || rules.domain_quality_profiles?.[domain.domain_id]?.status === 'complete_revised';
  ok(profileActive, `Domene ${domain.domain_id} har aktiv generatorprofil`);
}

const contract = rules.opening_normal_quiz_contract;
ok(rules.quality_revision === REVISION, 'Generatoren har ny åpningsrevisjon');
ok(contract?.status === 'required', 'Åpningskontrakten er obligatorisk');
ok(contract?.applies_to_every_place_and_person_quiz === true, 'Kontrakten gjelder alle sted- og personquizer');
ok(JSON.stringify(contract?.opening_set_ids) === JSON.stringify([1, 2]), 'Sett 1 og 2 er låst som åpningssett');
ok(contract?.questions_per_set === 7, 'Hvert åpningssett har sju spørsmål');
ok(contract?.total_opening_normal_questions === 14, 'Åpningen har totalt fjorten normale spørsmål');
ok(contract?.analysis_may_begin_from_set === 3, 'Analyse kan først begynne fra sett 3');
ok(contract?.theory_may_begin_from_set === 4, 'Teori kan først begynne fra sett 4');
ok(contract?.metadata_may_be_academic_but_visible_question_may_not === true, 'Fagmetadata skilles fra synlig spørsmålsspråk');
ok(contract?.no_exceptions_for_advanced_places === true, 'Avanserte steder kan ikke hoppe over normalåpningen');
ok(contract?.allowed_question_starts?.length >= 7, 'Normale spørreord er eksplisitt tillatt');
ok(contract?.preferred_normal_question_types?.length >= 9, 'Kontrakten har brede normale spørsmålstyper');
ok(contract?.forbidden_stems_in_sets_1_2?.length >= 8, 'Oppkonstruerte spørsmålsstammer er eksplisitt forbudt');
for (const stem of ['Hvordan kan stedet leses som', 'Hvorfor passer stedet til emnet', 'Hva er den mest presise faglige lesningen', 'Hvilket begrep beskriver best', 'Hvilken teoretiker']) {
  ok(contract.forbidden_stems_in_sets_1_2.includes(stem), `Forbudt åpning er låst: ${stem}`);
}

for (const setId of ['1', '2']) {
  const set = rules.set_guidance?.[setId];
  ok(set?.opening_normal_set === true, `Sett ${setId} er normalsett`);
  ok(set?.questions_required === 7, `Sett ${setId} krever sju spørsmål`);
  ok(set?.visible_question_mode === 'normal_factual_quiz', `Sett ${setId} bruker normalt faktaspråk`);
  ok(set?.external_source_ratio_minimum === 1, `Sett ${setId} krever eksternt kildegrunnlag for alle spørsmål`);
  ok(set?.theory_allowed === false, `Sett ${setId} forbyr teori`);
  ok(set?.named_theorist_allowed === false, `Sett ${setId} forbyr teoretikernavn`);
  ok(set?.method_name_visible_allowed === false, `Sett ${setId} skjuler metodenavn`);
  ok(set?.mechanism_as_visible_task_allowed === false, `Sett ${setId} forbyr mekanisme som synlig oppgave`);
  ok(set?.critical_distinction_as_visible_task_allowed === false, `Sett ${setId} forbyr distinksjon som synlig oppgave`);
  ok(set?.questions_must_have_short_concrete_answers === true, `Sett ${setId} krever korte konkrete svar`);
  ok(set?.preferred_question_types?.length === 7, `Sett ${setId} har sju representative spørsmålstyper`);
}

const hard = rules.hard_rules;
ok(hard.first_two_sets_must_be_normal_quiz === true, 'Hardregel låser to normale førstesett');
ok(hard.opening_normal_set_count === 2, 'Hardregel låser to åpningssett');
ok(hard.opening_questions_per_set === 7, 'Hardregel låser sju spørsmål per sett');
ok(hard.opening_normal_question_total === 14, 'Hardregel låser fjorten spørsmål');
ok(hard.visible_academic_language_forbidden_in_sets_1_2 === true, 'Akademisk synlig språk er forbudt i sett 1–2');
ok(hard.theory_forbidden_in_sets_1_2 === true, 'Teori er forbudt i sett 1–2');
ok(hard.method_names_forbidden_in_sets_1_2 === true, 'Metodenavn er forbudt i sett 1–2');
ok(hard.mechanism_or_distinction_as_visible_task_forbidden_in_sets_1_2 === true, 'Mekanisme og distinksjon er forbudt som synlig åpningsoppgave');
ok(hard.opening_distractors_must_be_plausible_not_absurd === true, 'Distraktorer må være plausible');

const rotation = rules.analytical_domain_rotation_after_opening;
ok(rotation?.begins_after_set === 2, 'Domeneanalyse begynner etter normalåpningen');
ok(rotation?.domains?.length === 6, 'Alle seks domener er bevart etter åpningssettene');
ok(rotation?.domains?.every((id) => pensum.domain_order.includes(id)), 'Domenerotasjonen bruker kanoniske domene-ID-er');
ok(Boolean(rotation?.preserved_styring_guidance_from_previous_set_2), 'Tidligere styringsveiledning er bevart');

ok(blueprints.length === 14, 'Det finnes fjorten representative normale spørsmålsplaner');
ok(blueprints.filter((item) => item.set_id === 1).length === 7, 'Sju spørsmålsplaner tilhører sett 1');
ok(blueprints.filter((item) => item.set_id === 2).length === 7, 'Sju spørsmålsplaner tilhører sett 2');
for (const item of blueprints) {
  ok(item.theory_visible === false, `${item.blueprint_id} skjuler teori`);
  ok(item.method_visible === false, `${item.blueprint_id} skjuler metode`);
  ok(item.mechanism_visible === false, `${item.blueprint_id} skjuler mekanisme`);
  ok(Boolean(item.visible_question_template), `${item.blueprint_id} har normalt spørsmål`);
  ok(Boolean(item.source_requirement), `${item.blueprint_id} har kildekrav`);
  ok(Boolean(item.answer_requirement), `${item.blueprint_id} har svarkrav`);
  ok(Boolean(item.distractor_requirement), `${item.blueprint_id} har distraktorkrav`);
}

const additions = rules.validator_additions || [];
ok(additions.some((item) => item.includes('nøyaktig sju normale faktaspørsmål')), 'Validatorregel krever sju normale spørsmål i hvert åpningssett');
ok(additions.some((item) => item.includes('synlig teori-, metode-, mekanisme- eller distinksjonsspråk')), 'Validatorregel avviser akademisk åpningsspråk');
ok(additions.some((item) => item.includes('åpenbart tullete distraktorer')), 'Validatorregel avviser tullete distraktorer');

console.log(`PASS: ${pass}`);
console.log('RESULTAT: PASS');
