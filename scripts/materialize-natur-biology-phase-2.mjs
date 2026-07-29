#!/usr/bin/env node
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

const EVOLUTION_THINKERS = [
  { id: 'charles_darwin', name: 'Charles Darwin', role: 'naturlig seleksjon og felles avstamning', tier: 'core' },
  { id: 'alfred_russel_wallace', name: 'Alfred Russel Wallace', role: 'naturlig seleksjon og biogeografi', tier: 'core' },
  { id: 'ronald_fisher', name: 'Ronald Fisher', role: 'populasjonsgenetikk og seleksjon', tier: 'core' },
  { id: 'sewall_wright', name: 'Sewall Wright', role: 'genetisk drift og populasjonsstruktur', tier: 'core' },
  { id: 'ernst_mayr', name: 'Ernst Mayr', role: 'artsdannelse og biologisk artsbegrep', tier: 'core' }
];

const PHYSIOLOGY_THINKERS = [
  { id: 'claude_bernard', name: 'Claude Bernard', role: 'indre miljø og regulering', tier: 'core' },
  { id: 'walter_cannon', name: 'Walter Cannon', role: 'homeostase', tier: 'core' },
  { id: 'otto_warburg', name: 'Otto Warburg', role: 'celleånding og energiomsetning', tier: 'core' },
  { id: 'alan_hodgkin', name: 'Alan Hodgkin', role: 'nerveimpulser og membranpotensial', tier: 'core' },
  { id: 'andrew_huxley', name: 'Andrew Huxley', role: 'nerveledning og muskelaktivering', tier: 'core' }
];

