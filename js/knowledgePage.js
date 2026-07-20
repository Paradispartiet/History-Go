// js/knowledgePage.js
(function () {
  "use strict";

  const SUBJECT_ICONS = Object.freeze({
    historie: "⌛",
    vitenskap: "✦",
    kunst: "◇",
    natur: "♧",
    musikk: "♫",
    populaerkultur: "★",
    subkultur: "⚡",
    sport: "●",
    by: "▦",
    politikk: "◎",
    naeringsliv: "↗",
    litteratur: "¶",
    psykologi: "◉"
  });

  let activeProfile = null;
  let activeSubjectId = "";

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

  function humanizeId(value) {
    return s(value)
      .replace(/^em_[a-z]+_/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function subjectHref(subjectId) {
    return `knowledge.html?subject=${encodeURIComponent(subjectId)}`;
  }

  function subjectIcon(subjectId) {
    return SUBJECT_ICONS[s(subjectId)] || "•";
  }

  function sourceLabel(entry) {
    const source = entry?.source || {};
    if (source.place_id) return `Sted · ${humanizeId(source.place_id)}`;
    if (source.person_id) return `Person · ${humanizeId(source.person_id)}`;
    if (source.target_id) return `Kilde · ${humanizeId(source.target_id)}`;
    if (source.quiz_id) return `Quiz · ${humanizeId(source.quiz_id)}`;
    return source.type === "legacy_quiz_knowledge" ? "Eldre quizkunnskap" : "Quiz";
  }

  function renderSummary(profile) {
    const summary = profile?.summary || {};
    const root = document.getElementById("knowledgeSummary");
    if (!root) return;

    root.innerHTML = `
      <article class="kv2-stat"><strong>${Number(summary.knowledge_count || 0)}</strong><span>Kunnskapspunkter</span></article>
      <article class="kv2-stat"><strong>${Number(summary.subject_count || 0)}</strong><span>Fag med kunnskap</span></article>
      <article class="kv2-stat"><strong>${Number(summary.concept_count || 0)}</strong><span>Begreper</span></article>
      <article class="kv2-stat ${Number(summary.unresolved_count || 0) ? "has-warning" : ""}"><strong>${Number(summary.linked_count || 0)}</strong><span>Koblet til emner</span></article>
    `;
  }

  function sortedSubjects(profile) {
    return Object.values(profile?.subjects || {})
      .sort((a, b) => Number(b.knowledge_count || 0) - Number(a.knowledge_count || 0) || s(a.label).localeCompare(s(b.label), "nb"));
  }

  function renderSubjectNav(profile, selectedSubjectId) {
    const root = document.getElementById("knowledgeSubjectNav");
    if (!root) return;

    const subjects = sortedSubjects(profile);
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
    if (!rows.length) return `<p class="kv2-empty">Ingen begreper er koblet til kunnskapen ennå.</p>`;

    return `<div class="kv2-concepts">${rows.map((concept) => `
      <span class="kv2-concept">${esc(concept.label)}<small>${Number(concept.count || 0)}</small></span>
    `).join("")}</div>`;
  }

  function allEntries(profile) {
    return sortedSubjects(profile).flatMap((subject) => (subject.entries || []).map((entry) => ({
      ...entry,
      _subject_id: subject.subject_id,
      _subject_label: subject.label
    })));
  }

  function recentEntries(profile, limit = 7) {
    return allEntries(profile)
      .sort((a, b) => {
        const at = Date.parse(a.last_seen_at || a.learned_at || 0) || 0;
        const bt = Date.parse(b.last_seen_at || b.learned_at || 0) || 0;
        return bt - at;
      })
      .slice(0, limit);
  }

  function renderRecent(profile) {
    const entries = recentEntries(profile);
    if (!entries.length) return `<p class="kv2-empty">Ingen quizkunnskap er samlet ennå.</p>`;

    return `<div class="kv2-recent-list">${entries.map((entry) => `
      <article class="kv2-recent-item">
        <span class="kv2-recent-meta">${esc(entry._subject_label)} · ${esc(sourceLabel(entry))}</span>
        <a href="${subjectHref(entry._subject_id)}">${esc(entry.topic || "Kunnskap")}</a>
        <p>${esc(entry.text || "")}</p>
      </article>
    `).join("")}</div>`;
  }

  function renderSubjectRows(profile) {
    const subjects = sortedSubjects(profile);
    return `<div class="kv2-subject-list">${subjects.map((subject) => {
      const linked = Number(subject.linked_count || 0);
      const total = Number(subject.knowledge_count || 0);
      const linkedPercent = total ? pct((linked / total) * 100) : 0;
      const meta = total
        ? `${linked} av ${total} plassert i emner`
        : "Ingen kunnskap samlet ennå";
      return `
        <a class="kv2-subject-row" href="${subjectHref(subject.subject_id)}">
          <div class="kv2-subject-row-main">
            <div class="kv2-subject-row-title"><span aria-hidden="true">${subjectIcon(subject.subject_id)}</span><strong>${esc(subject.label)}</strong></div>
            <p>${meta}</p>
            <div class="kv2-progress"><span style="width:${linkedPercent}%"></span></div>
          </div>
          <strong class="kv2-subject-row-count">${total}</strong>
        </a>`;
    }).join("")}</div>`;
  }

  function renderAll(profile) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;

    root.innerHTML = `
      <div class="kv2-overview-grid">
        <section class="kv2-panel">
          <div class="kv2-panel-head">
            <div><span class="kv2-eyebrow">Fag</span><h2>Kunnskapskartet ditt</h2></div>
            <span class="kv2-panel-meta">Trykk på et fag for å se emnene kunnskapen er koblet til.</span>
          </div>
          ${renderSubjectRows(profile)}
        </section>

        <div class="kv2-side-stack">
          <section class="kv2-panel">
            <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Sist lært</span><h2>Nylig kunnskap</h2></div></div>
            ${renderRecent(profile)}
          </section>
          <section class="kv2-panel">
            <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Begreper</span><h2>Det du møter oftest</h2></div></div>
            ${renderConcepts(profile?.concepts || [], 18)}
          </section>
        </div>
      </div>
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
          ${emneIds.length ? `<span>${emneIds.map((id) => esc(humanizeId(id))).join(" · ")}</span>` : `<span class="kv2-warning-text">Ikke plassert i emne</span>`}
        </div>
      </article>
    `;
  }

  function renderEmner(subject) {
    const linkedEmner = (subject?.emner || []).filter((emne) => Number(emne.knowledge_count || 0) > 0);
    if (!linkedEmner.length) return `<p class="kv2-empty">Kunnskap finnes i dette faget, men er ikke sikkert plassert i definerte emner ennå.</p>`;

    const seen = new Set();
    const rows = [];
    for (const emne of linkedEmner) {
      const entries = (emne.entries || []).filter((entry) => {
        const key = s(entry?.id) || `${s(entry?.topic)}|${s(entry?.text)}`;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (!entries.length) continue;
      rows.push({ ...emne, entries });
    }

    return `<div class="kv2-emne-list">${rows.map((emne, index) => `
      <details class="kv2-emne" ${index === 0 ? "open" : ""}>
        <summary>
          <span><strong>${esc(emne.title)}</strong><small>${Number(emne.entries.length || 0)} kunnskapspunkt${emne.entries.length === 1 ? "" : "er"}</small></span>
          <span class="kv2-emne-toggle" aria-hidden="true">＋</span>
        </summary>
        <div class="kv2-emne-body">
          ${emne.description ? `<p class="kv2-muted">${esc(emne.description)}</p>` : ""}
          ${emne.entries.map(renderEntry).join("")}
        </div>
      </details>
    `).join("")}</div>`;
  }

  function renderSubject(subject) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;

    const emptyEmner = (subject?.emner || []).filter((emne) => Number(emne.knowledge_count || 0) === 0);
    const unresolvedEntries = (subject?.entries || []).filter((entry) => !(entry?.resolved_emne_ids || []).length);
    const coursePercent = pct(subject?.course?.course?.percent);
    const courseDone = Number(subject?.course?.course?.done || 0);
    const courseTotal = Number(subject?.course?.course?.total || 0);

    root.innerHTML = `
      <section class="kv2-panel kv2-subject-hero">
        <a class="kv2-back" href="knowledge.html">← Alle fag</a>
        <span class="kv2-eyebrow">${subjectIcon(subject.subject_id)} Fag</span>
        <h2>${esc(subject.label)}</h2>
        <div class="kv2-subject-metrics">
          <span>${Number(subject.knowledge_count || 0)} kunnskapspunkter</span>
          <span>${Number(subject.concepts?.length || 0)} begreper</span>
          <span>${Number(subject.linked_count || 0)} plassert i emner</span>
        </div>
        ${Number(subject.unresolved_count || 0) ? `<div class="kv2-warning">${Number(subject.unresolved_count || 0)} kunnskapspunkt${Number(subject.unresolved_count || 0) === 1 ? "" : "er"} er bevart, men mangler sikker emnekobling.</div>` : ""}
      </section>

      ${courseTotal ? `<section class="kv2-panel">
        <div class="kv2-course-row"><div><span class="kv2-eyebrow">Progresjon</span><h2>Kursstatus</h2></div><strong>${coursePercent}%</strong></div>
        <div class="kv2-progress kv2-progress-large"><span style="width:${coursePercent}%"></span></div>
        <p class="kv2-muted">${courseDone} av ${courseTotal} moduler fullført.</p>
      </section>` : ""}

      <section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Emner</span><h2>Hvor kunnskapen hører hjemme</h2></div></div>
        ${renderEmner(subject)}
        ${emptyEmner.length ? `<details class="kv2-empty-emners"><summary>Vis ${emptyEmner.length} emner uten samlet kunnskap</summary><div>${emptyEmner.map((emne) => `<span>${esc(emne.title)}</span>`).join("")}</div></details>` : ""}
      </section>

      ${subject.concepts?.length ? `<section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Begreper</span><h2>Begrepene i dette faget</h2></div></div>
        ${renderConcepts(subject.concepts || [], 36)}
      </section>` : ""}

      ${unresolvedEntries.length ? `<section class="kv2-panel">
        <div class="kv2-panel-head"><div><span class="kv2-eyebrow">Uplassert</span><h2>Mangler emnekobling</h2></div><span class="kv2-panel-meta">Disse er ikke tapt. De venter på en sikker kobling.</span></div>
        <div class="kv2-unresolved-list">${unresolvedEntries.map(renderEntry).join("")}</div>
      </section>` : ""}
    `;
  }

  function entryMatches(entry, query) {
    const haystack = [
      entry?._subject_label,
      entry?.topic,
      entry?.text,
      entry?.dimension,
      sourceLabel(entry),
      ...(entry?.concepts || []),
      ...(entry?.resolved_emne_ids || []).map(humanizeId)
    ].map(s).join(" ").toLowerCase();
    return haystack.includes(query);
  }

  function renderSearch(profile, rawQuery) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;
    const query = s(rawQuery).toLowerCase();
    if (!query) return renderCurrentView();

    const matches = allEntries(profile).filter((entry) => entryMatches(entry, query)).slice(0, 60);
    root.innerHTML = `
      <section class="kv2-panel">
        <div class="kv2-panel-head">
          <div><span class="kv2-eyebrow">Søk</span><h2>${matches.length} treff på «${esc(rawQuery)}»</h2></div>
        </div>
        ${matches.length ? `<div class="kv2-search-results">${matches.map((entry) => `
          <article class="kv2-search-result">
            <span class="kv2-search-meta">${esc(entry._subject_label)} · ${esc(sourceLabel(entry))}</span>
            <a href="${subjectHref(entry._subject_id)}">${esc(entry.topic || "Kunnskap")}</a>
            <p>${esc(entry.text || "")}</p>
          </article>
        `).join("")}</div>` : `<p class="kv2-empty">Ingen kunnskap matcher søket.</p>`}
      </section>
    `;
  }

  function renderRouteError(subjectId) {
    const root = document.getElementById("knowledgeContent");
    if (!root) return;
    root.innerHTML = `
      <section class="kv2-panel kv2-route-error">
        <span class="kv2-eyebrow">Ugyldig lenke</span>
        <h2>Faget «${esc(subjectId)}» finnes ikke</h2>
        <p class="kv2-muted">Lenken peker til et fag som ikke finnes i Knowledge-modellen.</p>
        <a href="knowledge.html">Åpne hele kunnskapsprofilen</a>
      </section>
    `;
  }

  function renderCurrentView() {
    if (!activeProfile) return;
    if (!activeSubjectId) return renderAll(activeProfile);
    const subject = activeProfile.subjects?.[activeSubjectId];
    if (subject) renderSubject(subject);
    else renderRouteError(activeSubjectId);
  }

  function bindSearch() {
    const input = document.getElementById("knowledgeSearch");
    if (!(input instanceof HTMLInputElement)) return;
    input.addEventListener("input", () => {
      const query = s(input.value);
      if (query.length < 2) renderCurrentView();
      else renderSearch(activeProfile, query);
    });
  }

  async function boot() {
    const loading = document.getElementById("knowledgeLoading");
    const error = document.getElementById("knowledgeError");
    const params = new URLSearchParams(location.search);
    activeSubjectId = s(params.get("subject"));

    if (!window.HGKnowledgeV2?.buildProfile) {
      if (loading) loading.hidden = true;
      if (error) {
        error.hidden = false;
        error.textContent = "Kunnskapssiden kunne ikke lastes.";
      }
      return;
    }

    try {
      activeProfile = await window.HGKnowledgeV2.buildProfile();
      window.hgKnowledgeProfileV2 = activeProfile;
      renderSummary(activeProfile);
      renderSubjectNav(activeProfile, activeSubjectId);
      renderCurrentView();
      bindSearch();
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
