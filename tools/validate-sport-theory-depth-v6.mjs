#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
const paths = {
  emner: "data/fag/sport/emner_sport_canonical_v4_5.json",
  hooks: "data/fag/sport/theory_hooks_sport_canonical_v5.json",
  thinkers: "data/fag/sport/teoretikere_sport_canonical_v5.json",
  claims: "data/fag/sport/claims_sport_canonical_v1.json",
  units: "data/fag/sport/theory_units_sport_canonical_v6.json",
  matrix: "data/fag/sport/emne_theory_coverage_sport_v6.json",
  manifest: "data/fag/sport/sport_theory_depth_manifest_v6.json",
  qualityManifest: "data/fag/sport/sport_quality_manifest_v5.json",
  evidenceManifest: "data/fag/sport/sport_scientific_evidence_manifest_v1.json",
  profile: "data/fag/sport/supersetQUIZMAL_sport.json",
  report: "reports/sport-theory-depth-validation.json"
};

const [emners, hookFile, thinkerFile, claimFile, unitFile, matrixFile, manifest, qualityManifest, evidenceManifest, profile] = await Promise.all([
  readJson(paths.emners), readJson(paths.hooks), readJson(paths.thinkers), readJson(paths.claims),
  readJson(paths.units), readJson(paths.matrix), readJson(paths.manifest), readJson(paths.qualityManifest),
  readJson(paths.evidenceManifest), readJson(paths.profile)
]);

const failures = [];
const require = (condition, message, details = undefined) => {
  if (!condition) failures.push(details === undefined ? { message } : { message, details });
};
const uniqueIds = (items, key, label) => {
  const ids = items.map((item) => item?.[key]);
  require(ids.every((id) => typeof id === "string" && id.trim()), `${label}: ugyldig ${key}`);
  require(new Set(ids).size === ids.length, `${label}: dupliserte ${key}`);
  return new Set(ids);
};
const resolveRefs = (items, key, known, label, idKey) => {
  for (const item of items) {
    const raw = item?.[key];
    const refs = raw == null ? [] : (Array.isArray(raw) ? raw : [raw]);
    for (const ref of refs) {
      require(known.has(ref), `${label}: ukjent ${key}`, { item: item[idKey], ref });
    }
  }
};

const activeEmners = emners.filter((item) => item.status === "active" || item.canonical_status === "canonical");
const hooks = hookFile.hooks || [];
const thinkers = thinkerFile.thinkers || [];
const claims = claimFile.claims || [];
const units = unitFile.theory_units || [];
const matrix = matrixFile.emners || [];

const activeEmneIds = uniqueIds(activeEmners, "emne_id", "aktive emner");
const hookIds = uniqueIds(hooks, "hook_id", "hooks");
const thinkerIds = uniqueIds(thinkers, "thinker_id", "teoretikere");
const claimIds = uniqueIds(claims, "claim_id", "claims");
const unitIds = uniqueIds(units, "theory_unit_id", "teorienheter");
const matrixEmneIds = uniqueIds(matrix, "emne_id", "emnematrise");

require(matrix.length === activeEmners.length, "matrisen dekker ikke alle aktive emner", { active: activeEmners.length, mapped: matrix.length });
for (const id of activeEmneIds) require(matrixEmneIds.has(id), "aktivt emne mangler i matrisen", id);
for (const id of matrixEmneIds) require(activeEmneIds.has(id), "matrisen inneholder ukjent eller inaktivt emne", id);

require(units.length === hooks.length, "antall teorienheter matcher ikke antall hooks", { hooks: hooks.length, units: units.length });
resolveRefs(units, "hook_id", hookIds, "teorienhet", "theory_unit_id");
resolveRefs(units, "main_thinker_ids", thinkerIds, "teorienhet", "theory_unit_id");
resolveRefs(units, "rival_thinker_ids", thinkerIds, "teorienhet", "theory_unit_id");
resolveRefs(units, "evidence_claim_ids", claimIds, "teorienhet", "theory_unit_id");
resolveRefs(matrix, "primary_hook_ids", hookIds, "emnematrise", "emne_id");
resolveRefs(matrix, "secondary_hook_ids", hookIds, "emnematrise", "emne_id");
resolveRefs(matrix, "theory_unit_ids", unitIds, "emnematrise", "emne_id");
resolveRefs(matrix, "evidence_claim_ids", claimIds, "emnematrise", "emne_id");
resolveRefs(claims, "theory_hook_ids", hookIds, "claim", "claim_id");
resolveRefs(claims, "theory_unit_ids", unitIds, "claim", "claim_id");

