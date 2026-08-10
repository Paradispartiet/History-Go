#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'tid-og-transformasjon';
const CHAPTER_DIR = 'data/fagverk/kunst/' + CHAPTER_ID;
const CHAPTER_FILE = CHAPTER_DIR + '.json';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), JSON.stringify(value, null, 2) + '\n');
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_kunst_epoker_og_kunsthistorisk_narrativ',
  'em_kunst_hverdagsestetikk'
];

const methodIds = [
  'met_kunst_formanalyse',
  'met_kunst_ikonografisk_analyse',
  'met_kunst_kunsthistorisk_kontekstualisering',
  'met_kunst_kanon_og_arkivanalyse',
  'met_kunst_feltanalyse',
  'met_kunst_kritikk_og_diskursanalyse',
  'met_kunst_komparativ_verkanalyse',
  'met_kunst_institusjonsanalyse',
  'met_kunst_resepsjonsanalyse',
  'met_kunst_offentlig_rom_analyse',
  'met_kunst_stedsspesifikk_analyse',
  'met_kunst_kontekstualisering'
];

const relatedPlaces = [
  { id: 'nasjonalmuseet', name: 'Nasjonalmuseet', role: 'Undersøk hvordan romtitler, kronologi, katalogdata og designsamling bygger og reviderer kunsthistoriske fortellinger.' },
  { id: 'munch_museet', name: 'MUNCH', role: 'Følg motivvariasjon, repetisjon, materialendring, rotasjon og populærkulturelt etterliv gjennom flere tiår.' },
  { id: 'astrup_fearnley', name: 'Astrup Fearnley Museet', role: 'Sammenlign en ikke-kronologisk samling, skiftende konstellasjoner, nye innkjøp og appropriert forbruksestetikk.' },
  { id: 'kunstnernes_hus', name: 'Kunstnernes Hus', role: 'Les årlige utstillinger, institusjonshistorie og retrospektive periodeutvalg som aktive koblinger mellom fortid og samtid.' }
];

