// One-shot Oslo attraction coordinate production: batch 53 / EKT Rideskole og Husdyrpark.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const INTAKE_FILE = 'reports/oslo-attractions-completeness-20260720/ekt-rideskole-husdyrpark/decision.json';
const TAXONOMY_REPORT = 'reports/oslo-attractions-completeness-20260720/ekt-rideskole-husdyrpark/taxonomy-decision.md';
const VERIFIED_AT = '2026-07-20';
const PLACE_ID = 'ekt_rideskole_husdyrpark';
const PLACE_FILE = 'data/places/sport/europa/norway/oslo_sport/ekt_rideskole_husdyrpark.json';
const PLACE_MANIFEST_ENTRY = 'places/sport/europa/norway/oslo_sport/ekt_rideskole_husdyrpark.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/sport/ekt_rideskole_husdyrpark.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/sport/ekt_rideskole_husdyrpark.json';

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

const intake = readJson(INTAKE_FILE);
if (!intake.ok || intake.finderStatus !== 'verified_candidate') {
  throw new Error(`EKT intake is not a verified candidate: ${JSON.stringify(intake)}`);
}
if (intake.sourceProvider !== 'official_address' || intake.sourceObjectId !== 'geonorge-adresser-v1:0301:11462:99') {
  throw new Error(`Unexpected EKT coordinate source identity: ${JSON.stringify(intake)}`);
}
const coordinate = intake.coordinate;
if (!coordinate || coordinate.address?.street !== 'Ekebergveien' || String(coordinate.address?.number) !== '99') {
  throw new Error(`Unexpected EKT address identity: ${JSON.stringify(intake)}`);
}

const taxonomyText = `# EKT Rideskole og Husdyrpark — canonical taxonomy decision\n\nDate: 2026-07-20\n\n## Decision\n\n**Primary category: sport**\n\nEKT is modeled as one canonical physical place, \`ekt_rideskole_husdyrpark\`, at the verified Ekebergveien 99 complex. The riding school and petting zoo are integrated uses of the same site and must not become overlapping map markers.\n\n## Why sport is primary\n\n- The institution was founded as a riding school in 1954 and has operated the present riding complex since the 1964 municipal lease and construction phase.\n- EKT describes itself as a major recruitment arena for equestrian sport and horse-related skills, with organized riding instruction as a continuous core function.\n- History Go already models equestrian activity inside the sport taxonomy through \`sport_type: equestrian\` and the canonical \`ridning\` underbadge.\n- The petting-farm layer is important visitor and educational content, but it is physically integrated with the riding site rather than a separate canonical place.\n- \`nature\` would be a poor primary category because the animals are managed domestic animals, not evidence of a natural habitat. A separate science/nature marker would also duplicate the same physical site.\n\n## Representation rule\n\nUse one sport place for the whole EKT visitor/riding complex. Preserve animal care, domestic breeds, public education and the petting-farm history as secondary content layers. Questions must not present the site as a wildlife habitat or split the riding school and petting zoo into duplicate places.\n`;
fs.writeFileSync(abs(TAXONOMY_REPORT), taxonomyText);

intake.candidateCategory = 'sport';
intake.taxonomyDecision = 'canonical_sport_primary_integrated_petting_farm_layer';
intake.productionGate = 'coordinate_and_taxonomy_ready';
intake.taxonomyRationale = [
  'Riding school is the continuous institutional core from 1954 and the present Ekeberg complex is built around organized equestrian activity.',
  'Existing canonical sport taxonomy already supports equestrian places and the ridning underbadge.',
  'The petting zoo is an integrated use of the same physical site and should be modeled as secondary educational and visitor content, not a duplicate marker.',
  'Nature is not the primary fit because managed domestic animals at a visitor farm are not a natural habitat.'
];
writeJson(INTAKE_FILE, intake);

const coordNote = `Offisiell adressekoordinat fra Geonorge Adresser API for Ekebergveien 99, OSLO. Punktet representerer dagens samlede EKT-anlegg med rideskole, ridehall, staller og husdyrpark og brukes som display- og unlock-marker. EKT ble etablert i 1954 ved Jomfrubråtveien 40; dagens Ekebergveien 99-kompleks ble utviklet etter festeavtalen med Oslo kommune i 1964. Koordinaten skal derfor ikke leses som institusjonens opprinnelige 1954-lokasjon.`;

