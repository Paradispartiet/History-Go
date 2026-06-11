// js/core/categories.js
// ------------------------------------------------------
// KATEGORIER (GLOBAL, IKKE MODULE)
// ------------------------------------------------------
// Dette er UI/runtime-lista for place.category, farger, chips og badge/merit-visning.
// Den er ikke fag/editorial-normalisering. Bruk window.DomainRegistry for fag-id-er.
//
// scope:
// - runtime_domain: aktiv toppkategori som kan matche badge/merit/category direkte
// - runtime_domain_alias: aktiv runtime-id med kort/fag-alias; samme badge, ikke nytt spor
// - subfield_display: visnings-/subfelt-id; ikke nytt toppdomene uten DOMAIN_CONTRACT-endring
//
// Se også: docs/DOMAIN_CONTRACT.md
// ------------------------------------------------------

(function () {
  const CATEGORY_LIST = [
    // Aktive toppdomener / runtime badges
    { id: "historie",       name: "Historie",               icon: "🏛️", color: "#f6c800", scope: "runtime_domain" },
    { id: "vitenskap",      name: "Vitenskap & filosofi",   icon: "🧪", color: "#6ee7ff", scope: "runtime_domain" },
    { id: "kunst",          name: "Kunst & kultur",         icon: "🎨", color: "#ff5aa5", scope: "runtime_domain" },
    { id: "musikk",         name: "Musikk & scenekunst",    icon: "🎭", color: "#b48cff", scope: "runtime_domain" },
    { id: "natur",          name: "Natur & miljø",          icon: "🌿", color: "#59d36a", scope: "runtime_domain" },
    { id: "sport",          name: "Sport & lek",            icon: "⚽", color: "#ff8a3d", scope: "runtime_domain" },
    { id: "by",             name: "By & arkitektur",        icon: "🏙️", color: "#7fb3ff", scope: "runtime_domain" },
    { id: "politikk",       name: "Politikk & samfunn",     icon: "🏛️", color: "#ffd27a", scope: "runtime_domain" },
    { id: "subkultur",      name: "Subkultur",              icon: "🧷", color: "#9b7bff", scope: "runtime_domain" },
    { id: "litteratur",     name: "Litteratur",             icon: "📚", color: "#ffcc66", scope: "runtime_domain" },
    { id: "naeringsliv",    name: "Næringsliv",             icon: "🏭", color: "#9ad0c2", scope: "runtime_domain" },
    { id: "psykologi",      name: "Psykologi",              icon: "🧠", color: "#ff9aa2", scope: "runtime_domain" },
    { id: "film_tv",        name: "Film & TV",              icon: "🎞️", color: "#6c757d", scope: "runtime_domain" },
    { id: "media",          name: "Medier",                 icon: "🗞️", color: "#c0c0c0", scope: "runtime_domain" },

    // Aktiv runtime-id med kort/fag-alias. popkultur er samme badge, ikke et nytt spor.
    { id: "populaerkultur", name: "Populærkultur",          icon: "📺", color: "#a0a0a0", scope: "runtime_domain_alias", canonicalFagId: "popkultur", aliases: ["popkultur"] },

    // Subfelt/visning. Beholdes for UI/datafunn, men er ikke toppdomene nå.
    { id: "scenekunst",     name: "Scenekunst",             icon: "🎭", color: "#c59cff", scope: "subfield_display", parentId: "kunst", canonicalFagId: "kunst" }
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

  // Robust: forsøker å mappe vilkårlig "tag" til en runtime-kategori-id.
  // Denne funksjonen bruker CATEGORY_LIST, ikke DomainRegistry, fordi den skal returnere
  // en id som finnes i UI/runtime-kategoriene her.
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

  // “Display” kan være navn eller id (case-insensitiv).
  // Returnerer alltid id fra CATEGORY_LIST, ikke canonical fag-id.
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
