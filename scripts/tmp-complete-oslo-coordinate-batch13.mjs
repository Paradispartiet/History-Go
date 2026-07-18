import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const AGG_REL = 'data/places/by/oslo/places_by.json';
const AGG = path.join(ROOT, AGG_REL);
const SPLIT_DIR = path.join(ROOT, 'data/places/by/oslo/places');
const SPLIT_MANIFEST = path.join(ROOT, 'data/places/by/oslo/places_by_manifest.json');
const SPLIT_INDEX = path.join(ROOT, 'data/places/by/oslo/places_by_index.json');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const REPORT = path.join(ROOT, 'reports/oslo-coordinate-control-batch-13.md');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const replaceRequired = (text, from, to, label) => { if (!text.includes(from)) throw new Error('Mangler forventet tekst: ' + label); return text.replace(from, to); };

const updates = {
  tigeren: {
    lat: 59.91115,
    lon: 10.75032,
    r: 45,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:3578576333',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'display_marker',
    coordType: 'poi_geometry',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 3578576333 – The Tiger',
    coordSourceId: 'osm-node:3578576333',
    coordSourceUrl: 'https://www.openstreetmap.org/node/3578576333',
    coordVerifiedAt: DATE,
    coordNote: 'Presist objektanker for Elena Engelsens tigerstatue på Jernbanetorget. OSM-node 3578576333 identifiserer selve kunstverket; VisitOSLO brukes som uavhengig identitetskontroll av verk, kunstner, plassering og år. Radius er strammet inn slik at markøren representerer skulpturen, ikke hele Jernbanetorget.'
  },
  jernbanetorget: {
    lat: 59.91094,
    lon: 10.75034,
    r: 180,
    locatorType: 'square',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:10576072',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordType: 'square_center',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 10576072 – Jernbanetorget',
    coordSourceId: 'osm-way:10576072',
    coordSourceUrl: 'https://www.openstreetmap.org/way/10576072',
    coordVerifiedAt: DATE,
    coordNote: 'Geometriforankret områdeanker for selve Jernbanetorget foran Oslo S. OSM-way 10576072 identifiserer plassen som eget torgobjekt. Punktet representerer plassgeometrien og holdes adskilt fra Oslo S, tigerstatuen og kollektivholdeplassene.'
  },
  helsfyr: {
    lat: 59.91273,
    lon: 10.80101,
    r: 200,
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:5218231670',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'transit_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 5218231670 – Helsfyr T-banestasjon',
    coordSourceId: 'osm-node:5218231670',
    coordSourceUrl: 'https://www.openstreetmap.org/node/5218231670',
    coordVerifiedAt: DATE,
    coordNote: 'Presist kollektivanker brukt som representativt områdeanker for Helsfyr-knutepunktet og det omkringliggende kontor-/pendlerområdet. OSM-node 5218231670 identifiserer Helsfyr T-banestasjon; punktet hevdes ikke å være et geometrisk sentrum for hele Helsfyr.'
  },
  bogstadveien: {
    locatorType: 'street',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:bogstadveien',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordType: 'street_midpoint',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Bogstadveien + dokumenterte ruteankre',
    coordSourceId: 'oslobyleksikon:bogstadveien',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Bogstadveien',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert linjeanker for Bogstadveien. Oslo byleksikon avgrenser gaten fra Hegdehaugsveien til Sørkedalsveien. History Go beholder hovedpunktet på den sentrale handlestrekningen og de eksisterende ruteankrene ved Majorstuen og Hegdehaugsveien; punktet er ikke et adressepunkt.'
  },
  markveien: {
    locatorType: 'street',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:markveien',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordType: 'street_midpoint',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Markveien + dokumenterte ruteankre',
    coordSourceId: 'oslobyleksikon:markveien',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Markveien',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert linjeanker for Markveien. Oslo byleksikon avgrenser gaten fra Sannergata til Søndre gate. History Go beholder hovedpunktet på den sentrale handelsstrekningen og eksisterende ruteankre mot Nybrua og nordre Grünerløkka; punktet er ikke et adressepunkt.'
  },
  gronlandsleiret: {
    locatorType: 'street',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:gronlandsleiret',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordType: 'street_midpoint',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Grønlandsleiret + dokumenterte ruteankre',
    coordSourceId: 'oslobyleksikon:gronlandsleiret',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Gr%C3%B8nlandsleiret',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert linjeanker for Grønlandsleiret. Oslo byleksikon avgrenser gaten fra Tøyenbekken til Schweigaards gate. History Go beholder hovedpunktet ved den sentrale handelsstrekningen og eksisterende ruteankre i vest og øst; punktet er ikke et adressepunkt.'
  },
  storgata: {
    locatorType: 'street',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:storgata',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordType: 'street_midpoint',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Storgata + dokumenterte ruteankre',
    coordSourceId: 'oslobyleksikon:storgata',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Storgata',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert linjeanker for Storgata. Oslo byleksikon avgrenser gaten fra Dronningens gate ved Kirkeristen til Nybrua. History Go beholder hovedpunktet på den sentrale strekningen og eksisterende ruteankre ved Kirkeristen og Nybrua; punktet er ikke et adressepunkt.'
  }
};

