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

const placeId = 'kvaernerbyen_alna';
const placePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/kvaernerbyen_alna.json';
const routeManifestPath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json';
const quizPath = 'data/quiz/natur/kvaernerbyen_alna_sets.json';
const storyPath = 'data/stories/stories_kvaernerbyen_alna.json';
const articlePath = 'data/leksikon/places/oslo/natur/leksikon_kvaernerbyen_alna.json';
const reportPath = 'reports/kvaernerbyen-alna-nature-rounds-batch1.md';
const testPath = 'tests/kvaernerbyen-alna-nature-rounds-batch1.test.js';
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
const expectedFlora = [];
const expectedFauna = [
  'emne_fauna_bokfink', 'emne_fauna_graatrost', 'emne_fauna_kjottmeis',
  'emne_fauna_kraake', 'emne_fauna_linerle', 'emne_fauna_munk',
  'emne_fauna_rodstrupe', 'emne_fauna_skjaere', 'emne_fauna_stokkand',
  'emne_fauna_svarttrost'
].sort();
if (JSON.stringify(union.flora) !== JSON.stringify(expectedFlora) || JSON.stringify(union.fauna) !== JSON.stringify(expectedFauna)) {
  throw new Error(`Uventet artsunion for ${placeId}: ${JSON.stringify(union)}`);
}

const birdSources = [
  ...readJson('data/natur/fauna/fugler_by.json'),
  ...readJson('data/natur/fauna/fugler_vatmark_og_skog.json')
];
const birds = expectedFauna.map(id => birdSources.find(x => x.id === id));
if (birds.some(x => !x)) throw new Error('Fant ikke alle fuglekortene for Kværnerbyen');

const refs = {
  kvaernerbyen: 'https://oslobyleksikon.no/side/Kv%C3%A6rnerbyen',
  lodalsparken: 'https://oslobyleksikon.no/side/Lodalsparken',
  kvaernerBrug: 'https://oslobyleksikon.no/side/Kv%C3%A6rner_Brug',
  snlKvaernerbyen: 'https://snl.no/Kv%C3%A6rnerbyen',
  projectHistory: 'https://kvbyen.no/artikler/historie',
  waterDesign: 'https://landskapsarkitektur.no/prosjekter/kvarnerbyen-vannlop',
  alna: 'https://snl.no/Alna_-_elv_i_Oslo',
  routeMap: 'data/natur/nature_place_map.json',
  birdDataCity: 'data/natur/fauna/fugler_by.json',
  birdDataWetland: 'data/natur/fauna/fugler_vatmark_og_skog.json'
};
const commonSources = [
  source('Oslo byleksikon: Kværnerbyen', refs.kvaernerbyen),
  source('Oslo byleksikon: Lodalsparken', refs.lodalsparken),
  source('Oslo byleksikon: Kværner Brug', refs.kvaernerBrug),
  source('Store norske leksikon: Kværnerbyen', refs.snlKvaernerbyen),
  source('Kværnerbyen: Historien bak området', refs.projectHistory),
  source('Norske landskapsarkitekters forening: Kværnerbyen vannløp', refs.waterDesign),
  source('Store norske leksikon: Alna', refs.alna),
  source('History Go: aktivt naturkart', refs.routeMap),
  source('History Go: byfugler', refs.birdDataCity),
  source('History Go: våtmarks- og skogsfugler', refs.birdDataWetland)
];

