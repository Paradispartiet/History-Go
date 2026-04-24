(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function listify(arr) {
    return Array.isArray(arr) ? arr.map(normStr).filter(Boolean) : [];
  }

  function getActiveCharacters() {
    const api = window.CivicationNpcCharacterThreads;
    if (!api || typeof api.getActiveCharacters !== "function") return [];
    const rows = api.getActiveCharacters();
    return Array.isArray(rows) ? rows : [];
  }

  function inferToneFromCharacter(char) {
    const status = normStr(char?.status || "ustabil");
    const trustScore = Number(char?.trust_score || 0);

    if (status === "alliert" || trustScore >= 3) return "støttende";
    if (status === "motspiller" || trustScore <= -3) return "kritisk";
    if (status === "ustabil" && Math.abs(trustScore) >= 2) return "ambivalent";
    return "spent";
  }

  function rankSpeakingCharacters(mail) {
    const chars = getActiveCharacters();
    if (!chars.length) return [];

    const family = normStr(mail?.mail_family);
    const primaryId = normStr(mail?.tone_context?.character_id || mail?.tone_variant?.character_id);

    return chars
      .map((char) => {
        const id = normStr(char?.id);
        const focusFamilies = listify(char?.focus_families);
        const appearances = Number(char?.appearances || 0);
        const trustScore = Number(char?.trust_score || 0);
        const established = appearances >= 2 || Math.abs(trustScore) >= 3;
        if (!established) return null;

        let score = 0;
        if (id && id === primaryId) score += 30;
        if (focusFamilies.includes(family)) score += 18;
        score += Math.min(10, appearances * 2);
        score += Math.min(10, Math.abs(trustScore) * 2);

        if (score < 10) return null;

        return {
          character_id: id,
          character_name: normStr(char?.name || "Person"),
          tone: inferToneFromCharacter(char),
          status: normStr(char?.status || "ustabil"),
          trust_score: trustScore,
          appearances,
          score
        };
      })
      .filter(Boolean)
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, 3);
  }

  function buildCharacterSpeech(choice, tone) {
    const characterName = normStr(tone?.character_name || tone?.characterName || "Denne personen");
    const toneType = normStr(tone?.tone || "spent");
    const effect = Number(choice?.effect || 0);
    const constructive = effect >= 1;

    if (toneType === "støttende") {
      return constructive
        ? `${characterName}: Dette er det ansvarlige valget.`
        : `${characterName}: Dette kan holde systemet gående, men det koster folk noe.`;
    }

    if (toneType === "kritisk") {
      return constructive
        ? `${characterName}: Det høres riktig ut. Nå må du vise at det holder.`
        : `${characterName}: Dette bekrefter akkurat det jeg var redd for.`;
    }

    if (toneType === "ambivalent") {
      return constructive
        ? `${characterName}: Kanskje dette kan gå, hvis du følger det opp.`
        : `${characterName}: Jeg er ikke sikker på om du ser hva dette gjør med resten.`;
    }

    return constructive
      ? `${characterName}: Du må stå i dette hvis du først velger det.`
      : `${characterName}: Dette valget kommer ikke til å forsvinne av seg selv.`;
  }

  function buildCharacterReplyOption(choice, speaker, index) {
    const originalLabel = normStr(choice?.original_label || choice?.label);
    const speech = buildCharacterSpeech(choice, speaker);
    const tone = normStr(speaker?.tone || "spent");
    const characterName = normStr(speaker?.character_name || "Person");

    let replyLabel = `Svar ${characterName}`;
    if (tone === "støttende") replyLabel = `Svar ${characterName}: stå i ansvaret`;
    if (tone === "kritisk") replyLabel = `Svar ${characterName}: forsvar valget`;
    if (tone === "ambivalent") replyLabel = `Svar ${characterName}: bygg tillit`;
    if (tone === "spent") replyLabel = `Svar ${characterName}: ta presset`;

    return {
      id: `${normStr(choice?.id) || "choice"}__character_${index + 1}_${normStr(speaker?.character_id)}`,
      base_choice_id: normStr(choice?.id),
      character_id: normStr(speaker?.character_id),
      character_name: characterName,
      tone,
      label: replyLabel,
      speech,
      original_choice_label: originalLabel,
      effect: Number(choice?.effect || 0)
    };
  }

  function buildChoiceToneVariant(choice, mail, speakers) {
    const fallbackTone = mail?.tone_context || mail?.tone_variant || null;
    const activeSpeakers = Array.isArray(speakers) && speakers.length ? speakers : (fallbackTone ? [fallbackTone] : []);
    if (!activeSpeakers.length) return null;

    const label = normStr(choice?.label);
    const speechLines = activeSpeakers
      .map((speaker) => buildCharacterSpeech(choice, speaker))
      .filter(Boolean);

    if (!speechLines.length) return null;

    const primary = activeSpeakers[0] || fallbackTone || {};
    const splitOptions = activeSpeakers.map((speaker, index) => buildCharacterReplyOption(choice, speaker, index));

    return {
      character_id: normStr(primary.character_id),
      character_name: normStr(primary.character_name || primary.characterName || "Person"),
      tone: normStr(primary.tone || "spent"),
      speakers: activeSpeakers,
      speech_lines: speechLines,
      speech_label: speechLines.join(" / "),
      character_choice_options: splitOptions,
      original_label: label
    };
  }

  function applyChoiceToneVariants(mail) {
    if (!mail || !Array.isArray(mail.choices) || !mail.choices.length) return mail;
    if (!mail.tone_context && !mail.tone_variant) return mail;

    const speakers = rankSpeakingCharacters(mail);

    return {
      ...mail,
      speaking_characters: speakers,
      choices: mail.choices.map((choice) => {
        const choiceTone = buildChoiceToneVariant(choice, mail, speakers);
        if (!choiceTone) return choice;
        return {
          ...choice,
          original_label: normStr(choice?.original_label || choice?.label),
          label: choiceTone.speech_label,
          choice_tone_context: choiceTone,
          character_speech_lines: choiceTone.speech_lines,
          character_speech_label: choiceTone.speech_label,
          character_choice_options: choiceTone.character_choice_options
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
    buildCharacterSpeech,
    buildCharacterReplyOption,
    rankSpeakingCharacters,
    patchMailPlanBridge
  };
})();
