import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, value) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`);
};
const source = (title, url) => ({ title, url });
const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });

const placeId = 'alna_utlop_bjorvika';
const placePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_utlop_bjorvika.json';
const routeManifestPath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json';
const quizPath = 'data/quiz/natur/alna_utlop_bjorvika_sets.json';
const storyPath = 'data/stories/stories_alna_utlop_bjorvika.json';
const articlePath = 'data/leksikon/places/oslo/natur/leksikon_alna_utlop_bjorvika.json';
const reportPath = 'reports/alna-utlop-bjorvika-nature-rounds-batch1.md';
const testPath = 'tests/alna-utlop-bjorvika-nature-rounds-batch1.test.js';
const mapFiles = [
  'data/natur/nature_place_map.json',
  'data/natur/nature_bird_place_map.json',
  'data/natur/nature_oslo_expansion_place_map.json',
  'data/natur/nature_routes_place_map.json',
  'data/natur/nature_etne_place_map.json'
];

const expectedFlora = [];
const expectedFauna = [
  'emne_fauna_blaameis', 'emne_fauna_fiskemaake', 'emne_fauna_graamaake',
  'emne_fauna_graaspurv', 'emne_fauna_graatrost', 'emne_fauna_graagas',
  'emne_fauna_graahegre', 'emne_fauna_gronnfink', 'emne_fauna_hettemaake',
  'emne_fauna_hvitkinngaas', 'emne_fauna_kaie', 'emne_fauna_kjottmeis',
  'emne_fauna_knoppsvane', 'emne_fauna_kraake', 'emne_fauna_kvinand',
  'emne_fauna_linerle', 'emne_fauna_pilfink', 'emne_fauna_ringdue',
  'emne_fauna_sildemaake', 'emne_fauna_skjaere', 'emne_fauna_staer',
  'emne_fauna_stillits', 'emne_fauna_stokkand', 'emne_fauna_storskarv',
  'emne_fauna_svarttrost', 'emne_fauna_taarnseiler', 'emne_fauna_tjeld',
  'emne_fauna_toppand'
].sort();

const union = { flora: [], fauna: [] };
for (const file of mapFiles) {
  const raw = readJson(file);
  const entry = (raw.places || raw)[placeId];
  if (!entry) continue;
  union.flora.push(...(entry.flora || []));
  union.fauna.push(...(entry.fauna || []));
}
union.flora = [...new Set(union.flora)].sort();
union.fauna = [...new Set(union.fauna)].sort();
if (JSON.stringify(union.flora) !== JSON.stringify(expectedFlora) || JSON.stringify(union.fauna) !== JSON.stringify(expectedFauna)) {
  throw new Error(`Uventet artsunion for ${placeId}: ${JSON.stringify(union)}`);
}

const birdSources = [
  ...readJson('data/natur/fauna/fugler_by.json'),
  ...readJson('data/natur/fauna/fugler_vatmark_og_skog.json'),
  ...readJson('data/natur/fauna/fugler_etne_stordalen.json'),
  ...readJson('data/natur/fauna/artsdatabanken_oslo_fauna.json')
];
const birds = expectedFauna.map(id => birdSources.find(x => x.id === id));
const missingBirds = expectedFauna.filter((id, index) => !birds[index]);
if (missingBirds.length) throw new Error(`Mangler fuglekort: ${missingBirds.join(', ')}`);
const birdById = Object.fromEntries(birds.map(x => [x.id, x]));

const refs = {
  snlAlna: 'https://snl.no/Alna_-_elv_i_Oslo',
  byleksAlna: 'https://oslobyleksikon.no/side/Alna_%28elv%29',
  snlBjorvika: 'https://snl.no/Bj%C3%B8rvika',
  snlOsloHistory: 'https://snl.no/Oslo_-_historie',
  elveforumHistory: 'https://www.osloelveforum.org/alnas-historiske-elvelop-bor-markeres-i-loallmenningen/',
  elveforumAlna: 'https://www.osloelveforum.org/om-alnaelva/',
  osloBjorvika: 'https://magasin.oslo.kommune.no/byplan/bjorvika-vokser-og-vokser',
  byleksLoenga: 'https://oslobyleksikon.no/side/Loenga',
  routeMap: 'data/natur/nature_routes_place_map.json',
  birdDataCity: 'data/natur/fauna/fugler_by.json',
  birdDataWetland: 'data/natur/fauna/fugler_vatmark_og_skog.json',
  birdDataOslo: 'data/natur/fauna/artsdatabanken_oslo_fauna.json'
};
const commonSources = [
  source('Store norske leksikon: Alna', refs.snlAlna),
  source('Oslo byleksikon: Alnaelva', refs.byleksAlna),
  source('Store norske leksikon: Bjørvika', refs.snlBjorvika),
  source('Store norske leksikon: Oslo historie', refs.snlOsloHistory),
  source('Oslo Elveforum: Alnas historiske elveløp', refs.elveforumHistory),
  source('Oslo Elveforum: Om Alnaelva', refs.elveforumAlna),
  source('Oslo kommune: Bjørvika vokser', refs.osloBjorvika),
  source('Oslo byleksikon: Loenga', refs.byleksLoenga),
  source('History Go: aktive naturrutekoblinger', refs.routeMap),
  source('History Go: byfugler', refs.birdDataCity),
  source('History Go: våtmarks- og skogsfugler', refs.birdDataWetland),
  source('History Go: Artsdatabanken Oslo-fauna', refs.birdDataOslo)
];

const inventoryBirds = birds.map(x => ({
  id: x.id,
  name: x.title,
  latin: x.latin,
  status: 'aktiv_kartkobling',
  map: 'nature_routes_place_map.json'
}));

const oldPlace = readJson(placePath);
const place = {
  ...oldPlace,
  desc: 'Historisk munningslandskap for Alna i Bjørvika, der middelalderens elveos, 1922-tunnelen til Kongshavn, vannspeilet fra 2000 og 28 aktive fuglearter må holdes tydelig fra hverandre.',
  popupDesc: 'Punktet representerer Alnas historiske utløpslandskap ved Sørenga, Loenga og Middelalderparken. Den naturlige munningen lå her da Oslo vokste fram omkring år 1000, men nedre Alna ble i 1922 lagt i tunnel fra Kværner til Kongshavn omtrent 900 meter sør for det gamle utløpet. Vannspeilet i Middelalderparken ble gjenskapt i 2000 som markering av den eldre munningen. Det er derfor feil å omtale punktet som dagens åpne Alna-utløp. History Gos aktive naturkart knytter 28 fuglearter til Bjørvika-sonen og ingen floraarter. Koordinaten beholdes med status `needs_detail_check` fordi munningslandskapet dekker flere historiske og moderne vannpunkter.',
  nature_profile: {
    type: 'historisk elveos / kulvertert byelv / fjordkant / urban fuglemosaikk',
    title: 'Alnas historiske utløpslandskap i Bjørvika',
    summary: `Alnas naturlige utløp lå mellom Grønlia og Sørenga på østsiden av Bjørvika. Her møtte elva fjorden da Oslo vokste fram omkring år 1000. Elveosen ga en beskyttet ankringsplass, tilgang til ferskvann og en ferdselslinje innover dalføret. Middelalderbyen, Kongsgården og Mariakirken lå i nær tilknytning til denne strand- og munningssonen. Stedet er derfor både et naturhistorisk sluttpunkt for Alna og et av grunnlagene for Oslos tidlige byutvikling.\n\nMunningen har ikke ligget på nøyaktig samme sted gjennom historien. Landheving, sedimenter, sagflis, mudder og omfattende utfyllinger flyttet strandlinjen og forlenget elveløpet utover. På 1800-tallet gikk Alna gjennom området som senere ble Loallmenningen og innerst i Lohavn. Et historisk munningspunkt må derfor forstås som et landskap i endring, ikke som ett evig koordinatpunkt. De tre eksisterende ankerpunktene i stedfila brukes som foreløpige rute- og observasjonspunkter, men koordinatstatusen `needs_detail_check` skal beholdes til en egen detaljrevisjon mot historiske strandlinjer, kulvertdata og dagens byrom er gjennomført.\n\nI 1922 ble nedre Alna lagt i tunnel fra Kværnerområdet gjennom Ekeberg til Kongshavn i Bunnefjorden, omtrent 900 meter sør for det naturlige utløpet. Senere ble flere nedre fosser og elvestrekninger ført inn i rør. Dagens faktiske vannføring munner derfor ikke åpent ut ved Middelalderparken eller Loallmenningen. Rundingen skal skille mellom den historiske elvetraseen, dagens tunnelutløp ved Kongshavn og synlige vannflater i Bjørvika. Et synlig basseng, kanaldrag eller sjøvann er ikke automatisk Alnavann.\n\nTil Oslos tusenårsjubileum i 2000 ble et vannspeil etablert ved Alnas middelalderske munning i Middelalderparken. Vannspeilet gjenskaper en historisk strand- og munningsidé, men ligger i dagens landskap innenfor den gamle strandlinjen. Det er et kulturhistorisk og landskapsarkitektonisk element, ikke dokumentasjon på at Alna igjen går åpen. Planer og vedtak om gjenåpning eller markering av elveløpet har eksistert, blant annet forslag om sjøvannskanal i Loallmenningen, men rundingen skal ikke omtale framtidige eller forsinkede tiltak som gjennomført.\n\nBjørvika er samtidig et aktivt fjord- og havnerom. Kaier, broer, boliger, kulturbygg, jernbane, veier, parker og åpne vannflater danner en svært sammensatt habitatmosaikk. Vannets saltholdighet, nivå og strøm påvirkes av fjorden, mens overflatevann og kulverterte vassdrag tilfører ferskvann andre steder. Spilleren skal observere bølger, vannstandsspor, flytende materiale, kaikonstruksjoner, vegeterte lommer og fuglenes bruk av sonene uten å hevde at synlige variasjoner alene beviser ferskvannsinnblanding fra Alna.\n\nHistory Gos fem aktive naturkart gir en union på 28 fuglearter og ingen floraarter for place-id-en. Vann- og fjordnære arter omfatter stokkand, knoppsvane, toppand, kvinand, gråhegre, storskarv og tjeld. Måker og gjess omfatter hettemåke, gråmåke, fiskemåke, sildemåke, grågås og hvitkinngås, mens linerle ofte bruker åpne kanter og dekker. By- og havnefugler som kråke, skjære, kaie, gråspurv, pilfink, ringdue og stær bruker tak, master, plasser, trær og søkeområder. Vegetasjons- og luftromsarter omfatter gråtrost, svarttrost, blåmeis, kjøttmeis, grønnfink, stillits og tårnseiler.\n\nDenne artslisten er stor fordi Bjørvika samler mange miljøer og fordi kartgrunnlaget har mange relevante observasjoner. Det betyr ikke at alle 28 arter kan sees samtidig eller i alle årstider. Hver registrering må bygge på faktisk fjærdrakt, lyd, kroppsform, flygemåte eller atferd. Måker og gjess kan være krevende å skille, særlig unge fugler og overgangsdrakter. En god logg kan derfor bruke artsgruppe eller usikkerhetsmarkering når kjennetegnene ikke er tydelige. Fugler skal ikke mates eller jages, og hvilende flokker ved kai eller vannkant skal få avstand.\n\nUtløpsrundingen samler hele Alna-ruten, men ikke som et enkelt synlig vannløp. Fra Alnsjøens kildeområde går reisen gjennom parker, dam, næringskorridor, foss, ravine og transformert industriområde før den historiske traseen når Bjørvika. Den faktiske tunnelen fortsetter til Kongshavn. Ved sluttpunktet lærer spilleren derfor både økologisk sammenheng og brudd: samme vassdrag kan være åpent, regulert, kulvertert, symbolsk gjenskapt og historisk markert på ulike steder.\n\nStedets viktigste feltregel er å holde nivåene fra hverandre. «Historisk elveos» beskriver middelalderens og senere strandlandskap. «Dagens tunnelutløp» beskriver vannføringen til Kongshavn. «Vannspeilet» beskriver markeringen fra 2000. «Bjørvika-fjorden» beskriver dagens synlige sjøvann og kaihabitat. Først når disse lagene skilles, blir fugleobservasjoner, byhistorie og vassdragsforståelse presise.`,
    themes: [
      'Alnas naturlige munning mellom Grønlia og Sørenga',
      'Oslo grunnlagt ved elveosen omkring år 1000',
      'landheving, sedimenter og utfyllinger flyttet strandlinjen',
      'historisk løp gjennom Loallmenningen og Lohavn',
      'nedre Alna lagt i tunnel i 1922',
      'dagens tunnelutløp ved Kongshavn',
      'vannspeilet ved middelaldermunningen fra 2000',
      'planlagt eller foreslått gjenåpning er ikke gjennomført fakta',
      'fjord-, kai- og byhabitat i Bjørvika',
      '28 aktive fuglearter og ingen floraarter',
      'kartkobling mot faktisk feltfunn',
      'koordinatstatus needs_detail_check beholdes'
    ],
    species_inventory: {
      source_maps: mapFiles,
      flora: [],
      fauna: inventoryBirds,
      total_species: 28,
      rule: 'all_active_mapped_species_for_place'
    },
    outlet_system: {
      historical_natural_outlet: 'mellom Grønlia og Sørenga / middelalderens strand ved dagens Middelalderpark-område',
      current_water_route: 'tunnel fra Kværnerområdet til Kongshavn siden 1922',
      commemorative_water_feature: 'Middelaldervannspeilet etablert i 2000',
      coordinate_status: 'needs_detail_check',
      caution: 'Punktet må ikke omtales som dagens åpne Alna-munning.'
    },
    nearby_place_ids: ['kvaernerbyen_alna', 'svartdalen', 'bjorvika']
  },
  tags: ['historisk_utlop', 'kulvert', 'fjord', 'bjorvika', 'middelalderby', 'fugler', 'blagronn_struktur'],
  underbadge_ids: [
    'urbannatur', 'vann_og_vassdrag', 'kyst_og_fjord', 'strandsone', 'elv',
    'elvebredde', 'vannkvalitet', 'vannfugl', 'fugler', 'biologisk_mangfold',
    'okosystem', 'habitat', 'nisje', 'kretslop', 'erosjon', 'sedimenter',
    'spredningskorridor', 'blagronn_struktur', 'naturrestaurering', 'miljotiltak',
    'artsregistrering', 'friluftsforvaltning', 'forurensning', 'klimatilpasning',
    'friluftsliv', 'tursti', 'utsiktspunkt', 'fugletitting', 'rekreasjon',
    'nabolagsnatur', 'grontdrag', 'strandavsetning'
  ],
  visual: { designCode: 'waterfront_miniature' },
  emne_ids: ['em_natur_arter_habitat_mangfold'],
  quiz_profile: {
    place_type: 'historisk elveos, kulvertert byelv og urban fjordkant',
    subtype: 'alna_utlop_bjorvika',
    signature_features: [
      'middelalderens naturlige Alna-munning',
      'tunnelen til Kongshavn fra 1922',
      'Middelaldervannspeilet fra 2000',
      'historisk løp markert eller foreslått i Loallmenningen',
      '28 aktive fuglearter og ingen floraarter'
    ],
    primary_angles: ['historisk_munning', 'kulvert_mot_synlig_vann', 'strandlinjeendring', 'fjord_og_kaihabitat', 'stor_fugleunion'],
    question_families: ['stedsspesifikk_vassdragshistorie', 'vannsystem_og_kildekritikk', 'fugleidentifikasjon', 'habitatsoner', 'forvaltningsvalg', 'ruteoppsummering'],
    avoid_angles: ['dagens_aapne_alna_i_bjorvika', 'artsfunn_som_garanti', 'fuglemating', 'udokumentert_saltholdighet', 'koordinat_som_endelig_munningsfasit'],
    must_include: ['naturlig munning', '1922', 'Kongshavn', 'vannspeilet 2000', '28 fuglearter', 'needs_detail_check'],
    contrast_targets: ['kvaernerbyen_alna', 'svartdalen', 'bjorvika'],
    notes: 'Start med å skille historisk munning, tunnelutløp, vannspeil og dagens fjord. Fugler grupperes etter habitat, men registreres individuelt ved sikre kjennetegn.'
  },
  externalLinks: [
    { type: 'reference', label: 'Store norske leksikon: Alna', url: refs.snlAlna, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Alnaelva', url: refs.byleksAlna, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Store norske leksikon: Bjørvika', url: refs.snlBjorvika, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Store norske leksikon: Oslo historie', url: refs.snlOsloHistory, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo Elveforum: historisk Alna-løp', url: refs.elveforumHistory, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo Elveforum: Om Alnaelva', url: refs.elveforumAlna, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo kommune: Bjørvika vokser', url: refs.osloBjorvika, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Loenga', url: refs.byleksLoenga, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: aktive naturrutekoblinger', url: refs.routeMap, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: byfugler', url: refs.birdDataCity, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: våtmarks- og skogsfugler', url: refs.birdDataWetland, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: Oslo-fauna', url: refs.birdDataOslo, lang: 'nb', verifiedAt: '2026-07-20' }
  ],
  tasks_profile: {
    title: 'Skill fire utløpslag',
    summary: 'Fire oppgaver skiller historisk elveos, tunnelutløp, vannspeil og dagens fjordhabitat før fugledata registreres.',
    tasks: [
      { id: 'alna_utlop_oppgave_fire_lag', title: 'Kartlegg fire vannlag', instruction: 'Lag fire separate notater: historisk munning, 1922-tunnel til Kongshavn, vannspeilet fra 2000 og dagens synlige Bjørvika-vann. Skriv kilden bak hvert lag.', why: 'Stedet blir feil dersom alle vannflater omtales som samme Alna-utløp.' },
      { id: 'alna_utlop_oppgave_strandlinje', title: 'Les den flyttede strandlinjen', instruction: 'Se etter terreng, kaier, fyllinger, jernbane og parkrom som viser at dagens landform ikke er middelalderens strand. Skille synlige spor fra historisk rekonstruksjon.', why: 'Landheving og utfylling har flyttet munningslandskapet betydelig.' },
      { id: 'alna_utlop_oppgave_fugletransect', title: 'Gå et fugletransekt', instruction: 'Observer i fire soner: åpent vann, kaikant, parkvegetasjon og bygg/tak. Registrer art, antall, atferd og sikkerhetsgrad uten mating.', why: 'De 28 artene bruker forskjellige deler av fjordbyen.' },
      { id: 'alna_utlop_oppgave_ruteoppsummering', title: 'Sammenlign hele Alna-ruten', instruction: 'Velg tre tidligere steder og noter hvordan vannet der var åpent, regulert, designet eller skjult. Avslutt med forskjellen mellom historisk og faktisk nåværende utløp.', why: 'Sluttpunktet skal samle vassdragets ulike former, ikke redusere dem til ett kartikon.' }
    ]
  },
  training_profile: {
    title: 'Trygg fjord- og historieløype',
    summary: 'Tre øvelser bruker offentlige gangflater og utsiktspunkter uten ferdsel på kaikant, anleggsområder eller is.',
    safety: 'Bruk etablerte gangveier, parker og utsiktspunkter. Hold god avstand til ubeskyttede kaikant, havnetrafikk, anleggsområder og glatte flater. Ikke gå ut på is eller inn i avsperrede soner. Ikke mat, jag eller nærm deg hvilende fugleflokker. Vis hensyn til syklister, beboere og kulturminner.',
    exercises: [
      { id: 'alna_utlop_trening_historierunde', title: 'Rolig utløpsrunde', instruction: 'Gå 20 minutter mellom trygge punkter ved Middelalderparken, Loenga-/Sørenga-retningen og fjordutsyn.', duration_minutes: 20, intensity: 'rolig', why: 'Runden gjør avstanden mellom historisk munning, dagens byflate og fjorden fysisk lesbar.' },
      { id: 'alna_utlop_trening_gangdrag', title: 'Fem brede gangdrag', instruction: 'Velg en bred offentlig gangstrekning. Gå raskt i 45 sekunder og rolig i 75 sekunder, fem ganger.', duration_minutes: 10, intensity: 'moderat', why: 'Økten bruker robuste flater uten å belaste kaikant eller fuglesoner.' },
      { id: 'alna_utlop_trening_fire_stopp', title: 'Fire vann- og fuglestopp', instruction: 'Stans ved park, vannspeil, fjordutsyn og by-/takutsyn. Observer hvert sted i ett minutt.', duration_minutes: 6, intensity: 'lett', why: 'Stoppene gjør de fire utløpslagene og habitatsonene tydelige.' }
    ]
  },
  civication_store: [
    { id: 'alna_utlop_firelag_modell', title: 'Modell av Alnas fire utløpslag', type: 'systemmodell', kind: 'physical_object', desc: 'Lagmodell med middelaldermunning, historisk forlenget løp, 1922-tunnel til Kongshavn og vannspeilet fra 2000.', placeSpecificReason: 'Stedets hovedoppgave er å holde historiske og moderne vannsystemer fra hverandre.', historicalFunction: 'Viser hvordan elveos, strandlinje og infrastruktur har flyttet seg.', physicalObject: true, placeSpecific: true, storePrice: 54, currency: 'PC', collection: 'alna_utlop_bjorvika', collectable: true },
    { id: 'alna_utlop_strandlinjekart', title: 'Bjørvika strandlinjer gjennom tid', type: 'historisk_kart', kind: 'physical_object', desc: 'Kartlag for middelalderstrand, 1800-talls løp, utfyllinger og dagens kaier.', placeSpecificReason: 'Munningspunktet kan ikke forstås uten strandlinjeendring.', historicalFunction: 'Knytter landheving, sedimenter og byfylling til Oslos utvikling.', physicalObject: true, placeSpecific: true, storePrice: 48, currency: 'PC', collection: 'alna_utlop_bjorvika', collectable: true },
    { id: 'alna_utlop_fugleatlas', title: 'Fugleatlas for Bjørvika', type: 'feltatlas', kind: 'physical_object', desc: 'Foldbart atlas med alle 28 aktive arter gruppert etter vann, kai, park, bygg og luftrom.', placeSpecificReason: 'Dette er Alna-rutens største aktive artsunion.', historicalFunction: 'Dokumenterer hvordan en ombygget fjordby fortsatt fungerer som fuglehabitat.', physicalObject: true, placeSpecific: true, storePrice: 46, currency: 'PC', collection: 'alna_utlop_bjorvika', collectable: true },
    { id: 'alna_utlop_middelaldervannspeil', title: 'Miniatyr av Middelaldervannspeilet', type: 'landskapsmodell', kind: 'physical_object', desc: 'Miniatyr av vannspeilet, ruinområdet og den rekonstruerte strandideen.', placeSpecificReason: 'Vannspeilet markerer den eldre munningen uten å være dagens åpne Alna.', historicalFunction: 'Knytter tusenårsjubileet i 2000 til middelalderbyens naturgrunnlag.', physicalObject: true, placeSpecific: true, storePrice: 42, currency: 'PC', collection: 'alna_utlop_bjorvika', collectable: true }
  ],
  brands: [
    { id: 'alna_utlop_bjorvika_actor', name: 'Alnas historiske utløp', brand_kind: 'historic_river_mouth', brand_type: 'primary_place' },
    { id: 'alnaelva_actor_utlop', name: 'Alnaelva', brand_kind: 'urban_river', brand_type: 'buried_and_historic_system' },
    { id: 'bjorvika_actor_alna', name: 'Bjørvika', brand_kind: 'fjord_district', brand_type: 'urban_water_context' },
    { id: 'middelalderparken_actor_alna', name: 'Middelalderparken', brand_kind: 'heritage_park', brand_type: 'historic_mouth_context' },
    { id: 'middelaldervannspeilet_actor', name: 'Middelaldervannspeilet', brand_kind: 'commemorative_water_feature', brand_type: 'historic_landscape_marker' },
    { id: 'kongshavn_actor_alna', name: 'Kongshavn', brand_kind: 'tunnel_outlet', brand_type: 'current_water_outlet_context' },
    { id: 'loallmenningen_actor_alna', name: 'Loallmenningen', brand_kind: 'urban_common', brand_type: 'historic_course_context' },
    { id: 'loenga_actor_alna', name: 'Loenga', brand_kind: 'historic_district', brand_type: 'mouth_landscape_context' },
    { id: 'oslo_kommune_alna_utlop', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'planning_authority' },
    { id: 'oslo_havn_alna_utlop', name: 'Oslo Havn', brand_kind: 'port_authority', brand_type: 'fjord_and_quay_actor' },
    { id: 'oslo_elveforum_alna_utlop', name: 'Oslo Elveforum', brand_kind: 'river_forum', brand_type: 'knowledge_and_advocacy_actor' },
    { id: 'alnaelvas_venner_utlop', name: 'Alnaelvas Venner', brand_kind: 'local_association', brand_type: 'river_care_actor' }
  ],
  for_na: {
    title: 'Fra naturlig elveos til tunnel, fyllinger og historisk vannspeil',
    before: 'Alna munnet naturlig ut mellom Grønlia og Sørenga. Elveosen, strandsonen og dalføret ga grunnlag for markedsplass, havn og den tidlige byen omkring år 1000. Senere flyttet strandlinjen seg gjennom landheving, avsetninger og utfyllinger.',
    now: 'Siden 1922 går den nedre elva i tunnel til Kongshavn. Ved middelaldermunningen ligger et vannspeil fra 2000, mens Bjørvika ellers består av fjord, kaier, parker, jernbane, kulturbygg og nye byområder. Punktet er et historisk ruteanker, ikke en bekreftet åpen munning.',
    change: 'Elveosen har gått fra synlig natur- og bygrunnlag til skjult infrastruktur og landskapsminne. Fuglene viser at dagens fjordby fortsatt har økologiske funksjoner, men vassdragshistorien kan bare forstås ved å skille trase, tunnel, vannspeil og sjø.',
    look_for: [
      'Middelaldervannspeilet som historisk markering',
      'ruin- og parklandskapet ved den gamle munningen',
      'kaier, fyllinger og jernbane som har endret strandlinjen',
      'siktlinjer mot Sørenga, Grønlia og fjorden',
      'manglende synlig åpen Alna ved historisk punkt',
      'åpent vann, kaikant, parkvegetasjon og bygg som fuglesoner',
      'måker, gjess, ender og andre vannfugler ved faktiske funn',
      'byfugler på tak, master, plasser og trær',
      'skilting eller kulturhistorisk formidling av middelalderbyen',
      'forskjellen mellom dagens synlige fjord og dokumentert tunnelutløp ved Kongshavn'
    ],
    sources: Object.values(refs)
  }
};

const story = [{
  id: 'st_alna_utlop_bjorvika_elva_som_grunnla_byen_og_forsvant',
  type: 'environmental',
  title: 'Elva som grunnla byen og forsvant under bakken',
  year: 1922,
  place_id: placeId,
  person_id: null,
  summary: 'Alnas naturlige utløp ga grunnlag for middelalderbyen, men strandlinjen flyttet seg og nedre elv ble lagt i tunnel til Kongshavn.',
  story: `Omkring år 1000 lå Alnas elveos ved den tidlige byen på østsiden av Bjørvika. Elva ga ferskvann, en ferdselslinje og en beskyttet møteplass mellom land og fjord.\n\nGjennom århundrene flyttet munningen seg. Landet steg, elva avsatte materiale, og byen fylte ut stadig mer sjø. Det som hadde vært strand og elveløp, ble etter hvert havn, jernbane og byflate.\n\nI 1922 ble nedre Alna lagt i tunnel fra Kværner til Kongshavn. Den historiske munningen ble dermed skilt fra dagens vannføring. Til Oslos tusenårsjubileum i 2000 ble et vannspeil etablert ved middelalderens munningsområde, men vannspeilet er en markering—ikke en gjenåpnet Alna.\n\nI dagens Bjørvika flyr måker, gjess, ender, kråkefugler og småfugler mellom fjord, park, tak og kaier. De viser at naturfunksjoner består i et sterkt ombygget landskap. Samtidig minner den skjulte elva om at et vassdrag kan være historisk avgjørende selv når sluttløpet ikke lenger er synlig.`,
  sources: commonSources,
  tags: ['alna_utlop_bjorvika', 'alnaelva', 'middelalderby', 'kulvert', 'kongshavn', 'vannspeil', 'fugler'],
  related_people: [],
  related_places: ['kvaernerbyen_alna', 'svartdalen', 'bjorvika'],
  score: { narrative: 5, historical: 5, source: 5, play_value: 5, originality: 5, total: 25 },
  arc: {
    start: 'Alnas naturlige elveos ga grunnlag for den tidlige byen.',
    middle: 'Strandlinjen flyttet seg, og nedre elv ble lagt i tunnel til Kongshavn i 1922.',
    end: 'Vannspeilet og dagens fugleliv gjør den skjulte vassdragshistorien lesbar uten å late som elva er åpen.'
  },
  next_scenes: [
    { place_id: 'kvaernerbyen_alna', reason: 'Kværnerbyen viser overgangen fra synlig ravine til kulvert og formgitt vannminne.' },
    { place_id: 'alnsjoen_alna_kilde', reason: 'Kildeområdet gir hele ruten en sirkulær sammenheng fra skogsvann til fjordhistorie.' }
  ]
}];

const fact = (id, label, desc, sources, confidence = 'high') => ({ id, label, desc, confidence, sources });
const chronology = [
  { id: 'chrono_01', year: 1000, period: 'Bydannelse ved elveosen', desc: 'Bymessig bebyggelse vokste fram ved Alnas naturlige utløp omkring år 1000.', confidence: 'high', sources: [source('Store norske leksikon: Oslo historie', refs.snlOsloHistory), source('Oslo byleksikon: Alnaelva', refs.byleksAlna)] },
  { id: 'chrono_02', year: 1226, period: 'Skip trekkes opp Alna', desc: 'Håkon Håkonsson lot skip trekke opp elva som del av en ferdsels- og militær rute.', confidence: 'high', sources: [source('Oslo byleksikon: Alnaelva', refs.byleksAlna)] },
  { id: 'chrono_03', year: 1300, period: 'Teglverk ved munningen', desc: 'Håkon 5 hadde teglverk ved Loenga-området omkring år 1300.', confidence: 'medium', sources: [source('Oslo byleksikon: Loenga', refs.byleksLoenga)] },
  { id: 'chrono_04', year: 1881, period: 'Historisk løp dokumenteres', desc: 'Krums kart viser det forlengede elveløpet gjennom senere Loallmenningen og mot sjøen.', confidence: 'high', sources: [source('Oslo Elveforum: historisk Alna-løp', refs.elveforumHistory)] },
  { id: 'chrono_05', year: 1922, period: 'Nedre Alna legges i tunnel', desc: 'Elva ble ført fra Kværnerområdet til Kongshavn omtrent 900 meter sør for det naturlige utløpet.', confidence: 'high', sources: [source('Store norske leksikon: Alna', refs.snlAlna), source('Oslo byleksikon: Alnaelva', refs.byleksAlna)] },
  { id: 'chrono_06', year: 2000, period: 'Middelaldervannspeilet etableres', desc: 'Vannspeilet ved den historiske munningen ble gjenskapt til Oslos tusenårsjubileum.', confidence: 'high', sources: [source('Store norske leksikon: Alna', refs.snlAlna)] },
  { id: 'chrono_07', year: 2003, period: 'Sjøvannskanal legges inn i plan', desc: 'Bjørvikaplanen tok inn en sjøvannskanal i Loallmenningen som markering av historisk løp.', confidence: 'high', sources: [source('Oslo Elveforum: historisk Alna-løp', refs.elveforumHistory)] },
  { id: 'chrono_08', year: 2013, period: 'Gjenåpningsmål vedtas', desc: 'Bystyret vedtok et mål om gjenåpning mot Middelaldervannspeilet, men gjennomføring er ikke dokumentert som fullført.', confidence: 'medium', sources: [source('Oslo Elveforum: historisk Alna-løp', refs.elveforumHistory)] },
  { id: 'chrono_09', year: 2026, period: 'History Go-rundingen', desc: 'Utløpsstedet får full natur-runding med 28 fuglearter og streng kontroll av historisk og nåværende vannsystem.', confidence: 'high', sources: [source('History Go: aktive naturrutekoblinger', refs.routeMap)] }
];
const article = {
  place_id: placeId,
  visual: { designCode: 'article_nature_route_miniature' },
  version: 2,
  title: 'Alnas historiske utløp i Bjørvika',
  popupDesc: 'Historisk elveos ved middelalderbyen, skilt fra dagens tunnelutløp ved Kongshavn, med vannspeil fra 2000 og 28 aktive fuglearter i Bjørvika-sonen.',
  wikiText: [
    'Alnas naturlige utløp lå mellom Grønlia og Sørenga, og Oslo vokste fram ved elveosen omkring år 1000.',
    'Landheving, avsetninger og utfyllinger endret strandlinjen og flyttet elveløpet utover gjennom århundrene.',
    'I 1922 ble nedre Alna lagt i tunnel fra Kværner til Kongshavn omtrent 900 meter sør for den naturlige munningen.',
    'Vannspeilet i Middelalderparken ble etablert i 2000 som historisk markering. Det er ikke dagens åpne Alna.',
    'History Gos aktive naturkart knytter 28 fuglearter og ingen floraarter til Bjørvika-sonen.'
  ],
  summary: {
    one_liner: 'Bjørvika viser Alna som historisk elveos, skjult tunnelvassdrag, landskapsminne og moderne fuglehabitat.',
    themes: ['middelaldermunning', 'strandlinjeendring', '1922-tunnel', 'Kongshavn', 'vannspeil 2000', '28 fuglearter'],
    tone: ['nøktern', 'kildekritisk', 'stedsspesifikk']
  },
  facts: [
    fact('fact_01', 'Naturlig utløp', 'Alnas naturlige utløp lå mellom Grønlia og Sørenga.', [source('Store norske leksikon: Alna', refs.snlAlna)]),
    fact('fact_02', 'Tidlig by', 'Oslo vokste fram ved elveosen omkring år 1000.', [source('Store norske leksikon: Oslo historie', refs.snlOsloHistory), source('Oslo byleksikon: Alnaelva', refs.byleksAlna)]),
    fact('fact_03', 'Strandlinjeendring', 'Landheving, sedimenter og utfyllinger endret munningslandskapet.', [source('Oslo Elveforum: historisk Alna-løp', refs.elveforumHistory), source('Store norske leksikon: Bjørvika', refs.snlBjorvika)]),
    fact('fact_04', 'Historisk forlengelse', 'På 1800-tallet gikk elveløpet gjennom området som i dag forbindes med Loallmenningen og Lohavn.', [source('Oslo Elveforum: historisk Alna-løp', refs.elveforumHistory)]),
    fact('fact_05', 'Tunnelår', 'Nedre Alna ble lagt i tunnel i 1922.', [source('Store norske leksikon: Alna', refs.snlAlna), source('Oslo Elveforum: Om Alnaelva', refs.elveforumAlna)]),
    fact('fact_06', 'Dagens utløp', 'Tunnelen fører vannet til Kongshavn sør for Gamlebyen.', [source('Store norske leksikon: Alna', refs.snlAlna)]),
    fact('fact_07', 'Avstand', 'Kongshavn-utløpet ligger omtrent 900 meter sør for det naturlige utløpet.', [source('Oslo byleksikon: Alnaelva', refs.byleksAlna)]),
    fact('fact_08', 'Vannspeil', 'Vannspeilet ved middelaldermunningen ble etablert i 2000.', [source('Store norske leksikon: Alna', refs.snlAlna)]),
    fact('fact_09', 'Ikke åpen elv', 'Vannspeilet er en historisk markering og dokumenterer ikke åpen Alna-vannføring.', [source('Store norske leksikon: Alna', refs.snlAlna), source('Oslo byleksikon: Alnaelva', refs.byleksAlna)]),
    fact('fact_10', 'Planlagt markering', 'Sjøvannskanal i Loallmenningen har vært planlagt som markering av historisk løp.', [source('Oslo Elveforum: historisk Alna-løp', refs.elveforumHistory)]),
    fact('fact_11', 'Aktiv artsunion', 'History Gos naturkart knytter 28 fuglearter og ingen floraarter til place-id-en.', [source('History Go: aktive naturrutekoblinger', refs.routeMap)]),
    fact('fact_12', 'Vannfugler', 'Ender, svane, skarv, hegre og tjeld representerer vann- og strandnære nisjer.', [source('History Go: våtmarks- og skogsfugler', refs.birdDataWetland), source('History Go: Oslo-fauna', refs.birdDataOslo)]),
    fact('fact_13', 'Måker og gjess', 'Fire måkearter og to gjess er aktive kartkoblinger i sonen.', [source('History Go: Oslo-fauna', refs.birdDataOslo)]),
    fact('fact_14', 'Byfugler', 'Kråkefugler, duer, spurver og stær bruker bygg, plasser, trær og søkeområder.', [source('History Go: byfugler', refs.birdDataCity), source('History Go: Oslo-fauna', refs.birdDataOslo)]),
    fact('fact_15', 'Usikkerhetsregel', 'Alle artskoblinger må bekreftes med faktiske kjennetegn ved besøket.', [source('History Go: aktive naturrutekoblinger', refs.routeMap)]),
    fact('fact_16', 'Koordinatstatus', 'Stedspunktet er et foreløpig områdeanker med status needs_detail_check.', [source('History Go: aktiv stedfil', placePath)])
  ],
  chronology,
  sections: [
    { id: 'middelalderos', title: 'Elveosen og byen', text: 'Den naturlige munningen ga ferskvann, havn og ferdselslinje og var sentral for den tidlige byen.' },
    { id: 'tunnel', title: 'Tunnel til Kongshavn', text: 'Siden 1922 har nedre Alna gått under bakken til et annet utløpspunkt sør for Gamlebyen.' },
    { id: 'vannspeil', title: 'Vannspeilet som markering', text: 'Vannspeilet fra 2000 gjenskaper en historisk idé, men skal ikke forveksles med åpen elv.' },
    { id: 'fuglemosaikk', title: '28 fugler i fjordbyen', text: 'Vann, kai, park, tak og luftrom gir mange nisjer, men hver art må dokumenteres gjennom faktiske kjennetegn.' }
  ],
  related_places: ['kvaernerbyen_alna', 'svartdalen', 'bjorvika'],
  sources: commonSources
};

const qSources = {
  history: [refs.snlAlna, refs.byleksAlna, refs.snlOsloHistory],
  shoreline: [refs.snlBjorvika, refs.elveforumHistory, refs.byleksLoenga],
  tunnel: [refs.snlAlna, refs.byleksAlna, refs.elveforumAlna],
  birds: [refs.routeMap, refs.birdDataCity, refs.birdDataWetland, refs.birdDataOslo],
  mixed: [refs.snlAlna, refs.elveforumHistory, refs.routeMap]
};
const q = (question, answer, distractors, knowledge, sourceKey, layer, difficulty = 1) => ({ question, answer, distractors, knowledge, source: qSources[sourceKey], layer, difficulty });
const setSpecs = [
  { mode: 'place_intro', layer: 'intro', questions: [
    q('Hvor lå Alnas naturlige utløp?', 'Mellom Grønlia og Sørenga', ['Ved Aker Brygge', 'Ved Lysaker'], 'Den naturlige munningen lå på østsiden av Bjørvika.', 'history', 'intro'),
    q('Hva vokste fram ved elveosen omkring år 1000?', 'Den tidlige byen Oslo', ['Bergen sentrum', 'En fjellstasjon'], 'Elveosen var et naturgrunnlag for bydannelsen.', 'history', 'intro'),
    q('Hvor går nedre Alna i dag?', 'I tunnel til Kongshavn', ['Åpent gjennom vannspeilet', 'Til Akerselva'], 'Dagens vannføring følger tunnelen fra 1922.', 'tunnel', 'intro'),
    q('Hva er vannspeilet i Middelalderparken?', 'En historisk landskapsmarkering', ['Dagens åpne Alna', 'En naturlig tidevannsdam'], 'Vannspeilet ble etablert i 2000.', 'history', 'intro'),
    q('Hvor mange aktive artskoblinger har stedet?', '28 fuglearter', ['28 planter', 'Én fugl'], 'Artsunionen har 28 fugler og ingen flora.', 'birds', 'intro'),
    q('Hva betyr needs_detail_check?', 'Koordinatet er ikke endelig detaljverifisert', ['Stedet er slettet', 'Alle ankere er perfekte'], 'Munningslandskapet krever egen kartrevisjon.', 'mixed', 'intro'),
    q('Hva er hovedregelen på stedet?', 'Skill historisk munning, tunnel, vannspeil og fjord', ['Kall alt synlig vann Alna', 'Ignorer historiske strandlinjer'], 'Fire vannlag må holdes fra hverandre.', 'mixed', 'intro')
  ]},
  { mode: 'river_history', layer: 'history', questions: [
    q('Når ble nedre Alna lagt i tunnel?', '1922', ['2000', '2013'], 'Tunnelen endret elvas synlige sluttløp.', 'tunnel', 'history'),
    q('Hvor munner tunnelen ut?', 'Ved Kongshavn', ['I Middelaldervannspeilet', 'Ved Sognsvann'], 'Kongshavn ligger sør for Gamlebyen.', 'tunnel', 'history'),
    q('Hva har flyttet strandlinjen?', 'Landheving, sedimenter og utfyllinger', ['Bare fugleliv', 'Kun vinteris'], 'Munningslandskapet er historisk dynamisk.', 'shoreline', 'history'),
    q('Hva viste Krums kart fra 1881?', 'Et forlenget Alna-løp mot sjøen', ['Alna i tunnel', 'En tørr ravine'], 'Kartet dokumenterer senere historisk elvetrase.', 'shoreline', 'history'),
    q('Når ble vannspeilet etablert?', '2000', ['1922', '1853'], 'Det ble laget til Oslos tusenårsjubileum.', 'history', 'history'),
    q('Hva ble planlagt i Loallmenningen?', 'En sjøvannskanal som markering', ['Et nytt naturlig kildevann', 'En demning til drikkevann'], 'Kanalen skulle synliggjøre historisk løp.', 'shoreline', 'history'),
    q('Hva er feil å si om gjenåpningen?', 'At den er dokumentert fullført gjennom Bjørvika', ['At planer har eksistert', 'At elva går i tunnel'], 'Plan og gjennomføring er ulike fakta.', 'mixed', 'history', 2)
  ]},
  { mode: 'waterbirds', layer: 'fauna_water', questions: [
    q('Hvilken aktiv art er en vanlig gressand?', 'Stokkand', ['Tjeld', 'Tårnseiler'], 'Stokkand bruker vannflater og kanter.', 'birds', 'fauna_water'),
    q('Hvilken stor hvit fugl har oransje nebb?', 'Knoppsvane', ['Toppand', 'Gråhegre'], 'Knoppsvanen er en stor vannfugl.', 'birds', 'fauna_water'),
    q('Hvilken and har tydelig nakketopp hos hannen?', 'Toppand', ['Kvinand', 'Stokkand'], 'Toppanden kjennes blant annet på nakketoppen.', 'birds', 'fauna_water'),
    q('Hvilken and har rund hvit kinnflekk hos hannen?', 'Kvinand', ['Grågås', 'Storskarv'], 'Kvinandhannen har markert hvit kinnflekk.', 'birds', 'fauna_water'),
    q('Hvilken langbeint fugl jakter stille i grunt vann?', 'Gråhegre', ['Blåmeis', 'Ringdue'], 'Gråhegren bruker strand- og gruntvannssoner.', 'birds', 'fauna_water'),
    q('Hvilken mørk vannfugl sitter ofte med vingene ut?', 'Storskarv', ['Tjeld', 'Stillits'], 'Skarven tørker ofte vingene synlig.', 'birds', 'fauna_water'),
    q('Hvilken svart-hvit vadefugl har langt oransjerødt nebb?', 'Tjeld', ['Linerle', 'Kaie'], 'Tjelden bruker strand og kaiområder.', 'birds', 'fauna_water')
  ]},
  { mode: 'gulls_geese', layer: 'fauna_coast', questions: [
    q('Hvilken måke har mørk hodehette i sommerdrakt?', 'Hettemåke', ['Gråmåke', 'Sildemåke'], 'Hettemåkas hodehette er et sesongkjennetegn.', 'birds', 'fauna_coast'),
    q('Hvilken stor måke har lys grå rygg?', 'Gråmåke', ['Fiskemåke', 'Tårnseiler'], 'Gråmåke er stor og lysrygget.', 'birds', 'fauna_coast'),
    q('Hvilken mindre måke har gulgrønne bein?', 'Fiskemåke', ['Sildemåke', 'Knoppsvane'], 'Fiskemåka er mindre enn gråmåka.', 'birds', 'fauna_coast'),
    q('Hvilken måke har mørkere grå rygg?', 'Sildemåke', ['Hettemåke', 'Grågås'], 'Sildemåka er mørkere på ryggen enn gråmåka.', 'birds', 'fauna_coast'),
    q('Hvilken stor gråbrun gås er vanlig i parker og vann?', 'Grågås', ['Hvitkinngås', 'Toppand'], 'Grågåsa er større og mer ensfarget brungrå.', 'birds', 'fauna_coast'),
    q('Hvilken gås har hvitt ansikt og mørk hals?', 'Hvitkinngås', ['Grågås', 'Kvinand'], 'Ansiktsfeltet gir arten navn.', 'birds', 'fauna_coast'),
    q('Hvilken slank fugl vipper halen på åpne kanter?', 'Linerle', ['Storskarv', 'Fiskemåke'], 'Linerla bruker kai, plen og strandnære flater.', 'birds', 'fauna_coast')
  ]},
  { mode: 'urban_birds', layer: 'fauna_city', questions: [
    q('Hvilken kråkefugl har grå kropp og svart hode og vinger?', 'Kråke', ['Kaie', 'Skjære'], 'Kråka har tydelig grå og svart kontrast.', 'birds', 'fauna_city'),
    q('Hvilken svart-hvit kråkefugl har lang hale?', 'Skjære', ['Kaie', 'Stær'], 'Skjæra er lett å kjenne på den lange halen.', 'birds', 'fauna_city'),
    q('Hvilken mindre kråkefugl har lys grå nakke og lyse øyne?', 'Kaie', ['Kråke', 'Ringdue'], 'Kaia bruker ofte bygninger og flokker.', 'birds', 'fauna_city'),
    q('Hvilken liten brungrå art bruker tett bebyggelse?', 'Gråspurv', ['Pilfink', 'Tårnseiler'], 'Gråspurv lever nær mennesker og bygg.', 'birds', 'fauna_city'),
    q('Hvilken spurv har kastanjebrun hette og svart kinnflekk?', 'Pilfink', ['Gråspurv', 'Grønnfink'], 'Pilfinken har tydelig kinnflekk.', 'birds', 'fauna_city'),
    q('Hvilken stor due har hvit halsflekk?', 'Ringdue', ['Stær', 'Gråtrost'], 'Ringdua bruker trær, parker og byrom.', 'birds', 'fauna_city'),
    q('Hvilken mørk, glinsende fugl går ofte i flokk?', 'Stær', ['Skjære', 'Stokkand'], 'Stæren bruker plen, tak og luftrom.', 'birds', 'fauna_city')
  ]},
  { mode: 'park_air_birds', layer: 'fauna_park', questions: [
    q('Hvilken trost har grått hode og prikket bryst?', 'Gråtrost', ['Svarttrost', 'Stillits'], 'Gråtrost bruker plen, trær og bær.', 'birds', 'fauna_park'),
    q('Hvilken hann er helsvart med gult nebb?', 'Svarttrost', ['Grønnfink', 'Tårnseiler'], 'Svarttrosthannen er svart med gult nebb.', 'birds', 'fauna_park'),
    q('Hvilken liten meis har blå isse?', 'Blåmeis', ['Kjøttmeis', 'Pilfink'], 'Blåmeisa har blått på hode og vinger.', 'birds', 'fauna_park'),
    q('Hvilken meis har svart hode, hvite kinn og gul underside?', 'Kjøttmeis', ['Blåmeis', 'Gråspurv'], 'Kjøttmeisa er større enn blåmeisa.', 'birds', 'fauna_park'),
    q('Hvilken kraftig fink er grønnlig med gule vingefelt?', 'Grønnfink', ['Stillits', 'Gråtrost'], 'Grønnfinken har kraftig nebb og gule felt.', 'birds', 'fauna_park'),
    q('Hvilken fink har rødt ansikt og gult vingebånd?', 'Stillits', ['Grønnfink', 'Stær'], 'Stillitsen har svært fargerik drakt.', 'birds', 'fauna_park'),
    q('Hvilken mørk fugl tilbringer nesten hele livet i luften?', 'Tårnseiler', ['Ringdue', 'Gråhegre'], 'Tårnseileren jakter insekter høyt over byen.', 'birds', 'fauna_park')
  ]}
];
let questionCounter = 0;
const quiz = {
  targetId: placeId,
  categoryId: 'natur',
  generator_version: 'history_go_nature_place_v2',
  generated_from: [placePath, storyPath, articlePath, 'data/quiz/regler/SET_MAL_README_v3.md'],
  manual_production_notes: {
    quality_direction: 'sted → observasjon → emne → forståelse',
    species_rule: 'all active mapped species; mapped does not guarantee current find',
    hold_back: ['historisk munning skal ikke kalles dagens åpne utløp', 'ingen fuglemating', 'ingen endelig koordinatpåstand før detaljrevisjon']
  },
  sets: setSpecs.map((spec, setIndex) => ({
    set_id: `natur_${placeId}_set_${setIndex + 1}`,
    level: setIndex + 1,
    order: setIndex + 1,
    xp: 50 + setIndex * 10,
    mode: spec.mode,
    questions: spec.questions.map((item, questionIndex) => {
      questionCounter += 1;
      const options = [item.answer, ...item.distractors];
      return {
        id: `${placeId}_s${setIndex + 1}_q${questionIndex + 1}`,
        quiz_id: `natur_${placeId}_set_${setIndex + 1}_q${questionIndex + 1}`,
        categoryId: 'natur', placeId, targetId: placeId,
        question_scope: 'place', question: item.question, options,
        answer: item.answer, answerIndex: 0, knowledge: item.knowledge,
        difficulty: item.difficulty, question_type: 'sted_observasjon',
        question_layer: item.layer, tags: [placeId, 'alnaelva', item.layer],
        source: item.source, claim_basis: 'documented',
        related_emners: ['em_natur_arter_habitat_mangfold'],
        core_concepts: ['arter', 'habitat', 'elveos', 'kulvert', 'fjord', 'forvaltning']
      };
    })
  }))
};
if (questionCounter !== 42) throw new Error(`Forventet 42 spørsmål, fikk ${questionCounter}`);

writeJson(placePath, place);
writeJson(quizPath, quiz);
writeJson(storyPath, story);
writeJson(articlePath, article);

const quizManifest = readJson('data/quiz/manifest.json');
quizManifest.sets = (quizManifest.sets || []).filter(x => x.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizPath });
writeJson('data/quiz/manifest.json', quizManifest);

const storiesManifest = readJson('data/stories/stories_manifest.json');
storiesManifest.files = (storiesManifest.files || []).filter(x => x.entity_id !== placeId);
storiesManifest.files.push({ category: 'natur', entity_id: placeId, path: storyPath });
writeJson('data/stories/stories_manifest.json', storiesManifest);

const leksikonManifest = readJson('data/leksikon/manifest.json');
leksikonManifest.files = (leksikonManifest.files || []).filter(x => x !== articlePath);
leksikonManifest.files.push(articlePath);
writeJson('data/leksikon/manifest.json', leksikonManifest);

const routeManifest = readJson(routeManifestPath);
const routeRow = routeManifest.places.find(x => x.id === placeId);
if (!routeRow) throw new Error('Mangler Alna-utløpet i rutemanifestet');
routeRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, placePath))).digest('hex');
writeJson(routeManifestPath, routeManifest);

const placesIndex = readJson('data/places/places_index.json');
const globalRow = placesIndex.find(x => x.id === placeId);
if (!globalRow) throw new Error('Mangler Alna-utløpet i global plassindeks');
globalRow.desc = place.desc;
writeJson('data/places/places_index.json', placesIndex);

const report = `# Alnas historiske utløp i Bjørvika – natur-rundinger batch 1\n\n## Omfang\n\n- Fyller alle ni natur-rundinger for \`${placeId}\`.\n- Bevarer ID, koordinater, tre ankere, radius, kategori, routeId og status \`needs_detail_check\`.\n- Registrerer fortelling, leksikon og 6 × 7 quizspørsmål i manifestene.\n\n## Aktiv artsunion\n\n- Flora: ingen aktive koblinger\n- Fauna: 28 aktive fuglearter\n- Totalt: 28 arter\n- Regel: Alle aktive koblinger fra fem naturkart. Kartkobling er ikke garanti for feltfunn.\n\n## Vannsystemkontroll\n\n- Historisk naturlig munning: mellom Grønlia og Sørenga / middelalderbyen\n- Dagens vannføring: tunnel til Kongshavn siden 1922\n- Synlig historisk markering: Middelaldervannspeilet fra 2000\n- Koordinat: foreløpig områdeanker med \`needs_detail_check\`\n\n## Kontroll\n\nMaterialiseringen skal bestå målrettet test, eksisterende Alna-/Oslo-naturtester, \`scripts/check-places.sh\`, indeks- og manifestsynk samt \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report);

