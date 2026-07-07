// js/Civication/civicationLegacyLoader.js
//
// Civication shell-loader (het tidligere «legacy-loader»).
//
// Denne lasteren henter HELE Civication-skallet — kart, dashboard, nabolag,
// kapital, psyke, identitet, folk, offentlig lag, rolle/arbeidsdag, innboks og
// CivicationBoot — og er nå STANDARD på Civication.html. Skallet er ikke
// legacy: det er selve Civication-produktet. Life Story / «Min dag» lastes
// som egne v2-script-tags i Civication.html og er ÉN modul (primærpanelet)
// inne i dette skallet, ikke hele appen.
//
// Skallet lastes automatisk så snart shell-DOM-en finnes (Civication.html har
// #civiMapWorld). Rene Min dag-flater/enhetstester uten shell-DOM drar derfor
// ikke inn skallet — se shouldAutoLoadShell().
//
// Den eneste egentlige «legacy»-gaten som er igjen er de TUNGE, eksperimentelle
// kart-rendrerne (canvas/3D). De er av som standard (skallet bruker det
// komplette SVG-kartet i CivicationMap) og slås kun på med
// Civication.html?civicationLegacy=1 for full gammel debug — se LEGACY_FLAGS.
//
// Rekkefølgen under er identisk med den gamle <script>-rekkefølgen i
// Civication.html — den er en lastekontrakt, ikke en anbefaling. Ikke
// resorter, ikke legg til nye motorer. Nye fortellinger bygges som data i
// data/Civication/lifestory/, aldri her.

