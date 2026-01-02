// js/audits/missingImages.audit.js
// =====================================================
// History GO – Missing Images Audit (WORKING VERSION)
// -----------------------------------------------------
// Mål:
//  - Finn manglende bilder uten at nettleseren kræsjer
//  - Samme datasett i console og nedlasting (ingen mismatch)
//  - Ingen "await" (HG DevTools eval støtter ikke det)
//  - iOS-first export: Share → “Lagre i Filer”, fallback data:URL
//
// Bruk i HG DevTools console:
//   HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })
//   HGImageRolesAudit.downloadAll()
//   HGImageRolesAudit.downloadMissingAny()
//   HGImageRolesAudit.downloadPlacesAll()
//   HGImageRolesAudit.downloadPeopleAll()
//   HGImageRolesAudit.downloadPlacesMissingImage()
//   HGImageRolesAudit.downloadPlacesMissingCard()
//   HGImageRolesAudit.downloadPlacesMissingPopup()
// =====================================================

(function (global) {
  "use strict";

  // -------------------------------
  // State
  // -------------------------------
  var __lastAuditResult = null;
  var DEFAULT_MAX_TABLE_ROWS = 40;

  // -------------------------------
  // Helpers
  // -------------------------------
  function norm(v) {
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }

  // Finn beste kandidat for en rolle uten å "gjette" for mye.
  // (Du kan utvide keys senere – dette er robust nok nå.)
  function pick(obj, keys) {
    if (!obj || typeof obj !== "object") return "";
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = obj[k];

      if (typeof v === "string" && norm(v)) return norm(v);

      // godta {url|src|href}
      if (v && typeof v === "object") {
        var u = norm(v.url) || norm(v.src) || norm(v.href);
        if (u) return u;
      }

      // godta arrays av strings / objects
      if (Array.isArray(v)) {
        for (var j = 0; j < v.length; j++) {
          var it = v[j];
          if (typeof it === "string" && norm(it)) return norm(it);
          if (it && typeof it === "object") {
            var uu = norm(it.url) || norm(it.src) || norm(it.href);
            if (uu) return uu;
          }
        }
      }
    }
    return "";
  }

  // Rolle-resolver: eksakt rolle først, ellers fallback til generelle felt.
  function resolveImageRole(obj, role) {
    if (!obj || typeof obj !== "object") return "";

    var ROLE_KEYS = {
      image: [
        "image", "imageUrl", "img", "imgUrl",
        "photo", "photoUrl",
        "thumbnail", "thumb",
        "cover", "coverImage",
        "hero", "headerImage", "banner"
      ],
      card: [
        "cardImage", "imageCard", "card", "cardImg", "cardImgUrl",
        "card_url", "card_image", "card_image_url"
      ],
      popup: [
        "popupImage", "popupImg", "popupPhoto", "popupUrl",
        "detailImage", "detailImg", "detailPhoto"
      ]
    };

    // 1) rollefelt
    var byRole = pick(obj, ROLE_KEYS[role] || []);
    if (byRole) return byRole;

    // 2) fallback: generelle felter (kun hvis rollen ikke finnes)
    return pick(obj, ROLE_KEYS.image);
  }

  function sliceForTable(rows, maxRows) {
    var n = Number(maxRows || 0) || 0;
    if (!n) return rows;
    if (!Array.isArray(rows)) return rows;
    if (rows.length <= n) return rows;
    return rows.slice(0, n);
  }

  function logTrimNotice(total, maxRows) {
    if ((Number(maxRows || 0) || 0) > 0 && total > maxRows) {
      console.log("↳ viser " + maxRows + "/" + total + ". Bruk download for full liste.");
    }
  }

  // -------------------------------
  // Audit builders
  // -------------------------------
  function auditPeople(people) {
    var rows = (people || []).map(function (p) {
      var image = norm(resolveImageRole(p, "image"));
      var cardImage = norm(resolveImageRole(p, "card"));

      return {
        id: p && p.id,
        name: p && p.name,
        category: p && p.category,
        year: p && p.year,

        image: image,
        cardImage: cardImage,

        missingImage: !image,
        missingCard: !cardImage,
        missingAny: (!image || !cardImage)
      };
    });

    return {
      all: rows,
      missingImage: rows.filter(function (x) { return x.missingImage; }),
      missingCard: rows.filter(function (x) { return x.missingCard; }),
      missingAny: rows.filter(function (x) { return x.missingAny; })
    };
  }

  function auditPlaces(places) {
    var rows = (places || []).map(function (s) {
      var image = norm(resolveImageRole(s, "image"));
      var cardImage = norm(resolveImageRole(s, "card"));
      var popupImage = norm(resolveImageRole(s, "popup"));

      return {
        id: s && s.id,
        name: s && s.name,
        category: s && s.category,
        year: s && s.year,

        image: image,
        cardImage: cardImage,
        popupImage: popupImage,

        missingImage: !image,
        missingCard: !cardImage,
        missingPopup: !popupImage,
        missingAny: (!image || !cardImage || !popupImage)
      };
    });

    return {
      all: rows,
      missingImage: rows.filter(function (x) { return x.missingImage; }),
      missingCard: rows.filter(function (x) { return x.missingCard; }),
      missingPopup: rows.filter(function (x) { return x.missingPopup; }),
      missingAny: rows.filter(function (x) { return x.missingAny; })
    };
  }

  // -------------------------------
  // Console rendering (iPad-safe)
  // -------------------------------
  function renderPeopleReport(p, maxRows) {
    console.groupCollapsed(
      "%c[HG] PEOPLE images — missing image:" + p.missingImage.length + " card:" + p.missingCard.length,
      "color:#3498db;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (person):");
      console.table(sliceForTable(p.missingImage.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrimNotice(p.missingImage.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPeopleMissingImage()");
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (person-kort):");
      console.table(sliceForTable(p.missingCard.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrimNotice(p.missingCard.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPeopleMissingCard()");
    }

    console.groupEnd();
  }

  function renderPlacesReport(p, maxRows) {
    console.groupCollapsed(
      "%c[HG] PLACES images — missing image:" + p.missingImage.length +
        " card:" + p.missingCard.length +
        " popup:" + p.missingPopup.length,
      "color:#e67e22;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (sted):");
      console.table(sliceForTable(p.missingImage.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrimNotice(p.missingImage.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingImage()");
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (sted-kort):");
      console.table(sliceForTable(p.missingCard.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrimNotice(p.missingCard.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingCard()");
    }

    if (p.missingPopup.length) {
      console.log("🪟 Mangler popupImage (sted):");
      console.table(sliceForTable(p.missingPopup.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrimNotice(p.missingPopup.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingPopup()");
    }

    console.groupEnd();
  }

  // -------------------------------
  // Export (iOS-first)
  // -------------------------------
  function downloadJSON(filename, data) {
    var safeName = String(filename || "export.json").trim() || "export.json";
    var json = JSON.stringify(data || [], null, 2);

    // iOS Share sheet først (gir “Lagre i Filer”)
    try {
      if (global.navigator && typeof global.navigator.share === "function") {
        var file = new File([json], safeName, { type: "application/json;charset=utf-8" });

        // canShare finnes ikke alltid – så vi tar begge veier
        if (!global.navigator.canShare || global.navigator.canShare({ files: [file] })) {
          // Viktig: ikke await (HG console)
          global.navigator.share({ title: safeName, files: [file] })
            .catch(function () { /* fallthrough til fallback under */ });
          return data || [];
        }
      }
    } catch (e) {
      // fallthrough
    }

    // Fallback: data URL (stabil i Safari)
    var href = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    var a = document.createElement("a");
    a.href = href;
    a.download = safeName;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    try { a.click(); } catch (e2) {}
    a.remove();

    return data || [];
  }

  function requireAuditResult() {
    if (!__lastAuditResult || !__lastAuditResult.people || !__lastAuditResult.places) {
      throw new Error("[HGImageRolesAudit] Kjør først: HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })");
    }
  }

  // -------------------------------
  // PUBLIC API  (beholder navnet du allerede bruker i appen)
  // -------------------------------
  function run(opts) {
    opts = opts || {};
    var people = opts.people || [];
    var places = opts.places || [];
    var maxTableRows = ("maxTableRows" in opts) ? opts.maxTableRows : DEFAULT_MAX_TABLE_ROWS;

    var peopleAudit = auditPeople(people);
    var placesAudit = auditPlaces(places);

    __lastAuditResult = {
      people: peopleAudit,
      places: placesAudit
    };

    renderPeopleReport(peopleAudit, maxTableRows);
    renderPlacesReport(placesAudit, maxTableRows);

    return __lastAuditResult;
  }

  global.HGImageRolesAudit = {
    run: run,
    last: function () { return __lastAuditResult; },

    // ---- FULL ----
    downloadAll: function (filename) {
      requireAuditResult();
      return downloadJSON(filename || "image_audit_all.json", __lastAuditResult);
    },
    downloadMissingAny: function (filename) {
      requireAuditResult();
      return downloadJSON(filename || "image_audit_missing_any.json", {
        people: __lastAuditResult.people.missingAny || [],
        places: __lastAuditResult.places.missingAny || []
      });
    },
    downloadPeopleAll: function (filename) {
      requireAuditResult();
      return downloadJSON(filename || "people_image_audit_all.json", __lastAuditResult.people.all || []);
    },
    downloadPlacesAll: function (filename) {
      requireAuditResult();
      return downloadJSON(filename || "places_image_audit_all.json", __lastAuditResult.places.all || []);
    },

    // ---- PEOPLE missing ----
    downloadPeopleMissingImage: function (filename) {
      requireAuditResult();
      return downloadJSON(filename || "people_missing_image.json", __lastAuditResult.people.missingImage || []);
    },
    downloadPeopleMissingCard: function (filename) {
      requireAuditResult();
      return downloadJSON(filename || "people_missing_cardImage.json", __lastAuditResult.people.missingCard || []);
    },

    // ---- PLACES missing ----
    downloadPlacesMissingImage: function (filename) {
      requireAuditResult();
      return downloadJSON(filename || "places_missing_image.json", __lastAuditResult.places.missingImage || []);
    },
    downloadPlacesMissingCard: function (filename) {
      requireAuditResult();
      return downloadJSON(filename || "places_missing_cardImage.json", __lastAuditResult.places.missingCard || []);
    },
    downloadPlacesMissingPopup: function (filename) {
      requireAuditResult();
      return downloadJSON(filename || "places_missing_popupImage.json", __lastAuditResult.places.missingPopup || []);
    }
  };

})(window);
