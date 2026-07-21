#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const NOW = new Date().toISOString();
const VERIFIED_DATE = '2026-07-21';
const AGGREGATE = 'data/places/scenekunst/oslo/places_scenekunst.json';
const MANIFEST = 'data/places/scenekunst/oslo/places_scenekunst_manifest.json';
const INDEX = 'data/places/scenekunst/oslo/places_scenekunst_index.json';
const CHILD_DIR = 'data/places/scenekunst/oslo/places_scenekunst';
const GLOBAL_INDEX = 'data/places/places_index.json';
const REPORT_JSON = 'reports/scenekunst-oslo-new-venues-batch-1-2026-07-21.json';
const REPORT_MD = 'reports/scenekunst-oslo-new-venues-batch-1-2026-07-21.md';

const VENUES = [
  {
    id: 'black_box_teater',
    name: 'Black Box teater',
    aliases: ['Black Box Teater'],
    year: 1985,
    query: 'Marstrandgata 8 Oslo',
    street: 'Marstrandgata',
    number: 8,
    expectedPostcode: '0566',
    desc: 'Programmeringsteater på Rodeløkka for norsk og internasjonal samtids- og eksperimentell scenekunst.',
    popupDesc: 'Black Box teater ble grunnlagt i 1985 og er en sentral institusjon i det frie scenekunstfeltet. Teatret samproduserer og presenterer norsk og internasjonal samtidsscenekunst, og gir plass til eksperimentelle uttrykk på tvers av teater, dans og performance. Stedet viser hvordan et programmeringsteater skiller seg fra et fast ensembleteater: identiteten skapes gjennom kuratering, gjestespill, kunstneriske samarbeid og skiftende produksjoner.',
    tags: ['samtidsscenekunst', 'eksperimentell_scenekunst', 'fri_scenekunst', 'programmeringsteater', 'performance', 'dans', 'teater'],
    emne_ids: [
      'em_scenekunst_teaterinstitusjon_repertoar',
      'em_scenekunst_dramaturgi_iscenesettelse',
      'em_scenekunst_publikum_fjerde_vegg'
    ],
    quiz_profile: {
      place_type: 'teaterinstitusjon',
      subtype: 'programmeringsteater_for_fri_samtidsscenekunst',
      signature_features: [
        'grunnlagt i 1985',
        'programmerer norsk og internasjonal samtidsscenekunst',
        'sentral arena for frie og eksperimentelle kompanier'
      ],
      primary_angles: ['institusjon', 'repertoar', 'samtidsscenekunst', 'publikum'],
      question_families: ['institusjon', 'formaal', 'kontrast', 'historisk_endring'],
      avoid_angles: ['generisk_teaterhus', 'fast_ensemble_som_hovedmodell'],
      must_include: ['programmeringsteaterets rolle', 'det frie og eksperimentelle scenekunstfeltet'],
      contrast_targets: ['nationaltheatret', 'dansens_hus_oslo'],
      notes: 'Skal spørres som programmeringsteater og kunstnerisk infrastruktur, ikke bare som bygning.'
    },
    knowledge: {
      one_liner: 'Black Box teater er en nøkkelscene for fri, eksperimentell og internasjonal samtidsscenekunst.',
      why_it_matters: [
        'Programmeringsteatret gir skiftende kunstnere og kompanier tilgang til profesjonell scene og publikum.',
        'Stedet viser hvordan scenekunst utvikles utenfor de faste ensembleinstitusjonene.'
      ],
      what_to_notice: [
        'Forskjellen mellom et programmeringsteater og et repertoarteater med fast ensemble.',
        'Hvordan teater, dans og performance møtes i samme program.',
        'Rodeløkka-plasseringen utenfor den tradisjonelle teateraksen i sentrum.'
      ],
      terms: ['programmeringsteater', 'fri_scenekunst', 'samtidsscenekunst', 'gjestespill'],
      sources: ['https://blackbox.no/en/welcome-to-black-box-teater/', 'https://blackbox.no/en/contact/']
    }
  },
  {
    id: 'dansens_hus_oslo',
    name: 'Dansens Hus',
    aliases: ['Dansens Hus Oslo'],
    year: 2008,
    query: 'Vulkan 1 Oslo',
    street: 'Vulkan',
    number: 1,
    expectedPostcode: '0182',
    desc: 'Norges nasjonale scene for dans, etablert i egne lokaler på Vulkan i 2008.',
    popupDesc: 'Dansens Hus er Norges nasjonale scene for dans og et eget institusjonelt hjem for norsk og internasjonal dansekunst. I lokalene på Vulkan presenteres forestillinger, kunstnerskap og faglige aktiviteter der kropp, bevegelse, rom, rytme og koreografi står i sentrum. Stedet gjør det mulig å forstå dans som et selvstendig scenekunstfelt, ikke bare som innslag i opera, musikal eller teater.',
    tags: ['dans', 'koreografi', 'samtidsdans', 'nasjonal_scene', 'scenekunst', 'vulkan'],
    emne_ids: [
      'em_scenekunst_dans_koreografi',
      'em_scenekunst_teaterinstitusjon_repertoar',
      'em_scenekunst_publikum_fjerde_vegg'
    ],
    quiz_profile: {
      place_type: 'nasjonal_scenekunstinstitusjon',
      subtype: 'nasjonal_scene_for_dans',
      signature_features: [
        'Norges nasjonale scene for dans',
        'egne lokaler på Vulkan siden 2008',
        'viser norske og internasjonale danseforestillinger'
      ],
      primary_angles: ['dans', 'koreografi', 'institusjon', 'samtid'],
      question_families: ['formaal', 'institusjon', 'saertrekk', 'kontrast'],
      avoid_angles: ['dans_som_bare_tillegg_til_teater', 'generisk_kulturhus'],
      must_include: ['dans som selvstendig scenekunstfelt', 'rollen som nasjonal scene'],
      contrast_targets: ['black_box_teater', 'operahuset'],
      notes: 'Skal spørres som nasjonal dansekunstinstitusjon, ikke som flerbruksscene på Vulkan.'
    },
    knowledge: {
      one_liner: 'Dansens Hus gjør dans og koreografi til et selvstendig nasjonalt scenekunstfelt.',
      why_it_matters: [
        'Institusjonen gir dansekunst en permanent scene, produksjonsstruktur og offentlighet.',
        'Programmet viser både norske og internasjonale uttrykk i samtidsdans.'
      ],
      what_to_notice: [
        'Hvordan bevegelse og kropp kan bære en forestilling uten verbal tekst.',
        'Forskjellen mellom en nasjonal dansescene og et teaterhus.',
        'Hvordan det tidligere industriområdet Vulkan er blitt kultur- og byutviklingsområde.'
      ],
      terms: ['koreografi', 'samtidsdans', 'nasjonal_scene', 'dansekunst'],
      sources: ['https://www.dansenshus.com/om-dansens', 'https://www.dansenshus.com/']
    }
  },
  {
    id: 'riksscenen',
    name: 'Riksscenen',
    aliases: ['Riksscenen for folkemusikk og folkedans', 'Trondheimsveien 2T'],
    year: 2010,
    query: 'Trondheimsveien 2 Oslo',
    street: 'Trondheimsveien',
    number: 2,
    expectedPostcode: '0560',
    desc: 'Nasjonal scene for folkemusikk og folkedans i Schous Kulturbryggeri.',
    popupDesc: 'Riksscenen er den nasjonale scenen for folkemusikk og folkedans og åpnet dørene i 2010. I Schous Kulturbryggeri møtes norske, samiske og internasjonale tradisjoner gjennom konserter, danseforestillinger, fortelling og tverrkunstneriske produksjoner. Stedet viser at levende tradisjonskultur både kan bevares, fornyes og iscenesettes i profesjonelle scenerom.',
    tags: ['folkemusikk', 'folkedans', 'joik', 'tradisjonskultur', 'nasjonal_scene', 'scenekunst'],
    emne_ids: [
      'em_scenekunst_dans_koreografi',
      'em_scenekunst_musikal_musikkteater',
      'em_scenekunst_teaterinstitusjon_repertoar'
    ],
    quiz_profile: {
      place_type: 'nasjonal_scenekunstinstitusjon',
      subtype: 'nasjonal_scene_for_folkemusikk_og_folkedans',
      signature_features: [
        'nasjonal scene for folkemusikk og folkedans',
        'holder til i Schous Kulturbryggeri',
        'kobler norske, samiske og internasjonale tradisjoner'
      ],
      primary_angles: ['folkedans', 'folkemusikk', 'tradisjon', 'institusjon'],
      question_families: ['formaal', 'institusjon', 'kontrast', 'kulturutveksling'],
      avoid_angles: ['bare_konsertsted', 'generisk_kulturhus'],
      must_include: ['samspillet mellom musikk og dans', 'levende og foranderlig tradisjonskultur'],
      contrast_targets: ['dansens_hus_oslo', 'det_norske_teatret'],
      notes: 'Skal spørres som nasjonal scene for levende tradisjonskunst. Samlokaliseringen med Schous Bryggeri er fysisk, ikke en duplikatfunksjon.'
    },
    knowledge: {
      one_liner: 'Riksscenen gjør folkemusikk og folkedans til profesjonell, levende og internasjonalt orientert scenekunst.',
      why_it_matters: [
        'Tradisjonskunst blir presentert som samtidige kunstuttrykk, ikke bare som museumskultur.',
        'Musikk, dans, joik og fortelling møtes i samme institusjon.'
      ],
      what_to_notice: [
        'Hvordan tradisjon endres når den flyttes inn i et profesjonelt scenerom.',
        'Forholdet mellom folkemusikk, folkedans og scenisk produksjon.',
        'Samlokaliseringen med andre kulturinstitusjoner i det tidligere bryggerikomplekset.'
      ],
      terms: ['folkedans', 'folkemusikk', 'tradisjonskunst', 'joik', 'nasjonal_scene'],
      sources: ['https://www.riksscenen.no/om-oss.556094.no.html']
    }
  }
];

