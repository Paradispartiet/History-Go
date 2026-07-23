#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_DATE = '2026-07-23';
const NOW = new Date().toISOString();
const MANIFEST_PATH = 'data/places/manifest.json';
const GLOBAL_INDEX_PATH = 'data/places/places_index.json';
const REPORT_JSON = 'reports/scenekunst-new-venues-batch-4-2026-07-23.json';
const REPORT_MD = 'reports/scenekunst-new-venues-batch-4-2026-07-23.md';

const VENUES = [
  {
    id: 'rosendal_teater',
    name: 'Rosendal Teater',
    aliases: ['Teaterhuset Avant Garden', 'TAG'],
    sourceFile: 'places/scenekunst/trondelag/rosendal_teater.json',
    fylke: 'trondelag', kommune: 'Trondheim', city: 'Trondheim', municipalityNumber: '5001',
    street: 'Innherredsveien', number: 73, expectedPostcode: '7068',
    year: 2019,
    period: 'Fri scenekunst, performance og transformert kinobygg',
    desc: 'Trondheims hus for fri scenekunst, performance og dans, åpnet som Rosendal Teater i 2019.',
    popupDesc: 'Rosendal Teater viderefører Teaterhuset Avant Garden, etablert i 1984. Institusjonen flyttet våren 2019 til det tidligere Rosendal kino-anlegget i Innherredsveien 73 og åpnet huset i august samme år. Bygget rommer to fleksible scener, prøvesal, kafé og møtearealer. Stedet viser hvordan et tidligere kinobygg kan bli et produksjons- og visningshus for lokal, nasjonal og internasjonal fri scenekunst.',
    tags: ['fri_scenekunst','performance','dans','trondheim','transformert_kinobygg','internasjonal_scenekunst'],
    physicalScope: 'Hele Rosendal Teaters scene-, prøve-, publikums- og kaféfunksjoner i Innherredsveien 73. Eksterne prosjekter i nabolag og region inngår ikke i samme markør.',
    quiz_profile: {
      place_type: 'programmerende_og_samproduserende_scenekunsthus',
      subtype: 'fri_scenekunst_i_transformert_kinobygg',
      signature_features: ['røtter i Teaterhuset Avant Garden fra 1984','flyttet til Rosendal i 2019','to fleksible scener og prøvesal'],
      primary_angles: ['fri_scenekunst','institusjonshistorie','bygningsgjenbruk','publikumsrom'],
      question_families: ['historisk_endring','institusjon','sceneformater','kontrast'],
      avoid_angles: ['framstille_huset_som_repertoarteater_med_fast_ensemble','blande_eksterne_nabolagsprosjekter_med_bygget'],
      must_include: ['overgangen fra Teaterhuset Avant Garden til Rosendal Teater','rollen som regional motor for fri scenekunst'],
      contrast_targets: ['trondelag_teater','tou'],
      notes: 'Spør som programmerende og samproduserende hus, ikke som tradisjonelt institusjonsteater.'
    },
    knowledge: {
      one_liner: 'Rosendal Teater gjør et tidligere kinobygg til et åpent hus for eksperimentell og fri scenekunst.',
      why_it_matters: ['Huset viderefører en fri scenekunstinstitusjon med røtter tilbake til 1984.','Flyttingen i 2019 ga Trondheim et større produksjons- og visningshus for performance, teater og dans.'],
      what_to_notice: ['De fleksible salene og forholdet mellom gammel og ny bygningsdel.','Kaféen som sosialt møtested i tillegg til forestillingsrommene.','At huset både presenterer og samproduserer kunst.'],
      terms: ['fri_scenekunst','samproduksjon','performance','programmerende_hus'],
      sources: ['https://rosendalteater.no/om/organisering','https://rosendalteater.no/om/hva-er-rosendal-teater','https://rosendalteater.no/om/kontakt']
    }
  },
  {
    id: 'cornerteateret',
    name: 'Cornerteateret',
    aliases: ['Cornerteateret Bergen'],
    sourceFile: 'places/scenekunst/vestland/cornerteateret.json',
    fylke: 'vestland', kommune: 'Bergen', city: 'Bergen', municipalityNumber: '4601',
    street: 'Kong Christian Frederiks plass', number: 4, expectedPostcode: '5006',
    year: 2013,
    period: 'Fri scenekunst, barne- og ungdomsteater og verftsindustriens bygningsarv',
    desc: 'Teaterhus for frie profesjonelle og barne- og ungdomsteater i et bevart tidligere verkstedbygg på Møhlenpris.',
    popupDesc: 'Cornerteateret åpnet 7. september 2013 etter at et mer enn 130 år gammelt verkstedbygg fra verftsindustrien på Marineholmen ble rehabilitert. Huset drives som et samarbeid mellom Proscen og Vestlandske Teatersenter og ble etablert som svar på mangel på arenaer for den frie scenekunsten i Bergen. Kongesalen, Søylesalen og øvrige rom brukes til profesjonell scenekunst, barne- og ungdomsteater, prøver, kurs og lokale arrangementer.',
    tags: ['fri_scenekunst','barne_og_ungdomsteater','bergen','mohlenpris','verftsindustri','bygningsvern'],
    physicalScope: 'Cornerteaterets saler, prøve- og publikumsarealer i bygget på Kong Christian Frederiks plass 4. Utescenen Cornerhagen inngår som sesongfunksjon ved samme hus.',
    quiz_profile: {
      place_type: 'teaterhus_for_det_frie_feltet',
      subtype: 'rehabilitert_verftverksted_med_profesjonell_og_ung_scenekunst',
      signature_features: ['åpnet som teaterhus i 2013','tidligere maskinverksted fra verftsindustrien','samarbeid mellom Proscen og Vestlandske Teatersenter'],
      primary_angles: ['fri_scenekunst','barne_og_ungdomsteater','industrigjenbruk','lokalt_kulturhus'],
      question_families: ['historisk_endring','institusjon','arkitektur','publikum'],
      avoid_angles: ['framstille_huset_som_ett_fast_kompani','blande_marineholmen_omradet_med_selv_teaterbygget'],
      must_include: ['arenamangel som bakgrunn for etableringen','bevaringen av verkstedbyggets historie'],
      contrast_targets: ['rosendal_teater','det_vestnorske_teateret'],
      notes: 'Spør som delt infrastruktur for frie grupper og unge utøvere.'
    },
    knowledge: {
      one_liner: 'Cornerteateret lar Bergens frie scenekunst virke i det siste bevarte verkstedbygget fra Marineholmens verftsindustri.',
      why_it_matters: ['Huset gir produksjons- og visningsrom til aktører som ikke har egne scener.','Rehabiliteringen viser hvordan industriarkitektur kan bevares gjennom ny kulturbruk.'],
      what_to_notice: ['Trebyggets opprinnelige konstruksjoner og verkstedpreg.','Forskjellen mellom Kongesalen, Søylesalen og mindre rom.','Kombinasjonen av profesjonell scenekunst og barne- og ungdomsteater.'],
      terms: ['fri_scenekunst','produksjonshus','industrigjenbruk','barne_og_ungdomsteater'],
      sources: ['https://www.cornerteateret.no/','https://www.cornerteateret.no/husets-historie','https://www.cornerteateret.no/samarbeidspartnere']
    }
  },
  {
    id: 'tou',
    name: 'Tou',
    aliases: ['Tou Scene','Tou kulturhus'],
    sourceFile: 'places/scenekunst/rogaland/tou.json',
    fylke: 'rogaland', kommune: 'Stavanger', city: 'Stavanger', municipalityNumber: '1103',
    street: 'Kvitsøygata', number: 25, expectedPostcode: '4014',
    year: 2001,
    period: 'Uavhengig kulturinstitusjon og kunstproduksjon i tidligere bryggeri',
    desc: 'Stort uavhengig produksjons- og visningshus for scenekunst, musikk, film og visuell kunst i det tidligere Tou-bryggeriet.',
    popupDesc: 'Tou Scene AS ble dannet i 2001 av kunstnere og lokale ressurspersoner som del av transformasjonen av Stavanger Øst. Det tidligere bryggerikomplekset rommer i dag mer enn 13 000 kvadratmeter med scener, produksjonsrom, atelierer, verksteder og arbeidsplasser. Tou presenterer et egenkuratert program og legger samtidig til rette for hundrevis av profesjonelle kunstnere og organisasjoner. Stedet viser hvordan et forlatt industrikompleks kan bli en motor for det frie kunstfeltet.',
    tags: ['fri_scenekunst','produksjonshus','stavanger_ost','bryggeri','industrigjenbruk','tverrkunstnerisk'],
    physicalScope: 'Tou-kompleksets scener, produksjonsrom og publikumsfunksjoner i Kvitsøygata 25. Recorden representerer kulturinstitusjonen i det tidligere bryggeriet, ikke hele Stavanger Øst.',
    quiz_profile: {
      place_type: 'tverrkunstnerisk_produksjons_og_visningshus',
      subtype: 'kunstnerdrevet_kulturinstitusjon_i_tidligere_bryggeri',
      signature_features: ['Tou Scene AS dannet i 2001','over 13 000 kvadratmeter kulturproduksjon','tidligere bryggerikompleks i Stavanger Øst'],
      primary_angles: ['fri_scenekunst','tverrkunstnerisk_produksjon','bytransformasjon','kunstnerdrevet_institusjon'],
      question_families: ['historisk_endring','institusjon','byutvikling','sceneformater'],
      avoid_angles: ['redusere_huset_til_konsertscene','blande_bryggerihistorien_med_dagens_drift'],
      must_include: ['kunstnerinitiativet rundt 2001','forholdet mellom produksjonsrom og offentlig program'],
      contrast_targets: ['rogaland_teater','rosendal_teater'],
      notes: 'Spør tverrkunstnerisk, men med tydelig scenekunstfunksjon.'
    },
    knowledge: {
      one_liner: 'Tou gjør et tidligere bryggeri til en stor, kunstnerdrevet infrastruktur for produksjon og publikum.',
      why_it_matters: ['Huset er en sentral institusjon for det frie kunstfeltet i Rogaland.','Gjenbruken av bryggeriet knytter kulturproduksjon til transformasjonen av Stavanger Øst.'],
      what_to_notice: ['Industribyggenes skala og spor etter bryggeridriften.','De mange forskjellige scenene og produksjonsrommene.','At store deler av huset brukes til arbeid og utvikling, ikke bare forestillinger.'],
      terms: ['produksjonshus','fri_scenekunst','kunstnerdrevet','industrigjenbruk'],
      sources: ['https://www.touofficial.com/om-tou/','https://www.touofficial.com/kontakt/']
    }
  },
  {
    id: 'bruddet_fjaereheia',
    name: 'Bruddet Fjæreheia',
    aliases: ['Fjæreheia Amfi','Bruddet i Fjæreheia'],
    sourceFile: 'places/scenekunst/agder/bruddet_fjaereheia.json',
    fylke: 'agder', kommune: 'Grimstad', city: 'Grimstad', municipalityNumber: '4202',
    street: 'Tauleveien', number: 35, expectedPostcode: null,
    year: 1999,
    period: 'Utendørs scenekunst i tidligere granittbrudd',
    desc: 'Spektakulær utendørsscene med amfi og høy granittvegg i et tidligere steinbrudd utenfor Grimstad.',
    popupDesc: 'Agder Teater kjøpte steinbruddet i Fjæreheia i 1995, og tribuneanlegget med rundt 1000 plasser sto ferdig i 1999. Den høye granittveggen gir stedet en særpreget akustikk og monumental ramme for teater, musikal, konserter og offentlige arrangementer. Grimstad kommune overtok anlegget i 2023 og har videreført det gjennom et kommunalt eid selskap. Stedet viser hvordan et industrielt landskap kan bli en scenografi i seg selv.',
    tags: ['utendorsscene','amfi','granittbrudd','grimstad','henrik_ibsen','stedsspesifikk_scenekunst'],
    physicalScope: 'Amfiet, sceneområdet og publikumsfunksjonene i det tidligere granittbruddet ved Tauleveien 35. Turterrenget Fjæreheia rundt scenen inngår ikke i samme markør.',
    quiz_profile: {
      place_type: 'utendors_amfiscene',
      subtype: 'tidligere_granittbrudd_brukt_som_monumental_scenografi',
      signature_features: ['steinbrudd kjøpt til teaterbruk i 1995','tribuneanlegg ferdig i 1999','granittvegg som akustisk og visuell ramme'],
      primary_angles: ['stedsspesifikk_scenekunst','landskap','teaterarkitektur','industrigjenbruk'],
      question_families: ['historisk_endring','arkitektur','publikum','kontrast'],
      avoid_angles: ['blande_turomradet_med_amfiet','framstille_stedet_som_innendors_teater'],
      must_include: ['steinbruddets transformasjon','eierskiftet til Grimstad kommune i 2023'],
      contrast_targets: ['kilden_teater_konserthus_kristiansand','fredrikshalds_teater'],
      notes: 'Spør om landskapet som aktiv del av iscenesettelsen.'
    },
    knowledge: {
      one_liner: 'Bruddet Fjæreheia bruker selve granittbruddet som vegg, akustisk rom og scenografi.',
      why_it_matters: ['Stedet er et sjeldent norsk eksempel på permanent utendørsscene i et industrilandskap.','Scenen kobler Grimstads Ibsen-tradisjon til moderne teater- og konsertproduksjon.'],
      what_to_notice: ['Den høye granittveggen bak scenen.','Hvordan amfiet vender publikum inn mot bruddet.','At vær, dagslys og naturlyd påvirker forestillingene.'],
      terms: ['utendorsscene','amfi','stedsspesifikk_scenekunst','naturlig_akustikk'],
      sources: ['https://www.grimstad.kommune.no/tjenester/kultur-idrett-og-fritid/fjareheia-amfi/','https://www.visitnorway.no/listings/fj%C3%A6reheia-amfi/21950/']
    }
  },
  {
    id: 'teateret_kristiansand',
    name: 'Teateret Kristiansand',
    aliases: ['Teateret','Teateret Live'],
    sourceFile: 'places/scenekunst/agder/teateret_kristiansand.json',
    fylke: 'agder', kommune: 'Kristiansand', city: 'Kristiansand', municipalityNumber: '4204',
    street: 'Kongens gate', number: 2, expectedPostcode: '4610',
    year: null,
    period: 'Flerbruksscene, teater, show og publikumsarena i Kristiansand sentrum',
    desc: 'Privat scene- og arrangementsarena med hovedscene, biscene og intimscene i Kongens gate 2.',
    popupDesc: 'Teateret Kristiansand er et flerromshus med hovedscene, biscene, intimscene, foajé, restaurant og bar. Programmet omfatter teater, impro, revy, standup, konserter, foredrag og familieforestillinger. Hovedscenen har fast amfi og stor sceneflate, mens de mindre rommene gir andre publikumsforhold. Stedet viser hvordan et etablert teaterbygg kan drives som fleksibel, privat kultur- og arrangementsarena.',
    tags: ['fler_scenehus','teater','revy','standup','kristiansand','privat_kulturarena'],
    physicalScope: 'Hovedscene, biscene, intimscene, foajé og publikumsfunksjoner i Kongens gate 2. Eksterne arrangementer utenfor bygget inngår ikke.',
    quiz_profile: {
      place_type: 'privat_flerbruksscene',
      subtype: 'fler_scenehus_med_teater_show_og_servering',
      signature_features: ['hovedscene med fast amfi','egen biscene og intimscene','kombinerer scenekunst med restaurant og arrangement'],
      primary_angles: ['sceneformater','publikumsopplevelse','privat_kulturdrift','programbredde'],
      question_families: ['sceneformater','institusjon','publikum','kontrast'],
      avoid_angles: ['forveksle_med_kilden','framstille_huset_som_fast_offentlig_repertoarteater'],
      must_include: ['forskjellen mellom hovedscene, biscene og intimscene','rollen som fleksibel arrangementsarena'],
      contrast_targets: ['kilden_teater_konserthus_kristiansand','bruddet_fjaereheia'],
      notes: 'Spør som privat flerbrukshus, ikke som offentlig produserende regionteater.'
    },
    knowledge: {
      one_liner: 'Teateret Kristiansand samler store og små scener, servering og publikumsarrangementer i ett sentralt hus.',
      why_it_matters: ['Huset gir plass til teaterformer og underholdning som ikke alltid inngår i institusjonsteatrenes repertoar.','Flere salstørrelser gjør det mulig å variere nærheten mellom scene og publikum.'],
      what_to_notice: ['Hovedscenens faste amfi og store gulvflate.','Biscenens og intimscenens mindre publikumsskala.','Sammenhengen mellom scene, foajé, restaurant og bar.'],
      terms: ['flerbruksscene','intimscene','amfi','privat_kulturdrift'],
      sources: ['https://www.teateret.no/','https://www.teateret.no/kontakt-oss','https://www.teateret.no/lokaler/hovedscenegulvet','https://www.teateret.no/lokaler/biscenen','https://www.teateret.no/lokaler/intimscenen']
    }
  }
];

