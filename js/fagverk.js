// @ts-nocheck
// js/fagverk.js
(function installFagverkPage(global) {
  'use strict';

  const REGISTRY_URL = 'data/fagverk/fagverk_registry.json';

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function slug(value) {
    return text(value)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.json();
  }

  function chapterUrl(subject, chapter, extras = {}) {
    const params = new URLSearchParams({ subject, chapter });
    Object.entries(extras).forEach(([key, value]) => {
      const normalized = text(value);
      if (normalized) params.set(key, normalized);
    });
    return `fagverk.html?${params.toString()}`;
  }

  function placePageUrl(placeId) {
    return `fagverk-sted.html?place=${encodeURIComponent(text(placeId))}`;
  }

  async function hydrateChapter(chapter) {
    const files = list(chapter?.moduleFiles);
    if (!files.length) return chapter;
    const modules = await Promise.all(files.map(fetchJson));
    const merged = { ...chapter };
    for (const module of modules) {
      for (const [key, value] of Object.entries(module || {})) {
        if (Array.isArray(value)) merged[key] = [...list(merged[key]), ...value];
        else if (value && typeof value === 'object') merged[key] = { ...(merged[key] || {}), ...value };
        else if (value != null) merged[key] = value;
      }
    }
    return merged;
  }

  function renderChapterNav(registry, subjectId, chapterId, placeId) {
    const host = document.getElementById('fagverkChapterNav');
    const subject = registry?.subjects?.[subjectId];
    if (!host || !subject) return;
    host.innerHTML = list(subject.chapters).map((chapter) => {
      const active = text(chapter.id) === chapterId;
      return `<a class="fagverk-chapter-link${active ? ' is-active' : ''}" href="${escapeHtml(chapterUrl(subjectId, chapter.id, { place: placeId }))}">
        <strong>${escapeHtml(chapter.title)}</strong>
        <span>${escapeHtml(chapter.subtitle)}</span>
      </a>`;
    }).join('');
  }

  function renderPlaceContext(registry, placeId) {
    const host = document.getElementById('fagverkPlaceContext');
    if (!host) return;
    const normalized = text(placeId);
    if (!normalized) {
      host.hidden = true;
      return;
    }
    const placeLink = registry?.placeLinks?.[normalized] || {};
    const title = text(placeLink.title) || normalized.replaceAll('_', ' ');
    host.innerHTML = `
      <p class="fagverk-kicker">Du kom fra et sted</p>
      <h2>${escapeHtml(title)}</h2>
      <p>Fagkapittelet forklarer den generelle kunnskapen. Stedets egen side samler perspektivene rundt akkurat dette stedet.</p>
      <a class="fagverk-map-link" href="${escapeHtml(placePageUrl(normalized))}">Tilbake til stedets fagverkside →</a>
    `;
    host.hidden = false;
  }

  function renderDetails(hostId, items, numbered = false) {
    const host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML = list(items).map((item, index) => `
      <details class="fagverk-question">
        <summary>${numbered ? `<span>${index + 1}</span>` : ''}${escapeHtml(item.question)}</summary>
        <p>${escapeHtml(item.answer)}</p>
      </details>
    `).join('');
  }

  function renderObjectives(chapter) {
    const host = document.getElementById('fagverkObjectives');
    if (!host) return;
    host.innerHTML = list(chapter.learningObjectives)
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');
  }

  function renderContents(chapter) {
    const host = document.getElementById('fagverkContents');
    if (!host) return;
    host.innerHTML = list(chapter.sections).map((section) => {
      const id = text(section.id) || slug(section.title);
      return `<a href="#${escapeHtml(id)}">${escapeHtml(section.title)}</a>`;
    }).join('');
  }

  function renderSections(chapter) {
    const host = document.getElementById('fagverkSections');
    if (!host) return;
    host.innerHTML = list(chapter.sections).map((section) => {
      const id = text(section.id) || slug(section.title);
      return `<section class="fagverk-section" id="${escapeHtml(id)}">
        <h3>${escapeHtml(section.title)}</h3>
        <div class="fagverk-prose">
          ${list(section.paragraphs).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </div>
        ${list(section.keyPoints).length ? `<div class="fagverk-keypoints">
          <h4>Hovedpoenger</h4>
          <ul>${list(section.keyPoints).map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
        </div>` : ''}
      </section>`;
    }).join('');
  }

  function renderExamples(chapter) {
    const host = document.getElementById('fagverkExamples');
    if (!host) return;
    host.innerHTML = list(chapter.workedExamples).map((example) => `
      <article class="fagverk-learning-card">
        <p class="fagverk-kicker">Arbeidseksempel</p>
        <h4>${escapeHtml(example.title)}</h4>
        <p>${escapeHtml(example.situation)}</p>
        <ol>${list(example.analysis).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
      </article>
    `).join('');
  }

  function renderMisconceptions(chapter) {
    const host = document.getElementById('fagverkMisconceptions');
    if (!host) return;
    host.innerHTML = list(chapter.commonMisconceptions).map((item) => `
      <article class="fagverk-learning-card fagverk-misconception">
        <p class="fagverk-kicker">Påstand</p>
        <h4>${escapeHtml(item.claim)}</h4>
        <p>${escapeHtml(item.correction)}</p>
      </article>
    `).join('');
  }

  function renderConcepts(chapter, selectedConcept) {
    const host = document.getElementById('fagverkConceptGrid');
    if (!host) return;
    const selected = text(selectedConcept).toLocaleLowerCase('nb-NO');
    host.innerHTML = list(chapter.concepts).map((concept) => {
      const term = text(concept.term);
      const active = selected && [term, text(concept.id)].some((value) => value.toLocaleLowerCase('nb-NO') === selected);
      return `<article class="fagverk-concept${active ? ' is-highlighted' : ''}" id="concept-${escapeHtml(text(concept.id) || slug(term))}">
        <h4>${escapeHtml(term)}</h4>
        <p>${escapeHtml(concept.definition)}</p>
      </article>`;
    }).join('');

    if (selected) {
      const highlighted = host.querySelector('.is-highlighted');
      if (highlighted) global.setTimeout(() => highlighted.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
    }
  }

  function renderApplication(chapter) {
    const host = document.getElementById('fagverkApplication');
    if (!host) return;
    host.innerHTML = list(chapter.applicationTasks).map((item, index) => `
      <article class="fagverk-learning-card">
        <p class="fagverk-kicker">Oppgave ${index + 1}</p>
        <h4>${escapeHtml(item.task)}</h4>
        <ul>${list(item.prompts).map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join('')}</ul>
      </article>
    `).join('');
  }

  function renderCases(chapter) {
    const host = document.getElementById('fagverkCases');
    if (!host) return;
    host.innerHTML = list(chapter.relatedPlaces).map((place) => `
      <a class="fagverk-case" href="${escapeHtml(placePageUrl(place.id))}">
        <strong>${escapeHtml(place.name)}</strong>
        <span>${escapeHtml(place.role)}</span>
        <small>Åpne stedets fagverkside →</small>
      </a>
    `).join('');
  }

  function renderSources(chapter) {
    const host = document.getElementById('fagverkSources');
    if (!host) return;
    host.innerHTML = list(chapter.sources).map((source) => `
      <li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a></li>
    `).join('');
  }

  async function init() {
    const params = new URLSearchParams(global.location.search);
    const subjectId = text(params.get('subject')) || 'politikk';
    const requestedChapter = text(params.get('chapter'));
    const placeId = text(params.get('place'));
    const selectedConcept = text(params.get('concept'));

    const loading = document.getElementById('fagverkLoading');
    const content = document.getElementById('fagverkContent');
    const errorBox = document.getElementById('fagverkError');

    try {
      const registry = await fetchJson(REGISTRY_URL);
      const subject = registry?.subjects?.[subjectId];
      if (!subject) throw new Error(`Ukjent fag: ${subjectId}`);
      const chapters = list(subject.chapters);
      const chapterMeta = chapters.find((chapter) => text(chapter.id) === requestedChapter) || chapters[0];
      if (!chapterMeta) throw new Error(`Faget ${subjectId} har ingen kapitler.`);
      const chapter = await hydrateChapter(await fetchJson(chapterMeta.file));

      document.title = `${chapter.title} – History Go Fagverk`;
      document.getElementById('fagverkSubjectTitle').textContent = subject.title;
      document.getElementById('fagverkSubjectDescription').textContent = subject.description;
      document.getElementById('fagverkChapterKicker').textContent = subject.title;
      document.getElementById('fagverkChapterTitle').textContent = chapter.title;
      document.getElementById('fagverkChapterSubtitle').textContent = chapter.subtitle;
      document.getElementById('fagverkLead').textContent = chapter.lead;

      renderChapterNav(registry, subjectId, chapter.id, placeId);
      renderPlaceContext(registry, placeId);
      renderDetails('fagverkDiagnostic', chapter.diagnosticQuestions);
      renderObjectives(chapter);
      renderContents(chapter);
      renderSections(chapter);
      renderExamples(chapter);
      renderMisconceptions(chapter);
      renderConcepts(chapter, selectedConcept);
      renderApplication(chapter);
      renderDetails('fagverkSelfCheck', chapter.selfCheck, true);
      renderCases(chapter);
      renderSources(chapter);

      loading.hidden = true;
      content.hidden = false;
      errorBox.hidden = true;
    } catch (error) {
      loading.hidden = true;
      content.hidden = true;
      errorBox.hidden = false;
      errorBox.textContent = `Læreverket kunne ikke lastes: ${error.message}`;
      console.error('[fagverk]', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window);
