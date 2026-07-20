import fs from 'node:fs';
import path from 'node:path';

const PLACE_ID = 'akrobaten_gangbro';
const PLACE_PATH = 'data/places/by/oslo/places/akrobaten_gangbro.json';
const PLACE_MANIFEST_ENTRY = 'places/by/oslo/places/akrobaten_gangbro.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/by/akrobaten_gangbro.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/by/akrobaten_gangbro.json';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/akrobaten';
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

// Hard duplicate gate across the active place manifest.
const placeManifest = readJson(PLACE_MANIFEST_PATH);
assert(Array.isArray(placeManifest.files), 'data/places/manifest.json must contain files[]');
assert(!placeManifest.files.includes(PLACE_MANIFEST_ENTRY), `${PLACE_MANIFEST_ENTRY} already registered`);
assert(!fs.existsSync(PLACE_PATH), `${PLACE_PATH} already exists`);

for (const rel of placeManifest.files) {
  const full = path.join('data', rel);
  if (!fs.existsSync(full) || !full.endsWith('.json')) continue;
  let payload;
  try {
    payload = readJson(full);
  } catch {
    continue;
  }
  const records = Array.isArray(payload) ? payload : [payload];
  assert(!records.some((record) => record?.id === PLACE_ID), `Duplicate canonical place id ${PLACE_ID} in ${full}`);
}

const coordNote = 'Geometrisk representasjonspunkt for den navngitte OpenStreetMap-way 468892289, Akrobaten. Broidentiteten, funksjonen som gang- og sykkelbro og åpningen i 2011 er kryssjekket mot L2 Arkitekter, VisitOSLO og Oslo byleksikon. Punktet representerer selve broen over sporområdet ved Oslo S, ikke Grønland, Bjørvika eller Oslo S som helhet.';
const coordSource = 'OpenStreetMap way 468892289 – Akrobaten';

const place = {
  id: PLACE_ID,
  name: 'Akrobaten gangbro',
  lat: 59.90947,
  lon: 10.7596,
  r: 120,
  category: 'by',
  primary_category: 'by',
  year: 2011,
  emne_ids: [
    'em_by_infrastruktur_mobilitet',
    'em_by_barrierer_forbindelser',
    'em_by_gangstrommer_snarveier'
  ],
  desc: 'Gang- og sykkelbro over sporområdet ved Oslo S, åpnet i 2011 for å binde Grønland og områdene nord for stasjonen tettere sammen med Bjørvika. Den 206 meter lange stål- og glassbroen er både ferdselsåre, stasjonsadkomst og et tydelig arkitektonisk landemerke i den nye østlige sentrumsbyen.',
  popupDesc: 'Akrobaten krysser det store jernbanesporområdet ved Oslo S og binder sammen Grønland-siden med Bjørvika. Broen ble åpnet 9. april 2011 og ble utformet av Rambøll og L2 Arkitekter. Den slanke gangbanen henger under et markant, asymmetrisk stålfagverk, og konstruksjonen ble formet av behovet for å spenne over et svært bredt og teknisk krevende sporområde med få mulige fundamentpunkter.\n\nBroens betydning er derfor både fysisk og urban. Jernbanen er en av de sterkeste barrierene i indre Oslo, og Akrobaten lager en direkte gang- og sykkelforbindelse mellom områder som tidligere var tydeligere skilt. Samtidig gir trapper og heis tilgang ned mot jernbaneplattformene, slik at broen også fungerer som en del av stasjonens bevegelsessystem.\n\nI History Go behandles Akrobaten som konkret infrastruktur og byarkitektur, ikke som et generelt symbol på Bjørvika. Quiz og formidling skal ta utgangspunkt i den faktiske broen: åpningen i 2011, forbindelsen over sporene, materialiteten i stål og glass, forholdet mellom barriere og forbindelse og rollen som overgang mellom Grønland og den nye byen i Bjørvika.',
  quiz_profile: {
    place_type: 'gang_og_sykkelbro',
    subtype: 'moderne_stalfagverksbro_over_jernbanespor',
    signature_features: [
      '206 meter lang gang- og sykkelbro over sporområdet ved Oslo S',
      'åpnet 9. april 2011',
      'asymmetrisk overliggende stålfagverk og glassrekkverk',
      'binder Grønland og områdene nord for stasjonen sammen med Bjørvika',
      'gir også adkomst ned mot jernbaneplattformene'
    ],
    primary_angles: [
      'infrastruktur_og_mobilitet',
      'barriere_og_forbindelse',
      'gangstrommer_og_snarveier',
      'arkitektur_og_konstruksjon',
      'bytransformasjon'
    ],
    question_families: [
      'gjenkjenning',
      'teknisk_fysisk',
      'bruk_og_bevegelse',
      'romlig_lesning',
      'kontrast',
      'historisk_endring'
    ],
    avoid_angles: [
      'generisk_bjorvika',
      'generisk_oslo_s',
      'forveksle_broen_med_en_bilbro',
      'late_som_barcode_er_del_av_broen'
    ],
    must_include: [
      'åpningen i 2011',
      'kryssingen av jernbanesporene ved Oslo S',
      'forbindelsen mellom Grønland-siden og Bjørvika',
      'stålfagverket og broens funksjon for gående og syklende'
    ],
    contrast_targets: [
      'jernbanetorget',
      'bjorvika',
      'bispelokket'
    ],
    notes: 'Spør om Akrobaten som konkret bro, ferdselsåre og forbindelse over en fysisk jernbanebarriere. Eksterne kilder skal dominere synlig quizinnhold.'
  },
  locatorType: 'linear_area',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:468892289',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'line_anchor',
  coordType: 'bridge_center',
  coordStatus: 'verified_geometry',
  coordSource,
  coordSourceId: 'osm-way:468892289',
  coordSourceUrl: 'https://www.openstreetmap.org/way/468892289',
  coordVerifiedAt: '2026-07-20',
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'L2 Arkitekter – Akrobaten bro',
      url: 'https://l2.no/prosjekt/akrobaten-bro',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'reference',
      label: 'VisitOSLO – Akrobaten gangbro',
      url: 'https://www.visitoslo.com/no/produkt/?name=Akrobaten-gangbro&tlp=3019273',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'reference',
      label: 'Oslo byleksikon – Akrobaten',
      url: 'https://oslobyleksikon.no/side/Akrobaten',
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
    resolvedIdentity: 'Akrobaten gangbro over sporområdet ved Oslo S',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'linear_area',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [],
  evidence: [],
  addressCandidates: [],
  sourceObjectCandidates: [
    {
      provider: 'OpenStreetMap',
      sourceObjectId: 'osm-way:468892289',
      name: 'Akrobaten',
      role: 'exact_named_bridge_geometry'
    }
  ],
  geometryCandidates: [
    {
      provider: 'OpenStreetMap',
      sourceObjectId: 'osm-way:468892289',
      lat: place.lat,
      lon: place.lon,
      role: 'bridge_center'
    }
  ],
  coordinateCandidates: [],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Applied to canonical place.'
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

const lines = protocol.split('\n');
const headerIndex = lines.findIndex((line) => line.trim() === '| batch | placeId | navn | godkjent status | kildeobjekt |');
assert(headerIndex >= 0, 'Could not locate Oslo coordinate table');
let rowEnd = headerIndex + 2;
let maxBatch = 0;
for (; rowEnd < lines.length; rowEnd += 1) {
  const line = lines[rowEnd];
  if (!line.startsWith('|')) break;
  const match = line.match(/^\|\s*(\d+)\s*\|/);
  if (match) maxBatch = Math.max(maxBatch, Number(match[1]));
}
assert(maxBatch > 0, 'Could not determine maximum Oslo batch number');
const batch = maxBatch + 1;
const newCount = oldCount + 1;

const oldSummary = summaryMatch[0];
const newSummary = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til Akrobaten gangbro med geometrisenteret for den navngitte OSM-way 468892289, kryssjekket mot L2 Arkitekter, VisitOSLO og Oslo byleksikon. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReviewCount}.`;
protocol = protocol.replace(oldSummary, newSummary);

const updatedLines = protocol.split('\n');
const updatedHeaderIndex = updatedLines.findIndex((line) => line.trim() === '| batch | placeId | navn | godkjent status | kildeobjekt |');
let insertIndex = updatedHeaderIndex + 2;
while (insertIndex < updatedLines.length && updatedLines[insertIndex].startsWith('|')) insertIndex += 1;
updatedLines.splice(insertIndex, 0, `| ${batch} | \`${PLACE_ID}\` | Akrobaten gangbro | verified_geometry | \`osm-way:468892289\` |`);
protocol = updatedLines.join('\n');
protocol = protocol.replace(new RegExp(`ikke blant ${oldCount}\\b`, 'g'), `ikke blant ${newCount}`);
fs.writeFileSync(PROTOCOL_PATH, protocol);

