(function () {
  "use strict";

  const FACTION_LINES = {
    industri: {
      label: "Industri / bygging",
      line: "Industrien krever at noe faktisk bygges, ikke bare måles."
    },
    kontroll: {
      label: "Kontroll / rapportering",
      line: "Kontrollsiden vil ha tall, ansvarslinjer og dokumentasjon før noe får fortsette."
    },
    institusjon: {
      label: "Institusjon / tillit",
      line: "Institusjonen forsøker å bevare ro, orden og tillit mens presset øker."
    },
    menneske: {
      label: "Mennesker / bæreevne",
      line: "Menneskesiden spør hva systemet gjør med dem som må bære det."
    }
  };

  function normStr(v) {
    return String(v || "").trim();
  }

  function getFactionState() {
    const api = window.CivicationFactionConflictSystem;
    if (!api || typeof api.getState !== "function") return null;
    return api.getState() || null;
  }

  function getFactionLine(id) {
    return FACTION_LINES[normStr(id)] || null;
  }

  function buildFactionVoice(mail) {
    const state = getFactionState();
    const conflict = state?.dominant_conflict || null;
    if (!conflict) return null;

    const a = getFactionLine(conflict.a);
    const b = getFactionLine(conflict.b);
    if (!a || !b) return null;

    const family = normStr(mail?.mail_family);
    const families = Array.isArray(conflict.families) ? conflict.families.map(normStr) : [];
    if (family && families.length && !families.includes(family)) return null;

    return {
      conflict_id: normStr(conflict.id),
      label: normStr(conflict.label),
      pressure: Number(conflict.pressure || 0),
      factions: [
        { id: normStr(conflict.a), label: a.label, line: a.line },
        { id: normStr(conflict.b), label: b.label, line: b.line }
      ],
      intro: `${conflict.label}: ${a.line} ${b.line}`
    };
  }

  function applyFactionVoice(mail) {
    if (!mail) return mail;
    const voice = buildFactionVoice(mail);
    if (!voice) return mail;

    const baseSituation = Array.isArray(mail.situation) ? mail.situation : [];
    const baseToneVariant = mail.tone_variant && typeof mail.tone_variant === "object" ? mail.tone_variant : null;

    return {
      ...mail,
      faction_voice: voice,
      situation: [voice.intro, ...baseSituation],
      tone_variant: baseToneVariant
        ? {
            ...baseToneVariant,
            situation: [voice.intro, ...(Array.isArray(baseToneVariant.situation) ? baseToneVariant.situation : [])]
          }
        : null
    };
  }

  function patchMailPlanBridge() {
    const bridge = window.CiviMailPlanBridge;
    if (!bridge || typeof bridge.makeCandidateMailsForActiveRole !== "function") return false;
    if (bridge.__factionVoicePatched) return true;

    const original = bridge.makeCandidateMailsForActiveRole.bind(bridge);

    bridge.makeCandidateMailsForActiveRole = async function patchedMakeCandidateMailsForActiveRole(active, state) {
      const mails = await original(active, state);
      if (!Array.isArray(mails)) return mails;
      return mails.map(applyFactionVoice);
    };

    bridge.__factionVoicePatched = true;
    return true;
  }

  if (!patchMailPlanBridge()) {
    document.addEventListener("DOMContentLoaded", patchMailPlanBridge, { once: true });
  }

  window.CivicationFactionVoice = {
    buildFactionVoice,
    applyFactionVoice,
    patchMailPlanBridge
  };
})();
