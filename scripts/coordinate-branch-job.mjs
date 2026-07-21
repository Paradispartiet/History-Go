import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const DATE = '2026-07-21';
const BATCH = 118;
const AGGREGATE = 'data/places/politikk/oslo/places_politikk.json';
const CHILD_DIR = 'data/places/politikk/oslo/places_politikk';
const INDEX = 'data/places/politikk/oslo/places_politikk_index.json';
const MANIFEST = 'data/places/politikk/oslo/places_politikk_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-118-politikk';

const BUILDINGS = {
  stortinget: {
    address: 'Karl Johans gate 22 Oslo',
    addressBasis: 'Stortingets egen bygningshistorikk dokumenterer Karl Johans gate 22 som stortingsbygningens adresse.'
  },
  oslo_radhus: {
    address: 'Rådhusplassen 1 Oslo',
    addressBasis: 'Oslo kommune oppgir Rådhusplassen 1 som besøksadresse for Oslo rådhus.'
  },
  hoyesteretts_hus: {
    address: 'Høyesteretts plass 1 Oslo',
    addressBasis: 'Norges Høyesterett oppgir Høyesteretts plass 1 som adressen til Høyesteretts hus.'
  },
  politihuset_gronland: {
    address: 'Grønlandsleiret 44 Oslo',
    addressBasis: 'Politiet oppgir Grønlandsleiret 44 som besøksadresse for Grønland politistasjon / Politihuset i Oslo.'
  },
  folkets_hus_oslo: {
    address: 'Youngs gate 11 Oslo',
    addressBasis: 'Folkets Hus / Oslo Kongressenter er dokumentert på Youngs gate 11.'
  }
};

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex');
}
function findPlace(list, id) {
  const place = list.find((item) => item?.id === id);
  if (!place) throw new Error(`Missing place ${id}`);
  return place;
}
function addressLookup(id, address) {
  const proc = spawnSync(process.execPath, ['dist/tools/address-first-coordinate-finder.mjs', '--address', address], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  const stdout = String(proc.stdout || '').trim();
  const stderr = String(proc.stderr || '').trim();
  if (!stdout) throw new Error(`No Geonorge output for ${id}: ${stderr}`);
  let result;
  try {
    result = JSON.parse(stdout);
  } catch {
    throw new Error(`Could not parse Geonorge output for ${id}: ${stdout}\n${stderr}`);
  }
  writeJson(`${REPORT_DIR}/geonorge-${id}.json`, result);
  return result;
}
function patchOfficialAddress(place, result) {
  Object.assign(place, result.coordinate);
  place.coordSourceId = result.sourceObjectId;
  place.coordSourceUrl = result.sourceUrl;
  place.coordVerifiedAt = DATE;
}
function currentCoordinate(place) {
  return {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote
  };
}
function officialAddressEvidence(existing, place, result, address, basis) {
  return {
    ...existing,
    schemaVersion: existing.schemaVersion || '1.0',
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: currentCoordinate(place),
    requiredEvidence: [
      'entydig offisielt adressepunkt',
      'dokumentert at adressen representerer den konkrete canonical bygningen'
    ],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'geonorge_adresser_v1',
        sourceUrl: result.sourceUrl,
        sourceObjectId: result.sourceObjectId,
        sourceQuality: 'official_address_plus_documented_identity',
        finding: `${result.reason} ${basis}`,
        canVerifyCoordinate: true,
        reason: result.coordinate.coordNote
      }
    ],
    addressCandidates: [
      {
        address,
        sourceProvider: 'official_address',
        sourceObjectId: result.sourceObjectId,
        canApplyToPlace: true
      }
    ],
    sourceObjectCandidates: [
      {
        sourceProvider: 'official_address',
        sourceObjectId: result.sourceObjectId,
        canApplyToPlace: true
      }
    ],
    geometryCandidates: [],
    coordinateCandidates: [
      {
        lat: place.lat,
        lon: place.lon,
        coordRole: 'display_marker',
        canApplyToPlace: true
      }
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Kildekontrakt, identitet og representasjonsanker er anvendt på canonical place.'
    },
    notes: [
      result.coordinate.coordNote,
      basis,
      'Address-first-korreksjon av batch 118: OSM-geometri brukes ikke som primærkilde når Geonorge gir ett entydig relevant adressepunkt.'
    ]
  };
}
function fallbackEvidence(existing, place, result, address, basis) {
  const osmEvidence = (existing.evidence || []).filter((entry) => entry?.sourceProvider === 'osm');
  const reason = `Geonorge address-first ble forsøkt for ${address}, men ga ${result.status}: ${result.reason}`;
  place.coordNote = `${reason}. Den allerede kontrollerte eksakte navngitte OSM-bygningsgeometrien beholdes derfor som dokumentert fallback; ingen nearest/first-hit-logikk brukes.`;
  return {
    ...existing,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: currentCoordinate(place),
    requiredEvidence: [
      'Geonorge forsøkt først for konkret adresse',
      'ett eksakt navngitt fysisk OSM-bygningsobjekt som fallback'
    ],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'geonorge_adresser_v1',
        sourceUrl: result.sourceUrl || '',
        sourceObjectId: result.sourceObjectId || `geonorge-address-attempt:${place.id}`,
        sourceQuality: 'address_first_attempt_not_applicable',
        finding: `${reason}. ${basis}`,
        canVerifyCoordinate: false,
        reason: result.reason
      },
      ...osmEvidence
    ],
    addressCandidates: [
      {
        address,
        sourceProvider: 'official_address',
        sourceObjectId: result.sourceObjectId || `geonorge-address-attempt:${place.id}`,
        canApplyToPlace: false,
        reason: result.reason
      }
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Geonorge-first-forsøket er dokumentert; eksakt navngitt OSM-bygningsgeometri beholdes som fallback.'
    },
    notes: [reason, basis, place.coordNote]
  };
}

