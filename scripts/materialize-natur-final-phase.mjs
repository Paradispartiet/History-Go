#!/usr/bin/env node
import fs from 'node:fs';
import {
  P,
  readJson,
  writeJson,
  assert,
  buildMethod,
  buildEmne,
  buildCategory,
  buildMapping,
  chapterDocument,
  updateDomainRecord
} from './materialize-natur-biology-phase-1.mjs';

const TODAY = '2026-07-29';
const BADGE = 'data/fag/natur/merke_natur (1).html';

const MICRO_THINKERS = [
  { id: 'anton_de_bary', name: 'Anton de Bary', role: 'mykologi, symbiose og plantpatologi', tier: 'core' },
  { id: 'carl_woese', name: 'Carl Woese', role: 'mikrobiell evolusjon og de tre domenene', tier: 'core' },
  { id: 'lynn_margulis', name: 'Lynn Margulis', role: 'symbiogenese og mikrobielle partnerskap', tier: 'core' },
  { id: 'selman_waksman', name: 'Selman Waksman', role: 'jordmikrobiologi og antibiotika', tier: 'core' },
  { id: 'beatrix_potter', name: 'Beatrix Potter', role: 'mykologiske observasjoner og sporestrukturer', tier: 'supporting' }
];

const GEO_THINKERS = [
  { id: 'charles_lyell', name: 'Charles Lyell', role: 'geologiske prosesser og dyp tid', tier: 'core' },
  { id: 'alfred_wegener', name: 'Alfred Wegener', role: 'kontinentaldrift', tier: 'core' },
  { id: 'arthur_holmes', name: 'Arthur Holmes', role: 'radiometrisk datering og geodynamikk', tier: 'core' },
  { id: 'marie_tharp', name: 'Marie Tharp', role: 'havbunnskartlegging og midthavsrygger', tier: 'core' },
  { id: 'inge_lehmann', name: 'Inge Lehmann', role: 'jordas indre struktur og seismologi', tier: 'core' }
];

const MICRO_DOMAIN = {
  id: 'sopp_lav_mikroorganismer',
  label: 'Sopp, lav og mikroorganismer',
  shortLabel: 'Sopp og mikroorganismer',
  definition: 'Domenet undersøker sopp, lav, bakterier, arkéer og andre mikroskopiske organismer gjennom cellestruktur, metabolisme, formering, symbiose, nedbrytning, sykdom, artsbestemmelse og økologisk funksjon.',
  focus: ['soppbiologi', 'lavsymbiose', 'mikrobiell struktur', 'mikrobiell metabolisme', 'nedbrytning', 'mikrobiell økologi'],
  questionRole: 'Start i dokumentert organisme, koloni eller prøve; skill deretter morfologi, metabolisme, samliv, nedbrytning og sykdomsmekanisme med metodekontroll.',
  tagline: 'Hvordan sopp og mikroorganismer bygges, lever, formerer seg og driver stoffomsetning og symbioser i naturen.',
  thinkers: MICRO_THINKERS,
  comparisonPairs: [['anton_de_bary', 'lynn_margulis'], ['carl_woese', 'selman_waksman']],
  methods: [
    'met_natur_mikroskopi_mikrobiell_morfologi',
    'met_natur_kultur_og_kolonikarakterisering',
    'met_natur_mikrobiell_aktivitet_og_nedbrytning'
  ],
  emners: [
    {
      id: 'em_natur_sopp_hyfer_mycel_fruktlegemer',
      title: 'Soppceller, hyfer, mycel og fruktlegemer',
      short: 'Soppens bygning',
      level: 1,
      definition: 'Emnet undersøker hvordan kitinholdige cellevegger, hyfer, mycel og sporedannende strukturer bygger opp sopper, og hvordan synlige fruktlegemer bare utgjør en del av organismen.',
      why: 'Mange arts- og funksjonspåstander blir feil når fruktlegemet forveksles med hele soppen; mycel, substrat og mikroskopiske kjennetegn må inngå i dokumentasjonen.',
      concepts: ['soppcelle', 'kitin', 'hyfe', 'mycel', 'fruktlegeme', 'spore', 'septum', 'substrat'],
      questions: [
        'Hvilke celle-, hyfe- eller fruktlegemekjennetegn er faktisk observert og dokumentert?',
        'Hvordan henger mycel, substrat og sporedannende struktur sammen i organismens livssyklus?',
        'Hvilke mikroskopiske eller molekylære data trengs før bestemmelsen kan gjøres sikrere?'
      ],
      conflicts: ['fruktlegeme vs hele soppen', 'makroskopisk likhet vs mikroskopisk diagnose', 'synlig forekomst vs underjordisk mycel'],
      distinctions: ['fruktlegeme vs mycel', 'spore vs frø', 'soppcelle vs plantecelle'],
      hooks: ['sopp_hyfer_mycel', 'sopp_sporer_formering', 'sopp_bestemmelse'],
      methods: ['met_natur_mikroskopi_mikrobiell_morfologi', 'met_natur_kultur_og_kolonikarakterisering'],
      places: ['skogbunn', 'død ved', 'soppsamling', 'laboratorium', 'kompost']
    },
    {
      id: 'em_natur_sopp_formering_livssykluser',
      title: 'Soppers formering og livssykluser',
      short: 'Sopplivssykluser',
      level: 2,
      definition: 'Emnet sammenligner ukjønnet og kjønnet formering hos sopp, sporedannelse, plasmogami, karyogami og variasjon mellom livssykluser uten å anta at alle sopper følger samme mønster.',
      why: 'Sporer kan dannes på flere måter og ha ulike roller; presis livssyklusforståelse er nødvendig for artsbestemmelse, spredningsanalyse og tolkning av genetisk variasjon.',
      concepts: ['ukjønnet formering', 'kjønnet formering', 'plasmogami', 'karyogami', 'meiose', 'konidie', 'spore', 'dikaryon'],
      questions: [
        'Hvilken type spore eller formeringsstruktur er dokumentert, og ved hvilket livsstadium?',
        'Hvilke cellefusjoner og kjernestadier inngår i den aktuelle soppgruppens livssyklus?',
        'Hvordan kan morfologi, dyrking eller genetiske data skille mellom alternative livssyklusfortolkninger?'
      ],
      conflicts: ['spredningsenhet vs seksuell spore', 'ukjønnet klonvekst vs genetisk rekombinasjon', 'livssyklusmodell vs observert stadium'],
      distinctions: ['plasmogami vs karyogami', 'mitotisk spore vs meiotisk spore', 'koloniutbredelse vs reproduksjon'],
      hooks: ['sopp_sporer_formering', 'sopp_hyfer_mycel', 'mikrobiell_variabilitet'],
      methods: ['met_natur_mikroskopi_mikrobiell_morfologi', 'met_natur_kultur_og_kolonikarakterisering'],
      places: ['laboratorium', 'soppsamling', 'skogbunn', 'død ved']
    },
    {
      id: 'em_natur_lav_symbiose_og_indikasjon',
      title: 'Lav som symbiose og miljøindikator',
      short: 'Lavsymbiose',
      level: 2,
      definition: 'Emnet undersøker lav som et stabilt samliv mellom en soppartner og fotosyntetiske alger eller cyanobakterier, med vekt på thallus, formering, substratkrav og miljøfølsomhet.',
      why: 'Lav er ikke én enkel organismegruppe med én fysiologi; partnerskapet og langsom respons gjør at artsdata kan brukes som miljøsignal bare når substrat, klima og påvirkning kontrolleres.',
      concepts: ['lav', 'mykobiont', 'fotobiont', 'thallus', 'symbiose', 'cyanobakterie', 'substrat', 'bioindikator'],
      questions: [
        'Hvilke partnere og thallustrekk er dokumentert i laven, og hvor sikkert er artsnivået?',
        'Hvordan bidrar sopp- og fotobiontpartneren til vannopptak, fotosyntese og struktur?',
        'Kan forekomst eller fravær tolkes som miljøindikasjon når substrat, lys, fukt og registreringsinnsats er kontrollert?'
      ],
      conflicts: ['partnerskap vs enkeltorganisme', 'miljøindikasjon vs substratforskjell', 'fravær vs manglende registrering'],
      distinctions: ['lav vs mose', 'mykobiont vs fotobiont', 'bioindikator vs direkte forurensningsmåling'],
      hooks: ['lav_symbiose', 'lav_miljoindikasjon', 'mikrobiell_symbiose'],
      methods: ['met_natur_mikroskopi_mikrobiell_morfologi', 'met_natur_mikrobiell_aktivitet_og_nedbrytning'],
      places: ['gammel skog', 'bergvegg', 'trestamme', 'kystberg', 'naturreservat']
    },
    {
      id: 'em_natur_bakterier_arkeer_cellestruktur',
      title: 'Bakterier, arkéer og prokaryot cellestruktur',
      short: 'Prokaryote celler',
      level: 1,
      definition: 'Emnet skiller bakterier og arkéer fra eukaryote celler gjennom genomorganisering, ribosomer, membraner, cellevegger og formering, samtidig som variasjonen innen de to prokaryote domenene beholdes synlig.',
      why: 'Begrepet prokaryot beskriver en celletype og omfatter to evolusjonært dype domener; å behandle bakterier og arkéer som én ensartet gruppe skjuler viktige strukturelle og metabolske forskjeller.',
      concepts: ['bakterie', 'arké', 'prokaryot', 'nukleoid', 'plasmid', 'ribosom', 'cellevegg', 'binær fisjon'],
      questions: [
        'Hvilke celleegenskaper støtter at prøven er prokaryot, og hvilke egenskaper kan skille bakterier fra arkéer?',
        'Hvordan er genetisk materiale, membran og cellevegg organisert i den dokumenterte gruppen?',
        'Hvilke dyrkings-, mikroskopi- eller sekvensdata trengs for å gå fra celletype til sikkerere taksonomisk identifikasjon?'
      ],
      conflicts: ['prokaryot celletype vs taksonomisk gruppe', 'celleform vs artsidentitet', 'dyrkbar fraksjon vs totalt mikrobielt samfunn'],
      distinctions: ['bakterie vs arké', 'nukleoid vs cellekjerne', 'binær fisjon vs mitose'],
      hooks: ['prokaryot_cellestruktur', 'mikrobiell_variabilitet', 'mikrobiell_identifikasjon'],
      methods: ['met_natur_mikroskopi_mikrobiell_morfologi', 'met_natur_kultur_og_kolonikarakterisering'],
      places: ['jordprøve', 'ferskvann', 'kompost', 'laboratorium', 'varm_kilde']
    },
    {
      id: 'em_natur_mikrobiell_metabolisme_og_kretslop',
      title: 'Mikrobiell metabolisme og biogeokjemiske kretsløp',
      short: 'Mikrobiell metabolisme',
      level: 2,
      definition: 'Emnet undersøker hvordan mikroorganismer henter energi og karbon gjennom aerob og anaerob respirasjon, fermentering, foto- og kjemolitotrofi og dermed påvirker karbon-, nitrogen- og svovelkretsløp.',
      why: 'Mikrober driver kjemiske omsetninger som ikke kan utledes fra artsnavn alene; substrat, elektronakseptor, miljøforhold og målte produkter må dokumenteres for å forklare prosessen.',
      concepts: ['metabolisme', 'aerob respirasjon', 'anaerob respirasjon', 'fermentering', 'fototrofi', 'kjemolitotrofi', 'nitrogenfiksering', 'denitrifikasjon'],
      questions: [
        'Hvilket energi- og karbonstoffskifte er mulig under de målte miljøforholdene?',
        'Hvilke substrater, elektronakseptorer og produkter dokumenterer den foreslåtte mikrobielle prosessen?',
        'Hvordan kan aktivitet skilles fra bare tilstedeværelse av gener, celler eller taksonomiske markører?'
      ],
      conflicts: ['tilstedeværelse vs metabolsk aktivitet', 'aerob vs anaerob prosess', 'artsidentitet vs funksjonelt gen'],
      distinctions: ['respirasjon vs fermentering', 'autotrofi vs heterotrofi', 'genforekomst vs uttrykt funksjon'],
      hooks: ['mikrobiell_metabolisme', 'mikrobiell_kretslop', 'mikrobiell_aktivitet'],
      methods: ['met_natur_mikrobiell_aktivitet_og_nedbrytning', 'met_natur_kultur_og_kolonikarakterisering'],
      places: ['jordprøve', 'våtmark', 'sediment', 'kompost', 'ferskvann']
    },
    {
      id: 'em_natur_mikrobiell_okologi_nedbrytning_sykdom',
      title: 'Mikrobiell økologi, nedbrytning, symbiose og sykdom',
      short: 'Mikrobiell økologi',
      level: 3,
      definition: 'Emnet kobler mikrobielle samfunn til nedbrytning, mutualisme, konkurranse og patogenitet og skiller økologisk funksjon fra sykdom ved å kreve dokumentert vert, miljø, aktivitet og årsakskjede.',
      why: 'De fleste mikroorganismer er ikke patogener, og samme art kan opptre ulikt mellom miljøer; funksjon og sykdom må derfor bestemmes gjennom aktivitet og kontekst, ikke mikrobenavn alene.',
      concepts: ['mikrobiom', 'nedbryter', 'mutualisme', 'kommensalisme', 'konkurranse', 'patogen', 'vert', 'virulens', 'biofilm'],
      questions: [
        'Hvilke mikroorganismer eller funksjonsgrupper er dokumentert i samfunnet, og med hvilken metode?',
        'Hvilken målbar aktivitet viser nedbrytning, symbiose, konkurranse eller annen økologisk funksjon?',
        'Hvis sykdom foreslås, hvilken evidens kobler mikroben til vertsskade fremfor tilfeldig samtidig forekomst?'
      ],
      conflicts: ['mikrobetilstedeværelse vs årsak til sykdom', 'samfunnssammensetning vs målt funksjon', 'laboratorievekst vs aktivitet i naturmiljø'],
      distinctions: ['kolonisering vs infeksjon', 'nedbrytning vs patogenitet', 'mikrobiomprofil vs funksjon'],
      hooks: ['mikrobiell_aktivitet', 'mikrobiell_symbiose', 'mikrobiell_identifikasjon'],
      methods: ['met_natur_mikrobiell_aktivitet_og_nedbrytning', 'met_natur_kultur_og_kolonikarakterisering', 'met_natur_mikroskopi_mikrobiell_morfologi'],
      places: ['kompost', 'jordprøve', 'våtmark', 'død ved', 'laboratorium']
    }
  ],
  hooks: [
    ['sopp_hyfer_mycel', 'Hyfer og mycel', 'Hvordan viser den dokumenterte strukturen at soppen vokser som hyfer eller mycel, og hvilket substrat inngår i veksten?', ['mikroskopi eller makrofoto med målestokk', 'substrat og voksested med dato', 'hyfestruktur og relevant sammenligningsmateriale']],
    ['sopp_sporer_formering', 'Soppsporer og formering', 'Hvilken spore- eller formeringsstruktur er observert, og hvilken del av livssyklusen kan materialet faktisk dokumentere?', ['spore- eller fruktlegemestruktur', 'mikroskopi, dyrking eller genetisk kontroll', 'livsstadium og alternative formeringsmåter']],
    ['sopp_bestemmelse', 'Soppbestemmelse', 'Hvilke makro- og mikroskopiske kjennetegn skiller den foreslåtte soppen fra relevante forvekslingsarter?', ['foto og mål av fruktlegeme eller koloni', 'mikroskopiske diagnostiske trekk', 'nøkkel, referansebelegg eller sekvenskontroll']],
    ['lav_symbiose', 'Lavsymbiose', 'Hvilke data viser samspillet mellom sopp- og fotobiontpartner i den aktuelle laven fremfor bare et ytre thallusmønster?', ['thallus- og mikroskopidata', 'identifikasjon av partnerne', 'fukt, lys og substratforhold']],
    ['lav_miljoindikasjon', 'Lav som miljøindikator', 'Kan lavforekomsten knyttes til miljøpåvirkning når substrat, mikroklima, alder og registreringsinnsats holdes adskilt?', ['standardisert artsregistrering', 'substrat, lys og fuktmetadata', 'uavhengig miljømåling eller gradient']],
    ['prokaryot_cellestruktur', 'Prokaryot cellestruktur', 'Hvilke celle- og membrankjennetegn kan dokumenteres, og hvilke av dem skiller bakterier, arkéer og eukaryote mikrober?', ['mikroskopi eller celledata', 'cellevegg- og membraninformasjon', 'taksonomisk eller molekylær referanse']],
    ['mikrobiell_variabilitet', 'Mikrobiell variasjon og formering', 'Hvordan varierer kolonier eller celler mellom prøver, og skyldes forskjellen genetikk, miljø, vekstfase eller målemetode?', ['repeterte prøver og kolonidata', 'vekstbetingelser og tidsserie', 'morfologisk eller genetisk kontroll']],
    ['mikrobiell_metabolisme', 'Mikrobiell metabolisme', 'Hvilken energi- og karbonomsetning støttes av substrater, miljøforhold og målte produkter i prøven?', ['substrat- og produktmålinger', 'oksygen, redoks, temperatur og pH', 'kontrollprøver eller inhibitorforsøk']],
    ['mikrobiell_kretslop', 'Mikrober i stoffkretsløp', 'Hvilken mikrobiell reaksjon flytter karbon, nitrogen eller svovel mellom målbare kjemiske former i systemet?', ['før- og ettermåling av kjemiske forbindelser', 'mikrobiell aktivitet eller funksjonsmarkør', 'massebalanse og abiotisk kontroll']],
    ['mikrobiell_aktivitet', 'Mikrobiell aktivitet og nedbrytning', 'Hvilke mål viser at mikroorganismene er aktive og bryter ned eller omsetter materialet under de aktuelle forholdene?', ['gass-, masse- eller kjemitidsserie', 'temperatur, fukt og substrat', 'steril eller abiotisk kontroll']]
  ]
};

