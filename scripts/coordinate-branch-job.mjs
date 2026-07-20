import fs from 'node:fs';
import path from 'node:path';

const PLACE_ID = 'galleri_map';
const PLACE_PATH = 'data/places/kunst/oslo/places_kunst/galleri_map.json';
const PLACE_MANIFEST_ENTRY = 'places/kunst/oslo/places_kunst/galleri_map.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/kunst/galleri_map.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/kunst/galleri_map.json';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/galleri-map';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const PLACE_MANIFEST_PATH = 'data/places/manifest.json';
const EVIDENCE_MANIFEST_PATH = 'data/coordinate-evidence/manifest.json';
const SELF_PATH = 'scripts/coordinate-branch-job.mjs';

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function assert(condition, message) { if (!condition) throw new Error(message); }

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

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Tøyengata 32, OSLO, source object geonorge-adresser-v1:0301:17875:32. Punktet brukes som display- og unlock-anker for Galleri MAPs faste galleriadresse. Galleriidentiteten og dagens besøksadresse er kryssjekket mot galleriets egen nettside; en uavhengig lokalhistorisk koordinat ligger praktisk talt på samme punkt.';

const place = {
  id: PLACE_ID,
  name: 'Galleri MAP',
  lat: 59.914355410309014,
  lon: 10.767876268395765,
  r: 60,
  category: 'kunst',
  year: 2007,
  emne_ids: [
    'em_kunst_institusjonskritikk_og_representasjon',
    'em_kunst_kvalitet_kritikk_og_symbolsk_kapital',
    'em_kunst_okonomi_og_finansiering'
  ],
  desc: 'Lite, uavhengig kunstgalleri i Tøyengata 32, drevet av Mari-Ann Pettersen siden 2007. Galleriet viser skiftende utstillinger innen blant annet billedkunst og fotografi, og har en tydelig profil i skjæringspunktet mellom samtidskunst, musikkmiljøer og alternativ kultur.',
  popupDesc: 'Galleri MAP holder til i Tøyengata 32 og drives av kunstner og gallerist Mari-Ann Pettersen, som på galleriets egen side oppgir å ha drevet Galleri MAP siden 2007. Det er et lite, uavhengig visningssted med skiftende utstillinger, salg og kunstformidling snarere enn en stor offentlig kunstinstitusjon med permanent samling.\n\nUtstillingshistorikken viser en særlig sterk forbindelse mellom visuell kunst og musikkmiljøer. Galleri MAP har blant annet presentert fotografi og kunst knyttet til punk, rock og norske musikkmiljøer, samtidig som programmet også rommer andre kunstnere og uttrykk. Denne profilen gjør stedet interessant som eksempel på hvordan små private gallerier kan fungere som møtepunkt mellom kunstfeltet, subkulturelle miljøer, nettverk og et kommersielt kunstmarked.\n\nI History Go skal Galleri MAP behandles som et konkret galleri på Tøyen, ikke som en generell markør for bydelen eller for norsk musikkhistorie. Quiz og formidling skal ta utgangspunkt i dokumenterte utstillinger, galleridrift, forholdet mellom små visningssteder og kunstfeltets institusjoner og det konkrete stedet i Tøyengata 32.',
  quiz_profile: {
    place_type: 'kunstgalleri',
    subtype: 'lite_uavhengig_galleri_med_kunst_og_musikkprofil',
    signature_features: [
      'fast galleriadresse i Tøyengata 32',
      'drevet av Mari-Ann Pettersen siden 2007',
      'skiftende utstillinger framfor permanent samling',
      'tydelig forbindelse mellom visuell kunst, fotografi og musikkmiljøer'
    ],
    primary_angles: [
      'galleripraksis',
      'kunst_og_musikk',
      'uavhengig_kunstformidling',
      'skiftende_utstillinger',
      'kunstmarked_og_symbolsk_kapital'
    ],
    question_families: [
      'institusjonshistorie',
      'utstillingshistorie',
      'kunstfelt_og_marked',
      'nettverk_og_miljo',
      'kontrast'
    ],
    avoid_angles: [
      'generisk_salgsgalleri',
      'generisk_toyen_kultur',
      'presentere_2007_som_formell_stiftelsesdato_uten_kilde',
      'gjore_musikkprofilen_til_hele_galleriets_identitet'
    ],
    must_include: [
      'den konkrete adressen Tøyengata 32',
      'at galleriet oppgir å være drevet av Mari-Ann Pettersen siden 2007',
      'skiftende utstillinger',
      'forbindelsen mellom små gallerier, kunstfelt og musikkmiljøer'
    ],
    contrast_targets: [
      'kunstnernes_hus',
      'tbs_gallery',
      'astrup_fearnley'
    ],
    notes: 'Spør stedet som et lite uavhengig galleri med skiftende program og dokumentert kunst-/musikkprofil. Eksterne utstillingskilder skal dominere synlig quizinnhold.'
  },
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:17875:32',
  address: {
    street: 'Tøyengata',
    number: '32',
    postcode: '0578',
    city: 'Oslo',
    country: 'NO'
  },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:17875:32',
  coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=T%C3%B8yengata%2032%20Oslo',
  coordVerifiedAt: '2026-07-20',
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'Galleri MAP – kontakt og info',
      url: 'https://www.galleri-map.no/kontakt-ebrev-og-info.html',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'official',
      label: 'Galleri MAP – utstillinger og galleri',
      url: 'https://www.galleri-map.no/',
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
    resolvedIdentity: 'Galleri MAP, fast kunstgalleri i Tøyengata 32',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt',
    'aktuell galleridentitet og besøksadresse',
    'duplikatkontroll mot canonical kunststeder'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: 'official_address_plus_current_gallery_identity',
      finding: 'Geonorge gir ett entydig adressepunkt for Tøyengata 32. Galleri MAPs egen nettside oppgir samme faste galleriadresse, og repo-auditen fant ingen eksisterende canonical place med samme institusjonsidentitet.',
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    {
      address: 'Tøyengata 32 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: place.sourceObjectId,
      lat: place.lat,
      lon: place.lon,
      canApplyToPlace: true
    }
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: place.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    {
      lat: place.lat,
      lon: place.lon,
      coordRole: place.coordRole,
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Kildekontrakt, identitet og representasjonsanker er anvendt på canonical place.'
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
const needsReviewIndex = lines.findIndex((line, index) => index > headerIndex && line.trim() === '### Dokumenterte Oslo-kontroller uten godkjent koordinat');
assert(headerIndex >= 0 && needsReviewIndex > headerIndex, 'Could not bound Oslo protocol table');
const rowRegex = /^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/;
const rows = [];
for (let i = headerIndex + 2; i < needsReviewIndex; i += 1) {
  const match = lines[i].match(rowRegex);
  if (match) rows.push({ index: i, batch: Number(match[1]), placeId: match[2] });
}
assert(rows.length > 0, 'Could not locate Oslo coordinate batch rows');
const maxBatch = Math.max(...rows.map((row) => row.batch));
const batch = maxBatch + 1;
const newCount = oldCount + 1;
const lastRowIndex = Math.max(...rows.map((row) => row.index));
lines.splice(lastRowIndex + 1, 0, `| ${batch} | \`${PLACE_ID}\` | Galleri MAP | verified | \`geonorge-adresser-v1:0301:17875:32\` |`);
protocol = lines.join('\n');
const newSummary = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til Galleri MAP med den entydige offisielle Geonorge-adressekoordinaten for Tøyengata 32, kryssjekket mot galleriets egen aktuelle besøksadresse. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReviewCount}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);
protocol = protocol.replace(new RegExp(`ikke blant ${oldCount}\\b`, 'g'), `ikke blant ${newCount}`);
fs.writeFileSync(PROTOCOL_PATH, protocol);

