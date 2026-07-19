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
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-25');
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

const aggregate = readJson(SOURCE);
if (!Array.isArray(aggregate)) throw new Error(`${SOURCE_REL} er ikke en array`);
const byId = new Map(aggregate.map((place) => [place.id, place]));
const requirePlace = (id) => {
  const place = byId.get(id);
  if (!place) throw new Error(`Mangler ${id} i ${SOURCE_REL}`);
  return place;
};

const lysverker = parseFinder(
  path.join(REPORT_DIR, 'lookups/oslo_kraftselskap-sommerrogata-1-geonorge.json'),
  'Oslo Lysverker / Sommerrogata 1',
);
const fiskehall = parseFinder(
  path.join(REPORT_DIR, 'lookups/vippetangen_fisketorg-akershusstranda-23-geonorge.json'),
  'Fiskehallen / Akershusstranda 23',
);
const grensenRaw = readJson(path.join(REPORT_DIR, 'sources/grensen_kjopesenter-nominatim.json'));
const frysjaRaw = readJson(path.join(REPORT_DIR, 'sources/frysja_industriomrade-nominatim.json'));
const brynRaw = readJson(path.join(REPORT_DIR, 'sources/bryn_industriomrade-nominatim.json'));
const varemesseRaw = readJson(path.join(REPORT_DIR, 'sources/norges_varemesse-sjolyst-nominatim.json'));

const lysverkerPlace = requirePlace('oslo_kraftselskap');
Object.assign(lysverkerPlace, {
  lat: lysverker.coordinate.lat,
  lon: lysverker.coordinate.lon,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: lysverker.sourceObjectId,
  address: lysverker.coordinate.address,
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: lysverker.sourceObjectId,
  coordSourceUrl: lysverker.sourceUrl,
  coordType: 'address_point',
  coordVerifiedAt: DATE,
  coordNote: 'Offisiell adressekoordinat fra Geonorge for Sommerrogata 1, kryssjekket mot Oslo byleksikons identifikasjon av bygningen som Oslo Lysverkers monumentale hovedbygning. Punktet er et representativt institusjonsanker for Oslo Lysverker, ikke et påstått sentrum for hele strømnettet eller selskapets samlede anleggsstruktur.',
});
delete lysverkerPlace.coordPrecision;
delete lysverkerPlace.coordPrecisionM;

writeJson(SOURCE, aggregate);
writeJson(path.join(SPLIT_DIR, 'oslo_kraftselskap.json'), lysverkerPlace);

const manifest = readJson(SPLIT_MANIFEST);
manifest.source_sha256 = sha256(SOURCE);
manifest.generated_at = new Date().toISOString();
for (const row of manifest.places || []) {
  if (row.id === 'oslo_kraftselskap') {
    row.sha256 = sha256(path.join(path.dirname(SPLIT_MANIFEST), row.file));
  }
}
writeJson(SPLIT_MANIFEST, manifest);

const coordinateFields = [
  'lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address',
  'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource',
  'coordVerifiedAt', 'coordNote',
];
const index = readJson(INDEX);
const lysIndex = index.find((item) => item?.id === 'oslo_kraftselskap');
if (!lysIndex) throw new Error('Mangler oslo_kraftselskap i næringsliv-index');
for (const key of coordinateFields) delete lysIndex[key];
for (const key of coordinateFields) {
  if (Object.prototype.hasOwnProperty.call(lysverkerPlace, key)) lysIndex[key] = lysverkerPlace[key];
}
writeJson(INDEX, index);

