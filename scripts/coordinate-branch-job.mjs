import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const P = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(P(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(P(rel)), { recursive: true });
  fs.writeFileSync(P(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const rowsFrom = (data) => Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : Array.isArray(data?.items) ? data.items : data?.id ? [data] : [];

const PLACE_ID = 'skoytemuseet';
const PLACE_FILE = 'data/places/sport/europa/norway/oslo_sport/skoytemuseet.json';
const PLACE_ENTRY = 'places/sport/europa/norway/oslo_sport/skoytemuseet.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/sport/skoytemuseet.json';
const EVIDENCE_ENTRY = 'oslo/sport/skoytemuseet.json';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const FROGNER_STADION_FILE = 'data/places/sport/europa/norway/oslo_sport/frogner_stadion.json';
const DECISION_REPORT = 'reports/oslo-attractions-completeness-20260720/skoytemuseet/decision.md';
const VERIFIED_AT = '2026-07-20';
const ADDRESS_QUERY = 'Middelthuns gate 26 Oslo';
const MIN_DISTINCT_MARKER_DISTANCE_M = 30;

function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => value * Math.PI / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

const activeHits = [];
for (const entry of readJson(PLACE_MANIFEST).files || []) {
  const rel = `data/${entry}`;
  if (!fs.existsSync(P(rel))) continue;
  if (rowsFrom(readJson(rel)).some((place) => place?.id === PLACE_ID)) activeHits.push(rel);
}
if (activeHits.length) throw new Error(`${PLACE_ID}: active canonical duplicate in ${activeHits.join(', ')}`);
if (fs.existsSync(P(PLACE_FILE)) || fs.existsSync(P(EVIDENCE_FILE))) throw new Error(`${PLACE_ID}: target file already exists`);

const frognerStadion = readJson(FROGNER_STADION_FILE);
if (frognerStadion.id !== 'frogner_stadion' || !Number.isFinite(frognerStadion.lat) || !Number.isFinite(frognerStadion.lon)) {
  throw new Error('Could not resolve canonical Frogner stadion marker for overlap audit');
}

execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
const finderOutput = execFileSync(
  'node',
  ['dist/tools/address-first-coordinate-finder.mjs', '--address', ADDRESS_QUERY],
  { encoding: 'utf8' }
);
const finder = JSON.parse(finderOutput);
if (!finder.ok || finder.status !== 'verified_candidate') throw new Error(`Skøytemuseet address lookup failed: ${finderOutput}`);
if (finder.sourceProvider !== 'official_address') throw new Error(`Unexpected coordinate source: ${finder.sourceProvider}`);
const coordinate = finder.coordinate;
if (coordinate?.address?.street !== 'Middelthuns gate' || String(coordinate?.address?.number) !== '26') {
  throw new Error(`Unexpected address identity: ${finderOutput}`);
}

const markerDistanceM = haversineMeters(coordinate.lat, coordinate.lon, frognerStadion.lat, frognerStadion.lon);
if (markerDistanceM < MIN_DISTINCT_MARKER_DISTANCE_M) {
  throw new Error(`Skøytemuseet building anchor is only ${markerDistanceM.toFixed(1)} m from frogner_stadion marker; physical overlap gate requires review before a separate canonical place.`);
}

const coordNote = `Offisiell adressekoordinat fra Geonorge Adresser API for Middelthuns gate 26, OSLO, brukt som bygnings- og publikumsanker for Skøytemuseet. Den eksisterende canonical markøren for Frogner stadion ligger ${markerDistanceM.toFixed(1)} meter unna på selve arenaområdet. Museet modelleres derfor som en egen institusjon i det tilhørende bygget, mens stadion fortsatt representerer idrettsflaten og arenaen.`;

const place = {
  id: PLACE_ID,
  visual: { designCode: 'museum_miniature' },
  name: 'Skøytemuseet',
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: coordinate.r || 55,
  category: 'sport',
  sport_type: 'skating_history',
  place_type: 'sports_museum',
  groundhopper: false,
  year: 1914,
  rounds_exclude: ['nature', 'training'],
  emne_ids: [
    'em_sport_arena_samling',
    'em_sport_breddeidrett'
  ],
  desc: 'Skøytemuseum ved Frogner stadion, etablert i 1914 og viet norsk skøytehistorie. Samlingene spenner fra gamle skøyter og trofeer til historien om hurtigløp, kunstløp, mesterskap og noen av sportens mest markante utøvere.',
  popupDesc: 'Skøytemuseet ble etablert i 1914 og bygger blant annet på premiesamlingene etter Axel Paulsen og Oscar Mathisen. Museet rommer skøyter, skøytelignende gjenstander, fotografier, medaljer, premier og annet materiale som følger skøytesporten fra tidlige former på naturis til moderne olympisk konkurranseidrett. Kunstløpshistorien og Sonja Henie er også en del av fortellingen.\n\nDen fysiske plasseringen ved Frogner stadion er avgjørende for stedet. Stadionet representerer selve arenaen der norsk skøytehistorie ble skapt, mens museet bevarer, ordner og formidler sporene etter den. I History Go skal de derfor være to relaterte, men ikke dupliserte steder: Frogner stadion som aktiv og historisk idrettsarena, Skøytemuseet som samlings- og minneinstitusjon i det tilhørende bygget.',
  quiz_profile: {
    place_type: 'museum',
    subtype: 'norsk_skoytehistorisk_museum_ved_historisk_arena',
    signature_features: [
      'etablert i 1914',
      'bygger blant annet på premiesamlingene etter Axel Paulsen og Oscar Mathisen',
      'ligger i det tilhørende bygget ved Frogner stadion'
    ],
    primary_angles: [
      'skoytehistorie',
      'museum_og_samling',
      'hurtiglop',
      'kunstlop',
      'idrettsminner_og_materialitet'
    ],
    question_families: [
      'institusjonshistorie',
      'gjenstand_og_spor',
      'utoverhistorie',
      'mesterskap_og_ol',
      'museum_vs_arena'
    ],
    avoid_angles: [
      'generisk_sportsmuseum',
      'duplisere_frogner_stadion_som_skoytearena',
      'gjore_enkeltutovere_til_hele_stedsidentiteten',
      'blande_museets_etableringsar_med_frogner_stadions_flytting_til_dagens_plassering'
    ],
    must_include: [
      'etableringen i 1914',
      'samlingene etter Axel Paulsen og Oscar Mathisen',
      'den funksjonelle forskjellen mellom museet og Frogner stadion'
    ],
    contrast_targets: [
      'frogner_stadion',
      'holmenkollen_nasjonalanlegg',
      'norsk_idrettsmedisinsk_museum'
    ],
    notes: 'Synlige spørsmål skal bygge på dokumentert museumshistorie, konkrete gjenstander, utøvere og mesterskap. Canonical sport-emner er kun styring; eksterne museumskilder skal dominere faktainnholdet.'
  },
  sport_profile: {
    place_type: 'sports_museum',
    sports: ['skøyter', 'hurtigløp', 'kunstløp'],
    clubs_or_teams: ['Oslo Skøiteklub'],
    groundhopper_type: 'sports_history_museum',
    stats_focus: [
      'etableringsar',
      'samlingshistorie',
      'mesterskap',
      'utovere',
      'utstyr_og_skoyteutvikling'
    ],
    collection_hooks: [
      'skoytemuseum_besokt',
      'idrettshistorisk_museum_besokt',
      'skoytehistorie_samlet'
    ],
    venue_kind: 'sports_museum',
    groundhopper_relevant: false
  },
  underbadge_ids: [
    'skoyter',
    'idrettshistorie'
  ],
  related_place_ids: ['frogner_stadion'],
  locatorType: coordinate.locatorType || 'building',
  sourceProvider: finder.sourceProvider,
  sourceObjectId: finder.sourceObjectId,
  address: coordinate.address,
  geocodeAccuracy: coordinate.geocodeAccuracy,
  coordRole: coordinate.coordRole,
  coordStatus: coordinate.coordStatus,
  coordSource: coordinate.coordSource,
  coordSourceId: finder.sourceObjectId,
  coordSourceUrl: finder.sourceUrl,
  coordType: coordinate.coordType,
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'Skøytemuseet – offisiell nettside',
      url: 'https://skoytemuseet.no/next/p/33878/forside',
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    },
    {
      type: 'reference',
      label: 'VisitOSLO – Skøytemuseet',
      url: 'https://www.visitoslo.com/no/produkt/?name=Skoytemuseet&tlp=2982803',
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    },
    {
      type: 'official',
      label: 'Oslo kommune – Frogner stadion',
      url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/frogner-stadion',
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    }
  ]
};
writeJson(PLACE_FILE, place);

writeJson(EVIDENCE_FILE, {
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
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
    resolvedIdentity: 'Skøytemuseet as the independent museum institution at Middelthuns gate 26, physically related to but functionally distinct from Frogner stadion',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: place.locatorType,
    requiresSplit: false,
    splitReason: `The museum has its own institution, collections and public function; its verified building marker is ${markerDistanceM.toFixed(1)} m from the canonical Frogner stadion arena marker.`
  },
  requiredEvidence: [
    'active canonical duplicate audit',
    'normative Geonorge address-first result for Middelthuns gate 26',
    'official museum identity and establishment history',
    'physical overlap audit against frogner_stadion marker'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: finder.sourceUrl,
      sourceObjectId: finder.sourceObjectId,
      sourceQuality: 'official_address_plus_institution_identity_and_overlap_audit',
      finding: `Geonorge resolves Middelthuns gate 26 as the museum building address. The resulting marker is ${markerDistanceM.toFixed(1)} m from the existing Frogner stadion arena marker, while official and VisitOSLO sources document Skøytemuseet as a separate museum institution in the associated building.`,
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    { address: ADDRESS_QUERY, sourceProvider: finder.sourceProvider, sourceObjectId: finder.sourceObjectId, canApplyToPlace: true }
  ],
  sourceObjectCandidates: [
    { sourceProvider: finder.sourceProvider, sourceObjectId: finder.sourceObjectId, canApplyToPlace: true }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    { lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Use the verified museum-building address marker as a separate canonical sport place and keep Frogner stadion as the arena marker.'
  },
  notes: [place.coordNote]
});

const placeManifest = readJson(PLACE_MANIFEST);
if (!Array.isArray(placeManifest.files) || placeManifest.files.includes(PLACE_ENTRY)) throw new Error('Place manifest collision');
placeManifest.files.push(PLACE_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files) || evidenceManifest.files.includes(EVIDENCE_ENTRY)) throw new Error('Evidence manifest collision');
evidenceManifest.files.push(EVIDENCE_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

fs.mkdirSync(path.dirname(P(DECISION_REPORT)), { recursive: true });
fs.writeFileSync(P(DECISION_REPORT), `# Skøytemuseet — VisitOSLO Oslo West completeness decision\n\nDate: ${VERIFIED_AT}\n\n- Canonical duplicate gate: PASS.\n- Primary category: \`sport\`.\n- Institution gate: PASS — independent museum founded in 1914 with its own collections and public function.\n- Coordinate method: normative Geonorge address-first for Middelthuns gate 26.\n- Frogner stadion overlap audit: PASS — museum building marker is ${markerDistanceM.toFixed(1)} m from the canonical stadium arena marker.\n- Representation: separate but related canonical places; museum = collection/memory institution, stadium = arena.\n- PlaceCard rounds: exclude \`nature\` and \`training\`, retaining the eight prioritized rounds.\n`);

let protocol = fs.readFileSync(P(PROTOCOL), 'utf8');
if (protocol.includes('`skoytemuseet`')) throw new Error('Skøytemuseet already recorded in coordinate protocol');
const existingBatches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const batch = (existingBatches.length ? Math.max(...existingBatches) : 0) + 1;
const tableEnd = protocol.indexOf('\n\nRelevante korrigerende merger');
if (tableEnd < 0) throw new Error('Coordinate protocol table end not found');
const row = `| ${batch} | \`skoytemuseet\` | Skøytemuseet | verified | \`${finder.sourceObjectId}\` |`;
protocol = `${protocol.slice(0, tableEnd)}\n${row}${protocol.slice(tableEnd)}`;
const note = `Batch ${batch} (${VERIFIED_AT}) legger til \`skoytemuseet\` som en egen sportshistorisk museuminstitusjon ved Frogner stadion. Det normative Geonorge-punktet \`${finder.sourceObjectId}\` for Middelthuns gate 26 ligger ${markerDistanceM.toFixed(1)} meter fra canonical \`frogner_stadion\`-markøren på arenaområdet. Museet og stadion beholdes derfor som separate, relaterte steder: samlings- og minneinstitusjon versus aktiv idrettsarena.`;
const migration = protocol.indexOf('\nDuplikatmigrering');
if (migration < 0) throw new Error('Coordinate protocol migration section not found');
protocol = `${protocol.slice(0, migration)}\n\n${note}${protocol.slice(migration)}`;
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etneStart = protocol.indexOf('\n## Etne', unresolvedStart);
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\|\s*\d+\s*\|/gm) || []).length;
const unresolvedCount = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length).split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til Skøytemuseet som et eget museumssted ved Frogner stadion etter fysisk overlap-audit mot stadionmarkøren. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(P(PROTOCOL), protocol);

console.log(JSON.stringify({
  ok: true,
  placeId: PLACE_ID,
  batch,
  sourceObjectId: finder.sourceObjectId,
  coordinate: { lat: place.lat, lon: place.lon },
  frognerStadionMarkerDistanceM: Number(markerDistanceM.toFixed(1)),
  verifiedCount,
  unresolvedCount
}, null, 2));
