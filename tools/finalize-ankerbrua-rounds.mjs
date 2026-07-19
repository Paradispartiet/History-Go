import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const upsert = (rows, value) => {
  const i = rows.findIndex((row) => row?.id === value.id);
  if (i >= 0) rows[i] = value;
  else rows.push(value);
};

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/ankerbrua.json';
const evidencePath = 'data/coordinate-evidence/oslo/natur/ankerbrua.json';
const place = read(placePath);
const evidence = read(evidencePath);
if (place.id !== 'ankerbrua' || evidence.placeId !== place.id) throw new Error('Ankerbrua identity mismatch');
for (const key of ['lat','lon','r']) {
  if (place[key] !== evidence.currentCoordinate[key]) throw new Error(`Do not change Ankerbrua coordinate field ${key}`);
}

const sources = [
  { type: 'reference', label: 'Oslo byleksikon – Ankerbrua', url: 'https://oslobyleksikon.no/side/Ankerbrua', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Store norske leksikon – Dyre Vaa', url: 'https://snl.no/Dyre_Vaa', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Norsk kunstnerleksikon – Dyre Vaa', url: 'https://nkl.snl.no/Dyre_Vaa', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Oslo byleksikon – Ankerløkken', url: 'https://oslobyleksikon.no/side/Ankerl%C3%B8kken', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Store norske leksikon – Christian Ancher', url: 'https://snl.no/Christian_Ancher', lang: 'nb', verifiedAt: '2026-07-19' },
  { type: 'reference', label: 'Lokalhistoriewiki – Ankerbrua', url: 'https://lokalhistoriewiki.no/Ankerbrua', lang: 'nb', verifiedAt: '2026-07-19' }
];

Object.assign(place, {
  year: 1926,
  desc: 'Stein- og betongbro over Akerselva oppført i 1926, senere kjent som Eventyrbrua etter Dyre Vaas fire bronsegrupper fra 1937.',
  popupDesc: 'Ankerbrua krysser Akerselva mellom Torggata/Ankertorget og Søndre gate. Den første broen på stedet var en trebro oppført 1874–76. Etter gjentatte utglidninger i det vanskelige terrenget ble den gamle broen revet og dagens bro i betong og huggen stein oppført i 1926 etter tegninger av arkitekt Oscar Hoff.\n\nI 1937 fikk broen fire bronsegrupper av billedhuggeren Dyre Vaa. Oslo byleksikon og Store norske leksikon knytter motivene til Kvitebjørn kong Valemon, Per/Peer Gynt, Kari Trestakk og Veslefrikk med fela. Skulpturene ga broen tilnavnet «Eventyrbrua».\n\nNavnet Ankerbrua kommer fra Ankerløkken, den tidligere løkkeeiendommen på vestsiden av elva. Ankerløkken fikk navn etter Karen og Christian Ancher, som kjøpte løkkene på 1700-tallet. Dagens sted er derfor et lagdelt byrom: en 1926-bro på et eldre krysningssted, med kunst fra 1937 og et navn som peker enda lenger tilbake i byhistorien.',
  tags: ['akerselva','bro','eventyrbrua','dyre_vaa','offentlig_kunst','1926','1937','steinbro','betongbro','ankerloekken','byhistorie'],
  emne_ids: ['em_by_infrastruktur_mobilitet','em_by_materialitet_og_sanseerfaring','em_by_historiske_lag_i_hverdagsrom','em_by_symbolsk_makt_og_representasjon'],
  quiz_profile: {
    place_type: 'historisk bybro med offentlig kunst',
    subtype: 'steinbro_1926_med_eventyrskulpturer_1937',
    signature_features: ['dagens bro oppført i 1926','første trebro på stedet 1874–76','betong og huggen stein','tegnet av Oscar Hoff','fire bronsegrupper av Dyre Vaa fra 1937','tilnavnet Eventyrbrua'],
    primary_angles: ['brohistorie','offentlig_kunst','eventyrmotiv','navneopprinnelse','infrastruktur_og_byrom','historiske_lag'],
    question_families: ['historisk_endring','kunst_og_kunstner','gjenkjenning','navneopprinnelse','teknisk_fysisk','kildekritikk'],
    avoid_angles: ['late_som_1874_er_dagens_bros_byggeaar','blande_tyrihans_inn_som_canonical_skulpturmotiv','generisk_akerselva','tidssensitive_virksomheter'],
    must_include: ['1874–76','1926','Oscar Hoff','1937','Dyre Vaa','Kvitebjørn kong Valemon','Per Gynt','Kari Trestakk','Veslefrikk med fela'],
    contrast_targets: ['hausmannsbrua','nybrua_vaterlandsparken','beierbrua'],
    notes: 'Canonical år er 1926 for dagens bro. Trebrua 1874–76 er forgjengeren. Oslo byleksikon og SNL/NKL brukes som autoritativ linje for de fire eventyrmotivene; sekundært avvik om Tyrihans holdes utenfor canonical data.'
  },
  externalLinks: sources,
  underbadge_ids: ['infrastruktur','monumenter_og_landemerker','byplanlegging'],
  works: [
    { id: 'ankerbrua_trebru_1874', title: 'Den første Ankerbrua', type: 'forgjengerbro', kind: 'wooden_bridge', year: 1874, desc: 'Den første broen på stedet ble oppført som trebro i perioden 1874–76.', why_here: 'Den etablerte krysningsstedet som dagens bro viderefører.' },
    { id: 'ankerbrua_steinbro_1926', title: 'Ankerbrua 1926', type: 'bro', kind: 'stone_and_concrete_bridge', year: 1926, desc: 'Dagens bro i betong og huggen stein ble oppført i 1926 etter tegninger av Oscar Hoff.', why_here: 'Dette er den eksisterende brokonstruksjonen på stedet.' },
    { id: 'ankerbrua_kvitebjorn_valemon', title: 'Kvitebjørn kong Valemon', type: 'skulpturgruppe', kind: 'bronze_sculpture', year: 1937, artist_person_id: 'dyre_vaa', desc: 'En av Dyre Vaas fire bronsegrupper på Ankerbrua.', why_here: 'Skulpturen er fysisk integrert i broens kunstneriske utsmykning.' },
    { id: 'ankerbrua_per_gynt', title: 'Per Gynt', type: 'skulpturgruppe', kind: 'bronze_sculpture', year: 1937, artist_person_id: 'dyre_vaa', desc: 'Dyre Vaas eventyr-/sagnmotiv på Ankerbrua.', why_here: 'En av de fire gruppene som ga broen tilnavnet Eventyrbrua.' },
    { id: 'ankerbrua_kari_trestakk', title: 'Kari Trestakk', type: 'skulpturgruppe', kind: 'bronze_sculpture', year: 1937, artist_person_id: 'dyre_vaa', desc: 'En av de fire bronsegruppene på broen.', why_here: 'Motivet er stedsspesifikk offentlig kunst på Ankerbrua.' },
    { id: 'ankerbrua_veslefrikk_med_fela', title: 'Veslefrikk med fela', type: 'skulpturgruppe', kind: 'bronze_sculpture', year: 1937, artist_person_id: 'dyre_vaa', desc: 'En av Dyre Vaas fire eventyrgrupper på Ankerbrua.', why_here: 'Skulpturen er del av den dokumenterte utsmykningen som ligger bak navnet Eventyrbrua.' },
    { id: 'ankerbrua_bla_skilt', title: 'Det blå skiltet på Ankerbrua', type: 'historieformidling', kind: 'heritage_plaque', year: null, desc: 'Broen er markert med et blått skilt fra Selskabet for Oslo Byes Vel.', why_here: 'Skiltet formidler broens historie på selve stedet.' }
  ],
  civication_store: [
    { id: 'ankerbrua_eventyrbrua_foldout', title: 'Eventyrbrua – fire motiver', type: 'foldoutkort', kind: 'physical_object', desc: 'Et utbrettskort med de fire dokumenterte motivene fra 1937.', placeSpecificReason: 'De fire bronsegruppene er fysisk plassert på Ankerbrua og har gitt den tilnavnet Eventyrbrua.', historicalFunction: 'Knytter offentlig kunst og brohistorie sammen.', physicalObject: true, placeSpecific: true, storePrice: 36, currency: 'PC', collection: 'ankerbrua_eventyr_og_bro', collectable: true, source_urls: [sources[0].url, sources[1].url] },
    { id: 'ankerbrua_kvitebjorn_pin', title: 'Kvitebjørn kong Valemon', type: 'skulpturpin', kind: 'physical_object', desc: 'En samlerpin inspirert av Dyre Vaas bronsegruppe.', placeSpecificReason: 'Motivet står på Ankerbrua.', historicalFunction: 'Representerer 1937-utsmykningen.', physicalObject: true, placeSpecific: true, storePrice: 24, currency: 'PC', collection: 'ankerbrua_eventyr_og_bro', collectable: true, source_urls: [sources[0].url, sources[1].url] },
    { id: 'ankerbrua_kari_trestakk_pin', title: 'Kari Trestakk', type: 'skulpturpin', kind: 'physical_object', desc: 'En samlerpin basert på Kari Trestakk-gruppen.', placeSpecificReason: 'Kari Trestakk er et dokumentert motiv på broen.', historicalFunction: 'Gjør ett av de fire eventyrmotivene til et fysisk samleobjekt.', physicalObject: true, placeSpecific: true, storePrice: 24, currency: 'PC', collection: 'ankerbrua_eventyr_og_bro', collectable: true, source_urls: [sources[0].url] },
    { id: 'ankerbrua_1926_model', title: 'Ankerbrua 1926', type: 'bromodell', kind: 'physical_object', desc: 'En liten modell av dagens stein- og betongbro.', placeSpecificReason: 'Dagens Ankerbrua ble oppført i 1926.', historicalFunction: 'Skiller den nåværende broen fra trebroen 1874–76.', physicalObject: true, placeSpecific: true, storePrice: 40, currency: 'PC', collection: 'ankerbrua_eventyr_og_bro', collectable: true, source_urls: [sources[0].url] },
    { id: 'ankerbrua_1874_1926_kort', title: 'Fra trebru til steinbru', type: 'for_na_kort', kind: 'physical_object', desc: 'Et før/nå-kort som viser skiftet fra trebroen 1874–76 til dagens bro fra 1926.', placeSpecificReason: 'Stedet har en tydelig dokumentert brohistorie i to hovedfaser.', historicalFunction: 'Visualiserer hvorfor canonical år er 1926 samtidig som 1874 bevares i tidslinjen.', physicalObject: true, placeSpecific: true, storePrice: 28, currency: 'PC', collection: 'ankerbrua_eventyr_og_bro', collectable: true, source_urls: [sources[0].url, sources[5].url] }
  ],
  brands: [
    { id: 'oslo_kommune_ankerbrua', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'bridge_and_public_space_context' },
    { id: 'oslo_byes_vel_ankerbrua', name: 'Selskabet for Oslo Byes Vel', brand_kind: 'heritage_organization', brand_type: 'blue_plaque' },
    { id: 'ankertorget_context', name: 'Ankertorget', brand_kind: 'urban_context', brand_type: 'western_bridge_approach' },
    { id: 'ankerloekken_context', name: 'Ankerløkken', brand_kind: 'historical_landholding', brand_type: 'name_origin' },
    { id: 'eventyrbrua_context', name: 'Eventyrbrua', brand_kind: 'cultural_nickname', brand_type: 'public_art_identity' }
  ],
  for_na: {
    title: 'Fra trebru til Eventyrbrua',
    before: 'Den første Ankerbrua ble bygd som trebro i 1874–76. Etter gjentatte utglidninger i det vanskelige terrenget ble den revet. Krysningsstedet var etablert, men konstruksjonen måtte erstattes.',
    now: 'Dagens bro er stein- og betongbroen fra 1926. Siden 1937 har Dyre Vaas fire bronsegrupper gjort den til et kunststed så tydelig at broen også er kjent som Eventyrbrua.',
    change: 'Stedet har gått fra enkel trebru til monumental bybro og offentlig kunstrom. Den viktigste historiske forskjellen er at dagens fysiske bro er fra 1926, mens 1874 markerer begynnelsen på brostedets moderne krysningshistorie.',
    look_for: ['broens steinmaterialitet','rekkverk og skulptursokler','de fire bronsegruppene','utsynet mot Akerselva','forbindelsen mellom Torggata/Ankertorget og Søndre gate','hvordan kunstverkene markerer hvert sitt punkt på broen','det blå historieskiltet','kontrasten mellom tung brokropp og elverommet under']
  },
  nature_profile: {
    type: 'Akerselva / urban brokryssing / kunst i elverom',
    title: 'Elverommet under Eventyrbrua',
    summary: 'Nature-rundingen ved Ankerbrua tar utgangspunkt i hvordan en tung bybro møter Akerselvas lineære grøntdrag. Broen forbinder bysidene på tvers, mens elva og ganglinjene fortsetter på langs. Fra broen og elvekanten kan spilleren observere strømretning, nivåforskjell, broens skygge, kantvegetasjon og hvordan et tett trafikk- og byrom åpner seg mot vannet. De fire skulpturgruppene gjør også naturmøtet uvanlig: eventyrfigurer står som faste kulturmarkører over et bevegelig elvelandskap. Rundingen skal derfor handle om det observerbare samspillet mellom vann, konstruksjon, ferdsel og offentlig kunst. Den skal ikke dikte opp arter eller generelle økologiske effekter som ikke er dokumentert for akkurat dette brostedet.',
    themes: ['Akerselva som forbindelse og barriere','brospenn og elverom','skygge og nivåforskjell','langsgående og tverrgående ferdsel','offentlig kunst over vann','urban grønn korridor','stein og vegetasjon','kulturmarkører i bynatur'],
    nearby_place_ids: ['hausmannsbrua','nybrua_vaterlandsparken','vaterland_historisk_elvelop']
  },
  research_notes: [
    { id: 'ankerbrua_tyrihans_source_conflict', claim: 'Lokalhistoriewiki oppgir Tyrihans i ett motivsett, mens Oslo byleksikon og SNL/Norsk kunstnerleksikon oppgir Veslefrikk med fela. Canonical data følger den sterkere og konsistente kildelinjen.', status: 'source_conflict_resolved', use_in_app: false, next_source_needed: 'Eventuell primær kunstkatalog kan brukes til ytterligere kontroll.' },
    { id: 'ankerbrua_precise_first_bridge_completion', claim: 'Den første trebroen oppgis som bygd 1874–76. Canonical år for dagens stedspost settes derfor til 1926, ikke til et enkelt år for forgjengerbroen.', status: 'resolved_by_modeling', use_in_app: true, next_source_needed: '' }
  ],
  source_summary: {
    safe_sources: sources.map((source) => source.label),
    resolved_research: ['Dagens bro fra 1926 er kildebelagt.','Trebroen 1874–76 er dokumentert som forgjenger.','Oscar Hoff er dokumentert som arkitekt for 1926-broen.','Dyre Vaas fire bronsegrupper fra 1937 er kildebelagt av Oslo byleksikon og SNL.','Navnet er knyttet til Ankerløkken, som fikk navn etter Karen og Christian Ancher.'],
    remaining_holdbacks: ['Sekundært avvik om Tyrihans beholdes som research note og brukes ikke app-facing.']
  }
});
write(placePath, place);

const personPath = 'data/people/kunst/oslo/dyre_vaa.json';
const person = {
  id: 'dyre_vaa',
  name: 'Dyre Vaa',
  initials: 'DV',
  desc: 'Billedhugger og maler som utførte de fire bronsegruppene på Ankerbrua i 1937.',
  tags: ['kunst','skulptur','offentlig_kunst','ankerbrua','eventyrbrua'],
  placeId: 'ankerbrua',
  category: 'kunst',
  year: 1937,
  popupDesc: 'Dyre Vaa (1903–1980) var norsk billedhugger og maler. På Ankerbrua utførte han fire bronsegrupper med motiver fra norsk eventyr- og sagntradisjon. Utsmykningen fra 1937 ble så identitetsskapende at broen fikk tilnavnet Eventyrbrua.',
  places: ['ankerbrua'],
  image: '',
  cardImage: '',
  emne_ids: ['em_by_symbolsk_makt_og_representasjon','em_by_historiske_lag_i_hverdagsrom'],
  source_urls: [sources[0].url, sources[1].url, sources[2].url]
};
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
upsert(relations, { id: 'rel_dyre_vaa_ankerbrua_eventyrgrupper', type: 'kunstverk', place: 'ankerbrua', person: 'dyre_vaa', label: 'Fire eventyrgrupper på Ankerbrua, 1937', why: 'Dyre Vaa utførte de fire bronsegruppene som står fysisk på Ankerbrua og ga den tilnavnet Eventyrbrua.', source: sources[1].url });
write(relationsPath, relations);

const storyPath = 'data/stories/stories_ankerbrua.json';
const story = [{
  id: 'st_ankerbrua_broen_som_ble_et_eventyr',
  type: 'bridge_replacement_and_public_art_identity',
  title: 'Broen som ble et eventyr',
  year: 1926,
  place_id: 'ankerbrua',
  person_id: 'dyre_vaa',
  summary: 'Ankerbrua gikk fra en ustabil trebro på 1870-tallet til en ny stein- og betongbro i 1926. Elleve år senere ga Dyre Vaas fire bronsegrupper broen en ny identitet som Eventyrbrua.',
  story: 'Den første Ankerbrua var en trebro bygd i 1874–76. Den bandt byen sammen over Akerselva, men terrenget rundt broen var vanskelig. Gjentatte utglidninger førte til at den gamle konstruksjonen til slutt måtte rives. I 1926 stod en ny bro ferdig, tegnet av arkitekt Oscar Hoff og oppført i betong og huggen stein.\n\nDen nye broen kunne ha forblitt et rent transportledd. Men i 1937 kom billedhuggeren Dyre Vaa med fire bronsegrupper. På broen fikk Kvitebjørn kong Valemon, Per Gynt, Kari Trestakk og Veslefrikk med fela hver sin plass. Figurene gjorde mer enn å dekorere rekkverket: de endret hvordan folk husket selve infrastrukturen. Ankerbrua ble Eventyrbrua.\n\nNavnet Ankerbrua har samtidig en eldre historie enn både steinbroen og skulpturene. Det kommer fra Ankerløkken på vestsiden av elva. Løkken fikk navn etter Karen og Christian Ancher, som kjøpte eiendommen på 1700-tallet. På ett sted møtes dermed flere tidslag: en eiendomshistorie fra 1700-tallet, en trebro fra 1870-årene, en ny bro fra 1926 og offentlig kunst fra 1937.\n\nDet er nettopp denne lagdelingen som gjør Ankerbrua spesiell. Mange broer forsvinner inn i byens transportmaskineri. Her ble kunsten så sterk at den skapte et nytt navn og en ny offentlig identitet. Man går ikke bare over Akerselva; man passerer gjennom en liten utendørs fortelling i bronse.',
  sources: sources.map((source) => ({ title: source.label, url: source.url })),
  tags: ['Ankerbrua','Eventyrbrua','Dyre Vaa','Akerselva','offentlig kunst','1926','1937'],
  related_people: ['dyre_vaa'],
  related_places: ['hausmannsbrua','nybrua_vaterlandsparken','ankertorget'],
  score: { narrative: 5, historical: 5, source: 5, play_value: 5, originality: 5, total: 25 },
  arc: { start: 'En ustabil trebro må erstattes.', middle: 'Den nye steinbroen fra 1926 blir byens infrastruktur.', end: 'Dyre Vaas skulpturer gjør broen til Eventyrbrua.' },
  next_scenes: [{ place_id: 'hausmannsbrua', reason: 'Sammenlign Ankerbruas kunstidentitet med Hausmannsbruas ingeniør- og bevaringshistorie.' }]
}];
write(storyPath, story);
const storiesManifestPath = 'data/stories/stories_manifest.json';
const storiesManifest = read(storiesManifestPath);
if (!storiesManifest.files.some((row) => row.entity_id === place.id && row.path === storyPath)) storiesManifest.files.push({ category: 'by', entity_id: place.id, path: storyPath });
write(storiesManifestPath, storiesManifest);

const leksikonPath = 'data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json';
const leksikon = read(leksikonPath);
let article = leksikon.find((row) => row.place_id === place.id);
if (!article) { article = { place_id: place.id, category: 'by' }; leksikon.push(article); }
Object.assign(article, {
  version: 2,
  popupDesc: 'Ankerbrua er dagens stein- og betongbro fra 1926 på et krysningssted med trebrohistorie fra 1874–76. Dyre Vaas fire bronsegrupper fra 1937 gjorde den kjent som Eventyrbrua.',
  wikiText: [
    'Ankerbrua krysser Akerselva i forlengelsen av Torggata langs Ankertorget mot Søndre gate. Den første broen på stedet ble oppført som trebro i perioden 1874–76. Etter gjentatte utglidninger i det vanskelige terrenget ble trebroen revet, og dagens bro i betong og huggen stein ble oppført i 1926 etter tegninger av arkitekt Oscar Hoff. History Go bruker derfor 1926 som canonical år for den eksisterende broen, mens 1874–76 beholdes som forgjengerfasen.',
    'I 1937 fikk broen fire bronsegrupper av Dyre Vaa. Oslo byleksikon og Store norske leksikon oppgir motivene som Kvitebjørn kong Valemon, Per eller Peer Gynt, Kari Trestakk og Veslefrikk med fela. Utsmykningen ble så identitetsskapende at Ankerbrua også er kjent som Eventyrbrua. Kunstverket er dermed ikke et tillegg som kan skilles fra stedet; det har endret selve broens offentlige navn og mentale kartposisjon.',
    'Broens navn peker enda lenger tilbake. Ankerbrua fikk navn etter Ankerløkken, eiendommen på vestsiden av elva. Oslo byleksikon oppgir at løkkene som dannet Ankerløkken ble kjøpt av Karen og Christian Ancher på 1700-tallet, og at løkken fikk navn etter dem. Navnet, brohistorien og kunsthistorien tilhører derfor tre forskjellige perioder som møtes på samme krysningssted.',
    'Ankerbrua viser hvordan infrastruktur kan bli kultursted. Den har en praktisk rolle som forbindelse over Akerselva, men skulpturene gjør passeringen til en sekvens av fortellinger i bronse. Det blå skiltet fra Selskabet for Oslo Byes Vel legger enda et formidlingslag til stedet. Fra broen kan man samtidig lese Akerselva som grønn korridor under den tette bystrukturen.'
  ],
  summary: { one_liner: 'Bro fra 1926 som Dyre Vaas fire eventyrgrupper i 1937 gjorde til Oslos Eventyrbru.', themes: ['brohistorie','Dyre Vaa','offentlig kunst','eventyr','Akerselva','1926','1937','Ankerløkken'], tone: ['nøktern','historisk','kunstfaglig','stedsspesifikk'] },
  facts: [
    { id: 'fact_ankerbrua_01', label: 'Trebro 1874–76', desc: 'Den første broen på stedet ble bygd som trebro i perioden 1874–76.', confidence: 'high', sources: [sources[0].label, sources[5].label] },
    { id: 'fact_ankerbrua_02', label: 'Dagens bro fra 1926', desc: 'Etter utglidninger ble trebroen revet og dagens bro oppført i 1926.', confidence: 'high', sources: [sources[0].label] },
    { id: 'fact_ankerbrua_03', label: 'Oscar Hoff', desc: 'Broen fra 1926 ble oppført etter tegninger av arkitekt Oscar Hoff.', confidence: 'high', sources: [sources[0].label] },
    { id: 'fact_ankerbrua_04', label: 'Betong og huggen stein', desc: 'Dagens bro er oppført i betong og huggen stein.', confidence: 'high', sources: [sources[0].label] },
    { id: 'fact_ankerbrua_05', label: 'Fire bronsegrupper i 1937', desc: 'Dyre Vaa utsmykket broen med fire bronsegrupper i 1937.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_ankerbrua_06', label: 'Kvitebjørn kong Valemon', desc: 'Kvitebjørn kong Valemon er ett av de fire dokumenterte motivene.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_ankerbrua_07', label: 'Per Gynt', desc: 'Per/Peer Gynt er ett av motivene på broen.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_ankerbrua_08', label: 'Kari Trestakk', desc: 'Kari Trestakk er ett av de fire motivene.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_ankerbrua_09', label: 'Veslefrikk med fela', desc: 'Veslefrikk med fela er det fjerde motivet i den autoritative kildelinjen som brukes her.', confidence: 'high', sources: [sources[0].label, sources[1].label, sources[2].label] },
    { id: 'fact_ankerbrua_10', label: 'Eventyrbrua', desc: 'Skulpturene har gitt Ankerbrua tilnavnet Eventyrbrua.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_ankerbrua_11', label: 'Navn fra Ankerløkken', desc: 'Broen fikk navn etter Ankerløkken på vestsiden av Akerselva.', confidence: 'high', sources: [sources[0].label, sources[3].label] }
  ],
  chronology: [
    { id: 'chrono_ankerbrua_01', year: 1750, period: 'Ankerløkken får navn', desc: 'Karen og Christian Ancher kjøper løkkene som senere blir kjent som Ankerløkken.', confidence: 'medium', sources: [sources[3].label, sources[4].label] },
    { id: 'chrono_ankerbrua_02', year: 1874, period: 'Første trebro', desc: 'Den første Ankerbrua oppføres i perioden 1874–76.', confidence: 'high', sources: [sources[0].label, sources[5].label] },
    { id: 'chrono_ankerbrua_03', year: 1926, period: 'Ny permanent bro', desc: 'Trebroen erstattes av dagens bro i betong og huggen stein, tegnet av Oscar Hoff.', confidence: 'high', sources: [sources[0].label] },
    { id: 'chrono_ankerbrua_04', year: 1937, period: 'Eventyrskulpturene', desc: 'Dyre Vaas fire bronsegrupper settes opp og gir broen tilnavnet Eventyrbrua.', confidence: 'high', sources: [sources[0].label, sources[1].label, sources[2].label] }
  ],
  built_environment: { built_year: 1926, architects: ['Oscar Hoff'], materials: ['betong','huggen stein','bronse'], style: ['historisk bybro','steinbro','offentlig kunstintegrasjon'], original_function: 'Broforbindelse over Akerselva', current_function: 'Broforbindelse, offentlig kunststed og utsiktspunkt over Akerselva', changes: [{ label: 'Erstatning av trebro', year: 1926, desc: 'Trebroen 1874–76 erstattes av dagens mer permanente konstruksjon.', confidence: 'high', sources: [sources[0].label] }, { label: 'Kunstnerisk utsmykning', year: 1937, desc: 'Dyre Vaas fire bronsegrupper endrer broens offentlige identitet.', confidence: 'high', sources: [sources[0].label, sources[1].label] }] },
  artifacts: [
    { id: 'artifact_ankerbrua_01', title: 'Kvitebjørn kong Valemon', kind: 'bronseskulptur', desc: 'Dyre Vaas eventyrgruppe fra 1937.', where: 'Ankerbrua', confidence: 'high', image_ref: null, sources: [sources[0].label, sources[1].label] },
    { id: 'artifact_ankerbrua_02', title: 'Per Gynt', kind: 'bronseskulptur', desc: 'Dyre Vaas eventyr-/sagnfigur på broen.', where: 'Ankerbrua', confidence: 'high', image_ref: null, sources: [sources[0].label, sources[1].label] },
    { id: 'artifact_ankerbrua_03', title: 'Kari Trestakk', kind: 'bronseskulptur', desc: 'En av de fire bronsegruppene fra 1937.', where: 'Ankerbrua', confidence: 'high', image_ref: null, sources: [sources[0].label] },
    { id: 'artifact_ankerbrua_04', title: 'Veslefrikk med fela', kind: 'bronseskulptur', desc: 'Det fjerde motivet i Oslo byleksikons og SNLs dokumenterte motivsett.', where: 'Ankerbrua', confidence: 'high', image_ref: null, sources: [sources[0].label, sources[1].label, sources[2].label] }
  ],
  interpretation: {
    what_to_notice: ['de fire bronsegruppene','broens tunge steinmaterialitet','Akerselva under broen','hvordan skulpturene fordeler seg langs kryssingen','forbindelsen mellom Ankertorget/Torggata og Søndre gate','det blå historieskiltet'],
    why_it_matters: ['Ankerbrua viser hvordan offentlig kunst kan endre identiteten til hverdagsinfrastruktur.','Brostedet har flere tidslag: Ankerløkken, trebroen, 1926-broen og 1937-skulpturene.','Skulpturene gjør norsk eventyr- og sagntradisjon fysisk til stede i byrommet.'],
    counterpoints: ['1874 er startpunkt for den første trebroen, ikke byggeåret for dagens bro.','Den autoritative kildelinjen som brukes her oppgir Veslefrikk med fela; et sekundært avvik som oppgir Tyrihans brukes ikke som canonical fakta.','Navnet Ankerbrua kommer fra Ankerløkken, ikke direkte fra kunstneren eller skulpturmotivene.']
  },
  links: { entry_ids: [], related_places: ['hausmannsbrua','nybrua_vaterlandsparken','ankertorget'], related_people: ['dyre_vaa'] },
  sources: sources.map((source, index) => ({ id: `source_ankerbrua_${String(index + 1).padStart(2, '0')}`, label: source.label, type: 'external_reference', url: source.url, confidence: 'high' }))
});
write(leksikonPath, leksikon);

const quizPath = 'data/quiz/historie/ankerbrua_sets.json';
const q = (id, question, options, answerIndex, knowledge, src, claim_basis='documented_external_sources') => ({ id, question, options, answerIndex, answer: options[answerIndex], knowledge, source: src, claim_basis });
const s = (id,title,questions) => ({id,title,questions});
const quiz = {
  place_id: place.id,
  generator_version: 'chatgpt_history_go_manual_v1_source_grounded',
  generated_from: [placePath, leksikonPath, storyPath, 'data/quiz/regler/SET_MAL_README_v3.md'],
  manual_production_notes: { quality_direction: 'brohistorie → offentlig kunst → gjenkjenning → kildekritikk', source_caveats: ['Canonical år er 1926 for dagens bro.','Motivsettet følger Oslo byleksikon og SNL/NKL: Veslefrikk med fela, ikke Tyrihans.'] },
  sets: [
    s('ankerbrua_s1','Brohistorien',[q('ankerbrua_s1_q1','Når ble dagens Ankerbrua oppført?',['1926','1874','1937'],0,'Dagens bro i betong og huggen stein ble oppført i 1926.',[sources[0].label]),q('ankerbrua_s1_q2','Hva stod på stedet før dagens bro?',['En trebro fra 1874–76','En hengebro fra 1700-tallet','Ingen kryssing'],0,'Den første moderne broen på stedet var en trebro bygd 1874–76.',[sources[0].label,sources[5].label]),q('ankerbrua_s1_q3','Hvorfor ble trebroen erstattet?',['Gjentatte utglidninger i det vanskelige terrenget','Den ble flyttet til Bergen','Den var bare dekorasjon'],0,'Utglidninger førte til at trebroen ble revet.',[sources[0].label]),q('ankerbrua_s1_q4','Hvem tegnet broen fra 1926?',['Oscar Hoff','Dyre Vaa','Christian Ancher'],0,'Oscar Hoff tegnet den nye broen.',[sources[0].label]),q('ankerbrua_s1_q5','Hvilke hovedmaterialer beskriver Oslo byleksikon?',['Betong og huggen stein','Tre og tau','Glass og aluminium'],0,'Dagens bro er oppført i betong og huggen stein.',[sources[0].label]),q('ankerbrua_s1_q6','Hvorfor er canonical år 1926 og ikke 1874?',['Stedsposten representerer dagens eksisterende bro; 1874 er forgjengerbroen','1926 er året elva ble gravd ut','1874 er feil i alle kilder'],0,'Datamodellen skiller den eksisterende broen fra forgjengerfasen.',[sources[0].label],'source_modeling'),q('ankerbrua_s1_q7','Hva forbinder broen på tvers av Akerselva?',['Torggata/Ankertorget med Søndre gate','Slottet med Bygdøy','Majorstuen med Holmenkollen'],0,'Ankerbrua ligger i forlengelsen av Torggata langs Ankertorget mot Søndre gate.',[sources[0].label])]),
    s('ankerbrua_s2','Eventyrbrua',[q('ankerbrua_s2_q1','Når kom Dyre Vaas fire bronsegrupper på broen?',['1937','1926','1874'],0,'Utsmykningen ble satt opp i 1937.',[sources[0].label,sources[1].label]),q('ankerbrua_s2_q2','Hva har skulpturene gjort med broens identitet?',['De ga den tilnavnet Eventyrbrua','De gjorde den til jernbanebru','De fjernet broens navn'],0,'De fire motivene ga broen tilnavnet Eventyrbrua.',[sources[0].label,sources[1].label]),q('ankerbrua_s2_q3','Hvem laget eventyrgruppene?',['Dyre Vaa','Oscar Hoff','Christian Ancher'],0,'Dyre Vaa utførte bronsegruppene.',[sources[0].label,sources[1].label]),q('ankerbrua_s2_q4','Hvilket av disse er et dokumentert motiv?',['Kvitebjørn kong Valemon','Askeladden på månen','Nøkken i operaen'],0,'Kvitebjørn kong Valemon er ett av de fire motivene.',[sources[0].label,sources[1].label]),q('ankerbrua_s2_q5','Hvilket Ibsen-/sagnmotiv finnes på broen?',['Per Gynt','Brand','Terje Vigen'],0,'Per/Peer Gynt er ett av motivene.',[sources[0].label,sources[1].label]),q('ankerbrua_s2_q6','Hvilken eventyrfigur finnes også på broen?',['Kari Trestakk','Soria Moria slott','Prinsessen på erten'],0,'Kari Trestakk er en av bronsegruppene.',[sources[0].label]),q('ankerbrua_s2_q7','Hva er det fjerde motivet i den autoritative kildelinjen?',['Veslefrikk med fela','Tyrihans','Espen Askeladd'],0,'Oslo byleksikon og SNL/NKL oppgir Veslefrikk med fela.',[sources[0].label,sources[1].label,sources[2].label])]),
    s('ankerbrua_s3','Dyre Vaa',[q('ankerbrua_s3_q1','Hva var Dyre Vaas hovedvirke?',['Billedhugger og maler','Broingeniør','Skipsreder'],0,'Dyre Vaa var billedhugger og maler.',[sources[1].label]),q('ankerbrua_s3_q2','Hvor mange skulpturgrupper laget han til Ankerbrua?',['Fire','To','Åtte'],0,'Fire bronsegrupper ble satt opp på broen.',[sources[0].label,sources[1].label]),q('ankerbrua_s3_q3','Hva viser Ankerbrua om offentlig kunst?',['Kunst kan endre identiteten til vanlig infrastruktur','Kunst må alltid stå inne i museum','Broer kan ikke være kunststeder'],0,'Skulpturene skapte tilnavnet Eventyrbrua.',[sources[0].label,sources[1].label]),q('ankerbrua_s3_q4','Hvilket år vant Dyre Vaa konkurransen om utsmykking av Ankerbroen?',['1933','1926','1950'],0,'Norsk kunstnerleksikon oppgir førstepris i konkurransen i 1933.',[sources[2].label]),q('ankerbrua_s3_q5','Når ble gruppene utført ifølge Norsk kunstnerleksikon?',['1933–36','1874–76','1950–60'],0,'Norsk kunstnerleksikon daterer arbeidet med gruppene til 1933–36.',[sources[2].label]),q('ankerbrua_s3_q6','Når kom de på broen?',['1937','1933','1968'],0,'Oslo byleksikon og SNL oppgir 1937 for utsmykningen på broen.',[sources[0].label,sources[1].label]),q('ankerbrua_s3_q7','Hvorfor er Dyre Vaa en direkte People-of-Places-kobling?',['Han laget fysiske verk som står på Ankerbrua','Han eide Ankerløkken','Han tegnet selve broen'],0,'Hans kunstverk er fysisk integrert på stedet.',[sources[0].label,sources[1].label])]),
    s('ankerbrua_s4','Navn og tidslag',[q('ankerbrua_s4_q1','Hvor kommer navnet Ankerbrua fra?',['Ankerløkken','Et skipsanker under broen','Peder Ankers brofirma'],0,'Broen fikk navn etter Ankerløkken.',[sources[0].label,sources[3].label]),q('ankerbrua_s4_q2','Hvem kjøpte løkkene som ga Ankerløkken navn?',['Karen og Christian Ancher','Dyre Vaa og Oscar Hoff','Ibsen og Bjørnson'],0,'Oslo byleksikon knytter navnet til Karen og Christian Ancher.',[sources[3].label]),q('ankerbrua_s4_q3','Hvilket tidslag er eldst i stedshistorien?',['Ankerløkken og navnehistorien','Eventyrskulpturene fra 1937','Broen fra 1926'],0,'Navnehistorien går tilbake til 1700-tallet.',[sources[3].label,sources[4].label]),q('ankerbrua_s4_q4','Hva kom først av de moderne brofasene?',['Trebroen 1874–76','Steinbroen 1926','Skulpturene 1937'],0,'Trebroen var forgjengeren.',[sources[0].label]),q('ankerbrua_s4_q5','Hva kom etter steinbroen fra 1926?',['Dyre Vaas skulpturer i 1937','Trebroen i 1874','Ankerløkken'],0,'Utsmykningen kom elleve år etter den nye broen.',[sources[0].label,sources[1].label]),q('ankerbrua_s4_q6','Hvor mange hovedlag kan du minst lese på stedet?',['Navnehistorie, forgjengerbro, 1926-bro og 1937-kunst','Bare ett','Bare to'],0,'Stedet samler flere dokumenterte tidslag.',[sources[0].label,sources[3].label]),q('ankerbrua_s4_q7','Hva er den beste beskrivelsen av Eventyrbrua-navnet?',['Et kulturelt tilnavn skapt av skulpturene','Broens offisielle navn fra 1750','Navnet på trebroen før 1874'],0,'Tilnavnet oppstod på grunn av eventyrskulpturene.',[sources[0].label,sources[1].label])]),
    s('ankerbrua_s5','Se stedet',[q('ankerbrua_s5_q1','Hva bør du først lete etter på broen?',['De fire bronsegruppene','En jernbaneskinne','En middelalderport'],0,'Skulpturene er broens tydeligste kunstneriske signatur.',[sources[0].label]),q('ankerbrua_s5_q2','Hva kan du lese i selve brokroppen?',['Overgangen fra trebrohistorie til permanent stein-/betongbro','At broen er fra 1700-tallet','At skulpturene bærer trafikken'],0,'Dagens fysiske bro er 1926-laget.',[sources[0].label]),q('ankerbrua_s5_q3','Hva gjør Akerselva med stedets rom?',['Den skaper en langsgående korridor som broen krysser på tvers','Den stopper all ferdsel','Den er usynlig fra broen'],0,'Bro og elv organiserer to ulike bevegelsesretninger.',[sources[0].label]),q('ankerbrua_s5_q4','Hva er et godt Nature-observasjonspunkt?',['Forholdet mellom vann, broens skygge, kant og ferdsel','En udokumentert fugleart','En fjelltopp utenfor byen'],0,'Rundingen holder seg til observerbare forhold ved brostedet.',[sources[0].label],'content_guardrail'),q('ankerbrua_s5_q5','Hva markerer et ekstra historieformidlingslag?',['Det blå skiltet fra Oslo Byes Vel','Et neonskilt','Et trafikksignal fra 1750'],0,'Broen er markert med blått historieskilt.',[sources[0].label]),q('ankerbrua_s5_q6','Hvorfor er skulpturene ekstra stedsspesifikke?',['De er fysisk plassert på broen og skapte dens tilnavn','De finnes bare i en bok','De ble laget før Akerselva fantes'],0,'Kunstverkene og broidentiteten er uløselig koblet.',[sources[0].label,sources[1].label]),q('ankerbrua_s5_q7','Hva er den beste kontrasten til Hausmannsbrua?',['Ankerbrua er særlig kunstidentitet; Hausmannsbrua særlig ingeniør- og bevaringshistorie','De er samme bro','Ingen av dem krysser Akerselva'],0,'De to broene gir ulike innganger til infrastrukturen langs elva.',[sources[0].label],'route_comparison')]),
    s('ankerbrua_s6','Kildekritikk',[q('ankerbrua_s6_q1','Hvilket år skal brukes som canonical år for dagens Ankerbrua?',['1926','1874','1937'],0,'1926 er byggeåret for dagens eksisterende bro.',[sources[0].label],'source_modeling'),q('ankerbrua_s6_q2','Hva betyr 1874–76 i tidslinjen?',['Byggeperioden for forgjenger-trebroen','Byggeperioden for dagens bro','Dyre Vaas levetid'],0,'Dette er første brofase, ikke dagens konstruksjon.',[sources[0].label,sources[5].label]),q('ankerbrua_s6_q3','Hvilket motiv brukes canonical når kilder spriker mellom Veslefrikk og Tyrihans?',['Veslefrikk med fela','Tyrihans','Begge som femte skulptur'],0,'Oslo byleksikon og SNL/NKL gir en konsistent sterkere kildelinje for Veslefrikk.',[sources[0].label,sources[1].label,sources[2].label],'source_conflict'),q('ankerbrua_s6_q4','Hvorfor opprettes ikke Christian Ancher som nødvendig Ankerbrua-person i denne batchen?',['Navneforbindelsen er indirekte, mens Dyre Vaa har direkte fysisk verkstilknytning','Han finnes ikke i historien','Han bygde broen anonymt'],0,'People-rundingen prioriterer direkte fysisk stedstilknytning.',[sources[3].label,sources[4].label],'people_of_places_modeling'),q('ankerbrua_s6_q5','Hvem tegnet selve 1926-broen?',['Oscar Hoff','Dyre Vaa','Christian Ancher'],0,'Oscar Hoff er dokumentert som arkitekt for broen.',[sources[0].label]),q('ankerbrua_s6_q6','Hvem skapte kunstidentiteten i 1937?',['Dyre Vaa','Oscar Hoff','Karen Ancher'],0,'Dyre Vaas bronsegrupper gjorde broen til Eventyrbrua.',[sources[0].label,sources[1].label]),q('ankerbrua_s6_q7','Hva er den beste samlede beskrivelsen?',['En 1926-bro på et eldre krysningssted som offentlig kunst i 1937 ga ny identitet','En uendret trebro fra 1874','En skulpturpark uten transportfunksjon'],0,'Stedet kombinerer brohistorie, navnehistorie og offentlig kunst.',[sources[0].label,sources[1].label,sources[3].label])])
  ]
};
write(quizPath, quiz);

const routeIndexPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const routeIndex = read(routeIndexPath);
const row = routeIndex.find((item) => item.id === place.id);
if (!row) throw new Error('Missing Ankerbrua route index row');
for (const key of ['name','category','lat','lon','r','year','coordStatus','coordType']) row[key] = place[key];
write(routeIndexPath, routeIndex);
const manifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const manifest = read(manifestPath);
const mrow = manifest.places.find((item) => item.id === place.id);
if (!mrow) throw new Error('Missing Ankerbrua manifest row');
mrow.name = place.name;
mrow.category = place.category;
mrow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(placePath)).digest('hex');
write(manifestPath, manifest);

