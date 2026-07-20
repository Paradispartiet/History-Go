import fs from 'node:fs';

const placeId = 'seilduksfabrikken_nydalen';
const placeName = 'Øvre spinneri';
const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/seilduksfabrikken_nydalen.json';
const evidencePath = 'data/coordinate-evidence/oslo/natur/seilduksfabrikken_nydalen.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';

const coordinate = {
  lat: 59.95542713436375,
  lon: 10.765409433626766,
  coordStatus: 'verified_geometry',
  coordSource: 'kulturminnesok_askeladden',
  coordType: 'building_center',
  coordRole: 'building_center',
  locatorType: 'building',
  sourceProvider: 'manual_research',
  sourceObjectId: 'kulturminnesok:165570-6',
  coordSourceUrl:
    'https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/enkeltminner/items/165570-6?f=json',
  geocodeAccuracy: 'geometric_center',
  coordVerifiedAt: '2026-07-20',
  coordNote:
    'Geometrisk senter for Riksantikvarens offisielle enkeltminne 165570-6, registrert av Byantikvaren i Oslo som «Nydalen Compagnie Bomullsspinneri – Gjerdrums vei 12» og eksplisitt beskrevet som «Spinneri (bygn 108)». Identiteten er kryssjekket mot Oslo byleksikons historiske Øvre Spinderi i Gjerdrums vei 12 og skilles fysisk fra enkeltminne 165570-5, som er registrert som Veveri (bygn 113). Punktet representerer Øvre Spinneri-bygningen, ikke hele Campus G12 eller Nydalens Compagnie-anlegget.',
};

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
function writeJson(path, value) {
  fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const place = readJson(placePath);
place.lat = coordinate.lat;
place.lon = coordinate.lon;
place.coordStatus = coordinate.coordStatus;
place.coordSource = coordinate.coordSource;
place.coordType = coordinate.coordType;
place.coordRole = coordinate.coordRole;
place.locatorType = coordinate.locatorType;
place.sourceProvider = coordinate.sourceProvider;
place.sourceObjectId = coordinate.sourceObjectId;
place.coordSourceUrl = coordinate.coordSourceUrl;
place.geocodeAccuracy = coordinate.geocodeAccuracy;
place.coordVerifiedAt = coordinate.coordVerifiedAt;
place.coordNote = coordinate.coordNote;
writeJson(placePath, place);

const evidence = readJson(evidencePath);
evidence.placeId = placeId;
evidence.placeFile = placePath;
evidence.evidenceStatus = 'applied_to_place';
evidence.coordinateDecision = 'do_not_change_coordinates_yet';
evidence.currentCoordinate = {
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: place.r,
  coordStatus: coordinate.coordStatus,
  coordSource: coordinate.coordSource,
  coordType: coordinate.coordType,
  coordNote: coordinate.coordNote,
};
evidence.identity = {
  currentName: place.name,
  resolvedIdentity:
    'Øvre spinneri / Riksantikvaren enkeltminne 165570-6, Spinneri (bygn 108), Gjerdrums vei 12',
  identityStatus: 'resolved',
  identityProblem: '',
  locatorTypeCandidate: 'building',
  requiresSplit: false,
  splitReason: '',
};
evidence.requiredEvidence = [
  'offisiell fysisk bygningsgeometri for spinneriet i Gjerdrums vei 12',
  'eksplisitt skille mellom spinneribygningen og Veveri A / øvrige fabrikkfløyer',
  'historisk identitetskryssjekk mot Øvre Spinderi i Gjerdrums vei 12',
];
evidence.evidence = [
  {
    sourceProvider: 'official_heritage_registry',
    sourceName: 'Riksantikvaren – Lokaliteter, Enkeltminner og Sikringssoner',
    sourceUrl: coordinate.coordSourceUrl,
    sourceObjectId: coordinate.sourceObjectId,
    sourceQuality: 'official_individual_heritage_object_geometry',
    finding:
      'Riksantikvarens enkeltminne 165570-6 er navngitt «Nydalen Compagnie Bomullsspinneri – Gjerdrums vei 12» og beskrevet av Byantikvaren som «Spinneri (bygn 108)». Det har egen MultiPolygon-geometri med senter 59.95542713436375, 10.765409433626766.',
    canVerifyCoordinate: true,
    reason:
      'Enkeltminnet representerer selve fysiske spinneribygningen og gir et offisielt geometrisk hovedanker.',
  },
  {
    sourceProvider: 'official_local_history_reference',
    sourceName: 'Oslo byleksikon – Gjerdrums vei',
    sourceUrl: 'https://oslobyleksikon.no/side/Gjerdrums_vei',
    sourceObjectId: 'oslobyleksikon:gjerdrums-vei-12:ovre-spinderi',
    sourceQuality: 'authoritative_historical_identity_crosscheck',
    finding:
      'Oslo byleksikon identifiserer Øvre Spinderi med Gjerdrums vei 12 og skiller det fra Væveri A. Riksantikvarens separate enkeltminne 165570-5 er registrert som Veveri (bygn 113), mens 165570-6 er Spinneri (bygn 108).',
    canVerifyCoordinate: false,
    reason:
      'Kilden brukes til identitetskryssjekk; selve koordinaten kommer fra Riksantikvarens bygningsgeometri.',
  },
];
evidence.addressCandidates = [
  {
    address: 'Gjerdrums vei 12 Oslo',
    sourceProvider: 'official_address',
    sourceObjectId: null,
    canApplyToPlace: false,
    note:
      'Dagens Geonorge-register har bokstavadressene 12A–12L, men ingen entydig bare 12. Adresseklyngen brukes derfor ikke som canonical punkt.',
  },
];
evidence.sourceObjectCandidates = [
  {
    sourceProvider: 'official_heritage_registry',
    sourceObjectId: coordinate.sourceObjectId,
    canApplyToPlace: true,
  },
  {
    sourceProvider: 'official_heritage_registry',
    sourceObjectId: 'kulturminnesok:165570-5',
    canApplyToPlace: false,
    note: 'Separat Veveri (bygn 113), ikke Øvre Spinneri.',
  },
];
evidence.geometryCandidates = [
  {
    sourceProvider: 'official_heritage_registry',
    sourceObjectId: coordinate.sourceObjectId,
    lat: coordinate.lat,
    lon: coordinate.lon,
    coordRole: coordinate.coordRole,
    canApplyToPlace: true,
  },
];
evidence.coordinateCandidates = [
  {
    lat: coordinate.lat,
    lon: coordinate.lon,
    coordRole: coordinate.coordRole,
    canApplyToPlace: true,
  },
];
evidence.decision = {
  canBecomeVerified: true,
  blockedReason: '',
  nextAction:
    'Applied the official Riksantikvaren individual-object geometry for Spinneri (bygn 108), 165570-6, as the canonical building center for Øvre spinneri.',
};
evidence.notes = [
  coordinate.coordNote,
  'Tidligere legacy-punkt og eldre researchkandidater er forkastet. De lå i feil del av Nydalen og skal ikke gjenbrukes.',
];
writeJson(evidencePath, evidence);

let protocol = fs.readFileSync(protocolPath, 'utf8');
const tableEndMarker = '\n\nRelevante korrigerende merger';
const tableEnd = protocol.indexOf(tableEndMarker);
if (tableEnd < 0) throw new Error('Could not locate Oslo coordinate table end.');
const batchNumbers = [...protocol.slice(0, tableEnd).matchAll(/^\|\s*(\d+)\s*\|/gm)].map(
  (match) => Number(match[1]),
);
if (!batchNumbers.length) throw new Error('Could not derive current Oslo batch number.');
const nextBatch = Math.max(...batchNumbers) + 1;

const summaryRegex =
  /Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./;
const summaryMatch = protocol.match(summaryRegex);
if (!summaryMatch) throw new Error('Could not locate Oslo summary line.');
const previousCount = Number(summaryMatch[1]);
const previousUnresolved = Number(summaryMatch[2]);
const newCount = previousCount + 1;
const newUnresolved = previousUnresolved - 1;
if (newUnresolved < 0) throw new Error('Unresolved count would become negative.');
protocol = protocol.replace(
  summaryRegex,
  `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${nextBatch} løser Øvre spinneri med Riksantikvarens offisielle enkeltminnegeometri for Spinneri (bygn 108), kulturminne 165570-6. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${newUnresolved}.`,
);

const refreshedTableEnd = protocol.indexOf(tableEndMarker);
const tableRow = `| ${nextBatch} | \`${placeId}\` | Øvre spinneri | verified_geometry | \`${coordinate.sourceObjectId}\` |`;
protocol = `${protocol.slice(0, refreshedTableEnd)}\n${tableRow}${protocol.slice(refreshedTableEnd)}`;

const previousBatchParagraphRegex = /Batch 65 \(2026-07-20\)[^\n]*/;
if (!previousBatchParagraphRegex.test(protocol)) {
  throw new Error('Could not locate batch 65 paragraph insertion point.');
}
const newBatchParagraph = `Batch ${nextBatch} (2026-07-20) løser \`${placeId}\` etter at tidligere legacy-punkt, adressebokstav-korrelasjon og feilplasserte bygningskandidater ble forkastet. Riksantikvarens offentlige enkeltminne \`165570-6\` er registrert av Byantikvaren i Oslo som «Nydalen Compagnie Bomullsspinneri – Gjerdrums vei 12» og eksplisitt som «Spinneri (bygn 108)». Den separate enkeltminnegeometrien \`165570-5\` er «Veveri (bygn 113)», slik at spinneriet og veveriet kan skilles fysisk uten proxy-gjetting. Geometrisk senter for 165570-6 brukes som canonical \`building_center\`; stedet fjernes samtidig fra needs_review-tabellen.`;
protocol = protocol.replace(
  previousBatchParagraphRegex,
  (match) => `${match}\n\n${newBatchParagraph}`,
);

const unresolvedRowRegex = /^\| `seilduksfabrikken_nydalen`[^\n]*\n/m;
if (!unresolvedRowRegex.test(protocol)) {
  throw new Error('Could not locate unresolved Øvre spinneri row.');
}
protocol = protocol.replace(unresolvedRowRegex, '');
protocol = protocol.replace(
  /Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\./,
  `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`,
);

fs.writeFileSync(protocolPath, protocol);

console.log(
  JSON.stringify(
    {
      placeId,
      previousCount,
      newCount,
      previousUnresolved,
      newUnresolved,
      nextBatch,
      sourceObjectId: coordinate.sourceObjectId,
      coordinate: { lat: coordinate.lat, lon: coordinate.lon },
    },
    null,
    2,
  ),
);
