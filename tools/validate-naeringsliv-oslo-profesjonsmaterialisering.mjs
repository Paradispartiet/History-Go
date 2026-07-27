#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const unique = (values) => new Set(values).size === values.length;
const manifest = readJson("data/fag/naeringsliv/profesjonsmaterialisering_oslo_pilot_v1.json");
const moduleRegistry = readJson("data/fag/naeringsliv/handelshogskolemoduler_okonomi_og_naeringsliv_v1.json");
const validModules = new Set((moduleRegistry.modules || []).map((row) => row.module_id));
const forbiddenOpening = ["professional_module_id", "professional_operation", "calculation", "decision_context"];
const genericFragments = [
  "Hvordan kan stedet leses som",
  "Hva er den mest presise faglige lesningen",
  "Hvilket begrep beskriver best",
  "skille hovedmodell fra kritisk profesjonsperspektiv"
];

assert(manifest.status === "canonical_place_professional_materialization", "Pilot manifest is not canonical");
assert(manifest.coverage?.target_count === 3, "Pilot must contain exactly three targets");
assert(manifest.coverage?.professional_questions === 63, "Pilot must contain 63 professional questions");
assert(manifest.coverage?.scenario_currency === "NOK", "Pilot scenarios must use NOK");

let calculations = 0;
let questionCount = 0;
const allTexts = [];
for (const target of manifest.targets || []) {
  const place = readJson(target.place_file);
  const quiz = readJson(target.quiz_file);
  const brief = readJson(target.source_brief);
  const context = readJson(target.production_context);
  const quizContext = quiz.production_context || {};
  assert(place.id === target.target_id, `${target.target_id}: place id mismatch`);
  assert(typeof place.desc === "string" && place.desc.length >= 220, `${target.target_id}: desc is too thin`);
  assert(typeof place.popupDesc === "string" && place.popupDesc.length >= 800, `${target.target_id}: popupDesc is too thin`);
  assert((place.emne_ids || []).every((id) => /^em_naering_/.test(id)), `${target.target_id}: non-canonical emne id`);
  assert(!(place.emne_ids || []).some((id) => id.includes("_felt_") || id === "em_naering_geografi_infrastruktur"), `${target.target_id}: legacy emne id remains`);
  assert((quiz.sets || []).length === 5, `${target.target_id}: quiz must contain five sets`);
  assert((quiz.sets || []).every((set) => (set.questions || []).length === 7), `${target.target_id}: quiz must remain 5x7`);
  const opening = quiz.sets.slice(0, 2).flatMap((set) => set.questions);
  const professional = quiz.sets.slice(2).flatMap((set) => set.questions);
  assert(opening.length === 14 && professional.length === 21, `${target.target_id}: phase counts are wrong`);
  assert(opening.every((q) => forbiddenOpening.every((field) => !(field in q))), `${target.target_id}: opening contains professional fields`);
  assert(professional.every((q) => validModules.has(q.professional_module_id)), `${target.target_id}: unknown professional module`);
  assert(new Set(professional.map((q) => q.professional_module_id)).size >= 5, `${target.target_id}: too few professional modules`);
  assert(professional.every((q) => q.professional_materialization_version === manifest.materialization_version), `${target.target_id}: materialization version mismatch`);
  assert(professional.every((q) => typeof q.professional_operation === "string" && q.professional_operation.length >= 25), `${target.target_id}: thin professional operation`);
  assert(professional.every((q) => Array.isArray(q.source) && q.source.length >= 1 && q.source_origin !== "internal_only"), `${target.target_id}: weak source binding`);
  assert(professional.every((q) => typeof q.claim_id === "string" && typeof q.claim_basis === "string"), `${target.target_id}: missing claim binding`);
  assert(professional.every((q) => Array.isArray(q.guidance_basis) && q.guidance_basis.some((p) => p.includes("handelshogskolefordypning_"))), `${target.target_id}: missing professional guidance`);
  assert(professional.every((q) => !genericFragments.some((fragment) => q.question.includes(fragment))), `${target.target_id}: generic academic question remains`);
  assert(unique(professional.map((q) => q.question)), `${target.target_id}: duplicate professional questions`);
  assert((brief.professional_materialization?.module_ids || []).length >= 5, `${target.target_id}: brief lacks professional module selection`);
  assert(quizContext.professional_materialization_version === manifest.materialization_version, `${target.target_id}: quiz context lacks materialization`);
  const contextModules = quizContext.professional_module_ids || [];
  assert(contextModules.length >= 5 && contextModules.every((id) => validModules.has(id)), `${target.target_id}: context module binding invalid`);
  const briefClaims = new Set((brief.claims || []).map((row) => row.claim_id));
  assert(professional.every((q) => briefClaims.has(q.claim_id)), `${target.target_id}: quiz references unknown claim`);
  const targetCalculations = professional.filter((q) => q.calculation);
  assert(targetCalculations.length >= 5, `${target.target_id}: fewer than five calculations`);
  for (const q of targetCalculations) {
    assert(q.calculation.inputs && q.calculation.formula && q.calculation.result !== undefined && q.calculation.unit, `${q.id}: incomplete calculation`);
    const moneyText = `${q.question} ${q.knowledge} ${JSON.stringify(q.calculation)}`;
    const calculationKeys = Object.keys(q.calculation.inputs || {});
    const monetaryCalculation = calculationKeys.some((key) => /_nok$/i.test(key))
      || q.calculation.unit === "NOK"
      || /krone|NOK/i.test(`${q.question} ${q.knowledge}`);
    if (monetaryCalculation) {
      assert(/krone|NOK/i.test(moneyText), `${q.id}: monetary scenario lacks NOK/krone`);
    }
  }
  calculations += targetCalculations.length;
  questionCount += professional.length;
  allTexts.push(...professional.map((q) => q.question));
}
assert(questionCount === 63, "Expected 63 professional questions");
assert(unique(allTexts), "Professional question text must be unique across the pilot");
assert(calculations >= 15, "Expected at least 15 calculations across the pilot");
console.log(`OK: Næringsliv Oslo professional materialization validates (${questionCount} questions, ${calculations} calculations, 3 places).`);
