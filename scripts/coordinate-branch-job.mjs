import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const PLACE_ID = 'ulven_handelspark';
const REPORT_DIR = 'reports/oslo-coordinate-ulven-handelspark-construction-city-research';
const OFFICIAL_ABOUT = 'https://constructioncity.no/om-construction-city/';
const OFFICIAL_CONTACT = 'https://constructioncity.no/om-construction-city/kontakt/';
const MUNICIPAL_SOURCE = 'https://aktuelt.oslo.kommune.no/fagskolen-flytter-til-construction-city-p%C3%A5-ulven';

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
const legacyMatches = aggregate.filter((place) => place?.id === PLACE_ID);
if (legacyMatches.length !== 1) throw new Error(`Expected one ${PLACE_ID}, got ${legacyMatches.length}`);
const legacy = legacyMatches[0];
if (legacy.coordStatus || legacy.sourceObjectId || legacy.locatorType) throw new Error('Legacy Ulven record unexpectedly already contracted');

const evidence = readJson('data/coordinate-evidence/oslo/naeringsliv/ulven_handelspark.json');
if (evidence.coordinateDecision !== 'needs_identity_split' || evidence.identity?.identityStatus !== 'conflict') {
  throw new Error('Unexpected Ulven evidence state');
}

const build = spawnSync('npm', ['run', 'build:tools'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout ?? ''}${build.stderr ?? ''}`, 'utf8');
if (build.status !== 0) throw new Error(`build:tools failed with ${build.status}`);

const finder = spawnSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', 'Standardveien 1 0581 Oslo'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/standardveien-1-address-first.log`, `${finder.stdout ?? ''}${finder.stderr ?? ''}`, 'utf8');
const candidate = parseJsonOutput(finder.stdout);
if (finder.status !== 0 || candidate?.status !== 'verified_candidate') {
  throw new Error(`Standardveien 1 did not resolve to a verified candidate: ${candidate?.status ?? 'parse_error'}`);
}

const lat = Number(candidate.coordinate?.lat);
const lon = Number(candidate.coordinate?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Candidate has no finite coordinate');

const currentPlaces = extractPlaces(readJson('data/places/places_index.json'));
const nearby = currentPlaces
  .filter((place) => place.id !== PLACE_ID)
  .map((place) => ({
    id: place.id,
    name: place.name,
    distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2))
  }))
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
    name: 'Construction City',
    physicalScope: 'det konkrete nærings- og klyngebygget for bygg-, anleggs- og eiendomsnæringen på Ulven',
    address: 'Standardveien 1, 0581 Oslo',
    openingYear: 2025,
    identityStatus: 'resolved_candidate',
    rationale: 'Det gamle navnet «Ulven handelspark» kan ikke kildefestes som en stabil fysisk entitet. Construction City er derimot en dokumentert fysisk næringsklynge på Ulven som samsvarer med legacy-recordens overordnede idé om moderne næringsklynge og transformasjon.'
  },
  identityEvidence: [
    {
      source: 'Construction City – Om Construction City',
      url: OFFICIAL_ABOUT,
      finding: 'Offisiell institusjonskilde beskriver Construction City som møteplass og klyngefellesskap for bygg-, anleggs- og eiendomsnæringen på Ulven.'
    },
    {
      source: 'Construction City – Kontakt',
      url: OFFICIAL_CONTACT,
      finding: 'Offisiell kontaktside oppgir besøksadressen Standardveien 1, 0581 Oslo.'
    },
    {
      source: 'Oslo kommune – Fagskolen flytter til Construction City på Ulven',
      url: MUNICIPAL_SOURCE,
      finding: 'Kommunal kilde identifiserer Construction City som en kunnskapspark på Ulven for virksomheter innen bygg-, anlegg- og eiendomssektoren.'
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
  conclusion: 'Production should not verify the unsupported name «Ulven handelspark» as an area. If the legacy place is retained, correct its visible identity and scope to Construction City and use the exact official address candidate for Standardveien 1, subject to a fresh production collision check and full coordinate gates.'
};

writeJson(`${REPORT_DIR}/summary.json`, report);
writeFileSync(`${REPORT_DIR}/README.md`, `# Construction City / ${PLACE_ID} source-first research\n\nThe legacy label **Ulven handelspark** remains unsupported as a stable physical entity. The concrete replacement candidate is **Construction City**, a documented business/knowledge cluster on Ulven.\n\n- Official identity: ${OFFICIAL_ABOUT}\n- Official address source: ${OFFICIAL_CONTACT}\n- Municipal cross-check: ${MUNICIPAL_SOURCE}\n- Geonorge candidate: \`${candidate.sourceObjectId}\`\n- Coordinate: \`${lat}, ${lon}\`\n- Nearest current canonical marker: ${nearby[0] ? `\`${nearby[0].id}\` at ${nearby[0].distanceMeters} m` : 'none'}\n\nNo canonical place data is changed by this research pass.\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
