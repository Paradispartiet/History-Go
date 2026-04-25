(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function getCharacter(personId) {
    const id = normStr(personId);
    if (!id) return null;

    const api = window.CivicationNpcCharacterThreads;
    const rows = api?.getActiveCharacters?.() || [];
    const active = Array.isArray(rows) ? rows.find((c) => normStr(c.id) === id) || null : null;
    if (active) return active;

    const state = api?.getState?.() || {};
    return state?.characters?.[id] || null;
  }

  function inferMeetingIndex(mail) {
    const id = normStr(mail?.id);
    const match = id.match(/_(\d{3})$/);
    if (!match) return 1;
    return Number(match[1] || 1);
  }

  function canShowPeopleMeeting(mail) {
    if (normStr(mail?.mail_type) !== "people") return true;

    const personId = normStr(mail?.people_ref);
    const meeting = inferMeetingIndex(mail);
    if (meeting <= 1) return true;

    const character = getCharacter(personId);
    if (!character) return false;

    const appearances = Number(character.appearances || 0);
    const trust = Number(character.trust_score || 0);

    if (meeting === 2) return appearances >= 1;
    if (meeting >= 3) return appearances >= 2 && (trust >= 2 || trust <= -2);

    return true;
  }

  function applyMeetingGate(mails) {
    if (!Array.isArray(mails)) return mails;
    return mails.filter(canShowPeopleMeeting);
  }

  function patch() {
    const bridge = window.CiviMailPlanBridge;
    if (!bridge || typeof bridge.makeCandidateMailsForActiveRole !== "function") return false;
    if (bridge.__peopleMeetingGatePatched) return true;

    const original = bridge.makeCandidateMailsForActiveRole.bind(bridge);

    bridge.makeCandidateMailsForActiveRole = async function patchedMakeCandidateMailsForActiveRole(active, state) {
      const mails = await original(active, state);
      return applyMeetingGate(mails);
    };

    bridge.__peopleMeetingGatePatched = true;
    return true;
  }

  if (!patch()) {
    document.addEventListener("DOMContentLoaded", patch, { once: true });
  }

  window.CivicationPeopleMeetingGate = {
    canShowPeopleMeeting,
    applyMeetingGate,
    patch
  };
})();
