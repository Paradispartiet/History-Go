import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const VALIDATOR_VERSION = '1.0.0';

const REPORT_DIR = 'data/places/historie-production';
const SCHEMA_PATH = 'data/places/regler/historie_place_production_v1.schema.json';
const MANIFEST_PATH = 'data/places/manifest.json';
const HISTORY_EMNER_PATH = 'data/fag/historie/emner_historie_canonical_v4_5.json';
const REQUIRED_GATES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const MANDATORY_READY_GATES = ['A', 'B', 'C', 'D', 'E', 'F'];
const PRODUCTION_FIELDS = [
  'name',
  'altNames',
  'formerNames',
  'category',
  'emne_ids',
  'year',
  'period',
  'historicalPeriod',
  'desc',
  'popupDesc',
  'quiz_profile',
  'chronology',
  'stories',
  'story_ids'
];
const PLACE_RELATION_TYPES = new Set([
  'event_site',
  'institution_site',
  'material_trace',
  'residence_or_workplace',
  'findspot',
  'later_memory_site',
  'reconstructed_site',
  'moved_object_site',
  'historical_landscape'
]);
const SOURCE_TYPES = new Set([
  'primary',
  'official',
  'institutional',
  'archive',
  'archaeological_report',
  'scholarly',
  'museum_or_heritage',
  'oral_history',
  'reputable_secondary'
]);
const TEMPORAL_COVERAGE = new Set(['contemporary_to_event', 'retrospective', 'current', 'mixed']);
const PRESENT_TRACE_STATUSES = new Set([
  'original',
  'altered',
  'reconstructed',
  'moved',
  'destroyed',
  'commemorative',
  'landscape_trace'
]);
const TOP_LEVEL_KEYS = new Set([
  'schemaVersion',
  'validatorVersion',
  'placeId',
  'placeFile',
  'status',
  'historicalIdentity',
  'historyTopics',
  'sources',
  'caseRealizations',
  'presentTrace',
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

export function isCanonicalMicroPlace(place) {
  return place?.placeTier === 'micro'
    && place?.micro_place_profile?.schema === 'history_go_micro_place_profile_v1';
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

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(String(value ?? ''))) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function daysSince(value, now = new Date()) {
  const parsed = parseDate(value);
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

function canonicalHistoryEmneIds(root) {
  const emner = readJson(root, HISTORY_EMNER_PATH);
  return new Set((Array.isArray(emner) ? emner : [])
    .map((entry) => String(entry?.emne_id ?? ''))
    .filter((id) => id.startsWith('em_his_')));
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
      if (!isHistoryPlace(place) || isCanonicalMicroPlace(place)) continue;
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
  if (!['day', 'year', 'decade', 'century', 'period', 'relative', 'uncertain'].includes(scope.precision)) {
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

export function validateHistoriePlaceReport({ report, place, canonicalEmneIds, root = process.cwd(), now = new Date() }) {
  const errors = [];
  if (!isObject(report)) return ['rapporten må være et JSON-objekt'];

  for (const key of Object.keys(report)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors.push(`ukjent toppnivåfelt: ${key}`);
  }
  for (const key of TOP_LEVEL_KEYS) {
    if (!(key in report)) errors.push(`mangler toppnivåfelt: ${key}`);
  }

  const placeId = String(report.placeId ?? '');
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
  validateAllowedKeys(identity, ['statement', 'placeRelationType', 'placeRelationStatement', 'temporalScope', 'sourceIds'], 'historicalIdentity', errors);
  if (!isObject(identity)) {
    errors.push('historicalIdentity må være et objekt');
  } else {
    requireText(identity.statement, 20, 'historicalIdentity.statement', errors);
    if (!PLACE_RELATION_TYPES.has(identity.placeRelationType)) errors.push('historicalIdentity.placeRelationType er ugyldig');
    requireText(identity.placeRelationStatement, 20, 'historicalIdentity.placeRelationStatement', errors);
    validateTemporalScope(identity.temporalScope, 'historicalIdentity.temporalScope', errors);
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
    if (!Number.isFinite(age)) errors.push(`${id}.verifiedAt må være en gyldig dato`);
    if (age < 0) errors.push(`${id}.verifiedAt kan ikke ligge i fremtiden`);
  }
  if (identity) validateReferenceList(identity.sourceIds, sourceIds, 'historicalIdentity.sourceIds', errors);

  const canonicalIds = canonicalEmneIds instanceof Set ? canonicalEmneIds : new Set(canonicalEmneIds ?? []);
  const placeTopics = historyEmneIds(place);
  if (placeTopics.length === 0) errors.push('Historie-stedet må ha minst én canonical em_his_*-kobling');
  const topics = Array.isArray(report.historyTopics) ? report.historyTopics : [];
  if (topics.length === 0) errors.push('historyTopics må ha minst ett emne');
  const topicIds = [];
  const referencedCaseIds = new Set();
  for (const topic of topics) {
    validateAllowedKeys(topic, ['emneId', 'siteSpecificRationale', 'caseIds'], 'historyTopic', errors);
    const emneId = String(topic?.emneId ?? '');
    topicIds.push(emneId);
    if (!/^em_his_[a-z0-9_]+$/u.test(emneId)) errors.push(`ugyldig Historie-emne: ${emneId || '<tom>'}`);
    if (!canonicalIds.has(emneId)) errors.push(`ukjent canonical Historie-emne: ${emneId}`);
    requireText(topic?.siteSpecificRationale, 20, `${emneId}.siteSpecificRationale`, errors);
    if (!Array.isArray(topic?.caseIds) || topic.caseIds.length === 0) errors.push(`${emneId}.caseIds må ha minst ett case`);
    for (const caseId of topic?.caseIds ?? []) referencedCaseIds.add(String(caseId));
  }
  if (new Set(topicIds).size !== topicIds.length) errors.push('historyTopics har duplikate emneId-er');
  if (JSON.stringify([...new Set(topicIds)].sort()) !== JSON.stringify([...placeTopics].sort())) {
    errors.push('historyTopics må dekke nøyaktig place-filens canonicale em_his_*');
  }

  const cases = Array.isArray(report.caseRealizations) ? report.caseRealizations : [];
  if (cases.length === 0) errors.push('caseRealizations må ha minst ett historisk case');
  const caseIds = new Set();
  for (const historicalCase of cases) {
    const label = `case ${String(historicalCase?.id ?? '<tom>')}`;
    validateAllowedKeys(historicalCase, ['id', 'claim', 'temporalSequence', 'actors', 'conflictOrNegotiation', 'sourceComparison', 'comparativeScale', 'causationAndUncertainty'], label, errors);
    const caseId = String(historicalCase?.id ?? '');
    if (!/^case_[a-z0-9_-]+$/u.test(caseId)) errors.push(`${label} har ugyldig id`);
    if (caseIds.has(caseId)) errors.push(`duplikat case-id: ${caseId}`);
    caseIds.add(caseId);
    requireText(historicalCase?.claim, 20, `${label}.claim`, errors);

    const sequence = historicalCase?.temporalSequence;
    validateAllowedKeys(sequence, ['scope', 'startPoint', 'endPoint', 'breaks', 'continuities', 'sourceIds'], `${label}.temporalSequence`, errors);
    if (!isObject(sequence)) {
      errors.push(`${label}.temporalSequence må være et objekt`);
    } else {
      validateTemporalScope(sequence.scope, `${label}.temporalSequence.scope`, errors);
      requireText(sequence.startPoint, 12, `${label}.temporalSequence.startPoint`, errors);
      requireText(sequence.endPoint, 12, `${label}.temporalSequence.endPoint`, errors);
      if (!Array.isArray(sequence.breaks) || sequence.breaks.length === 0) errors.push(`${label} må dokumentere minst ett brudd eller vendepunkt`);
      if (!Array.isArray(sequence.continuities) || sequence.continuities.length === 0) errors.push(`${label} må dokumentere minst én kontinuitet`);
      validateReferenceList(sequence.sourceIds, sourceIds, `${label}.temporalSequence.sourceIds`, errors);
    }

    const actors = Array.isArray(historicalCase?.actors) ? historicalCase.actors : [];
    if (actors.length < 2) errors.push(`${label}.actors må ha minst to aktører eller grupper`);
    for (const [index, actor] of actors.entries()) {
      const actorLabel = `${label}.actors[${index}]`;
      validateAllowedKeys(actor, ['name', 'roleOrInterest', 'powerPosition', 'sourceIds'], actorLabel, errors);
      requireText(actor?.name, 1, `${actorLabel}.name`, errors);
      requireText(actor?.roleOrInterest, 8, `${actorLabel}.roleOrInterest`, errors);
      requireText(actor?.powerPosition, 8, `${actorLabel}.powerPosition`, errors);
      validateReferenceList(actor?.sourceIds, sourceIds, `${actorLabel}.sourceIds`, errors);
    }
    validateStatementWithSources(historicalCase?.conflictOrNegotiation, `${label}.conflictOrNegotiation`, sourceIds, errors);

    const comparison = historicalCase?.sourceComparison;
    validateAllowedKeys(comparison, ['sourceIds', 'comparison', 'contradictionsOrSilences', 'conclusionLimits'], `${label}.sourceComparison`, errors);
    if (!isObject(comparison)) {
      errors.push(`${label}.sourceComparison må være et objekt`);
    } else {
      validateReferenceList(comparison.sourceIds, sourceIds, `${label}.sourceComparison.sourceIds`, errors, 2);
      const comparedTypes = new Set((comparison.sourceIds ?? []).map((id) => sourcesById.get(String(id))?.sourceType).filter(Boolean));
      if (comparedTypes.size < 2) errors.push(`${label}.sourceComparison må sammenligne minst to kildetyper`);
      requireText(comparison.comparison, 20, `${label}.sourceComparison.comparison`, errors);
      requireText(comparison.contradictionsOrSilences, 12, `${label}.sourceComparison.contradictionsOrSilences`, errors);
      requireText(comparison.conclusionLimits, 12, `${label}.sourceComparison.conclusionLimits`, errors);
    }

    const scale = historicalCase?.comparativeScale;
    validateAllowedKeys(scale, ['localFinding', 'widerContext', 'scale', 'sourceIds'], `${label}.comparativeScale`, errors);
    if (!isObject(scale)) {
      errors.push(`${label}.comparativeScale må være et objekt`);
    } else {
      requireText(scale.localFinding, 12, `${label}.comparativeScale.localFinding`, errors);
      requireText(scale.widerContext, 12, `${label}.comparativeScale.widerContext`, errors);
      if (!['regional', 'national', 'nordic', 'european', 'global'].includes(scale.scale)) errors.push(`${label}.comparativeScale.scale er ugyldig`);
      validateReferenceList(scale.sourceIds, sourceIds, `${label}.comparativeScale.sourceIds`, errors);
    }

    const causation = historicalCase?.causationAndUncertainty;
    validateAllowedKeys(causation, ['causalAssessment', 'alternativeExplanations', 'uncertainty', 'sourceIds'], `${label}.causationAndUncertainty`, errors);
    if (!isObject(causation)) {
      errors.push(`${label}.causationAndUncertainty må være et objekt`);
    } else {
      requireText(causation.causalAssessment, 20, `${label}.causationAndUncertainty.causalAssessment`, errors);
      if (!Array.isArray(causation.alternativeExplanations) || causation.alternativeExplanations.length === 0) {
        errors.push(`${label}.causationAndUncertainty må ha minst én alternativ forklaring`);
      }
      requireText(causation.uncertainty, 12, `${label}.causationAndUncertainty.uncertainty`, errors);
      validateReferenceList(causation.sourceIds, sourceIds, `${label}.causationAndUncertainty.sourceIds`, errors);
    }
  }
  for (const referencedCaseId of referencedCaseIds) {
    if (!caseIds.has(referencedCaseId)) errors.push(`historyTopics peker til ukjent case: ${referencedCaseId}`);
  }
  for (const caseId of caseIds) {
    if (!referencedCaseIds.has(caseId)) errors.push(`caseRealizations inneholder ukoblet case: ${caseId}`);
  }

  const trace = report.presentTrace;
  validateAllowedKeys(trace, ['objectStatus', 'statement', 'originalSiteRelationship', 'sourceIds'], 'presentTrace', errors);
  if (!isObject(trace)) {
    errors.push('presentTrace må være et objekt');
  } else {
    if (!PRESENT_TRACE_STATUSES.has(trace.objectStatus)) errors.push('presentTrace.objectStatus er ugyldig');
    requireText(trace.statement, 20, 'presentTrace.statement', errors);
    requireText(trace.originalSiteRelationship, 20, 'presentTrace.originalSiteRelationship', errors);
    validateReferenceList(trace.sourceIds, sourceIds, 'presentTrace.sourceIds', errors);
    const hasCurrentSource = (trace.sourceIds ?? []).some((id) => {
      const source = sourcesById.get(String(id));
      return source?.temporalCoverage === 'current' && daysSince(source.verifiedAt, now) <= 365;
    });
    if (!hasCurrentSource) errors.push('presentTrace må ha minst én current-kilde kontrollert siste 365 dager');
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
    if (gates?.[letter]?.status !== 'PASS') errors.push(`gate ${letter} må være PASS for et ferdig Historie-sted`);
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
    if (!Number.isFinite(age)) errors.push('review.reviewedAt må være en gyldig dato');
    if (age < 0) errors.push('review.reviewedAt kan ikke ligge i fremtiden');
  }

  if (fs.existsSync(path.join(root, SCHEMA_PATH)) === false) errors.push(`mangler schema: ${SCHEMA_PATH}`);
  return errors;
}

function validateReportPath(root, reportPath, canonicalEmneIds, manifestPaths, now) {
  const report = readJson(root, reportPath);
  const expectedReportPath = `${REPORT_DIR}/${String(report.placeId ?? '')}.json`;
  const errors = [];
  if (reportPath !== expectedReportPath) errors.push(`rapportfil må hete ${expectedReportPath}`);
  const placeFile = repoPath(report.placeFile);
  if (!manifestPaths.has(placeFile)) errors.push(`placeFile er ikke manifest-loadet: ${placeFile}`);
  const place = findPlace(root, placeFile, String(report.placeId ?? ''));
  errors.push(...validateHistoriePlaceReport({ report, place, canonicalEmneIds, root, now }));
  return { report, errors };
}

export function auditHistoriePlaceProduction({
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
  const canonicalEmneIds = canonicalHistoryEmneIds(root);

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
        if (currentPlace && isHistoryPlace(currentPlace) && !isCanonicalMicroPlace(currentPlace)) {
          failures.push(`${placeId}: Historie-produksjonsrapporten er slettet mens stedet fortsatt er et Historie-sted`);
        }
      } catch {
        failures.push(`${reportPath}: slettet rapport kunne ikke leses fra base`);
      }
    }

    for (const [placeId, entry] of required) {
      if (!fs.existsSync(path.join(root, entry.reportPath))) {
        failures.push(`${placeId}: mangler obligatorisk Historie-produksjonsrapport ${entry.reportPath}`);
      } else {
        reportsToCheck.add(entry.reportPath);
      }
    }

    for (const reportPath of [...reportsToCheck].sort()) {
      const result = validateReportPath(root, reportPath, canonicalEmneIds, manifestPaths, now);
      checked.push(reportPath);
      for (const error of result.errors) failures.push(`${reportPath}: ${error}`);
    }
  } else if (mode === 'all') {
    for (const reportPath of listReportPaths(root)) {
      const result = validateReportPath(root, reportPath, canonicalEmneIds, manifestPaths, now);
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
    const result = auditHistoriePlaceProduction(options);
    for (const failure of result.failures) console.error(`FAIL ${failure}`);
    console.log(`Historie place production: ${result.summary.checked} checked, ${result.summary.failures} failures`);
    if (result.status !== 'passed') process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
