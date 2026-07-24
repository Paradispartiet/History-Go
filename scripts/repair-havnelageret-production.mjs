#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildQuizProductionContext } from "./quiz-production-lib.mjs";

const root = process.cwd();
const categoryId = "naeringsliv";
const targetId = "havnelageret";
const quizPath = "data/quiz/naeringsliv/havnelageret_sets_merged.json";
const briefPath = "data/quiz/production_briefs/naeringsliv/havnelageret.json";
const contextPath = "data/quiz/production_context/naeringsliv/havnelageret.json";
const manifestPath = "data/fag/fag_manifest.json";
const testPath = "tests/quiz-production-pipeline.test.mjs";

const oldQuiz = JSON.parse(await readFile(path.resolve(root, quizPath), "utf8"));
const oldQuestions = oldQuiz.sets.flatMap((set) => set.questions);

const sources = {
  place_record: {
    url: "data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json",
    source_type: "canonical_place_record",
    review_status: "reviewed",
    review_note: "Brukt som intern kontroll av sted, adresse, kategori og etablert identitet."
  },
  oslo_byleksikon: {
    url: "https://oslobyleksikon.no/index.php/Oslo_Havnelager",
    source_type: "municipal_city_encyclopedia",
    review_status: "reviewed",
    review_note: "Brukt for byggeår, arkitekt, størrelse, fasade, byggemetode, krigsbruk og senere ombygginger."
  },
  lokalhistoriewiki: {
    url: "https://lokalhistoriewiki.no/wiki/Oslo_havnelager",
    source_type: "local_history_encyclopedia",
    review_status: "reviewed",
    review_note: "Brukt for navn, fundamentering, lagerhistorie, arkitektur og havnekontekst."
  },
  entra: {
    url: "https://www.entra.no/vare-eiendommer/ledige-lokaler/langkaia-1a",
    source_type: "property_owner",
    review_status: "reviewed",
    review_note: "Brukt for dagens kontor- og fullservicebruk, tjenester og Bjørvika-plassering."
  },
  let: {
    url: "https://let.no/kontor/oslo/langkaia-1",
    source_type: "office_leasing",
    review_status: "reviewed",
    review_note: "Brukt som kontroll av dagens kontorbruk, beliggenhet og marked."
  },
  betonmast: {
    url: "https://www.betonmast.no/prosjekter/langkaia-1/",
    source_type: "project_contractor",
    review_status: "reviewed",
    review_note: "Brukt for rehabilitering av de øvre etasjene og ombygging til kontorlandskap."
  },
  bygg: {
    url: "https://www.bygg.no/betonmast-kontrakter-rehabilitering/betonmast-renoverer-havnelageret/402345",
    source_type: "construction_trade_press",
    review_status: "reviewed",
    review_note: "Brukt som kontroll av Betonmast-prosjektets omfang og funksjon."
  },
  estate: {
    url: "https://ne.no/2025/07/04/langkaia-1-fylles-opp-entra-sikrer-ny-leieavtale-i-havnelageret/",
    source_type: "property_trade_press",
    review_status: "reviewed",
    review_note: "Brukt for den daterte leieavtalen i 2025 og byggets rolle i kontormarkedet."
  },
  snl_bjorvika: {
    url: "https://snl.no/Bj%C3%B8rvika",
    source_type: "national_encyclopedia",
    review_status: "reviewed",
    review_note: "Brukt for Bjørvika som havneområde og stedlig orientering."
  }
};

const sourceUrlToId = new Map(Object.entries(sources).map(([id, source]) => [source.url, id]));
const phases = ["opening", "middle", "middle", "bridge", "final"];
const answerPattern = Array.from({ length: 35 }, (_, index) => index % 3);
const guidanceBasis = [
  "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json",
  "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json"
];

function sourceIdsFromOld(question) {
  return [...new Set((question.source || []).map((url) => sourceUrlToId.get(url)).filter(Boolean))];
}

