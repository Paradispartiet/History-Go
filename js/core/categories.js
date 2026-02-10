// js/core/categories.js
// (ingen export/import – vi kjører script-tag modus)

// --- Canonical categories ---
const CATEGORY_LIST = [
  { id: "historie",        name: "Historie" },
  { id: "vitenskap",       name: "Vitenskap & filosofi" },
  { id: "kunst",           name: "Kunst & kultur" },
  { id: "musikk",          name: "Musikk & scenekunst" },
  { id: "scenekunst",      name: "Scenekunst" },
  { id: "film_tv",         name: "Film & TV" },
  { id: "media",           name: "Media" },
  { id: "natur",           name: "Natur & miljø" },
  { id: "sport",           name: "Sport & lek" },
  { id: "by",              name: "By & arkitektur" },
  { id: "politikk",        name: "Politikk & samfunn" },
  { id: "populaerkultur",  name: "Populærkultur" },
  { id: "subkultur",       name: "Subkultur" },
  { id: "litteratur",      name: "Litteratur" },
  { id: "naeringsliv",     name: "Næringsliv" },
  { id: "psykologi",       name: "Psykologi" }
];

// --- Helpers (fra stabil versjon) ---
function norm(x) {
  return String(x || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\wæøå]/g, "");
}

function catColor(cat) {
  cat = norm(cat);
  if (cat === "historie") return "#f5a623";
  if (cat === "vitenskap") return "#4aa3ff";
  if (cat === "kunst") return "#c46cff";
  if (cat === "musikk") return "#ff4a7a";
  if (cat === "scenekunst") return "#ff4a7a";
  if (cat === "film_tv") return "#6c757d";
  if (cat === "media") return "#9aa2a9";
  if (cat === "natur") return "#48c774";
  if (cat === "sport") return "#00d1b2";
  if (cat === "by") return "#ffd166";
  if (cat === "politikk") return "#ff6b6b";
  if (cat === "populaerkultur") return "#b8b8ff";
  if (cat === "subkultur") return "#9bb0c9";
  if (cat === "litteratur") return "#7c5cff";
  if (cat === "naeringsliv") return "#c2a000";
  if (cat === "psykologi") return "#00bcd4";
  return "#f6c800";
}

function catClass(cat) {
  return "cat-" + norm(cat || "ukjent");
}

// Tag→Category: støtter både string-tags og tag-registry (hvis du bruker det)
function tagToCat(tag, registry) {
  const t = norm(tag);
  if (!t) return null;

  // Hvis registry har mapping: { "tag_id": { cat:"..." } } eller { "tag_id":"cat" }
  if (registry && typeof registry === "object") {
    const hit = registry[tag] || registry[t];
    if (typeof hit === "string") return norm(hit);
    if (hit && typeof hit === "object" && hit.cat) return norm(hit.cat);
  }

  // Fallback: hvis tag *allerede* er cat-id
  if (CATEGORY_LIST.some(c => c.id === t)) return t;

  return null;
}

function catIdFromDisplay(displayName) {
  const dn = String(displayName || "").trim().toLowerCase();
  const hit = CATEGORY_LIST.find(c => String(c.name).trim().toLowerCase() === dn);
  return hit ? hit.id : null;
}

// --- expose global ---
window.CATEGORY_LIST = CATEGORY_LIST;
window.catColor = catColor;
window.catClass = catClass;
window.tagToCat = tagToCat;
window.catIdFromDisplay = catIdFromDisplay;
