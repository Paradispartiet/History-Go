import fs from 'node:fs';
import path from 'node:path';

const PLACE_ID = 'vi_vii_gallery';
const PLACE_PATH = 'data/places/kunst/oslo/places_kunst/vi_vii_gallery.json';
const PLACE_MANIFEST_ENTRY = 'places/kunst/oslo/places_kunst/vi_vii_gallery.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/kunst/vi_vii_gallery.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/kunst/vi_vii_gallery.json';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/vi-vii';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const PLACE_MANIFEST_PATH = 'data/places/manifest.json';
const EVIDENCE_MANIFEST_PATH = 'data/coordinate-evidence/manifest.json';
const SELF_PATH = 'scripts/coordinate-branch-job.mjs';

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const placeManifest = readJson(PLACE_MANIFEST_PATH);
assert(Array.isArray(placeManifest.files), 'place manifest files[] missing');
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

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Nedre Slottsgate 8, OSLO, source object geonorge-adresser-v1:0301:15006:8. Punktet brukes som dagens display- og unlock-anker for VI, VII, basert på galleriets aktuelle kontakt- og bookingkanaler i 2026. Den tidligere Bjørvika-adressen Operagata 75A beholdes som historisk lokasjonslag og brukes ikke som aktiv kartmarkør.';

const place = {
  id: PLACE_ID,
  name: 'VI, VII',
  lat: 59.91215712574447,
  lon: 10.742755978420295,
  r: 60,
  category: 'kunst',
  year: 2012,
  emne_ids: [
    'em_kunst_institusjonskritikk_og_representasjon',
    'em_kunst_kvalitet_kritikk_og_symbolsk_kapital',
    'em_kunst_okonomi_og_finansiering'
  ],
  desc: 'Internasjonalt samtidskunstgalleri etablert i Oslo i 2012 av Esperanza Rosales. VI, VII har presentert norske og internasjonale kunstnere, deltatt på store internasjonale kunstmesser og flyttet sin aktive visnings- og bookingadresse fra Operagata 75A i Bjørvika til Nedre Slottsgate 8.',
  popupDesc: 'VI, VII ble grunnlagt i Oslo i 2012 av Esperanza Rosales og har bygget en tydelig internasjonal profil gjennom utstillinger med norske og utenlandske samtidskunstnere og deltakelse på kunstmesser som Frieze og Art Basel Paris. Galleriet viser hvordan et relativt lite Oslo-galleri kan arbeide direkte inn mot et internasjonalt kunstmarked og samtidig fungere som lokalt visningssted.\n\nGalleriets fysiske Oslo-historie har flere lag. VisitOSLO og Oslobukta viser fortsatt den tidligere adressen Operagata 75A i Bjørvika, mens VI, VII sine egne kontakt- og bookingkanaler i 2026 bruker Nedre Slottsgate 8. History Go bruker derfor Nedre Slottsgate 8 som aktiv markør og beholder Operagata som tidligere lokasjon i fortellingen, ikke som en parallell aktiv VI, VII-markør.\n\nI quiz og formidling skal stedet behandles som et konkret samtidskunstgalleri og en aktør i kunstfeltet. Relevante innganger er utstillingsprogram, internasjonale nettverk, representasjon, kunstmesser og forholdet mellom visningssted og marked. Unngå å gjøre galleriet til en generell Bjørvika- eller Promenaden-markør.',
  quiz_profile: {
    place_type: 'kunstgalleri',
    subtype: 'internasjonalt_samtidskunstgalleri_med_flyttet_oslo_lokasjon',
    signature_features: [
      'grunnlagt i Oslo i 2012 av Esperanza Rosales',
      'internasjonalt samtidskunstprogram og kunstmesseaktivitet',
      'tidligere lokasjon i Operagata 75A i Bjørvika',
      'aktiv kontakt- og bookingadresse i Nedre Slottsgate 8 i 2026'
    ],
    primary_angles: [
      'samtidskunst',
      'internasjonale_kunstnettverk',
      'galleri_og_kunstmarked',
      'representasjon',
      'institusjonsgeografi_og_flytting'
    ],
    question_families: [
      'institusjonshistorie',
      'utstillingshistorie',
      'kunstfelt_og_marked',
      'internasjonale_nettverk',
      'historisk_endring'
    ],
    avoid_angles: [
      'generisk_samtidskunstgalleri',
      'bruke_Operagata_75A_som_dagens_markor',
      'generisk_Bjorvika',
      'presentere_Nedre_Slottsgate_som_opprinnelig_lokasjon'
    ],
    must_include: [
      'grunnleggelsen i 2012',
      'den internasjonale samtidskunstprofilen',
      'flyttingen fra Operagata til Nedre Slottsgate som stedsmessig tidslag',
      'forholdet mellom galleri, representasjon og internasjonalt kunstmarked'
    ],
    contrast_targets: ['galleri_map', 'kunstnernes_hus', 'astrup_fearnley'],
    notes: 'Spør VI, VII som konkret galleri og kunstfeltaktør. Eksterne utstillings- og institusjonskilder skal dominere synlig quizinnhold.'
  },
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:15006:8',
  address: { street: 'Nedre Slottsgate', number: '8', postcode: '0157', city: 'Oslo', country: 'NO' },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:15006:8',
  coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Nedre%20Slottsgate%208%20Oslo',
  coordVerifiedAt: '2026-07-20',
  coordNote,
  externalLinks: [
    { type: 'official', label: 'VI, VII – kontakt', url: 'https://www.vivii.no/Gallery', lang: 'en', verifiedAt: '2026-07-20' },
    { type: 'official', label: 'VI, VII – utstillinger', url: 'https://www.vivii.no/Exhibitions', lang: 'en', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'VI, VII – booking', url: 'https://vivii.setmore.com/', lang: 'en', verifiedAt: '2026-07-20' }
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
  currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'VI, VII, internasjonalt samtidskunstgalleri med aktiv Oslo-adresse i Nedre Slottsgate 8',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: ['entydig offisielt adressepunkt', 'aktuell galleridentitet og bookingadresse', 'avgrensning mot tidligere Operagata-lokasjon'],
  evidence: [{
    sourceProvider: 'official_address',
    sourceName: 'geonorge_adresser_v1',
    sourceUrl: place.coordSourceUrl,
    sourceObjectId: place.sourceObjectId,
    sourceQuality: 'official_address_plus_current_gallery_booking_identity',
    finding: 'Geonorge gir ett entydig adressepunkt for Nedre Slottsgate 8. VI, VII sine aktuelle kontakt- og bookingkanaler bruker denne adressen i 2026, mens Operagata 75A behandles som tidligere lokasjon.',
    canVerifyCoordinate: true,
    reason: coordNote
  }],
  addressCandidates: [{ address: 'Nedre Slottsgate 8 Oslo', sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt, aktuell institusjonsidentitet og representasjonsanker er anvendt på canonical place.' },
  notes: [coordNote]
};
writeJson(EVIDENCE_PATH, evidence);

const evidenceManifest = readJson(EVIDENCE_MANIFEST_PATH);
assert(Array.isArray(evidenceManifest.files), 'evidence manifest files[] missing');
assert(!evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY), `${EVIDENCE_MANIFEST_ENTRY} already registered`);
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'en'));
writeJson(EVIDENCE_MANIFEST_PATH, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL_PATH, 'utf8');
assert(!protocol.includes(`\`${PLACE_ID}\``), `${PLACE_ID} already in coordinate protocol`);
const summaryMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
assert(summaryMatch, 'Could not parse Oslo protocol summary');
const oldCount = Number(summaryMatch[1]);
const needsReviewCount = Number(summaryMatch[2]);
const lines = protocol.split('\n');
const headerIndex = lines.findIndex((line) => line.trim() === '| batch | placeId | navn | godkjent status | kildeobjekt |');
const needsReviewIndex = lines.findIndex((line, index) => index > headerIndex && line.trim() === '### Dokumenterte Oslo-kontroller uten godkjent koordinat');
assert(headerIndex >= 0 && needsReviewIndex > headerIndex, 'Could not bound Oslo protocol table');
const rowRegex = /^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/;
const rows = [];
for (let i = headerIndex + 2; i < needsReviewIndex; i += 1) { const match = lines[i].match(rowRegex); if (match) rows.push({ index: i, batch: Number(match[1]) }); }
assert(rows.length > 0, 'No Oslo coordinate rows found');
const maxBatch = Math.max(...rows.map((row) => row.batch));
const batch = maxBatch + 1;
const newCount = oldCount + 1;
const lastRowIndex = Math.max(...rows.map((row) => row.index));
lines.splice(lastRowIndex + 1, 0, `| ${batch} | \`${PLACE_ID}\` | VI, VII | verified | \`geonorge-adresser-v1:0301:15006:8\` |`);
protocol = lines.join('\n');
const newSummary = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til VI, VII med den entydige Geonorge-adressekoordinaten for den aktuelle kontakt- og bookingadressen Nedre Slottsgate 8; Operagata 75A beholdes som tidligere lokasjon. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReviewCount}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);
protocol = protocol.replace(new RegExp(`ikke blant ${oldCount}\\b`, 'g'), `ikke blant ${newCount}`);
fs.writeFileSync(PROTOCOL_PATH, protocol);

