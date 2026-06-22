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
  const record = /** @type {{ district?: unknown, selectedDistrict?: unknown, district_id?: unknown, currentDistrict?: unknown, status?: unknown, homeStatus?: unknown }} */ (home);
  const currentDistrict = record.currentDistrict && typeof record.currentDistrict === "object"
    ? /** @type {{ id?: unknown, name?: unknown }} */ (record.currentDistrict).id || /** @type {{ id?: unknown, name?: unknown }} */ (record.currentDistrict).name
    : record.currentDistrict;
  return {
    district: record.district || record.selectedDistrict || record.district_id || currentDistrict ? String(record.district || record.selectedDistrict || record.district_id || currentDistrict) : null,
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
 * @param {unknown} value
 * @returns {number|null}
 */
function civiDebugNumericBalance(value) {
  const balance = civiDebugWalletBalance(value);
  if (typeof balance === "number") return Number.isFinite(balance) ? balance : null;
  if (typeof balance === "string" && balance.trim() !== "") {
    const parsed = Number(balance);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * @param {unknown[]} warnings
 * @returns {string}
 */
function civiDebugStatusFromWarnings(warnings) {
  return warnings.length ? "warning" : "ok";
}

/**
 * @param {boolean} ok
 * @param {string} status
 * @param {string} message
 * @param {Record<string, unknown>} details
 * @returns {{ ok: boolean, status: string, message: string, details: Record<string, unknown> }}
 */
function civiDebugCheck(ok, status, message, details) {
  return { ok, status, message, details: details || {} };
}

/**
 * @param {unknown} inventory
 * @returns {boolean}
 */
function civiDebugInventoryHasCoreShape(inventory) {
  if (!inventory || typeof inventory !== "object") return false;
  const record = /** @type {{ packs?: unknown, ownedItems?: unknown, style_counts?: unknown }} */ (inventory);
  return !!record.packs && !!record.ownedItems && !!record.style_counts;
}

/**
 * @param {unknown} inventory
 * @returns {boolean}
 */
function civiDebugOwnedItemsDisagreeWithPacks(inventory) {
  if (!inventory || typeof inventory !== "object") return false;
  const record = /** @type {{ packs?: unknown, ownedItems?: unknown }} */ (inventory);
  const packCount = Array.isArray(record.packs) ? record.packs.length : (record.packs && typeof record.packs === "object" ? Object.keys(record.packs).length : 0);
  const ownedCount = Array.isArray(record.ownedItems) ? record.ownedItems.length : (record.ownedItems && typeof record.ownedItems === "object" ? Object.keys(record.ownedItems).length : 0);
  return packCount !== ownedCount;
}

/**
 * @param {unknown} item
 * @returns {boolean}
 */
function civiDebugIsPendingInboxItem(item) {
  if (!item || typeof item !== "object") return false;
  const status = String((/** @type {{ status?: unknown }} */ (item)).status || "pending").toLowerCase();
  return status === "pending" || status === "open";
}

/**
 * @param {unknown} item
 * @returns {boolean}
 */
function civiDebugHasChoices(item) {
  const event = item && typeof item === "object" ? ((/** @type {{ event?: unknown }} */ (item)).event || item) : null;
  if (!event || typeof event !== "object") return false;
  const choices = /** @type {{ choices?: unknown, options?: unknown }} */ (event).choices || /** @type {{ choices?: unknown, options?: unknown }} */ (event).options;
  return Array.isArray(choices) && choices.length > 0;
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
    const wallet = civiDebugSafe(() => window.HG_CiviShop?.getWallet?.() ?? window.CivicationState?.getWallet?.(), null);
    const legacyWallet = civiDebugReadJson("hg_pc_wallet_v1", null);
    const inventory = civiDebugSafe(() => window.HG_CiviShop?.getInv?.(), null);
    const activePosition = civiDebugSafe(() => window.CivicationState?.getActivePosition?.(), null);
    const activeCareerId = civiDebugActiveCareerId(activePosition);
    const civiState = civiDebugSafe(() => window.CivicationState?.getState?.(), null);
    const capital = civiDebugReadJson("hg_capital_v1", null);
    const psyche = civiDebugSafe(() => window.CivicationPsyche?.getSnapshot?.(activeCareerId), null);
    const home = civiDebugSafe(() => window.CivicationHome?.getState?.(), null);
    const homeSnapshot = civiDebugSafe(() => window.CivicationHome?.getHomeSnapshot?.(), null);
    const visibleStores = await civiDebugVisibleStores();
    const visiblePacks = await civiDebugVisiblePacks();
    const inbox = civiDebugSafe(() => window.CivicationState?.getInbox?.(), []);
    const pendingEvent = civiDebugSafe(() => window.HG_CiviEngine?.getPendingEvent?.(), null);
    const profileSnapshot = civiDebugSafe(() => window.HG_CiviProfileSnapshot?.(), null);
    const workday = civiDebugSafe(() => window.HG_CiviWorkdaySnapshot?.(), null);
    const economySnapshot = civiDebugSafe(() => window.HG_CiviEconomySnapshot?.() || null, null);
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
      homeSnapshot,
      visibleStores,
      visiblePacks,
      inbox: Array.isArray(inbox) ? inbox : [],
      pendingEvent,
      profileSnapshot,
      workday,
      economySnapshot,
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

  /** @returns {Promise<Record<string, unknown>>} */
  async function health() {
    let snap;
    try {
      snap = await snapshot();
    } catch (error) {
      const check = civiDebugCheck(false, "blocker", "Debug-snapshot feilet.", { error: String(error?.message || error || "unknown") });
      const checks = {
        wallet: civiDebugCheck(false, "blocker", "Kan ikke vurdere lommebok uten snapshot.", {}),
        profile: civiDebugCheck(false, "blocker", "Kan ikke vurdere profil uten snapshot.", {}),
        shop: civiDebugCheck(false, "blocker", "Kan ikke vurdere butikk uten snapshot.", {}),
        workday: civiDebugCheck(false, "blocker", "Kan ikke vurdere arbeidsdag uten snapshot.", {}),
        home: civiDebugCheck(false, "blocker", "Kan ikke vurdere hjem uten snapshot.", {}),
        economy: civiDebugCheck(false, "blocker", "Kan ikke vurdere økonomi uten snapshot.", {}),
        inbox: civiDebugCheck(false, "blocker", "Kan ikke vurdere inbox uten snapshot.", {}),
        outcome: civiDebugCheck(false, "blocker", "Kan ikke vurdere utfall uten snapshot.", {}),
        debug: check
      };
      return {
        ok: false,
        score: 0,
        checks,
        blockers: Object.entries(checks).map(([key, value]) => ({ key, message: value.message, details: value.details })),
        warnings: [],
        summary: "Civication har blokkere som bør fikses før testing.",
        timestamp: new Date().toISOString()
      };
    }

    const walletBalance = civiDebugNumericBalance(snap.wallet);
    const legacyBalance = civiDebugNumericBalance(snap.legacyWallet);
    const walletWarnings = [];
    if (walletBalance !== null && legacyBalance !== null && walletBalance !== legacyBalance) walletWarnings.push("legacy_wallet_differs");
    const walletOk = walletBalance !== null;

    const profileWarnings = [];
    if (snap.activePosition && typeof snap.activePosition === "object" && !civiDebugActiveRole(snap.activePosition)) profileWarnings.push("active_position_missing_role");
    const profileHelperExists = typeof window.HG_CiviProfileSnapshot === "function";
    const profileOk = !!snap.profileSnapshot || !profileHelperExists;

    const shopWarnings = [];
    if (typeof window.HG_CiviShop?.getVisiblePacks !== "function" || !Array.isArray(snap.visiblePacks)) shopWarnings.push("visible_packs_unavailable");
    if (civiDebugOwnedItemsDisagreeWithPacks(snap.inventory)) shopWarnings.push("owned_items_packs_disagree");
    const shopOk = !!window.HG_CiviShop && civiDebugInventoryHasCoreShape(snap.inventory);

    const activeJob = !!snap.activePosition;
    const workdayWarnings = [];
    const workdayRecord = snap.workday && typeof snap.workday === "object" ? /** @type {Record<string, unknown>} */ (snap.workday) : null;
    if (activeJob && workdayRecord && !workdayRecord.task && !workdayRecord.event && !snap.pendingEvent) workdayWarnings.push("active_job_without_task_or_event");
    const workdayHelperExists = typeof window.HG_CiviWorkdaySnapshot === "function";
    const workdayOk = snap.workday !== null && snap.workday !== undefined || !workdayHelperExists;

    const homeWarnings = [];
    const homeSummary = civiDebugHomeSummary(snap.homeSnapshot || snap.home);
    const homePressure = snap.homeSnapshot && typeof snap.homeSnapshot === "object" ? String((/** @type {{ housingPressure?: unknown }} */ (snap.homeSnapshot)).housingPressure || "") : "";
    if (!homeSummary.district) homeWarnings.push("no_district_selected");
    if (homePressure === "pressure" || homePressure === "crisis") homeWarnings.push(`housing_${homePressure}`);
    const homeOk = !!snap.homeSnapshot && typeof snap.homeSnapshot === "object";

    const economyWarnings = [];
    const economy = snap.economySnapshot && typeof snap.economySnapshot === "object" ? /** @type {Record<string, unknown>} */ (snap.economySnapshot) : null;
    if (economy && typeof economy.estimatedNetAfterHome === "number" && economy.estimatedNetAfterHome < 0) economyWarnings.push("negative_estimated_net");
    if (Array.isArray(economy?.warnings)) {
      if (economy.warnings.includes("already_ticked_this_week")) economyWarnings.push("already_ticked_this_week");
      if (economy.warnings.includes("no_active_position")) economyWarnings.push("no_active_position");
    }
    if (economy?.already_ticked_this_week === true) economyWarnings.push("already_ticked_this_week");
    const economyBalance = economy ? Number(economy.balance ?? economy.walletBalance ?? walletBalance) : NaN;
    const economyOk = !!economy && Number.isFinite(economyBalance);

    const inboxWarnings = [];
    const inboxItems = Array.isArray(snap.inbox) ? snap.inbox : null;
    const pendingItems = inboxItems ? inboxItems.filter(civiDebugIsPendingInboxItem) : [];
    if (pendingItems.length > 1) inboxWarnings.push("multiple_pending_action_items");
    if (pendingItems.some((item) => !civiDebugHasChoices(item))) inboxWarnings.push("pending_event_without_choices");
    const inboxOk = Array.isArray(snap.inbox);

    const outcomeWarnings = [];
    const outcomeVm = civiDebugSafe(() => window.CivicationCareerOutcomeRuntime?.getOutcomeViewModel?.(snap.civiState), null);
    const hasOutcome = !!(outcomeVm && typeof outcomeVm === "object" && /** @type {{ hasOutcome?: unknown }} */ (outcomeVm).hasOutcome);
    if (hasOutcome && !activeJob && !window.CivicationOutcomeStatusUI) outcomeWarnings.push("terminal_outcome_missing_status_ui");

    const checks = {
      wallet: civiDebugCheck(walletOk, walletOk ? civiDebugStatusFromWarnings(walletWarnings) : "blocker", walletOk ? "Lommebok kan leses." : "Lommebok mangler eller er ugyldig.", { balance: walletBalance, warnings: walletWarnings }),
      profile: civiDebugCheck(profileOk, profileOk ? civiDebugStatusFromWarnings(profileWarnings) : "blocker", profileOk ? "Profil-snapshot kan leses." : "Profil-snapshot mangler eller feilet.", { warnings: profileWarnings }),
      shop: civiDebugCheck(shopOk, shopOk ? civiDebugStatusFromWarnings(shopWarnings) : "blocker", shopOk ? "Butikk og inventar kan leses." : "HG_CiviShop mangler eller inventar er ugyldig.", { warnings: shopWarnings }),
      workday: civiDebugCheck(workdayOk, workdayOk ? (activeJob ? civiDebugStatusFromWarnings(workdayWarnings) : "idle") : "blocker", activeJob ? "Arbeidsdag kan leses." : "Ingen aktiv jobb; arbeidsdag er inaktiv.", { warnings: workdayWarnings }),
      home: civiDebugCheck(homeOk, homeOk ? civiDebugStatusFromWarnings(homeWarnings) : "blocker", homeOk ? "Hjem-snapshot kan leses." : "Hjem-tilstand mangler eller er ugyldig.", { warnings: homeWarnings }),
      economy: civiDebugCheck(economyOk, economyOk ? civiDebugStatusFromWarnings(economyWarnings) : "blocker", economyOk ? "Økonomi-snapshot kan leses." : "Økonomi-snapshot mangler eller er ugyldig.", { balance: Number.isFinite(economyBalance) ? economyBalance : null, warnings: economyWarnings }),
      inbox: civiDebugCheck(inboxOk, inboxOk ? civiDebugStatusFromWarnings(inboxWarnings) : "blocker", inboxOk ? "Inbox kan leses." : "Inbox kan ikke leses.", { pendingCount: pendingItems.length, warnings: inboxWarnings }),
      outcome: civiDebugCheck(true, civiDebugStatusFromWarnings(outcomeWarnings), hasOutcome ? "Terminalt utfall er håndtert." : "Ingen terminalt utfall.", { hasOutcome, warnings: outcomeWarnings }),
      debug: civiDebugCheck(true, "ok", "Debug-snapshot fullført.", {})
    };

    const blockers = Object.entries(checks).filter(([, check]) => check.status === "blocker").map(([key, check]) => ({ key, message: check.message, details: check.details }));
    const warnings = Object.entries(checks).flatMap(([key, check]) => (Array.isArray(check.details.warnings) ? check.details.warnings.map((warning) => ({ key, warning })) : []));
    const score = Math.max(0, 100 - (blockers.length * 25) - (warnings.length * 5));
    return {
      ok: blockers.length === 0,
      score,
      checks,
      blockers,
      warnings,
      summary: blockers.length ? "Civication har blokkere som bør fikses før testing." : (warnings.length ? "Civication er spillbart, men har advarsler." : "Civication ser spillbart ut."),
      timestamp: new Date().toISOString()
    };
  }

  /** @returns {Promise<Record<string, unknown>>} */
  async function printHealth() {
    const report = /** @type {any} */ (await health());
    const rows = Object.entries(report.checks || {}).map(([key, check]) => ({
      check: key,
      status: check.status,
      ok: check.ok,
      message: check.message
    }));
    const group = console.groupCollapsed || console.group;
    if (group) group.call(console, `[HG_CiviDebug.health] ${report.score}/100 – ${report.summary}`);
    if (console.table) console.table(rows);
    else console.log(rows);
    if (report.blockers?.length && console.warn) console.warn("[HG_CiviDebug.health] blockers", report.blockers);
    if (report.warnings?.length && console.warn) console.warn("[HG_CiviDebug.health] warnings", report.warnings);
    if (console.groupEnd && group) console.groupEnd();
    return report;
  }

  window.HG_CiviDebug = { snapshot, print, health, printHealth };
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
