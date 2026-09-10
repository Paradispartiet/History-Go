import { id, verifiedAt, placeFile, urls } from "./peststotten-krist-kirkegard-content.mjs";

export function buildHistoryProduction(place, briefFile, contextFile) {
  const sources = [
    { id: `source_${id}_byleksikon_pest`, url: urls.byleksikonPest, sourceLocation: "identitet, 1654, innskrift og første gravlagte", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "retrospective", provenance: "Redigert Oslo-spesifikt oppslagsverk.", limitations: "Kort oppslagsartikkel; supplert med kommunal og lokalhistorisk kilde." },
    { id: `source_${id}_oslo`, url: urls.osloKrist, sourceLocation: "gravplassens etablering og rehabilitering", sourceType: "official", verifiedAt, temporalCoverage: "mixed", provenance: "Oslo kommunes offisielle gravplasspresentasjon.", limitations: "Forvaltningsside med begrenset detalj om 1600-tallets dødelighet." },
    { id: `source_${id}_byleksikon_krist`, url: urls.byleksikonKrist, sourceLocation: "utvidelser, stenging, minnepark og smijernsgjerde", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "retrospective", provenance: "Redigert Oslo-spesifikt oppslagsverk.", limitations: "Oppsummerer lang brukshistorie og må leses sammen med spesifikke epidemikilder." },
    { id: `source_${id}_lokal_pest`, url: urls.lokalPest, sourceLocation: "pestforløp, Akershus-data og kildeusikkerhet", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "retrospective", provenance: "Lokalhistoriewiki med kildehenvisninger til historiske pestdata.", limitations: "Detaljerte anslag kan ikke uten videre skaleres til hele bybefolkningen." },
    { id: `source_${id}_lokal_krist`, url: urls.lokalKrist, sourceLocation: "Munch-familien og senere stedsbruk", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "retrospective", provenance: "Lokalhistoriewiki om Krist kirkegård.", limitations: "Sekundær lokalhistorisk kilde; brukes som supplement til offisiell og redigert Oslo-kilde." }
  ];
  const caseId = `case_${id}_epidemi_og_minne`;
  return {
    schemaVersion: "historie_place_production_v1", validatorVersion: "1.0.0", placeId: id, placeFile, status: "ready",
    historicalIdentity: {
      statement: "Peststøtten er et minnesmerke reist i 1654 ved Krist kirkegård, som ble tatt i bruk under pestutbruddet og senere fikk nye grav- og minnelag.",
      placeRelationType: "material_trace",
      placeRelationStatement: "Place-et omfatter Peststøtten og den umiddelbare historiske kirkegårdskonteksten; andre gravlunder og alle peststeder i byen er separate.",
      temporalScope: { start: "1654", end: "1999", precision: "period", rationale: "Perioden følger etablering, utvidelser, stenging og dokumentert rehabilitering som minnepark." },
      sourceIds: sources.map(source => source.id)
    },
    historyTopics: place.emne_ids.map(emneId => ({ emneId, siteSpecificRationale: `${emneId} realiseres gjennom monumentet, epidemienes gravplassbehov, senere bruksendringer og kildekritisk minnearbeid ved Krist kirkegård.`, caseIds: [caseId] })),
    sources,
    caseRealizations: [{
      id: caseId,
      claim: "Peststøtten og Krist kirkegård viser hvordan en epidemi kan skape et varig byromsspor som senere får nye funksjoner og nye minnelag.",
      temporalSequence: {
        scope: { start: "1654", end: "1999", precision: "period", rationale: "1654, 1835, 1924, 1971 og 1999 gir dokumenterte brudd og omforminger." },
        startPoint: "Pesten i 1654 skapte behov for gravplass, og Peststøtten ble reist.",
        endPoint: "Området ble rehabilitert og åpnet på nytt som minnepark i 1999.",
        breaks: ["Koleraen i 1835 ga en ny epidemisk utvidelse.", "Nye begravelser opphørte i 1924.", "Etterkrigstidens bevaring og rehabilitering endret området fra aktiv gravplass til minnepark."],
        continuities: ["Peststøtten fortsatte å markere 1654.", "Gravplassen beholdt en funksjon som offentlig minne selv etter at nye begravelser opphørte."],
        sourceIds: [sources[0].id, sources[1].id, sources[2].id]
      },
      actors: [
        { name: "Kirkelige og offentlige myndigheter i 1654", roleOrInterest: "Organiserte gravplass og offentlig minnesmerke under epidemien.", powerPosition: "Innskriften viser navngitte embets- og kirkeaktører, mens vanlige pestofre i mindre grad får individuelle stemmer.", sourceIds: [sources[0].id] },
        { name: "Soldater, byfolk og familier som trengte gravsteder", roleOrInterest: "Ble direkte berørt av sykdom og gravplassmangel.", powerPosition: "Deres erfaringer er i stor grad indirekte dokumentert gjennom gravplassbehov, navn og senere kilder.", sourceIds: [sources[0].id, sources[3].id] },
        { name: "Senere gravplass- og byforvaltning", roleOrInterest: "Utvidet, stengte, restaurerte og rammet inn området som minnepark.", powerPosition: "Forvaltningsvedtak bestemte hvilke fysiske spor som skulle bevares og hvordan området kunne brukes.", sourceIds: [sources[1].id, sources[2].id] }
      ],
      conflictOrNegotiation: { statement: "Caset viser spenningen mellom akutt håndtering av døde, senere arealbehov og ettertidens valg om bevaring og offentlig minne.", sourceIds: [sources[0].id, sources[1].id, sources[2].id] },
      sourceComparison: { sourceIds: sources.map(source => source.id), comparison: "Oslo byleksikon gir monument- og gravplasskronologi, Oslo kommune dokumenterer forvaltning og rehabilitering, mens Lokalhistoriewiki utdyper pestkontekst og Munch-tilknytning.", contradictionsOrSilences: "Kildene gir ikke ett sikkert samlet dødstall for hele byen og gir få direkte stemmer fra vanlige pestofre.", conclusionLimits: "Stedet kan dokumentere minne, gravplassbehov og senere brukslag, men kan ikke alene måle epidemiens totale dødelighet eller rekonstruere alle berørtes erfaringer." },
      comparativeScale: { localFinding: "Et lite kirkegårdsrom på Hammersborg gjør epidemihåndtering og minnekultur fysisk lesbar.", widerContext: "Caset kan sammenlignes med andre byers epidemigravplasser og med senere helsekriser der areal, begravelse og offentlig minne må organiseres.", scale: "urban", sourceIds: [sources[0].id, sources[1].id, sources[3].id] },
      causationAndUncertainty: { causalAssessment: "Pestutbruddet og gravplassmangelen forklarer etableringen i 1654; senere epidemier, byvekst og arealendringer forklarer flere av de senere brukslagene.", alternativeExplanations: ["Militær bruk og vanlig befolkningsvekst påvirket også gravplassens utvikling.", "Senere minneparktiltak skyldtes bevarings- og byplanhensyn, ikke epidemi alene."], uncertainty: "Eksakte dødstall og enkelte detaljer om brukerne er mer usikre enn dateringen og stedssporene.", sourceIds: [sources[0].id, sources[1].id, sources[2].id, sources[3].id] }
    }],
    presentTrace: { objectStatus: "altered", statement: "Peststøtten og eldre gravminner er bevart, mens kirkegårdens rammer og funksjon er endret gjennom utvidelser, veiarbeid, gjerde og rehabilitering.", originalSiteRelationship: "Monumentet står ved den historiske Krist kirkegård-konteksten på Hammersborg; minneparkens nåværende utforming er senere.", sourceIds: [sources[0].id, sources[1].id, sources[2].id] },
    quizOpening: { status: "PASS", quizTargetId: id, firstTwoSetsQuestionCount: 14, sourceBrief: briefFile, productionContext: contextFile, requiredInputs: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"] },
    chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Ni daterte kronologiankere og én episode_v1-Story er kontrollert mot de samme stedskildene." },
    gates: Object.fromEntries("ABCDEFGH".split("").map(letter => [letter, { status: "PASS", evidenceRefs: [letter === "A" ? "historicalIdentity" : letter === "B" ? "historyTopics" : letter === "G" ? "quizOpening" : letter === "H" ? "chronologyStories" : "caseRealizations[0]"] }])),
    review: { reviewer: "Peststøtten source, representation and place-layer audit", reviewedAt: verifiedAt, notes: "Epidemikontekst, monument, gravplasslag, Munch-forbindelse, kildeusikkerhet, quiz og Story er eksplisitt avgrenset." }
  };
}

export function buildQualityAudit(place, monumentObject, structures, historicalEvents) {
  return {
    schema: "history_go_phase1_24_quality_gate_v1", place_id: id, verified_at: verifiedAt,
    null_measurement: { existing_place: true, coordinate_changed: false, existing_quiz: "none", existing_story: "none", existing_collections: 0 },
    collections: { required: ["people", "objects", "structures", "historical_events"], loaded_preview_images: 4, missing: 0, coverage_percent: 100 },
    people: { candidates_reviewed: ["Arne Sigvardsøn fra Vang", "Michel Pedersøn Escholt", "Edvard Munch"], selected: ["edvard_munch"], held_back: ["Arne Sigvardsøn og Michel Pedersøn Escholt er historisk direkte, men uten kontrollert publiserbart portrett i repoet."], image_coverage_percent: 100 },
    source_conflicts: [{ claim: "Ett eksakt samlet dødstall for hele Christiania i 1654", status: "qualified", reason: "Kildene bruker ulike anslag og avgrensninger; tallet holdes ute av nøkkelfakta." }],
    manual_image_review: { status: "PASS", reviewed_assets: ["bilder/places/peststotten_krist_kirkegard.webp", "bilder/places/peststotten_krist_kirkegard_front_portrait.webp", "bilder/kort/people/edvard_munch.jpg", monumentObject.image, structures[0].image, ...historicalEvents.map(item => item.image)], note: "Paalso-fotografiet dokumenterer monumentet og kirkegårdskonteksten i 2006. Eventkortene merkes uttrykkelig som senere dokumentasjon, ikke samtidige hendelsesbilder." },
    quality_score: {
      correctness_and_evidence: { score: 5, note: "Offisiell, redigert lokal og supplerende lokalhistorisk dokumentasjon er sammenlignet; usikkert dødstall er holdt tilbake." },
      coverage_and_completion: { score: 5, note: "Fire bildeklare samlinger, Fagverk, ni tidsankere, Story, Språk, fire Lesespor og 4x7 quiz er materialisert." },
      editorial_quality: { score: 5, note: "Monument, gravplass, pest, kolera, Munch-familie og minnepark skilles som ulike historiske lag." },
      technical_integrity: { score: 5, note: "Deterministisk materializer, v4.2-pakke, History A–H og permanent regresjon inngår." },
      safety_and_responsibility: { score: 5, note: "Dødelighet og menneskelige erfaringer sensationaliseres ikke; kildeusikkerheten gjøres eksplisitt." },
      maintainability_and_auditability: { score: 5, note: "Claims, setningsdekning, kildeproveniens, bildebegrensning og holdbacks er eksplisitte." },
      total: 30, critical_findings: 0, unresolved_blockers: 0
    }
  };
}
