// js/audits/imageRoles.audit.js
// =====================================================
// History GO – Image Roles Audit (robust + optional verify + iOS download)
// -----------------------------------------------------
// Mål:
// 1) Rollebasert: image / cardImage / popupImage
// 2) Robust resolve: finner bilde fra flere felt + lister + enkel deep-scan
// 3) (valgfritt) verify=true: sjekk at URL faktisk finnes (fetch, GH Pages ok)
// 4) Console: grupper + trimmed tables (iPad-safe)
// 5) Export: Share → “Lagre i Filer” (iOS), fallback data-URL
//
// Bruk:
//   await HGImageRolesAudit.run({ people: PEOPLE, places: PLACES, verify: true })
//   HGImageRolesAudit.downloadAll()
//   HGImageRolesAudit.downloadMissingAny()
//   HGImageRolesAudit.downloadPlacesMissingPopup()
// =====================================================

(function (global) {
  "use strict";

  // -------------------------------
  // Internal state
  // -------------------------------
  let __lastAuditResult = null;

  const DEFAULT_MAX_TABLE_ROWS = 40;
  const DEFAULT_VERIFY = false;
  const DEFAULT_CONCURRENCY = 6; // iPad-safe

  // -------------------------------
  // Helpers
  // -------------------------------
  function norm(v) {
    return typeof v === "string" && v.trim() ? v.trim() : "";
  }

  function absUrl(path) {
    try { return new URL(String(path), document.baseURI).toString(); }
    catch { return String(path || ""); }
  }

  function looksLikeImageRef(v) {
    if (typeof v !== "string") return false;
    const s = v.trim().toLowerCase();
    if (!s) return false;

    // Godta relative paths også (UI bruker ofte dette)
    const isUrl =
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("data:image/");

    const hasExt =
      s.endsWith(".jpg") || s.endsWith(".jpeg") || s.endsWith(".png") ||
      s.endsWith(".webp") || s.endsWith(".gif") ||
      s.includes(".jpg?") || s.includes(".jpeg?") ||
      s.includes(".png?") || s.includes(".webp?") || s.includes(".gif?");

    const looksPathy =
      s.startsWith("bilder/") || s.startsWith("./bilder/") || s.startsWith("../bilder/") ||
      s.startsWith("images/") || s.startsWith("./images/") || s.startsWith("../images/") ||
      s.includes("/bilder/") || s.includes("/images/") || s.includes("/img/");

    return isUrl || hasExt || looksPathy;
  }

  function firstString(arr) {
    if (!Array.isArray(arr)) return "";
    for (const v of arr) {
      const s = norm(v);
      if (s) return s;
    }
    return "";
  }

  function pick(obj, keys) {
    if (!obj || typeof obj !== "object") return "";
    for (const k of keys) {
      const v = obj[k];

      // string
      if (typeof v === "string" && norm(v)) return norm(v);

      // object with url/src
      if (v && typeof v === "object") {
        const u = norm(v.url) || norm(v.src) || norm(v.href);
        if (u) return u;
      }

      // array
      if (Array.isArray(v)) {
        const s = firstString(v);
        if (s) return s;
        // array of objects
        for (const it of v) {
          if (it && typeof it === "object") {
            const u = norm(it.url) || norm(it.src) || norm(it.href);
            if (u) return u;
          }
        }
      }
    }
    return "";
  }

  // Deep scan: let etter første bilde-aktige string i objektet (maks dybde)
  function deepScanForImage(obj, maxDepth = 2) {
    if (!obj || typeof obj !== "object") return "";
    const seen = new Set();

    function walk(o, d) {
      if (!o || typeof o !== "object") return "";
      if (seen.has(o)) return "";
      seen.add(o);

      for (const [k, v] of Object.entries(o)) {
        if (typeof v === "string" && looksLikeImageRef(v)) return norm(v);

        if (Array.isArray(v)) {
          const s = firstString(v);
          if (looksLikeImageRef(s)) return norm(s);

          for (const it of v) {
            if (typeof it === "string" && looksLikeImageRef(it)) return norm(it);
            if (it && typeof it === "object" && d < maxDepth) {
              const hit = walk(it, d + 1);
              if (hit) return hit;
            }
          }
        }

        if (v && typeof v === "object" && d < maxDepth) {
          const u = norm(v.url) || norm(v.src) || norm(v.href);
          if (u && looksLikeImageRef(u)) return u;
          const hit = walk(v, d + 1);
          if (hit) return hit;
        }
      }
      return "";
    }

    return walk(obj, 0);
  }

  // Rolle-resolver med prioriteter
  function resolveRole(obj, role) {
    if (!obj || typeof obj !== "object") return "";

    const ROLE_KEYS = {
      image: [
        "image", "imageUrl", "img", "imgUrl",
        "photo", "photoUrl",
        "cover", "coverImage",
        "hero", "headerImage", "banner",
        "thumbnail", "thumb"
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

    // 1) Rollefelt
    const byRole = pick(obj, ROLE_KEYS[role] || []);
    if (byRole) return byRole;

    // 2) Generelle felt
    const generic = pick(obj, [
      "image", "imageUrl", "photo", "photoUrl", "img", "imgUrl",
      "thumbnail", "thumb", "cover", "hero", "banner"
    ]);
    if (generic) return generic;

    // 3) Lister
    const listCandidate =
      pick(obj, ["images", "photos", "pictures", "gallery", "media"]);
    if (listCandidate) return listCandidate;

    // 4) Deep scan (begrenset)
    return deepScanForImage(obj, 2);
  }

  // -------------------------------
  // Optional verify (fetch)
  // -------------------------------
  async function urlExists(u) {
    const url = absUrl(u);
    if (!url) return false;
    try {
      // GET er mest kompatibel på GH Pages (HEAD kan feile)
      const r = await fetch(url, { cache: "no-store" });
      return !!r && r.ok;
    } catch {
      return false;
    }
  }

  async function mapLimit(items, limit, fn) {
    const arr = items || [];
    const out = new Array(arr.length);
    let i = 0;
    const n = Math.max(1, Number(limit || 1) || 1);

    const workers = new Array(n).fill(0).map(async () => {
      while (true) {
        const idx = i++;
        if (idx >= arr.length) return;
        out[idx] = await fn(arr[idx], idx);
      }
    });

    await Promise.all(workers);
    return out;
  }

  // -------------------------------
  // AUDIT builders
  // -------------------------------
  async function auditPeople(people, verify, concurrency) {
    const rows = await mapLimit(people || [], concurrency, async (p) => {
      const imageRaw = norm(resolveRole(p, "image"));
      const cardRaw  = norm(resolveRole(p, "card"));

      let image = imageRaw;
      let cardImage = cardRaw;

      if (verify) {
        if (image && !(await urlExists(image))) image = "";
        if (cardImage && !(await urlExists(cardImage))) cardImage = "";
      }

      return {
        id: p?.id,
        name: p?.name,
        category: p?.category,
        year: p?.year,

        image,
        cardImage,

        missingImage: !image,
        missingCard: !cardImage,
        missingAny: (!image || !cardImage)
      };
    });

    return {
      all: rows,
      missingImage: rows.filter(x => x.missingImage),
      missingCard:  rows.filter(x => x.missingCard),
      missingAny:   rows.filter(x => x.missingAny)
    };
  }

  async function auditPlaces(places, verify, concurrency) {
    const rows = await mapLimit(places || [], concurrency, async (s) => {
      const imageRaw = norm(resolveRole(s, "image"));
      const cardRaw  = norm(resolveRole(s, "card"));
      const popupRaw = norm(resolveRole(s, "popup"));

      let image = imageRaw;
      let cardImage = cardRaw;
      let popupImage = popupRaw;

      if (verify) {
        if (image && !(await urlExists(image))) image = "";
        if (cardImage && !(await urlExists(cardImage))) cardImage = "";
        if (popupImage && !(await urlExists(popupImage))) popupImage = "";
      }

      return {
        id: s?.id,
        name: s?.name,
        category: s?.category,
        year: s?.year,

        image,
        cardImage,
        popupImage,

        missingImage: !image,
        missingCard: !cardImage,
        missingPopup: !popupImage,
        missingAny: (!image || !cardImage || !popupImage)
      };
    });

    return {
      all: rows,
      missingImage: rows.filter(x => x.missingImage),
      missingCard:  rows.filter(x => x.missingCard),
      missingPopup: rows.filter(x => x.missingPopup),
      missingAny:   rows.filter(x => x.missingAny)
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
      `%c[HG] PEOPLE image audit — missing image:${p.missingImage.length} card:${p.missingCard.length}`,
      "color:#3498db;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (person):");
      console.table(
        tableTrim(p.missingImage.map(x => ({ id: x.id, name: x.name, category: x.category })), maxRows)
      );
      logTrimNotice(p.missingImage.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPeopleMissingImage()");
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (person-kort):");
      console.table(
        tableTrim(p.missingCard.map(x => ({ id: x.id, name: x.name, category: x.category })), maxRows)
      );
      logTrimNotice(p.missingCard.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPeopleMissingCard()");
    }

    console.groupEnd();
  }

  function renderPlacesReport(p, maxRows) {
    console.groupCollapsed(
      `%c[HG] PLACES image audit — missing image:${p.missingImage.length} card:${p.missingCard.length} popup:${p.missingPopup.length}`,
      "color:#e67e22;font-weight:700"
    );

    if (p.missingImage.length) {
      console.log("❌ Mangler image (sted):");
      console.table(
        tableTrim(p.missingImage.map(x => ({ id: x.id, name: x.name, category: x.category })), maxRows)
      );
      logTrimNotice(p.missingImage.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingImage()");
    }

    if (p.missingCard.length) {
      console.log("🎴 Mangler cardImage (sted-kort):");
      console.table(
        tableTrim(p.missingCard.map(x => ({ id: x.id, name: x.name, category: x.category })), maxRows)
      );
      logTrimNotice(p.missingCard.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingCard()");
    }

    if (p.missingPopup.length) {
      console.log("🪟 Mangler popupImage (sted):");
      console.table(
        tableTrim(p.missingPopup.map(x => ({ id: x.id, name: x.name, category: x.category })), maxRows)
      );
      logTrimNotice(p.missingPopup.length, maxRows);
      console.log("Download:", "HGImageRolesAudit.downloadPlacesMissingPopup()");
    }

    console.groupEnd();
  }

  // -------------------------------
  // Export (iOS-first)
  // -------------------------------
  async function downloadJSON(filename, rows) {
    const safeName = String(filename || "export.json").trim() || "export.json";
    const json = JSON.stringify(rows || [], null, 2);

    // iOS / iPadOS: Share sheet → “Lagre i Filer”
    try {
      if (global.navigator && typeof global.navigator.share === "function") {
        const blob = new Blob([json], { type: "application/json;charset=utf-8" });
        const file = (typeof File === "function")
          ? new File([blob], safeName, { type: "application/json;charset=utf-8" })
          : blob;

        if (!global.navigator.canShare || global.navigator.canShare({ files: [file] })) {
          await global.navigator.share({ title: safeName, files: [file] });
          return rows || [];
        }
      }
    } catch (e) {
      // fallthrough
    }

    // Fallback: data URL (mer stabil enn blob i Safari)
    const href = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const a = document.createElement("a");
    a.href = href;
    a.download = safeName;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    try { a.click(); } catch {}
    a.remove();

    return rows || [];
  }

  // -------------------------------
  // Public API
  // -------------------------------
  async function run({
    people = [],
    places = [],
    maxTableRows = DEFAULT_MAX_TABLE_ROWS,
    verify = DEFAULT_VERIFY,
    concurrency = DEFAULT_CONCURRENCY
  } = {}) {
    const peopleAudit = await auditPeople(people, !!verify, concurrency);
    const placesAudit = await auditPlaces(places, !!verify, concurrency);

    __lastAuditResult = { people: peopleAudit, places: placesAudit, meta: { verify: !!verify } };

    renderPeopleReport(peopleAudit, maxTableRows);
    renderPlacesReport(placesAudit, maxTableRows);

    return __lastAuditResult;
  }

  function requireAuditResult() {
    if (!__lastAuditResult || !__lastAuditResult.people || !__lastAuditResult.places) {
      throw new Error(
        "[HGImageRolesAudit] Kjør først: await HGImageRolesAudit.run({ people: PEOPLE, places: PLACES })"
      );
    }
  }

  global.HGImageRolesAudit = {
    run,
    last() { return __lastAuditResult; },

    // FULL status downloads
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
      return await downloadJSON(filename, __lastAuditResult);
    },
    async downloadMissingAny(filename = "image_audit_missing_any.json") {
      requireAuditResult();
      return await downloadJSON(filename, {
        people: __lastAuditResult.people.missingAny || [],
        places: __lastAuditResult.places.missingAny || []
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
