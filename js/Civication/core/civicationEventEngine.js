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

    this.state = opts.state || window.HG_STATE || {};

    this.state.career = this.state.career || {
      activeJob: null,
      obligations: [],
      reputation: 70,
      salaryModifier: 1
    };

    this.packBasePath = opts.packBasePath || "data/Civication";

    this.maxInbox =
      Number.isFinite(opts.maxInbox) ? opts.maxInbox : 1;

    this.pulseLimitPerDay = 3;

    this.packsCache = new Map();

this.packMap = opts.packMap || {
  naering: "naeringsliv/naeringslivCivic.json",
  naeringsliv: "naeringsliv/naeringslivCivic.json",
  media: "mediaCivic.json",
  by: "byCivic.json"
};

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
      track_progress: {},
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
    if (!Array.isArray(inbox)) return null;

    return inbox.find(
      m => m && m.status === "pending"
    ) || null;
  }

  // -------- role_key resolution --------

  resolveRoleKey() {
    const active = window.CivicationState.getActivePosition();
    if (!active) return null;

    if (active.role_key) {
      return String(active.role_key);
    }

    const t = slugify(active.title || "");
    if (t) return t;

    if (active.career_id) {
      return String(active.career_id);
    }

    return null;
  }

  syncRoleBaselineFromActive() {
    const active = window.CivicationState.getActivePosition();

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
    const active = window.CivicationState.getActivePosition();

    if (!active) {
      this.setState({ active_role_key: null });
      return null;
    }

    const rk = this.resolveRoleKey();
    const st = this.getState();

    if (rk && rk !== st.active_role_key) {
      if (!active?.role_key) {
        window.CivicationState.setActivePosition({
          ...active,
          role_key: rk
        });
      }

      this.resetForNewJob(rk);
    }

    return rk;
  }

  // -------- pulse gating --------

  getPulseSlot() {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 8) return "morning";
    if (hour < 16) return "day";
    return "evening";
  }

  todayKey() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  canPulseNow() {
    const slot = this.getPulseSlot();
    const t = this.todayKey();
    const p = window.CivicationState.getPulse();

    if (!p || p.date !== t) {
      window.CivicationState.setPulse({ date: t, seen: {} });
      return true;
    }

    const seen = p.seen || {};
    return !seen[slot];
  }

  markPulseUsed() {
    const slot = this.getPulseSlot();
    const t = this.todayKey();
    const p = window.CivicationState.getPulse();

    const seen = p.seen || {};
    seen[slot] = true;

    window.CivicationState.setPulse({ date: t, seen });
  }

  // -------- pack loading --------

  async loadPack(packFile) {
    if (!packFile) return null;

    if (this.packsCache.has(packFile)) {
      return this.packsCache.get(packFile);
    }

    const url =
      `${this.packBasePath}/${packFile}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const pack = await res.json();
    this.packsCache.set(packFile, pack);
    return pack;
  }

async buildMailPool(active, state, role_key) {
  const packFile = this.resolvePackFile(active, role_key);
  const pack = await this.loadPack(packFile);

  const packMails = Array.isArray(pack?.mails) ? pack.mails : [];

  const roleMails =
    await window.CiviRoleStoryletBridge?.makeCandidateMailsForActiveRole?.(
      active,
      state
    ) || [];

  return {
    role: pack?.role || active?.career_id || null,
    tag_rules: pack?.tag_rules || {
      max_tags_per_choice: 2,
      memory_window: 12
    },
    tracks: Array.isArray(pack?.tracks) ? pack.tracks : [],
    mails: [...packMails, ...roleMails]
  };
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
      (stability === "WARNING" && state.warning_used !== true);

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

      const trackProgress =
        (state && state.track_progress && typeof state.track_progress === "object")
          ? state.track_progress
          : {};

      const storyState =
        (state && state.story_state && typeof state.story_state === "object")
          ? state.story_state
          : { story_flags: [], story_tags: [] };

      const storyFlags = Array.isArray(storyState.story_flags)
        ? storyState.story_flags
        : [];

      const storyTags = Array.isArray(storyState.story_tags)
        ? storyState.story_tags
        : [];

      if (Array.isArray(gating.require_tags)) {
        for (let i = 0; i < gating.require_tags.length; i++) {
          const t = gating.require_tags[i];
          if (identityTags.indexOf(t) === -1) return -1000;
        }
      }

      if (Array.isArray(gating.require_story_flags)) {
        for (let i = 0; i < gating.require_story_flags.length; i++) {
          const f = gating.require_story_flags[i];
          if (storyFlags.indexOf(f) === -1) return -1000;
        }
      }

      if (Array.isArray(gating.avoid_story_flags)) {
        for (let i = 0; i < gating.avoid_story_flags.length; i++) {
          const f = gating.avoid_story_flags[i];
          if (storyFlags.indexOf(f) !== -1) return -1000;
        }
      }

      if (Array.isArray(gating.prefer_story_flags)) {
        for (let i = 0; i < gating.prefer_story_flags.length; i++) {
          const f = gating.prefer_story_flags[i];
          if (storyFlags.indexOf(f) !== -1) {
            score += 4;
          }
        }
      }

      if (Array.isArray(gating.prefer_story_tags)) {
        for (let i = 0; i < gating.prefer_story_tags.length; i++) {
          const t = gating.prefer_story_tags[i];
          if (storyTags.indexOf(t) !== -1) {
            score += 2;
          }
        }
      }

      if (Array.isArray(gating.require_tracks)) {
        for (let i = 0; i < gating.require_tracks.length; i++) {
          const tr = gating.require_tracks[i];
          if (tracks.indexOf(tr) === -1) return -1000;
        }
      }

      if (gating.require_track_step_min && typeof gating.require_track_step_min === "object") {
        for (const tr in gating.require_track_step_min) {
          const need = Number(gating.require_track_step_min[tr] || 0);
          const have = Number(trackProgress[tr] || 0);
          if (Number.isFinite(need) && have < need) return -1000;
        }
      }

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

  // -------- warning / fired system mails --------

  makeFiredEvent(role_key, ctx = {}) {
    const title =
      String(ctx.title || ctx.career_name || "Stilling").trim() ||
      "Stilling";

    const expected = Number(ctx.expectedCount || 0);
    const answered = Number(ctx.answeredCount || 0);

    const pct =
      Number.isFinite(Number(ctx.completionPercent))
        ? Number(ctx.completionPercent)
        : Math.max(
            0,
            Math.min(100, Math.round(Number(ctx.completionRate || 0) * 100))
          );

    const situation = [
      `Arbeidsforholdet knyttet til ${title} er avsluttet.`
    ];

    if (expected > 0) {
      situation.push(
        `Du fullførte ${answered} av ${expected} oppgaver (${pct} %).`
      );
    } else {
      situation.push("Aktiviteten din har vært for lav over tid.");
    }

    situation.push("Tilgangen stenges med umiddelbar virkning.");

    return {
      id: `${role_key || slugify(title) || "job"}_fired_${Date.now()}`,
      stage: "fired",
      source: "System",
      subject: `Oppsigelse: ${title}`,
      situation: situation,
      choices: [
        {
          id: "A",
          label: "Registrer og gå videre",
          effect: 0,
          feedback: "Arbeidsforholdet er avsluttet."
        }
      ],
      effect: "job_lost",
      feedback: "Arbeidsforholdet er avsluttet."
    };
  }

  makeWarningEvent(ctx = {}) {
    const title =
      String(ctx.title || ctx.career_name || "Stilling").trim() ||
      "Stilling";

    const expected = Number(ctx.expectedCount || 0);
    const answered = Number(ctx.answeredCount || 0);

    const pct =
      Number.isFinite(Number(ctx.completionPercent))
        ? Number(ctx.completionPercent)
        : Math.max(
            0,
            Math.min(100, Math.round(Number(ctx.completionRate || 0) * 100))
          );

    const daysLeft = Math.max(0, Number(ctx.daysLeft || 0));

    const situation = [
      `Du står i fare for å miste stillingen: ${title}.`
    ];

    if (expected > 0) {
      situation.push(
        `Du har fullført ${answered} av ${expected} oppgaver (${pct} %).`
      );
    } else {
      situation.push("Aktiviteten din er for lav i denne perioden.");
    }

    if (daysLeft > 0) {
      situation.push(
        `Du har ${daysLeft} dager på å hente deg inn før stillingen kan ryke.`
      );
    } else {
      situation.push("Du må hente deg inn umiddelbart.");
    }

    return {
      id: `${ctx.role_key || slugify(title) || "job"}_warning_${Date.now()}`,
      stage: "warning",
      source: "System",
      is_warning_mail: true,
      subject: `Advarsel: ${title}`,
      situation: situation,
      choices: [
        {
          id: "A",
          label: "Registrer advarselen og ta tak i det nå",
          effect: 0,
          tags: ["process", "legitimacy"],
          feedback: "Advarselen er registrert. Nå må du faktisk levere."
        }
      ],
      feedback: "Advarselen er registrert."
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

  getCareerRules(careerId) {
    const list = Array.isArray(window.HG_CAREERS)
      ? window.HG_CAREERS
      : Array.isArray(window.HG_CAREERS?.careers)
        ? window.HG_CAREERS.careers
        : [];

    return list.find(c =>
      c && String(c.career_id || "").trim() === String(careerId || "").trim()
    ) || null;
  }

  buildGenericChoices(stage) {
    if (stage === "warning" || stage === "warning_danger") {
      return [
        {
          id: "A",
          label: "Lag en ryddig plan og forankre den",
          effect: 1,
          tags: ["process", "legitimacy"],
          feedback: "Du skaper struktur rundt saken. Det roer systemet."
        },
        {
          id: "B",
          label: "Løs det raskt og hold det i gang",
          effect: 0,
          tags: ["shortcut", "visibility"],
          feedback: "Det går videre. Du vet at det er skjørt."
        },
        {
          id: "C",
          label: "Skyv det litt foran deg",
          effect: -1,
          tags: ["avoidance", "laziness"],
          feedback: "Du kjøper tid. Tid er ikke alltid gratis."
        }
      ];
    }

    return [
      {
        id: "A",
        label: "Lag en ryddig plan og dokumenter",
        effect: 1,
        tags: ["process", "craft"],
        feedback: "Det blir ryddigere. Ingen jubler, men det virker."
      },
      {
        id: "B",
        label: "Løs det raskt og send videre",
        effect: 0,
        tags: ["shortcut", "visibility"],
        feedback: "Det fungerer nå. Du vet ikke om det holder lenge."
      },
      {
        id: "C",
        label: "La det ligge litt",
        effect: -1,
        tags: ["avoidance", "laziness"],
        feedback: "Det blir stille. Det er sjelden et godt tegn."
      }
    ];
  }

  makeGenericCareerEvent(active, state, reason) {
    const careerId = String(active?.career_id || "").trim();
    const title = String(active?.title || "Rolle").trim() || "Rolle";
    const career = this.getCareerRules(careerId);
    const stability = String(state?.stability || "STABLE").toUpperCase();

    let stage = "stable";
    if (stability === "WARNING") stage = "warning";
    if (stability === "FIRED") stage = "warning_danger";

    const diegetic = career?.diegetic_text || {};
    const intro = Array.isArray(diegetic.offer) ? diegetic.offer[0] : "";
    const warn = Array.isArray(diegetic.maintenance_warning)
      ? diegetic.maintenance_warning[0]
      : "";

    const subject =
      stage === "warning" || stage === "warning_danger"
        ? `${title}: situasjonen må avklares`
        : `${title}: ny arbeidsoppgave`;

    const tail =
      reason === "job_accepted"
        ? "Dette er den første meldingen i rollen din."
        : "Denne rollen har ikke egen mailpack ennå, så Civication lager en generisk jobbmail.";

    const situation =
      stage === "warning" || stage === "warning_danger"
        ? [
            warn || "Det er friksjon rundt arbeidet ditt.",
            "Du må velge hvordan du håndterer situasjonen.",
            tail
          ]
        : [
            intro || "Du får en ny oppgave i rollen din.",
            "Hvordan du løser den former rollen videre.",
            tail
          ];

    return {
      id: `generic_${careerId || slugify(title)}_${stage}_${Date.now()}`,
      stage,
      source: "Civication",
      subject,
      situation,
      mail_tags: ["generic", careerId || "career", reason || "fallback"],
      choices: this.buildGenericChoices(stage),
      __pack: {
        role: careerId || null,
        tag_rules: {
          max_tags_per_choice: 2,
          memory_window: 12
        },
        tracks: []
      }
    };
  }

  decorateWorkMail(eventObj, active, reason) {
    if (!eventObj || !active) return eventObj;

    const stage = String(eventObj.stage || "").trim().toLowerCase();
    if (stage === "warning" || stage === "fired" || stage === "unemployed") {
      return eventObj;
    }

    try {
      window.CivicationCalendar?.ensureShiftForActiveJob?.(active);
    } catch (e) {
      console.warn("Calendar ensure shift failed", e);
    }

    const durationMinutes = Math.max(
      10,
      Number(eventObj.work_minutes || eventObj.duration_minutes || 45)
    );

    const windowInfo =
      window.CivicationCalendar?.getWindow?.(durationMinutes) || null;

    const task =
      window.CivicationTaskEngine?.ensureTaskForMail?.(
        eventObj,
        active,
        { windowInfo, reason }
      ) || null;

    return Object.assign({}, eventObj, {
      task_id: task?.id || eventObj.task_id || null,
      work_minutes: durationMinutes,
      work_window: windowInfo,
      brand_id:
        String(active?.brand_id || "").trim() ||
        eventObj.brand_id ||
        null,
      brand_name:
        String(active?.brand_name || "").trim() ||
        eventObj.brand_name ||
        null,
      calendar_label: windowInfo
        ? `${windowInfo.startsAtLabel}–${windowInfo.deadlineAtLabel}`
        : null
    });
  }

  async ensureStoryState() {
    try {
      if (window.CiviStoryResolver?.refresh) {
        return await window.CiviStoryResolver.refresh();
      }
    } catch (e) {
      console.warn("Story resolver failed", e);
    }

    return {
      generated_at: null,
      snapshot: null,
      story_flags: [],
      story_tags: [],
      threads: []
    };
  }

  resolvePackFile(active, role_key) {
    const careerId = String(active?.career_id || "").trim();
    const brandId = String(active?.brand_id || "").trim();

    if (brandId) {
      return `brand/${brandId}Civic.json`;
    }

    return (this.packMap && this.packMap[careerId])
      ? this.packMap[careerId]
      : (careerId
          ? `${careerId}Civic.json`
          : (String(role_key || "") + ".json"));
  }

  // -------- main entrypoint --------

  async onAppOpen(opts = {}) {
    const force = opts && opts.force === true;

    try {
      window.CivicationEconomyEngine?.tickWeekly?.();

      try {
        if (
          window.CivicationPsyche &&
          typeof window.CivicationPsyche.checkBurnout === "function"
        ) {
          window.CivicationPsyche.checkBurnout();
        }
      } catch (e) {
        console.warn("Burnout check failed", e);
      }

    } catch (e) {
      console.warn("Salary tick failed", e);
    }

    const role_key = this.ensureRoleKeySynced();

    let obligationEval = { ok: false, reason: "not_checked" };

    try {
      obligationEval =
        window.CivicationObligationEngine?.evaluate?.() ||
        { ok: false, reason: "no_engine" };
    } catch (e) {
      console.warn("Obligation evaluate failed", e);
    }

    const active = window.CivicationState.getActivePosition();

    try {
      if (active) {
        window.CivicationObligationEngine?.registerLogin?.();
      }
    } catch (e) {
      console.warn("Login registration failed", e);
    }

    const state = this.getState();

    const resolvedStoryState = await this.ensureStoryState();

    this.setState({
      story_state: resolvedStoryState
    });

    const stateWithStory = this.getState();

    this.syncRoleBaselineFromActive();

    if (this.getPendingEvent()) {
      return { enqueued: false, reason: "pending_exists" };
    }

    if (obligationEval?.shouldEnqueueFired) {
      const firedEv = this.makeFiredEvent(
        obligationEval?.mailContext?.role_key,
        obligationEval?.mailContext || {}
      );

      this.enqueueEvent(firedEv);

      if (!force) {
        this.markPulseUsed();
      }

      window.dispatchEvent(new Event("updateProfile"));

      return {
        enqueued: true,
        type: "fired",
        event: firedEv
      };
    }

    if (obligationEval?.shouldEnqueueWarning) {
      const warningEv = this.makeWarningEvent(
        obligationEval?.mailContext || {}
      );

      this.enqueueEvent(warningEv);
      this.setState({ warning_used: true });

      if (!force) {
        this.markPulseUsed();
      }

      window.dispatchEvent(new Event("updateProfile"));

      return {
        enqueued: true,
        type: "warning",
        event: warningEv
      };
    }

    if (!force && !this.canPulseNow()) {
      return { enqueued: false, reason: "pulse_used" };
    }

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

      this.markPulseUsed();
      return { enqueued: false, reason: "unemployed_pre_nav" };
    }

    const pack = await this.buildMailPool(active, stateWithStory, role_key);

if (!pack || !Array.isArray(pack.mails) || !pack.mails.length) {
  const generic = this.makeGenericCareerEvent(
    active,
    state,
    force ? "job_accepted" : "missing_pack"
  );

  const decorated = this.decorateWorkMail(
    generic,
    active,
    force ? "job_accepted" : "missing_pack"
  );

  this.enqueueEvent(decorated);

  if (!force) {
    this.markPulseUsed();
  }

  return {
    enqueued: true,
    type: "generic",
    reason: "missing_pack",
    event: decorated
  };
}

const chosen = this.pickEventFromPack(pack, stateWithStory);

if (!chosen) {
  const generic = this.makeGenericCareerEvent(
    active,
    state,
    force ? "job_accepted" : "no_candidates"
  );

  const decorated = this.decorateWorkMail(
    generic,
    active,
    force ? "job_accepted" : "no_candidates"
  );

  this.enqueueEvent(decorated);

  if (!force) {
    this.markPulseUsed();
  }

  return {
    enqueued: true,
    type: "generic",
    reason: "no_candidates",
    event: decorated
  };
}

    const chosenWithMeta = Object.assign({}, chosen, {
      __pack: {
        role: pack?.role || null,
        tag_rules: pack?.tag_rules || null,
        tracks: Array.isArray(pack?.tracks) ? pack.tracks : []
      }
    });

    const decoratedChosen = this.decorateWorkMail(
      chosenWithMeta,
      active,
      force ? "job_accepted" : "scheduled"
    );

    this.enqueueEvent(decoratedChosen);

    if (!force) {
      this.markPulseUsed();
    }

    return {
      enqueued: true,
      type: "job",
      event: decoratedChosen
    };
  }

  async enqueueImmediateFollowupEvent() {
    if (this.getPendingEvent()) {
      return { enqueued: false, reason: "pending_exists" };
    }

    const active = window.CivicationState.getActivePosition();
    if (!active) {
      return { enqueued: false, reason: "no_active_job" };
    }

    const role_key = this.ensureRoleKeySynced();
    const state = this.getState();
    const pack = await this.buildMailPool(active, state, role_key);

    if (!pack || !Array.isArray(pack.mails) || !pack.mails.length) {
      const generic = this.makeGenericCareerEvent(
        active,
        state,
        "followup_missing_pack"
      );

      const decorated = this.decorateWorkMail(
        generic,
        active,
        "followup_missing_pack"
      );

      this.enqueueEvent(decorated);
      window.dispatchEvent(new Event("updateProfile"));

      return {
        enqueued: true,
        type: "generic",
        reason: "missing_pack",
        event: decorated
      };
    }

    const chosen = this.pickEventFromPack(pack, state);

    if (!chosen) {
      const generic = this.makeGenericCareerEvent(
        active,
        state,
        "followup_no_candidates"
      );

      const decorated = this.decorateWorkMail(
        generic,
        active,
        "followup_no_candidates"
      );

      this.enqueueEvent(decorated);
      window.dispatchEvent(new Event("updateProfile"));

      return {
        enqueued: true,
        type: "generic",
        reason: "no_candidates",
        event: decorated
      };
    }

    const chosenWithMeta = Object.assign({}, chosen, {
      __pack: {
        role: pack?.role || null,
        tag_rules: pack?.tag_rules || null,
        tracks: Array.isArray(pack?.tracks) ? pack.tracks : []
      }
    });

    const decoratedChosen = this.decorateWorkMail(
      chosenWithMeta,
      active,
      "followup"
    );

    this.enqueueEvent(decoratedChosen);
    window.dispatchEvent(new Event("updateProfile"));

    return {
      enqueued: true,
      type: "job",
      event: decoratedChosen
    };
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

getStoredTaskResult(taskId) {
  if (!taskId) return null;

  try {
    const raw = JSON.parse(
      localStorage.getItem("hg_civi_task_results_v1") || "{}"
    );

    return raw && typeof raw === "object"
      ? (raw[taskId] || null)
      : null;
  } catch {
    return null;
  }
}

getTaskResultModifier(ev) {
  const interaction = ev?.task_payload?.interaction || null;

  // Ingen interaktiv oppgave => ingen modifikator
  if (!interaction) {
    return {
      delta: 0,
      state: "none",
      feedbackSuffix: ""
    };
  }

  const taskId = String(ev?.task_id || "").trim();
  const result = this.getStoredTaskResult(taskId);

  // Oppgaven finnes, men kunnskapsdelen er ikke gjort
  if (!result || !result.selected) {
    return {
      delta: -1,
      state: "not_done",
      feedbackSuffix: "Du svarte uten å fullføre kunnskapsdelen først."
    };
  }

  if (result.correct === true) {
    return {
      delta: 1,
      state: "passed",
      feedbackSuffix: "Du hadde også løst kunnskapsdelen riktig."
    };
  }

  if (result.correct === false) {
    return {
      delta: -1,
      state: "failed",
      feedbackSuffix: "Kunnskapsdelen ble ikke løst riktig."
    };
  }

  return {
    delta: 0,
    state: "unknown",
    feedbackSuffix: ""
  };
}
  
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
let taskMod = {
  delta: 0,
  state: "none",
  feedbackSuffix: ""
};

if (Array.isArray(ev.choices) && ev.choices.length) {
  choice = ev.choices.find(function (c) {
    return c && c.id === choiceId;
  });

  if (!choice) {
    return { ok: false, reason: "bad_choice" };
  }

  if (choice.moral_flag === true) {
    const active = window.CivicationState.getActivePosition();
    if (active && active.career_id &&
        window.CivicationPsyche &&
        typeof window.CivicationPsyche.registerCollapse === "function") {
      window.CivicationPsyche.registerCollapse(active.career_id, "moral");
    }
  }

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

  taskMod = this.getTaskResultModifier(ev);
  effect += Number(taskMod.delta || 0);

  if (taskMod.feedbackSuffix) {
    feedback = feedback
      ? `${feedback} ${taskMod.feedbackSuffix}`
      : taskMod.feedbackSuffix;
  }
}

    const packMeta = (ev && ev.__pack) ? ev.__pack : {};
    const tagRules = packMeta.tag_rules || {};
    const packTracks = Array.isArray(packMeta.tracks) ? packMeta.tracks : [];

    const maxTagsPerChoice = Number(tagRules.max_tags_per_choice || 2);
    const memoryWindow = Number(tagRules.memory_window || 12);

    const chosenTags =
      Array.isArray(choice?.tags) ? choice.tags : [];

    (function applyIdentityTags() {
      const cur = Array.isArray(state.identity_tags) ? state.identity_tags : [];

      if (!chosenTags.length) {
        state.__next_identity_tags = cur;
        return;
      }

      const next = [];

      for (let i = 0; i < chosenTags.length && next.length < maxTagsPerChoice; i++) {
        const t = String(chosenTags[i] || "").trim();
        if (t && next.indexOf(t) === -1) next.push(t);
      }

      for (let i = 0; i < cur.length && next.length < memoryWindow; i++) {
        const t = String(cur[i] || "").trim();
        if (t && next.indexOf(t) === -1) next.push(t);
      }

      state.__next_identity_tags = next;
    })();

    (function applyTracks() {
      const curTracks = Array.isArray(state.tracks) ? state.tracks : [];
      const curProg =
        (state.track_progress && typeof state.track_progress === "object")
          ? state.track_progress
          : {};

      if (!chosenTags.length) {
        state.__next_tracks = curTracks;
        state.__next_track_progress = curProg;
        return;
      }

      let bestId = null;
      let bestScore = 0;

      for (let i = 0; i < packTracks.length; i++) {
        const tr = packTracks[i];
        const id = String(tr?.id || "").trim();
        if (!id) continue;

        const w = (tr && tr.tag_weights && typeof tr.tag_weights === "object")
          ? tr.tag_weights
          : {};

        let score = 0;
        for (let k = 0; k < chosenTags.length; k++) {
          const tag = String(chosenTags[k] || "").trim();
          if (!tag) continue;
          score += Number(w[tag] || 0);
        }

        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      }

      if (!bestId || bestScore <= 0) {
        state.__next_tracks = curTracks;
        state.__next_track_progress = curProg;
        return;
      }

      const nextProg = Object.assign({}, curProg);
      nextProg[bestId] = Number(nextProg[bestId] || 0) + 1;

      const nextTracks = curTracks.filter(x => x !== bestId);
      nextTracks.unshift(bestId);

      state.__next_tracks = nextTracks.slice(0, 10);
      state.__next_track_progress = nextProg;
    })();

    (function applySystemEffects() {
      if (!chosenTags.length) return;

      const active = window.CivicationState.getActivePosition();
      const careerId = String(active?.career_id || "").trim();

      let dIntegrity = 0;
      let dVisibility = 0;
      let dEconomicRoom = 0;
      let dTrust = 0;

      for (let i = 0; i < chosenTags.length; i++) {
        const t = String(chosenTags[i] || "").trim();
        if (!t) continue;

        if (t === "process") { dIntegrity += 2; dVisibility -= 1; dTrust += 1; }
        if (t === "legitimacy") { dIntegrity += 1; dTrust += 2; }
        if (t === "craft") { dIntegrity += 1; }
        if (t === "shortcut") { dIntegrity -= 1; dVisibility += 1; dEconomicRoom += 1; dTrust -= 1; }
        if (t === "opportunism") { dVisibility += 1; dTrust -= 1; }
        if (t === "risk") { dIntegrity -= 2; dVisibility += 2; dTrust -= 2; }
        if (t === "avoidance") { dIntegrity -= 1; dVisibility -= 1; }
        if (t === "laziness") { dIntegrity -= 2; dTrust -= 1; }
      }

      const eff = (choice && choice.effects && typeof choice.effects === "object") ? choice.effects : null;
      const psyche = eff?.psyche || null;

      if (psyche) {
        dIntegrity += Number(psyche.integrity || 0);
        dVisibility += Number(psyche.visibility || 0);
        dEconomicRoom += Number(psyche.economicRoom || 0);
        dTrust += Number(psyche.trust || 0);
      }

      if (window.CivicationPsyche?.updateIntegrity && dIntegrity) window.CivicationPsyche.updateIntegrity(dIntegrity);
      if (window.CivicationPsyche?.updateVisibility && dVisibility) window.CivicationPsyche.updateVisibility(dVisibility);
      if (window.CivicationPsyche?.updateEconomicRoom && dEconomicRoom) window.CivicationPsyche.updateEconomicRoom(dEconomicRoom);

      if (careerId && window.CivicationPsyche?.updateTrust && dTrust) {
        window.CivicationPsyche.updateTrust(careerId, dTrust);
      }

      const idShift = eff?.identity_shift;
      if (idShift && window.HG_IdentityCore?.shiftFocus) {
        for (const k in idShift) {
          const n = Number(idShift[k] || 0);
          if (Number.isFinite(n) && n !== 0) window.HG_IdentityCore.shiftFocus(k, n);
        }
      }

      const capDelta = eff?.capital;
      if (capDelta && typeof capDelta === "object") {
        try {
          const cur = JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");
          const next = Object.assign({}, cur);

          for (const k in capDelta) {
            const add = Number(capDelta[k] || 0);
            if (!Number.isFinite(add)) continue;
            next[k] = Number(next[k] || 0) + add;
          }

          localStorage.setItem("hg_capital_v1", JSON.stringify(next));
        } catch (e) {}
      }
    })();

    const consumed = Object.assign({}, state.consumed || {});
    consumed[ev.id] = true;

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

    let warning_used = state.warning_used === true;

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
      warning_used: warning_used,

      identity_tags: state.__next_identity_tags || state.identity_tags || [],
      tracks: state.__next_tracks || state.tracks || [],
      track_progress: state.__next_track_progress || state.track_progress || {}
    });

    try {
      window.CivicationObligationEngine?.registerEventResponse?.();
    } catch (e) {
      console.warn("Event response registration failed", e);
    }

    try {
     const completedTask =
      window.CivicationTaskEngine?.completeByMail?.(
        ev.id,
        {
         choiceId: choiceId || null,
         effect: effect,
         feedback: feedback
       }
     ) || null;

      const spentMinutes = Math.max(
       5,
       Number(
        completedTask?.durationMinutes ||
        ev?.work_minutes ||
        ev?.duration_minutes ||
        45
      )
    );

    window.CivicationCalendar?.advanceByMinutes?.(spentMinutes);
  } catch (e) {
    console.warn("Task/calendar completion failed", e);
  }
    
    if (stability === "FIRED") {
      const prev = window.CivicationState.getActivePosition();
      const currentState = this.getState();
      const firedRoleKey = currentState.active_role_key;

      if (prev &&
          prev.career_id &&
          window.CivicationPsyche &&
          typeof window.CivicationPsyche.registerCollapse === "function") {
        window.CivicationPsyche.registerCollapse(prev.career_id, "fired");
      }

      if (prev) {
        window.CivicationState.appendJobHistoryEnded(prev, "fired");
      }

      window.CivicationState.setActivePosition(null);

      this.setState({
        unemployed_since_week: weekKey(new Date()),
        active_role_key: null,
        career: {
          ...(currentState.career || {}),
          activeJob: null,
          obligations: [],
          contract: null,
          progress: null
        }
      });

      const firedEv = this.makeFiredEvent(
        firedRoleKey,
        {
          title: prev?.title || prev?.career_name || "Stilling",
          career_name: prev?.career_name || "",
          role_key: firedRoleKey
        }
      );

      this.enqueueEvent(firedEv);
    }

    else if (stability === "WARNING" &&
             this.getState().warning_used !== true &&
             window.CivicationState.getActivePosition()) {

      const currentState = this.getState();
      const activeNow = window.CivicationState.getActivePosition();
      const progress = currentState?.career?.progress || {};
      const contract = currentState?.career?.contract || {};

      const warningEv = this.makeWarningEvent({
        role_key:
          currentState.active_role_key ||
          activeNow?.role_key ||
          activeNow?.career_id ||
          "job",
        title: activeNow?.title || activeNow?.career_name || "Stilling",
        career_name: activeNow?.career_name || "",
        expectedCount: Number(progress.expectedCount || 0),
        answeredCount: Number(progress.answeredCount || 0),
        completionRate: Number(progress.completionRate || 0),
        completionPercent: Math.max(
          0,
          Math.min(100, Math.round(Number(progress.completionRate || 0) * 100))
        ),
        daysLeft: Math.max(
          0,
          Number(contract.fireAfterDays || 14) -
          Math.floor(Number(progress.daysSinceStart || 0))
        )
      });

      this.enqueueEvent(warningEv);
      this.setState({ warning_used: true });
    }

    else if (window.CivicationState.getActivePosition()) {
      this.enqueueImmediateFollowupEvent().catch(function (e) {
        console.warn("Immediate follow-up mail failed", e);
      });
    }

    return {
  ok: true,
  effect: effect,
  stability: stability,
  feedback: feedback,
  taskResultState: taskMod.state
};
  }

}

window.CivicationEventEngine = CivicationEventEngine;
