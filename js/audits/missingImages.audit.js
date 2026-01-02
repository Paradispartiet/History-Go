// js/audits/missingImages.audit.js
// =====================================================
// History GO – Missing Images Audit (SAY WHAT'S MISSING)
// -----------------------------------------------------
// Mål:
//  - Si hvilke personer/steder mangler bilder (og hvilke typer)
//  - Støtter mange feltnavn (rådata + typiske HG-varianter)
//  - Returnerer FULL liste (console viser bare første N)
//  - Kan laste ned full JSON (iOS Share → “Lagre i Filer”)
//  - Ingen await (HG DevTools eval)
// =====================================================

(function (global) {
  "use strict";

  // -------------------------------
  // Settings
  // -------------------------------
  var DEFAULT_MAX_TABLE_ROWS = 40;
  var __last = null;

  // -------------------------------
  // Small helpers
  // -------------------------------
  function norm(v) {
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }

  function pick(obj, keys) {
    if (!obj || typeof obj !== "object") return "";
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = obj[k];

      if (typeof v === "string") {
        v = norm(v);
        if (v) return v;
      }

      // accept { url | src | href }
      if (v && typeof v === "object" && !Array.isArray(v)) {
        var u = norm(v.url) || norm(v.src) || norm(v.href);
        if (u) return u;
      }

      // accept array of strings/objects
      if (Array.isArray(v)) {
        for (var j = 0; j < v.length; j++) {
          var it = v[j];
          if (typeof it === "string") {
            var s = norm(it);
            if (s) return s;
          } else if (it && typeof it === "object") {
            var uu = norm(it.url) || norm(it.src) || norm(it.href);
            if (uu) return uu;
          }
        }
      }
    }
    return "";
  }

  function truncateForConsole(rows, maxRows) {
    var n = Number(maxRows || 0) || 0;
    if (!n) return rows;
    if (!Array.isArray(rows)) return rows;
    if (rows.length <= n) return rows;
    return rows.slice(0, n);
  }

  function logTrim(total, maxRows) {
    var n = Number(maxRows || 0) || 0;
    if (n && total > n) console.log("↳ viser bare " + n + " av " + total + ". Last ned for full liste.");
  }

  // -------------------------------
  // Image role resolvers
  // (Her støtter vi mange feltnavn for å treffe din virkelighet.)
  // -------------------------------
  var KEYS_IMAGE = [
    "image", "img", "photo", "picture", "cover", "hero",
    "imageUrl", "imgUrl", "photoUrl", "pictureUrl", "coverUrl",
    "thumbnail", "thumb", "thumbUrl", "thumbnailUrl",
    "images", "photos"
  ];

  var KEYS_CARD = [
    "cardImage", "imageCard", "image_card", "card_image",
    "cardImg", "cardPhoto",
    "cardImageUrl", "cardImgUrl",
    "card", "card_url", "cardUrl",
    "cardImages"
  ];

  var KEYS_POPUP = [
    "popupImage", "popupImg", "popupPhoto",
    "popupImageUrl", "popupUrl",
    "detailImage", "detailImg", "detailPhoto",
    "modalImage", "modalImg",
    "popup"
  ];

  function resolveAllRoles(obj) {
    // Finn hva som faktisk finnes
    var image = pick(obj, KEYS_IMAGE);
    var card  = pick(obj, KEYS_CARD);
    var popup = pick(obj, KEYS_POPUP);

    // Hvis card/popup mangler, IKKE fallback automatisk til image.
    // Du vil vite hva som mangler, ikke få “alt OK”.
    return {
      image: image,
      cardImage: card,
      popupImage: popup
    };
  }

  // -------------------------------
  // Builders
  // -------------------------------
  function buildPeopleRows(people) {
    var rows = (people || []).map(function (p) {
      var r = resolveAllRoles(p);
      var hasImage = !!norm(r.image);
      var hasCard  = !!norm(r.cardImage);

      return {
        id: p && p.id,
        name: p && p.name,
        category: p && p.category,
        year: p && p.year,

        image: norm(r.image),
        cardImage: norm(r.cardImage),

        missingImage: !hasImage,
        missingCard: !hasCard,
        missingAny: (!hasImage || !hasCard)
      };
    });

    return {
      all: rows,
      missingImage: rows.filter(function (x) { return x.missingImage; }),
      missingCard: rows.filter(function (x) { return x.missingCard; }),
      missingAny: rows.filter(function (x) { return x.missingAny; })
    };
  }

  function buildPlacesRows(places) {
    var rows = (places || []).map(function (s) {
      var r = resolveAllRoles(s);
      var hasImage = !!norm(r.image);
      var hasCard  = !!norm(r.cardImage);
      var hasPopup = !!norm(r.popupImage);

      return {
        id: s && s.id,
        name: s && s.name,
        category: s && s.category,
        year: s && s.year,

        image: norm(r.image),
        cardImage: norm(r.cardImage),
        popupImage: norm(r.popupImage),

        missingImage: !hasImage,
        missingCard: !hasCard,
        missingPopup: !hasPopup,
        missingAny: (!hasImage || !hasCard || !hasPopup)
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
  // Console report
  // -------------------------------
  function reportPeople(p, maxRows) {
    console.groupCollapsed(
      "%c[HG] PEOPLE missing — image:" + p.missingImage.length + " card:" + p.missingCard.length,
      "color:#3498db;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (person):");
      console.table(truncateForConsole(p.missingImage.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrim(p.missingImage.length, maxRows);
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (person-kort):");
      console.table(truncateForConsole(p.missingCard.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrim(p.missingCard.length, maxRows);
    }

    console.log("Full eksport:", "HGMissingImages.downloadPeopleAll()");
    console.groupEnd();
  }

  function reportPlaces(p, maxRows) {
    console.groupCollapsed(
      "%c[HG] PLACES missing — image:" + p.missingImage.length + " card:" + p.missingCard.length + " popup:" + p.missingPopup.length,
      "color:#e67e22;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (sted):");
      console.table(truncateForConsole(p.missingImage.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrim(p.missingImage.length, maxRows);
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (sted-kort):");
      console.table(truncateForConsole(p.missingCard.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrim(p.missingCard.length, maxRows);
    }

    if (p.missingPopup.length) {
      console.log("🪟 Mangler popupImage (sted):");
      console.table(truncateForConsole(p.missingPopup.map(function (x) {
        return { id: x.id, name: x.name, category: x.category };
      }), maxRows));
      logTrim(p.missingPopup.length, maxRows);
    }

    console.log("Full eksport:", "HGMissingImages.downloadPlacesAll()");
    console.groupEnd();
  }

  // -------------------------------
  // iOS-first download
  // -------------------------------
  function downloadJSON(filename, data) {
    var name = String(filename || "export.json").trim() || "export.json";
    var json = JSON.stringify(data || [], null, 2);

    // Share sheet (iOS/iPadOS)
    try {
      if (global.navigator && typeof global.navigator.share === "function") {
        var file = new File([json], name, { type: "application/json;charset=utf-8" });
        if (!global.navigator.canShare || global.navigator.canShare({ files: [file] })) {
          global.navigator.share({ title: name, files: [file] }).catch(function () {});
          return data || [];
        }
      }
    } catch (e) {}

    // Fallback: data URL
    var a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    a.download = name;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    try { a.click(); } catch (e2) {}
    a.remove();

    return data || [];
  }

  function requireLast() {
    if (!__last) throw new Error("Kjør først: HGMissingImages.run({ people: PEOPLE, places: PLACES })");
    return __last;
  }

  // -------------------------------
  // PUBLIC API (ENKELT NAVN)
  // -------------------------------
  function run(opts) {
    opts = opts || {};
    var people = opts.people || [];
    var places = opts.places || [];
    var maxTableRows = ("maxTableRows" in opts) ? opts.maxTableRows : DEFAULT_MAX_TABLE_ROWS;

    var peopleAudit = buildPeopleRows(people);
    var placesAudit = buildPlacesRows(places);

    __last = { people: peopleAudit, places: placesAudit };

    reportPeople(peopleAudit, maxTableRows);
    reportPlaces(placesAudit, maxTableRows);

    return __last;
  }

  global.HGMissingImages = {
    run: run,
    last: function () { return __last; },

    // full statuslister
    downloadAll: function (filename) {
      requireLast();
      return downloadJSON(filename || "missing_images_full.json", __last);
    },
    downloadMissingAny: function (filename) {
      requireLast();
      return downloadJSON(filename || "missing_images_missing_any.json", {
        people: __last.people.missingAny,
        places: __last.places.missingAny
      });
    },

    // ALL per type
    downloadPeopleAll: function (filename) {
      requireLast();
      return downloadJSON(filename || "people_images_all.json", __last.people.all);
    },
    downloadPlacesAll: function (filename) {
      requireLast();
      return downloadJSON(filename || "places_images_all.json", __last.places.all);
    },

    // missing per type
    downloadPeopleMissingImage: function (filename) {
      requireLast();
      return downloadJSON(filename || "people_missing_image.json", __last.people.missingImage);
    },
    downloadPeopleMissingCard: function (filename) {
      requireLast();
      return downloadJSON(filename || "people_missing_cardImage.json", __last.people.missingCard);
    },
    downloadPlacesMissingImage: function (filename) {
      requireLast();
      return downloadJSON(filename || "places_missing_image.json", __last.places.missingImage);
    },
    downloadPlacesMissingCard: function (filename) {
      requireLast();
      return downloadJSON(filename || "places_missing_cardImage.json", __last.places.missingCard);
    },
    downloadPlacesMissingPopup: function (filename) {
      requireLast();
      return downloadJSON(filename || "places_missing_popupImage.json", __last.places.missingPopup);
    }
  };

})(window);