const DOMAIN_SPECS = [
  {
    id: 'evolusjon_biologisk_mangfold',
    label: 'Evolusjon og biologisk mangfold',
    shortLabel: 'Evolusjon',
    definition: 'Domenet forklarer hvordan arvelig variasjon, mutasjon, seleksjon, drift, genflyt, artsdannelse, koevolusjon, utdøing og historisk utbredelse former biologisk mangfold over tid.',
    focus: ['arvelig variasjon', 'evolusjonsmekanismer', 'tilpasning', 'artsdannelse', 'makroevolusjon', 'biogeografi'],
    questionRole: 'Skill kilden til arvelig variasjon fra prosessene som endrer genfrekvenser, og test evolusjonære forklaringer mot populasjonsdata, slektskap, miljø og tid.',
    tagline: 'Hvordan arvelig variasjon og evolusjonære prosesser former arter, slektskap og utbredelse.',
    thinkers: EVOLUTION_THINKERS,
    comparisonPairs: [['charles_darwin', 'alfred_russel_wallace'], ['ronald_fisher', 'sewall_wright']],
    methods: [
      'met_natur_populasjonsgenetisk_analyse',
      'met_natur_komparativ_evolusjonsanalyse',
      'met_natur_biogeografisk_utbredelsesanalyse'
    ],
    emners: [
      {
        id: 'em_natur_genetisk_variasjon_mutasjon_rekombinasjon',
        title: 'Genetisk variasjon, mutasjon og rekombinasjon',
        short: 'Arvelig variasjon',
        level: 1,
        definition: 'Emnet undersøker hvordan mutasjoner, rekombinasjon og seksuell formering skaper og omfordeler arvelige varianter som evolusjonære prosesser kan virke på.',
        why: 'Seleksjon og drift kan bare endre eksisterende arvelig variasjon, mens nye mutasjoner tilfører varianter uten å oppstå fordi organismen trenger dem.',
        concepts: ['allel', 'genotype', 'fenotype', 'mutasjon', 'rekombinasjon', 'meiose', 'arvelighet', 'genetisk variasjon'],
        questions: [
          'Hvilken arvelig variasjon finnes i populasjonen, og hvordan er den målt?',
          'Skyldes den observerte varianten mutasjon, rekombinasjon eller allerede eksisterende alleler?',
          'Kan fenotypisk forskjell skilles fra miljøpåvirkning uten avkoms-, slektskaps- eller genetiske data?'
        ],
        conflicts: ['arvelig variasjon vs miljøbetinget plastisitet', 'mutasjonens opphav vs variantens senere skjebne', 'genotype vs fenotype'],
        distinctions: ['mutasjon vs tilpasning', 'rekombinasjon vs ny allel', 'arvelig variant vs ervervet egenskap'],
        hooks: ['genetisk_variasjon', 'mutasjon_rekombinasjon', 'tilpasning_avveininger'],
        methods: ['met_natur_populasjonsgenetisk_analyse', 'met_natur_komparativ_evolusjonsanalyse'],
        places: ['museumssamling', 'naturreservat', 'forskningslaboratorium', 'artsrik eng']
      },
      {
        id: 'em_natur_populasjonsgenetikk_drift_genflyt',
        title: 'Populasjonsgenetikk, genetisk drift og genflyt',
        short: 'Populasjonsgenetikk',
        level: 2,
        definition: 'Emnet bruker allel- og genotypefrekvenser til å undersøke hvordan tilfeldig drift, flaskehalser, grunnleggere, migrasjon og paring endrer populasjoners genetiske struktur.',
        why: 'Endring i en populasjon er ikke automatisk et resultat av seleksjon; små populasjoner og geografisk struktur kan gi sterke tilfeldige endringer.',
        concepts: ['genpool', 'allelfrekvens', 'genotypefrekvens', 'Hardy–Weinberg', 'genetisk drift', 'flaskehals', 'grunnleggereffekt', 'genflyt'],
        questions: [
          'Hvordan er allelfrekvensene estimert, og er utvalget representativt for populasjonen?',
          'Passer endringen best med drift, genflyt, seleksjon eller en kombinasjon?',
          'Hvordan påvirker populasjonsstørrelse, isolasjon og prøvetidspunkt tolkningen?'
        ],
        conflicts: ['tilfeldig drift vs retningsbestemt seleksjon', 'migrasjon av individer vs genflyt gjennom reproduksjon', 'observert frekvens vs sann populasjonsfrekvens'],
        distinctions: ['genflyt vs geografisk spredning', 'flaskehals vs grunnleggereffekt', 'demografisk endring vs genetisk endring'],
        hooks: ['genetisk_drift', 'genflyt', 'genetisk_variasjon'],
        methods: ['met_natur_populasjonsgenetisk_analyse', 'met_natur_biogeografisk_utbredelsesanalyse'],
        places: ['øy', 'fragmentert skog', 'elveløp', 'naturreservat']
      },
      {
        id: 'em_natur_naturlig_seksuell_seleksjon_tilpasning',
        title: 'Naturlig seleksjon, seksuell seleksjon og tilpasning',
        short: 'Seleksjon og tilpasning',
        level: 2,
        definition: 'Emnet forklarer hvordan arvelige forskjeller i overlevelse og reproduksjon kan endre populasjoner, og hvordan seksuell seleksjon, avveininger og historiske begrensninger former tilpasninger.',
        why: 'En egenskap er ikke en tilpasning bare fordi den virker nyttig; forklaringen krever arvelighet, variasjon, forskjeller i reproduktiv suksess og relevante alternativer.',
        concepts: ['fitness', 'seleksjonspress', 'naturlig seleksjon', 'seksuell seleksjon', 'tilpasning', 'avveining', 'begrensning', 'eksaptasjon'],
        questions: [
          'Hvilken målbar arvelig egenskap varierer, og hvordan henger den sammen med reproduktiv suksess?',
          'Er mønsteret best forklart av naturlig seleksjon, seksuell seleksjon, drift eller miljøbetinget plastisitet?',
          'Hvilke kostnader, avveininger og historiske begrensninger følger egenskapen?'
        ],
        conflicts: ['nyttefortelling vs testbar seleksjonshypotese', 'seksuell seleksjon vs overlevelsesfordel', 'tilpasning vs plastisk respons'],
        distinctions: ['fitness vs fysisk styrke', 'seleksjon av individ vs evolusjon i populasjon', 'tilpasning vs målrettet forbedring'],
        hooks: ['naturlig_seleksjon', 'seksuell_seleksjon', 'tilpasning_avveininger'],
        methods: ['met_natur_komparativ_evolusjonsanalyse', 'met_natur_populasjonsgenetisk_analyse'],
        places: ['fuglekoloni', 'pollinatoreng', 'fjellgradient', 'kysthabitat']
      },
      {
        id: 'em_natur_artsdannelse_reproduktiv_isolasjon',
        title: 'Artsdannelse og reproduktiv isolasjon',
        short: 'Artsdannelse',
        level: 2,
        definition: 'Emnet undersøker hvordan geografisk, økologisk, tidsmessig, atferdsmessig og genetisk isolasjon kan redusere genflyt og bygge pre- og postzygotiske barrierer.',
        why: 'Artsdannelse er en prosess med divergens og isolasjon, ikke et øyeblikk der en organisme plutselig blir en ny art.',
        concepts: ['divergens', 'reproduktiv isolasjon', 'prezygotisk barriere', 'postzygotisk barriere', 'allopatri', 'sympatri', 'hybridisering', 'adaptiv radiasjon'],
        questions: [
          'Hvilken barriere reduserer genflyt mellom populasjonene?',
          'Hvilke genetiske, økologiske eller reproduktive data viser divergens?',
          'Er isolasjonen fullstendig, delvis eller fortsatt reversibel gjennom hybridisering?'
        ],
        conflicts: ['geografisk avstand vs reproduktiv isolasjon', 'fenotypisk forskjell vs artsgrense', 'hybridisering vs fullstendig genflyt'],
        distinctions: ['allopatrisk vs sympatrisk artsdannelse', 'prezygotisk vs postzygotisk barriere', 'populasjonsstruktur vs egen art'],
        hooks: ['artsdannelse_isolasjon', 'genflyt', 'biogeografi_historie'],
        methods: ['met_natur_populasjonsgenetisk_analyse', 'met_natur_biogeografisk_utbredelsesanalyse', 'met_natur_komparativ_evolusjonsanalyse'],
        places: ['øygruppe', 'innsjø', 'fjellområde', 'fragmentert kulturlandskap']
      },
      {
        id: 'em_natur_koevolusjon_utdoing_makroevolusjon',
        title: 'Koevolusjon, utdøing og makroevolusjon',
        short: 'Makroevolusjon',
        level: 3,
        definition: 'Emnet behandler gjensidig evolusjonær påvirkning mellom arter, opphav og tap av større utviklingslinjer, adaptiv radiasjon og hvordan utdøing former livets historie.',
        why: 'Langsiktige mangfoldsmønstre oppstår gjennom både forgrening og tap, mens samtidige samspill bare er koevolusjon når partene har påvirket hverandres evolusjon.',
        concepts: ['koevolusjon', 'gjensidig seleksjon', 'makroevolusjon', 'adaptiv radiasjon', 'bakgrunnsutdøing', 'masseutdøing', 'diversifisering', 'fossilregister'],
        questions: [
          'Finnes evidens for gjensidig evolusjonær påvirkning, eller bare nåværende samspill?',
          'Hvilke data viser forgrening, diversifisering eller utdøing over tid?',
          'Hvordan påvirker ufullstendig fossilregister og skjev bevaring konklusjonen?'
        ],
        conflicts: ['økologisk samspill vs koevolusjon', 'manglende funn vs faktisk fravær', 'artstap lokalt vs global utdøing'],
        distinctions: ['koevolusjon vs ensidig tilpasning', 'utdøing vs lokal forsvinning', 'mønster i makroevolusjon vs mekanisme i populasjon'],
        hooks: ['koevolusjon_utdoing', 'artsdannelse_isolasjon', 'tilpasning_avveininger'],
        methods: ['met_natur_komparativ_evolusjonsanalyse', 'met_natur_biogeografisk_utbredelsesanalyse'],
        places: ['fossilsamling', 'naturhistorisk museum', 'pollinatornettverk', 'øygruppe']
      },
      {
        id: 'em_natur_biogeografi_historisk_utbredelse_mangfold',
        title: 'Biogeografi, historisk utbredelse og biologisk mangfold',
        short: 'Biogeografi',
        level: 3,
        definition: 'Emnet undersøker hvordan spredning, isolasjon, klima, geologi, høyde, øyer og tidligere istider forklarer arters utbredelse og mangfold på genetisk, arts- og økosystemnivå.',
        why: 'Et utbredelseskart viser et tids- og innsatsavhengig mønster, og historiske forklaringer må skilles fra dagens klima, habitat og registreringsskjevhet.',
        concepts: ['biogeografi', 'endemisme', 'disjunkt utbredelse', 'spredning', 'vikarians', 'refugium', 'øybiogeografi', 'genetisk mangfold', 'artsmangfold'],
        questions: [
          'Hvilket romlig mønster viser dataene når registreringsinnsats og tidsperiode kontrolleres?',
          'Kan utbredelsen forklares av spredning, isolasjon, klima, geologisk historie eller flere prosesser?',
          'Hvilket nivå av biologisk mangfold måles, og hvilke tap skjules av samlet artsantall?'
        ],
        conflicts: ['dagens utbredelse vs historisk prosess', 'manglende registrering vs fravær', 'artsrikdom vs genetisk og funksjonelt mangfold'],
        distinctions: ['spredning vs vikarians', 'endemisk vs sjelden', 'utbredelsesgrense vs registreringsgrense'],
        hooks: ['biogeografi_historie', 'koevolusjon_utdoing', 'genflyt'],
        methods: ['met_natur_biogeografisk_utbredelsesanalyse', 'met_natur_populasjonsgenetisk_analyse', 'met_natur_komparativ_evolusjonsanalyse'],
        places: ['øy', 'fjellgradient', 'fjord', 'museumssamling', 'naturreservat']
      }
    ],
    hooks: [
      ['genetisk_variasjon', 'Genetisk variasjon', 'Hvilke arvelige varianter finnes i populasjonen, og hvordan er prøve, markør og frekvens dokumentert?', ['genotype- eller sekvensdata', 'utvalgsdesign og populasjonsavgrensning', 'fenotype, miljø og arvelighetsgrunnlag']],
      ['mutasjon_rekombinasjon', 'Mutasjon og rekombinasjon', 'Hvilken prosess skapte eller omfordelte varianten, og kan opphav skilles fra variantens senere frekvensendring?', ['dokumentert variant eller avkomsdata', 'mutasjonstype eller rekombinasjonsmønster', 'kontroll mot miljøbetinget variasjon']],
      ['naturlig_seleksjon', 'Naturlig seleksjon', 'Er arvelig variasjon koblet til målbare forskjeller i overlevelse eller reproduksjon under et bestemt miljøpress?', ['arvelig egenskapsvariasjon', 'reproduktiv suksess eller overlevelse', 'alternative mekanismer som drift og plastisitet']],
      ['seksuell_seleksjon', 'Seksuell seleksjon', 'Hvordan påvirker partnervalg eller konkurranse reproduktiv suksess, og hvilke kostnader følger egenskapen?', ['parings- eller konkurransedata', 'egenskapens arvelighet', 'overlevelseskostnader og alternative forklaringer']],
      ['genetisk_drift', 'Genetisk drift', 'Kan tilfeldig prøvetaking mellom generasjoner forklare frekvensendringen, særlig ved liten populasjon eller flaskehals?', ['allelfrekvenser over tid', 'effektiv populasjonsstørrelse', 'demografisk historie og usikkerhet']],
      ['genflyt', 'Genflyt', 'Har migrerende individer faktisk bidratt genetisk til mottakerpopulasjonen?', ['genetisk struktur mellom lokaliteter', 'reproduksjons- eller avkomsdata', 'barrierer, avstand og spredningsevne']],
      ['tilpasning_avveininger', 'Tilpasning og avveininger', 'Hvilken testbar seleksjonshistorie forklarer egenskapen, og hvilke kostnader eller historiske begrensninger finnes?', ['funksjons- og fitnessdata', 'sammenligning med alternativer', 'miljø, slektskap og avveininger']],
      ['artsdannelse_isolasjon', 'Artsdannelse og isolasjon', 'Hvilke barrierer reduserer genflyt, og hvor langt har genetisk og reproduktiv divergens kommet?', ['populasjonsgenetikk og slektskap', 'pre- og postzygotiske barrierer', 'geografi, økologi og hybridisering']],
      ['koevolusjon_utdoing', 'Koevolusjon og utdøing', 'Viser tids-, slektskaps- eller funksjonsdata gjensidig evolusjonær påvirkning eller tap av en utviklingslinje?', ['sammenlignende arts- eller fossildata', 'tidsrekkefølge og gjensidighet', 'bevarings- og registreringsskjevhet']],
      ['biogeografi_historie', 'Biogeografi og historisk utbredelse', 'Hvordan har spredning, isolasjon, klima og geologisk historie formet den dokumenterte utbredelsen?', ['daterte utbredelsesdata', 'fylogeni eller populasjonsstruktur', 'historisk klima, geologi og registreringsinnsats']]
    ]
  },
  {
    id: 'organismebiologi_fysiologi',
    label: 'Organismebiologi og fysiologi',
    shortLabel: 'Fysiologi',
    definition: 'Domenet forklarer hvordan celler, vev, organer og organsystemer omsetter energi, utveksler stoff, sanser miljøet og regulerer indre forhold gjennom hele organismens liv.',
    focus: ['energiomsetning', 'gass og transport', 'osmoregulering', 'temperatur', 'nerve og bevegelse', 'hormoner og homeostase'],
    questionRole: 'Koble målbar fysiologisk funksjon fra celle til hel organisme, og skill reguleringsmekanisme, respons, toleranse og evolusjonær forklaring.',
    tagline: 'Hvordan organismer skaffer energi, transporterer stoff, sanser, beveger seg og holder indre forhold innenfor tålegrenser.',
    thinkers: PHYSIOLOGY_THINKERS,
    comparisonPairs: [['claude_bernard', 'walter_cannon'], ['alan_hodgkin', 'andrew_huxley']],
    methods: [
      'met_natur_respirometri_energiomsetning',
      'met_natur_komparativ_fysiologisk_maling',
      'met_natur_stimulus_respons_forsok'
    ],
    emners: [
      {
        id: 'em_natur_energiomsetning_celleanding',
        title: 'Energiomsetning og celleånding',
        short: 'Energiomsetning',
        level: 1,
        definition: 'Emnet følger energioverføring fra næringsstoffer gjennom glykolyse, sitronsyresyklus og oksidativ fosforylering til ATP, varme og arbeid i celler.',
        why: 'Energi blir ikke skapt av organismen; kjemisk energi omformes med tap som varme, og målinger av oksygen eller karbondioksid krever kontroll for masse, temperatur og aktivitet.',
        concepts: ['ATP', 'enzym', 'glykolyse', 'sitronsyresyklus', 'elektrontransportkjede', 'oksidativ fosforylering', 'aerob', 'anaerob', 'metabolsk rate'],
        questions: [
          'Hvilket substrat, hvilken reaksjonsvei og hvilken energibærer inngår i prosessen?',
          'Hvordan er metabolsk rate målt og korrigert for kroppsstørrelse, temperatur og aktivitet?',
          'Viser oksygen- eller karbondioksidendringen celleånding alene, eller kan andre prosesser bidra?'
        ],
        conflicts: ['energi vs stoff', 'målt gassendring vs faktisk ATP-produksjon', 'aerob kapasitet vs øyeblikkelig aktivitet'],
        distinctions: ['celleånding vs pusting', 'energiinnhold vs metabolsk rate', 'anaerob energiomsetning vs fravær av celleånding'],
        hooks: ['energi_celleanding', 'homeostase_toleranse', 'temperaturregulering'],
        methods: ['met_natur_respirometri_energiomsetning', 'met_natur_komparativ_fysiologisk_maling'],
        places: ['laboratorium', 'ferskvann', 'jordprøve', 'kompost', 'dyreobservasjon']
      },
      {
        id: 'em_natur_gassutveksling_sirkulasjon_transport',
        title: 'Gassutveksling, sirkulasjon og transport',
        short: 'Gass og transport',
        level: 2,
        definition: 'Emnet sammenligner diffusjon over respirasjonsflater og transport gjennom åpne og lukkede sirkulasjonssystemer, med vekt på gradienter, overflate, ventilasjon og gjennomstrømning.',
        why: 'Respirasjonsorgan og sirkulasjon må dimensjoneres mot kroppsstørrelse, aktivitet og miljø, mens konsentrasjon, partialtrykk og transporthastighet ikke er det samme.',
        concepts: ['diffusjon', 'partialtrykk', 'respirasjonsflate', 'ventilasjon', 'gjelle', 'lunge', 'hemolymfe', 'blod', 'åpent kretsløp', 'lukket kretsløp'],
        questions: [
          'Hvilken gradient og overflate driver gassutvekslingen?',
          'Hvordan kobles ventilasjon til transportvæske og sirkulasjon?',
          'Hvilket ledd begrenser oksygentilførselen ved endret temperatur, aktivitet eller miljø?'
        ],
        conflicts: ['konsentrasjon vs partialtrykk', 'ventilasjon vs sirkulasjon', 'stor overflate vs effektiv gjennomstrømning'],
        distinctions: ['pusting vs gassutveksling', 'åpent vs lukket kretsløp', 'diffusjon vs massetransport'],
        hooks: ['gassutveksling', 'sirkulasjon_transport', 'energi_celleanding'],
        methods: ['met_natur_respirometri_energiomsetning', 'met_natur_komparativ_fysiologisk_maling'],
        places: ['innsjø', 'bekk', 'fugleobservasjon', 'laboratorium', 'fjæresone']
      },
      {
        id: 'em_natur_osmoregulering_temperaturregulering',
        title: 'Vann- og saltbalanse og temperaturregulering',
        short: 'Indre balanse',
        level: 2,
        definition: 'Emnet undersøker osmose, ionetransport, utskillelse, vannbalanse, varmeutveksling og hvordan ektoterme og endoterme organismer regulerer eller følger miljøet.',
        why: 'Vann, salter og temperatur påvirker cellenes funksjon samtidig, men regulering har energikostnader og arter har ulike strategier og toleransevinduer.',
        concepts: ['osmose', 'osmolaritet', 'ionebalanse', 'osmoregulering', 'utskillelse', 'ektotermi', 'endotermi', 'varmeledning', 'fordamping', 'akklimatisering'],
        questions: [
          'Hvilken vann-, ion- eller varmegradient møter organismen?',
          'Regulerer organismen indre forhold aktivt, eller varierer de med miljøet?',
          'Hvilke energikostnader og toleransegrenser følger strategien?'
        ],
        conflicts: ['osmotisk balanse vs ionebalanse', 'kroppstemperatur vs varmekilde', 'regulering vs konformitet'],
        distinctions: ['osmoregulering vs utskillelse', 'ektoterm vs kaldblodig', 'akklimatisering vs evolusjonær tilpasning'],
        hooks: ['osmoregulering', 'temperaturregulering', 'homeostase_toleranse'],
        methods: ['met_natur_komparativ_fysiologisk_maling', 'met_natur_respirometri_energiomsetning'],
        places: ['ferskvann', 'saltvann', 'fjæresone', 'vinterhabitat', 'laboratorium']
      },
      {
        id: 'em_natur_sanser_nervesystem_bevegelse',
        title: 'Sanser, nervesystem og bevegelse',
        short: 'Sansing og bevegelse',
        level: 2,
        definition: 'Emnet følger stimuli gjennom sansereseptorer, elektriske og kjemiske signaler, nervesystemets integrasjon og aktivering av muskler eller andre bevegelsesmekanismer.',
        why: 'At en organisme reagerer på lys, lyd eller berøring viser ikke alene hvilken reseptor eller nervebane som virker, og responsen må skilles fra tolkning av hensikt.',
        concepts: ['stimulus', 'reseptor', 'transduksjon', 'membranpotensial', 'aksjonspotensial', 'synapse', 'nevromuskulær kobling', 'muskelkontraksjon', 'refleks'],
        questions: [
          'Hvilket fysisk eller kjemisk stimulus registreres av hvilken reseptor?',
          'Hvordan overføres og integreres signalet før en respons utløses?',
          'Kan bevegelsen forklares som refleks, orientering, læring eller annen regulering?'
        ],
        conflicts: ['stimulus vs opplevelse', 'nerveaktivitet vs atferdstolkning', 'korrelert signal vs utløsende mekanisme'],
        distinctions: ['sansing vs persepsjon', 'aksjonspotensial vs gradert potensial', 'muskelaktivering vs bevegelsesresultat'],
        hooks: ['sansetransduksjon', 'nerve_muskel', 'homeostase_toleranse'],
        methods: ['met_natur_stimulus_respons_forsok', 'met_natur_komparativ_fysiologisk_maling'],
        places: ['feltlaboratorium', 'fugletårn', 'dam', 'mørkt skogsmiljø', 'laboratorium']
      },
      {
        id: 'em_natur_ernaering_fordoyelse_hormoner',
        title: 'Ernæring, fordøyelse og hormonell regulering',
        short: 'Ernæring og hormoner',
        level: 2,
        definition: 'Emnet undersøker hvordan næringsstoffer brytes ned, tas opp, lagres og mobiliseres, og hvordan hormoner koordinerer metabolisme, vekst, stress og andre langsomme reguleringsprosesser.',
        why: 'Fødevalg er ikke det samme som næringsopptak, og hormonvirkning avhenger av reseptorer, konsentrasjon, tilbakekobling og samspill med nervesystemet.',
        concepts: ['makronæringsstoff', 'mikronæringsstoff', 'enzymatisk fordøyelse', 'absorpsjon', 'tarm', 'hormon', 'reseptor', 'endokrin kjertel', 'negativ tilbakekobling'],
        questions: [
          'Hvordan brytes næringsstoffet ned og transporteres over fordøyelsesflaten?',
          'Hvilket hormon, hvilken reseptor og hvilket målvev inngår i reguleringen?',
          'Hvordan kontrolleres prosessen gjennom tilbakekobling, lagring og mobilisering?'
        ],
        conflicts: ['inntak vs opptak', 'hormonmengde vs vevsrespons', 'korrelasjon mellom hormon og prosess vs årsak'],
        distinctions: ['fordøyelse vs absorpsjon', 'endokrin vs nevral signalering', 'næringsbehov vs fødepreferanse'],
        hooks: ['fordoyelse_opptak', 'hormoner_reproduksjon', 'energi_celleanding'],
        methods: ['met_natur_komparativ_fysiologisk_maling', 'met_natur_stimulus_respons_forsok'],
        places: ['laboratorium', 'beiteområde', 'pollinatoreng', 'ferskvann', 'dyreobservasjon']
      },
      {
        id: 'em_natur_reproduksjon_homeostase_toleranse',
        title: 'Reproduksjon, homeostase og toleransegrenser',
        short: 'Liv og regulering',
        level: 3,
        definition: 'Emnet kobler gametdannelse, befruktning, utvikling og hormonell reproduksjonskontroll til homeostatiske sløyfer, stressresponser, akklimatisering og fysiologiske toleransegrenser.',
        why: 'Homeostase betyr regulering rundt funksjonelle områder, ikke et helt konstant indre miljø, og reproduksjon konkurrerer med vekst, vedlikehold og overlevelse om energi.',
        concepts: ['gametogenese', 'befruktning', 'utvikling', 'reproduksjonssyklus', 'homeostase', 'settpunkt', 'negativ tilbakekobling', 'stressrespons', 'toleransekurve', 'akklimatisering'],
        questions: [
          'Hvilke fysiologiske signaler og ressurser styrer reproduksjonsprosessen?',
          'Hvilken regulert variabel, reseptor, kontrollmekanisme og effektor inngår i homeostasen?',
          'Hvordan måles toleransegrensen uten å forveksle kortvarig stress, akklimatisering og varig skade?'
        ],
        conflicts: ['stabilitet vs dynamisk regulering', 'settpunkt vs normalt variasjonsområde', 'akklimatisering vs genetisk tilpasning'],
        distinctions: ['homeostase vs uforanderlighet', 'stressrespons vs skade', 'reproduktiv investering vs reproduktiv suksess'],
        hooks: ['hormoner_reproduksjon', 'homeostase_toleranse', 'temperaturregulering'],
        methods: ['met_natur_stimulus_respons_forsok', 'met_natur_komparativ_fysiologisk_maling', 'met_natur_respirometri_energiomsetning'],
        places: ['salamanderdam', 'fuglekoloni', 'laboratorium', 'høydegradient', 'ferskvann']
      }
    ],
    hooks: [
      ['energi_celleanding', 'Energiomsetning og celleånding', 'Hvordan omformes kjemisk energi til ATP, varme og arbeid, og hva måler respirometrien faktisk?', ['substrat, oksygen- eller karbondioksiddata', 'temperatur, masse og aktivitetskontroll', 'aerobe og anaerobe alternativer']],
      ['gassutveksling', 'Gassutveksling', 'Hvilke gradienter, overflater og ventilasjonsbevegelser bestemmer diffusjonen av oksygen og karbondioksid?', ['respirasjonsflate og miljø', 'partialtrykk eller konsentrasjon', 'ventilasjon, tykkelse og overflateareal']],
      ['sirkulasjon_transport', 'Sirkulasjon og transport', 'Hvordan flyttes gasser, næring, avfall og signalstoff mellom utvekslingsflate og vev?', ['kretsløpstype og transportvæske', 'gjennomstrømning og trykk', 'vevets behov og begrensende ledd']],
      ['osmoregulering', 'Osmoregulering', 'Hvordan reguleres vann og ioner over membraner og utskillelsesorganer i det aktuelle miljøet?', ['osmolaritet og ionekonsentrasjon', 'inntak, tap og aktiv transport', 'regulator, konformer og energikostnad']],
      ['temperaturregulering', 'Temperaturregulering', 'Hvordan utveksler og produserer organismen varme, og hvilke atferds- og fysiologiske tiltak holder funksjonen innenfor grenser?', ['kropps- og miljøtemperatur over tid', 'varmeproduksjon og varmeutveksling', 'aktivitet, kroppsstørrelse og mikrohabitat']],
      ['sansetransduksjon', 'Sansetransduksjon', 'Hvordan omdanner reseptoren et fysisk eller kjemisk stimulus til et biologisk signal?', ['definert stimulus og reseptor', 'responsstyrke og terskel', 'kontrollstimulus og alternative sansekanaler']],
      ['nerve_muskel', 'Nerve og muskel', 'Hvordan overføres et signal gjennom nevroner og synapser til kontrollert muskelaktivering eller annen bevegelse?', ['membran- eller responssignal', 'nervebane og synapse', 'muskelkraft, bevegelse og belastning']],
      ['fordoyelse_opptak', 'Fordøyelse og næringsopptak', 'Hvordan brytes føden ned, absorberes og fordeles, og hvilket trinn begrenser tilgjengelig energi eller byggestoff?', ['fødesammensetning og fordøyelsesstruktur', 'enzym, pH og oppholdstid', 'absorpsjon, transport og utskillelse']],
      ['hormoner_reproduksjon', 'Hormoner og reproduksjon', 'Hvilke hormoner, reseptorer og tilbakekoblinger koordinerer vekst, metabolisme eller reproduksjon?', ['hormonkonsentrasjon og tidspunkt', 'målvev og reseptor', 'tilbakekobling, livsstadium og miljøsignal']],
      ['homeostase_toleranse', 'Homeostase og toleransegrenser', 'Hvilken variabel reguleres, rundt hvilket funksjonelt område, og når overskrides organismens kompensasjonskapasitet?', ['tidsserie for regulert variabel', 'stimulus, kontrollsenter og effektor', 'stress, akklimatisering, skade og restitusjon']]
    ]
  }
];