execFileSync('npm', ['run', 'build:tools'], { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(full(REPORT_DIR), { recursive: true });

const aggregate = readJson(AGGREGATE);
const index = readJson(INDEX);
const manifest = readJson(MANIFEST);
const results = {};

for (const [id, config] of Object.entries(BUILDINGS)) {
  const place = findPlace(aggregate, id);
  const before = {
    lat: place.lat,
    lon: place.lon,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    sourceObjectId: place.sourceObjectId || place.coordSourceId || null
  };
  const lookup = addressLookup(id, config.address);
  const evidencePath = `data/coordinate-evidence/oslo/politikk/${id}.json`;
  const evidence = readJson(evidencePath);

  if (lookup.ok && lookup.status === 'verified_candidate' && lookup.coordinate) {
    patchOfficialAddress(place, lookup);
    writeJson(evidencePath, officialAddressEvidence(evidence, place, lookup, config.address, config.addressBasis));
    results[id] = { method: 'official_address', address: config.address, before, after: currentCoordinate(place), sourceObjectId: place.sourceObjectId };
  } else {
    writeJson(evidencePath, fallbackEvidence(evidence, place, lookup, config.address, config.addressBasis));
    results[id] = { method: 'osm_fallback_after_address_first', address: config.address, lookupStatus: lookup.status, lookupReason: lookup.reason, before, after: currentCoordinate(place), sourceObjectId: place.sourceObjectId || place.coordSourceId };
  }

  writeJson(`${CHILD_DIR}/${id}.json`, place);
  const row = findPlace(index, id);
  for (const key of ['lat', 'lon', 'r', 'coordStatus', 'coordType']) row[key] = place[key] ?? null;
}

writeJson(AGGREGATE, aggregate);
writeJson(INDEX, index);

manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
for (const row of manifest.places || []) {
  if (!BUILDINGS[row.id]) continue;
  row.sha256 = sha256(`data/places/politikk/oslo/${row.file}`);
}
writeJson(MANIFEST, manifest);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
for (const id of Object.keys(BUILDINGS)) {
  const place = findPlace(aggregate, id);
  const sourceId = place.sourceObjectId || place.coordSourceId;
  const rowRe = new RegExp(`^\\| 118 \\| \\`${id}\\` \\| [^|]+ \\| [^|]+ \\| \\`[^\\`]+\\` \\|$`, 'm');
  const replacement = `| 118 | \`${id}\` | ${place.name} | ${place.coordStatus} | \`${sourceId}\` |`;
  if (!rowRe.test(protocol)) throw new Error(`Could not find batch 118 protocol row for ${id}`);
  protocol = protocol.replace(rowRe, replacement);
}

const officialIds = Object.entries(results).filter(([, value]) => value.method === 'official_address').map(([id]) => id);
const fallbackIds = Object.entries(results).filter(([, value]) => value.method !== 'official_address').map(([id]) => id);
const batchNote = `Batch 118 (2026-07-21) fullfører politikk-manifestet etter objekt-type-først-metoden. \`youngstorget\` og \`eidsvolls_plass\` bruker eksakte navngitte plassgeometrier. De konkrete adressebare byggene ${officialIds.map((id) => `\`${id}\``).join(', ')} bruker entydige Geonorge-adressepunkter etter address-first-policyen.${fallbackIds.length ? ` ${fallbackIds.map((id) => `\`${id}\``).join(', ')} beholdes på eksakt OSM-bygningsgeometri først etter dokumentert Geonorge-forsøk uten anvendbart entydig treff.` : ''} \`regjeringskvartalet\` forblir needs_review fordi eneste eksakte samlede OSM-kandidat er en midlertidig \`landuse=construction\`-geometri, ikke en stabil canonical institusjonsgrense. Ingen nearest/first-hit-logikk brukes.`;
protocol = protocol.replace(/^Batch 118 \(2026-07-21\).*$/m, batchNote);
fs.writeFileSync(full(PROTOCOL), protocol);

const originalResultsPath = `${REPORT_DIR}/results.json`;
const originalResults = fs.existsSync(full(originalResultsPath)) ? readJson(originalResultsPath) : {};
originalResults.addressFirstCorrectionAt = new Date().toISOString();
originalResults.method = 'object-type first; concrete addressable buildings use Geonorge first; exact OSM geometry is only a documented fallback; public spaces use exact geometry; no nearest/first-hit';
originalResults.addressFirstResults = results;
originalResults.after = originalResults.after || {};
for (const id of Object.keys(BUILDINGS)) {
  const place = findPlace(aggregate, id);
  originalResults.after[id] = {
    lat: place.lat,
    lon: place.lon,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    sourceObjectId: place.sourceObjectId || place.coordSourceId || null
  };
}
writeJson(originalResultsPath, originalResults);

const readmePath = `${REPORT_DIR}/README.md`;
let readme = fs.existsSync(full(readmePath)) ? fs.readFileSync(full(readmePath), 'utf8').trimEnd() : '# Oslo coordinate control batch 118 – politikk';
const correctionHeader = '## Address-first correction';
if (readme.includes(correctionHeader)) readme = readme.slice(0, readme.indexOf(correctionHeader)).trimEnd();
readme += `\n\n${correctionHeader}\n\nDen opprinnelige batch-kjøringen gikk direkte til OSM for konkrete adressebare bygg. Dette er korrigert mot den låste coordinate policyen: Geonorge Adresser API er forsøkt først for Stortinget, Oslo rådhus, Høyesteretts hus, Politihuset på Grønland og Folkets Hus i Oslo. Entydige adressepunkter brukes som primary coordinate source; OSM-geometri beholdes bare som dokumentert fallback dersom adresseoppslaget ikke kan anvendes. Youngstorget og Eidsvolls plass forblir geometriankre, og Regjeringskvartalet forblir needs_review.\n\n- Geonorge primary: ${officialIds.join(', ') || 'ingen'}\n- OSM fallback etter dokumentert adresseforsøk: ${fallbackIds.join(', ') || 'ingen'}\n`;
fs.writeFileSync(full(readmePath), `${readme}\n`);

console.log(JSON.stringify({ ok: true, batch: BATCH, officialIds, fallbackIds, results }, null, 2));
