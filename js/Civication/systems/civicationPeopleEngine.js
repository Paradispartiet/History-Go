(function () {
  "use strict";

  const LS_KEY = "hg_civi_people_v1";
  let peopleMapCache = null;

  async function loadPeopleMap() {
    if (Array.isArray(peopleMapCache)) return peopleMapCache;

    try {
      const res = await fetch("data/Civication/people_access_map.json", { cache: "no-store" });
      if (!res.ok) {
        peopleMapCache = [];
        return peopleMapCache;
      }
      const json = await res.json();
      peopleMapCache = Array.isArray(json?.people) ? json.people : [];
      return peopleMapCache;
    } catch {
      peopleMapCache = [];
      return peopleMapCache;
    }
  }

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return parsed && typeof parsed === "object"
        ? parsed
        : {
            updated_at: null,
            role_scope: null,
            career_id: null,
            available_people: []
          };
    } catch {
      return {
        updated_at: null,
        role_scope: null,
        career_id: null,
        available_people: []
      };
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
    return state;
  }

  function normalizeRoleScope(active) {
    const raw = String(
      active?.role_scope || active?.role_key || active?.title || ""
    )
      .trim()
      .toLowerCase();

    if (!raw) return null;

    return raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function getIdentityProfile() {
    return window.HG_IdentityCore?.getProfile?.() || { dominant: null, focus: {} };
  }

  function getPeopleAccess() {
    const bridge = window.CivicationPlaceAccessBridge;
    return bridge?.getBucket ? bridge.getBucket("people") : [];
  }

  function getLeisureAccess() {
    const bridge = window.CivicationPlaceAccessBridge;
    return bridge?.getBucket ? bridge.getBucket("leisure") : [];
  }

  function getWorkAccess() {
    const bridge = window.CivicationPlaceAccessBridge;
    return bridge?.getBucket ? bridge.getBucket("work") : [];
  }

  function matchesAccess(entry, peopleAccess) {
    const required = Array.isArray(entry?.required_people_access)
      ? entry.required_people_access.map(String)
      : [];

    if (!required.length) return true;

    const accessSet = new Set((peopleAccess || []).map(String));
    return required.some((id) => accessSet.has(id));
  }

  function scoreEntry(entry, active, identity, peopleAccess, leisureAccess, workAccess) {
    let score = 0;

    const careerId = String(active?.career_id || "").trim();
    const preferredRoles = Array.isArray(entry?.preferred_roles)
      ? entry.preferred_roles.map(String)
      : [];

    if (careerId && preferredRoles.includes(careerId)) score += 4;

    const socialStyle = String(entry?.social_style || "").trim();
    if (socialStyle && String(identity?.dominant || "") === socialStyle) score += 3;

    const required = Array.isArray(entry?.required_people_access)
      ? entry.required_people_access.map(String)
      : [];
    required.forEach((id) => {
      if ((peopleAccess || []).includes(id)) score += 2;
    });

    if (socialStyle === "social" && (leisureAccess || []).length) score += 1;
    if ((socialStyle === "economic" || socialStyle === "political") && (workAccess || []).length) score += 1;
    if ((socialStyle === "cultural" || socialStyle === "subculture") && (leisureAccess || []).length) score += 1;

    return score;
  }

  async function rebuildPeopleState(activeArg) {
    const active = activeArg || window.CivicationState?.getActivePosition?.() || null;
    if (!active) {
      return writeState({
        updated_at: new Date().toISOString(),
        role_scope: null,
        career_id: null,
        available_people: []
      });
    }

    const entries = await loadPeopleMap();
    const peopleAccess = getPeopleAccess();
    const leisureAccess = getLeisureAccess();
    const workAccess = getWorkAccess();
    const identity = getIdentityProfile();

    const scored = entries
      .filter((entry) => matchesAccess(entry, peopleAccess))
      .map((entry) => ({
        ...entry,
        score: scoreEntry(entry, active, identity, peopleAccess, leisureAccess, workAccess)
      }))
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, 8)
      .map((entry) => ({
        id: entry.id,
        type: entry.type,
        name: entry.name,
        description: entry.description,
        social_style: entry.social_style,
        score: entry.score,
        preferred_roles: entry.preferred_roles,
        required_people_access: entry.required_people_access
      }));

    return writeState({
      updated_at: new Date().toISOString(),
      role_scope: normalizeRoleScope(active),
      career_id: String(active?.career_id || "").trim(),
      available_people: scored
    });
  }

  function getPeopleState() {
    return readState();
  }

  function getAvailablePeople() {
    const state = readState();
    return Array.isArray(state?.available_people) ? state.available_people : [];
  }

  window.CivicationPeopleEngine = {
    rebuildPeopleState,
    getPeopleState,
    getAvailablePeople
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.CivicationPeopleEngine?.rebuildPeopleState?.().then(function () {
      window.dispatchEvent(new Event("updateProfile"));
    });
  });

  window.addEventListener("updateProfile", function () {
    window.CivicationPeopleEngine?.rebuildPeopleState?.();
  });
})();
