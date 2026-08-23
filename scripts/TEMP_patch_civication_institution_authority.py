from pathlib import Path

ROOT = Path.cwd()

def replace_once(path, old, new):
    p = ROOT / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'needle not found in {path}: {old[:100]!r}')
    if text.count(old) != 1:
        raise SystemExit(f'needle not unique in {path}: {text.count(old)}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')

replace_once(
    'data/Civication/sceneContractV1.schema.json',
    '    "work_context": { "$ref": "#/$defs/workContext" },\n    "content": {',
    '    "work_context": { "$ref": "#/$defs/workContext" },\n    "authority_context": { "$ref": "#/$defs/authorityContext" },\n    "content": {'
)
replace_once(
    'data/Civication/sceneContractV1.schema.json',
    '        "feedback": { "type": "string", "minLength": 1 },\n        "effects": { "$ref": "#/$defs/effects" }',
    '        "feedback": { "type": "string", "minLength": 1 },\n        "authority_action": { "$ref": "#/$defs/authorityAction" },\n        "effects": { "$ref": "#/$defs/effects" }'
)
authority_defs = r'''    "authorityAction": {
      "type": "object",
      "additionalProperties": false,
      "required": ["action_id", "intent"],
      "properties": {
        "action_id": { "$ref": "#/$defs/nonEmptyId" },
        "intent": { "enum": ["execute", "recommend", "request_approval", "wait", "escalate"] }
      }
    },
    "authorityContext": {
      "type": "object",
      "additionalProperties": false,
      "required": ["institution_id", "unit_id", "role_scope", "reporting_line", "approval_points", "authority_rules", "resources", "escalation_paths"],
      "properties": {
        "institution_id": { "$ref": "#/$defs/nonEmptyId" },
        "unit_id": { "$ref": "#/$defs/nonEmptyId" },
        "role_scope": { "$ref": "#/$defs/nonEmptyId" },
        "reporting_line": { "type": "array", "items": { "$ref": "#/$defs/nonEmptyId" }, "uniqueItems": true },
        "peer_functions": { "type": "array", "items": { "$ref": "#/$defs/nonEmptyId" }, "uniqueItems": true, "default": [] },
        "external_counterparts": { "type": "array", "items": { "$ref": "#/$defs/nonEmptyId" }, "uniqueItems": true, "default": [] },
        "goals_pressures": { "type": "array", "items": { "$ref": "#/$defs/nonEmptyId" }, "uniqueItems": true, "default": [] },
        "approval_points": { "type": "array", "items": { "$ref": "#/$defs/approvalPoint" }, "maxItems": 16 },
        "authority_rules": { "type": "array", "items": { "$ref": "#/$defs/authorityRule" }, "minItems": 1, "maxItems": 32 },
        "resources": { "type": "array", "items": { "$ref": "#/$defs/institutionalResource" }, "maxItems": 16 },
        "escalation_paths": { "type": "array", "items": { "$ref": "#/$defs/escalationPath" }, "maxItems": 16 }
      }
    },
    "approvalPoint": {
      "type": "object",
      "additionalProperties": false,
      "required": ["approval_id", "action_id", "approver_actor_id", "approval_object_id"],
      "properties": {
        "approval_id": { "$ref": "#/$defs/nonEmptyId" },
        "action_id": { "$ref": "#/$defs/nonEmptyId" },
        "approver_actor_id": { "$ref": "#/$defs/nonEmptyId" },
        "approval_object_id": { "$ref": "#/$defs/nonEmptyId" }
      }
    },
    "authorityRule": {
      "type": "object",
      "additionalProperties": false,
      "required": ["action_id", "authority", "requires_resources"],
      "properties": {
        "action_id": { "$ref": "#/$defs/nonEmptyId" },
        "authority": { "enum": ["direct", "approval_required", "influence_only", "forbidden"] },
        "approval_id": { "$ref": "#/$defs/nonEmptyId" },
        "escalation_id": { "$ref": "#/$defs/nonEmptyId" },
        "requires_resources": { "type": "array", "items": { "$ref": "#/$defs/nonEmptyId" }, "uniqueItems": true }
      }
    },
    "institutionalResource": {
      "type": "object",
      "additionalProperties": false,
      "required": ["resource_id", "baseline_state"],
      "properties": {
        "resource_id": { "$ref": "#/$defs/nonEmptyId" },
        "baseline_state": { "enum": ["available", "limited", "unavailable"] },
        "resource_object_id": { "$ref": "#/$defs/nonEmptyId" }
      }
    },
    "escalationPath": {
      "type": "object",
      "additionalProperties": false,
      "required": ["escalation_id", "action_id", "target_actor_id", "escalation_object_id"],
      "properties": {
        "escalation_id": { "$ref": "#/$defs/nonEmptyId" },
        "action_id": { "$ref": "#/$defs/nonEmptyId" },
        "target_actor_id": { "$ref": "#/$defs/nonEmptyId" },
        "escalation_object_id": { "$ref": "#/$defs/nonEmptyId" }
      }
    },
'''
replace_once('data/Civication/sceneContractV1.schema.json', '    "taskContract": {', authority_defs + '    "taskContract": {')

