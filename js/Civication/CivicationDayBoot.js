// ============================================================
// CIVICATION DAY / LIFE-STORY BOOT
// ------------------------------------------------------------
// Ansvarlig for dag-/fortellingslaget INNE i Civication-skallet:
//   - hendelsesmotoren (HG_CiviEngine / CivicationEventEngine)
//   - rolle-modell-runtime
//   - blokkerte jobbmeldinger
//   - forpliktelser (obligation engine)
//   - onAppOpen(): åpner appen, bygger dagens mail-/innboks-scener
//
// Dette laget driver innboks-, arbeidsdag- og dagfase-panelene — som er
// paneler INNE i skallet, ikke skallet selv. «Min dag» (Life Story) er en
// egen, uavhengig modul (CivicationLifestoryUI) og bootes ikke herfra.
//
// Kontrakt:
//   - Kjøres ETTER CivicationShellBoot av koordinatoren.
//   - Er INERT hvis dag-/innboks-DOM mangler (ingen #civiInboxSection).
//   - Egen try/catch: en feil her skal ALDRI stoppe skallet, og skal ALDRI
//     vise boot-error-boksen (skallet er allerede oppe).
//   - Advarer i konsollen KUN ved en faktisk manglende avhengighet.
// ============================================================

/**
 * @typedef {Record<string, unknown>} CiviDayRecord
 * @typedef {CiviDayRecord & {
 *  boot?: (value?: unknown) => unknown,
 *  onAppOpen?: (value?: unknown) => unknown
 * }} CiviDayMethodBag
 */

(function (globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);

  /**
   * @param {string} src
   * @returns {Promise<boolean>}
   */
  function loadScriptOnce(src) {
    const shared = window.HG_CiviBoot?.loadScriptOnce;
    if (typeof shared === "function") return shared(src);
    return Promise.resolve(false);
  }

  /** @returns {Promise<boolean>} */
  async function ensureCivicationRoleModelRuntimeLoaded() {
    /** @type {CiviDayMethodBag|undefined} */
    const roleModelRuntime = window.CivicationRoleModelRuntime;

    if (roleModelRuntime?.boot) {
      roleModelRuntime.boot();
      return true;
    }

    try {
      await loadScriptOnce("js/Civication/systems/civicationRoleModelRuntime.js");
      window.CivicationRoleModelRuntime?.boot?.();
      return true;
    } catch (error) {
      console.warn("[CivicationDayBoot] role model runtime kunne ikke lastes", error);
      return false;
    }
  }

  /** @returns {Promise<boolean>} */
  async function ensureCivicationBlockedJobMessagesLoaded() {
    if (window.CivicationBlockedJobMessages?.enqueueNoUnlockedBrandEmployerMessage) return true;
    try {
      await loadScriptOnce("js/Civication/systems/civicationBlockedJobMessages.js");
      return !!window.CivicationBlockedJobMessages?.enqueueNoUnlockedBrandEmployerMessage;
    } catch (error) {
      console.warn("[CivicationDayBoot] blocked job messages kunne ikke lastes", error);
      return false;
    }
  }

  /**
   * @returns {boolean}
   * Dag-/innbokslaget er bare relevant når panelene finnes. Skall-only-sider
   * (og enhetstester) uten #civiInboxSection skal la dette laget være inert.
   */
  function dayDomPresent() {
    const doc = window.document;
    return !!doc && typeof doc.getElementById === "function" && !!doc.getElementById("civiInboxSection");
  }

  /**
   * Starter dag-/life-story-laget. Egen try/catch — skallet er allerede oppe
   * og skal aldri påvirkes av en feil her.
   * @returns {Promise<void>}
   */
  async function start() {
    if (!dayDomPresent()) {
      console.info("[CivicationDayBoot] dag-/innboks-DOM mangler — dag-/life-story-laget er inert.");
      return;
    }

    try {
      console.log("[CivicationDayBoot] dag-/life-story-boot start");

      const EventEngineCtor = window.CivicationEventEngine;
      if (typeof EventEngineCtor !== "function") {
        console.warn("[CivicationDayBoot] CivicationEventEngine mangler — dag-/mail-motorene startes ikke.");
        return;
      }

      window.HG_CiviEngine = new EventEngineCtor({
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
      await ensureCivicationBlockedJobMessagesLoaded();

      // Økonomi-ticken eies av skallet (kapital/dashboard) og kjøres i
      // CivicationShellBoot — ikke her, for å unngå dobbel ukes-tick.
      if (window.CivicationObligationEngine?.evaluate) {
        window.CivicationObligationEngine.evaluate();
      }

      // Åpne appen: bygger dagens mail-/innboks-scener og dispatcher
      // updateProfile, som får skallets innboks-/arbeidsdag-paneler til å
      // re-rendre fra tomt til fylt.
      /** @type {CiviDayMethodBag|undefined} */
      const engine = window.HG_CiviEngine;
      await engine?.onAppOpen?.();
    } catch (error) {
      // Bevisst ikke showBootError: skallet er oppe, og mail/innboks skal
      // aldri kunne velte hele Civication.
      console.error("[CivicationDayBoot] dag-/life-story-boot feilet (skallet er upåvirket)", error);
    }
  }

  window.CivicationDayBoot = { start };
})(typeof window !== "undefined" ? window : globalThis);
