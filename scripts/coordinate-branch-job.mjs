import fs from 'node:fs';
import path from 'node:path';

const PLACE_ID = 'sorenga_sjobad';
const PLACE_PATH = 'data/places/sport/europa/norway/oslo_sport/sorenga_sjobad.json';
const PLACE_MANIFEST_ENTRY = 'places/sport/europa/norway/oslo_sport/sorenga_sjobad.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/sport/sorenga_sjobad.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/sport/sorenga_sjobad.json';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/sorenga-sjobad';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const PLACE_MANIFEST_PATH = 'data/places/manifest.json';
const EVIDENCE_MANIFEST_PATH = 'data/coordinate-evidence/manifest.json';
const SELF_PATH = 'scripts/coordinate-branch-job.mjs';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const placeManifest = readJson(PLACE_MANIFEST_PATH);
assert(Array.isArray(placeManifest.files), 'data/places/manifest.json must contain files[]');
assert(!placeManifest.files.includes(PLACE_MANIFEST_ENTRY), `${PLACE_MANIFEST_ENTRY} already registered`);
assert(!fs.existsSync(PLACE_PATH), `${PLACE_PATH} already exists`);
for (const rel of placeManifest.files) {
  const full = path.join('data', rel);
  if (!fs.existsSync(full) || !full.endsWith('.json')) continue;
  let payload;
  try { payload = readJson(full); } catch { continue; }
  const records = Array.isArray(payload) ? payload : [payload];
  assert(!records.some((record) => record?.id === PLACE_ID), `Duplicate canonical place id ${PLACE_ID} in ${full}`);
}

const coordSource = 'OpenStreetMap node 5295458069 – Sørenga sjøbad';
const coordNote = 'Eksakt navngitt OSM-POI for Sørenga sjøbad, node 5295458069, merket leisure=sports_centre og sport=swimming og koblet til Wikidata Q25427016. Identiteten og den fysiske sjøbadfunksjonen er kryssjekket mot Oslo kommune, VisitOSLO og LPO Arkitekter. Geonorge-adressepunktet for Sørengkaia 69 ble testet først, men ligger rundt 300–350 meter fra selve badeanlegget og ble derfor avvist som displayanker i den dokumenterte address-first-auditen.';

