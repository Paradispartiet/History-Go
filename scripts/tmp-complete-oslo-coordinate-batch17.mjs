import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-17');
const REPORT = path.join(REPORT_DIR, 'README.md');

const sources = {
  by: {
    aggregateRel: 'data/places/by/oslo/places_by.json',
    splitDirRel: 'data/places/by/oslo/places',
    manifestRel: 'data/places/by/oslo/places_by_manifest.json',
    indexRel: 'data/places/by/oslo/places_oslo_by_index.json'
  },
  film: {
    aggregateRel: 'data/places/film/oslo/places_oslo_film.json',
    splitDirRel: 'data/places/film/oslo/places',
    manifestRel: 'data/places/film/oslo/places_oslo_film_manifest.json',
    indexRel: 'data/places/film/oslo/places_oslo_film_index.json'
  }
};

// The by-index has a historical filename that differs from the aggregate name.
sources.by.indexRel = fs.existsSync(path.join(ROOT, sources.by.indexRel))
  ? sources.by.indexRel
  : 'data/places/by/oslo/places_by_index.json';

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

function readFinder(file, label) {
  const raw = fs.readFileSync(file, 'utf8');
  const start = raw.indexOf('{');
  if (start < 0) throw new Error(`Fant ikke JSON i Geonorge-resultatet for ${label}`);
  return JSON.parse(raw.slice(start));
}

const finderDefs = {
  saga_kino: {
    label: 'Saga kino', address: 'Stortingsgata 28 Oslo',
    resolvedIdentity: 'Saga kino i Stortingsgata 28',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Saga kino i Stortingsgata 28. Nordisk Film Kino dokumenterer kinoen på samme adresse. Punktet representerer selve kinobygget og holdes adskilt fra Universitetsplassen og andre nærliggende sentrumspunkter.'
  },
  klingenberg_kino: {
    label: 'Klingenberg kino', address: 'Olav Vs gate 4 Oslo',
    resolvedIdentity: 'Klingenberg kino i Olav Vs gate 4',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Klingenberg kino i Olav Vs gate 4. Nordisk Film Kino dokumenterer kinoen på samme adresse. Punktet representerer kinobygget og er fysisk adskilt fra Nationaltheatret stasjon og Nationaltheatret.'
  },
  gimle_kino: {
    label: 'Gimle kino', address: 'Bygdøy allé 39 Oslo',
    resolvedIdentity: 'Gimle kino i Bygdøy allé 39',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Gimle kino i Bygdøy allé 39. Nordisk Film Kino dokumenterer kinoen på samme adresse. Punktet representerer selve kinoen, ikke Frogner som område.'
  },
  vika_kino: {
    label: 'Vika kino', address: 'Ruseløkkveien 14 Oslo',
    resolvedIdentity: 'Vika kino i Ruseløkkveien 14',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Vika kino i Ruseløkkveien 14. Nordisk Film Kino dokumenterer kinoen på samme adresse. Punktet representerer kinoen og holdes adskilt fra Oslo Konserthus og det bredere Vika-området.'
  }
};

const finderResults = {};
for (const [id, def] of Object.entries(finderDefs)) {
  const result = readFinder(path.join(REPORT_DIR, `${id}-geonorge.json`), def.label);
  if (!result?.ok || result?.status !== 'verified_candidate' || !result?.coordinate || !result?.sourceObjectId) {
    throw new Error(`${def.label} fikk ikke entydig verified_candidate fra Geonorge: ` + JSON.stringify({ status: result?.status, reason: result?.reason }));
  }
  finderResults[id] = result;
}

const hartvigResult = readFinder(
  path.join(REPORT_DIR, 'hartvig_nissens_skole_skam-geonorge.json'),
  'Hartvig Nissens skole (SKAM)'
);
if (hartvigResult?.status !== 'needs_review') {
  throw new Error('Forventet needs_review for Hartvig Nissen etter den dokumenterte flertydigheten, fikk: ' + JSON.stringify({ status: hartvigResult?.status, reason: hartvigResult?.reason }));
}

