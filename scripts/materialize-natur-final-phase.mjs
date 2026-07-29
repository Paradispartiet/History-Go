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
  chapterDocument
} from './materialize-natur-biology-phase-1.mjs';

const TODAY = '2026-07-29';
const VERSION = 'v5.3-canonical-complete';
const REGISTRY_VERSION = 'naturpensum_v5_3';

const MICRO_THINKERS = [
  { id: 'antonie_van_leeuwenhoek', name: 'Antonie van Leeuwenhoek', role: 'mikroskopiske organismer og observasjon', tier: 'core' },
  { id: 'louis_pasteur', name: 'Louis Pasteur', role: 'mikrobiologi og stoffomsetning', tier: 'core' },
  { id: 'robert_koch', name: 'Robert Koch', role: 'mikrobiologisk evidens og årsak', tier: 'core' },
  { id: 'heinrich_anton_de_bary', name: 'Heinrich Anton de Bary', role: 'soppbiologi og symbiose', tier: 'core' },
  { id: 'lynn_margulis', name: 'Lynn Margulis', role: 'mikrobielle samspill og endosymbiose', tier: 'core' }
];

const GEO_THINKERS = [
  { id: 'james_hutton', name: 'James Hutton', role: 'dyp tid og geologiske prosesser', tier: 'core' },
  { id: 'charles_lyell', name: 'Charles Lyell', role: 'geologisk aktualisme og langsomme prosesser', tier: 'core' },
  { id: 'alfred_wegener', name: 'Alfred Wegener', role: 'kontinentaldrift', tier: 'core' },
  { id: 'marie_tharp', name: 'Marie Tharp', role: 'havbunnskartlegging og platetektonikk', tier: 'core' },
  { id: 'inge_lehmann', name: 'Inge Lehmann', role: 'jordas indre og seismologi', tier: 'core' }
];

