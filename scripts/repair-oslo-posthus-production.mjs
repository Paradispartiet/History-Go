#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildQuizProductionContext } from "./quiz-production-lib.mjs";

const root = process.cwd();
const categoryId = "naeringsliv";
const targetId = "oslo_posthus";
const quizPath = "data/quiz/naeringsliv/oslo_posthus_sets_merged.json";
const briefPath = "data/quiz/production_briefs/naeringsliv/oslo_posthus.json";
const contextPath = "data/quiz/production_context/naeringsliv/oslo_posthus.json";
const manifestPath = "data/fag/fag_manifest.json";
const testPath = "tests/quiz-production-pipeline.test.mjs";

const oldQuiz = JSON.parse(await readFile(path.resolve(root, quizPath), "utf8"));
const oldQuestions = oldQuiz.sets.flatMap((set) => set.questions);

const sources = {
  place_record: {
    url: "data/places/naeringsliv/oslo/places_naeringsliv.json",
    source_type: "canonical_place_record",
    review_status: "reviewed",
    review_note: "Brukt som intern kontroll av mål, adresse, kategori og etablert stedidentitet."
  },
  oslo_byleksikon: {
    url: "https://oslobyleksikon.no/side/Hovedpostkontoret",
    source_type: "municipal_city_encyclopedia",
    review_status: "reviewed",
    review_note: "Brukt for arkitekt, stil, byggeperioder, bygningspreg, historiske spor og hovedfunksjon."
  },
  lokalhistoriewiki: {
    url: "https://lokalhistoriewiki.no/wiki/Oslo_hovedpostkontor",
    source_type: "local_history_encyclopedia",
    review_status: "reviewed",
    review_note: "Brukt for åpningsdato, terminalperiode, senere institusjoner og tomtas eldre historie."
  },
  postmuseet: {
    url: "https://postmuseet.no/postens-historie/postens-historie",
    source_type: "postal_history_museum",
    review_status: "reviewed",
    review_note: "Brukt for Postverkets etablering, drift, frimerke og transporthistorie."
  },
  posten_bring: {
    url: "https://www.postenbring.no/om-oss/var-historie",
    source_type: "company_history",
    review_status: "reviewed",
    review_note: "Brukt for Postverkets transporthistorie, dampskip, jernbane og organisatoriske utvikling."
  },
  linstow: {
    url: "https://www.linstow.no/prosjekter/quadraturen",
    source_type: "property_owner_project_history",
    review_status: "reviewed",
    review_note: "Brukt for kjøpet i 1999, kvartalets eiendommer, verneverdier og konvertering til bolig og næring."
  },
  kritt: {
    url: "https://www.kritt.no/elementer/posthallen",
    source_type: "architecture_and_reuse_project",
    review_status: "reviewed",
    review_note: "Brukt for Posthallen-konverteringen, publikumsfunksjoner og bevarte bygningsdeler."
  }
};

