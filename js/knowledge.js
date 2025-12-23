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

// ============================================================
// LEARNING LOG (hg_learning_log_v1) → brukes av emner/kurs/diplom
// ============================================================

function getLearningLog() {
  try {
    const v = JSON.parse(localStorage.getItem("hg_learning_log_v1") || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Returnerer concepts i samme “shape” som HGInsights gir (label + count)
function getUserConceptsFromLearningLog() {
  const log = getLearningLog();
  const counts = new Map();

  for (const evt of log) {
    const arr = Array.isArray(evt?.concepts) ? evt.concepts : [];
    for (const c of arr) {
      const key = String(c ?? "").trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => (b.count || 0) - (a.count || 0));
}

function getUserEmneHitsFromLearningLog() {
  const log = getLearningLog();
  const hits = new Set();

  for (const evt of log) {
    const arr = Array.isArray(evt?.related_emner) ? evt.related_emner : [];
    for (const id of arr) {
      const eid = String(id ?? "").trim();
      if (eid) hits.add(eid);
    }
  }

  return hits;
}

// ============================================================
// Emne-dekning V2:
// - Hvis emne_id er “truffet” direkte i learning log → directHit=true
// - Ellers fall back til concept-match (som før)
// ============================================================

function computeEmneDekningV2(userConcepts, emner, opts = {}) {
  const emneHits = opts?.emneHits instanceof Set ? opts.emneHits : new Set();
  const userKeys = new Set(
    (Array.isArray(userConcepts) ? userConcepts : [])
      .map(c => String(c?.label ?? "").trim().toLowerCase())
      .filter(Boolean)
  );

  return (Array.isArray(emner) ? emner : []).map(emne => {
    const emneId = String(emne?.emne_id ?? "").trim();
    const core = Array.isArray(emne?.core_concepts) ? emne.core_concepts : [];

    const total = core.length;
    let match = 0;
    const missing = [];

    // DIRECT HIT: hvis quiz har sagt “du traff dette emnet”
    const directHit = !!(emneId && emneHits.has(emneId));

    if (directHit) {
      // vi lar dette telle som full dekning av emnet
      match = total;
    } else {
      core.forEach(c => {
        const key = String(c ?? "").toLowerCase();
        if (userKeys.has(key)) match++;
        else missing.push(c);
      });
    }

    const percent = total === 0 ? 0 : Math.round((match / total) * 100);

    return {
      emne_id: emneId,
      title: emne?.title,
      matchCount: match,
      total,
      percent,
      missing,
      directHit
    };
  });
}

window.getLearningLog = getLearningLog;
window.getUserConceptsFromLearningLog = getUserConceptsFromLearningLog;
window.getUserEmneHitsFromLearningLog = getUserEmneHitsFromLearningLog;
window.computeEmneDekningV2 = computeEmneDekningV2;
