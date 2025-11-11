// ============================================================
// === HISTORY GO – CORE.JS (stabil base, GitHub + fallback) ==
// ============================================================
//
//  - Lasting av JSON-data
//  - Lagring og henting fra localStorage
//  - Initielle hjelpefunksjoner og boot()
// ============================================================

// --------------------------------------
// DEBUG-BOKS
// --------------------------------------
function debug(msg) {
  const box = document.getElementById("debugBox") || (() => {
    const b = document.createElement("div");
    b.id = "debugBox";
    b.style.position = "fixed";
    b.style.bottom = "8px";
    b.style.left = "8px";
    b.style.background = "rgba(0,0,0,.7)";
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
// JSON-LESER
// --------------------------------------
async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.error("Feil ved lasting av", path, err);
    return null;
  }
}

// --------------------------------------
// LOCALSTORAGE-HÅNDTERING
// --------------------------------------
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("Kunne ikke lagre:", key, err);
  }
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

function remove(key) {
  localStorage.removeItem(key);
}

// --------------------------------------
// HJELPEFUNKSJONER
// --------------------------------------
function norm(str = "") {
  return str.toLowerCase().replace(/\s+/g, "_").trim();
}

function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).substr(2, 9);
}

function showToast(msg, ms = 2500) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => (toast.style.display = "none"), ms);
}

// --------------------------------------
// BOOT – hovedstart for History Go
// --------------------------------------
// --------------------------------------
// BOOT – hovedstart for History Go
// --------------------------------------
async function boot() {
  debug("🔄 Starter History Go ...");

  // Automatisk riktig bane for GitHub Pages eller lokal kjøring
  const basePath = window.location.pathname.includes("History-Go")
    ? "History-Go/data/"
    : "data/";

  try {
    // Last inn konfig (valgfritt)
    const settings = await fetchJSON(`${basePath}settings.json`);
    window.appSettings = settings || {};
    console.log("⚙️ SETTINGS:", settings);

    // Last inn basisdata
    const [places, people, badges, routes] = await Promise.all([
      fetchJSON(`${basePath}places.json`),
      fetchJSON(`${basePath}people.json`),
      fetchJSON(`${basePath}badges.json`),
      fetchJSON(`${basePath}routes.json`),
    ]);
    console.log("📦 DATA:", { places, people, badges, routes });

    // Sett global struktur
    window.HG = window.HG || {};
    HG.data = { places, people, badges, routes };
    window.data = HG.data; // kompatibilitet med eldre kode

    debug(`✅ Data lastet (${places?.length || 0} steder)`);

    // Start appen om initApp finnes
    if (window.app?.initApp) {
      app.initApp();
    } else if (typeof initApp === "function") {
      initApp();
    } else if (window.map?.initMap && HG.data.places) {
      // --- Fallback: start kart direkte ---
      map.initMap(HG.data.places, HG.data.routes || []);
      debug("🗺️ Kart startet via fallback");
    } else {
      console.warn("⚠️ Ingen initApp-funksjon eller kartmodul funnet.");
    }
  } catch (err) {
    console.error("💥 BOOT FEIL:", err);
  }
}

// --------------------------------------
// AUTO-START
// --------------------------------------
document.addEventListener("DOMContentLoaded", boot);
