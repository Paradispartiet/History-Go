import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);

const aggregatePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const storyPath = 'data/stories/stories_kuba_parken.json';
const leksikonPath = 'data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json';

const placeRows = read(aggregatePath);
const place = placeRows.find((row) => row.id === 'kuba_parken');
if (!place) throw new Error('Missing kuba_parken in Akerselva aggregate');

Object.assign(place, {
  name: 'Kuba-parken',
  year: 1928,
  desc: 'Bypark på begge sider av Akerselva, anlagt i 1928, med Kuba bru, paviljong og synlige spor etter det tidligere gassanlegget.',
  popupDesc: 'Kuba-parken ligger på begge sider av Akerselva og ble anlagt i 1928. De to parksidene er bundet sammen av Kuba bru. På vestsiden ligger en plaskedam på fundamentet etter en gassklokke som stod her fra 1925 til 1973. Det nærliggende Fyrhuset ble oppført i 1924 av Oslo Lysverker, tegnet av Thorvald Astrup, som fyrhus for gassbeholderen.\n\nI dag er Kuba et offentlig park- og møtested med paviljong, gressflater, elvekant og kultur- og samfunnsbruk. Navnet er eldre enn gassklokken og har usikker opprinnelse; Oslo byleksikon beskriver Kuba som et opprinnelig folkelig navn på en vik i Akerselva ved Bergverksgata. Natur-rundingen bruker bare de to artene som er aktivt kartlagt til stedet i repoets Artskart-baserte naturkart: snøbær og honningbie.',
  tags: ['park', 'elvepark', 'akerselva', 'kuba_bru', 'gassklokke', 'fyrhuset', 'bypark', 'moteplass'],
  underbadge_ids: [
    'urbannatur', 'park_og_hage', 'bypark', 'elv', 'elvebredde', 'kantvegetasjon',
    'grontdrag', 'rekreasjon', 'insekter_og_smadyr', 'pollinatorer', 'planter_og_blomster'
  ],
  quiz_profile: {
    place_type: 'historisk bypark og urban elvekorridor',
    subtype: 'kuba_park_gasshistorie_elverom',
    signature_features: [
      'park anlagt i 1928',
      'park på begge sider av Akerselva',
      'Kuba bru binder parksidene sammen',
      'plaskedam på fundamentet etter gassklokken 1925–1973',
      'Fyrhuset fra 1924',
      'snøbær og honningbie i aktivt naturkart'
    ],
    primary_angles: ['urbannatur', 'gasshistorie', 'parkhistorie', 'sosial_infrastruktur', 'artsobservasjon', 'for_na_transformasjon'],
    question_families: ['stedsspesifikk_naturfunksjon', 'historisk_endring', 'fysiske_spor', 'artsobservasjon', 'navnekildekritikk', 'sammenligning_langs_elva'],
    avoid_angles: ['generisk_tursti', 'hardkodede_arrangementer', 'sikker_forklaring_pa_navnet_kuba', 'artsfunn_utover_aktive_repo_kart', 'forveksle_fyrhuset_med_selve_parken'],
    must_include: ['1928', 'gassklokken 1925–1973', 'Kuba bru', 'snøbær og honningbie'],
    contrast_targets: ['myralokka', 'nedre_foss', 'vulkan_industriomrade'],
    notes: 'Kuba skal leses som både bypark, elverom og gjenbrukt teknisk landskap. Navneopprinnelsen er usikker og skal ikke presenteres som avgjort.'
  },
  externalLinks: [
    { type: 'official', label: 'Oslo kommune: Kubaparken', url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/kubaparken/', lang: 'nb', verifiedAt: '2026-07-19' },
    { type: 'reference', label: 'Oslo byleksikon: Kuba', url: 'https://oslobyleksikon.no/side/Kuba', lang: 'nb', verifiedAt: '2026-07-19' },
    { type: 'official', label: 'Oslo kommune: Fyrhuset Kuba', url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/fyrhuset-kuba', lang: 'nb', verifiedAt: '2026-07-19' }
  ],
  tasks_profile: {
    title: 'Les parken på begge sider av elva',
    summary: 'Fire korte oppgaver gjør parkens elverom, gasshistorie og dokumenterte artskart synlige fra offentlige og robuste flater.',
    tasks: [
      { id: 'kuba_oppgave_begge_sider', title: 'Kryss Kuba bru', instruction: 'Gå over Kuba bru og sammenlign parksidene. Se etter forskjeller i plen, trær, kantvegetasjon, ferdsel og kontakt med elva.', why: 'Parken ligger på begge sider av Akerselva, og brua gjør den til ett sammenhengende parkrom.' },
      { id: 'kuba_oppgave_gassklokkegrunn', title: 'Finn den runde gassklokkeflaten', instruction: 'Finn plaskedammen på vestsiden og les den sirkulære formen fra offentlig parkflate. Ikke gå inn i vann eller over sperringer.', why: 'Plaskedammen er anlagt på fundamentet etter gassklokken som stod her fra 1925 til 1973.' },
      { id: 'kuba_oppgave_paviljong', title: 'Les paviljongen som møteplass', instruction: 'Finn paviljongen og observer hvordan den ligger i forhold til plenene og ferdselslinjene. Ikke forstyrr arrangementer eller organiserte aktiviteter.', why: 'Paviljongen er en del av parkens dokumenterte rolle som sosialt og kulturelt møtested.' },
      { id: 'kuba_oppgave_to_arter', title: 'Bruk de to aktive artskortene', instruction: 'Åpne artskortene for snøbær og honningbie. Registrer bare det du faktisk ser, og ikke plukk planter eller forstyrr insekter.', why: 'Repoets aktive Artskart-baserte naturkart knytter akkurat disse to artene til Kuba-parken.' }
    ]
  },
  nature_profile: {
    type: 'bypark / urban elvekorridor / pollinatorrom',
    title: 'Parken mellom plen, elvekant og byliv',
    summary: 'Kuba-parken kombinerer åpne parkflater, trær, busker og vegeterte elvekanter på begge sider av Akerselva. Naturverdien ligger i mosaikken mellom skjøttet bypark og blågrønn korridor, ikke i urørt natur. Kuba bru binder parksidene sammen, mens ferdsel og arrangementbruk skaper betydelig menneskelig aktivitet. Repoets aktive Artskart-baserte naturkart dokumenterer snøbær og honningbie ved stedet; disse vises som artskort, men skal behandles som dokumenterte observasjonsspor og ikke som garanti for funn ved hvert besøk.',
    themes: ['åpne parkflater', 'vegetert elvekant', 'Akerselva som blågrønn korridor', 'Kuba bru som forbindelse', 'snøbær', 'honningbie og pollinering', 'intensiv parkbruk og robuste ganglinjer'],
    species_inventory: {
      source_maps: ['data/natur/nature_oslo_expansion_place_map.json'],
      flora: [{ id: 'emne_flora_snobaer', name: 'snøbær', map: 'nature_oslo_expansion_place_map.json' }],
      fauna: [{ id: 'emne_fauna_honningbie', name: 'honningbie', map: 'nature_oslo_expansion_place_map.json' }],
      total_species: 2,
      rule: 'all_active_mapped_species_for_place'
    },
    nearby_place_ids: ['myralokka', 'nedre_foss', 'vulkan_industriomrade']
  },
  training_profile: {
    title: 'Rolig parkøkt over Kuba bru',
    summary: 'En kort økt som bruker de brede offentlige ganglinjene og begge parksidene uten å gjøre elvekanten eller arrangementsflatene til treningsarena.',
    safety: 'Bruk tørre, åpne ganglinjer og vis hensyn til andre. Ikke tren tett ved elvekanten, i plaskedammen eller midt i arrangementer. Tilpass fart ved stor ferdsel og glatt underlag.',
    exercises: [
      { id: 'kuba_trening_bru_loop', title: 'Ti minutters brurunde', instruction: 'Gå rolig i omtrent ti minutter og bruk Kuba bru til å besøke begge parksidene.', duration_minutes: 10, intensity: 'rolig', why: 'Runden gjør parkens todelte struktur og elvekorridor synlig.' },
      { id: 'kuba_trening_gangdrag', title: 'Fire kontrollerte gangdrag', instruction: 'Finn en bred og oversiktlig ganglinje. Gå raskt i 90 sekunder og rolig i 90 sekunder, fire ganger.', duration_minutes: 12, intensity: 'moderat', why: 'Gangdrag bruker eksisterende ferdselsareal og kan avbrytes ved tett parkbruk.' },
      { id: 'kuba_trening_bevegelighet', title: 'Bevegelighet på tørr plen', instruction: 'Avslutt med rolige ankel-, hofte- og skulderbevegelser på en tørr, flat plen der du ikke er i veien for andre.', duration_minutes: 5, intensity: 'lett', why: 'De åpne plenene gir et enkelt avslutningspunkt når de ikke er opptatt av arrangementer.' }
    ]
  },
  civication_store: [
    { id: 'kuba_bru_minimodell', title: 'Kuba bru', type: 'brumodell', kind: 'physical_object', desc: 'En liten modell av gangbrua som binder de to delene av Kuba-parken sammen.', placeSpecificReason: 'Brua er den konkrete forbindelsen mellom parkens øst- og vestside.', historicalFunction: 'Gjør den todelte parken lesbar som ett sammenhengende offentlig rom.', physicalObject: true, placeSpecific: true, storePrice: 30, currency: 'PC', collection: 'kuba_parken', collectable: true },
    { id: 'kuba_gassklokke_fundamentmodell', title: 'Gassklokkens sirkel', type: 'fundamentmodell', kind: 'physical_object', desc: 'En fysisk ringmodell av fundamentet som i dag danner grunnlaget for plaskedammen på vestsiden.', placeSpecificReason: 'Den sirkulære formen er et direkte fysisk spor etter gassklokken som stod her 1925–1973.', historicalFunction: 'Viser hvordan teknisk infrastruktur kan gjenbrukes som parklandskap.', physicalObject: true, placeSpecific: true, storePrice: 42, currency: 'PC', collection: 'kuba_parken', collectable: true },
    { id: 'kuba_paviljong_minimodell', title: 'Parkpaviljongen', type: 'paviljongmodell', kind: 'physical_object', desc: 'En liten modell av paviljongen som inngår i parkens sosiale og kulturelle bruk.', placeSpecificReason: 'Paviljongen er en dokumentert del av Kubaparkens møteplassfunksjon.', historicalFunction: 'Representerer parkens utvikling som arena for offentlig samling, kultur og samfunnsliv.', physicalObject: true, placeSpecific: true, storePrice: 28, currency: 'PC', collection: 'kuba_parken', collectable: true },
    { id: 'kuba_fyrhus_minimodell', title: 'Fyrhuset fra 1924', type: 'bygningsmodell', kind: 'physical_object', desc: 'En liten modell av Thorvald Astrups nyklassisistiske fyrhus ved parken.', placeSpecificReason: 'Fyrhuset ble reist som teknisk støttebygg for gassbeholderen som preget dette parklandskapet.', historicalFunction: 'Kobler dagens park til områdets tidligere gass- og energiinfrastruktur.', physicalObject: true, placeSpecific: true, storePrice: 38, currency: 'PC', collection: 'kuba_parken', collectable: true }
  ],
  brands: [
    { id: 'kuba_parken_actor', name: 'Kuba-parken', brand_kind: 'public_park', brand_type: 'place_identity' },
    { id: 'oslo_kommune_kuba', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'park_owner_and_public_space_actor' },
    { id: 'bymiljoetaten_kuba', name: 'Bymiljøetaten', brand_kind: 'municipal_agency', brand_type: 'park_management_actor' },
    { id: 'oslo_lysverker_kuba', name: 'Oslo Lysverker', brand_kind: 'historic_energy_utility', brand_type: 'gas_infrastructure_actor' },
    { id: 'kulturetaten_fyrhuset_kuba', name: 'Kulturetaten', brand_kind: 'municipal_cultural_agency', brand_type: 'fyrhuset_property_actor' }
  ],
  for_na: {
    title: 'Fra gassinfrastruktur til parkrom på begge sider av elva',
    before: 'I 1920-årene ble området preget av både ny park og teknisk gassinfrastruktur. Fyrhuset ble oppført i 1924, gassklokken kom i 1925, og selve parken ble anlagt i 1928. Gassbeholderen stod som et stort teknisk element fram til 1973.',
    now: 'I dag brukes Kuba som offentlig park på begge sider av Akerselva. Kuba bru, plenene, paviljongen og den vegeterte elvekanten danner et sammenhengende møte- og rekreasjonsrom. Gassklokkens fundament er gjenbrukt under plaskedammen, mens Fyrhuset fortsatt står ved parken.',
    change: 'Det tekniske energilandskapet forsvant ikke helt: gassklokken ble fjernet, men sirkelen i bakken og Fyrhuset gjør infrastrukturen lesbar inne i dagens park.',
    look_for: ['Kuba bru mellom parksidene', 'den sirkulære plaskedammen på gassklokkefundamentet', 'paviljongen', 'Fyrhuset fra 1924', 'overgangen mellom åpen plen og vegetert elvekant', 'snøbær og honningbie i Natur-rundingen'],
    sources: ['Oslo kommune: Kubaparken', 'Oslo byleksikon: Kuba', 'Oslo kommune: Fyrhuset Kuba']
  }
});

write(aggregatePath, placeRows);

const stories = read(storyPath);
const story = stories.find((row) => row.place_id === 'kuba_parken');
if (!story) throw new Error('Missing Kuba story');
Object.assign(story, {
  id: 'st_kuba_parken_gassklokken_som_ble_parkspor',
  type: 'urban_nature_history',
  title: 'Gassklokken som ble et spor i parken',
  year: 1928,
  summary: 'Kuba-parken viser hvordan et teknisk gasslandskap og en offentlig park kunne eksistere side om side, og hvordan fundamentet etter gassklokken senere ble en del av parkrommet.',
  story: 'Kuba-parken ble anlagt i 1928 på begge sider av Akerselva. Men parken var ikke et tomt grønt lerret. Fyrhuset var reist allerede i 1924, og fra 1925 stod en stor gassklokke på vestsiden. Parkliv og teknisk infrastruktur eksisterte derfor lenge samtidig.\n\nDa gassklokken ble fjernet i 1973, ble ikke alle sporene borte. Plaskedammen på vestsiden ligger på fundamentet etter beholderen. Like ved står Fyrhuset fortsatt. Det gjør Kuba til et sted der byens tekniske historie kan leses direkte i et hverdagslig parklandskap.\n\nOgså navnet peker bakover, men uten én sikker forklaring. Oslo byleksikon beskriver Kuba som et opprinnelig folkelig navn på en vik i Akerselva ved Bergverksgata og understreker at navnets opphav er omdiskutert. Det sikreste er derfor å bruke parken som et sted for kildekritikk: den fysiske gassklokkesirkelen kan dokumenteres, mens navnehistorien må få beholde usikkerheten.\n\nI dag binder Kuba bru de to parksidene sammen, og paviljong, plen, elvekant og ferdselslinjer gjør stedet til sosial bynatur. Parken viser at transformasjon ikke alltid betyr at alt gammelt forsvinner; noen ganger blir infrastrukturen selve formen på det nye offentlige rommet.',
  sources: [
    { title: 'Oslo kommune: Kubaparken', url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/kubaparken/' },
    { title: 'Oslo byleksikon: Kuba', url: 'https://oslobyleksikon.no/side/Kuba' },
    { title: 'Oslo kommune: Fyrhuset Kuba', url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/fyrhuset-kuba' }
  ],
  tags: ['natur', 'akerselva', 'kuba', 'park', 'gassklokke', 'fyrhuset', 'moteplass', 'byhistorie'],
  related_people: [],
  related_places: ['nedre_foss', 'vulkan_industriomrade', 'myralokka'],
  score: { narrative: 5, historical: 5, source: 5, play_value: 5, originality: 5, total: 25 },
  arc: {
    start: 'En park anlegges ved elva mens gassinfrastrukturen fortsatt står der.',
    middle: 'Gassklokken fjernes, men fundamentet blir igjen som del av parklandskapet.',
    end: 'Kuba blir et offentlig elverom der natur, møteplass og teknisk historie kan leses samtidig.'
  },
  next_scenes: [{ place_id: 'nedre_foss', reason: 'Følg elva videre til et sted der mølle-, industri- og parkhistorien ligger enda tettere sammen.' }]
});
write(storyPath, stories);

const articles = read(leksikonPath);
const article = articles.find((row) => row.place_id === 'kuba_parken');
if (!article) throw new Error('Missing Kuba leksikon article');
Object.assign(article, {
  visual: { designCode: 'article_nature_route_miniature' },
  version: 2,
  popupDesc: 'Kuba-parken er en bypark fra 1928 på begge sider av Akerselva. Kuba bru, gassklokkens gjenbrukte fundament, paviljongen og Fyrhuset gjør stedet til både elverom, møteplass og teknisk kulturhistorie.',
  wikiText: [
    'Kuba-parken ligger på begge sider av Akerselva og ble anlagt i 1928. De to delene er forbundet med Kuba bru. På vestsiden ligger en plaskedam på fundamentet etter en gassklokke som stod fra 1925 til 1973. Det nærliggende Fyrhuset ble oppført i 1924 etter tegninger av Thorvald Astrup som fyrhus for gassbeholderen. Slik ligger et tidligere teknisk energilandskap fortsatt fysisk innebygd i dagens park.',
    'Oslo kommune beskriver Kuba som et offentlig rekreasjons- og arrangementsrom med paviljong, mens Oslo byleksikon viser at navnet er eldre og mer usikkert enn gasshistorien. Kuba var opprinnelig et folkelig navn på en vik i Akerselva ved Bergverksgata, men navnets opphav har flere konkurrerende forklaringer. Naturmessig er stedet en intensivt brukt bypark og elvekorridor. Repoets aktive Artskart-baserte naturkart knytter snøbær og honningbie til stedet; de skal behandles som dokumenterte observasjonsspor, ikke som garanti for hva som finnes ved hvert besøk.'
  ],
  summary: {
    one_liner: 'Bypark fra 1928 der Akerselva, sosialt byliv og spor etter Oslos gassinfrastruktur møtes.',
    themes: ['Akerselva', 'bypark', 'gasshistorie', 'moteplass', 'urbannatur'],
    tone: ['nøktern', 'faglig', 'stedsspesifikk']
  },
  facts: [
    { id: 'fact_kuba_01', label: 'Park fra 1928', desc: 'Oslo kommune oppgir at Kuba-parken ble anlagt i 1928.', confidence: 'high', sources: ['Oslo kommune: Kubaparken'] },
    { id: 'fact_kuba_02', label: 'Gassklokken 1925–1973', desc: 'Plaskedammen på vestsiden er bygd på fundamentet til gassklokken som stod her fra 1925 til 1973.', confidence: 'high', sources: ['Oslo byleksikon: Kuba'] },
    { id: 'fact_kuba_03', label: 'Fyrhuset fra 1924', desc: 'Fyrhuset ble oppført i 1924, tegnet av Thorvald Astrup, som fyrhus for gassbeholderen.', confidence: 'high', sources: ['Oslo kommune: Fyrhuset Kuba'] },
    { id: 'fact_kuba_04', label: 'Park på begge sider av elva', desc: 'Parkområdet ligger på begge sider av Akerselva og forbindes av Kuba bru.', confidence: 'high', sources: ['Oslo kommune: Kubaparken', 'Oslo byleksikon: Kuba'] },
    { id: 'fact_kuba_05', label: 'Navneopphavet er usikkert', desc: 'Kuba var et folkelig navn på en vik ved Bergverksgata, men kildene gir flere teorier og ingen sikker forklaring på navnets opphav.', confidence: 'high', sources: ['Oslo byleksikon: Kuba'] },
    { id: 'fact_kuba_06', label: 'To aktivt kartlagte arter', desc: 'Repoets aktive Artskart-baserte naturkart knytter snøbær og honningbie til Kuba-parken.', confidence: 'high', sources: ['data/natur/nature_oslo_expansion_place_map.json'] }
  ],
  chronology: [
    { id: 'chrono_kuba_01', year: 1924, period: 'Fyrhuset', desc: 'Fyrhuset oppføres som teknisk bygg for gassbeholderen.', confidence: 'high', sources: ['Oslo kommune: Fyrhuset Kuba'] },
    { id: 'chrono_kuba_02', year: 1925, period: 'Gassklokken', desc: 'Gassklokken kommer til området.', confidence: 'high', sources: ['Oslo byleksikon: Kuba'] },
    { id: 'chrono_kuba_03', year: 1928, period: 'Parken anlegges', desc: 'Kuba-parken anlegges som offentlig park ved Akerselva.', confidence: 'high', sources: ['Oslo kommune: Kubaparken'] },
    { id: 'chrono_kuba_04', year: 1973, period: 'Gassklokken fjernes', desc: 'Gassbeholderen forsvinner, mens fundamentet senere inngår i plaskedammen.', confidence: 'high', sources: ['Oslo byleksikon: Kuba'] }
  ],
  sources: [
    { title: 'Oslo kommune: Kubaparken', url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/kubaparken/' },
    { title: 'Oslo byleksikon: Kuba', url: 'https://oslobyleksikon.no/side/Kuba' },
    { title: 'Oslo kommune: Fyrhuset Kuba', url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/fyrhuset-kuba' },
    { title: 'History Go: Artskart-basert naturkart', url: 'data/natur/nature_oslo_expansion_place_map.json' }
  ]
});
write(leksikonPath, articles);

console.log('Kuba-parken round content finalized in aggregate, story and leksikon.');
