import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-22');
const REPORT = path.join(REPORT_DIR, 'README.md');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');

const MEDIA_REL = 'data/places/media/oslo/places_oslo_media.json';
const MEDIA = path.join(ROOT, MEDIA_REL);
const MEDIA_SPLIT_DIR = path.join(ROOT, 'data/places/media/oslo/places_oslo_media');
const MEDIA_MANIFEST = path.join(ROOT, 'data/places/media/oslo/places_oslo_media_manifest.json');
const MEDIA_INDEX = path.join(ROOT, 'data/places/media/oslo/places_oslo_media_index.json');

const NAER_REL = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const NAER = path.join(ROOT, NAER_REL);
const NAER_SPLIT_DIR = path.join(ROOT, 'data/places/naeringsliv/oslo/places_naeringsliv');
const NAER_MANIFEST = path.join(ROOT, 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json');
const NAER_INDEX = path.join(ROOT, 'data/places/naeringsliv/oslo/places_naeringsliv_index.json');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const replaceRequired = (text, from, to, label) => { if (!text.includes(from)) throw new Error('Mangler forventet tekst: ' + label); return text.replace(from, to); };
const snapshot = (p) => ({ lat: p?.lat ?? null, lon: p?.lon ?? null, r: p?.r ?? null, coordStatus: p?.coordStatus ?? '', coordSource: p?.coordSource ?? '', coordType: p?.coordType ?? '', coordNote: p?.coordNote ?? '' });

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
function finderUpdate(result, note) {
  return { ...result.coordinate, sourceObjectId: result.sourceObjectId, coordSourceId: result.sourceObjectId, coordSourceUrl: result.sourceUrl, coordVerifiedAt: DATE, coordNote: note };
}

const finderDefs = {
  klassekampen_redaksjon: {
    label: 'Klassekampen-redaksjonen', address: 'Grønland 4 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Klassekampens nåværende besøksadresse Grønland 4. Klassekampens offisielle kontaktside dokumenterer samme adresse. Recorden oppdateres fra den utdaterte Hausmanns gate-identiteten til dagens redaksjonsanker.'
  },
  oslo_gassverk: {
    label: 'Oslo Gassverk – bevart kontorbygning', address: 'Storgata 36C Oslo',
    note: 'Historisk representasjonsanker for Oslo/Christiania Gassverk ved den bevarte kontorbygningen i Storgata 36C. Oslo byleksikon dokumenterer at gassverket lå ved Storgata/Hausmanns gate og at kontorbygningen fra 1883 er bevart. Adressepunktet brukes eksplisitt som fysisk rest-anker, ikke som sentrum for hele det tidligere gassverksområdet.'
  },
  oslo_posthus: {
    label: 'Oslo Hovedpostkontor', address: 'Dronningens gate 15 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Hovedpostkontoret i Dronningens gate 15. Oslo byleksikon dokumenterer bygget som hovedpostkontor oppført 1914–24 og hovedterminal til 1975. Det gamle punktet ved Postgirobygget var feil for denne 1924-recorden og flyttes til det historiske hovedpostkontoret.'
  },
  telegrafbygningen: {
    label: 'Telegrafbygningen', address: 'Kongens gate 21 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Telegrafbygningen i Kongens gate 21. Oslo byleksikon dokumenterer bygget som Telegrafverkets monumentalbygg oppført 1916–24. Punktet representerer selve bygningen.'
  }
};
const finderResults = {};
for (const [id, def] of Object.entries(finderDefs)) finderResults[id] = readFinder(path.join(REPORT_DIR, `${id}-geonorge.json`), def.label);

const mediaUpdates = {
  klassekampen_redaksjon: {
    ...finderUpdate(finderResults.klassekampen_redaksjon, finderDefs.klassekampen_redaksjon.note),
    name: 'Klassekampen-redaksjonen',
    tags: ['klassekampen', 'gronland', 'avis'],
    popupDesc: 'Klassekampen-redaksjonen på Grønland 4 er et arbeidssted der nyhetsdekning, analyse og kulturjournalistikk utvikles i samme redaksjonelle miljø. I de daglige møtene formes prioriteringer, vinklinger og kommentarstoff før innholdet går ut i papir og digitale flater. Beliggenheten i indre by gir kort avstand til kilder, debattarenaer og politiske miljøer. Stedet kobler en tydelig redaksjonell profil til konkret bygeografi.'
  }
};

const gasResult = finderResults.oslo_gassverk;
const naerUpdates = {
  oslo_gassverk: {
    lat: gasResult.coordinate.lat,
    lon: gasResult.coordinate.lon,
    r: 120,
    locatorType: 'historic_site',
    sourceProvider: 'manual_research',
    sourceObjectId: 'oslobyleksikon:gassverket:storgata-36c',
    geocodeAccuracy: 'building',
    coordRole: 'historical_anchor',
    coordType: 'surviving_gasworks_building_anchor',
    coordStatus: 'verified_historical_source',
    coordSource: 'Oslo byleksikon – Gassverket / Geonorge Storgata 36C',
    coordSourceId: gasResult.sourceObjectId,
    coordSourceUrl: 'https://oslobyleksikon.no/side/Gassverket',
    coordVerifiedAt: DATE,
    coordNote: finderDefs.oslo_gassverk.note
  },
  oslo_posthus: finderUpdate(finderResults.oslo_posthus, finderDefs.oslo_posthus.note),
  telegrafbygningen: finderUpdate(finderResults.telegrafbygningen, finderDefs.telegrafbygningen.note)
};

function updateAggregateSplit({ aggregatePath, aggregateRel, splitDir, manifestPath, indexPath, updates }) {
  const aggregate = readJson(aggregatePath);
  for (const [id, update] of Object.entries(updates)) {
    const row = aggregate.find((p) => p?.id === id);
    if (!row) throw new Error(`Mangler ${id} i ${aggregateRel}`);
    Object.assign(row, update); delete row.coordPrecision; delete row.coordPrecisionM;
  }
  writeJson(aggregatePath, aggregate);

  for (const [id, update] of Object.entries(updates)) {
    const file = path.join(splitDir, id + '.json');
    const row = readJson(file);
    Object.assign(row, update); delete row.coordPrecision; delete row.coordPrecisionM; writeJson(file, row);
  }

  const manifest = readJson(manifestPath);
  manifest.source_sha256 = sha256(aggregatePath); manifest.generated_at = new Date().toISOString();
  for (const entry of manifest.places || []) {
    if (!updates[entry.id]) continue;
    entry.sha256 = sha256(path.join(path.dirname(manifestPath), entry.file));
    const source = aggregate.find((p) => p?.id === entry.id);
    if (source?.name) entry.name = source.name;
  }
  writeJson(manifestPath, manifest);

  const index = readJson(indexPath);
  for (const id of Object.keys(updates)) {
    const row = index.find((p) => p?.id === id); const source = aggregate.find((p) => p?.id === id);
    if (!row || !source) throw new Error(`Mangler index/source for ${id}`);
    for (const key of ['name','lat','lon','r','coordType','coordStatus']) if (source[key] !== undefined) row[key] = source[key];
  }
  writeJson(indexPath, index);
  return aggregate;
}

const mediaAggregate = updateAggregateSplit({ aggregatePath: MEDIA, aggregateRel: MEDIA_REL, splitDir: MEDIA_SPLIT_DIR, manifestPath: MEDIA_MANIFEST, indexPath: MEDIA_INDEX, updates: mediaUpdates });
const naerAggregate = updateAggregateSplit({ aggregatePath: NAER, aggregateRel: NAER_REL, splitDir: NAER_SPLIT_DIR, manifestPath: NAER_MANIFEST, indexPath: NAER_INDEX, updates: naerUpdates });

const places = {};
for (const id of ['good_game_redaksjon','aftenposten_akersgata','dagbladet_akersgata','klassekampen_redaksjon']) places[id] = mediaAggregate.find((p) => p?.id === id);
for (const id of ['oslo_gassverk','oslo_posthus','telegrafbygningen']) places[id] = naerAggregate.find((p) => p?.id === id);

const appliedDefs = {
  klassekampen_redaksjon: ['oslo/media/klassekampen_redaksjon.json', MEDIA_REL, 'Klassekampen-redaksjonen', 'Klassekampens nåværende redaksjon på Grønland 4', 'Klassekampens offisielle kontaktside dokumenterer besøksadressen Grønland 4; Geonorge gir ett entydig offisielt adressepunkt.'],
  oslo_gassverk: ['oslo/naeringsliv/oslo_gassverk.json', NAER_REL, 'Oslo Gassverk', 'det historiske gassverksområdet representert ved den bevarte kontorbygningen Storgata 36C', 'Oslo byleksikon dokumenterer Gassverket ved Storgata/Hausmanns gate og den bevarte kontorbygningen i Storgata 36C; Geonorge gir et entydig adressepunkt for den fysiske resten.'],
  oslo_posthus: ['oslo/naeringsliv/oslo_posthus.json', NAER_REL, 'Oslo Posthus', 'Hovedpostkontoret i Dronningens gate 15', 'Oslo byleksikon dokumenterer Hovedpostkontoret oppført 1914–24 i Dronningens gate 15; Geonorge gir ett entydig adressepunkt.'],
  telegrafbygningen: ['oslo/naeringsliv/telegrafbygningen.json', NAER_REL, 'Telegrafbygningen', 'Telegrafbygningen i Kongens gate 21', 'Oslo byleksikon dokumenterer Telegrafbygningen i Kongens gate 21; Geonorge gir ett entydig adressepunkt.']
};
for (const [id, d] of Object.entries(appliedDefs)) {
  const place = places[id];
  const def = finderDefs[id];
  writeJson(path.join(EVIDENCE_ROOT, d[0]), {
    placeId: id, placeFile: d[1], evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet', currentCoordinate: snapshot(place),
    identity: { currentName: d[2], resolvedIdentity: d[3], identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: '' },
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'fysisk avgrensning mot nærliggende canonical steder'],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: id === 'oslo_gassverk' ? 'historical_identity_plus_surviving_physical_anchor' : 'official_address_plus_documented_identity', finding: d[4], canVerifyCoordinate: true, reason: place.coordNote }],
    addressCandidates: [{ address: def.address, sourceProvider: 'official_address', sourceObjectId: finderResults[id].sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }], geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' }, notes: [place.coordNote]
  });
}