const oldPlace = readJson(placePath);
const inventoryBirds = birds.map(x => ({ id: x.id, name: x.title, latin: x.latin, status: 'aktiv_kartkobling', map: 'nature_place_map.json' }));
const place = {
  ...oldPlace,
  desc: 'Transformert industriområde der Alna går i kulvert under et formgitt vannspeil, mens park, boligby og ti aktive fuglearter danner et nytt blågrønt byrom.',
  popupDesc: 'Kværnerbyen ligger på det tidligere industriområdet til Kværner Brug. Lodalsparken har et grunt, formgitt vannspeil og Kværnerdammen som følger et elvelignende løp gjennom bebyggelsen. Den virkelige Alna har historisk gått i kulvert under området; vannspeilet må derfor ikke omtales som en åpen elvestrekning uten ny dokumentasjon. History Gos aktive naturkart knytter ti fuglearter til stedet. Fuglene bruker vannspeil, park, tak, trær, gårdsrom og bebyggelse som en urban mosaikk, men kartkoblingen garanterer ikke funn ved hvert besøk.',
  nature_profile: {
    type: 'transformert industriområde / formgitt vannrom / boligby / urban fuglemosaikk',
    title: 'Kværnerbyen som vannminne, bypark og fuglehabitat',
    summary: `Kværnerbyen ligger i Lodalen på området der Kværner Brug drev tungindustri fra 1853 til virksomheten ble lagt ned i 1999. Industrien vokste fram ved Alnas vannfall og vannfallsrettigheter. Oluf Onsum overtok gården Kværner med mølle og vannkraftgrunnlag og utviklet jernstøperi, maskinproduksjon og senere en internasjonalt kjent turbinindustri. Naturressursen vann ble dermed både energikilde, transportert kraft og symbol for industrien.\n\nEtter nedleggelsen ble området omformet til boligby. Reguleringsplanen ble vedtatt i 2005, de første boligene kom i salg i 2006, og de første beboerne flyttet inn i 2007. Store deler av produksjonsanlegget ble revet, mens blant annet Kværnerhallen, administrasjonsbygninger og Fyrhuset ble bevart eller gitt ny bruk. Gatenavn og borettslagsnavn som Turbinveien, Smeltedigelen, Pelton og Francis holder industrispråket synlig i bybildet.\n\nLodalsparken ble ferdigstilt i 2009. Parkens vannsystem består av en smal kanal, et stort grunt vannspeil og et slyngende løp, med Kværnerdammen i den østlige delen. Vannspeilet er formet som et elveløp og er maksimalt omtrent 20 centimeter dypt. Det er laget for opphold, lek, bading og frostbruk. Prosjektdokumentasjonen beskriver at Alna gikk i kulvert under Kværnerbyen, mens parkvannet i første fase ble sirkulert fra en separat grunnvannsbrønn. Systemet ble teknisk forberedt for mulig framtidig Alnavann. Rundingen må derfor skille tydelig mellom tre ting: den historiske Alna-traseen, den kulverterte elva og det formgitte parkvannet.\n\nDenne forskjellen er naturfaglig viktig. Et vannspeil kan skape mikroklima, drikkemuligheter, åpne flater og kantsoner for fugler, selv når det ikke er en åpen naturlig elv. Samtidig er vannsystemet sterkt kontrollert: dybde, kanter, sirkulasjon, bruk og vinterfunksjon er designet. Spilleren skal lese hvilke deler som er landskapsarkitektur, hvilke som er vegetasjon, og hvilke påstander som krever teknisk dokumentasjon. Det er ikke riktig å slutte fra synlig vann til naturlig vannføring eller god økologisk tilstand.\n\nHistory Gos fem aktive naturkart gir en union på ti fuglearter: rødstrupe (Erithacus rubecula), munk (Sylvia atricapilla), svarttrost (Turdus merula), bokfink (Fringilla coelebs), gråtrost (Turdus pilaris), kjøttmeis (Parus major), kråke (Corvus cornix), linerle (Motacilla alba), skjære (Pica pica) og stokkand (Anas platyrhynchos). Ingen floraarter er aktivt kartkoblet. Fuglene representerer flere urbane nisjer.\n\nStokkand bruker vannflate og kanter. Linerle søker ofte nær åpne flater og vann. Rødstrupe, munk, svarttrost, bokfink, gråtrost og kjøttmeis er knyttet til trær, busker, plen, løvlag og vegeterte overganger i ulik grad. Kråke og skjære bruker tak, plasser, park, avfallskilder og høye utkikkspunkter. Det betyr ikke at alle ti finnes samtidig. En god fuglelogg beskriver art, antall, sone, atferd, lyd og sikkerhetsgrad. Fugler skal ikke mates eller jages for å framprovosere observasjoner.\n\nKværnerbyen er derfor et egnet sted for å sammenligne naturprosess og naturrepresentasjon. Vannspeilet minner om Alna og gir et blågrønt rom, men er samtidig et designet anlegg. De bevarte industrisporene minner om vannkraften, mens fuglene viser hvordan ny vegetasjon og bystruktur raskt kan tas i bruk av dyr. Naturverdien ligger ikke bare i om en elv er åpen eller lukket, men i hvordan vann, planter, trær, bygg, ferdsel og forvaltning virker sammen.\n\nStedet skal også sammenlignes med Svartdalen oppstrøms og Alnas historiske utløp nedstrøms. I Svartdalen er elva synlig i ravine og gammel skog. I Kværnerbyen går vassdragshistorien gjennom industri, kulvert og et formgitt vannminne. Videre mot Bjørvika følger Alnas gamle løp et enda mer ombygget landskap. Denne sekvensen gjør det mulig å forstå at en byelv kan være synlig natur, skjult infrastruktur og kulturell form på ulike steder langs samme vassdrag.`,
    themes: [
      'Kværner Brug grunnlagt i 1853',
      'vannfallsrettigheter og turbinindustri',
      'industrinedleggelse i 1999',
      'reguleringsplan 2005 og innflytting 2007',
      'Lodalsparken ferdigstilt i 2009',
      'formgitt vannspeil og Kværnerdammen',
      'Alna i kulvert under området',
      'separat sirkulert parkvann i første fase',
      'skillet mellom naturprosess og landskapsarkitektur',
      'ti aktive fuglearter',
      'ingen aktive floraarter',
      'kartkobling mot faktisk feltfunn'
    ],
    species_inventory: {
      source_maps: mapFiles,
      flora: [],
      fauna: inventoryBirds,
      total_species: 10,
      rule: 'all_active_mapped_species_for_place'
    },
    water_system: {
      open_natural_river_confirmed: false,
      visible_feature: 'formgitt grunt vannspeil, kanal og dam',
      buried_system: 'Alna dokumentert i kulvert under området i prosjekteringskilder',
      caution: 'Ikke omtale parkvannet som åpen Alna uten nyere teknisk dokumentasjon.'
    },
    nearby_place_ids: ['svartdalen', 'alna_bryn', 'alna_utlop_bjorvika']
  },
  tags: ['byelv', 'kulvert', 'vannspeil', 'landskapsarkitektur', 'transformasjon', 'fugler', 'blagronn_struktur'],
  underbadge_ids: [
    'urbannatur', 'vann_og_vassdrag', 'dam_og_tjern', 'elvebredde', 'vannkvalitet',
    'kantvegetasjon', 'vannfugl', 'fugler', 'biologisk_mangfold', 'okosystem',
    'habitat', 'nisje', 'kretslop', 'spredningskorridor', 'gronn_korridor',
    'blagronn_struktur', 'naturrestaurering', 'skjotsel', 'miljotiltak',
    'artsregistrering', 'friluftsforvaltning', 'forurensning', 'klimatilpasning',
    'tursti', 'fugletitting', 'rekreasjon', 'bypark', 'nabolagsnatur', 'grontdrag'
  ],
  visual: { designCode: 'waterfront_miniature' },
  emne_ids: ['em_natur_arter_habitat_mangfold'],
  quiz_profile: {
    place_type: 'transformert industriområde med kulvert, formgitt vannspeil og fuglemosaikk',
    subtype: 'kvaernerbyen_alna',
    signature_features: [
      'Kværner Brug og vannkraftindustrien',
      'industrinedleggelse i 1999 og boligtransformasjon',
      'Lodalsparkens grunne vannspeil fra 2009',
      'Alna dokumentert i kulvert under området',
      'ti aktive fuglekoblinger og ingen florakoblinger'
    ],
    primary_angles: ['vannkraft_og_industri', 'kulvert_mot_vannspeil', 'landskapsarkitektur', 'urban_fuglemosaikk', 'kildekritikk'],
    question_families: ['stedsspesifikk_naturfunksjon', 'industri_og_transformasjon', 'vannsystem', 'artsidentifikasjon', 'observasjon', 'forvaltningsvalg'],
    avoid_angles: ['parkvann_lik_aapen_alna', 'artsfunn_som_garanti', 'fuglemating', 'vading_uten_tillatelse', 'udokumentert_vannkvalitet'],
    must_include: ['Kværner Brug', 'Alna i kulvert', 'formgitt vannspeil', 'ti aktive fuglearter', 'ingen aktive floraarter'],
    contrast_targets: ['svartdalen', 'alna_bryn', 'alna_utlop_bjorvika'],
    notes: 'Start med å skille kulvertert elv fra synlig parkvann. Artsobservasjon må knyttes til konkrete soner og kjennetegn.'
  },
  externalLinks: [
    { type: 'reference', label: 'Oslo byleksikon: Kværnerbyen', url: refs.kvaernerbyen, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Lodalsparken', url: refs.lodalsparken, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Kværner Brug', url: refs.kvaernerBrug, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Store norske leksikon: Kværnerbyen', url: refs.snlKvaernerbyen, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Kværnerbyen: Historien bak området', url: refs.projectHistory, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'NLA: Kværnerbyen vannløp', url: refs.waterDesign, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Store norske leksikon: Alna', url: refs.alna, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: aktivt naturkart', url: refs.routeMap, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: byfugler', url: refs.birdDataCity, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: våtmarks- og skogsfugler', url: refs.birdDataWetland, lang: 'nb', verifiedAt: '2026-07-20' }
  ],
  tasks_profile: {
    title: 'Skill elv, kulvert og vannspeil',
    summary: 'Fire oppgaver undersøker vannsystem, industrispor, fuglenisjer og kildekritikk i det transformerte byrommet.',
    tasks: [
      { id: 'kvaernerbyen_oppgave_vannsystem', title: 'Kartlegg tre vannlag', instruction: 'Marker historisk elvetrase, synlig parkvann og sannsynlig kulvertretning ut fra kilder og synlige elementer. Skill tydelig mellom observasjon og kildeopplysning.', why: 'Stedets viktigste læring er at synlig vann ikke automatisk er den åpne Alna.' },
      { id: 'kvaernerbyen_oppgave_design', title: 'Les vannspeilet som design', instruction: 'Noter kanal, dam, dybdeinntrykk, kantmaterialer, sirkulasjonsspor, oppholdssoner og vinterbruksspor uten å gå i vannet.', why: 'Vannrommet er landskapsarkitektur med bestemte funksjoner.' },
      { id: 'kvaernerbyen_oppgave_fuglesoner', title: 'Fordel fuglene på soner', instruction: 'Observer i fem minutter og fordel faktiske funn på vann, plen, trær, busker, tak eller plass. Registrer bare arter med synlige eller hørbare kjennetegn.', why: 'De ti fugleartene representerer forskjellige urbane nisjer.' },
      { id: 'kvaernerbyen_oppgave_industrispor', title: 'Finn vannkraftspråket', instruction: 'Se etter bevarte bygg, turbinhjul, gatenavn og borettslagsnavn som viser industrihistorien. Skill fysiske objekter fra navn og symboler.', why: 'Transformasjonen har bevart industriminnet i både materiale og språk.' }
    ]
  },
  training_profile: {
    title: 'Byromsøkt rundt Lodalsparken',
    summary: 'Tre øvelser bruker gang- og sykkelveier og robuste oppholdsflater uten å forstyrre fugler eller gå i vannsystemet.',
    safety: 'Bruk etablerte gang- og sykkelveier og vis hensyn til barn, syklister og beboere. Ikke gå ut i vannspeilet uten at stedet uttrykkelig er åpnet for slik bruk, og ikke anta at is er trygg. Ikke mat, jag eller fang fugler. Hold avstand til reir og hvilende fugler. Følg lokal skilting og eventuelle sesongregler.',
    exercises: [
      { id: 'kvaernerbyen_trening_vannrunde', title: 'Rolig vannspeilrunde', instruction: 'Gå 18 minutter langs etablerte forbindelser og bruk parkens endepunkter som vendepunkt.', duration_minutes: 18, intensity: 'rolig', why: 'Runden gjør forholdet mellom vannrom, bebyggelse og Svartdalen fysisk lesbart.' },
      { id: 'kvaernerbyen_trening_byintervall', title: 'Fem korte gangdrag', instruction: 'Velg en bred, oversiktlig strekning. Gå raskt i 45 sekunder og rolig i 75 sekunder, fem ganger.', duration_minutes: 10, intensity: 'moderat', why: 'Økten bruker robust underlag uten å belaste vannkanter eller fuglesoner.' },
      { id: 'kvaernerbyen_trening_nisjestopp', title: 'Fem nisjestopp', instruction: 'Stans ved vann, plen, busker, trær og bygg og observer hvert miljø i 45 sekunder.', duration_minutes: 5, intensity: 'lett', why: 'Stoppene viser hvordan små bysoner gir ulike fuglemuligheter.' }
    ]
  },
  civication_store: [
    { id: 'kvaernerbyen_vannsystemmodell', title: 'Modell av elv, kulvert og vannspeil', type: 'systemmodell', kind: 'physical_object', desc: 'Lagmodell som skiller historisk Alna, underjordisk kulvert og synlig parkvann.', placeSpecificReason: 'Skillet mellom de tre vannlagene er stedets sentrale naturfaglige spørsmål.', historicalFunction: 'Knytter vannkraftlandskapet til boligtransformasjonen.', physicalObject: true, placeSpecific: true, storePrice: 52, currency: 'PC', collection: 'kvaernerbyen_alna', collectable: true },
    { id: 'kvaernerbyen_transformasjonskart', title: 'Kværnerbyen før og nå', type: 'transformasjonskart', kind: 'physical_object', desc: 'Kart med fabrikkareal, bevarte bygg, nye kvartaler, Lodalsparken og vannsystem.', placeSpecificReason: 'Området gikk fra tungindustri til boligby på samme tomt.', historicalFunction: 'Dokumenterer nedleggelsen i 1999 og utbyggingen fra 2005.', physicalObject: true, placeSpecific: true, storePrice: 46, currency: 'PC', collection: 'kvaernerbyen_alna', collectable: true },
    { id: 'kvaernerbyen_fuglemosaikk', title: 'Ti fugler i bymosaikken', type: 'feltplate', kind: 'physical_object', desc: 'Sammenligningsplate for de ti aktive fugleartene og deres typiske observasjonssoner.', placeSpecificReason: 'Kværnerbyen har den største aktive artsunionen så langt i denne delen av ruten.', historicalFunction: 'Viser hvordan et nytt boliglandskap blir tatt i bruk av byfugler.', physicalObject: true, placeSpecific: true, storePrice: 38, currency: 'PC', collection: 'kvaernerbyen_alna', collectable: true },
    { id: 'kvaernerbyen_turbinminne', title: 'Peltonhjul og vannkraftminne', type: 'industrimodell', kind: 'physical_object', desc: 'Miniatyr av et turbinhjul med forklaring av Kværner Brugs vannkraftproduksjon.', placeSpecificReason: 'Turbinindustrien er områdets mest kjente industrielle arv.', historicalFunction: 'Knytter Alnas vannfall til Kværners internasjonale maskinproduksjon.', physicalObject: true, placeSpecific: true, storePrice: 44, currency: 'PC', collection: 'kvaernerbyen_alna', collectable: true }
  ],
  brands: [
    { id: 'kvaernerbyen_alna_actor', name: 'Kværnerbyen ved Alna', brand_kind: 'transformation_district', brand_type: 'primary_place' },
    { id: 'lodalsparken_actor', name: 'Lodalsparken', brand_kind: 'urban_park', brand_type: 'water_space_context' },
    { id: 'kvaernerdammen_actor', name: 'Kværnerdammen', brand_kind: 'designed_pond', brand_type: 'visible_water_feature' },
    { id: 'alnaelva_actor_kvaernerbyen', name: 'Alnaelva', brand_kind: 'urban_river', brand_type: 'buried_natural_system' },
    { id: 'kvaerner_brug_actor_kvaernerbyen', name: 'Kværner Brug', brand_kind: 'historic_industry', brand_type: 'industrial_origin' },
    { id: 'oluf_onsum_actor_kvaernerbyen', name: 'Oluf Onsum', brand_kind: 'industrial_founder', brand_type: 'historic_actor' },
    { id: 'obos_kvaernerbyen_actor', name: 'OBOS', brand_kind: 'housing_developer', brand_type: 'transformation_actor' },
    { id: 'kvaernerhallen_actor', name: 'Kværnerhallen', brand_kind: 'industrial_building', brand_type: 'preserved_structure' },
    { id: 'fyrhuset_actor_kvaernerbyen', name: 'Fyrhuset', brand_kind: 'industrial_building', brand_type: 'reused_structure' },
    { id: 'oslo_kommune_kvaernerbyen', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'planning_authority' },
    { id: 'bymiljoetaten_kvaernerbyen', name: 'Bymiljøetaten', brand_kind: 'municipal_agency', brand_type: 'park_and_public_space_actor' }
  ],
  for_na: {
    title: 'Fra vannkraftindustri til boligby med formgitt vannminne',
    before: 'Kværner Brug fylte Lodalen med støperi, verksteder, turbiner og opptil rundt 1500 arbeidsplasser. Alnas vannfall og vannfallsrettigheter var en del av industriens grunnlag, mens elva og terrenget ble sterkt teknisk bearbeidet.',
    now: 'Kværnerbyen er et boligområde med Lodalsparken, gangforbindelser, bevarte industribygg og et grunt vannspeil formet som et elveløp. Alna er dokumentert i kulvert under området i prosjektkilder, mens parkvannet er et eget designet system.',
    change: 'Vannets rolle har skiftet fra produksjonskraft til landskapselement, historiefortelling og habitatmulighet. Fuglene viser at transformert by også kan få naturfunksjoner, men det formgitte vannrommet skal ikke forveksles med full gjenåpning av elva.',
    look_for: [
      'Kværnerdammen og det grunne vannspeilet',
      'kanal og slyngende formgitt vannløp',
      'manglende synlig naturlig elveforbindelse gjennom parken',
      'Kværnerhallen og Fyrhuset',
      'Peltonhjul eller andre turbinreferanser',
      'gatenavn og borettslagsnavn fra industrien',
      'vann, plen, busker, trær, tak og plass som fuglesoner',
      'gang- og sykkelveier gjennom området',
      'forbindelsen østover mot Svartdalen',
      'forskjellen mellom fysisk industrispor og symbolsk navn'
    ],
    sources: Object.values(refs)
  }
};

