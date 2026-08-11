#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  branch: 'data/fag/psykologi/kognitiv_psykologi_university_v1.json',
  report: 'reports/fagverk/psykologi-cognitive-university-audit.json'
});
const REQUIRED_TOPICS = [
  'psykofysikk_signaloppdagelse_og_maling','perseptuell_organisering_konstans_og_forventning',
  'selektiv_oppmerksomhet_orientering_og_beredskap','delt_oppmerksomhet_automatikk_og_uoppmerksomhetsblindhet',
  'arbeidsminne_kapasitet_og_oppgavekrav','innkoding_konsolidering_og_gjenhenting',
  'rekonstruktiv_hukommelse_kildekontroll_og_feilminner','laring_spredt_oving_gjenhenting_og_overforing',
  'begreper_kategorier_og_semantisk_kunnskap','sprakforstaelse_produksjon_og_kontekst',
  'sprak_tenkning_og_flerspraklig_erfaring','mentale_bilder_romlig_kognisjon_og_representasjonsformat',
  'eksekutive_funksjoner_kontroll_og_oppgaveurenhet','problemlosning_resonnering_og_ekspertise',
  'heuristikker_bias_og_dualprosessmodeller','beslutning_under_risiko_usikkerhet_og_framing',
  'metakognisjon_kognitive_modeller_og_forskningsmetoder'
];
const REQUIRED_FAMILIES = ['perception_attention','memory_learning','language_representation','reasoning_decision_control'];
const REQUIRED_GUARD_TERMS = Object.freeze({
  psykofysikk_signaloppdagelse_og_maling: [/én laboratorieoppgave/i, /ikke et generelt mål/i],
  delt_oppmerksomhet_automatikk_og_uoppmerksomhetsblindhet: [/beviser ikke generell uoppmerksomhet/i, /diagnose/i],
  arbeidsminne_kapasitet_og_oppgavekrav: [/måler ikke generell intelligens/i, /diagnose/i],
  rekonstruktiv_hukommelse_kildekontroll_og_feilminner: [/beviser ikke at et minne er nøyaktig/i, /ikke grunnlag for å avvise/i],
  eksekutive_funksjoner_kontroll_og_oppgaveurenhet: [/én kontrolloppgave/i, /diagnose/i],
  metakognisjon_kognitive_modeller_og_forskningsmetoder: [/leser tanker direkte/i, /kan ikke alene diagnostisere/i]
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const projection = (report) => ({ schema: report.schema, version: report.version, status: report.status, generatedFrom: report.generatedFrom, subject: report.subject, coverage: report.coverage, sources: report.sources, gates: report.gates, complete: report.complete });

export function auditPsykologiCognitiveUniversity({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.branch]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const branch = read(P.branch);
  assert(branch.schema === 'history_go_psykologi_cognitive_university_v1', 'Feil kognitiv-psykologi-schema');
  assert(branch.subject_id === 'psykologi' && branch.branch_id === 'cognitive_psychology', 'Kognitiv psykologi peker til feil fag eller gren');
  assert(branch.status === 'complete', 'Kognitiv psykologi må være eksplisitt complete');
  assert(isDeepStrictEqual(matrix.required_cognitive_psychology_topics, REQUIRED_TOPICS), 'University-matrisen har endret bindende kognitiv-psykologi-liste');

  const topics = branch.topics || [];
  const topicIds = topics.map((row) => row.topic_id);
  const uniqueTopicIds = new Set(topicIds);
  const exactCoverage = isDeepStrictEqual(topicIds, REQUIRED_TOPICS);
  assert(topics.length === REQUIRED_TOPICS.length && uniqueTopicIds.size === REQUIRED_TOPICS.length, 'Kognitiv psykologi må ha 17 unike tema');
  assert(exactCoverage, 'Kognitiv psykologi må materialisere eksakt de 17 bindende temaene i canonical rekkefølge');

  const sources = branch.sources || [];
  const sourceIds = new Set(sources.map((source) => source.source_id));
  assert(sources.length >= 12 && sourceIds.size === sources.length, 'Kognitiv psykologi trenger minst tolv unike kilder');
  assert(sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.source_location && source.type && source.verified_at && (source.supports || []).length > 0), 'En kognitiv-psykologi-kilde har ufullstendig eller ikke-inspiserbar metadata');

  const topicShapeComplete = topics.every((topic) =>
    topic.title && topic.family && topic.definition?.trim().length >= 80 &&
    (topic.learning_outcomes || []).length >= 2 &&
    (topic.key_distinctions || []).length >= 2 &&
    topic.misuse_guard?.trim().length >= 80 &&
    (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))
  );
  assert(topicShapeComplete, 'Minst ett kognitiv-psykologi-tema mangler innhold, fagskiller, misbruksvern eller gyldig kilde');

  const familyCounts = Object.fromEntries(REQUIRED_FAMILIES.map((family) => [family, topics.filter((topic) => topic.family === family).length]));
  const familyCoverageComplete = REQUIRED_FAMILIES.every((family) => familyCounts[family] > 0) && topics.every((topic) => REQUIRED_FAMILIES.includes(topic.family));
  assert(familyCoverageComplete, 'Kognitiv psykologi mangler en obligatorisk fagfamilie');

  const byTopicId = new Map(topics.map((topic) => [topic.topic_id, topic]));
  const targetedGuardsComplete = Object.entries(REQUIRED_GUARD_TERMS).every(([topicId, patterns]) => {
    const guard = byTopicId.get(topicId)?.misuse_guard || '';
    return patterns.every((pattern) => pattern.test(guard));
  });
  const noMindReadingOrDiagnosisClaims = topics.every((topic) => !/(testen avslorer intelligens|hjernen viser den sanne tanken|kan diagnostiseres fra én oppgave)/i.test(`${topic.definition} ${topic.misuse_guard}`));
  const responsibleInferenceComplete = targetedGuardsComplete && noMindReadingOrDiagnosisClaims;
  assert(responsibleInferenceComplete, 'Kognitiv psykologi mangler bindende vern mot diagnosedragning, minnesikkerhet eller tankelesing');

  assert(branch.completion_contract?.required_topic_count === REQUIRED_TOPICS.length, 'Completion contract må kreve 17 tema');
  assert(isDeepStrictEqual(branch.completion_contract?.required_families, REQUIRED_FAMILIES), 'Completion contract har feil familier');
  assert(branch.completion_contract?.no_cognitive_diagnosis_from_single_task_guard_required === true, 'Completion contract mangler vern mot diagnose fra enkeltoppgave');
  assert(branch.completion_contract?.no_memory_confidence_equals_accuracy_guard_required === true, 'Completion contract mangler vern mot å likestille minnesikkerhet og nøyaktighet');
  assert(branch.completion_contract?.no_brain_or_behavioral_thought_reading_guard_required === true, 'Completion contract mangler vern mot tankelesing');
  assert(branch.summary?.topic_count === REQUIRED_TOPICS.length && branch.summary?.source_count === sources.length, 'Kognitiv-psykologi-summary er utdatert');
  assert(isDeepStrictEqual(branch.summary?.family_counts, familyCounts), 'Kognitiv-psykologi-family summary er utdatert');

  const complete = exactCoverage && topicShapeComplete && familyCoverageComplete && responsibleInferenceComplete && sources.length >= 12;
  const report = {
    schema: 'history_go_fagverk_psykologi_cognitive_university_audit_v1',
    version: '1.0.0',
    status: complete ? 'psykologi_cognitive_university_complete' : 'psykologi_cognitive_university_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', branchId: branch.branch_id },
    coverage: { requiredTopicCount: REQUIRED_TOPICS.length, materializedTopicCount: topics.length, exactTopicCoverage: exactCoverage, familyCounts },
    sources: { sourceCount: sources.length, allTopicsSourced: topics.every((topic) => topic.source_ids?.length > 0) },
    gates: {
      exact17TopicCoverage: exactCoverage,
      uniqueTopicIds: uniqueTopicIds.size === REQUIRED_TOPICS.length,
      allTopicsHaveDefinitions: topics.every((topic) => topic.definition?.trim().length >= 80),
      allTopicsHaveLearningOutcomes: topics.every((topic) => (topic.learning_outcomes || []).length >= 2),
      allTopicsHaveCriticalDistinctions: topics.every((topic) => (topic.key_distinctions || []).length >= 2),
      allTopicsHaveMisuseGuards: topics.every((topic) => topic.misuse_guard?.trim().length >= 80),
      allTopicsHaveResolvedSources: topics.every((topic) => (topic.source_ids || []).length >= 1 && topic.source_ids.every((id) => sourceIds.has(id))),
      allRequiredFamiliesCovered: familyCoverageComplete,
      minimumSourceBaseMet: sources.length >= 12,
      singleTaskDiagnosisGuardPresent: responsibleInferenceComplete,
      memoryConfidenceAccuracyGuardPresent: REQUIRED_GUARD_TERMS.rekonstruktiv_hukommelse_kildekontroll_og_feilminner.every((pattern) => pattern.test(byTopicId.get('rekonstruktiv_hukommelse_kildekontroll_og_feilminner')?.misuse_guard || '')),
      behavioralAndBrainThoughtReadingGuardPresent: REQUIRED_GUARD_TERMS.metakognisjon_kognitive_modeller_og_forskningsmetoder.every((pattern) => pattern.test(byTopicId.get('metakognisjon_kognitive_modeller_og_forskningsmetoder')?.misuse_guard || ''))
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
    const { report } = auditPsykologiCognitiveUniversity({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi kognitiv psykologi universitet OK: ${report.coverage.materializedTopicCount}/17 tema, ${report.sources.sourceCount} kilder, complete=${report.complete}.`);
  } catch (error) {
    console.error(`Psykologi kognitiv psykologi universitet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