compiler_helpers = r'''
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
'''
replace_once('scripts/build-civication-scene-registry.mjs', '\nconst CREATE_SEED_KEYS = new Set([', compiler_helpers + '\nconst CREATE_SEED_KEYS = new Set([')
replace_once('scripts/build-civication-scene-registry.mjs', '''    const feedback = norm(choice.feedback);\n    if (feedback) out.feedback = feedback;\n    return out;''', '''    const feedback = norm(choice.feedback);\n    if (feedback) out.feedback = feedback;\n    const authorityAction = normalizeAuthorityAction(choice.authority_action, `${sourcePath} :: ${sceneId} choice[${index}].authority_action`);\n    if (authorityAction) out.authority_action = authorityAction;\n    return out;''')
old_compat = '''  const compatibilityChoices = compatibilityChoiceInputs(mail?.choices).map((choice, index) => {\n    const normalizedOps = choices[index]?.effects?.work_object_ops;\n    if (!Array.isArray(normalizedOps) || !normalizedOps.length) return choice;\n    const rawEffects = choice?.effects && typeof choice.effects === "object" && !Array.isArray(choice.effects)\n      ? choice.effects\n      : {};\n    return {\n      ...choice,\n      effects: {\n        ...rawEffects,\n        work_object_ops: normalizedOps\n      }\n    };\n  });'''
new_compat = '''  const compatibilityChoices = compatibilityChoiceInputs(mail?.choices).map((choice, index) => {\n    const normalizedOps = choices[index]?.effects?.work_object_ops;\n    const normalizedAuthorityAction = choices[index]?.authority_action;\n    if ((!Array.isArray(normalizedOps) || !normalizedOps.length) && !normalizedAuthorityAction) return choice;\n    const out = { ...choice };\n    if (normalizedAuthorityAction) out.authority_action = normalizedAuthorityAction;\n    if (Array.isArray(normalizedOps) && normalizedOps.length) {\n      const rawEffects = choice?.effects && typeof choice.effects === "object" && !Array.isArray(choice.effects) ? choice.effects : {};\n      out.effects = { ...rawEffects, work_object_ops: normalizedOps };\n    }\n    return out;\n  });'''
replace_once('scripts/build-civication-scene-registry.mjs', old_compat, new_compat)
replace_once('scripts/build-civication-scene-registry.mjs', '''  const taskContract = normalizeTaskContract(mail);\n  const workContext = normalizeWorkContext(\n    mail?.work_context,\n    `${sourcePath} :: ${sceneId} work_context`\n  );\n  const sceneEffects = normalizeEffects(''', '''  const taskContract = normalizeTaskContract(mail);\n  const workContext = normalizeWorkContext(\n    mail?.work_context,\n    `${sourcePath} :: ${sceneId} work_context`\n  );\n  const authorityContext = normalizeAuthorityContext(mail?.authority_context, `${sourcePath} :: ${sceneId} authority_context`);\n  validateAuthorityBindings(authorityContext, choices, workContext, sourcePath, sceneId);\n  const sceneEffects = normalizeEffects(''')
replace_once('scripts/build-civication-scene-registry.mjs', '''    ...(workContext ? { work_context: workContext } : {}),\n    scene_catalog_source_path: sourcePath,''', '''    ...(workContext ? { work_context: workContext } : {}),\n    ...(authorityContext ? { authority_context: authorityContext } : {}),\n    scene_catalog_source_path: sourcePath,''')
replace_once('scripts/build-civication-scene-registry.mjs', '''    ...(workContext ? { work_context: workContext } : {}),\n    content: canonicalContent(mail, sceneId),''', '''    ...(workContext ? { work_context: workContext } : {}),\n    ...(authorityContext ? { authority_context: authorityContext } : {}),\n    content: canonicalContent(mail, sceneId),''')

