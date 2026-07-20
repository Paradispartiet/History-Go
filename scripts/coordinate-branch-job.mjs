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

const placeId = 'alna_bryn';
const placePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_bryn.json';
const routeManifestPath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json';
const quizPath = 'data/quiz/natur/alna_bryn_sets.json';
const storyPath = 'data/stories/stories_alna_bryn.json';
const articlePath = 'data/leksikon/places/oslo/natur/leksikon_alna_bryn.json';
const reportPath = 'reports/alna-bryn-nature-rounds-batch1.md';
const testPath = 'tests/alna-bryn-nature-rounds-batch1.test.js';
const mapFiles = [
  'data/natur/nature_place_map.json',
  'data/natur/nature_bird_place_map.json',
  'data/natur/nature_oslo_expansion_place_map.json',
  'data/natur/nature_routes_place_map.json',
  'data/natur/nature_etne_place_map.json'
];

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
const expectedFlora = ['emne_flora_kjempebjornkjeks'];
const expectedFauna = [
  'emne_fauna_graaspurv',
  'emne_fauna_graatrost',
  'emne_fauna_kraake',
  'emne_fauna_sildemaake',
  'emne_fauna_skjaere'
].sort();
if (JSON.stringify(union.flora) !== JSON.stringify(expectedFlora) || JSON.stringify(union.fauna) !== JSON.stringify(expectedFauna)) {
  throw new Error(`Uventet artsunion for ${placeId}: ${JSON.stringify(union)}`);
}

const giantHogweed = readJson('data/natur/flora/fremmedarter.json').find(x => x.id === expectedFlora[0]);
const urbanBirds = readJson('data/natur/fauna/fugler_by.json');
const wetlandBirds = readJson('data/natur/fauna/fugler_vatmark_og_skog.json');
const birds = expectedFauna.map(id => [...urbanBirds, ...wetlandBirds].find(x => x.id === id));
if (!giantHogweed || birds.some(x => !x)) throw new Error('Fant ikke alle artskortene for Alna ved Bryn');
const birdById = Object.fromEntries(birds.map(x => [x.id, x]));

const refs = {
  bryn: 'https://oslobyleksikon.no/side/Bryn_%28str%C3%B8k%29',
  alnastien: 'https://oslobyleksikon.no/side/Alnastien',
  alna: 'https://oslobyleksikon.no/side/Alna_%28elv%29',
  johPetersen: 'https://oslobyleksikon.no/side/Joh._Petersen_A/S',
  niva: 'https://www.niva.no/nyheter/naturrestaurering-er-losningen-for-oslos-mest-forurensede-elv',
  osloRivers: 'https://www.oslo.kommune.no/english/welcome-to-oslo/daily-life-in-oslo/enjoying-the-outdoors/explore-oslo-s-lakes-rivers/',
  artsdatabanken: 'https://lister.artsdatabanken.no/fremmedartslista/2023/300',
  routeMap: 'data/natur/nature_place_map.json',
  birdMap: 'data/natur/nature_bird_place_map.json',
  floraData: 'data/natur/flora/fremmedarter.json',
  birdDataCity: 'data/natur/fauna/fugler_by.json',
  birdDataWetland: 'data/natur/fauna/fugler_vatmark_og_skog.json'
};
const commonSources = [
  source('Oslo byleksikon: Bryn', refs.bryn),
  source('Oslo byleksikon: Alnastien', refs.alnastien),
  source('Oslo byleksikon: Alnaelva', refs.alna),
  source('Oslo byleksikon: Joh. Petersen A/S', refs.johPetersen),
  source('NIVA: Naturrestaurering er løsningen for Alnaelva', refs.niva),
  source('Oslo kommune: innsjøer og elver', refs.osloRivers),
  source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken),
  source('History Go: aktivt naturkart', refs.routeMap),
  source('History Go: fuglekart', refs.birdMap),
  source('History Go: fremmedarter', refs.floraData),
  source('History Go: byfugler', refs.birdDataCity),
  source('History Go: våtmarks- og skogsfugler', refs.birdDataWetland)
];

const inventoryBirds = birds.map(x => ({
  id: x.id,
  name: x.title,
  latin: x.latin,
  status: 'aktiv_kartkobling',
  map: 'nature_place_map.json'
}));

