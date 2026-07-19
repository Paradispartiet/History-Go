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

function parseFinder(file, label) {
  const raw = fs.readFileSync(file, 'utf8');
  const start = raw.indexOf('{');
  if (start < 0) throw new Error(`Fant ikke JSON i koordinatfinner-resultatet for ${label}`);
  return JSON.parse(raw.slice(start));
}

function readVerifiedFinder(file, label) {
  const result = parseFinder(file, label);
  if (!result?.ok || result?.status !== 'verified_candidate' || !result?.coordinate || !result?.sourceObjectId) {
    throw new Error(`${label} fikk ikke entydig verified_candidate fra Geonorge: ` + JSON.stringify({ status: result?.status, reason: result?.reason }));
  }
  return result;
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
  klassekampen_redaksjon: {
    label: 'Klassekampen-redaksjonen',
    address: 'Grønland 4 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Klassekampens nåværende besøksadresse Grønland 4. Klassekampens offisielle kontaktside dokumenterer samme adresse. Recorden oppdateres fra den utdaterte Hausmanns gate-identiteten til dagens redaksjonsanker.'
  },
  oslo_gassverk: {
    label: 'Oslo Gassverk – bevart kontorbygning',
    address: 'Storgata 36C Oslo',
    note: 'Historisk representasjonsanker for Oslo/Christiania Gassverk ved den bevarte kontorbygningen i Storgata 36C. Oslo byleksikon dokumenterer at gassverket lå ved Storgata/Hausmanns gate og at kontorbygningen fra 1883 er bevart. Adressepunktet brukes eksplisitt som fysisk rest-anker, ikke som sentrum for hele det tidligere gassverksområdet.'
  },
  oslo_posthus: {
    label: 'Oslo Hovedpostkontor',
    address: 'Dronningens gate 15 Oslo',
    note: 'Offisiell adressekoordinat fra Geonorge Adresser API for Hovedpostkontoret i Dronningens gate 15. Oslo byleksikon dokumenterer bygget som hovedpostkontor oppført 1914–24 og hovedterminal til 1975. Det gamle punktet ved Postgirobygget var feil for denne 1924-recorden og flyttes til det historiske hovedpostkontoret.'
  }
};

const finderResults = {};
for (const [id, def] of Object.entries(finderDefs)) {
  finderResults[id] = readVerifiedFinder(path.join(REPORT_DIR, `${id}-geonorge.json`), def.label);
}

const telegrafLookup = parseFinder(
  path.join(REPORT_DIR, 'telegrafbygningen-geonorge.json'),
  'Telegrafbygningen'
);
if (telegrafLookup?.status !== 'needs_review') {
  throw new Error('Forventet needs_review fra Geonorge for Telegrafbygningen, fikk: ' + JSON.stringify({ status: telegrafLookup?.status, reason: telegrafLookup?.reason }));
}

const telegrafFallback = {
  lat: 59.91128055555556,
  lon: 10.742319444444444,
  r: 140,
  locatorType: 'building',
  sourceProvider: 'manual_research',
  sourceObjectId: 'wikidata:Q17195132',
  geocodeAccuracy: 'building',
  coordRole: 'building_center',
  coordType: 'building_center',
  coordStatus: 'verified_geometry',
  coordSource: 'Wikidata Q17195132 / OSM relation 13931026 / Telenor Kulturarv',
  coordSourceId: 'wikidata:Q17195132',
  coordSourceUrl: 'https://www.wikidata.org/wiki/Q17195132',
  coordVerifiedAt: DATE,
  coordNote: 'Geonorge-oppslaget for Kongens gate 21 ga flere ikke-entydige treff og ble ikke brukt. Bygningsankeret bruker det identifiserte Telegrafbygningen-objektet Wikidata Q17195132, kryssjekket mot OSM relation 13931026, Kulturminne 163682, Oslo byleksikon og Telenor Kulturarv. Punktet representerer selve Telegrafbygningen.'
};

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
  telegrafbygningen: telegrafFallback
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
    if (!updates[entry.id]) continue;
    entry.sha256 = sha256(path.join(path.dirname(manifestPath), entry.file));
    const source = aggregate.find((p) => p?.id === entry.id);
    if (source?.name) entry.name = source.name;
  }
  writeJson(manifestPath, manifest);

  const index = readJson(indexPath);
  for (const id of Object.keys(updates)) {
    const row = index.find((p) => p?.id === id);
    const source = aggregate.find((p) => p?.id === id);
    if (!row || !source) throw new Error(`Mangler index/source for ${id}`);
    for (const key of ['name', 'lat', 'lon', 'r', 'coordType', 'coordStatus']) {
      if (source[key] !== undefined) row[key] = source[key];
    }
  }
  writeJson(indexPath, index);
  return aggregate;
}