const METHOD_SPECS = [
  [
    'met_natur_populasjonsgenetisk_analyse',
    'Populasjonsgenetisk analyse',
    'Estimerer genetisk variasjon, allelfrekvenser og struktur mellom populasjoner og tester hvilke evolusjonsmekanismer dataene kan støtte.',
    'evolusjon_biologisk_mangfold',
    ['genotyper eller sekvenser med prøve-ID', 'allel- og genotypefrekvenser', 'lokalitet, tidspunkt og populasjonsavgrensning'],
    ['Definer populasjoner, tidsrom og arvelige markører før analysen.', 'Kontroller prøvestørrelse, slektskap, manglende data og markørkvalitet.', 'Beregn variasjon og frekvenser med usikkerhet for hver populasjon.', 'Sammenlign observerte mønstre med forventninger under drift, genflyt og seleksjon.', 'Rapporter alternative forklaringer og hvilke nye prøver som kan skille dem.'],
    ['Markører kan være nøytrale og ikke representere funksjonelle egenskaper.', 'Populasjonsavgrensning og skjev prøvetaking kan skape kunstig struktur.', 'Frekvensendring alene identifiserer ikke hvilken evolusjonsmekanisme som virket.']
  ],
  [
    'met_natur_komparativ_evolusjonsanalyse',
    'Komparativ evolusjonsanalyse',
    'Sammenligner egenskaper på tvers av arter eller populasjoner med slektskap, miljø og funksjon som eksplisitte kontrollnivåer.',
    'evolusjon_biologisk_mangfold',
    ['fylogenetisk tre med støtte', 'standardiserte egenskapsdata', 'miljø-, fossil- eller livshistoriedata'],
    ['Formuler alternative hypoteser om egenskapens opphav eller funksjon.', 'Velg sammenlignbare taksa og dokumenter fylogenetisk grunnlag.', 'Kod egenskaper og miljøvariable med samme definisjoner.', 'Kontroller om likheten følger felles avstamning eller uavhengige endringer.', 'Rapporter følsomhet for tre, utvalg, datering og manglende data.'],
    ['Arter er ikke uavhengige datapunkter når de deler evolusjonær historie.', 'Korrelasjon mellom egenskap og miljø dokumenterer ikke seleksjonsmekanismen alene.', 'Ufullstendig fossil- og artsutvalg kan endre rekonstruerte mønstre.']
  ],
  [
    'met_natur_biogeografisk_utbredelsesanalyse',
    'Biogeografisk utbredelsesanalyse',
    'Analyserer daterte artsfunn, spredning, barrierer, klima og historiske landskapsendringer for å forklare utbredelsesmønstre.',
    'evolusjon_biologisk_mangfold',
    ['georefererte og daterte artsfunn', 'registreringsinnsats og fraværsdata', 'klima-, høyde-, habitat- og paleogeografiske lag'],
    ['Avgrens art, tidsperiode, geografisk område og datakilder.', 'Rens koordinater og skill dokumentert fravær fra manglende søk.', 'Kartlegg funn mot innsats, barrierer, miljø og historiske endringer.', 'Test alternative forklaringer som spredning, vikarians og dagens habitat.', 'Rapporter skala, skjevhet, ekstrapolasjon og områder uten tilstrekkelige data.'],
    ['Artskart gjenspeiler både utbredelse og hvor noen har lett.', 'Dagens miljø kan ikke alene forklare historiske eller disjunkte mønstre.', 'Korrelative utbredelsesmodeller viser potensielle sammenhenger, ikke sikker årsak.']
  ],
  [
    'met_natur_respirometri_energiomsetning',
    'Respirometri og energiomsetning',
    'Måler oksygenforbruk eller karbondioksidproduksjon over tid for å estimere organismers eller prøvers metabolske rate.',
    'organismebiologi_fysiologi',
    ['oksygen- eller karbondioksidtidsserie', 'temperatur, masse, aktivitet og kammerdata', 'blankprøve og kalibreringsdata'],
    ['Definer organisme, fysiologisk tilstand og måleperiode.', 'Kalibrer sensor og mål blankkammerets bakgrunnsendring.', 'Kontroller temperatur, kammerstørrelse, masse og aktivitet.', 'Beregn gassendring per tid og relevant masse eller individ.', 'Rapporter lekkasje, stress, diffusjonsbegrensning og hva målet ikke sier om ATP direkte.'],
    ['Lukket kammer kan endre oksygen, karbondioksid, fukt og stress under forsøket.', 'Kroppsmasse og temperatur gjør rå rater lite sammenlignbare.', 'Gassutveksling kan påvirkes av fotosyntese, mikrober eller kjemiske prosesser i blandede prøver.']
  ],
  [
    'met_natur_komparativ_fysiologisk_maling',
    'Komparativ fysiologisk måling',
    'Sammenligner en definert fysiologisk variabel mellom arter, livsstadier eller miljøbetingelser med standardisert måling og kontroll.',
    'organismebiologi_fysiologi',
    ['temperatur, osmolaritet, puls, ventilasjon eller annen definert variabel', 'kroppsstørrelse, livsstadium og miljømetadata', 'kalibrering, kontrollgruppe og gjentakelser'],
    ['Velg én fysiologisk variabel og begrunn måleinstrument og enhet.', 'Standardiser tid, håndtering, temperatur, masse og livsstadium.', 'Mål kontroll og behandling med biologiske gjentakelser.', 'Analyser respons, variasjon, restitusjon og mulig terskel.', 'Skill kortvarig plastisitet fra akklimatisering og evolusjonær forskjell.'],
    ['Håndtering og måleutstyr kan selv utløse stressrespons.', 'Sammenligning mellom arter krever kontroll for størrelse, slektskap og livshistorie.', 'Én målevariabel representerer ikke hele organismens fysiologiske tilstand.']
  ],
  [
    'met_natur_stimulus_respons_forsok',
    'Stimulus–respons-forsøk',
    'Tester hvordan en presist definert fysisk eller kjemisk påvirkning endrer sanserespons, bevegelse, hormonell regulering eller annen fysiologisk funksjon.',
    'organismebiologi_fysiologi',
    ['standardisert stimulus med intensitet og varighet', 'latens, terskel, styrke eller sannsynlighet for respons', 'kontrollstimulus, rekkefølge og restitusjon'],
    ['Definer stimulus, forventet reseptor og målbar respons før forsøket.', 'Etabler kontroll, randomisert rekkefølge og tilstrekkelig hviletid.', 'Mål baseline, stimulusrespons og restitusjon uten å endre flere faktorer samtidig.', 'Test dose–respons eller terskel innenfor etisk og fysiologisk forsvarlige grenser.', 'Rapporter habituering, stress, individvariasjon og alternative sansekanaler.'],
    ['Gjentatte stimuli kan gi habituering, sensibilisering eller utmattelse.', 'Observerbar bevegelse identifiserer ikke automatisk reseptor eller nervebane.', 'Sterke stimuli kan måle skade eller flukt i stedet for normal fysiologisk regulering.']
  ]
];

