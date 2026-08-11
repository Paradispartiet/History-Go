#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  branch: 'data/fag/psykologi/utviklingspsykologi_university_v1.json',
  report: 'reports/fagverk/psykologi-developmental-university-audit.json'
});
const REQUIRED_TOPICS = [
  'livslop_endring_kontinuitet_og_plastisitet','utviklingsteorier_stadier_systemer_og_sosiokulturelle_perspektiver',
  'longitudinelle_tverrsnitt_og_kohortsekvensielle_design','utviklingsmaling_observasjon_eksperiment_og_etikk',
  'genetikk_biologi_miljo_og_transaksjon','prenatal_utvikling_fodsel_og_eksponeringsrisiko',
  'hjerne_motorikk_persepsjon_og_erfaringsavhengig_plastisitet','temperament_folesesregulering_og_individforskjeller',
  'tilknytning_omsorg_og_relasjonell_utvikling','sprak_symbolbruk_og_tidlig_kognitiv_utvikling',
  'eksekutive_funksjoner_laring_og_skolekontekst','sosial_kognisjon_sinnsteori_moral_og_prososialitet',
  'familie_jevnaldrende_lek_og_tilhorighet','pubertet_ungdom_og_sosial_reorientering',
  'identitet_autonomi_og_overgang_til_voksenliv','belastning_beskyttelse_resiliens_og_utviklingsbaner',
  'voksenutvikling_intimitet_arbeid_omsorg_og_overganger','kognitiv_aldring_ekspertise_og_kognitiv_reserve',
  'sosioemosjonell_aldring_tap_tilpasning_og_mening','kultur_kohort_historisk_tid_og_utviklingsmangfold'
];
const REQUIRED_FAMILIES = ['foundations_methods','early_development','childhood_adolescence','adulthood_aging_context'];
const REQUIRED_GUARD_TERMS = Object.freeze({
  longitudinelle_tverrsnitt_og_kohortsekvensielle_design: [/dokumenterer ikke individuell utvikling/i, /kohort/i, /retest|testøvelse/i],
  prenatal_utvikling_fodsel_og_eksponeringsrisiko: [/ikke i seg selv en diagnose/i, /sikker prognose/i, /skyldplassering/i],
  tilknytning_omsorg_og_relasjonell_utvikling: [/kort observasjon kan ikke klassifisere/i, /omsorgskvalitet/i, /bestemmer ikke resten av livet/i],
  pubertet_ungdom_og_sosial_reorientering: [/uferdig hjerne/i, /ikke en tilstrekkelig forklaring/i],
  belastning_beskyttelse_resiliens_og_utviklingsbaner: [/ACE-tall/i, /ikke en diagnose/i, /bestemmer ikke hjernen eller framtiden/i],
  kognitiv_aldring_ekspertise_og_kognitiv_reserve: [/diagnostiserer ikke demens/i, /én kognitiv test/i],
  kultur_kohort_historisk_tid_og_utviklingsmangfold: [/kan ikke uten videre universaliseres/i, /ikke en fast personlighetsegenskap/i]
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const projection = (report) => ({ schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom, subject: report.subject, coverage: report.coverage, sources: report.sources, gates: report.gates, complete: report.complete });

export function auditPsykologiDevelopmentalUniversity({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.branch]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const branch = read(P.branch);
  assert(branch.schema === 'history_go_psykologi_developmental_university_v1', 'Feil utviklingspsykologi-schema');
  assert(branch.subject_id === 'psykologi' && branch.branch_id === 'developmental_psychology', 'Utviklingspsykologi peker til feil fag eller gren');
  assert(branch.status === 'complete', 'Utviklingspsykologi må være eksplisitt complete');
  assert(isDeepStrictEqual(matrix.required_developmental_psychology_topics, REQUIRED_TOPICS), 'University-matrisen har endret bindende utviklingspsykologi-liste');

  const topics = branch.topics || [];
  const topicIds = topics.map((row) => row.topic_id);
  const uniqueTopicIds = new Set(topicIds);
  const exactCoverage = isDeepStrictEqual(topicIds, REQUIRED_TOPICS);
  assert(topics.length === REQUIRED_TOPICS.length && uniqueTopicIds.size === REQUIRED_TOPICS.length, 'Utviklingspsykologi må ha 20 unike tema');
  assert(exactCoverage, 'Utviklingspsykologi må materialisere eksakt de 20 bindende temaene i canonical rekkefølge');

  const sources = branch.sources || [];
  const sourceIds = new Set(sources.map((source) => source.source_id));
  assert(sources.length >= 15 && sourceIds.size === sources.length, 'Utviklingspsykologi trenger minst femten unike kilder');
  assert(sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.source_location && source.type && source.verified_at && (source.supports || []).length > 0), 'En utviklingspsykologi-kilde har ufullstendig eller ikke-inspiserbar metadata');

  const topicShapeComplete = topics.every((topic) =>
    topic.title && topic.family && topic.definition?.trim().length >= 80 &&
    (topic.learning_outcomes || []).length >= 2 &&
    (topic.key_distinctions || []).length >= 2 &&
    topic.misuse_guard?.trim().length >= 80 &&
    (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))
  );
  assert(topicShapeComplete, 'Minst ett utviklingspsykologi-tema mangler innhold, fagskiller, misbruksvern eller gyldig kilde');
  const usedSourceIds = new Set(topics.flatMap((topic) => topic.source_ids || []));
  const allSourcesUsed = sources.every((source) => usedSourceIds.has(source.source_id));
  assert(allSourcesUsed, 'Utviklingspsykologi har en registrert kilde som ikke brukes av noe tema');

  const familyCounts = Object.fromEntries(REQUIRED_FAMILIES.map((family) => [family, topics.filter((topic) => topic.family === family).length]));
  const familyCoverageComplete = REQUIRED_FAMILIES.every((family) => familyCounts[family] === 5) && topics.every((topic) => REQUIRED_FAMILIES.includes(topic.family));
  assert(familyCoverageComplete, 'Utviklingspsykologi må ha eksakt fem tema i hver obligatoriske fagfamilie');

  const byTopicId = new Map(topics.map((topic) => [topic.topic_id, topic]));
  const targetedGuardsComplete = Object.entries(REQUIRED_GUARD_TERMS).every(([topicId, patterns]) => {
    const guard = byTopicId.get(topicId)?.misuse_guard || '';
    return patterns.every((pattern) => pattern.test(guard));
  });
  const noDeterministicOrDiagnosticClaims = topics.every((topic) => !/(milepælen beviser|tilknytningsstilen avslører|ACE-tallet forutsier individet|ungdomshjernen forklarer all atferd|alder alene diagnostiserer)/i.test(`${topic.definition} ${topic.misuse_guard}`));
  const responsibleInferenceComplete = targetedGuardsComplete && noDeterministicOrDiagnosticClaims;
  assert(responsibleInferenceComplete, 'Utviklingspsykologi mangler bindende vern mot utviklingsmerking, determinisme, prognose eller alder–kohort-feil');

  assert(branch.completion_contract?.required_topic_count === REQUIRED_TOPICS.length, 'Completion contract må kreve 20 tema');
  assert(isDeepStrictEqual(branch.completion_contract?.required_families, REQUIRED_FAMILIES), 'Completion contract har feil familier');
  assert(branch.completion_contract?.no_developmental_diagnosis_or_milestone_label_from_casual_observation_required === true, 'Completion contract mangler vern mot milepælsdiagnostikk');
  assert(branch.completion_contract?.no_attachment_or_parenting_label_from_casual_observation_required === true, 'Completion contract mangler vern mot tilknytnings- og foreldremerking');
  assert(branch.completion_contract?.no_adversity_or_brain_destiny_claim_required === true, 'Completion contract mangler vern mot motgangs- og hjernedeterminisme');
  assert(branch.completion_contract?.no_age_cohort_conflation_required === true, 'Completion contract mangler vern mot alder–kohort-sammenblanding');
  assert(branch.summary?.topic_count === REQUIRED_TOPICS.length && branch.summary?.source_count === sources.length, 'Utviklingspsykologi-summary er utdatert');
  assert(isDeepStrictEqual(branch.summary?.family_counts, familyCounts), 'Utviklingspsykologi-family summary er utdatert');

  const complete = exactCoverage && topicShapeComplete && familyCoverageComplete && responsibleInferenceComplete && sources.length >= 15;
  const report = {
    schema: 'history_go_fagverk_psykologi_developmental_university_audit_v1',
    version: '1.0.0',
    status: complete ? 'psykologi_developmental_university_complete' : 'psykologi_developmental_university_in_progress',
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
      minimumSourceBaseMet: sources.length >= 15,
      noCasualMilestoneOrDevelopmentalDiagnosis: responsibleInferenceComplete,
      attachmentAndParentingLabelGuardPresent: REQUIRED_GUARD_TERMS.tilknytning_omsorg_og_relasjonell_utvikling.every((pattern) => pattern.test(byTopicId.get('tilknytning_omsorg_og_relasjonell_utvikling')?.misuse_guard || '')),
      adversityAndBrainDestinyGuardPresent: REQUIRED_GUARD_TERMS.belastning_beskyttelse_resiliens_og_utviklingsbaner.every((pattern) => pattern.test(byTopicId.get('belastning_beskyttelse_resiliens_og_utviklingsbaner')?.misuse_guard || '')),
      ageCohortAndAgingDiagnosisGuardsPresent: ['longitudinelle_tverrsnitt_og_kohortsekvensielle_design','kognitiv_aldring_ekspertise_og_kognitiv_reserve','kultur_kohort_historisk_tid_og_utviklingsmangfold'].every((topicId) => REQUIRED_GUARD_TERMS[topicId].every((pattern) => pattern.test(byTopicId.get(topicId)?.misuse_guard || '')))
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
    const { report } = auditPsykologiDevelopmentalUniversity({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi utviklingspsykologi universitet OK: ${report.coverage.materializedTopicCount}/20 tema, ${report.sources.sourceCount} kilder, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Psykologi utviklingspsykologi universitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
