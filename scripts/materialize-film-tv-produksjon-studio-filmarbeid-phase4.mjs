#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'produksjon-studio-og-filmarbeid';
const CHAPTER_DIR = `data/fagverk/film_tv/${CHAPTER_ID}`;
const CHAPTER_FILE = `${CHAPTER_DIR}.json`;
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_film_tv_audiovisuell_form', 'em_film_tv_digital_etterarbeid',
  'em_film_tv_filmarbeidsliv', 'em_film_tv_filmokonomi', 'em_film_tv_filmproduksjon',
  'em_film_tv_filmrytme', 'em_film_tv_fortellingsstruktur', 'em_film_tv_fotografi_film',
  'em_film_tv_kamera_bildearbeid', 'em_film_tv_klipp_montasje',
  'em_film_tv_kollektivt_filmwerk', 'em_film_tv_kringkastingsproduksjon',
  'em_film_tv_lys_lyd', 'em_film_tv_manus_dramaturgi', 'em_film_tv_postproduksjon',
  'em_film_tv_produksjonsteam', 'em_film_tv_produsent_finansiering',
  'em_film_tv_studio_produksjonsrom', 'em_film_tv_tv_hus_redaksjon',
  'em_film_tv_usynlig_filmproduksjon'
];

const methodIds = [
  'met_film_tv_lysanalyse', 'met_film_tv_lydanalyse',
  'met_film_tv_postproduksjonsanalyse', 'met_film_tv_digital_arbeidsflytanalyse',
  'met_film_tv_arbeidslivsanalyse', 'met_film_tv_produksjonskulturanalyse',
  'met_film_tv_produsentanalyse', 'met_film_tv_finansieringsanalyse',
  'met_film_tv_studioanalyse', 'met_film_tv_produksjonsanalyse',
  'met_film_tv_klippanalyse', 'met_film_tv_montasjeanalyse',
  'met_film_tv_manusanalyse', 'met_film_tv_dramaturgianalyse',
  'met_film_tv_kameraanalyse', 'met_film_tv_bildeanalyse',
  'met_film_tv_arbeidsanalyse', 'met_film_tv_team_analyse',
  'met_film_tv_tv_husanalyse', 'met_film_tv_redaksjonsanalyse'
];

const relatedPlaces = [
  { id: 'nrk_huset_marienlyst', name: 'NRK-huset på Marienlyst', role: 'Undersøk studio, kontrollrom, scenografi, flerkameraproduksjon, direkteavvikling og arbeidsdelingen bak kringkastet bilde og lyd.' },
  { id: 'hartvig_nissens_skole_skam', name: 'Hartvig Nissens skole (SKAM)', role: 'Sammenlign en virkelig location med et kontrollert studio: adgang, dagslys, lyd, kontinuitet, skolehverdag og produksjonens praktiske fotavtrykk.' },
  { id: 'oslo_met_pilestredet', name: 'OsloMet, Pilestredet', role: 'Bruk utdannings- og produksjonsmiljøet til å kartlegge hvordan kamera, lyd, klipp og teamarbeid læres gjennom konkrete arbeidsflyter.' },
  { id: 'lisbon_tobis_portuguesa', name: 'Tobis Portuguesa', role: 'Sammenlign et historisk studiokompleks og laboratorium med dagens digitale produksjons- og postproduksjonskjede.' }
];