(function (globalScope) {
  "use strict";

  /**
   * Tunge, eksperimentelle kart-rendrere. AV som standard: skallet bruker det
   * komplette SVG-kartet (CivicationMap) som fungerer uten disse. Slås kun på
   * med Civication.html?civicationLegacy=1 for full gammel debug.
   */
  const LEGACY_FLAGS = {
    CIVICATION_CANVAS_MAP_ENABLED: true,
    CIVICATION_THREE_MAP_ENABLED: true
  };

  /** Shell-lastekontrakt — samme rekkefølge som det gamle Civication-skallet. */
  const LEGACY_SCRIPTS = [
    "js/Civication/systems/civicationStorageTrace.js",
    "js/Civication/core/civicationState.js",
    "js/Civication/core/CivicationTravelState.js",
    "js/Civication/systems/civicationMailEngine.js",
    "js/Civication/systems/civicationActivePositionRecovery.js",
    "js/Civication/systems/civicationRoleStarter.js",
    "js/Civication/tiersCivi.js",
    "js/Civication/core/civicationJobs.js",
    "js/brands/brands_loader.js",
    "js/Civication/systems/civicationCareerRoleResolver.js",
    "js/Civication/systems/civicationRolePackDepth.js",
    "js/Civication/systems/civicationBrandAccess.js",
    "js/Civication/systems/civicationBlockedJobMessages.js",
    "js/Civication/systems/civicationBrandEmployerBridge.js",
    "js/Civication/merits-and-jobs.js",
    "js/Civication/roleStoryletBridge.js",
    "js/Civication/core/civicationCalendar.js",
    "js/Civication/core/civicationTaskEngine.js",
    "js/Civication/core/civicationEconomyEngine.js",
    "js/Civication/mailPlanBridge.js",
    "js/Civication/civicationObligationEngine.js",
    "js/Civication/utils/storyResolver.js",
    "js/Civication/systems/day/dayPeopleMeetingGate.js",
    "js/Civication/systems/day/dayPeopleMeetingRelationshipVariant.js",
    "js/Civication/systems/day/dayChoiceToneVariants.js",
    "js/Civication/systems/day/dayCharacterReplyConsequences.js",
    "js/Civication/systems/day/dayAllianceSystem.js",
    "js/Civication/systems/day/dayAllianceMailScoring.js",
    "js/Civication/systems/day/dayFactionConflictSystem.js",
    "js/Civication/systems/day/dayFactionMailScoring.js",
    "js/Civication/systems/day/dayFactionVoice.js",
    "js/Civication/core/civicationEventEngine.js",
    "js/Civication/utils/conflictLoader.js",
    "js/Civication/capitalEngine.js",
    "js/Civication/capitalMaintenanceEngine.js",
    "js/Civication/identityCore.js",
    "js/Civication/identityCompass.js",
    "js/Civication/identityEngine.js",
    "js/Civication/core/CivicationPsyche.js",
    "js/Civication/civiLifestyle.js",
    "js/Civication/civicationCommercial.js",
    "js/dataHub.js",
    "js/visualDesignCodes.js",
    "js/Civication/ui/CivicationHome.js",
    "js/Civication/ui/CivicationPublicLayer.js",
    "js/Civication/ui/CivicationMapZonesFallback.js",
    "js/Civication/ui/CivicationMapModel.js",
    "js/Civication/ui/CivicationMap.js",
    "js/Civication/ui/CivicationSystemMap.js",
    "js/Civication/ui/CivicationMapZoom.js",
    "js/Civication/ui/CivicationHistoryGoPlaceLayer.js",
    "js/Civication/ui/CivicationOsloMapCalibration.js",
    "js/Civication/ui/CivicationCanvasMap.js",
    "js/Civication/ui/CivicationThreeMap.js",
    "js/Civication/map/CivicationCityMap.js",
    "js/Civication/systems/civicationNPCs.js",
    "js/Civication/systems/civicationEventChannels.js",
    "js/Civication/systems/civicationIncomingFlow.js",
    "js/Civication/ui/CivicationUI.js",
    "js/Civication/ui/CivicationDashboardUI.js",
    "js/Civication/ui/CivicationMiniSectionsUI.js",
    "js/Civication/ui/CivicationInboxTopActionUI.js",
    "js/Civication/ui/CivicationNextActionUI.js",
    "js/Civication/ui/CivicationEmptyPanels.js",
    "js/Civication/systems/civicationDebateEngine.js",
    "js/Civication/ui/CivicationDebateUI.js",
    "js/Civication/ui/CivicationPeopleUI.js",
    "js/Civication/ui/CivicationStoreUI.js",
    "js/Civication/ui/CivicationOnboardingUI.js",
    "js/Civication/systems/day/dayCalendarBridge.js",
    "js/Civication/systems/day/dayProgressionController.js",
    "js/Civication/systems/civicationNextActionSelector.js",
    "js/Civication/systems/civicationDayPlan.js",
    "js/Civication/ui/CivicationDayPhaseUI.js",
    "js/Civication/systems/day/dayHistoryGoContexts.js",
    "js/Civication/systems/civicationPlaceAccessBridge.js",
    "js/Civication/systems/civicationPeopleEngine.js",
    "js/Civication/systems/day/dayCarryover.js",
    "js/Civication/systems/day/dayWeeklyReview.js",
    "js/Civication/systems/day/dayContacts.js",
    "js/Civication/systems/day/dayKnowledge.js",
    "js/Civication/systems/day/dayEvents.js",
    "js/Civication/systems/day/dayPatches.js",
    "js/Civication/systems/civicationMailRuntime.js",
    "js/Civication/systems/civicationCareerOutcomeRuntime.js",
    "js/Civication/ui/CivicationOutcomeStatusUI.js",
    "js/Civication/systems/civicationJobLearningRuntime.js",
    "js/Civication/systems/civicationJobEligibilityRuntime.js",
    "js/Civication/systems/civicationWorkdayRuntime.js",
    "js/Civication/systems/civicationDayFlow.js",
    "js/Civication/systems/civicationProfileSignalBridge.js",
    "js/Civication/systems/civicationPrivatePhaseMailBuilder.js",
    "js/Civication/systems/civicationWorkdayMailBuilder.js",
    "js/Civication/systems/civicationDailyMailBuilder.js",
    "js/Civication/systems/civicationAnswerPrewarm.js",
    "js/Civication/systems/civicationMailPlanDebug.js",
    "js/Civication/ui/CivicationTestModeUI.js",
    "js/Civication/systems/civicationDailyTaskGates.js",
    "js/Civication/systems/civicationBrandJobState.js",
    "js/Civication/ui/CivicationConsequenceFeedback.js",
    "js/Civication/systems/civicationBrandJobProgression.js",
    "js/Civication/ui/CivicationMilestoneHighlight.js",
    "js/Civication/systems/civicationLifeMailRuntime.js",
    "js/Civication/systems/day/dayChoiceDirector.js",
    "js/Civication/systems/day/dayConsequences.js",
    "js/Civication/systems/day/dayConsequencesUI.js",
    "js/Civication/systems/day/dayNarrativeConsequencesUI.js",
    "js/Civication/systems/day/dayNpcReactions.js",
    "js/Civication/systems/day/dayNpcCharacterThreads.js",
    "js/Civication/ui/CivicationPeopleReactionsUI.js",
    "js/Civication/systems/day/dayActiveRoleStateSync.js",
    "js/Civication/systems/day/dayRuntimeDebugPanel.js",
    "js/onboarding/onboardingEngine.js",
    "js/Civication/systems/civicationFriendsEngine.js",
    "js/Civication/systems/civicationRelationshipEngine.js",
    "js/Civication/systems/civicationFriendMessages.js",
    "js/Civication/systems/CivicationSocialConversationEngine.js",
    "js/Civication/systems/CivicationSocialPlaceResolver.js",
    "js/Civication/ui/CivicationCityLayer.js",
    "js/Civication/systems/civicationHistoryGoTaskBridge.js",
    "js/Civication/ui/CivicationHistoryGoDeepLink.js",
    "js/Civication/CivicationShellBoot.js",
    "js/Civication/CivicationDayBoot.js",
    "js/Civication/CivicationBoot.js"
  ];

  /**
   * @returns {boolean}
   * True kun når den eksplisitte «full gammel debug»-bryteren er på
   * (Civication.html?civicationLegacy=1). Styrer BARE de tunge canvas/3D-
   * kartene — ikke om skallet lastes. Skallet lastes uansett.
   */
  function isEnabled() {
    return /** @type {any} */ (globalScope).CIVICATION_LEGACY_ENABLED === true;
  }

  /**
   * @returns {boolean}
   * Skallet skal auto-lastes når shell-DOM-en er til stede. Civication.html
   * har #civiMapWorld; rene Min dag-flater/enhetstester har det ikke og skal
   * ikke dra inn hele skallet.
   */
  function shouldAutoLoadShell() {
    const doc = /** @type {any} */ (globalScope).document;
    return !!doc && typeof doc.getElementById === "function" && !!doc.getElementById("civiMapWorld");
  }

  /**
   * Defensivt: vis eventuelle seksjoner som fortsatt måtte være merket
   * data-civi-legacy. Skallseksjonene i Civication.html er ikke lenger merket
   * slik (de er synlige som standard), så dette er normalt et no-op.
   */
  function revealLegacySections() {
    const doc = /** @type {any} */ (globalScope).document;
    if (!doc) return;
    for (const el of doc.querySelectorAll("[data-civi-legacy]")) {
      el.removeAttribute("hidden");
    }
  }

  /**
   * @param {string} src
   * @returns {Promise<void>}
   */
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const doc = /** @type {any} */ (globalScope).document;
      const el = doc.createElement("script");
      el.src = src;
      el.async = false;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error(`[CivicationShellLoader] kunne ikke laste ${src}`));
      doc.body.appendChild(el);
    });
  }

  /** Laster hele Civication-skallet sekvensielt og vekker CivicationBoot. */
  async function load() {
    console.info("[CivicationShellLoader] laster Civication-skallet (kart, dashboard, paneler, rolle/arbeidsdag).");
    // Tunge canvas/3D-kart er av som standard; kun full gammel debug slår dem på.
    if (isEnabled()) {
      console.warn("[CivicationShellLoader] civicationLegacy=1 — slår på tunge canvas/3D-kart (full gammel debug).");
      Object.assign(globalScope, LEGACY_FLAGS);
    }
    revealLegacySections();
    for (const src of LEGACY_SCRIPTS) {
      await injectScript(src);
    }
    // Skallmodulene (inkl. CivicationBoot) venter på DOMContentLoaded, som
    // allerede har fyrt. Et syntetisk event vekker lytterne deres.
    const doc = /** @type {any} */ (globalScope).document;
    doc.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
    return true;
  }

  const api = { LEGACY_SCRIPTS, LEGACY_FLAGS, isEnabled, shouldAutoLoadShell, load };
  // Skall-loaderen har fått nytt navn, men beholder det gamle globalnavnet for
  // bakoverkompat (sw.js, testene, konsoll).
  /** @type {any} */ (globalScope).CivicationShellLoader = api;
  /** @type {any} */ (globalScope).CivicationLegacyLoader = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  if (typeof window !== "undefined" && shouldAutoLoadShell()) {
    load().catch((error) => console.error("[CivicationShellLoader] skall-lasting feilet", error));
  }
})(typeof window !== "undefined" ? window : globalThis);
