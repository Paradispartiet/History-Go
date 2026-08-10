#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'makt-og-legitimitet';
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
  'em_kunst_politisk_kunst_aktivisme',
  'em_kunst_kvalitet_kritikk_og_symbolsk_kapital',
  'em_kunst_institusjonskritikk_og_representasjon'
];

const methodIds = [
  'met_kunst_feltanalyse',
  'met_kunst_praksis_og_prosessanalyse',
  'met_kunst_kritikk_og_diskursanalyse',
  'met_kunst_ikonografisk_analyse',
  'met_kunst_formanalyse',
  'met_kunst_kunsthistorisk_kontekstualisering',
  'met_kunst_institusjonskritisk_analyse',
  'met_kunst_offentlig_rom_analyse',
  'met_kunst_resepsjonsanalyse',
  'met_kunst_stedsspesifikk_analyse',
  'met_kunst_komparativ_verkanalyse',
  'met_kunst_institusjonsanalyse',
  'met_kunst_kuratorisk_analyse',
  'met_kunst_komparativ_institusjonsanalyse'
];

const relatedPlaces = [
  { id: 'nasjonalmuseet', name: 'Nasjonalmuseet', role: 'Undersøk hvordan innsamling, katalogisering og utstilling produserer kanon og representativitet.' },
  { id: 'kunstnernes_hus', name: 'Kunstnernes Hus', role: 'Analyser kunstnerstyring, juryering og kritikk som fordelingsmekanismer for synlighet og anerkjennelse.' },
  { id: 'kunsthall_oslo', name: 'Kunsthall Oslo', role: 'Prøv institusjonskritikk mot programmer, oppdrag og dokumenterte strukturelle konflikter.' },
  { id: 'oslo_radhus', name: 'Oslo rådhus', role: 'Les offentlig kunst som resultat av konkurranse, utvalg, politisk funksjon og nasjonal selvframstilling.' }
];

const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({
  id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds
});