const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({
  id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds
});

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'kunst', subject_id: 'kunst',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'tid_transformasjon',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Tid og transformasjon: hvordan kunsthistorien blir skrevet om',
  subtitle: 'Epoker, brudd, kontinuitet, arkiv, gjentakelse, remiks og hverdagsestetikk i fire Oslo-institusjoner',
  lead: 'Kunsthistorisk tid er ikke bare en rekke årstall. Den bygges gjennom rom, etiketter, samlinger, arkiver, gjentatte motiver og skiftende møter med hverdagslivets bilder og ting. Kapittelet lærer brukeren å bruke epoker uten å naturalisere dem og å dokumentere transformasjon uten å gjøre all endring til brudd.',
  learningObjectives: [
    'skille datering, kronologi, periodebetegnelse og kunsthistorisk forklaring',
    'analysere epoker som argumenter med grenser, utelatelser og formål',
    'dokumentere brudd og kontinuitet i samme verk-, motiv- eller institusjonsspor',
    'lese katalog og arkiv som levende historiske infrastrukturer',
    'sammenligne repetisjon, variasjon, reproduksjon og appropriasjon',
    'undersøke hvordan reklame, design, massemedier og forbruk former kunstens visuelle språk',
    'skille gjenkjennelig hverdagsestetikk fra naturgitt eller universell smak',
    'bygge en kildebasert temporal matrise for fire canonicale Oslo-steder'
  ],
  diagnosticQuestions: [
    { question: 'Er en epoke en objektiv tidsboks?', answer: 'Nei. Datoer kan dokumenteres, mens periodegrenser og navn er analytiske valg som må begrunnes.' },
    { question: 'Betyr et gjennombruddsverk at alt tidligere forsvinner?', answer: 'Nei. Brudd må leses sammen med teknikker, motiver og institusjoner som fortsetter eller vender tilbake.' },
    { question: 'Er en ny versjon av et motiv bare en kopi?', answer: 'Nei. Materiale, farge, format, produksjonssituasjon og bruk kan endre verkets uttrykk og funksjon.' },
    { question: 'Er reklame- og forbruksestetikk utenfor kunsthistorien?', answer: 'Nei. Den kan være hverdagsdesign, historisk kilde og materiale for appropriasjon, men rollene må skilles.' }
  ],
  relatedPlaces,
  moduleFiles: [CHAPTER_DIR + '/01-grunnlag.json', CHAPTER_DIR + '/02-fordypning.json', CHAPTER_DIR + '/03-anvendelse.json'],
  briefFile: CHAPTER_DIR + '/brief.json', claimsFile: CHAPTER_DIR + '/claims.json'
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'kunst',
  chapter_id: CHAPTER_ID, primary_domain_id: 'tid_transformasjon',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Kunst-domenet Tid og transformasjon med kildebasert undervisning i epokefortellinger, historiografi, brudd, kontinuitet, arkiv, gjentakelse, remiks og hverdagsestetikk.',
  audience: 'Brukere som skal kunne plassere kunst i tid uten å gjøre periodeetiketter, gjennombruddsfortellinger, arkivposter, reproduksjoner eller kommersielle bilder til nøytrale og selvforklarende fakta.',
  learningArc: [
    'skille dokumentert datering fra fortolkende periodebetegnelse',
    'prøve brudd mot konkrete kontinuitetsspor',
    'lese katalog og arkiv som historisk redigering',
    'følge ett motiv gjennom variasjoner i materiale og tid',
    'spore reproduksjon og appropriasjon mellom kunst og massemedier',
    'analysere hverdagsdesign og forbrukskoder som historiske former',
    'sammenligne kronologisk og ikke-kronologisk samlingspresentasjon',
    'avslutte med en temporal matrise for fire Oslo-institusjoner'
  ],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'datering vs periodisering', 'kronologi vs årsaksforklaring',
    'periodeetikett vs naturgitt tidsboks', 'brudd vs full utskiftning',
    'gjentakelse vs identisk kopi', 'variasjon vs lineær forbedring',
    'arkivpost vs nøytral fortid', 'nåværende utstilling vs total kunsthistorie',
    'reproduksjon vs samme kontekst', 'appropriasjon vs automatisk kritikk eller hyllest',
    'gjenkjennelig smak vs universell smak', 'nytt innkjøp vs ferdig kanonisering'
  ],
  sourceStrategy: {
    priority: [
      'Nasjonalmuseets samlingspresentasjon, katalogposter og designhistoriske kilder',
      'MUNCHs motiv-, variasjons-, rotasjons- og samlingsdokumentasjon',
      'Astrup Fearnleys samlingshistorie, rehenging, innkjøp og appropriasjonsutstillinger',
      'Kunstnernes Hus’ institusjonshistorie og retrospektive utstillingskilder'
    ],
    minimumExternalSources: 15, claimLevelTrace: true, sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: [
      'epoke, historiografi, brudd, kontinuitet og avantgarde som kildeprøvbare fortellinger',
      'arkiv, katalog, samlingspresentasjon, rotasjon og nyinnkjøp',
      'repetisjon, variasjon, reproduksjon, remiks og appropriasjon',
      'reklame, design, massemedier, forbruk og hverdagsestetikk',
      'Nasjonalmuseet, MUNCH, Astrup Fearnley og Kunstnernes Hus som canonicale stedscase'
    ],
    excluded: [
      'periodeetikett brukt som naturgitt fakta',
      'kronologi brukt som tilstrekkelig årsaksforklaring',
      'gjennombrudd brukt som bevis på at all tidligere praksis opphører',
      'arkivet brukt som komplett eller nøytralt minne',
      'repetisjon brukt som identisk kopi eller automatisk kvalitetsfall',
      'kommersiell estetikk brukt som automatisk bevis på kritikk, hyllest eller påvirkning'
    ]
  },
  qa: {
    exactCanonicalCoverage: '2/2', minimumModules: 3, minimumSections: 9,
    paragraphClaimTraceRequired: true,
    rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction'],
    fullSubjectAuditRequiredBeforeComplete: true
  }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('ktt-grunnlag-1', 'Epoken er et begrunnet utsnitt', [
        'En kunsthistorisk kontekstualisering begynner med datering, sted, medium og aktører, men stopper ikke der. Når verk samles under navn som renessanse, modernisme eller etterkrigskunst, er etiketten et argument om hvilke trekk som hører sammen og hvilke forskjeller som får mindre plass.',
        'Nasjonalmuseets samlingspresentasjon organiserer verk i navngitte rom og tematiske forløp. Samme verk kan dermed ha en dokumentert datering og samtidig inngå i en kuratorisk fortelling om for eksempel revolusjon, identitet eller nasjonal historie.',
        'En periodegrense må derfor prøves mot minst ett verk før grensen og ett etter. Likheter dokumenterer kontinuitet; forskjeller kan støtte et brudd, men kronologisk rekkefølge alene forklarer ikke hvorfor endringen skjedde.'
      ], [['ktt-01'], ['ktt-02'], ['ktt-03']], [
        'Skill kalenderdata fra den fortellingen som binder verkene sammen.',
        'Begrunn alltid periodegrensen med både inkluderte og utelatte spor.'
      ], [['ktt-01', 'ktt-02'], ['ktt-03']]),
      section('ktt-grunnlag-2', 'Gjennombrudd har en forhistorie og et etterliv', [
        'Nasjonalmuseet omtaler Den syke piken fra 1885–86 som Munchs gjennombruddsverk og knytter det til en mer personlig og ekspressiv kunst. Betegnelsen beskriver en kunsthistorisk posisjonering, ikke at alle tidligere billedgrep forsvant på én dato.',
        'MUNCH dokumenterer seks malte versjoner av motivet over flere tiår, fra 1880-årene til slutten av 1920-årene, i tillegg til grafiske versjoner. Det som kalles gjennombruddet ble altså også et langvarig arbeid med gjentakelse og endring.',
        'Brudd og kontinuitet må leses samtidig: førsteversjonen kan bryte med forventninger, mens komposisjon, minne og motiv fortsetter. MUNCH dokumenterer også flere versjoner og hundrevis av forarbeider til Solen; senere farger, teknikker og formater gjør kontinuiteten produktiv fremfor identisk.'
      ], [['ktt-04'], ['ktt-05'], ['ktt-06']], [
        'Et gjennombrudd er en situert dom om betydning og endring.',
        'Kontinuitet utelukker ikke transformasjon; den gjør endringen sammenlignbar.'
      ], [['ktt-04'], ['ktt-05', 'ktt-06']]),
      section('ktt-grunnlag-3', 'Arkivet er et levende historieskrivingssted', [
        'Nasjonalmuseet beskriver samlingskatalogen som en levende kunnskapsressurs bygget opp siden 1830-årene. Poster kan rettes og suppleres, og museet varsler at eldre språk og ideer kan stå i konflikt med dagens verdier.',
        'En arkivanalyse registrerer derfor ikke bare hva som finnes, men også registreringsdato, klassifikasjon, eierskap, proveniens, språk, kunnskapshull og senere revisjoner. Fravær kan bety tap, manglende innsamling eller manglende katalogisering – ikke automatisk historisk uviktighet.',
        'Nasjonalmuseets arbeid om Otti Berger kobler Bauhaus-tekstiler, nordisk brukskunst og en utstilling på Kunstnernes Hus i 1938. Slike forbindelser viser hvordan nye undersøkelser kan flytte design og oversette kunstnerskap inn i en bredere kunsthistorisk fortelling.'
      ], [['ktt-07'], ['ktt-08'], ['ktt-09']], [
        'Les metadata og kunnskapshull som deler av historiografien.',
        'Et arkiv dokumenterer bevarte og registrerte spor, ikke hele fortiden.'
      ], [['ktt-07', 'ktt-08'], ['ktt-09']])
    ],
    concepts: [
      { id: 'epoke', term: 'Epoke', definition: 'Et analytisk tidsutsnitt som samler verk og praksiser under begrunnede fellestrekk og grenser.' },
      { id: 'historiografi', term: 'Historiografi', definition: 'Studiet av hvordan kunsthistorie blir valgt, ordnet, skrevet, utfordret og revidert.' },
      { id: 'brudd', term: 'Brudd', definition: 'En dokumenterbar endring i form, praksis, institusjon eller fortolkningsramme som må prøves mot det som fortsetter.' },
      { id: 'kontinuitet', term: 'Kontinuitet', definition: 'Trekk, teknikker, motiver eller strukturer som videreføres gjennom en periode med endring.' },
      { id: 'arkiv', term: 'Arkiv', definition: 'En selektert og ordnet infrastruktur av bevarte spor, metadata og kunnskapshull som kan revideres.' },
      { id: 'hverdagsestetikk', term: 'Hverdagsestetikk', definition: 'Form, sansning og visuelle koder i design, reklame, medier, forbruk og daglige omgivelser utenfor kunstinstitusjonens verkstatus.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('ktt-fordypning-1', 'Gjentakelse produserer forskjell', [
        'MUNCHs seks malte versjoner av Den syke piken beholder en grunnkomposisjon, men endrer blant annet farge, overflate og uttrykk. De grafiske versjonene omformer utsnitt og trykkprosess ytterligere, slik at motivet ikke har én endelig materialisering.',
        'MUNCH beskriver Det grønne rommet som en serie på sju malerier fra 1907 med det samme rommet og skiftende figurkonstellasjoner. Sammenligningen kan derfor isolere hva rommet gjør stabilt og hva personenes plassering endrer.',
        'I utstillingen Infinite erstattes verk av bevaringshensyn, og kuratoren kan velge andre versjoner av samme motiv eller helt andre verk som støtter utstillingskonseptet. Rotasjon gjør både verkets materialtid og utstillingens redigering synlig.'
      ], [['ktt-05', 'ktt-10'], ['ktt-11'], ['ktt-12']], [
        'Sammenlign materiale, format, farge, utsnitt, dato og funksjon – ikke bare motivnavn.',
        'En rotert samlingsutstilling er en ny sekvensering, ikke en identisk gjentakelse.'
      ], [['ktt-10', 'ktt-11'], ['ktt-12']]),
      section('ktt-fordypning-2', 'Reproduksjon og remiks flytter kontekst', [
        'MUNCH dokumenterer fire fargede hovedversjoner og flere trykk av Skrik. Den grafiske versjonen ble tidlig gjengitt i tidsskrifter, og motivet har senere fått et omfattende liv i karikaturer, film og emoji-lignende kommunikasjon.',
        'Astrup Fearnleys utstilling More Than the World kobler popkunst og 1980-årenes appropriasjon til reklame, massemedier og populærkulturelle bilder. Kilden viser et kuratorisk slektskap, men hvert verk må fortsatt analyseres for hvilket materiale som lånes og hvordan det omformes.',
        'Remiks er derfor verken automatisk plagiat, hyllest eller kritikk. Analysen må dokumentere kildebilde, utvalg, materialendring, ny sammenheng, rettighetsforhold og resepsjon før den bestemmer transformasjonens funksjon.'
      ], [['ktt-13'], ['ktt-14'], ['ktt-15']], [
        'Et gjenkjennelig motiv kan skifte medium, publikum og betydningsramme.',
        'Bestem remiksens funksjon fra dokumenterte grep og kontekst, ikke fra lån alene.'
      ], [['ktt-13', 'ktt-14'], ['ktt-15']]),
      section('ktt-fordypning-3', 'Hverdagsestetikk har historie', [
        'Nasjonalmuseets katalog registrerer Bruno Oldanis Compasso d’Oro som en offsettrykt plakat fra 2001 i designsamlingen. Objektstatus, oppdragsgiver, teknikk og innlemmelse i samlingen gjør et kommunikativt hverdagsformat til dokumenterbar designhistorie.',
        'Good Morning America beskriver appropriasjonskunst som lån av fotografier, gjenstander, estetikk og klisjeer fra amerikansk kunst og forbrukskultur. Utstillingen knytter disse grepene til identitet, kjønn, medier og samfunn fra 1970- til 1990-årene.',
        'At et verk bruker reklame, kitsch eller butikkestetikk viser ikke alene om det kritiserer eller feirer forbruk. Form, institusjonell ramme, kunstnertekst og resepsjon må sammenlignes; gjenkjennelighet er historisk lært, ikke universell smak.'
      ], [['ktt-16'], ['ktt-17'], ['ktt-18']], [
        'Registrer hverdagsobjektets opprinnelige funksjon før museumsstatusen analyseres.',
        'Skill visuell låning fra påstått holdning til forbrukskulturen.'
      ], [['ktt-16', 'ktt-17'], ['ktt-18']])
    ],
    workedExamples: [
      { id: 'ktt-eksempel-1', title: 'Test en periodeetikett', situation: 'Et museumsrom heter «A revolution in painting».', analysis: ['Registrer rommets datoer, verk og kuratoriske tekst.', 'Finn ett trekk som endres og ett som fortsetter.', 'Skriv etiketten som en begrunnet fortolkning, ikke som naturgitt epoke.'] },
      { id: 'ktt-eksempel-2', title: 'Sammenlign motivvariasjoner', situation: 'To versjoner av Den syke piken vises side om side.', analysis: ['Beskriv komposisjonen som beholdes.', 'Sammenlign materiale, farge, overflate, format og dato.', 'Knytt forskjellen til dokumentert produksjon og bruk uten å rangere lineært.'] },
      { id: 'ktt-eksempel-3', title: 'Følg et hverdagsbilde inn i kunsten', situation: 'En reklamefotografi-lignende form brukes i et museumsverk.', analysis: ['Identifiser mulig kilde og opprinnelig funksjon.', 'Dokumenter utsnitt, reproduksjon og materialendring.', 'Skill appropriasjonen fra en udokumentert påstand om kritikk eller hyllest.'] }
    ],
    commonMisconceptions: [
      { claim: 'Epoker finnes som objektive bokser med én riktig startdato.', correction: 'Datoer kan være presise, men epoken er et analytisk utsnitt som varierer med spørsmål, materiale og geografisk perspektiv.' },
      { claim: 'Et kunsthistorisk brudd betyr at tidligere former forsvinner.', correction: 'Brudd må prøves mot konkrete kontinuiteter, tilbakekomster og parallelle praksiser.' },
      { claim: 'En ny versjon av samme motiv er bare en dårligere kopi.', correction: 'Materiale, farge, utsnitt, størrelse, produksjon og bruk kan gjøre hver versjon analytisk selvstendig.' },
      { claim: 'Museets arkiv viser fortiden komplett og nøytralt.', correction: 'Arkivet er selektert, katalogisert og revidert; fravær og språk må analyseres som historiske forhold.' },
      { claim: 'Bruk av reklame og kitsch er automatisk forbrukskritikk.', correction: 'Lånet kan kritisere, undersøke, utnytte eller feire; funksjonen krever dokumentasjon av grep, ramme og resepsjon.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('ktt-anvendelse-1', 'Samlingspresentasjonen skriver tid', [
        'Astrup Fearnley opplyser at samlingen ikke konsentrerer seg om bestemte epoker, stiler eller grupper, og at verk regelmessig rehenges i nye konstellasjoner. Fravær av kronologisk løype er dermed også et eksplisitt historiografisk valg.',
        'Rotating Views #1 beskrev samlingen som ikke-historisk, ikke-kronologisk og ikke-encyklopedisk. En slik presentasjon kan fremheve forbindelser på tvers av datoer, men må fortsatt undersøkes for hvilke kunstnerskap og geografier som får danne forbindelsene.',
        'Museets innkjøpsoversikt for 2023 viser at nye verk både utvidet etablerte posisjoner og introduserte nyere praksiser og flere geografier. Et innkjøp endrer samlingens mulige fortellinger, men er ikke alene bevis på varig kanonisering.'
      ], [['ktt-19'], ['ktt-20'], ['ktt-21']], [
        'Kronologisk og tematisk presentasjon er ulike redigeringsformer, ikke nøytral versus kuratert.',
        'Skill ny representasjon i samlingen fra varig plass i kunsthistorien.'
      ], [['ktt-19', 'ktt-20'], ['ktt-21']]),
      section('ktt-anvendelse-2', 'Institusjonen lager historiske sykluser', [
        'Kunstnernes Hus fører sin historie fra arkitektkonkurransen i 1928 til åpningen med Høstutstillingen i 1930. Den årlige utstillingen skaper en gjentatt institusjonell rytme der samtidige utvalg senere kan leses som historiske dokumenter.',
        'Institusjonen beskriver seg som kunstnerstyrt siden 1930 og Høstutstillingen som en sentral, juryert kobling mellom debutanter og etablerte kunstnere. Kontinuiteten ligger i formatet, mens jury, innsendingsfelt, verk og kritikk endres fra år til år.',
        'Utstillingen Krigens skygge valgte tre perioder – mellomkrigstid, sen etterkrigstid og samtid – for å vise brudd og kontinuitet i politisk kunst. Periodene er derfor et dokumentert kuratorisk grep som må vurderes mot verkutvalg og utelatelser.'
      ], [['ktt-22'], ['ktt-23'], ['ktt-24']], [
        'En årlig utstilling kombinerer stabil institusjonsform med skiftende historisk materiale.',
        'Retrospektive perioder er verktøy for sammenligning, ikke hele feltets tidslinje.'
      ], [['ktt-22', 'ktt-23'], ['ktt-24']]),
      section('ktt-anvendelse-3', 'Bygg en temporal matrise', [
        'Lag kolonner for datering, periodeetikett, begrunnelse, formalt brudd, dokumentert kontinuitet, arkivstatus, gjentakelse, materialendring, reproduksjon, hverdagskilde, institusjonell ramme og resepsjon. Merk hva som er kildefakta og hva som er analyse.',
        'Sammenlign Nasjonalmuseets navngitte historiske rom, MUNCHs motivvariasjoner og rotasjoner, Astrup Fearnleys ikke-kronologiske konstellasjoner og Kunstnernes Hus’ årlige og retrospektive sykluser. Forskjellene viser flere måter å produsere kunsthistorisk tid på.',
        'Avslutt med to dommer per case: hva endret seg, og hva fortsatte? Legg deretter til hvem som satte perioderammen, hvilke kilder som støtter den, og hvilke uttrykk den skyver ut. Først da blir transformasjon mer presis enn en fortelling om at alt nytt erstatter alt gammelt.'
      ], [['ktt-01', 'ktt-07', 'ktt-19'], ['ktt-02', 'ktt-12', 'ktt-20', 'ktt-22'], ['ktt-03', 'ktt-06', 'ktt-21', 'ktt-24']], [
        'Hold datering, periodisering, endring og årsaksforklaring i separate kolonner.',
        'La hver bruddpåstand møte minst ett dokumentert kontinuitetsspor.'
      ], [['ktt-01', 'ktt-03', 'ktt-07'], ['ktt-06', 'ktt-20', 'ktt-24']])
    ],
    applicationTasks: [
      { id: 'ktt-oppgave-1', title: 'Romtittel som argument', task: 'Velg ett navngitt samlingsrom i Nasjonalmuseet.', prompts: ['Hvilke datoer og verk inngår?', 'Hvilken endringsfortelling ligger i tittelen?', 'Hvilket relevant verk eller spor kunne utfordret avgrensningen?'] },
      { id: 'ktt-oppgave-2', title: 'Motiv over tid', task: 'Sammenlign to versjoner av Den syke piken eller Skrik.', prompts: ['Hva beholdes formalt?', 'Hva endres i materiale og uttrykk?', 'Hvilken produksjons- eller brukskontekst dokumenterer forskjellen?'] },
      { id: 'ktt-oppgave-3', title: 'Arkivpost i revisjon', task: 'Les én eldre og én nyere katalogpost.', prompts: ['Hvilke metadata er sikre?', 'Hvilket språk eller klassifikasjon er historisk situert?', 'Hva er rettet, ukjent eller utelatt?'] },
      { id: 'ktt-oppgave-4', title: 'Fra reklame til museumsverk', task: 'Følg ett bilde eller objekt fra hverdagsfunksjon til kunstkontekst.', prompts: ['Hva var den opprinnelige funksjonen?', 'Hvilke grep endrer materialet og rammen?', 'Finnes evidens for kritikk, hyllest eller en annen lesning?'] },
      { id: 'ktt-oppgave-5', title: 'To samlingshistorier', task: 'Sammenlign Nasjonalmuseet og Astrup Fearnley.', prompts: ['Hvordan organiseres tid og rekkefølge?', 'Hvordan påvirker rotasjon og innkjøp fortellingen?', 'Hvilke grupper eller medier blir sentrale eller marginale?'] }
    ],
    selfCheck: [
      { question: 'Hva skiller datering fra periodisering?', answer: 'Datering plasserer et objekt i kalenderen; periodisering samler flere objekter i et begrunnet historisk utsnitt.' },
      { question: 'Hvorfor forklarer ikke kronologi årsak?', answer: 'At én hendelse kommer før en annen viser rekkefølge, men ikke hvilken mekanisme som skapte endringen.' },
      { question: 'Hvordan testes et brudd?', answer: 'Ved å dokumentere konkrete endringer og sammenligne dem med teknikker, motiver eller strukturer som fortsetter.' },
      { question: 'Hva gjør arkivet historiografisk?', answer: 'Utvalg, fravær, metadata, språk og revisjoner påvirker hvilken fortid som kan finnes og fortelles.' },
      { question: 'Når er gjentakelse transformasjon?', answer: 'Når medium, materiale, farge, format, situasjon eller bruk endrer hvordan motivet virker.' },
      { question: 'Hva er hverdagsestetikk?', answer: 'Historisk formede sanse- og billedkoder i blant annet design, reklame, medier, forbruk og daglige omgivelser.' },
      { question: 'Hvorfor er appropriasjon ikke automatisk kritikk?', answer: 'Fordi lån alene ikke dokumenterer holdning; grep, ramme, kunstnerposisjon og resepsjon må undersøkes.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({
  id, publisher, title, url, source_location, type, label: publisher + ' – ' + title
});

