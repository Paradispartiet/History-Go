function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64);
  }

function weekKey(d) {

    const base = d || new Date();

    const date = new Date(
      Date.UTC(
        base.getFullYear(),
        base.getMonth(),
        base.getDate()
      )
    );

    const dayNum = date.getUTCDay() || 7;

    date.setUTCDate(
      date.getUTCDate() + 4 - dayNum
    );

    const yearStart = new Date(
      Date.UTC(date.getUTCFullYear(), 0, 1)
    );

    const weekNo = Math.ceil(
      (((date - yearStart) / 86400000) + 1) / 7
    );

    return (
      date.getUTCFullYear() +
      "-W" +
      String(weekNo).padStart(2, "0")
    );
  }


  function weekIndexFromWeekKey(k) {

    const m = String(k || "")
      .match(/^(\d{4})-W(\d{2})$/);

    if (!m) return null;

    const y = Number(m[1]);
    const w = Number(m[2]);

    if (!Number.isFinite(y) ||
        !Number.isFinite(w)) {
      return null;
    }

    return y * 53 + w;
  }


  function weeksPassedBetweenWeekKeys(sinceW, nowW) {

    const a = weekIndexFromWeekKey(sinceW);
    const b = weekIndexFromWeekKey(nowW);

    if (a == null || b == null) return 0;

    return Math.max(0, b - a);
  }


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

  // -------- state --------

getState() {
  return window.CivicationState.getState();
}

setState(patch) {
  return window.CivicationState.setState(patch || {});
}

