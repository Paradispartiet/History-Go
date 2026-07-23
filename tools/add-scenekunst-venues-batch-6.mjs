#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_DATE = '2026-07-23';
const NOW = new Date().toISOString();
const MANIFEST_PATH = 'data/places/manifest.json';
const GLOBAL_INDEX_PATH = 'data/places/places_index.json';
const REPORT_JSON = 'reports/scenekunst-new-venues-batch-6-2026-07-23.json';
const REPORT_MD = 'reports/scenekunst-new-venues-batch-6-2026-07-23.md';

const VENUES = [
  {
    id: 'sandvika_teater',
    name: 'Sandvika Teater',
    aliases: ['Gamle Sandvika kino'],
    sourceFile: 'places/scenekunst/akershus/sandvika_teater.json',
    fylke: 'akershus', kommune: 'Bærum', city: 'Sandvika', municipalityNumber: '3201',
    street: 'Kinoveien', number: 2, expectedLetter: '', expectedPostcode: '1337',
    year: 1959,
    period: 'Kinoarkitektur ombygd til lokal teater- og dansescene',
    desc: 'Tidligere Sandvika kino, nå en intim teaterscene for lokale teater-, musikal- og danseproduksjoner.',
    popupDesc: 'Sandvika Teater ble bygget som kino i 1959 og er senere tilrettelagt for teater, musikal og dans. Salen har en bred scene og et intimt publikumsrom med 287 plasser i parkett. Scenen drives av Bærum Kulturhus, men ligger fysisk separat fra hovedbygget i Claude Monets allé. Teateret inngår i et omfattende rehabiliteringsprogram i 2026 og 2027, og tilgjengeligheten må derfor forstås som en overgangssituasjon.',
    tags: ['lokalteater','musikal','dans','tidligere_kino','sandvika','rehabilitering'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_regi_scenografi','em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Sandvika Teaters sal, scene, foajé og publikumsfunksjoner i Kinoveien 2. Bærum Kulturhus sitt hovedbygg og Lille Scene ligger på andre adresser og inngår ikke.',
    lifecycle: {
      status: 'under_rehabilitation_program',
      period: '2026-2027',
      note: 'Scenen totalrehabiliteres i 2026 og 2027. Stedspakken representerer den varige teaterbygningen; programtilgjengelighet må kontrolleres løpende.'
    },
    quiz_profile: {
      place_type: 'lokal_teater_og_dansescene',
      subtype: 'tidligere_kino_tilpasset_teater',
      signature_features: ['bygget som kino i 1959','287 plasser i parkett','bred og intim scene for lokale produksjoner'],
      primary_angles: ['bygningsgjenbruk','lokalt_teater','publikumsrom','rehabilitering'],
      question_families: ['historisk_endring','sceneformater','publikum','institusjon'],
      avoid_angles: ['slå_sammen_med_baerum_kulturhus_hovedbygg','framstille_rehabiliteringsperioden_som_normal_drift'],
      must_include: ['overgangen fra kino til teaterscene','den separate fysiske adressen'],
      contrast_targets: ['baerum_kulturhus','lille_scene_sandvika'],
      notes: 'Spør som fysisk separat lokal scene under Bærum Kulturhus-organisasjonen.'
    },
    knowledge: {
      one_liner: 'Sandvika Teater gjør en kino fra 1959 til et intimt hus for lokalt teater, musikal og dans.',
      why_it_matters: ['Scenen gir lokale produksjonsmiljøer et stort, spesialisert publikumsrom.','Bygget viser hvordan eldre kinoarkitektur kan tilpasses scenekunst.'],
      what_to_notice: ['Den brede sceneåpningen og det intime parkettamfiet.','Sporene etter kinoens opprinnelige funksjon.','At teateret er et eget hus, selv om det drives av Bærum Kulturhus.'],
      terms: ['lokalteater','sceneaapning','amfi','bygningsgjenbruk'],
      sources: ['https://www.baerumkulturhus.no/kulturhuset/leie/sandvika-teater/','https://www.baerumkulturhus.no/kulturhuset/leie/']
    }
  },
  {
    id: 'lille_scene_sandvika',
    name: 'Lille Scene',
    aliases: ['Lille Scene Sandvika'],
    sourceFile: 'places/scenekunst/akershus/lille_scene_sandvika.json',
    fylke: 'akershus', kommune: 'Bærum', city: 'Sandvika', municipalityNumber: '3201',
    street: 'Rådmann Halmrasts vei', number: 2, expectedLetter: '', expectedPostcode: '1337',
    year: 2020,
    period: 'Black box, lavterskel scene og lokal produksjonsarena',
    desc: 'Fullverdig black box-scene i Sandvika med 90-seters amfi, prøvemuligheter og fleksibel bruk for profesjonelle og amatørgrupper.',
    popupDesc: 'Lille Scene er en fysisk separat black box under Bærum Kulturhus. Lokalet ble totalrenovert i 2020 og har plassbygget amfi, teknisk grid, foajé, kjøkken og artistgarderober. Scenen brukes som lavterskel tilbud for profesjonelle og amatørgrupper og kan gi lengre prøveperioder enn kulturhusets øvrige scener. Inngangen ligger i bakgården i Rådmann Halmrasts vei 2.',
    tags: ['black_box','lokalteater','amatorteater','profesjonell_scenekunst','sandvika','proevescene'],
    emne_ids: ['em_scenekunst_regi_scenografi','em_scenekunst_dramaturgi_iscenesettelse','em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Lille Scenes black box, amfi, foajé, kjøkken og garderober i Rådmann Halmrasts vei 2. Hovedbygget og Sandvika Teater er andre fysiske steder.',
    quiz_profile: {
      place_type: 'fleksibel_black_box',
      subtype: 'lavterskel_proeve_og_forestillingsted',
      signature_features: ['totalrenovert i 2020','90-seters plassbygget amfi','brukes av både profesjonelle og amatørgrupper'],
      primary_angles: ['black_box','produksjonsprosess','lokalt_kulturliv','publikumsnaerhet'],
      question_families: ['sceneformater','arbeidsprosess','publikum','kontrast'],
      avoid_angles: ['slå_sammen_med_hovedbygget','framstille_som_fast_repertoarteater'],
      must_include: ['black box-formatets fleksibilitet','rollen som lavterskel scene'],
      contrast_targets: ['sandvika_teater','baerum_kulturhus'],
      notes: 'Spør om fleksibilitet, prøvetid og forholdet mellom små sceneformat og publikum.'
    },
    knowledge: {
      one_liner: 'Lille Scene er Sandvikas fleksible black box for prøver, lokale produksjoner og små publikumsformater.',
      why_it_matters: ['Scenen gir både profesjonelle og amatørgrupper tilgang til teknisk scenekunstinfrastruktur.','Det lille amfiet gjør publikumsforholdet annerledes enn i Store Sal og Sandvika Teater.'],
      what_to_notice: ['Det faste tekniske gridet over scenegulvet.','Nærheten mellom det 90-seters amfiet og spilleflaten.','Bakgårdsinngangen og den selvstendige foajéen.'],
      terms: ['black_box','teknisk_grid','proeveperiode','lavterskel_scene'],
      sources: ['https://www.baerumkulturhus.no/kulturhuset/leie/lille-scene/','https://www.baerumkulturhus.no/kulturhuset/leie/']
    }
  },
  {
    id: 'papirhuset_teater',
    name: 'Papirhuset Teater',
    aliases: ['Stiftelsen Papirhuset Teater'],
    sourceFile: 'places/scenekunst/vestfold/papirhuset_teater.json',
    fylke: 'vestfold', kommune: 'Tønsberg', city: 'Tønsberg', municipalityNumber: '3905',
    street: 'St. Olavs gate', number: 16, expectedLetter: 'B', expectedPostcode: '3126',
    year: null,
    period: 'Lokalt teaterhus, produksjonsrom og delt scenekunstinfrastruktur',
    desc: 'Teaterhus i Tønsberg med teatersal, black box og tre prøverom for lokale kompanier, barn, unge og profesjonelle aktører.',
    popupDesc: 'Papirhuset Teater er en stiftelsesdrevet møteplass og produksjonsarena i Tønsberg. Huset rommer en teatersal med amfi, black box og flere prøverom som brukes av lokale teatergrupper, barn og unge, profesjonelle aktører og andre kulturprodusenter. Program og utleie gjør huset til delt infrastruktur snarere enn ett fast kompani. Stedet viser hvordan lokalt scenekunstliv organiseres gjennom felles rom, teknikk og produksjonsmuligheter.',
    tags: ['lokalteater','black_box','barne_og_ungdomsteater','toensberg','proevesaler','delt_infrastruktur'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_skuespill_rollefortolkning','em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Papirhusets teatersal, black box, prøverom og publikumsfunksjoner i St. Olavs gate 16 B. Eksterne sommer- og friluftsscener brukt av husets aktører inngår ikke.',
    quiz_profile: {
      place_type: 'lokalt_teater_og_produksjonshus',
      subtype: 'delt_hus_med_teatersal_black_box_og_proeverom',
      signature_features: ['teatersal med 125–140 plasser','black box for rundt 60 publikummere','tre prøverom og utleie til mange grupper'],
      primary_angles: ['lokalt_kulturliv','delt_infrastruktur','barne_og_ungdomsteater','sceneformater'],
      question_families: ['institusjon','sceneformater','arbeidsprosess','publikum'],
      avoid_angles: ['framstille_huset_som_ett_fast_ensemble','blande_eksterne_friluftsscener_med_papirhuset'],
      must_include: ['forskjellen mellom teatersal og black box','huset som delt produksjonsressurs'],
      contrast_targets: ['drammens_teater','lille_scene_sandvika'],
      notes: 'Spør om infrastrukturen som gjør mange forskjellige lokale produksjoner mulige.'
    },
    knowledge: {
      one_liner: 'Papirhuset Teater samler saler, prøverom og teknikk som mange ulike Tønsberg-miljøer kan produsere scenekunst med.',
      why_it_matters: ['Huset gir lokale grupper tilgang til profesjonell scene- og prøveromsinfrastruktur.','Kombinasjonen av teatersal og black box støtter både store og små produksjoner.'],
      what_to_notice: ['Forskjellen mellom hovedsalens amfi og black boxens fleksibilitet.','At store deler av huset brukes til prøver og produksjon.','Hvordan flere organisasjoner deler samme scenehus.'],
      terms: ['delt_infrastruktur','black_box','proevesal','lokalteater'],
      sources: ['https://www.papirhusetteater.no/','https://www.papirhusetteater.no/kontakt/','https://www.papirhusetteater.no/leie/','https://www.papirhusetteater.no/leie/priser/']
    }
  },
  {
    id: 'rimi_imir_scenekunst',
    name: 'RIMI/IMIR Scenekunst',
    aliases: ['RIMI/IMIR SceneKunst','RISK'],
    sourceFile: 'places/scenekunst/rogaland/rimi_imir_scenekunst.json',
    fylke: 'rogaland', kommune: 'Stavanger', city: 'Stavanger', municipalityNumber: '1103',
    street: 'Badehusgata', number: 25, expectedLetter: '', expectedPostcode: '4014',
    year: 2016,
    period: 'Kunstnerdrevet performance, forskning og tverrkunstnerisk scenekunst',
    desc: 'Kunstnerdrevet plattform og scene i Stavanger for utvikling, produksjon og formidling av performativ og tverrkunstnerisk kunst.',
    popupDesc: 'RIMI/IMIR Scenekunst ble etablert i 2016 som en kunstnerdrevet plattform for scenisk og performativ kunst. Virksomheten kombinerer produksjon, co-produksjon, visning, forskning og møteplassfunksjoner i Badehusgata 25. Programmet beveger seg mellom performance, dans, lyd, installasjon og andre tverrkunstneriske former. Stedet viser hvordan det frie feltet kan organisere sin egen langsiktige infrastruktur uten å ligne et tradisjonelt repertoarteater.',
    tags: ['performance','fri_scenekunst','kunstnerdrevet','forskning','stavanger','tverrkunstnerisk'],
    emne_ids: ['em_scenekunst_dramaturgi_iscenesettelse','em_scenekunst_dans_koreografi','em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'RIMI/IMIRs scene-, produksjons- og publikumsfunksjoner i Badehusgata 25. Samproduksjoner som vises ved andre arenaer inngår ikke som samme fysiske sted.',
    quiz_profile: {
      place_type: 'kunstnerdrevet_scenekunstplattform',
      subtype: 'produksjon_visning_og_forskning_i_performativ_kunst',
      signature_features: ['etablert i 2016','kunstnerdrevet kollektiv ledelse','kombinerer performance, produksjon og forskning'],
      primary_angles: ['performance','fri_scenekunst','kunstnerdrevet_organisering','kunstnerisk_forskning'],
      question_families: ['institusjon','arbeidsprosess','kunstbegrep','kontrast'],
      avoid_angles: ['framstille_som_ordinært_repertoarteater','redusere_programmet_til_en_kunstsjanger'],
      must_include: ['den kunstnerdrevne organiseringen','koblingen mellom produksjon, visning og forskning'],
      contrast_targets: ['tou_stavanger','rosendal_teater'],
      notes: 'Spør om performativ kunst og det frie feltets egne organisasjonsformer.'
    },
    knowledge: {
      one_liner: 'RIMI/IMIR er et kunstnerdrevet laboratorium og visningssted for performance og tverrkunstnerisk scenekunst.',
      why_it_matters: ['Plattformen gir langsiktig produksjonsrom til kunstnere i det frie feltet.','Kombinasjonen av forskning, visning og co-produksjon utfordrer skillet mellom ferdig forestilling og kunstnerisk prosess.'],
      what_to_notice: ['Hvordan rommet endres fra prosjekt til prosjekt.','At publikum kan møte verk i ulike utviklingsstadier.','Den kollektive og kunstnerdrevne organiseringen.'],
      terms: ['performance','kunstnerisk_forskning','co_produksjon','kunstnerdrevet'],
      sources: ['https://www.rimi-imir.no/','https://sceneweb.no/nb/organisation/66958/RIMI%2FIMIR_Scenekunst']
    }
  },
  {
    id: 'fabrikken_kulturscene',
    name: 'Fabrikken Kulturscene',
    aliases: ['Teaterfabrikken','Fabrikken Ålesund'],
    sourceFile: 'places/scenekunst/more_og_romsdal/fabrikken_kulturscene.json',
    fylke: 'more_og_romsdal', kommune: 'Ålesund', city: 'Ålesund', municipalityNumber: '1508',
    street: 'Molovegen', number: 22, expectedLetter: '', expectedPostcode: '6004',
    year: 1996,
    period: 'Revy, show, musikk og kulturarena i tidligere tranfabrikk',
    desc: 'Folkelig kulturscene i en tidligere tranfabrikk ved Molovegen, videreført i 2025 under navnet Fabrikken Kulturscene.',
    popupDesc: 'Arenaen ble etablert som Teaterfabrikken i 1996 etter at Astrid Overaa tok i bruk en forlatt tranfabrikk i Molovegen. Gjennom nær tre tiår ble huset kjent for revy, serveringsteater, visekvelder, konserter, standup og lokale kulturproduksjoner. I 2025 gikk stafettpinnen videre til nye drivere og navnet Fabrikken Kulturscene. Recorden representerer den fysiske kulturarenaen og kontinuiteten i huset, ikke det oppløste aksjeselskapet som tidligere drev Teaterfabrikken.',
    tags: ['revy','standup','musikk','aalesund','industrigjenbruk','serveringsteater'],
    emne_ids: ['em_scenekunst_revy_standup_impro','em_scenekunst_musikal_musikkteater','em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Fabrikken Kulturscenes scene-, serverings- og publikumsfunksjoner i Molovegen 22. Eksterne produksjoner og arrangementer ved andre arenaer inngår ikke.',
    lifecycle: {
      status: 'active_continuation',
      previousName: 'Teaterfabrikken',
      transitionYear: 2025,
      note: 'Den fysiske arenaen og kulturtradisjonen videreføres av nye drivere under navnet Fabrikken Kulturscene.'
    },
    quiz_profile: {
      place_type: 'folkelig_kulturscene_og_serveringsteater',
      subtype: 'tidligere_tranfabrikk_med_revy_musikk_og_show',
      signature_features: ['etablert som Teaterfabrikken i 1996','tidligere tranfabrikk','videreført som Fabrikken Kulturscene i 2025'],
      primary_angles: ['revy','serveringsteater','industrigjenbruk','lokalt_kulturliv'],
      question_families: ['historisk_endring','institusjon','publikum','sjanger'],
      avoid_angles: ['framstille_det_oppløste_as_som_dagens_driver','redusere_huset_til_restaurant'],
      must_include: ['kontinuiteten fra Teaterfabrikken til Fabrikken Kulturscene','den tidligere tranfabrikken som fysisk ramme'],
      contrast_targets: ['teatret_vart_plassen','papirhuset_teater'],
      notes: 'Spør om den fysiske arenaens kontinuitet gjennom et drifts- og navneskifte.'
    },
    knowledge: {
      one_liner: 'Fabrikken Kulturscene viderefører nesten tre tiår med revy, musikk og folkelig sceneliv i en tidligere tranfabrikk.',
      why_it_matters: ['Huset er et eksempel på hvordan industrirom kan få langvarig kulturbruk.','Navneskiftet i 2025 viser at en scene kan videreføres selv om driftsorganisasjonen endres.'],
      what_to_notice: ['Det industrielle preget og nærheten til sjøen.','Sammenhengen mellom scene, servering og sosialt publikumsmiljø.','Sporene etter Teaterfabrikken i den nye driften.'],
      terms: ['revy','serveringsteater','industrigjenbruk','kulturarena'],
      sources: ['https://www.fabrikkenkulturscene.no/','https://www.fabrikkenkulturscene.no/om-fabrikken']
    }
  }
];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, value) { const file = abs(rel); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }
function normalize(value) { return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function haversineMeters(a, b) { const rad = (v) => v * Math.PI / 180; const R = 6371000; const dLat = rad(b.lat-a.lat); const dLon = rad(b.lon-a.lon); const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }

async function exactAddress(venue) {
  const query = `${venue.street} ${venue.number}${venue.expectedLetter ? ` ${venue.expectedLetter}` : ''} ${venue.city}`;
  const sourceUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(query)}&treffPerSide=100`;
  const response = await fetch(sourceUrl, { headers: { 'user-agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`${venue.id}: Geonorge HTTP ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload.adresser) ? payload.adresser : [];
  const expectedLetter = normalize(venue.expectedLetter || '');
  const exact = rows.filter((row) =>
    String(row.kommunenummer) === venue.municipalityNumber &&
    normalize(row.adressenavn) === normalize(venue.street) &&
    Number(row.nummer) === Number(venue.number) &&
    normalize(row.bokstav || '') === expectedLetter
  );
  if (exact.length !== 1) throw new Error(`${venue.id}: expected one exact Geonorge address, found ${exact.length}`);
  const hit = exact[0];
  if (venue.expectedPostcode && String(hit.postnummer) !== venue.expectedPostcode) throw new Error(`${venue.id}: expected postcode ${venue.expectedPostcode}, got ${hit.postnummer}`);
  const point = hit.representasjonspunkt;
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) throw new Error(`${venue.id}: invalid representation point`);
  const suffix = `${hit.nummer}${String(hit.bokstav ?? '').trim()}`;
  return {
    query, sourceUrl,
    sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${suffix}`,
    lat: point.lat, lon: point.lon,
    address: { street: hit.adressenavn, number: suffix, postcode: String(hit.postnummer), city: venue.city, country: 'NO' }
  };
}

function buildPlace(venue, coordinate) {
  const place = {
    id: venue.id, name: venue.name, aliases: venue.aliases,
    visual: { designCode: 'theatre_miniature' },
    lat: coordinate.lat, lon: coordinate.lon, r: 80,
    category: 'scenekunst', fylke: venue.fylke, kommune: venue.kommune,
    period: venue.period, desc: venue.desc, popupDesc: venue.popupDesc,
    tags: venue.tags, emne_ids: venue.emne_ids, physicalScope: venue.physicalScope,
    quiz_profile: venue.quiz_profile, knowledge: venue.knowledge,
    coordType: 'address_point', coordStatus: 'verified', coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl, coordVerifiedAt: VERIFIED_DATE,
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${coordinate.address.street} ${coordinate.address.number}, ${venue.city}. Punktet representerer den fysisk avgrensede scenekunstfunksjonen og brukes som display-marker.`,
    locatorType: 'building', sourceProvider: 'official_address', sourceObjectId: coordinate.sourceObjectId,
    address: coordinate.address, geocodeAccuracy: 'rooftop', coordRole: 'display_marker',
    coLocationAudit: { status: 'reviewed', nearbyCanonicalIds: [], intentionalSharedAnchor: false, note: 'Ingen eksisterende canonical place-record deler det eksakte adressepunktet.' }
  };
  if (Number.isInteger(venue.year)) place.year = venue.year;
  if (venue.lifecycle) place.lifecycle = venue.lifecycle;
  return place;
}

const manifest = readJson(MANIFEST_PATH);
const globalIndex = readJson(GLOBAL_INDEX_PATH);
if (!Array.isArray(manifest.files) || !Array.isArray(globalIndex)) throw new Error('Unexpected manifest or global index shape');
for (const venue of VENUES) {
  if (globalIndex.some((row) => row.id === venue.id)) throw new Error(`${venue.id}: canonical place already exists`);
  if (manifest.files.includes(venue.sourceFile)) throw new Error(`${venue.sourceFile}: source already registered`);
  if (fs.existsSync(abs(`data/${venue.sourceFile}`))) throw new Error(`${venue.sourceFile}: target file already exists`);
}

const places = [];
const coordinateResults = [];
for (const venue of VENUES) {
  const coordinate = await exactAddress(venue);
  const nearby = globalIndex.filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon)).map((row) => ({...row, distanceMeters: haversineMeters(coordinate,row)})).filter((row) => row.distanceMeters <= 2).sort((a,b) => a.distanceMeters-b.distanceMeters);
  if (nearby.length) throw new Error(`${venue.id}: unexpected canonical overlap with ${nearby.map((row) => row.id).join(', ')}`);
  const place = buildPlace(venue, coordinate);
  writeJson(`data/${venue.sourceFile}`, [place]);
  manifest.files.push(venue.sourceFile);
  places.push(place);
  coordinateResults.push({ id: venue.id, query: coordinate.query, sourceUrl: coordinate.sourceUrl, sourceObjectId: coordinate.sourceObjectId, coordinate: {lat: coordinate.lat, lon: coordinate.lon}, address: coordinate.address, exactOverlapIds: [], overlapDecision: 'no_overlap' });
}
writeJson(MANIFEST_PATH, manifest);
writeJson(REPORT_JSON, {
  generatedAt: NOW, status: 'built_pending_validation', category: 'scenekunst', batch: 'new_venues_6', dependsOn: 'agent/scenekunst-venues-05 / PR #3308',
  addedPlaceIds: places.map((p) => p.id), sourceFiles: VENUES.map((v) => v.sourceFile),
  officialInstitutionSources: Object.fromEntries(VENUES.map((v) => [v.id, v.knowledge.sources])),
  coordinateResults, physicalScopeDecisions: Object.fromEntries(VENUES.map((v) => [v.id, v.physicalScope])),
  lifecycleDecisions: Object.fromEntries(VENUES.filter((v) => v.lifecycle).map((v) => [v.id, v.lifecycle])),
  deferredCandidates: {
    bit_teatergarasjen_sentralbadet: 'Deferred until Sentralbadet Scenekunsthus opens on 2027-03-04 and the final public venue identity is operational.'
  },
  validation: { geonorgeExactAddressLookup: 'pass', overlapAudit: 'pass', placesIndexBuild: 'pending_workflow', placesChecks: 'pending_workflow', categoryAudit: 'pending_workflow' }
});
const md = ['# Scenekunst – nye hus, batch 6','',`Generert: ${NOW}`,'','## Nye steder','',...places.map((p)=>`- \`${p.id}\` – ${p.name}`),'','## Koordinater','',...coordinateResults.flatMap((row)=>[`### \`${row.id}\``,'',`- Adresse: ${row.address.street} ${row.address.number}, ${row.address.postcode} ${row.address.city}`,`- Geonorge-objekt: \`${row.sourceObjectId}\``,`- Punkt: ${row.coordinate.lat}, ${row.coordinate.lon}`,'- Overlap: no_overlap','']),'## Fysisk scope','',...VENUES.map((v)=>`- \`${v.id}\`: ${v.physicalScope}`),'','## Utsatt kandidat','','- BIT / Sentralbadet opprettes først etter dokumentert åpning 4. mars 2027.',''];
fs.writeFileSync(abs(REPORT_MD), md.join('\n'), 'utf8');
console.log(`Added ${places.length} Scenekunst venues:`);
for (const place of places) console.log(`- ${place.id}: ${place.lat}, ${place.lon}`);
