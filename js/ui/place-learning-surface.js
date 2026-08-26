// @ts-nocheck
// js/ui/place-learning-surface.js
(function installPlaceLearningSurface(global) {
  'use strict';

  const REGISTRY_URL = 'data/fagverk/fagverk_registry.json';
  const INSTALL_FLAG = '__HG_PLACE_LEARNING_SURFACE_INSTALLED__';
  const RELATION_FLAG = '__HG_RELATION_CARD_RENDERER_INSTALLED__';
  let registryPromise = null;

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

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function unique(values) {
    const seen = new Set();
    return values.map(text).filter((value) => value && !seen.has(value) && seen.add(value));
  }

  function isHttpUrl(value) {
    try {
      const url = new URL(text(value));
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }

  function loadStyles() {
    if (document.querySelector('link[href="css/place-learning-surface.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/place-learning-surface.css';
    document.head.appendChild(link);
  }

  function loadRegistry() {
    if (!registryPromise) {
      registryPromise = fetch(REGISTRY_URL, { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) throw new Error(`${response.status} ${REGISTRY_URL}`);
          return response.json();
        })
        .catch((error) => {
          registryPromise = null;
          if (global.DEBUG) console.warn('[place-learning] registry', error);
          return null;
        });
    }
    return registryPromise;
  }

  function personById(id) {
    const key = text(id);
    return list(global.PEOPLE).find((person) => text(person?.id) === key) || null;
  }

  function placeById(id) {
    const key = text(id);
    return list(global.PLACES).find((place) => text(place?.id) === key) || null;
  }

  function sideId(relation, side, type) {
    const sideType = text(relation?.[`${side}Type`] || relation?.[`${side}_type`]);
    const sideValue = text(relation?.[`${side}Id`] || relation?.[`${side}_id`]);
    return sideType === type ? sideValue : '';
  }

  function relationTargets(relation) {
    const people = unique([
      relation?.personId,
      relation?.person_id,
      relation?.person,
      sideId(relation, 'from', 'person'),
      sideId(relation, 'to', 'person')
    ]);
    const places = unique([
      relation?.placeId,
      relation?.place_id,
      relation?.place,
      sideId(relation, 'from', 'place'),
      sideId(relation, 'to', 'place')
    ]);
    return { people, places };
  }

  function relationSource(relation) {
    return text(
      relation?.sourceUrl ||
      relation?.source_url ||
      relation?.url ||
      relation?.source ||
      relation?.src
    );
  }

  function relationType(relation) {
    return text(relation?.type || relation?.rel || relation?.kind) || 'Tilknytning';
  }

  function relationWhy(relation) {
    return text(relation?.why || relation?.reason || relation?.desc || relation?.note);
  }

  function targetDescriptor(relation) {
    const targets = relationTargets(relation);
    if (targets.people.length === 1) {
      const person = personById(targets.people[0]);
      return {
        kind: 'person',
        id: targets.people[0],
        title: text(person?.name) || text(relation?.label || relation?.title || relation?.name) || targets.people[0],
        meta: text(person?.role || person?.occupation || person?.profession),
        action: 'Åpne person →'
      };
    }
    if (targets.places.length === 1) {
      const place = placeById(targets.places[0]);
      return {
        kind: 'place',
        id: targets.places[0],
        title: text(place?.name) || text(relation?.label || relation?.title || relation?.name) || targets.places[0],
        meta: text(place?.category),
        action: 'Åpne sted →'
      };
    }
    return {
      kind: '',
      id: '',
      title: text(relation?.label || relation?.title || relation?.name) || relationType(relation),
      meta: '',
      action: ''
    };
  }

  function renderRelationCard(relation) {
    const type = relationType(relation);
    const why = relationWhy(relation);
    const source = relationSource(relation);
    const target = targetDescriptor(relation);
    const targetAttr = target.kind === 'person'
      ? ` data-person="${escapeAttr(target.id)}"`
      : target.kind === 'place'
        ? ` data-place="${escapeAttr(target.id)}"`
        : '';
    const tag = targetAttr ? 'button' : 'div';
    const buttonType = targetAttr ? ' type="button"' : '';
    const sourceHtml = source
      ? isHttpUrl(source)
        ? `<a class="hg-rel-source-link" href="${escapeAttr(source)}" target="_blank" rel="noopener noreferrer">Åpne kilde ↗</a>`
        : `<span class="hg-rel-source-text">Kilde: ${escapeHtml(source)}</span>`
      : '';

    return `<li class="hg-relation-card">
      <${tag} class="hg-relation-card-main"${buttonType}${targetAttr}>
        <span class="hg-relation-card-type">${escapeHtml(type)}</span>
        <strong>${escapeHtml(target.title)}</strong>
        ${target.meta ? `<span class="hg-relation-card-meta">${escapeHtml(target.meta)}</span>` : ''}
        ${why ? `<span class="hg-relation-card-why">${escapeHtml(why)}</span>` : ''}
        ${target.action ? `<span class="hg-relation-card-open">${escapeHtml(target.action)}</span>` : ''}
      </${tag}>
      ${sourceHtml}
    </li>`;
  }

  function installRelationRenderer() {
    if (global[RELATION_FLAG]) return true;
    if (typeof global.renderRelationRow !== 'function') return false;
    global.renderRelationRow = renderRelationCard;
    global[RELATION_FLAG] = true;
    return true;
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

  function learningModel(registry, place) {
    const placeId = text(place?.id);
    const direct = registry?.placeLinks?.[placeId] || {};
    const placeEmneIds = list(place?.emne_ids || place?.emneIds).map(text).filter(Boolean);
    const emneIds = unique([...list(direct.emneIds), ...placeEmneIds]);
    const emner = emneIds.map((id) => ({ id, ...(registry?.emner?.[id] || {}) }));
    const chapters = unique([
      ...list(direct.chapters),
      ...emner.map((emne) => emne.chapter)
    ]);
    const concepts = unique([
      ...list(direct.concepts),
      ...emner.flatMap((emne) => list(emne.concepts))
    ]);
    const category = text(place?.category);
    const fallback = text(registry?.placePage?.fallbackSubjectByCategory?.[category]);
    const subject = text(emner.find((emne) => emne.subject)?.subject || direct.subject || fallback);
    return {
      placeId,
      subject,
      intro: text(direct.intro),
      emner: emner.filter((emne) => text(emne.title)),
      chapters,
      concepts
    };
  }

  function renderLearningSection(registry, place) {
    const model = learningModel(registry, place);
    if (!model.placeId) return '';
    const subject = registry?.subjects?.[model.subject];
    const chapterMap = new Map(list(subject?.chapters).map((chapter) => [text(chapter.id), chapter]));
    const chapters = model.chapters.map((id) => chapterMap.get(id)).filter(Boolean);
    const defaultChapter = text(chapters[0]?.id || subject?.chapters?.[0]?.id);

    return `<section class="hg-section hg-place-section hg-place-learning-section">
      <div class="hg-place-learning-heading">
        <div>
          <p class="hg-place-learning-eyebrow">Stedets kunnskapslag</p>
          <h3>Fag og begreper</h3>
        </div>
        <a class="hg-place-learning-all" href="${escapeAttr(placePageUrl(model.placeId))}">Åpne stedets fagverkside →</a>
      </div>
      ${model.intro ? `<p class="hg-place-learning-intro">${escapeHtml(model.intro)}</p>` : '<p class="hg-place-learning-intro">Stedet har sin egen fagverkside der stedstekst, faglige linser, begreper og videre lesning samles.</p>'}
      ${model.concepts.length && subject && defaultChapter ? `<div class="hg-place-learning-concepts">
        ${model.concepts.slice(0, 16).map((concept) => `<a href="${escapeAttr(chapterUrl(model.subject, defaultChapter, { place: model.placeId, concept }))}">${escapeHtml(concept)}</a>`).join('')}
      </div>` : ''}
      ${chapters.length ? `<div class="hg-place-learning-chapters">
        ${chapters.map((chapter) => `<a class="hg-place-learning-chapter" href="${escapeAttr(chapterUrl(model.subject, chapter.id, { place: model.placeId }))}">
          <span>Fagside</span>
          <strong>${escapeHtml(chapter.title)}</strong>
          <p>${escapeHtml(chapter.subtitle)}</p>
          <small>Les faget →</small>
        </a>`).join('')}
      </div>` : ''}
      ${model.emner.length && subject && defaultChapter ? `<div class="hg-place-learning-emner">
        <h4>Relevante emner</h4>
        ${model.emner.map((emne) => `<a href="${escapeAttr(chapterUrl(model.subject, emne.chapter || defaultChapter, { place: model.placeId, emne: emne.id }))}">${escapeHtml(emne.title)}</a>`).join('')}
      </div>` : ''}
    </section>`;
  }

  async function injectLearning(place) {
    if (String(place?.placeTier || '').trim().toLowerCase() === 'micro') return;
    const registry = await loadRegistry();
    if (!registry) return;
    const popup = document.querySelector('.hg-popup.place-popup-v2');
    if (!popup || popup.querySelector('.hg-place-learning-section')) return;
    const html = renderLearningSection(registry, place);
    if (!html) return;
    const about = popup.querySelector('.hg-place-about-section');
    if (about) about.insertAdjacentHTML('afterend', html);
    else popup.querySelector('.hg-place-popup-body')?.insertAdjacentHTML('afterbegin', html);
  }

  function installPlacePopupWrapper() {
    if (global[INSTALL_FLAG]) return true;
    if (typeof global.showPlacePopup !== 'function' || !global.showPlacePopup.__hgPlacePopupV2) return false;
    const original = global.showPlacePopup;
    function showPlacePopupWithLearning(place) {
      const result = original.apply(this, arguments);
      injectLearning(place).catch((error) => {
        if (global.DEBUG) console.warn('[place-learning] inject', error);
      });
      return result;
    }
    showPlacePopupWithLearning.__previous = original;
    showPlacePopupWithLearning.__hgPlacePopupV2 = true;
    showPlacePopupWithLearning.__hgPlaceLearningSurface = true;
    global.showPlacePopup = showPlacePopupWithLearning;
    global[INSTALL_FLAG] = true;
    return true;
  }

  function installSourceLinkGuard() {
    document.addEventListener('click', (event) => {
      const link = event.target?.closest?.('.hg-rel-source-link');
      if (link) event.stopPropagation();
    }, true);
  }

  loadStyles();
  loadRegistry();
  installSourceLinkGuard();

  let attempts = 0;
  const timer = global.setInterval(() => {
    attempts += 1;
    const relationReady = installRelationRenderer();
    const popupReady = installPlacePopupWrapper();
    if ((relationReady && popupReady) || attempts > 500) global.clearInterval(timer);
  }, 40);

  global.HGPlaceLearningSurface = {
    loadRegistry,
    renderLearningSection,
    renderRelationCard,
    placePageUrl
  };
})(window);