const byUpdates = {
  grorud: {
    locatorType: 'linear_area', sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:grorud-strok',
    geocodeAccuracy: 'semantic_anchor', coordRole: 'area_anchor', coordType: 'district_anchor', coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Grorud (strøk)', coordSourceId: 'oslobyleksikon:grorud-strok',
    coordSourceUrl: 'https://oslobyleksikon.no/side/Grorud_%28str%C3%B8k%29', coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker for Grorud som strøk i øvre Groruddalen. Oslo byleksikon dokumenterer Grorud som eget bolig-, industri- og knutepunktstrøk. Det eksisterende punktet beholdes som sentralt områdeanker; det representerer ikke én adresse, Grorud T-banestasjon eller hele Bydel Grorud.'
  },
  sagene: {
    locatorType: 'linear_area', sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:sagene-strok',
    geocodeAccuracy: 'semantic_anchor', coordRole: 'area_anchor', coordType: 'district_anchor', coordStatus: 'verified_geometry',
    coordSource: 'Oslo byleksikon – Sagene (strøk)', coordSourceId: 'oslobyleksikon:sagene-strok',
    coordSourceUrl: 'https://oslobyleksikon.no/index.php/Sagene_%28str%C3%B8k%29', coordVerifiedAt: DATE,
    coordNote: 'Representativt områdeanker for Sagene som historisk industri- og boligstrøk langs Akerselva. Oslo byleksikon dokumenterer strøket og dets utstrekning. Det eksisterende punktet beholdes som sentralt områdeanker; det representerer ikke hele administrative Bydel Sagene eller én enkelt institusjon.'
  }
};

const filmUpdates = {};
for (const [id, result] of Object.entries(finderResults)) {
  filmUpdates[id] = {
    ...result.coordinate,
    sourceObjectId: result.sourceObjectId,
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.sourceUrl,
    coordVerifiedAt: DATE,
    coordNote: finderDefs[id].note
  };
}

function applyUpdates(sourceKey, updates) {
  const cfg = sources[sourceKey];
  const aggregatePath = path.join(ROOT, cfg.aggregateRel);
  const splitDir = path.join(ROOT, cfg.splitDirRel);
  const manifestPath = path.join(ROOT, cfg.manifestRel);
  const indexPath = path.join(ROOT, cfg.indexRel);
  const aggregate = readJson(aggregatePath);

  for (const [id, update] of Object.entries(updates)) {
    const row = aggregate.find((p) => p?.id === id);
    if (!row) throw new Error(`Mangler place i ${cfg.aggregateRel}: ${id}`);
    Object.assign(row, update);
    delete row.coordPrecisionM;
  }
  writeJson(aggregatePath, aggregate);

  for (const [id, update] of Object.entries(updates)) {
    const file = path.join(splitDir, id + '.json');
    const row = readJson(file);
    Object.assign(row, update);
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
    if (!row || !source) throw new Error(`Mangler split-index/source for ${id}`);
    for (const key of ['lat', 'lon', 'r', 'coordType', 'coordStatus']) row[key] = source[key];
  }
  writeJson(indexPath, index);
  return aggregate;
}

const byAggregate = applyUpdates('by', byUpdates);
const filmAggregate = applyUpdates('film', filmUpdates);

const approvedEvidence = {
  grorud: {
    file: 'oslo/by/grorud.json', placeFile: sources.by.aggregateRel,
    currentName: 'Grorud', resolvedIdentity: 'Grorud som strøk i øvre Groruddalen',
    finding: 'Oslo byleksikon identifiserer Grorud som eget bolig-, industri- og knutepunktstrøk, adskilt fra den større administrative Bydel Grorud.'
  },
  sagene: {
    file: 'oslo/by/sagene.json', placeFile: sources.by.aggregateRel,
    currentName: 'Sagene', resolvedIdentity: 'Sagene som historisk industri- og boligstrøk langs Akerselva',
    finding: 'Oslo byleksikon identifiserer Sagene som eget strøk og beskriver utstrekningen, adskilt fra den større administrative Bydel Sagene.'
  }
};
for (const [id, def] of Object.entries(finderDefs)) {
  approvedEvidence[id] = {
    file: `oslo/film/${id}.json`, placeFile: sources.film.aggregateRel,
    currentName: def.label, resolvedIdentity: def.resolvedIdentity,
    finding: `Identiteten er dokumentert på ${def.address}; Geonorge gir ett entydig offisielt adressepunkt som kan anvendes på stedet.`
  };
}

for (const [id, d] of Object.entries(approvedEvidence)) {
  const aggregate = d.placeFile === sources.by.aggregateRel ? byAggregate : filmAggregate;
  const place = aggregate.find((p) => p?.id === id);
  const finderDef = finderDefs[id];
  writeJson(path.join(EVIDENCE_ROOT, d.file), {
    placeId: id,
    placeFile: d.placeFile,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: d.currentName, resolvedIdentity: d.resolvedIdentity, identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'fysisk avgrensning mot nærliggende canonical steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: finderDef ? 'official_address_plus_documented_identity' : 'stable_area_definition', finding: d.finding, canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: finderDef ? [{ address: finderDef.address, sourceProvider: 'official_address', sourceObjectId: place.sourceObjectId, canApplyToPlace: true }] : [],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' },
    notes: [place.coordNote]
  });
}

