import fs from 'node:fs';
import path from 'node:path';

const PLACE_ID = 'frigo_friluftssenteret';
const PLACE_PATH = 'data/places/sport/europa/norway/oslo_sport/frigo_friluftssenteret.json';
const PLACE_MANIFEST_ENTRY = 'places/sport/europa/norway/oslo_sport/frigo_friluftssenteret.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/sport/frigo_friluftssenteret.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/sport/frigo_friluftssenteret.json';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/frigo';
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

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Ensjøveien 20, OSLO, source object geonorge-adresser-v1:0301:11589:20. FRIGO sin egen aktuelle kontakt- og om-side oppgir Ensjøveien 20 som besøksadresse. Punktet representerer FRIGO sitt fysiske friluftssenter og utstyrslager på Ensjø; aktiviteter ved Rudolf Nilsens plass, Jordal og på tur er brukslag og skal ikke behandles som separate FRIGO-markører.';

const place = {
  id: PLACE_ID,
  name: 'FRIGO – Friluftssenteret i Gamle Oslo',
  lat: 59.913567553035776,
  lon: 10.78965526234183,
  r: 60,
  category: 'sport',
  sport_type: 'multi_activity',
  place_type: 'community_outdoor_sports_centre',
  groundhopper: false,
  year: 1995,
  emne_ids: [
    'em_sport_breddeidrett',
    'em_sport_inkludering_idrett'
  ],
  desc: 'Kommunalt frilufts- og aktivitetssenter på Ensjø, startet i 1995 og drevet av Bydel Gamle Oslo. FRIGO gir barn og unge tilgang til gratis sports- og friluftsutstyr, turer, aktivitetsgrupper og åpne møteplasser, og fungerer som konkret infrastruktur for lavterskel deltakelse i idrett og friluftsliv.',
  popupDesc: 'FRIGO – Friluftssenteret i Gamle Oslo – ble startet i 1995 og drives kommunalt under Bydel Gamle Oslo. Det fysiske senteret og utstyrslageret ligger i Ensjøveien 20. Her kan barn og unge, familier, skoler og organisasjoner få tilgang til utstyr som ski, skøyter, sykler, kanoer, telt og annet friluftsutstyr, ofte uten kostnad for brukerne.\n\nFRIGO er mer enn et utlånslager, men History Go-markøren representerer det konkrete senteret på Ensjø. Organisasjonen arrangerer turer og driver aktiviteter flere steder i byen, blant annet åpne møteplasser og tilbud knyttet til Rudolf Nilsens plass og Jordal. Disse aktivitetene er deler av FRIGOs virksomhet, ikke separate fysiske FRIGO-steder.\n\nFaglig er FRIGO et sterkt eksempel på breddeidrett og inkludering: tilgang til utstyr, veiledning og gratis aktivitet senker økonomiske og praktiske terskler for deltakelse. Quiz og formidling skal derfor bruke det dokumenterte senteret, etableringen i 1995, utlånsordningen og den kommunale rollen som konkrete innganger – ikke redusere stedet til en generell påstand om friluftsliv.',
  quiz_profile: {
    place_type: 'kommunalt_frilufts_og_utstyrssenter',
    subtype: 'lavterskel_aktivitetsinfrastruktur_for_barn_og_unge',
    signature_features: [
      'kommunalt friluftssenter startet i 1995',
      'fysisk senter og utstyrslager i Ensjøveien 20',
      'gratis eller lavterskel tilgang til sports- og friluftsutstyr',
      'turer, aktivitetsgrupper og åpne møteplasser for barn og unge'
    ],
    primary_angles: [
      'breddeidrett',
      'inkludering_i_idrett',
      'utstyr_og_tilgang',
      'kommunal_fritidsinfrastruktur',
      'barn_og_unges_deltakelse'
    ],
    question_families: [
      'institusjonshistorie',
      'bruk',
      'inkludering',
      'utstyr_og_tilgang',
      'kontrast'
    ],
    avoid_angles: [
      'generisk_friluftsliv',
      'presentere_alle_frigo_aktivitetssteder_som_samme_fysiske_markor',
      'bruke_VisitOSLOs_eldre_Ensjoeveien_7_som_dagens_adresse',
      'presentere_senteret_som_en_idrettsarena_for_en_bestemt_klubb'
    ],
    must_include: [
      'oppstarten i 1995',
      'dagens fysiske senter i Ensjøveien 20',
      'gratis utlån av sports- og friluftsutstyr',
      'rollen i å senke terskler for barn og unges aktivitet'
    ],
    contrast_targets: [
      'ekt_rideskole_husdyrpark',
      'ekebergsletta',
      'toyenbadet'
    ],
    notes: 'Spør om FRIGO som konkret kommunalt senter og tilgangsinfrastruktur for aktivitet. Eksterne FRIGO- og Oslo kommune-kilder skal dominere synlig quizinnhold.'
  },
  sport_profile: {
    place_type: 'community_outdoor_sports_centre',
    sports: [
      'multi_activity',
      'outdoor_recreation'
    ],
    clubs_or_teams: [],
    groundhopper_type: 'community_activity_centre',
    stats_focus: [
      'etableringsar',
      'utstyrsutlan',
      'malgrupper',
      'kommunal_drift',
      'lavterskel_deltakelse'
    ],
    collection_hooks: [
      'friluftssenter_besokt',
      'gratis_utstyrstilbud_besokt'
    ],
    venue_kind: 'community_outdoor_sports_centre',
    groundhopper_relevant: false
  },
  rounds_exclude: [
    'nature',
    'training'
  ],
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:11589:20',
  address: {
    street: 'Ensjøveien',
    number: '20',
    postcode: '0661',
    city: 'Oslo',
    country: 'NO'
  },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:11589:20',
  coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Ensj%C3%B8veien%2020%20Oslo',
  coordVerifiedAt: '2026-07-20',
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'FRIGO – Om FRIGO',
      url: 'https://frigo.no/om-frigo/',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'official',
      label: 'FRIGO – Kontakt oss',
      url: 'https://frigo.no/kontakt-oss/',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'official',
      label: 'Oslo kommune – Lån utstyr gratis i vinterferien',
      url: 'https://aktuelt.oslo.kommune.no/lan-utstyr-gratis-i-vinterferien',
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
    resolvedIdentity: 'FRIGO sitt fysiske friluftssenter og utstyrslager på Ensjø',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [],
  evidence: [],
  addressCandidates: [
    {
      sourceObjectId: 'geonorge-adresser-v1:0301:11589:20',
      address: 'Ensjøveien 20, 0661 Oslo',
      lat: place.lat,
      lon: place.lon,
      decision: 'selected_current_official_address',
      reason: 'FRIGO sin egen aktuelle kontakt- og om-side oppgir Ensjøveien 20 som besøksadresse.'
    }
  ],
  sourceObjectCandidates: [],
  geometryCandidates: [],
  coordinateCandidates: [],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Applied to canonical place using exact Geonorge address point.'
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

const newSummary = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til FRIGO – Friluftssenteret i Gamle Oslo med offisiell Geonorge-adressekoordinat for dagens besøksadresse Ensjøveien 20. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReviewCount}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);
const lines = protocol.split('\n');
let lastBatchRow = -1;
for (let i = 0; i < lines.length; i += 1) {
  if (/^\|\s*\d+\s*\|\s*`[^`]+`\s*\|/.test(lines[i])) lastBatchRow = i;
}
assert(lastBatchRow >= 0, 'Could not find last coordinate batch row');
lines.splice(lastBatchRow + 1, 0, `| ${batch} | \`${PLACE_ID}\` | FRIGO – Friluftssenteret i Gamle Oslo | verified | \`geonorge-adresser-v1:0301:11589:20\` |`);
protocol = lines.join('\n');
protocol = protocol.replace(new RegExp(`ikke blant ${oldCount}\\b`, 'g'), `ikke blant ${newCount}`);
fs.writeFileSync(PROTOCOL_PATH, protocol);

