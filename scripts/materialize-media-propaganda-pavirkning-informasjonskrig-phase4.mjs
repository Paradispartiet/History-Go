#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'propaganda-pavirkning-og-informasjonskrig';
const CHAPTER_DIR = 'data/fagverk/media/' + CHAPTER_ID;
const CHAPTER_FILE = CHAPTER_DIR + '.json';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), JSON.stringify(value, null, 2) + '\n'); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_media_bots_troll', 'em_media_faktasjekk_motstand', 'em_media_frykt_og_media',
  'em_media_informasjonskontroll', 'em_media_kampanjestrategi', 'em_media_konspirasjon',
  'em_media_koordinerte_pavirkningsnettverk', 'em_media_krigsbilder', 'em_media_kriseretorikk',
  'em_media_mediepolarisering', 'em_media_mistillitsfortelling', 'em_media_motpropaganda',
  'em_media_opinion', 'em_media_politisk_kommunikasjon', 'em_media_propaganda',
  'em_media_sensur', 'em_media_tillitssvikt', 'em_media_visuell_pavirking'
];
const methodIds = [
  'met_media_botanalyse', 'met_media_nettverksanalyse', 'met_media_motpropagandaanalyse',
  'met_media_motstandsanalyse', 'met_media_retorikkanalyse', 'met_media_fryktanalyse',
  'met_media_sensuranalyse', 'met_media_kontrollanalyse', 'met_media_politisk_kommunikasjonsanalyse',
  'met_media_kampanjeanalyse', 'met_media_konspirasjonsanalyse', 'met_media_mistillitsanalyse',
  'met_media_krigsbildeanalyse', 'met_media_visuell_pavirkningsanalyse',
  'met_media_tillitssviktanalyse', 'met_media_polariseringsanalyse',
  'met_media_propagandaanalyse', 'met_media_opinionsanalyse'
];
const relatedPlaces = [
  { id: 'stortinget', name: 'Stortinget', role: 'Skill åpen politisk argumentasjon, kampanje og opinionsarbeid fra fordekt koordinering og utenlandsk påvirkning.' },
  { id: 'regjeringskvartalet', name: 'Regjeringskvartalet', role: 'Undersøk hvordan myndigheter kommuniserer risiko, krise og sikkerhet uten å gjøre all strategisk kommunikasjon til propaganda.' },
  { id: 'youngstorget', name: 'Youngstorget', role: 'Følg slagord, plakater, taler, demonstrasjoner og motbudskap som synlige forsøk på mobilisering i offentligheten.' },
  { id: 'nrk_huset_marienlyst', name: 'NRK-huset på Marienlyst', role: 'Analyser redaksjonell verifisering, krigsbilder, kildebeskyttelse og allmennkringkasterens uavhengighet under informasjonskonflikt.' }
];
const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({ id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds });

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'media', subject_id: 'media',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'propaganda_pavirkning_informasjonskrig',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Propaganda, påvirkning og informasjonskrig: kampen om virkeligheten',
  subtitle: 'Fra åpen politisk kommunikasjon til fordekte nettverk, krigsbilder, sensur, konspirasjoner og motstand',
  lead: 'Påvirkning er en normal del av offentligheten, men ikke alle påvirkningsforsøk er like åpne, sanne eller legitime. Kapittelet lærer brukeren å rekonstruere avsender, målgruppe, budskap, kanal, koordinering, finansiering og effekt før ord som propaganda, bot, troll, sensur eller informasjonskrig brukes. Slik skilles kritisk analyse fra både naivitet og grunnløs mistanke.',
  learningObjectives: [
    'skille åpen politisk kommunikasjon, kampanje, propaganda og fordekt påvirkningsoperasjon',
    'analysere avsender, mål, målgruppe, budskap, kanal, timing og ønsket handling',
    'påvise koordinering gjennom nettverks- og tidsdata uten å gjøre likt språk til bevis på felles kontroll',
    'skille automatiserte kontoer, menneskelige operatører, trollatferd og vanlige meningsytringer',
    'analysere konspirasjons- og mistillitsfortellinger uten å avvise dokumenterte maktforhold',
    'prøve kriseretorikk, fryktappeller og krigsbilder mot kilde, kontekst og visuell redigering',
    'skille statlig sensur, institusjonell informasjonskontroll og redaksjonell prioritering',
    'bruke faktasjekk, prebunking og motbudskap uten å gjøre korrigering til ny propaganda'
  ],
  diagnosticQuestions: [
    { question: 'Er all politisk kommunikasjon propaganda?', answer: 'Nei. Analysen må vise systematisk påvirkningsmål, virkemidler, avsenderforhold og forholdet til sannhet og åpenhet.' },
    { question: 'Beviser lik ordlyd at kontoer styres fra samme sted?', answer: 'Nei. Koordinering krever flere spor, som timing, delingsmønster, infrastruktur, kontoatferd eller dokumentert kontroll.' },
    { question: 'Er enhver anonym konto en bot eller et troll?', answer: 'Nei. Automatisering og manipulerende atferd må påvises; anonymitet eller upopulær mening er ikke nok.' },
    { question: 'Er en faktasjekk det samme som motpropaganda?', answer: 'Nei. En uavhengig faktasjekk viser etterprøvbar metode og kilder; motpropaganda kan selv være strategisk og selektiv.' }
  ],
  relatedPlaces,
  moduleFiles: [CHAPTER_DIR + '/01-grunnlag.json', CHAPTER_DIR + '/02-fordypning.json', CHAPTER_DIR + '/03-anvendelse.json'],
  briefFile: CHAPTER_DIR + '/brief.json', claimsFile: CHAPTER_DIR + '/claims.json'
};