const ids = Object.keys(updates);
const aggregate = readJson(AGG);
for (const [id, update] of Object.entries(updates)) {
  const row = aggregate.find((p) => p?.id === id);
  if (!row) throw new Error('Mangler place i aggregate: ' + id);
  Object.assign(row, update);
  delete row.coordPrecisionM;
}
writeJson(AGG, aggregate);

for (const [id, update] of Object.entries(updates)) {
  const file = path.join(SPLIT_DIR, id + '.json');
  const row = readJson(file);
  Object.assign(row, update);
  delete row.coordPrecisionM;
  writeJson(file, row);
}

const splitManifest = readJson(SPLIT_MANIFEST);
splitManifest.source_sha256 = sha256(AGG);
splitManifest.generated_at = new Date().toISOString();
for (const entry of splitManifest.places || []) {
  if (!updates[entry.id]) continue;
  entry.sha256 = sha256(path.join(path.dirname(SPLIT_MANIFEST), entry.file));
}
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
for (const id of ids) {
  const row = splitIndex.find((p) => p?.id === id);
  const source = aggregate.find((p) => p?.id === id);
  if (!row || !source) throw new Error('Mangler by-index/source for ' + id);
  for (const key of ['lat', 'lon', 'r', 'coordType', 'coordStatus']) row[key] = source[key];
}
writeJson(SPLIT_INDEX, splitIndex);

const evidenceDefs = {
  tigeren: ['oslo/by/tigeren.json', 'Tigerstatuen', 'Elena Engelsens tigerstatue på Jernbanetorget', 'OpenStreetMap node 3578576333 identifiserer selve kunstverket; VisitOSLO dokumenterer identitet, kunstner, plassering og år.'],
  jernbanetorget: ['oslo/by/jernbanetorget.json', 'Jernbanetorget', 'selve plassrommet foran Oslo S', 'OpenStreetMap way 10576072 identifiserer Jernbanetorget som eget place=square-objekt.'],
  helsfyr: ['oslo/by/helsfyr.json', 'Helsfyr', 'Helsfyr-knutepunktet med T-banestasjonen som representativt områdeanker', 'OpenStreetMap node 5218231670 identifiserer Helsfyr T-banestasjon, som brukes eksplisitt som områdeanker for det bredere knutepunktet.'],
  bogstadveien: ['oslo/by/bogstadveien.json', 'Bogstadveien', 'Bogstadveien fra Hegdehaugsveien til Sørkedalsveien', 'Oslo byleksikon dokumenterer gateutstrekningen; History Go har eksisterende ruteankre i begge ender av den modellerte handlegaten.'],
  markveien: ['oslo/by/markveien.json', 'Markveien', 'Markveien fra Sannergata til Søndre gate', 'Oslo byleksikon dokumenterer gateutstrekningen; History Go har eksisterende ruteankre i sør og nord.'],
  gronlandsleiret: ['oslo/by/gronlandsleiret.json', 'Grønlandsleiret', 'Grønlandsleiret fra Tøyenbekken til Schweigaards gate', 'Oslo byleksikon dokumenterer gateutstrekningen; History Go har eksisterende ruteankre for begge ender.'],
  storgata: ['oslo/by/storgata.json', 'Storgata', 'Storgata fra Dronningens gate ved Kirkeristen til Nybrua', 'Oslo byleksikon dokumenterer gateutstrekningen; History Go har eksisterende ruteankre ved Kirkeristen og Nybrua.']
};

for (const id of ids) {
  const place = aggregate.find((p) => p?.id === id);
  const d = evidenceDefs[id];
  writeJson(path.join(EVIDENCE_ROOT, d[0]), {
    placeId: id,
    placeFile: AGG_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: d[1], resolvedIdentity: d[2], identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'fysisk avgrensning mot nærliggende canonical steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: 'stable_object_or_extent', finding: d[3], canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' },
    notes: [place.coordNote]
  });
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const d of Object.values(evidenceDefs)) if (!evidenceManifest.files.includes(d[0])) evidenceManifest.files.push(d[0]);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = replaceRequired(protocol,
  'Oslo-tabellen inneholder nå 70 verifiserte eller kildekontrollerte canonical steder. Batch 12 omfatter sju fullførte kontroller: fem nye godkjente områdeankre og to ruteobjekter som står dokumentert som `needs_review` fordi dagens datamodell mangler traségeometri. Totalt står fire fullførte Oslo-kontroller separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo-tabellen inneholder nå 77 verifiserte eller kildekontrollerte canonical steder. Batch 13 legger til sju godkjente kontroller: tre presise objekt-/områdeankre for Tigeren, Jernbanetorget og Helsfyr, samt fire dokumenterte flerankrede gater. Fire fullførte Oslo-kontroller står fortsatt separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo summary');

