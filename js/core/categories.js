(() => {
  // js/core/categories.ts
  var win = window;
  var CATEGORY_LIST = [
    { id: "historie", name: "Historie", icon: "\u{1F3DB}\uFE0F", color: "#603E1E", secondaryColor: "#533217", scope: "runtime_domain" },
    { id: "religion", name: "Religion", icon: "\u{1F6D0}", color: "#d7b46a", secondaryColor: "#151B28", scope: "runtime_domain" },
    { id: "vitenskap", name: "Vitenskap & filosofi", icon: "\u{1F9EA}", color: "#332B51", secondaryColor: "#413E17", scope: "runtime_domain" },
    { id: "kunst", name: "Kunst", icon: "\u{1F3A8}", color: "#DFB020", secondaryColor: "#1D3E5F", scope: "runtime_domain" },
    { id: "scenekunst", name: "Scenekunst", icon: "\u{1F3AD}", color: "#B35C9E", secondaryColor: "#3A1836", scope: "runtime_domain" },
    { id: "musikk", name: "Musikk", icon: "\u{1F3B5}", color: "#122033", secondaryColor: "#121E2B", scope: "runtime_domain" },
    { id: "natur", name: "Natur & milj\xF8", icon: "\u{1F33F}", color: "#2E4F21", secondaryColor: "#DC7A04", scope: "runtime_domain" },
    { id: "sport", name: "Sport & lek", icon: "\u26BD", color: "#A01D13", secondaryColor: "#A51E15", scope: "runtime_domain" },
    { id: "by", name: "By & arkitektur", icon: "\u{1F3D9}\uFE0F", color: "#A1917E", secondaryColor: "#3C3731", scope: "runtime_domain" },
    { id: "politikk", name: "Politikk & samfunn", icon: "\u{1F3DB}\uFE0F", color: "#103E71", secondaryColor: "#114A84", scope: "runtime_domain" },
    { id: "subkultur", name: "Subkultur", icon: "\u{1F9F7}", color: "#292625", secondaryColor: "#E78847", scope: "runtime_domain" },
    { id: "litteratur", name: "Litteratur", icon: "\u{1F4DA}", color: "#E1BE70", secondaryColor: "#C0964A", scope: "runtime_domain" },
    { id: "naeringsliv", name: "N\xE6ringsliv", icon: "\u{1F3ED}", color: "#0E3290", secondaryColor: "#AFB0B0", scope: "runtime_domain" },
    { id: "psykologi", name: "Psykologi", icon: "\u{1F9E0}", color: "#06d6a0", scope: "runtime_domain" },
    { id: "film_tv", name: "Film & TV", icon: "\u{1F39E}\uFE0F", color: "#6c757d", scope: "runtime_domain" },
    { id: "media", name: "Medier", icon: "\u{1F5DE}\uFE0F", color: "#ff595e", scope: "runtime_domain" },
    {
      id: "populaerkultur",
      name: "Popul\xE6rkultur",
      icon: "\u{1F4FA}",
      color: "#41206E",
      secondaryColor: "#1C3463",
      scope: "runtime_domain_alias",
      canonicalFagId: "popkultur",
      aliases: ["popkultur"]
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
  function catSecondaryColor(categoryId) {
    const category = CAT_BY_ID[norm(categoryId)];
    return (category == null ? void 0 : category.secondaryColor) || (category == null ? void 0 : category.color) || "#6c757d";
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
  win.CATEGORY_LIST = CATEGORY_LIST;
  win.catColor = catColor;
  win.catSecondaryColor = catSecondaryColor;
  win.catClass = catClass;
  win.tagToCat = tagToCat;
  win.catIdFromDisplay = catIdFromDisplay;
})();
