// js/Civication/map/CivicationCityMap.js
//
// Read-model for HELE Civication-bykartet: laster og fletter alle per-place
// mappingfilene (data/Civication/map/historyGoPlaceMapping.<kategori>.json) til
// ETT oppslag som resten av Civication-runtime kan bruke for å svare på
// "hva er dette History Go-stedet på Civication-kartet?".
//
// Dette er lag OVER loaderen (loadCivicationCityMapEntries.js): der loaderen tar
// én kategori av gangen, samler denne modulen alle 26 kildene som er registrert i
// oversiktsfilen historyGoPlaceMapping.json (feltet perPlaceMappingFile), slår
// dem sammen, kobler på byggtypen (buildingTypes.json) og indekserer på både
// historyGoPlaceId og civicationPlaceId.
//
// Disiplin (samme som loaderen):
//   - auto-kjører IKKE og fetcher ingenting ved load
//   - rører ikke DOM
//   - eksponerer rene funksjoner + en memoisert load() via window.CivicationCityMap
//
// Runtime-robusthet framfor strenghet: filene er allerede CI-validert av
// audit-scriptene, så merge her KASTER ikke på en enkelt ugyldig post – den
// hopper over den og teller den i diagnostics. Et ødelagt kartlag skal degradere,
// ikke blanke ut hele kartet.

