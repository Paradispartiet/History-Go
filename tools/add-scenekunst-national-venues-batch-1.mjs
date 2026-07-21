#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_DATE = '2026-07-21';
const NOW = new Date().toISOString();
const MANIFEST_PATH = 'data/places/manifest.json';
const GLOBAL_INDEX_PATH = 'data/places/places_index.json';
const REPORT_JSON = 'reports/scenekunst-national-new-venues-batch-1-2026-07-21.json';
const REPORT_MD = 'reports/scenekunst-national-new-venues-batch-1-2026-07-21.md';

const VENUES = [
  {
    id: 'den_nationale_scene',
    name: 'Den Nationale Scene',
    aliases: ['DNS', 'Den Nationale Scene Bergen'],
    sourceFile: 'places/scenekunst/vestland/den_nationale_scene.json',
    fylke: 'vestland',
    kommune: 'Bergen',
    city: 'Bergen',
    municipalityNumber: '4601',
    street: 'Engen',
    number: 1,
    expectedPostcode: null,
    year: 1909,
    period: 'Nasjonalt teater, norsk scenespråk og monumental jugendarkitektur',
    desc: 'Den fredede teaterbygningen på Engen, hjem for Den Nationale Scene siden 1909 og et hovedsted i norsk teaterhistorie.',
    popupDesc: 'Den Nationale Scene har røtter i Det Norske Theater fra 1850 og har holdt til i Einar Oscar Schous jugendbygg på Engen siden 1909. Stedet knytter sammen norsk scenespråk, Henrik Ibsens tidlige teaterarbeid, fast ensemble, repertoarteater og nasjonal kulturinstitusjon. Hovedbygget har vært stengt for omfattende modernisering siden april 2025. History Go-recorden representerer den historiske teaterbygningen på Engen 1, ikke de midlertidige spillestedene DNS bruker mens arbeidet pågår.',
    tags: ['nasjonalteater', 'repertoarteater', 'jugend', 'henrik_ibsen', 'bergen', 'teaterhistorie'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar', 'em_scenekunst_dramaturgi_iscenesettelse', 'em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Den fredede hovedbygningen på Engen 1. Midlertidige spillesteder og Lille DNS i Fortunen 7 inngår ikke i samme fysiske markør.',
    lifecycle: {
      status: 'temporarily_closed_for_modernization',
      closedFrom: '2025-04-12',
      institutionStatus: 'active_across_temporary_venues',
      plannedTransition: 'Recorden skal oppdateres når den offisielle gjenåpningen av hovedbygget er bekreftet.'
    },
    quiz_profile: {
      place_type: 'nasjonal_teaterinstitusjon_og_fredet_teaterbygg',
      subtype: 'repertoarteater_med_roetter_i_det_norske_theater',
      signature_features: ['røtter tilbake til 1850', 'jugendbygget på Engen åpnet i 1909', 'tidlig arbeidssted for Henrik Ibsen'],
      primary_angles: ['institusjon', 'teaterhistorie', 'språk', 'arkitektur'],
      question_families: ['historisk_endring', 'institusjon', 'repertoar', 'kontrast'],
      avoid_angles: ['framstille_hovedbygget_som_apent_i_2026', 'blande_midlertidige_spillesteder_med_engen_1'],
      must_include: ['forbindelsen til Det Norske Theater og norsk scenespråk', 'midlertidig stenging for modernisering'],
      contrast_targets: ['nationaltheatret', 'det_norske_teatret'],
      notes: 'Spør bygningen og institusjonshistorien sammen, men marker at ordinær drift på Engen 1 er midlertidig stanset.'
    },
    knowledge: {
      one_liner: 'Den Nationale Scene binder norsk scenespråk og nasjonal teaterhistorie til det monumentale huset på Engen.',
      why_it_matters: ['Institusjonen viderefører røttene fra Det Norske Theater, opprettet i 1850.', 'Huset fra 1909 er et sentralt eksempel på norsk jugendarkitektur og repertoarteater.'],
      what_to_notice: ['Teaterbyggets monumentale plassering og jugenddetaljer.', 'Skillet mellom institusjonens aktive drift og hovedbyggets midlertidige stenging.', 'Henrik Ibsens praktiske teaterarbeid i Bergen som del av forhistorien.'],
      terms: ['repertoarteater', 'nasjonalteater', 'scenespråk', 'jugend'],
      sources: ['https://dns.no/om-den-nationale-scene/historien-til-den-nationale-scene/', 'https://dns.no/kontakt/', 'https://modernisering.dns.no/om-prosjektet/']
    }
  },
  {
    id: 'rogaland_teater',
    name: 'Rogaland Teater',
    aliases: ['Rogaland Teater Stavanger'],
    sourceFile: 'places/scenekunst/rogaland/rogaland_teater.json',
    fylke: 'rogaland',
    kommune: 'Stavanger',
    city: 'Stavanger',
    municipalityNumber: '1103',
    street: 'Teaterveien',
    number: 1,
    expectedPostcode: '4005',
    year: 1883,
    period: 'Regionalt repertoarteater, historisk teaterbygg og barne- og ungdomsteater',
    desc: 'Regionalt teater i Stavanger med historisk hovedbygg fra 1883, fire scener og en særpreget barne- og ungdomsteatertradisjon.',
    popupDesc: 'Teaterbygget i Teaterveien 1 åpnet i 1883, mens Rogaland Teater ble etablert som fast institusjon i 1947. Hovedscenen, Kjellerteatret og Intimscenen ligger i hovedbygget; Teaterhallen ligger i nabobygget og inngår i samme institusjonelle teaterområde. Stedet viser hvordan et regionalt repertoarteater kombinerer klassisk og moderne dramatikk, musikal, familieforestillinger og et omfattende barne- og ungdomsteater.',
    tags: ['regionteater', 'repertoarteater', 'barneteater', 'ungdomsteater', 'stavanger', 'teaterhistorie'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar', 'em_scenekunst_dramaturgi_iscenesettelse', 'em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Rogaland Teaters hovedbygg i Teaterveien 1 og den tilstøtende Teaterhallen som ett samlet institusjonsområde.',
    quiz_profile: {
      place_type: 'regionalt_repertoarteater',
      subtype: 'historisk_flerscenehus_med_barne_og_ungdomsteater',
      signature_features: ['hovedbygget åpnet i 1883', 'fast Rogaland Teater siden 1947', 'fire scener og en omfattende barne- og ungdomsteatertradisjon'],
      primary_angles: ['institusjon', 'repertoar', 'barn_og_ungdom', 'teaterbygg'],
      question_families: ['historisk_endring', 'institusjon', 'publikum', 'sceneformater'],
      avoid_angles: ['bare_hovedscenen', 'blande_1883_med_institusjonsgrunnleggelsen_1947'],
      must_include: ['skillet mellom byggets og institusjonens alder', 'Barne- og ungdomsteatrets rolle'],
      contrast_targets: ['den_nationale_scene', 'teater_ibsen'],
      notes: 'Spør som et regionalt teaterkompleks med fire scener og egen opplærings-/produksjonstradisjon for barn og unge.'
    },
    knowledge: {
      one_liner: 'Rogaland Teater forener et teaterhus fra 1883 med kontinuerlig regional institusjonsdrift siden 1947.',
      why_it_matters: ['Teatret gir Rogaland et fast produserende ensemble- og repertoarhus.', 'Barne- og ungdomsteatret kombinerer opplæring, deltakelse og store profesjonelle oppsetninger.'],
      what_to_notice: ['Forskjellen mellom hovedbygget og den tilstøtende Teaterhallen.', 'Hvordan fire scener muliggjør ulike formater og publikumsstørrelser.', 'Skillet mellom byggets åpning i 1883 og institusjonen Rogaland Teater fra 1947.'],
      terms: ['regionteater', 'repertoar', 'barne_og_ungdomsteater', 'fler_scenehus'],
      sources: ['https://rogaland-teater.no/om-oss/om-teateret/', 'https://rogaland-teater.no/om-oss/kontakt/']
    }
  },
  {
    id: 'trondelag_teater',
    name: 'Trøndelag Teater',
    aliases: ['Trøndelag Teater Trondheim', 'Gamle Scene'],
    sourceFile: 'places/scenekunst/trondelag/trondelag_teater.json',
    fylke: 'trondelag',
    kommune: 'Trondheim',
    city: 'Trondheim',
    municipalityNumber: '5001',
    street: 'Prinsens gate',
    number: 18,
    expectedPostcode: null,
    year: 1816,
    period: 'Nordens eldste kontinuerlig drevne teaterscene og moderne flerscenehus',
    desc: 'Trondheims regionale teaterkompleks, der Gamle Scene fra 1816 er integrert med et moderne femsceneshus fra 1997.',
    popupDesc: 'Trøndelag Teater samler fem scener i komplekset i Prinsens gate 18/20. Gamle Scene fra 1816 regnes som Nordens eldste teaterscene i kontinuerlig drift. Den faste institusjonen Trøndelag Teater ble etablert i 1937, og i 1997 ble det historiske huset integrert i et nytt teaterbygg med hovedscene, studioscene, teaterkjeller og Theatercafé. Stedet gjør kontinuitet og sceneteknisk forandring synlig i samme bygningskompleks.',
    tags: ['regionteater', 'gamle_scene', 'teaterhistorie', 'trondheim', 'repertoarteater', 'fem_scener'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar', 'em_scenekunst_dramaturgi_iscenesettelse', 'em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Hele Trøndelag Teaters integrerte kompleks i Prinsens gate 18/20, inkludert Gamle Scene og de fire nyere scenene.',
    quiz_profile: {
      place_type: 'regionalt_repertoarteater_og_historisk_teaterkompleks',
      subtype: 'barokkscene_fra_1816_integrert_i_femscenehus',
      signature_features: ['Gamle Scene fra 1816', 'fast institusjon siden 1937', 'fem scener i integrert bygg fra 1997'],
      primary_angles: ['teaterhistorie', 'institusjon', 'arkitektur', 'repertoar'],
      question_families: ['historisk_endring', 'sceneformater', 'institusjon', 'kontrast'],
      avoid_angles: ['behandle_gamle_scene_som_separat_canonical_bygning', 'blande_1816_med_institusjonsgrunnleggelsen_1937'],
      must_include: ['Gamle Scenes kontinuerlige drift', 'integrasjonen mellom gammelt og nytt teaterhus'],
      contrast_targets: ['rogaland_teater', 'den_nationale_scene'],
      notes: 'Én canonical record for hele komplekset; Gamle Scene er en intern scene, ikke en separat markør.'
    },
    knowledge: {
      one_liner: 'Trøndelag Teater lar en teaterscene fra 1816 virke inne i et moderne produserende femsceneshus.',
      why_it_matters: ['Gamle Scene gir en sjelden kontinuitet i nordisk teaterarkitektur og publikumspraksis.', 'Det moderne komplekset viser hvordan historisk vern kan kombineres med nye produksjonsformer.'],
      what_to_notice: ['Gamle Scenes salong og skrå scene.', 'Overgangen mellom den historiske delen og nybygget fra 1997.', 'Hvordan fem scener gir ulike forhold mellom publikum og forestilling.'],
      terms: ['barokkscene', 'repertoarteater', 'fler_scenehus', 'kontinuerlig_drift'],
      sources: ['https://www.trondelag-teater.no/scener', 'https://www.trondelag-teater.no/om-oss/telefon-og-adresser', 'https://arsrapport.trondelag-teater.no/2023/introduksjon-til-teatret-og-hovedtall/dette-er-trondelag-teater']
    }
  },
  {
    id: 'halogaland_teater',
    name: 'Hålogaland Teater',
    aliases: ['HT', 'Hålogaland Teater Tromsø'],
    sourceFile: 'places/scenekunst/troms/halogaland_teater.json',
    fylke: 'troms',
    kommune: 'Tromsø',
    city: 'Tromsø',
    municipalityNumber: '5501',
    street: 'Teaterplassen',
    number: 1,
    expectedPostcode: null,
    year: 2005,
    period: 'Nordnorsk regionteater, dialekt, turné og moderne teaterbygg',
    desc: 'Regionteater for Troms og Finnmark i et moderne teaterhus ved Tromsøysundet, ferdigstilt i 2005.',
    popupDesc: 'Hålogaland Teater ble grunnlagt i 1971 som Nord-Norges første profesjonelle teater. Nordnorsk språk og perspektiv har vært en sentral del av identiteten, samtidig som teatret turnerer i Troms og Finnmark. Det nåværende teaterhuset på Teaterplassen åpnet i 2005 og rommer flere scener, kaféscene, prøverom og produksjonsfunksjoner. Stedet viser hvordan et regionteater kan være både fast byinstitusjon og turnerende landsdelsteater.',
    tags: ['regionteater', 'nordnorsk', 'dialekt', 'turneteater', 'tromso', 'moderne_teaterbygg'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar', 'em_scenekunst_dramaturgi_iscenesettelse', 'em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Hålogaland Teaters faste teaterbygg på Teaterplassen 1; turnéspillestedene i Troms og Finnmark inngår ikke i samme markør.',
    quiz_profile: {
      place_type: 'nordnorsk_regionteater',
      subtype: 'fast_teaterhus_og_turnerende_landsdelsinstitusjon',
      signature_features: ['grunnlagt i 1971 som Nord-Norges første profesjonelle teater', 'nordnorsk scenespråk og perspektiv', 'eget teaterbygg fra 2005'],
      primary_angles: ['region', 'språk', 'turne', 'institusjon'],
      question_families: ['historisk_endring', 'kulturgeografi', 'institusjon', 'publikum'],
      avoid_angles: ['bare_tromso_scene', 'generisk_moderne_kulturbygg'],
      must_include: ['rollen som regionteater for Troms og Finnmark', 'forholdet mellom fast hus og turné'],
      contrast_targets: ['trondelag_teater', 'teater_ibsen'],
      notes: 'Spør som nordnorsk regioninstitusjon med fast hus og omfattende turnévirksomhet.'
    },
    knowledge: {
      one_liner: 'Hålogaland Teater gjør nordnorsk språk, erfaring og geografi til profesjonell scenekunst fra et fast hus og gjennom turné.',
      why_it_matters: ['Teatret var Nord-Norges første profesjonelle teater.', 'Turnévirksomheten gjør institusjonen regional utover selve bygget i Tromsø.'],
      what_to_notice: ['Teaterhusets plassering ved sundet.', 'De ulike scenene og produksjonsfunksjonene i bygget.', 'Hvordan nordnorsk dialekt og regional identitet preger institusjonens historie.'],
      terms: ['regionteater', 'turneteater', 'scenespråk', 'nordnorsk_teater'],
      sources: ['https://halogalandteater.no/om-oss', 'https://halogalandteater.no/om-oss/teaterbygget', 'https://halogalandteater.no/kontakt']
    }
  },
  {
    id: 'teater_ibsen',
    name: 'Teater Ibsen',
    aliases: ['Teater Ibsen Skien', 'Telemark Teater'],
    sourceFile: 'places/scenekunst/telemark/teater_ibsen.json',
    fylke: 'telemark',
    kommune: 'Skien',
    city: 'Skien',
    municipalityNumber: '4003',
    street: 'Hollenderigata',
    number: 15,
    expectedPostcode: '3732',
    year: 2011,
    period: 'Regionteater for Vestfold og Telemark i transformert industrimiljø',
    desc: 'Regionteater for Vestfold og Telemark i tidligere fabrikklokaler på Klosterøya i Skien, tatt i bruk i 2011.',
    popupDesc: 'Teater Ibsen ble etablert som Telemark Teater i 1975 og fikk dagens navn i 1991, da institusjonen også ble regionteater for Vestfold. I 2011 flyttet teatret fra Festiviteten til funksjonelle lokaler i tidligere fabrikklokaler på Klosterøya. Stedet kobler turnerende regional scenekunst, Henrik Ibsens navn og Skiens transformasjon fra industriområde til kultur-, utdannings- og byutviklingsområde.',
    tags: ['regionteater', 'henrik_ibsen', 'turneteater', 'skien', 'klosteroya', 'industriforvandling'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar', 'em_scenekunst_dramaturgi_iscenesettelse', 'em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Teater Ibsens faste hus i Hollenderigata 15. De mange turnéspillestedene i Vestfold og Telemark inngår ikke i samme markør.',
    quiz_profile: {
      place_type: 'regionalt_turnerende_teater',
      subtype: 'teater_i_transformert_industribygg_pa_klosteroya',
      signature_features: ['etablert som Telemark Teater i 1975', 'regionteater for Vestfold og Telemark', 'fast hus på Klosterøya siden 2011'],
      primary_angles: ['institusjon', 'turne', 'bytransformasjon', 'regional_kultur'],
      question_families: ['historisk_endring', 'kulturgeografi', 'institusjon', 'kontrast'],
      avoid_angles: ['framstille_alle_turnesteder_som_del_av_samme_fysiske_record', 'forveksle_teatret_med_ibsen_museum'],
      must_include: ['skiftet fra Telemark Teater til Teater Ibsen', 'forholdet mellom fast hus og regional turné'],
      contrast_targets: ['ibsen_venstop_skien', 'halogaland_teater'],
      notes: 'Spør som regionteater og fysisk gjenbruk av industrilokaler, ikke som museum for Henrik Ibsen.'
    },
    knowledge: {
      one_liner: 'Teater Ibsen gjør et tidligere fabrikkområde på Klosterøya til base for turnerende scenekunst i Vestfold og Telemark.',
      why_it_matters: ['Institusjonen gir to fylker et produserende regionteater med omfattende turné.', 'Flyttingen til Klosterøya viser hvordan industribygg kan få ny kulturfunksjon.'],
      what_to_notice: ['Sporene etter det tidligere fabrikkmiljøet.', 'Forskjellen mellom Teater Ibsen som institusjon og Ibsen-museene som minnesteder.', 'At hovedhuset er base for forestillinger som også reiser til mange andre steder.'],
      terms: ['regionteater', 'turne', 'industrigjenbruk', 'repertoar'],
      sources: ['https://teateribsen.no/om-oss', 'https://teateribsen.no/spillesteder/teater-ibsen', 'https://teateribsen.no/om-oss/kontakt']
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
    address: { street: hit.adressenavn, number: String(hit.nummer), postcode: String(hit.postnummer), city: venue.city, country: 'NO' }
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
    r: 80,
    category: 'scenekunst',
    fylke: venue.fylke,
    kommune: venue.kommune,
    year: venue.year,
    period: venue.period,
    desc: venue.desc,
    popupDesc: venue.popupDesc,
    tags: venue.tags,
    emne_ids: venue.emne_ids,
    physicalScope: venue.physicalScope,
    quiz_profile: venue.quiz_profile,
    knowledge: venue.knowledge,
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl,
    coordVerifiedAt: VERIFIED_DATE,
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${coordinate.address.street} ${coordinate.address.number}, ${venue.city}. Punktet representerer det fysisk avgrensede teaterhuset eller teaterkomplekset og brukes som display-marker.`,
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
  if (venue.lifecycle) place.lifecycle = venue.lifecycle;
  return place;
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
  const nearby = globalIndex
    .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon))
    .map((row) => ({ ...row, distanceMeters: haversineMeters(coordinate, row) }))
    .filter((row) => row.distanceMeters <= 2)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
  if (nearby.length) throw new Error(`${venue.id}: unexpected canonical overlap with ${nearby.map((row) => row.id).join(', ')}`);
  const place = buildPlace(venue, coordinate, nearby);
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
  batch: 'national_new_venues_1',
  dependsOn: 'agent/scenekunst-oslo-new-venues-03 / PR #3193',
  addedPlaceIds: places.map((place) => place.id),
  sourceFiles: VENUES.map((venue) => venue.sourceFile),
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
  '# Scenekunst – nye nasjonale steder, batch 1', '',
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
  ...VENUES.map((venue) => `- \`${venue.id}\`: ${venue.physicalScope}`), '',
  '## Statusvalg', '',
  '- Den Nationale Scenes hovedbygg på Engen 1 er registrert med midlertidig stengt-livssyklus under moderniseringen. Institusjonens midlertidige spillesteder får ikke samme markør.', ''
];
fs.writeFileSync(abs(REPORT_MD), md.join('\n'), 'utf8');
console.log(`Added ${places.length} national Scenekunst venues:`);
for (const place of places) console.log(`- ${place.id}: ${place.lat}, ${place.lon}`);
