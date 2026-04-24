(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function buildChoiceToneVariant(choice, mail) {
    const tone = mail?.tone_context || mail?.tone_variant || null;
    if (!tone) return null;

    const characterName = normStr(tone.character_name || tone.characterName || "Denne personen");
    const toneType = normStr(tone.tone || "spent");
    const label = normStr(choice?.label);
    const effect = Number(choice?.effect || 0);
    const constructive = effect >= 1;

    let stance = "følger nøye med på dette valget";
    let variantLabel = label;

    if (toneType === "støttende") {
      stance = constructive
        ? "ville trolig se dette som et ansvarlig valg"
        : "ville nok støtte deg mindre hvis du velger dette";
      variantLabel = constructive
        ? `${label} — ${characterName} vil trolig lese dette som ansvarlig`
        : `${label} — ${characterName} vil merke at du velger bort ansvaret`;
    } else if (toneType === "kritisk") {
      stance = constructive
        ? "vil fortsatt vurdere om dette faktisk holder"
        : "vil bruke dette som bekreftelse på sin skepsis";
      variantLabel = constructive
        ? `${label} — ${characterName} vil fortsatt teste om du mener det`
        : `${label} — ${characterName} vil tolke dette som en svakhet`;
    } else if (toneType === "ambivalent") {
      stance = constructive
        ? "kan bli overbevist hvis valget følges opp"
        : "kan miste mer tillit hvis dette glipper";
      variantLabel = constructive
        ? `${label} — ${characterName} kan begynne å stole mer på deg`
        : `${label} — ${characterName} kan trekke seg lenger unna`;
    } else {
      stance = constructive
        ? "ser etter om du faktisk bærer konsekvensen"
        : "registrerer usikkerheten i valget";
      variantLabel = constructive
        ? `${label} — ${characterName} følger med på om du står i det`
        : `${label} — ${characterName} merker at dette kan skape avstand`;
    }

    return {
      character_id: normStr(tone.character_id),
      character_name: characterName,
      tone: toneType,
      stance,
      label: variantLabel,
      original_label: label
    };
  }

  function applyChoiceToneVariants(mail) {
    if (!mail || !Array.isArray(mail.choices) || !mail.choices.length) return mail;
    if (!mail.tone_context && !mail.tone_variant) return mail;

    return {
      ...mail,
      choices: mail.choices.map((choice) => {
        const choiceTone = buildChoiceToneVariant(choice, mail);
        if (!choiceTone) return choice;
        return {
          ...choice,
          choice_tone_context: choiceTone,
          tone_variant_label: choiceTone.label
        };
      })
    };
  }

  function patchMailPlanBridge() {
    const bridge = window.CiviMailPlanBridge;
    if (!bridge || typeof bridge.makeCandidateMailsForActiveRole !== "function") return false;
    if (bridge.__choiceToneVariantsPatched) return true;

    const original = bridge.makeCandidateMailsForActiveRole.bind(bridge);

    bridge.makeCandidateMailsForActiveRole = async function patchedMakeCandidateMailsForActiveRole(active, state) {
      const mails = await original(active, state);
      if (!Array.isArray(mails)) return mails;
      return mails.map(applyChoiceToneVariants);
    };

    bridge.__choiceToneVariantsPatched = true;
    return true;
  }

  if (!patchMailPlanBridge()) {
    document.addEventListener("DOMContentLoaded", patchMailPlanBridge, { once: true });
  }

  window.CivicationChoiceToneVariants = {
    applyChoiceToneVariants,
    buildChoiceToneVariant,
    patchMailPlanBridge
  };
})();
