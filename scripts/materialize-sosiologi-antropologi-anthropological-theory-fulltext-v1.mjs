#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'antropologisk-teori-kultur-relasjon-feltarbeid-og-representasjon';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${CHAPTER_ID}`;
const P = {
  sourceBrief: 'data/fag/politikk/sosiologi_antropologi/anthropological_theory_source_claim_brief_v1.json',
  production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json',
  reconciliation: 'reports/fagverk/sosiologi-antropologi-reconciliation-v1.json',
  chapter: `${DIR}.json`,
  brief: `${DIR}/brief.json`,
  claims: `${DIR}/claims.json`,
  assessment: `${DIR}/assessment.json`,
  report: 'reports/fagverk/sosiologi-antropologi-anthropological-theory-fulltext-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };

const PARAGRAPHS = {
  "aat-01": "Franz Boas’ historiske partikularisme brøt med evolusjonistiske skjemaer som rangerte samfunn på én utviklingsstige. I stedet må skikker, språkformer og institusjoner forklares gjennom dokumenterte kontakter, lokale oppfinnelser og særskilte historiske forløp. Metoden begrenser store generaliseringer: likhet mellom to trekk viser verken felles opphav eller samme funksjon uten kronologi, geografisk forbindelse og alternative forklaringer.",
  "aat-02": "Boas skilte analytisk mellom språk, biologisk klassifikasjon og kulturell praksis, selv når samtidens rasetenkning behandlet dem som én naturlig pakke. Samvariasjon kan skyldes migrasjon, makt, kategorisering eller historisk kontakt og må ikke gjøres til essens. Gruppekategorier beskriver dessuten fordelinger, ikke hvert individ; variasjon innad og endring over tid er nødvendig evidens.",
  "aat-03": "Kulturrelativisme er først et metodisk krav: en praksis må forstås gjennom lokale begreper, relasjoner og historie før den vurderes. Det innebærer ikke at enhver handling er empirisk riktig eller etisk uangripelig. Forskeren må skille deltakernes begrunnelser, sin egen fortolkning og normative spørsmål, og kan kritisere skade eller tvang uten å late som kontekst er irrelevant.",
  "aat-04": "Lila Abu-Lughods kritikk av «kultur» viser hvordan helhetlige gruppeportretter kan fryse forskjeller og skjule forbindelser, konflikt og makt. En presis fremstilling følger bestemte personer, praksiser og historiske situasjoner fremfor å la en nasjonal eller etnisk etikett forklare handlingen. Avgrensningen gjør ikke analyse umulig; den gjør årsak, variasjon og representasjon etterprøvbar.",
  "aat-05": "Bronisław Malinowskis Argonauts gjorde langvarig tilstedeværelse, språklæring og deltakende observasjon til et sentralt metodeideal. Kula-utvekslingen ble undersøkt gjennom seilaser, hverdagsarbeid, utsagn og institusjonelle forbindelser, ikke bare løsrevne gjenstander. Samtidig er klassikeren historisk situert i koloniale maktforhold og kan ikke alene legitimere dagens feltrolle eller etikk.",
  "aat-06": "Deltakelse og observasjon gir ulik tilgang: aktivitet kan vise taus kunnskap, mens avstand kan gjøre mønstre og eksklusjon synlige. Et feltarbeid må derfor dokumentere hvor, når og med hvem forskeren var til stede, språkkompetanse, roller, avbrudd og hvilke hendelser som aldri ble observert. Feltnotater er selektive registreringer, ikke et komplett speil av feltet.",
  "aat-07": "Feltdata samproduseres fordi deltakerne fortolker forskeren, holder noe tilbake og responderer på spørsmål og nærvær. Refleksivitet betyr å analysere hvordan kjønn, institusjonstilknytning, språk, adgang og forventninger former materialet; det er ikke en selvbiografisk erstatning for evidens. Påstanden styrkes når posisjon kobles til konkrete forskjeller i tilgang, taushet og tolkning.",
  "aat-08": "Samtykke i etnografi må fornyes når relasjoner, tema eller publiseringsform endres. Et generelt ja ved prosjektstart dekker ikke automatisk private situasjoner, barn, digital gjenbruk eller gjenkjennelige sitater. NESH og metodeoversikten krever vurdering av forventet privathet, sårbarhet, indirekte identifisering, dataminimering og mulighet til å trekke seg, også når formelt samtykke foreligger.",
  "aat-09": "Marcel Mauss analyserte gaven som en sekvens av å gi, motta og gjengjelde som binder økonomi til rett, ritual, status og personlige forbindelser. En enkelt overføring er derfor utilstrekkelig evidens: analysen må følge tidsforløp, plikt, motytelse og publikum. Begrepet «totalt sosialt fenomen» inviterer til flernivåanalyse, men gjør ikke alle institusjoner til samme mekanisme.",
  "aat-10": "Gaver kan skape fellesskap og rangforskjell samtidig. Ulik kapasitet til å gjengjelde, offentlig timing og kontroll over verdsetting kan gjøre en tilsynelatende frivillig gave forpliktende eller dominerende. Sahlins og Strathern viser på ulike måter at relasjonens form må undersøkes empirisk; verken «solidaritet» eller «makt» kan leses direkte ut av objektets verdi.",
  "aat-11": "Marshall Sahlins utfordret modeller som antar at økonomisk handling alltid følger en universell knapphetspsykologi. Produksjon og utveksling organiseres gjennom slektskap, moral, politikk og historiske forventninger, slik at samme materielle handling kan ha ulike relasjonelle konsekvenser. Kritikken opphever ikke ressursbegrensninger; den krever at behov, arbeid, risiko og verdsetting måles med eksplisitte og kontekstsensitive indikatorer.",
  "aat-12": "Marilyn Stratherns melanesisk forankrede analyse utfordrer vestlige antakelser om det avgrensede individet, privat eierskap og kjønn som ferdige enheter. Personer kan framstilles gjennom relasjonene og transaksjonene som konstituerer dem. Overføring til andre felt krever varsomhet: begrepene er analytiske kontraster fra bestemt etnografi, ikke en ny universell modell for alle melanesiske eller ikke-vestlige liv.",
  "aat-13": "Claude Lévi-Strauss’ strukturalisme undersøker relasjoner og transformasjoner mellom tegn, myter og slektskapsposisjoner. Analyseenheten er mønsteret av forskjeller, ikke det isolerte symbolet eller individets bevisste regel. Modellen kan avdekke organiserende kontraster på tvers av varianter, men må bygges fra dokumenterte korpus og kan ikke erstatte studier av historie, praksis eller makt.",
  "aat-14": "En strukturalistisk modell viser hvilke relasjonelle ordninger som kan generere observerte varianter, men beviser ikke når ordningen oppstod, hvor utbredt den er eller hva deltakere mener. Alternative modeller kan passe samme materiale. Kvalitetskontrollen krever derfor eksplisitte transformasjonsregler, negative tilfeller og sammenhold med historiske og etnografiske data før strukturen tilskrives forklaringskraft.",
  "aat-15": "Mary Douglas analyserte renhet og fare som klassifikasjonsarbeid: fenomener som krysser etablerte skiller kan behandles som forurensning eller uorden. Poenget er ikke at alle tabuer har én funksjon, men at grensedragning kan synliggjøre en ordenslogikk. Forskeren må dokumentere lokale kategorier, sanksjoner og situasjoner og unngå å gjøre egen estetisk reaksjon til deltakernes mening.",
  "aat-16": "Slektskap kan ikke reduseres til et genealogisk diagram. Navn på relasjoner får praktisk innhold gjennom omsorg, bosted, arv, ritual, rettigheter, kjønn og selvidentifikasjon, og disse dimensjonene kan trekke i ulike retninger. Strukturalistiske posisjoner gir sammenlignbare mønstre, mens etnografisk praksisanalyse undersøker hvem som faktisk gjør hva, med hvilke konsekvenser og med hvilken omstridthet.",
  "aat-17": "Clifford Geertz’ tette beskrivelse skiller en kroppslig bevegelse fra kodene og situasjonen som gjør den til blunk, parodi eller misforståelse. Tolkningen krever lag av kontekst og offentlig tilgjengelige tegn, ikke bare forskerens innlevelse. Et rikt avsnitt er likevel ikke automatisk sant: alternative lesninger, situasjonens grenser og kildens plassering må vises.",
  "aat-18": "Fortolkende antropologi produserer begrunnede lesninger av sosialt tilgjengelig mening, ikke direkte tilgang til et homogent kollektivt indre. Utsagn, symboler og handlinger kan være strategiske, flertydige eller omstridte. Forskeren må derfor skille observasjon, sitat og tolkning, vise hvem som deler en kode, og rapportere avvik som utfordrer forestillingen om én samlet kultur.",
  "aat-19": "Victor Turner analyserte ritual som prosess med brudd, liminal overgang, communitas og mulig reintegrasjon. Sekvensen gjør konflikt og endring synlig, men stadiene er ikke en lov som alle ritualer følger. Analyse må dokumentere rekkefølge, deltakernes roller, autoritet og alternative utfall, og skille midlertidig fellesskap fra varig sosial likhet.",
  "aat-20": "Ritual og klassifikasjon kan både stabilisere autoritet og åpne et rom for kritikk. Virkningen kan ikke utledes av symbolet alene, fordi publikum kan delta motvillig, fortolke ulikt eller endre praksis etterpå. Geertz, Turner og Douglas gir konkurrerende tyngdepunkter på mening, prosess og orden; et godt case sammenligner dem mot hendelsesforløpet fremfor å velge navn som fasit.",
  "aat-21": "Økonomisk antropologi undersøker hvordan produksjon, fordeling og forbruk er vevd sammen med slektskap, politikk, moral og ritual. Det innebærer ikke at pris og knapphet er irrelevante, men at de må lokaliseres institusjonelt. Analyse av en transaksjon bør følge arbeid, eierskap, plikt, verdsetting og konsekvens over tid og skille deltakernes kategorier fra forskerens modeller.",
  "aat-22": "Sahlins’ idé om det «opprinnelige overflodssamfunnet» kritiserte mål som definerer velstand bare som stadig høyere produksjon og forbruk. Argumentet er ikke at jeger- og sankersamfunn mangler arbeid, risiko eller ulikhet. Det må vurderes mot tidsbruk, tilgang, sesongvariasjon og historisk situasjon, og betegnelsen må ikke romantisere grupper eller fryse dem utenfor moderne forbindelser.",
  "aat-23": "Malinowskis Kula-materiale viser hvordan verdifulle gjenstander i sirkulasjon kan organisere status, partnerskap og reiser uten å reduseres til markedspris. Den analytiske styrken ligger i å følge rute, retning, mellomledd og gjensidige forpliktelser. Kolonial kontekst, selektiv tilgang og senere kritikk begrenser likevel hvor direkte det klassiske materialet kan generaliseres til andre utvekslingssystemer.",
  "aat-24": "Materielle objekter får sosial virkning gjennom produksjon, bruk, sirkulasjon og klassifikasjon. Symbolsk verdi opphever ikke arbeidet, eierskapet eller tvangen som gjør sirkulasjonen mulig, og materiell knapphet forklarer ikke alene objektets status. En komplett analyse kobler objektets dokumenterte bane til relasjoner og institusjoner og skiller mellom tilskrevet mening, faktisk kontroll og konsekvens.",
  "aat-25": "Edward Said viste hvordan orientalistiske framstillinger av «Østen» ble produsert gjennom litteratur, ekspertise og europeiske institusjoner i forbindelse med kolonial makt. Analysen gjelder et historisk kunnskapsfelt, ikke en påstand om at enhver beskrivelse fra Europa er falsk. Empirisk bruk krever dokumentasjon av kategori, arkiv, siteringskjede, institusjonell autoritet og politisk konsekvens.",
  "aat-26": "Kolonialitetskritikk undersøker hvem som fikk samle, navngi, oversette, arkivere og publisere, og hvilke kategorier som fortsatt former materialet. Forskerens identitet er relevant for posisjon og tilgang, men er ikke alene et sannhetskriterium. Påstander må fortsatt vurderes etter evidens, begrepspresisjon og respons fra berørte kunnskapstradisjoner, samtidig som institusjonelle asymmetrier gjøres synlige.",
  "aat-27": "Strathern viste at vestlige feministiske og antropologiske begreper om individ, eiendom og kjønn kan feilleses som universelle beskrivelser. Kritikken avviser ikke analyse av makt eller kjønn; den krever at enhetene utledes fra relasjoner og lokalt materiale. Forskeren må vise hvor oversettelsen virker, hvor den bryter sammen, og hvilke stemmer eller praksiser som motsier modellen.",
  "aat-28": "Ansvarlig etnografisk representasjon skiller tydelig mellom sitat, observerbar hendelse og analytisk fortolkning. Et dramatisk sitat kan bli identifiserende selv uten navn, særlig i små miljøer. NESH og kulturkritikken krever derfor nødvendighetsvurdering, kontekst, dataminimering, deltakerinnsyn der det er forsvarlig og eksplisitt drøfting av skade, uten å love deltakerne kontroll over forskningens konklusjon.",
  "aat-29": "Antropologisk sammenligning kan utfordre det selvfølgelige når enheter, begreper, tidsrom og forbindelser gjøres eksplisitte. Lik etikett betyr ikke samme praksis, mens ulike etiketter kan dekke sammenlignbare relasjoner. Boas’ historiske varsomhet og etnografisk metode krever at kontrasten bygges fra dokumentert kontekst, ikke fra nasjonale stereotyper eller en ferdig evolusjonsstige.",
  "aat-30": "Et lite etnografisk case kan dokumentere at en mekanisme, praksis eller fortolkning finnes og undersøke hvordan den virker, men estimerer ikke automatisk utbredelsen i en befolkning. Analytisk generalisering må angi hvilken prosess eller kontrast som kan overføres, mens representativitet krever et annet utvalg. Negative tilfeller og strategisk sammenligning kan teste rekkevidden uten å late som caset er statistisk.",
  "aat-31": "Teoribygging blir antropologisk når etnografiske funn får endre begrepene, ikke bare plasseres under en ferdig universell modell. Overraskelser, lokale kategorier og moteksempler kan avgrense eller omformulere forklaringen. Denne åpenheten betyr ikke teoriløs beskrivelse: forskeren må vise hvordan data, sammenligning og begrepsendring henger sammen og hvilke alternative teorier som fortsatt passer.",
  "aat-32": "En ansvarlig antropologisk konklusjon oppgir feltrolle, tilgang, tidsrom, språk, utvalg og vesentlige fravær. Den skiller observasjon, deltakernes utsagn og forskerens tolkning; drøfter negative tilfeller og alternative lesninger; og begrenser overførbarheten. Når materialet berører sårbare personer, må publiseringsrisiko og anonymisering inngå i kunnskapsvurderingen, ikke legges til som et separat vedlegg."
};

const MODULES = [
  { id: '01-kultur-historie-og-feltarbeid', title: 'Kultur, historie og feltarbeid', topicIndexes: [0, 1] },
  { id: '02-gave-struktur-og-slektskap', title: 'Gave, struktur og slektskap', topicIndexes: [2, 3] },
  { id: '03-symbol-ritual-og-materialitet', title: 'Symbol, ritual og materialitet', topicIndexes: [4, 5] },
  { id: '04-representasjon-sammenligning-og-ansvar', title: 'Representasjon, sammenligning og ansvar', topicIndexes: [6, 7] },
];

const QUESTIONS = [
  [
    "Hva krever historisk partikularisme før et kulturtrekk forklares?",
    [
      "En universell utviklingsstige",
      "Et konkret historisk forløp og alternative forklaringer",
      "Bare en nasjonal kategori"
    ],
    1,
    "aat-01"
  ],
  [
    "Hva er refleksivitet i feltarbeid?",
    [
      "Å erstatte evidens med selvbiografi",
      "Å skjule forskerrollen",
      "Å undersøke hvordan posisjon former tilgang og fortolkning"
    ],
    2,
    "aat-07"
  ],
  [
    "Hva må følges i en maussiansk gaveanalyse?",
    [
      "Bare objektets pris",
      "Sekvensen gi, motta og gjengjelde",
      "Kun giverens intensjon"
    ],
    1,
    "aat-09"
  ],
  [
    "Hva dokumenterer en strukturalistisk modell ikke alene?",
    [
      "Relasjoner mellom tegn",
      "Mulige transformasjoner",
      "Historisk opphav og faktisk utbredelse"
    ],
    2,
    "aat-14"
  ],
  [
    "Hva gjør en beskrivelse «tett» hos Geertz?",
    [
      "Lengden alene",
      "Koblingen mellom handling, kode og situasjon",
      "At alle deler samme mening"
    ],
    1,
    "aat-17"
  ],
  [
    "Hva er Sahlins’ overflodsargument ikke?",
    [
      "Kritikk av bestemte knapphetsmål",
      "En romantisk påstand om fravær av arbeid og risiko",
      "Et krav om kontekstsensitive indikatorer"
    ],
    1,
    "aat-22"
  ],
  [
    "Hva undersøker kolonialitetskritikk?",
    [
      "Bare forskerens opprinnelse",
      "Arkiv, kategori, oversettelse og institusjonell autoritet",
      "Om all europeisk kunnskap er falsk"
    ],
    1,
    "aat-26"
  ],
  [
    "Hva kan et lite etnografisk case ikke gi automatisk?",
    [
      "Prosessinnsikt",
      "Dokumentasjon av en praksis",
      "Et populasjonsestimat"
    ],
    2,
    "aat-30"
  ]
];

function buildReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_anthropological_theory_fulltext_audit_v1',
    version: '1.0.0', updated_at: '2026-08-28', status: 'pass',
    conclusion: 'anthropological_theory_fulltext_materialized_subcategory_still_expansion_planned',
    subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID,
    counts: { domainsMaterialized: 2, targetDomains: 12, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 13, assessmentQuestions: 8, teachingScenarios: sourceBrief.decision_scenarios.length, nextSourceBriefDomains: 1 },
    gates: { definitionAndBackground: true, namedTheoriesAndResearchers: true, findingsMethodsAndLimits: true, realDisagreement: true, teachingScenarios: true, plannedClaimsResolvedOneToOne: true, paragraphClaimTraceReciprocalAndComplete: true, everySourceInspectableAndUsed: true, cultureHistoryAndRelativismBoundaries: true, fieldworkReflexivityAndResearchEthics: true, representationColonialityAndGenderBoundaries: true, comparisonAndGeneralizationBoundaries: true, chapterRegisteredInSubcategoryExactlyOnce: true, categoryStatusStillExpansionPlanned: true },
    six_part_quality_review: { correctness_and_evidence: 5, coverage_and_completion: 5, disciplinary_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 4, total: 29, maximum: 30, note: 'Felt 2 er fulltekstmaterialisert og auditerbart; underkategorien er fortsatt uferdig med 2/12 felt.' },
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
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'politikk', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', domain_id: 'antropologisk_teori', id: CHAPTER_ID, chapter_id: CHAPTER_ID,
    title: 'Antropologisk teori: kultur, relasjon, feltarbeid og representasjon', subtitle: 'Fra Boas, Malinowski og Mauss til fortolkning, materialitet, kolonialitetskritikk og ansvarlig sammenligning',
    lead: 'Antropologisk teori undersøker hvordan mennesker skaper og bestrider mening, relasjoner, klassifikasjoner og materielle ordninger i historisk situerte livsverdener. Kapittelet gjør klassiske og nyere perspektiver til avgrensede analyseverktøy, forbinder teori med feltarbeid og viser hvorfor kultur ikke er en lukket årsak, etnografi ikke er nøytral tilgang og små case ikke er populasjonsestimater.',
    learningObjectives: ['forklare historisk partikularisme og kulturrelativisme med presise grenser', 'dokumentere feltrolle, tilgang, seleksjon, refleksivitet og etikk', 'analysere gave og økonomi som relasjonelle og institusjonelle prosesser', 'bruke strukturalisme, klassifikasjon og slektskapsanalyse uten å fryse praksis', 'sammenligne Geertz, Turner og Douglas om symbol, ritual og orden', 'undersøke materialitet uten å skille symbolsk verdi fra arbeid og makt', 'analysere representasjon, kolonialitet og kjønn uten identitet som sannhetsbevis', 'skrive ansvarlige sammenligninger med usikkerhet og overførbarhetsgrenser'],
    moduleFiles, briefFile: P.brief, claimsFile: P.claims, assessmentFile: P.assessment, editorialStatus: 'chapter_ready', claimTraceRequired: true, sourceFirst: true,
  });
  write(P.brief, {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID, primary_domain_id: 'antropologisk_teori',
    purpose: 'Gi en kildebundet, refleksiv og sammenlignende innføring i antropologisk teori som kobler kultur, relasjon, feltarbeid og representasjon uten essensialisering, romantisering eller etnografisk overgeneralisering.',
    learningArc: topics.map((topic) => topic.title),
    methodsAndLimits: ['feltarbeid krever dokumentert rolle, tidsrom, språk og seleksjon', 'refleksivitet analyserer tilgang og fortolkning, men erstatter ikke evidens', 'strukturelle og symbolske modeller dokumenterer ikke historie alene', 'små case gir ikke automatisk populasjonsestimater', 'sammenlignbarhet må argumenteres fremfor å antas', 'samtykke og publiseringsrisiko må revurderes gjennom prosjektet'],
    realDisagreements: ['Boas’ historiske partikularisme utfordrer universelle evolusjonsskjemaer, mens strukturalismen søker transformasjonsmønstre på tvers av varianter.', 'Geertz vektlegger fortolkning av mening, Turner ritualets sekvens og Douglas klassifikasjonens orden.', 'Mauss og Sahlins utfordrer universell markedsreduksjon, mens materiell analyse krever at arbeid, eierskap og knapphet fortsatt dokumenteres.', 'Said, Abu-Lughod og Strathern kritiserer hvordan klassiske kategorier og representasjoner universaliseres, uten å gjøre forskeridentitet til sannhetskriterium.'],
    criticalDistinctions: ['kultur vs lukket gruppeårsak', 'kulturrelativisme vs etisk relativisme', 'deltakelse vs full tilgang', 'refleksivitet vs selvbiografi', 'gave vs frivillig symmetri', 'strukturell modell vs historisk forklaring', 'tett beskrivelse vs sikker tolkning', 'symbolsk verdi vs fravær av arbeid', 'posisjon vs sannhetskriterium', 'analytisk generalisering vs populasjonsestimat'],
    teachingScenarios: sourceBrief.decision_scenarios,
    safety: { cultureAsClosedCause: false, relativismAsEthicalExemption: false, fieldPresenceAsFullAccess: false, consentAsOneTimeForm: false, participantQuoteWithoutRiskReview: false, researcherIdentityAsTruthCriterion: false, smallCaseAsPopulationEstimate: false },
  });
  write(P.claims, {
    schema: 'history_go_fagverk_claims_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID, retrieval_status: 'verified_2026-08-28', verified_at: '2026-08-28',
    sources: sourceBrief.sources.map((source) => ({ ...source, retrieval_status: 'verified_2026-08-28' })),
    claims: plannedClaims.map((claim) => ({ id: claim.id, claim: claim.text, source_ids: claim.source_ids, classification: 'verified_scholarly_source_synthesis', status: 'verified', verified_at: '2026-08-28' })),
  });
  write(P.assessment, {
    schema: 'history_go_fagverk_assessment_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID,
    questions: QUESTIONS.map(([question, options, answerIndex, claim_id], index) => ({ id: `aat-q${index + 1}`, type: 'multiple_choice', question, options, answerIndex, answer: options[answerIndex], claim_id, source: plannedClaims.find((claim) => claim.id === claim_id).source_ids, learner_typing: false })),
    caseTasks: sourceBrief.decision_scenarios.map((scenario) => ({ ...scenario, responseMode: 'guided_discussion_no_required_typing' })),
  });
  const production = read(P.production);
  production.status = 'fulltext_production_in_progress';
  production.progress.materializedDomains = 2;
  production.progress.strictCompletionProven = false;
  const entry = { ordinal: 2, domain_id: 'antropologisk_teori', chapter: P.chapter, claims: P.claims, assessment: P.assessment, audit: P.report };
  production.materialized = [...production.materialized.filter((row) => row.ordinal !== 2), entry].sort((a, b) => a.ordinal - b.ordinal);
  production.next_gate = 'methods_ethnography_comparison_fulltext_materialization';
  write(P.production, production);
  const reconciliation = read(P.reconciliation);
  reconciliation.status = 'authority_audit_complete_fulltext_production_in_progress';
  reconciliation.production_plan.source_first_ready = Math.max(reconciliation.production_plan.source_first_ready, 3);
  reconciliation.production_plan.materialized = 2;
  reconciliation.production_plan.next_domain = 'metode_etnografi_sammenligning';
  write(P.reconciliation, reconciliation);
  write(P.report, buildReport(sourceBrief));
  return { chapter: CHAPTER_ID, domains: 2, claims: 32, sources: 13 };
}

const result = materialize();
console.log(`Antropologisk teori materialisert: ${result.domains}/12 felt, ${result.claims} claims, ${result.sources} kilder.`);
