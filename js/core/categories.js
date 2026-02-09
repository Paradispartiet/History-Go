// ==============================
// KATEGORIER – History Go (KANONISK)
// ==============================

// 1. Kategoriliste (én sannhet)
const CATEGORY_LIST = [
  { id: "historie",        name: "Historie" },
  { id: "vitenskap",       name: "Vitenskap & filosofi" },
  { id: "kunst",           name: "Kunst & kultur" },
  { id: "musikk",          name: "Musikk & scenekunst" },
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

// 2. Normalisering
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
}

// 3. Farge per kategori
function catColor(cat) {
  const c = norm(cat);

  if (c.includes("historie")) return "#344B80";
  if (c.includes("vitenskap") || c.includes("filosofi")) return "#9b59b6";
  if (c.includes("kunst") || c.includes("kultur")) return "#ffb703";
  if (c.includes("musikk") || c.includes("scene")) return "#ff66cc";
  if (c.includes("litteratur")) return "#f6c800";
  if (c.includes("natur") || c.includes("miljoe")) return "#4caf50";
  if (c.includes("sport") || c.includes("idrett") || c.includes("lek")) return "#2a9d8f";
  if (c.includes("by") || c.includes("arkitektur")) return "#e63946";
  if (c.includes("politikk") || c.includes("samfunn")) return "#c77dff";
  if (c.includes("naeringsliv") || c.includes("industri") || c.includes("arbeid")) return "#ff8800";
  if (c.includes("populaer") || c.includes("pop")) return "#ffb703";
  if (c.includes("subkultur")) return "#ff66cc";
  if (c.includes("psykologi") || c.includes("mental")) return "#ff7aa2";

  return "#9b59b6";
}

// 4. CSS-klasse per kategori
function catClass(cat) {
  const c = norm(cat);

  if (c.includes("historie")) return "historie";
  if (c.includes("vitenskap") || c.includes("filosofi")) return "vitenskap";
  if (c.includes("kunst") || c.includes("kultur")) return "kunst";
  if (c.includes("musikk") || c.includes("scene")) return "musikk";
  if (c.includes("litteratur")) return "litteratur";
  if (c.includes("natur") || c.includes("miljoe")) return "natur";
  if (c.includes("sport") || c.includes("idrett") || c.includes("lek")) return "sport";
  if (c.includes("by") || c.includes("arkitektur")) return "by";
  if (c.includes("politikk") || c.includes("samfunn")) return "politikk";
  if (c.includes("naeringsliv") || c.includes("industri") || c.includes("arbeid")) return "naeringsliv";
  if (c.includes("populaer") || c.includes("pop")) return "populaerkultur";
  if (c.includes("subkultur")) return "subkultur";
  if (c.includes("psykologi") || c.includes("mental")) return "psykologi";

  return "vitenskap";
}

// 5. Tags → kategori
function tagToCat(tags) {
  const t = norm(Array.isArray(tags) ? tags.join(" ") : tags);

  if (t.includes("historie")) return "historie";
  if (t.includes("vitenskap") || t.includes("filosofi")) return "vitenskap";
  if (t.includes("kunst") || t.includes("kultur")) return "kunst";
  if (t.includes("musikk") || t.includes("scene")) return "musikk";
  if (t.includes("litteratur")) return "litteratur";
  if (t.includes("natur") || t.includes("miljoe")) return "natur";
  if (t.includes("sport") || t.includes("idrett") || t.includes("lek")) return "sport";
  if (t.includes("by") || t.includes("arkitektur")) return "by";
  if (t.includes("politikk") || t.includes("samfunn")) return "politikk";
  if (t.includes("naeringsliv") || t.includes("industri") || t.includes("arbeid")) return "naeringsliv";
  if (t.includes("populaer") || t.includes("pop")) return "populaerkultur";
  if (t.includes("subkultur")) return "subkultur";
  if (t.includes("psykologi") || t.includes("mental")) return "psykologi";

  return "vitenskap";
}

// 6. Display → ID (bridge)
function catIdFromDisplay(name) {
  const id = tagToCat(name);
  return id === "naering" ? "naeringsliv" : id;
}

// 7. Global eksponering (VIKTIG – matcher resten av appen)
window.CATEGORY_LIST = CATEGORY_LIST;
window.catColor = catColor;
window.catClass = catClass;
window.tagToCat = tagToCat;
window.catIdFromDisplay = catIdFromDisplay;
