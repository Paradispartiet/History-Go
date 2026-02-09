// ==============================
// ELEMENTREFERANSER (DOM-cache)
// ==============================
const el = {
  map:        document.getElementById("map"),
  toast:      document.getElementById("toast"),
  status:     document.getElementById("status"),

  btnSeeMap:  document.getElementById("btnSeeMap"),
  btnExitMap: document.getElementById("btnExitMap"),
  btnCenter:  document.getElementById("btnCenter"),
  open:       document.getElementById("openToggle"),

  list:       document.getElementById("nearbyList"),
  nearPeople: document.getElementById("nearbyPeople"),

  collectionGrid:      document.getElementById("collectionGrid"),
  collectionCount:     document.getElementById("collectionCount"),
  btnMoreCollection:   document.getElementById("btnMoreCollection"),
  sheetCollection:     document.getElementById("sheetCollection"),
  sheetCollectionBody: document.getElementById("sheetCollectionBody"),

  gallery: document.getElementById("gallery"),
};

// eksponer globalt (samme stil som resten av appen)
window.el = el;

// ==============================
// GEO STATUS UI
// ==============================
window.addEventListener("hg:geo", (e) => {
  const st = e.detail?.status;
  const icon = document.getElementById("geoStatus");
  if (!icon) return;

  icon.classList.remove("geo-ok","geo-bad","geo-unknown");

  if (st === "granted" || st === "test") {
    icon.classList.add("geo-ok");
    icon.textContent = "✅";
  } else if (st === "blocked" || st === "unsupported") {
    icon.classList.add("geo-bad");
    icon.textContent = "⛔";
  } else {
    icon.classList.add("geo-unknown");
    icon.textContent = "…";
  }
});