const GEO_EXTENSION = {
  id: 'geologi_landskap_tid',
  label: 'Geologi og naturhistorie',
  shortLabel: 'Geologi',
  definition: 'Domenet forklarer jordas materialer, indre oppbygning, bergartenes kretsløp, platetektonikk, vulkanisme, jordskjelv, sedimentasjon, fossiler, geologisk tid, istider og landskapsdannelse som koblede prosesser.',
  focus: ['mineraler_bergarter', 'jordas_indre', 'platetektonikk', 'vulkanisme_jordskjelv', 'geologisk_tid', 'fossiler_naturhistorie'],
  questionRole: 'Start i bergart, struktur, lagfølge, fossil, seismisk signal eller kartdata; skill deretter materiale, prosess, tidsrekkefølge og usikker datering før geologisk historie rekonstrueres.',
  tagline: 'Hvordan jordas indre og ytre prosesser bygger bergarter, flytter plater og bevarer spor av landskap og liv gjennom dyp tid.',
  thinkers: GEO_THINKERS,
  comparisonPairs: [['alfred_wegener', 'marie_tharp'], ['charles_lyell', 'arthur_holmes']],
  methods: [
    'met_natur_petrografisk_bergartsanalyse',
    'met_natur_seismisk_og_tektonisk_analyse',
    'met_natur_stratigrafisk_og_geokronologisk_analyse'
  ],
  emners: [
    {
      id: 'em_natur_mineraler_bergarter_bergartskretslop',
      title: 'Mineraler, bergarter og bergartenes kretsløp',
      short: 'Bergartskretsløpet',
      level: 1,
      definition: 'Emnet skiller mineraler fra bergarter og undersøker hvordan størkning, sedimentasjon, diagenese, metamorfose, oppsmelting, forvitring og erosjon knytter magmatiske, sedimentære og metamorfe bergarter sammen.',
      why: 'En bergart kan ikke forklares sikkert fra farge eller sted alene; mineralinnhold, tekstur, struktur og dannelsesprosess må dokumenteres før prøven plasseres i bergartskretsløpet.',
      concepts: ['mineral', 'magmatisk bergart', 'sedimentær bergart', 'metamorf bergart', 'krystall', 'diagenese', 'metamorfose', 'bergartskretsløp'],
      questions: [
        'Hvilke mineraler, teksturer og strukturer er dokumentert i bergartsprøven?',
        'Hvilken dannelsesprosess forklarer kombinasjonen av mineralogi, kornstørrelse og struktur best?',
        'Hvilke senere prosesser kan ha endret bergarten etter at den først ble dannet?'
      ],
      conflicts: ['mineral vs bergart', 'opprinnelig dannelse vs senere omdanning', 'feltutseende vs laboratoriebestemmelse'],
      distinctions: ['mineral vs bergart', 'magmatisk vs metamorf tekstur', 'forvitring vs metamorfose'],
      hooks: ['mineral_bergart', 'bergartskretslop', 'petrografisk_tekstur'],
      methods: ['met_natur_petrografisk_bergartsanalyse', 'met_natur_geologisk_analyse'],
      places: ['bergskjæring', 'steinbrudd', 'naturhistorisk museum', 'fjellknaus', 'laboratorium']
    },
    {
      id: 'em_natur_jordas_indre_seismiske_bolger',
      title: 'Jordas indre og seismiske bølger',
      short: 'Jordas indre',
      level: 2,
      definition: 'Emnet bruker P- og S-bølger, tetthet, gravitasjon og materialegenskaper til å undersøke jordskorpe, mantel og kjerne og skiller direkte prøver fra indirekte geofysiske slutninger.',
      why: 'Mennesker kan ikke observere mantelen og kjernen direkte i full skala; kunnskapen bygger på hvordan bølger og andre fysiske signaler endres gjennom jordas indre.',
      concepts: ['jordskorpe', 'mantel', 'ytre kjerne', 'indre kjerne', 'P-bølge', 'S-bølge', 'seismologi', 'diskontinuitet'],
      questions: [
        'Hvordan endres P- og S-bølger med materiale, dybde og overgang mellom lag?',
        'Hvilke observasjoner støtter skillet mellom fast mantel, flytende ytre kjerne og fast indre kjerne?',
        'Hvilke egenskaper ved jordas indre er indirekte modeller og hvilke er direkte målt?'
      ],
      conflicts: ['direkte prøve vs geofysisk inferens', 'bølgehastighet vs materiale alene', 'laggrense vs gradvis overgang'],
      distinctions: ['P-bølge vs S-bølge', 'litosfære vs jordskorpe', 'ytre vs indre kjerne'],
      hooks: ['jordas_indre', 'seismiske_bolger', 'tektonisk_struktur'],
      methods: ['met_natur_seismisk_og_tektonisk_analyse', 'met_natur_geologisk_analyse'],
      places: ['seismisk_stasjon', 'naturhistorisk museum', 'universitetslaboratorium', 'bergskjæring']
    },
    {
      id: 'em_natur_platetektonikk_plategrenser',
      title: 'Platetektonikk, plategrenser og havbunnsspredning',
      short: 'Platetektonikk',
      level: 2,
      definition: 'Emnet forklarer litosfæreplaters bevegelse gjennom spredningssoner, subduksjon, transformforkastninger og kollisjon og kobler havbunn, jordskjelv, vulkaner og fjellkjeder til målbare platebevegelser.',
      why: 'Sammenfall mellom plategrenser og geologisk aktivitet er et globalt mønster, men hvert område må tolkes med kart, hastigheter, dybder og struktur fremfor en enkel kontinentpuslespillforklaring.',
      concepts: ['litosfæreplate', 'midthavsrygg', 'subduksjon', 'transformforkastning', 'rift', 'havbunnsspredning', 'paleomagnetisme', 'platehastighet'],
      questions: [
        'Hvilken type plategrense viser kart-, dybde- og bevegelsesdata i området?',
        'Hvordan støtter havbunnsalder, magnetiske mønstre eller geodesi den foreslåtte platebevegelsen?',
        'Hvilke jordskjelv-, vulkan- og fjellkjedemønstre forventes ved denne grensen, og hvilke avvik finnes?'
      ],
      conflicts: ['kontinentbevegelse vs platebevegelse', 'korrelert aktivitet vs mekanisme', 'overflatekart vs tredimensjonal subduksjon'],
      distinctions: ['divergent vs konvergent grense', 'rift vs midthavsrygg', 'kontinent vs litosfæreplate'],
      hooks: ['platetektonikk', 'plategrenser', 'havbunnsspredning'],
      methods: ['met_natur_seismisk_og_tektonisk_analyse', 'met_natur_geologisk_analyse'],
      places: ['geologisk_kart', 'midthavsryggmodell', 'fjellkjede', 'riftlandskap', 'naturhistorisk museum']
    },
    {
      id: 'em_natur_vulkanisme_jordskjelv_forkastninger',
      title: 'Vulkanisme, jordskjelv og forkastninger',
      short: 'Vulkaner og jordskjelv',
      level: 2,
      definition: 'Emnet undersøker magmadannelse, vulkanske utbrudd, elastisk spenningsoppbygging, forkastningsbevegelse og jordskjelvbølger og kobler prosessene til tektonisk miljø uten å gjøre plategrensen til eneste årsak.',
      why: 'Vulkaner og jordskjelv oppstår under ulike geologiske betingelser; fareforståelse krever at hendelsestype, dybde, materiale, forkastning og eksponering holdes fra hverandre.',
      concepts: ['magma', 'lava', 'viskositet', 'vulkanisme', 'forkastning', 'elastisk tilbakeslag', 'hyposenter', 'episenter', 'magnitude'],
      questions: [
        'Hvilken magmakilde eller forkastningsmekanisme støttes av de geologiske og geofysiske dataene?',
        'Hvordan påvirker sammensetning, gass, viskositet eller spenningsfelt hendelsens forløp?',
        'Hva beskriver selve den geologiske hendelsen, og hva tilhører separat vurdering av fare, sårbarhet og eksponering?'
      ],
      conflicts: ['magnitude vs skadeomfang', 'vulkanisme vs plategrense alene', 'forkastningens spor vs aktiv bevegelse'],
      distinctions: ['magma vs lava', 'hyposenter vs episenter', 'fare vs risiko'],
      hooks: ['vulkanisme', 'jordskjelv_forkastning', 'seismiske_bolger'],
      methods: ['met_natur_seismisk_og_tektonisk_analyse', 'met_natur_risiko_og_sarbarhetsanalyse'],
      places: ['forkastningssone', 'vulkansk_bergart', 'seismisk_stasjon', 'naturhistorisk museum']
    },
    {
      id: 'em_natur_stratigrafi_geologisk_tid_datering',
      title: 'Stratigrafi, geologisk tid og datering',
      short: 'Geologisk tid',
      level: 3,
      definition: 'Emnet bruker lagfølge, skjærende relasjoner, ledefossiler og radiometriske dateringer til å ordne geologiske hendelser og knytte relative aldersforhold til numerisk alder og geologisk tidsskala.',
      why: 'Relativ rekkefølge og absolutt alder er ulike påstander; sikre rekonstruksjoner krever at prøvens kontekst, dateringssystem, usikkerhet og mulige senere omdanning dokumenteres.',
      concepts: ['stratigrafi', 'superposisjon', 'skjærende relasjon', 'relativ alder', 'radiometrisk datering', 'halveringstid', 'geologisk tidsskala', 'korrelasjon'],
      questions: [
        'Hvilken relativ hendelsesrekkefølge følger av lagfølge, kontaktflater og skjærende strukturer?',
        'Hvilket materiale og isotopsystem dateres, og hvilken geologisk hendelse representerer alderen?',
        'Hvordan kombineres relative og numeriske aldre med usikkerhet til en konsistent geologisk tidslinje?'
      ],
      conflicts: ['relativ alder vs numerisk alder', 'bergartens alder vs senere metamorf hendelse', 'lokal lagfølge vs global tidskorrelasjon'],
      distinctions: ['relativ vs radiometrisk datering', 'avsetningsalder vs krystallisasjonsalder', 'periode vs absolutt årstall'],
      hooks: ['stratigrafi', 'radiometrisk_datering', 'geologisk_tid'],
      methods: ['met_natur_stratigrafisk_og_geokronologisk_analyse', 'met_natur_petrografisk_bergartsanalyse'],
      places: ['lagrekke', 'bergskjæring', 'fossilsamling', 'naturhistorisk museum', 'laboratorium']
    },
    {
      id: 'em_natur_fossiler_livets_jordas_historie',
      title: 'Fossiler, masseutdøinger og jordas naturhistorie',
      short: 'Naturhistorie',
      level: 3,
      definition: 'Emnet undersøker fossil dannelse, tafonomi, biostratigrafi, endringer i livets mangfold og store geologiske hendelser og integrerer fossilregisteret med datering, paleomiljø og platetektonisk historie.',
      why: 'Fossilregisteret er selektivt og ufullstendig; fravær av fossiler betyr ikke automatisk fravær av liv, og globale hendelser må bygges fra korrelerte daterte spor på flere lokaliteter.',
      concepts: ['fossil', 'tafonomi', 'biostratigrafi', 'ledefossil', 'paleomiljø', 'masseutdøing', 'fossilregister', 'naturhistorie'],
      questions: [
        'Hvordan ble fossilet eller sporet bevart, og hvilke organismer eller miljøer er systematisk underrepresentert?',
        'Hvordan knyttes fossilforekomsten til lagets relative og numeriske alder og til et rekonstruert paleomiljø?',
        'Hvilke uavhengige geologiske og biologiske data støtter en foreslått regional eller global naturhistorisk hendelse?'
      ],
      conflicts: ['fossilfravær vs faktisk fravær', 'lokal hendelse vs global hendelse', 'bevaringsskjevhet vs biologisk mangfold'],
      distinctions: ['fossil vs bergartsstruktur', 'tafonomi vs evolusjon', 'biostratigrafi vs radiometrisk datering'],
      hooks: ['fossiler_tafonomi', 'geologisk_tid', 'naturhistorisk_rekonstruksjon'],
      methods: ['met_natur_stratigrafisk_og_geokronologisk_analyse', 'met_natur_petrografisk_bergartsanalyse'],
      places: ['fossillokalitet', 'fossilsamling', 'lagrekke', 'naturhistorisk museum']
    }
  ],
  hooks: [
    ['mineral_bergart', 'Mineraler og bergarter', 'Hvilke mineraler og strukturer dokumenterer bergartstypen, og hvilke observasjoner skiller mineralidentitet fra bergartsnavn?', ['håndstykke eller preparat med proveniens', 'mineralogi, hardhet, spaltning eller optiske trekk', 'sammenligning med referanseprøve og tekstur']],
    ['bergartskretslop', 'Bergartenes kretsløp', 'Hvilken dannelses- eller omdanningsprosess forklarer bergarten, og hvilke spor viser senere overgang mellom kretsløpets ledd?', ['mineralogi og tekstur', 'kontakt, lagdeling eller metamorf struktur', 'feltrelasjon og alternativ dannelseshistorie']],
    ['petrografisk_tekstur', 'Petrografisk tekstur', 'Hvordan dokumenterer kornstørrelse, krystallform, orientering og kontakt mellom mineraler bergartens dannelses- og omdanningshistorie?', ['mikroskopi eller detaljfoto', 'kornstørrelse, mineralfordeling og orientering', 'prøvekontekst og sammenligningsmateriale']],
    ['jordas_indre', 'Jordas indre', 'Hvilke geofysiske data støtter modellen av jordskorpe, mantel og kjerne, og hvilke egenskaper er fortsatt indirekte inferert?', ['seismiske hastigheter og baner', 'tetthet, gravitasjon eller varmefluks', 'modellusikkerhet og alternative strukturer']],
    ['seismiske_bolger', 'Seismiske bølger', 'Hvordan endres P- og S-bølger gjennom materialer og laggrenser, og hvilken struktur kan derfor utledes fra registreringene?', ['seismogram med ankomsttider', 'bølgetype og hastighetsmodell', 'stasjon, hendelse og usikker lokalisering']],
    ['tektonisk_struktur', 'Tektonisk struktur', 'Hvilke forkastninger, folder, dybder og bevegelsesretninger dokumenterer deformasjonen og dens forhold til regional tektonikk?', ['strukturmålinger og kart', 'seismiske eller geodetiske data', 'tverrprofil og relativ hendelsesrekkefølge']],
    ['platetektonikk', 'Platetektonikk', 'Hvordan støtter uavhengige bevegelses-, havbunns- og seismiske data den foreslåtte platebevegelsen?', ['GPS- eller geodetisk bevegelse', 'havbunnsalder eller paleomagnetisk mønster', 'fordeling av jordskjelv og vulkanisme']],
    ['plategrenser', 'Plategrenser', 'Hvilken grensetype passer til bevegelsesretning, dybdefordeling og geologiske strukturer uten å gjøre kartlinjen til hele forklaringen?', ['relativ platebevegelse', 'jordskjelvdybder og forkastningstype', 'vulkanbue, rygg, grøft eller fjellkjede']],
    ['havbunnsspredning', 'Havbunnsspredning', 'Hvordan viser alder, topografi og magnetiske anomalier at ny havbunn dannes og flyttes bort fra en spredningsakse?', ['datering av havbunn', 'magnetiske stripeanomalier', 'batymetri og spredningshastighet']],
    ['vulkanisme', 'Vulkanisme', 'Hvilke data om magma, gass, bergart og tektonisk miljø forklarer utbruddstype og vulkansk produkt?', ['kjemisk eller mineralogisk sammensetning', 'gass, temperatur og viskositetsindikatorer', 'lagfølge og vulkanske produkter']],
    ['jordskjelv_forkastning', 'Jordskjelv og forkastninger', 'Hvordan kobles registrert jordskjelvaktivitet til forkastningsgeometri, spenningsfelt og faktisk bevegelse?', ['hyposentre og fokalmekanismer', 'forkastningskart og feltspor', 'geodetisk deformasjon og hendelseshistorikk']],
    ['stratigrafi', 'Stratigrafi', 'Hvilken hendelsesrekkefølge kan leses fra lag, kontaktflater, diskordanser og skjærende strukturer i den dokumenterte sekvensen?', ['målt lagrekke og kontaktflater', 'sedimentære strukturer eller intrusjoner', 'korrelasjon og usikker laggrense']],
    ['radiometrisk_datering', 'Radiometrisk datering', 'Hva dateres av isotopsystemet, og hvordan påvirker mineralsystem, lukning, senere omdanning og analytisk usikkerhet alderen?', ['prøve og mineral med proveniens', 'isotopmålinger og kalibrering', 'geologisk kontekst og usikkerhetsintervall']],
    ['geologisk_tid', 'Geologisk tid', 'Hvordan kobles lokal relativ rekkefølge og numeriske aldre til den geologiske tidsskalaen uten å blande periode, hendelse og enkeltmåling?', ['lagfølge og relative prinsipper', 'radiometriske aldre med usikkerhet', 'korrelerte fossil- eller markeringshorisonter']],
    ['fossiler_tafonomi', 'Fossiler og tafonomi', 'Hvordan ble organismen eller sporet bevart, og hvilke biologiske eller miljømessige skjevheter følger av fossiliseringsprosessen?', ['fossiltype og bergartsmatriks', 'bevaringsgrad og transportspor', 'sammenligning med forventet organisme- og miljømangfold']],
    ['naturhistorisk_rekonstruksjon', 'Naturhistorisk rekonstruksjon', 'Hvordan kombineres fossiler, bergarter, datering og tektonisk historie til en tidsordnet rekonstruksjon med synlig usikkerhet?', ['daterte lag og fossiler', 'paleomiljøindikatorer', 'regional korrelasjon og alternative hendelsesforløp']]
  ]
};

