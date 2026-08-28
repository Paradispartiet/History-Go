// @ts-nocheck
(function installFagverkIaV3Detail(global) {
  'use strict';

  const MODEL = global.HGFagverkSubjectModel;
  if (!MODEL) throw new Error('HGFagverkSubjectModel må lastes før fagverk-ia-v3-detail.js');

  function text(value) {
    return String(value == null ? '' : value).trim();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function waitForBaseRender() {
    const content = document.getElementById('fagverkContent');
    const error = document.getElementById('fagverkError');
    if (!content || !error) return Promise.reject(new Error('Fagverk-shell mangler baseverter.'));
    if (!content.hidden) return Promise.resolve();
    if (!error.hidden) return Promise.reject(new Error(error.textContent || 'Fagverket kunne ikke lastes.'));
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        if (!content.hidden) {
          observer.disconnect();
          resolve();
        } else if (!error.hidden) {
          observer.disconnect();
          reject(new Error(error.textContent || 'Fagverket kunne ikke lastes.'));
        }
      });
      observer.observe(content, { attributes: true, attributeFilter: ['hidden'] });
      observer.observe(error, { attributes: true, attributeFilter: ['hidden'] });
    });
  }

  function subjectRoot(model, hash) {
    return `${model.subject.routes.subject}${hash ? `#${hash}` : ''}`;
  }

  function detailNavHtml(model, { domain, emne, chapter, placeId }) {
    const links = [
      `<a href="${escapeHtml(subjectRoot(model, 'fagverkIaOversikt'))}">Fagoversikt</a>`
    ];

    if (emne || domain) links.push(`<a href="${escapeHtml(subjectRoot(model, 'fagverkIaEmner'))}">Alle emner</a>`);
    if (chapter) links.push(`<a href="${escapeHtml(subjectRoot(model, 'fagverkIaLaerestoff'))}">Alt lærestoff</a>`);

    const domainId = emne?.domainId || chapter?.primaryDomainId || domain?.id || '';
    const resolvedDomain = domainId ? model.domainsById.get(domainId) : null;
    if (resolvedDomain && (emne || chapter)) {
      links.push(`<a href="${escapeHtml(MODEL.domainUrl(model.subject.id, resolvedDomain.id, { place: placeId }))}">${escapeHtml(resolvedDomain.label)}</a>`);
    }
    if (placeId) links.push(`<a href="${escapeHtml(MODEL.placePageUrl(placeId))}">Tilbake til stedet</a>`);

    return links.join('');
  }

  function installDetailNav(model, context) {
    const hero = document.querySelector('.fagverk-hero');
    if (!hero || document.getElementById('fagverkIaDetailNav')) return;
    hero.insertAdjacentHTML('afterend', `<nav id="fagverkIaDetailNav" class="fagverk-ia-detail-nav" aria-label="Kontekst i faget">${detailNavHtml(model, context)}</nav>`);
  }

  function enhanceEmne(model, progress, emne, placeId) {
    const host = document.getElementById('fagverkCanonicalEmne');
    if (!host) return;
    const row = progress.coverageById.get(emne.id) || {};
    const percent = Math.max(0, Math.min(100, Number(row.percent || 0)));
    const directChapters = model.chapters.filter((chapter) => chapter.emneIds.includes(emne.id));
    const primaryChapter = directChapters[0] || null;

    host.insertAdjacentHTML('afterbegin', `
      <section class="fagverk-ia-emne-status" aria-label="Din progresjon i emnet">
        <div><p class="fagverk-kicker">Din dekning</p><strong>${percent}%</strong><span>${Number(row.matchCount || 0)}/${Number(row.total || emne.concepts.length || 0)} kjernebegreper dekket</span></div>
        <div class="fagverk-ia-emne-status-bar" aria-hidden="true"><i style="width:${percent}%"></i></div>
        <small>Dette er beregnet læringsdekning fra eksisterende quiz- og læringssignaler, ikke en egen lagret emnestatus.</small>
      </section>
      ${primaryChapter ? `<a class="fagverk-ia-emne-primary-learning" href="${escapeHtml(MODEL.chapterUrl(model.subject.id, primaryChapter.id, { domain: emne.domainId, emne: emne.id, place: placeId }))}"><span><span class="fagverk-kicker">Redigert lærestoff</span><strong>${escapeHtml(primaryChapter.title)}</strong><small>${escapeHtml(primaryChapter.subtitle)}</small></span><b>Les kapittelet →</b></a>` : ''}
    `);

    const chapterSection = [...host.querySelectorAll(':scope > section')]
      .find((section) => text(section.querySelector('h4')?.textContent) === 'Relevante lærekapitler');
    if (chapterSection && primaryChapter) chapterSection.classList.add('fagverk-ia-secondary-learning');
  }

  function enhanceDomain(model, progress, domain) {
    const host = document.getElementById('fagverkCanonicalDomain');
    if (!host) return;
    const row = progress.domainProgress.find((item) => item.domainId === domain.id) || {};
    const percent = Math.max(0, Math.min(100, Number(row.percent || 0)));
    host.insertAdjacentHTML('afterbegin', `<div class="fagverk-ia-domain-status"><span>Din dekning i fagområdet</span><strong>${percent}%</strong><div aria-hidden="true"><i style="width:${percent}%"></i></div></div>`);
  }

  function enhanceChapter(model, chapter, placeId) {
    const article = document.querySelector('.fagverk-article');
    const diagnostic = document.querySelector('.fagverk-diagnostic');
    if (!article || !diagnostic || !chapter?.emneIds?.length) return;
    const emners = chapter.emneIds.map((id) => model.emnersById.get(id)).filter(Boolean);
    if (!emners.length) return;
    const links = emners.map((emne) => `<a href="${escapeHtml(MODEL.emneUrl(model.subject.id, emne.domainId, emne.id, { place: placeId }))}">${escapeHtml(emne.title)}</a>`).join('');
    diagnostic.insertAdjacentHTML('beforebegin', `<details class="fagverk-ia-chapter-emner"><summary>Emner i dette kapittelet <span>${emners.length}</span></summary><div>${links}</div></details>`);
  }

  async function init() {
    const params = new URLSearchParams(global.location.search);
    const subjectId = text(params.get('subject'));
    const domainId = text(params.get('domain'));
    const emneId = text(params.get('emne'));
    const chapterId = text(params.get('chapter'));
    const placeId = text(params.get('place'));
    if (!subjectId || (!domainId && !emneId && !chapterId)) return;

    try {
      await waitForBaseRender();
      const model = await MODEL.load(subjectId);
      const progress = MODEL.readProgress(model);
      const domain = domainId ? model.domainsById.get(domainId) : null;
      const emne = emneId ? model.emnersById.get(emneId) : null;
      const chapter = chapterId ? model.chaptersById.get(chapterId) : null;

      document.body.classList.add('fagverk-ia-v3-detail');
      installDetailNav(model, { domain, emne, chapter, placeId });
      if (emne) enhanceEmne(model, progress, emne, placeId);
      else if (domain) enhanceDomain(model, progress, domain);
      if (chapter) enhanceChapter(model, chapter, placeId);
    } catch (error) {
      console.error('[fagverk-ia-v3-detail]', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window);