const MICRO_DOMAIN = {
  id: 'sopp_lav_mikroorganismer',
  label: 'Sopp, lav og mikroorganismer',
  shortLabel: 'Sopp og mikroliv',
  definition: 'Domenet behandler soppriket, lav som symbiotiske systemer, bakterier, arkeer og protister, og undersøker hvordan mikroskopisk liv omsetter stoff, inngår i symbioser, bryter ned organisk materiale og former økosystemer.',
  focus: ['sopp', 'lav', 'bakterier', 'arkeer', 'protister', 'mikrobiell økologi'],
  questionRole: 'Start i dokumentert organisme, struktur eller miljøprøve; skill arts- eller gruppeidentifikasjon fra funksjon, stoffomsetning og økologisk rolle, og gjør metodebegrensning synlig.',
  tagline: 'Hvordan sopp, lav og mikroskopiske organismer lever, samhandler og driver stoffomsetning i naturen.',
  thinkers: MICRO_THINKERS,
  comparisonPairs: [['heinrich_anton_de_bary', 'lynn_margulis'], ['antonie_van_leeuwenhoek', 'louis_pasteur']],
  methods: ['met_natur_sopp_lav_bestemmelse', 'met_natur_mikroskopi_mikroliv', 'met_natur_mikrobiom_metastrekkoding'],
  emners: [
    {
      id: 'em_natur_sopp_morfologi_livssyklus', title: 'Sopp: morfologi, ernæring og livssyklus', short: 'Soppbiologi', level: 1,
      definition: 'Emnet undersøker hyfer, mycel, fruktlegemer, sporer og heterotrof ernæring hos sopp, og skiller organismens vegetative nettverk fra de synlige strukturene som brukes ved formering og artsbestemmelse.',
      why: 'Et fruktlegeme er bare én del av soppen, og presis forståelse av mycel, spredning og ernæring er nødvendig for å forklare både artsfunn, nedbrytning og symbiotiske relasjoner.',
      concepts: ['hyfe','mycel','fruktlegeme','spore','heterotrofi','saprotrof','parasitt','mykorrhiza'],
      questions: ['Hvilke strukturer dokumenterer at organismen er en sopp, og hvilke deler er synlige i prøven?', 'Hvordan skaffer soppen karbon og næring i den aktuelle livsformen?', 'Hvilket livsstadium eller formeringsspor er dokumentert, og hva kan ikke bestemmes sikkert?'],
      conflicts: ['fruktlegeme vs hele organismen','morfologisk likhet vs sikker artsbestemmelse','nedbryterrolle vs symbiotisk eller parasittisk livsform'],
      distinctions: ['hyfe vs mycel','fruktlegeme vs organisme','saprotrof vs symbiont'],
      hooks: ['sopp_fruktlegemer','mycel_nettverk','sporer_livssyklus'], methods: ['met_natur_sopp_lav_bestemmelse','met_natur_mikroskopi_mikroliv'], places: ['skog','park','død ved','museumssamling']
    },
    {
      id: 'em_natur_lav_symbiose_okologi', title: 'Lav: symbiose, form og økologi', short: 'Lav', level: 2,
      definition: 'Emnet undersøker lav som stabilt samliv mellom sopp og fotosyntetiserende partner, hvordan thallus og formeringsstrukturer varierer, og hvordan arter fordeles etter substrat, fuktighet, lys, luftkvalitet og kontinuitet.',
      why: 'Lav kan ikke forstås som én organismegruppe med én funksjon; samlivet, substratet og langsom vekst gjør lav nyttig både for artskunnskap, symbiose og miljøtolkning når indikatorpåstander brukes forsiktig.',
      concepts: ['lav','thallus','fotobiont','mykobiont','symbiose','soredier','isidier','substrat'],
      questions: ['Hvilke morfologiske trekk og substratdata støtter bestemmelsen av laven?', 'Hva bidrar sopp- og fotosyntesepartneren med i symbiosen?', 'Kan forekomsten brukes som miljøindikator her, og hvilke andre forhold må kontrolleres?'],
      conflicts: ['lav som individ vs symbiotisk system','indikatorart vs entydig miljømåler','substratpreferanse vs regional utbredelse'],
      distinctions: ['mykobiont vs fotobiont','bladlav vs busklav vs skorpelav','forekomst vs indikatorverdi'],
      hooks: ['lav_symbiose','lav_miljoindikator'], methods: ['met_natur_sopp_lav_bestemmelse','met_natur_mikroskopi_mikroliv'], places: ['gammelskog','bergvegg','bytre','kystberg']
    },
    {
      id: 'em_natur_bakterier_arkeer_celle_metabolisme', title: 'Bakterier og arkeer: celler og metabolisme', short: 'Prokaryoter', level: 1,
      definition: 'Emnet sammenligner bakterier og arkeer som prokaryote cellelinjer og undersøker cellemembran, cellevegg, genetisk materiale, vekst og mangfoldige energistrategier uten å redusere mikroorganismer til sykdomsframkallere.',
      why: 'Bakterier og arkeer driver sentrale kjemiske omsetninger i jord, vann og organismer, og forståelse av cellebygning og metabolisme er nødvendig for å tolke mikrobielle prosesser utover medisinske eksempler.',
      concepts: ['bakterie','arkee','prokaryot','cellemembran','cellevegg','ribosom','binær fisjon','metabolisme'],
      questions: ['Hvilke celle- eller molekylære data skiller gruppen som undersøkes?', 'Hvilken energi- og karbonkilde bruker organismene under de dokumenterte forholdene?', 'Hvordan skilles målt metabolsk aktivitet fra antatt artsidentitet eller økologisk funksjon?'],
      conflicts: ['prokaryot likhet vs evolusjonær forskjell','tilstedeværelse vs aktivitet','mikrobe vs patogen'],
      distinctions: ['bakterie vs arkee','celleidentitet vs metabolsk funksjon','forekomst vs aktivitet'],
      hooks: ['prokaryot_celle','mikrobiell_metabolisme'], methods: ['met_natur_mikroskopi_mikroliv','met_natur_mikrobiom_metastrekkoding'], places: ['jordprøve','ferskvann','saltvann','naturhistorisk laboratorium']
    },
    {
      id: 'em_natur_protister_encellede_eukaryoter', title: 'Protister og encellede eukaryoter', short: 'Protister', level: 2,
      definition: 'Emnet undersøker mangfoldet av hovedsakelig encellede eukaryoter gjennom celleorganeller, bevegelse, ernæring, fotosyntese og livssykluser, og viser hvorfor protister ikke utgjør én enkel naturlig gruppe.',
      why: 'Protister kobler mikrobiologi til evolusjon, næringsnett og vannmiljø, men stor morfologisk og genetisk variasjon gjør at observasjon i mikroskop ikke automatisk gir sikker artsbestemmelse.',
      concepts: ['protist','eukaryot','cilier','flagell','pseudopodium','fagocytose','fotosyntese','plankton'],
      questions: ['Hvilke celleorganeller og bevegelses- eller ernæringstrekk er dokumentert?', 'Hvordan inngår organismen i næringsnett eller primærproduksjon i prøvemiljøet?', 'På hvilket taksonomisk nivå kan observasjonen bestemmes sikkert med tilgjengelige data?'],
      conflicts: ['morfotype vs takson','fotosyntetisk protist vs plantebegrep','mikroskopisk observasjon vs genetisk identifikasjon'],
      distinctions: ['prokaryot vs eukaryot','protist vs én naturlig klade','morfotype vs art'],
      hooks: ['protister_mikroliv'], methods: ['met_natur_mikroskopi_mikroliv','met_natur_mikrobiom_metastrekkoding'], places: ['dam','innsjø','fjæresone','mikroskopilaboratorium']
    },
    {
      id: 'em_natur_mikrober_nedbrytning_kretslop', title: 'Mikrober, nedbrytning og stoffkretsløp', short: 'Mikrobiell nedbrytning', level: 2,
      definition: 'Emnet kobler sopp og mikroorganismer til nedbrytning, mineralisering og omsetning av karbon, nitrogen og andre stoffer, og skiller organismeforekomst fra målt prosesshastighet og miljøbetingelser.',
      why: 'Stoffkretsløp drives av konkrete biologiske og kjemiske prosesser, og mikrobiell aktivitet bestemmer hvor raskt organisk materiale brytes ned og næringsstoffer blir tilgjengelige eller bundet.',
      concepts: ['nedbrytning','mineralisering','karbonkretsløp','nitrogenkretsløp','respirasjon','enzym','anaerob prosess','redoks'],
      questions: ['Hvilket organisk eller uorganisk stoff omsettes, og hvordan er prosessen målt?', 'Hvilke sopp- eller mikrobielle grupper kan bidra under de aktuelle miljøforholdene?', 'Hvordan påvirker temperatur, oksygen, fuktighet og substrat prosesshastigheten?'],
      conflicts: ['artsforekomst vs prosessrate','aerob vs anaerob omsetning','korrelasjon med miljø vs dokumentert mekanisme'],
      distinctions: ['nedbrytning vs mineralisering','organismeidentitet vs funksjon','lager vs fluks'],
      hooks: ['nedbrytere_kretslop','mikrobiell_metabolisme'], methods: ['met_natur_mikroskopi_mikroliv','met_natur_mikrobiom_metastrekkoding'], places: ['kompost','skogbunn','våtmark','sediment']
    },
    {
      id: 'em_natur_mikrobiom_miljomikrobiologi', title: 'Mikrobiom og miljømikrobiologi', short: 'Mikrobiom', level: 3,
      definition: 'Emnet undersøker mikrobielle samfunn i jord, vann og vertsorganismer med sekvensbaserte og mikroskopiske data, og skiller taksonomisk profil, funksjonell kapasitet og faktisk aktivitet i et dynamisk mikrobiom.',
      why: 'Moderne miljødata kan avdekke stort skjult mangfold, men DNA-spor viser ikke nødvendigvis levende eller aktive organismer og krever kontroll for prøvetaking, referansedatabaser og kontaminasjon.',
      concepts: ['mikrobiom','mikrobielt samfunn','metastrekkoding','miljø-DNA','sekvensvariant','referansedatabase','kontaminasjon','funksjonell profil'],
      questions: ['Hvordan er prøven tatt, bevart og koblet til sted og miljøbetingelser?', 'Hva viser sekvens- eller mikroskopidata om sammensetning, og på hvilket taksonomisk nivå?', 'Kan dataene si noe om aktivitet eller funksjon, eller bare om genetisk tilstedeværelse?'],
      conflicts: ['DNA-tilstedeværelse vs levende aktivitet','relativ sekvensandel vs faktisk biomasse','referansedatabase vs ukjent mangfold'],
      distinctions: ['mikrobiom vs enkeltart','metastrekkoding vs funksjonsmåling','DNA-spor vs aktivitet'],
      hooks: ['mikrobiom_edna'], methods: ['met_natur_mikrobiom_metastrekkoding','met_natur_mikroskopi_mikroliv'], places: ['jordprofil','innsjø','våtmark','forskningslaboratorium']
    }
  ],
  hooks: [
    ['sopp_fruktlegemer','Soppens fruktlegemer','Hvilke synlige strukturer dokumenterer formering, og hva sier fruktlegemet ikke om hele mycelets utbredelse?',['dokumentert fruktlegeme med foto og dato','substrat, habitat og morfologiske kjennetegn','kontroll mot relevante forvekslingsarter']],
    ['mycel_nettverk','Mycel og hyfenettverk','Hvordan er hyfer og mycel knyttet til substrat, næringsopptak og organismens utbredelse?',['mikroskopiske eller makroskopiske hyfestrukturer','substrat og vekststed','uavhengig arts- eller funksjonskontroll']],
    ['sporer_livssyklus','Sporer og livssyklus','Hvilket livsstadium og hvilken spredningsmåte dokumenteres av sporene eller formeringsstrukturene?',['spore- eller strukturmorfologi','livsstadium og årstid','sammenligning med artens dokumenterte livssyklus']],
    ['lav_symbiose','Lav som symbiose','Hvilke partnere inngår i laven, og hvilke strukturer eller data viser deres funksjonelle samliv?',['thallus og formeringsstrukturer','dokumentert sopp- og fotobiontpartner','substrat, lys og fuktighet']],
    ['lav_miljoindikator','Lav og miljøindikasjon','Kan lavforekomsten støtte en miljøtolkning, og hvilke andre faktorer kan forklare mønsteret?',['artsbestemt eller gruppedokumentert lav','standardisert forekomst eller dekning','luft, fuktighet, substrat og kontinuitet']],
    ['prokaryot_celle','Bakterier og arkeer','Hvilke celle- eller molekylære trekk skiller gruppene, og hvilket nivå kan prøven identifiseres til?',['mikroskopi eller sekvensdata','celle- eller markørtrekk','prøveopphav og kontroll for kontaminasjon']],
    ['mikrobiell_metabolisme','Mikrobiell metabolisme','Hvilken energi- og stoffomsetning er målt, og hvilke organismer kan faktisk bære prosessen?',['målt gass-, kjemi- eller stoffendring','temperatur, oksygen og substrat','taksonomiske data og alternative prosesser']],
    ['protister_mikroliv','Protister og mikroliv','Hvilke eukaryote mikroorganismer observeres, og hvilke trekk støtter funksjon eller bestemmelse?',['mikroskopibilde med målestokk','bevegelse, organeller eller pigment','prøvemiljø og taksonomisk referanse']],
    ['nedbrytere_kretslop','Nedbrytere og stoffkretsløp','Hvordan kobles sopp og mikrober til målbar nedbrytning eller mineralisering i prøven?',['substrat og masse- eller kjemiendring','mikrobiell eller soppfaglig dokumentasjon','miljøforhold og tidsserie']],
    ['mikrobiom_edna','Mikrobiom og miljø-DNA','Hva viser sekvensprofilen om samfunnets sammensetning, og hva kan den ikke si om aktivitet?',['prøvedesign og sekvensmetadata','taksonomiske treff og referansegrunnlag','kontaminasjonskontroll og miljødata']]
  ]
};

