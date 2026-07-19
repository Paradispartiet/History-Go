import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-21');
const REPORT = path.join(REPORT_DIR, 'README.md');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');

const KUNST_REL = 'data/places/kunst/oslo/places_kunst.json';
const KUNST = path.join(ROOT, KUNST_REL);
const KUNST_SPLIT_DIR = path.join(ROOT, 'data/places/kunst/oslo/places_kunst');
const KUNST_MANIFEST = path.join(ROOT, 'data/places/kunst/oslo/places_kunst_manifest.json');
const KUNST_INDEX = path.join(ROOT, 'data/places/kunst/oslo/places_kunst_index.json');

const LIT_REL = 'data/places/litteratur/oslo/places_litteratur.json';
const LIT = path.join(ROOT, LIT_REL);
const LIT_SPLIT_DIR = path.join(ROOT, 'data/places/litteratur/oslo/places_litteratur');
const LIT_MANIFEST = path.join(ROOT, 'data/places/litteratur/oslo/places_litteratur_manifest.json');
const LIT_INDEX = path.join(ROOT, 'data/places/litteratur/oslo/places_litteratur_index.json');

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
const snapshot = (p) => ({
  lat: p?.lat ?? null,
  lon: p?.lon ?? null,
  r: p?.r ?? null,
  coordStatus: p?.coordStatus ?? '',
  coordSource: p?.coordSource ?? '',
  coordType: p?.coordType ?? '',
  coordNote: p?.coordNote ?? ''
});

function readFinder(file, label) {
  const raw = fs.readFileSync(file, 'utf8');
  const start = raw.indexOf('{');
  if (start < 0) throw new Error(`Fant ikke JSON i Geonorge-resultatet for ${label}`);
  return JSON.parse(raw.slice(start));
}
function finderUpdate(result, note) {
  return {
    ...result.coordinate,
    sourceObjectId: result.sourceObjectId,
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.sourceUrl,
    coordVerifiedAt: DATE,
    coordNote: note
  };
}

const finderDefs = {
  grotta: {
    label: 'Grotten',
    address: 'Wergelandsveien 4 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Grotten i Wergelandsveien 4. Oslo byleksikon og Store norske leksikon dokumenterer æresboligen ved denne adressen. Punktet representerer selve bygningen, ikke Slottsparken som område.'
  },
  eldorado_bokhandel: {
    label: 'Eldorado Bokhandel',
    address: 'Torggata 9A Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Eldorado-bygget i Torggata 9A. Punktet representerer det konkrete tidligere kino-/bokhandelbygget og erstatter eldre OSM-adressemetadata med full Coordinate Source Contract v1.'
  },
  gamle_deichman: {
    label: 'Gamle Deichman',
    address: 'Arne Garborgs plass 4 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for det tidligere Deichman-hovedbiblioteket i Arne Garborgs plass 4. Det gamle hovedpunktet lå feil ved Karl Johan-området og flyttes til det faktiske bibliotekbygget på Hammersborg.'
  }
};
const finderResults = {};
const verifiedAddressIds = [];
const reviewAddressIds = [];
for (const [id, def] of Object.entries(finderDefs)) {
  const result = readFinder(path.join(REPORT_DIR, `${id}-geonorge.json`), def.label);
  finderResults[id] = result;
  if (result?.ok && result?.status === 'verified_candidate' && result?.coordinate && result?.sourceObjectId) verifiedAddressIds.push(id);
  else if (result?.status === 'needs_review') reviewAddressIds.push(id);
  else throw new Error(`${def.label} ga uventet finder-resultat: ` + JSON.stringify({ status: result?.status, reason: result?.reason }));
}

const kunstUpdates = {
  ekebergparken: {
    locatorType: 'park',
    sourceProvider: 'official_map',
    sourceObjectId: 'ekebergparken:official-map',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'sculpture_park_area_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'Ekebergparken – offisielt interaktivt parkkart',
    coordSourceId: 'ekebergparken:official-map',
    coordSourceUrl: 'https://ekebergparken.com/nb/interaktivt-kart',
    coordVerifiedAt: DATE,
    coordNote: 'Dokumentert områdeanker inne i Ekebergparken skulpturpark. Parken er et utstrakt kunst- og landskapsområde, så museum-/besøksadressen brukes ikke som snarvei for hele parken. Det eksisterende punktet beholdes som representativt anker i parklandskapet og knyttes til parkens offisielle kart.'
  }
};

