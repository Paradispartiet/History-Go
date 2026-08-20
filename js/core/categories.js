(() => {
  // js/core/categories.ts
  var win = window;
  var CATEGORY_LIST = [
    { id: "historie", name: "Historie", icon: "\u{1F3DB}\uFE0F", color: "#603E1E", secondaryColor: "#533217", scope: "runtime_domain" },
    { id: "religion", name: "Religion", icon: "\u{1F6D0}", color: "#d7b46a", secondaryColor: "#151B28", scope: "runtime_domain" },
    { id: "vitenskap", name: "Vitenskap & teknologi", icon: "\u{1F52C}", color: "#6A5AE0", secondaryColor: "#332B51", scope: "runtime_domain", aliases: ["Vitenskap", "Teknologi", "Technology", "Tech", "IT", "Informasjonsteknologi"] },
    { id: "filosofi", name: "Filosofi", icon: "\u03A6", color: "#7A5FD0", secondaryColor: "#3E2E73", scope: "runtime_domain" },
    { id: "kunst", name: "Kunst", icon: "\u{1F3A8}", color: "#0057B8", secondaryColor: "#D71920", scope: "runtime_domain" },
    { id: "scenekunst", name: "Scenekunst", icon: "\u{1F3AD}", color: "#B35C9E", secondaryColor: "#3A1836", scope: "runtime_domain" },
    { id: "musikk", name: "Musikk", icon: "\u{1F3B5}", color: "#122033", secondaryColor: "#121E2B", scope: "runtime_domain" },
    { id: "natur", name: "Natur & milj\xF8", icon: "\u{1F33F}", color: "#2E4F21", secondaryColor: "#DC7A04", scope: "runtime_domain" },
    { id: "sport", name: "Sport & lek", icon: "\u26BD", color: "#FFFFFF", secondaryColor: "#A51E15", scope: "runtime_domain" },
    { id: "by", name: "By & arkitektur", icon: "\u{1F3D9}\uFE0F", color: "#A1917E", secondaryColor: "#3C3731", scope: "runtime_domain" },
    { id: "politikk", name: "Politikk & samfunn", icon: "\u{1F3DB}\uFE0F", color: "#103E71", secondaryColor: "#114A84", scope: "runtime_domain" },
    { id: "subkultur", name: "Subkultur", icon: "\u{1F9F7}", color: "#292625", secondaryColor: "#E78847", scope: "runtime_domain" },
    { id: "litteratur", name: "Spr\xE5k & litteratur", icon: "\u{1F4DA}", color: "#E1BE70", secondaryColor: "#C0964A", scope: "runtime_domain", aliases: ["Litteratur"] },
    { id: "naeringsliv", name: "\xD8konomi og n\xE6ringsliv", icon: "\u{1F3ED}", color: "#0E3290", secondaryColor: "#AFB0B0", scope: "runtime_domain", aliases: ["N\xE6ringsliv", "N\xE6ringsliv & industri", "\xD8konomi", "\xD8konomi & n\xE6ringsliv"] },
    { id: "psykologi", name: "Psykologi", icon: "\u{1F9E0}", color: "#06d6a0", scope: "runtime_domain" },
    { id: "helse", name: "Helse & medisin", icon: "\u2695\uFE0F", color: "#0B7A75", secondaryColor: "#073B4C", scope: "runtime_domain", aliases: ["Helse", "Medisin", "Medicine", "Health"] },
    { id: "utdanning", name: "Skole & utdanning", icon: "\u{1F393}", color: "#8A5A00", secondaryColor: "#3D2C0F", scope: "runtime_domain", aliases: ["Skole", "Utdanning", "Education"] },
    { id: "film_tv", name: "Film & TV", icon: "\u{1F39E}\uFE0F", color: "#6c757d", scope: "runtime_domain" },
    { id: "media", name: "Medier", icon: "\u{1F5DE}\uFE0F", color: "#22B8B5", secondaryColor: "#123B4A", scope: "runtime_domain" }
  ];
  var CAT_BY_ID = /* @__PURE__ */ Object.create(null);
  var CAT_BY_NAME = /* @__PURE__ */ Object.create(null);
  for (const category of CATEGORY_LIST) {
    CAT_BY_ID[category.id] = category;
    CAT_BY_NAME[category.name.trim().toLowerCase()] = category;
    for (const alias of category.aliases || []) {
      CAT_BY_NAME[alias.trim().toLowerCase()] = category;
    }
  }
  function norm(value) {
    return String(value != null ? value : "").trim();
  }
  var CATEGORY_ID_ALIASES = Object.freeze({
    teknologi: "vitenskap",
    technology: "vitenskap",
    tech: "vitenskap",
    it: "vitenskap",
    informasjonsteknologi: "vitenskap",
    health: "helse",
    medicine: "helse",
    medisin: "helse",
    education: "utdanning",
    skole: "utdanning"
  });
  function canonicalCategoryId(value) {
    const normalized = norm(value).toLowerCase();
    return CATEGORY_ID_ALIASES[normalized] || normalized;
  }
  function catColor(categoryId) {
    const category = CAT_BY_ID[canonicalCategoryId(categoryId)];
    return (category == null ? void 0 : category.color) || "#6c757d";
  }
  function catSecondaryColor(categoryId) {
    const category = CAT_BY_ID[canonicalCategoryId(categoryId)];
    return (category == null ? void 0 : category.secondaryColor) || (category == null ? void 0 : category.color) || "#6c757d";
  }
  function catClass(categoryId) {
    const id = canonicalCategoryId(categoryId).replace(/[^a-z0-9_]+/g, "-");
    return id ? `cat-${id}` : "cat-unknown";
  }
  function tagToCat(tag) {
    var _a, _b, _c;
    const normalizedTag = norm(tag);
    if (!normalizedTag) return null;
    const canonicalTag = canonicalCategoryId(normalizedTag);
    if (CAT_BY_ID[canonicalTag]) return canonicalTag;
    const registry = win.TAGS_REGISTRY;
    const entry = registry && typeof registry === "object" ? registry[normalizedTag] : null;
    if (entry && typeof entry === "object") {
      const categoryId = canonicalCategoryId((_c = (_b = (_a = entry.cat) != null ? _a : entry.category) != null ? _b : entry.categoryId) != null ? _c : entry.category_id);
      if (categoryId && CAT_BY_ID[categoryId]) return categoryId;
    }
    return null;
  }
  function catIdFromDisplay(display) {
    const normalizedDisplay = norm(display).toLowerCase();
    if (!normalizedDisplay) return null;
    const canonicalDisplay = canonicalCategoryId(normalizedDisplay);
    if (CAT_BY_ID[canonicalDisplay]) return canonicalDisplay;
    if (CAT_BY_NAME[normalizedDisplay]) return CAT_BY_NAME[normalizedDisplay].id;
    for (const category of CATEGORY_LIST) {
      if (category.name.toLowerCase() === normalizedDisplay) return category.id;
    }
    return null;
  }
  win.CATEGORY_LIST = CATEGORY_LIST;
  win.catColor = catColor;
  win.catSecondaryColor = catSecondaryColor;
  win.catClass = catClass;
  win.tagToCat = tagToCat;
  win.catIdFromDisplay = catIdFromDisplay;
})();
