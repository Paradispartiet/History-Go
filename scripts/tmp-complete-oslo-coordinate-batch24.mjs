import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const SOURCE_REL = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const SOURCE = path.join(ROOT, SOURCE_REL);
const SPLIT_DIR = path.join(ROOT, 'data/places/naeringsliv/oslo/places_naeringsliv');
const SPLIT_MANIFEST = path.join(ROOT, 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json');
const INDEX = path.join(ROOT, 'data/places/naeringsliv/oslo/places_naeringsliv_index.json');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-24');
const REPORT = path.join(REPORT_DIR, 'README.md');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const snapshot = (place) => ({
  lat: place?.lat ?? null,
  lon: place?.lon ?? null,
  r: place?.r ?? null,
  coordStatus: place?.coordStatus ?? '',
  coordSource: place?.coordSource ?? '',
  coordType: place?.coordType ?? '',
  coordNote: place?.coordNote ?? '',
});

function parseFinder(file, label) {
  const raw = fs.readFileSync(file, 'utf8');
  const start = raw.indexOf('{');
  if (start < 0) throw new Error(`Fant ikke JSON i Geonorge-resultatet for ${label}`);
  const result = JSON.parse(raw.slice(start));
  if (!result?.ok || result?.status !== 'verified_candidate' || !result?.coordinate || !result?.sourceObjectId) {
    throw new Error(`${label} fikk ikke entydig verified_candidate: ${JSON.stringify({ status: result?.status, reason: result?.reason })}`);
  }
  return result;
}

function requirePlace(byId, id) {
  const place = byId.get(id);
  if (!place) throw new Error(`Mangler ${id} i ${SOURCE_REL}`);
  return place;
}

function applyAddress(place, result, note) {
  Object.assign(place, {
    lat: result.coordinate.lat,
    lon: result.coordinate.lon,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: result.sourceObjectId,
    address: result.coordinate.address,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.sourceUrl,
    coordType: 'address_point',
    coordVerifiedAt: DATE,
    coordNote: note,
  });
  delete place.coordPrecision;
  delete place.coordPrecisionM;
}

function applyGeometry(place, { lat, lon, sourceProvider, sourceObjectId, sourceUrl, note, accuracy = 'building' }) {
  Object.assign(place, {
    lat,
    lon,
    locatorType: 'building',
    sourceProvider,
    sourceObjectId,
    geocodeAccuracy: accuracy,
    coordRole: 'display_marker',
    coordStatus: 'verified_geometry',
    coordSource: sourceProvider,
    coordSourceId: sourceObjectId,
    coordSourceUrl: sourceUrl,
    coordType: 'building_center',
    coordVerifiedAt: DATE,
    coordNote: note,
  });
  delete place.address;
  delete place.coordPrecision;
  delete place.coordPrecisionM;
}

const schous = parseFinder(
  path.join(REPORT_DIR, 'lookups/schous_bryggeri-trondheimsveien-2-geonorge.json'),
  'Schous bryggeri / Trondheimsveien 2',
);
const ringnes = parseFinder(
  path.join(REPORT_DIR, 'lookups/ringnes_bryggeri-thorvald-meyers-gate-2a-geonorge.json'),
  'Ringnes gamle brygghus / Thorvald Meyers gate 2A',
);

const hjulaRaw = readJson(path.join(REPORT_DIR, 'sources/ovre_foss-hjula-wikidata-Q11975545.json'));
const hjulaCoord = hjulaRaw?.entities?.Q11975545?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
if (!hjulaCoord || !Number.isFinite(hjulaCoord.latitude) || !Number.isFinite(hjulaCoord.longitude)) {
  throw new Error('Wikidata Q11975545 mangler entydig P625-koordinat for Hjula Væverier');
}

const bakerRaw = readJson(path.join(REPORT_DIR, 'sources/akershus_slott_bakeriet-nominatim.json'));
const baker = Array.isArray(bakerRaw)
  ? bakerRaw.find((row) => row?.name === 'Bakeriet' && row?.osm_type === 'way' && Number(row?.osm_id) === 669390521)
  : null;
if (!baker || !Number.isFinite(Number(baker.lat)) || !Number.isFinite(Number(baker.lon))) {
  throw new Error('Fant ikke eksakt OSM-way 669390521 for Bakeriet ved Akershus');
}

const aggregate = readJson(SOURCE);
if (!Array.isArray(aggregate)) throw new Error(`${SOURCE_REL} er ikke en array`);
const byId = new Map(aggregate.map((place) => [place.id, place]));

const ovreFoss = requirePlace(byId, 'ovre_foss');
applyGeometry(ovreFoss, {
  lat: hjulaCoord.latitude,
  lon: hjulaCoord.longitude,
  sourceProvider: 'wikidata',
  sourceObjectId: 'wikidata:Q11975545',
  sourceUrl: 'https://www.wikidata.org/wiki/Q11975545',
  note: 'Navngitt stedspunkt for Hjula Væverier fra Wikidata Q11975545, kryssjekket mot Oslo byleksikons identifikasjon av Hjula Væverier i Sagveien 23. Punktet representerer Hjula-anlegget som recordens fysiske hovedanker, ikke et generisk Øvre Foss-område.',
});

const schousPlace = requirePlace(byId, 'schous_bryggeri');
applyAddress(
  schousPlace,
  schous,
  'Offisiell adressekoordinat fra Geonorge for Trondheimsveien 2, kryssjekket mot Oslo byleksikons identifikasjon av det historiske Schous-anlegget. Punktet brukes som display-marker for det større bryggerikomplekset.',
);

const ringnesPlace = requirePlace(byId, 'ringnes_bryggeri');
applyAddress(
  ringnesPlace,
  ringnes,
  'Offisiell adressekoordinat fra Geonorge for Thorvald Meyers gate 2A, kryssjekket mot Oslo byleksikons identifikasjon av nr. 2A som Ringnes Bryggeris gamle brygghus. Punktet brukes som display-marker for det historiske bryggerikomplekset.',
);

const bakerPlace = requirePlace(byId, 'akershus_slott_bakeriet');
applyGeometry(bakerPlace, {
  lat: Number(baker.lat),
  lon: Number(baker.lon),
  sourceProvider: 'openstreetmap',
  sourceObjectId: 'osm-way:669390521',
  sourceUrl: 'https://www.openstreetmap.org/way/669390521',
  note: 'Navngitt OSM-bygningsobjekt for Bakeriet inne på Akershus festning, kryssjekket mot fredningsforskriften som identifiserer Bakeriet som inventar 0014 fra 1759. Punktet representerer det konkrete bakeribygget, ikke festningen generelt.',
});

writeJson(SOURCE, aggregate);

const approvedIds = [
  'ovre_foss',
  'schous_bryggeri',
  'ringnes_bryggeri',
  'akershus_slott_bakeriet',
];
for (const id of approvedIds) {
  writeJson(path.join(SPLIT_DIR, `${id}.json`), requirePlace(byId, id));
}

const manifest = readJson(SPLIT_MANIFEST);
manifest.source_sha256 = sha256(SOURCE);
manifest.generated_at = new Date().toISOString();
for (const row of manifest.places || []) {
  if (!approvedIds.includes(row.id)) continue;
  row.sha256 = sha256(path.join(path.dirname(SPLIT_MANIFEST), row.file));
}
writeJson(SPLIT_MANIFEST, manifest);

const coordinateFields = [
  'lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address',
  'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource',
  'coordVerifiedAt', 'coordNote',
];
const index = readJson(INDEX);
for (const id of approvedIds) {
  const place = requirePlace(byId, id);
  const row = index.find((item) => item?.id === id);
  if (!row) throw new Error(`Mangler ${id} i næringsliv-index`);
  for (const key of coordinateFields) delete row[key];
  for (const key of coordinateFields) {
    if (Object.prototype.hasOwnProperty.call(place, key)) row[key] = place[key];
  }
}
writeJson(INDEX, index);

function appliedEvidence(id, config) {
  const place = requirePlace(byId, id);
  return {
    placeId: id,
    placeFile: SOURCE_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: config.resolvedIdentity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'building',
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: config.requiredEvidence,
    evidence: config.evidence,
    addressCandidates: config.addressCandidates || [],
    sourceObjectCandidates: config.sourceObjectCandidates || [],
    geometryCandidates: config.geometryCandidates || [],
    coordinateCandidates: [{
      lat: place.lat,
      lon: place.lon,
      coordRole: place.coordRole,
      canApplyToPlace: true,
    }],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Kildebelagt fysisk anker er anvendt på canonical place.',
    },
    notes: [place.coordNote],
  };
}

