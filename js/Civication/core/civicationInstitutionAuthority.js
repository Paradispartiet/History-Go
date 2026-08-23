// @ts-check
// CivicationInstitutionAuthority — pure authority resolver for canonical Civication scenes.
// Dynamic approval/escalation/resource state remains owned by CivicationWorkWorld.
(function (root, factory) {
  "use strict";
  const exported = factory();
  const target = /** @type {any} */ (root);
  if (target) target.CivicationInstitutionAuthority = exported;
  if (typeof module !== "undefined" && module.exports) module.exports = exported;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const AUTHORITY_TYPES = new Set(["direct", "approval_required", "influence_only", "forbidden"]);
  const INTENTS = new Set(["execute", "recommend", "request_approval", "wait", "escalate"]);
  const CAPACITY_STATES = new Set(["available", "limited", "unavailable"]);
  const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

  function text(value) { return String(value == null ? "" : value).trim(); }
  function id(value) { const out = text(value); return out && ID_RE.test(out) ? out : null; }
  function uniqueIds(value) {
    return Array.isArray(value)
      ? [...new Set(value.map(text).filter((entry) => entry && ID_RE.test(entry)))]
      : [];
  }

  function normalizeAuthorityContext(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const raw = value;
    const institutionId = id(raw.institution_id);
    const unitId = id(raw.unit_id);
    const roleScope = id(raw.role_scope);
    if (!institutionId || !unitId || !roleScope) return null;

    const approvalPoints = (Array.isArray(raw.approval_points) ? raw.approval_points : [])
      .map((point) => {
        if (!point || typeof point !== "object" || Array.isArray(point)) return null;
        const approvalId = id(point.approval_id);
        const actionId = id(point.action_id);
        const approverActorId = id(point.approver_actor_id);
        const approvalObjectId = id(point.approval_object_id);
        return approvalId && actionId && approverActorId && approvalObjectId
          ? { approval_id: approvalId, action_id: actionId, approver_actor_id: approverActorId, approval_object_id: approvalObjectId }
          : null;
      })
      .filter(Boolean);

    const escalationPaths = (Array.isArray(raw.escalation_paths) ? raw.escalation_paths : [])
      .map((path) => {
        if (!path || typeof path !== "object" || Array.isArray(path)) return null;
        const escalationId = id(path.escalation_id);
        const actionId = id(path.action_id);
        const targetActorId = id(path.target_actor_id);
        const escalationObjectId = id(path.escalation_object_id);
        return escalationId && actionId && targetActorId && escalationObjectId
          ? { escalation_id: escalationId, action_id: actionId, target_actor_id: targetActorId, escalation_object_id: escalationObjectId }
          : null;
      })
      .filter(Boolean);

    const resources = (Array.isArray(raw.resources) ? raw.resources : [])
      .map((resource) => {
        if (!resource || typeof resource !== "object" || Array.isArray(resource)) return null;
        const resourceId = id(resource.resource_id);
        const baselineState = text(resource.baseline_state);
        const resourceObjectId = id(resource.resource_object_id);
        if (!resourceId || !CAPACITY_STATES.has(baselineState)) return null;
        return {
          resource_id: resourceId,
          baseline_state: baselineState,
          ...(resourceObjectId ? { resource_object_id: resourceObjectId } : {})
        };
      })
      .filter(Boolean);

    const rules = (Array.isArray(raw.authority_rules) ? raw.authority_rules : [])
      .map((rule) => {
        if (!rule || typeof rule !== "object" || Array.isArray(rule)) return null;
        const actionId = id(rule.action_id);
        const authority = text(rule.authority);
        if (!actionId || !AUTHORITY_TYPES.has(authority)) return null;
        return {
          action_id: actionId,
          authority,
          approval_id: id(rule.approval_id),
          escalation_id: id(rule.escalation_id),
          requires_resources: uniqueIds(rule.requires_resources)
        };
      })
      .filter(Boolean);
    if (!rules.length) return null;

    return {
      institution_id: institutionId,
      unit_id: unitId,
      role_scope: roleScope,
      reporting_line: uniqueIds(raw.reporting_line),
      peer_functions: uniqueIds(raw.peer_functions),
      external_counterparts: uniqueIds(raw.external_counterparts),
      goals_pressures: uniqueIds(raw.goals_pressures),
      approval_points: approvalPoints,
      escalation_paths: escalationPaths,
      resources,
      authority_rules: rules
    };
  }

  function getWorkObject(workWorld, objectId) {
    if (!objectId || !workWorld || typeof workWorld.getWorkObject !== "function") return null;
    try { return workWorld.getWorkObject(objectId); } catch { return null; }
  }

  function capacityFor(context, resource, workWorld) {
    const object = resource.resource_object_id ? getWorkObject(workWorld, resource.resource_object_id) : null;
    const state = object && CAPACITY_STATES.has(text(object.status)) ? text(object.status) : resource.baseline_state;
    return {
      resource_id: resource.resource_id,
      resource_object_id: resource.resource_object_id || null,
      state
    };
  }

  function approvalState(context, rule, workWorld) {
    if (!rule.approval_id) return { point: null, object: null, status: null };
    const point = context.approval_points.find((candidate) => candidate.approval_id === rule.approval_id && candidate.action_id === rule.action_id) || null;
    const object = point ? getWorkObject(workWorld, point.approval_object_id) : null;
    return { point, object, status: object ? text(object.status) : null };
  }

  function escalationPath(context, rule) {
    if (!rule.escalation_id) return null;
    return context.escalation_paths.find((candidate) => candidate.escalation_id === rule.escalation_id && candidate.action_id === rule.action_id) || null;
  }

  function evaluate(authorityContext, authorityAction, options = {}) {
    const context = normalizeAuthorityContext(authorityContext);
    if (!context) return { allowed: false, reason: "invalid_authority_context" };
    if (!authorityAction || typeof authorityAction !== "object" || Array.isArray(authorityAction)) {
      return { allowed: false, reason: "invalid_authority_action" };
    }
    const actionId = id(authorityAction.action_id);
    const intent = text(authorityAction.intent);
    if (!actionId || !INTENTS.has(intent)) return { allowed: false, reason: "invalid_authority_action" };
    const activeRoleScope = id(options.role_scope);
    if (activeRoleScope && activeRoleScope !== context.role_scope) {
      return { allowed: false, reason: "role_scope_mismatch", action_id: actionId, intent };
    }
    const rule = context.authority_rules.find((candidate) => candidate.action_id === actionId);
    if (!rule) return { allowed: false, reason: "unknown_authority_action", action_id: actionId, intent };

    const workWorld = options.work_world || null;
    const approval = approvalState(context, rule, workWorld);
    const escalation = escalationPath(context, rule);
    let allowed = false;
    let reason = "authority_blocked";

    if (intent === "recommend") {
      allowed = rule.authority === "direct" || rule.authority === "influence_only" || rule.authority === "approval_required";
      reason = allowed ? "recommendation_within_role" : "recommendation_forbidden";
    } else if (intent === "request_approval") {
      allowed = rule.authority === "approval_required" && Boolean(approval.point);
      reason = allowed ? "approval_request_allowed" : "approval_request_not_defined";
    } else if (intent === "wait") {
      allowed = rule.authority === "approval_required" && approval.status === "pending";
      reason = allowed ? "waiting_for_approval" : approval.status ? `approval_${approval.status}` : "approval_not_requested";
    } else if (intent === "escalate") {
      allowed = Boolean(escalation);
      reason = allowed ? "escalation_path_defined" : "escalation_path_missing";
    } else if (rule.authority === "direct") {
      allowed = true;
      reason = "direct_authority";
    } else if (rule.authority === "approval_required") {
      allowed = approval.status === "granted";
      reason = allowed ? "approval_granted" : approval.status === "denied" ? "approval_denied" : "approval_required";
    } else if (rule.authority === "influence_only") {
      reason = "influence_only";
    } else {
      reason = "forbidden_action";
    }

    const capacity = [];
    if (allowed && intent === "execute") {
      for (const resourceId of rule.requires_resources) {
        const resource = context.resources.find((candidate) => candidate.resource_id === resourceId);
        if (!resource) {
          allowed = false;
          reason = "resource_contract_missing";
          capacity.push({ resource_id: resourceId, state: "missing" });
          continue;
        }
        const resolved = capacityFor(context, resource, workWorld);
        capacity.push(resolved);
        if (resolved.state === "unavailable") {
          allowed = false;
          reason = "insufficient_capacity";
        }
      }
    }

    return {
      allowed,
      reason,
      institution_id: context.institution_id,
      unit_id: context.unit_id,
      role_scope: context.role_scope,
      action_id: actionId,
      intent,
      authority: rule.authority,
      approval_id: rule.approval_id || null,
      approval_object_id: approval.point?.approval_object_id || null,
      approval_status: approval.status,
      escalation_id: rule.escalation_id || null,
      escalation_object_id: escalation?.escalation_object_id || null,
      capacity
    };
  }

  return {
    version: 1,
    normalizeAuthorityContext,
    evaluate
  };
});
