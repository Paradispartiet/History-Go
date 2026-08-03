#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const VALIDATOR_VERSION = '1.0.0';
const REPORT_DIR = 'data/places/subkultur-production';
const SCHEMA_PATH = 'data/places/regler/subkultur_place_production_v1.schema.json';
const MANIFEST_PATH = 'data/places/manifest.json';
const EMNER_PATH = 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json';
const METHODS_PATH = 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json';
const REQUIRED_GATES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const MANDATORY_READY_GATES = ['A', 'B', 'C', 'D', 'E', 'F'];
const PRODUCTION_FIELDS = [
  'name',
  'altNames',
  'formerNames',
  'category',
  'secondaryBadgeIds',
  'underbadge_ids',
  'emne_ids',
  'year',
  'period',
  'desc',
  'popupDesc',
  'subculture_profile',
  'social_history',
  'source_summary',
  'quiz_profile',
  'chronology',
  'stories',
  'story_ids'
];
const ANCHOR_TYPES = new Set([
  'autonomous_space',
  'occupied_space',
  'scene_or_venue',
  'social_territory',
  'support_point',
  'skate_or_wheel_space',
  'graffiti_or_street_art_space',
  'youth_space',
  'independent_media_or_shop',
  'alternative_neighborhood',
  'ordinary_public_space_with_subculture_layer',
  'mixed_subcultural_site'
]);
const SOURCE_TYPES = new Set([
  'community_primary',
  'participant_archive',
  'independent_media',
  'service_provider',
  'official',
  'municipality',
  'police_or_regulator',
  'archive',
  'scholarly',
  'museum_or_heritage',
  'reputable_secondary'
]);
const PERSPECTIVES = new Set(['participant', 'milieu', 'support_service', 'authority', 'research', 'secondary']);
const MILIEU_PERSPECTIVES = new Set(['participant', 'milieu', 'support_service']);
const OUTSIDE_PERSPECTIVES = new Set(['authority', 'research', 'secondary']);
const TEMPORAL_COVERAGE = new Set(['historical', 'current', 'mixed']);
const PRESENT_STATUSES = new Set(['active', 'historical', 'mixed', 'relocated', 'closed', 'demolished']);
const INFERENCE_STATUSES = new Set(['descriptive', 'associational', 'causal']);
const TOP_LEVEL_KEYS = new Set([
  'schemaVersion',
  'validatorVersion',
  'placeId',
  'placeFile',
  'status',
  'subculturalIdentity',
  'subcultureTopics',
  'sources',
  'subcultureCases',
  'presentFunction',
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

function subcultureEmneIds(place) {
  return [...new Set((Array.isArray(place?.emne_ids) ? place.emne_ids : [])
    .map(String)
    .filter((id) => id.startsWith('em_sub_')))];
}

function hasSubcultureBadge(place) {
  return Array.isArray(place?.secondaryBadgeIds) && place.secondaryBadgeIds.includes('subkultur');
}

function isSubculturePlace(place) {
  return place?.category === 'subkultur' || hasSubcultureBadge(place) || subcultureEmneIds(place).length > 0;
}

function sameValue(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function productionFieldsChanged(before, after) {
  if (!before) return true;
  return PRODUCTION_FIELDS.some((field) => !sameValue(before?.[field], after?.[field]));
}

function validateAllowedKeys(value, allowed, label, errors) {
  if (!isObject(value)) return;
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) errors.push(`${label} har ukjent felt: ${key}`);
  }
}

function requireText(value, minimum, label, errors) {
  if (String(value ?? '').trim().length < minimum) errors.push(`${label} er for kort`);
}

function validateTextArray(value, minimum, label, errors) {
  if (!Array.isArray(value) || value.length < minimum) {
    errors.push(`${label} må ha minst ${minimum} verdi${minimum === 1 ? '' : 'er'}`);
    return;
  }
  for (const [index, entry] of value.entries()) requireText(entry, 8, `${label}[${index}]`, errors);
}

function parseCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(String(value ?? ''))) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
  return parsed;
}

