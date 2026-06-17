document.addEventListener("DOMContentLoaded", async () => {
  document.body?.classList.remove("hg-loaded", "hg-load-failed");

  const releaseQueuedToasts = gateToastsUntilAppReady();

  try {
    // Kritiske globale index-runtimescripts. Rekkefølgen er bevisst og eksplisitt:
    // kjernemoduler → kartmotor → lister/venstrepanel, slik at bootCritical
    // og initLeftPanel har det de trenger før de kjøres. js/map.js MÅ være lastet
    // (og MapLibre tilgjengelig via index.html) før bootCritical initialiserer kartet.
    // Progresjonsruntime FØR resten: placeIdAliases før state.js (state.js bruker
    // window.HGPlaceIds til ID-migrering), DomainRegistry + den rene domainRuntime-
    // hjelpefila før state.js, learningLog før
    // bootCritical (som kaller HGLearningLog.migrateLegacy), og state.js før
    // bootCritical (kart/nearby/quiz og miniProfile leser window.visited / visited_places).
    await safeRun("loadPlaceIdAliases", () => loadScriptOnce("js/core/placeIdAliases.js"));
    await safeRun("loadDomainRegistry", () => loadScriptOnce("js/DomainRegistry.js"));
    await safeRun("loadDomainRuntime", () => loadScriptOnce("js/core/domainRuntime.js"));
    await safeRun("assertRuntimeCategoryStorage", assertRuntimeCategoryStorage);
    await safeRun("loadLearningLog", () => loadScriptOnce("js/learningLog.js"));
    await safeRun("loadState", () => loadScriptOnce("js/state/state.js"));

    await safeRun("loadCategories", () => loadScriptOnce("js/core/categories.js"));
    await safeRun("loadGeo", () => loadScriptOnce("js/core/geo.js"));
    await safeRun("loadPos", () => loadScriptOnce("js/core/pos.js"));
    await safeRun("loadDom", () => loadScriptOnce("js/ui/dom.js"));
    await safeRun("loadMap", () => loadScriptOnce("js/map.js"));
    await safeRun("loadAhaMusicBridge", () => loadScriptOnce("js/integrations/aha-music.js"));
    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));

    // persistence.js etter lists.js: saveVisited() kaller renderCollection() (lists.js)
    // og bruker state.js-globalene (personDialogs/peopleCollected/merits). Må være
    // lastet før quiz/app-runtime trenger window.saveVisitedFromQuiz.
    await safeRun("loadPersistence", () => loadScriptOnce("js/state/persistence.js"));

    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));

    // PlaceCard-runtime: kjernen (LayerManager + bottomSheetController) før selve
    // place-card.js, og før MapView/AppRouter lastes – slik at window.openPlaceCard
    // (og collapse/expand-hookene som bruker LayerManager/bottomSheetController)
    // finnes når MapView.openPlace()/AppRouter forsøker å åpne et sted.
    await safeRun("loadLayerManager", () => loadScriptOnce("js/core/layerManager.js"));
    await safeRun("loadBottomSheetController", () => loadScriptOnce("js/core/bottomSheetController.js"));
    await safeRun("loadPopupUtils", () => loadScriptOnce("js/ui/popup-utils.js"));
    await safeRun("loadPlaceCard", () => loadScriptOnce("js/ui/place-card.js"));

    // Stories-runtime: må være lastet før appReady, ellers Fortellinger-rundingen
    // finnes i PlaceCard men åpner tomt/ingenting fordi window.HGStories mangler.
    await safeRun("loadStoriesLoader", () => loadScriptOnce("js/stories/stories_loader.js"));
    await safeRun("loadStoriesUtils", () => loadScriptOnce("js/stories/stories_utils.js"));
    await safeRun("initStories", () => window.HGStories?.init?.());

    // Leksikon-runtime: leksikon_loader.js definerer window.HGLeksikon og patcher
    // window.openPlaceCard, så den må lastes etter place-card.js (som definerer
    // window.openPlaceCard), men før brukeren rekker å åpne/bruke PlaceCard – ellers
    // mangler window.HGLeksikon.openPlace når #pcLeksikonIcon klikkes.
    await safeRun("loadLeksikon", () => loadScriptOnce("js/leksikon/leksikon_loader.js"));

    // Epoke-runtime + tidsresolver + PlaceCard-epoke-UI.
    // epoker-runtime.js bygger window.EPOKER_INDEX og eksponerer
    // window.HGEpokerRuntime.ready; time-resolver.js gir
    // window.HGTimeResolver.resolvePlaceTime; place-card-epoke.js patcher
    // window.openPlaceCard trygt for å vise en epokelinje i #pcMeta. Lastes
    // etter place-card.js (og leksikon) slik at wrapper-patchen finner
    // window.openPlaceCard, og før brukeren rekker å åpne et sted.
    await safeRun("loadEpokerRuntime", () => loadScriptOnce("js/epoker-runtime.js"));
    await safeRun("loadTimeResolver", () => loadScriptOnce("js/time-resolver.js"));
    await safeRun("loadPlaceCardEpoke", () => loadScriptOnce("js/ui/place-card-epoke.js"));

    await safeRun("LayerManager.init", () => window.LayerManager?.init?.());
    await safeRun("bottomSheetController.init", () => window.bottomSheetController?.init?.());

    // DataHub MÅ lastes før boot-fast/bootCritical: boot-fast sin
    // loadPlacesCritical() bruker window.DataHub.loadPlacesBase (manifest/places_index)
    // som datakilde. Uten DataHub faller den tilbake til utdaterte PLACE_FILES_FALLBACK-
    // stier som ikke matcher dagens place-struktur, og window.PLACES ender som [].
    await safeRun("loadDataHub", () => loadScriptOnce("js/dataHub.js"));
    await safeRun("loadPlaceCardQuizcardsPatch", () => loadScriptOnce("js/ui/place-card-quizcards-patch.js"));

    // Disse lastes fra app-entry for å slippe å gjøre index.html mer skjør.
    await safeRun("loadBootFast", () => loadScriptOnce("js/boot-fast.js"));
    await safeRun("loadMapView", () => loadScriptOnce("js/views/MapView.js"));
    await safeRun("loadAppRouter", () => loadScriptOnce("js/router/AppRouter.js"));

    // Critical boot gjør bare index brukbar: kart + places_index + markører.
    // Fallback til gammel boot() beholdes hvis boot-fast.js ikke er lastet.
    await safeRun("bootCritical", window.bootCritical || window.boot);
    await safeRun("loadAhaMusicData", () => window.HGAhaMusic?.load?.());
    await safeRun("wireMapPlacePopupInMapMode", wireMapPlacePopupInMapMode);

    // Profilruntime lastes eksplisitt fra app-entry (samme kanal som resten av
    // index-runtime) så index.html slipper flere <script>-tagger. Rekkefølgen er
    // bevisst: aha.js (AHA-bro) før profileIdentity.js, og profileIdentity.js før
    // mini-profile.js – fordi ProfileIdentity eier #miniName/profilnavnet, mens
    // mini-profile.js bare rendrer statistikk. i18n.js finnes allerede fra index.html.
    await safeRun("loadAhaBridge", () => loadScriptOnce("js/aha.js"));
    await safeRun("loadProfileIdentity", () => loadScriptOnce("js/profileIdentity.js"));
    await safeRun("loadMiniProfile", () => loadScriptOnce("js/ui/mini-profile.js"));

    await safeRun("initMiniProfile", window.initMiniProfile);
    await safeRun("wireMiniProfileLinks", window.wireMiniProfileLinks);
    await safeRun("initLeftPanel", window.initLeftPanel);
    await safeRun("wireBackgroundLeftPanelRerenders", wireBackgroundLeftPanelRerenders);

    // Lett sanity check: ikke marker appen som frisk hvis kritiske index-deler
    // (kartmotor eller venstrepanel) mangler. Feilen skal ikke skjules bak "hg-loaded".
    const runtimeError = assertCriticalIndexRuntime();
    if (runtimeError) throw runtimeError;

    markAppReady();
    releaseQueuedToasts();

    // QuizEngine lastes fra app-entry (samme kanal som resten av index-runtime).
    // Må være tilgjengelig før AppRouter kan route til #/quiz, og før bootBackground
    // kjører QuizEngine.init i boot-fast sin bakgrunnsfase. Kartet er allerede booted
    // (bootCritical), så dette blokkerer ikke kart/nearby.
    // hg_unlocks.js FØR quizzes.js: quizzes.js kaller window.HGUnlocks.recordFromQuiz
    // ved riktig svar, og recordFromQuiz dispatcher updateProfile (miniProfile-refresh).
    await safeRun("loadHGUnlocks", () => loadScriptOnce("js/hg_unlocks.js"));
    await safeRun("loadQuizzes", () => loadScriptOnce("js/quizzes.js"));

    // QuizEngine må bindes til det ekte app-API-et (window.PLACES) FØR routeren
    // kan route til #/quiz; ellers bruker QuizEngine fortsatt default null-API
    // og finner ikke stedet ("Fant verken person eller sted").
    await safeRun("initQuizEngine", () => window.initQuizEngine?.());

    await safeRun("HGAppRouter.start", () => window.HGAppRouter?.start?.());

    // NextUp-footer: HGNavigator (anbefalingsmotoren) før nextUpRuntime (footer-knapp
    // #pcNextUpBtn + #footerNextUpPanel), samme rekkefølge som historisk events_loader.
    // Footeren (.app-footer) finnes allerede i index; nextUpRuntime bygger selv knappen
    // og panelet, så vi lager dem ikke manuelt i index.html.
    runAfterReady("loadNextUpRuntime", async () => {
      await loadScriptOnce("js/hgNavigator.js");
      await loadScriptOnce("js/nextUpRuntime.js");
    });

    // Ikke blokker app-ready på søk/tunge bakgrunnsdata. Ruteruntime må derimot
    // finnes før HGRoutes.init planlegges.
    runAfterReady("loadGlobalSearch", () => loadScriptOnce("js/ui/search.js"));
    await safeRun("loadHistoricalRoutesRuntime", () => loadScriptOnce("js/historical-routes.js"));
    await safeRun("loadRoutesRuntime", () => loadScriptOnce("js/routes.js"));
    runAfterReady("HGRoutes.init", () => window.HGRoutes?.init?.());
    runAfterReady("bootBackground", window.bootBackground);

    if (window.HGPos?.request) {
      runAfterReady("HGPos.request", window.HGPos.request);
    }
  } catch (e) {
    markAppFailed(e);
  }
});

