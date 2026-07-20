import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const INDEX = 'data/places/places_index.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-protocol-batch-90';
const VERIFIED = new Set(['verified', 'verified_geometry', 'verified_historical_source']);

function full(file) {
  return path.join(ROOT, file);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(full(file), 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}

function cleanCell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .replace(/\s+/g, ' ')
    .trim();
}

function isOsloSource(sourceFile) {
  return typeof sourceFile === 'string' && (
    sourceFile.startsWith('places/by/oslo/') ||
    sourceFile.includes('/oslo/')
  );
}

function defaultFollowup(row) {
  const locator = String(row.locatorType || '').toLowerCase();
  if (['route', 'street', 'linear_area', 'natural_area', 'park'].includes(locator)) {
    return 'Dokumenter eksplisitt objekt-/rutegeometri eller flere kildebelagte ankere før canonical koordinat godkjennes.';
  }
  if (['building', 'institution', 'venue', 'shop', 'museum'].includes(locator)) {
    return 'Kjør objekt-type-først og adresse-first når en konkret adresse representerer stedet; ellers dokumenter et stabilt fysisk kildeobjekt.';
  }
  return 'Avklar fysisk identitet og dokumenter et stabilt kildeobjekt før canonical koordinat godkjennes.';
}

console.log('[Batch 90] Rebuilding canonical runtime place index before protocol reconciliation');
execFileSync('npm', ['run', 'places:index:build'], { stdio: 'inherit' });

const index = readJson(INDEX);
const osloRows = index.filter((row) => isOsloSource(row?.sourceFile));
const verifiedRows = osloRows.filter((row) => VERIFIED.has(row?.coordStatus));
const unresolvedRows = osloRows.filter((row) => !VERIFIED.has(row?.coordStatus));

const duplicateIds = [...new Set(index.map((row) => row?.id).filter((id, i, all) => id && all.indexOf(id) !== i))];
if (duplicateIds.length) {
  throw new Error(`places_index contains duplicate IDs: ${duplicateIds.join(', ')}`);
}

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const unresolvedStart = protocol.indexOf(unresolvedHeader);
if (unresolvedStart < 0) throw new Error('Oslo unresolved section header not found');

const unresolvedSection = protocol.slice(unresolvedStart);
const existing = new Map();
for (const line of unresolvedSection.split('\n')) {
  const match = line.match(/^\| `([^`]+)`(?:\s+–\s+([^|]+))?\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*$/);
  if (!match) continue;
  existing.set(match[1], {
    name: cleanCell(match[2] || ''),
    status: cleanCell(match[3]),
    conflict: cleanCell(match[4]),
    followup: cleanCell(match[5])
  });
}

const unresolvedSorted = [...unresolvedRows].sort((a, b) => {
  const fileCmp = String(a.sourceFile || '').localeCompare(String(b.sourceFile || ''), 'nb');
  return fileCmp || String(a.id || '').localeCompare(String(b.id || ''), 'nb');
});

const unresolvedIds = unresolvedSorted.map((row) => row.id);
const existingIds = [...existing.keys()];
const addedIds = unresolvedIds.filter((id) => !existing.has(id));
const removedIds = existingIds.filter((id) => !unresolvedIds.includes(id));

const rowsText = unresolvedSorted.map((row) => {
  const prior = existing.get(row.id);
  const status = cleanCell(row.coordStatus || 'unverified');
  const conflict = prior?.conflict || cleanCell(
    row.coordNote ||
    `Canonical place har status ${status} og mangler en godkjent kildekontrakt for fysisk identitet/koordinat.`
  );
  const followup = prior?.followup || defaultFollowup(row);
  return `| \`${cleanCell(row.id)}\` – ${cleanCell(row.name || row.id)} | ${status} | ${conflict} | ${cleanCell(followup)} |`;
});

