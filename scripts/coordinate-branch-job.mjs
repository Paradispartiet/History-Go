import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';

const placeId = 'kampen_okologiske_barnebondegard';
const placeName = 'Kampen Økologiske Barnebondegård';
const placePath = `data/places/by/oslo/places/${placeId}.json`;
const placeManifestPath = 'data/places/manifest.json';
const placeManifestEntry = `places/by/oslo/places/${placeId}.json`;
const evidencePath = `data/coordinate-evidence/oslo/by/${placeId}.json`;
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const evidenceManifestEntry = `oslo/by/${placeId}.json`;
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';

const coordinate = {
  lat: 59.91319830613384,
  lon: 10.785092383475156,
  r: 60,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:16443:23',
  address: {
    street: 'Skedsmogata',
    number: '23',
    postcode: '0655',
    city: 'Oslo',
    country: 'NO',
  },
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:16443:23',
  coordSourceUrl:
    'https://ws.geonorge.no/adresser/v1/sok?sok=Skedsmogata%2023%20Oslo',
  coordType: 'address_point',
  coordVerifiedAt: '2026-07-20',
  coordNote:
    'Offisiell adressekoordinat fra Geonorge Adresser API for Skedsmogata 23, OSLO. Punktet brukes som display- og unlock-marker for det integrerte gårdstunet til Kampen Økologiske Barnebondegård. Det representerer ikke Kampen som bydel, Kampen park eller et generelt naturområde.',
};