const story = [{
  id: 'st_kvaernerbyen_alna_fra_turbiner_til_vannspeil',
  type: 'environmental',
  title: 'Fra turbiner til vannspeil',
  year: 2009,
  place_id: placeId,
  person_id: null,
  summary: 'Kværnerbyen omformet et tungindustriområde til boligby, men lot vannkraftspråket leve videre i bygg, navn og et formgitt vannrom over den kulverterte Alna.',
  story: `I Lodalen begynte Kværner Brug i 1853 med mølle, vannfallsrettigheter og jernstøperi. Etter hvert ble turbiner et av bedriftens viktigste produkter. Alnas vannkraft var både lokal energi og utgangspunkt for maskiner som ble sendt langt utenfor Oslo.\n\nDa industrien ble lagt ned i 1999, startet en ny omforming. Produksjonshallene forsvant i stor grad, men Kværnerhallen, Fyrhuset, gatenavn og turbinreferanser ble beholdt. De første beboerne flyttet inn i 2007.\n\nLodalsparken og vannspeilet ble ferdigstilt i 2009. Det synlige vannet følger en elvelignende form, men Alna var dokumentert i kulvert under området. Parkvannet ble etablert som et eget, grunt og kontrollert system. Det er derfor både et blågrønt byrom og et minne om elva—ikke automatisk en gjenåpnet naturlig elvestrekning.\n\nTi fuglearter er aktivt koblet til stedet. De bruker vann, plen, trær, busker, tak og gårdsrom på forskjellige måter. Slik viser Kværnerbyen hvordan et nytt boligområde kan få naturfunksjoner, samtidig som den skjulte elva minner om at bytransformasjon ikke alltid gjenoppretter naturprosessen fullt ut.`,
  sources: commonSources,
  tags: ['kvaernerbyen_alna', 'kvaerner_brug', 'lodalsparken', 'kulvert', 'vannspeil', 'transformasjon', 'fugler'],
  related_people: [],
  related_places: ['svartdalen', 'alna_bryn', 'alna_utlop_bjorvika'],
  score: { narrative: 5, historical: 5, source: 5, play_value: 5, originality: 5, total: 25 },
  arc: {
    start: 'Alnas vannfall ga grunnlag for mølle, støperi og turbinindustri.',
    middle: 'Industrien ble avviklet og tomta omformet til boligby med bevarte industrispor.',
    end: 'Et formgitt vannspeil og en urban fuglemosaikk gir naturfunksjon over en fortsatt kulvertert elvehistorie.'
  },
  next_scenes: [
    { place_id: 'alna_utlop_bjorvika', reason: 'Utløpsstedet viser neste lag av Alnas skjulte og rekonstruerte løp mot fjorden.' },
    { place_id: 'svartdalen', reason: 'Svartdalen gir kontrasten til en synlig elv i ravine og gammel skog.' }
  ]
}];

