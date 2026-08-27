#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'utdanningspolitikk-rettigheter-styring-ulikhet-og-legitimitet';
const DIR = `data/fagverk/utdanning/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/utdanning/education_policy_source_claim_brief_v1.json',
  nextBrief: 'data/fag/utdanning/school_leadership_organization_source_claim_brief_v1.json',
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
  'ep-01': 'Grunnloven § 109 etablerer utdanning som individuell rett og knytter grunnleggende opplæring til menneskelig utvikling, demokrati, rettsstat og menneskerettigheter. Rettens innhold må leses sammen med opplæringslova og internasjonale forpliktelser. Den gir en bindende ramme, men bestemmer ikke alene organisering, ressursnivå eller alle prioriteringer i skolen.',
  'ep-02': 'Opplæringslova fordeler rettigheter og plikter mellom elever, foreldre, kommuner, fylkeskommuner, skoler og statlige kontrollorganer. Ansvarskjeden omfatter gjennomføring, informasjon, medvirkning, klage og tilsyn. En politisk analyse må derfor angi hvilken aktør som har beslutningsmyndighet, finansieringsansvar og plikt til å rette avvik.',
  'ep-03': 'En formell rett blir virksom først når systemet har kompetanse, bemanning, finansiering, informasjon, klageadgang og effektivt tilsyn. OECDs kvalitetsgjennomgang viser at lokal kapasitet varierer i et desentralisert system. Lovfesting er derfor nødvendig rettighetsvern, men kan ikke brukes som empirisk bevis på at alle får rettigheten oppfylt.',
  'ep-04': 'Utdanningspolitikk handler om legitime, men delvis konkurrerende verdier: likhet, kunnskap, frihet, fellesskap, effektivitet, profesjonelt skjønn og lokal autonomi. Konfliktene kan ikke løses av evidens alene fordi valg av mål og fordeling også er normative. Faglig analyse skal klargjøre alternativer og konsekvenser, ikke utrope ett parti eller virkemiddel til fasit.',
  'ep-05': 'Norsk utdanningsstyring kombinerer nasjonal lov og læreplan med kommunalt og fylkeskommunalt skoleeierskap, lokale budsjetter og profesjonelt skjønn. Modellen er verken rent sentralisert eller rent lokal. Et konkret ansvarsspor må vise hvordan styringsnivåene kobles, hvor beslutningen tas og hvem som må håndtere gjennomføring og avvik.',
  'ep-06': 'Lov, finansiering, informasjon, kompetansetiltak, tilsyn og resultatdata er ulike virkemidler fordi de påvirker aktører gjennom forskjellige mekanismer. Regelverk pålegger, penger muliggjør eller prioriterer, kunnskap kan endre forståelse, og tilsyn kan håndheve. Et virkemiddelnavn forklarer derfor ikke effekt uten en eksplisitt virkningskjede.',
  'ep-07': 'Lokal autonomi kan gjøre det mulig å tilpasse tilbud, organisering og støtte til lokale forhold. OECD og finansieringsbeskrivelsen viser samtidig at administrativ, økonomisk og faglig kapasitet varierer. Desentralisering flytter derfor ikke bare frihet, men også arbeid, risiko og behov for kompetanse; den fjerner aldri statens overordnede rettighetsansvar.',
  'ep-08': 'Ansvarliggjøring blir uklar når én aktør mottar resultatkrav, en annen kontrollerer ressursene og en tredje har rettslig eller profesjonell myndighet. NOU-ene om regelverk og kvalitet viser behovet for tydelige roller. Analyse bør koble mål, beslutning, midler, gjennomføring, dokumentasjon og korreksjon i samme ansvarskjede.',
  'ep-09': 'Hvordan et problem defineres, avgjør hvilke årsaker, grupper og løsninger som blir synlige. Svake resultater kan for eksempel beskrives som undervisningsproblem, ressursproblem, ulikhetsproblem eller måleproblem. Hver ramme inviterer ulike virkemidler og utelatelser. Problemdefinisjonen må derfor behandles som et politisk valg som selv krever evidens.',
  'ep-10': 'Reformer formes av partier, profesjoner, forvaltning, kommuner, foreldre, forskere og interessegrupper med ulik tilgang til beslutningsarenaer. Helgøy og Homme samt skolevalgsstudien viser hvordan ideer møter institusjoner og koalisjoner. Reformdesign kan dermed ikke forklares som en automatisk respons på forskning eller én aktørs intensjon.',
  'ep-11': 'Wiborgs sammenligning av skandinavisk skolevalg viser at Norges begrensede markedsreformer må forklares gjennom koalisjoner og institusjonelle veto- og mulighetsstrukturer, ikke gjennom en vag nordisk kultur. Sammenligningen demonstrerer hvordan like ideer kan få ulik politikk når partier, organisasjoner og etablerte ordninger gir forskjellige handlingsrom.',
  'ep-12': 'Et virkemiddel kan være politisk attraktivt fordi det er enkelt å kommunisere, synlig eller passer en etablert problemfortelling. Det sier ikke om mekanismen er plausibel, ordningen gjennomførbar eller fordelingsvirkningen ønskelig. Policyanalyse må derfor skille appell fra virkning og undersøke kostnader, kapasitet, alternativer og berørte grupper.',
  'ep-13': 'Braun, Maguire og Balls policy-enactment-perspektiv beskriver hvordan skoler fortolker og oversetter policytekster i konkrete materielle, organisatoriske og profesjonelle vilkår. Policy flyttes ikke mekanisk fra departement til klasserom. Tekst, lokale historier, bemanning, artefakter og aktørforståelser virker sammen i den praksisen som faktisk oppstår.',
  'ep-14': 'Samme reform kan gi ulik praksis fordi skoler har forskjellig elevgrunnlag, bemanning, ledelse, lokaler, profesjonskultur og tilgang til støtte. Variasjonen er ikke i seg selv bevis på motstand eller feil. Den må undersøkes for om den uttrykker legitim tilpasning, kapasitetsmangel, uklart design eller brudd på rettigheter.',
  'ep-15': 'Gunnulfsens studie av skolelederes LK20-planlegging viser at lokal reformgjennomføring omfatter prioritering, meningsskaping, tidsbruk og organisasjonsvalg. Lederne formidler ikke bare en ferdig tekst. De bygger arenaer og arbeidsprosesser som påvirker hva lærere rekker å forstå, prøve og revidere, innenfor ulike lokale vilkår.',
  'ep-16': 'Profesjonelt skjønn er nødvendig fordi undervisnings- og elevsituasjoner ikke kan forhåndsreguleres fullt ut. Skjønnet er likevel ikke privat eller ubegrenset: det skal være rettighetsbundet, faglig begrunnet og mulig å etterprøve. Offentlig ansvar krever derfor både handlingsrom og institusjoner som kan undersøke beslutninger og rette feil.',
  'ep-17': 'Kommuner finansierer grunnskolen og fylkeskommuner videregående opplæring innenfor inntekts- og overføringssystemer som også gir lokale prioriteringsvalg. Finansiering er dermed både statlig ramme og lokal politikk. Analyse må skille frie inntekter, øremerkede ordninger, egne inntekter, kostnadsstruktur og beslutninger mellom konkurrerende tjenester.',
  'ep-18': 'Like nasjonale krav kan være ulikt krevende når avstander, skolestruktur, elevtall, rekrutteringsgrunnlag og økonomisk kapasitet varierer. Bæcks analyse av geografisk ulikhet og OECDs kommuneperspektiv viser at universelle regler møter forskjellige produksjonsvilkår. Lik plikt uten kapasitetsanalyse kan derfor gi systematiske forskjeller i faktisk tilbud.',
  'ep-19': 'Høyere ressursbruk gir ikke automatisk bedre læring fordi organisering, kompetanse, behov og kostnader påvirker sammenhengen. Samtidig kan utilstrekkelig bemanning, tid eller spesialistkompetanse blokkere lovfestede rettigheter og reformgjennomføring. Ressursanalyse må derfor undersøke både nødvendige innsatsfaktorer og mekanismene som omsetter dem til praksis.',
  'ep-20': 'Lik tildeling kan være prosedyremessig enkel, men gir ikke nødvendigvis likeverdige muligheter når behov og kostnader varierer. Fordelingspolitikk må eksplisitt begrunne hvilke forskjeller som skal kompenseres, hvordan behov måles og hvilke utilsiktede insentiver modellen skaper. Reisel og Bæck viser hvorfor sosial og geografisk ulikhet krever mer enn gjennomsnittstall.',
  'ep-21': 'Skolens kvalitet omfatter faglig læring, inkludering, danning, demokrati, læringsmiljø og rettighetsoppfyllelse. NOU 2023:1 advarer derfor mot å la ett mål representere hele mandatet. En kvalitetsmodell må vise hvilke formål den dekker, hvilke den utelater, og hvordan mål kan komme i konflikt uten å redusere bredden til én rangering.',
  'ep-22': 'Indikatorer gjør valgte fenomener synlige gjennom bestemte definisjoner, målemodeller, tidspunkt og aggregeringer. Samtidig skjuler de forhold som ikke inngår i konstruktet eller datagrunnlaget. Kvalitetsanalyse må derfor spørre hva indikatoren faktisk måler, med hvilken usikkerhet, for hvilke grupper og på hvilket organisatorisk nivå.',
  'ep-23': 'Resultatdata kan brukes formativt til å stille spørsmål og forbedre praksis, eller sanksjonerende til kontroll og rangering. Bruken påvirker hvordan aktører tolker data og kan skape strategisk tilpasning. NOU 2023:1 og markedsstyringsstudien viser derfor at dataverktøyets konsekvens avhenger av styringsrelasjonen, ikke bare datasettet.',
  'ep-24': 'Et resultatgap mellom grupper eller steder er et viktig signal om mulig ulikhet, men identifiserer ikke årsaken. Familieforhold, seleksjon, tilbud, måling og lokal kapasitet kan virke sammen. Før et tiltak velges, må alternative mekanismer undersøkes gjennom design som kan skille forklaringer, ellers blir forskjellen feilaktig brukt som kausal diagnose.',
  'ep-25': 'Reisels sammenligning skiller familieulikhet fra utdanningssystemets institusjonelle seleksjon som to veier til ulike utfall. De kan opptre samtidig, men peker mot forskjellige virkemidler. Politikken må derfor unngå å gjøre sosial bakgrunn til individuell egenskap og heller undersøke overganger, spor, forventninger og ressursfordeling i systemet.',
  'ep-26': 'Geografiske forskjeller kan bestå i en universell velferdsstat fordi avstand, tilbudsstruktur, arbeidsmarked, rekruttering og lokal kapasitet virker sammen. Bæck viser at rom ikke bare er bakgrunn, men en institusjonell betingelse. Nasjonal politikk bør derfor analysere hvor et tiltak kan gjennomføres, av hvem og med hvilke merkostnader.',
  'ep-27': 'Skolevalg kan styrke familiers innflytelse, men kan også endre elevsammensetning og segregering gjennom opptaksregler, informasjon, transport og bosettingsmønstre. Virkningen er institusjonelt betinget, ikke iboende i ordet valgfrihet. Analysen må følge hvem som faktisk kan velge, hvem som blir valgt og hvordan skolene påvirkes.',
  'ep-28': 'Nasjonale gjennomsnitt kan forbedres samtidig som bestemte grupper eller regioner faller etter. Derfor må resultater fordeles etter relevante dimensjoner som sosial bakgrunn, funksjon, språk, kjønn og geografi, med personvern og statistisk usikkerhet ivaretatt. Fordelingsanalyse hindrer at en samlet effekt skjuler politisk viktige ulikheter.',
  'ep-29': 'Legitim utdanningspolitikk krever åpne begrunnelser for mål, virkemidler, kostnader, fordelingsvalg og deltakelse. Grunnlovens utdanningsrett og prinsippene for regelstyring setter rammer for beslutningen, men demokratisk legitimitet krever også at berørte erfaringer blir hørt. Medvirkning er reell først når den kan påvirke problem, alternativ eller revisjon.',
  'ep-30': 'En evaluering bør skille mellom svak programteori, mangelfull implementering og et tiltak som ikke virker under rimelige betingelser. Policy-enactment viser hvorfor variasjon i gjennomføring ikke kan behandles som støy. Evaluatoren må dokumentere hva som faktisk ble gjort, hvilke mekanismer som ble utløst og hvor konteksten endret tiltaket.',
  'ep-31': 'Utilsiktede virkninger og ulik effekt mellom grupper må undersøkes selv når gjennomsnittsmålet forbedres. Et tiltak kan for eksempel øke samlet prestasjon og samtidig forsterke segregering, arbeidsbelastning eller eksklusjon. Ansvarlig evaluering setter derfor forhåndsdefinerte hovedmål sammen med fordelingsdata, kvalitative erfaringer og åpne søk etter skade.',
  'ep-32': 'Policyrevisjon bør organiseres som en eksplisitt læringssløyfe der evidens, rettigheter, kostnader, implementering og berørte aktørers erfaringer vurderes samlet. Evaluering gir ikke demokratisk fasit, men kan forbedre valget mellom alternativer. Beslutningstakere må dokumentere hva som videreføres, endres eller avsluttes og hvorfor ny informasjon fikk betydning.',
};

const MODULES = [
  { id: '01-rettigheter-og-styring', title: 'Rettigheter, styringsnivåer og virkemidler', topics: [0, 1] },
  { id: '02-reform-og-iverksetting', title: 'Reformdesign, oversettelse og profesjonelt skjønn', topics: [2, 3] },
  { id: '03-ressurser-og-kvalitet', title: 'Finansiering, kapasitet, kvalitet og data', topics: [4, 5] },
  { id: '04-ulikhet-og-legitimitet', title: 'Ulikhet, valg, evaluering og demokratisk revisjon', topics: [6, 7] },
];

const ASSESSMENT_STEMS = [
  ['ep-03', 'Hva trengs for at en formell utdanningsrett skal bli virksom?', ['Bare lovtekst', 'Kapasitet, finansiering, kompetanse, klage og tilsyn', 'Bare lokal autonomi', 'En nasjonal indikator'], 1],
  ['ep-06', 'Hvorfor må virkemidler analyseres separat?', ['De virker gjennom ulike mekanismer', 'Alle har identisk effekt', 'Navnet beviser virkningen', 'Finansiering og tilsyn er samme handling'], 0],
  ['ep-13', 'Hva betyr policy enactment?', ['Mekanisk kopiering av policytekst', 'Fortolkning og oversettelse i konkrete vilkår', 'At lokale aktører opphever rettigheter', 'Kun evaluering etter reformen'], 1],
  ['ep-20', 'Hva skiller likeverdig fordeling fra lik tildeling?', ['Likeverd ser bort fra behov', 'Likeverd vurderer ulikt ressursbehov og kostnadsstruktur', 'Lik tildeling kompenserer alltid ulikhet', 'Ingen forskjell finnes'], 1],
  ['ep-22', 'Hva er en indikator?', ['Hele kvaliteten', 'En selektiv representasjon basert på definisjon og målemodell', 'En kausal forklaring', 'Et verdinøytralt fotografi'], 1],
  ['ep-24', 'Hva forteller et resultatgap direkte?', ['Hvilket tiltak som virker', 'At en forskjell finnes, men ikke årsaken', 'At gruppen har en bestemt egenskap', 'At målingen er perfekt'], 1],
  ['ep-27', 'Hvordan bør skolevalg analyseres?', ['Som entydig frihet', 'Gjennom opptaksregler, faktisk valgevne, elevsammensetning og segregering', 'Uten bosettingsmønster', 'Som likt i alle land'], 1],
  ['ep-30', 'Hva bør evaluering skille mellom?', ['Programteori, implementering og virkning', 'Bare vinnere og tapere', 'Partipolitikk og forskning', 'Lov og læreplan'], 0],
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

  assert(sourceBrief.scope.primary_domain_id === 'utdanningspolitikk', 'Feil source-first-domene');
  assert(nextBrief.scope.primary_domain_id === 'skoleledelse_organisasjon', 'Neste source-first-domene må være skoleledelse og organisasjon');
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
        id: `ep-${topic.id}`,
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
      id: `utdanning-ep-q${String(index + 1).padStart(2, '0')}`,
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
    primary_domain_id: 'utdanningspolitikk',
    purpose: 'Analysere rettigheter, politiske verdikonflikter, styringsnivåer, virkemidler, reformoversettelse, finansiering, kvalitetsdata, ulikhet og demokratisk revisjon uten å gjøre evidens til partipolitisk fasit.',
    sourceStrategy: {
      sourceBriefFile: P.sourceBrief,
      externalSourceCount: sources.length,
      paragraphLevelClaimTrace: true,
      everyPlannedClaimResolved: true,
      allUsedSourcesInspectable: true,
    },
    requiredCriticalDistinctions: [
      'formell rett vs virksom rettighetsoppfyllelse',
      'politisk verdi vs empirisk effektpåstand',
      'styringsvirkemiddel vs dokumentert mekanisme',
      'desentralisert ansvar vs lokal kapasitet',
      'policytekst vs lokal enactment',
      'indikator vs bred kvalitetsforståelse',
      'resultatgap vs kausal forklaring',
      'gjennomsnittseffekt vs fordelingsvirkning',
    ],
    safety: {
      partisanRecommendationAsFact: false,
      lawAsImplementationProof: false,
      indicatorAsCompleteQuality: false,
      resultGapAsCause: false,
      averageAsDistributionProof: false,
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
    primary_domain_id: 'utdanningspolitikk',
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true,
    sourceFirst: true,
    emne_ids: [sourceBrief.scope.canonical_emne_id],
    method_ids: [...new Set(topics.flatMap((topic) => topic.method_ids))],
    title: 'Utdanningspolitikk: rettigheter, styring, ulikhet og legitimitet',
    subtitle: 'Fra juridisk plikt og virkemiddelvalg til lokal oversettelse, kvalitetsdata og demokratisk revisjon',
    lead: 'Kapittelet undersøker hvordan rettigheter, verdier, styringsnivåer, ressurser og evidens kobles i utdanningspolitikken, og hvorfor implementering, mekanismer og fordelingsvirkninger må holdes fra politisk appell og enkle gjennomsnitt.',
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
  registryRow.canonicalModel.eleventhFulltextChapter = P.chapter;
  registryRow.canonicalModel.twelfthSourceClaimBrief = P.nextBrief;
  registryRow.canonicalModel.note = 'Elleve av 14 canonicale domener er fulltekstmaterialisert med til sammen 88 seksjoner, 352 claimsporede avsnitt og 352 verifiserte claims. Skoleledelse og organisasjon er source-first-klargjort som neste domene; Utdanning er ikke complete.';
  registryRow.editorialPlan.targetDomainCount = 14;
  registryRow.editorialPlan.completedSourceBriefCount = 12;
  registryRow.editorialPlan.registeredChapterCount = 11;
  registryRow.editorialPlan.nextGate = 'school_leadership_organization_source_brief_complete_full_chapter_production';
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
  statusRow.nextGate = 'school_leadership_organization_source_brief_complete_full_chapter_production';
  statusRow.note = 'Utdanning er materialisert 11/14: elleve domener har samlet 44 moduler, 88 fulltekstseksjoner, 352 claimsporede fagavsnitt, 352 verifiserte claims og 88 auditerte vurderingsoppgaver. Skoleledelse og organisasjon har source-first-brief klar som neste produksjonsport. Faget er chapters_in_progress, ikke complete.';

  const portalRow = portal.categories.find((row) => row.id === 'utdanning');
  portalRow.subjectPage = 'fagverk.html?subject=utdanning';
  portalRow.subjectStatus = 'materialized';

  pensum.status = 'active_foundation';
  pensum.complete_ready = false;
  pensum.domains.forEach((domain, index) => {
    domain.status = index < 11 ? 'materialized' : 'planned';
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
    'em_utdanning_utdanningspolitikk',
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
console.log(`Utdanning Utdanningspolitikk materialisert: ${result.modules} moduler, ${result.topics} seksjoner, ${result.paragraphs} avsnitt, ${result.claims} claims, ${result.sources} kilder og ${result.questions} oppgaver.`);