const appliedEvidenceById = {
  ovre_foss: appliedEvidence('ovre_foss', {
    resolvedIdentity: 'Hjula Væverier ved Hjulafossen / Sagveien 23',
    requiredEvidence: ['entydig fysisk Hjula-identitet', 'navngitt kildeobjekt med koordinat', 'overlap-audit mot Sagene-kvernhus-recorden'],
    evidence: [
      {
        sourceProvider: 'wikidata',
        sourceName: 'Wikidata',
        sourceUrl: 'https://www.wikidata.org/wiki/Q11975545',
        sourceObjectId: 'wikidata:Q11975545',
        sourceQuality: 'named_place_geometry',
        finding: `Wikidata Q11975545 identifiserer Hjula Væverier og gir koordinatet ${ovreFoss.lat}, ${ovreFoss.lon}.`,
        canVerifyCoordinate: true,
        reason: ovreFoss.coordNote,
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Hjula Væverier',
        sourceUrl: 'https://oslobyleksikon.no/side/Hjula_V%C3%A6verier',
        sourceObjectId: 'oslobyleksikon:hjula-vaeverier',
        sourceQuality: 'documented_physical_identity',
        finding: 'Oslo byleksikon identifiserer Hjula Væverier som det historiske industrianlegget i Sagveien 23 ved Hjulafossen.',
        canVerifyCoordinate: true,
        reason: 'Kilden avgrenser recordens fysiske hovedidentitet til Hjula-anlegget.',
      },
    ],
    sourceObjectCandidates: [{ sourceProvider: 'wikidata', sourceObjectId: 'wikidata:Q11975545', canApplyToPlace: true }],
    geometryCandidates: [{ sourceProvider: 'wikidata', sourceObjectId: 'wikidata:Q11975545', canApplyToPlace: true }],
  }),
  schous_bryggeri: appliedEvidence('schous_bryggeri', {
    resolvedIdentity: 'Schous Bryggeri / bryggerikomplekset ved Trondheimsveien 2',
    requiredEvidence: ['entydig offisiell adresse', 'dokumentert kobling mellom adressen og bryggeriet', 'fysisk overlap-audit'],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'Geonorge Adresser API v1',
        sourceUrl: schous.sourceUrl,
        sourceObjectId: schous.sourceObjectId,
        sourceQuality: 'official_address',
        finding: 'Geonorge returnerte ett eksakt adressetreff for Trondheimsveien 2.',
        canVerifyCoordinate: true,
        reason: schousPlace.coordNote,
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Schous Bryggeri',
        sourceUrl: 'https://oslobyleksikon.no/side/Schous_Bryggeri',
        sourceObjectId: 'oslobyleksikon:schous-bryggeri',
        sourceQuality: 'documented_physical_identity',
        finding: 'Oslo byleksikon knytter det historiske Schous-anlegget til Trondheimsveien 2.',
        canVerifyCoordinate: true,
        reason: 'Kilden kobler History Go-stedet til adressen som brukes som display-marker.',
      },
    ],
    addressCandidates: [{ address: 'Trondheimsveien 2 Oslo', sourceProvider: 'official_address', sourceObjectId: schous.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: schous.sourceObjectId, canApplyToPlace: true }],
  }),
  ringnes_bryggeri: appliedEvidence('ringnes_bryggeri', {
    resolvedIdentity: 'Ringnes Bryggeris gamle brygghus i Thorvald Meyers gate 2A',
    requiredEvidence: ['presist bygganker innen det historiske komplekset', 'entydig offisiell adresse', 'dokumentert kobling til det gamle brygghuset'],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'Geonorge Adresser API v1',
        sourceUrl: ringnes.sourceUrl,
        sourceObjectId: ringnes.sourceObjectId,
        sourceQuality: 'official_address',
        finding: 'Geonorge returnerte ett tydelig adressetreff for Thorvald Meyers gate 2A.',
        canVerifyCoordinate: true,
        reason: ringnesPlace.coordNote,
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Thorvald Meyers gate',
        sourceUrl: 'https://oslobyleksikon.no/side/Thorvald_Meyers_gate',
        sourceObjectId: 'oslobyleksikon:thorvald-meyers-gate:2a',
        sourceQuality: 'documented_physical_identity',
        finding: 'Oslo byleksikon identifiserer nr. 2A som Ringnes Bryggeris gamle brygghus.',
        canVerifyCoordinate: true,
        reason: 'Det presise 2A-ankeret løser tvetydigheten i det bredere nr. 2-oppslaget.',
      },
    ],
    addressCandidates: [{ address: 'Thorvald Meyers gate 2A Oslo', sourceProvider: 'official_address', sourceObjectId: ringnes.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: ringnes.sourceObjectId, canApplyToPlace: true }],
  }),
  akershus_slott_bakeriet: appliedEvidence('akershus_slott_bakeriet', {
    resolvedIdentity: 'Bakeriet, inventar 0014 på Akershus festning',
    requiredEvidence: ['navngitt konkret bygningsobjekt', 'dokumentert festningsinventar-identitet', 'punkt innen korrekt bygning'],
    evidence: [
      {
        sourceProvider: 'openstreetmap',
        sourceName: 'OpenStreetMap',
        sourceUrl: 'https://www.openstreetmap.org/way/669390521',
        sourceObjectId: 'osm-way:669390521',
        sourceQuality: 'named_building_geometry',
        finding: 'OSM way 669390521 er navngitt Bakeriet og ligger inne på Akershus festning.',
        canVerifyCoordinate: true,
        reason: bakerPlace.coordNote,
      },
      {
        sourceProvider: 'official_heritage',
        sourceName: 'Lovdata – fredningsforskrift for Akershus festning',
        sourceUrl: 'https://lovdata.no/dokument/LF/forskrift/2014-12-17-1696/%C2%A73',
        sourceObjectId: 'akershus-inventar:0014',
        sourceQuality: 'official_heritage_identity',
        finding: 'Fredningsforskriften identifiserer inventar 14 som Bakeriet, datert 1759.',
        canVerifyCoordinate: true,
        reason: 'Den offisielle inventaridentiteten kryssjekker at OSM-objektet representerer riktig bygningstype og sted.',
      },
    ],
    sourceObjectCandidates: [{ sourceProvider: 'openstreetmap', sourceObjectId: 'osm-way:669390521', canApplyToPlace: true }],
    geometryCandidates: [{ sourceProvider: 'openstreetmap', sourceObjectId: 'osm-way:669390521', canApplyToPlace: true }],
  }),
};

