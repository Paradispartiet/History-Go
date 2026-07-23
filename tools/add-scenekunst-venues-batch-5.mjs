#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_DATE = '2026-07-23';
const NOW = new Date().toISOString();
const MANIFEST_PATH = 'data/places/manifest.json';
const GLOBAL_INDEX_PATH = 'data/places/places_index.json';
const REPORT_JSON = 'reports/scenekunst-new-venues-batch-5-2026-07-23.json';
const REPORT_MD = 'reports/scenekunst-new-venues-batch-5-2026-07-23.md';

const VENUES = [
  {
    id: 'teater_manu',
    name: 'Teater Manu',
    aliases: ['Det norske tegnspråkteatret', 'Teater Manu – det nasjonale tegnspråkteatret'],
    sourceFile: 'places/scenekunst/oslo/teater_manu.json',
    fylke: 'oslo', kommune: 'Oslo', city: 'Oslo', municipalityNumber: '0301',
    street: 'Christies gate', number: 5, expectedPostcode: '0557',
    year: 2003,
    period: 'Nasjonalt tegnspråkteater, døvekultur og visuelt scenespråk',
    desc: 'Norges nasjonale tegnspråkteater med egen scene på Grünerløkka og turnévirksomhet i hele landet.',
    popupDesc: 'Teater Manu er Norges nasjonale tegnspråkteater og en kulturell møteplass med røtter i døves kultur. Den første profesjonelle forestillingen på norsk tegnspråk hadde premiere i 1999, teatret ble formelt stiftet i 2003 og fikk navnet Teater Manu i 2004. Scenen i Christies gate 5 brukes til forestillinger, ungdomsarbeid og møteplassfunksjoner, mens produksjonene også turnerer nasjonalt. Stedet viser hvordan tegnspråk fungerer som selvstendig kunstnerisk scenespråk, ikke bare som oversettelse.',
    tags: ['tegnspraak','dovekultur','nasjonalteater','visuelt_teater','grunerlokka','turneteater'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_skuespill_rollefortolkning','em_scenekunst_dramaturgi_iscenesettelse','em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Teater Manus publikums- og scenefunksjoner med besøksinngang i Christies gate 5. Post- og administrasjonsadressen i Schleppegrells gate 32 representeres ikke som en separat scene, og turnéspillestedene inngår ikke.',
    quiz_profile: {
      place_type: 'nasjonalt_tegnspraakteater',
      subtype: 'profesjonelt_turnerende_teater_med_norsk_tegnspraak_som_scenespråk',
      signature_features: ['første profesjonelle forestilling på norsk tegnspråk i 1999','formelt stiftet i 2003','nasjonalt ansvar og turnévirksomhet'],
      primary_angles: ['tegnspraak','dovekultur','rollefortolkning','tilgjengelig_scenekunst'],
      question_families: ['institusjon','språk_og_uttrykk','historisk_endring','publikum'],
      avoid_angles: ['framstille_tegnspraak_som_bare_tolkning','blande_turnesteder_med_hjemmescenen'],
      must_include: ['tegnspråk som kunstnerisk hovedspråk','rollen som nasjonal kulturell møteplass'],
      contrast_targets: ['det_norske_teatret','dramatikkens_hus'],
      notes: 'Spør om tegnspråklig scenekunst på egne premisser og om forholdet mellom fast scene og nasjonal turné.'
    },
    knowledge: {
      one_liner: 'Teater Manu gjør norsk tegnspråk til hovedspråk for profesjonell scenekunst og nasjonal kulturformidling.',
      why_it_matters: ['Teatret styrker norsk tegnspråk som kunstnerisk og kulturelt språk.','Hjemmescenen gir døve kunstnere og publikum et fast profesjonelt teaterrom, mens turnévirksomheten gjør tilbudet nasjonalt.'],
      what_to_notice: ['Hvordan kropp, blikk, rom og rytme bærer mening sammen med tegnspråket.','At forestillingene kan kombinere tegnspråk, talespråk og visuelle virkemidler.','Skillet mellom hjemmescenen og de mange turnéarenaene.'],
      terms: ['tegnspraaksteater','visuelt_scenespråk','dovekultur','nasjonalteater'],
      sources: ['https://teatermanu.no/om-teater-manu','https://teatermanu.no/billetter/','https://teatermanu.no/om-teater-manu/496-2/']
    }
  },
  {
    id: 'dramatikkens_hus',
    name: 'Dramatikkens hus',
    aliases: ['Det Åpne Teater', 'Norsk senter for ny dramatikk'],
    sourceFile: 'places/scenekunst/oslo/dramatikkens_hus.json',
    fylke: 'oslo', kommune: 'Oslo', city: 'Oslo', municipalityNumber: '0301',
    street: 'Tøyenbekken', number: 34, expectedPostcode: '0188',
    year: 2010,
    period: 'Utviklingsarena for ny norsk og samisk dramatikk i vernet verkstedbygg',
    desc: 'Nasjonalt utviklingshus for ny norsk og samisk dramatikk, med scenerom, verksteder, lesninger og åpne prøver på Grønland.',
    popupDesc: 'Dramatikkens hus har nasjonalt ansvar for utvikling av ny norsk og samisk dramatikk. Institusjonen støtter dramatikere med skrive- og utviklingsmidler, dramaturgi, rådgivning og sceniske ressurser. Bygget i Tøyenbekken 34 ble tatt i bruk av Det Åpne Teater i 1987 etter å ha blitt reddet fra riving og rehabilitert fra et tidligere sveiseverksted. Da virksomheten skiftet fra produksjon til dramatikkutvikling, fikk den navnet Dramatikkens hus i 2010.',
    tags: ['dramatikk','dramaturgi','ny_norsk_dramatikk','samisk_dramatikk','gronland','verkstedbygg'],
    emne_ids: ['em_scenekunst_dramaturgi_iscenesettelse','em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_skuespill_rollefortolkning'],
    physicalScope: 'Dramatikkens hus sine scenerom, prøverom, verksteder og publikumsfunksjoner i Tøyenbekken 34. Verk som senere produseres ved andre teatre inngår ikke som samme fysiske sted.',
    quiz_profile: {
      place_type: 'nasjonalt_utviklingshus_for_dramatikk',
      subtype: 'faglig_og_scenisk_laboratorium_for_nye_tekster',
      signature_features: ['nasjonalt ansvar for ny norsk og samisk dramatikk','Det Åpne Teater flyttet inn i 1987','navneskifte og nytt mandat i 2010'],
      primary_angles: ['dramaturgi','tekstutvikling','kunstnerisk_forskning','bygningsgjenbruk'],
      question_families: ['arbeidsprosess','institusjon','historisk_endring','kontrast'],
      avoid_angles: ['framstille_huset_som_ordinært_repertoarteater','blande_utviklingsarbeid_med_senere_premierer_andre_steder'],
      must_include: ['forskjellen mellom å utvikle og å produsere dramatikk','rollen som nasjonal fag- og møteplass'],
      contrast_targets: ['teater_manu','nationaltheatret'],
      notes: 'Spør om dramatikkens vei fra idé og tekst til prøverom og mulig framtidig produksjon.'
    },
    knowledge: {
      one_liner: 'Dramatikkens hus er prøverommet der nye norske og samiske scenetekster kan utvikles før de blir ferdige forestillinger.',
      why_it_matters: ['Huset gir dramatikere tid, dramaturgisk kompetanse og sceniske ressurser.','Den nasjonale funksjonen styrker tilfanget av ny dramatikk i hele teaterfeltet.'],
      what_to_notice: ['At arrangementene ofte er lesninger, verksteder eller åpne prøver.','Sporene etter det tidligere verkstedbygget.','Hvordan tekst, skuespillere og regi møtes tidlig i utviklingsprosessen.'],
      terms: ['dramaturgi','tekstutvikling','lesning','aapen_proeve'],
      sources: ['https://www.dramatikkenshus.no/om-oss','https://www.dramatikkenshus.no/english']
    }
  },
  {
    id: 'vega_scene',
    name: 'Vega Scene',
    aliases: ['Vega teater og kino'],
    sourceFile: 'places/scenekunst/oslo/vega_scene.json',
    fylke: 'oslo', kommune: 'Oslo', city: 'Oslo', municipalityNumber: '0301',
    street: 'Hausmanns gate', number: 28, expectedPostcode: '0182',
    year: 2018,
    period: 'Teater, kvalitetsfilm, debatt og tverrkunstnerisk programhus',
    desc: 'Uavhengig programhus i Hausmanns gate med teatersal, kinosaler og salong for teater, film, samtaler og unge stemmer.',
    popupDesc: 'Vega Scene åpnet for publikum 3. november 2018. Huset kombinerer teatersal, to kinosaler og Salongen, der film, teater, debatt, utstillinger og mindre sceniske formater kan møtes. Teaterprogrammet omfatter egenproduksjon, samproduksjon og gjestespill, og Vega Ung gir barn og unge en egen inngang til scenekunst. Stedet viser hvordan grensene mellom teater, kino og offentlig samtale kan organiseres i ett samtidshus.',
    tags: ['teater','kino','debatt','unge_utovere','hausmannskvartalet','tverrkunstnerisk'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_dramaturgi_iscenesettelse','em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Vega Scenes teatersal, kinosaler, Salongen og publikumsfunksjoner i Hausmanns gate 28. Eksterne festivalarenaer og samarbeidsspillesteder inngår ikke.',
    quiz_profile: {
      place_type: 'tverrkunstnerisk_teater_og_kinahus',
      subtype: 'uavhengig_programhus_med_teater_kino_og_samtale',
      signature_features: ['åpnet i 2018','egen teatersal og to kinosaler','Salongen som debatt- og arrangementsrom'],
      primary_angles: ['programmering','teater_og_film','offentlig_samtale','unge_stemmer'],
      question_families: ['institusjon','sceneformater','publikum','kontrast'],
      avoid_angles: ['redusere_huset_til_kino','blande_alle_samarbeidsarenaer_med_vega_bygget'],
      must_include: ['kombinasjonen av teater, film og samtale','Vega Ung som del av huset'],
      contrast_targets: ['dramatikkens_hus','folketeateret'],
      notes: 'Spør som hybrid programhus med tydelig teaterfunksjon, ikke som ren kino.'
    },
    knowledge: {
      one_liner: 'Vega Scene samler teater, kvalitetsfilm og offentlig samtale under samme tak.',
      why_it_matters: ['Huset skaper møteflater mellom scenekunst, film og samfunnsdebatt.','Teatersalen gir plass til både egne produksjoner, gjestespill og unge teaterskapere.'],
      what_to_notice: ['Forskjellen mellom teatersalen, kinosalene og Salongen.','Hvordan foajé og snackbar fungerer som sosial overgang mellom kunstformene.','At huset programmerer både voksne og unge publikumsgrupper.'],
      terms: ['programhus','samproduksjon','hybridarena','publikumsutvikling'],
      sources: ['https://www.vegascene.no/nyheter/om-vega-scene','https://www.vegascene.no/nyheter/praktisk-info','https://www.vegascene.no/teater']
    }
  },
  {
    id: 'baerum_kulturhus',
    name: 'Bærum Kulturhus',
    aliases: ['Bærum Kulturhus – Store Sal', 'Dans Sørøst-Norge'],
    sourceFile: 'places/scenekunst/akershus/baerum_kulturhus.json',
    fylke: 'akershus', kommune: 'Bærum', city: 'Sandvika', municipalityNumber: '3201',
    street: 'Claude Monets allé', number: 27, expectedPostcode: '1338',
    year: 2003,
    period: 'Kommunalt kulturhus, samtidsarkitektur, dans og nysirkus',
    desc: 'Snøhetta-tegnet kulturhus i Sandvika med Store Sal, Underhuset og Foajéscenen og en nasjonal profil innen dans og nysirkus.',
    popupDesc: 'Bærum Kulturhus åpnet 4. september 2003 etter en arkitektkonkurranse vunnet av Snøhetta. Hovedbygget i Claude Monets allé 27 rommer Store Sal, Underhuset og Foajéscenen og brukes til dans, teater, musikk, nysirkus og lokalt kulturliv. Gjennom Dans Sørøst-Norge arbeider huset også med residens, co-produksjon og internasjonale nettverk for dansekunst. Sandvika Teater og Lille Scene drives av samme organisasjon, men ligger på andre adresser og inngår ikke i denne markøren.',
    tags: ['kulturhus','dans','nysirkus','snohetta','sandvika','samproduksjon'],
    emne_ids: ['em_scenekunst_dans_koreografi','em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_publikum_fjerde_vegg','em_scenekunst_regi_scenografi'],
    physicalScope: 'Hovedbygget i Claude Monets allé 27 med Store Sal, Underhuset, Foajéscenen og tilhørende publikumsfunksjoner. Sandvika Teater i Kinoveien 2 og Lille Scene i Rådmann Halmrasts vei 2 er egne fysiske steder og inngår ikke.',
    quiz_profile: {
      place_type: 'kommunalt_kulturhus_og_danseknutepunkt',
      subtype: 'snohetta_bygg_med_flere_scener_og_dansesatsing',
      signature_features: ['åpnet i 2003','tegnet av Snøhetta','Dans Sørøst-Norge og co-produksjon av dans og nysirkus'],
      primary_angles: ['dans','kulturhusmodell','arkitektur','samproduksjon'],
      question_families: ['arkitektur','institusjon','arbeidsprosess','publikum'],
      avoid_angles: ['slå_sammen_alle_fem_scenene_til_ett_fysisk_sted','redusere_huset_til_utleiesal'],
      must_include: ['hovedbyggets tre interne scener','rollen innen dans og nysirkus'],
      contrast_targets: ['dansens_hus_oslo','drammens_teater'],
      notes: 'Spør om hovedbygget og den skapende danseprofilen; eksterne scener modelleres separat.'
    },
    knowledge: {
      one_liner: 'Bærum Kulturhus kombinerer Snøhetta-arkitektur med et aktivt produksjons- og visningsmiljø for særlig dans og nysirkus.',
      why_it_matters: ['Huset er både kommunal publikumsarena og faglig partner for profesjonelle danseproduksjoner.','Arkitekturen fra 2003 ga Sandvika et profilert kulturbygg midt i byutviklingen.'],
      what_to_notice: ['Store Sals forhold mellom scene og amfi.','Forskjellen mellom Store Sal, Underhuset og Foajéscenen.','Hvordan arkitekturen åpner huset mot byen og elverommet.'],
      terms: ['kulturhus','residens','co_produksjon','nysirkus'],
      sources: ['https://www.baerumkulturhus.no/kulturhuset/om-oss/historien/','https://www.baerumkulturhus.no/kulturhuset/apningstider-kontakt/','https://www.baerumkulturhus.no/kulturhuset/ditt-besok/']
    }
  },
  {
    id: 'drammens_teater',
    name: 'Drammens Teater',
    aliases: ['Drammen Teater'],
    sourceFile: 'places/scenekunst/buskerud/drammens_teater.json',
    fylke: 'buskerud', kommune: 'Drammen', city: 'Drammen', municipalityNumber: '3301',
    street: 'Øvre Storgate', number: 12, expectedPostcode: '3018',
    year: 1870,
    period: 'Historisk teaterarkitektur, bybrann, gjenoppbygging og moderne arrangementsdrift',
    desc: 'Historisk teaterhus fra 1870, gjenoppbygd etter brannen i 1993 og gjenåpnet i 1997 med klassisk uttrykk og moderne sceneteknikk.',
    popupDesc: 'Drammens Teater ble tegnet av Emil Victor Langlet etter bybrannen på Bragernes i 1866 og åpnet 8. februar 1870. Teateret var inspirert av parisiske teaterhus og ble et av landets tidlige moderne teaterbygg. En påsatt brann ødela interiøret i 1993, men bygget ble gjenreist med utgangspunkt i de gjenværende ytterveggene og gjenåpnet nøyaktig 127 år etter den første åpningen, 8. februar 1997. Huset rommer i dag hovedscene og studioscene og brukes til teater, musikk, dans, revy og turnéproduksjoner.',
    tags: ['historisk_teater','langlet','bragernes','gjenoppbygging','hovedscene','scenearkitektur'],
    emne_ids: ['em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_regi_scenografi','em_scenekunst_publikum_fjerde_vegg'],
    physicalScope: 'Drammens Teaters hovedscene, studioscene, foajeer og publikumsfunksjoner med publikumsadresse Øvre Storgate 12. Administrasjonsadressen Øvre Torggate 17 representeres ikke som en separat scene.',
    quiz_profile: {
      place_type: 'historisk_teaterhus_og_arrangementsarena',
      subtype: 'langlet_teater_fra_1870_gjenoppbygd_i_1997',
      signature_features: ['åpnet 8. februar 1870','tegnet av Emil Victor Langlet','gjenoppbygd etter brannen i 1993 og åpnet igjen i 1997'],
      primary_angles: ['teaterarkitektur','byhistorie','gjenoppbygging','publikumsrom'],
      question_families: ['historisk_endring','arkitektur','sceneformater','kontrast'],
      avoid_angles: ['forveksle_publikumsadressen_med_administrasjonen','framstille_1997_bygget_som_helt_uavhengig_av_1870_huset'],
      must_include: ['sammenhengen mellom bybrannen i 1866 og åpningen i 1870','rekonstruksjonen etter brannen i 1993'],
      contrast_targets: ['fredrikshalds_teater','baerum_kulturhus'],
      notes: 'Spør om kontinuitet mellom historisk skall, rekonstruksjon og moderne scenedrift.'
    },
    knowledge: {
      one_liner: 'Drammens Teater bærer teaterhistorien fra 1870 videre gjennom en detaljert gjenoppbygging etter brannen i 1993.',
      why_it_matters: ['Huset er et tidlig eksempel på moderne norsk teaterarkitektur.','Gjenoppbyggingen viser hvordan en kulturbygning kan rekonstrueres og samtidig oppgraderes teknisk.'],
      what_to_notice: ['Den klassiske fasaden og salens losjestruktur.','Sporene etter Langlets historiske plan sammen med moderne sceneteknikk.','Forskjellen mellom hovedscenen og studioscenen.'],
      terms: ['teaterarkitektur','rekonstruksjon','losjeteater','sceneteknikk'],
      sources: ['https://www.drammensteater.no/historien-om-drammens-teater/','https://www.drammensteater.no/kontakt-oss/','https://www.drammensteater.no/ditt-besok/']
    }
  }
];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, value) { const file = abs(rel); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); }
function normalize(value) { return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function haversineMeters(a, b) { const rad = (v) => v * Math.PI / 180; const R = 6371000; const dLat = rad(b.lat-a.lat); const dLon = rad(b.lon-a.lon); const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }

async function exactAddress(venue) {
  const query = `${venue.street} ${venue.number} ${venue.city}`;
  const sourceUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(query)}&treffPerSide=100`;
  const response = await fetch(sourceUrl, { headers: { 'user-agent': 'History-Go-coordinate-audit/1.0' } });
  if (!response.ok) throw new Error(`${venue.id}: Geonorge HTTP ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload.adresser) ? payload.adresser : [];
  const exact = rows.filter((row) => String(row.kommunenummer) === venue.municipalityNumber && normalize(row.adressenavn) === normalize(venue.street) && Number(row.nummer) === Number(venue.number) && !String(row.bokstav ?? '').trim());
  if (exact.length !== 1) throw new Error(`${venue.id}: expected one exact Geonorge address, found ${exact.length}`);
  const hit = exact[0];
  if (venue.expectedPostcode && String(hit.postnummer) !== venue.expectedPostcode) throw new Error(`${venue.id}: expected postcode ${venue.expectedPostcode}, got ${hit.postnummer}`);
  const point = hit.representasjonspunkt;
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) throw new Error(`${venue.id}: invalid representation point`);
  return {
    query, sourceUrl,
    sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}`,
    lat: point.lat, lon: point.lon,
    address: { street: hit.adressenavn, number: String(hit.nummer), postcode: String(hit.postnummer), city: venue.city, country: 'NO' }
  };
}

function buildPlace(venue, coordinate) {
  return {
    id: venue.id, name: venue.name, aliases: venue.aliases,
    visual: { designCode: 'theatre_miniature' },
    lat: coordinate.lat, lon: coordinate.lon, r: 80,
    category: 'scenekunst', fylke: venue.fylke, kommune: venue.kommune,
    year: venue.year, period: venue.period, desc: venue.desc, popupDesc: venue.popupDesc,
    tags: venue.tags, emne_ids: venue.emne_ids, physicalScope: venue.physicalScope,
    quiz_profile: venue.quiz_profile, knowledge: venue.knowledge,
    coordType: 'address_point', coordStatus: 'verified', coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl, coordVerifiedAt: VERIFIED_DATE,
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${coordinate.address.street} ${coordinate.address.number}, ${venue.city}. Punktet representerer den fysisk avgrensede scenekunstfunksjonen og brukes som display-marker.`,
    locatorType: 'building', sourceProvider: 'official_address', sourceObjectId: coordinate.sourceObjectId,
    address: coordinate.address, geocodeAccuracy: 'rooftop', coordRole: 'display_marker',
    coLocationAudit: { status: 'reviewed', nearbyCanonicalIds: [], intentionalSharedAnchor: false, note: 'Ingen eksisterende canonical place-record deler det eksakte adressepunktet.' }
  };
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
  generatedAt: NOW, status: 'built_pending_validation', category: 'scenekunst', batch: 'new_venues_5', dependsOn: 'agent/scenekunst-venues-04 / PR #3296',
  addedPlaceIds: places.map((p) => p.id), sourceFiles: VENUES.map((v) => v.sourceFile),
  officialInstitutionSources: Object.fromEntries(VENUES.map((v) => [v.id, v.knowledge.sources])),
  coordinateResults, physicalScopeDecisions: Object.fromEntries(VENUES.map((v) => [v.id, v.physicalScope])),
  validation: { geonorgeExactAddressLookup: 'pass', overlapAudit: 'pass', placesIndexBuild: 'pending_workflow', placesChecks: 'pending_workflow', categoryAudit: 'pending_workflow' }
});
const md = ['# Scenekunst – nye hus, batch 5','',`Generert: ${NOW}`,'','## Nye steder','',...places.map((p)=>`- \`${p.id}\` – ${p.name}`),'','## Koordinater','',...coordinateResults.flatMap((row)=>[`### \`${row.id}\``,'',`- Adresse: ${row.address.street} ${row.address.number}, ${row.address.postcode} ${row.address.city}`,`- Geonorge-objekt: \`${row.sourceObjectId}\``,`- Punkt: ${row.coordinate.lat}, ${row.coordinate.lon}`,'- Overlap: no_overlap','']),'## Fysisk scope','',...VENUES.map((v)=>`- \`${v.id}\`: ${v.physicalScope}`),''];
fs.writeFileSync(abs(REPORT_MD), md.join('\n'), 'utf8');
console.log(`Added ${places.length} Scenekunst venues:`);
for (const place of places) console.log(`- ${place.id}: ${place.lat}, ${place.lon}`);
