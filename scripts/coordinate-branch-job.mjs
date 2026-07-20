import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const VERIFIED_AT = '2026-07-20';
const PLACE_ID = 'toyenbadet';
const PLACE_FILE = 'data/places/sport/europa/norway/oslo_sport/toyenbadet.json';
const PLACE_MANIFEST_ENTRY = 'places/sport/europa/norway/oslo_sport/toyenbadet.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/sport/toyenbadet.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/sport/toyenbadet.json';
const ADDRESS_QUERY = 'Helgesens gate 90 Oslo';

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(data, null, 2)}\n`);
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
    for (const row of rowsFrom(readJson(rel))) {
      if (row?.id === placeId) hits.push(rel);
    }
  }
  if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`);
}

assertNoActivePlaceId(PLACE_ID);
if (fs.existsSync(abs(PLACE_FILE))) throw new Error(`${PLACE_ID}: place file already exists`);
if (fs.existsSync(abs(EVIDENCE_FILE))) throw new Error(`${PLACE_ID}: evidence file already exists`);

execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
const finderOutput = execFileSync(
  'node',
  ['dist/tools/address-first-coordinate-finder.mjs', '--address', ADDRESS_QUERY],
  { encoding: 'utf8' }
);
const finder = JSON.parse(finderOutput);
if (!finder.ok || finder.status !== 'verified_candidate') {
  throw new Error(`Tøyenbadet address lookup did not return verified_candidate: ${finderOutput}`);
}
if (finder.sourceProvider !== 'official_address') {
  throw new Error(`Unexpected coordinate source provider: ${finder.sourceProvider}`);
}
const coordinate = finder.coordinate;
if (!coordinate || coordinate.address?.street !== 'Helgesens gate' || String(coordinate.address?.number) !== '90') {
  throw new Error(`Unexpected address identity from Geonorge: ${finderOutput}`);
}

const coordNote = `Offisiell adressekoordinat fra Geonorge Adresser API for Helgesens gate 90, OSLO. Punktet representerer dagens Tøyenbadet og brukes som display- og unlock-marker. Det nye hovedbadet åpnet 6. januar 2025 på samme tomt som det opprinnelige Tøyenbadet fra 1976; koordinaten dokumenterer dagens besøksanlegg, mens 1976-anlegget bevares som et historisk lag på samme sted.`;

const place = {
  id: PLACE_ID,
  name: 'Tøyenbadet',
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: coordinate.r || 60,
  category: 'sport',
  sport_type: 'swimming',
  place_type: 'aquatic_centre',
  year: 1976,
  desc: 'Kommunalt bade- og idrettsanlegg på Tøyen. Det opprinnelige Tøyenbadet åpnet i 1976, og et nytt hovedbad åpnet 6. januar 2025 på samme tomt.',
  popupDesc: 'Tøyenbadet har vært et sentralt offentlig bade- og idrettssted i Oslo siden det første anlegget åpnet i 1976. Etter at det gamle badet ble revet, bygget Oslo kommune et nytt hovedbad på samme tomt. Det nye Tøyenbadet åpnet 6. januar 2025 og samler konkurranse- og mosjonssvømming, stup, opplæring, familiebruk og utebad i ett stort kommunalt anlegg.\n\nI History Go skal stedet behandles som ett fysisk idrettssted med to tydelige bygningshistoriske lag: 1976-anlegget og dagens 2025-anlegg. Spørsmål må ikke blande egenskapene til den gamle bygningen med dagens bad, men kan bruke kontinuiteten på samme tomt til å undersøke hvordan offentlig idrettsinfrastruktur bygges om over tid.',
  emne_ids: [
    'em_sport_arena_samling',
    'em_sport_idrettsarena_sted'
  ],
  quiz_profile: {
    place_type: 'bade_og_idrettsanlegg',
    subtype: 'kommunalt_hovedbad_med_inne_og_uteanlegg',
    signature_features: [
      'opprinnelig Tøyenbad åpnet i 1976',
      'nytt hovedbad åpnet 6. januar 2025 på samme tomt',
      'kombinerer 50-metersbasseng, stup, opplæring, familieområder og utebad'
    ],
    primary_angles: [
      'idrettshistorie',
      'svomming',
      'stup',
      'offentlig_idrettsinfrastruktur',
      'for_etter'
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
      'blande_1976_bygningen_med_2025_anlegget',
      'bruke_midlertidige_driftmeldinger_som_varig_stedsidentitet'
    ],
    must_include: [
      'kontinuiteten fra 1976 til det nye badet i 2025',
      'at dagens anlegg ligger på samme tomt som det gamle',
      'rollen som offentlig bade- og idrettsanlegg'
    ],
    contrast_targets: [
      'jordal_amfi',
      'bislett_stadion',
      'holmenkollen_nasjonalanlegg'
    ],
    notes: 'Synlige spørsmål skal bygge på dokumentert anleggshistorie og konkrete fasiliteter. Dagens koordinat er for 2025-anlegget; 1976-badet er et historisk lag på samme tomt.'
  },
  sport_profile: {
    place_type: 'aquatic_centre',
    sports: ['swimming', 'diving'],
    clubs_or_teams: [],
    groundhopper_type: 'public_aquatic_centre',
    stats_focus: [
      'apningsar_gammelt_anlegg',
      'apningsar_nytt_anlegg',
      'bassengtyper',
      'stupehoyder',
      'publikumskapasitet'
    ],
    collection_hooks: [
      'svommehall_besokt',
      'offentlig_idrettsanlegg_besokt'
    ],
    venue_kind: 'aquatic_centre',
    groundhopper_relevant: false
  },
  rounds_exclude: ['nature', 'training'],
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
      label: 'Oslo kommune – Tøyenbadet',
      url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/svommehaller-i-oslo/toyenbadet/',
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    },
    {
      type: 'official',
      label: 'Oslo kommune – det nye Tøyenbadet åpner i januar 2025',
      url: 'https://aktuelt.oslo.kommune.no/det-nye-toyenbadet-apner-i-januar-2025',
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    },
    {
      type: 'reference',
      label: 'VisitOSLO – Tøyenbadet',
      url: 'https://www.visitoslo.com/en/activities-and-attractions/boroughs/oslo-east/attractions/',
      lang: 'en',
      verifiedAt: VERIFIED_AT
    }
  ]
};
writeJson(PLACE_FILE, place);

