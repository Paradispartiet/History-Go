#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_DATE = '2026-07-23';
const NOW = new Date().toISOString();
const AGGREGATE_PATH = 'data/places/scenekunst/oslo/places_scenekunst.json';
const SPLIT_DIR = 'data/places/scenekunst/oslo/places_scenekunst';
const SPLIT_INDEX_PATH = 'data/places/scenekunst/oslo/places_scenekunst_index.json';
const SPLIT_MANIFEST_PATH = 'data/places/scenekunst/oslo/places_scenekunst_manifest.json';
const GLOBAL_INDEX_PATH = 'data/places/places_index.json';
const REPORT_JSON = 'reports/scenekunst-oslo-split-venues-batch-1-2026-07-23.json';
const REPORT_MD = 'reports/scenekunst-oslo-split-venues-batch-1-2026-07-23.md';

const VENUES = [
  {
    id: 'teater_manu',
    name: 'Teater Manu',
    aliases: ['Teater Manu – det nasjonale tegnspråkteatret', 'Norsk tegnspråkteater'],
    street: 'Christies gate',
    number: 5,
    expectedPostcode: '0557',
    year: 2004,
    period: 'Nasjonalt tegnspråkteater, døvekultur og visuelt scenespråk',
    desc: 'Norges nasjonale tegnspråkteater med fast scene på Grünerløkka og turnévirksomhet i hele landet.',
    popupDesc: 'Teater Manu springer ut av arbeidet for et profesjonelt norsk tegnspråkteater og ble etablert som varig nasjonal institusjon tidlig på 2000-tallet. Teatret bruker norsk tegnspråk som kunstnerisk scenespråk og skaper forestillinger på døves premisser, samtidig som produksjonene gjøres tilgjengelige for et bredt publikum. Stedspakken forankres i publikumsinngangen og scenen i Christies gate 5. Post- og institusjonsadressen Schleppegrells gate 32 hører til samme teaterlokale, men får ikke en separat markør.',
    tags: ['tegnsprak', 'dovekultur', 'nasjonalteater', 'visuelt_teater', 'turneteater', 'grunerlokka'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar', 'em_scenekunst_skuespill_rollefortolkning', 'em_scenekunst_dramaturgi_iscenesettelse'],
    physicalScope: 'Teater Manus scene- og publikumsfunksjoner med besøksinngang i Christies gate 5. Postadressen Schleppegrells gate 32 gjelder samme teaterlokale; turnéspillesteder inngår ikke.',
    quiz_profile: {
      place_type: 'nasjonalt_tegnsprakteater',
      subtype: 'fast_scene_og_turnerende_minoritetsspraklig_teater',
      signature_features: ['norsk tegnspråk som kunstnerisk hovedspråk', 'nasjonal institusjon med fast scene og turné', 'røtter i døvekultur og språklige rettigheter'],
      primary_angles: ['tegnsprak', 'scenesprak', 'institusjon', 'tilgjengelighet'],
      question_families: ['institusjon', 'saertrekk', 'sprak_og_form', 'publikum'],
      avoid_angles: ['framstille_tegnsprak_som_bare_oversettelse', 'blande_turnesteder_med_hovedscenen'],
      must_include: ['tegnspråk som selvstendig kunstnerisk språk', 'rollen som nasjonalt teater for tegnspråklig publikum'],
      contrast_targets: ['det_norske_teatret', 'nationaltheatret'],
      notes: 'Spør om visuelt scenespråk, døvekultur og nasjonal teaterinstitusjon – ikke bare universell utforming.'
    },
    knowledge: {
      one_liner: 'Teater Manu gjør norsk tegnspråk til bærende kunstnerisk språk på en profesjonell nasjonal scene.',
      why_it_matters: ['Teatret gir tegnspråklig publikum scenekunst på eget språk og egne kulturelle premisser.', 'Institusjonen viser hvordan språk, kropp, rom og visuell dramaturgi kan forme teater på andre måter enn talespråklig teater.'],
      what_to_notice: ['Hvordan tegn, mimikk, kropp og scenografi virker sammen.', 'At forestillingene er laget med tegnspråk som originalt scenespråk.', 'Forholdet mellom den faste scenen i Oslo og turnévirksomheten.'],
      terms: ['norsk_tegnsprak', 'visuell_dramaturgi', 'dovekultur', 'minoritetssprak'],
      sources: ['https://teatermanu.no/om-teater-manu', 'https://teatermanu.no/']
    }
  },
  {
    id: 'vega_scene',
    name: 'Vega Scene',
    aliases: ['Vega teater', 'Vega kino og teater'],
    street: 'Hausmanns gate',
    number: 28,
    expectedPostcode: '0182',
    year: 2018,
    period: 'Ny nordisk dramatikk, kvalitetsfilm og offentlig samtale',
    desc: 'Hybrid kino- og teaterhus i Hausmanns gate med ny nordisk dramatikk, kvalitetsfilm, debatt og unge publikumsgrupper.',
    popupDesc: 'Vega Scene ble etablert som idé i 2013 og åpnet huset i Hausmanns gate 28 for publikum i 2018. Stedet kombinerer teatersal, kinosaler og Salongen som arena for debatt, samtale og mindre sceniske formater. Teaterprofilen løfter særlig ny og aktuell nordisk dramatikk, mens filmprogrammet gjør huset til en bevisst hybrid mellom scenekunst og popkulturell filmformidling.',
    secondaryBadgeIds: ['popkultur'],
    tags: ['ny_dramatikk', 'nordisk_teater', 'kvalitetsfilm', 'debatt', 'hybridhus', 'hausmania_kvartalet'],
    emne_ids: ['em_scenekunst_dramaturgi_iscenesettelse', 'em_scenekunst_teaterinstitusjon_repertoar', 'em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Vega Scenes teatersal, kinosaler, Salongen og publikumsarealer i Hausmanns gate 28. Nærliggende kulturaktører i Hausmannskvartalet inngår ikke.',
    quiz_profile: {
      place_type: 'hybrid_teater_og_kino',
      subtype: 'storbyteater_for_ny_nordisk_dramatikk_og_kvalitetsfilm',
      signature_features: ['åpnet i Hausmanns gate i 2018', 'kombinerer teater, kino og debatt', 'profil for ny aktuell nordisk dramatikk'],
      primary_angles: ['ny_dramatikk', 'hybridarena', 'publikum', 'samtidskultur'],
      question_families: ['formaal', 'institusjon', 'mediekontrast', 'publikumsrolle'],
      avoid_angles: ['redusere_stedet_til_bare_kino', 'framstille_alle_arrangementer_som_egenproduksjoner'],
      must_include: ['kombinasjonen av film og scenekunst', 'profilen for ny nordisk dramatikk'],
      contrast_targets: ['black_box_teater', 'folketeateret'],
      notes: 'Primær Scenekunst-record med popkultur som sekundær kobling på grunn av den integrerte kinodriften.'
    },
    knowledge: {
      one_liner: 'Vega Scene lar ny dramatikk, kvalitetsfilm og offentlig samtale dele samme storbyhus.',
      why_it_matters: ['Huset viser hvordan kino og teater kan kurateres som én samlet samtidsarena.', 'Teaterprogrammet gir plass til ny nordisk dramatikk og unge publikumsgrupper.'],
      what_to_notice: ['Forskjellen mellom teatersalen, kinosalene og Salongen.', 'Hvordan film og scenekunst settes inn i samtaler og debatter.', 'At huset både produserer, samproduserer og tar imot gjestespill.'],
      terms: ['ny_dramatikk', 'hybridarena', 'kuratering', 'storbyteater'],
      sources: ['https://www.vegascene.no/nyheter/om-vega-scene', 'https://www.vegascene.no/teater']
    }
  },
  {
    id: 'rommen_scene',
    name: 'Rommen Scene',
    aliases: ['Rommen kulturhus', 'Rommen Scene Oslo'],
    street: 'Karen Platous vei',
    number: 31,
    expectedPostcode: '0988',
    period: 'Profesjonell bydelscene, lokal deltakelse og flerkulturelt kulturliv',
    desc: 'Profesjonell kommunal scene på Rommen med teater, dans, musikk og lokale kulturproduksjoner for Groruddalen.',
    popupDesc: 'Rommen Scene drives av Oslo kommune og ligger i samme bygningskompleks som Rommen skole. Scenen har profesjonelt teknisk utstyr, amfi med rundt 200 sitteplasser og ståkapasitet for større arrangementer. Programmet spenner fra profesjonelle gjestespill og familieforestillinger til lokale danse-, musikk- og kulturprosjekter. Stedet viser hvordan en bydelscene kan koble profesjonell scenekunst til deltakelse, representasjon og kulturarbeid i Groruddalen.',
    secondaryBadgeIds: ['musikk', 'by'],
    tags: ['bydelsscene', 'groruddalen', 'deltakelse', 'flerkulturell', 'familieteater', 'kommunal_kulturarena'],
    emne_ids: ['em_scenekunst_publikum_fjerde_vegg', 'em_scenekunst_teaterinstitusjon_repertoar', 'em_scenekunst_dans_koreografi'],
    physicalScope: 'Rommen Scenes profesjonelle scene, dansesal og publikumsfunksjoner i Karen Platous vei 31. Rommen skole og flerbrukshallen behandles som andre funksjoner i samme kompleks.',
    quiz_profile: {
      place_type: 'kommunal_bydelsscene',
      subtype: 'profesjonell_scene_med_lokal_deltakelse_og_utleie',
      signature_features: ['profesjonell scene i Groruddalen', 'omtrent 200 sitteplasser eller 350 ståplasser', 'kombinerer gjestespill med lokal kulturproduksjon'],
      primary_angles: ['bydel', 'publikum', 'deltakelse', 'kulturgeografi'],
      question_families: ['formaal', 'publikumsrolle', 'kulturgeografi', 'sceneformat'],
      avoid_angles: ['forveksle_scenen_med_hele_rommen_skole', 'bare_beskrive_stedet_som_utleielokale'],
      must_include: ['rollen som profesjonell scene i Groruddalen', 'koblingen mellom profesjonelle produksjoner og lokale aktører'],
      contrast_targets: ['vega_scene', 'det_norske_teatret'],
      notes: 'Spør som bydels- og deltakelsesarena med profesjonell sceneteknikk.'
    },
    knowledge: {
      one_liner: 'Rommen Scene gjør profesjonell scenekunst og lokal kulturproduksjon tilgjengelig i Groruddalen.',
      why_it_matters: ['Scenen desentraliserer profesjonelle kulturtilbud i Oslo.', 'Program og utleie gir lokale organisasjoner og unge utøvere tilgang til en profesjonell arena.'],
      what_to_notice: ['Amfiet og den fleksible stå-/sittekapasiteten.', 'Samlokaliseringen med skole og lokale kulturfunksjoner.', 'Bredden mellom teater, dans, musikk og samfunnsarrangementer.'],
      terms: ['bydelsscene', 'kulturdeltakelse', 'gjestespill', 'lokal_kulturproduksjon'],
      sources: ['https://rommenscene.no/', 'https://rommenscene.no/kontakt', 'https://rommenscene.no/omscenen']
    }
  },
  {
    id: 'salt_oslo',
    name: 'SALT',
    aliases: ['SALT art & music', 'SALT Langkaia'],
    street: 'Langkaia',
    number: 1,
    expectedPostcode: '0150',
    year: 2016,
    period: 'Midlertidig arkitektur, tverrkunstnerisk scene, standup og havneby',
    desc: 'Tverrkunstnerisk kulturarena på Langkaia med scener, konserter, standup, debatt, servering og badstuekultur.',
    popupDesc: 'SALT startet som et kunstprosjekt på Sandhornøy i 2014 og flyttet til Oslo i 2016. Arenaen bruker fiskehjell-inspirerte trekonstruksjoner som ramme for konserter, standup, teater, debatt, mat og badstuekultur. Stedet er ikke et tradisjonelt permanent teaterbygg, men en modulær og foranderlig kulturarena. Scenekunst-recorden forankres i SALTs scene- og publikumsområde på Langkaia, med musikk og bykultur som sekundære fagkoblinger.',
    secondaryBadgeIds: ['musikk', 'by'],
    tags: ['tverrkunstnerisk', 'standup', 'konsert', 'midlertidig_arkitektur', 'havnepromenade', 'fiskehjell'],
    emne_ids: ['em_scenekunst_revy_standup_impro', 'em_scenekunst_regi_scenografi', 'em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'SALT-områdets scener, publikumsarealer og modulære kulturkonstruksjoner ved Langkaia 1. Den øvrige havnepromenaden og nabofunksjoner inngår ikke.',
    lifecycle: {
      status: 'active_modular_cultural_site',
      reviewRule: 'Koordinat og fysisk scope skal kontrolleres dersom SALT flytter eller Langkaia-området bygges om.'
    },
    quiz_profile: {
      place_type: 'tverrkunstnerisk_modulaer_kulturarena',
      subtype: 'scene_og_kulturprosjekt_inspirert_av_fiskehjell',
      signature_features: ['kunstprosjekt startet på Sandhornøy i 2014', 'flyttet til Oslo i 2016', 'kombinerer scenekunst, musikk, debatt og badstuekultur'],
      primary_angles: ['scenografi', 'midlertidighet', 'standup', 'byrom'],
      question_families: ['formaal', 'arkitektur_og_scene', 'publikum', 'kulturgeografi'],
      avoid_angles: ['redusere_salt_til_bare_badstue', 'framstille_konstruksjonene_som_permanent_teaterbygg'],
      must_include: ['fiskehjellen som arkitektonisk idé', 'arenaens tverrkunstneriske og modulære karakter'],
      contrast_targets: ['latter', 'vega_scene'],
      notes: 'Primær Scenekunst-record med musikk og by som sekundære koblinger.'
    },
    knowledge: {
      one_liner: 'SALT gjør fiskehjell-inspirert, flyttbar arkitektur til ramme for scenekunst og byliv ved fjorden.',
      why_it_matters: ['Arenaen utfordrer skillet mellom teaterbygg, festivalområde og offentlig byrom.', 'Programmet kobler standup og scenekunst til konserter, debatt, mat og badstuekultur.'],
      what_to_notice: ['De modulære trekonstruksjonene.', 'Hvordan publikum beveger seg mellom ulike scener og sosiale soner.', 'Sammenhengen mellom kystkultur, midlertidighet og moderne kulturproduksjon.'],
      terms: ['midlertidig_arkitektur', 'tverrkunstnerisk', 'fiskehjell', 'kulturarena'],
      sources: ['https://www.salted.no/about/', 'https://www.salted.no/kontakt', 'https://www.salted.no/hovedscenen']
    }
  },
  {
    id: 'det_andre_teatret_intimscenen',
    name: 'Det Andre Teatret – Intimscenen',
    aliases: ['DAT Intimscenen', 'Intimscenen på Det Andre Teatret'],
    street: 'Ivan Bjørndals gate',
    number: 28,
    expectedPostcode: '0472',
    year: 2015,
    period: 'Intim improvisasjonsscene, barnesatsing og nær publikumsdialog',
    desc: 'Det Andre Teatrets mindre scene i Ivan Bjørndals gate 28, utviklet for intime improformater, soloforestillinger og barnesatsing.',
    popupDesc: 'Det Andre Teatret fikk i 2015 støtte til å bygge tribune og teknisk rigg i et prøvelokale som skulle bli intimscene. I dag brukes Intimscenen aktivt til improviserte enaktere, soloforestillinger, mindre gjestespill og produksjoner for barn og unge. Stedet ligger i Ivan Bjørndals gate 28 og er fysisk adskilt fra hovedscenen og teaterbaren i nummer 9, som allerede har sin egen canonical record.',
    tags: ['improvisasjon', 'intimscene', 'soloforestilling', 'barneteater', 'publikumsnaerhet', 'lilleborg'],
    emne_ids: ['em_scenekunst_revy_standup_impro', 'em_scenekunst_publikum_fjerde_vegg', 'em_scenekunst_skuespill_rollefortolkning'],
    physicalScope: 'Det Andre Teatrets Intimscene i Ivan Bjørndals gate 28. Hovedscene, bar og uteservering i nummer 9 inngår ikke i denne markøren.',
    quiz_profile: {
      place_type: 'intim_improvisasjonsscene',
      subtype: 'liten_scene_for_impro_soloforestilling_og_barn',
      signature_features: ['egen adresse adskilt fra hovedscenen', 'bygget ut som intimscene fra 2015', 'nær kontakt mellom utøvere og publikum'],
      primary_angles: ['intimitet', 'improvisasjon', 'publikum', 'sceneformat'],
      question_families: ['sceneformat', 'publikumsrolle', 'kontrast', 'formaal'],
      avoid_angles: ['forveksle_med_hovedscenen_i_nummer_9', 'framstille_som_uavhengig_teaterinstitusjon'],
      must_include: ['den fysiske adskillelsen fra hovedscenen', 'hvordan den lille salen påvirker improvisasjon og publikumsdialog'],
      contrast_targets: ['det_andre_teatret', 'black_box_teater'],
      notes: 'Spør som en separat fysisk scene innen samme institusjon.'
    },
    knowledge: {
      one_liner: 'Intimscenen gir Det Andre Teatret et mindre rom der improvisasjon og publikumsnærhet kan drives lenger.',
      why_it_matters: ['Den separate scenen utvider institusjonens formater uten å gjøre hovedscenen mindre fleksibel.', 'Små publikumsrom endrer timing, energi og relasjon mellom utøver og sal.'],
      what_to_notice: ['Kort avstand mellom scene og publikum.', 'At stedet har en annen adresse enn hovedscenen.', 'Bruken til mindre improformater, soloarbeid og barnesatsing.'],
      terms: ['intimscene', 'improvisasjon', 'publikumsnaerhet', 'sceneformat'],
      sources: ['https://detandreteatret.no/kontakt', 'https://detandreteatret.no/program?kategori=4483', 'https://sparebankstiftelsen.no/tildelinger/det-andre-teatret/']
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
function sha256Text(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function fileSha256(rel) { return sha256Text(fs.readFileSync(abs(rel), 'utf8')); }
function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
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
  const query = `${venue.street} ${venue.number} Oslo`;
  const sourceUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(query)}&treffPerSide=100`;
  const response = await fetch(sourceUrl, { headers: { 'user-agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`${venue.id}: Geonorge HTTP ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload.adresser) ? payload.adresser : [];
  const exact = rows.filter((row) =>
    String(row.kommunenummer) === '0301' &&
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
  return {
    query,
    sourceUrl,
    sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}`,
    lat: point.lat,
    lon: point.lon,
    address: { street: hit.adressenavn, number: String(hit.nummer), postcode: String(hit.postnummer), city: 'Oslo', country: 'NO' }
  };
}
function buildPlace(venue, coordinate, nearby) {
  const place = {
    id: venue.id,
    name: venue.name,
    aliases: venue.aliases,
    visual: { designCode: 'theatre_miniature' },
    lat: coordinate.lat,
    lon: coordinate.lon,
    r: 60,
    category: 'scenekunst',
    ...(venue.secondaryBadgeIds ? { secondaryBadgeIds: venue.secondaryBadgeIds } : {}),
    ...(venue.year ? { year: venue.year } : {}),
    period: venue.period,
    desc: venue.desc,
    popupDesc: venue.popupDesc,
    tags: venue.tags,
    emne_ids: venue.emne_ids,
    physicalScope: venue.physicalScope,
    ...(venue.lifecycle ? { lifecycle: venue.lifecycle } : {}),
    quiz_profile: venue.quiz_profile,
    knowledge: venue.knowledge,
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl,
    coordVerifiedAt: VERIFIED_DATE,
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${coordinate.address.street} ${coordinate.address.number}, OSLO. Punktet representerer den fysisk avgrensede scenekunstfunksjonen og brukes som display-marker.`,
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
  return place;
}
function indexEntry(place) {
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    ...(place.year ? { year: place.year } : {}),
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
    file: `places_scenekunst/${place.id}.json`,
    address: place.address
  };
}

const aggregate = readJson(AGGREGATE_PATH);
const globalIndex = readJson(GLOBAL_INDEX_PATH);
if (!Array.isArray(aggregate) || !Array.isArray(globalIndex)) throw new Error('Unexpected aggregate or global index shape');
const existingIds = new Set(aggregate.map((row) => row.id));
for (const venue of VENUES) {
  if (existingIds.has(venue.id) || globalIndex.some((row) => row.id === venue.id)) throw new Error(`${venue.id}: canonical place already exists`);
}

const places = [];
const coordinateResults = [];
for (const venue of VENUES) {
  const coordinate = await exactAddress(venue);
  const nearby = globalIndex
    .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon))
    .map((row) => ({ ...row, distanceMeters: haversineMeters(coordinate, row) }))
    .filter((row) => row.distanceMeters <= 2)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
  if (nearby.length) throw new Error(`${venue.id}: unexpected canonical overlap with ${nearby.map((row) => row.id).join(', ')}`);
  const place = buildPlace(venue, coordinate, nearby);
  aggregate.push(place);
  writeJson(`${SPLIT_DIR}/${place.id}.json`, place);
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

writeJson(AGGREGATE_PATH, aggregate);
writeJson(SPLIT_INDEX_PATH, aggregate.map(indexEntry));
const manifest = {
  version: 'places_scenekunst_split_v1',
  source_file: 'places_scenekunst.json',
  source_path: AGGREGATE_PATH,
  source_sha256: fileSha256(AGGREGATE_PATH),
  generated_at: NOW,
  place_count: aggregate.length,
  layout: {
    place_files_dir: 'places_scenekunst/',
    one_file_per_place: true,
    filename_rule: '<place.id>.json',
    manifest_preserves_original_order: true,
    original_aggregate_left_unchanged: false
  },
  places: aggregate.map((place, order) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    file: `places_scenekunst/${place.id}.json`,
    order,
    sha256: fileSha256(`${SPLIT_DIR}/${place.id}.json`)
  }))
};
writeJson(SPLIT_MANIFEST_PATH, manifest);

writeJson(REPORT_JSON, {
  generatedAt: NOW,
  status: 'built_pending_validation',
  category: 'scenekunst',
  batch: 'oslo_split_venues_1',
  dependsOn: 'agent/scenekunst-national-venues-03-rebased / PR #3336',
  addedPlaceIds: places.map((place) => place.id),
  officialInstitutionSources: Object.fromEntries(VENUES.map((venue) => [venue.id, venue.knowledge.sources])),
  coordinateResults,
  physicalScopeDecisions: Object.fromEntries(VENUES.map((venue) => [venue.id, venue.physicalScope])),
  hybridCategoryDecisions: {
    vega_scene: ['scenekunst', 'popkultur'],
    salt_oslo: ['scenekunst', 'musikk', 'by'],
    rommen_scene: ['scenekunst', 'musikk', 'by']
  },
  validation: {
    geonorgeExactAddressLookup: 'pass',
    overlapAudit: 'pass',
    splitAggregateBuild: 'pass',
    splitManifestBuild: 'pass',
    splitIndexBuild: 'pass',
    placesIndexBuild: 'pending_workflow',
    placesChecks: 'pending_workflow',
    categoryAudit: 'pending_workflow'
  }
});
const md = [
  '# Scenekunst – Oslo splitsteder, batch 1', '',
  `Generert: ${NOW}`, '',
  '## Nye steder', '',
  ...places.map((place) => `- \`${place.id}\` – ${place.name}`), '',
  '## Koordinater', '',
  ...coordinateResults.flatMap((row) => [
    `### \`${row.id}\``, '',
    `- Adresse: ${row.address.street} ${row.address.number}, ${row.address.postcode} Oslo`,
    `- Geonorge-objekt: \`${row.sourceObjectId}\``,
    `- Punkt: ${row.coordinate.lat}, ${row.coordinate.lon}`,
    '- Overlap: no_overlap', ''
  ]),
  '## Fysisk scope', '',
  ...VENUES.map((venue) => `- \`${venue.id}\`: ${venue.physicalScope}`), '',
  '## Hybridvalg', '',
  '- Vega Scene er primært Scenekunst med Popkultur som sekundær kobling.',
  '- SALT er primært Scenekunst med Musikk og By som sekundære koblinger.',
  '- Rommen Scene er primært Scenekunst med Musikk og By som sekundære koblinger.', ''
];
fs.writeFileSync(abs(REPORT_MD), md.join('\n'), 'utf8');
console.log(`Added ${places.length} Oslo Scenekunst split venues:`);
for (const place of places) console.log(`- ${place.id}: ${place.lat}, ${place.lon}`);