function reviewEvidence(id, config) {
  const place = requirePlace(byId, id);
  return {
    placeId: id,
    placeFile: SOURCE_REL,
    evidenceStatus: config.evidenceStatus || 'needs_research',
    coordinateDecision: 'needs_identity_split',
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: config.resolvedIdentity,
      identityStatus: 'conflict',
      identityProblem: config.problem,
      locatorTypeCandidate: config.locatorTypeCandidate || 'historic_site',
      requiresSplit: false,
      splitReason: config.problem,
    },
    requiredEvidence: config.requiredEvidence,
    evidence: config.evidence,
    addressCandidates: config.addressCandidates || [],
    sourceObjectCandidates: config.sourceObjectCandidates || [],
    geometryCandidates: config.geometryCandidates || [],
    coordinateCandidates: config.coordinateCandidates || [],
    decision: {
      canBecomeVerified: false,
      blockedReason: config.problem,
      nextAction: config.nextAction,
    },
    notes: ['Ingen koordinatendring i batch 24.'],
  };
}

const stHalvardLookup = parseFinder(
  path.join(REPORT_DIR, 'lookups/st_halvard_bryggeri-pilestredet-75c-geonorge.json'),
  'St. Halvard utforskende kontroll / Pilestredet 75C',
);
const kornRaw = readJson(path.join(REPORT_DIR, 'sources/oslo_kornmagasin-nominatim.json'));
const kornCandidate = Array.isArray(kornRaw) ? kornRaw.find((row) => row?.name === 'Kornmagasinet') : null;