const METHOD_SPECS = [
  ['met_natur_mikroskopi_mikrobiell_morfologi', 'Mikroskopi av sopp og mikroorganismer', 'Dokumenterer celler, hyfer, sporer, kolonistrukturer og andre mikroskopiske kjennetegn med kalibrert forstørrelse, preparatkontroll og eksplisitt sammenligning mot relevante referanser.', 'sopp_lav_mikroorganismer',
    ['preparat eller prøve med entydig ID', 'kalibrerte mikro- eller makrobilder', 'mål av celler, hyfer, sporer eller strukturer', 'referansebeskrivelse og prepareringsmetadata'],
    ['Definer strukturen som skal undersøkes og velg egnet prøve og preparering.', 'Kalibrer målestokk og dokumenter minst ett representativt og ett avvikende synsfelt.', 'Mål diagnostiske strukturer uten å velge bare de mest typiske individene.', 'Sammenlign med relevante referanser og utelukk prepareringsartefakter.', 'Rapporter laveste sikre morfologiske identifikasjon og usikkerhet.'],
    ['Preparering, farging og tørking kan endre celler og hyfer.', 'Morfologisk likhet kan være utilstrekkelig til sikker artsbestemmelse.']],
  ['met_natur_kultur_og_kolonikarakterisering', 'Dyrking og kolonikarakterisering', 'Sammenligner vekst, kolonimorfologi og fysiologiske egenskaper under definerte dyrkingsbetingelser og bruker kontroller til å skille biologisk variasjon fra kontaminasjon og medieeffekter.', 'sopp_lav_mikroorganismer',
    ['prøve-ID og inokulasjonsmetadata', 'medium, temperatur, atmosfære og inkubasjonstid', 'kolonitall, vekstrate og morfologi', 'negative og positive kontroller'],
    ['Avgrens organismetype og hvorfor dyrking kan besvare spørsmålet.', 'Bruk steril teknikk, kontrollprøver og dokumenterte medier.', 'Registrer vekst over tid med samme temperatur og inkubasjonsvindu.', 'Skil blandingskultur, kontaminasjon og enkeltkoloni før egenskaper sammenlignes.', 'Rapporter at ikke-dyrkbare organismer og miljøavhengig aktivitet kan mangle.'],
    ['Bare en del av miljøets mikroorganismer vokser på valgt medium.', 'Kolonimorfologi alene identifiserer sjelden art eller økologisk funksjon sikkert.']],
  ['met_natur_mikrobiell_aktivitet_og_nedbrytning', 'Måling av mikrobiell aktivitet og nedbrytning', 'Måler endring i gasser, masse eller kjemiske forbindelser over tid for å teste mikrobiell metabolisme, nedbrytning eller kretsløpsprosesser mot sterile, abiotiske eller miljømessige kontroller.', 'sopp_lav_mikroorganismer',
    ['tidsserie for gass, masse eller løste forbindelser', 'temperatur, fukt, pH og redoksforhold', 'substratmengde og prøvevolum', 'steril, abiotisk eller ubehandlet kontroll'],
    ['Formuler hvilken mikrobiell prosess og hvilket målbart produkt som forventes.', 'Standardiser prøve, substrat, temperatur, fukt og måleintervall.', 'Mål kontroll og behandling gjennom samme tidsserie.', 'Beregn rate og massebalanse der datagrunnlaget tillater det.', 'Skill mikrobiell aktivitet fra kjemisk bakgrunn og rapporter usikkerhet og alternative prosesser.'],
    ['Kjemiske endringer kan også skyldes abiotiske reaksjoner eller blandede prosesser.', 'Aktivitetsrate i inkubasjon kan avvike sterkt fra feltforholdene.']],
  ['met_natur_petrografisk_bergartsanalyse', 'Petrografisk bergartsanalyse', 'Bestemmer mineralogi, kornstørrelse, tekstur og struktur i bergarter fra feltprøve, håndstykke eller tynnslip og kobler observerte relasjoner til dannelse og senere geologisk omdanning.', 'geologi_landskap_tid',
    ['feltprøve med koordinat og orientering', 'håndstykke- og tynnslipbilder med målestokk', 'mineralidentifikasjon og teksturbeskrivelse', 'feltkontakt og regional geologisk kartkontekst'],
    ['Dokumenter prøvested, orientering og feltrelasjon før prøven tolkes.', 'Beskriv tekstur og struktur før bergartsnavn settes.', 'Identifiser mineraler med relevante fysiske eller optiske kriterier.', 'Sammenlign observasjonene med alternative magmatiske, sedimentære eller metamorfe dannelsesforløp.', 'Rapporter hvilke trekk som kan være senere forvitring eller omdanning.'],
    ['Ett håndstykke kan være lite representativt for en heterogen bergartsenhet.', 'Mineral- og teksturtolkning kan kreve kjemiske eller optiske analyser utover feltobservasjon.']],
  ['met_natur_seismisk_og_tektonisk_analyse', 'Seismisk og tektonisk analyse', 'Kombinerer jordskjelvposisjoner, bølgeankomster, fokalmekanismer, forkastningsgeometri og geodetisk bevegelse for å teste modeller av jordas indre, deformasjon og plategrenser.', 'geologi_landskap_tid',
    ['seismogrammer og ankomsttider', 'hyposentre, dybder og fokalmekanismer', 'forkastnings- og plategrensekart', 'geodetiske hastigheter og usikkerheter'],
    ['Avgrens struktur eller platebevegelse som skal testes.', 'Kontroller stasjonsdekning, lokalisering og dybdeusikkerhet.', 'Sammenstill bølge-, struktur- og bevegelsesdata i samme koordinat- og tidsramme.', 'Test om observasjonene passer én eller flere tektoniske modeller.', 'Rapporter modellavhengighet, datagap og alternative geometrier.'],
    ['Jordskjelvkataloger er ufullstendige under deteksjonsgrensen og historisk ujevne.', 'Sammenfall med en kartlagt plategrense beviser ikke alene lokal forkastningsmekanisme.']],
  ['met_natur_stratigrafisk_og_geokronologisk_analyse', 'Stratigrafisk og geokronologisk analyse', 'Bygger en geologisk tidsrekkefølge fra lagfølge, kontaktrelasjoner, fossiler og numeriske dateringer og kontrollerer hvilken hendelse hver alder faktisk representerer og hvor stor usikkerheten er.', 'geologi_landskap_tid',
    ['målt lagfølge med kontakt- og strukturdata', 'fossil- eller markeringshorisonter med proveniens', 'radiometriske aldre med analytisk usikkerhet', 'prøvemateriale, isotopsystem og geologisk kontekst'],
    ['Dokumenter lag, kontakter og skjærende relasjoner før alderstall brukes.', 'Etabler den relative hendelsesrekkefølgen og mulige hiatus eller omarbeidinger.', 'Knytt hver numerisk datering til riktig mineral, prosess og lukningshendelse.', 'Sammenlign uavhengige alders- og fossilindikatorer og test konflikter.', 'Rapporter intervaller og alternative korrelasjoner fremfor falsk presisjon.'],
    ['Radiometrisk alder kan datere krystallisasjon, metamorfose eller senere systemåpning avhengig av prøven.', 'Fossil- og lagkorrelasjon kan påvirkes av omarbeiding, hiatus og geografisk variasjon.']]
];

