// @ts-check
// CivicationWorkWorld — bounded persistent work-object state adapter.
//
// This is deliberately NOT a scene engine. It owns only typed-ish state
// normalization and deterministic mutations under CivicationState.work_world.
// Scene/choice integration is a later, separate capability slice.
(function (root, factory) {
  "use strict";

  const exported = factory();
  const target = /** @type {any} */ (root);
  if (target) {
    target.CivicationWorkWorldFactory = exported;
    if (target.CivicationState?.getState && target.CivicationState?.setState) {
      target.CivicationWorkWorld = exported.createAdapter(target.CivicationState);
    }
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = exported;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const WORLD_SCHEMA = "civication_work_world_state_v1";
  const WORLD_VERSION = 1;
  const OBJECT_SCHEMA = "civication_work_object_v1";
  const OBJECT_VERSION = 1;
  const SCHEMA_PATH = "data/Civication/workWorldStateV1.schema.json";
  const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;
  const HISTORY_OPS = new Set([
    "created",
    "updated",
    "transition",
    "flag_added",
    "flag_removed",
    "closed",
    "note"
  ]);
  const APPLY_OPS = new Set(["create", "upsert", "transition", "add_flag", "remove_flag", "close", "note"]);

  /** @param {unknown} value */
  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  /** @param {unknown} value */
  function optionalText(value) {
    const out = text(value);
    return out || null;
  }

  /** @param {unknown} value @param {string} label */
  function requiredId(value, label) {
    const out = text(value);
    if (!out || !ID_RE.test(out)) throw new Error(`${label} har ugyldig id: ${JSON.stringify(value)}`);
    return out;
  }

  /** @param {unknown} value */
  function optionalId(value) {
    const out = text(value);
    return out && ID_RE.test(out) ? out : null;
  }

  /** @param {unknown} value */
  function uniqueStrings(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map(text).filter(Boolean))];
  }

  /** @param {unknown} value */
  function uniqueIds(value) {
    return uniqueStrings(value).filter((entry) => ID_RE.test(entry));
  }

  /** @template T @param {T} value @returns {T} */
  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  /** @param {unknown} value */
  function eventTime(value) {
    return text(value) || new Date().toISOString();
  }

  /** @param {unknown} value */
  function normalizeHistoryEvent(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const raw = /** @type {Record<string, unknown>} */ (value);
    const id = optionalId(raw.id);
    const at = text(raw.at);
    const op = text(raw.op);
    if (!id || !at || !HISTORY_OPS.has(op)) return null;

    /** @type {Record<string, unknown>} */
    const out = { id, at, op };
    for (const key of ["scene_id", "choice_id"]) {
      const idValue = optionalId(raw[key]);
      if (idValue) out[key] = idValue;
    }
    for (const key of ["from_status", "to_status", "from_phase", "to_phase", "note", "outcome"]) {
      const stringValue = text(raw[key]);
      if (stringValue) out[key] = stringValue;
    }
    const flag = optionalId(raw.flag);
    if (flag) out.flag = flag;
    return out;
  }

  /** @param {unknown} value @param {string=} idHint */
  function normalizeWorkObject(value, idHint) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const raw = /** @type {Record<string, unknown>} */ (value);
    const workObjectId = optionalId(raw.work_object_id || idHint);
    const kind = optionalId(raw.kind);
    const roleScope = optionalId(raw.role_scope);
    const title = text(raw.title);
    const status = optionalId(raw.status);
    const phase = optionalId(raw.phase);
    const openedAt = text(raw.opened_at);
    const updatedAt = text(raw.updated_at || raw.opened_at);
    if (!workObjectId || !kind || !roleScope || !title || !status || !phase || !openedAt || !updatedAt) return null;

    const institutionId = optionalId(raw.institution_id);
    const history = (Array.isArray(raw.history) ? raw.history : [])
      .map(normalizeHistoryEvent)
      .filter(Boolean);
    const seenHistory = new Set();
    const dedupedHistory = [];
    for (const entry of history) {
      const event = /** @type {Record<string, unknown>} */ (entry);
      const eventId = String(event.id);
      if (seenHistory.has(eventId)) continue;
      seenHistory.add(eventId);
      dedupedHistory.push(event);
    }

    return {
      schema: OBJECT_SCHEMA,
      version: OBJECT_VERSION,
      work_object_id: workObjectId,
      kind,
      role_scope: roleScope,
      ...(institutionId ? { institution_id: institutionId } : {}),
      title,
      status,
      phase,
      opened_at: openedAt,
      updated_at: updatedAt,
      people_refs: uniqueStrings(raw.people_refs),
      place_refs: uniqueStrings(raw.place_refs),
      knowledge_refs: uniqueStrings(raw.knowledge_refs),
      open_questions: uniqueStrings(raw.open_questions),
      deadline: optionalText(raw.deadline),
      confidentiality: optionalText(raw.confidentiality),
      flags: uniqueIds(raw.flags),
      history: dedupedHistory,
      closed_at: optionalText(raw.closed_at),
      outcome: optionalText(raw.outcome),
      shared: raw.shared === true
    };
  }

  /** @param {Record<string, any>} objectsById */
  function buildIndexes(objectsById) {
    const active = [];
    /** @type {Record<string, string[]>} */
    const byRole = {};
    const shared = [];
    const objectIds = Object.keys(objectsById).sort((a, b) => a.localeCompare(b, "en"));
    for (const id of objectIds) {
      const object = objectsById[id];
      if (!object) continue;
      if (object.status !== "closed" && !object.closed_at) active.push(id);
      if (!byRole[object.role_scope]) byRole[object.role_scope] = [];
      byRole[object.role_scope].push(id);
      if (object.shared === true) shared.push(id);
    }
    return {
      active_object_ids: active,
      role_object_ids: Object.fromEntries(
        Object.entries(byRole)
          .sort(([a], [b]) => a.localeCompare(b, "en"))
          .map(([role, ids]) => [role, [...ids].sort((a, b) => a.localeCompare(b, "en"))])
      ),
      shared_object_ids: shared.sort((a, b) => a.localeCompare(b, "en"))
    };
  }

  /** @param {unknown} value */
  function normalizeWorldState(value) {
    const raw = value && typeof value === "object" && !Array.isArray(value)
      ? /** @type {Record<string, unknown>} */ (value)
      : {};
    const rawObjects = raw.objects_by_id && typeof raw.objects_by_id === "object" && !Array.isArray(raw.objects_by_id)
      ? /** @type {Record<string, unknown>} */ (raw.objects_by_id)
      : {};
    /** @type {Record<string, any>} */
    const objectsById = {};
    for (const [id, candidate] of Object.entries(rawObjects).sort(([a], [b]) => a.localeCompare(b, "en"))) {
      const object = normalizeWorkObject(candidate, id);
      if (!object || object.work_object_id !== id) continue;
      objectsById[id] = object;
    }
    const indexes = buildIndexes(objectsById);
    return {
      schema: WORLD_SCHEMA,
      version: WORLD_VERSION,
      objects_by_id: objectsById,
      ...indexes
    };
  }

  /** @param {Record<string, unknown>} object @param {string} eventId */
  function hasHistoryEvent(object, eventId) {
    return Array.isArray(object.history) && object.history.some((entry) => entry?.id === eventId);
  }

  /** @param {string} op @param {Record<string, unknown>} meta */
  function makeHistoryEvent(op, meta) {
    const id = requiredId(meta.event_id, `${op}.event_id`);
    const at = eventTime(meta.at);
    /** @type {Record<string, unknown>} */
    const out = { id, at, op };
    const sceneId = optionalId(meta.scene_id);
    const choiceId = optionalId(meta.choice_id);
    if (sceneId) out.scene_id = sceneId;
    if (choiceId) out.choice_id = choiceId;
    for (const key of ["from_status", "to_status", "from_phase", "to_phase", "note", "outcome"]) {
      const value = text(meta[key]);
      if (value) out[key] = value;
    }
    const flag = optionalId(meta.flag);
    if (flag) out.flag = flag;
    return out;
  }

  /** @param {Record<string, unknown>} object @param {Record<string, unknown>} event */
  function appendHistory(object, event) {
    const eventId = String(event.id || "");
    if (!eventId || hasHistoryEvent(object, eventId)) return object;
    return {
      ...object,
      updated_at: String(event.at),
      history: [...(Array.isArray(object.history) ? object.history : []), event]
    };
  }

  /** @param {{ getState: () => any, setState: (patch: any) => any }} stateApi */
  function createAdapter(stateApi) {
    if (!stateApi || typeof stateApi.getState !== "function" || typeof stateApi.setState !== "function") {
      throw new Error("CivicationWorkWorld krever CivicationState-lignende getState/setState API");
    }

    function getWorldState() {
      return clone(normalizeWorldState(stateApi.getState()?.work_world));
    }

    /** @param {Record<string, unknown>} world */
    function persist(world) {
      const normalized = normalizeWorldState(world);
      stateApi.setState({ work_world: normalized });
      return clone(normalized);
    }

    /** @param {unknown} id */
    function getWorkObject(id) {
      const workObjectId = optionalId(id);
      if (!workObjectId) return null;
      return clone(getWorldState().objects_by_id[workObjectId] || null);
    }

    /** @param {unknown} roleScope */
    function listWorkObjectsForRole(roleScope) {
      const role = optionalId(roleScope);
      if (!role) return [];
      const world = getWorldState();
      return (world.role_object_ids[role] || [])
        .map((id) => world.objects_by_id[id])
        .filter(Boolean)
        .map(clone);
    }

    /** @param {Record<string, unknown>} seed @param {Record<string, unknown>=} meta */
    function createWorkObject(seed, meta = {}) {
      const workObjectId = requiredId(seed?.work_object_id, "work_object_id");
      const world = getWorldState();
      const existing = world.objects_by_id[workObjectId];
      const eventId = requiredId(meta.event_id || `${workObjectId}:created`, "create.event_id");
      if (existing) {
        if (hasHistoryEvent(existing, eventId)) return clone(existing);
        throw new Error(`Arbeidsobjekt finnes allerede: ${workObjectId}`);
      }

      const at = eventTime(meta.at || seed.opened_at);
      const kind = requiredId(seed.kind, `${workObjectId}.kind`);
      const roleScope = requiredId(seed.role_scope, `${workObjectId}.role_scope`);
      const status = requiredId(seed.status || "open", `${workObjectId}.status`);
      const phase = requiredId(seed.phase || "open", `${workObjectId}.phase`);
      const title = text(seed.title);
      if (!title) throw new Error(`${workObjectId}.title mangler`);
      const institutionId = optionalId(seed.institution_id);
      const created = makeHistoryEvent("created", {
        ...meta,
        event_id: eventId,
        at,
        to_status: status,
        to_phase: phase
      });
      const object = normalizeWorkObject({
        schema: OBJECT_SCHEMA,
        version: OBJECT_VERSION,
        work_object_id: workObjectId,
        kind,
        role_scope: roleScope,
        ...(institutionId ? { institution_id: institutionId } : {}),
        title,
        status,
        phase,
        opened_at: at,
        updated_at: at,
        people_refs: uniqueStrings(seed.people_refs),
        place_refs: uniqueStrings(seed.place_refs),
        knowledge_refs: uniqueStrings(seed.knowledge_refs),
        open_questions: uniqueStrings(seed.open_questions),
        deadline: optionalText(seed.deadline),
        confidentiality: optionalText(seed.confidentiality),
        flags: uniqueIds(seed.flags),
        history: [created],
        closed_at: null,
        outcome: null,
        shared: seed.shared === true
      });
      if (!object) throw new Error(`Kunne ikke normalisere arbeidsobjekt ${workObjectId}`);
      world.objects_by_id[workObjectId] = object;
      return persist(world).objects_by_id[workObjectId];
    }

    /** @param {Record<string, unknown>} seed @param {Record<string, unknown>=} meta */
    function upsertWorkObject(seed, meta = {}) {
      const workObjectId = requiredId(seed?.work_object_id, "work_object_id");
      const existing = getWorkObject(workObjectId);
      if (!existing) return createWorkObject(seed, meta);
      const eventId = requiredId(meta.event_id, "upsert.event_id");
      if (hasHistoryEvent(existing, eventId)) return existing;
      if (seed.kind && requiredId(seed.kind, `${workObjectId}.kind`) !== existing.kind) {
        throw new Error(`${workObjectId}.kind kan ikke endres med upsert`);
      }
      if (seed.role_scope && requiredId(seed.role_scope, `${workObjectId}.role_scope`) !== existing.role_scope) {
        throw new Error(`${workObjectId}.role_scope kan ikke endres med upsert`);
      }
      if (seed.status && requiredId(seed.status, `${workObjectId}.status`) !== existing.status) {
        throw new Error(`${workObjectId}.status må endres med transitionWorkObject`);
      }
      if (seed.phase && requiredId(seed.phase, `${workObjectId}.phase`) !== existing.phase) {
        throw new Error(`${workObjectId}.phase må endres med transitionWorkObject`);
      }

      const at = eventTime(meta.at);
      const patch = {
        ...existing,
        ...(text(seed.title) ? { title: text(seed.title) } : {}),
        ...(optionalId(seed.institution_id) ? { institution_id: optionalId(seed.institution_id) } : {}),
        ...(Array.isArray(seed.people_refs) ? { people_refs: uniqueStrings(seed.people_refs) } : {}),
        ...(Array.isArray(seed.place_refs) ? { place_refs: uniqueStrings(seed.place_refs) } : {}),
        ...(Array.isArray(seed.knowledge_refs) ? { knowledge_refs: uniqueStrings(seed.knowledge_refs) } : {}),
        ...(Array.isArray(seed.open_questions) ? { open_questions: uniqueStrings(seed.open_questions) } : {}),
        ...(Object.prototype.hasOwnProperty.call(seed, "deadline") ? { deadline: optionalText(seed.deadline) } : {}),
        ...(Object.prototype.hasOwnProperty.call(seed, "confidentiality") ? { confidentiality: optionalText(seed.confidentiality) } : {}),
        ...(Array.isArray(seed.flags) ? { flags: uniqueIds(seed.flags) } : {}),
        ...(Object.prototype.hasOwnProperty.call(seed, "shared") ? { shared: seed.shared === true } : {})
      };
      const event = makeHistoryEvent("updated", { ...meta, event_id: eventId, at });
      const nextObject = appendHistory(patch, event);
      const world = getWorldState();
      world.objects_by_id[workObjectId] = nextObject;
      return persist(world).objects_by_id[workObjectId];
    }

    /** @param {unknown} id @param {Record<string, unknown>} transition */
    function transitionWorkObject(id, transition) {
      const workObjectId = requiredId(id, "transition.work_object_id");
      const world = getWorldState();
      const current = world.objects_by_id[workObjectId];
      if (!current) throw new Error(`Ukjent arbeidsobjekt: ${workObjectId}`);
      const eventId = requiredId(transition.event_id, "transition.event_id");
      if (hasHistoryEvent(current, eventId)) return clone(current);
      if (current.status === "closed" || current.closed_at) throw new Error(`Lukket arbeidsobjekt kan ikke transitioneres: ${workObjectId}`);
      const toStatus = requiredId(transition.to_status || current.status, "transition.to_status");
      const toPhase = requiredId(transition.to_phase || current.phase, "transition.to_phase");
      if (toStatus === current.status && toPhase === current.phase && !text(transition.note)) return clone(current);
      const at = eventTime(transition.at);
      const event = makeHistoryEvent("transition", {
        ...transition,
        event_id: eventId,
        at,
        from_status: current.status,
        to_status: toStatus,
        from_phase: current.phase,
        to_phase: toPhase
      });
      const nextObject = appendHistory({ ...current, status: toStatus, phase: toPhase }, event);
      world.objects_by_id[workObjectId] = nextObject;
      return persist(world).objects_by_id[workObjectId];
    }

    /** @param {unknown} id @param {unknown} flag @param {Record<string, unknown>} meta */
    function addFlag(id, flag, meta) {
      return mutateFlag(id, flag, meta, true);
    }

    /** @param {unknown} id @param {unknown} flag @param {Record<string, unknown>} meta */
    function removeFlag(id, flag, meta) {
      return mutateFlag(id, flag, meta, false);
    }

    /** @param {unknown} id @param {unknown} flag @param {Record<string, unknown>} meta @param {boolean} add */
    function mutateFlag(id, flag, meta, add) {
      const workObjectId = requiredId(id, "flag.work_object_id");
      const flagId = requiredId(flag, "flag.flag");
      const world = getWorldState();
      const current = world.objects_by_id[workObjectId];
      if (!current) throw new Error(`Ukjent arbeidsobjekt: ${workObjectId}`);
      const eventId = requiredId(meta.event_id, "flag.event_id");
      if (hasHistoryEvent(current, eventId)) return clone(current);
      const flags = new Set(current.flags || []);
      const changed = add ? !flags.has(flagId) : flags.has(flagId);
      if (!changed) return clone(current);
      if (add) flags.add(flagId);
      else flags.delete(flagId);
      const at = eventTime(meta.at);
      const event = makeHistoryEvent(add ? "flag_added" : "flag_removed", {
        ...meta,
        event_id: eventId,
        at,
        flag: flagId
      });
      const nextObject = appendHistory({ ...current, flags: [...flags].sort((a, b) => a.localeCompare(b, "en")) }, event);
      world.objects_by_id[workObjectId] = nextObject;
      return persist(world).objects_by_id[workObjectId];
    }

    /** @param {unknown} id @param {Record<string, unknown>} meta */
    function appendWorkObjectHistory(id, meta) {
      const workObjectId = requiredId(id, "note.work_object_id");
      const world = getWorldState();
      const current = world.objects_by_id[workObjectId];
      if (!current) throw new Error(`Ukjent arbeidsobjekt: ${workObjectId}`);
      const note = text(meta.note);
      if (!note) throw new Error("note.note mangler");
      const eventId = requiredId(meta.event_id, "note.event_id");
      if (hasHistoryEvent(current, eventId)) return clone(current);
      const event = makeHistoryEvent("note", { ...meta, event_id: eventId, at: eventTime(meta.at), note });
      const nextObject = appendHistory(current, event);
      world.objects_by_id[workObjectId] = nextObject;
      return persist(world).objects_by_id[workObjectId];
    }

    /** @param {unknown} id @param {Record<string, unknown>} meta */
    function closeWorkObject(id, meta) {
      const workObjectId = requiredId(id, "close.work_object_id");
      const world = getWorldState();
      const current = world.objects_by_id[workObjectId];
      if (!current) throw new Error(`Ukjent arbeidsobjekt: ${workObjectId}`);
      const eventId = requiredId(meta.event_id, "close.event_id");
      if (hasHistoryEvent(current, eventId)) return clone(current);
      if (current.status === "closed" || current.closed_at) return clone(current);
      const at = eventTime(meta.at);
      const outcome = text(meta.outcome);
      const event = makeHistoryEvent("closed", {
        ...meta,
        event_id: eventId,
        at,
        from_status: current.status,
        to_status: "closed",
        from_phase: current.phase,
        to_phase: "closed",
        outcome
      });
      const nextObject = appendHistory({
        ...current,
        status: "closed",
        phase: "closed",
        closed_at: at,
        outcome: outcome || null
      }, event);
      world.objects_by_id[workObjectId] = nextObject;
      return persist(world).objects_by_id[workObjectId];
    }

    /** @param {unknown} workContext */
    function resolveWorkContext(workContext) {
      const raw = workContext && typeof workContext === "object" && !Array.isArray(workContext)
        ? /** @type {Record<string, unknown>} */ (workContext)
        : {};
      const objectIds = uniqueIds(raw.object_ids);
      const world = getWorldState();
      const objects = [];
      const missing_object_ids = [];
      for (const id of objectIds) {
        const object = world.objects_by_id[id];
        if (object) objects.push(clone(object));
        else missing_object_ids.push(id);
      }
      return {
        object_ids: objectIds,
        objects,
        missing_object_ids,
        institution_id: optionalId(raw.institution_id),
        deadline_ref: optionalText(raw.deadline_ref)
      };
    }

    /** @param {unknown} operations @param {Record<string, unknown>=} context */
    function applyOperations(operations, context = {}) {
      if (!Array.isArray(operations)) return [];
      const results = [];
      for (let index = 0; index < operations.length; index += 1) {
        const raw = operations[index];
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
          throw new Error(`work_object_ops[${index}] må være objekt`);
        }
        const operation = /** @type {Record<string, unknown>} */ (raw);
        const op = text(operation.op);
        if (!APPLY_OPS.has(op)) throw new Error(`Ukjent work-object-op: ${op || "<tom>"}`);
        const meta = {
          ...context,
          ...operation,
          scene_id: operation.scene_id || context.scene_id,
          choice_id: operation.choice_id || context.choice_id,
          at: operation.at || context.at
        };
        let value;
        if (op === "create") value = createWorkObject(/** @type {Record<string, unknown>} */ (operation.work_object || {}), meta);
        else if (op === "upsert") value = upsertWorkObject(/** @type {Record<string, unknown>} */ (operation.work_object || {}), meta);
        else if (op === "transition") value = transitionWorkObject(operation.work_object_id, meta);
        else if (op === "add_flag") value = addFlag(operation.work_object_id, operation.flag, meta);
        else if (op === "remove_flag") value = removeFlag(operation.work_object_id, operation.flag, meta);
        else if (op === "close") value = closeWorkObject(operation.work_object_id, meta);
        else value = appendWorkObjectHistory(operation.work_object_id, meta);
        results.push({ op, work_object_id: value.work_object_id, object: value });
      }
      return results;
    }

    return {
      version: WORLD_VERSION,
      schema: WORLD_SCHEMA,
      schema_path: SCHEMA_PATH,
      getWorldState,
      getWorkObject,
      listWorkObjectsForRole,
      createWorkObject,
      upsertWorkObject,
      transitionWorkObject,
      appendWorkObjectHistory,
      addFlag,
      removeFlag,
      closeWorkObject,
      resolveWorkContext,
      applyOperations
    };
  }

  return {
    WORLD_SCHEMA,
    WORLD_VERSION,
    OBJECT_SCHEMA,
    OBJECT_VERSION,
    SCHEMA_PATH,
    normalizeWorldState,
    normalizeWorkObject,
    createAdapter
  };
});
