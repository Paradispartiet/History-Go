(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function getCharacter(personId) {
    const id = normStr(personId);
    if (!id) return null;
    const rows = window.CivicationNpcCharacterThreads?.getActiveCharacters?.() || [];
    return Array.isArray(rows) ? rows.find((c) => normStr(c.id) === id) || null : null;
  }

  function inferMeetingIndex(mail) {
    const id = normStr(mail?.id);
    const match = id.match(/_(\d{3})$/);
    if (!match) return 1;
    return Number(match[1] || 1);
  }

  function buildVariant(mail, character) {
    const trust = Number(character?.trust_score || 0);
    const name = normStr(character?.name || mail?.tone_context?.character_name || "Denne personen");
    const base = Array.isArray(mail?.situation) ? mail.situation.map(normStr).filter(Boolean) : [];

    if (trust >= 2) {
      return {
        relation: "ally",
        character_id: normStr(mail?.people_ref),
        character_name: name,
        intro: `${name} møter deg nå som en alliert. Det som sies her bygger på tilliten dere allerede har skapt.`,
        situation: [
          `${name} møter deg nå som en alliert. Det som sies her bygger på tilliten dere allerede har skapt.`,
          ...base
        ]
      };
    }

    if (trust <= -2) {
      return {
        relation: "enemy",
        character_id: normStr(mail?.people_ref),
        character_name: name,
        intro: `${name} møter deg nå som motspiller. Det som sies her er ikke råd, men en prøve på hvor langt konflikten har gått.`,
        situation: [
          `${name} møter deg nå som motspiller. Det som sies her er ikke råd, men en prøve på hvor langt konflikten har gått.`,
          ...base
        ]
      };
    }

    return null;
  }

  function npcChoiceLine(choice, variant) {
    const effect = Number(choice?.effect || 0);
    const constructive = effect >= 1;
    const name = normStr(variant?.character_name || "Personen");

    if (variant?.relation === "ally") {
      return constructive
        ? `${name}: Ikke svikt oss nå.`
        : `${name}: Hvis du velger dette, vet jeg ikke lenger hvor vi står.`;
    }

    if (variant?.relation === "enemy") {
      return constructive
        ? `${name}: Så du tør å stå for det likevel.`
        : `${name}: Akkurat. Det var dette jeg ventet på.`;
    }

    return "";
  }

  function variantChoiceLabel(choice, variant) {
    const base = normStr(choice?.label);
    const effect = Number(choice?.effect || 0);
    const constructive = effect >= 1;
    const name = normStr(variant?.character_name || "Personen");
    const line = npcChoiceLine(choice, variant);

    if (variant?.relation === "ally") {
      const action = constructive
        ? `Stå sammen med ${name}: ${base}`
        : `Skuff ${name}: ${base}`;
      return line ? `${line} — ${action}` : action;
    }

    if (variant?.relation === "enemy") {
      const action = constructive
        ? `Møt ${name} åpent: ${base}`
        : `Gå mot ${name}: ${base}`;
      return line ? `${line} — ${action}` : action;
    }

    return base;
  }

  function applyVariantChoices(choices, variant) {
    if (!Array.isArray(choices)) return choices;
    return choices.map((choice) => {
      const originalLabel = normStr(choice?.original_label || choice?.label);
      const line = npcChoiceLine(choice, variant);
      return {
        ...choice,
        original_label: originalLabel,
        label: variantChoiceLabel(choice, variant),
        npc_choice_line: line,
        relationship_choice_variant: {
          relation: normStr(variant?.relation),
          character_id: normStr(variant?.character_id),
          character_name: normStr(variant?.character_name),
          original_label: originalLabel,
          npc_choice_line: line
        }
      };
    });
  }

  function applyRelationshipVariant(mail) {
    if (!mail || normStr(mail.mail_type) !== "people") return mail;
    if (inferMeetingIndex(mail) < 3) return mail;

    const character = getCharacter(mail.people_ref);
    if (!character) return mail;

    const variant = buildVariant(mail, character);
    if (!variant) return mail;

    return {
      ...mail,
      relationship_variant: variant,
      situation: variant.situation,
      choices: applyVariantChoices(mail.choices, variant),
      role_content_meta: {
        ...(mail.role_content_meta || {}),
        relationship_variant: variant
      }
    };
  }

  function patch() {
    const bridge = window.CiviMailPlanBridge;
    if (!bridge || typeof bridge.makeCandidateMailsForActiveRole !== "function") return false;
    if (bridge.__peopleRelationshipVariantPatched) return true;

    const original = bridge.makeCandidateMailsForActiveRole.bind(bridge);

    bridge.makeCandidateMailsForActiveRole = async function patchedMakeCandidateMailsForActiveRole(active, state) {
      const mails = await original(active, state);
      if (!Array.isArray(mails)) return mails;
      return mails.map(applyRelationshipVariant);
    };

    bridge.__peopleRelationshipVariantPatched = true;
    return true;
  }

  if (!patch()) {
    document.addEventListener("DOMContentLoaded", patch, { once: true });
  }

  window.CivicationPeopleMeetingRelationshipVariant = {
    applyRelationshipVariant,
    buildVariant,
    applyVariantChoices,
    variantChoiceLabel,
    npcChoiceLine,
    patch
  };
})();
