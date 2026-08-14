#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = path.resolve(SCRIPT_DIR, "..");

export const PATHS = Object.freeze({
  policy: "data/Civication/scenePipelinePolicyV1.json",
  contract: "data/Civication/sceneContractV1.schema.json",
  plans: "data/Civication/mailPlans",
  families: "data/Civication/mailFamilies",
  dayProgram: "data/Civication/mailDayProgram.json",
  mailRuntime: "js/Civication/systems/civicationMailRuntime.js",
  dailyBuilder: "js/Civication/systems/civicationDailyMailBuilder.js",
  civicationJs: "js/Civication"
});

const DEFAULT_LEGACY_PLAN_TYPES = Object.freeze([
  "job",
  "knowledge",
  "micro",
  "people",
  "conflict",
  "followup",
  "story",
  "event",
  "consequence"
]);

const SCENE_ENUMS = Object.freeze({
  domain: new Set(["work", "private", "life", "social", "system"]),
  scene_kind: new Set(["task", "relationship", "conflict", "knowledge", "consequence", "offer", "milestone"]),
  delivery: new Set(["mail", "meeting", "conversation", "task", "notification"]),
  day_phase: new Set(["morning", "forenoon", "workday", "lunch", "afternoon", "dinner", "evening", "day_end", "any"]),
  arc_stage: new Set(["intro", "early", "mid", "advanced", "mastery", "climax", "any"]),
  interaction_mode: new Set(["decision", "task", "ack", "info"]),
  knowledge_mode: new Set(["none", "pinned", "pinned_rules_dynamic_explanation"])
});

const SCENE_CONTAINER_KEYS = new Set([
  "mails",
  "threads",
  "scenes",
  "events",
  "storylets",
  "messages"
]);

const INTERNAL_REFERENCE_FIELDS = new Set([
  "source_mail_id",
  "next_scene_id",
  "followup_scene_id",
  "consequence_scene_id",
  "trigger_scene_id",
  "trigger_scene_ids",
  "opens_streams"
]);

function norm(value) {
  return String(value ?? "").trim();
}

function uniq(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];
}

function sorted(values) {
  return uniq(values).sort((a, b) => a.localeCompare(b, "nb"));
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null || value === "" ? [] : [value];
}

function relPath(root, absolute) {
  return path.relative(root, absolute).split(path.sep).join("/");
}

function absPath(root, relative) {
  return path.join(root, ...String(relative || "").split("/"));
}

function fileExists(root, relative) {
  return fs.existsSync(absPath(root, relative));
}

function walkFiles(root, relative = ".", predicate = () => true) {
  const start = absPath(root, relative);
  if (!fs.existsSync(start)) return [];
  const out = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      const entries = fs.readdirSync(current, { withFileTypes: true })
        .sort((a, b) => b.name.localeCompare(a.name, "en"));
      for (const entry of entries) stack.push(path.join(current, entry.name));
      continue;
    }
    const rel = relPath(root, current);
    if (predicate(rel)) out.push(rel);
  }
  return out.sort((a, b) => a.localeCompare(b, "en"));
}

function readText(root, relative) {
  try {
    return fs.readFileSync(absPath(root, relative), "utf8");
  } catch {
    return "";
  }
}

function readJsonResult(root, relative) {
  try {
    const text = fs.readFileSync(absPath(root, relative), "utf8");
    return { ok: true, value: JSON.parse(text), text, path: relative };
  } catch (error) {
    return {
      ok: false,
      value: null,
      text: "",
      path: relative,
      error: String(error?.message || error)
    };
  }
}