const mediaAggregate = updateAggregateSplit({
  aggregatePath: MEDIA,
  aggregateRel: MEDIA_REL,
  splitDir: MEDIA_SPLIT_DIR,
  manifestPath: MEDIA_MANIFEST,
  indexPath: MEDIA_INDEX,
  updates: mediaUpdates
});
const naerAggregate = updateAggregateSplit({
  aggregatePath: NAER,
  aggregateRel: NAER_REL,
  splitDir: NAER_SPLIT_DIR,
  manifestPath: NAER_MANIFEST,
  indexPath: NAER_INDEX,
  updates: naerUpdates
});

const places = {};
for (const id of ['good_game_redaksjon', 'aftenposten_akersgata', 'dagbladet_akersgata', 'klassekampen_redaksjon']) {
  places[id] = mediaAggregate.find((p) => p?.id === id);
}
for (const id of ['oslo_gassverk', 'oslo_posthus', 'telegrafbygningen']) {
  places[id] = naerAggregate.find((p) => p?.id === id);
}

const appliedDefs = {
  klassekampen_redaksjon: {
    file: 'oslo/media/klassekampen_redaksjon.json',
    placeFile: MEDIA_REL,
    name: 'Klassekampen-redaksjonen',
    resolved: 'Klassekampens nåværende redaksjon på Grønland 4',
    finding: 'Klassekampens offisielle kontaktside dokumenterer besøksadressen Grønland 4; Geonorge gir ett entydig offisielt adressepunkt.',
    address: finderDefs.klassekampen_redaksjon.address,
    addressResult: finderResults.klassekampen_redaksjon,
    sourceQuality: 'official_address_plus_documented_identity'
  },
  oslo_gassverk: {
    file: 'oslo/naeringsliv/oslo_gassverk.json',
    placeFile: NAER_REL,
    name: 'Oslo Gassverk',
    resolved: 'det historiske gassverksområdet representert ved den bevarte kontorbygningen Storgata 36C',
    finding: 'Oslo byleksikon dokumenterer Gassverket ved Storgata/Hausmanns gate og den bevarte kontorbygningen i Storgata 36C; Geonorge gir et entydig adressepunkt for den fysiske resten.',
    address: finderDefs.oslo_gassverk.address,
    addressResult: finderResults.oslo_gassverk,
    sourceQuality: 'historical_identity_plus_surviving_physical_anchor'
  },
  oslo_posthus: {
    file: 'oslo/naeringsliv/oslo_posthus.json',
    placeFile: NAER_REL,
    name: 'Oslo Posthus',
    resolved: 'Hovedpostkontoret i Dronningens gate 15',
    finding: 'Oslo byleksikon dokumenterer Hovedpostkontoret oppført 1914–24 i Dronningens gate 15; Geonorge gir ett entydig adressepunkt.',
    address: finderDefs.oslo_posthus.address,
    addressResult: finderResults.oslo_posthus,
    sourceQuality: 'official_address_plus_documented_identity'
  },
  telegrafbygningen: {
    file: 'oslo/naeringsliv/telegrafbygningen.json',
    placeFile: NAER_REL,
    name: 'Telegrafbygningen',
    resolved: 'Telegrafbygningen i Kongens gate 21 som identifisert bygningsobjekt',
    finding: 'Geonorge ga flere ikke-entydige adressepunkter for Kongens gate 21. Wikidata Q17195132, OSM relation 13931026, Kulturminne 163682, Oslo byleksikon og Telenor Kulturarv identifiserer samme Telegrafbygning, og objektpunktet brukes derfor som bygningsanker.',
    address: 'Kongens gate 21 Oslo',
    addressResult: telegrafLookup,
    sourceQuality: 'crosschecked_building_object_after_ambiguous_address'
  }
};

