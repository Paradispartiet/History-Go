(function (global) {
  "use strict";

  const DEFAULT_CANONICAL_AHA_ANALYSIS = {
    contentType: "",
    domain: "",
    theme: "",
    mainTension: "",
    keyInsight: "",
    fieldConnections: [],
    historyGoLinks: [],
    suggestedActions: [],
    confidence: {
      contentType: 0,
      domain: 0,
      theme: 0,
      mainTension: 0,
      historyGoLinks: 0
    },
    warnings: []
  };

  function toStringValue(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function toStringArray(value) {
    if (!Array.isArray(value)) return [];
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }

  function toConfidenceValue(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.min(1, num));
  }

  function pick(raw, keys) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (Object.prototype.hasOwnProperty.call(raw, key)) return raw[key];
    }
    return undefined;
  }

  function normalizeAhaAnalysis(rawAnalysis) {
    const raw = rawAnalysis && typeof rawAnalysis === "object" ? rawAnalysis : {};
    const rawConfidence = raw.confidence && typeof raw.confidence === "object" ? raw.confidence : {};

    return {
      contentType: toStringValue(pick(raw, ["contentType", "INNHOLDSTYPE", "innholdstype"])),
      domain: toStringValue(pick(raw, ["domain", "DOMENE", "fagomrade"])),
      theme: toStringValue(pick(raw, ["theme", "TEMA", "tema"])),
      mainTension: toStringValue(pick(raw, ["mainTension", "HOVEDSPENNING", "hovedspenning"])),
      keyInsight: toStringValue(pick(raw, ["keyInsight", "VIKTIGSTE INNSIKT", "viktigsteInnsikt"])),
      fieldConnections: toStringArray(pick(raw, ["fieldConnections", "FAGKOBLINGER", "fagkoblinger"])),
      historyGoLinks: toStringArray(pick(raw, ["historyGoLinks", "HISTORY_GO_LINKS", "history_go_links"])),
      suggestedActions: toStringArray(pick(raw, ["suggestedActions", "ANBEFALTE TILTAK", "anbefalteTiltak"])),
      confidence: {
        contentType: toConfidenceValue(pick(rawConfidence, ["contentType", "INNHOLDSTYPE"])),
        domain: toConfidenceValue(pick(rawConfidence, ["domain", "DOMENE"])),
        theme: toConfidenceValue(pick(rawConfidence, ["theme", "TEMA"])),
        mainTension: toConfidenceValue(pick(rawConfidence, ["mainTension", "HOVEDSPENNING"])),
        historyGoLinks: toConfidenceValue(pick(rawConfidence, ["historyGoLinks", "HISTORY_GO_LINKS"]))
      },
      warnings: toStringArray(pick(raw, ["warnings", "ADVARSLER", "advarsler"]))
    };
  }

  global.AHACanonicalAnalysis = {
    DEFAULT_CANONICAL_AHA_ANALYSIS,
    normalizeAhaAnalysis
  };
})(this);