const last = '| 12 | `aker_brygge` | Aker Brygge | verified_geometry | `oslo-kommune:fjordbyen:aker-brygge` |';
const rows = [
  '| 13 | `tigeren` | Tigerstatuen | verified_geometry | `osm-node:3578576333` |',
  '| 13 | `jernbanetorget` | Jernbanetorget | verified_geometry | `osm-way:10576072` |',
  '| 13 | `helsfyr` | Helsfyr | verified_geometry | `osm-node:5218231670` |',
  '| 13 | `bogstadveien` | Bogstadveien | verified_geometry | `oslobyleksikon:bogstadveien` |',
  '| 13 | `markveien` | Markveien | verified_geometry | `oslobyleksikon:markveien` |',
  '| 13 | `gronlandsleiret` | Grønlandsleiret | verified_geometry | `oslobyleksikon:gronlandsleiret` |',
  '| 13 | `storgata` | Storgata | verified_geometry | `oslobyleksikon:storgata` |'
].join('\n');
protocol = replaceRequired(protocol, last, last + '\n' + rows, 'batch 13 rows');
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 70 verifiserte eller kildekontrollerte canonical stedene.', 'Disse kontrollene er fullført, men teller ikke blant de 77 verifiserte eller kildekontrollerte canonical stedene.');
protocol = replaceRequired(protocol,
  '- Neste nye Oslo-kontroll er nummer 73 og starter batch 13.\n- Batch 12 er fullført med fem godkjente områdeankre og to dokumenterte ruteobjekter som krever egen rutemodell.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  '- Neste nye Oslo-kontroll er nummer 80 og starter batch 14.\n- Batch 13 er fullført med sju godkjente objekt-, område- og linjeankre.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  'next work');
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 13\n\nDato: ${DATE}\n\n## Resultat\n\nSju nye canonical Oslo-steder er kontrollert og godkjent. Tre grove eller uavklarte punktankre er erstattet med presise kildeobjekter; fire lineære gater beholder dagens hovedpunkt og eksisterende ruteankre, men får full v1-kildekontrakt.\n\n| placeId | status | kildeobjekt | koordinatbeslutning |\n|---|---|---|---|\n| \`tigeren\` | verified_geometry | \`osm-node:3578576333\` | Flyttet til OSM-noden for selve skulpturen; radius strammet til 45 m. |\n| \`jernbanetorget\` | verified_geometry | \`osm-way:10576072\` | Grovt torgpunkt erstattet med geometriforankret plassanker. |\n| \`helsfyr\` | verified_geometry | \`osm-node:5218231670\` | Presis T-banestasjon brukes eksplisitt som områdeanker for knutepunktet. |\n| \`bogstadveien\` | verified_geometry | \`oslobyleksikon:bogstadveien\` | Hovedpunkt beholdt; eksisterende ruteankre + dokumentert gateutstrekning. |\n| \`markveien\` | verified_geometry | \`oslobyleksikon:markveien\` | Hovedpunkt beholdt; eksisterende ruteankre + dokumentert gateutstrekning. |\n| \`gronlandsleiret\` | verified_geometry | \`oslobyleksikon:gronlandsleiret\` | Hovedpunkt beholdt; eksisterende ruteankre + dokumentert gateutstrekning. |\n| \`storgata\` | verified_geometry | \`oslobyleksikon:storgata\` | Hovedpunkt beholdt; eksisterende ruteankre + dokumentert gateutstrekning. |\n\n## Kilder\n\n- OpenStreetMap node 3578576333 – The Tiger: https://www.openstreetmap.org/node/3578576333\n- VisitOSLO – Tigeren på Jernbanetorget: https://www.visitoslo.com/no/produkt/?name=Tigeren-pa-Jernbanetorget&tlp=2992313\n- OpenStreetMap way 10576072 – Jernbanetorget: https://www.openstreetmap.org/way/10576072\n- OpenStreetMap node 5218231670 – Helsfyr: https://www.openstreetmap.org/node/5218231670\n- Oslo byleksikon – Bogstadveien: https://oslobyleksikon.no/side/Bogstadveien\n- Oslo byleksikon – Markveien: https://oslobyleksikon.no/side/Markveien\n- Oslo byleksikon – Grønlandsleiret: https://oslobyleksikon.no/side/Gr%C3%B8nlandsleiret\n- Oslo byleksikon – Storgata: https://oslobyleksikon.no/side/Storgata\n`);

console.log('Completed Oslo coordinate batch 13');
