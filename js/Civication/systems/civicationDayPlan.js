// js/Civication/systems/civicationDayPlan.js
// Ren activity/suggestion-helper. Eier ikke fasestruktur eller dagfremdrift; fasen leses fra
// CivicationCalendar/DayProgression og DailyMailBuilder eier dagens runtime-items.
(function () {
  "use strict";

  const KEY = "civication_day_plan_v1";
  const FALLBACK_PHASES = ["morning", "lunch", "afternoon", "evening", "day_end"];
  const PHASE_LABELS = { morning: "Morgen", lunch: "Dag / lunsj", afternoon: "Ettermiddag", evening: "Kveld", day_end: "Natt" };
  const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const CATEGORIES = new Set(["arbeid", "struktur", "hvile", "sosialt", "kompetanse", "trening", "hobby", "familie", "økonomi", "praktisk", "søvn"]);
  const EFFECT_KEYS = new Set(["psyke", "energi", "kompetanse", "penger", "pc", "relasjoner", "handlingsrom", "status", "sleepQuality", "søvnkvalitet"]);

  const DEFAULT_ACTIVITIES = [];

  const EVENING_SUGGESTIONS = [
    ["evening-rest", "Hvil", "hvile", { psyke: 2, energi: 1, sleepQuality: 1 }],
    ["evening-read", "Les fagstoff", "kompetanse", { kompetanse: 1, psyke: 1 }],
    ["evening-call-friend", "Ring en venn", "sosialt", { relasjoner: 2, psyke: 1 }],
    ["evening-light-training", "Tren lett", "trening", { energi: -1, psyke: 1, sleepQuality: 1 }],
    ["evening-plan-tomorrow", "Planlegg morgendagen", "struktur", { handlingsrom: 2, psyke: 1, energi: -1, sleepQuality: 1 }],
    ["evening-early-bed", "Legg deg tidlig", "søvn", { energi: 2, psyke: 1, sleepQuality: 2 }]
  ];

  function nowIso() { return new Date().toISOString(); }
  function todayKey() { return new Date().toISOString().slice(0, 10); }
  function norm(v) { return String(v || "").trim(); }
  function uid(prefix) { return `${prefix || "activity"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } }
  function write(data) { localStorage.setItem(KEY, JSON.stringify(data || {})); return data; }

  function getPhaseOrder() {
    const fromCalendar = window.CivicationCalendar?.DAY_PHASES;
    return Array.isArray(fromCalendar) && fromCalendar.length ? fromCalendar.map(norm).filter(Boolean) : FALLBACK_PHASES.slice();
  }

  function normalizePhase(phase) {
    const p = norm(phase);
    if (p === "day" || p === "dag") return "lunch";
    if (p === "night" || p === "natt") return "day_end";
    const phases = getPhaseOrder();
    return phases.includes(p) ? p : norm(window.CivicationCalendar?.getPhase?.()) || "evening";
  }

  function normalizeActivity(activity) {
    const raw = activity && typeof activity === "object" ? activity : {};
    const at = nowIso();
    const effects = {};
    Object.entries(raw.effects || {}).forEach(([key, value]) => {
      if (EFFECT_KEYS.has(key)) effects[key === "søvnkvalitet" ? "sleepQuality" : key] = Number(value || 0);
    });
    return {
      id: norm(raw.id) || uid("dayplan"),
      title: norm(raw.title) || "Aktivitet",
      phase: normalizePhase(raw.phase),
      startTime: norm(raw.startTime),
      endTime: norm(raw.endTime),
      repeat: Array.isArray(raw.repeat) ? raw.repeat.map(norm).filter(Boolean) : (norm(raw.repeat) || "once"),
      category: CATEGORIES.has(norm(raw.category)) ? norm(raw.category) : "praktisk",
      effects,
      isFixed: raw.isFixed === true,
      status: norm(raw.status) || "planned",
      source: norm(raw.source) || "player",
      createdAt: norm(raw.createdAt) || at,
      updatedAt: norm(raw.updatedAt) || at,
      completedAt: norm(raw.completedAt)
    };
  }

  function ensureStore() {
    const data = read();
    if (!Array.isArray(data.activities)) data.activities = DEFAULT_ACTIVITIES.map(normalizeActivity);
    if (!data.carryover || typeof data.carryover !== "object") data.carryover = {};
    if (!Array.isArray(data.appliedEffects)) data.appliedEffects = [];
    return write(data);
  }

  function matchesRepeat(activity, date = new Date()) {
    const repeat = activity.repeat || "once";
    if (repeat === "daily") return true;
    const day = DAY_NAMES[date.getDay()];
    const weekday = date.getDay() >= 1 && date.getDay() <= 5;
    if (repeat === "weekdays") return weekday;
    if (repeat === "weekend") return !weekday;
    if (Array.isArray(repeat)) return repeat.map(norm).includes(day);
    if (repeat === "once") return !activity.date || activity.date === todayKey();
    return true;
  }

  function getTodayPlan(date = new Date()) {
    const data = ensureStore();
    const activities = data.activities.map(normalizeActivity).filter((a) => matchesRepeat(a, date));
    const phases = getPhaseOrder();
    const byPhase = Object.fromEntries(phases.map((phase) => [phase, activities.filter((a) => a.phase === phase)]));
    const nextActivity = activities.find((a) => a.status !== "completed") || null;
    const emptyPhases = phases.filter((p) => !byPhase[p].length);
    return { date: todayKey(), activePhase: normalizePhase(window.CivicationCalendar?.getPhase?.()), phases: phases.map((id) => ({ id, label: window.CivicationCalendar?.getPhaseLabel?.(id) || PHASE_LABELS[id] || id, activities: byPhase[id] })), activities, byPhase, nextActivity, emptyPhases, carryover: data.carryover || {} };
  }

  function getActivitiesForPhase(phase) { return getTodayPlan().byPhase[normalizePhase(phase)] || []; }
  function addActivity(activity) { const data = ensureStore(); const item = normalizeActivity(activity); data.activities = data.activities.filter((a) => a.id !== item.id).concat(item); write(data); return item; }
  function updateActivity(id, patch) { const data = ensureStore(); let updated = null; data.activities = data.activities.map((a) => { if (a.id !== id) return a; updated = normalizeActivity({ ...a, ...(patch || {}), id, updatedAt: nowIso() }); return updated; }); write(data); return updated; }
  function removeActivity(id) { const data = ensureStore(); const before = data.activities.length; data.activities = data.activities.filter((a) => a.id !== id); write(data); return data.activities.length !== before; }
  function getSuggestionsForPhase(phase) { if (normalizePhase(phase) !== "evening") return []; return EVENING_SUGGESTIONS.map(([id, title, category, effects]) => normalizeActivity({ id, title, phase: "evening", startTime: "20:00", endTime: "21:00", repeat: "once", category, effects, source: "suggestion" })); }

  function previewEffects(activityId) { const a = ensureStore().activities.find((x) => x.id === activityId); return a ? { activityId, effects: { ...(a.effects || {}) } } : null; }
  function applyActivityEffects(activityId) {
    const data = ensureStore();
    const activity = data.activities.find((a) => a.id === activityId);
    if (!activity) return { ok: false, reason: "missing_activity" };
    const effects = activity.effects || {};
    const state = window.CivicationState?.getState?.() || {};
    const stats = { ...(state.day_plan_stats || {}) };
    Object.entries(effects).forEach(([key, value]) => { stats[key] = Number(stats[key] || 0) + Number(value || 0); });
    const carryover = { ...(data.carryover || {}) };
    if (activity.phase === "day_end" || activity.category === "søvn") carryover.nextEnergy = Number(carryover.nextEnergy || 0) + Number(effects.energi || 0);
    if (activity.phase === "evening") carryover.plannedTomorrow = carryover.plannedTomorrow || /planlegg/i.test(activity.title);
    carryover.sleepQuality = Number(carryover.sleepQuality || 0) + Number(effects.sleepQuality || 0);
    data.carryover = carryover;
    data.appliedEffects.push({ activityId, effects, at: nowIso() });
    write(data);
    window.CivicationState?.setState?.({ day_plan_stats: stats, day_plan_carryover: carryover });
    return { ok: true, activityId, effects, stats, carryover };
  }
  function completeActivity(id) { const updated = updateActivity(id, { status: "completed", completedAt: nowIso() }); const applied = updated ? applyActivityEffects(id) : null; return { ok: !!updated, activity: updated, applied }; }
  function inspect() { const data = ensureStore(); const plan = getTodayPlan(); return { key: KEY, today: plan, activities_per_phase: plan.byPhase, next_activity: plan.nextActivity, empty_phases: plan.emptyPhases, evening_suggestions: getSuggestionsForPhase("evening"), effects_preview: plan.activities.map((a) => previewEffects(a.id)).filter(Boolean), applied_effects: data.appliedEffects || [], carryover: data.carryover || {} }; }

  window.CivicationDayPlan = { inspect, getTodayPlan, getActivitiesForPhase, addActivity, updateActivity, removeActivity, completeActivity, getSuggestionsForPhase, applyActivityEffects, previewEffects };
})();