function assertRuntimeCategoryStorage() {
  if (!window.DEBUG) return;

  try {
    const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    if (
      merits &&
      typeof merits === "object" &&
      Object.prototype.hasOwnProperty.call(merits, "popkultur") &&
      Object.prototype.hasOwnProperty.call(merits, "populaerkultur")
    ) {
      console.warn(
        "[domain runtime] merits_by_category contains both popkultur and populaerkultur; " +
        "runtime writes must use populaerkultur. Existing data was not changed."
      );
    }
  } catch (err) {
    console.warn("[domain runtime] could not inspect merits_by_category", err);
  }
}

function assertCriticalIndexRuntime() {
  const missing = [];

  if (typeof window.maplibregl === "undefined") {
    missing.push("maplibregl (MapLibre GL JS) – sjekk <script>/<link> for maplibre-gl i index.html");
  }

  if (typeof window.HGMap !== "object" || !window.HGMap) {
    missing.push("HGMap (js/map.js) – kartmotoren er ikke lastet");
  }

  if (!window.MAP && !window.HGMap?.getMap?.()) {
    missing.push("MAP – kartet ble ikke initialisert (window.HGMap.initMap krever maplibregl)");
  }

  if (typeof window.initLeftPanel !== "function") {
    missing.push("initLeftPanel (js/ui/left-panel.js) – venstrepanelet er ikke lastet");
  }

  // Index-layoutkontrakt: app-shell-modellen som CSS (css/layout.css) og
  // ViewportManager (js/core/viewportManager.js) forventer. Mangler ett av
  // disse lagene, faller det skalerte design-canvaset eller full-bleed-lagene
  // sammen – da skal appen feile synlig, ikke late som den er frisk.
  if (!document.querySelector(".app-shell")) {
    missing.push(".app-shell – det skalerte design-canvaset mangler (ViewportManager.init finner det ikke)");
  }

  if (!document.getElementById("mapLayer")) {
    missing.push("#mapLayer – full-bleed kartlag mangler i DOM");
  }

  if (!document.getElementById("nearbyList")) {
    missing.push("#nearbyList – Nearby-containeren mangler i DOM");
  }

  if (!document.getElementById("placeCard")) {
    missing.push("#placeCard – PlaceCard-laget mangler i DOM");
  }

  if (!document.querySelector(".app-footer")) {
    missing.push(".app-footer – footer-handlingslinjen mangler");
  }

  if (missing.length === 0) return null;

  const error = new Error(
    "Kritiske index-runtimedeler mangler:\n- " + missing.join("\n- ")
  );
  console.error("[index runtime sanity check]", error.message);
  window.__HG_INDEX_RUNTIME_MISSING__ = missing;
  return error;
}
