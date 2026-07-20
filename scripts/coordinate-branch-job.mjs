import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_ID = 'ekt_rideskole_husdyrpark';
const PLACE_FILE = 'data/places/sport/europa/norway/oslo_sport/ekt_rideskole_husdyrpark.json';
const PLACE_MANIFEST_ENTRY = 'places/sport/europa/norway/oslo_sport/ekt_rideskole_husdyrpark.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/sport/ekt_rideskole_husdyrpark.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/sport/ekt_rideskole_husdyrpark.json';
const INTAKE_FILE = 'reports/oslo-attractions-completeness-20260720/ekt-rideskole-husdyrpark/result.json';
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
    for (const row of rowsFrom(readJson(rel))) {
      if (row?.id === placeId) hits.push(rel);
    }
  }
  if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`);
}

assertNoActivePlaceId(PLACE_ID);
if (fs.existsSync(abs(PLACE_FILE))) throw new Error(`${PLACE_FILE}: already exists`);
if (fs.existsSync(abs(EVIDENCE_FILE))) throw new Error(`${EVIDENCE_FILE}: already exists`);

const intake = readJson(INTAKE_FILE);
if (!intake.ok || intake.status !== 'verified_candidate') throw new Error('EKT intake is not verified_candidate');
if (intake.sourceObjectId !== 'geonorge-adresser-v1:0301:11462:99') throw new Error('Unexpected EKT Geonorge source object');

const c = intake.coordinate;
const place = {
  id: PLACE_ID,
  name: 'EKT Rideskole og Husdyrpark',
  lat: c.lat,
  lon: c.lon,
  r: c.r,
  category: 'sport',
  year: 1954,
  desc: 'Rideskole og besøksgård på Ekeberg, etablert i 1954 og utviklet på dagens Ekebergveien 99-anlegg fra 1964. EKT kombinerer rideundervisning, hestesport, terapiridning og nærkontakt med husdyr.',
  popupDesc: 'EKT Rideskole og Husdyrpark ble etablert i 1954 av Edvin Kjell Thorson, først ved hjemmet i Jomfrubråtveien 40. Etter en festeavtale med Oslo kommune i 1964 ble det bygget ridehus, staller, fjøs og husdyrpark på Ekebergveien 99, som fortsatt er dagens besøksadresse. Stedet har siden vært både rideskole, rekrutteringsarena for hestesport og lavterskel besøksgård for barn og familier.\n\nI History Go behandles EKT primært som et sport- og aktivitetssted fordi den kontinuerlige rideundervisningen og hestesportsfunksjonen er den mest stabile institusjonelle kjernen. Husdyrparken og dyreformidlingen er samtidig en vesentlig del av stedet og skal ikke reduseres til pynt rundt rideskolen. Dagens Geonorge-punkt representerer det konkrete EKT-anlegget i Ekebergveien 99 og skal ikke brukes som om rideskolen lå der helt fra oppstarten i 1954. EKT er også fysisk og funksjonelt separat fra `ekebergsletta`, som i History Go representerer det større Norway Cup- og breddefotballandskapet.',
  emne_ids: [
    'em_sport_breddeidrett',
    'em_sport_inkludering_idrett',
    'em_sport_idrettsgeografi'
  ],
  quiz_profile: {
    place_type: 'rideskole_og_besoksgard',
    subtype: 'hestesport_dyrehold_og_lavterskel_formidling',
    signature_features: [
      'rideskole etablert på Ekeberg i 1954',
      'dagens ridehus-, stall- og husdyrparkanlegg i Ekebergveien 99 fra 1964',
      'kombinerer rideundervisning, terapiridning og besøksgård med husdyr'
    ],
    primary_angles: [
      'hestesport',
      'breddeidrett',
      'inkludering',
      'dyrehold',
      'institusjonshistorie'
    ],
    question_families: [
      'institusjonshistorie',
      'hestesport_og_ridning',
      'bruk_og_inkludering',
      'dyrehold_og_formidling',
      'kontrast'
    ],
    avoid_angles: [
      'generisk_turistattraksjon',
      'behandle_husdyrparken_som_vilt_naturhabitat',
      'anta_at_dagens_adresse_er_opprinnelig_1954_lokasjon',
      'slå_sammen_med_ekebergsletta_som_samme_fysiske_sted'
    ],
    must_include: [
      'etableringen i 1954 og flyttingen til dagens anlegg gjennom 1964-utbyggingen',
      'rollen som aktiv rideskole og arena for hestesport',
      'besøksgården og dyrekontakten som en integrert del av stedet'
    ],
    contrast_targets: [
      'ekebergsletta',
      'oslo_reptilpark',
      'holmenkollen_nasjonalanlegg'
    ],
    notes: 'Spørsmål skal skille mellom institusjonens start i 1954 og dagens Ekebergveien 99-anlegg fra 1964. EKT er et konkret ride- og besøksgårdsanlegg, mens Ekebergsletta er et bredere turnerings- og fotballandskap.'
  },
  sport_profile: {
    place_type: 'rideskole_og_hestesportsanlegg',
    sports: ['ridning', 'hestesport'],
    clubs_or_teams: ['EKT Rideskole og Husdyrpark'],
    groundhopper_type: 'equestrian_training_venue',
    stats_focus: ['etableringsår', 'rideundervisning', 'hestehold', 'terapiridning', 'besøksgård'],
    collection_hooks: ['rideskole_besokt', 'hestesportssted_besokt', 'besoksgard_besokt'],
    venue_kind: 'riding_school_and_visitor_farm',
    groundhopper_relevant: false
  },
  underbadge_ids: ['ridning', 'breddeidrett', 'inkludering', 'idrettsanlegg', 'lokalidrett'],
  sport_type: 'equestrian',
  place_type: 'riding_school_and_visitor_farm',
  groundhopper: false,
  locatorType: c.locatorType,
  sourceProvider: c.sourceProvider,
  sourceObjectId: c.sourceObjectId,
  address: c.address,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: c.coordStatus,
  coordSource: c.coordSource,
  coordSourceId: c.sourceObjectId,
  coordSourceUrl: intake.sourceUrl,
  coordType: c.coordType,
  coordVerifiedAt: '2026-07-20',
  coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Ekebergveien 99, OSLO. Punktet representerer dagens EKT-anlegg med ridehus, staller og husdyrpark. Rideskolen ble etablert i Jomfrubråtveien 40 i 1954; dagens anlegg ble utviklet etter festeavtalen med Oslo kommune i 1964. Punktet er derfor et nåværende bygnings-/displayanker, ikke 1954-lokasjonen og ikke et generelt anker for hele Ekebergsletta.',
  externalLinks: [
    {
      type: 'official',
      label: 'EKT Rideskole og Husdyrpark – om oss',
      url: 'https://www.rideskole.no/om-oss/',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'official',
      label: 'EKT Rideskole og Husdyrpark – besøksinformasjon',
      url: 'https://www.rideskole.no/explore-ekt/',
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
    currentName: 'EKT Rideskole og Husdyrpark',
    resolvedIdentity: 'The combined EKT riding-school and visitor-farm complex at the current public address Ekebergveien 99, distinct from the broader Ekebergsletta football and tournament landscape',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for dagens besøksadresse',
    'offisiell EKT-dokumentasjon av dagens adresse og 1964-anlegget',
    'eksplisitt skille mellom oppstarten i Jomfrubråtveien 40 i 1954 og dagens anlegg',
    'fysisk og funksjonell avgrensning mot canonical `ekebergsletta`'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: intake.sourceUrl,
      sourceObjectId: intake.sourceObjectId,
      sourceQuality: 'official_address_plus_documented_visitor_identity',
      finding: 'Geonorge gir et eksakt adressetreff for Ekebergveien 99. EKT oppgir samme adresse som dagens besøksadresse og dokumenterer at rideskolen startet i Jomfrubråtveien 40 i 1954, mens ridehus, staller og husdyrpark ble etablert på dagens område etter festeavtalen med Oslo kommune i 1964.',
      canVerifyCoordinate: true,
      reason: place.coordNote
    }
  ],
  addressCandidates: [
    {
      address: 'Ekebergveien 99 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: intake.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: intake.sourceObjectId,
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
    nextAction: 'Apply Ekebergveien 99 as the canonical display marker for EKT. Keep the 1954 Jomfrubråtveien origin as institutional history and keep Ekebergsletta as a separate broader football/tournament place.'
  },
  notes: [
    place.coordNote,
    'EKT-markerens sentrum ligger omtrent 317 meter fra dagens Ekebergsletta-anker. De to representerer ulike fysiske og funksjonelle objekter: EKT-anlegget versus det brede Norway Cup-/fotballandskapet.'
  ]
};
writeJson(EVIDENCE_FILE, evidence);

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
const summaryMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!summaryMatch) throw new Error('Could not find Oslo controlled-place summary');
const oldCount = Number(summaryMatch[1]);
const newCount = oldCount + 1;
protocol = protocol.replace(summaryMatch[0], `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder.`);

const tableEndMarker = '\n\nRelevante korrigerende merger for de første Oslo-batchene:';
const tableEnd = protocol.indexOf(tableEndMarker);
if (tableEnd < 0) throw new Error('Could not find Oslo table end');
const tableText = protocol.slice(0, tableEnd);
const batchNumbers = [...tableText.matchAll(/^\| (\d+) \|/gm)].map((m) => Number(m[1]));
if (!batchNumbers.length) throw new Error('Could not parse Oslo batch numbers');
const batchNo = Math.max(...batchNumbers) + 1;
const tableRow = `| ${batchNo} | \`${PLACE_ID}\` | EKT Rideskole og Husdyrpark | verified | \`${intake.sourceObjectId}\` |`;
protocol = protocol.slice(0, tableEnd) + `\n${tableRow}` + protocol.slice(tableEnd);

