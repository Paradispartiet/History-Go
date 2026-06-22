/* ============================================================
   TRIVIA SYSTEM – History Go
   Lagrer morsomme fakta etter riktige svar
   Struktur: category → id → array of trivia strings
   ============================================================ */

// Hent triviasamling
function getTriviaUniverse() {
  return JSON.parse(localStorage.getItem("trivia_universe") || "{}");
}

// Lagre triviasamling
function saveTriviaUniverse(obj) {
  localStorage.setItem("trivia_universe", JSON.stringify(obj));
}

// ------------------------------------------------------------
// 1) LAGRE TRIVIA
// ------------------------------------------------------------
function saveTriviaPoint(entry) {
  // entry: { category, id, trivia }
  if (!entry || !entry.category || !entry.id || !entry.trivia) return;

  const uni = getTriviaUniverse();

  if (!uni[entry.category]) {
    uni[entry.category] = {};
  }

  if (!uni[entry.category][entry.id]) {
    uni[entry.category][entry.id] = [];
  }

  const list = uni[entry.category][entry.id];

  // Hindrer duplikater
  let changed = false;
  if (!list.includes(entry.trivia)) {
    list.push(entry.trivia);
    changed = true;
  }

  if (!changed) return;

  saveTriviaUniverse(uni);
  
  // Live-oppdatering i profil
  window.dispatchEvent(new Event("updateProfile"));

  // Sync til AHA hvis tilgjengelig
  if (typeof (window as any).syncHistoryGoToAHA === "function") {
    (window as any).syncHistoryGoToAHA();
  }
}

// ------------------------------------------------------------
// 2) HENTE TRIVIA PR KATEGORI
// ------------------------------------------------------------
function getTriviaForCategory(categoryId) {
  const uni = getTriviaUniverse();
  return uni[categoryId] || {};
}

// ------------------------------------------------------------
// 3) RENDRING AV TRIVIA-SEKSJON
// ------------------------------------------------------------
function renderTriviaSection(categoryId) {
  const data = getTriviaForCategory(categoryId);

  if (!data || Object.keys(data).length === 0) {
    return `<div class="muted">Ingen trivia låst opp ennå.</div>`;
  }

  return Object.entries(data)
    .map(([id, list]: [string, any]) => `
      <div class="trivia-block">
        <h3>${id.replace(/_/g, " ")}</h3>
        <ul>
          ${list.map((t: any) => `<li>${t}</li>`).join("")}
        </ul>
      </div>
    `)
    .join("");
}

// Interop ifm. TS-migrering: denne fila bundles nå som ESM-modul, så top-level
// blir modul-scopet. Publiser de eksternt forbrukte funksjonene på window slik
// at klassiske konsumenter fortsatt finner dem (js/profile.js leser
// window.getTriviaUniverse, js/quizzes.js leser window.saveTriviaPoint).
(window as any).getTriviaUniverse = getTriviaUniverse;
(window as any).saveTriviaPoint = saveTriviaPoint;
