(function () {
  "use strict";

  const LS_KEY = "hg_civi_people_v1";
  let peopleMapCache = null;
  const rolePeopleCache = new Map();

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

  async function loadRolePeopleBase(active) {
    const careerId = String(active?.career_id || "").trim();
    const roleScope = normalizeRoleScope(active);
    if (!careerId || !roleScope) return [];

    const cacheKey = `${careerId}:${roleScope}`;
    if (rolePeopleCache.has(cacheKey)) {
      return rolePeopleCache.get(cacheKey) || [];
    }

    const path = `data/Civication/people/${careerId}/${roleScope}_people_base.json`;

    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) {
        rolePeopleCache.set(cacheKey, []);
        return [];
      }
      const json = await res.json();
      const people = Array.isArray(json?.people) ? json.people : [];
      rolePeopleCache.set(cacheKey, people);
      return people;
    } catch {
      rolePeopleCache.set(cacheKey, []);
      return [];
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

  function matchesRoleBase(entry, active) {
    const careerId = String(active?.career_id || "").trim();
    const roleScope = normalizeRoleScope(active);
    const categories = [String(entry?.category || "").trim()].filter(Boolean);
    const scopes = Array.isArray(entry?.role_scopes) ? entry.role_scopes.map(String) : [];

    if (categories.length && !categories.includes(careerId)) return false;
    if (scopes.length && roleScope && !scopes.includes(roleScope)) return false;
    return true;
  }

  function scoreEntry(entry, active, identity, peopleAccess, leisureAccess, workAccess) {
    let score = 0;

    const careerId = String(active?.career_id || "").trim();
    const roleScope = normalizeRoleScope(active);

    const preferredRoles = Array.isArray(entry?.preferred_roles)
      ? entry.preferred_roles.map(String)
      : [];

    const roleScopes = Array.isArray(entry?.role_scopes)
      ? entry.role_scopes.map(String)
      : [];

    if (careerId && preferredRoles.includes(careerId)) score += 4;
    if (roleScope && roleScopes.includes(roleScope)) score += 6;
    if (String(entry?.category || "").trim() === careerId) score += 5;

    const socialStyle = String(entry?.social_style || "").trim();
    if (socialStyle && String(identity?.dominant || "") === socialStyle) score += 3;

    const required = Array.isArray(entry?.required_people_access)
      ? entry.required_people_access.map(String)
      : [];
    required.forEach((id) => {
      if ((peopleAccess || []).includes(id)) score += 2;
    });

    if (Array.isArray(entry?.badge_scope) && entry.badge_scope.length) {
      score += 2;
    }

    if (String(entry?.character_potential || "") === "high") score += 3;
    if (String(entry?.character_potential || "") === "medium") score += 1;

    if (socialStyle === "social" && (leisureAccess || []).length) score += 1;
    if ((socialStyle === "economic" || socialStyle === "political" || socialStyle === "institutional") && (workAccess || []).length) score += 1;
    if ((socialStyle === "cultural" || socialStyle === "subculture") && (leisureAccess || []).length) score += 1;

    return score;
  }

  function shapeEntry(entry, score, source) {
    return {
      id: entry.id,
      type: entry.type || "person",
      name: entry.name,
      description: entry.description || "",
      social_style: entry.social_style,
      score,
      preferred_roles: entry.preferred_roles,
      required_people_access: entry.required_people_access,
      role_scopes: entry.role_scopes,
      badge_scope: entry.badge_scope,
      knowledge_tags: entry.knowledge_tags,
      teaches: entry.teaches,
      character_potential: entry.character_potential,
      character_roles: entry.character_roles,
      event_affinity: entry.event_affinity,
      source
    };
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

    const mapEntries = await loadPeopleMap();
    const roleEntries = await loadRolePeopleBase(active);
    const peopleAccess = getPeopleAccess();
    const leisureAccess = getLeisureAccess();
    const workAccess = getWorkAccess();
    const identity = getIdentityProfile();

    const scoredRoleEntries = roleEntries
      .filter((entry) => matchesRoleBase(entry, active))
      .map((entry) => ({
        entry,
        source: "role_base",
        score: scoreEntry(entry, active, identity, peopleAccess, leisureAccess, workAccess) + 10
      }));

    const roleIds = new Set(scoredRoleEntries.map((row) => String(row.entry?.id || "").trim()).filter(Boolean));

    const scoredMapEntries = mapEntries
      .filter((entry) => matchesAccess(entry, peopleAccess))
      .filter((entry) => !roleIds.has(String(entry?.id || "").trim()))
      .map((entry) => ({
        entry,
        source: "access_map",
        score: scoreEntry(entry, active, identity, peopleAccess, leisureAccess, workAccess)
      }));

    const scored = [...scoredRoleEntries, ...scoredMapEntries]
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, 8)
      .map(({ entry, source, score }) => shapeEntry(entry, score, source));

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