replace_once('js/Civication/systems/day/dayConsequences.js', '  const WORK_WORLD_SCRIPT = "js/Civication/core/civicationWorkWorld.js";\n  let workWorldLoadPromise = null;', '  const WORK_WORLD_SCRIPT = "js/Civication/core/civicationWorkWorld.js";\n  const AUTHORITY_SCRIPT = "js/Civication/core/civicationInstitutionAuthority.js";\n  let workWorldLoadPromise = null;\n  let authorityLoadPromise = null;')
authority_loader = r'''
  function attachAuthorityResolver() {
    const rt = runtimeWindow();
    return rt.CivicationInstitutionAuthority?.evaluate ? rt.CivicationInstitutionAuthority : null;
  }

  function ensureAuthorityResolver() {
    const attached = attachAuthorityResolver();
    if (attached) return Promise.resolve(attached);
    if (authorityLoadPromise) return authorityLoadPromise;
    authorityLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = AUTHORITY_SCRIPT;
      script.async = false;
      script.onload = () => {
        const resolver = attachAuthorityResolver();
        if (!resolver) reject(new Error("CivicationInstitutionAuthority lastet uten resolver"));
        else resolve(resolver);
      };
      script.onerror = () => reject(new Error(`Kunne ikke laste ${AUTHORITY_SCRIPT}`));
      (document.head || document.documentElement).appendChild(script);
    }).catch((error) => {
      authorityLoadPromise = null;
      throw error;
    });
    return authorityLoadPromise;
  }
'''
replace_once('js/Civication/systems/day/dayConsequences.js', '\n  function collectWorkObjectOps(eventObj, choice) {', authority_loader + '\n  function collectWorkObjectOps(eventObj, choice) {')
authority_middleware = r'''
  async function authorityAnswerMiddleware(ctx, next) {
    const eventObj = ctx?.eventObj || null;
    const choiceId = normStr(ctx?.choiceId);
    const choice = Array.isArray(eventObj?.choices) ? eventObj.choices.find((candidate) => normStr(candidate?.id) === choiceId) : null;
    if (!choice?.authority_action) return next();
    const [resolver, workWorld] = await Promise.all([ensureAuthorityResolver(), ensureWorkWorld()]);
    const decision = resolver.evaluate(eventObj?.authority_context, choice.authority_action, { role_scope: activeRoleScope(), work_world: workWorld });
    if (!decision?.allowed) return { ok: false, reason: "authority_blocked", authority: decision || { allowed: false, reason: "authority_resolution_failed" } };
    const result = await next();
    if (result && typeof result === "object" && result.ok) result.authority = decision;
    return result;
  }
'''
replace_once('js/Civication/systems/day/dayConsequences.js', '\n  function mergeBranchState(delta) {', authority_middleware + '\n  function mergeBranchState(delta) {')
replace_once('js/Civication/systems/day/dayConsequences.js', '''    window.CivicationChoiceDirector.registerHandler(\n      "dayConsequences",\n      applyChoiceConsequences,\n      10\n    );''', '''    window.CivicationChoiceDirector.registerAnswerMiddleware?.(\n      "institutionAuthority",\n      authorityAnswerMiddleware,\n      25\n    );\n    window.CivicationChoiceDirector.registerHandler(\n      "dayConsequences",\n      applyChoiceConsequences,\n      10\n    );''')

print('institution authority patch applied')
