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
// ------------------------------------------------------------
// LAG KUNNSKAPSPUNKT NÅR QUIZ SVARES RIKTIG
// ------------------------------------------------------------
function saveKnowledgeFromQuiz(quizItem, context = {}) {
  if (!quizItem) return;

  // Vi tillater at quizItem mangler id, da kan vi bruke context.id
  const baseId = quizItem.id || context.id;
  if (!baseId) return;

  const category =
    quizItem.categoryId ||
    context.categoryId ||
    "ukjent";

  const dimension =
    quizItem.dimension ||
    context.dimension ||
    "generelt";

  const topic =
    quizItem.topic ||
    quizItem.question ||
    context.topic ||
    "Lært gjennom quiz";

  // Vi prøver først 'knowledge' (History Go-stil), så 'explanation', så 'answer'
  const text =
    quizItem.knowledge ||
    quizItem.explanation ||
    quizItem.answer ||
    "Ingen forklaring registrert.";

  const entry = {
    id: "quiz_" + baseId,
    category,
    dimension,
    topic,
    text
  };

  saveKnowledgePoint(entry);
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

// ================================
// EMNE-DEKNING (History GO)
// ================================
//
// Tar brukers begreper fra HGInsights + emnefil
// og gir: { emne_id, title, matchCount, total, percent, missing }
function computeEmneDekning(userConcepts, emner) {
  const userKeys = new Set(userConcepts.map(c => c.label.toLowerCase()));

  return emner.map(emne => {
    const core = emne.core_concepts || [];

    const total = core.length;
    let match = 0;
    const missing = [];

    core.forEach(c => {
      const key = c.toLowerCase();
      if (userKeys.has(key)) {
        match++;
      } else {
        missing.push(c);
      }
    });

    const percent = total === 0 ? 0 : Math.round((match / total) * 100);

    return {
      emne_id: emne.emne_id,
      title: emne.title,
      matchCount: match,
      total,
      percent,
      missing
    };
  });
}

window.computeEmneDekning = computeEmneDekning;
