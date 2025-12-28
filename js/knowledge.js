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
// ------------------------------------------------------------
// 3) RENDRING AV KUNNSKAPSSEKSJON (KURS + EMNER + KNOWLEDGE)
// ------------------------------------------------------------
function renderKnowledgeSection(categoryId) {
  const cid = String(categoryId || "").trim();

  // 1) Kursboks alltid først (skeleton), fylles async av HGCourseUI.init()
  let html = "";
  if (window.HGCourseUI && typeof window.HGCourseUI.mountHtml === "function") {
    html += window.HGCourseUI.mountHtml(cid);
  }

  // 2) Emner (accordion) – placeholder (fylles async etter DOMContentLoaded)
  html += `
    <div class="knowledge-block" id="hgEmnerBox" data-emner-for="${cid}">
      <h3>Emner</h3>
      <div class="muted">Laster emner…</div>
    </div>
  `;

  // 3) Knowledge-universe (det du har låst opp)
  const data = getKnowledgeForCategory(cid);

  if (!data || Object.keys(data).length === 0) {
    html += `
      <div class="knowledge-block">
        <h3>Kunnskap</h3>
        <div class="muted">Ingen kunnskap lagret ennå.</div>
      </div>
    `;
    return html;
  }

  html += `
    <div class="knowledge-block">
      <h3>Kunnskap</h3>
      ${Object.entries(data)
        .map(([dimension, items]) => `
          <div class="knowledge-subblock">
            <h4 style="margin:10px 0 6px 0;">${capitalize(dimension)}</h4>
            <ul style="margin:0;padding-left:18px;">
              ${items
                .map(k => `<li><strong>${k.topic}:</strong> ${k.text}</li>`)
                .join("")}
            </ul>
          </div>
        `)
        .join("")}
    </div>
  `;

  return html;
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

// ============================================================
// COURSES UI (Kursprogresjon på merkeside) — ingen structure
// Krever: js/courses.js (window.HGCourses) + js/dataHub.js (window.DataHub)
// Pensum: data/pensum_<categoryId>.json (HGCourses loader)   [oai_citation:1‡courses (1).js](sediment://file_00000000f7f87246a06754803fe6f458)
// ============================================================

(function () {
  "use strict";

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function pctBar(p) {
    const v = Math.max(0, Math.min(100, Number(p) || 0));
    return `
      <div style="margin-top:8px;">
        <div style="height:10px;border-radius:999px;background:rgba(255,255,255,0.10);overflow:hidden;">
          <div style="height:10px;width:${v}%;background:rgba(255,255,255,0.55);"></div>
        </div>
      </div>
    `;
  }

  function renderCourseBoxSkeleton(categoryId) {
    return `
      <div class="knowledge-block" id="hgCourseBox" data-course-for="${esc(categoryId)}">
        <h3>Kursprogresjon</h3>
        <div class="muted">Laster kurs…</div>
      </div>
    `;
  }

  function renderCourseBoxReady(res) {
    const course = res?.course;
    const diploma = res?.diploma;
    const top = (res?.learning?.topConcepts || []).slice(0, 8);

    const done = course?.done || 0;
    const total = course?.total || 0;
    const percent = course?.percent || 0;

    const dipTxt = diploma?.eligible
      ? `🎓 Diplom klart (${diploma.done}/${diploma.total})`
      : `Diplom: ${diploma?.done || 0}/${diploma?.total || 0}`;

    const modules = Array.isArray(course?.modules) ? course.modules : [];

    return `
      <div class="knowledge-block" id="hgCourseBox" data-course-for="${esc(res.subjectId)}">
        <h3>Kursprogresjon</h3>

        <div><strong>${done}/${total}</strong> moduler fullført • <strong>${percent}%</strong></div>
        ${pctBar(percent)}
        <div class="muted" style="margin-top:6px;">${esc(dipTxt)}</div>

        ${
          top.length
            ? `
          <div style="margin-top:10px;">
            <div class="muted"><strong>Topp begreper</strong></div>
            <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:8px;">
              ${top.map(x => `<span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.08);">${esc(x.label)} <span class="muted">(${x.count})</span></span>`).join("")}
            </div>
          </div>
            `
            : ""
        }

        ${
          modules.length
            ? `
          <div style="margin-top:12px;">
            <div class="muted"><strong>Moduler</strong></div>
            <div style="margin-top:8px; display:flex; flex-direction:column; gap:10px;">
              ${modules.map(m => {
                const name = m?.title || m?.id || "Modul";
                const ok = !!m?.completed;
                const em = m?.stats?.emner?.percent ?? 0;
                const co = m?.stats?.concepts?.percent ?? 0;
                const pq = m?.stats?.perfectQuizzesInCategory ?? 0;

                return `
                  <div style="padding:10px 12px;border-radius:14px;background:rgba(255,255,255,0.06);">
                    <div style="display:flex;justify-content:space-between;gap:10px;">
                      <div><strong>${esc(name)}</strong></div>
                      <div>${ok ? "✅" : "⏳"}</div>
                    </div>
                    <div class="muted" style="margin-top:6px;">
                      Emner: ${Math.round(em)}% • Konsepter: ${Math.round(co)}% • Perfect quiz: ${pq}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
            `
            : `<div class="muted" style="margin-top:10px;">Ingen moduler definert i pensumfilen.</div>`
        }
      </div>
    `;
  }

  async function fillCourseBox(categoryId) {
    const box = document.querySelector(`#hgCourseBox[data-course-for="${CSS.escape(categoryId)}"]`);
    if (!box) return;

    // Krav: courses + DataHub
    if (!window.HGCourses || typeof window.HGCourses.compute !== "function") {
      box.innerHTML = `<h3>Kursprogresjon</h3><div class="muted">courses.js er ikke lastet.</div>`;
      return;
    }
    if (!window.DataHub || typeof window.DataHub.loadEmner !== "function") {
      box.innerHTML = `<h3>Kursprogresjon</h3><div class="muted">DataHub.loadEmner mangler.</div>`;
      return;
    }

    try {
      const emnerAll = await window.DataHub.loadEmner(categoryId);
      const res = await window.HGCourses.compute({ subjectId: categoryId, emnerAll });
      box.outerHTML = renderCourseBoxReady(res);
    } catch (e) {
      box.innerHTML = `<h3>Kursprogresjon</h3><div class="muted">Kunne ikke laste kurs/pensum.</div>`;
      if (window.DEBUG) console.warn("[HGCourseUI]", e);
    }
  }

  // Expose
  window.HGCourseUI = {
    // kalles fra knowledge_component etter render
    init(categoryId) {
      // hvis boksen ikke finnes i HTML ennå: ikke gjør noe
      fillCourseBox(String(categoryId || "").trim());
    },

    // helper hvis du vil bruke den i HTML-renderen:
    mountHtml(categoryId) {
      return renderCourseBoxSkeleton(String(categoryId || "").trim());
    }
  };
})();

window.getLearningLog = getLearningLog;
window.getUserConceptsFromLearningLog = getUserConceptsFromLearningLog;
window.getUserEmneHitsFromLearningLog = getUserEmneHitsFromLearningLog;
window.computeEmneDekningV2 = computeEmneDekningV2;


// ------------------------------------------------------------
// EMNER UI (async fyll) – bruker DataHub.loadEmner(categoryId)
// ------------------------------------------------------------
(function () {
  "use strict";

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function safeCssEscape(x) {
    try {
      return CSS && typeof CSS.escape === "function" ? CSS.escape(x) : x;
    } catch {
      return x;
    }
  }

  function renderEmneAccordion(emne) {
    const title = emne?.title || emne?.short_label || emne?.emne_id || "Emne";
    const desc  = String(emne?.description || "").trim();

    const goals = Array.isArray(emne?.goals) ? emne.goals : [];
    const cps   = Array.isArray(emne?.checkpoints) ? emne.checkpoints : [];

    const core  = Array.isArray(emne?.core_concepts) ? emne.core_concepts : [];
    const keys  = Array.isArray(emne?.keywords) ? emne.keywords : [];
    const dims  = Array.isArray(emne?.dimensions) ? emne.dimensions : [];

    const chips = [...core.slice(0, 6), ...keys.slice(0, 4)].slice(0, 10);

    return `
      <details class="hg-emne" style="padding:10px 12px;border-radius:14px;background:rgba(255,255,255,0.06);">
        <summary style="cursor:pointer; display:flex; justify-content:space-between; gap:10px; align-items:center;">
          <span><strong>${esc(title)}</strong></span>
          <span class="muted">${esc(emne?.level || "")}</span>
        </summary>

        ${
          chips.length
            ? `<div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:8px;">
                 ${chips.map(x => `<span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.08);">${esc(x)}</span>`).join("")}
               </div>`
            : ""
        }

        ${
          desc
            ? `<div style="margin-top:10px; line-height:1.5;">${esc(desc)}</div>`
            : `<div class="muted" style="margin-top:10px;">Ingen emnebeskrivelse.</div>`
        }

        ${
          goals.length
            ? `<div style="margin-top:12px;">
                 <div class="muted"><strong>Kursmål</strong></div>
                 <ul style="margin:6px 0 0 0; padding-left:18px;">
                   ${goals.map(g => `<li>${esc(g)}</li>`).join("")}
                 </ul>
               </div>`
            : ""
        }

        ${
          cps.length
            ? `<div style="margin-top:12px;">
                 <div class="muted"><strong>Milepæler</strong></div>
                 <ul style="margin:6px 0 0 0; padding-left:18px;">
                   ${cps.map(c => `<li>${esc(c)}</li>`).join("")}
                 </ul>
               </div>`
            : ""
        }

        ${
          dims.length
            ? `<div style="margin-top:12px;">
                 <div class="muted"><strong>Dimensjoner</strong></div>
                 <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:8px;">
                   ${dims.map(d => `<span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.08);">${esc(d)}</span>`).join("")}
                 </div>
               </div>`
            : ""
        }
      </details>
    `;
  }

  async function fillEmnerBox(categoryId) {
    const cid = String(categoryId || "").trim();
    const box = document.querySelector(`#hgEmnerBox[data-emner-for="${safeCssEscape(cid)}"]`);
    if (!box) return;

    if (!window.DataHub || typeof window.DataHub.loadEmner !== "function") {
      box.innerHTML = `<h3>Emner</h3><div class="muted">DataHub.loadEmner mangler.</div>`;
      return;
    }

    try {
      const emnerAll = await window.DataHub.loadEmner(cid);
      const emner = Array.isArray(emnerAll) ? emnerAll : [];

      if (!emner.length) {
        box.innerHTML = `<h3>Emner</h3><div class="muted">Ingen emner funnet for ${esc(cid)}.</div>`;
        return;
      }

      box.innerHTML = `
        <h3>Emner</h3>
        <div style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
          ${emner.map(renderEmneAccordion).join("")}
        </div>
      `;
    } catch (e) {
      box.innerHTML = `<h3>Emner</h3><div class="muted">Kunne ikke laste emner.</div>`;
      if (window.DEBUG) console.warn("[EmnerBox]", e);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // knowledge_component setter <body class="merke-XYZ">
    const cls = [...document.body.classList].find(c => c.startsWith("merke-"));
    if (!cls) return;
    const categoryId = cls.replace("merke-", "");
    fillEmnerBox(categoryId);
  });
})();
