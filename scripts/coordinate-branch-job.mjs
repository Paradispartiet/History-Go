import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-attractions-vikaterrassen-intake';
const ID = 'vikaterrassen';
const SOURCE_OBJECT = 'osm-relation:14169568';
const PLACE = 'data/places/by/oslo/places/vikaterrassen.json';
const PLACE_ENTRY = 'places/by/oslo/places/vikaterrassen.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/by/vikaterrassen.json';
const EVIDENCE_ENTRY = 'oslo/by/vikaterrassen.json';
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/vikaterrassen';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const rowsFrom = (data) => Array.isArray(data)
  ? data
  : Array.isArray(data?.places)
    ? data.places
    : Array.isArray(data?.items)
      ? data.items
      : data?.id
        ? [data]
        : [];

for (const entry of readJson(PLACE_MANIFEST).files || []) {
  const rel = `data/${entry}`;
  if (!fs.existsSync(abs(rel))) continue;
  if (rowsFrom(readJson(rel)).some((row) => row?.id === ID)) {
    throw new Error(`${ID}: active place already exists in ${rel}`);
  }
}
if (fs.existsSync(abs(PLACE)) || fs.existsSync(abs(EVIDENCE))) {
  throw new Error(`${ID}: target place/evidence files already exist`);
}

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
for (const fileName of ['README.md', 'decision.json', 'nominatim-searches.json']) {
  const rel = `${REPORT_DIR}/${fileName}`;
  const content = execFileSync('git', ['show', `FETCH_HEAD:${rel}`], { encoding: 'utf8' });
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), content);
}

const intake = readJson(`${REPORT_DIR}/decision.json`);
const selected = intake.selectedCandidate;
if (intake.status !== 'verified_object_candidate') {
  throw new Error(`Vikaterrassen intake is not production-ready: ${intake.status}`);
}
if (selected?.osm_type !== 'relation' || Number(selected?.osm_id) !== 14169568 || selected?.type !== 'pedestrian') {
  throw new Error('Vikaterrassen intake does not resolve the expected pedestrian relation 14169568');
}
if (selected?.geojson?.type !== 'Polygon') {
  throw new Error(`Expected Polygon geometry for Vikaterrassen, got ${selected?.geojson?.type}`);
}

const lat = Number(selected.lat);
const lon = Number(selected.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('Invalid Vikaterrassen representative point');

const coordNote = 'Geometriforankret områdeanker fra OpenStreetMap relation 14169568, som navngir og avgrenser Vikaterrassen som et eget pedestrian-område. Representasjonspunktet ligger inne i den verifiserte polygongeometrien og brukes som display- og unlock-anker for selve gågaten/byrommet. Radiusen dekker Vikaterrassens kjerne uten å bruke ett tilfeldig adressepunkt som proxy for hele komplekset, og skal ikke forveksles med det separate historiske komplekset Victoria terrasse ovenfor.';

const place = {
  id: ID,
  name: 'Vikaterrassen',
  lat,
  lon,
  r: 130,
  category: 'by',
  year: 1964,
  desc: 'Bilfri gågate og butikkompleks i Vika, utviklet der Ruseløkkbasarene tidligere lå. Første byggetrinn åpnet i 1964, anlegget ble utvidet fram mot 1972 og Vikaterrassen ble senere rehabilitert og gjenåpnet som bilfritt byrom i 2018.',
  popupDesc: 'Vikaterrassen ligger i skråningen nedenfor Victoria terrasse og er et eget byrom, ikke bare et annet navn på det eldre leiegårdskomplekset ovenfor. Stedet ble utviklet etter arkitektkonkurransen om 7. juni-plassen i 1960, da Ruseløkkbasarene ble revet. Ruseløkkveien 3 ble innviet i 1964, byggetrinnet i nummer 5 stod ferdig i 1968, og anlegget mot 7. juni-plassen ble fullført i 1972.\n\nI 2010-årene ble området bygget om på nytt. Vikaterrassen ble gjenåpnet i 2018 som bilfri gågate og et kuratert byrom for handel, servering, tjenester og opphold. Stedet viser dermed flere lag av Vikas byhistorie: 1800-tallets Ruseløkka og basarer, etterkrigstidens modernistiske byfornyelse og dagens fotgjengerorienterte, kommersielle sentrum. History Go bruker den navngitte OSM-polygonen for selve Vikaterrassen som fysisk anker, ikke et tilfeldig punkt i Ruseløkkveien.',
  emne_ids: [
    'em_by_gateliv_kantsoner',
    'em_by_uteservering_kommersielt_byliv',
    'em_by_historiske_lag_i_hverdagsrom',
    'em_by_transformasjon_ombruk'
  ],
  quiz_profile: {
    place_type: 'gaagate_og_butikkompleks',
    subtype: 'etterkrigsmodernisme_omformet_til_bilfritt_kommersielt_byrom',
    signature_features: [
      'butikkompleks utviklet i etapper fra 1964 til 1972',
      'ligger nedenfor og er fysisk forskjellig fra Victoria terrasse',
      'gjenåpnet som bilfri gågate og oppholdsrom i 2018'
    ],
    primary_angles: [
      'historisk_endring',
      'byfornyelse',
      'gateliv',
      'kommersielt_byliv',
      'gangby'
    ],
    question_families: [
      'historisk_endring',
      'gjenkjenning',
      'bruk',
      'romlig_lesning',
      'kontrast'
    ],
    avoid_angles: [
      'forveksle_med_victoria_terrasse',
      'generisk_handlegate',
      'anta_at_dagens_bilfrie_form_er_uendret_siden_1964'
    ],
    must_include: [
      'overgangen fra Ruseløkkbasarene til Vikaterrassen',
      'utbyggingen i etapper fra 1964 til 1972',
      'omformingen til bilfritt byrom og gågate i 2010-årene'
    ],
    contrast_targets: [
      'victoria_terrasse',
      'aker_brygge',
      'torggata'
    ],
    notes: 'Spørsmål skal behandle Vikaterrassen som et konkret gågate-/byromskompleks med flere historiske lag. Victoria terrasse er et separat bygningskompleks og må ikke brukes som synonym.'
  },
  locatorType: 'pedestrian_area',
  sourceProvider: 'osm',
  sourceObjectId: SOURCE_OBJECT,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap relation 14169568 – Vikaterrassen',
  coordSourceId: SOURCE_OBJECT,
  coordSourceUrl: 'https://www.openstreetmap.org/relation/14169568',
  coordType: 'area_center',
  coordVerifiedAt: '2026-07-20',
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'Vikaterrassen – om Vikaterrassen',
      url: 'https://www.vikaterrassen.no/om-vikaterassen/',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'reference',
      label: 'Oslo byleksikon – Vikaterrassen',
      url: 'https://oslobyleksikon.no/side/Vikaterrassen',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'reference',
      label: 'VisitOSLO – Vikaterrassen',
      url: 'https://www.visitoslo.com/no/produkt/?name=Vikaterrassen&tlp=3100983',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'map',
      label: 'OpenStreetMap – Vikaterrassen relation 14169568',
      url: 'https://www.openstreetmap.org/relation/14169568',
      lang: 'en',
      verifiedAt: '2026-07-20'
    }
  ]
};
writeJson(PLACE, place);