const MICRO_CHAPTER = {
  id: 'sopp_lav_mikroorganismer',
  title: 'Sopp, lav og mikroorganismer',
  subtitle: 'Fra hyfer og celler til symbiose, nedbrytning og mikrobielle kretsløp',
  lead: 'Sopp og mikroorganismer er små eller skjulte, men driver store deler av naturens stoffomsetning. Sopp bygger mycel og spredningsstrukturer, lav organiserer stabile partnerskap, og bakterier og arkéer utfører et enormt spekter av metabolske reaksjoner. Kapittelet gjør disse organismene undersøkbare gjennom prøve, mikroskopi, dyrking, aktivitet og eksplisitt metodeusikkerhet.',
  learningObjectives: ['skille soppens mycel fra synlige fruktlegemer og sporer', 'forklare sentrale trekk i soppers formering og livssykluser', 'analysere lav som symbiose og miljøindikator', 'skille bakterier, arkéer og eukaryote mikrober på relevant nivå', 'forklare mikrobielle energi- og stoffskifteveier', 'skille mikrobetilstedeværelse fra dokumentert aktivitet, symbiose eller sykdom'],
  sections: [
    ['soppbygning', '1. Sopp er mer enn fruktlegemer', [
      'Sopp er eukaryote organismer med cellevegger som inneholder kitin. Mange sopper vokser som trådformede hyfer som danner et mycel i jord, ved, levende vev eller annet substrat. Det synlige fruktlegemet er hos slike sopper en midlertidig reproduktiv struktur, ikke hele organismen.',
      'Hyfer kan være septate eller mer sammenhengende, og vekst skjer ofte ved hyfespissene. En prøve må derfor knyttes til substrat og voksested; fruktlegemer langt fra hverandre kan være deler av samme mycel, mens like fruktlegemer kan tilhøre ulike arter.',
      'Makroskopiske kjennetegn er nyttige, men sikker bestemmelse kan kreve sporestørrelse, hyfestruktur, kjemiske reaksjoner eller DNA. Artsnavnet skal ikke være sikrere enn materialet og metoden.'
    ]],
    ['formering', '2. Sporer og livssykluser', [
      'Sopp kan formere seg både ukjønnet og kjønnet. Mitotiske sporer kan spre en genetisk linje raskt, mens kjønnet formering innebærer celle- og kjerneprosesser som varierer mellom hovedgrupper.',
      'Plasmogami og karyogami er forskjellige hendelser: først kan cytoplasma forenes, mens kjernene i enkelte grupper forblir separate en periode før de smelter sammen. Meiose skaper deretter rekombinerte haploide produkter i den seksuelle syklusen.',
      'En observert sporetype dokumenterer bare en del av livssyklusen. Dyrking, mikroskopi og genetiske data kan være nødvendige for å koble ukjønnede og kjønnede stadier til samme art.'
    ]],
    ['lav', '3. Lav er et organisert partnerskap', [
      'Lav består av en soppartner og én eller flere fotosyntetiske partnere, vanligvis grønnalger eller cyanobakterier. Soppen bygger mye av thallusstrukturen, mens fotobionten leverer fotosyntetisk bundet karbon.',
      'Partnerskapet endrer hvilke miljøer organismene kan utnytte, men lav må fortsatt bestemmes med artsrelevante kjennetegn. Vekstform, farge og substrat er ikke alltid nok uten mikroskopi eller kjemiske data.',
      'Noen lavarter reagerer tydelig på luftkvalitet, fukt eller skogkontinuitet. Bioindikasjon krever likevel kontroll for substrat, eksponering, alder og registreringsinnsats; lavforekomst er ikke en direkte sensorverdi.'
    ]],
    ['prokaryoter', '4. Bakterier, arkéer og mikrobielt stoffskifte', [
      'Bakterier og arkéer mangler membranavgrenset cellekjerne, men er ikke én evolusjonært ensartet gruppe. De skiller seg blant annet i membrankjemi, cellevegg og molekylære systemer, og begge domenene rommer stor metabolsk variasjon.',
      'Mikroorganismer kan hente energi gjennom aerob eller anaerob respirasjon, fermentering, fotosyntese eller oksidasjon av uorganiske stoffer. Derfor må funksjon beskrives med substrat, elektronakseptor, produkt og miljøbetingelser.',
      'Mikrober driver viktige trinn i karbon-, nitrogen- og svovelkretsløp. En sekvens eller et funksjonsgen viser potensial eller tilstedeværelse, mens målt kjemisk endring over tid kan dokumentere aktivitet.'
    ]],
    ['okologi', '5. Mikrobiell økologi, nedbrytning og sykdom', [
      'Sopp og bakterier bryter ned organisk materiale og frigjør eller binder næringsstoffer. Andre lever i mutualistiske samliv, konkurrerer om ressurser eller danner biofilmer der celler påvirker hverandres lokale miljø.',
      'Et mikrobielt samfunn kan beskrives med dyrking, mikroskopi, sekvensering eller aktivitetsmålinger. Metodene ser ulike deler av samfunnet, og særlig dyrking kan overse organismer som ikke vokser under laboratoriebetingelsene.',
      'Patogenitet er en særskilt vert–mikrobe-relasjon og må ikke utledes fra at en mikroorganisme finnes i en syk vert. Årsak krever en dokumentert kjede mellom mikrobe, virulensmekanisme, vert og skade.'
    ]]
  ],
  concepts: [
    ['hyfe', 'Hyfe', 'Trådformet vekststruktur hos mange sopper.'],
    ['mycel', 'Mycel', 'Nettverk av hyfer som utgjør en stor del av soppens vegetative kropp.'],
    ['spore', 'Spore', 'Sprednings- eller formeringscelle som kan utvikle ny vekst uten å være et frø.'],
    ['lav', 'Lav', 'Stabilt symbiotisk system dominert av sopp og fotosyntetisk partner.'],
    ['prokaryot', 'Prokaryot', 'Celle uten membranavgrenset cellekjerne; bakterier og arkéer er prokaryote domener.'],
    ['fermentering', 'Fermentering', 'Energiomsetning uten ekstern elektronakseptor der organiske forbindelser både oksideres og reduseres.'],
    ['biofilm', 'Biofilm', 'Strukturert mikrobielt samfunn festet til en overflate og omgitt av ekstracellulært materiale.'],
    ['mikrobiom', 'Mikrobiom', 'Mikroorganismer og deres genetiske eller funksjonelle sammenheng i et avgrenset miljø.']
  ],
  sources: [
    ['OpenStax Biology 2e – Fungi', 'https://openstax.org/books/biology-2e/pages/24-introduction'],
    ['OpenStax Biology 2e – Prokaryotes: Bacteria and Archaea', 'https://openstax.org/books/biology-2e/pages/22-introduction'],
    ['OpenStax Biology 2e – Ecology of Fungi', 'https://openstax.org/books/biology-2e/pages/24-3-ecology-of-fungi'],
    ['OpenStax Biology 2e – Prokaryotic Metabolism', 'https://openstax.org/books/biology-2e/pages/22-3-prokaryotic-metabolism']
  ],
  examples: [
    ['Sopp på en død stokk', 'Flere fruktlegemer dukker opp på samme stokk etter regn.', ['Dokumenter fruktlegemer, substrat og dato.', 'Undersøk diagnostiske makro- og mikrotrekk.', 'Skill antall fruktlegemer fra antall genetiske individer.', 'Koble funnet til nedbrytning bare dersom aktivitet eller kjent funksjon er kildebelagt.']],
    ['Kompost som varmes opp', 'Temperaturen og gassutviklingen øker i en komposthaug.', ['Mål temperatur, fukt og gass over tid.', 'Bruk kontroll eller sammenligningsperiode.', 'Koble kjemisk endring til mikrobielle prosesser med relevante kilder.', 'Skill aktivitet fra bare forekomst av mikroorganismer.']]
  ],
  places: [
    ['naturhistorisk_museum', 'Naturhistorisk museum', 'Samlinger og mikroskopisk referansemateriale gjør sopp- og mikrobestemmelse etterprøvbar.'],
    ['sognsvann_skogen', 'Skogen ved Sognsvann', 'Død ved, jord og lav gir konkrete innganger til soppstruktur, symbiose og nedbrytning når prøvetaking er forsvarlig.']
  ]
};

