import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const PLACE_ID = 'holmlia_bad';
const ADDRESS_QUERY = 'Holmlia senter vei 34 Oslo';
const PLACE_FILE = 'data/places/sport/europa/norway/oslo_sport/holmlia_bad.json';
const PLACE_MANIFEST_ENTRY = 'places/sport/europa/norway/oslo_sport/holmlia_bad.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/sport/holmlia_bad.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/sport/holmlia_bad.json';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/holmlia-bad';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function assertNoActivePlaceId(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    for (const row of rowsFrom(readJson(rel))) if (row?.id === placeId) hits.push(rel);
  }
  if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`);
}
function parseFinderJson(output) {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Address finder returned no JSON object');
  return JSON.parse(output.slice(start, end + 1));
}

assertNoActivePlaceId(PLACE_ID);
if (fs.existsSync(abs(PLACE_FILE))) throw new Error(`${PLACE_FILE}: already exists`);
if (fs.existsSync(abs(EVIDENCE_FILE))) throw new Error(`${EVIDENCE_FILE}: already exists`);

const finderOutput = execFileSync(
  'npm',
  ['run', 'places:coords:find:address', '--', '--address', ADDRESS_QUERY],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
);
process.stdout.write(finderOutput);
const result = parseFinderJson(finderOutput);
if (!result.ok || result.status !== 'verified_candidate' || !result.coordinate) {
  throw new Error(`Holmlia bad coordinate intake did not return verified_candidate: ${result.status ?? 'unknown'}`);
}
const c = result.coordinate;

const place = {
  id: PLACE_ID,
  name: 'Holmlia bad',
  lat: c.lat,
  lon: c.lon,
  r: c.r,
  category: 'sport',
  sport_type: 'swimming',
  place_type: 'public_swimming_pool',
  year: 1983,
  desc: 'Kommunal svømmehall på Holmlia, åpnet i 1983 som del av et fjellanlegg der idrettsfunksjoner ble kombinert med tilfluktsrom. Badet har et 25-metersbasseng og fungerer som lokalt anlegg for svømming, opplæring og hverdagsaktivitet i Oslo sør.',
  popupDesc: 'Holmlia bad stod klart i 1983, i en periode da utbyggingen av den nye drabantbyen Holmlia også omfattet store offentlige idrettsanlegg. Svømmehallen ble sprengt inn i fjellet som del av et anlegg der idrettshall, svømmehall og tilfluktsrom kunne kombineres. Denne kalde krig-konstruksjonen gir stedet en uvanlig fysisk identitet sammenlignet med Oslos mer tradisjonelle folkebad.\n\nI dag drives Holmlia bad av Oslo kommune og har et 25-meters hovedbasseng, plaskebasseng, badstue og tilrettelegging for personer med funksjonsnedsettelser. I History Go behandles stedet som et lokalt offentlig idretts- og svømmeanlegg, med både svømmeopplæring, organisert aktivitet og egenbruk. Midlertidige sommerstenginger er driftsinformasjon og skal ikke tolkes som at stedet er permanent nedlagt.',
  emne_ids: [
    'em_sport_arena_samling',
    'em_sport_idrettsarena_sted',
    'em_sport_breddeidrett'
  ],
  quiz_profile: {
    place_type: 'svommehall_i_fjellanlegg',
    subtype: 'kommunalt_lokalbad_med_tilfluktsromshistorie',
    signature_features: [
      'svømmehall ferdigstilt i 1983',
      'sprengt inn i fjellet som del av kombinert idretts- og tilfluktsromanlegg',
      '25-metersbasseng som lokalt offentlig bad for Oslo sør'
    ],
    primary_angles: [
      'svomming',
      'breddeidrett',
      'svommeopplaring',
      'offentlig_idrettsinfrastruktur',
      'kald_krig_og_bygging'
    ],
    question_families: [
      'historisk_endring',
      'idrettsanlegg',
      'bruk',
      'teknisk_fysisk',
      'kontrast'
    ],
    avoid_angles: [
      'generisk_svommehall',
      'behandle_sommerstenging_som_permanent_nedleggelse',
      'anta_at_fjellanlegget_bare_er_et_tilfluktsrom'
    ],
    must_include: [
      '1983 som ferdigstillelsesår',
      'kombinasjonen av svømmehall og tilfluktsrom i fjellet',
      'rollen som lokalt offentlig svømme- og opplæringsanlegg'
    ],
    contrast_targets: [
      'toyenbadet',
      'manglerudhallen',
      'frognerbadet'
    ],
    notes: 'Spørsmål skal bygge på dokumentert anleggshistorie og konkrete fasiliteter. Skill mellom varig stedsidentitet og sesongbaserte åpningstider.'
  },
  sport_profile: {
    place_type: 'public_swimming_pool',
    sports: ['swimming'],
    clubs_or_teams: [],
    groundhopper_type: 'public_swimming_pool',
    stats_focus: ['apningsar', 'bassenglengde', 'svommeopplaring', 'tilgjengelighet', 'fjellanlegg'],
    collection_hooks: ['svommehall_besokt', 'offentlig_idrettsanlegg_besokt'],
    venue_kind: 'public_swimming_pool',
    groundhopper_relevant: false
  },
  rounds_exclude: ['nature', 'training'],
  locatorType: c.locatorType,
  sourceProvider: c.sourceProvider,
  sourceObjectId: c.sourceObjectId,
  address: c.address,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: c.coordStatus,
  coordSource: c.coordSource,
  coordSourceId: c.sourceObjectId,
  coordSourceUrl: result.sourceUrl,
  coordType: c.coordType,
  coordVerifiedAt: '2026-07-20',
  coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for Holmlia senter vei 34, OSLO. Punktet representerer dagens offentlige svømmehall og brukes som display- og unlock-marker. Anleggets fjell- og tilfluktsromshistorie er et historisk og fysisk lag ved samme sted, ikke en separat markør.`,
  externalLinks: [
    {
      type: 'official',
      label: 'Oslo kommune – Holmlia bad',
      url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/svommehaller-i-oslo/holmlia-bad/',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'reference',
      label: 'Dagsavisen – Holmlia bad og fjellanleggets historie',
      url: 'https://www.dagsavisen.no/oslo/nyheter/2020/01/07/apnet-holmlia-bad-etter-sju-maneders-rehabilitering/',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'reference',
      label: 'VisitOSLO – bad og svømmehaller i Oslo',
      url: 'https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/aktiviteter/bad/',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    }
  ]
};
writeJson(PLACE_FILE, place);