const fact = (id, label, desc, sources, confidence = 'high') => ({ id, label, desc, confidence, sources });
const chronology = [
  { id: 'chrono_01', year: 1853, period: 'Kværner Brug grunnlegges', desc: 'Oluf Onsum overtok gården Kværner med mølle og vannfallsrettigheter og etablerte jernstøperi.', confidence: 'high', sources: [source('Oslo byleksikon: Kværner Brug', refs.kvaernerBrug)] },
  { id: 'chrono_02', year: 1873, period: 'Første turbin produseres', desc: 'Kværner Brug produserte sin første vannkraftturbin.', confidence: 'high', sources: [source('Kværnerbyen: Historien bak området', refs.projectHistory)] },
  { id: 'chrono_03', year: 1999, period: 'Industrivirksomheten legges ned', desc: 'Kværner Brug avsluttet virksomheten på området.', confidence: 'high', sources: [source('Oslo byleksikon: Kværnerbyen', refs.kvaernerbyen)] },
  { id: 'chrono_04', year: 2005, period: 'Reguleringsplan vedtas', desc: 'Planen for boligtransformasjonen ble vedtatt av bystyret.', confidence: 'high', sources: [source('Store norske leksikon: Kværnerbyen', refs.snlKvaernerbyen)] },
  { id: 'chrono_05', year: 2007, period: 'Første innflytting', desc: 'De første beboerne flyttet inn og vannspeilet åpnet.', confidence: 'high', sources: [source('Kværnerbyen: Historien bak området', refs.projectHistory)] },
  { id: 'chrono_06', year: 2009, period: 'Lodalsparken ferdigstilles', desc: 'Parken og det formgitte vannsystemet sto ferdig.', confidence: 'high', sources: [source('Oslo byleksikon: Lodalsparken', refs.lodalsparken), source('NLA: Kværnerbyen vannløp', refs.waterDesign)] },
  { id: 'chrono_07', year: 2013, period: 'Alna fortsatt i kulvert', desc: 'Prosjektkilder dokumenterte at elvevannet ikke gikk i dagen gjennom parkvannet.', confidence: 'high', sources: [source('NLA: Kværnerbyen vannløp', refs.waterDesign)] },
  { id: 'chrono_08', year: 2020, period: 'Boligområdet ferdig utbygd', desc: 'Kværnerbyen var ferdig utbygd med over 1800 boliger.', confidence: 'high', sources: [source('Store norske leksikon: Kværnerbyen', refs.snlKvaernerbyen)] },
  { id: 'chrono_09', year: 2026, period: 'History Go-rundingen', desc: 'Stedet får full natur-runding med ti fuglearter og vannsystemkontroll.', confidence: 'high', sources: [source('History Go: aktivt naturkart', refs.routeMap)] }
];
const article = {
  place_id: placeId,
  visual: { designCode: 'article_nature_route_miniature' },
  version: 2,
  title: 'Kværnerbyen ved Alna',
  popupDesc: 'Transformert industriområde med kulvertert Alna, formgitt vannspeil, Lodalsparken og ti aktive fuglearter.',
  wikiText: [
    'Kværnerbyen ligger på det tidligere industriområdet til Kværner Brug, grunnlagt i 1853 med mølle, vannfallsrettigheter og jernstøperi.',
    'Etter nedleggelsen i 1999 ble området omformet til boligby; de første beboerne flyttet inn i 2007 og Lodalsparken sto ferdig i 2009.',
    'Parkens synlige vannspeil er et grunt, formgitt system. Prosjektkilder dokumenterer Alna i kulvert under området, og de to vannsystemene skal ikke blandes sammen.',
    'History Gos aktive naturkart knytter ti fuglearter til stedet og ingen floraarter. Faktiske funn må alltid bekreftes med kjennetegn.'
  ],
  summary: {
    one_liner: 'Kværnerbyen viser hvordan vannkraftindustri kan bli boligby med et designet vannminne og en ny fuglemosaikk.',
    themes: ['Kværner Brug', 'kulvert', 'vannspeil', 'Lodalsparken', 'transformasjon', 'urban fuglemosaikk'],
    tone: ['nøktern', 'kildekritisk', 'stedsspesifikk']
  },
  facts: [
    fact('fact_01', 'Industrigrunnlag', 'Kværner Brug ble grunnlagt i 1853 på et område med mølle og vannfallsrettigheter ved Alna.', [source('Oslo byleksikon: Kværner Brug', refs.kvaernerBrug)]),
    fact('fact_02', 'Turbinproduksjon', 'Den første vannkraftturbinen ble produsert i 1873.', [source('Kværnerbyen: Historien bak området', refs.projectHistory)]),
    fact('fact_03', 'Nedleggelse', 'Industrivirksomheten på området ble lagt ned i 1999.', [source('Oslo byleksikon: Kværnerbyen', refs.kvaernerbyen)]),
    fact('fact_04', 'Regulering', 'Reguleringsplanen for Kværnerbyen ble vedtatt i 2005.', [source('Store norske leksikon: Kværnerbyen', refs.snlKvaernerbyen)]),
    fact('fact_05', 'Innflytting', 'De første beboerne flyttet inn i 2007.', [source('Store norske leksikon: Kværnerbyen', refs.snlKvaernerbyen)]),
    fact('fact_06', 'Park', 'Lodalsparken ble ferdigstilt i 2009.', [source('Oslo byleksikon: Lodalsparken', refs.lodalsparken)]),
    fact('fact_07', 'Vannspeil', 'Parken har en kanal, et grunt vannspeil og et slyngende formgitt løp.', [source('NLA: Kværnerbyen vannløp', refs.waterDesign)]),
    fact('fact_08', 'Dybde', 'Vannspeilet er maksimalt omtrent 20 centimeter dypt.', [source('NLA: Kværnerbyen vannløp', refs.waterDesign)]),
    fact('fact_09', 'Kulvert', 'Prosjektkilder dokumenterer Alna i kulvert under Kværnerbyen.', [source('NLA: Kværnerbyen vannløp', refs.waterDesign)]),
    fact('fact_10', 'Separat vann', 'Parkvannet ble i første fase sirkulert fra en separat grunnvannsbrønn.', [source('NLA: Kværnerbyen vannløp', refs.waterDesign)]),
    fact('fact_11', 'Bevarte bygg', 'Kværnerhallen og flere eldre bygninger ble bevart i transformasjonen.', [source('Oslo byleksikon: Kværnerbyen', refs.kvaernerbyen)]),
    fact('fact_12', 'Aktiv artsunion', 'History Gos naturkart knytter ti fuglearter og ingen floraarter til place-id-en.', [source('History Go: aktivt naturkart', refs.routeMap)]),
    fact('fact_13', 'Vannfugl', 'Stokkand er den aktive arten som tydeligst er knyttet til vannflaten.', [source('History Go: byfugler', refs.birdDataCity)]),
    fact('fact_14', 'Bymosaikk', 'De øvrige aktive fuglene bruker trær, busker, plen, tak, gårdsrom og åpne byflater i ulik grad.', [source('History Go: byfugler', refs.birdDataCity), source('History Go: våtmarks- og skogsfugler', refs.birdDataWetland)]),
    fact('fact_15', 'Kildekritisk regel', 'Synlig parkvann er ikke dokumentasjon på at Alna går åpen gjennom parken.', [source('NLA: Kværnerbyen vannløp', refs.waterDesign), source('Oslo byleksikon: Lodalsparken', refs.lodalsparken)])
  ],
  chronology,
  sections: [
    { id: 'industri', title: 'Vannkraft og industri', text: 'Mølle, vannfallsrettigheter, støperi og turbinproduksjon gjorde Alna til en del av Kværners produksjonssystem.' },
    { id: 'transformasjon', title: 'Fra fabrikk til boligby', text: 'Etter 1999 ble produksjonsområdet revet, bevart og omformet gjennom nye kvartaler, parker og industrireferanser.' },
    { id: 'vannsystem', title: 'Kulvert og formgitt vannspeil', text: 'Den kulverterte elva og det synlige parkvannet er to forskjellige systemer. Rundingen skal holde dem fra hverandre.' },
    { id: 'fugler', title: 'Ti fugler i en urban mosaikk', text: 'Vann, parkvegetasjon, tak og byrom gir flere nisjer, men hver art må dokumenteres gjennom faktiske kjennetegn.' }
  ],
  related_places: ['svartdalen', 'alna_bryn', 'alna_utlop_bjorvika'],
  sources: commonSources
};

