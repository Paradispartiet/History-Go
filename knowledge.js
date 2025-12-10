/* ============================================================
   KNOWLEDGE SYSTEM – History Go
   Lagrer kunnskapspunkter lærte gjennom quizer
   Struktur: category → dimension → array of knowledge objects
   ============================================================ */

// Hent universet
function getKnowledgeUniverse() {
  return JSON.parse(localStorage.getItem("knowledge_universe") || "{}");
}

// Lagre universet
function saveKnowledgeUniverse(obj) {
  localStorage.setItem("knowledge_universe", JSON.stringify(obj));
}

// ------------------------------------------------------------
// 1) LAGRE KUNNSKAPSPUNKT
// ------------------------------------------------------------
function saveKnowledgePoint(entry) {
  // Sikkerhetssjekk (unngår krasj hvis noe mangler)
  if (!entry || !entry.category || !entry.dimension || !entry.id) return;

  const uni = getKnowledgeUniverse();

  // Opprett kategori hvis mangler
  if (!uni[entry.category]) {
    uni[entry.category] = {};
  }

  // Opprett dimensjon hvis mangler
  if (!uni[entry.category][entry.dimension]) {
    uni[entry.category][entry.dimension] = [];
  }

  const list = uni[entry.category][entry.dimension];

  // Ikke legg til duplikater
  if (!list.some(k => k.id === entry.id)) {
    list.push({
      id: entry.id,
      topic: entry.topic,
      text: entry.text
    });
  }

    saveKnowledgeUniverse(uni);

  // Trigger oppdatering av profil (fast regel 101)
  window.dispatchEvent(new Event("updateProfile"));

  // Sync til AHA hvis funksjonen finnes (History Go + AHA samme origin)
  if (typeof window.syncHistoryGoToAHA === "function") {
    window.syncHistoryGoToAHA();
  }
}
// ------------------------------------------------------------
// 2) HENTE KUNNSKAP FOR ET MERKE
// ------------------------------------------------------------
function getKnowledgeForCategory(categoryId) {
  const uni = getKnowledgeUniverse();
  return uni[categoryId] || {};
}

// ------------------------------------------------------------
// LAG KUNNSKAPSPUNKT NÅR QUIZ SVARES RIKTIG
// ------------------------------------------------------------
function saveKnowledgeFromQuiz(quizItem) {
  if (!quizItem || !quizItem.id) return;

  const entry = {
    id: "quiz_" + quizItem.id,
    category: quizItem.categoryId || "ukjent",
    dimension: quizItem.dimension || "generelt",
    topic: quizItem.question || quizItem.topic || "Lært gjennom quiz",
    text: quizItem.explanation || quizItem.answer || "Ingen forklaring registrert."
  };

  saveKnowledgePoint(entry); // eksisterende funksjon
}

window.saveKnowledgeFromQuiz = saveKnowledgeFromQuiz;

// ------------------------------------------------------------
// 3) RENDRING AV KUNNSKAPSSEKSJON
// ------------------------------------------------------------
function renderKnowledgeSection(categoryId) {
  const data = getKnowledgeForCategory(categoryId);
  if (!data || Object.keys(data).length === 0) {
    return `<div class="muted">Ingen kunnskap lagret ennå.</div>`;
  }

  return Object.entries(data)
    .map(([dimension, items]) => `
      <div class="knowledge-block">
        <h3>${capitalize(dimension)}</h3>
        <ul>
          ${items
            .map(k => `<li><strong>${k.topic}:</strong> ${k.text}</li>`)
            .join("")}
        </ul>
      </div>
    `)
    .join("");
}

// Liten hjelp
function capitalize(str) {
  if (!str) return "";
  str = str.toString();
  return str.charAt(0).toUpperCase() + str.slice(1);
}
