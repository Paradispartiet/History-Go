/* ============================================================
   Civication Event Engine v0.1
   - Ingen UI
   - Ingen quiz-logikk
   - Hendelsesbasert, ingen tidspress
   - Maks 3 pulser per dag (morgen/middag/kveld) når app åpnes
   ============================================================ */

(function () {
  const LS_STATE = "hg_civi_state_v1";
  const LS_INBOX = "hg_civi_inbox_v1";
  const LS_PULSE = "hg_civi_pulse_v1";

  const LS_ACTIVE_POS = "hg_active_position_v1";
  const LS_JOB_HISTORY = "hg_job_history_v1";

  const DEFAULTS = {
    stability: "STABLE",        // STABLE | WARNING | FIRED
    warning_used: false,        // om advarsel allerede er gitt i denne jobbperioden
    strikes: 0,                 // 0, 1, 2 (2 => FIRED)
    score: 0,                   // intern buffer (-2 => strike). Ikke vis i UI.
    active_role_key: null,      // f.eks "journalist"
    consumed: {},               // { eventId: true }
    // --- identitet ---
    identity_tags: [],
    tracks: [],

     // --- meta ---
     unemployed_since_week: null,
     version: 1
     };

  function todayKey() {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function getPulseSlot(now = new Date()) {
    const h = now.getHours();
    if (h >= 5 && h < 11) return "morning";
    if (h >= 11 && h < 17) return "midday";
    return "evening";
  }

  function safeJsonParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function lsGet(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return safeJsonParse(raw, fallback);
  }

  function lsSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64);
  }

  function getActivePosition() {
    return lsGet(LS_ACTIVE_POS, null);
  }

  function setActivePosition(posOrNull) {
    // posOrNull kan være null eller objekt
    try {
      localStorage.setItem(LS_ACTIVE_POS, JSON.stringify(posOrNull));
    } catch {}
  }

  function appendJobHistoryEnded(prevPos, end_reason) {
    if (!prevPos) return;
    const nowIso = new Date().toISOString();
    const hist = lsGet(LS_JOB_HISTORY, []);
    const arr = Array.isArray(hist) ? hist : [];
    arr.unshift({ ...prevPos, ended_at: nowIso, end_reason: end_reason || "ended" });
    lsSet(LS_JOB_HISTORY, arr);
  }

function weekKey(d = new Date()) {
  // ISO-uke (tilstrekkelig presis for spill)
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // 1..7 (man..søn)
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

// --- DISKRET UKE-LOGIKK ---

function weekIndexFromWeekKey(k) {
  const m = String(k || "").match(/^(\d{4})-W(\d{2})$/);
  if (!m) return null;

  const y = Number(m[1]);
  const w = Number(m[2]);

  if (!Number.isFinite(y) || !Number.isFinite(w)) return null;

  // 53 for å sikre at årsskifte ikke kolliderer
  return y * 53 + w;
}

function weeksPassedBetweenWeekKeys(sinceW, nowW) {
  const a = weekIndexFromWeekKey(sinceW);
  const b = weekIndexFromWeekKey(nowW);

  if (a == null || b == null) return 0;

  return Math.max(0, b - a);
}

function checkTierUpgrades() {

  const merits =
    JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const tierState =
    JSON.parse(localStorage.getItem("hg_badge_tiers_v1") || "{}");

  const newTierState = { ...tierState };

  const offers = [];

  (window.BADGES || []).forEach(badge => {

    const points =
      Number(merits[badge.id]?.points || 0);

    const { tierIndex } =
      deriveTierFromPoints(badge, points);

    const previousTier =
      Number(tierState[badge.id] || 0);

    if (tierIndex > previousTier) {

      const career =
        window.HG_CAREERS?.find(
          c => String(c.career_id) === String(badge.id)
        );

      if (career) {
        offers.push({
          career_id: career.career_id,
          title: career.title,
          tier: tierIndex
        });
      }

      newTierState[badge.id] = tierIndex;
    }

  });

  localStorage.setItem(
    "hg_badge_tiers_v1",
    JSON.stringify(newTierState)
  );

  if (offers.length) {
    setJobOffers(offers);
  }
}
   
function normalizeWallet(w) {
  // Én canonical form: { balance, last_tick_iso }
  if (!w || typeof w !== "object") return { balance: 0, last_tick_iso: null };
  const balance = Number.isFinite(Number(w.balance)) ? Number(w.balance) :
                  (Number.isFinite(Number(w.pc)) ? Number(w.pc) : 0);
  return { ...w, balance, last_tick_iso: w.last_tick_iso || null };
}

function tickPCIncomeWeekly() {
  let wallet = normalizeWallet(getPCWallet());
  const active = getActivePosition();
  const now = new Date();

  const lastIso = wallet.last_tick_iso;
  const lastWeek = lastIso ? weekKey(new Date(lastIso)) : null;
  const thisWeek = weekKey(now);

  // Samme uke → allerede prosessert
  if (lastWeek === thisWeek) return;

  // Globale regler
  const navAfterWeeks =
    Number(window.HG_CAREERS?.global_rules?.unemployment?.nav_after_weeks || 0);

  const navWeeklyPc =
    Number(window.HG_CAREERS?.global_rules?.unemployment?.nav_weekly_pc || 0);

  // =========================================================
  // ARBEIDSLEDIG
  // =========================================================
  if (!active?.career_id) {
    const state = window.HG_CiviEngine?.getState?.() || {};
    const sinceW = state.unemployed_since_week;
    const nowW = thisWeek;

    // Sett startuke hvis mangler
    if (!sinceW) {
      try {
        window.HG_CiviEngine?.setState?.({
          unemployed_since_week: nowW
        });
      } catch {}

      wallet.last_tick_iso = now.toISOString();
      savePCWallet(wallet);
      return;
    }

    const weeksPassed =
      weeksPassedBetweenWeekKeys(sinceW, nowW);

    if (weeksPassed >= navAfterWeeks && navWeeklyPc > 0) {
      wallet.balance += Math.floor(navWeeklyPc);
    }

    wallet.last_tick_iso = now.toISOString();
    savePCWallet(wallet);
    return;
  }

  // =========================================================
  // I JOBB
  // =========================================================

     const career = window.HG_CAREERS?.find(
     c => String(c.career_id) === String(active.career_id)
   );

  if (!career) {
    wallet.last_tick_iso = now.toISOString();
    savePCWallet(wallet);
    return;
  }

  const merits =
    JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const points =
    Number(merits[active.career_id]?.points || 0);

  const badge =
    window.BADGES?.find(b => b.id === active.career_id);

  if (!badge) {
    wallet.last_tick_iso = now.toISOString();
    savePCWallet(wallet);
    return;
  }

  const { tierIndex } =
    deriveTierFromPoints(badge, points);

  // 1️⃣ Lønn
  const weeklyIncome =
    calculateWeeklySalary(career, tierIndex);

  wallet.balance += Math.floor(weeklyIncome);

  // 2️⃣ Utgifter
  const baseExpense =
    Number(career?.economy?.weekly_expenses?.base || 0);

  const riskMod =
    Number(career?.economy?.weekly_expenses?.risk_modifier || 1);

  const weeklyExpense =
    Math.floor(baseExpense * riskMod);

  wallet.balance -= weeklyExpense;

// --------------------------------------------------
// Maintenance-krav (quiz-aktivitet)
// --------------------------------------------------

const rules = window.HG_CAREER_RULES?.careers?.find(
  c => c.id === active.career_id
);

const minQuiz =
  Number(rules?.world_logic?.maintenance?.min_quiz_per_weeks || 0);

if (minQuiz > 0) {

  const done =
    getQuizCountLastWeek(active.career_id);

  if (done < minQuiz) {

    state.strikes = (state.strikes || 0) + 1;

    state.lastMaintenanceFailAt = Date.now();

    // Eventuelt logg i inbox senere
  }
}

  // 3️⃣ Layoff-roll
  const layoffChance =
    Number(career?.economy?.risk?.layoff_chance_per_week || 0);

  const roll = Math.random();

  if (layoffChance > 0 && roll < layoffChance) {
    const prev = getActivePosition();

    appendJobHistoryEnded(prev, "layoff");
    setActivePosition(null);

    try {
      window.HG_CiviEngine?.setState?.({
        unemployed_since_week: thisWeek
      });
    } catch {}

    try {
      window.CivicationPsyche?.registerCollapse?.(
        prev?.career_id,
        "layoff"
      );
    } catch {}

    try {
      const firedEv =
        window.HG_CiviEngine?.makeFiredEvent?.(
          window.HG_CiviEngine?.getState?.().active_role_key
        );

      if (firedEv)
        window.HG_CiviEngine?.enqueueEvent?.(firedEv);
    } catch {}

    wallet.last_tick_iso = now.toISOString();
    savePCWallet(wallet);
    return;
  }

  // 4️⃣ Capital engine
  if (window.CAPITAL_ENGINE?.applyCareerCapital) {
    const capitalState =
      JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");

    const updated =
      window.CAPITAL_ENGINE.applyCareerCapital(
        career,
        tierIndex,
        capitalState
      );

    localStorage.setItem(
      "hg_capital_v1",
      JSON.stringify(updated)
    );
  }

  // Nullstill unemployment når i jobb
  try {
    window.HG_CiviEngine?.setState?.({
      unemployed_since_week: null
    });
  } catch {}

  wallet.last_tick_iso = now.toISOString();
  savePCWallet(wallet);
}
   
  class CivicationEventEngine {
  constructor(opts = {}) {
    this.packBasePath = opts.packBasePath || "data/civication"; // default mappe
    this.maxInbox = Number.isFinite(opts.maxInbox) ? opts.maxInbox : 1; // ingen backlog i v0.1
    this.pulseLimitPerDay = 3; // konseptuelt, men vi håndhever via slots
    this.packsCache = new Map(); // packFile -> pack json

    // Mapping: badge-id (career_id) -> civic pack-fil
    this.packMap = opts.packMap || {
     naering: "naeringslivCivic.json",
     naeringsliv: "naeringslivCivic.json",
     media: "mediaCivic.json",
     by: "byCivic.json"
  };  }
     
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
      return inbox.find(m => m && m.status === "pending") || null;
    }

    // -------- role_key resolution --------
    resolveRoleKey() {
      const active = getActivePosition();
      if (!active) return null;

      // 1) eksplisitt
      if (active.role_key) return String(active.role_key);

      // 2) derivert fra tittel (robust)
      const t = slugify(active.title || "");
      if (t) return t;

      // 3) fallback: career_id (kan være badge id)
      if (active.career_id) return String(active.career_id);

      return null;
    }

    syncRoleBaselineFromActive() {
      const active = getActivePosition();
      if (!active?.career_id) {
        window.CivicationPsyche?.clearRoleBaseline?.();
        return;
      }

      // Finn tierIndex fra merits + badges (samme logikk som ellers)
      const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
      const points = Number(merits[active.career_id]?.points || 0);

      const badge = window.BADGES?.find(b => b.id === active.career_id);
      const tier = badge ? deriveTierFromPoints(badge, points) : { tierIndex: 0 };

      // Baseline: start enkelt (kan tunes per careerId + tierIndex senere)
      const baseline = {
        integrity: 0,
        visibility: 0,
        economicRoom: 0
      };

      window.CivicationPsyche?.applyRoleBaseline?.(baseline);
    }
     
    ensureRoleKeySynced() {
      const active = getActivePosition();
      if (!active) {
        // arbeidsledig
        this.setState({ active_role_key: null });
        return null;
      }

      const rk = this.resolveRoleKey();
      const st = this.getState();

      // hvis byttet jobb, reset spilltilstand for jobbperioden
      if (rk && rk !== st.active_role_key) {
        // skriv role_key tilbake på aktiv pos for konsistens
        if (!active.role_key) {
          setActivePosition({ ...active, role_key: rk });
        }
        this.resetForNewJob(rk);
      }

      return rk;
    }

    // -------- pulse gating --------
    canPulseNow() {
      const slot = getPulseSlot();
      const t = todayKey();
      const p = lsGet(LS_PULSE, { date: t, seen: {} });

      // ny dag -> reset
      if (!p || p.date !== t) {
        lsSet(LS_PULSE, { date: t, seen: {} });
        return true;
      }

      const seen = p.seen || {};
      return !seen[slot];
    }

    markPulseUsed() {
      const slot = getPulseSlot();
      const t = todayKey();
      const p = lsGet(LS_PULSE, { date: t, seen: {} });
      const seen = p.seen || {};
      seen[slot] = true;
      lsSet(LS_PULSE, { date: t, seen });
    }

    // -------- pack loading --------
    async loadPack(packFile) {
  if (!packFile) return null;
  if (this.packsCache.has(packFile)) return this.packsCache.get(packFile);

  const url = `${this.packBasePath}/${packFile}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const pack = await res.json();
  this.packsCache.set(packFile, pack);
  return pack;
}

    // -------- event selection --------
    pickEventFromPack(pack, state) {
      if (!pack || !Array.isArray(pack.mails)) return null;
      const consumed = state.consumed || {};
      const autonomy = window.CivicationPsyche?.getAutonomy?.(state.active_role_key) ?? 50;
      const stability = state.stability;

      // Advarselmail skal kunne prioriteres når vi er i WARNING og den ikke er brukt som “mail”.
      const wantWarningMail = (stability === "WARNING" && state.warning_used === true);

      // Filter
      let candidates = pack.mails.filter(m => m && m.id && !consumed[m.id]);

      // Arbeidsledig håndteres utenfor
      // Stages:
      // stable, stable_warning, warning, warning_danger, fired, unemployed
      candidates = candidates.filter(m => m.stage !== "fired" && m.stage !== "unemployed");

      if (stability === "STABLE") {
        candidates = candidates.filter(m => m.stage === "stable" || m.stage === "stable_warning");
      } else if (stability === "WARNING") {
        // Hvis advarsel er brukt som status, tillat warning-innhold
        candidates = candidates.filter(m => m.stage === "warning" || m.stage === "warning_danger" || m.stage === "stable_warning");
      }

      // Hvis vi vil tvinge advarselsmail (en gang) kan vi prioritere is_warning_mail
      if (wantWarningMail) {
        const warn = candidates.find(m => m.is_warning_mail === true);
        if (warn) return warn;
      }
      // Score-basert valg (bruker gating dersom definert)
      function scoreMail(m) {
        let score = 0;

        const identityTags = Array.isArray(state.identity_tags) ? state.identity_tags : [];
        const tracks = Array.isArray(state.tracks) ? state.tracks : [];

        const gating = (m && m.gating) ? m.gating : {};

        // Hard blokkering
        if (Array.isArray(gating.avoid_tags)) {
          for (const t of gating.avoid_tags) {
            if (identityTags.includes(t)) return -1000;
          }
        }

        // Prefer tags
        if (Array.isArray(gating.prefer_tags)) {
          for (const t of gating.prefer_tags) {
            if (identityTags.includes(t)) score += 2;
          }
        }

        // Prefer tracks
        if (Array.isArray(gating.prefer_tracks)) {
          for (const tr of gating.prefer_tracks) {
            if (tracks.includes(tr)) score += 3;
          }
        }

        return score;
      }

      candidates.sort((a, b) => scoreMail(b) - scoreMail(a));
      return candidates[0] || null;
}

    makeFiredEvent(role_key) {
      // fallback dersom pack ikke har fired-mail
      return {
        id: `${role_key || "job"}_fired_auto`,
        stage: "fired",
        subject: "Vi avslutter samarbeidet",
        situation: ["Tilliten er brukt opp."],
        choices: [],
        effect: "job_lost",
        feedback: "Du blir tatt av dekning med umiddelbar virkning."
      };
    }

    makeNavEvent() {
      return {
        id: `nav_auto_${Date.now()}`,
        stage: "unemployed",
        source: "NAV",
        subject: "Din sak er registrert",
        situation: ["Vi mangler fortsatt dokumentasjon.", "Du hører fra oss."],
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
       tickPCIncomeWeekly();
     
    try {
     window.CivicationPsyche?.checkBurnout?.();
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
      if (this.getPendingEvent()) return { enqueued: false, reason: "pending_exists" };

      // 2) Pulse gating
      if (!this.canPulseNow()) return { enqueued: false, reason: "pulse_used" };

// 3) Arbeidsledig => før NAV: stille / evt. “arbeidsledig”-mail, etter X uker: NAV-mail
if (!active) {
  const st = this.getState();
  const now = new Date();

  // Sett startpunkt om mangler
  const navAfterWeeks =
  Number(window.HG_CAREERS?.global_rules?.unemployment?.nav_after_weeks || 0);

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
      const packFile = this.packMap[String(active?.career_id || "").trim()] || `${role_key}.json`;
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
      const next = [item, ...inbox].slice(0, this.maxInbox);
      this.setInbox(next);
    }

    // -------- answering --------
    answer(eventId, choiceId) {
      const inbox = this.getInbox();
      const idx = inbox.findIndex(
        x => x && x.status === "pending" && x.event && x.event.id === eventId
      );
      if (idx < 0) return { ok: false, reason: "not_found" };

      const item = inbox[idx];
      const ev = item.event || {};
      const state = this.getState();

      let effect = 0;
      let feedback = "";

      if (Array.isArray(ev.choices) && ev.choices.length) {
        const choice = ev.choices.find(c => c && c.id === choiceId);
               // ---- v0.2: send choice-tags til Lifestyle ledger (path dependency)

      // --- MORAL COLLAPSE ---
      if (choice?.moral_flag) {
       const active = getActivePosition();
      if (active?.career_id) {
       window.CivicationPsyche?.registerCollapse(active.career_id, "moral");
       }
      }
         
try {
  const tags = Array.isArray(choice?.tags) ? choice.tags : [];
  if (tags.length) window.HG_Lifestyle?.addTags?.(tags, "civication_choice");
} catch {}

if (!choice) return { ok: false, reason: "bad_choice" };

let baseEffect = Number(choice.effect || 0);

const autonomy =
  window.CivicationPsyche?.getAutonomy?.(state.active_role_key) ?? 50;

if (baseEffect < 0 && autonomy < 30) {
  baseEffect *= 1.5;
}

if (baseEffect < 0 && autonomy > 70) {
  baseEffect *= 0.7;
}

effect = Math.round(baseEffect);
feedback = String(choice.feedback || "");
      }

      // mark consumed
      const consumed = { ...(state.consumed || {}) };
      consumed[ev.id] = true;

      // apply effect -> internal score
      let score = Number(state.score || 0) + effect;

      // clamp score litt (så +1 ikke blir uendelig buffer)
      if (score > 2) score = 2;
      if (score < -5) score = -5;

      let strikes = Number(state.strikes || 0);
      let stability = state.stability;

      // threshold: score <= -2 => strike
      if (score <= -2) {
        strikes += 1;
        score = 0;

        if (strikes === 1) {
          stability = "WARNING";
        } else if (strikes >= 2) {
          stability = "FIRED";
        }
      } else {
        // Hvis i WARNING og vi får positiv stabilisering, kan vi gå tilbake til STABLE
        if (stability === "WARNING" && effect > 0) {
          stability = "STABLE";
        }
      }

      // Warning flag: første gang vi går inn i WARNING, marker warning_used (status)
      let warning_used = state.warning_used;
      if (stability === "WARNING") warning_used = true;

      // Resolve item
      inbox[idx] = {
        ...item,
        status: "resolved",
        resolved_at: new Date().toISOString(),
        chosen: choiceId || null,
        effect,
        feedback
      };

      // commit state
      this.setInbox(inbox);
      this.setState({ consumed, score, strikes, stability, warning_used });

// Fired handling
if (stability === "FIRED") {
  const prev = getActivePosition();

  // 1️⃣ Registrer kollaps i Psyche
  if (prev?.career_id) {
    window.CivicationPsyche?.registerCollapse(prev.career_id, "fired");
  }

  // 2️⃣ Flytt til jobbhistorikk
  appendJobHistoryEnded(prev, "fired");

  // 3️⃣ Fjern aktiv jobb
  setActivePosition(null);

  this.setState({ unemployed_since_week: weekKey(new Date()) });

  // 4️⃣ Legg fired-info i inbox
  const firedEv = this.makeFiredEvent(this.getState().active_role_key);
  this.enqueueEvent(firedEv);
}

    } // ← lukker answer()

  } // ← lukker class CivicationEventEngine

  // -------- instantiate engine --------
  window.HG_CiviEngine = new CivicationEventEngine({
    packBasePath: "data/civication",
    maxInbox: 1
  });

window.checkTierUpgrades = checkTierUpgrades;
   
})(); // ← lukker IIFE

function qualifiesForCareer(player, career) {
  if (!career.required_badges) return true;

  return career.required_badges.every(req => {
    const tier = player.badges?.[req.badge] ?? 0;
    return tier >= req.min_tier;
  });
}

function calculateWeeklySalary(career, tierIndex) {
  // Kilde: hg_careers.json → economy.salary_by_tier (ukelønn per tier)
  // tierIndex kommer fra deriveTierFromPoints og er 0-basert.
  const tier = (Number.isFinite(tierIndex) ? tierIndex : 0) + 1;

  const byTier = career?.economy?.salary_by_tier;
  let weekly = byTier && Object.prototype.hasOwnProperty.call(byTier, String(tier))
    ? Number(byTier[String(tier)])
    : (byTier && Object.prototype.hasOwnProperty.call(byTier, tier)
        ? Number(byTier[tier])
        : 0);

  if (!Number.isFinite(weekly)) weekly = 0;

  // Rounding (default: nearest) fra HG_CAREERS.global_rules.salary.rounding
  const rounding =
    window.HG_CAREERS?.global_rules?.salary?.rounding || "nearest";

  switch (rounding) {
    case "floor":
      weekly = Math.floor(weekly);
      break;
    case "ceil":
      weekly = Math.ceil(weekly);
      break;
    case "nearest":
    default:
      weekly = Math.round(weekly);
      break;
  }

  return weekly;
}

function payWeeklySalary(player, career, tierIndex) {
  const weekly = calculateWeeklySalary(career, tierIndex);
  player.balance = (Number(player.balance) || 0) + weekly;
  return weekly;
}

function getCapital() {
  return JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");
}

function saveCapital(cap) {
  localStorage.setItem("hg_capital_v1", JSON.stringify(cap));
  window.dispatchEvent(new Event("updateProfile"));
}

function getQuizCountLastWeek(careerId) {
  const history =
    JSON.parse(localStorage.getItem("quiz_history") || "[]");

  if (!Array.isArray(history)) return 0;

  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  return history.filter(h => {
    if (!h?.date) return false;
    if (String(h?.categoryId) !== String(careerId)) return false;

    const t = new Date(h.date).getTime();
    return now - t <= oneWeek;
  }).length;
}