writeJson(`${REPORT_DIR}/production-decision.json`, {
  candidateId: PLACE_ID,
  decision: 'produced_as_canonical_place_at_current_address',
  taxonomy: { primaryCategory: 'kunst', emneIds: place.emne_ids },
  coordinate: { status: 'verified', sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon, coordType: place.coordType },
  previousLocation: { address: 'Operagata 75A, 0194 Oslo', role: 'historical_gallery_location_only' },
  coordinateBatch: batch,
  osloVerifiedOrControlledBefore: oldCount,
  osloVerifiedOrControlledAfter: newCount
});

const readmePath = `${REPORT_DIR}/README.md`;
let readme = fs.readFileSync(readmePath, 'utf8').replace(/\n## Production[\s\S]*$/m, '').trimEnd();
readme += `\n\n## Production\n\n- Canonical place: \`${PLACE_ID}\`\n- Category: \`kunst\`\n- Active coordinate source: \`geonorge-adresser-v1:0301:15006:8\`\n- Active address: Nedre Slottsgate 8\n- Previous location: Operagata 75A\n- Coordinate status: \`verified\`\n- Coordinate batch: ${batch}\n- Oslo verified/source-controlled total after production: ${newCount}\n`;
fs.writeFileSync(readmePath, readme);

if (fs.existsSync(SELF_PATH)) fs.unlinkSync(SELF_PATH);
console.log(JSON.stringify({ placeId: PLACE_ID, oldCount, newCount, maxBatch, batch, needsReviewCount }, null, 2));
