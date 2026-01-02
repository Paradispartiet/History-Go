// js/audits/imageRoles.audit.js
// =====================================================
// History GO – Image Roles Audit + Robust Resolve + Download
// -----------------------------------------------------
// Mål:
// 1) Rollebasert: image / cardImage / popupImage
// 2) Robust: finner bilder selv om de ligger i andre felter
// 3) Beholder console groups + tables (men trimmer for iPad)
// 4) Kan laste ned full liste (JSON) uten å kopiere fra console
//
// Bruk:
//   HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })
//   HGImageRolesAudit.downloadPlacesMissingCard()
//   HGImageRolesAudit.downloadPlacesMissingImage()
//   HGImageRolesAudit.downloadPeopleMissingImage()
//
// Viktig:
// - "missing*" betyr: vi fant ikke noe bilde for den rollen,
//   selv etter fallback-søk (kjente felter + scan + images[]).
// =====================================================

(function (global) {
  "use strict";

  // ---- internal state ----
  let __lastAuditResult = null;
  const DEFAULT_MAX_TABLE_ROWS = 40;

  // -------------------------------
  // Helpers
  // -------------------------------
  function norm(v) {
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }

  function looksLikeImageUrl(v) {
    if (typeof v !== "string") return false;
    const s = v.trim().toLowerCase();
    if (!s) return false;
    return (
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("data:image/") ||
      s.includes("/img/") ||
      s.includes("/images/") ||
      s.includes("/bilder/") ||
      s.endsWith(".jpg") ||
      s.endsWith(".jpeg") ||
      s.endsWith(".png") ||
      s.endsWith(".webp") ||
      s.endsWith(".gif") ||
      s.includes(".jpg?") ||
      s.includes(".png?") ||
      s.includes(".webp?") ||
      s.includes(".jpeg?")
    );
  }

  function firstString(arr) {
    if (!Array.isArray(arr)) return "";
    for (const v of arr) {
      const s = norm(v);
      if (s) return s;
    }
    return "";
  }

  // Plukk fra kjente feltnavn (prioritet)
  function pick(obj, keys) {
    if (!obj || typeof obj !== "object") return "";
    for (const k of keys) {
      const v = obj[k];
      const s = norm(v);
      if (s) return s;
    }
    return "";
  }

  // Robust scan: finn første string-felt som ser ut som et bilde
  function scanForImage(obj) {
    if (!obj || typeof obj !== "object") return "";
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string" && looksLikeImageUrl(v)) return v.trim();
      // images: [ ... ]
      if (Array.isArray(v)) {
        const s = firstString(v);
        if (looksLikeImageUrl(s)) return s.trim();
      }
    }
    return "";
  }

  // Rolle-resolver:
  // 1) prøv spesifikke felter for rollen
  // 2) prøv "generelle" bildefelter
  // 3) prøv images[] (vanlig pattern)
  // 4) scan alt
  function resolveRole(obj, role) {
    if (!obj || typeof obj !== "object") return "";

    // Rolle-spesifikke kandidater (prioritet)
    const ROLE_KEYS = {
      image: [
        "image",
        "photo",
        "photoUrl",
        "img",
        "imgUrl",
        "imageUrl",
        "cover",
        "coverImage",
        "hero",
        "headerImage",
        "banner",
        "thumbnail",
        "thumb"
      ],
      card: [
        "cardImage",
        "imageCard",
        "card",
        "cardImg",
        "cardImgUrl",
        "card_url",
        "card_url",
        "card_image",
        "card_image_url"
      ],
      popup: [
        "popupImage",
        "popupImg",
        "popupPhoto",
        "popupUrl",
        "detailImage",
        "detailImg",
        "detailPhoto"
      ]
    };

    // 1) Rolle-felt
    const byRole = pick(obj, ROLE_KEYS[role] || []);
    if (byRole) return byRole;

    // 2) Generelle bildefelter som kan brukes som fallback
    const generic = pick(obj, [
      "image",
      "photo",
      "img",
      "thumbnail",
      "thumb",
      "cover",
      "hero",
      "banner"
    ]);
    if (generic) return generic;

    // 3) images[] / photos[] osv.
    const listCandidate =
      firstString(obj.images) ||
      firstString(obj.photos) ||
      firstString(obj.pictures) ||
      firstString(obj.gallery);
    if (looksLikeImageUrl(listCandidate)) return listCandidate.trim();

    // 4) Scan alle felt
    return scanForImage(obj);
  }

  // -------------------------------
  // PEOPLE AUDIT
  // -------------------------------
  function auditPeople(people) {
    const rows = (people || []).map((p) => {
      const image = norm(resolveRole(p, "image"));
      const cardImage = norm(resolveRole(p, "card"));

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
      missingImage: rows.filter((x) => x.missingImage),
      missingCard: rows.filter((x) => x.missingCard)
    };
  }

  // -------------------------------
  // PLACES AUDIT
  // -------------------------------
  function auditPlaces(places) {
    const rows = (places || []).map((s) => {
      const image = norm(resolveRole(s, "image"));
      const cardImage = norm(resolveRole(s, "card"));
      const popupImage = norm(resolveRole(s, "popup"));

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
      missingImage: rows.filter((x) => x.missingImage),
      missingCard: rows.filter((x) => x.missingCard),
      missingPopup: rows.filter((x) => x.missingPopup)
    };
  }

  // -------------------------------
  // Console tables (trim for iPad)
  // -------------------------------
  function tableTrim(rows, maxRows) {
    const n = Math.max(0, Number(maxRows || 0) || 0);
    if (!n) return rows;
    if (!Array.isArray(rows)) return rows;
    if (rows.length <= n) return rows;
    return rows.slice(0, n);
  }

  function logTrimNotice(total, maxRows) {
    if (total > maxRows) {
      console.log(`↳ viser bare ${maxRows} av ${total}. Last ned for full liste.`);
    }
  }

  function renderPeopleReport(p, maxRows) {
    console.groupCollapsed(
      `%c[HG] PEOPLE image audit — image:${p.missingImage.length} card:${p.missingCard.length}`,
      "color:#3498db;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (person):");
      console.table(
        tableTrim(
          p.missingImage.map((x) => ({ id: x.id, name: x.name, category: x.category })),
          maxRows
        )
      );
      logTrimNotice(p.missingImage.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPeopleMissingImage()");
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (person-kort):");
      console.table(
        tableTrim(
          p.missingCard.map((x) => ({ id: x.id, name: x.name, category: x.category })),
          maxRows
        )
      );
      logTrimNotice(p.missingCard.length, maxRows);
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
      console.table(
        tableTrim(
          p.missingImage.map((x) => ({ id: x.id, name: x.name, category: x.category })),
          maxRows
        )
      );
      logTrimNotice(p.missingImage.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingImage()");
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (sted-kort):");
      console.table(
        tableTrim(
          p.missingCard.map((x) => ({ id: x.id, name: x.name, category: x.category })),
          maxRows
        )
      );
      logTrimNotice(p.missingCard.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingCard()");
    }

    console.groupEnd();
  }

  // -------------------------------
  // Download (iOS/Safari robust)
  // -------------------------------
  function downloadJSON(filename, rows) {
  const safeName = String(filename || "export.json").trim() || "export.json";
  const json = JSON.stringify(rows || [], null, 2);

  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);

  try { a.click(); } catch {}
  a.remove();

  // Ikke revoké for tidlig (iOS kan være treg)
  setTimeout(() => { try { URL.revokeObjectURL(url); } catch {} }, 60000);

  return rows || [];
}

  function requireAuditResult() {
  if (!__lastAuditResult || !__lastAuditResult.people || !__lastAuditResult.places) {
    throw new Error("[HGImageRolesAudit] Kjør run() først: HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })");
  }
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

// Krev at run() er kjørt – ingen auto-run (hindrer "for kort"/feil datasett)
function requireAuditResult() {
  if (!__lastAuditResult || !__lastAuditResult.people || !__lastAuditResult.places) {
    throw new Error(
      "[HGImageRolesAudit] Kjør først: HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })"
    );
  }
}

global.HGImageRolesAudit = {
  run,
  last() { return __lastAuditResult; },

  // PEOPLE downloads
  downloadPeopleMissingImage(filename = "people_missing_image.json") {
    requireAuditResult();
    return downloadJSON(filename, __lastAuditResult.people.missingImage || []);
  },
  downloadPeopleMissingCard(filename = "people_missing_cardImage.json") {
    requireAuditResult();
    return downloadJSON(filename, __lastAuditResult.people.missingCard || []);
  },

  // PLACES downloads
  downloadPlacesMissingImage(filename = "places_missing_image.json") {
    requireAuditResult();
    return downloadJSON(filename, __lastAuditResult.places.missingImage || []);
  },
  downloadPlacesMissingCard(filename = "places_missing_cardImage.json") {
    requireAuditResult();
    return downloadJSON(filename, __lastAuditResult.places.missingCard || []);
  },
  downloadPlacesMissingPopup(filename = "places_missing_popupImage.json") {
    requireAuditResult();
    return downloadJSON(filename, __lastAuditResult.places.missingPopup || []);
  }
};

})(window);
