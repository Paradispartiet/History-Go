#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'kinoer-visningssteder-og-publikum';
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
  'em_film_tv_besokstall',
  'em_film_tv_cinematek_filmarv',
  'em_film_tv_distribusjon_tilgang',
  'em_film_tv_filmfestival_premiere',
  'em_film_tv_filmhistorisk_formidling',
  'em_film_tv_filmklubb_nisje',
  'em_film_tv_kino_fellesrom',
  'em_film_tv_kinoarkitektur',
  'em_film_tv_kollektiv_filmhukommelse',
  'em_film_tv_kuratering_publikum',
  'em_film_tv_offentlig_filmbegivenhet',
  'em_film_tv_plattformpublikum',
  'em_film_tv_publikumsdata',
  'em_film_tv_publikumsminne',
  'em_film_tv_publikumsopplevelse',
  'em_film_tv_seervaner',
  'em_film_tv_stromming_fragmentering',
  'em_film_tv_tv_ritualer',
  'em_film_tv_visningspolitikk',
  'em_film_tv_visningsrom_estetikk'
];

const methodIds = [
  'met_film_tv_publikumsdataanalyse',
  'met_film_tv_statistikkanalyse',
  'met_film_tv_cinematekanalyse',
  'met_film_tv_filmarvsanalyse',
  'met_film_tv_distribusjonsanalyse',
  'met_film_tv_tilgangsanalyse',
  'met_film_tv_festivalanalyse',
  'met_film_tv_premiereanalyse',
  'met_film_tv_filmklubbanalyse',
  'met_film_tv_kurateringsanalyse',
  'met_film_tv_kinoanalyse',
  'met_film_tv_publikumsanalyse',
  'met_film_tv_arkitekturanalyse',
  'met_film_tv_visningsromanalyse',
  'met_film_tv_minneanalyse',
  'met_film_tv_kollektiv_hukommelsesanalyse',
  'met_film_tv_strommeanalyse',
  'met_film_tv_plattformanalyse',
  'met_film_tv_tv_resepsjonsanalyse',
  'met_film_tv_seervaneanalyse'
];

const relatedPlaces = [
  { id: 'colosseum_kino', name: 'Colosseum kino', role: 'Undersøk kuppelsal, ombygginger, visningsteknologi, premierefunksjon og hvordan et stort publikum organiseres i samme rom.' },
  { id: 'cinemateket_oslo', name: 'Cinemateket i Oslo', role: 'Følg kuratering, originalformater, filmhistorisk formidling, arkivsamarbeid og publikums møte med verk utenfor ordinær premiereflyt.' },
  { id: 'vega_scene', name: 'Vega Scene', role: 'Analyser et flerbruks visningssted der festivalprogram, samtaler og kinovisning knytter film til en offentlig kulturarena.' },
  { id: 'gimle_kino', name: 'Gimle kino', role: 'Sammenlign en mindre kino og dens programprofil med monumentalkino, cinematek og festivalarena uten å gjøre størrelse til kvalitetsmål.' }
];