const test = `const assert = require('assert');\nconst crypto = require('crypto');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));\nconst expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];\nconst runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst profileMatch = runtime.match(/natur:\\s*\\[([^\\]]+)\\]/);\nassert(profileMatch, 'runtime mangler naturprofil'); assert.deepStrictEqual(JSON.parse(\`[\${profileMatch[1]}]\`), expectedRounds);\nconst placePath='${placePath}', quizPath='${quizPath}', storyPath='${storyPath}', articlePath='${articlePath}';\nconst place=readJson(placePath), quiz=readJson(quizPath), story=readJson(storyPath)[0], article=readJson(articlePath);\nconst index=readJson('data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json').find(x=>x.id===place.id);\nconst routeManifest=readJson('${routeManifestPath}'); const manifestRow=routeManifest.places.find(x=>x.id===place.id);\nconst quizManifest=readJson('data/quiz/manifest.json'); const storyManifest=readJson('data/stories/stories_manifest.json'); const leksikonManifest=readJson('data/leksikon/manifest.json');\nconst validBadges=new Set(readJson('data/badges/natur.json').sub);\nassert.strictEqual(place.id,'${placeId}'); assert.strictEqual(place.name,'Alna utløp i Bjørvika'); assert.strictEqual(place.category,'natur');\nassert.deepStrictEqual([place.lat,place.lon,place.r,place.year??null],[59.9041,10.7638,190,null]); assert.strictEqual(place.routeId,'alnaelva_grontdrag'); assert.strictEqual(place.coordStatus,'needs_detail_check'); assert.strictEqual(place.coordType,'route_midpoint'); assert.strictEqual(place.coordPrecisionM,120);\nassert(Array.isArray(place.anchors)&&place.anchors.length===3); assert.deepStrictEqual(place.anchors.map(x=>x.id),['alna_utlop_innlop','alna_utlop_munning','alna_utlop_fjord']);\nassert(index&&manifestRow); assert.deepStrictEqual([index.lat,index.lon,index.r,index.year??null],[place.lat,place.lon,place.r,place.year??null]); const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,placePath))).digest('hex'); assert.strictEqual(manifestRow.sha256,hash);\nfor(const key of ['rounds','rundinger','routes','works','people','play_profile','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place,key),\`forbudt felt \${key}\`);\nconst roundContent={tasks:place.tasks_profile,nature:place.nature_profile,badges:place.underbadge_ids,training:place.training_profile,civication:place.civication_store,brands:place.brands,før_nå:place.for_na,fortellinger:[story],leksikon:[article]}; assert.deepStrictEqual(Object.keys(roundContent),expectedRounds); for(const [id,value] of Object.entries(roundContent)){const filled=Array.isArray(value)?value.length>0:Boolean(value&&typeof value==='object');assert(filled,\`mangler \${id}\`);}\nassert(place.externalLinks.length>=10&&place.externalLinks.every(x=>x.type==='repository'||/^https:\\/\\//.test(x.url))); assert(place.underbadge_ids.length>=30&&place.underbadge_ids.every(x=>validBadges.has(x))); assert.strictEqual(place.tasks_profile.tasks.length,4); assert.strictEqual(place.training_profile.exercises.length,3); assert(/ikke.*mat|ikke.*jag|ikke.*is/i.test(place.training_profile.safety)); assert(place.civication_store.length===4&&place.civication_store.every(x=>x.physicalObject&&x.placeSpecific)); assert(place.brands.length>=10); assert(place.nature_profile.summary.length>=4000);\nassert.strictEqual(place.nature_profile.outlet_system.coordinate_status,'needs_detail_check'); assert(/ikke.*dagens åpne|ikke.*dagens aapne/i.test(place.nature_profile.outlet_system.caution)); assert.deepStrictEqual(place.nature_profile.nearby_place_ids,['kvaernerbyen_alna','svartdalen','bjorvika']);\nconst mapFiles=${JSON.stringify(mapFiles)}; const merged={flora:[],fauna:[]}; for(const file of mapFiles){const raw=readJson(file);const entry=(raw.places||raw).${placeId};if(!entry)continue;merged.flora.push(...(entry.flora||[]));merged.fauna.push(...(entry.fauna||[]));} merged.flora=[...new Set(merged.flora)].sort(); merged.fauna=[...new Set(merged.fauna)].sort(); assert.deepStrictEqual(merged.flora,[]); assert.deepStrictEqual(merged.fauna,${JSON.stringify(expectedFauna)});\nconst inventory=place.nature_profile.species_inventory; assert.strictEqual(inventory.total_species,28); assert.deepStrictEqual(inventory.flora,[]); assert.deepStrictEqual(inventory.fauna.map(x=>x.id).sort(),${JSON.stringify(expectedFauna)}); assert(inventory.fauna.every(x=>x.name&&x.latin));\nassert.strictEqual(quiz.sets.length,6); assert(quiz.sets.every((s,i)=>s.order===i+1&&s.questions.length===7)); assert(quiz.sets.flatMap(s=>s.questions).every(q=>q.categoryId==='natur'&&q.placeId===place.id&&Array.isArray(q.source)&&q.source.length&&q.claim_basis==='documented'&&q.options[q.answerIndex]===q.answer&&q.related_emners.includes('em_natur_arter_habitat_mangfold')));\nassert.deepStrictEqual(quizManifest.sets.filter(x=>x.targetId===place.id),[{targetId:place.id,file:quizPath}]); assert(story&&story.place_id===place.id&&story.sources.length>=10); assert(storyManifest.files.some(x=>x.path===storyPath&&x.entity_id===place.id&&x.category==='natur')); assert(article&&article.place_id===place.id&&article.version===2); assert(article.sources.length>=10&&article.facts.length>=16&&article.chronology.length>=9); assert(leksikonManifest.files.includes(articlePath));\nconst all=JSON.stringify({place,quiz,story,article}); for(const token of ['naturlige utløp','Grønlia','Sørenga','omkring år 1000','1922','Kongshavn','900 meter','vannspeil','2000','Loallmenningen','needs_detail_check']) assert(all.toLowerCase().includes(token.toLowerCase()),\`mangler \${token}\`); for(const bird of inventory.fauna) assert(all.includes(bird.name),\`mangler artsnavn \${bird.name}\`); assert(/ikke.*dagens åpne|ikke.*dagens aapne|ikke.*åpen Alna/i.test(all)); assert(/ikke en garanti|ikke.*garanti/i.test(all)); console.log('Alna historical outlet nature rounds batch 1 OK');\n`;
fs.mkdirSync(path.dirname(path.join(root, testPath)), { recursive: true }); fs.writeFileSync(path.join(root, testPath), test);

run(process.execPath, [testPath]);
run(process.execPath, ['tests/oslo-nature-rounds-batch5-alna.test.js']);
run(process.execPath, ['tests/oslo-nature-rounds-batch4.test.js']);
run('bash', ['scripts/check-places.sh']);
run('git', ['diff', '--check']);
console.log('Alna historical outlet materialized and validated');
