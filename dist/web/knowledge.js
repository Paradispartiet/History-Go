(() => {
  // js/knowledge.ts
  function getKnowledgeUniverse() {
    return JSON.parse(localStorage.getItem("knowledge_universe") || "{}");
  }
  function saveKnowledgeUniverse(obj) {
    localStorage.setItem("knowledge_universe", JSON.stringify(obj));
  }
  function saveKnowledgePoint(entry) {
    if (!entry || !entry.category || !entry.dimension || !entry.id) return;
    const uni = getKnowledgeUniverse();
    if (!uni[entry.category]) {
      uni[entry.category] = {};
    }
    if (!uni[entry.category][entry.dimension]) {
      uni[entry.category][entry.dimension] = [];
    }
    const list = uni[entry.category][entry.dimension];
    let changed = false;
    if (!list.some((k) => k.id === entry.id)) {
      list.push({
        id: entry.id,
        topic: entry.topic,
        text: entry.text
      });
      changed = true;
    }
    if (!changed) return;
    saveKnowledgeUniverse(uni);
    window.dispatchEvent(new Event("updateProfile"));
    if (typeof window.syncHistoryGoToAHA === "function") {
      window.syncHistoryGoToAHA();
    }
  }
  function getKnowledgeForCategory(categoryId) {
    const uni = getKnowledgeUniverse();
    return uni[categoryId] || {};
  }
  function saveKnowledgeFromQuiz(quizItem, context = {}) {
    if (!quizItem) return;
    const baseId = quizItem.id || context.id;
    if (!baseId) return;
    const category = quizItem.categoryId || context.categoryId || "ukjent";
    const dimension = quizItem.dimension || context.dimension || "generelt";
    const topic = quizItem.topic || quizItem.question || context.topic || "L\xE6rt gjennom quiz";
    const text = quizItem.knowledge || quizItem.explanation || quizItem.answer || "Ingen forklaring registrert.";
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
  function renderKnowledgeSection(categoryId) {
    const cid = String(categoryId || "").trim();
    let html = "";
    if (window.HGCourseUI && typeof window.HGCourseUI.mountHtml === "function") {
      html += window.HGCourseUI.mountHtml(cid);
    }
    html += `
    <div class="knowledge-block" id="hgChipsBox" data-chips-for="${cid}">
      <h3>Chips</h3>
      <div id="hgChipsMount" class="muted">Laster chips\u2026</div>
    </div>
  `;
    html += `
    <div class="knowledge-block" id="hgEmnerBox" data-emner-for="${cid}">
      <h3>Emner</h3>
      <div id="hgEmnerMount" class="muted">Laster emner\u2026</div>
    </div>
  `;
    const data = getKnowledgeForCategory(cid);
    if (!data || Object.keys(data).length === 0) {
      html += `
      <div class="knowledge-block">
        <h3>Kunnskap</h3>
        <div class="muted">Ingen kunnskap lagret enn\xE5.</div>
      </div>
    `;
      return html;
    }
    html += `
    <div class="knowledge-block">
      <h3>Kunnskap</h3>
      ${Object.entries(data).map(([dimension, items]) => `
          <div class="knowledge-subblock">
            <h4 style="margin:10px 0 6px 0;">${capitalize(dimension)}</h4>
            <ul style="margin:0;padding-left:18px;">
              ${items.map((k) => `<li><strong>${k.topic}:</strong> ${k.text}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
    </div>
  `;
    return html;
  }
  function capitalize(str) {
    if (!str) return "";
    str = str.toString();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  function computeEmneDekning(userConcepts, emner) {
    const userKeys = new Set(userConcepts.map((c) => c.label.toLowerCase()));
    return emner.map((emne) => {
      const core = emne.core_concepts || [];
      const total = core.length;
      let match = 0;
      const missing = [];
      core.forEach((c) => {
        const key = c.toLowerCase();
        if (userKeys.has(key)) {
          match++;
        } else {
          missing.push(c);
        }
      });
      const percent = total === 0 ? 0 : Math.round(match / total * 100);
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
  function getLearningLog() {
    try {
      const v = JSON.parse(localStorage.getItem("hg_learning_log_v1") || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  function getUserConceptsFromLearningLog() {
    const log = getLearningLog();
    const counts = /* @__PURE__ */ new Map();
    for (const evt of log) {
      const arr = Array.isArray(evt == null ? void 0 : evt.concepts) ? evt.concepts : [];
      for (const c of arr) {
        const key = String(c != null ? c : "").trim();
        if (!key) continue;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => (b.count || 0) - (a.count || 0));
  }
  function getUserEmneHitsFromLearningLog() {
    const log = getLearningLog();
    const hits = /* @__PURE__ */ new Set();
    for (const evt of log) {
      const arr = Array.isArray(evt == null ? void 0 : evt.related_emner) ? evt.related_emner : [];
      for (const id of arr) {
        const eid = String(id != null ? id : "").trim();
        if (eid) hits.add(eid);
      }
    }
    return hits;
  }
  function computeEmneDekningV2(userConcepts, emner, opts = {}) {
    const emneHits = (opts == null ? void 0 : opts.emneHits) instanceof Set ? opts.emneHits : /* @__PURE__ */ new Set();
    const userKeys = new Set(
      (Array.isArray(userConcepts) ? userConcepts : []).map((c) => {
        var _a;
        return String((_a = c == null ? void 0 : c.label) != null ? _a : "").trim().toLowerCase();
      }).filter(Boolean)
    );
    return (Array.isArray(emner) ? emner : []).map((emne) => {
      var _a;
      const emneId = String((_a = emne == null ? void 0 : emne.emne_id) != null ? _a : "").trim();
      const core = Array.isArray(emne == null ? void 0 : emne.core_concepts) ? emne.core_concepts : [];
      const total = core.length;
      let match = 0;
      const missing = [];
      const directHit = !!(emneId && emneHits.has(emneId));
      if (directHit) {
        match = total;
      } else {
        core.forEach((c) => {
          const key = String(c != null ? c : "").toLowerCase();
          if (userKeys.has(key)) match++;
          else missing.push(c);
        });
      }
      const percent = total === 0 ? 0 : Math.round(match / total * 100);
      return {
        emne_id: emneId,
        title: emne == null ? void 0 : emne.title,
        matchCount: match,
        total,
        percent,
        missing,
        directHit
      };
    });
  }
  (function() {
    "use strict";
    function esc(s) {
      return String(s != null ? s : "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
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
        <div class="muted">Laster kurs\u2026</div>
      </div>
    `;
    }
    function renderCourseBoxReady(res) {
      var _a;
      const course = res == null ? void 0 : res.course;
      const diploma = res == null ? void 0 : res.diploma;
      const top = (((_a = res == null ? void 0 : res.learning) == null ? void 0 : _a.topConcepts) || []).slice(0, 8);
      const done = (course == null ? void 0 : course.done) || 0;
      const total = (course == null ? void 0 : course.total) || 0;
      const percent = (course == null ? void 0 : course.percent) || 0;
      const dipTxt = (diploma == null ? void 0 : diploma.eligible) ? `\u{1F393} Diplom klart (${diploma.done}/${diploma.total})` : `Diplom: ${(diploma == null ? void 0 : diploma.done) || 0}/${(diploma == null ? void 0 : diploma.total) || 0}`;
      const modules = Array.isArray(course == null ? void 0 : course.modules) ? course.modules : [];
      return `
      <div class="knowledge-block" id="hgCourseBox" data-course-for="${esc(res.subjectId)}">
        <h3>Kursprogresjon</h3>

        <div><strong>${done}/${total}</strong> moduler fullf\xF8rt \u2022 <strong>${percent}%</strong></div>
        ${pctBar(percent)}
        <div class="muted" style="margin-top:6px;">${esc(dipTxt)}</div>

        ${top.length ? `
          <div style="margin-top:10px;">
            <div class="muted"><strong>Topp begreper</strong></div>
            <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:8px;">
              ${top.map((x) => `<span style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.08);">${esc(x.label)} <span class="muted">(${x.count})</span></span>`).join("")}
            </div>
          </div>
            ` : ""}

        ${modules.length ? `
          <div style="margin-top:12px;">
            <div class="muted"><strong>Moduler</strong></div>
            <div style="margin-top:8px; display:flex; flex-direction:column; gap:10px;">
              ${modules.map((m) => {
        var _a2, _b, _c, _d, _e, _f, _g, _h;
        const name = (m == null ? void 0 : m.title) || (m == null ? void 0 : m.id) || "Modul";
        const ok = !!(m == null ? void 0 : m.completed);
        const em = (_c = (_b = (_a2 = m == null ? void 0 : m.stats) == null ? void 0 : _a2.emner) == null ? void 0 : _b.percent) != null ? _c : 0;
        const co = (_f = (_e = (_d = m == null ? void 0 : m.stats) == null ? void 0 : _d.concepts) == null ? void 0 : _e.percent) != null ? _f : 0;
        const pq = (_h = (_g = m == null ? void 0 : m.stats) == null ? void 0 : _g.perfectQuizzesInCategory) != null ? _h : 0;
        return `
                  <div style="padding:10px 12px;border-radius:14px;background:rgba(255,255,255,0.06);">
                    <div style="display:flex;justify-content:space-between;gap:10px;">
                      <div><strong>${esc(name)}</strong></div>
                      <div>${ok ? "\u2705" : "\u23F3"}</div>
                    </div>
                    <div class="muted" style="margin-top:6px;">
                      Emner: ${Math.round(em)}% \u2022 Konsepter: ${Math.round(co)}% \u2022 Perfect quiz: ${pq}
                    </div>
                  </div>
                `;
      }).join("")}
            </div>
          </div>
            ` : `<div class="muted" style="margin-top:10px;">Ingen moduler definert i pensumfilen.</div>`}
      </div>
    `;
    }
    async function fillCourseBox(categoryId) {
      const box = document.querySelector(`#hgCourseBox[data-course-for="${CSS.escape(categoryId)}"]`);
      if (!box) return;
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
    window.HGCourseUI = {
      // kalles fra knowledge_component etter render
      init(categoryId) {
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
  window.getKnowledgeUniverse = getKnowledgeUniverse;
  window.saveKnowledgePoint = saveKnowledgePoint;
  window.renderKnowledgeSection = renderKnowledgeSection;
  (function() {
    "use strict";
    function esc(s) {
      return String(s != null ? s : "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }
    function safeCssEscape(x) {
      try {
        return CSS && typeof CSS.escape === "function" ? CSS.escape(x) : x;
      } catch {
        return x;
      }
    }
    function renderEmneAccordion(emne) {
      const title = (emne == null ? void 0 : emne.title) || (emne == null ? void 0 : emne.short_label) || (emne == null ? void 0 : emne.emne_id) || "Emne";
      const desc = String((emne == null ? void 0 : emne.description) || "").trim();
      const goals = Array.isArray(emne == null ? void 0 : emne.learning_goals) ? emne.learning_goals : Array.isArray(emne == null ? void 0 : emne.goals) ? emne.goals : [];
      const cps = Array.isArray(emne == null ? void 0 : emne.checkpoints) ? emne.checkpoints : [];
      const core = Array.isArray(emne == null ? void 0 : emne.core_concepts) ? emne.core_concepts : [];
      const keys = Array.isArray(emne == null ? void 0 : emne.keywords) ? emne.keywords : [];
      const dims = Array.isArray(emne == null ? void 0 : emne.dimensions) ? emne.dimensions : [];
      const chips = [...core.slice(0, 6), ...keys.slice(0, 4)].slice(0, 10);
      const levelTxt = String((emne == null ? void 0 : emne.level) || "").trim();
      const goalLine = (g) => {
        if (typeof g === "string") return g;
        if (g && typeof g === "object") return g.title || g.text || g.goal || g.label || g.id || g.goal_id || "";
        return "";
      };
      const cpLine = (c) => {
        if (typeof c === "string") return c;
        if (c && typeof c === "object") return c.title || c.text || c.label || c.cp_id || c.id || "";
        return "";
      };
      const goalItems = goals.map(goalLine).map((s) => String(s || "").trim()).filter(Boolean);
      const cpItems = cps.map(cpLine).map((s) => String(s || "").trim()).filter(Boolean);
      return `
    <details class="hg-emne">
      <summary class="hg-emne-summary">
        <span class="hg-emne-title"><strong>${esc(title)}</strong></span>
        ${levelTxt ? `<span class="muted">${esc(levelTxt)}</span>` : ``}
      </summary>

      ${chips.length ? `
        <div class="hg-chips-row">
          ${chips.map((x) => `<span class="hg-chip">${esc(x)}</span>`).join("")}
        </div>
      ` : ``}

      ${desc ? `<div class="hg-emne-desc">${esc(desc)}</div>` : `<div class="muted" style="margin-top:10px;">Ingen emnebeskrivelse.</div>`}

      ${goalItems.length ? `
        <div style="margin-top:12px;">
          <div class="muted"><strong>Kursm\xE5l</strong></div>
          <ul style="margin:6px 0 0 0; padding-left:18px;">
            ${goalItems.map((t) => `<li>${esc(t)}</li>`).join("")}
          </ul>
        </div>
      ` : ``}

      ${cpItems.length ? `
        <div style="margin-top:12px;">
          <div class="muted"><strong>Milep\xE6ler</strong></div>
          <ul style="margin:6px 0 0 0; padding-left:18px;">
            ${cpItems.map((t) => `<li>${esc(t)}</li>`).join("")}
          </ul>
        </div>
      ` : ``}

      ${dims.length ? `
        <div style="margin-top:12px;">
          <div class="muted"><strong>Dimensjoner</strong></div>
          <div class="hg-chips-row">
            ${dims.map((d) => `<span class="hg-chip">${esc(d)}</span>`).join("")}
          </div>
        </div>
      ` : ``}
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
      const cls = [...document.body.classList].find((c) => c.startsWith("merke-"));
      if (!cls) return;
      const categoryId = cls.replace("merke-", "");
      fillEmnerBox(categoryId);
    });
  })();
})();
//# sourceMappingURL=knowledge.js.map