for (const [id, definition] of Object.entries(appliedDefs)) {
  const place = places[id];
  const addressVerified = definition.addressResult?.status === 'verified_candidate';
  writeJson(path.join(EVIDENCE_ROOT, definition.file), {
    placeId: id,
    placeFile: definition.placeFile,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: {
      currentName: definition.name,
      resolvedIdentity: definition.resolved,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: place.locatorType,
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: ['stabil kildeidentitet', 'objekttilpasset representasjonsanker', 'fysisk avgrensning mot nærliggende canonical steder'],
    evidence: [{
      sourceProvider: place.sourceProvider,
      sourceName: place.coordSource,
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: definition.sourceQuality,
      finding: definition.finding,
      canVerifyCoordinate: true,
      reason: place.coordNote
    }],
    addressCandidates: [{
      address: definition.address,
      sourceProvider: 'official_address',
      sourceObjectId: addressVerified ? definition.addressResult.sourceObjectId : null,
      canApplyToPlace: addressVerified,
      reason: addressVerified ? 'Entydig Geonorge-adressekandidat.' : String(definition.addressResult?.reason || 'Adresseoppslaget kunne ikke anvendes direkte.')
    }],
    sourceObjectCandidates: [{
      sourceProvider: place.sourceProvider,
      sourceObjectId: place.sourceObjectId,
      canApplyToPlace: true
    }],
    geometryCandidates: id === 'telegrafbygningen' ? [{
      sourceProvider: 'osm',
      sourceObjectId: 'osm-relation:13931026',
      canApplyToPlace: true
    }] : [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.'
    },
    notes: [place.coordNote]
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

for (const [id, definition] of Object.entries(reviewDefs)) {
  const place = places[id];
  writeJson(path.join(EVIDENCE_ROOT, definition.file), {
    placeId: id,
    placeFile: MEDIA_REL,
    evidenceStatus: 'needs_research',
    coordinateDecision: 'needs_identity_split',
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: definition.resolved,
      identityStatus: 'conflict',
      identityProblem: definition.problem,
      locatorTypeCandidate: id === 'good_game_redaksjon' ? 'building' : 'linear_area',
      requiresSplit: false,
      splitReason: definition.problem
    },
    requiredEvidence: ['entydig fysisk scope for canonical place', 'overlap-audit mot eksisterende canonical bygg', 'eventuelle flerankre for historiske adresseforløp'],
    evidence: [{
      sourceProvider: 'manual_research',
      sourceName: 'History Go overlap-audit + dokumentert mediehistorie',
      sourceUrl: '',
      sourceObjectId: `history-go:coordinate-control:${id}`,
      sourceQuality: 'identity_and_overlap_audit',
      finding: definition.problem,
      canVerifyCoordinate: false,
      reason: definition.problem
    }],
    addressCandidates: [],
    sourceObjectCandidates: [],
    geometryCandidates: [],
    coordinateCandidates: [],
    decision: { canBecomeVerified: false, blockedReason: definition.problem, nextAction: definition.next },
    notes: ['Ingen koordinatendring i batch 22.']
  });
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const file of [
  ...Object.values(appliedDefs).map((definition) => definition.file),
  ...Object.values(reviewDefs).map((definition) => definition.file)
]) {
  if (!evidenceManifest.files.includes(file)) evidenceManifest.files.push(file);
}
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = replaceRequired(
  protocol,
  'Oslo-tabellen inneholder nå 124 verifiserte eller kildekontrollerte canonical steder. Batch 21 starter den sekundære Oslo-kildekøen og godkjenner 6 nye ankere: Ekebergparken, Camilla Collett-statuen, Henrik Wergeland-statuen, Grotten, Eldorado Bokhandel, Gamle Deichman. Ibsen-sitatene står som nye dokumenterte `needs_review`-utfall. 10 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat. Sekundærkøen bruker Oslo-manifeststier i leksikografisk rekkefølge, bevarer record-rekkefølgen i hvert manifest og hopper over placeId-er som allerede er kontrollert.',
  'Oslo-tabellen inneholder nå 128 verifiserte eller kildekontrollerte canonical steder. Batch 22 godkjenner fire nye ankere: Klassekampen-redaksjonen på dagens Grønland 4, Oslo Gassverk ved den bevarte kontorbygningen i Storgata 36C, det historiske Hovedpostkontoret i Dronningens gate 15 og Telegrafbygningen som identifisert bygningsobjekt i Kongens gate 21. Good Game-redaksjonen, Aftenposten i Akersgata og Dagbladet i Akersgata står som nye dokumenterte `needs_review`-utfall på grunn av fysisk overlap eller fleradresse-identitet. 13 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat. Sekundærkøen fortsetter i `naeringsliv` etter at `media` er ferdig og `musikk` ikke ga nye placeId-er.',
  'Oslo summary'
);

const lastApproved = '| 21 | `gamle_deichman` | Gamle Deichman | verified | `geonorge-adresser-v1:0301:10244:4` |';
const rows = [
  `| 22 | \`klassekampen_redaksjon\` | Klassekampen-redaksjonen | verified | \`${finderResults.klassekampen_redaksjon.sourceObjectId}\` |`,
  '| 22 | `oslo_gassverk` | Oslo Gassverk | verified_historical_source | `oslobyleksikon:gassverket:storgata-36c` |',
  `| 22 | \`oslo_posthus\` | Oslo Posthus / Hovedpostkontoret | verified | \`${finderResults.oslo_posthus.sourceObjectId}\` |`,
  '| 22 | `telegrafbygningen` | Telegrafbygningen | verified_geometry | `wikidata:Q17195132` |'
].join('\n');
protocol = replaceRequired(protocol, lastApproved, lastApproved + '\n' + rows, 'batch 22 rows');
protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 124 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 128 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
);

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
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 22

Dato: ${DATE}

Sju kontroller er fullført. Fire steder er godkjent og tre medie-records er dokumentert som needs_review på grunn av fysisk overlap eller fleradresse-identitet.

| placeId | resultat | kilde / avgjørelse |
|---|---|---|
| \`good_game_redaksjon\` | needs_review | delmiljø inne i canonical NRK Marienlyst |
| \`aftenposten_akersgata\` | needs_review | overlap med A55 / historisk fleradresse |
| \`dagbladet_akersgata\` | needs_review | historisk fleradresse 36 og 47/49 |
| \`klassekampen_redaksjon\` | verified | \`${finderResults.klassekampen_redaksjon.sourceObjectId}\` |
| \`oslo_gassverk\` | verified_historical_source | \`oslobyleksikon:gassverket:storgata-36c\` |
| \`oslo_posthus\` | verified | \`${finderResults.oslo_posthus.sourceObjectId}\` |
| \`telegrafbygningen\` | verified_geometry | \`wikidata:Q17195132\` |

## Viktige identitetsavgjørelser

- Klassekampen-recorden er korrigert fra den utdaterte Hausmanns gate-identiteten til dagens offisielle Grønland 4.
- Gassverket forankres til den bevarte kontorbygningen i Storgata 36C, ikke til et oppdiktet sentrum for hele det revne produksjonsområdet.
- Oslo Posthus-recorden fra 1924 flyttes fra Postgirobygget til det faktiske Hovedpostkontoret i Dronningens gate 15.
- Geonorge-oppslaget for Telegrafbygningen var flertydig; det ble avvist som direkte koordinatkilde. Telegrafbygningen forankres i stedet til det identifiserte objektet Wikidata Q17195132, kryssjekket mot OSM relation 13931026, Kulturminne 163682, Oslo byleksikon og Telenor Kulturarv.
- Good Game, Aftenposten og Dagbladet godkjennes ikke som nye separate fysiske punkter uten videre identitetsmodellering.
`);

console.log('Completed Oslo coordinate batch 22: 4 verified, 3 needs_review');
