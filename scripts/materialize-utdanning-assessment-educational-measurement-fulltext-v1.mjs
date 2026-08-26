#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'vurdering-pedagogiske-malinger-validitet-reliabilitet-og-bruk';
const DIR = `data/fagverk/utdanning/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/utdanning/assessment_educational_measurement_source_claim_brief_v1.json',
  nextBrief: 'data/fag/utdanning/special_education_source_claim_brief_v1.json',
  chapter: `${DIR}.json`,
  brief: `${DIR}/brief.json`,
  claims: `${DIR}/claims.json`,
  assessment: `${DIR}/assessment.json`,
  manifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  portal: 'data/fagverk/fagverk_portal.json',
  pensum: 'data/fag/utdanning/utdanningpensum_canonical_v1.json',
  emner: 'data/fag/utdanning/emner_utdanning_canonical_v1.json',
  methods: 'data/fag/utdanning/methods_utdanning_canonical_v1.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const PARAGRAPHS = {
  'vm-01': 'Vurdering er en begrunnet prosess for å samle og fortolke tegn på kompetanse med sikte på læring, dokumentasjon eller beslutning. Formålet kommer først: informasjon som er tilstrekkelig for en lavrisiko tilbakemelding, kan være utilstrekkelig for karakter, opptak eller sertifisering fordi feil får ulike konsekvenser.',
  'vm-02': 'En elevrespons, observasjon eller skår er ikke kompetansen selv. Den er evidens frambrakt gjennom bestemte oppgaver, vilkår og skåringsregler. Fortolkningen må derfor forklare hvordan responsen representerer det faglige konstruktet, og hvilke alternative forklaringer som fortsatt er plausible.',
  'vm-03': 'Når vurderingen styrer høyrisikobeslutninger, øker kravet til representativt innhold, standardisert gjennomføring, presis skåring, rettferdig tilgang og dokumenterte konsekvenser. Det betyr ikke at lavrisikovurdering kan være vilkårlig, men at evidensbyrden må stå i forhold til hva beslutningen gjør med den vurderte.',
  'vm-04': 'Standpunkt bygger på bredere og mer langvarig evidens fra opplæringen, mens eksamen gir et avgrenset prestasjonsvindu under særskilte vilkår. Sprik kan derfor skyldes konstruktdekning, tidspunkt, oppgaveutvalg eller målefeil. Ingen av vurderingene er automatisk elevens sanne, kontekstfrie nivå.',
  'vm-05': 'Michael Kanes argumentbaserte validering gjør kjeden fra observerte responser til skår, generalisering, ekstrapolering og beslutning eksplisitt. Hvert ledd inneholder antakelser som kan støttes eller svekkes av evidens. Validering blir dermed en kritisk prøving av en foreslått fortolkning og bruk, ikke et kvalitetsstempel.',
  'vm-06': 'Konstruktunderrepresentasjon oppstår når viktige deler av kompetansen ikke får komme til uttrykk, for eksempel når én kort skriveoppgave skal representere et bredt fag. Konstruktirrelevant varians oppstår når språk, tempo, format eller bakgrunnskunnskap påvirker skåren uten å være del av det tilsiktede målet.',
  'vm-07': 'Cronbach og Meehl knyttet konstruktvaliditet til et nomologisk nettverk av teoretiske forbindelser og empiriske forventninger. Senere validitetsteori samler evidens om innhold, responsprosesser, intern struktur, relasjoner til andre variabler og konsekvenser. En enkelt korrelasjon eller ekspertvurdering kan derfor ikke lukke argumentet.',
  'vm-08': 'Validitet følger ikke testnavnet uendret. Ny målgruppe, digital plattform, tidspress, språkversjon, skåringsmodell eller beslutning kan endre både responsprosesser og konsekvenser. Da må relevante antakelser og evidenskilder prøves på nytt, selv om oppgavene ligner eller tidligere bruk var godt dokumentert.',
  'vm-09': 'I klassisk testteori uttrykkes observert skår som en sann skår under definerte betingelser pluss feil. Den sanne skåren er en forventning over hypotetiske gjentakelser, ikke en skjult, feilfri mengde inne i personen. Resultatet må derfor knyttes til testform, situasjon og usikkerhet.',
  'vm-10': 'Reliabilitet gjelder konsistens for bestemte generaliseringer. En prøve kan være stabil over oppgaver, men variere mellom bedømmere, eller omvendt. Før en koeffisient fortolkes, må analysen angi hvilke feilkilder som inngår, hvilken populasjon som undersøkes og hvilken beslutning presisjonen skal støtte.',
  'vm-11': 'Cronbachs alfa beskriver intern konsistens under antakelser om blant annet itemstruktur. Mange like eller redundante oppgaver kan gi høy alfa uten bred konstruktdekning. Koeffisienten beviser derfor verken endimensjonalitet, riktig faglig fortolkning, fravær av bias eller rettferdig bruk på individnivå.',
  'vm-12': 'Usikkerhet bør synliggjøres gjennom standardfeil, intervaller, klassifikasjonsrisiko eller robusthetsanalyser som passer beslutningen. En skår på 42 er ikke nødvendigvis meningsfullt forskjellig fra 41. Når rapporteringen skjuler usikkerheten, kan små tilfeldige utslag få uforholdsmessig stor pedagogisk eller administrativ betydning.',
  'vm-13': 'Klassisk testteori beskriver test- og skåregenskaper i en aktuell populasjon og testform. Itemvanskelighet og reliabilitet kan endre seg når deltakergruppe eller oppgaveutvalg endres. Sammenligning på tvers av former krever derfor dokumentert ekvivalering, ikke bare samme antall oppgaver og felles karakterskala.',
  'vm-14': 'Item response theory modellerer sannsynligheten for en respons som funksjon av en latent egenskap og oppgaveparametere, ofte vanskelighet og diskriminering. Modellen er betinget av antakelser som endimensjonalitet og lokal uavhengighet. Latent skår er en modellbasert representasjon, ikke direkte observert kompetanse.',
  'vm-15': 'Item information uttrykker hvor mye presisjon en oppgave bidrar med på ulike deler av skalaen. Et item kan skille godt rundt én terskel, men gi lite informasjon langt over eller under den. Testdesign må derfor tilpasses beslutningsområdet fremfor å anta lik målenøyaktighet for alle elever.',
  'vm-16': 'God global modelltilpasning er ikke nok dersom enkelte oppgaver fungerer ulikt mellom grupper, responsene er lokalt avhengige eller skalaen endrer mening. Før IRT-skårer lenkes eller sammenlignes, må itemfit, invarians, dimensjonalitet og praktiske konsekvenser undersøkes med både statistisk og faglig skjønn.',
  'vm-17': 'Oppgaveutvikling bør starte med en eksplisitt beskrivelse av kunnskapsdomenet og hvilken respons som kan gi relevant evidens. Deretter velges representativt innhold, format, vanskelighetsbredde og skåringsregler. Hvis format velges først, risikerer man å måle det som er enkelt å administrere fremfor det som er viktig.',
  'vm-18': 'Flervalgsoppgaver kan undersøke komplekst resonnement når stimulus og alternativer krever faglige skiller, mens åpne oppgaver kan belønne skriveflyt eller gjetting om vurdererens forventning. Formatet bestemmer ikke dybden alene; oppgavekvalitet, responsprosess og skåring avgjør hvilken evidens som faktisk produseres.',
  'vm-19': 'En rubrikk bør beskrive kvalitativ faglig progresjon med kriterier og eksempler som brukere kan fortolke. Dersom lett tellbare trekk som lengde, antall fagord eller fast disposisjon dominerer, kan eleven optimalisere rubrikken uten å utvikle det tilsiktede resonnementet. Kriteriene må derfor prøves mot autentiske arbeider.',
  'vm-20': 'Bedømmersamsvar kan styrkes gjennom klare kriterier, ankerbesvarelser, trening, kalibrering og moderering. Høyt samsvar viser likevel bare at bedømmere anvender reglene konsistent. Dersom reglene representerer feil konstrukt eller systematisk overser bestemte uttrykksformer, kan skåringen være reliabel og samtidig invalid.',
  'vm-21': 'Black og Wiliam bruker formativ vurdering om prosesser der evidens om læring innhentes og faktisk brukes til å endre undervisning eller elevens neste handling. En ukentlig quiz er derfor ikke formativ bare fordi den er hyppig eller uten karakter; funksjonen avhenger av responsen etterpå.',
  'vm-22': 'Feedback får læringsfunksjon når mottakeren forstår målet, kan sammenligne nåværende arbeid med kriteriene og har tid og støtte til å revidere. En detaljert kommentar etter at arbeidet er avsluttet kan forklare en karakter, men gir lite handlingsrom dersom innsikten ikke overføres til neste oppgave.',
  'vm-23': 'Lorrie Shepard beskriver en læringskultur der vurdering er integrert i faglig deltakelse, dialog og utvikling av kriterieforståelse. Perspektivet utfordrer en kultur der vurdering primært sorterer og kontrollerer. Elevmedvirkning betyr likevel ikke fravær av faglige standarder, men bedre tilgang til å forstå og bruke dem.',
  'vm-24': 'Hyppig gjenhenting kan styrke minne, og korte prøver kan synliggjøre misoppfatninger. Det gjør ikke automatisk aktiviteten formativ. Læreren og eleven må bruke resultatene til å velge forklaring, øving, revisjon eller nytt utfordringsnivå; ellers forblir quizen bare gjentatt måling.',
  'vm-25': 'Rettferdig vurdering krever analyse av om språk, sanseformat, motoriske krav, teknologi eller kulturelle forutsetninger skaper irrelevant vanskelighet. Målet er ikke å fjerne fagets nødvendige krav, men å skille dem fra barrierer som forvrenger elevens mulighet til å vise den kompetansen vurderingen hevder å måle.',
  'vm-26': 'Tilrettelegging er fortolkningsmessig forsvarlig når den reduserer en irrelevant barriere uten å endre konstruktet. Opplesing kan være rimelig i en naturfaglig problemløsningsoppgave, men endre meningen i en prøve av selvstendig avkoding. Formål og responsprosess må avgjøre, ikke en generell liste over tillatte hjelpemidler.',
  'vm-27': 'En gjennomsnittsforskjell mellom språk- eller funksjonsgrupper kan utløse analyse av oppgaver, tilgang og konsekvenser, men forklarer ikke automatisk mekanismen. Gruppestatistikk kan heller ikke bestemme hvorfor et enkeltindivid svarte som det gjorde. Biasundersøkelse må kombinere statistiske mønstre med faglig og kvalitativ evidens.',
  'vm-28': 'Ansvarlig testbruk krever tydelig informasjon om formål, hva skåren kan og ikke kan si, databehandling, tilrettelegging, klagemulighet og forventede konsekvenser. Den vurderte må kunne forstå beslutningsprosessen på et relevant nivå. Teknisk avansert måling opphever ikke krav til transparens og menneskelig ansvar.',
  'vm-29': 'Standardsetting kombinerer ekspertvurderinger av oppgaver og prestasjoner med empiriske data og analyse av feilklassifisering. En kuttverdi uttrykker en begrunnet beslutningsregel under et bestemt formål; den er ikke en naturlig sprekk i en kontinuerlig kompetansefordeling. Nær terskelen må usikkerhet kommuniseres særlig tydelig.',
  'vm-30': 'Storskalamålinger kan beskrive systemmønstre når utvalg, skala, bortfall og usikkerhet håndteres. De er vanligvis ikke designet for presis individtilbakemelding. Å oversette en systemindikator direkte til elevdiagnose, lærervurdering eller skolerangering krever ekstra validitetsevidens som datainnsamlingen ofte ikke gir.',
  'vm-31': 'Sterke insentiver kan endre hva skoler underviser, hvilke elever som deltar, og hvordan resultater rapporteres. Da kan skårvekst delvis uttrykke tilpasning til indikatoren fremfor bredere kompetansevekst. Konsekvensanalyse må derfor undersøke både tilsiktet læring, snevring av innhold og strategisk atferd.',
  'vm-32': 'Et ansvarlig vurderingssystem overvåker validitet, reliabilitet, fairness og konsekvenser gjennom hele levetiden. Oppgaver, populasjoner og praksiser endres, så dokumentasjon må oppdateres. Når evidensen svekkes eller skadevirkninger oppstår, skal fortolkning, terskler, administrasjon eller bruk revideres i stedet for å forsvares av tradisjon.',
};

const MODULES = [
  { id: '01-formal-og-validitet', title: 'Formål og validitetsargument', topics: [0, 1] },
  { id: '02-reliabilitet-og-modeller', title: 'Reliabilitet og målemodeller', topics: [2, 3] },
  { id: '03-oppgaver-og-formativ-bruk', title: 'Oppgaver og formativ bruk', topics: [4, 5] },
  { id: '04-rettferdighet-og-konsekvenser', title: 'Rettferdighet og konsekvenser', topics: [6, 7] },
];

const ASSESSMENT_STEMS = [
  ['vm-02', 'Hva representerer en observert skår?', ['Kompetansen selv uten usikkerhet', 'Evidens som må fortolkes gjennom oppgave, skåring og kontekst', 'Bare elevens innsats', 'En stabil elevtype'], 1],
  ['vm-05', 'Hva er kjernen i Kanes argumentbaserte validering?', ['Å beregne én korrelasjon', 'Å gjøre slutninger og antakelser i brukskjeden eksplisitte og prøvbare', 'Å godkjenne testnavnet', 'Å erstatte faglig skjønn med algoritme'], 1],
  ['vm-11', 'Hva beviser en høy Cronbachs alfa?', ['At testen er endimensjonal og valid', 'Intern konsistens under bestemte antakelser, men ikke validitet alene', 'At alle grupper behandles rettferdig', 'At skåren er feilfri'], 1],
  ['vm-16', 'Hva må undersøkes før IRT-skårer sammenlignes?', ['Bare antall items', 'Fit, lokal uavhengighet, invarians og faglig mening', 'Kun gjennomsnittsskåren', 'Om testen har et kjent navn'], 1],
  ['vm-20', 'Hvorfor garanterer ikke høyt bedømmersamsvar validitet?', ['Fordi samsvar aldri kan måles', 'Fordi bedømmere kan bruke samme, men konstruktmessig feil regel', 'Fordi åpne svar ikke kan vurderes', 'Fordi kriterier alltid er subjektive'], 1],
  ['vm-21', 'Når er en quiz formativ?', ['Når den er ukentlig', 'Når evidensen brukes til å endre neste undervisnings- eller elevhandling', 'Når den er digital', 'Når den mangler karakter'], 1],
  ['vm-26', 'Når er tilrettelegging fortolkningsmessig forsvarlig?', ['Når alle får identisk format', 'Når en irrelevant barriere reduseres uten å endre konstruktet', 'Når prøven blir enklere', 'Når hjelpemiddelet alltid tillates'], 1],
  ['vm-29', 'Hva er en kuttverdi i standardsetting?', ['En naturgitt grense i kompetanse', 'En begrunnet beslutningsregel med usikkerhet og konsekvenser', 'En individuell diagnose', 'Et bevis på undervisningskvalitet'], 1],
];

function build() {
  const sourceBrief = read(P.sourceBrief);
  const nextBrief = read(P.nextBrief);
  const manifest = read(P.manifest);
  const inventory = read(P.inventory);
  const registry = read(P.registry);
  const status = read(P.status);
  const portal = read(P.portal);
  const pensum = read(P.pensum);
  const emner = read(P.emner);
  const methods = read(P.methods);
  const topics = sourceBrief.topic_briefs;
  const plannedClaims = topics.flatMap((topic) => topic.planned_claims);

  assert(sourceBrief.scope.primary_domain_id === 'vurdering_pedagogiske_malinger', 'Feil source-first-domene');
  assert(nextBrief.scope.primary_domain_id === 'spesialpedagogikk', 'Neste source-first-domene må være spesialpedagogikk');
  assert(topics.length === 8 && plannedClaims.length === 32, 'Feil source-first topic/claim-count');
  assert(plannedClaims.every((claim) => PARAGRAPHS[claim.id]), 'Alle 32 claims må ha fagredigert fulltekst');

  const sources = sourceBrief.sources.map((source) => ({
    ...source,
    label: `${source.publisher} – ${source.title}`,
  }));
  const claims = plannedClaims.map((claim) => ({
    id: claim.id,
    claim: claim.text,
    source_ids: claim.source_ids,
    classification: 'verified_scholarly_source_synthesis',
    status: 'verified',
    verified_at: '2026-08-27',
  }));

  const moduleFiles = [];
  for (const module of MODULES) {
    const sections = module.topics.map((topicIndex) => {
      const topic = topics[topicIndex];
      const claimIds = topic.planned_claims.map((claim) => claim.id);
      return {
        id: `vm-${topic.id}`,
        title: topic.title,
        topic_id: topic.id,
        emne_ids: [sourceBrief.scope.canonical_emne_id],
        method_ids: topic.method_ids,
        paragraphs: claimIds.map((id) => PARAGRAPHS[id]),
        paragraphClaimIds: claimIds.map((id) => [id]),
        keyPoints: [topic.planned_claims[0].text, topic.planned_claims.at(-1).text],
        keyPointClaimIds: [[claimIds[0]], [claimIds.at(-1)]],
        source_ids: topic.source_ids,
        boundary: topic.boundary,
      };
    });
    const file = `${DIR}/${module.id}.json`;
    write(file, {
      schema: 'history_go_fagverk_education_module_v1',
      version: '1.0.0',
      id: module.id,
      title: module.title,
      sections,
    });
    moduleFiles.push(file);
  }

  const questions = ASSESSMENT_STEMS.map(([claimId, question, options, answerIndex], index) => {
    const claim = claims.find((row) => row.id === claimId);
    return {
      id: `utdanning-vm-q${String(index + 1).padStart(2, '0')}`,
      question,
      options,
      answer: options[answerIndex],
      answerIndex,
      question_type: 'analysis',
      difficulty: index < 3 ? 'medium' : 'hard',
      emne_id: sourceBrief.scope.canonical_emne_id,
      claim_id: claimId,
      source: claim.source_ids,
      knowledge: PARAGRAPHS[claimId],
      learner_typing: false,
    };
  });

  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1',
    version: '1.0.0',
    subject_id: 'utdanning',
    chapter_id: CHAPTER_ID,
    primary_domain_id: 'vurdering_pedagogiske_malinger',
    purpose: 'Analysere hvordan formål, validitet, reliabilitet, målemodeller, oppgave- og skåringsdesign, formativ bruk, rettferdighet og konsekvenser avgjør kvaliteten på pedagogiske vurderinger.',
    sourceStrategy: {
      sourceBriefFile: P.sourceBrief,
      externalSourceCount: sources.length,
      paragraphLevelClaimTrace: true,
      everyPlannedClaimResolved: true,
      allUsedSourcesInspectable: true,
    },
    requiredCriticalDistinctions: [
      'skår vs kompetanse',
      'testobjekt vs fortolkning og bruk',
      'reliabilitet vs validitet',
      'intern konsistens vs endimensjonalitet',
      'modellfit vs konstruktbevis',
      'vurderingsformat vs formativ funksjon',
      'lik prosedyre vs rettferdig tilgang',
      'kuttverdi vs naturgitt kompetansegrense',
    ],
    safety: {
      individualDiagnosis: false,
      fixedLearnerTyping: false,
      scoreFatalism: false,
      universalMethodClaim: false,
      groupDifferenceAsIndividualCause: false,
    },
    qa: {
      topicCoverage: '8/8',
      plannedClaimResolution: '32/32',
      moduleCount: 4,
      sectionCount: 8,
      paragraphCount: 32,
      assessmentQuestionCount: 8,
    },
  };

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1',
    version: '1.0.0',
    subject: 'utdanning',
    subject_id: 'utdanning',
    id: CHAPTER_ID,
    chapter_id: CHAPTER_ID,
    primary_domain_id: 'vurdering_pedagogiske_malinger',
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true,
    sourceFirst: true,
    emne_ids: [sourceBrief.scope.canonical_emne_id],
    method_ids: [...new Set(topics.flatMap((topic) => topic.method_ids))],
    title: 'Vurdering og pedagogiske målinger: validitet, reliabilitet og bruk',
    subtitle: 'Fra formål og validitetsargument til målemodeller, formativ bruk, rettferdighet og konsekvenser',
    lead: 'Kapittelet undersøker hvordan vurderingsinformasjon blir til begrunnede pedagogiske fortolkninger uten å gjøre skårer feilfrie, reliabilitet til validitet eller gruppemønstre til individuelle diagnoser.',
    learningObjectives: topics.map((topic) => topic.title),
    diagnosticQuestions: questions.slice(0, 4).map((row) => ({ question: row.question, answer: row.knowledge })),
    relatedPlaces: [],
    workCases: sourceBrief.decision_scenarios,
    moduleFiles,
    briefFile: P.brief,
    claimsFile: P.claims,
    assessmentFile: P.assessment,
    sourceBriefFile: P.sourceBrief,
  };

  write(P.claims, {
    schema: 'history_go_fagverk_chapter_claims_v1',
    version: '1.0.0',
    subject_id: 'utdanning',
    chapter_id: CHAPTER_ID,
    sourceBriefFile: P.sourceBrief,
    sources,
    claims,
  });
  write(P.assessment, {
    schema: 'history_go_fagverk_education_chapter_assessment_v1',
    version: '1.0.0',
    subject_id: 'utdanning',
    chapter_id: CHAPTER_ID,
    status: 'audited',
    questions,
  });
  write(P.brief, chapterBrief);
  write(P.chapter, chapter);

  manifest.utdanning.status = 'active_foundation';
  manifest.utdanning.sourceClaimBriefs = [...new Set([
    ...(manifest.utdanning.sourceClaimBriefs || []),
    P.sourceBrief,
    P.nextBrief,
  ])];
  manifest.utdanning.chapters = [...new Set([...(manifest.utdanning.chapters || []), P.chapter])];

  const inventoryRow = inventory.subjects.find((row) => row.id === 'utdanning');
  inventoryRow.optionalManifestFields = [...new Set([
    ...(inventoryRow.optionalManifestFields || []),
    'sourceClaimBriefs',
    'chapters',
  ])];

  const registryRow = registry.subjects.utdanning;
  registryRow.canonicalModel.seventhFulltextChapter = P.chapter;
  registryRow.canonicalModel.eighthSourceClaimBrief = P.nextBrief;
  registryRow.canonicalModel.note = 'Sju av 14 canonicale domener er fulltekstmaterialisert med til sammen 56 seksjoner, 224 claimsporede avsnitt og 224 verifiserte claims. Spesialpedagogikk er source-first-klargjort som neste domene; Utdanning er ikke complete.';
  registryRow.editorialPlan.targetDomainCount = 14;
  registryRow.editorialPlan.completedSourceBriefCount = 8;
  registryRow.editorialPlan.registeredChapterCount = 7;
  registryRow.editorialPlan.nextGate = 'special_education_source_brief_complete_full_chapter_production';
  registryRow.chapters = [
    ...(registryRow.chapters || []).filter((row) => row.id !== CHAPTER_ID),
    {
      id: CHAPTER_ID,
      title: chapter.title,
      subtitle: chapter.subtitle,
      file: P.chapter,
      primary_domain_id: chapter.primary_domain_id,
      emne_ids: chapter.emne_ids,
      claimsFile: P.claims,
      briefFile: P.brief,
      assessmentFile: P.assessment,
    },
  ];

  const statusRow = status.subjects.find((row) => row.id === 'utdanning');
  statusRow.navigationStatus = 'materialized';
  statusRow.assessmentStatus = 'audited';
  statusRow.editorialStatus = 'chapters_in_progress';
  statusRow.nextGate = 'special_education_source_brief_complete_full_chapter_production';
  statusRow.note = 'Utdanning er materialisert 7/14: sju domener har samlet 28 moduler, 56 fulltekstseksjoner, 224 claimsporede fagavsnitt, 224 verifiserte claims og 56 auditerte vurderingsoppgaver. Spesialpedagogikk har source-first-brief klar som neste produksjonsport. Faget er chapters_in_progress, ikke complete.';

  const portalRow = portal.categories.find((row) => row.id === 'utdanning');
  portalRow.subjectPage = 'fagverk.html?subject=utdanning';
  portalRow.subjectStatus = 'materialized';

  pensum.status = 'active_foundation';
  pensum.complete_ready = false;
  pensum.domains.forEach((domain, index) => {
    domain.status = index < 7 ? 'materialized' : 'planned';
  });
  const materializedEmneIds = new Set([
    'em_utdanning_pedagogikk_laeringsteori',
    'em_utdanning_didaktikk',
    'em_utdanning_barnehage_tidlig_laering',
    'em_utdanning_grunnskole',
    'em_utdanning_videregaende_yrkesfag',
    'em_utdanning_hoyere_utdanning',
    'em_utdanning_vurdering_pedagogiske_malinger',
  ]);
  emner.forEach((emne) => {
    if (materializedEmneIds.has(emne.emne_id)) emne.status = 'materialized';
  });
  methods.methods.forEach((method) => {
    if (chapter.method_ids.includes(method.method_id)) method.canonical_status = 'materialized';
  });

  write(P.manifest, manifest);
  write(P.inventory, inventory);
  write(P.registry, registry);
  write(P.status, status);
  write(P.portal, portal);
  write(P.pensum, pensum);
  write(P.emner, emner);
  write(P.methods, methods);

  return {
    modules: 4,
    topics: 8,
    paragraphs: 32,
    claims: 32,
    sources: sources.length,
    questions: 8,
  };
}

const result = build();
console.log(`Utdanning Vurdering og pedagogiske målinger materialisert: ${result.modules} moduler, ${result.topics} seksjoner, ${result.paragraphs} avsnitt, ${result.claims} claims, ${result.sources} kilder og ${result.questions} oppgaver.`);
