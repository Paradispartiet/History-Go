#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildQuizProductionContext } from "./quiz-production-lib.mjs";

const root = process.cwd();
const categoryId = "naeringsliv";
const targetId = "tollbukaia";
const quizPath = "data/quiz/naeringsliv/tollbukaia_sets_merged.json";
const briefPath = "data/quiz/production_briefs/naeringsliv/tollbukaia.json";
const contextPath = "data/quiz/production_context/naeringsliv/tollbukaia.json";
const manifestPath = "data/fag/fag_manifest.json";
const testPath = "tests/quiz-production-pipeline.test.mjs";

const oldQuiz = JSON.parse(await readFile(path.resolve(root, quizPath), "utf8"));
const oldQuestions = oldQuiz.sets.flatMap((set) => set.questions);

const sources = {
  place_record: { url: "data/places/naeringsliv/oslo/places_naeringsliv/tollbukaia.json", source_type: "canonical_place_record", review_status: "reviewed", review_note: "Brukt som intern kontroll av sted, koordinatrolle, kategori og etablert identitet." },
  oslo_byleksikon_tollbukaia: { url: "https://oslobyleksikon.no/side/Tollbukaia", source_type: "municipal_city_encyclopedia", review_status: "reviewed", review_note: "Brukt for historisk navn, plassering og kaiområdets avgrensning." },
  oslo_byleksikon_tollbubrygga: { url: "https://oslobyleksikon.no/side/Tollbubrygga", source_type: "municipal_city_encyclopedia", review_status: "reviewed", review_note: "Brukt for bryggas plassering, utvidelse, hovedbryggerolle og opphør av havnetrafikk." },
  oslo_byleksikon_tollboden: { url: "https://oslobyleksikon.no/index.php/Tollboden", source_type: "municipal_city_encyclopedia", review_status: "reviewed", review_note: "Brukt for tollbodhistorie, branner, Tollpakkhuset, museum og senere kontorbruk." },
  oslo_byleksikon_tollbugata: { url: "https://oslobyleksikon.no/side/Tollbugata", source_type: "municipal_city_encyclopedia", review_status: "reviewed", review_note: "Brukt for gatenavn og det eldre navnet Waterstræde." },
  snl_tollmuseum: { url: "https://snl.no/Norsk_Tollmuseum", source_type: "national_encyclopedia", review_status: "reviewed", review_note: "Brukt for Tollpakkhuset, arkitekt og Norsk Tollmuseums historie." },
  oppdag_kvadraturen: { url: "https://www.oppdagkvadraturen.no/stoppesteder/tollpakkhuset", source_type: "heritage_interpretation", review_status: "reviewed", review_note: "Brukt som kontroll av Tollpakkhusets byggeperiode, arkitekt og historiske funksjon." },
  cruise_terminal: { url: "https://www.oslocruiseterminal.com/", source_type: "terminal_operator", review_status: "reviewed", review_note: "Brukt for Oslo Cruise Terminal i Skur 35 ved Akershusstranda." },
  tolletaten: { url: "https://www.toll.no/en/about-norwegian-customs/contact-us/all-customs-offices/oslo/oslo-port", source_type: "government_customs_authority", review_status: "reviewed", review_note: "Brukt for Utstikker II, adresse og dokumenterte tollklareringstjenester." },
  oslo_kommune: { url: "https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/akershusstranda/", source_type: "municipal_planning_authority", review_status: "reviewed", review_note: "Brukt for Fjordbyen, Akershusstranda, publikumsadgang, rekreasjon og nye tilbud i havneskur." }
};

const sourceUrlToId = new Map(Object.entries(sources).map(([id, source]) => [source.url, id]));
const phases = ["opening", "middle", "middle", "bridge", "final"];
const answerPattern = Array.from({ length: 35 }, (_, index) => index % 3);
const guidanceBasis = ["data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json", "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json"];