function abs(rel) {
  return path.join(ROOT, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
}

function writeJson(rel, value) {
  const file = abs(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sha256(rel) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex');
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function haversineMeters(a, b) {
  const rad = (degrees) => degrees * Math.PI / 180;
  const earth = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
}

async function exactAddress(venue) {
  const sourceUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(venue.query)}`;
  const response = await fetch(sourceUrl, { headers: { 'user-agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`${venue.id}: Geonorge HTTP ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload.adresser) ? payload.adresser : [];
  const exact = rows.filter((row) =>
    row.kommunenummer === '0301' &&
    normalize(row.adressenavn) === normalize(venue.street) &&
    Number(row.nummer) === Number(venue.number) &&
    !String(row.bokstav ?? '').trim()
  );
  if (exact.length !== 1) {
    throw new Error(`${venue.id}: expected one exact Geonorge address for ${venue.query}, found ${exact.length}`);
  }
  const hit = exact[0];
  const point = hit.representasjonspunkt;
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) {
    throw new Error(`${venue.id}: exact address has no valid representation point`);
  }
  if (venue.expectedPostcode && String(hit.postnummer) !== venue.expectedPostcode) {
    throw new Error(`${venue.id}: expected postcode ${venue.expectedPostcode}, got ${hit.postnummer}`);
  }
  const suffix = `${hit.nummer}${String(hit.bokstav ?? '').trim()}`;
  return {
    sourceUrl,
    sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${suffix}`,
    lat: point.lat,
    lon: point.lon,
    address: {
      street: hit.adressenavn,
      number: String(hit.nummer),
      postcode: String(hit.postnummer),
      city: 'Oslo',
      country: 'NO'
    },
    rawHit: hit
  };
}

function buildPlace(venue, coordinate, overlapRows) {
  const overlapText = venue.id === 'riksscenen'
    ? ' Adressepunktet deles med Schous Bryggeri fordi institusjonene ligger i samme kulturbryggerikompleks. Riksscenen beholdes som egen canonical record fordi den har en selvstendig nasjonal scenekunstfunksjon, egne saler og eget publikumsløp.'
    : '';
  return {
    id: venue.id,
    name: venue.name,
    aliases: venue.aliases,
    visual: { designCode: 'theatre_miniature' },
    lat: coordinate.lat,
    lon: coordinate.lon,
    r: 60,
    category: 'scenekunst',
    year: venue.year,
    desc: venue.desc,
    popupDesc: venue.popupDesc,
    tags: venue.tags,
    emne_ids: venue.emne_ids,
    quiz_profile: venue.quiz_profile,
    knowledge: venue.knowledge,
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl,
    coordVerifiedAt: VERIFIED_DATE,
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${coordinate.address.street} ${coordinate.address.number}, OSLO. Punktet er representasjonspunktet for bygningen/institusjonen og brukes som display-marker.${overlapText}`,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: coordinate.sourceObjectId,
    address: coordinate.address,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coLocationAudit: {
      status: 'reviewed',
      nearbyCanonicalIds: overlapRows.map((row) => row.id),
      intentionalSharedAnchor: venue.id === 'riksscenen',
      note: venue.id === 'riksscenen'
        ? 'Riksscenen er en selvstendig institusjon i Schous Kulturbryggeri og deler registrert baseadresse med schous_bryggeri.'
        : 'Ingen eksisterende canonical place-record deler det eksakte adressepunktet.'
    }
  };
}

