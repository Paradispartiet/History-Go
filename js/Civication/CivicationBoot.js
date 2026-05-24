// ============================================================
// CIVICATION BOOT – single orchestrator
// ============================================================

/**
 * @typedef {Record<string, unknown>} CiviBootRecord
 * @typedef {(value: unknown) => unknown} CiviBootFn
 * @typedef {CiviBootRecord & {
 *  boot?: CiviBootFn,
 *  init?: CiviBootFn,
 *  onAppOpen?: CiviBootFn,
 *  resolveCareerRoleScope?: CiviBootFn,
 *  enqueueNoUnlockedBrandEmployerMessage?: CiviBootFn
 * }} CiviBootMethodBag
 * @typedef {CiviBootRecord & { careers?: unknown[] }} CiviBootCareerPayload
 * @typedef {CiviBootRecord & { badges?: unknown[] }} CiviBootBadgePayload
 */



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
      `[CivicationBoot] JSON load failed for ${path} (HTTP ${res.status})${snippet ? `: ${snippet}` : ""}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    const snippet = toSnippet(text);
    throw new Error(
      `[CivicationBoot] Invalid JSON in ${path}${snippet ? `: ${snippet}` : ""}`
    );
  }
}

/** @returns {Promise<unknown[]>} */
async function loadBadgesFromIndex() {
  const indexJson = /** @type {CiviBootRecord & { files?: unknown }} */ (
    await fetchJsonStrict("data/badges/index.json")
  );

  if (!Array.isArray(indexJson?.files)) {
    throw new Error("[CivicationBoot] Invalid badges index at data/badges/index.json: files must be an array");
  }

  const payloads = await Promise.all(
    indexJson.files.map((filePath) => fetchJsonStrict(String(filePath)))
  );

  return payloads.flatMap((payload) => {
    if (!payload || typeof payload !== "object") return [];

    if (Array.isArray(/** @type {CiviBootBadgePayload} */ (payload).badges)) {
      return /** @type {CiviBootBadgePayload} */ (payload).badges.filter(
        (badge) => !!badge && typeof badge === "object"
      );
    }

    const badgeObject = /** @type {CiviBootRecord} */ (payload);
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

    const data = /** @type {CiviBootCareerPayload} */ (
      await fetchJsonStrict("data/Civication/hg_careers.json")
    );

    window.CIVI_CAREER_RULES =
      Array.isArray(data?.careers)
        ? data.careers
        : [];

  } catch {

    window.CIVI_CAREER_RULES = [];

  }
}

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
async function ensureCivicationRoleModelRuntimeLoaded() {
  /** @type {CiviBootMethodBag|undefined} */
  const roleModelRuntime = window.CivicationRoleModelRuntime;

  if (roleModelRuntime?.boot) {
    roleModelRuntime.boot();
    return true;
  }

  try {
    await loadCivicationScriptOnce("js/Civication/systems/civicationRoleModelRuntime.js");
    window.CivicationRoleModelRuntime?.boot?.();
    return true;
  } catch (error) {
    console.warn("[CivicationBoot] role model runtime kunne ikke lastes", error);
    return false;
  }
}



/** @returns {Promise<boolean>} */
async function ensureCivicationBlockedJobMessagesLoaded() {
  if (window.CivicationBlockedJobMessages?.enqueueNoUnlockedBrandEmployerMessage) return true;
  try {
    await loadCivicationScriptOnce("js/Civication/systems/civicationBlockedJobMessages.js");
    return !!window.CivicationBlockedJobMessages?.enqueueNoUnlockedBrandEmployerMessage;
  } catch (error) {
    console.warn("[CivicationBoot] blocked job messages kunne ikke lastes", error);
    return false;
  }
}

/** @returns {Promise<boolean>} */
async function ensureCivicationCareerRoleResolverLoaded() {
  if (window.CivicationCareerRoleResolver?.resolveCareerRoleScope) return true;
  try {
    await loadCivicationScriptOnce("js/Civication/systems/civicationCareerRoleResolver.js");
    return !!window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
  } catch (error) {
    console.warn("[CivicationBoot] career role resolver kunne ikke lastes", error);
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
  window.HG_CAREERS = Array.isArray((/** @type {CiviBootCareerPayload} */ (careersJson))?.careers)
    ? (/** @type {CiviBootCareerPayload} */ (careersJson)).careers
    : [];
}

(function () {
  /**
   * @param {any} error
   * @returns {void}
   */
  function showBootError(error) {
    window.__CIVI_BOOT_ERROR__ = error;
    if (error?.stack) console.error("[CivicationBoot] stack", error.stack);
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

  /** @returns {Promise<void>} */
  async function start() {
    try {
      console.log("Civication boot start");

      await loadCivicationData();
      await ensureCiviCareerRulesLoaded();

      window.HG_CiviEngine =
    new CivicationEventEngine({
      packBasePath: "data/Civication",
      maxInbox: 1,
      packMap: {
      naering: "jobbmails/naeringsliv/naeringslivCivic.json",
      naeringsliv: "jobbmails/naeringsliv/naeringslivCivic.json",
      vitenskap: "jobbmails/vitenskapCivic.json",
      media: "jobbmails/mediaCivic.json",
      by: "jobbmails/byCivic.json"
      }
    });

      await ensureCivicationRoleModelRuntimeLoaded();
      await ensureCivicationCareerRoleResolverLoaded();
      await ensureCivicationBlockedJobMessagesLoaded();

      if (window.CivicationEconomyEngine?.tickWeekly) {
        CivicationEconomyEngine.tickWeekly();
      }

      if (window.CivicationObligationEngine?.evaluate) {
        CivicationObligationEngine.evaluate();
      }

      /** @type {CiviBootMethodBag|undefined} */
      const ui = window.CivicationUI;
      ui?.init?.();

      /** @type {CiviBootMethodBag|undefined} */
      const engine = window.HG_CiviEngine;
      await engine?.onAppOpen?.();

      window.dispatchEvent(new Event("civi:dataReady"));
      window.dispatchEvent(new Event("civi:booted"));
    } catch (error) {
      console.error("[CivicationBoot] start feilet", error);
      showBootError(error);
    }
  }

  document.addEventListener("DOMContentLoaded", start);

  window.addEventListener("updateProfile", () => {
  if (typeof window.checkTierUpgrades === "function") {
    window.checkTierUpgrades();
  }
});

})();