writeJson(`${REPORT_DIR}/decision.json`, {
  candidateId: PLACE_ID,
  decision: 'produce_as_canonical_place',
  taxonomy: {
    primaryCategory: 'by',
    rationale: 'Akrobaten er en fysisk gang- og sykkelbro og en konkret del av byens mobilitets- og forbindelsesstruktur.'
  },
  overlapAudit: {
    canonicalDuplicateFound: false,
    distinctFrom: ['jernbanetorget', 'oslo_s', 'bjorvika', 'gronland'],
    rationale: 'De eksisterende stedene dekker knutepunkt, stasjon og bydeler/områder. Akrobaten er et selvstendig navngitt broobjekt med egen fysisk geometri og funksjon.'
  },
  coordinateDecision: {
    status: 'verified_geometry',
    sourceObjectId: 'osm-way:468892289',
    lat: place.lat,
    lon: place.lon,
    coordType: 'bridge_center'
  },
  sources: [
    'https://l2.no/prosjekt/akrobaten-bro',
    'https://www.visitoslo.com/no/produkt/?name=Akrobaten-gangbro&tlp=3019273',
    'https://oslobyleksikon.no/side/Akrobaten',
    'https://www.openstreetmap.org/way/468892289'
  ],
  coordinateBatch: batch,
  osloVerifiedOrControlledAfter: newCount
});

fs.writeFileSync(`${REPORT_DIR}/README.md`, `# Akrobaten gangbro – canonical decision\n\n- Decision: produce as canonical \`by\` place.\n- Identity: exact named pedestrian and cycle bridge over the Oslo S rail area.\n- Opened: 2011.\n- Geometry: OpenStreetMap way \`468892289\`, used as \`bridge_center\`.\n- Overlap: distinct from \`oslo_s\`, \`jernbanetorget\`, \`bjorvika\` and broader Grønland area records.\n- Coordinate batch: ${batch}.\n- Oslo verified/source-controlled total after this batch: ${newCount}.\n\nThe bridge is treated as concrete mobility infrastructure and architecture, not as a generic Bjørvika marker.\n`);

// The workflow has already loaded and executed this job; remove it so it cannot ship with production data.
if (fs.existsSync(SELF_PATH)) fs.unlinkSync(SELF_PATH);

console.log(JSON.stringify({
  placeId: PLACE_ID,
  batch,
  osloCountBefore: oldCount,
  osloCountAfter: newCount,
  needsReviewCount,
  placePath: PLACE_PATH,
  evidencePath: EVIDENCE_PATH
}, null, 2));
