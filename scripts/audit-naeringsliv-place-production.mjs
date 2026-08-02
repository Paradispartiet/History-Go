import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const VALIDATOR_VERSION = '1.0.0';

const REPORT_DIR = 'data/places/naeringsliv-production';
const SCHEMA_PATH = 'data/places/regler/naeringsliv_place_production_v1.schema.json';
const MANIFEST_PATH = 'data/places/manifest.json';
const EMNER_PATH = 'data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json';
const METHODS_PATH = 'data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json';
const REQUIRED_GATES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const MANDATORY_READY_GATES = ['A', 'B', 'C', 'D', 'E', 'F'];
const PRODUCTION_FIELDS = [
  'name',
  'altNames',
  'formerNames',
  'category',
  'underbadge_ids',
  'emne_ids',
  'year',
  'period',
  'desc',
  'popupDesc',
  'business_profile',
  'industry_profile',
  'source_summary',
  'quiz_profile',
  'chronology',
  'stories',
  'story_ids'
];
const ANCHOR_TYPES = new Set([
  'workplace',
  'firm_site',
  'factory',
  'production_site',
  'office',
  'bank',
  'stock_exchange',
  'market',
  'shop',
  'trade_street',
  'technology_site',
  'business_cluster',
  'logistics_hub',
  'harbor',
  'warehouse',
  'infrastructure',
  'union',
  'economic_institution',
  'mixed_economic_site'
]);
const SOURCE_TYPES = new Set([
  'primary_business',
  'annual_report',
  'official',
  'registry',
  'statistics',
  'archive',
  'technical_documentation',
  'scholarly',
  'industry',
  'museum_or_heritage',
  'reputable_secondary'
]);
const PRIORITY_SOURCE_TYPES = new Set([
  'primary_business',
  'annual_report',
  'official',
  'registry',
  'statistics',
  'archive',
  'technical_documentation'
]);
const TEMPORAL_COVERAGE = new Set(['historical', 'current', 'mixed']);
const OPERATIONAL_STATUSES = new Set(['active', 'former', 'mixed', 'relocated', 'closed', 'demolished']);
const TOP_LEVEL_KEYS = new Set([
  'schemaVersion',
  'validatorVersion',
  'placeId',
  'placeFile',
  'status',
  'economicIdentity',
  'businessTopics',
  'sources',
  'economicCases',
  'presentOperation',
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

function naeringslivEmneIds(place) {
  return [...new Set((Array.isArray(place?.emne_ids) ? place.emne_ids : [])
    .map(String)
    .filter((id) => id.startsWith('em_naering_')))];
}

function isNaeringslivPlace(place) {
  return place?.category === 'naeringsliv' || naeringslivEmneIds(place).length > 0;
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

function requireText(value, minimum, label, errors) {
  if (String(value ?? '').trim().length < minimum) errors.push(`${label} er for kort`);
}

function productionFieldsChanged(before, after) {
  if (!before) return true;
  return PRODUCTION_FIELDS.some((field) => !sameValue(before?.[field], after?.[field]));
}

function parseCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(String(value ?? ''))) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) return null;
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

function canonicalNaeringslivEmneIds(root) {
  const rows = readJson(root, EMNER_PATH);
  return new Set((Array.isArray(rows) ? rows : [])
    .map((entry) => String(entry?.emne_id ?? ''))
    .filter((id) => id.startsWith('em_naering_')));
}

function canonicalNaeringslivMethodIds(root) {
  const document = readJson(root, METHODS_PATH);
  return new Set((Array.isArray(document?.methods) ? document.methods : [])
    .map((entry) => String(entry?.method_id ?? ''))
    .filter((id) => id.startsWith('met_naering_')));
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
      if (!isNaeringslivPlace(place)) continue;
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
  if (!['day', 'year', 'decade', 'period', 'current', 'uncertain'].includes(scope.precision)) {
    errors.push(`${label}.precision er ugyldig`);
  }
  requireText(scope.rationale, 12, `${label}.rationale`, errors);
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

function validateStatementWithSources(value, label, sourceIds, errors) {
  validateAllowedKeys(value, ['statement', 'sourceIds'], label, errors);
  if (!isObject(value)) {
    errors.push(`${label} må være et objekt`);
    return;
  }
  requireText(value.statement, 12, `${label}.statement`, errors);
  validateReferenceList(value.sourceIds, sourceIds, `${label}.sourceIds`, errors);
}

function validateStatementList(values, label, sourceIds, errors) {
  if (!Array.isArray(values) || values.length === 0) {
    errors.push(`${label} må ha minst ett ledd`);
    return;
  }
  for (const [index, value] of values.entries()) {
    validateStatementWithSources(value, `${label}[${index}]`, sourceIds, errors);
  }
}

export function validateNaeringslivPlaceReport({
  report,
  place,
  canonicalEmneIds,
  canonicalMethodIds,
  root = process.cwd(),
  now = new Date()
}) {
  const errors = [];
  if (!isObject(report)) return ['rapporten må være et JSON-objekt'];

  for (const key of Object.keys(report)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors.push(`ukjent toppnivåfelt: ${key}`);
  }
  for (const key of TOP_LEVEL_KEYS) {
    if (!(key in report)) errors.push(`mangler toppnivåfelt: ${key}`);
  }

  const placeId = String(report.placeId ?? '');
  if (report.schemaVersion !== 'naeringsliv_place_production_v1') errors.push('schemaVersion må være naeringsliv_place_production_v1');
  if (report.validatorVersion !== VALIDATOR_VERSION) errors.push(`validatorVersion må være ${VALIDATOR_VERSION}`);
  if (!/^[a-z0-9][a-z0-9_-]*$/u.test(placeId)) errors.push('placeId har ugyldig format');
  if (!isObject(place)) errors.push(`placeFile inneholder ikke placeId ${placeId}`);
  if (place && String(place.id) !== placeId) errors.push('placeId samsvarer ikke med place-filen');
  if (place && !isNaeringslivPlace(place)) errors.push('stedet er ikke et Næringsliv-sted eller koblet til em_naering_*');
  if (!String(report.placeFile ?? '').startsWith('data/places/') || !String(report.placeFile ?? '').endsWith('.json')) {
    errors.push('placeFile må peke til en JSON-fil under data/places');
  }
  if (report.status !== 'ready') errors.push('status må være ready før Næringsliv-stedet kan godkjennes');

  const identity = report.economicIdentity;
  validateAllowedKeys(identity, ['statement', 'anchorType', 'placeObjectDistinction', 'temporalScope', 'sourceIds'], 'economicIdentity', errors);
  if (!isObject(identity)) {
    errors.push('economicIdentity må være et objekt');
  } else {
    requireText(identity.statement, 20, 'economicIdentity.statement', errors);
    if (!ANCHOR_TYPES.has(identity.anchorType)) errors.push('economicIdentity.anchorType er ugyldig');
    requireText(identity.placeObjectDistinction, 20, 'economicIdentity.placeObjectDistinction', errors);
    validateTemporalScope(identity.temporalScope, 'economicIdentity.temporalScope', errors);
  }

  const sources = Array.isArray(report.sources) ? report.sources : [];
  if (sources.length < 2) errors.push('sources må ha minst to eksterne kilder');
  const sourceIds = new Set();
  const sourcesById = new Map();
  for (const source of sources) {
    validateAllowedKeys(source, ['id', 'url', 'sourceLocation', 'sourceType', 'verifiedAt', 'temporalCoverage', 'provenance', 'limitations'], 'source', errors);
    const id = String(source?.id ?? '');
    if (!/^source_[a-z0-9_-]+$/u.test(id)) errors.push(`ugyldig source-id: ${id || '<tom>'}`);
    if (sourceIds.has(id)) errors.push(`duplikat source-id: ${id}`);
    sourceIds.add(id);
    sourcesById.set(id, source);
    if (!validHttps(source?.url)) errors.push(`${id || 'source'} må ha gyldig https-URL`);
    requireText(source?.sourceLocation, 3, `${id}.sourceLocation`, errors);
    if (!SOURCE_TYPES.has(source?.sourceType)) errors.push(`${id}.sourceType er ugyldig`);
    if (!TEMPORAL_COVERAGE.has(source?.temporalCoverage)) errors.push(`${id}.temporalCoverage er ugyldig`);
    requireText(source?.provenance, 12, `${id}.provenance`, errors);
    requireText(source?.limitations, 12, `${id}.limitations`, errors);
    const age = daysSince(source?.verifiedAt, now);
    if (!Number.isFinite(age)) errors.push(`${id}.verifiedAt må være en gyldig kalenderdato`);
    else if (age < 0) errors.push(`${id}.verifiedAt kan ikke ligge i fremtiden`);
    else if (age > 365) errors.push(`${id}.verifiedAt er eldre enn 365 dager`);
  }
  if (!sources.some((source) => PRIORITY_SOURCE_TYPES.has(source?.sourceType))) {
    errors.push('sources må ha minst én primær, offisiell, register-, statistikk-, arkiv-, årsrapport- eller teknisk kilde');
  }
  if (identity) validateReferenceList(identity.sourceIds, sourceIds, 'economicIdentity.sourceIds', errors);

  const canonicalIds = canonicalEmneIds instanceof Set ? canonicalEmneIds : new Set(canonicalEmneIds ?? []);
  const placeTopics = naeringslivEmneIds(place);
  if (placeTopics.length === 0) errors.push('Næringsliv-stedet må ha minst én canonical em_naering_*-kobling');
  const topics = Array.isArray(report.businessTopics) ? report.businessTopics : [];
  if (topics.length === 0) errors.push('businessTopics må ha minst ett emne');
  const topicIds = [];
  const referencedCaseIds = new Set();
  for (const topic of topics) {
    validateAllowedKeys(topic, ['emneId', 'siteSpecificRationale', 'caseIds'], 'businessTopic', errors);
    const emneId = String(topic?.emneId ?? '');
    topicIds.push(emneId);
    if (!/^em_naering_[a-z0-9_]+$/u.test(emneId)) errors.push(`ugyldig Næringsliv-emne: ${emneId || '<tom>'}`);
    if (!canonicalIds.has(emneId)) errors.push(`ukjent canonical Næringsliv-emne: ${emneId}`);
    requireText(topic?.siteSpecificRationale, 20, `${emneId}.siteSpecificRationale`, errors);
    if (!Array.isArray(topic?.caseIds) || topic.caseIds.length === 0) errors.push(`${emneId}.caseIds må ha minst ett case`);
    for (const caseId of topic?.caseIds ?? []) referencedCaseIds.add(String(caseId));
  }
  if (new Set(topicIds).size !== topicIds.length) errors.push('businessTopics har duplikate emneId-er');
  if (JSON.stringify([...new Set(topicIds)].sort()) !== JSON.stringify([...placeTopics].sort())) {
    errors.push('businessTopics må dekke nøyaktig place-filens canonicale em_naering_*');
  }

  const methods = canonicalMethodIds instanceof Set ? canonicalMethodIds : new Set(canonicalMethodIds ?? []);
  const cases = Array.isArray(report.economicCases) ? report.economicCases : [];
  if (cases.length === 0) errors.push('economicCases må ha minst ett økonomisk case');
  const caseIds = new Set();
  for (const economicCase of cases) {
    const caseId = String(economicCase?.id ?? '');
    const label = `case ${caseId || '<tom>'}`;
    validateAllowedKeys(economicCase, [
      'id',
      'claim',
      'unitOfAnalysis',
      'actors',
      'valueCreation',
      'measurement',
      'distributionAndPower',
      'riskAndExternalities',
      'comparisonAndCausality'
    ], label, errors);
    if (!/^case_[a-z0-9_-]+$/u.test(caseId)) errors.push(`${label} har ugyldig id`);
    if (caseIds.has(caseId)) errors.push(`duplikat case-id: ${caseId}`);
    caseIds.add(caseId);
    requireText(economicCase?.claim, 20, `${label}.claim`, errors);

    const unit = economicCase?.unitOfAnalysis;
    validateAllowedKeys(unit, ['unit', 'boundary', 'scale', 'temporalScope', 'sourceIds'], `${label}.unitOfAnalysis`, errors);
    if (!isObject(unit)) {
      errors.push(`${label}.unitOfAnalysis må være et objekt`);
    } else {
      requireText(unit.unit, 8, `${label}.unitOfAnalysis.unit`, errors);
      requireText(unit.boundary, 12, `${label}.unitOfAnalysis.boundary`, errors);
      if (!['site', 'firm', 'market', 'value_chain', 'network', 'regional_system'].includes(unit.scale)) {
        errors.push(`${label}.unitOfAnalysis.scale er ugyldig`);
      }
      validateTemporalScope(unit.temporalScope, `${label}.unitOfAnalysis.temporalScope`, errors);
      validateReferenceList(unit.sourceIds, sourceIds, `${label}.unitOfAnalysis.sourceIds`, errors);
    }

    const actors = Array.isArray(economicCase?.actors) ? economicCase.actors : [];
    if (actors.length < 2) errors.push(`${label}.actors må ha minst to aktører eller grupper`);
    for (const [index, actor] of actors.entries()) {
      const actorLabel = `${label}.actors[${index}]`;
      validateAllowedKeys(actor, ['name', 'roleOrInterest', 'economicPosition', 'sourceIds'], actorLabel, errors);
      requireText(actor?.name, 1, `${actorLabel}.name`, errors);
      requireText(actor?.roleOrInterest, 8, `${actorLabel}.roleOrInterest`, errors);
      requireText(actor?.economicPosition, 8, `${actorLabel}.economicPosition`, errors);
      validateReferenceList(actor?.sourceIds, sourceIds, `${actorLabel}.sourceIds`, errors);
    }

    const creation = economicCase?.valueCreation;
    validateAllowedKeys(creation, ['inputs', 'activity', 'outputs', 'valueCreationAssessment'], `${label}.valueCreation`, errors);
    if (!isObject(creation)) {
      errors.push(`${label}.valueCreation må være et objekt`);
    } else {
      validateStatementList(creation.inputs, `${label}.valueCreation.inputs`, sourceIds, errors);
      validateStatementWithSources(creation.activity, `${label}.valueCreation.activity`, sourceIds, errors);
      validateStatementList(creation.outputs, `${label}.valueCreation.outputs`, sourceIds, errors);
      validateStatementWithSources(creation.valueCreationAssessment, `${label}.valueCreation.valueCreationAssessment`, sourceIds, errors);
    }

    const measurement = economicCase?.measurement;
    validateAllowedKeys(measurement, [
      'methodId',
      'evidenceType',
      'indicatorOrObservation',
      'unit',
      'period',
      'comparability',
      'dataLimitations',
      'sourceIds'
    ], `${label}.measurement`, errors);
    if (!isObject(measurement)) {
      errors.push(`${label}.measurement må være et objekt`);
    } else {
      if (!methods.has(String(measurement.methodId ?? ''))) errors.push(`${label}.measurement bruker ukjent canonical metode: ${String(measurement.methodId ?? '')}`);
      if (!['quantitative', 'qualitative', 'mixed'].includes(measurement.evidenceType)) errors.push(`${label}.measurement.evidenceType er ugyldig`);
      requireText(measurement.indicatorOrObservation, 12, `${label}.measurement.indicatorOrObservation`, errors);
      requireText(measurement.unit, 1, `${label}.measurement.unit`, errors);
      requireText(measurement.period, 1, `${label}.measurement.period`, errors);
      requireText(measurement.comparability, 12, `${label}.measurement.comparability`, errors);
      requireText(measurement.dataLimitations, 12, `${label}.measurement.dataLimitations`, errors);
      validateReferenceList(measurement.sourceIds, sourceIds, `${label}.measurement.sourceIds`, errors);
    }

    const distribution = economicCase?.distributionAndPower;
    validateAllowedKeys(distribution, ['ownershipOrControl', 'laborPosition', 'beneficiaries', 'costRiskBearers', 'sourceIds'], `${label}.distributionAndPower`, errors);
    if (!isObject(distribution)) {
      errors.push(`${label}.distributionAndPower må være et objekt`);
    } else {
      requireText(distribution.ownershipOrControl, 12, `${label}.distributionAndPower.ownershipOrControl`, errors);
      requireText(distribution.laborPosition, 12, `${label}.distributionAndPower.laborPosition`, errors);
      if (!Array.isArray(distribution.beneficiaries) || distribution.beneficiaries.length === 0) errors.push(`${label}.distributionAndPower.beneficiaries mangler`);
      if (!Array.isArray(distribution.costRiskBearers) || distribution.costRiskBearers.length === 0) errors.push(`${label}.distributionAndPower.costRiskBearers mangler`);
      validateReferenceList(distribution.sourceIds, sourceIds, `${label}.distributionAndPower.sourceIds`, errors);
    }

    const risk = economicCase?.riskAndExternalities;
    validateAllowedKeys(risk, ['riskAssessment', 'externalityAssessment'], `${label}.riskAndExternalities`, errors);
    if (!isObject(risk)) {
      errors.push(`${label}.riskAndExternalities må være et objekt`);
    } else {
      validateStatementWithSources(risk.riskAssessment, `${label}.riskAndExternalities.riskAssessment`, sourceIds, errors);
      const externality = risk.externalityAssessment;
      validateAllowedKeys(
        externality,
        externality?.status === 'documented' ? ['status', 'statement', 'sourceIds'] : ['status', 'rationale'],
        `${label}.riskAndExternalities.externalityAssessment`,
        errors
      );
      if (!isObject(externality) || !['documented', 'not_applicable'].includes(externality.status)) {
        errors.push(`${label}.riskAndExternalities.externalityAssessment har ugyldig status`);
      } else if (externality.status === 'documented') {
        requireText(externality.statement, 12, `${label}.riskAndExternalities.externalityAssessment.statement`, errors);
        validateReferenceList(externality.sourceIds, sourceIds, `${label}.riskAndExternalities.externalityAssessment.sourceIds`, errors);
      } else {
        requireText(externality.rationale, 12, `${label}.riskAndExternalities.externalityAssessment.rationale`, errors);
      }
    }

    const comparison = economicCase?.comparisonAndCausality;
    validateAllowedKeys(comparison, [
      'comparisonBasis',
      'causalStatus',
      'causalAssessment',
      'alternativeExplanations',
      'uncertainty',
      'sourceIds'
    ], `${label}.comparisonAndCausality`, errors);
    if (!isObject(comparison)) {
      errors.push(`${label}.comparisonAndCausality må være et objekt`);
    } else {
      requireText(comparison.comparisonBasis, 20, `${label}.comparisonAndCausality.comparisonBasis`, errors);
      if (!['descriptive_only', 'associational', 'causal_supported'].includes(comparison.causalStatus)) errors.push(`${label}.comparisonAndCausality.causalStatus er ugyldig`);
      requireText(comparison.causalAssessment, 20, `${label}.comparisonAndCausality.causalAssessment`, errors);
      if (!Array.isArray(comparison.alternativeExplanations) || comparison.alternativeExplanations.length === 0) {
        errors.push(`${label}.comparisonAndCausality må ha minst én alternativ forklaring`);
      }
      requireText(comparison.uncertainty, 12, `${label}.comparisonAndCausality.uncertainty`, errors);
      validateReferenceList(comparison.sourceIds, sourceIds, `${label}.comparisonAndCausality.sourceIds`, errors, 2);
      const comparedTypes = new Set((comparison.sourceIds ?? [])
        .map((id) => sourcesById.get(String(id))?.sourceType)
        .filter(Boolean));
      if (comparedTypes.size < 2) errors.push(`${label}.comparisonAndCausality må bruke minst to kildetyper`);
    }
  }
  for (const referencedCaseId of referencedCaseIds) {
    if (!caseIds.has(referencedCaseId)) errors.push(`businessTopics peker til ukjent case: ${referencedCaseId}`);
  }
  for (const caseId of caseIds) {
    if (!referencedCaseIds.has(caseId)) errors.push(`economicCases inneholder ukoblet case: ${caseId}`);
  }

  const present = report.presentOperation;
  validateAllowedKeys(present, ['operationalStatus', 'statement', 'originalEconomicRoleRelationship', 'checkedAt', 'sourceIds'], 'presentOperation', errors);
  if (!isObject(present)) {
    errors.push('presentOperation må være et objekt');
  } else {
    if (!OPERATIONAL_STATUSES.has(present.operationalStatus)) errors.push('presentOperation.operationalStatus er ugyldig');
    requireText(present.statement, 20, 'presentOperation.statement', errors);
    requireText(present.originalEconomicRoleRelationship, 20, 'presentOperation.originalEconomicRoleRelationship', errors);
    const checkedAge = daysSince(present.checkedAt, now);
    if (!Number.isFinite(checkedAge)) errors.push('presentOperation.checkedAt må være en gyldig kalenderdato');
    else if (checkedAge < 0) errors.push('presentOperation.checkedAt kan ikke ligge i fremtiden');
    else if (checkedAge > 365) errors.push('presentOperation.checkedAt er eldre enn 365 dager');
    validateReferenceList(present.sourceIds, sourceIds, 'presentOperation.sourceIds', errors);
    const hasCurrentSource = (present.sourceIds ?? []).some((id) => {
      const source = sourcesById.get(String(id));
      return source?.temporalCoverage === 'current' && daysSince(source.verifiedAt, now) <= 365;
    });
    if (!hasCurrentSource) errors.push('presentOperation må ha minst én current-kilde kontrollert siste 365 dager');
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
    for (const fileKey of ['sourceBrief', 'productionContext']) {
      const target = String(quiz[fileKey] ?? '');
      if (!target || !fs.existsSync(path.join(root, target))) errors.push(`quizOpening.${fileKey} peker ikke til en eksisterende fil: ${target || '<tom>'}`);
    }
    if (!Array.isArray(quiz.requiredInputs) || quiz.requiredInputs.length === 0) errors.push('quizOpening.requiredInputs mangler');
    for (const target of quiz.requiredInputs ?? []) {
      if (!fs.existsSync(path.join(root, String(target)))) errors.push(`quiz required_input finnes ikke: ${String(target)}`);
    }
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
    if (gates?.[letter]?.status !== 'PASS') errors.push(`gate ${letter} må være PASS for et ferdig Næringsliv-sted`);
  }
  if (gates?.G?.status !== quiz?.status) errors.push('gate G må samsvare med quizOpening.status');
  if (gates?.H?.status !== chronology?.status) errors.push('gate H må samsvare med chronologyStories.status');

  const review = report.review;
  validateAllowedKeys(review, ['reviewer', 'reviewedAt', 'notes'], 'review', errors);
  if (!isObject(review)) {
    errors.push('review må være et objekt');
  } else {
    requireText(review.reviewer, 1, 'review.reviewer', errors);
    requireText(review.notes, 1, 'review.notes', errors);
    const age = daysSince(review.reviewedAt, now);
    if (!Number.isFinite(age)) errors.push('review.reviewedAt må være en gyldig kalenderdato');
    else if (age < 0) errors.push('review.reviewedAt kan ikke ligge i fremtiden');
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
  errors.push(...validateNaeringslivPlaceReport({ report, place, canonicalEmneIds, canonicalMethodIds, root, now }));
  return { report, errors };
}

export function auditNaeringslivPlaceProduction({
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
  const canonicalEmneIds = canonicalNaeringslivEmneIds(root);
  const canonicalMethodIds = canonicalNaeringslivMethodIds(root);
  const schema = readJson(root, SCHEMA_PATH);
  if (schema?.properties?.schemaVersion?.const !== 'naeringsliv_place_production_v1') {
    failures.push(`${SCHEMA_PATH}: schemaVersion er ute av sync`);
  }

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
        if (currentPlace && isNaeringslivPlace(currentPlace)) {
          failures.push(`${placeId}: Næringsliv-produksjonsrapporten er slettet mens stedet fortsatt er et Næringsliv-sted`);
        }
      } catch {
        failures.push(`${reportPath}: slettet rapport kunne ikke leses fra base`);
      }
    }

    for (const [placeId, entry] of required) {
      if (!fs.existsSync(path.join(root, entry.reportPath))) {
        failures.push(`${placeId}: mangler obligatorisk Næringsliv-produksjonsrapport ${entry.reportPath}`);
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
    const result = auditNaeringslivPlaceProduction({ root: process.cwd(), ...parseArgs(process.argv.slice(2)) });
    for (const failure of result.failures) console.error(`FAIL ${failure}`);
    console.log(`Næringsliv place production: ${result.summary.checked} checked, ${result.summary.failures} failures`);
    if (result.status !== 'passed') process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
