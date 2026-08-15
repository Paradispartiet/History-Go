// js/Civication/systems/civicationNarrativeSceneSource.js
// Canonical source adapter for Civication narrative streams.
// Owns source loading, stream/storylet eligibility and storylet -> scene conversion.
// DailyMailBuilder still owns day placement and narrative state/effect transactions.

(function () {
  "use strict";

  const NARRATIVE_MANIFEST_PATH = "data/Civication/narratives/manifest.json";
  const NARRATIVE_KEY = "narrative_state_v1";
  const SCENE_SOURCE_ADAPTER_NAME = "narrative";
  const SCENE_SOURCE_FORMAT = "civication_narrative_stream_v1";
  const SCENE_SOURCE_ADAPTER_QUEUE_KEY = "__civicationSceneSourceAdapterQueue";
  const PRIVATE_PHASES = new Set(["morning", "lunch", "afternoon", "dinner", "evening", "day_end"]);
  const WORK_STREAM_TYPES = new Set(["work", "class_case", "class_cases", "conflict"]);
  const PRIVATE_MAIL_CLASS = "daily_private";
  const WORK_MAIL_CLASS = "daily_workday";
  const SLOT_MAP = Object.freeze({
    morning: ["personal", "work"],
    forenoon: ["work", "people"],
    workday: ["work", "conflict"],
    lunch: ["people", "class_case"],
    afternoon: ["leisure", "personal", "people"],
    dinner: ["leisure", "personal", "people"],
    evening: ["leisure", "conflict", "personal"],
    day_end: ["consequence", "carryover"]
  });

  const jsonCache = new Map();
  const jsonInflight = new Map();

  function norm(value) {
    return String(value || "").trim();
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  function uniqueStrings(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];
  }

  function normalizeLinks(values) {
    const list = Array.isArray(values) ? values : [];
    const seen = new Set();
    const out = [];
    for (const entry of list) {
      if (typeof entry === "string") {
        const url = norm(entry);
        if (!url) continue;
        const key = `s:${url}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(url);
        continue;
      }
      if (!entry || typeof entry !== "object") continue;
      const label = norm(entry.label);
      const url = norm(entry.url);
      if (!label && !url) continue;
      const key = `o:${label}::${url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...(label ? { label } : {}), ...(url ? { url } : {}) });
    }
    return out;
  }

  function normalizeChoices(choices) {
    return (Array.isArray(choices) ? choices : [])
      .filter(Boolean)
      .map(choice => ({
        ...choice,
        id: norm(choice.id),
        label: norm(choice.label),
        effect: Number(choice.effect || 0),
        tags: Array.isArray(choice.tags) ? choice.tags.map(norm).filter(Boolean) : [],
        feedback: norm(choice.feedback)
      }))
      .filter(choice => choice.id && choice.label);
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function isPrivatePhase(phaseId) {
    return PRIVATE_PHASES.has(norm(phaseId));
  }

  function phaseLabel(phase) {
    const id = norm(phase?.id);
    return norm(phase?.label) || ({
      morning: "Morgen",
      forenoon: "Formiddag",
      workday: "Arbeidsdag",
      lunch: "Lunsj",
      afternoon: "Ettermiddag",
      dinner: "Middag",
      evening: "Kveld",
      day_end: "Dagslutt / Natt"
    })[id] || id || "Arbeidsdag";
  }

  function resolveRoleScope(active) {
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(active));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return slugify(active?.role_key || active?.title || "");
  }

  async function loadJson(path) {
    const p = norm(path);
    if (!p) return null;
    if (jsonCache.has(p)) return jsonCache.get(p);
    if (jsonInflight.has(p)) return jsonInflight.get(p);
    const promise = loadJsonUncached(p);
    jsonInflight.set(p, promise);
    try {
      return await promise;
    } finally {
      jsonInflight.delete(p);
    }
  }

  async function loadJsonUncached(path) {
    const sharedStore = window.CivicationJsonStore;
    if (sharedStore?.fetchJson) {
      const shared = await sharedStore.fetchJson(path);
      jsonCache.set(path, shared);
      return shared;
    }
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) {
        jsonCache.set(path, null);
        return null;
      }
      const json = await res.json();
      jsonCache.set(path, json);
      return json;
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationNarrativeSceneSource] kunne ikke laste", path, error);
      jsonCache.set(path, null);
      return null;
    }
  }

  function getNarrativeState(state) {
    const src = state?.[NARRATIVE_KEY] && typeof state[NARRATIVE_KEY] === "object" ? state[NARRATIVE_KEY] : {};
    return {
      active_streams: uniqueStrings(src.active_streams),
      stream_progress: src.stream_progress && typeof src.stream_progress === "object" ? src.stream_progress : {},
      flags: uniqueStrings(src.flags),
      choice_history: Array.isArray(src.choice_history) ? src.choice_history.slice(-120) : [],
      updated_at: src.updated_at || null
    };
  }

  function activeTags(active, state) {
    return uniqueStrings([
      ...(Array.isArray(active?.tags) ? active.tags : []),
      ...(Array.isArray(active?.interests) ? active.interests : []),
      ...(Array.isArray(state?.identity_tags) ? state.identity_tags : []),
      norm(active?.role_id),
      norm(active?.role_key),
      norm(active?.title)
    ]);
  }

  function streamMatches(stream, active, state, narrativeState) {
    const cond = stream?.applies_when && typeof stream.applies_when === "object" ? stream.applies_when : {};
    const roleScope = resolveRoleScope(active);
    const tags = activeTags(active, state);
    const flags = uniqueStrings([
      ...(narrativeState.flags || []),
      ...(Array.isArray(state?.mail_branch_state?.flags) ? state.mail_branch_state.flags : [])
    ]);

    const roleOk = !Array.isArray(cond.role_scopes) || !cond.role_scopes.length || cond.role_scopes.map(slugify).includes(slugify(roleScope));
    const tagOk = !Array.isArray(cond.any_tags) || !cond.any_tags.length || cond.any_tags.some(t => tags.map(slugify).includes(slugify(t)));
    const flagOk = !Array.isArray(cond.requires_flags) || cond.requires_flags.every(f => flags.map(slugify).includes(slugify(f)));
    return roleOk && tagOk && flagOk;
  }

  function matchesRule(rule, narrativeState, active, state) {
    const cond = rule && typeof rule === "object" ? rule : null;
    if (!cond) return true;

    const flags = new Set(uniqueStrings([
      ...(narrativeState?.flags || []),
      ...(Array.isArray(state?.mail_branch_state?.flags) ? state.mail_branch_state.flags : [])
    ]).map(slugify));
    const activeStreams = new Set(uniqueStrings(narrativeState?.active_streams || []).map(slugify));
    const roleScope = slugify(resolveRoleScope(active));

    const flagsAny = uniqueStrings(cond.flags_any).map(slugify);
    if (flagsAny.length && !flagsAny.some(flag => flags.has(flag))) return false;

    const flagsAll = uniqueStrings(cond.flags_all).map(slugify);
    if (flagsAll.length && !flagsAll.every(flag => flags.has(flag))) return false;

    const streamsAny = uniqueStrings(cond.active_streams_any).map(slugify);
    if (streamsAny.length && !streamsAny.some(streamId => activeStreams.has(streamId))) return false;

    const roleScopes = uniqueStrings(cond.role_scopes).map(slugify);
    if (roleScopes.length && !roleScopes.includes(roleScope)) return false;

    return true;
  }

  function storyletMatchesContext(storylet, stream, active, state, narrativeState) {
    const appliesOk = matchesRule(storylet?.applies_when, narrativeState, active, state);
    if (!appliesOk) return false;
    const avoidHit = matchesRule(storylet?.avoid_when, narrativeState, active, state);
    return !storylet?.avoid_when || !avoidHit;
  }

  function storyletWeight(storylet, narrativeState, active, state) {
    return matchesRule(storylet?.weight_when, narrativeState, active, state) ? 1 : 0;
  }

  async function loadNarrativeStreams() {
    const manifest = await loadJson(NARRATIVE_MANIFEST_PATH);
    const entries = Array.isArray(manifest?.streams) ? manifest.streams : [];
    const loaded = await Promise.all(entries.map(entry => norm(entry?.path) ? loadJson(norm(entry.path)) : null));
    const streams = loaded.filter(stream => stream?.schema === "civication_narrative_stream_v1");
    return { manifest, streams };
  }

  async function getActivationSnapshot(context = {}) {
    const state = context.state || window.CivicationState?.getState?.() || {};
    const active = context.active ?? window.CivicationState?.getActivePosition?.() ?? null;
    const narrativeState = context.narrativeState || getNarrativeState(state);
    const { streams } = await loadNarrativeStreams();
    const matchedStreams = streams.filter(stream => streamMatches(stream, active, state, narrativeState));
    const activeStreamIds = uniqueStrings(narrativeState.active_streams || []);
    const candidateStreams = streams.filter(stream => {
      const id = norm(stream?.id);
      return !!id && (activeStreamIds.includes(id) || matchedStreams.some(match => norm(match?.id) === id));
    });
    return {
      matched_stream_ids: matchedStreams.map(stream => norm(stream?.id)).filter(Boolean),
      candidate_stream_ids: candidateStreams.map(stream => norm(stream?.id)).filter(Boolean)
    };
  }

  function storyletsForSlot(streams, phaseId, usedStorylets, active, state, narrativeState) {
    const allow = SLOT_MAP[phaseId] || [];
    const picks = [];
    for (const stream of streams) {
      const storylets = Array.isArray(stream?.storylets) ? stream.storylets : [];
      const next = storylets.find(storylet => {
        const key = `${stream.id}::${norm(storylet.id)}`;
        if (!norm(storylet.id) || usedStorylets.has(key)) return false;
        const timeSlots = uniqueStrings(Array.isArray(storylet.time_slot) ? storylet.time_slot : [storylet.time_slot]);
        if (!timeSlots.some(timeSlot => allow.includes(slugify(timeSlot)))) return false;
        return storyletMatchesContext(storylet, stream, active, state, narrativeState);
      });
      if (next) picks.push({ stream, storylet: next, weight: storyletWeight(next, narrativeState, active, state) });
    }
    picks.sort((a, b) => b.weight - a.weight);
    return picks;
  }

  function phasePreferenceForStreamType(streamType) {
    const type = slugify(streamType);
    if (type === "conflict") return ["evening", "day_end"];
    if (type === "leisure") return ["evening"];
    if (type === "class_case" || type === "class_cases") return ["lunch", "afternoon"];
    if (type === "work") return ["forenoon", "workday"];
    return [];
  }

  function storyletToEvent(context, stream, storylet) {
    const active = context.active || null;
    const phase = context.phase && typeof context.phase === "object"
      ? context.phase
      : { id: norm(context.phaseId || context.phase_id || "morning") };
    const slot = context.slot && typeof context.slot === "object"
      ? context.slot
      : { slot: norm(context.slotId || context.slot_id || "narrative") };
    const ordinal = Number(context.ordinal || 0);
    const date = norm(context.date) || todayKey();
    const phaseId = norm(phase?.id || "morning");
    const privateScope = isPrivatePhase(phaseId);
    const streamId = norm(stream?.id);
    const storyletId = norm(storylet?.id);

    return {
      id: `${streamId}__${storyletId}__${date}__${ordinal}`,
      thread_key: `${(privateScope ? "private" : resolveRoleScope(active)) || "role"}.narrative.${slugify(streamId)}.${slugify(storyletId)}`,
      source: norm(storylet?.from || stream?.title || "Narrative stream"),
      from: norm(storylet?.from),
      source_type: "narrative_stream",
      narrative_stream_id: streamId,
      narrative_stream_type: norm(stream?.type),
      narrative_storylet_id: storyletId,
      mail_type: norm(storylet?.message_type || "story"),
      mail_family: `narrative_${slugify(stream?.type || "stream")}`,
      mail_class: privateScope ? PRIVATE_MAIL_CLASS : WORK_MAIL_CLASS,
      channel: privateScope ? "private" : "job",
      messageChannel: privateScope ? "private" : "job",
      workday_related: privateScope ? false : true,
      phase_tag: phaseId,
      role_scope: privateScope ? "" : resolveRoleScope(active),
      career_id: privateScope ? "" : norm(active?.career_id),
      role_id: privateScope ? "" : norm(active?.role_id),
      employer_id: privateScope ? "" : (window.CivicationWorkdayRuntime?.getEmployerId?.(active) || norm(active?.brand_id)),
      subject: norm(storylet?.subject),
      situation: Array.isArray(storylet?.situation) ? storylet.situation.map(norm).filter(Boolean) : [norm(storylet?.situation)].filter(Boolean),
      choices: normalizeChoices(storylet?.choices),
      narrative_effects: {
        opens_streams: uniqueStrings(storylet?.opens_streams),
        adds_flags: uniqueStrings(storylet?.adds_flags),
        risk_links: uniqueStrings(storylet?.risk_links),
        links: normalizeLinks(storylet?.links)
      },
      daily_mail_meta: {
        date,
        phase: phaseId,
        phase_label: phaseLabel(phase),
        slot: norm(slot?.slot || slot?.type),
        advances_role_plan: false
      }
    };
  }

  async function getSlotScenes(context = {}) {
    const state = context.state || window.CivicationState?.getState?.() || {};
    const active = context.active ?? window.CivicationState?.getActivePosition?.() ?? null;
    const narrativeState = context.narrativeState || getNarrativeState(state);
    const phaseId = norm(context.phaseId || context.phase_id || context.phase?.id || "morning");
    const usedStorylets = new Set(uniqueStrings(context.used_storylet_keys));
    const candidateIds = uniqueStrings(context.candidate_stream_ids);
    const candidateIdSet = new Set(candidateIds);
    const { streams } = await loadNarrativeStreams();
    let candidateStreams = candidateIds.length
      ? streams.filter(stream => candidateIdSet.has(norm(stream?.id)))
      : streams;
    if (context.exclude_work_streams === true) {
      candidateStreams = candidateStreams.filter(stream => !WORK_STREAM_TYPES.has(slugify(stream?.type)));
    }
    const picks = storyletsForSlot(candidateStreams, phaseId, usedStorylets, active, state, narrativeState);
    return picks.map(pick => storyletToEvent({ ...context, active, state, phaseId }, pick.stream, pick.storylet));
  }

  async function getOpenedStreamScenes(context = {}) {
    const state = context.state || window.CivicationState?.getState?.() || {};
    const active = context.active ?? window.CivicationState?.getActivePosition?.() ?? null;
    const narrativeState = context.narrativeState || getNarrativeState(state);
    const openedStreamIds = uniqueStrings(context.opened_stream_ids);
    if (!openedStreamIds.length) return [];
    const excluded = new Set(uniqueStrings(context.exclude_storylet_keys));
    const { streams } = await loadNarrativeStreams();

    for (const streamId of openedStreamIds) {
      const stream = streams.find(candidate => norm(candidate?.id) === streamId);
      if (!stream) continue;
      const storylets = Array.isArray(stream?.storylets) ? stream.storylets : [];
      const storylet = storylets
        .filter(candidate => {
          const key = `${norm(stream.id)}::${norm(candidate?.id)}`;
          return norm(candidate?.id) && !excluded.has(key)
            && storyletMatchesContext(candidate, stream, active, state, narrativeState);
        })
        .sort((a, b) => storyletWeight(b, narrativeState, active, state) - storyletWeight(a, narrativeState, active, state))[0];
      if (!storylet) continue;

      const preferredPhases = phasePreferenceForStreamType(stream?.type);
      const fallbackPhase = preferredPhases[0] || norm(context.fallback_phase) || "afternoon";
      const event = storyletToEvent({
        ...context,
        active,
        state,
        phase: { id: fallbackPhase, label: fallbackPhase },
        phaseId: fallbackPhase,
        slot: { slot: "injected_narrative" }
      }, stream, storylet);
      event.narrative_source_meta = {
        preferred_phases: preferredPhases
      };
      return [event];
    }

    return [];
  }

  async function getSourceScenes(context = {}) {
    return norm(context.mode).toLowerCase() === "opened_streams"
      ? getOpenedStreamScenes(context)
      : getSlotScenes(context);
  }

  const NARRATIVE_SOURCE_ADAPTER = Object.freeze({
    name: SCENE_SOURCE_ADAPTER_NAME,
    version: 1,
    source_format: SCENE_SOURCE_FORMAT,
    getScenes: getSourceScenes,
    getActivationSnapshot
  });

  function registerSceneSourceAdapter() {
    const catalog = window.CivicationSceneCatalog;
    if (typeof catalog?.registerSourceAdapter === "function") {
      return catalog.registerSourceAdapter(SCENE_SOURCE_ADAPTER_NAME, NARRATIVE_SOURCE_ADAPTER);
    }

    const runtimeWindow = /** @type {Window & typeof globalThis & { __civicationSceneSourceAdapterQueue?: Array<{ name?: string, adapter?: any }> }} */ (window);
    const queue = Array.isArray(runtimeWindow[SCENE_SOURCE_ADAPTER_QUEUE_KEY])
      ? runtimeWindow[SCENE_SOURCE_ADAPTER_QUEUE_KEY]
      : (runtimeWindow[SCENE_SOURCE_ADAPTER_QUEUE_KEY] = []);
    const existing = queue.find(entry => entry?.name === SCENE_SOURCE_ADAPTER_NAME);
    if (existing) return existing.adapter === NARRATIVE_SOURCE_ADAPTER;
    queue.push({ name: SCENE_SOURCE_ADAPTER_NAME, adapter: NARRATIVE_SOURCE_ADAPTER });
    return true;
  }

  function inspect() {
    return {
      source_adapter_registered: window.CivicationSceneCatalog?.getSourceAdapter?.(SCENE_SOURCE_ADAPTER_NAME) === NARRATIVE_SOURCE_ADAPTER,
      cache_size: jsonCache.size,
      manifest_cached: jsonCache.has(NARRATIVE_MANIFEST_PATH)
    };
  }

  window.CivicationNarrativeSceneSource = {
    NARRATIVE_MANIFEST_PATH,
    NARRATIVE_KEY,
    sourceAdapter: NARRATIVE_SOURCE_ADAPTER,
    registerSceneSourceAdapter,
    getActivationSnapshot,
    getSourceScenes,
    inspect
  };

  registerSceneSourceAdapter();
})();