const reviewEvidenceById = {
  sagene_kvernhus: reviewEvidence('sagene_kvernhus', {
    resolvedIdentity: 'et bredt og sammenblandet historisk mølle-/kvernområde ved Sagene og Akerselva',
    problem: 'Recorden kombinerer møller, sagbruk og tekstilindustri uten å identifisere ett konkret fysisk anlegg. Hjula kan ikke brukes som standardanker fordi `ovre_foss` allerede representerer Hjula Væverier.',
    locatorTypeCandidate: 'linear_area',
    requiredEvidence: ['entydig navngitt mølle eller kvernhus', 'avgrenset fysisk scope', 'overlap-audit mot Hjula og øvrige Akerselva-industristeder'],
    evidence: [{
      sourceProvider: 'manual_research',
      sourceName: 'Batch 24 identitetsaudit',
      sourceUrl: 'reports/oslo-coordinate-control-batch-24/README.md',
      sourceObjectId: 'history-go:identity:sagene_kvernhus',
      sourceQuality: 'identity_geography_audit',
      finding: 'Nominatim ga ingen navngitt fysisk entitet for «Sagene mølle og kvernhus», mens recordteksten dekker flere ulike historiske anlegg.',
      canVerifyCoordinate: false,
      reason: 'Ett punkt ville innebære å velge ett av flere mulige anlegg uten at recordens identitet gjør dette valget.',
    }],
    nextAction: 'Avgrens recorden til ett dokumentert fysisk mølle-/kvernanlegg, eller modeller industrimiljøet som et område/relasjon med flere ankere.',
  }),
  st_halvard_bryggeri: reviewEvidence('st_halvard_bryggeri', {
    resolvedIdentity: 'det historiske St. Halvards Bryggeri/Nora Bryggeri i Pilestredet 75C',
    problem: 'Aktiv record oppgir 1843 og beskriver et østkantbryggeri, mens kildene plasserer det dokumenterte St. Halvards/Nora-anlegget i Pilestredet 75C og med en annen historisk tidslinje. Det entydige adressepunktet kan derfor ikke brukes før recordens identitet og faktagrunnlag er ryddet.',
    requiredEvidence: ['korrigert historisk identitet og tidslinje', 'avklaring av om dagens 75C-bygg representerer det historiske anlegget', 'ny overlap-audit etter innholdsretting'],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'Geonorge Adresser API v1',
        sourceUrl: stHalvardLookup.sourceUrl,
        sourceObjectId: stHalvardLookup.sourceObjectId,
        sourceQuality: 'official_address',
        finding: 'Geonorge gir ett tydelig adressepunkt for Pilestredet 75C.',
        canVerifyCoordinate: false,
        reason: 'Adressepunktet er entydig, men den aktive recorden har en materiell identitets- og historiekonflikt som må løses først.',
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – St. Halvards Bryggeri',
        sourceUrl: 'https://oslobyleksikon.no/side/St._Halvards_Bryggeri',
        sourceObjectId: 'oslobyleksikon:st-halvards-bryggeri',
        sourceQuality: 'documented_historical_identity',
        finding: 'Kilden knytter bryggeriet til Pilestredet 75C og en annen etableringshistorie enn den aktive recorden.',
        canVerifyCoordinate: false,
        reason: 'Place-innholdet må korrigeres før koordinaten kan representere samme historiske objekt.',
      },
    ],
    addressCandidates: [{ address: 'Pilestredet 75C Oslo', sourceProvider: 'official_address', sourceObjectId: stHalvardLookup.sourceObjectId, canApplyToPlace: false }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: stHalvardLookup.sourceObjectId, canApplyToPlace: false }],
    coordinateCandidates: [{ lat: stHalvardLookup.coordinate.lat, lon: stHalvardLookup.coordinate.lon, coordRole: 'display_marker', canApplyToPlace: false }],
    nextAction: 'Rett name/year/desc/popupDesc og avklar historisk bygningskontinuitet før Pilestredet 75C eventuelt godkjennes.',
  }),
  oslo_kornmagasin: reviewEvidence('oslo_kornmagasin', {
    resolvedIdentity: 'mulig sammenblanding med Kornmagasinet, inventar 0008 på Akershus festning',
    problem: 'Aktiv record heter «Christiania kornmagasin» og oppgir 1785, mens det konkrete stående Kornmagasinet på Akershus er dokumentert som inventar 0008 fra 1788. Et eksakt OSM-bygningsobjekt finnes, men recorden kan ikke retargetes til dette bygget uten eksplisitt identitets- og innholdsavgjørelse.',
    requiredEvidence: ['avklaring av hvilken historisk institusjon recorden beskriver', 'korrigert navn/år/faktagrunnlag dersom Akershus-bygget er ment', 'overlap-audit mot eksisterende Akershus-records'],
    evidence: [
      {
        sourceProvider: 'openstreetmap',
        sourceName: 'OpenStreetMap',
        sourceUrl: kornCandidate?.osm_type && kornCandidate?.osm_id ? `https://www.openstreetmap.org/${kornCandidate.osm_type}/${kornCandidate.osm_id}` : 'https://www.openstreetmap.org/',
        sourceObjectId: kornCandidate?.osm_type && kornCandidate?.osm_id ? `osm-${kornCandidate.osm_type}:${kornCandidate.osm_id}` : 'osm:unresolved-kornmagasinet',
        sourceQuality: 'named_building_candidate',
        finding: 'Objektsøket finner et navngitt Kornmagasinet-bygg inne på Akershus festning.',
        canVerifyCoordinate: false,
        reason: 'Den aktive History Go-recordens navn og år matcher ikke sikkert det dokumenterte 1788-bygget.',
      },
      {
        sourceProvider: 'official_heritage',
        sourceName: 'Lovdata – fredningsforskrift for Akershus festning',
        sourceUrl: 'https://lovdata.no/dokument/LF/forskrift/2014-12-17-1696/%C2%A73',
        sourceObjectId: 'akershus-inventar:0008',
        sourceQuality: 'official_heritage_identity',
        finding: 'Fredningsforskriften identifiserer inventar 8 som Kornmagasinet, datert 1788.',
        canVerifyCoordinate: false,
        reason: 'Kilden styrker kandidatobjektet, men løser ikke om aktiv 1785-record faktisk skal representere dette bygget.',
      },
    ],
    sourceObjectCandidates: kornCandidate?.osm_type && kornCandidate?.osm_id ? [{ sourceProvider: 'openstreetmap', sourceObjectId: `osm-${kornCandidate.osm_type}:${kornCandidate.osm_id}`, canApplyToPlace: false }] : [],
    coordinateCandidates: kornCandidate ? [{ lat: Number(kornCandidate.lat), lon: Number(kornCandidate.lon), coordRole: 'display_marker', canApplyToPlace: false }] : [],
    nextAction: 'Auditér historisk kildegrunnlag og bestem om recorden skal korrigeres til Akershus Kornmagasinet eller erstattes/fjernes som feilkonstruert place.',
  }),
};

