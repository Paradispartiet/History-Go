import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const VALIDATOR_VERSION = '1.0.0';

const REPORT_DIR = 'data/places/historie-production';
const SCHEMA_PATH = 'data/places/regler/historie_place_production_v1.schema.json';
const MANIFEST_PATH = 'data/places/manifest.json';
const EMNER_PATH = 'data/fag/historie/emner_historie_canonical_v4_5.json';
const CLAIMS_PATH = 'data/fag/historie/claims_historie_canonical_v1.json';
const SOURCES_PATH = 'data/fag/historie/sources_historie_canonical_v1.json';
const EVIDENCE_PATH = 'data/fag/historie/place_evidence_historie_v1.json';
const PROFILES_MANIFEST_PATH = 'data/fag/profiles/manifest.json';
const REQUIRED_CASE_REQUIREMENT_IDS = new Set([
  'case_req_his_temporal_sequence',
  'case_req_his_actor_conflict',
  'case_req_his_source_comparison',
  'case_req_his_comparative_scale'
]);
const REQUIRED_GATES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const MANDATORY_GATES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const PRODUCTION_FIELDS = [
  'category',
  'emne_ids',
  'desc',
  'popupDesc',
  'quiz_profile',
  'chronology',
  'stories',
  'story_ids'
];
const PLACE_RELATIONS = new Set([
  'event_site',
  'process_site',
  'event_and_process_site',
  'institution_site',
  'material_trace',
  'memory_site',
  'archaeological_site',
  'landscape_or_area',
  'collection_or_archive',
  'biographical_site'
]);
const TEMPORAL_PRECISIONS = new Set([
  'exact_date',
  'year',
  'year_range',
  'decade',
  'century',
  'period',
  'uncertain'
]);
const TEMPORAL_RELATIONS = new Set([
  'contemporary',
  'near_contemporary',
  'retrospective',
  'modern_synthesis',
  'material_or_undated'
]);
const TOP_LEVEL_KEYS = new Set([
  'schemaVersion',
  'validatorVersion',
  'placeId',
  'placeFile',
  'status',
  'historicalIdentity',
  'historyProfile',
  'historyTopics',
  'sourceReviews',
  'caseRequirements',
  'inferenceGuards',
  'quizOpening',
  'chronologyStories',
  'gates',
  'review'
]);

function repoPath(value) {
  return String(value ?? '').replaceAll('\\', '/');
}

function readJson(root, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asPlaces(raw) {
  if (Array.isArray(raw)) return raw.filter(isObject);
  if (Array.isArray(raw?.places)) return raw.places.filter(isObject);
  return isObject(raw) && raw.id ? [raw] : [];
}

function historyEmneIds(place) {
  return [...new Set((Array.isArray(place?.emne_ids) ? place.emne_ids : [])
    .map(String)
    .filter((id) => id.startsWith('em_his_')))];
}

function isHistoryPlace(place) {
  return place?.category === 'historie' || historyEmneIds(place).length > 0;
}

function sameValue(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function validateAllowedKeys(value, allowed, label, errors) {
  if (!isObject(value)) return;
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) errors.push(`${label} har ukjent felt: ${key}`);
  }
}