const bbox = selected.boundingbox?.map(Number) ?? [];
const evidence = {
  placeId: ID,
  placeFile: PLACE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat,
    lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote
  },
  identity: {
    currentName: 'Vikaterrassen',
    resolvedIdentity: 'Det navngitte bilfrie gågate- og butikkomplekset i Ruseløkkveien 3–5 nedenfor Victoria terrasse',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'pedestrian_area',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'eksakt navngitt fysisk kartobjekt for selve Vikaterrassen',
    'polygongeometri som dekker gågate-/kompleksområdet',
    'offisiell identitets- og adressekontekst',
    'eksplisitt avgrensning mot Victoria terrasse'
  ],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap relation 14169568 – Vikaterrassen',
      sourceUrl: 'https://www.openstreetmap.org/relation/14169568',
      sourceObjectId: SOURCE_OBJECT,
      sourceQuality: 'stable_object_or_area_definition',
      finding: 'OSM relation 14169568 er én eksakt navngitt pedestrian-relation for Vikaterrassen og leverer polygongeometri som samsvarer med det bilfrie gågate-/byromskomplekset. Offisielle Vikaterrassen-kilder og Oslo byleksikon identifiserer samme sted ved Ruseløkkveien 3–5 og skiller det fra Victoria terrasse.',
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [
    {
      address: 'Ruseløkkveien 3–5, 0251 Oslo',
      sourceProvider: 'official_site',
      sourceObjectId: null,
      canApplyToPlace: false,
      note: 'Brukes som identitets- og besøkskontekst, ikke som enkeltpunkt for et områdeobjekt som spenner over flere adresser.'
    }
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: SOURCE_OBJECT,
      canApplyToPlace: true
    }
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: SOURCE_OBJECT,
      geometryType: selected.geojson.type,
      boundingBox: bbox,
      canApplyToPlace: true
    }
  ],
  coordinateCandidates: [
    {
      lat,
      lon,
      coordRole: 'area_anchor',
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Bruk representasjonspunktet fra den eksakt navngitte OSM-relationen som canonical area/display anchor. Behold hele polygonet som kildegrunnlag og ikke erstatt det med ett enkelt adressepunkt.'
  },
  notes: [
    coordNote,
    'Vikaterrassen og Victoria terrasse er separate fysiske og historiske objekter. En eventuell framtidig Victoria terrasse-record skal ha eget bygningsanker og må ikke slås sammen med Vikaterrassen.'
  ]
};
writeJson(EVIDENCE, evidence);

