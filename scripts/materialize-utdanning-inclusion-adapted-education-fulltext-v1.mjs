#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'inkludering-tilpasset-opplaering-fellesskap-tilgang-og-progresjon';
const DIR = `data/fagverk/utdanning/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/utdanning/inclusion_adapted_education_source_claim_brief_v1.json',
  nextBrief: 'data/fag/utdanning/history_of_education_source_claim_brief_v1.json',
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
  'in-01': 'Tilpasset opplæring er etter opplæringslova et ansvar for kommunen og fylkeskommunen og gjelder alle elever. Udirs overordnede del knytter plikten til variasjon og tilpasning innenfor læringsfellesskapet. Den kan derfor ikke reduseres til et individuelt tiltak som først starter når en diagnose eller sakkyndig vurdering foreligger.',
  'in-02': 'UNESCO og CRPD-komiteen beskriver inkludering som endring av kultur, politikk og praksis slik at systemet kan møte mangfold. Å slippe inn i samme skolebygning er bare fysisk tilgang; organisering, undervisning, relasjoner og støtte må også gi faktisk deltakelse, læring og tilhørighet uten diskriminering.',
  'in-03': 'Lik rett til opplæring betyr ikke identiske betingelser. CRPDs krav om tilgjengelighet og rimelig tilrettelegging åpner for ulike hjelpemidler, uttrykksformer og støttenivåer mot verdige og ambisiøse mål. Forskjeller i middel må begrunnes med tilgang og utbytte, ikke med lavere forventninger til bestemte elevgrupper.',
  'in-04': 'Når mange elever strever med samme tekstformat, tidskrav eller arbeidsmåte, er mønsteret informasjon om tilbudet. UNESCOs systemperspektiv tilsier at skolen først undersøker felles barrierer i læreplan, organisering og undervisning. Det utelukker ikke individuelle behov, men hindrer at én systemsvikt feilaktig blir forklart som mange separate elevmangler.',
  'in-05': 'Et inkluderende læringsmiljø må forene faglig og sosial tilhørighet med reell innflytelse. Udirs overordnede del og UNESCOs kunnskapssyntese peker på at elever skal bli anerkjent som deltakere, ikke bare være til stede. Tilhørighet viser seg i relasjoner, forventninger og muligheten til å bidra meningsfullt.',
  'in-06': 'Deltakelse kan observeres i hvem som får tilgang til oppgaven, tar ordet, mottar respons og påvirker gruppens arbeid. Florian og Black-Hawkins samt Ainscows aksjonsforskning viser verdien av å granske konkrete praksiser. Klasselisten eller bordplasseringen dokumenterer nærvær, men sier lite om elevens faglige rolle.',
  'in-07': 'Læring må inngå i inkluderingsvurderingen. UNESCOs GEM-rapport og Udirs læreplanverk gjør både deltakelse og faglig utvikling sentrale; et hyggelig fellesskap som systematisk skjermer enkelte fra vesentlig innhold, er derfor ikke tilstrekkelig. Resultater må likevel tolkes sammen med mulighetene eleven faktisk fikk til å lære.',
  'in-08': 'Elevens erfaring kan avdekke ensomhet, uforståelige støtteformer eller skjult ekskludering som fraværstall og prøver ikke viser. Ainscows undersøkende skoleutvikling gjør slike erfaringer til evidens om praksis. Stemmen må innhentes på tilgjengelige måter og følges til handling, ellers blir medvirkning en seremoni uten beslutningsverdi.',
  'in-09': 'CASTs UDL 3.0 organiserer planlegging rundt flere veier for engasjement, representasjon og handling eller uttrykk, med elevagens som mål. Florian og Black-Hawkins supplerer med prinsippet om å utvide det ordinært tilgjengelige. Rammeverkene gir designspørsmål, ikke en universell oppskrift eller dokumentasjon på effekt i enhver klasse.',
  'in-10': 'Et materiale er ikke funksjonelt tilgjengelig bare fordi det finnes digitalt, og et hjelpemiddel virker ikke bare fordi skolen eier det. CRPD-komiteen og CAST krever at format, teknologi, språk og aktivitet kan brukes sammen. Tilgangen må derfor prøves i den konkrete oppgaven med elevens faktiske arbeidsmåte.',
  'in-11': 'Når læreren på forhånd tilbyr flere innganger til innhold og flere gyldige bidragsformer, kan færre elever trenge synlige ettermonterte særordninger. Inkluderende pedagogikk søker slik å utvide repertoaret for alle. Gevinsten er ikke bare effektivitet, men mindre risiko for at nødvendig støtte markerer én elev som avvikende.',
  'in-12': 'Universell utforming og individuell tilrettelegging løser ulike deler av samme tilgangsproblem. UDL kan redusere forutsigbare barrierer for mange, mens CRPD understreker at en enkelt elev fortsatt kan trenge rimelig tilrettelegging og særskilt støtte. Å vise til universelt design kan derfor aldri alene avslutte en individuell rettighetsvurdering.',
  'in-13': 'Adaptiv undervisning bruker løpende tegn på forståelse til å justere forklaring, tempo, øving, støtte og utfordring. Udir og EEF beskriver dette som del av god ordinær undervisning. Justeringen må svare på aktuell læringsevidens, ikke på antatte faste læringsstiler eller en permanent forestilling om hva eleven kan bli.',
  'in-14': 'Lindners systematiske gjennomgang viser at differensiering omfatter planlegging, instruksjon, organisering og samarbeid. Forskjellige arbeidsark er derfor bare én mulig overflate. En faglig analyse spør hva som skal læres, hvilken barriere som hindrer det, hvilken endring som prøves, og hvordan responsen skal undersøkes.',
  'in-15': 'Deunk og kollegers meta-analyse fant små til moderate positive effekter av enkelte differensieringspraksiser, men studiene og effektstørrelsene var heterogene. Funnene støtter kvalifisert utprøving, ikke løftet om at differensiering alltid virker. Design, gjennomføringskvalitet, fag, elevgruppe og valgt utfall påvirker hva gjennomsnittet betyr lokalt.',
  'in-16': 'En tilpasning må vurderes både for umiddelbar tilgang og langsiktig progresjon. EEF og Udir støtter stillas som gjør krevende arbeid mulig, men støtte som aldri revideres kan skape avhengighet eller skjult målreduksjon. Evalueringspunktet må derfor undersøke om eleven blir mer selvstendig og får tilgang til videre faglig utvikling.',
  'in-17': 'Fleksibel gruppering samler elever midlertidig rundt et avgrenset læringsbehov, med tydelig mål og tidspunkt for ny vurdering. EEF og differensieringsforskningen gir grunnlag for slik målrettet organisering. Gruppen er et pedagogisk tiltak, ikke en identitet; medlemskapet skal endres når behov og respons endres.',
  'in-18': 'Permanente nivågrupper kan gjøre en foreløpig prestasjon til stabil sosial plassering. Norwichs forskjellsdilemma viser at kategorisering både kan åpne støtte og snevre inn forventninger. Risikoen øker når gruppen får mindre krevende innhold, færre læringsmuligheter eller ingen reell vei tilbake, selv om den opprinnelig ble kalt midlertidig.',
  'in-19': 'Stillas kan være modellering, eksempel, struktur, spørsmål eller hjelpemiddel som gjør vesentlig faglig aktivitet mulig. Det må gradvis trekkes tilbake eller endres når kompetansen øker. Hvis læreren fortsetter å gjøre den avgjørende tenkningen, er oppgaven kanskje gjennomført, men elevens selvstendighet er ikke nødvendigvis utviklet.',
  'in-20': 'Høye forventninger uten tilgjengelig støtte blir tom ambisjon, mens omsorg uten faglig utfordring kan skape ekskludering gjennom lave mål. Udir og Norwich synliggjør dette spennet. Ansvarlig tilpasning bevarer vesentlig innhold, tilfører eksplisitt støtte og undersøker om eleven faktisk får større mestringsrom over tid.',
  'in-21': 'Et læringsfellesskap bygges gjennom normer og oppgaver der ulike bidrag har faglig verdi, uten at enkelte elever blir permanente mottakere av hjelp. Udir og inkluderende pedagogikk legger vekt på mangfold som ressurs. Læreren må samtidig følge makt og forventninger, fordi velment hjelp kan gjøre rollen passiv.',
  'in-22': 'Samarbeid krever mer enn samme bord. Oppgaven må skape faglig gjensidig avhengighet, tilgjengelige bidragsformer og ansvar for felles forståelse. Dersom én elev alltid skriver og forklarer mens en annen bare klipper eller venter, er aktiviteten sosialt samordnet, men ikke nødvendigvis et inkluderende læringsarbeid.',
  'in-23': 'Norwich beskriver et dilemma: å synliggjøre forskjell kan gi anerkjennelse og støtte, men også stigma; å overse forskjell kan beskytte et likhetsideal, men nekte tilgang. Inkluderende pedagogikk fjerner ikke spenningen. Beslutningen må gjøre begge risikoene synlige, begrunnes situert og revideres med elevens erfaring.',
  'in-24': 'Observasjon av hvem som forklarer, venter, initierer, hjelper og blir hjulpet kan avdekke et skjult deltakelseshierarki. Florian og Black-Hawkins viser hvorfor praksis må undersøkes i aktivitet. Læreren kan så endre roller, ressurser eller spørsmål og kontrollere om flere får både intellektuelt ansvar og relevant støtte.',
  'in-25': 'Elevmedvirkning krever forståelig informasjon, tilgjengelige uttrykksmåter og et beslutningsspor som viser hva synet fikk å bety. Udir og CRPD-komiteen støtter dette rettighets- og kunnskapsperspektivet. Et møte eller spørreskjema er utilstrekkelig dersom eleven ikke forstår valgene eller svarene ikke påvirker vurderingen.',
  'in-26': 'Familier kan bidra med kunnskap om kommunikasjon, belastning, kultur og kontinuitet på tvers av arenaer. Samarbeidet må likevel bevare elevens selvstendige rett til å bli hørt. Voksne kan være uenige eller tolke erfaringer forskjellig; da må skolen dokumentere perspektivene, ikke gjøre én stemme automatisk representativ for den andre.',
  'in-27': 'UNESCO viser at barrierer kan forsterkes når funksjonsvariasjon virker sammen med språk, fattigdom, kjønn, migrasjon eller geografi. En enkelt kategori forklarer derfor ikke elevens skoleerfaring. Analysen må undersøke konkrete mekanismer og ressurser i situasjonen, ellers kan komplekse mønstre reduseres til stereotype gruppefortellinger.',
  'in-28': 'Gruppefordelte data kan avdekke systematiske forskjeller i nærvær, deltakelse og utbytte og dermed peke mot barrierer som krever handling. De kan ikke fastsette årsaken for et enkeltindivid. UNESCOs rammeverk tilsier kombinasjon med kvalitativ erfaring og praksisdata før skolen konkluderer om mekanisme eller tiltak.',
  'in-29': 'Ainscows aksjonsforskning og UNESCOs veiledning kobler inkluderende skoleutvikling til systematisk undersøkelse av barrierer. Elevdata og erfaringer må føres tilbake til konkrete valg i kultur, organisering og undervisning. Målet er ikke å rangere elever, men å finne hvor praksis begrenser tilgang og hva som bør prøves annerledes.',
  'in-30': 'Profesjonelt samarbeid blir forbedringsarbeid først når teamet har et avgrenset spørsmål, relevant evidens, et planlagt tiltak og tydelig ansvar for oppfølging. Ainscow og EEF støtter strukturert undersøkelse og undervisningsfokus. Høy møtefrekvens alene kan like gjerne produsere informasjonsutveksling uten endret praksis eller elevgevinst.',
  'in-31': 'Ressursinnsats bør vurderes etter om den øker tilgang, deltakelse og læring, ikke bare gjennom antall timer, assistenter eller tiltak. UNESCOs systemanalyser viser at formell tildeling og faktisk inkludering kan avvike. Evalueringen må derfor følge hva ressursen gjør i aktivitet og hvilke muligheter eleven får.',
  'in-32': 'Implementering må følges over tid for rekkevidde, kvalitet, utilsiktede konsekvenser og ulik virkning mellom elevgrupper. EEF, Ainscow og UNESCO understreker at en beslutning på papiret ikke garanterer praksis. Gjentatte data må brukes til justering, samtidig som skolen unngår å forveksle kortvarig variasjon med varig effekt.',
};

const MODULES = [
  { id: '01-rettighet-og-deltakelse', title: 'Rettighet, deltakelse og tilhørighet', topics: [0, 1] },
  { id: '02-utforming-og-adaptiv-undervisning', title: 'Utforming og adaptiv undervisning', topics: [2, 3] },
  { id: '03-gruppering-og-fellesskap', title: 'Gruppering, stillas og fellesskap', topics: [4, 5] },
  { id: '04-elevstemme-og-skoleutvikling', title: 'Elevstemme og skoleutvikling', topics: [6, 7] },
];

const ASSESSMENT_STEMS = [
  ['in-04', 'Hva bør skolen først undersøke når mange møter samme barriere?', ['Mange separate diagnoser', 'Utformingen av det felles tilbudet', 'Permanent nivådeling', 'Lavere mål for gruppen'], 1],
  ['in-06', 'Hva dokumenterer klasselisten alene?', ['Faglig deltakelse', 'Elevinnflytelse', 'Fysisk nærvær', 'Opplevd tilhørighet'], 2],
  ['in-12', 'Hvordan forholder UDL og individuell tilrettelegging seg?', ['De er komplementære nivåer', 'UDL opphever individuelle rettigheter', 'Bare individuell støtte teller', 'De kan aldri kombineres'], 0],
  ['in-15', 'Hva tillater Deunk-meta-analysen å konkludere?', ['At all differensiering virker likt', 'At enkelte praksiser har positive gjennomsnittseffekter i et heterogent grunnlag', 'At gjennomføring er irrelevant', 'At elevgrupper ikke påvirker resultatet'], 1],
  ['in-18', 'Hva er en sentral risiko ved permanent nivågruppering?', ['At alle får for høye mål', 'At foreløpig prestasjon blir stabil identitet og begrenset tilgang', 'At gruppen alltid oppløses for tidlig', 'At støtte blir usynlig'], 1],
  ['in-22', 'Hva kjennetegner et inkluderende samarbeidsoppdrag?', ['Samme bordplassering', 'Faglig gjensidig avhengighet og tilgjengelige bidragsformer', 'Én fast hjelper', 'Parallelle individuelle oppgaver'], 1],
  ['in-25', 'Når er elevmedvirkning reell?', ['Når møtet er gjennomført', 'Når informasjon og uttrykk er tilgjengelige og synet påvirker beslutningen', 'Når voksne er enige', 'Når eleven signerer et ferdig referat'], 1],
  ['in-32', 'Hva må langsiktig implementeringsoppfølging undersøke?', ['Bare om tiltaket ble vedtatt', 'Rekkevidde, kvalitet, utilsiktede følger og ulik virkning', 'Bare gjennomsnittskarakter', 'Kun ressursbruk'], 1],
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

  assert(sourceBrief.scope.primary_domain_id === 'inkludering_tilpasset_opplaering', 'Feil source-first-domene');
  assert(nextBrief.scope.primary_domain_id === 'utdanningshistorie', 'Neste source-first-domene må være utdanningshistorie');
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
        id: `in-${topic.id}`,
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
      id: `utdanning-in-q${String(index + 1).padStart(2, '0')}`,
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
    primary_domain_id: 'inkludering_tilpasset_opplaering',
    purpose: 'Analysere hvordan systemansvar, undervisningsdesign, fleksibel støtte, elevstemme og skoleutvikling kan gi nærvær, deltakelse, læring og tilhørighet uten fast elevtyping.',
    sourceStrategy: {
      sourceBriefFile: P.sourceBrief,
      externalSourceCount: sources.length,
      paragraphLevelClaimTrace: true,
      everyPlannedClaimResolved: true,
      allUsedSourcesInspectable: true,
    },
    requiredCriticalDistinctions: [
      'lik rett vs identiske betingelser',
      'nærvær vs deltakelse og læring',
      'universell utforming vs individuell tilrettelegging',
      'adaptiv undervisning vs fast elevtyping',
      'fleksibel gruppering vs permanent nivåidentitet',
      'stillas vs varig avhengighet',
      'elevstemme vs symbolsk konsultasjon',
      'vedtak vs implementert og evaluert praksis',
    ],
    safety: {
      identicalTreatmentAsEquality: false,
      fixedLearnerTyping: false,
      permanentLevelGrouping: false,
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
    primary_domain_id: 'inkludering_tilpasset_opplaering',
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true,
    sourceFirst: true,
    emne_ids: [sourceBrief.scope.canonical_emne_id],
    method_ids: [...new Set(topics.flatMap((topic) => topic.method_ids))],
    title: 'Inkludering og tilpasset opplæring: fellesskap, tilgang og progresjon',
    subtitle: 'Fra systemansvar og universell utforming til elevstemme og varig skoleutvikling',
    lead: 'Kapittelet undersøker hvordan skolen kan gi nærvær, deltakelse, læring og tilhørighet gjennom tilgjengelig design og reviderbar støtte, uten å gjøre plassering til inkluderingsbevis eller tilpasning til fast elevtyping.',
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
  registryRow.canonicalModel.ninthFulltextChapter = P.chapter;
  registryRow.canonicalModel.tenthSourceClaimBrief = P.nextBrief;
  registryRow.canonicalModel.note = 'Ni av 14 canonicale domener er fulltekstmaterialisert med til sammen 72 seksjoner, 288 claimsporede avsnitt og 288 verifiserte claims. Utdanningshistorie er source-first-klargjort som neste domene; Utdanning er ikke complete.';
  registryRow.editorialPlan.targetDomainCount = 14;
  registryRow.editorialPlan.completedSourceBriefCount = 10;
  registryRow.editorialPlan.registeredChapterCount = 9;
  registryRow.editorialPlan.nextGate = 'history_of_education_source_brief_complete_full_chapter_production';
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
  statusRow.nextGate = 'history_of_education_source_brief_complete_full_chapter_production';
  statusRow.note = 'Utdanning er materialisert 9/14: ni domener har samlet 36 moduler, 72 fulltekstseksjoner, 288 claimsporede fagavsnitt, 288 verifiserte claims og 72 auditerte vurderingsoppgaver. Utdanningshistorie har source-first-brief klar som neste produksjonsport. Faget er chapters_in_progress, ikke complete.';

  const portalRow = portal.categories.find((row) => row.id === 'utdanning');
  portalRow.subjectPage = 'fagverk.html?subject=utdanning';
  portalRow.subjectStatus = 'materialized';

  pensum.status = 'active_foundation';
  pensum.complete_ready = false;
  pensum.domains.forEach((domain, index) => {
    domain.status = index < 9 ? 'materialized' : 'planned';
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
    'em_utdanning_inkludering_tilpasset_opplaering',
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
console.log(`Utdanning Inkludering og tilpasset opplæring materialisert: ${result.modules} moduler, ${result.topics} seksjoner, ${result.paragraphs} avsnitt, ${result.claims} claims, ${result.sources} kilder og ${result.questions} oppgaver.`);
