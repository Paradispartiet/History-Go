(function () {
  "use strict";

  const ROLE_FILES = {
    naer_arbeider: "data/Civication/roles/naer_arbeider.json",
    naer_fagarbeider: "data/Civication/roles/naer_fagarbeider.json",
    naer_mellomleder: "data/Civication/roles/naer_mellomleder.json"
  };

  let ROLE_CACHE = {};

  function normStr(v) {
    return String(v || "").trim();
  }

  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  async function loadRoleFile(roleId) {
    const id = normStr(roleId);
    if (!id || !ROLE_FILES[id]) return null;
    if (ROLE_CACHE[id]) return ROLE_CACHE[id];

    const res = await fetch(ROLE_FILES[id], { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Could not load role file for ${id}: ${res.status}`);
    }

    const json = await res.json();
    ROLE_CACHE[id] = json;
    return json;
  }

  function getConsumedMap(state) {
    return state?.consumed && typeof state.consumed === "object"
      ? state.consumed
      : {};
  }

  function normalizeChoices(choices) {
    return (Array.isArray(choices) ? choices : [])
      .filter(Boolean)
      .map((c) => ({
        id: normStr(c.id),
        label: normStr(c.label),
        effect: Number(c.effect || 0),
        tags: Array.isArray(c.tags) ? c.tags.map(normStr).filter(Boolean) : [],
        feedback: normStr(c.feedback)
      }))
      .filter((c) => c.id && c.label);
  }

  function toMail(roleData, storylet, active) {
    const roleId = normStr(roleData?.role_id);
    const tierLabel = normStr(roleData?.tier_label);
    const storyletId = normStr(storylet?.id);

    return {
      id: `role_${slugify(storyletId)}`,
      stage: "stable",
      source: "Civication",
      subject: normStr(storylet?.title),
      summary: normStr(storylet?.summary),
      situation:
        Array.isArray(storylet?.situation) && storylet.situation.length
          ? storylet.situation.map(normStr).filter(Boolean)
          : [normStr(storylet?.summary)].filter(Boolean),

      mail_tags: [
        "role_storylet",
        slugify(roleId),
        slugify(storylet?.family_id),
        slugify(tierLabel)
      ].filter(Boolean),

      gating: {
        require_tags: [],
        prefer_tags: [],
        avoid_tags: [],
        prefer_tracks: [],
        require_tracks: [],
        require_track_step_min: {},
        require_story_flags: [],
        avoid_story_flags: [],
        prefer_story_flags: [],
        prefer_story_tags: []
      },

      choices: normalizeChoices(storylet?.choices),

      role_content_meta: {
        role_id: roleId,
        tier_label: tierLabel,
        family_id: normStr(storylet?.family_id),
        storylet_id: storyletId,
        progress_tags: Array.isArray(storylet?.progress_tags)
          ? storylet.progress_tags.map(normStr).filter(Boolean)
          : [],
        primary_conflict: normStr(storylet?.primary_conflict || roleData?.primary_conflict),
        secondary_conflict: normStr(storylet?.secondary_conflict || roleData?.secondary_conflict),
        capital_bias: Array.isArray(storylet?.capital_bias) ? storylet.capital_bias : [],
        psyche_bias: Array.isArray(storylet?.psyche_bias) ? storylet.psyche_bias : []
      },

      role_id: roleId,
      tier_label: tierLabel,
      career_id: normStr(active?.career_id || roleData?.category || "naeringsliv")
    };
  }

  async function makeCandidateMailsForActiveRole(active, state) {
    const roleId = normStr(active?.role_id);
    if (!roleId) return [];

    const roleData = await loadRoleFile(roleId);
    if (!roleData) return [];

    const consumed = getConsumedMap(state);
    const storylets = Array.isArray(roleData?.storylets) ? roleData.storylets : [];

    return storylets
      .filter((s) => s && s.id && !consumed[s.id])
      .map((s) => toMail(roleData, s, active));
  }

  window.CiviRoleStoryletBridge = {
    loadRoleFile,
    makeCandidateMailsForActiveRole
  };
})();
