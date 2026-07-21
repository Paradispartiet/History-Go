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
const REPORT_JSON = 'reports/scenekunst-oslo-new-venues-batch-2-2026-07-21.json';
const REPORT_MD = 'reports/scenekunst-oslo-new-venues-batch-2-2026-07-21.md';

const VENUES = [
  {
    id: 'oslo_nye_teater_hovedscenen',
    name: 'Oslo Nye Teater – Hovedscenen',
    aliases: ['Oslo Nye Teater', 'Oslo Nye Hovedscenen', 'Det Nye Teater'],
    year: 1929,
    query: "Rosenkrantz' gate 10 Oslo",
    street: "Rosenkrantz' gate",
    number: 10,
    expectedPostcode: '0159',
    desc: 'Oslo Nye Teaters hovedscene i teaterbygget fra 1929 i Rosenkrantz’ gate.',
    popupDesc: 'Hovedscenen i Rosenkrantz’ gate 10 åpnet som Det Nye Teater i 1929. Da A/S Scenekunst og Folketeatret ble slått sammen i 1959, ble bygget hovedscene for Oslo Nye Teater. Institusjonen er kommunalt eid og har et bredt repertoar med dramatikk, komedie, musikkteater og familieforestillinger. Stedspakken gjelder dette konkrete teaterhuset; Centralteatret og Teaterkjeller’n ligger i Akersgata og skal modelleres som egne fysiske steder.',
    tags: ['teater', 'hovedscene', 'repertoarteater', 'komedie', 'musikkteater', 'familieteater', 'oslo'],
    emne_ids: [
      'em_scenekunst_teaterinstitusjon_repertoar',
      'em_scenekunst_dramaturgi_iscenesettelse',
      'em_scenekunst_musikal_musikkteater'
    ],
    quiz_profile: {
      place_type: 'kommunal_teaterinstitusjon',
      subtype: 'hovedscene_i_historisk_teaterbygg',
      signature_features: [
        'teaterbygget åpnet i 1929',
        'hovedscene for Oslo Nye Teater siden sammenslåingen i 1959',
        'bredt repertoar for hovedstadens publikum'
      ],
      primary_angles: ['institusjon', 'repertoar', 'teaterhistorie', 'sceneteknikk'],
      question_families: ['historisk_endring', 'institusjon', 'formaal', 'kontrast'],
      avoid_angles: ['blande_hovedscenen_med_centralteatret', 'generisk_teaterhus'],
      must_include: ['skillet mellom byggets åpning i 1929 og Oslo Nye-selskapet fra 1959', 'at place-recorden gjelder Hovedscenen i Rosenkrantz’ gate'],
      contrast_targets: ['nationaltheatret', 'folketeateret', 'det_norske_teatret'],
      notes: 'Spør som fysisk hovedscene og kommunal repertoarinstitusjon. Centralteatret er et annet teaterhus.'
    },
    knowledge: {
      one_liner: 'Oslo Nye Hovedscenen binder teaterbygget fra 1929 til den kommunale Oslo Nye-institusjonen fra 1959.',
      why_it_matters: [
        'Teatret viser hvordan institusjoner kan skifte navn, eierskap og repertoar uten at det fysiske scenehuset forsvinner.',
        'Den brede profilen kobler dramatikk, komedie, musikkteater og familieforestillinger.'
      ],
      what_to_notice: [
        'Skillet mellom Det Nye Teater fra 1929 og Oslo Nye Teater A/S fra 1959.',
        'At Oslo Nye driver flere scener på to adresser.',
        'Hvordan et stort scenehus organiserer publikum, sceneteknikk og repertoar.'
      ],
      terms: ['hovedscene', 'repertoar', 'kommunalt_teater', 'scenehus'],
      sources: ['https://oslonye.no/historikk/', 'https://oslonye.no/leie-av-lokaler/']
    }
  },
  {
    id: 'det_andre_teatret',
    name: 'Det Andre Teatret',
    aliases: ['DAT', 'Det Andre Teateret'],
    year: 2011,
    query: 'Ivan Bjørndals gate 9 Oslo',
    street: 'Ivan Bjørndals gate',
    number: 9,
    expectedPostcode: '0472',
    desc: 'Improvisasjonsteater på Lilleborg med egen hovedscene, teaterbar og ukentlige forestillinger.',
    popupDesc: 'Det Andre Teatret åpnet i 2011 som Norges første teater med improvisasjon som hovedprofil. Teatret spiller et stort antall improviserte og manusbaserte forestillinger for barn og voksne, og bygger mye av uttrykket på nær historiefortelling, publikumsdialog og lek med teatrale virkemidler. Stedspakken forankres i hovedscenen og baren i Ivan Bjørndals gate 9; intimscenen i nummer 28 er en separat fysisk scene i samme institusjon.',
    tags: ['improvisasjon', 'improteater', 'publikumsdeltakelse', 'komedie', 'teaterbar', 'lilleborg'],
    emne_ids: [
      'em_scenekunst_revy_standup_impro',
      'em_scenekunst_publikum_fjerde_vegg',
      'em_scenekunst_teaterinstitusjon_repertoar'
    ],
    quiz_profile: {
      place_type: 'improvisasjonsteater',
      subtype: 'fast_improscene_med_teaterbar',
      signature_features: [
        'åpnet i 2011',
        'Norges første og største improteater',
        'forestillingene formes i dialog med publikum'
      ],
      primary_angles: ['improvisasjon', 'publikum', 'timing', 'institusjon'],
      question_families: ['formaal', 'saertrekk', 'publikumsrolle', 'kontrast'],
      avoid_angles: ['generisk_komediescene', 'forveksle_hovedscenen_med_intimscenen'],
      must_include: ['improvisasjon som hovedform', 'publikums aktive rolle i forestillingen'],
      contrast_targets: ['latter', 'chat_noir', 'edderkoppen_scene'],
      notes: 'Spør som improteater og levende publikumsformat, ikke bare som bar eller komediescene.'
    },
    knowledge: {
      one_liner: 'Det Andre Teatret gjør improvisasjon og publikumsdialog til en fast teaterinstitusjon.',
      why_it_matters: [
        'Improvisasjon viser hvordan dramaturgi og rolle kan oppstå i øyeblikket.',
        'Teatret kombinerer profesjonelt ensemblearbeid, kurs, frivillighet og en fast publikumsarena.'
      ],
      what_to_notice: [
        'Hvordan forslag fra publikum kan påvirke handling og form.',
        'Forskjellen mellom improvisasjon og ferdigskrevet dramatikk.',
        'At hovedscenen og intimscenen ligger på to ulike adresser på Lilleborg.'
      ],
      terms: ['improvisasjon', 'publikumsdialog', 'spontan_dramaturgi', 'ensemble'],
      sources: ['https://detandreteatret.no/om', 'https://detandreteatret.no/kontakt']
    }
  },
  {
    id: 'nordic_black_theatre_cafeteatret',
    name: 'Nordic Black Theatre / Cafeteatret',
    aliases: ['Nordic Black Theatre', 'Cafeteatret', 'Caféteatret'],
    year: 2011,
    query: 'Hollendergata 8 Oslo',
    street: 'Hollendergata',
    number: 8,
    expectedPostcode: '0190',
    desc: 'Produserende teater og transkulturell scene i den tidligere metodistkirken i Hollendergata.',
    popupDesc: 'Nordic Black Theatre ble etablert i 1992 av Cliff A. Moustache og Jarl Solberg. Etter perioder på Parkteatret og teaterbåten MS Innvik fikk institusjonen i 2011 fast hjem i den tidligere metodistkirken i Hollendergata 8, kjent som Cafeteatret. Her produseres egne forestillinger, kunstnere samarbeider på tvers av bakgrunner og unge transkulturelle scenekunstnere utvikles gjennom Nordic Black Xpress. Lokalet brukes også til konserter, poesi, debatter og familiearrangementer.',
    tags: ['teater', 'transkulturell_scenekunst', 'cafeteatret', 'teaterutdanning', 'grønland', 'mangfold'],
    emne_ids: [
      'em_scenekunst_teaterinstitusjon_repertoar',
      'em_scenekunst_skuespill_rollefortolkning',
      'em_scenekunst_publikum_fjerde_vegg'
    ],
    quiz_profile: {
      place_type: 'produserende_teaterinstitusjon',
      subtype: 'transkulturelt_teater_og_utviklingsmiljo',
      signature_features: [
        'institusjonen etablert i 1992',
        'fast hjem i Cafeteatret siden 2011',
        'utvikler transkulturelle scenekunstnere gjennom Nordic Black Xpress'
      ],
      primary_angles: ['institusjon', 'mangfold', 'utoverutvikling', 'offentlighet'],
      question_families: ['historisk_endring', 'formaal', 'institusjon', 'kulturutveksling'],
      avoid_angles: ['bare_kafe_eller_konsertlokale', 'generisk_mangfoldsformulering'],
      must_include: ['egenproduksjon og kunstnerutvikling', 'flyttingen til Cafeteatret i 2011'],
      contrast_targets: ['black_box_teater', 'det_andre_teatret', 'nationaltheatret'],
      notes: 'Spør som produserende teater og kunstnerisk utviklingsmiljø. Cafeteatret er institusjonens fysiske hjem.'
    },
    knowledge: {
      one_liner: 'Nordic Black Theatre kombinerer egenproduksjon, transkulturell kunstnerutvikling og en åpen scene på Grønland.',
      why_it_matters: [
        'Institusjonen utvider hvem som får utvikle, produsere og møte publikum i norsk scenekunst.',
        'Cafeteatret fungerer både som teaterhjem og som arena for konserter, poesi, debatt og familieprogram.'
      ],
      what_to_notice: [
        'Sammenhengen mellom teaterproduksjon og Nordic Black Xpress.',
        'Hvordan den tidligere metodistkirken er tatt i bruk som levende scenekunsthus.',
        'Institusjonens flyttehistorie fra Parkteatret via MS Innvik til Grønland.'
      ],
      terms: ['transkulturell_scenekunst', 'egenproduksjon', 'kunstnerutvikling', 'cafeteater'],
      sources: ['https://nordicblacktheatre.no/info', 'https://nordicblacktheatre.no/lokaler']
    }
  }
];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, value) {
  const file = abs(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function sha256(rel) { return crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex'); }
function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
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
  if (exact.length !== 1) throw new Error(`${venue.id}: expected one exact Geonorge address for ${venue.query}, found ${exact.length}`);
  const hit = exact[0];
  const point = hit.representasjonspunkt;
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) throw new Error(`${venue.id}: exact address has no valid representation point`);
  if (venue.expectedPostcode && String(hit.postnummer) !== venue.expectedPostcode) throw new Error(`${venue.id}: expected postcode ${venue.expectedPostcode}, got ${hit.postnummer}`);
  const suffix = `${hit.nummer}${String(hit.bokstav ?? '').trim()}`;
  return {
    sourceUrl,
    sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${suffix}`,
    lat: point.lat,
    lon: point.lon,
    address: { street: hit.adressenavn, number: String(hit.nummer), postcode: String(hit.postnummer), city: 'Oslo', country: 'NO' }
  };
}

function buildPlace(venue, coordinate, nearby) {
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
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${coordinate.address.street} ${coordinate.address.number}, OSLO. Punktet er representasjonspunktet for teaterbygningen/institusjonen og brukes som display-marker.`,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: coordinate.sourceObjectId,
    address: coordinate.address,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coLocationAudit: {
      status: 'reviewed',
      nearbyCanonicalIds: nearby.map((row) => row.id),
      intentionalSharedAnchor: false,
      note: 'Ingen eksisterende canonical place-record deler det eksakte adressepunktet.'
    }
  };
}

const aggregate = readJson(AGGREGATE);
const manifest = readJson(MANIFEST);
const index = readJson(INDEX);
const globalIndexBefore = readJson(GLOBAL_INDEX);
if (!Array.isArray(aggregate) || !Array.isArray(manifest.places) || !Array.isArray(index) || !Array.isArray(globalIndexBefore)) throw new Error('Unexpected Scenekunst or global index shape');

const newIds = new Set(VENUES.map((venue) => venue.id));
if (newIds.size !== VENUES.length) throw new Error('Duplicate new venue IDs');
for (const id of newIds) {
  if (aggregate.some((row) => row.id === id) || globalIndexBefore.some((row) => row.id === id)) throw new Error(`${id}: canonical place already exists`);
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
  if (nearby.length > 0) throw new Error(`${venue.id}: unexpected canonical overlap with ${nearby.map((row) => row.id).join(', ')}`);

  const place = buildPlace(venue, coordinate, nearby);
  const childFile = `places_scenekunst/${venue.id}.json`;
  const childRel = path.posix.join(path.posix.dirname(MANIFEST), childFile);
  if (fs.existsSync(abs(childRel))) throw new Error(`${childRel}: target already exists`);
  writeJson(childRel, place);
  aggregate.push(place);
  manifest.places.push({ id: place.id, name: place.name, category: place.category, file: childFile, order: manifest.places.length, sha256: sha256(childRel) });
  index.push({
    id: place.id, name: place.name, category: place.category, lat: place.lat, lon: place.lon, r: place.r, year: place.year,
    coordStatus: place.coordStatus, coordType: place.coordType, locatorType: place.locatorType,
    sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, geocodeAccuracy: place.geocodeAccuracy,
    coordRole: place.coordRole, coordSource: place.coordSource, coordSourceUrl: place.coordSourceUrl,
    coordVerifiedAt: place.coordVerifiedAt, coordNote: place.coordNote, address: place.address, file: childFile
  });
  newPlaces.push(place);
  coordinateResults.push({
    id: venue.id, query: venue.query, sourceUrl: coordinate.sourceUrl, sourceObjectId: coordinate.sourceObjectId,
    coordinate: { lat: coordinate.lat, lon: coordinate.lon }, address: coordinate.address,
    exactOverlapIds: nearby.map((row) => row.id), overlapDecision: 'no_overlap'
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
  batch: 'oslo_new_venues_2',
  dependsOn: 'agent/scenekunst-oslo-new-venues-01 / PR #3179',
  addedPlaceIds: newPlaces.map((place) => place.id),
  officialInstitutionSources: Object.fromEntries(VENUES.map((venue) => [venue.id, venue.knowledge.sources])),
  coordinateResults,
  physicalScopeDecisions: {
    oslo_nye_teater_hovedscenen: 'Only the Hovedscenen building at Rosenkrantz gate 10. Centralteatret and Teaterkjelleren remain separate future physical place packages.',
    det_andre_teatret: 'Main stage and theatre bar at Ivan Bjørndals gate 9. The intimate stage at number 28 is outside this place package.',
    nordic_black_theatre_cafeteatret: 'The institution and its permanent venue Cafeteatret at Hollendergata 8 are represented together.'
  },
  validation: {
    geonorgeExactAddressLookup: 'pass', overlapAudit: 'pass', placesIndexBuild: 'pending_workflow', placesChecks: 'pending_workflow', categoryAudit: 'pending_workflow'
  }
});

const md = [
  '# Scenekunst – nye Oslo-steder, batch 2', '', `Generert: ${NOW}`, '',
  '## Nye steder', '', ...newPlaces.map((place) => `- \`${place.id}\` – ${place.name}`), '',
  '## Koordinater', '',
  ...coordinateResults.flatMap((row) => [
    `### \`${row.id}\``, '',
    `- Adresse: ${row.address.street} ${row.address.number}, ${row.address.postcode} Oslo`,
    `- Geonorge-objekt: \`${row.sourceObjectId}\``,
    `- Punkt: ${row.coordinate.lat}, ${row.coordinate.lon}`,
    `- Overlap: ${row.overlapDecision}`, ''
  ]),
  '## Fysisk avgrensning', '',
  '- Oslo Nye-recorden gjelder Hovedscenen i Rosenkrantz’ gate 10. Centralteatret og Teaterkjeller’n er et annet teaterhus i Akersgata.',
  '- Det Andre Teatret-recorden gjelder hovedscenen og teaterbaren i Ivan Bjørndals gate 9. Intimscenen i nummer 28 er en separat fysisk scene.',
  '- Nordic Black Theatre og Cafeteatret modelleres sammen fordi Cafeteatret er institusjonens faste teaterhjem i Hollendergata 8.', ''
];
fs.writeFileSync(abs(REPORT_MD), md.join('\n'), 'utf8');

console.log(`Added ${newPlaces.length} Oslo Scenekunst venues:`);
for (const place of newPlaces) console.log(`- ${place.id}: ${place.lat}, ${place.lon}`);
