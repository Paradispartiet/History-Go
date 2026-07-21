import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const verifiedAt = '2026-07-21';
const placeFile = 'data/places/sport/europa/norway/oslo_sport/oslo_golfklubb_bogstad.json';
const evidenceFile = 'data/coordinate-evidence/oslo/sport/oslo_golfklubb_bogstad.json';
const manifestRel = placeFile.replace(/^data\//, '');
const evidenceManifestRel = evidenceFile.replace(/^data\/coordinate-evidence\//, '');

const indexRaw = JSON.parse(fs.readFileSync(path.join(root, 'data/places/places_index.json'), 'utf8'));
const indexPlaces = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (indexPlaces.some((p) => p?.id === 'oslo_golfklubb_bogstad')) {
  throw new Error('Canonical place oslo_golfklubb_bogstad already exists on fresh main');
}
if (fs.existsSync(path.join(root, placeFile))) throw new Error(`Place file already exists: ${placeFile}`);
if (fs.existsSync(path.join(root, evidenceFile))) throw new Error(`Evidence file already exists: ${evidenceFile}`);

const place = {
  id: 'oslo_golfklubb_bogstad',
  name: 'Oslo Golfklubb – Bogstad',
  lat: 59.962399448254494,
  lon: 10.63892806989306,
  r: 90,
  category: 'sport',
  sport_type: 'golf',
  place_type: 'golf_course_and_clubhouse',
  groundhopper: false,
  year: 1924,
  desc: 'Norges eldste golfklubb, stiftet i 1924, med 18-hulls parkbane ved Bogstadvannet og Bogstad gård. Klubbhuset i Ankerveien 127 brukes som History Go-markør for det samlede golfanlegget.',
  popupDesc: 'Oslo Golfklubb ble stiftet 13. juni 1924 som Kristiania Golf Klub og er Norges eldste golfklubb. De første golfslagene ble slått på Bogstad samme år, først på en nihullsbane. Åtte år senere var anlegget utvidet til 18 hull. Dagens bane ligger mellom Bogstadvannet og Bogstad gård og omfatter omtrent 480 mål med 18 hull og driving range.\n\nKlubbhuset er det stabile offentlige ankomst-, registrerings- og servicepunktet for anlegget. Det første klubbhuset var en låve på Bjerkodden, et nytt klubbhus ble reist i 1935 på stedet der dagens bygg ligger, og dagens klubbhus stod ferdig i 2020. I History Go representerer koordinaten ved Ankerveien 127 hele Oslo Golfklubb-anlegget som ett sportsted, men punktet påstås ikke å være geometrisk sentrum av den store golfbanen.',
  emne_ids: [
    'em_sport_arena_samling',
    'em_sport_idrettsarena_sted'
  ],
  quiz_profile: {
    place_type: 'golfanlegg',
    subtype: 'historisk_18_hulls_parkbane_med_klubbhus',
    signature_features: [
      'Norges eldste golfklubb, stiftet i 1924',
      '18-hulls parkbane ved Bogstadvannet og Bogstad gård',
      'dagens klubbhus stod ferdig i 2020 på samme sted som klubbhuset fra 1935'
    ],
    primary_angles: [
      'golfhistorie',
      'idrettsanlegg',
      'klubbutvikling',
      'landskap_og_bane',
      'bredde_og_konkurranse'
    ],
    question_families: [
      'institusjonshistorie',
      'idrettsanlegg',
      'bruk',
      'historisk_endring',
      'kontrast'
    ],
    avoid_angles: [
      'generisk_golfregler',
      'behandle_klubbhuspunktet_som_banens_geometriske_sentrum',
      'forveksling_med_bogstad_gard_eller_bogstadvannet'
    ],
    must_include: [
      'stiftelsen i 1924 og rollen som Norges eldste golfklubb',
      'utviklingen fra ni til 18 hull',
      'forholdet mellom golfbanen, Bogstadvannet og Bogstad gård'
    ],
    contrast_targets: [
      'bogstadvannet',
      'bogstad_gard',
      'holmenkollen_nasjonalanlegg'
    ],
    notes: 'Spør som ett historisk golfanlegg med bane og klubbhus. Klubbhuset er kartanker; banen er det større fysiske stedsomfanget.'
  },
  sport_profile: {
    place_type: 'golf_course',
    sports: ['golf'],
    clubs_or_teams: ['Oslo Golfklubb'],
    groundhopper_type: 'golf_course',
    stats_focus: [
      'stiftet_1924',
      'ni_til_18_hull',
      'baneareal_omtrent_480_maal',
      'klubbhus_1935_og_2020'
    ],
    collection_hooks: [
      'golfbane_besokt',
      'historisk_idrettsanlegg_besokt'
    ],
    venue_kind: 'golf_course_and_clubhouse',
    groundhopper_relevant: false
  },
  rounds_exclude: ['nature', 'training'],
  underbadge_ids: ['golf', 'idrettsarenaer'],
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:10163:127',
  address: {
    street: 'Ankerveien',
    number: '127',
    postcode: '0766',
    city: 'Oslo',
    country: 'NO'
  },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:10163:127',
  coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Ankerveien%20127%20Oslo',
  coordType: 'address_point',
  coordVerifiedAt: verifiedAt,
  coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Ankerveien 127, OSLO. Punktet representerer dagens klubbhus og brukes som stabil display- og unlock-marker for Oslo Golfklubbs samlede anlegg på Bogstad. Det påstås ikke at adressepunktet er geometrisk sentrum av den omtrent 480 mål store 18-hullsbanen.',
  externalLinks: [
    {
      type: 'official',
      label: 'Oslo Golfklubb – om klubben',
      url: 'https://www.oslogk.no/om-klubben',
      lang: 'nb',
      verifiedAt
    },
    {
      type: 'official',
      label: 'Oslo Golfklubb – banen på Bogstad',
      url: 'https://www.oslogk.no/banen',
      lang: 'nb',
      verifiedAt
    }
  ]
};

fs.mkdirSync(path.dirname(path.join(root, placeFile)), { recursive: true });
fs.writeFileSync(path.join(root, placeFile), `${JSON.stringify(place, null, 2)}\n`);

const evidence = {
  placeId: 'oslo_golfklubb_bogstad',
  placeFile,
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
    resolvedIdentity: 'Oslo Golfklubbs golfanlegg på Bogstad, represented by the current public clubhouse/address anchor at Ankerveien 127 while the 18-hole course remains the wider site extent',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'active canonical duplicate audit',
    'normative Geonorge address-first result for Ankerveien 127 Oslo',
    'official club history and course documentation',
    'explicit representation decision separating clubhouse marker from course extent'
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Ankerveien%20127%20Oslo',
      sourceObjectId: 'geonorge-adresser-v1:0301:10163:127',
      sourceQuality: 'official_address_plus_official_club_history_and_course_sources',
      finding: 'Address-first lookup returned one clear official address result for Ankerveien 127. Oslo Golfklubb documents the club and course at Bogstad and uses the clubhouse as the public arrival and service point.',
      canVerifyCoordinate: true,
      reason: place.coordNote
    }
  ],
  addressCandidates: [
    {
      address: 'Ankerveien 127 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:10163:127',
      canApplyToPlace: true
    }
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:10163:127',
      canApplyToPlace: true
    }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    {
      lat: place.lat,
      lon: place.lon,
      coordRole: 'display_marker',
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Keep the verified clubhouse/address marker as the stable display and unlock point for the combined golf facility; do not replace it with an arbitrary course centroid.'
  },
  notes: [place.coordNote]
};
fs.mkdirSync(path.dirname(path.join(root, evidenceFile)), { recursive: true });
fs.writeFileSync(path.join(root, evidenceFile), `${JSON.stringify(evidence, null, 2)}\n`);

