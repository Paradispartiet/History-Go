import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const VALIDATOR_VERSION = '1.0.0';

const REPORT_DIR = 'data/places/politikk-production';
const MICRO_PRODUCTION_DIR = 'data/places/production';
const SCHEMA_PATH = 'data/places/regler/politikk_place_production_v1.schema.json';
const MANIFEST_PATH = 'data/places/manifest.json';
const POLITIKK_MANIFEST_PATH = 'data/fag/politikk/politikk_runtime_manifest.json';
const REQUIRED_GATES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const REQUIRED_STAGES = [
  'institutionActor',
  'competenceRole',
  'ruleDecision',
  'resourceInstrument',
  'implementation',
  'output',
  'outcomeEffect'
];
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
const SOURCE_TYPES = new Set([
  'primary',
  'official',
  'institutional',
  'archive',
  'scholarly',
  'reputable_secondary'
]);
const TOP_LEVEL_KEYS = new Set([
  'schemaVersion',
  'validatorVersion',
  'placeId',
  'placeFile',
  'status',
  'primaryFunction',
  'politicsTopics',
  'sources',
  'evidenceChains',
  'currentVerification',
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

function politicsEmneIds(place) {
  return [...new Set((Array.isArray(place?.emne_ids) ? place.emne_ids : [])
    .map(String)
    .filter((id) => id.startsWith('em_pol_')))];
}

function isPoliticsPlace(place) {
  return place?.category === 'politikk' || politicsEmneIds(place).length > 0;
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

export function hasApprovedMicroPlacePacket(root, place, placeFile) {
  if (place?.placeTier !== 'micro' || place?.micro_place_profile?.schema !== 'history_go_micro_place_profile_v1') return false;
  const placeId = String(place?.id ?? '');
  if (!placeId) return false;
  const packetPath = `${MICRO_PRODUCTION_DIR}/${placeId}.json`;
  if (!fs.existsSync(path.join(root, packetPath))) return false;
  try {
    const packet = readJson(root, packetPath);
    const reviewers = [packet?.reviews?.factual?.reviewer, packet?.reviews?.editorial?.reviewer].map((value) => String(value ?? '').trim());
    return packet?.schemaVersion === '4.2'
      && packet?.validatorVersion === '4.2.1'
      && packet?.placeId === placeId
      && repoPath(packet?.placeFile) === placeFile
      && packet?.status === 'ready_v4_2'
      && Array.isArray(packet?.claims)
      && packet.claims.length > 0
      && isObject(packet?.sentenceCoverage)
      && packet?.reviews?.factual?.status === 'passed'
      && packet?.reviews?.editorial?.status === 'passed'
      && reviewers.every((reviewer) => reviewer.length > 0 && !/generator|materializer/iu.test(reviewer))
      && packet?.completion?.factualReview === 'passed'
      && packet?.completion?.editorialReview === 'passed';
  } catch {
    return false;
  }
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
      if (!isPoliticsPlace(place)) continue;
      const placeId = String(place.id ?? '');
      if (!placeId || !productionFieldsChanged(previousById.get(placeId), place)) continue;
      if (hasApprovedMicroPlacePacket(root, place, changedPath)) continue;
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

export function validatePolitikkPlaceReport({ report, place, canonicalEmneIds, root = process.cwd(), now = new Date() }) {
  const errors = [];
  const placeId = String(report?.placeId ?? '');

  if (!isObject(report)) return ['rapporten må være et JSON-objekt'];
  for (const key of Object.keys(report)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors.push(`ukjent toppnivåfelt: ${key}`);
  }
  for (const key of TOP_LEVEL_KEYS) {
    if (!(key in report)) errors.push(`mangler toppnivåfelt: ${key}`);
  }

  if (report.schemaVersion !== 'politikk_place_production_v1') errors.push('schemaVersion må være politikk_place_production_v1');
  if (report.validatorVersion !== VALIDATOR_VERSION) errors.push(`validatorVersion må være ${VALIDATOR_VERSION}`);
  if (!/^[a-z0-9][a-z0-9_-]*$/u.test(placeId)) errors.push('placeId har ugyldig format');
  if (!isObject(place)) errors.push(`placeFile inneholder ikke placeId ${placeId}`);
  if (place && String(place.id) !== placeId) errors.push('placeId samsvarer ikke med place-filen');
  if (place && !isPoliticsPlace(place)) errors.push('stedet er ikke et Politikk-sted eller koblet til em_pol_*');
  if (!String(report.placeFile ?? '').startsWith('data/places/') || !String(report.placeFile ?? '').endsWith('.json')) {
    errors.push('placeFile må peke til en JSON-fil under data/places');
  }
  if (report.status !== 'ready') errors.push('status må være ready før Politikk-stedet kan godkjennes');

  const primary = report.primaryFunction;
  validateAllowedKeys(primary, ['statement', 'placeObjectDistinction', 'sourceIds'], 'primaryFunction', errors);
  if (!isObject(primary) || String(primary.statement ?? '').trim().length < 20) errors.push('primaryFunction.statement er for kort');
  if (!isObject(primary) || String(primary.placeObjectDistinction ?? '').trim().length < 20) errors.push('primaryFunction.placeObjectDistinction er for kort');

  const sources = Array.isArray(report.sources) ? report.sources : [];
  if (sources.length === 0) errors.push('sources må ha minst én ekstern kilde');
  const sourceIds = new Set();
  for (const source of sources) {
    validateAllowedKeys(source, ['id', 'url', 'sourceLocation', 'sourceType', 'verifiedAt', 'temporalStatus'], 'source', errors);
    const id = String(source?.id ?? '');
    if (!/^source_[a-z0-9_-]+$/u.test(id)) errors.push(`ugyldig source-id: ${id || '<tom>'}`);
    if (sourceIds.has(id)) errors.push(`duplisert source-id: ${id}`);
    sourceIds.add(id);
    if (!validHttps(source?.url)) errors.push(`${id} mangler gyldig HTTPS-URL`);
    if (String(source?.sourceLocation ?? '').trim().length < 3) errors.push(`${id} mangler sourceLocation`);
    if (!SOURCE_TYPES.has(source?.sourceType)) errors.push(`${id} har ugyldig sourceType`);
    const verifiedAt = parseDate(source?.verifiedAt);
    if (!verifiedAt) errors.push(`${id} har ugyldig verifiedAt`);
    else if (verifiedAt.valueOf() > now.valueOf()) errors.push(`${id} er verifisert i fremtiden`);
    if (!['historical', 'current', 'superseded'].includes(source?.temporalStatus)) errors.push(`${id} har ugyldig temporalStatus`);
  }
  validateReferenceList(primary?.sourceIds, sourceIds, 'primaryFunction.sourceIds', errors);

  const chains = Array.isArray(report.evidenceChains) ? report.evidenceChains : [];
  if (chains.length === 0) errors.push('evidenceChains må ha minst én kjede');
  const chainIds = new Set();
  for (const chain of chains) {
    validateAllowedKeys(chain, ['id', 'claim', 'stages'], 'evidenceChain', errors);
    validateAllowedKeys(chain?.stages, REQUIRED_STAGES, `${chain?.id ?? 'evidenceChain'}.stages`, errors);
    const chainId = String(chain?.id ?? '');
    if (!/^chain_[a-z0-9_-]+$/u.test(chainId)) errors.push(`ugyldig chain-id: ${chainId || '<tom>'}`);
    if (chainIds.has(chainId)) errors.push(`duplisert chain-id: ${chainId}`);
    chainIds.add(chainId);
    if (String(chain?.claim ?? '').trim().length < 20) errors.push(`${chainId} har for kort claim`);
    for (const stageName of REQUIRED_STAGES) {
      const stage = chain?.stages?.[stageName];
      validateAllowedKeys(
        stage,
        stage?.status === 'documented' ? ['status', 'statement', 'sourceIds'] : ['status', 'rationale'],
        `${chainId}.${stageName}`,
        errors
      );
      if (!isObject(stage) || !['documented', 'not_applicable', 'missing'].includes(stage.status)) {
        errors.push(`${chainId}.${stageName} mangler gyldig status`);
        continue;
      }
      if (stage.status === 'documented') {
        if (String(stage.statement ?? '').trim().length < 8) errors.push(`${chainId}.${stageName} mangler konkret statement`);
        validateReferenceList(stage.sourceIds, sourceIds, `${chainId}.${stageName}.sourceIds`, errors);
      } else if (String(stage.rationale ?? '').trim().length < 12) {
        errors.push(`${chainId}.${stageName} mangler begrunnelse`);
      }
      if (report.status === 'ready' && stage.status === 'missing') errors.push(`${chainId}.${stageName} kan ikke være missing i en ready-rapport`);
    }
    if (chain?.stages?.institutionActor?.status !== 'documented') errors.push(`${chainId}.institutionActor må være documented`);
    if (chain?.stages?.competenceRole?.status !== 'documented') errors.push(`${chainId}.competenceRole må være documented`);
  }

  const placeTopicIds = politicsEmneIds(place);
  const topicRows = Array.isArray(report.politicsTopics) ? report.politicsTopics : [];
  const reportTopicIds = topicRows.map((row) => String(row?.emneId ?? ''));
  if (new Set(reportTopicIds).size !== reportTopicIds.length) errors.push('politicsTopics har dupliserte emneId-er');
  if (!sameValue([...reportTopicIds].sort(), [...placeTopicIds].sort())) {
    errors.push('politicsTopics må dekke nøyaktig place-filens canonicale em_pol_*');
  }
  for (const topic of topicRows) {
    validateAllowedKeys(topic, ['emneId', 'siteSpecificRationale', 'evidenceChainIds'], 'politicsTopic', errors);
    const emneId = String(topic?.emneId ?? '');
    if (!canonicalEmneIds.has(emneId)) errors.push(`ukjent canonical Politikk-emne: ${emneId}`);
    if (String(topic?.siteSpecificRationale ?? '').trim().length < 20) errors.push(`${emneId} mangler stedsspesifikk begrunnelse`);
    validateReferenceList(topic?.evidenceChainIds, chainIds, `${emneId}.evidenceChainIds`, errors);
  }

  const currentSources = sources.filter((source) => source?.temporalStatus === 'current');
  const current = report.currentVerification;
  validateAllowedKeys(
    current,
    current?.status === 'PASS' ? ['status', 'checkedAt', 'currentClaimIds', 'sourceIds'] : ['status', 'rationale'],
    'currentVerification',
    errors
  );
  if (!isObject(current) || !['PASS', 'N/A'].includes(current.status)) {
    errors.push('currentVerification må ha status PASS eller N/A');
  } else if (current.status === 'PASS') {
    if (daysSince(current.checkedAt, now) > 180) errors.push('currentVerification.checkedAt er ugyldig eller eldre enn 180 dager');
    validateReferenceList(current.sourceIds, sourceIds, 'currentVerification.sourceIds', errors);
    validateReferenceList(current.currentClaimIds, chainIds, 'currentVerification.currentClaimIds', errors);
    for (const sourceId of current.sourceIds ?? []) {
      const source = sources.find((entry) => entry.id === sourceId);
      if (source?.temporalStatus !== 'current') errors.push(`currentVerification peker til ikke-current kilde: ${sourceId}`);
      if (daysSince(source?.verifiedAt, now) > 180) errors.push(`current kilde er eldre enn 180 dager: ${sourceId}`);
    }
  } else {
    if (currentSources.length > 0) errors.push('currentVerification kan ikke være N/A når rapporten har current-kilder');
    if (String(current.rationale ?? '').trim().length < 12) errors.push('currentVerification N/A mangler begrunnelse');
  }

  const quiz = report.quizOpening;
  validateAllowedKeys(
    quiz,
    quiz?.status === 'PASS'
      ? ['status', 'quizTargetId', 'firstTwoSetsQuestionCount', 'sourceBrief', 'productionContext', 'requiredInputs']
      : ['status', 'rationale'],
    'quizOpening',
    errors
  );
  if (!isObject(quiz) || !['PASS', 'N/A'].includes(quiz.status)) {
    errors.push('quizOpening må ha status PASS eller N/A');
  } else if (quiz.status === 'PASS') {
    if (quiz.firstTwoSetsQuestionCount !== 14) errors.push('quizOpening må dokumentere nøyaktig 14 spørsmål i sett 1–2');
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

  for (const letter of REQUIRED_GATES) validateGate(report.gates?.[letter], letter, errors);
  for (const letter of ['A', 'B', 'C', 'D', 'E']) {
    if (report.gates?.[letter]?.status !== 'PASS') errors.push(`gate ${letter} må være PASS for et ferdig Politikk-sted`);
  }
  if (report.gates?.F?.status !== quiz?.status) errors.push('gate F må samsvare med quizOpening.status');
  if (report.gates?.G?.status !== chronology?.status) errors.push('gate G må samsvare med chronologyStories.status');

  validateAllowedKeys(report.review, ['reviewer', 'reviewedAt', 'notes'], 'review', errors);
  if (!isObject(report.review) || String(report.review.reviewer ?? '').trim().length === 0) errors.push('review.reviewer mangler');
  if (!parseDate(report.review?.reviewedAt)) errors.push('review.reviewedAt har ugyldig dato');
  if (String(report.review?.notes ?? '').trim().length === 0) errors.push('review.notes mangler');

  return errors;
}

export function auditPolitikkPlaceProduction({ root = process.cwd(), mode = 'all', base = null, head = 'HEAD', now = new Date() } = {}) {
  const failures = [];
  const checkedReports = new Set();
  const schema = readJson(root, SCHEMA_PATH);
  if (schema?.properties?.validatorVersion?.pattern !== '^1\\.0\\.[0-9]+$') {
    failures.push(`${SCHEMA_PATH}: schemaets validatorVersion-pattern er ute av sync`);
  }

  const politikkManifest = readJson(root, POLITIKK_MANIFEST_PATH);
  const canonicalEmneIds = new Set(Object.keys(politikkManifest.chapterByEmne ?? {}));
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
      failures.push(`${requirement.placeFile}: Politikk-produksjonsendring for ${placeId} mangler ${requirement.reportPath}`);
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
    const errors = validatePolitikkPlaceReport({ report, place, canonicalEmneIds, root, now });
    failures.push(...errors.map((error) => `${reportPath}: ${error}`));
    checkedReports.add(reportPath);
  }

  return {
    schema: 'history_go_politikk_place_production_audit_v1',
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
    const report = auditPolitikkPlaceProduction({ root: process.cwd(), ...cliArgs(process.argv.slice(2)) });
    console.log(JSON.stringify(report, null, 2));
    if (report.status !== 'passed') process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  }
}
