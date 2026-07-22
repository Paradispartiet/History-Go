#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_DATE = '2026-07-22';
const NOW = new Date().toISOString();
const MANIFEST_PATH = 'data/places/manifest.json';
const GLOBAL_INDEX_PATH = 'data/places/places_index.json';
const REPORT_JSON = 'reports/scenekunst-national-new-venues-batch-2-2026-07-22.json';
const REPORT_MD = 'reports/scenekunst-national-new-venues-batch-2-2026-07-22.md';

const COMMON_EMNER = [
  'em_scenekunst_teaterinstitusjon_repertoar',
  'em_scenekunst_dramaturgi_iscenesettelse',
  'em_scenekunst_publikum_fjerde_vegg'
];

const VENUES = [
  {
    id: 'nordland_teater',
    name: 'Nordland Teater',
    aliases: ['Nordland Teater Mo i Rana'],
    sourceFile: 'places/scenekunst/nordland/nordland_teater.json',
    fylke: 'nordland',
    kommune: 'Rana',
    city: 'Mo i Rana',
    municipalityNumber: '1833',
    street: 'Rådhusalleen',
    number: 6,
    expectedPostcode: '8622',
    year: 2005,
    period: 'Regionteater, turné og moderne produksjonshus i Nordland',
    desc: 'Nordland Teaters faste produksjons- og scenehus i Mo i Rana, åpnet i 2005 som base for turnévirksomhet i hele fylket.',
    popupDesc: 'Nordland Teater ble etablert i 1979 som regionteater for Nordland. Etter mange år i leide lokaler fikk institusjonen i 2005 et eget teaterhus i Rådhusalleen. Huset rommer Hovedscena, Black Box, Teaterkafeen, Rugekassa, verksteder og produksjonsfunksjoner. Stedet viser hvordan et fast produksjonshus kan være motor for turnerende scenekunst i et langstrakt fylke, og hvordan Vinterlysfestivalen har gjort teateret til et regionalt samlingspunkt.',
    tags: ['regionteater', 'turneteater', 'nordland', 'mo_i_rana', 'vinterlysfestivalen', 'fler_scenehus'],
    physicalScope: 'Nordland Teaters eget hus i Rådhusalleen 6. Turnéspillesteder og eksterne verksted-/lagerlokaler inngår ikke i samme markør.',
    quiz_profile: {
      place_type: 'regionalt_turneteater_og_produksjonshus',
      subtype: 'moderne_flerscenehus_med_fylkesdekkende_turne',
      signature_features: ['regionteater etablert i 1979', 'eget teaterhus åpnet i 2005', 'fire scener og turnévirksomhet i hele Nordland'],
      primary_angles: ['regionteater', 'turne', 'produksjon', 'festival'],
      question_families: ['historisk_endring', 'institusjon', 'kulturgeografi', 'sceneformater'],
      avoid_angles: ['bare_lokal_scene_i_mo_i_rana', 'blande_turnesteder_med_hovedhuset'],
      must_include: ['forholdet mellom fast hus og fylkesdekkende turné', 'Vinterlysfestivalens rolle'],
      contrast_targets: ['halogaland_teater', 'teatret_vart_plassen'],
      notes: 'Spør som produksjonsbase og turnéteater, ikke som et rent lokalt kulturhus.'
    },
    knowledge: {
      one_liner: 'Nordland Teater bruker et fast produksjonshus i Mo i Rana til å skape scenekunst for et helt fylke.',
      why_it_matters: ['Teatret er en del av regionteatermodellen som desentraliserte profesjonell scenekunst.', 'Huset fra 2005 samler scener, verksteder og produksjon under ett tak.'],
      what_to_notice: ['De ulike scenestørrelsene i huset.', 'Sammenhengen mellom produksjonsapparatet og turnévirksomheten.', 'Vinterlysfestivalen som møteplass for teaterbyen Mo i Rana.'],
      terms: ['regionteater', 'turneteater', 'produksjonshus', 'fler_scenehus'],
      sources: ['https://nordlandteater.no/omoss/', 'https://nordlandteater.no/salgsbetingelser/', 'https://nordlandteater.no/nyheter/huset-v%C3%A5rt-fyller-20-%C3%A5r']
    }
  },
  {
    id: 'teatret_vart_plassen',
    name: 'Teatret Vårt – Plassen',
    aliases: ['Teatret Vårt', 'Regionteatret i Møre og Romsdal', 'Plassen Molde'],
    sourceFile: 'places/scenekunst/more_og_romsdal/teatret_vart_plassen.json',
    fylke: 'more_og_romsdal',
    kommune: 'Molde',
    city: 'Molde',
    municipalityNumber: '1506',
    street: 'Gørvellplassen',
    number: 1,
    expectedPostcode: '6413',
    year: 2012,
    period: 'Regionteater, kulturhusfellesskap og turné i Møre og Romsdal',
    desc: 'Teatret Vårts hovedscene og produksjonsbase i kulturhuset Plassen i Molde, åpnet i 2012.',
    popupDesc: 'Teatret Vårt ble etablert i 1972 som landets andre regionteater. I 2012 flyttet hovedkontoret og de faste Molde-scenene inn i Plassen, et kulturhus som også rommer bibliotek, jazzmiljø, litteraturfestival og kunstsenter. Teatret har samtidig fast scene i Ålesund og turnerer i hele Møre og Romsdal. Stedet viser både regionteatermodellen og hvordan flere kulturinstitusjoner kan dele et fleksibelt byhus.',
    tags: ['regionteater', 'turneteater', 'molde', 'plassen', 'barn_og_unge', 'kulturhus'],
    physicalScope: 'Teatret Vårts hovedkontor og faste Molde-scener i Plassen, Gørvellplassen 1. Arbeideren i Ålesund og turnéspillestedene inngår ikke i samme markør.',
    quiz_profile: {
      place_type: 'regionalt_turneteater_i_felles_kulturhus',
      subtype: 'hovedscene_og_produksjonsbase_pa_plassen',
      signature_features: ['regionteater etablert i 1972', 'hovedbase i Plassen siden 2012', 'faste scener i Molde og Ålesund samt fylkesturné'],
      primary_angles: ['regionteater', 'kulturhus', 'turne', 'barn_og_unge'],
      question_families: ['historisk_endring', 'institusjon', 'kulturgeografi', 'samlokalisering'],
      avoid_angles: ['behandle_hele_plassen_som_bare_teater', 'blande_alesundscenen_med_moldepunktet'],
      must_include: ['etableringen i 1972 som tidlig regionteater', 'Plassen som flerinstitusjonelt kulturhus'],
      contrast_targets: ['nordland_teater', 'teater_vestland_nynorskhuset'],
      notes: 'Markøren representerer Teatret Vårts funksjon i Plassen, ikke alle institusjonene i kulturhuset.'
    },
    knowledge: {
      one_liner: 'Teatret Vårt kombinerer et fast hjem i Plassen med turné og faste scener flere steder i Møre og Romsdal.',
      why_it_matters: ['Teatret var et av de første forsøkene på en permanent regionteatermodell i Norge.', 'Plassen samler teater, bibliotek, jazz, litteratur og kunst i samme byrom.'],
      what_to_notice: ['Den åpne forbindelsen mellom byplassen og kulturhuset.', 'Hvordan fleksible scener deles med andre kulturaktører.', 'At Teatret Vårts regionale oppdrag strekker seg langt utenfor Molde.'],
      terms: ['regionteater', 'turne', 'kulturhus', 'samlokalisering'],
      sources: ['https://teatretvart.no/om-teatret-vart/dette-er-teatret-vart', 'https://teatretvart.no/kontakt', 'https://plassen.molde.no/om-plassen']
    }
  },
  {
    id: 'teater_vestland_nynorskhuset',
    name: 'Teater Vestland – Nynorskhuset',
    aliases: ['Teater Vestland', 'Sogn og Fjordane Teater', 'Nynorskhuset Førde'],
    sourceFile: 'places/scenekunst/vestland/teater_vestland_nynorskhuset.json',
    fylke: 'vestland',
    kommune: 'Sunnfjord',
    city: 'Førde',
    municipalityNumber: '4647',
    street: 'Storehagen',
    number: 10,
    expectedPostcode: '6800',
    year: 2023,
    period: 'Nynorsk regionteater, turné og medie- og kulturklynge',
    desc: 'Teater Vestlands faste hjem i Nynorskhuset i Førde, åpnet i 2023 som nynorsk medie- og kulturklynge.',
    popupDesc: 'Teater Vestland ble etablert i 1977 som Sogn og Fjordane Teater og var Norges andre nynorskteater. Institusjonen turnerer i Vestland og bruker nynorsknære dialekter som scenespråk. I 2023 flyttet teatret inn i Nynorskhuset i Førde sammen med nynorske medie- og kompetansemiljøer. Huset rommer Teatersalen, Scene 2 og Nynorsk scenespråksenter og gjør språkpolitikk, turné og lokal kulturproduksjon synlig i samme sted.',
    tags: ['regionteater', 'nynorsk', 'dialekt', 'turneteater', 'forde', 'nynorskhuset'],
    physicalScope: 'Teater Vestlands teatersaler, verksteder og administrasjon i Nynorskhuset, Storehagen 10. Turnéspillesteder inngår ikke i samme markør.',
    quiz_profile: {
      place_type: 'nynorsk_regionteater_i_sprak_og_medieklynge',
      subtype: 'turneteater_med_to_scener_og_scenespraksenter',
      signature_features: ['etablert i 1977 som Sogn og Fjordane Teater', 'nynorsknære dialekter som scenespråk', 'nye lokaler i Nynorskhuset fra 2023'],
      primary_angles: ['nynorsk', 'regionteater', 'turne', 'sprakpolitikk'],
      question_families: ['historisk_endring', 'scenesprak', 'institusjon', 'samlokalisering'],
      avoid_angles: ['framstille_nynorskhuset_som_bare_teater', 'blande_turnesteder_med_forde'],
      must_include: ['navneskiftet fra Sogn og Fjordane Teater', 'Nynorsk scenespråksenter og dialektbruk'],
      contrast_targets: ['det_vestnorske_teateret', 'teatret_vart_plassen'],
      notes: 'Markøren representerer teaterfunksjonen i Nynorskhuset, ikke hele medieklyngen.'
    },
    knowledge: {
      one_liner: 'Teater Vestland gjør nynorsk og vestlandske dialekter til scenespråk fra et nytt hus som deles med nynorske mediemiljøer.',
      why_it_matters: ['Teatret er en sentral del av den nynorske scenekunsthistorien.', 'Nynorskhuset kobler teater, journalistikk, språkkompetanse og digital formidling.'],
      what_to_notice: ['Teatersalen og Scene 2 som ulike publikumsrom.', 'Hvordan språkidentitet er bygget inn i institusjonens oppdrag.', 'Forholdet mellom fast hus i Førde og turné i hele fylket.'],
      terms: ['nynorsk_scenesprak', 'regionteater', 'dialekt', 'sprakklynge'],
      sources: ['https://www.teatervestland.no/om-teater-vestland/', 'https://www.teatervestland.no/kontakt/', 'https://www.teatervestland.no/nynorskhuset/']
    }
  },
  {
    id: 'det_vestnorske_teateret',
    name: 'Det Vestnorske Teateret',
    aliases: ['Hordaland Teater', 'Det Vestnorske Teateret Logen'],
    sourceFile: 'places/scenekunst/vestland/det_vestnorske_teateret.json',
    fylke: 'vestland',
    kommune: 'Bergen',
    city: 'Bergen',
    municipalityNumber: '4601',
    street: 'Øvre Ole Bulls plass',
    number: 6,
    expectedPostcode: '5012',
    year: 1988,
    period: 'Vestnorsk regionteater, nynorsk dramatikk og historisk Logen-hus',
    desc: 'Vestnorsk regionteater med fast scene i Logen i Bergen sentrum og turnévirksomhet i Vestlandsregionen.',
    popupDesc: 'Det Vestnorske Teateret ble etablert i 1988 som Hordaland Teater. Institusjonen spiller på nynorsk og dialekt, utvikler ny dramatikk og turnerer i Vestlandsregionen. Det faste teaterhuset ligger i den historiske Logen ved Ole Bulls plass, der en større utbygging også har gitt teatret Scene 2 og verksteder. Stedet kobler vestnorsk språk- og identitetsarbeid med et sentralt historisk forsamlings- og teaterhus.',
    tags: ['regionteater', 'nynorsk', 'dialekt', 'bergen', 'logen', 'ny_dramatikk'],
    physicalScope: 'Det Vestnorske Teaterets hovedscene, Scene 2, publikumsarealer og administrasjon i Logen, Øvre Ole Bulls plass 6. Turnéspillesteder og lageret på Stend inngår ikke.',
    quiz_profile: {
      place_type: 'vestnorsk_regionteater_i_historisk_teaterhus',
      subtype: 'nynorsk_og_dialektbasert_teater_med_fast_scene_i_logen',
      signature_features: ['etablert som Hordaland Teater i 1988', 'fast scene i Logen i Bergen sentrum', 'nynorsk, dialekt og ny vestnorsk dramatikk'],
      primary_angles: ['nynorsk', 'regionteater', 'ny_dramatikk', 'teaterhus'],
      question_families: ['historisk_endring', 'scenesprak', 'institusjon', 'kontrast'],
      avoid_angles: ['forveksle_med_den_nationale_scene', 'behandle_logen_som_kun_administrasjonsbygg'],
      must_include: ['navneskiftet fra Hordaland Teater', 'kombinasjonen av fast Bergen-scene og regional turné'],
      contrast_targets: ['teater_vestland_nynorskhuset', 'den_nationale_scene'],
      notes: 'Én record for teaterfunksjonen i Logen, ikke alle historiske funksjoner bygget har hatt.'
    },
    knowledge: {
      one_liner: 'Det Vestnorske Teateret bruker nynorsk, dialekt og ny dramatikk til å fortelle Vestlandet fra Logen i Bergen.',
      why_it_matters: ['Institusjonen gir vestnorske stemmer en fast scene i regionens største by.', 'Logen knytter dagens teaterdrift til et eldre forsamlings- og kulturhus.'],
      what_to_notice: ['Forholdet mellom den historiske Logen og det moderne tilbygget.', 'Scene 2 og verkstedene som del av dagens produksjonshus.', 'Hvordan teateret kombinerer Bergen-publikum med turné i regionen.'],
      terms: ['nynorsk_scenesprak', 'regionteater', 'ny_dramatikk', 'logen'],
      sources: ['https://www.detvestnorsketeateret.no/om-oss', 'https://www.detvestnorsketeateret.no/om-oss/kontakt-oss']
    }
  },
  {
    id: 'beaivvas_coarvematta',
    name: 'Beaivváš – Čoarvemátta',
    aliases: ['Beaivváš Sámi Našunálateáhter', 'Det Samiske Nasjonalteatret Beaivváš', 'Čoarvemátta'],
    sourceFile: 'places/scenekunst/finnmark/beaivvas_coarvematta.json',
    fylke: 'finnmark',
    kommune: 'Kautokeino',
    city: 'Kautokeino',
    municipalityNumber: '5612',
    street: 'Gáhkkorluodda',
    number: 37,
    expectedPostcode: '9520',
    year: 2024,
    period: 'Samisk nasjonalteater, språk, turné i Sápmi og nytt fellesbygg',
    desc: 'Det samiske nasjonalteatret Beaivváš sitt nye hjem i Čoarvemátta i Kautokeino, åpnet i 2024.',
    popupDesc: 'Beaivváš ble etablert som fri teatergruppe i 1981 og fikk status som nasjonal teaterinstitusjon i 1993. Teatret bruker samisk som scenespråk og turnerer gjennom Sápmi og Norden. I 2024 flyttet Beaivváš inn i Čoarvemátta, et nytt bygg som deles med Samisk videregående skole og reindriftsskole. Byggets form og materialbruk henter inspirasjon fra samisk kultur, reindrift og landskapet på Finnmarksvidda. Stedet gjør språk, urfolksperspektiv, utdanning og scenekunst til deler av samme nasjonale kulturinfrastruktur.',
    tags: ['nasjonalteater', 'samisk', 'sapmi', 'kautokeino', 'coarvematta', 'turneteater'],
    physicalScope: 'Beaivváš sin teaterfløy, scene og publikumsfunksjoner i Čoarvemátta, Gáhkkorluodda 37. Skolens øvrige funksjoner og turnéspillesteder inngår ikke i samme markør.',
    quiz_profile: {
      place_type: 'samisk_nasjonalteater_i_felles_kultur_og_utdanningsbygg',
      subtype: 'samisk_scenesprak_turne_og_nasjonal_kulturinfrastruktur',
      signature_features: ['etablert i 1981 og nasjonal institusjon fra 1993', 'samisk som scenespråk og turné i Sápmi', 'nytt hjem i Čoarvemátta fra 2024'],
      primary_angles: ['samisk_sprak', 'nasjonalteater', 'urfolk', 'arkitektur'],
      question_families: ['historisk_endring', 'scenesprak', 'kulturgeografi', 'samlokalisering'],
      avoid_angles: ['framstille_bygget_som_bare_teater', 'redusere_samisk_teater_til_folklore'],
      must_include: ['nasjonal status og samisk scenespråk', 'samlokaliseringen med skole og reindriftsutdanning'],
      contrast_targets: ['den_nationale_scene', 'halogaland_teater'],
      notes: 'Markøren gjelder Beaivváš-funksjonen i Čoarvemátta, ikke hele skole- og teaterkomplekset.'
    },
    knowledge: {
      one_liner: 'Beaivváš bruker samisk scenespråk og turné til å binde Sápmi sammen fra et nytt nasjonalt teaterhus i Kautokeino.',
      why_it_matters: ['Teatret er en nasjonal institusjon for samisk scene- og fortellerkunst.', 'Čoarvemátta samler teater, skole og reindriftsutdanning i en arkitektur utviklet med samisk kultur som premiss.'],
      what_to_notice: ['Bygningsformen inspirert av den sterke roten i et reinsdyrhorn.', 'Den felles vestibylen og delte arealene mellom teater og skole.', 'Forholdet mellom den faste scenen i Kautokeino og turné gjennom Sápmi.'],
      terms: ['samisk_scenesprak', 'nasjonalteater', 'sapmi', 'coarvematta'],
      sources: ['https://www.statsbygg.no/eiendom/samisk-nasjonalteater-og-skole/', 'https://sceneweb.no/nb/organisation/6934/Beaivv%C3%A1%C5%A1_S%C3%A1mi%20Na%C5%A1un%C3%A1late%C3%A1hter', 'https://virksomhet.brreg.no/nb/oppslag/enheter/944264957']
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
function normalize(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
function haversineMeters(a, b) {
  const rad = (value) => value * Math.PI / 180;
  const earth = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
}
async function exactAddress(venue) {
  const query = `${venue.street} ${venue.number} ${venue.city}`;
  const sourceUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(query)}&treffPerSide=100`;
  const response = await fetch(sourceUrl, { headers: { 'user-agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`${venue.id}: Geonorge HTTP ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload.adresser) ? payload.adresser : [];
  const exact = rows.filter((row) =>
    String(row.kommunenummer) === venue.municipalityNumber &&
    normalize(row.adressenavn) === normalize(venue.street) &&
    Number(row.nummer) === Number(venue.number) &&
    !String(row.bokstav ?? '').trim()
  );
  if (exact.length !== 1) throw new Error(`${venue.id}: expected one exact Geonorge address, found ${exact.length}`);
  const hit = exact[0];
  if (venue.expectedPostcode && String(hit.postnummer) !== venue.expectedPostcode) {
    throw new Error(`${venue.id}: expected postcode ${venue.expectedPostcode}, got ${hit.postnummer}`);
  }
  const point = hit.representasjonspunkt;
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) throw new Error(`${venue.id}: invalid representation point`);
  const suffix = `${hit.nummer}${String(hit.bokstav ?? '').trim()}`;
  return {
    query,
    sourceUrl,
    sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${suffix}`,
    lat: point.lat,
    lon: point.lon,
    address: {
      street: hit.adressenavn,
      number: String(hit.nummer),
      postcode: String(hit.postnummer),
      city: venue.city,
      country: 'NO'
    }
  };
}
function buildPlace(venue, coordinate, overlaps) {
  return {
    id: venue.id,
    name: venue.name,
    aliases: venue.aliases,
    visual: { designCode: 'theatre_miniature' },
    lat: coordinate.lat,
    lon: coordinate.lon,
    r: 80,
    category: 'scenekunst',
    fylke: venue.fylke,
    kommune: venue.kommune,
    year: venue.year,
    period: venue.period,
    desc: venue.desc,
    popupDesc: venue.popupDesc,
    tags: venue.tags,
    emne_ids: COMMON_EMNER,
    physicalScope: venue.physicalScope,
    quiz_profile: venue.quiz_profile,
    knowledge: venue.knowledge,
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl,
    coordVerifiedAt: VERIFIED_DATE,
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${coordinate.address.street} ${coordinate.address.number}, ${venue.city}. Punktet representerer den fysisk avgrensede teaterfunksjonen og brukes som display-marker.`,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: coordinate.sourceObjectId,
    address: coordinate.address,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coLocationAudit: {
      status: 'reviewed',
      nearbyCanonicalIds: overlaps.map((row) => row.id),
      intentionalSharedAnchor: false,
      note: 'Ingen eksisterende canonical place-record deler det eksakte adressepunktet.'
    }
  };
}

const manifest = readJson(MANIFEST_PATH);
const globalIndex = readJson(GLOBAL_INDEX_PATH);
if (!Array.isArray(manifest.files) || !Array.isArray(globalIndex)) throw new Error('Unexpected manifest or global index shape');
const ids = new Set(VENUES.map((venue) => venue.id));
if (ids.size !== VENUES.length) throw new Error('Duplicate new venue IDs');
for (const venue of VENUES) {
  if (globalIndex.some((row) => row.id === venue.id)) throw new Error(`${venue.id}: canonical place already exists`);
  if (manifest.files.includes(venue.sourceFile)) throw new Error(`${venue.sourceFile}: source already registered`);
  if (fs.existsSync(abs(`data/${venue.sourceFile}`))) throw new Error(`${venue.sourceFile}: target file already exists`);
}

const places = [];
const coordinateResults = [];
for (const venue of VENUES) {
  const coordinate = await exactAddress(venue);
  const overlaps = globalIndex
    .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon))
    .map((row) => ({ ...row, distanceMeters: haversineMeters(coordinate, row) }))
    .filter((row) => row.distanceMeters <= 2)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
  if (overlaps.length) throw new Error(`${venue.id}: unexpected canonical overlap with ${overlaps.map((row) => row.id).join(', ')}`);
  const place = buildPlace(venue, coordinate, overlaps);
  writeJson(`data/${venue.sourceFile}`, [place]);
  manifest.files.push(venue.sourceFile);
  places.push(place);
  coordinateResults.push({
    id: venue.id,
    query: coordinate.query,
    sourceUrl: coordinate.sourceUrl,
    sourceObjectId: coordinate.sourceObjectId,
    coordinate: { lat: coordinate.lat, lon: coordinate.lon },
    address: coordinate.address,
    exactOverlapIds: [],
    overlapDecision: 'no_overlap'
  });
}
writeJson(MANIFEST_PATH, manifest);
writeJson(REPORT_JSON, {
  generatedAt: NOW,
  status: 'built_pending_validation',
  category: 'scenekunst',
  batch: 'national_new_venues_2',
  dependsOn: 'agent/scenekunst-national-venues-01 / PR #3205',
  addedPlaceIds: places.map((place) => place.id),
  sourceFiles: VENUES.map((venue) => venue.sourceFile),
  officialInstitutionSources: Object.fromEntries(VENUES.map((venue) => [venue.id, venue.knowledge.sources])),
  coordinateResults,
  physicalScopeDecisions: Object.fromEntries(VENUES.map((venue) => [venue.id, venue.physicalScope])),
  validation: {
    geonorgeExactAddressLookup: 'pass',
    overlapAudit: 'pass',
    placesIndexBuild: 'pending_workflow',
    placesChecks: 'pending_workflow',
    categoryAudit: 'pending_workflow'
  }
});
const md = [
  '# Scenekunst – nye nasjonale steder, batch 2', '',
  `Generert: ${NOW}`, '',
  '## Nye steder', '',
  ...places.map((place) => `- \`${place.id}\` – ${place.name}`), '',
  '## Koordinater', '',
  ...coordinateResults.flatMap((row) => [
    `### \`${row.id}\``, '',
    `- Adresse: ${row.address.street} ${row.address.number}, ${row.address.postcode} ${row.address.city}`,
    `- Geonorge-objekt: \`${row.sourceObjectId}\``,
    `- Punkt: ${row.coordinate.lat}, ${row.coordinate.lon}`,
    '- Overlap: no_overlap', ''
  ]),
  '## Fysisk scope', '',
  ...VENUES.map((venue) => `- \`${venue.id}\`: ${venue.physicalScope}`), ''
];
fs.writeFileSync(abs(REPORT_MD), md.join('\n'), 'utf8');
console.log(`Added ${places.length} national Scenekunst venues:`);
for (const place of places) console.log(`- ${place.id}: ${place.lat}, ${place.lon}`);