const sourceUrlToId = new Map(Object.entries(sources).map(([id, source]) => [source.url, id]));
const phases = ["opening", "middle", "middle", "bridge", "final"];
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
  custom({
    question: "Hvor ligger Oslo Hovedpostkontor?",
    answer: "Dronningens gate 15",
    distractors: ["Biskop Gunnerus’ gate 14", "Kongens gate 21"],
    statement: "Oslo Hovedpostkontor ligger i Dronningens gate 15 i Kvadraturen.",
    emne_id: "em_naering_teknologi_infrastruktur",
    source_ids: ["place_record", "oslo_byleksikon", "lokalhistoriewiki"]
  }),
  old(2, { source_ids: ["linstow", "lokalhistoriewiki", "oslo_byleksikon"] }),
  old(3, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  custom({
    question: "Når vant Rudolf E. Jacobsen arkitektkonkurransen om Hovedpostkontoret?",
    answer: "1912",
    distractors: ["1899", "1931"],
    statement: "Rudolf E. Jacobsen vant arkitektkonkurransen om Hovedpostkontoret i 1912.",
    emne_id: "em_naering_teknologi_infrastruktur",
    source_ids: ["oslo_byleksikon"]
  }),
  old(5, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  custom({
    question: "Hvilken etat tok bygningen i bruk som hovedpostkontor?",
    answer: "Postverket",
    distractors: ["Telegrafverket", "Norges Statsbaner"],
    statement: "Postverket tok bygningen i bruk som hovedpostkontor i 1924.",
    emne_id: "em_naering_logistikk_verdikjeder",
    source_ids: ["oslo_byleksikon", "lokalhistoriewiki", "linstow"]
  }),
  custom({
    question: "På hvilken dato åpnet Hovedpostkontoret i Dronningens gate?",
    answer: "23. februar 1924",
    distractors: ["17. januar 1647", "1. september 1854"],
    statement: "Hovedpostkontoret i Dronningens gate åpnet 23. februar 1924.",
    emne_id: "em_naering_logistikk_verdikjeder",
    source_ids: ["lokalhistoriewiki"]
  }),
  old(7, { source_ids: ["postmuseet", "posten_bring"] }),
  old(8, { emne_id: "em_naering_logistikk_verdikjeder", source_ids: ["postmuseet", "posten_bring"] }),
  old(9, { emne_id: "em_naering_kapital_finans", source_ids: ["postmuseet", "posten_bring"] }),
  old(10, { source_ids: ["postmuseet", "posten_bring"] }),
  custom({
    question: "Hva het dampskipene Postverket anskaffet i 1827?",
    answer: "Constitutionen og Prinds Carl",
    distractors: ["Dronningen og Kronprinsen", "Christiania og Eidsvoll"],
    statement: "Postverket anskaffet dampskipene Constitutionen og Prinds Carl i 1827.",
    emne_id: "em_naering_logistikk_verdikjeder",
    source_ids: ["posten_bring", "postmuseet"]
  }),
  old(11, { source_ids: ["postmuseet", "posten_bring"] }),
  old(12, { source_ids: ["postmuseet"] }),
  old(13, { source_ids: ["lokalhistoriewiki"] }),
  old(14, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  old(15, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  custom({
    question: "Når tok perioden med Sentrum postkontor, Postdirektoratet og Postmuseet slutt?",
    answer: "2004",
    distractors: ["1975", "1999"],
    statement: "Sentrum postkontor, Postdirektoratet og Postmuseet holdt til i bygningen fram til 2004.",
    emne_id: "em_naering_omstilling_kriser_skift",
    source_ids: ["oslo_byleksikon", "lokalhistoriewiki"]
  }),
  old(16, { source_ids: ["lokalhistoriewiki"] }),
  old(17, { source_ids: ["lokalhistoriewiki"] }),
  old(18, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  old(20, { source_ids: ["oslo_byleksikon"] }),
  old(21, { source_ids: ["oslo_byleksikon", "lokalhistoriewiki"] }),
  old(22, { source_ids: ["oslo_byleksikon"] }),
  old(23, { source_ids: ["linstow", "kritt"] }),
  old(25, { source_ids: ["linstow"] }),
  custom({
    question: "Hvor mye betalte Linstow for Posthuskvartalet i 1999?",
    answer: "275 millioner kroner",
    distractors: ["27,5 millioner kroner", "2,75 milliarder kroner"],
    statement: "Linstow kjøpte Posthuskvartalet fra Posten Norge i 1999 for 275 millioner kroner.",
    emne_id: "em_naering_kapital_finans",
    source_ids: ["linstow"]
  }),
  old(26, { source_ids: ["linstow"] }),
  old(27, {
    question: "Hva ble en stor del av Posthallen-prosjektet bygget om til?",
    options: ["211 leiligheter med næringsarealer", "Et nytt postterminalanlegg", "Et jernbaneverksted"],
    answer: "211 leiligheter med næringsarealer",
    statement: "Posthallen-prosjektet omfattet 211 leiligheter med næringsarealer.",
    question_type: "analysis",
    source_ids: ["linstow", "kritt"],
    method_id: "met_naering_verdiskapingsanalyse"
  }),
  old(28, {
    question_type: "analysis",
    source_ids: ["linstow"],
    method_id: "met_naering_verdiskapingsanalyse"
  }),
  old(29, {
    question_type: "analysis",
    source_ids: ["kritt", "linstow"],
    method_id: "met_naering_forbruker_og_atferdsanalyse"
  }),
  custom({
    question: "Hva er den viktigste funksjonelle endringen i Hovedpostkontoret?",
    answer: "Fra postterminal og administrasjon til boliger, næring og publikumsfunksjoner",
    distractors: ["Fra bryggeri til kraftverk", "Fra jernbaneverksted til skole"],
    statement: "Hovedpostkontoret er omformet fra postterminal og administrasjonsbygg til boliger, næring og publikumsfunksjoner.",
    emne_id: "em_naering_omstilling_kriser_skift",
    source_ids: ["oslo_byleksikon", "linstow", "kritt"],
    question_type: "analysis",
    difficulty: 2,
    method_id: "met_naering_arbeidslivsanalyse"
  }),
  custom({
    question: "Hva ble særlig bevart da Posthallen ble ombygd?",
    answer: "Fasadene, postekspedisjonshallen og trappeløpene",
    distractors: ["Bare garasjene", "Bare moderne balkonger"],
    statement: "Fasadene, postekspedisjonshallen og trappeløpene ble fremhevet som sentrale verneverdier i ombyggingen.",
    emne_id: "em_naering_teknologi_infrastruktur",
    source_ids: ["linstow", "kritt"],
    question_type: "analysis",
    difficulty: 2,
    method_id: "met_naering_infrastrukturanalyse"
  }),
  custom({
    question: "Hva har den historiske og den nye bruken av bygningen til felles?",
    answer: "Begge samler tjenester og mange brukere i ett bykvartal",
    distractors: ["Begge produserer bygass", "Begge reparerer lokomotiver"],
    statement: "Både hovedpostkontoret og dagens blandede bruk samler tjenester og mange brukere i ett bykvartal.",
    emne_id: "em_naering_omstilling_kriser_skift",
    source_ids: ["lokalhistoriewiki", "linstow", "kritt"],
    question_type: "analysis",
    difficulty: 3,
    method_id: "met_naering_verdiskapingsanalyse"
  }),
  custom({
    question: "Hva viser samlingen av sortering, ekspedisjon og administrasjon i ett hovedpostkontor?",
    answer: "At posttjenestene ble organisert som ett stort, rasjonalisert system",
    distractors: ["At postgangen ble overlatt til private hjem", "At jernbanepost ble avviklet før 1924"],
    statement: "Samlingen av sortering, ekspedisjon og administrasjon i ett hovedpostkontor viser en rasjonalisering av posttjenestene.",
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
      why_it_helps: "Webers perspektiv på rasjonalisering gjør det mulig å forstå hvorfor sortering, ekspedisjon, administrasjon og arbeidskraft ble samlet i ett stort postalt system."
    }
  })
];

if (specs.length !== 35) throw new Error(`Forventet 35 spørsmål, fikk ${specs.length}`);

const answerPositions = Array.from({ length: 35 }, (_, index) => index % 3);
function placeAnswer(spec, answerIndex) {
  const distractors = spec.options.filter((option) => option !== spec.answer);
  if (distractors.length !== 2) throw new Error(`Spørsmålet har ikke nøyaktig to distraktorer: ${spec.question}`);
  const options = [...distractors];
  options.splice(answerIndex, 0, spec.answer);
  return options;
}

const questions = specs.map((spec, index) => {
  const order = index + 1;
  const answerIndex = answerPositions[index];
  const source_origin = spec.source_ids.includes("place_record") ? "mixed" : "external";
  const question = {
    id: `oslo_posthus_quiz_${order}`,
    quiz_id: `naeringsliv_oslo_posthus_set_${Math.floor(index / 7) + 1}_q${(index % 7) + 1}`,
    categoryId,
    placeId: targetId,
    targetId,
    question_scope: "place",
    question: spec.question,
    options: placeAnswer(spec, answerIndex),
    answer: spec.answer,
    answerIndex,
    knowledge: spec.statement,
    difficulty: spec.difficulty,
    question_type: spec.question_type,
    emne_id: spec.emne_id,
    source: spec.source_ids,
    source_origin,
    claim_basis: spec.statement,
    claim_id: `claim_oslo_posthus_${String(order).padStart(2, "0")}`
  };
  for (const key of ["method_id", "topic_hook_id", "thinker_id", "thinker_name", "theory_focus", "theory_ref"]) {
    if (spec[key] !== undefined) question[key] = spec[key];
  }
  if (spec.method_id) question.guidance_basis = guidanceBasis;
  return question;
});

const claims = specs.map((spec, index) => {
  const order = index + 1;
  const claim = {
    claim_id: `claim_oslo_posthus_${String(order).padStart(2, "0")}`,
    order,
    planned_phase: phases[Math.floor(index / 7)],
    family: spec.method_id || spec.topic_hook_id ? "concept_theory" : "fact",
    statement: spec.statement,
    source_ids: spec.source_ids,
    source_origin: spec.source_ids.includes("place_record") ? "mixed" : "external",
    emne_id: spec.emne_id
  };
  for (const key of ["method_id", "topic_hook_id", "thinker_id"]) {
    if (spec[key] !== undefined) claim[key] = spec[key];
  }
  return claim;
});

const brief = {
  schema_version: "1.0",
  status: "reviewed",
  categoryId,
  targetId,
  reviewed_at: "2026-07-24",
  review_note: "Påstandsbanken er bygget fra den eksisterende Oslo posthus-quizen og de allerede oppførte institusjons- og prosjektkildene. Fire meta-/korreksjonsspørsmål er erstattet, fem nye kildebelagte spørsmål er lagt til, og de første 14 er låst til normal quizform uten metode- eller teoribinding.",
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
  profile_hint: "rich",
  claims
};

const manifest = JSON.parse(await readFile(path.resolve(root, manifestPath), "utf8"));
manifest.naeringsliv.quizProduction.targets[targetId] = {
  source_brief: "../quiz/production_briefs/naeringsliv/oslo_posthus.json",
  context_artifact: "../quiz/production_context/naeringsliv/oslo_posthus.json",
  quiz_file: "../quiz/naeringsliv/oslo_posthus_sets_merged.json"
};

async function writeJson(relativePath, value) {
  const absolutePath = path.resolve(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

await writeJson(manifestPath, manifest);
await writeJson(briefPath, brief);

const context = await buildQuizProductionContext({ root, categoryId, targetId });
await writeJson(contextPath, context);

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
    resolved_files: Object.fromEntries(Object.entries(context.resolved_files).map(([key, value]) => [key, value.path])),
    required_inputs_loaded: context.required_inputs_loaded,
    pensum_module_ids: context.selected_curriculum.module_ids,
    emne_ids: context.selected_curriculum.emne_ids,
    topic_hook_ids: context.selected_curriculum.topic_hook_ids,
    method_ids: context.selected_curriculum.method_ids,
    thinker_ids: context.selected_curriculum.thinker_ids,
    works: context.selected_curriculum.works,
    source_review_status: context.source_review_status,
    theory_start_phase: "final"
  },
  sets: Array.from({ length: 5 }, (_, setIndex) => ({
    set_id: `naeringsliv_oslo_posthus_set_${setIndex + 1}`,
    level: setIndex + 1,
    order: setIndex + 1,
    phase: phases[setIndex],
    questions: questions.slice(setIndex * 7, (setIndex + 1) * 7)
  }))
};
await writeJson(quizPath, quiz);

let testText = await readFile(path.resolve(root, testPath), "utf8");
testText = testText.replace("assert.equal(report.quizFilesChecked, 6);", "assert.equal(report.quizFilesChecked, 7);");
await writeFile(path.resolve(root, testPath), testText, "utf8");

console.log(JSON.stringify({
  targetId,
  questions: questions.length,
  answerPositions: answerPositions.reduce((acc, value) => ({ ...acc, [value]: (acc[value] || 0) + 1 }), {}),
  profile: context.profile,
  phases: context.set_plan.map((set) => set.phase)
}, null, 2));
