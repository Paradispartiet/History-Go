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
 * @template T
 * @param {() => T} fn
 * @param {T} fallback
 * @returns {T}
 */
function civiDebugSafe(fn, fallback) {
  try {
    const value = fn();
    return value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {unknown} fallback
 * @returns {unknown}
 */
function civiDebugReadJson(key, fallback) {
  return civiDebugSafe(() => {
    const raw = window.localStorage?.getItem?.(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  }, fallback);
}

/**
 * @param {unknown} activePosition
 * @returns {string|null}
 */
function civiDebugActiveCareerId(activePosition) {
  if (!activePosition || typeof activePosition !== "object") return null;
  const record = /** @type {{ career_id?: unknown, careerId?: unknown, id?: unknown }} */ (activePosition);
  const id = record.career_id || record.careerId || record.id;
  return id ? String(id) : null;
}

/** @returns {Promise<unknown[]>} */
async function civiDebugVisibleStores() {
  return Promise.resolve(civiDebugSafe(() => window.HG_CiviShop?.getVisibleStores?.(), []))
    .then((stores) => Array.isArray(stores) ? stores : [])
    .catch(() => []);
}

/** @returns {Promise<unknown[]>} */
async function civiDebugVisiblePacks() {
  return Promise.resolve(civiDebugSafe(() => window.HG_CiviShop?.getVisiblePacks?.(), []))
    .then((packs) => Array.isArray(packs) ? packs : [])
    .catch(() => []);
}

/**
 * @param {unknown} inventory
 * @returns {number}
 */
function civiDebugOwnedPackCount(inventory) {
  if (!inventory || typeof inventory !== "object") return 0;
  const packs = /** @type {{ packs?: unknown }} */ (inventory).packs;
  if (Array.isArray(packs)) return packs.length;
  if (packs && typeof packs === "object") return Object.keys(packs).length;
  return 0;
}

/**
 * @param {unknown} value
 * @returns {number|string|null}
 */
function civiDebugWalletBalance(value) {
  if (value && typeof value === "object") {
    const balance = /** @type {{ balance?: unknown, amount?: unknown }} */ (value).balance ??
      /** @type {{ balance?: unknown, amount?: unknown }} */ (value).amount;
    return typeof balance === "number" || typeof balance === "string" ? balance : null;
  }
  return typeof value === "number" || typeof value === "string" ? value : null;
}

/**
 * @param {unknown} activePosition
 * @returns {string|null}
 */
function civiDebugActiveRole(activePosition) {
  if (!activePosition || typeof activePosition !== "object") return null;
  const record = /** @type {{ title?: unknown, role_title?: unknown, role?: unknown, career_name?: unknown, career_id?: unknown }} */ (activePosition);
  const role = record.title || record.role_title || record.role || record.career_name || record.career_id;
  return role ? String(role) : null;
}

/**
 * @param {unknown} home
 * @returns {{ district: string|null, status: string|null }}
 */
function civiDebugHomeSummary(home) {
  if (!home || typeof home !== "object") return { district: null, status: null };
  const record = /** @type {{ district?: unknown, selectedDistrict?: unknown, district_id?: unknown, status?: unknown, homeStatus?: unknown }} */ (home);
  return {
    district: record.district || record.selectedDistrict || record.district_id ? String(record.district || record.selectedDistrict || record.district_id) : null,
    status: record.status || record.homeStatus ? String(record.status || record.homeStatus) : null
  };
}

/**
 * @param {unknown} pendingEvent
 * @returns {string|null}
 */
function civiDebugEventSubject(pendingEvent) {
  if (!pendingEvent || typeof pendingEvent !== "object") return null;
  const record = /** @type {{ subject?: unknown, title?: unknown, headline?: unknown, id?: unknown }} */ (pendingEvent);
  const subject = record.subject || record.title || record.headline || record.id;
  return subject ? String(subject) : null;
}

/**
 * @param {unknown} psyche
 * @returns {{ autonomy: unknown, integrity: unknown, visibility: unknown }|null}
 */
function civiDebugPsycheSummary(psyche) {
  if (!psyche || typeof psyche !== "object") return null;
  const record = /** @type {{ autonomy?: unknown, integrity?: unknown, visibility?: unknown }} */ (psyche);
  return {
    autonomy: record.autonomy ?? null,
    integrity: record.integrity ?? null,
    visibility: record.visibility ?? null
  };
}

(function () {
  /** @returns {Promise<Record<string, unknown>>} */
  async function snapshot() {
    const wallet = civiDebugSafe(() => window.CivicationState?.getWallet?.(), null);
    const legacyWallet = civiDebugReadJson("hg_pc_wallet_v1", null);
    const inventory = civiDebugSafe(() => window.HG_CiviShop?.getInv?.(), null);
    const activePosition = civiDebugSafe(() => window.CivicationState?.getActivePosition?.(), null);
    const activeCareerId = civiDebugActiveCareerId(activePosition);
    const civiState = civiDebugSafe(() => window.CivicationState?.getState?.(), null);
    const capital = civiDebugReadJson("hg_capital_v1", null);
    const psyche = civiDebugSafe(() => window.CivicationPsyche?.getSnapshot?.(activeCareerId), null);
    const home = civiDebugSafe(() => window.CivicationHome?.getState?.(), null);
    const visibleStores = await civiDebugVisibleStores();
    const visiblePacks = await civiDebugVisiblePacks();
    const inbox = civiDebugSafe(() => window.CivicationState?.getInbox?.(), []);
    const pendingEvent = civiDebugSafe(() => window.HG_CiviEngine?.getPendingEvent?.(), null);
    const profileSnapshot = civiDebugSafe(() => window.HG_CiviProfileSnapshot?.(), null);
    const merits = civiDebugReadJson("merits_by_category", {});

    return {
      wallet,
      legacyWallet,
      inventory,
      activePosition,
      civiState,
      capital,
      psyche,
      home,
      visibleStores,
      visiblePacks,
      inbox: Array.isArray(inbox) ? inbox : [],
      pendingEvent,
      profileSnapshot,
      merits: merits && typeof merits === "object" ? merits : {},
      timestamp: new Date().toISOString()
    };
  }

  /** @returns {Promise<Record<string, unknown>>} */
  async function print() {
    const snap = await snapshot();
    const homeSummary = civiDebugHomeSummary(snap.home);
    const psycheSummary = civiDebugPsycheSummary(snap.psyche);

    console.table([{
      walletBalance: civiDebugWalletBalance(snap.wallet),
      activeRole: civiDebugActiveRole(snap.activePosition),
      ownedPackCount: civiDebugOwnedPackCount(snap.inventory),
      visiblePackCount: Array.isArray(snap.visiblePacks) ? snap.visiblePacks.length : 0,
      inboxCount: Array.isArray(snap.inbox) ? snap.inbox.length : 0,
      pendingEventSubject: civiDebugEventSubject(snap.pendingEvent),
      homeDistrict: homeSummary.district,
      homeStatus: homeSummary.status,
      psycheAutonomy: psycheSummary?.autonomy ?? null,
      psycheIntegrity: psycheSummary?.integrity ?? null,
      psycheVisibility: psycheSummary?.visibility ?? null
    }]);

    return snap;
  }

  window.HG_CiviDebug = { snapshot, print };
})();

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

      window.HG_CiviEngine = /** @type {any} */ (new CivicationEventEngine({
      packBasePath: "data/Civication",
      maxInbox: 1,
      packMap: {
      naering: "jobbmails/naeringsliv/naeringslivCivic.json",
      naeringsliv: "jobbmails/naeringsliv/naeringslivCivic.json",
      vitenskap: "jobbmails/vitenskapCivic.json",
      media: "jobbmails/mediaCivic.json",
      by: "jobbmails/byCivic.json"
      }
    }));

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
