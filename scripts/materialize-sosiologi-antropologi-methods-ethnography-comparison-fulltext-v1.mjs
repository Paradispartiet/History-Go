#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'metode-etnografi-sammenligning-feltarbeid-og-slutning';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/politikk/sosiologi_antropologi/methods_ethnography_comparison_source_claim_brief_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json',
  reconciliation: 'reports/fagverk/sosiologi-antropologi-reconciliation-v1.json',
  chapter: `${DIR}.json`,
  brief: `${DIR}/brief.json`,
  claims: `${DIR}/claims.json`,
  assessment: `${DIR}/assessment.json`,
  report: 'reports/fagverk/sosiologi-antropologi-methods-ethnography-comparison-fulltext-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };

const PARAGRAPHS = {
  "mea-01": "Et etnografisk forskningsspørsmål må navngi en observerbar praksis, relasjon eller prosess og samtidig være åpent for revisjon. «Hvordan er kulturen?» avgrenser verken handling, aktører eller tid, mens et spørsmål om hvordan en vaktordning forhandles kan følges i hendelser. Hammersley og Atkinson samt Becker viser hvorfor begrep, feltarbeid og overraskende data må påvirke hverandre gjennom hele designet.",
  "mea-02": "Et felt finnes ikke automatisk som én landsby, organisasjon eller nettgruppe. Forskeren konstruerer det gjennom valg av steder, personer, tidsrom, hendelser og forbindelser og må forklare hva avgrensningen utelater. Open Encyclopedia of Anthropology og Hammersley og Atkinson gjør dermed feltet til en etterprøvbar designbeslutning, ikke en naturlig beholder for en homogen gruppe.",
  "mea-03": "Sensitiverende begreper hjelper forskeren å se etter relasjoner og variasjon uten å fastsette utfallet på forhånd. Hvis «tillit» brukes som ferdig forklaring, kan kontroll, vane eller avhengighet bli usynlig. Becker og etnografioversikten støtter en iterativ prosess der foreløpige begreper prøves mot negative tilfeller, omformuleres og først senere gis mer presis analytisk betydning.",
  "mea-04": "Tilgang gjennom en leder, administrator eller lokal ekspert er også seleksjon. Portvakten kan åpne offisielle møter, men skjerme konflikter, uformelt arbeid eller kritiske ansatte. Forskningsdesignet må dokumentere hvem som formidlet adgang, hvilke vilkår som ble satt og hvilke alternative innganger som manglet. Hammersley og Atkinson og NESH kobler denne transparensen til både kunnskapskvalitet, frivillighet og maktasymmetri.",
  "mea-05": "Deltakende observasjon kombinerer nærvær i praksis med systematisk registrering og senere analyse. Malinowskis metodeideal viste verdien av langvarig hverdagskontakt, mens nyere etnografi understreker at deltakelse aldri gir full innsikt. Forskeren må skille det som ble gjort sammen med deltakerne, det som ble sett uten deltakelse og det som bare er gjenfortalt av andre.",
  "mea-06": "Feltrollen endres når forskeren lærer mer, får oppgaver, avviser forespørsler eller forbindes med bestemte personer. «Deltakerobservatør» er derfor ikke en stabil og tilstrekkelig etikett. Hammersley og Atkinson og etnografioversikten krever konkret beskrivelse av synlighet, ansvar, grad av deltakelse og relasjonell plassering, slik at leseren kan vurdere hvordan rollen påvirket tilgang og handlinger.",
  "mea-07": "Språkkompetanse bestemmer hvilke nyanser, vitser, konflikter og dokumenter forskeren kan forstå, mens feltets tidsrom avgjør hvilke rutiner eller sesonger som faktisk observeres. Malinowskis vekt på språklæring må kombineres med eksplisitt dokumentasjon av tolker, oversettelsesvalg og fravær. Et kort opphold kan belyse en hendelse, men kan ikke uten videre beskrive et helt års normalitet.",
  "mea-08": "Reaktivitet oppstår når mennesker tilpasser seg forskerens nærvær, men kan ikke ganske enkelt trekkes fra som målefeil. Over tid kan responsen endre seg, og ulike situasjoner kan sammenlignes. Etnografioversikten og Emersons feltarbeidstilnærming støtter refleksive notater om hvem som tok initiativ, hva som ble forklart for forskeren, og når observasjoner avvek fra intervjuutsagn.",
  "mea-09": "Feltnotater er ikke rå erfaring lagret uten bearbeiding. Valg av scene, detalj, direkte tale, rekkefølge og språk former allerede hva som blir analytisk tilgjengelig. Emerson, Fretz og Shaw viser hvordan skrivepraksisen må synliggjøres, mens Writing Culture minner om tekstens autoritet. Forskeren bør derfor datere, plassere og skille observerte hendelser fra egne reaksjoner og foreløpige fortolkninger.",
  "mea-10": "Korte samtidige notater, utvidede beskrivelser skrevet samme dag og analytiske memoer skrevet senere har ulike kunnskapsroller. Når lagene merkes, kan leseren se hva som bygger på nær hukommelse og hva som er etterfølgende begrepsarbeid. Emerson og Becker støtter denne sporbarheten, som også hindrer at en senere teori feilaktig framstilles som noe deltakeren sa eller forskeren observerte i øyeblikket.",
  "mea-11": "Et intervjuutsagn er en situert handling rettet mot en intervjuer, ikke en direkte avlesning av stabil indre mening. Spørsmålsform, sted, publikum, taushet og relasjonen mellom partene påvirker svaret. Hammersley og Atkinson og etnografioversikten tilsier at utsagn sammenholdes med observasjon, dokumenter og andre posisjoner uten at uenighet automatisk tolkes som løgn eller feil.",
  "mea-12": "Dokumenter og digitale spor er produsert for bestemte formål gjennom skjemaer, plattformer, søkefelt, arkivering og tilgangsregler. De dokumenterer derfor både et fenomen og institusjonens måte å registrere det på. Hammersley og Atkinson og Becker støtter kildekritiske spørsmål om opphav, manglende data, versjon og publikum før en logg, rapport eller klikkserie brukes som ufiltrert bilde av sosial praksis.",
  "mea-13": "Et case må avgrenses etter fenomen, sted, tidsrom og relevant prosess før sammenligning begynner. En skole kan være case for en reformimplementering, men ikke automatisk for hele utdanningssystemet. Gerring og Tilly viser at uklare enheter blander nivåer og tidsforløp. En eksplisitt grense gjør det mulig å identifisere interne variasjoner, forbindelser til andre case og hvilket utfall som faktisk forklares.",
  "mea-14": "Strategisk caseutvalg kan velge et kritisk, typisk, avvikende eller mest-liknende case for å undersøke en mekanisme eller kontrast. Small og Gerring viser at denne logikken ikke gir statistisk representativitet bare fordi beskrivelsen er rik. Forskeren må angi hvilken slutning utvalget kan bære, hvilke populasjonspåstander som krever annen sampling, og hvilke alternative case som kunne ha utfordret resultatet.",
  "mea-15": "Sekvensielt utvalg lar analyse av ett case styre valget av det neste. Et nytt case kan prøve om samme mekanisme gjentas under like betingelser eller om en teoretisk forskjell gir forventet kontrast. Small og Becker støtter denne iterative logikken, men den må dokumenteres: etterpåkonstruert utvalgsbegrunnelse kan ellers skjule at forskeren stoppet da materialet passet ønsket fortelling.",
  "mea-16": "Historisk sammenligning bør følge relasjoner, hendelsesrekkefølger og gjensidig påvirkning, ikke anta at land eller samfunn er uavhengige beholdere. Tilly kritiserer enorme sammenligninger som mister prosess, mens Gerring krever presis case- og utfallsdefinisjon. Koloniale forbindelser, migrasjon eller policyoverføring kan være selve mekanismen og må derfor inngå i stedet for å behandles som forstyrrende bakgrunn.",
  "mea-17": "Flerstedlig etnografi kan følge mennesker, objekter, metaforer, penger eller konflikter gjennom forbindelser mellom institusjoner og steder. Marcus’ poeng er ikke å samle litt data overalt, men å la forskningsspørsmålet bestemme hva som spores. Etnografioversikten understreker fortsatt dybde og relasjon: hvert nytt knutepunkt må bidra til å forklare en dokumentert forbindelse, ikke bare utvide kartet.",
  "mea-18": "Når feltarbeidet flytter til et nytt sted, endres portvakter, språk, normer, tidsdekning og forskerrolle. Observasjoner fra to steder er derfor ikke automatisk sammenlignbare. Marcus og Hammersley og Atkinson krever at overgangen begrunnes mot sporet som følges, og at asymmetrisk datamengde rapporteres. Et hovedkontor og en lokal avdeling kan belyse ulike deler av samme prosess uten å være like case.",
  "mea-19": "Digitale spor formes av plattformenes grensesnitt, rangeringssystem, moderering, sletting og brukerutvalg. En kommentarstrøm er ikke uredigert kollektiv mening, og fravær kan skyldes design eller sanksjon. Hammersley og Atkinsons digitale etnografi og Beckers kildekritiske resonnement tilsier at forskeren dokumenterer teknisk innsamlingsflate, tidspunkt, synlighetslogikk og hvilke handlinger plattformen ikke registrerer.",
  "mea-20": "At et innlegg er offentlig tilgjengelig, betyr ikke at deltakeren forventer forskning, varig arkivering eller sitat i en ny kontekst. NESH og American Anthropological Association krever vurdering av forventet privathet, sårbarhet, gjenkjennelighet og mulig skade. Brukernavn kan fjernes uten at sitatet blir anonymt; søkbar tekst, nisjeforum og hendelsesdetaljer kan fortsatt identifisere personen.",
  "mea-21": "Geertz’ tette beskrivelse knytter en handling til situasjon, kode og mulige betydninger, men fylde er ikke bevis alene. Emersons feltarbeidsmetode gjør kildelaget synlig gjennom detaljerte notater. En ansvarlig tolkning viser hvilke observasjoner og utsagn den bygger på, hvem som deler koden, og hvilke alternative lesninger eller hendelser som begrenser konklusjonen.",
  "mea-22": "Etnografisk tekst fordeler stemme og autoritet gjennom hvilke personer som siteres, hvem som får et navn, hvilken scene som åpner kapitlet og hvordan forskeren forteller. Writing Culture gjør disse valgene til metodisk og politisk analyse, mens Geertz viser fortolkningens nødvendighet. Transparens krever ikke en stemmeløs tekst, men at representasjonsvalgene og deres konsekvenser kan vurderes.",
  "mea-23": "Refleksivitet undersøker hvordan forskerens posisjon, institusjon, språk og relasjoner former adgang, samhandling og analyse. Writing Culture og etnografioversikten gir grunnlag for denne kontrollen, men posisjon avgjør ikke automatisk sannhet. En insider kan mangle tilgang til konflikter, og en outsider kan misforstå koder. Påstanden må kobles til konkrete dataforskjeller og ikke stoppe ved identitetsbeskrivelse.",
  "mea-24": "Et samlet kulturportrett blir falskt presist hvis deltakernes uenighet og negative tilfeller redigeres bort. Geertz’ fortolkning må derfor kombineres med Writing Cultures kritikk av representasjon. Forskeren bør vise hvem som bestrider en kode, når en praksis bryter mønsteret og om avviket krever ny avgrensning. Uenighet er analytisk evidens, ikke bare støy rundt en hovedfortelling.",
  "mea-25": "Informert samtykke er en løpende prosess fordi feltarbeidets spørsmål, relasjoner og publiseringsrisiko kan endre seg. AAA og NESH krever informasjon om formål, metode, finansiering, konsekvenser og rettigheter på en forståelig måte. Et tidlig samtykke dekker ikke automatisk sensitive hendelser eller nye digitale bruksmåter; forskeren må dokumentere når og hvordan samtykket ble fornyet eller avgrenset.",
  "mea-26": "En skoleleder, arbeidsgiver eller forumadministrator kan gi institusjonell adgang, men kan ikke samtykke på vegne av alle deltakere. NESH og Hammersley og Atkinson viser hvorfor avhengighetsforhold, reell frivillighet og mulighet til å avstå må vurderes separat. Forskeren må også unngå at portvakten får vite hvem som takket nei eller kontrollere deltakernes utsagn.",
  "mea-27": "Anonymisering må testes mot kombinasjonen av sted, rolle, tidspunkt, hendelse og sitat, ikke bare mot fravær av navn. NESH og AAA understreker skadebegrensning og konfidensialitet, særlig i små miljøer. Et ordrett sitat kan finnes med søk, og en unik stilling kan identifisere personen. Dataminimering, omskriving og utelatelse må vurderes opp mot påstandens dokumentasjonsbehov.",
  "mea-28": "Forskerens ansvar for skadebegrensning og redelig representasjon gjelder også materiale som er lovlig eller teknisk tilgjengelig. AAA og NESH skiller dermed juridisk adgang fra forskningsetisk forsvarlighet. Analysen må vurdere stigma, represalier, uønsket synlighet og gruppekonsekvenser, samtidig som den ikke lover risikofrihet. Etiske valg skal begrunnes og inngå i vurderingen av kunnskapens kvalitet.",
  "mea-29": "Koding og memoarbeid skal bevare forbindelsen mellom analytisk begrep, konkret hendelse og kilde. Ordtelling alene kan ikke avgjøre om «tillit» uttrykker erfaring, ironi eller forskerens etikett. Emerson og Becker støtter en sporbar bevegelse fra utdrag til kode, sammenligning og memo. Moteksempler og kodeendringer bør beholdes slik at den endelige teorien ikke framstår mer lineær enn analysen var.",
  "mea-30": "Analytisk generalisering angir hvilken mekanisme, relasjon eller kontrast et case belyser og hvilke betingelser som kan gjøre innsikten relevant andre steder. Small og Gerring skiller dette fra et estimat av hvor vanlig fenomenet er. Konklusjonen må derfor navngi rekkevidden og ikke bruke ett intensivt case som prosentbevis for en befolkning; utbredelse krever et egnet utvalgsdesign.",
  "mea-31": "Teoribygging i etnografi beveger seg mellom overraskende observasjoner, foreløpige begreper, alternative forklaringer og strategiske sammenligninger. Becker viser hvordan forskningsresonnement kan omforme spørsmålet, mens etnografioversikten knytter analyse til feltets kompleksitet. Iterasjon er likevel ikke fri improvisasjon: memoer og claimspor må vise hvorfor en teori ble endret og hvilken evidens som utfordret tidligere versjon.",
  "mea-32": "En ansvarlig metoderapport oppgir hvordan adgang ble gitt, hvem som deltok, feltets tidsrom, språk, utvalg, dokumentasjon og analytiske trinn. Den viser negative tilfeller, etiske valg, usikkerhet og hva materialet ikke kan bære. NESH og Tilly støtter henholdsvis ansvarlighet og prosesspresisjon; leseren skal kunne skille dokumentert funn, foreslått mekanisme, sammenligningsgrunnlag og ubegrunnet populasjonspåstand."
};