const place = {
  id: PLACE_ID,
  name: 'Sørenga sjøbad',
  lat: 59.90038,
  lon: 10.75178,
  r: 170,
  category: 'sport',
  primary_category: 'sport',
  secondary_category: 'by',
  hybrid: true,
  sport_type: 'swimming',
  place_type: 'public_sea_bath',
  year: 2015,
  emne_ids: [
    'em_sport_arena_samling',
    'em_sport_idrettsarena_sted',
    'em_sport_breddeidrett'
  ],
  desc: 'Offentlig sjøbad ytterst på Sørenga, åpnet 25. juni 2015 som del av Fjordbyens nye rekreasjonslandskap. Anlegget kombinerer strand, park, stupetårn og et 50-meters åpent svømmebasseng med åtte baner, og fungerer både som bade- og svømmeanlegg og som et av Oslos mest brukte offentlige fjordbyrom.',
  popupDesc: 'Sørenga sjøbad åpnet 25. juni 2015 ytterst på Sørengautstikkeren og ble raskt et av de tydeligste eksemplene på hvordan Oslo har åpnet havnefronten for offentlig bruk. Anlegget ble utviklet som del av de sammenhengende park- og promenadearealene på Sørenga og kombinerer strand, grøntareal, brygger, stupetårn og store oppholdsflater med et 50 meter langt åpent svømmebasseng med åtte baner.\n\nDet fysiske anlegget er større enn et vanlig adressepunkt kan beskrive. Den lange flytekonstruksjonen, bassengene, stranden og parkområdet danner ett sammenhengende sjøbad. Derfor bruker History Go et navngitt POI-anker for selve badeanlegget, mens besøksadressen Sørengkaia 69 er beholdt som adresseinformasjon, ikke som kartpunkt.\n\nFaglig behandles Sørenga først og fremst som et offentlig bade- og svømmeanlegg, men med et tydelig bylag: stedet viser hvordan tidligere havnearealer i Fjordbyen er gjort tilgjengelige for bading, opphold og hverdagsliv ved vannet. Midlertidige meldinger om badevannskvalitet er driftsinformasjon og skal ikke brukes som varig stedsidentitet.',
  quiz_profile: {
    place_type: 'offentlig_sjobad_og_fjordbyanlegg',
    subtype: 'urbant_sjomsvomme_og_rekreasjonsanlegg',
    signature_features: [
      'åpnet 25. juni 2015',
      '190 meter langt sjøbad ytterst på Sørenga',
      '50-meters åpent svømmebasseng med åtte baner',
      'kombinerer strand, park, stupetårn, brygger og oppholdsarealer',
      'del av transformasjonen fra havnefront til offentlig Fjordby'
    ],
    primary_angles: [
      'svomming_og_bading',
      'offentlig_idrettsinfrastruktur',
      'breddeaktivitet',
      'fjordby_og_bytransformasjon',
      'offentlig_rom_ved_vann'
    ],
    question_families: [
      'historisk_endring',
      'idrettsanlegg',
      'bruk',
      'teknisk_fysisk',
      'romlig_lesning',
      'kontrast'
    ],
    avoid_angles: [
      'generisk_badeplass',
      'presentere_sjorenga_som_naturlig_strand',
      'blande_midleritidig_badevannskvalitet_inn_i_varig_identitet',
      'forveksle_sjobadet_med_hele_sorenga_bydelen'
    ],
    must_include: [
      'åpningen i 2015',
      '50-metersbassenget med åtte baner',
      'kombinasjonen av svømmeanlegg og offentlig fjordbyrom',
      'rollen i åpningen av Oslos havnefront for publikum'
    ],
    contrast_targets: [
      'toyenbadet',
      'holmlia_bad',
      'bjorvika'
    ],
    notes: 'Spør om Sørenga som konkret sjøbad og svømmeanlegg med et sekundært bytransformasjonslag. Eksterne offisielle og arkitektfaglige kilder skal dominere synlig quizinnhold.'
  },
  sport_profile: {
    place_type: 'public_sea_bath',
    sports: ['swimming', 'diving'],
    clubs_or_teams: [],
    groundhopper_type: 'public_sea_bath',
    stats_focus: [
      'apningsar',
      'sjobadets_lengde',
      'bassenglengde',
      'antall_baner',
      'offentlig_tilgjengelighet'
    ],
    collection_hooks: [
      'sjobad_besokt',
      'offentlig_idrettsanlegg_besokt'
    ],
    venue_kind: 'public_sea_bath',
    groundhopper_relevant: false
  },
  rounds_exclude: ['nature', 'training'],
  locatorType: 'poi',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-node:5295458069',
  address: {
    street: 'Sørengkaia',
    number: '69',
    postcode: '0194',
    city: 'Oslo',
    country: 'NO'
  },
  geocodeAccuracy: 'geometric_center',
  coordRole: 'display_marker',
  coordType: 'poi_geometry',
  coordStatus: 'verified_geometry',
  coordSource,
  coordSourceId: 'osm-node:5295458069',
  coordSourceUrl: 'https://www.openstreetmap.org/node/5295458069',
  coordVerifiedAt: '2026-07-20',
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'Oslo kommune – Sørenga sjøbad',
      url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/sorenga-sjobad/',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'reference',
      label: 'LPO Arkitekter – Sørenga sjøbad',
      url: 'https://www.lpo.no/prosjekter/sorenga-sjobad',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'reference',
      label: 'VisitOSLO – Sørenga sjøbad',
      url: 'https://www.visitoslo.com/no/produkt/?name=Sorenga-sjobad&tlp=3067313',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    }
  ]
};
writeJson(PLACE_PATH, place);
placeManifest.files.push(PLACE_MANIFEST_ENTRY);
writeJson(PLACE_MANIFEST_PATH, placeManifest);

const evidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: PLACE_PATH,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Sørenga sjøbad – offentlig sjøbad og svømmeanlegg ytterst på Sørenga',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'poi',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [],
  evidence: [],
  addressCandidates: [
    {
      sourceObjectId: 'geonorge-adresser-v1:0301:21549:69',
      address: 'Sørengkaia 69, 0194 Oslo',
      lat: 59.90329520070351,
      lon: 10.754326773640422,
      decision: 'rejected_as_display_anchor',
      reason: 'Offisielt adressepunkt, men rundt 300–350 meter fra selve sjøbadets navngitte fysiske objekter.'
    }
  ],
  sourceObjectCandidates: [
    {
      provider: 'OpenStreetMap',
      sourceObjectId: 'osm-node:5295458069',
      name: 'Sørenga sjøbad',
      role: 'exact_named_poi'
    }
  ],
  geometryCandidates: [
    {
      provider: 'OpenStreetMap',
      sourceObjectId: 'osm-way:435813605',
      name: 'Sørenga Sjøbad',
      role: 'supporting_beach_geometry'
    },
    {
      provider: 'OpenStreetMap',
      sourceObjectId: 'osm-way:435811537',
      name: 'Sørenga Sjøbad',
      role: 'supporting_pier_geometry'
    },
    {
      provider: 'OpenStreetMap',
      sourceObjectId: 'osm-way:922847579',
      name: 'Sørenga Sjøbad',
      role: 'supporting_grass_area_geometry'
    }
  ],
  coordinateCandidates: [],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Applied to canonical place using named OSM POI after documented address-first rejection.'
  },
  notes: [coordNote]
};
writeJson(EVIDENCE_PATH, evidence);