const oldPlace = readJson(placePath);
const place = {
  ...oldPlace,
  desc: 'Alna ved Bryn i overgangen mellom Brynsfossen, industrihistorie, jernbane, veier, Alnastien og en smal byøkologisk elvekorridor.',
  popupDesc: 'Ved Bryn møter Alna Brynsfossen, eldre industribygninger, Hovedbanen, broer, veier og nyere byutvikling. Vannet har både formet terrenget og gitt kraft til industri, mens dagens kantvegetasjon og Alnastien holder en blågrønn forbindelse gjennom området. History Gos aktive naturkart knytter kjempebjørnekjeks og fem byfugler til stedet. Kartkoblingene er observasjonsspor, ikke garanti for aktuelle funn. Kjempebjørnekjeks skal aldri berøres: plantesaften kan i kombinasjon med sollys gi alvorlige hudskader.',
  nature_profile: {
    type: 'byelv / fossesone / industrilandskap / transportkorridor',
    title: 'Alna ved Bryn som foss, kraftkilde og presset artskorridor',
    summary: `Ved Bryn går Alna inn i et landskap der naturhistorie, industrihistorie og transporthistorie ligger oppå hverandre. Brynsfossen skapte et lokalt fall i elva og gjorde vannkraft tilgjengelig. Oslo byleksikon beskriver hvordan beliggenheten ved fossen ga grunnlag for allsidig industri, og hvordan den store industriutbyggingen på 1800-tallet ble styrket av Hovedbanen. Elva var dermed både naturprosess og energikilde, mens jernbanen gjorde råvarer, varer og arbeidskraft mer mobile.\n\nJoh. Petersen A/S kjøpte fallrettighetene til Brynsfossen og flyttet virksomheten til Bryn i 1889. En demning ledet vann til veveribygningen, og senere ble en spinneribygning lagt over fossen. Dette er et presist eksempel på at terreng og vannføring kunne styre hvor industri ble lagt. Når spilleren står ved dagens ruteanker, skal fossen og industrilagene ikke leses som løsrevne historiske fakta. De forklarer hvorfor elva er innsnevret, krysset og teknisk bearbeidet akkurat her.\n\nAlnastien følger Alna fra Smalvoll mot Bryn og videre ned Svartdalen. Turveien utgjør D9 og store deler av D10. Ved Bryn fungerer den som en forbindelse gjennom et område dominert av jernbane, veier, broer, næringsbygg og nye bolig- og kontorprosjekter. Kantvegetasjonen kan være smal, men den binder vannløpet sammen med neste naturdel. Fra etablert ferdselsflate kan spilleren registrere elvas retning, fall, skygge, broer, murer, vegetasjonsbredde og mulige barrierer uten å gå ned i bratte eller tekniske soner.\n\nNIVA beskriver Alna som sterkt belastet av industri, avfallshåndtering, forurensning, lukkede sidebekker og fysiske inngrep. Bryn viser hvorfor naturrestaurering i en byelv må arbeide med både vannkvalitet, elvebredder, forbindelser og historiske inngrep. Et grønt felt er ikke automatisk et restaureringstiltak. Spilleren skal skille det som faktisk kan ses fra det som krever planer, målinger eller fagkilder. Synlige observasjoner kan være erosjon, sedimenter, søppel, kulverter, murer, skygge, vannhastighet og variasjon i vegetasjonen.\n\nHistory Gos fem aktive naturkart gir en union på seks arter for place-id-en: kjempebjørnekjeks (Heracleum mantegazzianum), sildemåke (Larus fuscus), gråtrost (Turdus pilaris), kråke (Corvus cornix), skjære (Pica pica) og gråspurv (Passer domesticus). Fuglene representerer ulike måter å bruke et urbant mosaikklandskap på. Gråspurv bruker bebyggelse og åpne byrom. Kråke og skjære er tilpasningsdyktige kråkefugler som utnytter plener, trær, avfall og ferdselsarealer. Gråtrost bruker åpne grøntområder, plener og bærtrær. Sildemåke er mer knyttet til åpne vann- og byflater og kan passere eller bruke tak og større åpne arealer. Ingen art skal registreres bare fordi den finnes i kartet; fjærdrakt, lyd, atferd eller andre kjennetegn må faktisk observeres.\n\nKjempebjørnekjeks krever en strengere sikkerhetsregel enn de andre artene. Artsdatabanken vurderer den til svært høy økologisk risiko. Planten kan bli opptil flere meter høy, har store hvite skjermer, kraftig stengel og store flikete blader. Plantesaften kan i kombinasjon med sollys gi alvorlige hudskader. Den kan også forveksles med tromsøpalme og andre store skjermplanter. Derfor skal spilleren holde avstand, ikke berøre planten, ikke brekke blader eller stengel og ikke samle materiale. Et mulig funn dokumenteres med avstandsfoto, sted og usikkerhet.\n\nBryn er et overgangssted. Oppstrøms ligger Smalvolls pressede, men relativt horisontale korridor. Nedstrøms går Alnastien inn i Svartdalens trangere dal- og skoglandskap. Ved Bryn blir vannets fall, industriens bruk av fossen og transportens kryssinger synlige samtidig. Den viktigste læringen er at elva fortsatt styrer landskapet selv når den er omgitt av tekniske anlegg—og at artsmangfoldet i slike områder må forstås som en mosaikk av vann, kanter, trær, tak, plener og menneskelig aktivitet.`,
    themes: [
      'Brynsfossen som landskapsform og energikilde',
      'industriutbygging på 1800-tallet',
      'Hovedbanen og Bryn stasjon',
      'Joh. Petersen A/S og fallrettighetene',
      'Alnastien mellom Smalvoll og Svartdalen',
      'broer, murer og transportlinjer',
      'fragmentert blågrønn korridor',
      'naturrestaurering i sterkt endret elv',
      'kjempebjørnekjeks som helseskadelig fremmedart',
      'fem aktive fuglekoblinger',
      'kartkobling mot faktisk feltfunn',
      'trygg observasjon fra etablert ferdselsflate'
    ],
    species_inventory: {
      source_maps: mapFiles,
      flora: [{ id: giantHogweed.id, name: giantHogweed.title, latin: giantHogweed.latin, status: 'fremmed_art_svaert_hoy_risiko_helsefare', map: 'nature_place_map.json' }],
      fauna: inventoryBirds,
      total_species: 6,
      rule: 'all_active_mapped_species_for_place'
    },
    nearby_place_ids: ['alna_smalvoll', 'svartdalen', 'kvaernerbyen_alna']
  },
  tags: ['elv', 'foss', 'byokologi', 'industrihistorie', 'transport', 'fremmede_arter'],
  underbadge_ids: [
    'urbannatur', 'vann_og_vassdrag', 'elv', 'bekk', 'foss_og_stryk', 'elvebredde',
    'vannkvalitet', 'kantvegetasjon', 'fugler', 'planter_og_blomster', 'fremmede_arter',
    'biologisk_mangfold', 'okosystem', 'habitat', 'nisje', 'erosjon', 'sedimenter',
    'spredningskorridor', 'gronn_korridor', 'blagronn_struktur', 'naturrestaurering',
    'skjotsel', 'miljotiltak', 'artsregistrering', 'friluftsforvaltning', 'forurensning',
    'tursti', 'rekreasjon', 'veikantnatur', 'grontdrag'
  ],
  visual: { designCode: 'waterfront_miniature' },
  emne_ids: ['em_natur_arter_habitat_mangfold'],
  quiz_profile: {
    place_type: 'byelv, fossesone, industri- og transportlandskap',
    subtype: 'alna_bryn',
    signature_features: [
      'Brynsfossen ga grunnlag for industri',
      'Hovedbanen styrket Bryns utvikling',
      'Joh. Petersen kjøpte fallrettigheter og flyttet fabrikken til Bryn i 1889',
      'Alnastien forbinder Smalvoll, Bryn og Svartdalen',
      'seks aktive artskoblinger med streng sikkerhetsregel for kjempebjørnekjeks'
    ],
    primary_angles: ['vannkraft_og_terreng', 'fragmentert_elvekorridor', 'industrihistorie', 'fremmed_art_og_helsefare', 'urban_fuglemosaikk'],
    question_families: ['stedsspesifikk_naturfunksjon', 'vannkraft_og_industri', 'artsidentifikasjon', 'sikkerhet', 'kildekritikk', 'observasjon_fra_sti'],
    avoid_angles: ['artsfunn_som_garanti', 'plantekontakt', 'selvstyrt_bekjempelse', 'vading', 'klatring_på_tekniske_anlegg', 'udokumenterte_vannkvalitetstall'],
    must_include: ['Brynsfossen', 'Hovedbanen', 'Alnastien', 'seks aktive arter', 'kjempebjørnekjeks skal ikke berøres'],
    contrast_targets: ['alna_smalvoll', 'svartdalen', 'kvaernerbyen_alna'],
    notes: 'Start med elvas fall og kryssingene. Fugler observeres med kjennetegn; mulig kjempebjørnekjeks dokumenteres kun på avstand.'
  },
  externalLinks: [
    { type: 'reference', label: 'Oslo byleksikon: Bryn', url: refs.bryn, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Alnastien', url: refs.alnastien, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Alnaelva', url: refs.alna, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Joh. Petersen A/S', url: refs.johPetersen, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'NIVA: Naturrestaurering i Alnaelva', url: refs.niva, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo kommune: innsjøer og elver', url: refs.osloRivers, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Artsdatabanken: Kjempebjørnekjeks', url: refs.artsdatabanken, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: aktivt naturkart', url: refs.routeMap, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: fuglekart', url: refs.birdMap, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: fremmedarter', url: refs.floraData, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: byfugler', url: refs.birdDataCity, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: våtmarks- og skogsfugler', url: refs.birdDataWetland, lang: 'nb', verifiedAt: '2026-07-20' }
  ],
  tasks_profile: {
    title: 'Les foss, transport og artsmosaikk',
    summary: 'Fire oppgaver kobler elvas fall, kryssinger, fugler og kjempebjørnekjeks uten å forlate etablert ferdselsflate.',
    tasks: [
      { id: 'alna_bryn_oppgave_fall', title: 'Les vannets fall', instruction: 'Finn et trygt punkt på turvei eller fortau og noter hvor vannet faller, øker fart eller møter mur, bro eller teknisk anlegg.', why: 'Vannets fall forklarer både Brynsfossen og hvorfor industrien ble lagt her.' },
      { id: 'alna_bryn_oppgave_kryssinger', title: 'Kartlegg kryssingene', instruction: 'Registrer jernbane, vei, bru, kulvert eller gangforbindelse som krysser eller snevrer inn elvekorridoren.', why: 'Kryssingene viser hvordan transportinfrastrukturen fragmenterer, men også forbinder landskapet.' },
      { id: 'alna_bryn_oppgave_fugler', title: 'Lag en fuglemosaikk', instruction: 'Observer vann, tak, trær, plen og bebyggelse i fem minutter. Registrer bare fugler når fjærdrakt, lyd eller atferd støtter artsnavnet.', why: 'De fem fugleartene bruker ulike deler av det samme urbane landskapet.' },
      { id: 'alna_bryn_oppgave_kjempebjornkjeks', title: 'Dokumenter mulig kjempebjørnekjeks på avstand', instruction: 'Se etter en svært høy skjermplante med kraftig stengel, store flikete blader og store hvite skjermer. Ikke gå nærmere, berør eller knekk planten; fotografer på avstand og marker usikkerhet.', why: 'Arten er både en høyrisiko fremmedart og en direkte helsefare ved hudkontakt med plantesaft i sollys.' }
    ]
  },
  training_profile: {
    title: 'Trygg overgangsøkt gjennom Bryn',
    summary: 'Tre øvelser bruker Alnastien og andre robuste ferdselsflater uten kontakt med elvekant, trafikksoner eller mulig kjempebjørnekjeks.',
    safety: 'Hold deg på etablert turvei, fortau og tydelig offentlig ferdselsflate. Ikke gå ned i elvekanten, vad, klatre på murer, broer, jernbane- eller industrianlegg. Kryss trafikk bare på sikre krysningspunkter. Ikke berør, knekk eller gå nær mulig kjempebjørnekjeks; plantesaft og sollys kan gi alvorlige hudskader. Ikke forsøk bekjempelse selv.',
    exercises: [
      { id: 'alna_bryn_trening_overgang', title: 'Rolig korridorgange', instruction: 'Gå 18 minutter på etablert rute og bruk broer eller tydelige stikryss som vendepunkt.', duration_minutes: 18, intensity: 'rolig', why: 'Runden gjør overgangen fra Smalvoll til Bryn og videre mot Svartdalen fysisk lesbar.' },
      { id: 'alna_bryn_trening_bakke', title: 'Fire kontrollerte motbakker', instruction: 'Velg en trygg gangvei med svak stigning. Gå raskt opp i 45 sekunder og rolig ned eller videre i 90 sekunder, fire ganger.', duration_minutes: 10, intensity: 'moderat', why: 'Økten bruker terrenget uten å nærme seg foss, jernbane eller tekniske kanter.' },
      { id: 'alna_bryn_trening_observasjon', title: 'Tre systemstopp', instruction: 'Stans på tre trygge punkter og observer ett minutt hver: vannets fall, transportkryssing og artsmosaikk.', duration_minutes: 5, intensity: 'lett', why: 'Stoppene kobler aktivitet til konsentrert natur- og landskapslesning.' }
    ]
  },
  civication_store: [
    { id: 'alna_bryn_fossrelieff', title: 'Relieff av Brynsfossen', type: 'relieffmodell', kind: 'physical_object', desc: 'En fysisk modell av fall, elveløp, murer, broer og industriens plassering.', placeSpecificReason: 'Brynsfossen forklarer både terrenget og industrietableringen.', historicalFunction: 'Viser hvordan vannkraft ble omsatt til fabrikkdrift på Bryn.', physicalObject: true, placeSpecific: true, storePrice: 50, currency: 'PC', collection: 'alna_bryn', collectable: true },
    { id: 'alna_bryn_korridorkart', title: 'Bryn-kart over elv og transport', type: 'korridorkart', kind: 'physical_object', desc: 'Et lagkart med Alna, Alnastien, Hovedbanen, broer, veier og grønne lommer.', placeSpecificReason: 'Bryn er stedet der elvekorridoren tydeligst møter flere transportlag.', historicalFunction: 'Knytter 1800-tallets jernbane og industri til dagens byøkologi.', physicalObject: true, placeSpecific: true, storePrice: 46, currency: 'PC', collection: 'alna_bryn', collectable: true },
    { id: 'alna_bryn_kjempebjornkjeks_sikkerhetskort', title: 'Kjempebjørnekjeks – sikkerhetskort', type: 'artskort', kind: 'physical_object', desc: 'Feltkort med kjennetegn, forvekslingsfare og tydelig berøringsforbud.', placeSpecificReason: 'Kjempebjørnekjeks er Bryns aktive florakobling og krever særskilt sikkerhet.', historicalFunction: 'Dokumenterer hvordan fremmedartsforvaltning og folkehelse møtes langs byelva.', physicalObject: true, placeSpecific: true, storePrice: 26, currency: 'PC', collection: 'alna_bryn', collectable: true },
    { id: 'alna_bryn_fuglemosaikk', title: 'Fuglemosaikk for Bryn', type: 'feltplate', kind: 'physical_object', desc: 'Sammenligningsplate for sildemåke, gråtrost, kråke, skjære og gråspurv.', placeSpecificReason: 'Fem aktive fuglekoblinger viser ulike urbane nisjer ved Bryn.', historicalFunction: 'Viser hvordan nye byflater, gamle trær, elv og industriområder danner et samlet fuglelandskap.', physicalObject: true, placeSpecific: true, storePrice: 34, currency: 'PC', collection: 'alna_bryn', collectable: true }
  ],
  brands: [
    { id: 'alna_bryn_actor', name: 'Alna ved Bryn', brand_kind: 'urban_river_section', brand_type: 'primary_place' },
    { id: 'brynsfossen_actor', name: 'Brynsfossen', brand_kind: 'waterfall', brand_type: 'natural_and_industrial_driver' },
    { id: 'alnaelva_actor_bryn', name: 'Alnaelva', brand_kind: 'urban_river', brand_type: 'natural_system' },
    { id: 'alnastien_actor_bryn', name: 'Alnastien', brand_kind: 'river_path', brand_type: 'access_and_connection' },
    { id: 'joh_petersen_actor_bryn', name: 'Joh. Petersen A/S', brand_kind: 'textile_industry', brand_type: 'historic_industrial_actor' },
    { id: 'hovedbanen_actor_bryn', name: 'Hovedbanen', brand_kind: 'railway', brand_type: 'transport_infrastructure' },
    { id: 'oslo_kommune_bryn', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'planning_authority' },
    { id: 'bymiljoetaten_bryn', name: 'Bymiljøetaten', brand_kind: 'municipal_agency', brand_type: 'path_and_nature_manager' },
    { id: 'vav_bryn', name: 'Vann- og avløpsetaten', brand_kind: 'municipal_agency', brand_type: 'water_management_actor' },
    { id: 'niva_bryn', name: 'NIVA', brand_kind: 'research_institute', brand_type: 'river_restoration_research' },
    { id: 'oslo_elveforum_bryn', name: 'Oslo Elveforum', brand_kind: 'river_forum', brand_type: 'knowledge_and_advocacy_actor' }
  ],
  for_na: {
    title: 'Fra vannkraft og industriknutepunkt til sammensatt blågrønn overgang',
    before: 'Brynsfossen ga energi til industri, mens Hovedbanen og senere transportanlegg gjorde Bryn til et industri- og logistikkområde. Elva ble demmet, ledet, krysset og innsnevret for produksjon og transport.',
    now: 'Alna er fortsatt teknisk preget ved Bryn, men Alnastien og kantvegetasjonen gjør elva synlig og tilgjengelig. Industrihistoriske bygg, nye byprosjekter, jernbane, veier og naturkorridor eksisterer side om side.',
    change: 'Vannet har gått fra å være direkte energikilde for fabrikkene til å bli en synlig natur-, historie- og restaureringsakse. Samtidig viser kjempebjørnekjeks og de urbane fuglene at dagens naturkvalitet må vurderes art for art og sone for sone.',
    look_for: [
      'vannets fall og fart ved Bryn',
      'murer, broer eller demningspreg',
      'eldre industribygninger knyttet til fossen',
      'Hovedbanens og veienes kryssing av landskapet',
      'Alnastien som forbindelse videre mot Svartdalen',
      'smale og brede partier i kantvegetasjonen',
      'tak, plener, trær og vann som ulike fuglenisjer',
      'mulig kjempebjørnekjeks kun fra trygg avstand',
      'erosjon, sedimenter eller søppel synlig fra ferdselsflaten',
      'forskjellen mellom dokumentert tiltak og egen tolkning'
    ],
    sources: Object.values(refs)
  }
};

