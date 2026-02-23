(function () {
  "use strict";

  // Keys
  const LS_CAPITAL_VALUES = "hg_capital_v1";          // eksisterende (tall per kapital)
  const LS_MAINT_META     = "hg_capital_maint_v1";    // ny: lastActive + lastAppliedAt + log

  const DAY_MS = 24 * 60 * 60 * 1000;

  // Default profil (differensiert)
  // maintenanceDays: hvor lenge stabilt uten relevant aktivitet
  // decayPerDay: hvor mye som trekkes per dag etter maintenanceDays
  const DEFAULT_PROFILE = {
    economic:      { maintenanceDays: 14, decayPerDay: 0.4 },
    cultural:      { maintenanceDays: 21, decayPerDay: 0.3 },
    social:        { maintenanceDays: 14, decayPerDay: 0.4 },
    symbolic:      { maintenanceDays: 30, decayPerDay: 0.2 },

    // eksisterer hos deg i noen modeller / map
    institutional: { maintenanceDays: 10, decayPerDay: 0.6 },
    subculture:    { maintenanceDays: 7,  decayPerDay: 0.8 },

    // CivicationUI viser "political" (ikke institutional)
    political:     { maintenanceDays: 10, decayPerDay: 0.6 }
  };

  // Status terskler (0..1 av maintenanceDays)
  const COOLING_AT = 0.70;

  // Optional overrides:
  // window.CIVI_CAPITAL_MAINT_PROFILE = { economic:{maintenanceDays:..,decayPerDay:..}, ... }
  function getProfile() {
    const o = window.CIVI_CAPITAL_MAINT_PROFILE;
    if (!o || typeof o !== "object") return DEFAULT_PROFILE;

    const merged = { ...DEFAULT_PROFILE };
    Object.keys(o).forEach((k) => {
      const v = o[k];
      if (!v || typeof v !== "object") return;
      merged[k] = {
        maintenanceDays: Number.isFinite(v.maintenanceDays) ? v.maintenanceDays : merged[k]?.maintenanceDays,
        decayPerDay: Number.isFinite(v.decayPerDay) ? v.decayPerDay : merged[k]?.decayPerDay
      };
    });
    return merged;
  }

  function clampMin0(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, x);
  }

  function safeParse(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v && typeof v === "object" ? v : fallback;
    } catch {
      return fallback;
    }
  }

  function loadCapitalValues() {
    const raw = localStorage.getItem(LS_CAPITAL_VALUES);
    return safeParse(raw, {});
  }

  function saveCapitalValues(obj) {
    try { localStorage.setItem(LS_CAPITAL_VALUES, JSON.stringify(obj || {})); } catch {}
  }

  function loadMeta() {
    const raw = localStorage.getItem(LS_MAINT_META);
    return safeParse(raw, {});
  }

  function saveMeta(meta) {
    try { localStorage.setItem(LS_MAINT_META, JSON.stringify(meta || {})); } catch {}
  }

  function ensureMeta(meta, nowMs) {
    const m = meta && typeof meta === "object" ? meta : {};
    if (!m.version) m.version = 1;
    if (!Number.isFinite(m.lastAppliedAt)) m.lastAppliedAt = nowMs;
    if (!m.lastActive || typeof m.lastActive !== "object") m.lastActive = {};
    if (!Array.isArray(m.log)) m.log = [];
    return m;
  }

  function daysBetween(aMs, bMs) {
    return (bMs - aMs) / DAY_MS;
  }

  // stable | cooling | decaying
  function getCapitalStatus(type, values, meta, profile, nowMs) {
    const cfg = profile[type];
    if (!cfg) return { state: "stable", daysInactive: 0, maintenanceDays: 0 };

    const lastActive = Number.isFinite(meta.lastActive?.[type])
      ? meta.lastActive[type]
      : nowMs;

    const daysInactive = Math.max(0, daysBetween(lastActive, nowMs));
    const maintenanceDays = Math.max(0, Number(cfg.maintenanceDays || 0));

    if (maintenanceDays === 0) {
      return { state: "stable", daysInactive, maintenanceDays };
    }

    if (daysInactive < maintenanceDays * COOLING_AT) {
      return { state: "stable", daysInactive, maintenanceDays };
    }

    if (daysInactive < maintenanceDays) {
      return { state: "cooling", daysInactive, maintenanceDays };
    }

    return { state: "decaying", daysInactive, maintenanceDays };
  }

  // Apply decay only for the time slice since lastAppliedAt (no double decay)
  function applyMaintenance(nowMs = Date.now()) {
    const profile = getProfile();
    const values = loadCapitalValues();
    const meta = ensureMeta(loadMeta(), nowMs);

    const lastAppliedAt = meta.lastAppliedAt;
    if (!Number.isFinite(lastAppliedAt)) {
      meta.lastAppliedAt = nowMs;
      saveMeta(meta);
      return { ok: true, changed: false, values, meta };
    }

    // If no time has passed, do nothing
    if (nowMs <= lastAppliedAt) {
      return { ok: true, changed: false, values, meta };
    }

    let changed = false;

    Object.keys(profile).forEach((type) => {
      const cfg = profile[type];
      if (!cfg) return;

      const maintenanceDays = Number(cfg.maintenanceDays || 0);
      const decayPerDay = Number(cfg.decayPerDay || 0);
      if (maintenanceDays <= 0 || decayPerDay <= 0) return;

      const lastActive = Number.isFinite(meta.lastActive?.[type])
        ? meta.lastActive[type]
        : nowMs;

      const decayStartAt = lastActive + maintenanceDays * DAY_MS;

      // decay only for the overlap: [lastAppliedAt, now] ∩ [decayStartAt, now]
      const effectiveStart = Math.max(lastAppliedAt, decayStartAt);
      if (effectiveStart >= nowMs) return;

      const decayDays = (nowMs - effectiveStart) / DAY_MS;
      if (decayDays <= 0) return;

      const cur = Number(values[type] || 0);
      const next = clampMin0(cur - decayPerDay * decayDays);

      if (next !== cur) {
        values[type] = next;
        changed = true;
      }
    });

    meta.lastAppliedAt = nowMs;
    saveMeta(meta);

    if (changed) {
      saveCapitalValues(values);
      window.dispatchEvent(new Event("updateProfile"));
    }

    return { ok: true, changed, values, meta };
  }

  // Maintain via quiz/purchase/etc.
  function maintain(type, delta = 1, opts = {}) {
    const nowMs = Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
    const t = String(type || "").trim();
    if (!t) return { ok: false, reason: "missing_type" };

    const profile = getProfile();
    const values = loadCapitalValues();
    const meta = ensureMeta(loadMeta(), nowMs);

    // Create key if absent (we allow unknown keys too, but defaults won't decay unless profiled)
    const cur = Number(values[t] || 0);
    const next = cur + Number(delta || 0);

    values[t] = next;
    meta.lastActive[t] = nowMs;

    // Log (for UI/A)
    meta.log.unshift({
      at: new Date(nowMs).toISOString(),
      type: t,
      delta: Number(delta || 0),
      source: String(opts.source || "manual")
    });
    meta.log = meta.log.slice(0, 100);

    saveCapitalValues(values);
    saveMeta(meta);

    window.dispatchEvent(new Event("updateProfile"));

    return { ok: true, type: t, value: values[t] };
  }

  function touch(type, opts = {}) {
    return maintain(type, 0, { ...opts, source: opts.source || "touch" });
  }

  // Visible status summary (A)
  function getStatuses(nowMs = Date.now()) {
    const profile = getProfile();
    const values = loadCapitalValues();
    const meta = ensureMeta(loadMeta(), nowMs);

    const out = {};
    Object.keys(profile).forEach((type) => {
      out[type] = {
        value: Number(values[type] || 0),
        ...getCapitalStatus(type, values, meta, profile, nowMs)
      };
    });

    return out;
  }

  // Convenience: map quiz category → maintain capital types (optional)
  // Override with window.CIVI_QUIZ_CAPITAL_MAP if you want.
  const DEFAULT_QUIZ_MAP = {
    naeringsliv: ["economic", "institutional"],
    media: ["cultural", "symbolic"],
    politikk: ["institutional", "symbolic"],
    kunst: ["cultural", "symbolic"],
    subkultur: ["subculture", "cultural"],
    by: ["symbolic", "institutional"],
    sport: ["social"],
    historie: ["symbolic"],
    vitenskap: ["cultural"]
  };

  function maintainFromQuiz(categoryId, delta = 1, opts = {}) {
    const map = (window.CIVI_QUIZ_CAPITAL_MAP && typeof window.CIVI_QUIZ_CAPITAL_MAP === "object")
      ? window.CIVI_QUIZ_CAPITAL_MAP
      : DEFAULT_QUIZ_MAP;

    const key = String(categoryId || "").trim();
    const types = Array.isArray(map[key]) ? map[key] : null;
    if (!types) return { ok: false, reason: "no_mapping", categoryId: key };

    const res = [];
    types.forEach((t) => res.push(maintain(t, delta, { ...opts, source: opts.source || "quiz" })));
    return { ok: true, categoryId: key, results: res };
  }

  // Public API
  window.HG_CapitalMaintenance = {
    getProfile,
    applyMaintenance,
    maintain,
    touch,
    getStatuses,
    maintainFromQuiz
  };

  // Default: apply once on load/open (safe, idempotent)
  // You can also call applyMaintenance() from your "onAppOpen" hook.
  try { applyMaintenance(Date.now()); } catch {}

})();
