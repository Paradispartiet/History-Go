// js/Civication/systems/civicationSocialSceneSource.js
// 4G-D: samler Civications sosiale møtekandidater bak det eksisterende
// CivicationSceneCatalog-registeret uten å endre møteutvalg, kartflyt eller
// private meldinger. FriendsEngine beholder sitt offentlige API som en
// kompatibilitetsfasade; selve produsenten fanges én gang og eies av adapteren.
(function () {
  "use strict";

  if (window.CivicationSocialSceneSource) return;

  const SCENE_SOURCE_ADAPTER_NAME = "social";
  const SCENE_SOURCE_FORMAT = "civication_social_encounter_v1";
  const SCENE_SOURCE_VERSION = 1;
  const SCENE_CATALOG_VERSION = 1;
  const SCENE_SOURCE_ADAPTER_QUEUE_KEY = "__civicationSceneSourceAdapterQueue";

  const friendsEngine = window.CivicationFriendsEngine;
  if (!friendsEngine || typeof friendsEngine.getSocialEncountersForLocation !== "function") {
    if (window.DEBUG) console.warn("[CivicationSocialSceneSource] CivicationFriendsEngine mangler");
    return;
  }

  // Fang den eksisterende, deterministiske produsenten før den offentlige
  // FriendsEngine-metoden blir fasade. Adapteren er dermed eneste kallvei til
  // den gamle producer-logikken etter cutoveren.
  const rawGetSocialEncountersForLocation = friendsEngine.getSocialEncountersForLocation;

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function decorateSocialEncounter(encounter) {
    return {
      ...encounter,
      scene_source_adapter: SCENE_SOURCE_ADAPTER_NAME,
      scene_source_format: SCENE_SOURCE_FORMAT,
      scene_catalog_owner: "CivicationSceneCatalog",
      scene_catalog_version: SCENE_CATALOG_VERSION
    };
  }

  const sourceAdapter = {
    name: SCENE_SOURCE_ADAPTER_NAME,
    source_format: SCENE_SOURCE_FORMAT,
    version: SCENE_SOURCE_VERSION,
    getScenes(context = {}) {
      const phase = norm(context.phase || context.phaseId);
      const locationId = norm(context.locationId);
      const options = context.options && typeof context.options === "object"
        ? context.options
        : (context.opts && typeof context.opts === "object" ? context.opts : {});
      const result = rawGetSocialEncountersForLocation.call(friendsEngine, phase, locationId, options);
      const scenes = Array.isArray(result) ? result : (result ? [result] : []);
      return scenes
        .filter((scene) => scene && typeof scene === "object")
        .map(decorateSocialEncounter);
    }
  };

  function registerSceneSourceAdapter() {
    const catalog = window.CivicationSceneCatalog;
    if (typeof catalog?.registerSourceAdapter === "function") {
      return catalog.registerSourceAdapter(SCENE_SOURCE_ADAPTER_NAME, sourceAdapter);
    }

    // Alternativ/test-loader kan laste kilden før Catalog. Registrer i den
    // samme deferred-køen som Private/Life; ingen egen registry opprettes.
    const runtimeWindow = /** @type {Window & typeof globalThis & { __civicationSceneSourceAdapterQueue?: Array<{ name?: string, adapter?: any }> }} */ (window);
    const queue = Array.isArray(runtimeWindow[SCENE_SOURCE_ADAPTER_QUEUE_KEY])
      ? runtimeWindow[SCENE_SOURCE_ADAPTER_QUEUE_KEY]
      : [];
    if (!queue.some((entry) => entry?.name === SCENE_SOURCE_ADAPTER_NAME && entry?.adapter === sourceAdapter)) {
      queue.push({ name: SCENE_SOURCE_ADAPTER_NAME, adapter: sourceAdapter });
    }
    runtimeWindow[SCENE_SOURCE_ADAPTER_QUEUE_KEY] = queue;
    return true;
  }

  function getRegisteredAdapter() {
    const catalog = window.CivicationSceneCatalog;
    if (typeof catalog?.getSourceAdapter !== "function") return null;
    const registered = catalog.getSourceAdapter(SCENE_SOURCE_ADAPTER_NAME);
    return registered === sourceAdapter ? registered : null;
  }

  // Synkron kompatibilitetsfasade for kartlaget. Standard loader har allerede
  // opprettet SceneCatalog når denne modulen lastes. Mangler Catalog/registrering
  // feiler vi lukket i stedet for å kalle den rå produsenten utenom eierlaget.
  function getSocialEncountersForLocation(phase, locationId, opts) {
    const adapter = getRegisteredAdapter();
    if (!adapter) return [];
    const result = adapter.getScenes({
      phase,
      locationId,
      options: opts && typeof opts === "object" ? opts : {},
      consumer: "CivicationFriendsEngine"
    });
    // Social-kart-API-et er synkront. En adapter som plutselig blir async er et
    // kontraktbrudd; ikke la et Promise lekke inn i kart/UI.
    if (result && typeof result.then === "function") return [];
    return Array.isArray(result) ? result : (result ? [result] : []);
  }

  function canApproachFriendAtLocation(friendId, phase, locationId, opts) {
    const fid = norm(friendId);
    if (!fid) return false;
    return getSocialEncountersForLocation(phase, locationId, opts)
      .some((encounter) => norm(encounter?.friendId) === fid);
  }

  function installFriendsEngineFacade() {
    friendsEngine.getSocialEncountersForLocation = getSocialEncountersForLocation;
    friendsEngine.canApproachFriendAtLocation = canApproachFriendAtLocation;
    return true;
  }

  function inspect() {
    const catalog = window.CivicationSceneCatalog;
    const registered = getRegisteredAdapter();
    return {
      adapter_name: SCENE_SOURCE_ADAPTER_NAME,
      source_format: SCENE_SOURCE_FORMAT,
      version: SCENE_SOURCE_VERSION,
      registered: registered === sourceAdapter,
      catalog_owner: registered ? "CivicationSceneCatalog" : null,
      compiled_registry_ready: catalog?.inspect?.().compiled_registry_ready === true,
      friends_engine_facade_installed:
        friendsEngine.getSocialEncountersForLocation === getSocialEncountersForLocation &&
        friendsEngine.canApproachFriendAtLocation === canApproachFriendAtLocation
    };
  }

  window.CivicationSocialSceneSource = {
    SCENE_SOURCE_ADAPTER_NAME,
    SCENE_SOURCE_FORMAT,
    SCENE_SOURCE_VERSION,
    sourceAdapter,
    registerSceneSourceAdapter,
    getSocialEncountersForLocation,
    canApproachFriendAtLocation,
    inspect
  };

  registerSceneSourceAdapter();
  installFriendsEngineFacade();

  // CityLayer kan ha rendret første shell-frame før DAY-laget ble lastet.
  // Re-render etter cutover slik at sosiale møter vises fra Catalog-adapteren.
  try { window.CivicationCityLayer?.scheduleRender?.(); } catch (_) { /* best effort */ }
})();
