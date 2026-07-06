// js/Civication/civicationLegacyLoader.js
//
// Civication v1 (legacy) — lasteren.
// Hele det gamle Civication-maskineriet (mailmotorer, next-action, workday-
// runtime, day progression, kart, dashboards, CivicationBoot) er tatt UT av
// Civication.html og ligger nå kun som denne listen. Ingenting av det lastes
// med mindre CIVICATION_LEGACY_ENABLED === true (satt av civicationV2Config).
//
// Rekkefølgen under er identisk med den gamle <script>-rekkefølgen i
// Civication.html — den er en lastekontrakt, ikke en anbefaling. Ikke
// resorter, ikke legg til nye motorer. Nye fortellinger bygges som data i
// data/Civication/lifestory/, aldri her.
//
// Filene ligger fortsatt på sine gamle stier (js/Civication/systems, ui, …)
// fordi profile.html og Node-testene fortsatt bruker dem direkte. Flytting/
// sletting er et senere ryddesteg; denne gaten er steg 1 og 2.

(function (globalScope) {
  "use strict";

  /** Inline-flagg som i gamle Civication.html sto som egne script-tags. */
  const LEGACY_FLAGS = {
    CIVICATION_CANVAS_MAP_ENABLED: true,
    CIVICATION_THREE_MAP_ENABLED: true
  };

  /** Gammel lastekontrakt — samme rekkefølge som før ryddingen. */
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
    "js/Civication/CivicationBoot.js"
  ];

  /** @returns {boolean} */
  function isEnabled() {
    return /** @type {any} */ (globalScope).CIVICATION_LEGACY_ENABLED === true;
  }

  /** Vis seksjonene som er merket som legacy i Civication.html. */
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
      el.onerror = () => reject(new Error(`[CivicationLegacyLoader] kunne ikke laste ${src}`));
      doc.body.appendChild(el);
    });
  }

  /** Laster hele v1-kjeden sekvensielt og vekker CivicationBoot. */
  async function load() {
    if (!isEnabled()) return false;
    console.warn("[CivicationLegacyLoader] CIVICATION_LEGACY_ENABLED=true — laster Civication v1 (legacy).");
    Object.assign(globalScope, LEGACY_FLAGS);
    revealLegacySections();
    for (const src of LEGACY_SCRIPTS) {
      await injectScript(src);
    }
    // Legacy-modulene (inkl. CivicationBoot) venter på DOMContentLoaded, som
    // allerede har fyrt. Et syntetisk event vekker lytterne deres.
    const doc = /** @type {any} */ (globalScope).document;
    doc.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
    return true;
  }

  const api = { LEGACY_SCRIPTS, LEGACY_FLAGS, isEnabled, load };
  /** @type {any} */ (globalScope).CivicationLegacyLoader = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  if (typeof window !== "undefined" && isEnabled()) {
    load().catch((error) => console.error("[CivicationLegacyLoader] legacy-lasting feilet", error));
  }
})(typeof window !== "undefined" ? window : globalThis);
