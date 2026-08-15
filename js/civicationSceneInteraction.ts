// Canonical Scene Contract v1 interaction semantics for Civication legacy scenes.
// Built to the legacy script URL through build/build-web.mjs during the strangler migration.

type SceneInteractionMode = "decision" | "task" | "ack" | "info";

type SceneChoice = {
  id?: unknown;
  label?: unknown;
  [key: string]: unknown;
};

type SceneTaskContract = {
  task_id: string;
  completion_rule: string;
  failure_rule?: string;
  evidence_refs?: string[];
  [key: string]: unknown;
};

type SceneLike = {
  id?: unknown;
  source_mail_id?: unknown;
  choices?: SceneChoice[];
  interaction_mode?: unknown;
  task_contract?: Record<string, unknown>;
  task_payload?: Record<string, unknown>;
  task_id?: unknown;
  task_gate_id?: unknown;
  task_required?: unknown;
  requires_task_completion?: unknown;
  completion_rule?: unknown;
  expected_output?: unknown;
  mail_type?: unknown;
  type?: unknown;
  kind?: unknown;
  slot?: unknown;
  task_kind?: unknown;
  [key: string]: unknown;
};

type SceneInteractionResult = {
  version: number;
  mode: string;
  explicit: boolean;
  inferred: boolean;
  valid: boolean;
  actionable: boolean;
  passive: boolean;
  choice_count: number;
  block_reason: string | null;
  task_contract: SceneTaskContract | null;
};

type FilteredSceneList = SceneLike[] & {
  __career_outcome_terminal_closed?: boolean;
  __scene_interaction_input_count?: number;
  __scene_interaction_blocked_count?: number;
  __scene_interaction_passive_count?: number;
  __scene_interaction_blocked_ids?: string[];
  __scene_interaction_passive_ids?: string[];
  __scene_interaction_suppress_legacy_fallback?: boolean;
};

type SceneInteractionApi = {
  version: number;
  modes: SceneInteractionMode[];
  classify: (scene: SceneLike) => SceneInteractionResult;
  decorate: (scene: SceneLike) => SceneLike;
  isActionable: (scene: SceneLike) => boolean;
  filterActionable: (candidates: SceneLike[]) => FilteredSceneList;
  resolveTaskContract: (scene: SceneLike) => SceneTaskContract | null;
};

type RuntimeWindow = Window & typeof globalThis & {
  CivicationSceneInteraction?: SceneInteractionApi;
};

const win = window as RuntimeWindow;
const VERSION = 1;
const MODES = new Set<SceneInteractionMode>(["decision", "task", "ack", "info"]);