const distinctions = [
  'påvirkning vs manipulasjon', 'politisk kommunikasjon vs propaganda', 'kampanje vs fordekt operasjon',
  'opinion vs målt opinion', 'intensjon vs dokumentert effekt', 'desinformasjon vs feilinformasjon',
  'FIMI vs all utenlandsk tale', 'koordinering vs likhet', 'bot vs menneskelig konto',
  'trollatferd vs upopulær mening', 'nettverksspor vs sikker attribusjon', 'sensur vs redaksjonelt utvalg',
  'informasjonskontroll vs kildevern', 'dokumentert sammensvergelse vs konspirasjonsfortelling',
  'mistillitsfortelling vs empirisk kritikk', 'polarisering vs uenighet', 'fryktappell vs dokumentert risiko',
  'kriseretorikk vs krisefakta', 'krigsbilde vs hele hendelsen', 'visuell virkning vs autentisitet',
  'faktasjekk vs endelig sannhet', 'motpropaganda vs uavhengig korrigering',
  'rekkevidde vs opinionsendring', 'tillitsmåling vs sannhetsdom'
];
const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'media', chapter_id: CHAPTER_ID,
  primary_domain_id: 'propaganda_pavirkning_informasjonskrig', relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Medias femte canonicale domene med claimsporet undervisning i propaganda, politisk kommunikasjon, koordinert påvirkning, bots, troll, konspirasjoner, sensur, krigsbilder, tillit og motstand.',
  audience: 'Brukere som skal kunne identifisere og avgrense påvirkningsprosesser uten å gjøre uenighet, anonymitet, utenlandsk opprinnelse eller strategisk kommunikasjon til automatisk bevis på informasjonskrig.',
  learningArc: ['kartlegge en åpen politisk kampanje', 'klassifisere propagandaens virkemidler', 'bygge en FIMI-hypotese med attribusjonsgrader', 'analysere bot- og trollnettverk', 'teste konspirasjons- og mistillitsfortellinger', 'verifisere krigsbilder og kriseretorikk', 'skille sensur og redaksjonell kontroll', 'evaluere faktasjekk og mottiltak'],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds, requiredCriticalDistinctions: distinctions,
  sourceStrategy: {
    priority: ['norske myndighets- og forskningskilder om påvirkningsoperasjoner og valg', 'EU-, Europaråds- og OECD-rammeverk om FIMI og informasjonsintegritet', 'plattformdokumentasjon og primærforskning om koordinering, emosjon og spredning', 'arkiv-, presseetiske og museumskilder om propaganda, sensur og krigsbilder'],
    minimumExternalSources: 18, claimLevelTrace: true, sourceLocationsRequired: true, currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: ['propaganda, opinion og politisk kommunikasjon', 'kampanjestrategi og politisk reklame', 'FIMI, bots, troll og koordinerte nettverk', 'konspirasjon, mistillit, polarisering og tillitssvikt', 'kriseretorikk, frykt og visuell påvirkning', 'krigsbilder, sensur og informasjonskontroll', 'faktasjekk, motpropaganda og demokratisk motstand'],
    excluded: ['uenighet brukt som bevis på polarisering', 'anonym konto omtalt automatisk som bot', 'lik ordlyd brukt alene som koordineringsbevis', 'utenlandsk avsender omtalt automatisk som ulovlig påvirkning', 'faktasjekk omtalt som ufeilbarlig', 'fagkart brukt som faktakilde']
  },
  qa: { exactCanonicalCoverage: '18/18', minimumModules: 3, minimumSections: 9, paragraphClaimTraceRequired: true, rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction'] }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('ppi-grunnlag-1', 'Påvirkning må klassifiseres før den fordømmes', [
        'Politisk kommunikasjon ved Stortinget og Youngstorget er åpen påvirkning: avsenderen argumenterer for støtte, handling eller fortolkning. Propagandaanalysen begynner først når virkemidler, ensidighet, gjentakelse, følelsesstyring og forholdet til motbevis dokumenteres.',
        'EU-reglene for politisk reklame krever merking og opplysninger om sponsor og målretting. Åpen kampanje kan være strategisk og følelsesladet uten å være fordekt; analysen skal skille lovlig overtalelse fra skjult finansiering eller manipulerende identitet.',
        'Opinion er ikke en samlet vilje som kan leses ut av slagord, likes eller én meningsmåling. Opinionsanalyse må registrere utvalg, spørsmålsformulering, tidspunkt, usikkerhet og forskjellen mellom uttrykt holdning og faktisk handling.'
      ], [['ppi-01'], ['ppi-02'], ['ppi-03']], ['Navngi avsender, målgruppe, mål og ønsket handling.', 'Skill strategisk overtalelse fra fordekt identitet og dokumentert bedrag.'], [['ppi-01', 'ppi-02'], ['ppi-02', 'ppi-03']]),
      section('ppi-grunnlag-2', 'Påvirkningsoperasjoner vurderes som mønstre av aktør og atferd', [
        'FFI beskriver påvirkningsoperasjoner som planlagte forsøk på å forme oppfatninger og beslutninger, ofte gjennom flere åpne og skjulte virkemidler. En påvirkningsanalyse må derfor følge operasjonens mål, aktører, ressurser, kanaler og tidslinje – ikke bare ett kontroversielt innlegg.',
        'EEAS definerer FIMI som hovedsakelig ikke-ulovlige, manipulerende mønstre som utføres intensjonelt og koordinert og kan skade verdier eller politiske prosesser. Utenlandsk avsender eller kritikk av Norge er ikke alene nok til å klassifisere FIMI.',
        'Norsk straffelov rammer bestemte skadelige påvirkningsbidrag på vegne av fremmed etterretning. Det rettslige sporet krever aktørforbindelse, formål og skadevilkår; det er snevrere enn den brede mediefaglige kategorien påvirkning.'
      ], [['ppi-04'], ['ppi-05'], ['ppi-06']], ['Bygg hypotesen av aktør, atferd, innhold, målgruppe og effekt.', 'Skill analytisk påvirkning fra juridisk straffbar operasjon.'], [['ppi-04', 'ppi-05'], ['ppi-06']]),
      section('ppi-grunnlag-3', 'Propaganda, sensur og kontroll virker gjennom institusjoner', [
        'USHMM dokumenterer hvordan nazistisk propaganda brukte presse, radio, film, kunst og undervisning til å forme opinion og legitimere forfølgelse og krig. Propaganda er derfor mer enn falske enkeltsetninger: den kan organisere identitet, fiendebilder og aksept over tid.',
        'Arkivverket bevarer omfattende arkiver etter Nasjonal Samling og NS-staten. Materialet må leses som spor etter organisasjon og maktbruk, ikke som nøytral beskrivelse; arkivering er dokumentasjon, ikke godkjenning av budskapet.',
        'Sensur er statlig eller annen maktbasert hindring av tilgang og ytring, mens en redaksjon alltid velger hva den publiserer. NRKs lovfestede og presseetiske uavhengighet viser hvorfor redaksjonelt utvalg ikke automatisk kan kalles statlig sensur.'
      ], [['ppi-07'], ['ppi-08'], ['ppi-09']], ['Analyser kontroll over kanalene i tillegg til ordene.', 'Skill arkivert propaganda og redaksjonelt utvalg fra tilslutning og sensur.'], [['ppi-07', 'ppi-08'], ['ppi-09']])
    ],
    concepts: [
      { id: 'propaganda', term: 'Propaganda', definition: 'Systematisk kommunikasjon som søker å forme oppfatning eller handling gjennom selektiv framstilling, gjentakelse, symboler og følelsesmessige eller sosiale virkemidler.' },
      { id: 'pavirkningsoperasjon', term: 'Påvirkningsoperasjon', definition: 'Koordinert aktivitet der aktører bruker kommunikative og andre virkemidler for å endre målgruppers oppfatninger, beslutninger eller atferd.' },
      { id: 'fimi', term: 'FIMI', definition: 'Foreign Information Manipulation and Interference: intensjonell og koordinert manipulerende atferd med utenlandsk aktørtilknytning og mulig skade på verdier eller politiske prosesser.' },
      { id: 'attribusjon', term: 'Attribusjon', definition: 'Gradert vurdering av hvem som står bak en aktivitet, basert på tekniske, organisatoriske, økonomiske og atferdsmessige spor.' },
      { id: 'konspirasjonsfortelling', term: 'Konspirasjonsfortelling', definition: 'Forklaringsmønster som tilskriver skjult samordning og omfattende kontroll uten at påstanden underbygges proporsjonalt med etterprøvbare bevis.' },
      { id: 'informasjonsintegritet', term: 'Informasjonsintegritet', definition: 'Vilkår som gjør informasjonssamfunnet etterprøvbart gjennom åpne kilder, pluralitet, ansvar, uavhengige medier og robuste institusjoner.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('ppi-fordypning-1', 'Koordinering, bot og troll er tre forskjellige analyseobjekter', [
        'Meta definerer koordinert uautentisk atferd som strategisk manipulering av offentlig debatt der falske kontoer er sentrale. Definisjonen er atferdsbasert: sannheten i hvert innlegg avgjør ikke alene om nettverket er koordinert eller uautentisk.',
        'En bot er en konto eller prosess med automatisert aktivitet; et troll beskriver manipulerende eller provoserende menneskelig atferd. Høy aktivitet, anonymitet eller upopulær mening kan gi en hypotese, men kan ikke alene klassifisere kontoen.',
        'FFIs nettverksanalyse kobler tidsmønstre, delinger, kontoer, domener og gjentatte narrativer. Lik ordlyd kan også skyldes nyhetsbyrå, slagord eller spontan imitasjon, så sikker attribusjon krever flere uavhengige spor.'
      ], [['ppi-10'], ['ppi-11'], ['ppi-12']], ['Skill automatisering, identitetsbedrag og koordinering.', 'Rapporter attribusjon som gradert konklusjon med alternative forklaringer.'], [['ppi-10', 'ppi-11'], ['ppi-12']]),
      section('ppi-fordypning-2', 'Konspirasjon og mistillit må prøves mot bevis og motforklaringer', [
        'Europarådets rammeverk skiller feilinformasjon, desinformasjon og skadegjørende korrekt informasjon etter falskhet, hensikt og skade. En konspirasjonsfortelling kan blande sanne dokumenter, feil kontekst og ubekreftede forbindelser i én selvforseglende helhet.',
        'Eksperimentell forskning behandler konspirasjonstenkning som politisk resonnering under usikkerhet, ikke som automatisk sykdom eller dumskap. Analysen skal derfor teste påstander, kilder og falsifiserbarhet uten å diskreditere personen som stiller kritiske spørsmål.',
        'SSB målte lavere medietillit i 2025 enn i 2022, men advarer mot en enkel krisefortelling. Tillit er en målt holdning som varierer mellom grupper og tid; lav tillit beviser verken at mediene lyver eller at publikum er manipulert.'
      ], [['ppi-13'], ['ppi-14'], ['ppi-15']], ['Skill dokumentert maktkritikk fra en ufalsifiserbar totalfortelling.', 'Les tillit og polarisering som graderte mål, ikke moralske merkelapper.'], [['ppi-13', 'ppi-14'], ['ppi-15']]),
      section('ppi-fordypning-3', 'Frykt og bilder kan forsterke budskap uten å bevise effekt', [
        'Primærforskning viser at moralsk-emotive ord kan øke deling i politiske nettverk. Det dokumenterer en gjennomsnittlig spredningssammenheng, ikke at enhver fryktappell virker eller at følelsesbruk gjør et budskap usant.',
        'Forskning på Twitter-data fant at falske nyheter i datasettet spredte seg raskere og bredere enn sanne, og at mennesker – ikke bare bots – bidro. Resultatet er plattform- og tidsavgrenset og må ikke gjøres til en universell lov om alle medier.',
        'Et krigsbilde viser et utsnitt valgt av fotograf, kilde og redaksjon. Autentisitet, opptakssted, tidspunkt, motiv, beskjæring, bildetekst og fravær utenfor rammen må kontrolleres før bildet brukes som bevis for hele hendelsen eller konflikten.'
      ], [['ppi-16'], ['ppi-17'], ['ppi-18']], ['Skill følelsesmessig virkning fra sannhetsverdi og dokumentert effekt.', 'Verifiser bilde, kontekst og redigering før fortolkning.'], [['ppi-16', 'ppi-17'], ['ppi-18']])
    ],
    workedExamples: [
      { id: 'ppi-eksempel-1', title: 'Test et koordinert nettverk', situation: 'Tjue kontoer publiserer samme slagord samtidig.', analysis: ['Lås tidsvindu, kontoalder, klient og delingsgraf.', 'Test nyhetsbyrå, kampanjemateriell og spontan kopiering som alternativer.', 'Grader koordinering og attribusjon hver for seg.'] },
      { id: 'ppi-eksempel-2', title: 'Analyser en kriseappell', situation: 'En myndighet advarer om alvorlig fare.', analysis: ['Finn risikogrunnlag, avsenderansvar og konkret handlingsråd.', 'Skill dokumentert sannsynlighet fra retorisk forsterkning.', 'Sammenlign oppdateringer og rettelser over tid.'] },
      { id: 'ppi-eksempel-3', title: 'Verifiser et krigsbilde', situation: 'Et dramatisk bilde deles uten kilde.', analysis: ['Finn tidligste fil og kildekjede.', 'Kontroller sted, tid, metadata og visuelle landemerker.', 'Skill hva bildet viser fra påstander om årsak og ansvar.'] }
    ],
    commonMisconceptions: [
      { claim: 'All politisk kommunikasjon er propaganda.', correction: 'Åpen argumentasjon og kampanje er normal demokratisk påvirkning; propaganda må påvises gjennom systematisk virkemiddel- og maktanalyse.' },
      { claim: 'Lik ordlyd beviser en trollfabrikk.', correction: 'Likhet er ett nettverksspor; koordinering og kontroll krever timing, relasjoner, infrastruktur eller andre uavhengige funn.' },
      { claim: 'En anonym, aktiv konto er en bot.', correction: 'Botanalyse må vise automatisert atferd eller teknisk kontroll; anonymitet og tempo er ikke tilstrekkelig.' },
      { claim: 'Lav medietillit betyr at mediene er usanne.', correction: 'Tillit er en holdningsmåling; sannhet og kvalitet må vurderes gjennom konkrete publiseringer og metoder.' },
      { claim: 'Et ekte krigsbilde forklarer hele konflikten.', correction: 'Et autentisk bilde kan være korrekt, men fortsatt utsnittspreget, feiltekstet eller utilstrekkelig som bevis for årsak og ansvar.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('ppi-anvendelse-1', 'Valgkampanalyse følger åpne og skjulte påvirkningsspor samtidig', [
        'FFIs kartlegging av stortingsvalget 2025 analyserte over 22 millioner innlegg og kommentarer og fant et mer komplekst og lite gjennomsiktig informasjonsmiljø. Omfanget viser behovet for systematisk kartlegging, men et stort datasett gjør ikke enhver utenlandsk omtale til operasjon.',
        'Ved Stortinget må en kampanjeanalyse skille partiets åpne budskap, betalt politisk reklame, organisk støtte og mulige fordekte nettverk. EU-reglene gjør sponsor, merking og målretting til egne spor, mens innholdets sannhet fortsatt må etterprøves separat.',
        'Medietilsynets studie av unge førstegangsvelgere viser hvordan politikk møtes gjennom feed, følelser og påvirkning. Sårbarhet betyr ikke passivitet: brukerne vurderer, diskuterer og avviser også budskap, så opinionsendring kan ikke utledes direkte av rekkevidde.'
      ], [['ppi-19'], ['ppi-20'], ['ppi-21']], ['Kartlegg åpen kampanje og fordekte hypoteser i separate spor.', 'Skill eksponering og rekkevidde fra dokumentert opinionsendring.'], [['ppi-19', 'ppi-20'], ['ppi-21']]),
      section('ppi-anvendelse-2', 'Motstand virker best når metode og rolle er synlig', [
        'OECD anbefaler et bredt integritetsperspektiv med transparente plattformer, pluralistiske medier, samfunnsmotstand og ansvarlige institusjoner. Mottiltak bør styrke tilgang til etterprøvbar informasjon, ikke gi staten en generell sannhetskontroll.',
        'En faktasjekk ved NRK eller en uavhengig redaksjon må isolere en kontrollerbar påstand, vise kilder, dokumentere vurderingen og rette feil. Vær Varsom-plakatens krav om kildekritikk og opplysningskontroll gjør metoden viktigere enn autoritetsstempelet.',
        'Motpropaganda kan avsløre løgn, men kan også speile motpartens seleksjon og følelsesgrep. Uavhengig korrigering oppgir usikkerhet og motbevis; prebunking forklarer manipulasjonsteknikken før møte med et konkret falskt narrativ.'
      ], [['ppi-22'], ['ppi-23'], ['ppi-24']], ['Bygg robusthet gjennom åpne metoder og flere uavhengige kilder.', 'Skill faktasjekk, prebunking og strategisk motpropaganda.'], [['ppi-22', 'ppi-23'], ['ppi-24']]),
      section('ppi-anvendelse-3', 'Krigs- og krisekommunikasjon krever to parallelle kontrollspor', [
        'Regjeringskvartalet må kommunisere risiko og handlingsråd raskt i krise. Analysen skal kontrollere faktagrunnlag, sannsynlighet, ansvar og revisjoner, samtidig som retoriske fryktgrep, fiendebilder og ønsket lydighet undersøkes separat.',
        'Ved NRK-huset krever krigsbilder både teknisk verifisering og redaksjonell skade-/relevansvurdering. At et bilde er autentisk avgjør ikke om identifisering, eksponering eller publisering er etisk forsvarlig, og tilbakeholdelse er ikke automatisk sensur.',
        'Informasjonskontroll kan skjule overgrep ved å begrense presse, arkiv og kilder. Samtidig kan kildevern og operative sikkerhetshensyn begrense detaljer legitimt; analysen må navngi hvem som holder tilbake hva, med hvilket grunnlag, hvor lenge og med hvilken klagevei.'
      ], [['ppi-25'], ['ppi-26'], ['ppi-27']], ['Før faktakontroll og retorikkanalyse som parallelle spor.', 'Skill legitim beskyttelse fra maktbasert skjuling gjennom konkret prosedyre.'], [['ppi-25'], ['ppi-26', 'ppi-27']])
    ],
    applicationTasks: [
      { id: 'ppi-oppgave-1', title: 'Kampanjekart', task: 'Kartlegg ett politisk budskap fra Youngstorget til digitale kanaler.', prompts: ['Hvem er åpen avsender og sponsor?', 'Hvilke målgrupper og handlinger søkes?', 'Hvilke deler er betalt, organisk eller ukjent?'] },
      { id: 'ppi-oppgave-2', title: 'Koordineringsaudit', task: 'Undersøk en klynge kontoer med likt budskap.', prompts: ['Hvilke tids- og nettverksspor finnes?', 'Hvilke alternative forklaringer må testes?', 'Hvor sikker er koordinering og attribusjon?'] },
      { id: 'ppi-oppgave-3', title: 'Mistillitsfortelling', task: 'Dekomponer en påstand om skjult total kontroll.', prompts: ['Hvilke deler er dokumentert?', 'Hva er antatt eller ufalsifiserbart?', 'Hvilket funn ville svekke fortellingen?'] },
      { id: 'ppi-oppgave-4', title: 'Krigsbildeprotokoll', task: 'Verifiser ett mye delt bilde fra en konflikt.', prompts: ['Hva er tidligste kilde?', 'Hva viser og viser ikke utsnittet?', 'Hvilke etiske hensyn gjelder publisering?'] },
      { id: 'ppi-oppgave-5', title: 'Motstandsdesign', task: 'Lag en korreksjon uten propagandistisk speiling.', prompts: ['Hvilken kontrollerbar påstand korrigeres?', 'Hvordan synliggjøres kilde og usikkerhet?', 'Hvordan måles forståelse uten å forveksle rekkevidde med effekt?'] }
    ],
    selfCheck: [
      { question: 'Hva skiller propaganda fra all politisk kommunikasjon?', answer: 'Propaganda må vises som et systematisk påvirkningsmønster med bestemte virkemidler, seleksjon og maktforhold; politisk argumentasjon er en bredere kategori.' },
      { question: 'Hva kreves for å påstå koordinering?', answer: 'Flere samstemte spor i timing, nettverk, kontoatferd, infrastruktur eller kontroll, samt testing av alternative forklaringer.' },
      { question: 'Hva skiller bot fra troll?', answer: 'Bot viser automatisering; troll beskriver manipulerende menneskelig atferd. En konto kan være begge deler, én av delene eller ingen.' },
      { question: 'Hvorfor er FIMI ikke det samme som all utenlandsk tale?', answer: 'FIMI krever manipulerende, intensjonell og koordinert atferd med mulig skade på verdier eller politiske prosesser.' },
      { question: 'Hva gjør en konspirasjonsfortelling selvforseglende?', answer: 'Motbevis omtolkes som del av sammensvergelsen, slik at påstanden ikke lenger kan svekkes av nye funn.' },
      { question: 'Hva beviser et autentisk krigsbilde?', answer: 'At et bestemt utsnitt sannsynligvis er ekte; årsak, ansvar, representativitet og etisk publisering krever egne spor.' },
      { question: 'Hva skiller faktasjekk fra motpropaganda?', answer: 'Faktasjekken viser avgrenset påstand, åpne kilder, metode og korrigerbarhet; motpropaganda er definert av strategisk kamp mot et annet budskap.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({ id, publisher, title, url, source_location, type, label: publisher + ' – ' + title });
const sources = [
  source('ppi01-ffi-project', 'Forsvarets forskningsinstitutt', 'Propaganda, desinformasjon og påvirkningsoperasjoner', 'https://www.ffi.no/forskning/prosjekter/propaganda-desinformasjon-og-pavirkningsoperasjoner', 'Prosjektbeskrivelsen om skjult påvirkning, sosiale medier, gjenkjenning og samfunnets motstandskraft', 'defence-research-programme'),
  source('ppi02-eu-ads', 'Den europeiske union', 'Regulation (EU) 2024/900 on political advertising', 'https://eur-lex.europa.eu/eli/reg/2024/900/oj/eng', 'Artiklene om merking, sponsoropplysninger, transparensmeldinger og målretting av politisk reklame', 'eu-regulation'),
  source('ppi03-oecd', 'OECD', 'Facts not Fakes: Tackling Disinformation, Strengthening Information Integrity', 'https://www.oecd.org/en/publications/facts-not-fakes-tackling-disinformation-strengthening-information-integrity_d909ff7a-en/full-report.html', 'Sammendraget og rammeverket om kildemangfold, plattformansvar, samfunnsrobusthet og institusjoner', 'intergovernmental-report'),
  source('ppi04-ffi-social', 'Forsvarets forskningsinstitutt', 'Påvirkningsoperasjoner i sosiale medier – oversikt og utfordringer', 'https://www.ffi.no/publikasjoner/arkiv/pavirkningsoperasjoner-i-sosiale-medier-oversikt-og-utfordringer', 'Sammendraget og rapportdelene om statlige aktører, mål, virkemidler, sosiale medier og håndtering', 'defence-research-report'),
  source('ppi05-eeas', 'European External Action Service', 'Information Integrity and Countering FIMI', 'https://www.eeas.europa.eu/eeas/information-integrity-and-countering-foreign-information-manipulation-interference-fimi_en', 'Definisjonen av FIMI som hovedsakelig ikke-ulovlig, manipulerende, intensjonell og koordinert atferd', 'eu-foreign-service-framework'),
  source('ppi06-law', 'Justis- og beredskapsdepartementet', 'Straffbart å bidra i skadelige påvirkningsoperasjoner', 'https://www.regjeringen.no/no/aktuelt/fra-1.-juli-er-det-straffbart-a-bidra-i-skadelige-pavirkningsoperasjoner-pa-vegne-av-utenlandsk-etterretning/id3041452/', 'Beskrivelsen av aktørtilknytning, påvirkningsformål og skade på betydelige samfunnsinteresser', 'government-legal-guidance'),
  source('ppi07-ushmm', 'United States Holocaust Memorial Museum', 'Nazi Propaganda', 'https://encyclopedia.ushmm.org/content/en/article/nazi-propaganda', 'Delene om propaganda gjennom presse, radio, film, kunst og undervisning samt mobilisering og fiendebilder', 'museum-historical-documentation'),
  source('ppi08-arkivverket', 'Arkivverket', 'Nasjonal Samling', 'https://www.arkivverket.no/18829/', 'Oversikten over arkiver etter NS-partiet, organisasjonene, medlemmene og NS-statens departementer', 'national-archive-documentation'),
  source('ppi09-nrk', 'Medietilsynet', 'Allmennkringkastingsrapporten 2022 – NRK', 'https://www.medietilsynet.no/globalassets/publikasjoner/allmennkringkastingsrapporter/230612_allmennkringkasting_2022_nrk.pdf', 'Delene om NRKs redaksjonelle uavhengighet, balanse over tid, presseetikk og allmennkringkastingsoppdrag', 'regulator-report'),
  source('ppi10-meta', 'Meta', 'July 2021 Coordinated Inauthentic Behavior Report', 'https://about.fb.com/news/2021/08/july-2021-coordinated-inauthentic-behavior-report/', 'Definisjonen av koordinert uautentisk atferd og skillet mellom atferd, falske kontoer og innhold', 'platform-threat-report'),
  source('ppi11-meta-policy', 'Meta Transparency Center', 'Inauthentic Behavior', 'https://transparency.meta.com/policies/community-standards/inauthentic-behavior/', 'Policydefinisjonene av uautentiske aktiva, identitetsbedrag, nettverkskontroll og manipulerende atferd', 'platform-policy'),
  source('ppi12-ffi-robust', 'Forsvarets forskningsinstitutt', 'Hvordan gjøre samfunnet mer robust mot uønsket påvirkning i sosiale medier', 'https://www.ffi.no/publikasjoner/arkiv/hvordan-gjore-samfunnet-mer-robust-mot-uonsket-pavirkning-i-sosiale-medier', 'Rapportens sammendrag om fordekt opphav, digitale metoder, nettverksanalyse og samfunnets sårbarheter', 'defence-research-report'),
  source('ppi13-coe', 'Europarådet', 'Information Disorder: Toward an Interdisciplinary Framework', 'https://edoc.coe.int/en/media/7495-information-disorder-toward-an-interdisciplinary-framework-for-research-and-policy-making.html', 'Rammeverket som skiller mis-, dis- og mal-information etter falskhet, skade og intensjon', 'intergovernmental-research-report'),
  source('ppi14-conspiracy', 'Cambridge University Press', 'Is Belief in Conspiracy Theories Pathological?', 'https://www.cambridge.org/core/journals/british-journal-of-political-science/article/is-belief-in-conspiracy-theories-pathological-a-survey-experiment-on-the-cognitive-roots-of-extreme-suspicion/4EA665C2D2AF60F3165243D4177F474E', 'Surveyeksperimentet og drøftingen av konspirasjonstenkning som politisk resonnering under usikkerhet', 'primary-research-article'),
  source('ppi15-ssb-trust', 'Statistisk sentralbyrå', 'Fremdeles høy tillit i Norge', 'https://www.ssb.no/kultur-og-fritid/organisasjoner-og-medlemskap/statistikk/organisasjonsaktivitet-politisk-deltakelse-og-sosialt-nettverk-levekarsundersokelsen/artikler/lavere-tillit-enn-under-pandemien', 'Resultatene og metodeforbeholdene om tillit til medier i 2022 og 2025 på tvers av grupper', 'official-statistics'),
  source('ppi16-emotion', 'Proceedings of the National Academy of Sciences', 'Emotion shapes the diffusion of moralized content in social networks', 'https://www.pnas.org/doi/10.1073/pnas.1618923114', 'Metoden og resultatene om moralsk-emotive ord og deling i politiske Twitter-samtaler', 'primary-research-article'),
  source('ppi17-false-news', 'Science', 'The spread of true and false news online', 'https://www.science.org/doi/10.1126/science.aap9559', 'Datasettet, kaskademålene og funnene om spredning av sanne og falske nyheter og menneskelig deling', 'primary-research-article'),
  source('ppi18-ushmm-visual', 'United States Holocaust Memorial Museum', 'Making a Leader', 'https://encyclopedia.ushmm.org/content/en/article/making-a-leader', 'Delene om orkestrerte bilder, symboler, massemøter, radio og den visuelt konstruerte førerkulten', 'museum-historical-documentation'),
  source('ppi19-ffi-election', 'Forsvarets forskningsinstitutt', 'Økende, komplekst og uoversiktlig – stortingsvalget 2025', 'https://www.ffi.no/publikasjoner/arkiv/okende-komplekst-og-uoversiktlig-kartlegging-av-utenlandsk-pavirkning-i-forbindelse-med-stortingsvalget-2025', 'Metoden, datamengden og konklusjonene om utenlandsk omtale, norskspråklig innhold og informasjonsmiljø', 'current-election-research-report'),
  source('ppi20-medietilsynet-youth', 'Medietilsynet', 'Feed, fornuft og følelser', 'https://www.medietilsynet.no/fakta/rapporter/kritisk-medieforstaelse/feed-fornuft-og-folelser-ungdoms-refleksjoner-om-politikk-medier-og-pavirkning/', 'Funnene om førstegangsvelgeres feedbruk, politisk informasjon, følelser, refleksjon og påvirkning', 'regulator-research-report'),
  source('ppi21-vvp', 'Norsk Presseforbund', 'Vær Varsom-plakaten 3.2', 'https://www.presse.no/vaer-varsom-plakaten/3-2', 'Punkt 3.2 om kritisk kildevalg, opplysningskontroll, bredde, relevans og kildegrunnlag', 'professional-standards'),
  source('ppi22-medietilsynet-literacy', 'Medietilsynet', 'Kritisk medieforståelse – Desinformasjon', 'https://www.medietilsynet.no/fakta/rapporter/kritisk-medieforstaelse/rapporter-2024/kritisk-medieforstaelse-i-den-norske-befolkningen-2024/', 'Bakgrunn, metode og funn om propaganda, feilinformasjon, desinformasjon og kritisk medieforståelse', 'regulator-research-report'),
  source('ppi23-nou-crisis', 'Justis- og beredskapsdepartementet', 'NOU 2014: 8 – Tolking i offentlig sektor', 'https://www.regjeringen.no/no/dokumenter/NOU-2014-8/id2001246/?ch=16', 'Kapittel 16, avsnittet om rask og konkret krisekommunikasjon, ansvarsforhold og informasjon om hjelp og støtte', 'official-government-report')
];
const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('ppi-01', 'Politisk kommunikasjon og propaganda er overlappende påvirkningsformer, men propaganda må analyseres gjennom systematiske virkemidler, seleksjon og makt.', ['ppi01-ffi-project', 'ppi07-ushmm'], ['ppi-grunnlag-1']),
  claim('ppi-02', 'EU-reglene krever åpen merking, sponsorinformasjon og transparens om målretting av politisk reklame.', ['ppi02-eu-ads'], ['ppi-grunnlag-1']),
  claim('ppi-03', 'Opinion må måles med dokumentert utvalg, spørsmål, tidspunkt og usikkerhet og kan ikke utledes direkte av digital respons.', ['ppi03-oecd', 'ppi15-ssb-trust'], ['ppi-grunnlag-1']),
  claim('ppi-04', 'Påvirkningsoperasjoner kan kombinere åpne og skjulte virkemidler for å forme oppfatninger og beslutninger over tid.', ['ppi04-ffi-social', 'ppi01-ffi-project'], ['ppi-grunnlag-2']),
  claim('ppi-05', 'FIMI er definert som manipulerende, intensjonell og koordinert atferd som hovedsakelig kan være lovlig, men skade politiske prosesser eller verdier.', ['ppi05-eeas'], ['ppi-grunnlag-2']),
  claim('ppi-06', 'Norsk straffansvar for skadelige påvirkningsoperasjoner krever bestemte forbindelser til fremmed etterretning, påvirkningsformål og samfunnsskade.', ['ppi06-law'], ['ppi-grunnlag-2']),
  claim('ppi-07', 'Nazistisk propaganda brukte flere medie- og kulturkanaler til å mobilisere støtte, konstruere fiendebilder og legitimere forfølgelse og krig.', ['ppi07-ushmm', 'ppi18-ushmm-visual'], ['ppi-grunnlag-3']),
  claim('ppi-08', 'Arkivverket bevarer omfattende organisasjons- og statsarkiver etter Nasjonal Samling som dokumentasjon av virksomhet og maktbruk.', ['ppi08-arkivverket'], ['ppi-grunnlag-3']),
  claim('ppi-09', 'NRKs redaksjonelle uavhengighet og presseetiske ansvar skiller allmennkringkasterens utvalg fra direkte statlig innholdskontroll.', ['ppi09-nrk'], ['ppi-grunnlag-3']),
  claim('ppi-10', 'Meta definerer koordinert uautentisk atferd gjennom strategisk manipulasjon og sentral bruk av falske kontoer, med vekt på atferd framfor innhold.', ['ppi10-meta', 'ppi11-meta-policy'], ['ppi-fordypning-1']),
  claim('ppi-11', 'Automatisering, identitetsbedrag og provoserende menneskelig atferd er separate egenskaper som ikke kan utledes av anonymitet eller aktivitetsnivå alene.', ['ppi11-meta-policy', 'ppi12-ffi-robust'], ['ppi-fordypning-1']),
  claim('ppi-12', 'Attribusjon av et påvirkningsnettverk krever flere uavhengige tekniske og atferdsmessige spor og vurdering av alternative forklaringer.', ['ppi12-ffi-robust', 'ppi04-ffi-social'], ['ppi-fordypning-1']),
  claim('ppi-13', 'Informasjonsuorden kan analyseres gjennom falskhet, skade og intensjon og omfatter mer enn fullstendig fabrikert innhold.', ['ppi13-coe'], ['ppi-fordypning-2']),
  claim('ppi-14', 'Konspirasjonstenkning kan undersøkes som politisk resonnering under usikkerhet uten å patologisere all mistanke eller kritikk.', ['ppi14-conspiracy'], ['ppi-fordypning-2']),
  claim('ppi-15', 'SSB målte en moderat nedgang i tillit til mediene fra 2022 til 2025, men tilliten var fortsatt relativt høy og resultatet krever metodeforbehold.', ['ppi15-ssb-trust'], ['ppi-fordypning-2']),
  claim('ppi-16', 'Moralsk-emotivt språk var forbundet med økt deling i de analyserte politiske Twitter-nettverkene.', ['ppi16-emotion'], ['ppi-fordypning-3']),
  claim('ppi-17', 'I det studerte Twitter-datasettet spredte falske nyheter seg raskere og bredere enn sanne, med stor menneskelig medvirkning.', ['ppi17-false-news'], ['ppi-fordypning-3']),
  claim('ppi-18', 'Visuelle propagandateknikker kan organisere symboler, lederbilder og følelsesappeller, men et bildes virkning og autentisitet er ulike spørsmål.', ['ppi18-ushmm-visual', 'ppi07-ushmm'], ['ppi-fordypning-3']),
  claim('ppi-19', 'FFIs analyse av stortingsvalget 2025 omfattet over 22 millioner innlegg og kommentarer og beskrev et mer komplekst og lite gjennomsiktig informasjonsmiljø.', ['ppi19-ffi-election'], ['ppi-anvendelse-1']),
  claim('ppi-20', 'Åpen kampanje, politisk reklame, organisk støtte og fordekt nettverksaktivitet krever separate sponsor-, distribusjons- og attribusjonsspor.', ['ppi02-eu-ads', 'ppi19-ffi-election'], ['ppi-anvendelse-1']),
  claim('ppi-21', 'Medietilsynets studie dokumenterer at unge møter politisk informasjon og påvirkning i feeder, men beskriver også aktiv refleksjon og vurdering.', ['ppi20-medietilsynet-youth'], ['ppi-anvendelse-1']),
  claim('ppi-22', 'OECD anbefaler et helhetlig integritetsperspektiv som kombinerer transparente plattformer, pluralistiske kilder, samfunnsrobusthet og ansvarlige institusjoner.', ['ppi03-oecd'], ['ppi-anvendelse-2']),
  claim('ppi-23', 'Uavhengig faktasjekk må vise en avgrenset påstand, kritisk kildevalg, opplysningskontroll og en korrigerbar vurdering.', ['ppi21-vvp', 'ppi22-medietilsynet-literacy'], ['ppi-anvendelse-2']),
  claim('ppi-24', 'Kritisk medieforståelse og forklaring av manipulasjonsteknikker kan styrke motstand uten å etablere statlig kontroll over sannhet.', ['ppi22-medietilsynet-literacy', 'ppi03-oecd'], ['ppi-anvendelse-2']),
  claim('ppi-25', 'Krisekommunikasjon skal gi rask og konkret handlingsinformasjon; faktagrunnlag og moralsk-emotiv forsterkning må derfor analyseres i separate spor.', ['ppi23-nou-crisis', 'ppi21-vvp', 'ppi16-emotion'], ['ppi-anvendelse-3']),
  claim('ppi-26', 'Krigsbilder krever både kilde- og kontekstverifisering og en selvstendig presseetisk vurdering av relevans og skade.', ['ppi21-vvp', 'ppi07-ushmm'], ['ppi-anvendelse-3']),
  claim('ppi-27', 'Informasjonskontroll, legitimt kildevern og redaksjonell tilbakeholdelse må skilles gjennom aktør, grunnlag, varighet og klage- eller kontrollmulighet.', ['ppi09-nrk', 'ppi21-vvp', 'ppi13-coe'], ['ppi-anvendelse-3'])
];
const claimsDoc = { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'media', chapter_id: CHAPTER_ID, sources, claims };

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.media;
  assert(subject && Array.isArray(subject.chapters), 'Media mangler kapittelliste i fagverkregisteret');
  const previousIds = ['presse-redaksjoner-og-avishus', 'offentlighet-ytringsfrihet-og-medieetikk', 'kilder-kritikk-og-sannhet', 'plattformer-algoritmer-og-distribusjon'];
  assert(previousIds.every((id, index) => subject.chapters[index]?.id === id), 'De fire første Media-kapitlene er ikke bevart');
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: CHAPTER_FILE, primary_domain_id: 'propaganda_pavirkning_informasjonskrig', emne_ids: emneIds };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) { assert(subject.chapters.length === 4, 'Media må starte dette steget med nøyaktig fire kapitler'); subject.chapters.push(registryChapter); }
  else { assert(existingIndex === 4 && subject.chapters.length === 5, 'Reproduksjon forventer Media-kapittelet som nummer fem'); subject.chapters[existingIndex] = registryChapter; }
  subject.canonicalModel.note = 'Medias seks canonicale hovedområder eier rendererstrukturen. De fem første områdene er materialisert som fulltekst- og claimsporede kapitler: Presse, redaksjoner og avishus; Offentlighet, ytringsfrihet og medieetikk; Kilder, kritikk og sannhet; Plattformer, algoritmer og distribusjon; og Propaganda, påvirkning og informasjonskrig. Ett hovedområde står igjen. Populærkultur bevares som et komplett nested mediefelt.';
  registry.version = '2.63.0'; registry.updatedAt = '2026-08-10'; writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'media');
  assert(subject?.editorialStatus === 'chapters_in_progress', 'Media må starte fra dokumentert kapittelproduksjon');
  subject.editorialStatus = 'chapters_in_progress'; subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Media har 6 canonicale hovedområder og 120 aktive hovedemner. Fem områder er nå materialisert: Presse, redaksjoner og avishus (21 emner), Offentlighet, ytringsfrihet og medieetikk (21 emner), Kilder, kritikk og sannhet (20 emner), Plattformer, algoritmer og distribusjon (20 emner) og Propaganda, påvirkning og informasjonskrig (18 emner). Det nye kapittelet har 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 27 verifiserte claims, 23 inspiserbare kilder og alle områdets 18 canonicale metoder. Totalt er 100 av 120 hovedemner dekket; ett område gjenstår. Populærkultur forblir et komplett nested mediefelt.';
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister');
  assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  writeJson(CHAPTER_FILE, chapter); writeJson(CHAPTER_DIR + '/brief.json', brief);
  for (const [file, value] of Object.entries(modules)) writeJson(CHAPTER_DIR + '/' + file, value);
  writeJson(CHAPTER_DIR + '/claims.json', claimsDoc); updateRegistry(); updateStatus();
  console.log('Materialiserte Media/' + CHAPTER_ID + ': ' + emneIds.length + ' emner, 3 moduler, ' + claims.length + ' claims og ' + sources.length + ' kilder.');
}

main();