fs.mkdirSync('reports/ankerbrua-rounds-batch1', { recursive: true });
fs.writeFileSync('reports/ankerbrua-rounds-batch1.md', `# Ankerbrua – PlaceCard rounds batch 1\n\nDato: 2026-07-19\n\n## Avgrensning\n\nBatchen fortsetter Akerselva-ruten på neste verifiserte canonical bro etter Hausmannsbrua. Koordinatene beholdes og testes mot coordinate-evidence.\n\n## Canonical år\n\nLegacy-verdien \`1874\` representerer forgjenger-trebroens start. Canonical år endres til \`1926\`, byggeåret for dagens eksisterende bro. Trebroen 1874–76 beholdes i tidslinjen.\n\n## Person\n\nDyre Vaa opprettes som direct People-of-Places-kobling gjennom fire fysiske bronsegrupper på broen fra 1937. Christian Ancher opprettes ikke bare for den indirekte navnekjeden via Ankerløkken.\n\n## Kildekonflikt\n\nOslo byleksikon og SNL/Norsk kunstnerleksikon oppgir Veslefrikk med fela som ett av de fire motivene. Et sekundært avvik som oppgir Tyrihans holdes utenfor canonical data.\n\n## Rundinger\n\nPersoner, Natur, Merker, Verk, Civication, Aktører, Før/nå, Fortellinger og Leksikon.\n\n## Split-sikkerhet\n\nBare Ankerbrua-filen, dens route-indexrad og manifest-hash endres blant route-place-filene.\n`);

