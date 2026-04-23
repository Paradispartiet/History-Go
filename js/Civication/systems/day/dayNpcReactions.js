(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function listify(arr) {
    return Array.isArray(arr) ? arr.map(normStr).filter(Boolean) : [];
  }

  function getPeople() {
    const list = window.CivicationPeopleEngine?.getAvailablePeople?.() || [];
    return Array.isArray(list) ? list : [];
  }

  function getActiveCharacters() {
    const api = window.CivicationNpcCharacterThreads;
    if (!api || typeof api.getActiveCharacters !== "function") return [];
    const rows = api.getActiveCharacters();
    return Array.isArray(rows) ? rows : [];
  }

  function scoreByMailFamily(person, family) {
    let score = 0;

    const knowledge = listify(person?.knowledge_tags);
    const roles = listify(person?.character_roles);
    const events = listify(person?.event_affinity);
    const badges = listify(person?.badge_scope);
    const style = normStr(person?.social_style);
    const name = normStr(person?.name).toLowerCase();

    if (family === "sliten_nokkelperson") {
      if (knowledge.includes("baereevne")) score += 10;
      if (knowledge.includes("teamrytme")) score += 8;
      if (knowledge.includes("gulvrealitet")) score += 6;
      if (roles.includes("nokkelperson")) score += 10;
      if (roles.includes("realitetsanker")) score += 5;
      if (events.includes("driftskrise")) score += 3;
      if (style === "social") score += 3;
      if (name === "kari") score += 8;
      if (name === "farid") score += 5;
    }

    if (family === "krysspress") {
      if (knowledge.includes("system")) score += 9;
      if (knowledge.includes("rapportering")) score += 8;
      if (knowledge.includes("maling")) score += 8;
      if (knowledge.includes("budsjetter")) score += 6;
      if (roles.includes("motspiller")) score += 8;
      if (roles.includes("kritisk_motpart")) score += 7;
      if (badges.includes("styring")) score += 6;
      if (events.includes("ledermote")) score += 4;
      if (style === "institutional" || style === "economic") score += 3;
      if (name === "ali") score += 8;
      if (name === "solveig") score += 5;
    }

    if (family === "mellomleder_planlegging") {
      if (knowledge.includes("rapportering")) score += 5;
      if (knowledge.includes("kvalitet")) score += 6;
      if (knowledge.includes("produksjon")) score += 7;
      if (knowledge.includes("rytme")) score += 5;
      if (knowledge.includes("budsjetter")) score += 4;
      if (roles.includes("mentor")) score += 4;
      if (roles.includes("noktern_vekt")) score += 5;
      if (badges.includes("drift")) score += 4;
      if (badges.includes("kvalitet")) score += 4;
      if (name === "kari") score += 5;
      if (name === "lise") score += 6;
      if (name === "solveig") score += 5;
    }

    if (family === "driftskrise") {
      if (knowledge.includes("produksjon")) score += 8;
      if (knowledge.includes("gulvrealitet")) score += 8;
      if (knowledge.includes("baereevne")) score += 6;
      if (knowledge.includes("system")) score += 5;
      if (roles.includes("realitetsanker")) score += 7;
      if (roles.includes("nokkelperson")) score += 7;
      if (events.includes("driftskrise")) score += 8;
      if (style === "social") score += 3;
      if (name === "farid") score += 7;
      if (name === "kari") score += 6;
      if (name === "ali") score += 3;
    }

    if (family === "mellomleder_identitet") {
      if (knowledge.includes("faglig_integritet")) score += 7;
      if (knowledge.includes("organisasjonslesning")) score += 6;
      if (knowledge.includes("system")) score += 4;
      if (roles.includes("mentor")) score += 7;
      if (roles.includes("institusjonell_speiler")) score += 6;
      if (roles.includes("fremtidig_rival")) score += 5;
      if (style === "cultural" || style === "institutional" || style === "symbolic") score += 2;
      if (name === "lise") score += 7;
      if (name === "ali") score += 5;
      if (name === "jonas") score += 4;
    }

    return score;
  }

  function scoreByCharacterState(person, family) {
    const activeChars = getActiveCharacters();
    if (!activeChars.length) return 0;

    const personId = normStr(person?.id);
    const match = activeChars.find((c) => normStr(c?.id) === personId);
    if (!match) return 0;

    let score = 6 + Math.min(8, Math.abs(Number(match?.trust_score || 0)));

    const focusFamilies = listify(match?.focus_families);
    if (focusFamilies.includes(family)) score += 10;

    const status = normStr(match?.status);
    if (status === "alliert" && (family === "sliten_nokkelperson" || family === "mellomleder_identitet")) score += 4;
    if (status === "motspiller" && family === "krysspress") score += 5;

    return score;
  }

  function scoreByGeneralFit(person) {
    let score = Number(person?.score || 0);

    const potential = normStr(person?.character_potential);
    if (potential === "high") score += 4;
    if (potential === "medium") score += 2;

    const teaches = listify(person?.teaches);
    score += Math.min(4, teaches.length);

    return score;
  }

  function choosePerson(eventObj) {
    const people = getPeople();
    if (!people.length) return null;

    const family = normStr(eventObj?.mail_family);

    const ranked = people
      .map((person) => {
        const score =
          scoreByGeneralFit(person) +
          scoreByMailFamily(person, family) +
          scoreByCharacterState(person, family);

        return { person, score };
      })
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));

    return ranked[0]?.person || people[0] || null;
  }

  function buildReaction(person, eventObj, choice) {
    const family = normStr(eventObj?.mail_family);
    const effect = Number(choice?.effect || 0);
    const good = effect >= 1;
    const personName = normStr(person?.name || "Person");

    let title = `${personName} reagerer på valget ditt`;
    let line = "Dette påvirker hvordan de ser deg videre.";
    let trustDelta = good ? 1 : -1;

    if (family === "sliten_nokkelperson") {
      if (good) {
        title = `${personName} merker at du beskytter folk når det koster.`;
        line = "Det bygger tillit fordi noen ser at du ikke bare bruker de sterkeste til systemet får det den vil ha.";
        trustDelta = 2;
      } else {
        title = `${personName} ser at du lot drift veie tyngre enn slitasje.`;
        line = "Det holder ting gående en stund, men gjør det vanskeligere å tro at du vil gripe inn før noen virkelig faller.";
        trustDelta = -2;
      }
    } else if (family === "krysspress") {
      if (good) {
        title = `${personName} oppfatter at du valgte virkeligheten framfor målingen.`;
        line = "Det gjør deg mer troverdig nedenfra, selv om det også gjør deg mindre bekvem for systemet over deg.";
        trustDelta = 2;
      } else {
        title = `${personName} merker at du valgte det målbare framfor det som faktisk fungerte.`;
        line = "Det ser ryddig ut, men etterlater et inntrykk av at andre må bære mer alene.";
        trustDelta = -2;
      }
    } else if (family === "mellomleder_planlegging") {
      if (good) {
        title = `${personName} ser at du planlegger for virkeligheten, ikke bare for planen.`;
        line = "Det gir mer tillit fordi rammen faktisk tar høyde for hvordan arbeid og begrensninger oppleves i praksis.";
        trustDelta = 1;
      } else {
        title = `${personName} skjønner at planen ble stående penere enn den ble sann.`;
        line = "Det gjør at neste avvik vil føles mindre som uhell og mer som noe som allerede var valgt.";
        trustDelta = -1;
      }
    } else if (family === "driftskrise") {
      if (good) {
        title = `${personName} ser at du tok styring da det faktisk gjaldt.`;
        line = "Det skaper ro, men også en forventning om at du må bære like tungt neste gang.";
        trustDelta = 2;
      } else {
        title = `${personName} merker nølingen i det som skulle samle situasjonen.`;
        line = "Usikkerheten sprer seg raskt når folk ikke vet om noen faktisk holder rattet.";
        trustDelta = -2;
      }
    } else if (family === "mellomleder_identitet") {
      if (good) {
        title = `${personName} merker at du fortsatt prøver å holde fast i noe virkelig i rollen.`;
        line = "Det gjør deg mindre glatt, men også mer gjenkjennelig for folk som fortsatt tror at integritet betyr noe.";
        trustDelta = 1;
      } else {
        title = `${personName} ser at rollen har begynt å snakke gjennom deg.`;
        line = "Det er kanskje effektivt, men det gjør avstanden mellom deg og andre litt større.";
        trustDelta = -1;
      }
    }

    return {
      id: `npc_reaction_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      personId: normStr(person?.id),
      personName,
      personType: normStr(person?.type || "person"),
      subject: normStr(eventObj?.subject),
      choiceLabel: normStr(choice?.label),
      title,
      line,
      trustDelta,
      createdAt: new Date().toISOString(),
      careerId: normStr(window.CivicationState?.getActivePosition?.()?.career_id)
    };
  }

  function applyNpcReaction(ctx) {
    const { eventObj, choice } = ctx;

    const person = choosePerson(eventObj);
    if (!person) return null;

    const reaction = buildReaction(person, eventObj, choice);
    window.dispatchEvent(new CustomEvent("civi:npcReaction", { detail: reaction }));
    return reaction;
  }

  function register() {
    if (!window.CivicationChoiceDirector) return;

    window.CivicationChoiceDirector.registerHandler(
      "npcReactions",
      applyNpcReaction,
      20
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
})();