function sourceIdsFromOld(question) { return [...new Set((question.source || []).map((url) => sourceUrlToId.get(url)).filter(Boolean))]; }
function old(index, overrides = {}) {
  const source = oldQuestions[index - 1];
  if (!source) throw new Error(`Mangler gammelt spørsmål ${index}`);
  return { question: source.question, options: [...source.options], answer: source.answer, statement: source.knowledge, question_type: "fact", difficulty: source.difficulty || 1, emne_id: source.emne_id, source_ids: sourceIdsFromOld(source), ...overrides };
}
function custom({ question, answer, distractors, statement, emne_id, source_ids, question_type = "fact", difficulty = 1, ...rest }) {
  return { question, options: [answer, ...distractors], answer, statement, question_type, difficulty, emne_id, source_ids, ...rest };
}

const specs = [
  old(1, { source_ids: ["place_record", "oslo_byleksikon_tollbukaia", "oslo_byleksikon_tollbubrygga"] }),
  old(2, { source_ids: ["oslo_byleksikon_tollbukaia"] }),
  old(3, { source_ids: ["place_record", "oslo_byleksikon_tollboden", "oslo_byleksikon_tollbubrygga"] }),
  old(4, { source_ids: ["oslo_byleksikon_tollbugata", "oslo_byleksikon_tollboden"] }),
  old(5, { source_ids: ["oslo_byleksikon_tollbugata"] }),
  old(7, { source_ids: ["oslo_byleksikon_tollboden"] }),
  old(8, { source_ids: ["oslo_byleksikon_tollboden"] }),
  old(9, { source_ids: ["oslo_byleksikon_tollboden", "oppdag_kvadraturen"] }),
  old(10, { source_ids: ["oslo_byleksikon_tollboden", "oppdag_kvadraturen"] }),
  old(11, { source_ids: ["oslo_byleksikon_tollboden", "oppdag_kvadraturen"] }),
  old(13, { source_ids: ["oslo_byleksikon_tollboden", "snl_tollmuseum", "oppdag_kvadraturen"] }),
  old(14, { source_ids: ["oslo_byleksikon_tollboden", "snl_tollmuseum", "oppdag_kvadraturen"] }),
  old(15, { source_ids: ["oslo_byleksikon_tollboden", "oppdag_kvadraturen", "snl_tollmuseum"] }),
  old(16, { source_ids: ["oslo_byleksikon_tollboden", "oppdag_kvadraturen"] }),
  old(17, { source_ids: ["oslo_byleksikon_tollboden", "snl_tollmuseum"] }),
  old(18, { source_ids: ["oslo_byleksikon_tollboden", "snl_tollmuseum"] }),
  old(19, { source_ids: ["oslo_byleksikon_tollbubrygga", "oslo_byleksikon_tollbukaia"] }),
  old(20, { source_ids: ["oslo_byleksikon_tollbubrygga", "oslo_byleksikon_tollboden"] }),
  old(21, { source_ids: ["oslo_byleksikon_tollbubrygga"] }),
  old(22, { source_ids: ["oslo_byleksikon_tollbubrygga"] }),
  old(23, { source_ids: ["oslo_byleksikon_tollbubrygga", "oslo_byleksikon_tollboden"] }),
  old(25, { source_ids: ["cruise_terminal", "oslo_kommune"] }),
  old(26, { source_ids: ["tolletaten", "oslo_kommune"] }),
  old(27, { source_ids: ["tolletaten"] }),
  old(28, { source_ids: ["oslo_kommune"] }),
  old(29, { source_ids: ["oslo_kommune"] }),
  custom({ question: "Hva gjorde kombinasjonen av brygge, tollbod og pakkhus mulig?", answer: "At varer kunne losses, lagres og kontrolleres i samme havneområde", distractors: ["At tog kunne repareres utenfor byen", "At kullgass kunne produseres til gatebelysning"], statement: "Brygge, tollbod og pakkhus samlet lossing, lagring og tollkontroll i ett sammenhengende havnesystem.", emne_id: "em_naering_logistikk_verdikjeder", source_ids: ["oslo_byleksikon_tollboden", "oslo_byleksikon_tollbubrygga", "oppdag_kvadraturen"], question_type: "context", difficulty: 2 }),
  custom({ question: "Hva var den viktigste følgen av gjenfyllingen innerst i Bjørvika 1957–1960?", answer: "Den tradisjonelle havnetrafikken på Tollbubrygga opphørte", distractors: ["Norsk Tollmuseum åpnet for første gang", "Tollboden ble flyttet til Aker Brygge"], statement: "Gjenfyllingen innerst i Bjørvika 1957–60 avsluttet havnetrafikken på Tollbubrygga og åpnet for senere funksjonsendringer.", emne_id: "em_naering_omstilling_kriser_skift", source_ids: ["oslo_byleksikon_tollbubrygga", "oslo_byleksikon_tollboden"], question_type: "context", difficulty: 2 }),
  custom({ question: "Hvorfor lå tollfunksjonene tett ved brygga?", answer: "For å kontrollere varer nær stedet der de kom i land", distractors: ["For å produsere elektrisitet fra tidevann", "For å holde passasjertog utenfor sentrum"], statement: "Plasseringen ved brygga gjorde det mulig å kontrollere varer ved ankomst før de gikk videre inn i byen.", emne_id: "em_naering_teknologi_infrastruktur", source_ids: ["oslo_byleksikon_tollbukaia", "oslo_byleksikon_tollbubrygga", "oslo_byleksikon_tollboden"], question_type: "analysis", difficulty: 2, method_id: "met_naering_infrastrukturanalyse" }),
  custom({ question: "Hva er den tydeligste kontinuiteten mellom historiske Tollbukaia og Tolletatens Utstikker II?", answer: "Offentlig kontroll og klarering av varer ved havna", distractors: ["Produksjon av bygass til byen", "Vedlikehold av lokomotiver og vogner"], statement: "Selv om bygninger og kaier har endret seg, finnes tollklarering og offentlig varekontroll fortsatt ved Oslo havn.", emne_id: "em_naering_logistikk_verdikjeder", source_ids: ["oslo_byleksikon_tollboden", "tolletaten"], question_type: "analysis", difficulty: 2, method_id: "met_naering_arbeidslivsanalyse" }),
  custom({ question: "Hva viser Tollpakkhusets skifte fra lager og museum til kontorer?", answer: "At en havnebygning kan få nye arbeids- og bruksformer uten å forsvinne", distractors: ["At all tollvirksomhet ble flyttet til jernbanen", "At bygningen igjen ble brukt som hovedbrygge"], statement: "Tollpakkhuset har gått fra lager til museum og videre til kontorer, og viser funksjonell ombruk over tid.", emne_id: "em_naering_omstilling_kriser_skift", source_ids: ["oslo_byleksikon_tollboden", "snl_tollmuseum", "oppdag_kvadraturen"], question_type: "analysis", difficulty: 2, method_id: "met_naering_arbeidslivsanalyse" }),
  custom({ question: "Hva viser overgangen fra hovedbrygge til cruise, service og publikumsrettet havnefront?", answer: "At havneområdet har gått fra varetransport mot flere tjeneste- og opplevelsesfunksjoner", distractors: ["At området har blitt et lukket kullager", "At all aktivitet er erstattet av boliger uten havnebruk"], statement: "Cruiseterminal, service og Fjordbyen-planer viser en forskyvning fra ren varehavn mot tjenester, besøk og offentlig bruk.", emne_id: "em_naering_forbruk_marked", source_ids: ["oslo_byleksikon_tollbubrygga", "cruise_terminal", "oslo_kommune"], question_type: "analysis", difficulty: 3, method_id: "met_naering_forbruker_og_atferdsanalyse" }),
  custom({ question: "Hvorfor kan bevarte toll- og pakkhusbygninger ha økonomisk verdi i dagens havnefront?", answer: "De kan romme nye virksomheter samtidig som stedets historie gir særpreg", distractors: ["De hindrer all ny bruk av området", "De kan bare brukes til historiske tollkontroller"], statement: "Ombruk av Tollpakkhuset og andre havnebygg kombinerer nye funksjoner med historisk identitet og stedskvalitet.", emne_id: "em_naering_kapital_finans", source_ids: ["oslo_byleksikon_tollboden", "oppdag_kvadraturen", "oslo_kommune"], question_type: "analysis", difficulty: 3, method_id: "met_naering_verdiskapingsanalyse" }),
  custom({ question: "Hvilken avveining preger utviklingen av Akershusstranda?", answer: "Å kombinere operative havne- og tollfunksjoner med rekreasjon og offentlig tilgang", distractors: ["Å erstatte sjøfronten med et lukket jernbaneverksted", "Å fjerne alle tjenester og all ferdsel fra området"], statement: "Akershusstranda skal fortsatt håndtere havne-, cruise- og tollfunksjoner samtidig som Fjordbyen åpner for mer rekreasjon og publikumstilgang.", emne_id: "em_naering_forbruk_marked", source_ids: ["tolletaten", "cruise_terminal", "oslo_kommune"], question_type: "analysis", difficulty: 3, method_id: "met_naering_infrastrukturanalyse" }),
  custom({ question: "Hva viser samlingen av brygge, pakkhus, tollbod og dokumentkontroll?", answer: "At varehandelen ble organisert som et koordinert og standardisert system", distractors: ["At varene gikk rett inn i byen uten kontroll", "At området først og fremst var planlagt som boligstrøk"], statement: "Tollbukaia samlet fysisk vareflyt, lagring, kontroll og dokumentasjon i et koordinert system for handel.", emne_id: "em_naering_arbeid_verdiskaping", source_ids: ["oslo_byleksikon_tollbukaia", "oslo_byleksikon_tollbubrygga", "oslo_byleksikon_tollboden", "tolletaten"], question_type: "analysis", difficulty: 3, method_id: "met_naering_arbeidslivsanalyse", topic_hook_id: "arbeid_som_verdiskaping", thinker_id: "max_weber", thinker_name: "Max Weber", theory_focus: "rasjonalisering og organisering", theory_ref: { topic_hook_id: "arbeid_som_verdiskaping", why_it_helps: "Webers perspektiv på rasjonalisering gjør det mulig å forstå Tollbukaia som et standardisert system for vareflyt, kontroll, dokumentasjon og arbeid." } })
];

