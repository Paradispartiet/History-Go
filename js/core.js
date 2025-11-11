// ============================================================
// === HISTORY GO – CORE.JS (v3.8, stabil base) ===============
// ============================================================
//
//  • Leser JSON-data med riktig sti (lokalt / GitHub Pages)
//  • Lagring og lasting fra localStorage
//  • Starter appen (boot) og sender data til HG.data
// ============================================================

// --------------------------------------
// DEBUG-BOKS (grønn tekst nederst)
// --------------------------------------
function debug(msg) {
  const box = document.getElementById("debugBox") || (() => {
    const b = document.createElement("div");
    b.id = "debugBox";
    b.style.position = "fixed";
    b.style.bottom = "8px";
    b.style.left = "8px";
    b.style.background = "rgba(0,0,0,.75)";
    b.style.color = "#0f0";
    b.style.padding = "6px 10px";
    b.style.font = "12px monospace";
    b.style.borderRadius = "6px";
    b.style.zIndex = 99999;
    document.body.appendChild(b);
    return b;
  })();
  box.textContent = msg;
  console.log(msg);
}

// --------------------------------------
// JSON-LESER MED FEILHÅNDTERING
// --------------------------------------
async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`❌ Feil ved lasting av ${path}:`, err);
    return null;
  }
}

// --------------------------------------
// LOCALSTORAGE-HÅNDTERING
// --------------------------------------
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (err) { console.warn("Kunne ikke lagre:", key, err); }
}

function load(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (err) {
    console.warn("Kunne ikke lese:", key, err);
    return fallback;
  }
}

// --------------------------------------
// HJELPERE
// --------------------------------------
function norm(str = "") {
  return str.toLowerCase().replace(/\s+/g, "_").trim();
}
function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).substr(2, 9);
}

// --------------------------------------
// BOOT – hovedstart for History Go
// --------------------------------------
async function boot() {
  debug("🔄 Starter History Go ...");

  // Automatisk riktig bane (lokalt vs GitHub Pages)
  const basePath = window.location.pathname.includes("History-Go")
    ? "History-Go/data/"
    : "data/";

  console.log("📂 BasePath satt til:", basePath);

  // Last inn konfig (valgfritt)
  const settings = await fetchJSON(`${basePath}settings.json`);
  window.appSettings = settings || {};

  // Last inn hoveddata
  const [places, people, badges, routes] = await Promise.all([
    fetchJSON(`${basePath}places.json`),
    fetchJSON(`${basePath}people.json`),
    fetchJSON(`${basePath}badges.json`),
    fetchJSON(`${basePath}routes.json`)
  ]);

  // Sett global struktur
  window.HG = window.HG || {};
  HG.data = { places, people, badges, routes };
  window.data = HG.data; // kompatibilitet med eldre kode

  console.log("✅ DATA:", HG.data);

  if (places && places.length > 0)
    debug(`✅ Data lastet (${places.length} steder)`);
  else
    debug("⚠️ Ingen steder lastet – sjekk sti eller JSON-filer");

  // Start appen
  if (window.app?.initApp) {
    app.initApp();
  } else if (typeof initApp === "function") {
    initApp();
  } else {
    console.warn("⚠️ Ingen initApp-funksjon funnet.");
  }
}

// --------------------------------------
// AUTO-START
// --------------------------------------
document.addEventListener("DOMContentLoaded", boot);