writeJson(`${REPORT_DIR}/production-decision.json`, {
  candidateId: PLACE_ID,
  decision: 'produced_as_canonical_place',
  taxonomy: {
    primaryCategory: 'kunst',
    emneIds: place.emne_ids
  },
  coordinate: {
    status: 'verified',
    sourceObjectId: place.sourceObjectId,
    lat: place.lat,
    lon: place.lon,
    coordType: place.coordType
  },
  yearInterpretation: '2007 is used as the start of the documented current gallery operation because Galleri MAP states that Mari-Ann Pettersen has run the gallery since 2007; it is not asserted as a separately verified legal incorporation date.',
  coordinateBatch: batch,
  osloVerifiedOrControlledBefore: oldCount,
  osloVerifiedOrControlledAfter: newCount
});

const readmePath = `${REPORT_DIR}/README.md`;
let readme = fs.readFileSync(readmePath, 'utf8').replace(/\n## Production[\s\S]*$/m, '').trimEnd();
readme += `\n\n## Production\n\n- Canonical place: \`${PLACE_ID}\`\n- Category: \`kunst\`\n- Coordinate source: \`geonorge-adresser-v1:0301:17875:32\`\n- Coordinate status: \`verified\`\n- Coordinate batch: ${batch}\n- Oslo verified/source-controlled total after production: ${newCount}\n- Year field: 2007, used as the documented start of the current gallery operation rather than an asserted legal founding date.\n`;
fs.writeFileSync(readmePath, readme);

if (fs.existsSync(SELF_PATH)) fs.unlinkSync(SELF_PATH);
console.log(JSON.stringify({ placeId: PLACE_ID, oldCount, newCount, maxBatch, batch, needsReviewCount }, null, 2));