const place = {
  id: PLACE_ID,
  name: 'EKT Rideskole og Husdyrpark',
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: coordinate.r || 60,
  category: 'sport',
  sport_type: 'equestrian',
  place_type: 'riding_school_and_petting_farm',
  groundhopper: false,
  year: 1954,
  desc: 'Rideskole og besøksgård på Ekeberg, etablert i 1954. Dagens anlegg i Ekebergveien 99 vokste fram etter en kommunal festeavtale i 1964 og kombinerer organisert rideundervisning, hestesport og nærkontakt med husdyr.',
  popupDesc: 'EKT Rideskole og Husdyrpark ble etablert i 1954 av Edvin Kjell Thorson, først ved hjemmet i Jomfrubråtveien 40. Etter en festeavtale med Oslo kommune i 1964 ble dagens anlegg i Ekebergveien 99 bygget ut med ridehus, staller og husdyrpark. Siden har stedet vært både rideskole, rekrutteringsarena for hestesport og et lavterskel besøkssted der bybarn kan møte husdyr på nært hold.\n\nI History Go behandles hele EKT-komplekset som ett fysisk sportsted. Rideundervisning og hestesport er den primære canonical identiteten, mens husdyrparken, dyreholdet og formidlingen er viktige sekundære lag. Stedet skal ikke splittes i separate markører for rideskole og husdyrpark, og dyrene skal ikke brukes som om de dokumenterer et naturlig habitat på Ekeberg.',
  emne_ids: [
    'em_sport_breddeidrett',
    'em_sport_inkludering_idrett'
  ],
  quiz_profile: {
    place_type: 'rideskole_og_besoksgard',
    subtype: 'urban_rideskole_med_integrert_husdyrpark',
    signature_features: [
      'rideskole etablert i 1954',
      'dagens Ekebergveien 99-anlegg utviklet fra 1964',
      'kombinerer organisert rideundervisning med en offentlig husdyrpark'
    ],
    primary_angles: [
      'hestesport',
      'rideundervisning',
      'breddeidrett',
      'dyrehold_og_husdyrraser',
      'institusjonshistorie'
    ],
    question_families: [
      'institusjonshistorie',
      'hestesport',
      'bruk',
      'dyrehold',
      'for_etter'
    ],
    avoid_angles: [
      'generisk_dyrepark',
      'presentere_husdyrene_som_vilt_habitat',
      'splitte_rideskolen_og_husdyrparken_i_to_fysiske_steder',
      'anta_at_dagens_adresse_er_opprinnelig_1954_lokasjon'
    ],
    must_include: [
      'etableringen som rideskole i 1954',
      'utbyggingen av dagens Ekebergveien 99-anlegg fra 1964',
      'den doble rollen som hestesportsted og offentlig besøksgård'
    ],
    contrast_targets: [
      'ekebergsletta',
      'oslo_reptilpark',
      'bogstad_gard'
    ],
    notes: 'Spør som et fysisk rideskole- og hestesportsted med integrert husdyrformidling. Eksterne kilder skal drive dyre-, sport- og historieinnholdet; dyrene er husdyr under menneskelig drift, ikke naturlig fauna.'
  },
  sport_profile: {
    place_type: 'riding_school',
    sports: ['equestrian'],
    clubs_or_teams: [],
    groundhopper_type: 'riding_school',
    stats_focus: [
      'etableringsar',
      'dagens_anlegg_fra_1964',
      'rideelever',
      'ridehall_og_anlegg',
      'hestesport_rekruttering'
    ],
    collection_hooks: [
      'rideskole_besokt',
      'hestesportsted_besokt',
      'besoksgard_besokt'
    ],
    venue_kind: 'equestrian_training_and_visitor_site',
    groundhopper_relevant: false
  },
  rounds_exclude: ['nature', 'training'],
  underbadge_ids: [
    'ridning',
    'idrettsarenaer'
  ],
  locatorType: coordinate.locatorType || 'building',
  sourceProvider: intake.sourceProvider,
  sourceObjectId: intake.sourceObjectId,
  address: coordinate.address,
  geocodeAccuracy: coordinate.geocodeAccuracy,
  coordRole: coordinate.coordRole,
  coordStatus: coordinate.coordStatus,
  coordSource: coordinate.coordSource,
  coordSourceId: intake.sourceObjectId,
  coordSourceUrl: intake.sourceUrl,
  coordType: coordinate.coordType,
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'EKT Rideskole og Husdyrpark – om oss',
      url: 'https://www.rideskole.no/om-oss/',
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    },
    {
      type: 'official',
      label: 'EKT – prinsipper i rideundervisningen',
      url: 'https://www.rideskole.no/rideundervisningen-ved-ekt/',
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    },
    {
      type: 'reference',
      label: 'VisitOSLO – attraksjoner i Oslo øst',
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
    resolvedIdentity: 'The integrated EKT Rideskole og Husdyrpark visitor and equestrian complex at Ekebergveien 99, with the original 1954 Jomfrubråtveien location retained as institutional history',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: place.locatorType,
    requiresSplit: false,
    splitReason: 'Riding school, riding hall, stables and petting zoo are documented as integrated uses of the same current EKT complex.'
  },
  requiredEvidence: [
    'normative Geonorge address-first result for Ekebergveien 99',
    'official EKT documentation of the current visitor address',
    'official institutional history distinguishing the 1954 origin from the current site developed from 1964',
    'taxonomy decision preventing duplicate riding-school and petting-zoo markers'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: intake.sourceUrl,
      sourceObjectId: intake.sourceObjectId,
      sourceQuality: 'official_address_plus_documented_institutional_identity_and_taxonomy_audit',
      finding: 'The saved normative address intake resolves Ekebergveien 99 to one exact Geonorge address point. EKT identifies the same address as its current visitor site and documents the institution from 1954 and the present complex from the 1964 municipal lease and construction phase.',
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    {
      address: intake.addressQuery,
      sourceProvider: intake.sourceProvider,
      sourceObjectId: intake.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: intake.sourceProvider,
      sourceObjectId: intake.sourceObjectId,
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
    nextAction: 'Apply the verified Ekebergveien 99 address point to one canonical sport record for the integrated EKT complex; retain the original 1954 location as history and do not create a duplicate petting-zoo marker.'
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
if (protocol.includes('| 53 | `ekt_rideskole_husdyrpark` |')) throw new Error('EKT already exists in coordinate protocol batch 53');
const tableEndMarker = '\n\nRelevante korrigerende merger';
const tableEnd = protocol.indexOf(tableEndMarker);
if (tableEnd < 0) throw new Error('Could not locate end of Oslo coordinate table');
const row = `| 53 | \`ekt_rideskole_husdyrpark\` | EKT Rideskole og Husdyrpark | verified | \`${intake.sourceObjectId}\` |`;
protocol = `${protocol.slice(0, tableEnd)}\n${row}${protocol.slice(tableEnd)}`;

const batchNote = `Batch 53 (2026-07-20) produserer \`ekt_rideskole_husdyrpark\` etter separat koordinat- og taxonomy-gate. Det normative adresse-først-intaket ga det eksakte Geonorge-punktet \`${intake.sourceObjectId}\` for Ekebergveien 99. EKT ble etablert som rideskole i 1954 ved Jomfrubråtveien 40, mens dagens ridehus-, stall- og husdyrparkkompleks ble utviklet etter festeavtalen med Oslo kommune i 1964. Canonical primærkategori er sport fordi organisert rideundervisning og hestesport er den kontinuerlige institusjonskjernen; husdyrparken beholdes som et integrert formidlings- og besøkslag på samme fysiske sted, ikke som en overlappende markør.`;
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
  `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 53 legger til EKT Rideskole og Husdyrpark som ett samlet sportsted på det verifiserte Ekebergveien 99-anlegget og beholder husdyrparken som integrert bruk i stedet for en duplikatmarkør. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`
);
protocol = protocol.replace(
  /^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m,
  `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log(JSON.stringify({
  ok: true,
  placeId: PLACE_ID,
  category: place.category,
  sourceObjectId: intake.sourceObjectId,
  coordinate: { lat: place.lat, lon: place.lon },
  verifiedCount,
  unresolvedCount
}, null, 2));
