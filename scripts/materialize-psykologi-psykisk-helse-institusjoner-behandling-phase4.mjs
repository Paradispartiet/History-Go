#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'psykisk-helse-institusjoner-og-behandling';
const DOMAIN_ID = 'psykisk_helse_institusjoner_behandling';
const CHAPTER_DIR = `data/fagverk/psykologi/${CHAPTER_ID}`;
const CHAPTER_FILE = `data/fagverk/psykologi/${CHAPTER_ID}.json`;
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
  'em_psy_behandling_omsorg',
  'em_psy_behandlingsformer',
  'em_psy_byrom_psykisk_helse',
  'em_psy_institusjoner_psykiatri',
  'em_psy_krise_intervensjon',
  'em_psy_makt_omsorg',
  'em_psy_omsorg_system',
  'em_psy_pasientrolle_erfaring',
  'em_psy_psykisk_helse',
  'em_psy_terapi_praksis',
  'em_psy_terapirom_relasyon',
  'em_psy_velferd_psykisk_helse'
];

const methodIds = [
  'met_psy_klinisk_analyse',
  'met_psy_institusjonshistorisk_analyse',
  'met_psy_behandlingshistorisk_analyse',
  'met_psy_praksisanalyse',
  'met_psy_rom_og_praksisanalyse',
  'met_psy_relational_analyse',
  'met_psy_steds_og_institusjonsanalyse',
  'met_psy_makt_og_omsorgsanalyse',
  'met_psy_krisepsykologisk_analyse',
  'met_psy_traumeanalyse',
  'met_psy_stressanalyse',
  'met_psy_normkritisk_analyse',
  'met_psy_systemanalyse',
  'met_psy_velferdspsykologisk_analyse',
  'met_psy_erfaringsanalyse',
  'met_psy_diskursanalyse',
  'met_psy_offentlighetsanalyse',
  'met_psy_risiko_og_resiliensanalyse'
];

const relatedPlaces = [
  {
    id: 'psykologisk_institutt_uio',
    name: 'Psykologisk institutt, UiO',
    role: 'Bruk stedet til å skille psykologisk forskning, profesjonsutdanning og klinisk praksis fra hverdagspsykologi og persondiagnostikk.'
  }
];

const institutionCases = [
  {
    id: 'gaustad_sykehus_case',
    name: 'Gaustad sykehus',
    placeStatus: 'documented_case_not_runtime_place',
    role: 'Les det formålsbygde 1800-tallsanlegget som institusjonshistorie: arkitektur, organisering, behandling og makt må dokumenteres hver for seg.'
  },
  {
    id: 'dikemark_sykehus_case',
    name: 'Dikemark sykehus',
    placeStatus: 'documented_case_not_runtime_place',
    role: 'Bruk museum og sykehushistorie til å sammenligne arbeid, hverdagsliv, isolat og skiftende behandlingsformer uten å romantisere institusjonen.'
  },
  {
    id: 'vinderen_psykiatriske_case',
    name: 'Psykiatrisk avdeling, Vinderen',
    placeStatus: 'documented_case_not_runtime_place',
    role: 'Følg forbindelsen mellom universitetsklinikk, undervisning og senere organisatoriske endringer i psykisk helsevern.'
  }
];