const chapter = {
  schema: 'history_go_fagverk_chapter_v1',
  version: '1.0.0',
  subject: 'kunst',
  subject_id: 'kunst',
  id: CHAPTER_ID,
  chapter_id: CHAPTER_ID,
  primary_domain_id: 'makt_legitimitet',
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  emne_ids: emneIds,
  method_ids: methodIds,
  title: 'Makt og legitimitet: hvem definerer kunstens verdi?',
  subtitle: 'Kanon, kritikk, juryer, institusjoner, representasjon og politisk virkning i Oslos kunstfelt',
  lead: 'Kunstfeltet fordeler synlighet, ressurser og anerkjennelse gjennom samlinger, juryer, kritikk, utstillinger og offentlige oppdrag. Kapittelet lærer brukeren å spore disse beslutningene uten å gjøre institusjonell status til objektiv kvalitet, representasjon til likhet eller politisk motiv til dokumentert samfunnseffekt.',
  learningObjectives: [
    'skille kunstnerisk egenskap, kvalitetsdom og institusjonell anerkjennelse',
    'kartlegge hvem som nominerer, juryerer, kjøper, kuraterer, finansierer og formidler',
    'analysere kritikk og jurybegrunnelser som situerte verdidommer',
    'undersøke kanon som et historisk resultat av innsamling, forskning og utstilling',
    'skille representasjon, deltakelse, beslutningsmakt og strukturell endring',
    'analysere politisk kunst gjennom form, sak, situasjon, handling og dokumentert mottakelse',
    'prøve institusjonskritikk mot institusjonens rammer og faktiske respons',
    'sammenligne maktmekanismer ved fire canonicale Oslo-steder'
  ],
  diagnosticQuestions: [
    { question: 'Beviser en juryplass at et verk har objektiv kvalitet?', answer: 'Nei. Den dokumenterer et utvalg foretatt av bestemte aktører, etter bestemte prosedyrer og innenfor et konkret innsendingsfelt.' },
    { question: 'Er en samling et nøytralt speil av kunsthistorien?', answer: 'Nei. Innkjøp, gaver, klassifikasjon, forskning og utstilling gjør samlingen til både kilde og aktiv historieskriver.' },
    { question: 'Har politisk kunst effekt fordi temaet er politisk?', answer: 'Ikke automatisk. Effekt krever kilder om sirkulasjon, mottakelse, handling eller institusjonell endring.' },
    { question: 'Er institusjonskritikk nøytralisert straks et museum viser den?', answer: 'Det kan skje, men må undersøkes. Visning dokumenterer en relasjon; absorpsjon eller endring krever ytterligere evidens.' }
  ],
  relatedPlaces,
  moduleFiles: [CHAPTER_DIR + '/01-grunnlag.json', CHAPTER_DIR + '/02-fordypning.json', CHAPTER_DIR + '/03-anvendelse.json'],
  briefFile: CHAPTER_DIR + '/brief.json',
  claimsFile: CHAPTER_DIR + '/claims.json'
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1',
  version: '1.0.0',
  subject_id: 'kunst',
  chapter_id: CHAPTER_ID,
  primary_domain_id: 'makt_legitimitet',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Kunst-domenet Makt og legitimitet med kildebasert undervisning i politisk kunst, kvalitet, kritikk, symbolsk kapital, institusjonskritikk og representasjon.',
  audience: 'Brukere som skal kunne undersøke kunstfeltets verdifordeling uten å forveksle synlighet, pris, juryvalg eller museumsstatus med objektiv kvalitet og uten å tilskrive politisk effekt uten resepsjonsdata.',
  learningArc: [
    'kartlegge feltets aktører, porter og ressurser',
    'skille verkegenskaper fra kvalitetsdom og anerkjennelse',
    'analysere juryering og kritikk som dokumenterbare handlinger',
    'følge kanonproduksjon gjennom samling, katalog og utstilling',
    'måle representasjon på flere nivåer enn synlighet',
    'undersøke politisk kunst gjennom virkemåte og dokumentert resepsjon',
    'prøve institusjonskritikk mot institusjonens respons',
    'avslutte med en komparativ maktmatrise for fire Oslo-steder'
  ],
  requiredEmneIds: emneIds,
  requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'verkegenskap vs kvalitetsdom', 'anerkjennelse vs objektiv kvalitet', 'synlighet vs beslutningsmakt',
    'representasjon vs strukturell likhet', 'pris vs kunstnerisk verdi', 'kunstnerintensjon vs resepsjon',
    'politisk tema vs dokumentert effekt', 'institusjonskritikk vs institusjonell endring',
    'åpen innsending vs lik tilgang', 'samling vs nøytralt historiespeil', 'kuratert narrativ vs fullstendig historie'
  ],
  sourceStrategy: {
    priority: [
      'Nasjonalmuseets strategi-, samlings-, utstillings- og verkdokumentasjon',
      'Kunstnernes Hus og Høstutstillingens egne historie-, styrings- og jurykilder',
      'Kunsthall Oslos programtekster om institusjonskritikk, representasjon og strukturelt ansvar',
      'Oslo kommunes og rådhusrelaterte primærkilder om offentlig kunst og politisk funksjon'
    ],
    minimumExternalSources: 15,
    claimLevelTrace: true,
    sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: [
      'felt, portvoktere, jury, kritikk, samling, kanon og symbolsk kapital',
      'politisk kunst, aktivisme, offentlig kunst og resepsjon',
      'representasjon, katalogisering, kuratering og institusjonskritikk',
      'Nasjonalmuseet, Kunstnernes Hus, Kunsthall Oslo og Oslo rådhus som canonicale stedscase'
    ],
    excluded: [
      'juryvalg, markedspris eller museumsstatus brukt som objektivt kvalitetsbevis',
      'synlig mangfold brukt som bevis på lik beslutningsmakt',
      'politisk motiv brukt som bevis på bestemt effekt',
      'kunstnerintensjon brukt som erstatning for publikumsresepsjon',
      'institusjonell visning brukt som automatisk bevis på absorpsjon eller reform',
      'kanon behandlet som komplett og uforanderlig'
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
      section('kml-grunnlag-1', 'Se feltet, ikke bare verket', [
        'En feltanalyse begynner med relasjoner: hvem kan sende inn, hvem velger, hvem finansierer, hvem eier rommet, hvem skriver teksten, og hvem får varig plass i samling eller arkiv. Makt er her ikke bare forbud; den virker også gjennom invitasjoner, kategorier, tidsplaner og fordeling av oppmerksomhet.',
        'Kunstnernes Hus beskriver sin uavhengighet og kunstnerstyrte forankring som grunnlag for risiko og nyskaping utenfor kommersielle hensyn. Denne egenbeskrivelsen dokumenterer en styringsmodell og et ideal, men ikke at alle kunstnere har lik tilgang eller innflytelse.',
        'Høstutstillingen er en kunstnerjuryert gruppeutstilling basert på fri innsending. Åpen innsending utvider hvem som kan vurderes, mens juryen fortsatt fordeler den knappe ressursen utstillingsplass. Begge ledd må med i analysen.'
      ], [['kml-01'], ['kml-02'], ['kml-03']], [
        'Kartlegg portene mellom produksjon, vurdering, synlighet og varig anerkjennelse.',
        'En institusjons selvbeskrivelse er evidens om modell og ambisjon, ikke automatisk om resultat.'
      ], [['kml-01', 'kml-03'], ['kml-02']]),
      section('kml-grunnlag-2', 'Kvalitet er en begrunnet dom', [
        'En kvalitetsdom bør deles i tre lag: observerbare verkegenskaper, eksplisitte kriterier og den situerte vurderingen. Når lagene blandes, blir juryens eller kritikerens autoritet lett presentert som om den var en egenskap i verket selv.',
        'Høstutstillingens katalog fra 2005 beskriver juryering i to omganger, anonymisering og uenighet mellom jurymedlemmer. Prosedyren viser at vurdering er kollektivt arbeid over tid; den garanterer ikke en tidløs eller enstemmig kvalitetsfasit.',
        'Kunstnernes Hus formulerte i en jubileumstekst at kvalitet ofte bærer det anerkjentes stempel, og at øyeblikkets kvalitet kan være en svak rettesnor for en kunstnerstyrt institusjon. Utsagnet er en institusjonell refleksjon over egen portvoktermakt, ikke en avskaffelse av vurdering.'
      ], [['kml-04'], ['kml-05'], ['kml-06']], [
        'Be alltid om dommens aktør, kriterier, sammenligningsfelt og dato.',
        'Juryvalg dokumenterer institusjonell anerkjennelse, ikke objektiv kvalitet.'
      ], [['kml-04', 'kml-05'], ['kml-05', 'kml-06']]),
      section('kml-grunnlag-3', 'Politisk motiv er ikke det samme som effekt', [
        'Nasjonalmuseet beskriver Hannah Ryggens billedvever som politiske arbeider om krig, urett og trusler. I The Use of Hands fra 1949 kobles krigens vold til hender som brukes til å drepe. Kilden dokumenterer verk, motiv, medium og institusjonens fortolkning.',
        'Daybreak fra 1936 knyttes til Ryggens feministiske og pasifistiske standpunkter og til kritikk av Hitlers regime. Kunstnerens posisjon og verkets ikonografi kan derfor undersøkes med kilder, men de forteller fortsatt ikke alene hvordan ulike publikummere handlet eller endret syn.',
        'For å hevde politisk effekt trengs et eget resepsjonslag: samtidige omtaler, publikumsdata, bruk i organisering, sensur, policyendring eller dokumentert institusjonell respons. Uten slike spor bør analysen si politisk tema, adressat eller ambisjon, ikke bevist effekt.'
      ], [['kml-07'], ['kml-08'], ['kml-09']], [
        'Skill motiv, kunstnerposisjon, institusjonell tolkning og faktisk resepsjon.',
        'Politisk innhold kan dokumenteres uten å overdrive virkningen.'
      ], [['kml-07', 'kml-08'], ['kml-09']])
    ],
    concepts: [
      { id: 'kunstfelt', term: 'Kunstfelt', definition: 'Relasjonene mellom kunstnere, institusjoner, kritikere, juryer, marked, myndigheter og publikum som fordeler ressurser og anerkjennelse.' },
      { id: 'legitimitet', term: 'Legitimitet', definition: 'Anerkjent rett eller autoritet til å definere, velge, tolke eller fordele innenfor en bestemt sammenheng.' },
      { id: 'symbolsk_kapital', term: 'Symbolsk kapital', definition: 'Anerkjennelse, prestisje og troverdighet som kan gi aktører gjennomslag i et felt.' },
      { id: 'kanon', term: 'Kanon', definition: 'Et historisk foranderlig utvalg av verk og kunstnerskap som gis særlig varighet og normerende betydning.' },
      { id: 'representasjon', term: 'Representasjon', definition: 'Hvem og hva som er synlig, omtalt eller inkludert; må skilles fra hvem som har beslutningsmakt.' },
      { id: 'institusjonskritikk', term: 'Institusjonskritikk', definition: 'Kunstnerisk eller analytisk undersøkelse av institusjoners rammer, kategorier, økonomi, autoritet og eksklusjoner.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('kml-fordypning-1', 'Samlingen skriver kanon', [
        'Nasjonalmuseets samlingspresentasjon viser om lag 6500 verk fra landets største samling av kunst, arkitektur og design. Selv et stort utvalg er et utvalg: romrekkefølge, tematikk, etiketter og fravær organiserer hvilke forbindelser publikum kan se.',
        'Museets FoU-strategi sier eksplisitt at innsamling, utstillingsprogram og museumspedagogikk deltar i kanonbygging og er forankret i ideer om det nasjonale. Strategien gjør dermed museets egen definisjonsmakt til et forskningsobjekt.',
        'Samme strategi vil øke representativitet etter blant annet kjønn, sosial og kulturell bakgrunn og geografi, og synliggjøre kunstnerskap som har vært oversett. Målet dokumenterer institusjonell retning; graden av oppnåelse må måles i innkjøp, forskning, visning og beslutningsroller.'
      ], [['kml-10'], ['kml-11'], ['kml-12']], [
        'Les katalog, veggtekst, romrekkefølge og fravær som kuratoriske valg.',
        'Et representasjonsmål er ikke det samme som dokumentert representasjonsresultat.'
      ], [['kml-10', 'kml-11'], ['kml-12']]),
      section('kml-fordypning-2', 'Kunstnerstyring og juryens port', [
        'Kunstnernes Hus ble åpnet i 1930 etter en arkitektkonkurranse og forvalter en historie der kunstnere har organisert et eget visningssted. Historien viser at institusjonell autonomi også er bygget, finansiert og styrt gjennom konkrete organisasjoner.',
        'Kunstnernes Hus oppgir at kunstnere er i flertall i styret og at øverste organ har representanter fra åtte kunstfagorganisasjoner. Dette gir en kontrollerbar indikator på kunstnerstyring, men representativitet innen organisasjonene må undersøkes separat.',
        'Høstutstillingens historie arkiverer skiftende søkertall, juryer og utvalg. Et valgt verk får synlighet og symbolsk kapital, men utvalgsraten beskriver konkurransen og jurybeslutningen, ikke en universell rangering av alle innsendte verk.'
      ], [['kml-13'], ['kml-14'], ['kml-15']], [
        'Undersøk vedtekter og organer før du kaller en institusjon kunstnerstyrt.',
        'Åpen innsending og kunstnerjuryering fordeler makt på bestemte, men ikke maktfrie, måter.'
      ], [['kml-13', 'kml-14'], ['kml-03', 'kml-15']]),
      section('kml-fordypning-3', 'Institusjonskritikk innenfor institusjonen', [
        'Kunsthall Oslo beskriver seg som et ikke-kommersielt sted for internasjonal samtidskunst, med vekt på nye oppdrag og kunstproduksjonens sosiale og historiske sammenhenger. Programprofilen gjør institusjonens rammer synlige som del av verkets kontekst.',
        'I The Oslo Museum of Contemporary Art viste Kunsthall Oslo verk av hundre Oslo-kunstnere som ikke var representert i Nasjonalmuseets samling. Prosjektet etablerte et konkret motarkiv, men fravær fra én samling forklarer ikke alene hvorfor hvert kunstnerskap manglet.',
        'Når en institusjon viser kritikk av museumsvalg, kan den både åpne et offentlig spørsmål og tilegne seg kritikkens verdi. Analysen må derfor registrere hva som ble stilt ut, hvem som fikk tale, hvilke prosedyrer som endret seg, og hva som forble uendret.'
      ], [['kml-16'], ['kml-17'], ['kml-18']], [
        'Et motarkiv dokumenterer fravær og foreslår alternativer; årsaksforklaring krever mer evidens.',
        'Institusjonell visning er ikke automatisk bevis på verken nøytralisering eller reform.'
      ], [['kml-17'], ['kml-18']])
    ],
    workedExamples: [
      { id: 'kml-eksempel-1', title: 'Etterprøv en kvalitetsdom', situation: 'Et verk er valgt til Høstutstillingen og omtales som viktig.', analysis: ['Identifiser jury, år, prosedyre og eventuelle begrunnelser.', 'Skill verkets dokumenterte egenskaper fra juryens vurdering.', 'Beskriv utvalget som anerkjennelse i denne situasjonen, ikke som objektiv fasit.'] },
      { id: 'kml-eksempel-2', title: 'Mål representasjon i flere ledd', situation: 'Et museum lover en mer representativ kunsthistorie.', analysis: ['Registrer mål og kategorier i strategien.', 'Undersøk innkjøp, utstilling, forskning, katalogtekst og beslutningsorgan hver for seg.', 'Rapporter endring og gjenstående skjevhet uten å gjøre synlighet til strukturell likhet.'] },
      { id: 'kml-eksempel-3', title: 'Test institusjonskritikkens virkning', situation: 'En kunsthall viser et prosjekt som kritiserer et nasjonalmuseums samling.', analysis: ['Dokumenter prosjektets utvalg og påstand.', 'Skill kunsthallens programhandling fra den kritiserte institusjonens respons.', 'Se etter senere endringer før du hevder absorpsjon eller reform.'] }
    ],
    commonMisconceptions: [
      { claim: 'Et verk som er valgt av en anerkjent jury, har objektivt høy kvalitet.', correction: 'Valget dokumenterer anerkjennelse fra en bestemt jury i en bestemt konkurranse; kriterier og sammenligningsfelt må vises.' },
      { claim: 'Markedspris, prisutdeling og museumserverv måler den samme verdien.', correction: 'De oppstår gjennom ulike aktører, prosedyrer og ressurser og må analyseres separat.' },
      { claim: 'Flere representerte kunstnere beviser at institusjonen er strukturelt likestilt.', correction: 'Synlighet må suppleres med data om innkjøp, varighet, budsjett, fortolkningsmakt og beslutningsroller.' },
      { claim: 'Et politisk verk har politisk effekt fordi budskapet er tydelig.', correction: 'Effekt krever resepsjons-, sirkulasjons-, handlings- eller endringsdata utover motiv og intensjon.' },
      { claim: 'Institusjonskritikk mister alltid kraft når den vises av en institusjon.', correction: 'Visningsforholdet må analyseres, men nøytralisering eller endring kan ikke avgjøres uten evidens om rammer og respons.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('kml-anvendelse-1', 'Oslo rådhus: offentlig bilde og utvalgte historier', [
        'Oslo kommune beskriver rådhuset som et aktivt politisk kontorbygg og et symbol på Oslos og Norges verdier, tradisjoner og historie. Arkitektur og kunst fungerer derfor i samme rom som kommunal myndighet og offentlige ritualer.',
        'Kunsthall Oslos utstilling om rådhusdekorasjonen viste skisser, fotografier og arkivmateriale og undersøkte også forslag som ikke ble realisert. Slik blir det ferdige interiøret lesbart som resultat av konkurranser, komiteer og bortvalg, ikke som en naturlig nasjonal fortelling.',
        'Utstillingsteksten opplyser at Arne Ekeland vant konkurransen om en freske i hovedhallen uten at forslaget ble utført, og at Munchs arbeiderframstilling stadig ble utsatt. Slike arkivspor viser definisjonsmakt i handling; mulige politiske årsaker må beholdes som hypoteser når kilden selv uttrykker usikkerhet.'
      ], [['kml-19'], ['kml-20'], ['kml-21']], [
        'Analyser offentlige bilder sammen med rommets politiske bruk og utvalgsprosess.',
        'Bevar kildeord som «kanskje» når årsaken til et bortvalg ikke er sikkert dokumentert.'
      ], [['kml-19', 'kml-20'], ['kml-21']]),
      section('kml-anvendelse-2', 'Kritikk av oljestatens kunstinstitusjoner', [
        'Kunsthall Oslos program om klimakrisen og oljestaten etterlyste debatt om både krisen som tema og de strukturelle vilkårene kulturarbeidere og institusjoner må håndtere. Kritikken flytter analysen fra bildets budskap til finansiering, eierskap og institusjonelt ansvar.',
        'Programteksten sammenlignet press mot oljesponsing ved europeiske museer med Norges situasjon, der staten selv er oljeaktør. Dette er Kunsthall Oslos argument og problemformulering; en analyse må i tillegg dokumentere konkrete pengestrømmer og beslutninger før den fastslår avhengighet.',
        'Kunsthallens eget arrangement er også en institusjonell handling: den velger spørsmål, deltakere, språk og publikum. Institusjonskritisk analyse inkluderer derfor avsenderen i samme maktkart som aktørene den kritiserer.'
      ], [['kml-22'], ['kml-23'], ['kml-24']], [
        'Følg politisk kunst fra tema til finansiering, organisering og dokumentert respons.',
        'Kritikkens avsender står også i et felt og må analyseres med samme metode.'
      ], [['kml-22', 'kml-23'], ['kml-24']]),
      section('kml-anvendelse-3', 'Bygg en komparativ maktmatrise', [
        'Lag kolonner for eier, styringsorgan, finansiering, adgang, utvalgsprosedyre, kriterier, publisering, samlingsstatus og klage- eller responsmulighet. Fyll bare celler som kan spores til dokumenter; merk resten som ukjent.',
        'Ved Nasjonalmuseet følges samling og kanon, ved Kunstnernes Hus jury og kunstnerstyring, ved Kunsthall Oslo oppdrag og institusjonskritikk, og ved Oslo rådhus offentlig konkurranse og politisk representasjon. Sammenlign mekanismer, ikke institusjonenes prestisje.',
        'Avslutt med en evidensdom for hver påstand: dokumentert struktur, dokumentert beslutning, aktørens begrunnelse, observert representasjon, dokumentert resepsjon eller åpen hypotese. Da blir makt synlig uten at analysen later som alle årsaker eller virkninger er kjent.'
      ], [['kml-01', 'kml-04', 'kml-10'], ['kml-14', 'kml-17', 'kml-20'], ['kml-09', 'kml-12', 'kml-18', 'kml-21', 'kml-23']], [
        'Sammenlign samme beslutningsledd på tvers av institusjoner.',
        'Ukjent årsak og udokumentert effekt skal stå synlig i sluttanalysen.'
      ], [['kml-01', 'kml-10', 'kml-14'], ['kml-09', 'kml-18', 'kml-21']])
    ],
    applicationTasks: [
      { id: 'kml-oppgave-1', title: 'Feltkart på Kunstnernes Hus', task: 'Kartlegg én utstillings eller Høstutstillingens vei fra innsending til publikum.', prompts: ['Hvem kunne foreslå eller søke?', 'Hvem besluttet, og etter hvilken prosedyre?', 'Hvilke former for anerkjennelse fulgte valget?'] },
      { id: 'kml-oppgave-2', title: 'Kanonprøve i Nasjonalmuseet', task: 'Velg ett rom og registrer hvordan fortellingen er bygget.', prompts: ['Hvilke verk og kategorier er synlige?', 'Hvem skriver og daterer forbindelsene?', 'Hvilke fravær kan dokumenteres uten å gjette årsaken?'] },
      { id: 'kml-oppgave-3', title: 'Resepsjonslogg for politisk kunst', task: 'Undersøk ett verk av Hannah Ryggen.', prompts: ['Hva dokumenterer motiv og medium?', 'Hva dokumenterer kunstnerposisjon eller institusjonell fortolkning?', 'Hvilke kilder måtte til for å hevde politisk effekt?'] },
      { id: 'kml-oppgave-4', title: 'Rådhusets bortvalg', task: 'Sammenlign et realisert og et urealisert forslag til rådhusdekorasjonen.', prompts: ['Hva viser arkivmaterialet?', 'Hvem hadde beslutningsmakt?', 'Hvilke årsaker er sikre, mulige eller ukjente?'] },
      { id: 'kml-oppgave-5', title: 'Institusjonskritisk responskjede', task: 'Følg ett prosjekt ved Kunsthall Oslo fra kritisk påstand til eventuell respons.', prompts: ['Hva kritiseres konkret?', 'Hvordan rammes kritikken inn av kunsthallen?', 'Finnes dokumentert endring, bare debatt eller ingen kjent respons?'] }
    ],
    selfCheck: [
      { question: 'Hva er første spørsmål i en feltanalyse?', answer: 'Hvilke aktører, porter, ressurser og beslutninger forbinder produksjon med synlighet og anerkjennelse?' },
      { question: 'Hva dokumenterer et juryvalg?', answer: 'At en bestemt jury valgte et verk gjennom en bestemt prosedyre i et bestemt felt av innsendelser.' },
      { question: 'Hvorfor er en samling ikke et nøytralt speil?', answer: 'Fordi innsamling, gaver, katalogisering, forskning, utstilling og fravær aktivt former historien.' },
      { question: 'Hva skiller representasjon fra beslutningsmakt?', answer: 'Representasjon gjelder synlighet og inkludering; beslutningsmakt gjelder hvem som kan definere, prioritere og fordele.' },
      { question: 'Hva trengs for å hevde politisk effekt?', answer: 'Dokumentert resepsjon, sirkulasjon, handling eller institusjonell og samfunnsmessig endring.' },
      { question: 'Når er institusjonskritikk absorbert?', answer: 'Først når relasjonen mellom kritikk, institusjonell innramming og respons er dokumentert; visning alene avgjør ikke spørsmålet.' },
      { question: 'Hva gjør en maktmatrise etterprøvbar?', answer: 'At hver celle viser kilde, aktør, dato, prosedyre og evidensstatus, og at ukjente forhold ikke fylles med antakelser.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({
  id, publisher, title, url, source_location, type, label: publisher + ' – ' + title
});

