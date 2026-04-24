(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function applyCharacterReply(ctx) {
    const choice = ctx?.choice;
    if (!choice || !choice.character_reply) return;

    const charId = normStr(choice.character_id);
    if (!charId) return;

    const effect = Number(choice.effect || 0);
    const trustDelta = effect >= 1 ? 1 : -1;

    const api = window.CivicationNpcCharacterThreads;
    if (!api || typeof api.getState !== "function") return;

    const state = api.getState();
    const char = state.characters?.[charId];
    if (!char) return;

    char.trust_score = Number(char.trust_score || 0) + trustDelta;
    char.appearances = Number(char.appearances || 0) + 1;

    if (Math.abs(char.trust_score) >= 3) {
      char.status = char.trust_score > 0 ? "alliert" : "motspiller";
    }

    localStorage.setItem("hg_civi_npc_character_threads_v1", JSON.stringify(state));

    window.dispatchEvent(new Event("updateProfile"));
  }

  function register() {
    const dir = window.CivicationChoiceDirector;
    if (!dir || typeof dir.registerHandler !== "function") return;

    dir.registerHandler("character_reply_consequence", applyCharacterReply, 15);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
})();
