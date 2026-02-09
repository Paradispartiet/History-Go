// ============================================================
// categories.js
// KATEGORIER – kanonisk definisjon for History Go
// ============================================================

// ------------------------------------------------------------
// 1. KATEGORILISTE (brukes i badges, søk, venstre panel, quiz)
// ------------------------------------------------------------
const CATEGORY_LIST = [
  { id: "historie",        name: "Historie" },
  { id: "vitenskap",       name: "Vitenskap & filosofi" },
  { id: "kunst",           name: "Kunst & kultur" },
  { id: "musikk",          name: "Musikk & scenekunst" },
  { id: "litteratur",      name: "Litteratur" },
  { id: "natur",           name: "Natur & miljø" },
  { id: "sport",           name: "Sport & lek" },
  { id: "by",              name: "By & arkitektur" },
  { id: "politikk",        name: "Politikk & samfunn" },
  { id: "naeringsliv",     name: "Næringsliv" },
  { id: "populaerkultur",  name: "Populærkultur" },
  { id: "subkultur",       name: "Subkultur" },
  { id: "film_tv",         name: "Film & TV" },
  { id: "scenekunst",      name: "Scenekunst" },
  { id: "media",           name: "Medier" },
  { id: "psykologi",       name: "Psykologi" }
];

// ------------------------------------------------------------
// 2. NORMALISERING
// ------------------------------------------------------------
function norm(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
}

// ------------------------------------------------------------
// 3. FARGER (samme logikk overalt: badges, kart, UI)
// ------------------------------------------------------------
function catColor(cat = "") {
  const c = norm(cat);

  if (c.includes("historie") || c.includes("fortid") || c.includes("arkeologi")) return "#344B80";
  if (c.includes("vitenskap") || c.includes("filosofi")) return "#9b59b6";
  if (c.includes("kunst") || c.includes("kultur")) return "#ffb703";
  if (c.includes("musikk") || c.includes("scene")) return "#ff66cc";
  if (c.includes("litteratur") || c.includes("poesi")) return "#f6c800";
  if (c.includes("natur") || c.includes("miljoe")) return "#4caf50";
  if (c.includes("sport") || c.includes("idrett") || c.includes("lek")) return "#2a9d8f";
  if (c.includes("by") || c.includes("arkitektur")) return "#e63946";
  if (c.includes("politikk") || c.includes("samfunn")) return "#c77dff";
  if (c.includes("naeringsliv") || c.includes("industri") || c.includes("arbeid")) return "#ff8800";
  if (c.includes("populaer") || c.includes("pop")) return "#ffb703";
  if (c.includes("subkultur") || c.includes("urban")) return "#ff66cc";
  if (c.includes("film")) return "#6c757d";
  if (c.includes("media")) return "#adb5bd";
  if (c.includes("psykologi") || c.includes("mental") || c.includes("sinn")) return "#ff7aa2";

  return "#9b59b6"; // fallback
}

// ------------------------------------------------------------
// 4. CSS-KLASSE (matcher bilder/merker/*.PNG)
// ------------------------------------------------------------
function catClass(cat = "") {
  const c = norm(cat);

  if (c.includes("historie")) return "historie";
  if (c.includes("vitenskap") || c.includes("filosofi")) return "vitenskap";
  if (c.includes("kunst")) return "kunst";
  if (c.includes("musikk")) return "musikk";
  if (c.includes("litteratur")) return "litteratur";
  if (c.includes("natur")) return "natur";
  if (c.includes("sport")) return "sport";
  if (c.includes("by")) return "by";
  if (c.includes("politikk")) return "politikk";
  if (c.includes("naeringsliv") || c.includes("naering")) return "naeringsliv";
  if (c.includes("populaer") || c.includes("pop")) return "populaerkultur";
  if (c.includes("subkultur")) return "subkultur";
  if (c.includes("film")) return "film_tv";
  if (c.includes("scene")) return "scenekunst";
  if (c.includes("media")) return "media";
  if (c.includes("psykologi")) return "psykologi";

  return "vitenskap";
}

// ------------------------------------------------------------
// 5. TAGS → KATEGORI (brukes i quiz / people / places)
// ------------------------------------------------------------
function tagToCat(tags = []) {
  const t = norm(Array.isArray(tags) ? tags.join(" ") : tags);

  if (t.includes("historie") || t.includes("arkeologi")) return "historie";
  if (t.includes("vitenskap") || t.includes("filosofi")) return "vitenskap";
  if (t.includes("kunst") || t.includes("kultur")) return "kunst";
  if (t.includes("musikk") || t.includes("scene")) return "musikk";
  if (t.includes("litteratur") || t.includes("poesi")) return "litteratur";
  if (t.includes("natur") || t.includes("miljoe")) return "natur";
  if (t.includes("sport") || t.includes("idrett")) return "sport";
  if (t.includes("by") || t.includes("arkitektur")) return "by";
  if (t.includes("politikk") || t.includes("samfunn")) return "politikk";
  if (t.includes("naering") || t.includes("arbeid")) return "naeringsliv";
  if (t.includes("populaer") || t.includes("pop")) return "populaerkultur";
  if (t.includes("subkultur")) return "subkultur";
  if (t.includes("film") || t.includes("tv")) return "film_tv";
  if (t.includes("media")) return "media";
  if (t.includes("psykologi") || t.includes("mental")) return "psykologi";

  return "vitenskap";
}

// ------------------------------------------------------------
// 6. DISPLAY → ID (sikker bridge)
// ------------------------------------------------------------
function catIdFromDisplay(name = "") {
  const id = tagToCat(name);
  return id === "naering" ? "naeringsliv" : id;
}

// ------------------------------------------------------------
// 7. EKSPONER GLOBALT (⚠️ VIKTIG – INGEN export)
// ------------------------------------------------------------
window.CATEGORY_LIST     = CATEGORY_LIST;
window.catColor          = catColor;
window.catClass          = catClass;
window.tagToCat          = tagToCat;
window.catIdFromDisplay  = catIdFromDisplay;