if (specs.length !== 35) throw new Error(`Forventet 35 spørsmål, fikk ${specs.length}`);
const sourceOrigin = (sourceIds) => sourceIds.includes("place_record") ? "mixed" : "external";
const familyFor = (spec) => spec.method_id || spec.topic_hook_id || spec.theory_ref ? "concept_theory" : ["context", "comparison"].includes(spec.question_type) ? "context" : "fact";
const claims = specs.map((spec, index) => ({ claim_id: `claim_tollbukaia_${String(index + 1).padStart(2, "0")}`, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: familyFor(spec), statement: spec.statement, source_ids: spec.source_ids, source_origin: sourceOrigin(spec.source_ids), emne_id: spec.emne_id }));

const brief = { schema_version: "1.0", status: "reviewed", categoryId, targetId, reviewed_at: "2026-07-24", review_note: "Påstandsbanken bygger på den eksisterende Tollbukaia-quizen og de allerede registrerte byhistoriske, statlige og kommunale kildene. Fire meta-, flatquiz- eller lavverdispørsmål er fjernet, mens de første 14 påstandene er låst til normal quizform uten metode- eller teoribinding.", profile_hint: "rich", sources, selected_curriculum: { module_ids: [], emne_ids: ["em_naering_arbeid_verdiskaping", "em_naering_forbruk_marked", "em_naering_kapital_finans", "em_naering_logistikk_verdikjeder", "em_naering_omstilling_kriser_skift", "em_naering_teknologi_infrastruktur"], topic_hook_ids: ["arbeid_som_verdiskaping"], method_ids: ["met_naering_arbeidslivsanalyse", "met_naering_forbruker_og_atferdsanalyse", "met_naering_infrastrukturanalyse", "met_naering_verdiskapingsanalyse"], thinker_ids: ["max_weber"], works: [] }, claims };
await mkdir(path.dirname(path.resolve(root, briefPath)), { recursive: true });
await writeFile(path.resolve(root, briefPath), `${JSON.stringify(brief, null, 2)}\n`, "utf8");

