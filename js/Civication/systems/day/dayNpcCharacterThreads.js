// js/Civication/systems/day/dayNpcCharacterThreads.js
// CivicationNpcCharacterThreads — eier tilbakevendende NPC-karaktertråder i
// hg_civi_npc_character_threads_v1. Reagerer på civi:npcReaction og holder tråd-historikk.
(function () {
  "use strict";

  const LS_KEY = "hg_civi_npc_character_threads_v1";
  // Serialize asynchronous role changes for each NPC. No separate save key.
  const roleChangeQueue = new Map();

  function normStr(v) {
    return String(v || "").trim();
  }

  function normalizeState(raw) {
    const src = raw && typeof raw === "object" ? raw : {};
    return {
      characters: src.characters && typeof src.characters === "object" ? src.characters : {},
      active_ids: Array.isArray(src.active_ids) ? src.active_ids.map(normStr).filter(Boolean) : [],
      updated_at: src.updated_at || null
    };
  }

  function readState() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return normalizeState(raw);
    } catch {
      return normalizeState({});
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

  // Read-only role chronology for an explicitly catalog-mapped fictional NPC.
  // Other Life Story characters remain untouched; no name-based matching.
  function getRoleHistory(npcId) {
    const id = normStr(npcId);
    const npc = window.CivicationNPCs?.lookup?.(id);
    if (!id || !npc?.role_ref) return [];
    const record = readState().characters[id];
    const history = record && Array.isArray(record.role_history) ? record.role_history : [];
    return history.map((event) => ({
      event_id: normStr(event?.event_id),
      from: normStr(event?.from),
      to: normStr(event?.to)
    }));
  }

  // Explicit SOLO narrative role change. Only this existing character-thread
  // owner writes role_history; it never writes employment, pay or relationships.
  // No role is inferred from an NPC's display title. Event IDs are idempotent.
  async function recordRoleTransition(npcId, nextRef, eventId) {
    const id = normStr(npcId);
    const event = normStr(eventId);
    if (!id || !event) throw new TypeError("Role transition requires NPC ID and event ID");

    const previous = roleChangeQueue.get(id) || Promise.resolve();
    const pending = previous.catch(() => null).then(async () => {
      const catalogApi = window.CivicationNPCs;
      if (!catalogApi?.load || typeof catalogApi.previewRoleTransition !== "function") return null;
      await catalogApi.load();
      const npc = catalogApi.lookup(id);
      if (!npc?.role_ref) return null;

      const actor = await catalogApi.previewRoleTransition(id, nextRef, event);
      if (!actor) return null;

      const state = readState();
      const existing = state.characters[id] || {
        id,
        name: normStr(npc.name),
        role: normStr(npc.title),
        appearances: 0,
        trust_score: 0,
        status: "ustabil",
        focus_families: [],
        beats: [],
        latest_title: "",
        latest_line: "",
        active: false
      };
      // Do not change name, social history, trust or role of existing scenes.
      state.characters[id] = {
        ...existing,
        actor_id: actor.actor_id,
        role_ref: {
          category: actor.role_ref.category,
          role_scope: actor.role_ref.role_scope
        },
        role_history: actor.role_history.map((item) => ({
          event_id: item.event_id, from: item.from, to: item.to
        }))
      };
      writeState(state);
      return actor;
    });
    roleChangeQueue.set(id, pending);
    try {
      return await pending;
    } finally {
      if (roleChangeQueue.get(id) === pending) roleChangeQueue.delete(id);
    }
  }

  function patchReactionEvent() {
    if (window.__civiNpcCharacterThreadPatched) return;
    window.__civiNpcCharacterThreadPatched = true;

    window.addEventListener("civi:npcReaction", function (ev) {
      const reaction = /** @type {CustomEvent} */ (ev).detail || getLatestReaction();
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
    updateCharacterThreadFromReaction,
    getRoleHistory,
    recordRoleTransition
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchReactionEvent, { once: true });
  } else {
    patchReactionEvent();
  }
})();
