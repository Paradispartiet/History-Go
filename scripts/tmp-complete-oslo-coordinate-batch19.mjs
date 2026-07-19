import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-19');
const REPORT = path.join(REPORT_DIR, 'README.md');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');

const HISTORY_REL = 'data/places/historie/oslo/places_historie.json';
const HISTORY = path.join(ROOT, HISTORY_REL);
const HISTORY_SPLIT_DIR = path.join(ROOT, 'data/places/historie/oslo/places_historie');
const HISTORY_MANIFEST = path.join(ROOT, 'data/places/historie/oslo/places_historie_manifest.json');
const HISTORY_INDEX = path.join(ROOT, 'data/places/historie/oslo/places_historie_index.json');

const ADDED_REL = 'data/places/historie/oslo/places_historie_added_batch_01.json';
const ADDED = path.join(ROOT, ADDED_REL);
const ADDED_SPLIT_DIR = path.join(ROOT, 'data/places/historie/oslo/places_historie_added_batch_01');
const ADDED_MANIFEST = path.join(ROOT, 'data/places/historie/oslo/places_historie_added_batch_01_manifest.json');
const ADDED_INDEX = path.join(ROOT, 'data/places/historie/oslo/places_historie_added_batch_01_index.json');

const singletonDefs = {
  damstredet_telthusbakken: 'data/places/by/oslo/damstredet_telthusbakken.json',
  gamle_trikkestallen: 'data/places/by/oslo/gamle_trikkestallen.json',
  trefoldighetskirken: 'data/places/by/oslo/trefoldighetskirken.json'
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, v) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
};
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const replaceRequired = (text, from, to, label) => {
  if (!text.includes(from)) throw new Error('Mangler forventet tekst: ' + label);
  return text.replace(from, to);
};
const snapshot = (place) => ({
  lat: place?.lat ?? null,
  lon: place?.lon ?? null,
  r: place?.r ?? null,
  coordStatus: place?.coordStatus ?? '',
  coordSource: place?.coordSource ?? '',
  coordType: place?.coordType ?? '',
  coordNote: place?.coordNote ?? ''
});

function readFinder(file, label) {
  const raw = fs.readFileSync(file, 'utf8');
  const start = raw.indexOf('{');
  if (start < 0) throw new Error(`Fant ikke JSON i Geonorge-resultatet for ${label}`);
  const result = JSON.parse(raw.slice(start));
  if (!result?.ok || result?.status !== 'verified_candidate' || !result?.coordinate || !result?.sourceObjectId) {
    throw new Error(`${label} fikk ikke entydig verified_candidate fra Geonorge: ` + JSON.stringify({ status: result?.status, reason: result?.reason }));
  }
  return result;
}

const finderDefs = {
  sagene_skole: {
    label: 'Sagene skole', address: 'Biermanns gate 2 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Sagene skole i Biermanns gate 2. Osloskolen dokumenterer samme besøks- og leveringsadresse. Punktet representerer skolebygget, ikke Sagene som strøk.'
  },
  gamle_trikkestallen: {
    label: 'Gamle trikkestallen', address: 'Torshovgata 33 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for den gamle Trikkestallen i Torshovgata 33. Oslo byleksikon dokumenterer bygget som den gamle trikkestallen fra 1899. Punktet representerer selve bygget og holdes adskilt fra bredere Sagene/Torshov-områder.'
  },
  trefoldighetskirken: {
    label: 'Trefoldighetskirken', address: 'Akersgata 60 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Trefoldighetskirken i Akersgata 60. Den norske kirke dokumenterer samme besøksadresse. Punktet representerer kirkebygget.'
  },
  oslo_ladegard: {
    label: 'Oslo ladegård', address: 'Oslo gate 13 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Oslo ladegård i Oslo gate 13. Oslo kommune dokumenterer samme besøksadresse. Punktet representerer hovedbygningen og holdes adskilt fra Middelalderparken som større område.'
  }
};
const finderResults = {};
for (const [id, def] of Object.entries(finderDefs)) {
  finderResults[id] = readFinder(path.join(REPORT_DIR, `${id}-geonorge.json`), def.label);
}

function finderUpdate(id) {
  const result = finderResults[id];
  return {
    ...result.coordinate,
    sourceObjectId: result.sourceObjectId,
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.sourceUrl,
    coordVerifiedAt: DATE,
    coordNote: finderDefs[id].note
  };
}

