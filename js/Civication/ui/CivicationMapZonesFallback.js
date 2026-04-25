(function () {
  "use strict";

  if (typeof window.getZones === "function") return;

  window.getZones = function getZones(w, h) {
    return {
      sentrum: { x: w * 0.48, y: h * 0.55 },
      gamle_oslo: { x: w * 0.52, y: h * 0.60 },
      grunerlokka: { x: w * 0.46, y: h * 0.45 },
      sagene: { x: w * 0.44, y: h * 0.35 },
      st_hanshaugen: { x: w * 0.40, y: h * 0.48 },
      frogner: { x: w * 0.35, y: h * 0.55 },
      ullern: { x: w * 0.28, y: h * 0.58 },
      vestre_aker: { x: w * 0.30, y: h * 0.30 },
      nordre_aker: { x: w * 0.42, y: h * 0.22 },
      bjerke: { x: w * 0.52, y: h * 0.35 },
      grorud: { x: w * 0.60, y: h * 0.28 },
      stovner: { x: w * 0.65, y: h * 0.22 },
      alna: { x: w * 0.60, y: h * 0.42 },
      ostensjo: { x: w * 0.60, y: h * 0.55 },
      nordstrand: { x: w * 0.55, y: h * 0.75 },
      sondre_nordstrand: { x: w * 0.60, y: h * 0.88 },
      baerum_fornebu: { x: w * 0.15, y: h * 0.60, suburb: true },
      sandvika: { x: w * 0.10, y: h * 0.55, suburb: true },
      asker: { x: w * 0.05, y: h * 0.60, suburb: true },
      lorenskog: { x: w * 0.80, y: h * 0.45, suburb: true },
      lillestrom: { x: w * 0.88, y: h * 0.38, suburb: true },
      ski: { x: w * 0.78, y: h * 0.95, suburb: true },
      nittedal: { x: w * 0.45, y: h * 0.05, suburb: true },
      nesodden: { x: w * 0.70, y: h * 0.70, suburb: true }
    };
  };
})();
