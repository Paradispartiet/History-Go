// ============================================================
// CIVICATION SHELL BOOT
// ------------------------------------------------------------
// Ansvarlig for selve Civication-PRODUKTET / skallet:
//   - datalasting (badges, careers, career rules)
//   - økonomi-tick (kapital/dashboard)
//   - career-role-resolver (rolle-/dashboardvisning)
//   - CivicationUI.init(): kart/SVG-kart, dashboard, nabolag/kapital,
//     psyke, identitet, hjem, offentlig feed, aktiv rolle, folk, butikk,
//     track-HUD, footer, panelnavigasjon og robuste empty states.
//
// Skallet skal ALLTID kunne starte — også om day/life-story-motorene
// (mail, arbeidsdag, dagfase) feiler eller mangler. Derfor kjøres skallet
// FØRST og i sin egen try/catch. Mail/innboks er ett panel blant flere
// inne i skallet, ikke skallet selv; det laget eies av CivicationDayBoot.
//
// Kjøres av CivicationBoot (tynn koordinator) på DOMContentLoaded.
// ============================================================

/**
 * @typedef {Record<string, unknown>} CiviShellRecord
 * @typedef {CiviShellRecord & { badges?: unknown[] }} CiviShellBadgePayload
 * @typedef {CiviShellRecord & { careers?: unknown[] }} CiviShellCareerPayload
 */

