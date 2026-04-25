(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function uniqueStrings(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(normStr).filter(Boolean))];
  }

  function normalizePhase(value) {
    const phase = normStr(value).toLowerCase();
    return ["intro", "early", "mid", "climax", "mastery"].includes(phase) ? phase : "intro";
  }

  function nextPhase(value) {
    const order = ["intro", "early", "mid", "climax", "mastery"];
    const phase = normalizePhase(value);
    const idx = order.indexOf(phase);
    return order[Math.min(idx + 1, order.length - 1)] || "mastery";
  }

  function defaultMailSystem(current) {
    const src = current && typeof current === "object" ? current : {};
    return {
      role_plan_id: src.role_plan_id || null,
      step_index: Number(src.step_index || 0),
      current_cycle: Number(src.current_cycle || 1),
      last_mail_type: src.last_mail_type || null,
      active_conflict_id: src.active_conflict_id || null,
      active_conflict_phase: src.active_conflict_phase || "intro",
      active_people_threads: Array.isArray(src.active_people_threads) ? src.active_people_threads : [],
      people_thread_phases: src.people_thread_phases && typeof src.people_thread_phases === "object" ? src.people_thread_phases : {},
      active_story_threads: Array.isArray(src.active_story_threads) ? src.active_story_threads : [],
      story_thread_phases: src.story_thread_phases && typeof src.story_thread_phases === "object" ? src.story_thread_phases : {},
      active_event_queue: Array.isArray(src.active_event_queue) ? src.active_event_queue : [],
      active_event_thread_id: src.active_event_thread_id || null,
      active_event_phase: src.active_event_phase || null,
      consumed_mail_ids: Array.isArray(src.consumed_mail_ids) ? src.consumed_mail_ids : [],
      consumed_families: Array.isArray(src.consumed_families) ? src.consumed_families : [],
      cooldowns: src.cooldowns && typeof src.cooldowns === "object" ? src.cooldowns : {},
      history: Array.isArray(src.history) ? src.history : []
    };
  }

  function syncMailPlanProgressFromMailSystem() {
    const stateApi = window.CivicationState;
    if (!stateApi || typeof stateApi.getState !== "function" || typeof stateApi.setState !== "function") return null;

    const state = stateApi.getState() || {};
    const mailSystem = defaultMailSystem(state.mail_system);
    const planId = normStr(mailSystem.role_plan_id);
    if (!planId) return null;

    const progress = state.mail_plan_progress && typeof state.mail_plan_progress === "object"
      ? state.mail_plan_progress
      : {};

    const next = {
      role_plan_id: planId,
      step_index: Math.max(0, Number(mailSystem.step_index || 0)),
      current_step_type: normStr(progress.current_step_type)
    };

    const same =
      normStr(progress.role_plan_id) === next.role_plan_id &&
      Number(progress.step_index || 0) === next.step_index;

    if (!same) {
      stateApi.setState({ mail_plan_progress: next });
    }

    return next;
  }

  function deriveBinding(mail) {
    const binding = mail?.thread_binding && typeof mail.thread_binding === "object" ? { ...mail.thread_binding } : {};
    const familyId = normStr(mail?.mail_family);
    const mailType = normStr(mail?.mail_type);

    if (!binding.people_thread_id && mailType === "people" && familyId) binding.people_thread_id = familyId;
    if (!binding.story_thread_id && mailType === "story" && familyId) binding.story_thread_id = familyId;
    if (!binding.event_thread_id && mailType === "event" && familyId) binding.event_thread_id = familyId;
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

  function isMailSystemEvent(eventObj) {
    const mailType = normStr(eventObj?.mail_type);
    const id = normStr(eventObj?.id);
    if (!id || !mailType) return false;
    if (id.startsWith("phase_")) return false;
    if (normStr(eventObj?.stage) === "unemployed") return false;
    return ["job", "faction_choice", "people", "story", "conflict", "event"].includes(mailType);
  }

  function registerAnsweredMail(eventObj) {
    if (!isMailSystemEvent(eventObj)) return null;

    const stateApi = window.CivicationState;
    if (!stateApi || typeof stateApi.getState !== "function" || typeof stateApi.setState !== "function") return null;

    const state = stateApi.getState() || {};
    const current = defaultMailSystem(state.mail_system);
    const id = normStr(eventObj.id);
    if (current.consumed_mail_ids.includes(id)) {
      syncMailPlanProgressFromMailSystem();
      return current;
    }

    const mailType = normStr(eventObj.mail_type) || null;
    const mailFamily = normStr(eventObj.mail_family) || null;
    const binding = deriveBinding(eventObj);
    const phase = getThreadPhase(binding, eventObj?.mail_plan_meta?.phase || eventObj?.phase);

    const consumedMailIds = uniqueStrings([...current.consumed_mail_ids, id]);
    const consumedFamilies = mailFamily ? uniqueStrings([...current.consumed_families, mailFamily]) : current.consumed_families;

    const nextPeopleThreads = uniqueStrings(current.active_people_threads);
    const nextPeoplePhases = { ...current.people_thread_phases };
    const nextStoryThreads = uniqueStrings(current.active_story_threads);
    const nextStoryPhases = { ...current.story_thread_phases };

    const next = {
      ...current,
      step_index: Number(current.step_index || 0) + 1,
      last_mail_type: mailType,
      consumed_mail_ids: consumedMailIds,
      consumed_families: consumedFamilies,
      history: [
        ...current.history,
        {
          id,
          mail_type: mailType,
          mail_family: mailFamily,
          source_type: normStr(eventObj.source_type || eventObj.role_content_meta?.source_type || "family") || null,
          conflict_id: normStr(binding?.conflict_id) || null,
          people_thread_id: normStr(binding?.people_thread_id) || null,
          story_thread_id: normStr(binding?.story_thread_id) || null,
          event_thread_id: normStr(binding?.event_thread_id) || null,
          phase,
          at: new Date().toISOString()
        }
      ].slice(-50)
    };

    const conflictId = normStr(binding?.conflict_id);
    if (conflictId) {
      next.active_conflict_id = conflictId;
      next.active_conflict_phase = nextPhase(phase);
    }

    const peopleThreadId = normStr(binding?.people_thread_id);
    if (peopleThreadId) {
      if (!nextPeopleThreads.includes(peopleThreadId)) nextPeopleThreads.push(peopleThreadId);
      nextPeoplePhases[peopleThreadId] = nextPhase(phase);
      next.active_people_threads = nextPeopleThreads;
      next.people_thread_phases = nextPeoplePhases;
    }

    const storyThreadId = normStr(binding?.story_thread_id);
    if (storyThreadId) {
      if (!nextStoryThreads.includes(storyThreadId)) nextStoryThreads.push(storyThreadId);
      nextStoryPhases[storyThreadId] = nextPhase(phase);
      next.active_story_threads = nextStoryThreads;
      next.story_thread_phases = nextStoryPhases;
    }

    const eventThreadId = normStr(binding?.event_thread_id);
    if (eventThreadId) {
      next.active_event_thread_id = eventThreadId;
      next.active_event_phase = nextPhase(phase);
    }

    stateApi.setState({
      mail_system: next,
      mail_plan_progress: {
        role_plan_id: normStr(next.role_plan_id),
        step_index: Number(next.step_index || 0),
        current_step_type: ""
      }
    });
    return next;
  }

  function syncActiveRoleState() {
    const stateApi = window.CivicationState;
    if (!stateApi || typeof stateApi.getActivePosition !== "function" || typeof stateApi.setState !== "function") return null;

    const active = stateApi.getActivePosition() || null;
    if (!active) return null;

    const roleKey = normStr(active.role_key || active.title || active.role_id || active.career_id);
    if (!roleKey) return null;

    const state = typeof stateApi.getState === "function" ? stateApi.getState() || {} : {};

    const patch = {};
    if (state.active_role_key !== roleKey) patch.active_role_key = roleKey;
    if (state.unemployed_since_week) patch.unemployed_since_week = null;
    if (String(state.stability || "").toUpperCase() === "FIRED") patch.stability = "STABLE";

    if (Object.keys(patch).length) {
      stateApi.setState(patch);
    }

    return {
      active,
      roleKey,
      patch
    };
  }

  async function ensureMailSystemForActiveRole(engine) {
    const stateApi = window.CivicationState;
    if (!stateApi || typeof stateApi.getActivePosition !== "function") return null;

    const active = stateApi.getActivePosition() || null;
    if (!active) return null;

    syncMailPlanProgressFromMailSystem();

    const targetEngine = engine || window.HG_CiviEngine || null;
    if (!targetEngine || typeof targetEngine.ensureMailSystemState !== "function") return null;

    try {
      const res = await targetEngine.ensureMailSystemState(active);
      syncMailPlanProgressFromMailSystem();
      return res;
    } catch (err) {
      console.warn("[activeRoleStateSync] ensureMailSystemState failed", err);
      return null;
    }
  }

  function isNavPending(item) {
    const ev = item?.event || item || {};
    return normStr(ev.source) === "NAV" || normStr(ev.id).startsWith("nav_auto_") || normStr(ev.stage) === "unemployed";
  }

  function clearNavPendingWhenActiveRoleExists() {
    const stateApi = window.CivicationState;
    if (!stateApi || typeof stateApi.getActivePosition !== "function") return false;
    const active = stateApi.getActivePosition() || null;
    if (!active) return false;

    const inbox = typeof stateApi.getInbox === "function" ? stateApi.getInbox() : [];
    if (!Array.isArray(inbox) || !inbox.some(isNavPending)) return false;

    const filtered = inbox.filter((item) => !isNavPending(item));
    if (typeof stateApi.setInbox === "function") {
      stateApi.setInbox(filtered);
      window.dispatchEvent(new Event("updateProfile"));
      return true;
    }
    return false;
  }

  function patchEngine() {
    const Engine = window.CivicationEventEngine;
    if (!Engine || !Engine.prototype) return false;
    const proto = Engine.prototype;
    if (proto.__activeRoleStateSyncPatched) return true;

    const originalOnAppOpen = proto.onAppOpen;
    if (typeof originalOnAppOpen === "function") {
      proto.onAppOpen = async function patchedOnAppOpen(opts) {
        syncActiveRoleState();
        syncMailPlanProgressFromMailSystem();
        await ensureMailSystemForActiveRole(this);
        clearNavPendingWhenActiveRoleExists();
        const res = await originalOnAppOpen.call(this, opts || {});
        syncActiveRoleState();
        syncMailPlanProgressFromMailSystem();
        await ensureMailSystemForActiveRole(this);
        clearNavPendingWhenActiveRoleExists();
        return res;
      };
    }

    const originalFollowup = proto.enqueueImmediateFollowupEvent;
    if (typeof originalFollowup === "function") {
      proto.enqueueImmediateFollowupEvent = async function patchedEnqueueImmediateFollowupEvent() {
        syncActiveRoleState();
        syncMailPlanProgressFromMailSystem();
        await ensureMailSystemForActiveRole(this);
        clearNavPendingWhenActiveRoleExists();
        const res = await originalFollowup.call(this);
        syncActiveRoleState();
        syncMailPlanProgressFromMailSystem();
        await ensureMailSystemForActiveRole(this);
        clearNavPendingWhenActiveRoleExists();
        return res;
      };
    }

    const originalAnswer = proto.answer;
    if (typeof originalAnswer === "function") {
      proto.answer = async function patchedAnswer(eventId, choiceId) {
        const pending = typeof this.getPendingEvent === "function" ? this.getPendingEvent() : null;
        const pendingEvent = pending?.event ? { ...pending.event } : null;
        const res = await originalAnswer.call(this, eventId, choiceId);
        if (res?.ok && pendingEvent) {
          registerAnsweredMail(pendingEvent);
          syncMailPlanProgressFromMailSystem();
          await ensureMailSystemForActiveRole(this);
        }
        return res;
      };
    }

    proto.__activeRoleStateSyncPatched = true;
    return true;
  }

  async function boot() {
    syncActiveRoleState();
    syncMailPlanProgressFromMailSystem();
    await ensureMailSystemForActiveRole();
    clearNavPendingWhenActiveRoleExists();
    patchEngine();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
  window.addEventListener("updateProfile", () => {
    syncActiveRoleState();
    syncMailPlanProgressFromMailSystem();
  });

  window.CivicationActiveRoleStateSync = {
    syncActiveRoleState,
    syncMailPlanProgressFromMailSystem,
    ensureMailSystemForActiveRole,
    registerAnsweredMail,
    clearNavPendingWhenActiveRoleExists,
    patchEngine
  };
})();
