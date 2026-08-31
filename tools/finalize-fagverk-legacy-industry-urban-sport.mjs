#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-08-31';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const targets = {
  'data/places/naeringsliv/oslo/places_naeringsliv/freia_fabrikken.json': {
    sources: [
      ['Riksantikvaren – Freia', 'https://riksantikvaren.no/fredninger/freia/'],
      ['Oslo byleksikon – Freia', 'https://oslobyleksikon.no/side/Freia'],
      ['Store norske leksikon – Freia', 'https://snl.no/Freia_-_sjokoladefabrikk'],
      ['Store norske leksikon – Johan Throne Holst', 'https://snl.no/Johan_Throne_Holst']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'full',
      status: 'curated',
      intro: 'Freia-fabrikken kan undersøkes som ett sted der produksjon, arbeidsorganisering, bedriftsvelferd og merkevarebygging ble koblet fysisk sammen. Fabrikkfløyer, Freiaparken, Freiasalen og det autentiske ordmerket gir ulike spor, men de må leses mot daterte kilder for å skille produksjonshistorie fra senere vern og merkevarefortelling.',
      article: [
        'Freia ble grunnlagt på Rodeløkka i 1889, og Johan Throne Holst overtok fabrikken i 1892. Det stedbundne utgangspunktet var industriell produksjon: råvarer skulle mottas, bearbeides, formes, pakkes og sendes videre. Fabrikkanlegget vokste i takt med virksomheten, og de ulike fløyene kan derfor leses som spor etter produksjonskapasitet og organisering. Samtidig er det viktig å skille selve fabrikken fra butikkutsalget og lysreklamen på Karl Johan, som er markeds- og byspor knyttet til samme virksomhet, men ikke deler av dette Place-et.',
        'Arbeidslivet ble også organisert gjennom tiltak som fikk fysisk og institusjonell form. Freia opprettet pensjonskasse i 1916, bedriftslege i 1917 og innførte 48-timers arbeidsuke i 1918. Slike tiltak kan analyseres som ledelses- og arbeidslivshistorie, men betegnelsen mønsterbedrift må undersøkes kritisk. Velferdstiltak dokumenterer konkrete prioriteringer fra ledelsen; de beviser ikke at interessemotsetninger mellom ansatte og eiere forsvant eller at alle arbeidere opplevde arbeidsplassen likt.',
        'Freiaparken fra 1922 og Freiasalen fra 1934 viser hvordan arbeidsmiljø, arkitektur og kultur ble bygd inn i fabrikkens romlige system. Ole Sverre utformet parken og spisesalsbygningen, mens tolv malerier av Edvard Munch ble samlet som frise i salen. Parken og spisesalen var ikke separate dekorative tillegg uten forbindelse til arbeidsplassen: de inngikk i pauser, måltider og organisert rekreasjon. Samtidig må kunstverkene analyseres som kunst og bestillingshistorie, ikke som direkte dokumentasjon av fabrikkarbeidernes erfaringer.',
        'Freia-navnet gjør stedet relevant for studiet av merkevare og marked. Produksjon på Rodeløkka ble koblet til butikk, emballasje, reklame og visuelle kjennetegn som marabustorken og ordmerket. Det synlige skiltet på fabrikkfasaden dokumenterer merkevareidentitet i det bygde miljøet, men sier alene lite om markedsandeler, forbrukeratferd eller lønnsomhet. Slike spørsmål krever andre kilder. Faglig bør derfor produksjonssted, merkevareuttrykk og markedseffekt holdes som beslektede, men forskjellige analyseenheter.',
        'Anlegget har også endret avgrensning. Den østlige konfektfabrikken ble nedlagt i 2009 og senere erstattet av boliger, mens Freiaparken og Freiasalen ble fredet i 2015. Vernet gjør noen deler av industrimiljøet varige samtidig som virksomheten og byområdet fortsetter å endres. Freia-fabrikken er derfor et godt case for å undersøke hvordan et aktivt produksjonssted kan romme både industrihistorie, organisasjonskultur, kunst, merkevare og kulturminnevern uten at disse lagene smeltes sammen til én enkel fortelling.'
      ],
      subject_ids: ['naeringsliv'],
      emne_ids: ['em_naering_arbeid_verdiskaping','em_naering_arbeidsliv_organisering','em_naering_industri_og_mekanisering','em_naering_forbruk_marked','em_naering_merkevare_og_status'],
      chapter_ids: ['arbeid-produksjon-verdiskaping','handel-forbruk-marked'],
      lenses: [
        {id:'freia-produksjon',title:'Produksjon i fabrikkrom',prompt:'Hvordan kan fabrikkfløyene brukes til å undersøke produksjonsorganisering uten å anta dagens maskinpark bakover i tid?',subject_id:'naeringsliv',emne_id:'em_naering_industri_og_mekanisering',evidence:'Sammenhold daterte utbygginger med dokumentert produksjon og skill bevarte bygningsvolumer fra maskiner og prosesser som har endret seg.'},
        {id:'freia-arbeidsliv',title:'Velferd og arbeidsmakt',prompt:'Hvordan bør pensjonskasse, bedriftslege og arbeidstidsendringer analyseres uten å gjøre velferdstiltak til bevis på harmonisk arbeidsliv?',subject_id:'naeringsliv',emne_id:'em_naering_arbeidsliv_organisering',evidence:'Bruk daterte tiltak som dokumenterte ledelsesvalg og hold vurderinger av arbeidskonflikt, erfaring og makt åpne for andre kilder.'},
        {id:'freia-park-sal',title:'Arbeidsmiljø blir arkitektur',prompt:'Hva viser Freiaparken og Freiasalen om hvordan ledelsen organiserte pauser, måltider og kulturelle omgivelser for ansatte?',subject_id:'naeringsliv',emne_id:'em_naering_arbeid_verdiskaping',evidence:'Parken fra 1922 og salen fra 1934 gir fysiske spor etter et organisert arbeidsmiljøprogram knyttet til fabrikkens drift.'},
        {id:'freia-marked',title:'Fabrikk møter marked',prompt:'Hvordan koblet virksomheten produksjonsstedet til butikk, reklame og forbruk uten at markedssporene blir deler av selve fabrikken?',subject_id:'naeringsliv',emne_id:'em_naering_forbruk_marked',evidence:'Skill fabrikkankeret på Rodeløkka fra butikk og reklame på Karl Johan, og analyser dem som ulike ledd i samme markedsrelasjon.'},
        {id:'freia-merkevare',title:'Merkevaren i bygningsmiljøet',prompt:'Hva kan det autentiske Freia-ordmerket dokumentere om identitet, og hvilke påstander om merkevarens effekt krever markedsdata?',subject_id:'naeringsliv',emne_id:'em_naering_merkevare_og_status',evidence:'Skiltet dokumenterer et visuelt kjennetegn på stedet, mens rekkevidde, preferanser og økonomisk effekt ikke kan leses direkte av fasaden.'}
      ],
      guiding_questions: [
        'Hvordan endret fabrikkutbyggingen forholdet mellom produksjon, lager og distribusjon på Rodeløkka?',
        'Hvorfor bør begrepet mønsterbedrift testes mot konkrete arbeidslivstiltak og interessemotsetninger?',
        'Hvordan gjorde Freiaparken og Freiasalen arbeidsmiljø til en fysisk del av fabrikkanlegget?',
        'Hva skiller fabrikkens produksjonssted fra Freias butikk- og reklamespor på Karl Johan?',
        'Hvordan endrer fredningen i 2015 hva som bevares når industristedet fortsatt utvikles?'
      ],
      concepts: ['industriproduksjon','arbeidsorganisering','bedriftsvelferd','arbeidsmakt','verdiskaping','forbrukermarked','merkevare','bedriftsarkitektur','kulturminnevern'],
      observable_traces: [
        {title:'Teglfløyer fra flere perioder',observation:'Fabrikkanlegget består av sammenkoblede bygningsvolumer og teglfasader som viser at produksjonsstedet er bygget ut i flere etapper.',interpretation_boundary:'Bygningsforskjeller dokumenterer fysisk lagdeling, men sikker datering og tidligere produksjonsfunksjon må etableres gjennom historiske kilder.',source_urls:['https://oslobyleksikon.no/side/Freia','https://riksantikvaren.no/fredninger/freia/']},
        {title:'Park og spisesalsbygg',observation:'Freiaparken og Freiasalen ligger fysisk integrert i fabrikkmiljøet og kan observeres som egne romlige deler av arbeidsplassen.',interpretation_boundary:'Dagens bevarte form dokumenterer anlegget og vernet, mens faktisk historisk bruk og ansattes erfaringer krever skriftlig dokumentasjon.',source_urls:['https://riksantikvaren.no/fredninger/freia/','https://snl.no/Johan_Throne_Holst']}
      ],
      source_urls: ['https://riksantikvaren.no/fredninger/freia/','https://oslobyleksikon.no/side/Freia','https://snl.no/Freia_-_sjokoladefabrikk','https://snl.no/Johan_Throne_Holst'],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/naeringsliv/oslo/places_naeringsliv/alunverket.json': {
    sources: [
      ['Store norske leksikon – Alunverket', 'https://snl.no/Alunverket'],
      ['Store norske leksikon – Collett', 'https://snl.no/Collett'],
      ['Oslo byleksikon – Alunverket', 'https://oslobyleksikon.no/side/Alunverket'],
      ['Dagsavisen – Gamlebyens skjulte industrihistorie', 'https://www.dagsavisen.no/nyheter/gamlebyens-skjulte-industrihistorie/5040330'],
      ['Ekebergparken – historisk tidslinje', 'https://ekebergparken.com/historisk-tidslinje']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'full',
      status: 'curated',
      intro: 'Alunverket gjør tidlig kjemisk industri lesbar som en sammenhengende verdikjede fra alunskifer i Ekebergskrenten til brenning, luting, koking og krystallisering. Bruddspor, dokumenterte bygninger, arbeidsstyrke og statlige privilegier må analyseres sammen, men samtidige observasjoner og folketellinger må holdes til sine egne år og måleenheter.',
      article: [
        'Christian og Sophia Magdalenas Alunverk ble opprettet ved Ekeberg i 1737 av Peter Collett og Peder Leuch. Virksomheten inngikk i en økonomisk politikk som ønsket å erstatte import med innenlandsk produksjon, og myndighetene støttet tiltaket gjennom privilegier, tollfrihet og importvern. De første produksjonsforsøkene lyktes likevel dårlig, og driften stanset etter få år. Dette viser hvorfor privilegier og beskyttelse må skilles fra faktisk produktivitet: politiske rammer kunne redusere konkurransepress uten å løse tekniske og økonomiske problemer i produksjonen.',
        'Produksjonen startet igjen i 1758. Alunskifer ble tatt ut i Ekebergskrenten, brent og lutet med vann før væsken ble kokt inn i blypanner og alun kunne krystallisere i kar. I 1776 ble et pottaskekokeri knyttet til verket. Denne prosessen viser en stedlig verdikjede med råvareuttak, brensel, kjemisk bearbeiding, transport mellom produksjonsledd og ferdig produkt. Bygningene og bruddet bør derfor analyseres som deler av ett produksjonssystem, ikke som uavhengige kulturminner.',
        'Arbeidet knyttet mennesker til denne tekniske kjeden. Kildene oppgir 44 arbeidere i 1790-årene, mens folketellingen i 1801 viser et arbeidssamfunn på 138 personer rundt Alunverket. Tallene beskriver forskjellige år og enheter og kan ikke settes sammen som en enkel vekstkurve. John Collett opprettet en skole for arbeidernes barn i 1806. Skolen kan undersøkes som paternalistisk arbeidslivspolitikk der omsorg, disiplin og produksjonsbehov virket sammen, men den dokumenterer ikke i seg selv barnas erfaringer eller skolegangens regelmessighet.',
        'Råvareuttaket endret landskapet. Mary Wollstonecraft beskrev en fjellside tydelig preget av virksomheten da hun passerte området i 1790, men observasjonen må brukes innenfor sin kildegrense: den dokumenterer et samtidig inntrykk, ikke målt produksjonsvolum eller kjemisk forurensning. De synlige bruddsporene i Ekebergskrenten er på samme måte direkte fysiske spor etter inngrep, mens omfanget av uttak, avfallsstrømmer og miljøeffekter må rekonstrueres fra flere typer kilder.',
        'Alunverket ble nedlagt i 1815. Fabrikkbygninger sto igjen en tid, mens senere jernbane- og veianlegg endret området. Det gjør stedet relevant for omstilling og tap av industristrukturer: verdikjeden forsvant, men bruddsporet ble stående som et materiell avtrykk. Faglig kan nedleggelsen undersøkes gjennom kostnader, marked, teknisk utvikling og eierskap, men årsakene bør ikke reduseres til én faktor uten eksplisitte kilder. Stedet viser hvordan tidlig industri kan overleve tydeligst gjennom landskapsendring snarere enn gjennom bevart fabrikkarkitektur.'
      ],
      subject_ids: ['naeringsliv'],
      emne_ids: ['em_naering_arbeid_verdiskaping','em_naering_industri_og_mekanisering','em_naering_produksjon_produktivitet','em_naering_logistikk_verdikjeder','em_naering_baerekraft_eksternaliteter','em_naering_makt_ulikhet_arbeidsliv','em_naering_omstilling_kriser_skift'],
      chapter_ids: ['arbeid-produksjon-verdiskaping','logistikk-infrastruktur-okonomisk-rom','makt-regulering-baerekraft'],
      lenses: [
        {id:'alun-produksjon',title:'Kjemisk produksjonskjede',prompt:'Hvordan ble alunskifer omformet fra råvare i skrenten til et ferdig produkt gjennom flere produksjonsledd?',subject_id:'naeringsliv',emne_id:'em_naering_produksjon_produktivitet',evidence:'Følg brenning, luting, innkoking og krystallisering som separate trinn og knytt hvert trinn til material- og energibehov.'},
        {id:'alun-verdikjede',title:'Brudd og fabrikk sammen',prompt:'Hvorfor må bruddspor, produksjonsbygninger og intern transport analyseres som én verdikjede framfor tre separate steder?',subject_id:'naeringsliv',emne_id:'em_naering_logistikk_verdikjeder',evidence:'Råstoff, brensel, væske, ferdigvare og avfall måtte flyttes mellom geografisk adskilte ledd i samme produksjonssystem.'},
        {id:'alun-privilegier',title:'Beskyttelse uten garanti',prompt:'Hva kan statlige privilegier og importvern forklare om etableringen, og hva forklarer de ikke om produksjonens lønnsomhet?',subject_id:'naeringsliv',emne_id:'em_naering_omstilling_kriser_skift',evidence:'De politiske fordelene er dokumenterte rammevilkår, mens driftsstans og senere gjenopptak viser at økonomisk og teknisk suksess ikke fulgte automatisk.'},
        {id:'alun-arbeidsmakt',title:'Paternalisme i arbeidssamfunnet',prompt:'Hvordan kan skolen fra 1806 undersøkes som både omsorgstiltak og del av maktforholdet mellom eiere og arbeiderfamilier?',subject_id:'naeringsliv',emne_id:'em_naering_makt_ulikhet_arbeidsliv',evidence:'Plasser skolen i arbeidssamfunnet og skill eiernes organiserte tiltak fra barnas og familienes dokumenterte erfaringer.'},
        {id:'alun-eksternaliteter',title:'Landskap som kostnadsspor',prompt:'Hva dokumenterer bruddsporene direkte om ressursuttak, og hvilke miljøkostnader kan ikke fastslås bare ved å se på fjellet?',subject_id:'naeringsliv',emne_id:'em_naering_baerekraft_eksternaliteter',evidence:'Det fysiske inngrepet er observerbart, mens forurensning, avfallsvolum og økologisk effekt krever historiske målinger eller andre kilder.'}
      ],
      guiding_questions: [
        'Hvordan påvirket statlige privilegier etableringen uten å garantere teknisk eller økonomisk suksess?',
        'Hvilke produksjonsledd måtte kobles sammen for å gjøre alunskifer til salgbart alun?',
        'Hvorfor kan arbeidertallet fra 1790-årene og folketellingen i 1801 ikke bli én vekstserie?',
        'Hvordan viser skolen fra 1806 forbindelsen mellom bedriftsomsorg, disiplin og arbeidsmakt?',
        'Hva kan dagens bruddspor dokumentere sikkert om industrien som ble nedlagt i 1815?'
      ],
      concepts: ['merkantilisme','importvern','produksjonsprosess','produktivitet','verdikjede','råvareuttak','paternalisme','arbeidsmakt','eksternalitet','omstilling'],
      observable_traces: [
        {title:'Bruddspor i Ekebergskrenten',observation:'Uttaket i fjellet ved Konows gate er fortsatt synlig som et fysisk inngrep i Ekebergskrenten.',interpretation_boundary:'Sporet dokumenterer at fjell ble tatt ut, men gir ikke alene volum, arbeidsintensitet eller målte miljøeffekter fra den historiske driften.',source_urls:['https://oslobyleksikon.no/side/Alunverket','https://snl.no/Alunverket']},
        {title:'Industristed uten komplett fabrikk',observation:'Dagens område mangler den komplette bygningsrekken som tidligere bandt sammen flere produksjonsledd nedenfor bruddet.',interpretation_boundary:'Fraværet er et spor etter senere omforming, men hvilke bygninger som forsvant når må dokumenteres gjennom historiske beskrivelser og bilder.',source_urls:['https://www.dagsavisen.no/nyheter/gamlebyens-skjulte-industrihistorie/5040330','https://ekebergparken.com/historisk-tidslinje']}
      ],
      source_urls: ['https://snl.no/Alunverket','https://snl.no/Collett','https://oslobyleksikon.no/side/Alunverket','https://www.dagsavisen.no/nyheter/gamlebyens-skjulte-industrihistorie/5040330','https://ekebergparken.com/historisk-tidslinje'],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/sport/europa/norway/oslo_sport/ekebergsletta.json': {
    sources: [
      ['Norway Cup – Om oss', 'https://norwaycup.no/en/om-oss/'],
      ['Norway Cup – Hofmos minnepokal', 'https://norwaycup.no/om-oss/tidligere-resultater-og-vinnere/hofmos-minnepokal/'],
      ['Oslo byleksikon – Ekebergsletta', 'https://oslobyleksikon.no/side/Ekebergsletta'],
      ['Oslo Idrettskrets – historisk vedtak for Osloidretten', 'https://www.idrettsforbundet.no/idrettskrets/oslo/nyhet/arkiv/historisk-vedtak-for-osloidretten/'],
      ['Store norske leksikon – Norway Cup', 'https://snl.no/Norway_Cup']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Ekebergsletta kan leses som et idrettslandskap som skifter mellom åpen flerbruksflate og midlertidig turneringsby. Vedtakene fra 1946–47, åpningen i 1948 og Norway Cup fra 1972 gjør arealpolitikk, breddeidrett, frivillighet, turneringsformat og inkludering observerbare i samme sted.',
      article: [
        'Ekebergsletta ble sikret til idrett og friluftsliv gjennom vedtak i 1946 og 1947, tatt i bruk etter opprydding i 1947 og offisielt åpnet i 1948. Rolf Hofmo var en sentral pådriver. Historien viser at en idrettsflate ikke bare oppstår gjennom sportslig bruk; tilgang til areal, offentlige beslutninger og fysisk tilrettelegging er forutsetninger. Sletta har også rommet landbruksutstilling og Osloløpet, noe som understreker flerbruken uten å gjøre hvert arrangement permanent i landskapet.',
        'Norway Cup startet i 1972 og bruker sletta som hovedarena. Under turneringen blir åpne gressflater omorganisert gjennom baner, ganglinjer, flagg, servicefunksjoner, kampoppsett og frivillig arbeid. Turneringens størrelse må alltid dateres fordi lag- og deltakerantall varierer; rekordtallet fra 2023 er et punkt, ikke en tidløs normal. Slik kan Ekebergsletta analyseres som logistikk og konkurranseformat i praksis, ikke bare som bakgrunn for fotballkamper.',
        'Bredde- og inkluderingsperspektivet er også stedlig. Åtte jentelag deltok allerede i den første turneringen, og arrangøren beskriver en lang internasjonal deltakelse. Det dokumenterer konkrete åpninger i turneringshistorien, men ikke at alle barrierer for deltakelse er borte. Kostnader, funksjonsevne, kjønn, reise og organisering må undersøkes med egne kilder. Utenom turneringen kan baneflatene observeres, men et besøk kan ikke bevise ett bestemt års deltakerantall eller sosiale sammensetning.'
      ],
      subject_ids: ['sport'],
      emne_ids: ['em_sport_arena_samling','em_sport_breddeidrett','em_sport_frivillighet_dugnad','em_sport_turnering_format','em_sport_inkludering_idrett'],
      chapter_ids: ['arenaer-steder-groundhopper','klubber-lag-frivillighet','regler-spill-konkurranse','inkludering-helse-lek-samfunn'],
      lenses: [
        {id:'ekebergsletta-areal',title:'Idrett krever arealpolitikk',prompt:'Hvordan viser vedtakene fra 1946–47 at tilgang til idrettsareal er et organisatorisk og politisk spørsmål?',subject_id:'sport',emne_id:'em_sport_arena_samling',evidence:'Knytt beslutningene, oppryddingen og åpningen i 1948 til slettas senere funksjon som stor offentlig aktivitetsflate.'},
        {id:'ekebergsletta-frivillighet',title:'Turnering bygges av frivillighet',prompt:'Hvordan blir frivillig arbeid en del av den midlertidige infrastrukturen når Norway Cup organiserer Ekebergsletta?',subject_id:'sport',emne_id:'em_sport_frivillighet_dugnad',evidence:'Kampavvikling, service, veiledning og logistikk krever organiserte roller som ikke er synlige i den tomme gressflaten resten av året.'},
        {id:'ekebergsletta-format',title:'Turneringsformat former stedet',prompt:'Hvordan omformer kampoppsett, banefelt og samtidige lag en åpen slette til et konkurransesystem under Norway Cup?',subject_id:'sport',emne_id:'em_sport_turnering_format',evidence:'Les de midlertidige banene og flytlinjene som fysisk konsekvens av turneringsregler, tidsplan og stort antall samtidige kamper.'},
        {id:'ekebergsletta-inkludering',title:'Deltakelse må dateres',prompt:'Hva viser tidlig jentedeltakelse og internasjonale lag om inkludering, og hvilke barrierer kan ikke avleses av deltakerlistene alene?',subject_id:'sport',emne_id:'em_sport_inkludering_idrett',evidence:'Bruk dokumenterte deltakelsespunkt som åpninger, men hold økonomi, funksjonsevne og individuelle erfaringer som separate undersøkelsesspørsmål.'}
      ],
      guiding_questions: [
        'Hvorfor er vedtakene fra 1946–47 en del av Ekebergslettas idrettshistorie?',
        'Hvordan forandrer Norway Cup den åpne sletta til et midlertidig turneringslandskap?',
        'Hva gjør frivillige organisatorisk som ikke kan leses direkte av baneflatene?',
        'Hvorfor må lag- og deltakerrekorder knyttes til bestemte turneringsår?',
        'Hva kan tidlig jentedeltakelse dokumentere om inkludering, og hva krever flere kilder?'
      ],
      concepts: ['idrettsareal','breddeidrett','frivillighet','dugnad','turneringsformat','midlertidig infrastruktur','inkludering','arealpolitikk'],
      observable_traces: [
        {title:'Åpen flerbruksflate',observation:'Store sammenhengende gressflater og oppdelbare banefelt gjør det mulig å organisere mange aktiviteter på samme område.',interpretation_boundary:'Den fysiske flaten dokumenterer kapasitet og romlig fleksibilitet, men ikke ett bestemt års kamp-, lag- eller deltakerantall.',source_urls:['https://oslobyleksikon.no/side/Ekebergsletta','https://norwaycup.no/en/om-oss/']},
        {title:'Turneringens midlertidige spor',observation:'Under Norway Cup organiseres flagg, banemerking, ganglinjer og servicefunksjoner som et midlertidig lag over den åpne sletta.',interpretation_boundary:'Sporene viser arrangementsbruk når de er til stede, men de kan ikke alene dokumentere arrangørhistorie eller sosial inkludering over tid.',source_urls:['https://norwaycup.no/en/om-oss/','https://snl.no/Norway_Cup']}
      ],
      source_urls: ['https://norwaycup.no/en/om-oss/','https://norwaycup.no/om-oss/tidligere-resultater-og-vinnere/hofmos-minnepokal/','https://oslobyleksikon.no/side/Ekebergsletta','https://www.idrettsforbundet.no/idrettskrets/oslo/nyhet/arkiv/historisk-vedtak-for-osloidretten/','https://snl.no/Norway_Cup'],
      verified_at: VERIFIED_AT
    }
  },

  'data/places/by/oslo/damstredet_telthusbakken/damstredet_telthusbakken.json': {
    sources: [
      ['Oslo byleksikon – Damstredet', 'https://oslobyleksikon.no/side/Damstredet'],
      ['Oslo byleksikon – Telthusbakken', 'https://oslobyleksikon.no/side/Telthusbakken'],
      ['Oslo byleksikon – Bergfjerdingen', 'https://oslobyleksikon.no/side/Bergfjerdingen'],
      ['Oslo byleksikon – Billedhuggerløkken', 'https://oslobyleksikon.no/side/Billedhuggerl%C3%B8kken'],
      ['Oslo byleksikon – Sigrun Bergs plass', 'https://oslobyleksikon.no/side/Sigrun_Bergs_plass']
    ],
    fagverk: {
      schema: 'history_go_place_fagverk_v2',
      level: 'standard',
      status: 'curated',
      intro: 'Damstredet og Telthusbakken gjør eldre byform lesbar i hverdagsrom: smale gateløp, trehus, bratt terreng, forhager, trapper og senere bevaringsgrep ligger tett sammen. De to gatene skal analyseres som beslektede, men ulike miljøer, og offentlig gategrunn må skilles fra private boliger og hager.',
      article: [
        'Damstredet og Telthusbakken viser en småskalert bystruktur fra før murgårdsbyen ble dominerende. Damstredet knyttes til Bergfjerdingen, Billedhuggerdammen, håndverk og senere bevaring, mens Telthusbakken vokste fram på bratt marginal grunn i Bymarken og fikk mer formaliserte tomteforhold i 1815–16. De to gateløpene ligger nær hverandre, men har ulike navne-, eiendoms- og bosettingshistorier. Faglig bør de derfor sammenlignes uten å gjøres identiske.',
        'Materialiteten er synlig i gateplanet: trehusenes skala, ujevne gateløp, berg, støttemurer, trapper, gjerder og små overganger mellom privat og offentlig rom. Slike spor kan beskrives direkte, men eksakt alder og vernestatus for hvert hus kan ikke generaliseres uten register- og byggesakskilder. Områdets idylliske uttrykk er dessuten resultat av vedlikehold, ombygging og restaurering; det er ikke en urørt tidslomme fra 1700-tallet.',
        'Hverdagsrommet rommer også minne og sosialhistorie. Henrik Wergelands bosted, Sigurd Dickmans snublestein og Sigrun Bergs plass knytter bestemte personer og senere minnearbeid til gatebildet. Disse sporene må brukes presist: en snublestein dokumenterer et ettertidig minnepunkt og viser til en dokumentert personhistorie, mens den ikke gjør hele gaten til et krigshistorisk sted. På samme måte må dagens boligbruk respekteres; observasjon skal skje fra offentlig gate uten å gjøre private hjem til utstillingsobjekter.'
      ],
      subject_ids: ['by'],
      emne_ids: ['em_by_historiske_lag_i_hverdagsrom','em_by_materialitet_og_sanseerfaring','em_by_boligstruktur'],
      chapter_ids: ['arkitektur-type-skala-byform','byliv-stemning-mikrokomfort'],
      lenses: [
        {id:'damstredet-bylag',title:'Historiske lag i gateform',prompt:'Hvordan kan de to gateløpene sammenlignes uten å gjøre deres bosettings- og navnehistorie til én fortelling?',subject_id:'by',emne_id:'em_by_historiske_lag_i_hverdagsrom',evidence:'Skill Damstredets Bergfjerdingen- og bevaringsspor fra Telthusbakken som marginal Bymark-grunn med formalisering av tomter i 1815–16.'},
        {id:'damstredet-materialitet',title:'Materialitet før datering',prompt:'Hva kan trehus, trapper, berg og gjerder dokumentere direkte før enkeltbyggenes alder og vern er kildekontrollert?',subject_id:'by',emne_id:'em_by_materialitet_og_sanseerfaring',evidence:'Beskriv synlig materiale, skala og terreng først, og hold eksakte byggeår og vernestatus tilbake uten primær registerdokumentasjon.'},
        {id:'damstredet-bolig',title:'Boligstruktur og privat grense',prompt:'Hvordan viser forhager, porter og små tomter boligstruktur samtidig som observasjonen må stoppe ved grensen til private hjem?',subject_id:'by',emne_id:'em_by_boligstruktur',evidence:'Gateplanet gir lesbare overganger mellom offentlig og privat, men bruk og erfaring inne i boligene er ikke tilgjengelig som visuell evidens.'},
        {id:'damstredet-bevaring',title:'Bevaring endrer tidsbildet',prompt:'Hvordan kan restaurerte trehus brukes som historiske spor uten å beskrive området som en urørt tidslomme fra før murbyen?',subject_id:'by',emne_id:'em_by_historiske_lag_i_hverdagsrom',evidence:'Sammenhold eldre gatehistorie med dokumenterte ombygginger, restaurering og senere minnearbeid som nye lag i det samme miljøet.'}
      ],
      guiding_questions: [
        'Hvilke forskjeller mellom Damstredet og Telthusbakken forsvinner dersom de behandles som ett historisk miljø?',
        'Hva kan gateform og trehusmaterialitet dokumentere uten eksakte byggeår for hvert enkelt hus?',
        'Hvordan påvirket bratt terreng og marginal Bymark-grunn bosettingen i Telthusbakken?',
        'Hvorfor bør restaurering og bevaring behandles som senere historiske lag i Damstredet?',
        'Hvordan kan man undersøke boligstruktur fra offentlig gate uten å gjøre private hjem til utstilling?'
      ],
      concepts: ['historiske lag','boligstruktur','trehusmiljø','materialitet','topografi','bybevaring','offentlig privat grense','minnearbeid'],
      observable_traces: [
        {title:'Smale gateløp og trehus',observation:'De to gatene har småskala trehus, bratte sekvenser og korte avstander mellom fasader, forhager og offentlig gategrunn.',interpretation_boundary:'Form og materialitet er observerbare, men hvert hus sin alder, opprinnelige utforming og formelle vernestatus må kontrolleres separat.',source_urls:['https://oslobyleksikon.no/side/Damstredet','https://oslobyleksikon.no/side/Telthusbakken']},
        {title:'Terreng og tomtegrenser',observation:'Berg, trapper, murer, gjerder og små tomter viser hvordan bebyggelsen tilpasser seg et ujevnt og bratt terreng.',interpretation_boundary:'Dagens terrengforhold kan observeres, mens historiske eiendomsgrenser og formaliseringen av tomter krever skriftlige kilder.',source_urls:['https://oslobyleksikon.no/side/Telthusbakken','https://oslobyleksikon.no/side/Bergfjerdingen']}
      ],
      source_urls: ['https://oslobyleksikon.no/side/Damstredet','https://oslobyleksikon.no/side/Telthusbakken','https://oslobyleksikon.no/side/Bergfjerdingen','https://oslobyleksikon.no/side/Billedhuggerl%C3%B8kken','https://oslobyleksikon.no/side/Sigrun_Bergs_plass'],
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
