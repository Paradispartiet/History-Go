// js/audits/imageRoles.audit.js
// =====================================================
// History GO – Image Roles Audit + Safe Download
// -----------------------------------------------------
// Sjekker bilde-ROLLER (ikke bare "har bilde").
//
// Roller:
//  - image       : sted/person bilde (kontekst/popup/kort i app)
//  - cardImage   : samlekort / History GO-kort
//  - popupImage  : valgfri spesialvisning (places)
//
// Konsollbruk:
//   HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })
//   HGImageRolesAudit.downloadPlacesMissingCard()
//   HGImageRolesAudit.downloadPeopleMissingImage("people_missing_image.json")
//
// Designvalg (bevisst):
//  - Beholder console rendering (group + table) slik du har nå
//  - Men: tabeller TRIMMES automatisk hvis de er enorme (for å unngå crash)
//    → full liste får du alltid via download/export
//  - Download er iOS/Safari-robust: revoker sent + fallback open
// =====================================================

(function (global) {
  "use strict";

  // ---- internal state ----
  let __lastAuditResult = null;

  // Trim store tabeller for å unngå at nettleseren dør
  const DEFAULT_MAX_TABLE_ROWS = 40;

  function norm(v) {
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }

  // -------------------------------
  // PEOPLE AUDIT
  // -------------------------------
  function auditPeople(people) {
    const rows = (people || []).map((p) => {
      const image = norm(p.image);
      const cardImage = norm(p.cardImage || p.imageCard);

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        year: p.year,

        image,
        cardImage,

        missingImage: !image,
        missingCard: !cardImage,
      };
    });

    return {
      all: rows,
      missingImage: rows.filter((x) => x.missingImage),
      missingCard: rows.filter((x) => x.missingCard),
    };
  }

  // -------------------------------
  // PLACES AUDIT
  // -------------------------------
  function auditPlaces(places) {
    const rows = (places || []).map((s) => {
      const image = norm(s.image);
      const cardImage = norm(s.cardImage || s.imageCard);
      const popupImage = norm(s.popupImage);

      return {
        id: s.id,
        name: s.name,
        category: s.category,
        year: s.year,

        image,
        cardImage,
        popupImage,

        missingImage: !image,
        missingCard: !cardImage,
        missingPopup: !popupImage,
      };
    });

    return {
      all: rows,
      missingImage: rows.filter((x) => x.missingImage),
      missingCard: rows.filter((x) => x.missingCard),
      missingPopup: rows.filter((x) => x.missingPopup),
    };
  }

  // -------------------------------
  // SAFE TABLE RENDER (anti-crash)
  // -------------------------------
  function tableTrim(rows, maxRows) {
    const n = Math.max(0, Number(maxRows || 0) || 0);
    if (!n) return rows;
    if (!Array.isArray(rows)) return rows;
    if (rows.length <= n) return rows;
    return rows.slice(0, n);
  }

  function logTrimNotice(label, total, maxRows) {
    if (total > maxRows) {
      console.log(
        `↳ viser bare ${maxRows} av ${total} (for å unngå crash). Bruk download/export for full liste.`
      );
    }
  }

  // -------------------------------
  // CONSOLE RENDERING (beholder stilen din)
  // -------------------------------
  function renderPeopleReport(p, maxRows) {
    console.groupCollapsed(
      `%c[HG] PEOPLE image audit — image:${p.missingImage.length} card:${p.missingCard.length}`,
      "color:#3498db;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (person):");
      const view = tableTrim(
        p.missingImage.map((x) => ({
          id: x.id,
          name: x.name,
          category: x.category,
        })),
        maxRows
      );
      console.table(view);
      logTrimNotice("people.missingImage", p.missingImage.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPeopleMissingImage()");
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (person-kort):");
      const view = tableTrim(
        p.missingCard.map((x) => ({
          id: x.id,
          name: x.name,
          category: x.category,
        })),
        maxRows
      );
      console.table(view);
      logTrimNotice("people.missingCard", p.missingCard.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPeopleMissingCard()");
    }

    console.groupEnd();
  }

  function renderPlacesReport(p, maxRows) {
    console.groupCollapsed(
      `%c[HG] PLACES image audit — image:${p.missingImage.length} card:${p.missingCard.length}`,
      "color:#e67e22;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (sted):");
      const view = tableTrim(
        p.missingImage.map((x) => ({
          id: x.id,
          name: x.name,
          category: x.category,
        })),
        maxRows
      );
      console.table(view);
      logTrimNotice("places.missingImage", p.missingImage.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingImage()");
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (sted-kort):");
      const view = tableTrim(
        p.missingCard.map((x) => ({
          id: x.id,
          name: x.name,
          category: x.category,
        })),
        maxRows
      );
      console.table(view);
      logTrimNotice("places.missingCard", p.missingCard.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingCard()");
    }

    console.groupEnd();
  }

  // -------------------------------
  // DOWNLOAD (iOS/Safari-robust)
  // -------------------------------
  function downloadJSON(filename, rows) {
    const safeName = String(filename || "export.json").trim() || "export.json";
    const json = JSON.stringify(rows || [], null, 2);

    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Best-effort: trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = safeName;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);

    // iOS/Safari kan vise dialog men ikke lagre → fallback open
    try {
      a.click();
    } catch (e) {
      // ignore
    }
    a.remove();

    // Fallback: åpne JSON i ny fane (iOS lar deg ofte "Del → Lagre i filer")
    setTimeout(() => {
      try {
        global.open(url, "_blank");
      } catch (e) {
        // ignore
      }
    }, 250);

    // Ikke revoké for tidlig (iOS kan bruke tid)
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // ignore
      }
    }, 60000);

    return rows || [];
  }

  // Hvis du trykker download før run() → auto-run med globale arrays
  function ensureAuditResult() {
    if (__lastAuditResult && __lastAuditResult.people && __lastAuditResult.places) return;

    const people = global.PEOPLE || [];
    const places = global.PLACES || [];

    // Hvis disse ikke finnes globalt, så er det umulig å auto-run fra konsoll.
    // (Da må du enten kjøre run({people,places}) med lokale refs, eller eksponere dem på window.)
    __lastAuditResult = run({ people, places, maxTableRows: DEFAULT_MAX_TABLE_ROWS });
  }

  // -------------------------------
  // PUBLIC API
  // -------------------------------
  function run({ people = [], places = [], maxTableRows = DEFAULT_MAX_TABLE_ROWS } = {}) {
    const peopleAudit = auditPeople(people);
    const placesAudit = auditPlaces(places);

    __lastAuditResult = { people: peopleAudit, places: placesAudit };

    renderPeopleReport(peopleAudit, maxTableRows);
    renderPlacesReport(placesAudit, maxTableRows);

    return __lastAuditResult;
  }

  global.HGImageRolesAudit = {
    run,

    // Quick access (hvis du vil bruke data uten å printe)
    last() {
      return __lastAuditResult;
    },

    // -------- DOWNLOAD HELPERS --------
    downloadPeopleMissingImage(filename = "people_missing_image.json") {
      ensureAuditResult();
      return downloadJSON(filename, __lastAuditResult?.people?.missingImage || []);
    },

    downloadPeopleMissingCard(filename = "people_missing_cardImage.json") {
      ensureAuditResult();
      return downloadJSON(filename, __lastAuditResult?.people?.missingCard || []);
    },

    downloadPlacesMissingImage(filename = "places_missing_image.json") {
      ensureAuditResult();
      return downloadJSON(filename, __lastAuditResult?.places?.missingImage || []);
    },

    downloadPlacesMissingCard(filename = "places_missing_cardImage.json") {
      ensureAuditResult();
      return downloadJSON(filename, __lastAuditResult?.places?.missingCard || []);
    },

    downloadPlacesMissingPopup(filename = "places_missing_popupImage.json") {
      ensureAuditResult();
      return downloadJSON(filename, __lastAuditResult?.places?.missingPopup || []);
    },
  };
})(window);