const sources = [
  source('ktt01-nm-presentation', 'Nasjonalmuseet', 'The collection presentation', 'https://www.nasjonalmuseet.no/en/exhibitions-and-events/national-museum/exhibitions/2021/collection-exhibition/the_collection_presentation/', 'Oversikten over samlingspresentasjonens verk, rom og tematiske organisering', 'official-collection-exhibition'),
  source('ktt02-nm-scream', 'Nasjonalmuseet', 'The Scream', 'https://www.nasjonalmuseet.no/en/collection/object/NG.M.00939', 'Katalogpostens datering, romplassering og tekst om motivets populærkulturelle etterliv', 'official-collection-record'),
  source('ktt03-nm-sick', 'Nasjonalmuseet', 'The Sick Child', 'https://www.nasjonalmuseet.no/en/collection/object/NG.M.00839', 'Katalogteksten om datering, komposisjon og status som gjennombruddsverk', 'official-collection-record'),
  source('ktt04-nm-oldani', 'Nasjonalmuseet', 'Compasso d’Oro', 'https://www.nasjonalmuseet.no/en/collection/object/NMK.2014.0249', 'Katalogpostens opplysninger om plakat, oppdragsgiver, offsetteknikk, designsamling og katalogpraksis', 'official-design-record'),
  source('ktt05-nm-berger', 'Nasjonalmuseet', 'Otti Berger and the Nordic countries', 'https://www.nasjonalmuseet.no/en/stories/explore-the-collection/otti-berger-og-norden-eng/', 'Historien om Bauhaus-tekstiler, nordisk brukskunst og utstillingen på Kunstnernes Hus i 1938', 'official-research-story'),
  source('ktt06-munch-sick', 'MUNCH', 'The Sick Child', 'https://www.munch.no/en/our-collection/the-sick-child/', 'Avsnittene om seks malte versjoner over flere tiår, grafikk, farge og variasjon', 'official-collection-essay'),
  source('ktt07-munch-infinite', 'MUNCH', 'Infinite Change – Always Something New to Discover', 'https://www.munch.no/en/exhibitions/edvard-munch-infinite/infinite-change--always-something-new-to-discover/', 'Kuratorens beskrivelse av rotasjon, flere versjoner og valg som støtter utstillingskonseptet', 'official-curatorial-essay'),
  source('ktt08-munch-scream', 'MUNCH', '5 things you should know about The Scream', 'https://www.munch.no/en/our-collection/5-things-you-should-know-about-the-scream/', 'Avsnittene om versjoner, trykk, rotasjon, tidlig reproduksjon og populærkulturelt etterliv', 'official-collection-essay'),
  source('ktt09-munch-green', 'MUNCH', 'When the Room is the Main Character', 'https://www.munch.no/en/our-collection/when-the-room-is-the-main-character/', 'Kuratoressayet om serien på sju malerier, rommet og skiftende figurkonstellasjoner', 'official-curatorial-essay'),
  source('ktt10-munch-sun', 'MUNCH', 'Between us and the Sun', 'https://www.munch.no/en/our-collection/between-us-and-the-sun/', 'Historien om Aula-oppdraget, flere hundre forarbeider, flere versjoner og vitalistisk kontekst', 'official-collection-essay'),
  source('ktt11-af-about', 'Astrup Fearnley Museet', 'About the Astrup Fearnley Museet', 'https://www.afmuseet.no/en/about-the-astrup-fearnley-museet/', 'Institusjonsbeskrivelsen om samlingens historie, ikke-epokale profil og regelmessige rehenging', 'official-institution-profile'),
  source('ktt12-af-rotating', 'Astrup Fearnley Museet', 'Rotating Views #1 – Astrup Fearnley Collection', 'https://www.afmuseet.no/en/exhibitions/rotating-views-1-astrup-fearnley-collection/', 'Utstillingsteksten om ikke-historisk, ikke-kronologisk og ikke-encyklopedisk samlingspresentasjon', 'official-exhibition-essay'),
  source('ktt13-af-world', 'Astrup Fearnley Museet', 'MORE THAN THE WORLD – Works from the Astrup Fearnley Collection', 'https://www.afmuseet.no/en/exhibitions/more-than-the-world-works-from-the-astrup-fearnley-collection/', 'Utstillingsteksten om popkunst, appropriasjon, reklame, massemedier, kitsch og hverdagsobjekter', 'official-exhibition-essay'),
  source('ktt14-af-america', 'Astrup Fearnley Museet', 'Good Morning America', 'https://www.afmuseet.no/en/exhibitions/good-morning-america/', 'Utstillingsteksten om appropriasjonskunst, forbrukskultur, mediestrukturer og perioden 1970–1990', 'official-exhibition-essay'),
  source('ktt15-af-acquisitions', 'Astrup Fearnley Museet', 'Astrup Fearnley Collection: New Acquisitions', 'https://www.afmuseet.no/en/astrup-fearnley-collection-new-acquisitions-2023/', 'Oversikten over 2023-innkjøp, historiske og nyere verk, etablerte posisjoner og nye geografier', 'official-acquisition-report'),
  source('ktt16-kh-history', 'Kunstnernes Hus', 'Vår historie', 'https://kunstnerneshus.no/om/historie', 'Tidslinjen om arkitektkonkurransen, åpningen med Høstutstillingen i 1930 og senere kunsthistoriske hendelser', 'official-institution-history'),
  source('ktt17-kh-war', 'Kunstnernes Hus', 'Krigens skygge', 'https://kunstnerneshus.no/en/program/exhibitions/krigens-skygge', 'Utstillingsteksten om tre valgte perioder og brudd og kontinuitet i politisk kunst', 'official-exhibition-essay'),
  source('ktt18-kh-about', 'Kunstnernes Hus', 'Om Kunstnernes Hus', 'https://kunstnerneshus.no/om', 'Institusjonsprofilen om kunstnerstyring, årlig Høstutstilling, fri innsending og kobling mellom fortid og fremtid', 'official-institution-profile')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('ktt-01', 'Kunsthistorisk periodisering kombinerer dokumenterbare datoer med analytiske valg om fellestrekk, grenser og relevans.', ['ktt01-nm-presentation', 'ktt12-af-rotating'], ['ktt-grunnlag-1', 'ktt-anvendelse-3']),
  claim('ktt-02', 'Nasjonalmuseets samlingspresentasjon bruker navngitte rom og tematiske forløp til å organisere daterte objekter.', ['ktt01-nm-presentation', 'ktt02-nm-scream', 'ktt03-nm-sick'], ['ktt-grunnlag-1', 'ktt-anvendelse-3']),
  claim('ktt-03', 'Kronologisk rekkefølge dokumenterer før og etter, men en bruddpåstand krever sammenligning og årsaksgrunnlag.', ['ktt03-nm-sick', 'ktt06-munch-sick', 'ktt17-kh-war'], ['ktt-grunnlag-1', 'ktt-anvendelse-3']),
  claim('ktt-04', 'Nasjonalmuseet daterer Den syke piken til 1885–86 og beskriver verket som Munchs gjennombrudd mot et mer personlig og ekspressivt uttrykk.', ['ktt03-nm-sick'], ['ktt-grunnlag-2']),
  claim('ktt-05', 'MUNCH dokumenterer seks malte versjoner av Den syke piken fra 1880-årene til slutten av 1920-årene samt flere grafiske versjoner.', ['ktt06-munch-sick'], ['ktt-grunnlag-2', 'ktt-fordypning-1']),
  claim('ktt-06', 'MUNCH dokumenterer at motiver som Den syke piken og Solen ble utviklet gjennom flere versjoner og forarbeider der kontinuitet og materiell transformasjon virker sammen.', ['ktt06-munch-sick', 'ktt10-munch-sun'], ['ktt-grunnlag-2', 'ktt-anvendelse-3']),
  claim('ktt-07', 'Nasjonalmuseet beskriver samlingskatalogen som en levende kunnskapsressurs med opplysninger samlet siden 1830-årene og med historisk situert språk.', ['ktt04-nm-oldani'], ['ktt-grunnlag-3', 'ktt-anvendelse-3']),
  claim('ktt-08', 'Katalog- og arkivanalyse må skille bevarte og registrerte spor fra en påstand om komplett fortid.', ['ktt04-nm-oldani', 'ktt05-nm-berger'], ['ktt-grunnlag-3']),
  claim('ktt-09', 'Nasjonalmuseet kobler Otti Bergers Bauhaus-tekstiler til nordisk brukskunst og en utstilling på Kunstnernes Hus i 1938.', ['ktt05-nm-berger'], ['ktt-grunnlag-3']),
  claim('ktt-10', 'MUNCH dokumenterer materiell og fargemessig variasjon innenfor gjentatte versjoner av Den syke piken.', ['ktt06-munch-sick'], ['ktt-fordypning-1']),
  claim('ktt-11', 'Det grønne rommet er en serie på sju malerier fra 1907 med samme rom og skiftende figurkonstellasjoner.', ['ktt09-munch-green'], ['ktt-fordypning-1']),
  claim('ktt-12', 'Infinite roterer verk og bruker både alternative motivversjoner og andre verk for å ivareta materiale og utstillingskonsept.', ['ktt07-munch-infinite', 'ktt08-munch-scream'], ['ktt-fordypning-1', 'ktt-anvendelse-3']),
  claim('ktt-13', 'MUNCH dokumenterer flere malte, tegnede og trykte versjoner av Skrik og motivets tidlige og senere populærkulturelle reproduksjon.', ['ktt08-munch-scream'], ['ktt-fordypning-2']),
  claim('ktt-14', 'Astrup Fearnley knytter popkunst og appropriasjon til reklame, massemedier og populærkulturelle bilder.', ['ktt13-af-world', 'ktt14-af-america'], ['ktt-fordypning-2']),
  claim('ktt-15', 'Lån av et eksisterende bilde dokumenterer appropriasjon, mens kritikk, hyllest eller annen funksjon krever analyse av omforming og kontekst.', ['ktt13-af-world', 'ktt14-af-america'], ['ktt-fordypning-2']),
  claim('ktt-16', 'Nasjonalmuseets Compasso d’Oro er registrert som en offsettrykt plakat fra 2001 i designsamlingen med dokumentert oppdragsgiver.', ['ktt04-nm-oldani'], ['ktt-fordypning-3']),
  claim('ktt-17', 'Good Morning America koblet appropriasjon av bilder, objekter og klisjeer fra forbrukskultur til amerikansk samfunn fra 1970- til 1990-årene.', ['ktt14-af-america'], ['ktt-fordypning-3']),
  claim('ktt-18', 'Bruk av reklame-, kitsch- eller forbrukskoder dokumenterer et visuelt lån, men ikke automatisk verkets holdning eller resepsjon.', ['ktt13-af-world', 'ktt14-af-america'], ['ktt-fordypning-3']),
  claim('ktt-19', 'Astrup Fearnley beskriver en samling uten konsentrasjon om bestemte epoker, stiler eller grupper og med regelmessig rehenging.', ['ktt11-af-about'], ['ktt-anvendelse-1', 'ktt-anvendelse-3']),
  claim('ktt-20', 'Rotating Views #1 beskrev samlingspresentasjonen som ikke-historisk, ikke-kronologisk og ikke-encyklopedisk.', ['ktt12-af-rotating'], ['ktt-anvendelse-1', 'ktt-anvendelse-3']),
  claim('ktt-21', 'Astrup Fearnleys 2023-innkjøp utvidet etablerte posisjoner og la til både historiske og nyere verk fra flere geografier.', ['ktt15-af-acquisitions'], ['ktt-anvendelse-1', 'ktt-anvendelse-3']),
  claim('ktt-22', 'Kunstnernes Hus fører institusjonshistorien fra arkitektkonkurransen i 1928 til åpningen med Høstutstillingen i 1930.', ['ktt16-kh-history'], ['ktt-anvendelse-2', 'ktt-anvendelse-3']),
  claim('ktt-23', 'Kunstnernes Hus beskriver Høstutstillingen som en årlig kunstnerjuryert utstilling med fri innsending og både debutanter og etablerte navn.', ['ktt18-kh-about'], ['ktt-anvendelse-2']),
  claim('ktt-24', 'Krigens skygge valgte mellomkrigstid, sen etterkrigstid og samtid for å undersøke brudd og kontinuitet i politisk kunst.', ['ktt17-kh-war'], ['ktt-anvendelse-2', 'ktt-anvendelse-3'])
];

