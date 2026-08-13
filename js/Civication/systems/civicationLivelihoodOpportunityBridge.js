(function initCivicationLivelihoodOpportunityBridge(globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);
  const TEMPLATE_PATH = "data/Civication/livelihoodOpportunityTemplates.json";
  const STRICT_ID = /^[a-z0-9][a-z0-9_-]*$/;
  let templatePromise = null;

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 72);
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
    const date = new Date();
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  }

  async function ensureTemplatesLoaded() {
    if (Array.isArray(window.CIVI_LIVELIHOOD_OPPORTUNITY_TEMPLATES?.templates)) {
      return window.CIVI_LIVELIHOOD_OPPORTUNITY_TEMPLATES;
    }
    if (templatePromise) return templatePromise;
    if (typeof fetch !== "function") return null;

    templatePromise = fetch(TEMPLATE_PATH, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !Array.isArray(json.templates)) throw new Error("templates must be an array");
        window.CIVI_LIVELIHOOD_OPPORTUNITY_TEMPLATES = json;
        return json;
      })
      .catch((error) => {
        console.warn("[CivicationLivelihoodOpportunityBridge] templates kunne ikke lastes", error);
        return null;
      });

    return templatePromise;
  }

  function getLivelihoodState() {
    return window.CivicationLivelihoods?.getState?.() || { opportunities: [], streams: [], ledger: [] };
  }

  function livelihoodIdExists(id) {
    const state = getLivelihoodState();
    return (Array.isArray(state.opportunities) && state.opportunities.some((entry) => entry?.id === id)) ||
      (Array.isArray(state.streams) && state.streams.some((entry) => entry?.id === id));
  }

  function deriveEventSource(eventObj) {
    return {
      type: String(eventObj?.source_type || "event").trim() || "event",
      id: String(eventObj?.id || "").trim() || null,
      label: String(eventObj?.source || eventObj?.subject || eventObj?.title || "Civication-hendelse").trim()
    };
  }

  function normalizeOpportunityTemplate(raw, context) {
    if (!raw || typeof raw !== "object") return null;
    const eventObj = context?.event || {};
    const choice = context?.choice || {};
    const sequence = Number(context?.sequence || 0);
    const explicitId = String(raw.id || "").trim();
    const generatedId = `event_${slug(eventObj.id || "event")}_${slug(choice.id || "choice")}_${sequence}`;
    const id = explicitId || generatedId;
    if (!STRICT_ID.test(id)) return null;

    const choiceIds = Array.isArray(raw.choice_ids) ? raw.choice_ids.map(String) : [];
    if (choiceIds.length && !choiceIds.includes(String(choice.id || ""))) return null;

    return {
      id,
      kind_id: String(raw.kind_id || "").trim(),
      label: String(raw.label || "").trim(),
      description: String(raw.description || "").trim() || null,
      source: raw.source && typeof raw.source === "object" ? raw.source : deriveEventSource(eventObj),
      income: raw.income,
      cadence: raw.cadence,
      direct_costs: raw.direct_costs,
      requires_unemployed: raw.requires_unemployed,
      requires_life_positions: raw.requires_life_positions,
      related_life_positions: raw.related_life_positions,
      starts_week: raw.starts_week,
      ends_week: raw.ends_week,
      expires_at: raw.expires_at,
      metadata: {
        ...(raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {}),
        producer: "resolved_event_choice",
        event_id: String(eventObj.id || "") || null,
        choice_id: String(choice.id || "") || null
      }
    };
  }

  function collectEventOpportunityTemplates(eventObj, choice) {
    const entries = [];
    const push = (value) => {
      if (Array.isArray(value)) entries.push(...value);
      else if (value && typeof value === "object") entries.push(value);
    };
    push(eventObj?.livelihood_opportunity);
    push(eventObj?.livelihood_opportunities);
    push(choice?.livelihood_opportunity);
    push(choice?.livelihood_opportunities);
    return entries;
  }

  async function materializeFromResolvedChoice(eventObj, choice, answerResult) {
    if (!answerResult?.ok) return [];
    if (!window.CivicationLivelihoods?.createOpportunity) return [];
    await window.CivicationLivelihoods.ensureCatalogLoaded?.();

    const templates = collectEventOpportunityTemplates(eventObj, choice);
    const results = [];
    for (let i = 0; i < templates.length; i += 1) {
      const opportunity = normalizeOpportunityTemplate(templates[i], { event: eventObj, choice, sequence: i });
      if (!opportunity || !opportunity.kind_id || !opportunity.label) continue;
      if (livelihoodIdExists(opportunity.id)) {
        results.push({ ok: false, reason: "duplicate_livelihood_id", id: opportunity.id });
        continue;
      }
      results.push(window.CivicationLivelihoods.createOpportunity(opportunity));
    }
    return results;
  }

  function findPendingEvent(engine, eventId, choiceId) {
    const inbox = typeof engine?.getInbox === "function" ? engine.getInbox() : [];
    const item = Array.isArray(inbox)
      ? inbox.find((entry) => entry?.status === "pending" && entry?.event?.id === eventId)
      : null;
    const eventObj = item?.event || null;
    const choice = Array.isArray(eventObj?.choices)
      ? eventObj.choices.find((entry) => entry?.id === choiceId) || null
      : null;
    return { event: eventObj, choice };
  }

  function attachToEngine(engine) {
    if (!engine || typeof engine.answer !== "function") return false;
    if (engine.__livelihoodOpportunityBridgeAttached) return true;

    const baseAnswer = engine.answer.bind(engine);
    engine.answer = async function answerWithLivelihood(eventId, choiceId) {
      const captured = findPendingEvent(engine, eventId, choiceId);
      const result = await baseAnswer(eventId, choiceId);
      let livelihoodOpportunities = [];
      try {
        livelihoodOpportunities = await materializeFromResolvedChoice(captured.event, captured.choice, result);
      } catch (error) {
        console.warn("[CivicationLivelihoodOpportunityBridge] event opportunity failed", error);
      }
      return { ...result, livelihoodOpportunities };
    };
    engine.__livelihoodOpportunityBridgeAttached = true;
    return true;
  }

  function getActiveLifePositions() {
    const state = window.CivicationLifePositions?.getState?.();
    const byBadge = state?.active_by_badge && typeof state.active_by_badge === "object"
      ? state.active_by_badge
      : {};
    return Object.entries(byBadge).flatMap(([badgeId, value]) => {
      if (!value || typeof value !== "object") return [];
      const label = String(value.label || "").trim();
      return label ? [{ badge_id: String(badgeId), label }] : [];
    });
  }

  function weeklyOpportunityId(templateId, week) {
    return `life_${slug(templateId)}_${slug(week)}`;
  }

  async function produceWeeklyLifePositionOpportunities() {
    if (!window.CivicationLivelihoods?.createOpportunity) return { produced: 0, results: [] };
    await window.CivicationLivelihoods.ensureCatalogLoaded?.();
    const catalog = await ensureTemplatesLoaded();
    const templates = Array.isArray(catalog?.templates) ? catalog.templates : [];
    const active = getActiveLifePositions();
    const week = currentWeekKey();
    const results = [];

    for (const template of templates) {
      const badgeId = String(template?.badge_id || "").trim();
      const lifeLabel = String(template?.life_position_label || "").trim();
      if (!badgeId || !lifeLabel) continue;
      if (!active.some((entry) => entry.badge_id === badgeId && entry.label === lifeLabel)) continue;

      const id = weeklyOpportunityId(template.id, week);
      if (livelihoodIdExists(id)) continue;

      const chance = Math.max(0, Math.min(1, Number(template.weekly_chance || 0)));
      if (hashUnit(`${template.id}|${week}|offer`) >= chance) continue;

      const result = window.CivicationLivelihoods.createOpportunity({
        id,
        kind_id: template.kind_id,
        label: template.label,
        description: template.description,
        source: {
          type: "life_position_network",
          id: `${slug(template.id)}_${slug(week)}`,
          label: String(template.source_label || lifeLabel)
        },
        income: template.income,
        cadence: template.cadence,
        direct_costs: template.direct_costs,
        related_life_positions: [{ badge_id: badgeId, label: lifeLabel }],
        metadata: {
          producer: "weekly_life_position_network",
          template_id: template.id,
          week,
          badge_id: badgeId,
          life_position_label: lifeLabel
        }
      });
      results.push(result);
    }

    return { produced: results.filter((entry) => entry?.ok).length, results };
  }

  function init(engine) {
    attachToEngine(engine || window.HG_CiviEngine);
    produceWeeklyLifePositionOpportunities().catch((error) => {
      console.warn("[CivicationLivelihoodOpportunityBridge] weekly producer failed", error);
    });
  }

  window.CivicationLivelihoodOpportunityBridge = {
    ensureTemplatesLoaded,
    attachToEngine,
    materializeFromResolvedChoice,
    produceWeeklyLifePositionOpportunities,
    init
  };

  window.addEventListener?.("civi:lifePositionChanged", () => {
    produceWeeklyLifePositionOpportunities().catch(() => {});
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = window.CivicationLivelihoodOpportunityBridge;
  }
})(typeof window !== "undefined" ? window : globalThis);