const GEO_CHAPTER = {
  id: 'geologi_landskap_tid',
  title: 'Geologi og naturhistorie',
  subtitle: 'Fra mineraler og jordas indre til platetektonikk, fossiler og landskap gjennom dyp tid',
  lead: 'Geologi undersøker jorda som et dynamisk system. Mineraler bygger bergarter, varme og tetthetsforskjeller driver prosesser i jordas indre, litosfæreplater flyttes og deformeres, og overflaten formes videre av is, vann, vær og tyngdekraft. Fossiler, lagrekker og dateringer gjør det mulig å rekonstruere jordas og livets historie uten å gjøre usikre spor mer presise enn de er.',
  learningObjectives: ['skille mineraler, bergarter, løsmasser og jord', 'forklare jordas indre ved hjelp av seismiske data', 'analysere divergent, konvergent og transform platebevegelse', 'koble vulkanisme og jordskjelv til geologiske mekanismer', 'bygge relative og numeriske geologiske tidsrekkefølger', 'tolke fossiler, istidsspor og landskapsformer som deler av en kildekritisk naturhistorie'],
  sections: [
    ['materialer', '1. Mineraler, bergarter og bergartskretsløpet', [
      'Et mineral har en karakteristisk kjemisk sammensetning og krystallstruktur innenfor naturlig variasjon. En bergart er en sammensetning av ett eller flere mineraler eller andre geologiske komponenter. Berggrunn, løsmasser og jord er derfor ulike nivåer i landskapet.',
      'Magmatiske bergarter krystalliserer fra smelte, sedimentære bergarter dannes ved avsetning og diagenese eller kjemisk utfelling, og metamorfe bergarter omdannes i fast tilstand under endret temperatur, trykk og væskeforhold.',
      'Bergartskretsløpet er ikke en fast sirkel. Bergarter kan forvitre, begraves, metamorfoseres, smelte eller heves i mange rekkefølger. Mineralogi, tekstur og feltrelasjoner brukes til å rekonstruere hvilke overganger som faktisk fant sted.'
    ]],
    ['indre', '2. Jordas indre og platetektonikk', [
      'Seismiske P- og S-bølger endrer hastighet og bane gjennom ulike materialer. S-bølger går ikke gjennom flytende ytre kjerne, mens andre seismiske mønstre støtter en fast indre kjerne og lagdeling gjennom mantel og skorpe.',
      'Litosfæren er delt i plater som beveger seg relativt til hverandre. Ved divergerende grenser dannes ny havbunn, ved konvergerende grenser kan subduksjon eller kontinentkollisjon skje, og langs transformgrenser forskyves plater sideveis.',
      'Kontinentaldrift var en viktig forløper, men moderne platetektonikk bygger på flere uavhengige datatyper: havbunnens alder, paleomagnetiske mønstre, jordskjelvdybder, vulkanbelter og direkte geodetiske målinger.'
    ]],
    ['hendelser', '3. Vulkanisme, jordskjelv og deformasjon', [
      'Magma oppstår når bergarter delvis smelter ved trykkavlastning, tilførsel av flyktige stoffer eller temperaturendring. Sammensetning, temperatur og krystallinnhold påvirker viskositet og hvordan gass frigjøres under et utbrudd.',
      'Jordskjelv oppstår når oppbygd elastisk deformasjon frigjøres ved brudd og bevegelse langs en forkastning. Hyposenteret ligger i jorda, mens episenteret er punktet på overflaten over hendelsen.',
      'Magnitude beskriver størrelsen på selve jordskjelvet, mens skade også avhenger av avstand, grunnforhold, bygninger og eksponering. Geologisk hendelse, fare og samfunnsrisiko må derfor holdes analytisk fra hverandre.'
    ]],
    ['tid', '4. Stratigrafi, datering og geologisk tid', [
      'Lagfølge og skjærende relasjoner kan gi relativ alder: et lag er normalt yngre enn laget det ligger oppå, og en struktur som skjærer en annen er yngre enn strukturen den skjærer. Prinsippene må brukes med kontroll for folding, forkastning og omarbeiding.',
      'Radiometrisk datering måler isotopsystemer i egnede mineraler. Resultatet er en numerisk alder med usikkerhet, men geologisk tolkning krever at man vet om alderen representerer krystallisasjon, metamorfose, avkjøling eller en senere forstyrrelse.',
      'Den geologiske tidsskalaen kombinerer relative lag- og fossilsekvenser med numeriske dateringer. Perioder og epoker er korrelerte tidsintervaller, ikke ett enkelt globalt lag.'
    ]],
    ['historie', '5. Fossiler, istider og landskapets naturhistorie', [
      'Fossiler bevares selektivt. Harddeler, rask begravelse og bestemte kjemiske miljøer øker sjansen for bevaring, mens mange organismer og habitater etterlater få spor. Tafonomi undersøker hva som skjedde mellom organismens liv og fossilfunnet.',
      'Isbreer eroderer, transporterer og avsetter materiale. Etter siste istid førte avlasting til landheving samtidig som havnivået endret seg, slik at marine avsetninger og gamle strandlinjer i dag kan ligge høyt over havet.',
      'Naturhistorisk rekonstruksjon kombinerer bergarter, fossiler, landskapsformer, datering og tektonikk. En robust historie viser både hendelsesrekkefølge og usikkerhet og skiller gamle prosesser fra nyere erosjon og menneskelig terrengendring.'
    ]]
  ],
  concepts: [
    ['mineral', 'Mineral', 'Naturlig forekommende fast stoff med karakteristisk kjemisk sammensetning og krystallstruktur.'],
    ['bergart', 'Bergart', 'Fast geologisk materiale bygget av mineraler eller andre geologiske komponenter.'],
    ['litosfaere', 'Litosfære', 'Stiv ytre del av jorda som omfatter jordskorpen og øverste mantel.'],
    ['subduksjon', 'Subduksjon', 'Prosess der én litosfæreplate synker ned under en annen.'],
    ['forkastning', 'Forkastning', 'Bruddflate i berggrunnen der det har skjedd forskyvning.'],
    ['stratigrafi', 'Stratigrafi', 'Studiet av lagdelte bergarter og deres romlige og tidsmessige forhold.'],
    ['radiometrisk_datering', 'Radiometrisk datering', 'Numerisk aldersbestemmelse basert på radioaktive isotoper og deres henfallsprodukter.'],
    ['tafonomi', 'Tafonomi', 'Studiet av prosessene fra organisme dør til restene eventuelt bevares som fossil.'],
    ['landheving', 'Landheving', 'Heving av jordskorpen blant annet etter avlasting fra innlandsis.'],
    ['geologisk_tid', 'Geologisk tid', 'Tidsskala som organiserer jordas historie i hierarkiske tidsenheter knyttet til geologiske spor.']
  ],
  sources: [
    ['NGU – Berggrunnskartlegging', 'https://www.ngu.no/geologisk-kartlegging/berggrunnskartlegging'],
    ['NGU – Geologiske kart', 'https://www.ngu.no/geologiske-kart'],
    ['OpenStax Astronomy 2e – Earth’s Crust and plate tectonics', 'https://openstax.org/books/astronomy-2e/pages/8-2-earths-crust'],
    ['OpenStax Concepts of Biology – Geological Time', 'https://openstax.org/books/concepts-biology/pages/b-geological-time'],
    ['OpenStax Concepts of Biology – Evidence of Evolution and fossils', 'https://openstax.org/books/concepts-biology/pages/11-3-evidence-of-evolution']
  ],
  examples: [
    ['En bergskjæring med flere lag', 'Lagene er foldet og skjæres av en lys gangbergart.', ['Dokumenter lagretning, kontakt og skjæringsforhold.', 'Bygg relativ hendelsesrekkefølge før numeriske aldre brukes.', 'Bestem bergart og struktur med prøver eller kart.', 'Oppgi hvilke hendelser som fortsatt ikke kan dateres direkte.']],
    ['Et regionalt jordskjelvkart', 'Jordskjelvene danner et skrått belte mot dypet.', ['Kontroller lokalisering og dybdeusikkerhet.', 'Sammenlign beltet med platebevegelse og forkastningsgeometri.', 'Test om mønsteret passer subduksjon bedre enn alternative modeller.', 'Skill hendelsesmekanisme fra samfunnets risikonivå.']]
  ],
  places: [
    ['naturhistorisk_museum', 'Naturhistorisk museum', 'Mineral-, bergarts- og fossilsamlinger gjør klassifikasjon, datering og naturhistorisk rekonstruksjon etterprøvbar.'],
    ['akerselva', 'Akerselva', 'Berggrunn, løsmasser, erosjon og menneskelig terrengforming kan leses sammen langs et dokumentert byvassdrag.']
  ]
};