function appliedEvidence(id, config) {
  const place = requirePlace(id);
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
      locatorTypeCandidate: config.locatorTypeCandidate || 'building',
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

function reviewEvidence(id, config) {
  const place = requirePlace(id);
  return {
    placeId: id,
    placeFile: SOURCE_REL,
    evidenceStatus: config.evidenceStatus || 'needs_research',
    coordinateDecision: config.coordinateDecision || 'needs_identity_split',
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: config.resolvedIdentity,
      identityStatus: config.identityStatus || 'conflict',
      identityProblem: config.problem,
      locatorTypeCandidate: config.locatorTypeCandidate || 'unknown',
      requiresSplit: Boolean(config.requiresSplit),
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
    notes: ['Ingen koordinatendring i batch 25.'],
  };
}

const grensenCandidates = Array.isArray(grensenRaw) ? grensenRaw
  .filter((row) => row?.name === 'Grensen' && row?.osm_type && row?.osm_id)
  .map((row) => ({
    sourceProvider: 'osm',
    sourceObjectId: `osm-${row.osm_type}:${row.osm_id}`,
    canApplyToPlace: false,
  })) : [];
const grensenCoords = Array.isArray(grensenRaw) ? grensenRaw
  .filter((row) => row?.name === 'Grensen' && Number.isFinite(Number(row?.lat)) && Number.isFinite(Number(row?.lon)))
  .map((row) => ({
    lat: Number(row.lat),
    lon: Number(row.lon),
    coordRole: 'line_anchor',
    canApplyToPlace: false,
  })) : [];

const evidenceById = {
  oslo_kraftselskap: appliedEvidence('oslo_kraftselskap', {
    resolvedIdentity: 'Oslo Lysverkers tidligere hovedbygning i Sommerrogata 1 som representativt institusjonsanker',
    requiredEvidence: ['entydig offisiell adresse', 'dokumentert kobling mellom bygningen og Oslo Lysverker', 'overlap-audit mot andre canonical places'],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'Geonorge Adresser API v1',
        sourceUrl: lysverker.sourceUrl,
        sourceObjectId: lysverker.sourceObjectId,
        sourceQuality: 'official_address',
        finding: 'Geonorge returnerte ett tydelig treff for Sommerrogata 1.',
        canVerifyCoordinate: true,
        reason: lysverkerPlace.coordNote,
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Oslo Lysverker',
        sourceUrl: 'https://oslobyleksikon.no/side/Oslo_Lysverker',
        sourceObjectId: 'oslobyleksikon:oslo-lysverker:sommerrogata-1',
        sourceQuality: 'documented_physical_identity',
        finding: 'Oslo byleksikon identifiserer Sommerrogata 1 som Oslo Lysverkers monumentale hovedbygning.',
        canVerifyCoordinate: true,
        reason: 'Bygningen gir et dokumentert fysisk hovedanker for institusjonen uten å påstå at ett punkt representerer hele energinettet.',
      },
    ],
    addressCandidates: [{ address: 'Sommerrogata 1 Oslo', sourceProvider: 'official_address', sourceObjectId: lysverker.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: lysverker.sourceObjectId, canApplyToPlace: true }],
  }),

  jernbanetorget_trafikknutepunkt: reviewEvidence('jernbanetorget_trafikknutepunkt', {
    evidenceStatus: 'rejected',
    coordinateDecision: 'needs_identity_split',
    resolvedIdentity: 'duplikat næringslivsrecord for samme fysiske byrom som canonical `jernbanetorget`',
    problem: 'Repoet har allerede canonical `jernbanetorget` for det samme fysiske torget og transportknutepunktet. Næringslivsvinkelen skaper ikke et separat fysisk sted.',
    locatorTypeCandidate: 'square',
    requiredEvidence: ['canonical place-id-migrering', 'referanseopprydding', 'ingen separat koordinat'],
    evidence: [{
      sourceProvider: 'manual_research',
      sourceName: 'History Go canonical place audit',
      sourceUrl: 'data/places/by/oslo/places/jernbanetorget.json',
      sourceObjectId: 'history-go:duplicate:jernbanetorget_trafikknutepunkt:jernbanetorget',
      sourceQuality: 'identity_overlap_audit',
      finding: 'Begge recordene representerer Jernbanetorget som fysisk byrom; forskjellen er redaksjonell kategori/vinkel.',
      canVerifyCoordinate: false,
      reason: 'Et separat punkt ville bevare et fysisk duplikat i canonical place-laget.',
    }],
    nextAction: 'Migrer næringslivsinnhold og referanser til canonical `jernbanetorget`; ikke godkjenn et separat fysisk anker.',
  }),

  grensen_kjopesenter: reviewEvidence('grensen_kjopesenter', {
    evidenceStatus: 'candidate_sources_collected',
    coordinateDecision: 'needs_geometry',
    identityStatus: 'resolved',
    resolvedIdentity: 'gaten Grensen som historisk og nåværende handelsgate i Oslo sentrum',
    problem: 'Aktiv record beskriver hele gaten Grensen, mens OSM representerer gaten med flere separate way-segmenter. Ett av segmentpunktene kan ikke alene verifisere hele den lineære place-identiteten.',
    locatorTypeCandidate: 'street',
    requiredEvidence: ['komplett gategeometri eller dokumentert segmentsett', 'line_anchor/geometry-kontrakt', 'avklaring av misvisende legacy-id `grensen_kjopesenter`'],
    evidence: [
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Grensen',
        sourceUrl: 'https://oslobyleksikon.no/side/Grensen',
        sourceObjectId: 'oslobyleksikon:grensen',
        sourceQuality: 'documented_linear_identity',
        finding: 'Oslo byleksikon beskriver Grensen som en gate fra Møllergata ved Stortorvet til Professor Aschehougs plass og som en viktig handelsgate.',
        canVerifyCoordinate: false,
        reason: 'Kilden avklarer identiteten, men ikke én enkelt punktkoordinat for hele gaten.',
      },
      {
        sourceProvider: 'osm',
        sourceName: 'OpenStreetMap / Nominatim',
        sourceUrl: 'https://www.openstreetmap.org/',
        sourceObjectId: 'osm:grensen-multiway',
        sourceQuality: 'multi_segment_geometry_candidates',
        finding: `Objektsøket returnerte ${grensenCandidates.length} navngitte Grensen-way-kandidater, som viser at gaten er segmentert og må modelleres samlet.`,
        canVerifyCoordinate: false,
        reason: 'Batchen velger ikke første eller nærmeste segment som hele gatens koordinat.',
      },
    ],
    sourceObjectCandidates: grensenCandidates,
    coordinateCandidates: grensenCoords,
    nextAction: 'Bygg dokumentert flersegment-geometri/anchors for hele Grensen og bruk et eksplisitt line_anchor; vurder samtidig å migrere legacy-id-en til en gate-identitet.',
  }),

  vippetangen_fisketorg: reviewEvidence('vippetangen_fisketorg', {
    evidenceStatus: 'needs_research',
    coordinateDecision: 'needs_identity_split',
    resolvedIdentity: 'historisk fisketorg/fiskehavn på Vippetangen, med senere Fiskehallen i Akershusstranda 23',
    problem: 'Aktiv record oppgir 1890 og beskriver et bredt historisk fisketorg, mens kildene flytter fisketorget til Vippetangen i 1905 og knytter dagens konkrete Fiskehallen til Akershusstranda 23 i en senere fase. Adressepunktet kan derfor ikke automatisk erstatte recordens brede historiske identitet.',
    locatorTypeCandidate: 'historic_site',
    requiredEvidence: ['korrigert tidslinje', 'valg mellom historisk fiskehavn/område og konkret Fiskehallen-bygg', 'historisk områdeanker eller eksplisitt bygningsanker etter identitetsvalg'],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'Geonorge Adresser API v1',
        sourceUrl: fiskehall.sourceUrl,
        sourceObjectId: fiskehall.sourceObjectId,
        sourceQuality: 'official_address_candidate',
        finding: 'Geonorge returnerte ett tydelig adressepunkt for Akershusstranda 23.',
        canVerifyCoordinate: false,
        reason: 'Adressepunktet gjelder den konkrete Fiskehallen, mens aktiv record ikke er tydelig avgrenset til dette bygget.',
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Fiskehallen',
        sourceUrl: 'https://oslobyleksikon.no/side/Fiskehallen',
        sourceObjectId: 'oslobyleksikon:fiskehallen:vippetangen',
        sourceQuality: 'documented_historical_identity',
        finding: 'Kilden dokumenterer flytting av fisketorget til Vippetangen i 1905 og senere Fiskehallen i Akershusstranda 23.',
        canVerifyCoordinate: false,
        reason: 'Kilden viser at recordens nåværende 1890-identitet og det konkrete 23-ankeret ikke er samme uavklarte tidslag.',
      },
    ],
    addressCandidates: [{ address: 'Akershusstranda 23 Oslo', sourceProvider: 'official_address', sourceObjectId: fiskehall.sourceObjectId, canApplyToPlace: false }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: fiskehall.sourceObjectId, canApplyToPlace: false }],
    coordinateCandidates: [{ lat: fiskehall.coordinate.lat, lon: fiskehall.coordinate.lon, coordRole: 'display_marker', canApplyToPlace: false }],
    nextAction: 'Rett recordens tidslinje og bestem om place skal være Fiskehallen som bygg eller den historiske fiskehavna/fisketorget som område før koordinat godkjennes.',
  }),

  frysja_industriomrade: reviewEvidence('frysja_industriomrade', {
    evidenceStatus: 'candidate_sources_collected',
    coordinateDecision: 'needs_geometry',
    identityStatus: 'resolved',
    resolvedIdentity: 'det brede historiske og transformerte industriområdet på Frysja langs øvre Akerselva',
    problem: 'Frysja industriområde er et areal, ikke ett bygg. Det eksakte objektsøket ga ingen stabil navngitt industriområdegeometri, og dagens manuelle punkt har ingen v1-kildekontrakt.',
    locatorTypeCandidate: 'linear_area',
    requiredEvidence: ['offisiell områdegeometri eller dokumentert fleranker', 'area_anchor/geometry-kontrakt', 'fysisk avgrensing mot bredere Frysja-strøk'],
    evidence: [
      {
        sourceProvider: 'municipality',
        sourceName: 'Oslo kommune – Frysja: kvalitet og kvantitet',
        sourceUrl: 'https://magasin.oslo.kommune.no/byplan/frysja-kvalitet-og-kvantitet',
        sourceObjectId: 'oslo-kommune:frysja-industriomrade-transformasjon',
        sourceQuality: 'official_area_identity',
        finding: 'Oslo kommune beskriver Frysja industriområde som et gammelt industri- og lagerområde vest for Akerselva under transformasjon.',
        canVerifyCoordinate: false,
        reason: 'Kilden avklarer området, men batchen har ikke en kildebelagt polygon eller et dokumentert fleranker.',
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Frysja',
        sourceUrl: 'https://oslobyleksikon.no/side/Frysja',
        sourceObjectId: 'oslobyleksikon:frysja',
        sourceQuality: 'documented_area_context',
        finding: 'Frysja brukes om et bredt bolig- og industriområde langs Akerselva mellom Maridalsvannet og Nydalen.',
        canVerifyCoordinate: false,
        reason: 'Det bredere strøket kan ikke brukes som automatisk punkt for det smalere industriområdet.',
      },
    ],
    sourceObjectCandidates: [],
    coordinateCandidates: [],
    nextAction: 'Hent offisiell plan-/områdegeometri eller dokumenter flere fysiske ankerpunkter for det gamle industriområdet før canonical koordinat godkjennes.',
  }),

  norges_varemesse: reviewEvidence('norges_varemesse', {
    evidenceStatus: 'needs_research',
    coordinateDecision: 'needs_identity_split',
    resolvedIdentity: 'Norges Varemesse som institusjon med skiftende fysiske hovedarenaer over tid',
    problem: 'Recorden er institusjonell og fler-lokasjons: riksmesser på Akershus fra 1920, eget messesenter på Sjølyst fra 1962 og nytt anlegg i Lillestrøm fra 2002; navnet ble NOVA Spektrum i 2021. Ett uavgrenset Oslo-punkt kan derfor ikke representere hele place-identiteten.',
    locatorTypeCandidate: 'historic_site',
    requiresSplit: true,
    requiredEvidence: ['valg av tidsavgrenset fysisk arena', 'eventuell splitting i Akershus/Sjølyst/Lillestrøm', 'korrekt kommune for nåværende anlegg'],
    evidence: [{
      sourceProvider: 'manual_research',
      sourceName: 'NOVA Spektrum – Historien',
      sourceUrl: 'https://novaspektrum.no/historien/',
      sourceObjectId: 'nova-spektrum:historien:norges-varemesse',
      sourceQuality: 'official_institution_history',
      finding: 'Stiftelsens egen historikk dokumenterer flere hovedlokasjoner over tid og navneendringen til NOVA Spektrum.',
      canVerifyCoordinate: false,
      reason: 'Institusjonshistorikken må først avgrenses til ett fysisk sted eller splittes i tidslag.',
    }],
    sourceObjectCandidates: [],
    coordinateCandidates: [],
    nextAction: 'Bestem om recorden skal representere Sjølystsenteret, den første riksmessen på Akershus eller dagens Lillestrøm-anlegg; splitt ved behov og flytt ikke nåværende anlegg inn i Oslo.',
  }),

  bryn_industriomrade: reviewEvidence('bryn_industriomrade', {
    evidenceStatus: 'candidate_sources_collected',
    coordinateDecision: 'needs_geometry',
    identityStatus: 'resolved',
    resolvedIdentity: 'det brede industri- og utviklingsområdet på Bryn i Oslo øst',
    problem: 'Bryn industriområde er et større strøk/område med mange fabrikker, lager og transportanlegg. Det eksakte objektsøket ga ingen én navngitt industriområdegeometri som kan erstatte dagens generiske punkt.',
    locatorTypeCandidate: 'linear_area',
    requiredEvidence: ['offisiell områdegeometri eller dokumentert fleranker', 'area_anchor/geometry-kontrakt', 'avgrensing mot hele Bryn-strøket'],
    evidence: [
      {
        sourceProvider: 'manual_research',
        sourceName: 'Oslo byleksikon – Bryn (strøk)',
        sourceUrl: 'https://oslobyleksikon.no/side/Bryn_%28str%C3%B8k%29',
        sourceObjectId: 'oslobyleksikon:bryn-strok',
        sourceQuality: 'documented_area_identity',
        finding: 'Oslo byleksikon beskriver Bryn som et industri- og boligstrøk med sterk industriutvikling rundt Brynsfossen, jernbanen og transportforbindelsene.',
        canVerifyCoordinate: false,
        reason: 'Det brede strøket gir ikke ett tilfeldig punkt som sikkert industriområdeanker.',
      },
      {
        sourceProvider: 'municipality',
        sourceName: 'Oslo kommune – kommuneplanens utviklingsområder',
        sourceUrl: 'https://www.oslo.kommune.no/politikk/kommuneplan/kommuneplanens-arealdel/utviklingsomrader/',
        sourceObjectId: 'oslo-kommune:utviklingsomrade:bryn',
        sourceQuality: 'official_area_context',
        finding: 'Bryn er definert som et større utviklingsområde i kommuneplanen.',
        canVerifyCoordinate: false,
        reason: 'Batchen mangler fortsatt en eksplisitt polygon eller et dokumentert fleranker for næringslivsrecordens fysiske scope.',
      },
    ],
    sourceObjectCandidates: [],
    coordinateCandidates: [],
    nextAction: 'Hent offisiell utviklings-/industriområdegeometri eller dokumenter et fleranker før canonical koordinat godkjennes.',
  }),
};

