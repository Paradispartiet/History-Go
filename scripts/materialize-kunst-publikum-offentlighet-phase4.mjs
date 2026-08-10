#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'publikum-og-offentlighet';
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
  'em_kunst_offentlig_kunst_monumenter',
  'em_kunst_publikum_klasse_og_kapital',
  'em_kunst_digital_offentlighet_og_resepsjon'
];

const methodIds = [
  'met_kunst_ikonografisk_analyse',
  'met_kunst_formanalyse',
  'met_kunst_kunsthistorisk_kontekstualisering',
  'met_kunst_kritikk_og_diskursanalyse',
  'met_kunst_offentlig_rom_analyse',
  'met_kunst_resepsjonsanalyse',
  'met_kunst_stedsspesifikk_analyse',
  'met_kunst_digital_sirkulasjonsanalyse',
  'met_kunst_plattformanalyse',
  'met_kunst_feltanalyse',
  'met_kunst_materialitetsanalyse',
  'met_kunst_praksis_og_prosessanalyse',
  'met_kunst_komparativ_verkanalyse'
];

const relatedPlaces = [
  { id: 'vigelandsparken', name: 'Vigelandsparken', role: 'Undersøk monument, fri fortolkning, bruk og sirkulasjon i et alltid åpent offentlig parkanlegg.' },
  { id: 'ekebergparken', name: 'Ekebergparken', role: 'Analyser fri adgang, terrengterskler, privat finansiering og nye motmonumenter i samme offentlige rom.' },
  { id: 'nasjonalmuseet', name: 'Nasjonalmuseet', role: 'Sammenlign fysisk tilgjengelighet, formidling, publikumsdata og den søkbare digitale samlingen.' },
  { id: 'munch_museet', name: 'MUNCH', role: 'Følg hvordan katalog, reproduksjonsvilkår, universell utforming og digitale grensesnitt former møtet med kunsten.' }
];