function geologyEmne(domain, spec) {
  const emne = buildEmne(domain, spec);
  emne.dimensions = domain.focus;
  emne.akse = domain.focus;
  emne.question_surface_mode = 'geology-and-evidence-first';
  emne.scope_guard = `Brukes når bergart, mineral, fossil, lagfølge, struktur, seismisk signal, landskapsform eller geologisk kart gir en dokumenterbar inngang til ${domain.label}.`;
  emne.generator_use_note = `Bruk ${spec.title} først når produksjonsmaterialet har dokumentert geologisk objekt, kontekst, metode og inspectable kilde.`;
  emne.blindspots = [
    `Ikke forveksle ${spec.distinctions[0]}.`,
    `Ikke bruk ${spec.title} som forklaring uten dokumentert geologisk materiale, struktur, metode og tids- eller stedskontekst.`
  ];
  emne.anti_patterns = [
    'Ikke trekk prosess eller alder fra bergartsnavn eller landskapsform alene.',
    'Ikke gjør relativ aldersrekkefølge om til eksakt numerisk datering uten egnet metode.',
    'Ikke skjul kart-, prøve- eller modellusikkerhet bak en generell geologifortelling.'
  ];
  emne.pedagogical_track = 'fra_materiale_og_struktur_til_prosess_tid_og_usikkerhet';
  emne.theory_surface_priority = 'geological-evidence-first_then-model';
  emne.theory_progression_note = 'Introduser geologisk modell etter at materiale, struktur, tidsforhold og datakvalitet er etablert.';
  return emne;
}

