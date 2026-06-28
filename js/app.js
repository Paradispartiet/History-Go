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
    await safeRun("loadRuntimeHealth", () => loadScriptOnce("js/debug/HGRuntimeHealth.js"));
    await safeRun("loadRuntimeSmokeRunner", () => loadScriptOnce("js/debug/HGRuntimeSmokeRunner.js"));
    await safeRun("loadHGSocialSurfaceContract", () => loadScriptOnce("js/social/HGSocialSurfaceContract.js"));
    await safeRun("loadHGPublicProfileReadModel", () => loadScriptOnce("js/social/HGPublicProfileReadModel.js"));
    await safeRun("loadHGSocialSignals", () => loadScriptOnce("js/social/HGSocialSignals.js"));
    await safeRun("loadHGSocialSignalBridge", () => loadScriptOnce("js/social/HGSocialSignalBridge.js"));
    await safeRun("loadHGSocialDemo", () => loadScriptOnce("js/social/HGSocialDemo.js"));
    await safeRun("loadHGSocialDemoAdapter", () => loadScriptOnce("js/social/HGSocialDemoAdapter.js"));
    await safeRun("loadHGSocialDemoProfile", () => loadScriptOnce("js/social/HGSocialDemoProfile.js"));
    await safeRun("loadHGSocialDemoPanel", () => loadScriptOnce("js/social/HGSocialDemoPanel.js"));
    await safeRun("loadHGSocialMatchGraph", () => loadScriptOnce("js/social/HGSocialMatchGraph.js"));
    await safeRun("loadHGSpotmeeting", () => loadScriptOnce("js/social/HGSpotmeeting.js"));
    await safeRun("loadHGSpotmeetingPlaceCardDemo", () => loadScriptOnce("js/social/HGSpotmeetingPlaceCardDemo.js"));
    await safeRun("loadHGSocialMatchGraphPanel", () => loadScriptOnce("js/social/HGSocialMatchGraphPanel.js"));
    await safeRun("loadHGPublicProfilePreviewPanel", () => loadScriptOnce("js/social/HGPublicProfilePreviewPanel.js"));
    await safeRun("loadHGTodayActionRouter", () => loadScriptOnce("js/today/HGTodayActionRouter.js"));
    await safeRun("loadHGDailyObjectives", () => loadScriptOnce("js/objectives/HGDailyObjectives.js"));
    await safeRun("loadHGDailyProgressToast", () => loadScriptOnce("js/progress/HGDailyProgressToast.js"));
    await safeRun("loadHGDailyProgress", () => loadScriptOnce("js/progress/HGDailyProgress.js"));
    await safeRun("bindHGDailyProgress", () => window.HG_DailyProgress?.bind?.());
    await safeRun("loadHGTodayHub", () => loadScriptOnce("js/today/HGTodayHub.js"));
    await safeRun("loadHGTodayHubPanel", () => loadScriptOnce("js/today/HGTodayHubPanel.js"));
    await safeRun("loadRuntimeHealthPanel", () => loadScriptOnce("js/debug/HGRuntimeHealthPanel.js"));
    await safeRun("renderRuntimeHealthPanel", () => window.HG_RuntimeHealthPanel?.render?.());
    await safeRun("loadState", () => loadScriptOnce("js/state/state.js"));

    await safeRun("loadCategories", () => loadScriptOnce("js/core/categories.js"));
    await safeRun("loadGeo", () => loadScriptOnce("js/core/geo.js"));
    await safeRun("loadPos", () => loadScriptOnce("js/core/pos.js"));
    await safeRun("loadDom", () => loadScriptOnce("js/ui/dom.js"));
    await safeRun("loadToast", () => loadScriptOnce("js/ui/toast.js"));
    await safeRun("loadNatureUnlockToast", () => loadScriptOnce("js/ui/nature-unlock-toast.js"));
    await safeRun("loadPersonPlaceUnlockToast", () => loadScriptOnce("js/ui/person-place-unlock-toast.js"));
    await safeRun("loadBadgeUnlockToast", () => loadScriptOnce("js/ui/badge-unlock-toast.js"));
    await safeRun("loadMap", () => loadScriptOnce("js/map.js"));
    await safeRun("loadAhaMusicBridge", () => loadScriptOnce("js/integrations/aha-music.js"));
    await safeRun("loadLists", () => loadScriptOnce("js/ui/lists.js"));

    // persistence.js etter lists.js: saveVisited() kaller renderCollection() (lists.js)
    // og bruker state.js-globalene (personDialogs/peopleCollected/merits). Må være
    // lastet før quiz/app-runtime trenger window.saveVisitedFromQuiz.
    await safeRun("loadPersistence", () => loadScriptOnce("js/state/persistence.js"));
    await safeRun("loadFavorites", () => loadScriptOnce("js/state/favorites.js"));

    await safeRun("loadLeftPanel", () => loadScriptOnce("js/ui/left-panel.js"));

    // PlaceCard-runtime: kjernen (LayerManager + bottomSheetController) før selve
    // place-card.js, og før MapView/AppRouter lastes – slik at window.openPlaceCard
    // (og collapse/expand-hookene som bruker LayerManager/bottomSheetController)
    // finnes når MapView.openPlace()/AppRouter forsøker å åpne et sted.
    await safeRun("loadLayerManager", () => loadScriptOnce("js/core/layerManager.js"));
    await safeRun("loadBottomSheetController", () => loadScriptOnce("js/core/bottomSheetController.js"));
    await safeRun("loadPopupUtils", () => loadScriptOnce("js/ui/popup-utils.js"));
    await safeRun("loadPlaceCard", () => loadScriptOnce("js/ui/place-card.js"));

    // Leksikon-runtime: leksikon_loader.js definerer window.HGLeksikon og patcher
    // window.openPlaceCard, så den må lastes etter place-card.js (som definerer
    // window.openPlaceCard), men før brukeren rekker å åpne/bruke PlaceCard – ellers
    // mangler window.HGLeksikon.openPlace når #pcLeksikonIcon klikkes.
    await safeRun("loadLeksikon", () => loadScriptOnce("js/leksikon/leksikon_loader.js"));

    // Debatt-runtime: debates_loader.js definerer window.HGDebatesContent og patcher
    // window.openPlaceCard (Debatter her-knapp). Lastes etter place-card.js, og før
    // AppRouter kan route til #/debate.
    await safeRun("loadDebates", () => loadScriptOnce("js/debates/debates_loader.js"));

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

    // Europakaravanen-runtime: laster data/karavaner uten UI-sideeffekter og
    // eksponerer window.HG_CARAVAN + debug-helper. Kjøres best effort slik at
    // appen fortsatt starter hvis karavane-filene ikke finnes i en deploy.
    await safeRun("loadCaravanRuntime", () => loadScriptOnce("js/caravan-loader.js"));
    await safeRun("loadCaravanData", () => window.HGCaravanLoader?.load?.({ cache: "no-store" }));
    await safeRun("loadCaravanPanel", () => loadScriptOnce("js/ui/caravan-panel.js"));

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
    await safeRun("loadHGDebates", () => loadScriptOnce("js/hgDebates.js"));
    await safeRun("loadHGReads", () => loadScriptOnce("js/hgReads.js"));
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

