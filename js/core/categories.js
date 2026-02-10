// js/core/categories.js
// ------------------------------------------------------
// KATEGORIER (GLOBAL, IKKE MODULE)
// ------------------------------------------------------

(function () {
  const CATEGORY_LIST = [
    { id: "historie",       name: "Historie",               icon: "🏛️", color: "#f6c800" },
    { id: "vitenskap",      name: "Vitenskap & filosofi",   icon: "🧪", color: "#6ee7ff" },
    { id: "kunst",          name: "Kunst & kultur",         icon: "🎨", color: "#ff5aa5" },
    { id: "musikk",         name: "Musikk & scenekunst",    icon: "🎭", color: "#b48cff" },
    { id: "natur",          name: "Natur & miljø",          icon: "🌿", color: "#59d36a" },
    { id: "sport",          name: "Sport & lek",            icon: "⚽", color: "#ff8a3d" },
    { id: "by",             name: "By & arkitektur",        icon: "🏙️", color: "#7fb3ff" },
    { id: "politikk",       name: "Politikk & samfunn",     icon: "🏛️", color: "#ffd27a" },
    { id: "populaerkultur", name: "Populærkultur",          icon: "📺", color: "#a0a0a0" },
    { id: "subkultur",      name: "Subkultur",              icon: "🧷", color: "#9b7bff" },

    // Ekstra domener du allerede har i filregistrene dine:
    { id: "litteratur",     name: "Litteratur",             icon: "📚", color: "#ffcc66" },
    { id: "naeringsliv",    name: "Næringsliv",             icon: "🏭", color: "#9ad0c2" },
    { id: "film_tv",        name: "Film & TV",              icon: "🎞️", color: "#6c757d" },
    { id: "scenekunst",     name: "Scenekunst",             icon: "🎭", color: "#c59cff" },
    { id: "media",          name: "Medier",                 icon: "🗞️", color: "#c0c0c0" },
    { id: "psykologi",      name: "Psykologi",              icon: "🧠", color: "#ff9aa2" }
  ];

  const CAT_BY_ID = Object.create(null);
  const CAT_BY_NAME = Object.create(null);

  for (const c of CATEGORY_LIST) {
    CAT_BY_ID[c.id] = c;
    CAT_BY_NAME[String(c.name || "").trim().toLowerCase()] = c;
  }

  function norm(s) {
    return String(s ?? "").trim();
  }

  function catColor(catId) {
    const id = norm(catId);
    return (CAT_BY_ID[id] && CAT_BY_ID[id].color) ? CAT_BY_ID[id].color : "#6c757d";
  }

  function catClass(catId) {
    const id = norm(catId).toLowerCase().replace(/[^a-z0-9_]+/g, "-");
    return id ? `cat-${id}` : "cat-unknown";
  }

  // Robust: forsøker å mappe vilkårlig "tag" til en kategori-id
  // Støtter:
  //  - tag === kategori-id
  //  - TAGS_REGISTRY[tag] = { cat:"historie" } eller { category:"historie" } eller { categoryId:"historie" }
  function tagToCat(tag) {
    const t = norm(tag);
    if (!t) return null;

    if (CAT_BY_ID[t]) return t;

    const reg = (window.TAGS_REGISTRY && typeof window.TAGS_REGISTRY === "object")
      ? window.TAGS_REGISTRY
      : null;

    const entry = reg ? reg[t] : null;
    if (entry && typeof entry === "object") {
      const cid = norm(entry.cat || entry.category || entry.categoryId || entry.category_id);
      if (cid && CAT_BY_ID[cid]) return cid;
    }

    return null;
  }

  // “Display” kan være navn eller id (case-insensitiv)
  function catIdFromDisplay(display) {
    const s = norm(display).toLowerCase();
    if (!s) return null;

    if (CAT_BY_ID[s]) return s;
    if (CAT_BY_NAME[s]) return CAT_BY_NAME[s].id;

    // fallback: match på startsWith
    for (const c of CATEGORY_LIST) {
      if (String(c.name || "").toLowerCase() === s) return c.id;
    }
    return null;
  }

  // eksponer globalt (samme mønster som resten av appen)
  window.CATEGORY_LIST = CATEGORY_LIST;
  window.catColor = catColor;
  window.catClass = catClass;
  window.tagToCat = tagToCat;
  window.catIdFromDisplay = catIdFromDisplay;
})();
