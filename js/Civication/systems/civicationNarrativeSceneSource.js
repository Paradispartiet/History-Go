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

  function activeLifePositionTags() {
    const context = window.CivicationLifePositions?.getLifeContext?.();
    const positions = Array.isArray(context?.active_life_positions)
      ? context.active_life_positions
      : [];
    return uniqueStrings(positions.flatMap((position) => [
      norm(position?.id),
      norm(position?.label),
      norm(position?.badge_id && position?.id ? `${position.badge_id}:${position.id}` : "")
    ]));
  }

  function activeTags(active, state) {
    return uniqueStrings([
      ...(Array.isArray(active?.tags) ? active.tags : []),
      ...(Array.isArray(active?.interests) ? active.interests : []),
      ...(Array.isArray(state?.identity_tags) ? state.identity_tags : []),
      ...activeLifePositionTags(),
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

  function isNpcRoleStoryStream(stream) {
    return (Array.isArray(stream?.storylets) ? stream.storylets : [])
      .some((storylet) => storylet?.npc_story?.kind === "npc_role_story_v1");
  }

  function isPrivateNpcStream(stream) {
    return isNpcRoleStoryStream(stream) && !WORK_STREAM_TYPES.has(slugify(stream?.type));
  }

  // An active narrative stream remains in the player's history after a job
  // change, but role-bound work must not materialize for an unrelated job.
  // Keep free-standing private/leisure streams available across career changes.
  function streamEligibleForCurrentRole(stream, active, state, narrativeState) {
    const scopes = stream?.applies_when?.role_scopes;
    const roleBoundWork = WORK_STREAM_TYPES.has(slugify(stream?.type))
      && Array.isArray(scopes) && scopes.length > 0;
    return (!roleBoundWork && !isNpcRoleStoryStream(stream))
      || streamMatches(stream, active, state, narrativeState);
  }

  function npcDayField(stream) {
    return isPrivateNpcStream(stream) ? "answered_calendar_day" : "answered_workday_day";
  }

  function currentNpcDay(stream) {
    const raw = isPrivateNpcStream(stream)
      ? window.CivicationCalendar?.getClock?.()?.dayIndex
      : window.CivicationWorkdayRuntime?.getWorkdayDayIndex?.();
    if (raw == null || raw === "") return NaN;
    const day = Number(raw);
    return Number.isInteger(day) && day >= (isPrivateNpcStream(stream) ? 1 : 0) ? day : NaN;
  }

  function storyletMatchesContext(storylet, stream, active, state, narrativeState) {
    const appliesOk = matchesRule(storylet?.applies_when, narrativeState, active, state);
    if (!appliesOk) return false;
    const avoidHit = matchesRule(storylet?.avoid_when, narrativeState, active, state);
    if (storylet?.avoid_when && avoidHit) return false;

    // Optional NPC role gate for existing, authored narrative scenes. This reads
    // the existing character-thread store; it neither confers employment nor
    // creates a new narrative save owner.
    const story = storylet?.npc_story;
    // Choice history, not just the daily queue, prevents a finished chapter
    // from being re-injected by an opened narrative stream.
    if (story?.kind === "npc_role_story_v1" &&
        narrativeState?.stream_progress?.[norm(stream?.id) + "::" + norm(storylet?.id)]?.answered) return false;
    if (story?.kind === "npc_role_story_v1" && story.available_after) {
      const after = story.available_after;
      const progressKey = norm(stream?.id) + "::" + norm(after.storylet_id);
      const previous = narrativeState?.stream_progress?.[progressKey];
      const currentDay = currentNpcDay(stream);
      const rawAnsweredDay = previous?.[npcDayField(stream)];
      const answeredDay = rawAnsweredDay == null || rawAnsweredDay === "" ? NaN : Number(rawAnsweredDay);
      const gap = Number(isPrivateNpcStream(stream) ? after.min_days : after.min_workdays);
      // Missing or old save timestamps must never unlock a new chapter by accident.
      if (!previous?.answered || !Number.isInteger(currentDay) || !Number.isInteger(answeredDay) ||
          !Number.isInteger(gap) || gap < 1 || currentDay < answeredDay + gap) return false;
    }
    if (story?.kind === "npc_role_story_v1" && norm(story.requires_role_ref)) {
      const record = window.CivicationNpcCharacterThreads?.getState?.()?.characters?.[norm(story.npc_id)];
      const current = record?.role_ref;
      if (!current || (norm(current.category) + "/" + norm(current.role_scope)) !== norm(story.requires_role_ref)) return false;
    }
    return true;
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
      return !!id && (activeStreamIds.includes(id) || matchedStreams.some(match => norm(match?.id) === id))
        && streamEligibleForCurrentRole(stream, active, state, narrativeState);
    });
    return {
      matched_stream_ids: matchedStreams.map(stream => norm(stream?.id)).filter(Boolean),
      candidate_stream_ids: candidateStreams.map(stream => norm(stream?.id)).filter(Boolean)
    };
  }

  function lastNpcDay(stream, narrativeState) {
    let last = -1; // Unmet characters get a turn before repeated encounters.
    for (const storylet of (Array.isArray(stream?.storylets) ? stream.storylets : [])) {
      const key = `${norm(stream?.id)}::${norm(storylet?.id)}`;
      const progress = narrativeState?.stream_progress?.[key];
      const rawDay = progress?.[npcDayField(stream)];
      const day = Number(rawDay);
      if (progress?.answered && rawDay != null && Number.isInteger(day) && day >= 0) {
        last = Math.max(last, day);
      }
    }
    return last;
  }

  // Work encounters share a workday quota; private encounters share a calendar-day
  // quota. Queued and answered chapters both count, including after reload.
  function npcAssignedThisDay(streams, usedStorylets, narrativeState, privateScope) {
    for (const stream of streams) {
      if (!isNpcRoleStoryStream(stream) || isPrivateNpcStream(stream) !== privateScope) continue;
      const currentDay = currentNpcDay(stream);
      const dayField = npcDayField(stream);
      for (const storylet of (Array.isArray(stream?.storylets) ? stream.storylets : [])) {
        const key = `${norm(stream.id)}::${norm(storylet?.id)}`;
        const progress = narrativeState?.stream_progress?.[key];
        if (usedStorylets.has(key) && !progress?.answered) return true;
        if (progress?.answered && Number.isInteger(currentDay) &&
            progress[dayField] != null && progress[dayField] !== "" &&
            Number(progress[dayField]) === currentDay) return true;
      }
    }
    return false;
  }

  function storyletsForSlot(streams, phaseId, usedStorylets, active, state, narrativeState, npcAlreadyAssigned) {
    const allow = SLOT_MAP[phaseId] || [];
    const picks = [];
    for (const stream of streams) {
      if (isNpcRoleStoryStream(stream) &&
          (npcAlreadyAssigned || isPrivateNpcStream(stream) !== isPrivatePhase(phaseId))) continue;
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
    // Preserve the relative order of all other narratives and their weight.
    // Reorder *only* the NPC positions inside each equal-priority group;
    // an intervening ordinary stream must not upset NPC fairness.
    picks.sort((a, b) => b.weight - a.weight);
    const npcGroups = new Map();
    for (const pick of picks) {
      if (!isNpcRoleStoryStream(pick.stream)) continue;
      if (!npcGroups.has(pick.weight)) npcGroups.set(pick.weight, []);
      npcGroups.get(pick.weight).push(pick);
    }
    for (const group of npcGroups.values()) {
      group.sort((a, b) => lastNpcDay(a.stream, narrativeState) -
        lastNpcDay(b.stream, narrativeState));
    }
    return picks.map(pick => isNpcRoleStoryStream(pick.stream)
      ? npcGroups.get(pick.weight).shift()
      : pick);
  }

  function phasePreferenceForStreamType(streamType) {
    const type = slugify(streamType);
    if (type === "conflict") return ["evening", "day_end"];
    if (type === "leisure") return ["evening"];
    if (type === "class_case" || type === "class_cases") return ["lunch", "afternoon"];
    if (type === "work") return ["forenoon", "workday"];
    return [];
  }

  function narrativeSituation(storylet) {
    const base = Array.isArray(storylet?.situation)
      ? storylet.situation.map(norm).filter(Boolean)
      : [norm(storylet?.situation)].filter(Boolean);
    const story = storylet?.npc_story;
    if (story?.kind !== "npc_role_story_v1" || !story.trust_variants) return base;
    const record = window.CivicationNpcCharacterThreads?.getState?.()?.characters?.[norm(story.npc_id)];
    const score = Number(record?.trust_score || 0);
    const band = score >= 1 ? "trusted" : score <= -1 ? "strained" : "neutral";
    const line = norm(story.trust_variants[band]);
    return line ? [...base, line] : base;
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
      situation: narrativeSituation(storylet),
      choices: normalizeChoices(storylet?.choices),
      ...(storylet?.npc_story?.kind === "npc_role_story_v1" ? { npc_story: storylet.npc_story } : {}),
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
    // Saved streams from a prior job remain in history, not in the current
    // workday. This also protects callers with stale candidate_stream_ids.
    candidateStreams = candidateStreams.filter(stream =>
      streamEligibleForCurrentRole(stream, active, state, narrativeState));
    // Forenoon/workday are employment phases. A personal interest such as
    // football must not turn a leisure/supporter scene into a museum work mail,
    // even if its storylet happens to advertise the generic `people` slot.
    // Private phases continue to admit private/leisure narratives; actual
    // work streams remain eligible for the role that owns their workday.
    if (!isPrivatePhase(phaseId)) {
      candidateStreams = candidateStreams.filter(stream =>
        WORK_STREAM_TYPES.has(slugify(stream?.type)));
    }
    if (context.npc_only === true) {
      candidateStreams = candidateStreams.filter(isNpcRoleStoryStream);
    }
    if (context.exclude_work_streams === true) {
      candidateStreams = candidateStreams.filter(stream => !WORK_STREAM_TYPES.has(slugify(stream?.type)));
    }
    // Forenoon and workday are employer time. A leisure stream with a
    // "people" slot (e.g. football supporters) must never be queued as
    // museum/other paid work merely because the player's interests match.
    if (!isPrivatePhase(phaseId)) {
      candidateStreams = candidateStreams.filter(stream => WORK_STREAM_TYPES.has(slugify(stream?.type)));
    }
    const npcAlreadyAssigned = npcAssignedThisDay(streams, usedStorylets, narrativeState, isPrivatePhase(phaseId));
    const picks = storyletsForSlot(candidateStreams, phaseId, usedStorylets, active, state, narrativeState, npcAlreadyAssigned);
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
      if (!streamEligibleForCurrentRole(stream, active, state, narrativeState) ||
          (isNpcRoleStoryStream(stream) &&
           npcAssignedThisDay(streams, excluded, narrativeState, isPrivateNpcStream(stream)))) continue;
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
      return [{
        ...event,
        narrative_source_meta: { preferred_phases: preferredPhases }
      }];
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
