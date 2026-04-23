(function () {
  "use strict";

  const LS_KEY = "hg_civi_npc_character_threads_v1";

  function normStr(v) {
    return String(v || "").trim();
  }

  function readState() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return raw && typeof raw === "object"
        ? raw
        : { characters: {}, active_ids: [], updated_at: null };
    } catch {
      return { characters: {}, active_ids: [], updated_at: null };
    }
  }

  function writeState(state) {
    const safe = {
      characters: state?.characters && typeof state.characters === "object" ? state.characters : {},
      active_ids: Array.isArray(state?.active_ids) ? state.active_ids : [],
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(safe));
    return safe;
  }

  function getLatestReaction() {
    const api = window.CivicationNpcReactions;
    if (!api || typeof api.getLatest !== "function") return null;
    const latest = api.getLatest(1);
    return Array.isArray(latest) ? latest[0] || null : null;
  }

  function inferFocusFamilies(reaction) {
    const txt = `${normStr(reaction?.title)} ${normStr(reaction?.line)}`.toLowerCase();
    const out = [];

    if (txt.includes("slitasje") || txt.includes("bæreevne") || txt.includes("folk")) {
      out.push("sliten_nokkelperson");
    }
    if (txt.includes("mål") || txt.includes("målingen") || txt.includes("systemet")) {
      out.push("krysspress");
    }
    if (txt.includes("plan") || txt.includes("rammen") || txt.includes("virkeligheten")) {
      out.push("mellomleder_planlegging");
    }
    if (txt.includes("styring") || txt.includes("rattet") || txt.includes("kontroll")) {
      out.push("driftskrise", "mellomleder_mastery");
    }
    if (txt.includes("troverdig") || txt.includes("rollen") || txt.includes("avstanden")) {
      out.push("mellomleder_identitet");
    }

    return Array.from(new Set(out));
  }

  function inferThreadType(reaction) {
    const trust = Number(reaction?.trustDelta || 0);
    if (trust >= 2) return "alliert";
    if (trust <= -2) return "motspiller";
    return "ustabil";
  }

  function updateCharacterThreadFromReaction(reaction) {
    if (!reaction?.personId && !reaction?.personName) return null;

    const state = readState();
    const id = normStr(reaction.personId || reaction.personName);
    const existing = state.characters[id] || {
      id,
      name: normStr(reaction.personName || "Person"),
      role: normStr(reaction.personType || "person"),
      appearances: 0,
      trust_score: 0,
      status: "ustabil",
      focus_families: [],
      beats: [],
      latest_title: "",
      latest_line: "",
      active: false
    };

    const trustScore = Number(existing.trust_score || 0) + Number(reaction.trustDelta || 0);
    const appearances = Number(existing.appearances || 0) + 1;
    const focusFamilies = Array.from(new Set([...(existing.focus_families || []), ...inferFocusFamilies(reaction)])).slice(-6);

    let status = existing.status || "ustabil";
    if (appearances >= 2 || Math.abs(trustScore) >= 2) {
      status = inferThreadType(reaction);
    }

    const nextChar = {
      ...existing,
      name: normStr(reaction.personName || existing.name),
      role: normStr(reaction.personType || existing.role),
      appearances,
      trust_score: trustScore,
      status,
      focus_families: focusFamilies,
      beats: (existing.beats || []).concat([
        {
          at: new Date().toISOString(),
          subject: normStr(reaction.subject),
          title: normStr(reaction.title),
          line: normStr(reaction.line),
          trust_delta: Number(reaction.trustDelta || 0)
        }
      ]).slice(-8),
      latest_title: normStr(reaction.title),
      latest_line: normStr(reaction.line),
      active: appearances >= 2 || Math.abs(trustScore) >= 2
    };

    state.characters[id] = nextChar;
    state.active_ids = Object.values(state.characters)
      .filter((c) => c && c.active)
      .sort((a, b) => Math.abs(Number(b.trust_score || 0)) - Math.abs(Number(a.trust_score || 0)))
      .slice(0, 4)
      .map((c) => c.id);

    writeState(state);
    window.dispatchEvent(new Event("updateProfile"));
    return nextChar;
  }

  function getActiveCharacters() {
    const state = readState();
    return (state.active_ids || []).map((id) => state.characters[id]).filter(Boolean);
  }

  function patchReactionEvent() {
    if (window.__civiNpcCharacterThreadPatched) return;
    window.__civiNpcCharacterThreadPatched = true;

    window.addEventListener("civi:npcReaction", function (ev) {
      const reaction = ev?.detail || getLatestReaction();
      if (!reaction) return;
      try {
        updateCharacterThreadFromReaction(reaction);
      } catch (err) {
        console.warn("[npcCharacterThreads] failed", err);
      }
    });
  }

  window.CivicationNpcCharacterThreads = {
    getState: readState,
    getActiveCharacters,
    updateCharacterThreadFromReaction
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchReactionEvent, { once: true });
  } else {
    patchReactionEvent();
  }
})();