const evidence = {
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: c.lat,
    lon: c.lon,
    r: c.r,
    coordStatus: c.coordStatus,
    coordSource: c.coordSource,
    coordType: c.coordType,
    coordNote: place.coordNote
  },
  identity: {
    currentName: 'Holmlia bad',
    resolvedIdentity: 'The municipal public swimming pool at Holmlia senter vei 34, physically integrated into the Holmlia rock/civil-defence complex but represented as the public bath rather than the whole underground facility',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for dagens svømmehall',
    'kommunal dokumentasjon av besøksadressen og aktiv badfunksjon',
    'historisk kilde som dokumenterer ferdigstillelse i 1983 og fjellanleggets kombinerte funksjon'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: result.sourceUrl,
      sourceObjectId: result.sourceObjectId,
      sourceQuality: 'official_address_plus_municipal_visitor_identity',
      finding: 'Geonorge gir et eksakt adressetreff for Holmlia senter vei 34. Oslo kommune oppgir samme adresse for Holmlia bad og dokumenterer dagens 25-metersbasseng og offentlige badfunksjon. Lokal historikk dokumenterer at svømmehallen stod klar i 1983 som del av et fjellanlegg med idretts- og tilfluktsromsfunksjon.',
      canVerifyCoordinate: true,
      reason: place.coordNote
    }
  ],
  addressCandidates: [
    {
      address: ADDRESS_QUERY,
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
      lat: c.lat,
      lon: c.lon,
      coordRole: c.coordRole,
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Use the exact Holmlia senter vei 34 address point as the canonical display marker for Holmlia bad; keep the wider rock/civil-defence complex as contextual history rather than a second overlapping place.'
  },
  notes: [place.coordNote]
};
writeJson(EVIDENCE_FILE, evidence);

