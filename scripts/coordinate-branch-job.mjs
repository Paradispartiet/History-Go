import fs from 'node:fs';
import path from 'node:path';

const PLACE_ID = 'the_oslo_gallery';
const PLACE_PATH = 'data/places/kunst/oslo/places_kunst/the_oslo_gallery.json';
const PLACE_MANIFEST_ENTRY = 'places/kunst/oslo/places_kunst/the_oslo_gallery.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/kunst/the_oslo_gallery.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/kunst/the_oslo_gallery.json';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/the-oslo-gallery';
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

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Josefines gate 2A, OSLO, source object geonorge-adresser-v1:0301:13536:2A. Punktet brukes som display- og unlock-anker for The Oslo Gallery / The Oslo Studio på Bislett. Galleriets egen aktive nettside og VisitOSLO bekrefter den samme fysiske adressen i 2026.';

const place = {
  id: PLACE_ID,
  name: 'The Oslo Gallery',
  lat: 59.924682238617315,
  lon: 10.730101423555459,
  r: 60,
  category: 'kunst',
  year: 2024,
  emne_ids: [
    'em_kunst_institusjonskritikk_og_representasjon',
    'em_kunst_kvalitet_kritikk_og_symbolsk_kapital',
    'em_kunst_okonomi_og_finansiering'
  ],
  desc: 'Galleri og kreativ hub i Josefines gate 2A på Bislett, drevet sammen med The Oslo Studio. The Oslo Gallery formidler signerte kunsttrykk i begrensede opplag, viser originalverk og arrangerer soloutstillinger og eventer, med et uttalt mål om å gjøre kvalitetskunst mer tilgjengelig.',
  popupDesc: 'The Oslo Gallery holder til i Josefines gate 2A på Bislett og fungerer både som fysisk galleri, nettgalleri og kreativ hub sammen med The Oslo Studio. Publikum kan se galleriets samling av signerte og nummererte kunsttrykk, oppleve soloutstillinger og andre kunstuttrykk og avtale private visninger utenom utstillingsperioder.\n\nVirksomheten er tett knyttet til kunstformidling og salg. Galleriet profilerer seg på begrensede opplag og en mellomposisjon mellom kostbare enkeltverk og masseproduserte plakater. Det gjør stedet relevant for spørsmål om hvordan private gallerier bygger kvalitet, tilgjengelighet, pris og symbolsk verdi rundt kunst.\n\nHistory Go bruker 2024 som startår for den nåværende driftsenheten The Oslo Studio AS, ikke som en påstand om en separat dokumentert åpningsdato for selve gallerirommet. Quiz og formidling skal ta utgangspunkt i det konkrete galleriet på Bislett, kunstformidlingen, de begrensede opplagene og forholdet mellom fysisk galleri og nettbasert kunstsalg.',
  quiz_profile: {
    place_type: 'kunstgalleri',
    subtype: 'fysisk_og_digitalt_galleri_for_begrensede_kunstopplag',
    signature_features: [
      'fysisk galleri og kreativ hub i Josefines gate 2A',
      'signerte og nummererte kunsttrykk i begrensede opplag',
      'soloutstillinger, eventer og private visninger',
      'kombinerer fysisk galleri med nettbasert kunstsalg'
    ],
    primary_angles: [
      'kunstformidling',
      'kunstmarked_og_pris',
      'tilgjengelighet_til_kunst',
      'fysisk_og_digitalt_galleri',
      'symbolsk_kapital_og_kvalitet'
    ],
    question_families: [
      'institusjonsprofil',
      'bruk',
      'kunstfelt_og_marked',
      'materialitet_og_opplag',
      'kontrast'
    ],
    avoid_angles: [
      'generisk_kunstbutikk',
      'presentere_2024_som_sikkert_apningsar_for_lokalet',
      'forveksle_galleriet_med_et_museum_med_permanent_samling',
      'generisk_Bislett'
    ],
    must_include: [
      'den konkrete adressen Josefines gate 2A',
      'kombinasjonen av fysisk galleri og nettgalleri',
      'begrensede signerte kunstopplag',
      'forholdet mellom tilgjengelighet, kvalitet og kunstmarked'
    ],
    contrast_targets: ['galleri_map', 'vi_vii_gallery', 'kunstnernes_hus'],
    notes: 'Spør om stedet som konkret galleri, kunstformidler og markedsaktør. Eksterne gallerikilder og dokumenterte utstillinger skal dominere synlig quizinnhold.'
  },
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:13536:2A',
  address: { street: 'Josefines gate', number: '2A', postcode: '0351', city: 'Oslo', country: 'NO' },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:13536:2A',
  coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Josefines%20gate%202A%20Oslo',
  coordVerifiedAt: '2026-07-20',
  coordNote,
  externalLinks: [
    { type: 'official', label: 'The Oslo Gallery – om oss', url: 'https://theoslogallery.com/pages/om-oss', lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'official', label: 'The Oslo Gallery – kontakt', url: 'https://theoslogallery.com/pages/contact', lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'VisitOSLO – The Oslo Gallery', url: 'https://www.visitoslo.com/no/produkt/?name=The-Oslo-Gallery&tlp=7680023', lang: 'nb', verifiedAt: '2026-07-20' }
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
    resolvedIdentity: 'The Oslo Gallery / The Oslo Studio, fysisk galleri i Josefines gate 2A',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: ['entydig offisielt adressepunkt', 'aktuell galleridentitet og besøksadresse', 'duplikatkontroll mot canonical kunststeder'],
  evidence: [{
    sourceProvider: 'official_address',
    sourceName: 'geonorge_adresser_v1',
    sourceUrl: place.coordSourceUrl,
    sourceObjectId: place.sourceObjectId,
    sourceQuality: 'official_address_plus_current_gallery_identity',
    finding: 'Geonorge gir ett entydig adressepunkt for Josefines gate 2A. Galleriets egen nettside og VisitOSLO bekrefter samme fysiske Bislett-adresse i 2026.',
    canVerifyCoordinate: true,
    reason: coordNote
  }],
  addressCandidates: [{ address: 'Josefines gate 2A Oslo', sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt, institusjonsidentitet og representasjonsanker er anvendt på canonical place.' },
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
lines.splice(lastRowIndex + 1, 0, `| ${batch} | \`${PLACE_ID}\` | The Oslo Gallery | verified | \`geonorge-adresser-v1:0301:13536:2A\` |`);
protocol = lines.join('\n');
const newSummary = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til The Oslo Gallery med den entydige offisielle Geonorge-adressekoordinaten for Josefines gate 2A, kryssjekket mot galleriets egen aktive nettside og VisitOSLO. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReviewCount}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);
protocol = protocol.replace(new RegExp(`ikke blant ${oldCount}\\b`, 'g'), `ikke blant ${newCount}`);
fs.writeFileSync(PROTOCOL_PATH, protocol);

writeJson(`${REPORT_DIR}/production-decision.json`, {
  candidateId: PLACE_ID,
  decision: 'produced_as_canonical_place',
  taxonomy: { primaryCategory: 'kunst', emneIds: place.emne_ids },
  coordinate: { status: 'verified', sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon, coordType: place.coordType },
  yearInterpretation: '2024 is used as the start of the current operating company The Oslo Studio AS, not as an independently verified exact public opening date for the gallery room.',
  coordinateBatch: batch,
  osloVerifiedOrControlledBefore: oldCount,
  osloVerifiedOrControlledAfter: newCount
});

const readmePath = `${REPORT_DIR}/README.md`;
let readme = fs.readFileSync(readmePath, 'utf8').replace(/\n## Production[\s\S]*$/m, '').trimEnd();
readme += `\n\n## Production\n\n- Canonical place: \`${PLACE_ID}\`\n- Category: \`kunst\`\n- Coordinate source: \`geonorge-adresser-v1:0301:13536:2A\`\n- Coordinate status: \`verified\`\n- Coordinate batch: ${batch}\n- Oslo verified/source-controlled total after production: ${newCount}\n- Year field: 2024, used as the start of the current operating company rather than an asserted exact gallery-room opening date.\n`;
fs.writeFileSync(readmePath, readme);

if (fs.existsSync(SELF_PATH)) fs.unlinkSync(SELF_PATH);
console.log(JSON.stringify({ placeId: PLACE_ID, oldCount, newCount, maxBatch, batch, needsReviewCount }, null, 2));