const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({
  id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds
});

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'film_tv', subject_id: 'film_tv',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'kinoer_visningssteder_publikum',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Kinoer, visningssteder og publikum: hvordan skjermopplevelsen blir sosial',
  subtitle: 'Fra Colosseums kuppelsal og Cinematekets filmarv til festivalprogram, TV-ritualer, strømmeplattformer og publikumsdata',
  lead: 'En film eller TV-sending møter aldri publikum som et løsrevet innhold. Lerret, lyd, sal, tidspunkt, program, distribusjon, tilgang og arkiv bestemmer hva som faktisk kan sees, hvor og sammen med hvem. Kapittelet lærer brukeren å undersøke visningshendelsen uten å forveksle verk med rom, besøkstall med opplevelse eller personlig minne med dokumentert publikums- og arkivhistorie.',
  learningObjectives: [
    'skille filmverket, kopien eller strømmen, visningsrommet og den konkrete visningshendelsen',
    'analysere kinorommets arkitektur, teknikk og publikumsorganisering uten å anta identisk opplevelse',
    'lese besøkstall, markedsdata og spørreundersøkelser med tydelig enhet, tidsrom og metode',
    'forklare hvordan cinematek og filmklubber kuraterer tilgang til filmarv og nisjefilm',
    'undersøke festival, premiere og introduksjon som offentlig filmbegivenhet',
    'skille tilgang til en strømmetjeneste fra faktisk bruk og fra verkets tilgjengelighet',
    'analysere lineær TV, direktesending og strømming som forskjellige seersituasjoner',
    'sammenholde publikumsminne med program, billettall, anmeldelser og audiovisuelle arkivspor'
  ],
  diagnosticQuestions: [
    { question: 'Er filmen den samme som visningen?', answer: 'Nei. Verket kan være det samme, mens kopi, format, lerret, lyd, sal, tidspunkt, introduksjon og publikum gjør visningshendelsen forskjellig.' },
    { question: 'Viser høye besøkstall at publikum likte filmen?', answer: 'Nei. Besøkstall måler registrerte besøk i et definert tidsrom; opplevelse og vurdering krever andre data.' },
    { question: 'Er et cinematekprogram en nøytral liste over filmhistoriens beste verk?', answer: 'Nei. Programmet er en dokumenterbar kuratering formet av mandat, kopitilgang, rettigheter, formater og redaksjonelle valg.' },
    { question: 'Betyr tilgang til en strømmetjeneste at den brukes daglig?', answer: 'Nei. Abonnementstilgang, faktisk bruk, tidsbruk og tilgjengelig katalog er forskjellige mål.' }
  ],
  relatedPlaces,
  moduleFiles: [`${CHAPTER_DIR}/01-grunnlag.json`, `${CHAPTER_DIR}/02-fordypning.json`, `${CHAPTER_DIR}/03-anvendelse.json`],
  briefFile: `${CHAPTER_DIR}/brief.json`, claimsFile: `${CHAPTER_DIR}/claims.json`
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'film_tv',
  chapter_id: CHAPTER_ID, primary_domain_id: 'kinoer_visningssteder_publikum',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Film & TVs første canonicale domene med kildebasert undervisning i kinorom, visningshendelse, publikumsdata, filmarv, kuratering, festival, distribusjon, TV-ritualer, strømming og audiovisuelt minne.',
  audience: 'Brukere som skal kunne undersøke hvordan film og TV blir vist, distribuert, erfart, telt og husket uten å bruke smak, popularitet eller canonicalfiler som faktakilde.',
  learningArc: [
    'starte i den konkrete visningshendelsen og skille verk, kopi, rom og publikum',
    'lese kinoarkitektur og visningsteknikk som betingelser, ikke som automatisk kvalitet',
    'kontrollere hva besøkstall og publikumsundersøkelser faktisk måler',
    'undersøke Cinemateket som filmarv-, format- og formidlingsinstitusjon',
    'sammenligne filmklubbens og festivalens kuraterte offentligheter',
    'skille lineær TV, direktesending, opptak og bestillingsstrømming',
    'analysere plattformtilgang og fragmentering uten å anta faktisk bruk',
    'avslutte med en evidensmatrise for visningsrom, publikum og minne'
  ],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'verk vs konkret visningshendelse', 'visningsformat vs innhold',
    'felles rom vs identisk publikumsopplevelse', 'besøkstall vs tilfredshet',
    'abonnementstilgang vs faktisk bruk', 'programutvalg vs nøytral filmkanon',
    'filmarv vs alt historisk filmstoff', 'festivalstatus vs dokumentert varig betydning',
    'premiereoppmerksomhet vs resepsjon over tid', 'lineær sendeflate vs bestillingsstrømming',
    'personlig publikumsminne vs arkivert programspor', 'popularitet vs tilgang og distribusjon'
  ],
  sourceStrategy: {
    priority: [
      'konkrete kino-, cinematek-, festival-, filmklubb-, kringkastings- og arkivkilder',
      'NFI, Nasjonalbiblioteket, SSB, Film & Kino og andre ansvarlige institusjonskilder',
      'dokumenterte program, visningsformater, besøksserier, surveybeskrivelser og avleveringsregler',
      'film- og publikumsbegreper først etter at verk, rom, visning eller kringkastingsspor er etablert'
    ],
    minimumExternalSources: 18, claimLevelTrace: true, sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: [
      'kino, cinematek, filmklubb, festival, premiere og andre dokumenterte visningsrom',
      'visningsformat, arkitektur, kuratering, distribusjon og tilgjengelighet',
      'besøkstall, publikumsdata, seervaner, TV-ritualer og plattformpublikum',
      'publikumsminne, kringkastingsarkiv og filmhistorisk formidling',
      'Colosseum, Cinemateket, Vega Scene og Gimle kino som canonicale stedscase'
    ],
    excluded: [
      'personlig smak brukt som bevis på kvalitet eller betydning',
      'besøkstall brukt som direkte mål på opplevelse, forståelse eller tilfredshet',
      'strømmetilgang brukt som bevis på daglig bruk eller komplett katalogtilgang',
      'cinematek- eller festivalprogram brukt som nøytral og uttømmende filmkanon',
      'personlig minne brukt alene som dokumentasjon av program, dato eller kollektiv reaksjon',
      'teori eller canonicale emnenavn brukt uten konkret audiovisuelt eller stedlig kildeanker'
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
      section('ftv-kvp-grunnlag-1', 'Filmen er ikke det samme som visningen', [
        'Start med fire separate objekter: verket, visningskopien eller strømmen, rommet og hendelsen. En 35mm-kopi i en kuratert serie, en digital kinofil i ordinær distribusjon og samme tittel på en hjemmestream kan dele fortelling, men ikke format, tilgang, lydmiljø, introduksjon eller seersituasjon.',
        'Cinemateket oppgir at det viser både klassikere, mindre kjente filmhistoriske verk og nyere filmer av særskilt interesse. Programopplysningene og de konkrete formatangivelsene gjør det mulig å dokumentere hvilken versjon og presentasjonsform publikum faktisk møtte.',
        'En visningsromanalyser registrerer lerret, bildeformat, projeksjon, lyd, lys, siktlinjer, sitteorden, inngang, starttid og eventuelle introduksjoner før opplevelsen tolkes. Rommet skaper betingelser for møtet, men beviser ikke at alle så, hørte eller forstod det samme.'
      ], [['ftv-kvp-01'], ['ftv-kvp-02'], ['ftv-kvp-03']], [
        'Identifiser verk, kopi eller strøm, rom og hendelse hver for seg.',
        'Beskriv visningsbetingelsene før du generaliserer om publikumsopplevelsen.'
      ], [['ftv-kvp-01', 'ftv-kvp-02'], ['ftv-kvp-03']]),
      section('ftv-kvp-grunnlag-2', 'Kinorommet organiserer et publikum', [
        'Colosseum kino åpnet i 1928 som en stor kuppelkino på Majorstuen. Den monumentale formen, ett stort lerret og en felles starttid organiserte mange tilskuere rundt samme projeksjon og gjorde kinobesøket til en synlig offentlig begivenhet.',
        'Etter brannen i 1963 ble Colosseum gjenreist med ny kuppel og omarbeidet sal, og senere utviklet til et kinosenter med flere saler. Før-og-etter-analysen viser at et kjent kinonavn kan romme flere arkitektoniske, tekniske og publikumsmessige systemer over tid.',
        'Kinoanalyse skiller derfor bygning, sal, program, forestilling og publikum. En full sal dokumenterer samlokalisering og solgte eller registrerte plasser, men latter, stillhet, uro, oppmerksomhet og etterfølgende vurdering må undersøkes gjennom egne observasjoner og resepsjonsspor.'
      ], [['ftv-kvp-04'], ['ftv-kvp-05'], ['ftv-kvp-06']], [
        'Les kinoen som en skiftende kombinasjon av bygg, sal, teknikk og program.',
        'Felles visning er ikke bevis på identisk reaksjon.'
      ], [['ftv-kvp-04', 'ftv-kvp-05'], ['ftv-kvp-06']]),
      section('ftv-kvp-grunnlag-3', 'Publikumsdata må ha enhet og metode', [
        'SSB oppgir 8 366 031 kinobesøk i Norge i 2025. Tallet gjelder besøk, ikke unike personer: samme tilskuer kan telle flere ganger, og tallet sier ikke alene hvilke motiv, opplevelser eller vurderinger som lå bak hvert besøk.',
        'Film & Kinos årbok oppgir om lag 8,38 millioner besøk i 2025, 2,5 prosent flere enn året før, og 2,62 millioner besøk på norske filmer. Serien kan brukes til utvikling og markedsandel når definisjon, periode og datakilde holdes fast.',
        'Film & Kinos månedsstatistikk opplyser at rapportene dekker rundt 95 prosent av kinobesøket. En statistikkvurdering må derfor registrere dekningsgrad, rapporterende kinoer, tidsrom og eventuelle revisjoner før lokale eller nasjonale tall sammenlignes.'
      ], [['ftv-kvp-07'], ['ftv-kvp-08'], ['ftv-kvp-09']], [
        'Oppgi om enheten er besøk, personer, billetter, andel eller tidsbruk.',
        'Bruk ikke besøksvolum som direkte mål på tilfredshet eller betydning.'
      ], [['ftv-kvp-07', 'ftv-kvp-08'], ['ftv-kvp-09']])
    ],
    concepts: [
      { id: 'visningshendelse', term: 'Visningshendelse', definition: 'Et bestemt møte mellom et audiovisuelt verk, en kopi eller strøm, et rom eller en skjerm, et tidspunkt og et publikum.' },
      { id: 'visningsformat', term: 'Visningsformat', definition: 'Den tekniske og materielle formen bildet og lyden presenteres i, for eksempel 35mm, 70mm eller digital kinovisning.' },
      { id: 'kinorom', term: 'Kinorom', definition: 'Den arkitektoniske, tekniske og sosiale organiseringen av inngang, sal, lerret, lyd, lys og sitteplasser.' },
      { id: 'kuratering', term: 'Kuratering', definition: 'Dokumenterte valg om hvilke verk som vises, i hvilken sammenheng, rekkefølge, versjon og presentasjonsform.' },
      { id: 'publikumsdata', term: 'Publikumsdata', definition: 'Målte eller registrerte opplysninger om besøk, personer, bruk, tidsbruk, tilgang eller respons, med definert metode og periode.' },
      { id: 'resepsjonsspor', term: 'Resepsjonsspor', definition: 'Kilder som dokumenterer hvordan en visning ble møtt, for eksempel omtaler, brev, intervjuer, observasjoner, salgstall eller arkivert publikumsrespons.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('ftv-kvp-fordypning-1', 'Cinemateket gjør filmarv til en ny hendelse', [
        'Cinemateket i Oslo startet visninger i juni 1984, fikk offisiell åpning samme høst og flyttet inn i Filmens hus i 1996. Historien viser at filmarv ikke bare lagres: den må få en visningsinstitusjon, sal, program og publikum for å bli en ny offentlig hendelse.',
        'Cinematekets nasjonale ansvar omfatter filmhistorisk bredde og presentasjon av verk i egnede formater og sammenhenger. Kurateringen kan synliggjøre restaurerte, sjeldne eller lite distribuerte filmer, men hvert program er fortsatt et utvalg – ikke hele filmhistorien.',
        'Norsk filminstitutts filmarkiv ble overført til Nasjonalbiblioteket i 2008. Bevaring, katalogisering og visning er dermed institusjonelt adskilte, men avhengige ledd: arkivet sikrer materiale, mens cinematek og andre formidlere skaper situasjoner der det kan møtes.'
      ], [['ftv-kvp-10'], ['ftv-kvp-11'], ['ftv-kvp-12']], [
        'Skill bevaring, katalogisering, restaurering, rettighetsklarering og offentlig visning.',
        'Et cinematekprogram dokumenterer kuratering, ikke en nøytral totalfilmhistorie.'
      ], [['ftv-kvp-10', 'ftv-kvp-12'], ['ftv-kvp-11']]),
      section('ftv-kvp-fordypning-2', 'Filmklubben bygger et valgt publikum', [
        'Norsk Filmklubbforbund beskriver seg som en sammenslutning av norske filmklubber som importerer og distribuerer film, organiserer seminarer og formidler kunnskap. Filmklubben er derfor både publikumsfellesskap og et praktisk distribusjonsledd for verk utenfor ordinært kinoprogram.',
        'Et registrert medlemskap gir adgang til medlemspris i andre klubber i forbundets nettverk. Medlemsmodellen avgrenser et publikum organisatorisk og gjør det mulig å undersøke klubb, program, rettigheter og visningspraksis som noe annet enn en åpen kommersiell forestilling.',
        'Filmklubbanalyse sammenligner programvalg, land, perioder, sjangre, formater, introduksjoner og gjester over tid. Et nisjeprogram kan utvide tilgangen til oversette verk, men kan også gjenta bestemte kanoner; fravær og gjentakelser må derfor registreres sammen med de valgte titlene.'
      ], [['ftv-kvp-13'], ['ftv-kvp-14'], ['ftv-kvp-15']], [
        'Undersøk filmklubben som både fellesskap, kurator og distribusjonsledd.',
        'Analyser også hvilke verk, grupper og filmhistorier programmet ikke gjør synlige.'
      ], [['ftv-kvp-13', 'ftv-kvp-14'], ['ftv-kvp-15']]),
      section('ftv-kvp-fordypning-3', 'Festivalen komprimerer filmoffentligheten', [
        'Oslo Pix Filmfestival 2026 er lagt til 24.–30. august og bruker Vega, Klingenberg, Cinemateket og andre steder i byen. Festivalen skaper en tidsavgrenset geografi der program, bransje, gjester og publikum beveger seg mellom flere visningsrom.',
        'Festivalens praktiske informasjon oppgir at mange visninger introduseres og starter uten ordinær kinoreklame. Introduksjon, samtale, gjest og premieregrad er dermed deler av den dokumenterbare hendelsen, men de må skilles fra selve verkets form og fra senere resepsjon.',
        'I 2020 organiserte Oslo Pix en hybridutgave med et digitalt program og kinovisninger som supplement. Sammenligningen viser at samme festivalnavn kan betegne ulike tilgangs-, tids- og fellesskapsformer; publikumsrekkevidde og fysisk samvær må måles separat.'
      ], [['ftv-kvp-16'], ['ftv-kvp-17'], ['ftv-kvp-18']], [
        'Kartlegg festivalens tider, steder, programledd og adgangsformer.',
        'Premiere og festivalstatus dokumenterer lanseringskontekst, ikke varig verdi.'
      ], [['ftv-kvp-16', 'ftv-kvp-17'], ['ftv-kvp-18']])
    ],
    workedExamples: [
      { id: 'ftv-kvp-eksempel-1', title: 'Colosseum før og etter 1963', situation: 'Samme kinonavn brukes om ulike fysiske og tekniske faser.', method: 'Sammenlign tegning, salstørrelse, brannspor, gjenreisning, lerret, lyd og program i daterte kilder.', conclusion: 'Kontinuitet i navn er ikke identitet i visningsrom eller publikumsbetingelser.' },
      { id: 'ftv-kvp-eksempel-2', title: 'Cinematekprogrammet som utvalg', situation: 'En historisk serie presenteres som filmarv.', method: 'Registrer titler, land, år, format, kopikilde, introduksjon og hvilke alternative verk som kunne representert samme tema.', conclusion: 'Programmet kan analyseres som begrunnet kuratering uten å avvises eller gjøres til hele kanonen.' },
      { id: 'ftv-kvp-eksempel-3', title: 'Oslo Pix som festivalgeografi', situation: 'Én festival bruker flere kinoer og arrangementstyper.', method: 'Lag tids- og stedskart over visning, introduksjon, gjest, samtale, billettype og eventuell digital tilgang.', conclusion: 'Festivalpublikummet er satt sammen av flere deloffentligheter, ikke én homogen gruppe.' }
    ],
    commonMisconceptions: [
      { claim: 'Samme film gir samme opplevelse uansett visning.', correction: 'Kopi, format, skjerm, lyd, rom, tidspunkt, introduksjon og publikum endrer hendelsen uten nødvendigvis å endre verkets identitet.' },
      { claim: 'Høye besøkstall viser at publikum likte filmen.', correction: 'Besøkstall registrerer volum; motiv, opplevelse og vurdering krever andre data.' },
      { claim: 'Cinemateket viser objektivt de viktigste filmene.', correction: 'Cinemateket kuraterer innen mandat, kopitilgang, rettigheter, format og redaksjonelle prioriteringer.' },
      { claim: 'En festivalpremiere beviser at filmen blir historisk viktig.', correction: 'Premieren dokumenterer lanserings- og oppmerksomhetskontekst; betydning og resepsjon må følges over tid.' },
      { claim: 'Filmklubber er bare mindre kommersielle kinoer.', correction: 'Medlemskap, programvalg, rettighetsarbeid, frivillighet og distribusjonsnettverk gir en annen institusjonell form.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('ftv-kvp-anvendelse-1', 'TV-ritualet må dateres og måles', [
        'NRKs allmennkringkasterregnskap for 2009 oppgir at over to millioner fulgte Alexander Rybaks Eurovision-seier direkte på NRK1. Tallet dokumenterer en stor samtidig seersituasjon, men ikke at alle så hele sendingen, reagerte likt eller husker øyeblikket på samme måte.',
        'SSBs mediebarometer bygger på en årlig, landsrepresentativ utvalgsundersøkelse; fra 2022 ble utvalget utvidet til 6000 personer fra ni år og uten øvre aldersgrense. Seervaner er dermed estimerte befolkningsmønstre med utvalg, svarprosent, spørsmålsordlyd og måleperiode – ikke en logg over alle skjermer.',
        'NFI viste i et høringssvar fra 2026 til at daglig lineær-TV-bruk falt fra om lag 84 prosent rundt 2000 til 46 prosent i 2024, mens daglig bruk av videomedier økte fra 10 til 50 prosent. Endringen må leses som forskyvning mellom definerte medieformer, ikke som at felles TV-hendelser eller kino automatisk er borte.'
      ], [['ftv-kvp-19'], ['ftv-kvp-20'], ['ftv-kvp-21']], [
        'Dater TV-ritualet og oppgi kanal, sending, samtidighet og målemetode.',
        'Trendbrudd kan skyldes både endret atferd og endrede mediekategorier.'
      ], [['ftv-kvp-19', 'ftv-kvp-20'], ['ftv-kvp-21']]),
      section('ftv-kvp-anvendelse-2', 'Tilgang, bruk og katalog er tre forskjellige spørsmål', [
        'SSB oppgir at 90 prosent av befolkningen hadde tilgang til minst én betalt strømmetjeneste i 2025. Tilgang gjelder husholdningens abonnement og kan ikke alene fortelle hvem som brukte tjenesten, hvor ofte den ble brukt eller hvilke verk som var tilgjengelige på måledagen.',
        'Nær halvparten så strømmet innhold en gjennomsnittsdag i 2025, mens konkrete tjenester hadde ulike daglige brukerandeler. Plattformpublikumsanalyse må derfor holde abonnement, daglig rekkevidde, tidsbruk, aldersfordeling og enkeltverksvisning i separate kolonner.',
        'Når verk fordeles mellom kino, lineær kanal, åpne strømmetjenester, abonnementstjenester, leie og arkivtilgang, blir publikum fragmentert av vinduer, pris, geografi, rettigheter og grensesnitt. Fragmentering betyr ikke at fellesskap forsvinner, men at samtidighet og adgang må dokumenteres per distribusjonsform.'
      ], [['ftv-kvp-22'], ['ftv-kvp-23'], ['ftv-kvp-24']], [
        'Skill alltid abonnementstilgang, faktisk bruk, tidsbruk og verkstilgang.',
        'Kartlegg distribusjonsvinduer og adgangsvilkår før publikum sammenlignes.'
      ], [['ftv-kvp-22', 'ftv-kvp-23'], ['ftv-kvp-24']]),
      section('ftv-kvp-anvendelse-3', 'Publikumsminne må prøves mot spor', [
        'Nasjonalbibliotekets kringkastingsarkiv inneholder en komplett samling av NRKs sendinger etter 1990 og løpende samlinger fra blant annet TV 2 og TVNorge fra 1992. Arkivet kan dokumentere program, sekvens og audiovisuelt innhold, men ikke alene hva den enkelte faktisk så eller husker.',
        'Pliktavleveringen omfatter kringkastede lyd- og bildeprogram og audiovisuelle bestillingstjenester, med digital avlevering senest sju virkedager etter første publiseringsdag. Arkivsporet gjør senere kontroll mulig, samtidig som tilgang til materialet fortsatt kan være begrenset av rettigheter og bruksvilkår.',
        'Bygg til slutt en evidensmatrise for Colosseum, Cinemateket, Vega Scene og Gimle: verk eller program, dato, kopi eller strøm, sal eller skjerm, introduksjon, adgang, besøkstall, observasjon, omtale, personlig minne og arkivspor. Skill hva hendelsen dokumenterer, hva dataene måler, og hva publikum i ettertid forteller.'
      ], [['ftv-kvp-25'], ['ftv-kvp-26'], ['ftv-kvp-27']], [
        'Bruk arkivet til program og innhold; bruk resepsjonskilder til opplevelse og minne.',
        'La uenighet mellom statistikk, arkiv og erindring stå synlig i stedet for å slå kildene sammen.'
      ], [['ftv-kvp-25', 'ftv-kvp-26'], ['ftv-kvp-27']])
    ],
    applicationTasks: [
      { id: 'ftv-kvp-oppgave-1', title: 'Visningsrommet', task: 'Dokumenter én forestilling på Colosseum, Cinemateket, Vega eller Gimle.', prompts: ['Hvilket verk, hvilken kopi eller strøm og hvilket format?', 'Hvordan organiserer sal, lyd, lys og seter oppmerksomheten?', 'Hvilke deler er observert, og hvilke bygger på institusjonens egen beskrivelse?'] },
      { id: 'ftv-kvp-oppgave-2', title: 'Publikumsdata', task: 'Sammenlign ett besøksmål og ett surveybasert seermål.', prompts: ['Hva er enheten og perioden?', 'Er dette besøk, personer, tilgang, bruk eller tidsbruk?', 'Hvilke usikkerheter og fravær finnes?'] },
      { id: 'ftv-kvp-oppgave-3', title: 'Kuratert filmhistorie', task: 'Analyser én Cinemateket- eller filmklubbserie.', prompts: ['Hvilke titler, land, perioder og formater er valgt?', 'Hvilke kopier, rettigheter eller samarbeid er synlige?', 'Hva er utelatt, og kan fraværet forklares?'] },
      { id: 'ftv-kvp-oppgave-4', title: 'Festivalhendelsen', task: 'Kartlegg én dag på Oslo Pix.', prompts: ['Hvilke steder og visningstyper inngår?', 'Hva gjør introduksjon, gjest eller samtale med hendelsen?', 'Hvordan skiller premiereoppmerksomhet seg fra senere resepsjon?'] },
      { id: 'ftv-kvp-oppgave-5', title: 'Fra TV-ritual til plattformpublikum', task: 'Før en ukes videodagbok for en liten, frivillig gruppe.', prompts: ['Hva ble sett lineært, direkte, i opptak og på bestilling?', 'Hvilke tjenester var tilgjengelige men ubrukt?', 'Når oppstod samtidig eller sosial seing?'] }
    ],
    selfCheck: [
      { question: 'Hva skiller et verk fra en visningshendelse?', answer: 'Hendelsen omfatter en bestemt kopi eller strøm, et rom eller en skjerm, et tidspunkt, presentasjonen og et konkret publikum.' },
      { question: 'Hva kan besøkstall dokumentere?', answer: 'Antall registrerte besøk innen en definert dekning og periode, ikke direkte tilfredshet eller unike personer.' },
      { question: 'Hvorfor er kinoarkitektur faglig relevant?', answer: 'Den organiserer sikt, lyd, bevegelse, kapasitet og sosial samlokalisering, men avgjør ikke alene opplevelsen.' },
      { question: 'Hva gjør et cinematek?', answer: 'Det kuraterer og formidler filmhistorie og filmkunst gjennom konkrete kopier, formater, serier og sammenhenger.' },
      { question: 'Hva skiller filmklubb fra ordinær kino?', answer: 'Blant annet medlemsorganisering, frivillig kuratering, rettighets- og distribusjonsnettverk og programprofil.' },
      { question: 'Hvorfor er abonnement ikke det samme som bruk?', answer: 'Tilgang måles på husholdnings- eller personnivå, mens faktisk bruk krever egne data om hvem, hva, når og hvor lenge.' },
      { question: 'Hvordan undersøkes publikumsminne?', answer: 'Ved å sammenholde erindring med daterte program, arkivopptak, billetter, omtaler, statistikk og andre samtidige spor.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({
  id, publisher, title, url, source_location, type, label: `${publisher} – ${title}`
});