function geologyMethod(spec) {
  const method = buildMethod(spec, [GEO_EXTENSION]);
  method.rotation_note = `Roter bergart, struktur, tidsskala og datakilde før ${method.title.toLocaleLowerCase('nb-NO')} brukes på nytt, og bruk en uavhengig geologisk kontroll når tolkningen er modellavhengig.`;
  method.method_use_note = `Bruk ${method.title.toLocaleLowerCase('nb-NO')} når datagrunnlaget og spørsmålet hører til geologi og naturhistorie, ikke som generell etikett for et landskap.`;
  return method;
}

function geologyCategoryExtension() {
  const category = buildCategory(GEO_EXTENSION);
  category.question_surface_mode = 'geology-and-evidence-first';
  category.oslo.place_logic = 'Bruk steder bare når bergart, struktur, fossil, lagfølge, seismikk, landskapsform eller geologisk kart gir dokumenterbar inngang til geologi og naturhistorie.';
  category.source_priority = [
    'feltprøve, bergart, mineral, fossil, lagfølge, struktur, seismisk registrering eller geologisk kart med proveniens',
    'NGU, universitetsfaglig geologi, museumssamling eller annen inspectable geofaglig primær- eller fagkilde',
    'måledata med koordinat, stratigrafisk posisjon, instrument, prøvemetode og usikkerhet',
    'uavhengig geologisk kontroll som kan skille alternative prosess- eller aldersfortolkninger',
    'fagkart, emner og metoder som styring – aldri som faktakilde'
  ];
  category.anti_patterns = [
    'Ikke bygg geologispørsmål fra landskapsnavn eller emnetittel alene.',
    'Ikke presenter relativ alder som numerisk alder uten dateringsgrunnlag.',
    'Ikke la et kart eller en modell erstatte dokumentert prøve, struktur eller måling.'
  ];
  for (const hook of category.topic_hooks) {
    hook.question_surface_mode = 'geology-and-evidence-first';
    hook.avoid_place_types = ['sted_uten_dokumentert_geologisk_objekt', 'ren_utsikt_uten_kildegrunnlag', 'generisk_landskap'];
    hook.rotation_note = `For ${hook.title}: roter bergart, struktur, lokalitet, tidsskala og datakilde; gjenta ikke samme geologiske case før en annen prosess- eller tidsfortolkning er testet.`;
  }
  return category;
}

function geologyChapterDocument(spec, emneIds) {
  const chapter = chapterDocument(spec, emneIds);
  chapter.diagnosticQuestions = [
    { question: 'Kan et geologisk kart leses som et fotografi av undergrunnen?', answer: 'Nei. Kartet er en målestokkavhengig modell basert på observasjoner, målinger og tolkning.' },
    { question: 'Er ett synlig trekk nok til å bestemme prosess eller alder?', answer: 'Vanligvis ikke. Materiale, struktur, relasjoner og alternative prosesser må kontrolleres, og numerisk alder krever egnet dateringsgrunnlag.' },
    { question: 'Betyr fravær av fossil eller jordskjelvregistrering at fenomenet aldri har eksistert?', answer: 'Nei. Bevaring, deteksjonsgrense, prøvetaking og geologisk kontekst bestemmer hva fravær kan bety.' }
  ];
  chapter.commonMisconceptions = [
    { claim: 'Alle bergarter kan bestemmes sikkert fra farge og et fotografi.', correction: 'Sikker bestemmelse krever relevante mineral-, tekstur- og strukturdata og ofte nærmere prøveundersøkelse.' },
    { claim: 'Platetektonikk betyr bare at kontinentene flytter på seg.', correction: 'Det er litosfæreplater som beveger seg og samhandler ved spredning, subduksjon, transformbevegelse og kollisjon.' },
    { claim: 'Geologisk tid betyr at alle prosesser går sakte.', correction: 'Lang geologisk historie omfatter både langsomme prosesser og raske hendelser som jordskjelv, utbrudd, ras og flommer.' }
  ];
  chapter.applicationTasks = [
    { task: 'Dokumenter et geologisk objekt', prompts: ['Velg bergart, mineral, fossil, lag eller struktur og gi funnet sted- og kontekstdata.', 'Beskriv observerbare trekk før prosess eller alder tolkes.', 'Oppgi minst én alternativ tolkning og hva som kan skille den.'] },
    { task: 'Bygg en hendelsesrekkefølge', prompts: ['Kartlegg lag, kontakter og skjærende strukturer.', 'Sorter hendelser relativt før numeriske aldre legges til.', 'Marker hvilke ledd som bygger på direkte observasjon og hvilke som er modellslutninger.'] },
    { task: 'Vurder en geologisk påstand', prompts: ['Finn original kart-, prøve- eller målekilde.', 'Skill materiale, prosess, alder, fare og samfunnskonsekvens.', 'Rapporter målestokk, usikkerhet og hva dataene ikke kan avgjøre.'] }
  ];
  chapter.selfCheck = [
    { question: 'Hva skiller et mineral fra en bergart?', answer: 'Et mineral har en bestemt krystallstruktur og kjemisk sammensetning innenfor variasjon; en bergart består av ett eller flere mineraler eller andre geologiske komponenter.' },
    { question: 'Hvorfor er S-bølger viktige for modellen av jordas indre?', answer: 'S-bølger forplanter seg ikke gjennom væske, og fraværsmønsteret bidrar til evidensen for en flytende ytre kjerne.' },
    { question: 'Hva skiller relativ og numerisk alder?', answer: 'Relativ alder ordner hendelser før og etter hverandre; numerisk alder knytter en hendelse eller et materiale til et målt tidsestimat med usikkerhet.' },
    { question: 'Hvorfor er fossilregisteret ufullstendig?', answer: 'Fossilisering krever bestemte bevaringsforhold, og geologiske prosesser kan senere ødelegge eller skjule lag og fossiler.' },
    { question: 'Hva må kontrolleres før et landskap forklares med én prosess?', answer: 'Materiale, struktur, målestokk, tidsrekkefølge, alternative prosesser og nyere menneskelig omforming må vurderes.' }
  ];
  return chapter;
}

function mergeUnique(values) {
  return [...new Set(values)];
}

