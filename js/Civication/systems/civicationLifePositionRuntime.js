(function initCivicationLifePositionRuntime(globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);
  const LS_KEY = "hg_civi_life_positions_v1";

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function getState() {
    const raw = safeParse(localStorage.getItem(LS_KEY), {});
    return {
      primary: raw?.primary && typeof raw.primary === "object" ? raw.primary : null,
      active_by_badge: raw?.active_by_badge && typeof raw.active_by_badge === "object"
        ? raw.active_by_badge
        : {},
      history: Array.isArray(raw?.history) ? raw.history : []
    };
  }

  function setState(next) {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    try { window.dispatchEvent(new Event("civi:lifePositionChanged")); } catch {}
    return next;
  }

  function getBadge(badgeId) {
    const id = String(badgeId || "").trim();
    if (!id || !Array.isArray(window.BADGES)) return null;
    return window.BADGES.find((badge) => String(badge?.id || "").trim() === id) || null;
  }

  function getBadgePoints(badgeId) {
    const merits = safeParse(localStorage.getItem("merits_by_category"), {});
    return Number(merits?.[String(badgeId || "").trim()]?.points || 0);
  }

  function getUnlockedPositions(badgeId) {
    const badge = getBadge(badgeId);
    if (!badge || !Array.isArray(badge.tiers)) return [];
    const points = getBadgePoints(badgeId);
    return badge.tiers
      .filter((tier) => tier?.life_position && Number(tier?.threshold) <= points)
      .map((tier) => ({
        badge_id: String(badge.id),
        badge_name: String(badge.name || badge.id),
        label: String(tier.label || ""),
        threshold: Number(tier.threshold),
        kind: String(tier.life_position?.kind || "life_position"),
        employment_independent: tier.life_position?.employment_independent !== false
      }));
  }

  function getAllUnlockedPositions() {
    if (!Array.isArray(window.BADGES)) return [];
    return window.BADGES.flatMap((badge) => getUnlockedPositions(badge?.id));
  }

  function findUnlockedPosition(badgeId, label) {
    const wanted = String(label || "").trim();
    return getUnlockedPositions(badgeId).find((position) => position.label === wanted) || null;
  }

  function activate(badgeId, label, options) {
    const position = findUnlockedPosition(badgeId, label);
    if (!position) return { ok: false, reason: "life_position_locked" };

    const opts = options && typeof options === "object" ? options : {};
    const current = getState();
    const activated = {
      ...position,
      activated_at: new Date().toISOString()
    };
    const activeByBadge = {
      ...current.active_by_badge,
      [position.badge_id]: activated
    };
    const primary = opts.primary === false ? current.primary : activated;
    const history = [{
      type: "activated",
      badge_id: position.badge_id,
      label: position.label,
      at: activated.activated_at
    }].concat(current.history).slice(0, 100);

    setState({ primary, active_by_badge: activeByBadge, history });
    return { ok: true, position: activated };
  }

  function clearBadge(badgeId) {
    const id = String(badgeId || "").trim();
    const current = getState();
    if (!id || !current.active_by_badge[id]) return current;
    const nextByBadge = { ...current.active_by_badge };
    delete nextByBadge[id];
    const primary = current.primary?.badge_id === id ? null : current.primary;
    return setState({ ...current, primary, active_by_badge: nextByBadge });
  }

  function setPrimary(badgeId) {
    const id = String(badgeId || "").trim();
    const current = getState();
    const position = current.active_by_badge[id] || null;
    if (!position) return { ok: false, reason: "life_position_not_active" };
    setState({ ...current, primary: position });
    return { ok: true, position };
  }

  function getFormalEmploymentStatus() {
    const job = window.CivicationState?.getActivePosition?.() || null;
    return {
      status: job?.career_id ? "employed" : "unemployed",
      active_job: job
    };
  }

  function getLifeContext() {
    const state = getState();
    return {
      employment: getFormalEmploymentStatus(),
      primary_life_position: state.primary,
      active_life_positions: Object.values(state.active_by_badge),
      unlocked_life_positions: getAllUnlockedPositions()
    };
  }

  window.CivicationLifePositions = {
    getState,
    getUnlockedPositions,
    getAllUnlockedPositions,
    activate,
    clearBadge,
    setPrimary,
    getFormalEmploymentStatus,
    getLifeContext
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = window.CivicationLifePositions;
  }
})(typeof window !== "undefined" ? window : globalThis);
