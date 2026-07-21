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
const GLOBAL_INDEX = 'data/places/places_index.json';
const REPORT_JSON = 'reports/scenekunst-oslo-new-venues-batch-3-2026-07-21.json';
const REPORT_MD = 'reports/scenekunst-oslo-new-venues-batch-3-2026-07-21.md';

const VENUES = [
  {
    id: 'centralteatret',
    name: 'Centralteatret',
    aliases: ['Oslo Nye Centralteatret', "Centralteatret / Teaterkjeller'n", 'Caféscenen'],
    year: 1897,
    query: 'Akersgata 38 Oslo',
    street: 'Akersgata',
    number: 38,
    expectedPostcode: null,
    allowedCoLocationIds: [],
    desc: 'Historisk teaterhus i Akersgata med Centralteatrets hovedsal, Teaterkjeller’n og Caféscenen.',
    popupDesc: 'Centralteatret står på en av Oslos lengst sammenhengende teatertomter. Teateraktivitet på eiendommen kan spores tilbake til Det Dramatiske Selskab i 1780, mens dagens teatersal ble ombygd av Henrik Bull i 1897. Oslo Nye Teater overtok driften i 1971. History Go samler Centralteatret, Teaterkjeller’n og Caféscenen i én fysisk stedspakke fordi scenene ligger i samme teaterbygning i Akersgata 38. Stedet viser hvordan et teaterhus kan romme både institusjonshistorie, repertoarteater, revy, kabaret og mindre sceneformater.',
    tags: ['teaterhistorie', 'repertoarteater', 'revy', 'kabaret', 'dukketeater', 'oslo_nye_teater'],
    emne_ids: [
      'em_scenekunst_teaterinstitusjon_repertoar',
      'em_scenekunst_dramaturgi_iscenesettelse',
      'em_scenekunst_publikum_fjerde_vegg'
    ],
    quiz_profile: {
      place_type: 'historisk_teaterhus',
      subtype: 'flerroms_repertoar_og_underholdningsteater',
      signature_features: [
        'teatertradisjon på tomten siden 1780',
        'teatersal ombygd av Henrik Bull i 1897',
        'Centralteatret, Teaterkjeller’n og Caféscenen i samme bygg'
      ],
      primary_angles: ['teaterhistorie', 'institusjon', 'repertoar', 'sceneformater'],
      question_families: ['historisk_endring', 'institusjon', 'saertrekk', 'kontrast'],
      avoid_angles: ['tre_separate_bygningsmarkorer', 'bare_oslo_nye_administrasjon'],
      must_include: ['skillet mellom lang teatertomt-historie og dagens scenehus', 'at flere scener deler samme fysiske bygning'],
      contrast_targets: ['oslo_nye_teater_hovedscenen', 'chat_noir'],
      notes: 'Spør som ett fysisk teaterkompleks. Teaterkjeller’n og Caféscenen skal ikke få dupliserte koordinatmarkører.'
    },
    knowledge: {
      one_liner: 'Centralteatret samler mer enn to hundre års teaterhistorie i ett aktivt scenehus.',
      why_it_matters: [
        'Tomten dokumenterer en uvanlig lang kontinuitet i Oslos teaterliv.',
        'Flere saler gjør huset egnet for alt fra repertoarteater til revy, kabaret og dukketeater.'
      ],
      what_to_notice: [
        'Forskjellen mellom teaterhistorien på tomten og ombyggingen av dagens sal i 1897.',
        'Hvordan hovedsal, kjellerscene og caféscene gir ulike publikumsrelasjoner.',
        'At Oslo Nye overtok driften i 1971.'
      ],
      terms: ['repertoarteater', 'teaterhus', 'kabaret', 'flerromsscene'],
      sources: ['https://oslonye.no/historikk/', 'https://oslonye.no/forestillinger/centralrevyen/']
    },
    physicalScope: 'Centralteatret, Teaterkjeller’n og Caféscenen representeres som ett fysisk teaterkompleks i Akersgata 38.'
  },
  {
    id: 'kloden_teater_pilotscenen',
    name: 'Kloden teater – Pilotscenen',
    aliases: ['Kloden Pilotscenen', 'Kloden teater'],
    year: 2020,
    query: 'Kabelgata 31 Oslo',
    street: 'Kabelgata',
    number: 31,
    expectedPostcode: '0581',
    allowedCoLocationIds: ['standard_telefon_og_kabelfabrikk', 'standard_telefon_kabelfabrikk', 'standard_telefon_kabelfabrik'],
    desc: 'Kloden teaters aktive pilotscene på Økern, nasjonal scene for scenekunst for barn og ungdom.',
    popupDesc: 'Kloden teater er en nasjonal scene for scenekunst for barn og ungdom. Institusjonen flyttet til Kabelgata i 2020 og driver Pilotscenen som programmerende teater, produksjonssted og møteplass for unge publikummere og det frie scenekunstfeltet. Denne stedspakken gjelder den aktive Pilotscenen i Kabelgata 31. Et større permanent teaterhus bygges i samme bygningskropp og er planlagt åpnet sommeren 2027; History Go-markøren skal derfor dokumentere dagens aktive scene uten å fremstille det framtidige bygget som ferdig.',
    tags: ['barneteater', 'ungdomsteater', 'programmeringsteater', 'fri_scenekunst', 'publikumsutvikling', 'økern'],
    emne_ids: [
      'em_scenekunst_teaterinstitusjon_repertoar',
      'em_scenekunst_publikum_fjerde_vegg',
      'em_scenekunst_dramaturgi_iscenesettelse'
    ],
    quiz_profile: {
      place_type: 'nasjonal_scenekunstinstitusjon',
      subtype: 'programmeringsteater_for_barn_og_ungdom',
      signature_features: [
        'nasjonal scene for barn og ungdom',
        'aktiv Pilotscene i Kabelgata 31 siden 2020',
        'programmering, produksjon og faglig utvikling for det frie feltet'
      ],
      primary_angles: ['barn_og_ungdom', 'programmering', 'tilgjengelighet', 'byutvikling'],
      question_families: ['formaal', 'institusjon', 'publikum', 'historisk_endring'],
      avoid_angles: ['framstille_2027_huset_som_ferdig', 'generisk_skolescene'],
      must_include: ['unge som kjernepublikum og deltakere', 'Pilotscenen som dagens aktive venue'],
      contrast_targets: ['centralteatret', 'black_box_teater'],
      notes: 'Stedspakken må oppdateres når det permanente teaterhuset åpner. Inntil da gjelder markøren Pilotscenen.'
    },
    knowledge: {
      one_liner: 'Kloden Pilotscenen gjør profesjonell scenekunst tilgjengelig for barn og ungdom på Økern.',
      why_it_matters: [
        'Barn og unge behandles som et eget kunstnerisk publikum, ikke bare som skolebesøkende.',
        'Institusjonen fungerer også som ressurs- og produksjonssted for det frie scenekunstfeltet.'
      ],
      what_to_notice: [
        'Hvordan programmet kombinerer forestillinger, deltakelse og faglig utvikling.',
        'Plasseringen i Kabelgata som del av Hovinbyen og Groruddalen.',
        'Forskjellen mellom dagens Pilotscene og det planlagte permanente teaterhuset.'
      ],
      terms: ['barn_og_ungdom', 'programmeringsteater', 'publikumsutvikling', 'pilotscene'],
      sources: ['https://www.kloden.no/om-kloden/hva-er-kloden/', 'https://www.kloden.no/besok-oss/', 'https://www.kloden.no/om-kloden/kloden-2-0/']
    },
    physicalScope: 'Den aktive Pilotscenen i Kabelgata 31. Administrasjonen i Kabelgata 39 C og det framtidige teaterhuset representeres ikke som separate ferdige scener.',
    lifecycle: {
      status: 'active_temporary_venue',
      plannedTransition: 'Permanent teaterhus i samme bygningskropp er planlagt åpnet sommeren 2027.',
      reviewAfter: '2027-06-01'
    }
  },
  {
    id: 'grusomhetens_teater',
    name: 'Grusomhetens Teater',
    aliases: ['Theatre of Cruelty', 'Scenen Grusomhetens Teater'],
    year: 2002,
    query: 'Hausmanns gate 34 Oslo',
    street: 'Hausmanns gate',
    number: 34,
    expectedPostcode: '0182',
    allowedCoLocationIds: ['hausmania', 'hausmania_kulturhus'],
    desc: 'Kunstnerdrevet fysisk teater i Hausmania, inspirert av Antonin Artauds teateridéer.',
    popupDesc: 'Grusomhetens Teater ble utviklet som selvstendig kompani fra slutten av 1980-årene og har hatt egen scene i Hausmanns gate 34 siden 2002. Kompaniet arbeider i en fysisk og poetisk teatertradisjon inspirert av Antonin Artauds idé om grusomhetens teater, der kropp, pust, rom, rytme og scenebilde kan være viktigere enn realistisk dialog. Stedet er en egen scenekunstinstitusjon inne i Hausmania-komplekset og skal derfor ikke forveksles med kulturhuset som helhet.',
    tags: ['fysisk_teater', 'avantgarde', 'antonin_artaud', 'eksperimentell_scenekunst', 'kunstnerdrevet', 'hausmania'],
    emne_ids: [
      'em_scenekunst_dramaturgi_iscenesettelse',
      'em_scenekunst_publikum_fjerde_vegg',
      'em_scenekunst_teaterinstitusjon_repertoar'
    ],
    quiz_profile: {
      place_type: 'kunstnerdrevet_teaterkompani_og_scene',
      subtype: 'fysisk_og_artaud_inspirert_teater',
      signature_features: [
        'egen scene i Hausmanns gate 34 siden 2002',
        'kropp, pust og scenebilde som bærende virkemidler',
        'inspirasjon fra Antonin Artauds teateridéer'
      ],
      primary_angles: ['fysisk_teater', 'avantgarde', 'iscenesettelse', 'kunstnerdrevet_institusjon'],
      question_families: ['saertrekk', 'virkemidler', 'institusjon', 'kontrast'],
      avoid_angles: ['generisk_hausmania_record', 'realistisk_dialogteater_som_hovedmodell'],
      must_include: ['den fysiske teatertradisjonen', 'skillet mellom teaterscenen og Hausmania som kulturhus'],
      contrast_targets: ['black_box_teater', 'centralteatret'],
      notes: 'Kan dele bygningsanker med Hausmania, men har egen scene, institusjonell identitet og publikumsløp.'
    },
    knowledge: {
      one_liner: 'Grusomhetens Teater undersøker hva teater kan være når kroppen og rommet får forrang foran realistisk tekst.',
      why_it_matters: [
        'Kompaniet viderefører en særpreget avantgardetradisjon i norsk scenekunst.',
        'En permanent kunstnerdrevet scene gir et langsiktig rom for fysisk og eksperimentelt teater.'
      ],
      what_to_notice: [
        'Hvordan pust, rytme, kropp og scenebilde skaper mening.',
        'Forskjellen mellom fysisk teater og psykologisk realisme.',
        'At scenen er en selvstendig institusjon inne i Hausmania.'
      ],
      terms: ['fysisk_teater', 'avantgarde', 'artaud', 'kunstnerdrevet_scene'],
      sources: ['https://www.grusomhetensteater.no/kompaniet/', 'https://www.grusomhetensteater.no/kontakt/', 'https://www.hausmania.org/']
    },
    physicalScope: 'Grusomhetens Teaters egen scene i Hausmanns gate 34, ikke hele Hausmania-komplekset.'
  }
];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
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
  if (exact.length !== 1) throw new Error(`${venue.id}: expected one exact Geonorge address, found ${exact.length}`);
  const hit = exact[0];
  const point = hit.representasjonspunkt;
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) throw new Error(`${venue.id}: invalid representation point`);
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
    }
  };
}

