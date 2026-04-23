(function () {
  "use strict";

  const LS_DEBATE = "hg_civi_debate_v1";
  const LS_FIRST_DEBATE = "hg_civi_first_debate_v1";

  const DEFAULT_STATE = {
    current: null,
    last_result: null,
    history: []
  };

  const SCENARIOS = {
    naeringsliv: {
      arbeider: [
        {
          id: "arbeider_tempo_sikkerhet",
          title: "Tempo mot sikkerhet på gulvet",
          opponent: "Driftsleder",
          theme: "Arbeidsliv",
          description: "Du blir presset på at laget må øke tempoet, selv om flere små tegn peker mot at sikkerhetsmarginen allerede er for tynn.",
          relevant_categories: ["naeringsliv", "politikk"],
          required_access_debate: ["arbeidsliv"],
          opponent_profile: { economic: 74, symbolic: 56, political: 52, social: 40 },
          strategies: ["fakta", "sosial", "prinsipp", "politisk"]
        },
        {
          id: "arbeider_innleie_ansvar",
          title: "Innleie og ansvar",
          opponent: "HR-koordinator",
          theme: "Bemanning",
          description: "Det argumenteres for mer innleie for å holde kostnader nede. Du vet at erfaring, opplæring og ansvar glipper når folk byttes for raskt ut.",
          relevant_categories: ["naeringsliv", "politikk", "historie"],
          required_access_debate: ["arbeidsliv", "klasse"],
          opponent_profile: { economic: 68, symbolic: 48, political: 58, social: 46 },
          strategies: ["fakta", "okonomisk", "sosial", "politisk"]
        }
      ],
      fagarbeider: [
        {
          id: "fagarbeider_kvalitet_standard",
          title: "Kvalitet mot produksjonspress",
          opponent: "Produksjonsleder",
          theme: "Faglig standard",
          description: "Du ser at standarden er i ferd med å tøyes for å få ting unna raskere. Motparten kaller det pragmatisme.",
          relevant_categories: ["naeringsliv", "vitenskap"],
          required_access_debate: ["arbeidsliv"],
          opponent_profile: { economic: 66, symbolic: 58, political: 44, social: 42 },
          strategies: ["fakta", "prinsipp", "symbolsk", "okonomisk"]
        },
        {
          id: "fagarbeider_opplaering_ansvar",
          title: "Opplæring eller ren drift",
          opponent: "Skiftleder",
          theme: "Kompetanse",
          description: "Det forventes at du lærer opp nye folk uten at det gis rom for det i produksjonen. Du må argumentere for hvorfor kvalitet i opplæring faktisk er en del av driften.",
          relevant_categories: ["naeringsliv", "vitenskap", "politikk"],
          required_access_debate: ["arbeidsliv", "kultur"],
          opponent_profile: { economic: 61, symbolic: 49, political: 47, social: 50 },
          strategies: ["fakta", "sosial", "prinsipp", "politisk"]
        }
      ],
      mellomleder: [
        {
          id: "mellomleder_lojalitet_team",
          title: "Lojalitet til team eller styringslinje",
          opponent: "Avdelingsleder",
          theme: "Ledelse",
          description: "Du presses til å roe ned kritikken fra teamet ditt og presentere situasjonen penere oppover enn den faktisk er.",
          relevant_categories: ["naeringsliv", "politikk", "psykologi"],
          required_access_debate: ["arbeidsliv", "makt"],
          opponent_profile: { economic: 64, symbolic: 66, political: 63, social: 45 },
          strategies: ["politisk", "symbolsk", "sosial", "prinsipp"]
        },
        {
          id: "mellomleder_rapport_virkelighet",
          title: "Rapporten mot virkeligheten",
          opponent: "Controller",
          theme: "Styring",
          description: "Tallene ser pene ut, men du vet at de skjuler slitasje og utsatte problemer som snart vil koste mer enn de sparer.",
          relevant_categories: ["naeringsliv", "politikk", "by"],
          required_access_debate: ["arbeidsliv", "byutvikling"],
          opponent_profile: { economic: 72, symbolic: 52, political: 58, social: 36 },
          strategies: ["fakta", "okonomisk", "politisk", "prinsipp"]
        }
      ],
      formann: [
        {
          id: "formann_tempo_forsvarlighet",
          title: "Tempo mot forsvarlighet",
          opponent: "Områdesjef",
          theme: "Produksjon",
          description: "Du ser at tempoet ovenfra blir solgt inn som nødvendig effektivitet, men på gulvet merkes det som innarbeidet risiko. Du må forsvare laget uten å miste styring i rommet.",
          relevant_categories: ["naeringsliv", "politikk", "vitenskap"],
          required_access_debate: ["arbeidsliv", "makt"],
          opponent_profile: { economic: 78, symbolic: 62, political: 59, social: 38 },
          strategies: ["fakta", "okonomisk", "sosial", "politisk", "prinsipp"]
        },
        {
          id: "formann_bemanning_slitasje",
          title: "Bemanning og taus slitasje",
          opponent: "HR-partner",
          theme: "Arbeidsmiljø",
          description: "Motparten hevder at bemanningen er forsvarlig fordi tallene fortsatt holder. Du vet at slit og stillhet på gulvet ikke synes i rapporten før det er for sent.",
          relevant_categories: ["naeringsliv", "psykologi", "politikk"],
          required_access_debate: ["arbeidsliv", "livskvalitet"],
          opponent_profile: { economic: 67, symbolic: 55, political: 61, social: 47 },
          strategies: ["fakta", "sosial", "symbolsk", "prinsipp", "politisk"]
        }
      ]
    }
  };

  const STRATEGIES = {
    fakta: {
      label: "Bruk fakta",
      capitalKey: "cultural",
      identityKey: "cultural",
      knowledgeWeight: 0.55,
      capitalWeight: 0.15,
      identityWeight: 0.10,
      psyche: "integrity",
      psycheWeight: 0.20,
      verbs: ["dokumenterer", "forankrer", "underbygger"]
    },
    okonomisk: {
      label: "Bruk ressurslogikk",
      capitalKey: "economic",
      identityKey: "economic",
      knowledgeWeight: 0.25,
      capitalWeight: 0.40,
      identityWeight: 0.15,
      psyche: "economicRoom",
      psycheWeight: 0.20,
      verbs: ["regner", "omrammer", "kostnadssetter"]
    },
    sosial: {
      label: "Bruk relasjoner",
      capitalKey: "social",
      identityKey: "social",
      knowledgeWeight: 0.15,
      capitalWeight: 0.35,
      identityWeight: 0.20,
      psyche: "trust",
      psycheWeight: 0.30,
      verbs: ["samler", "forankrer", "allierer"]
    },
    symbolsk: {
      label: "Bruk autoritet",
      capitalKey: "symbolic",
      identityKey: "symbolic",
      knowledgeWeight: 0.20,
      capitalWeight: 0.30,
      identityWeight: 0.15,
      psyche: "visibility",
      psycheWeight: 0.35,
      verbs: ["markerer", "rammer inn", "tyngesetter"]
    },
    politisk: {
      label: "Bruk systemforståelse",
      capitalKey: "political",
      identityKey: "political",
      knowledgeWeight: 0.25,
      capitalWeight: 0.30,
      identityWeight: 0.20,
      psyche: "autonomy",
      psycheWeight: 0.25,
      verbs: ["posisjonerer", "omdirigerer", "forhandler"]
    },
    prinsipp: {
      label: "Stå på prinsipp",
      capitalKey: "symbolic",
      identityKey: "cultural",
      knowledgeWeight: 0.20,
      capitalWeight: 0.15,
      identityWeight: 0.10,
      psyche: "integrity",
      psycheWeight: 0.55,
      verbs: ["nekter", "står i", "holder linjen"]
    },
    subkultur: {
      label: "Bruk autentisitet",
      capitalKey: "subculture",
      identityKey: "subculture",
      knowledgeWeight: 0.10,
      capitalWeight: 0.35,
      identityWeight: 0.25,
      psyche: "autonomy",
      psycheWeight: 0.30,
      verbs: ["avkler", "utfordrer", "bryter opp"]
    }
  };

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LS_DEBATE) || "{}");
      return parsed && typeof parsed === "object"
        ? {
            current: parsed.current || null,
            last_result: parsed.last_result || null,
            history: Array.isArray(parsed.history) ? parsed.history : []
          }
        : { ...DEFAULT_STATE };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  function writeState(next) {
    try {
      localStorage.setItem(LS_DEBATE, JSON.stringify(next || DEFAULT_STATE));
    } catch {}
    return next;
  }

  function readFirstDebateState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LS_FIRST_DEBATE) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeFirstDebateState(next) {
    try {
      localStorage.setItem(LS_FIRST_DEBATE, JSON.stringify(next && typeof next === "object" ? next : {}));
    } catch {}
    return next;
  }

  function normalizeRoleScope(active) {
    const raw = String(
      active?.role_scope || active?.role_key || active?.title || ""
    )
      .trim()
      .toLowerCase();

    if (!raw) return null;

    return raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function getCapitalState() {
    try {
      const parsed = JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function getKnowledgeScore(categoryIds) {
    const merits = (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    })();

    const ids = Array.isArray(categoryIds) ? categoryIds : [];
    const total = ids.reduce((sum, id) => {
      const points = Number(merits?.[id]?.points || 0);
      return sum + Math.max(0, points);
    }, 0);

    return Math.max(0, Math.min(100, Math.round(Math.sqrt(total) * 12)));
  }

  function scaleCapital(rawValue) {
    return Math.max(0, Math.min(100, Math.round(Number(rawValue || 0) * 12)));
  }

  function getIdentityState() {
    return window.HG_IdentityCore?.getProfile?.() || {
      dominant: null,
      focus: {}
    };
  }

  function getPsycheState(activeCareerId) {
    const snap = window.CivicationPsyche?.getSnapshot?.(activeCareerId) || {};
    const trust = snap?.trust;
    const trustPct = trust?.max
      ? Math.round((Number(trust.value || 0) / Number(trust.max || 1)) * 100)
      : 50;

    return {
      integrity: Number(snap.integrity || 50),
      visibility: Number(snap.visibility || 50),
      economicRoom: Number(snap.economicRoom || 50),
      autonomy: Number(snap.autonomy || 50),
      trust: Math.max(0, Math.min(100, trustPct))
    };
  }

  function hasScenarioAccess(scenario) {
    const required = Array.isArray(scenario?.required_access_debate)
      ? scenario.required_access_debate
      : [];

    if (!required.length) return true;

    const bridge = window.CivicationPlaceAccessBridge;
    if (!bridge?.hasAccess) return true;

    return required.some((key) => bridge.hasAccess("debate", key));
  }

  function getScenarioPool(active) {
    const category = String(active?.career_id || "").trim();
    const roleScope = normalizeRoleScope(active);
    const pool = SCENARIOS?.[category]?.[roleScope] || [];
    const filtered = pool.filter(hasScenarioAccess);
    return filtered.length ? filtered : pool;
  }

  function getRecentScenarioIds(history, active) {
    const roleScope = normalizeRoleScope(active);
    const careerId = String(active?.career_id || "").trim();
    return (Array.isArray(history) ? history : [])
      .filter((entry) => {
        return String(entry?.role_scope || "") === roleScope &&
          String(entry?.career_id || "") === careerId;
      })
      .slice(-5)
      .map((entry) => String(entry?.scenario_id || "").trim())
      .filter(Boolean);
  }

  function getFirstDebateKey(active) {
    return `${String(active?.career_id || "").trim()}::${String(normalizeRoleScope(active) || "")}`;
  }

  function hasSeenFirstDebate(active) {
    const key = getFirstDebateKey(active);
    if (!key) return true;
    return !!readFirstDebateState()[key];
  }

  function markFirstDebateSeen(active, scenarioId) {
    const key = getFirstDebateKey(active);
    if (!key) return;
    const state = readFirstDebateState();
    state[key] = {
      seen_at: new Date().toISOString(),
      scenario_id: String(scenarioId || "")
    };
    writeFirstDebateState(state);
  }

  function pickScenario(active, state) {
    const pool = getScenarioPool(active);
    if (!pool.length) return null;

    if (!hasSeenFirstDebate(active)) {
      return pool[0] || null;
    }

    const recentIds = new Set(getRecentScenarioIds(state?.history, active));
    const filtered = pool.filter((scenario) => !recentIds.has(String(scenario.id || "")));
    const source = filtered.length ? filtered : pool;

    const dayIndex = Number(window.CivicationCalendar?.getPhaseModel?.()?.dayIndex || 1);
    const idx = Math.abs(dayIndex + source.length + getKnowledgeScore(source[0]?.relevant_categories || [])) % source.length;
    return source[idx] || source[0] || null;
  }

  function ensureCurrentDebate(active) {
    const state = readState();
    const roleScope = normalizeRoleScope(active);
    const careerId = String(active?.career_id || "").trim();

    if (
      state.current &&
      String(state.current.role_scope || "") === roleScope &&
      String(state.current.career_id || "") === careerId &&
      hasScenarioAccess(state.current.scenario)
    ) {
      return state.current;
    }

    const scenario = pickScenario(active, state);
    if (!scenario) return null;

    const current = {
      id: `debate_${careerId}_${roleScope}_${Date.now()}`,
      scenario_id: scenario.id,
      career_id: careerId,
      role_scope: roleScope,
      created_at: new Date().toISOString(),
      is_first_debate: !hasSeenFirstDebate(active),
      scenario
    };

    state.current = current;
    writeState(state);
    return current;
  }

  function getCurrentDebate(active) {
    return ensureCurrentDebate(active || window.CivicationState?.getActivePosition?.());
  }

  function buildArgumentBreakdown(active, scenario, strategyId) {
    const strategy = STRATEGIES[strategyId];
    if (!strategy) return null;

    const capital = getCapitalState();
    const identity = getIdentityState();
    const psyche = getPsycheState(active?.career_id);
    const knowledge = getKnowledgeScore(scenario?.relevant_categories || []);
    const capitalScore = scaleCapital(capital?.[strategy.capitalKey] || 0);
    const identityScore = Math.round(Number(identity?.focus?.[strategy.identityKey] || 0) * 100);
    const psycheScore = Number(psyche?.[strategy.psyche] || 50);
    const opponentResistance = Number(scenario?.opponent_profile?.[strategy.capitalKey] || 45);

    const total = Math.round(
      knowledge * strategy.knowledgeWeight +
      capitalScore * strategy.capitalWeight +
      identityScore * strategy.identityWeight +
      psycheScore * strategy.psycheWeight
    );

    const resistance = Math.round(opponentResistance * 0.75 + 22);
    const margin = total - resistance;

    let outcome = "loss";
    if (margin >= 15) outcome = "decisive_win";
    else if (margin >= 1) outcome = "win";
    else if (margin >= -9) outcome = "partial";

    return {
      strategyId,
      strategy,
      knowledge,
      capitalScore,
      identityScore,
      psycheScore,
      total,
      resistance,
      margin,
      outcome
    };
  }

  function getOutcomeText(outcome, scenario, strategy) {
    const verb = strategy?.verbs?.[0] || "presser";

    if (outcome === "decisive_win") {
      return `Du ${verb} rommet hardt nok til at ${scenario?.opponent || "motparten"} må flytte seg tydelig.`;
    }

    if (outcome === "win") {
      return `Du får overtaket og tvinger ${scenario?.opponent || "motparten"} til å gi deg mer rom enn utgangspunktet tilsa.`;
    }

    if (outcome === "partial") {
      return `Du taper ikke, men du eier heller ikke rommet fullt ut. Debatten forskyves, uten å avgjøres helt.`;
    }

    return `Motparten holder rammen og gjør argumentet ditt mindre virkningsfullt enn du trengte.`;
  }

  function applyDebateEffects(active, breakdown) {
    const strategyId = breakdown?.strategyId;
    const outcome = breakdown?.outcome;
    const strategy = STRATEGIES[strategyId] || null;

    if (!strategy) return;

    const capital = getCapitalState();
    const nextCapital = { ...(capital || {}) };

    if (outcome === "decisive_win") {
      nextCapital[strategy.capitalKey] = Number(nextCapital[strategy.capitalKey] || 0) + 1;
      nextCapital.symbolic = Number(nextCapital.symbolic || 0) + 1;
      window.HG_IdentityCore?.shiftFocus?.(strategy.identityKey, 0.04);
      window.CivicationPsyche?.updateVisibility?.(3);
      window.CivicationPsyche?.updateIntegrity?.(strategyId === "prinsipp" ? 3 : 1);
      if (active?.career_id) window.CivicationPsyche?.updateTrust?.(active.career_id, 4);
    } else if (outcome === "win") {
      nextCapital[strategy.capitalKey] = Number(nextCapital[strategy.capitalKey] || 0) + 1;
      window.HG_IdentityCore?.shiftFocus?.(strategy.identityKey, 0.03);
      window.CivicationPsyche?.updateVisibility?.(2);
      if (active?.career_id) window.CivicationPsyche?.updateTrust?.(active.career_id, 2);
    } else if (outcome === "partial") {
      window.HG_IdentityCore?.shiftFocus?.(strategy.identityKey, 0.015);
      window.CivicationPsyche?.updateIntegrity?.(strategyId === "prinsipp" ? 1 : 0);
      if (active?.career_id) window.CivicationPsyche?.updateTrust?.(active.career_id, 0);
    } else {
      window.CivicationPsyche?.updateVisibility?.(-1);
      window.CivicationPsyche?.updateIntegrity?.(strategyId === "prinsipp" ? -1 : 0);
      if (active?.career_id) window.CivicationPsyche?.updateTrust?.(active.career_id, -2);
    }

    try {
      localStorage.setItem("hg_capital_v1", JSON.stringify(nextCapital));
    } catch {}
  }

  function resolveCurrentDebate(strategyId, activeArg) {
    const active = activeArg || window.CivicationState?.getActivePosition?.();
    const state = readState();
    const current = state.current;
    if (!current?.scenario) {
      return { ok: false, reason: "no_current_debate" };
    }

    const breakdown = buildArgumentBreakdown(active, current.scenario, strategyId);
    if (!breakdown) {
      return { ok: false, reason: "invalid_strategy" };
    }

    applyDebateEffects(active, breakdown);

    const result = {
      resolved_at: new Date().toISOString(),
      debate_id: current.id,
      scenario_id: current.scenario_id,
      role_scope: current.role_scope,
      career_id: current.career_id,
      opponent: current.scenario.opponent,
      theme: current.scenario.theme,
      strategy_id: strategyId,
      strategy_label: breakdown.strategy.label,
      outcome: breakdown.outcome,
      margin: breakdown.margin,
      total: breakdown.total,
      resistance: breakdown.resistance,
      text: getOutcomeText(breakdown.outcome, current.scenario, breakdown.strategy),
      is_first_debate: !!current.is_first_debate
    };

    state.history.push(result);
    state.history = state.history.slice(-30);
    state.last_result = result;
    state.current = null;
    writeState(state);

    if (current.is_first_debate) {
      markFirstDebateSeen(active, current.scenario_id);
      if (typeof window.showToast === "function") {
        window.showToast("🗣️ Første debatt er gjennomført. Nå har du brukt kunnskap, kapital, identitet og psyke i samme situasjon, og det er dette som gjør Civication til mer enn bare et quizspill.");
      }
    }

    window.dispatchEvent(new Event("updateProfile"));

    return {
      ok: true,
      result,
      breakdown
    };
  }

  function dismissLastResult() {
    const state = readState();
    state.last_result = null;
    writeState(state);
    return true;
  }

  function getLastResult() {
    return readState().last_result || null;
  }

  function getStrategyOptions(scenario) {
    const ids = Array.isArray(scenario?.strategies) ? scenario.strategies : [];
    return ids
      .map((id) => ({ id, ...(STRATEGIES[id] || {}) }))
      .filter((entry) => entry.label);
  }

  function previewStrategy(activeArg, strategyId) {
    const active = activeArg || window.CivicationState?.getActivePosition?.();
    const current = getCurrentDebate(active);
    if (!current?.scenario) return null;
    return buildArgumentBreakdown(active, current.scenario, strategyId);
  }

  function getIntroText(activeArg) {
    const active = activeArg || window.CivicationState?.getActivePosition?.();
    const current = getCurrentDebate(active);
    if (!current?.scenario) return null;

    if (current.is_first_debate) {
      return "Dette er den første debatten din. Her handler det ikke bare om å ha rett, men om å bruke det du har bygget opp i rollen din. Kunnskapsscoren viser hva du faktisk kan om temaet, mens kapital, identitet og psyke avgjør hvor sterkt argumentet ditt bærer sosialt.";
    }

    return "Debatter er stedet der kunnskap, kapital, identitet og psyke møtes. Strategien du velger avgjør hva slags styrke du prøver å bruke i rommet.";
  }

  window.CivicationDebateEngine = {
    getCurrentDebate,
    getLastResult,
    dismissLastResult,
    getStrategyOptions,
    previewStrategy,
    resolveCurrentDebate,
    getKnowledgeScore,
    buildArgumentBreakdown,
    getIntroText,
    hasSeenFirstDebate
  };
})();
