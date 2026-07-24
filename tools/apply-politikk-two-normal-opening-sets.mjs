import fs from 'node:fs';

const RULES_PATH = 'data/fag/politikk/quiz_generator_rules_politikk_v5_1_source_priority_patch.json';
const REPORT_DIR = 'reports/politikk-canonical-migration';
const REVISION = 'politikk-two-normal-opening-sets-2026-07-24';
const rules = JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'));

rules.version = 'v5.6-two-normal-opening-sets';
rules.updated_at = '2026-07-24';
rules.quality_revision = REVISION;
rules.purpose = `${rules.purpose} De to første settene skal alltid bestå av sju vanlige, kildebaserte quizspørsmål hver før mekanisme-, distinksjons- eller teorispørsmål introduseres.`;

rules.opening_normal_quiz_contract = {
  status: 'required',
  quality_revision: REVISION,
  applies_to_every_place_and_person_quiz: true,
  opening_set_ids: [1, 2],
  questions_per_set: 7,
  total_opening_normal_questions: 14,
  visible_register: 'vanlig norsk quizspråk',
  purpose: 'Etablere sted, institusjon, person, funksjon, hendelser og kronologi med normale faktaspørsmål før faglig analyse.',
  set_1_role: 'direkte grunnfakta om sted, institusjon, offentlig funksjon og identifiserbare kjennetegn',
  set_2_role: 'historie, personer, hendelser, vedtak, organisasjoner, endret funksjon og enkel kronologi',
  allowed_question_starts: [
    'Hva',
    'Hvem',
    'Hvor',
    'Når',
    'Hvilket',
    'Hvilken',
    'Hvilke'
  ],
  preferred_normal_question_types: [
    'navn eller identifikasjon',
    'institusjon eller organisasjon',
    'offentlig funksjon',
    'årstall eller periode',
    'person og dokumentert rolle',
    'hendelse',
    'lov, vedtak eller reform',
    'hva stedet erstattet eller ble brukt til',
    'enkel kronologi',
    'synlig eller dokumentert kjennetegn'
  ],
  required_source_rule: 'Alle 14 spørsmål skal ha et eksternt kildegrunnlag som direkte bærer fasiten.',
  answer_rule: 'Ett kort, konkret og etterprøvbart svar skal være tydelig riktig. Distraktorene skal være plausible, men faktuelt feil.',
  metadata_may_be_academic_but_visible_question_may_not: true,
  analysis_may_begin_from_set: 3,
  theory_may_begin_from_set: 4,
  forbidden_visible_features_in_sets_1_2: [
    'teoretikernavn som spørsmålets hovedpoeng',
    'metodenavn',
    'hook-id eller emne-id',
    'krav om å velge faglig lesning',
    'krav om å identifisere abstrakt mekanisme',
    'krav om å velge kritisk distinksjon',
    'akademisk omskriving av et enkelt faktaspørsmål'
  ],
  forbidden_stems_in_sets_1_2: [
    'Hvordan kan stedet leses som',
    'Hvorfor passer stedet til emnet',
    'Hva er den mest presise faglige lesningen',
    'Hvilket begrep beskriver best',
    'Hvilken teoretiker',
    'Hvordan illustrerer stedet',
    'Hva viser stedet om',
    'Hvilken mekanisme forklarer best',
    'Hvilken distinksjon er mest relevant'
  ],
  no_exceptions_for_advanced_places: true
};

rules.hard_rules ||= {};
Object.assign(rules.hard_rules, {
  first_two_sets_must_be_normal_quiz: true,
  opening_normal_set_count: 2,
  opening_questions_per_set: 7,
  opening_normal_question_total: 14,
  visible_academic_language_forbidden_in_sets_1_2: true,
  theory_forbidden_in_sets_1_2: true,
  method_names_forbidden_in_sets_1_2: true,
  mechanism_or_distinction_as_visible_task_forbidden_in_sets_1_2: true,
  opening_question_answer_must_be_short_concrete_and_verifiable: true,
  opening_distractors_must_be_plausible_not_absurd: true
});