const test = `const assert=require('assert'),crypto=require('crypto'),fs=require('fs'),path=require('path');const repo=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(repo,f),'utf8'));const pp='data/places/natur/oslo/places_oslo_natur_akerselvarute/ankerbrua.json',p=read(pp),e=read('data/coordinate-evidence/oslo/natur/ankerbrua.json');assert.strictEqual(p.id,'ankerbrua');assert.strictEqual(p.category,'by');assert.strictEqual(p.year,1926);assert.deepStrictEqual([p.lat,p.lon,p.r],[e.currentCoordinate.lat,e.currentCoordinate.lon,e.currentCoordinate.r]);assert.strictEqual(p.coordStatus,'verified_geometry');const expected=['people','nature','badges','works','civication','brands','før_nå','fortellinger','leksikon'];const runtime=fs.readFileSync(path.join(repo,'js/ui/place-card.js'),'utf8'),m=runtime.match(/by:\\s*\\[([^\\]]+)\\]/);assert(m);assert.deepStrictEqual(JSON.parse('['+m[1]+']'),expected);const person=read('data/people/kunst/oslo/dyre_vaa.json')[0];assert.strictEqual(person.id,'dyre_vaa');assert.strictEqual(person.placeId,'ankerbrua');assert(person.places.includes('ankerbrua'));assert(person.source_urls.length>=3);assert(read('data/people/manifest.json').files.includes('people/kunst/oslo/dyre_vaa.json'));assert(read('data/relations.json').some(r=>r.id==='rel_dyre_vaa_ankerbrua_eventyrgrupper'));assert(p.works.length>=7);assert(p.civication_store.length>=5&&p.civication_store.every(x=>x.physicalObject&&x.placeSpecific));assert(p.brands.length>=5);assert(p.for_na.look_for.length>=8);assert(p.nature_profile.summary.length>=650);const badges=new Set(read('data/badges/by.json').sub);assert(p.underbadge_ids.length>=3&&p.underbadge_ids.every(id=>badges.has(id)));const storyPath='data/stories/stories_ankerbrua.json',story=read(storyPath)[0];assert(story.related_people.includes('dyre_vaa'));assert(story.sources.length>=6);assert(read('data/stories/stories_manifest.json').files.some(x=>x.entity_id==='ankerbrua'&&x.path===storyPath));const article=read('data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json').find(x=>x.place_id==='ankerbrua');assert(article&&article.version===2);assert(article.facts.length>=11);assert(article.chronology.length>=4);assert(article.sources.length>=6);const quiz=read('data/quiz/historie/ankerbrua_sets.json');assert.strictEqual(quiz.sets.length,6);assert(quiz.sets.every(s=>s.questions.length===7));const index=read('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json').find(x=>x.id===p.id);assert.deepStrictEqual([index.lat,index.lon,index.r,index.year],[p.lat,p.lon,p.r,p.year]);const manifest=read('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json').places.find(x=>x.id===p.id);assert.strictEqual(manifest.sha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,pp))).digest('hex'));const all=JSON.stringify({p,person,story,article,quiz});for(const token of ['1874','1926','1937','Oscar Hoff','Dyre Vaa','Kvitebjørn kong Valemon','Per Gynt','Kari Trestakk','Veslefrikk med fela','Eventyrbrua'])assert(all.includes(token),'Missing '+token);assert(!JSON.stringify({p,article,quiz}).includes('Tyrihans'));console.log('Ankerbrua rounds batch 1 OK');`;
fs.writeFileSync('tests/ankerbrua-rounds-batch1.test.js', test);
