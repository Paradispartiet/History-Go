#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'kilder-kritikk-og-sannhet';
const CHAPTER_DIR = 'data/fagverk/media/' + CHAPTER_ID;
const CHAPTER_FILE = CHAPTER_DIR + '.json';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), JSON.stringify(value, null, 2) + '\n'); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_media_arkiv_og_bevis', 'em_media_autoritet_i_media', 'em_media_balanse_og_sannhet',
  'em_media_datajournalistikk', 'em_media_desinformasjon', 'em_media_diskurs_makt',
  'em_media_dokumentasjon', 'em_media_ekspertkilder', 'em_media_etterprovbarhet',
  'em_media_faktasjekk', 'em_media_feilinformasjon', 'em_media_framing',
  'em_media_innramming', 'em_media_kildekritikk', 'em_media_nyhetsdiskurs',
  'em_media_nyhetsverdi', 'em_media_objektivitet_journalistikk',
  'em_media_redaksjonell_prioritering', 'em_media_statistikk_og_offentlighet',
  'em_media_verifisering'
];

const methodIds = [
  'met_media_dokumentasjonsanalyse', 'met_media_arkivanalyse',
  'met_media_ekspertkildeanalyse', 'met_media_autoritetsanalyse',
  'met_media_objektivitetsanalyse', 'met_media_balanseanalyse',
  'met_media_datajournalistisk_analyse', 'met_media_statistikkanalyse',
  'met_media_feilinformasjonsanalyse', 'met_media_desinformasjonsanalyse',
  'met_media_diskursanalyse', 'met_media_maktanalyse',
  'met_media_kildekritisk_analyse', 'met_media_etterprovbarhetsanalyse',
  'met_media_faktasjekkanalyse', 'met_media_verifiseringsanalyse',
  'met_media_framinganalyse', 'met_media_innrammingsanalyse',
  'met_media_nyhetsverdianalyse', 'met_media_prioriteringsanalyse'
];

const relatedPlaces = [
  { id: 'nasjonalbiblioteket', name: 'Nasjonalbiblioteket', role: 'Undersøk avisutgaver, nettarkiv, metadata og versjoner som dokumentasjon uten å gjøre arkivering til sannhetsstempel.' },
  { id: 'universitetet_i_oslo_blindern', name: 'Universitetet i Oslo, Blindern', role: 'Analyser ekspertkildens fagområde, metode, usikkerhet, interesse og avstand mellom forskningsfunn og mediesitat.' },
  { id: 'oslo_radhus', name: 'Oslo rådhus', role: 'Følg offentlige dokumenter, innsyn, journalføring og kommunal statistikk fra forvaltning til journalistisk påstand.' },
  { id: 'nrk_huset_marienlyst', name: 'NRK-huset på Marienlyst', role: 'Studer verifisering, nyhetsverdi, framing og redaksjonell prioritering i en konkret allmennkringkaster.' }
];