(function (globalScope) {
  "use strict";

  var OVERVIEW_PATH = "data/Civication/map/historyGoPlaceMapping.json";
  var BUILDING_TYPES_PATH = "data/Civication/map/buildingTypes.json";

  // ---------------------------------------------------------------------------
  // Rene hjelpere
  // ---------------------------------------------------------------------------
  function isNonEmptyString(v) {
    return typeof v === "string" && v.length > 0;
  }

  // Trekk ut buildingTypes indeksert på id. Støtter samme former som
  // audit-/loader-lagene: { buildingTypes: { <id>: {...} } }, array, eller flat.
  function indexBuildingTypes(buildingTypesData) {
    var byId = new Map();
    var data = buildingTypesData || {};
    var root = data && data.buildingTypes != null ? data.buildingTypes : buildingTypesData;
    if (Array.isArray(root)) {
      for (var i = 0; i < root.length; i += 1) {
        var item = root[i];
        if (item && isNonEmptyString(item.id)) byId.set(item.id, item);
      }
      return byId;
    }
    if (root && typeof root === "object") {
      var keys = Object.keys(root);
      for (var k = 0; k < keys.length; k += 1) {
        var key = keys[k];
        var value = root[key];
        if (value && typeof value === "object") {
          byId.set(isNonEmptyString(value.id) ? value.id : key, value);
        }
      }
    }
    return byId;
  }

  // Trekk ut de distinkte perPlaceMappingFile-stiene fra oversiktsfilen, i
  // stabil rekkefølge. Poster uten sti (ennå ikke per-place-mappet) hoppes over.
  function perPlaceMappingFilesFromOverview(overviewData) {
    var files = [];
    var seen = new Set();
    var sfm = overviewData && overviewData.sourceFileMappings;
    if (!sfm || typeof sfm !== "object") return files;
    var keys = Object.keys(sfm);
    for (var i = 0; i < keys.length; i += 1) {
      var entry = sfm[keys[i]];
      var file = entry && entry.perPlaceMappingFile;
      if (isNonEmptyString(file) && !seen.has(file)) {
        seen.add(file);
        files.push(file);
      }
    }
    return files;
  }

  // Normaliser én rå mapping-post til en city-map-oppføring. Returnerer null hvis
  // posten mangler obligatoriske identifikatorer (da kan den ikke indekseres).
  function normalizeEntry(raw, buildingTypesById) {
    if (!raw || typeof raw !== "object") return null;
    if (!isNonEmptyString(raw.historyGoPlaceId)) return null;
    if (!isNonEmptyString(raw.civicationPlaceId)) return null;

    var buildingType = null;
    if (isNonEmptyString(raw.buildingTypeId) && buildingTypesById) {
      buildingType = buildingTypesById.get(raw.buildingTypeId) || null;
    }
    var mapFunction = buildingType && isNonEmptyString(buildingType.mapFunction)
      ? buildingType.mapFunction
      : null;

    return {
      id: raw.id,
      historyGoPlaceId: raw.historyGoPlaceId,
      civicationPlaceId: raw.civicationPlaceId,
      historyGoSourceFile: raw.historyGoSourceFile,
      name: raw.name,
      category: raw.category,
      lat: raw.lat,
      lon: raw.lon,
      emneIds: Array.isArray(raw.emne_ids) ? raw.emne_ids.slice() : [],
      buildingTypeId: raw.buildingTypeId,
      buildingType: buildingType,
      mapFunction: mapFunction,
      mapRole: raw.mapRole,
      visibleAs: raw.visibleAs,
      socialFunctions: Array.isArray(raw.socialFunctions) ? raw.socialFunctions.slice() : [],
      phaseTypes: Array.isArray(raw.phaseTypes) ? raw.phaseTypes.slice() : [],
      groundhopperRelevant: raw.groundhopperRelevant === true,
      needsEnrichment: raw.needsEnrichment === true
    };
  }

  /**
   * Flett en liste av parsede mappingfiler + buildingTypes til ett read-model.
   * Ren funksjon (ingen fetch/DOM). Duplikate historyGoPlaceId/civicationPlaceId
   * på tvers av filer hoppes over (første vinner) og telles i diagnostics.
   *
   * @param {{ mappingFiles?: unknown[], buildingTypesData?: unknown }} input
   */
  function mergeCityMap(input) {
    var opts = input || {};
    var mappingFiles = Array.isArray(opts.mappingFiles) ? opts.mappingFiles : [];
    var buildingTypesById = indexBuildingTypes(opts.buildingTypesData);

    var entries = [];
    var byHistoryGoPlaceId = new Map();
    var byCivicationPlaceId = new Map();

    var diagnostics = {
      fileCount: mappingFiles.length,
      entryCount: 0,
      groundhopperCount: 0,
      needsEnrichmentCount: 0,
      unknownBuildingTypeCount: 0,
      skippedInvalid: 0,
      skippedDuplicateHistoryGoPlaceId: [],
      skippedDuplicateCivicationPlaceId: [],
      categories: {}
    };

    for (var f = 0; f < mappingFiles.length; f += 1) {
      var file = /** @type {any} */ (mappingFiles[f]);
      var mappings = file && file.mappings;
      if (!mappings || typeof mappings !== "object") continue;
      var keys = Object.keys(mappings);
      for (var i = 0; i < keys.length; i += 1) {
        var entry = normalizeEntry(mappings[keys[i]], buildingTypesById);
        if (!entry) {
          diagnostics.skippedInvalid += 1;
          continue;
        }
        if (byHistoryGoPlaceId.has(entry.historyGoPlaceId)) {
          diagnostics.skippedDuplicateHistoryGoPlaceId.push(entry.historyGoPlaceId);
          continue;
        }
        if (byCivicationPlaceId.has(entry.civicationPlaceId)) {
          diagnostics.skippedDuplicateCivicationPlaceId.push(entry.civicationPlaceId);
          continue;
        }

        byHistoryGoPlaceId.set(entry.historyGoPlaceId, entry);
        byCivicationPlaceId.set(entry.civicationPlaceId, entry);
        entries.push(entry);

        diagnostics.entryCount += 1;
        if (entry.groundhopperRelevant) diagnostics.groundhopperCount += 1;
        if (entry.needsEnrichment) diagnostics.needsEnrichmentCount += 1;
        if (isNonEmptyString(entry.buildingTypeId) && !entry.buildingType) {
          diagnostics.unknownBuildingTypeCount += 1;
        }
        if (isNonEmptyString(entry.category)) {
          diagnostics.categories[entry.category] =
            (diagnostics.categories[entry.category] || 0) + 1;
        }
      }
    }

    return {
      entries: entries,
      byHistoryGoPlaceId: byHistoryGoPlaceId,
      byCivicationPlaceId: byCivicationPlaceId,
      diagnostics: diagnostics
    };
  }

  // ---------------------------------------------------------------------------
  // Fetch-lag (kjøres kun når en konsument kaller load())
  // ---------------------------------------------------------------------------
  function fetchJson(path) {
    return fetch(path, { cache: "default" }).then(function (response) {
      if (!response.ok) {
        throw new Error("CivicationCityMap: HTTP " + response.status + " for " + path);
      }
      return response.json();
    });
  }

  function loadCityMap(options) {
    var opts = options || {};
    var overviewPath = opts.overviewPath || OVERVIEW_PATH;
    var buildingTypesPath = opts.buildingTypesPath || BUILDING_TYPES_PATH;

    return Promise.all([fetchJson(overviewPath), fetchJson(buildingTypesPath)])
      .then(function (results) {
        var overviewData = results[0];
        var buildingTypesData = results[1];
        var files = perPlaceMappingFilesFromOverview(overviewData);
        return Promise.all(
          files.map(function (file) {
            // Én ødelagt fil skal ikke velte hele kartet – hopp over den.
            return fetchJson(file).catch(function (err) {
              if (typeof console !== "undefined" && console.warn) {
                console.warn("[CivicationCityMap] hoppet over " + file + ": " + ((err && err.message) || err));
              }
              return null;
            });
          })
        ).then(function (mappingFiles) {
          return mergeCityMap({
            mappingFiles: mappingFiles.filter(Boolean),
            buildingTypesData: buildingTypesData
          });
        });
      });
  }

  // ---------------------------------------------------------------------------
  // Offentlig API (memoisert load; ingen auto-kjøring ved import)
  // ---------------------------------------------------------------------------
  var _loadPromise = null;
  var _model = null;

  function load(options) {
    if (options && options.force) {
      _loadPromise = null;
      _model = null;
    }
    if (!_loadPromise) {
      _loadPromise = loadCityMap(options).then(function (model) {
        _model = model;
        return model;
      }).catch(function (err) {
        // Nullstill så en senere kaller kan prøve igjen.
        _loadPromise = null;
        throw err;
      });
    }
    return _loadPromise;
  }

  function get(historyGoPlaceId) {
    return _model ? _model.byHistoryGoPlaceId.get(historyGoPlaceId) || null : null;
  }

  function getByCivicationId(civicationPlaceId) {
    return _model ? _model.byCivicationPlaceId.get(civicationPlaceId) || null : null;
  }

  function all() {
    return _model ? _model.entries.slice() : [];
  }

  function isGroundhopperPlace(historyGoPlaceId) {
    var entry = get(historyGoPlaceId);
    return !!(entry && entry.groundhopperRelevant);
  }

  function diagnostics() {
    return _model ? _model.diagnostics : null;
  }

  function isLoaded() {
    return _model != null;
  }

  globalScope.CivicationCityMap = {
    // Livssyklus
    load: load,
    isLoaded: isLoaded,
    // Oppslag (returnerer null før load() har fullført)
    get: get,
    getByCivicationId: getByCivicationId,
    all: all,
    isGroundhopperPlace: isGroundhopperPlace,
    diagnostics: diagnostics,
    // Rene byggeklosser (eksponert for test/gjenbruk)
    mergeCityMap: mergeCityMap,
    indexBuildingTypes: indexBuildingTypes,
    perPlaceMappingFilesFromOverview: perPlaceMappingFilesFromOverview,
    normalizeEntry: normalizeEntry
  };
})(typeof window !== "undefined" ? window : this);
