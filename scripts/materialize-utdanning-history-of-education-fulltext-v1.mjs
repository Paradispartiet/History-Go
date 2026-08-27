#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'utdanningshistorie-fellesskole-reformer-og-historisk-dommekraft';
const DIR = `data/fagverk/utdanning/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/utdanning/history_of_education_source_claim_brief_v1.json',
  nextBrief: 'data/fag/utdanning/education_policy_source_claim_brief_v1.json',
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
  'hi-01': 'Utdanningshistorie må skille mellom normerende tekster, institusjonelle ordninger og erfart praksis. En lov viser hva myndighetene fastsatte, mens protokoller, inspeksjoner, lærerbrev, elevarbeider og muntlige minner kan vise hvordan ordningen virket. Kildene har ulike formål og skjevheter og kan derfor ikke erstatte hverandre uten kildekritikk.',
  'hi-02': 'Perioder som allmueskole, folkeskole og grunnskole gjør et langt forløp håndterbart, men grensene er historikerens analytiske valg. Dokka og den lange skolehistoriske oversikten viser både brudd og seige kontinuiteter. En ny lovdato kan markere institusjonelt skifte selv om bygninger, lærebøker, arbeidsformer og lokale forskjeller består.',
  'hi-03': 'L97 dokumenterer hva staten ønsket at den tiårige grunnskolen skulle formidle, ikke nøyaktig hva alle lærere underviste eller elever lærte. Evalueringen av Kunnskapsløftet viser tilsvarende variasjon i lokalt læreplanarbeid. Læreplanen må derfor leses som normativ primærkilde og sammenholdes med implementerings- og praksisevidens.',
  'hi-04': 'Flere år i skolen er en viktig utvidelse av formell adgang, men sier ikke alene hvem som fikk språklig, sosial og faglig deltakelse. Historien om jenters utdanning og fornorskingspolitikken viser at institusjonsvekst kan gi nye muligheter og samtidig bevare eller skape ulikhet. Tilgang, innhold, erfaring og utfall må undersøkes separat.',
  'hi-05': 'Forordningen av 1739 etablerte obligatorisk allmueskole i en pietistisk stats- og kirkekontekst. Lesing, kristendomskunnskap og forberedelse til konfirmasjon var sentrale formål, ikke dagens brede kompetansebegrep. Å kalle ordningen moderne folkeskole ville derfor skjule både det konfesjonelle prosjektet og de begrensede undervisningsvilkårene.',
  'hi-06': 'Omgangsskolen flyttet læreren mellom gårder og grender og kunne gi kort årlig undervisning. Springer-oversikten og de norske skolehistoriene viser dermed avstanden mellom sentralt formulert plikt og lokal kapasitet i et spredtbygd samfunn. Ressurser, avstander, lærerrekruttering og husholdets arbeidsbehov påvirket hvor omfattende skolegangen faktisk ble.',
  'hi-07': 'Skolelovene av 1889 markerte overgangen fra almueskole til folkeskole og knyttet den offentlige skolen tettere til et utvidet politisk fellesskap. Reformen må ses sammen med parlamentarisme, kommunal utvikling og medborgerskap. Navneskiftet uttrykte en ny offentlig ambisjon, men gjorde ikke skolen sosialt eller geografisk ensartet over natten.',
  'hi-08': 'Folkeskoleutbyggingen skapte en mer felles institusjon, samtidig som by og land hadde ulike skolebygg, timetall, lærertilgang og videre utdanningsmuligheter. Parallelle skoleveier over folkeskolen opprettholdt sosial seleksjon. En nasjonal lovhistorie må derfor suppleres med lokalhistorie og elevløp for å vise hvem fellesskolen faktisk omfattet.',
  'hi-09': 'Sass’ komparative studie viser at jenters utdanningsadgang ble fremmet gjennom koalisjoner av reformaktører under bestemte politiske og institusjonelle vilkår. Utviklingen var ikke en automatisk bivirkning av generell skolevekst. Kjønnet tilgang gjaldt dessuten både opptak, faginnhold, eksamensrett, lærerutdanning og hvilke samfunnsroller utdanningen skulle legitimere.',
  'hi-10': 'Etterkrigstidens utbygging reduserte flere formelle barrierer, men sosial bakgrunn fortsatte å påvirke overgangen til høyere skoleslag og utdanningsvalg. Thuen og Volckmar viser at enhetsskolen nettopp ble begrunnet med slike forskjeller. Universell grunnopplæring må derfor ikke forveksles med identiske ressurser, forventninger eller overgangssjanser.',
  'hi-11': 'Sannhets- og forsoningskommisjonens kartlegging viser at skolen var en sentral arena for fornorskingspolitikken overfor samer og kvener eller norskfinner. Språkregler, internat, læremidler og lærerpraksis kunne svekke overføring av språk og kultur. Skolehistorien er dermed også historie om statlig makt, tap og langsiktige ettervirkninger.',
  'hi-12': 'En historieskriving som følger lover, departementer og majoritetens institusjoner kan gjøre minoriteters tvangserfaringer og motstand usynlige. Kommisjonsmateriale, lokale arkiv og berørte gruppers kunnskap må derfor inngå som mer enn et tilleggskapittel. Samtidig krever ulik kildeproduksjon åpenhet om representasjon, minne og dokumenterte fravær.',
  'hi-13': 'Lærerseminarer, kvalifikasjonskrav og organisering bidro over tid til en tydeligere lærerprofesjon med felles kunnskapsgrunnlag og kollektiv identitet. Profesjonalisering var likevel ikke bare statusheving; den bandt lærerne sterkere til statlige læreplaner og kommunal forvaltning. Autonomi og offentlig myndighetsutøvelse utviklet seg derfor i et gjensidig spenningsforhold.',
  'hi-14': 'Læreren var både statens og kommunens lokale representant og en aktør med faglig skjønn og kollektiv handlekraft. Skolehistorien og okkupasjonsstudien viser at lærere kunne oversette, forhandle om eller motsette seg styring. Rollen kan derfor ikke reduseres til lydig implementering eller full profesjonell uavhengighet.',
  'hi-15': 'I 1942 forsøkte Quisling-regimet å underordne lærerne en korporativ organisasjon og bruke skolen i ideologisk ensretting. Den omfattende læreraksjonen svarte med kollektiv avvisning under betydelig personlig risiko. Arkivstudien plasserer motstanden i okkupasjonsstatens institusjoner og gjør den til mer enn en løs fortelling om individuell tapperhet.',
  'hi-16': 'Læreraksjonen viser profesjonell og institusjonell handlekraft, men må ikke fortelles som om alle handlet likt eller av samme grunn. Arrestasjoner, organisasjonsnettverk, lokale variasjoner og etterkrigstidens minnekultur må undersøkes. Heroisering kan ellers skjule både dissens og hvordan fortellingen senere ble brukt til å definere profesjonens demokratiske identitet.',
  'hi-17': 'Etter andre verdenskrig ble enhetsskolen knyttet til velferdsstatens prosjekt om sosial utjevning og nasjonal integrasjon. Thuen og Volckmar viser hvordan felles skolegang skulle redusere barrierer fra klasse, kjønn og geografi. Idealets styrke lå både i institusjonell utbygging og i en politisk forestilling om skolen som samfunnsbærende fellesskap.',
  'hi-18': 'Niårig grunnskole ble ikke innført gjennom ett øyeblikkelig vedtak. Forsøksskoler prøvde organisering, innhold og differensiering før lovfestingen i 1969. Historien viser hvordan reform, administrasjon og kunnskapsproduksjon kunne virke sammen, men forsøksresultater må også leses mot politiske mål og forskjeller mellom forsøkskommuner og landet som helhet.',
  'hi-19': 'Enhetsskolen skapte et varig dilemma mellom felles institusjon og individuelle behov. Sosialdemokratisk politikk forsøkte å holde tilpasning innenfor fellesskapet, men spørsmål om nivådeling, støtte og valgfrihet forsvant ikke. Historien forklarer hvorfor dagens inkluderingsdebatt har institusjonelle røtter og ikke bare er et moderne metodeproblem.',
  'hi-20': 'Bred støtte til fellesskolen betydde ikke politisk enighet om alt skolen skulle være. Konflikter fortsatte om kunnskapsinnhold, differensiering, foreldrefrihet, profesjonsmakt og statlig kontroll. Senere resultat- og markedsinspirert styring virket inn i dette eldre konfliktfeltet, snarere enn å erstatte en helt harmonisk sosialdemokratisk orden.',
  'hi-21': 'Reformen i 1974 samlet gymnas og yrkesskoler i en felles videregående struktur. Den institusjonelle integrasjonen ga et bredere system, men fjernet ikke forskjeller i status, læretradisjon og overgangsmuligheter mellom studieforberedende og yrkesfaglige veier. Felles organisasjon må derfor analyseres sammen med sporenes faktiske innhold og utfall.',
  'hi-22': 'Reform 94 ga ungdom lovfestet rett til videregående opplæring og organiserte koblingen mellom skole og lærebedrift tettere. Stortingsmeldingen beskriver dette som en løsning på svakheter i den tidligere strukturen. Rettighetsutvidelsen var betydelig, men avhengig av tilbud, oppfølging og tilgang til læreplass for å bli reell sluttkompetanse.',
  'hi-23': 'Da nesten hele årskullet fikk adgang til videregående, ble variasjonen i erfaringer og støttebehov mer synlig. Reform 94 løste adgangsproblemet bedre enn fullføringsproblemet. Bekymringen for teoretisering av yrkesfag viser at en universell rett også kan skape nye politiske spørsmål om differensiering, relevans og likeverdige sluttkompetanser.',
  'hi-24': 'Opplæringslova 1998 samlet reguleringen av grunnskole og videregående opplæring og tydeliggjorde et rettighetsbasert system. Men lovens ord viser bare den juridiske strukturen. Ressurser, kommunal kapasitet, tilsyn og profesjonell fortolkning avgjorde hvordan rettigheter ble gjennomført, og må undersøkes i andre kilder.',
  'hi-25': 'L97 var både læreplan og markør for tiårig grunnskole med skolestart for seksåringer. Dokumentet formulerte et detaljert nasjonalt innholds-, kultur- og verdiprosjekt. Som historisk primærkilde viser det statens ambisjon om en felles referanseramme, samtidig som lokal praksis og elevers erfaring ikke kan leses direkte ut av teksten.',
  'hi-26': 'Kunnskapsløftet 2006 la større vekt på kompetansemål og lokalt arbeid med læreplanen. Den bestilte evalueringen fant variasjon i hvordan skoleeiere og skoler forstod og organiserte ansvaret. Desentralisering av oppgaven ga dermed ikke automatisk lokal kapasitet eller enhetlig praksis; styringsideen ble oversatt i forskjellige institusjonelle vilkår.',
  'hi-27': 'Nasjonale prøver, resultatdata og ansvarliggjøring endret hvem som kunne se, sammenligne og kreve forklaring for skoleresultater. Helgøy og Homme viser samtidig at Norge bare delvis tok i bruk markedsmekanismer. Resultatstyring må derfor analyseres som endret offentlig styring, ikke automatisk likestilles med privatisering eller fritt skolemarked.',
  'hi-28': 'Norsk utdanningsstyring etter 2000 kombinerte NPM-elementer som mål, data og ansvar med post-NPM-samarbeid, nasjonale regler og eldre profesjonsnormer. Slike hybride former betyr at reformlag virker samtidig. Historikeren bør derfor unngå en enkel overgangsfortelling fra regelstyring til marked og undersøke hvilke virkemidler som faktisk endret praksis.',
  'hi-29': 'Historisk dømmekraft krever at aktørers handlingsrom rekonstrueres i deres egen institusjonelle og språklige verden. Det betyr ikke moralsk relativisme: læreraksjonen og fornorskingspolitikken kan vurderes som motstand og urett. Men vurderingen blir sterkere når tilgjengelige alternativer, maktforhold og samtidige motstemmer dokumenteres framfor antas.',
  'hi-30': 'Reformintensjon, implementering og virkning må spores i forskjellige kilder. Et vedtak kan vise ønsket retning, møtereferat kan vise oversettelsen, observasjon eller intervju kan vise praksis, og statistikk kan vise mønstre i utfall. Prosessporing blir troverdig når lenkene dokumenteres, ikke når reformnavnet brukes som selve årsaken.',
  'hi-31': 'Arkivstillhet er ikke nøytral. Institusjonene bevarte oftere lederes vedtak enn barns erfaringer, og majoritetsspråkets dokumenter enn minoriteters muntlige kunnskap. Studiene av jenter og fornorskingspolitikk viser behovet for komplementære kilder. Fravær kan peke mot makt, men kan ikke fylles med ønsket fortelling uten evidens.',
  'hi-32': 'Skolehistorie kan belyse dagens konflikter når kontinuitet og brudd undersøkes eksplisitt: fellesskole og individuell tilpasning, statlig likhet og lokal frihet, profesjon og ansvarliggjøring. Fortiden gir ikke en ferdig fasit. En lineær framgangsfortelling ville skjule tilbakeslag, utilsiktede virkninger og at samme reform kunne gagne og skade ulike grupper.',
};

const MODULES = [
  { id: '01-kilder-og-allmueskole', title: 'Kilder, periodisering og allmueskole', topics: [0, 1] },
  { id: '02-ulikhet-og-profesjon', title: 'Ulikhet, språk og lærerprofesjon', topics: [2, 3] },
  { id: '03-enhetsskole-og-rettigheter', title: 'Enhetsskole og rettighetsutvidelse', topics: [4, 5] },
  { id: '04-styringsskift-og-dommekraft', title: 'Styringsskift og historisk dømmekraft', topics: [6, 7] },
];

const ASSESSMENT_STEMS = [
  ['hi-03', 'Hva kan en læreplan dokumentere direkte?', ['Nøyaktig undervisningspraksis', 'Offisielle mål og intensjoner', 'Alle elevers læringsutbytte', 'Læreres private vurderinger'], 1],
  ['hi-06', 'Hva viser omgangsskolen analytisk?', ['At sentral plikt alltid ble fullt gjennomført', 'Avstanden mellom nasjonal plikt og lokal kapasitet', 'At geografi var irrelevant', 'At alle fikk samme timetall'], 1],
  ['hi-11', 'Hvilken rolle hadde skolen i fornorskingspolitikken?', ['Ingen institusjonell rolle', 'Arena for språk- og kulturpolitisk makt', 'Bare frivillig kulturutveksling', 'Kun økonomisk omfordeling'], 1],
  ['hi-16', 'Hvordan bør læreraksjonen i 1942 undersøkes?', ['Som en enstemmig tidløs heltemyte', 'Med arkiv, variasjon, risiko og ettertidens minnekultur', 'Uten politisk kontekst', 'Bare gjennom senere jubileumstaler'], 1],
  ['hi-18', 'Hvordan ble niårig grunnskole utviklet?', ['Bare gjennom lovvedtaket i 1969', 'Gjennom forsøk før lovfesting', 'Uten lokal utprøving', 'Som privat skoleordning'], 1],
  ['hi-23', 'Hva løste Reform 94 bedre enn den løste fullføring?', ['Adgang til videregående', 'Læreplass for alle', 'Alle statusforskjeller', 'Lik sluttkompetanse'], 0],
  ['hi-27', 'Hva innebærer resultatstyring i denne historien?', ['Automatisk full privatisering', 'Endrede relasjoner for synlighet og ansvar uten nødvendigvis fullt marked', 'Fravær av statlig styring', 'At prøvefunn forklarer årsak alene'], 1],
  ['hi-31', 'Hva kan arkivstillhet uttrykke?', ['At hendelsen sikkert ikke skjedde', 'Makt og skjev dokumentproduksjon', 'At alle grupper var like representert', 'At historikeren fritt kan fylle tomrommet'], 1],
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

  assert(sourceBrief.scope.primary_domain_id === 'utdanningshistorie', 'Feil source-first-domene');
  assert(nextBrief.scope.primary_domain_id === 'utdanningspolitikk', 'Neste source-first-domene må være utdanningspolitikk');
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
        id: `hi-${topic.id}`,
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
      id: `utdanning-hi-q${String(index + 1).padStart(2, '0')}`,
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
    primary_domain_id: 'utdanningshistorie',
    purpose: 'Analysere norsk utdanningshistorie gjennom kilder, institusjoner, aktørkonflikter, ulik tilgang, reformprosesser og historisk dømmekraft uten lineær framgangsfortelling.',
    sourceStrategy: {
      sourceBriefFile: P.sourceBrief,
      externalSourceCount: sources.length,
      paragraphLevelClaimTrace: true,
      everyPlannedClaimResolved: true,
      allUsedSourcesInspectable: true,
    },
    requiredCriticalDistinctions: [
      'normerende tekst vs faktisk praksis',
      'periodisering vs årsaksforklaring',
      'utvidet adgang vs likeverdig deltakelse',
      'nasjonal institusjon vs lokal kapasitet',
      'majoritetsfortelling vs minoritetserfaring',
      'profesjonsminne vs dokumentert variasjon',
      'formell rett vs fullføring og utfall',
      'reformintensjon vs implementering og virkning',
    ],
    safety: {
      linearProgressMyth: false,
      lawAsImplementationProof: false,
      majorityOnlyNarrative: false,
      reformNameAsCause: false,
      archiveSilenceAsFreeInference: false,
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
    primary_domain_id: 'utdanningshistorie',
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true,
    sourceFirst: true,
    emne_ids: [sourceBrief.scope.canonical_emne_id],
    method_ids: [...new Set(topics.flatMap((topic) => topic.method_ids))],
    title: 'Utdanningshistorie: fellesskole, reformer og historisk dømmekraft',
    subtitle: 'Fra allmueskole og fornorsking til enhetsskole, rettighetsutvidelse og resultatstyring',
    lead: 'Kapittelet undersøker hvordan skole, profesjon, rettigheter og styring har endret seg, og hvordan lovtekst, lokale erfaringer, minoritetsperspektiver og utfall må holdes fra hverandre i en etterprøvbar historisk analyse.',
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
  registryRow.canonicalModel.tenthFulltextChapter = P.chapter;
  registryRow.canonicalModel.eleventhSourceClaimBrief = P.nextBrief;
  registryRow.canonicalModel.note = 'Ti av 14 canonicale domener er fulltekstmaterialisert med til sammen 80 seksjoner, 320 claimsporede avsnitt og 320 verifiserte claims. Utdanningspolitikk er source-first-klargjort som neste domene; Utdanning er ikke complete.';
  registryRow.editorialPlan.targetDomainCount = 14;
  registryRow.editorialPlan.completedSourceBriefCount = 11;
  registryRow.editorialPlan.registeredChapterCount = 10;
  registryRow.editorialPlan.nextGate = 'education_policy_source_brief_complete_full_chapter_production';
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
  statusRow.nextGate = 'education_policy_source_brief_complete_full_chapter_production';
  statusRow.note = 'Utdanning er materialisert 10/14: ti domener har samlet 40 moduler, 80 fulltekstseksjoner, 320 claimsporede fagavsnitt, 320 verifiserte claims og 80 auditerte vurderingsoppgaver. Utdanningspolitikk har source-first-brief klar som neste produksjonsport. Faget er chapters_in_progress, ikke complete.';

  const portalRow = portal.categories.find((row) => row.id === 'utdanning');
  portalRow.subjectPage = 'fagverk.html?subject=utdanning';
  portalRow.subjectStatus = 'materialized';

  pensum.status = 'active_foundation';
  pensum.complete_ready = false;
  pensum.domains.forEach((domain, index) => {
    domain.status = index < 10 ? 'materialized' : 'planned';
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
    'em_utdanning_utdanningshistorie',
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
console.log(`Utdanning Utdanningshistorie materialisert: ${result.modules} moduler, ${result.topics} seksjoner, ${result.paragraphs} avsnitt, ${result.claims} claims, ${result.sources} kilder og ${result.questions} oppgaver.`);
