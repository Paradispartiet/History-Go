(function initCivicationLifePositionRuntime(globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);
  const LS_KEY = "hg_civi_life_positions_v1";
  const CATALOG_PATH = "data/Civication/lifePositionCatalog.json";
  let catalogPromise = null;

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

  async function ensureCatalogLoaded() {
    if (Array.isArray(window.CIVI_LIFE_POSITION_CATALOG?.badges)) {
      return window.CIVI_LIFE_POSITION_CATALOG;
    }
    if (catalogPromise) return catalogPromise;
    if (typeof fetch !== "function") return null;

    catalogPromise = fetch(CATALOG_PATH, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !Array.isArray(json.badges)) {
          throw new Error("catalog badges must be an array");
        }
        window.CIVI_LIFE_POSITION_CATALOG = json;
        try { window.dispatchEvent(new Event("civi:lifePositionCatalogLoaded")); } catch {}
        try { window.dispatchEvent(new Event("updateProfile")); } catch {}
        return json;
      })
      .catch((error) => {
        console.warn("[CivicationLifePositions] life position catalog kunne ikke lastes", error);
        return null;
      });

    return catalogPromise;
  }

  function getBadge(badgeId) {
    const id = String(badgeId || "").trim();
    if (!id || !Array.isArray(window.BADGES)) return null;
    return window.BADGES.find((badge) => String(badge?.id || "").trim() === id) || null;
  }

  function getBadgeProfile(badgeId) {
    const id = String(badgeId || "").trim();
    const profiles = Array.isArray(window.CIVI_LIFE_POSITION_CATALOG?.badges)
      ? window.CIVI_LIFE_POSITION_CATALOG.badges
      : [];
    return profiles.find((profile) => String(profile?.badge_id || "").trim() === id) || null;
  }

  function getBadgePoints(badgeId) {
    const merits = safeParse(localStorage.getItem("merits_by_category"), {});
    return Number(merits?.[String(badgeId || "").trim()]?.points || 0);
  }

  function toTierPosition(badge, tier, descriptor) {
    const data = descriptor && typeof descriptor === "object" ? descriptor : {};
    return {
      badge_id: String(badge.id),
      badge_name: String(badge.name || badge.id),
      id: String(data.id || "").trim() || null,
      label: String(data.label || tier.label || ""),
      threshold: Number(tier.threshold),
      kind: String(data.kind || "life_position"),
      description: String(data.description || "").trim() || null,
      hooks: Array.isArray(data.hooks) ? data.hooks.map(String).filter(Boolean) : [],
      employment_independent: data.employment_independent !== false,
      source: "badge_tier"
    };
  }

  function getTierPositions(badgeId, points) {
    const badge = getBadge(badgeId);
    if (!badge || !Array.isArray(badge.tiers)) return [];

    return badge.tiers.flatMap((tier) => {
      if (Number(tier?.threshold) > points) return [];
      const descriptors = [];
      if (tier?.life_position && typeof tier.life_position === "object") {
        descriptors.push({ ...tier.life_position, label: tier.label });
      }
      if (Array.isArray(tier?.life_positions)) {
        descriptors.push(...tier.life_positions.filter((entry) => entry && typeof entry === "object"));
      }
      return descriptors.map((descriptor) => toTierPosition(badge, tier, descriptor));
    });
  }

  function getCatalogPositions(badgeId, points) {
    const badge = getBadge(badgeId);
    const profile = getBadgeProfile(badgeId);
    if (!badge || !profile || !Array.isArray(profile.positions)) return [];

    return profile.positions
      .filter((position) => Number(position?.threshold) <= points)
      .map((position) => ({
        badge_id: String(badge.id),
        badge_name: String(badge.name || badge.id),
        id: String(position?.id || "").trim() || null,
        label: String(position?.label || ""),
        threshold: Number(position?.threshold),
        kind: String(position?.kind || "life_position"),
        description: String(position?.description || "").trim() || null,
        hooks: Array.isArray(position?.hooks) ? position.hooks.map(String).filter(Boolean) : [],
        employment_independent: position?.employment_independent !== false,
        source: "catalog"
      }));
  }

  function dedupePositions(positions) {
    const seen = new Set();
    return positions.filter((position) => {
      const key = `${position.badge_id}::${position.label}`;
      if (!position.label || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getUnlockedPositions(badgeId) {
    const badge = getBadge(badgeId);
    if (!badge || !Array.isArray(badge.tiers)) return [];
    const points = getBadgePoints(badgeId);
    return dedupePositions([
      ...getTierPositions(badgeId, points),
      ...getCatalogPositions(badgeId, points)
    ]).sort((a, b) => a.threshold - b.threshold || a.label.localeCompare(b.label, "nb"));
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
    ensureCatalogLoaded,
    getBadgeProfile,
    getUnlockedPositions,
    getAllUnlockedPositions,
    activate,
    clearBadge,
    setPrimary,
    getFormalEmploymentStatus,
    getLifeContext
  };

  ensureCatalogLoaded();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = window.CivicationLifePositions;
  }
})(typeof window !== "undefined" ? window : globalThis);