const place = {
  id: placeId,
  name: placeName,
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: coordinate.r,
  category: 'by',
  primary_category: 'by',
  secondary_category: 'natur',
  hybrid: true,
  year: 1994,
  emne_ids: [
    'em_by_lavterskel_moteplasser_uten_kjopspress',
    'em_by_inkludering_ekskludering',
    'em_by_medvirkning_samskaping_community',
  ],
  desc:
    'Urban barnebondegård på Kampen, åpnet i 1994 etter et lokalt nærmiljøinitiativ. Gårdstun, skolehage, fjøs og stall brukes som lavterskel møteplass og læringsarena for barn, familier, skoler og nærmiljøet.',
  popupDesc:
    'Kampen Økologiske Barnebondegård ligger i Skedsmogata 23, mellom Kampen skole og Ensjø. Ideen ble løftet fram av tre unge jenter på en nærmiljøkonferanse i 1991, og etter dugnadsinnsats og støtte fra blant annet Miljøbyen og Bydel Gamle Oslo åpnet gården 30. april 1994. Stedet er derfor et konkret eksempel på at barn og nærmiljø kan være med på å forme byen.\n\nI dag består det integrerte gårdsstedet av gårdstun, skolehage, fjøs og stall. Gården brukes til åpen gård, organiserte besøk, alternativ skoledag, gårds- og hestegrupper, tilrettelagte aktiviteter og arbeidstrening. Den offisielle visjonen er å være et vindu til landbruket for barn i bydel Gamle Oslo, med læring om matproduksjon og naturens kretsløp. Samtidig beskrives gården som et sted for tilhørighet, mestring, samvær og møter på tvers av alder, kultur og funksjonsevne.\n\nI History Go behandles dette først og fremst som urban sosial og pedagogisk infrastruktur: en bondegård skapt inne i byen som nærmiljøprosjekt og lavterskel møteplass. Dyr, planter, dyrking og økologiske kretsløp er et reelt sekundært naturfaglig lag, men husdyrene skal ikke presenteres som vill fauna eller stedet som et naturlig habitat.',
  quiz_profile: {
    place_type: 'urban_barnebondegard_og_naermiljoarena',
    subtype: 'lavterskel_laerings_og_fellesskapssted_med_landbruk_i_byen',
    signature_features: [
      'ideen ble fremmet av barn på en nærmiljøkonferanse i 1991',
      'gården åpnet 30. april 1994 på et tidligere skolehageområde',
      'gårdstun, skolehage, fjøs og stall danner ett integrert besøks- og læringssted',
      'gården kombinerer åpen møteplass med pedagogiske og tilrettelagte tilbud',
    ],
    primary_angles: [
      'barn_og_medvirkning',
      'naermiljo_og_moteplass',
      'inkludering_og_mestring',
      'urban_matproduksjon',
      'dyr_og_planter_som_laeringsarena',
      'frivillighet_og_lokal_infrastruktur',
    ],
    question_families: [
      'historisk_opprinnelse',
      'bruk_og_hverdagsliv',
      'medvirkning',
      'institusjon_og_naermiljo',
      'mat_og_kretslop',
      'kontrast',
    ],
    avoid_angles: [
      'generisk_besoksgard',
      'presentere_husdyr_som_vill_fauna',
      'forveksle_stedet_med_kampen_park',
      'redusere_garden_til_bare_ridning',
      'generiske_okologisporsmal_uten_stedlig_kilde',
    ],
    must_include: [
      '1991-initiativet fra barn i nærmiljøet',
      'åpningen i 1994',
      'rollen som lavterskel møteplass og læringsarena',
      'koblingen mellom gårdsarbeid, matproduksjon og naturens kretsløp',
    ],
    contrast_targets: [
      'geitmyra_gard',
      'ekt_rideskole_husdyrpark',
      'toyen_torg',
    ],
    notes:
      'Spør som et konkret urbant nærmiljø- og læringssted. Eksterne offisielle og lokale kilder skal dominere synlig quizinnhold; emne- og naturprofiler er styring, ikke faktakilde.',
  },
  nature_profile: {
    type: 'forvaltet urban gård / dyrking / matproduksjon / læring om kretsløp',
    title: 'Naturens kretsløp gjennom et forvaltet gårdssted i byen',
    summary:
      'Natur-rundingen skal ta utgangspunkt i det som faktisk er dokumentert på gården: skolehage, dyrking, matproduksjon, stell av husdyr og læring om naturens kretsløp. Stedet er et menneskeskapt og forvaltet gårdsmiljø, ikke et vilt habitat, og det skal ikke fylles med antatte artsfunn.',
    themes: [
      'fra jord og dyrking til mat',
      'stell og ansvar for domestiserte dyr',
      'sesonger i et urbant gårdsår',
      'næring, avfall og enkle materielle kretsløp',
      'forholdet mellom storbyliv og kunnskap om landbruk',
    ],
    nearby_place_ids: ['kampen_kirke', 'toyen_torg'],
  },
  locatorType: coordinate.locatorType,
  sourceProvider: coordinate.sourceProvider,
  sourceObjectId: coordinate.sourceObjectId,
  address: coordinate.address,
  geocodeAccuracy: coordinate.geocodeAccuracy,
  coordRole: coordinate.coordRole,
  coordStatus: coordinate.coordStatus,
  coordSource: coordinate.coordSource,
  coordSourceId: coordinate.coordSourceId,
  coordSourceUrl: coordinate.coordSourceUrl,
  coordType: coordinate.coordType,
  coordVerifiedAt: coordinate.coordVerifiedAt,
  coordNote: coordinate.coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'Kampen Økologiske Barnebondegård – Om oss',
      url: 'https://kampenbarnebondegard.com/om-oss/',
      lang: 'nb',
      verifiedAt: '2026-07-20',
    },
    {
      type: 'official',
      label: 'Oslo kommune – Kampen økologiske barnebondegård',
      url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/besoksgard-hundepark-og-viltforvaltning/besoksgarder/kampen-okologiske-barnebondegard/',
      lang: 'nb',
      verifiedAt: '2026-07-20',
    },
    {
      type: 'official',
      label: 'Kampen Økologiske Barnebondegård – Historien til gården',
      url: 'https://kampenbarnebondegard.com/historien-til-garden/',
      lang: 'nb',
      verifiedAt: '2026-07-20',
    },
  ],
};

const evidence = {
  placeId,
  placeFile: placePath,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: coordinate.lat,
    lon: coordinate.lon,
    r: coordinate.r,
    coordStatus: coordinate.coordStatus,
    coordSource: coordinate.coordSource,
    coordType: coordinate.coordType,
    coordNote: coordinate.coordNote,
  },
  identity: {
    currentName: placeName,
    resolvedIdentity:
      'The integrated urban child-focused farm site at Skedsmogata 23, including the farmyard, school garden, barn and stable',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'entydig offisielt adressepunkt for Skedsmogata 23',
    'dokumentert identitet som Kampen Økologiske Barnebondegård',
    'eksplisitt skille fra Kampen kirke og Kampen Park-aktivitetene',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'geonorge_adresser_v1',
      sourceUrl: coordinate.coordSourceUrl,
      sourceObjectId: coordinate.sourceObjectId,
      sourceQuality: 'official_address_plus_official_institution_identity',
      finding:
        'Geonorge gir ett tydelig adressetreff for Skedsmogata 23. Gårdens egen nettside og Oslo kommune oppgir samme besøksadresse og beskriver ett integrert gårdssted med gårdstun, skolehage, fjøs og stall.',
      canVerifyCoordinate: true,
      reason: coordinate.coordNote,
    },
  ],
  addressCandidates: [
    {
      address: 'Skedsmogata 23 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: coordinate.sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: coordinate.sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    {
      lat: coordinate.lat,
      lon: coordinate.lon,
      coordRole: coordinate.coordRole,
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction:
      'Applied Skedsmogata 23 as the canonical building/display marker for the integrated Kampen Økologiske Barnebondegård site.',
  },
  notes: [coordinate.coordNote],
};

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

