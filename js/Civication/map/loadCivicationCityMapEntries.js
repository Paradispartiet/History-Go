// js/Civication/map/loadCivicationCityMapEntries.js
//
// Browser-kompatibel loader-modul for Civication city map entries.
//
// Henter og transformerer History Go by-mappingen til rene Civication city map
// entries. Dette er loader-GRUNNLAG: modulen kobles IKKE inn i kartet/UI ennå,
// auto-kjører ikke, og skriver hverken filer eller DOM. Den eksponerer kun rene
// funksjoner via window, slik resten av Civication-runtime kan bruke dem senere.
//
// Dataflyt (samme som audit-scriptene):
//   data/places/by/oslo/places_by.json
//   data/Civication/map/historyGoPlaceMapping.by.json
//   data/Civication/map/buildingTypes.json
//     -> in-memory cityMapEntries
//
// Speiler valideringen i scripts/audit-civication-city-map-entries.mjs.

/**
 * @typedef {Record<string, unknown>} CiviCityMapRecord
 */

/**
 * @typedef {Object} CiviCityMapEntry
 * @property {string} id
 * @property {string} historyGoPlaceId
 * @property {string} name
 * @property {"by"} category
 * @property {number} lat
 * @property {number} lon
 * @property {string} buildingTypeId
 * @property {string} mapRole
 * @property {string} visibleAs
 * @property {string[]} socialFunctions
 * @property {string[]} phaseTypes
 * @property {boolean} groundhopperRelevant
 * @property {{ mappingFile: string, historyGoSourceFile: string }} source
 */

/**
 * @typedef {Object} CiviCityMapDiagnostics
 * @property {number} placesCount
 * @property {number} mappingsCount
 * @property {number} entriesCount
 * @property {number} uniqueBuildingTypeIds
 * @property {string[]} unmappedPlaces
 * @property {string[]} needsEnrichment
 */

/**
 * @typedef {Object} CiviCityMapResult
 * @property {CiviCityMapEntry[]} entries
 * @property {CiviCityMapDiagnostics} diagnostics
 */