for (const [id, evidence] of Object.entries({ ...appliedEvidenceById, ...reviewEvidenceById })) {
  writeJson(path.join(EVIDENCE_ROOT, `oslo/naeringsliv/${id}.json`), evidence);
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const id of [
  'sagene_kvernhus', 'ovre_foss', 'schous_bryggeri', 'ringnes_bryggeri',
  'st_halvard_bryggeri', 'oslo_kornmagasin', 'akershus_slott_bakeriet',
]) {
  const rel = `oslo/naeringsliv/${id}.json`;
  if (!evidenceManifest.files.includes(rel)) evidenceManifest.files.push(rel);
}
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå 131 verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 135 verifiserte eller kildekontrollerte canonical steder. Batch 24 godkjenner fire nye ankere: Hjula Væverier som fysisk hovedanker for `ovre_foss`, Schous bryggeri i Trondheimsveien 2, Ringnes Bryggeris gamle brygghus i Thorvald Meyers gate 2A og Bakeriet som identifisert bygningsobjekt på Akershus festning. `sagene_kvernhus`, `st_halvard_bryggeri` og `oslo_kornmagasin` står som nye dokumenterte `needs_review`-utfall på grunn av uklar eller konfliktfylt fysisk identitet. 20 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat.',
);

const approvedAnchor = '| 23 | `grunnlovsbygget_bankplassen` | Den gamle Norges Bank | verified | `geonorge-adresser-v1:0301:10412:3` |';
if (!protocol.includes('| 24 | `ovre_foss` |')) {
  if (!protocol.includes(approvedAnchor)) throw new Error('Fant ikke batch 23-ankeret i koordinatprotokollen');
  protocol = protocol.replace(approvedAnchor, `${approvedAnchor}\n| 24 | \`ovre_foss\` | Øvre Foss – Hjula Veveri | verified_geometry | \`wikidata:Q11975545\` |\n| 24 | \`schous_bryggeri\` | Schous bryggeri | verified | \`${schous.sourceObjectId}\` |\n| 24 | \`ringnes_bryggeri\` | Ringnes bryggeri | verified | \`${ringnes.sourceObjectId}\` |\n| 24 | \`akershus_slott_bakeriet\` | Bakeriet ved Akershus | verified_geometry | \`osm-way:669390521\` |`);
}

