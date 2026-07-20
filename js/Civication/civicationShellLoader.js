// js/Civication/civicationShellLoader.js
//
// Standard loader for Civication-produktet. Skallet er kart, dashboard,
// kapital, psyke, identitet, hjem/nabolag, offentlig lag, folk, butikk,
// rollepanel, footer/panelnavigasjon og robuste tomtilstander. Dette er IKKE
// legacy. Life Story / «Min dag» lastes som egne script-tags i Civication.html
// og er primærpanelet inne i skallet, ikke hele appen.
//
// Dag-, mail-, arbeidsdag- og innboks-scener lastes som et eget DAY-lag etter
// at skallet er startet. Feil i DAY-laget logges, men skal aldri vise
// «Civication kunne ikke starte» når skallet allerede er oppe.
//
// Rich runtime-kart (Canvas + WebGL/Three) lastes som standard. Det enkle
// SVG-skallkartet beholdes som fallback/test/lite-modus. Debugpaneler er eksplisitte
// og krever Civication.html?civicationLegacy=1.

(function (globalScope) {
  "use strict";

  const RICH_MAP_FLAGS = {
    CIVICATION_CANVAS_MAP_ENABLED: true,
    CIVICATION_THREE_MAP_ENABLED: true
  };

  const LITE_MAP_FLAGS = {
    CIVICATION_CANVAS_MAP_ENABLED: false,
    CIVICATION_THREE_MAP_ENABLED: false
  };

  // Bakoverkompatibelt navn for eldre tester/konsoll. Flagget betyr nå
  // «rich map aktivt», ikke at legacy-modus er på.
  const LEGACY_FLAGS = RICH_MAP_FLAGS;

  /** Produkt-skallet: data/state, kart/SVG, dashboard, kapital, psyke, identitet, hjem, folk, butikk, rollepanel, footer og boot-koordinator. */
  const SHELL_SCRIPTS = [
    "js/Civication/systems/civicationStorageTrace.js",
    "js/Civication/core/civicationState.js",
    "js/Civication/core/CivicationTravelState.js",
    "js/Civication/systems/civicationRoleSession.js",
    "js/Civication/systems/civicationActivePositionRecovery.js",
    "js/Civication/systems/civicationRoleStarter.js",
    "js/Civication/tiersCivi.js",
    "js/Civication/core/civicationJobs.js",
    "js/brands/brands_loader.js",
    "js/Civication/systems/civicationCareerRoleResolver.js",
    "js/Civication/systems/civicationRolePackDepth.js",
    "js/Civication/systems/civicationBrandAccess.js",
    "js/Civication/systems/civicationBrandEmployerBridge.js",
    "js/Civication/merits-and-jobs.js",
    "js/Civication/core/civicationCalendar.js",
    "js/Civication/core/civicationTaskEngine.js",
    "js/Civication/core/civicationEconomyEngine.js",
    "js/Civication/utils/storyResolver.js",
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
    "js/Civication/map/CivicationCityMap.js",
    "js/Civication/systems/civicationNPCs.js",
    "js/Civication/systems/civicationEventChannels.js",
    "js/Civication/ui/CivicationUI.js",
    "js/Civication/ui/CivicationDashboardUI.js",
    "js/Civication/ui/CivicationMiniSectionsUI.js",
    "js/Civication/ui/CivicationEmptyPanels.js",
    "js/Civication/systems/civicationDebateEngine.js",
    "js/Civication/ui/CivicationDebateUI.js",
    "js/Civication/ui/CivicationPeopleUI.js",
    "js/Civication/ui/CivicationStoreUI.js",
    "js/Civication/ui/CivicationOnboardingUI.js",
    "js/Civication/systems/civicationPlaceAccessBridge.js",
    "js/Civication/systems/civicationHistoryPeopleBridge.js",
    "js/Civication/systems/civicationPeopleEngine.js",
    "js/Civication/systems/civicationProfileSignalBridge.js",
    "js/Civication/systems/civicationAnswerPrewarm.js",
    "js/Civication/systems/civicationDailyTaskGates.js",
    "js/Civication/systems/civicationBrandJobState.js",
    "js/Civication/systems/civicationBrandJobProgression.js",
    "js/onboarding/onboardingEngine.js",
    "js/Civication/systems/civicationFriendsEngine.js",
    "js/Civication/systems/civicationRelationshipEngine.js",
    "js/Civication/systems/civicationFriendMessages.js",
    "js/Civication/systems/CivicationSocialConversationEngine.js",
    "js/Civication/systems/CivicationSocialPlaceResolver.js",
    "js/Civication/systems/civicationHistoryFigures.js",
    "js/Civication/ui/CivicationCityLayer.js",
    "js/Civication/ui/CivicationLifestoryPlaceMarker.js",
    "js/Civication/systems/civicationHistoryGoTaskBridge.js",
    "js/Civication/ui/CivicationHistoryGoDeepLink.js",
    "js/Civication/CivicationShellBoot.js",
    "js/Civication/CivicationBoot.js"
  ];

  /** Daglaget: event engine, mail-runtime, day progression, workday-runtime, obligationer, next-action/inbox-scener og role-model-runtime. */
  const DAY_SCRIPTS = [
    "js/Civication/systems/civicationMailEngine.js",
    "js/Civication/systems/civicationBlockedJobMessages.js",
    "js/Civication/roleStoryletBridge.js",
    "js/Civication/mailPlanBridge.js",
    "js/Civication/civicationObligationEngine.js",
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
    "js/Civication/systems/civicationIncomingFlow.js",
    "js/Civication/ui/CivicationInboxTopActionUI.js",
    "js/Civication/ui/CivicationNextActionUI.js",
    "js/Civication/systems/day/dayCalendarBridge.js",
    "js/Civication/systems/day/dayProgressionController.js",
    "js/Civication/systems/civicationNextActionSelector.js",
    "js/Civication/systems/civicationDayPlan.js",
    "js/Civication/systems/day/dayHistoryGoContexts.js",
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
    "js/Civication/systems/civicationPrivatePhaseMailBuilder.js",
    "js/Civication/systems/civicationWorkdayMailBuilder.js",
    "js/Civication/systems/civicationDailyMailBuilder.js",
    "js/Civication/ui/CivicationTestModeUI.js",
    "js/Civication/ui/CivicationConsequenceFeedback.js",
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
    "js/Civication/CivicationDayBoot.js"
  ];

  /** Rich runtime-kartet: Canvas først, Three/WebGL overtar når det er trygt. */
  const RICH_MAP_SCRIPTS = [
    "js/Civication/ui/CivicationOsloMapCalibration.js",
    "js/Civication/ui/CivicationCanvasMap.js",
    "js/Civication/ui/CivicationThreeMap.js"
  ];

  /** Eksplisitt legacy/debug: historiske debugpaneler, ikke nødvendig for rich map. */
  const LEGACY_DEBUG_SCRIPTS = [
    "js/Civication/ui/CivicationDayPhaseUI.js",
    "js/Civication/systems/civicationMailPlanDebug.js",
    "js/Civication/systems/day/dayRuntimeDebugPanel.js"
  ];

  // Bakoverkompatibel komplett liste i historisk rekkefølge for eldre tester/konsoll.
  // Standard load bruker fortsatt de tre adskilte listene under, ikke én blind legacy-kjede.
  const LEGACY_SCRIPTS = [
    "js/Civication/systems/civicationStorageTrace.js",
    "js/Civication/core/civicationState.js",
    "js/Civication/core/CivicationTravelState.js",
    "js/Civication/systems/civicationMailEngine.js",
    "js/Civication/systems/civicationRoleSession.js",
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
    "js/Civication/systems/civicationHistoryPeopleBridge.js",
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
    "js/Civication/systems/civicationHistoryFigures.js",
    "js/Civication/ui/CivicationCityLayer.js",
    "js/Civication/systems/civicationHistoryGoTaskBridge.js",
    "js/Civication/ui/CivicationHistoryGoDeepLink.js",
    "js/Civication/CivicationShellBoot.js",
    "js/Civication/CivicationDayBoot.js",
    "js/Civication/CivicationBoot.js"
  ];


  function queryFlagEnabled(name) {
    try {
      const params = new URLSearchParams(String((/** @type {any} */ (globalScope).location?.search) || ""));
      const raw = params.get(name);
      return raw === "1" || raw === "true";
    } catch {
      return false;
    }
  }

  function isExplicitLiteMode() {
    return queryFlagEnabled("civicationLite") || /** @type {any} */ (globalScope).CIVICATION_LITE_MAP_ENABLED === true;
  }

  function isTestOrMockedRuntime() {
    const g = /** @type {any} */ (globalScope);
    const nav = g.navigator || {};
    return g.CIVICATION_TEST_MODE === true ||
      g.PLAYWRIGHT_TEST === true ||
      g.__playwright === true ||
      g.__pwInitScripts === true ||
      nav.webdriver === true ||
      (typeof process !== "undefined" && !!process.env && (process.env.PLAYWRIGHT_TEST || process.env.NODE_ENV === "test"));
  }

  function isCanvasDisabledForSafeRuntime() {
    const g = /** @type {any} */ (globalScope);
    // __ECHO_DISABLE_CANVAS_MAP__ is a test/mock escape hatch. Ignore it for
    // normal production/runtime so users are not downgraded by stale globals.
    return g.__ECHO_DISABLE_CANVAS_MAP__ === true && isTestOrMockedRuntime();
  }

  function shouldLoadRichMap() {
    return !isExplicitLiteMode() && !isCanvasDisabledForSafeRuntime();
  }

  function isEnabled() {
    return /** @type {any} */ (globalScope).CIVICATION_LEGACY_ENABLED === true;
  }

  function shouldAutoLoadShell() {
    const doc = /** @type {any} */ (globalScope).document;
    return !!doc && typeof doc.getElementById === "function" && !!doc.getElementById("civiMapWorld");
  }

  function revealLegacySections() {
    const doc = /** @type {any} */ (globalScope).document;
    if (!doc) return;
    for (const el of doc.querySelectorAll("[data-civi-legacy]")) el.removeAttribute("hidden");
  }

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

  async function loadScripts(scripts) {
    for (const src of scripts) await injectScript(src);
  }

  function wakeBootListeners() {
    const doc = /** @type {any} */ (globalScope).document;
    doc.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
  }

  async function startDayLayer() {
    try {
      await loadScripts(DAY_SCRIPTS);
      await (/** @type {any} */ (globalScope).CivicationDayBoot)?.start?.();
    } catch (error) {
      console.error("[CivicationShellLoader] day/mail-laget feilet (skallet er upåvirket)", error);
    }
  }

  async function load() {
    console.info("[CivicationShellLoader] laster Civication-skallet (kart, dashboard, paneler, Min dag-ramme).");
    revealLegacySections();
    const richMap = shouldLoadRichMap();
    Object.assign(globalScope, richMap ? RICH_MAP_FLAGS : LITE_MAP_FLAGS);
    await loadScripts(SHELL_SCRIPTS);
    if (richMap) {
      try {
        await loadScripts(RICH_MAP_SCRIPTS);
      } catch (error) {
        console.warn("[CivicationShellLoader] rich map feilet — beholder lett SVG-skallkart", error);
        Object.assign(globalScope, LITE_MAP_FLAGS);
        try { /** @type {any} */ (globalScope).CivicationMap?.render?.(); } catch (_) { /* fallback best effort */ }
      }
    }
    wakeBootListeners();

    if (isEnabled()) {
      console.warn("[CivicationShellLoader] civicationLegacy=1 — slår på legacy/debug-paneler (rich map er allerede standard).");
      try {
        await loadScripts(LEGACY_DEBUG_SCRIPTS);
      } catch (error) {
        console.error("[CivicationShellLoader] legacy/debug-laget feilet (skallet er upåvirket)", error);
      }
    }

    await startDayLayer();
    return true;
  }

  const api = {
    SHELL_SCRIPTS,
    DAY_SCRIPTS,
    RICH_MAP_SCRIPTS,
    LEGACY_DEBUG_SCRIPTS,
    LEGACY_SCRIPTS,
    RICH_MAP_FLAGS,
    LITE_MAP_FLAGS,
    LEGACY_FLAGS,
    isExplicitLiteMode,
    isTestOrMockedRuntime,
    isCanvasDisabledForSafeRuntime,
    shouldLoadRichMap,
    isEnabled,
    shouldAutoLoadShell,
    load
  };

  /** @type {any} */ (globalScope).CivicationShellLoader = api;
  // Kompatibilitetsalias: gammelt navn betyr ikke at produkt-skallet er legacy.
  /** @type {any} */ (globalScope).CivicationLegacyLoader = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  if (typeof window !== "undefined" && shouldAutoLoadShell()) {
    load().catch((error) => console.error("[CivicationShellLoader] skall-lasting feilet", error));
  }
})(typeof window !== "undefined" ? window : globalThis);