const reviewDefs = {
  good_game_redaksjon: {
    file: 'oslo/media/good_game_redaksjon.json',
    resolved: 'Good Game som redaksjonelt program-/desk-miljø inne i NRKs Marienlyst-kompleks',
    problem: 'Recorden beskriver et redaksjonelt delmiljø, ikke et eget dokumentert fysisk sted. Den overlapper det allerede canonical NRK-huset på Marienlyst.',
    next: 'Modeller Good Game som subplace/relation til `nrk_huset_marienlyst`, eller dokumenter et eget studio-/romanker før separat place-koordinat godkjennes.'
  },
  aftenposten_akersgata: {
    file: 'oslo/media/aftenposten_akersgata.json',
    resolved: 'Aftenpostens Akersgata-forankring gjennom historiske 51/53 og 55, med dagens redaksjon i Akersgata 55',
    problem: 'Recorden blander en historisk fleradresse-forankring med dagens Akersgata 55, som allerede er det canonical `vg_huset`-bygget. Ett nytt punkt ville enten duplisere A55 eller skjule de eldre adressene.',
    next: 'Avklar om recorden skal være en historisk flerankret Akersgata-record eller en institusjonsrelation til `vg_huset`/Akersgata 55.'
  },
  dagbladet_akersgata: {
    file: 'oslo/media/dagbladet_akersgata.json',
    resolved: 'Dagbladets historiske Akersgata-forankring i nr. 36 og 47/49 fram til flyttingen i 2008',
    problem: 'Recorden representerer flere historiske redaksjonsadresser, men har bare ett punkt og ingen kildebelagte flerankre.',
    next: 'Modeller de historiske adressene som flere ankere eller velg ett eksplisitt tidsavgrenset hovedanker før koordinaten godkjennes.'
  }
};
for (const [id, d] of Object.entries(reviewDefs)) {
  const place = places[id];
  writeJson(path.join(EVIDENCE_ROOT, d.file), {
    placeId: id, placeFile: MEDIA_REL, evidenceStatus: 'needs_research', coordinateDecision: 'needs_identity_split', currentCoordinate: snapshot(place),
    identity: { currentName: place.name, resolvedIdentity: d.resolved, identityStatus: 'conflict', identityProblem: d.problem, locatorTypeCandidate: id === 'good_game_redaksjon' ? 'building' : 'linear_area', requiresSplit: false, splitReason: d.problem },
    requiredEvidence: ['entydig fysisk scope for canonical place', 'overlap-audit mot eksisterende canonical bygg', 'eventuelle flerankre for historiske adresseforløp'],
    evidence: [{ sourceProvider: 'manual_research', sourceName: 'History Go overlap-audit + dokumentert mediehistorie', sourceUrl: '', sourceObjectId: `history-go:coordinate-control:${id}`, sourceQuality: 'identity_and_overlap_audit', finding: d.problem, canVerifyCoordinate: false, reason: d.problem }],
    addressCandidates: [], sourceObjectCandidates: [], geometryCandidates: [], coordinateCandidates: [],
    decision: { canBecomeVerified: false, blockedReason: d.problem, nextAction: d.next }, notes: ['Ingen koordinatendring i batch 22.']
  });
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const file of [...Object.values(appliedDefs).map((d) => d[0]), ...Object.values(reviewDefs).map((d) => d.file)]) if (!evidenceManifest.files.includes(file)) evidenceManifest.files.push(file);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = replaceRequired(
  protocol,
  'Oslo-tabellen inneholder nå 124 verifiserte eller kildekontrollerte canonical steder. Batch 21 starter den sekundære Oslo-kildekøen og godkjenner 6 nye ankere: Ekebergparken, Camilla Collett-statuen, Henrik Wergeland-statuen, Grotten, Eldorado Bokhandel, Gamle Deichman. Ibsen-sitatene står som nye dokumenterte `needs_review`-utfall. 10 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat. Sekundærkøen bruker Oslo-manifeststier i leksikografisk rekkefølge, bevarer record-rekkefølgen i hvert manifest og hopper over placeId-er som allerede er kontrollert.',
  'Oslo-tabellen inneholder nå 128 verifiserte eller kildekontrollerte canonical steder. Batch 22 godkjenner fire nye ankere: Klassekampen-redaksjonen på dagens Grønland 4, Oslo Gassverk ved den bevarte kontorbygningen i Storgata 36C, det historiske Hovedpostkontoret i Dronningens gate 15 og Telegrafbygningen i Kongens gate 21. Good Game-redaksjonen, Aftenposten i Akersgata og Dagbladet i Akersgata står som nye dokumenterte `needs_review`-utfall på grunn av fysisk overlap eller fleradresse-identitet. 13 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat. Sekundærkøen fortsetter i `naeringsliv` etter at `media` er ferdig og `musikk` ikke ga nye placeId-er.',
  'Oslo summary'
);
const lastApproved = '| 21 | `gamle_deichman` | Gamle Deichman | verified | `geonorge-adresser-v1:0301:10244:4` |';
const rows = [
  `| 22 | \`klassekampen_redaksjon\` | Klassekampen-redaksjonen | verified | \`${finderResults.klassekampen_redaksjon.sourceObjectId}\` |`,
  '| 22 | `oslo_gassverk` | Oslo Gassverk | verified_historical_source | `oslobyleksikon:gassverket:storgata-36c` |',
  `| 22 | \`oslo_posthus\` | Oslo Posthus / Hovedpostkontoret | verified | \`${finderResults.oslo_posthus.sourceObjectId}\` |`,
  `| 22 | \`telegrafbygningen\` | Telegrafbygningen | verified | \`${finderResults.telegrafbygningen.sourceObjectId}\` |`
].join('\n');
protocol = replaceRequired(protocol, lastApproved, lastApproved + '\n' + rows, 'batch 22 rows');
protocol = protocol.replace('Disse kontrollene er fullført, men teller ikke blant de 124 verifiserte eller kildekontrollerte canonical Oslo-stedene.', 'Disse kontrollene er fullført, men teller ikke blant de 128 verifiserte eller kildekontrollerte canonical Oslo-stedene.');
const ibsenRow = '| `ibsen_quotes` – Ibsen sitater / Sitatgaten | needs_review | Den fysiske installasjonen består av 69 sitater langs Karl Johans gate og Henrik Ibsens gate, men recorden har bare ett punkt og ingen kildebelagt traségeometri. | Krever rutegeometri eller flere kildebelagte ankere før canonical koordinat kan godkjennes. |';
const reviewRows = [
  '| `good_game_redaksjon` – Good Game-redaksjonen (NRK) | needs_review | Redaksjonelt delmiljø inne i allerede canonical NRK Marienlyst; ingen separat fysisk lokasjon er dokumentert. | Modeller som subplace/relation til `nrk_huset_marienlyst`, eller dokumenter eget studio-/romanker. |',
  '| `aftenposten_akersgata` – Aftenposten i Akersgata | needs_review | Dagens Akersgata 55 overlapper canonical `vg_huset`, mens den historiske recorden også omfatter 51/53. | Avklar om stedet skal være historisk flerankret Akersgata-record eller institusjonsrelation til A55. |',
  '| `dagbladet_akersgata` – Dagbladet i Akersgata | needs_review | Historisk redaksjonsforankring omfatter både Akersgata 36 og 47/49, men recorden har bare ett punkt. | Krever flerankre eller et eksplisitt tidsavgrenset hovedanker. |'
].join('\n');
protocol = replaceRequired(protocol, ibsenRow, ibsenRow + '\n' + reviewRows, 'batch 22 review rows');
protocol = replaceRequired(
  protocol,
  '- Neste nye Oslo-kontroll er nummer 133 og starter batch 22.\n- Batch 21 er fullført med 6 godkjente ankere og 1 nye dokumenterte `needs_review`-utfall.\n- Sekundær Oslo-kildekø: sorter Oslo-manifeststier leksikografisk, behold `order` i hvert manifest og hopp over alle placeId-er som allerede står i protokollen.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  '- Neste nye Oslo-kontroll er nummer 140 og starter batch 23.\n- Batch 22 er fullført med fire godkjente ankere og tre nye dokumenterte `needs_review`-utfall.\n- Sekundærkøen fortsetter i `data/places/naeringsliv/oslo/places_naeringsliv_manifest.json` fra første ukontrollerte record etter `telegrafbygningen`.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  'next work'
);
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 22\n\nDato: ${DATE}\n\nSju kontroller er fullført. Fire steder er godkjent og tre medie-records er dokumentert som needs_review på grunn av fysisk overlap eller fleradresse-identitet.\n\n| placeId | resultat | kilde / avgjørelse |\n|---|---|---|\n| \`good_game_redaksjon\` | needs_review | delmiljø inne i canonical NRK Marienlyst |\n| \`aftenposten_akersgata\` | needs_review | overlap med A55 / historisk fleradresse |\n| \`dagbladet_akersgata\` | needs_review | historisk fleradresse 36 og 47/49 |\n| \`klassekampen_redaksjon\` | verified | \`${finderResults.klassekampen_redaksjon.sourceObjectId}\` |\n| \`oslo_gassverk\` | verified_historical_source | \`oslobyleksikon:gassverket:storgata-36c\` |\n| \`oslo_posthus\` | verified | \`${finderResults.oslo_posthus.sourceObjectId}\` |\n| \`telegrafbygningen\` | verified | \`${finderResults.telegrafbygningen.sourceObjectId}\` |\n\n## Viktige identitetsavgjørelser\n\n- Klassekampen-recorden er korrigert fra den utdaterte Hausmanns gate-identiteten til dagens offisielle Grønland 4.\n- Gassverket forankres til den bevarte kontorbygningen i Storgata 36C, ikke til et oppdiktet sentrum for hele det revne produksjonsområdet.\n- Oslo Posthus-recorden fra 1924 flyttes fra Postgirobygget til det faktiske Hovedpostkontoret i Dronningens gate 15.\n- Good Game, Aftenposten og Dagbladet godkjennes ikke som nye separate fysiske punkter uten videre identitetsmodellering.\n`);

console.log('Completed Oslo coordinate batch 22: 4 verified, 3 needs_review');
