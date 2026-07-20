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
    .replace(/`/g, "'")
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

console.log('[Batch 90] Rebuilding canonical runtime place index before full Oslo protocol reconciliation');
execFileSync('npm', ['run', 'places:index:build'], { stdio: 'inherit' });

const index = readJson(INDEX);
const duplicateIndexIds = [...new Set(index.map((row) => row?.id).filter((id, i, all) => id && all.indexOf(id) !== i))];
if (duplicateIndexIds.length) {
  throw new Error(`places_index contains duplicate IDs: ${duplicateIndexIds.join(', ')}`);
}

const osloRows = index.filter((row) => isOsloSource(row?.sourceFile));
const verifiedRows = osloRows.filter((row) => VERIFIED.has(row?.coordStatus));
const unresolvedRows = osloRows.filter((row) => !VERIFIED.has(row?.coordStatus));
const verifiedById = new Map(verifiedRows.map((row) => [row.id, row]));
const unresolvedById = new Map(unresolvedRows.map((row) => [row.id, row]));

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const lines = protocol.split('\n');
const osloHeaderIndex = lines.indexOf('## Oslo');
const verifiedHeader = '| batch | placeId | navn | godkjent status | kildeobjekt |';
const verifiedHeaderIndex = lines.indexOf(verifiedHeader);
if (osloHeaderIndex < 0 || verifiedHeaderIndex < osloHeaderIndex) {
  throw new Error('Could not locate Oslo verified coordinate table');
}

let verifiedTableEnd = verifiedHeaderIndex + 2;
while (verifiedTableEnd < lines.length && lines[verifiedTableEnd].startsWith('| ')) {
  verifiedTableEnd += 1;
}

const existingVerifiedRows = [];
for (let i = verifiedHeaderIndex + 2; i < verifiedTableEnd; i += 1) {
  const line = lines[i];
  const match = line.match(/^\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*`([^`]*)`\s*\|$/);
  if (!match) throw new Error(`Could not parse verified protocol row: ${line}`);
  existingVerifiedRows.push({
    batch: cleanCell(match[1]),
    id: match[2],
    name: cleanCell(match[3]),
    status: cleanCell(match[4]),
    sourceObjectId: cleanCell(match[5]),
    line
  });
}

const existingVerifiedIds = existingVerifiedRows.map((row) => row.id);
const duplicateProtocolVerifiedIds = [...new Set(existingVerifiedIds.filter((id, i, all) => all.indexOf(id) !== i))];
if (duplicateProtocolVerifiedIds.length) {
  throw new Error(`Verified protocol table contains duplicate IDs: ${duplicateProtocolVerifiedIds.join(', ')}`);
}

const keptVerified = existingVerifiedRows.filter((row) => verifiedById.has(row.id));
const removedVerifiedIds = existingVerifiedRows.filter((row) => !verifiedById.has(row.id)).map((row) => row.id);
const missingVerified = verifiedRows
  .filter((row) => !existingVerifiedIds.includes(row.id))
  .sort((a, b) => {
    const fileCmp = String(a.sourceFile || '').localeCompare(String(b.sourceFile || ''), 'nb');
    return fileCmp || String(a.id || '').localeCompare(String(b.id || ''), 'nb');
  });

const verifiedTableLines = [
  verifiedHeader,
  '|---:|---|---|---|---|',
  ...keptVerified.map((row) => row.line),
  ...missingVerified.map((row) => {
    const sourceObject = row.sourceObjectId || row.coordSourceId || row.coordSource || 'source-not-recorded';
    return `| 90 | \`${cleanCell(row.id)}\` | ${cleanCell(row.name || row.id)} | ${cleanCell(row.coordStatus)} | \`${cleanCell(sourceObject)}\` |`;
  })
];

lines.splice(
  verifiedHeaderIndex,
  verifiedTableEnd - verifiedHeaderIndex,
  ...verifiedTableLines
);
protocol = lines.join('\n');

const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const unresolvedStart = protocol.indexOf(unresolvedHeader);
if (unresolvedStart < 0) throw new Error('Oslo unresolved section header not found');

const unresolvedSection = protocol.slice(unresolvedStart);
const existingUnresolved = new Map();
for (const line of unresolvedSection.split('\n')) {
  const match = line.match(/^\| `([^`]+)`(?:\s+–\s+([^|]+))?\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*$/);
  if (!match) continue;
  existingUnresolved.set(match[1], {
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
const existingUnresolvedIds = [...existingUnresolved.keys()];
const addedUnresolvedIds = unresolvedIds.filter((id) => !existingUnresolved.has(id));
const removedUnresolvedIds = existingUnresolvedIds.filter((id) => !unresolvedById.has(id));

const unresolvedRowsText = unresolvedSorted.map((row) => {
  const prior = existingUnresolved.get(row.id);
  const status = cleanCell(row.coordStatus || 'unverified');
  const conflict = prior?.conflict || cleanCell(
    row.coordNote ||
    `Canonical place har status ${status} og mangler en godkjent kildekontrakt for fysisk identitet/koordinat.`
  );
  const followup = prior?.followup || defaultFollowup(row);
  return `| \`${cleanCell(row.id)}\` – ${cleanCell(row.name || row.id)} | ${status} | ${conflict} | ${cleanCell(followup)} |`;
});