const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({
  id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds
});

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'film_tv', subject_id: 'film_tv',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'produksjon_studio_arbeid',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Produksjon, studio og filmarbeid: hvordan levende bilder blir laget',
  subtitle: 'Fra Filmparkens lydtette studioer og NRKs kontrollrom til kamera, lys, lyd, klipp, finansiering, postproduksjon og arbeidsvilkår',
  lead: 'Et ferdig bilde skjuler som regel rommet, planen, apparatene og menneskene som gjorde det mulig. Kapittelet åpner produksjonskjeden: manus og budsjett, studio og location, kamera og lys, opptakslyd, scenografi, klipp, miks, levering og arbeidstid. Målet er å analysere dokumenterte produksjonsvalg uten å gjøre utstyr til kvalitet, regissøren til eneste opphav eller sluttfilmen til bevis på at arbeidsprosessen var trygg og rimelig.',
  learningObjectives: [
    'skille studioets fysiske fasiliteter fra produksjonen som bruker dem',
    'analysere kamera, optikk, lys, scenografi og lyd som samvirkende valg',
    'forklare hvordan klipp skaper rekkefølge, varighet, rytme og sammenheng',
    'følge et prosjekt fra manus og finansieringsplan til opptak, postproduksjon og leveranse',
    'kartlegge ansvarsdelingen mellom produsent, regi, foto, lyd, produksjonsdesign, klipp og manus',
    'skille kunstnerisk ansvar, juridisk arbeidsgiveransvar og økonomisk risiko',
    'undersøke TV-husets studio-, kontrollroms- og distribusjonsflyt',
    'dokumentere filmarbeidsliv gjennom kontrakt, arbeidsinstruks, produksjonsplan, kreditering og HMS-spor'
  ],
  diagnosticQuestions: [
    { question: 'Er studioet selve produksjonen?', answer: 'Nei. Studioet gir kontrollerbare rom og tjenester; produksjonen består av prosjekt, team, tid, finansiering, opptak og etterarbeid.' },
    { question: 'Gir et dyrt kamera automatisk et godt bilde?', answer: 'Nei. Kameraegenskaper setter muligheter og begrensninger, men lys, optikk, eksponering, bevegelse, scenografi, opptak og etterarbeid avgjør hvordan de brukes.' },
    { question: 'Er klipp bare å forkorte opptak?', answer: 'Nei. Klipp velger, ordner og forbinder bilde og lyd og skaper dermed tid, rytme, rom og fortellingsinformasjon.' },
    { question: 'Kan rulleteksten alene dokumentere alle som arbeidet på filmen?', answer: 'Nei. Kreditering må prøves mot kontrakter, call sheets, produksjonsplaner, fagforeningsspor og intervjuer.' }
  ],
  relatedPlaces,
  moduleFiles: [`${CHAPTER_DIR}/01-grunnlag.json`, `${CHAPTER_DIR}/02-fordypning.json`, `${CHAPTER_DIR}/03-anvendelse.json`],
  briefFile: `${CHAPTER_DIR}/brief.json`, claimsFile: `${CHAPTER_DIR}/claims.json`
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'film_tv',
  chapter_id: CHAPTER_ID, primary_domain_id: 'produksjon_studio_arbeid',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Film & TVs andre canonicale domene med kildebasert undervisning i produksjonsrom, kamera, foto, lys, lyd, manus, klipp, team, produsent, finansiering, postproduksjon, kringkastingsproduksjon og filmarbeidsliv.',
  audience: 'Brukere som skal kunne undersøke hvordan et audiovisuelt verk faktisk blir produsert uten å bruke utstyr, auteurmyter, budsjett eller sluttresultat som erstatning for dokumentasjon av prosessen.',
  learningArc: [
    'starte i studioet som fysisk og logistisk produksjonsrom',
    'skille kameraets tekniske kapasitet fra fotografiske og lysmessige valg',
    'følge lyd fra opptak via redigering og miks til leveranse',
    'analysere hvordan klipp ordner bilde, lyd, tid og rytme',
    'koble manus, regi, produksjonsdesign og øvrige fagfunksjoner til en felles produksjonsplan',
    'lese budsjett og finansiering som betingelser, ikke som kvalitetsmål',
    'undersøke NRK-studio og kringkastingsproduksjon som koordinert avvikling',
    'avslutte med en arbeids- og evidensmatrise for synlige og usynlige produksjonsbidrag'
  ],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'studiofasilitet vs konkret produksjon', 'kameraegenskap vs fotografisk resultat',
    'opptakslyd vs lyddesign og sluttmiks', 'råopptak vs redigert sekvens',
    'manusplan vs ferdig fortelling', 'regissøransvar vs kollektivt filmarbeid',
    'produksjonsbudsjett vs kunstnerisk kvalitet', 'tilskudd vs fullfinansiering',
    'opptak vs postproduksjon', 'TV-hus som bygg vs produksjonsorganisasjon',
    'rulletekst vs full arbeidsstokk', 'lang arbeidsdag vs dokumentert produksjonsbehov og lovlig plan'
  ],
  sourceStrategy: {
    priority: [
      'konkrete studio-, utdannings-, produksjons-, finansierings-, verktøy- og arbeidslivskilder',
      'Filmparken, NRK, NFI, Den norske filmskolen, Arbeidstilsynet og partene i tariffavtaler',
      'dokumenterte rom, roller, finansieringskrav, arbeidsplaner, kamera-, lyd- og postarbeidsflyter',
      'filmteori først etter at et konkret produksjonsvalg, fagansvar eller produksjonsspor er etablert'
    ],
    minimumExternalSources: 18, claimLevelTrace: true, sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: [
      'studio, location, produksjonskontor, verksted, kontrollrom og postproduksjonsrom',
      'manus, regi, produsent, foto, kamera, lys, lyd, produksjonsdesign og klipp',
      'finansieringsplan, offentlig tilskudd, produksjonsplan og leveransekrav',
      'kringkastingsproduksjon, arbeidsdeling, arbeidstid, kontrakt og HMS',
      'Marienlyst, Hartvig Nissen, OsloMet og Tobis Portuguesa som canonicale stedscase'
    ],
    excluded: [
      'utstyrsmerke brukt som direkte bevis på bildekvalitet',
      'regissøren brukt som eneste opphav til et kollektivt verk',
      'stort budsjett brukt som direkte mål på kunstnerisk verdi',
      'rulletekst brukt som uttømmende arbeidslivskilde',
      'TV-redaksjon behandlet som generell journalistikk uten konkret audiovisuell produksjon',
      'teori eller canonicale emnenavn brukt uten verk-, studio-, opptaks-, arbeids- eller verktøyanker'
    ]
  },
  qa: {
    exactCanonicalCoverage: '20/20', minimumModules: 3, minimumSections: 9,
    paragraphClaimTraceRequired: true,
    rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction']
  }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('ftv-psf-grunnlag-1', 'Studioet er et kontrollert arbeidsrom', [
        'Filmparken tilbyr tre store studioer med tilknyttede produksjonskontorer, sminke, garderober, oppholdsrom, rekvisittrom og kameralagring. Studioanalyse begynner derfor med rom, adkomst, strøm, lydisolasjon, gulv, grid og hjelperom – ikke med antakelsen om at studioet alene produserer et bestemt uttrykk.',
        'Studio A er 450 kvadratmeter, lydtett, har tregulv, industriporter, 23 lysheiser og et basseng som kan åpnes. Hver egenskap er en produksjonsmulighet med praktiske konsekvenser for rigg, dekor, kameraføring, sikkerhet, tid og kostnad.',
        'Filmparken har også dekor-, metall- og malerverksted, trucker, lift og stillaser. Et studio er dermed en logistisk node der bygging, lagring, transport, opptak og personflyt må koordineres gjennom en produksjonsplan.'
      ], [['ftv-psf-01'], ['ftv-psf-02'], ['ftv-psf-03']], [
        'Registrer studioets målbare fasiliteter før du tolker det ferdige bildet.',
        'Skill det faste anlegget fra prosjektets midlertidige team, sett og arbeidsflyt.'
      ], [['ftv-psf-01', 'ftv-psf-02'], ['ftv-psf-03']]),
      section('ftv-psf-grunnlag-2', 'Kamera og lys skaper handlingsrom, ikke kvalitet alene', [
        'ARRI oppgir at ALEXA 35 har 17 trinn dynamisk omfang. Et slikt målt spillerom kan bevare informasjon i høylys og skygger, men sier ikke alene noe om motiv, optikk, eksponering, kamerabevegelse, lyssetting eller hvordan materialet senere graderes.',
        'Profesjonell lyssetting bruker blant annet LED, dagslys- og tungstenarmaturer, styring, rigg og tilbehør. Lysanalysen registrerer retning, styrke, fargetemperatur, kontrast, bevegelse og forholdet til produksjonsdesign før stemning eller realisme tolkes.',
        'Den norske filmskolen utdanner egne filmfotografer. Fagdelingen synliggjør at bildearbeid er et ansvarsfelt med planlegging, samarbeid og dokumenterte valg; kameraet er et redskap i en fotografisk praksis, ikke en selvstendig opphavsperson.'
      ], [['ftv-psf-04'], ['ftv-psf-05'], ['ftv-psf-06']], [
        'Skille sensor- og optikkegenskaper fra bruken av dem i en konkret scene.',
        'Analyser kamera, lys og produksjonsdesign som samvirkende system.'
      ], [['ftv-psf-04', 'ftv-psf-06'], ['ftv-psf-05', 'ftv-psf-06']]),
      section('ftv-psf-grunnlag-3', 'Lyd må følges fra opptak til miks', [
        'Filmskolens lydlinje utdanner lyddesignere og lydmestere. Opptakslyd omfatter blant annet mikrofonplassering, nivå, romtone, synk og støyhåndtering, mens senere lydredigering kan velge, rense, erstatte og bygge videre på materialet.',
        'Dolby Atmos lar skapere plassere og bevege lyd som kanaler og objekter med metadata, og renderer dette til ulike avspillingsmiljøer. Sluttmiksen er derfor både et estetisk valg og en teknisk leveranse, ikke en uendret kopi av det som ble tatt opp på settet.',
        'Audiovisuell form oppstår i koordineringen av bilde og lyd over tid. En lyd kan ligge foran bildet, fortsette over et klipp eller komme fra et rom utenfor utsnittet; analysen må beskrive relasjonen før lyd bare kalles realistisk eller stemningsskapende.'
      ], [['ftv-psf-07'], ['ftv-psf-08'], ['ftv-psf-09']], [
        'Skill opptakslyd, lydredigering, lyddesign og sluttmiks.',
        'Beskriv når bilde og lyd begynner, slutter og skifter i forhold til hverandre.'
      ], [['ftv-psf-07', 'ftv-psf-08'], ['ftv-psf-09']])
    ],
    concepts: [
      { id: 'produksjonsrom', term: 'Produksjonsrom', definition: 'Et fysisk rom med tekniske, logistiske og sikkerhetsmessige betingelser for et bestemt ledd i film- eller TV-arbeidet.' },
      { id: 'produksjonsplan', term: 'Produksjonsplan', definition: 'En datert organisering av forberedelse, bemanning, opptak, transport, etterarbeid og leveranser.' },
      { id: 'fotografisk-valg', term: 'Fotografisk valg', definition: 'Et begrunnet valg av blant annet utsnitt, optikk, eksponering, kamerahøyde, bevegelse og lys.' },
      { id: 'opptakslyd', term: 'Opptakslyd', definition: 'Lyd registrert under opptaket, med synk, romtone, dialog, atmosfære og dokumenterte tekniske betingelser.' },
      { id: 'postproduksjon', term: 'Postproduksjon', definition: 'Arbeidet etter opptak med organisering, klipp, lyd, effekter, farge, kvalitetssikring og leveranse.' },
      { id: 'produksjonskultur', term: 'Produksjonskultur', definition: 'Normer, språk, hierarkier og arbeidsmåter som former hvordan et produksjonsteam løser oppgaver og fordeler synlighet og ansvar.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('ftv-psf-fordypning-1', 'Klipp velger og ordner tid', [
        'Avid beskriver postproduksjonens første ledd som ingest og organisering før redigering. Filnavn, metadata, synk, sikkerhetskopi og versjoner er derfor en del av klippearbeidets evidensgrunnlag; uten orden kan ikke opptakene etterprøves eller gjenfinnes sikkert.',
        'Redigering velger, trimmer og arrangerer klipp. Mellom to bilder oppstår en beslutning om rekkefølge, varighet, romlig sammenheng og informasjonsfordeling; filmrytme må derfor måles i faktiske innstillinger, overganger, lydforløp og pauser.',
        'Postproduksjonskjeden omfatter videre fargekorrigering og gradering, effekter, lyd og ferdigstilling. Et bilde som ser kontinuerlig ut kan være resultat av mange separate prosesser, og analysen må skille opptaksmateriale, klippeversjon og godkjent master.'
      ], [['ftv-psf-10'], ['ftv-psf-11'], ['ftv-psf-12']], [
        'Dokumenter ingest, metadata og versjon før en klippesekvens sammenlignes.',
        'Mål rytme i varighet, rekkefølge, overgang og lyd – ikke bare i opplevd tempo.'
      ], [['ftv-psf-10'], ['ftv-psf-11', 'ftv-psf-12']]),
      section('ftv-psf-fordypning-2', 'Fra manus til kollektivt filmverk', [
        'Den norske filmskolens bachelor er organisert i manus, regi, produsent, foto, produksjonsdesign, klipp og lyd. Inndelingen viser at et verk skapes gjennom spesialiserte ansvar som møtes i samme produksjon, selv når enkelte personer kombinerer flere funksjoner.',
        'Produksjonsdesign omfatter utviklingen av filmens fysiske og visuelle verden gjennom blant annet scenografi og produksjonsplanlegging. På Filmparken kan sett bygges i verksteder og festes til studiegulv; det synlige rommet foran kameraet er dermed produsert arbeid, ikke bare en funnet bakgrunn.',
        'Manus og dramaturgi gir planlagte handlinger, scener og informasjonsforløp, men opptak og klipp kan flytte, korte ned eller omforme dem. En sammenligning må bruke daterte manusversjoner, opptaksplan og klippeversjon i stedet for å lese sluttfilmen tilbake som om alt stod ferdig i første utkast.'
      ], [['ftv-psf-13'], ['ftv-psf-14'], ['ftv-psf-15']], [
        'Kartlegg fagansvar og grensesnitt mellom rollene i stedet for å lete etter én opphavsperson.',
        'Sammenlign manusversjon, opptaksplan og ferdig sekvens som tre ulike dokumenter.'
      ], [['ftv-psf-13', 'ftv-psf-14'], ['ftv-psf-15']]),
      section('ftv-psf-fordypning-3', 'Produsenten kobler plan, penger og rettigheter', [
        'NFI gir tilskudd til utvikling, produksjon, lansering, distribusjon og formidling. En finansieringsanalyse må derfor plassere hvert beløp i riktig prosjektfase og skille offentlig tilskudd fra egenkapital, forhåndssalg, plattformavtale, samproduksjon og andre kilder.',
        'For spillefilm etter markedsvurdering krever NFI minst 80 prosent bekreftet finansiering før søknad. Kravet viser at ett tilskudd inngår i en sammensatt finansieringsplan; prosent, vilkår, tidspunkt og hva som regnes som bekreftet må dokumenteres.',
        'For dramaserie etter kunstnerisk vurdering kreves en forpliktende avtale med en visningsplattform om vesentlig finansiering. NFIs strategi beskriver samtidig tilskudd som en stabil og utløsende del av finansieringen som kan redusere risiko og utløse annen kapital.'
      ], [['ftv-psf-16'], ['ftv-psf-17'], ['ftv-psf-18']], [
        'Skill prosjektfase, finansieringskilde, vilkår og tidspunkt i budsjettanalysen.',
        'Bruk ikke budsjettstørrelse eller tilskudd som automatisk mål på kunstnerisk kvalitet.'
      ], [['ftv-psf-16', 'ftv-psf-17'], ['ftv-psf-18']])
    ],
    workedExamples: [
      { id: 'ftv-psf-eksempel-1', title: 'Studio A som produksjonskart', situation: 'En scene skal bygges og tas opp i Filmparkens største studio.', method: 'Tegn inn porter, gulv, lysheiser, basseng, sett, kamera, lyd, rømningsveier, strøm, garderober og materialflyt.', conclusion: 'Studioets kapasitet blir først meningsfull når den kobles til et konkret sett, team, tidsplan og risikovurdering.' },
      { id: 'ftv-psf-eksempel-2', title: 'Én scene gjennom tre versjoner', situation: 'Manus, råopptak og ferdig scene avviker fra hverandre.', method: 'Lag kolonner for replikk, handling, innstilling, varighet, lyd, rekkefølge og hva som mangler i hver versjon.', conclusion: 'Fortellingsstruktur er produsert gjennom flere ledd og kan ikke tilskrives manus eller klipp alene.' },
      { id: 'ftv-psf-eksempel-3', title: 'Finansieringsplanen', situation: 'Et prosjekt søker produksjonstilskudd med flere finansieringskilder.', method: 'Registrer beløp, prosent, bekreftelsesstatus, rettigheter, tilbakebetalingsvilkår, plattform og prosjektfase.', conclusion: 'Totalbudsjett, likviditet, rettighetseierskap og kunstnerisk verdi er forskjellige spørsmål.' }
    ],
    commonMisconceptions: [
      { claim: 'Et profesjonelt studio skaper automatisk profesjonelle bilder.', correction: 'Studioet gir kontroll og fasiliteter; resultatet avhenger av plan, fagarbeid, tid, samarbeid og etterarbeid.' },
      { claim: 'Det beste kameraet gir det beste filmfotografiet.', correction: 'Kameraets kapasitet må brukes gjennom optikk, lys, eksponering, utsnitt, bevegelse og samarbeid med resten av produksjonen.' },
      { claim: 'Regissøren lager filmen alene.', correction: 'Regi er ett ansvarsfelt i et kollektivt filmverk med produsent, manus, foto, design, lyd, klipp og mange flere fagfunksjoner.' },
      { claim: 'Klipping er bare å fjerne det som er for langt.', correction: 'Klipp velger og ordner bilde og lyd og skaper tid, rytme, rom, synsvinkel og informasjonsflyt.' },
      { claim: 'Et stort budsjett eller offentlig tilskudd dokumenterer høy kvalitet.', correction: 'Finansieringen dokumenterer ressurser, risiko og vilkår; kvalitet må undersøkes med egne estetiske og resepsjonsmessige metoder.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('ftv-psf-anvendelse-1', 'Filmparken samler produksjonsledd', [
        'Studioanlegget på Jar ble etablert i 1934, og staten har vært involvert i filmproduksjon og studiodrift der siden 1948. Dateringen gjør det mulig å følge skiftet fra institusjonell produksjonsbase til dagens Filmparken, som leier ut studioer og kontorbygg til ulike produsenter.',
        'Filmparken beskriver tre studioer, hvorav to er helt lydisolerte, sammen med verksteder, lager, oppholdsrom og store utearealer. Produksjonsanalyse følger derfor materialer og personer mellom forberedelse, bygging, opptak, lagring og etterarbeid i stedet for å begrense stedet til selve scenegulvet.',
        'Den europeiske filmarvmarkeringen knytter Jar-anlegget til produksjoner fra 1937 og framover. Historiske verk dokumenterer at stedet har vært brukt, men ikke at arbeidsmåte og teknologi var den samme; sammenlign alltid datert produksjonsdokumentasjon.'
      ], [['ftv-psf-19'], ['ftv-psf-20'], ['ftv-psf-21']], [
        'Skill anleggets lange historie fra den enkelte produksjonens korte arbeidsperiode.',
        'Følg rom, materialer, team og dokumenter gjennom hele produksjonsflyten.'
      ], [['ftv-psf-19', 'ftv-psf-21'], ['ftv-psf-20']]),
      section('ftv-psf-anvendelse-2', 'TV-huset koordinerer flere leveranser', [
        'NRKs allmennkringkasterregnskap for 2020 oppgir 192 produksjoner gjennom 42 produksjonsuker i Studio 19, med leveranser til TV, radio og strømming. Ett studio kan dermed inngå i flere mediearbeidsflyter, men hvert uttak må dokumenteres som egen produksjon og leveranse.',
        'NRKs designarkiv viser at Kvelden før kvelden flyttet til Studio 2 på Marienlyst i 2022 og fikk ny scenografi og oppdatert grafisk profil. TV-produksjonsanalyse kan koble studio, sett, kameradekning, lys, grafikk, avvikling og sendeflate uten å gjøre programmet til generell medieanalyse.',
        'Et TV-hus samordner studio og kontrollrom med redaksjonelle, tekniske og distribusjonsmessige beslutninger. Samme organisasjon betyr ikke at alle bilder produseres likt: direkteproduksjon, opptak, innslag og ferdigredigert program har forskjellige tids- og godkjenningsløp.'
      ], [['ftv-psf-22'], ['ftv-psf-23'], ['ftv-psf-24']], [
        'Registrer studio, kontrollrom, programtype, opptaksform og leveranse hver for seg.',
        'Hold konkret audiovisuell produksjon atskilt fra generell institusjons- og mediehistorie.'
      ], [['ftv-psf-22', 'ftv-psf-23'], ['ftv-psf-24']]),
      section('ftv-psf-anvendelse-3', 'Arbeidslivet må dokumenteres bak bildet', [
        'TV-underholdningsoverenskomsten 2025–2026 krever skriftlig arbeidsavtale og arbeidsinstruks, og at en produksjonsplan forelegges tillitsvalgte før produksjonen starter. Slike dokumenter synliggjør ansvar og planlagt arbeid som sluttfilmen ikke viser.',
        'Overenskomsten setter alminnelig arbeidstid til 7,5 timer i døgnet og 37,5 timer i uken innen sitt virkeområde, med særskilte regler for arbeidsplan, pauser og overtid. Avtalen gjelder ikke alle typer film og TV; arbeidslivsanalyse må først dokumentere hvilken avtale og lovregel som faktisk gjelder.',
        'Arbeidstilsynet krever at risikovurderingen tilpasses virksomhet, formål og konkrete farer. Norsk filmkommisjon beskriver samtidig produksjon som et nettverk av crew, studio, locations, postproduksjon, tillatelser og logistikk. Bygg en evidensmatrise som kobler rulletekst til kontrakt, call sheet, produksjonsplan, HMS-spor og intervju – også for arbeid som ikke ble kreditert.'
      ], [['ftv-psf-25'], ['ftv-psf-26'], ['ftv-psf-27']], [
        'Bruk gjeldende kontrakt, produksjonsplan og risikovurdering – ikke sluttfilmen – til å undersøke arbeidsvilkår.',
        'La manglende kreditering og motstridende arbeidslivskilder stå synlig som et funn.'
      ], [['ftv-psf-25', 'ftv-psf-26'], ['ftv-psf-27']])
    ],
    applicationTasks: [
      { id: 'ftv-psf-oppgave-1', title: 'Studiokartet', task: 'Lag et produksjonskart for én scene i Filmparken eller et annet dokumentert studio.', prompts: ['Hvilke rom, porter, strøm-, lys- og lydforhold brukes?', 'Hvor beveger dekor, kamera, skuespillere og stab seg?', 'Hvilke sikkerhets- og tidskritiske punkter finnes?'] },
      { id: 'ftv-psf-oppgave-2', title: 'Bilde og lyd i én scene', task: 'Analyser tre innstillinger og deres lydforløp.', prompts: ['Hvilke utsnitt, optikk-, lys- og kameravalg kan dokumenteres?', 'Hva er opptakslyd, og hva er etterarbeid?', 'Hvordan endres mening når bilde eller lyd begynner før klippet?'] },
      { id: 'ftv-psf-oppgave-3', title: 'Fra manus til klipp', task: 'Sammenlign en manusversjon, råopptak og ferdig sekvens.', prompts: ['Hva er flyttet, forkortet eller utelatt?', 'Hvordan endres rytme og informasjonsrekkefølge?', 'Hvilke fagfunksjoner kan spores i endringene?'] },
      { id: 'ftv-psf-oppgave-4', title: 'Produksjonsøkonomien', task: 'Les en offentlig tilskuddstildeling eller finansieringsplan.', prompts: ['Hvilken prosjektfase og kostnad gjelder beløpet?', 'Hva er bekreftet, betinget og gjenstående finansiering?', 'Hvilke rettigheter og leveranser er knyttet til kildene?'] },
      { id: 'ftv-psf-oppgave-5', title: 'Det usynlige teamet', task: 'Bygg en arbeidsmatrise for én produksjon.', prompts: ['Hvem står i rulletekst, call sheet, kontrakt og produksjonsplan?', 'Hvilke arbeidsoppgaver mangler kreditering eller dokumentasjon?', 'Hvordan ble arbeidstid, pauser og risiko planlagt?'] }
    ],
    selfCheck: [
      { question: 'Hva skiller et studio fra en produksjon?', answer: 'Studioet er et anlegg med rom og tjenester; produksjonen er et tidsavgrenset prosjekt med team, plan, finansiering, opptak og etterarbeid.' },
      { question: 'Hva kan dynamisk omfang dokumentere?', answer: 'Kameraets målte eksponeringsspillerom, ikke automatisk godt fotografi eller riktig eksponering i en bestemt scene.' },
      { question: 'Hva skiller opptakslyd fra sluttmiks?', answer: 'Opptakslyd registreres under opptak; sluttmiksen velger, bearbeider, kombinerer og leverer lyd til bestemte avspillingsformater.' },
      { question: 'Hvordan skaper klipp filmrytme?', answer: 'Gjennom valg, varighet, rekkefølge, overganger, bevegelse og forholdet mellom bilde og lyd.' },
      { question: 'Hvorfor er film et kollektivt verk?', answer: 'Flere spesialiserte fagfunksjoner produserer manus, plan, bilde, rom, lyd, opptak, klipp og leveranse i gjensidig avhengighet.' },
      { question: 'Hva viser en finansieringsplan?', answer: 'Kilder, beløp, prosent, status, vilkår, rettigheter og risiko – ikke i seg selv kunstnerisk kvalitet.' },
      { question: 'Hvordan undersøkes usynlig filmarbeid?', answer: 'Ved å sammenholde rulletekst med kontrakter, call sheets, produksjonsplaner, HMS-spor, fagforeningskilder og intervjuer.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({
  id, publisher, title, url, source_location, type, label: `${publisher} – ${title}`
});