for (const [id, evidence] of Object.entries(evidenceById)) {
  writeJson(path.join(EVIDENCE_ROOT, `oslo/naeringsliv/${id}.json`), evidence);
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const id of Object.keys(evidenceById)) {
  const rel = `oslo/naeringsliv/${id}.json`;
  if (!evidenceManifest.files.includes(rel)) evidenceManifest.files.push(rel);
}
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå 135 verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 136 verifiserte eller kildekontrollerte canonical steder. Batch 25 godkjenner Oslo Lysverkers dokumenterte hovedbygning i Sommerrogata 1 som representativt institusjonsanker. `jernbanetorget_trafikknutepunkt`, `grensen_kjopesenter`, `vippetangen_fisketorg`, `frysja_industriomrade`, `norges_varemesse` og `bryn_industriomrade` står som nye dokumenterte `needs_review`-utfall på grunn av fysisk duplikat, manglende lineær/arealbasert geometri eller uavklart fler-lokasjonsidentitet. 26 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat.',
);

const approvedAnchor = '| 24 | `akershus_slott_bakeriet` | Bakeriet ved Akershus | verified_geometry | `osm-way:669390521` |';
if (!protocol.includes('| 25 | `oslo_kraftselskap` |')) {
  if (!protocol.includes(approvedAnchor)) throw new Error('Fant ikke batch 24-ankeret i koordinatprotokollen');
  protocol = protocol.replace(approvedAnchor, `${approvedAnchor}\n| 25 | \`oslo_kraftselskap\` | Oslo Lysverker | verified | \`${lysverker.sourceObjectId}\` |`);
}