const placeManifestFile = path.join(root, 'data/places/manifest.json');
const placeManifest = JSON.parse(fs.readFileSync(placeManifestFile, 'utf8'));
if (!placeManifest.files.includes(manifestRel)) placeManifest.files.push(manifestRel);
fs.writeFileSync(placeManifestFile, `${JSON.stringify(placeManifest, null, 2)}\n`);

const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceManifest = JSON.parse(fs.readFileSync(evidenceManifestFile, 'utf8'));
if (!evidenceManifest.files.includes(evidenceManifestRel)) evidenceManifest.files.push(evidenceManifestRel);
fs.writeFileSync(evidenceManifestFile, `${JSON.stringify(evidenceManifest, null, 2)}\n`);

const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
let protocol = fs.readFileSync(protocolFile, 'utf8');
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Oslo count not found in protocol');
if (Number(countMatch[1]) !== 279) throw new Error(`Expected batch-116 baseline count 279, found ${countMatch[1]}`);
if (!protocol.includes('| 115 | `bogstadvannet` |')) throw new Error('Batch 115 Holmenkollen rows missing from baseline');
if (protocol.includes('| 116 | `oslo_golfklubb_bogstad` |')) throw new Error('Golf club batch 116 already present');

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå 279 dokumenterte verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 280 dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 116 produserer Oslo Golfklubb på Bogstad som det sjette og siste nye stedet fra den lukkede VisitOSLO Holmenkollen-auditen.'
);

const lines = protocol.split('\n');
let insertAfter = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^\|\s*\d+\s*\|/.test(lines[i])) insertAfter = i;
  if (lines[i].startsWith('Batch 95 (2026-07-21)')) break;
}
if (insertAfter < 0) throw new Error('Could not locate Oslo verified table rows');
lines.splice(insertAfter + 1, 0, '| 116 | `oslo_golfklubb_bogstad` | Oslo Golfklubb – Bogstad | verified | `geonorge-adresser-v1:0301:10163:127` |');
const batch115Index = lines.findIndex((line) => line.startsWith('Batch 115 (2026-07-21)'));
if (batch115Index < 0) throw new Error('Could not locate Batch 115 narrative');
lines.splice(batch115Index + 1, 0, '', 'Batch 116 (2026-07-21) produserer `oslo_golfklubb_bogstad` som det sjette og siste nye stedet fra VisitOSLO Holmenkollen-auditen. Den normative address-first-kjøringen ga ett entydig Geonorge-treff for Ankerveien 127. Klubbhuset brukes som stabil offentlig display- og unlock-marker for hele golfanlegget; den omtrent 480 mål store 18-hullsbanen er stedsomfang og sportskontekst, men adressepunktet påstås ikke å være banens geometriske sentrum.');
protocol = lines.join('\n').replace('- Neste nye Oslo-kontroll er batch 116.', '- Neste nye Oslo-kontroll er batch 117.');
fs.writeFileSync(protocolFile, protocol);

fs.rmSync(fileURLToPath(import.meta.url));
console.log('Produserte Oslo Golfklubb Bogstad som Oslo coordinate batch 116.');
