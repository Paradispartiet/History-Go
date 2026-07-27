import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateRepository } from './validate-place-description-production-v4_2.mjs';

export const LENGTH_POLICY_REVISION = '4.2.1-source-led-length';

const WORD_COUNT_ONLY_CODES = new Set([
  'desc_outside_normal_range',
  'popup_below_minimum',
  'popup_above_maximum'
]);

/**
 * Canonical 4.2.1 policy: word counts are editorial guidance, never blocking
 * validation gates. All structural, source, claim, review, quiz, similarity,
 * temporal, metadata and PR-isolation errors remain blocking.
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
  const report = applySourceLedLengthPolicy(raw);
  writeReport(options.reportPath, report);

  console.log(`Place description v4.2.1: ${report.packetCount} pakker, ${report.readyPacketCount} ready, ${report.errorCount} blokkerende feil`);
  if (report.lengthPolicy.removedWordCountIssueCount) {
    console.log(`- ${report.lengthPolicy.removedWordCountIssueCount} ordtallsfunn ble behandlet som redaksjonell veiledning.`);
  }
  for (const issue of report.issues.slice(0, 100)) console.error(`- ${issue.code}: ${issue.message}`);
  if (report.issues.length > 100) console.error(`- ... ${report.issues.length - 100} flere feil`);
  if (report.errorCount > 0) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) main();
