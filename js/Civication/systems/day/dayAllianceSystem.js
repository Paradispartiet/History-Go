(function () {
  "use strict";

  const LS_KEY = "hg_civi_alliances_v1";

  function normStr(v) {
    return String(v || "").trim();
  }

  function readAllianceState() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return raw && typeof raw === "object"
        ? raw
        : { allies: [], enemies: [], tensions: [], updated_at: null };
    } catch {
      return { allies: [], enemies: [], tensions: [], updated_at: null };
    }
  }

  function writeAllianceState(state) {
    const safe = {
      allies: Array.isArray(state?.allies) ? state.allies : [],
      enemies: Array.isArray(state?.enemies) ? state.enemies : [],
      tensions: Array.isArray(state?.tensions) ? state.tensions : [],
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(safe));
    return safe;
  }

  function getCharacterRows() {
    const api = window.CivicationNpcCharacterThreads;
    const state = api?.getState?.() || {};
    const chars = state?.characters && typeof state.characters === "object" ? state.characters : {};
    return Object.values(chars).filter(Boolean);
  }

  function classifyCharacter(char) {
    const trust = Number(char?.trust_score || 0);
    const appearances = Number(char?.appearances || 0);
    const status = normStr(char?.status || "ustabil");

    if ((status === "alliert" || trust >= 3) && appearances >= 2) return "ally";
    if ((status === "motspiller" || trust <= -3) && appearances >= 2) return "enemy";
    if (appearances >= 2 || Math.abs(trust) >= 2) return "tension";
    return "neutral";
  }

  function buildAllianceState() {
    const rows = getCharacterRows();

    const allies = [];
    const enemies = [];
    const tensions = [];

    rows.forEach((char) => {
      const kind = classifyCharacter(char);
      const item = {
        id: normStr(char?.id),
        name: normStr(char?.name || char?.id),
        trust_score: Number(char?.trust_score || 0),
        appearances: Number(char?.appearances || 0),
        status: normStr(char?.status || "ustabil"),
        focus_families: Array.isArray(char?.focus_families) ? char.focus_families.map(normStr).filter(Boolean) : []
      };

      if (!item.id) return;
      if (kind === "ally") allies.push(item);
      if (kind === "enemy") enemies.push(item);
      if (kind === "tension") tensions.push(item);
    });

    allies.sort((a, b) => Number(b.trust_score || 0) - Number(a.trust_score || 0));
    enemies.sort((a, b) => Number(a.trust_score || 0) - Number(b.trust_score || 0));
    tensions.sort((a, b) => Math.abs(Number(b.trust_score || 0)) - Math.abs(Number(a.trust_score || 0)));

    return writeAllianceState({
      allies: allies.slice(0, 5),
      enemies: enemies.slice(0, 5),
      tensions: tensions.slice(0, 5)
    });
  }

  function getState() {
    return readAllianceState();
  }

  function getAllies() {
    return readAllianceState().allies || [];
  }

  function getEnemies() {
    return readAllianceState().enemies || [];
  }

  function getTensions() {
    return readAllianceState().tensions || [];
  }

  function getRelationForCharacter(characterId) {
    const id = normStr(characterId);
    const state = readAllianceState();
    if ((state.allies || []).some((x) => normStr(x.id) === id)) return "ally";
    if ((state.enemies || []).some((x) => normStr(x.id) === id)) return "enemy";
    if ((state.tensions || []).some((x) => normStr(x.id) === id)) return "tension";
    return "neutral";
  }

  function register() {
    buildAllianceState();
    window.addEventListener("updateProfile", buildAllianceState);
    window.addEventListener("civi:npcReaction", function () {
      window.setTimeout(buildAllianceState, 0);
    });
  }

  window.CivicationAllianceSystem = {
    rebuild: buildAllianceState,
    getState,
    getAllies,
    getEnemies,
    getTensions,
    getRelationForCharacter
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
})();
