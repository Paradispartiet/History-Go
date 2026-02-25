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
    stability: "STABLE",
    warning_used: false,
    strikes: 0,
    score: 0,
    active_role_key: null,
    consumed: {},
    identity_tags: [],
    tracks: [],
    unemployed_since_week: null,
    version: 1
  };


  function todayKey() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }


  function getPulseSlot(now) {
    const n = now || new Date();
    const h = n.getHours();

    if (h >= 5 && h < 11) return "morning";
    if (h >= 11 && h < 17) return "midday";
    return "evening";
  }


  function safeJsonParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch (e) {
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
    } catch (e) {}
  }


  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64);
  }


  function getActivePosition() {
    return lsGet(LS_ACTIVE_POS, null);
  }


  function setActivePosition(posOrNull) {
    try {
      localStorage.setItem(
        LS_ACTIVE_POS,
        JSON.stringify(posOrNull)
      );
    } catch (e) {}
  }


  function appendJobHistoryEnded(prevPos, end_reason) {

    if (!prevPos) return;

    const nowIso = new Date().toISOString();

    const hist = lsGet(LS_JOB_HISTORY, []);
    const arr = Array.isArray(hist) ? hist : [];

    const entry = Object.assign({}, prevPos);
    entry.ended_at = nowIso;
    entry.end_reason = end_reason || "ended";

    arr.unshift(entry);

    lsSet(LS_JOB_HISTORY, arr);
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


  function checkTierUpgrades() {

    const merits =
      JSON.parse(
        localStorage.getItem("merits_by_category") || "{}"
      );

    const tierState =
      JSON.parse(
        localStorage.getItem("hg_badge_tiers_v1") || "{}"
      );

    const newTierState = Object.assign({}, tierState);

    const offers = [];

    const badges =
      Array.isArray(window.BADGES)
        ? window.BADGES
        : [];

    for (let i = 0; i < badges.length; i++) {

      const badge = badges[i];

      const points =
        Number(
          (merits[badge.id] &&
           merits[badge.id].points) || 0
        );

      const tierData =
        deriveTierFromPoints(badge, points);

      const tierIndex = tierData.tierIndex;
      const label = tierData.label;

      const previousTier =
        Number(tierState[badge.id] || -1);

      if (tierIndex > previousTier) {

        let career = null;

        if (Array.isArray(window.HG_CAREERS)) {
          for (let j = 0; j < window.HG_CAREERS.length; j++) {
            const c = window.HG_CAREERS[j];
            if (String(c.career_id) === String(badge.id)) {
              career = c;
              break;
            }
          }
        }

        if (career) {

          const now = new Date();
          const expires = new Date(now.getTime() + 7 * 86400000);

          const offer_key =
           badge.id + "_" + tierIndex + "_" + now.toISOString();

          offers.push({
           id: offer_key,          // ✅ UI forventer id
           offer_key: offer_key,   // behold for sporbarhet
           career_id: career.career_id,
           career_name: badge.name,
           title: badge.name + " – " + label,
           tier: tierIndex,
           status: "pending",
           created_iso: now.toISOString(),
           expires_iso: expires.toISOString()
         });
        }

        newTierState[badge.id] = tierIndex;
      }
    }

    localStorage.setItem(
      "hg_badge_tiers_v1",
      JSON.stringify(newTierState)
    );

    if (offers.length &&
        typeof setJobOffers === "function") {
      setJobOffers(offers);
    }
  }


  function normalizeWallet(w) {

    if (!w || typeof w !== "object") {
      return { balance: 0, last_tick_iso: null };
    }

    let balance = 0;

    if (Number.isFinite(Number(w.balance))) {
      balance = Number(w.balance);
    } else if (Number.isFinite(Number(w.pc))) {
      balance = Number(w.pc);
    }

    const out = Object.assign({}, w);
    out.balance = balance;
    out.last_tick_iso = w.last_tick_iso || null;

    return out;
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

// -------- load careers and THEN start engine --------
fetch("data/Civication/hg_careers.json")
  .then(function (r) {
    if (!r.ok) {
      throw new Error("Failed to load careers");
    }
    return r.json();
  })
  .then(function (data) {

    window.HG_CAREERS = data;


function qualifiesForCareer(player, career) {

  if (!career.required_badges) return true;

  return career.required_badges.every(function (req) {

    let tier = 0;

    if (player.badges &&
        Object.prototype.hasOwnProperty.call(player.badges, req.badge)) {

      tier = player.badges[req.badge];
    }

    return tier >= req.min_tier;
  });
}



function calculateWeeklySalary(career, tierIndex) {

  const tier =
    (Number.isFinite(tierIndex) ? tierIndex : 0) + 1;

  let byTier = null;

  if (career &&
      career.economy &&
      career.economy.salary_by_tier) {

    byTier = career.economy.salary_by_tier;
  }

  let weekly = 0;

  if (byTier &&
      Object.prototype.hasOwnProperty.call(byTier, String(tier))) {

    weekly = Number(byTier[String(tier)]);

  } else if (byTier &&
             Object.prototype.hasOwnProperty.call(byTier, tier)) {

    weekly = Number(byTier[tier]);
  }

  if (!Number.isFinite(weekly)) {
    weekly = 0;
  }

  let rounding = "nearest";

  if (window.HG_CAREERS &&
      window.HG_CAREERS.global_rules &&
      window.HG_CAREERS.global_rules.salary &&
      window.HG_CAREERS.global_rules.salary.rounding) {

    rounding =
      window.HG_CAREERS.global_rules.salary.rounding;
  }

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

window.calculateWeeklySalary = calculateWeeklySalary;

function payWeeklySalary(player, career, tierIndex) {

  const weekly =
    calculateWeeklySalary(career, tierIndex);

  player.balance =
    (Number(player.balance) || 0) + weekly;

  return weekly;
}



function getCapital() {

  return JSON.parse(
    localStorage.getItem("hg_capital_v1") || "{}"
  );
}



function saveCapital(cap) {

  localStorage.setItem(
    "hg_capital_v1",
    JSON.stringify(cap)
  );

  window.dispatchEvent(
    new Event("updateProfile")
  );
}



function getQuizCountLastWeek(careerId) {

  const history =
    JSON.parse(
      localStorage.getItem("quiz_history") || "[]"
    );

  if (!Array.isArray(history)) {
    return 0;
  }

  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  return history.filter(function (h) {

    if (!h || !h.date) return false;

    if (String(h.categoryId) !== String(careerId)) {
      return false;
    }

    const t = new Date(h.date).getTime();
    return (now - t) <= oneWeek;

  }).length;
}

})(); // close Civication Event Engine IIFE