const qSources = {
  industry: [refs.kvaernerBrug, refs.projectHistory],
  district: [refs.kvaernerbyen, refs.snlKvaernerbyen],
  water: [refs.lodalsparken, refs.waterDesign],
  birds: [refs.routeMap, refs.birdDataCity, refs.birdDataWetland],
  mixed: [refs.kvaernerbyen, refs.waterDesign, refs.routeMap]
};
const q = (question, answer, distractors, knowledge, sourceKey, layer, difficulty = 1) => ({ question, answer, distractors, knowledge, source: qSources[sourceKey], layer, difficulty });
const setSpecs = [
  { mode: 'place_intro', layer: 'intro', questions: [
    q('Hva lå på området før boligbyen?', 'Kværner Brug', ['En flyplass', 'Et universitet'], 'Kværnerbyen er bygget på det tidligere industriområdet.', 'district', 'intro'),
    q('Hvilken naturressurs var viktig for industrien?', 'Alnas vannfall og vannkraft', ['Saltvann', 'Vind alene'], 'Mølle og vannfallsrettigheter inngikk i grunnlaget.', 'industry', 'intro'),
    q('Hva ligger sentralt i dagens område?', 'Lodalsparken og et formgitt vannspeil', ['Urørt fjellskog', 'En naturlig fjordarm'], 'Parken er det viktigste blågrønne byrommet.', 'water', 'intro'),
    q('Hvor går Alna ifølge prosjektkildene?', 'I kulvert under området', ['Åpent i hele vannspeilet', 'Gjennom boligblokkene'], 'Elva og parkvannet er separate systemer.', 'water', 'intro'),
    q('Hvor mange aktive arter har stedet?', 'Ti fuglearter', ['Én planteart', 'Ingen arter'], 'Artsunionen består bare av fugler.', 'birds', 'intro'),
    q('Hva bør observeres først?', 'Vannspeil, park, bygg, trær og fuglesoner', ['Bare butikklogoer', 'Kun biltrafikk'], 'Disse sonene viser transformasjonen og habitatmosaikken.', 'mixed', 'intro'),
    q('Hva er den viktigste kildekritiske regelen?', 'Synlig parkvann er ikke automatisk åpen Alna', ['Alt vann er samme vassdrag', 'Kulverter kan alltid sees'], 'Vannsystemene må skilles.', 'water', 'intro')
  ]},
  { mode: 'industry_transform', layer: 'history', questions: [
    q('Når ble Kværner Brug grunnlagt?', '1853', ['1999', '2009'], 'Oluf Onsum startet virksomheten i 1853.', 'industry', 'history'),
    q('Hva produserte Kværner fra 1873?', 'Vannkraftturbiner', ['Passasjerfly', 'Saltverk'], 'Turbinproduksjonen satte bedriften på kartet.', 'industry', 'history'),
    q('Når ble industrivirksomheten lagt ned?', '1999', ['1853', '2020'], 'Nedleggelsen åpnet for bytransformasjon.', 'district', 'history'),
    q('Når ble reguleringsplanen vedtatt?', '2005', ['1948', '2015'], 'Planen ble vedtatt før rive- og byggearbeidet.', 'district', 'history'),
    q('Når flyttet de første beboerne inn?', '2007', ['1873', '1999'], 'Innflyttingen startet i 2007.', 'district', 'history'),
    q('Hva ble bevart fra industrien?', 'Blant annet Kværnerhallen og Fyrhuset', ['Alle produksjonshaller', 'Ingen bygninger'], 'Transformasjonen kombinerte riving og gjenbruk.', 'district', 'history'),
    q('Hva viser navn som Pelton og Francis?', 'Industri- og turbinhistorien', ['Lokale treslag', 'Fuglearter'], 'Navnene fungerer som kulturelle industrispor.', 'industry', 'history')
  ]},
  { mode: 'water_system', layer: 'water', questions: [
    q('Når ble Lodalsparken ferdigstilt?', '2009', ['1853', '2020'], 'Parken og vannsystemet ble ferdigstilt i 2009.', 'water', 'water'),
    q('Hva består det synlige vannsystemet av?', 'Kanal, vannspeil og slyngende løp', ['Naturlig foss og tidevann', 'Kun en drikkevannsledning'], 'Systemet er landskapsarkitektur.', 'water', 'water'),
    q('Hvor dypt er vannspeilet maksimalt?', 'Omtrent 20 centimeter', ['To meter', 'Ti meter'], 'Den grunne dybden er en designpremiss.', 'water', 'water'),
    q('Hvor kom vannet fra i første fase?', 'En separat grunnvannsbrønn', ['Direkte fra fjorden', 'Fra Akerselva'], 'Parkvannet ble sirkulert uavhengig av Alna.', 'water', 'water'),
    q('Hva betyr det at systemet var forberedt for Alnavann?', 'At framtidig bruk var teknisk mulig, ikke bevist gjennomført', ['At Alna alltid gikk der', 'At kulverten ikke fantes'], 'Planlagt kapasitet er ikke samme som faktisk drift.', 'water', 'water', 2),
    q('Hva er riktig feltobservasjon?', 'Beskriv synlige kanter og strøm uten å gjette vannkilden', ['Kall alt Alna', 'Mål vannkvalitet med synet'], 'Vannkilde og kvalitet krever dokumentasjon.', 'water', 'water'),
    q('Hva er stedet et eksempel på?', 'Et formgitt blågrønt byrom over en skjult elvehistorie', ['Urørt naturlig elvedelta', 'Saltvannsstrand'], 'Design og vassdragshistorie møtes.', 'mixed', 'water', 2)
  ]},
  { mode: 'birds', layer: 'fauna', questions: [
    q('Hvilken aktiv fugl er tydeligst knyttet til vann?', 'Stokkand', ['Bokfink', 'Kjøttmeis'], 'Stokkand bruker dammer og parkvann.', 'birds', 'fauna'),
    q('Hvilken fugl vipper ofte halen på åpne flater?', 'Linerle', ['Munk', 'Kråke'], 'Linerlens haleatferd er et godt kjennetegn.', 'birds', 'fauna'),
    q('Hvilken art har oransjerødt bryst?', 'Rødstrupe', ['Skjære', 'Gråtrost'], 'Rødstrupens brystfarge er tydelig.', 'birds', 'fauna'),
    q('Hvilken art er svart-hvit med lang hale?', 'Skjære', ['Svarttrost', 'Bokfink'], 'Skjæra bruker ofte trær, tak og åpne byrom.', 'birds', 'fauna'),
    q('Hvilken art har grå kropp og svart hode og vinger?', 'Kråke', ['Kjøttmeis', 'Munk'], 'Kråkas kontrastdrakt skiller den.', 'birds', 'fauna'),
    q('Hvilken art har svart hode med hvite kinn og gul underside?', 'Kjøttmeis', ['Gråtrost', 'Stokkand'], 'Kjøttmeisas drakt er lett å kjenne igjen.', 'birds', 'fauna'),
    q('Hva må til før en fugl registreres?', 'Synlig eller hørbart kjennetegn', ['Kartikonet alene', 'At den er vanlig i Oslo'], 'Kartkobling er ikke et feltfunn.', 'birds', 'fauna')
  ]},
  { mode: 'bird_mosaic', layer: 'ecology', questions: [
    q('Hva betyr urban habitatmosaikk?', 'Flere små soner med ulike ressurser', ['Én ensartet asfaltflate', 'Bare naturlig skog'], 'Vann, plen, busker, trær og bygg gir forskjellige nisjer.', 'birds', 'ecology'),
    q('Hvor bør stokkand observeres?', 'Ved vannspeil og kanter', ['Kun på tak', 'I tørre kjellere'], 'Vannflaten er den mest relevante sonen.', 'birds', 'ecology'),
    q('Hvor kan kråke og skjære bruke området?', 'Tak, plass, plen og høye utkikkspunkter', ['Bare under vann', 'Kun i tett barskog'], 'Kråkefugler er fleksible byarter.', 'birds', 'ecology'),
    q('Hvor kan munk, svarttrost og rødstrupe søkes?', 'I busker, trær og vegeterte kanter', ['På åpent vann alene', 'Kun på betongtak'], 'Vegetasjon gir skjul og næring.', 'birds', 'ecology'),
    q('Hva gjør plen og åpne flater?', 'Gir søkeområder for flere arter', ['Garanterer alle ti arter', 'Fjerner all fuglebruk'], 'Åpne soner er én del av mosaikken.', 'birds', 'ecology'),
    q('Hvorfor skal fugler ikke mates?', 'Mating endrer atferd og kan belaste miljøet', ['Fordi alle er planter', 'Fordi vannspeilet er salt'], 'Observasjon bør ikke framprovoseres.', 'birds', 'ecology'),
    q('Hva er best fuglelogg?', 'Art, antall, sone, atferd og sikkerhet', ['Bare et artsnavn', 'Et foto uten sted'], 'Kontekst gjør funnet etterprøvbart.', 'birds', 'ecology', 2)
  ]},
  { mode: 'synthesis', layer: 'synthesis', questions: [
    q('Hva er den sterkeste samlebeskrivelsen?', 'Industristed omformet til boligby med designet vannrom og fuglemosaikk', ['Urørt elvedal', 'Naturlig fjord'], 'Kværnerbyen kombinerer historiske og nye systemer.', 'mixed', 'synthesis', 2),
    q('Hva skiller stedet fra Svartdalen?', 'Kværnerbyen har kulvert og formgitt vann, ikke synlig ravineelv', ['Kværnerbyen har ingen vannhistorie', 'Svartdalen er boligkvartaler'], 'Kontrasten viser ulike former for byelv.', 'mixed', 'synthesis'),
    q('Hva skiller vannspeil fra naturlig elv?', 'Det er designet med styrt dybde, kanter og sirkulasjon', ['Det har alltid tidevann', 'Det kan ikke brukes av fugler'], 'Form og drift er teknisk kontrollert.', 'water', 'synthesis'),
    q('Hva viser industrinavnene?', 'At historien kan bevares symbolsk etter fysisk riving', ['At fabrikkene fortsatt produserer', 'At navn er naturarter'], 'Kulturminner finnes også i språk og bydesign.', 'industry', 'synthesis'),
    q('Hva viser de ti fuglene?', 'Ny bystruktur kan gi flere små habitatnisjer', ['Alle arter trenger urørt skog', 'Parkvann har ingen naturfunksjon'], 'Transformerte områder kan tas i bruk av dyr.', 'birds', 'synthesis'),
    q('Hva bør en god observasjon ende med?', 'Etterprøvbar beskrivelse og tydelig usikkerhet', ['Sikker påstand uten kilde', 'Mating for bedre bilde'], 'Kildekritikk og feltdata må holdes sammen.', 'mixed', 'synthesis'),
    q('Hvorfor er 2009 viktig?', 'Lodalsparken og vannsystemet ble ferdigstilt', ['Kværner Brug ble grunnlagt', 'Industrien ble lagt ned'], 'Året markerer det nye blågrønne byrommet.', 'water', 'synthesis')
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
    hold_back: ['parkvann skal ikke kalles åpen Alna', 'ingen fuglemating', 'ingen udokumentert vannkvalitet eller isstatus']
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
        core_concepts: ['arter', 'habitat', 'vannsystem', 'transformasjon', 'forvaltning']
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
if (!routeRow) throw new Error('Mangler Kværnerbyen i rutemanifestet');
routeRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, placePath))).digest('hex');
writeJson(routeManifestPath, routeManifest);