const EMNE_IDS = ['em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_dramaturgi_iscenesettelse','em_scenekunst_publikum_fjerde_vegg'];
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
  const place = {
    id: venue.id, name: venue.name, aliases: venue.aliases,
    visual: { designCode: 'theatre_miniature' },
    lat: coordinate.lat, lon: coordinate.lon, r: 80,
    category: 'scenekunst', fylke: venue.fylke, kommune: venue.kommune,
    period: venue.period, desc: venue.desc, popupDesc: venue.popupDesc,
    tags: venue.tags, emne_ids: EMNE_IDS, physicalScope: venue.physicalScope,
    quiz_profile: venue.quiz_profile, knowledge: venue.knowledge,
    coordType: 'address_point', coordStatus: 'verified', coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: coordinate.sourceUrl, coordVerifiedAt: VERIFIED_DATE,
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${coordinate.address.street} ${coordinate.address.number}, ${venue.city}. Punktet representerer den fysisk avgrensede scenekunstfunksjonen og brukes som display-marker.`,
    locatorType: 'building', sourceProvider: 'official_address', sourceObjectId: coordinate.sourceObjectId,
    address: coordinate.address, geocodeAccuracy: 'rooftop', coordRole: 'display_marker',
    coLocationAudit: { status: 'reviewed', nearbyCanonicalIds: [], intentionalSharedAnchor: false, note: 'Ingen eksisterende canonical place-record deler det eksakte adressepunktet.' }
  };
  if (Number.isInteger(venue.year)) place.year = venue.year;
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
  generatedAt: NOW, status: 'built_pending_validation', category: 'scenekunst', batch: 'new_venues_4', dependsOn: 'agent/scenekunst-national-venues-03 / PR #3252',
  addedPlaceIds: places.map((p) => p.id), sourceFiles: VENUES.map((v) => v.sourceFile),
  officialInstitutionSources: Object.fromEntries(VENUES.map((v) => [v.id, v.knowledge.sources])),
  coordinateResults, physicalScopeDecisions: Object.fromEntries(VENUES.map((v) => [v.id, v.physicalScope])),
  validation: { geonorgeExactAddressLookup: 'pass', overlapAudit: 'pass', placesIndexBuild: 'pending_workflow', placesChecks: 'pending_workflow', categoryAudit: 'pending_workflow' }
});
const md = ['# Scenekunst – nye hus, batch 4','',`Generert: ${NOW}`,'','## Nye steder','',...places.map((p)=>`- \`${p.id}\` – ${p.name}`),'','## Koordinater','',...coordinateResults.flatMap((row)=>[`### \`${row.id}\``,'',`- Adresse: ${row.address.street} ${row.address.number}, ${row.address.postcode} ${row.address.city}`,`- Geonorge-objekt: \`${row.sourceObjectId}\``,`- Punkt: ${row.coordinate.lat}, ${row.coordinate.lon}`,'- Overlap: no_overlap','']),'## Fysisk scope','',...VENUES.map((v)=>`- \`${v.id}\`: ${v.physicalScope}`),''];
fs.writeFileSync(abs(REPORT_MD), md.join('\n'), 'utf8');
console.log(`Added ${places.length} Scenekunst venues:`);
for (const place of places) console.log(`- ${place.id}: ${place.lat}, ${place.lon}`);
