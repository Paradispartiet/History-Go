// js/Civication/systems/civicationThreadBridge.js
// HGCivicationThreadBridge — V2 mail bridge for Civication.
//
// Ansvar:
// 1. Laste V2 mailfamilier som inneholder `threads`.
// 2. Enkø triggered thread-mails i samme inbox-format som resten av Civication.
// 3. Patche CivicationEventEngine.answer robust etter at alle andre runtime-patcher er lastet.
// 4. Maksfikse gammel mailPlan-runtime slik at planlagte mailtyper som `faction_choice`
//    og faser som `advanced` / `mastery` ikke stopper rolleflyten.

(function () {
  "use strict";

  const V2_FAMILY_FILES = [
    "data/Civication/mailFamilies/naeringsliv/job/arbeider_intro_v2.json",
    "data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json",
    "data/Civication/mailFamilies/naeringsliv/job/mellomleder_intro_v2.json"
  ];

  const MAIL_TYPES = ["job", "faction_choice", "conflict", "people", "story", "event"];
  const PHASE_ORDER = ["intro", "early", "mid", "advanced", "mastery", "climax"];

  const ROLE_SCOPE_BY_ROLE_ID = {
    naer_arbeider: "arbeider",
    naer_fagarbeider: "fagarbeider",
    naer_mellomleder: "mellomleder",
    naer_formann: "formann"
  };

  const _byId = new Map();
  let _loaded = false;
  let _loading = null;

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

  function normalizePhase(value) {
    const phase = slugify(value || "intro");
    return PHASE_ORDER.includes(phase) ? phase : "intro";
  }

  function nextPhase(value) {
    const phase = normalizePhase(value);
    const idx = PHASE_ORDER.indexOf(phase);
    return PHASE_ORDER[Math.min(idx + 1, PHASE_ORDER.length - 1)] || "climax";
  }

  function resolveRoleScope(active) {
    const roleId = norm(active?.role_id);
    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) return ROLE_SCOPE_BY_ROLE_ID[roleId];

    const roleKey = slugify(active?.role_key || "");
    if (roleKey === "naer_arbeider" || roleKey === "arbeider") return "arbeider";
    if (roleKey === "naer_fagarbeider" || roleKey === "fagarbeider") return "fagarbeider";
    if (roleKey === "naer_mellomleder" || roleKey === "mellomleder") return "mellomleder";
    if (roleKey === "naer_formann" || roleKey === "formann") return "formann";

    return slugify(active?.title || "");
  }

  function deriveBinding(mail) {
    const binding = mail?.thread_binding && typeof mail.thread_binding === "object"
      ? { ...mail.thread_binding }
      : {};

    const familyId = norm(mail?.mail_family);
    const mailType = norm(mail?.mail_type);

    if (!binding.people_thread_id && mailType === "people" && familyId) {
      binding.people_thread_id = familyId;
    }
    if (!binding.story_thread_id && mailType === "story" && familyId) {
      binding.story_thread_id = familyId;
    }
    if (!binding.event_thread_id && mailType === "event" && familyId) {
      binding.event_thread_id = familyId;
    }

    return binding;
  }

  function getThreadPhase(binding, fallbackPhase) {
    return normalizePhase(
      binding?.conflict_phase ||
      binding?.people_phase ||
      binding?.story_phase ||
      binding?.event_phase ||
      fallbackPhase
    );
  }

  async function load() {
    if (_loaded) return;
    if (_loading) return _loading;

    _loading = (async () => {
      for (const url of V2_FAMILY_FILES) {
        try {
          const r = await fetch(url, { cache: "no-store" });
          if (!r.ok) continue;

          const cat = await r.json();
          for (const fam of (cat?.families || [])) {
            for (const thread of (fam?.threads || [])) {
              const id = norm(thread?.id);
              if (!id) continue;

              _byId.set(id, {
                ...thread,
                mail_type: thread.mail_type || cat.mail_type || "job",
                mail_family: thread.mail_family || fam.id,
                role_scope: thread.role_scope || cat.role_scope,
                category: cat.category
              });
            }
          }
        } catch (e) {
          if (window.DEBUG) console.warn("[ThreadBridge] kunne ikke laste", url, e);
        }
      }

      _loaded = true;
    })();

    return _loading;
  }

  function lookup(id) {
    const key = norm(id);
    if (!key) return null;
    return _byId.get(key) || null;
  }

  function getPendingEventFromEngine(engine) {
    if (engine && typeof engine.getPendingEvent === "function") {
      return engine.getPendingEvent();
    }

    const inbox = window.CivicationState?.getInbox?.() || [];
    return Array.isArray(inbox)
      ? inbox.find(item => item && item.status === "pending") || null
      : null;
  }

  function findChoice(eventObj, choiceId) {
    const cid = norm(choiceId);
    const choices = Array.isArray(eventObj?.choices) ? eventObj.choices : [];
    return choices.find(choice => norm(choice?.id) === cid) || null;
  }

  function answerExplicitlyFailed(res) {
    return res && typeof res === "object" && res.ok === false;
  }

  function currentPhaseTagFallback(options) {
    return norm(options?.phaseTag) ||
      norm(options?.sourcePhaseTag) ||
      norm(window.CivicationCalendar?.getPhase?.()) ||
      "morning";
  }

  async function enqueueThread(threadId, options = {}) {
    await load();

    const thread = lookup(threadId);
    if (!thread) {
      if (window.DEBUG) console.warn("[ThreadBridge] ukjent thread:", threadId);
      return false;
    }

    const inbox = window.CivicationState?.getInbox?.() || [];
    const threadKey = norm(thread.id);

    if (Array.isArray(inbox) && inbox.some(item => norm(item?.event?.id || item?.id) === threadKey)) {
      return false;
    }

    const event = {
      id: thread.id,
      mail_type: thread.mail_type || "job",
      mail_family: thread.mail_family,
      role_scope: thread.role_scope,
      phase: thread.phase || "intro",
      phase_tag: currentPhaseTagFallback(options),
      priority: thread.priority || 70,
      cooldown: 0,
      stage: "stable",
      source: thread.source || "Civication",
      source_type: "thread",
      from: thread.from,
      place_id: thread.place_id,
      subject: thread.subject,
      situation: thread.situation,
      choices: thread.choices,
      _is_thread: true,
      _triggered_by: options.triggeredBy || null,
      _triggered_choice: options.choiceId || null
    };

    const nextInbox = Array.isArray(inbox) ? inbox.slice() : [];
    nextInbox.unshift({
      status: "pending",
      enqueued_at: new Date().toISOString(),
      queuedAt: Date.now(),
      event
    });

    window.CivicationState?.setInbox?.(nextInbox);
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    return true;
  }

  function patchEngineAnswer() {
    const Engine = window.CivicationEventEngine;
    if (!Engine || !Engine.prototype) return false;

    const proto = Engine.prototype;
    if (typeof proto.answer !== "function") return false;

    // Andre Civication-patcher overskriver proto.answer etter at denne filen er lastet.
    // Derfor må vi pakke inn den AKTUELLE funksjonsreferansen, ikke stole på et gammelt flagg.
    if (proto.answer.__threadBridgeWrapped === true) return true;

    const originalAnswer = proto.answer;

    const wrapped = async function threadBridgeAnswer(eventId, choiceId) {
      const pending = getPendingEventFromEngine(this);
      const pendingEvent = pending?.event || null;
      const choice = findChoice(pendingEvent, choiceId);
      const triggerId = norm(choice?.triggers_on_choice);
      const sourcePhaseTag = norm(pendingEvent?.phase_tag) || norm(window.CivicationCalendar?.getPhase?.()) || "morning";

      const res = await originalAnswer.call(this, eventId, choiceId);

      if (triggerId && !answerExplicitlyFailed(res)) {
        await enqueueThread(triggerId, {
          triggeredBy: eventId,
          choiceId,
          sourcePhaseTag
        });
      }

      return res;
    };

    wrapped.__threadBridgeWrapped = true;
    wrapped.__threadBridgeOriginal = originalAnswer;
    proto.answer = wrapped;
    proto.__threadBridgeAnswerPatchedAt = new Date().toISOString();
    return true;
  }

  function patchMailPlanRuntime() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto) return false;

    proto.getMailPlanPath = function maxFixGetMailPlanPath(active) {
      const category = norm(active?.career_id);
      const roleScope = resolveRoleScope(active);
      if (!category || !roleScope) return null;
      return `mailPlans/${category}/${roleScope}_plan.json`;
    };

    proto.getMailFamilyPaths = function maxFixGetMailFamilyPaths(active) {
      const category = norm(active?.career_id);
      const roleScope = resolveRoleScope(active);
      if (!category || !roleScope) return [];

      return MAIL_TYPES.map(type => `mailFamilies/${category}/${type}/${roleScope}_${type}.json`);
    };

    proto.isMailAllowedByThreadState = function maxFixIsMailAllowedByThreadState(mail, state) {
      const mailSystem = state?.mail_system && typeof state.mail_system === "object"
        ? state.mail_system
        : {};

      const binding = deriveBinding(mail);
      const phase = getThreadPhase(binding, mail?.phase);

      const conflictId = norm(binding?.conflict_id);
      if (conflictId) {
        const activeConflictId = norm(mailSystem?.active_conflict_id);
        const activeConflictPhase = normalizePhase(mailSystem?.active_conflict_phase || "intro");
        if (!activeConflictId) return phase === "intro";
        if (activeConflictId !== conflictId) return phase === "intro";
        return activeConflictPhase === phase;
      }

      const peopleThreadId = norm(binding?.people_thread_id);
      if (peopleThreadId) {
        const activeThreads = new Set(uniqueStrings(mailSystem?.active_people_threads));
        const threadPhases = mailSystem?.people_thread_phases && typeof mailSystem.people_thread_phases === "object"
          ? mailSystem.people_thread_phases
          : {};
        const currentPhase = normalizePhase(threadPhases[peopleThreadId] || phase);
        if (!activeThreads.has(peopleThreadId)) return true;
        return currentPhase === phase;
      }

      const storyThreadId = norm(binding?.story_thread_id);
      if (storyThreadId) {
        const activeThreads = new Set(uniqueStrings(mailSystem?.active_story_threads));
        const threadPhases = mailSystem?.story_thread_phases && typeof mailSystem.story_thread_phases === "object"
          ? mailSystem.story_thread_phases
          : {};
        const currentPhase = normalizePhase(threadPhases[storyThreadId] || phase);
        if (!activeThreads.has(storyThreadId)) return true;
        return currentPhase === phase;
      }

      const eventThreadId = norm(binding?.event_thread_id);
      if (eventThreadId) {
        const activeEventThreadId = norm(mailSystem?.active_event_thread_id);
        const activeEventPhase = normalizePhase(mailSystem?.active_event_phase || phase);
        if (!activeEventThreadId) return true;
        if (activeEventThreadId !== eventThreadId) return true;
        return activeEventPhase === phase;
      }

      return true;
    };

    if (typeof proto.registerChosenMail === "function" && proto.registerChosenMail.__maxFixWrapped !== true) {
      const originalRegisterChosenMail = proto.registerChosenMail;

      const wrappedRegister = function maxFixRegisterChosenMail(eventObj, active = null) {
        const res = originalRegisterChosenMail.call(this, eventObj, active);

        const state = this.getState?.() || {};
        const current = state?.mail_system && typeof state.mail_system === "object"
          ? state.mail_system
          : null;

        if (!current || !eventObj) return res;

        const binding = deriveBinding(eventObj);
        const phase = getThreadPhase(binding, eventObj?.phase);
        const next = { ...current };

        const conflictId = norm(binding?.conflict_id);
        if (conflictId) {
          next.active_conflict_id = conflictId;
          next.active_conflict_phase = nextPhase(phase);
        }

        const peopleThreadId = norm(binding?.people_thread_id);
        if (peopleThreadId) {
          const activeThreads = uniqueStrings(next.active_people_threads);
          if (!activeThreads.includes(peopleThreadId)) activeThreads.push(peopleThreadId);
          next.active_people_threads = activeThreads;
          next.people_thread_phases = {
            ...(next.people_thread_phases && typeof next.people_thread_phases === "object" ? next.people_thread_phases : {}),
            [peopleThreadId]: nextPhase(phase)
          };
        }

        const storyThreadId = norm(binding?.story_thread_id);
        if (storyThreadId) {
          const activeThreads = uniqueStrings(next.active_story_threads);
          if (!activeThreads.includes(storyThreadId)) activeThreads.push(storyThreadId);
          next.active_story_threads = activeThreads;
          next.story_thread_phases = {
            ...(next.story_thread_phases && typeof next.story_thread_phases === "object" ? next.story_thread_phases : {}),
            [storyThreadId]: nextPhase(phase)
          };
        }

        const eventThreadId = norm(binding?.event_thread_id);
        if (eventThreadId) {
          next.active_event_thread_id = eventThreadId;
          next.active_event_phase = nextPhase(phase);
        }

        this.setState?.({ mail_system: next });
        return res;
      };

      wrappedRegister.__maxFixWrapped = true;
      wrappedRegister.__maxFixOriginal = originalRegisterChosenMail;
      proto.registerChosenMail = wrappedRegister;
    }

    proto.__civicationMailMaxFixPatched = true;
    proto.__civicationMailMaxFixPatchedAt = new Date().toISOString();
    return true;
  }

  function inspect() {
    const active = window.CivicationState?.getActivePosition?.() || null;
    const state = window.CivicationState?.getState?.() || {};
    const inbox = window.CivicationState?.getInbox?.() || [];
    const proto = window.CivicationEventEngine?.prototype;

    return {
      active,
      phase: window.CivicationCalendar?.getPhase?.() || null,
      pending: Array.isArray(inbox) ? inbox.find(item => item?.status === "pending")?.event || null : null,
      mail_plan_progress: state.mail_plan_progress || null,
      mail_system: state.mail_system || null,
      director_v2: state.mail_director_v2 || null,
      thread_count: _byId.size,
      answer_wrapped: proto?.answer?.__threadBridgeWrapped === true,
      mail_runtime_patched: proto?.__civicationMailMaxFixPatched === true,
      family_paths: active && proto?.getMailFamilyPaths ? proto.getMailFamilyPaths(active) : []
    };
  }

  function boot() {
    load();
    patchMailPlanRuntime();
    patchEngineAnswer();
  }

  window.CivicationThreadBridge = {
    load,
    lookup,
    enqueueThread,
    patchEngineAnswer,
    patchMailPlanRuntime,
    inspect
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  // Disse eventene kommer etter at alle andre Civication-patcher har fått sjansen til å overskrive prototypene.
  // Da pakker vi inn den endelige answer()-funksjonen og overskriver gammel mailplanlogikk igjen.
  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
  window.addEventListener("updateProfile", function () {
    patchMailPlanRuntime();
    patchEngineAnswer();
  });
})();
