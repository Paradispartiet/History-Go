(function (global) {
  "use strict";

  function ingest(input) {
    const payload = input || {};
    const srcEvent = global.AHASources && global.AHASources.addSourceEvent
      ? global.AHASources.addSourceEvent(payload)
      : null;

    let signal = null;
    if (global.InsightsEngine && typeof global.loadChamberFromStorage === "function" && typeof global.saveChamberToStorage === "function") {
      const chamber = global.loadChamberFromStorage();
      const themeId = payload.theme_id || payload.source_type || "self";
      const text = payload.text || payload.title || "";
      const baseMeta = payload.meta && typeof payload.meta === "object" ? payload.meta : {};
      let calibration = null;
      if (global.AHACalibration && typeof global.AHACalibration.matchText === "function") {
        try { calibration = global.AHACalibration.matchText(text, { topN: 12 }); } catch (_) {}
      }

      const originalCandidates = Array.isArray(baseMeta.candidate_concepts) ? baseMeta.candidate_concepts.slice() : [];
      const calibrationCandidates = calibration && Array.isArray(calibration.matched_concepts)
        ? calibration.matched_concepts.map((c) => ({ key: c.key, label: c.label, source: "historygo_fag_calibration" }))
        : [];

      const dedupeMap = new Map();
      originalCandidates.concat(calibrationCandidates).forEach((item) => {
        const label = typeof item === "string" ? item : (item && (item.label || item.key));
        if (!label) return;
        const key = String((item && item.key) || label).toLowerCase().trim();
        if (!key || dedupeMap.has(key)) return;
        if (typeof item === "string") dedupeMap.set(key, item);
        else dedupeMap.set(key, Object.assign({}, item, { label: item.label || label }));
      });
      const mergedCandidates = Array.from(dedupeMap.values()).slice(0, 20);

      const mergedMeta = Object.assign({}, baseMeta);
      if (mergedCandidates.length) mergedMeta.candidate_concepts = mergedCandidates;

      const hasInputEmner = Array.isArray(mergedMeta.emner) && mergedMeta.emner.length > 0;
      if (!hasInputEmner && calibration && Array.isArray(calibration.matched_emner) && calibration.matched_emner.length) {
        mergedMeta.emner = calibration.matched_emner.slice(0, 6).map((m) => m.emne_id).filter(Boolean);
      }

      signal = global.InsightsEngine.createSignalFromMessage(text, "sub_laring", themeId, mergedMeta);
      if (signal) {
        signal.meta = mergedMeta;
        if (calibration) {
          signal.calibration = {
            source: calibration.source,
            calibration_score: calibration.calibration_score,
            matched_concepts: (calibration.matched_concepts || []).slice(0, 8),
            matched_emner: (calibration.matched_emner || []).slice(0, 4)
          };
        }
      }
      global.InsightsEngine.addSignalToChamber(chamber, signal);
      global.saveChamberToStorage(chamber);
    }

    const event = new CustomEvent("aha:ingested", { detail: { sourceEvent: srcEvent, signal } });
    document.dispatchEvent(event);
    return { sourceEvent: srcEvent, signal };
  }

  global.AHAIngest = { ingest };
})(this);