const aggregate = readJson(AGGREGATE);
const manifest = readJson(MANIFEST);
const index = readJson(INDEX);
const globalIndexBefore = readJson(GLOBAL_INDEX);
if (!Array.isArray(aggregate) || !Array.isArray(manifest.places) || !Array.isArray(index) || !Array.isArray(globalIndexBefore)) {
  throw new Error('Unexpected Scenekunst or global index shape');
}

const newIds = new Set(VENUES.map((venue) => venue.id));
if (newIds.size !== VENUES.length) throw new Error('Duplicate new venue IDs');
for (const id of newIds) {
  if (aggregate.some((row) => row.id === id) || globalIndexBefore.some((row) => row.id === id)) {
    throw new Error(`${id}: canonical place already exists`);
  }
}

const coordinateResults = [];
const newPlaces = [];
for (const venue of VENUES) {
  const coordinate = await exactAddress(venue);
  const nearby = globalIndexBefore
    .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon))
    .map((row) => ({ ...row, distanceMeters: haversineMeters(coordinate, row) }))
    .filter((row) => row.distanceMeters <= 2)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  if (venue.id === 'riksscenen') {
    if (!nearby.some((row) => row.id === 'schous_bryggeri')) {
      throw new Error('riksscenen: expected exact co-location with schous_bryggeri was not found');
    }
  } else if (nearby.length > 0) {
    throw new Error(`${venue.id}: unexpected canonical overlap with ${nearby.map((row) => row.id).join(', ')}`);
  }

  const place = buildPlace(venue, coordinate, nearby);
  const childFile = `places_scenekunst/${venue.id}.json`;
  const childRel = path.posix.join(path.posix.dirname(MANIFEST), childFile);
  if (fs.existsSync(abs(childRel))) throw new Error(`${childRel}: target already exists`);
  writeJson(childRel, place);

  aggregate.push(place);
  manifest.places.push({
    id: place.id,
    name: place.name,
    category: place.category,
    file: childFile,
    order: manifest.places.length,
    sha256: sha256(childRel)
  });
  index.push({
    id: place.id,
    name: place.name,
    category: place.category,
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    year: place.year,
    coordStatus: place.coordStatus,
    coordType: place.coordType,
    locatorType: place.locatorType,
    sourceProvider: place.sourceProvider,
    sourceObjectId: place.sourceObjectId,
    geocodeAccuracy: place.geocodeAccuracy,
    coordRole: place.coordRole,
    coordSource: place.coordSource,
    coordSourceUrl: place.coordSourceUrl,
    coordVerifiedAt: place.coordVerifiedAt,
    coordNote: place.coordNote,
    address: place.address,
    file: childFile
  });
  newPlaces.push(place);
  coordinateResults.push({
    id: venue.id,
    query: venue.query,
    sourceUrl: coordinate.sourceUrl,
    sourceObjectId: coordinate.sourceObjectId,
    coordinate: { lat: coordinate.lat, lon: coordinate.lon },
    address: coordinate.address,
    exactOverlapIds: nearby.map((row) => row.id),
    overlapDecision: venue.id === 'riksscenen'
      ? 'intentional_shared_address_anchor_with_distinct_institution_function'
      : 'no_overlap'
  });
}

