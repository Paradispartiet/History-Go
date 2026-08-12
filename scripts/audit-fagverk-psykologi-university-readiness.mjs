#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditPsykologiBiologicalUniversity } from './audit-fagverk-psykologi-biological-university.mjs';
import { auditPsykologiCognitiveUniversity } from './audit-fagverk-psykologi-cognitive-university.mjs';
import { auditPsykologiDevelopmentalUniversity } from './audit-fagverk-psykologi-developmental-university.mjs';
import { auditPsykologiSocialUniversity } from './audit-fagverk-psykologi-social-university.mjs';
import { auditPsykologiPersonalityUniversity } from './audit-fagverk-psykologi-personality-university.mjs';
import { auditPsykologiHistoryScienceTheoryUniversity } from './audit-fagverk-psykologi-history-science-theory-university.mjs';
import { auditPsykologiMethodsStatisticsUniversity } from './audit-fagverk-psykologi-methods-statistics-university.mjs';
import { auditPsykologiMentalHealthTopicArticles, clinicalSafetyReviewApproved, clinicalTextHasNoDirectives } from './audit-fagverk-psykologi-topic-articles-mental-health-v1.mjs';
import { auditPsykologiUniversityCompletion } from './audit-fagverk-psykologi-university-completion-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEXT_GATE = 'university_matrix_topic_articles_concept_registry_and_methods';
const P = Object.freeze({
  matrix: 'data/fag/psykologi/psykologi_university_readiness_v1.json',
  biologicalPsychology: 'data/fag/psykologi/biologisk_psykologi_university_v1.json',
  cognitivePsychology: 'data/fag/psykologi/kognitiv_psykologi_university_v1.json',
  developmentalPsychology: 'data/fag/psykologi/utviklingspsykologi_university_v1.json',
  socialPsychology: 'data/fag/psykologi/sosialpsykologi_university_v1.json',
  personalityPsychology: 'data/fag/psykologi/personlighetspsykologi_university_v1.json',
  historyScienceTheory: 'data/fag/psykologi/psykologiens_historie_vitenskapsteori_university_v1.json',
  methodsStatistics: 'data/fag/psykologi/metode_statistikk_psykologi_university_v1.json',
  canonicalMethods: 'data/fag/psykologi/methods_psykologi_canonical_v4_5.json',
  pensum: 'data/fag/psykologi/psykologipensum_canonical_v4_5.json',
  emner: 'data/fag/psykologi/emner_psykologi_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  sourceRegistry: 'data/fag/psykologi/kilder_psykologi_canonical_v1.json',
  articleDir: 'data/fagverk/psykologi/emneartikler',
  concepts: 'data/fag/psykologi/begreper_psykologi_canonical_v1.json',
  appliedFields: 'data/fag/psykologi/anvendte_fagfelt_psykologi_university_v1.json',
  report: 'reports/fagverk/psykologi-university-readiness-audit.json'
});
const REQUIRED_CORE = [
  'biological_psychology','cognitive_psychology','developmental_psychology','social_psychology',
  'personality_psychology','history_science_theory','research_methods_statistics'
];
const REQUIRED_METHOD_TOPICS = [
  'eksperimentelt_design','observasjon','korrelasjon','longitudinelt_design','tverrsnittdesign','kvalitativ_metode',
  'utvalg_og_representativitet','operasjonalisering','reliabilitet','validitet','deskriptiv_statistikk','statistisk_inferens',
  'hypotesetesting','effektstorrelse','konfidensintervall_og_usikkerhet','regresjon','kausalitet_og_konfundering',
  'replikasjon','apen_vitenskap','forskningsetikk'
];
const REQUIRED_BIOLOGICAL_TOPICS = [
  'nerveceller_og_glia','aksjonspotensial_og_synaptisk_kommunikasjon','sentralt_og_perifert_nervesystem',
  'hjernens_systemer_og_nettverk','nevral_utvikling_og_plastisitet','genetikk_arvelighet_og_polygenisitet',
  'gen_miljo_og_epigenetikk','hormoner_og_nevroendokrin_regulering','sanser_og_transduksjon',
  'sovn_og_dognrytmer','homeostase_motivasjon_og_belonning','stress_foleser_og_kroppslig_regulering',
  'psykofarmakologi_og_nevrotransmittersystemer','biologiske_forskningsmetoder','forklaringsnivaer_kausalitet_og_nevroetikk'
];
const REQUIRED_COGNITIVE_TOPICS = [
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
const REQUIRED_DEVELOPMENTAL_TOPICS = [
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
const REQUIRED_SOCIAL_TOPICS = [
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
const REQUIRED_PERSONALITY_TOPICS = [
  'personlighet_trekk_og_individforskjeller','big_five_og_hierarkiske_trekkmodeller',
  'alternative_trekkmodeller_og_hexaco','dynamiske_humanistiske_og_narrative_perspektiver',
  'person_situasjon_og_atferdsvariasjon','rangordensstabilitet_og_gjennomsnittsendring',
  'personlighetsutvikling_i_livslopet','identitet_selv_og_personlighet',
  'biologiske_og_genetiske_perspektiver','sosial_laring_mal_og_karakteristiske_tilpasninger',
  'kultur_kontekst_og_personlighetsuttrykk','krysskulturell_ekvivalens_og_mangfold',
  'selvrapport_informantrapport_og_atferdsdata','reliabilitet_validitet_og_maleinvarians',
  'prediksjon_av_utfall_og_usikkerhet','modellkritikk_etikk_og_typestempling'
];
const REQUIRED_HISTORY_SCIENCE_THEORY_TOPICS = [
  'filosofiske_medisinske_og_fysiologiske_forlopere','psykofysikk_eksperiment_og_laboratoriets_institusjonalisering',
  'evolusjon_funksjonalisme_og_individforskjeller','profesjonalisering_klinisk_og_anvendt_psykologi',
  'psykologi_i_norge_utdanning_institusjoner_og_profesjon','strukturalisme_introspeksjon_og_gestaltpsykologi',
  'psykoanalyse_psykodynamikk_og_fortolkning','behaviorisme_laring_og_observerbar_atferd',
  'den_kognitive_vendingen_informasjon_og_representasjon','humanistisk_sosial_kulturell_og_kritisk_psykologi',
  'teorier_modeller_paradigmer_og_forskningsprogrammer','forklaringsnivaer_mekanismer_reduksjonisme_og_pluralisme',
  'psykologiske_konstrukter_operasjonalisering_og_validitet','kausalitet_sannsynlighet_prediksjon_og_forklaring',
  'objektivitet_verdier_refleksivitet_og_situert_kunnskap','kvantitative_kvalitative_og_blandede_metoder',
  'observasjon_teoriladet_evidens_falsifikasjon_og_bekreftelse','replikasjon_apen_vitenskap_og_kumulativ_evidens',
  'forskningsetikk_profesjonsetikk_klassifikasjon_og_makt','historiografi_presentisme_kontekst_mangfold_og_kildekritikk'
];
const REQUIRED_SOURCE_DOCUMENTS = [
  'data/fagverk/psykologi/fagtradisjoner-teori-og-sinnet/claims.json',
  'data/fagverk/psykologi/kognisjon-folelser-og-atferd/claims.json',
  'data/fagverk/psykologi/psykisk-helse-institusjoner-og-behandling/claims.json',
  'data/fagverk/psykologi/sosialpsykologi-normalitet-og-stigma/claims.json',
  'data/fagverk/psykologi/traume-krise-resiliens-og-omsorg/claims.json',
  'data/fagverk/psykologi/utvikling-oppvekst-og-laring/claims.json'
];
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function listJson(relativeDir) {
  const dir = abs(relativeDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith('.json')).sort().map((file) => `${relativeDir}/${file}`);
}

function fieldIsMaterialized(value) {
  return Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : value != null;
}

export function sourceIsInspectable(source, requiredFields) {
  if (!requiredFields.every((field) => fieldIsMaterialized(source[field]))) return false;
  if (source.type === 'internal_place_record') {
    return typeof source.url === 'string' && source.url.startsWith('data/') && fs.existsSync(abs(source.url));
  }
  return typeof source.url === 'string' && /^https:\/\//.test(source.url);
}

export function validatedSourceIndex(registrations, requiredFields) {
  assert(registrations.every((source) => fieldIsMaterialized(source?.id)), 'Kilderegisteret har en registrering uten id');
  const byId = new Map();
  const conflictingIds = new Set();
  for (const source of registrations) {
    const previous = byId.get(source.id);
    if (previous && ['publisher','title','url','type'].some((field) => previous[field] !== source[field])) conflictingIds.add(source.id);
    if (!previous) byId.set(source.id, source);
  }
  const validIds = new Set([...byId].filter(([, source]) => sourceIsInspectable(source, requiredFields)).map(([id]) => id));
  assert(conflictingIds.size === 0, `Kilderegisteret har motstridende metadata for: ${[...conflictingIds].sort().join(', ')}`);
  assert(validIds.size === byId.size, `Kilderegisteret har ${byId.size - validIds.size} ufullstendige eller ikke-inspiserbare kilder`);
  return { registeredCount: byId.size, validIds };
}

function sourceRegistry(contract) {
  assert(contract.path === P.sourceRegistry, 'University-readiness peker til feil kilderegister');
  assert(fs.existsSync(abs(contract.path)), `Mangler ${contract.path}`);
  const registry = read(contract.path);
  assert(registry.schema === 'history_go_psykologi_source_registry_v1', 'Feil Psykologi-kilderegisterschema');
  assert(isDeepStrictEqual([...(registry.source_documents || [])].sort(), [...REQUIRED_SOURCE_DOCUMENTS].sort()), 'Psykologi-kilderegisteret må binde eksakt de seks kapittelregistrene');
  assert(Array.isArray(registry.sources), 'Psykologi-kilderegisteret mangler sources');

  const registrations = [...registry.sources];
  const validClaimIds = new Set();
  for (const file of registry.source_documents) {
    assert(fs.existsSync(abs(file)), `Kilderegisteret peker til manglende dokument: ${file}`);
    const document = read(file);
    assert(Array.isArray(document.sources), `${file} mangler sources`);
    assert(Array.isArray(document.claims), `${file} mangler claims`);
    registrations.push(...document.sources);
    for (const claim of document.claims) if (fieldIsMaterialized(claim.id)) validClaimIds.add(claim.id);
  }

  return { ...validatedSourceIndex(registrations, contract.required_source_fields), validClaimIds };
}

export function sourceIdsResolve(sourceIds, validSourceIds) {
  return Array.isArray(sourceIds) && sourceIds.length > 0 && sourceIds.every((id) => typeof id === 'string' && validSourceIds.has(id));
}

export function sourcedDocumentCoverage(documents, { requiredIds, idField, requiredFields, validSourceIds }) {
  const valid = new Set();
  let invalidSourceReferenceCount = 0;
  for (const document of documents) {
    const id = document[idField];
    if (!requiredIds.has(id)) continue;
    const fieldsComplete = requiredFields.every((field) => fieldIsMaterialized(document[field]));
    const sourcesResolve = sourceIdsResolve(document.source_ids, validSourceIds);
    if (fieldsComplete && !sourcesResolve) invalidSourceReferenceCount += 1;
    if (fieldsComplete && sourcesResolve) valid.add(id);
  }
  return { validIds: [...valid].sort(), completeCount: valid.size, invalidSourceReferenceCount };
}

const editorialWordCount = (value) => {
  if (typeof value === 'string') return value.trim() ? value.trim().split(/\s+/).length : 0;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + editorialWordCount(item), 0);
  if (value && typeof value === 'object') return Object.values(value).reduce((sum, item) => sum + editorialWordCount(item), 0);
  return 0;
};

export function topicArticlePassesQualityContract(document, contract, validSourceIds, validClaimIds) {
  const fieldsComplete = [...contract.required_fields, ...contract.required_quality_fields].every((field) => fieldIsMaterialized(document[field]));
  const identityComplete = document.schema === contract.article_schema && document.article_status === contract.article_status_required;
  const sourcesResolve = sourceIdsResolve(document.source_ids, validSourceIds);
  const claimsResolve = Array.isArray(document.claim_ids) && document.claim_ids.length >= 3 && document.claim_ids.every((id) => validClaimIds.has(id));
  const sectionSourcesResolve = ['theories_and_findings','examples','models_or_researchers'].every((field) =>
    Array.isArray(document[field]) && document[field].every((item) => sourceIdsResolve(item.source_ids, validSourceIds) && item.source_ids.every((id) => document.source_ids.includes(id)))
  );
  const wordDepthMet = editorialWordCount({
    definition: document.definition,
    background: document.background,
    theories_and_findings: document.theories_and_findings,
    methods: document.methods,
    boundaries_and_disagreements: document.boundaries_and_disagreements,
    examples: document.examples,
    learning_outcomes: document.learning_outcomes,
    key_questions: document.key_questions,
    models_or_researchers: document.models_or_researchers,
    misuse_guard: document.misuse_guard
  }) >= contract.minimum_editorial_words_per_article;
  const templateTextAbsent = !/emnet studerer .* som psykologisk inngang til konkrete institusjoner/i.test(JSON.stringify(document));
  const clinicalSafetyMet = clinicalSafetyReviewApproved(document) && clinicalTextHasNoDirectives(document);
  return fieldsComplete && identityComplete && sourcesResolve && claimsResolve && sectionSourcesResolve && wordDepthMet && templateTextAbsent && clinicalSafetyMet;
}

function topicArticleCoverage(canonicalIds, contract, validSourceIds, validClaimIds) {
  const files = listJson(contract.directory);
  const valid = new Set();
  let invalidSourceReferenceCount = 0;
  for (const document of files.map(read)) {
    if (!canonicalIds.has(document.emne_id)) continue;
    const topLevelSourcesResolve = sourceIdsResolve(document.source_ids, validSourceIds);
    if (!topLevelSourcesResolve) invalidSourceReferenceCount += 1;
    if (topicArticlePassesQualityContract(document, contract, validSourceIds, validClaimIds)) valid.add(document.emne_id);
  }
  return { files, validIds: [...valid].sort(), completeCount: valid.size, invalidSourceReferenceCount };
}

function conceptCoverage(contract, validSourceIds, canonicalEmners) {
  if (!fs.existsSync(abs(contract.path))) return { exists: false, conceptCount: 0, materializedCount: 0, invalidSourceReferenceCount: 0 };
  const doc = read(contract.path);
  const concepts = Array.isArray(doc) ? doc : (doc.concepts || []);
  const expectedTerms = [...new Set(canonicalEmners.flatMap((emne) => emne[contract.canonical_source_field] || []))].sort((a, b) => a.localeCompare(b, 'nb'));
  const actualTerms = concepts.map((concept) => concept.canonical_term).sort((a, b) => a.localeCompare(b, 'nb'));
  const exactCanonicalTermCoverage = isDeepStrictEqual(actualTerms, expectedTerms) && new Set(concepts.map((concept) => concept.concept_id)).size === concepts.length;
  const coverage = sourcedDocumentCoverage(concepts, {
    requiredIds: new Set(concepts.map((concept) => concept.concept_id).filter(Boolean)),
    idField: 'concept_id',
    requiredFields: contract.required_fields,
    validSourceIds
  });
  const relatedIdsResolve = concepts.every((concept) => (concept.related_concept_ids || []).every((id) => concepts.some((candidate) => candidate.concept_id === id) && id !== concept.concept_id));
  const sourceEmnersResolve = concepts.every((concept) => concept.source_emne_ids?.length && concept.source_emne_ids.every((id) => canonicalEmners.some((emne) => emne.emne_id === id)));
  return { exists: true, expectedCount: expectedTerms.length, conceptCount: concepts.length, materializedCount: coverage.completeCount, invalidSourceReferenceCount: coverage.invalidSourceReferenceCount, exactCanonicalTermCoverage, relatedIdsResolve, sourceEmnersResolve };
}

function appliedFieldCoverage(contract, matrixRows, canonicalEmneIds, methodIds, coreAreaIds, validSourceIds, validClaimIds) {
  if (!fs.existsSync(abs(contract.path))) return { exists:false, fieldCount:0, completeCount:0, areaIds:[] };
  const doc = read(contract.path);
  const fields = doc.fields || [];
  const expectedAreaIds = matrixRows.map((row) => row.area_id);
  const completeFields = fields.filter((field) =>
    field.status === 'complete' &&
    field.editorial_review?.status === contract.editorial_review_status_required &&
    field.emne_ids?.length >= 6 && field.emne_ids.every((id) => canonicalEmneIds.has(id)) &&
    field.method_ids?.length >= 4 && field.method_ids.every((id) => methodIds.has(id)) &&
    field.university_area_ids?.length >= 3 && field.university_area_ids.every((id) => coreAreaIds.has(id)) &&
    field.source_ids?.length >= 3 && field.source_ids.every((id) => validSourceIds.has(id)) &&
    field.claim_ids?.length >= 3 && field.claim_ids.every((id) => validClaimIds.has(id)) &&
    field.coverage_statement?.trim().length >= 180 && field.limitations_and_ethics?.trim().length >= 220 && field.practice_questions?.length >= 3
  );
  const areaIds = fields.map((field) => field.area_id);
  const exactAreaCoverage = isDeepStrictEqual(areaIds, expectedAreaIds);
  return { exists:true, fieldCount:fields.length, completeCount:completeFields.length, areaIds, exactAreaCoverage };
}

export function expectedSubjectState(completeReady, contract) {
  return completeReady
    ? { editorialStatus: contract.final_editorial_status, nextGate: contract.final_next_gate, matrixStatus: contract.final_matrix_status }
    : { editorialStatus: contract.required_editorial_status_before_final_gate, nextGate: contract.next_gate, matrixStatus: 'expansion_required_before_complete' };
}

const projection = (report) => ({
  schema: report.schema,
  version: report.version,
  status: report.status,
  generatedFrom: report.generatedFrom,
  subject: report.subject,
  baseline: report.baseline,
  universityCore: report.universityCore,
  biologicalPsychology: report.biologicalPsychology,
  cognitivePsychology: report.cognitivePsychology,
  developmentalPsychology: report.developmentalPsychology,
  socialPsychology: report.socialPsychology,
  personalityPsychology: report.personalityPsychology,
  historyScienceTheory: report.historyScienceTheory,
  methodsStatistics: report.methodsStatistics,
  topicArticles: report.topicArticles,
  concepts: report.concepts,
  sourceRegistry: report.sourceRegistry,
  appliedFields: report.appliedFields,
  blockersToComplete: report.blockersToComplete,
  currentGates: report.currentGates,
  completionGates: report.completionGates,
  completeReady: report.completeReady
});

export function auditPsykologiUniversityReadiness({ writeReport = false, checkReport = true } = {}) {
  for (const file of [P.matrix, P.biologicalPsychology, P.cognitivePsychology, P.developmentalPsychology, P.socialPsychology, P.personalityPsychology, P.historyScienceTheory, P.methodsStatistics, P.canonicalMethods, P.pensum, P.emner, P.registry, P.status, P.concepts, P.appliedFields]) assert(fs.existsSync(abs(file)), `Mangler ${file}`);
  const matrix = read(P.matrix);
  const pensum = read(P.pensum);
  const emner = read(P.emner);
  const canonicalMethods = read(P.canonicalMethods);
  const registry = read(P.registry);
  const status = read(P.status);
  const statusEntry = status.subjects.find((row) => row.id === 'psykologi');
  const registrySubject = registry.subjects?.psykologi;

  assert(matrix.schema === 'history_go_psykologi_university_readiness_v1', 'Feil university-readiness schema');
  assert(matrix.subject_id === 'psykologi', 'University-readiness peker til feil fag');
  assert(matrix.authoritative_sources?.length >= 3, 'University-readiness mangler autoritative program-/retningslinjekilder');
  assert(matrix.authoritative_sources.every((source) => source.publisher && source.title && /^https:\/\//.test(source.url) && source.verified_at), 'University-readiness har ufullstendig kildemetadata');

  const canonicalEmneIds = new Set(pensum.domains.flatMap((domain) => domain.emne_ids || []));
  assert(pensum.summary.domain_count === 6 && pensum.summary.emne_count === 58 && pensum.summary.method_count === 58, 'Canonical Psykologi-baseline er ikke 6/58/58');
  assert(canonicalEmneIds.size === 58 && emner.length === 58 && new Set(emner.map((row) => row.emne_id)).size === 58, 'Canonical emnebaseline må ha 58 unike emner');
  assert(registrySubject?.chapters?.length === 6, 'University-readiness krever bevart sekskapitlers baseline');
  assert(statusEntry?.navigationStatus === 'materialized' && statusEntry?.assessmentStatus === 'audited', 'Psykologi mistet materialized/audited status');
  assert(matrix.completion_contract?.next_gate === NEXT_GATE, 'University-readiness har feil aktiv universitetsport');

  const coreRows = matrix.university_core_matrix || [];
  const coreById = new Map(coreRows.map((row) => [row.area_id, row]));
  assert(coreRows.length === REQUIRED_CORE.length && REQUIRED_CORE.every((id) => coreById.has(id)), 'Universitetsmatrisen dekker ikke alle obligatoriske basalområder/metodespor');
  assert(coreRows.every((row) => row.required === true && row.current_status && row.completion_requirement), 'Et obligatorisk universitetsområde mangler status eller sluttkrav');
  assert(isDeepStrictEqual(matrix.required_biological_psychology_topics, REQUIRED_BIOLOGICAL_TOPICS), 'Biologisk-psykologi-matrisen avviker fra bindende minimum');
  assert(isDeepStrictEqual(matrix.required_cognitive_psychology_topics, REQUIRED_COGNITIVE_TOPICS), 'Kognitiv-psykologi-matrisen avviker fra bindende minimum');
  assert(isDeepStrictEqual(matrix.required_developmental_psychology_topics, REQUIRED_DEVELOPMENTAL_TOPICS), 'Utviklingspsykologi-matrisen avviker fra bindende minimum');
  assert(isDeepStrictEqual(matrix.required_social_psychology_topics, REQUIRED_SOCIAL_TOPICS), 'Sosialpsykologi-matrisen avviker fra bindende minimum');
  assert(isDeepStrictEqual(matrix.required_personality_psychology_topics, REQUIRED_PERSONALITY_TOPICS), 'Personlighetspsykologi-matrisen avviker fra bindende minimum');
  assert(isDeepStrictEqual(matrix.required_history_science_theory_topics, REQUIRED_HISTORY_SCIENCE_THEORY_TOPICS), 'Historie-/vitenskapsteori-matrisen avviker fra bindende minimum');
  assert(isDeepStrictEqual(matrix.required_methods_statistics_topics, REQUIRED_METHOD_TOPICS), 'Metode-/statistikkmatrisen avviker fra bindende minimum');
  assert(matrix.source_registry_contract?.all_source_ids_must_resolve === true, 'Kildekontrakten må kreve at alle source_ids løses');
  assert(matrix.topic_article_contract?.directory === P.articleDir, 'Emneartikkelkontrakten peker til feil katalog');
  assert(matrix.topic_article_contract?.article_schema === 'history_go_psykologi_topic_article_v1', 'Emneartikkelkontrakten må låse canonicalt artikkelskjema');
  assert(matrix.topic_article_contract?.article_status_required === 'complete', 'Emneartikkelkontrakten må kreve complete per artikkel');
  assert(matrix.topic_article_contract?.minimum_editorial_words_per_article === 550, 'Emneartikkelkontrakten må kreve minst 550 redaksjonelle ord');
  assert(matrix.topic_article_contract?.editorial_review_status_required === 'approved_non_clinical_educational_use', 'Emneartikkelkontrakten må kreve godkjent klinisk sikkerhetsreview');
  assert(matrix.topic_article_contract?.all_claim_ids_must_resolve === true, 'Emneartikkelkontrakten må kreve løste claim-ID-er');
  assert(matrix.topic_article_contract?.all_section_source_ids_must_resolve === true, 'Emneartikkelkontrakten må kreve løste seksjonskilder');
  assert(matrix.topic_article_contract?.generic_template_text_forbidden === true, 'Emneartikkelkontrakten må forby generisk maltekst');
  assert(matrix.topic_article_contract?.no_clinical_diagnostic_treatment_or_coercion_overreach_required === true, 'Emneartikkelkontrakten må kreve vern mot klinisk overreach');
  assert(matrix.topic_article_contract?.aha_runtime_activation_requires_separate_review === true, 'AHA-aktivering må kreve separat fagreview');
  assert(matrix.concept_registry_contract?.path === P.concepts, 'Begrepskontrakten peker til feil register');
  assert(matrix.concept_registry_contract?.canonical_source_field === 'core_concepts', 'Begrepskontrakten må eie canonicale core_concepts');
  assert(matrix.concept_registry_contract?.expected_unique_concept_count === 136, 'Begrepskontrakten må låse 136 eksakte canonicaltermer');
  assert(matrix.concept_registry_contract?.exact_canonical_term_coverage_required === true, 'Begrepskontrakten må kreve eksakt termdekning');
  assert(matrix.applied_field_contract?.path === P.appliedFields && matrix.applied_field_contract?.required_field_count === 6, 'Anvendt-fagfeltkontrakten peker til feil artefakt eller antall');
  assert(matrix.applied_field_contract?.all_emne_method_source_and_claim_ids_must_resolve === true, 'Anvendt-fagfeltkontrakten må kreve løste ID-er');

  const biologicalBranch = auditPsykologiBiologicalUniversity({ writeReport: false, checkReport: false }).report;
  assert(biologicalBranch.complete, 'University-readiness krever grønn biologisk-psykologi-audit');
  assert(coreById.get('biological_psychology')?.current_artifact === P.biologicalPsychology, 'University-matrisen peker ikke til materialisert biologisk-psykologi-gren');
  const cognitiveBranch = auditPsykologiCognitiveUniversity({ writeReport: false, checkReport: false }).report;
  assert(cognitiveBranch.complete, 'University-readiness krever grønn kognitiv-psykologi-audit');
  assert(coreById.get('cognitive_psychology')?.current_artifact === P.cognitivePsychology, 'University-matrisen peker ikke til materialisert kognitiv-psykologi-gren');
  const developmentalBranch = auditPsykologiDevelopmentalUniversity({ writeReport: false, checkReport: false }).report;
  assert(developmentalBranch.complete, 'University-readiness krever grønn utviklingspsykologi-audit');
  assert(coreById.get('developmental_psychology')?.current_artifact === P.developmentalPsychology, 'University-matrisen peker ikke til materialisert utviklingspsykologi-gren');
  const socialBranch = auditPsykologiSocialUniversity({ writeReport: false, checkReport: false }).report;
  assert(socialBranch.complete, 'University-readiness krever grønn sosialpsykologi-audit');
  assert(coreById.get('social_psychology')?.current_artifact === P.socialPsychology, 'University-matrisen peker ikke til materialisert sosialpsykologi-gren');
  const personalityBranch = auditPsykologiPersonalityUniversity({ writeReport: false, checkReport: false }).report;
  assert(personalityBranch.complete, 'University-readiness krever grønn personlighetspsykologi-audit');
  assert(coreById.get('personality_psychology')?.current_artifact === P.personalityPsychology, 'University-matrisen peker ikke til materialisert personlighetspsykologi-gren');
  const historyScienceTheoryBranch = auditPsykologiHistoryScienceTheoryUniversity({ writeReport: false, checkReport: false }).report;
  assert(historyScienceTheoryBranch.complete, 'University-readiness krever grønn historie-/vitenskapsteori-audit');
  assert(coreById.get('history_science_theory')?.current_artifact === P.historyScienceTheory, 'University-matrisen peker ikke til materialisert historie-/vitenskapsteori-gren');
  const methodsBranch = auditPsykologiMethodsStatisticsUniversity({ writeReport: false, checkReport: false }).report;
  assert(methodsBranch.complete, 'University-readiness krever grønn metode/statistikk-audit');
  assert(coreById.get('research_methods_statistics')?.current_artifact === P.methodsStatistics, 'University-matrisen peker ikke til materialisert metode/statistikkgren');

  const sourceRegistryResult = sourceRegistry(matrix.source_registry_contract);
  const articleCoverage = topicArticleCoverage(canonicalEmneIds, matrix.topic_article_contract, sourceRegistryResult.validIds, sourceRegistryResult.validClaimIds);
  const mentalHealthTopicArticles = auditPsykologiMentalHealthTopicArticles({ writeReport: false, checkReport: false }).report;
  assert(mentalHealthTopicArticles.complete, 'University-readiness krever grønn audit av de 12 mental-health-emneartiklene');
  const completionAudit = auditPsykologiUniversityCompletion({ writeReport: false, checkReport: false }).report;
  assert(completionAudit.complete, 'University-readiness krever grønn fullaudit av 58 artikler, begreper og anvendte fagfelt');
  const conceptCoverageResult = conceptCoverage(matrix.concept_registry_contract, sourceRegistryResult.validIds, emner);
  const coreComplete = coreRows.every((row) => row.current_status === 'complete');
  const biologicalComplete = coreById.get('biological_psychology')?.current_status === 'complete' && biologicalBranch.complete;
  const cognitiveComplete = coreById.get('cognitive_psychology')?.current_status === 'complete' && cognitiveBranch.complete;
  const developmentalComplete = coreById.get('developmental_psychology')?.current_status === 'complete' && developmentalBranch.complete;
  const socialComplete = coreById.get('social_psychology')?.current_status === 'complete' && socialBranch.complete;
  const personalityComplete = coreById.get('personality_psychology')?.current_status === 'complete' && personalityBranch.complete;
  const historyScienceTheoryComplete = coreById.get('history_science_theory')?.current_status === 'complete' && historyScienceTheoryBranch.complete;
  const methodsComplete = coreById.get('research_methods_statistics')?.current_status === 'complete' && methodsBranch.complete;
  const topicArticlesComplete = articleCoverage.completeCount === 58;
  const conceptsComplete = conceptCoverageResult.exists && conceptCoverageResult.expectedCount === matrix.concept_registry_contract.expected_unique_concept_count && conceptCoverageResult.conceptCount === conceptCoverageResult.expectedCount && conceptCoverageResult.materializedCount === conceptCoverageResult.conceptCount && conceptCoverageResult.exactCanonicalTermCoverage && conceptCoverageResult.relatedIdsResolve && conceptCoverageResult.sourceEmnersResolve;
  const appliedRows = matrix.applied_field_matrix || [];
  const appliedCoverageResult = appliedFieldCoverage(matrix.applied_field_contract, appliedRows, canonicalEmneIds, new Set(canonicalMethods.methods.map((method) => method.method_id)), new Set(coreRows.map((row) => row.area_id)), sourceRegistryResult.validIds, sourceRegistryResult.validClaimIds);
  const appliedComplete = appliedRows.length === 6 && appliedRows.every((row) => row.current_status === 'complete' && row.current_artifact === P.appliedFields) && appliedCoverageResult.exists && appliedCoverageResult.exactAreaCoverage && appliedCoverageResult.completeCount === 6;
  const completeReady = coreComplete && biologicalComplete && cognitiveComplete && developmentalComplete && socialComplete && personalityComplete && historyScienceTheoryComplete && methodsComplete && topicArticlesComplete && conceptsComplete && appliedComplete;
  const expectedState = expectedSubjectState(completeReady, matrix.completion_contract);

  assert(matrix.status === expectedState.matrixStatus, `University-readiness status må være ${expectedState.matrixStatus}`);
  assert(statusEntry?.editorialStatus === expectedState.editorialStatus, `Psykologi editorialStatus må være ${expectedState.editorialStatus}`);
  assert(statusEntry?.nextGate === expectedState.nextGate, `Psykologi nextGate må være ${expectedState.nextGate}`);
  assert(registrySubject?.editorialPlan?.nextGate === expectedState.nextGate, `Registry nextGate må være ${expectedState.nextGate}`);

  const blockersToComplete = [];
  for (const row of coreRows.filter((row) => row.current_status !== 'complete')) blockersToComplete.push(`university_core:${row.area_id}:${row.current_status}`);
  if (!topicArticlesComplete) blockersToComplete.push(`standalone_topic_articles:${articleCoverage.completeCount}/58`);
  if (!conceptsComplete) blockersToComplete.push(`canonical_concept_registry:${conceptCoverageResult.materializedCount}/${conceptCoverageResult.conceptCount || 0}`);
  for (const row of appliedRows.filter((row) => row.current_status !== 'complete')) blockersToComplete.push(`applied_field:${row.area_id}:${row.current_status}`);

  const report = {
    schema: 'history_go_fagverk_psykologi_university_readiness_audit_v1',
    version: '2.0.0',
    status: completeReady ? 'psykologi_university_ready_for_complete' : 'psykologi_university_readiness_in_progress',
    generatedFrom: P,
    subject: { id: 'psykologi', editorialStatus: statusEntry.editorialStatus, nextGate: statusEntry.nextGate, registeredChapterCount: registrySubject.chapters.length },
    baseline: { domainCount: 6, emneCount: 58, methodCount: 58, chapterCount: 6, interpretation: matrix.canonical_baseline.interpretation },
    universityCore: coreRows.map((row) => ({ areaId: row.area_id, label: row.label, status: row.current_status })),
    biologicalPsychology: {
      requiredTopicCount: REQUIRED_BIOLOGICAL_TOPICS.length,
      materializedTopicCount: biologicalBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_BIOLOGICAL_TOPICS,
      sourceCount: biologicalBranch.sources.sourceCount,
      familyCounts: biologicalBranch.coverage.familyCounts,
      auditComplete: biologicalBranch.complete,
      complete: biologicalComplete
    },
    cognitivePsychology: {
      requiredTopicCount: REQUIRED_COGNITIVE_TOPICS.length,
      materializedTopicCount: cognitiveBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_COGNITIVE_TOPICS,
      sourceCount: cognitiveBranch.sources.sourceCount,
      familyCounts: cognitiveBranch.coverage.familyCounts,
      auditComplete: cognitiveBranch.complete,
      complete: cognitiveComplete
    },
    developmentalPsychology: {
      requiredTopicCount: REQUIRED_DEVELOPMENTAL_TOPICS.length,
      materializedTopicCount: developmentalBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_DEVELOPMENTAL_TOPICS,
      sourceCount: developmentalBranch.sources.sourceCount,
      familyCounts: developmentalBranch.coverage.familyCounts,
      auditComplete: developmentalBranch.complete,
      complete: developmentalComplete
    },
    socialPsychology: {
      requiredTopicCount: REQUIRED_SOCIAL_TOPICS.length,
      materializedTopicCount: socialBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_SOCIAL_TOPICS,
      sourceCount: socialBranch.sources.sourceCount,
      familyCounts: socialBranch.coverage.familyCounts,
      auditComplete: socialBranch.complete,
      complete: socialComplete
    },
    personalityPsychology: {
      requiredTopicCount: REQUIRED_PERSONALITY_TOPICS.length,
      materializedTopicCount: personalityBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_PERSONALITY_TOPICS,
      sourceCount: personalityBranch.sources.sourceCount,
      familyCounts: personalityBranch.coverage.familyCounts,
      auditComplete: personalityBranch.complete,
      complete: personalityComplete
    },
    historyScienceTheory: {
      requiredTopicCount: REQUIRED_HISTORY_SCIENCE_THEORY_TOPICS.length,
      materializedTopicCount: historyScienceTheoryBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_HISTORY_SCIENCE_THEORY_TOPICS,
      sourceCount: historyScienceTheoryBranch.sources.sourceCount,
      familyCounts: historyScienceTheoryBranch.coverage.familyCounts,
      auditComplete: historyScienceTheoryBranch.complete,
      complete: historyScienceTheoryComplete
    },
    methodsStatistics: {
      requiredTopicCount: REQUIRED_METHOD_TOPICS.length,
      materializedTopicCount: methodsBranch.coverage.materializedTopicCount,
      requiredTopics: REQUIRED_METHOD_TOPICS,
      sourceCount: methodsBranch.sources.sourceCount,
      familyCounts: methodsBranch.coverage.familyCounts,
      auditComplete: methodsBranch.complete,
      complete: methodsComplete
    },
    topicArticles: {
      requiredCount: 58,
      completeCount: articleCoverage.completeCount,
      remainingCount: 58 - articleCoverage.completeCount,
      invalidSourceReferenceCount: articleCoverage.invalidSourceReferenceCount,
      auditedBatchCount: 6,
      auditedDomainCount: 6,
      mentalHealthBatch: {
        domainId: mentalHealthTopicArticles.subject.domainId,
        requiredCount: mentalHealthTopicArticles.coverage.requiredArticleCount,
        completeCount: mentalHealthTopicArticles.coverage.materializedArticleCount,
        totalEditorialWordCount: mentalHealthTopicArticles.depth.totalEditorialWordCount,
        auditComplete: mentalHealthTopicArticles.complete
      },
      fullCorpus: {
        requiredCount: completionAudit.articles.requiredCount,
        completeCount: completionAudit.articles.materializedCount,
        totalEditorialWordCount: completionAudit.articles.totalEditorialWordCount,
        auditComplete: completionAudit.complete
      },
      complete: topicArticlesComplete,
      directory: matrix.topic_article_contract.directory
    },
    concepts: {
      registryPath: matrix.concept_registry_contract.path,
      exists: conceptCoverageResult.exists,
      conceptCount: conceptCoverageResult.conceptCount,
      expectedCount: conceptCoverageResult.expectedCount,
      materializedCount: conceptCoverageResult.materializedCount,
      invalidSourceReferenceCount: conceptCoverageResult.invalidSourceReferenceCount,
      exactCanonicalTermCoverage: conceptCoverageResult.exactCanonicalTermCoverage,
      complete: conceptsComplete
    },
    sourceRegistry: { path: matrix.source_registry_contract.path, registeredCount: sourceRegistryResult.registeredCount, validCount: sourceRegistryResult.validIds.size },
    appliedFields: appliedRows.map((row) => ({ areaId: row.area_id, label: row.label, status: row.current_status, artifact: row.current_artifact })),
    blockersToComplete,
    currentGates: {
      canonicalSixDomainBaselineIntact: true,
      all58CanonicalEmnersStillUnique: true,
      sixEditorialChaptersStillRegistered: true,
      authoritativeUniversityMatrixPresent: true,
      fiveCoreAreasHistoryAndMethodsExplicitlyRepresented: true,
      fifteenBiologicalPsychologyCompetenciesPinned: true,
      biologicalPsychologyMaterializedAndAudited: biologicalComplete,
      seventeenCognitivePsychologyCompetenciesPinned: true,
      cognitivePsychologyMaterializedAndAudited: cognitiveComplete,
      twentyDevelopmentalPsychologyCompetenciesPinned: true,
      developmentalPsychologyMaterializedAndAudited: developmentalComplete,
      twentySocialPsychologyCompetenciesPinned: true,
      socialPsychologyMaterializedAndAudited: socialComplete,
      sixteenPersonalityPsychologyCompetenciesPinned: true,
      personalityPsychologyMaterializedAndAudited: personalityComplete,
      twentyHistoryScienceTheoryCompetenciesPinned: true,
      historyScienceTheoryMaterializedAndAudited: historyScienceTheoryComplete,
      twentyMethodsStatisticsCompetenciesPinned: true,
      methodsStatisticsMaterializedAndAudited: methodsComplete,
      firstTwelveStandaloneTopicArticlesMaterializedAndAudited: mentalHealthTopicArticles.complete,
      all58StandaloneTopicArticlesMaterializedAndAudited: completionAudit.complete,
      canonicalConceptRegistryMaterializedAndAudited: conceptsComplete,
      sixAppliedFieldsMaterializedAndAudited: appliedComplete,
      topicArticlesRemainOutsideAhaRuntime: completionAudit.gates.noAhaRuntimeActivation,
      allRegisteredSourcesInspectable: sourceRegistryResult.registeredCount === sourceRegistryResult.validIds.size,
      subjectNotPrematurelyComplete: statusEntry.editorialStatus === expectedState.editorialStatus && statusEntry.nextGate === expectedState.nextGate
    },
    completionGates: {
      allRequiredUniversityCoreAreasComplete: coreComplete,
      biologicalPsychologyBranchComplete: biologicalComplete,
      cognitivePsychologyBranchComplete: cognitiveComplete,
      developmentalPsychologyBranchComplete: developmentalComplete,
      socialPsychologyBranchComplete: socialComplete,
      personalityPsychologyBranchComplete: personalityComplete,
      historyScienceTheoryBranchComplete: historyScienceTheoryComplete,
      researchMethodsStatisticsBranchComplete: methodsComplete,
      all58StandaloneTopicArticlesComplete: topicArticlesComplete,
      canonicalConceptRegistryComplete: conceptsComplete,
      appliedFieldMatrixComplete: appliedComplete
    },
    completeReady
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
    const { report } = auditPsykologiUniversityReadiness({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi university-readiness OK: biologisk ${report.biologicalPsychology.materializedTopicCount}/15; kognitiv ${report.cognitivePsychology.materializedTopicCount}/17; utvikling ${report.developmentalPsychology.materializedTopicCount}/20; sosial ${report.socialPsychology.materializedTopicCount}/20; personlighet ${report.personalityPsychology.materializedTopicCount}/16; historie/vitenskapsteori ${report.historyScienceTheory.materializedTopicCount}/20; metode/statistikk ${report.methodsStatistics.materializedTopicCount}/20; emneartikler ${report.topicArticles.completeCount}/58; completeReady=${report.completeReady}.`);
  } catch (error) {
    console.error(`Psykologi university-readiness FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
