// ============================================================
// CivicationEventEngine
// ============================================================

class CivicationEventEngine {

  constructor(opts = {}) {

    // Kun config her (state eies av CivicationState)
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
  // STATE (via CivicationState)
  // ============================================================

  getState() {
    return window.CivicationState?.getState
      ? window.CivicationState.getState()
      : {};
  }

  setState(patch) {
    return window.CivicationState?.setState
      ? window.CivicationState.setState(patch || {})
      : {};
  }

  resetForNewJob(role_key) {

    // Tidligere: lsSet(LS_STATE, { ...DEFAULTS, active_role_key: rk, consumed:{} })
    // Nå: resetter samme "event engine"-felt i CivicationState uten å røre economy/capital.

    const rk = role_key || null;

    this.setState({
      stability: "STABLE",
      warning_used: false,
      strikes: 0,
      score: 0,
      active_role_key: rk,
      consumed: {},
      identity_tags: [],
      tracks: [],
      unemployed_since_week: null
    });
  }

  // ============================================================
  // INBOX (via CivicationState)
  // ============================================================

  getInbox() {
    const s = this.getState();
    const inbox = s && Array.isArray(s.inbox) ? s.inbox : [];
    return inbox;
  }

  setInbox(arr) {
    this.setState({
      inbox: Array.isArray(arr) ? arr : []
    });
  }

  getPendingEvent() {
    const inbox = this.getInbox();
    return (
      inbox.find(m => m && m.status === "pending") || null
    );
  }

  // ============================================================
  // ANSWER (NY: obligation-hook)
  // ============================================================

  answer(eventId, choiceId) {

    const state = this.getState();
    const inbox = this.getInbox();

    const idx = inbox.findIndex(m => m && m.id === eventId);
    if (idx === -1) {
      return { ok: false, error: "Event not found" };
    }

    const msg = inbox[idx];
    if (!msg || msg.status !== "pending") {
      return { ok: false, error: "Already handled" };
    }

    const choice =
      Array.isArray(msg.choices)
        ? msg.choices.find(c => c && c.id === choiceId)
        : null;

    if (!choice) {
      return { ok: false, error: "Invalid choice" };
    }

    // -------- effect → stability/strikes (bevarer enkel modell) --------
    let stability = state.stability || "STABLE";
    let strikes = Number(state.strikes || 0);
    const consumed = { ...(state.consumed || {}) };

    // Hvis du har en mer avansert effect-modell i packene,
    // kan dette utvides uten å endre struktur.
    if (choice.effect === "warning") {
      stability = "WARNING";
      strikes += 1;
    } else if (choice.effect === "fire") {
      stability = "FIRED";
    } else if (choice.effect === "stabilize") {
      stability = "STABLE";
      strikes = 0;
    }

    // Mark consumed
    consumed[msg.id] = true;

    // Update message
    inbox[idx] = {
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
    // Obligation hook
    // --------------------------------------------------
    if (window.CivicationObligationEngine?.registerEventResponse) {
      window.CivicationObligationEngine.registerEventResponse();
    }
    if (window.CivicationObligationEngine?.evaluate) {
      window.CivicationObligationEngine.evaluate();
    }

    // -------- fired handling (fallback mail) --------
    if (stability === "FIRED") {

      const role_key = state.active_role_key;

      const firedEv = this.makeFiredEvent(role_key);
      if (firedEv) {
        this.setInbox([{
          ...firedEv,
          status: "pending"
        }]);
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

  // ============================================================
  // ROLE KEY + BASELINE
  // ============================================================

  resolveRoleKey() {
    const active = getActivePosition();
    if (!active) return null;

    if (active.role_key)
      return String(active.role_key);

    const t = slugify(active.title || "");
    if (t) return t;

    if (active.career_id)
      return String(active.career_id);

    return null;
  }

  syncRoleBaselineFromActive() {

    const active = getActivePosition();

    if (!active?.career_id) {
      window.CivicationPsyche?.clearRoleBaseline?.();
      return;
    }

    const merits =
      JSON.parse(
        localStorage.getItem("merits_by_category") || "{}"
      );

    const points =
      Number(merits[active.career_id]?.points || 0);

    const badge =
      window.BADGES?.find(
        b => b.id === active.career_id
      );

    const tier =
      badge
        ? deriveTierFromPoints(badge, points)
        : { tierIndex: 0 };

    // Du hadde tier, men baseline var fast 0/0/0.
    // Jeg beholder det 1:1 (ingen endring i atferd).
    const baseline = {
      integrity: 0,
      visibility: 0,
      economicRoom: 0
    };

    window.CivicationPsyche?.applyRoleBaseline?.(
      baseline
    );
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
        setActivePosition({
          ...active,
          role_key: rk
        });
      }
      this.resetForNewJob(rk);
    }

    return rk;
  }

  // ============================================================
  // PULSE GATING (behold LS_PULSE separat)
  // ============================================================

  canPulseNow() {
    const slot = getPulseSlot();
    const t = todayKey();
    const p = lsGet(
      LS_PULSE,
      { date: t, seen: {} }
    );

    if (!p || p.date !== t) {
      lsSet(
        LS_PULSE,
        { date: t, seen: {} }
      );
      return true;
    }

    const seen = p.seen || {};
    return !seen[slot];
  }

  markPulseUsed() {
    const slot = getPulseSlot();
    const t = todayKey();
    const p = lsGet(
      LS_PULSE,
      { date: t, seen: {} }
    );

    const seen = p.seen || {};
    seen[slot] = true;

    lsSet(LS_PULSE, { date: t, seen });
  }

  // ============================================================
  // PACK LOADING
  // ============================================================

  async loadPack(packFile) {

    if (!packFile) return null;

    if (this.packsCache.has(packFile))
      return this.packsCache.get(packFile);

    const url =
      `${this.packBasePath}/${packFile}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const pack = await res.json();
    this.packsCache.set(packFile, pack);
    return pack;
  }

  // ============================================================
  // EVENT SELECTION (1:1 bevart)
  // ============================================================

  pickEventFromPack(pack, state) {

    if (!pack || !Array.isArray(pack.mails)) {
      return null;
    }

    const consumed = state && state.consumed
      ? state.consumed
      : {};

    // Beholder autonomy-beregningen (selv om den ikke brukes videre)
    const autonomy =
      window.CivicationPsyche &&
      typeof window.CivicationPsyche.getAutonomy === "function"
        ? window.CivicationPsyche.getAutonomy(state.active_role_key)
        : 50;

    const stability = state.stability;

    const wantWarningMail =
      (stability === "WARNING" && state.warning_used === true);

    // --- Filter ---
    let candidates = pack.mails.filter(function (m) {
      return m && m.id && !consumed[m.id];
    });

    candidates = candidates.filter(function (m) {
      return m.stage !== "fired" && m.stage !== "unemployed";
    });

    if (stability === "STABLE") {
      candidates = candidates.filter(function (m) {
        return m.stage === "stable" ||
               m.stage === "stable_warning";
      });
    }

    if (stability === "WARNING") {
      candidates = candidates.filter(function (m) {
        return m.stage === "warning" ||
               m.stage === "warning_danger" ||
               m.stage === "stable_warning";
      });
    }

    if (wantWarningMail) {
      const warn = candidates.find(function (m) {
        return m.is_warning_mail === true;
      });
      if (warn) return warn;
    }

    // --- Score ---
    function scoreMail(m) {

      let score = 0;

      const identityTags =
        Array.isArray(state.identity_tags)
          ? state.identity_tags
          : [];

      const tracks =
        Array.isArray(state.tracks)
          ? state.tracks
          : [];

      const gating =
        (m && m.gating)
          ? m.gating
          : {};

      if (Array.isArray(gating.avoid_tags)) {
        for (let i = 0; i < gating.avoid_tags.length; i++) {
          const t = gating.avoid_tags[i];
          if (identityTags.indexOf(t) !== -1) {
            return -1000;
          }
        }
      }

      if (Array.isArray(gating.prefer_tags)) {
        for (let i = 0; i < gating.prefer_tags.length; i++) {
          const t = gating.prefer_tags[i];
          if (identityTags.indexOf(t) !== -1) {
            score += 2;
          }
        }
      }

      if (Array.isArray(gating.prefer_tracks)) {
        for (let i = 0; i < gating.prefer_tracks.length; i++) {
          const tr = gating.prefer_tracks[i];
          if (tracks.indexOf(tr) !== -1) {
            score += 3;
          }
        }
      }

      return score;
    }

    candidates.sort(function (a, b) {
      return scoreMail(b) - scoreMail(a);
    });

    return candidates.length ? candidates[0] : null;
  }

  // ============================================================
  // FALLBACK EVENTS (1:1 bevart)
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