const GEO_DOMAIN = {
  id: 'geologi_landskap_tid',
  label: 'Geologi og naturhistorie',
  shortLabel: 'Geologi',
  definition: 'Domenet kobler mineraler og bergarter til jordas indre, platetektonikk, magmatiske og metamorfe prosesser, jordskjelv, sedimentasjon, fossiler og geologisk tid, og videre til istider, erosjon og dagens landskap.',
  focus: ['mineraler og bergarter','jordas indre','platetektonikk','vulkanisme og metamorfose','jordskjelv og seismologi','stratigrafi og geologisk tid'],
  questionRole: 'Identifiser materiale og struktur før prosess tolkes, skill relative hendelsesforløp fra absolutte dateringer, og bruk flere uavhengige geologiske spor når jordas indre eller fortid rekonstrueres.',
  tagline: 'Hvordan jordas materialer, indre prosesser og dype historie bygger berggrunn, kontinenter og landskap.',
  thinkers: GEO_THINKERS,
  comparisonPairs: [['james_hutton','charles_lyell'],['alfred_wegener','marie_tharp']],
  methods: ['met_natur_mineral_bergartsbestemmelse','met_natur_struktur_plateanalyse','met_natur_stratigrafisk_tidsanalyse'],
  emners: [
    {
      id:'em_natur_mineraler_bergarter_kretslop', title:'Mineraler, bergarter og bergartenes kretsløp', short:'Bergarter', level:1,
      definition:'Emnet undersøker mineralers egenskaper, hvordan magmatiske, sedimentære og metamorfe bergarter dannes og gjenkjennes, og hvordan smelting, krystallisering, erosjon, sedimentasjon og metamorfose kobler dem i bergartenes kretsløp.',
      why:'Bergarter er historiske materialer, ikke bare steintyper; mineralinnhold, tekstur og struktur gir spor etter dannelsesmiljø og senere omforming som må skilles fra overflateforvitring.',
      concepts:['mineral','krystall','hardhet','magmatisk bergart','sedimentær bergart','metamorf bergart','tekstur','bergartenes kretsløp'],
      questions:['Hvilke mineral- og teksturegenskaper er dokumentert i prøven?','Hvilken dannelsesprosess og bergartstype støttes av egenskapene?','Hvilke senere prosesser kan ha omformet eller forvitret materialet?'],
      conflicts:['feltidentifikasjon vs laboratoriebestemmelse','bergartstype vs dannelsesmiljø','primær tekstur vs senere omforming'],
      distinctions:['mineral vs bergart','bergartstype vs prosess','forvitring vs metamorfose'],
      hooks:['mineral_egenskaper','bergartenes_kretslop'], methods:['met_natur_mineral_bergartsbestemmelse','met_natur_geologisk_analyse'], places:['bergskjæring','museumssamling','steinbrudd','kystberg']
    },
    {
      id:'em_natur_jordas_indre_platetektonikk', title:'Jordas indre og platetektonikk', short:'Platetektonikk', level:2,
      definition:'Emnet forklarer jordas lagdeling og hvordan litosfæreplater beveger seg over tid, med havbunnsspredning, subduksjon og kontinentkollisjon som prosesser som knytter globale mønstre i topografi, vulkanisme og jordskjelv sammen.',
      why:'Platetektonikk er en samlende geologisk modell, men jordas indre observeres i stor grad indirekte gjennom seismiske data, gravitasjon, varme og bergarter, så evidenskjedene må være eksplisitte.',
      concepts:['jordskorpe','mantel','kjerne','litosfære','astenosfære','plate','havbunnsspredning','subduksjon'],
      questions:['Hvilke observasjoner støtter inndelingen av jordas indre i det aktuelle tilfellet?','Hvilken type plategrense og bevegelse forklarer de dokumenterte strukturene?','Hvilke alternative eller lokale prosesser må skilles fra den plate-tektoniske modellen?'],
      conflicts:['direkte observasjon vs geofysisk inferens','platebevegelse vs lokal deformasjon','kontinentaldriftshypotese vs moderne platetektonikk'],
      distinctions:['skorpe vs litosfære','mantel vs astenosfære','plategrense vs forkastning'],
      hooks:['jordas_lag','plategrenser'], methods:['met_natur_struktur_plateanalyse','met_natur_geologisk_analyse'], places:['midthavsryggmodell','fjellkjede','geologisk museum','berggrunnskart']
    },
    {
      id:'em_natur_magma_vulkanisme_metamorfose', title:'Magma, vulkanisme og metamorfose', short:'Magma og metamorfose', level:2,
      definition:'Emnet undersøker hvordan bergarter smelter delvis, magma utvikles og størkner, hvordan vulkanutbrudd varierer med sammensetning og gass, og hvordan trykk, temperatur og fluider omdanner bergarter uten full smelting.',
      why:'Magmatiske og metamorfe bergarter registrerer ulike temperatur-, trykk- og kjemiforhold, og presis tolkning hindrer at all varmeomforming blir kalt vulkanisme eller at smelting forveksles med metamorfose.',
      concepts:['magma','lava','krystallisering','viskositet','vulkanisme','metamorfose','foliasjon','metamorf facies'],
      questions:['Hvilke mineraler, teksturer eller strukturer viser magmatisk eller metamorf prosess?','Hvilke temperatur-, trykk- eller sammensetningsforhold er forenlige med materialet?','Kan den observerte strukturen skyldes senere deformasjon eller forvitring i stedet?'],
      conflicts:['magma vs lava','smelting vs metamorfose','utbruddsform vs magmasammensetning alene'],
      distinctions:['intrusiv vs ekstrusiv','magma vs lava','metamorfose vs smelting'],
      hooks:['magma_vulkanisme','metamorfose'], methods:['met_natur_mineral_bergartsbestemmelse','met_natur_struktur_plateanalyse'], places:['vulkansk bergartssamling','bergskjæring','fjellkjede','museum']
    },
    {
      id:'em_natur_jordskjelv_forkastninger_seismologi', title:'Jordskjelv, forkastninger og seismologi', short:'Jordskjelv', level:2,
      definition:'Emnet kobler elastisk deformasjon og brudd langs forkastninger til jordskjelv, skiller magnitude fra intensitet og bruker P- og S-bølger, ankomsttider og bølgebaner til å undersøke både hendelser og jordas indre.',
      why:'Jordskjelvdata er sentrale for både naturfare og kunnskap om jordas struktur, men episenter, magnitude, lokal risting og skade beskriver forskjellige størrelser og må ikke blandes.',
      concepts:['forkastning','spenning','elastisk tilbakefjæring','hypocenter','episenter','magnitude','intensitet','P-bølge','S-bølge'],
      questions:['Hvilken forkastningsgeometri og bevegelse er dokumentert?','Hvordan er jordskjelvets sted og størrelse bestemt fra seismiske data?','Hva kan bølgebaner og hastigheter si om materialer i jordas indre?'],
      conflicts:['magnitude vs intensitet','episenter vs hypocenter','skadeomfang vs jordskjelvets energi'],
      distinctions:['P-bølge vs S-bølge','magnitude vs intensitet','forkastning vs plategrense'],
      hooks:['forkastninger_jordskjelv','seismiske_bolger'], methods:['met_natur_struktur_plateanalyse','met_natur_stratigrafisk_tidsanalyse'], places:['seismologisk stasjon','forkastningssone','geologisk museum','regionalt kart']
    },
    {
      id:'em_natur_sedimentasjon_stratigrafi_fossiler', title:'Sedimentasjon, stratigrafi og fossiler', short:'Stratigrafi', level:2,
      definition:'Emnet undersøker hvordan sedimenter avsettes og omdannes til bergart, hvordan lagfølge, erosjonsflater og skjærende relasjoner brukes til relativ datering, og hvordan fossiler og sedimentære strukturer dokumenterer tidligere miljøer og liv.',
      why:'Lag og fossiler er tidsarkiver, men de er ufullstendige og påvirket av erosjon, manglende avsetning og bevaringsskjevhet, så fravær i en lagserie er ikke automatisk fravær i fortiden.',
      concepts:['sediment','diagenese','lag','stratigrafi','superposisjon','diskordans','fossil','lederfossil','avsetningsmiljø'],
      questions:['Hvilken lagrekkefølge og hvilke avsetningsstrukturer er dokumentert?','Hvilke relative aldersforhold følger av superposisjon, skjæring eller fossiler?','Hvilke hull eller bevaringsskjevheter begrenser rekonstruksjonen av miljø og liv?'],
      conflicts:['avsetningsrekkefølge vs nåværende orientering','fossilfravær vs biologisk fravær','relativ alder vs absolutt alder'],
      distinctions:['sediment vs sedimentær bergart','fossil vs bergart','relativ vs absolutt datering'],
      hooks:['stratigrafi_fossiler'], methods:['met_natur_stratigrafisk_tidsanalyse','met_natur_mineral_bergartsbestemmelse'], places:['fossilsamling','sedimentær bergskjæring','elveavsetning','naturhistorisk museum']
    },
    {
      id:'em_natur_geologisk_tid_jord_liv_historie', title:'Geologisk tid og jordas og livets historie', short:'Geologisk tid', level:3,
      definition:'Emnet organiserer jordas historie i geologiske tidsenheter og kombinerer radiometriske dateringer, stratigrafi, fossiler og geologiske hendelser for å rekonstruere kontinenter, klima, masseutdøinger og livets langsiktige utvikling.',
      why:'Dyp tid krever flere daterings- og korrelasjonsmetoder; tidsperioder er faglige inndelinger av en kontinuerlig historie, og ett fossil eller én datering kan ikke alene bære en global rekonstruksjon.',
      concepts:['geologisk tidsskala','eon','æra','periode','radiometrisk datering','halveringstid','masseutdøing','paleoklima'],
      questions:['Hvilken dateringsmetode eller stratigrafisk korrelasjon plasserer hendelsen i tid?','Hvordan kobles lokale bergarter eller fossiler til den globale geologiske tidsskalaen?','Hvilke usikkerheter og manglende intervaller påvirker rekonstruksjonen av jordas og livets historie?'],
      conflicts:['lokal lagserie vs global tidsskala','dateringspresisjon vs geologisk varighet','tidsgrense vs gradvis prosess'],
      distinctions:['relativ vs radiometrisk datering','alder på mineral vs alder på hendelse','periodegrense vs hendelsesforløp'],
      hooks:['geologisk_tid'], methods:['met_natur_stratigrafisk_tidsanalyse','met_natur_mineral_bergartsbestemmelse'], places:['naturhistorisk museum','fossilsamling','berggrunnsprofil','geologisk kartarkiv']
    }
  ],
  hooks: [
    ['mineral_egenskaper','Mineraler og egenskaper','Hvilke målbare egenskaper identifiserer mineralet, og hvilke tester er diagnostiske framfor bare typiske?',['prøve med dokumentert proveniens','hardhet, strek, spaltning eller optiske trekk','kontroll mot forvekslingsmineraler']],
    ['bergartenes_kretslop','Bergartenes kretsløp','Hvilke prosesser dannet og senere omformet bergarten gjennom smelting, størkning, erosjon, sedimentasjon eller metamorfose?',['bergartstype og tekstur','mineralogi og strukturer','geologisk kontekst og hendelsesrekkefølge']],
    ['jordas_lag','Jordas indre lag','Hvilke seismiske, geofysiske og petrologiske data støtter modellen av skorpe, mantel og kjerne?',['seismiske hastigheter og bølgebaner','tetthet, gravitasjon eller varme','bergarts- og mineralfysisk sammenligning']],
    ['plategrenser','Plategrenser og bevegelse','Hvilke globale og lokale mønstre viser divergens, konvergens eller sideforskyvning mellom litosfæreplater?',['jordskjelv- og vulkanbelter','havbunn, topografi og alder','GPS eller geologiske strukturer']],
    ['magma_vulkanisme','Magma og vulkanisme','Hvordan kobles magmas sammensetning, temperatur og gassinnhold til intrusjoner, lava og utbruddsstil?',['bergarts- og mineraldata','utbruddsprodukter og teksturer','plate- eller varmepunktkontekst']],
    ['metamorfose','Metamorfose','Hvilke mineraler og strukturer registrerer trykk, temperatur og deformasjon uten full smelting?',['metamorfe mineraler og teksturer','foliasjon eller lineasjon','regional struktur og trykk-temperaturkontekst']],
    ['forkastninger_jordskjelv','Forkastninger og jordskjelv','Hvordan viser bruddgeometri, forskyvning og seismisitet hvilken spenning og bevegelse som har virket?',['forkastningsflate eller kartlagt struktur','jordskjelvparametere og mekanisme','regional tektonisk kontekst']],
    ['seismiske_bolger','Seismiske bølger','Hvordan brukes P- og S-bølgers hastighet, brytning og fravær til å undersøke jordas indre?',['seismogram og ankomsttider','bølgetype og bane','modell for materialegenskaper og grenseflater']],
    ['stratigrafi_fossiler','Stratigrafi og fossiler','Hvilken hendelsesrekkefølge og hvilket tidligere miljø støttes av lag, strukturer og fossiler?',['målt lagfølge og kontaktflater','fossiler eller sedimentære strukturer','korrelasjon og bevaringsusikkerhet']],
    ['geologisk_tid','Geologisk tid','Hvordan kombineres relative og absolutte dateringer til en etterprøvbar tidsplassering av bergarter og hendelser?',['stratigrafisk relasjon','radiometrisk eller annen absolutt datering','usikkerhet og korrelasjon til tidsskala']]
  ]
};

