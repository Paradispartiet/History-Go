(function () {
  "use strict";

  function norm(v) {
    return String(v || "").trim();
  }

  function lower(v) {
    return norm(v).toLowerCase();
  }

  function getActiveRoleKey() {
    const active = window.CivicationState?.getActivePosition?.();
    return lower(active?.role_key || active?.title || active?.role_id);
  }

  function getInbox() {
    return window.CivicationState?.getInbox?.() || [];
  }

  function setInbox(arr) {
    window.CivicationState?.setInbox?.(Array.isArray(arr) ? arr : []);
    window.dispatchEvent(new Event("updateProfile"));
  }

  function eventLooksLikeOtherRole(ev, activeRole) {
    const id = lower(ev?.id);
    const subject = lower(ev?.subject);
    const roleMeta = lower(ev?.role_content_meta?.role_id || ev?.role_id || ev?.tier_label);

    if (!activeRole) return false;

    if (activeRole === "mellomleder") {
      if (id.startsWith("fagarbeider_") || id.startsWith("arbeider_") || id.startsWith("formann_")) return true;
      if (roleMeta && !roleMeta.includes("mellomleder") && !roleMeta.includes("naer_mellomleder")) return true;
      if (!norm(ev?.mail_type) && (subject.includes("synlig start") || id.includes("fagarbeider"))) return true;
    }

    if (activeRole === "fagarbeider") {
      if (id.startsWith("ml_") || id.startsWith("arbeider_") || id.startsWith("formann_")) return true;
      if (roleMeta && !roleMeta.includes("fagarbeider") && !roleMeta.includes("naer_fagarbeider")) return true;
    }

    if (activeRole === "arbeider") {
      if (id.startsWith("ml_") || id.startsWith("fagarbeider_") || id.startsWith("formann_")) return true;
    }

    return false;
  }

  function isLegacyUnclassifiedRoleMail(ev) {
    if (!ev) return false;
    if (norm(ev.mail_type)) return false;
    const id = lower(ev.id);
    const source = norm(ev.source);
    if (source !== "Civication") return false;
    if (id.startsWith("phase_") || id.startsWith("nav_auto_")) return false;
    return true;
  }

  function shouldClearPending(ev) {
    const activeRole = getActiveRoleKey();
    if (!activeRole || !ev) return false;
    if (eventLooksLikeOtherRole(ev, activeRole)) return true;
    if (isLegacyUnclassifiedRoleMail(ev)) return true;
    return false;
  }

  async function replaceInvalidPendingWithDirectorMail(engine) {
    const inbox = getInbox();
    const pending = Array.isArray(inbox) ? inbox.find((item) => item && item.status === "pending") : null;
    const ev = pending?.event || null;

    if (!shouldClearPending(ev)) return false;

    setInbox([]);

    if (window.CivicationMailDirectorV2 && typeof window.CivicationMailDirectorV2.enqueueNext === "function") {
      await window.CivicationMailDirectorV2.enqueueNext(engine || window.HG_CiviEngine, { force: true, allowExhaustedFallback: false });
    }

    return true;
  }

  function patchEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__mailDirectorV2RoleGuardPatched) return false;

    const originalOnAppOpen = proto.onAppOpen;
    if (typeof originalOnAppOpen === "function") {
      proto.onAppOpen = async function roleGuardedOnAppOpen(opts) {
        const res = await originalOnAppOpen.call(this, opts || {});
        await replaceInvalidPendingWithDirectorMail(this);
        return res;
      };
    }

    proto.__mailDirectorV2RoleGuardPatched = true;
    return true;
  }

  function boot() {
    patchEngine();
    replaceInvalidPendingWithDirectorMail(window.HG_CiviEngine);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:booted", boot);
  window.addEventListener("updateProfile", function () {
    replaceInvalidPendingWithDirectorMail(window.HG_CiviEngine);
  });

  window.CivicationMailDirectorV2RoleGuard = {
    boot: boot,
    patchEngine: patchEngine,
    shouldClearPending: shouldClearPending,
    replaceInvalidPendingWithDirectorMail: replaceInvalidPendingWithDirectorMail
  };
})();