async function safeRun(label, fn) {
  if (typeof fn !== "function") return undefined;

  try {
    return await fn();
  } catch (e) {
    console.error(`[${label}]`, e);
    window.__HG_LAST_ERROR__ = {
      label,
      message: String(e?.message || e),
      stack: e?.stack || null
    };
    throw e;
  }
}

function loadScriptOnce(src) {
  const url = String(src || "").trim();
  if (!url) return Promise.reject(new Error("Missing script src"));

  window.__HG_SCRIPT_PROMISES__ = window.__HG_SCRIPT_PROMISES__ || Object.create(null);
  if (window.__HG_SCRIPT_PROMISES__[url]) return window.__HG_SCRIPT_PROMISES__[url];

  window.__HG_SCRIPT_PROMISES__[url] = new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts || []).find(script => {
      const attr = script.getAttribute("src") || "";
      if (!attr) return false;
      try {
        return new URL(attr, document.baseURI).href === new URL(url, document.baseURI).href;
      } catch {
        return attr === url;
      }
    });

    if (existing) {
      if (existing.dataset.hgLoaded === "1") {
        resolve(existing);
        return;
      }
      existing.addEventListener("load", () => resolve(existing), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Kunne ikke laste script: ${url}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.defer = true;
    script.onload = () => {
      script.dataset.hgLoaded = "1";
      resolve(script);
    };
    script.onerror = () => reject(new Error(`Kunne ikke laste script: ${url}`));
    document.head.appendChild(script);
  });

  return window.__HG_SCRIPT_PROMISES__[url];
}

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

