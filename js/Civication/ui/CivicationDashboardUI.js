// ============================================================
// CIVICATION DASHBOARD UI
// Leser eksisterende Civication-state og fyller toppdashboardet.
// Ingen state-mutasjon her: kun presentasjon.
// Laster også Civication Mini Mode som presentasjonslag.
// ============================================================

/**
 * @typedef {{ kind: string, label: string }} CiviHeaderChip
 * @typedef {{ state?: any, view?: any, includeEmptyRole?: boolean }} CiviHeaderStatusOptions
 */

(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function safeJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined || raw === "") return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function setText(id, value) {
    const el = $(id);
    if (!el) return;
    el.textContent = value;
  }

  function asNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function loadStyleOnce(href) {
    if (!href || document.querySelector(`link[href="${href}"]`)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScriptOnce(src) {
    if (!src) return Promise.resolve(false);
    if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve(true);

    return new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = src;
      script.onload = function () { resolve(true); };
      script.onerror = function () { reject(new Error(`Kunne ikke laste ${src}`)); };
      document.body.appendChild(script);
    });
  }

  function ensureMiniModeLoaded() {
    loadStyleOnce("css/civi-mini.css");

    loadScriptOnce("js/Civication/ui/CivicationMiniSectionsUI.js")
      .then(function () {
        window.CivicationMiniSectionsUI?.boot?.();
        window.CivicationMiniSectionsUI?.refresh?.();
      })
      .catch(function (error) {
        console.warn("[CivicationDashboardUI] Mini mode kunne ikke lastes", error);
      });
  }

  function ensureBrandJobUILoaded() {
    loadStyleOnce("css/civi-brand-job.css");

    loadScriptOnce("js/Civication/ui/CivicationBrandJobUI.js")
      .then(function () {
        window.CivicationBrandJobUI?.boot?.();
        window.CivicationBrandJobUI?.refresh?.();
      })
      .catch(function (error) {
        console.warn("[CivicationDashboardUI] Brand job UI kunne ikke lastes", error);
      });
  }

  function getWalletPC() {
    if (typeof window.getPCWallet === "function") {
      const wallet = /** @type {any} */ (window.getPCWallet());
      const fromFn = typeof wallet === "number"
        ? asNumber(wallet, NaN)
        : asNumber(wallet?.pc ?? wallet?.balance ?? wallet?.amount, NaN);
      if (Number.isFinite(fromFn)) return fromFn;
    }

    const raw = localStorage.getItem("hg_pc_wallet_v1");
    if (!raw) return 0;

    const direct = Number(raw);
    if (Number.isFinite(direct)) return direct;

    const wallet = safeJSON("hg_pc_wallet_v1", {});
    return asNumber(wallet.pc ?? wallet.balance ?? wallet.amount, 0);
  }

  function getInbox() {
    const fromMailEngine = window.CivicationMailEngine?.getInbox?.();
    if (Array.isArray(fromMailEngine)) return fromMailEngine;

    const fromState = window.CivicationState?.getInbox?.();
    if (Array.isArray(fromState)) return fromState;
    return [];
  }

  function getActivePosition() {
    return /** @type {any} */ (window.CivicationState?.getActivePosition?.() || null);
  }

  function getActiveRoleTitle(active) {
    if (!active || typeof active !== "object") return "";
    return String(active.title || active.role_title || active.roleName || active.positionTitle || "").trim();
  }

  function getCanonicalActiveRoleTitle() {
    return getActiveRoleTitle(getActivePosition());
  }

  /**
   * Builds the compact Civication header from the same active-position source as
   * Min situasjon, Aktiv rolle and Arbeidsdag. Lifestory day/meters may be passed
   * in by the Life Story UI, but the role label is never read from pilot/demo
   * content.
   * @param {CiviHeaderStatusOptions} [options]
   * @returns {CiviHeaderChip[]}
   */
  function getHeaderStatusChips(options) {
    const opts = options || {};
    const lifeState = opts.state || {};
    const view = opts.view || {};
    const meters = lifeState.meters || {};
    const activeRoleTitle = getCanonicalActiveRoleTitle();
    /** @type {CiviHeaderChip[]} */
    const chips = [];

    if (activeRoleTitle) {
      chips.push({ kind: "role", label: activeRoleTitle });
    } else if (opts.includeEmptyRole !== false) {
      chips.push({ kind: "role is-empty", label: "Ingen aktiv rolle" });
    }

    chips.push({ kind: "day", label: "Dag " + asNumber(lifeState.dag, 1) });
    chips.push({ kind: "phase", label: view.dagFerdig ? "Dagen er over" : String(view.fase?.navn || lifeState.fase || "Morgen") });
    chips.push({ kind: "meter", label: "Psyke " + asNumber(meters.psyke, 62) });
    chips.push({ kind: "meter", label: "Energi " + asNumber(meters.energi, 71) });
    chips.push({ kind: "pc", label: asNumber(meters.penger, getWalletPC()) + " PC" });

    return chips.filter(function (chip) { return chip && chip.label; });
  }

  /**
   * @param {CiviHeaderStatusOptions} [options]
   * @returns {string}
   */
  function renderCivicationHeaderStatus(options) {
    return getHeaderStatusChips(options).map(function (chip) { return chip.label; }).join(" · ");
  }

  /**
   * @param {CiviHeaderChip} chip
   * @returns {HTMLSpanElement}
   */
  function renderHeaderChip(chip) {
    const span = document.createElement("span");
    span.className = "civi-header-chip civi-header-chip--" + String(chip.kind || "status").replace(/\s+/g, " civi-header-chip--");
    span.textContent = chip.label;
    span.title = chip.label;
    return span;
  }

  /** @type {CiviHeaderStatusOptions | null} */
  let lastHeaderStatusOptions = null;

  /**
   * @param {CiviHeaderStatusOptions} [options]
   */
  function updateHeaderStatus(options) {
    if (options) lastHeaderStatusOptions = options;
    const header = $("civiLifestoryHeaderStatus");
    if (!header) return;
    const chips = getHeaderStatusChips(options || lastHeaderStatusOptions || undefined);
    header.textContent = "";
    chips.map(renderHeaderChip).forEach(function (chip) { header.appendChild(chip); });
  }

  function getCiviState() {
    return window.CivicationState?.getState?.() || safeJSON("hg_civi_state_v1", {});
  }

  function getWeeklyIncome(active) {
    if (!active?.career_id || typeof window.calculateWeeklySalary !== "function") {
      return null;
    }

    try {
      const merits = safeJSON("merits_by_category", {});
      const points = asNumber(merits?.[active.career_id]?.points, 0);

      const badge = Array.isArray(window.BADGES)
        ? window.BADGES.find(function (/** @type {any} */ b) {
            return b && String(b.id) === String(active.career_id);
          })
        : null;

      const tierIndex =
        badge && typeof window.deriveTierFromPoints === "function"
          ? asNumber(window.deriveTierFromPoints(badge, points)?.tierIndex, 0)
          : 0;

      const career = Array.isArray(window.HG_CAREERS)
        ? window.HG_CAREERS.find(function (/** @type {any} */ c) {
            return c && String(c.career_id) === String(active.career_id);
          })
        : null;

      const weekly = career ? window.calculateWeeklySalary(career, tierIndex) : NaN;
      return Number.isFinite(Number(weekly)) ? Number(weekly) : null;
    } catch {
      return null;
    }
  }

  function getHomeLabel() {
    const home = /** @type {any} */ (window.CivicationHome?.getState?.());
    const current = home?.home || null;

    if (current?.status === "settled") {
      return window.CivicationHome?.getDistrictName?.(current.district) || String(current.district || "Hjem");
    }

    return "Ikke valgt";
  }

  function getStatusLabel(state) {
    const stability = String(state?.stability || "STABLE").toUpperCase();

    if (stability === "WARNING") return "Advarsel";
    if (stability === "FIRED") return "Avsluttet";
    return "Stabil";
  }

  function isOpenInboxItem(item) {
    if (!item || typeof item !== "object") return false;

    const wrapperStatus = String(item.status || "").toLowerCase();
    const wrapperResolved = item.resolved === true;

    const hasEvent = !!item.event && typeof item.event === "object";
    const eventStatus = hasEvent ? String(item.event.status || "").toLowerCase() : "";
    const eventResolved = hasEvent ? item.event.resolved === true : false;

    if (wrapperResolved || wrapperStatus === "resolved" || eventResolved || eventStatus === "resolved") {
      return false;
    }

    if (wrapperStatus === "pending" || eventStatus === "pending") {
      return true;
    }

    return true;
  }

  const NO_FOCUS_LABEL = "Ingen åpne hendelser";

  function getPendingLabel(inbox) {
    const pending = /** @type {any} */ (window.HG_CiviEngine?.getPendingEvent?.());
    const fallbackItem = Array.isArray(inbox) ? inbox.find(isOpenInboxItem) : null;
    const event = pending?.event || fallbackItem?.event || fallbackItem || null;

    if (!event) return NO_FOCUS_LABEL;

    const channel = window.CivicationEventChannels?.classifyEvent?.(event) || "";
    if (channel === "milestone") return "Ny milepæl i dagens fase";

    return "Åpen sak i dagens fase";
  }


  function getTravelFocusLabel() {
    try {
      const destination = window.CivicationTravelState?.getCurrentDestination?.();
      if (!destination || typeof destination !== "object") return null;

      const placeName = String(destination.placeName || "").trim();
      const placeId = String(destination.placeId || "").trim();
      const label = placeName || placeId;

      return label ? `Mål: ${label}` : null;
    } catch {
      return null;
    }
  }

  function getFocusLabel(inbox) {
    const pendingLabel = getPendingLabel(inbox);
    if (pendingLabel && pendingLabel !== NO_FOCUS_LABEL) return pendingLabel;

    return getTravelFocusLabel() || pendingLabel;
  }

  function render() {
    ensureMiniModeLoaded();
    ensureBrandJobUILoaded();

    const active = getActivePosition();
    const state = getCiviState();
    const inbox = getInbox();
    const split = window.CivicationEventChannels?.splitInbox?.(inbox) || { messages: inbox, unknown: [], workday: [], milestones: [] };
    const openInboxItems = ((split.messages || []).concat(split.unknown || [])).filter(isOpenInboxItem);
    const focusInboxItems = ((split.messages || [])
      .concat(split.unknown || [], split.workday || [], split.milestones || []))
      .filter(isOpenInboxItem);
    const inboxCount = openInboxItems.length;
    const walletPC = getWalletPC();
    const weeklyIncome = getWeeklyIncome(active);
    const statusLabel = getStatusLabel(state);
    const homeLabel = getHomeLabel();
    const focusLabel = getFocusLabel(focusInboxItems);

    const roleTitle = active?.title ? String(active.title) : "Ingen aktiv rolle";
    const roleField = active
      ? String(active.career_name || active.career_id || "Ukjent felt")
      : "Ta quiz og åpne jobbtilbud for å starte et livsløp.";

    setText("civiDashRole", roleTitle);
    setText("civiDashSummary", roleField);
    setText("civiDashWallet", `${walletPC} PC`);
    setText(
      "civiDashIncome",
      weeklyIncome === null ? "Ingen ukeinntekt" : `+${weeklyIncome} PC / uke`
    );
    setText("civiDashStatus", statusLabel);
    setText("civiDashStatusMeta", active ? "Aktiv situasjon" : "Startfase");
    setText("civiDashInbox", String(inboxCount));
    setText("civiDashInboxMeta", inboxCount === 1 ? "åpen melding" : "åpne meldinger");
    setText("civiDashHome", homeLabel);
    setText("civiDashHomeMeta", homeLabel === "Ikke valgt" ? "Velg nabolag" : "Bosatt");
    setText("civiDashFocus", focusLabel);

    document.body.classList.toggle("civi-has-active-role", !!active);
    document.body.classList.toggle("civi-has-inbox", inboxCount > 0);

    updateHeaderStatus();

    window.CivicationMiniSectionsUI?.refresh?.();
    window.CivicationBrandJobUI?.refresh?.();
  }

  function scheduleRender() {
    ensureMiniModeLoaded();
    ensureBrandJobUILoaded();
    window.setTimeout(render, 0);
    window.setTimeout(render, 120);
  }

  window.CivicationDashboardUI = { render, renderCivicationHeaderStatus, updateHeaderStatus, getCanonicalActiveRoleTitle };

  document.addEventListener("DOMContentLoaded", scheduleRender);

  [
    "civi:dataReady",
    "civi:booted",
    "updateProfile",
    "civi:inboxChanged",
    "civi:homeChanged",
    "civiPublicUpdated",
    "civi:travelStateUpdated",
    "civi:travelDestinationSet",
    "civi:lifestoryChanged"
  ].forEach(function (eventName) {
    window.addEventListener(eventName, scheduleRender);
  });
})();
