import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const LEGACY_ID = 'sagene_kvernhus';
const CANONICAL_ID = 'glads_molle';
const REPORT_DIR = 'reports/oslo-coordinate-sagene-kvernhus-duplicate-audit-post-187';
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const protocol = readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((m) => Number(m[1])));
if (maxBatch !== 187) throw new Error(`Expected coordinate max batch 187, got ${maxBatch}`);

const canonicalFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/glads_molle.json';
const canonical = readJson(canonicalFile);
if (canonical.id !== CANONICAL_ID) throw new Error(`Unexpected canonical id in ${canonicalFile}`);
if (canonical.coordStatus !== 'verified' || canonical.sourceObjectId !== 'geonorge-adresser-v1:0301:16161:10A') {
  throw new Error('Existing glads_molle is not the expected verified canonical place');
}
if (Math.abs(canonical.lat - 59.931850362845985) > 1e-10 || Math.abs(canonical.lon - 10.757873019733754) > 1e-10) {
  throw new Error('Existing glads_molle coordinate changed');
}

const aggregateFile = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const aggregate = readJson(aggregateFile);
const legacyMatches = aggregate.filter((place) => place?.id === LEGACY_ID);
if (legacyMatches.length !== 1) throw new Error(`Expected one legacy ${LEGACY_ID} business record, got ${legacyMatches.length}`);
const legacy = legacyMatches[0];
if (legacy.coordStatus || legacy.sourceObjectId || legacy.locatorType) throw new Error('Legacy duplicate unexpectedly already has coordinate contract metadata');

const evidenceFile = 'data/coordinate-evidence/oslo/naeringsliv/sagene_kvernhus.json';
const evidence = readJson(evidenceFile);
if (evidence.placeId !== LEGACY_ID || evidence.coordinateDecision !== 'needs_identity_split') {
  throw new Error('Unexpected legacy coordinate evidence state');
}

const grep = spawnSync('git', ['grep', '-n', '-F', `"${LEGACY_ID}"`, '--', 'data', 'tools', 'docs'], { encoding: 'utf8' });
if (![0, 1].includes(grep.status)) throw new Error(`git grep failed with ${grep.status}: ${grep.stderr}`);
const occurrences = String(grep.stdout || '').trim().split('\n').filter(Boolean).map((line) => {
  const first = line.indexOf(':');
  const second = line.indexOf(':', first + 1);
  return {
    file: line.slice(0, first),
    line: Number(line.slice(first + 1, second)),
    text: line.slice(second + 1).trim()
  };
});
const files = [...new Set(occurrences.map((item) => item.file))].sort();

const categories = {
  placeData: files.filter((file) => file.startsWith('data/places/')),
  coordinateEvidence: files.filter((file) => file.startsWith('data/coordinate-evidence/')),
  people: files.filter((file) => file.startsWith('data/people/')),
  quiz: files.filter((file) => file.startsWith('data/quiz/')),
  stories: files.filter((file) => file.startsWith('data/stories/')),
  wonderkammer: files.filter((file) => file.startsWith('data/wonderkammer/')),
  civication: files.filter((file) => file.startsWith('data/Civication/')),
  i18n: files.filter((file) => file.startsWith('data/i18n/')),
  otherData: files.filter((file) => file.startsWith('data/') && ![
    'data/places/', 'data/coordinate-evidence/', 'data/people/', 'data/quiz/', 'data/stories/', 'data/wonderkammer/', 'data/Civication/', 'data/i18n/'
  ].some((prefix) => file.startsWith(prefix))),
  codeOrDocs: files.filter((file) => file.startsWith('tools/') || file.startsWith('docs/'))
};

const activeRuntime = readJson('data/places/places_index.json');
const runtimeMatches = [];
const seen = new Set();
const walk = (value) => {
  if (Array.isArray(value)) return value.forEach(walk);
  if (!value || typeof value !== 'object') return;
  if (typeof value.id === 'string' && value.id === LEGACY_ID && !seen.has(JSON.stringify(value))) {
    seen.add(JSON.stringify(value));
    runtimeMatches.push(value);
  }
  Object.values(value).forEach(walk);
};
walk(activeRuntime);

const exactCanonicalIdentityMatch = canonical.name === 'Glads mølle' && canonical.address?.street === 'Sandakerveien' && canonical.address?.number === '10A';
const sameAddressCandidate = canonical.sourceObjectId === 'geonorge-adresser-v1:0301:16161:10A';

const summary = {
  version: DATE,
  purpose: 'Correct the earlier sagene_kvernhus identity resolution after discovering the already canonical Glads mølle place, and inventory every exact active legacy-id reference before migration.',
  legacyPlace: {
    id: legacy.id,
    name: legacy.name,
    lat: legacy.lat,
    lon: legacy.lon,
    r: legacy.r,
    file: aggregateFile,
    evidenceFile,
    evidenceStatus: evidence.evidenceStatus,
    coordinateDecision: evidence.coordinateDecision
  },
  canonicalPlace: {
    id: canonical.id,
    name: canonical.name,
    lat: canonical.lat,
    lon: canonical.lon,
    r: canonical.r,
    file: canonicalFile,
    sourceObjectId: canonical.sourceObjectId,
    coordStatus: canonical.coordStatus,
    coordVerifiedAt: canonical.coordVerifiedAt,
    exactCanonicalIdentityMatch,
    sameAddressCandidate
  },
  duplicateDecision: {
    isDuplicatePhysicalPlace: exactCanonicalIdentityMatch && sameAddressCandidate,
    canonicalId: CANONICAL_ID,
    legacyId: LEGACY_ID,
    requiredAction: 'retire legacy duplicate, retarget active exact references to glads_molle, retire duplicate coordinate evidence, add legacy-id alias, and remove unresolved coordinate row; do not create a second Glads mølle marker'
  },
  runtimeLegacyMatchCount: runtimeMatches.length,
  exactReferenceInventory: {
    occurrenceCount: occurrences.length,
    fileCount: files.length,
    files,
    categories,
    occurrences
  }
};

writeJson(`${REPORT_DIR}/summary.json`, summary);
writeFileSync(`${REPORT_DIR}/sources.md`, `# sagene_kvernhus duplicate audit\n\nDate: ${DATE}\n\nThe attempted Glads mølle production was rejected by its canonical collision gate because \`${CANONICAL_ID}\` already exists at the exact same verified Geonorge address point.\n\n## Canonical result\n\n- Keep: \`${CANONICAL_ID}\` — Glads mølle, Sandakerveien 10A, source \`${canonical.sourceObjectId}\`.\n- Retire: \`${LEGACY_ID}\` — broad unresolved business-category proxy.\n- Migrate all active exact legacy-id references before removal.\n- Add \`${LEGACY_ID} -> ${CANONICAL_ID}\` to the legacy place-id alias guard.\n- Remove the unresolved coordinate-protocol row for the retired duplicate; no second physical coordinate is created.\n\n## Reference inventory\n\nExact legacy-id occurrences: ${occurrences.length} across ${files.length} files. See \`summary.json\` for the full file/line inventory.\n`, 'utf8');

console.log(JSON.stringify({
  legacyId: LEGACY_ID,
  canonicalId: CANONICAL_ID,
  canonicalSourceObjectId: canonical.sourceObjectId,
  runtimeLegacyMatchCount: runtimeMatches.length,
  occurrenceCount: occurrences.length,
  fileCount: files.length,
  files
}, null, 2));