if (existsSync(placePath)) {
  throw new Error(`${placePath} already exists; refusing duplicate production.`);
}

writeJson(placePath, place);
writeJson(evidencePath, evidence);

const placeManifest = JSON.parse(readFileSync(placeManifestPath, 'utf8'));
if (!Array.isArray(placeManifest.files)) {
  throw new Error('data/places/manifest.json has no files array.');
}
if (!placeManifest.files.includes(placeManifestEntry)) {
  placeManifest.files.push(placeManifestEntry);
}
writeJson(placeManifestPath, placeManifest);

const evidenceManifest = JSON.parse(readFileSync(evidenceManifestPath, 'utf8'));
if (!Array.isArray(evidenceManifest.files)) {
  throw new Error('data/coordinate-evidence/manifest.json has no files array.');
}
if (!evidenceManifest.files.includes(evidenceManifestEntry)) {
  evidenceManifest.files.push(evidenceManifestEntry);
}
writeJson(evidenceManifestPath, evidenceManifest);

let protocol = readFileSync(protocolPath, 'utf8');
const tableEndMarker = '\n\nRelevante korrigerende merger';
const tableEnd = protocol.indexOf(tableEndMarker);
if (tableEnd < 0) {
  throw new Error('Could not locate Oslo coordinate table end.');
}
const batchNumbers = [...protocol.slice(0, tableEnd).matchAll(/^\|\s*(\d+)\s*\|/gm)].map(
  (match) => Number(match[1]),
);
if (batchNumbers.length === 0) {
  throw new Error('Could not derive current Oslo coordinate batch number.');
}
const nextBatch = Math.max(...batchNumbers) + 1;

const summaryRegex =
  /Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./;
const summaryMatch = protocol.match(summaryRegex);
if (!summaryMatch) {
  throw new Error('Could not locate Oslo coordinate summary line.');
}
const previousCount = Number(summaryMatch[1]);
const unresolvedCount = Number(summaryMatch[2]);
const newCount = previousCount + 1;
protocol = protocol.replace(
  summaryRegex,
  `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} legger til Kampen Økologiske Barnebondegård som et eget urbant gårds-, lærings- og nærmiljøsted på Skedsmogata 23. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`,
);

const refreshedTableEnd = protocol.indexOf(tableEndMarker);
const tableRow = `| ${nextBatch} | \`${placeId}\` | ${placeName} | verified | \`${coordinate.sourceObjectId}\` |`;
protocol = `${protocol.slice(0, refreshedTableEnd)}\n${tableRow}${protocol.slice(refreshedTableEnd)}`;

const previousBatchParagraphRegex = /Batch 63 \(2026-07-20\)[^\n]*/;
if (!previousBatchParagraphRegex.test(protocol)) {
  throw new Error('Could not locate batch 63 paragraph insertion point.');
}
const newBatchParagraph = `Batch ${nextBatch} (2026-07-20) legger til \`${placeId}\` etter separat adresse- og taxonomy-gate. Det entydige Geonorge-punktet \`${coordinate.sourceObjectId}\` for Skedsmogata 23 brukes som display- og unlock-anker for det integrerte gårdsstedet med gårdstun, skolehage, fjøs og stall. Canonical primærkategori er \`by\` fordi stedet ble skapt som et barnedrevet nærmiljøinitiativ og i dag fungerer som lavterskel møteplass, pedagogisk tilbud og sosial infrastruktur; \`natur\` beholdes som sekundært faglag for dokumentert dyrking, matproduksjon, dyrestell og naturens kretsløp. Husdyrene skal ikke behandles som vill fauna, og stedet skal ikke splittes i overlappende markører.`;
protocol = protocol.replace(
  previousBatchParagraphRegex,
  (match) => `${match}\n\n${newBatchParagraph}`,
);

protocol = protocol.replace(
  /Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\./,
  `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`,
);

writeFileSync(protocolPath, protocol);

console.log(
  JSON.stringify(
    {
      placeId,
      placePath,
      evidencePath,
      previousCount,
      newCount,
      nextBatch,
      coordinateSource: coordinate.sourceObjectId,
    },
    null,
    2,
  ),
);