const hartvig = filmAggregate.find((p) => p?.id === 'hartvig_nissens_skole_skam');
if (!hartvig) throw new Error('Mangler Hartvig Nissen-place');
const hartvigEvidenceFile = 'oslo/film/hartvig_nissens_skole_skam.json';
const hartvigBlockedReason = "Geonorge returnerer flere treff for President Harbitz' gate 11 uten én entydig fysisk match. Den historiske SKAM-bygningen er identifisert, men riktig adressepunkt kan ikke velges uten objektgeometri eller en eksplisitt kobling til ett av treffene.";
writeJson(path.join(EVIDENCE_ROOT, hartvigEvidenceFile), {
  placeId: 'hartvig_nissens_skole_skam',
  placeFile: sources.film.aggregateRel,
  evidenceStatus: 'needs_research',
  coordinateDecision: 'needs_geometry',
  currentCoordinate: { lat: hartvig.lat, lon: hartvig.lon, r: hartvig.r, coordStatus: hartvig.coordStatus ?? null, coordSource: hartvig.coordSource ?? '', coordType: hartvig.coordType ?? null, coordNote: hartvig.coordNote ?? '' },
  identity: {
    currentName: 'Hartvig Nissens skole (SKAM)',
    resolvedIdentity: "det historiske Hartvig Nissen-bygget brukt som SKAM-lokasjon, tidligere Niels Juels gate 56 og nå knyttet til President Harbitz' gate 11",
    identityStatus: 'resolved',
    identityProblem: 'Den fysiske bygningen er identifisert, men Geonorge-adressen gir flere ikke-entydige treff.',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: ['offisiell objektgeometri for det historiske skolebygget', 'entydig kobling mellom bygningen og ett Geonorge-adressepunkt', 'fysisk kontroll mot resten av skolecampuset'],
  evidence: [{
    sourceProvider: 'official_address',
    sourceName: 'Geonorge Adresser API v1 + dokumentert Hartvig Nissen-identitet',
    sourceUrl: hartvigResult?.sourceUrl ?? '',
    sourceObjectId: '',
    sourceQuality: 'ambiguous_address_candidates',
    finding: "Adressefinneren returnerer flere treff for President Harbitz' gate 11. Ingen av treffene kan velges som canonical SKAM-bygganker uten ytterligere fysisk dokumentasjon.",
    canVerifyCoordinate: false,
    reason: hartvigBlockedReason
  }],
  addressCandidates: [
    { address: "President Harbitz' gate 11, Oslo", sourceProvider: 'official_address', canApplyToPlace: false },
    { address: 'Niels Juels gate 56, Oslo (tidligere adresse)', sourceProvider: 'manual_research', canApplyToPlace: false }
  ],
  sourceObjectCandidates: [],
  geometryCandidates: [],
  coordinateCandidates: [],
  decision: { canBecomeVerified: false, blockedReason: hartvigBlockedReason, nextAction: 'Finn offisiell bygningsgeometri eller en eksplisitt adressepunktkobling for det historiske Hartvig Nissen-bygget før koordinaten endres.' },
  notes: ['Ikke velg første eller nærmeste Geonorge-treff. Behold eksisterende koordinat uendret til fysisk bygganker er entydig dokumentert.']
});

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const d of Object.values(approvedEvidence)) if (!evidenceManifest.files.includes(d.file)) evidenceManifest.files.push(d.file);
if (!evidenceManifest.files.includes(hartvigEvidenceFile)) evidenceManifest.files.push(hartvigEvidenceFile);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = replaceRequired(
  protocol,
  'Oslo-tabellen inneholder nå 97 verifiserte eller kildekontrollerte canonical steder. Batch 16 legger til sju godkjente kontroller: Vigelandsparken, Vøienvolden, Carl Berners plass, Tullin, Økern, Skøyen og Torshov. Fem fullførte Oslo-kontroller står fortsatt separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo-tabellen inneholder nå 103 verifiserte eller kildekontrollerte canonical steder. Batch 17 omfatter sju fullførte kontroller: seks godkjente strøks-, kino- og filmlokasjonsankre, mens Hartvig Nissens skole (SKAM) står separat som `needs_review` fordi Geonorge gir flere ikke-entydige treff for det historiske skolebygget. Seks fullførte Oslo-kontroller står dermed separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.',
  'Oslo summary'
);