resetForNewJob(role_key) {
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

// -------- inbox --------

getInbox() {
  return window.CivicationState.getInbox();
}

setInbox(arr) {
  window.CivicationState.setInbox(arr);
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
  const p = window.CivicationState.getPulse();

  if (!p || p.date !== t) {
    window.CivicationState.setPulse({ date: t, seen: {} });
    return true;
  }

  const seen = p.seen || {};
  return !seen[slot];
}

  markPulseUsed() {
  const slot = getPulseSlot();
  const t = todayKey();
  const p = window.CivicationState.getPulse();

  const seen = p.seen || {};
  seen[slot] = true;

  window.CivicationState.setPulse({ date: t, seen });
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

// -------- main entrypoint --------
async onAppOpen() {

  // ----------------------------------------
  // WEEKLY SALARY TICK
  // ----------------------------------------
  try {
    CivicationEconomyEngine.tickWeekly();

    try {
      if (window.CivicationPsyche &&
          typeof window.CivicationPsyche.checkBurnout === "function") {
        window.CivicationPsyche.checkBurnout();
      }
    } catch (e) {
      console.warn("Burnout check failed", e);
    }

  } catch (e) {
    console.warn("Salary tick failed", e);
  }

  // 0) sync job/role_key
  const role_key = this.ensureRoleKeySynced();
  const active = getActivePosition();
  const state = this.getState();

  this.syncRoleBaselineFromActive();

  // 1) Hvis det allerede finnes en pending event, ikke spam
  if (this.getPendingEvent()) {
    return { enqueued: false, reason: "pending_exists" };
  }

  // 2) Pulse gating
  if (!this.canPulseNow()) {
    return { enqueued: false, reason: "pulse_used" };
  }

  // 3) Arbeidsledig => før NAV: stille / evt. “arbeidsledig”-mail,
  //    etter X uker: NAV-mail
  if (!active) {

    const st = this.getState();
    const now = new Date();

    const navAfterWeeks =
      Number(
        (window.HG_CAREERS &&
         window.HG_CAREERS.global_rules &&
         window.HG_CAREERS.global_rules.unemployment &&
         window.HG_CAREERS.global_rules.unemployment.nav_after_weeks) || 0
      );

    const nowW = weekKey(now);

    if (!st.unemployed_since_week) {
      this.setState({ unemployed_since_week: nowW });
      this.markPulseUsed();
      return { enqueued: false, reason: "unemployed_started" };
    }

    const weeksPassed =
      weeksPassedBetweenWeekKeys(st.unemployed_since_week, nowW);

    if (weeksPassed >= navAfterWeeks) {
      const nav = this.makeNavEvent();
      this.enqueueEvent(nav);
      this.markPulseUsed();
      return { enqueued: true, type: "nav", event: nav };
    }

    // Før NAV: bruk pulse uten mail (stille uke)
    this.markPulseUsed();
    return { enqueued: false, reason: "unemployed_pre_nav" };
  }

  // 4) Har jobb => velg fra pack
  const careerId = String(active.career_id || "").trim();

  const packFile =
    (this.packMap && this.packMap[careerId])
      ? this.packMap[careerId]
      : (String(role_key || "") + ".json");

  const pack = await this.loadPack(packFile);
  const chosen = this.pickEventFromPack(pack, state);

  if (!chosen) {
    // ingen passende event igjen => bare bruk pulse uten mail (stille dag)
    this.markPulseUsed();
    return { enqueued: false, reason: "no_candidates" };
  }

  this.enqueueEvent(chosen);
  this.markPulseUsed();
  return { enqueued: true, type: "job", event: chosen };
}

enqueueEvent(eventObj) {

  const inbox = this.getInbox();

  const item = {
    status: "pending",
    enqueued_at: new Date().toISOString(),
    event: eventObj
  };

  const next = [item].concat(inbox).slice(0, this.maxInbox);
  this.setInbox(next);
}

// -------- answering --------
answer(eventId, choiceId) {

  const inbox = this.getInbox();

  const idx = inbox.findIndex(function (x) {
    return x &&
           x.status === "pending" &&
           x.event &&
           x.event.id === eventId;
  });

  if (idx < 0) {
    return { ok: false, reason: "not_found" };
  }

  const item = inbox[idx];
  const ev = item.event || {};
  const state = this.getState();

  let effect = 0;
  let feedback = "";

  let choice = null;

  if (Array.isArray(ev.choices) && ev.choices.length) {

    choice = ev.choices.find(function (c) {
      return c && c.id === choiceId;
    });

    if (!choice) {
      return { ok: false, reason: "bad_choice" };
    }

    // --- MORAL COLLAPSE ---
    if (choice.moral_flag === true) {
      const active = getActivePosition();
      if (active && active.career_id &&
          window.CivicationPsyche &&
          typeof window.CivicationPsyche.registerCollapse === "function") {
        window.CivicationPsyche.registerCollapse(active.career_id, "moral");
      }
    }

    // --- Lifestyle tags ---
    try {
      const tags =
        Array.isArray(choice.tags) ? choice.tags : [];

      if (tags.length &&
          window.HG_Lifestyle &&
          typeof window.HG_Lifestyle.addTags === "function") {
        window.HG_Lifestyle.addTags(tags, "civication_choice");
      }

    } catch (e) {}

    let baseEffect = Number(choice.effect || 0);

    let autonomy = 50;
    if (window.CivicationPsyche &&
        typeof window.CivicationPsyche.getAutonomy === "function") {
      autonomy = window.CivicationPsyche.getAutonomy(state.active_role_key);
    }

    if (baseEffect < 0 && autonomy < 30) {
      baseEffect = baseEffect * 1.5;
    }

    if (baseEffect < 0 && autonomy > 70) {
      baseEffect = baseEffect * 0.7;
    }

    effect = Math.round(baseEffect);
    feedback = String(choice.feedback || "");
  }

  // -------- mark consumed --------

  const consumed = Object.assign({}, state.consumed || {});
  consumed[ev.id] = true;

  // -------- score logic --------

  let score = Number(state.score || 0) + effect;

  if (score > 2) score = 2;
  if (score < -5) score = -5;

  let strikes = Number(state.strikes || 0);
  let stability = state.stability;

  if (score <= -2) {

    strikes += 1;
    score = 0;

    if (strikes === 1) {
      stability = "WARNING";
    } else if (strikes >= 2) {
      stability = "FIRED";
    }

  } else {

    if (stability === "WARNING" && effect > 0) {
      stability = "STABLE";
    }
  }

  let warning_used = state.warning_used;
  if (stability === "WARNING") {
    warning_used = true;
  }

  // -------- resolve inbox item --------

  inbox[idx] = Object.assign({}, item, {
    status: "resolved",
    resolved_at: new Date().toISOString(),
    chosen: choiceId || null,
    effect: effect,
    feedback: feedback
  });

  this.setInbox(inbox);
  this.setState({
    consumed: consumed,
    score: score,
    strikes: strikes,
    stability: stability,
    warning_used: warning_used
  });

  // -------- FIRED handling --------

  if (stability === "FIRED") {

    const prev = getActivePosition();

    if (prev &&
        prev.career_id &&
        window.CivicationPsyche &&
        typeof window.CivicationPsyche.registerCollapse === "function") {

      window.CivicationPsyche.registerCollapse(prev.career_id, "fired");
    }

    appendJobHistoryEnded(prev, "fired");
    setActivePosition(null);

    this.setState({
      unemployed_since_week: weekKey(new Date())
    });

    const firedEv =
      this.makeFiredEvent(this.getState().active_role_key);

    this.enqueueEvent(firedEv);
  }

  return {
    ok: true,
    effect: effect,
    stability: stability
  };

} // ← lukker answer()

} // ← lukker class CivicationEventEngine

window.CivicationEventEngine = CivicationEventEngine;
