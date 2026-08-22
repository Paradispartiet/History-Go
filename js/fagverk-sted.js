// @ts-nocheck
// js/fagverk-sted.js
(function installFagverkPlacePage(global) {
  'use strict';

  const REGISTRY_URL = 'data/fagverk/fagverk_registry.json';

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function unique(values) {
    const seen = new Set();
    return values.map(text).filter((value) => value && !seen.has(value) && seen.add(value));
  }

  function humanizeId(value) {
    const normalized = text(value)
      .replace(/^em_[a-z]+_/u, '')
      .replaceAll('_', ' ')
      .replace(/\s+/gu, ' ');
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

  function chapterUrl(subject, chapter, extras = {}) {
    const params = new URLSearchParams({ subject, chapter });
    Object.entries(extras).forEach(([key, value]) => {
      const normalized = text(value);
      if (normalized) params.set(key, normalized);
    });
    return `fagverk.html?${params.toString()}`;
  }

  function placeTitle(place, placeId, curated) {
    return text(place?.name || place?.title || curated?.title) || placeId.replaceAll('_', ' ');
  }

  function placeCategory(place) {
    return text(place?.category || place?.domain || place?.subject);
  }

  function modelFor(registry, place, placeId) {
    const curated = registry?.placeLinks?.[placeId] || {};
    const emneIds = unique([
      ...list(curated.emneIds),
      ...list(place?.emne_ids || place?.emneIds)
    ]);
    const emner = emneIds.map((id) => ({
      id,
      title: humanizeId(id),
      ...(registry?.emner?.[id] || {})
    }));
    const subjects = unique([
      ...emner.map((emne) => emne.subject),
      ...list(curated.subjects),
      registry?.placePage?.fallbackSubjectByCategory?.[placeCategory(place)]
    ]);
    const subject = subjects.find((id) => registry?.subjects?.[id]) || '';
    const chapters = unique([
      ...list(curated.chapters),
      ...emner.map((emne) => emne.chapter)
    ]);
    const concepts = unique([
      ...list(curated.concepts),
      ...emner.flatMap((emne) => list(emne.concepts)),
      ...list(place?.knowledge?.tags),
      ...list(place?.tags)
    ]).slice(0, 24);
    return { curated, emner, subject, chapters, concepts };
  }

  function renderBadgePath(registry, model, place) {
    const host = document.getElementById('fagverkPlaceBadgePath');
    if (!host) return;
    const badgeIds = unique(place?.underbadge_ids || place?.underbadgeIds || []);
    const subject = registry?.subjects?.[model.subject] || {};
    const subjectTitle = text(subject.title) || humanizeId(model.subject || placeCategory(place));
    if (!subjectTitle && !badgeIds.length) {
      host.hidden = true;
      return;
    }
    const subjectLink = model.subject
      ? `<a class="fagverk-case" href="fagverk-forside.html?subject=${encodeURIComponent(model.subject)}"><strong>${escapeHtml(subjectTitle)}</strong><span>Stedets primærfag</span><small>Åpne fagverket →</small></a>`
      : '';
    host.innerHTML = `
      <p class="fagverk-kicker">Fra merke til fag</p>
      <h2>Merke og fag</h2>
      <p>Undermerkene viser hvilke deler av faget som er særlig relevante på dette stedet.</p>
      <div class="fagverk-canonical-underbadges">${badgeIds.map((id) => `<a href="fagverk-forside.html?subject=${encodeURIComponent(model.subject)}&amp;underbadge=${encodeURIComponent(id)}">${escapeHtml(humanizeId(id))}</a>`).join('')}</div>
      <div class="fagverk-canonical-domain-grid">${subjectLink}</div>
    `;
    host.hidden = false;
  }

  function defaultLenses(place) {
    const category = placeCategory(place);
    const common = [
      { id: 'historie', title: 'Historie', prompt: 'Hvilke tidslag, brudd og funksjonsendringer har formet stedet?' },
      { id: 'sted', title: 'Sted og omgivelser', prompt: 'Hvorfor ligger stedet her, og hvordan virker det sammen med området rundt?' },
      { id: 'aktorer', title: 'Aktører', prompt: 'Hvilke mennesker, institusjoner eller grupper har brukt, endret eller utfordret stedet?' },
      { id: 'kilder', title: 'Kilder og spor', prompt: 'Hvilke fysiske spor og dokumenter gjør historien etterprøvbar?' }
    ];
    if (category === 'natur') {
      return [
        { id: 'okologi', title: 'Økologi', prompt: 'Hvilke arter, habitater og samspill finnes her?' },
        { id: 'geologi', title: 'Geologi og terreng', prompt: 'Hvordan har berggrunn, løsmasser, vann og terreng formet stedet?' },
        { id: 'sesong', title: 'Sesong og observasjon', prompt: 'Hva kan observeres på ulike tider av året, og hvordan gjøres det uten å forstyrre?' },
        { id: 'forvaltning', title: 'Naturforvaltning', prompt: 'Hvilke regler, inngrep eller skjøtsel påvirker naturverdiene?' }
      ];
    }
    if (category === 'kunst' || category === 'musikk' || category === 'litteratur') {
      return [
        { id: 'verk', title: 'Verk og uttrykk', prompt: 'Hvilke verk, framføringer eller tekster er knyttet til stedet?' },
        { id: 'produksjon', title: 'Produksjon', prompt: 'Hvordan ble uttrykket skapt, formidlet eller mottatt her?' },
        { id: 'institusjon', title: 'Institusjon og offentlighet', prompt: 'Hvem organiserte, finansierte og gjorde kulturen tilgjengelig?' },
        ...common.slice(0, 1)
      ];
    }
    return common;
  }

  function defaultQuestions(place, title) {
    const category = placeCategory(place);
    const questions = [
      `Hva er det viktigste historiske skiftet ved ${title}?`,
      'Hvem hadde myndighet, eierskap eller ansvar på ulike tidspunkt?',
      'Hvilke fysiske detaljer kan brukes som kilder?',
      'Hva ved stedet kan misforstås dersom man bare ser dagens bruk?'
    ];
    if (category === 'natur') {
      return [
        `Hvilke naturtyper og arter kjennetegner ${title}?`,
        'Hvilke tegn kan observeres uten å skade habitatet?',
        'Hvordan endres stedet gjennom året?',
        'Hvilke menneskelige inngrep eller forvaltningstiltak påvirker området?'
      ];
    }
    return questions;
  }

  function renderArticle(place) {
    const host = document.getElementById('fagverkPlaceArticle');
    if (!host) return;
    const popup = text(place?.popupDesc);
    const desc = text(place?.desc);
    const content = popup || desc;
    if (!content) {
      host.innerHTML = '<p>Stedet har ennå ikke en fullstendig fagartikkel. Fagverksiden er likevel opprettet og kan kobles til emner, begreper og kapitler.</p>';
      return;
    }
    const paragraphs = content.split(/\n\s*\n/u).map(text).filter(Boolean);
    host.innerHTML = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  }

  function renderLenses(model, place) {
    const host = document.getElementById('fagverkPlaceLenses');
    if (!host) return;
    const lenses = list(model.curated.lenses).length ? model.curated.lenses : defaultLenses(place);
    host.innerHTML = lenses.map((lens) => `
      <article class="fagverk-learning-card">
        <p class="fagverk-kicker">Faglig linse</p>
        <h3>${escapeHtml(lens.title)}</h3>
        <p>${escapeHtml(lens.prompt)}</p>
      </article>
    `).join('');
  }

  function renderQuestions(model, place, title) {
    const host = document.getElementById('fagverkPlaceQuestions');
    if (!host) return;
    const questions = list(model.curated.guidingQuestions).length
      ? model.curated.guidingQuestions
      : defaultQuestions(place, title);
    host.innerHTML = questions.map((question) => `<li>${escapeHtml(question)}</li>`).join('');
  }

  function renderChapters(registry, model, placeId) {
    const host = document.getElementById('fagverkPlaceChapters');
    if (!host) return;
    if (!model.subject) {
      host.innerHTML = '<p class="fagverk-empty">Det er ennå ikke registrert en full fagside for stedets kategori. Stedssiden kan utvides når fagkapitlene materialiseres.</p>';
      return;
    }
    const subject = registry.subjects[model.subject];
    const chapterIds = model.chapters.length ? model.chapters : list(subject.chapters).map((chapter) => chapter.id);
    const chapterMap = new Map(list(subject.chapters).map((chapter) => [text(chapter.id), chapter]));
    const chapters = chapterIds.map((id) => chapterMap.get(id)).filter(Boolean);
    host.innerHTML = chapters.map((chapter) => `
      <a class="fagverk-case" href="${escapeHtml(chapterUrl(model.subject, chapter.id, { place: placeId }))}">
        <strong>${escapeHtml(chapter.title)}</strong>
        <span>${escapeHtml(chapter.subtitle)}</span>
        <small>Les faget →</small>
      </a>
    `).join('');
  }

  function renderConcepts(model, placeId) {
    const conceptHost = document.getElementById('fagverkPlaceConcepts');
    const emneHost = document.getElementById('fagverkPlaceEmner');
    const defaultChapter = text(model.chapters[0]);
    if (conceptHost) {
      conceptHost.innerHTML = model.concepts.length
        ? model.concepts.map((concept) => {
            const href = model.subject && defaultChapter
              ? chapterUrl(model.subject, defaultChapter, { place: placeId, concept })
              : '';
            return href
              ? `<a href="${escapeHtml(href)}">${escapeHtml(concept)}</a>`
              : `<span>${escapeHtml(concept)}</span>`;
          }).join('')
        : '<p class="fagverk-empty">Ingen begreper er registrert ennå.</p>';
    }
    if (emneHost) {
      emneHost.innerHTML = model.emner.filter((emne) => text(emne.title)).map((emne) => {
        const href = model.subject
          ? chapterUrl(model.subject, emne.chapter || defaultChapter, { place: placeId, emne: emne.id })
          : '';
        return href
          ? `<a href="${escapeHtml(href)}">${escapeHtml(emne.title)}</a>`
          : `<span>${escapeHtml(emne.title)}</span>`;
      }).join('');
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

  async function init() {
    const params = new URLSearchParams(global.location.search);
    const placeId = text(params.get('place'));
    const loading = document.getElementById('fagverkPlaceLoading');
    const content = document.getElementById('fagverkPlaceContent');
    const errorBox = document.getElementById('fagverkPlaceError');

    try {
      if (!placeId) throw new Error('Mangler place-parameter.');
      const [registry, place] = await Promise.all([
        fetchJson(REGISTRY_URL),
        loadPlace(placeId)
      ]);
      if (!place) throw new Error(`Fant ikke canonical sted: ${placeId}`);

      const model = modelFor(registry, place, placeId);
      const title = placeTitle(place, placeId, model.curated);
      document.title = `${title} – History Go Fagverk`;
      document.getElementById('fagverkPlaceTitle').textContent = title;
      document.getElementById('fagverkPlaceMeta').textContent = [placeCategory(place), text(place?.period || place?.year), formatAddress(place?.address)].filter(Boolean).join(' · ');
      document.getElementById('fagverkPlaceLead').textContent = text(model.curated.intro || place?.desc) || 'En egen fagverkside for stedet.';
      document.getElementById('fagverkPlaceMapLink').href = `index.html#/place/${encodeURIComponent(placeId)}`;

      const imageUrl = text(place?.popupImage || place?.cardImage || place?.image);
      const image = document.getElementById('fagverkPlaceImage');
      if (imageUrl && image) {
        image.src = imageUrl;
        image.alt = title;
        image.hidden = false;
      }

      renderArticle(place);
      renderBadgePath(registry, model, place);
      renderLenses(model, place);
      renderQuestions(model, place, title);
      renderChapters(registry, model, placeId);
      renderConcepts(model, placeId);
      renderSources(place);

      loading.hidden = true;
      content.hidden = false;
      errorBox.hidden = true;
    } catch (error) {
      loading.hidden = true;
      content.hidden = true;
      errorBox.hidden = false;
      errorBox.textContent = `Stedets fagverkside kunne ikke lastes: ${error.message}`;
      console.error('[fagverk-sted]', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window);