const METHOD_SPECS = [
  ['met_natur_sopp_lav_bestemmelse','Sopp- og lavbestemmelse','Bestemmer sopp og lav med makro- og mikromorfologiske kjennetegn, substrat, habitat, relevant nøkkel og dokumentert sikkerhetsgrad, og skiller feltgjenkjenning fra etterprøvbar taksonomisk identifikasjon.','sopp_lav_mikroorganismer',['foto eller belegg av fruktlegeme eller thallus','makro- og mikroskopiske diagnostiske trekk','substrat, habitat, dato og lokalitet'],['Avgrens gruppe, livsstadium og egnet bestemmelseslitteratur.','Dokumenter form, mål, substrat og nødvendige mikroskopiske trekk.','Sammenlign med relevante forvekslingsarter og oppgi laveste sikre nivå.'],['Mange arter krever mikroskopi eller kjemiske/genetiske data for sikker bestemmelse.','Fruktlegemer og lavstrukturer varierer med alder, vær og substrat.']],
  ['met_natur_mikroskopi_mikroliv','Mikroskopi av mikroliv','Undersøker dokumenterte miljøprøver med lysmikroskopi for å beskrive cellestørrelse, form, bevegelse og synlige strukturer uten å gjøre arts- eller funksjonskonklusjoner som oppløsningen ikke støtter.','sopp_lav_mikroorganismer',['miljøprøve med sted, dato og prøvetype','mikroskopibilder med målestokk og forstørrelse','morfotype-, bevegelses- og strukturregistrering'],['Dokumenter prøveopphav og preparering før observasjon.','Kalibrer målestokk og registrer flere synsfelt systematisk.','Beskriv morfotyper og synlige prosesser før taksonomisk tolkning.','Kontroller tolkningen mot referansemateriale eller uavhengig metode.'],['Lysmikroskopi skiller ofte ikke nærstående mikroorganismer til art.','Preparering, fokusplan og tilfeldig prøveuttak kan endre det observerte samfunnsbildet.']],
  ['met_natur_mikrobiom_metastrekkoding','Mikrobiom- og metastrekkodingsanalyse','Analyserer sekvensbaserte profiler fra miljøprøver for å sammenligne mikrobielle og soppdominerte samfunn, med eksplisitt kontroll for prøvebehandling, markør, referansedatabase, kontaminasjon og forskjellen mellom DNA-tilstedeværelse og aktivitet.','sopp_lav_mikroorganismer',['prøve-ID, sted, tidspunkt og miljømetadata','sekvensvarianter eller taksonomiske profiler','negative kontroller, markørinformasjon og referansedatabase'],['Definer prøvedesign, kontroller og biologisk spørsmål før sekvensering.','Filtrer tekniske feil og kontaminasjon og dokumenter bioinformatisk terskel.','Tilordne taksonomi med oppgitt database og usikkerhet.','Sammenlign samfunn med lik prøvetakings- og analyseinnsats.'],['Sekvensandel er ikke direkte mål på celleantall eller biomasse.','DNA kan komme fra døde eller inaktive organismer, og referansedatabaser er ufullstendige.']],
  ['met_natur_mineral_bergartsbestemmelse','Mineral- og bergartsbestemmelse','Identifiserer mineraler og bergarter gjennom dokumentert proveniens, mineralogi, tekstur, struktur og diagnostiske fysiske egenskaper, og skiller feltklassifikasjon fra laboratoriebekreftet sammensetning.','geologi_landskap_tid',['bergarts- eller mineralprøve med proveniens','hardhet, strek, spaltning, kornstørrelse og tekstur','lupe-, mikroskopi- eller kjemidata ved behov'],['Beskriv prøve og geologisk kontekst før navn settes.','Test diagnostiske egenskaper systematisk og dokumenter resultatene.','Klassifiser mineraler og bergart mot relevante alternativer.','Rapporter usikkerhet og hvilke laboratoriedata som kan avklare prøven.'],['Forvitring kan skjule primære mineraler og teksturer.','Feltkjennetegn alene skiller ikke alltid finkornede eller kjemisk like bergarter.']],
  ['met_natur_struktur_plateanalyse','Struktur- og plateanalyse','Sammenstiller geologiske strukturer, topografi, havbunnsalder, jordskjelv, vulkanisme og bevegelsesdata for å teste tektoniske forklaringer på lokal og regional skala uten å gjøre platebevegelse til standardforklaring på all deformasjon.','geologi_landskap_tid',['geologisk strukturkart og profiler','jordskjelv-, vulkan- eller GPS-data','topografi, batymetri og aldersdata'],['Avgrens struktur, region og tidsrom før mekanisme foreslås.','Kartlegg orientering, forskyvning og uavhengige tektoniske indikatorer.','Sammenlign mønsteret med forventninger ved ulike plategrenser eller lokal deformasjon.','Rapporter skala, datatetthet og alternative strukturelle modeller.'],['Lokale forkastninger kan ha annen geometri enn den regionale platebevegelsen.','Dagens bevegelsesdata kan ikke alene rekonstruere hele den geologiske historien.']],
  ['met_natur_stratigrafisk_tidsanalyse','Stratigrafisk og geokronologisk analyse','Rekonstruerer hendelsesrekkefølge og alder fra lagfølge, skjærende relasjoner, fossiler og absolutte dateringer, med eksplisitt skille mellom alder på mineral, bergart, avsetning og senere geologisk hendelse.','geologi_landskap_tid',['målt stratigrafisk profil og kontaktforhold','fossiler eller korrelasjonsmarkører','radiometrisk alder med mineral, metode og usikkerhet'],['Dokumenter lag, kontakter og strukturelle relasjoner i riktig geometrisk rekkefølge.','Etabler relativ hendelsesrekkefølge før absolutte tall brukes.','Koble eventuelle dateringer til materialet og hendelsen de faktisk daterer.','Korrelér bare lag eller hendelser når flere uavhengige kriterier støtter sammenhengen.'],['Erosjon og manglende avsetning skaper hull i lagrekken.','Radiometriske dateringer kan registrere krystallisering eller senere omkrystallisering fremfor hendelsen som ønskes datert.']]
];

