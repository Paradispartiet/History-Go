// ============================================================
// CIVICATION DASHBOARD UI
// Leser eksisterende Civication-state og fyller toppdashboardet.
// Ingen state-mutasjon her: kun presentasjon.
// Laster også Civication Mini Mode og brand-jobbstatus som presentasjonslag.
// ============================================================

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
        console.warn("[CivicationDashboardUI] Brand-jobbstatus kunne ikke lastes", error);
      });
  }

  function ensurePresentationLayersLoaded() {
    ensureMiniModeLoaded();
    ensureBrandJobUILoaded();
  }

  function getWalletPC() {
    if (typeof window.getPCWallet === "function") {
      const fromFn = asNumber(window.getPCWallet(), NaN);
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
    const fromState = window.CivicationState?.getInbox?.();
    if (Array.isArray(fromState)) return fromState;

    const stored = safeJSON("hg_civi_inbox_v1", []);
    return Array.isArray(stored) ? stored : [];
  }

  function getActivePosition() {
    return window.CivicationState?.getActivePosition?.() || null;
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
        ? window.BADGES.find(function (b) {
            return b && String(b.id) === String(active.career_id);
          })
        : null;

      const tierIndex =
        badge && typeof window.deriveTierFromPoints === "function"
          ? asNumber(window.deriveTierFromPoints(badge, points)?.tierIndex, 0)
          : 0;

      const career = Array.isArray(window.HG_CAREERS)
        ? window.HG_CAREERS.find(function (c) {
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
    const home = window.CivicationHome?.getState?.();
    const current = home?.home || null;

    if (current?.status === "settled") {
      return String(current.district || "Hjem");
    }

    return "Ikke valgt";
  }

  function getStatusLabel(state) {
    const stability = String(state?.stability || "STABLE").toUpperCase();

    if (stability === "WARNING") return "Advarsel";
    if (stability === "FIRED") return "Avsluttet";
    return "Stabil";
  }

  function getPendingLabel(inbox) {
    const pending = window.HG_CiviEngine?.getPendingEvent?.();
    const event = pending?.event || inbox?.[0]?.event || null;

    if (!event) return "Ingen åpne hendelser";

    return String(
      event.subject ||
      event.title ||
      event.kind ||
      "Åpen hendelse"
    );
  }

  function render() {
    ensurePresentationLayersLoaded();

    const active = getActivePosition();
    const state = getCiviState();
    const inbox = getInbox();
    const walletPC = getWalletPC();
    const weeklyIncome = getWeeklyIncome(active);
    const statusLabel = getStatusLabel(state);
    const homeLabel = getHomeLabel();
    const pendingLabel = getPendingLabel(inbox);

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
    setText("civiDashInbox", String(inbox.length));
    setText("civiDashInboxMeta", inbox.length === 1 ? "åpen hendelse" : "åpne hendelser");
    setText("civiDashHome", homeLabel);
    setText("civiDashHomeMeta", homeLabel === "Ikke valgt" ? "Velg nabolag" : "Bosatt");
    setText("civiDashFocus", pendingLabel);

    document.body.classList.toggle("civi-has-active-role", !!active);
    document.body.classList.toggle("civi-has-inbox", inbox.length > 0);

    window.CivicationMiniSectionsUI?.refresh?.();
    window.CivicationBrandJobUI?.refresh?.();
  }

  function scheduleRender() {
    ensurePresentationLayersLoaded();
    window.setTimeout(render, 0);
    window.setTimeout(render, 120);
  }

  window.CivicationDashboardUI = { render };

  document.addEventListener("DOMContentLoaded", scheduleRender);

  [
    "civi:dataReady",
    "civi:booted",
    "updateProfile",
    "civi:homeChanged",
    "civiPublicUpdated",
    "civi:inboxChanged"
  ].forEach(function (eventName) {
    window.addEventListener(eventName, scheduleRender);
  });
})();