function daysSince(value, now = new Date()) {
  const parsed = parseCalendarDate(value);
  if (!parsed) return Number.POSITIVE_INFINITY;
  return Math.floor((now.valueOf() - parsed.valueOf()) / 86_400_000);
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
  const output = execFileSync('git', ['diff', '--name-only', `${base}...${head}`], { cwd: root, encoding: 'utf8' });
  return output.split(/\r?\n/u).map((entry) => entry.trim()).filter(Boolean);
}

function manifestPlacePaths(root) {
  const manifest = readJson(root, MANIFEST_PATH);
  return new Set((manifest.files ?? []).map((entry) => repoPath(path.posix.join('data', entry))));
}

function canonicalSubcultureEmneIds(root) {
  const rows = readJson(root, EMNER_PATH);
  return new Set((Array.isArray(rows) ? rows : [])
    .map((entry) => String(entry?.emne_id ?? ''))
    .filter((id) => id.startsWith('em_sub_')));
}

function canonicalSubcultureMethodIds(root) {
  const document = readJson(root, METHODS_PATH);
  return new Set((Array.isArray(document?.methods) ? document.methods : [])
    .map((entry) => String(entry?.method_id ?? ''))
    .filter((id) => id.startsWith('met_sub_')));
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
      if (!isSubculturePlace(place)) continue;
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

function validateReferenceList(values, known, label, errors, minimum = 1) {
  if (!Array.isArray(values) || values.length < minimum) {
    errors.push(`${label} må ha minst ${minimum} referanse${minimum === 1 ? '' : 'r'}`);
    return;
  }
  if (new Set(values).size !== values.length) errors.push(`${label} har duplikater`);
  for (const value of values) {
    if (!known.has(String(value))) errors.push(`${label} peker til ukjent ID: ${String(value)}`);
  }
}

function validateTemporalScope(scope, label, errors) {
  validateAllowedKeys(scope, ['start', 'end', 'precision', 'rationale'], label, errors);
  if (!isObject(scope)) {
    errors.push(`${label} må være et objekt`);
    return;
  }
  requireText(scope.start, 1, `${label}.start`, errors);
  requireText(scope.end, 1, `${label}.end`, errors);
  if (!['day', 'year', 'decade', 'period', 'current', 'uncertain'].includes(scope.precision)) errors.push(`${label}.precision er ugyldig`);
  requireText(scope.rationale, 12, `${label}.rationale`, errors);
}

function validateEvidenceAssessment(value, label, sourceIds, errors) {
  if (!isObject(value)) {
    errors.push(`${label} må være et evidensobjekt`);
    return;
  }
  if (value.status === 'documented') {
    validateAllowedKeys(value, ['status', 'statement', 'sourceIds'], label, errors);
    requireText(value.statement, 20, `${label}.statement`, errors);
    validateReferenceList(value.sourceIds, sourceIds, `${label}.sourceIds`, errors);
  } else if (value.status === 'not_documented') {
    validateAllowedKeys(value, ['status', 'rationale', 'sourceIds'], label, errors);
    requireText(value.rationale, 20, `${label}.rationale`, errors);
    validateReferenceList(value.sourceIds, sourceIds, `${label}.sourceIds`, errors);
  } else if (value.status === 'not_applicable') {
    validateAllowedKeys(value, ['status', 'rationale'], label, errors);
    requireText(value.rationale, 20, `${label}.rationale`, errors);
  } else {
    errors.push(`${label}.status må være documented, not_documented eller not_applicable`);
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
  if (gate.status === 'N/A') requireText(gate.rationale, 12, `gate ${letter}.rationale`, errors);
}

export function validateSubkulturPlaceReport({ report, place, canonicalEmneIds, canonicalMethodIds, root = process.cwd(), now = new Date() }) {
  const errors = [];
  if (!isObject(report)) return ['rapporten må være et JSON-objekt'];

  for (const key of Object.keys(report)) if (!TOP_LEVEL_KEYS.has(key)) errors.push(`ukjent toppnivåfelt: ${key}`);
  for (const key of TOP_LEVEL_KEYS) if (!(key in report)) errors.push(`mangler toppnivåfelt: ${key}`);

  const placeId = String(report.placeId ?? '');
  if (report.schemaVersion !== 'subkultur_place_production_v1') errors.push('schemaVersion må være subkultur_place_production_v1');
  if (report.validatorVersion !== VALIDATOR_VERSION) errors.push(`validatorVersion må være ${VALIDATOR_VERSION}`);
  if (!/^[a-z0-9][a-z0-9_-]*$/u.test(placeId)) errors.push('placeId har ugyldig format');
  if (!isObject(place)) errors.push(`placeFile inneholder ikke placeId ${placeId}`);
  if (place && String(place.id) !== placeId) errors.push('placeId samsvarer ikke med place-filen');
  if (place && !isSubculturePlace(place)) errors.push('stedet har verken Subkultur-kategori, sekundærbadge eller em_sub_*-kobling');
  if (!String(report.placeFile ?? '').startsWith('data/places/') || !String(report.placeFile ?? '').endsWith('.json')) {
    errors.push('placeFile må peke til en JSON-fil under data/places');
  }
  if (report.status !== 'ready') errors.push('status må være ready før Subkultur-stedet kan godkjennes');

  const sources = Array.isArray(report.sources) ? report.sources : [];
  if (sources.length < 2) errors.push('sources må ha minst to eksterne kilder');
  const sourceIds = new Set();
  const sourcesById = new Map();
  for (const source of sources) {
    validateAllowedKeys(source, ['id', 'url', 'sourceLocation', 'sourceType', 'perspective', 'verifiedAt', 'temporalCoverage', 'provenance', 'limitations'], 'source', errors);
    const id = String(source?.id ?? '');
    if (!/^source_[a-z0-9_-]+$/u.test(id)) errors.push(`ugyldig source-id: ${id || '<tom>'}`);
    if (sourceIds.has(id)) errors.push(`duplikat source-id: ${id}`);
    sourceIds.add(id);
    sourcesById.set(id, source);
    if (!validHttps(source?.url)) errors.push(`${id || 'source'} må ha gyldig https-URL`);
    requireText(source?.sourceLocation, 3, `${id}.sourceLocation`, errors);
    if (!SOURCE_TYPES.has(source?.sourceType)) errors.push(`${id}.sourceType er ugyldig`);
    if (!PERSPECTIVES.has(source?.perspective)) errors.push(`${id}.perspective er ugyldig`);
    if (!TEMPORAL_COVERAGE.has(source?.temporalCoverage)) errors.push(`${id}.temporalCoverage er ugyldig`);
    requireText(source?.provenance, 12, `${id}.provenance`, errors);
    requireText(source?.limitations, 12, `${id}.limitations`, errors);
    const age = daysSince(source?.verifiedAt, now);
    if (!Number.isFinite(age)) errors.push(`${id}.verifiedAt må være en gyldig kalenderdato`);
    if (age < 0) errors.push(`${id}.verifiedAt kan ikke ligge i fremtiden`);
  }
  if (!sources.some((source) => MILIEU_PERSPECTIVES.has(source?.perspective))) {
    errors.push('sources må inneholde minst én deltaker-, miljø- eller støttetjenestestemme');
  }
  if (!sources.some((source) => OUTSIDE_PERSPECTIVES.has(source?.perspective))) {
    errors.push('sources må inneholde minst én uavhengig myndighets-, forsknings- eller sekundærkilde');
  }

  const identity = report.subculturalIdentity;
  validateAllowedKeys(identity, ['statement', 'anchorType', 'mainSocietyRelationship', 'placeObjectDistinction', 'temporalScope', 'sourceIds'], 'subculturalIdentity', errors);
  if (!isObject(identity)) {
    errors.push('subculturalIdentity må være et objekt');
  } else {
    requireText(identity.statement, 20, 'subculturalIdentity.statement', errors);
    if (!ANCHOR_TYPES.has(identity.anchorType)) errors.push('subculturalIdentity.anchorType er ugyldig');
    requireText(identity.mainSocietyRelationship, 20, 'subculturalIdentity.mainSocietyRelationship', errors);
    requireText(identity.placeObjectDistinction, 20, 'subculturalIdentity.placeObjectDistinction', errors);
    validateTemporalScope(identity.temporalScope, 'subculturalIdentity.temporalScope', errors);
    validateReferenceList(identity.sourceIds, sourceIds, 'subculturalIdentity.sourceIds', errors);
  }

  const canonicalTopics = canonicalEmneIds instanceof Set ? canonicalEmneIds : new Set(canonicalEmneIds ?? []);
  const placeTopics = subcultureEmneIds(place);
  if (placeTopics.length === 0) errors.push('Subkultur-stedet eller -laget må ha minst én canonical em_sub_*-kobling');
  const topics = Array.isArray(report.subcultureTopics) ? report.subcultureTopics : [];
  if (topics.length === 0) errors.push('subcultureTopics må ha minst ett emne');
  const topicIds = [];
  const referencedCaseIds = new Set();
  for (const topic of topics) {
    validateAllowedKeys(topic, ['emneId', 'siteSpecificRationale', 'caseIds'], 'subcultureTopic', errors);
    const emneId = String(topic?.emneId ?? '');
    topicIds.push(emneId);
    if (!/^em_sub_[a-z0-9_]+$/u.test(emneId)) errors.push(`ugyldig Subkultur-emne: ${emneId || '<tom>'}`);
    if (!canonicalTopics.has(emneId)) errors.push(`ukjent canonical Subkultur-emne: ${emneId}`);
    requireText(topic?.siteSpecificRationale, 20, `${emneId}.siteSpecificRationale`, errors);
    if (!Array.isArray(topic?.caseIds) || topic.caseIds.length === 0) errors.push(`${emneId}.caseIds må ha minst ett case`);
    for (const caseId of topic?.caseIds ?? []) referencedCaseIds.add(String(caseId));
  }
  if (new Set(topicIds).size !== topicIds.length) errors.push('subcultureTopics har duplikate emneId-er');
  if (JSON.stringify([...new Set(topicIds)].sort()) !== JSON.stringify([...placeTopics].sort())) {
    errors.push('subcultureTopics må dekke nøyaktig place-filens canonicale em_sub_*');
  }

  const canonicalMethods = canonicalMethodIds instanceof Set ? canonicalMethodIds : new Set(canonicalMethodIds ?? []);
  const cases = Array.isArray(report.subcultureCases) ? report.subcultureCases : [];
  if (cases.length === 0) errors.push('subcultureCases må ha minst ett stedlig case');
  const caseIds = new Set();
  for (const subcultureCase of cases) {
    const caseId = String(subcultureCase?.id ?? '');
    const label = `case ${caseId || '<tom>'}`;
    validateAllowedKeys(subcultureCase, ['id', 'claim', 'actors', 'practicesAndCommunity', 'spaceAndPower', 'representationAndEthics', 'methodAndInference', 'changeOverTime'], label, errors);
    if (!/^case_[a-z0-9_-]+$/u.test(caseId)) errors.push(`${label} har ugyldig id`);
    if (caseIds.has(caseId)) errors.push(`duplikat case-id: ${caseId}`);
    caseIds.add(caseId);
    requireText(subcultureCase?.claim, 20, `${label}.claim`, errors);

    const actors = Array.isArray(subcultureCase?.actors) ? subcultureCase.actors : [];
    if (actors.length < 2) errors.push(`${label}.actors må ha minst to aktører eller grupper`);
    for (const [index, actor] of actors.entries()) {
      const actorLabel = `${label}.actors[${index}]`;
      validateAllowedKeys(actor, ['name', 'roleOrInterest', 'positionOrPower', 'sourceIds'], actorLabel, errors);
      requireText(actor?.name, 1, `${actorLabel}.name`, errors);
      requireText(actor?.roleOrInterest, 8, `${actorLabel}.roleOrInterest`, errors);
      requireText(actor?.positionOrPower, 8, `${actorLabel}.positionOrPower`, errors);
      validateReferenceList(actor?.sourceIds, sourceIds, `${actorLabel}.sourceIds`, errors);
    }

    const practices = subcultureCase?.practicesAndCommunity;
    validateAllowedKeys(practices, ['practices', 'belongingAndParticipation', 'organizationOrGovernance', 'codesOrExpressions', 'sourceIds'], `${label}.practicesAndCommunity`, errors);
    if (!isObject(practices)) {
      errors.push(`${label}.practicesAndCommunity må være et objekt`);
    } else {
      validateTextArray(practices.practices, 1, `${label}.practicesAndCommunity.practices`, errors);
      requireText(practices.belongingAndParticipation, 20, `${label}.practicesAndCommunity.belongingAndParticipation`, errors);
      requireText(practices.organizationOrGovernance, 20, `${label}.practicesAndCommunity.organizationOrGovernance`, errors);
      validateEvidenceAssessment(practices.codesOrExpressions, `${label}.practicesAndCommunity.codesOrExpressions`, sourceIds, errors);
      validateReferenceList(practices.sourceIds, sourceIds, `${label}.practicesAndCommunity.sourceIds`, errors);
    }

    const power = subcultureCase?.spaceAndPower;
    validateAllowedKeys(power, ['accessAndTerritory', 'controlOrRegulation', 'conflictOrNegotiation', 'displacementOrInstitutionalization', 'sourceIds'], `${label}.spaceAndPower`, errors);
    if (!isObject(power)) {
      errors.push(`${label}.spaceAndPower må være et objekt`);
    } else {
      requireText(power.accessAndTerritory, 20, `${label}.spaceAndPower.accessAndTerritory`, errors);
      validateEvidenceAssessment(power.controlOrRegulation, `${label}.spaceAndPower.controlOrRegulation`, sourceIds, errors);
      validateEvidenceAssessment(power.conflictOrNegotiation, `${label}.spaceAndPower.conflictOrNegotiation`, sourceIds, errors);
      validateEvidenceAssessment(power.displacementOrInstitutionalization, `${label}.spaceAndPower.displacementOrInstitutionalization`, sourceIds, errors);
      validateReferenceList(power.sourceIds, sourceIds, `${label}.spaceAndPower.sourceIds`, errors);
    }

    const ethics = subcultureCase?.representationAndEthics;
    validateAllowedKeys(ethics, ['selfDefinition', 'externalLabels', 'stigmaOrRomanticizationRisk', 'editorialSafeguard', 'privacySafeguard', 'sourceIds'], `${label}.representationAndEthics`, errors);
    if (!isObject(ethics)) {
      errors.push(`${label}.representationAndEthics må være et objekt`);
    } else {
      validateEvidenceAssessment(ethics.selfDefinition, `${label}.representationAndEthics.selfDefinition`, sourceIds, errors);
      validateEvidenceAssessment(ethics.externalLabels, `${label}.representationAndEthics.externalLabels`, sourceIds, errors);
      requireText(ethics.stigmaOrRomanticizationRisk, 20, `${label}.representationAndEthics.stigmaOrRomanticizationRisk`, errors);
      requireText(ethics.editorialSafeguard, 20, `${label}.representationAndEthics.editorialSafeguard`, errors);
      requireText(ethics.privacySafeguard, 20, `${label}.representationAndEthics.privacySafeguard`, errors);
      validateReferenceList(ethics.sourceIds, sourceIds, `${label}.representationAndEthics.sourceIds`, errors);
      const perspectives = new Set((ethics.sourceIds ?? []).map((id) => sourcesById.get(String(id))?.perspective).filter(Boolean));
      if (![...perspectives].some((value) => MILIEU_PERSPECTIVES.has(value))) errors.push(`${label}.representationAndEthics mangler miljønær kilde`);
      if (![...perspectives].some((value) => OUTSIDE_PERSPECTIVES.has(value))) errors.push(`${label}.representationAndEthics mangler uavhengig kilde`);
    }

    const method = subcultureCase?.methodAndInference;
    validateAllowedKeys(method, ['methodId', 'observationOrEvidence', 'alternativeExplanations', 'inferenceStatus', 'reflexivity', 'uncertainty', 'sourceIds'], `${label}.methodAndInference`, errors);
    if (!isObject(method)) {
      errors.push(`${label}.methodAndInference må være et objekt`);
    } else {
      const methodId = String(method.methodId ?? '');
      if (!canonicalMethods.has(methodId)) errors.push(`${label}.methodAndInference bruker ukjent canonical metode: ${methodId}`);
      requireText(method.observationOrEvidence, 20, `${label}.methodAndInference.observationOrEvidence`, errors);
      validateTextArray(method.alternativeExplanations, 1, `${label}.methodAndInference.alternativeExplanations`, errors);
      if (!INFERENCE_STATUSES.has(method.inferenceStatus)) errors.push(`${label}.methodAndInference.inferenceStatus er ugyldig`);
      requireText(method.reflexivity, 20, `${label}.methodAndInference.reflexivity`, errors);
      requireText(method.uncertainty, 12, `${label}.methodAndInference.uncertainty`, errors);
      validateReferenceList(method.sourceIds, sourceIds, `${label}.methodAndInference.sourceIds`, errors);
    }

    const change = subcultureCase?.changeOverTime;
    validateAllowedKeys(change, ['scope', 'startingPoint', 'changeOrTurningPoint', 'currentOrEndPoint', 'continuities', 'sourceIds'], `${label}.changeOverTime`, errors);
    if (!isObject(change)) {
      errors.push(`${label}.changeOverTime må være et objekt`);
    } else {
      validateTemporalScope(change.scope, `${label}.changeOverTime.scope`, errors);
      requireText(change.startingPoint, 12, `${label}.changeOverTime.startingPoint`, errors);
      requireText(change.changeOrTurningPoint, 12, `${label}.changeOverTime.changeOrTurningPoint`, errors);
      requireText(change.currentOrEndPoint, 12, `${label}.changeOverTime.currentOrEndPoint`, errors);
      validateTextArray(change.continuities, 1, `${label}.changeOverTime.continuities`, errors);
      validateReferenceList(change.sourceIds, sourceIds, `${label}.changeOverTime.sourceIds`, errors);
    }
  }
  for (const referencedCaseId of referencedCaseIds) if (!caseIds.has(referencedCaseId)) errors.push(`subcultureTopics peker til ukjent case: ${referencedCaseId}`);
  for (const caseId of caseIds) if (!referencedCaseIds.has(caseId)) errors.push(`subcultureCases inneholder ukoblet case: ${caseId}`);

  const present = report.presentFunction;
  validateAllowedKeys(present, ['status', 'statement', 'historicalRelationship', 'checkedAt', 'sourceIds'], 'presentFunction', errors);
  if (!isObject(present)) {
    errors.push('presentFunction må være et objekt');
  } else {
    if (!PRESENT_STATUSES.has(present.status)) errors.push('presentFunction.status er ugyldig');
    requireText(present.statement, 20, 'presentFunction.statement', errors);
    requireText(present.historicalRelationship, 20, 'presentFunction.historicalRelationship', errors);
    validateReferenceList(present.sourceIds, sourceIds, 'presentFunction.sourceIds', errors);
    const checkAge = daysSince(present.checkedAt, now);
    if (!Number.isFinite(checkAge)) errors.push('presentFunction.checkedAt må være en gyldig kalenderdato');
    if (checkAge < 0) errors.push('presentFunction.checkedAt kan ikke ligge i fremtiden');
    if (['active', 'mixed', 'relocated'].includes(present.status)) {
      const hasCurrentSource = (present.sourceIds ?? []).some((id) => {
        const source = sourcesById.get(String(id));
        return ['current', 'mixed'].includes(source?.temporalCoverage) && daysSince(source?.verifiedAt, now) <= 365;
      });
      if (!hasCurrentSource) errors.push('aktiv, blandet eller flyttet presentFunction må ha en current/mixed-kilde kontrollert siste 365 dager');
    }
  }

  const quiz = report.quizOpening;
  validateAllowedKeys(quiz, quiz?.status === 'PASS'
    ? ['status', 'quizTargetId', 'firstTwoSetsQuestionCount', 'sourceBrief', 'productionContext', 'requiredInputs']
    : ['status', 'rationale'], 'quizOpening', errors);
  if (!isObject(quiz) || !['PASS', 'N/A'].includes(quiz.status)) {
    errors.push('quizOpening må ha status PASS eller N/A');
  } else if (quiz.status === 'PASS') {
    if (quiz.firstTwoSetsQuestionCount !== 14) errors.push('quizOpening må låse de første to settene til 14 spørsmål');
    requireText(quiz.quizTargetId, 1, 'quizOpening.quizTargetId', errors);
    requireText(quiz.sourceBrief, 1, 'quizOpening.sourceBrief', errors);
    requireText(quiz.productionContext, 1, 'quizOpening.productionContext', errors);
    if (!Array.isArray(quiz.requiredInputs) || quiz.requiredInputs.length === 0) errors.push('quizOpening.requiredInputs mangler');
  } else {
    requireText(quiz.rationale, 12, 'quizOpening.rationale', errors);
  }

  const chronology = report.chronologyStories;
  validateAllowedKeys(chronology, ['status', 'chronologyReviewed', 'storiesReviewed', 'rationale'], 'chronologyStories', errors);
  if (!isObject(chronology) || !['PASS', 'N/A'].includes(chronology.status)) {
    errors.push('chronologyStories må ha status PASS eller N/A');
  } else {
    if (chronology.chronologyReviewed !== true) errors.push('chronologyStories.chronologyReviewed må være true');
    if (chronology.storiesReviewed !== true) errors.push('chronologyStories.storiesReviewed må være true');
    requireText(chronology.rationale, 12, 'chronologyStories.rationale', errors);
  }

  const gates = report.gates;
  validateAllowedKeys(gates, REQUIRED_GATES, 'gates', errors);
  for (const letter of REQUIRED_GATES) validateGate(gates?.[letter], letter, errors);
  for (const letter of MANDATORY_READY_GATES) {
    if (gates?.[letter]?.status !== 'PASS') errors.push(`gate ${letter} må være PASS for et ferdig Subkultur-sted`);
  }
  if (quiz?.status === 'PASS' && gates?.G?.status !== 'PASS') errors.push('gate G må være PASS når quizOpening er PASS');
  if (chronology?.status === 'PASS' && gates?.H?.status !== 'PASS') errors.push('gate H må være PASS når chronologyStories er PASS');

  const review = report.review;
  validateAllowedKeys(review, ['reviewer', 'reviewedAt', 'notes'], 'review', errors);
  if (!isObject(review)) {
    errors.push('review må være et objekt');
  } else {
    requireText(review.reviewer, 1, 'review.reviewer', errors);
    requireText(review.notes, 1, 'review.notes', errors);
    const age = daysSince(review.reviewedAt, now);
    if (!Number.isFinite(age)) errors.push('review.reviewedAt må være en gyldig kalenderdato');
    if (age < 0) errors.push('review.reviewedAt kan ikke ligge i fremtiden');
  }

  if (!fs.existsSync(path.join(root, SCHEMA_PATH))) errors.push(`mangler schema: ${SCHEMA_PATH}`);
  return errors;
}

function validateReportPath(root, reportPath, canonicalEmneIds, canonicalMethodIds, manifestPaths, now) {
  const report = readJson(root, reportPath);
  const expectedReportPath = `${REPORT_DIR}/${String(report.placeId ?? '')}.json`;
  const errors = [];
  if (reportPath !== expectedReportPath) errors.push(`rapportfil må hete ${expectedReportPath}`);
  const placeFile = repoPath(report.placeFile);
  if (!manifestPaths.has(placeFile)) errors.push(`placeFile er ikke manifest-loadet: ${placeFile}`);
  const place = findPlace(root, placeFile, String(report.placeId ?? ''));
  errors.push(...validateSubkulturPlaceReport({ report, place, canonicalEmneIds, canonicalMethodIds, root, now }));
  return { report, errors };
}

export function auditSubkulturPlaceProduction({
  root = process.cwd(),
  mode = 'all',
  base,
  head = 'HEAD',
  paths,
  now = new Date()
} = {}) {
  const failures = [];
  const checked = [];
  const manifestPaths = manifestPlacePaths(root);
  const canonicalEmneIds = canonicalSubcultureEmneIds(root);
  const canonicalMethodIds = canonicalSubcultureMethodIds(root);

  if (mode === 'changed') {
    if (!base) throw new Error('--changed krever --base');
    const changed = paths ?? changedPaths(root, base, head);
    const required = requiredReportsForChanges(root, changed, base);
    const changedReportPaths = changed.filter((entry) => entry.startsWith(`${REPORT_DIR}/`) && entry.endsWith('.json'));
    const reportsToCheck = new Set(changedReportPaths.filter((entry) => fs.existsSync(path.join(root, entry))));

    for (const reportPath of changedReportPaths) {
      if (fs.existsSync(path.join(root, reportPath))) continue;
      const previousSource = sourceAtBase(root, base, reportPath);
      if (!previousSource) continue;
      try {
        const previousReport = JSON.parse(previousSource);
        const placeFile = repoPath(previousReport?.placeFile);
        const placeId = String(previousReport?.placeId ?? '');
        const currentPlace = findPlace(root, placeFile, placeId);
        if (currentPlace && isSubculturePlace(currentPlace)) {
          failures.push(`${placeId}: Subkultur-produksjonsrapporten er slettet mens stedet fortsatt har Subkultur-identitet`);
        }
      } catch {
        failures.push(`${reportPath}: slettet rapport kunne ikke leses fra base`);
      }
    }

    for (const [placeId, entry] of required) {
      if (!fs.existsSync(path.join(root, entry.reportPath))) {
        failures.push(`${placeId}: mangler obligatorisk Subkultur-produksjonsrapport ${entry.reportPath}`);
      } else {
        reportsToCheck.add(entry.reportPath);
      }
    }

    for (const reportPath of [...reportsToCheck].sort()) {
      const result = validateReportPath(root, reportPath, canonicalEmneIds, canonicalMethodIds, manifestPaths, now);
      checked.push(reportPath);
      for (const error of result.errors) failures.push(`${reportPath}: ${error}`);
    }
  } else if (mode === 'all') {
    for (const reportPath of listReportPaths(root)) {
      const result = validateReportPath(root, reportPath, canonicalEmneIds, canonicalMethodIds, manifestPaths, now);
      checked.push(reportPath);
      for (const error of result.errors) failures.push(`${reportPath}: ${error}`);
    }
  } else {
    throw new Error(`ukjent mode: ${mode}`);
  }

  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: { checked: checked.length, failures: failures.length },
    checked,
    failures
  };
}

function parseArgs(argv) {
  const result = { mode: 'all', base: undefined, head: 'HEAD' };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--all') result.mode = 'all';
    else if (value === '--changed') result.mode = 'changed';
    else if (value === '--base') result.base = argv[++index];
    else if (value === '--head') result.head = argv[++index];
    else throw new Error(`ukjent argument: ${value}`);
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = auditSubkulturPlaceProduction(options);
    for (const failure of result.failures) console.error(`FAIL ${failure}`);
    console.log(`Subkultur place production: ${result.summary.checked} checked, ${result.summary.failures} failures`);
    if (result.status !== 'passed') process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
