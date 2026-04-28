// wonderkammer.audit.js
// Enkel runtime-audit for Wonderkammer-data.
// Kjør i konsoll etter boot: window.auditWonderkammer()

(function () {
  "use strict";

  function listEntries(entries, acc = []) {
    for (const entry of Array.isArray(entries) ? entries : []) {
      acc.push(entry);
      if (Array.isArray(entry?.items)) listEntries(entry.items, acc);
    }
    return acc;
  }

  function auditWonderkammer() {
    const wk = window.WONDERKAMMER;
    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    const placeIds = new Set(places.map(p => String(p?.id || "").trim()).filter(Boolean));

    const report = {
      ok: true,
      placeRows: 0,
      peopleRows: 0,
      totalEntries: 0,
      missingPlaceIds: [],
      duplicateEntryIds: [],
      missingRequiredFields: []
    };

    if (!wk) {
      report.ok = false;
      report.error = "window.WONDERKAMMER mangler";
      console.warn("[Wonderkammer audit]", report);
      return report;
    }

    const seen = new Set();
    const placesRows = Array.isArray(wk.places) ? wk.places : [];
    const peopleRows = Array.isArray(wk.people) ? wk.people : [];

    report.placeRows = placesRows.length;
    report.peopleRows = peopleRows.length;

    for (const row of placesRows) {
      const placeId = String(row?.place_id || row?.place || "").trim();
      if (placeId && !placeIds.has(placeId)) {
        report.missingPlaceIds.push(placeId);
      }

      for (const entry of listEntries(row?.chambers)) {
        report.totalEntries += 1;
        const id = String(entry?.id || "").trim();
        if (!id) {
          report.missingRequiredFields.push({ placeId, field: "id", title: entry?.title || "" });
        } else if (seen.has(id)) {
          report.duplicateEntryIds.push(id);
        } else {
          seen.add(id);
        }

        for (const field of ["title", "type", "description"]) {
          if (!String(entry?.[field] || "").trim()) {
            report.missingRequiredFields.push({ placeId, id, field });
          }
        }

        if (["play_zone", "play_object", "activity", "training_zone", "training"].includes(entry?.type)) {
          if (!String(entry?.activityText || "").trim()) {
            report.missingRequiredFields.push({ placeId, id, field: "activityText" });
          }
        }
      }
    }

    if (
      report.missingPlaceIds.length ||
      report.duplicateEntryIds.length ||
      report.missingRequiredFields.length
    ) {
      report.ok = false;
      console.warn("[Wonderkammer audit]", report);
    } else {
      console.info("[Wonderkammer audit] OK", report);
    }

    return report;
  }

  window.auditWonderkammer = auditWonderkammer;
})();
