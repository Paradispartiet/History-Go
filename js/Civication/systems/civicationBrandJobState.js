(function () {
  "use strict";

  const STORAGE_KEY = "hg_brand_job_state_v1";
  const VERSION = 1;
  const MAX_HISTORY = 80;
  const CLAMP_MIN = -10;
  const CLAMP_MAX = 10;
  const METRIC_KEYS = [
    "brand_tillit",
    "leder_tillit",
    "kollega_tillit",
    "kundetillit",
    "faglighet",
    "driftsflyt",
    "salgserfaring",
    "stress",
    "risiko",
    "integritet"
  ];

  function norm(value) { return String(value || "").trim(); }
  function slugify(value) {
    return norm(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }
  function clamp(value) {
    return Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, Number(value) || 0));
  }

  function defaultMetrics() {
    const out = {};
    METRIC_KEYS.forEach((k) => { out[k] = 0; });
    return out;
  }

  function makeDefault() {
    return { version: VERSION, byBrandRole: {}, last_change: null, updated_at: null };
  }

  function getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return makeDefault();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return makeDefault();
      return {
        version: VERSION,
        byBrandRole: parsed.byBrandRole && typeof parsed.byBrandRole === "object" ? parsed.byBrandRole : {},
        last_change: parsed.last_change && typeof parsed.last_change === "object" ? parsed.last_change : null,
        updated_at: parsed.updated_at || null
      };
    } catch {
      return makeDefault();
    }
  }

  function setState(nextState) {
    const previousRaw = localStorage.getItem(STORAGE_KEY);
    const nextRaw = JSON.stringify(nextState || makeDefault());
    if (previousRaw === nextRaw) return { ok: true, changed: false };
    localStorage.setItem(STORAGE_KEY, nextRaw);
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    return { ok: true, changed: true };
  }

  function reset() {
    const had = localStorage.getItem(STORAGE_KEY);
    if (had == null) return { ok: true, changed: false };
    localStorage.removeItem(STORAGE_KEY);
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    return { ok: true, changed: true };
  }

  function includesTag(tags, needle) {
    return tags.some((t) => t.includes(needle));
  }

  function ensureEntry(baseState, eventObj, active, roleScope) {
    const brandId = slugify(eventObj?.brand_id || active?.brand_id);
    const key = `${brandId}:${roleScope}`;
    const current = baseState.byBrandRole[key] || {};
    const next = {
      brand_id: brandId,
      brand_name: norm(eventObj?.brand_name || active?.brand_name || current.brand_name),
      role_scope: roleScope,
      career_id: norm(eventObj?.career_id || active?.career_id || "naeringsliv"),
      metrics: { ...defaultMetrics(), ...(current.metrics || {}) },
      answered_mail_ids: Array.isArray(current.answered_mail_ids) ? current.answered_mail_ids.slice() : [],
      history: Array.isArray(current.history) ? current.history.slice(-MAX_HISTORY) : []
    };
    return { key, entry: next };
  }

  function deriveDelta(eventObj, choice) {
    const delta = {};
    const rawTags = Array.isArray(choice?.tags) ? choice.tags : [];
    const tags = rawTags.map((t) => slugify(t));
    const pressure = slugify(eventObj?.pressure || "");

    if (includesTag(tags, "kunde") || includesTag(tags, "kundetillit")) delta.kundetillit = (delta.kundetillit || 0) + 1;
    if (includesTag(tags, "kvalitet")) delta.brand_tillit = (delta.brand_tillit || 0) + 1;
    if (includesTag(tags, "fag")) delta.faglighet = (delta.faglighet || 0) + 1;
    if (includesTag(tags, "kollega")) delta.kollega_tillit = (delta.kollega_tillit || 0) + 1;
    if (includesTag(tags, "drift")) delta.driftsflyt = (delta.driftsflyt || 0) + 1;
    if (includesTag(tags, "salg")) delta.salgserfaring = (delta.salgserfaring || 0) + 1;
    if (includesTag(tags, "vertskap")) {
      delta.brand_tillit = (delta.brand_tillit || 0) + 1;
      delta.kundetillit = (delta.kundetillit || 0) + 1;
    }
    if (includesTag(tags, "brandstandard")) delta.brand_tillit = (delta.brand_tillit || 0) + 1;

    if (includesTag(tags, "snarvei")) {
      delta.risiko = (delta.risiko || 0) + 1;
      delta.brand_tillit = (delta.brand_tillit || 0) - 1;
    }
    if (includesTag(tags, "tempo")) {
      delta.driftsflyt = (delta.driftsflyt || 0) + 1;
      delta.stress = (delta.stress || 0) + 1;
    }
    if (includesTag(tags, "rush") || ["rush", "hoy_ko", "travelt_gulv"].includes(pressure)) {
      delta.stress = (delta.stress || 0) + 1;
    }

    const effect = Number(choice?.effect || 0);
    const integrityTags = ["kvalitet", "fag", "kunde", "brandstandard"];
    if (effect > 0 && integrityTags.some((k) => includesTag(tags, k))) {
      delta.integritet = (delta.integritet || 0) + 1;
    }
    if (effect < 0) {
      if (includesTag(tags, "snarvei") || includesTag(tags, "tempo")) {
        delta.brand_tillit = (delta.brand_tillit || 0) - 1;
      } else {
        delta.integritet = (delta.integritet || 0) - 1;
      }
    }

    return { delta, tags: rawTags.map((t) => norm(t)).filter(Boolean) };
  }

  function applyChoiceConsequences(eventObj, choice) {
    const active = window.CivicationState?.getActivePosition?.() || null;
    const activeBrandId = slugify(active?.brand_id);
    const eventBrandId = slugify(eventObj?.brand_id);
    const roleScope = norm(eventObj?.role_scope || window.CivicationCareerRoleResolver?.resolveCareerRoleScope?.(active));
    const eventTags = Array.isArray(eventObj?.mail_tags) ? eventObj.mail_tags.map((t) => slugify(t)) : [];

    if (!active || !activeBrandId) return { ok: false, changed: false, reason: "no_active_brand" };
    if (!eventObj || norm(eventObj?.source_type) !== "planned") return { ok: false, changed: false, reason: "not_planned" };
    if (!eventBrandId) return { ok: false, changed: false, reason: "no_event_brand" };
    if (eventBrandId !== activeBrandId) return { ok: false, changed: false, reason: "brand_mismatch" };
    if (roleScope !== "ekspeditor") return { ok: false, changed: false, reason: "wrong_role_scope" };
    if (!(eventTags.includes("brand_mail") || eventBrandId)) return { ok: false, changed: false, reason: "not_brand_mail" };

    const mailId = norm(eventObj?.id);
    const choiceId = norm(choice?.id);
    if (!mailId || !choiceId) return { ok: false, changed: false, reason: "missing_ids" };

    const state = getState();
    const { key, entry } = ensureEntry(state, eventObj, active, roleScope);
    const dedupeKey = `${mailId}::${choiceId}`;
    if (entry.answered_mail_ids.includes(mailId) || entry.history.some((h) => `${norm(h.mail_id)}::${norm(h.choice_id)}` === dedupeKey)) {
      return { ok: true, changed: false, reason: "already_applied" };
    }

    const { delta, tags } = deriveDelta(eventObj, choice);
    const deltaKeys = Object.keys(delta).filter((k) => (Number(delta[k]) || 0) !== 0);
    if (!deltaKeys.length) return { ok: true, changed: false, reason: "no_delta" };

    deltaKeys.forEach((k) => {
      entry.metrics[k] = clamp((entry.metrics[k] || 0) + delta[k]);
    });

    entry.answered_mail_ids.push(mailId);
    entry.history.push({
      at: new Date().toISOString(),
      mail_id: mailId,
      choice_id: choiceId,
      brand_id: eventBrandId,
      brand_name: norm(eventObj?.brand_name || active?.brand_name),
      role_scope: roleScope,
      mail_family: norm(eventObj?.mail_family),
      mail_type: norm(eventObj?.mail_type),
      tags,
      delta
    });
    entry.history = entry.history.slice(-MAX_HISTORY);

    const nextState = {
      version: VERSION,
      byBrandRole: { ...state.byBrandRole, [key]: entry },
      last_change: {
        at: new Date().toISOString(),
        key,
        brand_id: eventBrandId,
        brand_name: norm(eventObj?.brand_name || active?.brand_name),
        role_scope: roleScope,
        mail_id: mailId,
        choice_id: choiceId,
        delta
      },
      updated_at: new Date().toISOString()
    };
    const saved = setState(nextState);
    return { ok: true, changed: saved.changed, key, delta };
  }

  function getLastChange() {
    return getState()?.last_change || null;
  }

  function inspect() {
    const state = getState();
    return { storage_key: STORAGE_KEY, state };
  }

  window.CivicationBrandJobState = { getState, setState, reset, applyChoiceConsequences, getLastChange, inspect };
})();
