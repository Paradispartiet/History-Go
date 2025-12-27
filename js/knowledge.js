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
      text: entry.text,

      // ✅ nytt: gjør grouping mulig senere
      emne_id: entry.emne_id || null
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

     // ✅ nytt
    emne_id: quizItem.emne_id || context.emne_id || null
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

// ============================================================
// 3B) RENDRING MED GRENER (Merke → Gren/type → Area → Dimensjon)
// Krever: data/pensum/structure_<categoryId>.json
// Bruker: window.Emner.loadForSubject(categoryId)
// Fallback: gammel renderKnowledgeSection()
// ============================================================

(async function () {
  const _structureCache = {};

  async function loadStructure(categoryId) {
    if (_structureCache[categoryId]) return _structureCache[categoryId];

    const url = `/pensum/structure_${categoryId}.json`;
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      _structureCache[categoryId] = data;
      return data;
    } catch {
      _structureCache[categoryId] = null;
      return null;
    }
  }

  function indexEmnerById(emner = []) {
    const m = new Map();
    for (const e of emner) {
      if (e && e.emne_id) m.set(e.emne_id, e);
    }
    return m;
  }

  function groupKnowledgeByEmne(dataByDim) {
    // input: { dimension: [ {id, topic, text, emne_id?} ] }
    // output: Map<emne_id|null, { dimension -> items[] }>
    const byEmne = new Map();
    for (const [dim, items] of Object.entries(dataByDim || {})) {
      for (const it of (items || [])) {
        const emneId = it?.emne_id || null;
        if (!byEmne.has(emneId)) byEmne.set(emneId, {});
        const bucket = byEmne.get(emneId);
        if (!bucket[dim]) bucket[dim] = [];
        bucket[dim].push(it);
      }
    }
    return byEmne;
  }

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function capitalize(str) {
    if (!str) return "";
    str = String(str);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async function renderKnowledgeSectionAsync(categoryId) {
    const data = getKnowledgeForCategory(categoryId);
    if (!data || Object.keys(data).length === 0) {
      return `<div class="muted">Ingen kunnskap lagret ennå.</div>`;
    }

    // Last struktur (grener) – hvis ikke finnes, fall tilbake
    const structure = await loadStructure(categoryId);
    if (!structure || !Array.isArray(structure.branches)) {
      // fallback til gammel flat render
      return renderKnowledgeSection(categoryId);
    }

    // Last emner for å mappe emne_id → area_id/area_label
    if (!window.Emner || typeof window.Emner.loadForSubject !== "function") {
      return renderKnowledgeSection(categoryId);
    }

    const emnerAll = await window.Emner.loadForSubject(categoryId);
    const emneById = indexEmnerById(emnerAll);

    // group knowledge items per emne_id
    const byEmne = groupKnowledgeByEmne(data);

    // helper: map area_id → label fra emnefila (dersom finnes)
    function getAreaLabel(areaId) {
      // finn første emne med denne area_id
      const hit = (emnerAll || []).find(e => e && e.area_id === areaId);
      return hit?.area_label || areaId;
    }

    // Render
    let html = "";

    for (const branch of structure.branches) {
      const branchLabel = branch.label || branch.id;
      const areaIds = Array.isArray(branch.area_ids) ? branch.area_ids : [];
      if (!areaIds.length) continue;

      // Finn emner som hører til disse area_ids
      const emneIdsInBranch = (emnerAll || [])
        .filter(e => areaIds.includes(e.area_id))
        .map(e => e.emne_id);

      // Finn om det finnes knowledge under disse emnene
      const hasAny = emneIdsInBranch.some(id => byEmne.has(id));
      if (!hasAny) continue; // skjul tom gren

      html += `<div class="knowledge-block">
        <h3>${esc(branchLabel)}</h3>
      `;

      // area-nivå
      for (const areaId of areaIds) {
        const areaLabel = getAreaLabel(areaId);

        // emner under area
        const emneIds = (emnerAll || [])
          .filter(e => e && e.area_id === areaId)
          .map(e => e.emne_id);

        const areaHasAny = emneIds.some(id => byEmne.has(id));
        if (!areaHasAny) continue;

        html += `<div class="knowledge-subblock">
          <h4>${esc(areaLabel)}</h4>
        `;

        // dimensjon-nivå (gjenbruker eksisterende storage: category → dimension)
        // men filtrerer kun items med emne_id som ligger i area
        const dimToItems = {};
        for (const emneId of emneIds) {
          const dims = byEmne.get(emneId);
          if (!dims) continue;
          for (const [dim, items] of Object.entries(dims)) {
            if (!dimToItems[dim]) dimToItems[dim] = [];
            dimToItems[dim].push(...items);
          }
        }

        // Render per dimensjon
        for (const [dim, items] of Object.entries(dimToItems)) {
          html += `<div class="knowledge-mini">
            <div class="muted" style="margin-top:6px;"><strong>${esc(capitalize(dim))}</strong></div>
            <ul>
              ${items.map(k => `<li><strong>${esc(k.topic)}:</strong> ${esc(k.text)}</li>`).join("")}
            </ul>
          </div>`;
        }

        html += `</div>`; // knowledge-subblock
      }

      html += `</div>`; // knowledge-block
    }

    // Hvis alt ble filtrert bort (f.eks. gamle entries uten emne_id), fallback:
    if (!html.trim()) return renderKnowledgeSection(categoryId);

    return html;
  }

  window.renderKnowledgeSectionAsync = renderKnowledgeSectionAsync;
})();

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