writeJson(AGGREGATE, aggregate);
manifest.place_count = manifest.places.length;
manifest.generated_at = NOW;
manifest.source_sha256 = sha256(AGGREGATE);
for (const row of manifest.places) {
  const childRel = path.posix.join(path.posix.dirname(MANIFEST), row.file);
  row.sha256 = sha256(childRel);
}
writeJson(MANIFEST, manifest);
writeJson(INDEX, index);

writeJson(REPORT_JSON, {
  generatedAt: NOW,
  status: 'built_pending_validation',
  category: 'scenekunst',
  batch: 'oslo_new_venues_1',
  addedPlaceIds: newPlaces.map((place) => place.id),
  officialInstitutionSources: Object.fromEntries(VENUES.map((venue) => [venue.id, venue.knowledge.sources])),
  coordinateResults,
  overlapAudit: {
    riksscenen: {
      status: 'intentional_co_location',
      sharedCanonicalId: 'schous_bryggeri',
      rationale: 'Begge ligger i Schous Kulturbryggeri og deler registrert baseadresse, men Riksscenen har egne saler og en selvstendig nasjonal scenekunstfunksjon.'
    }
  },
  validation: {
    geonorgeExactAddressLookup: 'pass',
    overlapAudit: 'pass',
    placesIndexBuild: 'pending_workflow',
    placesChecks: 'pending_workflow',
    categoryAudit: 'pending_workflow'
  }
});