const MICRO_CHAPTER = {
  id:'sopp_lav_mikroorganismer', title:'Sopp, lav og mikroorganismer', subtitle:'Fra mycel og symbiose til mikrobielle samfunn og stoffkretsløp',
  lead:'Mye av naturens biologiske aktivitet skjer uten at organismene er lette å se. Sopp bygger mycel gjennom jord og ved, lav organiserer et langvarig samliv mellom sopp og fotosyntetiske partnere, og bakterier, arkeer og protister driver omsetning i vann, jord og levende organismer. Kapittelet kobler synlige strukturer, mikroskopi og sekvensdata til funksjon uten å gjøre tilstedeværelse til aktivitet eller gjenkjennelse til sikker bestemmelse.',
  learningObjectives:['skille fruktlegeme, mycel og sporer i soppenes livssyklus','forklare lav som symbiotisk system og vurdere indikatorbruk kritisk','sammenligne bakterier, arkeer og encellede eukaryoter','koble mikrobielle prosesser til nedbrytning og stoffkretsløp','tolke mikroskopi med eksplisitt oppløsnings- og bestemmelsesusikkerhet','tolke mikrobiom- og miljø-DNA-data uten å forveksle DNA med aktivitet'],
  sections:[
    ['sopp','1. Sopp er nettverk, ikke bare fruktlegemer',['Sopp består ofte av forgrenede hyfer som danner et mycel i jord, ved eller annet substrat. Fruktlegemet er en reproduktiv struktur og kan være kortlivet sammenlignet med mycelet.','Sopp er heterotrofe og tar opp næring etter at enzymer har brutt ned materiale utenfor cellene. Arter kan være nedbrytere, parasitter eller inngå i symbioser som mykorrhiza.','Bestemmelse krever relevante makro- og mikroskopiske trekk, substrat og kontroll mot forvekslingsarter; helhetsinntrykk alene er ikke nok.']],
    ['lav','2. Lav er et symbiotisk system',['Lav består av en soppkomponent sammen med én eller flere fotosyntetiske partnere. Samspillet danner et thallus med egenskaper ingen av partnerne uttrykker alene.','Skorpelav, bladlav og busklav beskriver vekstformer, ikke hele slektskapet. Formeringsstrukturer, kjemi og mikroskopiske trekk kan være nødvendige for sikker bestemmelse.','Lav reagerer på substrat, fuktighet, lys, kontinuitet og luftmiljø. Indikatorbruk må derfor kontrollere flere miljøfaktorer før én årsak tilskrives forekomsten.']],
    ['mikrober','3. Bakterier, arkeer og protister',['Bakterier og arkeer mangler cellekjerne, men representerer dype og forskjellige evolusjonære linjer med stort metabolsk mangfold. De kan hente energi fra lys, organiske stoffer eller uorganiske kjemiske reaksjoner.','Protister er eukaryote mikroorganismer med stor variasjon i fotosyntese, bevegelse og ernæring. Gruppen er praktisk, men er ikke én enkel naturlig klade.','Mikroskopi viser celler, bevegelse og morfotyper innen instrumentets oppløsning. Artsnivå og funksjon krever ofte andre data.']],
    ['kretslop','4. Mikroliv driver stoffkretsløp',['Sopp og mikroorganismer bryter ned organisk materiale og frigjør eller binder næringsstoffer. Temperatur, oksygen, vann og substrat påvirker hvilke prosesser som kan dominere.','Karbon- og nitrogenomsetning må beskrives som målbare flukser eller kjemiske endringer. At en organisme finnes i prøven dokumenterer ikke alene at den driver den målte prosessen.','Anaerobe miljøer kan ha helt andre mikrobielle energiveier enn oksygenrike miljøer, og redoksforhold er derfor en sentral del av forklaringen.']],
    ['mikrobiom','5. Mikrobiom, sekvensdata og usikkerhet',['Metastrekkoding og miljø-DNA kan kartlegge mange organismer samtidig gjennom genetiske markører. Resultatet avhenger av prøveuttak, DNA-ekstraksjon, markørvalg, bioinformatikk og referansedatabase.','Sekvensandeler er relative signaler og kan ikke uten videre tolkes som biomasse. DNA kan dessuten finnes etter at organismen er død eller ikke lenger aktiv.','Sterke miljømikrobiologiske slutninger kombinerer derfor samfunnsdata med kjemi, prosessmålinger, mikroskopi eller andre uavhengige spor.']]
  ],
  concepts:[['mycel','Mycel','Nettverk av sopphyfer som utgjør den vegetative delen av mange sopper.'],['lav','Lav','Symbiotisk system dominert av sopp sammen med fotosyntetisk partner.'],['prokaryot','Prokaryot','Celle uten membranavgrenset cellekjerne.'],['arkee','Arkee','Prokaryot organisme i domenet Archaea.'],['protist','Protist','Praktisk samlebetegnelse for mange hovedsakelig encellede eukaryoter.'],['mikrobiom','Mikrobiom','Mikrobielt samfunn og tilhørende genetisk materiale i et avgrenset miljø.'],['metastrekkoding','Metastrekkoding','Sekvensbasert identifikasjon av mange taksa fra en blandet prøve.'],['mineralisering','Mineralisering','Omdanning av organisk bundne næringsstoffer til uorganiske former.']],
  sources:[['OpenStax Biology 2e – Fungi','https://openstax.org/books/biology-2e/pages/24-introduction'],['OpenStax Biology 2e – Prokaryotes','https://openstax.org/books/biology-2e/pages/22-introduction'],['OpenStax Biology 2e – Protists','https://openstax.org/books/biology-2e/pages/23-introduction'],['Artsdatabanken – Sopp','https://artsdatabanken.no/arter/sopp'],['Artsdatabanken – Lav','https://artsdatabanken.no/arter/lav']],
  examples:[['Lav på et gammelt tre','Flere lavformer registreres på stammen.',['Dokumenter substrat, høyde og eksponering.','Bestem lav til laveste sikre nivå med egnet nøkkel.','Skill artsforekomst fra påstand om luftkvalitet.','Sammenlign med flere trær før miljømønster konkluderes.']],['Mikroliv i en damprøve','Mikroskopet viser flere morfotyper og bevegelige celler.',['Registrer prøvevolum, sted og tidspunkt.','Kalibrer målestokk og dokumenter flere synsfelt.','Beskriv morfotyper før artsnavn foreslås.','Bruk sekvens- eller referansedata dersom artsnivå er nødvendig.']]],
  places:[['naturhistorisk_museum','Naturhistorisk museum','Samlinger og fagmiljø gir kontrollerbare eksempler på sopp, lav og mikroskopisk mangfold.'],['ostensjovannet','Østensjøvannet','Vann, sediment, planter og dødt materiale gir inngang til mikroliv, nedbrytning og stoffkretsløp.']]
};

