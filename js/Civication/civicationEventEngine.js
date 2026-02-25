// ============================================================
// CivicationEventEngine
// ============================================================

class CivicationEventEngine {

  constructor(opts = {}) {

    this.packBasePath = opts.packBasePath || "data/civication";

    this.maxInbox =
      Number.isFinite(opts.maxInbox) ? opts.maxInbox : 1;

    this.pulseLimitPerDay = 3;

    this.packsCache = new Map();

    this.packMap = opts.packMap || {
      naering: "naeringslivCivic.json",
      naeringsliv: "naeringslivCivic.json",
      media: "mediaCivic.json",
      by: "byCivic.json"
    };
  }

  // ============================================================
  // STATE (delegert til CivicationState)
  // ============================================================

  getState() {
    return CivicationState.getState();
  }

  setState(patch) {
    return CivicationState.setState(patch);
  }

  resetForNewJob(role_key) {
    CivicationState.setState({
      active_role_key: role_key || null,
      consumed: {}
    });
  }

  // ============================================================
  // INBOX (delegert til CivicationState)
  // ============================================================

  getInbox() {
    return CivicationState.getState().inbox || [];
  }

  setInbox(arr) {
    CivicationState.setState({
      inbox: Array.isArray(arr) ? arr : []
    });
  }

  getPendingEvent() {
    const inbox = this.getInbox();
    return inbox.find(m => m?.status === "pending") || null;
  }

  // ============================================================
  // ROLE RESOLUTION
  // ============================================================

  resolveRoleKey() {
    const active = getActivePosition();
    if (!active) return null;

    if (active.role_key) return String(active.role_key);

    const t = slugify(active.title || "");
    if (t) return t;

    if (active.career_id) return String(active.career_id);

    return null;
  }

  ensureRoleKeySynced() {
    const active = getActivePosition();
    if (!active) {
      this.setState({ active_role_key: null });
      return null;
    }

    const rk = this.resolveRoleKey();
    const st = this.getState();

    if (rk && rk !== st.active_role_key) {
      if (!active.role_key) {
        setActivePosition({ ...active, role_key: rk });
      }
      this.resetForNewJob(rk);
    }

    return rk;
  }

  // ============================================================
  // PACK LOADING
  // ============================================================

  async loadPack(packFile) {

    if (!packFile) return null;

    if (this.packsCache.has(packFile))
      return this.packsCache.get(packFile);

    const url = `${this.packBasePath}/${packFile}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const pack = await res.json();
    this.packsCache.set(packFile, pack);

    return pack;
  }

  // ============================================================
  // EVENT SELECTION (100% bevart)
  // ============================================================

  pickEventFromPack(pack, state) {

    if (!pack || !Array.isArray(pack.mails)) {
      return null;
    }

    const consumed = state?.consumed || {};

    const stability = state.stability;

    const wantWarningMail =
      (stability === "WARNING" && state.warning_used === true);

    let candidates = pack.mails.filter(
      m => m?.id && !consumed[m.id]
    );

    candidates = candidates.filter(
      m => m.stage !== "fired" && m.stage !== "unemployed"
    );

    if (stability === "STABLE") {
      candidates = candidates.filter(
        m => m.stage === "stable" ||
             m.stage === "stable_warning"
      );
    }

    if (stability === "WARNING") {
      candidates = candidates.filter(
        m => m.stage === "warning" ||
             m.stage === "warning_danger" ||
             m.stage === "stable_warning"
      );
    }

    if (wantWarningMail) {
      const warn = candidates.find(
        m => m.is_warning_mail === true
      );
      if (warn) return warn;
    }

    function scoreMail(m) {
      let score = 0;

      const identityTags = state?.identity_tags || [];
      const tracks = state?.tracks || [];
      const gating = m?.gating || {};

      if (Array.isArray(gating.avoid_tags)) {
        for (let t of gating.avoid_tags) {
          if (identityTags.includes(t)) {
            return -1000;
          }
        }
      }

      if (Array.isArray(gating.prefer_tags)) {
        for (let t of gating.prefer_tags) {
          if (identityTags.includes(t)) score += 2;
        }
      }

      if (Array.isArray(gating.prefer_tracks)) {
        for (let tr of gating.prefer_tracks) {
          if (tracks.includes(tr)) score += 3;
        }
      }

      return score;
    }

    candidates.sort((a, b) =>
      scoreMail(b) - scoreMail(a)
    );

    return candidates.length ? candidates[0] : null;
  }

  // ============================================================
  // FALLBACK EVENTS
  // ============================================================

  makeFiredEvent(role_key) {
    return {
      id: (role_key || "job") + "_fired_auto",
      stage: "fired",
      subject: "Vi avslutter samarbeidet",
      situation: ["Tilliten er brukt opp."],
      choices: [],
      effect: "job_lost",
      feedback:
        "Du blir tatt av dekning med umiddelbar virkning."
    };
  }

  makeNavEvent() {
    return {
      id: "nav_auto_" + Date.now(),
      stage: "unemployed",
      source: "NAV",
      subject: "Din sak er registrert",
      situation: [
        "Vi mangler fortsatt dokumentasjon.",
        "Du hører fra oss."
      ],
      choices: [],
      feedback: "Bare virkelighet."
    };
  }

}

window.CivicationEventEngine = CivicationEventEngine;

// ============================================================
// ANSWER EVENT
// ============================================================

answer(eventId, choiceId) {

  const state = this.getState();
  const inbox = this.getInbox();

  const msgIndex = inbox.findIndex(
    m => m && m.id === eventId
  );

  if (msgIndex === -1) {
    return { ok: false, error: "Event not found" };
  }

  const msg = inbox[msgIndex];

  if (!msg || msg.status !== "pending") {
    return { ok: false, error: "Already handled" };
  }

  const choice =
    Array.isArray(msg.choices)
      ? msg.choices.find(c => c.id === choiceId)
      : null;

  if (!choice) {
    return { ok: false, error: "Invalid choice" };
  }

  // --------------------------------------------------
  // Apply effects
  // --------------------------------------------------

  let stability = state.stability || "STABLE";
  let strikes = Number(state.strikes || 0);
  let consumed = { ...(state.consumed || {}) };

  if (choice.effect === "warning") {
    stability = "WARNING";
    strikes += 1;
  }

  if (choice.effect === "fire") {
    stability = "FIRED";
  }

  if (choice.effect === "stabilize") {
    stability = "STABLE";
    strikes = 0;
  }

  // Mark consumed
  consumed[msg.id] = true;

  // Update message status
  inbox[msgIndex] = {
    ...msg,
    status: "handled",
    chosen: choiceId
  };

  this.setInbox(inbox);

  this.setState({
    stability,
    strikes,
    consumed
  });

  // --------------------------------------------------
  // 🔥 Obligation Hook (NY)
  // --------------------------------------------------

  if (window.CivicationObligationEngine) {
    CivicationObligationEngine.registerEventResponse();
    CivicationObligationEngine.evaluate();
  }

  // --------------------------------------------------
  // Fired handling
  // --------------------------------------------------

  if (stability === "FIRED") {

    const role_key = state.active_role_key;

    const firedEv =
      this.makeFiredEvent(role_key);

    if (firedEv) {
      this.setInbox([firedEv]);
    }

    return {
      ok: true,
      effect: choice.effect,
      stability: "FIRED"
    };
  }

  return {
    ok: true,
    effect: choice.effect,
    stability
  };
}
