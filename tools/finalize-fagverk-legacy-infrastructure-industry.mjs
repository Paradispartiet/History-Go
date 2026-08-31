#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-08-31';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const targets = {
  'data/places/natur/oslo/places_oslo_natur_akerselvarute/ankerbrua.json': {
    sources: [
      ['Oslo byleksikon – Ankerbrua', 'https://oslobyleksikon.no/side/Ankerbrua'],
      ['Oslo byleksikon – Ankerløkken', 'https://oslobyleksikon.no/side/Ankerl%C3%B8kken'],
      ['Norsk kunstnerleksikon – Dyre Vaa', 'https://nkl.snl.no/Dyre_Vaa'],
      ['Selskabet for Oslo Byes Vel – blått skilt ved Ankerbrua', 'https://www.oslobyesvel.no/kalender/avduking-av-bl-skilt-og-guidet-tur-over-broer-langs-nedre-akerselva/10']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2', level: 'standard', status: 'curated',
      intro: 'Ankerbrua gjør det mulig å lese infrastruktur, materialitet, offentlig kunst og stedsnavn som forskjellige tidslag i samme kryssing. Den første trebroen fra 1874–76 må skilles fra dagens bro fra 1926, og Dyre Vaas bronsegrupper fra 1937 må skilles fra selve brokonstruksjonen og fra senere historieformidling.',
      article: [
        'Det moderne brostedet begynner med en trebro fra 1874–76, men den fysiske broen som står her ble oppført i 1926 etter Oscar Hoffs tegninger. Betong, huggen stein, rekkverk og brospenn organiserer en konkret forbindelse over Akerselva. Dette skillet mellom brosted og eksisterende konstruksjon er metodisk viktig: ett tidlig årstall kan dokumentere kontinuitet i kryssingen uten å være byggeåret for dagens objekt.',
        'I 1937 ble fire bronsegrupper av Dyre Vaa plassert på broen. Skulpturene ga den tilnavnet Eventyrbrua og viser hvordan offentlig kunst kan endre identiteten til hverdagsinfrastruktur uten at transportfunksjonen forsvinner. Kildene brukes også kritisk: et nyere sekundært avvik om ett motiv overstyres ikke når Oslo byleksikon, Norsk kunstnerleksikon og direkte museumsregistreringer samlet støtter identifikasjonen Veslefrikk med fela.',
        'Navnet Ankerbrua er eldre enn både 1926-broen og 1937-kunsten fordi det viser til Ankerløkken. Senere kom et blått historieskilt som et nytt formidlingslag. Broen kan derfor leses som minst fire separate evidensnivåer: navnehistorie, teknisk konstruksjon, kunstnerisk utsmykning og ettertidens formidling. Et fotografi av dagens bro dokumenterer ikke alene alle disse lagene.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_infrastruktur_mobilitet','em_by_materialitet_og_sanseerfaring','em_by_historiske_lag_i_hverdagsrom','em_by_symbolsk_makt_og_representasjon'],
      chapter_ids: ['urbanisme-idealer-forbindelser-fortetting','byliv-stemning-mikrokomfort','arkitektur-type-skala-byform','arkitektur-gatekant-makt-ombruk'],
      lenses: [
        {id:'ankerbrua-infrastruktur',title:'Brosted og brokonstruksjon',prompt:'Hvordan kan du skille historien til et krysningssted fra byggeåret til den konstruksjonen som står der i dag?',subject_id:'by',emne_id:'em_by_infrastruktur_mobilitet',evidence:'Hold trebroen 1874–76 og dagens 1926-bro som separate daterte objekter i samme transportforbindelse.'},
        {id:'ankerbrua-materialitet',title:'Materialitet som funksjon',prompt:'Hva kan betong, huggen stein, spenn og rekkverk fortelle om broens fysiske organisering, og hva krever tekniske kilder?',subject_id:'by',emne_id:'em_by_materialitet_og_sanseerfaring',evidence:'Beskriv observerbare materialer og former først; bruk kilder for datering, arkitekt og konstruksjonshistorie.'},
        {id:'ankerbrua-kunst',title:'Kunst endrer offentlig identitet',prompt:'Hvordan kunne fire skulpturgrupper gi en transportbro et nytt navn uten å endre hovedfunksjonen som kryssing?',subject_id:'by',emne_id:'em_by_symbolsk_makt_og_representasjon',evidence:'Sammenhold 1926-broen med 1937-utsmykningen og senere bruk av navnet Eventyrbrua.'},
        {id:'ankerbrua-kildekonflikt',title:'Når kilder navngir ulikt',prompt:'Hvordan bør et motiv identifiseres når en nyere formidlingskilde avviker fra flere fag- og museumsregistreringer?',subject_id:'by',emne_id:'em_by_historiske_lag_i_hverdagsrom',evidence:'Prioriter den samlede sterkere kildelinjen og dokumenter avviket i stedet for å skjule at kildene er uenige.'}
      ],
      guiding_questions: ['Hva er forskjellen mellom brostedets start og byggeåret for dagens Ankerbrua?','Hvordan gjør skulpturene offentlig kunst til en del av en teknisk forbindelse?','Hva kan du observere direkte i materialene, og hva må kildebelegges?','Hvorfor er navnet Ankerbrua et eget historisk lag?','Hvordan bør motstridende motivnavn håndteres kildekritisk?'],
      concepts: ['infrastruktur','brosted','materialitet','offentlig kunst','symbolsk identitet','stedsnavn','historiske lag','kildekonflikt','historieformidling'],
      observable_traces: [
        {title:'Broen fra 1926',observation:'Den eksisterende broen fører ferdsel over Akerselva med synlig brokropp, rekkverk og stein-/betongmaterialitet.',interpretation_boundary:'Det som står i dag dokumenterer 1926-konstruksjonen, men ikke i seg selv trebroens utforming eller hele kryssingshistorien.',source_urls:['https://oslobyleksikon.no/side/Ankerbrua']},
        {title:'Fire bronsegrupper',observation:'Dyre Vaas skulpturer står fordelt på broens sokler og er fysisk integrert i kryssingen.',interpretation_boundary:'Skulpturene dokumenterer utsmykningen fra 1937; de er ikke del av den opprinnelige 1926-konstruksjonens funksjon og kan ikke alene forklare motivhistorien.',source_urls:['https://oslobyleksikon.no/side/Ankerbrua','https://nkl.snl.no/Dyre_Vaa']}
      ],
      source_urls: ['https://oslobyleksikon.no/side/Ankerbrua','https://oslobyleksikon.no/side/Ankerl%C3%B8kken','https://nkl.snl.no/Dyre_Vaa','https://www.oslobyesvel.no/kalender/avduking-av-bl-skilt-og-guidet-tur-over-broer-langs-nedre-akerselva/10'], verified_at: VERIFIED_AT
    }
  },
  'data/places/historie/oslo/places_historie_added_batch_01/botsfengselet.json': {
    sources: [
      ['Statsbygg – Botsen, Oslo fengsel avdeling A','https://www.statsbygg.no/eiendom/botsen-oslo-fengsel-avdeling-a/'],
      ['Store norske leksikon – Botsfengselet','https://snl.no/Botsfengselet'],
      ['Oslo byleksikon – Botsfengselet','https://oslobyleksikon.no/side/Botsfengselet'],
      ['Tidsskriftet – Frederik Holst og fengslene','https://tidsskriftet.no/2001/12/medisinsk-historie/frederik-holst-og-fengslene'],
      ['Riksantikvaren – innsigelse mot Oslo fengsel','https://riksantikvaren.no/innsigelse-mot-oslo-fengsel/']
    ],
    fagverk: {
      schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',
      intro:'Botsfengselet viser hvordan en reformidé kan bli arkitektur, rutine og kontrollsystem. Enecellene, fløyene, sentralhallen og kirken må leses sammen med 1800-tallets forbedringsspråk, men uten å gjøre reform til synonym for humanitet eller rekonstruere innsattes erfaringer der kildene er tause.',
      article:[
        'Straffeanstaltkommisjonen av 1837 foreslo et nytt cellefengselssystem, og Botsfengselet ble oppført 1844–1851. Philadelphia-systemet skulle holde innsatte adskilt og kombinere enecelle, arbeid og religiøs påvirkning med mål om anger og forbedring. Arkitekturen gjorde programmet operativt: cellefløyer, sentral overvåking, luftegårder og senere kirke regulerte kontakt, bevegelse og tid.',
        'Forbedringsmålet må analyseres sammen med kontrollvirkemidlene. Isolasjon ble begrunnet med moralske og hygieniske hensyn, men kunne også gi alvorlige psykiske og sosiale belastninger. Derfor er Botsfengselet et godt eksempel på at institusjonell reform ikke kan vurderes bare ut fra erklærte mål. Plan, fysisk organisering, faktisk praksis og konsekvenser er forskjellige evidensnivåer.',
        'Kildene er skjeve. Offentlige og faglige kilder er sterke på kommisjoner, arkitektur, drift, fredning og senere stenging, mens de innsattes egne stemmer er langt svakere representert. Wilse-albumet fra 1935 viser rom og arbeidsmiljø, men var et presentasjonsalbum og er ikke en nøytral beretning om fangenskap. Botsen må dessuten skilles fra avdeling B og fra stengingen av den gjenværende Oslo-fengselsdriften i 2026; avdeling A var ute av drift fra 2017.'
      ],
      subject_ids:['historie'],emne_ids:['em_his_stat_institusjoner','em_his_fangenskap_kontroll','em_his_sosialhistorie_hverdagsliv','em_his_spor_materialitet'],
      chapter_ids:['makt_stat_institusjoner','krig_okkupasjon_motstand','industri_arbeid_sosialhistorie','kilder_arkiv_spor'],
      lenses:[
        {id:'botsfengselet-reform',title:'Reform er ikke det samme som virkning',prompt:'Hvordan kan et system ha forbedring som mål og samtidig bygge sterk isolasjon og kontroll inn i hverdagen?',subject_id:'historie',emne_id:'em_his_stat_institusjoner',evidence:'Skill kommisjonens mål fra arkitektur, praksis og dokumenterte helse-/sosiale konsekvenser.'},
        {id:'botsfengselet-fangenskap',title:'Kontroll blir rom',prompt:'Hvordan gjorde enecelle, fløyer, luftegårder og kirke Philadelphia-systemet fysisk?',subject_id:'historie',emne_id:'em_his_fangenskap_kontroll',evidence:'Les plan og romtyper som organiserende mekanismer og ikke bare som arkitektoniske former.'},
        {id:'botsfengselet-hverdag',title:'Hverdagsliv med skjeve kilder',prompt:'Hva kan institusjonskildene fortelle om fengselshverdagen, og hvor blir de innsattes erfaringer utilgjengelige?',subject_id:'historie',emne_id:'em_his_sosialhistorie_hverdagsliv',evidence:'Marker hvem som produserte kilden og unngå å fylle arkivtaushet med antakelser.'},
        {id:'botsfengselet-wilse',title:'Fotografi er også presentasjon',prompt:'Hvorfor kan Wilse-albumet dokumentere celler og verksteder uten å være et nøytralt vitnesbyrd om soning?',subject_id:'historie',emne_id:'em_his_spor_materialitet',evidence:'Bruk bildet for synlige romdetaljer, men vurder bestilling, utvalg og presentasjonsform før sosiale slutninger.'}
      ],
      guiding_questions:['Hvordan ble reformideen gjort fysisk i Botsfengselets plan?','Hva skiller erklært forbedringsmål fra dokumentert erfaring og virkning?','Hvordan regulerte rommene bevegelse og kontakt?','Hva kan Wilse-albumet dokumentere sikkert, og hva kan det ikke?','Hvorfor må Botsen avdeling A skilles fra avdeling B og senere Oslo fengsel?'],
      concepts:['straffereform','Philadelphia-systemet','isolasjon','institusjon','overvåking','enecelle','hverdagsliv','arkivtaushet','kildekritikk'],
      observable_traces:[
        {title:'Cellefløyer og ringmur',observation:'Det fredede anlegget gjør cellefengselets avgrensning og organiserte bevegelsesrom fysisk lesbart.',interpretation_boundary:'Arkitekturen dokumenterer planlagt kontroll og romdeling, men kan ikke alene fortelle hvordan den enkelte innsatt opplevde soningen.',source_urls:['https://www.statsbygg.no/eiendom/botsen-oslo-fengsel-avdeling-a/','https://snl.no/Botsfengselet']},
        {title:'Enecellen som systemkjerne',observation:'Historiske fotografier viser cellen som både oppholds- og arbeidsrom i separasjonssystemet.',interpretation_boundary:'Fotografiet viser et konkret rom og inventar på fotograferingstidspunktet; det dokumenterer ikke alle perioder eller subjektive erfaringer.',source_urls:['https://tidsskriftet.no/2001/12/medisinsk-historie/frederik-holst-og-fengslene']}
      ],
      source_urls:['https://www.statsbygg.no/eiendom/botsen-oslo-fengsel-avdeling-a/','https://snl.no/Botsfengselet','https://oslobyleksikon.no/side/Botsfengselet','https://tidsskriftet.no/2001/12/medisinsk-historie/frederik-holst-og-fengslene','https://riksantikvaren.no/innsigelse-mot-oslo-fengsel/'],verified_at:VERIFIED_AT
    }
  },
  'data/places/naeringsliv/oslo/places_naeringsliv/schous_bryggeri.json': {
    sources:[
      ['Store norske leksikon – Schous Bryggeri','https://snl.no/Schous_Bryggeri'],
      ['Oslo byleksikon – Schous Bryggeri','https://oslobyleksikon.no/side/Schous_Bryggeri'],
      ['Oslo byleksikon – Schouskvartalet','https://oslobyleksikon.no/side/Schouskvartalet'],
      ['Norsk Teknisk Museum – Daimler-varebil 1899','https://digitaltmuseum.no/011014273526/norges-forste-varebil-daimler-1899-tilhorende-schous-bryggeri']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',
      intro:'Schous bryggeri gjør industriell produksjon lesbar som et system av prosesskontroll, kjøling, arbeidsdeling, logistikk, eierskap og senere ombruk. Historiske bygningsnavn og dagens mikrobrygging må ikke forveksles med at den tidligere storskala bryggeridriften fortsatt finnes på stedet.',
      article:[
        'Bryggeriets røtter går tilbake til Johannes Thranes virksomhet, mens 1821 brukes som offisielt grunnleggingsår etter Jørgen Youngs overtakelse. Christian Julius Schou kjøpte bryggeriet i 1837. Produksjonshistorien blir særlig konkret i 1843, da undergjæret bayerøl krevde kontroll over temperatur, gjær og lagring. Kjøling og prosesskontroll var dermed del av selve produktiviteten, ikke bare tekniske tillegg.',
        'Flyttingen til Schousløkken i 1873 samlet produksjon i et voksende industrielt anlegg. Navn som Vørterhuset, Malteriet, Gjærhuset og Tapperiet viser historisk arbeidsdeling, mens Daimler-varebilen fra 1899 viser at verdikjeden fortsatte ut av fabrikkporten. Ett kjøretøy dokumenterer logistisk innovasjon, men er ikke i seg selv mål på hvor produktiv eller lønnsom virksomheten var.',
        'Etter selskapskonsolidering ble produksjonen og Schous-navnet lagt ned i 1981. Senere fikk deler av kvartalet kontor-, undervisnings-, kultur- og serveringsbruk, og nyere brygging finnes i de gamle kjellerne. Dette er ombruk, ikke kontinuitet i den gamle industridriften. Faglig analyse må derfor skille bevart bygg, historisk funksjonsnavn, dagens virksomhet og det opprinnelige selskapet.'
      ],
      subject_ids:['naeringsliv'],emne_ids:['em_naering_produksjon_produktivitet','em_naering_innovasjon_teknologisk_skift','em_naering_logistikk_verdikjeder','em_naering_omstilling_kriser_skift','em_naering_eierskap_styring'],
      chapter_ids:['arbeid-produksjon-verdiskaping','teknologi-innovasjon-plattformer','logistikk-infrastruktur-okonomisk-rom','kapital-eierskap-finans'],
      lenses:[
        {id:'schous-produksjon',title:'Produksjon som organisert prosess',prompt:'Hvordan gjør kjøling, gjær, lagring og arbeidsdeling brygging til et produksjonssystem?',subject_id:'naeringsliv',emne_id:'em_naering_produksjon_produktivitet',evidence:'Koble konkrete produksjonstrinn til bygninger og dokumentert teknologi uten å slutte produktivitet fra størrelse alene.'},
        {id:'schous-innovasjon',title:'Teknologisk skift i bryggeriet',prompt:'Hvorfor var undergjæring og temperaturkontroll en organisatorisk innovasjon, ikke bare en ny øltype?',subject_id:'naeringsliv',emne_id:'em_naering_innovasjon_teknologisk_skift',evidence:'Følg hvilke nye krav teknologien stilte til kjøling, lagring og prosesskontroll.'},
        {id:'schous-logistikk',title:'Verdikjeden utenfor porten',prompt:'Hva viser Daimler-varebilen fra 1899 om koblingen mellom produksjon og distribusjon?',subject_id:'naeringsliv',emne_id:'em_naering_logistikk_verdikjeder',evidence:'Bruk kjøretøyet som konkret logistikkspor og skill artefaktet fra påstander om total leveringskapasitet eller lønnsomhet.'},
        {id:'schous-omstilling',title:'Nedleggelse og ombruk',prompt:'Hvordan kan et industriområde fortsette å være aktivt etter at den opprinnelige produksjonen og merkevaren er lagt ned?',subject_id:'naeringsliv',emne_id:'em_naering_omstilling_kriser_skift',evidence:'Skill 1981-nedleggelsen fra senere eiendoms-, kultur-, undervisnings- og serveringsbruk.'}
      ],
      guiding_questions:['Hvordan ble prosesskontroll en del av bryggeriets produktivitet?','Hva forteller bygningsnavnene om historisk arbeidsdeling?','Hva kan Daimler-varebilen dokumentere om verdikjeden, og hva kan den ikke?','Hvordan endret eierskap og konsolidering virksomheten fram mot 1981?','Hvorfor er dagens bruk av kvartalet ombruk og ikke automatisk videreføring av den gamle bryggeridriften?'],
      concepts:['produksjon','produktivitet','prosesskontroll','undergjæring','verdikjede','logistikk','eierskap','konsolidering','ombruk'],
      observable_traces:[
        {title:'Historiske produksjonsbygg',observation:'Flere bevarte bygg og funksjonsnavn gjør den tidligere arbeidsdelingen i bryggerikomplekset lesbar.',interpretation_boundary:'Et historisk bygningsnavn dokumenterer tidligere funksjon, men betyr ikke at bygget brukes til den samme produksjonen i dag.',source_urls:['https://oslobyleksikon.no/side/Schous_Bryggeri','https://oslobyleksikon.no/side/Schouskvartalet']},
        {title:'Port og logistikkspor',observation:'Port- og administrasjonsmiljøet viser grensen mellom fabrikkens interne produksjon og vareflyt ut i byen.',interpretation_boundary:'Den fysiske porten og det dokumenterte kjøretøyet viser logistisk organisering, men ikke alene volum, kostnad eller produktivitet.',source_urls:['https://snl.no/Schous_Bryggeri','https://digitaltmuseum.no/011014273526/norges-forste-varebil-daimler-1899-tilhorende-schous-bryggeri']}
      ],
      source_urls:['https://snl.no/Schous_Bryggeri','https://oslobyleksikon.no/side/Schous_Bryggeri','https://oslobyleksikon.no/side/Schouskvartalet','https://digitaltmuseum.no/011014273526/norges-forste-varebil-daimler-1899-tilhorende-schous-bryggeri'],verified_at:VERIFIED_AT
    }
  },
  'data/places/naeringsliv/oslo/places_naeringsliv/ringnes_bryggeri.json': {
    sources:[
      ['Store norske leksikon – Ringnes AS','https://snl.no/Ringnes_AS'],
      ['Oslo byleksikon – Ringnes Bryggeri','https://oslobyleksikon.no/side/Ringnes_Bryggeri'],
      ['Store norske leksikon – Olav Johan Sopp','https://snl.no/Olav_Johan_Sopp'],
      ['Eiendomsspar – Thorvald Meyers gate 2A','https://eiendomsspar.no/eiendommer/thorvald-meyers-gate-2a/']
    ],
    fagverk:{
      schema:'history_go_place_fagverk_v2',level:'standard',status:'curated',
      intro:'Ringnes bryggeri viser hvordan industriell verdiskaping kan koble produksjonsorganisering, laboratoriekunnskap, logistikk, selskapsstyring og geografisk flytting. Det historiske anlegget på Grünerløkka må skilles fra produksjonen på Gjelleråsen og fra dagens museum, hovedkontor og mikrobryggeri i bevarte bygg.',
      article:[
        'Ringnes & Co. ble grunnlagt i 1876 av Amund Ringnes, Ellef Ringnes og Axel Heiberg, og produksjonen startet i 1877. Anlegget vokste etter hvert over et større kvartal der brygging, malting, lagring, transport og administrasjon ble samlet. Det fysiske industrilandskapet viser dermed organisering av verdiskaping, men størrelse alene dokumenterer ikke produktivitet eller lønnsomhet.',
        'Fra 1887 til 1890 ledet Olav Johan Sopp bryggeriets laboratorium. Renkultivert gjær gjorde mikrobiologisk kunnskap til del av standardisering og kvalitetskontroll. Dette er et tydelig teknologisk skift fordi kunnskap, laboratoriepraksis og produksjonsrutine ble koblet sammen. Innovasjonen kan dokumenteres som prosessendring uten at man dermed kjenner hele dens økonomiske effekt.',
        'Selskapsformen og eierskapet endret seg flere ganger fra A/S Ringnes Bryggeri i 1899 via Nora-, Orkla-, Pripps- og Carlsberg-systemene. Produksjonen i Thorvald Meyers gate ble flyttet til Gjelleråsen i 2001, mens deler av det gamle anlegget ble bevart og omformet. Hovedkontor, museum og mikrobryggeri gjør historien synlig, men representerer ikke en gjenopptakelse av den tidligere storskala produksjonen.'
      ],
      subject_ids:['naeringsliv'],emne_ids:['em_naering_produksjon_produktivitet','em_naering_innovasjon_teknologisk_skift','em_naering_logistikk_verdikjeder','em_naering_omstilling_kriser_skift','em_naering_eierskap_styring'],
      chapter_ids:['arbeid-produksjon-verdiskaping','teknologi-innovasjon-plattformer','logistikk-infrastruktur-okonomisk-rom','kapital-eierskap-finans'],
      lenses:[
        {id:'ringnes-produksjon',title:'Industrikvartalet som produksjonssystem',prompt:'Hvordan viser samlingen av produksjon, lager, transport og administrasjon en organisert verdikjede?',subject_id:'naeringsliv',emne_id:'em_naering_produksjon_produktivitet',evidence:'Beskriv funksjonene som faktisk var samlet i anlegget og unngå å bruke areal eller størrelse som direkte mål på produktivitet.'},
        {id:'ringnes-gjaer',title:'Laboratoriet inn i produksjonen',prompt:'Hvorfor er renkultivert gjær et eksempel på teknologisk skift i organiseringen av industriproduksjon?',subject_id:'naeringsliv',emne_id:'em_naering_innovasjon_teknologisk_skift',evidence:'Følg koblingen mellom Sopp, laboratoriearbeid, standardisering og kvalitetskontroll uten å anta en bestemt profittvirkning.'},
        {id:'ringnes-eierskap',title:'Eierskap endrer styringslinjer',prompt:'Hvordan kan en virksomhet beholde navn og merke gjennom flere selskaps- og eierstrukturer?',subject_id:'naeringsliv',emne_id:'em_naering_eierskap_styring',evidence:'Sett de dokumenterte selskapsendringene kronologisk og skill merke, juridisk enhet, eier og produksjonssted.'},
        {id:'ringnes-flytting',title:'Produksjon flytter, spor blir igjen',prompt:'Hva skjer med et industristed når produksjonen flyttes, men bygninger, navn og virksomheter blir igjen?',subject_id:'naeringsliv',emne_id:'em_naering_omstilling_kriser_skift',evidence:'Skill produksjonsflyttingen i 2001 fra senere Ringnes Park, museum, kontor og mikrobryggeri.'}
      ],
      guiding_questions:['Hvordan organiserte fabrikkvartalet produksjon og logistikk på samme sted?','Hva gjorde renkultivert gjær til et teknologisk og organisatorisk skift?','Hvordan bør selskap, merkevare, eier og produksjonssted skilles gjennom eierskiftene?','Hva dokumenterer produksjonsflyttingen i 2001 om geografisk omstilling?','Hvorfor betyr dagens museum og mikrobryggeri ikke at den gamle storskala produksjonen er tilbake?'],
      concepts:['verdiskaping','produksjonssystem','standardisering','kvalitetskontroll','innovasjon','verdikjede','eierstyring','selskapsstruktur','produksjonsflytting'],
      observable_traces:[
        {title:'Det bevarte brygghuset',observation:'Brygghuset i Thorvald Meyers gate 2A er et fysisk restledd fra det tidligere produksjonsanlegget.',interpretation_boundary:'Bevart industribygg dokumenterer tidligere stedlig produksjon, men dagens bruk er ikke bevis for at den historiske storskala driften fortsetter.',source_urls:['https://oslobyleksikon.no/side/Ringnes_Bryggeri','https://eiendomsspar.no/eiendommer/thorvald-meyers-gate-2a/']},
        {title:'Fra fabrikkvartal til blandet bruk',observation:'Deler av det tidligere bryggeriområdet er omformet mens enkelte nordlige bygg er bevart.',interpretation_boundary:'Fysisk omforming viser stedlig omstilling, men sier ikke alene hvorfor selskapsproduksjonen ble flyttet eller hvilken økonomisk effekt transformasjonen fikk.',source_urls:['https://oslobyleksikon.no/side/Ringnes_Bryggeri']}
      ],
      source_urls:['https://snl.no/Ringnes_AS','https://oslobyleksikon.no/side/Ringnes_Bryggeri','https://snl.no/Olav_Johan_Sopp','https://eiendomsspar.no/eiendommer/thorvald-meyers-gate-2a/'],verified_at:VERIFIED_AT
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
  if(!place?.id) throw new Error(`${relative}: missing Place id`);
  if(place.fagverk?.status==='curated') throw new Error(`${place.id}: already curated; refusing overwrite`);
  for(const [label,url] of target.sources) addExternalLink(place,label,url);
  place.fagverk=target.fagverk;
  registry.placeLinks[place.id]={sourceFile:relative.replace(/^data\//u,''),field:'fagverk',schema:target.fagverk.schema,level:target.fagverk.level,status:target.fagverk.status};
  write(relative,place); console.log(`Curated Fagverk: ${place.id}`);
}
write(REGISTRY_FILE,registry);
console.log('Indexed four Place-owned Fagverk packages');
