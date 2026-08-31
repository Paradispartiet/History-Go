#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-08-31';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const targets = {
  'data/places/historie/oslo/places_historie/akershus_slott.json': {
    sources: [
      ['Forsvarshistorisk museum – Akershus slott', 'https://www.forsvarshistoriskmuseum.no/akershus-slott'],
      ['Forsvarsbygg – Akershus festning', 'https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning'],
      ['Store norske leksikon – Akershus slott og festning', 'https://snl.no/Akershus_slott_og_festning'],
      ['Riksantikvaren – salene i Akershus slott i nytt lys', 'https://riksantikvaren.no/eksempelsamling/salene-i-akershus-slott-i-nytt-lys/'],
      ['Riksantikvaren – heis på Akershus slott', 'https://riksantikvaren.no/heis-pa-akershus-slott/']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'full',
      status: 'curated',
      intro: 'Akershus slott kan leses som et sammenbygd kildearkiv der middelalderborg, renessanseslott, statsrepresentasjon og moderne restaurering ligger oppå hverandre. Faglig analyse krever at byggeperioder, senere rekonstruksjoner og dagens bruk holdes fra hverandre, slik at synlig murverk ikke automatisk behandles som urørt middelaldermateriale.',
      article: [
        'Slottets eldste fase må forstås i middelalderens politiske og urbane landskap. Byggingen begynte sannsynligvis under Håkon V i perioden 1299–1304, og borgen kunne allerede i 1308 motstå et alvorlig angrep. Dette gjør Akershus til et spor etter kongemakt, befestning og statsdannelse, men dateringen viser også hvorfor historikeren må skille et teknisk tidsanker fra et sikkert byggeår. Slottet var en konkret residens- og forsvarsstruktur i et Oslo der kongelige og kirkelige institusjoner begge organiserte makt, eiendom og jurisdiksjon.',
        'Den middelalderske borgen er ikke identisk med slottet som senere tok form. Brannen i 1527 ble et brudd, og under Christian IV ble anlegget omformet til et renessanseslott med andre romlige og representative behov. Etter eneveldets innføring i 1661 sluttet Akershus å være fast kongelig residens, men administrative og seremonielle funksjoner fortsatte. Ett bygg kan derfor bære kontinuitet som statssted samtidig som både arkitektur og institusjonell funksjon endres betydelig.',
        'Restaureringen på 1900-tallet er selv et historisk lag. Holger Sinding-Larsens undersøkelser fra 1905 og Arnstein Arnebergs senere arbeid innebar valg om hva som skulle bevares, rekonstrueres, innredes og framheves. Begrepet autentisitet kan derfor ikke reduseres til hvor gammelt et rom ser ut. Dagens saler kombinerer eldre materiale, dokumenterte restaureringsgrep og nyere tekniske løsninger. Riksantikvarens beskrivelser gjør det mulig å studere restaurering som kunnskapsproduksjon og kulturminnepolitikk, ikke bare som reparasjon.',
        'Materielle spor må kobles til dokumentasjon. Rosevinduet i Olav V hall ble skadet i 1943 og restaurert i 2023 med hjelp av tegninger som ble gjenfunnet i 2009. Vinduet viser dermed både et fysisk objekt, en krigsskade, et arkivfunn og en moderne rekonstruksjon. På samme måte kan vegger, saler og tekstiler undersøkes som observerbare spor, men deres alder, opprinnelse og endringshistorie må dokumenteres med kilder. Det synlige stedet er evidens, men ikke en komplett forklaring på seg selv.',
        'Slottet ble tatt i bruk igjen til festlige representasjonsformål i 1947, restaureringsarbeidet ble regnet som fullført i 1962, og salene brukes fortsatt ved statlige middager og mottakelser. Samtidig er de tilgjengelige gjennom omvisning og tilpasninger som lys og heis. Dette gjør Akershus slott til et levende kulturminne der historiebruk, tilgjengelighet og representasjon fortsetter å produsere nye lag. Den analytiske avgrensningen er avgjørende: slottet er ikke hele Akershus festning, ikke museene og ikke slottskirken, selv om institusjonene ligger tett og deler historie.'
      ],
      subject_ids: ['historie'],
      emne_ids: ['em_his_middelalder_oslo','em_his_kongemakt_kirke_konflikt','em_his_stat_institusjoner','em_his_spor_materialitet','em_his_restaurering_autentisitet','em_his_minnesteder_historiebruk'],
      chapter_ids: ['middelalder_kirke_kongemakt','makt_stat_institusjoner','kilder_arkiv_spor','minne_kulturarv_historiebruk'],
      lenses: [
        {id:'akershus-slott-middelalder',title:'Borg i middelalderbyen',prompt:'Hvordan kan Akershus slott brukes til å undersøke kongemakt og befestning uten å gjøre 1299 til et sikkert byggeår?',subject_id:'historie',emne_id:'em_his_middelalder_oslo',evidence:'Sammenhold dateringsintervallet 1299–1304 med angrepet i 1308 og slottets avgrensede fysiske plass på Akersneset.'},
        {id:'akershus-slott-funksjon',title:'Statsfunksjon gjennom endring',prompt:'Hvordan kan et sted beholde statlig betydning når residensfunksjon, arkitektur og seremoniell bruk endres gjennom århundrene?',subject_id:'historie',emne_id:'em_his_stat_institusjoner',evidence:'Følg overgangen fra middelalderborg og kongelig residens til administrative og representative funksjoner etter eneveldet.'},
        {id:'akershus-slott-materialitet',title:'Murverk er ikke fasit',prompt:'Hva kan synlige bygningsdeler dokumentere direkte, og hvilke påstander om alder og opprinnelse krever skriftlige restaureringskilder?',subject_id:'historie',emne_id:'em_his_spor_materialitet',evidence:'Skille observerbar form og materiale fra dateringer, ombygginger og rekonstruksjoner som må etableres gjennom dokumentasjon.'},
        {id:'akershus-slott-restaurering',title:'Restaurering former autentisitet',prompt:'Hvordan endrer restaureringsvalg hva besøkeren oppfatter som gammelt, opprinnelig og historisk autentisk i slottets saler?',subject_id:'historie',emne_id:'em_his_restaurering_autentisitet',evidence:'Bruk Sinding-Larsens og Arnebergs arbeider samt Riksantikvarens dokumentasjon av senere inngrep som egne historiske lag.'},
        {id:'akershus-slott-historiebruk',title:'Representasjon som historiebruk',prompt:'Hvordan påvirker dagens statlige representasjon, omvisning og tilgjengelighet hvilke historiske betydninger Akershus slott får i samtiden?',subject_id:'historie',emne_id:'em_his_minnesteder_historiebruk',evidence:'Sammenhold gjenåpningen i 1947 med fortsatt seremoniell bruk og nyere kulturminnetiltak uten å gjøre dagens funksjon tidløs.'}
      ],
      guiding_questions: [
        'Hvorfor bør byggeintervallet 1299–1304 skilles fra et sikkert byggeår for Akershus slott?',
        'Hvordan endret Christian IVs ombygging både arkitektur og representasjon ved det eldre borganlegget?',
        'Hva kan restaurerte saler fortelle om middelalderen, og hva forteller de om 1900-tallet?',
        'Hvordan viser rosevinduet samspillet mellom fysisk skade, arkivfunn og moderne rekonstruksjon?',
        'Hvorfor må Akershus slott holdes analytisk adskilt fra festningen og museene rundt?'
      ],
      concepts: ['middelalderborg','kongemakt','statsinstitusjon','renessanseomforming','materialitet','restaurering','autentisitet','rekonstruksjon','historiebruk','representasjon'],
      observable_traces: [
        {title:'Borggård og bygningslag',observation:'Borggården og de omkringliggende fløyene viser ulike murflater, åpninger og bygningsledd som er synlige i samme slottskompleks.',interpretation_boundary:'Synlige forskjeller kan dokumentere fysisk variasjon, men sikker datering og tolkning av byggefaser krever arkitektoniske og historiske kilder.',source_urls:['https://snl.no/Akershus_slott_og_festning','https://www.forsvarshistoriskmuseum.no/akershus-slott']},
        {title:'Rosevindu i Olav V hall',observation:'Rosevinduet står som et konkret restaurert bygningsobjekt i en sal med dokumenterte eldre og nyere inngrep.',interpretation_boundary:'Vinduets nåværende form dokumenterer resultatet av restaureringen, mens skadehistorie, tegningfunn og rekonstruksjonsvalg må leses i dokumentasjonen.',source_urls:['https://riksantikvaren.no/eksempelsamling/salene-i-akershus-slott-i-nytt-lys/']}
      ],
      source_urls: ['https://www.forsvarshistoriskmuseum.no/akershus-slott','https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning','https://snl.no/Akershus_slott_og_festning','https://riksantikvaren.no/eksempelsamling/salene-i-akershus-slott-i-nytt-lys/','https://riksantikvaren.no/heis-pa-akershus-slott/'],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06/forsvarsmuseet.json': {
    sources: [
      ['Forsvarshistorisk museum – Forsvarsmuseet', 'https://www.forsvarshistoriskmuseum.no/forsvarsmuseet'],
      ['Forsvarshistorisk museum – samlingen', 'https://www.forsvarshistoriskmuseum.no/samlingen'],
      ['Store norske leksikon – Forsvarshistorisk museum', 'https://snl.no/Forsvarshistorisk_museum'],
      ['Sikt – Forsvarsmuseets endringshistorie', 'https://forvaltningsdatabasen.sikt.no/data/enhet/57606/endringshistorie']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2', level: 'standard', status: 'curated',
      intro: 'Forsvarsmuseet viser hvordan en samling kan utvikle seg fra militært modellkammer til offentlig museum, samtidig som selve Hovedarsenalet skifter fra lagerbygg til formidlingssted. Gjenstander kan brukes som historiske kilder, men katalogopplysninger, utstillingsvalg og institusjonshistorie må holdes fra hverandre.',
      article: [
        'Museumshistorien føres tilbake til Artillerimuseets modellkammer fra 1860 og Intendanturmuseet fra 1928. Da Hærmuseet formelt ble opprettet i 1940, ble ulike militære samlinger samlet institusjonelt. Okkupasjonen avbrøt arbeidet, samlinger ble flyttet og deler gikk tapt, før materialet kom tilbake til Akershus etter krigen. Denne tidslinjen viser at en museumsinstitusjon består av både objekter, organisasjon, lokaler og forvaltningshistorie.',
        'Forsvarsmuseet åpnet i det renoverte Hovedarsenalet 22. august 1978. Bygningen gjør den militære institusjonshistorien stedlig, men den er ikke opprinnelsessted for alle våpen, uniformer eller tekniske gjenstander som vises der. En prøvekarabin eller en historisk budstikke kan gi informasjon om materiale, konstruksjon, produsent og registrert bruk, mens beslutninger, erfaringer og større militære systemer krever andre kildetyper.',
        'Utstillingen er også et historisk argument. Når objekter ordnes etter perioder, teknologi eller konflikt, produserer museet forbindelser og prioriteringer som besøkeren må kunne undersøke. Samlingen dokumenterer fortiden, mens kurateringen dokumenterer hvordan institusjonen velger å fortelle den. Derfor bør katalog, utstillingstekst, bygningshistorie og eksterne kilder sammenholdes i stedet for å behandles som én samlet fasit.'
      ],
      subject_ids: ['historie'],
      emne_ids: ['em_his_stat_institusjoner','em_his_spor_materialitet','em_his_minnesteder_historiebruk','em_his_samtid_ettertid_fortelling','em_his_museum_samling_kanon'],
      chapter_ids: ['makt_stat_institusjoner','kilder_arkiv_spor','historisk_tid_periodisering','minne_kulturarv_historiebruk'],
      lenses: [
        {id:'forsvarsmuseet-institusjon',title:'Samling blir institusjon',prompt:'Hvordan endret modellkammer, spesialsamlinger og Hærmuseum organisatorisk form før Forsvarsmuseet åpnet i Hovedarsenalet?',subject_id:'historie',emne_id:'em_his_stat_institusjoner',evidence:'Sett 1860, 1928, 1940, etterkrigsårene og åpningen i 1978 i én dokumentert institusjonell tidslinje.'},
        {id:'forsvarsmuseet-gjenstand',title:'Gjenstanden som kilde',prompt:'Hva kan en museumsgjenstand dokumentere sikkert om teknologi, og hvilke spørsmål krever andre arkiv- eller beslutningskilder?',subject_id:'historie',emne_id:'em_his_spor_materialitet',evidence:'Skill registrert materiale, produsent, datering og formål fra tolkninger om anskaffelse, erfaring og samlet militær effekt.'},
        {id:'forsvarsmuseet-kanon',title:'Utvalg skaper kanon',prompt:'Hvordan påvirker utvalg og utstillingsrekkefølge hvilke deler av forsvarshistorien som framstår som mest sentrale for besøkeren?',subject_id:'historie',emne_id:'em_his_museum_samling_kanon',evidence:'Les monter, periodisering og kategorisering som kuraterte valg og sammenhold dem med katalogens bredere samlingsdata.'},
        {id:'forsvarsmuseet-fortelling',title:'Ettertid organiserer fortiden',prompt:'Hvordan kan dagens museumsfortelling undersøkes som en senere historisk konstruksjon uten å avvise gjenstandene som primærkilder?',subject_id:'historie',emne_id:'em_his_samtid_ettertid_fortelling',evidence:'Hold objektenes egen proveniens fra museets senere tekstlige og romlige organisering av dem i utstillingen.'}
      ],
      guiding_questions: [
        'Hvordan utviklet modellkammeret fra 1860 seg til en samlet museumsinstitusjon på Akershus?',
        'Hvorfor må Hovedarsenalet skilles fra opprinnelsesstedene til gjenstandene som vises der?',
        'Hva kan en prøvekarabin dokumentere direkte, og hvilke militære beslutninger ligger utenfor objektet?',
        'Hvordan kan utstillingsrekkefølge påvirke hvilke aktører og teknologier som får størst historisk betydning?',
        'Hva forteller okkupasjonens flyttinger og tap om sårbarheten i en historisk samling?'
      ],
      concepts: ['modellkammer','museumssamling','institusjon','proveniens','materialitet','kuratering','kanon','ettertidsfortelling','kildekritikk'],
      observable_traces: [
        {title:'Hovedarsenalet som museum',observation:'Forsvarsmuseet bruker det tidligere arsenalbygget som fysisk ramme for en samling som er skapt og flyttet over lang tid.',interpretation_boundary:'Bygningen dokumenterer dagens og senere museumsbruk, men er ikke bevis for at alle utstilte objekter historisk hørte hjemme akkurat her.',source_urls:['https://www.forsvarshistoriskmuseum.no/forsvarsmuseet','https://snl.no/Forsvarshistorisk_museum']},
        {title:'Gjenstander i utstillingssystem',observation:'Våpen, uniformer og andre objekter vises med etiketter og periodisering som knytter individuelle gjenstander til større historiske fortellinger.',interpretation_boundary:'Monter og etiketter dokumenterer museets kuratering, mens hvert objekts opprinnelse og bruk må kontrolleres mot katalog og andre kilder.',source_urls:['https://www.forsvarshistoriskmuseum.no/samlingen']}
      ],
      source_urls: ['https://www.forsvarshistoriskmuseum.no/forsvarsmuseet','https://www.forsvarshistoriskmuseum.no/samlingen','https://snl.no/Forsvarshistorisk_museum','https://forvaltningsdatabasen.sikt.no/data/enhet/57606/endringshistorie'],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/historie/oslo/places_historie_atlas_obscura_museum_batch_06/norges_hjemmefrontmuseum.json': {
    sources: [
      ['Forsvarshistorisk museum – Norges Hjemmefrontmuseum', 'https://www.forsvarshistoriskmuseum.no/norges-hjemmefrontmuseum'],
      ['Forsvarshistorisk museum – samlingen', 'https://www.forsvarshistoriskmuseum.no/samlingen'],
      ['Norges Hjemmefrontmuseum – biblioteket', 'https://www.forsvarshistoriskmuseum.no/norges-hjemmefrontmuseum/biblioteket-ved-norges-hjemmefrontmuseum'],
      ['Store norske leksikon – Norges Hjemmefrontmuseum', 'https://snl.no/Norges_Hjemmefrontmuseum'],
      ['Sikt – Norges Hjemmefrontmuseums endringshistorie', 'https://forvaltningsdatabasen.sikt.no/data/enhet/53012/endringshistorie']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2', level: 'standard', status: 'curated',
      intro: 'Norges Hjemmefrontmuseum er både en samling om okkupasjon og motstand og et etterkrigshistorisk prosjekt skapt av mennesker fra hjemmefronten. Derfor må utstilte objekter, krigsarkivene, museets egen etableringshistorie og senere historiebruk analyseres som forskjellige kildelag.',
      article: [
        'Planene om museet ble konkretisert i 1962, stiftelsen ble etablert i 1966, og publikum fikk adgang i 1970 etter restaurering av Det dobbelte batteri og Bindingsverkshuset. Museet er dermed ikke et sted der alle de formidlede krigshendelsene skjedde. Bygning 21 er institusjons-, samlings- og formidlingsankeret for materiale som har mange andre opprinnelsessteder.',
        'Kamuflerte radiomottakere, armbind, fotografier, dokumenter og mer enn 600 hyllemeter arkiver gir ulike typer evidens. En fysisk gjenstand kan vise materiale og bruksspor, mens et arkiv kan dokumentere beslutninger, korrespondanse og organisasjon. Ingen enkelt kilde gir automatisk hele erfaringen av okkupasjon, samarbeid, forfølgelse eller motstand, og fravær i samlingen må ikke fylles med antakelser.',
        'At museet ble skapt av hjemmefrontens egne miljøer gjør ettertidens fortelling til en del av studieobjektet. Utvalget kan dokumentere hva grunnleggerne ønsket å bevare og framheve, samtidig som andre perspektiver må søkes i flere kilder. Da stiftelsen ble oppløst og museet underlagt Forsvarsmuseet i 1995, endret forvaltningsformen seg igjen. Historiebruk, institusjon og krigshistorie ligger derfor side om side i samme museum.'
      ],
      subject_ids: ['historie'],
      emne_ids: ['em_his_okkupasjon_motstand','em_his_minnesteder_historiebruk','em_his_spor_materialitet','em_his_samtid_ettertid_fortelling','em_his_museum_samling_kanon'],
      chapter_ids: ['krig_okkupasjon_motstand','kilder_arkiv_spor','historisk_tid_periodisering','minne_kulturarv_historiebruk'],
      lenses: [
        {id:'hjemmefrontmuseum-motstand',title:'Motstand gjennom ulike kilder',prompt:'Hvordan kan gjenstander, fotografier og arkiver utfylle hverandre når okkupasjon og motstand skal undersøkes historisk?',subject_id:'historie',emne_id:'em_his_okkupasjon_motstand',evidence:'Sammenhold flere materialtyper og marker hvilket spørsmål hver kilde faktisk kan belyse uten å generalisere utover belegget.'},
        {id:'hjemmefrontmuseum-materialitet',title:'Objekt og proveniens',prompt:'Hva kan en kamuflert radiomottaker dokumentere om illegal lytting, og hvilke brukerhistorier krever separat proveniens?',subject_id:'historie',emne_id:'em_his_spor_materialitet',evidence:'Skill gjenstandens form og registrerte funksjon fra antakelser om bestemte eiere, situasjoner eller erfaringer.'},
        {id:'hjemmefrontmuseum-minne',title:'Hjemmefronten kuraterer ettertiden',prompt:'Hvordan påvirker museets grunnleggermiljø hvilke erfaringer fra krigen som tidlig ble samlet, ordnet og framhevet?',subject_id:'historie',emne_id:'em_his_minnesteder_historiebruk',evidence:'Les etableringshistorien fra 1960-årene sammen med utstillings- og arkivmaterialet som et eget etterkrigshistorisk kildelag.'},
        {id:'hjemmefrontmuseum-kanon',title:'Museum skaper historisk kanon',prompt:'Hvordan kan en permanent utstilling både bevare viktige kilder og samtidig gjøre noen fortellinger mer synlige enn andre?',subject_id:'historie',emne_id:'em_his_museum_samling_kanon',evidence:'Sammenlign utstillingens prioriteringer med bibliotek, arkiv og eksterne historiske kilder for å lete etter fravær og skjevheter.'}
      ],
      guiding_questions: [
        'Hvorfor er museumsbygningen et formidlingsanker og ikke opprinnelsessted for alle krigshendelsene?',
        'Hvordan skiller en fysisk motstandsgjenstand seg som kilde fra et arkivdokument?',
        'Hva betyr det kildekritisk at hjemmefrontens egne miljøer etablerte museet etter krigen?',
        'Hvordan kan arkivmengden brukes til å kontrollere og utdype påstander i utstillingen?',
        'Hva endret seg institusjonelt da stiftelsen ble oppløst og museet underlagt Forsvarsmuseet?'
      ],
      concepts: ['okkupasjon','motstand','proveniens','krigsarkiv','museumssamling','minnekultur','historiebruk','kanon','ettertidsfortelling','kildekritikk'],
      observable_traces: [
        {title:'Det dobbelte batteri',observation:'Museet er fysisk plassert i Det dobbelte batteri og Bindingsverkshuset, som ble restaurert for museumsbruk før åpningen i 1970.',interpretation_boundary:'Bygningen dokumenterer museets institusjons- og formidlingshistorie, men gjør ikke stedet til hendelsessted for alt materialet som formidles innenfor.',source_urls:['https://www.forsvarshistoriskmuseum.no/norges-hjemmefrontmuseum','https://snl.no/Norges_Hjemmefrontmuseum']},
        {title:'Arkiv og utstillingsmateriale',observation:'Dokumenter, fotografier og fysiske gjenstander presenteres side om side som ulike spor etter okkupasjon og motstand.',interpretation_boundary:'Samlingsbredden gir flere evidenstyper, men verken monter eller arkivmengde garanterer at alle grupper og erfaringer er likt representert.',source_urls:['https://www.forsvarshistoriskmuseum.no/samlingen','https://www.forsvarshistoriskmuseum.no/norges-hjemmefrontmuseum/biblioteket-ved-norges-hjemmefrontmuseum']}
      ],
      source_urls: ['https://www.forsvarshistoriskmuseum.no/norges-hjemmefrontmuseum','https://www.forsvarshistoriskmuseum.no/samlingen','https://www.forsvarshistoriskmuseum.no/norges-hjemmefrontmuseum/biblioteket-ved-norges-hjemmefrontmuseum','https://snl.no/Norges_Hjemmefrontmuseum','https://forvaltningsdatabasen.sikt.no/data/enhet/53012/endringshistorie'],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/historie/oslo/places_historie/paulus_kirke.json': {
    sources: [
      ['Den norske kirke – Paulus kirke', 'https://www.kirken.no/nn-NO/fellesrad/kirkeneioslo/menigheter/paulus-sofienberg/paulus-kirke/'],
      ['Den norske kirke – bruk og utleie av Paulus kirke', 'https://www.kirken.no/nb-NO/fellesrad/kirkeneioslo/menigheter/paulus-sofienberg/utleie/uteleie-av-kirken/'],
      ['Oslo byleksikon – Paulus kirke', 'https://oslobyleksikon.no/side/Paulus_kirke'],
      ['Oslo Museum – Paulus kirke omkring 1900', 'https://commons.wikimedia.org/wiki/File:Paulus_kirke_Oslo_OB.Z06219.jpg']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2', level: 'standard', status: 'curated',
      intro: 'Paulus kirke gjør Grünerløkkas raske 1800-tallsvekst lesbar gjennom ett konkret institusjonsbygg. Tegl, tårn, romorganisering, plasseringen mot Birkelunden og fortsatt menighetsbruk kan undersøkes som forskjellige historiske spor, uten å gjøre dagens praksis til direkte bevis for livet i 1892.',
      article: [
        'Kirken ble innviet i 1892 mens Grünerløkka vokste med leiegårder, industri, parker og nye institusjoner. Henrik Bulls teglarkitektur med tysk-gotisk inspirasjon er et synlig spor etter perioden, men stilbetegnelsen betyr ikke at bygningen er middelaldersk. Plasseringen rett overfor Birkelunden viser hvordan religiøst bygg, park, gate og boligkvartaler ble organisert som separate, men sammenvevde deler av bymiljøet.',
        'Rommet ble planlagt for gudstjeneste, tale, musikk og menighetsfellesskap. Materialitet og rominndeling kan derfor brukes i sosialhistorisk analyse, men de forteller ikke alene hvem som deltok, hvordan praksisen endret seg eller hvilke konflikter som fantes. Slike spørsmål krever institusjonskilder og materiale om hverdagsliv. Den aktive bruken i dag viser kontinuitet som institusjon, ikke uendret praksis siden 1800-tallet.',
        'Fredningen i 2006 gjør også bevaring til en del av stedets nyere historie. Vedlikehold og tilpasninger må forholde seg både til kulturminneverdier og levende menighetsbehov. Historiske fotografier kan sammenlignes med dagens fasade og byrom for å identifisere endring, men et fotografi dokumenterer bare sitt eget tidspunkt. Paulus kirke bør derfor leses som arkitektur, sosial institusjon og historisk lag i samme nabolag.'
      ],
      subject_ids: ['historie'],
      emne_ids: ['em_his_historiske_lag_i_byrom','em_his_spor_materialitet','em_his_sosialhistorie_hverdagsliv'],
      chapter_ids: ['historisk_tid_periodisering','kilder_arkiv_spor','industri_arbeid_sosialhistorie'],
      lenses: [
        {id:'paulus-kirke-bylag',title:'Kirken i byveksten',prompt:'Hvordan kan plasseringen mellom park, gate og boligkvartaler brukes til å undersøke Grünerløkkas historiske byvekst?',subject_id:'historie',emne_id:'em_his_historiske_lag_i_byrom',evidence:'Sett innvielsen i 1892 inn i områdets samtidige utbygging og hold kirken og Birkelunden som separate fysiske steder.'},
        {id:'paulus-kirke-materialitet',title:'Tegl som historisk spor',prompt:'Hva kan tårn, tegl og spissbuer dokumentere direkte, og hva krever kilder om arkitekt og byggeperiode?',subject_id:'historie',emne_id:'em_his_spor_materialitet',evidence:'Beskriv observerbare bygningsformer først og bruk institusjons- og byhistoriske kilder for datering, arkitekt og stilhistorie.'},
        {id:'paulus-kirke-hverdag',title:'Menighet og hverdagsliv',prompt:'Hvordan kan et aktivt kirkerom brukes til sosialhistorie uten å projisere dagens menighetspraksis bakover til 1892?',subject_id:'historie',emne_id:'em_his_sosialhistorie_hverdagsliv',evidence:'Skill kontinuitet i institusjonen fra endring i deltakere, aktiviteter, normer og hverdagsbruk over mer enn hundre år.'},
        {id:'paulus-kirke-fotografi',title:'Fotografi viser ett tidspunkt',prompt:'Hvordan kan et historisk fotografi brukes til å sammenligne bygningsmiljø uten å bli behandlet som en komplett historie om stedet?',subject_id:'historie',emne_id:'em_his_historiske_lag_i_byrom',evidence:'Bruk fotografiet til synlige former og omgivelser på opptakstidspunktet, og støtt endringsforklaringer med flere daterte kilder.'}
      ],
      guiding_questions: [
        'Hvordan plasserer Paulus kirke seg i Grünerløkkas byvekst mot slutten av 1800-tallet?',
        'Hvorfor betyr tysk-gotisk inspirasjon ikke at kirkebygningen selv er fra middelalderen?',
        'Hva kan den synlige teglarkitekturen dokumentere uten hjelp fra skriftlige historiske kilder?',
        'Hvordan kan fortsatt menighetsbruk undersøkes uten å gjøre dagens praksis til bevis for 1892?',
        'Hva tilfører fredningen i 2006 som et nytt historisk lag ved Paulus kirke?'
      ],
      concepts: ['byvekst','historiske lag','teglarkitektur','materialitet','menighet','hverdagsliv','institusjonell kontinuitet','fredning','kildekritikk'],
      observable_traces: [
        {title:'Tårn og teglfasade',observation:'Det høye inngangstårnet, teglflatene og spissbuene kan observeres fra offentlig gate- og parkgrunn ved Paulus plass.',interpretation_boundary:'Formene dokumenterer den eksisterende arkitekturen, men arkitekt, byggeår og stilhistoriske forbindelser må etableres med kilder.',source_urls:['https://www.kirken.no/nn-NO/fellesrad/kirkeneioslo/menigheter/paulus-sofienberg/paulus-kirke/','https://oslobyleksikon.no/side/Paulus_kirke']},
        {title:'Kirke mot Birkelunden',observation:'Hovedfasaden og tårnet står visuelt vendt mot plassen og Birkelunden i et tett bolig- og gatenett.',interpretation_boundary:'Den romlige relasjonen er observerbar i dag, men tidligere bruksmønstre og sosiale betydninger må dokumenteres historisk.',source_urls:['https://oslobyleksikon.no/side/Paulus_kirke','https://commons.wikimedia.org/wiki/File:Paulus_kirke_Oslo_OB.Z06219.jpg']}
      ],
      source_urls: ['https://www.kirken.no/nn-NO/fellesrad/kirkeneioslo/menigheter/paulus-sofienberg/paulus-kirke/','https://www.kirken.no/nb-NO/fellesrad/kirkeneioslo/menigheter/paulus-sofienberg/utleie/uteleie-av-kirken/','https://oslobyleksikon.no/side/Paulus_kirke','https://commons.wikimedia.org/wiki/File:Paulus_kirke_Oslo_OB.Z06219.jpg'],
      verified_at: VERIFIED_AT
    }
  }
};

const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);

function addExternalLink(place, label, url) {
  const field = Array.isArray(place.externalLinks) ? 'externalLinks' : Array.isArray(place.external_links) ? 'external_links' : 'externalLinks';
  place[field] ||= [];
  const existing = place[field].find(row => row?.url === url);
  if (existing) {
    if (!String(existing.label || existing.title || existing.name || '').trim()) existing.label = label;
    return;
  }
  place[field].push({ type: 'source', label, url, verifiedAt: VERIFIED_AT });
}

const registry = read(REGISTRY_FILE);
registry.placeLinks ||= {};
for (const [relative, target] of Object.entries(targets)) {
  const place = read(relative);
  if (!place?.id) throw new Error(`${relative}: missing Place id`);
  if (place.fagverk?.status === 'curated') throw new Error(`${place.id}: already curated; refusing overwrite`);
  for (const [label, url] of target.sources) addExternalLink(place, label, url);
  place.fagverk = target.fagverk;
  registry.placeLinks[place.id] = {
    sourceFile: relative.replace(/^data\//u, ''),
    field: 'fagverk',
    schema: target.fagverk.schema,
    level: target.fagverk.level,
    status: target.fagverk.status
  };
  write(relative, place);
  console.log(`Curated Fagverk: ${place.id}`);
}
write(REGISTRY_FILE, registry);
console.log('Indexed four Place-owned Fagverk packages');