const historyUpdates = {
  sagene_skole: finderUpdate('sagene_skole')
};
const singletonUpdates = {
  damstredet_telthusbakken: {
    locatorType: 'linear_area',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:damstredet+telthusbakken',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'historic_street_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Damstredet og Telthusbakken',
    coordSourceId: 'oslobyleksikon:damstredet+telthusbakken',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Damstredet',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert områdeanker for det kombinerte trehusmiljøet Damstredet og Telthusbakken. Stedet består av to nærliggende historiske gateløp og behandles derfor ikke som ett adressepunkt. Det eksisterende hovedpunktet beholdes som representativt anker mellom miljøene.'
  },
  gamle_trikkestallen: finderUpdate('gamle_trikkestallen'),
  trefoldighetskirken: finderUpdate('trefoldighetskirken')
};
const addedUpdates = {
  nonneseter_kloster: {
    locatorType: 'historic_site',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:nonneseter',
    geocodeAccuracy: 'historical_approximation',
    coordRole: 'historical_anchor',
    coordType: 'historical_monastery_anchor',
    coordStatus: 'verified_historical_source',
    coordSource: 'Oslo byleksikon – Nonneseter',
    coordSourceId: 'oslobyleksikon:nonneseter',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Nonneseter',
    coordVerifiedAt: DATE,
    coordNote: 'Historisk kildeanker for Nonneseter kloster. Oslo byleksikon plasserer klosteret på Leiran, like nord for Hovinbekken og litt vest for dagens kryss Schweigaards gate/Grønlandsleiret. Ingen bevart klosterbygning brukes som falskt objektpunkt; eksisterende koordinat beholdes som historisk omtrentlig anker.'
  },
  oslo_ladegard: finderUpdate('oslo_ladegard'),
  galgeberg: {
    locatorType: 'historic_site',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:galgeberg-rettersted',
    geocodeAccuracy: 'historical_approximation',
    coordRole: 'historical_anchor',
    coordType: 'historical_execution_site_anchor',
    coordStatus: 'verified_historical_source',
    coordSource: 'Oslo byleksikon – Galgeberg',
    coordSourceId: 'oslobyleksikon:galgeberg-rettersted',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Galgeberg',
    coordVerifiedAt: DATE,
    coordNote: 'Historisk kildeanker for det gamle retterstedet på Galgeberg. Oslo byleksikon avgrenser området til dagens blokk-/gateområde mellom Strømsveien, St. Halvards gate og Åkebergveien og beskriver at det historiske berget i stor grad er endret. Eksisterende punkt beholdes som historisk omtrentlig anker, ikke som et bevart galgeobjekt.'
  }
};

function updateAggregateSplit({ aggregatePath, aggregateRel, splitDir, manifestPath, indexPath, updates }) {
  const aggregate = readJson(aggregatePath);
  for (const [id, update] of Object.entries(updates)) {
    const row = aggregate.find((p) => p?.id === id);
    if (!row) throw new Error(`Mangler ${id} i ${aggregateRel}`);
    Object.assign(row, update);
    delete row.coordPrecision;
    delete row.coordPrecisionM;
  }
  writeJson(aggregatePath, aggregate);

  for (const [id, update] of Object.entries(updates)) {
    const file = path.join(splitDir, id + '.json');
    const row = readJson(file);
    Object.assign(row, update);
    delete row.coordPrecision;
    delete row.coordPrecisionM;
    writeJson(file, row);
  }

  const manifest = readJson(manifestPath);
  manifest.source_sha256 = sha256(aggregatePath);
  manifest.generated_at = new Date().toISOString();
  for (const entry of manifest.places || []) {
    if (updates[entry.id]) entry.sha256 = sha256(path.join(path.dirname(manifestPath), entry.file));
  }
  writeJson(manifestPath, manifest);

  const index = readJson(indexPath);
  for (const id of Object.keys(updates)) {
    const row = index.find((p) => p?.id === id);
    const source = aggregate.find((p) => p?.id === id);
    if (!row || !source) throw new Error(`Mangler index/source for ${id}`);
    for (const key of ['lat', 'lon', 'r', 'coordType', 'coordStatus']) row[key] = source[key];
  }
  writeJson(indexPath, index);
  return aggregate;
}

const historyAggregate = updateAggregateSplit({
  aggregatePath: HISTORY, aggregateRel: HISTORY_REL, splitDir: HISTORY_SPLIT_DIR,
  manifestPath: HISTORY_MANIFEST, indexPath: HISTORY_INDEX, updates: historyUpdates
});
const addedAggregate = updateAggregateSplit({
  aggregatePath: ADDED, aggregateRel: ADDED_REL, splitDir: ADDED_SPLIT_DIR,
  manifestPath: ADDED_MANIFEST, indexPath: ADDED_INDEX, updates: addedUpdates
});