(function (globalScope) {
  "use strict";

  var DEFAULT_MAPPING_PATH = "data/Civication/map/historyGoPlaceMapping.by.json";
  var DEFAULT_PLACES_PATH = "data/places/by/oslo/places_by.json";
  var DEFAULT_BUILDING_TYPES_PATH = "data/Civication/map/buildingTypes.json";

  var EXPECTED_SOURCE_FILE = "places/by/oslo/places_by.json";
  var MAPPING_FILE_REL = "data/Civication/map/historyGoPlaceMapping.by.json";
  var PLACES_FILE_REL = "data/places/by/oslo/places_by.json";

  function snippet(text) {
    if (typeof text !== "string") {
      return "";
    }
    var trimmed = text.trim();
    if (trimmed.length <= 200) {
      return trimmed;
    }
    return trimmed.slice(0, 200) + "…";
  }

  /**
   * Hent og parse en JSON-fil strengt. Leser body som tekst først, slik at vi
   * kan inkludere en kort snippet i feilmeldingen ved HTTP- eller parse-feil.
   *
   * @param {string} path
   * @returns {Promise<unknown>}
   */
  function fetchCivicationJsonStrict(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      return response.text().then(function (text) {
        if (!response.ok) {
          throw new Error(
            "fetchCivicationJsonStrict: HTTP " +
              response.status +
              " for " +
              path +
              " – body: " +
              snippet(text)
          );
        }
        try {
          return JSON.parse(text);
        } catch (err) {
          throw new Error(
            "fetchCivicationJsonStrict: kunne ikke parse JSON fra " +
              path +
              " – body: " +
              snippet(text)
          );
        }
      });
    });
  }

  /**
   * Trekk ut definerte buildingTypeId-er. Støtter samme former som
   * audit-scriptet:
   *   { "buildingTypes": { "<id>": { ... } } }
   *   { "buildingTypes": [ { "id": "..." } ] }
   *   { "<id>": { ... } }
   *
   * @param {unknown} buildingTypesData
   * @returns {Set<string>}
   */
  function extractCivicationBuildingTypeIds(buildingTypesData) {
    var ids = new Set();
    var root =
      buildingTypesData && buildingTypesData.buildingTypes != null
        ? buildingTypesData.buildingTypes
        : buildingTypesData;

    if (Array.isArray(root)) {
      for (var i = 0; i < root.length; i += 1) {
        var item = root[i];
        if (item && typeof item.id === "string" && item.id.trim()) {
          ids.add(item.id);
        }
      }
      return ids;
    }

    if (root && typeof root === "object") {
      var keys = Object.keys(root);
      for (var k = 0; k < keys.length; k += 1) {
        var key = keys[k];
        var value = root[key];
        if (value && typeof value.id === "string" && value.id.trim()) {
          ids.add(value.id);
        } else if (typeof key === "string" && key.trim()) {
          ids.add(key);
        }
      }
    }

    return ids;
  }

  /**
   * Indekser places_by.json (array) etter place.id. Entries uten string id
   * ignoreres.
   *
   * @param {unknown} placesData
   * @returns {Map<string, CiviCityMapRecord>}
   */
  function indexCivicationPlacesById(placesData) {
    var byId = new Map();
    if (!Array.isArray(placesData)) {
      return byId;
    }
    for (var i = 0; i < placesData.length; i += 1) {
      var place = placesData[i];
      if (place && typeof place.id === "string") {
        byId.set(place.id, place);
      }
    }
    return byId;
  }

  function requireString(value) {
    return typeof value === "string" && value.length > 0;
  }

  function arraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function isValidLat(value) {
    return typeof value === "number" && isFinite(value) && value >= -90 && value <= 90;
  }

  function isValidLon(value) {
    return typeof value === "number" && isFinite(value) && value >= -180 && value <= 180;
  }

  /**
   * Transformer History Go by-mappingen til Civication city map entries.
   * Speiler valideringen i scripts/audit-civication-city-map-entries.mjs.
   * Ved alvorlig feil kastes Error – ingen delvise entries returneres.
   *
   * @param {{ mappingData: unknown, placesData: unknown, buildingTypesData: unknown }} input
   * @returns {CiviCityMapResult}
   */
  function transformCivicationCityMapEntries(input) {
    var safeInput = input || {};
    var mappingData = safeInput.mappingData;
    var placesData = safeInput.placesData;
    var buildingTypesData = safeInput.buildingTypesData;

    var fatal = [];

    // 1. Toppnivå-validering.
    if (mappingData == null || typeof mappingData !== "object") {
      throw new Error("transformCivicationCityMapEntries: mappingData mangler eller er ikke et objekt");
    }
    if (mappingData.sourceFile !== EXPECTED_SOURCE_FILE) {
      fatal.push(
        'Mappingfilen har feil sourceFile: forventet "' +
          EXPECTED_SOURCE_FILE +
          '", fikk ' +
          JSON.stringify(mappingData.sourceFile)
      );
    }

    var mappings = mappingData.mappings;
    var mappingsIsObject =
      mappings && typeof mappings === "object" && !Array.isArray(mappings);
    if (!mappingsIsObject) {
      fatal.push("Mappingfilen mangler et gyldig mappings-objekt");
    }

    if (!Array.isArray(placesData)) {
      fatal.push(PLACES_FILE_REL + " er ikke en liste over steder");
    }

    // Hvis grunnstrukturen er ødelagt kan vi ikke trygt fortsette.
    if (fatal.length > 0) {
      throw new Error(
        "transformCivicationCityMapEntries: " + fatal.length + " alvorlig(e) feil:\n  - " + fatal.join("\n  - ")
      );
    }

    var placesById = indexCivicationPlacesById(placesData);
    var placesCount = Array.isArray(placesData) ? placesData.length : 0;
    var definedBuildingTypeIds = extractCivicationBuildingTypeIds(buildingTypesData);

    var mappingEntries = Object.keys(mappings).map(function (key) {
      return [key, mappings[key]];
    });

    var seenMappingIds = new Map();
    var seenHistoryGoPlaceIds = new Map();
    var seenCivicationPlaceIds = new Map();

    var usedBuildingTypeIds = new Set();
    var mappedHistoryGoPlaceIds = new Set();
    var needsEnrichmentList = [];

    var entries = [];

    for (var e = 0; e < mappingEntries.length; e += 1) {
      var mappingKey = mappingEntries[e][0];
      var m = mappingEntries[e][1] || {};
      var label = mappingKey;

      // Obligatoriske felt og typer.
      if (!requireString(m.id)) {
        fatal.push(label + ": mangler gyldig id (string)");
      }
      if (!requireString(m.historyGoPlaceId)) {
        fatal.push(label + ": mangler gyldig historyGoPlaceId (string)");
      }
      if (!requireString(m.civicationPlaceId)) {
        fatal.push(label + ": mangler gyldig civicationPlaceId (string)");
      }
      if (!requireString(m.name)) {
        fatal.push(label + ": mangler gyldig name (string)");
      }
      if (m.category !== "by") {
        fatal.push(label + ': category må være "by", fikk ' + JSON.stringify(m.category));
      }
      if (typeof m.lat !== "number") {
        fatal.push(label + ": lat må være number, fikk " + JSON.stringify(m.lat));
      }
      if (typeof m.lon !== "number") {
        fatal.push(label + ": lon må være number, fikk " + JSON.stringify(m.lon));
      }
      if (!requireString(m.buildingTypeId)) {
        fatal.push(label + ": mangler gyldig buildingTypeId (string)");
      }
      if (!requireString(m.mapRole)) {
        fatal.push(label + ": mangler gyldig mapRole (string)");
      }
      if (!requireString(m.visibleAs)) {
        fatal.push(label + ": mangler gyldig visibleAs (string)");
      }
      if (!Array.isArray(m.socialFunctions)) {
        fatal.push(label + ": socialFunctions må være array");
      } else if (m.socialFunctions.length < 1) {
        fatal.push(label + ": socialFunctions må ha minst 1 entry");
      }
      if (!Array.isArray(m.phaseTypes)) {
        fatal.push(label + ": phaseTypes må være array");
      } else if (m.phaseTypes.length < 1) {
        fatal.push(label + ": phaseTypes må ha minst 1 entry");
      }
      if (typeof m.groundhopperRelevant !== "boolean") {
        fatal.push(label + ": groundhopperRelevant må være boolean");
      }
      if (typeof m.needsVerification !== "boolean") {
        fatal.push(label + ": needsVerification må være boolean");
      }

      // Unikhet.
      if (requireString(m.id)) {
        if (seenMappingIds.has(m.id)) {
          fatal.push(label + ': mapping.id "' + m.id + '" er ikke unik (også brukt i ' + seenMappingIds.get(m.id) + ")");
        } else {
          seenMappingIds.set(m.id, label);
        }
      }
      if (requireString(m.historyGoPlaceId)) {
        if (seenHistoryGoPlaceIds.has(m.historyGoPlaceId)) {
          fatal.push(
            label + ': historyGoPlaceId "' + m.historyGoPlaceId + '" er ikke unik (også brukt i ' + seenHistoryGoPlaceIds.get(m.historyGoPlaceId) + ")"
          );
        } else {
          seenHistoryGoPlaceIds.set(m.historyGoPlaceId, label);
        }
      }
      if (requireString(m.civicationPlaceId)) {
        if (seenCivicationPlaceIds.has(m.civicationPlaceId)) {
          fatal.push(
            label + ': civicationPlaceId "' + m.civicationPlaceId + '" er ikke unik (også brukt i ' + seenCivicationPlaceIds.get(m.civicationPlaceId) + ")"
          );
        } else {
          seenCivicationPlaceIds.set(m.civicationPlaceId, label);
        }
      }

      // Geodata-grenser.
      if (typeof m.lat === "number" && !isValidLat(m.lat)) {
        fatal.push(label + ": lat " + m.lat + " er utenfor gyldig område (-90..90)");
      }
      if (typeof m.lon === "number" && !isValidLon(m.lon)) {
        fatal.push(label + ": lon " + m.lon + " er utenfor gyldig område (-180..180)");
      }

      // Kildekobling mot places_by.json.
      if (requireString(m.historyGoPlaceId)) {
        mappedHistoryGoPlaceIds.add(m.historyGoPlaceId);
        var place = placesById.get(m.historyGoPlaceId);
        if (!place) {
          fatal.push(label + ': historyGoPlaceId "' + m.historyGoPlaceId + '" finnes ikke i ' + PLACES_FILE_REL);
        } else {
          if (m.name !== place.name) {
            fatal.push(label + ': name "' + m.name + '" matcher ikke kilde "' + place.name + '"');
          }
          if (m.lat !== place.lat) {
            fatal.push(label + ": lat " + m.lat + " matcher ikke kilde " + place.lat);
          }
          if (m.lon !== place.lon) {
            fatal.push(label + ": lon " + m.lon + " matcher ikke kilde " + place.lon);
          }
          if (m.category !== place.category) {
            fatal.push(label + ': category "' + m.category + '" matcher ikke kilde "' + place.category + '"');
          }
        }
      }

      // Building type-kobling.
      if (requireString(m.buildingTypeId) && !definedBuildingTypeIds.has(m.buildingTypeId)) {
        fatal.push(label + ': buildingTypeId "' + m.buildingTypeId + '" mangler i buildingTypes.json');
      }
      if (requireString(m.buildingTypeId)) {
        usedBuildingTypeIds.add(m.buildingTypeId);
      }

      if (m.needsEnrichment === true) {
        needsEnrichmentList.push(m.id != null ? m.id : label);
      }

      // In-memory transformasjon til city map entry.
      entries.push({
        id: m.civicationPlaceId,
        historyGoPlaceId: m.historyGoPlaceId,
        name: m.name,
        category: "by",
        lat: m.lat,
        lon: m.lon,
        buildingTypeId: m.buildingTypeId,
        mapRole: m.mapRole,
        visibleAs: m.visibleAs,
        socialFunctions: Array.isArray(m.socialFunctions) ? m.socialFunctions.slice() : m.socialFunctions,
        phaseTypes: Array.isArray(m.phaseTypes) ? m.phaseTypes.slice() : m.phaseTypes,
        groundhopperRelevant: m.groundhopperRelevant,
        source: {
          mappingFile: MAPPING_FILE_REL,
          historyGoSourceFile: PLACES_FILE_REL
        }
      });
    }

    // Valider de genererte entries.
    if (entries.length !== mappingEntries.length) {
      fatal.push("Antall entries (" + entries.length + ") er ulik antall mappings (" + mappingEntries.length + ")");
    }
    var seenEntryIds = new Set();
    for (var x = 0; x < entries.length; x += 1) {
      var entry = entries[x];
      if (typeof entry.id !== "string" || !entry.id) {
        fatal.push("cityMapEntry mangler gyldig id");
      } else if (seenEntryIds.has(entry.id)) {
        fatal.push('cityMapEntry id "' + entry.id + '" er ikke unik');
      } else {
        seenEntryIds.add(entry.id);
      }
      if (typeof entry.lat !== "number") {
        fatal.push('cityMapEntry "' + entry.id + '": lat er ikke number');
      }
      if (typeof entry.lon !== "number") {
        fatal.push('cityMapEntry "' + entry.id + '": lon er ikke number');
      }
      if (typeof entry.buildingTypeId !== "string" || !definedBuildingTypeIds.has(entry.buildingTypeId)) {
        fatal.push('cityMapEntry "' + entry.id + '": buildingTypeId mangler i buildingTypes.json');
      }
      var stringFields = ["name", "category", "mapRole", "visibleAs"];
      for (var f = 0; f < stringFields.length; f += 1) {
        var field = stringFields[f];
        if (typeof entry[field] !== "string" || !entry[field]) {
          fatal.push('cityMapEntry "' + entry.id + '": mangler ' + field);
        }
      }
    }

    if (fatal.length > 0) {
      throw new Error(
        "transformCivicationCityMapEntries: " + fatal.length + " alvorlig(e) feil:\n  - " + fatal.join("\n  - ")
      );
    }

    // Unmapped places (forventet, ikke en feil).
    var unmappedPlaces = [];
    if (Array.isArray(placesData)) {
      for (var p = 0; p < placesData.length; p += 1) {
        var pl = placesData[p];
        if (pl && typeof pl.id === "string" && !mappedHistoryGoPlaceIds.has(pl.id)) {
          unmappedPlaces.push(pl.id);
        }
      }
    }

    return {
      entries: entries,
      diagnostics: {
        placesCount: placesCount,
        mappingsCount: mappingEntries.length,
        entriesCount: entries.length,
        uniqueBuildingTypeIds: usedBuildingTypeIds.size,
        unmappedPlaces: unmappedPlaces,
        needsEnrichment: needsEnrichmentList
      }
    };
  }

  /**
   * Hent alle tre JSON-filer og transformer til city map entries.
   *
   * @param {{ mappingPath?: string, placesPath?: string, buildingTypesPath?: string }} [options]
   * @returns {Promise<CiviCityMapResult>}
   */
  function loadCivicationCityMapEntries(options) {
    var opts = options || {};
    var mappingPath = opts.mappingPath || DEFAULT_MAPPING_PATH;
    var placesPath = opts.placesPath || DEFAULT_PLACES_PATH;
    var buildingTypesPath = opts.buildingTypesPath || DEFAULT_BUILDING_TYPES_PATH;

    return Promise.all([
      fetchCivicationJsonStrict(mappingPath),
      fetchCivicationJsonStrict(placesPath),
      fetchCivicationJsonStrict(buildingTypesPath)
    ]).then(function (results) {
      return transformCivicationCityMapEntries({
        mappingData: results[0],
        placesData: results[1],
        buildingTypesData: results[2]
      });
    });
  }

  // Eksponer kun de rene funksjonene. Auto-kjør IKKE loaderen, fetch ingenting,
  // og rør ikke DOM eller window.CIVICATION_CITY_MAP_ENTRIES ennå.
  globalScope.CivicationCityMapEntriesLoader = {
    loadCivicationCityMapEntries: loadCivicationCityMapEntries,
    transformCivicationCityMapEntries: transformCivicationCityMapEntries,
    extractCivicationBuildingTypeIds: extractCivicationBuildingTypeIds,
    indexCivicationPlacesById: indexCivicationPlacesById,
    fetchCivicationJsonStrict: fetchCivicationJsonStrict
  };
})(typeof window !== "undefined" ? window : this);
