// CivicationSocialPlaceResolver.js
// Datadrevet bro mellom ekte brand-/place-data og Civications sosiale steder.
//
// Civication har en sosial motor (fasevalg, stedsbaserte møter, henvendelser,
// relasjoner og samtaletråder). Tidligere lå de sosiale stedene som generiske
// punkter i data/Civication/map/phaseLocations.json ("cafe", "park", "gym" …).
// Denne resolveren lager i stedet EKTE sosiale kafésteder ved å koble:
//
//   data/brands/brands_by_place.json   (ekte placeId -> brandId-er)
//   data/brands/brands_master.json     (brand: name, brand_type, sector, desc …)
//   data/places/... (History Go source) (placeId -> name, koordinater, kategori)
//
// Kjerneregler (jf. oppgaven):
//   - Kafé/kaffe hentes fra brand_type "coffee_brand" ELLER sector "coffee"
//     (sector "coffee_design" fanges også, f.eks. Fuglen).
//   - Café-/kaffe-navngitte serveringssteder (hospitality/nightlife/food)
//     kan brukes som sosiale steder senere; kaffe prioriteres først.
//   - Hvert sosialt sted bruker EKTE placeId som locationId, eller en stabil
//     avledet id ("brand_place:{placeId}:{brandId}").
//   - Finnes placeId i History Go source-data brukes navn/koordinater/kategori
//     derfra. Finnes brand, brukes brandens name/brand_type/sector/desc.
//   - Ingen duplikater av samme brand/place-kombinasjon.
//   - Ingen sosiale steder fra brands som ikke er koblet til en placeId.
//
// VIKTIG avgrensning (som resten av Civication-sosialflyten):
//   Ingen backend, ingen live multiplayer, ingen GPS. Alt er rent og
//   deterministisk: samme data gir alltid samme sosiale steder, slik at det er
//   testbart. Build-output (dist/) brukes ALDRI som kilde – kun source-data.
(function () {
  "use strict";

  if (window.CivicationSocialPlaceResolver) return;

  const BRANDS_MASTER_PATH = "data/brands/brands_master.json";
  const BRANDS_BY_PLACE_PATH = "data/brands/brands_by_place.json";
  const PLACES_MANIFEST_PATH = "data/places/manifest.json";

  // Stabil prefiks for avledet sosial locationId. Endres aldri – player- og
  // friend-snapshots, samtaletråder og henvendelser bygger på denne id-en.
  const LOCATION_ID_PREFIX = "brand_place";

  // Kildemerke for ALT som kommer fra denne broen.
  const SOURCE = "brands_by_place";

  // Civication-stedstype for brand-kaféer. "cafe" gjør at den eksisterende
  // sosiale motoren (CivicationFriendsEngine.SOCIAL_PLACE_BY_TYPE.cafe) gir
  // player-snapshotet socialAvailability "open_to_contact".
  const SOCIAL_PLACE_TYPE = "cafe";
  const SOCIAL_CHANNEL = "social";
  const SOCIAL_ICON = "☕";

  // Semantiske faser (fase-minne) der en kafé er et naturlig sosialt møtested.
  const COFFEE_PHASE_AFFINITY = ["morning", "leisure", "evening"];
  // Tilsvarende dagfaser (kalenderen) – kompatibelt med phaseLocations.activePhases.
  const COFFEE_ACTIVE_PHASES = ["lunch", "afternoon", "evening"];

  const COFFEE_ACTIVITIES = ["coffee", "meet_people", "small_talk"];

  // Sektorer som regnes som servering/uteliv når et brand er café-/kaffe-navngitt
  // (sekundær "hospitality"-kategori – brukes etter kaffe).
  const HOSPITALITY_SECTORS = new Set(["hospitality", "nightlife", "food_and_drink"]);

  // Brand-navn som røper et ekte serveringssted med kaffe/kafé-profil.
  const CAFE_NAME_RE = /caf[eé]|kaffe|coffee/i;

  // ---------------------------------------------------------------------------
  // Små rene hjelpere
  // ---------------------------------------------------------------------------
  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function lower(value) {
    return norm(value).toLowerCase();
  }

  function obj(value) {
    return value && typeof value === "object" ? value : {};
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  // ---------------------------------------------------------------------------
  // Brand-klassifisering (rene, deterministiske)
  // ---------------------------------------------------------------------------
  // Et ekte kaffebrand: brand_type "coffee_brand" eller sector som inneholder
  // "coffee" (fanger også "coffee_design", f.eks. Fuglen).
  function isCoffeeBrand(brand) {
    const b = obj(brand);
    if (lower(b.brand_type) === "coffee_brand") return true;
    return /coffee/.test(lower(b.sector));
  }

  // Et café-/kaffe-navngitt serveringssted (hospitality/nightlife/food) som ikke
  // allerede er et rent kaffebrand. Sekundær kategori – kaffe prioriteres først.
  function isCafeVenueBrand(brand) {
    const b = obj(brand);
    if (isCoffeeBrand(b)) return false;
    if (!CAFE_NAME_RE.test(norm(b.name))) return false;
    return HOSPITALITY_SECTORS.has(lower(b.sector));
  }

  // Er dette et brand vi i det hele tatt skal lage et sosialt sted av?
  function isSocialBrand(brand) {
    return isCoffeeBrand(brand) || isCafeVenueBrand(brand);
  }

  // "coffee" for rene kaffebrand, ellers "hospitality" for café-serveringssteder.
  function socialPlaceTypeFor(brand) {
    if (isCoffeeBrand(brand)) return "coffee";
    if (isCafeVenueBrand(brand)) return "hospitality";
    return null;
  }

  // ---------------------------------------------------------------------------
  // Indeksering av rådata (rene)
  // ---------------------------------------------------------------------------
  // Bygger { brandId -> brand } fra brands_master (array).
  function indexBrandsById(brandMaster) {
    const byId = {};
    ensureArray(brandMaster).forEach((raw) => {
      const id = norm(raw && raw.id);
      if (id && !byId[id]) byId[id] = raw;
    });
    return byId;
  }

  // Bygger { placeId -> place } fra en places-array (History Go source-data).
  function indexPlacesById(places) {
    const byId = {};
    ensureArray(places).forEach((raw) => {
      const id = norm(raw && raw.id);
      if (id && !byId[id]) byId[id] = raw;
    });
    return byId;
  }

  // ---------------------------------------------------------------------------
  // Oppslag (rene) – tar enten eksplisitt data (opts) eller cachen
  // ---------------------------------------------------------------------------
  function resolveByPlace(opts) {
    const o = obj(opts);
    if (o.brandByPlace && typeof o.brandByPlace === "object") return o.brandByPlace;
    return _byPlaceCache || {};
  }

  function resolveBrandIndex(opts) {
    const o = obj(opts);
    if (o.brandsById && typeof o.brandsById === "object") return o.brandsById;
    if (Array.isArray(o.brandMaster)) return indexBrandsById(o.brandMaster);
    return _brandsByIdCache || {};
  }

  function resolvePlaceIndex(opts) {
    const o = obj(opts);
    if (o.placesById && typeof o.placesById === "object") return o.placesById;
    if (Array.isArray(o.places)) return indexPlacesById(o.places);
    return _placesByIdCache || {};
  }

  // brandId-er koblet til en placeId (rå id-er fra brands_by_place).
  function getBrandsForPlace(placeId, opts) {
    const pid = norm(placeId);
    if (!pid) return [];
    const byPlace = resolveByPlace(opts);
    return ensureArray(byPlace[pid]).map(norm).filter(Boolean);
  }

  // Ett brand-objekt fra brands_master.
  function getBrandById(brandId, opts) {
    const id = norm(brandId);
    if (!id) return null;
    return resolveBrandIndex(opts)[id] || null;
  }

  // Sosiale (kafé-/kaffe-) brand-objekter koblet til en placeId. Brands som ikke
  // finnes i master, eller ikke er sosiale, filtreres bort.
  function getSocialBrandsForPlace(placeId, opts) {
    const brandIndex = resolveBrandIndex(opts);
    return getBrandsForPlace(placeId, opts)
      .map((id) => brandIndex[id])
      .filter(Boolean)
      .filter(isSocialBrand);
  }

  // ---------------------------------------------------------------------------
  // Bygg én sosial sted-modell fra en (placeId, brand, place)
  // ---------------------------------------------------------------------------
  // Ren funksjon. place er valgfri (History Go source-data for placeId). Når den
  // mangler avledes label fra brandnavnet og placeId beholdes som kilde.
  function buildSocialPlaceFromBrandPlace(placeId, brand, place) {
    const pid = norm(placeId);
    const b = obj(brand);
    const brandId = norm(b.id);
    if (!pid || !brandId) return null;

    const p = obj(place);
    const placeLabel = norm(p.name) || prettifyId(pid);
    const brandLabel = norm(b.name) || prettifyId(brandId);
    const type = socialPlaceTypeFor(b) || "hospitality";
    const intro = norm(b.popupdesc) || norm(b.desc) || "";

    const locationId = LOCATION_ID_PREFIX + ":" + pid + ":" + brandId;

    const model = {
      // Engine-kompatibel: CivicationFriendsEngine bruker .id som locationId og
      // .type for sosial-profil. Vi setter begge eksplisitt.
      id: locationId,
      locationId: locationId,
      sourcePlaceId: pid,
      brandId: brandId,
      label: brandLabel,
      placeLabel: placeLabel,
      type: SOCIAL_PLACE_TYPE,
      socialPlaceType: type,
      icon: SOCIAL_ICON,
      channel: SOCIAL_CHANNEL,
      phaseAffinity: COFFEE_PHASE_AFFINITY.slice(),
      activePhases: COFFEE_ACTIVE_PHASES.slice(),
      availableActivities: COFFEE_ACTIVITIES.slice(),
      // Brand-metadata (kilde: brands_master).
      brandType: norm(b.brand_type),
      sector: norm(b.sector),
      intro: intro,
      // Brukervendt label/short desc for stedskortet.
      description: intro || (brandLabel + " – sosialt kafésted tilknyttet " + placeLabel + "."),
      source: SOURCE
    };

    // Place-metadata når placeId finnes i History Go source-data.
    if (Object.prototype.hasOwnProperty.call(p, "lat")) model.lat = p.lat;
    if (Object.prototype.hasOwnProperty.call(p, "lon")) model.lon = p.lon;
    if (norm(p.category)) model.category = norm(p.category);
    model.placeFound = !!norm(p.name);

    return model;
  }

  function prettifyId(id) {
    const s = norm(id);
    if (!s) return "";
    return s.replace(/[_:]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // ---------------------------------------------------------------------------
  // Resolver: alle sosiale brand-steder (rene, dedupliserte)
  // ---------------------------------------------------------------------------
  // Itererer KUN over brands_by_place -> hvert sosialt sted har garantert en
  // ekte placeId. Dedupliserer på locationId (place+brand-kombinasjon).
  //
  // options:
  //   includeHospitality (default true): ta med café-/kaffe-navngitte
  //     serveringssteder i tillegg til rene kaffebrand. Sett false for kun kaffe.
  //   onlyType: "coffee" | "hospitality" – filtrer til én kategori.
  function resolveCivicationSocialPlacesFromBrands(opts) {
    const o = obj(opts);
    const includeHospitality = o.includeHospitality !== false;
    const onlyType = norm(o.onlyType) || null;

    const byPlace = resolveByPlace(o);
    const brandIndex = resolveBrandIndex(o);
    const placeIndex = resolvePlaceIndex(o);

    const seen = new Set();
    const out = [];

    // Stabil rekkefølge: placeId alfabetisk, brand i rekkefølgen fra by_place.
    Object.keys(byPlace).sort().forEach((placeId) => {
      const pid = norm(placeId);
      if (!pid) return;
      const place = placeIndex[pid] || null;
      ensureArray(byPlace[placeId]).map(norm).filter(Boolean).forEach((brandId) => {
        const brand = brandIndex[brandId];
        if (!brand || !isSocialBrand(brand)) return;
        const type = socialPlaceTypeFor(brand);
        if (type === "hospitality" && !includeHospitality) return;
        if (onlyType && type !== onlyType) return;

        const model = buildSocialPlaceFromBrandPlace(pid, brand, place);
        if (!model) return;
        if (seen.has(model.locationId)) return; // ingen duplikater
        seen.add(model.locationId);
        out.push(model);
      });
    });

    // Kaffe prioriteres først, deretter hospitality – stabil, deterministisk.
    return out.sort(sortCoffeeFirst);
  }

  function sortCoffeeFirst(a, b) {
    const rank = (m) => (m.socialPlaceType === "coffee" ? 0 : 1);
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    return a.locationId < b.locationId ? -1 : (a.locationId > b.locationId ? 1 : 0);
  }

  // Kun rene kaffesteder (brand_type coffee_brand / sector coffee).
  function getCoffeeSocialPlaces(opts) {
    return resolveCivicationSocialPlacesFromBrands({ ...obj(opts), onlyType: "coffee" });
  }

  // Kun café-/kaffe-navngitte serveringssteder (sekundær hospitality-kategori).
  function getHospitalitySocialPlaces(opts) {
    return resolveCivicationSocialPlacesFromBrands({
      ...obj(opts),
      includeHospitality: true,
      onlyType: "hospitality"
    });
  }

  // Ett sosialt sted ut fra en (avledet) locationId.
  function getSocialPlaceByLocationId(locationId, opts) {
    const lid = norm(locationId);
    if (!lid) return null;
    return resolveCivicationSocialPlacesFromBrands(opts)
      .find((m) => m.locationId === lid) || null;
  }

  // ---------------------------------------------------------------------------
  // Integrasjon med CivicationFriendsEngine
  // ---------------------------------------------------------------------------
  // Slår sammen brand-sosialsteder med en eksisterende locations-array
  // (phaseLocations) slik at den sosiale motoren kan slå opp label/type for de
  // ekte brand-stedene. Eksisterende steder vinner på id-kollisjon. Ren funksjon.
  function mergeSocialPlacesIntoLocations(locations, socialPlaces) {
    const base = ensureArray(locations).slice();
    const existing = new Set(base.map((l) => norm(l && l.id)).filter(Boolean));
    ensureArray(socialPlaces).forEach((sp) => {
      const id = norm(sp && sp.id);
      if (!id || existing.has(id)) return;
      existing.add(id);
      base.push(sp);
    });
    return base;
  }

  // ---------------------------------------------------------------------------
  // UI: stedskort-header for et sosialt kafésted (ren, testbar – ingen DOM)
  // ---------------------------------------------------------------------------
  // Viser brandnavn, tilknyttet ekte History Go-sted, fase og kort intro. Selve
  // møtelisten ("Folk som også valgte …") rendres av CivicationCityLayer.
  function escapeHtml(value) {
    return norm(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function phaseLabel(phase) {
    const eng = window.CivicationFriendsEngine;
    if (eng && typeof eng.snapshotPhaseLabel === "function") {
      return eng.snapshotPhaseLabel(phase);
    }
    return norm(phase);
  }

  function buildBrandPlaceHeaderHtml(place, phase) {
    const sp = obj(place);
    const esc = escapeHtml;
    const phaseLbl = phaseLabel(phase);
    const intro = norm(sp.intro) || norm(sp.description);
    const typeLabel = sp.socialPlaceType === "hospitality" ? "Serveringssted" : "Kafé";
    return '<div class="civi-city-brand-place">' +
      '<div class="civi-city-detail-kicker">' + esc(SOCIAL_ICON) + " " + esc(typeLabel) + "</div>" +
      "<h3>" + esc(sp.label || sp.brandId) + "</h3>" +
      '<p class="civi-city-brand-place-link">' + esc("Tilknyttet: " + (sp.placeLabel || sp.sourcePlaceId)) + "</p>" +
      (phaseLbl ? '<p class="civi-city-brand-place-phase">' + esc(phaseLbl) + "</p>" : "") +
      (intro ? '<p class="civi-city-detail-desc">' + esc(intro) + "</p>" : "") +
      "</div>";
  }

  // Er en location et brand-sosialsted (har både brandId og sourcePlaceId)?
  function isBrandSocialPlace(location) {
    const l = obj(location);
    return !!(norm(l.brandId) && norm(l.sourcePlaceId));
  }

  // ---------------------------------------------------------------------------
  // Async lasting (cachet) – browser-runtime
  // ---------------------------------------------------------------------------
  let _byPlaceCache = null;
  let _brandMasterCache = null;
  let _brandsByIdCache = null;
  let _placesCache = null;
  let _placesByIdCache = null;

  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status + " for " + path);
    return res.json();
  }

  async function loadBrandPlaceMap() {
    if (_byPlaceCache && typeof _byPlaceCache === "object") return _byPlaceCache;
    try {
      const json = await fetchJson(BRANDS_BY_PLACE_PATH);
      _byPlaceCache = json && typeof json === "object" ? json : {};
    } catch (e) {
      console.warn("[CivicationSocialPlaceResolver] kunne ikke laste brands_by_place:", (e && e.message) || e);
      _byPlaceCache = {};
    }
    return _byPlaceCache;
  }

  async function loadBrandMaster() {
    if (Array.isArray(_brandMasterCache)) return _brandMasterCache;
    try {
      const json = await fetchJson(BRANDS_MASTER_PATH);
      _brandMasterCache = ensureArray(json);
    } catch (e) {
      console.warn("[CivicationSocialPlaceResolver] kunne ikke laste brands_master:", (e && e.message) || e);
      _brandMasterCache = [];
    }
    _brandsByIdCache = indexBrandsById(_brandMasterCache);
    return _brandMasterCache;
  }

  // Laster History Go source-steder. Primært fra window.PLACES (allerede lastet
  // av appen), ellers fra manifestets source-filer. places_index.json brukes
  // ALDRI som kilde. Best effort – place-metadata er berikelse, ikke et krav.
  async function loadPlaces() {
    if (Array.isArray(_placesCache)) return _placesCache;
    if (Array.isArray(window.PLACES) && window.PLACES.length) {
      _placesCache = window.PLACES.slice();
      _placesByIdCache = indexPlacesById(_placesCache);
      return _placesCache;
    }
    _placesCache = [];
    try {
      const manifest = await fetchJson(PLACES_MANIFEST_PATH);
      const files = ensureArray(manifest && manifest.files);
      const loaded = await Promise.all(files.map(async (rel) => {
        try {
          const json = await fetchJson("data/places/" + rel);
          return ensureArray(Array.isArray(json) ? json : (json && json.places));
        } catch (_e) {
          return [];
        }
      }));
      loaded.forEach((arr) => { _placesCache = _placesCache.concat(arr); });
    } catch (e) {
      console.warn("[CivicationSocialPlaceResolver] kunne ikke laste place-manifest:", (e && e.message) || e);
    }
    _placesByIdCache = indexPlacesById(_placesCache);
    return _placesCache;
  }

  // Laster alt og fyller cachen, slik at de rene resolverne kan kalles uten args.
  async function init() {
    await Promise.all([loadBrandPlaceMap(), loadBrandMaster(), loadPlaces()]);
    return {
      byPlace: _byPlaceCache,
      brandMaster: _brandMasterCache,
      places: _placesCache
    };
  }

  // Async bekvemmelighet: last alt og resolve.
  async function loadSocialPlaces(opts) {
    await init();
    return resolveCivicationSocialPlacesFromBrands(opts);
  }

  function clearCacheForTesting() {
    _byPlaceCache = null;
    _brandMasterCache = null;
    _brandsByIdCache = null;
    _placesCache = null;
    _placesByIdCache = null;
  }

  window.CivicationSocialPlaceResolver = {
    // konstanter
    LOCATION_ID_PREFIX,
    SOURCE,
    SOCIAL_PLACE_TYPE,
    SOCIAL_CHANNEL,
    COFFEE_PHASE_AFFINITY: COFFEE_PHASE_AFFINITY.slice(),
    COFFEE_ACTIVE_PHASES: COFFEE_ACTIVE_PHASES.slice(),
    HOSPITALITY_SECTORS: [...HOSPITALITY_SECTORS],
    // klassifisering (rene)
    isCoffeeBrand,
    isCafeVenueBrand,
    isSocialBrand,
    socialPlaceTypeFor,
    // indeksering (rene)
    indexBrandsById,
    indexPlacesById,
    // oppslag (rene)
    getBrandsForPlace,
    getBrandById,
    getSocialBrandsForPlace,
    // bygging / resolve (rene)
    buildSocialPlaceFromBrandPlace,
    resolveCivicationSocialPlacesFromBrands,
    getCoffeeSocialPlaces,
    getHospitalitySocialPlaces,
    getSocialPlaceByLocationId,
    // integrasjon
    mergeSocialPlacesIntoLocations,
    isBrandSocialPlace,
    // UI (ren, testbar)
    buildBrandPlaceHeaderHtml,
    // async lasting (browser)
    loadBrandPlaceMap,
    loadBrandMaster,
    loadPlaces,
    init,
    loadSocialPlaces,
    clearCacheForTesting
  };
})();
