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
      signal = global.InsightsEngine.createSignalFromMessage(payload.text || payload.title || "", "sub_laring", themeId, payload.meta || {});
      if (signal && payload.meta && typeof payload.meta === "object") signal.meta = payload.meta;
      global.InsightsEngine.addSignalToChamber(chamber, signal);
      global.saveChamberToStorage(chamber);
    }

    const event = new CustomEvent("aha:ingested", { detail: { sourceEvent: srcEvent, signal } });
    document.dispatchEvent(event);
    return { sourceEvent: srcEvent, signal };
  }

  global.AHAIngest = { ingest };
})(this);