const sources = [
  source('ftvps01-filmparken-studios', 'Filmparken', 'Våre studioer', 'https://www.filmparken.no/vare-studioer', 'Tre studioer, gulv, hjelperom, verksteder, løfteutstyr, parkering og leveranseadkomst', 'studio-facility-profile'),
  source('ftvps02-filmparken-a', 'Filmparken', 'Studio A', 'https://www.filmparken.no/studio-a', 'Areal, mål, lydisolasjon, lysheiser, basseng, gulv og industriporter', 'studio-technical-specification'),
  source('ftvps03-filmparken-about', 'Filmparken', 'Et unikt studiotilbud', 'https://www.filmparken.no/om-oss', 'Studioer, servicefunksjoner, verksteder, lager og utearealer', 'studio-owner-profile'),
  source('ftvps04-regjeringen-filmparken', 'Kultur- og likestillingsdepartementet', 'Filmparken AS', 'https://www.regjeringen.no/no/dep/kud/org/etater-og-virksomheter-under-kulturdepartementet/selskaper/filmparken-as/id2953200/', 'Statlig involvering siden 1948 og fasiliteter for filmopptak på Jar', 'government-company-profile'),
  source('ftvps05-efa-filmparken', 'European Film Academy', 'Filmparken (Jar, Norway)', 'https://www.europeanfilmacademy.org/activity/filmparken-jar-norway/', 'Etablering i 1934 og dokumenterte historiske produksjoner ved studioanlegget', 'film-heritage-record'),
  source('ftvps06-filmskolen-studies', 'Den norske filmskolen', 'Våre studier', 'https://www.inn.no/filmskolen/studier/', 'Utdanning i regi, manus, produsent, produksjonsdesign, filmfoto, klipp og lyd', 'national-film-school-profile'),
  source('ftvps07-filmskolen-photo', 'Den norske filmskolen', 'Filmfoto', 'https://www.inn.no/studier/vare-studier/bachelor-i-film-og-tv/foto/', 'Filmfotografens faglinje og ansvarsfelt', 'national-film-school-curriculum'),
  source('ftvps08-filmskolen-sound', 'Den norske filmskolen', 'Lyd', 'https://www.inn.no/studier/vare-studier/bachelor-i-film-og-tv/lyd/', 'Utdanning av lyddesigner og lydmester', 'national-film-school-curriculum'),
  source('ftvps09-filmskolen-design', 'Den norske filmskolen', 'Produksjonsdesign', 'https://www.inn.no/studier/vare-studier/bachelor-i-film-og-tv/produksjonsdesign/', 'Produksjonsdesign og scenografi som egen filmfaglig linje', 'national-film-school-curriculum'),
  source('ftvps10-nfi-grants', 'Norsk filminstitutt', 'Tilskuddsordninger', 'https://www.nfi.no/tilskudd', 'Tilskudd til utvikling, produksjon, lansering, distribusjon og formidling', 'film-funding-system'),
  source('ftvps11-nfi-market', 'Norsk filminstitutt', 'Produksjon av spillefilm etter markedsvurdering', 'https://www.nfi.no/tilskudd/produksjon/produksjon-av-spillefilm-etter-markedsvurdering', 'Krav om søknad før produksjon og minst 80 prosent bekreftet finansiering', 'film-funding-rule'),
  source('ftvps12-nfi-drama', 'Norsk filminstitutt', 'Produksjon av dramaserie etter kunstnerisk vurdering', 'https://www.nfi.no/tilskudd/produksjon/produksjon-av-dramaserie-etter-konsulentvurdering', 'Krav om forpliktende avtale med visningsplattform om vesentlig finansiering', 'series-funding-rule'),
  source('ftvps13-nfi-strategy', 'Norsk filminstitutt', 'Strategi 2026–2029', 'https://www.nfi.no/om-oss/hva-gjor-vi/strategi-2026-2029', 'Tilskudd som stabil og utløsende finansiering, risiko og annen kapital', 'film-policy-strategy'),
  source('ftvps14-nrk-2020', 'NRK', 'Allmennkringkasterregnskap 2020', 'https://info.nrk.no/wp-content/uploads/2021/07/NRKs-allmennkringkasterregnskap-2020_med-statistikk.pdf', 'Studio 19: produksjonsuker, produksjoner og leveranser til TV, radio og strømming', 'public-broadcaster-annual-report'),
  source('ftvps15-nrk-studio2', 'NRK', 'Designprosjekter', 'https://info.nrk.no/design/designprosjekter/', 'Kvelden før kvelden i Studio 2 på Marienlyst med ny scenografi og grafisk profil', 'public-broadcaster-production-record'),
  source('ftvps16-avid-post', 'Avid', 'Post-Production Video Editing', 'https://www.avid.com/resource-center/post-production-video-editing', 'Ingest, organisering, redigering, farge, effekter, lyd og ferdigstilling', 'vendor-workflow-documentation'),
  source('ftvps17-dolby-atmos', 'Dolby', 'Dolby Atmos for Content Creators', 'https://professional.dolby.com/content-creation/Dolby-Atmos-for-content-creators/', 'Objektlyd, metadata, renderer, overvåking og leveranseformater', 'vendor-audio-documentation'),
  source('ftvps18-arri-camera', 'ARRI', 'ARRI launches ALEXA 35', 'https://www.arri.com/en/company/press/press-releases-2022/arri-launches-new-alexa-35-camera', 'Oppgitt dynamisk omfang og tekniske bildeegenskaper', 'camera-manufacturer-specification'),
  source('ftvps19-arri-light', 'ARRI', 'Professional lighting equipment', 'https://www.arri.com/en/lighting', 'LED-, daylight- og tungstenlys, styring, rigg og tilbehør', 'lighting-manufacturer-profile'),
  source('ftvps20-virke-agreement', 'Virke og Norsk Filmforbund', 'TV-underholdningsoverenskomsten 2025–2026', 'https://filmforbundet.no/wp-content/uploads/2025/05/TV-underholdningsoverenskomsten-2025.pdf', 'Omfang, arbeidsavtale, arbeidsinstruks, produksjonsplan, arbeidstid, pauser og overtid', 'collective-agreement'),
  source('ftvps21-labour-risk', 'Arbeidstilsynet', 'Risikovurdering', 'https://www.arbeidstilsynet.no/hms/risikovurdering/', 'Tilpasning av risikovurdering til formål, virksomhet, detaljnivå og konkrete risikoforhold', 'work-safety-guidance'),
  source('ftvps22-film-commission', 'Norwegian Film Commission', 'Filming in Norway', 'https://www.norwegianfilm.com/filming-in-norway', 'Crew, studio, postproduksjon, tillatelser, logistikk og bærekraft i norsk produksjon', 'national-production-guide')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('ftv-psf-01', 'Filmparken tilbyr tre store studioer med produksjonskontorer, sminke-, garderobe-, oppholds-, rekvisitt- og kameralagringsrom.', ['ftvps01-filmparken-studios'], ['ftv-psf-grunnlag-1']),
  claim('ftv-psf-02', 'Studio A er et lydtett studio på 450 kvadratmeter med tregulv, industriporter, 23 lysheiser og basseng.', ['ftvps02-filmparken-a'], ['ftv-psf-grunnlag-1']),
  claim('ftv-psf-03', 'Filmparken har dekor-, metall- og malerverksted samt trucker, lift og stillaser som støtter produksjonslogistikken.', ['ftvps01-filmparken-studios', 'ftvps03-filmparken-about'], ['ftv-psf-grunnlag-1']),
  claim('ftv-psf-04', 'ARRI oppgir 17 trinn dynamisk omfang for ALEXA 35; målet beskriver kameraets eksponeringsspillerom, ikke et ferdig fotografisk resultat.', ['ftvps18-arri-camera'], ['ftv-psf-grunnlag-2']),
  claim('ftv-psf-05', 'Profesjonell filmlyssetting kan kombinere LED-, daylight- og tungstenarmaturer med styring, rigg og tilbehør.', ['ftvps19-arri-light'], ['ftv-psf-grunnlag-2']),
  claim('ftv-psf-06', 'Den norske filmskolen utdanner filmfotografer som en egen fagfunksjon i kollektiv filmproduksjon.', ['ftvps06-filmskolen-studies', 'ftvps07-filmskolen-photo'], ['ftv-psf-grunnlag-2']),
  claim('ftv-psf-07', 'Filmskolens lydlinje utdanner lyddesignere og lydmestere og synliggjør lyd som eget ansvarsfelt.', ['ftvps08-filmskolen-sound'], ['ftv-psf-grunnlag-3']),
  claim('ftv-psf-08', 'Dolby Atmos bruker kanaler, lydobjekter og metadata som renderes til ulike avspillingsmiljøer og leveranseformater.', ['ftvps17-dolby-atmos'], ['ftv-psf-grunnlag-3']),
  claim('ftv-psf-09', 'Audiovisuell produksjonsanalyse må undersøke den tidslige relasjonen mellom bilde og lyd, ikke behandle dem som uavhengige sluttprodukter.', ['ftvps08-filmskolen-sound', 'ftvps16-avid-post', 'ftvps17-dolby-atmos'], ['ftv-psf-grunnlag-3']),
  claim('ftv-psf-10', 'Avid beskriver ingest og organisering av råmateriale som første ledd før selve redigeringen.', ['ftvps16-avid-post'], ['ftv-psf-fordypning-1']),
  claim('ftv-psf-11', 'Redigering består av å velge, trimme og arrangere klipp og skaper dermed dokumenterbar rekkefølge og varighet.', ['ftvps16-avid-post'], ['ftv-psf-fordypning-1']),
  claim('ftv-psf-12', 'Postproduksjon omfatter blant annet redigering, fargekorrigering og gradering, effekter, lyd og ferdigstilling.', ['ftvps16-avid-post'], ['ftv-psf-fordypning-1']),
  claim('ftv-psf-13', 'Den norske filmskolen organiserer bachelorutdanningen i manus, regi, produsent, foto, produksjonsdesign, klipp og lyd.', ['ftvps06-filmskolen-studies'], ['ftv-psf-fordypning-2']),
  claim('ftv-psf-14', 'Produksjonsdesign og scenografi er egne filmfaglige ansvar, og Filmparken tilbyr verksteder og studiegulv for bygging og montering av dekor.', ['ftvps09-filmskolen-design', 'ftvps01-filmparken-studios'], ['ftv-psf-fordypning-2']),
  claim('ftv-psf-15', 'Manus, opptaksplan, råmateriale og klippeversjon er forskjellige produksjonsdokumenter og må sammenlignes som daterte stadier.', ['ftvps06-filmskolen-studies', 'ftvps16-avid-post'], ['ftv-psf-fordypning-2']),
  claim('ftv-psf-16', 'NFI gir tilskudd til utvikling, produksjon, lansering, distribusjon og formidling av audiovisuelle prosjekter.', ['ftvps10-nfi-grants'], ['ftv-psf-fordypning-3']),
  claim('ftv-psf-17', 'Produksjon av spillefilm etter markedsvurdering krever minst 80 prosent bekreftet finansiering før NFI-søknaden.', ['ftvps11-nfi-market'], ['ftv-psf-fordypning-3']),
  claim('ftv-psf-18', 'Dramaserietilskudd krever vesentlig plattformfinansiering, mens NFI beskriver egne tilskudd som en stabil og utløsende del av en større finansiering.', ['ftvps12-nfi-drama', 'ftvps13-nfi-strategy'], ['ftv-psf-fordypning-3']),
  claim('ftv-psf-19', 'Studioanlegget på Jar ble etablert i 1934, og staten har vært involvert i filmproduksjon og studiodrift der siden 1948.', ['ftvps04-regjeringen-filmparken', 'ftvps05-efa-filmparken'], ['ftv-psf-anvendelse-1']),
  claim('ftv-psf-20', 'Filmparken samler studioer, lydisolerte rom, verksteder, lager, servicefunksjoner og utearealer i samme produksjonsmiljø.', ['ftvps01-filmparken-studios', 'ftvps03-filmparken-about'], ['ftv-psf-anvendelse-1']),
  claim('ftv-psf-21', 'Filmparkens produksjonshistorie omfatter dokumenterte verk fra 1937 og framover, men historisk bruk dokumenterer ikke identisk teknologi eller arbeidsmåte.', ['ftvps05-efa-filmparken'], ['ftv-psf-anvendelse-1']),
  claim('ftv-psf-22', 'NRK oppga 192 produksjoner gjennom 42 produksjonsuker i Studio 19 i 2020, med leveranser til TV, radio og strømming.', ['ftvps14-nrk-2020'], ['ftv-psf-anvendelse-2']),
  claim('ftv-psf-23', 'Kvelden før kvelden flyttet til Studio 2 på Marienlyst i 2022 og fikk ny scenografi og oppdatert grafisk profil.', ['ftvps15-nrk-studio2'], ['ftv-psf-anvendelse-2']),
  claim('ftv-psf-24', 'Kringkastingsproduksjon kan samordne studio, scenografi, kamera, lyd, grafikk, kontrollrom og flere leveranser uten at alle programtyper følger samme flyt.', ['ftvps14-nrk-2020', 'ftvps15-nrk-studio2'], ['ftv-psf-anvendelse-2']),
  claim('ftv-psf-25', 'TV-underholdningsoverenskomsten 2025–2026 krever skriftlig arbeidsavtale og arbeidsinstruks og at produksjonsplan forelegges tillitsvalgte før oppstart.', ['ftvps20-virke-agreement'], ['ftv-psf-anvendelse-3']),
  claim('ftv-psf-26', 'Overenskomsten setter 7,5 timers alminnelig arbeidstid per døgn og 37,5 timer per uke innen sitt avgrensede virkeområde og regulerer arbeidsplan, pauser og overtid.', ['ftvps20-virke-agreement'], ['ftv-psf-anvendelse-3']),
  claim('ftv-psf-27', 'Produksjons-HMS må bygge på tilpasset risikovurdering, mens arbeidsmatrisen bør følge crew, studio, location, postproduksjon, tillatelser og logistikk utover rulleteksten.', ['ftvps21-labour-risk', 'ftvps22-film-commission'], ['ftv-psf-anvendelse-3'])
];