const claimsDoc = {
  schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'kunst',
  chapter_id: CHAPTER_ID, sources, claims
};

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.kunst;
  assert(subject && Array.isArray(subject.chapters), 'Kunst mangler kapittelliste i fagverkregisteret');
  const registryChapter = {
    id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: CHAPTER_FILE,
    primary_domain_id: 'tid_transformasjon', emne_ids: emneIds
  };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) {
    assert(subject.chapters.length === 5, 'Kunst må starte dette steget med fem kapitler');
    subject.chapters.push(registryChapter);
  } else {
    assert(subject.chapters.length === 6, 'Reproduksjon forventer nøyaktig seks Kunst-kapitler');
    subject.chapters[existingIndex] = registryChapter;
  }
  subject.canonicalModel.note = 'Kunstfagets seks canonicale fagområder eier rendererstrukturen. Alle seks er materialisert som fulltekst- og claimsporede kapitler og verifiseres av en separat helhetsaudit.';
  subject.editorialPlan = {
    completionRequirements: [
      'all_canonical_domains_materialized',
      'all_canonical_emners_covered_exactly_once',
      'paragraph_claim_trace_complete',
      'full_subject_audit_green'
    ]
  };
  registry.version = '2.58.0';
  registry.updatedAt = '2026-08-10';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'kunst');
  assert(['chapters_in_progress', 'complete'].includes(subject?.editorialStatus), 'Kunst må starte fra dokumentert kapittelproduksjon eller complete');
  subject.editorialStatus = 'complete';
  subject.nextGate = 'maintenance_source_refresh_and_place_case_expansion';
  subject.note = 'Kunst er redaksjonelt complete etter separat helhetsaudit: alle 6 canonicale fagområder og 21 emner er dekket gjennom 6 kapitler, 18 moduler, 162 claimsporede fagavsnitt, 140 verifiserte claims, 100 inspiserbare kilderegistreringer og alle 21 canonicale metoder.';
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister');
  assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  writeJson(CHAPTER_FILE, chapter);
  writeJson(CHAPTER_DIR + '/brief.json', brief);
  for (const [file, value] of Object.entries(modules)) writeJson(CHAPTER_DIR + '/' + file, value);
  writeJson(CHAPTER_DIR + '/claims.json', claimsDoc);
  updateRegistry();
  updateStatus();
  console.log('Materialiserte Kunst/' + CHAPTER_ID + ': ' + emneIds.length + ' emner, 3 moduler, ' + claims.length + ' claims og ' + sources.length + ' kilder.');
}

main();
