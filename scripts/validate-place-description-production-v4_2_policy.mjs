import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { validateRepository } from './validate-place-description-production-v4_2.mjs';

export const LENGTH_POLICY_REVISION = '4.2.1-source-led-length';
export const PR_SCOPE_POLICY_REVISION = '4.2.5-existing-place-coordinate-path-migration';
export const MICRO_PLACE_POLICY_REVISION = '4.2.3-micro-place-reduced-quiz';

const WORD_COUNT_ONLY_CODES = new Set([
  'desc_outside_normal_range',
  'popup_below_minimum',
  'popup_above_maximum'
]);
const GENERATED_INDEX_ISSUE_CODE = 'generated_index_in_description_pr';
const COORDINATE_SCOPE_ISSUE_CODE = 'mixed_description_and_coordinate_scope';
const MICRO_QUIZ_CODES = new Set([
  'too_few_quiz_questions',
  'too_few_normal_quiz_questions',
  'too_few_quiz_types'
]);
const PLACE_PREFIX = 'data/places/';
const PACKET_PREFIX = 'data/places/production/';
const RULES_PREFIX = 'data/places/regler/';
const PLACE_MANIFEST_PATH = 'data/places/manifest.json';
const COORDINATE_EVIDENCE_PREFIX = 'data/coordinate-evidence/';
const COORDINATE_EVIDENCE_MANIFEST_PATH = 'data/coordinate-evidence/manifest.json';
const CANONICAL_ONBOARDING_COORDINATE_REPORTS = new Set([
  'reports/coordinate-evidence-audit.md',
  'reports/place-coordinate-intake-gate.md',
  'reports/place-coordinate-quality-gate.md'
]);

function isGeneratedPlaceIndexPath(file) {
  return /(?:^|\/)(?:places_index|places-index)\.json$/u.test(String(file ?? '')) || String(file ?? '').includes('/generated/');
}

function isCanonicalPlaceSourceFile(file) {
  const value = String(file ?? '');
  return value.startsWith(PLACE_PREFIX)
    && value.endsWith('.json')
    && !value.startsWith(PACKET_PREFIX)
    && !value.startsWith(RULES_PREFIX)
    && value !== PLACE_MANIFEST_PATH
    && !isGeneratedPlaceIndexPath(value);
}

function placeIdFromJsonPath(file) {
  const value = String(file ?? '');
  return value.endsWith('.json') ? path.basename(value, '.json') : '';
}

function normalizeChangedEntries(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => ({
      status: String(entry?.status ?? '').trim(),
      file: String(entry?.file ?? '').trim(),
      previousFile: String(entry?.previousFile ?? '').trim()
    }))
    .filter((entry) => entry.status && entry.file);
}

