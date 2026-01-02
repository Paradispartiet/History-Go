// js/audits/imageRoles.audit.js
// =====================================================
// History GO – Image Roles Audit
// -----------------------------------------------------
// Sjekker bilde-ROLLER, ikke bare "har bilde"
// Roller:
//  - image       : sted / kontekst / kart / popup
//  - cardImage   : samlekort / History GO-kort
//  - popupImage  : valgfri spesialvisning
//
// Bruk i console:
//   HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })
//
// Design:
//  - Ingen magi
//  - Ingen auto-gjetting
//  - Rollebasert sannhet
// =====================================================

(function (global) {
  "use strict";

  let __lastAuditResult = null;

  function downloadJSON(filename, rows) {
    const json = JSON.stringify(rows, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return rows;
  }
  
  function norm(v) {
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }

  // -------------------------------
  // PEOPLE AUDIT
  // -------------------------------
  function auditPeople(people) {
    const rows = (people || []).map(p => {
      const image     = norm(p.image);
      const cardImage = norm(p.cardImage || p.imageCard);

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        year: p.year,

        image,
        cardImage,

        missingImage: !image,
        missingCard: !cardImage
      };
    });

    return {
      all: rows,
      missingImage: rows.filter(x => x.missingImage),
      missingCard: rows.filter(x => x.missingCard)
    };
  }

  // -------------------------------
  // PLACES AUDIT
  // -------------------------------
  function auditPlaces(places) {
    const rows = (places || []).map(s => {
      const image      = norm(s.image);
      const cardImage  = norm(s.cardImage || s.imageCard);
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
        missingPopup: !popupImage
      };
    });

    return {
      all: rows,
      missingImage: rows.filter(x => x.missingImage),
      missingCard: rows.filter(x => x.missingCard),
      missingPopup: rows.filter(x => x.missingPopup)
    };
  }

  // -------------------------------
  // CONSOLE RENDERING
  // -------------------------------
  function renderPeopleReport(p) {
    console.groupCollapsed(
      `%c[HG] PEOPLE image audit — image:${p.missingImage.length} card:${p.missingCard.length}`,
      "color:#3498db;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (person):");
      console.table(p.missingImage.map(x => ({
        id: x.id,
        name: x.name,
        category: x.category
      })));
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (person-kort):");
      console.table(p.missingCard.map(x => ({
        id: x.id,
        name: x.name,
        category: x.category
      })));
    }

    console.groupEnd();
  }

  function renderPlacesReport(p) {
    console.groupCollapsed(
      `%c[HG] PLACES image audit — image:${p.missingImage.length} card:${p.missingCard.length}`,
      "color:#e67e22;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (sted):");
      console.table(p.missingImage.map(x => ({
        id: x.id,
        name: x.name,
        category: x.category
      })));
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (sted-kort):");
      console.table(p.missingCard.map(x => ({
        id: x.id,
        name: x.name,
        category: x.category
      })));
    }

    console.groupEnd();
  }

  // -------------------------------
  // PUBLIC API
  // -------------------------------
  function run({ people = [], places = [] } = {}) {
  const peopleAudit = auditPeople(people);
  const placesAudit = auditPlaces(places);

  // ✅ LEGG INN DENNE LINJA
  __lastAuditResult = { people: peopleAudit, places: placesAudit };

  renderPeopleReport(peopleAudit);
  renderPlacesReport(placesAudit);

  return __lastAuditResult;
}

  global.HGImageRolesAudit = {
  run,

  // -------- DOWNLOAD HELPERS --------

  downloadPeopleMissingImage(filename = "people_missing_image.json") {
    return downloadJSON(
      filename,
      __lastAuditResult?.people?.missingImage || []
    );
  },

  downloadPeopleMissingCard(filename = "people_missing_cardImage.json") {
    return downloadJSON(
      filename,
      __lastAuditResult?.people?.missingCard || []
    );
  },

  downloadPlacesMissingImage(filename = "places_missing_image.json") {
    return downloadJSON(
      filename,
      __lastAuditResult?.places?.missingImage || []
    );
  },

  downloadPlacesMissingCard(filename = "places_missing_cardImage.json") {
    return downloadJSON(
      filename,
      __lastAuditResult?.places?.missingCard || []
    );
  },

  downloadPlacesMissingPopup(filename = "places_missing_popupImage.json") {
    return downloadJSON(
      filename,
      __lastAuditResult?.places?.missingPopup || []
    );
  }
};

})(window);