const manifest = JSON.parse(await readFile(path.resolve(root, manifestPath), "utf8"));
manifest.naeringsliv.quizProduction.targets[targetId] = { source_brief: "../quiz/production_briefs/naeringsliv/tollbukaia.json", context_artifact: "../quiz/production_context/naeringsliv/tollbukaia.json", quiz_file: "../quiz/naeringsliv/tollbukaia_sets_merged.json" };
await writeFile(path.resolve(root, manifestPath), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
const context = await buildQuizProductionContext({ root, categoryId, targetId });
await mkdir(path.dirname(path.resolve(root, contextPath)), { recursive: true });
await writeFile(path.resolve(root, contextPath), `${JSON.stringify(context, null, 2)}\n`, "utf8");

function buildOptions(spec, answerIndex) { const distractors = spec.options.filter((option) => option !== spec.answer); if (distractors.length !== 2) throw new Error(`Spørsmålet har ikke to unike distraktorer: ${spec.question}`); const options = [...distractors]; options.splice(answerIndex, 0, spec.answer); return options; }
const sets = Array.from({ length: 5 }, (_, setIndex) => ({ set_id: `naeringsliv_tollbukaia_set_${setIndex + 1}`, level: setIndex + 1, order: setIndex + 1, phase: phases[setIndex], questions: specs.slice(setIndex * 7, (setIndex + 1) * 7).map((spec, localIndex) => { const index = setIndex * 7 + localIndex; const answerIndex = answerPattern[index]; const question = { id: `tollbukaia_quiz_${index + 1}`, quiz_id: `naeringsliv_tollbukaia_set_${setIndex + 1}_q${localIndex + 1}`, categoryId, placeId: targetId, targetId, question_scope: "place", question: spec.question, options: buildOptions(spec, answerIndex), answer: spec.answer, answerIndex, knowledge: spec.statement, difficulty: spec.difficulty, question_type: spec.question_type, emne_id: spec.emne_id, source: spec.source_ids, source_origin: sourceOrigin(spec.source_ids), claim_basis: spec.statement, claim_id: claims[index].claim_id }; for (const key of ["method_id", "topic_hook_id", "thinker_id", "thinker_name", "theory_focus", "theory_ref"]) if (spec[key] !== undefined) question[key] = spec[key]; if (spec.method_id || spec.topic_hook_id || spec.theory_ref) question.guidance_basis = guidanceBasis; return question; }) }));
const quiz = { targetId, categoryId, sources: Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, source.url])), production_context: { manifest_category: categoryId, profile: context.profile, standard_version: "3.0", source_brief: briefPath, context_artifact: contextPath, resolved_files: Object.fromEntries(Object.entries(context.resolved_files).map(([key, record]) => [key, record.path])), required_inputs_loaded: context.required_inputs_loaded, pensum_module_ids: context.selected_curriculum.module_ids, emne_ids: context.selected_curriculum.emne_ids, topic_hook_ids: context.selected_curriculum.topic_hook_ids, method_ids: context.selected_curriculum.method_ids, thinker_ids: context.selected_curriculum.thinker_ids, works: context.selected_curriculum.works, source_review_status: context.source_review_status, method_start_phase: "final", theory_start_phase: "final" }, sets };
await writeFile(path.resolve(root, quizPath), `${JSON.stringify(quiz, null, 2)}\n`, "utf8");
let testText = await readFile(path.resolve(root, testPath), "utf8");
if (!testText.includes("assert.equal(report.quizFilesChecked, 8);")) throw new Error("Fant ikke forventet quizFilesChecked=8 i produksjonstesten");
testText = testText.replace("assert.equal(report.quizFilesChecked, 8);", "assert.equal(report.quizFilesChecked, 9);");
await writeFile(path.resolve(root, testPath), testText, "utf8");
const flattened = sets.flatMap((set) => set.questions);
const answerCounts = [0, 1, 2].map((answerIndex) => flattened.filter((question) => question.answerIndex === answerIndex).length);
if (answerCounts.join("/") !== "12/12/11") throw new Error(`Feil svarbalanse: ${answerCounts.join("/")}`);
if (flattened.slice(0, 14).some((question) => question.method_id || question.topic_hook_id || question.thinker_id || question.theory_ref)) throw new Error("De første 14 spørsmålene inneholder metode- eller teoribinding");
console.log(JSON.stringify({ questions: flattened.length, answerCounts, profile: context.profile }, null, 2));