const batchNote = `Batch 90 (2026-07-21) rekonsilerer hele Oslo-protokollen maskinelt mot canonical \`data/places/places_index.json\`. Oslo-avgrensningen følger canonical \`sourceFile\`, og bare \`verified\`, \`verified_geometry\` og \`verified_historical_source\` teller som godkjent koordinatstatus. Eksisterende verifiserte protokollrader beholdes med opprinnelig batchnummer når de fortsatt er canonical; manglende, allerede verifiserte canonical records etterføres som batch 90. Løste, utflyttede eller nedgraderte rader fjernes fra feil tabell, og alle aktive Oslo-records uten godkjent status føres i resttabellen. Batchen endrer ingen place-koordinater.`;

protocol = protocol.replace(/^Sist oppdatert: .*$/m, 'Sist oppdatert: 2026-07-21');
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedRows.length} verifiserte eller kildekontrollerte canonical steder. Antallet aktive canonical Oslo-steder uten godkjent koordinatstatus er ${unresolvedRows.length}.`
);

const refreshedUnresolvedStart = protocol.indexOf(unresolvedHeader);
const prefix = protocol.slice(0, refreshedUnresolvedStart);
const notePrefix = prefix.includes(batchNote) ? prefix : `${prefix.trimEnd()}\n\n${batchNote}\n\n`;
const newUnresolvedSection = [
  unresolvedHeader,
  '',
  `Disse kontrollene gjelder ${unresolvedRows.length} aktive canonical Oslo-steder som ikke teller blant de ${verifiedRows.length} verifiserte eller kildekontrollerte canonical Oslo-stedene.`,
  '',
  '| kandidat | status | dokumentert konflikt | oppfølging |',
  '|---|---|---|---|',
  ...unresolvedRowsText,
  ''
].join('\n');
protocol = `${notePrefix}${newUnresolvedSection}`;
fs.writeFileSync(full(PROTOCOL), protocol);

const statusCounts = unresolvedSorted.reduce((acc, row) => {
  const key = row.coordStatus || 'unverified';
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

fs.mkdirSync(full(REPORT_DIR), { recursive: true });
writeJson(`${REPORT_DIR}/summary.json`, {
  date: '2026-07-21',
  totalCanonicalOsloPlaces: osloRows.length,
  verifiedOrSourceControlledCount: verifiedRows.length,
  unresolvedCount: unresolvedRows.length,
  acceptedStatuses: [...VERIFIED],
  unresolvedStatusCounts: statusCounts,
  verifiedProtocolBefore: existingVerifiedRows.length,
  addedVerifiedProtocolRows: missingVerified.map((row) => row.id),
  removedVerifiedProtocolRows: removedVerifiedIds,
  addedUnresolvedProtocolRows: addedUnresolvedIds,
  removedUnresolvedProtocolRows: removedUnresolvedIds,
  unresolvedRows: unresolvedSorted.map((row) => ({
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
  `Reconciled both Oslo protocol tables against the canonical runtime place index.\n\n` +
  `- Canonical Oslo places: ${osloRows.length}\n` +
  `- Verified/source-controlled: ${verifiedRows.length}\n` +
  `- Without an accepted coordinate status: ${unresolvedRows.length}\n` +
  `- Verified protocol rows before reconciliation: ${existingVerifiedRows.length}\n` +
  `- Added verified protocol rows: ${missingVerified.length}\n` +
  `- Removed stale verified protocol rows: ${removedVerifiedIds.length}\n` +
  `- Added unresolved protocol rows: ${addedUnresolvedIds.length}\n` +
  `- Removed resolved/moved unresolved rows: ${removedUnresolvedIds.length}\n\n` +
  `No place coordinate was changed in this batch.\n`
);

// Self-check both protocol tables against canonical runtime sets.
const written = fs.readFileSync(full(PROTOCOL), 'utf8');
const writtenLines = written.split('\n');
const writtenVerifiedHeaderIndex = writtenLines.indexOf(verifiedHeader);
let writtenVerifiedEnd = writtenVerifiedHeaderIndex + 2;
while (writtenVerifiedEnd < writtenLines.length && writtenLines[writtenVerifiedEnd].startsWith('| ')) writtenVerifiedEnd += 1;
const writtenVerifiedIds = writtenLines
  .slice(writtenVerifiedHeaderIndex + 2, writtenVerifiedEnd)
  .map((line) => line.match(/`([^`]+)`/)?.[1])
  .filter(Boolean);
const expectedVerifiedIds = new Set(verifiedRows.map((row) => row.id));
if (writtenVerifiedIds.length !== expectedVerifiedIds.size || writtenVerifiedIds.some((id) => !expectedVerifiedIds.has(id))) {
  throw new Error('Rewritten verified protocol table does not exactly match canonical verified Oslo IDs');
}

const writtenUnresolvedSection = written.slice(written.indexOf(unresolvedHeader));
const writtenUnresolvedIds = [...writtenUnresolvedSection.matchAll(/^\| `([^`]+)`/gm)].map((match) => match[1]);
if (JSON.stringify(writtenUnresolvedIds) !== JSON.stringify(unresolvedIds)) {
  throw new Error('Rewritten unresolved protocol table does not exactly match canonical unresolved Oslo IDs');
}

console.log(JSON.stringify({
  ok: true,
  totalCanonicalOsloPlaces: osloRows.length,
  verifiedOrSourceControlledCount: verifiedRows.length,
  unresolvedCount: unresolvedRows.length,
  verifiedProtocolBefore: existingVerifiedRows.length,
  addedVerifiedProtocolRows: missingVerified.length,
  removedVerifiedProtocolRows: removedVerifiedIds,
  addedUnresolvedProtocolRows: addedUnresolvedIds.length,
  removedUnresolvedProtocolRows: removedUnresolvedIds,
  statusCounts
}, null, 2));
