// js/audits/imageRoles.audit.js
// =====================================================
// History GO — Image Roles Audit (FULL + DOWNLOAD)
// -----------------------------------------------------
// Roller (felt):
//  - image       : normal visning / kort / liste
//  - cardImage   : samlekort
//  - popupImage  : popup/detail (valgfritt)
// -----------------------------------------------------
// Bruk i console:
//   HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })
//   HGImageRolesAudit.downloadPlacesAll()
//   HGImageRolesAudit.downloadPeopleAll()
//   HGImageRolesAudit.downloadAll()
// =====================================================

(function (global) {
  "use strict";

  let __lastAuditResult = null;
  const DEFAULT_MAX_TABLE_ROWS = 40;

  // -------------------------------
  // helpers
  // -------------------------------
  function norm(v) {
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }

  function tableTrim(rows, maxRows) {
    const n = Number(maxRows || 0) || 0;
    if (!n || !Array.isArray(rows) || rows.length <= n) return rows;
    return rows.slice(0, n);
  }

  function requireAuditResult() {
    if (!__lastAuditResult || !__lastAuditResult.people || !__lastAuditResult.places) {
      throw new Error(
        "[HGImageRolesAudit] Kjør først: HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })"
      );
    }
  }

  // -------------------------------
  // iOS-first export: Share → “Lagre i Filer”
  // (fallback: data-url download)
  // -------------------------------
  async function downloadJSON(filename, rowsOrObj) {
    const safeName = String(filename || "export.json").trim() || "export.json";
    const json = JSON.stringify(rowsOrObj ?? [], null, 2);

    // iOS/iPadOS: Share sheet (gir “Lagre i Filer”)
    try {
      if (global.navigator && typeof global.navigator.share === "function") {
        const blob = new Blob([json], { type: "application/json;charset=utf-8" });

        // File finnes ikke alltid
        const file = (typeof File === "function")
          ? new File([blob], safeName, { type: "application/json;charset=utf-8" })
          : blob;

        if (!global.navigator.canShare || global.navigator.canShare({ files: [file] })) {
          await global.navigator.share({ title: safeName, files: [file] });
          return rowsOrObj ?? [];
        }
      }
    } catch (e) {
      // fallthrough
    }

    // fallback (Safari): data-url
    const href = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const a = document.createElement("a");
    a.href = href;
    a.download = safeName;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    try { a.click(); } catch {}
    a.remove();

    return rowsOrObj ?? [];
  }

  // -------------------------------
  // AUDIT: People
  // -------------------------------
  function auditPeople(people) {
    const rows = (people || []).map(p => {
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
  // AUDIT: Places
  // -------------------------------
  function auditPlaces(places) {
    const rows = (places || []).map(s => {
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
  // CONSOLE RENDER (trim for iPad)
  // -------------------------------
  function renderPeopleReport(p, maxRows) {
    console.groupCollapsed(
      `%c[HG] PEOPLE image audit — image:${p.missingImage.length} card:${p.missingCard.length}`,
      "color:#3498db;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (person):");
      console.table(tableTrim(
        p.missingImage.map(x => ({ id: x.id, name: x.name, category: x.category })),
        maxRows
      ));
      if (p.missingImage.length > maxRows) console.log(`↳ viser ${maxRows}/${p.missingImage.length}. Last ned for full.`);
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (person-kort):");
      console.table(tableTrim(
        p.missingCard.map(x => ({ id: x.id, name: x.name, category: x.category })),
        maxRows
      ));
      if (p.missingCard.length > maxRows) console.log(`↳ viser ${maxRows}/${p.missingCard.length}. Last ned for full.`);
    }

    console.groupEnd();
  }

  function renderPlacesReport(p, maxRows) {
    console.groupCollapsed(
      `%c[HG] PLACES image audit — image:${p.missingImage.length} card:${p.missingCard.length} popup:${p.missingPopup.length}`,
      "color:#e67e22;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (sted):");
      console.table(tableTrim(
        p.missingImage.map(x => ({ id: x.id, name: x.name, category: x.category })),
        maxRows
      ));
      if (p.missingImage.length > maxRows) console.log(`↳ viser ${maxRows}/${p.missingImage.length}. Last ned for full.`);
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (sted-kort):");
      console.table(tableTrim(
        p.missingCard.map(x => ({ id: x.id, name: x.name, category: x.category })),
        maxRows
      ));
      if (p.missingCard.length > maxRows) console.log(`↳ viser ${maxRows}/${p.missingCard.length}. Last ned for full.`);
    }

    if (p.missingPopup.length) {
      console.log("🪟 Mangler popupImage (sted):");
      console.table(tableTrim(
        p.missingPopup.map(x => ({ id: x.id, name: x.name, category: x.category })),
        maxRows
      ));
      if (p.missingPopup.length > maxRows) console.log(`↳ viser ${maxRows}/${p.missingPopup.length}. Last ned for full.`);
    }

    console.groupEnd();
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
    last() { return __lastAuditResult; },

    // FULL status downloads (det du savnet)
    async downloadPeopleAll(filename = "people_image_audit_all.json") {
      requireAuditResult();
      return await downloadJSON(filename, __lastAuditResult.people.all || []);
    },
    async downloadPlacesAll(filename = "places_image_audit_all.json") {
      requireAuditResult();
      return await downloadJSON(filename, __lastAuditResult.places.all || []);
    },
    async downloadAll(filename = "image_audit_all.json") {
      requireAuditResult();
      return await downloadJSON(filename, {
        people: __lastAuditResult.people.all || [],
        places: __lastAuditResult.places.all || []
      });
    },

    // PEOPLE downloads
    async downloadPeopleMissingImage(filename = "people_missing_image.json") {
      requireAuditResult();
      return await downloadJSON(filename, __lastAuditResult.people.missingImage || []);
    },
    async downloadPeopleMissingCard(filename = "people_missing_cardImage.json") {
      requireAuditResult();
      return await downloadJSON(filename, __lastAuditResult.people.missingCard || []);
    },

    // PLACES downloads
    async downloadPlacesMissingImage(filename = "places_missing_image.json") {
      requireAuditResult();
      return await downloadJSON(filename, __lastAuditResult.places.missingImage || []);
    },
    async downloadPlacesMissingCard(filename = "places_missing_cardImage.json") {
      requireAuditResult();
      return await downloadJSON(filename, __lastAuditResult.places.missingCard || []);
    },
    async downloadPlacesMissingPopup(filename = "places_missing_popupImage.json") {
      requireAuditResult();
      return await downloadJSON(filename, __lastAuditResult.places.missingPopup || []);
    }
  };

})(window);
