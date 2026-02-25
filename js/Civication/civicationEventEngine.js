// ============================================================
// CivicationEventEngine
// ============================================================

class CivicationEventEngine {

  constructor(opts = {}) {

    // 1️⃣ Hent state først
    this.state = opts.state || window.HG_STATE || {};

    // 2️⃣ Initialiser career hvis den mangler
    this.state.career = this.state.career || {
      activeJob: null,
      obligations: [],
      reputation: 70,
      salaryModifier: 1
    };

    // 3️⃣ Resten av dine innstillinger
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
}
  // -------- state --------

  getState() {
    const s = lsGet(LS_STATE, null);
    return { ...DEFAULTS, ...(s || {}) };
  }

  setState(patch) {
    const s = this.getState();
    const next = { ...s, ...(patch || {}) };
    lsSet(LS_STATE, next);
    return next;
  }

  resetForNewJob(role_key) {
    const rk = role_key || null;
    lsSet(LS_STATE, {
      ...DEFAULTS,
      active_role_key: rk,
      consumed: {}
    });
  }

  // -------- inbox --------

  getInbox() {
    const raw = lsGet(LS_INBOX, []);
    return Array.isArray(raw) ? raw : [];
  }

  setInbox(arr) {
    lsSet(LS_INBOX, Array.isArray(arr) ? arr : []);
  }

  getPendingEvent() {
    const inbox = this.getInbox();
    return inbox.find(
      m => m && m.status === "pending"
    ) || null;
  }

  // -------- role_key resolution --------

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

  // -------- pulse gating --------

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

  // -------- pack loading --------

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

// -------- event selection --------
pickEventFromPack(pack, state) {

  if (!pack || !Array.isArray(pack.mails)) {
    return null;
  }

  const consumed = state && state.consumed
    ? state.consumed
    : {};

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


// -------- fired fallback --------
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


// -------- NAV fallback --------
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
