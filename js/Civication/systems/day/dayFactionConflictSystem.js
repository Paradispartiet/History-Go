(function () {
  "use strict";

  const LS_KEY = "hg_civi_faction_conflicts_v1";

  const FACTIONS = {
    industri: {
      id: "industri",
      label: "Industri / bygging",
      families: [
        "mellomleder_planlegging",
        "driftskrise",
        "mellomleder_mastery",
        "industri_og_systembygging",
        "teknologi_og_risiko",
        "kvalitet_og_standarder",
        "modernisering_og_marked",
        "handel_og_lokal_produksjon"
      ],
      tags: ["produksjon", "industri", "organisering", "kvalitet", "teknologi", "standard", "marked"]
    },
    kontroll: {
      id: "kontroll",
      label: "Kontroll / rapportering",
      families: [
        "rapportering_og_styring",
        "administrasjon_og_hverdagsmakt",
        "krysspress",
        "mellomleder_mastery"
      ],
      tags: ["rapportering", "styring", "måling", "okonomisk_styring", "institusjonell_styring", "administrasjon"]
    },
    institusjon: {
      id: "institusjon",
      label: "Institusjon / tillit",
      families: [
        "institusjonell_krise",
        "bedrift_og_symbolsk_kapital",
        "mellomleder_identitet",
        "krysspress",
        "rapportering_og_styring"
      ],
      tags: ["institusjon", "institusjonell_tillit", "sentralbank", "kriseledelse", "administrasjon", "symbolsk_kapital"]
    },
    menneske: {
      id: "menneske",
      label: "Mennesker / bæreevne",
      families: [
        "mellomleder_identitet",
        "administrasjon_og_hverdagsmakt",
        "institusjonell_krise",
        "kvalitet_og_standarder"
      ],
      tags: ["bæreevne", "teamrytme", "tillit", "faglig_integritet", "mennesker", "folk"]
    }
  };

  function normStr(v) {
    return String(v || "").trim();
  }

  function listify(arr) {
    return Array.isArray(arr) ? arr.map(normStr).filter(Boolean) : [];
  }

  function readState() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return raw && typeof raw === "object"
        ? raw
        : { factions: {}, conflicts: [], dominant_conflict: null, updated_at: null };
    } catch {
      return { factions: {}, conflicts: [], dominant_conflict: null, updated_at: null };
    }
  }

  function writeState(state) {
    const safe = {
      factions: state?.factions && typeof state.factions === "object" ? state.factions : {},
      conflicts: Array.isArray(state?.conflicts) ? state.conflicts : [],
      dominant_conflict: state?.dominant_conflict || null,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(safe));
    return safe;
  }

  function getAllianceState() {
    const api = window.CivicationAllianceSystem;
    if (!api || typeof api.getState !== "function") return { allies: [], enemies: [], tensions: [] };
    const state = api.getState() || {};
    return {
      allies: Array.isArray(state.allies) ? state.allies : [],
      enemies: Array.isArray(state.enemies) ? state.enemies : [],
      tensions: Array.isArray(state.tensions) ? state.tensions : []
    };
  }

  function classifyFaction(row) {
    const focus = listify(row?.focus_families);
    const text = `${normStr(row?.id)} ${normStr(row?.name)} ${focus.join(" ")}`.toLowerCase();

    let best = null;
    Object.values(FACTIONS).forEach((faction) => {
      let score = 0;
      faction.families.forEach((family) => {
        if (focus.includes(family)) score += 5;
        if (text.includes(family)) score += 2;
      });
      faction.tags.forEach((tag) => {
        if (text.includes(tag)) score += 3;
      });
      if (!best || score > best.score) best = { faction, score };
    });

    return best && best.score > 0 ? best.faction.id : "institusjon";
  }

  function addFactionWeight(factions, factionId, row, relationKind) {
    const id = normStr(factionId || "institusjon");
    const faction = FACTIONS[id] || FACTIONS.institusjon;
    if (!factions[id]) {
      factions[id] = {
        id,
        label: faction.label,
        ally_weight: 0,
        enemy_weight: 0,
        tension_weight: 0,
        members: []
      };
    }

    const trust = Number(row?.trust_score || 0);
    const appearances = Number(row?.appearances || 0);
    const weight = Math.max(1, Math.abs(trust)) + Math.max(0, appearances - 1);

    if (relationKind === "ally") factions[id].ally_weight += weight;
    if (relationKind === "enemy") factions[id].enemy_weight += weight;
    if (relationKind === "tension") factions[id].tension_weight += Math.max(1, Math.round(weight / 2));

    factions[id].members.push({
      id: normStr(row?.id),
      name: normStr(row?.name || row?.id),
      relation: relationKind,
      trust_score: trust,
      appearances
    });
  }

  function buildConflicts(factions) {
    const rows = Object.values(factions);
    const conflicts = [];

    for (let i = 0; i < rows.length; i += 1) {
      for (let j = i + 1; j < rows.length; j += 1) {
        const a = rows[i];
        const b = rows[j];
        const pressure =
          Math.abs(Number(a.ally_weight || 0) - Number(b.ally_weight || 0)) +
          Math.abs(Number(a.enemy_weight || 0) - Number(b.enemy_weight || 0)) +
          Number(a.tension_weight || 0) +
          Number(b.tension_weight || 0);

        if (pressure < 3) continue;

        conflicts.push({
          id: `${a.id}_vs_${b.id}`,
          a: a.id,
          b: b.id,
          label: `${a.label} vs ${b.label}`,
          pressure,
          families: Array.from(new Set([...(FACTIONS[a.id]?.families || []), ...(FACTIONS[b.id]?.families || [])]))
        });
      }
    }

    return conflicts.sort((a, b) => Number(b.pressure || 0) - Number(a.pressure || 0)).slice(0, 5);
  }

  function rebuild() {
    const alliance = getAllianceState();
    const factions = {};

    alliance.allies.forEach((row) => addFactionWeight(factions, classifyFaction(row), row, "ally"));
    alliance.enemies.forEach((row) => addFactionWeight(factions, classifyFaction(row), row, "enemy"));
    alliance.tensions.forEach((row) => addFactionWeight(factions, classifyFaction(row), row, "tension"));

    const conflicts = buildConflicts(factions);

    return writeState({
      factions,
      conflicts,
      dominant_conflict: conflicts[0] || null
    });
  }

  function getState() {
    return readState();
  }

  function getDominantConflict() {
    return readState().dominant_conflict || null;
  }

  function getPressureForFamily(family) {
    const f = normStr(family);
    if (!f) return 0;
    const state = readState();
    return (state.conflicts || []).reduce((sum, conflict) => {
      return sum + (listify(conflict?.families).includes(f) ? Number(conflict?.pressure || 0) : 0);
    }, 0);
  }

  function register() {
    rebuild();
    window.addEventListener("updateProfile", rebuild);
    window.addEventListener("civi:npcReaction", function () {
      window.setTimeout(rebuild, 0);
    });
  }

  window.CivicationFactionConflictSystem = {
    rebuild,
    getState,
    getDominantConflict,
    getPressureForFamily,
    FACTIONS
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
})();