const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({
  id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds
});

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'kunst', subject_id: 'kunst',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'publikum_offentlighet',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Publikum og offentlighet: hvor og hvordan kunst blir felles',
  subtitle: 'Fra monument, park og museumsterskel til digital katalog, plattform og dokumentert resepsjon',
  lead: 'Kunst blir offentlig gjennom rom, adgang, formidling, bruk, debatt og digitale grensesnitt. Kapittelet lærer brukeren å skille tilgjengelig tilbud fra faktisk deltakelse, besøkstall fra publikumsstruktur og digital sirkulasjon fra dokumentert fortolkning.',
  learningObjectives: [
    'analysere offentlig kunst som verk, sted, brukssituasjon og forvaltningsstruktur',
    'skille monumentets dokumenterte ikonografi fra skiftende offentlig resepsjon',
    'kartlegge økonomiske, fysiske, språklige, sosiale og digitale terskler',
    'skille fri adgang, formell tilgjengelighet og faktisk bruk',
    'bruke besøkstall uten å gjøre antall til bevis på representativ deltakelse',
    'analysere formidling og deltakelse som institusjonelle valg',
    'undersøke digitale kataloger og plattformer som kuraterende infrastrukturer',
    'skille visninger, delinger og rekkevidde fra dokumentert resepsjon'
  ],
  diagnosticQuestions: [
    { question: 'Er kunst offentlig bare fordi den står utendørs?', answer: 'Nei. Eierskap, adgang, vedlikehold, ruter, skilt, sikkerhet og faktisk bruk former offentligheten.' },
    { question: 'Beviser gratis adgang at alle har lik tilgang?', answer: 'Nei. Terreng, transport, språk, tid, funksjonsevne og sosial fortrolighet kan fortsatt virke som terskler.' },
    { question: 'Viser høye besøkstall hvem museet når?', answer: 'Bare delvis. Antall må suppleres med data om sammensetning, bruksmåter og dem som ikke deltar.' },
    { question: 'Er et digitalisert verk automatisk synlig?', answer: 'Nei. Metadata, søk, rangering, rettigheter, språk og grensesnitt styrer hva som kan finnes og brukes.' }
  ],
  relatedPlaces,
  moduleFiles: [CHAPTER_DIR + '/01-grunnlag.json', CHAPTER_DIR + '/02-fordypning.json', CHAPTER_DIR + '/03-anvendelse.json'],
  briefFile: CHAPTER_DIR + '/brief.json', claimsFile: CHAPTER_DIR + '/claims.json'
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'kunst',
  chapter_id: CHAPTER_ID, primary_domain_id: 'publikum_offentlighet',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Kunst-domenet Publikum og offentlighet med sted-, publikums- og plattformbasert undervisning i offentlig kunst, monumenter, klasse, kapital, tilgjengelighet og digital resepsjon.',
  audience: 'Brukere som skal kunne undersøke hvem kunsten faktisk møter uten å forveksle fri adgang, universell utforming, besøkstall, publisering eller digital rekkevidde med lik deltakelse og bestemt virkning.',
  learningArc: [
    'lese offentlig kunst som verk i en konkret brukssituasjon',
    'skille monumentets form og ikonografi fra offentlig resepsjon',
    'kartlegge terskler utover billettpris',
    'bruke publikumsdata med riktig evidensnivå',
    'analysere formidling og deltakelse som institusjonelle innganger',
    'lese digital katalog og grensesnitt som kuratering',
    'skille sirkulasjon fra dokumentert fortolkning',
    'avslutte med en komparativ offentlighetsmatrise for fire Oslo-steder'
  ],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'offentlig plassering vs faktisk offentlighet', 'fri adgang vs lik tilgang',
    'formell tilgjengelighet vs faktisk bruk', 'besøkstall vs publikumsstruktur',
    'kunstnerintensjon vs resepsjon', 'ikonografi vs senere tolkning',
    'deltakelsestilbud vs delt beslutningsmakt', 'digitalisering vs synlighet',
    'sirkulasjon vs resepsjon', 'plattformmåling vs fortolkning',
    'søkbarhet vs fullstendig representasjon'
  ],
  sourceStrategy: {
    priority: [
      'Vigelandmuseets verk-, park- og resepsjonsdokumentasjon',
      'Ekebergparkens historie-, verk-, adgangs- og tilgjengelighetsdokumentasjon',
      'Nasjonalmuseets publikums-, tilgjengelighets- og digitale samlingskilder',
      'MUNCHs katalog-, tilgjengelighets-, reproduksjons- og digitaliseringskilder'
    ],
    minimumExternalSources: 15, claimLevelTrace: true, sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: [
      'offentlig kunst, monument, sted, bruk og resepsjon',
      'publikum, klasse, kulturell kapital og terskler',
      'universell utforming, formidling og deltakelse',
      'digital katalog, søk, metadata, reproduksjon, plattform og sirkulasjon',
      'Vigelandsparken, Ekebergparken, Nasjonalmuseet og MUNCH som canonicale stedscase'
    ],
    excluded: [
      'utendørs plassering brukt som bevis på reell offentlighet',
      'gratis inngang brukt som bevis på lik tilgang',
      'besøkstall brukt som full publikumsprofil',
      'deltakelse brukt som automatisk bevis på delt makt',
      'digital publisering brukt som bevis på at verket blir funnet',
      'likes, visninger eller delinger brukt som bestemt fortolkning'
    ]
  },
  qa: {
    exactCanonicalCoverage: '3/3', minimumModules: 3, minimumSections: 9,
    paragraphClaimTraceRequired: true,
    rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction']
  }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('kpo-grunnlag-1', 'Offentlig kunst er en situasjon', [
        'Offentlig-rom-analyse registrerer mer enn objektet: plassering, siktlinjer, ruter, brukstid, eierskap, vedlikehold, skilt, kroppslig tilgang og konkurrerende aktiviteter. Et verk blir offentlig gjennom relasjonen mellom form, sted og brukere.',
        'Vigelandsparken består av over 200 skulpturer i granitt, bronse og smijern og er resultat av mer enn førti års arbeid. Materiale, akser og gjentatte figurer skaper et sammenhengende anlegg, mens parkens åpne bruk lar møtet skje uten museumets inngangsritual.',
        'Ekebergparken beskrives som en offentlig skulptur- og kulturminnepark etablert gjennom samarbeid mellom Oslo kommune og C. Ludens Ringnes Stiftelse. Offentlig adgang, kommunalt rom og privat finansiering må derfor analyseres som separate strukturer.'
      ], [['kpo-01'], ['kpo-02'], ['kpo-03']], [
        'Registrer verk, sted, forvaltning og bruk i samme analyse.',
        'Offentlig plassering sier ikke alene hvem som setter rammene.'
      ], [['kpo-01', 'kpo-02'], ['kpo-03']]),
      section('kpo-grunnlag-2', 'Monumentets betydning forhandles', [
        'Vigelandmuseet opplyser at kunstneren ofte brukte nøytrale titler og ønsket fri fortolkning. Dette dokumenterer et fortolkningsideal, men gjør ikke senere lesninger vilkårlige: form, plassering, arkiv og dokumentert resepsjon setter fortsatt grenser.',
        'Museets historie om Sinnataggen samler flere fortolkninger av figuren og knytter den til de andre barna på broen. At tolkningene varierer, viser resepsjonshistorie; popularitet eller gjentakelse gjør ikke én lesning til kunstnerens dokumenterte hensikt.',
        'Vigelandmuseets utstilling beskriver Camilla Collett-monumentet som et brudd med idealiserte helteframstillinger og som Norges første statue av en kvinne på sokkel. Monumentanalyse må skille hvem som fremstilles, hvordan kroppen formes, og hvilken senere symbolverdi institusjonen formidler.'
      ], [['kpo-04'], ['kpo-05'], ['kpo-06']], [
        'Skill dokumentert intensjon, ikonografi og senere resepsjon.',
        'En institusjonell fortolkning er en kildeposisjon, ikke en tidløs fasit.'
      ], [['kpo-04', 'kpo-05'], ['kpo-06']]),
      section('kpo-grunnlag-3', 'Tilgang har flere terskler', [
        'Gratis inngang fjerner én økonomisk terskel, men ikke nødvendigvis transport, terreng, språk, tid, funksjonsevne eller sosial fortrolighet. Tilgjengelighetsanalyse må derfor beskrive konkrete betingelser i stedet for å konkludere fra pris alene.',
        'Ekebergparken er gratis og alltid åpen, men parkens egen besøksinformasjon beskriver en bratt ås og verk på skogsstier utenfor den mest universelt tilgjengelige grusruten. Fri adgang og lik fysisk tilgang er dermed ikke det samme.',
        'Nasjonalmuseet dokumenterer trinnfri adgang, heiser, hvileplasser, teleslynger, tegnspråk og synstolkning i besøks- og app-tilbudet. Tiltakene er etterprøvbare tilgjengelighetsgrep; faktisk bruk og opplevd inkludering krever publikumsdata.'
      ], [['kpo-07'], ['kpo-08'], ['kpo-09']], [
        'Kartlegg økonomiske, fysiske, språklige, tidslige og sosiale terskler separat.',
        'Formell tilgjengelighet dokumenterer tilbudet; bruk og erfaring krever egne kilder.'
      ], [['kpo-07', 'kpo-08'], ['kpo-09']])
    ],
    concepts: [
      { id: 'offentlighet', term: 'Offentlighet', definition: 'Et sosialt rom der verk, institusjoner og mennesker møtes, tolker og forhandler betydning under bestemte adgangsvilkår.' },
      { id: 'monument', term: 'Monument', definition: 'Et verk eller anlegg som gir varig offentlig form til minne, identitet, verdi eller konflikt.' },
      { id: 'terskel', term: 'Terskel', definition: 'En økonomisk, fysisk, språklig, tidslig, digital eller sosial betingelse som påvirker adgang og deltakelse.' },
      { id: 'kulturell_kapital', term: 'Kulturell kapital', definition: 'Kunnskap, koder og fortrolighet som gjør det lettere å orientere seg i og få anerkjennelse fra kunstfeltets institusjoner.' },
      { id: 'resepsjon', term: 'Resepsjon', definition: 'Dokumenterbare måter konkrete publikum, kritikere eller miljøer møter, tolker, bruker og diskuterer kunst.' },
      { id: 'plattform', term: 'Plattform', definition: 'En teknisk og institusjonell infrastruktur som organiserer publisering, søk, rangering, måling og gjenbruk.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('kpo-fordypning-1', 'Besøkstall er ikke en publikumsprofil', [
        'Nasjonalmuseets årsmelding for 2023 registrerer over 1,2 millioner besøk, mer enn 500 arrangementer og 3432 omvisninger. Tallene dokumenterer omfang og aktivitet, men sier ikke alene hvem som kom, hvem som vendte tilbake eller hvem tilbudet ikke nådde.',
        'Samme årsmelding beskriver undersøkelser samlet inn av vertskapet og brukt i videre utvikling. Først når antall kobles til utvalg, spørsmål, demografi og bruksmåter kan analysen nærme seg publikumsstruktur.',
        'Formidling for et nytt museum beskriver en dreining fra objekter alene mot mennesker, møter, deltakelse og digitale tilbud for grupper som ikke kommer fysisk. Dette er et faglig program for relevans; resultatet må undersøkes i konkrete tilbud og mottakelse.'
      ], [['kpo-10'], ['kpo-11'], ['kpo-12']], [
        'Bruk besøkstall som omfangsmål, ikke som komplett representasjonsmål.',
        'Dokumenter både institusjonens mål og publikums faktiske respons.'
      ], [['kpo-10', 'kpo-11'], ['kpo-12']]),
      section('kpo-fordypning-2', 'Deltakelse og motmonument', [
        'Ekebergparkens Sculpture point kobler et nytt verk til tidligere debatter om representasjon, kjønn og hvilke historier som får plass i monumenthistorien. Verket fungerer dermed som et dokumentert inngrep i parkens egen offentlige fortelling.',
        'Elmgreen & Dragsets Dilemma er laget spesielt for Ekebergparken og beskrives som del av Powerless Structures, der kjente strukturer og offentlig-kunsttroper gis nye funksjoner. Motmonumentet virker gjennom forskjellen fra den tradisjonelle rytterstatuen, ikke bare gjennom tekstens tema.',
        'Et deltakende eller kritisk tilbud deler ikke automatisk institusjonens beslutningsmakt. Analysen må spørre hvem som formulerte oppgaven, valgte bidrag, eier resultatet og kan endre den varige presentasjonen.'
      ], [['kpo-13'], ['kpo-14'], ['kpo-15']], [
        'Les motmonumentet mot den dokumenterte monumenttypen det omformer.',
        'Skill publikumsaktivitet fra reell kontroll over institusjonelle valg.'
      ], [['kpo-13', 'kpo-14'], ['kpo-15']]),
      section('kpo-fordypning-3', 'Digital katalog er kuratert infrastruktur', [
        'Nasjonalmuseets digitale samling tilbyr søk i titusener av verk, kunstnere og utstillingsarkiv og lar brukere lage egne samlinger. Søk, filtre og inspirasjonsflater åpner materiale, men bestemmer samtidig hvilke metadata og innganger som gjør verk søkbare.',
        'Museets samlingsside oppgir at over 50 000 verk kan utforskes fra hele verden. Antallet viser digital publisering, ikke at hele samlingen er publisert, at alle registreringer er like utfyllende eller at alle verk blir funnet.',
        'Når brukere lager og deler egne samlinger, flyttes noe sekvenseringsmakt fra institusjonen til publikum. Plattformen beholder likevel rammene gjennom konto, tilgjengelige objekter, metadata, søk og presentasjonsformat.'
      ], [['kpo-16'], ['kpo-17'], ['kpo-18']], [
        'Analyser metadata, søk, filtre, rangering og rettigheter som kuratoriske valg.',
        'Brukersamlinger gir handlingsrom innenfor plattformens eksisterende ramme.'
      ], [['kpo-16', 'kpo-17'], ['kpo-18']])
    ],
    workedExamples: [
      { id: 'kpo-eksempel-1', title: 'Test offentligheten i en skulpturpark', situation: 'Et verk står gratis tilgjengelig i Ekebergparken.', analysis: ['Registrer eier, finansiering, åpningstid og vedlikehold.', 'Følg hovedrute, terreng og alternative stier fysisk.', 'Skill gratis adgang fra hvem som faktisk kan nå verket.'] },
      { id: 'kpo-eksempel-2', title: 'Les et publikumstall', situation: 'Et museum rapporterer 1,2 millioner besøk.', analysis: ['Kontroller periode og hva som telles som besøk.', 'Finn eventuelle data om sammensetning, gjenbesøk og aktiviteter.', 'Rapporter omfang uten å hevde representativitet som kilden ikke måler.'] },
      { id: 'kpo-eksempel-3', title: 'Analyser en digital søkeflate', situation: 'Et søk i museumssamlingen gir en rangert treffliste.', analysis: ['Registrer søkeord, filtre, språk og antall treff.', 'Sammenlign søk på navn, teknikk og tema.', 'Skill hva databasen inneholder fra hva grensesnittet gjør synlig.'] }
    ],
    commonMisconceptions: [
      { claim: 'Kunst i en park er automatisk offentlig for alle.', correction: 'Plassering må analyseres sammen med adgang, transport, terreng, skilting, forvaltning og faktisk bruk.' },
      { claim: 'Gratis inngang fjerner publikumsforskjeller.', correction: 'Pris er bare én terskel; tid, språk, funksjonsevne, sosial fortrolighet og geografisk tilgang kan fortsatt fordele deltakelsen.' },
      { claim: 'Høye besøkstall viser at museet når et representativt publikum.', correction: 'Tallene viser omfang; representativitet krever data om hvem som deltar og hvem som ikke gjør det.' },
      { claim: 'Deltakende kunst gir publikum beslutningsmakt.', correction: 'Aktivitet, medskaping, eierskap, kuratering og varig beslutningsmyndighet må undersøkes hver for seg.' },
      { claim: 'Mange visninger eller delinger viser hvordan et verk blir forstått.', correction: 'Målinger dokumenterer sirkulasjon; fortolkning krever kommentarer, intervjuer, kritikk eller andre resepsjonskilder.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('kpo-anvendelse-1', 'MUNCH: fysisk og digital inngang', [
        'MUNCH dokumenterer trinnfri adgang, heiser, sitteplasser, synstolkede omvisninger, tegnspråk, teleslynger og gratis ledsagerbillett. Tiltakene kan sammenlignes som ulike innganger til samme institusjon uten å reduseres til én generell tilgjengelighetspåstand.',
        'Museets arbeid med å publisere Munchs kunst digitalt omfatter systematisk overføring av malerier, grafikk, tegninger, skulpturer, fotografier og skrifter til digitale kataloger. Digital offentlighet oppstår her gjennom langvarig registrering, ikke bare opplasting av bilder.',
        'MUNCH tillater oppdaterte reproduksjoner til ikke-kommersiell bruk og bestemte publikasjonsformer. Reproduksjonsvilkår påvirker hvordan verk kan sirkulere, men gjenbrukens omfang og fortolkning må undersøkes separat.'
      ], [['kpo-19'], ['kpo-20'], ['kpo-21']], [
        'Sammenlign konkrete tilgjengelighetstiltak fremfor å bruke ett samlet ja/nei-stempel.',
        'Digital tilgjengeliggjøring består av registrering, rettigheter, grensesnitt og gjenbruk.'
      ], [['kpo-19'], ['kpo-20', 'kpo-21']]),
      section('kpo-anvendelse-2', 'Plattformen former resepsjonen', [
        'MUNCHs digitaliseringsprosjekt for tegninger overførte data fra museumsdatabasen til en nettkatalog og oversatte titler og tekster til engelsk. Språk og metadata utvider søkbarhet, samtidig som kategoriseringene organiserer hva brukeren kan finne.',
        'I et MUNCH Lab-prosjekt analyserer kunstig intelligens publikums egne tegninger og foreslår forbindelser til samlingsverk. Museet presiserer at teknologien er et utforskningsverktøy og ikke en forklaring av kunsten eller erstatning for menneskelig fortolkning.',
        'En plattformanalyse registrerer derfor input, metadata, utvalgsgrunnlag, anbefaling og brukerhandling. At systemet viser en forbindelse dokumenterer algoritmisk matching; om brukeren lærer, liker eller tolker verket på en bestemt måte krever resepsjonsdata.'
      ], [['kpo-22'], ['kpo-23'], ['kpo-24']], [
        'Et anbefalingssystem produserer synlighet og forbindelser, ikke ferdige fortolkninger.',
        'Skill plattformens målbare handlinger fra publikums dokumenterte erfaring.'
      ], [['kpo-22', 'kpo-23'], ['kpo-24']]),
      section('kpo-anvendelse-3', 'Bygg en offentlighetsmatrise', [
        'Lag kolonner for plassering, eier, finansiering, pris, åpningstid, transport, terreng, universell utforming, språk, formidling, medvirkning, metadata, søk, rettigheter og dokumentert resepsjon. Merk ukjente felt eksplisitt.',
        'Sammenlign Vigelandsparkens monumentakse, Ekebergparkens terreng og finansieringsmodell, Nasjonalmuseets publikums- og kataloginfrastruktur og MUNCHs tilgjengelighets- og digitaliseringsgrep. Samme kolonner avdekker ulike offentligheter uten å rangere dem med ett tall.',
        'Avslutt med separate evidensdommer: tilgjengelig tilbud, observert bruk, registrert besøk, dokumentert publikumssammensetning, digital sirkulasjon og dokumentert fortolkning. Bare da kan analysen si hvem kunsten er offentlig for og på hvilket grunnlag.'
      ], [['kpo-01', 'kpo-07', 'kpo-16'], ['kpo-02', 'kpo-03', 'kpo-10', 'kpo-19'], ['kpo-08', 'kpo-11', 'kpo-18', 'kpo-24']], [
        'Bruk samme terskelkategorier på tvers av fysisk og digital offentlighet.',
        'Hold tilbud, bruk, sirkulasjon og fortolkning som separate evidensnivåer.'
      ], [['kpo-07', 'kpo-16', 'kpo-19'], ['kpo-10', 'kpo-11', 'kpo-24']])
    ],
    applicationTasks: [
      { id: 'kpo-oppgave-1', title: 'Offentlighetsvandring', task: 'Følg én rute gjennom Vigelandsparken eller Ekebergparken.', prompts: ['Hvilke verk er synlige fra hovedruten?', 'Hvilke terskler oppstår underveis?', 'Hvem setter tolkningsrammen gjennom skilt og kart?'] },
      { id: 'kpo-oppgave-2', title: 'Monument og resepsjon', task: 'Velg Sinnataggen, Camilla Collett eller Dilemma.', prompts: ['Hva kan beskrives formalt og ikonografisk?', 'Hvilke tolkninger er dokumentert?', 'Hva er kunstnerintensjon, institusjonell tekst og senere resepsjon?'] },
      { id: 'kpo-oppgave-3', title: 'Publikumstall med forbehold', task: 'Les ett årsmeldingstall fra Nasjonalmuseet.', prompts: ['Hva telles og i hvilken periode?', 'Hvilke grupper kan identifiseres?', 'Hvilke påstander kan tallet ikke støtte?'] },
      { id: 'kpo-oppgave-4', title: 'Digitalt tvillingsøk', task: 'Søk etter samme motiv i Nasjonalmuseet og MUNCH.', prompts: ['Hvilke metadata og filtre finnes?', 'Hvordan rangeres treffene?', 'Hva er publisert, og hva vet du fortsatt ikke om samlingen?'] },
      { id: 'kpo-oppgave-5', title: 'Sirkulasjon eller resepsjon', task: 'Velg en digital reproduksjon og bygg to separate logger.', prompts: ['Hvor og hvor mye sirkulerer den?', 'Finnes kommentarer, kritikk eller intervjuer om forståelsen?', 'Hvilken konklusjon støtter hvert evidenslag?'] }
    ],
    selfCheck: [
      { question: 'Hva gjør kunst offentlig?', answer: 'Relasjonen mellom verk, sted, adgang, forvaltning, bruk, formidling og offentlig forhandling.' },
      { question: 'Hvorfor er gratis adgang ikke lik tilgang?', answer: 'Fordi transport, terreng, tid, språk, funksjonsevne og sosial fortrolighet fortsatt kan være terskler.' },
      { question: 'Hva viser besøkstall?', answer: 'Registrert omfang i en bestemt periode, ikke automatisk publikums sammensetning eller erfaring.' },
      { question: 'Hva skiller deltakelse fra beslutningsmakt?', answer: 'Deltakelse er en aktivitet eller medvirkning; beslutningsmakt avgjør ramme, utvalg, eierskap og varig resultat.' },
      { question: 'Hvorfor er en digital katalog kuratert?', answer: 'Metadata, språk, søk, filtre, rettigheter og presentasjonslogikk bestemmer hva som kan finnes og brukes.' },
      { question: 'Hva viser en visning eller deling?', answer: 'At innholdet har sirkulert eller utløst en plattformhandling, ikke hvordan det ble fortolket.' },
      { question: 'Hva kreves for dokumentert resepsjon?', answer: 'Kilder til konkrete tolkninger eller bruksmåter, som kritikk, intervjuer, kommentarer, observasjon eller publikumsundersøkelser.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({
  id, publisher, title, url, source_location, type, label: publisher + ' – ' + title
});

