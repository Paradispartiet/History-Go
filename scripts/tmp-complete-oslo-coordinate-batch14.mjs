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
const REPORT = path.join(ROOT, 'reports/oslo-coordinate-control-batch-14.md');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const replaceRequired = (text, from, to, label) => { if (!text.includes(from)) throw new Error('Mangler forventet tekst: ' + label); return text.replace(from, to); };

const updates = {
  slottsparken: {
    locatorType: 'park',
    sourceProvider: 'manual_research',
    sourceObjectId: 'royalcourt:palace-park',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'park_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Det kongelige hoff – Slottsparken',
    coordSourceId: 'royalcourt:palace-park',
    coordSourceUrl: 'https://www.royalcourt.no/the-royal-residences/the-royal-palace/the-palace-park',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker inne i Slottsparken. Det kongelige hoff dokumenterer parken som det sammenhengende parklandskapet rundt Slottet. Punktet beholdes i den sørlige parkdelen og brukes som parkanker, ikke som et geometrisk sentrum eller som koordinat for selve Slottet.'
  },
  botsparken: {
    lat: 59.909607,
    lon: 10.768977,
    r: 170,
    locatorType: 'park',
    sourceProvider: 'manual_research',
    sourceObjectId: 'lokalhistoriewiki:gronlands-park',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'park_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Lokalhistoriewiki – Grønlands park / Botsparken',
    coordSourceId: 'lokalhistoriewiki:gronlands-park',
    coordSourceUrl: 'https://lokalhistoriewiki.no/wiki/Gr%C3%B8nlands_park',
    coordVerifiedAt: DATE,
    coordNote: 'Kildebasert områdeanker i Grønlands park, også kjent som Botsparken. Lokalhistoriewiki avgrenser parken mellom Botsfengselet, Grønlandsleiret, Borggata og Åkebergveien og oppgir koordinaten som brukes her. Punktet representerer parkrommet, ikke fengselet eller Politihuset.'
  },
  stensparken: {
    locatorType: 'park',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:parks:stensparken',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'park_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – parker og lekeplasser / Stensparken',
    coordSourceId: 'oslo-kommune:parks:stensparken',
    coordSourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker inne i Stensparken. Oslo kommunes parkoversikt identifiserer Stensparken, mens tidligere visuell kartkontroll plasserte dagens punkt inne i den faktiske grønne parkflaten. Punktet brukes som parkanker og ikke som et matematisk sentrum for hele parken.'
  },
  nydalen: {
    locatorType: 'linear_area',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:nydalen',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Nydalen',
    coordSourceId: 'oslobyleksikon:nydalen',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Nydalen',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker for Nydalen som industri-, nærings-, utdannings- og boligområde langs Akerselva. Oslo byleksikon dokumenterer områdets identitet og utstrekning. Punktet beholdes som displayanker i den sentrale transformasjonssonen og er ikke en enkeltadresse.'
  },
  tjuvholmen: {
    locatorType: 'linear_area',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:fjordbyen:tjuvholmen',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – Fjordbyen: Tjuvholmen',
    coordSourceId: 'oslo-kommune:fjordbyen:tjuvholmen',
    coordSourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/tjuvholmen/',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker på selve Tjuvholmen. Oslo kommune dokumenterer Tjuvholmen som et avgrenset Fjordby-område som strekker seg ut i fjorden fra Aker Brygge. Punktet beholdes ved kultur-, promenade- og badeområdet og brukes ikke som én enkelt adresse.'
  },
  sorenga: {
    locatorType: 'linear_area',
    sourceProvider: 'municipality',
    sourceObjectId: 'oslo-kommune:bjorvika:sorenga',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – Fjordbyen: Bjørvika / Sørenga',
    coordSourceId: 'oslo-kommune:bjorvika:sorenga',
    coordSourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/bjorvika/',
    coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker for Sørenga som eget sjøfront-, bolig- og badeområde innenfor den større Bjørvika-transformasjonen. Punktet beholdes på Sørengautstikkeren og skiller stedet fra det bredere canonical Bjørvika-ankeret.'
  },
  majorstuen_tbanestasjon: {
    lat: 59.93078,
    lon: 10.71404,
    r: 120,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:2274012035',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'display_marker',
    coordType: 'transit_stop_geometry',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 2274012035 – Majorstuen',
    coordSourceId: 'osm-node:2274012035',
    coordSourceUrl: 'https://www.openstreetmap.org/node/2274012035',
    coordVerifiedAt: DATE,
    coordNote: 'Presist stoppobjekt for Majorstuen T-banestasjon. OSM-node 2274012035 er tagget som kollektivt stoppunkt / railway halt, og Ruter dokumenterer Majorstuen som et sentralt T-baneknutepunkt. Punktet representerer stasjonen og holdes adskilt fra det bredere `majorstuen_krysset`-området.'
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
  slottsparken: ['oslo/by/slottsparken.json', 'Slottsparken', 'det sammenhengende parklandskapet rundt Det kongelige slott', 'Det kongelige hoff dokumenterer Slottsparken som en stor, offentlig park som omgir Slottet.'],
  botsparken: ['oslo/by/botsparken.json', 'Botsparken', 'Grønlands park / Botsparken mellom Botsfengselet, Grønlandsleiret, Borggata og Åkebergveien', 'Lokalhistoriewiki avgrenser parkrommet og oppgir det kildepunktet som brukes som representativt parkanker.'],
  stensparken: ['oslo/by/stensparken.json', 'Stensparken', 'Stensparken som høydepark på Fagerborg', 'Oslo kommunes parkoversikt identifiserer Stensparken; tidligere visuell kontroll plasserer dagens hovedpunkt inne i parkflaten.'],
  nydalen: ['oslo/by/nydalen.json', 'Nydalen', 'Nydalen som transformert industri-, nærings-, utdannings- og boligområde langs Akerselva', 'Oslo byleksikon dokumenterer Nydalens områdeidentitet og transformasjon fra industriområde til blandet byområde.'],
  tjuvholmen: ['oslo/by/tjuvholmen.json', 'Tjuvholmen', 'Tjuvholmen som avgrenset Fjordby-delområde ytterst ved Aker Brygge', 'Oslo kommune dokumenterer Tjuvholmen som et 51 dekar stort Fjordby-område som strekker seg ut i fjorden.'],
  sorenga: ['oslo/by/sorenga.json', 'Sørenga', 'Sørenga som sjøfront-, bolig- og badeområde innenfor Bjørvika', 'Oslo kommune dokumenterer Sørenga som del av Bjørvika/Fjordbyen; History Go modellerer Sørenga som et eget underområde med eget fysisk og funksjonelt anker.'],
  majorstuen_tbanestasjon: ['oslo/by/majorstuen_tbanestasjon.json', 'Majorstuen T-banestasjon', 'Majorstuen T-banestasjon som eget kollektivt stoppobjekt', 'OpenStreetMap node 2274012035 identifiserer kollektivstoppet; Ruter dokumenterer Majorstuen som sentralt T-baneknutepunkt.']
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
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'tydelig avgrensning mot nærliggende canonical steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: 'stable_object_or_area_definition', finding: d[3], canVerifyCoordinate: true, reason: place.coordNote }],
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
  'Oslo-tabellen inneholder nå 77 verifiserte eller kildekontrollerte canonical steder. Batch 13 legger til sju godkjente kontroller: tre presise objekt-/områdeankre for Tigeren, Jernbanetorget og Helsfyr, samt fire dokumenterte flerankrede gater. Fire fullførte Oslo-kontroller står fortsatt separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo-tabellen inneholder nå 84 verifiserte eller kildekontrollerte canonical steder. Batch 14 legger til sju godkjente kontroller: tre parker, tre større områdeankre og Majorstuen T-banestasjon som presist kollektivobjekt. Fire fullførte Oslo-kontroller står fortsatt separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo summary');

const last = '| 13 | `storgata` | Storgata | verified_geometry | `oslobyleksikon:storgata` |';
const rows = [
  '| 14 | `slottsparken` | Slottsparken | verified_geometry | `royalcourt:palace-park` |',
  '| 14 | `botsparken` | Botsparken | verified_geometry | `lokalhistoriewiki:gronlands-park` |',
  '| 14 | `stensparken` | Stensparken | verified_geometry | `oslo-kommune:parks:stensparken` |',
  '| 14 | `nydalen` | Nydalen | verified_geometry | `oslobyleksikon:nydalen` |',
  '| 14 | `tjuvholmen` | Tjuvholmen | verified_geometry | `oslo-kommune:fjordbyen:tjuvholmen` |',
  '| 14 | `sorenga` | Sørenga | verified_geometry | `oslo-kommune:bjorvika:sorenga` |',
  '| 14 | `majorstuen_tbanestasjon` | Majorstuen T-banestasjon | verified_geometry | `osm-node:2274012035` |'
].join('\n');
protocol = replaceRequired(protocol, last, last + '\n' + rows, 'batch 14 rows');
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 77 verifiserte eller kildekontrollerte canonical stedene.', 'Disse kontrollene er fullført, men teller ikke blant de 84 verifiserte eller kildekontrollerte canonical stedene.');
protocol = replaceRequired(protocol,
  '- Neste nye Oslo-kontroll er nummer 80 og starter batch 14.\n- Batch 13 er fullført med sju godkjente objekt-, område- og linjeankre.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  '- Neste nye Oslo-kontroll er nummer 87 og starter batch 15.\n- Batch 14 er fullført med sju godkjente park-, område- og kollektivankre.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  'next work');
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 14\n\nDato: ${DATE}\n\n## Resultat\n\nSju nye canonical Oslo-steder er kontrollert og godkjent. Park- og områdeobjektene får full v1-kildekontrakt som eksplisitte områdeankre; Majorstuen T-banestasjon får et presist OSM-stoppobjekt.\n\n| placeId | status | kildeobjekt | koordinatbeslutning |\n|---|---|---|---|\n| \`slottsparken\` | verified_geometry | \`royalcourt:palace-park\` | Eksisterende parkpunkt beholdt som eksplisitt områdeanker. |\n| \`botsparken\` | verified_geometry | \`lokalhistoriewiki:gronlands-park\` | Punkt finjustert til kildeoppgitt koordinat inne i parkrommet. |\n| \`stensparken\` | verified_geometry | \`oslo-kommune:parks:stensparken\` | Eksisterende visuelt kontrollerte parkpunkt beholdt. |\n| \`nydalen\` | verified_geometry | \`oslobyleksikon:nydalen\` | Eksisterende sentrale områdeanker beholdt. |\n| \`tjuvholmen\` | verified_geometry | \`oslo-kommune:fjordbyen:tjuvholmen\` | Eksisterende områdeanker på selve Tjuvholmen beholdt. |\n| \`sorenga\` | verified_geometry | \`oslo-kommune:bjorvika:sorenga\` | Eksisterende Sørenga-anker beholdt og avgrenset mot bredere Bjørvika. |\n| \`majorstuen_tbanestasjon\` | verified_geometry | \`osm-node:2274012035\` | Flyttet til presist OSM-stoppobjekt; radius strammet til 120 m. |\n\n## Kilder\n\n- Det kongelige hoff – Slottsparken: https://www.royalcourt.no/the-royal-residences/the-royal-palace/the-palace-park\n- Lokalhistoriewiki – Grønlands park: https://lokalhistoriewiki.no/wiki/Gr%C3%B8nlands_park\n- Oslo kommune – parker og lekeplasser: https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/\n- Oslo byleksikon – Nydalen: https://oslobyleksikon.no/side/Nydalen\n- Oslo kommune – Tjuvholmen: https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/tjuvholmen/\n- Oslo kommune – Bjørvika/Sørenga: https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/bjorvika/\n- OpenStreetMap node 2274012035 – Majorstuen: https://www.openstreetmap.org/node/2274012035\n- Ruter – kollektivhistorien om Majorstuen: https://ruter.no/om-oss/kollektivhistorien/i-ord-og-bilder-majorstuen\n`);

console.log('Completed Oslo coordinate batch 14');
