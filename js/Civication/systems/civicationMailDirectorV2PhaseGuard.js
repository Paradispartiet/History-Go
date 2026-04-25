(function () {
  "use strict";

  function norm(v) {
    return String(v || "").trim();
  }

  function getPhase() {
    return norm(window.CivicationCalendar?.getPhase?.()) || "morning";
  }

  function getInbox() {
    return window.CivicationState?.getInbox?.() || [];
  }

  function setInbox(arr) {
    window.CivicationState?.setInbox?.(Array.isArray(arr) ? arr : []);
    window.dispatchEvent(new Event("updateProfile"));
  }

  function isDirectorMail(ev) {
    return !!(ev && ev.director_v2 && norm(ev.mail_type));
  }

  function isNonMorningRoleMail(ev) {
    const phase = getPhase();
    if (phase === "morning") return false;
    if (!isDirectorMail(ev)) return false;
    return ["job", "faction_choice", "people", "story", "conflict", "event"].includes(norm(ev.mail_type));
  }

  function makePhaseFallback(phase) {
    const id = `phase_${phase}_${Date.now()}`;

    if (phase === "lunch") {
      return {
        id,
        source: "Civication",
        phase_tag: "lunch",
        subject: "Lunsjpause",
        situation: [
          "Arbeidsdagen skifter tempo.",
          "Dette er en pausefase, ikke neste rolle-mail."
        ],
        choices: [
          { id: "A", label: "Ta en rolig pause", effect: 0 }
        ]
      };
    }

    if (phase === "afternoon") {
      return {
        id,
        source: "Civication",
        phase_tag: "afternoon",
        subject: "Ettermiddag",
        situation: [
          "Dagen går videre til neste arbeidsfase.",
          "Neste rolle-mail skal ikke presses inn bare fordi en pausefase er aktiv."
        ],
        choices: [
          { id: "A", label: "Gå videre", effect: 0 }
        ]
      };
    }

    if (phase === "evening") {
      return {
        id,
        source: "Civication",
        phase_tag: "evening",
        subject: "Kveld",
        situation: [
          "Arbeidsdagen slipper taket litt.",
          "Det som har skjedd kan få etterklang senere."
        ],
        choices: [
          { id: "A", label: "Avslutt dagen rolig", effect: 0 }
        ]
      };
    }

    return {
      id,
      source: "Civication",
      phase_tag: phase,
      subject: "Arbeidsdagen går videre",
      situation: ["Fasen holdes adskilt fra rolle-mailene."],
      choices: [
        { id: "A", label: "Fortsett", effect: 0 }
      ]
    };
  }

  function cleanNonMorningDirectorMail() {
    const phase = getPhase();
    if (phase === "morning") return false;

    const inbox = getInbox();
    if (!Array.isArray(inbox) || !inbox.length) return false;

    const idx = inbox.findIndex((item) => item && item.status === "pending" && isNonMorningRoleMail(item.event));
    if (idx < 0) return false;

    const fallback = makePhaseFallback(phase);
    inbox[idx] = {
      ...inbox[idx],
      event: fallback
    };
    setInbox(inbox);
    return true;
  }

  function patchEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__mailDirectorV2PhaseGuardPatched) return false;

    const originalOnAppOpen = proto.onAppOpen;
    if (typeof originalOnAppOpen === "function") {
      proto.onAppOpen = async function guardedOnAppOpen(opts) {
        const res = await originalOnAppOpen.call(this, opts || {});
        cleanNonMorningDirectorMail();
        return res;
      };
    }

    const originalAnswer = proto.answer;
    if (typeof originalAnswer === "function") {
      proto.answer = async function guardedAnswer(eventId, choiceId) {
        const res = await originalAnswer.call(this, eventId, choiceId);
        cleanNonMorningDirectorMail();
        return res;
      };
    }

    proto.__mailDirectorV2PhaseGuardPatched = true;
    return true;
  }

  function boot() {
    patchEngine();
    cleanNonMorningDirectorMail();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:booted", boot);
  window.addEventListener("updateProfile", cleanNonMorningDirectorMail);

  window.CivicationMailDirectorV2PhaseGuard = {
    boot,
    patchEngine,
    cleanNonMorningDirectorMail
  };
})();
