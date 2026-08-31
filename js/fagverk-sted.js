// @ts-nocheck
// js/fagverk-sted.js
(function installFagverkPlacePage(global) {
  'use strict';

  const REGISTRY_URL = 'data/fagverk/fagverk_registry.json';
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

  function placeTitle(place, placeId, curated) {
    return text(place?.name || place?.title || curated?.title) || placeId.replaceAll('_', ' ');
  }

  function placeCategory(place) {
    return text(place?.category || place?.domain || place?.subject);
  }

  function subjectIdFor(registry, place, curated) {
    return text(
      curated?.subject ||
      list(curated?.subjects)[0] ||
      registry?.placePage?.fallbackSubjectByCategory?.[placeCategory(place)]
    );
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
    const curated = registry?.placeLinks?.[placeId] || {};
    const subject = subjectIdFor(registry, place, curated);
    const subjectModel = subject && global.HGFagverkSubjectModel
      ? await global.HGFagverkSubjectModel.load(subject, { allowPlanned: true })
      : null;
    const requestedEmneIds = unique([
      ...list(curated.emneIds),
      ...list(curated.emne_ids),
      ...list(place?.emne_ids || place?.emneIds)
    ]);
    const emners = subjectModel
      ? requestedEmneIds.map((id) => subjectModel.emnersById.get(id)).filter(Boolean)
      : requestedEmneIds.map((id) => ({ id, title: humanizeId(id), domainId: '' }));
    const missingEmneIds = subjectModel
      ? requestedEmneIds.filter((id) => !subjectModel.emnersById.has(id))
      : [];
    const domainIds = unique(emners.map((emne) => emne.domainId));
    const domains = subjectModel
      ? domainIds.map((id) => subjectModel.domainsById.get(id)).filter(Boolean)
      : [];
    const curatedChapterIds = unique([...list(curated.chapters), ...list(curated.chapterIds)]);
    const chapters = subjectModel
      ? subjectModel.chapters.filter((chapter) => (
          curatedChapterIds.includes(chapter.id) ||
          chapter.emneIds.some((id) => requestedEmneIds.includes(id))
        ))
      : [];
    const concepts = unique([
      ...list(curated.concepts),
      ...emners.flatMap((emne) => list(emne.concepts)),
      ...list(place?.knowledge?.tags),
      ...list(place?.tags)
    ]).slice(0, 36);
    return {
      curated,
      subject,
      subjectModel,
      requestedEmneIds,
      missingEmneIds,
      emners,
      domains,
      chapters,
      concepts,
      placeId
    };
  }

  function renderBadgePath(model, place) {
    const host = document.getElementById('fagverkPlaceBadgePath');
    if (!host) return;
    const badgeIds = unique(place?.underbadge_ids || place?.underbadgeIds || []);
    const subjectTitle = text(model.subjectModel?.subject?.title) || humanizeId(model.subject || placeCategory(place));
    if (!model.subject && !badgeIds.length) {
      host.hidden = true;
      return;
    }
    const progressUrl = model.subject
      ? `${subjectUrl(model.subject)}#fagverkIaProgresjon`
      : 'fagverk-forside.html';
    host.innerHTML = `
      <p class="fagverk-kicker">Fra merke til fag</p>
      <h2>Merke og fag</h2>
      <p>Undermerkene viser stedets merkeidentitet. Fagkortet åpner den canonicale fagsiden.</p>
      ${badgeIds.length ? `<div class="fagverk-canonical-underbadges">${badgeIds.map((id) => `<a href="${escapeHtml(progressUrl)}">${escapeHtml(humanizeId(id))}<span class="fagverk-link-cue">Åpne progresjon →</span></a>`).join('')}</div>` : ''}
      ${model.subject ? `<div class="fagverk-canonical-domain-grid"><a class="fagverk-case" href="${escapeHtml(subjectUrl(model.subject, { place: model.placeId }))}"><strong>${escapeHtml(subjectTitle)}</strong><span>Stedets primærfag</span><small>Åpne faget →</small></a></div>` : ''}
    `;
    host.hidden = false;
  }

  function lensRows(model) {
    const curated = list(model.curated.lenses);
    if (curated.length) {
      return curated.map((lens) => {
        const requestedId = text(lens.emneId || lens.emne_id);
        const emne = model.subjectModel?.emnersById?.get(requestedId) || null;
        return {
          title: text(lens.title),
          prompt: text(lens.prompt),
          href: emne
            ? emneUrl(model.subject, emne.domainId, emne.id, { place: model.placeId })
            : subjectUrl(model.subject, { place: model.placeId })
        };
      }).filter((row) => row.title && row.href);
    }
    if (model.emners.length) {
      return model.emners.slice(0, 8).map((emne) => ({
        title: emne.title,
        prompt: text(emne.definition || emne.whyItMatters),
        href: emneUrl(model.subject, emne.domainId, emne.id, { place: model.placeId })
      }));
    }
    if (model.domains.length) {
      return model.domains.slice(0, 8).map((domain) => ({
        title: domain.label,
        prompt: text(domain.definition),
        href: domainUrl(model.subject, domain.id, { place: model.placeId })
      }));
    }
    if (model.subjectModel) {
      return [{
        title: model.subjectModel.subject.title,
        prompt: text(model.subjectModel.subject.description),
        href: subjectUrl(model.subject, { place: model.placeId })
      }];
    }
    return [];
  }

  function renderArticle(place) {
    const host = document.getElementById('fagverkPlaceArticle');
    if (!host) return;
    const content = text(place?.popupDesc) || text(place?.desc);
    if (!content) {
      host.innerHTML = '<p class="fagverk-empty">Stedet mangler fortsatt en redigert stedsartikkel. Faglige koblinger nedenfor vises bare når de kan løses mot canonicale fagdata.</p>';
      return;
    }
    const paragraphs = content.split(/\n\s*\n/u).map(text).filter(Boolean);
    host.innerHTML = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  }

  function renderLenses(model) {
    const host = document.getElementById('fagverkPlaceLenses');
    if (!host) return;
    const rows = lensRows(model);
    host.innerHTML = rows.length
      ? rows.map((row) => `
        <a class="fagverk-learning-card fagverk-place-lens-link" href="${escapeHtml(row.href)}">
          <p class="fagverk-kicker">Faglig linse</p>
          <h3>${escapeHtml(row.title)}</h3>
          ${row.prompt ? `<p>${escapeHtml(row.prompt)}</p>` : ''}
          <span class="fagverk-card-action">Utforsk i faget →</span>
        </a>
      `).join('')
      : '<p class="fagverk-empty">Det finnes foreløpig ingen source-eide faglige linser for dette stedet.</p>';
  }

  function renderQuestions(model) {
    const host = document.getElementById('fagverkPlaceQuestions');
    if (!host) return;
    const questions = list(model.curated.guidingQuestions).length
      ? list(model.curated.guidingQuestions).map(text).filter(Boolean)
      : unique(model.emners.flatMap((emne) => list(emne.keyQuestions))).slice(0, 10);
    host.innerHTML = questions.length
      ? questions.map((question) => `<li>${escapeHtml(question)}</li>`).join('')
      : '<li class="fagverk-empty">Ingen source-eide undersøkelsesspørsmål er registrert for stedets emner ennå.</li>';
  }

  function renderChapters(model) {
    const host = document.getElementById('fagverkPlaceChapters');
    if (!host) return;
    if (!model.subjectModel) {
      host.innerHTML = '<p class="fagverk-empty">Stedets kategori kan ikke kobles til en canonical fagside ennå.</p>';
      return;
    }
    const domainCards = model.domains.map((domain) => `
      <a class="fagverk-case" href="${escapeHtml(domainUrl(model.subject, domain.id, { place: model.placeId }))}">
        <strong>${escapeHtml(domain.label)}</strong>
        ${text(domain.definition) ? `<span>${escapeHtml(domain.definition)}</span>` : ''}
        <small>Åpne fagområdet →</small>
      </a>
    `);
    const chapterCards = model.chapters.map((chapter) => `
      <a class="fagverk-case" href="${escapeHtml(chapterUrl(model.subject, chapter.id, { place: model.placeId }))}">
        <strong>${escapeHtml(chapter.title)}</strong>
        ${text(chapter.subtitle) ? `<span>${escapeHtml(chapter.subtitle)}</span>` : ''}
        <small>Les lærekapitlet →</small>
      </a>
    `);
    const cards = [...domainCards, ...chapterCards];
    host.innerHTML = cards.length
      ? cards.join('')
      : `<a class="fagverk-case" href="${escapeHtml(subjectUrl(model.subject, { place: model.placeId }))}"><strong>${escapeHtml(model.subjectModel.subject.title)}</strong><span>Ingen mer presis chapter- eller fagområdebinding er registrert for stedet.</span><small>Åpne faget →</small></a>`;
  }

  function ownerForConcept(model, concept) {
    const normalized = text(concept).toLocaleLowerCase('nb-NO');
    return model.emners.find((emne) => list(emne.concepts).some((candidate) => text(candidate).toLocaleLowerCase('nb-NO') === normalized)) || model.emners[0] || null;
  }

  function renderConcepts(model) {
    const conceptHost = document.getElementById('fagverkPlaceConcepts');
    const emneHost = document.getElementById('fagverkPlaceEmner');
    if (conceptHost) {
      conceptHost.innerHTML = model.concepts.length && model.subject
        ? model.concepts.map((concept) => {
            const owner = ownerForConcept(model, concept);
            const href = owner
              ? emneUrl(model.subject, owner.domainId, owner.id, { place: model.placeId, concept })
              : subjectUrl(model.subject, { place: model.placeId, concept });
            return `<a href="${escapeHtml(href)}">${escapeHtml(concept)}</a>`;
          }).join('')
        : '<p class="fagverk-empty">Ingen source-eide begrepskoblinger er registrert ennå.</p>';
    }
    if (emneHost) {
      emneHost.innerHTML = model.emners.length && model.subject
        ? model.emners.map((emne) => `<a href="${escapeHtml(emneUrl(model.subject, emne.domainId, emne.id, { place: model.placeId }))}">${escapeHtml(emne.title)}</a>`).join('')
        : '<p class="fagverk-empty">Ingen canonicale emnekoblinger er registrert ennå.</p>';
    }
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

  function renderSources(place) {
    const section = document.getElementById('fagverkPlaceSourcesSection');
    const host = document.getElementById('fagverkPlaceSources');
    if (!section || !host) return;
    const rows = sourceRows(place);
    if (!rows.length) {
      section.hidden = true;
      return;
    }
    host.innerHTML = rows.map((row) => `<li><a href="${escapeHtml(row.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.label)} ↗</a></li>`).join('');
    section.hidden = false;
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
    const curated = list(model.curated.lenses).length && list(model.curated.guidingQuestions).length;
    status.textContent = curated
      ? 'Kuratert stedslæreverk'
      : model.emners.length
        ? `${model.emners.length} canonicale emnekoblinger`
        : 'Canonical faginngang';
    status.dataset.level = curated ? 'curated' : model.emners.length ? 'linked' : 'entry';
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
      if (model.subject && !model.subjectModel) throw new Error(`Faget ${model.subject} kunne ikke lastes.`);
      const title = placeTitle(place, placeId, model.curated);
      document.title = `${title} – History Go Fagverk`;
      document.getElementById('fagverkPlaceTitle').textContent = title;
      document.getElementById('fagverkPlaceMeta').textContent = [placeCategory(place), text(place?.period || place?.year), formatAddress(place?.address)].filter(Boolean).join(' · ');
      document.getElementById('fagverkPlaceLead').textContent = text(model.curated.intro || place?.desc) || 'Stedets canonicale inngang til Fagverket.';
      document.getElementById('fagverkPlaceMapLink').href = `index.html#/place/${encodeURIComponent(placeId)}`;

      const imageUrl = text(place?.popupImage || place?.cardImage || place?.image);
      const image = document.getElementById('fagverkPlaceImage');
      if (imageUrl && image) {
        image.src = imageUrl;
        image.alt = title;
        image.hidden = false;
      }

      renderCoverageStatus(model);
      renderArticle(place);
      renderBadgePath(model, place);
      renderLenses(model);
      renderQuestions(model);
      renderChapters(model);
      renderConcepts(model);
      renderSources(place);

      loading.hidden = true;
      content.hidden = false;
      errorBox.hidden = true;
      global.dispatchEvent(new CustomEvent('hg:fagverk-place-ready', { detail: { placeId, subject: model.subject } }));
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