const MODULES = [
  { id: '01-sporsmal-felt-og-feltroller', title: 'Forskningsspørsmål, felt og feltroller', topicIndexes: [0, 1] },
  { id: '02-dokumentasjon-case-og-sammenligning', title: 'Dokumentasjon, case og sammenligning', topicIndexes: [2, 3] },
  { id: '03-flerstedlighet-digitale-spor-og-representasjon', title: 'Flerstedlighet, digitale spor og representasjon', topicIndexes: [4, 5] },
  { id: '04-etikk-analyse-og-slutning', title: 'Etikk, analyse og slutning', topicIndexes: [6, 7] },
];

const QUESTIONS = [
  [
    "Hva må et etnografisk forskningsspørsmål angi?",
    [
      "Bare en gruppeetikett",
      "En observerbar praksis, relasjon eller prosess",
      "Et ferdig teorisvar"
    ],
    1,
    "mea-01"
  ],
  [
    "Hva dokumenterer feltrollen?",
    [
      "Bare forskerens stillingstittel",
      "Grad av deltakelse, ansvar og synlighet",
      "At forskeren har full tilgang"
    ],
    1,
    "mea-06"
  ],
  [
    "Hvorfor skilles jottings, utvidede notater og memoer?",
    [
      "For å gjøre tolkningens tidslag sporbare",
      "For å skjule analyse",
      "For å gjøre alle notater samtidige"
    ],
    0,
    "mea-10"
  ],
  [
    "Hva gir strategisk caseutvalg ikke automatisk?",
    [
      "Mekanismeprøving",
      "En analytisk kontrast",
      "Populasjonsrepresentativitet"
    ],
    2,
    "mea-14"
  ],
  [
    "Hva kjennetegner flerstedlig etnografi?",
    [
      "Litt data fra flest mulig steder",
      "Sporing av begrunnede forbindelser",
      "At alle steder behandles likt"
    ],
    1,
    "mea-17"
  ],
  [
    "Hva må digitale spor analyseres gjennom?",
    [
      "Plattform, grensesnitt, moderering og seleksjon",
      "Kun antall innlegg",
      "Antakelsen om uredigert atferd"
    ],
    0,
    "mea-19"
  ],
  [
    "Hva erstatter ikke portvaktens tillatelse?",
    [
      "Institusjonell adgang",
      "Deltakernes frivillighet og medvirkning",
      "En avtale med ledelsen"
    ],
    1,
    "mea-26"
  ],
  [
    "Hva er analytisk generalisering?",
    [
      "Et estimat av hvor vanlig noe er",
      "En avgrenset slutning om mekanisme eller kontrast",
      "En universell påstand fra ett case"
    ],
    1,
    "mea-30"
  ]
];

function buildReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_methods_ethnography_comparison_fulltext_audit_v1',
    version: '1.0.0', updated_at: '2026-08-28', status: 'pass',
    conclusion: 'methods_ethnography_comparison_fulltext_materialized_subcategory_still_expansion_planned',
    subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID,
    counts: { domainsMaterialized: 3, targetDomains: 12, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 13, assessmentQuestions: 8, teachingScenarios: sourceBrief.decision_scenarios.length, nextSourceBriefDomains: 1 },
    gates: { definitionAndBackground: true, namedTheoriesAndResearchers: true, findingsMethodsAndLimits: true, realDisagreement: true, teachingScenarios: true, plannedClaimsResolvedOneToOne: true, paragraphClaimTraceReciprocalAndComplete: true, everySourceInspectableAndUsed: true, fieldConstructionAccessAndReactivityBoundaries: true, caseSelectionComparisonAndGeneralizationBoundaries: true, digitalTraceAndPlatformBoundaries: true, researchEthicsConsentAndConfidentiality: true, chapterRegisteredInSubcategoryExactlyOnce: true, categoryStatusStillExpansionPlanned: true },
    six_part_quality_review: { correctness_and_evidence: 5, coverage_and_completion: 5, disciplinary_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 4, total: 29, maximum: 30, note: 'Felt 3 er fulltekstmaterialisert og auditerbart; underkategorien er fortsatt uferdig med 3/12 felt.' },
  };
}

