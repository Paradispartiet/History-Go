(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function reactionLine(faction, name) {
    if (faction === "industri") return `${name} ser på deg: "Da bygger du. Da må du også bære konsekvensene."`;
    if (faction === "kontroll") return `${name} sier rolig: "Da vet jeg at du vil ha kontroll. Da må du også tåle presset."`;
    if (faction === "institusjon") return `${name} nikker: "Du velger systemet. Da må du holde det sammen."`;
    if (faction === "menneske") return `${name} ser deg i øynene: "Da velger du folk. Ikke svikt dem."`;
    return null;
  }

  function handler(ctx) {
    if (normStr(ctx?.eventObj?.mail_type) !== "faction_choice") return;

    const faction = normStr(ctx?.choiceId);
    const chars = window.CivicationNpcCharacterThreads?.getActiveCharacters?.() || [];
    const established = chars.filter((c) => (Number(c.appearances || 0) >= 2 || Math.abs(Number(c.trust_score || 0)) >= 3)).slice(0, 2);

    const reactions = established
      .map((c) => {
        const line = reactionLine(faction, c.name);
        if (!line) return null;
        return {
          id: `faction_reaction_${Date.now()}_${normStr(c.id)}`,
          personId: normStr(c.id),
          personName: normStr(c.name || c.id),
          personType: "faction_reaction",
          subject: normStr(ctx?.eventObj?.subject),
          choiceLabel: normStr(ctx?.choice?.label),
          title: `Reaksjon på fraksjonsvalg`,
          line,
          trustDelta: 0,
          faction,
          createdAt: new Date().toISOString(),
          careerId: normStr(window.CivicationState?.getActivePosition?.()?.career_id)
        };
      })
      .filter(Boolean);

    ctx.result.faction_reactions = reactions;

    reactions.forEach((reaction) => {
      window.dispatchEvent(new CustomEvent("civi:npcReaction", { detail: reaction }));
    });

    window.dispatchEvent(new Event("updateProfile"));
  }

  function register() {
    const dir = window.CivicationChoiceDirector;
    if (!dir || !dir.registerHandler) return;
    dir.registerHandler("faction_npc_reaction", handler, 20);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
})();
