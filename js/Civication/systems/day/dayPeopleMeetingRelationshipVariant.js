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
    patch
  };
})();