const priorSet2 = structuredClone(rules.set_guidance?.['2'] || {});
rules.analytical_domain_rotation_after_opening = {
  status: 'required',
  begins_after_set: 2,
  domains: [
    'styring_institusjoner_forvaltning',
    'demokrati_representasjon_offentlighet',
    'rett_lov_rettssikkerhet',
    'fordeling_velferd_ulikhet',
    'konflikt_makt_sivilsamfunn',
    'normer_identitet_hverdagsliv'
  ],
  preserved_styring_guidance_from_previous_set_2: priorSet2,
  rule: 'Alle seks domener skal kunne brukes etter de 14 normale åpningsspørsmålene. Styringsdomenet skal ikke gå tapt når sett 2 reserveres til normalquiz.'
};

rules.set_guidance ||= {};
rules.set_guidance['1'] = {
  name: 'normalquiz_1_sted_institusjon_funksjon',
  opening_normal_set: true,
  questions_required: 7,
  visible_question_mode: 'normal_factual_quiz',
  difficulty: 'lett_til_middels',
  dominant_driver: 'ekstern kilde og direkte fakta om stedet, institusjonen, personen eller den offentlige funksjonen',
  canonical_role: 'metadata og intern klassifisering; ikke synlig fagspråk',
  preferred_question_types: [
    'Hva heter stedet eller institusjonen?',
    'Hvilken institusjon holder til her?',
    'Hva er stedets viktigste offentlige funksjon?',
    'Når åpnet, ble opprettet eller tatt i bruk?',
    'Hvilket organ bruker stedet?',
    'Hva erstattet stedet eller institusjonen?',
    'Hvilket dokumentert kjennetegn er knyttet til stedet?'
  ],
  external_source_ratio_minimum: 1,
  theory_allowed: false,
  named_theorist_allowed: false,
  method_name_visible_allowed: false,
  mechanism_as_visible_task_allowed: false,
  critical_distinction_as_visible_task_allowed: false,
  questions_must_have_short_concrete_answers: true
};
rules.set_guidance['2'] = {
  name: 'normalquiz_2_historie_personer_hendelser',
  opening_normal_set: true,
  questions_required: 7,
  visible_question_mode: 'normal_factual_quiz',
  difficulty: 'lett_til_middels',
  dominant_driver: 'ekstern kilde og dokumenterte personer, hendelser, beslutninger, organisasjoner, funksjonsendringer og kronologi',
  canonical_role: 'metadata og intern klassifisering; ikke synlig fagspråk',
  preferred_question_types: [
    'Hvem hadde en dokumentert rolle her?',
    'Hvilken hendelse fant sted her?',
    'Hvilket vedtak, hvilken lov eller reform er knyttet til stedet?',
    'Hvilken organisasjon brukte eller bruker stedet?',
    'Hva skjedde først eller sist?',
    'Hvordan endret stedets funksjon seg – formulert som et konkret faktaspørsmål?',
    'Hvilken tidligere bruk, person eller institusjon er dokumentert her?'
  ],
  external_source_ratio_minimum: 1,
  theory_allowed: false,
  named_theorist_allowed: false,
  method_name_visible_allowed: false,
  mechanism_as_visible_task_allowed: false,
  critical_distinction_as_visible_task_allowed: false,
  questions_must_have_short_concrete_answers: true
};

rules.validator_additions ||= [];
for (const item of [
  'Avvis enhver politikkquiz som ikke har nøyaktig sju normale faktaspørsmål i både sett 1 og sett 2.',
  'Avvis synlig teori-, metode-, mekanisme- eller distinksjonsspråk i sett 1 og sett 2.',
  'Avvis åpningsspørsmål som bruker formuleringene «Hvordan kan stedet leses som», «Hvorfor passer stedet til emnet», «mest presise faglige lesning», «Hvilket begrep beskriver best» eller «Hvilken teoretiker».',
  'Avvis åpningsspørsmål uten kort, konkret og direkte kildeverifiserbar fasit.',
  'Avvis åpningssett med åpenbart tullete distraktorer; alle alternativer skal være plausible innen samme svarkategori.',
  'Avvis generatorløp som lar et avansert sted hoppe over de 14 normale åpningsspørsmålene.'
]) {
  if (!rules.validator_additions.includes(item)) rules.validator_additions.push(item);
}