(function (globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);

  /**
   * @param {string} text
   * @returns {string}
   */
  function toSnippet(text) {
    return String(text || "").replace(/\s+/g, " ").trim().slice(0, 160);
  }

  /**
   * @param {string} path
   * @returns {Promise<unknown>}
   */
  async function fetchJsonStrict(path) {
    const res = await fetch(path, { cache: "no-store" });
    const text = await res.text();

    if (!res.ok) {
      const snippet = toSnippet(text);
      throw new Error(
        `[CivicationShellBoot] JSON load failed for ${path} (HTTP ${res.status})${snippet ? `: ${snippet}` : ""}`
      );
    }

    try {
      return JSON.parse(text);
    } catch {
      const snippet = toSnippet(text);
      throw new Error(
        `[CivicationShellBoot] Invalid JSON in ${path}${snippet ? `: ${snippet}` : ""}`
      );
    }
  }

  /** @returns {Promise<unknown[]>} */
  async function loadBadgesFromIndex() {
    const indexJson = /** @type {CiviShellRecord & { files?: unknown }} */ (
      await fetchJsonStrict("data/badges/index.json")
    );

    if (!Array.isArray(indexJson?.files)) {
      throw new Error("[CivicationShellBoot] Invalid badges index at data/badges/index.json: files must be an array");
    }

    const payloads = await Promise.all(
      indexJson.files.map((filePath) => fetchJsonStrict(String(filePath)))
    );

    return payloads.flatMap((payload) => {
      if (!payload || typeof payload !== "object") return [];

      if (Array.isArray(/** @type {CiviShellBadgePayload} */ (payload).badges)) {
        return /** @type {CiviShellBadgePayload} */ (payload).badges.filter(
          (badge) => !!badge && typeof badge === "object"
        );
      }

      const badgeObject = /** @type {CiviShellRecord} */ (payload);
      const isSingleBadge =
        typeof badgeObject.id === "string" &&
        typeof badgeObject.name === "string" &&
        Array.isArray(badgeObject.tiers);

      return isSingleBadge ? [badgeObject] : [];
    });
  }

  /** @returns {Promise<void>} */
  async function ensureCiviCareerRulesLoaded() {
    if (Array.isArray(window.CIVI_CAREER_RULES)) return;

    try {
      const data = /** @type {CiviShellCareerPayload} */ (
        await fetchJsonStrict("data/Civication/hg_careers.json")
      );
      window.CIVI_CAREER_RULES = Array.isArray(data?.careers) ? data.careers : [];
    } catch {
      window.CIVI_CAREER_RULES = [];
    }
  }
  // Beholdt som offentlig global — profile.js og CivicationUI kaller den direkte.
  window.ensureCiviCareerRulesLoaded = ensureCiviCareerRulesLoaded;

  /**
   * @param {string} src
   * @returns {Promise<boolean>}
   */
  function loadCivicationScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(false);
        return;
      }

      const existing = Array.from(document.scripts || []).find((script) => {
        const attrSrc = script.getAttribute("src");
        if (attrSrc === src) return true;

        const absoluteSrc = script.src || "";
        return absoluteSrc.endsWith("/" + src) || absoluteSrc.endsWith(src);
      });
      if (existing) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error(`Kunne ikke laste ${src}`));
      document.body.appendChild(script);
    });
  }

  /** @returns {Promise<boolean>} */
  async function ensureCivicationCareerRoleResolverLoaded() {
    if (window.CivicationCareerRoleResolver?.resolveCareerRoleScope) return true;
    try {
      await loadCivicationScriptOnce("js/Civication/systems/civicationCareerRoleResolver.js");
      return !!window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    } catch (error) {
      console.warn("[CivicationShellBoot] career role resolver kunne ikke lastes", error);
      return false;
    }
  }

  /** @returns {Promise<void>} */
  async function loadCivicationData() {
    const [badges, careersJson] = await Promise.all([
      loadBadgesFromIndex(),
      fetchJsonStrict("data/Civication/hg_careers.json")
    ]);

    window.BADGES = badges;
    window.HG_CAREERS = Array.isArray((/** @type {CiviShellCareerPayload} */ (careersJson))?.careers)
      ? (/** @type {CiviShellCareerPayload} */ (careersJson)).careers
      : [];
  }

  /**
   * @param {any} error
   * @returns {void}
   */
  function showBootError(error) {
    window.__CIVI_BOOT_ERROR__ = error;
    if (error?.stack) console.error("[CivicationShellBoot] stack", error.stack);
    const message = error?.message || String(error || "Ukjent feil");
    const host = document.body || document.documentElement;
    if (!host) return;

    let box = document.getElementById("civiBootError");
    if (!box) {
      box = document.createElement("div");
      box.id = "civiBootError";
      box.setAttribute("role", "alert");
      box.style.cssText = [
        "position:fixed",
        "left:12px",
        "right:12px",
        "bottom:12px",
        "padding:12px 14px",
        "border-radius:10px",
        "background:#2b0b12",
        "border:1px solid #c54",
        "color:#fff",
        "font:14px/1.4 system-ui,-apple-system,sans-serif",
        "z-index:9999"
      ].join(";");
      host.appendChild(box);
    }

    box.innerHTML = "<strong>Civication kunne ikke starte.</strong><br>";
    box.appendChild(document.createTextNode(message));
  }

  // Lavnivå-hjelpere som CivicationDayBoot også trenger. Delt ett sted for å
  // unngå duplikate funksjonsnavn på tvers av filer (SYSTEM_REGISTRY regel 4).
  window.HG_CiviBoot = window.HG_CiviBoot || {};
  window.HG_CiviBoot.fetchJsonStrict = fetchJsonStrict;
  window.HG_CiviBoot.loadScriptOnce = loadCivicationScriptOnce;
  window.HG_CiviBoot.showBootError = showBootError;

  /**
   * Starter Civication-skallet. Egen try/catch: skallets feil vises som
   * boot-error, men day/life-story-boot kjøres uansett av koordinatoren.
   * @returns {Promise<void>}
   */
  async function start() {
    try {
      console.log("[CivicationShellBoot] skall-boot start");

      await loadCivicationData();
      await ensureCiviCareerRulesLoaded();
      await ensureCivicationCareerRoleResolverLoaded();

      if (window.CivicationEconomyEngine?.tickWeekly) {
        window.CivicationEconomyEngine.tickWeekly();
      }

      // Panelene. CivicationUI er defensiv: den rendrer skallet også uten
      // day/mail-motorene (tomme innboks-/arbeidsdag-paneler til de fylles).
      /** @type {{ init?: () => unknown }|undefined} */
      const ui = window.CivicationUI;
      ui?.init?.();

      // Skallet er oppe: vekk kart og paneler. Day/life-story fyller mail/
      // arbeidsdag etterpå via updateProfile.
      window.dispatchEvent(new Event("civi:dataReady"));
      window.dispatchEvent(new Event("civi:booted"));
    } catch (error) {
      console.error("[CivicationShellBoot] skall-boot feilet", error);
      showBootError(error);
    }
  }

  window.CivicationShellBoot = { start };
})(typeof window !== "undefined" ? window : globalThis);