const reviewAnchor = '| `akershus_energi` – Akershus Energi Varme | needs_review | Recorden ligger i Oslo-kilden og har ett Oslo-punkt, men selskapet har flere dokumenterte fjernvarmeanlegg i Akershus og forretningsadresse i Lillestrøm. | Definer ett konkret anlegg som place eller modeller selskapet som aktør med flere anleggsrelasjoner; ikke behold generisk Oslo-punkt. |';
if (!protocol.includes('| `sagene_kvernhus` – Sagene mølle og kvernhus |')) {
  if (!protocol.includes(reviewAnchor)) throw new Error('Fant ikke batch 23 needs_review-ankeret i koordinatprotokollen');
  protocol = protocol.replace(reviewAnchor, `${reviewAnchor}\n| \`sagene_kvernhus\` – Sagene mølle og kvernhus | needs_review | Recorden kombinerer flere mølle-, sagbruks- og industriidentiteter langs Akerselva uten ett entydig fysisk anlegg; Hjula er allerede representert av \`ovre_foss\`. | Avgrens til ett dokumentert fysisk anlegg eller modeller industrimiljøet som område/relasjon med flere ankere. |\n| \`st_halvard_bryggeri\` – St. Halvard bryggeri | needs_review | Aktiv record oppgir feil år/geografi i forhold til det dokumenterte St. Halvards/Nora-anlegget i Pilestredet 75C. Det entydige Geonorge-punktet kan ikke anvendes før place-identiteten og historikken er korrigert. | Rett recordens historiske fakta og avklar bygningskontinuitet før Pilestredet 75C eventuelt godkjennes. |\n| \`oslo_kornmagasin\` – Christiania kornmagasin | needs_review | Aktiv 1785-record matcher ikke sikkert det dokumenterte Kornmagasinet på Akershus, inventar 0008 fra 1788, selv om et eksakt navngitt bygningsobjekt finnes. | Avklar historisk identitet og korriger/erstatt recorden før et Akershus-anker eventuelt brukes. |`);
}