const md = [
  '# Scenekunst – nye Oslo-steder, batch 1',
  '',
  `Generert: ${NOW}`,
  '',
  '## Nye steder',
  '',
  ...newPlaces.map((place) => `- \`${place.id}\` – ${place.name}`),
  '',
  '## Koordinater',
  '',
  ...coordinateResults.flatMap((row) => [
    `### \`${row.id}\``,
    '',
    `- Adresse: ${row.address.street} ${row.address.number}, ${row.address.postcode} Oslo`,
    `- Geonorge-objekt: \`${row.sourceObjectId}\``,
    `- Punkt: ${row.coordinate.lat}, ${row.coordinate.lon}`,
    `- Overlap: ${row.overlapDecision}`,
    ''
  ]),
  '## Riksscenen / Schous Bryggeri',
  '',
  'Riksscenen og den eksisterende canonical recorden `schous_bryggeri` deler offisiell baseadresse i Schous Kulturbryggeri. Dette er godkjent som en bevisst samlokalisering: bryggeriet representerer det historiske næringslivs- og bygningskomplekset, mens Riksscenen representerer en aktiv nasjonal scenekunstinstitusjon med egne saler og eget publikumsløp.',
  ''
];
fs.writeFileSync(abs(REPORT_MD), md.join('\n'), 'utf8');

console.log(`Added ${newPlaces.length} Oslo Scenekunst venues:`);
for (const place of newPlaces) console.log(`- ${place.id}: ${place.lat}, ${place.lon}`);