function main() {
  const pensum = readJson(P.pensum);
  const contract = readJson(P.contract);
  const emner = readJson(P.emner);
  const methodsDoc = readJson(P.methods);
  const fagkart = readJson(P.fagkart);
  const mappings = readJson(P.mappings);
  const registry = readJson(P.registry);
  const status = readJson(P.status);

  const newEmneIds = new Set([...MICRO_DOMAIN.emners, ...GEO_EXTENSION.emners].map((entry) => entry.id));
  const newMethodIds = new Set(METHOD_SPECS.map((entry) => entry[0]));
  const baseEmners = emner.filter((entry) => !newEmneIds.has(entry.emne_id));
  const baseMethods = methodsDoc.methods.filter((entry) => !newMethodIds.has(entry.method_id));
  const baseMappings = mappings.filter((entry) => !newEmneIds.has(entry.emne_id));

  assert(baseEmners.length === 65, `Forventet fase-2-baseline med 65 emner, fikk ${baseEmners.length}`);
  assert(baseMethods.length === 45, `Forventet fase-2-baseline med 45 metoder, fikk ${baseMethods.length}`);
  assert(baseMappings.length === 65, `Forventet fase-2-baseline med 65 mappingrader, fikk ${baseMappings.length}`);
  assert(fagkart.categories.length === 11 || fagkart.categories.length === 12, `Forventet 11 materialiserte kategorier før sluttfase, fikk ${fagkart.categories.length}`);

  const microCategory = buildCategory(MICRO_DOMAIN);
  const geoExtensionCategory = geologyCategoryExtension();
  const microHookIndex = new Map(microCategory.topic_hooks.map((hook) => [hook.id, hook]));
  const geoHookIndex = new Map(geoExtensionCategory.topic_hooks.map((hook) => [hook.id, hook]));

  const newMicroEmners = MICRO_DOMAIN.emners.map((entry) => buildEmne(MICRO_DOMAIN, entry));
  const newGeoEmners = GEO_EXTENSION.emners.map((entry) => geologyEmne(GEO_EXTENSION, entry));
  const newMethods = METHOD_SPECS.map((spec) => spec[3] === 'geologi_landskap_tid' ? geologyMethod(spec) : buildMethod(spec, [MICRO_DOMAIN, GEO_EXTENSION]));
  const newMicroMappings = MICRO_DOMAIN.emners.map((entry) => buildMapping(MICRO_DOMAIN, entry, microHookIndex));
  const newGeoMappings = GEO_EXTENSION.emners.map((entry) => buildMapping(GEO_EXTENSION, entry, geoHookIndex));

  emner.splice(0, emner.length, ...baseEmners, ...newMicroEmners, ...newGeoEmners);
  methodsDoc.methods = [...baseMethods, ...newMethods];
  mappings.splice(0, mappings.length, ...baseMappings, ...newMicroMappings, ...newGeoMappings);

  const categoryById = new Map(fagkart.categories.map((entry) => [entry.id, entry]));
  categoryById.set(MICRO_DOMAIN.id, microCategory);
  const existingGeoCategory = categoryById.get(GEO_EXTENSION.id);
  assert(existingGeoCategory, 'Mangler eksisterende geologikategori');
  const geoNewHookIds = new Set(geoExtensionCategory.topic_hooks.map((hook) => hook.id));
  existingGeoCategory.title = GEO_EXTENSION.label;
  existingGeoCategory.definition = GEO_EXTENSION.definition;
  existingGeoCategory.focus = mergeUnique([...(existingGeoCategory.focus || []), ...GEO_EXTENSION.focus]);
  existingGeoCategory.question_role = GEO_EXTENSION.questionRole;
  existingGeoCategory.tagline = GEO_EXTENSION.tagline;
  existingGeoCategory.best_place_types = mergeUnique([...(existingGeoCategory.best_place_types || []), ...geoExtensionCategory.best_place_types]);
  existingGeoCategory.topic_hooks = [
    ...(existingGeoCategory.topic_hooks || []).filter((hook) => !geoNewHookIds.has(hook.id)),
    ...geoExtensionCategory.topic_hooks
  ];
  existingGeoCategory.canon = geoExtensionCategory.canon;

  const domainOrder = new Map(pensum.domain_order.map((domainId, index) => [domainId, index]));
  fagkart.categories = [...categoryById.values()].sort((left, right) => domainOrder.get(left.id) - domainOrder.get(right.id));
  fagkart.meta.category_count = fagkart.categories.length;
  fagkart.meta.hook_count = fagkart.categories.reduce((sum, category) => sum + (category.topic_hooks || []).length, 0);
  fagkart.meta.canonical_round = 'v5.3';
  fagkart.version = 'v5.3-canonical-natur-final';
  fagkart.canonical_registry_version = 'naturpensum_v5_3';
  fagkart.updated_at = TODAY;
  methodsDoc.version = 'v5.3-canonical-natur-final';
  methodsDoc.updated_at = TODAY;

  const microPensum = pensum.domains.find((entry) => entry.domain_id === MICRO_DOMAIN.id);
  const microContract = contract.required_domains.find((entry) => entry.domain_id === MICRO_DOMAIN.id);
  assert(microPensum && microContract, 'Mangler sopp/lav/mikroorganisme-domenet');
  updateDomainRecord(microPensum, MICRO_DOMAIN, 'materialized_biology_layer');
  updateDomainRecord(microContract, MICRO_DOMAIN, 'materialized_biology_layer');

  const geoPensum = pensum.domains.find((entry) => entry.domain_id === GEO_EXTENSION.id);
  const geoContract = contract.required_domains.find((entry) => entry.domain_id === GEO_EXTENSION.id);
  assert(geoPensum && geoContract, 'Mangler geologi-domenet');
  const geoOldEmneIds = (geoPensum.emne_ids || []).filter((id) => !newEmneIds.has(id));
  const geoOldMethodIds = (geoPensum.method_ids || []).filter((id) => !newMethodIds.has(id));
  const geoOldHookIds = (geoPensum.hook_ids || []).filter((id) => !geoNewHookIds.has(id));
  const geoAllEmneIds = [...geoOldEmneIds, ...GEO_EXTENSION.emners.map((entry) => entry.id)];
  const geoAllMethodIds = mergeUnique([...geoOldMethodIds, ...GEO_EXTENSION.methods]);
  const geoAllHookIds = mergeUnique([...geoOldHookIds, ...geoExtensionCategory.topic_hooks.map((entry) => entry.id)]);
  for (const record of [geoPensum, geoContract]) {
    record.coverage_status = 'materialized_geology_layer';
    record.status = 'strong';
    record.definition = GEO_EXTENSION.definition;
    record.question_role = GEO_EXTENSION.questionRole;
    record.emne_ids = geoAllEmneIds;
    record.chapter_status = 'complete_for_current_geology_layer';
    record.emne_count = geoAllEmneIds.length;
    if (Object.hasOwn(record, 'current_emne_count')) record.current_emne_count = geoAllEmneIds.length;
    record.method_ids = geoAllMethodIds;
    record.hook_ids = geoAllHookIds;
    record.hook_count = geoAllHookIds.length;
    record.method_count = geoAllMethodIds.length;
  }

  pensum.version = 'v5.3-canonical-natur-final';
  pensum.canonical_registry_version = 'naturpensum_v5_3';
  pensum.updated_at = TODAY;
  pensum.summary = {
    ...pensum.summary,
    materialized_domain_count: 12,
    partial_domain_count: 0,
    required_gap_domain_count: 0,
    current_emne_count: emner.length,
    current_method_count: methodsDoc.methods.length,
    current_mapping_count: mappings.length,
    current_topic_hook_count: fagkart.meta.hook_count,
    all_current_emners_have_mapping: true,
    all_current_method_refs_valid: true,
    editorial_complete: true
  };
  pensum.coverage_statement = 'Alle tolv canonicale Natur-områder er nå materialisert med emner, metoder, mappinger og redigerte kapitler. Sopp/lav/mikroorganismer er etablert som selvstendig biologisk fagområde, og geologi er utvidet fra landskapslaget til jordas indre, platetektonikk, vulkanisme, jordskjelv, stratigrafi, geokronologi, fossiler og naturhistorie. Natur oppfyller den universelle completion-regelen.';

  contract.version = '1.3.0';
  contract.updated_at = TODAY;
  contract.decision = 'Natur har nå tolv av tolv canonicale fagområder materialisert. Sluttfasen fullfører sopp/lav/mikroorganismer og utvider geologi til indre prosesser, geologisk tid, fossiler og naturhistorie uten å svekke det eksisterende miljølaget.';
  contract.completion_rule.current_result = 'complete';
  contract.current_state = {
    materialized_environment_domains: ['okosystem_mangfold_habitat', 'vann_hydrologi_kretslop', 'klima_energi_resiliens', 'urban_okologi_gronnstruktur', 'miljopavirkning_forvaltning_regenerasjon'],
    materialized_biology_domains: ['artskunnskap_systematikk', 'evolusjon_biologisk_mangfold', 'botanikk_vegetasjon', 'zoologi_dyreliv', 'sopp_lav_mikroorganismer', 'organismebiologi_fysiologi'],
    materialized_geology_domains: ['geologi_landskap_tid'],
    partial_domains: [],
    required_gap_domains: [],
    preserved_environment_layer_counts: { emner: 35, methods: 30, mappings: 35, hooks: 60, chapters: 6 },
    phase_1_biology_layer_counts: { emner: 18, methods: 9, mappings: 18, hooks: 30, chapters: 3 },
    phase_2_biology_layer_counts: { emner: 12, methods: 6, mappings: 12, hooks: 20, chapters: 2 },
    final_phase_layer_counts: { emner: 12, methods: 6, mappings: 12, hooks: 20, chapters_added: 1, chapters_rewritten: 1 },
    current_emne_count: emner.length,
    current_method_count: methodsDoc.methods.length,
    current_mapping_count: mappings.length,
    current_hook_count: fagkart.meta.hook_count,
    current_chapter_count: 12,
    editorial_status: 'complete'
  };

  const naturRegistry = registry.subjects.natur;
  naturRegistry.description = 'Et sammenhengende og universelt læreverk om økologi, artskunnskap, evolusjon, botanikk, zoologi, sopp, mikroorganismer, fysiologi, vann, klima, geologi, urban natur, miljøpåvirkning og forvaltning.';
  naturRegistry.canonicalModel.note = 'Emnetitler, definisjoner, fagområder og metodekoblinger leses fra canonical Natur v5.3 gjennom kompatibilitetsfilene. Registryet eier tolv redigerte lærekapitler og Natur er redaksjonelt complete.';
  naturRegistry.chapters = naturRegistry.chapters.filter((entry) => ![MICRO_DOMAIN.id, GEO_EXTENSION.id].includes(entry.id));

  const microChapter = chapterDocument(MICRO_CHAPTER, MICRO_DOMAIN.emners.map((entry) => entry.id));
  const geoChapter = geologyChapterDocument(GEO_CHAPTER, geoAllEmneIds);
  const chapterRows = [
    { domain: MICRO_DOMAIN, chapter: microChapter },
    { domain: GEO_EXTENSION, chapter: geoChapter }
  ];
  for (const { domain, chapter } of chapterRows) {
    const file = `data/fagverk/natur/${domain.id}.json`;
    writeJson(file, chapter);
    naturRegistry.chapters.push({
      id: domain.id,
      title: chapter.title,
      subtitle: chapter.subtitle,
      file,
      primary_domain_id: domain.id,
      emne_ids: chapter.emne_ids
    });
  }
  const order = new Map(pensum.domain_order.map((id, index) => [id, index]));
  naturRegistry.chapters.sort((left, right) => (order.get(left.primary_domain_id) ?? 99) - (order.get(right.primary_domain_id) ?? 99));

  const naturStatus = status.subjects.find((entry) => entry.id === 'natur');
  assert(naturStatus, 'Mangler Natur-status');
  naturStatus.navigationStatus = 'materialized';
  naturStatus.assessmentStatus = 'audited';
  naturStatus.editorialStatus = 'complete';
  naturStatus.nextGate = 'complete';
  naturStatus.note = 'Natur har tolv av tolv canonicale fagområder og tolv redigerte kapitler. Sopp/lav/mikroorganismer og geologiens indre prosesser og naturhistorie er materialisert med egne emner, metoder, mappinger og fagkart. Universell Natur-dekning er auditert og redaksjonelt complete.';

  let badge = fs.readFileSync(BADGE, 'utf8');
  badge = badge.replace(
    'Åpne Naturfaget</a> for å utforske 65 materialiserte emner, 45 metoder og elleve redigerte kapitler. Evolusjon og organismefysiologi er nå materialisert i fase 2; sopp/lav/mikroorganismer og full indre geologi gjenstår.',
    'Åpne Naturfaget</a> for å utforske 77 materialiserte emner, 51 metoder og tolv redigerte kapitler. Alle tolv canonicale Natur-områder er nå materialisert og auditert, inkludert sopp/lav/mikroorganismer og full geologi med indre prosesser og naturhistorie.'
  );
  assert(badge.includes('77 materialiserte emner, 51 metoder og tolv redigerte kapitler'), 'Merkesidens sluttstatus ble ikke oppdatert');
  fs.writeFileSync(BADGE, badge);

  assert(emner.length === 77, `Sluttfasen skal gi 77 emner, fikk ${emner.length}`);
  assert(methodsDoc.methods.length === 51, `Sluttfasen skal gi 51 metoder, fikk ${methodsDoc.methods.length}`);
  assert(mappings.length === 77, `Sluttfasen skal gi 77 mappingrader, fikk ${mappings.length}`);
  assert(fagkart.categories.length === 12, `Sluttfasen skal gi 12 fagkartkategorier, fikk ${fagkart.categories.length}`);
  assert(fagkart.meta.hook_count === 130, `Sluttfasen skal gi 130 hooks, fikk ${fagkart.meta.hook_count}`);
  assert(naturRegistry.chapters.length === 12, `Sluttfasen skal gi 12 kapitler, fikk ${naturRegistry.chapters.length}`);

  writeJson(P.emner, emner);
  writeJson(P.methods, methodsDoc);
  writeJson(P.mappings, mappings);
  writeJson(P.fagkart, fagkart);
  writeJson(P.pensum, pensum);
  writeJson(P.contract, contract);
  writeJson(P.registry, registry);
  writeJson(P.status, status);

  console.log(`Materialisert Natur sluttfase: ${emner.length} emner, ${methodsDoc.methods.length} metoder, ${mappings.length} mappingrader, ${fagkart.meta.hook_count} hooks og ${naturRegistry.chapters.length} kapitler. Status: complete.`);
}

main();