function productionFieldsChanged(before, after) {
  if (!before) return true;
  return PRODUCTION_FIELDS.some((field) => !sameValue(before?.[field], after?.[field]));
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(String(value ?? ''))) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function validHttps(value) {
  try {
    const url = new URL(String(value ?? ''));
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function listReportPaths(root) {
  const absolute = path.join(root, REPORT_DIR);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => `${REPORT_DIR}/${entry.name}`)
    .sort();
}

function sourceAtBase(root, base, relativePath) {
  try {
    return execFileSync('git', ['show', `${base}:${relativePath}`], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
  } catch {
    return null;
  }
}

function changedPaths(root, base, head) {
  const output = execFileSync('git', ['diff', '--name-only', `${base}...${head}`], {
    cwd: root,
    encoding: 'utf8'
  });
  return output.split(/\r?\n/u).map((entry) => entry.trim()).filter(Boolean);
}

function manifestPlacePaths(root) {
  const manifest = readJson(root, MANIFEST_PATH);
  return new Set((manifest.files ?? []).map((entry) => repoPath(path.posix.join('data', entry))));
}

export function requiredReportsForChanges(root, paths, base) {
  const canonicalPaths = manifestPlacePaths(root);
  const required = new Map();

  for (const changedPath of paths) {
    if (!canonicalPaths.has(changedPath) || !fs.existsSync(path.join(root, changedPath))) continue;

    const currentPlaces = asPlaces(readJson(root, changedPath));
    const previousSource = sourceAtBase(root, base, changedPath);
    const previousPlaces = previousSource ? asPlaces(JSON.parse(previousSource)) : [];
    const previousById = new Map(previousPlaces.map((place) => [String(place.id), place]));

    for (const place of currentPlaces) {
      if (!isHistoryPlace(place)) continue;
      const placeId = String(place.id ?? '');
      if (!placeId || !productionFieldsChanged(previousById.get(placeId), place)) continue;
      required.set(placeId, {
        place,
        placeFile: changedPath,
        reportPath: `${REPORT_DIR}/${placeId}.json`
      });
    }
  }

  return required;
}

function findPlace(root, placeFile, placeId) {
  if (!fs.existsSync(path.join(root, placeFile))) return null;
  return asPlaces(readJson(root, placeFile)).find((place) => String(place.id) === placeId) ?? null;
}

function mapBy(values, key) {
  return new Map((Array.isArray(values) ? values : [])
    .filter(isObject)
    .map((value) => [String(value[key] ?? ''), value])
    .filter(([id]) => id));
}

export function loadHistorieRegistries(root = process.cwd()) {
  const emner = readJson(root, EMNER_PATH);
  const claims = readJson(root, CLAIMS_PATH);
  const sources = readJson(root, SOURCES_PATH);
  const evidence = readJson(root, EVIDENCE_PATH);
  const profilesManifest = readJson(root, PROFILES_MANIFEST_PATH);
  const profiles = new Map();

  for (const entry of profilesManifest.profiles ?? []) {
    if (entry?.subject_id !== 'historie') continue;
    const profilePath = `data/fag/profiles/${repoPath(entry.profile_file)}`;
    const profile = readJson(root, profilePath);
    profiles.set(String(entry.profile_id), {
      entry,
      profile,
      cases: mapBy(profile.cases, 'case_id')
    });
  }

  return {
    canonicalEmneIds: new Set((Array.isArray(emner) ? emner : []).map((emne) => String(emne?.emne_id ?? '')).filter(Boolean)),
    claims: mapBy(claims.claims, 'claim_id'),
    sources: mapBy(sources.sources, 'source_id'),
    evidenceLinks: mapBy(evidence.evidence_links, 'evidence_id'),
    profiles
  };
}

function validateReferenceList(values, known, label, errors) {
  if (!Array.isArray(values) || values.length === 0) {
    errors.push(`${label} må ha minst én referanse`);
    return;
  }
  if (new Set(values).size !== values.length) errors.push(`${label} har duplikater`);
  for (const value of values) {
    if (!known.has(String(value))) errors.push(`${label} peker til ukjent ID: ${String(value)}`);
  }
}

function validateGate(gate, letter, errors) {
  validateAllowedKeys(gate, gate?.status === 'PASS' ? ['status', 'evidenceRefs'] : ['status', 'rationale'], `gate ${letter}`, errors);
  if (!isObject(gate) || !['PASS', 'N/A'].includes(gate.status)) {
    errors.push(`gate ${letter} må ha status PASS eller N/A`);
    return;
  }
  if (gate.status === 'PASS' && (!Array.isArray(gate.evidenceRefs) || gate.evidenceRefs.length === 0)) {
    errors.push(`gate ${letter} PASS mangler evidenceRefs`);
  }
  if (gate.status === 'N/A' && String(gate.rationale ?? '').trim().length < 12) {
    errors.push(`gate ${letter} N/A mangler begrunnelse`);
  }
}

function validateRequirementRefs(requirement, label, selected, errors) {
  if (!isObject(requirement)) {
    errors.push(`${label} må være et objekt`);
    return;
  }
  if (String(requirement.statement ?? '').trim().length < 20) errors.push(`${label}.statement er for kort`);
  validateReferenceList(requirement.claimIds, selected.claimIds, `${label}.claimIds`, errors);
  validateReferenceList(requirement.evidenceLinkIds, selected.evidenceLinkIds, `${label}.evidenceLinkIds`, errors);
  validateReferenceList(requirement.sourceIds, selected.sourceIds, `${label}.sourceIds`, errors);
}

function sourceType(source) {
  return String(source?.source_type ?? '').trim();
}

export function validateHistoriePlaceReport({ report, place, registries, root = process.cwd(), now = new Date() }) {
  const errors = [];
  const placeId = String(report?.placeId ?? '');

  if (!isObject(report)) return ['rapporten må være et JSON-objekt'];
  for (const key of Object.keys(report)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors.push(`ukjent toppnivåfelt: ${key}`);
  }
  for (const key of TOP_LEVEL_KEYS) {
    if (!(key in report)) errors.push(`mangler toppnivåfelt: ${key}`);
  }

  if (report.schemaVersion !== 'historie_place_production_v1') errors.push('schemaVersion må være historie_place_production_v1');
  if (report.validatorVersion !== VALIDATOR_VERSION) errors.push(`validatorVersion må være ${VALIDATOR_VERSION}`);
  if (!/^[a-z0-9][a-z0-9_-]*$/u.test(placeId)) errors.push('placeId har ugyldig format');
  if (!isObject(place)) errors.push(`placeFile inneholder ikke placeId ${placeId}`);
  if (place && String(place.id) !== placeId) errors.push('placeId samsvarer ikke med place-filen');
  if (place && !isHistoryPlace(place)) errors.push('stedet er ikke et Historie-sted eller koblet til em_his_*');
  if (!String(report.placeFile ?? '').startsWith('data/places/') || !String(report.placeFile ?? '').endsWith('.json')) {
    errors.push('placeFile må peke til en JSON-fil under data/places');
  }
  if (report.status !== 'ready') errors.push('status må være ready før Historie-stedet kan godkjennes');

  const identity = report.historicalIdentity;
  validateAllowedKeys(identity, ['statement', 'placeObjectDistinction', 'placeRelation', 'temporalScope', 'sourceIds'], 'historicalIdentity', errors);
  if (!isObject(identity) || String(identity.statement ?? '').trim().length < 20) errors.push('historicalIdentity.statement er for kort');
  if (!isObject(identity) || String(identity.placeObjectDistinction ?? '').trim().length < 20) errors.push('historicalIdentity.placeObjectDistinction er for kort');
  if (!PLACE_RELATIONS.has(identity?.placeRelation)) errors.push('historicalIdentity.placeRelation er ugyldig');
  validateAllowedKeys(identity?.temporalScope, ['from', 'to', 'precision'], 'historicalIdentity.temporalScope', errors);
  if (!isObject(identity?.temporalScope) || !TEMPORAL_PRECISIONS.has(identity?.temporalScope?.precision)) {
    errors.push('historicalIdentity.temporalScope mangler gyldig precision');
  }
  const temporalFrom = identity?.temporalScope?.from;
  const temporalTo = identity?.temporalScope?.to;
  if (temporalFrom !== null && !Number.isInteger(temporalFrom)) errors.push('historicalIdentity.temporalScope.from må være heltall eller null');
  if (temporalTo !== null && !Number.isInteger(temporalTo)) errors.push('historicalIdentity.temporalScope.to må være heltall eller null');
  if (Number.isInteger(temporalFrom) && Number.isInteger(temporalTo) && temporalFrom > temporalTo) {
    errors.push('historicalIdentity.temporalScope.from kan ikke være senere enn to');
  }

  const historyProfile = report.historyProfile;
  validateAllowedKeys(historyProfile, ['profileId', 'caseIds', 'claimIds', 'evidenceLinkIds'], 'historyProfile', errors);
  const profileId = String(historyProfile?.profileId ?? '');
  const profileBundle = registries.profiles.get(profileId);
  if (!profileBundle) errors.push(`historyProfile.profileId er ukjent: ${profileId || '<tom>'}`);
  const caseIds = new Set(Array.isArray(historyProfile?.caseIds) ? historyProfile.caseIds.map(String) : []);
  const claimIds = new Set(Array.isArray(historyProfile?.claimIds) ? historyProfile.claimIds.map(String) : []);
  const evidenceLinkIds = new Set(Array.isArray(historyProfile?.evidenceLinkIds) ? historyProfile.evidenceLinkIds.map(String) : []);
  validateReferenceList(historyProfile?.caseIds, profileBundle?.cases ?? new Map(), 'historyProfile.caseIds', errors);
  validateReferenceList(historyProfile?.claimIds, registries.claims, 'historyProfile.claimIds', errors);
  validateReferenceList(historyProfile?.evidenceLinkIds, registries.evidenceLinks, 'historyProfile.evidenceLinkIds', errors);

  for (const caseId of caseIds) {
    const historicalCase = profileBundle?.cases.get(caseId);
    if (!historicalCase) continue;
    if (!(historicalCase.place_ids ?? []).map(String).includes(placeId)) errors.push(`${caseId} er ikke koblet til placeId ${placeId}`);
    const requirements = new Set((historicalCase.case_requirement_ids ?? []).map(String));
    for (const requirementId of REQUIRED_CASE_REQUIREMENT_IDS) {
      if (!requirements.has(requirementId)) errors.push(`${caseId} mangler ${requirementId}`);
    }
  }

  for (const claimId of claimIds) {
    const claim = registries.claims.get(claimId);
    if (!claim) continue;
    const scopedPlaces = new Set((claim?.scope?.place_ids ?? []).map(String));
    const scopedCases = new Set((claim?.scope?.case_ids ?? []).map(String));
    if (!scopedPlaces.has(placeId)) errors.push(`${claimId} er ikke stedsspesifikt koblet til ${placeId}`);
    if (![...caseIds].some((caseId) => scopedCases.has(caseId))) errors.push(`${claimId} peker ikke til rapportens caseIds`);
    if (!Array.isArray(claim.alternative_interpretations) || claim.alternative_interpretations.length === 0) {
      errors.push(`${claimId} mangler alternative_interpretations`);
    }
  }

  const reviewedSourceIds = new Set();
  const sourceReviews = Array.isArray(report.sourceReviews) ? report.sourceReviews : [];
  if (sourceReviews.length < 2) errors.push('sourceReviews må ha minst to kilder');
  for (const sourceReview of sourceReviews) {
    validateAllowedKeys(sourceReview, ['sourceId', 'sourceLocation', 'use', 'limitation', 'temporalRelation', 'verifiedAt'], 'sourceReview', errors);
    const sourceId = String(sourceReview?.sourceId ?? '');
    if (reviewedSourceIds.has(sourceId)) errors.push(`duplisert sourceReview: ${sourceId}`);
    reviewedSourceIds.add(sourceId);
    const source = registries.sources.get(sourceId);
    if (!source) errors.push(`sourceReview peker til ukjent canonical kilde: ${sourceId || '<tom>'}`);
    if (String(sourceReview?.sourceLocation ?? '').trim().length < 3) errors.push(`${sourceId} mangler sourceLocation`);
    if (String(sourceReview?.use ?? '').trim().length < 12) errors.push(`${sourceId} mangler konkret use`);
    if (String(sourceReview?.limitation ?? '').trim().length < 12) errors.push(`${sourceId} mangler konkret limitation`);
    if (!TEMPORAL_RELATIONS.has(sourceReview?.temporalRelation)) errors.push(`${sourceId} har ugyldig temporalRelation`);
    const verifiedAt = parseDate(sourceReview?.verifiedAt);
    if (!verifiedAt) errors.push(`${sourceId} har ugyldig verifiedAt`);
    else if (verifiedAt.valueOf() > now.valueOf()) errors.push(`${sourceId} er verifisert i fremtiden`);
    if (source) {
      if (!validHttps(source.url)) errors.push(`${sourceId} mangler gyldig HTTPS-URL i canonical kilderegister`);
      if (!isObject(source.provenance)) errors.push(`${sourceId} mangler canonical provenance`);
      if (!Array.isArray(source.limitations) || source.limitations.length === 0) errors.push(`${sourceId} mangler canonical limitations`);
      if (!sourceType(source)) errors.push(`${sourceId} mangler canonical source_type`);
    }
  }

  validateReferenceList(identity?.sourceIds, reviewedSourceIds, 'historicalIdentity.sourceIds', errors);

  for (const evidenceId of evidenceLinkIds) {
    const evidence = registries.evidenceLinks.get(evidenceId);
    if (!evidence) continue;
    if (String(evidence.place_id) !== placeId) errors.push(`${evidenceId} peker til feil place_id`);
    if (String(evidence.profile_id) !== profileId) errors.push(`${evidenceId} peker til feil profile_id`);
    if (!caseIds.has(String(evidence.case_id))) errors.push(`${evidenceId} peker ikke til rapportens caseIds`);
    if (!claimIds.has(String(evidence.claim_id))) errors.push(`${evidenceId} peker ikke til rapportens claimIds`);
    if (evidence.validation_status !== 'validated_case') errors.push(`${evidenceId} er ikke validated_case`);
    if (evidence.limitations_inherited !== true) errors.push(`${evidenceId} må arve canonical kildebegrensninger`);
    validateReferenceList(evidence.source_ids, reviewedSourceIds, `${evidenceId}.source_ids`, errors);
  }

  const placeTopicIds = historyEmneIds(place);
  const topicRows = Array.isArray(report.historyTopics) ? report.historyTopics : [];
  const reportTopicIds = topicRows.map((row) => String(row?.emneId ?? ''));
  if (new Set(reportTopicIds).size !== reportTopicIds.length) errors.push('historyTopics har dupliserte emneId-er');
  if (!sameValue([...reportTopicIds].sort(), [...placeTopicIds].sort())) {
    errors.push('historyTopics må dekke nøyaktig place-filens canonicale em_his_*');
  }
  if (reportTopicIds.length === 0) errors.push('et ferdig Historie-sted må ha minst ett canonicalt em_his_*');
  const topicEvidenceUnion = new Set();
  for (const topic of topicRows) {
    validateAllowedKeys(topic, ['emneId', 'siteSpecificRationale', 'evidenceLinkIds'], 'historyTopic', errors);
    const emneId = String(topic?.emneId ?? '');
    if (!registries.canonicalEmneIds.has(emneId)) errors.push(`ukjent canonical Historie-emne: ${emneId}`);
    if (String(topic?.siteSpecificRationale ?? '').trim().length < 20) errors.push(`${emneId} mangler stedsspesifikk begrunnelse`);
    validateReferenceList(topic?.evidenceLinkIds, evidenceLinkIds, `${emneId}.evidenceLinkIds`, errors);
    for (const evidenceId of topic?.evidenceLinkIds ?? []) {
      topicEvidenceUnion.add(String(evidenceId));
      const evidence = registries.evidenceLinks.get(String(evidenceId));
      if (evidence && !(evidence.emne_ids ?? []).map(String).includes(emneId)) {
        errors.push(`${evidenceId} dokumenterer ikke ${emneId}`);
      }
    }
  }
  if (!sameValue([...topicEvidenceUnion].sort(), [...evidenceLinkIds].sort())) {
    errors.push('historyTopics må fordele alle og bare historyProfile.evidenceLinkIds');
  }

  const selected = { claimIds, evidenceLinkIds, sourceIds: reviewedSourceIds };
  const requirements = report.caseRequirements;
  validateAllowedKeys(requirements, ['temporalSequence', 'actorConflict', 'sourceComparison', 'comparativeScale'], 'caseRequirements', errors);

  const temporal = requirements?.temporalSequence;
  validateAllowedKeys(temporal, ['statement', 'start', 'end', 'change', 'continuity', 'claimIds', 'evidenceLinkIds', 'sourceIds'], 'caseRequirements.temporalSequence', errors);
  validateRequirementRefs(temporal, 'caseRequirements.temporalSequence', selected, errors);
  for (const field of ['start', 'end']) {
    if (String(temporal?.[field] ?? '').trim().length < 8) errors.push(`caseRequirements.temporalSequence.${field} er for kort`);
  }
  for (const field of ['change', 'continuity']) {
    if (String(temporal?.[field] ?? '').trim().length < 12) errors.push(`caseRequirements.temporalSequence.${field} er for kort`);
  }

  const actor = requirements?.actorConflict;
  validateAllowedKeys(actor, ['statement', 'actors', 'conflictOrNegotiation', 'claimIds', 'evidenceLinkIds', 'sourceIds'], 'caseRequirements.actorConflict', errors);
  validateRequirementRefs(actor, 'caseRequirements.actorConflict', selected, errors);
  if (!Array.isArray(actor?.actors) || new Set(actor.actors.map(String)).size < 2) errors.push('caseRequirements.actorConflict må navngi minst to ulike aktører eller grupper');
  if (String(actor?.conflictOrNegotiation ?? '').trim().length < 12) errors.push('caseRequirements.actorConflict.conflictOrNegotiation er for kort');

  const comparison = requirements?.sourceComparison;
  validateAllowedKeys(comparison, ['statement', 'comparison', 'limitations', 'claimIds', 'evidenceLinkIds', 'sourceIds'], 'caseRequirements.sourceComparison', errors);
  validateRequirementRefs(comparison, 'caseRequirements.sourceComparison', selected, errors);
  if (String(comparison?.comparison ?? '').trim().length < 20) errors.push('caseRequirements.sourceComparison.comparison er for kort');
  if (String(comparison?.limitations ?? '').trim().length < 20) errors.push('caseRequirements.sourceComparison.limitations er for kort');
  const comparedSourceTypes = new Set((comparison?.sourceIds ?? []).map((sourceId) => sourceType(registries.sources.get(String(sourceId)))).filter(Boolean));
  if (comparedSourceTypes.size < 2) errors.push('caseRequirements.sourceComparison må bruke minst to ulike canonicale kildetyper');

  const scale = requirements?.comparativeScale;
  validateAllowedKeys(scale, ['statement', 'localScale', 'widerScale', 'comparison', 'claimIds', 'evidenceLinkIds', 'sourceIds'], 'caseRequirements.comparativeScale', errors);
  validateRequirementRefs(scale, 'caseRequirements.comparativeScale', selected, errors);
  for (const field of ['localScale', 'widerScale']) {
    if (String(scale?.[field] ?? '').trim().length < 12) errors.push(`caseRequirements.comparativeScale.${field} er for kort`);
  }
  if (String(scale?.comparison ?? '').trim().length < 20) errors.push('caseRequirements.comparativeScale.comparison er for kort');

  const guards = report.inferenceGuards;
  const guardFields = ['contemporaneousVsRetrospective', 'actorVsStructure', 'causeVsCorrelation', 'eventVsProcess', 'localVsWiderScale'];
  validateAllowedKeys(guards, guardFields, 'inferenceGuards', errors);
  for (const field of guardFields) {
    if (String(guards?.[field] ?? '').trim().length < 20) errors.push(`inferenceGuards.${field} er for kort`);
  }

  const quiz = report.quizOpening;
  validateAllowedKeys(
    quiz,
    quiz?.status === 'PASS'
      ? ['status', 'quizTargetId', 'firstTwoSetsQuestionCount', 'firstTwoSetsFactQuestionCount', 'sourceBrief', 'productionContext', 'requiredInputs']
      : ['status', 'rationale'],
    'quizOpening',
    errors
  );
  if (!isObject(quiz) || !['PASS', 'N/A'].includes(quiz.status)) {
    errors.push('quizOpening må ha status PASS eller N/A');
  } else if (quiz.status === 'PASS') {
    if (quiz.firstTwoSetsQuestionCount !== 14) errors.push('quizOpening må dokumentere nøyaktig 14 spørsmål i sett 1–2');
    if (!Number.isInteger(quiz.firstTwoSetsFactQuestionCount) || quiz.firstTwoSetsFactQuestionCount < 7 || quiz.firstTwoSetsFactQuestionCount > 14) {
      errors.push('quizOpening må dokumentere 7–14 faktaspørsmål i sett 1–2');
    }
    for (const fileKey of ['sourceBrief', 'productionContext']) {
      const target = String(quiz[fileKey] ?? '');
      if (!target || !fs.existsSync(path.join(root, target))) errors.push(`quizOpening.${fileKey} peker ikke til en eksisterende fil: ${target || '<tom>'}`);
    }
    if (!Array.isArray(quiz.requiredInputs) || quiz.requiredInputs.length === 0) errors.push('quizOpening.requiredInputs må dokumenteres');
    for (const target of quiz.requiredInputs ?? []) {
      if (!fs.existsSync(path.join(root, String(target)))) errors.push(`quiz required_input finnes ikke: ${String(target)}`);
    }
  } else if (String(quiz.rationale ?? '').trim().length < 12) {
    errors.push('quizOpening N/A mangler begrunnelse');
  }

  const chronology = report.chronologyStories;
  validateAllowedKeys(chronology, ['status', 'chronologyReviewed', 'storiesReviewed', 'rationale'], 'chronologyStories', errors);
  if (!isObject(chronology) || !['PASS', 'N/A'].includes(chronology.status)) errors.push('chronologyStories må ha status PASS eller N/A');
  if (typeof chronology?.chronologyReviewed !== 'boolean' || typeof chronology?.storiesReviewed !== 'boolean') {
    errors.push('chronologyStories må registrere begge review-statusene');
  }
  if (String(chronology?.rationale ?? '').trim().length < 12) errors.push('chronologyStories mangler begrunnelse');

  validateAllowedKeys(report.gates, REQUIRED_GATES, 'gates', errors);
  for (const letter of REQUIRED_GATES) validateGate(report.gates?.[letter], letter, errors);
  for (const letter of MANDATORY_GATES) {
    if (report.gates?.[letter]?.status !== 'PASS') errors.push(`gate ${letter} må være PASS for et ferdig Historie-sted`);
  }
  if (report.gates?.H?.status !== quiz?.status) errors.push('gate H må samsvare med quizOpening.status');
  if (report.gates?.I?.status !== chronology?.status) errors.push('gate I må samsvare med chronologyStories.status');

  validateAllowedKeys(report.review, ['reviewer', 'reviewedAt', 'notes'], 'review', errors);
  if (!isObject(report.review) || String(report.review.reviewer ?? '').trim().length === 0) errors.push('review.reviewer mangler');
  if (!parseDate(report.review?.reviewedAt)) errors.push('review.reviewedAt har ugyldig dato');
  if (String(report.review?.notes ?? '').trim().length === 0) errors.push('review.notes mangler');

  return errors;
}

export function auditHistoriePlaceProduction({ root = process.cwd(), mode = 'all', base = null, head = 'HEAD', now = new Date() } = {}) {
  const failures = [];
  const checkedReports = new Set();
  const schema = readJson(root, SCHEMA_PATH);
  if (schema?.properties?.validatorVersion?.pattern !== '^1\\.0\\.[0-9]+$') {
    failures.push(`${SCHEMA_PATH}: schemaets validatorVersion-pattern er ute av sync`);
  }

  const registries = loadHistorieRegistries(root);
  const canonicalPlacePaths = manifestPlacePaths(root);
  let reportPaths = listReportPaths(root);
  let required = new Map();

  if (mode === 'changed') {
    if (!base) throw new Error('--changed krever --base <sha>');
    const paths = changedPaths(root, base, head);
    required = requiredReportsForChanges(root, paths, base);
    const changedReports = paths.filter((entry) => entry.startsWith(`${REPORT_DIR}/`) && entry.endsWith('.json'));
    reportPaths = [...new Set([...changedReports, ...[...required.values()].map((entry) => entry.reportPath)])].sort();
  }

  for (const [placeId, requirement] of required) {
    if (!fs.existsSync(path.join(root, requirement.reportPath))) {
      failures.push(`${requirement.placeFile}: Historie-produksjonsendring for ${placeId} mangler ${requirement.reportPath}`);
    }
  }

  for (const reportPath of reportPaths) {
    const absolute = path.join(root, reportPath);
    if (!fs.existsSync(absolute)) continue;
    let report;
    try {
      report = readJson(root, reportPath);
    } catch (error) {
      failures.push(`${reportPath}: ugyldig JSON (${error.message})`);
      continue;
    }
    const placeId = String(report?.placeId ?? '');
    const expectedPath = `${REPORT_DIR}/${placeId}.json`;
    if (reportPath !== expectedPath) failures.push(`${reportPath}: filnavnet må være ${expectedPath}`);
    const placeFile = repoPath(report?.placeFile);
    if (!canonicalPlacePaths.has(placeFile)) failures.push(`${reportPath}: placeFile er ikke manifest-loadet: ${placeFile}`);
    const place = findPlace(root, placeFile, placeId);
    const errors = validateHistoriePlaceReport({ report, place, registries, root, now });
    failures.push(...errors.map((error) => `${reportPath}: ${error}`));
    checkedReports.add(reportPath);
  }

  return {
    schema: 'history_go_historie_place_production_audit_v1',
    validatorVersion: VALIDATOR_VERSION,
    mode,
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      requiredReports: required.size,
      checkedReports: checkedReports.size,
      failures: failures.length
    },
    failures
  };
}

function cliArgs(argv) {
  const args = { mode: 'all', base: null, head: 'HEAD' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--all') args.mode = 'all';
    else if (arg === '--changed') args.mode = 'changed';
    else if (arg === '--base') args.base = argv[++index] ?? null;
    else if (arg === '--head') args.head = argv[++index] ?? 'HEAD';
    else throw new Error(`Ukjent argument: ${arg}`);
  }
  return args;
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCli) {
  try {
    const report = auditHistoriePlaceProduction({ root: process.cwd(), ...cliArgs(process.argv.slice(2)) });
    console.log(JSON.stringify(report, null, 2));
    if (report.status !== 'passed') process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  }
}
