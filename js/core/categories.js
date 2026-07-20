(() => {
  // js/core/categories.ts
  var win = window;
  var CATEGORY_LIST = [
    { id: "historie", name: "Historie", icon: "\u{1F3DB}\uFE0F", color: "#f6c800", scope: "runtime_domain" },
    { id: "religion", name: "Religion", icon: "\u{1F6D0}", color: "#d7b46a", scope: "runtime_domain" },
    { id: "vitenskap", name: "Vitenskap & filosofi", icon: "\u{1F9EA}", color: "#6ee7ff", scope: "runtime_domain" },
    { id: "kunst", name: "Kunst & kultur", icon: "\u{1F3A8}", color: "#ff5aa5", scope: "runtime_domain" },
    { id: "musikk", name: "Musikk & scenekunst", icon: "\u{1F3AD}", color: "#b48cff", scope: "runtime_domain" },
    { id: "natur", name: "Natur & milj\xF8", icon: "\u{1F33F}", color: "#59d36a", scope: "runtime_domain" },
    { id: "sport", name: "Sport & lek", icon: "\u26BD", color: "#ff8a3d", scope: "runtime_domain" },
    { id: "by", name: "By & arkitektur", icon: "\u{1F3D9}\uFE0F", color: "#7fb3ff", scope: "runtime_domain" },
    { id: "politikk", name: "Politikk & samfunn", icon: "\u{1F3DB}\uFE0F", color: "#ffd27a", scope: "runtime_domain" },
    { id: "subkultur", name: "Subkultur", icon: "\u{1F9F7}", color: "#9b7bff", scope: "runtime_domain" },
    { id: "litteratur", name: "Litteratur", icon: "\u{1F4DA}", color: "#ffcc66", scope: "runtime_domain" },
    { id: "naeringsliv", name: "N\xE6ringsliv", icon: "\u{1F3ED}", color: "#9ad0c2", scope: "runtime_domain" },
    { id: "psykologi", name: "Psykologi", icon: "\u{1F9E0}", color: "#ff9aa2", scope: "runtime_domain" },
    { id: "film_tv", name: "Film & TV", icon: "\u{1F39E}\uFE0F", color: "#6c757d", scope: "runtime_domain" },
    { id: "media", name: "Medier", icon: "\u{1F5DE}\uFE0F", color: "#c0c0c0", scope: "runtime_domain" },
    {
      id: "populaerkultur",
      name: "Popul\xE6rkultur",
      icon: "\u{1F4FA}",
      color: "#a0a0a0",
      scope: "runtime_domain_alias",
      canonicalFagId: "popkultur",
      aliases: ["popkultur"]
    },
    {
      id: "scenekunst",
      name: "Scenekunst",
      icon: "\u{1F3AD}",
      color: "#c59cff",
      scope: "subfield_display",
      parentId: "kunst",
      canonicalFagId: "kunst"
    }
  ];
  var CAT_BY_ID = /* @__PURE__ */ Object.create(null);
  var CAT_BY_NAME = /* @__PURE__ */ Object.create(null);
  for (const category of CATEGORY_LIST) {
    CAT_BY_ID[category.id] = category;
    CAT_BY_NAME[category.name.trim().toLowerCase()] = category;
  }
  function norm(value) {
    return String(value != null ? value : "").trim();
  }
  function catColor(categoryId) {
    const category = CAT_BY_ID[norm(categoryId)];
    return (category == null ? void 0 : category.color) || "#6c757d";
  }
  function catClass(categoryId) {
    const id = norm(categoryId).toLowerCase().replace(/[^a-z0-9_]+/g, "-");
    return id ? `cat-${id}` : "cat-unknown";
  }
  function tagToCat(tag) {
    var _a, _b, _c;
    const normalizedTag = norm(tag);
    if (!normalizedTag) return null;
    if (CAT_BY_ID[normalizedTag]) return normalizedTag;
    const registry = win.TAGS_REGISTRY;
    const entry = registry && typeof registry === "object" ? registry[normalizedTag] : null;
    if (entry && typeof entry === "object") {
      const categoryId = norm((_c = (_b = (_a = entry.cat) != null ? _a : entry.category) != null ? _b : entry.categoryId) != null ? _c : entry.category_id);
      if (categoryId && CAT_BY_ID[categoryId]) return categoryId;
    }
    return null;
  }
  function catIdFromDisplay(display) {
    const normalizedDisplay = norm(display).toLowerCase();
    if (!normalizedDisplay) return null;
    if (CAT_BY_ID[normalizedDisplay]) return normalizedDisplay;
    if (CAT_BY_NAME[normalizedDisplay]) return CAT_BY_NAME[normalizedDisplay].id;
    for (const category of CATEGORY_LIST) {
      if (category.name.toLowerCase() === normalizedDisplay) return category.id;
    }
    return null;
  }
  function normalizeReligiousText(value) {
    return String(value != null ? value : "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\xE6/g, "ae")
      .replace(/\xF8/g, "o")
      .replace(/\xE5/g, "a")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }
  var RELIGIOUS_PLACE_RE = /(?:^|\s)(?:kirke|kirken|kyrkje|kyrkja|kyrkjestad|domkirke|domkyrkje|katedral|cathedral|church|chapel|kapell|basilika|basilica|moske|mosque|masjid|synagoge|synagogue|tempel|temple|kloster|monastery|abbey|convent|mosteiro|igreja|catedral|capela|mesquita|sinagoga|santuario|helligdom|shrine|gravlund|kirkegard|kyrkjegard|churchyard|cemetery|graveyard|prestegard|prestebustad|steinkross)(?:\s|$)/;
  function isReligiousPlace(place) {
    if (!place || typeof place !== "object" || Array.isArray(place)) return false;
    if (norm(place.category) === "religion") return true;
    const identity = [
      place.id,
      place.name,
      place.placeType,
      place.place_type,
      place.subtype,
      place.assetType,
      place.type
    ].map(normalizeReligiousText).filter(Boolean).join(" ");
    return RELIGIOUS_PLACE_RE.test(identity);
  }
  function normalizeReligiousPlace(place) {
    if (!isReligiousPlace(place)) return place;
    if (place.category === "religion" && !Object.prototype.hasOwnProperty.call(place, "secondaryBadgeIds")) return place;
    const normalized = { ...place, category: "religion" };
    delete normalized.secondaryBadgeIds;
    return normalized;
  }
  function normalizeReligiousPayload(payload) {
    if (Array.isArray(payload)) return payload.map(normalizeReligiousPlace);
    if (!payload || typeof payload !== "object") return payload;
    if (Array.isArray(payload.places)) {
      return { ...payload, places: payload.places.map(normalizeReligiousPlace) };
    }
    if (typeof payload.id === "string" && (Object.prototype.hasOwnProperty.call(payload, "category") || Object.prototype.hasOwnProperty.call(payload, "lat"))) {
      return normalizeReligiousPlace(payload);
    }
    return payload;
  }
  function installDataHubCategoryPolicy(dataHub) {
    if (!dataHub || dataHub.__hgReligionCategoryPolicyInstalled) return;
    const loaderNames = ["loadPlacesBase", "loadPlaces", "loadFullPlace", "getPlaceEnriched", "loadEnrichedAll"];
    for (const loaderName of loaderNames) {
      const original = dataHub[loaderName];
      if (typeof original !== "function") continue;
      dataHub[loaderName] = async (...args) => {
        const result = await Reflect.apply(original, dataHub, args);
        return normalizeReligiousPayload(result);
      };
    }
    dataHub.__hgReligionCategoryPolicyInstalled = true;
  }
  function installDataHubWatcher() {
    if (win.DataHub) {
      installDataHubCategoryPolicy(win.DataHub);
      return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(win, "DataHub");
    if (descriptor && descriptor.configurable === false) return;
    Object.defineProperty(win, "DataHub", {
      configurable: true,
      enumerable: true,
      get() {
        return void 0;
      },
      set(value) {
        Object.defineProperty(win, "DataHub", {
          configurable: true,
          enumerable: true,
          writable: true,
          value
        });
        installDataHubCategoryPolicy(value);
      }
    });
  }
  win.CATEGORY_LIST = CATEGORY_LIST;
  win.catColor = catColor;
  win.catClass = catClass;
  win.tagToCat = tagToCat;
  win.catIdFromDisplay = catIdFromDisplay;
  win.HGPlaceCategoryPolicy = {
    isReligiousPlace,
    normalizePlace: normalizeReligiousPlace,
    normalizePlaces: normalizeReligiousPayload
  };
  installDataHubWatcher();
})();
