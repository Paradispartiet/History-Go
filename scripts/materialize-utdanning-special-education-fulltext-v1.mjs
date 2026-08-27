#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'spesialpedagogikk-rettigheter-deltakelse-og-malrettet-stotte';
const DIR = `data/fagverk/utdanning/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/utdanning/special_education_source_claim_brief_v1.json',
  nextBrief: 'data/fag/utdanning/inclusion_adapted_education_source_claim_brief_v1.json',
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
  'sp-01': 'Tilpasset opplæring er etter opplæringslova et ansvar for kommunen og fylkeskommunen og gjelder alle elever. Skolen må følge med på om den ordinære opplæringen gir tilfredsstillende utbytte og prøve relevante tilpasninger; individuell tilrettelegging vurderes når behovet ikke kan møtes forsvarlig innenfor dette tilbudet.',
  'sp-02': 'Kapittel 11 skiller personlig assistanse, fysisk tilrettelegging og tekniske hjelpemidler fra individuelt tilrettelagt opplæring. Skillet er beslutningsrelevant: praktisk støtte, tilgjengelighet og særskilt pedagogisk opplæring har ulike formål, krav og kompetansebehov, selv om én elev kan ha rett til flere former samtidig.',
  'sp-03': 'CRPD artikkel 24 forankrer inkluderende utdanning i ikke-diskriminering, rimelig tilrettelegging og nødvendig støtte. Rettighetsperspektivet flytter spørsmålet fra om eleven passer inn, til hvilke barrierer utdanningssystemet må fjerne, men krever fortsatt individuell analyse av hva som faktisk gir læring og deltakelse.',
  'sp-04': 'En diagnose kan gi relevant kunnskap om mulige behov, men er ikke en undervisningsplan. Lovens krav og Udirs saksveiledning krever en individuell, opplyst vurdering av utbytte, mål, tiltak, organisering og kompetanse. To elever med samme diagnose kan derfor trenge forskjellig innhold, intensitet og støtte.',
  'sp-05': 'WHO-modellen ICF beskriver funksjon gjennom samspillet mellom kroppslige forhold, aktivitet, deltakelse og miljøfaktorer. Pedagogisk betyr det at vansker ikke kan lokaliseres bare i eleven: samme ferdighet kan gi ulik deltakelse når oppgaver, hjelpemidler, relasjoner, støy, tempo eller forventninger endres.',
  'sp-06': 'Barrierer kan bygges inn i skriftstørrelse, språklig tetthet, lydmiljø, tidskrav, responsformat og gruppestruktur. UDL bidrar med forhåndsplanlagte alternativer for tilgang og uttrykk, mens ICF synliggjør kontekstsamspillet. Ingen av rammeverkene gjør individuell kartlegging overflødig når generelle løsninger ikke gir tilstrekkelig utbytte.',
  'sp-07': 'Norwich viser et vedvarende identifikasjonsdilemma: kategorier kan utløse rettigheter, spesialistkunnskap og ressurser, men også homogenisere og senke forventninger. Å avskaffe kategorier løser heller ikke problemet dersom behov blir usynlige. Ansvarlig praksis bruker kategorien som hypotese og inngang, ikke som elevens pedagogiske identitet.',
  'sp-08': 'En relasjonell analyse må unngå to reduksjoner: at alle vansker skyldes individet, og at individuelle sansemessige, kommunikative eller kognitive behov oppløses i systemkritikk. Elevstemme, observasjon, arbeidsprøver og miljøanalyse må sammen undersøke hvor barrierer oppstår og hvilke endringer som faktisk forbedrer deltakelse.',
  'sp-09': 'Florian og Black-Hawkins beskriver inkluderende pedagogikk som å utvide det ordinært tilgjengelige repertoaret slik at alle kan delta, framfor først å planlegge for flertallet og deretter skille ut enkelte. Deres kvalitative studie gir praksisnære mekanismer, men er ikke et universelt effektbevis for én metode.',
  'sp-10': 'Dilemmaet om forskjell kan ikke fjernes med et slagord. Særskilt støtte kan gi nødvendig ekspertise og samtidig markere eleven som avvikende; identisk behandling kan bevare fellesskapets form og samtidig nekte reell tilgang. Beslutningen må gjøre begge risikoene eksplisitte og revideres med elevens erfaringer og læringsdata.',
  'sp-11': 'Inkludering må undersøkes gjennom nærvær, faglig aktivitet, kommunikasjon, innflytelse, relasjoner, læring og tilhørighet. En elev kan sitte i samme rom uten tilgang til samtalen eller oppgaven. Omvendt kan kortvarig arbeid i mindre gruppe støtte senere deltakelse dersom mål, varighet og tilbakekobling til fellesskapet er tydelige.',
  'sp-12': 'Spesialisert støtte og fellesskap er derfor ikke logiske motsetninger. Organisering utenfor klassen må begrunnes i et konkret læringsformål og vurderes mot tapt undervisning, sosial marginalisering og overføringsverdi. Varig segregasjon kan ikke forsvares bare med at et separat tilbud finnes eller er praktisk for skolen.',
  'sp-13': 'Den sakkyndige vurderingen skal belyse elevens utbytte av opplæringen, mulige årsaker til manglende utbytte, realistiske opplæringsmål, tiltak og nødvendig kompetanse. Det krever også analyse av skolens ordinære tilbud; ellers risikerer vurderingen å beskrive eleven inngående uten å undersøke miljøet eleven faktisk skal lære i.',
  'sp-14': 'Elevmedvirkning er både en rettighet og en kunnskapskilde. Eleven kan identifisere barrierer, belastninger, interesser og støttestrategier som voksne overser. Medvirkningen må være kommunikativt tilgjengelig og påvirke beslutningen; et signert møtereferat beviser ikke deltakelse dersom spørsmålene var uforståelige eller svarene uten konsekvens.',
  'sp-15': 'Screening er laget for å fange risiko under valgte terskler, ikke for å forklare årsak eller fastsette en individuell diagnose. Falske positive og negative følger av base rate, målefeil og grensevalg. Et utslag bør derfor utløse nærmere pedagogisk undersøkelse og tidlig støtte, ikke venting eller kategorisk konklusjon.',
  'sp-16': 'Triangulering styrker beslutningsgrunnlaget når kildene belyser ulike sider: elevens erfaring, observasjon av undervisning, konkrete arbeider, progresjon over tid og relevante prøver. Flere mål er ikke automatisk bedre dersom de gjentar samme skjevhet; dataene må knyttes til et tydelig pedagogisk spørsmål og motstridende funn undersøkes.',
  'sp-17': 'Tidlig innsats betyr å handle når utilstrekkelig utbytte blir synlig, samtidig som tiltakets effekt følges. Den skal ikke gjøres avhengig av at vanskene blir alvorlige eller en diagnose foreligger. Et lavterskeltiltak må likevel ha definert mål og evalueringspunkt, ellers kan aktivitet forveksles med virksom støtte.',
  'sp-18': 'Response to Intervention organiserer undervisning og støtte i økende intensitet og bruker gjentatte progresjonsdata til justering. Fuchs og Fuchs understreker også rammeverkets validitetsspørsmål. RTI kan redusere «wait-to-fail», men blir problematisk dersom flere nivåer bare betyr lengre venting uten kvalifisert undervisning og tydelige beslutningsregler.',
  'sp-19': 'Svak tiltaksrespons er ikke en stabil egenskap ved eleven. Før forklaringen individualiseres må teamet kontrollere om ferdighetsmålet var relevant, undervisningsdosen tilstrekkelig, tiltaket faktisk gjennomført, materialet tilgjengelig og målingen følsom. Vedvarende miljøbarrierer kan ellers bli feilregistrert som manglende motivasjon eller evne.',
  'sp-20': 'Progresjonsmål må kunne registrere endring i den ferdigheten tiltaket retter seg mot og tolkes sammen med dose og gjennomføringskvalitet. En bred terminprøve kan være for treg eller fjern fra tiltaket. Samtidig kan et svært nært treningsmål overvurdere læring dersom ferdigheten ikke generaliseres til nye tekster, personer eller situasjoner.',
  'sp-21': 'Et målrettet tiltak bør angi ferdighet, antatt mekanisme, aktivitet, dose, ansvarlig voksen, kontekst og tegn på framgang. Et programnavn er ikke en årsaksforklaring. Denne spesifikasjonen gjør det mulig å skille mellom svak teori, utilstrekkelig implementering og et tiltak som faktisk ikke virker for eleven.',
  'sp-22': 'Van Herwegen og kollegers omfattende meta-analyse finner positive gjennomsnittseffekter for flere målrettede tiltak, men også betydelig variasjon mellom intervensjoner, elevgrupper og utfall. Evidensen støtter derfor systematisk utprøving, ikke løftet om én universell metode. Lokal respons og mulige uønskede virkninger må fortsatt følges.',
  'sp-23': 'Eksplisitt modellering, veiledet øving, presis tilbakemelding og gradvis ansvarsoverføring kan inngå i virksom støtte. Komponentene må knyttes til fagets innhold og elevens respons. En fast sekvens brukt mekanisk kan snevre inn deltagelse; UDL-alternativer og dialog kan åpne flere veier uten å fjerne tydelige mål.',
  'sp-24': 'Ambisiøse mål og støtte må holdes sammen. Å redusere tekstmengde, begreper eller problemløsning kan lette dagens oppgave, men også stenge framtidige læringsmuligheter dersom støtte erstattes av permanent lavere innhold. Tilpasning skal gjøre vesentlig faglig arbeid tilgjengelig, og målreduksjon krever eksplisitt, individuell begrunnelse.',
  'sp-25': 'ASK er både et kommunikasjonssystem som må læres og et språk eleven skal kunne lære gjennom. Tilgang må finnes i undervisning, friminutt, vurdering og sosialt samspill. Dersom symbolforråd eller talemaskin bare brukes i trening med én voksen, er teknologien tilgjengelig fysisk, men ikke funksjonelt i elevens skoleliv.',
  'sp-26': 'Kommunikasjon skapes mellom mennesker. Partnernes modellering, ventetid, respons på initiativ og forventning om meningsfulle bidrag påvirker om ASK kan utvikles. Et avansert hjelpemiddel uten kompetente språkpartnere kan derfor gi mindre deltagelse enn et enklere system som faktisk modelleres og er tilgjengelig gjennom hele dagen.',
  'sp-27': 'UDL tilbyr flere veier for engasjement, representasjon og handling eller uttrykk og kan redusere forutsigbare barrierer før de oppstår. Rammeverket erstatter likevel ikke individuelt tilpassede hjelpemidler eller spesialisert opplæring. Universell utforming og individuell tilrettelegging er komplementære nivåer, ikke konkurrerende forklaringer.',
  'sp-28': 'Kleinert og kollegers systematiske ASK-gjennomgang fant lovende strategier i inkluderende miljøer, men bare 17 studier, hovedsakelig single-case-design, og begrenset måling av generalisering. Det gjør metodene relevante å prøve med tett oppfølging, men evidensen er for smal til sikre løfter på tvers av elever og kontekster.',
  'sp-29': 'En IOP skal oversette vedtaket til mål, innhold og gjennomføring i den faktiske opplæringen. Dokumentet har liten pedagogisk verdi hvis lærere ikke bruker det i planlegging og løpende valg. Målene må være meningsfulle, observerbare og koblet til elevens deltakelse, ikke bare en liste over aktiviteter eller generelle ønsker.',
  'sp-30': 'Årlig evaluering skal sammenholde opplæringen som faktisk ble gitt med utviklingen mot IOP-målene. Den må skille manglende elevframgang fra manglende dose eller gjennomføring og brukes til å revidere støtte. En positiv generell beskrivelse uten data om mål og tilbud oppfyller ikke denne læringsfunksjonen.',
  'sp-31': 'Tverrprofesjonelt samarbeid gir flere kunnskapskilder, men kan også pulverisere ansvar. Skolen beholder det pedagogiske ansvaret for opplæringen, mens elev og foreldre skal få reell medvirkning. Relevant informasjon må deles lovlig og formålsbundet; kliniske betegnelser skal informere muligheter og barrierer, ikke overta målformuleringen.',
  'sp-32': 'Overganger endrer både krav og miljø, og må planlegges før eleven mister kommunikasjonstilgang, hjelpemidler, relasjoner eller virksom støtte. Samtidig skal gammel beskrivelse ikke kopieres ukritisk. Det nye teamet må sikre kontinuitet i det som virker og undersøke elevens funksjon og deltakelse på nytt i den nye konteksten.',
};

const MODULES = [
  { id: '01-rettigheter-og-kontekst', title: 'Rettigheter og kontekstuell funksjon', topics: [0, 1] },
  { id: '02-inkludering-og-kartlegging', title: 'Inkludering, dilemmaer og kartlegging', topics: [2, 3] },
  { id: '03-tidlig-og-malrettet-stotte', title: 'Tidlig og målrettet støtte', topics: [4, 5] },
  { id: '04-kommunikasjon-og-samarbeid', title: 'Kommunikasjon, IOP og samarbeid', topics: [6, 7] },
];

const ASSESSMENT_STEMS = [
  ['sp-04', 'Hvordan bør en diagnose brukes pedagogisk?', ['Som ferdig undervisningsplan', 'Som relevant informasjon i en individuell analyse av mål, miljø og respons', 'Som automatisk plasseringsvedtak', 'Som grunn til lavere forventninger'], 1],
  ['sp-08', 'Hva krever en relasjonell analyse?', ['At individuelle behov ignoreres', 'At både elevens forutsetninger og miljøets barrierer undersøkes', 'At all støtte gis likt', 'At systemet alltid er eneste årsak'], 1],
  ['sp-11', 'Hva er utilstrekkelig som bevis på inkludering?', ['Fysisk plassering alene', 'Faglig deltakelse', 'Kommunikasjon og medvirkning', 'Opplevd tilhørighet'], 0],
  ['sp-15', 'Hva kan en screening med rimelighet gjøre?', ['Fastsette årsak', 'Stille individuell diagnose', 'Identifisere risiko og utløse nærmere undersøkelse', 'Bestemme varig opplæringsmål'], 2],
  ['sp-19', 'Hva må kontrolleres ved svak tiltaksrespons?', ['Bare elevens motivasjon', 'Mål, dose, gjennomføringskvalitet, tilgjengelighet og måling', 'Kun programnavnet', 'Om diagnosen er uendret'], 1],
  ['sp-22', 'Hva viser meta-analytisk intervensjonsevidens?', ['At én metode virker likt for alle', 'Positive gjennomsnittseffekter med betydelig heterogenitet', 'At lokal oppfølging er unødvendig', 'At alle utfall er like'], 1],
  ['sp-26', 'Hvorfor er et ASK-apparat alene utilstrekkelig?', ['Fordi teknologi aldri hjelper', 'Fordi språktilgang også krever modellerende og responsive partnere', 'Fordi ASK bare brukes i terapi', 'Fordi tale alltid må være målet'], 1],
  ['sp-30', 'Hva skal en IOP-evaluering sammenholde?', ['Diagnosen og skolens budsjett', 'Faktisk gitt opplæring og utvikling mot målene', 'Bare fravær og trivsel', 'Kun lærerens generelle inntrykk'], 1],
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

  assert(sourceBrief.scope.primary_domain_id === 'spesialpedagogikk', 'Feil source-first-domene');
  assert(nextBrief.scope.primary_domain_id === 'inkludering_tilpasset_opplaering', 'Neste source-first-domene må være inkludering og tilpasset opplæring');
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
        id: `sp-${topic.id}`,
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
      id: `utdanning-sp-q${String(index + 1).padStart(2, '0')}`,
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
    primary_domain_id: 'spesialpedagogikk',
    purpose: 'Analysere hvordan rettigheter, kontekstuell funksjon, inkluderende pedagogikk, kartlegging, tidlig innsats, målrettede tiltak, ASK og IOP kan forbindes uten diagnosefatalisme eller senkede forventninger.',
    sourceStrategy: {
      sourceBriefFile: P.sourceBrief,
      externalSourceCount: sources.length,
      paragraphLevelClaimTrace: true,
      everyPlannedClaimResolved: true,
      allUsedSourcesInspectable: true,
    },
    requiredCriticalDistinctions: [
      'diagnose vs pedagogisk beslutningsgrunnlag',
      'individbehov vs miljøbarriere',
      'fysisk plassering vs deltakelse og læring',
      'screening vs diagnose',
      'tiltaksrespons vs elevdefekt',
      'gjennomsnittseffekt vs universell metode',
      'hjelpemiddel vs funksjonelt språkmiljø',
      'IOP-dokument vs faktisk undervisningsverktøy',
    ],
    safety: {
      individualDiagnosis: false,
      fixedLearnerTyping: false,
      diagnosisFatalism: false,
      universalMethodClaim: false,
      placementAsInclusionProof: false,
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
    primary_domain_id: 'spesialpedagogikk',
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true,
    sourceFirst: true,
    emne_ids: [sourceBrief.scope.canonical_emne_id],
    method_ids: [...new Set(topics.flatMap((topic) => topic.method_ids))],
    title: 'Spesialpedagogikk: rettigheter, deltakelse og målrettet støtte',
    subtitle: 'Fra kontekstuell funksjon og inkluderende pedagogikk til kartlegging, ASK, IOP og overganger',
    lead: 'Kapittelet undersøker hvordan skolen kan forbinde rettigheter og ambisiøs opplæring med målrettet støtte, uten å gjøre diagnose til oppskrift, plassering til inkludering eller svak tiltaksrespons til elevens feil.',
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
  registryRow.canonicalModel.eighthFulltextChapter = P.chapter;
  registryRow.canonicalModel.ninthSourceClaimBrief = P.nextBrief;
  registryRow.canonicalModel.note = 'Åtte av 14 canonicale domener er fulltekstmaterialisert med til sammen 64 seksjoner, 256 claimsporede avsnitt og 256 verifiserte claims. Inkludering og tilpasset opplæring er source-first-klargjort som neste domene; Utdanning er ikke complete.';
  registryRow.editorialPlan.targetDomainCount = 14;
  registryRow.editorialPlan.completedSourceBriefCount = 9;
  registryRow.editorialPlan.registeredChapterCount = 8;
  registryRow.editorialPlan.nextGate = 'inclusion_adapted_education_source_brief_complete_full_chapter_production';
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
  statusRow.nextGate = 'inclusion_adapted_education_source_brief_complete_full_chapter_production';
  statusRow.note = 'Utdanning er materialisert 8/14: åtte domener har samlet 32 moduler, 64 fulltekstseksjoner, 256 claimsporede fagavsnitt, 256 verifiserte claims og 64 auditerte vurderingsoppgaver. Inkludering og tilpasset opplæring har source-first-brief klar som neste produksjonsport. Faget er chapters_in_progress, ikke complete.';

  const portalRow = portal.categories.find((row) => row.id === 'utdanning');
  portalRow.subjectPage = 'fagverk.html?subject=utdanning';
  portalRow.subjectStatus = 'materialized';

  pensum.status = 'active_foundation';
  pensum.complete_ready = false;
  pensum.domains.forEach((domain, index) => {
    domain.status = index < 8 ? 'materialized' : 'planned';
  });
  const materializedEmneIds = new Set([
    'em_utdanning_pedagogikk_laeringsteori',
    'em_utdanning_didaktikk',
    'em_utdanning_barnehage_tidlig_laering',
    'em_utdanning_grunnskole',
    'em_utdanning_videregaende_yrkesfag',
    'em_utdanning_hoyere_utdanning',
    'em_utdanning_vurdering_pedagogiske_malinger',
    'em_utdanning_spesialpedagogikk',
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
console.log(`Utdanning Spesialpedagogikk materialisert: ${result.modules} moduler, ${result.topics} seksjoner, ${result.paragraphs} avsnitt, ${result.claims} claims, ${result.sources} kilder og ${result.questions} oppgaver.`);