function buildPlace(venue, coordinate, nearby) {
  const coLocation = nearby.length > 0;
  const coLocationText = coLocation
    ? ` Adressepunktet deles med ${nearby.map((row) => row.id).join(', ')}. Dette er godkjent som en fysisk samlokalisering med ulik canonical funksjon.`
    : '';
  const place = {
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
    physicalScope: venue.physicalScope,
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl,
    coordVerifiedAt: VERIFIED_DATE,
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${coordinate.address.street} ${coordinate.address.number}, OSLO. Punktet er representasjonspunktet for den avgrensede scenekunstfunksjonen og brukes som display-marker.${coLocationText}`,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: coordinate.sourceObjectId,
    address: coordinate.address,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coLocationAudit: {
      status: 'reviewed',
      nearbyCanonicalIds: nearby.map((row) => row.id),
      intentionalSharedAnchor: coLocation,
      note: coLocation
        ? 'Eksisterende canonical bygningspost og scenekunststedet deler fysisk adresse, men representerer ulike funksjoner.'
        : 'Ingen eksisterende canonical place-record deler det eksakte adressepunktet.'
    }
  };
  if (venue.lifecycle) place.lifecycle = venue.lifecycle;
  return place;
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
  const unexpected = nearby.filter((row) => !venue.allowedCoLocationIds.includes(row.id));
  if (unexpected.length > 0) {
    throw new Error(`${venue.id}: unexpected canonical overlap with ${unexpected.map((row) => row.id).join(', ')}`);
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
    overlapDecision: nearby.length > 0
      ? 'intentional_shared_address_anchor_with_distinct_function'
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
  batch: 'oslo_new_venues_3',
  addedPlaceIds: newPlaces.map((place) => place.id),
  officialInstitutionSources: Object.fromEntries(VENUES.map((venue) => [venue.id, venue.knowledge.sources])),
  coordinateResults,
  physicalScopeDecisions: Object.fromEntries(VENUES.map((venue) => [venue.id, venue.physicalScope])),
  lifecycleDecisions: Object.fromEntries(VENUES.filter((venue) => venue.lifecycle).map((venue) => [venue.id, venue.lifecycle])),
  validation: {
    geonorgeExactAddressLookup: 'pass',
    overlapAudit: 'pass',
    placesIndexBuild: 'pending_workflow',
    placesChecks: 'pending_workflow',
    categoryAudit: 'pending_workflow'
  }
});

const md = [
  '# Scenekunst – nye Oslo-steder, batch 3',
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
    `- Overlap: ${row.overlapDecision}${row.exactOverlapIds.length ? ` (${row.exactOverlapIds.join(', ')})` : ''}`,
    ''
  ]),
  '## Fysiske avgrensninger',
  '',
  ...VENUES.map((venue) => `- \`${venue.id}\`: ${venue.physicalScope}`),
  '',
  '## Statusvalg',
  '',
  '- Trikkestallen er ikke opprettet som aktiv Oslo Nye-scene. Oslo Nye avsluttet dukketeaterdriften der 15. mars 2025 og flyttet virksomheten til Centralteatret.',
  '- Kloden-recorden gjelder dagens aktive Pilotscene; permanent teaterhus er planlagt åpnet sommeren 2027.',
  ''
];
fs.writeFileSync(abs(REPORT_MD), md.join('\n'), 'utf8');

console.log(`Added ${newPlaces.length} Oslo Scenekunst venues:`);
for (const place of newPlaces) console.log(`- ${place.id}: ${place.lat}, ${place.lon}`);