const story = [{
  id: 'st_alna_bryn_fossen_som_formet_industrien_og_korridoren',
  type: 'environmental',
  title: 'Fossen som formet Bryn',
  year: 1889,
  place_id: placeId,
  person_id: null,
  summary: 'Brynsfossen gjorde Alna til energikilde for industrien, mens jernbanen og dagens byutvikling presset elva inn i en kompleks, men fortsatt levende korridor.',
  story: `Ved Bryn faller Alna gjennom et terreng som lenge bestemte hva mennesker kunne bygge og drive. Brynsfossen ga kraft. Da industrien vokste på 1800-tallet, ble nærheten til fossen kombinert med Hovedbanens transportmuligheter.\n\nI 1889 flyttet Joh. Petersen virksomheten til Bryn etter å ha kjøpt fallrettighetene. Vannet ble demmet og ledet til veveriet, og senere ble en spinneribygning lagt over fossen. Elva var ikke bakgrunn for industrien; den var en del av selve produksjonssystemet.\n\nI dag er kraftuttaket ikke hovedfunksjonen. Elva går fortsatt mellom broer, murer, jernbane, veier og byutvikling, mens Alnastien gjør strekningen mulig å følge. De grønne kantene og de urbane fuglene viser at naturfunksjonen ikke er borte, men fordelt på små soner.\n\nKjempebjørnekjeks viser samtidig at grønn vekst kan være både økologisk problem og helsefare. Riktig respons er avstand, dokumentasjon og faglig forvaltning—ikke berøring eller privat bekjempelse. Bryn blir dermed et lærested for hvordan vannkraft, industri, transport, restaurering og artskunnskap virker sammen i samme elvelandskap.`,
  sources: commonSources,
  tags: ['alna_bryn', 'brynsfossen', 'alnaelva', 'industri', 'jernbane', 'kjempebjørnekjeks', 'byfugler'],
  related_people: [],
  related_places: ['alna_smalvoll', 'svartdalen', 'kvaernerbyen_alna'],
  score: { narrative: 5, historical: 5, source: 5, play_value: 5, originality: 4, total: 24 },
  arc: {
    start: 'Brynsfossen ga et naturlig kraftgrunnlag.',
    middle: 'Industrien og jernbanen bygde om elverommet og gjorde Bryn til knutepunkt.',
    end: 'Alnastien, restaureringsarbeid og artsobservasjon gjør den tekniske elvekorridoren lesbar på nytt.'
  },
  next_scenes: [
    { place_id: 'svartdalen', reason: 'Svartdalen viser hvordan Alna går fra Bryns tekniske landskap inn i en trang skogdal.' },
    { place_id: 'alna_smalvoll', reason: 'Smalvoll gir kontrasten til en flatere og mer langstrakt næringskorridor oppstrøms.' }
  ]
}];

