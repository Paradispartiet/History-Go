import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const QUEUE = 'reports/oslo-museum-coordinate-intake-20260720/queue.json';
const OUT_DIR = 'reports/oslo-museum-coordinate-intake-20260720/results';

function abs(rel) {
  return path.join(ROOT, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
}

function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}

function writeText(rel, text) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), text.endsWith('\n') ? text : `${text}\n`);
}

function parseFinderJson(stdout) {
  const first = stdout.indexOf('{');
  const last = stdout.lastIndexOf('}');
  if (first < 0 || last < first) return null;
  try {
    return JSON.parse(stdout.slice(first, last + 1));
  } catch {
    return null;
  }
}

const queue = readJson(QUEUE);
const candidates = Array.isArray(queue.standard_address_first) ? queue.standard_address_first : [];
if (candidates.length !== 14) {
  throw new Error(`Expected 14 standard address-first candidates, found ${candidates.length}`);
}

const results = [];

for (const candidate of candidates) {
  const { placeId, addressQuery, statusFlags = [] } = candidate;
  console.log(`Running Geonorge address-first intake for ${placeId}: ${addressQuery}`);

  const run = spawnSync(
    'npm',
    ['run', 'places:coords:find:address', '--', '--address', addressQuery],
    {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
      timeout: 180000
    }
  );

  const stdout = run.stdout || '';
  const stderr = run.stderr || '';
  const exactTerminalOutput = [stdout, stderr].filter(Boolean).join(stderr && stdout ? '\n--- STDERR ---\n' : '');
  writeText(`${OUT_DIR}/${placeId}.txt`, exactTerminalOutput || `(no output; exit ${run.status ?? 'unknown'})`);

  const parsed = parseFinderJson(stdout);
  if (parsed) writeJson(`${OUT_DIR}/${placeId}.json`, parsed);

  const row = {
    placeId,
    addressQuery,
    statusFlags,
    commandExitCode: run.status,
    finderStatus: parsed?.status || 'unparsed',
    ok: parsed?.ok === true,
    reason: parsed?.reason || (run.error ? String(run.error) : 'Could not parse finder JSON output.'),
    sourceProvider: parsed?.sourceProvider || null,
    sourceObjectId: parsed?.sourceObjectId || null,
    sourceUrl: parsed?.sourceUrl || null,
    coordinate: parsed?.coordinate || null,
    outputFiles: {
      terminal: `${OUT_DIR}/${placeId}.txt`,
      parsed: parsed ? `${OUT_DIR}/${placeId}.json` : null
    }
  };
  results.push(row);
}

const counts = results.reduce((acc, row) => {
  acc[row.finderStatus] = (acc[row.finderStatus] || 0) + 1;
  return acc;
}, {});

const summary = {
  version: '2026-07-20',
  method: 'npm run places:coords:find:address -- --address <query>',
  source: 'Geonorge Adresser API v1 via repository address-first finder',
  candidateCount: results.length,
  counts,
  results
};
writeJson(`${OUT_DIR}/summary.json`, summary);

const rows = results.map((row) => {
  const source = row.sourceObjectId ? `\`${row.sourceObjectId}\`` : '—';
  return `| \`${row.placeId}\` | ${row.addressQuery} | ${row.finderStatus} | ${source} | ${String(row.reason).replace(/\|/g, '\\|')} |`;
}).join('\n');

const verified = results.filter((row) => row.finderStatus === 'verified_candidate').length;
const unresolved = results.length - verified;
const readme = `# Oslo museum coordinate intake — Geonorge results\n\nDate: 2026-07-20\n\nThis pass executes the repository's normative address-first finder for all 14 standard museum/place candidates from the merged intake queue. Every command's terminal output is saved alongside a parsed JSON result. No place coordinates are changed by this pass.\n\n## Result\n\n- Candidates checked: **${results.length}**\n- Geonorge verified candidates: **${verified}**\n- Needs review / not found / errors: **${unresolved}**\n\n| placeId | address query | finder status | source object | reason |\n|---|---|---|---|---|\n${rows}\n\n## Production gate\n\nA \`verified_candidate\` means the address finder found an unambiguous official address representation point. Before a new canonical place is created, the point must still be checked against the intended physical building/institution and the no-duplicate/overlap decision from the museum completeness audit. Candidates that are temporarily closed or have uncertain reopening remain subject to their recorded status flags even when the coordinate is valid.\n`;
writeText(`${OUT_DIR}/README.md`, readme);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log(`Completed ${results.length} Geonorge address-first checks: ${verified} verified candidates, ${unresolved} unresolved.`);