writeJson(EVIDENCE_FILE, {
  placeId: place.id,
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
    resolvedIdentity: 'Tøyenbadet at the current municipal aquatic centre in Helgesens gate 90, with the original 1976 facility retained as a historical layer on the same site',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: place.locatorType,
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for dagens besøksanlegg',
    'offisiell dokumentasjon av dagens Tøyenbadet på Helgesens gate 90',
    'offisiell dokumentasjon av 1976-anlegget og åpningen av nybygget i 2025 på samme tomt'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: finder.sourceUrl,
      sourceObjectId: finder.sourceObjectId,
      sourceQuality: 'official_address_plus_documented_same_site_rebuild',
      finding: 'Geonorge gir ett tydelig adressetreff for Helgesens gate 90. Oslo kommune oppgir samme adresse for dagens Tøyenbadet og dokumenterer at det nye hovedbadet åpnet 6. januar 2025 på samme tomt som det opprinnelige anlegget fra 1976.',
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    {
      address: ADDRESS_QUERY,
      sourceProvider: 'official_address',
      sourceObjectId: finder.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: finder.sourceObjectId,
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
    nextAction: 'Use the verified Helgesens gate 90 address point for the current Tøyenbadet; retain the original 1976 facility as a historical same-site layer rather than a separate active marker.'
  },
  notes: [place.coordNote]
});

const placeManifest = readJson(PLACE_MANIFEST);
if (!Array.isArray(placeManifest.files)) throw new Error('data/places/manifest.json missing files array');
if (placeManifest.files.includes(PLACE_MANIFEST_ENTRY)) throw new Error(`${PLACE_MANIFEST_ENTRY}: already in place manifest`);
placeManifest.files.push(PLACE_MANIFEST_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files)) throw new Error('coordinate evidence manifest missing files array');
if (evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY)) throw new Error(`${EVIDENCE_MANIFEST_ENTRY}: already in evidence manifest`);
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
if (protocol.includes('| 52 | `toyenbadet` |')) throw new Error('Tøyenbadet already exists in coordinate protocol batch 52');
const tableEndMarker = '\n\nRelevante korrigerende merger';
const tableEnd = protocol.indexOf(tableEndMarker);
if (tableEnd < 0) throw new Error('Could not locate end of Oslo coordinate table');
const row = `| 52 | \`toyenbadet\` | Tøyenbadet | verified | \`${finder.sourceObjectId}\` |`;
protocol = `${protocol.slice(0, tableEnd)}\n${row}${protocol.slice(tableEnd)}`;

const batchNote = `Batch 52 (2026-07-20) fortsetter den avgrensede completeness-passeringen for VisitOSLO-attraksjoner utenfor museumskategorien. \`toyenbadet\` bruker det entydige Geonorge-adressepunktet \`${finder.sourceObjectId}\` for Helgesens gate 90 som dagens bygnings-, display- og unlock-anker. Oslo kommune dokumenterer at det nye hovedbadet åpnet 6. januar 2025 på samme tomt som det opprinnelige Tøyenbadet fra 1976. Stedet modelleres derfor som én fysisk canonical place med to bygningshistoriske lag, ikke som to overlappende markører.`;
if (!protocol.includes(batchNote)) {
  const migrationStart = protocol.indexOf('\nDuplikatmigrering');
  if (migrationStart < 0) throw new Error('Could not locate duplicate migration notes');
  protocol = `${protocol.slice(0, migrationStart)}\n\n${batchNote}${protocol.slice(migrationStart)}`;
}

const osloStart = protocol.indexOf('## Oslo');
const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const unresolvedStart = protocol.indexOf(unresolvedHeader);
const etneStart = protocol.indexOf('\n## Etne', unresolvedStart);
if (osloStart < 0 || unresolvedStart < 0) throw new Error('Could not locate Oslo protocol sections');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
const unresolvedCount = unresolvedSection
  .split('\n')
  .filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat'))
  .length;

protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 52 legger til Tøyenbadet med det entydige Geonorge-punktet for dagens besøksanlegg i Helgesens gate 90 og bevarer 1976-badet som et historisk lag på samme tomt. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`
);
protocol = protocol.replace(
  /^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m,
  `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log(JSON.stringify({
  ok: true,
  placeId: PLACE_ID,
  sourceObjectId: finder.sourceObjectId,
  coordinate: { lat: place.lat, lon: place.lon },
  verifiedCount,
  unresolvedCount
}, null, 2));