const fact = (id, label, desc, sources, confidence = 'high') => ({ id, label, desc, confidence, sources });
const chronology = [
  { id: 'chrono_01', year: 1854, period: 'Hovedbanen åpner', desc: 'Jernbanen gjennom Bryn styrket områdets transportfortrinn og industrielle utvikling.', confidence: 'high', sources: [source('Oslo byleksikon: Bryn', refs.bryn)] },
  { id: 'chrono_02', year: 1858, period: 'Bryn stasjon opprettes', desc: 'Bryn ble tidlig stoppested på Hovedbanen.', confidence: 'medium', sources: [source('Oslo byleksikon: Bryn', refs.bryn)] },
  { id: 'chrono_03', year: 1889, period: 'Joh. Petersen flytter til Bryn', desc: 'Bedriften kjøpte fallrettigheter og etablerte tekstilvirksomhet ved Brynsfossen.', confidence: 'high', sources: [source('Oslo byleksikon: Joh. Petersen A/S', refs.johPetersen)] },
  { id: 'chrono_04', year: 1896, period: 'Ny veveribygning', desc: 'Joh. Petersen bygde enda en stor fabrikkbygning ved fossen.', confidence: 'high', sources: [source('Oslo byleksikon: Joh. Petersen A/S', refs.johPetersen)] },
  { id: 'chrono_05', year: 1938, period: 'Nedre Alnasti anlegges', desc: 'Den nederste strekningen av Alnastien ble anlagt.', confidence: 'high', sources: [source('Oslo byleksikon: Alnastien', refs.alnastien)] },
  { id: 'chrono_06', year: 1992, period: 'Aksjon Alna starter', desc: 'Kommunen startet Aksjon Alna og turveien ble gradvis opparbeidet videre.', confidence: 'high', sources: [source('Oslo byleksikon: Alnastien', refs.alnastien)] },
  { id: 'chrono_07', year: 2023, period: 'Kjempebjørnekjeks vurderes til SE', desc: 'Fremmedartslista 2023 vurderte kjempebjørnekjeks til svært høy økologisk risiko.', confidence: 'high', sources: [source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken)] },
  { id: 'chrono_08', year: 2026, period: 'History Go-rundingen', desc: 'Bryn får full natur-runding med seks artskoblinger og sikkerhetsregel for kjempebjørnekjeks.', confidence: 'high', sources: [source('History Go: aktivt naturkart', refs.routeMap)] }
];
const article = {
  place_id: placeId,
  visual: { designCode: 'article_nature_route_miniature' },
  version: 2,
  title: 'Alna ved Bryn',
  popupDesc: 'Elvestrekning ved Brynsfossen der vannkraft, industri, jernbane, Alnastien, fremmedart og fem byfugler kan leses i samme landskap.',
  wikiText: [
    'Brynsfossen i Alna ga grunnlag for industriutbygging på Bryn, mens Hovedbanen styrket områdets transportfortrinn.',
    'Joh. Petersen A/S flyttet til Bryn i 1889 etter å ha kjøpt fallrettighetene og brukte vannet i tekstilproduksjonen.',
    'Alnastien forbinder Smalvoll, Bryn og Svartdalen gjennom et landskap med broer, jernbane, veier og smale grønne kanter.',
    'History Gos aktive naturkart knytter kjempebjørnekjeks og fem fuglearter til stedet. Kartkobling er ikke garanti for funn, og kjempebjørnekjeks skal aldri berøres.'
  ],
  summary: {
    one_liner: 'Bryn viser hvordan en foss kan forme industri, transport og dagens urbane naturkorridor.',
    themes: ['Brynsfossen', 'vannkraft', 'industri', 'Hovedbanen', 'Alnastien', 'kjempebjørnekjeks', 'byfugler'],
    tone: ['nøktern', 'stedsspesifikk', 'sikkerhetsbevisst']
  },
  facts: [
    fact('fact_01', 'Bryn og fossen', 'Beliggenheten ved Brynsfossen i Alna ga grunnlag for allsidig industri.', [source('Oslo byleksikon: Bryn', refs.bryn)]),
    fact('fact_02', 'Industriutbygging', 'Den store industriutbyggingen på Bryn kom på 1800-tallet.', [source('Oslo byleksikon: Bryn', refs.bryn)]),
    fact('fact_03', 'Transportfortrinn', 'Hovedbanen gjennom Bryn styrket industriens transportmuligheter.', [source('Oslo byleksikon: Bryn', refs.bryn)]),
    fact('fact_04', 'Joh. Petersen', 'Joh. Petersen A/S flyttet virksomheten til Bryn i 1889 etter å ha kjøpt fallrettighetene.', [source('Oslo byleksikon: Joh. Petersen A/S', refs.johPetersen)]),
    fact('fact_05', 'Vannledning til veveri', 'En demning ledet vann fra fossen til veveribygningen.', [source('Oslo byleksikon: Joh. Petersen A/S', refs.johPetersen)]),
    fact('fact_06', 'Alnastien', 'Alnastien går fra Smalvollveien til Bryn og videre ned Svartdalen.', [source('Oslo byleksikon: Alnastien', refs.alnastien)]),
    fact('fact_07', 'Restaureringsbehov', 'Alna er belastet av historisk industri, forurensning, avfall og fysiske inngrep.', [source('NIVA: Naturrestaurering i Alnaelva', refs.niva)]),
    fact('fact_08', 'Aktiv florakobling', 'History Gos naturkart knytter kjempebjørnekjeks til alna_bryn.', [source('History Go: aktivt naturkart', refs.routeMap)]),
    fact('fact_09', 'Aktive fuglekoblinger', 'Sildemåke, gråtrost, kråke, skjære og gråspurv er aktive faunakoblinger.', [source('History Go: aktivt naturkart', refs.routeMap), source('History Go: fuglekart', refs.birdMap)]),
    fact('fact_10', 'Risiko', 'Kjempebjørnekjeks er vurdert til svært høy økologisk risiko.', [source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken)]),
    fact('fact_11', 'Helsefare', 'Plantesaften kan i kombinasjon med sollys gi alvorlige hudskader.', [source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken)]),
    fact('fact_12', 'Kjennetegn', 'Kjempebjørnekjeks kan bli svært høy og har store hvite skjermer, kraftig stengel og store flikete blader.', [source('History Go: fremmedarter', refs.floraData), source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken)]),
    fact('fact_13', 'Artsmosaikk', 'De fem fugleartene bruker ulike soner som tak, bebyggelse, plen, trær, åpne flater og vannnære områder.', [source('History Go: byfugler', refs.birdDataCity), source('History Go: våtmarks- og skogsfugler', refs.birdDataWetland)]),
    fact('fact_14', 'Kildekritisk feltregel', 'Aktive kartkoblinger må bekreftes med faktiske kjennetegn ved hvert funn.', [source('History Go: aktivt naturkart', refs.routeMap)])
  ],
  chronology,
  sections: [
    { id: 'foss_og_industri', title: 'Fossen og industrien', text: 'Brynsfossen skapte et energigrunnlag som gjorde stedet attraktivt for fabrikker. Industrihistorien forklarer mange av dagens tekniske inngrep.' },
    { id: 'transportkorridor', title: 'Jernbane, vei og tursti', text: 'Hovedbanen, broer, veier og Alnastien krysser eller følger elva. Til sammen skaper de både barrierer og forbindelser.' },
    { id: 'artslandskap', title: 'Seks aktive arter', text: 'Kjempebjørnekjeks og fem fugler viser hvordan et urbant mosaikklandskap består av flere ulike nisjer og risikonivåer.' },
    { id: 'sikkerhet_og_forvaltning', title: 'Sikkerhet og forvaltning', text: 'Mulig kjempebjørnekjeks observeres kun på avstand. Restaurering og bekjempelse skal være dokumentert og faglig ledet.' }
  ],
  related_places: ['alna_smalvoll', 'svartdalen', 'kvaernerbyen_alna'],
  sources: commonSources
};