for (const unit of units) {
  require(typeof unit.main_theory === "string" && unit.main_theory.length >= 8, "teorienhet mangler hovedteori", unit.theory_unit_id);
  require(typeof unit.rival_or_alternative === "string" && unit.rival_or_alternative.length >= 8, "teorienhet mangler rival", unit.theory_unit_id);
  require(typeof unit.mechanism === "string" && unit.mechanism.length >= 35, "teorienhet mangler mekanisme", unit.theory_unit_id);
  require((unit.primary_works || []).length >= 1, "teorienhet mangler primærverk", unit.theory_unit_id);
  require((unit.criticism || []).length >= 2, "teorienhet mangler kritikk", unit.theory_unit_id);
  require((unit.boundary_conditions || []).length >= 2, "teorienhet mangler bruksgrenser", unit.theory_unit_id);
  require((unit.discriminating_evidence || []).length >= 2, "teorienhet mangler skilleevidens", unit.theory_unit_id);
  require((unit.question_operations || []).length >= 4, "teorienhet mangler analytiske operasjoner", unit.theory_unit_id);
  require((unit.main_thinker_ids || []).length >= 1, "teorienhet mangler hovedteoretiker", unit.theory_unit_id);
  require((unit.rival_thinker_ids || []).length >= 1, "teorienhet mangler rivaliserende teoretiker", unit.theory_unit_id);
}

const unitByHook = new Map(units.map((unit) => [unit.hook_id, unit]));
const genericMove = "Start med en dokumentert situasjon, arena, regel, treningspraksis, organisasjon eller hendelse.";
for (const hook of hooks) {
  const unit = unitByHook.get(hook.hook_id);
  require(Boolean(unit), "hook mangler teorienhet", hook.hook_id);
  require(hook.theory_unit_id === unit?.theory_unit_id, "hook peker til feil teorienhet", hook.hook_id);
  require(hook.theory_depth_version === "6.0", "hook mangler V6-versjon", hook.hook_id);
  require((hook.question_moves || []).length >= 4, "hook mangler hook-spesifikke question moves", hook.hook_id);
  require(!(hook.question_moves || []).includes(genericMove), "generisk question move er ikke erstattet", hook.hook_id);
  require((hook.question_moves || []).some((move) => move.includes(unit?.main_theory || "__missing__")), "question moves nevner ikke hovedteorien", hook.hook_id);
  require((hook.question_moves || []).some((move) => move.includes(unit?.rival_or_alternative || "__missing__")), "question moves nevner ikke rivalen", hook.hook_id);
}

for (const entry of matrix) {
  require((entry.primary_hook_ids || []).length >= 2, "emne har færre enn to primære hooks", entry.emne_id);
  require((entry.theory_unit_ids || []).length >= 2, "emne har færre enn to teorienheter", entry.emne_id);
  require((entry.main_theories || []).length >= 2, "emne mangler hovedteorier", entry.emne_id);
  require((entry.rival_theories || []).length >= 2, "emne mangler rivalteorier", entry.emne_id);
  require((entry.primary_work_refs || []).length >= 1, "emne mangler primærverkskobling", entry.emne_id);
  require(entry.theory_coverage_status !== "insufficient_theory_coverage", "emne har utilstrekkelig teoridekning", entry.emne_id);
}