const batchNote = `Batch 90 (2026-07-21) rekonsilerer Oslo-protokollen maskinelt mot canonical \`data/places/places_index.json\`. Oslo-avgrensningen følger canonical \`sourceFile\`, og bare \`verified\`, \`verified_geometry\` og \`verified_historical_source\` teller som godkjent koordinatstatus. Løste eller utflyttede legacy-poster fjernes fra resttabellen, mens alle aktive Oslo-records uten godkjent status føres inn. Denne batchen endrer ingen place-koordinater.`;

protocol = protocol.replace(/^Sist oppdatert: .*$/m, 'Sist oppdatert: 2026-07-21');
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedRows.length} verifiserte eller kildekontrollerte canonical steder. Antallet aktive canonical Oslo-steder uten godkjent koordinatstatus er ${unresolvedRows.length}.`
);

const refreshedStart = protocol.indexOf(unresolvedHeader);
const prefix = protocol.slice(0, refreshedStart);
const notePrefix = prefix.includes(batchNote) ? prefix : `${prefix.trimEnd()}\n\n${batchNote}\n\n`;
const newSection = [
  unresolvedHeader,
  '',
  `Disse kontrollene gjelder ${unresolvedRows.length} aktive canonical Oslo-steder som ikke teller blant de ${verifiedRows.length} verifiserte eller kildekontrollerte canonical Oslo-stedene.`,
  '',
  '| kandidat | status | dokumentert konflikt | oppfølging |',
  '|---|---|---|---|',
  ...rowsText,
  ''
].join('\n');
protocol = `${notePrefix}${newSection}`;
fs.writeFileSync(full(PROTOCOL), protocol);

fs.mkdirSync(full(REPORT_DIR), { recursive: true });
const statusCounts = unresolvedSorted.reduce((acc, row) => {
  const key = row.coordStatus || 'unverified';
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

writeJson(`${REPORT_DIR}/summary.json`, {
  date: '2026-07-21',
  totalCanonicalOsloPlaces: osloRows.length,
  verifiedOrSourceControlled: verifiedRows.length,
  unresolved: unresolvedRows.length,
  acceptedStatuses: [...VERIFIED],
  unresolvedStatusCounts: statusCounts,
  addedToProtocol: addedIds,
  removedFromProtocol: removedIds,
  unresolved: unresolvedSorted.map((row) => ({
    id: row.id,
    name: row.name,
    coordStatus: row.coordStatus || '',
    sourceFile: row.sourceFile,
    locatorType: row.locatorType || '',
    sourceProvider: row.sourceProvider || '',
    sourceObjectId: row.sourceObjectId || '',
    coordNote: row.coordNote || ''
  }))
});

fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Oslo coordinate protocol batch 90\n\n` +
  `Reconciled the Oslo coordinate protocol against the canonical runtime place index.\n\n` +
  `- Canonical Oslo places: ${osloRows.length}\n` +
  `- Verified/source-controlled: ${verifiedRows.length}\n` +
  `- Without an accepted coordinate status: ${unresolvedRows.length}\n` +
  `- Added stale/missing protocol rows: ${addedIds.length}\n` +
  `- Removed resolved or moved protocol rows: ${removedIds.length}\n\n` +
  `No place coordinate was changed in this batch.\n`
);

// Self-check: the rewritten protocol table must exactly match the unresolved runtime set.
const written = fs.readFileSync(full(PROTOCOL), 'utf8');
const writtenSection = written.slice(written.indexOf(unresolvedHeader));
const writtenIds = [...writtenSection.matchAll(/^\| `([^`]+)`/gm)].map((match) => match[1]);
if (JSON.stringify(writtenIds) !== JSON.stringify(unresolvedIds)) {
  throw new Error('Rewritten protocol unresolved IDs do not exactly match canonical runtime unresolved IDs');
}

console.log(JSON.stringify({
  ok: true,
  totalCanonicalOsloPlaces: osloRows.length,
  verifiedOrSourceControlled: verifiedRows.length,
  unresolved: unresolvedRows.length,
  addedIds,
  removedIds,
  statusCounts
}, null, 2));