const reviewAnchor = '| `oslo_kornmagasin` – Christiania kornmagasin | needs_review | Aktiv 1785-record matcher ikke sikkert det dokumenterte Kornmagasinet på Akershus, inventar 0008 fra 1788, selv om et eksakt navngitt bygningsobjekt finnes. | Avklar historisk identitet og korriger/erstatt recorden før et Akershus-anker eventuelt brukes. |';
if (!protocol.includes('| `jernbanetorget_trafikknutepunkt` – Jernbanetorget – handelsknutepunktet |')) {
  if (!protocol.includes(reviewAnchor)) throw new Error('Fant ikke batch 24 needs_review-ankeret i koordinatprotokollen');
  protocol = protocol.replace(reviewAnchor, `${reviewAnchor}\n| \`jernbanetorget_trafikknutepunkt\` – Jernbanetorget – handelsknutepunktet | needs_review | Fysisk duplikat av canonical \`jernbanetorget\`; næringslivsvinkelen skaper ikke et eget sted. | Migrer innhold/referanser til \`jernbanetorget\` og ikke godkjenn separat koordinat. |\n| \`grensen_kjopesenter\` – Grensen – handelens sentrum | needs_review | Recorden representerer hele gaten Grensen, men tilgjengelig OSM-kilde er segmentert i flere way-objekter; ett segmentpunkt kan ikke representere hele gaten. | Bygg dokumentert flersegment-geometri/anchors og bruk eksplisitt line_anchor; vurder samtidig legacy-id-en. |\n| \`vippetangen_fisketorg\` – Vippetangen fisketorg | needs_review | Aktiv 1890-record blander et bredt historisk fisketorg/fiskehavn med den senere konkrete Fiskehallen i Akershusstranda 23. | Rett tidslinjen og velg mellom historisk område og konkret Fiskehallen-bygg før koordinat godkjennes. |\n| \`frysja_industriomrade\` – Frysja industriområde | needs_review | Et bredt industri-/transformasjonsområde uten kildebelagt polygon eller fleranker; dagens manuelle punkt oppfyller ikke v1-kontrakten. | Hent offisiell områdegeometri eller dokumenter flere area-ankre før verifisering. |\n| \`norges_varemesse\` – Norges Varemesse | needs_review | Institusjonen har hatt hovedarenaer på Akershus, Sjølyst og siden 2002 Lillestrøm; ett uavgrenset Oslo-punkt kan ikke representere hele historien. | Velg et tidsavgrenset fysisk sted eller splitt i separate place-records; ikke plasser dagens anlegg i Oslo. |\n| \`bryn_industriomrade\` – Bryn industriområde | needs_review | Bryn er et større industri-, bolig- og utviklingsområde uten én dokumentert industriområdegeometri i batchen. | Hent offisiell områdegeometri eller dokumenter fleranker før canonical koordinat godkjennes. |`);
}

protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 135 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 136 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
);
protocol = protocol.replace('- Neste nye Oslo-kontroll er nummer 154 og starter batch 25.', '- Neste nye Oslo-kontroll er nummer 161 og starter batch 26.');
protocol = protocol.replace('- Batch 24 er fullført med fire godkjente ankere og tre nye dokumenterte `needs_review`-utfall.', '- Batch 25 er fullført med ett godkjent anker og seks nye dokumenterte `needs_review`-utfall.');
protocol = protocol.replace(
  '- Sekundærkøen fortsetter i `data/places/naeringsliv/oslo/places_naeringsliv_manifest.json` fra første ukontrollerte record etter `akershus_slott_bakeriet`; `jernbanetorget_trafikknutepunkt` er neste kandidat.',
  '- Sekundærkøen fortsetter i `data/places/naeringsliv/oslo/places_naeringsliv_manifest.json` fra første ukontrollerte record etter `bryn_industriomrade`; `gronlikaia` er neste kandidat.',
);
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 25\n\nDato: ${DATE}\n\nSju kontroller er fullført. Oslo Lysverkers dokumenterte hovedbygning i Sommerrogata 1 får et nytt kildebelagt adresseanker. Seks records avsluttes som \`needs_review\` fordi de er duplikater, lineære/arealmessige places uten tilstrekkelig geometri, eller institusjoner/historiske steder med uavklart fysisk scope.\n\n| placeId | resultat | kilde / avgjørelse |\n|---|---|---|\n| \`jernbanetorget_trafikknutepunkt\` | needs_review | fysisk duplikat av \`jernbanetorget\` |\n| \`oslo_kraftselskap\` | verified | \`${lysverker.sourceObjectId}\` – Sommerrogata 1 |\n| \`grensen_kjopesenter\` | needs_review | hele gaten krever flersegment-geometri/line anchors |\n| \`vippetangen_fisketorg\` | needs_review | historisk fisketorg/fiskehavn er ikke identisk med uavklart 1890-record og dagens Fiskehallen-anker |\n| \`frysja_industriomrade\` | needs_review | bredt område uten kildebelagt polygon/fleranker |\n| \`norges_varemesse\` | needs_review | fler-lokasjons institusjon: Akershus, Sjølyst og Lillestrøm |\n| \`bryn_industriomrade\` | needs_review | bredt industri-/utviklingsområde uten eksplisitt geometri |\n\n## Metode\n\n- Sommerrogata 1 og Akershusstranda 23 ble kjørt gjennom den normative Geonorge-finneren med output lagret via \`tee\`.\n- Bare Sommerrogata 1 ble anvendt, etter identitetskontroll mot Oslo Lysverkers dokumenterte hovedbygning.\n- Akershusstranda 23 ble ikke anvendt fordi den konkrete Fiskehallen ikke automatisk er identisk med den brede historiske Vippetangen-recorden.\n- Grensen ble kontrollert som flersegment-gate; ingen enkelt OSM-way ble valgt som hele gaten.\n- Frysja og Bryn ble behandlet som områder og får ikke punktverifisering uten polygon eller dokumentert fleranker.\n- Norges Varemesse beholdes uendret til ett fysisk tidslag er valgt eller recorden splittes.\n`);

console.log('Applied Oslo coordinate control batch 25: 1 verified anchor, 6 needs_review outcomes.');