const qSources = {
  bryn: [refs.bryn, refs.alna],
  path: [refs.alnastien],
  industry: [refs.bryn, refs.johPetersen],
  river: [refs.niva, refs.alna],
  plant: [refs.artsdatabanken, refs.floraData],
  birds: [refs.routeMap, refs.birdDataCity, refs.birdDataWetland],
  mixed: [refs.bryn, refs.alnastien, refs.artsdatabanken, refs.routeMap]
};
const q = (question, answer, distractors, knowledge, sourceKey, layer, difficulty = 1) => ({ question, answer, distractors, knowledge, source: qSources[sourceKey], layer, difficulty });
const setSpecs = [
  { mode: 'place_intro', layer: 'intro', questions: [
    q('Hvilken elv går gjennom Bryn?', 'Alna', ['Akerselva', 'Lysakerelva'], 'Bryn ligger langs Alna.', 'bryn', 'intro'),
    q('Hva heter fossen ved Bryn?', 'Brynsfossen', ['Hølaløkka', 'Møllefossen'], 'Brynsfossen ga grunnlag for industri.', 'bryn', 'intro'),
    q('Hva styrket industriens transportmuligheter?', 'Hovedbanen', ['Kyststien', 'T-banen til Frognerseteren'], 'Jernbanen var avgjørende for Bryns utvikling.', 'industry', 'intro'),
    q('Hvor går Alnastien videre fra Bryn?', 'Ned Svartdalen', ['Mot Bygdøy', 'Langs Frognerkilen'], 'Alnastien forbinder Bryn og Svartdalen.', 'path', 'intro'),
    q('Hva bør leses først på stedet?', 'Elvas fall, kryssinger og kantvegetasjon', ['Bare butikkskilt', 'Kun biltrafikken'], 'Disse trekkene viser natur- og infrastruktursystemet.', 'mixed', 'intro'),
    q('Hva er riktig første sikkerhetsregel?', 'Hold deg på etablert ferdselsflate', ['Klatre på murene', 'Vad gjennom fossen'], 'Bryn har bratte, tekniske og trafikkerte soner.', 'path', 'intro'),
    q('Hvor mange aktive artskoblinger har stedet?', 'Seks', ['Én', 'Tolv'], 'Kartunionen består av én plante og fem fugler.', 'birds', 'intro')
  ]},
  { mode: 'water_industry', layer: 'history', questions: [
    q('Hvorfor ble industri lagt ved Brynsfossen?', 'Fossen ga vannkraft', ['Fossen ga saltvann', 'Fossen gjorde jernbane unødvendig'], 'Fallhøyden gjorde energi tilgjengelig.', 'industry', 'history'),
    q('Når flyttet Joh. Petersen til Bryn?', '1889', ['1854', '1992'], 'Bedriften flyttet til Bryn i 1889.', 'industry', 'history'),
    q('Hva kjøpte Joh. Petersen ved fossen?', 'Fallrettighetene', ['Fiskerett i fjorden', 'En flyplass'], 'Fallrettighetene ga tilgang til vannkraft.', 'industry', 'history'),
    q('Hva ledet vannet til veveribygningen?', 'En demning og vannføring', ['En motorvei', 'En skogssti'], 'Vannet ble teknisk styrt til produksjonen.', 'industry', 'history'),
    q('Hva viser murer og tekniske løp i dag?', 'Historisk omforming av elverommet', ['At elva er naturlig urørt', 'At området var havbunn i går'], 'Industrien bygde elva inn i produksjonssystemet.', 'industry', 'history', 2),
    q('Hva må skilles fra synlig observasjon?', 'En udokumentert forklaring på hvert anlegg', ['Vannets retning', 'En synlig bro'], 'Funksjoner og dateringer krever kilder.', 'mixed', 'history'),
    q('Hva er den beste samlebeskrivelsen?', 'Vannkraft og jernbane formet Bryns industri', ['Bare fugler formet Bryn', 'Bryn utviklet seg uten elva'], 'Naturgrunnlag og transport virket sammen.', 'industry', 'history', 2)
  ]},
  { mode: 'plant_safety', layer: 'flora', questions: [
    q('Hvilken floraart er aktivt koblet til Bryn?', 'Kjempebjørnekjeks', ['Parkslirekne', 'Åkerkvein'], 'Kjempebjørnekjeks er aktiv florakobling.', 'plant', 'flora'),
    q('Hva er det vitenskapelige navnet?', 'Heracleum mantegazzianum', ['Larus fuscus', 'Turdus pilaris'], 'Artsnavnet er Heracleum mantegazzianum.', 'plant', 'flora'),
    q('Hvordan vurderes arten?', 'Svært høy økologisk risiko', ['Ingen kjent risiko', 'Hjemmehørende rødlisteart'], 'Artsdatabanken vurderer arten til SE.', 'plant', 'flora'),
    q('Hva kan plantesaften gjøre i sollys?', 'Gi alvorlige hudskader', ['Farge klær blå', 'Gjøre huden kulderesistent'], 'Fytotoksisk plantesaft gjør berøring farlig.', 'plant', 'flora'),
    q('Hvilket kjennetegn passer?', 'Svært høy plante med store hvite skjermer', ['Liten brungrå spurv', 'Bambuslignende stengler'], 'Størrelse og skjermblomster er sentrale kjennetegn.', 'plant', 'flora'),
    q('Hva er riktig feltatferd?', 'Hold avstand og fotografer uten berøring', ['Knekk et blad', 'Grav opp roten'], 'Spilleren skal ikke eksponeres eller spre planten.', 'plant', 'flora'),
    q('Hvorfor skal funnet registreres med usikkerhet?', 'Store skjermplanter kan forveksles', ['Arten har ingen kjennetegn', 'Alle planter er samme art'], 'Tromsøpalme og andre arter kan ligne.', 'plant', 'flora', 2)
  ]},
  { mode: 'birds', layer: 'fauna', questions: [
    q('Hvilken aktiv art er en måke?', 'Sildemåke', ['Gråtrost', 'Gråspurv'], 'Sildemåke er Bryns aktive måkeart.', 'birds', 'fauna'),
    q('Hva kjennetegner sildemåke i artskortet?', 'Mørkere grå rygg enn gråmåke', ['Grått hode og prikket bryst', 'Lang svart-hvit hale'], 'Ryggfargen er et viktig sammenligningstrekk.', 'birds', 'fauna'),
    q('Hvilken art har grått hode, brun rygg og prikket bryst?', 'Gråtrost', ['Kråke', 'Skjære'], 'Dette er gråtrostens hovedkjennetegn.', 'birds', 'fauna'),
    q('Hvilken art har grå kropp og svart hode, vinger og hale?', 'Kråke', ['Gråspurv', 'Sildemåke'], 'Kråkas kontrastdrakt er tydelig.', 'birds', 'fauna'),
    q('Hvilken art er svart-hvit med lang hale?', 'Skjære', ['Gråtrost', 'Gråspurv'], 'Skjæras lange hale og kontrastdrakt skiller den.', 'birds', 'fauna'),
    q('Hvilken art er liten og brungrå, ofte ved bebyggelse?', 'Gråspurv', ['Sildemåke', 'Kråke'], 'Gråspurv bruker tett bystruktur og åpne byrom.', 'birds', 'fauna'),
    q('Hva må til før en fugl registreres?', 'Synlige eller hørbare kjennetegn', ['Kartikonet alene', 'At en annen fugl var der i går'], 'Kartkobling er ikke et aktuelt feltfunn.', 'birds', 'fauna')
  ]},
  { mode: 'corridor', layer: 'management', questions: [
    q('Hva kan fragmentere elvekorridoren ved Bryn?', 'Veier, jernbane, murer og broer', ['Bær på et tre', 'Fuglesang alene'], 'Kryssende infrastruktur kan snevre inn forbindelsen.', 'river', 'management'),
    q('Hva gjør Alnastien viktig?', 'Den gir en sammenhengende ferdselslinje langs elva', ['Den lukker elva', 'Den flytter fossen'], 'Turveien forbinder delområdene.', 'path', 'management'),
    q('Hva kan restaurering omfatte?', 'Vannkvalitet, elvebredder og forbindelser', ['Bare maling av broer', 'Flere private parkeringsplasser'], 'NIVA beskriver flere økologiske og fysiske mål.', 'river', 'management'),
    q('Hva er feil å anta?', 'At alt grønt er dokumentert restaurering', ['At erosjon kan observeres', 'At planer kan kildebelegge tiltak'], 'Grønn farge alene dokumenterer ikke funksjon eller tiltak.', 'river', 'management'),
    q('Hvordan dokumenteres mulig kjempebjørnekjeks?', 'Avstandsfoto, sted og usikkerhet', ['Berøring og innsamling', 'Flytting til en tryggere plass'], 'Dokumentasjon skal ikke skape helse- eller spredningsfare.', 'plant', 'management'),
    q('Hva er en god fugleobservasjon?', 'Art, antall, sone og atferd', ['Bare et løst navn', 'Mating for å lokke fuglene'], 'Kontekst gjør observasjonen etterprøvbar.', 'birds', 'management'),
    q('Hva bør en systemlogg samle?', 'Vann, infrastruktur, vegetasjon, arter og belastning', ['Bare antall biler', 'Bare ett historisk årstall'], 'Bryn må leses som et sammensatt system.', 'mixed', 'management', 2)
  ]},
  { mode: 'synthesis', layer: 'synthesis', questions: [
    q('Hva er den sterkeste samlebeskrivelsen av Bryn?', 'Foss, industrilandskap, transportknutepunkt og naturkorridor', ['Urørt fjellvidde', 'Ren saltvannshavn'], 'Flere historiske og økologiske lag virker samtidig.', 'mixed', 'synthesis', 2),
    q('Hva skiller Bryn fra Smalvoll?', 'Bryn har tydeligere fall, foss og industrihistoriske kraftanlegg', ['Bryn ligger uten elv', 'Smalvoll ligger ved fjorden'], 'Terreng og vannkraft gir Bryn en annen karakter.', 'mixed', 'synthesis'),
    q('Hva skiller Bryn fra Svartdalen?', 'Bryn er mer teknisk og transportpreget', ['Svartdalen har ingen Alna', 'Bryn er urørt gammelskog'], 'Nedstrøms blir dal- og skogpreget sterkere.', 'mixed', 'synthesis'),
    q('Hva viser fugleartene samlet?', 'Ulike urbane soner gir ulike nisjer', ['Alle fugler bruker bare fossen', 'Artsnavn sier ingenting om habitat'], 'Tak, plen, trær, vann og bebyggelse danner en mosaikk.', 'birds', 'synthesis'),
    q('Hva viser kjempebjørnekjeks om grøntareal?', 'Grønt kan ha høy risiko og kreve faglig forvaltning', ['Alt grønt er automatisk naturrestaurert', 'Fremmede arter er alltid ufarlige'], 'Naturkvalitet krever artskunnskap.', 'plant', 'synthesis', 2),
    q('Hva bør en god History Go-observasjon ende med?', 'Etterprøvbar beskrivelse og tydelig usikkerhet', ['Sikker påstand uten funn', 'Privat bekjempelse'], 'Presisjon og sikkerhet går foran raske konklusjoner.', 'mixed', 'synthesis'),
    q('Hvorfor er 1889 viktig?', 'Joh. Petersen flyttet virksomheten til Bryn', ['Alnastien åpnet i Svartdalen', 'Kjempebjørnekjeks ble beskrevet i Norge'], 'Året knytter fallrettighetene og industrien konkret til stedet.', 'industry', 'synthesis')
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
    hold_back: ['ingen vading eller klatring', 'ingen kontakt med kjempebjørnekjeks', 'ingen selvstyrt bekjempelse eller fuglemating']
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
        core_concepts: ['arter', 'habitat', 'vassdrag', 'industrihistorie', 'forvaltning']
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
if (!routeRow) throw new Error('Mangler Alna ved Bryn i rutemanifestet');
routeRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, placePath))).digest('hex');
writeJson(routeManifestPath, routeManifest);