const CHAPTERS = [
  {
    id: 'evolusjon_biologisk_mangfold',
    title: 'Evolusjon og biologisk mangfold',
    subtitle: 'Fra arvelig variasjon til arter, utdøing og historisk utbredelse',
    lead: 'Evolusjon er endring i arvelige egenskaper i populasjoner over generasjoner. Mutasjon og rekombinasjon skaper eller omfordeler variasjon, mens seleksjon, drift og genflyt endrer hvordan variantene fordeles. Over lengre tid kan isolasjon gi nye arter, utviklingslinjer kan forgrene seg eller dø ut, og klima, geologi og spredning kan forme hvor organismene finnes.',
    learningObjectives: ['skille kilder til variasjon fra mekanismer som endrer allelfrekvenser', 'sammenligne naturlig seleksjon, seksuell seleksjon, drift og genflyt', 'formulere testbare hypoteser om tilpasning og avveininger', 'forklare hvordan reproduktiv isolasjon kan gi artsdannelse', 'skille økologisk samspill fra dokumentert koevolusjon', 'analysere biologisk mangfold og utbredelse i historisk og geografisk sammenheng'],
    sections: [
      ['variasjon', '1. Arvelig variasjon er råmaterialet', [
        'Evolusjon forutsetter arvelig variasjon. Mutasjoner kan skape nye alleler, mens rekombinasjon og seksuell formering setter eksisterende alleler sammen i nye kombinasjoner. Mutasjoner oppstår ikke fordi en organisme trenger en bestemt løsning.',
        'Fenotypisk variasjon kan skyldes genetikk, miljø eller samspill mellom dem. Før en forskjell brukes i en evolusjonær forklaring, må det dokumenteres at den er arvelig eller knyttet til en arvelig variant.',
        'Populasjonsgenetikk beskriver variasjon med allel- og genotypefrekvenser. Estimatene avhenger av hvordan populasjonen er avgrenset, hvilke individer som er prøvetatt, og hvor sikre markørene og genotypene er.'
      ]],
      ['mekanismer', '2. Seleksjon, drift og genflyt', [
        'Naturlig seleksjon oppstår når arvelige forskjeller gir systematiske forskjeller i overlevelse eller reproduksjon. Seksuell seleksjon handler om forskjeller i paring eller befruktning, og kan favorisere egenskaper som samtidig har en overlevelseskostnad.',
        'Genetisk drift er tilfeldig endring i allelfrekvenser mellom generasjoner. Effekten er særlig sterk i små populasjoner, etter flaskehalser og når få grunnleggere etablerer en ny populasjon.',
        'Genflyt skjer når individer eller kjønnsceller flytter mellom populasjoner og bidrar genetisk til neste generasjon. Migrasjon uten reproduksjon er derfor ikke tilstrekkelig dokumentasjon på genflyt.'
      ]],
      ['tilpasning', '3. Tilpasning krever en testbar historie', [
        'En tilpasning er en arvelig egenskap som er formet av seleksjon i en bestemt sammenheng. At en egenskap virker nyttig, er bare starten på en hypotese; arvelighet, funksjon og reproduktiv konsekvens må undersøkes.',
        'Egenskaper har ofte avveininger. Ressurser brukt på vekst kan ikke samtidig brukes på vedlikehold eller reproduksjon, og en egenskap som hjelper i ett miljø kan være kostbar i et annet.',
        'Historiske og utviklingsmessige begrensninger betyr at evolusjon bygger videre på eksisterende strukturer. Resultatet er ikke nødvendigvis optimalt, og eksaptasjoner kan få en ny funksjon etter å ha oppstått i en annen sammenheng.'
      ]],
      ['artsdannelse', '4. Isolasjon, artsdannelse og makroevolusjon', [
        'Artsdannelse krever at genflyten reduseres og at populasjoner divergerer. Geografiske barrierer kan starte allopatrisk artsdannelse, mens økologiske, tidsmessige eller genetiske forskjeller kan utvikles i samme område.',
        'Prezygotiske barrierer hindrer paring eller befruktning, mens postzygotiske barrierer reduserer hybriders overlevelse eller fruktbarhet. Barrierer kan bygges gradvis, og hybridisering betyr at artsgrenser ikke alltid er absolutte.',
        'På lange tidsskalaer formes mangfoldet av både artsdannelse og utdøing. Fossilregister, fylogeni og nålevende arter viser ulike deler av historien og har forskjellige former for usikkerhet.'
      ]],
      ['biogeografi', '5. Biogeografi, koevolusjon og mangfold', [
        'Biogeografi undersøker hvordan spredning, barrierer, klima, høyde og geologisk historie former arters utbredelse. Istider kan ha flyttet utbredelsesgrenser og etterlatt refugier, disjunkte bestander og genetiske spor.',
        'Koevolusjon krever gjensidig evolusjonær påvirkning. At to arter samhandler i dag viser ikke alene at de har formet hverandres evolusjon; tids-, slektskaps- eller funksjonsdata må støtte gjensidigheten.',
        'Biologisk mangfold omfatter genetisk variasjon, arter og økosystemer. Artsantall alene kan skjule tap av lokale genlinjer, funksjoner eller leveområder, og artskart må alltid leses sammen med registreringsinnsats.'
      ]]
    ],
    concepts: [
      ['allelfrekvens', 'Allelfrekvens', 'Andelen av en bestemt allel blant alle kopier av genet i en populasjon.'],
      ['genetisk_drift', 'Genetisk drift', 'Tilfeldig endring i allelfrekvens mellom generasjoner.'],
      ['genflyt', 'Genflyt', 'Overføring av alleler mellom populasjoner gjennom reproduksjon.'],
      ['naturlig_seleksjon', 'Naturlig seleksjon', 'Systematiske forskjeller i reproduktiv suksess knyttet til arvelig variasjon.'],
      ['seksuell_seleksjon', 'Seksuell seleksjon', 'Seleksjon gjennom forskjeller i tilgang til paring eller befruktning.'],
      ['tilpasning', 'Tilpasning', 'Arvelig egenskap formet av seleksjon i en bestemt sammenheng.'],
      ['reproduktiv_isolasjon', 'Reproduktiv isolasjon', 'Barrierer som reduserer genflyt mellom populasjoner.'],
      ['koevolusjon', 'Koevolusjon', 'Gjensidig evolusjonær påvirkning mellom utviklingslinjer.'],
      ['utdoing', 'Utdøing', 'Globalt tap av en art eller utviklingslinje.'],
      ['biogeografi', 'Biogeografi', 'Studiet av organismers utbredelse i rom og gjennom historie.']
    ],
    sources: [
      ['OpenStax Biology 2e – Population Genetics', 'https://openstax.org/books/biology-2e/pages/19-2-population-genetics'],
      ['OpenStax Biology 2e – Formation of New Species', 'https://openstax.org/books/biology-2e/pages/18-2-formation-of-new-species'],
      ['Understanding Evolution – Causes of Speciation', 'https://evolution.berkeley.edu/evolution-101/speciation/causes-of-speciation/'],
      ['Understanding Evolution – Coevolution', 'https://evolution.berkeley.edu/evolution-101/mechanisms-the-processes-of-evolution/coevolution/'],
      ['Understanding Evolution – Patterns in Macroevolution', 'https://evolution.berkeley.edu/evolution-101/macroevolution/patterns-in-macroevolution/']
    ],
    examples: [
      ['En isolert dam-populasjon', 'To salamanderlokaliteter ser ut til å ha ulik genetisk variasjon.', ['Definer populasjonene og bruk samme markør- og prøvetakingsdesign.', 'Estimer variasjon og struktur med usikkerhet.', 'Undersøk avstand, barrierer og mulig reproduktiv kontakt.', 'Skill drift og flaskehals fra lokal seleksjon før årsak konkluderes.']],
      ['Et utbredelseskart etter istiden', 'En plante finnes i adskilte fjellområder.', ['Kontroller funndato, koordinater og registreringsinnsats.', 'Sammenlign dagens klima og habitat med historiske refugiehypoteser.', 'Bruk fylogeni eller populasjonsdata for å teste felles historie.', 'Rapporter spredning og vikarians som alternative forklaringer.']]
    ],
    places: [
      ['naturhistorisk_museum', 'Naturhistorisk museum', 'Samlinger, fossiler og dokumenterte belegg gjør evolusjonære slektskap og historisk mangfold etterprøvbart.'],
      ['blindern_forskningsparken_salamanderdam', 'Salamanderdammen ved Forskningsparken', 'En avgrenset amfibielokalitet gir inngang til populasjon, genflyt, isolasjon og livshistorie.']
    ]
  },
  {
    id: 'organismebiologi_fysiologi',
    title: 'Organismebiologi og fysiologi',
    subtitle: 'Fra celleånding og transport til sanser, regulering og toleranse',
    lead: 'Fysiologi undersøker hvordan levende organismer faktisk fungerer. Energi må omformes, gasser og næringsstoffer må transporteres, vann og ioner må balanseres, signaler må registreres og responsen må koordineres. Organismer løser disse oppgavene på ulike måter, men alle fysiologiske forklaringer må kobles til målbare variable, reguleringsmekanismer og miljøbetingelser.',
    learningObjectives: ['forklare hvordan celleånding kobler næringsstoffer til ATP og varme', 'sammenligne gassutveksling og sirkulasjon hos ulike organismer', 'analysere vann-, salt- og temperaturregulering', 'følge stimuli gjennom sanser, nervesystem og bevegelse', 'koble fordøyelse og hormoner til ressursfordeling', 'skille homeostase, stress, akklimatisering og evolusjonær tilpasning'],
    sections: [
      ['energi', '1. Energiomsetning fra molekyl til organisme', [
        'Celler overfører energi fra næringsstoffer til ATP gjennom reaksjonsveier som glykolyse, sitronsyresyklus og elektrontransport. ATP driver blant annet aktiv transport, biosyntese og bevegelse, mens en del energi avgis som varme.',
        'Celleånding og pusting er ikke det samme. Pusting eller ventilasjon flytter medium over en respirasjonsflate, gassutveksling flytter gasser ved diffusjon, og celleånding bruker kjemiske reaksjoner til å frigjøre energi.',
        'Respirometri estimerer metabolsk rate fra oksygenforbruk eller karbondioksidproduksjon. Temperatur, kroppsmasse, aktivitet, kammerforhold og andre organismer i prøven må kontrolleres før rater sammenlignes.'
      ]],
      ['transport', '2. Gassutveksling og transport', [
        'Gasser diffunderer langs partialtrykks- eller konsentrasjonsgradienter. Tynne, fuktige og store respirasjonsflater øker utvekslingen, men må samtidig ventileres og beskyttes mot skade eller vanntap.',
        'Sirkulasjonssystemer flytter gasser, næring, avfall og signalstoff. Åpne systemer lar hemolymfe strømme rundt organene, mens lukkede systemer holder transportvæsken i kar og kan regulere trykk og fordeling mer presist.',
        'Kroppsstørrelse, aktivitet og miljø påvirker hvor transporten begrenses. Et dyr kan ventilere raskt uten at vevet mottar mer oksygen dersom sirkulasjon, pigmentbinding eller diffusjon er flaskehalsen.'
      ]],
      ['balanse', '3. Vann, salter og temperatur', [
        'Osmose flytter vann over semipermeable membraner, mens ioner ofte krever kanaler, transportører og energi. Ferskvanns- og saltvannsorganismer møter motsatte retninger for passiv vann- og saltbevegelse.',
        'Temperatur påvirker reaksjonshastigheter, membraner og gassbehov. Ektoterme organismer henter hoveddelen av varmen utenfra, mens endoterme organismer produserer mye varme metabolsk; begge kan bruke atferd til regulering.',
        'Regulering har kostnader. Aktiv ionetransport, fordampningskjøling og varmeproduksjon bruker energi eller vann, og fysiologiske strategier må derfor forstås som avveininger i et bestemt miljø.'
      ]],
      ['signal', '4. Sanser, nervesystem, bevegelse og hormoner', [
        'Sansereseptorer omdanner lys, lyd, trykk eller kjemiske stoffer til elektriske signaler. Reseptorens terskel og følsomhet avgjør hva som registreres, mens nervesystemet integrerer flere signaler før respons.',
        'Aksjonspotensialer forplanter signal langs nevroner, synapser overfører signal mellom celler, og nevromuskulære koblinger kan aktivere kontraksjon. Synlig bevegelse viser sluttresponsen, ikke hele signalveien.',
        'Hormoner fraktes til målvev og virker bare der relevante reseptorer finnes. Endokrine signaler er ofte langsommere enn nerveimpulser, men kan koordinere metabolisme, vekst, stress og reproduksjon over lengre tid.'
      ]],
      ['homeostase', '5. Ernæring, reproduksjon og dynamisk homeostase', [
        'Fordøyelse bryter makromolekyler ned, mens absorpsjon flytter næringsstoffer over en overflate og inn i transportveier. Fødeinntak sier derfor ikke direkte hvor mye energi eller byggestoff organismen kan bruke.',
        'Reproduksjon krever gameter, signaler og ressurser, og reguleres ofte av miljøsignaler og hormonsløyfer. Investering i avkom, vekst og vedlikehold konkurrerer om energi og kan endres gjennom livsløpet.',
        'Homeostase er dynamisk regulering rundt funksjonelle områder. Negativ tilbakekobling motvirker avvik, men settpunkter og toleranse kan endres ved døgnrytme, livsstadium og akklimatisering; overskrides kapasiteten, oppstår stress eller skade.'
      ]]
    ],
    concepts: [
      ['atp', 'ATP', 'Molekyl som overfører kjemisk energi til cellulært arbeid.'],
      ['metabolsk_rate', 'Metabolsk rate', 'Energiomsetning per tidsenhet under definerte betingelser.'],
      ['partialtrykk', 'Partialtrykk', 'Den delen av totaltrykket som skyldes én gass.'],
      ['sirkulasjon', 'Sirkulasjon', 'Organisert massetransport av væske og stoffer gjennom kroppen.'],
      ['osmoregulering', 'Osmoregulering', 'Regulering av vann og oppløste stoffer i kroppsvæsker.'],
      ['ektotermi', 'Ektotermi', 'Strategi der hoveddelen av kroppsvarmen kommer fra miljøet.'],
      ['transduksjon', 'Transduksjon', 'Omdanning av et stimulus til et biologisk signal.'],
      ['aksjonspotensial', 'Aksjonspotensial', 'Kort elektrisk signal som forplanter seg langs en eksitabel celle.'],
      ['hormon', 'Hormon', 'Signalstoff som virker på celler med passende reseptor.'],
      ['homeostase', 'Homeostase', 'Dynamisk regulering av indre variable innenfor funksjonelle områder.']
    ],
    sources: [
      ['OpenStax Biology 2e – Homeostasis', 'https://openstax.org/books/biology-2e/pages/33-3-homeostasis'],
      ['OpenStax Biology 2e – Gas Exchange across Respiratory Surfaces', 'https://openstax.org/books/biology-2e/pages/39-2-gas-exchange-across-respiratory-surfaces'],
      ['OpenStax Biology 2e – Overview of the Circulatory System', 'https://openstax.org/books/biology-2e/pages/40-1-overview-of-the-circulatory-system'],
      ['OpenStax Biology 2e – Osmoregulation and Osmotic Balance', 'https://openstax.org/books/biology-2e/pages/41-1-osmoregulation-and-osmotic-balance'],
      ['American Physiological Society – What Is Physiology?', 'https://www.physiology.org/career/teaching-learning-resources/student-resources/what-is-physiology']
    ],
    examples: [
      ['Oksygenforbruk hos smådyr', 'To grupper små krepsdyr måles ved ulik temperatur.', ['Kalibrer sensor og mål blankkammer.', 'Standardiser individantall, masse, volum og akklimatisering.', 'Beregn oksygenendring per tid og relevant biomasse.', 'Skill temperaturrespons fra stress, aktivitet og fallende kammeroksygen.']],
      ['Salamanderens respons på vanntemperatur', 'Aktivitet ser ut til å endres langs en temperaturgradient.', ['Definer målbar aktivitet og temperaturintervaller.', 'Randomiser rekkefølge og gi restitusjon mellom målinger.', 'Registrer kroppsstørrelse, livsstadium og oksygenforhold.', 'Tolk responsen som kortvarig fysiologi før adaptiv forklaring vurderes.']]
    ],
    places: [
      ['blindern_forskningsparken_salamanderdam', 'Salamanderdammen ved Forskningsparken', 'Amfibier kobler gassutveksling, osmoregulering, temperatur, bevegelse og reproduksjon til et konkret miljø.'],
      ['ostensjovannet_fugletarn', 'Østensjøvannet fugletårn', 'Fuglers aktivitet gir inngang til energiomsetning, temperaturregulering, sanser og livssyklus når observasjonen standardiseres.']
    ]
  }
];

