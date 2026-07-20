import fs from 'node:fs';
import path from 'node:path';

const PLACE_ID = 'oslo_prosjektrom';
const PLACE_PATH = 'data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json';
const PLACE_MANIFEST_ENTRY = 'places/kunst/oslo/places_kunst/oslo_prosjektrom.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/kunst/oslo_prosjektrom.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/kunst/oslo_prosjektrom.json';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/oslo-prosjektrom';
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

const coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Platous gate 18, OSLO, source object geonorge-adresser-v1:0301:15684:18. Punktet brukes som display- og unlock-anker for Oslo Prosjektrom. Platous gate 10 ble kontrollert separat og finnes ikke som offisiell Geonorge-adresse; den forekommer i ett enkelt utstillingsinnlegg fra september 2025, mens galleriets egne innlegg før og etter og Oslo Art Guide konsekvent bruker Platous gate 18. Platous gate 10 behandles derfor som en isolert skrivefeil, ikke som alternativ aktiv inngang.';

const place = {
  id: PLACE_ID,
  name: 'Oslo Prosjektrom',
  lat: 59.91112080426534,
  lon: 10.76528983153175,
  r: 60,
  category: 'kunst',
  year: 2006,
  emne_ids: [
    'em_kunst_institusjonskritikk_og_representasjon',
    'em_kunst_kvalitet_kritikk_og_symbolsk_kapital',
    'em_kunst_okonomi_og_finansiering'
  ],
  desc: 'Kunstnerstyrt, non-profit galleri og atelierfellesskap med publikumsinngang i Platous gate 18. Oslo Prosjektrom hadde sin første galleriutstilling i 2006, viser rundt tolv utstillinger i året og er knyttet til et stort atelierfellesskap for kunstnere og andre kreative fag.',
  popupDesc: 'Oslo Prosjektrom er et kunstnerstyrt, non-profit galleri og atelierfellesskap i Platous gate 18. Galleriet oppgir at den første utstillingen fant sted i 2006, og viser i dag et skiftende program med rundt tolv utstillinger årlig. Både kunstnere fra atelierfellesskapet og eksterne kunstnere kan søke om utstillingsplass, og prosjektrommet fungerer derfor som en konkret inngang til den kunstnerstyrte delen av Oslos kunstliv.\n\nStedet er tett knyttet til et omfattende atelierfellesskap. Oslo Art Guide oppgir rundt 150 kunstnere fra ulike fagområder i fellesskapet. Det gjør Oslo Prosjektrom interessant som mer enn et enkelt gallerirom: det er også en produksjons- og arbeidsinfrastruktur der atelierer, nettverk, utstillinger og formidling virker sammen.\n\nAdresseauditen avdekket én isolert oppføring med Platous gate 10 i et utstillingsinnlegg fra september 2025. Geonorge finner ingen slik offisiell adresse, og Oslo Prosjektroms egne innlegg før og etter – inkludert i 2026 – bruker Platous gate 18. History Go bruker derfor Platous gate 18 som aktiv markør og behandler 10-oppføringen som en skrivefeil, ikke et eget historisk eller aktivt sted.',
  quiz_profile: {
    place_type: 'kunstnerstyrt_galleri_og_atelierfellesskap',
    subtype: 'non_profit_prosjektrom_med_stort_ateliermiljo',
    signature_features: [
      'første galleriutstilling i 2006',
      'kunstnerstyrt non-profit visningssted',
      'rundt tolv skiftende utstillinger i året',
      'knyttet til et atelierfellesskap med rundt 150 kunstnere',
      'publikumsinngang i Platous gate 18'
    ],
    primary_angles: [
      'kunstnerstyrte_visningssteder',
      'atelierfellesskap_og_produksjon',
      'non_profit_kunstformidling',
      'utstillingsprogram',
      'institusjon_og_kunstfelt'
    ],
    question_families: [
      'institusjonshistorie',
      'utstillingshistorie',
      'kunstfelt_og_organisering',
      'ateliermiljo_og_nettverk',
      'kontrast'
    ],
    avoid_angles: [
      'generisk_samtidskunstgalleri',
      'bruke_Platous_gate_10_som_aktiv_adresse',
      'presentere_atelierfellesskapet_som_ett_enkelt_kunstnerkollektiv',
      'generisk_Grønland_eller_Gamle_Oslo'
    ],
    must_include: [
      'første utstilling i 2006',
      'den kunstnerstyrte og non-profit modellen',
      'forholdet mellom galleri og atelierfellesskap',
      'Platous gate 18 som dokumentert inngang'
    ],
    contrast_targets: ['galleri_map', 'vi_vii_gallery', 'kunstnernes_hus'],
    notes: 'Spør om Oslo Prosjektrom som konkret kunstnerstyrt visnings- og produksjonsmiljø. Eksterne utstillingskilder og institusjonens egne opplysninger skal dominere synlig quizinnhold.'
  },
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:15684:18',
  address: { street: 'Platous gate', number: '18', postcode: '0190', city: 'Oslo', country: 'NO' },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:15684:18',
  coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Platous%20gate%2018%20Oslo',
  coordVerifiedAt: '2026-07-20',
  coordNote,
  externalLinks: [
    { type: 'official', label: 'Oslo Prosjektrom', url: 'https://osloprosjektrom.blogspot.com/', lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo Art Guide – Oslo Prosjektrom', url: 'https://www.osloartguide.no/steder/oslo-prosjektrom', lang: 'nb', verifiedAt: '2026-07-20' }
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
    resolvedIdentity: 'Oslo Prosjektrom, kunstnerstyrt galleri og atelierfellesskap med inngang i Platous gate 18',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: ['entydig offisielt adressepunkt', 'aktuell publikumsinngang', 'avklaring av Platous gate 10-avviket'],
  evidence: [{
    sourceProvider: 'official_address',
    sourceName: 'geonorge_adresser_v1',
    sourceUrl: place.coordSourceUrl,
    sourceObjectId: place.sourceObjectId,
    sourceQuality: 'official_address_plus_repeated_current_gallery_identity',
    finding: 'Geonorge gir ett entydig adressepunkt for Platous gate 18 og ingen treff for Platous gate 10. Oslo Prosjektroms egne innlegg før og etter den isolerte 10-oppføringen, inkludert januar–mars 2026, bruker Platous gate 18. Oslo Art Guide oppgir også inngang Platous gate 18.',
    canVerifyCoordinate: true,
    reason: coordNote
  }],
  addressCandidates: [
    { address: 'Platous gate 18 Oslo', sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon, canApplyToPlace: true },
    { address: 'Platous gate 10 Oslo', sourceProvider: 'official_address', sourceObjectId: null, lat: null, lon: null, canApplyToPlace: false, reason: 'Geonorge not_found; isolated erroneous gallery post.' }
  ],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt, adressetvist og representasjonsanker er anvendt på canonical place.' },
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
lines.splice(lastRowIndex + 1, 0, `| ${batch} | \`${PLACE_ID}\` | Oslo Prosjektrom | verified | \`geonorge-adresser-v1:0301:15684:18\` |`);
protocol = lines.join('\n');
const newSummary = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til Oslo Prosjektrom med den entydige Geonorge-adressekoordinaten for Platous gate 18 etter en eksplisitt to-adresse-audit som avviste den isolerte Platous gate 10-oppføringen som feil. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReviewCount}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);
protocol = protocol.replace(new RegExp(`ikke blant ${oldCount}\\b`, 'g'), `ikke blant ${newCount}`);
fs.writeFileSync(PROTOCOL_PATH, protocol);

writeJson(`${REPORT_DIR}/production-decision.json`, {
  candidateId: PLACE_ID,
  decision: 'produced_as_canonical_place_at_platous_gate_18',
  taxonomy: { primaryCategory: 'kunst', emneIds: place.emne_ids },
  coordinate: { status: 'verified', sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon, coordType: place.coordType },
  rejectedAddress: { address: 'Platous gate 10 Oslo', status: 'geonorge_not_found_and_isolated_typo' },
  coordinateBatch: batch,
  osloVerifiedOrControlledBefore: oldCount,
  osloVerifiedOrControlledAfter: newCount
});

const readmePath = `${REPORT_DIR}/README.md`;
let readme = fs.readFileSync(readmePath, 'utf8').replace(/\n## Production[\s\S]*$/m, '').trimEnd();
readme += `\n\n## Production\n\n- Canonical place: \`${PLACE_ID}\`\n- Category: \`kunst\`\n- Active address: Platous gate 18\n- Rejected address claim: Platous gate 10\n- Coordinate source: \`geonorge-adresser-v1:0301:15684:18\`\n- Coordinate status: \`verified\`\n- Coordinate batch: ${batch}\n- Oslo verified/source-controlled total after production: ${newCount}\n`;
fs.writeFileSync(readmePath, readme);

if (fs.existsSync(SELF_PATH)) fs.unlinkSync(SELF_PATH);
console.log(JSON.stringify({ placeId: PLACE_ID, oldCount, newCount, maxBatch, batch, needsReviewCount }, null, 2));
