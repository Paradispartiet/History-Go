#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-09-01';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const targets = {
  'data/places/naeringsliv/oslo/places_naeringsliv/lilleborg_fabrikker.json': {
    sources: [
      ['Oslo byleksikon – Lilleborg Fabrikker','https://oslobyleksikon.no/side/Lilleborg_AS'],
      ['Store norske leksikon – Peter Wessel Wind Kildal','https://snl.no/Peter_Wessel_Wind_Kildal'],
      ['Industrimuseum – Lilleborg Fabrikker','https://industrimuseum.no/bedrifter/lilleborgfabrikera_s'],
      ['Orkla – salget av Lilleborg i 2024','https://www.orkla.com/media/press-releases/2024/orkla-announces-the-sale-of-lilleborg/']
    ],
    fagverk: {
      schema:'history_go_place_fagverk_v2',level:'full',status:'curated',
      intro:'Lilleborg Fabrikker kan leses som et langt industriforløp der råvarer, kjemiske prosesser, emballasje, merkevarer, eierskap og byomforming skifter rundt samme sted. Faglig presisjon krever at forhistorien før 1897, aksjeselskapet, krigstidens produksjon, nedleggelsen på Sandaker og senere selskapsbruk av navnet holdes fra hverandre.',
      article:[
        'Industristedet ved Akerselva har flere lag før A/S Lilleborg Fabriker ble etablert i 1897. Tekstilproduksjon, oljemølle og såpeproduksjon kom til i ulike perioder, og Peter Wessel Wind Kildal samlet fra 1863 virksomheten omkring lampeolje og såpe. Derfor må 1833, 1842, 1863 og 1897 forstås som forskjellige hendelser i samme område, ikke som konkurrerende grunnleggingsår for den samme juridiske bedriften.',
        'Produksjonen bandt fett og oljer til kjemiske prosesser, emballasje, merkevare og distribusjon. En såpepakke er derfor sluttpunktet i en lengre verdikjede som også omfatter råvarer, maskiner, energi, arbeid, pakking og salg. Fabrikkens økonomiske funksjon kan ikke leses direkte av den bevarte kontorbygningen; produkt- og bedriftskilder trengs for å rekonstruere selve produksjonssystemet.',
        'Arbeids- og eierskapshistorien endret seg da selskapet samarbeidet med De-No-Fa og senere ble del av større konsernstrukturer. Under andre verdenskrig oppsto en særlig konflikt mellom produksjon for okkupasjonsmakten og forsyning av sivile vaskemidler. At motstandsbevegelsen motsatte seg sabotasje viser hvordan industri kan være bundet til både militære, sivile og arbeidsmessige hensyn samtidig.',
        'Den bevarte kontorbygningen fra 1916 og fabrikkporten gjør fortsatt industristedet synlig, men store deler av produksjonsanlegget er revet eller omformet. Produksjonen på Sandaker stanset i 1997 og ble flyttet, mens området senere ble utviklet til boliger. Bygnings- og stedsbevaring er dermed ikke det samme som kontinuitet i arbeidsplasser, produksjonslinjer eller lokal industrikompetanse.',
        'Lilleborg-navnet fortsatte dessuten i selskaps- og merkevaresammenheng etter at Sandaker-produksjonen var borte. Senere Orkla- og Solenis-historie tilhører derfor virksomhetslinjen, men skal ikke brukes som om den dokumenterer fortsatt fabrikkdrift på stedet. Faglig analyse må skille brand, selskap og fysisk produksjonssted, selv når de deler navn og historiske røtter.'
      ],
      subject_ids:['naeringsliv'],emne_ids:['em_naering_arbeid_verdiskaping','em_naering_industri_og_mekanisering','em_naering_produksjon_produktivitet','em_naering_logistikk_verdikjeder','em_naering_omstilling_kriser_skift'],chapter_ids:['arbeid-produksjon-verdiskaping','logistikk-infrastruktur-okonomisk-rom'],
      lenses:[
        {id:'lilleborg-tidslag',title:'Flere industrilag før 1897',prompt:'Hvordan kan tekstil-, olje- og såpehistorien skilles fra etableringen av A/S Lilleborg Fabriker i 1897?',subject_id:'naeringsliv',emne_id:'em_naering_industri_og_mekanisering',evidence:'Bruk daterte bedrifts- og stedskilder og skill virksomhetslagene fra selskapets formelle etableringsår.'},
        {id:'lilleborg-verdikjede',title:'Fra råvare til forbruksvare',prompt:'Hvordan kan en såpepakke brukes til å følge råvarer, produksjon, emballasje, merkevare og distribusjon gjennom samme verdikjede?',subject_id:'naeringsliv',emne_id:'em_naering_logistikk_verdikjeder',evidence:'Koble dokumenterte produkter til fabrikkens råvare- og prosesshistorie uten å anta komplette produksjonsvolumer.'},
        {id:'lilleborg-arbeid',title:'Produksjon og arbeidsorganisering',prompt:'Hvilke typer arbeid og organisering må ligge bak kjemisk forbruksvareproduksjon, og hva kan ikke fasaden dokumentere alene?',subject_id:'naeringsliv',emne_id:'em_naering_arbeid_verdiskaping',evidence:'Skill observerbar industribebyggelse fra kilder om ansatte, prosesser, eierskap og produksjonsoppgaver.'},
        {id:'lilleborg-krig',title:'Produksjon under motstridende behov',prompt:'Hvordan viser krigstidens produksjon konflikten mellom okkupasjonsmaktens behov, sivile forsyninger og risikoen ved sabotasje?',subject_id:'naeringsliv',emne_id:'em_naering_produksjon_produktivitet',evidence:'Bruk dokumenterte produksjons- og motstandskilder og unngå å redusere situasjonen til én moralsk eller økonomisk forklaring.'},
        {id:'lilleborg-omstilling',title:'Fabrikken forsvinner navnet består',prompt:'Hva er forskjellen mellom at Lilleborg-navnet lever videre og at industriproduksjonen på Sandaker faktisk opphørte?',subject_id:'naeringsliv',emne_id:'em_naering_omstilling_kriser_skift',evidence:'Sammenlign produksjonsstopp, områdets boligomforming og senere selskapslinjer som separate prosesser.'}
      ],
      guiding_questions:['Hvorfor er 1897 riktig etableringsår for aksjeselskapet selv om industristedet er eldre?','Hvordan binder såpeproduksjon sammen råvarer, kjemiske prosesser, emballasje og distribusjon?','Hva viser krigstidens produksjon om konflikt mellom sivile behov og okkupasjonsøkonomi?','Hva gikk tapt da produksjonen på Sandaker stanset og området ble omformet?','Hvorfor må Lilleborg-navnet som selskap og merkevare skilles fra det historiske fabrikkstedet?'],
      concepts:['forbruksvareindustri','verdikjede','mekanisering','arbeidsorganisering','eierskap','produktivitet','omstilling','industrinedleggelse','merkevare','stedskontinuitet'],
      observable_traces:[
        {title:'Kontorbygningen fra 1916',observation:'Den bevarte kontorbygningen i tegl står som et tydelig fysisk spor etter det historiske fabrikkmiljøet.',interpretation_boundary:'Bygningen dokumenterer industristedets materialitet, men ikke alene hvilke produksjonslinjer eller arbeidsprosesser som foregikk i de øvrige fabrikkbygningene.',source_urls:['https://oslobyleksikon.no/side/Lilleborg_AS','https://industrimuseum.no/bedrifter/lilleborgfabrikera_s']},
        {title:'Fabrikkporten som stedsanker',observation:'Portområdet i Sandakerveien 54 markerer inngangen til det tidligere industrikomplekset i dagens boligmiljø.',interpretation_boundary:'Porten er et displayanker og skal ikke behandles som geometrisk sentrum for hele historiske fabrikkomplekset.',source_urls:['https://oslobyleksikon.no/side/Lilleborg_AS']}
      ],
      source_urls:['https://oslobyleksikon.no/side/Lilleborg_AS','https://snl.no/Peter_Wessel_Wind_Kildal','https://industrimuseum.no/bedrifter/lilleborgfabrikera_s','https://www.orkla.com/media/press-releases/2024/orkla-announces-the-sale-of-lilleborg/'],verified_at:VERIFIED_AT
    }
  },
  'data/places/naeringsliv/oslo/places_naeringsliv/ovre_foss.json': {
    sources:[
      ['Store norske leksikon – Hjula Væveri','https://snl.no/Hjula_V%C3%A6veri'],
      ['Oslo byleksikon – Hjula Væverier','https://oslobyleksikon.no/side/Hjula_V%C3%A6verier'],
      ['Norsk biografisk leksikon – Halvor Schou','https://nbl.snl.no/Halvor_Schou'],
      ['Wikimedia Commons – Hjula ved Akerselva','https://commons.wikimedia.org/wiki/File:Oslo._Akerselven._Hjula_veveri._Sagveien_-_NB_MS_G4_0370.jpg']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'full',status:'curated',
      intro:'Øvre Foss–Hjula Veveri viser hvordan vannkraft, importert teknologi, arbeid, kjønn, handel og marked ble samlet i et tekstilindustrielt system ved Akerselva. Stedet må avgrenses presist: Hjula Væverier er fabrikkanlegget ved Hjulafossen, mens Øvre Foss betegner et større fosselandskap. Fagverket følger fabrikken som produksjonssted uten å gjøre hele elvelandskapet til én bedrift.',
      article:[
        'Halvor Schou startet med engelske vevstoler før han kjøpte Hjulafossen og satte Hjula Væverier i drift i 1855. Fabrikken ble tegnet for stor maskinell produksjon, og Myrens Verksted leverte en vannturbin og hovedaksel som førte energien inn i anlegget. Industrialiseringen var derfor ikke bare et spørsmål om én maskin, men om samspill mellom kraftkilde, bygning, transmisjonssystem og mange vevstoler.',
        'Produksjonen omfattet flere tekstiltyper og ble senere utvidet med ullvarer. Omkring 800 ansatte på 1880-tallet viser en stor arbeidsorganisasjon, og mange av arbeiderne var kvinner. Kjønnsfordelingen er historisk viktig, men fasaden sier ingenting om lønn, arbeidstid, ulykkesrisiko eller husholdningsøkonomi. Slike forhold må undersøkes gjennom egne arbeidslivskilder.',
        'Wilhelm Peters maleri Fra Hjula Veveri gjør fabrikkinteriøret og maskintettheten synlig, men kunstverket er ikke et fotografisk måleinstrument. Det kan brukes som kilde til representasjon, rom og samtidens blikk på arbeid, mens tekniske og statistiske påstander må støttes av andre dokumenter. Faglig kildebruk handler derfor om å kombinere ulike kildetyper uten å gi én av dem mer beviskraft enn den har.',
        'Hjula var også avhengig av handel og råvaretilgang langt utenfor Sagene. Opphevelsen av Mellomriksloven i 1897 ble fulgt av kraftig omsetningsfall, og garnmangel stanset produksjonen midlertidig i 1918. Disse hendelsene viser hvordan et lokalt fabrikksted påvirkes av markedsregler, vareflyt og forsyningsbrudd som oppstår utenfor selve anlegget.',
        'Etter andre verdenskrig ble produksjonen konsentrert andre steder, og Hjula ble nedlagt i 1957. Fabrikkbygningen brant senere og ble gjenoppført, før den fikk nye bruksformer. Bevarte teglfasader og fosselandskapet gjør industrisystemet lesbart, men dagens ombruk er ikke kontinuitet i tekstilproduksjon. Stedet viser forskjellen mellom materiell industriarv og videreføring av samme økonomiske virksomhet.'
      ],
      subject_ids:['naeringsliv'],emne_ids:['em_naering_arbeid_verdiskaping','em_naering_industri_og_mekanisering','em_naering_produksjon_produktivitet','em_naering_makt_ulikhet_arbeidsliv','em_naering_omstilling_kriser_skift'],chapter_ids:['arbeid-produksjon-verdiskaping','makt-regulering-baerekraft'],
      lenses:[
        {id:'hjula-energisystem',title:'Vannkraft blir fabrikkenergi',prompt:'Hvordan ble vannkraft, turbin, hovedaksel og vevstoler koblet til ett samlet produksjonssystem ved Hjula?',subject_id:'naeringsliv',emne_id:'em_naering_industri_og_mekanisering',evidence:'Koble dokumentert turbinleveranse og fabrikkens maskinoppsett til stedet uten å anta detaljer som ikke er kildebelagt.'},
        {id:'hjula-arbeid-kjonn',title:'Arbeid og kjønn i fabrikken',prompt:'Hva kan kildene fortelle om den store kvinnelige arbeidsstyrken, og hvilke arbeidsvilkår kan ikke utledes av antallet alene?',subject_id:'naeringsliv',emne_id:'em_naering_makt_ulikhet_arbeidsliv',evidence:'Bruk dokumentert arbeidsstyrke og kjønnsfordeling, men krev egne kilder for lønn, arbeidstid og maktrelasjoner.'},
        {id:'hjula-kildekritikk',title:'Maleri som arbeidslivskilde',prompt:'Hvordan kan Wilhelm Peters maleri brukes som historisk kilde uten å behandles som et presist fotografi av produksjonen?',subject_id:'naeringsliv',emne_id:'em_naering_arbeid_verdiskaping',evidence:'Skill synlig rom, maskiner og representasjon fra statistiske eller tekniske påstander som krever andre kilder.'},
        {id:'hjula-marked',title:'Lokalt sted global avhengighet',prompt:'Hvordan gjorde handel, garnforsyning og markedsregler et stedbundet veveri avhengig av forhold langt utenfor Sagene?',subject_id:'naeringsliv',emne_id:'em_naering_produksjon_produktivitet',evidence:'Sammenhold Mellomriksloven, omsetningsfallet og garnmangelen i 1918 som ulike eksterne påvirkninger.'},
        {id:'hjula-omstilling',title:'Fra tekstilfabrikk til industriarv',prompt:'Hva er forskjellen mellom at fabrikkbygningen bevares og at tekstilproduksjonen som økonomisk virksomhet fortsetter?',subject_id:'naeringsliv',emne_id:'em_naering_omstilling_kriser_skift',evidence:'Følg nedleggelsen i 1957, brannen, gjenoppføringen og senere ombruk som separate stadier.'}
      ],
      guiding_questions:['Hvordan gjorde vannkraft og transmisjonssystemet stor maskinell veving mulig ved Hjula?','Hva forteller den kvinnelige arbeidsstyrken om industriarbeidet, og hva krever egne lønns- og arbeidslivskilder?','Hvorfor må Wilhelm Peters maleri leses sammen med tekniske og statistiske kilder?','Hvordan kunne markedspolitikk og garnmangel påvirke produksjonen ved et lokalt verk?','Hva overlever når fabrikken stenger: bygningen, virksomheten, kompetansen eller bare enkelte spor?'],
      concepts:['vannkraft','mekanisering','tekstilindustri','arbeidsdeling','kjønnet arbeidsliv','produktivitet','markedstilgang','forsyningsrisiko','industrinedleggelse','industriarv'],
      observable_traces:[
        {title:'Teglbygningen ved fossen',observation:'Den store teglbygningen står fortsatt tett ved Akerselva og gjør koblingen mellom fabrikk og vannkraftlandskap synlig.',interpretation_boundary:'Plasseringen viser industrimiljøets materialitet, men ikke alene kraftoverføringens tekniske utforming eller produksjonsvolum.',source_urls:['https://oslobyleksikon.no/side/Hjula_V%C3%A6verier','https://snl.no/Hjula_V%C3%A6veri']},
        {title:'Foss og fabrikk som system',observation:'Elveløpet, fossen og fabrikkbygningen kan observeres som separate fysiske elementer i samme industrielle landskap.',interpretation_boundary:'Nærhet dokumenterer en energirelasjon, men Øvre Foss og Hjulafossen skal ikke behandles som identiske stedsnavn eller ett eksakt punkt.',source_urls:['https://oslobyleksikon.no/side/Hjula_V%C3%A6verier','https://commons.wikimedia.org/wiki/File:Oslo._Akerselven._Hjula_veveri._Sagveien_-_NB_MS_G4_0370.jpg']}
      ],
      source_urls:['https://snl.no/Hjula_V%C3%A6veri','https://oslobyleksikon.no/side/Hjula_V%C3%A6verier','https://nbl.snl.no/Halvor_Schou','https://commons.wikimedia.org/wiki/File:Oslo._Akerselven._Hjula_veveri._Sagveien_-_NB_MS_G4_0370.jpg'],verified_at:VERIFIED_AT
    }
  },
  'data/places/religion/oslo/akershus_slottskirke/akershus_slottskirke.json': {
    sources:[
      ['SNL – Akershus slottskirke','https://snl.no/Akershus_slottskirke'],
      ['Forsvaret – tros- og livssynskorpset','https://www.forsvaret.no/om-forsvaret/organisasjon/forsvarets-fellestjenester/forsvarets-tros-og-livssynskorps']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',
      intro:'Akershus slottskirke er et hellig rom inne i et slott og festningsanlegg, der kristen liturgi, militær organisering, kongelig historie og senere restaurering møtes. Faglig analyse må skille rommets observerbare materialitet fra ritualene som utføres der og fra enkeltmenneskers personlige tro, som ikke kan leses ut av arkitektur, uniform eller deltakelse.',
      article:[
        'Slottskirken ligger i sørfløyen av Akershus slott og har røtter tilbake til 1500-tallet. At et kirkerom ligger inne i et kongelig og militært anlegg viser en institusjonell kobling mellom religion, stat og forsvar, men bygningen alene forteller ikke hvordan tro ble erfart av enkeltpersoner. Historiske kilder må brukes for å datere vigsling, ombygginger og funksjoner.',
        'Kirkerommet brukes til gudstjenester, vielser, kirkeparader og andre seremonier gjennom Forsvarets tros- og livssynskorps. Ritualer kan beskrives gjennom offentlige ordninger, liturgiske handlinger og romlig organisering, men deltakelse skal ikke tolkes som bevis på en persons private overbevisning. Det er forskjell på institusjonell seremoni, religiøs praksis og personlig trosidentitet.',
        'Inventar og restaurering gjør også flere tidslag synlige. Alter, prekestol, våpen- og kongesymbolikk og rommets plassering i slottet kan undersøkes som materiell religion. Samtidig må Slottskirken skilles fra Det kongelige mausoleum, som er et eget gravkapell, og fra Akershus slott som samlet historisk sted.'
      ],
      subject_ids:['religion'],emne_ids:['em_religion_hellige_rom','em_religion_ritualer_praksis','em_religion_religionshistorie_lokalt','em_religion_kristendom','em_religion_religion_og_samfunn'],chapter_ids:[],
      lenses:[
        {id:'slottskirke-hellig-rom',title:'Hellig rom i statsanlegg',prompt:'Hvordan gjør plasseringen inne i Akershus slott Slottskirken til både religiøst rom og del av et statlig anlegg?',subject_id:'religion',emne_id:'em_religion_hellige_rom',evidence:'Beskriv rom, plassering og institusjonell bruk og skill dem fra antakelser om individers tro.'},
        {id:'slottskirke-ritual',title:'Ritual og institusjonell praksis',prompt:'Hva kan offentlige gudstjenester, vielser og kirkeparader fortelle om religiøs praksis uten å avsløre privat overbevisning?',subject_id:'religion',emne_id:'em_religion_ritualer_praksis',evidence:'Bruk Forsvarets offentlige beskrivelser av tros- og livssynstjenesten og hold individnivået utenfor.'},
        {id:'slottskirke-historie',title:'Kristendom i lokal institusjonshistorie',prompt:'Hvordan har kirkerommets rolle endret seg gjennom kongelig, militær og moderne bruk uten at alle periodene blir like?',subject_id:'religion',emne_id:'em_religion_religionshistorie_lokalt',evidence:'Følg daterte bygnings- og bruksendringer i SNL og institusjonelle kilder.'},
        {id:'slottskirke-samfunn',title:'Religion stat og forsvar',prompt:'Hvordan kan Slottskirken brukes til å undersøke forholdet mellom religion og offentlige institusjoner i Norge?',subject_id:'religion',emne_id:'em_religion_religion_og_samfunn',evidence:'Skill institusjonelle ordninger fra påstander om samfunnets eller enkeltpersoners religiøsitet.'}
      ],
      guiding_questions:['Hva gjør Slottskirken til et hellig rom samtidig som den ligger i et statlig og militært anlegg?','Hvorfor kan deltakelse i en offentlig seremoni ikke brukes som bevis på privat tro?','Hvordan skiller gudstjeneste, vielse og kirkeparade seg som ritualiserte praksiser?','Hvilke deler av rommets religionshistorie kan observeres, og hvilke krever daterte dokumentkilder?','Hvorfor må Akershus slottskirke og Det kongelige mausoleum behandles som separate steder?'],
      concepts:['hellig rom','liturgi','ritual','garnisonskirke','kongelig kapell','kristendom','religion og stat','materiell religion'],
      observable_traces:[
        {title:'Alter og liturgisk rom',observation:'Alterområdet og kirkerommets orientering gjør den liturgiske funksjonen fysisk lesbar for besøkende.',interpretation_boundary:'Romformen viser institusjonell religiøs bruk, men sier ikke hva enkeltpersoner tror eller opplever.',source_urls:['https://snl.no/Akershus_slottskirke']},
        {title:'Kirkerom inne i slottet',observation:'Slottskirken er fysisk integrert i sørfløyen av Akershus slott i stedet for å stå som frittliggende kirkebygg.',interpretation_boundary:'Plasseringen dokumenterer en historisk institusjonell relasjon, men ikke en uforanderlig kobling mellom stat, forsvar og religion i alle perioder.',source_urls:['https://snl.no/Akershus_slottskirke','https://www.forsvaret.no/om-forsvaret/organisasjon/forsvarets-fellestjenester/forsvarets-tros-og-livssynskorps']}
      ],
      source_urls:['https://snl.no/Akershus_slottskirke','https://www.forsvaret.no/om-forsvaret/organisasjon/forsvarets-fellestjenester/forsvarets-tros-og-livssynskorps'],verified_at:VERIFIED_AT
    }
  },
  'data/places/religion/oslo/det_kongelige_mausoleum/det_kongelige_mausoleum.json': {
    sources:[
      ['Kongehuset – Det kongelige mausoleum','https://www.kongehuset.no/historie/alt-for-norge/det-kongelige-mausoleum-og-sarkofagene'],
      ['Store norske leksikon – Det kongelige mausoleum','https://snl.no/Det_kongelige_mausoleum']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',
      intro:'Det kongelige mausoleum er et eget gravkapell ved Akershus slottskirke, der kristen gravritual, kongelig minnekultur, arkitektur og statlig representasjon møtes. Faglig analyse må skille selve gravrommet fra Slottskirken, og skille offentlige begravelsesritualer og materielle symboler fra antakelser om de gravlagtes private tro.',
      article:[
        'Mausoleet ble tegnet av Arnstein Arneberg og vigslet i 1949 som gravkapell for det norske kongehuset. Rommet er fysisk knyttet til Akershus slottskirke, men er et eget sted med en særskilt begravelsesfunksjon. Materialer, korsmotiv, alter og sarkofager organiserer et kristent minne- og gravrom, men arkitekturen alene kan ikke forklare de gravlagtes personlige trosliv.',
        'De to doble sarkofagene samler kong Haakon VII og dronning Maud, samt kong Olav V og kronprinsesse Märtha. Dronning Mauds kiste måtte vente på sitt endelige gravsted gjennom krigsårene, mens senere kongelige begravelser fulgte offentlige prosesjoner og kirkelige handlinger før gravlegging. Ritualet består derfor av flere steder og faser som ikke må reduseres til selve mausoleet.',
        'Mausoleet viser også hvordan monarki og religion møtes i offentlig minnekultur. Kongelige gravsteder har nasjonal og institusjonell betydning, men dette betyr ikke at alle borgere deler samme religiøse eller politiske fortolkning. En respektfull analyse beskriver dokumenterte ritualer, materialer og institusjoner og holder private trosantakelser utenfor.'
      ],
      subject_ids:['religion'],emne_ids:['em_religion_hellige_rom','em_religion_ritualer_praksis','em_religion_religionshistorie_lokalt','em_religion_kristendom','em_religion_religion_og_samfunn'],chapter_ids:[],
      lenses:[
        {id:'mausoleum-hellig-rom',title:'Gravkapell som hellig rom',prompt:'Hvordan skaper arkitektur, alter, kors og sarkofager et særskilt kristent grav- og minnerom?',subject_id:'religion',emne_id:'em_religion_hellige_rom',evidence:'Beskriv materialer og romlig organisering og skill dem fra antakelser om personlig tro.'},
        {id:'mausoleum-ritual',title:'Begravelse som ritualforløp',prompt:'Hvordan viser kongelige begravelser at gravritualet består av flere handlinger og steder før den endelige gravleggingen?',subject_id:'religion',emne_id:'em_religion_ritualer_praksis',evidence:'Følg dokumenterte prosesjoner, kirkelige handlinger og gravlegging som separate ritualfaser.'},
        {id:'mausoleum-historie',title:'Kongelig kristendom i lokalhistorien',prompt:'Hvordan kan mausoleets opprettelse og bruk undersøkes som lokal religionshistorie uten å gjøre monarkiet til hele kristendomshistorien?',subject_id:'religion',emne_id:'em_religion_religionshistorie_lokalt',evidence:'Plasser gravkapellet i daterte kongehus- og kirkehistoriske sammenhenger og behold avgrensningen til stedet.'},
        {id:'mausoleum-samfunn',title:'Religion monarki og samfunn',prompt:'Hva kan et offentlig kongelig gravsted fortelle om forholdet mellom religion, stat og nasjonal minnekultur?',subject_id:'religion',emne_id:'em_religion_religion_og_samfunn',evidence:'Skill dokumentert institusjonell symbolikk fra antakelser om borgernes holdninger eller de gravlagtes private overbevisning.'}
      ],
      guiding_questions:['Hvorfor er mausoleet et eget gravkapell og ikke bare en del av Slottskirkens vanlige kirkerom?','Hvordan skiller en offentlig begravelsesprosesjon seg fra den endelige gravleggingen i mausoleet?','Hva kan sarkofager, kors og materialvalg dokumentere om institusjonell minnekultur?','Hvorfor bør kongelig gravritual beskrives uten å anta de gravlagtes private trosopplevelse?','Hvordan møtes religion, monarki og nasjonal historie i dette avgrensede gravrommet?'],
      concepts:['gravkapell','begravelsesritual','hellig rom','sarkofag','minnekultur','kristendom','monarki','religion og samfunn'],
      observable_traces:[
        {title:'To doble sarkofager',observation:'Mausoleet inneholder to doble sarkofager med ulike materialer for de kongelige gravlagte.',interpretation_boundary:'Materialvalg og plassering kan observeres, men sier ikke alene noe om de gravlagtes personlige tro eller politiske betydning.',source_urls:['https://www.kongehuset.no/historie/alt-for-norge/det-kongelige-mausoleum-og-sarkofagene','https://snl.no/Det_kongelige_mausoleum']},
        {title:'Kapellets kristne formspråk',observation:'Korsmotiv, alterparti og steinmaterialer gjør gravrommets kristne og seremonielle karakter fysisk lesbar.',interpretation_boundary:'Symbolene dokumenterer institusjonell religiøs utforming, men skal ikke brukes til å generalisere om samfunnets eller individers trosgrad.',source_urls:['https://www.kongehuset.no/historie/alt-for-norge/det-kongelige-mausoleum-og-sarkofagene']}
      ],
      source_urls:['https://www.kongehuset.no/historie/alt-for-norge/det-kongelige-mausoleum-og-sarkofagene','https://snl.no/Det_kongelige_mausoleum'],verified_at:VERIFIED_AT
    }
  }
};