function geologyChapter(emneIds) {
  return {
    schema:'history_go_fagverk_chapter_v1', version:'2.0.0', subject:'natur', id:'geologi_landskap_tid', title:'Geologi og naturhistorie', subtitle:'Fra jordas indre til bergarter, fossiler, istider og dagens landskap',
    lead:'Geologi leser jordas materialer som spor etter prosesser over svært ulike tidsskalaer. Mineraler og bergarter registrerer dannelsesmiljø, seismiske bølger gir indirekte kunnskap om jordas indre, platetektonikk knytter kontinenter og havbunn sammen, og lag, fossiler og dateringer gjør dyp tid etterprøvbar. Disse indre og historiske prosessene kobles videre til is, vann, erosjon og landskapene vi kan undersøke direkte.',
    learningObjectives:['bestemme sentrale mineral- og bergartstyper med dokumenterte kriterier','forklare jordas lagdeling og platetektonikk fra flere evidenslinjer','skille magmatisk prosess, metamorfose og overflateforvitring','tolke jordskjelv, forkastninger og seismiske bølger presist','bruke stratigrafi, fossiler og dateringer til geologisk hendelsesrekkefølge','koble dyp geologisk historie til istider, landheving, erosjon og moderne landskap'],
    diagnosticQuestions:[{question:'Er jordas mantel direkte observert i sin helhet?',answer:'Nei. Kunnskapen bygger i stor grad på seismologi, geofysikk, eksponerte bergarter og eksperimentelle data.'},{question:'Er en bergart og et mineral det samme?',answer:'Nei. En bergart består av ett eller flere mineraler eller mineraloider og registrerer en geologisk dannelseshistorie.'},{question:'Gir en radiometrisk alder automatisk alderen på hele landskapet?',answer:'Nei. Dateringen gjelder et bestemt mineral eller en bestemt hendelse og må kobles til riktig geologisk prosess.'}],
    sections:[
      {id:'materialer',title:'1. Mineraler, bergarter og bergartenes kretsløp',paragraphs:['Mineraler har bestemte kjemiske og krystallinske egenskaper. Bergarter er sammensatte materialer der mineralogi, kornstørrelse, tekstur og struktur gir spor etter dannelse og senere omforming.','Magmatiske bergarter dannes ved størkning, sedimentære ved avsetning og diagenese, og metamorfe ved omkrystallisering under endret trykk og temperatur uten full smelting.','Bergartenes kretsløp er et nettverk av mulige overganger, ikke en fast sirkel. Tektonikk, løft, erosjon, begravelse, oppvarming og smelting kan føre materialet gjennom ulike baner.']},
      {id:'indre',title:'2. Jordas indre og platetektonikk',paragraphs:['Jordas indre deles i skorpe, mantel og kjerne etter sammensetning og i mekaniske lag etter egenskaper. Seismiske bølger endrer hastighet og bane gjennom materialer og grenseflater og gir derfor indirekte kunnskap om strukturen.','Litosfæreplater beveger seg over svakere mantelmateriale. Havbunnsspredning skaper ny oseanisk litosfære, subduksjon fører plater ned i mantelen, og kollisjon kan bygge fjellkjeder.','Platetektonikk støttes av sammenfallende mønstre i havbunnsalder, magnetiske striper, jordskjelv, vulkaner, topografi, geologi og moderne bevegelsesmålinger.']},
      {id:'magma-skjelv',title:'3. Magma, metamorfose, forkastninger og jordskjelv',paragraphs:['Magma dannes ved delvis smelting og utvikler seg gjennom temperatur, trykk, krystallisering og blanding. Viskositet og gass påvirker utbrudd, mens intrusjoner størkner under overflaten.','Metamorfose omformer mineraler og teksturer uten full smelting. Nye mineraler, foliasjon og deformasjon kan registrere trykk-, temperatur- og spenningshistorie.','Jordskjelv oppstår når oppbygget elastisk deformasjon frigjøres ved brudd og glidning. Magnitude beskriver hendelsens størrelse, mens intensitet beskriver lokal risting og virkning.']},
      {id:'stratigrafi',title:'4. Sedimenter, fossiler og geologisk tid',paragraphs:['Sedimentære lag kan bevare korn, strømstrukturer, kjemiske signaler og fossiler fra tidligere miljøer. Superposisjon og skjærende relasjoner gir relativ hendelsesrekkefølge.','Fossilregisteret er ufullstendig fordi bevaring krever bestemte forhold og fordi erosjon eller manglende avsetning skaper tidsluker. Fravær i et lag er derfor ikke automatisk biologisk fravær.','Radiometriske dateringer gir absolutte aldersestimater når riktig mineral, isotopsystem og geologisk hendelse er valgt. Lokale dateringer og stratigrafi korreleres til en global geologisk tidsskala.']},
      {id:'is-landskap',title:'5. Istider, landheving og landskapsdannelse',paragraphs:['Is, elver, bølger, vind og tyngdekraft forvitrer, eroderer, transporterer og avsetter materiale. Landformer må tolkes fra både form, materiale og regional sammenheng.','Under siste istid presset innlandsisen jordskorpen ned. Etter avsmelting har landet hevet seg, samtidig som havnivået har endret seg. Gamle strandlinjer kan derfor ligge høyt over dagens hav.','Berggrunn og løsmasser påvirker vann, jord, naturtyper og naturfare. Samtidig kan veier, tunneler, fyllinger og regulering skjule eller endre eldre geologiske former.']},
      {id:'metode',title:'6. Geologiske kart, feltspor og usikkerhet',paragraphs:['Geologiske kart er modeller i en bestemt målestokk. Grenser kan være tolket mellom få observasjoner, og dekket terreng kan kreve boring, geofysikk eller andre indirekte data.','Feltarbeid dokumenterer prøve, sted, orientering, lagforhold og strukturer. En sterk tolkning skiller observasjon fra prosesshypotese og beholder alternative forklaringer til de er testet.','Geologisk tid krever at relativ rekkefølge, absolutt datering og hendelsen som faktisk dateres holdes fra hverandre. Presisjon i tall erstatter ikke korrekt geologisk kobling.']}
    ].map(s=>({...s,keyPoints:s.paragraphs.map(p=>p.split('.')[0]+'.')})),
    workedExamples:[{title:'En bergskjæring med flere lag',situation:'Sedimentære lag skjæres av en mørk gang.',analysis:['Dokumenter lagretning og kontaktene.','Bruk superposisjon til relativ rekkefølge.','Bruk skjærende relasjon til å plassere gangen senere enn lagene.','Krev egnet datering før absolutte aldre oppgis.']},{title:'Et jordskjelvbelte ved en havgrøft',situation:'Dype og grunne jordskjelv ligger langs en buet sone med vulkaner.',analysis:['Kartlegg dybde og geometri for hypocentre.','Sammenlign med forventet subduksjonsgeometri.','Kontroller havbunn, vulkanbue og bevegelsesdata.','Skill regional plateprosess fra lokal skadefare.']}],
    commonMisconceptions:[{claim:'Kontinentene flyter oppå et hav av flytende magma.',correction:'Litosfæreplater beveger seg over fast, men langsomt deformerbar mantel; mantelen er hovedsakelig fast.'},{claim:'Alle fossiler gir en nøyaktig alder.',correction:'Fossiler kan gi relativ alder og korrelasjon; eksakt alder krever egnet absolutt dateringsgrunnlag.'},{claim:'Et kraftig jordskjelv gir samme risting overalt.',correction:'Lokal intensitet varierer med avstand, dybde, grunnforhold, bygninger og andre faktorer.'}],
    concepts:[{id:'mineral',term:'Mineral',definition:'Naturlig forekommende fast stoff med karakteristisk kjemisk sammensetning og krystallstruktur.'},{id:'litosfaere',term:'Litosfære',definition:'Den stive ytre delen av jorda som omfatter skorpe og øverste mantel.'},{id:'subduksjon',term:'Subduksjon',definition:'Prosess der en litosfæreplate synker ned under en annen.'},{id:'metamorfose',term:'Metamorfose',definition:'Omforming av bergart ved trykk, temperatur og fluider uten full smelting.'},{id:'forkastning',term:'Forkastning',definition:'Bruddflate i berggrunnen med målbar forskyvning.'},{id:'stratigrafi',term:'Stratigrafi',definition:'Studiet av lag, lagfølge og deres tidsmessige og romlige relasjoner.'},{id:'radiometrisk_datering',term:'Radiometrisk datering',definition:'Aldersbestemmelse basert på radioaktivt henfall i egnet materiale.'},{id:'landheving',term:'Landheving',definition:'Heving av jordskorpen etter blant annet avlasting fra innlandsis.'}],
    applicationTasks:[{task:'Bestem en bergart',prompts:['Dokumenter prøve og funnsted.','Beskriv mineraler, korn og tekstur.','Sammenlign med minst to relevante bergartstyper.']},{task:'Bygg en hendelsesrekkefølge',prompts:['Tegn lag og kontakter.','Bruk superposisjon og skjærende relasjoner.','Skill relativ rekkefølge fra absolutte dateringer.']},{task:'Test en tektonisk forklaring',prompts:['Samle flere uavhengige datasett.','Formuler forventet mønster ved valgt plategrense.','Rapporter avvik og alternative lokale prosesser.']}],
    selfCheck:[{question:'Hva skiller mineral fra bergart?',answer:'Et mineral har karakteristisk kjemi og krystallstruktur; en bergart er et geologisk materiale sammensatt av ett eller flere mineraler eller mineraloider.'},{question:'Hva er forskjellen på skorpe og litosfære?',answer:'Skorpe er et kjemisk lag; litosfæren er et mekanisk stivt lag som omfatter skorpa og øverste mantel.'},{question:'Hva viser S-bølgenes fravær gjennom ytre kjerne?',answer:'At ytre kjerne ikke kan overføre skjærbølger som et fast materiale.'},{question:'Hva er forskjellen på magnitude og intensitet?',answer:'Magnitude beskriver jordskjelvets størrelse; intensitet beskriver lokal risting og virkning.'},{question:'Hvorfor kan en radiometrisk alder være eldre enn en senere geologisk hendelse?',answer:'Fordi mineralet kan ha krystallisert før hendelsen som senere påvirket bergarten.'}],
    relatedPlaces:[{id:'sarpsfossen',name:'Sarpefossen',role:'Berggrunn, Raet, erosjon og landskapsutvikling kan leses sammen.'},{id:'akerselva',name:'Akerselva',role:'Berggrunn, løsmasser, vann og byforming viser koblingen mellom geologi og dagens landskap.'},{id:'naturhistorisk_museum',name:'Naturhistorisk museum',role:'Mineral-, bergarts- og fossilsamlinger gir kontrollerbare belegg for dyp geologisk tid.'}],
    sources:[{label:'NGU – Berggrunnskartlegging',url:'https://www.ngu.no/geologisk-kartlegging/berggrunnskartlegging'},{label:'NGU – Geologiske kart',url:'https://www.ngu.no/geologiske-kart'},{label:'USGS – This Dynamic Earth',url:'https://pubs.usgs.gov/gip/dynamic/dynamic.html'},{label:'USGS – Earthquake Hazards Program',url:'https://earthquake.usgs.gov/'},{label:'International Commission on Stratigraphy – Chart',url:'https://stratigraphy.org/chart'}],
    emne_ids:emneIds
  };
}

