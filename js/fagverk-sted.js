// @ts-nocheck
// js/fagverk-sted.js
(function installFagverkPlacePage(global) {
  'use strict';

  const REGISTRY_URL = 'data/fagverk/fagverk_registry.json';
  const CONTENT_SCHEMA = 'history_go_place_fagverk_v2';
  const text = (value) => String(value == null ? '' : value).trim();
  const list = (value) => Array.isArray(value) ? value : [];

  function unique(values) {
    const seen = new Set();
    return list(values).map(text).filter((value) => value && !seen.has(value) && seen.add(value));
  }

  function humanizeId(value) {
    const normalized = text(value).replace(/^em_[a-z]+_/u, '').replaceAll('_', ' ').replace(/\s+/gu, ' ');
    return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : '';
  }

  function formatAddress(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return text(value);
    const streetLine = [value.street, value.number].map(text).filter(Boolean).join(' ');
    const locality = [value.postcode, value.city].map(text).filter(Boolean).join(' ');
    return [streetLine, locality].filter(Boolean).join(', ');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function isHttpUrl(value) {
    try {
      const url = new URL(text(value));
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.json();
  }

  function placeTitle(place, placeId) {
    return text(place?.name || place?.title) || placeId.replaceAll('_', ' ');
  }

  function placeCategory(place) {
    return text(place?.category || place?.domain || place?.subject);
  }

  function subjectUrl(subjectId, extras = {}) {
    const model = global.HGFagverkSubjectModel;
    if (model?.subjectUrl) return model.subjectUrl(subjectId, extras);
    const params = new URLSearchParams({ subject: text(subjectId) });
    for (const [key, value] of Object.entries(extras)) if (text(value)) params.set(key, text(value));
    return `fagverk.html?${params.toString()}`;
  }

  function domainUrl(subjectId, domainId, extras = {}) {
    const model = global.HGFagverkSubjectModel;
    return model?.domainUrl
      ? model.domainUrl(subjectId, domainId, extras)
      : subjectUrl(subjectId, { domain: domainId, ...extras });
  }

  function emneUrl(subjectId, domainId, emneId, extras = {}) {
    const model = global.HGFagverkSubjectModel;
    return model?.emneUrl
      ? model.emneUrl(subjectId, domainId, emneId, extras)
      : subjectUrl(subjectId, { domain: domainId, emne: emneId, ...extras });
  }

  function chapterUrl(subjectId, chapterId, extras = {}) {
    const model = global.HGFagverkSubjectModel;
    return model?.chapterUrl
      ? model.chapterUrl(subjectId, chapterId, extras)
      : subjectUrl(subjectId, { chapter: chapterId, ...extras });
  }

  async function modelFor(registry, place, placeId) {
    const fagverk = place?.fagverk?.schema === CONTENT_SCHEMA ? place.fagverk : null;
    const fallbackSubject = text(registry?.placePage?.fallbackSubjectByCategory?.[placeCategory(place)]);
    const subjectIds = unique(fagverk ? fagverk.subject_ids : [fallbackSubject]);
    const loadedSubjects = await Promise.all(subjectIds.map(async (id) => ({
      id,
      model: global.HGFagverkSubjectModel
        ? await global.HGFagverkSubjectModel.load(id, { allowPlanned: true })
        : null
    })));
    const subjectModelsById = new Map(loadedSubjects.map((entry) => [entry.id, entry.model]));
    const requestedEmneIds = unique(fagverk ? fagverk.emne_ids : (place?.emne_ids || place?.emneIds));
    const emners = [];
    const missingEmneIds = [];

    for (const id of requestedEmneIds) {
      const owner = loadedSubjects.find((entry) => entry.model?.emnersById?.has(id));
      if (!owner) {
        missingEmneIds.push(id);
        continue;
      }
      emners.push({ ...owner.model.emnersById.get(id), subjectId: owner.id });
    }

    const domainKeys = new Set();
    const domains = [];
    for (const emne of emners) {
      const key = `${emne.subjectId}:${emne.domainId}`;
      const domain = subjectModelsById.get(emne.subjectId)?.domainsById?.get(emne.domainId);
      if (domain && !domainKeys.has(key)) {
        domainKeys.add(key);
        domains.push({ ...domain, subjectId: emne.subjectId });
      }
    }

    const chapterIds = new Set(unique(fagverk?.chapter_ids));
    const chapters = loadedSubjects.flatMap(({ id, model }) => list(model?.chapters)
      .filter((chapter) => chapterIds.has(chapter.id))
      .map((chapter) => ({ ...chapter, subjectId: id })));

    return {
      fagverk,
      curated: fagverk?.status === 'curated',
      subject: subjectIds[0] || '',
      subjectIds,
      subjects: loadedSubjects,
      subjectModel: loadedSubjects[0]?.model || null,
      subjectModelsById,
      requestedEmneIds,
      missingEmneIds,
      emners,
      domains,
      chapters,
      concepts: unique(fagverk?.concepts).slice(0, 36),
      placeId
    };
  }

  function renderBadgePath(model, place) {
    const host = document.getElementById('fagverkPlaceBadgePath');
    if (!host) return;
    const badgeIds = unique(place?.underbadge_ids || place?.underbadgeIds || []);
    if (!model.subjectIds.length && !badgeIds.length) {
      host.hidden = true;
      return;
    }
    const progressUrl = model.subject
      ? `${subjectUrl(model.subject)}#fagverkIaProgresjon`
      : 'fagverk-forside.html';
    const subjectCards = model.subjects.filter((entry) => entry.model).map(({ id, model: subjectModel }) => `
      <a class="fagverk-case" href="${escapeHtml(subjectUrl(id, { place: model.placeId }))}">
        <strong>${escapeHtml(text(subjectModel.subject?.title) || humanizeId(id))}</strong>
        <span>Dokumentert fagkobling</span>
        <small>Åpne faget →</small>
      </a>
    `).join('');
    host.innerHTML = `
      <p class="fagverk-kicker">Fra merke til fag</p>
      <h2>Merke og fag</h2>
      <p>Undermerkene viser stedets merkeidentitet. Fagkortene åpner canonicale fagsider.</p>
      ${badgeIds.length ? `<div class="fagverk-canonical-underbadges">${badgeIds.map((id) => `<a href="${escapeHtml(progressUrl)}">${escapeHtml(humanizeId(id))}<span class="fagverk-link-cue">Åpne progresjon →</span></a>`).join('')}</div>` : ''}
      ${subjectCards ? `<div class="fagverk-canonical-domain-grid">${subjectCards}</div>` : ''}
    `;
    host.hidden = false;
  }

  function lensRows(model) {
    if (!model.curated) return [];
    return list(model.fagverk?.lenses).map((lens) => {
      const subjectId = text(lens.subject_id);
      const emne = model.subjectModelsById.get(subjectId)?.emnersById?.get(text(lens.emne_id));
      if (!emne) return null;
      return {
        title: text(lens.title),
        prompt: text(lens.prompt),
        evidence: text(lens.evidence),
        href: emneUrl(subjectId, emne.domainId, emne.id, { place: model.placeId })
      };
    }).filter((row) => row?.title && row.href);
  }

  function renderArticle(model) {
    const host = document.getElementById('fagverkPlaceArticle');
    if (!host) return;
    const paragraphs = model.curated ? list(model.fagverk?.article).map(text).filter(Boolean) : [];
    host.innerHTML = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  }

  function renderLenses(model) {
    const host = document.getElementById('fagverkPlaceLenses');
    if (!host) return;
    host.innerHTML = lensRows(model).map((row) => `
      <a class="fagverk-learning-card fagverk-place-lens-link" href="${escapeHtml(row.href)}">
        <p class="fagverk-kicker">Faglig linse</p>
        <h3>${escapeHtml(row.title)}</h3>
        <p>${escapeHtml(row.prompt)}</p>
        <small>${escapeHtml(row.evidence)}</small>
        <span class="fagverk-card-action">Utforsk i faget →</span>
      </a>
    `).join('');
  }

  function renderQuestions(model) {
    const host = document.getElementById('fagverkPlaceQuestions');
    if (!host) return;
    const questions = model.curated ? list(model.fagverk?.guiding_questions).map(text).filter(Boolean) : [];
    host.innerHTML = questions.map((question) => `<li>${escapeHtml(question)}</li>`).join('');
  }

  function sourceRows(place) {
    const rows = [];
    for (const item of list(place?.externalLinks || place?.external_links)) {
      if (typeof item === 'string' && isHttpUrl(item)) rows.push({ label: item, url: item });
      else if (item && typeof item === 'object') {
        const url = text(item.url || item.href || item.link);
        if (isHttpUrl(url)) rows.push({ label: text(item.label || item.title || item.name) || url, url });
      }
    }
    const seen = new Set();
    return rows.filter((row) => !seen.has(row.url) && seen.add(row.url));
  }

  function renderTraces(model, place) {
    const host = document.getElementById('fagverkPlaceTraces');
    if (!host) return;
    const sourceByUrl = new Map(sourceRows(place).map((row) => [row.url, row]));
    const rows = model.curated ? list(model.fagverk?.observable_traces) : [];
    host.innerHTML = rows.map((row) => {
      const sourceLinks = list(row.source_urls).map((url) => sourceByUrl.get(url)).filter(Boolean).map((source) => (
        `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a>`
      )).join('');
      return `
        <article class="fagverk-case fagverk-place-trace">
          <strong>${escapeHtml(row.title)}</strong>
          <span>${escapeHtml(row.observation)}</span>
          <small><b>Tolkningsgrense:</b> ${escapeHtml(row.interpretation_boundary)}</small>
          <div class="fagverk-place-trace-sources">${sourceLinks}</div>
        </article>
      `;
    }).join('');
  }

  function renderChapters(model) {
    const section = document.getElementById('fagverkPlaceChaptersSection');
    const host = document.getElementById('fagverkPlaceChapters');
    if (!section || !host) return;
    const domainCards = model.domains.map((domain) => `
      <a class="fagverk-case" href="${escapeHtml(domainUrl(domain.subjectId, domain.id, { place: model.placeId }))}">
        <strong>${escapeHtml(domain.label)}</strong>
        ${text(domain.definition) ? `<span>${escapeHtml(domain.definition)}</span>` : ''}
        <small>Åpne fagområdet →</small>
      </a>
    `);
    const chapterCards = model.chapters.map((chapter) => `
      <a class="fagverk-case" href="${escapeHtml(chapterUrl(chapter.subjectId, chapter.id, { place: model.placeId }))}">
        <strong>${escapeHtml(chapter.title)}</strong>
        ${text(chapter.subtitle) ? `<span>${escapeHtml(chapter.subtitle)}</span>` : ''}
        <small>Les lærekapitlet →</small>
      </a>
    `);
    const cards = [...domainCards, ...chapterCards];
    host.innerHTML = cards.join('');
    section.hidden = cards.length === 0;
  }

  function ownerForConcept(model, concept) {
    const normalized = text(concept).toLocaleLowerCase('nb-NO');
    return model.emners.find((emne) => list(emne.concepts).some((candidate) => text(candidate).toLocaleLowerCase('nb-NO') === normalized)) || model.emners[0] || null;
  }

  function renderConcepts(model) {
    const section = document.getElementById('fagverkPlaceConceptsSection');
    const conceptHost = document.getElementById('fagverkPlaceConcepts');
    const emneHost = document.getElementById('fagverkPlaceEmner');
    if (!section || !conceptHost || !emneHost) return;
    conceptHost.innerHTML = model.curated ? model.concepts.map((concept) => {
      const owner = ownerForConcept(model, concept);
      const href = owner
        ? emneUrl(owner.subjectId, owner.domainId, owner.id, { place: model.placeId, concept })
        : subjectUrl(model.subject, { place: model.placeId, concept });
      return `<a href="${escapeHtml(href)}">${escapeHtml(concept)}</a>`;
    }).join('') : '';
    emneHost.innerHTML = model.emners.map((emne) => (
      `<a href="${escapeHtml(emneUrl(emne.subjectId, emne.domainId, emne.id, { place: model.placeId }))}">${escapeHtml(emne.title)}</a>`
    )).join('');
    section.hidden = model.concepts.length === 0 && model.emners.length === 0;
  }

  function renderSources(model, place) {
    const section = document.getElementById('fagverkPlaceSourcesSection');
    const host = document.getElementById('fagverkPlaceSources');
    if (!section || !host) return;
    const allowed = new Set(model.curated ? list(model.fagverk?.source_urls).map(text) : []);
    const rows = sourceRows(place).filter((row) => allowed.has(row.url));
    host.innerHTML = rows.map((row) => `<li><a href="${escapeHtml(row.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.label)} ↗</a></li>`).join('');
    section.hidden = rows.length === 0;
  }

  async function loadPlace(placeId) {
    if (!global.DataHub) throw new Error('DataHub er ikke tilgjengelig.');
    const full = await global.DataHub.loadFullPlace(placeId, { bust: true }).catch(() => null);
    if (full) return full;
    const places = await global.DataHub.loadPlacesBase({ bust: true });
    return list(places).find((place) => text(place?.id) === placeId) || null;
  }

  function renderCoverageStatus(model) {
    const status = document.getElementById('fagverkPlaceCoverageStatus');
    if (!status) return;
    status.textContent = model.curated ? 'Kuratert stedsfagverk' : 'Fagverk under produksjon';
    status.dataset.level = model.curated ? model.fagverk.level : 'unfinished';
  }

  function renderCompletionState(model) {
    const unfinished = document.getElementById('fagverkPlaceUnfinished');
    for (const id of [
      'fagverkPlaceArticleSection',
      'fagverkPlaceLensesSection',
      'fagverkPlaceQuestionsSection',
      'fagverkPlaceTracesSection'
    ]) {
      const section = document.getElementById(id);
      if (section) section.hidden = !model.curated;
    }
    if (unfinished) unfinished.hidden = model.curated;
  }

  async function init() {
    const params = new URLSearchParams(global.location.search);
    const placeId = text(params.get('place'));
    const loading = document.getElementById('fagverkPlaceLoading');
    const content = document.getElementById('fagverkPlaceContent');
    const errorBox = document.getElementById('fagverkPlaceError');

    try {
      if (!placeId) throw new Error('Mangler place-parameter.');
      const [registry, place] = await Promise.all([fetchJson(REGISTRY_URL), loadPlace(placeId)]);
      if (!place) throw new Error(`Fant ikke canonical sted: ${placeId}`);

      const model = await modelFor(registry, place, placeId);
      if (model.subjectIds.length && model.subjects.some((entry) => !entry.model)) {
        throw new Error('En dokumentert fagkobling kunne ikke lastes.');
      }
      const title = placeTitle(place, placeId);
      document.title = `${title} – History Go Fagverk`;
      document.getElementById('fagverkPlaceTitle').textContent = title;
      document.getElementById('fagverkPlaceMeta').textContent = [placeCategory(place), text(place?.period || place?.year), formatAddress(place?.address)].filter(Boolean).join(' · ');
      document.getElementById('fagverkPlaceLead').textContent = model.curated
        ? text(model.fagverk.intro)
        : 'Dette stedet har en operativ fagverksrute, men mangler fortsatt stedsspesifikke linser, spørsmål, spor og kildebelagt læringstekst.';
      document.getElementById('fagverkPlaceMapLink').href = `index.html#/place/${encodeURIComponent(placeId)}`;

      const imageUrl = text(place?.popupImage || place?.cardImage || place?.image);
      const image = document.getElementById('fagverkPlaceImage');
      if (imageUrl && image) {
        image.src = imageUrl;
        image.alt = title;
        image.hidden = false;
      }

      renderCoverageStatus(model);
      renderCompletionState(model);
      renderArticle(model);
      renderBadgePath(model, place);
      renderLenses(model);
      renderQuestions(model);
      renderTraces(model, place);
      renderChapters(model);
      renderConcepts(model);
      renderSources(model, place);

      loading.hidden = true;
      content.hidden = false;
      errorBox.hidden = true;
      global.dispatchEvent(new CustomEvent('hg:fagverk-place-ready', { detail: { placeId, subjects: model.subjectIds, curated: model.curated } }));
    } catch (error) {
      loading.hidden = true;
      content.hidden = true;
      errorBox.hidden = false;
      errorBox.textContent = `Stedets fagverkside kunne ikke lastes: ${error.message}`;
      console.error('[fagverk-sted]', error);
    }
  }

  global.HGFagverkPlacePage = { modelFor, lensRows, subjectUrl, domainUrl, emneUrl, chapterUrl };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window);
