import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const PLACE_ID = 'fornebu_teknologipark';
const REPORT_DIR = 'reports/oslo-coordinate-fornebu-teknologipark-terminalbygget-research';
const IT_FORNEBU_URL = 'https://nor.itfornebu.no/terminalbygget/';
const BAERUM_URL = 'https://www.baerum.kommune.no/tjenester/kultur-idrett-og-fritid/kunst-og-kultur/rik-pa-historie/12.-nyere-arkitektur/';
const SNL_URL = 'https://snl.no/Oslo_lufthavn%2C_Fornebu';
const ADDRESS = 'Martin Linges vei 25 1364 Fornebu';

mkdirSync(REPORT_DIR, { recursive: true });
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const parseJsonOutput = (text) => {
  const value = String(text ?? '').trim();
  const start = value.indexOf('{');
  if (start < 0) return null;
  try { return JSON.parse(value.slice(start)); } catch { return null; }
};
const distanceMeters = (a, b, c, d) => {
  const rad = (x) => x * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(c - a);
  const dLon = rad(d - b);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
};
const extractPlaces = (root) => {
  const out = [];
  const seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 7 || value == null) return;
    if (Array.isArray(value)) { for (const item of value) visit(item, depth + 1); return; }
    if (typeof value !== 'object') return;
    if (typeof value.id === 'string' && typeof value.name === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
      if (!seen.has(value.id)) { seen.add(value.id); out.push(value); }
      return;
    }
    for (const child of Object.values(value)) visit(child, depth + 1);
  };
  visit(root);
  return out;
};

const aggregate = readJson('data/places/naeringsliv/oslo/places_naeringsliv.json');
const matches = aggregate.filter((place) => place?.id === PLACE_ID);
if (matches.length !== 1) throw new Error(`Expected one ${PLACE_ID}, got ${matches.length}`);
const legacy = matches[0];
if (legacy.coordStatus || legacy.sourceObjectId || legacy.locatorType) throw new Error('Legacy Fornebu record unexpectedly already contracted');

const evidence = readJson('data/coordinate-evidence/oslo/naeringsliv/fornebu_teknologipark.json');
if (evidence.coordinateDecision !== 'needs_identity_split' || evidence.identity?.identityStatus !== 'conflict') {
  throw new Error('Unexpected Fornebu evidence state');
}

const build = spawnSync('npm', ['run', 'build:tools'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout ?? ''}${build.stderr ?? ''}`, 'utf8');
if (build.status !== 0) throw new Error(`build:tools failed with ${build.status}`);

const finder = spawnSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', ADDRESS], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/martin-linges-vei-25-address-first.log`, `${finder.stdout ?? ''}${finder.stderr ?? ''}`, 'utf8');
const candidate = parseJsonOutput(finder.stdout);
if (finder.status !== 0 || candidate?.status !== 'verified_candidate') {
  throw new Error(`Martin Linges vei 25 did not resolve to a verified candidate: ${candidate?.status ?? 'parse_error'}`);
}

const lat = Number(candidate.coordinate?.lat);
const lon = Number(candidate.coordinate?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Candidate has no finite coordinate');
if (candidate.rawHit?.kommunenummer !== '3201') throw new Error(`Expected Bærum municipality 3201, got ${candidate.rawHit?.kommunenummer}`);

const currentPlaces = extractPlaces(readJson('data/places/places_index.json'));
const nearby = currentPlaces
  .filter((place) => place.id !== PLACE_ID)
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)) }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters)
  .slice(0, 12);