function uniq(values) { return [...new Set(values)]; }
function patchRegistryVersion(value) {
  if (value && typeof value === 'object') {
    if (Object.hasOwn(value, 'registry_version')) value.registry_version = REGISTRY_VERSION;
    if (Object.hasOwn(value, 'canonical_registry_version')) value.canonical_registry_version = REGISTRY_VERSION;
  }
  return value;
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

  const finalDomains = [MICRO_DOMAIN, GEO_DOMAIN];
  const newEmneIds = new Set(finalDomains.flatMap(d=>d.emners.map(e=>e.id)));
  const newMethodIds = new Set(METHOD_SPECS.map(s=>s[0]));
  const baseEmners = emner.filter(e=>!newEmneIds.has(e.emne_id));
  const baseMethods = methodsDoc.methods.filter(m=>!newMethodIds.has(m.method_id));
  const baseMappings = mappings.filter(m=>!newEmneIds.has(m.emne_id));
  assert(baseEmners.length === 65, `Forventet fase-2-baseline med 65 emner, fikk ${baseEmners.length}`);
  assert(baseMethods.length === 45, `Forventet fase-2-baseline med 45 metoder, fikk ${baseMethods.length}`);
  assert(baseMappings.length === 65, `Forventet fase-2-baseline med 65 mappingrader, fikk ${baseMappings.length}`);

  const microCategory = buildCategory(MICRO_DOMAIN);
  const geoGeneratedCategory = buildCategory(GEO_DOMAIN);
  const extraGeoHookIds = new Set(geoGeneratedCategory.topic_hooks.map(h=>h.id));
  const geoCategory = fagkart.categories.find(c=>c.id==='geologi_landskap_tid');
  assert(geoCategory, 'Mangler eksisterende geologikategori');
  geoCategory.title = GEO_DOMAIN.label;
  geoCategory.definition = GEO_DOMAIN.definition;
  geoCategory.focus = GEO_DOMAIN.focus;
  geoCategory.question_role = GEO_DOMAIN.questionRole;
  geoCategory.tagline = GEO_DOMAIN.tagline;
  geoCategory.topic_hooks = [...geoCategory.topic_hooks.filter(h=>!extraGeoHookIds.has(h.id)), ...geoGeneratedCategory.topic_hooks];
  geoCategory.best_place_types = uniq([...(geoCategory.best_place_types||[]), ...(geoGeneratedCategory.best_place_types||[])]);

  fagkart.categories = fagkart.categories.filter(c=>c.id!==MICRO_DOMAIN.id);
  fagkart.categories.push(microCategory);
  const domainOrder = new Map(pensum.domain_order.map((id,i)=>[id,i]));
  fagkart.categories.sort((a,b)=>(domainOrder.get(a.id)??99)-(domainOrder.get(b.id)??99));

  const hookIndex = new Map([...microCategory.topic_hooks, ...geoGeneratedCategory.topic_hooks].map(h=>[h.id,h]));
  const newEmners = finalDomains.flatMap(domain=>domain.emners.map(spec=>patchRegistryVersion(buildEmne(domain,spec))));
  const newMethods = METHOD_SPECS.map(spec=>patchRegistryVersion(buildMethod(spec, finalDomains)));
  const newMappings = finalDomains.flatMap(domain=>domain.emners.map(spec=>buildMapping(domain,spec,hookIndex)));

  emner.splice(0, emner.length, ...baseEmners, ...newEmners);
  methodsDoc.methods = [...baseMethods, ...newMethods];
  mappings.splice(0, mappings.length, ...baseMappings, ...newMappings);

  const microPensum = pensum.domains.find(d=>d.domain_id===MICRO_DOMAIN.id);
  const geoPensum = pensum.domains.find(d=>d.domain_id===GEO_DOMAIN.id);
  const microContract = contract.required_domains.find(d=>d.domain_id===MICRO_DOMAIN.id);
  const geoContract = contract.required_domains.find(d=>d.domain_id===GEO_DOMAIN.id);
  assert(microPensum && geoPensum && microContract && geoContract, 'Mangler sluttfase-domener i pensum eller kontrakt');

  const microHooks = microCategory.topic_hooks.map(h=>h.id);
  Object.assign(microPensum,{coverage_status:'materialized_biology_layer',status:'strong',emne_ids:MICRO_DOMAIN.emners.map(e=>e.id),chapter_status:'complete_for_current_biology_layer',emne_count:6,method_ids:MICRO_DOMAIN.methods,hook_ids:microHooks,hook_count:microHooks.length,method_count:MICRO_DOMAIN.methods.length});
  Object.assign(microContract,{coverage_status:'materialized_biology_layer',status:'strong',current_emne_count:6,emne_ids:MICRO_DOMAIN.emners.map(e=>e.id),chapter_status:'complete_for_current_biology_layer',emne_count:6,method_ids:MICRO_DOMAIN.methods,hook_ids:microHooks,hook_count:microHooks.length,method_count:MICRO_DOMAIN.methods.length});

  const oldGeoEmnes = ['em_natur_dalforer_vannskiller_topografi','em_natur_geologi_landskapsform','em_natur_kyst_fjord_og_strand','em_natur_lang_tid_klima_historie'];
  const geoEmnes = [...oldGeoEmnes, ...GEO_DOMAIN.emners.map(e=>e.id)];
  const geoMethods = uniq([...(geoPensum.method_ids||[]), ...GEO_DOMAIN.methods]);
  const geoHooks = geoCategory.topic_hooks.map(h=>h.id);
  Object.assign(geoPensum,{coverage_status:'materialized_geology_layer',status:'strong',definition:GEO_DOMAIN.definition,question_role:GEO_DOMAIN.questionRole,emne_ids:geoEmnes,chapter_status:'complete_for_current_geology_layer',emne_count:geoEmnes.length,method_ids:geoMethods,hook_ids:geoHooks,hook_count:geoHooks.length,method_count:geoMethods.length});
  Object.assign(geoContract,{coverage_status:'materialized_geology_layer',status:'strong',current_emne_count:geoEmnes.length,emne_ids:geoEmnes,chapter_status:'complete_for_current_geology_layer',emne_count:geoEmnes.length,method_ids:geoMethods,hook_ids:geoHooks,hook_count:geoHooks.length,method_count:geoMethods.length});

  fagkart.meta.category_count = fagkart.categories.length;
  fagkart.meta.hook_count = fagkart.categories.reduce((sum,c)=>sum+(c.topic_hooks||[]).length,0);
  fagkart.meta.canonical_round = 'v5.3';
  fagkart.version = VERSION;
  fagkart.canonical_registry_version = REGISTRY_VERSION;
  fagkart.updated_at = TODAY;
  methodsDoc.version = VERSION;
  methodsDoc.canonical_registry_version = REGISTRY_VERSION;
  methodsDoc.updated_at = TODAY;

  pensum.version = VERSION;
  pensum.canonical_registry_version = REGISTRY_VERSION;
  pensum.updated_at = TODAY;
  pensum.summary = {...pensum.summary,materialized_domain_count:12,partial_domain_count:0,required_gap_domain_count:0,current_emne_count:emner.length,current_method_count:methodsDoc.methods.length,current_mapping_count:mappings.length,current_topic_hook_count:fagkart.meta.hook_count,all_current_emners_have_mapping:true,all_current_method_refs_valid:true,editorial_complete:true};
  pensum.coverage_statement = 'Alle tolv canonicale Natur-områder er materialisert med emner, metoder og fagkart. Sopp/lav/mikroorganismer og geologiens indre prosesser og naturhistorie er fullført, og Natur står redaksjonelt complete med tolv registrerte kapitler.';

  contract.version = '1.3.0';
  contract.updated_at = TODAY;
  contract.completion_rule.current_result = 'complete';
  contract.current_state = {
    materialized_environment_domains:['okosystem_mangfold_habitat','vann_hydrologi_kretslop','klima_energi_resiliens','urban_okologi_gronnstruktur','miljopavirkning_forvaltning_regenerasjon'],
    materialized_biology_domains:['artskunnskap_systematikk','evolusjon_biologisk_mangfold','botanikk_vegetasjon','zoologi_dyreliv','sopp_lav_mikroorganismer','organismebiologi_fysiologi'],
    materialized_geology_domains:['geologi_landskap_tid'], partial_domains:[], required_gap_domains:[],
    preserved_environment_layer_counts:{emner:35,methods:30,mappings:35,hooks:60,chapters:6},
    phase_1_biology_layer_counts:{emner:18,methods:9,mappings:18,hooks:30,chapters:3},
    phase_2_biology_layer_counts:{emner:12,methods:6,mappings:12,hooks:20,chapters:2},
    final_phase_layer_counts:{emner:12,methods:6,mappings:12,hooks:20,chapters_added:1,chapters_expanded:1},
    current_emne_count:emner.length,current_method_count:methodsDoc.methods.length,current_mapping_count:mappings.length,current_hook_count:fagkart.meta.hook_count,current_chapter_count:12,editorial_status:'complete'
  };

  const microChapter = chapterDocument(MICRO_CHAPTER, MICRO_DOMAIN.emners.map(e=>e.id));
  writeJson('data/fagverk/natur/sopp_lav_mikroorganismer.json', microChapter);
  writeJson('data/fagverk/natur/geologi_landskap_tid.json', geologyChapter(geoEmnes));
  const naturRegistry = registry.subjects.natur;
  naturRegistry.description = 'Et sammenhengende og redaksjonelt komplett læreverk om økologi, artskunnskap, evolusjon, botanikk, zoologi, sopp, lav, mikroorganismer, fysiologi, vann, klima, geologi, urban natur, miljøpåvirkning og forvaltning.';
  naturRegistry.canonicalModel.note = 'Emnetitler, definisjoner, fagområder og metodekoblinger leses fra canonical Natur v5.3 gjennom kompatibilitetsfilene. Registryet eier tolv redigerte lærekapitler som dekker alle tolv canonicale fagområder.';
  naturRegistry.chapters = naturRegistry.chapters.filter(c=>c.id!==MICRO_DOMAIN.id);
  const geoRegistry = naturRegistry.chapters.find(c=>c.id===GEO_DOMAIN.id);
  assert(geoRegistry,'Mangler registrert geologikapittel');
  Object.assign(geoRegistry,{title:'Geologi og naturhistorie',subtitle:'Fra jordas indre til bergarter, fossiler, istider og dagens landskap',file:'data/fagverk/natur/geologi_landskap_tid.json',primary_domain_id:GEO_DOMAIN.id,emne_ids:geoEmnes});
  naturRegistry.chapters.push({id:MICRO_DOMAIN.id,title:microChapter.title,subtitle:microChapter.subtitle,file:'data/fagverk/natur/sopp_lav_mikroorganismer.json',primary_domain_id:MICRO_DOMAIN.id,emne_ids:MICRO_DOMAIN.emners.map(e=>e.id)});
  naturRegistry.chapters.sort((a,b)=>(domainOrder.get(a.primary_domain_id)??99)-(domainOrder.get(b.primary_domain_id)??99));

  const naturStatus = status.subjects.find(s=>s.id==='natur');
  naturStatus.assessmentStatus = 'audited';
  naturStatus.editorialStatus = 'complete';
  naturStatus.nextGate = 'production_coverage_and_maintenance';
  naturStatus.note = 'Natur er redaksjonelt komplett: alle 12 canonicale fagområder har materialiserte emner og metoder, alle emner har mapping, og registryet har 12 redigerte kapitler. Videre arbeid gjelder geografisk produksjonsdekning, evidens og vedlikehold – ikke manglende fagområder.';
  status.updatedAt = TODAY;

  const badgePath = 'data/fag/natur/merke_natur (1).html';
  let badge = fs.readFileSync(badgePath,'utf8');
  badge = badge.replace(/<p><a href="\.\.\/\.\.\/\.\.\/fagverk\.html\?subject=natur">Åpne Naturfaget<\/a>[^<]*<\/p>/, '<p><a href="../../../fagverk.html?subject=natur">Åpne Naturfaget</a> for å utforske 77 materialiserte emner, 51 metoder og tolv redigerte kapitler. Alle tolv canonicale Natur-områder er nå dekket; videre produksjon handler om stedscaser, evidens og vedlikehold.</p>');
  fs.writeFileSync(badgePath,badge);

  writeJson(P.emner,emner); writeJson(P.methods,methodsDoc); writeJson(P.mappings,mappings); writeJson(P.fagkart,fagkart); writeJson(P.pensum,pensum); writeJson(P.contract,contract); writeJson(P.registry,registry); writeJson(P.status,status);

  assert(emner.length===77,`Forventet 77 emner, fikk ${emner.length}`);
  assert(methodsDoc.methods.length===51,`Forventet 51 metoder, fikk ${methodsDoc.methods.length}`);
  assert(mappings.length===77,`Forventet 77 mappings, fikk ${mappings.length}`);
  assert(fagkart.categories.length===12,`Forventet 12 fagkartkategorier, fikk ${fagkart.categories.length}`);
  assert(fagkart.meta.hook_count===130,`Forventet 130 hooks, fikk ${fagkart.meta.hook_count}`);
  assert(naturRegistry.chapters.length===12,`Forventet 12 kapitler, fikk ${naturRegistry.chapters.length}`);
  console.log('Natur sluttfase materialisert: 12/12 områder, 77 emner, 51 metoder, 77 mappings, 130 hooks, 12 kapitler, editorialStatus complete.');
}

main();
