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

  function renderPlaceContext(registry, placeId, subjectId, chapterId) {
    const host = document.getElementById('fagverkPlaceContext');
    if (!host) return;
    const placeLink = registry?.placeLinks?.[placeId];
    if (!placeLink) {
      host.hidden = true;
      return;
    }
    const concepts = list(placeLink.concepts).slice(0, 8);
    host.innerHTML = `
      <p class="fagverk-kicker">Knyttet til sted</p>
      <h2>${escapeHtml(placeId === 'regjeringskvartalet' ? 'Regjeringskvartalet' : placeId)}</h2>
      <p>${escapeHtml(placeLink.intro)}</p>
      <div class="fagverk-place-concepts">
        ${concepts.map((concept) => `<a href="${escapeHtml(chapterUrl(subjectId, chapterId, { place: placeId, concept }))}">${escapeHtml(concept)}</a>`).join('')}
      </div>
      <a class="fagverk-map-link" href="index.html#/place/${encodeURIComponent(placeId)}">Åpne stedet i kartet →</a>
    `;
    host.hidden = false;
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

  function renderSelfCheck(chapter) {
    const host = document.getElementById('fagverkSelfCheck');
    if (!host) return;
    host.innerHTML = list(chapter.selfCheck).map((item, index) => `
      <details class="fagverk-question">
        <summary><span>${index + 1}</span>${escapeHtml(item.question)}</summary>
        <p>${escapeHtml(item.answer)}</p>
      </details>
    `).join('');
  }

  function renderCases(chapter) {
    const host = document.getElementById('fagverkCases');
    if (!host) return;
    host.innerHTML = list(chapter.relatedPlaces).map((place) => `
      <a class="fagverk-case" href="index.html#/place/${encodeURIComponent(text(place.id))}">
        <strong>${escapeHtml(place.name)}</strong>
        <span>${escapeHtml(place.role)}</span>
        <small>Åpne sted →</small>
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
      const chapter = await fetchJson(chapterMeta.file);

      document.title = `${chapter.title} – History Go Fagverk`;
      document.getElementById('fagverkSubjectTitle').textContent = subject.title;
      document.getElementById('fagverkSubjectDescription').textContent = subject.description;
      document.getElementById('fagverkChapterKicker').textContent = subject.title;
      document.getElementById('fagverkChapterTitle').textContent = chapter.title;
      document.getElementById('fagverkChapterSubtitle').textContent = chapter.subtitle;
      document.getElementById('fagverkLead').textContent = chapter.lead;

      renderChapterNav(registry, subjectId, chapter.id, placeId);
      renderPlaceContext(registry, placeId, subjectId, chapter.id);
      renderObjectives(chapter);
      renderContents(chapter);
      renderSections(chapter);
      renderConcepts(chapter, selectedConcept);
      renderSelfCheck(chapter);
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