const sources = [
  source('kml01-nm-strategy', 'Nasjonalmuseet', 'Strategi for forskning og utvikling 2021–2025', 'https://www.nasjonalmuseet.no/globalassets/dokumenter/fou-strategi-nasjonalmuseet-20212025.pdf', 'Sidene 3–6 om samfunnsoppdrag, kanonbygging, representativitet, innsamling og kritisk katalogisering', 'official-strategy'),
  source('kml02-nm-collection', 'Nasjonalmuseet', 'The collection presentation: Concept and structure', 'https://www.nasjonalmuseet.no/en/exhibitions-and-events/national-museum/exhibitions/2021/collection-exhibition/the_collection_presentation/', 'Oversikten over om lag 6500 utstilte verk og presentasjonens struktur', 'official-exhibition-overview'),
  source('kml03-ryggen-hands', 'Nasjonalmuseet', 'Hannah Ryggen – The Use of Hands', 'https://www.nasjonalmuseet.no/en/collection/object/NG.M.02262', 'Om verket, politiske tema, motiv, materiale, datering og erverv', 'official-collection-work'),
  source('kml04-ryggen-daybreak', 'Nasjonalmuseet', 'Hannah Ryggen – Daybreak', 'https://www.nasjonalmuseet.no/en/collection/object/NG.M.04226', 'Om verket, feministisk og pasifistisk posisjon, Hitler-kritikk, ikonografi og teknikk', 'official-collection-work'),
  source('kml05-kh-about', 'Kunstnernes Hus', 'Om Kunstnernes Hus', 'https://kunstnerneshus.no/om', 'Avsnittet om uavhengighet, kunstnerstyrt forankring, risiko, nyskaping og offentlig samtale', 'official-institution-profile'),
  source('kml06-kh-history', 'Kunstnernes Hus', 'Vår historie', 'https://kunstnerneshus.no/om/historie', 'Tidslinjen fra arkitektkonkurransen i 1928 og åpningen i 1930', 'official-institution-history'),
  source('kml07-kh-quality', 'Kunstnernes Hus', 'Kunstnernes Hus’ 50 års jubileumsutstilling', 'https://kunstnerneshus.no/program/utstillinger/50-ars-jubileumsutstilling', 'Jubileumstekstens refleksjon om anerkjennelse, kvalitet og kunstnerstyrt formidling', 'official-archive-exhibition'),
  source('kml08-kh-governance', 'Kunstnernes Hus', 'Vacant position: Film curator and coordinator', 'https://kunstnerneshus.no/en/articles/ledig-stilling-filmkurator', 'Institusjonens opplysning om kunstnerflertall i styret og representanter fra åtte kunstfagorganisasjoner i øverste organ', 'official-governance-profile'),
  source('kml09-host-about', 'Statens kunstutstilling, Høstutstillingen', 'Om Høstutstillingen', 'https://www.hostutstillingen.no/informasjon/', 'Institusjonens beskrivelse av kunstnerjuryert gruppeutstilling og fri innsending', 'official-institution-profile'),
  source('kml10-host-history', 'Statens kunstutstilling, Høstutstillingen', 'Historie', 'https://www.hostutstillingen.no/historie/', 'Tidslinje med søkertall, juryer, utvalgte verk og institusjonshistorie', 'official-institution-history'),
  source('kml11-host-2005', 'Statens kunstutstilling, Høstutstillingen', 'Høstutstillingen 2005 – katalog', 'https://www.hostutstillingen.no/wp-content/uploads/2018/05/HK2005.pdf', 'Forordet om juryens sammensetning, to omganger, anonymisering, uenighet og maktbalanse', 'official-exhibition-catalogue'),
  source('kml12-ko-about', 'Kunsthall Oslo', 'About Kunsthall Oslo', 'https://kunsthalloslo.no/?lang=en&p=717', 'Institusjonsprofil om ikke-kommersiell drift, nye oppdrag og sosiale og historiske kontekster', 'official-institution-profile'),
  source('kml13-ko-museum', 'Kunsthall Oslo', 'The Oslo Museum of Contemporary Art', 'https://kunsthalloslo.no/?lang=en&p=5656', 'Utstillingsbeskrivelsen og utvalget av hundre Oslo-kunstnere uten representasjon i Nasjonalmuseets samling', 'official-exhibition-essay'),
  source('kml14-ko-climate', 'Kunsthall Oslo', 'The climate crisis and the oil state – what responsibility do art and cultural institutions have?', 'https://kunsthalloslo.no/?lang=en&p=13072', 'Programteksten om klima som tema, strukturelle vilkår, oljesponsing og den norske oljestaten', 'official-program-essay'),
  source('kml15-ko-cityhall', 'Kunsthall Oslo', 'The Fresco Brothers and the Sisters of Liberty: the decoration of Oslo City Hall 1938–1950', 'https://kunsthalloslo.no/?lang=en&p=5892', 'Utstillingsteksten om rådhusets nasjonale fortelling, konkurranser, realiserte og urealisert forslag', 'official-exhibition-essay'),
  source('kml16-cityhall', 'Oslo kommune', 'Omvisninger i Oslo rådhus', 'https://www.oslo.kommune.no/radhuset/omvisninger-i-oslo-radhus/', 'Om rådhuset som aktivt politisk bygg, symbol, kunst- og arkitekturverk og offentlig tilgjengelig rom', 'official-municipal-site')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('kml-01', 'Feltanalyse kan operasjonaliseres gjennom dokumenterte aktører, porter, prosedyrer og fordelte ressurser.', ['kml05-kh-about', 'kml09-host-about', 'kml01-nm-strategy'], ['kml-grunnlag-1', 'kml-anvendelse-3']),
  claim('kml-02', 'Kunstnernes Hus knytter uavhengighet og kunstnerstyrt forankring til risiko, nyskaping og kunstnerisk utvikling utenfor kommersielle hensyn.', ['kml05-kh-about'], ['kml-grunnlag-1']),
  claim('kml-03', 'Høstutstillingen beskrives som en kunstnerjuryert gruppeutstilling basert på fri innsending.', ['kml09-host-about'], ['kml-grunnlag-1', 'kml-fordypning-2']),
  claim('kml-04', 'En etterprøvbar kvalitetsanalyse skiller observerbare egenskaper, eksplisitte kriterier og situert vurdering.', ['kml07-kh-quality', 'kml11-host-2005'], ['kml-grunnlag-2', 'kml-anvendelse-3']),
  claim('kml-05', 'Høstutstillingens 2005-katalog beskriver juryering i to omganger, anonymisering, uenighet og grundige diskusjoner.', ['kml11-host-2005'], ['kml-grunnlag-2']),
  claim('kml-06', 'Kunstnernes Hus har offentlig reflektert over at anerkjennelsens stempel og øyeblikkets kvalitet ikke bør være eneste rettesnor.', ['kml07-kh-quality'], ['kml-grunnlag-2']),
  claim('kml-07', 'Nasjonalmuseet knytter The Use of Hands fra 1949 til krig, urett og hender brukt til å drepe.', ['kml03-ryggen-hands'], ['kml-grunnlag-3']),
  claim('kml-08', 'Nasjonalmuseet knytter Daybreak til Ryggens feministiske og pasifistiske standpunkter og kritikk av Hitlers regime.', ['kml04-ryggen-daybreak'], ['kml-grunnlag-3']),
  claim('kml-09', 'Påstander om politisk effekt krever resepsjons- eller endringsspor utover dokumentert motiv, intensjon og institusjonell tolkning.', ['kml03-ryggen-hands', 'kml04-ryggen-daybreak', 'kml14-ko-climate'], ['kml-grunnlag-3', 'kml-anvendelse-3']),
  claim('kml-10', 'Nasjonalmuseets samlingspresentasjon omfatter om lag 6500 verk fra kunst, arkitektur og design.', ['kml02-nm-collection'], ['kml-fordypning-1', 'kml-anvendelse-3']),
  claim('kml-11', 'Nasjonalmuseets FoU-strategi beskriver innsamling, utstillingsprogram og museumspedagogikk som del av kanonbyggingen.', ['kml01-nm-strategy'], ['kml-fordypning-1']),
  claim('kml-12', 'Nasjonalmuseets FoU-strategi setter mål om større representativitet og synliggjøring av tidligere oversette kunstnerskap.', ['kml01-nm-strategy'], ['kml-fordypning-1', 'kml-anvendelse-3']),
  claim('kml-13', 'Kunstnernes Hus’ historie følger institusjonen fra arkitektkonkurransen i 1928 og åpningen i 1930.', ['kml06-kh-history'], ['kml-fordypning-2']),
  claim('kml-14', 'Kunstnernes Hus omtaler seg som kunstnerstyrt og dokumenterer kunstnerrepresentasjon i styringen.', ['kml05-kh-about', 'kml08-kh-governance'], ['kml-fordypning-2', 'kml-anvendelse-3']),
  claim('kml-15', 'Høstutstillingens historie dokumenterer skiftende søkertall, juryer og utvalg over tid.', ['kml10-host-history'], ['kml-fordypning-2']),
  claim('kml-16', 'Kunsthall Oslo beskriver et ikke-kommersielt program med vekt på nye oppdrag og kunstproduksjonens sosiale og historiske kontekster.', ['kml12-ko-about'], ['kml-fordypning-3']),
  claim('kml-17', 'The Oslo Museum of Contemporary Art samlet verk av hundre Oslo-kunstnere som ikke var representert i Nasjonalmuseets samling.', ['kml13-ko-museum'], ['kml-fordypning-3', 'kml-anvendelse-3']),
  claim('kml-18', 'Visning av institusjonskritikk dokumenterer en institusjonell relasjon, mens nøytralisering eller reform krever evidens om rammer og respons.', ['kml12-ko-about', 'kml13-ko-museum'], ['kml-fordypning-3', 'kml-anvendelse-3']),
  claim('kml-19', 'Oslo kommune beskriver rådhuset som et aktivt politisk kontorbygg og et symbol på Oslos og Norges verdier, tradisjoner og historie.', ['kml16-cityhall'], ['kml-anvendelse-1']),
  claim('kml-20', 'Kunsthall Oslos rådhusutstilling brukte skisser, fotografier og arkivmateriale til å undersøke både realiserte og urealiserte dekorasjonsforslag.', ['kml15-ko-cityhall'], ['kml-anvendelse-1', 'kml-anvendelse-3']),
  claim('kml-21', 'Kunsthall Oslo dokumenterer at Ekelands vinnerforslag ikke ble utført og at Munchs forslag ble utsatt, mens mulig politisk årsak presenteres med forbehold.', ['kml15-ko-cityhall'], ['kml-anvendelse-1', 'kml-anvendelse-3']),
  claim('kml-22', 'Kunsthall Oslo etterlyste debatt om både klimakrisen som tema og kulturinstitusjoners strukturelle vilkår og ansvar.', ['kml14-ko-climate'], ['kml-anvendelse-2']),
  claim('kml-23', 'Kunsthall Oslo sammenlignet press mot oljesponsing ved europeiske museer med den norske situasjonen der staten er oljeaktør.', ['kml14-ko-climate'], ['kml-anvendelse-2', 'kml-anvendelse-3']),
  claim('kml-24', 'Et institusjonskritisk program er selv en institusjonell handling som velger problem, ramme, deltakere og publikum.', ['kml12-ko-about', 'kml14-ko-climate'], ['kml-anvendelse-2'])
];