const claimsDoc = {
  schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'film_tv',
  chapter_id: CHAPTER_ID, sources, claims
};

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.film_tv;
  assert(subject && Array.isArray(subject.chapters), 'Film & TV mangler kapittelliste i fagverkregisteret');
  const registryChapter = {
    id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: CHAPTER_FILE,
    primary_domain_id: 'produksjon_studio_arbeid', emne_ids: emneIds,
    claimsFile: `${CHAPTER_DIR}/claims.json`, briefFile: `${CHAPTER_DIR}/brief.json`
  };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) {
    assert(subject.chapters.length === 1 && subject.chapters[0].id === 'kinoer-visningssteder-og-publikum', 'Film & TV kapittel 2 krever bare det mergede kapittel 1');
    subject.chapters.push(registryChapter);
  } else {
    subject.chapters[existingIndex] = registryChapter;
  }
  const refactorActive = ['curriculum_completeness_refactor', 'canonical_inventory_migration'].includes(readJson(STATUS_FILE).subjects.find((row) => row.id === 'film_tv')?.nextGate);
  if (!refactorActive) subject.canonicalModel.note = 'Film & TVs seks pensum-eide områder styrer rendererstrukturen. Kinoer, visningssteder og publikum samt Produksjon, studio og filmarbeid er materialisert som fulltekst- og claimsporede kapitler med 20/20 emner hver; fire områder står igjen. Source-first, ekstern claim-basis og konkrete verk-, visnings-, produksjons-, kringkastings- og arkivankere er bindende.';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'film_tv');
  assert(subject?.editorialStatus === 'chapters_in_progress', 'Film & TV kapittel 2 krever dokumentert kapittelproduksjon');
  const refactorGate = ['curriculum_completeness_refactor', 'canonical_inventory_migration'].includes(subject.nextGate);
  if (!refactorGate) {
    subject.nextGate = 'remaining_domain_chapter_production';
    subject.note = 'Film & TV har seks canonicale fagområder og 120 emner. Kinoer, visningssteder og publikum samt Produksjon, studio og filmarbeid dekker nå 40 emner gjennom 6 moduler, 18 seksjoner, 54 claimsporede fagavsnitt, 54 verifiserte claims, 44 inspiserbare kilderegistreringer, 8 stedscase og 40 canonicale metoder. To av seks kapitler er materialisert; fire gjenstår.';
  }
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister');
  assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  writeJson(CHAPTER_FILE, chapter);
  writeJson(`${CHAPTER_DIR}/brief.json`, brief);
  for (const [file, value] of Object.entries(modules)) writeJson(`${CHAPTER_DIR}/${file}`, value);
  writeJson(`${CHAPTER_DIR}/claims.json`, claimsDoc);
  updateRegistry();
  updateStatus();
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: ${emneIds.length} emner, 3 moduler, ${claims.length} claims og ${sources.length} kilder.`);
}

main();