function main() {
  const pensum = readJson(P.pensum);
  const contract = readJson(P.contract);
  const emner = readJson(P.emner);
  const methodsDoc = readJson(P.methods);
  const fagkart = readJson(P.fagkart);
  const mappings = readJson(P.mappings);
  const registry = readJson(P.registry);
  const status = readJson(P.status);

  const newEmneIds = new Set(DOMAIN_SPECS.flatMap((domain) => domain.emners.map((entry) => entry.id)));
  const newMethodIds = new Set(METHOD_SPECS.map((entry) => entry[0]));
  const newDomainIds = new Set(DOMAIN_SPECS.map((entry) => entry.id));
  const baseEmners = emner.filter((entry) => !newEmneIds.has(entry.emne_id));
  const baseMethods = methodsDoc.methods.filter((entry) => !newMethodIds.has(entry.method_id));
  const baseMappings = mappings.filter((entry) => !newEmneIds.has(entry.emne_id));
  const baseCategories = fagkart.categories.filter((entry) => !newDomainIds.has(entry.id));

  assert(baseEmners.length === 53, `Forventet fase-1-baseline med 53 emner, fikk ${baseEmners.length}`);
  assert(baseMethods.length === 39, `Forventet fase-1-baseline med 39 metoder, fikk ${baseMethods.length}`);
  assert(baseMappings.length === 53, `Forventet fase-1-baseline med 53 mappingrader, fikk ${baseMappings.length}`);
  assert(baseCategories.length === 9, `Forventet fase-1-baseline med 9 fagkartkategorier, fikk ${baseCategories.length}`);

  const newCategories = DOMAIN_SPECS.map(buildCategory);
  const hookIndex = new Map(newCategories.flatMap((category) => category.topic_hooks.map((hook) => [hook.id, hook])));
  const newEmners = DOMAIN_SPECS.flatMap((domain) => domain.emners.map((entry) => buildEmne(domain, entry)));
  const newMethods = METHOD_SPECS.map((spec) => buildMethod(spec, DOMAIN_SPECS));
  const newMappings = DOMAIN_SPECS.flatMap((domain) => domain.emners.map((entry) => buildMapping(domain, entry, hookIndex)));

  emner.splice(0, emner.length, ...baseEmners, ...newEmners);
  methodsDoc.methods = [...baseMethods, ...newMethods];
  mappings.splice(0, mappings.length, ...baseMappings, ...newMappings);
  const domainOrder = new Map(pensum.domain_order.map((domainId, index) => [domainId, index]));
  fagkart.categories = [...baseCategories, ...newCategories]
    .sort((left, right) => domainOrder.get(left.id) - domainOrder.get(right.id));
  fagkart.meta.category_count = fagkart.categories.length;
  fagkart.meta.hook_count = fagkart.categories.reduce((sum, category) => sum + category.topic_hooks.length, 0);
  fagkart.meta.canonical_round = 'v5.2';
  fagkart.version = 'v5.2-canonical-biology-phase-2';
  fagkart.canonical_registry_version = 'naturpensum_v5_2';
  fagkart.updated_at = TODAY;
  methodsDoc.version = 'v5.2-canonical-biology-phase-2';
  methodsDoc.updated_at = TODAY;

  for (const domain of DOMAIN_SPECS) {
    const pensumDomain = pensum.domains.find((entry) => entry.domain_id === domain.id);
    const contractDomain = contract.required_domains.find((entry) => entry.domain_id === domain.id);
    assert(pensumDomain && contractDomain, `Mangler domenepost ${domain.id}`);
    updateDomainRecord(pensumDomain, domain, 'materialized_biology_layer');
    updateDomainRecord(contractDomain, domain, 'materialized_biology_layer');
  }

  pensum.version = 'v5.2-canonical-biology-phase-2';
  pensum.canonical_registry_version = 'naturpensum_v5_2';
  pensum.updated_at = TODAY;
  pensum.summary = {
    ...pensum.summary,
    materialized_domain_count: 10,
    partial_domain_count: 1,
    required_gap_domain_count: 1,
    current_emne_count: emner.length,
    current_method_count: methodsDoc.methods.length,
    current_mapping_count: mappings.length,
    current_topic_hook_count: fagkart.meta.hook_count,
    all_current_emners_have_mapping: true,
    all_current_method_refs_valid: true,
    editorial_complete: false
  };
  pensum.coverage_statement = 'De seks eksisterende miljøkapitlene og fase-1-kapitlene for artskunnskap, botanikk og zoologi er bevart. Evolusjon og biologisk mangfold samt organismebiologi og fysiologi er nå materialisert. Natur er fortsatt ikke heldekkende før sopp/lav/mikroorganismer og geologiens indre prosesser og naturhistorie er fullført.';

  contract.version = '1.2.0';
  contract.updated_at = TODAY;
  contract.current_state = {
    materialized_environment_domains: ['okosystem_mangfold_habitat', 'vann_hydrologi_kretslop', 'klima_energi_resiliens', 'urban_okologi_gronnstruktur', 'miljopavirkning_forvaltning_regenerasjon'],
    materialized_biology_domains: ['artskunnskap_systematikk', 'evolusjon_biologisk_mangfold', 'botanikk_vegetasjon', 'zoologi_dyreliv', 'organismebiologi_fysiologi'],
    partial_domains: ['geologi_landskap_tid'],
    required_gap_domains: ['sopp_lav_mikroorganismer'],
    preserved_environment_layer_counts: { emner: 35, methods: 30, mappings: 35, hooks: 60, chapters: 6 },
    phase_1_biology_layer_counts: { emner: 18, methods: 9, mappings: 18, hooks: 30, chapters: 3 },
    current_emne_count: emner.length,
    current_method_count: methodsDoc.methods.length,
    current_mapping_count: mappings.length,
    current_hook_count: fagkart.meta.hook_count,
    current_chapter_count: 11,
    editorial_status: 'chapters_in_progress'
  };

  const naturRegistry = registry.subjects.natur;
  naturRegistry.description = 'Et sammenhengende læreverk om økologi, artskunnskap, evolusjon, botanikk, zoologi, fysiologi, vann, klima, geologi, urban natur, miljøpåvirkning og forvaltning.';
  naturRegistry.canonicalModel.note = 'Emnetitler, definisjoner, fagområder og metodekoblinger leses fra canonical Natur v5.2 gjennom kompatibilitetsfilene. Registryet eier elleve redigerte lærekapitler.';
  naturRegistry.chapters = naturRegistry.chapters.filter((entry) => !newDomainIds.has(entry.id));
  for (const domain of DOMAIN_SPECS) {
    const chapterSpec = CHAPTERS.find((entry) => entry.id === domain.id);
    const chapter = chapterDocument(chapterSpec, domain.emners.map((entry) => entry.id));
    const file = `data/fagverk/natur/${domain.id}.json`;
    writeJson(file, chapter);
    naturRegistry.chapters.push({
      id: domain.id,
      title: chapter.title,
      subtitle: chapter.subtitle,
      file,
      primary_domain_id: domain.id,
      emne_ids: domain.emners.map((entry) => entry.id)
    });
  }
  const order = new Map(pensum.domain_order.map((id, index) => [id, index]));
  naturRegistry.chapters.sort((left, right) => (order.get(left.primary_domain_id) ?? 99) - (order.get(right.primary_domain_id) ?? 99));

  const naturStatus = status.subjects.find((entry) => entry.id === 'natur');
  naturStatus.nextGate = 'materialize_microbiology_and_inner_geology';
  naturStatus.note = 'Natur har nå elleve redigerte kapitler. Evolusjon og biologisk mangfold samt organismebiologi og fysiologi er materialisert med egne emner, metoder og fagkart. Den universelle tolvdelsmodellen mangler fortsatt sopp/lav/mikroorganismer, og geologi er delvis fordi indre prosesser og full naturhistorie gjenstår. Natur er derfor fortsatt ikke complete.';

  writeJson(P.emner, emner);
  writeJson(P.methods, methodsDoc);
  writeJson(P.mappings, mappings);
  writeJson(P.fagkart, fagkart);
  writeJson(P.pensum, pensum);
  writeJson(P.contract, contract);
  writeJson(P.registry, registry);
  writeJson(P.status, status);

  console.log(`Materialisert Natur biologi fase 2: ${emner.length} emner, ${methodsDoc.methods.length} metoder, ${mappings.length} mappingrader, ${fagkart.meta.hook_count} hooks og ${naturRegistry.chapters.length} kapitler.`);
}

main();