const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);
function addExternalLink(place,label,url){
  const field=Array.isArray(place.externalLinks)?'externalLinks':Array.isArray(place.external_links)?'external_links':'externalLinks';
  place[field] ||= [];
  const existing=place[field].find(row=>row?.url===url);
  if(existing){ if(!String(existing.label||existing.title||existing.name||'').trim()) existing.label=label; return; }
  place[field].push({type:'source',label,url,verifiedAt:VERIFIED_AT});
}
const registry=read(REGISTRY_FILE); registry.placeLinks ||= {};
for(const [relative,target] of Object.entries(targets)){
  const place=read(relative);
  if(!place?.id) throw new Error(`${relative}: missing id`);
  if(place.fagverk?.status==='curated') throw new Error(`${place.id}: already curated; refusing overwrite`);
  for(const [label,url] of target.sources) addExternalLink(place,label,url);
  place.fagverk=target.fagverk;
  registry.placeLinks[place.id]={sourceFile:relative.replace(/^data\//u,''),field:'fagverk',schema:target.fagverk.schema,level:target.fagverk.level,status:target.fagverk.status};
  write(relative,place); console.log(`Curated Fagverk: ${place.id}`);
}
write(REGISTRY_FILE,registry); console.log('Indexed final four Place-owned Fagverk packages');