function old(index, overrides = {}) {
  const source = oldQuestions[index - 1];
  if (!source) throw new Error(`Mangler gammelt spørsmål ${index}`);
  return {
    question: source.question,
    options: [...source.options],
    answer: source.answer,
    statement: source.knowledge,
    question_type: "fact",
    difficulty: source.difficulty || 1,
    emne_id: source.emne_id,
    source_ids: sourceIdsFromOld(source),
    ...overrides
  };
}

function custom({ question, answer, distractors, statement, emne_id, source_ids, question_type = "fact", difficulty = 1, ...rest }) {
  return {
    question,
    options: [answer, ...distractors],
    answer,
    statement,
    question_type,
    difficulty,
    emne_id,
    source_ids,
    ...rest
  };
}

const specs = [
  old(1, { source_ids: ["place_record", "oslo_byleksikon", "lokalhistoriewiki"] }),
  old(2, { source_ids: ["lokalhistoriewiki", "oslo_byleksikon"] }),
  old(3, { source_ids: ["place_record", "oslo_byleksikon", "lokalhistoriewiki", "entra"] }),
  old(4, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  old(5, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  custom({
    question: "Hva kjennetegner hovedmaterialet i Havnelagerets fasade?",
    answer: "Prikkhamret betong",
    distractors: ["Ubehandlet laftet tømmer", "Glass og aluminium som opprinnelig fasade"],
    statement: "Oslo byleksikon beskriver Havnelagerets fasade som prikkhamret betong.",
    emne_id: "em_naering_teknologi_infrastruktur",
    source_ids: ["oslo_byleksikon", "lokalhistoriewiki"]
  }),
  old(7, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  old(8, { source_ids: ["oslo_byleksikon"] }),
  old(9, { source_ids: ["lokalhistoriewiki"] }),
  custom({
    question: "Hvor lange var de armerte betongpælene under Havnelageret?",
    answer: "Omtrent 20–24 meter",
    distractors: ["Omtrent 2–4 meter", "Omtrent 50–60 meter"],
    statement: "Lokalhistoriewiki gjengir en omtale av 1550 armerte betongpæler som var 20–24 meter lange.",
    emne_id: "em_naering_teknologi_infrastruktur",
    source_ids: ["lokalhistoriewiki"]
  }),
  old(10, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  old(11, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  old(13, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  old(15, {
    question: "Hvilket historisk landemerke ligger nær Havnelageret?",
    options: ["Akershus festning", "Frognerparken", "Ullevål stadion"],
    answer: "Akershus festning",
    statement: "Havnelageret ligger ved Langkaia, like ved Akershus festning og Bjørvika.",
    source_ids: ["place_record", "oslo_byleksikon", "snl_bjorvika"]
  }),
  old(16, { source_ids: ["snl_bjorvika", "entra", "let"] }),
  old(18, { source_ids: ["oslo_byleksikon"] }),
  old(19, { source_ids: ["oslo_byleksikon"] }),
  old(20, { source_ids: ["oslo_byleksikon"] }),
  old(21, { source_ids: ["oslo_byleksikon", "entra"] }),
  old(22, { source_ids: ["entra", "let", "estate"] }),
  old(23, { source_ids: ["entra", "let", "estate"] }),
  old(25, { source_ids: ["betonmast", "bygg"] }),
  old(26, { source_ids: ["betonmast", "bygg"] }),
  old(27, { source_ids: ["entra", "let", "estate"] }),
  old(28, { source_ids: ["estate"] }),
  custom({
    question: "Hvilke tjenester inngår i dagens fullservicebygg?",
    answer: "Resepsjon, kantine, møterom og treningsrom",
    distractors: ["Lokomotivverksted og dreieskive", "Postsortering og frimerketrykkeri"],
    statement: "Entra beskriver Langkaia 1 med resepsjon, kantine, møterom, treningsrom og andre servicetilbud.",
    emne_id: "em_naering_forbruk_marked",
    source_ids: ["entra"]
  }),
  old(17, {
    question_type: "context",
    difficulty: 2,
    source_ids: ["oslo_byleksikon", "lokalhistoriewiki"]
  }),
  old(29, {
    question_type: "context",
    source_ids: ["oslo_byleksikon", "entra", "let", "estate"]
  }),
  custom({
    question: "Hva gjorde Havnelagerets store areal og mange etasjer mulig?",
    answer: "Storskala lagring og organisering av varer ved havna",
    distractors: ["Produksjon av bygass til gatelys", "Reparasjon av damplokomotiver"],
    statement: "Et areal på om lag 27 000 m² og ni etasjer ga kapasitet til storskala lagring og organisering av varer ved havna.",
    emne_id: "em_naering_logistikk_verdikjeder",
    source_ids: ["oslo_byleksikon", "lokalhistoriewiki"],
    question_type: "analysis",
    difficulty: 2,
    method_id: "met_naering_infrastrukturanalyse"
  }),
  custom({
    question: "Hvorfor trengte Havnelageret 1550 lange betongpæler?",
    answer: "For å bære den massive bygningen på krevende havnegrunn",
    distractors: ["For å føre postrør gjennom byen", "For å feste seilskip direkte til taket"],
    statement: "De mange, lange betongpælene bar den store lagerbygningen på krevende grunn ved havna.",
    emne_id: "em_naering_teknologi_infrastruktur",
    source_ids: ["lokalhistoriewiki"],
    question_type: "analysis",
    difficulty: 2,
    method_id: "met_naering_infrastrukturanalyse"
  }),
  custom({
    question: "Hva er den viktigste funksjonelle endringen i Havnelageret?",
    answer: "Fra varelager ved havna til kontor- og servicebygg",
    distractors: ["Fra posthus til jernbaneverksted", "Fra kraftverk til bryggeri"],
    statement: "Havnelageret er omformet fra lager for havnens varestrømmer til et moderne kontor- og servicebygg.",
    emne_id: "em_naering_omstilling_kriser_skift",
    source_ids: ["oslo_byleksikon", "entra", "betonmast"],
    question_type: "analysis",
    difficulty: 2,
    method_id: "met_naering_arbeidslivsanalyse"
  }),
  custom({
    question: "Hva har den gamle og den nye bruken av Havnelageret til felles?",
    answer: "Begge organiserer store strømmer i en sentral del av byen",
    distractors: ["Begge produserer kullgass", "Begge fungerer som passasjerterminal for tog"],
    statement: "Før organiserte bygningen varestrømmer; i dag samler den arbeidsplasser, tjenester og mennesker i Bjørvika.",
    emne_id: "em_naering_logistikk_verdikjeder",
    source_ids: ["oslo_byleksikon", "lokalhistoriewiki", "entra"],
    question_type: "analysis",
    difficulty: 3,
    method_id: "met_naering_verdiskapingsanalyse"
  }),
  custom({
    question: "Hva viser investeringene og rehabiliteringene i Havnelageret?",
    answer: "At eldre havneinfrastruktur kan få ny økonomisk verdi gjennom ombruk",
    distractors: ["At gamle lagerbygg alltid må rives", "At kontorbruk krever at verneverdier fjernes"],
    statement: "Kjøp, oppgraderinger og rehabilitering viser hvordan eldre havneinfrastruktur kan få ny økonomisk verdi gjennom ombruk.",
    emne_id: "em_naering_kapital_finans",
    source_ids: ["oslo_byleksikon", "entra", "betonmast", "bygg"],
    question_type: "analysis",
    difficulty: 3,
    method_id: "met_naering_verdiskapingsanalyse"
  }),
  custom({
    question: "Hva gjør Havnelageret konkurransedyktig i dagens kontormarked?",
    answer: "Sentral beliggenhet kombinert med tjenester og moderne kontorlokaler",
    distractors: ["Avstand fra kollektivtransport og byliv", "Aktiv lagring av importvarer på kaia"],
    statement: "Utleiekildene fremhever sentral beliggenhet, kollektivtilgang, servicetilbud og moderne kontorlokaler.",
    emne_id: "em_naering_forbruk_marked",
    source_ids: ["entra", "let", "estate"],
    question_type: "analysis",
    difficulty: 3,
    method_id: "met_naering_forbruker_og_atferdsanalyse"
  }),
  custom({
    question: "Hva viser samlingen av store lagerflater, kaiadgang og koordinert vareflyt?",
    answer: "At havneøkonomien ble organisert som et stort, rasjonalisert system",
    distractors: ["At varetransporten foregikk uten arbeidsdeling", "At bygningen først og fremst var et boligprosjekt"],
    statement: "Havnelagerets størrelse, plassering og organiserte vareflyt viser rasjonalisering av havneøkonomien i stor skala.",
    emne_id: "em_naering_arbeid_verdiskaping",
    source_ids: ["oslo_byleksikon", "lokalhistoriewiki"],
    question_type: "analysis",
    difficulty: 3,
    method_id: "met_naering_arbeidslivsanalyse",
    topic_hook_id: "arbeid_som_verdiskaping",
    thinker_id: "max_weber",
    thinker_name: "Max Weber",
    theory_focus: "rasjonalisering og organisering",
    theory_ref: {
      topic_hook_id: "arbeid_som_verdiskaping",
      why_it_helps: "Webers perspektiv på rasjonalisering gjør det mulig å forstå Havnelageret som en stor, koordinert organisasjon for vareflyt, lagring og arbeid."
    }
  })
];

if (specs.length !== 35) throw new Error(`Forventet 35 spørsmål, fikk ${specs.length}`);

const sourceOrigin = (sourceIds) => sourceIds.includes("place_record") ? "mixed" : "external";
const familyFor = (spec) => spec.method_id || spec.topic_hook_id || spec.theory_ref
  ? "concept_theory"
  : ["context", "comparison"].includes(spec.question_type)
    ? "context"
    : "fact";

const claims = specs.map((spec, index) => ({
  claim_id: `claim_havnelageret_${String(index + 1).padStart(2, "0")}`,
  order: index + 1,
  planned_phase: phases[Math.floor(index / 7)],
  family: familyFor(spec),
  statement: spec.statement,
  source_ids: spec.source_ids,
  source_origin: sourceOrigin(spec.source_ids),
  emne_id: spec.emne_id
}));

const brief = {
  schema_version: "1.0",
  status: "reviewed",
  categoryId,
  targetId,
  reviewed_at: "2026-07-24",
  review_note: "Påstandsbanken bygger på den eksisterende Havnelageret-quizen og de allerede registrerte historie-, eiendoms- og prosjektkildene. Fire meta-/flatquizspørsmål er fjernet, mens de første 14 påstandene er låst til normal quizform uten metode- eller teoribinding.",
  profile_hint: "rich",
  sources,
  selected_curriculum: {
    module_ids: [],
    emne_ids: [
      "em_naering_arbeid_verdiskaping",
      "em_naering_forbruk_marked",
      "em_naering_kapital_finans",
      "em_naering_logistikk_verdikjeder",
      "em_naering_omstilling_kriser_skift",
      "em_naering_teknologi_infrastruktur"
    ],
    topic_hook_ids: ["arbeid_som_verdiskaping"],
    method_ids: [
      "met_naering_arbeidslivsanalyse",
      "met_naering_forbruker_og_atferdsanalyse",
      "met_naering_infrastrukturanalyse",
      "met_naering_verdiskapingsanalyse"
    ],
    thinker_ids: ["max_weber"],
    works: []
  },
  claims
};

await mkdir(path.dirname(path.resolve(root, briefPath)), { recursive: true });
await writeFile(path.resolve(root, briefPath), `${JSON.stringify(brief, null, 2)}\n`, "utf8");

const manifest = JSON.parse(await readFile(path.resolve(root, manifestPath), "utf8"));
manifest.naeringsliv.quizProduction.targets[targetId] = {
  source_brief: "../quiz/production_briefs/naeringsliv/havnelageret.json",
  context_artifact: "../quiz/production_context/naeringsliv/havnelageret.json",
  quiz_file: "../quiz/naeringsliv/havnelageret_sets_merged.json"
};
await writeFile(path.resolve(root, manifestPath), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const context = await buildQuizProductionContext({ root, categoryId, targetId });
await mkdir(path.dirname(path.resolve(root, contextPath)), { recursive: true });
await writeFile(path.resolve(root, contextPath), `${JSON.stringify(context, null, 2)}\n`, "utf8");

function buildOptions(spec, answerIndex) {
  const distractors = spec.options.filter((option) => option !== spec.answer);
  if (distractors.length !== 2) throw new Error(`Spørsmålet har ikke to unike distraktorer: ${spec.question}`);
  const options = [...distractors];
  options.splice(answerIndex, 0, spec.answer);
  return options;
}

const sets = Array.from({ length: 5 }, (_, setIndex) => ({
  set_id: `naeringsliv_havnelageret_set_${setIndex + 1}`,
  level: setIndex + 1,
  order: setIndex + 1,
  phase: phases[setIndex],
  questions: specs.slice(setIndex * 7, (setIndex + 1) * 7).map((spec, localIndex) => {
    const index = setIndex * 7 + localIndex;
    const answerIndex = answerPattern[index];
    const question = {
      id: `havnelageret_quiz_${index + 1}`,
      quiz_id: `naeringsliv_havnelageret_set_${setIndex + 1}_q${localIndex + 1}`,
      categoryId,
      placeId: targetId,
      targetId,
      question_scope: "place",
      question: spec.question,
      options: buildOptions(spec, answerIndex),
      answer: spec.answer,
      answerIndex,
      knowledge: spec.statement,
      difficulty: spec.difficulty,
      question_type: spec.question_type,
      emne_id: spec.emne_id,
      source: spec.source_ids,
      source_origin: sourceOrigin(spec.source_ids),
      claim_basis: spec.statement,
      claim_id: claims[index].claim_id
    };

    for (const key of [
      "method_id",
      "topic_hook_id",
      "thinker_id",
      "thinker_name",
      "theory_focus",
      "theory_ref"
    ]) {
      if (spec[key] !== undefined) question[key] = spec[key];
    }
    if (spec.method_id || spec.topic_hook_id || spec.theory_ref) {
      question.guidance_basis = guidanceBasis;
    }
    return question;
  })
}));

const quiz = {
  targetId,
  categoryId,
  sources: Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, source.url])),
  production_context: {
    manifest_category: categoryId,
    profile: context.profile,
    standard_version: "3.0",
    source_brief: briefPath,
    context_artifact: contextPath,
    resolved_files: Object.fromEntries(Object.entries(context.resolved_files).map(([key, record]) => [key, record.path])),
    required_inputs_loaded: context.required_inputs_loaded,
    pensum_module_ids: context.selected_curriculum.module_ids,
    emne_ids: context.selected_curriculum.emne_ids,
    topic_hook_ids: context.selected_curriculum.topic_hook_ids,
    method_ids: context.selected_curriculum.method_ids,
    thinker_ids: context.selected_curriculum.thinker_ids,
    works: context.selected_curriculum.works,
    source_review_status: context.source_review_status,
    method_start_phase: "final",
    theory_start_phase: "final"
  },
  sets
};

await writeFile(path.resolve(root, quizPath), `${JSON.stringify(quiz, null, 2)}\n`, "utf8");

let testText = await readFile(path.resolve(root, testPath), "utf8");
if (!testText.includes("assert.equal(report.quizFilesChecked, 7);")) {
  throw new Error("Fant ikke forventet quizFilesChecked=7 i produksjonstesten");
}
testText = testText.replace("assert.equal(report.quizFilesChecked, 7);", "assert.equal(report.quizFilesChecked, 8);");
await writeFile(path.resolve(root, testPath), testText, "utf8");

const flattened = sets.flatMap((set) => set.questions);
const answerCounts = [0, 1, 2].map((answerIndex) => flattened.filter((question) => question.answerIndex === answerIndex).length);
if (answerCounts.join("/") !== "12/12/11") throw new Error(`Feil svarbalanse: ${answerCounts.join("/")}`);
if (flattened.slice(0, 14).some((question) => question.method_id || question.topic_hook_id || question.thinker_id || question.theory_ref)) {
  throw new Error("De første 14 spørsmålene inneholder metode- eller teoribinding");
}

console.log(JSON.stringify({ questions: flattened.length, answerCounts, profile: context.profile }, null, 2));
