// js/Civication/systems/civicationMailRuntime.js
// CivicationMailRuntime — autoritativ mailmotor for Civication.
//
// Prinsipp:
// - Én runtime eier jobbmailflyten.
// - Data bestemmer innholdet: mailPlans + mailFamilies.
// - EventEngine beholder generisk ansvar: enqueue, answer, state.
// - Day-systemet kan fortsatt kalle buildMailPool/pickEventFromPack, men kandidatene kommer herfra.
// - Kun planned/thread-mails får skrive mail_runtime_v1.

(function () {
  "use strict";

  const RUNTIME_KEY = "mail_runtime_v1";

  const MAIL_TYPES = [
    "job",
    "faction_choice",
    "people",
    "story",
    "conflict",
    "event"
  ];

  const PHASE_ORDER = [
    "intro",
    "early",
    "mid",
    "advanced",
    "mastery",
    "climax"
  ];

  const ROLE_SCOPE_BY_ROLE_ID = {
    naer_arbeider: "arbeider",
    naer_ekspeditor: "ekspeditor",
    naer_fagarbeider: "fagarbeider",
    naer_mellomleder: "mellomleder",
    naer_formann: "formann"
  };

  const ROLE_SCOPE_BY_TITLE = {
    arbeider: "arbeider",
    ekspeditor: "ekspeditor",
    ekspeditor_butikkmedarbeider: "ekspeditor",
    fagarbeider: "fagarbeider",
    mellomleder: "mellomleder",
    formann: "formann"
  };

  const jsonCache = new Map();
  const threadIndex = new Map();

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

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }

  function getInbox() {
    return window.CivicationState?.getInbox?.() || [];
  }

  function setInbox(nextInbox) {
    window.CivicationState?.setInbox?.(Array.isArray(nextInbox) ? nextInbox : []);
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function resolveRoleScope(active) {
    const externalResolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof externalResolver === "function") {
      const resolved = norm(externalResolver(active));
      if (resolved && resolved !== "unknown") return resolved;
    }

    const roleId = norm(active?.role_id);
    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) return ROLE_SCOPE_BY_ROLE_ID[roleId];

    const titleKey = slugify(active?.title || "");
    if (ROLE_SCOPE_BY_TITLE[titleKey]) return ROLE_SCOPE_BY_TITLE[titleKey];

    const roleKey = slugify(active?.role_key || "");
    if (roleKey === "naer_ekspeditor" || roleKey === "ekspeditor" || roleKey.includes("ekspedit")) return "ekspeditor";
    if (roleKey === "naer_arbeider" || roleKey === "arbeider") return "arbeider";
    if (roleKey === "naer_fagarbeider" || roleKey === "fagarbeider") return "fagarbeider";
    if (roleKey === "naer_mellomleder" || roleKey === "mellomleder") return "mellomleder";
    if (roleKey === "naer_formann" || roleKey === "formann") return "formann";

    return titleKey;
  }

  function normalizePhase(value) {
    const phase = slugify(value || "intro");
    return PHASE_ORDER.includes(phase) ? phase : "intro";
  }

  async function loadJson(path) {
    const p = norm(path);
    if (!p) return null;
    if (jsonCache.has(p)) return jsonCache.get(p);

    try {
      const res = await fetch(p, { cache: "no-store" });
      if (!res.ok) {
        jsonCache.set(p, null);
        return null;
      }

      const json = await res.json();
      jsonCache.set(p, json);
      return json;
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationMailRuntime] kunne ikke laste", p, error);
      jsonCache.set(p, null);
      return null;
    }
  }

  function getPlanPath(active) {
    const category = norm(active?.career_id);
    const roleScope = resolveRoleScope(active);
    if (!category || !roleScope) return null;
    return `data/Civication/mailPlans/${category}/${roleScope}_plan.json`;
  }

  function getFamilyPaths(active) {
    const category = norm(active?.career_id);
    const roleScope = resolveRoleScope(active);
    if (!category || !roleScope) return [];

    const paths = [];

    paths.push(`data/Civication/mailFamilies/${category}/job/${roleScope}_intro_v2.json`);
    paths.push(`data/Civication/mailFamilies/${category}/job/${roleScope}_job.json`);

    for (const type of MAIL_TYPES) {
      if (type === "job") continue;
      paths.push(`data/Civication/mailFamilies/${category}/${type}/${roleScope}_${type}.json`);
    }

    const brandId = slugify(active?.brand_id || "");
    if (brandId) {
      paths.push(`data/Civication/mailFamilies/${category}/brand/${roleScope}_${brandId}.json`);
    }

    return paths;
  }

  function getPlanProgress(state, plan) {
    const runtime = state?.[RUNTIME_KEY] && typeof state[RUNTIME_KEY] === "object"
      ? state[RUNTIME_KEY]
      : {};

    const planId = norm(plan?.id);
    const samePlan = planId && norm(runtime.role_plan_id) === planId;

    return {
      version: 1,
      role_plan_id: samePlan ? planId : planId || null,
      step_index: samePlan ? Math.max(0, Number(runtime.step_index || 0)) : 0,
      consumed_ids: samePlan ? uniqueStrings(runtime.consumed_ids) : [],
      history: samePlan && Array.isArray(runtime.history) ? runtime.history.slice(-80) : [],
      updated_at: runtime.updated_at || null
    };
  }

  function getConsumedIds(state) {
    const stateConsumed = state?.consumed && typeof state.consumed === "object"
      ? Object.keys(state.consumed)
      : [];

    const runtime = state?.[RUNTIME_KEY] && typeof state[RUNTIME_KEY] === "object"
      ? state[RUNTIME_KEY]
      : {};

    const mailSystem = state?.mail_system && typeof state.mail_system === "object"
      ? state.mail_system
      : {};

    const director = state?.mail_director_v2 && typeof state.mail_director_v2 === "object"
      ? state.mail_director_v2
      : {};

    return uniqueStrings([
      ...stateConsumed,
      ...(Array.isArray(runtime.consumed_ids) ? runtime.consumed_ids : []),
      ...(Array.isArray(mailSystem.consumed_mail_ids) ? mailSystem.consumed_mail_ids : []),
      ...(Array.isArray(director.shown_ids) ? director.shown_ids : []),
      ...(Array.isArray(director.answered_ids) ? director.answered_ids : [])
    ]);
  }

  function flattenCatalog(catalog) {
    const out = [];
    const families = Array.isArray(catalog?.families) ? catalog.families : [];
    const catalogType = norm(catalog?.mail_type);

    for (const family of families) {
      const familyId = norm(family?.id);
      const familyBinding = family?.thread_binding && typeof family.thread_binding === "object"
        ? family.thread_binding
        : {};

      const mails = Array.isArray(family?.mails) ? family.mails : [];
      for (const mail of mails) {
        const id = norm(mail?.id);
        if (!id) continue;

        out.push({
          ...mail,
          id,
          mail_type: norm(mail?.mail_type || catalogType || "job"),
          mail_family: norm(mail?.mail_family || familyId),
          role_scope: norm(mail?.role_scope || catalog?.role_scope),
          category: norm(catalog?.category),
          thread_binding: {
            ...familyBinding,
            ...(mail?.thread_binding && typeof mail.thread_binding === "object" ? mail.thread_binding : {})
          }
        });
      }

      const threads = Array.isArray(family?.threads) ? family.threads : [];
      for (const thread of threads) {
        const id = norm(thread?.id);
        if (!id) continue;

        threadIndex.set(id, {
          ...thread,
          id,
          mail_type: norm(thread?.mail_type || catalogType || "job"),
          mail_family: norm(thread?.mail_family || familyId),
          role_scope: norm(thread?.role_scope || catalog?.role_scope),
          category: norm(catalog?.category),
          source_type: "thread"
        });
      }
    }

    return out;
  }

  async function loadCatalogs(active) {
    const paths = getFamilyPaths(active);
    const catalogs = [];

    for (const path of paths) {
      const json = await loadJson(path);
      if (json) catalogs.push(json);
    }

    return catalogs;
  }

  function getCurrentStep(plan, runtime) {
    const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
    if (!sequence.length) return null;

    const idx = Math.max(0, Number(runtime?.step_index || 0));
    return sequence[Math.min(idx, sequence.length - 1)] || sequence[0] || null;
  }

  function allowedFamilySet(step) {
    return new Set((Array.isArray(step?.allowed_families) ? step.allowed_families : []).map(norm).filter(Boolean));
  }

  function normalizeChoices(choices) {
    return (Array.isArray(choices) ? choices : [])
      .filter(Boolean)
      .map(choice => {
        const out = { ...choice };
        out.id = norm(out.id);
        out.label = norm(out.label);
        out.effect = Number(out.effect || 0);
        out.tags = Array.isArray(out.tags) ? out.tags.map(norm).filter(Boolean) : [];
        out.feedback = norm(out.feedback);
        if (out.reply) out.reply = norm(out.reply);
        if (out.triggers_on_choice) out.triggers_on_choice = norm(out.triggers_on_choice);
        return out;
      })
      .filter(choice => choice.id && choice.label);
  }

  function toRuntimeMail(active, plan, step, mail, sourceStepIndex) {
    const roleScope = resolveRoleScope(active);
    const mailType = norm(mail?.mail_type || step?.type || "job");
    const mailFamily = norm(mail?.mail_family);
    const phase = norm(mail?.phase || step?.phase || "intro");

    return {
      ...mail,
      id: norm(mail?.id),
      source: norm(mail?.source || "Civication"),
      source_type: "planned",
      stage: norm(mail?.stage || "stable") || "stable",
      subject: norm(mail?.subject),
      summary: norm(mail?.summary),
      situation: Array.isArray(mail?.situation) ? mail.situation.map(norm).filter(Boolean) : [norm(mail?.summary)].filter(Boolean),
      choices: normalizeChoices(mail?.choices),
      from: norm(mail?.from),
      place_id: norm(mail?.place_id),
      people_ref: norm(mail?.people_ref),
      source_place_ref: norm(mail?.source_place_ref || mail?.place_id),
      role_id: norm(active?.role_id),
      career_id: norm(active?.career_id),
      tier_label: norm(active?.title || roleScope),
      mail_type: mailType,
      mail_family: mailFamily,
      phase,
      priority: Number(mail?.priority || 1),
      role_content_meta: {
        ...(mail?.role_content_meta || {}),
        role_id: norm(active?.role_id),
        role_scope: roleScope,
        plan_id: norm(plan?.id),
        plan_step: Number(step?.step || 0),
        plan_step_index: sourceStepIndex,
        family_id: mailFamily,
        storylet_id: norm(mail?.id),
        from: norm(mail?.from),
        place_id: norm(mail?.place_id)
      },
      mail_plan_meta: {
        plan_id: norm(plan?.id),
        role_scope: roleScope,
        step: Number(step?.step || 0),
        step_index: sourceStepIndex,
        phase: norm(step?.phase),
        type: norm(step?.type),
        fallback_types: Array.isArray(step?.fallback_types) ? step.fallback_types.map(norm).filter(Boolean) : []
      },
      mail_tags: uniqueStrings([
        "planned_mail",
        norm(active?.career_id),
        roleScope,
        mailType,
        mailFamily,
        norm(step?.phase)
      ])
    };
  }

  function candidatesForStep(active, plan, step, stepIndex, mails, consumedIds, options = {}) {
    if (!step) return [];

    const wantedType = norm(options.type || step?.type);
    const allowedFamilies = allowedFamilySet(step);
    const strictFamily = options.strictFamily !== false;

    return mails
      .filter(mail => {
        const id = norm(mail?.id);
        if (!id || consumedIds.has(id)) return false;
        if (wantedType && norm(mail?.mail_type) !== wantedType) return false;
        if (strictFamily && allowedFamilies.size && !allowedFamilies.has(norm(mail?.mail_family))) return false;
        return true;
      })
      .map(mail => toRuntimeMail(active, plan, step, mail, stepIndex));
  }

  function scoreCandidate(mail, wantedStepIndex, runtime) {
    let score = Number(mail?.priority || 1);
    score += Math.max(0, 100 - Math.abs(Number(mail?.mail_plan_meta?.step_index || 0) - wantedStepIndex) * 10);

    const history = Array.isArray(runtime?.history) ? runtime.history : [];
    const recentFamilies = history.slice(-4).map(row => norm(row?.mail_family));
    if (recentFamilies.includes(norm(mail?.mail_family))) score -= 12;

    if (norm(mail?.mail_type) === "faction_choice") score += 8;
    return score;
  }

  function sortCandidates(candidates, wantedStepIndex, runtime) {
    return candidates
      .map(mail => ({ ...mail, _runtime_score: scoreCandidate(mail, wantedStepIndex, runtime) }))
      .sort((a, b) => Number(b._runtime_score || 0) - Number(a._runtime_score || 0));
  }

  async function makeCandidateMailsForActiveRole(active, state = getState()) {
    if (!active) return [];

    const planPath = getPlanPath(active);
    const plan = await loadJson(planPath);
    if (!plan || !Array.isArray(plan.sequence) || !plan.sequence.length) return [];

    const runtime = getPlanProgress(state, plan);
    const catalogs = await loadCatalogs(active);
    const mails = catalogs.flatMap(flattenCatalog);
    if (!mails.length) return [];

    const consumedIds = new Set(getConsumedIds(state));
    const sequence = plan.sequence.map((step, index) => ({ step, index }));
    const current = getCurrentStep(plan, runtime);
    const currentIndex = sequence.find(row => row.step === current)?.index ?? Math.max(0, Number(runtime.step_index || 0));

    let candidates = candidatesForStep(active, plan, current, currentIndex, mails, consumedIds, { strictFamily: true });

    if (!candidates.length) {
      const fallbackTypes = Array.isArray(current?.fallback_types) ? current.fallback_types.map(norm).filter(Boolean) : [];
      for (const fallbackType of fallbackTypes) {
        candidates = candidatesForStep(active, plan, current, currentIndex, mails, consumedIds, {
          type: fallbackType,
          strictFamily: true
        });
        if (candidates.length) break;

        candidates = candidatesForStep(active, plan, current, currentIndex, mails, consumedIds, {
          type: fallbackType,
          strictFamily: false
        });
        if (candidates.length) break;
      }
    }

    if (!candidates.length) {
      for (const row of sequence) {
        if (row.index === currentIndex) continue;
        candidates = candidatesForStep(active, plan, row.step, row.index, mails, consumedIds, { strictFamily: true });
        if (candidates.length) break;
      }
    }

    return sortCandidates(candidates, currentIndex, runtime);
  }

  function buildRuntimeStatePatchForAnswer(active, eventObj, choiceId) {
    const state = getState();
    const runtime = state?.[RUNTIME_KEY] && typeof state[RUNTIME_KEY] === "object"
      ? state[RUNTIME_KEY]
      : {};

    const id = norm(eventObj?.id);
    if (!id) return null;

    const isPlanned = norm(eventObj?.source_type) === "planned";
    const isThread = norm(eventObj?.source_type) === "thread" || eventObj?._is_thread === true;
    if (!isPlanned && !isThread) return null;

    const planId = norm(eventObj?.mail_plan_meta?.plan_id || runtime.role_plan_id);
    const stepIndex = Math.max(0, Number(runtime.step_index || 0));
    const nextStepIndex = isPlanned && !isThread ? stepIndex + 1 : stepIndex;

    const consumedIds = uniqueStrings([...(Array.isArray(runtime.consumed_ids) ? runtime.consumed_ids : []), id]);
    const history = [
      ...(Array.isArray(runtime.history) ? runtime.history : []),
      {
        id,
        choice_id: norm(choiceId),
        source_type: norm(eventObj?.source_type),
        mail_type: norm(eventObj?.mail_type),
        mail_family: norm(eventObj?.mail_family),
        plan_id: planId || null,
        step_index: Number(eventObj?.mail_plan_meta?.step_index ?? stepIndex),
        at: new Date().toISOString()
      }
    ].slice(-80);

    const consumedMap = {
      ...(state?.consumed && typeof state.consumed === "object" ? state.consumed : {}),
      [id]: true
    };

    const legacyMailSystem = state?.mail_system && typeof state.mail_system === "object"
      ? state.mail_system
      : {};

    const legacyConsumed = uniqueStrings([
      ...(Array.isArray(legacyMailSystem.consumed_mail_ids) ? legacyMailSystem.consumed_mail_ids : []),
      id
    ]);

    const legacyHistory = [
      ...(Array.isArray(legacyMailSystem.history) ? legacyMailSystem.history : []),
      {
        id,
        mail_type: norm(eventObj?.mail_type),
        mail_family: norm(eventObj?.mail_family),
        source_type: norm(eventObj?.source_type),
        at: new Date().toISOString()
      }
    ].slice(-80);

    return {
      consumed: consumedMap,
      [RUNTIME_KEY]: {
        version: 1,
        role_plan_id: planId || null,
        role_scope: resolveRoleScope(active),
        career_id: norm(active?.career_id),
        step_index: nextStepIndex,
        consumed_ids: consumedIds,
        history,
        updated_at: new Date().toISOString()
      },
      mail_plan_progress: {
        role_plan_id: planId || null,
        step_index: nextStepIndex,
        current_step_type: norm(eventObj?.mail_plan_meta?.type || eventObj?.mail_type)
      },
      mail_system: {
        ...legacyMailSystem,
        role_plan_id: planId || legacyMailSystem.role_plan_id || null,
        step_index: nextStepIndex,
        last_mail_type: norm(eventObj?.mail_type) || legacyMailSystem.last_mail_type || null,
        consumed_mail_ids: legacyConsumed,
        history: legacyHistory
      }
    };
  }

  async function enqueueThread(threadId, options = {}) {
    const key = norm(threadId);
    if (!key) return false;

    const active = getActive();
    if (active) {
      const catalogs = await loadCatalogs(active);
      catalogs.forEach(flattenCatalog);
    }

    const thread = threadIndex.get(key);
    if (!thread) {
      if (window.DEBUG) console.warn("[CivicationMailRuntime] ukjent thread:", key);
      return false;
    }

    const existingInbox = getInbox();
    let nextInbox = Array.isArray(existingInbox) ? existingInbox.slice() : [];

    if (options.replacePending === true) {
      nextInbox = nextInbox.filter(item => item?.status !== "pending");
    }

    if (nextInbox.some(item => norm(item?.event?.id || item?.id) === key)) return false;

    const event = {
      ...thread,
      id: key,
      source: norm(thread.source || "Civication"),
      source_type: "thread",
      stage: norm(thread.stage || "stable") || "stable",
      phase_tag: norm(options.phase_tag || options.sourcePhaseTag || window.CivicationCalendar?.getPhase?.()) || "morning",
      choices: normalizeChoices(thread.choices),
      _is_thread: true,
      _triggered_by: norm(options.triggeredBy),
      _triggered_choice: norm(options.choiceId)
    };

    nextInbox.unshift({
      status: "pending",
      enqueued_at: new Date().toISOString(),
      event
    });

    setInbox(nextInbox);
    return true;
  }

  function patchEventEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto) return false;

    if (proto.__civicationMailRuntimePatched === true) return true;

    const originalResetForNewJob = proto.resetForNewJob;
    if (typeof originalResetForNewJob === "function") {
      proto.resetForNewJob = function runtimeResetForNewJob(roleKey) {
        const result = originalResetForNewJob.call(this, roleKey);
        setState({
          [RUNTIME_KEY]: {
            version: 1,
            role_plan_id: null,
            role_scope: null,
            career_id: null,
            step_index: 0,
            consumed_ids: [],
            history: [],
            updated_at: new Date().toISOString()
          },
          mail_plan_progress: {
            role_plan_id: null,
            step_index: 0,
            current_step_type: null
          }
        });
        return result;
      };
    }

    const originalBuildMailPool = proto.buildMailPool;
    proto.buildMailPool = async function runtimeBuildMailPool(active, state, roleKey) {
      let fallbackPack = null;
      if (typeof originalBuildMailPool === "function") {
        try {
          fallbackPack = await originalBuildMailPool.call(this, active, state, roleKey);
        } catch (error) {
          if (window.DEBUG) console.warn("[CivicationMailRuntime] fallback buildMailPool feilet", error);
        }
      }

      const runtimeCandidates = await makeCandidateMailsForActiveRole(active, state || getState());
      const fallbackMails = Array.isArray(fallbackPack?.mails)
        ? fallbackPack.mails.filter(mail => norm(mail?.source_type) !== "planned")
        : [];

      return {
        ...(fallbackPack || {}),
        role: fallbackPack?.role || active?.career_id || null,
        tag_rules: fallbackPack?.tag_rules || { max_tags_per_choice: 2, memory_window: 12 },
        tracks: Array.isArray(fallbackPack?.tracks) ? fallbackPack.tracks : [],
        mails: runtimeCandidates.length ? runtimeCandidates : fallbackMails,
        __civication_mail_runtime: true,
        __runtime_candidate_count: runtimeCandidates.length
      };
    };

    const originalPickEventFromPack = proto.pickEventFromPack;
    proto.pickEventFromPack = function runtimePickEventFromPack(pack, state) {
      if (pack?.__civication_mail_runtime && Array.isArray(pack.mails) && pack.mails.length) {
        return pack.mails[0] || null;
      }

      if (typeof originalPickEventFromPack === "function") {
        return originalPickEventFromPack.call(this, pack, state);
      }

      return Array.isArray(pack?.mails) ? pack.mails[0] || null : null;
    };

    const originalAnswer = proto.answer;
    if (typeof originalAnswer === "function") {
      proto.answer = async function runtimeAnswer(eventId, choiceId) {
        const pending = typeof this.getPendingEvent === "function" ? this.getPendingEvent() : null;
        const eventObj = pending?.event || null;
        const active = getActive();
        const choice = Array.isArray(eventObj?.choices)
          ? eventObj.choices.find(row => norm(row?.id) === norm(choiceId)) || null
          : null;
        const triggerId = norm(choice?.triggers_on_choice);
        const sourcePhaseTag = norm(eventObj?.phase_tag || window.CivicationCalendar?.getPhase?.()) || "morning";

        if (eventObj && norm(eventObj.id) === norm(eventId) && choice) {
          const patch = buildRuntimeStatePatchForAnswer(active, eventObj, choiceId);
          if (patch) setState(patch);
        }

        const result = await originalAnswer.call(this, eventId, choiceId);

        if (result?.ok !== false && triggerId) {
          await enqueueThread(triggerId, {
            triggeredBy: eventId,
            choiceId,
            sourcePhaseTag,
            replacePending: true
          });
        }

        return result;
      };
    }

    proto.__civicationMailRuntimePatched = true;
    proto.__civicationMailRuntimePatchedAt = new Date().toISOString();
    return true;
  }

  function inspect() {
    const active = getActive();
    const state = getState();
    const inbox = getInbox();
    const proto = window.CivicationEventEngine?.prototype;

    return {
      active,
      role_scope: active ? resolveRoleScope(active) : null,
      plan_path: active ? getPlanPath(active) : null,
      family_paths: active ? getFamilyPaths(active) : [],
      phase: window.CivicationCalendar?.getPhase?.() || null,
      pending: Array.isArray(inbox) ? inbox.find(item => item?.status === "pending")?.event || null : null,
      runtime: state?.[RUNTIME_KEY] || null,
      mail_plan_progress: state?.mail_plan_progress || null,
      mail_system: state?.mail_system || null,
      patched: proto?.__civicationMailRuntimePatched === true,
      thread_count: threadIndex.size,
      cache_size: jsonCache.size
    };
  }

  async function debugCandidates() {
    const active = getActive();
    if (!active) return [];
    return await makeCandidateMailsForActiveRole(active, getState());
  }

  function boot() {
    patchEventEngine();
  }

  window.CivicationMailRuntime = {
    RUNTIME_KEY,
    boot,
    inspect,
    debugCandidates,
    loadJson,
    getPlanPath,
    getFamilyPaths,
    makeCandidateMailsForActiveRole,
    enqueueThread,
    patchEventEngine
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