writeJson(`${REPORT_DIR}/production-decision.json`, {
  candidateId: PLACE_ID,
  decision: 'produced_as_canonical_place',
  taxonomy: {
    primaryCategory: 'sport',
    emneIds: place.emne_ids
  },
  coordinate: {
    status: 'verified',
    sourceObjectId: place.sourceObjectId,
    lat: place.lat,
    lon: place.lon,
    coordType: place.coordType
  },
  coordinateBatch: batch,
  osloVerifiedOrControlledAfter: newCount
});

const existingReadme = fs.existsSync(`${REPORT_DIR}/README.md`) ? fs.readFileSync(`${REPORT_DIR}/README.md`, 'utf8').trimEnd() : '# FRIGO';
fs.writeFileSync(`${REPORT_DIR}/README.md`, `${existingReadme}\n\n## Production\n\n- Canonical place: \`${PLACE_ID}\`\n- Category: \`sport\`\n- Coordinate source: \`geonorge-adresser-v1:0301:11589:20\`\n- Coordinate status: \`verified\`\n- Coordinate batch: ${batch}\n- Oslo verified/source-controlled total after production: ${newCount}\n`);

if (fs.existsSync(SELF_PATH)) fs.unlinkSync(SELF_PATH);
console.log(JSON.stringify({ placeId: PLACE_ID, batch, oldCount, newCount, needsReviewCount, maxBatch }, null, 2));