const sources = [
  source('ftv01-oslo-colosseum', 'Oslo byleksikon', 'Colosseum kino', 'https://oslobyleksikon.no/side/Colosseum_kino', 'Åpning i 1928, adresse, salstruktur og kinobyggets historiske utvikling', 'city-encyclopedia'),
  source('ftv02-snl-colosseum', 'Store norske leksikon', 'Colosseum kino', 'https://snl.no/Colosseum_kino', 'Arkitekter, opprinnelig form og gjenreisningen etter brannen i 1963', 'scholarly-encyclopedia'),
  source('ftv03-cinemateket-about', 'Cinemateket i Oslo', 'Hva er Cinemateket?', 'https://www.cinemateket.no/om-cinemateket', 'Mandat, programprofil og presentasjon av klassikere, mindre kjente verk og nyere film', 'cinematheque-profile'),
  source('ftv04-cinemateket-responsibility', 'Cinemateket i Oslo', 'Vårt nasjonale ansvar', 'https://www.cinemateket.no/om-cinemateket/cinemateket-og-vart-nasjonale-ansvar', 'Oppstarten i 1984, nasjonalt ansvar, filmhistorisk bredde og visningsformater', 'cinematheque-mandate'),
  source('ftv05-cinemateket-network', 'Cinemateket i Oslo', 'De norske cinematekene', 'https://www.cinemateket.no/om-cinemateket/de-norske-cinematekene', 'Nasjonalt samarbeid og ukentlige cinematekvisninger i sju norske byer', 'cinematheque-network'),
  source('ftv06-nfi-history', 'Norsk filminstitutt', 'Norsk filminstitutts historie', 'https://www.nfi.no/om-oss/hva-er-vi/nfis-historie', 'Cinematekets innlemmelse i NFI og åpningen av Filmens hus i 1996', 'film-institute-history'),
  source('ftv07-nb-2008', 'Nasjonalbiblioteket', 'Årsrapport 2008', 'https://www.nb.no/content/uploads/2018/03/aarsmelding2008.pdf', 'Overføringen av Norsk filminstitutts filmarkiv til Nasjonalbiblioteket i 2008', 'national-library-annual-report'),
  source('ftv08-nfk-about', 'Norsk Filmklubbforbund', 'Om NFK', 'https://filmklubb.no/om-nfk/', 'Forbundets organisering av norske filmklubber og filmklubbvirksomhet', 'film-society-profile'),
  source('ftv09-nfk-english', 'Norsk Filmklubbforbund', 'The Norwegian Federation of Film Societies', 'https://filmklubb.no/english/', 'Import, distribusjon, seminarer, informasjon og opplæring i filmklubbnettverket', 'film-society-mandate'),
  source('ftv10-nfk-member', 'Norsk Filmklubbforbund', 'Om å bli medlem i filmklubben', 'https://filmklubb.no/medlem/', 'Medlemsmodell og medlemspris på tvers av registrerte filmklubber', 'film-society-membership'),
  source('ftv11-pix-practical', 'Oslo Pix Filmfestival', 'Praktisk informasjon', 'https://www.oslopix.no/no/praktisk-informasjon', 'Festivaldatoer og visningssteder i 2026 samt introduksjoner og fravær av ordinær kinoreklame', 'festival-program-record'),
  source('ftv12-pix-hybrid', 'Oslo Pix Filmfestival', 'Velkommen til Oslo Pix Pop-up i august', 'https://www.oslopix.no/no/nyheter/velkommen-til-oslo-pix-pop-up-i-august', 'Pop-up-visninger ved flere steder under pandemien', 'festival-history'),
  source('ftv13-pix-reopen', 'Oslo Pix Filmfestival', 'Oslo Pix er i gang', 'https://www.oslopix.no/no/nyheter/oslo-pix-er-i-gang', '2021-utgaven med digitalt program og kinovisninger som supplement', 'festival-production-account'),
  source('ftv14-ssb-cinema', 'Statistisk sentralbyrå', 'Film og kino', 'https://www.ssb.no/kultur-og-fritid/kultur/kulturstatistikk/film-og-kino', 'Offisiell statistikk for norske kinobesøk i 2025', 'official-statistics'),
  source('ftv15-kino-yearbook', 'Film & Kino', 'Årbok 2025: Norsk film tar tilbake kinopublikummet', 'https://kino.no/arbok-2025-norsk-film-tar-tilbake-kinopublikummet/', 'Totalbesøk, årsutvikling og besøk på norske filmer i 2025', 'industry-yearbook'),
  source('ftv16-kino-monthly', 'Film & Kino', 'Månedsstatistikk – oversikt', 'https://kino.no/article1294243/', 'Månedsfiler, rapporteringsperiode og oppgitt dekningsgrad på rundt 95 prosent', 'industry-statistics-method'),
  source('ftv17-ssb-method', 'Statistisk sentralbyrå', 'Norsk mediebarometer', 'https://www.ssb.no/kultur-og-fritid/tids-og-mediebruk/statistikk/norsk-mediebarometer', 'Utvalgsdesign, aldersavgrensning og formål for den årlige mediebruksundersøkelsen', 'official-survey-method'),
  source('ftv18-ssb-streaming', 'Statistisk sentralbyrå', 'Dette er de mest populære strømmetjenestene i Norge', 'https://www.ssb.no/kultur-og-fritid/tids-og-mediebruk/statistikk/norsk-mediebarometer/artikler/dette-er-de-mest-populaere-strommetjenestene-i-norge', 'Tilgang til og daglig bruk av betalte og åpne strømmetjenester i 2025', 'official-statistics-analysis'),
  source('ftv19-nfi-hearing', 'Norsk filminstitutt', 'Høringssvar: Endringer i kringkastingsforskriften – investeringsplikt', 'https://www.nfi.no/hoeringssvar-endringer-i-kringkastingsforskriften-investeringsplikt', 'Sammenstilling av lineær-TV, videomedier og kinobesøk fram til 2024', 'film-policy-hearing'),
  source('ftv20-nrk-2009', 'NRK', 'Allmennkringkasterregnskap 2009', 'https://info.nrk.no/wp-content/uploads/2021/06/2009-allmennkringkasterregnskap.pdf', 'Seertallet for direktesendingen av Alexander Rybaks Eurovision-seier', 'public-broadcaster-annual-report'),
  source('ftv21-nb-broadcast', 'Nasjonalbiblioteket', 'Kringkasting', 'https://www.nb.no/samlingen/kringkasting/', 'Omfang og tidsdekning i Nasjonalbibliotekets radio- og fjernsynsarkiv', 'broadcast-archive-profile'),
  source('ftv22-nb-deposit', 'Nasjonalbiblioteket', 'Kringkasting – pliktavlevering', 'https://www.nb.no/tjenester/pliktavlevering/kringkasting/', 'Avleveringsplikt for kringkasting og audiovisuelle bestillingstjenester', 'legal-deposit-rule')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('ftv-kvp-01', 'Et audiovisuelt verk, en konkret kopi eller strøm, et visningsrom og en datert visningshendelse er forskjellige analyseobjekter.', ['ftv03-cinemateket-about', 'ftv04-cinemateket-responsibility'], ['ftv-kvp-grunnlag-1']),
  claim('ftv-kvp-02', 'Cinemateket viser klassikere, mindre kjente filmhistoriske verk og nyere filmer av særskilt interesse, ofte med dokumentert visningsformat.', ['ftv03-cinemateket-about', 'ftv04-cinemateket-responsibility'], ['ftv-kvp-grunnlag-1']),
  claim('ftv-kvp-03', 'Lerret, projeksjon, lyd, lys, siktlinjer, sitteorden og introduksjon er dokumenterbare visningsbetingelser, men beviser ikke identisk publikumsopplevelse.', ['ftv01-oslo-colosseum', 'ftv03-cinemateket-about'], ['ftv-kvp-grunnlag-1']),
  claim('ftv-kvp-04', 'Colosseum kino åpnet i 1928 som en monumental kuppelkino på Majorstuen.', ['ftv01-oslo-colosseum', 'ftv02-snl-colosseum'], ['ftv-kvp-grunnlag-2']),
  claim('ftv-kvp-05', 'Colosseum ble gjenreist med ny kuppel og sal etter brannen i 1963 og ble senere utviklet til kinosenter med flere saler.', ['ftv01-oslo-colosseum', 'ftv02-snl-colosseum'], ['ftv-kvp-grunnlag-2']),
  claim('ftv-kvp-06', 'En felles kinovisning dokumenterer samlokalisering rundt samme program, men reaksjon og vurdering krever egne resepsjonsspor.', ['ftv01-oslo-colosseum', 'ftv03-cinemateket-about'], ['ftv-kvp-grunnlag-2']),
  claim('ftv-kvp-07', 'SSB registrerte 8 366 031 kinobesøk i Norge i 2025; måleenheten er besøk og ikke unike personer.', ['ftv14-ssb-cinema'], ['ftv-kvp-grunnlag-3']),
  claim('ftv-kvp-08', 'Film & Kino oppgir rundt 8,38 millioner kinobesøk i 2025, 2,5 prosent flere enn året før, og 2,62 millioner besøk på norske filmer.', ['ftv15-kino-yearbook'], ['ftv-kvp-grunnlag-3']),
  claim('ftv-kvp-09', 'Film & Kinos månedsstatistikk opplyser at rapportene omfatter rundt 95 prosent av kinobesøket.', ['ftv16-kino-monthly'], ['ftv-kvp-grunnlag-3']),
  claim('ftv-kvp-10', 'Cinemateket i Oslo startet visninger i juni 1984, åpnet offisielt samme høst og flyttet til Filmens hus i 1996.', ['ftv04-cinemateket-responsibility', 'ftv06-nfi-history'], ['ftv-kvp-fordypning-1']),
  claim('ftv-kvp-11', 'Cinematekets nasjonale ansvar omfatter filmhistorisk bredde og presentasjon av verk i egnede formater og sammenhenger.', ['ftv04-cinemateket-responsibility', 'ftv05-cinemateket-network'], ['ftv-kvp-fordypning-1']),
  claim('ftv-kvp-12', 'Norsk filminstitutts filmarkiv ble overført til Nasjonalbiblioteket i 2008.', ['ftv07-nb-2008'], ['ftv-kvp-fordypning-1']),
  claim('ftv-kvp-13', 'Norsk Filmklubbforbund organiserer filmklubber og arbeider med import, distribusjon, seminarer, informasjon og filmfaglig opplæring.', ['ftv08-nfk-about', 'ftv09-nfk-english'], ['ftv-kvp-fordypning-2']),
  claim('ftv-kvp-14', 'Medlemskap i en registrert filmklubb gir medlemspris ved andre klubber i Norsk Filmklubbforbunds nettverk.', ['ftv10-nfk-member'], ['ftv-kvp-fordypning-2']),
  claim('ftv-kvp-15', 'Et filmklubbprogram er et dokumenterbart kuratorisk og distribusjonsmessig utvalg, ikke en nøytral oversikt over all relevant film.', ['ftv08-nfk-about', 'ftv09-nfk-english'], ['ftv-kvp-fordypning-2']),
  claim('ftv-kvp-16', 'Oslo Pix Filmfestival 2026 arrangeres 24.–30. august og bruker Vega, Klingenberg, Cinemateket og flere steder i Oslo.', ['ftv11-pix-practical'], ['ftv-kvp-fordypning-3']),
  claim('ftv-kvp-17', 'Oslo Pix opplyser at mange festivalvisninger introduseres, starter presis og ikke har ordinær kinoreklame foran filmen.', ['ftv11-pix-practical'], ['ftv-kvp-fordypning-3']),
  claim('ftv-kvp-18', 'Oslo Pix utviklet pop-up- og hybridformer under pandemien, med både digitale program og fysiske kinovisninger.', ['ftv12-pix-hybrid', 'ftv13-pix-reopen'], ['ftv-kvp-fordypning-3']),
  claim('ftv-kvp-19', 'NRK oppga at over to millioner fulgte Alexander Rybaks Eurovision-seier direkte på NRK1 i 2009.', ['ftv20-nrk-2009'], ['ftv-kvp-anvendelse-1']),
  claim('ftv-kvp-20', 'Norsk mediebarometer er en årlig landsrepresentativ utvalgsundersøkelse; fra 2022 er bruttoutvalget 6000 personer fra ni år og uten øvre aldersgrense.', ['ftv17-ssb-method'], ['ftv-kvp-anvendelse-1']),
  claim('ftv-kvp-21', 'NFI viste i 2026 til at daglig lineær-TV-bruk falt fra om lag 84 prosent rundt 2000 til 46 prosent i 2024, mens daglig bruk av videomedier økte fra 10 til 50 prosent.', ['ftv19-nfi-hearing'], ['ftv-kvp-anvendelse-1']),
  claim('ftv-kvp-22', 'SSB oppgir at 90 prosent av befolkningen hadde tilgang til minst én betalt strømmetjeneste i 2025.', ['ftv18-ssb-streaming'], ['ftv-kvp-anvendelse-2']),
  claim('ftv-kvp-23', 'Nær halvparten av befolkningen så strømmet innhold en gjennomsnittsdag i 2025, og de konkrete tjenestene hadde ulike daglige brukerandeler.', ['ftv18-ssb-streaming'], ['ftv-kvp-anvendelse-2']),
  claim('ftv-kvp-24', 'Distribusjonsanalyse må skille kino, lineær kanal, bestillingstjeneste, abonnement, leie og arkivtilgang fordi vinduer, pris, geografi og rettigheter avgrenser forskjellige publikum.', ['ftv18-ssb-streaming', 'ftv19-nfi-hearing', 'ftv22-nb-deposit'], ['ftv-kvp-anvendelse-2']),
  claim('ftv-kvp-25', 'Nasjonalbibliotekets kringkastingsarkiv har en komplett samling av NRKs sendinger etter 1990 og løpende samlinger fra TV 2 og TVNorge fra 1992.', ['ftv21-nb-broadcast'], ['ftv-kvp-anvendelse-3']),
  claim('ftv-kvp-26', 'Pliktavleveringen omfatter kringkastede lyd- og bildeprogram og audiovisuelle bestillingstjenester, med digital avlevering senest sju virkedager etter første publisering.', ['ftv22-nb-deposit'], ['ftv-kvp-anvendelse-3']),
  claim('ftv-kvp-27', 'Publikumsminne må undersøkes sammen med daterte program, arkivopptak, besøksdata og samtidige resepsjonsspor fordi ingen av kildetypene alene dokumenterer hele visningshendelsen.', ['ftv03-cinemateket-about', 'ftv14-ssb-cinema', 'ftv21-nb-broadcast'], ['ftv-kvp-anvendelse-3'])
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
    primary_domain_id: 'kinoer_visningssteder_publikum', emne_ids: emneIds,
    claimsFile: `${CHAPTER_DIR}/claims.json`, briefFile: `${CHAPTER_DIR}/brief.json`
  };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) {
    assert(subject.chapters.length === 0, 'Film & TV må starte kapittel 1 uten andre registrerte kapitler');
    subject.chapters.push(registryChapter);
  } else {
    subject.chapters[existingIndex] = registryChapter;
  }
  const refactorActive = ['curriculum_completeness_refactor', 'canonical_inventory_migration', 'canonical_inventory_migrated_existing_chapter_reaudit'].includes(readJson(STATUS_FILE).subjects.find((row) => row.id === 'film_tv')?.nextGate);
  if (!refactorActive) subject.canonicalModel.note = 'Film & TVs seks pensum-eide områder styrer rendererstrukturen. Kinoer, visningssteder og publikum er materialisert som fulltekst- og claimsporet kapittel med 20/20 emner; fem områder står igjen. Source-first, ekstern claim-basis og konkrete verk-, visnings-, kringkastings- og arkivankere er bindende.';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'film_tv');
  assert(['structure_ready', 'chapters_in_progress'].includes(subject?.editorialStatus), 'Film & TV må starte fra structure_ready eller dokumentert kapittelproduksjon');
  const refactorGate = ['curriculum_completeness_refactor', 'canonical_inventory_migration', 'canonical_inventory_migrated_existing_chapter_reaudit'].includes(subject.nextGate);
  subject.editorialStatus = 'chapters_in_progress';
  if (!refactorGate) {
    subject.nextGate = 'remaining_domain_chapter_production';
    subject.note = 'Film & TV har seks canonicale fagområder og 120 emner. Kinoer, visningssteder og publikum dekker nå sine 20 emner gjennom 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 27 verifiserte claims, 22 inspiserbare kilderegistreringer, 4 stedscase og alle områdets 20 canonicale metoder. Ett av seks kapitler er materialisert; fem gjenstår.';
  }
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister');
  assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  const activeGate = readJson(STATUS_FILE).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  if (!['chapter_production', 'remaining_domain_chapter_production'].includes(activeGate)) {
    console.log(`Bevarte Film & TV/${CHAPTER_ID} uendret under ${activeGate}.`);
    return;
  }
  writeJson(CHAPTER_FILE, chapter);
  writeJson(`${CHAPTER_DIR}/brief.json`, brief);
  for (const [file, value] of Object.entries(modules)) writeJson(`${CHAPTER_DIR}/${file}`, value);
  writeJson(`${CHAPTER_DIR}/claims.json`, claimsDoc);
  updateRegistry();
  updateStatus();
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: ${emneIds.length} emner, 3 moduler, ${claims.length} claims og ${sources.length} kilder.`);
}

main();
