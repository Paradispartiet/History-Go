import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const INTAKE_DIR = 'reports/oslo-attractions-completeness-20260720/brannmuseet-oslo';
const PLACE_FILE = 'data/places/historie/oslo/places_historie/brannmuseet_oslo.json';
const PLACE_MANIFEST_ENTRY = 'places/historie/oslo/places_historie/brannmuseet_oslo.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/historie/brannmuseet_oslo.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/historie/brannmuseet_oslo.json';

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) { fs.mkdirSync(path.dirname(abs(rel)), { recursive: true }); fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n'); }
function rowsFrom(data) { if (Array.isArray(data)) return data; if (Array.isArray(data?.places)) return data.places; if (Array.isArray(data?.items)) return data.items; if (typeof data?.id === 'string') return [data]; return []; }
function replaceOnce(text, before, after, label) { const i = text.indexOf(before); if (i < 0) throw new Error(`${label}: expected text not found`); if (text.indexOf(before, i + before.length) >= 0) throw new Error(`${label}: expected exactly one match`); return text.slice(0, i) + after + text.slice(i + before.length); }
function assertNoActivePlaceId(placeId) { const hits = []; for (const entry of readJson(PLACE_MANIFEST).files || []) { const rel = `data/${entry}`; if (!fs.existsSync(abs(rel))) continue; for (const row of rowsFrom(readJson(rel))) if (row?.id === placeId) hits.push(rel); } if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`); }

assertNoActivePlaceId('brannmuseet_oslo');
if (fs.existsSync(abs(PLACE_FILE))) throw new Error('brannmuseet_oslo: place file already exists');
if (fs.existsSync(abs(EVIDENCE_FILE))) throw new Error('brannmuseet_oslo: evidence file already exists');

const intake = readJson(`${INTAKE_DIR}/result.json`);
if (!intake.ok || intake.status !== 'verified_candidate') throw new Error('Brannmuseet intake is not verified_candidate');
if (intake.sourceObjectId !== 'geonorge-adresser-v1:0301:12450:32') throw new Error('Unexpected Brannmuseet Geonorge object');

const c = intake.coordinate;
const place = {
  id: 'brannmuseet_oslo',
  name: 'Brannmuseet i Oslo',
  lat: c.lat,
  lon: c.lon,
  r: c.r,
  category: 'historie',
  year: 1861,
  desc: 'Historisk brannstasjon i Grønlandsleiret fra 1861, i ordinær brannstasjonsbruk fram til 1978 og i dag hjem for Brannmuseet i Oslo med kjøretøy, utstyr og fortellinger fra Oslos brannhistorie.',
  popupDesc: 'Brannmuseet i Oslo holder til i den tidligere Grønland brannstasjon i Grønlandsleiret 32. Stasjonen dateres til 1861 og var i ordinær bruk fram til 1978. I dag brukes bygningen til å bevare og formidle Oslos brannhistorie gjennom historiske brannbiler, utstyr og erfaringene til generasjoner av brannfolk. Museet drives i stor grad av frivillige med bakgrunn fra brannvesenet og har også brannvernformidling for barn.\n\nI History Go behandles den gamle brannstasjonen og dagens museum som ett fysisk historisk sted. Den brede gaten `gronlandsleiret` er et annet canonical bysted og skal ikke brukes som proxy for museumsbygningen. Spørsmål skal starte i den dokumenterte brannstasjons-, beredskaps- og museumshistorien, ikke i generiske forestillinger om brannvesen.',
  emne_ids: [
    'em_his_spor_materialitet',
    'em_his_historiske_lag_i_byrom',
    'em_his_kulturminner_bevaring',
    'em_his_samtid_ettertid_fortelling'
  ],
  quiz_profile: {
    place_type: 'museum_i_historisk_brannstasjon',
    subtype: 'beredskaps_og_brannhistorisk_museum',
    signature_features: [
      'tidligere Grønland brannstasjon fra 1861',
      'ordinær brannstasjonsbruk fram til 1978',
      'museum for Oslos brannhistorie med historiske kjøretøy og utstyr'
    ],
    primary_angles: ['brannhistorie', 'beredskap', 'teknologi_og_utstyr', 'byhistorie', 'museum_og_bevaring'],
    question_families: ['historisk_endring', 'institusjonshistorie', 'beredskap', 'materielle_spor', 'museum_og_minne'],
    avoid_angles: ['generisk_museum', 'generisk_brannvern', 'behandle_gronlandsleiret_som_samme_fysiske_sted'],
    must_include: ['bygningen som tidligere Grønland brannstasjon', '1861 og brannstasjonsbruken fram til 1978', 'dagens rolle som museum for Oslos brannhistorie'],
    contrast_targets: ['gronlandsleiret', 'gronland_politistasjon', 'arbeidermuseet'],
    notes: 'Spør som et konkret historisk beredskapsbygg med bevart materiell og museumsliv. Eksterne brannhistoriske og institusjonelle kilder skal drive synlig spørsmålsinnhold.'
  },
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: intake.sourceObjectId,
  address: c.address,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: 'verified',
  coordSource: c.coordSource,
  coordSourceId: intake.sourceObjectId,
  coordSourceUrl: intake.sourceUrl,
  coordType: c.coordType,
  coordVerifiedAt: VERIFIED_AT,
  coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Grønlandsleiret 32, OSLO. Punktet brukes som display- og unlock-marker for den tidligere Grønland brannstasjon og dagens Brannmuseet i Oslo. Det representerer ikke hele gaten Grønlandsleiret.',
  externalLinks: [
    { type: 'official', label: 'Brannmuseet i Oslo', url: 'https://brannmuseet.no/', lang: 'nb', verifiedAt: VERIFIED_AT },
    { type: 'official', label: 'Brannmuseet – kontakt og adresse', url: 'https://brannmuseet.no/kontakt-2/', lang: 'nb', verifiedAt: VERIFIED_AT },
    { type: 'reference', label: 'VisitOSLO – Oslo Fire Museum', url: 'https://www.visitoslo.com/en/activities-and-attractions/boroughs/oslo-east/attractions/?name=Brannmuseet-i-Oslo&tlp=2980863', lang: 'en', verifiedAt: VERIFIED_AT }
  ]
};
writeJson(PLACE_FILE, place);

writeJson(EVIDENCE_FILE, {
  placeId: place.id,
  placeFile: PLACE_FILE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'verified_current_building_address',
  currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Former Grønland fire station at Grønlandsleiret 32, now Brannmuseet i Oslo',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for Grønlandsleiret 32',
    'dokumentert identitet som tidligere Grønland brannstasjon og dagens Brannmuseet',
    'eksplisitt skille fra den brede canonical gaten Grønlandsleiret'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: intake.sourceUrl,
      sourceObjectId: intake.sourceObjectId,
      sourceQuality: 'official_address_plus_official_museum_identity',
      finding: 'Geonorge gir ett tydelig adressetreff for Grønlandsleiret 32. Brannmuseet oppgir samme besøksadresse og dokumenterer at museet holder til i den gamle Grønland brannstasjon.',
      canVerifyCoordinate: true,
      reason: place.coordNote
    }
  ],
  addressCandidates: [{ address: 'Grønlandsleiret 32 Oslo', sourceProvider: 'official_address', sourceObjectId: intake.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: intake.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Applied Grønlandsleiret 32 as the canonical building/display marker for the former fire station and current museum.' },
  notes: [place.coordNote]
});

const placeManifest = readJson(PLACE_MANIFEST);
if (placeManifest.files.includes(PLACE_MANIFEST_ENTRY)) throw new Error('Brannmuseet place manifest entry already exists');
placeManifest.files.push(PLACE_MANIFEST_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY)) throw new Error('Brannmuseet evidence manifest entry already exists');
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

const decisionPath = `${INTAKE_DIR}/decision.json`;
const decision = readJson(decisionPath);
decision.productionGate = 'canonical_produced';
decision.canonicalCategory = 'historie';
decision.canonicalPlaceFile = PLACE_FILE;
writeJson(decisionPath, decision);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
protocol = replaceOnce(
  protocol,
  'Oslo-tabellen inneholder nå 201 verifiserte eller kildekontrollerte canonical steder. Batch 55 legger til Holmlia bad som et eget kommunalt svømme- og idrettsanlegg på det verifiserte Holmlia Senter vei 34-punktet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 32.',
  'Oslo-tabellen inneholder nå 202 verifiserte eller kildekontrollerte canonical steder. Batch 56 legger til Brannmuseet i Oslo i den tidligere Grønland brannstasjon på det verifiserte Grønlandsleiret 32-punktet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 32.',
  'Oslo protocol summary'
);
const row54 = '| 54 | `dronning_sonja_kunststall` | Dronning Sonja KunstStall | verified | `geonorge-adresser-v1:0301:15614:50` |';
const row55 = '| 55 | `holmlia_bad` | Holmlia bad | verified | `geonorge-adresser-v1:0301:13084:34` |';
const row56 = '| 56 | `brannmuseet_oslo` | Brannmuseet i Oslo | verified | `geonorge-adresser-v1:0301:12450:32` |';
const row55Count = protocol.split(row55).length - 1;
if (row55Count !== 1) throw new Error(`Expected exactly one batch 55 row, found ${row55Count}`);
protocol = protocol.replace(`\n${row55}`, '');
protocol = replaceOnce(protocol, row54, `${row54}\n${row55}\n${row56}`, 'Protocol rows 54-56');
const batch55 = 'Batch 55 (2026-07-20) legger til `holmlia_bad` som et eget kommunalt svømme- og idrettsanlegg. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:13084:34` for Holmlia Senter vei 34 brukes som dagens bygnings-, display- og unlock-anker. Holmlia bad stod klart i 1983 som del av et fjellanlegg der idrettshall, svømmehall og tilfluktsrom ble kombinert. Den bredere underjordiske infrastrukturen er fysisk og historisk kontekst, ikke en ekstra overlappende markør. Midlertidige sommerstenginger gjelder drift og endrer ikke canonical stedsstatus.';
protocol = replaceOnce(
  protocol,
  batch55,
  `${batch55}\n\nBatch 56 (2026-07-20) legger til \`brannmuseet_oslo\` som ett samlet historisk bygg- og museumssted. Det entydige Geonorge-adressepunktet \`geonorge-adresser-v1:0301:12450:32\` for Grønlandsleiret 32 brukes som bygnings-, display- og unlock-anker. Bygningen er den tidligere Grønland brannstasjon fra 1861 og var i ordinær brannstasjonsbruk fram til 1978; dagens Brannmuseet bevarer denne historien i samme fysiske bygg. Den brede canonical gaten \`gronlandsleiret\` beholdes separat og brukes ikke som proxy for museet.`,
  'Batch 56 narrative'
);
protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 201 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 202 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Oslo unresolved count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log('Created Brannmuseet i Oslo as coordinate batch 56 and repaired protocol row ordering.');
