#!/usr/bin/env node
import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const REGISTRY_SCHEMA = "compiled_scene_registry_v1";
export const REGISTRY_VERSION = 1;
export const COMPILER_VERSION = 1;
export const SCENE_SCHEMA = "civication_scene_v1";
export const SCENE_VERSION = 1;
export const SOURCE_ROOT = "data/Civication/mailFamilies";
export const LEGACY_FALLBACK_ROOT = "data/Civication/jobbmails";
export const DEFAULT_OUTPUT = "data/Civication/compiledSceneRegistryV1.json";

const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const SOCIAL_AUDIENCE_ID_RE = /^(manager|team|professional|public):[a-z0-9][a-z0-9_.:-]{0,95}$/;
const DAY_PHASES = new Set([
  "morning", "forenoon", "workday", "lunch", "afternoon", "dinner", "evening", "day_end", "any"
]);
const ARC_STAGES = new Set(["intro", "early", "mid", "advanced", "mastery", "climax", "any"]);
// Must mirror CivicationSceneCatalog.getFamilyPaths() ordering. Job is loaded
// before every extra type; a later duplicate with the same routing signature is
// therefore shadowed by the earlier source in today's stable candidate ordering.
const EXTRA_MAIL_TYPES = Object.freeze([
  "people",
  "story",
  "conflict",
  "event",
  "faction_choice",
  "micro",
  "followup",
  "knowledge",
  "consequence"
]);
const EXTRA_MAIL_TYPE_SET = new Set(EXTRA_MAIL_TYPES);
const SCENE_KIND_BY_MAIL_TYPE = Object.freeze({
  job: "task",
  knowledge: "knowledge",
  micro: "task",
  people: "relationship",
  conflict: "conflict",
  followup: "consequence",
  story: "milestone",
  event: "milestone",
  consequence: "consequence",
  faction_choice: "conflict"
});
const DYNAMIC_SOURCES = Object.freeze([
  { name: "private", source_format: "private_phase_mail_families_v1", materialization: "runtime" },
  { name: "life", source_format: "life_mail_manifest_v1", materialization: "runtime" },
  { name: "narrative", source_format: "civication_narrative_stream_v1", materialization: "runtime" },
  { name: "social", source_format: "civication_social_encounter_v1", materialization: "runtime" }
]);

function norm(value) {
  return String(value == null ? "" : value).trim();
}

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function assertId(value, label) {
  const id = norm(value);
  if (!id || !ID_RE.test(id)) throw new Error(`${label} har ugyldig id: ${JSON.stringify(value)}`);
  return id;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort((a, b) => a.localeCompare(b, "en"))
      .map((key) => [key, stableValue(value[key])])
  );
}

export function stableStringify(value, space = 0) {
  return JSON.stringify(stableValue(value), null, space);
}

function sha256(value) {
  return createHash("sha256").update(typeof value === "string" ? value : stableStringify(value)).digest("hex");
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(rootDir, predicate = () => true) {
  if (!(await exists(rootDir))) return [];
  const out = [];
  async function visit(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name, "en"));
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await visit(full);
      else if (entry.isFile() && predicate(full)) out.push(full);
    }
  }
  await visit(rootDir);
  return out;
}

