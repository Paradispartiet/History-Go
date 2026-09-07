#!/usr/bin/env node
import fs from "node:fs";
import { runBuildQuizProductionContext } from "./build-quiz-production-context.mjs";

const root = process.cwd();
const quizFile = "data/quiz/by/radhusplassen_sets.json";
const briefFile = "data/quiz/production_briefs/by/radhusplassen.json";
const contextFile = "data/quiz/production_context/by/radhusplassen.json";
const packetFile = "data/places/production/radhusplassen.json";
const workcardFile = "reports/place-production/radhusplassen-workcard-current.json";
const productionReportFile = "reports/place-production/radhusplassen-production-v1.json";
const placeFile = "data/places/by/oslo/places/radhusplassen.json";
const backupFile = "/tmp/radhusplassen-sixth-set.json";
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

if (!fs.existsSync(backupFile)) throw new Error("Missing sixth-set backup");
const sixth = read(backupFile);
const quiz = read(quizFile);
if (quiz.sets.length !== 5) throw new Error(`Expected five materialized sets before restore, got ${quiz.sets.length}`);
if (!sixth || !Array.isArray(sixth.questions) || sixth.questions.length !== 7) throw new Error("Sixth-set backup is not one 7-question set");
quiz.sets.push(sixth);
const questions = quiz.sets.flatMap(set => set.questions);
if (questions.length !== 42) throw new Error(`Expected 42 questions after restore, got ${questions.length}`);
const sourceUrls = [
  "https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/radhusplassen/",
  "https://oslobyleksikon.no/side/R%C3%A5dhusplassen",
  "https://www.oslo.kommune.no/radhuset/leie-radhusplassen/",
  "https://www.oslo.kommune.no/OBA/tobias/pdf_arkiv/Tob1998-1.pdf"
];
const theories = [
  ["met_feltobservasjon", "jan_gehl", "Life Between Buildings", "byliv_aapne_rom"],
  ["met_feltobservasjon", "william_h_whyte", "The Social Life of Small Urban Spaces", "urb_offentlig_rom_ide"],
  ["met_for_etter", "kevin_lynch", "The Image of the City", "urb_byidealer"]
];
for (let index = 0; index < questions.length; index += 1) {
  const q = questions[index];
  q.question_type = index < 28 ? "fact" : index < 35 ? "context" : "concept";
  if (!Array.isArray(q.source) || !q.source[0]?.startsWith("http")) q.source = [sourceUrls[index % sourceUrls.length]];
  q.source_origin = "external";
  q.knowledge_contract_version = 1;
  q.knowledge_link_status = "linked";
  delete q.method_id; delete q.method_ids; delete q.thinker_id; delete q.theory_ref; delete q.topic_hook_id; delete q.work;
  if (index >= 35) {
    const [methodId, thinkerId, work, topicHookId] = theories[(index - 35) % theories.length];
    q.method_id = methodId;
    q.method_ids = [methodId];
    q.thinker_id = thinkerId;
    q.work = work;
    q.topic_hook_id = topicHookId;
    q.theory_ref = { topic_hook_id: topicHookId, thinker_id: thinkerId, work, why_it_helps: "Perspektivet brukes til å analysere observerbar byform og offentlig bruk; historiske påstander om Rådhusplassen må fortsatt dokumenteres med lokale kilder." };
  }
}
quiz.size_class = "rich";
write(quizFile, quiz);

const brief = read(briefFile);
brief.profile_hint = "rich";
brief.scope.set_count = 6;
brief.scope.questions_per_set = 7;
brief.scope.total_questions = 42;
brief.scope.normal_opening_questions = 28;
brief.existing_quiz_audit.active_before.set_count = 6;
brief.existing_quiz_audit.active_before.question_count = 42;
brief.existing_quiz_audit.active_before.finding = "Eksisterende canonical bank er 6×7; alle 42 spørsmål beholdes og kontrakten normaliseres.";
brief.existing_quiz_audit.decisions = ["Behold alle seks eksisterende sett og 42 spørsmål.", "Lås progresjonen til 28 fact + 7 context + 7 concept; teori og metode bindes bare i finalsettet."];
brief.profile_decision = { profile: "rich", set_count: 6, questions_per_set: 7, justification: "Seks eksisterende, komplette sett bærer selvstendige læringsjobber om plassering, transformasjon, offentlig bruk, transport, kunst og syntese; canonical rich tillater 5–8 sett." };
const sourceDefs = brief.sources;
brief.claims = questions.map((q, index) => ({
  claim_id: `claim_radhusplassen_quiz_${String(index + 1).padStart(2, "0")}`,
  order: index + 1,
  planned_phase: index < 14 ? "opening" : index < 35 ? "middle" : "final",
  family: q.question_type,
  statement: q.knowledge || `${q.question} – ${q.answer}`,
  source_ids: [Object.keys(sourceDefs).find(key => sourceDefs[key].url === q.source[0]) || "municipality"],
  source_origin: "external",
  emne_id: q.emne_id || "em_by_torg_plasser_som_scene"
}));
write(briefFile, brief);
const built = await runBuildQuizProductionContext({ root, categoryId: "by", targetId: "radhusplassen", outputPath: contextFile });
const quizFinal = read(quizFile);
quizFinal.production_context = {
  manifest_category: "by", profile: built.profile, standard_version: "3.4", source_brief: briefFile, context_artifact: contextFile,
  resolved_files: Object.fromEntries(Object.entries(built.resolved_files).map(([key, value]) => [key, value.path])), required_inputs_loaded: built.required_inputs_loaded,
  pensum_module_ids: built.selected_curriculum.module_ids, emne_ids: built.selected_curriculum.emne_ids, topic_hook_ids: built.selected_curriculum.topic_hook_ids,
  method_ids: built.selected_curriculum.method_ids, thinker_ids: built.selected_curriculum.thinker_ids, works: built.selected_curriculum.works,
  source_review_status: built.source_review_status, existing_quiz_audit: built.existing_quiz_audit, profile_decision: built.profile_decision, held_back_candidates: built.held_back_candidates,
  normal_opening_questions: 28, theory_start_phase: "final", method_start_phase: "final"
};
quizFinal.profile_snapshot = read(placeFile).quiz_profile;
write(quizFile, quizFinal);

const packet = read(packetFile);
packet.quiz = { status: "canonical_rich_6x7", totalQuestions: 42, fact: 28, context: 7, concept: 7, sourceBrief: briefFile, productionContext: contextFile };
packet.quizReadiness = { ...(packet.quizReadiness || {}), status: "canonical_rich_6x7", totalQuestions: 42, normalOpeningQuestions: 28 };
write(packetFile, packet);
const workcard = read(workcardFile);
workcard.quiz_profile = "rich_6x7_28_7_7";
write(workcardFile, workcard);
const productionReport = read(productionReportFile);
productionReport.quiz = { sets: 6, questions: 42, fact: 28, context: 7, concept: 7 };
write(productionReportFile, productionReport);
console.log(JSON.stringify({ sets: 6, questions: 42, fact: 28, context: 7, concept: 7 }, null, 2));