protocol = protocol.replace(
  '- Neste nye Oslo-kontroll er nummer 147 og starter batch 24.',
  '- Neste nye Oslo-kontroll er nummer 154 og starter batch 25.',
);
protocol = protocol.replace(
  '- Batch 23 er fullført med tre godkjente ankere og fire nye dokumenterte `needs_review`-utfall.',
  '- Batch 24 er fullført med fire godkjente ankere og tre nye dokumenterte `needs_review`-utfall.',
);
protocol = protocol.replace(
  '- Sekundærkøen fortsetter i `data/places/naeringsliv/oslo/places_naeringsliv_manifest.json` fra første ukontrollerte record etter `akershus_energi`; `sagene_kvernhus` er neste kandidat.',
  '- Sekundærkøen fortsetter i `data/places/naeringsliv/oslo/places_naeringsliv_manifest.json` fra første ukontrollerte record etter `akershus_slott_bakeriet`; `jernbanetorget_trafikknutepunkt` er neste kandidat.',
);
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 24\n\nDato: ${DATE}\n\nSju kontroller er fullført. Fire steder får nye kildebelagte ankere, mens tre records står som \`needs_review\` fordi den aktive place-identiteten ikke er presis nok til at et punkt kan godkjennes uten å endre eller gjette hva recorden representerer.\n\n| placeId | resultat | kilde / avgjørelse |\n|---|---|---|\n| \`sagene_kvernhus\` | needs_review | sammenblandet mølle-/kvernområde uten ett entydig fysisk objekt |\n| \`ovre_foss\` | verified_geometry | \`wikidata:Q11975545\` – Hjula Væverier |\n| \`schous_bryggeri\` | verified | \`${schous.sourceObjectId}\` – Trondheimsveien 2 |\n| \`ringnes_bryggeri\` | verified | \`${ringnes.sourceObjectId}\` – Thorvald Meyers gate 2A |\n| \`st_halvard_bryggeri\` | needs_review | identitets-/historiekonflikt; Pilestredet 75C ikke anvendt |\n| \`oslo_kornmagasin\` | needs_review | aktiv 1785-identitet matcher ikke sikkert Akershus Kornmagasinet fra 1788 |\n| \`akershus_slott_bakeriet\` | verified_geometry | \`osm-way:669390521\` – navngitt Bakeriet-objekt |\n\n## Metode\n\n- Konkrete adresser ble kjørt gjennom den normative Geonorge-finneren med output lagret i \`reports/oslo-coordinate-control-batch-24/lookups/\`.\n- Det brede Sagveien 23-oppslaget og Thorvald Meyers gate 2-oppslaget ble ikke brukt fordi de var tvetydige.\n- Ringnes ble presisert til det dokumenterte gamle brygghuset i Thorvald Meyers gate 2A før nytt adresseoppslag.\n- Hjula ble forankret til det navngitte kildeobjektet Wikidata Q11975545 etter at adresseoppslaget var tvetydig.\n- Bakeriet ble forankret til det eksakte navngitte OSM-bygningsobjektet og kryssjekket mot Akershus-fredningsforskriften.\n- De tre \`needs_review\`-recordene beholder sine eksisterende koordinater uendret.\n`);

console.log('Applied Oslo coordinate control batch 24: 4 verified anchors, 3 needs_review outcomes.');