const section = (id, title, emne_ids, method_ids, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({
  id, title, emne_ids, method_ids, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds
});

const chapter = {
  schema: 'history_go_fagverk_chapter_v1',
  version: '1.0.0',
  subject: 'psykologi',
  subject_id: 'psykologi',
  id: CHAPTER_ID,
  chapter_id: CHAPTER_ID,
  primary_domain_id: DOMAIN_ID,
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  doNotDiagnosePeople: true,
  emne_ids: emneIds,
  method_ids: methodIds,
  title: 'Psykisk helse, institusjoner og behandling',
  subtitle: 'Fra tjenestesystem og pasientrolle til terapi, krisehjelp, tvang, omsorg og institusjonshistorie',
  lead: 'Psykisk helse kan ikke leses ut av et ansikt, et sted eller én hendelse. Dette kapittelet undersøker i stedet hvordan hjelp organiseres, hvordan institusjoner og behandlingsformer har endret seg, hvilke rettigheter pasienter har, og hvordan relasjon, rom, velferd og makt kan analyseres med dokumenterte kilder. Kapittelet er undervisning i psykologi og tjenestesystemer, ikke diagnose, screening eller individuell behandlingsveiledning.',
  learningObjectives: [
    'skille psykisk helse, psykiske plager, psykiske lidelser og psykisk helsevern som ulike analytiske nivåer',
    'kartlegge hvordan kommune, fastlege og spesialisthelsetjeneste inngår i ulike deler av hjelpesystemet',
    'analysere pasientrolle, medvirkning, informasjon og behandlingsplan som dokumenterbare rettighets- og praksisspørsmål',
    'sammenligne behandlingsformer uten å gjøre én metode til universell fasit',
    'analysere terapirom og behandlingsrelasjon uten å trekke slutninger om enkeltpersoners diagnose eller motiv',
    'skille frivillig hjelp, tvang, kontroll og rettssikkerhet',
    'bruke Gaustad, Dikemark og Vinderen som institusjonshistoriske case med tydelige kildegrenser',
    'undersøke krisehjelp, kontinuitet, nærmiljø og velferd som deler av et større omsorgssystem'
  ],
  diagnosticQuestions: [
    { question: 'Er psykisk helse det samme som psykisk lidelse?', answer: 'Nei. Psykisk helse er et bredere begrep om hvordan mennesker har det og fungerer; en klinisk diagnose krever egen utredning og kan ikke utledes av dette kapittelet.' },
    { question: 'Foregår psykisk helsehjelp bare på sykehus?', answer: 'Nei. Hjelp finnes blant annet i kommunen og hos fastlege, mens psykisk helsevern er en del av spesialisthelsetjenesten.' },
    { question: 'Betyr behandling én bestemt metode?', answer: 'Nei. Tjenestene bruker ulike tiltak og behandlingsformer, og valg må vurderes i den konkrete helsefaglige og rettslige sammenhengen.' },
    { question: 'Kan vi diagnostisere historiske personer fra arkivspor?', answer: 'Nei. History Go analyserer dokumenterte institusjoner, praksiser, språk og erfaringer; det diagnostiserer ikke enkeltpersoner.' }
  ],
  relatedPlaces,
  institutionCases,
  moduleFiles: [
    `${CHAPTER_DIR}/01-grunnlag.json`,
    `${CHAPTER_DIR}/02-rettigheter-og-praksis.json`,
    `${CHAPTER_DIR}/03-institusjon-sted-og-krise.json`
  ],
  briefFile: `${CHAPTER_DIR}/brief.json`,
  claimsFile: `${CHAPTER_DIR}/claims.json`
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1',
  version: '1.0.0',
  subject_id: 'psykologi',
  chapter_id: CHAPTER_ID,
  primary_domain_id: DOMAIN_ID,
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  institutionCaseIds: institutionCases.map((item) => item.id),
  purpose: 'Materialisere første canonicale Psykologi-domene med kildebelagt undervisning om psykisk helse, institusjoner, behandling, pasientrolle, omsorgssystem, krise, velferd og makt.',
  audience: 'Brukere som skal forstå psykologi og psykisk helsevern som faglige, institusjonelle og rettighetsbaserte felt uten at appen fungerer som diagnoseverktøy eller individuell behandlingsrådgiver.',
  learningArc: [
    'begynne med psykisk helse som bredt fenomen og avgrense psykisk helsevern',
    'kartlegge tjenestesystemet fra kommune og fastlege til DPS og sykehus',
    'følge pasientrolle, medvirkning, informasjon og behandlingsplan',
    'sammenligne behandlingsformer som praksiser med ulike rammer',
    'undersøke terapirom og relasjon som situert samhandling',
    'analysere omsorgssystem og overganger mellom tjenester',
    'skille kriseintervensjon fra langsiktig oppfølging',
    'analysere makt, tvang, kontroll og rettssikkerhet eksplisitt',
    'avslutte med institusjons- og byanalyse av Gaustad, Dikemark, Vinderen og UiO'
  ],
  requiredEmneIds: emneIds,
  requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'psykisk helse vs psykisk lidelse',
    'psykisk helsehjelp vs psykisk helsevern',
    'undervisning vs diagnose',
    'beskrivelse av tjeneste vs behandlingsanbefaling',
    'pasienterfaring vs journalført eller lovfestet forhold',
    'behandlingsform vs dokumentert effekt for et bestemt individ',
    'frivillighet vs tvang',
    'omsorg vs kontroll',
    'rettighet vs lokal praksis',
    'krisehjelp vs langvarig behandling',
    'historisk institusjonspraksis vs dagens regelverk',
    'stedlig observasjon vs slutning om menneskers psykiske tilstand'
  ],
  sourceStrategy: {
    priority: [
      'gjeldende norsk lov og forskrift via Lovdata for rettslige påstander',
      'Helsenorge og Helsedirektoratet for dagens tjenestesystem, pasientforløp, medvirkning og kontrollordninger',
      'WHO for eksplisitt internasjonal rettighetsbasert tjenestemodell',
      'Oslo universitetssykehus og dokumenterte byhistoriske oppslag for institusjonshistoriske case',
      'canonicale Psykologi-filer som scope- og metodeeier, aldri som ekstern faktakilde'
    ],
    minimumExternalSources: 15,
    claimLevelTrace: true,
    sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true,
    highStakesCurrentLawCutoff: '2026-06-01'
  },
  safety: {
    doNotDiagnosePeople: true,
    noIndividualTreatmentAdvice: true,
    noScreeningInterpretation: true,
    crisisInformationIsDescriptiveNotPersonalized: true,
    historicalCaseRule: 'Analyser institusjon, praksis, språk, kilder og dokumenterte erfaringer; ikke retrodiagnostiser personer.'
  },
  qa: {
    exactCanonicalCoverage: '12/12',
    minimumModules: 3,
    minimumSections: 9,
    paragraphClaimTraceRequired: true,
    minimumExternalSources: 15,
    minimumClaims: 24,
    rendererFieldsRequired: ['relatedPlaces', 'institutionCases', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction']
  }
};

const modules = {
  '01-grunnlag.json': {
    schema: 'history_go_fagverk_chapter_module_v1',
    version: '1.0.0',
    subject_id: 'psykologi',
    chapter_id: CHAPTER_ID,
    module_id: 'grunnlag',
    title: 'Psykisk helse og hjelpesystem',
    sections: [
      section(
        'phi-grunnlag-1',
        'Psykisk helse er bredere enn diagnose',
        ['em_psy_psykisk_helse', 'em_psy_velferd_psykisk_helse'],
        ['met_psy_klinisk_analyse', 'met_psy_velferdspsykologisk_analyse', 'met_psy_normkritisk_analyse'],
        [
          'Helsenorge beskriver psykisk helse som hvordan vi oppfatter oss selv og andre, hvordan vi har det i hverdagen og hvordan vi håndterer utfordringer. Det er et bredere felt enn kliniske diagnoser. I History Go skal begrepet derfor brukes til å undersøke erfaring, omgivelser og tjenester uten å gjøre vanlige følelser eller belastninger til sykdom.',
          'Helsenorge skiller også mellom psykiske vansker og psykiske lidelser. At noen viser uro, nedstemthet eller stress i en situasjon er ikke nok til å fastslå en lidelse. Denne grensen er grunnleggende for faget: observasjon kan beskrive situasjon og atferd, men diagnose krever klinisk utredning.',
          'Velferdsperspektivet utvider analysen fra individ til system. WHO framhever at community-baserte psykiske helsetjenester bør sees i sammenheng med bolig, utdanning, arbeid og sosial beskyttelse. Psykisk helse kan derfor undersøkes både som erfaring og som et spørsmål om hvordan støtte er organisert rundt hverdagslivet.'
        ],
        [['phi-01'], ['phi-02'], ['phi-03']],
        [
          'Bruk psykisk helse som et bredt analysebegrep, ikke som skjult diagnose.',
          'Skill individuell erfaring fra tjeneste- og velferdssystemet rundt personen.'
        ],
        [['phi-01', 'phi-02'], ['phi-03']]
      ),
      section(
        'phi-grunnlag-2',
        'Fra kommune og fastlege til DPS og sykehus',
        ['em_psy_omsorg_system', 'em_psy_behandling_omsorg', 'em_psy_byrom_psykisk_helse'],
        ['met_psy_systemanalyse', 'met_psy_steds_og_institusjonsanalyse', 'met_psy_praksisanalyse'],
        [
          'Dagens norske hjelpesystem har flere nivåer. Helsenorge peker på kommunen og fastlegen som sentrale innganger, mens mer spesialisert utredning og behandling kan skje ved distriktspsykiatrisk senter eller sykehus. Et stedskart over psykisk helse må derfor vise forbindelser mellom tjenester, ikke bare store institusjoner.',
          'Psykisk helsevern er spesialisthelsetjenestens undersøkelse og behandling av psykiske lidelser og foregår blant annet ved sykehus og DPS. Som hovedregel er vernet frivillig. Det betyr at «psykisk helsevern» ikke skal brukes som samleord for all psykisk helsehjelp i kommunen, skolen, fastlegekontoret eller frivillige tilbud.',
          'De nasjonale pasientforløpene er laget for mer helhetlige og forutsigbare forløp og legger vekt på samarbeid mellom tjenester. I en byanalyse blir overgangene viktige: reisevei, henvisning, kontaktpunkt og koordinering kan være like avgjørende analytiske spor som selve behandlingsbygget.'
        ],
        [['phi-04'], ['phi-05'], ['phi-06']],
        [
          'Kartlegg nivå, ansvar og overgang før du kaller et sted behandling.',
          'Et behandlingssystem er en kjede av relasjoner og institusjoner, ikke én adresse.'
        ],
        [['phi-04', 'phi-05'], ['phi-06']]
      ),
      section(
        'phi-grunnlag-3',
        'Behandlingsformer: sammenlign uten universell fasit',
        ['em_psy_behandlingsformer', 'em_psy_terapi_praksis'],
        ['met_psy_behandlingshistorisk_analyse', 'met_psy_praksisanalyse', 'met_psy_klinisk_analyse'],
        [
          'Psykisk helsehjelp omfatter ulike behandlingsformer og støtteformer. Helsenorge dokumenterer blant annet veiledet eBehandling basert på kognitiv atferdsterapi for bestemte tilstander, mens spesialistutdanningen i psykiatri omfatter psykoterapeutiske, medikamentelle og andre biologiske metoder. Et fagkapittel bør derfor sammenligne mål, ramme, målgruppe og beslutningsprosess i stedet for å rangere én metode som best for alle.',
          'Nasjonale pasientforløp legger opp til at behandling planlegges og evalueres med pasienten. Det er et viktig metodisk skille mellom å beskrive at et tiltak finnes, å dokumentere en generell anbefaling for en definert gruppe og å hevde at tiltaket vil virke for en bestemt person.',
          'Historisk behandlingsanalyse krever tidsmarkør. Metoder, lovgrunnlag, institusjonsstruktur og faglige idealer endrer seg. Det som dokumenteres ved et sykehusmuseum eller i et historisk arkiv skal derfor ikke presenteres som dagens standard uten en separat nåtidskilde.'
        ],
        [['phi-07'], ['phi-08'], ['phi-09']],
        [
          'Sammenlign behandlingsformer etter dokumentert målgruppe, ramme og beslutningsprosess.',
          'Historisk praksis og dagens praksis må alltid kildebelegges separat.'
        ],
        [['phi-07', 'phi-08'], ['phi-09']]
      )
    ],
    commonMisconceptions: [
      { claim: 'Psykisk helse betyr at man enten er frisk eller syk.', correction: 'Psykisk helse er et bredere og mer dynamisk begrep; klinisk diagnose er en annen type vurdering.', claimIds: ['phi-01', 'phi-02'] },
      { claim: 'All psykisk helsehjelp er psykisk helsevern.', correction: 'Psykisk helsevern er spesialisthelsetjeneste; kommune og fastlege har også sentrale roller.', claimIds: ['phi-04', 'phi-05'] }
    ]
  },
  '02-rettigheter-og-praksis.json': {
    schema: 'history_go_fagverk_chapter_module_v1',
    version: '1.0.0',
    subject_id: 'psykologi',
    chapter_id: CHAPTER_ID,
    module_id: 'rettigheter_og_praksis',
    title: 'Pasientrolle, relasjon, omsorg og makt',
    sections: [
      section(
        'phi-praksis-1',
        'Pasientrolle og medvirkning',
        ['em_psy_pasientrolle_erfaring', 'em_psy_terapi_praksis'],
        ['met_psy_erfaringsanalyse', 'met_psy_relational_analyse', 'met_psy_praksisanalyse'],
        [
          'Helsenorge beskriver brukermedvirkning som retten til å være med og bestemme i eget tjenestetilbud og til å få tilpasset informasjon. Pasientrollen er dermed ikke bare mottakerrollen; den omfatter rettigheter, valg, informasjon og mulighet til å formulere egne mål.',
          'I det nasjonale pasientforløpet skal første samtale blant annet avklare pasientens behov, mål og ønsker for utredning, behandling og oppfølging. Dette gjør samtalen til en analyserbar praksis: hvilke spørsmål stilles, hvilke mål blir dokumentert, og hvordan blir pasientens egen beskrivelse tatt inn i planen?',
          'Helsedirektoratets kvalitetsindikator for behandlingsplan bygger på at planen utarbeides i samarbeid mellom pasient og behandler, eventuelt med pårørende. For History Go betyr det at pasienterfaring må behandles som en egen evidenstype, ikke erstattes av institusjonens beskrivelse av hva den tilbyr.'
        ],
        [['phi-10'], ['phi-11'], ['phi-12']],
        [
          'Pasientrolle analyseres gjennom rettigheter, deltakelse og dokumentert praksis.',
          'Erfaringskilder og systemkilder svarer på forskjellige spørsmål.'
        ],
        [['phi-10', 'phi-11'], ['phi-12']]
      ),
      section(
        'phi-praksis-2',
        'Terapirommet er en sosial og institusjonell situasjon',
        ['em_psy_terapirom_relasyon', 'em_psy_terapi_praksis'],
        ['met_psy_rom_og_praksisanalyse', 'met_psy_relational_analyse', 'met_psy_diskursanalyse'],
        [
          'Et terapirom kan analyseres uten å tolke klientens indre liv. Rom, tidsramme, taushetsplikt, rollefordeling, journalføring, mål og samtaleform setter institusjonelle rammer rundt møtet. Det er disse dokumenterbare forholdene en stedlig analyse først skal beskrive.',
          'Det nasjonale pasientforløpet ber tjenesten avklare forventninger til kommunikasjon og samarbeid med pasienten. Relasjonell analyse kan derfor undersøke hvordan samarbeid organiseres og evalueres, men den kan ikke konkludere med at en bestemt relasjon er god eller dårlig ut fra utsiden.',
          'Digitale behandlingsformer viser at «terapirommet» ikke alltid er et fysisk rom. Helsenorge beskriver eBehandling som et digitalt program med oppfølging fra behandler. Rom- og praksisanalyse må derfor også undersøke teknologi, tilgang, kontaktform og hva som flyttes mellom synkrone møter og arbeid på egen hånd.'
        ],
        [['phi-13'], ['phi-14'], ['phi-15']],
        [
          'Analyser rammen for relasjonen før du tolker relasjonen.',
          'Terapirom kan være fysisk, digitalt eller hybrid.'
        ],
        [['phi-13', 'phi-14'], ['phi-15']]
      ),
      section(
        'phi-praksis-3',
        'Makt, tvang, omsorg og rettssikkerhet',
        ['em_psy_makt_omsorg', 'em_psy_behandling_omsorg'],
        ['met_psy_makt_og_omsorgsanalyse', 'met_psy_normkritisk_analyse', 'met_psy_systemanalyse'],
        [
          'Psykisk helsevernloven har som formål å sikre forsvarlig helsehjelp i samsvar med menneskerettigheter og rettssikkerhetsprinsipper, og loven skal bidra til å forebygge og begrense tvang. Dette gjør makt til et eksplisitt faglig tema: omsorg kan ikke analyseres uten å spørre hvem som kan fatte vedtak, på hvilket grunnlag og med hvilke kontrollordninger.',
          'Psykisk helsevern er som hovedregel frivillig, men loven åpner for tvang under bestemte vilkår. Helsenorge framhever at tvang bare skal brukes når vilkårene er oppfylt og at personlig integritet skal ivaretas. Kapittelet skal ikke lære brukeren å vurdere om et enkeltindivid oppfyller slike vilkår; det skal lære hvordan lov, beslutning og kontroll skilles.',
          'Kontrollkommisjonene skal ivareta rettssikkerhet, kontrollere vedtak, behandle klager og føre velferdskontroll. Pårørende har dessuten særskilte rettigheter i deler av tvangsvernet. Et institusjonscase må derfor undersøke både behandlingsorganisasjonen og de instansene som kan kontrollere den.'
        ],
        [['phi-16'], ['phi-17'], ['phi-18']],
        [
          'Skill behandlingsmakt, lovhjemmel og kontrollinstans.',
          'Tvang er et rettslig regulert unntaksfelt, ikke en generell egenskap ved psykisk helsehjelp.'
        ],
        [['phi-16', 'phi-18'], ['phi-17']]
      )
    ],
    commonMisconceptions: [
      { claim: 'Pasientmedvirkning betyr at behandleren ikke har faglig ansvar.', correction: 'Medvirkning og faglig ansvar eksisterer samtidig; poenget er at informasjon, mål og valg ikke skal behandles som om pasientens perspektiv er irrelevant.', claimIds: ['phi-10', 'phi-11', 'phi-12'] },
      { claim: 'Tvang beskriver hele psykisk helsevern.', correction: 'Psykisk helsevern er som hovedregel frivillig; tvang er særskilt lovregulert.', claimIds: ['phi-16', 'phi-17'] }
    ]
  },
  '03-institusjon-sted-og-krise.json': {
    schema: 'history_go_fagverk_chapter_module_v1',
    version: '1.0.0',
    subject_id: 'psykologi',
    chapter_id: CHAPTER_ID,
    module_id: 'institusjon_sted_og_krise',
    title: 'Institusjonshistorie, krise og by',
    sections: [
      section(
        'phi-sted-1',
        'Institusjonshistorie: Gaustad, Dikemark og Vinderen',
        ['em_psy_institusjoner_psykiatri'],
        ['met_psy_institusjonshistorisk_analyse', 'met_psy_behandlingshistorisk_analyse', 'met_psy_steds_og_institusjonsanalyse'],
        [
          'Gaustad sykehus åpnet for pasienter i 1855 og omtales i Oslo byleksikon som Norges første formålsbygde psykiatriske sykehus. Selve anlegget gjør det mulig å analysere hvordan 1800-tallets institusjonsidé ble materialisert i arkitektur, avstand, intern organisering og en tydelig institusjonsgrense.',
          'Dikemark psykiatriske sykehusmuseum dokumenterer sykehusets historie fra 1905 og viser blant annet pasientarbeid, isolat, kjøkken, vaktrom og behandlingsformer gjennom tidene. Museet er særlig nyttig fordi det gjør hverdagspraksis og materiell kultur synlig, men utstillingene må fortsatt leses som kuratert historisk dokumentasjon.',
          'Psykiatrisk avdeling på Vinderen åpnet i 1926 som Universitetets psykiatriske klinikk og overtok undervisningsoppgaver fra Gaustad. Sammenstillingen av Gaustad, Dikemark og Vinderen viser at institusjonshistorie ikke bare er en lineær bevegelse fra «gammelt» til «nytt»; undervisning, forskning, døgnbehandling og organisering har vært fordelt forskjellig over tid.'
        ],
        [['phi-19'], ['phi-20'], ['phi-21']],
        [
          'Les bygning, organisasjon og behandling som separate historiske lag.',
          'Museer og byhistoriske oppslag er kilder til institusjonshistorie, ikke dagens kliniske fasit.'
        ],
        [['phi-19', 'phi-20', 'phi-21'], ['phi-20']]
      ),
      section(
        'phi-sted-2',
        'Kriseintervensjon og kontinuitet',
        ['em_psy_krise_intervensjon', 'em_psy_omsorg_system'],
        ['met_psy_krisepsykologisk_analyse', 'met_psy_risiko_og_resiliensanalyse', 'met_psy_systemanalyse', 'met_psy_stressanalyse'],
        [
          'Krisehjelp må skilles fra langvarig behandling. Helsenorge beskriver akutte kontaktveier gjennom 113 ved kritiske situasjoner og legevakt når hjelpen haster mindre, samtidig som kommunale tjenester og DPS kan inngå i videre oppfølging. Analytisk handler dette om hastegrad, ansvar og overgang, ikke om å gi individuell triage i appen.',
          'WHO beskriver person- og rettighetsorienterte krisetjenester som tjenester som skal støtte mennesker i akutt psykisk belastning med respekt for juridisk handleevne og menneskerettigheter. Dette er en internasjonal normativ tjenestemodell; den må ikke forveksles med en beskrivelse av at alle norske krisesituasjoner håndteres på samme måte.',
          'Kontinuitet blir synlig når en krise er over: Helsenorge og Helsedirektoratet beskriver samarbeid mellom fastlege, kommune og spesialisthelsetjeneste, og pasientforløpet krever samhandling ved overganger. Kriseanalyse bør derfor spørre hva som skjer før, under og etter den akutte kontakten.'
        ],
        [['phi-22'], ['phi-23'], ['phi-24']],
        [
          'Skill akutt kontaktvei fra individuell klinisk vurdering.',
          'Følg overgangene etter krisen, ikke bare det akutte øyeblikket.'
        ],
        [['phi-22'], ['phi-24']]
      ),
      section(
        'phi-sted-3',
        'Byrom, nærmiljø og velferd',
        ['em_psy_byrom_psykisk_helse', 'em_psy_velferd_psykisk_helse'],
        ['met_psy_steds_og_institusjonsanalyse', 'met_psy_velferdspsykologisk_analyse', 'met_psy_offentlighetsanalyse', 'met_psy_traumeanalyse'],
        [
          'WHO legger vekt på community-baserte tilbud nær menneskers hverdagsliv og på koblinger til bolig, utdanning, arbeid og sosial deltakelse. Dette gjør byrom relevant for psykologi, men ikke som enkel årsaksforklaring: et område kan kartlegges etter tilgang til tjenester, møteplasser, transport og støtte uten å klassifisere beboernes psykiske helse.',
          'WHO beskriver også oppsøkende tjenester som kan gi støtte i hjem eller offentlige miljøer. Stedsanalysen må derfor inkludere tjenester som beveger seg, ikke bare institusjoner brukeren må reise til. Tilgang kan handle om geografi, terskel, åpningstid, henvisning og sosial inkludering.',
          'Psykologisk institutt ved UiO er det eneste allerede materialiserte Psykologi-stedet i Oslo i denne leveransen. Det brukes som fagmiljøcase, ikke som generelt behandlingssted. Gaustad, Dikemark og Vinderen er foreløpig dokumenterte institusjonscase og skal ikke få oppdiktede place-ID-er før egne stedskort er materialisert.'
        ],
        [['phi-25'], ['phi-26'], ['phi-27']],
        [
          'Byanalyse kan beskrive tilgang og institusjonsgeografi uten å diagnostisere nabolag.',
          'Skill et dokumentert faglig case fra et faktisk materialisert HG-sted.'
        ],
        [['phi-25', 'phi-26'], ['phi-27']]
      )
    ],
    commonMisconceptions: [
      { claim: 'Store psykiatriske institusjoner kan leses som én uforandret behandlingsmodell.', correction: 'Bygninger, organisering, lovverk, behandling og pasientroller har endret seg og må dateres separat.', claimIds: ['phi-19', 'phi-20', 'phi-21'] },
      { claim: 'Et nabolag eller byrom avslører innbyggernes psykiske helse.', correction: 'Stedsanalyse kan undersøke tilgang, belastninger og støtteordninger; den diagnostiserer ikke individer eller områder.', claimIds: ['phi-25', 'phi-26'] }
    ]
  }
};

const sources = [
  {
    id: 'src-phvl-2026',
    publisher: 'Lovdata',
    title: 'Lov om etablering og gjennomføring av psykisk helsevern (psykisk helsevernloven)',
    url: 'https://lovdata.no/dokument/NL/lov/1999-07-02-62',
    source_location: '§ 1-1 og lovens kapittelstruktur; gjeldende endringer fra 1. juni 2026',
    type: 'law',
    label: 'Psykisk helsevernloven, gjeldende 2026'
  },
  {
    id: 'src-phvf-2026',
    publisher: 'Lovdata',
    title: 'Forskrift om etablering og gjennomføring av psykisk helsevern m.m.',
    url: 'https://lovdata.no/dokument/SF/forskrift/2026-05-29-941',
    source_location: 'forskriftens metadata og kapitler om gjennomføring, kontroll og saksbehandling',
    type: 'regulation',
    label: 'Psykisk helsevernforskriften 2026'
  },
  {
    id: 'src-helsenorge-voksne',
    publisher: 'Helsenorge / Helsedirektoratet',
    title: 'Psykisk helsehjelp for voksne',
    url: 'https://www.helsenorge.no/psykisk-helse/psykisk-helsehjelp-for-voksne/',
    source_location: 'seksjonene om kommune, fastlege, DPS/sykehus og akutt hjelp',
    type: 'official_health',
    label: 'Helsenorge: psykisk helsehjelp for voksne'
  },
  {
    id: 'src-helsenorge-hjelp',
    publisher: 'Helsenorge / Helsedirektoratet',
    title: 'Hjelp og behandling ved psykiske problemer',
    url: 'https://www.helsenorge.no/psykisk-helse/hjelp-og-behandling/',
    source_location: 'seksjonene Her kan du få hjelp og Relevante rettigheter',
    type: 'official_health',
    label: 'Helsenorge: hjelp, behandling og rettigheter'
  },
  {
    id: 'src-helsenorge-vern',
    publisher: 'Helsenorge / Helsedirektoratet',
    title: 'Psykisk helsevern',
    url: 'https://www.helsenorge.no/sykdom/psykiske-lidelser/psykisk-helsevern',
    source_location: 'innledningen om spesialisthelsetjeneste, frivillighet, sykehus og DPS',
    type: 'official_health',
    label: 'Helsenorge: psykisk helsevern'
  },
  {
    id: 'src-helsenorge-tvang',
    publisher: 'Helsenorge / Helsedirektoratet',
    title: 'Psykisk helsevern – tvungent',
    url: 'https://www.helsenorge.no/sykdom/psykiske-lidelser/psykisk-helsevern/tvungent-psykisk-helsevern/',
    source_location: 'seksjonene Vern om personlig integritet og Når er det lov å bruke tvang?',
    type: 'official_health',
    label: 'Helsenorge: tvungent psykisk helsevern'
  },
  {
    id: 'src-helsenorge-forlop',
    publisher: 'Helsenorge / Helsedirektoratet',
    title: 'Nasjonalt pasientforløp for psykisk helse og rus',
    url: 'https://www.helsenorge.no/psykisk-helse/pasientforlop-for-psykisk-helse-og-rus/',
    source_location: 'innledningen om helhetlig og forutsigbart forløp og medvirkning',
    type: 'official_health',
    label: 'Helsenorge: nasjonale pasientforløp'
  },
  {
    id: 'src-helsedir-forlop',
    publisher: 'Helsedirektoratet',
    title: 'Psykiske lidelser – voksne',
    url: 'https://www.helsedirektoratet.no/nasjonale-forlop/psykiske-lidelser-voksne',
    source_location: 'kapittel 4–6 om utredning, behandling, evaluering og videre oppfølging',
    type: 'official_guidance',
    label: 'Helsedirektoratet: nasjonalt pasientforløp voksne'
  },
  {
    id: 'src-helsedir-utredning',
    publisher: 'Helsedirektoratet',
    title: 'Utredning i spesialisthelsetjenesten',
    url: 'https://www.helsedirektoratet.no/nasjonale-forlop/psykiske-lidelser-voksne/utredning-i-spesialisthelsetjenesten',
    source_location: 'seksjonen Første samtale',
    type: 'official_guidance',
    label: 'Helsedirektoratet: første samtale'
  },
  {
    id: 'src-helsedir-medvirkning',
    publisher: 'Helsedirektoratet',
    title: 'Medvirkning i egen behandling – involvering i behandlingsplan, psykisk helsevern voksne',
    url: 'https://www.helsedirektoratet.no/statistikk/kvalitetsindikatorer/psykisk-helse-for-voksne/medvirkning-i-egen-behandling-involvering-i-behandlingsplan-psykisk-helsevern-voksne',
    source_location: 'seksjonen Om indikatoren',
    type: 'official_indicator',
    label: 'Helsedirektoratet: behandlingsplan og medvirkning'
  },
  {
    id: 'src-helsedir-kontroll',
    publisher: 'Helsedirektoratet',
    title: '§ 6-1. Kontrollkommisjonen',
    url: 'https://www.helsedirektoratet.no/rundskriv/psykisk-helsevernloven-med-kommentarer/kontroll-og-etterproving/6-1-kontrollkommisjonen',
    source_location: 'kommentar til § 6-1, oppdatert for endringer fra 1. juni 2026',
    type: 'official_legal_guidance',
    label: 'Helsedirektoratet: kontrollkommisjonen'
  },
  {
    id: 'src-helsedir-parorende',
    publisher: 'Helsedirektoratet',
    title: 'Pårørendes rettigheter i psykisk helsevern',
    url: 'https://www.helsedirektoratet.no/veiledere/parorendes-rettigheter-i-psykisk-helsevern',
    source_location: 'kapittel 6 om særskilte rettigheter ved tvungent psykisk helsevern',
    type: 'official_legal_guidance',
    label: 'Helsedirektoratet: pårørendes rettigheter'
  },
  {
    id: 'src-helsenorge-ebehandling',
    publisher: 'Helsenorge / Sykehuset i Vestfold HF',
    title: 'eBehandling for depresjon, sosial angst og panikklidelse',
    url: 'https://www.helsenorge.no/psykisk-helse/hjelp-og-behandling/ebehandling/',
    source_location: 'seksjonen Hva er eBehandling?',
    type: 'official_health',
    label: 'Helsenorge: veiledet eBehandling'
  },
  {
    id: 'src-who-guidance',
    publisher: 'World Health Organization',
    title: 'Guidance on community mental health services: Promoting person-centred and rights-based approaches',
    url: 'https://www.who.int/publications/i/item/9789240025707',
    source_location: 'Overview',
    type: 'international_guidance',
    label: 'WHO: rights-based community mental health guidance'
  },
  {
    id: 'src-who-crisis',
    publisher: 'World Health Organization',
    title: 'Mental health crisis services: promoting person-centred and rights-based approaches',
    url: 'https://www.who.int/publications/i/item/9789240025721',
    source_location: 'Overview',
    type: 'international_guidance',
    label: 'WHO: mental health crisis services'
  },
  {
    id: 'src-who-centres',
    publisher: 'World Health Organization',
    title: 'Community mental health centres: Promoting person-centred and rights-based approaches',
    url: 'https://www.who.int/publications/i/item/9789240025769',
    source_location: 'Overview',
    type: 'international_guidance',
    label: 'WHO: community mental health centres'
  },
  {
    id: 'src-who-outreach',
    publisher: 'World Health Organization',
    title: 'Community outreach mental health services: Promoting person-centred and rights-based approaches',
    url: 'https://www.who.int/publications/i/item/9789240025806',
    source_location: 'Overview',
    type: 'international_guidance',
    label: 'WHO: community outreach mental health services'
  },
  {
    id: 'src-ous-dikemark',
    publisher: 'Oslo universitetssykehus HF',
    title: 'Dikemark psykiatriske sykehusmuseum',
    url: 'https://www.oslo-universitetssykehus.no/steder/dikemark/dikemark-psykiatriske-sykehusmuseum',
    source_location: 'innledningen og avsnittet om samlingen fra 1905 og temarommene',
    type: 'official_institution_history',
    label: 'OUS: Dikemark psykiatriske sykehusmuseum'
  },
  {
    id: 'src-oslobyleksikon-gaustad',
    publisher: 'Oslo byleksikon',
    title: 'Gaustad sykehus',
    url: 'https://oslobyleksikon.no/side/Gaustad_sykehus',
    source_location: 'seksjonen Historikk',
    type: 'institution_history',
    label: 'Oslo byleksikon: Gaustad sykehus'
  },
  {
    id: 'src-oslobyleksikon-vinderen',
    publisher: 'Oslo byleksikon',
    title: 'Psykiatrisk avdeling, Vinderen',
    url: 'https://oslobyleksikon.no/side/Psykiatrisk_avdeling%2C_Vinderen',
    source_location: 'hovedoppslaget om åpningen i 1926 og organisatorisk utvikling',
    type: 'institution_history',
    label: 'Oslo byleksikon: Psykiatrisk avdeling, Vinderen'
  },
  {
    id: 'src-hg-uio-place',
    publisher: 'History Go',
    title: 'Psykologisk institutt, UiO – canonical place record',
    url: 'data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json',
    source_location: 'id, name, desc, popupDesc og externalLinks',
    type: 'internal_place_record',
    label: 'History Go: Psykologisk institutt, UiO'
  }
];

const claims = [
  { id: 'phi-01', claim: 'Helsenorge bruker psykisk helse som et bredt begrep om hvordan mennesker oppfatter seg selv og andre, har det i hverdagen og håndterer utfordringer.', source_ids: ['src-helsenorge-hjelp'], kind: 'definition' },
  { id: 'phi-02', claim: 'Psykiske symptomer eller vansker er ikke i seg selv det samme som en psykisk lidelse; kapittelet må derfor ikke bruke observasjon som diagnose.', source_ids: ['src-helsenorge-voksne'], kind: 'boundary' },
  { id: 'phi-03', claim: 'WHO knytter community-baserte psykiske helsetjenester til sosial inkludering og forbindelser med blant annet bolig, utdanning, arbeid og sosial beskyttelse.', source_ids: ['src-who-guidance', 'src-who-centres'], kind: 'system' },
  { id: 'phi-04', claim: 'Kommunen og fastlegen er sentrale innganger til psykisk helsehjelp, mens mer spesialisert behandling kan skje ved DPS eller sykehus.', source_ids: ['src-helsenorge-voksne'], kind: 'current_service' },
  { id: 'phi-05', claim: 'Psykisk helsevern er spesialisthelsetjeneste og er som hovedregel frivillig.', source_ids: ['src-helsenorge-vern'], kind: 'current_service' },
  { id: 'phi-06', claim: 'Nasjonale pasientforløp skal støtte helhetlige og forutsigbare forløp og samarbeid på tvers av tjenester.', source_ids: ['src-helsenorge-forlop', 'src-helsedir-forlop'], kind: 'current_service' },
  { id: 'phi-07', claim: 'Norske psykiske helsetjenester omfatter flere behandlingsformer; eBehandling er ett dokumentert eksempel på veiledet digital behandling basert på kognitiv atferdsterapi for definerte tilstander.', source_ids: ['src-helsenorge-ebehandling'], kind: 'treatment_form' },
  { id: 'phi-08', claim: 'Nasjonale pasientforløp legger opp til planlegging og evaluering av behandling med pasientmedvirkning.', source_ids: ['src-helsedir-forlop', 'src-helsedir-medvirkning'], kind: 'treatment_process' },
  { id: 'phi-09', claim: 'Historiske behandlingsformer må dateres og kan ikke brukes som dokumentasjon for dagens standard uten en aktuell kilde.', source_ids: ['src-ous-dikemark', 'src-phvl-2026', 'src-phvf-2026'], kind: 'method_rule' },
  { id: 'phi-10', claim: 'Helsenorge beskriver brukermedvirkning som en rett til informasjon og til å delta i utformingen av eget tjenestetilbud.', source_ids: ['src-helsenorge-hjelp'], kind: 'rights' },
  { id: 'phi-11', claim: 'Første samtale i nasjonalt pasientforløp skal blant annet avklare pasientens behov, mål og ønsker for utredning, behandling og oppfølging.', source_ids: ['src-helsedir-utredning'], kind: 'practice' },
  { id: 'phi-12', claim: 'Helsedirektoratets indikator for medvirkning bygger på at behandlingsplan utarbeides i samarbeid mellom pasient og behandler, eventuelt med pårørende.', source_ids: ['src-helsedir-medvirkning'], kind: 'practice' },
  { id: 'phi-13', claim: 'Terapi- og behandlingsmøter foregår innen institusjonelle rammer som kan analyseres uten å trekke diagnostiske slutninger om personen.', source_ids: ['src-helsedir-utredning', 'src-helsedir-forlop'], kind: 'method_rule' },
  { id: 'phi-14', claim: 'Det nasjonale pasientforløpet ber tjenesten avklare forventninger til kommunikasjon og samarbeid.', source_ids: ['src-helsedir-utredning'], kind: 'practice' },
  { id: 'phi-15', claim: 'Veiledet eBehandling kombinerer et digitalt behandlingsprogram med oppfølging fra behandler i spesialisthelsetjenesten.', source_ids: ['src-helsenorge-ebehandling'], kind: 'treatment_form' },
  { id: 'phi-16', claim: 'Psykisk helsevernloven skal sikre forsvarlig helsehjelp i samsvar med menneskerettigheter og rettssikkerhetsprinsipper og bidra til å forebygge og begrense tvang.', source_ids: ['src-phvl-2026'], kind: 'law' },
  { id: 'phi-17', claim: 'Tvang i psykisk helsevern er særskilt lovregulert; personlig integritet og rettslige vilkår må holdes adskilt fra individuell klinisk vurdering i dette lærematerialet.', source_ids: ['src-phvl-2026', 'src-phvf-2026', 'src-helsenorge-tvang'], kind: 'law' },
  { id: 'phi-18', claim: 'Kontrollkommisjonen har en rettssikkerhetsrolle i psykisk helsevern, og pårørende har særskilte rettigheter i deler av tvangsvernet.', source_ids: ['src-helsedir-kontroll', 'src-helsedir-parorende'], kind: 'rights' },
  { id: 'phi-19', claim: 'Gaustad sykehus åpnet for pasienter i 1855 og omtales som Norges første formålsbygde psykiatriske sykehus.', source_ids: ['src-oslobyleksikon-gaustad'], kind: 'history' },
  { id: 'phi-20', claim: 'Dikemark psykiatriske sykehusmuseum dokumenterer historie fra 1905 og viser blant annet pasientarbeid, isolat, kjøkken, vaktrom og behandlingsformer gjennom tidene.', source_ids: ['src-ous-dikemark'], kind: 'history' },
  { id: 'phi-21', claim: 'Psykiatrisk avdeling på Vinderen åpnet i 1926 som Universitetets psykiatriske klinikk og overtok undervisningsoppgaver fra Gaustad.', source_ids: ['src-oslobyleksikon-vinderen'], kind: 'history' },
  { id: 'phi-22', claim: 'Helsenorge skiller kritiske akutte situasjoner fra mindre akutte behov og beskriver ulike kontaktveier; History Go bruker dette kun deskriptivt og gir ikke individuell triage.', source_ids: ['src-helsenorge-voksne'], kind: 'crisis_boundary' },
  { id: 'phi-23', claim: 'WHO har en normativ modell for person- og rettighetsorienterte krisetjenester som skal støtte mennesker i akutt psykisk belastning med respekt for menneskerettigheter.', source_ids: ['src-who-crisis'], kind: 'international_guidance' },
  { id: 'phi-24', claim: 'Norske pasientforløp legger vekt på samhandling ved overganger mellom spesialisthelsetjenesten og andre tjenester.', source_ids: ['src-helsedir-forlop'], kind: 'current_service' },
  { id: 'phi-25', claim: 'WHO anbefaler community-baserte psykiske helsetjenester som er nær menneskers hverdagsliv og støtter sosial inkludering.', source_ids: ['src-who-guidance', 'src-who-centres'], kind: 'international_guidance' },
  { id: 'phi-26', claim: 'WHO beskriver oppsøkende psykiske helsetjenester som støtte som kan gis i hjem og offentlige miljøer.', source_ids: ['src-who-outreach'], kind: 'international_guidance' },
  { id: 'phi-27', claim: 'Psykologisk institutt, UiO er et materialisert History Go-sted, mens Gaustad, Dikemark og Vinderen i dette kapittelet er faglige case uten oppdiktede runtime-place-ID-er.', source_ids: ['src-hg-uio-place'], kind: 'internal_contract' }
];

const claimsDoc = {
  schema: 'history_go_fagverk_chapter_claims_v1',
  version: '1.0.0',
  subject_id: 'psykologi',
  chapter_id: CHAPTER_ID,
  source_policy: {
    canonicalFilesAreNotExternalEvidence: true,
    legalClaimsRequireCurrentLegalSource: true,
    noDiagnosisOfIndividuals: true,
    noIndividualTreatmentAdvice: true,
    verified_at: '2026-08-11'
  },
  sources,
  claims
};

function validateContent() {
  assert(new Set(emneIds).size === 12, 'Kapittelet må ha 12 unike emner');
  assert(new Set(methodIds).size === 18, 'Kapittelet må ha 18 unike metoder');
  assert(Object.keys(modules).length === 3, 'Kapittelet må ha tre moduler');
  const sections = Object.values(modules).flatMap((module) => module.sections || []);
  assert(sections.length === 9, 'Kapittelet må ha ni seksjoner');
  const paragraphs = sections.flatMap((item) => item.paragraphs || []);
  assert(paragraphs.length === 27, 'Kapittelet må ha 27 fagavsnitt');
  const paragraphTrace = sections.flatMap((item) => item.paragraphClaimIds || []);
  assert(paragraphTrace.length === paragraphs.length, 'Alle fagavsnitt må ha claimspor');
  assert(paragraphTrace.every((ids) => Array.isArray(ids) && ids.length >= 1), 'Fagavsnitt mangler claim-ID');
  assert(sources.length >= 15, 'Kapittelet må ha minst 15 inspiserbare kilder');
  assert(claims.length >= 24, 'Kapittelet må ha minst 24 claims');
  const claimIds = new Set(claims.map((claim) => claim.id));
  assert(claimIds.size === claims.length, 'Dupliserte claim-ID-er');
  assert(paragraphTrace.flat().every((id) => claimIds.has(id)), 'Fagavsnitt peker til ukjent claim');
  const sourceIds = new Set(sources.map((source) => source.id));
  assert(claims.every((claim) => claim.source_ids?.length && claim.source_ids.every((id) => sourceIds.has(id))), 'Claim mangler gyldig kilde');
  assert(sources.every((source) => source.url && source.source_location && source.label), 'Kilde mangler URL, kildeplassering eller label');
  const coveredEmnes = new Set(sections.flatMap((item) => item.emne_ids || []));
  assert(emneIds.every((id) => coveredEmnes.has(id)) && [...coveredEmnes].every((id) => emneIds.includes(id)), 'Seksjonene dekker ikke nøyaktig de 12 canonicale emnene');
  const usedMethods = new Set(sections.flatMap((item) => item.method_ids || []));
  assert(methodIds.every((id) => usedMethods.has(id)) && [...usedMethods].every((id) => methodIds.includes(id)), 'Seksjonene bruker ikke nøyaktig de 18 required metodene');
  assert(chapter.doNotDiagnosePeople === true && brief.safety.doNotDiagnosePeople === true, 'Diagnosevernet mangler');
}

function validateCanonicalSources() {
  const pensum = readJson('data/fag/psykologi/psykologipensum_canonical_v4_5.json');
  const methods = readJson('data/fag/psykologi/methods_psykologi_canonical_v4_5.json');
  const domain = pensum.domains.find((item) => item.domain_id === DOMAIN_ID);
  assert(domain, `Mangler canonicalt domene ${DOMAIN_ID}`);
  assert(JSON.stringify(domain.emne_ids) === JSON.stringify(emneIds), 'Kapittelets emne-ID-er avviker fra canonical domenerekkefølge');
  const canonicalMethodIds = new Set(methods.methods.map((item) => item.method_id));
  assert(methodIds.every((id) => canonicalMethodIds.has(id)), 'Kapittelet peker til ukjent canonical metode');
}

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.psykologi;
  assert(subject, 'Psykologi mangler i fagverkregisteret');
  assert(Array.isArray(subject.chapters), 'Psykologi mangler kapittelliste');
  const registryChapter = {
    id: CHAPTER_ID,
    title: chapter.title,
    subtitle: chapter.subtitle,
    file: CHAPTER_FILE,
    primary_domain_id: DOMAIN_ID,
    chapter_role: 'core',
    emne_ids: emneIds,
    claimsFile: `${CHAPTER_DIR}/claims.json`,
    briefFile: `${CHAPTER_DIR}/brief.json`
  };
  const existingIndex = subject.chapters.findIndex((item) => item.id === CHAPTER_ID);
  if (existingIndex >= 0) subject.chapters[existingIndex] = registryChapter;
  else subject.chapters.push(registryChapter);
  subject.canonicalModel = {
    ...(subject.canonicalModel || {}),
    note: 'Psykologifagets seks canonicale fagområder eier rendererstrukturen. Alle 58 aktive emner er dekket i pensum, fagkart og mappingregister. Første redaksjonelle kapittel materialiserer Psykisk helse, institusjoner og behandling med 12/12 emner, 18 metoder, 27 claimsporede fagavsnitt og eksplisitt diagnosevern.'
  };
  subject.editorialPlan = {
    targetChapterCount: 6,
    completionRequirements: [
      'all_canonical_domains_covered',
      'all_canonical_emners_covered_exactly_once',
      'all_canonical_methods_resolved',
      'paragraph_claim_trace_complete',
      'minimum_15_external_sources_per_chapter',
      'do_not_diagnose_people_guard',
      'full_subject_audit_green'
    ],
    nextGate: subject.chapters.length === 6 ? 'full_subject_audit' : 'remaining_domain_chapter_production'
  };
  registry.version = '2.65.0';
  registry.updatedAt = '2026-08-11';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((item) => item.id === 'psykologi');
  assert(subject, 'Psykologi mangler i subject_status');
  subject.editorialStatus = 'chapters_in_progress';
  subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Psykologi har seks canonicale fagområder og 58 aktive emner. Første område, Psykisk helse, institusjoner og behandling, er nå materialisert som fulltekstkapittel med 12/12 emner, 18 canonicale metoder, 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 27 verifiserte claims og 21 inspiserbare kilderegistreringer. Diagnosevernet er bindende. Fem canonicale kapitler gjenstår.';
  status.version = '1.53.0';
  status.updatedAt = '2026-08-11';
  writeJson(STATUS_FILE, status);
}

function main() {
  validateContent();
  validateCanonicalSources();
  writeJson(CHAPTER_FILE, chapter);
  writeJson(`${CHAPTER_DIR}/brief.json`, brief);
  for (const [file, value] of Object.entries(modules)) writeJson(`${CHAPTER_DIR}/${file}`, value);
  writeJson(`${CHAPTER_DIR}/claims.json`, claimsDoc);
  updateRegistry();
  updateStatus();
  console.log(`Materialiserte Psykologi ${DOMAIN_ID}: 12/12 emner, 18 metoder, 3 moduler, 9 seksjoner, 27 avsnitt, ${claims.length} claims og ${sources.length} kilder.`);
}

main();
