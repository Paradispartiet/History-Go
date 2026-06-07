// CivicationSocialPlaceResolver.js
// Datadrevet bro mellom ekte brand-/place-data og Civications sosiale steder.
//
// Civication har en sosial motor (fasevalg, stedsbaserte møter, henvendelser,
// relasjoner og samtaletråder). Tidligere lå de sosiale stedene som generiske
// punkter i data/Civication/map/phaseLocations.json ("cafe", "park", "gym" …).
// Denne resolveren lager i stedet EKTE sosiale steder ved å koble:
//
//   data/brands/brands_by_place.json   (ekte placeId -> brandId-er)
//   data/brands/brands_master.json     (brand: name, brand_type, sector, kind …)
//   data/places/... (History Go source) (placeId -> name, koordinater, kategori)
//
// PR #1200 bygget den første ekte socialPlace-kategorien (kaffe). Denne utgaven
// utvider prinsippet til flere ekte sosiale stedstyper – uten generiske
// løssteder:
//
//   coffee             – kaffebrand (brand_type coffee_brand / sector coffee*)
//   culture            – scene/musikk/galleri/museum/opera/nightlife-venue
//   book_library       – bokhandel/bibliotek (bookstore_brand / sector books /
//                        ekte biblioteksteder som Deichman)
//   park_public_space  – ekte parker/byrom fra data/places (place-only)
//   sport_football     – ekte idretts-/fotballsteder fra data/places/sport
//   hospitality_food   – servering/restaurant (hospitality/restaurant-brands)
//   retail_social      – butikker som møteplass (brand-/concept-/independent-…)
//   city_walk          – ekte gater/plasser/byrom (place-only)
//
// Kjerneregler (jf. oppgaven):
//   - Brand-baserte steder iterer KUN over brands_by_place -> de har garantert en
//     ekte placeId. Stabil locationId: "brand_place:{placeId}:{brandId}".
//   - Place-only-steder (park/byrom/sport/bibliotek uten relevant brand) bygges
//     fra ekte placeId i History Go source-data. Stabil locationId: "place:{placeId}".
//   - Finnes placeId i source-data brukes navn/koordinater/kategori derfra.
//   - Ingen duplikater (dedup på locationId).
//   - Ingen brand uten placeId-kobling. Ingen placeId uten source-data.
//   - Coffee beholdes som egen kategori og fungerer akkurat som i PR #1200.
//
// VIKTIG avgrensning (som resten av Civication-sosialflyten):
//   Ingen backend, ingen live multiplayer, ingen GPS. Alt er rent og
//   deterministisk: samme data gir alltid samme sosiale steder, slik at det er
//   testbart. Build-output (dist/) og places_index.json brukes ALDRI som kilde –
//   kun source-data. phaseLocations.json brukes ALDRI som hovedkilde for ekte
//   sosiale steder (kun som generisk fallback-laget den allerede er).
(function () {
  "use strict";

  if (window.CivicationSocialPlaceResolver) return;

  const BRANDS_MASTER_PATH = "data/brands/brands_master.json";
  const BRANDS_BY_PLACE_PATH = "data/brands/brands_by_place.json";
  const PLACES_MANIFEST_PATH = "data/places/manifest.json";

  // Stabile prefikser for avledede sosiale locationId-er. Endres aldri – player-
  // og friend-snapshots, samtaletråder og henvendelser bygger på disse.
  const LOCATION_ID_PREFIX = "brand_place";       // brand_place:{placeId}:{brandId}
  const PLACE_LOCATION_ID_PREFIX = "place";       // place:{placeId}

  // Kildemerker.
  const SOURCE = "brands_by_place";               // brand-place
  const PLACE_SOURCE = "places_source";           // place-only

  const SOCIAL_CHANNEL = "social";

  // Bakoverkompatibel: coffee-stedene fra PR #1200 har Civication-stedstype
  // "cafe" (gjør at CivicationFriendsEngine.SOCIAL_PLACE_BY_TYPE.cafe gir
  // player-snapshotet socialAvailability "open_to_contact").
  const SOCIAL_PLACE_TYPE = "cafe";

  // ---------------------------------------------------------------------------
  // socialPlaceType-konfigurasjon (rent datadrevet, deterministisk)
  // ---------------------------------------------------------------------------
  // For hver ekte sosial stedstype: hvilken Civication-stedstype (engineType)
  // den mapper til (sosial-profil i CivicationFriendsEngine), ikon, norsk label,
  // semantisk fase-affinitet (fase-minne), dagfaser (kalender/aktiv), tone og
  // aktiviteter. Alt er konstant -> samme type gir alltid samme profil.
  const SOCIAL_TYPE_CONFIG = {
    coffee: {
      engineType: "cafe",
      icon: "☕",
      labelNb: "kaffe",
      phaseAffinity: ["morning", "leisure", "evening"],
      activePhases: ["lunch", "afternoon", "evening"],
      tone: ["rolig", "uformell", "åpen"],
      activities: ["coffee", "meet_people", "small_talk"]
    },
    culture: {
      engineType: "culture",
      icon: "🎭",
      labelNb: "kultur",
      phaseAffinity: ["leisure", "evening", "reflection"],
      activePhases: ["afternoon", "evening", "day_end"],
      tone: ["kulturell", "nysgjerrig", "sosialt forsiktig"],
      activities: ["experience", "meet_people", "small_talk"]
    },
    book_library: {
      engineType: "library",
      icon: "📚",
      labelNb: "bok / bibliotek",
      phaseAffinity: ["leisure", "reflection", "evening"],
      activePhases: ["afternoon", "evening"],
      tone: ["stille", "konsentrert", "interessert"],
      activities: ["read", "browse", "meet_people"]
    },
    park_public_space: {
      engineType: "park",
      icon: "🌳",
      labelNb: "park / byrom",
      phaseAffinity: ["leisure", "evening", "reflection"],
      activePhases: ["afternoon", "evening"],
      tone: ["åpen", "tilfeldig", "rolig"],
      activities: ["walk", "sit", "meet_people"]
    },
    sport_football: {
      engineType: "training",
      icon: "⚽",
      labelNb: "sport / fotball",
      phaseAffinity: ["leisure", "evening"],
      activePhases: ["afternoon", "evening"],
      tone: ["aktiv", "engasjert", "sosial"],
      activities: ["watch_match", "play", "meet_people"]
    },
    hospitality_food: {
      engineType: "cafe",
      icon: "🍽️",
      labelNb: "servering",
      phaseAffinity: ["work", "leisure", "evening"],
      activePhases: ["lunch", "afternoon", "evening"],
      tone: ["sosial", "hverdagslig", "uformell"],
      activities: ["eat", "meet_people", "small_talk"]
    },
    retail_social: {
      engineType: "store_social",
      icon: "🛍️",
      labelNb: "butikk / interesse",
      phaseAffinity: ["leisure"],
      activePhases: ["afternoon"],
      tone: ["urban", "kuratert", "interessebasert"],
      activities: ["browse", "meet_people", "small_talk"]
    },
    city_walk: {
      engineType: "city_walk",
      icon: "🚶",
      labelNb: "byvandring",
      phaseAffinity: ["leisure", "evening"],
      activePhases: ["afternoon", "evening"],
      tone: ["tilfeldig", "urban", "flytende"],
      activities: ["walk", "explore", "meet_people"]
    }
  };

  const SOCIAL_PLACE_TYPES = Object.keys(SOCIAL_TYPE_CONFIG);

  // Stedstyper som er brand-baserte (krever brand-kobling) vs place-baserte.
  const BRAND_BASED_TYPES = new Set(["coffee", "culture", "book_library", "hospitality_food", "retail_social"]);
  const PLACE_BASED_TYPES = new Set(["park_public_space", "city_walk", "sport_football", "book_library"]);

  // Sektorer som regnes som servering/uteliv når et brand er café-/kaffe-navngitt
  // (beholdt for bakoverkompatibel isCafeVenueBrand).
  const HOSPITALITY_SECTORS = new Set(["hospitality", "nightlife", "food_and_drink"]);

  // Brand-navn som røper et ekte serveringssted med kaffe/kafé-profil.
  const CAFE_NAME_RE = /caf[eé]|kaffe|coffee/i;

  // Bakoverkompatible eksporterte konstanter (PR #1200).
  const COFFEE_PHASE_AFFINITY = SOCIAL_TYPE_CONFIG.coffee.phaseAffinity.slice();
  const COFFEE_ACTIVE_PHASES = SOCIAL_TYPE_CONFIG.coffee.activePhases.slice();

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

  function placeTypeOf(place) {
    const p = obj(place);
    const qp = obj(p.quiz_profile);
    return lower(qp.place_type || p.place_type);
  }

  // ---------------------------------------------------------------------------
  // Klassifisering (rene, deterministiske)
  // ---------------------------------------------------------------------------

  // Et ekte kaffebrand: brand_type "coffee_brand" eller sector som inneholder
  // "coffee" (fanger også "coffee_design", f.eks. Fuglen).
  function isCoffeeBrand(brand) {
    const b = obj(brand);
    if (lower(b.brand_type) === "coffee_brand") return true;
    return /coffee/.test(lower(b.sector));
  }

  // Et café-/kaffe-navngitt serveringssted (hospitality/nightlife/food) som ikke
  // allerede er et rent kaffebrand. Beholdt for bakoverkompatibilitet.
  function isCafeVenueBrand(brand) {
    const b = obj(brand);
    if (isCoffeeBrand(b)) return false;
    if (!CAFE_NAME_RE.test(norm(b.name))) return false;
    return HOSPITALITY_SECTORS.has(lower(b.sector));
  }

  const CULTURE_BRAND_TYPES = new Set([
    "music_venue", "jazz_club", "club_brand", "art_brand", "museum_brand",
    "venue_brand", "venue_name", "institution_brand", "historic_culture_brand"
  ]);
  const CULTURE_SECTORS = new Set(["culture", "art", "music", "nightlife"]);

  const HOSPITALITY_BRAND_TYPES = new Set(["hospitality_brand", "restaurant_brand"]);

  const RETAIL_BRAND_TYPES = new Set([
    "brand_store", "concept_store", "independent_store", "subculture_store",
    "music_store", "specialty_store", "design_brand"
  ]);
  const RETAIL_SECTORS = new Set(["fashion", "design", "books", "music", "retail", "games_comics", "sports_retail"]);

  // Avled socialPlaceType fra et brand-objekt (brands_master). Deterministisk
  // prioritet: kaffe -> bok -> servering -> kultur -> butikk. Null = ikke et
  // sosialt brand (mote/smykker/luksus/jus/arkitektur osv.).
  function getSocialPlaceTypeForBrand(brand) {
    const b = obj(brand);
    const type = lower(b.brand_type);
    const kind = lower(b.brand_kind);
    const sector = lower(b.sector);

    // 1. coffee – rene kaffebrand (prioriteres alltid først).
    if (type === "coffee_brand" || /coffee/.test(sector)) return "coffee";

    // 2. book / library – bokhandel.
    if (type === "bookstore_brand" || sector === "books") return "book_library";

    // 3. hospitality / food – restaurant/servering/hotell.
    if (HOSPITALITY_BRAND_TYPES.has(type)) return "hospitality_food";
    if (kind === "restaurant" && (sector === "hospitality" || sector === "food_and_drink")) {
      return "hospitality_food";
    }

    // 4. culture – scene/musikk/galleri/museum/opera/nightlife-venue.
    if (CULTURE_BRAND_TYPES.has(type)) return "culture";
    if (type === "legendary_venue" && (kind === "bar_club" || sector === "nightlife")) return "culture";
    if (CULTURE_SECTORS.has(sector) && kind !== "restaurant") return "culture";

    // 5. retail_social – butikker som møteplass (kuraterte/konsept/independent).
    if (RETAIL_BRAND_TYPES.has(type)) return "retail_social";
    if (kind === "shop" && RETAIL_SECTORS.has(sector)) return "retail_social";

    return null;
  }

  // Bakoverkompatibelt alias.
  const socialPlaceTypeFor = getSocialPlaceTypeForBrand;

  // Er dette et brand vi i det hele tatt skal lage et sosialt sted av?
  function isSocialBrand(brand) {
    return getSocialPlaceTypeForBrand(brand) != null;
  }

  // Avled socialPlaceType fra et place-objekt (History Go source-data). Brukes
  // for place-only sosiale steder (park/byrom/bibliotek/sport).
  function getSocialPlaceTypeForPlace(place) {
    const p = obj(place);
    const category = lower(p.category);
    const pt = placeTypeOf(p);
    const id = lower(p.id);
    const name = lower(p.name);

    // Ekte biblioteksteder (Deichman m.fl.) – uavhengig av kategori.
    if (/deichman|bibliotek/.test(id) || /deichman|bibliotek/.test(name)) return "book_library";

    if (category === "sport") {
      // Ekte idretts-/fotballsteder (stadion/idrettspark/bane/arena), ikke
      // lekeplasser eller løse treningssteder.
      const SPORT_VENUE = new Set([
        "stadion", "idrettspark", "bane", "idrettsflate",
        "nasjonalanlegg", "kunstisbane", "ishall", "innendorsarena"
      ]);
      if (SPORT_VENUE.has(pt)) return "sport_football";
      return null;
    }

    if (category === "by") {
      if (pt === "park") return "park_public_space";
      const WALK = new Set([
        "plass", "torg", "gate", "gatekryss", "kryss",
        "omrade", "knutepunkt", "landskapsakse", "symbolsted"
      ]);
      if (WALK.has(pt)) return "city_walk";
      return null;
    }

    return null;
  }

  // Avled socialPlaceType for en konkret (placeId, brand, place)-kombinasjon.
  // Når et relevant brand finnes gir branden den sosiale identiteten; ellers
  // brukes selve stedet (place-only).
  function getSocialPlaceTypeForBrandPlace(placeId, brand, place) {
    void placeId;
    const fromBrand = getSocialPlaceTypeForBrand(brand);
    if (fromBrand) return fromBrand;
    return getSocialPlaceTypeForPlace(place);
  }

  // ---------------------------------------------------------------------------
  // Type-konfig-oppslag (rene)
  // ---------------------------------------------------------------------------
  function getTypeConfig(socialPlaceType) {
    return SOCIAL_TYPE_CONFIG[norm(socialPlaceType)] || null;
  }

  function getSocialPhaseAffinityForType(socialPlaceType) {
    const cfg = getTypeConfig(socialPlaceType);
    return cfg ? cfg.phaseAffinity.slice() : [];
  }

  function getSocialActivePhasesForType(socialPlaceType) {
    const cfg = getTypeConfig(socialPlaceType);
    return cfg ? cfg.activePhases.slice() : [];
  }

  function getSocialToneForType(socialPlaceType) {
    const cfg = getTypeConfig(socialPlaceType);
    return cfg ? cfg.tone.slice() : [];
  }

  function getSocialActivitiesForType(socialPlaceType) {
    const cfg = getTypeConfig(socialPlaceType);
    return cfg ? cfg.activities.slice() : [];
  }

  function getSocialPlaceTypeLabel(socialPlaceType) {
    const cfg = getTypeConfig(socialPlaceType);
    return cfg ? cfg.labelNb : "";
  }

  function getSocialPlaceTypeIcon(socialPlaceType) {
    const cfg = getTypeConfig(socialPlaceType);
    return cfg ? cfg.icon : "📍";
  }

  function getEngineTypeForSocialType(socialPlaceType) {
    const cfg = getTypeConfig(socialPlaceType);
    return cfg ? cfg.engineType : SOCIAL_PLACE_TYPE;
  }

  // Kort, deterministisk intro for stedskortet. Prioriterer ekte brand-desc,
  // ellers en typebasert frase med ekte sted-/brandnavn.
  function getSocialIntroForType(socialPlaceType, brand, place) {
    const b = obj(brand);
    const explicit = norm(b.popupdesc) || norm(b.desc);
    if (explicit) return explicit;

    const p = obj(place);
    const label = getSocialPlaceTypeLabel(socialPlaceType) || "sosialt sted";
    const placeLabel = norm(p.name) || norm(b.name) || "";
    const where = placeLabel ? (" ved " + placeLabel) : "";
    const TEMPLATES = {
      coffee: "Rolig kaffested" + where + ".",
      culture: "Kultursted" + where + " – scene, musikk eller kunst.",
      book_library: "Bok- og lesested" + where + ".",
      park_public_space: "Åpent byrom" + where + " – park eller plass.",
      sport_football: "Idrettssted" + where + ".",
      hospitality_food: "Serveringssted" + where + ".",
      retail_social: "Butikk som møteplass" + where + ".",
      city_walk: "Urbant byrom" + where + " for byvandring."
    };
    return TEMPLATES[norm(socialPlaceType)] || ("Sosialt sted (" + label + ")" + where + ".");
  }

  // ---------------------------------------------------------------------------
  // Indeksering av rådata (rene)
  // ---------------------------------------------------------------------------
  function indexBrandsById(brandMaster) {
    const byId = {};
    ensureArray(brandMaster).forEach((raw) => {
      const id = norm(raw && raw.id);
      if (id && !byId[id]) byId[id] = raw;
    });
    return byId;
  }

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

  function resolvePlaceList(opts) {
    const o = obj(opts);
    if (Array.isArray(o.places)) return o.places;
    if (o.placesById && typeof o.placesById === "object") {
      return Object.keys(o.placesById).map((k) => o.placesById[k]);
    }
    if (Array.isArray(_placesCache)) return _placesCache;
    const idx = _placesByIdCache || {};
    return Object.keys(idx).map((k) => idx[k]);
  }

  // brandId-er koblet til en placeId (rå id-er fra brands_by_place).
  function getBrandsForPlace(placeId, opts) {
    const pid = norm(placeId);
    if (!pid) return [];
    const byPlace = resolveByPlace(opts);
    return ensureArray(byPlace[pid]).map(norm).filter(Boolean);
  }

  function getBrandById(brandId, opts) {
    const id = norm(brandId);
    if (!id) return null;
    return resolveBrandIndex(opts)[id] || null;
  }

  function getPlaceById(placeId, opts) {
    const id = norm(placeId);
    if (!id) return null;
    return resolvePlaceIndex(opts)[id] || null;
  }

  // Sosiale brand-objekter koblet til en placeId. Brands som ikke finnes i
  // master, eller ikke er sosiale, filtreres bort.
  function getSocialBrandsForPlace(placeId, opts) {
    const brandIndex = resolveBrandIndex(opts);
    return getBrandsForPlace(placeId, opts)
      .map((id) => brandIndex[id])
      .filter(Boolean)
      .filter(isSocialBrand);
  }

  // ---------------------------------------------------------------------------
  // Bygg sosiale sted-modeller (rene)
  // ---------------------------------------------------------------------------
  function prettifyId(id) {
    const s = norm(id);
    if (!s) return "";
    return s.replace(/[_:]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Felles normalisering til runtime-modellen for ALLE sosiale steder.
  function normalizeSocialPlaceModel(fields) {
    const f = obj(fields);
    const socialPlaceType = norm(f.socialPlaceType);
    const cfg = getTypeConfig(socialPlaceType) || {};
    const locationId = norm(f.locationId);

    const model = {
      // Engine-kompatibel: CivicationFriendsEngine bruker .id som locationId og
      // .type for sosial-profil. Vi setter begge eksplisitt.
      id: locationId,
      locationId: locationId,
      sourcePlaceId: norm(f.sourcePlaceId) || null,
      brandId: norm(f.brandId) || null,
      label: norm(f.label),
      placeLabel: norm(f.placeLabel),
      type: cfg.engineType || SOCIAL_PLACE_TYPE,
      socialPlaceType: socialPlaceType,
      icon: cfg.icon || "📍",
      channel: SOCIAL_CHANNEL,
      phaseAffinity: (cfg.phaseAffinity || []).slice(),
      activePhases: (cfg.activePhases || []).slice(),
      availableActivities: (cfg.activities || []).slice(),
      conversationTone: (cfg.tone || []).slice(),
      brandType: norm(f.brandType),
      sector: norm(f.sector),
      intro: norm(f.intro),
      description: norm(f.description) || norm(f.intro),
      source: norm(f.source)
    };

    if (Object.prototype.hasOwnProperty.call(f, "lat") && f.lat != null) model.lat = f.lat;
    if (Object.prototype.hasOwnProperty.call(f, "lon") && f.lon != null) model.lon = f.lon;
    if (norm(f.category)) model.category = norm(f.category);
    model.placeFound = !!f.placeFound;

    return model;
  }

  // Bygg én sosial sted-modell fra en (placeId, brand, place). place er valgfri
  // (History Go source-data for placeId). Ren, deterministisk.
  function buildSocialPlaceFromBrandPlace(placeId, brand, place) {
    const pid = norm(placeId);
    const b = obj(brand);
    const brandId = norm(b.id);
    if (!pid || !brandId) return null;

    const socialPlaceType = getSocialPlaceTypeForBrand(b);
    if (!socialPlaceType) return null;

    const p = obj(place);
    const placeLabel = norm(p.name) || prettifyId(pid);
    const brandLabel = norm(b.name) || prettifyId(brandId);
    const intro = getSocialIntroForType(socialPlaceType, b, p);
    const locationId = LOCATION_ID_PREFIX + ":" + pid + ":" + brandId;

    return normalizeSocialPlaceModel({
      locationId: locationId,
      sourcePlaceId: pid,
      brandId: brandId,
      label: brandLabel,
      placeLabel: placeLabel,
      socialPlaceType: socialPlaceType,
      brandType: norm(b.brand_type),
      sector: norm(b.sector),
      intro: intro,
      description: intro,
      source: SOURCE,
      lat: Object.prototype.hasOwnProperty.call(p, "lat") ? p.lat : null,
      lon: Object.prototype.hasOwnProperty.call(p, "lon") ? p.lon : null,
      category: norm(p.category),
      placeFound: !!norm(p.name)
    });
  }

  // Bygg én place-only sosial sted-modell fra et ekte place (park/byrom/sport/
  // bibliotek uten relevant brand). Ren, deterministisk.
  function buildSocialPlaceFromPlace(place) {
    const p = obj(place);
    const pid = norm(p.id);
    if (!pid) return null;

    const socialPlaceType = getSocialPlaceTypeForPlace(p);
    if (!socialPlaceType) return null;

    const placeLabel = norm(p.name) || prettifyId(pid);
    const intro = getSocialIntroForType(socialPlaceType, null, p);
    const locationId = PLACE_LOCATION_ID_PREFIX + ":" + pid;

    return normalizeSocialPlaceModel({
      locationId: locationId,
      sourcePlaceId: pid,
      brandId: null,
      label: placeLabel,
      placeLabel: placeLabel,
      socialPlaceType: socialPlaceType,
      brandType: "",
      sector: "",
      intro: intro,
      description: intro,
      source: PLACE_SOURCE,
      lat: Object.prototype.hasOwnProperty.call(p, "lat") ? p.lat : null,
      lon: Object.prototype.hasOwnProperty.call(p, "lon") ? p.lon : null,
      category: norm(p.category),
      placeFound: true
    });
  }

  // ---------------------------------------------------------------------------
  // Resolvere (rene, dedupliserte)
  // ---------------------------------------------------------------------------
  // Brand-baserte sosiale steder. Itererer KUN over brands_by_place -> hvert
  // sted har garantert en ekte placeId. Dedupliserer på locationId.
  //
  // options:
  //   onlyType: filtrer til én socialPlaceType ("coffee", "hospitality_food" …).
  //   types:    array av socialPlaceType-er å inkludere.
  //   includeHospitality (default true): bakoverkompatibel – sett false for å
  //     droppe hospitality_food (PR #1200-semantikk).
  function resolveCivicationSocialPlacesFromBrands(opts) {
    const o = obj(opts);
    const onlyType = norm(o.onlyType) || null;
    const typeFilter = Array.isArray(o.types) ? new Set(o.types.map(norm)) : null;
    const includeHospitality = o.includeHospitality !== false;

    const byPlace = resolveByPlace(o);
    const brandIndex = resolveBrandIndex(o);
    const placeIndex = resolvePlaceIndex(o);

    const seen = new Set();
    const out = [];

    Object.keys(byPlace).sort().forEach((placeId) => {
      const pid = norm(placeId);
      if (!pid) return;
      const place = placeIndex[pid] || null;
      ensureArray(byPlace[placeId]).map(norm).filter(Boolean).forEach((brandId) => {
        const brand = brandIndex[brandId];
        if (!brand) return;
        const type = getSocialPlaceTypeForBrand(brand);
        if (!type) return;
        if (type === "hospitality_food" && !includeHospitality) return;
        if (onlyType && type !== onlyType) return;
        if (typeFilter && !typeFilter.has(type)) return;

        const model = buildSocialPlaceFromBrandPlace(pid, brand, place);
        if (!model) return;
        if (seen.has(model.locationId)) return; // ingen duplikater
        seen.add(model.locationId);
        out.push(model);
      });
    });

    return out.sort(sortCoffeeFirst);
  }

  // Place-only sosiale steder (park/byrom/sport/bibliotek). Itererer over
  // place-source og klassifiserer hvert sted. Dedupliserer på locationId.
  function resolveCivicationSocialPlacesFromPlaces(opts) {
    const o = obj(opts);
    const onlyType = norm(o.onlyType) || null;
    const typeFilter = Array.isArray(o.types) ? new Set(o.types.map(norm)) : null;

    const places = resolvePlaceList(o).slice();
    // Stabil rekkefølge: alfabetisk på placeId.
    places.sort((a, b) => {
      const ai = norm(a && a.id);
      const bi = norm(b && b.id);
      return ai < bi ? -1 : (ai > bi ? 1 : 0);
    });

    const seen = new Set();
    const out = [];
    places.forEach((place) => {
      const type = getSocialPlaceTypeForPlace(place);
      if (!type) return;
      if (onlyType && type !== onlyType) return;
      if (typeFilter && !typeFilter.has(type)) return;
      const model = buildSocialPlaceFromPlace(place);
      if (!model) return;
      if (seen.has(model.locationId)) return;
      seen.add(model.locationId);
      out.push(model);
    });
    return out;
  }

  // Alle sosiale steder (brand-baserte + place-only), dedup på locationId.
  function resolveAllCivicationSocialPlaces(opts) {
    const fromBrands = resolveCivicationSocialPlacesFromBrands(opts);
    const fromPlaces = resolveCivicationSocialPlacesFromPlaces(opts);
    const seen = new Set();
    const out = [];
    fromBrands.concat(fromPlaces).forEach((m) => {
      if (!m || seen.has(m.locationId)) return;
      seen.add(m.locationId);
      out.push(m);
    });
    return out;
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

  // Kun servering/restaurant-steder (hospitality_food).
  function getHospitalitySocialPlaces(opts) {
    return resolveCivicationSocialPlacesFromBrands({ ...obj(opts), onlyType: "hospitality_food" });
  }

  // Alle sosiale steder av én type (brand-baserte og/eller place-only).
  function getSocialPlacesByType(socialPlaceType, opts) {
    const type = norm(socialPlaceType);
    if (!type) return [];
    return resolveAllCivicationSocialPlaces(opts).filter((m) => m.socialPlaceType === type);
  }

  // Alle sosiale steder med fase-affinitet for en gitt (semantisk eller dag-)
  // fase. Matcher mot phaseAffinity via CivicationFriendsEngine når den finnes.
  function getSocialPlacesForPhase(phase, opts) {
    const ph = normalizeSnapshotPhase(phase);
    return resolveAllCivicationSocialPlaces(opts)
      .filter((m) => ensureArray(m.phaseAffinity).indexOf(ph) !== -1);
  }

  // Ett sosialt sted ut fra en (avledet) locationId – søker både brand-place og
  // place-only.
  function getSocialPlaceByLocationId(locationId, opts) {
    const lid = norm(locationId);
    if (!lid) return null;
    return resolveAllCivicationSocialPlaces(opts).find((m) => m.locationId === lid) || null;
  }

  function normalizeSnapshotPhase(phase) {
    const eng = window.CivicationFriendsEngine;
    if (eng && typeof eng.normalizeSnapshotPhase === "function") {
      return eng.normalizeSnapshotPhase(phase);
    }
    const p = lower(phase);
    if (["morning", "work", "leisure", "evening", "reflection"].includes(p)) return p;
    const DAY = { morning: "morning", lunch: "work", afternoon: "leisure", evening: "evening", day_end: "evening" };
    return DAY[p] || "morning";
  }

  // ---------------------------------------------------------------------------
  // Integrasjon med CivicationFriendsEngine
  // ---------------------------------------------------------------------------
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
  // UI: stedskort-header for et sosialt sted (ren, testbar – ingen DOM)
  // ---------------------------------------------------------------------------
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

  // Norsk label for socialPlaceType (kapitalisert for kicker).
  function socialTypeKicker(socialPlaceType) {
    const label = getSocialPlaceTypeLabel(socialPlaceType);
    if (!label) return "Sted";
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  // Stedskort-header for et sosialt sted (brand-place ELLER place-only). Viser
  // socialPlaceType-label, brandnavn (når brand-place), ekte stednavn, fase og
  // kort intro. Selve møtelisten ("Folk som også valgte …") rendres av
  // CivicationCityLayer.
  function buildSocialPlaceHeaderHtml(place, phase) {
    const sp = obj(place);
    const esc = escapeHtml;
    const phaseLbl = phaseLabel(phase);
    const intro = norm(sp.intro) || norm(sp.description);
    const typeLabel = socialTypeKicker(sp.socialPlaceType);
    const icon = getSocialPlaceTypeIcon(sp.socialPlaceType);
    const heading = norm(sp.label) || norm(sp.placeLabel) || norm(sp.brandId) || norm(sp.sourcePlaceId);
    // "Kaffe · Universitetsplassen": type-label + tilknyttet ekte sted.
    const placeLine = typeLabel + " · " + (norm(sp.placeLabel) || norm(sp.sourcePlaceId));

    return '<div class="civi-city-brand-place">' +
      '<div class="civi-city-detail-kicker">' + esc(icon) + " " + esc(typeLabel) + "</div>" +
      "<h3>" + esc(heading) + "</h3>" +
      '<p class="civi-city-brand-place-link">' + esc(placeLine) + "</p>" +
      (phaseLbl ? '<p class="civi-city-brand-place-phase">' + esc(phaseLbl) + "</p>" : "") +
      (intro ? '<p class="civi-city-detail-desc">' + esc(intro) + "</p>" : "") +
      "</div>";
  }

  // Bakoverkompatibelt navn (PR #1200): brand-place-header.
  const buildBrandPlaceHeaderHtml = buildSocialPlaceHeaderHtml;

  // Er en location et brand-sosialsted (har både brandId og sourcePlaceId)?
  function isBrandSocialPlace(location) {
    const l = obj(location);
    return !!(norm(l.brandId) && norm(l.sourcePlaceId));
  }

  // Er en location et place-only sosialsted (sourcePlaceId + socialPlaceType,
  // ingen brand)?
  function isPlaceSocialPlace(location) {
    const l = obj(location);
    return !norm(l.brandId) && !!norm(l.sourcePlaceId) && !!norm(l.socialPlaceType);
  }

  // Er en location et hvilket som helst ekte sosialt sted (fra resolveren)?
  function isSocialPlace(location) {
    return isBrandSocialPlace(location) || isPlaceSocialPlace(location);
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
  // ALDRI som kilde.
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

  async function init() {
    await Promise.all([loadBrandPlaceMap(), loadBrandMaster(), loadPlaces()]);
    return {
      byPlace: _byPlaceCache,
      brandMaster: _brandMasterCache,
      places: _placesCache
    };
  }

  // Async bekvemmelighet: last alt og resolve (brand-baserte som standard).
  async function loadSocialPlaces(opts) {
    await init();
    return resolveCivicationSocialPlacesFromBrands(opts);
  }

  // Async bekvemmelighet: last alt og resolve ALLE sosiale steder.
  async function loadAllSocialPlaces(opts) {
    await init();
    return resolveAllCivicationSocialPlaces(opts);
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
    PLACE_LOCATION_ID_PREFIX,
    SOURCE,
    PLACE_SOURCE,
    SOCIAL_PLACE_TYPE,
    SOCIAL_CHANNEL,
    SOCIAL_PLACE_TYPES: SOCIAL_PLACE_TYPES.slice(),
    SOCIAL_TYPE_CONFIG: JSON.parse(JSON.stringify(SOCIAL_TYPE_CONFIG)),
    COFFEE_PHASE_AFFINITY: COFFEE_PHASE_AFFINITY.slice(),
    COFFEE_ACTIVE_PHASES: COFFEE_ACTIVE_PHASES.slice(),
    HOSPITALITY_SECTORS: [...HOSPITALITY_SECTORS],
    // klassifisering (rene)
    isCoffeeBrand,
    isCafeVenueBrand,
    isSocialBrand,
    socialPlaceTypeFor,
    getSocialPlaceTypeForBrand,
    getSocialPlaceTypeForPlace,
    getSocialPlaceTypeForBrandPlace,
    // type-konfig (rene)
    getSocialPhaseAffinityForType,
    getSocialActivePhasesForType,
    getSocialToneForType,
    getSocialActivitiesForType,
    getSocialPlaceTypeLabel,
    getSocialPlaceTypeIcon,
    getEngineTypeForSocialType,
    getSocialIntroForType,
    // indeksering (rene)
    indexBrandsById,
    indexPlacesById,
    // oppslag (rene)
    getBrandsForPlace,
    getBrandById,
    getPlaceById,
    getSocialBrandsForPlace,
    // bygging / resolve (rene)
    buildSocialPlaceFromBrandPlace,
    buildSocialPlaceFromPlace,
    resolveCivicationSocialPlacesFromBrands,
    resolveCivicationSocialPlacesFromPlaces,
    resolveAllCivicationSocialPlaces,
    getCoffeeSocialPlaces,
    getHospitalitySocialPlaces,
    getSocialPlacesByType,
    getSocialPlacesForPhase,
    getSocialPlaceByLocationId,
    // integrasjon
    mergeSocialPlacesIntoLocations,
    isBrandSocialPlace,
    isPlaceSocialPlace,
    isSocialPlace,
    // UI (ren, testbar)
    buildSocialPlaceHeaderHtml,
    buildBrandPlaceHeaderHtml,
    // async lasting (browser)
    loadBrandPlaceMap,
    loadBrandMaster,
    loadPlaces,
    init,
    loadSocialPlaces,
    loadAllSocialPlaces,
    clearCacheForTesting
  };
})();
