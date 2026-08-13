(function initCivicationLivelihoodRuntime(globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);
  const LS_KEY = "hg_civi_livelihood_v1";
  const CATALOG_PATH = "data/Civication/livelihoodCatalog.json";
  const STRICT_ID = /^[a-z0-9][a-z0-9_-]*$/;
  const VALID_CADENCES = new Set(["one_time", "recurring"]);
  let catalogPromise = null;

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function normalizeState(raw) {
    const value = raw && typeof raw === "object" ? raw : {};
    return {
      version: 1,
      opportunities: Array.isArray(value.opportunities) ? value.opportunities : [],
      streams: Array.isArray(value.streams) ? value.streams : [],
      ledger: Array.isArray(value.ledger) ? value.ledger : []
    };
  }

  function getState() {
    return normalizeState(safeParse(localStorage.getItem(LS_KEY), {}));
  }

  function setState(next) {
    const normalized = normalizeState(next);
    localStorage.setItem(LS_KEY, JSON.stringify(normalized));
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    try { window.dispatchEvent(new Event("civi:livelihoodChanged")); } catch {}
    return normalized;
  }

  async function ensureCatalogLoaded() {
    if (Array.isArray(window.CIVI_LIVELIHOOD_CATALOG?.kinds)) {
      return window.CIVI_LIVELIHOOD_CATALOG;
    }
    if (catalogPromise) return catalogPromise;
    if (typeof fetch !== "function") return null;

    catalogPromise = fetch(CATALOG_PATH, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !Array.isArray(json.kinds)) throw new Error("catalog kinds must be an array");
        window.CIVI_LIVELIHOOD_CATALOG = json;
        try { window.dispatchEvent(new Event("civi:livelihoodCatalogLoaded")); } catch {}
        return json;
      })
      .catch((error) => {
        console.warn("[CivicationLivelihoods] livelihood catalog kunne ikke lastes", error);
        return null;
      });

    return catalogPromise;
  }

  function getKind(kindId) {
    const id = String(kindId || "").trim();
    const kinds = Array.isArray(window.CIVI_LIVELIHOOD_CATALOG?.kinds)
      ? window.CIVI_LIVELIHOOD_CATALOG.kinds
      : [];
    return kinds.find((kind) => String(kind?.id || "").trim() === id) || null;
  }

  function hasSourceProvenance(source) {
    if (!source || typeof source !== "object") return false;
    const type = String(source.type || "").trim();
    const id = String(source.id || source.source_id || "").trim();
    const label = String(source.label || source.name || "").trim();
    return !!type && !!(id || label);
  }

  function clampProbability(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 1;
    return Math.max(0, Math.min(1, number));
  }

  function normalizeIncome(input, defaultModel) {
    const raw = input && typeof input === "object" ? input : {};
    const model = String(raw.model || defaultModel || "fixed").trim();

    if (model === "zero") {
      return { model: "zero", amount: 0 };
    }

    if (model === "fixed") {
      const amount = Number(raw.amount);
      if (!Number.isFinite(amount) || amount < 0) return null;
      return { model: "fixed", amount: Math.round(amount) };
    }

    if (model === "variable" || model === "occasional") {
      const min = Number(raw.min);
      const max = Number(raw.max);
      if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) return null;
      return {
        model,
        min: Math.round(min),
        max: Math.round(max),
        probability: model === "occasional" ? clampProbability(raw.probability) : 1
      };
    }

    return null;
  }

  function normalizeCadence(input, fallback) {
    const cadence = String(input || fallback || "recurring").trim();
    return VALID_CADENCES.has(cadence) ? cadence : null;
  }

  function normalizeCosts(input) {
    const raw = input && typeof input === "object" ? input : {};
    const fixed = Number(raw.fixed || 0);
    const rate = Number(raw.rate || 0);
    return {
      fixed: Number.isFinite(fixed) ? Math.max(0, Math.round(fixed)) : 0,
      rate: Number.isFinite(rate) ? Math.max(0, Math.min(1, rate)) : 0
    };
  }

  function normalizeLifeRequirements(input) {
    const list = Array.isArray(input) ? input : [];
    return list.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const badgeId = String(item.badge_id || "").trim();
      const label = String(item.label || "").trim();
      return badgeId && label ? [{ badge_id: badgeId, label }] : [];
    });
  }

  function isLifeRequirementMet(requirement) {
    const lifeState = window.CivicationLifePositions?.getState?.();
    const active = lifeState?.active_by_badge?.[requirement.badge_id];
    return !!active && String(active.label || "") === requirement.label;
  }

  function getFormalEmployment() {
    const active = window.CivicationState?.getActivePosition?.() || null;
    return { employed: !!active?.career_id, active_job: active };
  }

  function isOpportunityEligible(opportunity) {
    if (!opportunity || opportunity.status !== "pending") {
      return { ok: false, reason: "opportunity_not_pending" };
    }
    const employment = getFormalEmployment();
    if (opportunity.requires_unemployed && employment.employed) {
      return { ok: false, reason: "requires_unemployed" };
    }
    const requirements = normalizeLifeRequirements(opportunity.requires_life_positions);
    if (requirements.length && !requirements.every(isLifeRequirementMet)) {
      return { ok: false, reason: "life_position_requirement_not_met" };
    }
    if (opportunity.expires_at && Date.parse(opportunity.expires_at) < Date.now()) {
      return { ok: false, reason: "opportunity_expired" };
    }
    return { ok: true };
  }

  function nextGeneratedId(prefix) {
    const base = `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    return base.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  }

  function createOpportunity(input) {
    const raw = input && typeof input === "object" ? input : {};
    const kindId = String(raw.kind_id || "").trim();
    const kind = getKind(kindId);
    if (!kind) return { ok: false, reason: "unknown_livelihood_kind" };
    if (!hasSourceProvenance(raw.source)) return { ok: false, reason: "source_provenance_required" };

    const id = String(raw.id || nextGeneratedId("livopp")).trim();
    if (!STRICT_ID.test(id)) return { ok: false, reason: "invalid_opportunity_id" };

    const state = getState();
    if (state.opportunities.some((entry) => entry.id === id) || state.streams.some((entry) => entry.id === id)) {
      return { ok: false, reason: "duplicate_livelihood_id" };
    }

    const income = normalizeIncome(raw.income, kind.default_model);
    if (!income) return { ok: false, reason: "invalid_income_model" };
    const cadence = normalizeCadence(raw.cadence, kind.default_cadence);
    if (!cadence) return { ok: false, reason: "invalid_livelihood_cadence" };

    const requiresUnemployed = kind.can_coexist_with_job === false
      ? true
      : !!raw.requires_unemployed;

    const opportunity = {
      id,
      kind_id: kindId,
      label: String(raw.label || kind.label || kindId).trim(),
      description: String(raw.description || kind.description || "").trim() || null,
      status: "pending",
      source: {
        type: String(raw.source.type || "").trim(),
        id: String(raw.source.id || raw.source.source_id || "").trim() || null,
        label: String(raw.source.label || raw.source.name || "").trim() || null
      },
      income,
      cadence,
      direct_costs: normalizeCosts(raw.direct_costs),
      requires_unemployed: requiresUnemployed,
      can_coexist_with_job: kind.can_coexist_with_job !== false,
      requires_life_positions: normalizeLifeRequirements(raw.requires_life_positions),
      related_life_positions: normalizeLifeRequirements(raw.related_life_positions),
      starts_week: raw.starts_week ? String(raw.starts_week) : null,
      ends_week: raw.ends_week ? String(raw.ends_week) : null,
      expires_at: raw.expires_at ? String(raw.expires_at) : null,
      created_at: nowIso(),
      metadata: raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {}
    };

    setState({ ...state, opportunities: [opportunity].concat(state.opportunities).slice(0, 100) });
    return { ok: true, opportunity };
  }

  function acceptOpportunity(opportunityId) {
    const id = String(opportunityId || "").trim();
    const state = getState();
    const opportunity = state.opportunities.find((entry) => entry.id === id) || null;
    const eligibility = isOpportunityEligible(opportunity);
    if (!eligibility.ok) return eligibility;

    const acceptedAt = nowIso();
    const stream = {
      ...opportunity,
      status: "active",
      accepted_at: acceptedAt,
      stream_id: `stream_${opportunity.id}`
    };
    const opportunities = state.opportunities.map((entry) => entry.id === id
      ? { ...entry, status: "accepted", accepted_at: acceptedAt }
      : entry);
    const streams = [stream].concat(state.streams.filter((entry) => entry.id !== id));
    setState({ ...state, opportunities, streams });
    return { ok: true, stream };
  }

  function rejectOpportunity(opportunityId) {
    const id = String(opportunityId || "").trim();
    const state = getState();
    if (!state.opportunities.some((entry) => entry.id === id && entry.status === "pending")) {
      return { ok: false, reason: "opportunity_not_pending" };
    }
    const rejectedAt = nowIso();
    const opportunities = state.opportunities.map((entry) => entry.id === id
      ? { ...entry, status: "rejected", rejected_at: rejectedAt }
      : entry);
    setState({ ...state, opportunities });
    return { ok: true };
  }

  function closeStream(streamId, reason) {
    const id = String(streamId || "").trim();
    const state = getState();
    const matches = (entry) => entry.id === id || entry.stream_id === id;
    if (!state.streams.some((entry) => matches(entry) && entry.status === "active")) {
      return { ok: false, reason: "stream_not_active" };
    }
    const closedAt = nowIso();
    const streams = state.streams.map((entry) => matches(entry)
      ? { ...entry, status: "closed", closed_at: closedAt, close_reason: String(reason || "ended") }
      : entry);
    setState({ ...state, streams });
    return { ok: true };
  }

  function hashUnit(text) {
    let hash = 2166136261;
    const input = String(text || "");
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967295;
  }

  function currentWeekKey() {
    try {
      if (typeof window.weekKey === "function") return String(window.weekKey(new Date()));
    } catch {}
    return new Date().toISOString().slice(0, 10);
  }

  function isStreamScheduled(stream, weekKeyValue) {
    if (stream.starts_week && String(weekKeyValue) < String(stream.starts_week)) return false;
    if (stream.ends_week && String(weekKeyValue) > String(stream.ends_week)) return false;
    return true;
  }

  function computeGross(stream, weekKeyValue) {
    const income = stream?.income || { model: "zero", amount: 0 };
    if (income.model === "zero") return { gross: 0, occurred: true };
    if (income.model === "fixed") return { gross: Math.round(Number(income.amount) || 0), occurred: true };

    const min = Math.round(Number(income.min) || 0);
    const max = Math.round(Number(income.max) || min);
    if (income.model === "occasional") {
      const occurrence = hashUnit(`${stream.id}|${weekKeyValue}|occurrence`);
      if (occurrence >= clampProbability(income.probability)) return { gross: 0, occurred: false };
    }
    const roll = hashUnit(`${stream.id}|${weekKeyValue}|amount`);
    const gross = min + Math.floor(roll * (max - min + 1));
    return { gross, occurred: true };
  }

  function computeStreamWeek(stream, weekKeyValue, employment) {
    if (!stream || stream.status !== "active") return null;
    const base = {
      stream_id: stream.id,
      kind_id: stream.kind_id,
      label: stream.label,
      cadence: stream.cadence || "recurring"
    };
    if (!isStreamScheduled(stream, weekKeyValue)) {
      return { ...base, gross: 0, costs: 0, net: 0, occurred: false, reason: "outside_schedule" };
    }
    if (stream.requires_unemployed && employment?.employed) {
      return { ...base, gross: 0, costs: 0, net: 0, occurred: false, reason: "paused_while_employed" };
    }

    const incomeResult = computeGross(stream, weekKeyValue);
    const fixedCosts = Number(stream?.direct_costs?.fixed || 0);
    const rate = Number(stream?.direct_costs?.rate || 0);
    const costs = incomeResult.occurred
      ? Math.max(0, Math.round(fixedCosts + Math.max(0, incomeResult.gross) * rate))
      : 0;
    return {
      ...base,
      gross: incomeResult.gross,
      costs,
      net: incomeResult.gross - costs,
      occurred: incomeResult.occurred,
      reason: incomeResult.occurred ? "settled" : "no_income_event"
    };
  }

  function prepareWeekSettlement(weekKeyValue) {
    const week = String(weekKeyValue || currentWeekKey());
    const state = getState();
    const employment = getFormalEmployment();
    const items = state.streams
      .filter((stream) => stream.status === "active")
      .map((stream) => computeStreamWeek(stream, week, employment))
      .filter(Boolean);
    const totals = items.reduce((acc, item) => {
      acc.gross += Number(item.gross || 0);
      acc.costs += Number(item.costs || 0);
      acc.net += Number(item.net || 0);
      return acc;
    }, { gross: 0, costs: 0, net: 0 });
    return { week, employment, items, ...totals };
  }

  function getWalletSettlementWeeks(wallet) {
    return Array.isArray(wallet?.livelihood_settled_weeks)
      ? wallet.livelihood_settled_weeks.map(String)
      : [];
  }

  function walletBalance(wallet) {
    if (Number.isFinite(Number(wallet?.balance))) return Number(wallet.balance);
    if (Number.isFinite(Number(wallet?.pc))) return Number(wallet.pc);
    return 0;
  }

  function settleWeekToWallet(weekKeyValue) {
    if (!window.CivicationState?.getWallet || !window.CivicationState?.updateWallet) {
      return { ok: false, reason: "wallet_api_missing" };
    }
    const week = String(weekKeyValue || currentWeekKey());
    const wallet = window.CivicationState.getWallet() || { balance: 0, last_tick_iso: null };
    const settledWeeks = getWalletSettlementWeeks(wallet);
    if (settledWeeks.includes(week)) {
      return { ok: true, applied: false, reason: "already_settled", week };
    }

    const prepared = prepareWeekSettlement(week);
    const nextWallet = {
      ...wallet,
      balance: walletBalance(wallet) + prepared.net,
      livelihood_settled_weeks: [week].concat(settledWeeks).slice(0, 104)
    };
    window.CivicationState.updateWallet(nextWallet);

    const state = getState();
    const oneTimeSettledIds = new Set(
      prepared.items
        .filter((item) => item.cadence === "one_time" && item.reason === "settled")
        .map((item) => item.stream_id)
    );
    const settledAt = nowIso();
    const streams = state.streams.map((stream) => oneTimeSettledIds.has(stream.id)
      ? { ...stream, status: "closed", closed_at: settledAt, close_reason: "one_time_settled" }
      : stream);
    const ledgerEntry = {
      type: "weekly_settlement",
      week,
      gross: prepared.gross,
      costs: prepared.costs,
      net: prepared.net,
      items: prepared.items,
      employment_status: prepared.employment.employed ? "employed" : "unemployed",
      settled_at: settledAt
    };
    setState({ ...state, streams, ledger: [ledgerEntry].concat(state.ledger).slice(0, 260) });
    return { ok: true, applied: true, ...ledgerEntry };
  }

  function getSnapshot() {
    const state = getState();
    const wallet = window.CivicationState?.getWallet?.() || { balance: 0 };
    const week = currentWeekKey();
    const projection = prepareWeekSettlement(week);
    const settledWeeks = getWalletSettlementWeeks(wallet);
    return {
      week,
      active_streams: state.streams.filter((entry) => entry.status === "active"),
      pending_opportunities: state.opportunities.filter((entry) => entry.status === "pending"),
      current_week_projection: projection,
      already_settled_this_week: settledWeeks.includes(week),
      last_settlement: state.ledger.find((entry) => entry.type === "weekly_settlement") || null,
      ledger: state.ledger
    };
  }

  function attachEconomyBridge() {
    const engine = window.CivicationEconomyEngine;
    if (!engine || typeof engine.tickWeekly !== "function") return false;
    if (engine.__livelihoodBridgeAttached) return true;

    const baseTickWeekly = engine.tickWeekly.bind(engine);
    const baseSnapshot = typeof engine.getEconomySnapshot === "function"
      ? engine.getEconomySnapshot.bind(engine)
      : null;

    engine.tickWeekly = function tickWeeklyWithLivelihood() {
      const walletBefore = window.CivicationState?.getWallet?.() || {};
      const week = currentWeekKey();
      const alreadySettled = getWalletSettlementWeeks(walletBefore).includes(week);
      const result = baseTickWeekly();
      if (!alreadySettled) settleWeekToWallet(week);
      return result;
    };

    if (baseSnapshot) {
      engine.getEconomySnapshot = function getEconomySnapshotWithLivelihood() {
        const base = baseSnapshot();
        const livelihood = getSnapshot();
        const projectedNet = livelihood.already_settled_this_week
          ? Number(livelihood?.last_settlement?.net || 0)
          : Number(livelihood?.current_week_projection?.net || 0);
        return {
          ...base,
          livelihood,
          weeklyLivelihoodProjectedNet: projectedNet,
          estimatedNetAfterHome: Number(base?.estimatedNetAfterHome || 0) + projectedNet
        };
      };
      window.HG_CiviEconomySnapshot = engine.getEconomySnapshot;
    }

    engine.__livelihoodBridgeAttached = true;
    return true;
  }

  window.CivicationLivelihoods = {
    getState,
    ensureCatalogLoaded,
    getKind,
    createOpportunity,
    isOpportunityEligible,
    acceptOpportunity,
    rejectOpportunity,
    closeStream,
    computeStreamWeek,
    prepareWeekSettlement,
    settleWeekToWallet,
    getSnapshot,
    attachEconomyBridge
  };

  ensureCatalogLoaded();
  attachEconomyBridge();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = window.CivicationLivelihoods;
  }
})(typeof window !== "undefined" ? window : globalThis);