function markAppReady() {
  document.body?.classList.remove("hg-load-failed");
  document.body?.classList.add("hg-loaded");
  window.__HG_APP_READY__ = true;

  try {
    window.dispatchEvent(new CustomEvent("hg:appReady", {
      detail: { ready: true, ts: Date.now() }
    }));
  } catch {}
}

function markAppFailed(error) {
  console.error("[app startup failed]", error);

  window.__HG_APP_READY__ = false;
  window.__HG_APP_LOAD_ERROR__ = {
    message: String(error?.message || error),
    stack: error?.stack || null
  };

  document.body?.classList.add("hg-load-failed");
}

function gateToastsUntilAppReady() {
  const originalShowToast = window.showToast;
  const queue = [];
  let released = false;

  if (typeof originalShowToast !== "function") {
    return () => {};
  }

  window.showToast = function gatedShowToast(message, ...args) {
    if (released) {
      return originalShowToast.call(this, message, ...args);
    }

    queue.push({ message, args });
    return undefined;
  };

  return function releaseQueuedToasts() {
    released = true;
    window.showToast = originalShowToast;

    while (queue.length) {
      const item = queue.shift();
      originalShowToast.call(window, item.message, ...item.args);
    }
  };
}

function runAfterReady(label, task) {
  if (typeof task !== "function") return;

  const runner = () => {
    Promise.resolve()
      .then(task)
      .catch(err => console.warn(`[${label}]`, err));
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(runner, { timeout: 1200 });
  } else {
    setTimeout(runner, 0);
  }
}

function wireBackgroundLeftPanelRerenders() {
  if (window.__HG_BACKGROUND_LEFT_PANEL_RERENDERS_WIRED__) return;
  window.__HG_BACKGROUND_LEFT_PANEL_RERENDERS_WIRED__ = true;

  const rerender = () => {
    try {
      if (typeof window.rerenderActiveLeftPanelMode === "function") {
        window.rerenderActiveLeftPanelMode();
      } else {
        window.renderNearbyPlaces?.();
      }
      window.renderCollection?.();
      window.initLeftPanel?.();
    } catch (err) {
      console.warn("[wireBackgroundLeftPanelRerenders]", err);
    }
  };

  window.addEventListener("hg:placesUpdated", rerender);
  window.addEventListener("hg:visitedUpdated", rerender);
  window.addEventListener("storage", (event) => {
    if (event.key === "visited_places" || event.key === "visited") rerender();
  });
}

function wireMapPlacePopupInMapMode() {
  if (window.__HG_MAP_PLACE_POPUP_WIRED__) return;
  window.__HG_MAP_PLACE_POPUP_WIRED__ = true;

  window.addEventListener("hg:place-selected", async (event) => {
    const selectedEvent = /** @type {CustomEvent<{ place?: unknown }>} */ (event);
    const place = selectedEvent?.detail?.place;
    if (!place) return;

    const routerMode = String(window.HGAppRouter?.currentMode || "").toLowerCase();
    const hash = String(window.location.hash || "").toLowerCase();
    const isMapMode = routerMode === "map" || hash === "#/map" || hash === "#map" || hash === "";
    if (!isMapMode) return;

    if (typeof window.openPlaceCard === "function") {
      await window.openPlaceCard(place);
    }
  });
}