const placeManifest = readJson(PLACE_MANIFEST);
if (placeManifest.files.includes(PLACE_ENTRY)) throw new Error(`${PLACE_ENTRY}: already registered`);
placeManifest.files.push(PLACE_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (evidenceManifest.files.includes(EVIDENCE_ENTRY)) throw new Error(`${EVIDENCE_ENTRY}: already registered`);
evidenceManifest.files.push(EVIDENCE_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
let lines = protocol.split('\n');
const correctionHeading = 'Relevante korrigerende merger for de første Oslo-batchene: `a39747039` (siste visuelle Oslo-kontroll) og `91c7a74e4` (Tronsmo runtime/kilde-korrigering).';
const summaryIndex = lines.findIndex((line) => line.startsWith('Oslo-tabellen inneholder nå '));
const headerIndex = lines.findIndex((line) => line === '| batch | placeId | navn | godkjent status | kildeobjekt |');
const tableEndIndex = lines.findIndex((line, index) => index > headerIndex && line === correctionHeading);
if (summaryIndex < 0 || headerIndex < 0 || tableEndIndex < 0) throw new Error('Could not resolve the Oslo protocol structure');

const summaryMatch = lines[summaryIndex].match(/^Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
const unresolvedMatch = lines[summaryIndex].match(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
if (!summaryMatch || !unresolvedMatch) throw new Error('Could not parse current Oslo protocol counts');
const oldCount = Number(summaryMatch[1]);
const newCount = oldCount + 1;
const unresolvedCount = Number(unresolvedMatch[1]);

const batchRows = [];
for (let i = headerIndex + 2; i < tableEndIndex; i += 1) {
  const match = lines[i].match(/^\| (\d+) \| `([^`]+)` \|/);
  if (match) batchRows.push({ index: i, batchNo: Number(match[1]), placeId: match[2] });
}
if (!batchRows.length) throw new Error('Could not parse Oslo coordinate batch rows');
if (batchRows.some((row) => row.placeId === ID)) throw new Error(`${ID}: already recorded in Oslo coordinate table`);
const batchNo = Math.max(...batchRows.map((row) => row.batchNo)) + 1;
const lastRowIndex = Math.max(...batchRows.map((row) => row.index));
const vikaterrassenRow = `| ${batchNo} | \`${ID}\` | Vikaterrassen | verified_geometry | \`${SOURCE_OBJECT}\` |`;
lines.splice(lastRowIndex + 1, 0, vikaterrassenRow);
lines[summaryIndex] = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batchNo} legger til Vikaterrassen som et eget geometriforankret gågate- og byromskompleks, med OpenStreetMap relation 14169568 som polygonkilde og representasjonsanker. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`;
protocol = lines.join('\n');

const narrative = `Batch ${batchNo} (2026-07-20) legger til \`${ID}\` som et eget geometriforankret byrom. OpenStreetMap relation 14169568 navngir og avgrenser Vikaterrassen som pedestrian-område og gir representasjonspunktet ${lat}, ${lon}; dette brukes som area-, display- og unlock-anker. Offisielle Vikaterrassen-kilder og Oslo byleksikon identifiserer stedet som butikkomplekset og gågaten ved Ruseløkkveien 3–5, utviklet i etapper fra 1964 til 1972 og gjenåpnet som bilfritt byrom i 2018. Vikaterrassen er fysisk og historisk forskjellig fra Victoria terrasse ovenfor og skal ikke samles under samme place-id.`;
if (!protocol.includes(narrative)) {
  const protocolLines = protocol.split('\n');
  const duplicateIndex = protocolLines.findIndex((line) => line.startsWith('Duplikatmigrering ('));
  const needsReviewIndex = protocolLines.findIndex((line) => line.startsWith('## Oslo') && line.includes('needs_review'));
  const insertionIndex = duplicateIndex >= 0 ? duplicateIndex : needsReviewIndex;
  if (insertionIndex < 0) throw new Error('Could not find narrative insertion boundary');
  protocolLines.splice(insertionIndex, 0, narrative, '');
  protocol = protocolLines.join('\n');
}

protocol = protocol.replace(
  /Disse kontrollene er fullført, men teller ikke blant de (\d+) verifiserte eller kildekontrollerte canonical Oslo-stedene\./,
  `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);

const finalLines = protocol.split('\n');
const finalHeader = finalLines.findIndex((line) => line === '| batch | placeId | navn | godkjent status | kildeobjekt |');
const finalEnd = finalLines.findIndex((line, index) => index > finalHeader && line === correctionHeading);
const finalRow = finalLines.findIndex((line, index) => index > finalHeader && index < finalEnd && line === vikaterrassenRow);
if (finalRow < 0) throw new Error('Vikaterrassen row was not inserted into the Oslo coordinate table');
if (!finalLines.includes(correctionHeading)) throw new Error('Oslo protocol correction heading was corrupted');

fs.writeFileSync(abs(PROTOCOL), protocol);
console.log(JSON.stringify({
  ok: true,
  placeId: ID,
  batchNo,
  sourceObjectId: SOURCE_OBJECT,
  coordinate: { lat, lon },
  radius: place.r,
  geometryType: selected.geojson.type,
  controlledPlaces: newCount,
  unresolvedCount
}, null, 2));
