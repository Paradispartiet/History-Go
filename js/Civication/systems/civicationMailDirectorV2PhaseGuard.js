(function () {
  "use strict";

  function norm(v) {
    return String(v || "").trim();
  }

  function unique(arr) {
    return [...new Set((Array.isArray(arr) ? arr : []).map(norm).filter(Boolean))];
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

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }

  function hasActiveRole() {
    const active = window.CivicationState?.getActivePosition?.();
    const roleKey = norm(active?.role_key || active?.title || active?.role_id);
    return !!roleKey;
  }

  function isDirectorMail(ev) {
    return !!(ev && ev.director_v2 && norm(ev.mail_type));
  }

  function isNavEvent(ev) {
    const id = norm(ev?.id);
    return norm(ev?.source) === "NAV" || id.startsWith("nav_auto_") || norm(ev?.stage) === "unemployed";
  }

  function isNonMorningRoleMail(ev) {
    const phase = getPhase();
    if (phase === "morning") return false;
    if (!isDirectorMail(ev)) return false;
    return ["job", "faction_choice", "people", "story", "conflict", "event"].includes(norm(ev.mail_type));
  }

  function shouldReplaceWithPhaseEvent(ev) {
    const phase = getPhase();
    if (phase === "morning") return false;
    if (isNonMorningRoleMail(ev)) return true;
    if (hasActiveRole() && isNavEvent(ev)) return true;
    return false;
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

  function unmarkHiddenDirectorMail(ev) {
    if (!isDirectorMail(ev)) return null;

    const id = norm(ev?.id);
    if (!id) return null;

    const state = getState();
    const director = state.mail_director_v2 && typeof state.mail_director_v2 === "object"
      ? state.mail_director_v2
      : null;

    if (!director) return null;

    const shown = unique(director.shown_ids).filter((x) => x !== id);
    const blocked = unique(director.blocked_recent_ids).filter((x) => x !== id);
    const answered = unique(director.answered_ids);

    const next = {
      ...director,
      shown_ids: shown,
      answered_ids: answered,
      blocked_recent_ids: blocked,
      last_event_id: norm(director.last_event_id) === id ? null : director.last_event_id,
      last_mail_type: norm(director.last_event_id) === id ? null : director.last_mail_type,
      last_family: norm(director.last_event_id) === id ? null : director.last_family,
      last_phase: norm(director.last_event_id) === id ? null : director.last_phase,
      turn_index: Math.max(0, Number(director.turn_index || 0) - 1),
      updated_at: new Date().toISOString()
    };

    setState({ mail_director_v2: next });
    return next;
  }

  function cleanNonMorningDirectorMail() {
    const phase = getPhase();
    if (phase === "morning") return false;

    const inbox = getInbox();
    if (!Array.isArray(inbox) || !inbox.length) return false;

    const idx = inbox.findIndex((item) => item && item.status === "pending" && shouldReplaceWithPhaseEvent(item.event));
    if (idx < 0) return false;

    const oldEvent = inbox[idx].event || null;
    const fallback = makePhaseFallback(phase);

    unmarkHiddenDirectorMail(oldEvent);

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
    cleanNonMorningDirectorMail,
    unmarkHiddenDirectorMail
  };
})();