const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({ id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds });

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'media', subject_id: 'media',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'kilder_kritikk_sannhet',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Kilder, kritikk og sannhet: fra påstand til offentlig fakta',
  subtitle: 'Kildekritikk, faktasjekk, framing, ekspertise, statistikk, feilinformasjon og arkiv som etterprøvbare arbeidsprosesser',
  lead: 'Journalistikk finner ikke ferdige fakta i verden og kopierer dem inn i en tekst. Den avgrenser påstander, velger kilder, kontrollerer dokumenter, tolker data, rammer inn hendelser og viser – eller skjuler – hvordan konklusjonen ble til. Kapittelet lærer brukeren å følge dette evidensløpet uten å forveksle autoritet med sannhet, balanse med lik taletid eller et bevart dokument med et bevist hendelsesforløp.',
  learningObjectives: [
    'skille kildens nærhet, kompetanse, interesse og uavhengighet fra påstandens sannhet',
    'gjøre en faktapåstand avgrenset, kontrollerbar og reproducerbar før den faktasjekkes',
    'analysere framing og nyhetsdiskurs uten å slutte udokumentert om løgn eller intensjon',
    'skille nyhetsverdi og redaksjonell prioritering fra objektiv samfunnsviktighet',
    'vurdere objektivitet som arbeidsprosedyrer og balanse som relevant evidensvekt',
    'prøve ekspertkilder mot fagområde, metode, konsensus, interesse og uttrykt usikkerhet',
    'lese datasett, statistikk, grafikk og revisjoner som forskjellige evidenslag',
    'skille feilinformasjon fra desinformasjon og dokumentasjon fra ferdig bevis'
  ],
  diagnosticQuestions: [
    { question: 'Er en primærkilde automatisk sann?', answer: 'Nei. Den kan være nær hendelsen, men må fortsatt vurderes for perspektiv, interesse, feil og hva den faktisk kan dokumentere.' },
    { question: 'Beviser to motstridende sitater at saken er balansert?', answer: 'Nei. Kildenes relevans, kunnskapsgrunnlag og evidensvekt må vurderes; lik taletid er ikke nødvendigvis sannferdig balanse.' },
    { question: 'Er alt feil innhold desinformasjon?', answer: 'Nei. Desinformasjon innebærer dokumentert vilje til å villede eller påvirke; en feil kan spres uten slik hensikt.' },
    { question: 'Gjør en arkivert nettside innholdet sant?', answer: 'Nei. Arkivet kan dokumentere hva som var publisert på et tidspunkt, ikke at publiseringens påstander var riktige.' }
  ],
  relatedPlaces,
  moduleFiles: [CHAPTER_DIR + '/01-grunnlag.json', CHAPTER_DIR + '/02-fordypning.json', CHAPTER_DIR + '/03-anvendelse.json'],
  briefFile: CHAPTER_DIR + '/brief.json', claimsFile: CHAPTER_DIR + '/claims.json'
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'media', chapter_id: CHAPTER_ID,
  primary_domain_id: 'kilder_kritikk_sannhet', relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Medias tredje canonicale domene med claimsporet undervisning i kildekritikk, verifisering, faktasjekk, framing, diskurs, nyhetsverdi, objektivitet, ekspertkilder, datajournalistikk, dokumentasjon og feilinformasjon.',
  audience: 'Brukere som skal kunne rekonstruere hvordan offentlige fakta produseres og kritiseres uten å gjøre kildetype, autoritet, balanse, arkivstatus eller visualisering til sannhetssnarveier.',
  learningArc: ['bygge en kilde- og etterprøvbarhetsmatrise', 'avgrense en faktapåstand og reprodusere en faktasjekk', 'skille dokument, arkivkopi og bevis', 'kode framing uten å dikte intensjon', 'analysere diskurs, aktørroller og makt over tid', 'skille nyhetsverdi, prioritering, objektivitet og balanse', 'teste ekspertise og statistikk ved Blindern og Oslo rådhus', 'skille feilinformasjon, desinformasjon og dokumentert påvirkning'],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'primærkilde vs sann kilde', 'nærhet vs uavhengighet', 'navngitt kilde vs verifisert påstand',
    'faktasjekk vs absolutt sannhetsdom', 'verifisering vs gjentakelse fra flere avhengige kilder',
    'framing vs fabrikasjon', 'framinganalyse vs udokumentert intensjon', 'diskursmønster vs én overskrift',
    'nyhetsverdi vs objektiv viktighet', 'redaksjonelt fravær vs sensurbevis',
    'objektivitet vs perspektivløshet', 'balanse vs lik taletid', 'ekspertstatus vs ufeilbarlighet',
    'en ekspert vs faglig konsensus', 'korrelasjon vs årsak', 'grafikk vs rådata',
    'revidert statistikk vs manipulert statistikk', 'feilinformasjon vs desinformasjon',
    'arkivkopi vs sannhetsstempel', 'dokument vs fullstendig hendelsesbevis'
  ],
  sourceStrategy: {
    priority: ['Vær Varsom-plakaten, Faktisk.no og IFCNs dokumenterte verifikasjonsmetoder', 'Nasjonalbiblioteket, Nasjonalarkivet og Oslo kommunes dokumentasjons- og innsynskilder', 'SSBs kvalitets-, metadata- og revisjonsregler', 'primær medieforskning om framing og nyhetsverdi samt redaksjonelle standarder'],
    minimumExternalSources: 18, claimLevelTrace: true, sourceLocationsRequired: true, currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: ['kildekritikk og etterprøvbarhet', 'faktasjekk og verifisering', 'framing, innramming, diskurs og makt', 'nyhetsverdi, prioritering, objektivitet og balanse', 'ekspertkilder, datajournalistikk og statistikk', 'dokumentasjon, arkiv, feilinformasjon og desinformasjon', 'Nasjonalbiblioteket, Blindern, Oslo rådhus og Marienlyst som stedscase'],
    excluded: ['teori brukt som faktakilde', 'autoritet brukt som erstatning for metode', 'intensjon utledet bare fra resultat', 'lik taletid brukt som sannhetsmål', 'grafikk brukt uten datasett og definisjoner', 'arkivert publisering omtalt som bevist sannhet']
  },
  qa: { exactCanonicalCoverage: '20/20', minimumModules: 3, minimumSections: 9, paragraphClaimTraceRequired: true, rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction'] }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('kks-grunnlag-1', 'Kildekritikk begynner med hva kilden kan vite', [
        'Vær Varsom-plakatens punkt 3.2 krever kritisk kildevalg, kontroll av opplysninger og bredde og relevans i kildeutvalget. En kildeanalyse må derfor registrere tilgang til hendelsen, faglig kompetanse, tidsavstand, interesse, dokumentasjon og uavhengighet før utsagnet vurderes.',
        'En primærkilde står nær handlingen eller dokumentet, men nærheten gjør ikke kilden nøytral eller korrekt. En sekundærkilde kan tilføre sammenligning og kontekst; betegnelsene beskriver relasjonen til materialet, ikke en ferdig rangering av sannhet.',
        'Etterprøvbarhet betyr at leseren kan identifisere påstanden, kildene, avgrensningen og resonnementet. Navngivning hjelper, men en navngitt kilde og flere medier som gjentar samme opprinnelige utsagn er fortsatt ikke uavhengig verifisering.'
      ], [['kks-01'], ['kks-02'], ['kks-03']], ['Kartlegg kunnskap, interesse og uavhengighet før du rangerer en kilde.', 'Skill synlig kildehenvisning fra uavhengig kontroll av påstanden.'], [['kks-01', 'kks-02'], ['kks-03']]),
      section('kks-grunnlag-2', 'Faktasjekken må kunne gjentas', [
        'Faktisk.no beskriver faktasjekk som en konkluderende undersøkende sjanger som spør om en avgrenset påstand stemmer og viser leseren hvordan svaret er nådd. Før kontroll må påstanden derfor få avsender, ordlyd, tidspunkt, målestokk og tolkningsrom.',
        'IFCN krever samme standard uavhengig av hvem som fremsetter påstanden, åpenhet om kilder og metode og en synlig rettelsespraksis. Slike prosedyrer reduserer vilkårlighet, men gjør ikke faktasjekker ufeilbarlige eller tidløse.',
        'Verifisering følger beviskjeden tilbake til originaldokument, rådata, opptak eller direkte observasjon. Tre artikler som bygger på samme pressemelding er én avhengig kjede, mens to uavhengige kilder må ha egne kunnskapsveier til opplysningen.'
      ], [['kks-04'], ['kks-05'], ['kks-06']], ['Avgrens påstanden før du konkluderer.', 'Tell uavhengige kunnskapsveier, ikke antall gjengivelser.'], [['kks-04', 'kks-05'], ['kks-06']]),
      section('kks-grunnlag-3', 'Dokumentasjon er spor – bevis er en argumentert kobling', [
        'Oslo kommune publiserer postjournal, politiske saker, kommunerevisjonsrapporter og åpne datasett gjennom sine innsynsløsninger. Et offentlig dokument kan vise hva kommunen registrerte eller besluttet, men må leses med saksnummer, avsender, dato, vedlegg og eventuelle unntak.',
        'Nasjonalbibliotekets pliktavlevering omfatter allment tilgjengelige dokumenter på tvers av medier, og Nettarkivet høster norske nettsteder. En bevart utgave dokumenterer publiseringsinnhold og tidspunkt; arkivstatus er ikke et sannhetsstempel på påstandene i dokumentet.',
        'En dokumentasjonsanalyse bygger beviskjeden fra opprinnelse og metadata via autentisitet, helhet og kontekst til konklusjon. Ett ekte dokument kan være ufullstendig, og et skjermbilde uten URL, tidspunkt eller versjon kan ikke alene bevise hele hendelsesforløpet.'
      ], [['kks-07'], ['kks-08'], ['kks-09']], ['Les offentlig dokument i sin sak og versjon.', 'Skill bevart og autentisk spor fra fullstendig bevis for hendelsen.'], [['kks-07'], ['kks-08', 'kks-09']])
    ],
    concepts: [
      { id: 'kildekritikk', term: 'Kildekritikk', definition: 'Systematisk vurdering av hva en kilde kan vite, hvordan opplysningen ble til, og hvilke interesser, feil og avhengigheter som finnes.' },
      { id: 'etterprovbarhet', term: 'Etterprøvbarhet', definition: 'Muligheten til å rekonstruere påstand, kildegrunnlag, metode, avgrensning og resonnement.' },
      { id: 'verifisering', term: 'Verifisering', definition: 'Kontroll av en konkret opplysning mot selvstendige og dokumenterbare evidensspor.' },
      { id: 'framing', term: 'Framing', definition: 'Utvalg og framheving som definerer problem, årsak, vurdering eller mulig løsning i en framstilling.' },
      { id: 'nyhetsverdi', term: 'Nyhetsverdi', definition: 'Redaksjonelle kriterier som gjør enkelte hendelser mer sannsynlige å velges og prioriteres som nyheter.' },
      { id: 'desinformasjon', term: 'Desinformasjon', definition: 'Feil eller misvisende informasjon som lages eller spres med dokumentert hensikt om å påvirke eller villede.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('kks-fordypning-1', 'Framing velger og fremhever – den trenger ikke fabrikere', [
        'Robert Entmans klassiske framingmodell beskriver hvordan kommunikasjon velger deler av en oppfattet virkelighet og gjør dem mer fremtredende for å definere problem, årsak, vurdering eller løsning. Framing finnes også når alle enkeltopplysninger er korrekte.',
        'En framinganalyse koder overskrift, ingress, bilde, aktører, årsaksord, tidshorisont og foreslåtte tiltak på tvers av flere tekster. To medier kan bruke samme fakta i ulike innramminger; forskjellen beviser ikke i seg selv fabrikasjon eller skjult agenda.',
        'Intensjon kan ikke leses direkte ut av tekstens virkning. Påstand om strategisk innramming krever spor som redaksjonelle instrukser, gjentatt seleksjon, uttalt formål eller andre dokumenter – ikke bare at analysen finner et mønster.'
      ], [['kks-10'], ['kks-11'], ['kks-12']], ['Kod hvilke aspekter som velges og fremheves.', 'Dokumenter intensjon separat fra tekstlig mønster og mulig virkning.'], [['kks-10', 'kks-11'], ['kks-12']]),
      section('kks-fordypning-2', 'Diskurs og makt blir synlig i mønstre', [
        'Nyhetsdiskursanalyse undersøker gjentatte kategorier, metaforer, aktørroller, sitatrekkefølge og hvem som får definere problemet. At en framstilling bruker et bestemt språk betyr ikke automatisk at faktapåstandene er falske.',
        'Makt kan ligge i tilgang til redaksjonen, autoritet til å navngi problemet og kapasitet til å levere raske sitater, tall og bilder. En maktpåstand må sammenligne flere saker eller et avgrenset tidsrom; én overskrift kan være et eksempel, ikke hele mønsteret.',
        'Ved NRK Marienlyst kan en analyse sammenligne hvem som inviteres, hvilke dokumenter som vises, hvor mye usikkerhet som formidles og hvordan saken følges opp. Institusjonens allmennkringkasteroppdrag er relevant kontekst, men beviser ikke kvaliteten i hvert innslag.'
      ], [['kks-13'], ['kks-14'], ['kks-15']], ['Skill språklig diskurs fra påstandens faktiske riktighet.', 'Krev sammenlignbart materiale før du konkluderer om systematisk makt.'], [['kks-13'], ['kks-14', 'kks-15']]),
      section('kks-fordypning-3', 'Nyhetsverdi, objektivitet og balanse er ulike problemer', [
        'Galtung og Ruge modellerte nyhetsverdi som faktorer som påvirker hvilke hendelser som blir nyheter. Modellen er et analyseverktøy for utvalg, ikke en fasit for hva som objektivt er viktigst eller sant.',
        'Redaksjonell prioritering kan måles i plass, sendetid, varighet, oppdatering og plassering. Fravær kan skyldes kapasitet, tidspunkt eller relevans; det er ikke alene bevis på sensur, mens systematisk fravær over et definert materiale kan undersøkes som et mønster.',
        'Reuters setter nøyaktighet og balanse foran fart og krever åpen retting og ærlig kildebruk. Objektivitet kan derfor analyseres som kontrollerbare prosedyrer; balanse betyr relevant og forholdsmessig evidens, ikke automatisk lik taletid til enhver posisjon.'
      ], [['kks-16'], ['kks-17'], ['kks-18']], ['Bruk nyhetsverdi til å forklare utvalg, ikke til å rangere sannhet.', 'Prøv objektivitet gjennom metode og balanse gjennom evidensvekt.'], [['kks-16', 'kks-17'], ['kks-18']])
    ],
    workedExamples: [
      { id: 'kks-eksempel-1', title: 'Reproduser en faktasjekk', situation: 'En påstand om kommunal pengebruk går viralt.', analysis: ['Lås ordlyd, tidsrom og måleenhet.', 'Finn budsjett, regnskap og revisjoner i Oslo kommunes kilder.', 'Vis hvilke tolkninger dataene støtter og ikke støtter.'] },
      { id: 'kks-eksempel-2', title: 'Sammenlign to innramminger', situation: 'To redaksjoner omtaler samme hendelse ulikt.', analysis: ['Bygg en felles faktatidslinje først.', 'Kod overskrift, aktører, årsak og tiltak.', 'Skill dokumentert utvalg fra antatt motiv.'] },
      { id: 'kks-eksempel-3', title: 'Test et arkivbevis', situation: 'Et gammelt skjermbilde brukes som dokumentasjon.', analysis: ['Finn original URL, dato og arkivversjon.', 'Kontroller om siden og vedleggene er komplette.', 'Skill hva som ble publisert fra om innholdet var sant.'] }
    ],
    commonMisconceptions: [
      { claim: 'En primærkilde er den sanneste kilden.', correction: 'Primær beskriver nærhet til materialet; troverdighet krever fortsatt kontroll av perspektiv, interesse og feil.' },
      { claim: 'En faktasjekk avgjør sannheten én gang for alle.', correction: 'Den vurderer en presist avgrenset påstand mot tilgjengelig evidens på et bestemt tidspunkt.' },
      { claim: 'Ulik framing betyr at ett medium lyver.', correction: 'Ulike utvalg og framhevinger kan eksistere med korrekte fakta; fabrikasjon og intensjon må dokumenteres separat.' },
      { claim: 'Balanse betyr like mye plass til begge sider.', correction: 'Journalistisk balanse må følge relevans og evidensvekt, ikke mekanisk taletid.' },
      { claim: 'En arkivert side er bevist sann.', correction: 'Arkivet dokumenterer publisering og versjon; sannheten i innholdet krever egne evidensspor.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('kks-anvendelse-1', 'Ekspertkilden må være ekspert på den konkrete påstanden', [
        'Ved Universitetet i Oslo, Blindern må ekspertkildeanalysen registrere fagområde, metode, relevant publisering, datagrunnlag, finansiering, interesse og om uttalelsen ligger innenfor ekspertens dokumenterte kompetanse. Tittel og institusjon er autoritetssignaler, ikke sannhetsgarantier.',
        'Forskningsetiske retningslinjer krever at usikkerhet, presisjon og gyldighetsområde kommuniseres. Journalisten må derfor skille hva studien fant, forskerens tolkning, faglig konsensus og redaksjonens overskrift.',
        'Én ekspert kan forklare en metode eller et funn, men representerer ikke automatisk faglig konsensus. Uenighet må kartlegges gjennom relevante studier og fagmiljøer; en perifer motstemme får ikke samme evidensvekt bare for å skape symmetri.'
      ], [['kks-19'], ['kks-20'], ['kks-21']], ['Kontroller at ekspertens kompetanse dekker den konkrete påstanden.', 'Skill funn, tolkning, konsensus og kommunisert usikkerhet.'], [['kks-19'], ['kks-20', 'kks-21']]),
      section('kks-anvendelse-2', 'Datajournalistikk begynner før grafikken', [
        'Oslo kommunes statistikkbank publiserer tidsserier på flere geografiske nivåer og bygger på PxWeb. En datajournalistisk analyse må lese tabelltittel, definisjon, populasjon, tidsrom, geografisk nivå, enhet, manglende verdier og metadata før tall sammenlignes.',
        'SSB har eksplisitte prinsipper for revisjon av publisert statistikk og dokumenterer kvalitetssystemer for offisiell statistikk. At et tall revideres kan være normal kvalitetsforbedring; det er ikke uten videre bevis på manipulasjon.',
        'Grafikken er en transformasjon av data gjennom utvalg, skala, nullpunkt, gruppering og visuell form. En sammenheng mellom to tidsserier viser ikke årsak, og et kart med absolutte tall kan fortelle en annen historie enn rater per innbygger.'
      ], [['kks-22'], ['kks-23'], ['kks-24']], ['Les metadata og revisjonshistorikk før du tolker tall.', 'Skill datasett, analyse og visualisering – og korrelasjon fra årsak.'], [['kks-22', 'kks-23'], ['kks-24']]),
      section('kks-anvendelse-3', 'Feilinformasjon og desinformasjon krever forskjellige bevis', [
        'Medietilsynet skiller feilinformasjon, som kan deles uten bevisst bedrag, fra desinformasjon, som lages eller spres med vilje for å påvirke. Feil innhold alene dokumenterer derfor ikke hensikt.',
        'Norges strategi mot desinformasjon legger vekt på redaktørstyrte medier, kritisk medieforståelse, forskning og samarbeid. Motstandskraft betyr ikke at myndighetenes eller medienes opplysninger blir sanne av avsenderstatus; de må fortsatt kunne etterprøves.',
        'Avslutt med en evidenslogg: original påstand, publiseringstid, kildelinje, dokumentversjon, rådata, metode, alternative forklaringer, rettelser og gjenstående usikkerhet. Da kan Marienlyst, Blindern, Rådhuset og Nasjonalbiblioteket sammenlignes som produsenter, formidlere og bevarere av ulike kunnskapsspor.'
      ], [['kks-25'], ['kks-26'], ['kks-27']], ['Krev dokumentert påvirkningshensikt før feil kalles desinformasjon.', 'La evidensloggen vise både konklusjon og det som fortsatt er usikkert.'], [['kks-25'], ['kks-26', 'kks-27']])
    ],
    applicationTasks: [
      { id: 'kks-oppgave-1', title: 'Kildematrise', task: 'Bygg en matrise for tre kilder i samme nyhetssak.', prompts: ['Hva kan hver kilde vite direkte?', 'Hvilke interesser og avhengigheter finnes?', 'Hvilken kontroll mangler?'] },
      { id: 'kks-oppgave-2', title: 'Faktasjekk en tallpåstand', task: 'Velg en påstand om Oslo kommune.', prompts: ['Hva er eksakt ordlyd og tidsrom?', 'Hvilket datasett og metadata gjelder?', 'Kan en annen leser gjenta kontrollen?'] },
      { id: 'kks-oppgave-3', title: 'Framing og diskurs', task: 'Kod seks publiseringer om samme tema.', prompts: ['Hvem definerer problemet?', 'Hvilke årsaker og løsninger fremheves?', 'Hvilke intensjonspåstander kan ikke belegges?'] },
      { id: 'kks-oppgave-4', title: 'Ekspertkildetest', task: 'Kontroller en ekspertuttalelse fra Blindern.', prompts: ['Treffer fagområdet påstanden?', 'Hva sier studien og usikkerheten?', 'Er uttalelsen lik faglig konsensus?'] },
      { id: 'kks-oppgave-5', title: 'Arkiv og versjon', task: 'Sammenlign en aktuell nettside med en arkivert versjon.', prompts: ['Hva er URL, dato og versjon?', 'Hvilke endringer er dokumentert?', 'Hva kan arkivet ikke bevise om sannheten?'] }
    ],
    selfCheck: [
      { question: 'Hva beskriver primærkilde?', answer: 'Kildens relasjon og nærhet til materialet, ikke en garanti for sannhet.' },
      { question: 'Hva gjør en faktasjekk etterprøvbar?', answer: 'Presis påstand, åpne kilder, synlig metode, avgrenset konklusjon og rettelsespraksis.' },
      { question: 'Hva skiller framing fra fabrikasjon?', answer: 'Framing velger og fremhever aspekter; fabrikasjon innfører opplysninger uten faktisk grunnlag.' },
      { question: 'Hva kan nyhetsverdi forklare?', answer: 'Hvorfor hendelser velges og prioriteres, ikke hva som objektivt er viktigst eller sant.' },
      { question: 'Hvorfor er én ekspert ikke konsensus?', answer: 'Konsensus må dokumenteres gjennom relevant faglitteratur og flere kompetente fagmiljøer.' },
      { question: 'Hva må leses før en statistikkgraf?', answer: 'Definisjoner, populasjon, tidsrom, enhet, metadata, manglende verdier og revisjoner.' },
      { question: 'Hva kreves for å kalle feilinnhold desinformasjon?', answer: 'Evidens for at det ble laget eller spredt med vilje for å påvirke eller villede.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({ id, publisher, title, url, source_location, type, label: publisher + ' – ' + title });
const sources = [
  source('kks01-vvp32', 'Norsk Presseforbund', 'Vær Varsom-plakaten 3.2', 'https://www.presse.no/vaer-varsom-plakaten/3-2', 'Punkt 3.2 om kritisk kildevalg, opplysningskontroll, bredde og relevans', 'professional-standards'),
  source('kks02-presse-guide', 'Norsk Presseforbund', 'Faktasjekk, kildekritikk og kildebredde', 'https://www.presse.no/veiledninger/faktasjekk-kildekritikk-og-kildebredde', 'Veiledningens deler om opplysningskontroll, kildekritikk og uavhengige kilder', 'professional-guidance'),
  source('kks03-faktisk', 'Faktisk.no', 'Slik jobber vi', 'https://www.faktisk.no/slik-jobber-vi', 'Delene om faktasjekk som sjanger, avgrenset påstand, åpen metode og ettergåbar konklusjon', 'publisher-methodology'),
  source('kks04-ifcn', 'International Fact-Checking Network', 'The commitments', 'https://ifcncodeofprinciples.poynter.org/the-commitments', 'Prinsippene om upartiskhet, kilder, finansiering, metode og åpen rettelsespraksis', 'international-standard'),
  source('kks05-oslo-insight', 'Oslo kommune', 'Innsyn', 'https://www.oslo.kommune.no/innsyn/', 'Oversikten over politiske saker, postjournal, kommunerevisjon, åpne datasett og økonomiregister', 'municipal-record-system'),
  source('kks06-oslo-law', 'Oslo kommune', 'Innsyn etter offentleglova', 'https://www.oslo.kommune.no/innsyn/innsyn-etter-offentleglova/', 'Delene om rett til saksdokumenter og journaler, unntak, behandling og fulltekstpublisering', 'municipal-guidance'),
  source('kks07-nb-deposit', 'Nasjonalbiblioteket', 'Pliktavlevering', 'https://www.nb.no/tjenester/pliktavlevering/', 'Hovedregelen om avlevering av allment tilgjengelige dokumenter uavhengig av medium', 'national-library-rule'),
  source('kks08-nb-net', 'Nasjonalbiblioteket', 'Nettarkivet', 'https://www.nb.no/samlingen/nettarkivet/', 'Formålet og avsnittet om høsting av norske nettsteder etter pliktavleveringsloven', 'national-web-archive'),
  source('kks09-archive', 'Nasjonalarkivet', 'Veileder for bevaring av nettsteder', 'https://www.nasjonalarkivet.no/veiledere/veileder-for-bevaring-av-nettsteder/', 'Delene om nettsteder som dokumentasjon, høsting, databaser og forskjellen mellom publisert innhold og saksbehandlingsspor', 'archive-guidance'),
  source('kks10-entman', 'ERIC', 'Framing: Toward Clarification of a Fractured Paradigm', 'https://eric.ed.gov/?id=EJ475698', 'Sammendraget og artikkelreferansen til Journal of Communication 43(4), side 51–58', 'research-index'),
  source('kks11-galtung-ruge', 'Journal of Peace Research', 'The Structure of Foreign News', 'https://journals.sagepub.com/doi/10.1177/002234336500200104', 'Artikkelens modell med tolv faktorer for hendelsers sannsynlighet for å bli nyheter', 'research-article'),
  source('kks12-nrk-diversity', 'NRK', 'Hvordan bidro NRK til det norske mediemangfoldet i 2024?', 'https://info.nrk.no/nrks-bidrag-til-mediemangfoldet/hvordan-bidro-nrk-til-det-norske-mediemangfoldet-i-2024/', 'Delene om systematisk kartlegging, tematiske blindsoner og redaksjonelle vurderinger', 'public-broadcaster-account'),
  source('kks13-reuters', 'Reuters', 'Journalistic Standards', 'https://reutersagency.com/about/standards-values/', 'Delene om accuracy, corrections og sourcing samt at nøyaktighet og balanse går foran fart', 'publisher-standards'),
  source('kks14-ap', 'Associated Press', 'Telling the Story', 'https://www.ap.org/about/news-values-and-principles/telling-the-story/', 'Reglene om transparens, navngitte og anonyme kilder, direkte kunnskap og lederkontroll', 'publisher-standards'),
  source('kks15-research-ethics', 'De nasjonale forskningsetiske komiteene', 'Vurderinger knyttet til forskeres formidlingsansvar', 'https://www.forskningsetikk.no/om-oss/komiteer-og-utvalg/nent/uttalelser/vurderinger-knyttet-til-forskeres-formidlingsansvar-saksnr.-2016153', 'Delene om presisjon, gyldighetsområde, rolle, interesse og kommunikasjon av vitenskapelig usikkerhet', 'research-ethics-guidance'),
  source('kks16-oslo-stats', 'Oslo kommune', 'Oslo kommunes statistikkbank', 'https://statistikkbanken.oslo.kommune.no/index.html', 'Oversikten over tema, geografiske nivåer, tidsserier, PxWeb og API-veiledning', 'municipal-statistics'),
  source('kks17-ssb-revision', 'Statistisk sentralbyrå', 'Prinsipper for revisjon i SSB', 'https://www.ssb.no/omssb/kvalitet-i-offisiell-statistikk/prinsipper-for-kommunikasjon-og-formidling/prinsipper-for-revisjon-i-ssb', 'Prinsippene for revisjon av publisert statistikk og dokumentasjon på statistikksiden', 'official-statistics-standard'),
  source('kks18-ssb-quality', 'Statistisk sentralbyrå', 'Rapport om kvalitet i offisiell statistikk 2026', 'https://www.ssb.no/omssb/ssbs-virksomhet/planer-og-meldinger/rapport-om-kvalitet-i-offisiell-statistikk-2026/_/attachment/inline/4189bb86-cdb1-4b0c-ad50-7745a3a5dae6%3Ab2ae3bce7dbe26da729fee0d8bb977f997ec64cc/PM2026-03.pdf', 'Sammendraget og kapitlene om metadata, kvalitetsgjennomgang, registerdata og kvalitetsindikatorer', 'official-statistics-report'),
  source('kks19-media-info', 'Medietilsynet', 'Feil- og desinformasjon', 'https://www.medietilsynet.no/digitale-medier/feil-desinformasjon/', 'Definisjonstabellen som skiller feilinformasjon uten bevisst bedrag fra villet desinformasjon', 'regulator-guidance'),
  source('kks20-government', 'Kultur- og likestillingsdepartementet', 'Strategi for å styrkje motstandskrafta mot desinformasjon 2025–2030', 'https://www.regjeringen.no/no/dokumenter/strategi-for-a-styrkje-motstandskrafta-mot-desinformasjon-2025-2030/id3109255/', 'Innledningen og innsatsområdene om redaktørstyrte medier, kritisk medieforståelse, forskning og samarbeid', 'government-strategy')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('kks-01', 'VVP 3.2 krever kritisk kildevalg, kontroll av opplysninger og bredde og relevans i kildeutvalget.', ['kks01-vvp32', 'kks02-presse-guide'], ['kks-grunnlag-1']),
  claim('kks-02', 'Primær- og sekundærkilde beskriver relasjonen til materialet og gir ikke alene en sannhetsrangering.', ['kks02-presse-guide', 'kks14-ap'], ['kks-grunnlag-1']),
  claim('kks-03', 'Navngivning og mange gjengivelser er ikke det samme som uavhengige kunnskapsveier til en påstand.', ['kks01-vvp32', 'kks14-ap'], ['kks-grunnlag-1']),
  claim('kks-04', 'Faktisk.no avgrenser faktasjekken til en kontrollerbar påstand og viser kildene og veien til konklusjonen.', ['kks03-faktisk'], ['kks-grunnlag-2']),
  claim('kks-05', 'IFCN krever konsistente standarder, kilde- og metodeåpenhet og synlig rettelsespraksis fra faktasjekkere.', ['kks04-ifcn'], ['kks-grunnlag-2']),
  claim('kks-06', 'Verifisering må følge opplysninger tilbake til egne evidensspor og skille uavhengige kilder fra gjentakelser.', ['kks03-faktisk', 'kks14-ap'], ['kks-grunnlag-2']),
  claim('kks-07', 'Oslo kommunes innsynsløsninger gjør politiske saker, postjournal, revisjonsrapporter og åpne datasett søkbare under regelstyrte unntak.', ['kks05-oslo-insight', 'kks06-oslo-law'], ['kks-grunnlag-3']),
  claim('kks-08', 'Nasjonalbiblioteket bevarer allment tilgjengelige dokumenter og høster norske nettsteder som dokumentasjon for ettertiden.', ['kks07-nb-deposit', 'kks08-nb-net'], ['kks-grunnlag-3']),
  claim('kks-09', 'Et arkivert dokument viser innhold og versjon, mens autentisitet, helhet, kontekst og sannhet krever videre analyse.', ['kks08-nb-net', 'kks09-archive'], ['kks-grunnlag-3']),
  claim('kks-10', 'Entmans framingmodell undersøker utvalg og fremtredende plass som definerer problem, årsak, vurdering eller løsning.', ['kks10-entman'], ['kks-fordypning-1']),
  claim('kks-11', 'Ulike innramminger kan bruke de samme korrekte fakta og dokumenterer derfor ikke alene fabrikasjon.', ['kks10-entman'], ['kks-fordypning-1']),
  claim('kks-12', 'Strategisk intensjon må dokumenteres med andre spor enn den observerte tekstvirkningen alene.', ['kks10-entman', 'kks19-media-info'], ['kks-fordypning-1']),
  claim('kks-13', 'Nyhetsdiskurs kan analyseres gjennom gjentatte kategorier, aktørroller, språk og sitatrekkefølge uten å gjøre språk til sannhetsdom.', ['kks10-entman', 'kks11-galtung-ruge'], ['kks-fordypning-2']),
  claim('kks-14', 'Påstander om systematisk mediemakt krever et sammenlignbart materiale over flere saker eller en avgrenset periode.', ['kks11-galtung-ruge', 'kks12-nrk-diversity'], ['kks-fordypning-2']),
  claim('kks-15', 'NRK beskriver systematisk kartlegging av tematiske blindsoner samtidig som redaksjonelle vurderinger styrer det konkrete utvalget.', ['kks12-nrk-diversity'], ['kks-fordypning-2']),
  claim('kks-16', 'Galtung og Ruge presenterte en modell med tolv faktorer som påvirker hendelsers sannsynlighet for å bli nyheter.', ['kks11-galtung-ruge'], ['kks-fordypning-3']),
  claim('kks-17', 'Synlighet og fravær kan måle redaksjonell prioritering, men viser ikke alene objektiv viktighet eller sensur.', ['kks11-galtung-ruge', 'kks12-nrk-diversity'], ['kks-fordypning-3']),
  claim('kks-18', 'Reuters prioriterer nøyaktighet og balanse foran fart og krever åpen retting og ærlig kildebruk.', ['kks13-reuters'], ['kks-fordypning-3']),
  claim('kks-19', 'Ekspertens institusjon og tittel må prøves mot konkret fagområde, metode, interesse og kunnskapsgrunnlag.', ['kks14-ap', 'kks15-research-ethics'], ['kks-anvendelse-1']),
  claim('kks-20', 'Forskningsetiske retningslinjer krever tydelig formidling av presisjon, usikkerhet og kunnskapens gyldighetsområde.', ['kks15-research-ethics'], ['kks-anvendelse-1']),
  claim('kks-21', 'En enkelt ekspertuttalelse kan ikke alene dokumentere faglig konsensus eller berettige mekanisk balanse mot evidensvekten.', ['kks15-research-ethics', 'kks13-reuters'], ['kks-anvendelse-1']),
  claim('kks-22', 'Oslo kommunes statistikkbank publiserer tidsserier på flere geografiske nivåer i et PxWeb-basert system.', ['kks16-oslo-stats'], ['kks-anvendelse-2']),
  claim('kks-23', 'SSB dokumenterer prinsipper for revisjon og et kvalitetssystem med metadata, gjennomganger og indikatorer.', ['kks17-ssb-revision', 'kks18-ssb-quality'], ['kks-anvendelse-2']),
  claim('kks-24', 'Datajournalistikk må skille rådata, definisjoner, analyse og visualisering; samvariasjon alene beviser ikke årsak.', ['kks16-oslo-stats', 'kks18-ssb-quality'], ['kks-anvendelse-2']),
  claim('kks-25', 'Medietilsynet skiller feilinformasjon uten bevisst bedrag fra desinformasjon som lages eller spres med vilje for å påvirke.', ['kks19-media-info'], ['kks-anvendelse-3']),
  claim('kks-26', 'Norges desinformasjonsstrategi kombinerer redaktørstyrte medier, kritisk medieforståelse, forskning og samarbeid som motstandskraftstiltak.', ['kks20-government'], ['kks-anvendelse-3']),
  claim('kks-27', 'En etterprøvbar evidenslogg må bevare påstand, tidspunkt, kilde, dokumentversjon, data, metode, alternativer, rettelser og usikkerhet.', ['kks03-faktisk', 'kks09-archive', 'kks17-ssb-revision'], ['kks-anvendelse-3'])
];

const claimsDoc = { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'media', chapter_id: CHAPTER_ID, sources, claims };

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.media;
  assert(subject && Array.isArray(subject.chapters), 'Media mangler kapittelliste i fagverkregisteret');
  assert(subject.chapters[0]?.id === 'presse-redaksjoner-og-avishus', 'Første Media-kapittel er ikke bevart');
  assert(subject.chapters[1]?.id === 'offentlighet-ytringsfrihet-og-medieetikk', 'Andre Media-kapittel er ikke bevart');
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: CHAPTER_FILE, primary_domain_id: 'kilder_kritikk_sannhet', emne_ids: emneIds };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) { assert(subject.chapters.length === 2, 'Media må starte dette steget med nøyaktig to kapitler'); subject.chapters.push(registryChapter); }
  else { assert(existingIndex === 2 && subject.chapters.length === 3, 'Reproduksjon forventer Media-kapittelet som nummer tre'); subject.chapters[existingIndex] = registryChapter; }
  subject.canonicalModel.note = 'Medias seks canonicale hovedområder eier rendererstrukturen. Presse, redaksjoner og avishus; Offentlighet, ytringsfrihet og medieetikk; og Kilder, kritikk og sannhet er materialisert som fulltekst- og claimsporede kapitler. Tre hovedområder står igjen. Populærkultur bevares som et komplett nested mediefelt.';
  registry.version = '2.61.0'; registry.updatedAt = '2026-08-10'; writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'media');
  assert(subject?.editorialStatus === 'chapters_in_progress', 'Media må starte fra dokumentert kapittelproduksjon');
  subject.editorialStatus = 'chapters_in_progress'; subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Media har 6 canonicale hovedområder og 120 aktive hovedemner. Tre områder er nå materialisert: Presse, redaksjoner og avishus (21 emner), Offentlighet, ytringsfrihet og medieetikk (21 emner) og Kilder, kritikk og sannhet (20 emner). Det nye kapittelet har 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 27 verifiserte claims, 20 inspiserbare kilder og alle områdets 20 canonicale metoder. Totalt er 62 av 120 hovedemner dekket; tre områder gjenstår. Populærkultur forblir et komplett nested mediefelt.';
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister'); assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  writeJson(CHAPTER_FILE, chapter); writeJson(CHAPTER_DIR + '/brief.json', brief);
  for (const [file, value] of Object.entries(modules)) writeJson(CHAPTER_DIR + '/' + file, value);
  writeJson(CHAPTER_DIR + '/claims.json', claimsDoc); updateRegistry(); updateStatus();
  console.log('Materialiserte Media/' + CHAPTER_ID + ': ' + emneIds.length + ' emner, 3 moduler, ' + claims.length + ' claims og ' + sources.length + ' kilder.');
}

main();