const last = '| 16 | `torshov` | Torshov | verified_geometry | `wikidata:Q7827191` |';
const rows = [
  '| 17 | `grorud` | Grorud | verified_geometry | `oslobyleksikon:grorud-strok` |',
  '| 17 | `sagene` | Sagene | verified_geometry | `oslobyleksikon:sagene-strok` |',
  `| 17 | \`saga_kino\` | Saga kino | verified | \`${finderResults.saga_kino.sourceObjectId}\` |`,
  `| 17 | \`klingenberg_kino\` | Klingenberg kino | verified | \`${finderResults.klingenberg_kino.sourceObjectId}\` |`,
  `| 17 | \`gimle_kino\` | Gimle kino | verified | \`${finderResults.gimle_kino.sourceObjectId}\` |`,
  `| 17 | \`vika_kino\` | Vika kino | verified | \`${finderResults.vika_kino.sourceObjectId}\` |`
].join('\n');
protocol = replaceRequired(protocol, last, last + '\n' + rows, 'batch 17 rows');
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 97 verifiserte eller kildekontrollerte canonical stedene.', 'Disse kontrollene er fullført, men teller ikke blant de 103 verifiserte eller kildekontrollerte canonical stedene.');
const bislettRow = '| `bislett` – Bislett strøk | needs_review | Område-recordens eksisterende punkt overlapper praktisk talt det separate canonical `bislett_stadion`-punktet. | Krever et eget dokumentert strøks-/knutepunktanker, for eksempel Bislett rundkjøring, uten å gjette koordinater. |';
const hartvigRow = "| `hartvig_nissens_skole_skam` – Hartvig Nissens skole (SKAM) | needs_review | Det historiske SKAM-skolebygget er identifisert, men Geonorge gir flere ikke-entydige treff for President Harbitz' gate 11. | Krever offisiell bygningsgeometri eller eksplisitt kobling mellom det historiske bygget og ett konkret adressepunkt. |";
protocol = replaceRequired(protocol, bislettRow, bislettRow + '\n' + hartvigRow, 'Hartvig needs_review row');
protocol = replaceRequired(
  protocol,
  '- Neste nye Oslo-kontroll er nummer 101 og starter batch 17.\n- Batch 16 er fullført med sju godkjente park-, bygnings-, plass- og områdeankre.\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  '- Neste nye Oslo-kontroll er nummer 108 og starter batch 18.\n- Batch 17 er fullført med seks godkjente ankere og én dokumentert adresse-/bygningskonflikt for Hartvig Nissens skole (SKAM).\n- Fortsett i canonical filrekkefølge når det gir en naturlig arbeidskø, men velg alltid koordinatmetode etter fysisk objekttype.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  'next work'
);
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 17\n\nDato: ${DATE}\n\nSju canonical Oslo-steder er kontrollert. Seks er godkjent; Hartvig Nissens skole (SKAM) er fullført som \`needs_review\` uten koordinatendring fordi Geonorge returnerer flere ikke-entydige treff.\n\n| placeId | status | kildeobjekt / avgjørelse |\n|---|---|---|\n| \`grorud\` | verified_geometry | \`oslobyleksikon:grorud-strok\` |\n| \`sagene\` | verified_geometry | \`oslobyleksikon:sagene-strok\` |\n| \`saga_kino\` | verified | \`${finderResults.saga_kino.sourceObjectId}\` |\n| \`klingenberg_kino\` | verified | \`${finderResults.klingenberg_kino.sourceObjectId}\` |\n| \`gimle_kino\` | verified | \`${finderResults.gimle_kino.sourceObjectId}\` |\n| \`vika_kino\` | verified | \`${finderResults.vika_kino.sourceObjectId}\` |\n| \`hartvig_nissens_skole_skam\` | needs_review | Flere Geonorge-treff; eksisterende koordinat beholdes uendret |\n\n## Hartvig Nissen / SKAM\n\nIdentiteten til det historiske skolebygget er dokumentert, men adressefinneren returnerer flere treff for President Harbitz' gate 11. I tråd med koordinatmetoden velges ikke første eller nærmeste treff. Stedet krever offisiell bygningsgeometri eller en eksplisitt kobling mellom bygningen og ett konkret adressepunkt før canonical koordinat kan godkjennes.\n`);

console.log('Completed Oslo coordinate batch 17: 6 verified, 1 needs_review');
