// ==============================
// KATEGORIER – DEFINISJON + LOGIKK
// ==============================

// Kategoriliste (brukes i søk, badges, visning, scroll)
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

function norm(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
}

function catColor(cat = "") { ... }
function catClass(cat = "") { ... }
function tagToCat(tags = []) { ... }
function catIdFromDisplay(name = "") { ... }

// eksponer globalt (samme mønster som resten av appen)
window.CATEGORY_LIST = CATEGORY_LIST;
window.catColor = catColor;
window.catClass = catClass;
window.tagToCat = tagToCat;
window.catIdFromDisplay = catIdFromDisplay;