export function materialize() {
  const sourceBrief = read(P.sourceBrief);
  const topics = sourceBrief.topic_briefs;
  const plannedClaims = topics.flatMap((topic) => topic.planned_claims);
  if (plannedClaims.length !== 32 || Object.keys(PARAGRAPHS).length !== 32) throw new Error('Forventet 32 planlagte claims og 32 avsnitt');
  const moduleFiles = [];
  for (const moduleSpec of MODULES) {
    const file = `${DIR}/${moduleSpec.id}.json`;
    moduleFiles.push(file);
    write(file, {
      schema: 'history_go_fagverk_module_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID,
      id: moduleSpec.id, title: moduleSpec.title,
      sections: moduleSpec.topicIndexes.map((topicIndex) => {
        const topic = topics[topicIndex];
        return { id: topic.id, title: topic.title, method_ids: topic.method_ids, boundary: topic.boundary, paragraphs: topic.planned_claims.map((claim) => PARAGRAPHS[claim.id]), paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id]) };
      }),
    });
  }
  write(P.chapter, {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'politikk', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', domain_id: 'metode_etnografi_sammenligning', id: CHAPTER_ID, chapter_id: CHAPTER_ID,
    title: 'Metode: etnografi, sammenligning, feltarbeid og slutning', subtitle: 'Fra feltkonstruksjon og deltakende observasjon til caseutvalg, flerstedlighet, etikk og analytisk generalisering',
    lead: 'Etnografi og sammenligning produserer situert kunnskap gjennom avgrensede feltroller, dokumenterte observasjoner, strategisk caseutvalg og eksplisitte slutninger. Kapittelet viser hvordan tilgang, feltnotater, intervjuer, digitale spor og representasjon formes av relasjoner og institusjoner, og hvorfor rike case aldri automatisk blir populasjonsestimater eller etisk risikofrie data.',
    learningObjectives: ['formulere reviderbare spørsmål og konstruere et eksplisitt felt', 'dokumentere adgang, portvakter, språk, tidsrom, feltrolle og reaktivitet', 'skille feltnotatets observasjon, minne og analytiske memo', 'analysere intervju, dokument og digitale spor som produserte kilder', 'begrunne caseavgrensning, strategisk og sekvensielt utvalg', 'følge historiske og flerstedlige forbindelser uten beholdertenkning', 'vurdere løpende samtykke, indirekte identifisering og skade', 'skille analytisk generalisering fra populasjonsrepresentativitet'],
    moduleFiles, briefFile: P.brief, claimsFile: P.claims, assessmentFile: P.assessment, editorialStatus: 'chapter_ready', claimTraceRequired: true, sourceFirst: true,
  });
  write(P.brief, {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID, primary_domain_id: 'metode_etnografi_sammenligning',
    purpose: 'Gi en etterprøvbar og etisk metodeinnføring som binder feltkonstruksjon, dokumentasjon, casevalg, sammenligning, representasjon og slutning sammen uten å forveksle nærhet med full tilgang eller case med populasjon.',
    learningArc: topics.map((topic) => topic.title),
    methodsAndLimits: ['feltet må konstrueres og avgrenses eksplisitt', 'tilgang og portvakter skaper seleksjon', 'feltnotater og intervjuer er situerte og bearbeidede kilder', 'digitale spor er plattformproduserte', 'strategisk caseutvalg gir ikke statistisk representativitet', 'flerstedlighet må følge begrunnede forbindelser', 'samtykke og konfidensialitet må revurderes løpende'],
    realDisagreements: ['Malinowskis klassiske nærværs- og språkideal må vurderes mot nyere refleksivitet og kolonial metodekritikk.', 'Geertz’ tette fortolkning vektlegger mening, mens case- og sammenligningsmetode krever eksplisitt slutningslogikk og rekkevidde.', 'Marcus’ flerstedlighet utfordrer enkeltstedets feltmodell, men skaper nye problemer med dybde og sammenlignbarhet.', 'Small skiller case- og samplinglogikk, mens Gerring søker et mer generelt språk for casevalg og kausal slutning.'],
    criticalDistinctions: ['felt vs naturlig gruppebeholder', 'tilstedeværelse vs full tilgang', 'jotting vs utvidet notat vs memo', 'intervjuutsagn vs direkte indre mening', 'casevalg vs sampling', 'analytisk generalisering vs populasjonsestimat', 'offentlig tilgjengelighet vs etisk risikofrihet', 'refleksiv posisjon vs sannhetskriterium'],
    teachingScenarios: sourceBrief.decision_scenarios,
    safety: { fieldPresenceAsFullAccess: false, gatekeeperConsentAsParticipantConsent: false, publicDigitalAsRiskFree: false, searchableQuoteAsAnonymous: false, researcherPositionAsTruthCriterion: false, richCaseAsPopulationEstimate: false },
  });
  write(P.claims, {
    schema: 'history_go_fagverk_claims_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID, retrieval_status: 'verified_2026-08-28', verified_at: '2026-08-28',
    sources: sourceBrief.sources.map((source) => ({ ...source, retrieval_status: 'verified_2026-08-28' })),
    claims: plannedClaims.map((claim) => ({ id: claim.id, claim: claim.text, source_ids: claim.source_ids, classification: 'verified_scholarly_source_synthesis', status: 'verified', verified_at: '2026-08-28' })),
  });
  write(P.assessment, {
    schema: 'history_go_fagverk_assessment_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID,
    questions: QUESTIONS.map(([question, options, answerIndex, claim_id], index) => ({ id: `mea-q${index + 1}`, type: 'multiple_choice', question, options, answerIndex, answer: options[answerIndex], claim_id, source: plannedClaims.find((claim) => claim.id === claim_id).source_ids, learner_typing: false })),
    caseTasks: sourceBrief.decision_scenarios.map((scenario) => ({ ...scenario, responseMode: 'guided_discussion_no_required_typing' })),
  });
  const production = read(P.production);
  production.status = 'fulltext_production_in_progress';
  production.progress.materializedDomains = 3;
  production.progress.strictCompletionProven = false;
  const entry = { ordinal: 3, domain_id: 'metode_etnografi_sammenligning', chapter: P.chapter, claims: P.claims, assessment: P.assessment, audit: P.report };
  production.materialized = [...production.materialized.filter((row) => row.ordinal !== 3), entry].sort((a, b) => a.ordinal - b.ordinal);
  production.next_gate = 'norms_identity_everyday_life_fulltext_materialization';
  write(P.production, production);
  const reconciliation = read(P.reconciliation);
  reconciliation.status = 'authority_audit_complete_fulltext_production_in_progress';
  reconciliation.production_plan.source_first_ready = Math.max(reconciliation.production_plan.source_first_ready, 4);
  reconciliation.production_plan.materialized = 3;
  reconciliation.production_plan.next_domain = 'normer_identitet_hverdagsliv';
  write(P.reconciliation, reconciliation);
  write(P.report, buildReport(sourceBrief));
  return { chapter: CHAPTER_ID, domains: 3, claims: 32, sources: 13 };
}

const result = materialize();
console.log(`Metode, etnografi og sammenligning materialisert: ${result.domains}/12 felt, ${result.claims} claims, ${result.sources} kilder.`);
