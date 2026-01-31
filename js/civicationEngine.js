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
  // ISO-uke-ish nok for spill: år + ukeNr
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // 1..7 (man..søn)
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2,"0")}`;
}

function tickPCIncomeWeekly() {
  const wallet = getPCWallet();
  const active = getActivePosition();
  const now = new Date();

  // Ingen jobb → ingen lønn, men oppdater sist-uke så ikke “spretter”
  if (!active || !active.year_salary) {
    wallet.last_tick_iso = new Date().toISOString();
    savePCWallet(wallet);
    return;
  }

  const lastIso = wallet.last_tick_iso;
  const lastWeek = lastIso ? weekKey(new Date(lastIso)) : null;
  const thisWeek = weekKey(now);

  // Samme uke → allerede betalt
  if (lastWeek === thisWeek) return;

  // Betal 1 uke (cap)
  const weekly = Math.floor(active.year_salary / 52);
  wallet.balance += weekly;

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

      // Ellers velg første (kan senere randomiseres)
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
      // 0) sync job/role_key
      const role_key = this.ensureRoleKeySynced();
      const active = getActivePosition();
      const state = this.getState();

      // 1) Hvis det allerede finnes en pending event, ikke spam
      if (this.getPendingEvent()) return { enqueued: false, reason: "pending_exists" };

      // 2) Pulse gating
      if (!this.canPulseNow()) return { enqueued: false, reason: "pulse_used" };

      // 3) Arbeidsledig => NAV-mail
      if (!active) {
        const nav = this.makeNavEvent();
        this.enqueueEvent(nav);
        this.markPulseUsed();
        return { enqueued: true, type: "nav", event: nav };
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
      try {
        const tags = Array.isArray(choice?.tags) ? choice.tags : [];
        if (tags.length) window.HG_Lifestyle?.addTags?.(tags, "civication_choice");
      } catch {}
        if (!choice) return { ok: false, reason: "bad_choice" };
        effect = Number(choice.effect || 0);
        feedback = String(choice.feedback || "");
      } else {
        // events uten valg
        effect = 0;
        feedback = String(ev.feedback || "");
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
        appendJobHistoryEnded(prev, "fired");
        setActivePosition(null);

        // legg fired-event som “info” i inbox
        const firedEv = this.makeFiredEvent(this.getState().active_role_key);
        this.enqueueEvent(firedEv);
      }

      return { ok: true, effect, feedback, stability };
    }
  }

  // global export
  window.HG_CiviEngine = new CivicationEventEngine({
    packBasePath: "data/civication",
    maxInbox: 1
  });
})();