const sources = [
  source('kpo01-vigeland-park', 'Vigelandmuseet', 'Vigelandsparken', 'https://vigeland.museum.no/vigelandsparken', 'Parkoversikten om verkantall, materialer, tidsrom og fontenens endrede plassering', 'official-site-overview'),
  source('kpo02-vigeland-faq', 'Vigelandmuseet', 'Frequently Asked Questions', 'https://vigeland.museum.no/en/news/q-a-frequently-asked-questions', 'Svarene om nøytrale titler, fri fortolkning og parkens formidlingstilbud', 'official-museum-faq'),
  source('kpo03-vigeland-angry', 'Vigelandmuseet', 'The history of The Angry Boy', 'https://vigeland.museum.no/en/news/sinnataggens-historie', 'Historien om verkets plassering, navn og dokumenterte fortolkninger', 'official-reception-essay'),
  source('kpo04-vigeland-hall', 'Vigelandmuseet', 'Hall V', 'https://vigeland.museum.no/en/permanent-exhibition/sal-v', 'Avsnittene om Camilla Collett-monumentet, offentlig monumenttype og senere symbolverdi', 'official-exhibition-essay'),
  source('kpo05-ekeberg-about', 'Ekebergparken', 'About Ekebergparken', 'https://ekebergparken.com/en/om-ekebergparken', 'Institusjonsbeskrivelsen om offentlig park, samarbeid, finansiering, åpning og samling', 'official-institution-profile'),
  source('kpo06-ekeberg-entry', 'Ekebergparken', 'Experience beautiful nature and a unique cultural heritage', 'https://ekebergparken.com/en', 'Opplysningene om gratis inngang, døgnåpent parkområde og stedsspesifikke oppdrag', 'official-site-overview'),
  source('kpo07-ekeberg-access', 'Ekebergparken', 'Plan your visit', 'https://ekebergparken.com/en/visit-us/plan-visit', 'Avsnittet om grusrute, universell tilgjengelighet, skogsstier og bratt terreng', 'official-accessibility-guide'),
  source('kpo08-ekeberg-point', 'Ekebergparken', 'Sculpture point:Ekebergparken', 'https://ekebergparken.com/en/skulpturpunkt-ekebergparken', 'Verksteksten om representasjon, kjønn og hvem som får plass i monumenthistorien', 'official-artwork-essay'),
  source('kpo09-ekeberg-dilemma', 'Ekebergparken', 'Dilemma', 'https://ekebergparken.com/en/artworks/dilemma', 'Verksteksten om Powerless Structures, offentlig-kunsttroper og stedsspesifikk produksjon', 'official-artwork-essay'),
  source('kpo10-nm-annual', 'Nasjonalmuseet', 'Årsmelding 2023', 'https://www.nasjonalmuseet.no/globalassets/arsmelding-nasjonalmuseet-2023.pdf', 'Sidene om besøk, arrangementer, omvisninger, vertskap, publikumsundersøkelser og digital samling', 'official-annual-report'),
  source('kpo11-nm-mediation', 'Nasjonalmuseet', 'Formidling for et nytt museum', 'https://www.nasjonalmuseet.no/contentassets/d28c138a14f542eda421a12dc5a50407/formidling-for-et-nytt-museum-no-27.9.19.pdf', 'Innledningen om publikumsmøter, deltakelse, tredje steder og digitale museumstilbud', 'official-research-publication'),
  source('kpo12-nm-access', 'Nasjonalmuseet', 'Accessibility in the National Museum’s venues', 'https://www.nasjonalmuseet.no/en/visit/accessibility/', 'Tiltak for bevegelse, hørsel, syn, tilpassede omvisninger og ledsagere', 'official-accessibility-guide'),
  source('kpo13-nm-digital', 'Nasjonalmuseet', 'About the collection', 'https://www.nasjonalmuseet.no/en/collection/about-the-collection/', 'Digitalt verkantall, søk, filtre, inspirasjonsflater og brukersamlinger', 'official-digital-collection-guide'),
  source('kpo14-munch-access', 'MUNCH', 'Accessibility at MUNCH', 'https://www.munch.no/en/visit-us/accessibility', 'Tiltak for bevegelse, syn, hørsel, ledsagere og universell utforming på nett og i bygg', 'official-accessibility-guide'),
  source('kpo15-munch-online', 'MUNCH', 'The process of making Edvard Munch’s artworks available online', 'https://www.munch.no/en/our-collection/making-edvard-munchs-artworks-availble-online/', 'Historikken for digitale kataloger over skrifter, malerier, grafikk, tegninger, skulpturer og foto', 'official-digitization-essay'),
  source('kpo16-munch-drawings', 'MUNCH', 'About the Project of Digitizing Munch’s Drawings', 'https://www.munch.no/en/our-collection/about-the-project/', 'Prosjektroller, oversettelse og overføring av museumsdata til nettkatalog', 'official-digitization-project'),
  source('kpo17-munch-images', 'MUNCH', 'Photos of Edvard Munch’s art', 'https://www.munch.no/en/our-collection/photos-of-edvard-munchs-art/', 'Vilkår for ikke-kommersiell og avgrenset kommersiell reproduksjon', 'official-reproduction-policy'),
  source('kpo18-munch-ai', 'MUNCH', 'Museums, AI and Cultural Data', 'https://www.munch.no/en/about/research-and-innovation/munch-lab/museums-ai-and-cultural-data/', 'Beskrivelsen av tegneinput, AI-matching og avgrensningen mot forklaring eller erstatning av fortolkning', 'official-innovation-project')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('kpo-01', 'Offentlig-rom-analyse kan forankres i dokumenterte forhold mellom verk, plassering, adgang, forvaltning og bruk.', ['kpo01-vigeland-park', 'kpo05-ekeberg-about', 'kpo07-ekeberg-access'], ['kpo-grunnlag-1', 'kpo-anvendelse-3']),
  claim('kpo-02', 'Vigelandsparken består av over 200 skulpturer i granitt, bronse og smijern og er resultat av over førti års arbeid.', ['kpo01-vigeland-park'], ['kpo-grunnlag-1', 'kpo-anvendelse-3']),
  claim('kpo-03', 'Ekebergparken er et samarbeid mellom Oslo kommune og en privat stiftelse, finansiert av stiftelsen og åpnet for publikum i 2013.', ['kpo05-ekeberg-about'], ['kpo-grunnlag-1', 'kpo-anvendelse-3']),
  claim('kpo-04', 'Vigelandmuseet opplyser at Vigeland ofte brukte nøytrale titler og ønsket at verkene skulle tolkes fritt.', ['kpo02-vigeland-faq'], ['kpo-grunnlag-2']),
  claim('kpo-05', 'Vigelandmuseet dokumenterer flere fortolkninger av Sinnataggen og relasjoner til de andre barnefigurene på broen.', ['kpo03-vigeland-angry'], ['kpo-grunnlag-2']),
  claim('kpo-06', 'Vigelandmuseet beskriver Camilla Collett-monumentet som et brudd med idealiserte heltemonumenter og Norges første kvinnestatue på sokkel.', ['kpo04-vigeland-hall'], ['kpo-grunnlag-2']),
  claim('kpo-07', 'Tilgang må undersøkes gjennom flere terskler enn pris, blant annet terreng, språk, tid, funksjonsevne og sosial fortrolighet.', ['kpo07-ekeberg-access', 'kpo12-nm-access', 'kpo14-munch-access'], ['kpo-grunnlag-3', 'kpo-anvendelse-3']),
  claim('kpo-08', 'Ekebergparken er gratis og alltid åpen, men har bratt terreng og verk på skogsstier utenfor den mest tilgjengelige grusruten.', ['kpo06-ekeberg-entry', 'kpo07-ekeberg-access'], ['kpo-grunnlag-3', 'kpo-anvendelse-3']),
  claim('kpo-09', 'Nasjonalmuseet dokumenterer konkrete tiltak for trinnfri adgang, hvile, hørsel, syn, tegnspråk og navigasjon.', ['kpo12-nm-access'], ['kpo-grunnlag-3']),
  claim('kpo-10', 'Nasjonalmuseet registrerte over 1,2 millioner besøk, mer enn 500 arrangementer og 3432 omvisninger i 2023.', ['kpo10-nm-annual'], ['kpo-fordypning-1', 'kpo-anvendelse-3']),
  claim('kpo-11', 'Nasjonalmuseets vertskap samlet publikumsundersøkelser som ble brukt i videre utvikling av museet.', ['kpo10-nm-annual'], ['kpo-fordypning-1', 'kpo-anvendelse-3']),
  claim('kpo-12', 'Nasjonalmuseets formidlingspublikasjon beskriver en dreining mot mennesker, møter, deltakelse og digitale tilbud for nye publikumsgrupper.', ['kpo11-nm-mediation'], ['kpo-fordypning-1']),
  claim('kpo-13', 'Sculpture point:Ekebergparken knytter verket til debatter om representasjon, kjønn og hvem som får plass i offentlig monumenthistorie.', ['kpo08-ekeberg-point'], ['kpo-fordypning-2']),
  claim('kpo-14', 'Dilemma er laget for Ekebergparken og omformer offentlig-kunsttroper gjennom Powerless Structures-serien.', ['kpo09-ekeberg-dilemma'], ['kpo-fordypning-2']),
  claim('kpo-15', 'Deltakelse dokumenterer ikke i seg selv delt eierskap, kuratorisk kontroll eller varig beslutningsmakt.', ['kpo08-ekeberg-point', 'kpo11-nm-mediation'], ['kpo-fordypning-2']),
  claim('kpo-16', 'Nasjonalmuseets digitale samling tilbyr søk, filtre, kunstner- og utstillingsinnganger og brukerskapte samlinger.', ['kpo13-nm-digital'], ['kpo-fordypning-3', 'kpo-anvendelse-3']),
  claim('kpo-17', 'Nasjonalmuseet oppgir at over 50 000 verk kan utforskes i den digitale samlingen fra hele verden.', ['kpo13-nm-digital'], ['kpo-fordypning-3']),
  claim('kpo-18', 'Brukersamlinger lar publikum velge og sekvensere publiserte verk innenfor plattformens konto-, metadata- og presentasjonsrammer.', ['kpo13-nm-digital'], ['kpo-fordypning-3', 'kpo-anvendelse-3']),
  claim('kpo-19', 'MUNCH dokumenterer tiltak for trinnfri adgang, mobilitet, syn, hørsel, ledsagere og universelt utformede digitale løsninger.', ['kpo14-munch-access'], ['kpo-anvendelse-1', 'kpo-anvendelse-3']),
  claim('kpo-20', 'MUNCH har systematisk overført skrifter og flere kunstmedier til digitale kataloger siden 2010 og 2013.', ['kpo15-munch-online'], ['kpo-anvendelse-1']),
  claim('kpo-21', 'MUNCH tillater oppdaterte reproduksjoner til ikke-kommersiell bruk og bestemte publikasjonsformer.', ['kpo17-munch-images'], ['kpo-anvendelse-1']),
  claim('kpo-22', 'Digitaliseringsprosjektet for Munchs tegninger omfattet engelsk oversettelse og overføring av museumsdata til nettkatalog.', ['kpo16-munch-drawings'], ['kpo-anvendelse-2']),
  claim('kpo-23', 'MUNCH Lab bruker AI til å foreslå samlingsforbindelser fra publikums tegninger og avgrenser verktøyet mot å forklare kunsten.', ['kpo18-munch-ai'], ['kpo-anvendelse-2']),
  claim('kpo-24', 'Algoritmisk matching og plattformmåling dokumenterer synlighet eller handling, mens bestemt forståelse krever resepsjonsdata.', ['kpo18-munch-ai', 'kpo10-nm-annual'], ['kpo-anvendelse-2', 'kpo-anvendelse-3'])
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
    primary_domain_id: 'publikum_offentlighet', emne_ids: emneIds
  };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) {
    assert(subject.chapters.length === 4, 'Kunst må starte dette steget med fire kapitler');
    subject.chapters.push(registryChapter);
  } else {
    assert(subject.chapters.length === 5, 'Reproduksjon forventer nøyaktig fem Kunst-kapitler');
    subject.chapters[existingIndex] = registryChapter;
  }
  subject.canonicalModel.note = 'Kunstfagets seks canonicale fagområder eier rendererstrukturen. Felt og institusjon, Produksjon og praksis, Estetisk språk og form, Makt og legitimitet og Publikum og offentlighet er materialisert som fulltekst- og claimsporede kapitler; ett område står igjen i kapittelproduksjon.';
  registry.version = '2.57.0';
  registry.updatedAt = '2026-08-10';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'kunst');
  assert(subject?.editorialStatus === 'chapters_in_progress', 'Kunst må starte fra chapters_in_progress');
  subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Kunst har seks canonicale fagområder og 21 aktive emner. Publikum og offentlighet dekker nå sine 3 emner gjennom tre moduler, ni seksjoner, 27 claimsporede fagavsnitt, 24 verifiserte claims og 18 inspiserbare primærkilder. Fem av seks områder er materialisert; ett gjenstår, derfor står faget korrekt som chapters_in_progress.';
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
