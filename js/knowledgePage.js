// js/knowledgePage.js
(function () {
  "use strict";

  function s(value) {
    return String(value == null ? "" : value).trim();
  }

  function esc(value) {
    return s(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function pct(value) {
    const n = Number(value || 0);
    return Math.max(0, Math.min(100, Number.isFinite(n) ? Math.round(n) : 0));
  }

  function subjectHref(subjectId) {
    return `knowledge.html?subject=${encodeURIComponent(subjectId)}`;
  }

  function sourceLabel(entry) {
    const source = entry?.source || {};
    if (source.place_id) return `Sted: ${source.place_id}`;
    if (source.person_id) return `Person: ${source.person_id}`;
    if (source.target_id) return `Kilde: ${source.target_id}`;
    if (source.quiz_id) return `Quiz: ${source.quiz_id}`;
    return source.type === "legacy_quiz_knowledge" ? "Eldre quizkunnskap" : "Quiz";
  }

  function renderSummary(profile) {
    const summary = profile?.summary || {};
    const root = document.getElementById("knowledgeSummary");
    if (!root) return;

    root.innerHTML = `
      <article class="kv2-stat"><strong>${Number(summary.knowledge_count || 0)}</strong><span>Kunnskapspunkter</span></article>
      <article class="kv2-stat"><strong>${Number(summary.subject_count || 0)}</strong><span>Fagfelt</span></article>
      <article class="kv2-stat"><strong>${Number(summary.concept_count || 0)}</strong><span>Begreper</span></article>
      <article class="kv2-stat ${Number(summary.unresolved_count || 0) ? "has-warning" : ""}"><strong>${Number(summary.linked_count || 0)}</strong><span>Koblet til emner</span></article>
    `;
  }

  function renderSubjectNav(profile, selectedSubjectId) {
    const root = document.getElementById("knowledgeSubjectNav");
    if (!root) return;

    const subjects = Object.values(profile?.subjects || {})
      .sort((a, b) => Number(b.knowledge_count || 0) - Number(a.knowledge_count || 0) || s(a.label).localeCompare(s(b.label), "nb"));

    root.innerHTML = [
      `<a class="kv2-subject-pill ${selectedSubjectId ? "" : "is-active"}" href="knowledge.html">Alle</a>`,
      ...subjects.map((subject) => `
        <a class="kv2-subject-pill ${selectedSubjectId === subject.subject_id ? "is-active" : ""}" href="${subjectHref(subject.subject_id)}">
          <span>${esc(subject.label)}</span><small>${Number(subject.knowledge_count || 0)}</small>
        </a>
      `)
    ].join("");
  }

  function renderConcepts(concepts, limit = 24) {
    const rows = Array.isArray(concepts) ? concepts.slice(0, limit) : [];
    if (!rows.length) return `<p class="kv2-empty">Ingen begreper er koblet til knowledge ennå.</p>`;

    return `<div class="kv2-concepts">${rows.map((concept) => `
      <span class="kv2-concept">${esc(concept.label)}<small>${Number(concept.count || 0)}</small></span>
    `).join("")}</div>`;
  }

  function renderAll(profile) {
    const subjects = Object.values(profile?.subjects || {})
      .sort((a, b) => Number(b.knowledge_count || 0) - Number(a.knowledge_count || 0) || s(a.label).localeCompare(s(b.label), "nb"));
    const active = subjects.filter((subject) => Number(subject.knowledge_count || 0) > 0);
    const root = document.getElementById("knowledgeContent");
    if (!root) return;

    root.innerHTML = `
      <section class="kv2-panel">
        <div class="kv2-panel-head">
          <div><span class="kv2-eyebrow">Ditt kunnskapskart</span><h2>Hva du faktisk har lært</h2></div>
          <span class="kv2-panel-meta">Kun quiz og quiz-lignende vurderinger skaper Knowledge.</span>
        </div>
        ${renderConcepts(profile?.concepts || [], 30)}
      </section>

      <section class="kv2-panel">
        <div class="kv2-panel-head">
          <div><span class="kv2-eyebrow">Fagfelt</span><h2>Kunnskapen din, systematisert</h2></div>
        </div>
        ${active.length ? `<div class="kv2-subject-grid">${active.map((subject) => {
          const linked = Number(subject.linked_count || 0);
          const total = Number(subject.knowledge_count || 0);
          const linkedPercent = total ? pct((linked / total) * 100) : 0;
          return `
            <a class="kv2-subject-card" href="${subjectHref(subject.subject_id)}">
              <div class="kv2-subject-card-top"><h3>${esc(subject.label)}</h3><strong>${total}</strong></div>
              <p>${linked} av ${total} kunnskapspunkter er koblet til emner.</p>
              <div class="kv2-progress"><span style="width:${linkedPercent}%"></span></div>
              <div class="kv2-subject-card-foot"><span>${Number(subject.concepts?.length || 0)} begreper</span><span>Åpne →</span></div>
            </a>`;
        }).join("")}</div>` : `<p class="kv2-empty">Ingen Knowledge er samlet ennå. Riktige quiz-svar vil bygge profilen her.</p>`}
      </section>
    `;
  }

  function renderEntry(entry) {
    const emneIds = Array.isArray(entry?.resolved_emne_ids) ? entry.resolved_emne_ids : [];
    const concepts = Array.isArray(entry?.concepts) ? entry.concepts : [];
    return `
      <article class="kv2-entry">
        <div class="kv2-entry-head">
          <strong>${esc(entry?.topic || "Kunnskap")}</strong>
          <span>${esc(entry?.dimension || "generelt")}</span>
        </div>
        <p>${esc(entry?.text || "")}</p>
        ${concepts.length ? `<div class="kv2-entry-concepts">${concepts.map((concept) => `<span>${esc(concept)}</span>`).join("")}</div>` : ""}
        <div class="kv2-entry-source">
          <span>${esc(sourceLabel(entry))}</span>
          ${emneIds.length ? `<span>Emne: ${emneIds.map(esc).join(", ")}</span>` : `<span class="kv2-warning-text">Mangler emnekobling</span>`}
        </div>
      </article>
    `;
  }

  function renderSubject(subject) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;

    const linkedEmner = (subject?.emner || []).filter((emne) => Number(emne.knowledge_count || 0) > 0);
    const emptyEmner = (subject?.emner || []).filter((emne) => Number(emne.knowledge_count || 0) === 0);
    const dimensions = new Map();
    (subject?.entries || []).forEach((entry) => {
      const key = s(entry?.dimension || "generelt") || "generelt";
      if (!dimensions.has(key)) dimensions.set(key, []);
      dimensions.get(key).push(entry);
    });

    const coursePercent = pct(subject?.course?.course?.percent);
    const courseDone = Number(subject?.course?.course?.done || 0);
    const courseTotal = Number(subject?.course?.course?.total || 0);

    root.innerHTML = `
      <section class="kv2-panel kv2-subject-hero">
        <a class="kv2-back" href="knowledge.html">← Hele kunnskapsprofilen</a>
        <span class="kv2-eyebrow">Fagfelt</span>
        <h2>${esc(subject.label)}</h2>
        <p>${Number(subject.knowledge_count || 0)} kunnskapspunkter · ${Number(subject.concepts?.length || 0)} begreper · ${Number(subject.linked_count || 0)} koblet til emner</p>
        ${Number(subject.unresolved_count || 0) ? `<div class="kv2-warning">${Number(subject.unresolved_count || 0)} eldre eller svakt merkede kunnskapspunkter mangler sikker emnekobling. De er bevart og vises fortsatt.</div>` : ""}
      </section>

      ${courseTotal ? `<section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Progresjon</span><h2>Kursstatus</h2></div><strong>${coursePercent}%</strong></div>
        <div class="kv2-progress kv2-progress-large"><span style="width:${coursePercent}%"></span></div>
        <p class="kv2-muted">${courseDone} av ${courseTotal} moduler fullført. Progresjon tolker Knowledge og læringslogg, men er ikke det samme som Knowledge.</p>
      </section>` : ""}

      <section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Begreper</span><h2>Språket du har jobbet med</h2></div></div>
        ${renderConcepts(subject.concepts || [], 40)}
      </section>

      <section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Emner</span><h2>Hvor kunnskapen hører hjemme</h2></div></div>
        ${linkedEmner.length ? `<div class="kv2-emne-list">${linkedEmner.map((emne) => `
          <details class="kv2-emne" open>
            <summary><span><strong>${esc(emne.title)}</strong><small>${Number(emne.knowledge_count || 0)} kunnskapspunkter</small></span><span>＋</span></summary>
            ${emne.description ? `<p class="kv2-muted">${esc(emne.description)}</p>` : ""}
            ${emne.entries.map(renderEntry).join("")}
          </details>
        `).join("")}</div>` : `<p class="kv2-empty">Knowledge finnes i dette faget, men ingen kunnskapspunkter er sikkert koblet til et definert emne ennå.</p>`}
        ${emptyEmner.length ? `<details class="kv2-empty-emner"><summary>Vis ${emptyEmner.length} emner du ikke har Knowledge i ennå</summary><div>${emptyEmner.map((emne) => `<span>${esc(emne.title)}</span>`).join("")}</div></details>` : ""}
      </section>

      <section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Arkiv</span><h2>Alle kunnskapspunkter</h2></div></div>
        ${dimensions.size ? Array.from(dimensions.entries()).map(([dimension, entries]) => `
          <section class="kv2-dimension">
            <h3>${esc(dimension.charAt(0).toUpperCase() + dimension.slice(1))}</h3>
            ${entries.map(renderEntry).join("")}
          </section>
        `).join("") : `<p class="kv2-empty">Ingen kunnskapspunkter i dette faget ennå.</p>`}
      </section>
    `;
  }

  async function boot() {
    const loading = document.getElementById("knowledgeLoading");
    const error = document.getElementById("knowledgeError");
    const params = new URLSearchParams(location.search);
    const subjectId = s(params.get("subject"));

    if (!window.HGKnowledgeV2?.buildProfile) {
      if (loading) loading.hidden = true;
      if (error) {
        error.hidden = false;
        error.textContent = "Knowledge V2 kunne ikke lastes.";
      }
      return;
    }

    try {
      const profile = await window.HGKnowledgeV2.buildProfile();
      window.hgKnowledgeProfileV2 = profile;
      renderSummary(profile);
      renderSubjectNav(profile, subjectId);

      if (subjectId && profile.subjects?.[subjectId]) renderSubject(profile.subjects[subjectId]);
      else renderAll(profile);

      if (loading) loading.hidden = true;
    } catch (err) {
      console.error("[KnowledgePage]", err);
      if (loading) loading.hidden = true;
      if (error) {
        error.hidden = false;
        error.textContent = "Kunne ikke bygge kunnskapsprofilen akkurat nå.";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