const litteraturUpdates = {
  ibsen_quotes: {
    locatorType: 'route',
    sourceProvider: 'manual_research',
    sourceObjectId: 'ibsen-museum:sitatgaten',
    geocodeAccuracy: 'approximate',
    coordRole: 'line_anchor',
    coordType: 'distributed_quote_route',
    coordStatus: 'needs_source',
    coordSource: 'IBSEN Museum & Teater – Sitatgaten',
    coordSourceId: 'ibsen-museum:sitatgaten',
    coordSourceUrl: 'https://ibsenmt.no/skoletilbud',
    coordVerifiedAt: null,
    coordNote: 'IBSEN Museum & Teater dokumenterer 69 Ibsen-sitater langs Karl Johans gate og Henrik Ibsens gate. Ett enkelt punkt kan ikke verifisere den distribuerte installasjonen. Eksisterende punkt beholdes kun som uverifisert representasjonsanker til rutegeometri eller flere kildebelagte ankere er modellert.'
  },
  camilla_collett_statue: {
    lat: 59.91813,
    lon: 10.72798,
    r: 45,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:7573449468',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'display_marker',
    coordType: 'monument',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 7573449468 – Camilla Collett',
    coordSourceId: 'osm-node:7573449468',
    coordSourceUrl: 'https://www.openstreetmap.org/node/7573449468',
    coordVerifiedAt: DATE,
    coordNote: 'Presist objektanker for Camilla Collett-monumentet i Slottsparken. OSM node 7573449468 identifiserer selve minnesmerket, og Wikidata/Wikimedia bekrefter samme objektplassering. Det gamle punktet lå flere hundre meter sørøst for statuen og er korrigert.'
  },
  henrik_wergeland_statue: {
    lat: 59.914084,
    lon: 10.736378,
    r: 45,
    locatorType: 'poi',
    sourceProvider: 'manual_research',
    sourceObjectId: 'wikimedia-commons:oslo-museum-ob-a17403',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'display_marker',
    coordType: 'monument',
    coordStatus: 'verified_geometry',
    coordSource: 'Wikimedia Commons object location / Oslo Museum OB.A17403 – Henrik Wergeland-statuen',
    coordSourceId: 'wikimedia-commons:oslo-museum-ob-a17403',
    coordSourceUrl: 'https://commons.wikimedia.org/wiki/File:Wergeland-statuen_-_1998_-_Jan-Christian_Raastad_-_Oslo_Museum_-_OB.A17403.jpg',
    coordVerifiedAt: DATE,
    coordNote: 'Objektanker for Henrik Wergeland-statuen på Eidsvolls plass ved Roald Amundsens gate. Wikimedia Commons oppgir objektplasseringen 59.914084/10.736378, og Oslo byleksikon dokumenterer statuen på Eidsvolls plass mellom Roald Amundsens gate og Spikersuppa. Det gamle punktet lå for langt nordvest og er korrigert.'
  }
};
for (const id of verifiedAddressIds) {
  litteraturUpdates[id] = finderUpdate(finderResults[id], finderDefs[id].note);
}

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

const kunstAggregate = updateAggregateSplit({
  aggregatePath: KUNST,
  aggregateRel: KUNST_REL,
  splitDir: KUNST_SPLIT_DIR,
  manifestPath: KUNST_MANIFEST,
  indexPath: KUNST_INDEX,
  updates: kunstUpdates
});
const litAggregate = updateAggregateSplit({
  aggregatePath: LIT,
  aggregateRel: LIT_REL,
  splitDir: LIT_SPLIT_DIR,
  manifestPath: LIT_MANIFEST,
  indexPath: LIT_INDEX,
  updates: litteraturUpdates
});

const places = {};
for (const id of ['ekebergparken']) places[id] = kunstAggregate.find((p) => p?.id === id);
for (const id of ['ibsen_quotes','camilla_collett_statue','henrik_wergeland_statue','grotta','eldorado_bokhandel','gamle_deichman']) places[id] = litAggregate.find((p) => p?.id === id);