const decision = {
  version: '2026-07-20',
  placeId: PLACE_ID,
  duplicateGate: 'no active canonical Holmlia bad place or address match found before production',
  category: 'sport',
  representationDecision: 'One canonical public-swimming-pool marker at Holmlia senter vei 34. The underground civil-defence complex is a physical/historical layer of the same facility, not a second marker.',
  addressQuery: ADDRESS_QUERY,
  finderStatus: result.status,
  sourceObjectId: result.sourceObjectId,
  coordinate: c,
  sourceFacts: [
    'Oslo kommune lists Holmlia bad at Holmlia senter vei 34 and documents its current public swimming facilities.',
    'VisitOSLO lists Holmlia bad as a swimming-pool activity in Oslo.',
    'Dagsavisen documents that the swimming hall was completed in 1983 and that the Holmlia halls were blasted into rock to combine sports and civil-defence shelter functions.'
  ]
};
writeJson(`${REPORT_DIR}/decision.json`, decision);

const placeManifest = readJson(PLACE_MANIFEST);
if (placeManifest.files.includes(PLACE_MANIFEST_ENTRY)) throw new Error(`${PLACE_MANIFEST_ENTRY}: already in place manifest`);
placeManifest.files.push(PLACE_MANIFEST_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY)) throw new Error(`${EVIDENCE_MANIFEST_ENTRY}: already in evidence manifest`);
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
const summaryMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*/);
if (!summaryMatch) throw new Error('Could not find Oslo controlled-place summary');
const oldCount = Number(summaryMatch[1]);
const newCount = oldCount + 1;

const tableEndMarker = '\n\nRelevante korrigerende merger for de første Oslo-batchene:';
const tableEnd = protocol.indexOf(tableEndMarker);
if (tableEnd < 0) throw new Error('Could not find Oslo table end');
const tableText = protocol.slice(0, tableEnd);
const batchNumbers = [...tableText.matchAll(/^\| (\d+) \|/gm)].map((m) => Number(m[1]));
if (!batchNumbers.length) throw new Error('Could not parse Oslo batch numbers');
const batchNo = Math.max(...batchNumbers) + 1;

const unresolvedMatch = protocol.match(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
if (!unresolvedMatch) throw new Error('Could not parse unresolved count');
const unresolvedCount = Number(unresolvedMatch[1]);
const newSummary = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batchNo} legger til Holmlia bad som et eget kommunalt svømme- og idrettsanlegg på det verifiserte Holmlia senter vei 34-punktet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);

const tableRow = `| ${batchNo} | \`${PLACE_ID}\` | Holmlia bad | verified | \`${result.sourceObjectId}\` |`;
protocol = protocol.slice(0, tableEnd) + `\n${tableRow}` + protocol.slice(tableEnd);

const firstDuplicateMigration = '\n\nDuplikatmigrering (2026-07-20): `nrk_marienlyst`';
if (!protocol.includes(firstDuplicateMigration)) throw new Error('Could not find narrative insertion point after attraction batches');
const narrative = `\n\nBatch ${batchNo} (2026-07-20) legger til \`${PLACE_ID}\` som et eget kommunalt svømme- og idrettsanlegg. Den normative adresse-first-kontrollen gir det entydige Geonorge-punktet \`${result.sourceObjectId}\` for Holmlia senter vei 34 som dagens bygnings-, display- og unlock-anker. Holmlia bad stod klart i 1983 som del av et fjellanlegg der idrettshall, svømmehall og tilfluktsrom ble kombinert. Den bredere underjordiske infrastrukturen behandles som fysisk og historisk kontekst for badet, ikke som en ekstra overlappende markør. Midlertidige sommerstenginger gjelder drift og endrer ikke canonical stedsstatus.`;
protocol = protocol.replace(firstDuplicateMigration, narrative + firstDuplicateMigration);

const unresolvedRef = /Disse kontrollene er fullført, men teller ikke blant de (\d+) verifiserte eller kildekontrollerte canonical Oslo-stedene\./;
const unresolvedRefMatch = protocol.match(unresolvedRef);
if (!unresolvedRefMatch) throw new Error('Could not find unresolved count reference');
protocol = protocol.replace(unresolvedRefMatch[0], `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log(JSON.stringify({
  ok: true,
  placeId: PLACE_ID,
  category: place.category,
  sourceObjectId: result.sourceObjectId,
  coordinate: { lat: c.lat, lon: c.lon },
  verifiedCount: newCount,
  unresolvedCount,
  batchNo
}, null, 2));
