#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  branch: 'data/fag/psykologi/sosialpsykologi_university_v1.json',
  report: 'reports/fagverk/psykologi-social-university-audit.json'
});
const REQUIRED_TOPICS = [
  'sosial_persepsjon_attribusjon_og_fundamental_attribusjonsfeil','selvet_sosial_sammenligning_og_selvpresentasjon',
  'holdninger_maling_og_holdning_atferd_gap','overtalelse_budskap_kilde_og_bearbeidingsdybde',
  'sosiale_normer_situasjon_og_atferdsendring','konformitet_informasjons_og_normativ_pavirkning',
  'compliance_lydighet_autoritet_og_motstand','gruppedannelse_roller_normer_og_sosial_identitet',
  'gruppebeslutninger_polarisering_groupthink_og_dissens','ledelse_status_makt_og_institusjonelle_handlingsrom',
  'tiltrekning_naere_relasjoner_og_gjensidighet','prososialitet_hjelpeatferd_og_bystandereffekt',
  'aggresjon_provokasjon_og_situasjonelle_betingelser','samarbeid_tillit_gjensidighet_og_sosiale_dilemmaer',
  'konflikt_forhandling_kommunikasjon_og_felles_mal','sosial_kategorisering_stereotyper_fordommer_og_diskriminering',
  'inngruppe_utgruppe_status_og_kollektiv_identitet','intergruppekontakt_antifordom_og_grensebetingelser',
  'stigma_strukturell_ulikhet_tilhorighet_og_sosial_isolasjon','sosialpsykologiske_metoder_replikasjon_kultur_og_generalisering'
];
const REQUIRED_FAMILIES = ['social_cognition_attitudes','influence_groups_power','relations_cooperation_conflict','intergroup_methods_context'];
const REQUIRED_GUARD_TERMS = Object.freeze({
  sosial_persepsjon_attribusjon_og_fundamental_attribusjonsfeil: [/ikke grunnlag for personlighet, diagnose eller moralsk dom/i, /kulturelle og situasjonelle grensebetingelser/i],
  holdninger_maling_og_holdning_atferd_gap: [/ikke en individuell dom/i, /gruppeforskjeller og korrelasjoner kan ikke brukes som diagnose/i],
  overtalelse_budskap_kilde_og_bearbeidingsdybde: [/ikke en manipulasjonsoppskrift/i, /ikke automatisk kontroll/i, /mulighet til å si nei/i],
  compliance_lydighet_autoritet_og_motstand: [/beviser ikke at mennesker blindt adlyder/i, /etiske begrensninger/i],
  gruppedannelse_roller_normer_og_sosial_identitet: [/definerer ikke et individs holdning, personlighet eller moral/i, /variasjon innad i grupper/i],
  prososialitet_hjelpeatferd_og_bystandereffekt: [/beviser ikke karakter/i, /ikke en unnskyldning eller individuell diagnose/i],
  aggresjon_provokasjon_og_situasjonelle_betingelser: [/forutsier ikke individuell vold/i, /gjør ingen farlig/i],
  sosial_kategorisering_stereotyper_fordommer_og_diskriminering: [/diagnostiserer ikke et individs fordommer eller moral/i, /reliabilitet, prediksjon, kontekst/i],
  stigma_strukturell_ulikhet_tilhorighet_og_sosial_isolasjon: [/kan ikke avleses fra utseende/i, /det å være alene/i],
  sosialpsykologiske_metoder_replikasjon_kultur_og_generalisering: [/ikke en uforanderlig lov/i, /replikasjoner, effektstørrelser/i, /kultur og målpopulasjon/i]
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const projection = (report) => ({ schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom, subject: report.subject, coverage: report.coverage, sources: report.sources, gates: report.gates, complete: report.complete });

export function auditPsykologiSocialUniversity({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.branch]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const branch = read(P.branch);
  assert(branch.schema === 'history_go_psykologi_social_university_v1', 'Feil sosialpsykologi-schema');
  assert(branch.subject_id === 'psykologi' && branch.branch_id === 'social_psychology', 'Sosialpsykologi peker til feil fag eller gren');
  assert(branch.status === 'complete', 'Sosialpsykologi må være eksplisitt complete');
  assert(isDeepStrictEqual(matrix.required_social_psychology_topics, REQUIRED_TOPICS), 'University-matrisen har endret bindende sosialpsykologi-liste');

  const topics = branch.topics || [];
  const topicIds = topics.map((row) => row.topic_id);
  const uniqueTopicIds = new Set(topicIds);
  const exactCoverage = isDeepStrictEqual(topicIds, REQUIRED_TOPICS);
  assert(topics.length === REQUIRED_TOPICS.length && uniqueTopicIds.size === REQUIRED_TOPICS.length, 'Sosialpsykologi må ha 20 unike tema');
  assert(exactCoverage, 'Sosialpsykologi må materialisere eksakt de 20 bindende temaene i canonical rekkefølge');

  const sources = branch.sources || [];
  const sourceIds = new Set(sources.map((source) => source.source_id));
  assert(sources.length >= 18 && sourceIds.size === sources.length, 'Sosialpsykologi trenger minst atten unike kilder');
  assert(sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.source_location && source.type && source.verified_at && (source.supports || []).length > 0), 'En sosialpsykologi-kilde har ufullstendig eller ikke-inspiserbar metadata');

  const topicShapeComplete = topics.every((topic) =>
    topic.title && topic.family && topic.definition?.trim().length >= 80 &&
    (topic.learning_outcomes || []).length >= 2 &&
    (topic.key_distinctions || []).length >= 2 &&
    topic.misuse_guard?.trim().length >= 80 &&
    (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))
  );
  assert(topicShapeComplete, 'Minst ett sosialpsykologi-tema mangler innhold, fagskiller, misbruksvern eller gyldig kilde');
  const usedSourceIds = new Set(topics.flatMap((topic) => topic.source_ids || []));
  const allSourcesUsed = sources.every((source) => usedSourceIds.has(source.source_id));
  assert(allSourcesUsed, 'Sosialpsykologi har en registrert kilde som ikke brukes av noe tema');

  const familyCounts = Object.fromEntries(REQUIRED_FAMILIES.map((family) => [family, topics.filter((topic) => topic.family === family).length]));
  const familyCoverageComplete = REQUIRED_FAMILIES.every((family) => familyCounts[family] === 5) && topics.every((topic) => REQUIRED_FAMILIES.includes(topic.family));
  assert(familyCoverageComplete, 'Sosialpsykologi må ha eksakt fem tema i hver obligatoriske fagfamilie');

  const byTopicId = new Map(topics.map((topic) => [topic.topic_id, topic]));
  const targetedGuardsComplete = Object.entries(REQUIRED_GUARD_TERMS).every(([topicId, patterns]) => {
    const guard = byTopicId.get(topicId)?.misuse_guard || '';
    return patterns.every((pattern) => pattern.test(guard));
  });
  const noAutomaticControlOrIndividualVerdict = topics.every((topic) => !/(avslører den sanne personligheten|beviser at gruppen er|garanterer lydighet|gir sikker kontroll|biasmålet diagnostiserer|risikofaktoren forutsier vold hos individet)/i.test(`${topic.definition} ${topic.misuse_guard}`));
  const responsibleInferenceComplete = targetedGuardsComplete && noAutomaticControlOrIndividualVerdict;
  assert(responsibleInferenceComplete, 'Sosialpsykologi mangler bindende vern mot manipulasjon, individuell merking, gruppestempling eller ukritisk generalisering');

  assert(branch.completion_contract?.required_topic_count === REQUIRED_TOPICS.length, 'Completion contract må kreve 20 tema');
  assert(isDeepStrictEqual(branch.completion_contract?.required_families, REQUIRED_FAMILIES), 'Completion contract har feil familier');
  assert(branch.completion_contract?.no_individual_character_or_diagnosis_from_single_social_observation_required === true, 'Completion contract mangler vern mot individuell sosialdiagnostikk');
  assert(branch.completion_contract?.no_manipulation_recipe_or_automatic_control_claim_required === true, 'Completion contract mangler vern mot manipulasjonsoppskrift');
  assert(branch.completion_contract?.no_group_average_or_bias_measure_as_individual_verdict_required === true, 'Completion contract mangler vern mot gruppesnitt som individverdict');
  assert(branch.completion_contract?.replication_culture_and_context_limits_required === true, 'Completion contract mangler replikerings-, kultur- og kontekstkrav');
  assert(branch.summary?.topic_count === REQUIRED_TOPICS.length && branch.summary?.source_count === sources.length, 'Sosialpsykologi-summary er utdatert');
  assert(isDeepStrictEqual(branch.summary?.family_counts, familyCounts), 'Sosialpsykologi-family summary er utdatert');

  const complete = exactCoverage && topicShapeComplete && familyCoverageComplete && responsibleInferenceComplete && sources.length >= 18;
  const report = {
    schema: 'history_go_fagverk_psykologi_social_university_audit_v1',
    version: '1.0.0',
    status: complete ? 'psykologi_social_university_complete' : 'psykologi_social_university_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', branchId: branch.branch_id },
    coverage: { requiredTopicCount: REQUIRED_TOPICS.length, materializedTopicCount: topics.length, exactTopicCoverage: exactCoverage, familyCounts },
    sources: { sourceCount: sources.length, allTopicsSourced: topics.every((topic) => topic.source_ids?.length > 0) },
    gates: {
      exact20TopicCoverage: exactCoverage,
      uniqueTopicIds: uniqueTopicIds.size === REQUIRED_TOPICS.length,
      allTopicsHaveDefinitions: topics.every((topic) => topic.definition?.trim().length >= 80),
      allTopicsHaveLearningOutcomes: topics.every((topic) => (topic.learning_outcomes || []).length >= 2),
      allTopicsHaveCriticalDistinctions: topics.every((topic) => (topic.key_distinctions || []).length >= 2),
      allTopicsHaveMisuseGuards: topics.every((topic) => topic.misuse_guard?.trim().length >= 80),
      allTopicsHaveResolvedSources: topics.every((topic) => (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))),
      everyRegisteredSourceUsed: allSourcesUsed,
      fourFamiliesHaveFiveTopicsEach: familyCoverageComplete,
      minimumSourceBaseMet: sources.length >= 18,
      noIndividualCharacterOrDiagnosisFromSingleObservation: responsibleInferenceComplete,
      noManipulationRecipeOrAutomaticControl: REQUIRED_GUARD_TERMS.overtalelse_budskap_kilde_og_bearbeidingsdybde.every((pattern) => pattern.test(byTopicId.get('overtalelse_budskap_kilde_og_bearbeidingsdybde')?.misuse_guard || '')),
      noGroupAverageOrBiasMeasureAsIndividualVerdict: REQUIRED_GUARD_TERMS.sosial_kategorisering_stereotyper_fordommer_og_diskriminering.every((pattern) => pattern.test(byTopicId.get('sosial_kategorisering_stereotyper_fordommer_og_diskriminering')?.misuse_guard || '')),
      replicationCultureAndContextLimitsPresent: REQUIRED_GUARD_TERMS.sosialpsykologiske_metoder_replikasjon_kultur_og_generalisering.every((pattern) => pattern.test(byTopicId.get('sosialpsykologiske_metoder_replikasjon_kultur_og_generalisering')?.misuse_guard || ''))
    },
    complete
  };
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(projection(report), null, 2)}\n`);
  }
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler. Kjør --write-report`);
    assert(isDeepStrictEqual(read(P.report), projection(report)), `${P.report} er utdatert`);
  }
  return { report: projection(report) };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditPsykologiSocialUniversity({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi sosialpsykologi universitet OK: ${report.coverage.materializedTopicCount}/20 tema, ${report.sources.sourceCount} kilder, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Psykologi sosialpsykologi universitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