function readChangedEntries(base, head) {
  if (!base) return [];
  try {
    const output = execFileSync('git', ['diff', '--name-status', `${base}...${head || 'HEAD'}`], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
    if (!output) return [];
    return output.split(/\r?\n/gu).map((line) => {
      const parts = line.split('\t');
      const status = parts[0] ?? '';
      const renamedOrCopied = /^[RC]/u.test(status) && parts.length >= 3;
      return {
        status,
        file: parts.at(-1) ?? '',
        previousFile: renamedOrCopied ? (parts[1] ?? '') : ''
      };
    });
  } catch {
    return [];
  }
}

function readJsonAtRef(ref, file, root = process.cwd()) {
  if (!ref || !file) return null;
  try {
    const raw = execFileSync('git', ['show', ref + ':' + file], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function coordinateEvidenceInvariant(value) {
  const copy = JSON.parse(JSON.stringify(value ?? {}));
  delete copy.placeFile;
  delete copy.coordinateDecision;
  delete copy.notes;
  if (copy.currentCoordinate && typeof copy.currentCoordinate === 'object') {
    delete copy.currentCoordinate.coordNote;
  }
  return copy;
}

function sameCoordinateEvidenceInvariant(before, after) {
  return before !== null
    && after !== null
    && JSON.stringify(coordinateEvidenceInvariant(before)) === JSON.stringify(coordinateEvidenceInvariant(after));
}

/**
 * Canonical 4.2.1 policy: word counts are editorial guidance, never blocking
 * validation gates. All structural, source, claim, review, quiz, similarity,
 * temporal, metadata and PR-isolation errors remain blocking. The one scoped
 * PR exception for canonical Place onboarding is applied separately below.
 */
export function applySourceLedLengthPolicy(report) {
  const issues = Array.isArray(report?.issues) ? report.issues : [];
  const removedWordCountIssues = issues.filter((issue) => WORD_COUNT_ONLY_CODES.has(String(issue?.code ?? '')));
  const blockingIssues = issues.filter((issue) => !WORD_COUNT_ONLY_CODES.has(String(issue?.code ?? '')));

  return {
    ...report,
    policyRevision: LENGTH_POLICY_REVISION,
    lengthPolicy: {
      wordCountIsValidationGate: false,
      editorialGuidanceWords: {
        desc: [40, 80],
        popupDesc: [300, 1200]
      },
      decisionRule: 'source_availability_place_complexity_identity_scope_and_documented_time_layers',
      removedWordCountIssueCount: removedWordCountIssues.length,
      removedWordCountIssues
    },
    errorCount: blockingIssues.length,
    issues: blockingIssues
  };
}

/**
 * A canonical Micro Place may explicitly choose quizMode=none. Only the three
 * quiz-volume findings are removed for that exact profile; source, claims,
 * identity, review, coordinates and all other production gates stay blocking.
 */
export function applyMicroPlaceQuizPolicy(report) {
  const cache = new Map();
  const isQuizlessMicroPacket = (packetFile) => {
    const key = String(packetFile ?? '');
    if (!key.startsWith(PACKET_PREFIX) || !key.endsWith('.json')) return false;
    if (cache.has(key)) return cache.get(key);
    let eligible = false;
    try {
      const packet = JSON.parse(fs.readFileSync(path.join(process.cwd(), key), 'utf8'));
      const place = JSON.parse(fs.readFileSync(path.join(process.cwd(), packet.placeFile), 'utf8'));
      eligible = place?.placeTier === 'micro'
        && place?.micro_place_profile?.schema === 'history_go_micro_place_profile_v1'
        && place?.micro_place_profile?.quizMode === 'none';
    } catch {
      eligible = false;
    }
    cache.set(key, eligible);
    return eligible;
  };
  const issues = Array.isArray(report?.issues) ? report.issues : [];
  const removed = issues.filter(issue => MICRO_QUIZ_CODES.has(String(issue?.code ?? '')) && isQuizlessMicroPacket(issue?.packetFile));
  if (removed.length === 0) return report;
  const blocking = issues.filter(issue => !removed.includes(issue));
  return {
    ...report,
    microPlacePolicy: {
      revision: MICRO_PLACE_POLICY_REVISION,
      quizModeNoneSkipsQuizVolumeOnly: true,
      removedQuizIssueCount: removed.length,
      removedQuizIssues: removed
    },
    errorCount: blocking.length,
    issues: blocking
  };
}

/**
 * A canonical Place onboarding or complete Place production must be allowed to
 * commit its synchronized generated place index in the same PR. A new Place may
 * additionally carry one newly added, ID-matched coordinate-evidence record,
 * the evidence manifest and the three deterministic coordinate reports. This
 * does not relax the isolation rule for existing Places or unrelated coordinate
 * files. Onboarding requires an added Place plus manifest synchronization,
 * while full production requires a changed canonical Place and its matching
 * production packet. Other PR-isolation findings remain blocking.
 */
export function applyCanonicalPlaceOnboardingScopePolicy(report, changedEntries = [], context = {}) {
  const entries = normalizeChangedEntries(changedEntries);
  const addedPlaceFiles = entries
    .filter((entry) => entry.status.startsWith('A') && isCanonicalPlaceSourceFile(entry.file))
    .map((entry) => entry.file);
  const changedPlaceFiles = entries
    .filter((entry) => isCanonicalPlaceSourceFile(entry.file))
    .map((entry) => entry.file);
  const changedPlaceIds = new Set(changedPlaceFiles.map(placeIdFromJsonPath).filter(Boolean));
  const changedProductionPackets = entries
    .filter((entry) => entry.file.startsWith(PACKET_PREFIX) && entry.file.endsWith('.json'))
    .map((entry) => entry.file);
  const matchingProductionPlaceIds = [...new Set(
    changedProductionPackets
      .map(placeIdFromJsonPath)
      .filter((placeId) => changedPlaceIds.has(placeId))
  )];
  const manifestChanged = entries.some((entry) => entry.file === PLACE_MANIFEST_PATH);
  const generatedIndexesChanged = entries
    .filter((entry) => isGeneratedPlaceIndexPath(entry.file))
    .map((entry) => entry.file);
  const canonicalOnboarding = addedPlaceFiles.length > 0 && manifestChanged && generatedIndexesChanged.length > 0;
  const canonicalPlaceProduction = matchingProductionPlaceIds.length > 0 && generatedIndexesChanged.length > 0;

  const addedPlaceIds = new Set(addedPlaceFiles.map(placeIdFromJsonPath).filter(Boolean));
  const coordinateScopeEntries = entries.filter((entry) => entry.file.startsWith(COORDINATE_EVIDENCE_PREFIX)
    || CANONICAL_ONBOARDING_COORDINATE_REPORTS.has(entry.file));
  const addedCoordinateEvidenceEntries = coordinateScopeEntries.filter((entry) => entry.file.startsWith(COORDINATE_EVIDENCE_PREFIX)
    && entry.file !== COORDINATE_EVIDENCE_MANIFEST_PATH
    && entry.status.startsWith('A'));
  const coordinateEvidenceManifestChanged = coordinateScopeEntries.some((entry) => entry.file === COORDINATE_EVIDENCE_MANIFEST_PATH);
  const allowedCoordinateFiles = new Set([
    COORDINATE_EVIDENCE_MANIFEST_PATH,
    ...addedCoordinateEvidenceEntries.map((entry) => entry.file),
    ...CANONICAL_ONBOARDING_COORDINATE_REPORTS
  ]);
  const coordinateEvidenceMatchesAddedPlaces = addedCoordinateEvidenceEntries.length > 0
    && addedCoordinateEvidenceEntries.every((entry) => addedPlaceIds.has(placeIdFromJsonPath(entry.file)));
  const coordinateScopeContainsOnlyOnboardingFiles = coordinateScopeEntries.length > 0
    && coordinateScopeEntries.every((entry) => allowedCoordinateFiles.has(entry.file));
  const canonicalOnboardingCoordinates = canonicalOnboarding
    && coordinateEvidenceManifestChanged
    && coordinateEvidenceMatchesAddedPlaces
    && coordinateScopeContainsOnlyOnboardingFiles;

  const removedPlaceEntries = entries.filter((entry) => entry.status.startsWith('D') && isCanonicalPlaceSourceFile(entry.file));
  const renamedPlaceEntries = entries.filter((entry) => /^[RC]/u.test(entry.status)
    && isCanonicalPlaceSourceFile(entry.previousFile)
    && isCanonicalPlaceSourceFile(entry.file));
  const pathMigrationPlaceIds = new Set();
  for (const entry of renamedPlaceEntries) {
    const beforeId = placeIdFromJsonPath(entry.previousFile);
    const afterId = placeIdFromJsonPath(entry.file);
    if (beforeId && beforeId === afterId) pathMigrationPlaceIds.add(afterId);
  }
  for (const addedFile of addedPlaceFiles) {
    const placeId = placeIdFromJsonPath(addedFile);
    if (placeId && removedPlaceEntries.some((entry) => placeIdFromJsonPath(entry.file) === placeId)) {
      pathMigrationPlaceIds.add(placeId);
    }
  }

  const isCoordinateEvidenceRecord = (file) => String(file ?? '').startsWith(COORDINATE_EVIDENCE_PREFIX)
    && String(file ?? '') !== COORDINATE_EVIDENCE_MANIFEST_PATH
    && String(file ?? '').endsWith('.json');
  const coordinateMigrationPairs = [];
  for (const entry of coordinateScopeEntries) {
    if (/^[RC]/u.test(entry.status)
      && isCoordinateEvidenceRecord(entry.previousFile)
      && isCoordinateEvidenceRecord(entry.file)
      && placeIdFromJsonPath(entry.previousFile) === placeIdFromJsonPath(entry.file)) {
      coordinateMigrationPairs.push({
        placeId: placeIdFromJsonPath(entry.file),
        previousFile: entry.previousFile,
        file: entry.file
      });
    }
  }
  const deletedCoordinateEntries = coordinateScopeEntries.filter((entry) => entry.status.startsWith('D') && isCoordinateEvidenceRecord(entry.file));
  const addedCoordinateEntries = coordinateScopeEntries.filter((entry) => entry.status.startsWith('A') && isCoordinateEvidenceRecord(entry.file));
  for (const addedEntry of addedCoordinateEntries) {
    const placeId = placeIdFromJsonPath(addedEntry.file);
    const deletedEntry = deletedCoordinateEntries.find((entry) => placeIdFromJsonPath(entry.file) === placeId);
    if (placeId && deletedEntry && !coordinateMigrationPairs.some((pair) => pair.placeId === placeId)) {
      coordinateMigrationPairs.push({ placeId, previousFile: deletedEntry.file, file: addedEntry.file });
    }
  }

  const readAtRef = typeof context.readJsonAtRef === 'function'
    ? context.readJsonAtRef
    : (ref, file) => readJsonAtRef(ref, file, context.root ?? process.cwd());
  const matchingProductionPlaceIdSet = new Set(matchingProductionPlaceIds);
  const verifiedCoordinateMigrationPairs = coordinateMigrationPairs.filter((pair) => {
    if (!pathMigrationPlaceIds.has(pair.placeId) || !matchingProductionPlaceIdSet.has(pair.placeId)) return false;
    const before = readAtRef(context.base, pair.previousFile);
    const after = readAtRef(context.head ?? 'HEAD', pair.file);
    return sameCoordinateEvidenceInvariant(before, after);
  });
  const allowedMigrationCoordinateFiles = new Set([
    COORDINATE_EVIDENCE_MANIFEST_PATH,
    ...CANONICAL_ONBOARDING_COORDINATE_REPORTS,
    ...verifiedCoordinateMigrationPairs.flatMap((pair) => [pair.previousFile, pair.file])
  ]);
  const coordinateScopeContainsOnlyMigrationFiles = coordinateScopeEntries.length > 0
    && coordinateScopeEntries.every((entry) => allowedMigrationCoordinateFiles.has(entry.file)
      || (entry.previousFile && allowedMigrationCoordinateFiles.has(entry.previousFile)));
  const existingPlaceCoordinatePathMigration = canonicalPlaceProduction
    && manifestChanged
    && coordinateEvidenceManifestChanged
    && verifiedCoordinateMigrationPairs.length > 0
    && verifiedCoordinateMigrationPairs.every((pair) => pathMigrationPlaceIds.has(pair.placeId))
    && coordinateScopeContainsOnlyMigrationFiles;

  if (!canonicalOnboarding && !canonicalPlaceProduction) return report;

  const issues = Array.isArray(report?.issues) ? report.issues : [];
  const removableIssueCodes = new Set([GENERATED_INDEX_ISSUE_CODE]);
  if (canonicalOnboardingCoordinates || existingPlaceCoordinatePathMigration) removableIssueCodes.add(COORDINATE_SCOPE_ISSUE_CODE);
  const removedIssues = issues.filter((issue) => removableIssueCodes.has(String(issue?.code ?? '')));
  if (removedIssues.length === 0) return report;

  const blockingIssues = issues.filter((issue) => !removableIssueCodes.has(String(issue?.code ?? '')));
  const removedGeneratedIndexIssues = removedIssues.filter((issue) => String(issue?.code ?? '') === GENERATED_INDEX_ISSUE_CODE);
  const removedCoordinateScopeIssues = removedIssues.filter((issue) => String(issue?.code ?? '') === COORDINATE_SCOPE_ISSUE_CODE);
  return {
    ...report,
    prScopePolicy: {
      revision: PR_SCOPE_POLICY_REVISION,
      canonicalPlaceOnboarding: canonicalOnboarding,
      canonicalPlaceProduction,
      canonicalOnboardingCoordinates,
      existingPlaceCoordinatePathMigration,
      pathMigrationPlaceIds: [...pathMigrationPlaceIds],
      verifiedCoordinateMigrationPairs,
      addedPlaceFiles,
      changedPlaceFiles,
      changedProductionPackets,
      matchingProductionPlaceIds,
      manifestChanged,
      generatedIndexesChanged,
      addedCoordinateEvidenceFiles: addedCoordinateEvidenceEntries.map((entry) => entry.file),
      coordinateEvidenceManifestChanged,
      removedGeneratedIndexIssueCount: removedGeneratedIndexIssues.length,
      removedGeneratedIndexIssues,
      removedCoordinateScopeIssueCount: removedCoordinateScopeIssues.length,
      removedCoordinateScopeIssues
    },
    errorCount: blockingIssues.length,
    issues: blockingIssues
  };
}

function parseArgs(argv) {
  const options = {
    changed: false,
    base: process.env.GITHUB_BASE_SHA ?? '',
    head: process.env.GITHUB_HEAD_SHA ?? 'HEAD',
    reportPath: ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--changed') options.changed = true;
    else if (arg === '--all') options.changed = false;
    else if (arg === '--base') options.base = argv[++index] ?? '';
    else if (arg === '--head') options.head = argv[++index] ?? 'HEAD';
    else if (arg === '--report') options.reportPath = argv[++index] ?? 'reports/place-description-validation-v4_2.json';
    else throw new Error(`Ukjent argument: ${arg}`);
  }
  return options;
}

function writeReport(reportPath, report) {
  if (!reportPath) return;
  const absolute = path.join(process.cwd(), reportPath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${JSON.stringify(report, null, 2)}\n`);
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }

  const raw = validateRepository({
    changed: options.changed,
    base: options.base,
    head: options.head,
    reportPath: ''
  });
  const lengthAdjusted = applySourceLedLengthPolicy(raw);
  const microAdjusted = applyMicroPlaceQuizPolicy(lengthAdjusted);
  const report = options.changed
    ? applyCanonicalPlaceOnboardingScopePolicy(microAdjusted, readChangedEntries(options.base, options.head), { base: options.base, head: options.head, root: process.cwd() })
    : microAdjusted;
  writeReport(options.reportPath, report);

  console.log(`Place description v4.2.1: ${report.packetCount} pakker, ${report.readyPacketCount} ready, ${report.errorCount} blokkerende feil`);
  if (report.lengthPolicy.removedWordCountIssueCount) {
    console.log(`- ${report.lengthPolicy.removedWordCountIssueCount} ordtallsfunn ble behandlet som redaksjonell veiledning.`);
  }
  if (report.prScopePolicy?.removedGeneratedIndexIssueCount) {
    console.log(`- ${report.prScopePolicy.removedGeneratedIndexIssueCount} generert indeks-funn ble tillatt for canonical Place-onboarding.`);
  }
  if (report.microPlacePolicy?.removedQuizIssueCount) {
    console.log(`- ${report.microPlacePolicy.removedQuizIssueCount} quizvolum-funn ble tillatt for Micro Places med quizMode=none.`);
  }
  for (const issue of report.issues.slice(0, 100)) console.error(`- ${issue.code}: ${issue.message}`);
  if (report.issues.length > 100) console.error(`- ... ${report.issues.length - 100} flere feil`);
  if (report.errorCount > 0) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) main();