for (const thinker of thinkers) {
  const works = thinker.selected_works || [];
  require(["primary_source_ready", "practice_context_only", "contextual_until_work_documented"].includes(thinker.theory_readiness), "teoretiker mangler gyldig theory_readiness", thinker.thinker_id);
  require(thinker.work_documentation_count === works.length, "teoretiker har feil verkopptelling", thinker.thinker_id);
  if (works.length === 0) require(thinker.direct_theory_use_allowed === false, "person uten verk er feilaktig direkte teori-autoritet", thinker.thinker_id);
  if (thinker.direct_theory_use_allowed) require(thinker.figure_type === "scholar" && works.length > 0, "direkte teoribruk uten scholar + verk", thinker.thinker_id);
}

for (const claim of claims) {
  require((claim.theory_hook_ids || []).length >= 1, "claim mangler teorihook", claim.claim_id);
  require((claim.theory_unit_ids || []).length >= 1, "claim mangler teorienhet", claim.claim_id);
  require(claim.theory_coverage_status === "mapped_v6", "claim mangler V6-dekningsstatus", claim.claim_id);
}

require(evidenceManifest.status === "canonical_scientific_evidence_layer_partial_coverage", "evidensmanifestet påstår feilaktig full dekning");
require(evidenceManifest.coverage_status?.state === "partial", "evidensmanifestet mangler partial-status");
require(evidenceManifest.coverage_status?.hooks_total === hooks.length, "evidensmanifestet har feil hook-antall");
require(evidenceManifest.integration?.theory_depth_manifest === "sport_theory_depth_manifest_v6.json", "evidensmanifestet mangler V6-integrasjon");
require(profile.theory_depth_layer?.version === "6.0", "quizprofilen mangler V6-teorilag");
require(profile.theory_depth_layer?.required_for_all_sport_questions === true, "quizprofilen krever ikke teorienhet");
require(profile.evidence_layer?.coverage_status === "partial_until_all_theory_hooks_have_claim_chains", "quizprofilen overdriver evidensdekningen");
require(qualityManifest.version === "6.0", "quality manifest er ikke V6");
require(qualityManifest.theory_depth_layer?.manifest === "sport_theory_depth_manifest_v6.json", "quality manifest mangler V6-manifest");

const mappedWithEvidence = matrix.filter((entry) => (entry.evidence_claim_ids || []).length >= 1).length;
const hooksWithEvidence = units.filter((unit) => (unit.evidence_claim_ids || []).length >= 1).length;
const counts = {
  active_emners: activeEmners.length,
  mapped_emners: matrix.length,
  theory_hooks: hooks.length,
  theory_units: units.length,
  claims: claims.length,
  hooks_with_evidence_claims: hooksWithEvidence,
  emners_with_evidence_claims: mappedWithEvidence,
  thinkers_total: thinkers.length,
  thinkers_with_documented_works: thinkers.filter((item) => item.work_documentation_count > 0).length,
  thinkers_contextual_or_practice: thinkers.filter((item) => item.work_documentation_count === 0).length
};

for (const [key, value] of Object.entries(manifest.counts || {})) {
  if (key in counts) require(value === counts[key], "V6-manifest har feil opptelling", { key, expected: counts[key], actual: value });
}

const report = {
  status: failures.length ? "failed" : "passed",
  version: "6.0",
  subject_id: "sport",
  counts,
  gates: {
    every_active_emne_mapped: matrix.length === activeEmners.length && activeEmners.every((item) => matrixEmneIds.has(item.emne_id)),
    every_emne_has_two_primary_hooks: matrix.every((entry) => entry.primary_hook_ids?.length >= 2),
    every_hook_has_complete_theory_unit: units.length === hooks.length && units.every((unit) => unit.main_theory && unit.rival_or_alternative && unit.mechanism),
    every_unit_has_primary_work: units.every((unit) => unit.primary_works?.length >= 1),
    generic_question_moves_replaced: hooks.every((hook) => !(hook.question_moves || []).includes(genericMove)),
    thinkers_without_works_not_direct_authority: thinkers.filter((item) => item.work_documentation_count === 0).every((item) => item.direct_theory_use_allowed === false),
    all_claims_mapped_to_theory_units: claims.every((claim) => claim.theory_unit_ids?.length >= 1),
    evidence_layer_explicitly_partial: evidenceManifest.coverage_status?.state === "partial",
    all_references_resolve: !failures.some((failure) => failure.message?.includes("ukjent"))
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
  await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