const firstDuplicateMigration = '\n\nDuplikatmigrering (2026-07-20): `nrk_marienlyst`';
if (!protocol.includes(firstDuplicateMigration)) throw new Error('Could not find narrative insertion point after attraction batches');
const narrative = `\n\nBatch ${batchNo} (2026-07-20) legger til \`${PLACE_ID}\` som et eget, fysisk rideskole- og besøksgårdsanlegg på Ekeberg. Det entydige Geonorge-punktet \`${intake.sourceObjectId}\` for Ekebergveien 99 brukes som dagens bygnings- og displayanker. EKT dokumenterer at rideskolen startet i Jomfrubråtveien 40 i 1954 og at ridehus, staller og husdyrpark ble etablert på dagens område etter festeavtalen med Oslo kommune i 1964. Stedet kategoriseres som \`sport\` med hestesport og rideundervisning som institusjonell kjerne, samtidig som besøksgården beholdes som integrert stedsfunksjon. \`ekebergsletta\` forblir et separat bredt Norway Cup-/fotballanker og skal ikke slås sammen med EKT-anlegget.`;
protocol = protocol.replace(firstDuplicateMigration, narrative + firstDuplicateMigration);

const unresolvedRegex = /Disse kontrollene er fullført, men teller ikke blant de (\d+) verifiserte eller kildekontrollerte canonical Oslo-stedene\./;
const unresolvedMatch = protocol.match(unresolvedRegex);
if (!unresolvedMatch) throw new Error('Could not find unresolved-count reference');
protocol = protocol.replace(unresolvedMatch[0], `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log(`Produced ${PLACE_ID} as Oslo coordinate batch ${batchNo}; controlled-place count ${oldCount} -> ${newCount}.`);