const singletonPlaces = {};
for (const [id, rel] of Object.entries(singletonDefs)) {
  const file = path.join(ROOT, rel);
  const data = readJson(file);
  if (!Array.isArray(data) || data.length !== 1 || data[0]?.id !== id) throw new Error(`Uventet singleton-format for ${id}`);
  Object.assign(data[0], singletonUpdates[id]);
  delete data[0].coordPrecision;
  delete data[0].coordPrecisionM;
  writeJson(file, data);
  singletonPlaces[id] = data[0];
}

const allPlaces = {
  sagene_skole: historyAggregate.find((p) => p?.id === 'sagene_skole'),
  ...singletonPlaces,
  nonneseter_kloster: addedAggregate.find((p) => p?.id === 'nonneseter_kloster'),
  oslo_ladegard: addedAggregate.find((p) => p?.id === 'oslo_ladegard'),
  galgeberg: addedAggregate.find((p) => p?.id === 'galgeberg')
};
const placeFiles = {
  sagene_skole: HISTORY_REL,
  damstredet_telthusbakken: singletonDefs.damstredet_telthusbakken,
  gamle_trikkestallen: singletonDefs.gamle_trikkestallen,
  trefoldighetskirken: singletonDefs.trefoldighetskirken,
  nonneseter_kloster: ADDED_REL,
  oslo_ladegard: ADDED_REL,
  galgeberg: ADDED_REL
};
const evidenceDefs = {
  sagene_skole: ['oslo/historie/sagene_skole.json', 'Sagene skole', 'Sagene skolebygget i Biermanns gate 2', 'Osloskolen dokumenterer Sagene skoles besøksadresse; Geonorge gir ett entydig offisielt adressepunkt.'],
  damstredet_telthusbakken: ['oslo/by/damstredet_telthusbakken.json', 'Damstredet og Telthusbakken', 'det kombinerte historiske trehusmiljøet Damstredet/Telthusbakken', 'Oslo byleksikon dokumenterer de historiske gateløpene; recorden behandles som et områdeanker, ikke ett adressepunkt.'],
  gamle_trikkestallen: ['oslo/by/gamle_trikkestallen.json', 'Gamle trikkestallen på Sagene', 'den gamle Trikkestallen i Torshovgata 33', 'Oslo byleksikon identifiserer Trikkestallen i Torshovgata 33; Geonorge gir ett entydig offisielt adressepunkt.'],
  trefoldighetskirken: ['oslo/by/trefoldighetskirken.json', 'Trefoldighetskirken', 'Trefoldighetskirken i Akersgata 60', 'Den norske kirke dokumenterer besøksadressen; Geonorge gir ett entydig offisielt adressepunkt.'],
  nonneseter_kloster: ['oslo/historie/nonneseter_kloster.json', 'Nonneseter kloster', 'det historiske Nonneseter-klosterstedet ved Leiran', 'Oslo byleksikon dokumenterer den historiske plasseringen vest for krysset Schweigaards gate/Grønlandsleiret.'],
  oslo_ladegard: ['oslo/historie/oslo_ladegard.json', 'Oslo ladegård', 'Oslo ladegård i Oslo gate 13', 'Oslo kommune dokumenterer besøksadressen; Geonorge gir ett entydig offisielt adressepunkt.'],
  galgeberg: ['oslo/historie/galgeberg.json', 'Galgeberg', 'det historiske retterstedsområdet på Galgeberg', 'Oslo byleksikon dokumenterer det historiske retterstedet og avgrenser det mot dagens gate-/boligområde.']
};
for (const [id, d] of Object.entries(evidenceDefs)) {
  const place = allPlaces[id];
  if (!place) throw new Error('Mangler place for evidens: ' + id);
  writeJson(path.join(EVIDENCE_ROOT, d[0]), {
    placeId: id,
    placeFile: placeFiles[id],
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: { currentName: d[1], resolvedIdentity: d[2], identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'fysisk avgrensning mot nærliggende canonical steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: place.sourceProvider === 'official_address' ? 'official_address_plus_identity' : 'stable_historical_or_area_source', finding: d[3], canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: finderDefs[id] ? [{ address: finderDefs[id].address, sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }] : [],
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
protocol = replaceRequired(
  protocol,
  'Oslo-tabellen inneholder nå 108 verifiserte eller kildekontrollerte canonical steder. Batch 18 omfatter sju fullførte kontroller fra Oslo-køen: fem godkjente park-, gravplass-, festnings- og ruinankre, legacy-typofeilen `akerhus_slott` som duplikatkonflikt, og `grini_fangeleir` som er flyttet til Akershus/Bærum uten at det eldre leirpunktet ble godkjent. Åtte fullførte kontroller fra Oslo-køen står dermed separat uten godkjent Oslo-koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo-tabellen inneholder nå 115 verifiserte eller kildekontrollerte canonical steder. Batch 19 legger til sju godkjente skole-, bymiljø-, bygnings- og historiske ankere: Sagene skole, Damstredet/Telthusbakken, Gamle trikkestallen, Trefoldighetskirken, Nonneseter kloster, Oslo ladegård og Galgeberg. Åtte fullførte kontroller fra Oslo-køen står fortsatt separat uten godkjent Oslo-koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo summary'
);
const lastApproved = '| 18 | `hovedoya_kloster` | Hovedøya kloster | verified_geometry | `osm-way:457724681` |';
const rows = [
  `| 19 | \`sagene_skole\` | Sagene skole | verified | \`${finderResults.sagene_skole.sourceObjectId}\` |`,
  '| 19 | `damstredet_telthusbakken` | Damstredet og Telthusbakken | verified_geometry | `oslobyleksikon:damstredet+telthusbakken` |',
  `| 19 | \`gamle_trikkestallen\` | Gamle trikkestallen på Sagene | verified | \`${finderResults.gamle_trikkestallen.sourceObjectId}\` |`,
  `| 19 | \`trefoldighetskirken\` | Trefoldighetskirken | verified | \`${finderResults.trefoldighetskirken.sourceObjectId}\` |`,
  '| 19 | `nonneseter_kloster` | Nonneseter kloster | verified_historical_source | `oslobyleksikon:nonneseter` |',
  `| 19 | \`oslo_ladegard\` | Oslo ladegård | verified | \`${finderResults.oslo_ladegard.sourceObjectId}\` |`,
  '| 19 | `galgeberg` | Galgeberg | verified_historical_source | `oslobyleksikon:galgeberg-rettersted` |'
].join('\n');
protocol = replaceRequired(protocol, lastApproved, lastApproved + '\n' + rows, 'batch 19 rows');
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 108 verifiserte eller kildekontrollerte canonical Oslo-stedene.', 'Disse kontrollene er fullført, men teller ikke blant de 115 verifiserte eller kildekontrollerte canonical Oslo-stedene.');
protocol = replaceRequired(
  protocol,
  '- Neste nye Oslo-kontroll er nummer 115 og starter batch 19.\n- Batch 18 er fullført med fem godkjente Oslo-ankre, én dokumentert legacy-duplikatkonflikt og én geografisk feilplassering flyttet til Akershus/Bærum uten koordinatgodkjenning.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  '- Neste nye Oslo-kontroll er nummer 122 og starter batch 20.\n- Batch 19 er fullført med sju godkjente skole-, bymiljø-, bygnings- og historiske ankere.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  'next work'
);
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 19\n\nDato: ${DATE}\n\nSju nye canonical Oslo-steder er kontrollert og godkjent. Fire konkrete bygg er kjørt gjennom Geonorge adresse-first med lagret terminaloutput. Damstredet/Telthusbakken er behandlet som et kombinert historisk bymiljø, mens Nonneseter og Galgeberg er eksplisitte historiske ankere.\n\n| placeId | status | kildeobjekt |\n|---|---|---|\n| \`sagene_skole\` | verified | \`${finderResults.sagene_skole.sourceObjectId}\` |\n| \`damstredet_telthusbakken\` | verified_geometry | \`oslobyleksikon:damstredet+telthusbakken\` |\n| \`gamle_trikkestallen\` | verified | \`${finderResults.gamle_trikkestallen.sourceObjectId}\` |\n| \`trefoldighetskirken\` | verified | \`${finderResults.trefoldighetskirken.sourceObjectId}\` |\n| \`nonneseter_kloster\` | verified_historical_source | \`oslobyleksikon:nonneseter\` |\n| \`oslo_ladegard\` | verified | \`${finderResults.oslo_ladegard.sourceObjectId}\` |\n| \`galgeberg\` | verified_historical_source | \`oslobyleksikon:galgeberg-rettersted\` |\n\n## Metode\n\n- Sagene skole: Biermanns gate 2.\n- Gamle trikkestallen: Torshovgata 33.\n- Trefoldighetskirken: Akersgata 60.\n- Oslo ladegård: Oslo gate 13.\n- Damstredet/Telthusbakken: kombinert områdeanker, ikke adressepunkt.\n- Nonneseter og Galgeberg: historiske ankere med eksplisitt historisk usikkerhet, ikke falske moderne objektpunkter.\n`);

console.log('Completed Oslo coordinate batch 19');
