// js/audits/missingImages.audit.js
// ==================================
// HG Audit: Missing images (People & Places)
// Bruk: HGAuditMissingImages.run({ people, places })
// ==================================

(function (global) {
  "use strict";

  function pick(obj, keys) {
    for (const k of keys) {
      const v = obj?.[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
  }

  function isMissing(url) {
    if (!url) return true;
    const u = String(url).trim().toLowerCase();
    return (
      u === "null" ||
      u === "undefined" ||
      u === "#" ||
      u === "none" ||
      u.includes("placeholder") ||
      u.includes("default")
    );
  }

  function run({ people = [], places = [] } = {}) {
    const peopleMissing = (people || [])
      .map(p => {
        const img = pick(p, ["cardImage", "imageCard", "image", "img", "photo"]);
        return {
          id: p?.id,
          name: p?.name,
          category: p?.category,
          year: p?.year,
          image: img || "",
          missing: isMissing(img)
        };
      })
      .filter(x => x.missing);

    const placesMissing = (places || [])
      .map(s => {
        const img = pick(s, ["cardImage", "imageCard", "image", "img", "photo"]);
        return {
          id: s?.id,
          name: s?.name,
          category: s?.category,
          type: s?.type,
          year: s?.year,
          image: img || "",
          missing: isMissing(img)
        };
      })
      .filter(x => x.missing);

    console.groupCollapsed(
      `%c[HG] Missing images — people:${peopleMissing.length} places:${placesMissing.length}`,
      "color:#f39c12;font-weight:700"
    );

    if (peopleMissing.length) {
      console.log("[HG] People missing images");
      console.table(peopleMissing);
    } else {
      console.log("[HG] People: ingen mangler");
    }

    if (placesMissing.length) {
      console.log("[HG] Places missing images");
      console.table(placesMissing);
    } else {
      console.log("[HG] Places: ingen mangler");
    }

    console.groupEnd();

    return { peopleMissing, placesMissing };
  }

  global.HGAuditMissingImages = { run };
})(window);