function repoRelative(repoRoot, filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function uniqueStrings(values) {
  const out = [];
  const seen = new Set();
  for (const value of Array.isArray(values) ? values : []) {
    const text = norm(value);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

function uniqueIds(values) {
  return uniqueStrings(values).filter((value) => ID_RE.test(value));
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} må være objekt`);
  }
  return value;
}

function assertAllowedKeys(value, allowed, label) {
  const input = assertPlainObject(value, label);
  const unknown = Object.keys(input).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`${label} har ukjent felt: ${unknown.sort().join(", ")}`);
  return input;
}

function strictUniqueStrings(value, label, options = {}) {
  if (!Array.isArray(value)) throw new Error(`${label} må være array`);
  const max = Number(options.max || 32);
  if (value.length > max) throw new Error(`${label} kan ha maks ${max} elementer`);
  const seen = new Set();
  const out = [];
  for (let index = 0; index < value.length; index += 1) {
    const item = norm(value[index]);
    if (!item) throw new Error(`${label}[${index}] kan ikke være tom`);
    if (options.ids === true && !ID_RE.test(item)) {
      throw new Error(`${label}[${index}] har ugyldig id: ${JSON.stringify(value[index])}`);
    }
    if (seen.has(item)) throw new Error(`${label} har duplikat: ${item}`);
    seen.add(item);
    out.push(item);
  }
  return out;
}

function optionalStrictText(value, label, allowNull = false) {
  if (value === null && allowNull) return null;
  const out = norm(value);
  if (!out) throw new Error(`${label} kan ikke være tom`);
  return out;
}

function normalizeWorkContext(value, label) {
  if (value == null) return null;
  const input = assertAllowedKeys(
    value,
    new Set([
      "object_ids", "institution_id", "deadline_ref", "deadline_day", "deadline_phase",
      "blocked_by_object_id", "waiting_for_actor_id", "handoff_to_actor_id", "priority",
      "interrupts", "rework_of_scene_id", "rework_of_object_transition"
    ]),
    label
  );
  if (!hasOwn(input, "object_ids")) throw new Error(`${label}.object_ids mangler`);
  const objectIds = strictUniqueStrings(input.object_ids, `${label}.object_ids`, { ids: true, max: 8 });
  if (!objectIds.length) throw new Error(`${label}.object_ids må inneholde minst ett id`);
  const out = { object_ids: objectIds };
  if (hasOwn(input, "institution_id")) {
    out.institution_id = assertId(input.institution_id, `${label}.institution_id`);
  }
  if (hasOwn(input, "deadline_ref")) {
    out.deadline_ref = optionalStrictText(input.deadline_ref, `${label}.deadline_ref`);
  }
  if (hasOwn(input, "deadline_day")) {
    const deadlineDay = Number(input.deadline_day);
    if (!Number.isInteger(deadlineDay) || deadlineDay < 1 || deadlineDay > 366) {
      throw new Error(`${label}.deadline_day må være heltall mellom 1 og 366`);
    }
    out.deadline_day = deadlineDay;
  }
  if (hasOwn(input, "deadline_phase")) {
    if (!hasOwn(input, "deadline_day")) throw new Error(`${label}.deadline_phase krever deadline_day`);
    const deadlinePhase = norm(input.deadline_phase);
    if (!["morning", "forenoon", "workday", "lunch", "afternoon", "dinner", "evening", "day_end", "any"].includes(deadlinePhase)) {
      throw new Error(`${label}.deadline_phase er ukjent: ${deadlinePhase || "<tom>"}`);
    }
    out.deadline_phase = deadlinePhase;
  }
  for (const key of [
    "blocked_by_object_id", "waiting_for_actor_id", "handoff_to_actor_id",
    "rework_of_scene_id", "rework_of_object_transition"
  ]) {
    if (hasOwn(input, key)) out[key] = assertId(input[key], `${label}.${key}`);
  }
  if (hasOwn(input, "priority")) {
    const priority = norm(input.priority);
    if (!["low", "normal", "high", "urgent"].includes(priority)) {
      throw new Error(`${label}.priority er ukjent: ${priority || "<tom>"}`);
    }
    out.priority = priority;
  }
  if (hasOwn(input, "interrupts")) {
    if (typeof input.interrupts !== "boolean") throw new Error(`${label}.interrupts må være boolean`);
    out.interrupts = input.interrupts;
  }
  return out;
}

function assertSocialAudienceId(value, label) {
  const id = norm(value);
  if (!SOCIAL_AUDIENCE_ID_RE.test(id)) {
    throw new Error(`${label} har ugyldig situert audience-id: ${JSON.stringify(value)}`);
  }
  return id;
}

function normalizeSocialStandingContext(value, label) {
  if (value == null) return null;
  const input = assertAllowedKeys(value, new Set(["reaction_audience_id", "requirements"]), label);
  const out = {};
  if (hasOwn(input, "reaction_audience_id")) {
    out.reaction_audience_id = assertSocialAudienceId(input.reaction_audience_id, `${label}.reaction_audience_id`);
  }
  if (hasOwn(input, "requirements")) {
    if (!Array.isArray(input.requirements)) throw new Error(`${label}.requirements må være array`);
    if (input.requirements.length > 8) throw new Error(`${label}.requirements kan ha maks 8 elementer`);
    const seen = new Set();
    out.requirements = input.requirements.map((raw, index) => {
      const itemLabel = `${label}.requirements[${index}]`;
      const requirement = assertAllowedKeys(raw, new Set(["audience_id", "min", "max"]), itemLabel);
      const audienceId = assertSocialAudienceId(requirement.audience_id, `${itemLabel}.audience_id`);
      if (seen.has(audienceId)) throw new Error(`${label}.requirements har duplikat audience_id: ${audienceId}`);
      seen.add(audienceId);
      const item = { audience_id: audienceId };
      for (const key of ["min", "max"]) {
        if (!hasOwn(requirement, key)) continue;
        const number = Number(requirement[key]);
        if (!Number.isFinite(number) || number < -100 || number > 100) {
          throw new Error(`${itemLabel}.${key} må være et tall mellom -100 og 100`);
        }
        item[key] = number;
      }
      if (!hasOwn(item, "min") && !hasOwn(item, "max")) throw new Error(`${itemLabel} krever min eller max`);
      if (hasOwn(item, "min") && hasOwn(item, "max") && item.min > item.max) {
        throw new Error(`${itemLabel}.min kan ikke være større enn max`);
      }
      return item;
    });
  }
  if (!out.reaction_audience_id && !hasOwn(out, "requirements")) {
    throw new Error(`${label} krever reaction_audience_id eller requirements`);
  }
  return out;
}

function normalizeAuthorityAction(value, label) {
  if (value == null) return null;
  const input = assertAllowedKeys(value, new Set(["action_id", "intent"]), label);
  const intent = norm(input.intent);
  if (!["execute", "recommend", "request_approval", "wait", "escalate"].includes(intent)) {
    throw new Error(`${label}.intent er ukjent: ${intent || "<tom>"}`);
  }
  return { action_id: assertId(input.action_id, `${label}.action_id`), intent };
}

function normalizeAuthorityContext(value, label) {
  if (value == null) return null;
  const input = assertAllowedKeys(value, new Set([
    "institution_id", "unit_id", "role_scope", "reporting_line", "peer_functions",
    "external_counterparts", "goals_pressures", "approval_points", "authority_rules",
    "resources", "escalation_paths"
  ]), label);
  const out = {
    institution_id: assertId(input.institution_id, `${label}.institution_id`),
    unit_id: assertId(input.unit_id, `${label}.unit_id`),
    role_scope: assertId(input.role_scope, `${label}.role_scope`),
    reporting_line: strictUniqueStrings(input.reporting_line || [], `${label}.reporting_line`, { ids: true, max: 12 }),
    approval_points: [], authority_rules: [], resources: [], escalation_paths: []
  };
  for (const key of ["peer_functions", "external_counterparts", "goals_pressures"]) {
    if (hasOwn(input, key)) out[key] = strictUniqueStrings(input[key], `${label}.${key}`, { ids: true, max: 24 });
  }
  const normalizeUniqueObjectArray = (raw, collectionLabel, max, idKey, normalizer) => {
    if (!Array.isArray(raw)) throw new Error(`${collectionLabel} må være array`);
    if (raw.length > max) throw new Error(`${collectionLabel} kan ha maks ${max} elementer`);
    const seen = new Set();
    return raw.map((entry, index) => {
      const normalized = normalizer(entry, `${collectionLabel}[${index}]`);
      const key = normalized[idKey];
      if (seen.has(key)) throw new Error(`${collectionLabel} har duplikat ${idKey}: ${key}`);
      seen.add(key);
      return normalized;
    });
  };
  out.approval_points = normalizeUniqueObjectArray(input.approval_points || [], `${label}.approval_points`, 16, "approval_id", (entry, itemLabel) => {
    const item = assertAllowedKeys(entry, new Set(["approval_id", "action_id", "approver_actor_id", "approval_object_id"]), itemLabel);
    return { approval_id: assertId(item.approval_id, `${itemLabel}.approval_id`), action_id: assertId(item.action_id, `${itemLabel}.action_id`), approver_actor_id: assertId(item.approver_actor_id, `${itemLabel}.approver_actor_id`), approval_object_id: assertId(item.approval_object_id, `${itemLabel}.approval_object_id`) };
  });
  out.resources = normalizeUniqueObjectArray(input.resources || [], `${label}.resources`, 16, "resource_id", (entry, itemLabel) => {
    const item = assertAllowedKeys(entry, new Set(["resource_id", "baseline_state", "resource_object_id"]), itemLabel);
    const baselineState = norm(item.baseline_state);
    if (!["available", "limited", "unavailable"].includes(baselineState)) throw new Error(`${itemLabel}.baseline_state er ukjent`);
    const resource = { resource_id: assertId(item.resource_id, `${itemLabel}.resource_id`), baseline_state: baselineState };
    if (hasOwn(item, "resource_object_id")) resource.resource_object_id = assertId(item.resource_object_id, `${itemLabel}.resource_object_id`);
    return resource;
  });
  out.escalation_paths = normalizeUniqueObjectArray(input.escalation_paths || [], `${label}.escalation_paths`, 16, "escalation_id", (entry, itemLabel) => {
    const item = assertAllowedKeys(entry, new Set(["escalation_id", "action_id", "target_actor_id", "escalation_object_id"]), itemLabel);
    return { escalation_id: assertId(item.escalation_id, `${itemLabel}.escalation_id`), action_id: assertId(item.action_id, `${itemLabel}.action_id`), target_actor_id: assertId(item.target_actor_id, `${itemLabel}.target_actor_id`), escalation_object_id: assertId(item.escalation_object_id, `${itemLabel}.escalation_object_id`) };
  });
  out.authority_rules = normalizeUniqueObjectArray(input.authority_rules || [], `${label}.authority_rules`, 32, "action_id", (entry, itemLabel) => {
    const item = assertAllowedKeys(entry, new Set(["action_id", "authority", "approval_id", "escalation_id", "requires_resources"]), itemLabel);
    const authority = norm(item.authority);
    if (!["direct", "approval_required", "influence_only", "forbidden"].includes(authority)) throw new Error(`${itemLabel}.authority er ukjent`);
    const rule = { action_id: assertId(item.action_id, `${itemLabel}.action_id`), authority, requires_resources: strictUniqueStrings(item.requires_resources || [], `${itemLabel}.requires_resources`, { ids: true, max: 16 }) };
    if (hasOwn(item, "approval_id")) rule.approval_id = assertId(item.approval_id, `${itemLabel}.approval_id`);
    if (hasOwn(item, "escalation_id")) rule.escalation_id = assertId(item.escalation_id, `${itemLabel}.escalation_id`);
    return rule;
  });
  if (!out.authority_rules.length) throw new Error(`${label}.authority_rules må inneholde minst én regel`);
  return out;
}

function validateAuthorityBindings(authorityContext, choices, workContext, sourcePath, sceneId) {
  const authorityChoices = choices.filter((choice) => choice.authority_action);
  if (!authorityContext) {
    if (authorityChoices.length) throw new Error(`${sourcePath} :: ${sceneId} authority_action krever authority_context`);
    return;
  }
  if (workContext?.institution_id && workContext.institution_id !== authorityContext.institution_id) throw new Error(`${sourcePath} :: ${sceneId} institution_id mismatch mellom work_context og authority_context`);
  const rules = new Map(authorityContext.authority_rules.map((rule) => [rule.action_id, rule]));
  const approvals = new Map(authorityContext.approval_points.map((point) => [point.approval_id, point]));
  const escalations = new Map(authorityContext.escalation_paths.map((path) => [path.escalation_id, path]));
  const resources = new Set(authorityContext.resources.map((resource) => resource.resource_id));
  for (const rule of authorityContext.authority_rules) {
    if (rule.authority === "approval_required") {
      const point = rule.approval_id ? approvals.get(rule.approval_id) : null;
      if (!point || point.action_id !== rule.action_id) throw new Error(`${sourcePath} :: ${sceneId} ${rule.action_id} mangler gyldig approval point`);
    } else if (rule.approval_id) throw new Error(`${sourcePath} :: ${sceneId} approval_id er bare gyldig for approval_required`);
    if (rule.escalation_id) {
      const path = escalations.get(rule.escalation_id);
      if (!path || path.action_id !== rule.action_id) throw new Error(`${sourcePath} :: ${sceneId} ${rule.action_id} har ugyldig escalation path`);
    }
    for (const resourceId of rule.requires_resources) if (!resources.has(resourceId)) throw new Error(`${sourcePath} :: ${sceneId} ${rule.action_id} krever ukjent ressurs ${resourceId}`);
  }
  for (const choice of authorityChoices) {
    const action = choice.authority_action;
    const rule = rules.get(action.action_id);
    if (!rule) throw new Error(`${sourcePath} :: ${sceneId} choice ${choice.id} bruker ukjent authority action ${action.action_id}`);
    const canEscalate = Boolean(rule.escalation_id);
    const allowedIntent = (rule.authority === "direct" && ["execute", "recommend"].includes(action.intent)) || (rule.authority === "influence_only" && action.intent === "recommend") || (rule.authority === "approval_required" && ["execute", "recommend", "request_approval", "wait"].includes(action.intent)) || (action.intent === "escalate" && canEscalate);
    if (!allowedIntent) throw new Error(`${sourcePath} :: ${sceneId} choice ${choice.id} har intent som strider mot authority rule`);
    const ops = Array.isArray(choice.effects?.work_object_ops) ? choice.effects.work_object_ops : [];
    if (action.intent === "request_approval") {
      const point = approvals.get(rule.approval_id);
      const create = ops.find((op) => op.op === "create" && op.work_object?.work_object_id === point?.approval_object_id);
      if (!create || create.work_object.kind !== "approval" || create.work_object.status !== "pending" || create.work_object.institution_id !== authorityContext.institution_id) throw new Error(`${sourcePath} :: ${sceneId} request_approval må opprette matching pending approval-work-object`);
    }
    if (action.intent === "escalate") {
      const path = escalations.get(rule.escalation_id);
      const create = ops.find((op) => op.op === "create" && op.work_object?.work_object_id === path?.escalation_object_id);
      if (!create || create.work_object.kind !== "escalation" || create.work_object.status !== "open" || create.work_object.institution_id !== authorityContext.institution_id) throw new Error(`${sourcePath} :: ${sceneId} escalate må opprette matching open escalation-work-object`);
    }
  }
}

const CREATE_SEED_KEYS = new Set([
  "work_object_id",
  "kind",
  "role_scope",
  "institution_id",
  "title",
  "status",
  "phase",
  "people_refs",
  "place_refs",
  "knowledge_refs",
  "open_questions",
  "deadline",
  "confidentiality",
  "flags",
  "shared"
]);
const PATCH_SEED_KEYS = new Set([
  "work_object_id",
  "kind",
  "role_scope",
  "institution_id",
  "title",
  "people_refs",
  "place_refs",
  "knowledge_refs",
  "open_questions",
  "deadline",
  "confidentiality",
  "flags",
  "shared"
]);

function normalizeWorkObjectSeed(value, label, mode) {
  const create = mode === "create";
  const input = assertAllowedKeys(value, create ? CREATE_SEED_KEYS : PATCH_SEED_KEYS, label);
  const out = {
    work_object_id: assertId(input.work_object_id, `${label}.work_object_id`)
  };

  if (create) {
    out.kind = assertId(input.kind, `${label}.kind`);
    out.role_scope = assertId(input.role_scope, `${label}.role_scope`);
    out.title = optionalStrictText(input.title, `${label}.title`);
    out.status = assertId(input.status, `${label}.status`);
    out.phase = assertId(input.phase, `${label}.phase`);
  } else {
    if (hasOwn(input, "kind")) out.kind = assertId(input.kind, `${label}.kind`);
    if (hasOwn(input, "role_scope")) out.role_scope = assertId(input.role_scope, `${label}.role_scope`);
    if (hasOwn(input, "title")) out.title = optionalStrictText(input.title, `${label}.title`);
  }

  if (hasOwn(input, "institution_id")) {
    out.institution_id = assertId(input.institution_id, `${label}.institution_id`);
  }
  for (const key of ["people_refs", "place_refs", "knowledge_refs", "open_questions"]) {
    if (hasOwn(input, key)) out[key] = strictUniqueStrings(input[key], `${label}.${key}`);
    else if (create) out[key] = [];
  }
  if (hasOwn(input, "deadline")) {
    out.deadline = optionalStrictText(input.deadline, `${label}.deadline`, !create);
  }
  if (hasOwn(input, "confidentiality")) {
    out.confidentiality = optionalStrictText(input.confidentiality, `${label}.confidentiality`, !create);
  }
  if (hasOwn(input, "flags")) {
    out.flags = strictUniqueStrings(input.flags, `${label}.flags`, { ids: true });
  } else if (create) {
    out.flags = [];
  }
  if (hasOwn(input, "shared")) {
    if (typeof input.shared !== "boolean") throw new Error(`${label}.shared må være boolean`);
    out.shared = input.shared;
  } else if (create) {
    out.shared = false;
  }

  return out;
}

function normalizeWorkObjectOps(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} må være array`);
  if (value.length > 12) throw new Error(`${label} kan ha maks 12 operasjoner`);

  const seenEvents = new Set();
  const out = [];
  for (let index = 0; index < value.length; index += 1) {
    const opLabel = `${label}[${index}]`;
    const raw = assertPlainObject(value[index], opLabel);
    const op = norm(raw.op);
    const allowedByOp = {
      create: new Set(["op", "event_id", "work_object"]),
      upsert: new Set(["op", "event_id", "work_object"]),
      transition: new Set(["op", "event_id", "work_object_id", "to_status", "to_phase", "note"]),
      add_flag: new Set(["op", "event_id", "work_object_id", "flag"]),
      remove_flag: new Set(["op", "event_id", "work_object_id", "flag"]),
      close: new Set(["op", "event_id", "work_object_id", "outcome"]),
      note: new Set(["op", "event_id", "work_object_id", "note"])
    };
    const allowed = allowedByOp[op];
    if (!allowed) throw new Error(`${opLabel}.op er ukjent: ${op || "<tom>"}`);
    const input = assertAllowedKeys(raw, allowed, opLabel);
    const eventId = assertId(input.event_id, `${opLabel}.event_id`);
    if (seenEvents.has(eventId)) throw new Error(`${label} har duplikat event_id: ${eventId}`);
    seenEvents.add(eventId);

    if (op === "create" || op === "upsert") {
      out.push({
        op,
        event_id: eventId,
        work_object: normalizeWorkObjectSeed(input.work_object, `${opLabel}.work_object`, op)
      });
      continue;
    }

    const workObjectId = assertId(input.work_object_id, `${opLabel}.work_object_id`);
    if (op === "transition") {
      const transition = { op, event_id: eventId, work_object_id: workObjectId };
      if (hasOwn(input, "to_status")) {
        transition.to_status = assertId(input.to_status, `${opLabel}.to_status`);
      }
      if (hasOwn(input, "to_phase")) {
        transition.to_phase = assertId(input.to_phase, `${opLabel}.to_phase`);
      }
      if (hasOwn(input, "note")) {
        transition.note = optionalStrictText(input.note, `${opLabel}.note`);
      }
      if (!transition.to_status && !transition.to_phase && !transition.note) {
        throw new Error(`${opLabel} må endre status/fase eller ha note`);
      }
      out.push(transition);
      continue;
    }

    if (op === "add_flag" || op === "remove_flag") {
      out.push({
        op,
        event_id: eventId,
        work_object_id: workObjectId,
        flag: assertId(input.flag, `${opLabel}.flag`)
      });
      continue;
    }

    if (op === "close") {
      const close = { op, event_id: eventId, work_object_id: workObjectId };
      if (hasOwn(input, "outcome")) close.outcome = optionalStrictText(input.outcome, `${opLabel}.outcome`);
      out.push(close);
      continue;
    }

    out.push({
      op,
      event_id: eventId,
      work_object_id: workObjectId,
      note: optionalStrictText(input.note, `${opLabel}.note`)
    });
  }
  return out;
}

function normalizeSocialStandingOps(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} må være array`);
  if (value.length > 8) throw new Error(`${label} kan ha maks 8 operasjoner`);
  const seenEvents = new Set();
  return value.map((raw, index) => {
    const opLabel = `${label}[${index}]`;
    const input = assertAllowedKeys(raw, new Set([
      "event_id", "audience_id", "delta", "reason", "source_actor_id"
    ]), opLabel);
    const eventId = assertId(input.event_id, `${opLabel}.event_id`);
    if (seenEvents.has(eventId)) throw new Error(`${label} har duplikat event_id: ${eventId}`);
    seenEvents.add(eventId);
    const delta = Number(input.delta);
    if (!Number.isFinite(delta) || delta === 0 || delta < -100 || delta > 100) {
      throw new Error(`${opLabel}.delta må være et ikke-null tall mellom -100 og 100`);
    }
    const out = {
      event_id: eventId,
      audience_id: assertSocialAudienceId(input.audience_id, `${opLabel}.audience_id`),
      delta
    };
    if (hasOwn(input, "reason")) out.reason = optionalStrictText(input.reason, `${opLabel}.reason`);
    if (hasOwn(input, "source_actor_id")) out.source_actor_id = assertId(input.source_actor_id, `${opLabel}.source_actor_id`);
    return out;
  });
}

function normalizeChoiceAffordance(value, label) {
  if (value == null) return null;
  const input = assertAllowedKeys(value, new Set(["history_go"]), label);
  if (!hasOwn(input, "history_go")) throw new Error(`${label}.history_go mangler`);
  const historyGo = assertAllowedKeys(
    input.history_go,
    new Set(["task_mail_ids", "require_task_completed", "require_history_go_correct", "min_effect"]),
    `${label}.history_go`
  );
  if (!hasOwn(historyGo, "task_mail_ids")) throw new Error(`${label}.history_go.task_mail_ids mangler`);
  const taskMailIds = strictUniqueStrings(
    historyGo.task_mail_ids,
    `${label}.history_go.task_mail_ids`,
    { ids: true, max: 8 }
  );
  if (!taskMailIds.length) throw new Error(`${label}.history_go.task_mail_ids må inneholde minst ett id`);
  const out = {
    history_go: {
      task_mail_ids: taskMailIds,
      require_task_completed: true,
      require_history_go_correct: true
    }
  };
  for (const key of ["require_task_completed", "require_history_go_correct"]) {
    if (!hasOwn(historyGo, key)) continue;
    if (typeof historyGo[key] !== "boolean") throw new Error(`${label}.history_go.${key} må være boolean`);
    out.history_go[key] = historyGo[key];
  }
  if (hasOwn(historyGo, "min_effect")) {
    const minEffect = Number(historyGo.min_effect);
    if (!Number.isFinite(minEffect)) throw new Error(`${label}.history_go.min_effect må være et endelig tall`);
    out.history_go.min_effect = minEffect;
  }
  return out;
}

function normalizeCanonicalChoiceInputs(choices) {
  return (Array.isArray(choices) ? choices : [])
    .filter((choice) => choice && typeof choice === "object")
    .map((choice, index) => ({
      ...choice,
      id: norm(choice.id) || String.fromCharCode(65 + index),
      label: norm(choice.label || choice.text || choice.id),
      effect: numberOr(choice.effect, 0),
      tags: uniqueStrings(choice.tags),
      feedback: norm(choice.feedback)
    }))
    .filter((choice) => choice.id && choice.label);
}

function compatibilityChoiceInputs(choices) {
  // Keep the on-disk compatibility projection JSON-safe and source-faithful.
  // SceneCatalog applies its legacy normalizeChoices() after registry load, so
  // runtime-only values such as NaN are reproduced in memory instead of being
  // serialized as null. Array order and duplicate tags are deliberately kept.
  return (Array.isArray(choices) ? choices : [])
    .filter((choice) => choice && typeof choice === "object")
    .map((choice) => ({ ...choice }));
}

function normalizeProgression(value) {
  const input = value && typeof value === "object" ? value : {};
  const out = {};
  for (const key of ["role_delta", "competency_delta", "autonomy_delta", "economy_delta"]) {
    if (Number.isFinite(Number(input[key]))) out[key] = Number(input[key]);
  }
  return out;
}

function normalizeEffects(value, legacyScoreDelta, label = "effects") {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const out = {};
  const score = Number.isFinite(Number(input.score_delta)) ? Number(input.score_delta) : legacyScoreDelta;
  if (Number.isFinite(score)) out.score_delta = score;

  if (input.quality_axes && typeof input.quality_axes === "object" && !Array.isArray(input.quality_axes)) {
    const axes = {};
    for (const [key, raw] of Object.entries(input.quality_axes)) {
      if (Number.isFinite(Number(raw))) axes[key] = Number(raw);
    }
    if (Object.keys(axes).length) out.quality_axes = axes;
  }
  if (input.state_set && typeof input.state_set === "object" && !Array.isArray(input.state_set)) {
    const stateSet = {};
    for (const [key, raw] of Object.entries(input.state_set)) {
      if (["string", "number", "boolean"].includes(typeof raw) || raw === null) stateSet[key] = raw;
    }
    if (Object.keys(stateSet).length) out.state_set = stateSet;
  }
  const addFlags = uniqueIds(input.add_flags);
  if (addFlags.length) out.add_flags = addFlags;
  const removeFlags = uniqueIds(input.remove_flags);
  if (removeFlags.length) out.remove_flags = removeFlags;
  const progression = normalizeProgression(input.progression);
  if (Object.keys(progression).length) out.progression = progression;
  const triggerSceneIds = uniqueIds(input.trigger_scene_ids);
  if (triggerSceneIds.length) out.trigger_scene_ids = triggerSceneIds;
  if (hasOwn(input, "work_object_ops")) {
    const workObjectOps = normalizeWorkObjectOps(input.work_object_ops, `${label}.work_object_ops`);
    if (workObjectOps.length) out.work_object_ops = workObjectOps;
  }
  if (hasOwn(input, "social_standing_ops")) {
    const standingOps = normalizeSocialStandingOps(input.social_standing_ops, `${label}.social_standing_ops`);
    if (standingOps.length) out.social_standing_ops = standingOps;
  }
  return out;
}

function canonicalChoices(runtimeChoices, sourcePath, sceneId) {
  return runtimeChoices.map((choice, index) => {
    const out = {
      id: assertId(choice.id, `${sourcePath} :: ${sceneId} choice[${index}]`),
      label: norm(choice.label),
      effects: normalizeEffects(
        choice.effects,
        numberOr(choice.effect, 0),
        `${sourcePath} :: ${sceneId} choice[${index}].effects`
      )
    };
    const reply = norm(choice.reply);
    if (reply) out.reply = reply;
    const feedback = norm(choice.feedback);
    if (feedback) out.feedback = feedback;
    const affordance = normalizeChoiceAffordance(choice.affordance, `${sourcePath} :: ${sceneId} choice[${index}].affordance`);
    if (affordance) out.affordance = affordance;
    const authorityAction = normalizeAuthorityAction(choice.authority_action, `${sourcePath} :: ${sceneId} choice[${index}].authority_action`);
    if (authorityAction) out.authority_action = authorityAction;
    return out;
  });
}

function normalizeTaskContract(mail) {
  const source = mail?.task_contract && typeof mail.task_contract === "object" ? mail.task_contract : null;
  if (!source) return null;
  const taskId = norm(source.task_id);
  const completionRule = norm(source.completion_rule);
  if (!taskId || !ID_RE.test(taskId) || !completionRule) return null;
  const out = { task_id: taskId, completion_rule: completionRule };
  const failureRule = norm(source.failure_rule);
  if (failureRule) out.failure_rule = failureRule;
  const evidenceRefs = uniqueStrings(source.evidence_refs);
  if (evidenceRefs.length) out.evidence_refs = evidenceRefs;
  return out;
}

function normalizeKnowledgeContract(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : null;
  if (!source) return { version: 1, mode: "none", source_refs: [], frozen_fields: [] };
  const allowedModes = new Set(["none", "pinned", "pinned_rules_dynamic_explanation"]);
  const mode = allowedModes.has(norm(source.mode)) ? norm(source.mode) : "none";
  const out = {
    version: 1,
    mode,
    source_refs: uniqueStrings(source.source_refs),
    frozen_fields: uniqueStrings(source.frozen_fields).filter((field) =>
      ["interaction_mode", "choices", "task_contract", "effects", "success_rule", "answer_key"].includes(field)
    )
  };
  const dynamicFields = uniqueStrings(source.dynamic_fields).filter((field) =>
    ["content.explanation", "content.links", "job_description"].includes(field)
  );
  if (dynamicFields.length) out.dynamic_fields = dynamicFields;
  if (mode !== "none") {
    const rulesetRef = norm(source.ruleset_ref);
    const rulesetVersion = norm(source.ruleset_version);
    if (!rulesetRef || !rulesetVersion) {
      return { version: 1, mode: "none", source_refs: out.source_refs, frozen_fields: [] };
    }
    out.ruleset_ref = rulesetRef;
    out.ruleset_version = rulesetVersion;
  }
  return out;
}

function resolveInteractionMode(mail, choices, taskContract) {
  const explicit = norm(mail?.interaction_mode);
  if (["decision", "task", "ack", "info"].includes(explicit)) return explicit;
  if (taskContract) return "task";
  if (choices.length >= 2) return "decision";
  if (choices.length === 1) return "ack";
  return "info";
}

function resolveArcStage(mail) {
  for (const candidate of [mail?.arc_stage, mail?.phase, mail?.stage]) {
    const value = norm(candidate).toLowerCase();
    if (ARC_STAGES.has(value)) return value;
  }
  return "any";
}

function resolveDayPhase(mail) {
  for (const candidate of [mail?.day_phase, mail?.phase_tag]) {
    const value = norm(candidate).toLowerCase();
    if (DAY_PHASES.has(value)) return value;
  }
  return "any";
}

function canonicalThreadId(mail, roleScope, sceneId) {
  for (const candidate of [mail?.thread_id, mail?.thread_key, mail?.threadKey]) {
    const value = norm(candidate);
    if (value && ID_RE.test(value)) return value;
  }
  return assertId(`${roleScope}.mail.${sceneId}`, "generated thread_id");
}

function canonicalContent(mail, sceneId) {
  const subject = norm(mail?.subject || mail?.title || sceneId);
  const summary = norm(mail?.summary || mail?.purpose || subject);
  const situation = (Array.isArray(mail?.situation) ? mail.situation : []).map(norm).filter(Boolean);
  const out = {
    subject: subject || sceneId,
    summary: summary || subject || sceneId,
    situation: situation.length ? situation : [summary || subject || sceneId]
  };
  const explanation = norm(mail?.explanation);
  if (explanation) out.explanation = explanation;
  const links = (Array.isArray(mail?.links) ? mail.links : [])
    .filter((link) => link && typeof link === "object")
    .map((link) => ({
      label: norm(link.label),
      ref: norm(link.ref),
      ...(norm(link.kind) && ["fagverk", "place", "person", "task", "external"].includes(norm(link.kind))
        ? { kind: norm(link.kind) }
        : {})
    }))
    .filter((link) => link.label && link.ref);
  if (links.length) out.links = links;
  return out;
}

// Return the exact runtime source rank used by SceneCatalog.getFamilyPaths().
// null means physically present but not reachable by that owner.
export function runtimeSourceRank(sourcePath, catalog) {
  const category = norm(catalog?.category);
  const roleScope = norm(catalog?.role_scope);
  const mailType = norm(catalog?.mail_type || "job").toLowerCase();
  if (!category || !roleScope) return null;
  const normalizedPath = norm(sourcePath).replace(/\\/g, "/");
  if (normalizedPath === `${SOURCE_ROOT}/${category}/job/${roleScope}_intro_v2.json`) return 0;
  if (normalizedPath === `${SOURCE_ROOT}/${category}/job/${roleScope}_job.json`) return 1;
  if (EXTRA_MAIL_TYPE_SET.has(mailType)) {
    const extraIndex = EXTRA_MAIL_TYPES.indexOf(mailType);
    const canonical = `${SOURCE_ROOT}/${category}/${mailType}/${roleScope}_${mailType}.json`;
    if (normalizedPath === canonical) return 2 + extraIndex;
  }
  const brandId = norm(catalog?.brand_id).toLowerCase();
  if (brandId && normalizedPath === `${SOURCE_ROOT}/${category}/brand/${roleScope}_${brandId}.json`) {
    return 2 + EXTRA_MAIL_TYPES.length;
  }
  return null;
}

export function isRuntimeReachableCatalog(sourcePath, catalog) {
  return runtimeSourceRank(sourcePath, catalog) !== null;
}

function compileMail({ catalog, family, mail, sourcePath }) {
  const category = assertId(mail?.category || catalog?.category, `${sourcePath} category`);
  const roleScope = assertId(mail?.role_scope || catalog?.role_scope, `${sourcePath} role_scope`);
  const mailType = norm(mail?.mail_type || catalog?.mail_type || "job").toLowerCase();
  const sceneId = assertId(mail?.id, `${sourcePath} mail`);
  const canonicalChoiceInputs = normalizeCanonicalChoiceInputs(mail?.choices);
  const choices = canonicalChoices(canonicalChoiceInputs, sourcePath, sceneId);
  const compatibilityChoices = compatibilityChoiceInputs(mail?.choices).map((choice, index) => {
    const normalizedOps = choices[index]?.effects?.work_object_ops;
    const normalizedStandingOps = choices[index]?.effects?.social_standing_ops;
    const normalizedAuthorityAction = choices[index]?.authority_action;
    const normalizedAffordance = choices[index]?.affordance;
    if ((!Array.isArray(normalizedOps) || !normalizedOps.length) &&
        (!Array.isArray(normalizedStandingOps) || !normalizedStandingOps.length) &&
        !normalizedAuthorityAction && !normalizedAffordance) return choice;
    const out = { ...choice };
    if (normalizedAuthorityAction) out.authority_action = normalizedAuthorityAction;
    if (normalizedAffordance) out.affordance = normalizedAffordance;
    if ((Array.isArray(normalizedOps) && normalizedOps.length) ||
        (Array.isArray(normalizedStandingOps) && normalizedStandingOps.length)) {
      const rawEffects = choice?.effects && typeof choice.effects === "object" && !Array.isArray(choice.effects) ? choice.effects : {};
      out.effects = {
        ...rawEffects,
        ...(Array.isArray(normalizedOps) && normalizedOps.length ? { work_object_ops: normalizedOps } : {}),
        ...(Array.isArray(normalizedStandingOps) && normalizedStandingOps.length ? { social_standing_ops: normalizedStandingOps } : {})
      };
    }
    return out;
  });
  const taskContract = normalizeTaskContract(mail);
  const workContext = normalizeWorkContext(
    mail?.work_context,
    `${sourcePath} :: ${sceneId} work_context`
  );
  const socialStandingContext = normalizeSocialStandingContext(
    mail?.social_standing_context,
    `${sourcePath} :: ${sceneId} social_standing_context`
  );
  const authorityContext = normalizeAuthorityContext(mail?.authority_context, `${sourcePath} :: ${sceneId} authority_context`);
  validateAuthorityBindings(authorityContext, choices, workContext, sourcePath, sceneId);
  const sceneEffects = normalizeEffects(
    mail?.effects,
    undefined,
    `${sourcePath} :: ${sceneId} effects`
  );
  const interactionMode = resolveInteractionMode(mail, choices, taskContract);
  if (interactionMode === "decision" && choices.length < 2) throw new Error(`${sourcePath} :: ${sceneId} decision mangler to reelle valg`);
  if (interactionMode === "decision" && choices.some((choice) => choice.affordance)) {
    const baselineChoices = choices.filter((choice) => !choice.affordance);
    if (baselineChoices.length < 2) {
      throw new Error(`${sourcePath} :: ${sceneId} affordance-decision må beholde to ungated baseline-valg`);
    }
  }
  if (interactionMode === "task" && !taskContract) throw new Error(`${sourcePath} :: ${sceneId} task mangler gyldig task_contract`);
  if (interactionMode === "info" && choices.length) throw new Error(`${sourcePath} :: ${sceneId} info kan ikke ha valg`);
  if (interactionMode === "ack" && choices.length > 1) throw new Error(`${sourcePath} :: ${sceneId} ack kan ikke ha mer enn ett valg`);

  const situation = (Array.isArray(mail?.situation) ? mail.situation : []).map(norm).filter(Boolean);
  const compatibilityProjection = {
    ...mail,
    id: sceneId,
    category,
    role_scope: roleScope,
    mail_type: mailType,
    mail_family: norm(mail?.mail_family || family?.id),
    choices: compatibilityChoices,
    situation: situation.length ? situation : [norm(mail?.summary)].filter(Boolean),
    ...(workContext ? { work_context: workContext } : {}),
    ...(socialStandingContext ? { social_standing_context: socialStandingContext } : {}),
    ...(authorityContext ? { authority_context: authorityContext } : {}),
    scene_catalog_source_path: sourcePath,
    scene_catalog_version: 1
  };
  if ((Array.isArray(sceneEffects.work_object_ops) && sceneEffects.work_object_ops.length) ||
      (Array.isArray(sceneEffects.social_standing_ops) && sceneEffects.social_standing_ops.length)) {
    const rawEffects = mail?.effects && typeof mail.effects === "object" && !Array.isArray(mail.effects)
      ? mail.effects
      : {};
    compatibilityProjection.effects = {
      ...rawEffects,
      ...(Array.isArray(sceneEffects.work_object_ops) && sceneEffects.work_object_ops.length ? { work_object_ops: sceneEffects.work_object_ops } : {}),
      ...(Array.isArray(sceneEffects.social_standing_ops) && sceneEffects.social_standing_ops.length ? { social_standing_ops: sceneEffects.social_standing_ops } : {})
    };
  }

  const scene = {
    schema: SCENE_SCHEMA,
    version: SCENE_VERSION,
    id: sceneId,
    domain: "work",
    scene_kind: SCENE_KIND_BY_MAIL_TYPE[mailType] || "task",
    delivery: "mail",
    day_phase: resolveDayPhase(mail),
    arc_stage: resolveArcStage(mail),
    interaction_mode: interactionMode,
    thread_id: canonicalThreadId(mail, roleScope, sceneId),
    ...(workContext ? { work_context: workContext } : {}),
    ...(socialStandingContext ? { social_standing_context: socialStandingContext } : {}),
    ...(authorityContext ? { authority_context: authorityContext } : {}),
    content: canonicalContent(mail, sceneId),
    choices,
    effects: sceneEffects,
    knowledge_contract: normalizeKnowledgeContract(mail?.knowledge_contract),
    provenance: {
      adapter: "mail_family",
      source_path: sourcePath,
      source_id: sceneId,
      source_schema: norm(catalog?.schema || "civication_mail_family_catalog_v1"),
      compiled_at_build: true
    }
  };
  const practiceStoryId = norm(mail?.practice_story_id);
  if (practiceStoryId && ID_RE.test(practiceStoryId)) scene.practice_story_id = practiceStoryId;
  const peopleIds = uniqueIds(mail?.people_ids);
  if (peopleIds.length) scene.people_ids = peopleIds;
  const placeId = norm(mail?.place_id);
  if (placeId && ID_RE.test(placeId)) scene.place_id = placeId;
  if (interactionMode === "task") scene.task_contract = taskContract;

  return {
    id: sceneId,
    category,
    role_scope: roleScope,
    mail_type: mailType,
    source_path: sourcePath,
    source_schema: norm(catalog?.schema || "civication_mail_family_catalog_v1"),
    source_hash: sha256(mail),
    scene,
    compatibility_projection: compatibilityProjection
  };
}

function duplicateRoutingSignature(entry) {
  const mail = entry?.compatibility_projection || {};
  return stableStringify({
    mail_type: norm(mail.mail_type),
    mail_family: norm(mail.mail_family),
    priority: numberOr(mail.priority, 1),
    phase: norm(mail.phase),
    stage: norm(mail.stage || "stable") || "stable",
    cooldown: numberOr(mail.cooldown, 0),
    repeatable: mail.repeatable === true,
    thread_key: norm(mail.thread_key || mail.threadKey),
    narrative_arc: norm(mail.narrative_arc),
    thread_canonical: mail.thread_canonical === true,
    requires: mail.requires || null,
    forbids: mail.forbids || null,
    required_flags: uniqueStrings(mail.required_flags),
    forbidden_flags: uniqueStrings(mail.forbidden_flags)
  });
}

function canShadowDuplicate(kept, shadowed) {
  return duplicateRoutingSignature(kept) === duplicateRoutingSignature(shadowed);
}

function validateChoiceAffordanceReferences(entries) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  for (const entry of entries) {
    for (const choice of Array.isArray(entry?.scene?.choices) ? entry.scene.choices : []) {
      const taskMailIds = choice?.affordance?.history_go?.task_mail_ids;
      if (!Array.isArray(taskMailIds)) continue;
      for (const taskMailId of taskMailIds) {
        const target = byId.get(taskMailId);
        if (!target) {
          throw new Error(`${entry.source_path} :: ${entry.id} choice ${choice.id} affordance peker på ukjent task mail ${taskMailId}`);
        }
        if (target.scene?.interaction_mode !== "task") {
          throw new Error(`${entry.source_path} :: ${entry.id} choice ${choice.id} affordance peker på ${taskMailId} som ikke er task-scene`);
        }
        if (target.scene?.task_contract?.completion_rule !== "history_go_payload_completed") {
          throw new Error(`${entry.source_path} :: ${entry.id} choice ${choice.id} affordance peker på ${taskMailId} uten History Go completion-kontrakt`);
        }
      }
    }
  }
}

function assertRegistryEntry(entry) {
  const scene = entry?.scene;
  if (!scene || scene.schema !== SCENE_SCHEMA || scene.version !== SCENE_VERSION) {
    throw new Error(`${entry?.source_path || "unknown"} :: ${entry?.id || "unknown"} mangler civication_scene_v1`);
  }
  assertId(scene.id, "scene.id");
  assertId(scene.thread_id, `${scene.id} thread_id`);
  if (scene.interaction_mode === "decision" && scene.choices.length < 2) throw new Error(`${scene.id} decision uten to valg`);
  if (scene.interaction_mode === "task" && !scene.task_contract) throw new Error(`${scene.id} task uten task_contract`);
  if (scene.interaction_mode === "info" && scene.choices.length !== 0) throw new Error(`${scene.id} info med valg`);
  if (scene.interaction_mode === "ack" && scene.choices.length > 1) throw new Error(`${scene.id} ack med for mange valg`);
  return true;
}

export async function compileRegistryFromRepo(repoRoot = process.cwd()) {
  const absoluteRepoRoot = path.resolve(repoRoot);
  const sourceFiles = await walkFiles(path.join(absoluteRepoRoot, SOURCE_ROOT), (filePath) => filePath.endsWith(".json"));
  if (!sourceFiles.length) throw new Error(`Ingen JSON-kilder funnet under ${SOURCE_ROOT}`);

  const reachableCatalogs = [];
  const ignoredSourceFiles = [];
  for (const filePath of sourceFiles) {
    const sourcePath = repoRelative(absoluteRepoRoot, filePath);
    let catalog;
    try {
      catalog = JSON.parse(await readFile(filePath, "utf8"));
    } catch (error) {
      throw new Error(`${sourcePath} er ugyldig JSON: ${error.message}`);
    }
    const rank = catalog && Array.isArray(catalog.families) ? runtimeSourceRank(sourcePath, catalog) : null;
    if (rank === null) {
      ignoredSourceFiles.push(sourcePath);
      continue;
    }
    reachableCatalogs.push({ sourcePath, catalog, rank });
  }

  // The filesystem inventory order is irrelevant. Runtime owner order is:
  // category/role, intro, job, then EXTRA_MAIL_TYPES in declared order.
  reachableCatalogs.sort((a, b) =>
    norm(a.catalog?.category).localeCompare(norm(b.catalog?.category), "en") ||
    norm(a.catalog?.role_scope).localeCompare(norm(b.catalog?.role_scope), "en") ||
    a.rank - b.rank ||
    a.sourcePath.localeCompare(b.sourcePath, "en")
  );

  const entries = [];
  const compiledSourceFiles = [];
  const shadowedDuplicates = [];
  const seenSceneIds = new Map();
  for (const { sourcePath, catalog, rank } of reachableCatalogs) {
    compiledSourceFiles.push(sourcePath);
    for (const family of catalog.families) {
      for (const mail of Array.isArray(family?.mails) ? family.mails : []) {
        const entry = compileMail({ catalog, family, mail, sourcePath });
        assertRegistryEntry(entry);
        const previous = seenSceneIds.get(entry.id);
        if (previous) {
          if (!canShadowDuplicate(previous.entry, entry)) {
            throw new Error(
              `Duplikat scene-id ${entry.id} har ulik runtime-routing: ${previous.entry.source_path} og ${sourcePath}`
            );
          }
          shadowedDuplicates.push({
            id: entry.id,
            kept_source_path: previous.entry.source_path,
            kept_source_rank: previous.rank,
            shadowed_source_path: sourcePath,
            shadowed_source_rank: rank,
            routing_signature: sha256(duplicateRoutingSignature(entry))
          });
          continue;
        }
        seenSceneIds.set(entry.id, { entry, rank });
        entries.push(entry);
      }
    }
  }

  validateChoiceAffordanceReferences(entries);

  // role_index is runtime-semantic: preserve source-rank, source-file and in-file mail order.
  // entries may still be canonically sorted for stable reviewable output after the index is captured.
  const roleIndex = {};
  for (const entry of entries) {
    const key = `${entry.category}/${entry.role_scope}`;
    if (!roleIndex[key]) roleIndex[key] = [];
    roleIndex[key].push(entry.id);
  }

  entries.sort((a, b) =>
    a.category.localeCompare(b.category, "en") ||
    a.role_scope.localeCompare(b.role_scope, "en") ||
    a.mail_type.localeCompare(b.mail_type, "en") ||
    a.id.localeCompare(b.id, "en")
  );
  shadowedDuplicates.sort((a, b) =>
    a.id.localeCompare(b.id, "en") || a.shadowed_source_path.localeCompare(b.shadowed_source_path, "en")
  );

  const sortedRoleIndex = Object.fromEntries(
    Object.entries(roleIndex)
      .sort(([a], [b]) => a.localeCompare(b, "en"))
  );

  const legacyFallbackFiles = await walkFiles(
    path.join(absoluteRepoRoot, LEGACY_FALLBACK_ROOT),
    (filePath) => filePath.endsWith(".json")
  );

  const baseRegistry = {
    schema: REGISTRY_SCHEMA,
    version: REGISTRY_VERSION,
    compiler_version: COMPILER_VERSION,
    scene_contract: "data/Civication/sceneContractV1.schema.json",
    source_root: SOURCE_ROOT,
    compiled_source_files: [...compiledSourceFiles],
    ignored_source_files: [...ignoredSourceFiles].sort((a, b) => a.localeCompare(b, "en")),
    shadowed_duplicates: shadowedDuplicates,
    runtime_materialized_sources: DYNAMIC_SOURCES.map((entry) => ({ ...entry })),
    entries,
    role_index: sortedRoleIndex,
    legacy_fallback_inventory: { root: LEGACY_FALLBACK_ROOT, file_count: legacyFallbackFiles.length },
    stats: {
      input_file_count: sourceFiles.length,
      compiled_source_file_count: compiledSourceFiles.length,
      ignored_source_file_count: ignoredSourceFiles.length,
      shadowed_duplicate_count: shadowedDuplicates.length,
      scene_count: entries.length,
      role_count: Object.keys(sortedRoleIndex).length
    }
  };
  return { ...baseRegistry, registry_hash: sha256(baseRegistry) };
}

export async function writeRegistry(repoRoot = process.cwd(), outputPath = DEFAULT_OUTPUT) {
  const registry = await compileRegistryFromRepo(repoRoot);
  const absoluteOutput = path.resolve(repoRoot, outputPath);
  await mkdir(path.dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, `${stableStringify(registry, 2)}\n`, "utf8");
  return { registry, outputPath: repoRelative(path.resolve(repoRoot), absoluteOutput) };
}

export async function checkRegistry(repoRoot = process.cwd(), outputPath = DEFAULT_OUTPUT) {
  const registry = await compileRegistryFromRepo(repoRoot);
  const absoluteOutput = path.resolve(repoRoot, outputPath);
  if (!(await exists(absoluteOutput))) throw new Error(`${outputPath} finnes ikke; kjør compiler med --write når 4H-B materialiserer registryet`);
  const current = await readFile(absoluteOutput, "utf8");
  const expected = `${stableStringify(registry, 2)}\n`;
  if (current !== expected) throw new Error(`${outputPath} er ute av sync med kildene`);
  return registry;
}

function parseCliArgs(argv) {
  const args = new Set(argv);
  const outIndex = argv.indexOf("--out");
  return {
    write: args.has("--write"),
    check: args.has("--check"),
    json: args.has("--json"),
    outputPath: outIndex >= 0 && argv[outIndex + 1] ? argv[outIndex + 1] : DEFAULT_OUTPUT
  };
}

async function main() {
  const cli = parseCliArgs(process.argv.slice(2));
  if (cli.write && cli.check) throw new Error("Bruk enten --write eller --check, ikke begge");
  let registry;
  if (cli.write) ({ registry } = await writeRegistry(process.cwd(), cli.outputPath));
  else if (cli.check) registry = await checkRegistry(process.cwd(), cli.outputPath);
  else registry = await compileRegistryFromRepo(process.cwd());
  const summary = {
    schema: registry.schema,
    version: registry.version,
    registry_hash: registry.registry_hash,
    scenes: registry.stats.scene_count,
    roles: registry.stats.role_count,
    compiled_source_files: registry.stats.compiled_source_file_count,
    ignored_source_files: registry.stats.ignored_source_file_count,
    shadowed_duplicates: registry.stats.shadowed_duplicate_count,
    legacy_fallback_files: registry.legacy_fallback_inventory.file_count,
    wrote: cli.write ? cli.outputPath : null,
    checked: cli.check ? cli.outputPath : null
  };
  console.log(cli.json ? JSON.stringify(summary) : `[CivicationSceneRegistry] ${JSON.stringify(summary)}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedPath && import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(`[CivicationSceneRegistry] ${error?.stack || error}`);
    process.exitCode = 1;
  });
}
