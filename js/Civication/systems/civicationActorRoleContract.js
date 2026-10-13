// Pure, opt-in role contract. Loaded by Civication but no automatic mutations.
// Player and fictional NPC actors can reference the SAME canonical Role World.
// No persistence, entitlement, network, History Go mutation or scene scheduling.
(function (scope, factory) {
  "use strict";
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (scope) scope.CivicationActorRoleContract = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const SCHEMA = "civication_actor_role_ref_v1";
  const KINDS = new Set(["player", "fictional_npc"]);
  const ID_PREFIX = { player: "player:", fictional_npc: "npc:" };
  const FORBIDDEN_PERSON_FIELDS = [
    "hg_person", "history_go_person_id", "canonical_person_id",
    "personRepresentanter", "history_people", "historical_person_id"
  ];

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function assertSpec(spec) {
    if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
      throw new TypeError("Actor specification must be an object");
    }
    for (const key of FORBIDDEN_PERSON_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(spec, key)) {
        throw new TypeError("History Go People may only be separate knowledge references: " + key);
      }
    }
  }

  function buildRoleCatalog(index) {
    if (index?.schema !== "civication_role_world_index_v1" || !Array.isArray(index.roles)) {
      throw new TypeError("Expected canonical Civication Role World index");
    }
    const roles = Object.create(null);
    for (const role of index.roles) {
      const category = text(role?.category);
      const roleScope = text(role?.role_scope);
      const path = text(role?.path);
      const key = category + "/" + roleScope;
      if (!category || !roleScope || !path || roles[key]) {
        throw new TypeError("Role catalog contains an incomplete or duplicate role: " + key);
      }
      roles[key] = Object.freeze({
        category,
        role_scope: roleScope,
        role_world_path: path,
        world_status: text(role?.status),
        subject_type: text(role?.subject_type) || "career_role"
      });
    }
    return Object.freeze({
      source_schema: index.schema,
      role_count: index.roles.length,
      roles: Object.freeze(roles)
    });
  }

  function resolveRole(catalog, roleRef) {
    const category = text(roleRef?.category);
    const scope = text(roleRef?.role_scope);
    if (!category || !scope) throw new TypeError("Role reference requires category and role_scope");
    const role = catalog?.roles?.[category + "/" + scope];
    if (!role) throw new RangeError("Unknown canonical role: " + category + "/" + scope);
    return role;
  }

  function createActor(catalog, spec) {
    assertSpec(spec);
    const kind = text(spec.actor_type);
    const id = text(spec.actor_id);
    if (!KINDS.has(kind)) throw new TypeError("Only player or fictional_npc actors are supported");
    if (!id.startsWith(ID_PREFIX[kind]) || id.length <= ID_PREFIX[kind].length) {
      throw new TypeError("Actor ID must use its own namespace: " + ID_PREFIX[kind]);
    }
    if (spec.controller || spec.remote_player_id || spec.user_id || spec.network_identity) {
      throw new TypeError("Client-provided remote player authority is not supported");
    }
    const role = resolveRole(catalog, spec.role_ref);
    return Object.freeze({
      schema: SCHEMA,
      actor_id: id,
      actor_type: kind,
      control_mode: kind === "player" ? "local_player" : "simulation",
      world_scope: "solo",
      role_ref: role,
      // A role is not a job offer, salary, permission, credential or relationship.
      role_history: Object.freeze([]),
      last_role_event_id: null
    });
  }

  function changeActorRole(catalog, actor, nextRef, eventId) {
    assertSpec(actor);
    if (actor.schema !== SCHEMA || !KINDS.has(actor.actor_type)) {
      throw new TypeError("Expected a Civication actor contract");
    }
    const event = text(eventId);
    if (!event) throw new TypeError("Role changes require an explicit event_id");
    if (actor.last_role_event_id === event ||
        actor.role_history.some(previous => previous.event_id === event)) {
      throw new TypeError("Duplicate role event: " + event);
    }
    const nextRole = resolveRole(catalog, nextRef);
    if (nextRole === actor.role_ref) throw new TypeError("No role transition occurred");
    const previous = Object.freeze({
      event_id: event,
      from: actor.role_ref.category + "/" + actor.role_ref.role_scope,
      to: nextRole.category + "/" + nextRole.role_scope
    });
    return Object.freeze({
      ...actor,
      role_ref: nextRole,
      role_history: Object.freeze([...actor.role_history, previous]),
      last_role_event_id: event
    });
  }

  return Object.freeze({ buildRoleCatalog, resolveRole, createActor, changeActorRole });
});