const report = {
  version: DATE,
  placeId: PLACE_ID,
  legacyIdentity: {
    name: legacy.name,
    coordinate: { lat: legacy.lat, lon: legacy.lon, r: legacy.r },
    year: legacy.year,
    problem: evidence.identity.identityProblem
  },
  candidateIdentity: {
    name: 'IT Fornebu – Terminalbygget',
    physicalScope: 'det tidligere terminalbygget på Oslo lufthavn Fornebu, senere ombygd til IT Fornebu og kunnskaps-/næringsmiljø for teknologibedrifter',
    address: 'Martin Linges vei 25, 1364 Fornebu',
    municipality: 'Bærum',
    county: 'Akershus',
    historicalYear: 1964,
    identityStatus: 'resolved_candidate',
    rationale: 'Legacy-beskrivelsen «tidligere flyplass, nå teknologiklynge – fra luftfart til IT» peker presist mot det bevarte tidligere terminalbygget, ikke mot hele Fornebu som område. IT Fornebu, Bærum kommune og SNL identifiserer terminalbygget som et konkret teknologisk kunnskaps- og næringsmiljø.'
  },
  identityEvidence: [
    {
      source: 'IT Fornebu Properties – Terminalbygget',
      url: IT_FORNEBU_URL,
      finding: 'Identifiserer objektet som den tidligere terminalbygningen på Oslo Flyplass Fornebu og som en ledende samling av kunnskapsbaserte bedrifter.'
    },
    {
      source: 'Bærum kommune – Rik på historie: nyere arkitektur',
      url: BAERUM_URL,
      finding: 'Bærum kommune beskriver det tidligere terminalbygget som transformert til et senter for bedrifter som arbeider med digital teknologi, IT Fornebu.'
    },
    {
      source: 'Store norske leksikon – Oslo lufthavn, Fornebu',
      url: SNL_URL,
      finding: 'SNL opplyser at terminalbygningen i dag benyttes til næringshagen og kunnskapsparken IT-Fornebu.'
    }
  ],
  coordinateCandidate: {
    status: candidate.status,
    sourceProvider: candidate.sourceProvider,
    sourceName: candidate.sourceName,
    sourceUrl: candidate.sourceUrl,
    sourceObjectId: candidate.sourceObjectId,
    coordinate: candidate.coordinate,
    rawHit: candidate.rawHit
  },
  nearestCanonicalPlaces: nearby,
  duplicateDecision: {
    exactCollisionWithin3m: Boolean(nearby[0] && nearby[0].distanceMeters <= 3),
    nearest: nearby[0] ?? null
  },
  geographyDecision: {
    legacySourceRegion: 'Oslo',
    resolvedMunicipality: 'Bærum',
    resolvedCounty: 'Akershus',
    requiresGeographicRelocation: true
  },
  conclusion: 'Production should replace the broad and geographically misplaced «Fornebu Teknologipark» proxy with the concrete IT Fornebu / Terminalbygget identity, preserve the existing placeId for compatibility, and relocate the canonical record from the Oslo business aggregate to an Akershus/Bærum source file. Use the exact Geonorge candidate for Martin Linges vei 25 subject to a fresh production collision check and full coordinate gates.'
};

writeJson(`${REPORT_DIR}/summary.json`, report);
writeFileSync(`${REPORT_DIR}/README.md`, `# IT Fornebu / Terminalbygget – ${PLACE_ID} source-first research\n\nThe legacy record is geographically misplaced in the Oslo source and too broad as “Fornebu Teknologipark”. The concrete physical identity is the former airport terminal building, later used as **IT Fornebu / Terminalbygget**, at **Martin Linges vei 25** in Bærum.\n\n- IT Fornebu identity: ${IT_FORNEBU_URL}\n- Bærum municipality cross-check: ${BAERUM_URL}\n- SNL historical/current-use cross-check: ${SNL_URL}\n- Geonorge candidate: \`${candidate.sourceObjectId}\`\n- Coordinate: \`${lat}, ${lon}\`\n- Municipality: \`${candidate.rawHit?.kommunenummer} ${candidate.rawHit?.kommunenavn}\`\n- Nearest current canonical marker: ${nearby[0] ? `\`${nearby[0].id}\` at ${nearby[0].distanceMeters} m` : 'none'}\n\nNo canonical place data is changed by this research pass.\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