rules.generation_metadata_additions ||= {};
const recommended = rules.generation_metadata_additions.required_per_question_fields_recommended ||= [];
for (const field of ['set_index', 'opening_normal_question', 'normal_question_type', 'visible_question_register']) {
  if (!recommended.includes(field)) recommended.push(field);
}
rules.generation_metadata_additions.opening_sets_metadata_rule = 'Metadata kan inneholde emne, metode og mekanisme, men synlig spørsmålstekst i sett 1–2 skal være vanlig faktaspråk.';

const blueprints = [
  ['1', 'navn', 'Hva heter den offentlige institusjonen som holder til på stedet?'],
  ['1', 'institusjon', 'Hvilket offentlig organ bruker bygningen?'],
  ['1', 'funksjon', 'Hva er bygningens viktigste offentlige funksjon?'],
  ['1', 'årstall', 'Når ble stedet tatt i bruk til sin nåværende hovedfunksjon?'],
  ['1', 'organ', 'Hvilken myndighet eller organisasjon er direkte knyttet til stedet?'],
  ['1', 'erstattet', 'Hvilken tidligere institusjon eller bygning erstattet dette stedet?'],
  ['1', 'kjennetegn', 'Hvilket dokumentert kjennetegn hører til stedet?'],
  ['2', 'person', 'Hvem hadde en dokumentert politisk eller offentlig rolle her?'],
  ['2', 'hendelse', 'Hvilken dokumentert hendelse fant sted her?'],
  ['2', 'vedtak_lov_reform', 'Hvilket vedtak, hvilken lov eller reform er knyttet til stedet?'],
  ['2', 'organisasjon', 'Hvilken organisasjon holdt til eller møttes her?'],
  ['2', 'kronologi', 'Hvilken av disse hendelsene skjedde først?'],
  ['2', 'funksjonsendring', 'Hva ble stedet brukt til før dagens hovedfunksjon?'],
  ['2', 'historisk_bruk', 'Hvilken tidligere person, institusjon eller bruk er dokumentert på stedet?']
].map(([set_id, type, question], index) => ({
  blueprint_id: `pol_opening_normal_${String(index + 1).padStart(2, '0')}`,
  set_id: Number(set_id),
  question_number_in_set: index < 7 ? index + 1 : index - 6,
  normal_question_type: type,
  visible_question_template: question,
  source_requirement: 'ekstern kilde som direkte bærer fasiten',
  answer_requirement: 'kort, konkret og etterprøvbart svar',
  distractor_requirement: 'to eller tre plausible alternativer i samme svarkategori',
  theory_visible: false,
  method_visible: false,
  mechanism_visible: false
}));

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(RULES_PATH, `${JSON.stringify(rules, null, 2)}\n`);
fs.writeFileSync(`${REPORT_DIR}/politikk-two-normal-opening-sets-blueprints.json`, `${JSON.stringify(blueprints, null, 2)}\n`);
fs.writeFileSync(`${REPORT_DIR}/politikk-two-normal-opening-sets.md`, `# Politikk: to normale åpningssett\n\nAlle politikkquizer skal begynne med to sett à sju vanlige, kildebaserte faktaspørsmål.\n\n- Sett 1: sted, institusjon, funksjon og direkte grunnfakta\n- Sett 2: personer, hendelser, vedtak, organisasjoner, funksjonsendring og kronologi\n- Analyse kan begynne fra sett 3\n- Teori kan begynne fra sett 4\n- Metadata kan være faglig, men synlig språk i de første 14 spørsmålene skal være normalt quizspråk\n\nOppkonstruerte formuleringer som «Hvordan kan stedet leses som …?» og «Hvilket begrep beskriver best …?» er forbudt i åpningssettene.\n`);

console.log('Materialiserte to normale åpningssett med 14 spørsmålsplaner.');
