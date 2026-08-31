#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-08-31';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const targets = {
  'data/places/by/oslo/places/storgata.json': {
    sources: [
      ['Oslo byleksikon – Storgata', 'https://oslobyleksikon.no/side/Storgata'],
      ['Oslo kommune – Stor forandring i nye Storgata', 'https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Storgata kan leses som en historisk gate der handel og mobilitet bruker den samme smale infrastrukturen. Et faglig blikk må skille gatens langvarige trase fra skiftende transportteknologi, virksomheter og ombygginger, og unngå å gjøre ett enkelt adresseeksempel til en påstand om hele gateløpet.',
      article: [
        'Storgata går fra Kirkeristen til Nybrua og har over lang tid vært både innfartsåre, handelsgate og kollektivkorridor. Gateløpet fikk dagens sammenheng da Nybrua åpnet i 1827, mens ulike deler ble innlemmet i byen på forskjellige tidspunkter. Det gjør gaten egnet til å undersøke hvordan en stabil trase kan få nye funksjoner uten at alle historiske lag forsvinner samtidig.',
        'Trikkesporene, holdeplassene, fortauene og gatebredden viser at mobilitet må organiseres i et begrenset tverrsnitt. Opprustningen 2018–2021 fornyet skinner, fundament og andre tekniske elementer, men et fysisk tiltak dokumenterer ikke alene hvordan trafikkflyt, trygghet eller handelsliv faktisk utviklet seg. Slike virkninger må undersøkes med egne data og tidsavgrensede kilder.',
        'Adressene langs Storgata rommer svært ulike historier om post, kino, industri, servering, handel og institusjoner. De gjør gaten konkret, men krever skalanøyaktighet: en hendelse i nummer 23 eller 39 tilhører først den adressen og kan bare brukes som gatehistorie når sammenhengen er eksplisitt dokumentert. Slik trener stedet skillet mellom punkt, gate og større byområde.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_kommersielle_gater', 'em_by_infrastruktur_mobilitet'],
      chapter_ids: ['arbeid-naering-handel-logistikk', 'urbanisme-idealer-forbindelser-fortetting'],
      lenses: [
        {
          id: 'storgata-handel-gatekant',
          title: 'Handel langs gatekanten',
          prompt: 'Hvordan kan butikkfasader og skiftende virksomheter undersøkes uten å anta at én adresse representerer hele Storgata?',
          subject_id: 'by',
          emne_id: 'em_by_kommersielle_gater',
          evidence: 'Bruk adressebundne kilder først og løft bare funn til gatenivå når flere deler av gateløpet støtter mønsteret.'
        },
        {
          id: 'storgata-mobilitetskorridor',
          title: 'Mobilitet i samme tverrsnitt',
          prompt: 'Hvordan fordeles den begrensede gatebredden mellom trikk, gående, varelevering og annen ferdsel?',
          subject_id: 'by',
          emne_id: 'em_by_infrastruktur_mobilitet',
          evidence: 'Les spor, holdeplasser, fortau og kryss som fysisk infrastruktur og skill dette fra målte bruker- og trafikkvirkninger.'
        },
        {
          id: 'storgata-ombygging-effekt',
          title: 'Tiltak og faktisk virkning',
          prompt: 'Hvorfor er dokumentert gateopprusting noe annet enn dokumentert effekt på handel, trygghet eller framkommelighet?',
          subject_id: 'by',
          emne_id: 'em_by_infrastruktur_mobilitet',
          evidence: 'Skill det kommunen dokumenterer som bygget fra eventuelle senere målinger av bruk, konflikt og økonomisk utvikling.'
        },
        {
          id: 'storgata-skala',
          title: 'Punkt, gate og område',
          prompt: 'Når kan en historie fra én bygård brukes til å forstå Storgata, og når må den forbli adressebundet?',
          subject_id: 'by',
          emne_id: 'em_by_kommersielle_gater',
          evidence: 'Kontroller kildeomfang og stedseierskap før enkeltadresser brukes som evidens for et større gatemønster.'
        }
      ],
      guiding_questions: [
        'Hvilke deler av Storgatas historiske identitet ligger i traseen, og hvilke ligger i skiftende bruk?',
        'Hvordan kan trikkesporene leses som infrastruktur uten å trekke konklusjoner om faktisk trafikkmengde?',
        'Hva må dokumenteres før én virksomhet eller bygård kan brukes som eksempel på hele gaten?',
        'Hvordan skiller en fysisk opprusting seg fra dokumentert sosial eller økonomisk effekt?',
        'Hvorfor er Storgata både en handelsgate og en transportkorridor uten at funksjonene kan reduseres til hverandre?'
      ],
      concepts: ['handelsgate', 'mobilitetskorridor', 'gatekant', 'infrastruktur', 'gateløp', 'skala', 'adressekilde', 'ombygging', 'virkning'],
      observable_traces: [
        {
          title: 'Trikkespor i gateflaten',
          observation: 'Skinnene ligger synlig i den samme gateflaten som holdeplasser, fortau, kryss og innganger til virksomheter.',
          interpretation_boundary: 'Sporene dokumenterer transportinfrastruktur, men viser ikke alene passasjertall, framkommelighet, trygghet eller økonomisk effekt.',
          source_urls: ['https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata']
        },
        {
          title: 'Sammenhengende historisk gateakse',
          observation: 'Gateperspektivet mellom Kirkeristen og Nybrua gjør Storgatas sammenhengende trase fysisk lesbar gjennom sentrum.',
          interpretation_boundary: 'En sammenhengende trase betyr ikke at alle adresser, funksjoner eller bygningslag langs gaten har samme historie.',
          source_urls: ['https://oslobyleksikon.no/side/Storgata']
        }
      ],
      source_urls: [
        'https://oslobyleksikon.no/side/Storgata',
        'https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/by/oslo/places/st_hanshaugen_park.json': {
    sources: [
      ['Oslo kommune – St. Hanshaugen', 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/st-hanshaugen/'],
      ['Oslo byleksikon – Sankt Hanshaugen', 'https://oslobyleksikon.no/side/Sankt_Hanshaugen'],
      ['Oslo kommune – Det felles eide', 'https://aktuelt.oslo.kommune.no/det-felles-eide-80-ar-med-kunst-i-byen']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'St. Hanshaugen park viser hvordan et grønt byrom kan være sosial infrastruktur, teknisk infrastruktur og bevisst landskapsforming samtidig. Parken bør undersøkes som et resultat av flere utbyggings- og beplantningsfaser, ikke som et naturgitt område eller ett enkelt grunnleggingsøyeblikk.',
      article: [
        'Høyden var i bruk lenge før den ble park. Sankthansbål, beplantning, privat initiativ, arbeid i Christiania Byes Vel og kommunal overtakelse inngår i et langt forløp. Dette gjør St. Hanshaugen egnet til å undersøke hvordan offentlige grøntområder blir til gjennom både sivilt engasjement og kommunal forvaltning, og hvorfor ett årstall sjelden forklarer hele parkens etablering.',
        'På toppen møtes landskapsarkitektur og tekniske systemer. Speilbassenget ligger over et drikkevannsreservoar, og tårnbygningen ble brukt til offentlig værvarsling. Slike spor viser at parken ikke bare var pynt eller rekreasjon; høyde og synlighet ble utnyttet som del av byens infrastruktur. Samtidig må dagens observerbare form skilles fra de historiske funksjonene som dokumenteres i kildene.',
        'Parken fungerer både som målpunkt, oppholdsrom og gjennomgangsrom. Stier, høydeforskjeller, utsikt, benker og åpne flater legger til rette for ulike bruksmåter, men en enkelt observasjon kan ikke fastslå hvem parken inkluderer best eller hvordan den brukes gjennom hele året. Feltarbeid bør derfor beskrive romlige muligheter og kombinere dem med tidsavgrensede bruksdata når effekter skal vurderes.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_parker_som_sosial_infrastruktur', 'em_by_opphold_vs_gjennomgang'],
      chapter_ids: ['byliv-offentlige-rom'],
      lenses: [
        {
          id: 'st-hanshaugen-sosial-infrastruktur',
          title: 'Park som sosial infrastruktur',
          prompt: 'Hvordan legger stier, åpne flater, utsikt og sittemuligheter til rette for både møte, opphold og ferdsel?',
          subject_id: 'by',
          emne_id: 'em_by_parker_som_sosial_infrastruktur',
          evidence: 'Beskriv de fysiske mulighetene og skill dem fra påstander om hvem som faktisk bruker parken og hvor ofte.'
        },
        {
          id: 'st-hanshaugen-opphold-gjennomgang',
          title: 'Opphold eller gjennomgang',
          prompt: 'Hvilke deler av parken inviterer til å bli værende, og hvilke deler fungerer tydeligst som bevegelseslinjer?',
          subject_id: 'by',
          emne_id: 'em_by_opphold_vs_gjennomgang',
          evidence: 'Sammenlign stibredde, helling, benker, utsiktspunkter og åpne flater uten å gjøre et øyeblikksbilde til årsstatistikk.'
        },
        {
          id: 'st-hanshaugen-infrastruktur',
          title: 'Skjult infrastruktur i parken',
          prompt: 'Hva forteller reservoaret og værvarslingstårnet om hvorfor høyden hadde kommunal verdi utover rekreasjon?',
          subject_id: 'by',
          emne_id: 'em_by_parker_som_sosial_infrastruktur',
          evidence: 'Koble observerbare bygg og vannflater til historiske kilder om vannforsyning og offentlig informasjon.'
        },
        {
          id: 'st-hanshaugen-parkbygging',
          title: 'Parken blir til over tid',
          prompt: 'Hvordan endrer forståelsen seg når parkleggingen leses som flere tiår med planting, eierskap og kommunale tiltak?',
          subject_id: 'by',
          emne_id: 'em_by_parker_som_sosial_infrastruktur',
          evidence: 'Bruk daterte milepæler som et forløp og unngå å gjøre ett tiltak til hele parkens grunnleggelse.'
        }
      ],
      guiding_questions: [
        'Hva gjør St. Hanshaugen til sosial infrastruktur i tillegg til et grønt landskap?',
        'Hvordan viser reservoaret at en park også kan romme tekniske funksjoner som ikke er åpenbare ved første blikk?',
        'Hvilke romlige trekk skiller oppholdssoner fra gjennomgangssoner i parken?',
        'Hvorfor bør parkens etablering beskrives som et forløp med flere aktører og faser?',
        'Hva kan en observasjon på stedet si om parkens utforming, og hva krever bruksdata over tid?'
      ],
      concepts: ['sosial infrastruktur', 'offentlig park', 'opphold', 'gjennomgang', 'topografi', 'vannforsyning', 'landskapsforming', 'kommunal forvaltning', 'bruksdata'],
      observable_traces: [
        {
          title: 'Speilbasseng over reservoar',
          observation: 'Vannspeilet på toppen markerer området der et historisk drikkevannsreservoar ble lagt inn i parkens høyeste parti.',
          interpretation_boundary: 'Den synlige vannflaten gjør infrastrukturen stedlig lesbar, men viser ikke alene teknisk kapasitet eller dagens driftsstatus.',
          source_urls: ['https://oslobyleksikon.no/side/Sankt_Hanshaugen', 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/st-hanshaugen/']
        },
        {
          title: 'Stier mellom høyde og opphold',
          observation: 'Slyngende stier forbinder bratte partier, utsiktspunkter og flatere soner for opphold gjennom parken.',
          interpretation_boundary: 'Stinettet viser mulige bevegelseslinjer, men dokumenterer ikke hvor mange som bruker hver rute eller hvorfor de velger den.',
          source_urls: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/st-hanshaugen/']
        }
      ],
      source_urls: [
        'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/st-hanshaugen/',
        'https://oslobyleksikon.no/side/Sankt_Hanshaugen',
        'https://aktuelt.oslo.kommune.no/det-felles-eide-80-ar-med-kunst-i-byen'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/by/oslo/places/christiania_torv.json': {
    sources: [
      ['Oslo byleksikon – Christiania Torv', 'https://oslobyleksikon.no/side/Christiania_Torv'],
      ['Oppdag Kvadraturen – Christiania Torv', 'https://www.oppdagkvadraturen.no/stoppesteder/christiania-torv'],
      ['Oppdag Kvadraturen – Christiania Torv stil og arkitektur', 'https://www.oppdagkvadraturen.no/stoppesteder/christiania-torv-stil-og-arkitektur']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Christiania Torv er et godt laboratorium for offentlige rom fordi handel, vannforsyning, kirke, rådhus og straff historisk lå tett rundt samme plass. Analysen må likevel skille selve torget fra bygningene ved det, og skille moderne historiebruk fra direkte dokumentasjon av 1600-tallet.',
      article: [
        'Etter byflyttingen i 1624 ble Christiania Torv en sentral plass i den regulerte byen ved Akershus. Torget samlet marked og offentlig ferdsel, mens rådhus, kirke og andre institusjoner lå ved kanten. Denne organiseringen viser hvordan et torg kan fungere som scene mellom institusjoner uten å være identisk med dem. Gamle Rådhus er derfor et eget sted selv om bygningen inngår i torgets historiske sammenheng.',
        'Vandkunsten, markedet, gapestokken og retterstedsfunksjonen viser at flere samfunnsfunksjoner kunne overlappe i samme offentlige rom. Da kirke og marked senere flyttet, endret også torgets tyngdepunkt og rolle seg. Et offentlig rom bør derfor undersøkes gjennom hvilke aktiviteter og institusjoner som faktisk var knyttet til stedet i ulike perioder, ikke som om én funksjon var permanent.',
        'Rehabiliteringen i 1990-årene og Wenche Gulbransens fonteneskulptur Christian IVs hanske la et nytt lag av formgivning og historiebruk til plassen. Skulpturen peker mot fortellingen om bygrunnleggelsen, men er ikke bevis på at kongen bokstavelig talt kastet en hanske på stedet. Dermed kan torget brukes til å skille materiell historisk dokumentasjon fra senere symbolsk fortolkning av fortiden.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_torg_plasser_som_scene', 'em_by_offentlige_rom_motesteder'],
      chapter_ids: ['byliv-offentlige-rom'],
      lenses: [
        {
          id: 'christiania-torv-scene',
          title: 'Torget som offentlig scene',
          prompt: 'Hvordan kan samme plass romme marked, ferdsel og myndighetsutøvelse uten at disse aktivitetene blir én funksjon?',
          subject_id: 'by',
          emne_id: 'em_by_torg_plasser_som_scene',
          evidence: 'Følg daterte funksjoner gjennom kildene og noter når aktiviteter flyttes, forsvinner eller endrer organisatorisk form.'
        },
        {
          id: 'christiania-torv-stedseierskap',
          title: 'Plass og bygninger',
          prompt: 'Hvorfor må Christiania Torv skilles fra Gamle Rådhus og andre bygninger selv om de former samme historiske byrom?',
          subject_id: 'by',
          emne_id: 'em_by_offentlige_rom_motesteder',
          evidence: 'Skill plassflaten som offentlig rom fra institusjonenes egne bygninger, handlinger og kildeeierskap.'
        },
        {
          id: 'christiania-torv-funksjonsskifte',
          title: 'Funksjoner flytter mellom torg',
          prompt: 'Hva lærer flyttingen av kirke- og markedsfunksjoner om hvordan offentlige sentra kan endre seg over tid?',
          subject_id: 'by',
          emne_id: 'em_by_torg_plasser_som_scene',
          evidence: 'Sammenlign perioder før og etter at funksjoner flyttes mot Stortorvet og vurder hva som faktisk blir igjen på plassen.'
        },
        {
          id: 'christiania-torv-historiebruk',
          title: 'Hansken som historiebruk',
          prompt: 'Hvordan kan den moderne hanskeskulpturen formidle en grunnleggingsfortelling uten å være bevis for den bokstavelige hendelsen?',
          subject_id: 'by',
          emne_id: 'em_by_torg_plasser_som_scene',
          evidence: 'Skill kunstverkets motiv og installasjonsår fra kildene som dokumenterer byflyttingen og torgets eldre funksjoner.'
        }
      ],
      guiding_questions: [
        'Hva tilhører Christiania Torv som plass, og hva tilhører bygningene rundt?',
        'Hvordan kunne handel, vannforsyning og myndighetsutøvelse bruke samme offentlige rom på ulike måter?',
        'Hva endret seg da sentrale funksjoner flyttet mot Stortorvet?',
        'Hvorfor kan Christian IVs hanske analyseres som historiebruk, men ikke som direkte bevis for et hanskekast?',
        'Hvordan viser dagens plass både spor av eldre bystruktur og senere rehabilitering?'
      ],
      concepts: ['offentlig torg', 'plassrom', 'funksjonsskifte', 'institusjon', 'marked', 'offentlig infrastruktur', 'stedseierskap', 'historiebruk', 'rehabilitering'],
      observable_traces: [
        {
          title: 'Torgets avgrensede plassflate',
          observation: 'Den navngitte plassflaten ved Rådhusgata og Øvre Slottsgate er fysisk avgrenset fra bygningene som står langs kanten.',
          interpretation_boundary: 'Nærhet mellom plass og bygning dokumenterer en romlig relasjon, men overfører ikke automatisk bygningens historie eller handlinger til torget.',
          source_urls: ['https://www.oppdagkvadraturen.no/stoppesteder/christiania-torv', 'https://oslobyleksikon.no/side/Christiania_Torv']
        },
        {
          title: 'Hansken i fonteneanlegget',
          observation: 'Fonteneskulpturen Christian IVs hanske står som et moderne kunstnerisk tyngdepunkt midt på det rehabiliterte torget.',
          interpretation_boundary: 'Skulpturen dokumenterer historiebruk fra 1997 og skal ikke brukes som fysisk bevis for et bokstavelig hanskekast i 1624.',
          source_urls: ['https://www.oppdagkvadraturen.no/stoppesteder/christiania-torv-stil-og-arkitektur', 'https://oslobyleksikon.no/side/Christiania_Torv']
        }
      ],
      source_urls: [
        'https://oslobyleksikon.no/side/Christiania_Torv',
        'https://www.oppdagkvadraturen.no/stoppesteder/christiania-torv',
        'https://www.oppdagkvadraturen.no/stoppesteder/christiania-torv-stil-og-arkitektur'
      ],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/subkultur/oslo/places_subkultur/brugata_storgata_rusmiljo.json': {
    sources: [
      ['Oslo kommune – stedsanalyse Brugata/Storgata', 'https://magasin.oslo.kommune.no/byplan/trygghet-og-kriminalitetsforebygging-m%C3%A5-v%C3%A6re-f%C3%B8rende-i-byutviklingen'],
      ['KORUS Oslo – Utrygg markedsplass', 'https://filer.korus.no/publications/HKH-rapport-web.pdf'],
      ['Foreningen for human ruspolitikk – et sted å være', 'https://humanruspolitikk.no/vil-gi-rusavhengige-et-sted-a-vaere/'],
      ['Oslo kommune – Stor forandring i nye Storgata', 'https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Brugata/Storgata-rusmiljøet skal studeres som et dokumentert sosialt territorium, ikke som en identitet som kan leses av mennesker i gatebildet. Kunnskapen må bygge på aggregerte undersøkelser, offentlige kilder og etiske avgrensninger som beskytter personvern og hindrer stigmatiserende feltarbeid.',
      article: [
        'Det canonicale stedet er avgrenset til det dokumenterte sosiale territoriet ved Brugata/Storgata, med Storgata 33 som stabilt områdeanker. Kildene beskriver både åpent marked og sosial møteplass, men ingen synlig person kan klassifiseres som deltaker i miljøet, rusavhengig, kjøper, selger eller tjenestebruker ut fra utseende eller opphold. Stedsanalyse er derfor ikke personidentifikasjon.',
        'Miljøet inngår i en historie med forflytning, kontroll og skiftende bruk av offentlige rom. Dette gjør retten til byen og sosial kontroll relevante analytiske perspektiver. Samtidig må fysisk opprusting av gater skilles fra dokumentert sosial effekt: nye spor, fortau og overflater kan endre rommet, men forklarer ikke alene tilhørighet, konflikt, utrygghet eller hvorfor miljøer flytter.',
        'KORUS-rapporten bygger på feltarbeid og intervjuer, og nyere kartlegginger bruker møteplasser og aggregert kunnskap. For et History Go-besøk er den etiske grensen strengere: observer bare arkitektur, gateprofil og offentlige forbindelser fra ordinær ferdselsåre. Ikke fotografer, følg, kontakt eller kartlegg enkeltpersoner, oppholdstider, transaksjoner, helseforhold eller ruter. Personvern er en del av faginnholdet, ikke en tilleggskommentar.'
      ],
      subject_ids: ['subkultur'],
      emne_ids: ['em_sub_apne_rusmiljoer_gatefellesskap', 'em_sub_rett_til_byen', 'em_sub_tilhorighet_miljo', 'em_sub_personvern_forskningsetikk'],
      chapter_ids: ['sosiale_randsoner_omsorg_skadereduksjon', 'motstand_avvik_kontroll', 'fellesskap_scener_egenorganisering'],
      lenses: [
        {
          id: 'brugata-storgata-sosialt-territorium',
          title: 'Sosialt territorium uten personmerking',
          prompt: 'Hvordan kan et sted beskrives som sosialt territorium uten å tilskrive synlige enkeltpersoner identitet eller handlinger?',
          subject_id: 'subkultur',
          emne_id: 'em_sub_apne_rusmiljoer_gatefellesskap',
          evidence: 'Bruk aggregerte stedsstudier og institusjonelle kilder, og hold personobservasjon utenfor evidensgrunnlaget.'
        },
        {
          id: 'brugata-storgata-rett-til-byen',
          title: 'Kontroll og rett til byen',
          prompt: 'Hvordan kan forflytning av et miljø analyseres som møte mellom kontroll, byutvikling og tilgang til offentlig rom?',
          subject_id: 'subkultur',
          emne_id: 'em_sub_rett_til_byen',
          evidence: 'Følg dokumenterte tiltak og forflytninger over tid uten å anta én enkel årsak eller beskrive mennesker som et problem i seg selv.'
        },
        {
          id: 'brugata-storgata-tilhorighet',
          title: 'Tilhørighet i et gatekryss',
          prompt: 'Hva viser kildene om hvordan et ordinært gatekryss også kan fungere som sosial møteplass og kontaktflate?',
          subject_id: 'subkultur',
          emne_id: 'em_sub_tilhorighet_miljo',
          evidence: 'Bruk intervjubasert og aggregert kunnskap om sosiale funksjoner og skill den fra tilfeldige observasjoner av hvem som står hvor.'
        },
        {
          id: 'brugata-storgata-etikk',
          title: 'Personvern som metodekrav',
          prompt: 'Hvilke typer feltdata skal History Go ikke samle inn når stedet omfatter sårbare og potensielt stigmatiserte mennesker?',
          subject_id: 'subkultur',
          emne_id: 'em_sub_personvern_forskningsetikk',
          evidence: 'Begrens observasjon til offentlig synlige fysiske forhold og bruk publiserte studier for kunnskap om mennesker og sosiale relasjoner.'
        }
      ],
      guiding_questions: [
        'Hvorfor kan et dokumentert sosialt territorium ikke brukes til å identifisere enkeltpersoner i gatebildet?',
        'Hvordan skiller fysisk gateopprusting seg fra dokumentert endring i trygghet, tilhørighet eller sosial konflikt?',
        'Hva betyr retten til byen når kontrolltiltak og forflytning påvirker hvor marginaliserte miljøer kan oppholde seg?',
        'Hvorfor er intervjuer og aggregerte undersøkelser bedre kilder enn nærgående observasjon av personer på stedet?',
        'Hvilke fysiske trekk kan observeres forsvarlig uten å samle inn opplysninger om mennesker, transaksjoner eller ruter?'
      ],
      concepts: ['sosialt territorium', 'gatefellesskap', 'tilhørighet', 'rett til byen', 'forflytning', 'sosial kontroll', 'stigma', 'personvern', 'forskningsetikk'],
      observable_traces: [
        {
          title: 'Arkaden ved Storgata 33',
          observation: 'Den overbygde fortaussonen ved Storgata 33 former ly, sikt, innganger og oppholdsmuligheter i gatekrysset.',
          interpretation_boundary: 'Arkitekturen kan beskrives fra offentlig ferdselsåre, men den sier ikke hvem som bruker området eller hva enkeltpersoner gjør der.',
          source_urls: ['https://magasin.oslo.kommune.no/byplan/trygghet-og-kriminalitetsforebygging-m%C3%A5-v%C3%A6re-f%C3%B8rende-i-byutviklingen']
        },
        {
          title: 'Spor og ombygd gateflate',
          observation: 'Trikkespor, fortau og kryssingsflater viser den fysiske opprustningen av Storgata gjennom det avgrensede området.',
          interpretation_boundary: 'Fysiske tiltak kan observeres, men de dokumenterer ikke alene sosial trygghet, marked, tilhørighet eller effekten av kontrollpolitikk.',
          source_urls: ['https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata', 'https://magasin.oslo.kommune.no/byplan/trygghet-og-kriminalitetsforebygging-m%C3%A5-v%C3%A6re-f%C3%B8rende-i-byutviklingen']
        }
      ],
      source_urls: [
        'https://magasin.oslo.kommune.no/byplan/trygghet-og-kriminalitetsforebygging-m%C3%A5-v%C3%A6re-f%C3%B8rende-i-byutviklingen',
        'https://filer.korus.no/publications/HKH-rapport-web.pdf',
        'https://humanruspolitikk.no/vil-gi-rusavhengige-et-sted-a-vaere/',
        'https://magasin.oslo.kommune.no/byplan/stor-forandring-i-nye-storgata'
      ],
      verified_at: VERIFIED_AT
    }
  }
};

const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);

function addExternalLink(place, label, url) {
  const field = Array.isArray(place.externalLinks)
    ? 'externalLinks'
    : Array.isArray(place.external_links)
      ? 'external_links'
      : 'externalLinks';
  place[field] ||= [];
  const existing = place[field].find((row) => row?.url === url);
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