const evidenceManifest = readJson(EVIDENCE_MANIFEST_PATH);
assert(Array.isArray(evidenceManifest.files), 'data/coordinate-evidence/manifest.json must contain files[]');
assert(!evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY), `${EVIDENCE_MANIFEST_ENTRY} already registered`);
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'en'));
writeJson(EVIDENCE_MANIFEST_PATH, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL_PATH, 'utf8');
assert(!protocol.includes(`\`${PLACE_ID}\``), `${PLACE_ID} is already present in coordinate protocol`);
const summaryMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
assert(summaryMatch, 'Could not parse Oslo protocol summary');
const oldCount = Number(summaryMatch[1]);
const needsReviewCount = Number(summaryMatch[2]);
const rows = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/gm)];
assert(rows.length > 0, 'Could not locate Oslo coordinate batch rows');
const maxBatch = Math.max(...rows.map((match) => Number(match[1])));
const batch = maxBatch + 1;
const newCount = oldCount + 1;

const newSummary = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til Sørenga sjøbad med det navngitte OSM-POI-et node 5295458069 etter at det offisielle Geonorge-adressepunktet for Sørengkaia 69 ble kontrollert og avvist som fysisk misvisende displayanker for selve sjøbadet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReviewCount}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);
const lines = protocol.split('\n');
let lastBatchRow = -1;
for (let i = 0; i < lines.length; i += 1) {
  if (/^\|\s*\d+\s*\|\s*`[^`]+`\s*\|/.test(lines[i])) lastBatchRow = i;
}
assert(lastBatchRow >= 0, 'Could not find last coordinate batch row');
lines.splice(lastBatchRow + 1, 0, `| ${batch} | \`${PLACE_ID}\` | Sørenga sjøbad | verified_geometry | \`osm-node:5295458069\` |`);
protocol = lines.join('\n');
protocol = protocol.replace(new RegExp(`ikke blant ${oldCount}\\b`, 'g'), `ikke blant ${newCount}`);
fs.writeFileSync(PROTOCOL_PATH, protocol);

writeJson(`${REPORT_DIR}/production-decision.json`, {
  candidateId: PLACE_ID,
  decision: 'produced_as_canonical_place',
  taxonomy: {
    primaryCategory: 'sport',
    secondaryCategory: 'by',
    hybrid: true
  },
  coordinate: {
    status: 'verified_geometry',
    sourceObjectId: 'osm-node:5295458069',
    lat: place.lat,
    lon: place.lon,
    coordType: place.coordType,
    rejectedAddressSourceObjectId: 'geonorge-adresser-v1:0301:21549:69'
  },
  coordinateBatch: batch,
  osloVerifiedOrControlledAfter: newCount
});

const existingReadme = fs.existsSync(`${REPORT_DIR}/README.md`) ? fs.readFileSync(`${REPORT_DIR}/README.md`, 'utf8').trimEnd() : '# Sørenga sjøbad';
fs.writeFileSync(`${REPORT_DIR}/README.md`, `${existingReadme}\n\n## Production\n\n- Canonical place: \`${PLACE_ID}\`\n- Primary category: \`sport\`\n- Secondary category: \`by\`\n- Coordinate source: \`osm-node:5295458069\`\n- Coordinate status: \`verified_geometry\`\n- Coordinate batch: ${batch}\n- Oslo verified/source-controlled total after production: ${newCount}\n`);

if (fs.existsSync(SELF_PATH)) fs.unlinkSync(SELF_PATH);
console.log(JSON.stringify({ placeId: PLACE_ID, batch, oldCount, newCount, needsReviewCount, maxBatch }, null, 2));