function extractConstStringArray(source, constName) {
  const escaped = String(constName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`(?:const|let|var)\\s+${escaped}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*;`));
  if (!match) return [];
  return uniq([...match[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((row) => row[1]));
}

function isSceneLike(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (!norm(value.id)) return false;
  return Boolean(
    value.subject ||
    value.title ||
    value.summary ||
    value.situation ||
    value.choices ||
    value.interaction_mode ||
    value.scene_kind ||
    value.mail_type ||
    value.message_type ||
    value.task_contract
  );
}

function formatKey(relative, json) {
  if (norm(json?.schema)) return `schema:${norm(json.schema)}`;
  if (Array.isArray(json)) return "schema-less:root-array";
  if (Array.isArray(json?.families)) return "schema-less:families";
  const knownRoot = [...SCENE_CONTAINER_KEYS].find((key) => Array.isArray(json?.[key]));
  if (knownRoot) return `schema-less:${knownRoot}`;
  const base = path.basename(relative).toLowerCase();
  if (base.includes("mail")) return "schema-less:mail-json";
  return "schema-less:other";
}

function isSceneSourceFile(relative, json) {
  const lowerPath = relative.toLowerCase();
  const schema = norm(json?.schema).toLowerCase();
  if (/\/(mail|mails|mailfamilies|mailplans|narratives|lifestory)\b/.test(`/${lowerPath}`)) return true;
  if (/(mail|scene|narrative|storylet|life)/.test(schema)) return true;
  if (Array.isArray(json)) return json.some(isSceneLike);
  return [...SCENE_CONTAINER_KEYS].some((key) => Array.isArray(json?.[key]));
}

function extractSceneRecords(relative, json) {
  const records = [];
  const seen = new WeakSet();
  const sourceFormat = formatKey(relative, json);

  function add(value, container, pointer) {
    if (!isSceneLike(value) || seen.has(value)) return;
    seen.add(value);
    records.push({
      id: norm(value.id),
      source_path: relative,
      source_format: sourceFormat,
      container,
      pointer,
      mail_type: norm(value.mail_type || value.message_type || value.type),
      mail_family: norm(value.mail_family),
      thread_id: norm(value.thread_id || value.thread_key),
      raw: value
    });
  }

  function visit(value, pointer = "$") {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${pointer}[${index}]`));
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      const childPointer = `${pointer}.${key}`;
      if (SCENE_CONTAINER_KEYS.has(key) && Array.isArray(child)) {
        child.forEach((item, index) => add(item, key, `${childPointer}[${index}]`));
      }
      visit(child, childPointer);
    }
  }

  if (Array.isArray(json)) {
    json.forEach((item, index) => add(item, "root", `$[${index}]`));
  } else {
    add(json, "root", "$");
  }
  visit(json);
  return records;
}

function collectAllIdentifiers(value, out = new Set()) {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    value.forEach((item) => collectAllIdentifiers(item, out));
    return out;
  }
  for (const [key, child] of Object.entries(value)) {
    if ((key === "id" || key.endsWith("_id") || key === "role_scope") && typeof child === "string" && norm(child)) {
      out.add(norm(child));
    }
    collectAllIdentifiers(child, out);
  }
  return out;
}

function collectInternalReferences(record) {
  const refs = [];
  const raw = record.raw || {};
  for (const field of INTERNAL_REFERENCE_FIELDS) {
    if (!(field in raw)) continue;
    for (const target of asArray(raw[field]).flatMap((value) => Array.isArray(value) ? value : [value])) {
      if (typeof target === "string" && norm(target)) refs.push({ field, target: norm(target) });
    }
  }

  const triggerMap = raw.triggers_on_choice;
  if (triggerMap && typeof triggerMap === "object" && !Array.isArray(triggerMap)) {
    for (const value of Object.values(triggerMap)) {
      for (const target of asArray(value)) {
        if (typeof target === "string" && norm(target)) refs.push({ field: "triggers_on_choice", target: norm(target) });
      }
    }
  }
  return refs;
}

function flattenCatalog(json, sourcePath) {
  const out = [];
  const families = Array.isArray(json?.families) ? json.families : [];
  const catalogType = norm(json?.mail_type);
  for (const family of families) {
    const familyId = norm(family?.id);
    for (const key of ["mails", "threads", "scenes", "events"]) {
      for (const item of Array.isArray(family?.[key]) ? family[key] : []) {
        if (!norm(item?.id)) continue;
        out.push({
          id: norm(item.id),
          mail_type: norm(item.mail_type || item.message_type || catalogType || key.replace(/s$/, "")),
          mail_family: norm(item.mail_family || familyId),
          role_scope: norm(item.role_scope || json?.role_scope),
          source_path: sourcePath,
          container: key
        });
      }
    }
  }
  for (const key of ["mails", "threads", "scenes", "events"]) {
    for (const item of Array.isArray(json?.[key]) ? json[key] : []) {
      if (!norm(item?.id)) continue;
      out.push({
        id: norm(item.id),
        mail_type: norm(item.mail_type || item.message_type || catalogType || key.replace(/s$/, "")),
        mail_family: norm(item.mail_family),
        role_scope: norm(item.role_scope || json?.role_scope),
        source_path: sourcePath,
        container: key
      });
    }
  }
  return out;
}

function candidateMatches(items, type, allowedFamilies, strictFamily = true) {
  const wantedType = norm(type);
  const allowed = allowedFamilies instanceof Set ? allowedFamilies : new Set(uniq(allowedFamilies));
  return items.filter((item) => {
    if (wantedType && norm(item.mail_type) !== wantedType) return false;
    if (strictFamily && allowed.size && !allowed.has(norm(item.mail_family))) return false;
    return true;
  });
}

function resolveStepLikeRuntime(plan, step, stepIndex, loadedItems) {
  const allowed = new Set(uniq(step?.allowed_families));
  const direct = candidateMatches(loadedItems, step?.type, allowed, true);
  if (direct.length) {
    return { kind: "direct", candidates: direct, source_step_index: stepIndex };
  }

  for (const fallbackType of uniq(step?.fallback_types)) {
    const strict = candidateMatches(loadedItems, fallbackType, allowed, true);
    if (strict.length) {
      return { kind: "fallback_strict", candidates: strict, source_step_index: stepIndex, fallback_type: fallbackType };
    }
    const anyFamily = candidateMatches(loadedItems, fallbackType, allowed, false);
    if (anyFamily.length) {
      return { kind: "fallback_any_family", candidates: anyFamily, source_step_index: stepIndex, fallback_type: fallbackType };
    }
  }

  const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
  for (let index = 0; index < sequence.length; index += 1) {
    if (index === stepIndex) continue;
    const other = sequence[index];
    const otherAllowed = new Set(uniq(other?.allowed_families));
    const cross = candidateMatches(loadedItems, other?.type, otherAllowed, true);
    if (cross.length) {
      return { kind: "cross_step", candidates: cross, source_step_index: index };
    }
  }

  return { kind: "none", candidates: [], source_step_index: null };
}

function detectAnswerWrappers(root) {
  const files = walkFiles(root, PATHS.civicationJs, (relative) => relative.endsWith(".js"));
  const wrappers = [];
  for (const relative of files) {
    const text = readText(root, relative);
    if (!text.includes("CivicationEventEngine")) continue;
    const assigns = /(?:\bproto\b|CivicationEventEngine\.prototype|\.prototype)\.answer\s*=/.test(text)
      || /\bprevious\s*=\s*proto\.answer\b/.test(text)
      || /\boriginalAnswer\s*=\s*proto\.answer\b/.test(text);
    if (!assigns) continue;
    wrappers.push(relative);
  }
  return sorted(wrappers);
}

function filesContaining(root, needle) {
  const files = walkFiles(root, PATHS.civicationJs, (relative) => relative.endsWith(".js"));
  return files.filter((relative) => readText(root, relative).includes(needle));
}

function analyzeDayProgram(root, policy) {
  const result = readJsonResult(root, PATHS.dayProgram);
  if (!result.ok) {
    return { present: false, parse_error: result.error, path: PATHS.dayProgram };
  }
  const json = result.value;
  const phases = Array.isArray(json?.day_structure?.phases) ? json.day_structure.phases : [];
  const phaseSlots = phases.map((phase) => ({
    id: norm(phase?.id),
    count: (Array.isArray(phase?.mail_slots) ? phase.mail_slots : [])
      .reduce((sum, slot) => sum + Math.max(0, Number(slot?.count || 0)), 0)
  }));
  const workPhaseIds = new Set(["forenoon", "workday"]);
  const totalSlotCapacity = phaseSlots.reduce((sum, phase) => sum + phase.count, 0);
  const workSlotCapacity = phaseSlots.filter((phase) => workPhaseIds.has(phase.id)).reduce((sum, phase) => sum + phase.count, 0);
  const targetMin = Number(json?.daily_mail_volume?.target_total_items_per_day_min || 0);
  const targetMax = Number(json?.daily_mail_volume?.target_total_items_per_day_max || 0);
  const recommended = Number(json?.daily_mail_volume?.recommended_total_items_per_day || 0);
  const wordsMin = Number(json?.reading_model?.target_word_count_per_day_min || 0);
  const wordsMax = Number(json?.reading_model?.target_word_count_per_day_max || 0);
  const budgetMin = Number(policy?.workday_budget?.actual_work_situations_min || 0);
  const budgetMax = Number(policy?.workday_budget?.actual_work_situations_max || 0);

  return {
    present: true,
    path: PATHS.dayProgram,
    phase_slots: phaseSlots,
    total_slot_capacity: totalSlotCapacity,
    work_slot_capacity: workSlotCapacity,
    target_items_min: targetMin,
    target_items_max: targetMax,
    recommended_items: recommended,
    target_words_min: wordsMin,
    target_words_max: wordsMax,
    policy_work_situations_min: budgetMin,
    policy_work_situations_max: budgetMax,
    budget_conflict: Boolean(
      budgetMax > 0 && (
        targetMin > budgetMax ||
        recommended > budgetMax ||
        workSlotCapacity > budgetMax
      )
    )
  };
}

function auditPlanReachability(root, plans, runtimeMailTypes, allCatalogs) {
  const catalogByPath = new Map(allCatalogs.map((row) => [row.path, row]));
  const report = [];

  for (const planRow of plans) {
    const plan = planRow.json;
    const category = norm(plan?.category || planRow.path.split("/").at(-2));
    const roleScope = norm(plan?.role_scope || path.basename(planRow.path, ".json").replace(/_plan$/, ""));
    const familyRoot = `${PATHS.families}/${category}`;
    const roleCatalogs = allCatalogs.filter((row) => {
      if (!row.path.startsWith(`${familyRoot}/`)) return false;
      return norm(row.json?.role_scope) === roleScope
        || row.items.some((item) => norm(item.role_scope) === roleScope)
        || path.basename(row.path).startsWith(`${roleScope}_`);
    });
    const allRoleItems = roleCatalogs.flatMap((row) => row.items);
    const allRoleFamilyIds = new Set(roleCatalogs.flatMap((row) => {
      const familyIds = (Array.isArray(row.json?.families) ? row.json.families : []).map((family) => norm(family?.id));
      return [...familyIds, ...row.items.map((item) => norm(item.mail_family))];
    }).filter(Boolean));

    const runtimePaths = [
      `${familyRoot}/job/${roleScope}_intro_v2.json`,
      `${familyRoot}/job/${roleScope}_job.json`,
      ...runtimeMailTypes.filter((type) => type !== "job").map((type) => `${familyRoot}/${type}/${roleScope}_${type}.json`)
    ];
    const loadedCatalogs = runtimePaths.map((relative) => catalogByPath.get(relative)).filter(Boolean);
    const loadedItems = loadedCatalogs.flatMap((row) => row.items);

    const steps = (Array.isArray(plan?.sequence) ? plan.sequence : []).map((step, index) => {
      const type = norm(step?.type);
      const allowedFamilies = new Set(uniq(step?.allowed_families));
      const directAll = candidateMatches(allRoleItems, type, allowedFamilies, true);
      const directLoaded = candidateMatches(loadedItems, type, allowedFamilies, true);
      const resolution = resolveStepLikeRuntime(plan, step, index, loadedItems);
      const selected = resolution.candidates[0] || null;
      const missingAllowedFamilies = [...allowedFamilies].filter((family) => !allRoleFamilyIds.has(family));
      const semanticSubstitution = resolution.kind !== "direct" && Boolean(selected) && (
        norm(selected.mail_type) !== type
        || (allowedFamilies.size > 0 && !allowedFamilies.has(norm(selected.mail_family)))
        || resolution.kind === "cross_step"
      );

      return {
        step: Number(step?.step || index + 1),
        step_index: index,
        type,
        phase: norm(step?.phase),
        allowed_families: [...allowedFamilies],
        fallback_types: uniq(step?.fallback_types),
        content_exists: directAll.length > 0,
        content_loaded: directLoaded.length > 0,
        direct_reachable: directLoaded.length > 0,
        direct_candidate_count: directLoaded.length,
        missing_allowed_families: missingAllowedFamilies,
        resolution: resolution.kind,
        resolved_type: norm(selected?.mail_type),
        resolved_family: norm(selected?.mail_family),
        resolved_source_path: norm(selected?.source_path),
        resolved_source_step_index: resolution.source_step_index,
        semantic_substitution: semanticSubstitution,
        reason: directLoaded.length
          ? "direct_type_and_family"
          : directAll.length
            ? "content_exists_but_runtime_does_not_load_direct_candidate"
            : missingAllowedFamilies.length
              ? "allowed_family_missing"
              : resolution.kind === "none"
                ? "no_runtime_candidate"
                : "fallback_or_cross_step"
      };
    });

    report.push({
      path: planRow.path,
      id: norm(plan?.id),
      category,
      role_scope: roleScope,
      runtime_paths: runtimePaths,
      runtime_paths_present: runtimePaths.filter((relative) => catalogByPath.has(relative)),
      total_steps: steps.length,
      direct_steps: steps.filter((step) => step.direct_reachable).length,
      content_exists_but_not_loaded_steps: steps.filter((step) => step.content_exists && !step.content_loaded).length,
      semantic_substitution_steps: steps.filter((step) => step.semantic_substitution).length,
      unresolved_steps: steps.filter((step) => step.resolution === "none").length,
      missing_family_steps: steps.filter((step) => step.missing_allowed_families.length).length,
      steps
    });
  }

  return report.sort((a, b) => a.path.localeCompare(b.path, "en"));
}

export function validateScene(scene) {
  const issues = [];
  const required = [
    "schema",
    "version",
    "id",
    "domain",
    "scene_kind",
    "delivery",
    "day_phase",
    "arc_stage",
    "interaction_mode",
    "thread_id",
    "content",
    "effects",
    "knowledge_contract",
    "provenance"
  ];
  for (const field of required) {
    if (scene?.[field] === undefined || scene?.[field] === null || scene?.[field] === "") {
      issues.push({ code: "required", field });
    }
  }
  if (scene?.schema !== "civication_scene_v1") issues.push({ code: "schema", field: "schema" });
  if (scene?.version !== 1) issues.push({ code: "version", field: "version" });
  for (const field of ["domain", "scene_kind", "delivery", "day_phase", "arc_stage", "interaction_mode"]) {
    if (scene?.[field] !== undefined && !SCENE_ENUMS[field]?.has(scene[field])) issues.push({ code: "enum", field, value: scene[field] });
  }
  const choices = Array.isArray(scene?.choices) ? scene.choices : [];
  if (scene?.interaction_mode === "decision" && choices.length < 2) {
    issues.push({ code: "decision_requires_two_choices", field: "choices" });
  }
  if (scene?.interaction_mode === "task" && (!scene?.task_contract || typeof scene.task_contract !== "object")) {
    issues.push({ code: "task_requires_task_contract", field: "task_contract" });
  }
  if (scene?.interaction_mode === "info" && choices.length > 0) {
    issues.push({ code: "info_must_not_have_choices", field: "choices" });
  }
  if (scene?.interaction_mode === "ack" && choices.length > 1) {
    issues.push({ code: "ack_allows_at_most_one_choice", field: "choices" });
  }
  for (const [index, choice] of choices.entries()) {
    if (!norm(choice?.id) || !norm(choice?.label)) issues.push({ code: "invalid_choice", field: `choices[${index}]` });
    if (!choice?.effects || typeof choice.effects !== "object" || Array.isArray(choice.effects)) {
      issues.push({ code: "choice_requires_normalized_effects", field: `choices[${index}].effects` });
    }
    if (choice?.__civi_fallback_choice === true) {
      issues.push({ code: "generic_fallback_choice_forbidden", field: `choices[${index}]` });
    }
  }

  const knowledge = scene?.knowledge_contract;
  if (knowledge && typeof knowledge === "object") {
    if (knowledge.version !== 1) issues.push({ code: "knowledge_contract_version", field: "knowledge_contract.version" });
    if (!SCENE_ENUMS.knowledge_mode.has(knowledge.mode)) issues.push({ code: "knowledge_contract_mode", field: "knowledge_contract.mode" });
    if (!Array.isArray(knowledge.source_refs)) issues.push({ code: "knowledge_source_refs", field: "knowledge_contract.source_refs" });
    if (!Array.isArray(knowledge.frozen_fields)) issues.push({ code: "knowledge_frozen_fields", field: "knowledge_contract.frozen_fields" });
    if (["pinned", "pinned_rules_dynamic_explanation"].includes(knowledge.mode)) {
      if (!norm(knowledge.ruleset_ref)) issues.push({ code: "pinned_knowledge_requires_ruleset_ref", field: "knowledge_contract.ruleset_ref" });
      if (!norm(knowledge.ruleset_version)) issues.push({ code: "pinned_knowledge_requires_ruleset_version", field: "knowledge_contract.ruleset_version" });
      if (!Array.isArray(knowledge.frozen_fields) || knowledge.frozen_fields.length === 0) {
        issues.push({ code: "pinned_knowledge_requires_frozen_fields", field: "knowledge_contract.frozen_fields" });
      }
    }
    if (knowledge.mode === "pinned_rules_dynamic_explanation"
      && !(Array.isArray(knowledge.dynamic_fields) && knowledge.dynamic_fields.includes("content.explanation"))) {
      issues.push({ code: "dynamic_explanation_must_be_declared", field: "knowledge_contract.dynamic_fields" });
    }
  }
  return issues;
}

export function auditRepository(repoRoot = DEFAULT_REPO_ROOT) {
  const root = path.resolve(repoRoot);
  const parseErrors = [];

  const policyResult = readJsonResult(root, PATHS.policy);
  const contractResult = readJsonResult(root, PATHS.contract);
  if (!policyResult.ok) parseErrors.push({ path: PATHS.policy, error: policyResult.error });
  if (!contractResult.ok) parseErrors.push({ path: PATHS.contract, error: contractResult.error });
  const policy = policyResult.value || {};
  const contract = contractResult.value || {};

  const allJsonPaths = walkFiles(root, "data/Civication", (relative) => relative.endsWith(".json"));
  const parsedJson = [];
  for (const relative of allJsonPaths) {
    const result = readJsonResult(root, relative);
    if (!result.ok) {
      parseErrors.push({ path: relative, error: result.error });
      continue;
    }
    parsedJson.push({ path: relative, json: result.value });
  }

  const sceneSourceFiles = parsedJson.filter((row) => isSceneSourceFile(row.path, row.json));
  const sceneRecords = sceneSourceFiles.flatMap((row) => extractSceneRecords(row.path, row.json));
  const identifierIndex = new Set();
  for (const row of sceneSourceFiles) collectAllIdentifiers(row.json, identifierIndex);
  for (const record of sceneRecords) identifierIndex.add(record.id);

  const ids = new Map();
  for (const record of sceneRecords) {
    if (!ids.has(record.id)) ids.set(record.id, []);
    ids.get(record.id).push(record);
  }
  const duplicateSceneIds = [...ids.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([id, rows]) => ({
      id,
      occurrences: rows.map((row) => ({ path: row.source_path, pointer: row.pointer, type: row.mail_type, family: row.mail_family }))
    }))
    .sort((a, b) => a.id.localeCompare(b.id, "en"));

  const missingInternalReferences = [];
  for (const record of sceneRecords) {
    for (const ref of collectInternalReferences(record)) {
      if (!identifierIndex.has(ref.target)) {
        missingInternalReferences.push({
          source_id: record.id,
          source_path: record.source_path,
          field: ref.field,
          target: ref.target
        });
      }
    }
  }

  const formats = new Map();
  for (const row of sceneSourceFiles) {
    const key = formatKey(row.path, row.json);
    if (!formats.has(key)) formats.set(key, { format: key, files: 0, scenes: 0, paths: [] });
    const target = formats.get(key);
    target.files += 1;
    target.scenes += extractSceneRecords(row.path, row.json).length;
    target.paths.push(row.path);
  }
  const formatInventory = [...formats.values()]
    .map((row) => ({ ...row, paths: row.paths.sort((a, b) => a.localeCompare(b, "en")) }))
    .sort((a, b) => b.files - a.files || a.format.localeCompare(b.format, "en"));

  const runtimeSource = readText(root, PATHS.mailRuntime);
  const dailySource = readText(root, PATHS.dailyBuilder);
  const runtimeMailTypes = extractConstStringArray(runtimeSource, "MAIL_TYPES");
  const dailyMailTypes = extractConstStringArray(dailySource, "EXTRA_MAIL_TYPES");

  const planRows = parsedJson
    .filter((row) => row.path.startsWith(`${PATHS.plans}/`) && row.json?.schema === "civication_mail_plan_v1")
    .sort((a, b) => a.path.localeCompare(b.path, "en"));
  const planTypes = sorted(planRows.flatMap((row) => (Array.isArray(row.json?.sequence) ? row.json.sequence : []).map((step) => step?.type)));
  const policyPlanTypes = uniq(policy?.legacy_plan_types || DEFAULT_LEGACY_PLAN_TYPES);

  const allCatalogs = parsedJson
    .filter((row) => row.path.startsWith(`${PATHS.families}/`))
    .map((row) => ({ ...row, items: flattenCatalog(row.json, row.path) }));
  const planReachability = auditPlanReachability(root, planRows, runtimeMailTypes, allCatalogs);

  const wrappers = detectAnswerWrappers(root);
  const fallbackChoiceSources = sorted(filesContaining(root, "__civi_fallback_choice"));
  const mailPlanBridgeReferences = sorted(filesContaining(root, "CivicationMailPlanBridge"));
  const mailRuntimeReferences = sorted(filesContaining(root, "CivicationMailRuntime"));
  const workdayBuilderReferences = sorted(filesContaining(root, "CivicationWorkdayMailBuilder"));
  const knowledgeBridgeReferences = sorted(filesContaining(root, "CivicationCareerKnowledgeBridge"));
  const dayProgram = analyzeDayProgram(root, policy);

  const missingRuntimeTypes = planTypes.filter((type) => !runtimeMailTypes.includes(type));
  const runtimeOnlyTypes = runtimeMailTypes.filter((type) => !planTypes.includes(type));
  const schemaLessFormats = formatInventory.filter((row) => row.format.startsWith("schema-less:"));
  const directStepCount = planReachability.reduce((sum, plan) => sum + plan.direct_steps, 0);
  const totalStepCount = planReachability.reduce((sum, plan) => sum + plan.total_steps, 0);
  const knownContentNotLoaded = planReachability.flatMap((plan) => plan.steps
    .filter((step) => step.content_exists && !step.content_loaded)
    .map((step) => ({ plan: plan.path, role_scope: plan.role_scope, ...step })));
  const semanticSubstitutions = planReachability.flatMap((plan) => plan.steps
    .filter((step) => step.semantic_substitution)
    .map((step) => ({ plan: plan.path, role_scope: plan.role_scope, ...step })));
  const missingPlanFamilies = planReachability.flatMap((plan) => plan.steps
    .filter((step) => step.missing_allowed_families.length)
    .map((step) => ({ plan: plan.path, role_scope: plan.role_scope, ...step })));

  const contractIntegrityIssues = [];
  if (policyResult.ok && norm(policy?.canonical_scene_contract) !== PATHS.contract) {
    contractIntegrityIssues.push({ code: "policy_contract_path_mismatch", expected: PATHS.contract, actual: policy?.canonical_scene_contract });
  }
  if (contractResult.ok && contract?.properties?.schema?.const !== "civication_scene_v1") {
    contractIntegrityIssues.push({ code: "contract_schema_const", actual: contract?.properties?.schema?.const });
  }
  if (policyResult.ok && policy?.format_freeze?.new_mail_source_formats_allowed !== false) {
    contractIntegrityIssues.push({ code: "format_freeze_not_enabled" });
  }

  const blockingIssues = [
    ...parseErrors.map((row) => ({ category: "parse_error", ...row })),
    ...contractIntegrityIssues.map((row) => ({ category: "contract_integrity", ...row })),
    ...duplicateSceneIds.map((row) => ({ category: "duplicate_scene_id", ...row })),
    ...missingInternalReferences.map((row) => ({ category: "missing_internal_reference", ...row })),
    ...missingPlanFamilies.map((row) => ({ category: "missing_plan_family", ...row })),
    ...knownContentNotLoaded.map((row) => ({ category: "plan_content_not_loaded", ...row })),
    ...semanticSubstitutions.map((row) => ({ category: "semantic_substitution", ...row })),
    ...missingRuntimeTypes.map((type) => ({ category: "runtime_mail_type_missing", type })),
    ...(wrappers.length > 1 ? [{ category: "multiple_answer_wrappers", files: wrappers }] : []),
    ...fallbackChoiceSources.map((source_path) => ({ category: "generic_fallback_choice_source", source_path })),
    ...(dayProgram?.budget_conflict ? [{ category: "daily_work_situation_budget_conflict", ...dayProgram }] : [])
  ];

  return {
    schema: "civication_scene_pipeline_audit_v1",
    version: 1,
    generated_at: new Date().toISOString(),
    repository_root: root,
    mode: norm(policy?.audit?.enforcement_mode || "observe"),
    contract: {
      path: PATHS.contract,
      present: contractResult.ok,
      schema_const: contract?.properties?.schema?.const || null,
      integrity_issues: contractIntegrityIssues
    },
    policy: {
      path: PATHS.policy,
      present: policyResult.ok,
      status: policy?.status || null,
      phase_1_scope: policy?.phase_1_scope || null,
      plan_types: policyPlanTypes
    },
    inventory: {
      json_files_scanned: allJsonPaths.length,
      scene_source_files: sceneSourceFiles.length,
      scene_records: sceneRecords.length,
      formats: formatInventory,
      schema_less_formats: schemaLessFormats,
      duplicate_scene_ids: duplicateSceneIds,
      missing_internal_references: missingInternalReferences,
      parse_errors: parseErrors
    },
    runtime: {
      mail_runtime_path: PATHS.mailRuntime,
      daily_builder_path: PATHS.dailyBuilder,
      plan_types: planTypes,
      runtime_mail_types: runtimeMailTypes,
      daily_builder_mail_types: dailyMailTypes,
      missing_runtime_types: missingRuntimeTypes,
      runtime_only_types: runtimeOnlyTypes,
      answer_wrappers: wrappers,
      generic_fallback_choice_sources: fallbackChoiceSources,
      mail_plan_bridge_references: mailPlanBridgeReferences,
      mail_runtime_references: mailRuntimeReferences,
      workday_mail_builder_references: workdayBuilderReferences,
      knowledge_bridge_references: knowledgeBridgeReferences
    },
    plan_reachability: {
      plans: planReachability,
      total_steps: totalStepCount,
      direct_steps: directStepCount,
      direct_ratio: totalStepCount ? directStepCount / totalStepCount : 0,
      content_exists_but_not_loaded: knownContentNotLoaded,
      semantic_substitutions: semanticSubstitutions,
      missing_plan_families: missingPlanFamilies
    },
    day_program: dayProgram,
    blocking_issues: blockingIssues,
    summary: {
      scene_source_files: sceneSourceFiles.length,
      scene_records: sceneRecords.length,
      source_formats: formatInventory.length,
      schema_less_files: schemaLessFormats.reduce((sum, row) => sum + row.files, 0),
      duplicate_scene_ids: duplicateSceneIds.length,
      missing_internal_references: missingInternalReferences.length,
      plans: planReachability.length,
      plan_steps: totalStepCount,
      direct_plan_steps: directStepCount,
      content_exists_but_not_loaded_steps: knownContentNotLoaded.length,
      semantic_substitution_steps: semanticSubstitutions.length,
      missing_runtime_types: missingRuntimeTypes.length,
      answer_wrappers: wrappers.length,
      generic_fallback_choice_sources: fallbackChoiceSources.length,
      blocking_issues: blockingIssues.length
    }
  };
}

function markdownEscape(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function percent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)} %`;
}

function shortList(values, max = 12) {
  const list = Array.isArray(values) ? values : [];
  if (!list.length) return "—";
  const shown = list.slice(0, max).map((value) => `\`${markdownEscape(value)}\``).join(", ");
  return list.length > max ? `${shown} … (+${list.length - max})` : shown;
}

export function renderMarkdown(audit) {
  const lines = [];
  lines.push("# Civication Scene Pipeline v1 — read-only architecture audit", "");
  lines.push(`Generated: \`${audit.generated_at}\``, "");
  lines.push(`Mode: **${markdownEscape(audit.mode)}**. Auditten skriver ikke til repoet.`, "");

  lines.push("## Sammendrag", "");
  lines.push("| Måling | Resultat |", "|---|---:|");
  const summaryRows = [
    ["Scene-/mailrelaterte JSON-filer", audit.summary.scene_source_files],
    ["Scene-lignende poster", audit.summary.scene_records],
    ["Kildeformater", audit.summary.source_formats],
    ["Schema-løse filer", audit.summary.schema_less_files],
    ["Dupliserte scene-ID-er", audit.summary.duplicate_scene_ids],
    ["Manglende interne referanser", audit.summary.missing_internal_references],
    ["Mailplaner", audit.summary.plans],
    ["Plansteg", audit.summary.plan_steps],
    ["Direkte nåbare plansteg", `${audit.summary.direct_plan_steps} (${percent(audit.plan_reachability.direct_ratio)})`],
    ["Innhold finnes, men lastes ikke", audit.summary.content_exists_but_not_loaded_steps],
    ["Semantiske fallback-erstatninger", audit.summary.semantic_substitution_steps],
    ["Plantyper som mangler i MailRuntime", audit.summary.missing_runtime_types],
    ["EventEngine.answer-wrappere", audit.summary.answer_wrappers],
    ["Kilder til generiske fallback-valg", audit.summary.generic_fallback_choice_sources]
  ];
  for (const [label, value] of summaryRows) lines.push(`| ${label} | ${value} |`);
  lines.push("");

  lines.push("## Typeparitet", "");
  lines.push(`- Planene bruker: ${shortList(audit.runtime.plan_types)}`);
  lines.push(`- \`CivicationMailRuntime\` laster: ${shortList(audit.runtime.runtime_mail_types)}`);
  lines.push(`- \`DailyMailBuilder\` kjenner: ${shortList(audit.runtime.daily_builder_mail_types)}`);
  lines.push(`- Mangler i normal planruntime: ${shortList(audit.runtime.missing_runtime_types)}`, "");

  lines.push("## Semantisk plan-reachability", "");
  lines.push("| Plan | Direkte | Innhold finnes, ikke lastet | Semantisk erstatning | Uløst |", "|---|---:|---:|---:|---:|");
  for (const plan of audit.plan_reachability.plans) {
    lines.push(`| \`${markdownEscape(plan.path)}\` | ${plan.direct_steps}/${plan.total_steps} | ${plan.content_exists_but_not_loaded_steps} | ${plan.semantic_substitution_steps} | ${plan.unresolved_steps} |`);
  }
  lines.push("");

  const affected = audit.plan_reachability.content_exists_but_not_loaded;
  if (affected.length) {
    lines.push("### Plansteg med korrekt innhold som normal runtime ikke laster", "");
    lines.push("| Plan | Steg | Ønsket type | Familie | Runtime-resultat |", "|---|---:|---|---|---|");
    for (const step of affected) {
      lines.push(`| \`${markdownEscape(step.plan)}\` | ${step.step} | \`${markdownEscape(step.type)}\` | ${shortList(step.allowed_families, 4)} | \`${markdownEscape(step.resolution)} -> ${markdownEscape(step.resolved_type || "none")}/${markdownEscape(step.resolved_family || "none")}\` |`);
    }
    lines.push("");
  }

  lines.push("## Format- og ID-audit", "");
  lines.push("| Format | Filer | Scener |", "|---|---:|---:|");
  for (const row of audit.inventory.formats) {
    lines.push(`| \`${markdownEscape(row.format)}\` | ${row.files} | ${row.scenes} |`);
  }
  lines.push("");

  lines.push("## Svarpipeline", "");
  lines.push(`- Wrappere rundt \`EventEngine.answer()\`: ${audit.runtime.answer_wrappers.length}`);
  for (const file of audit.runtime.answer_wrappers) lines.push(`  - \`${markdownEscape(file)}\``);
  lines.push(`- Generiske fallback-valg finnes i: ${shortList(audit.runtime.generic_fallback_choice_sources)}`, "");

  lines.push("## Dagsprogram", "");
  if (!audit.day_program?.present) {
    lines.push(`Kunne ikke lese \`${PATHS.dayProgram}\`: ${markdownEscape(audit.day_program?.parse_error || "mangler")}`, "");
  } else {
    lines.push(`- Deklarert mål: ${audit.day_program.target_items_min}–${audit.day_program.target_items_max} elementer; anbefalt ${audit.day_program.recommended_items}.`);
    lines.push(`- Deklarert tekstmål: ${audit.day_program.target_words_min}–${audit.day_program.target_words_max} ord.`);
    lines.push(`- Slotkapasitet: ${audit.day_program.total_slot_capacity} totalt, ${audit.day_program.work_slot_capacity} i arbeidsfasene.`);
    lines.push(`- Scene Pipeline-policy: ${audit.day_program.policy_work_situations_min}–${audit.day_program.policy_work_situations_max} faktiske arbeidssituasjoner.`);
    lines.push(`- Budsjettkonflikt: **${audit.day_program.budget_conflict ? "ja" : "nei"}**.`, "");
  }

  lines.push("## Gate-status", "");
  lines.push(`Observasjonsmodus rapporterer ${audit.summary.blocking_issues} funn uten å endre data eller stoppe standardkjøringen.`);
  lines.push("Kjør med `--strict` for å gjøre de samme funnene blokkerende når migreringen er klar for gate.", "");
  return `${lines.join("\n")}\n`;
}

function parseArgs(argv) {
  const options = { root: DEFAULT_REPO_ROOT, format: "markdown", strict: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--strict") options.strict = true;
    else if (arg === "--json") options.format = "json";
    else if (arg === "--markdown") options.format = "markdown";
    else if (arg.startsWith("--format=")) options.format = arg.slice("--format=".length);
    else if (arg === "--root") options.root = path.resolve(argv[++index]);
    else if (arg.startsWith("--root=")) options.root = path.resolve(arg.slice("--root=".length));
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Ukjent argument: ${arg}`);
  }
  if (!["json", "markdown"].includes(options.format)) throw new Error(`Ukjent format: ${options.format}`);
  return options;
}

function usage() {
  return [
    "Usage: node scripts/audit-civication-scene-pipeline.mjs [options]",
    "",
    "Options:",
    "  --root <path>       Auditér et annet repository root",
    "  --json              Skriv maskinlesbar JSON til stdout",
    "  --markdown          Skriv Markdown-rapport til stdout (standard)",
    "  --strict            Exit 1 dersom auditten finner migreringsgjeld",
    "  -h, --help          Vis denne hjelpen",
    "",
    "Auditten er alltid read-only og oppretter eller endrer ingen filer."
  ].join("\n");
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(String(error?.message || error));
    console.error(usage());
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    console.log(usage());
    return;
  }
  const audit = auditRepository(options.root);
  process.stdout.write(options.format === "json" ? `${JSON.stringify(audit, null, 2)}\n` : renderMarkdown(audit));
  if (options.strict && audit.blocking_issues.length) process.exitCode = 1;
}

const invokedDirectly = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (invokedDirectly) await main();