function norm(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function normalizedChoices(scene: SceneLike): SceneChoice[] {
  return Array.isArray(scene?.choices) ? scene.choices.filter(Boolean) : [];
}

function hasLegacyTaskSignal(scene: SceneLike): boolean {
  if (!scene || typeof scene !== "object") return false;
  if (scene.task_contract && typeof scene.task_contract === "object") return true;
  if (norm(scene.task_id) || norm(scene.task_gate_id)) return true;
  if (scene.task_required === true || scene.requires_task_completion === true) return true;
  const kind = [scene.mail_type, scene.type, scene.kind, scene.slot, scene.task_kind]
    .map((value) => norm(value).toLowerCase())
    .join(" ");
  return kind.includes("task_gate");
}

function resolveTaskContract(scene: SceneLike): SceneTaskContract | null {
  const explicit = scene?.task_contract && typeof scene.task_contract === "object"
    ? scene.task_contract
    : {};
  const payload = scene?.task_payload && typeof scene.task_payload === "object"
    ? scene.task_payload
    : {};
  const taskId = norm(explicit.task_id || scene?.task_id || scene?.task_gate_id || payload.gate_id);
  const completionRule = norm(
    explicit.completion_rule ||
    scene?.completion_rule ||
    scene?.expected_output ||
    payload.expected_output
  );
  if (!taskId || !completionRule) return null;
  const evidenceRefs = Array.isArray(explicit.evidence_refs)
    ? [...new Set(explicit.evidence_refs.map(norm).filter(Boolean))]
    : [];
  const out: SceneTaskContract = {
    ...explicit,
    task_id: taskId,
    completion_rule: completionRule
  };
  if (norm(explicit.failure_rule)) out.failure_rule = norm(explicit.failure_rule);
  if (evidenceRefs.length) out.evidence_refs = evidenceRefs;
  return out;
}

function inferMode(scene: SceneLike, choices: SceneChoice[]): SceneInteractionMode {
  if (hasLegacyTaskSignal(scene)) return "task";
  if (choices.length >= 2) return "decision";
  if (choices.length === 1) return "ack";
  return "info";
}

function classify(scene: SceneLike): SceneInteractionResult {
  const choices = normalizedChoices(scene);
  const rawMode = norm(scene?.interaction_mode).toLowerCase();
  const explicitMode = rawMode || null;
  const mode = explicitMode && MODES.has(explicitMode as SceneInteractionMode)
    ? explicitMode
    : (explicitMode || inferMode(scene, choices));
  const taskContract = mode === "task" ? resolveTaskContract(scene) : null;

  let valid = true;
  let blockReason: string | null = null;

  if (explicitMode && !MODES.has(explicitMode as SceneInteractionMode)) {
    valid = false;
    blockReason = "unknown_interaction_mode";
  } else if (mode === "decision" && choices.length < 2) {
    valid = false;
    blockReason = "decision_requires_two_choices";
  } else if (mode === "task" && !taskContract) {
    valid = false;
    blockReason = "task_requires_contract";
  } else if (mode === "info" && choices.length !== 0) {
    valid = false;
    blockReason = "info_requires_zero_choices";
  } else if (mode === "ack" && choices.length > 1) {
    valid = false;
    blockReason = "ack_allows_at_most_one_choice";
  }

  const actionable = valid && (
    mode === "decision" ||
    mode === "task" ||
    (mode === "ack" && choices.length === 1)
  );

  return {
    version: VERSION,
    mode,
    explicit: Boolean(explicitMode),
    inferred: !explicitMode,
    valid,
    actionable,
    passive: valid && !actionable,
    choice_count: choices.length,
    block_reason: blockReason,
    task_contract: taskContract
  };
}

function decorate(scene: SceneLike): SceneLike {
  if (!scene || typeof scene !== "object") return scene;
  const result = classify(scene);
  const out: SceneLike = {
    ...scene,
    interaction_mode: result.mode,
    interaction_contract_version: VERSION,
    interaction_valid: result.valid,
    interaction_actionable: result.actionable,
    interaction_passive: result.passive,
    interaction_mode_inferred: result.inferred
  };
  if (result.block_reason) out.interaction_block_reason = result.block_reason;
  else delete out.interaction_block_reason;
  if (result.mode === "task" && result.task_contract) out.task_contract = result.task_contract;
  return out;
}

function isActionable(scene: SceneLike): boolean {
  return classify(scene).actionable === true;
}

function filterActionable(candidates: SceneLike[]): FilteredSceneList {
  const input = Array.isArray(candidates) ? candidates : [];
  const out: SceneLike[] = [];
  const blockedIds: string[] = [];
  const passiveIds: string[] = [];

  for (const candidate of input) {
    const decorated = decorate(candidate);
    const result = classify(decorated);
    const id = norm(decorated?.id || decorated?.source_mail_id);
    if (!result.valid) {
      if (id) blockedIds.push(id);
      continue;
    }
    if (!result.actionable) {
      if (id) passiveIds.push(id);
      continue;
    }
    out.push(decorated);
  }

  const source = candidates as FilteredSceneList;
  return Object.assign(out, {
    ...(source.__career_outcome_terminal_closed === true
      ? { __career_outcome_terminal_closed: true }
      : {}),
    __scene_interaction_input_count: input.length,
    __scene_interaction_blocked_count: blockedIds.length,
    __scene_interaction_passive_count: passiveIds.length,
    __scene_interaction_blocked_ids: blockedIds,
    __scene_interaction_passive_ids: passiveIds,
    __scene_interaction_suppress_legacy_fallback: input.length > 0 && out.length === 0
  }) as FilteredSceneList;
}

const api: SceneInteractionApi = {
  version: VERSION,
  modes: [...MODES],
  classify,
  decorate,
  isActionable,
  filterActionable,
  resolveTaskContract
};

win.CivicationSceneInteraction = api;