const claimsDoc = {
  schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'kunst', chapter_id: CHAPTER_ID, sources, claims
};

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.kunst;
  assert(subject && Array.isArray(subject.chapters), 'Kunst mangler kapittelliste i fagverkregisteret');
  const registryChapter = {
    id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: CHAPTER_FILE,
    primary_domain_id: 'makt_legitimitet', emne_ids: emneIds
  };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) {
    assert(subject.chapters.length === 3, 'Kunst må starte dette steget med tre kapitler');
    subject.chapters.push(registryChapter);
  } else {
    assert(subject.chapters.length === 4, 'Reproduksjon forventer nøyaktig fire Kunst-kapitler');
    subject.chapters[existingIndex] = registryChapter;
  }
  subject.canonicalModel.note = 'Kunstfagets seks canonicale fagområder eier rendererstrukturen. Felt og institusjon, Produksjon og praksis, Estetisk språk og form og Makt og legitimitet er materialisert som fulltekst- og claimsporede kapitler; to områder står igjen i kapittelproduksjon.';
  registry.version = '2.56.0';
  registry.updatedAt = '2026-08-10';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'kunst');
  assert(subject?.editorialStatus === 'chapters_in_progress', 'Kunst må starte fra chapters_in_progress');
  subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Kunst har seks canonicale fagområder og 21 aktive emner. Makt og legitimitet dekker nå sine 3 emner gjennom tre moduler, ni seksjoner, 27 claimsporede fagavsnitt, 24 verifiserte claims og 16 inspiserbare primærkilder. Fire av seks områder er materialisert; to gjenstår, derfor står faget korrekt som chapters_in_progress.';
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