const appliedDefs = {
  ekebergparken: ['oslo/kunst/ekebergparken.json', KUNST_REL, 'Ekebergparken skulpturpark', 'Ekebergparken som utstrakt offentlig skulpturpark og landskapsområde', 'Det offisielle interaktive parkkartet dokumenterer parken som et utstrakt område; eksisterende punkt brukes eksplisitt som representativt områdeanker.'],
  camilla_collett_statue: ['oslo/litteratur/camilla_collett_statue.json', LIT_REL, 'Camilla Collett-statuen', 'Camilla Collett-monumentet i Slottsparken', 'OSM node 7573449468 identifiserer selve minnesmerket; Wikidata/Wikimedia bekrefter objektplasseringen.'],
  henrik_wergeland_statue: ['oslo/litteratur/henrik_wergeland_statue.json', LIT_REL, 'Henrik Wergeland-statuen', 'Henrik Wergeland-statuen på Eidsvolls plass ved Roald Amundsens gate', 'Wikimedia Commons oppgir objektplasseringen, og Oslo byleksikon dokumenterer monumentets plassering på Eidsvolls plass.']
};
for (const id of verifiedAddressIds) {
  appliedDefs[id] = [
    `oslo/litteratur/${id}.json`,
    LIT_REL,
    finderDefs[id].label,
    `${finderDefs[id].label} på ${finderDefs[id].address}`,
    `Geonorge gir ett entydig offisielt adressepunkt for ${finderDefs[id].address}.`
  ];
}

for (const [id, d] of Object.entries(appliedDefs)) {
  const place = places[id];
  const addressDef = finderDefs[id];
  writeJson(path.join(EVIDENCE_ROOT, d[0]), {
    placeId: id,
    placeFile: d[1],
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: { currentName: d[2], resolvedIdentity: d[3], identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'fysisk avgrensning mot nærliggende canonical steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: addressDef ? 'official_address_plus_documented_identity' : 'stable_object_or_area_source', finding: d[4], canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: addressDef ? [{ address: addressDef.address, sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }] : [],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' },
    notes: [place.coordNote]
  });
}

const ibsen = places.ibsen_quotes;
const ibsenBlocked = 'Sitatgaten består av 69 sitater langs både Karl Johans gate og Henrik Ibsens gate. Ett enkelt hovedpunkt kan ikke verifisere hele den distribuerte installasjonen uten rutegeometri eller flere kildebelagte ankere.';
writeJson(path.join(EVIDENCE_ROOT, 'oslo/litteratur/ibsen_quotes.json'), {
  placeId: 'ibsen_quotes',
  placeFile: LIT_REL,
  evidenceStatus: 'needs_research',
  coordinateDecision: 'needs_geometry',
  currentCoordinate: snapshot(ibsen),
  identity: { currentName: 'Ibsen sitater', resolvedIdentity: 'Sitatgaten med 69 Ibsen-sitater langs Karl Johans gate og Henrik Ibsens gate', identityStatus: 'resolved', identityProblem: 'Den fysiske installasjonen er distribuert langs to gateløp, mens recorden bare har ett punkt.', locatorTypeCandidate: 'route', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['rutegeometri eller flere kildebelagte sitatankre', 'dokumentert start-/sluttpunkt eller representativt fellessegment', 'visuell kontroll av hele installasjonens utstrekning'],
  evidence: [{ sourceProvider: 'manual_research', sourceName: 'IBSEN Museum & Teater – Sitatgaten', sourceUrl: 'https://ibsenmt.no/skoletilbud', sourceObjectId: 'ibsen-museum:sitatgaten', sourceQuality: 'official_identity_and_extent_description', finding: 'IBSEN Museum & Teater dokumenterer 69 sitater langs Karl Johans gate og Henrik Ibsens gate, men siden gir ikke en maskinlesbar traségeometri som kan anvendes direkte.', canVerifyCoordinate: false, reason: ibsenBlocked }],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'manual_research', sourceObjectId: 'ibsen-museum:sitatgaten', canApplyToPlace: false }],
  geometryCandidates: [],
  coordinateCandidates: [{ lat: ibsen.lat, lon: ibsen.lon, coordRole: 'line_anchor', canApplyToPlace: false }],
  decision: { canBecomeVerified: false, blockedReason: ibsenBlocked, nextAction: 'Modeller rutegeometri eller flere kildebelagte ankere før canonical koordinat kan godkjennes.' },
  notes: [ibsen.coordNote]
});