const placesIndex = readJson('data/places/places_index.json');
const globalRow = placesIndex.find(x => x.id === placeId);
if (!globalRow) throw new Error('Mangler Alna ved Bryn i global plassindeks');
globalRow.desc = place.desc;
writeJson('data/places/places_index.json', placesIndex);

const report = `# Alna ved Bryn – natur-rundinger batch 1\n\n## Omfang\n\n- Fyller alle ni natur-rundinger for \`${placeId}\`.\n- Bevarer ID, koordinat, radius, kategori, routeId og koordinatstatus.\n- Registrerer fortelling, leksikon og 6 × 7 quizspørsmål i manifestene.\n\n## Aktiv artsunion\n\n- Flora: Kjempebjørnekjeks (\`${giantHogweed.id}\`, ${giantHogweed.latin})\n- Fauna: Sildemåke, gråtrost, kråke, skjære og gråspurv\n- Totalt: 6 arter\n- Regel: Alle aktive koblinger fra fem naturkart. Kartkobling er ikke garanti for feltfunn.\n\n## Stedlig retning\n\nBryn behandles som fossesone, historisk vannkraftsted og fragmentert blågrønn overgang mellom Smalvoll og Svartdalen. Rundingene bygger på Brynsfossen, Joh. Petersen, Hovedbanen, Alnastien, restaureringsbehov, fem urbane fuglearter og streng sikkerhet rundt kjempebjørnekjeks.\n\n## Kontroll\n\nMaterialiseringen skal bestå målrettet test, eksisterende Alna-/Oslo-naturtester, \`scripts/check-places.sh\`, indeks- og manifestsynk samt \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report);

const test = `const assert = require('assert');\nconst crypto = require('crypto');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));\nconst expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];\nconst runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst profileMatch = runtime.match(/natur:\\s*\\[([^\\]]+)\\]/);\nassert(profileMatch, 'runtime mangler naturprofil');\nassert.deepStrictEqual(JSON.parse(\`[\${profileMatch[1]}]\`), expectedRounds);\nconst placePath='${placePath}', quizPath='${quizPath}', storyPath='${storyPath}', articlePath='${articlePath}';\nconst place=readJson(placePath), quiz=readJson(quizPath), story=readJson(storyPath)[0], article=readJson(articlePath);\nconst index=readJson('data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json').find(x=>x.id===place.id);\nconst routeManifest=readJson('${routeManifestPath}');\nconst manifestRow=routeManifest.places.find(x=>x.id===place.id);\nconst quizManifest=readJson('data/quiz/manifest.json');\nconst storyManifest=readJson('data/stories/stories_manifest.json');\nconst leksikonManifest=readJson('data/leksikon/manifest.json');\nconst validBadges=new Set(readJson('data/badges/natur.json').sub);\nassert.strictEqual(place.id,'${placeId}');\nassert.strictEqual(place.name,'Alna ved Bryn');\nassert.strictEqual(place.category,'natur');\nassert.deepStrictEqual([place.lat,place.lon,place.r,place.year??null],[59.90931,10.81195,160,null]);\nassert.strictEqual(place.routeId,'alnaelva_grontdrag');\nassert.strictEqual(place.coordStatus,'nearby_reference');\nassert.strictEqual(place.coordType,'route_point');\nassert.strictEqual(place.coordPrecisionM,180);\nassert(index&&manifestRow);\nassert.deepStrictEqual([index.lat,index.lon,index.r,index.year??null],[place.lat,place.lon,place.r,place.year??null]);\nconst hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,placePath))).digest('hex');\nassert.strictEqual(manifestRow.sha256,hash);\nfor(const key of ['rounds','rundinger','routes','works','people','play_profile','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place,key),\`forbudt felt \${key}\`);\nconst roundContent={tasks:place.tasks_profile,nature:place.nature_profile,badges:place.underbadge_ids,training:place.training_profile,civication:place.civication_store,brands:place.brands,før_nå:place.for_na,fortellinger:[story],leksikon:[article]};\nassert.deepStrictEqual(Object.keys(roundContent),expectedRounds);\nfor(const [id,value] of Object.entries(roundContent)){const filled=Array.isArray(value)?value.length>0:Boolean(value&&typeof value==='object');assert(filled,\`mangler \${id}\`);}\nassert(place.externalLinks.length>=10&&place.externalLinks.every(x=>x.type==='repository'||/^https:\\/\\//.test(x.url)));\nassert(place.underbadge_ids.length>=25&&place.underbadge_ids.every(x=>validBadges.has(x)));\nassert.strictEqual(place.tasks_profile.tasks.length,4);\nassert.strictEqual(place.training_profile.exercises.length,3);\nassert(/ikke.*berør|ikke.*knekk|ikke.*bekjemp/i.test(place.training_profile.safety));\nassert(/hudskader/i.test(place.training_profile.safety));\nassert(place.civication_store.length===4&&place.civication_store.every(x=>x.physicalObject&&x.placeSpecific));\nassert(place.brands.length>=10);\nassert(place.for_na.look_for.length>=8);\nassert(place.nature_profile.summary.length>=2500);\nassert.deepStrictEqual(place.nature_profile.nearby_place_ids,['alna_smalvoll','svartdalen','kvaernerbyen_alna']);\nconst mapFiles=${JSON.stringify(mapFiles)}; const merged={flora:[],fauna:[]};\nfor(const file of mapFiles){const raw=readJson(file);const entry=(raw.places||raw).${placeId};if(!entry)continue;merged.flora.push(...(entry.flora||[]));merged.fauna.push(...(entry.fauna||[]));}\nmerged.flora=[...new Set(merged.flora)].sort();merged.fauna=[...new Set(merged.fauna)].sort();\nassert.deepStrictEqual(merged.flora,['emne_flora_kjempebjornkjeks']);\nassert.deepStrictEqual(merged.fauna,${JSON.stringify(expectedFauna)});\nconst inventory=place.nature_profile.species_inventory;assert.strictEqual(inventory.total_species,6);assert.deepStrictEqual(inventory.flora.map(x=>x.id),['emne_flora_kjempebjornkjeks']);assert.deepStrictEqual(inventory.fauna.map(x=>x.id).sort(),${JSON.stringify(expectedFauna)});\nassert.strictEqual(quiz.sets.length,6);assert(quiz.sets.every((s,i)=>s.order===i+1&&s.questions.length===7));\nassert(quiz.sets.flatMap(s=>s.questions).every(q=>q.categoryId==='natur'&&q.placeId===place.id&&Array.isArray(q.source)&&q.source.length&&q.claim_basis==='documented'&&q.options[q.answerIndex]===q.answer&&q.related_emners.includes('em_natur_arter_habitat_mangfold')));\nassert.deepStrictEqual(quizManifest.sets.filter(x=>x.targetId===place.id),[{targetId:place.id,file:quizPath}]);\nassert(story&&story.place_id===place.id&&story.sources.length>=10);assert(storyManifest.files.some(x=>x.path===storyPath&&x.entity_id===place.id&&x.category==='natur'));\nassert(article&&article.place_id===place.id&&article.version===2&&article.title===place.name);assert(article.sources.length>=10&&article.facts.length>=14&&article.chronology.length>=8);assert(leksikonManifest.files.includes(articlePath));\nconst all=JSON.stringify({place,quiz,story,article});\nfor(const token of ['Alna ved Bryn','Brynsfossen','Hovedbanen','Joh. Petersen','1889','Alnastien','kjempebjørnekjeks','Heracleum mantegazzianum','sildemåke','gråtrost','kråke','skjære','gråspurv','svært høy','hudskader']) assert(all.toLowerCase().includes(token.toLowerCase()),\`mangler \${token}\`);\nassert(/ikke en garanti|ikke.*garanti/i.test(all));assert(/ikke.*berør|hold avstand/i.test(all));\nconsole.log('Alna Bryn nature rounds batch 1 OK');\n`;
fs.mkdirSync(path.dirname(path.join(root, testPath)), { recursive: true });
fs.writeFileSync(path.join(root, testPath), test);

run(process.execPath, [testPath]);
run(process.execPath, ['tests/oslo-nature-rounds-batch5-alna.test.js']);
run(process.execPath, ['tests/oslo-nature-rounds-batch4.test.js']);
run('bash', ['scripts/check-places.sh']);
run('git', ['diff', '--check']);
console.log('Alna Bryn materialized and validated');
