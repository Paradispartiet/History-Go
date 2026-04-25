(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
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
        clearNavPendingWhenActiveRoleExists();
        const res = await originalOnAppOpen.call(this, opts || {});
        syncActiveRoleState();
        clearNavPendingWhenActiveRoleExists();
        return res;
      };
    }

    const originalFollowup = proto.enqueueImmediateFollowupEvent;
    if (typeof originalFollowup === "function") {
      proto.enqueueImmediateFollowupEvent = async function patchedEnqueueImmediateFollowupEvent() {
        syncActiveRoleState();
        clearNavPendingWhenActiveRoleExists();
        const res = await originalFollowup.call(this);
        syncActiveRoleState();
        clearNavPendingWhenActiveRoleExists();
        return res;
      };
    }

    proto.__activeRoleStateSyncPatched = true;
    return true;
  }

  function boot() {
    syncActiveRoleState();
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
  });

  window.CivicationActiveRoleStateSync = {
    syncActiveRoleState,
    clearNavPendingWhenActiveRoleExists,
    patchEngine
  };
})();