const placesIndex = readJson('data/places/places_index.json');
const globalRow = placesIndex.find(x => x.id === placeId);
if (!globalRow) throw new Error('Mangler Kværnerbyen i global plassindeks');
globalRow.desc = place.desc;
writeJson('data/places/places_index.json', placesIndex);

const report = `# Kværnerbyen ved Alna – natur-rundinger batch 1\n\n## Omfang\n\n- Fyller alle ni natur-rundinger for \`${placeId}\`.\n- Bevarer ID, koordinat, radius, kategori, routeId og koordinatstatus.\n- Registrerer fortelling, leksikon og 6 × 7 quizspørsmål i manifestene.\n\n## Aktiv artsunion\n\n- Flora: ingen aktive koblinger\n- Fauna: rødstrupe, munk, svarttrost, bokfink, gråtrost, kjøttmeis, kråke, linerle, skjære og stokkand\n- Totalt: 10 arter\n- Regel: Alle aktive koblinger fra fem naturkart. Kartkobling er ikke garanti for feltfunn.\n\n## Stedlig retning\n\nKværnerbyen behandles som transformert industriområde der den kulverterte Alna må skilles fra Lodalsparkens grunne, formgitte vannspeil. Fugleunionen leses som en mosaikk av vann, parkvegetasjon, tak og byrom.\n\n## Kontroll\n\nMaterialiseringen skal bestå målrettet test, eksisterende Alna-/Oslo-naturtester, \`scripts/check-places.sh\`, indeks- og manifestsynk samt \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report);

const test = `const assert = require('assert');\nconst crypto = require('crypto');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));\nconst expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];\nconst runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst profileMatch = runtime.match(/natur:\\s*\\[([^\\]]+)\\]/);\nassert(profileMatch, 'runtime mangler naturprofil');\nassert.deepStrictEqual(JSON.parse(\`[\${profileMatch[1]}]\`), expectedRounds);\nconst placePath='${placePath}', quizPath='${quizPath}', storyPath='${storyPath}', articlePath='${articlePath}';\nconst place=readJson(placePath), quiz=readJson(quizPath), story=readJson(storyPath)[0], article=readJson(articlePath);\nconst index=readJson('data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json').find(x=>x.id===place.id);\nconst routeManifest=readJson('${routeManifestPath}'); const manifestRow=routeManifest.places.find(x=>x.id===place.id);\nconst quizManifest=readJson('data/quiz/manifest.json'); const storyManifest=readJson('data/stories/stories_manifest.json'); const leksikonManifest=readJson('data/leksikon/manifest.json');\nconst validBadges=new Set(readJson('data/badges/natur.json').sub);\nassert.strictEqual(place.id,'${placeId}'); assert.strictEqual(place.name,'Kværnerbyen ved Alna'); assert.strictEqual(place.category,'natur');\nassert.deepStrictEqual([place.lat,place.lon,place.r,place.year??null],[59.90355,10.78787,130,null]);\nassert.strictEqual(place.routeId,'alnaelva_grontdrag'); assert.strictEqual(place.coordStatus,'verified'); assert.strictEqual(place.coordPrecisionM,90);\nassert(index&&manifestRow); assert.deepStrictEqual([index.lat,index.lon,index.r,index.year??null],[place.lat,place.lon,place.r,place.year??null]);\nconst hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,placePath))).digest('hex'); assert.strictEqual(manifestRow.sha256,hash);\nfor(const key of ['rounds','rundinger','routes','works','people','play_profile','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place,key),\`forbudt felt \${key}\`);\nconst roundContent={tasks:place.tasks_profile,nature:place.nature_profile,badges:place.underbadge_ids,training:place.training_profile,civication:place.civication_store,brands:place.brands,før_nå:place.for_na,fortellinger:[story],leksikon:[article]};\nassert.deepStrictEqual(Object.keys(roundContent),expectedRounds); for(const [id,value] of Object.entries(roundContent)){const filled=Array.isArray(value)?value.length>0:Boolean(value&&typeof value==='object');assert(filled,\`mangler \${id}\`);}\nassert(place.externalLinks.length>=9&&place.externalLinks.every(x=>x.type==='repository'||/^https:\\/\\//.test(x.url)));\nassert(place.underbadge_ids.length>=25&&place.underbadge_ids.every(x=>validBadges.has(x))); assert.strictEqual(place.tasks_profile.tasks.length,4); assert.strictEqual(place.training_profile.exercises.length,3);\nassert(/ikke.*mat|ikke.*jag/i.test(place.training_profile.safety)); assert(place.civication_store.length===4&&place.civication_store.every(x=>x.physicalObject&&x.placeSpecific)); assert(place.brands.length>=10);\nassert(place.nature_profile.summary.length>=3000); assert.strictEqual(place.nature_profile.water_system.open_natural_river_confirmed,false); assert(/ikke omtale/i.test(place.nature_profile.water_system.caution));\nassert.deepStrictEqual(place.nature_profile.nearby_place_ids,['svartdalen','alna_bryn','alna_utlop_bjorvika']);\nconst mapFiles=${JSON.stringify(mapFiles)}; const merged={flora:[],fauna:[]}; for(const file of mapFiles){const raw=readJson(file);const entry=(raw.places||raw).${placeId};if(!entry)continue;merged.flora.push(...(entry.flora||[]));merged.fauna.push(...(entry.fauna||[]));}\nmerged.flora=[...new Set(merged.flora)].sort(); merged.fauna=[...new Set(merged.fauna)].sort(); assert.deepStrictEqual(merged.flora,[]); assert.deepStrictEqual(merged.fauna,${JSON.stringify(expectedFauna)});\nconst inventory=place.nature_profile.species_inventory; assert.strictEqual(inventory.total_species,10); assert.deepStrictEqual(inventory.flora,[]); assert.deepStrictEqual(inventory.fauna.map(x=>x.id).sort(),${JSON.stringify(expectedFauna)});\nassert.strictEqual(quiz.sets.length,6); assert(quiz.sets.every((s,i)=>s.order===i+1&&s.questions.length===7)); assert(quiz.sets.flatMap(s=>s.questions).every(q=>q.categoryId==='natur'&&q.placeId===place.id&&Array.isArray(q.source)&&q.source.length&&q.claim_basis==='documented'&&q.options[q.answerIndex]===q.answer&&q.related_emners.includes('em_natur_arter_habitat_mangfold')));\nassert.deepStrictEqual(quizManifest.sets.filter(x=>x.targetId===place.id),[{targetId:place.id,file:quizPath}]); assert(story&&story.place_id===place.id&&story.sources.length>=9); assert(storyManifest.files.some(x=>x.path===storyPath&&x.entity_id===place.id&&x.category==='natur'));\nassert(article&&article.place_id===place.id&&article.version===2&&article.title===place.name); assert(article.sources.length>=9&&article.facts.length>=15&&article.chronology.length>=9); assert(leksikonManifest.files.includes(articlePath));\nconst all=JSON.stringify({place,quiz,story,article}); for(const token of ['Kværner Brug','1853','1999','Lodalsparken','2009','kulvert','vannspeil','grunnvannsbrønn','20 centimeter','rødstrupe','munk','svarttrost','bokfink','gråtrost','kjøttmeis','kråke','linerle','skjære','stokkand']) assert(all.toLowerCase().includes(token.toLowerCase()),\`mangler \${token}\`);\nassert(/ikke.*åpen Alna|ikke.*aapen Alna|ikke.*automatisk.*Alna/i.test(all)); assert(/ikke en garanti|ikke.*garanti/i.test(all)); console.log('Kvaernerbyen Alna nature rounds batch 1 OK');\n`;
fs.mkdirSync(path.dirname(path.join(root, testPath)), { recursive: true }); fs.writeFileSync(path.join(root, testPath), test);

run(process.execPath, [testPath]);
run(process.execPath, ['tests/oslo-nature-rounds-batch5-alna.test.js']);
run(process.execPath, ['tests/oslo-nature-rounds-batch4.test.js']);
run('bash', ['scripts/check-places.sh']);
run('git', ['diff', '--check']);
console.log('Kvaernerbyen Alna materialized and validated');