for (const id of reviewAddressIds) {
  const place = places[id];
  const def = finderDefs[id];
  const result = finderResults[id];
  const blocked = `Geonorge ga ikke ett entydig adressepunkt for ${def.address}. Ingen kandidat velges uten dokumentert fysisk kobling til ${def.label}.`;
  writeJson(path.join(EVIDENCE_ROOT, `oslo/litteratur/${id}.json`), {
    placeId: id,
    placeFile: LIT_REL,
    evidenceStatus: 'needs_research',
    coordinateDecision: 'needs_geometry',
    currentCoordinate: snapshot(place),
    identity: { currentName: def.label, resolvedIdentity: `${def.label} ved ${def.address}`, identityStatus: 'resolved', identityProblem: 'Adresseoppslaget er fysisk flertydig.', locatorTypeCandidate: 'building', requiresSplit: false, splitReason: '' },
    requiredEvidence: ['entydig offisiell adressepunktkobling eller bygningsgeometri', 'fysisk kontroll mot nærliggende kandidater'],
    evidence: [{ sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1', sourceUrl: result?.sourceUrl ?? '', sourceObjectId: '', sourceQuality: 'ambiguous_address_candidates', finding: result?.reason ?? 'Flere ikke-entydige treff.', canVerifyCoordinate: false, reason: blocked }],
    addressCandidates: [{ address: def.address, sourceProvider: 'official_address', canApplyToPlace: false }],
    sourceObjectCandidates: [],
    geometryCandidates: [],
    coordinateCandidates: [],
    decision: { canBecomeVerified: false, blockedReason: blocked, nextAction: 'Finn entydig bygningsgeometri eller dokumentert kobling til én adressekandidat.' },
    notes: ['Eksisterende koordinat beholdes uendret; ingen første/nærmeste kandidat velges.']
  });
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
const evidenceFiles = [
  ...Object.values(appliedDefs).map((d) => d[0]),
  'oslo/litteratur/ibsen_quotes.json',
  ...reviewAddressIds.map((id) => `oslo/litteratur/${id}.json`)
];
for (const file of evidenceFiles) if (!evidenceManifest.files.includes(file)) evidenceManifest.files.push(file);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

const fixedApproved = 3;
const approvedCount = fixedApproved + verifiedAddressIds.length;
const reviewAdded = 1 + reviewAddressIds.length;
const totalApproved = 118 + approvedCount;
const totalReview = 9 + reviewAdded;

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
const oldSummary = 'Oslo-tabellen inneholder nå 118 verifiserte eller kildekontrollerte canonical steder. Batch 20 avslutter Oslo-klyngen i globalmanifestet med tre godkjente historiske bygg og anlegg: Oslo Hospital som geometriforankret kompleksanker samt Botsfengselet og Gamle Rådhus som adresseverifiserte steder. Prinds Christian Augusts Minde står separat som `needs_review` fordi Storgata 36 gir flere ikke-entydige adressekandidater for det historiske komplekset. 9 fullførte kontroller fra Oslo-køen står dermed separat uten godkjent Oslo-koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.';
const approvedNames = ['Ekebergparken', 'Camilla Collett-statuen', 'Henrik Wergeland-statuen', ...verifiedAddressIds.map((id) => finderDefs[id].label)].join(', ');
const reviewNames = ['Ibsen-sitatene', ...reviewAddressIds.map((id) => finderDefs[id].label)].join(', ');
const newSummary = `Oslo-tabellen inneholder nå ${totalApproved} verifiserte eller kildekontrollerte canonical steder. Batch 21 starter den sekundære Oslo-kildekøen og godkjenner ${approvedCount} nye ankere: ${approvedNames}. ${reviewNames} står som nye dokumenterte \`needs_review\`-utfall. ${totalReview} fullførte kontroller står dermed separat uten godkjent Oslo-koordinat. Sekundærkøen bruker Oslo-manifeststier i leksikografisk rekkefølge, bevarer record-rekkefølgen i hvert manifest og hopper over placeId-er som allerede er kontrollert.`;
protocol = replaceRequired(protocol, oldSummary, newSummary, 'Oslo summary');

const lastApproved = '| 20 | `gamle_radhus` | Gamle Rådhus | verified | `geonorge-adresser-v1:0301:15006:1` |';
const approvedRows = [
  '| 21 | `ekebergparken` | Ekebergparken skulpturpark | verified_geometry | `ekebergparken:official-map` |',
  '| 21 | `camilla_collett_statue` | Camilla Collett-statuen | verified_geometry | `osm-node:7573449468` |',
  '| 21 | `henrik_wergeland_statue` | Henrik Wergeland-statuen | verified_geometry | `wikimedia-commons:oslo-museum-ob-a17403` |',
  ...verifiedAddressIds.map((id) => `| 21 | \`${id}\` | ${finderDefs[id].label} | verified | \`${finderResults[id].sourceObjectId}\` |`)
].join('\n');
protocol = replaceRequired(protocol, lastApproved, lastApproved + '\n' + approvedRows, 'batch 21 approved rows');
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 118 verifiserte eller kildekontrollerte canonical Oslo-stedene.', `Disse kontrollene er fullført, men teller ikke blant de ${totalApproved} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
const prindsenRow = '| `prinds_christian_augusts_minde` – Prinds Christian Augusts Minde | needs_review | Storgata 36 gir flere ikke-entydige Geonorge-treff for et historisk bygningskompleks; ingen husbokstav er dokumentert som canonical hovedanker. | Krever offisiell kompleks-/eiendomsgeometri eller et dokumentert representativt anker. |';
const reviewRows = [
  '| `ibsen_quotes` – Ibsen sitater / Sitatgaten | needs_review | Den fysiske installasjonen består av 69 sitater langs Karl Johans gate og Henrik Ibsens gate, men recorden har bare ett punkt og ingen kildebelagt traségeometri. | Krever rutegeometri eller flere kildebelagte ankere før canonical koordinat kan godkjennes. |',
  ...reviewAddressIds.map((id) => `| \`${id}\` – ${finderDefs[id].label} | needs_review | Geonorge-oppslaget for ${finderDefs[id].address} ga flere ikke-entydige treff. | Krever entydig bygningsgeometri eller dokumentert kobling til én adressekandidat. |`)
].join('\n');
protocol = replaceRequired(protocol, prindsenRow, prindsenRow + '\n' + reviewRows, 'batch 21 review rows');
protocol = replaceRequired(
  protocol,
  '- Neste nye Oslo-kontroll er nummer 126 og starter batch 21.\n- Batch 20 er fullført med 3 godkjente historiske bygg/anlegg og én dokumentert Prindsen-adressekonflikt.\n- Oslo-klyngen i det globale place-manifestet er nå ferdig kontrollert; batch 21 skal starte en eksplisitt sekundær Oslo-kildekø for aktive places som ligger utenfor dette manifestet.\n- Fortsett kilde for kilde i stabil manifest-/filrekkefølge og velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  `- Neste nye Oslo-kontroll er nummer 133 og starter batch 22.\n- Batch 21 er fullført med ${approvedCount} godkjente ankere og ${reviewAdded} nye dokumenterte \`needs_review\`-utfall.\n- Sekundær Oslo-kildekø: sorter Oslo-manifeststier leksikografisk, behold \`order\` i hvert manifest og hopp over alle placeId-er som allerede står i protokollen.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte \`needs_review\`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.`,
  'next work'
);
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
const resultRows = [
  '| `ekebergparken` | verified_geometry | `ekebergparken:official-map` |',
  '| `ibsen_quotes` | needs_review | mangler rutegeometri/flerankre |',
  '| `camilla_collett_statue` | verified_geometry | `osm-node:7573449468` |',
  '| `henrik_wergeland_statue` | verified_geometry | `wikimedia-commons:oslo-museum-ob-a17403` |',
  ...Object.keys(finderDefs).map((id) => `| \`${id}\` | ${verifiedAddressIds.includes(id) ? 'verified' : 'needs_review'} | ${verifiedAddressIds.includes(id) ? `\`${finderResults[id].sourceObjectId}\`` : 'flertydig Geonorge-oppslag'} |`)
].join('\n');
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 21\n\nDato: ${DATE}\n\nBatch 21 starter den sekundære Oslo-kildekøen. Køkriteriet er manifeststier i leksikografisk rekkefølge, bevart record-ordre i hvert manifest og skip av tidligere kontrollerte placeId-er. Sju kontroller er fullført.\n\n| placeId | resultat | kilde / avgjørelse |\n|---|---|---|\n${resultRows}\n\n## Viktige avgjørelser\n\n- Ekebergparken behandles som et utstrakt område, ikke som museum-/adressepunkt.\n- Ibsen-sitatene er en distribuert installasjon med 69 sitater langs to gater og kan ikke verifiseres av ett enkelt punkt.\n- Camilla Collett- og Henrik Wergeland-monumentene flyttes til dokumenterte objektposisjoner.\n- Grotten, Eldorado og Gamle Deichman er kjørt adresse-first; bare entydige finder-resultater er anvendt.\n`);

console.log(`Completed Oslo coordinate batch 21: ${approvedCount} verified, ${reviewAdded} needs_review`);
