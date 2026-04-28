// js/Civication/roleThreadResolver.js

(function () {
  "use strict";

  const LS_ROLE_THREAD_STATE = "hg_role_thread_state_v1";
  const ROLE_THREAD_MANIFEST_URL = "data/Civication/roleThreads/rt_manifest.json";
  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  let THREADS_CACHE = null;

  function safeParse(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function readLS(key, fallback) {
    return safeParse(localStorage.getItem(key), fallback);
  }

  function writeLS(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uniq(arr) {
    return Array.from(new Set((Array.isArray(arr) ? arr : []).filter(Boolean)));
  }

  function normStr(v) {
    return String(v || "").trim();
  }

  function normLower(v) {
    return normStr(v).toLowerCase();
  }

  function toLowerSet(arr) {
    return new Set(
      (Array.isArray(arr) ? arr : [])
        .map(normLower)
        .filter(Boolean)
    );
  }

  function hasAll(requiredValues, actualValues) {
    const req = Array.isArray(requiredValues) ? requiredValues : [];
    if (!req.length) return true;

    const actual = toLowerSet(actualValues);
    return req.every(v => actual.has(normLower(v)));
  }

  async function loadThreads(force = false) {
    if (THREADS_CACHE && !force) return THREADS_CACHE;

    const manifestRes = await fetch(ROLE_THREAD_MANIFEST_URL, { cache: "no-store" });
    if (!manifestRes.ok) {
      throw new Error(`Could not load ${ROLE_THREAD_MANIFEST_URL} (${manifestRes.status})`);
    }

    const manifest = await manifestRes.json();
    const files = Array.isArray(manifest?.files) ? manifest.files : [];

    const allThreads = [];

    for (const url of files) {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Could not load ${url} (${res.status})`);
      }

      const json = await res.json();
      const threads = Array.isArray(json?.threads) ? json.threads : [];
      allThreads.push(...threads);
    }

    THREADS_CACHE = allThreads;
    return allThreads;
  }

  function getCareerCategoryId() {
    return normStr(window.CivicationState?.getActivePosition?.()?.career_id || "");
  }

  function getMeritPointsByCategory() {
    const merits = readLS("merits_by_category", {});
    const out = {};

    if (!merits || typeof merits !== "object") return out;

    for (const key of Object.keys(merits)) {
      out[key] = Number(merits[key]?.points || 0);
    }

    return out;
  }

  function getStoryFlags() {
    const state = window.CiviStoryResolver?.getState?.() || {};
    return Array.isArray(state?.story_flags) ? state.story_flags : [];
  }

  function getRoleThreadState() {
    return readLS(LS_ROLE_THREAD_STATE, {
      generated_at: null,
      active_thread_ids: [],
      completed_thread_ids: [],
      story_flags: [],
      story_tags: [],
      thread_states: {}
    });
  }

  function saveRoleThreadState(state) {
    const safe = {
      generated_at: new Date().toISOString(),
      active_thread_ids: Array.isArray(state?.active_thread_ids) ? state.active_thread_ids : [],
      completed_thread_ids: Array.isArray(state?.completed_thread_ids) ? state.completed_thread_ids : [],
      story_flags: Array.isArray(state?.story_flags) ? state.story_flags : [],
      story_tags: Array.isArray(state?.story_tags) ? state.story_tags : [],
      thread_states: state?.thread_states && typeof state.thread_states === "object"
        ? state.thread_states
        : {}
    };

    const nextRaw = JSON.stringify(safe);
    const prevRaw = localStorage.getItem(LS_ROLE_THREAD_STATE);
    if (prevRaw !== nextRaw) {
      writeLS(LS_ROLE_THREAD_STATE, safe);
      dispatchProfileUpdate();
    }
    return safe;
  }

  function getProgressLog() {
    return readLS("hg_role_progress_log_v1", []);
  }

  function getProgressTags() {
    const log = getProgressLog();
    if (!Array.isArray(log)) return [];

    const tags = [];

    for (const row of log) {
      const arr = Array.isArray(row?.tags) ? row.tags : [];
      for (const t of arr) {
        const v = normStr(t);
        if (v) tags.push(v);
      }
    }

    return uniq(tags);
  }

  function appendProgressEvent(evt) {
    const log = getProgressLog();
    const safe = Array.isArray(log) ? log.slice() : [];

    safe.push({
      ts: new Date().toISOString(),
      role_id: normStr(evt?.role_id),
      tier_label: normStr(evt?.tier_label),
      family_id: normStr(evt?.family_id),
      storylet_id: normStr(evt?.storylet_id),
      tags: uniq((Array.isArray(evt?.tags) ? evt.tags : []).map(normStr).filter(Boolean))
    });

    const nextRaw = JSON.stringify(safe);
    const prevRaw = localStorage.getItem("hg_role_progress_log_v1");
    if (prevRaw !== nextRaw) {
      localStorage.setItem("hg_role_progress_log_v1", nextRaw);
      dispatchProfileUpdate();
    }
    return safe;
  }

  function buildSnapshot() {
    return {
      career_category_id: getCareerCategoryId(),
      merit_points_by_category: getMeritPointsByCategory(),
      story_flags: getStoryFlags(),
      progress_tags: getProgressTags(),
      completed_role_threads: getRoleThreadState().completed_thread_ids || []
    };
  }

  function evaluateRequiredState(thread, snapshot) {
    const req = thread?.required_state || {};

    const careerIds = Array.isArray(req?.career_category_ids) ? req.career_category_ids : [];
    const careerOk = !careerIds.length || careerIds.includes(snapshot.career_category_id);

    const meritReq = req?.min_merit_points && typeof req.min_merit_points === "object"
      ? req.min_merit_points
      : {};

    let meritOk = true;
    for (const categoryId of Object.keys(meritReq)) {
      const need = Number(meritReq[categoryId] || 0);
      const have = Number(snapshot.merit_points_by_category?.[categoryId] || 0);
      if (have < need) {
        meritOk = false;
        break;
      }
    }

    const storyOk = hasAll(req?.required_story_flags, snapshot.story_flags);
    const roleOk = hasAll(req?.required_role_threads, snapshot.completed_role_threads);

    const excluded = Array.isArray(req?.excluded_role_threads) ? req.excluded_role_threads : [];
    const excludedSet = toLowerSet(snapshot.completed_role_threads);
    const excludedOk = !excluded.some(id => excludedSet.has(normLower(id)));

    return careerOk && meritOk && storyOk && roleOk && excludedOk;
  }

  function evaluateProgress(thread, snapshot) {
    const model = thread?.progress_model || {};
    const type = normStr(model?.type);

    if (!type) {
      return {
        ok: true,
        totalMatches: 0,
        matchedTags: []
      };
    }

    if (type === "tag_accumulation") {
      const requiredTags = Array.isArray(model?.required_tags) ? model.required_tags : [];
      const minimumMatches = Number(model?.minimum_matches || (requiredTags.length ? 1 : 0));
      const actual = toLowerSet(snapshot.progress_tags);

      const matchedTags = requiredTags.filter(tag => actual.has(normLower(tag)));
      return {
        ok: matchedTags.length >= minimumMatches,
        totalMatches: matchedTags.length,
        matchedTags
      };
    }

    if (type === "ordered_steps") {
      const steps = Array.isArray(model?.steps) ? model.steps : [];
      const actual = toLowerSet(snapshot.progress_tags);

      let completedInOrder = 0;
      for (const step of steps) {
        if (actual.has(normLower(step))) completedInOrder += 1;
        else break;
      }

      return {
        ok: completedInOrder >= steps.length && steps.length > 0,
        totalMatches: completedInOrder,
        matchedTags: steps.slice(0, completedInOrder)
      };
    }

    return {
      ok: false,
      totalMatches: 0,
      matchedTags: []
    };
  }

  function materializeThread(thread, snapshot, progressResult, priorState) {
    const id = normStr(thread?.id);
    const completedIds = Array.isArray(priorState?.completed_thread_ids)
      ? priorState.completed_thread_ids
      : [];

    const completed = completedIds.includes(id);

    return {
      id,
      title: normStr(thread?.title),
      summary: normStr(thread?.summary),
      role_ids: Array.isArray(thread?.role_ids) ? thread.role_ids.map(normStr).filter(Boolean) : [],
      tier_labels: Array.isArray(thread?.tier_labels) ? thread.tier_labels.map(normStr).filter(Boolean) : [],
      primary_conflict: normStr(thread?.primary_conflict),
      secondary_conflict: normStr(thread?.secondary_conflict),
      families: Array.isArray(thread?.families) ? thread.families.map(normStr).filter(Boolean) : [],
      priority: Number(thread?.priority || 0),
      completed,
      progress: {
        total_matches: Number(progressResult?.totalMatches || 0),
        matched_tags: Array.isArray(progressResult?.matchedTags) ? progressResult.matchedTags : []
      },
      outcomes: thread?.outcomes && typeof thread.outcomes === "object" ? thread.outcomes : {}
    };
  }

  function resolveThreads(threads, snapshot, priorState) {
    const activeThreads = [];
    const completedIds = Array.isArray(priorState?.completed_thread_ids)
      ? priorState.completed_thread_ids
      : [];

    for (const thread of Array.isArray(threads) ? threads : []) {
      if (!thread?.id) continue;

      const requiredOk = evaluateRequiredState(thread, snapshot);
      if (!requiredOk) continue;

      const progressResult = evaluateProgress(thread, snapshot);
      const materialized = materializeThread(thread, snapshot, progressResult, priorState);

      if (!completedIds.includes(materialized.id)) {
        activeThreads.push(materialized);
      }
    }

    activeThreads.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.progress.total_matches !== a.progress.total_matches) {
        return b.progress.total_matches - a.progress.total_matches;
      }
      return a.id.localeCompare(b.id);
    });

    return activeThreads;
  }

  function completeThread(threadId) {
    const state = getRoleThreadState();
    const threads = state.thread_states && typeof state.thread_states === "object"
      ? { ...state.thread_states }
      : {};

    const completed = Array.isArray(state.completed_thread_ids)
      ? state.completed_thread_ids.slice()
      : [];

    const active = Array.isArray(state.active_thread_ids)
      ? state.active_thread_ids.slice()
      : [];

    if (!completed.includes(threadId)) {
      completed.push(threadId);
    }

    const thread = threads[threadId] || null;
    const outcomes = thread?.outcomes && typeof thread.outcomes === "object" ? thread.outcomes : {};

    const nextFlags = uniq(
      (Array.isArray(state.story_flags) ? state.story_flags : [])
        .concat(Array.isArray(outcomes.story_flags_on_complete) ? outcomes.story_flags_on_complete : [])
        .map(normStr)
        .filter(Boolean)
    );

    const nextTags = uniq(
      (Array.isArray(state.story_tags) ? state.story_tags : [])
        .concat(Array.isArray(outcomes.story_tags_on_complete) ? outcomes.story_tags_on_complete : [])
        .map(normStr)
        .filter(Boolean)
    );

    return saveRoleThreadState({
      ...state,
      active_thread_ids: active.filter(id => id !== threadId),
      completed_thread_ids: completed,
      story_flags: nextFlags,
      story_tags: nextTags,
      thread_states: threads
    });
  }

  async function refresh(opts = {}) {
    const threads = await loadThreads(!!opts.forceThreads);
    const snapshot = buildSnapshot();
    const priorState = getRoleThreadState();
    const activeThreads = resolveThreads(threads, snapshot, priorState);

    const threadStates = {};
    for (const t of activeThreads) {
      threadStates[t.id] = t;
    }

    const completedIds = Array.isArray(priorState.completed_thread_ids)
      ? priorState.completed_thread_ids
      : [];

    return saveRoleThreadState({
      ...priorState,
      active_thread_ids: activeThreads.map(t => t.id),
      completed_thread_ids: completedIds,
      story_flags: Array.isArray(priorState.story_flags) ? priorState.story_flags : [],
      story_tags: Array.isArray(priorState.story_tags) ? priorState.story_tags : [],
      thread_states: threadStates
    });
  }

  function getState() {
    return getRoleThreadState();
  }

  function getActiveThreads() {
    const state = getRoleThreadState();
    const ids = Array.isArray(state.active_thread_ids) ? state.active_thread_ids : [];
    const byId = state.thread_states && typeof state.thread_states === "object"
      ? state.thread_states
      : {};

    return ids
      .map(id => byId[id] || null)
      .filter(Boolean);
  }

  function getCompletedThreadIds() {
    const state = getRoleThreadState();
    return Array.isArray(state.completed_thread_ids) ? state.completed_thread_ids : [];
  }

  function getStoryFlags() {
    const state = getRoleThreadState();
    return Array.isArray(state.story_flags) ? state.story_flags : [];
  }

  function getStoryTags() {
    const state = getRoleThreadState();
    return Array.isArray(state.story_tags) ? state.story_tags : [];
  }

  function clearState() {
    localStorage.removeItem(LS_ROLE_THREAD_STATE);
    localStorage.removeItem("hg_role_progress_log_v1");
  }

  window.CiviRoleThreadResolver = {
    init: refresh,
    refresh,
    loadThreads,
    buildSnapshot,
    getState,
    getActiveThreads,
    getCompletedThreadIds,
    getStoryFlags,
    getStoryTags,
    appendProgressEvent,
    completeThread,
    clearState
  };
})();
