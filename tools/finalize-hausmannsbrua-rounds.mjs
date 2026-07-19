import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const upsert = (rows, value) => {
  const index = rows.findIndex((row) => row?.id === value.id);
  if (index >= 0) rows[index] = value;
  else rows.push(value);
};

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsbrua.json';
const evidencePath = 'data/coordinate-evidence/oslo/natur/hausmannsbrua.json';
const place = read(placePath);
const evidence = read(evidencePath);
if (place.id !== 'hausmannsbrua' || evidence.placeId !== place.id) throw new Error('Hausmannsbrua identity mismatch');
for (const key of ['lat', 'lon', 'r']) {
  if (place[key] !== evidence.currentCoordinate[key]) throw new Error(`Coordinate field changed before content pass: ${key}`);
}

const sources = [
  { type: 'reference', label: 'Store norske leksikon – Hausmanns bru', url: 'https://snl.no/Hausmanns_bru', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Oslo byleksikon – Hausmanns bru', url: 'https://oslobyleksikon.no/side/Hausmanns_bru', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Oslo byleksikon – Hausmanns gate', url: 'https://oslobyleksikon.no/side/Hausmanns_gate', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Store norske leksikon – Caspar Herman Hausmann', url: 'https://snl.no/Caspar_Herman_Hausmann', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Oslo byleksikon – Prinds Christian Augusts Minde', url: 'https://oslobyleksikon.no/side/Prinds_Christian_Augusts_Minde', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Lokalhistoriewiki – Hausmanns bru', url: 'https://lokalhistoriewiki.no/Hausmanns_bru', lang: 'nb', verifiedAt: '2026-07-19' }
];

Object.assign(place, {
  year: 1892,
  desc: 'Støpejernsbro over Akerselva, ferdig i 1892, utvidet i 1986 med det gamle rekkverket bevart og senere tatt inn i nasjonal verneplan.',
  popupDesc: 'Hausmannsbrua fører Hausmanns gate over Akerselva. Broen ble bygd 1890–92 av Christiania kommunale Veivesen ved ingeniør P. Schaaning og stod ferdig i 1892. Konstruksjonen er en buebro og fagverkskonstruksjon bygd av støpejernsdeler, 28 meter lang med et hovedspenn på 16 meter.\n\nI 1986 ble broen utvidet til seks kjørefelt. Oslo byleksikon oppgir at de gamle buekonstruksjonene ble kopiert, mens smijernsrekkverket fra den gamle broen ble beholdt. Dermed er dagens bro både en senere trafikktilpasning og et fysisk møte med 1800-tallets konstruksjonsspråk. Broen er tatt med i nasjonal verneplan for veger, bruer og vegrelaterte kulturminner.\n\nNavnet kommer via Hausmanns gate fra generalløytnant og legatstifter Fredrik Ferdinand Hausmann (1693–1757), som eide Ankerløkken og landstedet som senere ble Prinds Christian Augusts Minde. Han var ikke brobyggeren; forbindelsen til broen er navneopphavet.',
  tags: ['akerselva','bro','stopejern','buebro','fagverk','infrastruktur','1892','1986','kulturminne','vern','hausmanns_gate','fredrik_ferdinand_hausmann'],
  emne_ids: ['em_by_infrastruktur_mobilitet','em_by_historiske_lag_i_hverdagsrom','em_by_barrierer_forbindelser'],
  quiz_profile: {
    place_type: 'historisk veibro',
    subtype: 'stopejerns_buebro_med_bevart_1892_lag',
    signature_features: ['ferdig i 1892','støpejerns bue- og fagverkskonstruksjon','28 meter lang med 16 meter hovedspenn','utvidet til seks kjørefelt i 1986','gammelt smijernsrekkverk bevart','inngår i nasjonal verneplan'],
    primary_angles: ['brokonstruksjon','infrastrukturhistorie','ombygging_og_bevaring','navneopprinnelse','akerselva_som_barriere_og_forbindelse'],
    question_families: ['historisk_endring','teknisk_fysisk','person_og_navneopprinnelse','vern','for_na','kildekritikk'],
    avoid_angles: ['late_som_fredrik_ferdinand_hausmann_bygde_broen','identifisere_p_schaaning_med_fullt_navn_uten_direkte_kilde','bruke_dampveivals_anekdoten_som_hardfakta','generisk_brosporsmal'],
    must_include: ['1892','støpejern','28 meter','16 meter','1986','bevart rekkverk','nasjonal verneplan'],
    contrast_targets: ['ankerbrua','nybrua','beierbrua'],
    notes: 'Skill mellom navneopphav og byggansvar: Fredrik Ferdinand Hausmann er namesake; kildene oppgir kun ingeniør P. Schaaning som ansvarlig for oppføringen.'
  },
  externalLinks: sources,
  underbadge_ids: ['infrastruktur','monumenter_og_landemerker','byplanlegging'],
  works: [
    { id: 'hausmannsbrua_original_1892', title: 'Hausmannsbrua 1892', type: 'bro', kind: 'cast_iron_arch_bridge', year: 1892, desc: 'Den opprinnelige broen stod ferdig i 1892 etter bygging 1890–92.', why_here: 'Selve brostedet er verket.' },
    { id: 'hausmannsbrua_stopejerns_fagverk', title: 'Støpejerns fagverkskonstruksjon', type: 'konstruksjon', kind: 'cast_iron_truss_arch', year: 1892, desc: 'Broen er bygd av støpejernsdeler i en fagverkskonstruksjon og klassifiseres som buebro.', why_here: 'Konstruksjonsmåten er et av broens viktigste fysiske særtrekk.' },
    { id: 'hausmannsbrua_hovedspenn_16m', title: 'Hovedspennet på 16 meter', type: 'ingeniordetalj', kind: 'main_span', year: 1892, desc: 'Det lengste spennet er 16 meter, innenfor en total brolengde på 28 meter.', why_here: 'Målene gjør broens tekniske skala konkret.' },
    { id: 'hausmannsbrua_rekkverk_1892', title: 'Det gamle smijernsrekkverket', type: 'bygningsdetalj', kind: 'historic_railing', year: 1892, desc: 'Smijernsrekkverket fra den gamle broen ble bevart ved utvidelsen i 1986.', why_here: 'Rekkverket er et synlig fysisk lag fra den eldre broen.' },
    { id: 'hausmannsbrua_utvidelse_1986', title: 'Utvidelsen i 1986', type: 'ombygging', kind: 'bridge_widening', year: 1986, desc: 'Broen ble utvidet til seks kjørefelt; gamle buekonstruksjoner ble kopiert og rekkverket bevart.', why_here: 'Ombyggingen forklarer hvorfor dagens bro både ser historisk ut og har en senere trafikkbredde.' },
    { id: 'hausmannsbrua_bla_skilt', title: 'Oslo Byes Vels blå skilt', type: 'historieformidling', kind: 'heritage_plaque', year: null, desc: 'Et blått skilt ved gangveien under broen markerer stedet og historien.', why_here: 'Skiltet gjør brohistorien lesbar fra elverommet under kjørebanen.' },
    { id: 'hausmannsbrua_nasjonal_verneplan', title: 'Nasjonal verneplan', type: 'vern', kind: 'protected_road_heritage', year: null, desc: 'Hausmannsbrua er tatt med i nasjonal verneplan for veger, bruer og vegrelaterte kulturminner.', why_here: 'Vernestatusen viser at broen vurderes som mer enn bare daglig infrastruktur.' }
  ],
  civication_store: [
    { id: 'hausmannsbrua_stopejerns_bue_model', title: 'Støpejernsbuen', type: 'brodetaljmodell', kind: 'physical_object', desc: 'En miniatyr av broens støpejerns bue- og fagverksform.', placeSpecificReason: 'Konstruksjonen er dokumentert som Hausmannsbruas tekniske hovedtrekk.', historicalFunction: 'Viser hvordan 1800-tallets brobygging løste spenn over Akerselva.', physicalObject: true, placeSpecific: true, storePrice: 38, currency: 'PC', collection: 'hausmannsbrua_jern_og_vern', collectable: true, source_urls: [sources[0].url] },
    { id: 'hausmannsbrua_rekkverk_pin', title: 'Det bevarte rekkverket', type: 'rekkverkspin', kind: 'physical_object', desc: 'En pin basert på smijernsrekkverket som ble bevart i 1986.', placeSpecificReason: 'Rekkverket er et konkret gammelt lag som fortsatt finnes på broen.', historicalFunction: 'Representerer bevaring gjennom ombygging.', physicalObject: true, placeSpecific: true, storePrice: 24, currency: 'PC', collection: 'hausmannsbrua_jern_og_vern', collectable: true, source_urls: [sources[1].url] },
    { id: 'hausmannsbrua_1892_1986_foldout', title: '1892 ↔ 1986', type: 'foldoutkort', kind: 'physical_object', desc: 'Et før/nå-kort som sammenligner originalbroen med utvidelsen.', placeSpecificReason: 'Hausmannsbrua har et tydelig dokumentert ombyggingspunkt i 1986.', historicalFunction: 'Gjør lagdelingen mellom original konstruksjon og senere trafikktilpasning konkret.', physicalObject: true, placeSpecific: true, storePrice: 30, currency: 'PC', collection: 'hausmannsbrua_jern_og_vern', collectable: true, source_urls: [sources[0].url, sources[1].url] },
    { id: 'hausmannsbrua_bla_skilt_miniplate', title: 'Det blå skiltet', type: 'miniplate', kind: 'physical_object', desc: 'En liten plate inspirert av Oslo Byes Vels blå skilt ved broen.', placeSpecificReason: 'Skiltet står ved gangveien under Hausmannsbrua.', historicalFunction: 'Representerer lokal historieformidling i det offentlige rom.', physicalObject: true, placeSpecific: true, storePrice: 20, currency: 'PC', collection: 'hausmannsbrua_jern_og_vern', collectable: true, source_urls: [sources[1].url] },
    { id: 'hausmannsbrua_teknisk_kort', title: '28 m / 16 m', type: 'teknisk_samlekort', kind: 'physical_object', desc: 'Et teknisk kort med broens totalmål og hovedspenn.', placeSpecificReason: '28 meter total lengde og 16 meter hovedspenn er dokumenterte mål for Hausmannsbrua.', historicalFunction: 'Gjør konstruksjonens skala lesbar som ingeniørdata.', physicalObject: true, placeSpecific: true, storePrice: 18, currency: 'PC', collection: 'hausmannsbrua_jern_og_vern', collectable: true, source_urls: [sources[0].url] }
  ],
  brands: [
    { id: 'christiania_kommunale_veivesen_hausmann', name: 'Christiania kommunale Veivesen', brand_kind: 'historical_public_authority', brand_type: 'bridge_builder' },
    { id: 'oslo_kommune_hausmannsbrua', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'road_and_bridge_context' },
    { id: 'statens_vegvesen_verneplan_hausmann', name: 'Nasjonal verneplan for veger, bruer og vegrelaterte kulturminner', brand_kind: 'heritage_program', brand_type: 'preservation' },
    { id: 'oslo_byes_vel_hausmann', name: 'Oslo Byes Vel', brand_kind: 'heritage_organization', brand_type: 'blue_plaque' },
    { id: 'hausmanns_gate_context', name: 'Hausmanns gate', brand_kind: 'urban_context', brand_type: 'street_connection' }
  ],
  for_na: {
    title: 'Fra smal 1892-bro til bred byforbindelse',
    before: 'I 1892 stod en ny støpejerns buebro ferdig over Akerselva. Den var del av den kommunale veibyggingen i en by som vokste raskt og trengte sterkere, mer moderne forbindelser over elva.',
    now: 'Dagens bro er bredere etter utvidelsen i 1986, men viktige historiske trekk ble bevart eller kopiert. Det gamle smijernsrekkverket gjør 1892-laget synlig også i dagens trafikklandskap.',
    change: 'Broen gikk fra 1800-tallets kommunale ingeniørverk til en senere seksfelts trafikktilpasning, men ombyggingen ble gjort med bevarte historiske detaljer. Derfor er stedet et godt eksempel på at infrastruktur kan endres uten at alle eldre lag forsvinner.',
    look_for: ['smijernsrekkverket','bueformen under kjørebanen','støpejernsdetaljene','broens bredde sammenlignet med elveløpet','gangveien under broen','det blå skiltet','møtet mellom historisk konstruksjon og moderne trafikk','Akerselva som fysisk barriere broen overvinner']
  },
  nature_profile: {
    type: 'Akerselva / brospenn / urban elvekorridor',
    title: 'Elva under konstruksjonen',
    summary: 'Nature-rundingen ved Hausmannsbrua handler om hvordan en bro endrer måten vi opplever en elv på. Akerselva er både et sammenhengende blågrønt landskap og en fysisk barriere i byen. Fra gangveien under og rundt broen kan man lese forskjellen mellom vannets åpne bevegelse og den tunge konstruksjonen som spenner over det. Broen konsentrerer trafikk og skaper skygge, lyd og et tydelig romskifte langs elveløpet, mens gangforbindelsen under broen lar den langsgående elveruten fortsette. Rundingen skal fokusere på observerbare forhold som strømretning, spenn, bredde, nivåforskjell, skygge og hvordan brokarene møter elvekanten. Den skal ikke dikte opp arter eller hevde økologiske effekter som ikke er dokumentert for akkurat denne broen.',
    themes: ['Akerselva som forbindelse og barriere','brospenn og elvebredde','skygge og rom under broen','ganglinje langs elva','urban elvekorridor','infrastruktur i blågrønt landskap','nivåforskjeller','vannets bevegelse under fast konstruksjon'],
    nearby_place_ids: ['nybrua_vaterlandsparken','ankerbrua','elvestrekning_bla_brenneriveien']
  },
  research_notes: [
    { id: 'hausmannsbrua_p_schaaning_identity', claim: 'Kildene oppgir byggansvarlig som ingeniør P. Schaaning. Full identitet er ikke skrevet inn som canonical person uten direkte eksplisitt kildebelegg.', status: 'needs_primary_source_check', use_in_app: false, next_source_needed: 'Kommunalt arkiv, ingeniørmatrikkel eller annen primærkilde som eksplisitt kobler fullt navn til Hausmannsbrua.' },
    { id: 'hausmannsbrua_dampveivals_anekdote', claim: 'Akerselvas Venner omtaler en dampveivals som bakgrunn for brobyggingen, men anekdoten er ikke brukt som canonical hardfakta i denne batchen.', status: 'secondary_source_holdback', use_in_app: false, next_source_needed: 'Kommunal samtidig kilde eller verneplandokument.' },
    { id: 'hausmannsbrua_jernbanebru_claim', claim: 'Lokalhistoriewiki omtaler den opprinnelige broen som jernbanebru, mens SNL og Oslo byleksikon ikke gjør dette. Påstanden holdes derfor ute av canonical tekst.', status: 'source_conflict', use_in_app: false, next_source_needed: 'Primær eller autoritativ teknisk verneplankilde.' }
  ],
  source_summary: {
    safe_sources: sources.map((source) => source.label),
    resolved_research: ['Ferdigstillelse i 1892 er kildebelagt.','Bygging 1890–92 og Christiania kommunale Veivesen ved ingeniør P. Schaaning er kildebelagt.','Tekniske hoveddata, utvidelsen i 1986, bevart rekkverk og nasjonal verneplan er kildebelagt.','Fredrik Ferdinand Hausmann er dokumentert som navneopphav, ikke som brobygger.'],
    remaining_holdbacks: ['Full identitet bak «P. Schaaning».','Dampveivals-anekdoten.','Påstanden om opprinnelig jernbanebru.']
  }
});
write(placePath, place);

const personPath = 'data/people/historie/oslo/akerselva/fredrik_ferdinand_hausmann.json';
const person = {
  id: 'fredrik_ferdinand_hausmann',
  name: 'Fredrik Ferdinand Hausmann',
  initials: 'FFH',
  desc: 'Generalløytnant og legatstifter som ga navn til Hausmanns gate og dermed indirekte til Hausmannsbrua.',
  tags: ['historie','oslo','hausmanns_gate','navneopprinnelse'],
  placeId: 'prinds_christian_augusts_minde',
  category: 'historie',
  year: 1732,
  popupDesc: 'Fredrik Ferdinand Hausmann (1693–1757) var generalløytnant og eide Mangelsgården og Ankerløkken, området Hausmanns gate senere ble lagt gjennom. Gaten fikk navn etter ham, og Hausmannsbrua har igjen navn etter gaten. Forbindelsen til broen er derfor navneopprinnelse, ikke at han bygde eller opplevde broen fra 1892.',
  places: ['prinds_christian_augusts_minde','hausmannsbrua'],
  image: '',
  cardImage: '',
  emne_ids: ['em_by_historiske_lag_i_hverdagsrom'],
  source_urls: [sources[0].url, sources[2].url, sources[3].url, sources[4].url]
};
// Fail closed on existing canonical ID or exact name.
for (const dirent of fs.readdirSync('data/people', { recursive: true, withFileTypes: true })) {
  if (!dirent.isFile() || !dirent.name.endsWith('.json')) continue;
  const file = path.join(dirent.path, dirent.name);
  if (file === personPath) continue;
  let rows;
  try { rows = read(file); } catch { continue; }
  if (!Array.isArray(rows)) continue;
  for (const row of rows) {
    if (row?.id === person.id) throw new Error(`Duplicate person id ${person.id}`);
    if (String(row?.name || '').toLocaleLowerCase('nb') === person.name.toLocaleLowerCase('nb')) throw new Error(`Duplicate person name ${person.name}`);
  }
}
write(personPath, [person]);
const peopleManifestPath = 'data/people/manifest.json';
const peopleManifest = read(peopleManifestPath);
const relativePersonPath = personPath.replace(/^data\//, '');
if (!peopleManifest.files.includes(relativePersonPath)) peopleManifest.files.push(relativePersonPath);
write(peopleManifestPath, peopleManifest);

const relationsPath = 'data/relations.json';
const relations = read(relationsPath);
upsert(relations, { id: 'rel_fredrik_ferdinand_hausmann_hausmannsbrua_namesake', type: 'navneopprinnelse', place: 'hausmannsbrua', person: person.id, label: 'Navneopphav via Hausmanns gate', why: 'Hausmannsbrua har navn etter Hausmanns gate, som er oppkalt etter Fredrik Ferdinand Hausmann.', source: sources[0].url });
write(relationsPath, relations);

const storyPath = 'data/stories/stories_hausmannsbrua.json';
const story = [{
  id: 'st_hausmannsbrua_den_gamle_broen_i_den_nye',
  type: 'bridge_engineering_widening_and_preservation',
  title: 'Den gamle broen i den nye',
  year: 1892,
  place_id: 'hausmannsbrua',
  summary: 'Hausmannsbrua stod ferdig i 1892 som støpejernsbro over Akerselva. Da den ble utvidet i 1986, ble den gamle formen kopiert og rekkverket bevart – slik at et 1800-tallslag fortsatt er synlig i dagens trafikkbro.',
  story: 'I 1892 stod en ny bro ferdig over Akerselva. Christiania kommunale Veivesen hadde bygd den under ledelse av ingeniør P. Schaaning. Konstruksjonen var laget av støpejernsdeler i fagverk og bueform, med 28 meters total lengde og 16 meter som lengste spenn. Den var infrastruktur, men også et presist stykke ingeniørarbeid fra en by i rask vekst.\n\nNavnet kan lett skape en historisk misforståelse. Fredrik Ferdinand Hausmann levde på 1700-tallet og døde lenge før broen ble reist. Broen har navn etter Hausmanns gate, og gaten har navn etter ham fordi han eide Ankerløkken og Mangelsgården. Han er altså navneopphavet – ikke brobyggeren.\n\nNesten hundre år senere måtte broen tilpasses en helt annen trafikksituasjon. I 1986 ble den utvidet til seks kjørefelt. Men i stedet for å fjerne alle spor etter den gamle broen ble buekonstruksjonene kopiert og smijernsrekkverket bevart. Dermed ligger det et historisk paradoks i konstruksjonen: dagens bredde er moderne, mens deler av uttrykket fortsatt peker tilbake mot 1892.\n\nAt Hausmannsbrua senere ble tatt inn i nasjonal verneplan viser hvorfor slike detaljer betyr noe. Infrastruktur er vanligvis laget for å brukes, slites og bygges om. Her er selve ombyggingen blitt en del av kulturminnet. Den gamle broen finnes ikke urørt, men den er heller ikke borte. Den lever videre som materiale, form og spor inne i den nye.',
  sources: sources.map((source) => ({ title: source.label, url: source.url })),
  tags: ['Hausmannsbrua','Akerselva','støpejern','1892','1986','bro','vern','infrastruktur'],
  related_people: [person.id],
  related_places: ['prinds_christian_augusts_minde','ankerbrua','nybrua_vaterlandsparken'],
  score: { narrative: 5, historical: 5, source: 5, play_value: 4, originality: 5, total: 24 },
  arc: { start: 'En støpejernsbro står ferdig over Akerselva i 1892.', middle: 'Trafikkpresset fører til en stor utvidelse i 1986.', end: 'Gamle detaljer bevares, og broen blir både bruksinfrastruktur og kulturminne.' },
  next_scenes: [{ place_id: 'ankerbrua', reason: 'Fortsett nedover Akerselva og sammenlign en annen historisk brotype og et annet byrom.' }]
}];
write(storyPath, story);
const storiesManifestPath = 'data/stories/stories_manifest.json';
const storiesManifest = read(storiesManifestPath);
if (!storiesManifest.files.some((row) => row.entity_id === place.id && row.path === storyPath)) storiesManifest.files.push({ category: 'by', entity_id: place.id, path: storyPath });
write(storiesManifestPath, storiesManifest);

const leksikonPath = 'data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json';
const leksikon = read(leksikonPath);
let article = leksikon.find((row) => row.place_id === place.id);
if (!article) {
  article = { place_id: place.id, category: 'by' };
  leksikon.push(article);
}
Object.assign(article, {
  version: 2,
  popupDesc: 'Hausmannsbrua er en støpejerns buebro over Akerselva, ferdig i 1892 og utvidet i 1986 med historiske detaljer bevart. Den er både daglig infrastruktur og del av nasjonal verneplan.',
  wikiText: [
    'Hausmannsbrua fører Hausmanns gate over Akerselva og stod ferdig i 1892 etter bygging i perioden 1890–92. Christiania kommunale Veivesen oppførte broen ved ingeniør P. Schaaning. Store norske leksikon beskriver den som en buebro og fagverkskonstruksjon bygd av støpejernsdeler. Den er 28 meter lang og har et lengste spenn på 16 meter.',
    'Broen ble kraftig endret i 1986 da den ble utvidet til seks kjørefelt. Oslo byleksikon oppgir at de gamle buekonstruksjonene ble kopiert, mens smijernsrekkverket fra den gamle broen ble beholdt. Dagens bro er derfor ikke en urørt 1892-konstruksjon, men et sammensatt byggverk der senere trafikktilpasning er kombinert med bevarte og gjenskapte historiske elementer.',
    'Hausmannsbrua er tatt med i nasjonal verneplan for veger, bruer og vegrelaterte kulturminner. Vernet er interessant nettopp fordi broen fortsatt brukes som infrastruktur. Kulturminneverdien ligger ikke bare i alder, men i konstruksjonstype, materialbruk og i måten den historiske formen ble tatt med videre gjennom ombyggingen.',
    'Navnet kommer fra Hausmanns gate, som igjen er oppkalt etter generalløytnant og legatstifter Fredrik Ferdinand Hausmann (1693–1757). Hausmann eide Ankerløkken og landstedet som senere ble Prinds Christian Augusts Minde. Han døde mer enn hundre år før broen stod ferdig og skal derfor forstås som navneopphav, ikke som brobygger.'
  ],
  summary: { one_liner: 'Støpejernsbro fra 1892 som ble utvidet i 1986 uten at alle de historiske detaljene forsvant.', themes: ['brohistorie','støpejern','infrastruktur','Akerselva','bevaring','1892','1986','navneopprinnelse'], tone: ['nøktern','teknisk','historisk','kildebevisst'] },
  facts: [
    { id: 'fact_hausmannsbrua_01', label: 'Ferdig i 1892', desc: 'Hausmannsbrua stod ferdig i 1892 etter bygging 1890–92.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_hausmannsbrua_02', label: 'Kommunal brobygging', desc: 'Broen ble oppført av Christiania kommunale Veivesen ved ingeniør P. Schaaning.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_hausmannsbrua_03', label: 'Støpejern', desc: 'Broen er en fagverkskonstruksjon bygd av støpejernsdeler og klassifisert som buebro.', confidence: 'high', sources: [sources[0].label] },
    { id: 'fact_hausmannsbrua_04', label: '28 meter', desc: 'Total lengde er 28 meter.', confidence: 'high', sources: [sources[0].label] },
    { id: 'fact_hausmannsbrua_05', label: '16 meter hovedspenn', desc: 'Lengste spenn er 16 meter.', confidence: 'high', sources: [sources[0].label] },
    { id: 'fact_hausmannsbrua_06', label: 'Utvidet i 1986', desc: 'Broen ble utvidet til seks kjørefelt i 1986.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_hausmannsbrua_07', label: 'Rekkverket ble bevart', desc: 'Smijernsrekkverket fra den gamle broen ble beholdt ved ombyggingen.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_hausmannsbrua_08', label: 'Bueformen ble videreført', desc: 'Oslo byleksikon oppgir at de gamle buekonstruksjonene ble kopiert ved utvidelsen.', confidence: 'high', sources: [sources[1].label] },
    { id: 'fact_hausmannsbrua_09', label: 'Nasjonal verneplan', desc: 'Broen er med i nasjonal verneplan for veger, bruer og vegrelaterte kulturminner.', confidence: 'high', sources: [sources[0].label] },
    { id: 'fact_hausmannsbrua_10', label: 'Navn etter Hausmann', desc: 'Broen har navn via Hausmanns gate etter Fredrik Ferdinand Hausmann.', confidence: 'high', sources: [sources[0].label, sources[2].label] },
    { id: 'fact_hausmannsbrua_11', label: 'Blått historieskilt', desc: 'Broen er markert med et av Oslo Byes Vels blå skilt ved gangveien under broen.', confidence: 'high', sources: [sources[1].label] }
  ],
  chronology: [
    { id: 'chrono_hausmannsbrua_01', year: 1693, period: 'Fredrik Ferdinand Hausmann blir født', desc: 'Senere navneopphav til Hausmanns gate og indirekte broen.', confidence: 'high', sources: [sources[0].label, sources[3].label] },
    { id: 'chrono_hausmannsbrua_02', year: 1732, period: 'Hausmann og Ankerløkken', desc: 'Hausmann eier området Hausmanns gate senere blir lagt gjennom.', confidence: 'high', sources: [sources[2].label, sources[4].label] },
    { id: 'chrono_hausmannsbrua_03', year: 1757, period: 'Hausmann dør', desc: 'Navneopphavet dør lenge før broen bygges.', confidence: 'high', sources: [sources[0].label] },
    { id: 'chrono_hausmannsbrua_04', year: 1890, period: 'Brobyggingen starter', desc: 'Byggeperioden 1890–92 begynner.', confidence: 'high', sources: [sources[1].label] },
    { id: 'chrono_hausmannsbrua_05', year: 1892, period: 'Broen står ferdig', desc: 'Hausmannsbrua ferdigstilles som støpejerns bue- og fagverkskonstruksjon.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'chrono_hausmannsbrua_06', year: 1986, period: 'Stor utvidelse', desc: 'Broen utvides til seks kjørefelt; historiske konstruksjonstrekk og rekkverk videreføres.', confidence: 'high', sources: [sources[0].label, sources[1].label] }
  ],
  built_environment: { built_year: 1892, architects: ['P. Schaaning (ingeniør, fullt navn ikke verifisert)'], materials: ['støpejern','smijern'], style: ['buebro','fagverkskonstruksjon','historisk infrastruktur'], original_function: 'Broforbindelse over Akerselva', current_function: 'Veibro og urban forbindelse over Akerselva', changes: [{ label: 'Utvidelse til seks kjørefelt', year: 1986, desc: 'Broen ble bredere; gamle buekonstruksjoner ble kopiert og gammelt rekkverk bevart.', confidence: 'high', sources: [sources[0].label, sources[1].label] }] },
  artifacts: [
    { id: 'artifact_hausmannsbrua_01', title: 'Smijernsrekkverket', kind: 'bevart brodetalj', desc: 'Rekkverket fra den gamle broen ble beholdt i 1986.', where: 'Hausmannsbrua', confidence: 'high', image_ref: null, sources: [sources[1].label] },
    { id: 'artifact_hausmannsbrua_02', title: 'Støpejernskonstruksjonen', kind: 'brokonstruksjon', desc: 'Bue- og fagverksformen er broens tekniske hovedtrekk.', where: 'Hausmannsbrua', confidence: 'high', image_ref: null, sources: [sources[0].label] },
    { id: 'artifact_hausmannsbrua_03', title: 'Det blå skiltet', kind: 'historieformidling', desc: 'Oslo Byes Vels skilt står ved gangveien under broen.', where: 'Gangveien under Hausmannsbrua', confidence: 'high', image_ref: null, sources: [sources[1].label] }
  ],
  interpretation: {
    what_to_notice: ['rekkverket','bueformen under broen','forskjellen mellom broens bredde og elvens spenn','gangveien under broen','støpejernsdetaljene','det blå skiltet'],
    why_it_matters: ['Broen viser 1800-tallets kommunale ingeniørhistorie.','Ombyggingen fra 1986 viser hvordan gammel infrastruktur kan bygges videre på i stedet for bare å erstattes.','Vernestatusen viser at daglig infrastruktur også kan være kulturminne.'],
    counterpoints: ['Fredrik Ferdinand Hausmann er navneopphav, ikke brobygger.','Kildene oppgir byggansvarlig som P. Schaaning; fullt navn holdes utenfor canonical persondata til direkte kildebelegg finnes.','Påstanden om opprinnelig jernbanebru brukes ikke som canonical fakta fordi de sterkeste kildene her ikke bekrefter den.']
  },
  links: { entry_ids: [], related_places: ['prinds_christian_augusts_minde','ankerbrua','nybrua_vaterlandsparken'], related_people: [person.id] },
  sources: sources.map((source, index) => ({ id: `source_hausmannsbrua_${String(index + 1).padStart(2, '0')}`, label: source.label, type: 'external_reference', url: source.url, confidence: 'high' }))
});
write(leksikonPath, leksikon);

const quizPath = 'data/quiz/historie/hausmannsbrua_sets.json';
const q = (id, question, options, answerIndex, knowledge, sourceLabels, claimBasis = 'documented_external_sources') => ({ id, question, options, answerIndex, answer: options[answerIndex], knowledge, source: sourceLabels, claim_basis: claimBasis });
const set = (id, title, questions) => ({ id, title, questions });
const quiz = {
  place_id: place.id,
  generator_version: 'chatgpt_history_go_manual_v1_source_grounded',
  generated_from: [placePath, leksikonPath, storyPath, 'data/quiz/regler/SET_MAL_README_v3.md'],
  manual_production_notes: { quality_direction: 'sted → konstruksjon → historisk endring → vern', source_caveats: ['Ikke identifiser P. Schaaning med fullt navn uten direkte kilde.','Ikke bruk dampveivals-anekdoten som hardfakta.','Ikke bruk jernbanebru-påstanden uten sterkere kilde.'] },
  sets: [
    set('hausmannsbrua_s1','Byggingen',[q('hausmannsbrua_s1_q1','Når stod Hausmannsbrua ferdig?',['1892','1757','1986'],0,'Broen stod ferdig i 1892.',[sources[0].label,sources[1].label]),q('hausmannsbrua_s1_q2','I hvilken periode ble broen bygd?',['1890–92','1732–35','1984–86'],0,'Oslo byleksikon daterer byggingen til 1890–92.',[sources[1].label]),q('hausmannsbrua_s1_q3','Hvem oppførte broen?',['Christiania kommunale Veivesen','Vulkan Jernstøberi','NSB'],0,'Christiania kommunale Veivesen oppførte broen.',[sources[0].label,sources[1].label]),q('hausmannsbrua_s1_q4','Hva oppgir kildene om ansvarlig ingeniør?',['P. Schaaning','Fredrik Ferdinand Hausmann','Kristin Jarmund'],0,'Kildene oppgir ingeniør P. Schaaning; fullt navn er ikke fastslått her.',[sources[0].label,sources[1].label]),q('hausmannsbrua_s1_q5','Hva er canonical året i History Go for Hausmannsbrua?',['1892','1880','1986'],0,'1892 er ferdigstillelsesåret og erstatter legacy-verdien 1880.',[sources[0].label,sources[1].label]),q('hausmannsbrua_s1_q6','Hva krysser Hausmannsbrua?',['Akerselva','Oslofjorden','Alnaelva'],0,'Broen fører Hausmanns gate over Akerselva.',[sources[0].label]),q('hausmannsbrua_s1_q7','Hvilken gate går over broen?',['Hausmanns gate','Karl Johans gate','Maridalsveien'],0,'Hausmanns gate føres over Akerselva her.',[sources[2].label])]),
    set('hausmannsbrua_s2','Konstruksjonen',[q('hausmannsbrua_s2_q1','Hvilket hovedmateriale er brokonstruksjonen bygd av?',['Støpejern','Tre','Aluminium'],0,'SNL beskriver broen som bygd av støpejernsdeler.',[sources[0].label]),q('hausmannsbrua_s2_q2','Hvilken brotype er Hausmannsbrua?',['Buebro','Hengebro','Flytebro'],0,'SNL klassifiserer den som buebro.',[sources[0].label]),q('hausmannsbrua_s2_q3','Hvilken konstruksjonsform inngår også?',['Fagverk','Betongskall','Kabelnett'],0,'Broen er en fagverkskonstruksjon av støpejernsdeler.',[sources[0].label]),q('hausmannsbrua_s2_q4','Hvor lang er broen totalt?',['28 meter','16 meter','86 meter'],0,'Total lengde er 28 meter.',[sources[0].label]),q('hausmannsbrua_s2_q5','Hvor langt er det lengste spennet?',['16 meter','28 meter','6 meter'],0,'Lengste spenn er 16 meter.',[sources[0].label]),q('hausmannsbrua_s2_q6','Hva bør du særlig se etter under broen?',['Bue- og fagverksformen','En middelaldermur','En flytebrygge'],0,'Buekonstruksjonen og fagverket gjør brotypen lesbar fysisk.',[sources[0].label]),q('hausmannsbrua_s2_q7','Hvorfor er tekniske mål relevante i en stedstest?',['De gjør broens faktiske skala konkret','De viser antall restauranter','De forteller hvem som eier gaten i dag'],0,'28 meter total lengde og 16 meter hovedspenn gjør konstruksjonens skala konkret.',[sources[0].label])]),
    set('hausmannsbrua_s3','Navnet',[q('hausmannsbrua_s3_q1','Hvem er Hausmannsbrua indirekte oppkalt etter?',['Fredrik Ferdinand Hausmann','P. Schaaning','Peder Anker'],0,'Broen har navn etter Hausmanns gate, som er oppkalt etter Fredrik Ferdinand Hausmann.',[sources[0].label,sources[2].label]),q('hausmannsbrua_s3_q2','Bygde Fredrik Ferdinand Hausmann broen?',['Nei, han døde lenge før broen ble bygd','Ja, i 1892','Ja, i 1986'],0,'Hausmann døde i 1757; han er navneopphav, ikke brobygger.',[sources[0].label]),q('hausmannsbrua_s3_q3','Hva eide Hausmann i området?',['Ankerløkken og landstedet som senere ble Prinds Christian Augusts Minde','Vulkan Jernstøberi','Oslo S'],0,'Hausmann eide Ankerløkken og Mangelsgården/landstedet som senere inngikk i Prindsen.',[sources[2].label,sources[4].label]),q('hausmannsbrua_s3_q4','Hvordan går navnekjeden?',['Hausmann → Hausmanns gate → Hausmannsbrua','Schaaning → Schaanings gate → Hausmannsbrua','Akerselva → Hausmann → Karl Johan'],0,'Broen fikk navn via gaten som allerede bar Hausmann-navnet.',[sources[0].label,sources[2].label]),q('hausmannsbrua_s3_q5','Hva er den kildekritiske forskjellen mellom Hausmann og P. Schaaning?',['Hausmann er navneopphav; P. Schaaning oppgis som byggansvarlig ingeniør','Begge bygde broen sammen','Ingen av dem har noen forbindelse til broen'],0,'Kildene skiller tydelig mellom navneopprinnelse og ingeniøransvar.',[sources[0].label,sources[1].label],'source_comparison'),q('hausmannsbrua_s3_q6','Når døde Fredrik Ferdinand Hausmann?',['1757','1892','1986'],0,'Han døde i 1757, mer enn hundre år før broen stod ferdig.',[sources[0].label]),q('hausmannsbrua_s3_q7','Hvorfor opprettes ikke en full canonical person for «P. Schaaning» i denne batchen?',['Full identitet er ikke direkte kildebelagt i brokildene','Ingeniører kan aldri være personer i History Go','Han var anonym etter eget ønske'],0,'Batchen fail-closer identitetskoblingen og beholder bare initialen kildene faktisk oppgir.',[sources[0].label,sources[1].label],'identity_holdback')]),
    set('hausmannsbrua_s4','Ombyggingen',[q('hausmannsbrua_s4_q1','Når ble broen utvidet kraftig?',['1986','1892','1757'],0,'Utvidelsen skjedde i 1986.',[sources[0].label,sources[1].label]),q('hausmannsbrua_s4_q2','Hvor mange kjørefelt fikk broen ved utvidelsen?',['Seks','To','Ti'],0,'Broen ble utvidet til seks kjørefelt.',[sources[0].label,sources[1].label]),q('hausmannsbrua_s4_q3','Hva skjedde med det gamle rekkverket?',['Det ble beholdt','Det ble smeltet om','Det ble flyttet til Bergen'],0,'Det gamle smijernsrekkverket ble bevart.',[sources[0].label,sources[1].label]),q('hausmannsbrua_s4_q4','Hva sier Oslo byleksikon om de gamle buekonstruksjonene?',['De ble kopiert','De ble erstattet av kabler','De ble senket i elva'],0,'Bueformen ble videreført gjennom kopierte konstruksjoner.',[sources[1].label]),q('hausmannsbrua_s4_q5','Hva gjør 1986-ombyggingen interessant kulturhistorisk?',['Den kombinerer ny trafikkapasitet med bevarte historiske trekk','Den fjernet alle spor av 1892','Den gjorde broen til jernbane'],0,'Ombyggingen viser bevaring gjennom aktiv viderebruk.',[sources[0].label,sources[1].label]),q('hausmannsbrua_s4_q6','Hva er et fysisk 1892-lag du fortsatt kan se etter?',['Smijernsrekkverket','Et neonskilt fra 1986','En trekai'],0,'Rekkverket ble bevart fra den eldre broen.',[sources[1].label]),q('hausmannsbrua_s4_q7','Er dagens bro identisk med den urørte broen fra 1892?',['Nei, den er kraftig utvidet men har bevarte og kopierte historiske elementer','Ja, ingenting er endret','Nei, hele broen ble flyttet'],0,'Dagens bro er et sammensatt historisk byggverk.',[sources[0].label,sources[1].label])]),
    set('hausmannsbrua_s5','Vern og byrom',[q('hausmannsbrua_s5_q1','Hva slags nasjonal plan er Hausmannsbrua med i?',['Verneplan for veger, bruer og vegrelaterte kulturminner','Nasjonal parkplan','Plan for flyplasser'],0,'Broen inngår i en nasjonal verneplan for samferdselskulturminner.',[sources[0].label]),q('hausmannsbrua_s5_q2','Hva markerer brohistorien ved gangveien under broen?',['Et blått skilt fra Oslo Byes Vel','En runestein','En statue av Hausmann'],0,'Oslo byleksikon omtaler et blått historieskilt ved gangveien.',[sources[1].label]),q('hausmannsbrua_s5_q3','Hvorfor er gangveien under broen viktig for stedlesningen?',['Du kan se konstruksjonen nedenfra og følge elva videre','Den er broens opprinnelige kjørevei','Den skjuler hele broen'],0,'Under broen blir bueform, spenn og elverom lettere å lese.',[sources[0].label]),q('hausmannsbrua_s5_q4','Hva viser broen om Akerselva som byelement?',['Elva er både korridor og barriere som krever forbindelser','Elva har ingen betydning for bystrukturen','Alle broer gjør elva usynlig'],0,'Broer gjør den tverrgående forbindelsen mulig mens elveruten fortsetter langs vannet.',[sources[0].label]),q('hausmannsbrua_s5_q5','Hvorfor kan daglig infrastruktur være kulturminne?',['Teknikk, materialer og historiske endringer kan ha bevaringsverdi','Bare ubrukt infrastruktur kan vernes','Vern gjelder bare slott'],0,'Hausmannsbrua viser hvordan en fortsatt brukt bro kan være verneverdig.',[sources[0].label]),q('hausmannsbrua_s5_q6','Hva er den beste observasjonen for Nature-rundingen her?',['Hvordan vann, spenn, skygge og ganglinje møtes under broen','En bestemt art som ikke er dokumentert','Et fjell langt utenfor Oslo'],0,'Rundingen holder seg til observerbare forhold ved elva og konstruksjonen.',[sources[0].label]),q('hausmannsbrua_s5_q7','Hva bør ikke diktes opp i Nature-rundingen?',['Artsforekomster uten dokumentasjon','Broens mål','At Akerselva går under broen'],0,'Batchen unngår stedsspesifikke artsfakta uten kilde.',[sources[0].label],'content_guardrail')]),
    set('hausmannsbrua_s6','Kildekritikk',[q('hausmannsbrua_s6_q1','Hvilket årstall erstatter legacy-året 1880 i canonical data?',['1892','1890','1986'],0,'Ferdigstillelsesåret 1892 er kildebelagt av SNL og Oslo byleksikon.',[sources[0].label,sources[1].label],'source_comparison'),q('hausmannsbrua_s6_q2','Hvorfor brukes ikke fullt navn på ingeniør P. Schaaning?',['Bro-kildene oppgir bare initial og etternavn','Fordi ingen kjenner etternavnet','Fordi ingeniøren var Fredrik Hausmann'],0,'Full identitet holdes som research-holdback til direkte kilde finnes.',[sources[0].label,sources[1].label],'identity_holdback'),q('hausmannsbrua_s6_q3','Hvorfor brukes ikke dampveivals-historien som canonical hardfakta?',['Den er foreløpig bare funnet i en sekundær lokal kilde','Den er fysisk umulig','Det fantes ingen veivalser'],0,'Anekdoten holdes tilbake til sterkere kildegrunnlag finnes.',[sources[0].label],'secondary_source_holdback'),q('hausmannsbrua_s6_q4','Hvorfor brukes ikke påstanden om opprinnelig jernbanebru som hardfakta?',['De sterkeste kildene i batchen bekrefter den ikke','Fordi broen aldri krysset elva','Fordi 1892 er før jernbanen'],0,'Batchen fail-closer et kildeavvik i stedet for å velge den mest spennende versjonen.',[sources[0].label,sources[1].label,sources[5].label],'source_conflict'),q('hausmannsbrua_s6_q5','Hvilke to år er viktigst for å forstå dagens bro?',['1892 og 1986','1757 og 1732','1908 og 2012'],0,'1892 er ferdigstillelsen, 1986 den store utvidelsen.',[sources[0].label,sources[1].label]),q('hausmannsbrua_s6_q6','Hva er det sikreste navnefaktumet?',['Broen har navn etter Hausmanns gate og Fredrik Ferdinand Hausmann','Broen har navn etter ingeniør Schaaning','Broen har navn etter Vulkan'],0,'SNL oppgir etymologien direkte.',[sources[0].label]),q('hausmannsbrua_s6_q7','Hva er den beste samlede beskrivelsen av Hausmannsbrua?',['En brukt og ombygd støpejernsbro der historiske elementer fortsatt er lesbare','En urørt middelalderbro','En ny gangbro fra 2012'],0,'Broens verdi ligger i kombinasjonen av 1892-konstruksjon, 1986-tilpasning og bevaring.',[sources[0].label,sources[1].label])])
  ]
};
write(quizPath, quiz);

const routeIndexPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const routeIndex = read(routeIndexPath);
const indexRow = routeIndex.find((row) => row.id === place.id);
if (!indexRow) throw new Error('Missing Hausmannsbrua route index row');
for (const key of ['name','category','lat','lon','r','year','coordStatus','coordType']) indexRow[key] = place[key];
write(routeIndexPath, routeIndex);
const manifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const manifest = read(manifestPath);
const manifestRow = manifest.places.find((row) => row.id === place.id);
if (!manifestRow) throw new Error('Missing Hausmannsbrua split manifest row');
manifestRow.name = place.name;
manifestRow.category = place.category;
manifestRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(placePath)).digest('hex');
write(manifestPath, manifest);

fs.mkdirSync('reports/hausmannsbrua-rounds-batch1', { recursive: true });
fs.writeFileSync('reports/hausmannsbrua-rounds-batch1.md', `# Hausmannsbrua – PlaceCard rounds batch 1\n\nDato: 2026-07-19\n\n## Avgrensning\n\nBatchen fortsetter den verifiserte delen av Akerselva-ruten etter de to coordinate-blocked elvestrekningene. Hausmannsbruas canonical koordinater beholdes og testes mot coordinate-evidence.\n\n## Canonical år\n\nLegacy-verdien \`1880\` erstattes med \`1892\`, dokumentert ferdigstillelsesår. Byggeperioden 1890–92 beholdes i kronologien.\n\n## Person\n\nFredrik Ferdinand Hausmann opprettes som dokumentert navneopphav via Hausmanns gate. Han beskrives eksplisitt som namesake, ikke brobygger. Ingen canonical person opprettes for «P. Schaaning» fordi brokildene ikke gir fullt navn.\n\n## Rundinger\n\nPersoner, Natur, Merker, Verk, Civication, Aktører, Før/nå, Fortellinger og Leksikon.\n\n## Kildeholdbacks\n\n- full identitet bak ingeniør P. Schaaning\n- dampveivals-anekdoten\n- påstanden om opprinnelig jernbanebru\n\n## Split-sikkerhet\n\nBare Hausmannsbrua-filen, dens route-indexrad og manifest-hash endres blant route-place-filene.\n`);

const test = `const assert=require('assert'),crypto=require('crypto'),fs=require('fs'),path=require('path');\nconst repo=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(repo,f),'utf8'));\nconst pp='data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsbrua.json',p=read(pp),e=read('data/coordinate-evidence/oslo/natur/hausmannsbrua.json');\nassert.strictEqual(p.id,'hausmannsbrua');assert.strictEqual(p.category,'by');assert.strictEqual(p.year,1892);assert.deepStrictEqual([p.lat,p.lon,p.r],[e.currentCoordinate.lat,e.currentCoordinate.lon,e.currentCoordinate.r]);assert.strictEqual(p.coordStatus,'verified_geometry');\nconst expected=['people','nature','badges','works','civication','brands','før_nå','fortellinger','leksikon'];const runtime=fs.readFileSync(path.join(repo,'js/ui/place-card.js'),'utf8'),m=runtime.match(/by:\\s*\\[([^\\]]+)\\]/);assert(m);assert.deepStrictEqual(JSON.parse('['+m[1]+']'),expected);\nconst person=read('data/people/historie/oslo/akerselva/fredrik_ferdinand_hausmann.json')[0];assert.strictEqual(person.id,'fredrik_ferdinand_hausmann');assert.strictEqual(person.placeId,'prinds_christian_augusts_minde');assert(person.places.includes('hausmannsbrua'));assert(person.source_urls.length>=4);assert(read('data/people/manifest.json').files.includes('people/historie/oslo/akerselva/fredrik_ferdinand_hausmann.json'));\nassert(read('data/relations.json').some(r=>r.id==='rel_fredrik_ferdinand_hausmann_hausmannsbrua_namesake'));\nassert(p.works.length>=7);assert(p.civication_store.length>=5&&p.civication_store.every(x=>x.physicalObject&&x.placeSpecific));assert(p.brands.length>=5);assert(p.for_na.look_for.length>=8);assert(p.nature_profile.summary.length>=650);const badges=new Set(read('data/badges/by.json').sub);assert(p.underbadge_ids.length>=3&&p.underbadge_ids.every(id=>badges.has(id)));\nconst storyPath='data/stories/stories_hausmannsbrua.json',story=read(storyPath)[0];assert(story.sources.length>=6);assert(read('data/stories/stories_manifest.json').files.some(x=>x.entity_id==='hausmannsbrua'&&x.path===storyPath));\nconst article=read('data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json').find(x=>x.place_id==='hausmannsbrua');assert(article&&article.version===2);assert(article.facts.length>=11);assert(article.chronology.length>=6);assert(article.sources.length>=6);\nconst quiz=read('data/quiz/historie/hausmannsbrua_sets.json');assert.strictEqual(quiz.sets.length,6);assert(quiz.sets.every(s=>s.questions.length===7));\nconst index=read('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json').find(x=>x.id===p.id);assert.deepStrictEqual([index.lat,index.lon,index.r,index.year],[p.lat,p.lon,p.r,p.year]);const manifest=read('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json').places.find(x=>x.id===p.id);assert.strictEqual(manifest.sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,pp))).digest('hex'));\nconst all=JSON.stringify({p,person,story,article,quiz});for(const token of ['1890','1892','1986','støpejern','28 meter','16 meter','P. Schaaning','Fredrik Ferdinand Hausmann','nasjonal verneplan','smijernsrekkverk'])assert(all.includes(token),'Missing '+token);console.log('Hausmannsbrua rounds batch 1 OK');\n`;
fs.writeFileSync('tests/hausmannsbrua-rounds-batch1.test.js', test);
