// @ts-nocheck
(function installFagverkIaV3(global) {
  'use strict';

  const MODEL = global.HGFagverkSubjectModel;
  if (!MODEL) throw new Error('HGFagverkSubjectModel må lastes før fagverk-ia-v3.js');

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

  function renderOverview(model, progress) {
    const host = document.getElementById('fagverkIaOverviewContent');
    if (!host) return;
    const complete = progress.coverage.filter((row) => Number(row?.percent || 0) === 100).length;
    const average = progress.coverage.length
      ? Math.round(progress.coverage.reduce((sum, row) => sum + Number(row?.percent || 0), 0) / progress.coverage.length)
      : 0;

    host.innerHTML = `
      <div class="fagverk-ia-summary" aria-label="Fagoversikt">
        <article><strong>${model.summary.domainCount}</strong><span>fagområder</span></article>
        <article><strong>${model.summary.emneCount}</strong><span>emner</span></article>
        <article><strong>${model.chapters.length}</strong><span>lærekapitler</span></article>
        <article><strong>${average}%</strong><span>din emnedekning</span></article>
      </div>
      <div class="fagverk-ia-start-grid">
        <a href="#fagverkIaEmner"><span class="fagverk-kicker">Finn kunnskapen</span><strong>Se alle emner</strong><small>Alle canonicale emner er synlige, også før du har tatt quiz.</small></a>
        <a href="#fagverkIaLaerestoff"><span class="fagverk-kicker">Les og lær</span><strong>Åpne lærestoffet</strong><small>${model.chapters.length ? `${model.chapters.length} redigerte kapitler` : 'Fagstruktur og tilgjengelig lærestoff'}.</small></a>
        <a href="#fagverkIaUtforsk"><span class="fagverk-kicker">Koble til verden</span><strong>Utforsk steder</strong><small>${model.places.length} canonicale stedskoblinger i dette faget.</small></a>
        <a href="#fagverkIaProgresjon"><span class="fagverk-kicker">Din læring</span><strong>Se progresjonen</strong><small>${complete}/${model.emners.length} emner fullt dekket · ${progress.points} poeng.</small></a>
      </div>
    `;
  }

  function renderEmner(model, progress, placeId) {
    const host = document.getElementById('fagverkIaEmnerContent');
    if (!host) return;
    const groups = model.domains.map((domain) => {
      const emners = domain.emneIds.map((id) => model.emnersById.get(id)).filter(Boolean);
      const cards = emners.map((emne) => {
        const row = progress.coverageById.get(emne.id) || {};
        const href = MODEL.emneUrl(model.subject.id, domain.id, emne.id, { place: placeId });
        const searchText = [emne.title, emne.definition, emne.whyItMatters, ...emne.concepts].join(' ').toLocaleLowerCase('nb-NO');
        return `<a class="fagverk-ia-emne" href="${escapeHtml(href)}" data-emne-search="${escapeHtml(searchText)}">
          <span><strong>${escapeHtml(emne.title)}</strong><small>${escapeHtml(emne.definition || emne.whyItMatters || domain.label)}</small></span>
          <b>${Number(row.percent || 0)}%</b>
        </a>`;
      }).join('');
      return `<section class="fagverk-ia-emne-group" data-domain-search="${escapeHtml([domain.label, domain.definition].join(' ').toLocaleLowerCase('nb-NO'))}">
        <header><div><p class="fagverk-kicker">Fagområde</p><h4>${escapeHtml(domain.label)}</h4><p>${escapeHtml(domain.definition)}</p></div><a href="${escapeHtml(MODEL.domainUrl(model.subject.id, domain.id, { place: placeId }))}">Åpne fagområdet →</a></header>
        <div class="fagverk-ia-emne-list">${cards}</div>
      </section>`;
    }).join('');

    host.innerHTML = `
      <label class="fagverk-ia-search" for="fagverkIaEmneSearch"><span>Søk i alle emner</span><input id="fagverkIaEmneSearch" type="search" autocomplete="off" placeholder="Søk etter emne eller begrep"></label>
      <p id="fagverkIaEmneCount" class="fagverk-ia-count">${model.emners.length} emner</p>
      <div class="fagverk-ia-emne-groups">${groups}</div>
    `;

    const search = document.getElementById('fagverkIaEmneSearch');
    const count = document.getElementById('fagverkIaEmneCount');
    const update = () => {
      const query = text(search?.value).toLocaleLowerCase('nb-NO');
      let visible = 0;
      host.querySelectorAll('.fagverk-ia-emne-group').forEach((group) => {
        let groupVisible = 0;
        const domainMatch = !query || text(group.dataset.domainSearch).includes(query);
        group.querySelectorAll('.fagverk-ia-emne').forEach((card) => {
          const match = domainMatch || !query || text(card.dataset.emneSearch).includes(query);
          card.hidden = !match;
          if (match) {
            visible += 1;
            groupVisible += 1;
          }
        });
        group.hidden = groupVisible === 0;
      });
      count.textContent = query ? `${visible} av ${model.emners.length} emner` : `${model.emners.length} emner`;
    };
    search?.addEventListener('input', update);
  }

  function renderLaerestoff(model, placeId) {
    const host = document.getElementById('fagverkIaLaerestoffContent');
    if (!host) return;
    const chapterCards = model.chapters.map((chapter) => `<a class="fagverk-ia-chapter" href="${escapeHtml(MODEL.chapterUrl(model.subject.id, chapter.id, { place: placeId }))}">
      <span class="fagverk-kicker">${chapter.role === 'specialization' ? 'Fordypning' : 'Lærekapittel'}</span>
      <strong>${escapeHtml(chapter.title)}</strong>
      <span>${escapeHtml(chapter.subtitle)}</span>
      <small>Les kapittelet →</small>
    </a>`).join('');

    const methodDetails = model.methods.map((method) => `<details><summary>${escapeHtml(method.title)}</summary>${method.description ? `<p>${escapeHtml(method.description)}</p>` : ''}${method.limitations.length ? `<p><strong>Begrensninger:</strong> ${escapeHtml(method.limitations.join(' · '))}</p>` : ''}</details>`).join('');

    host.innerHTML = `
      ${model.chapters.length ? `<div class="fagverk-ia-chapter-grid">${chapterCards}</div>` : '<p class="fagverk-ia-empty">Faget har ikke registrerte redigerte lærekapitler i registryet ennå. Emnene og fagområdene er fortsatt tilgjengelige som canonical fagstruktur.</p>'}
      <div id="fagverkIaCurriculumSlot"></div>
      ${model.methods.length ? `<details class="fagverk-ia-methods"><summary>Metoderegister (${model.methods.length})</summary><div>${methodDetails}</div></details>` : ''}
    `;

    const oldOverview = document.getElementById('fagverkSubjectOverview');
    const curriculumSlot = document.getElementById('fagverkIaCurriculumSlot');
    const hasOwnedCurriculum = model.source.curriculum?.status === 'active_curriculum_navigation';
    if (oldOverview && curriculumSlot && hasOwnedCurriculum) {
      const heading = document.createElement('div');
      heading.className = 'fagverk-ia-subhead';
      heading.innerHTML = '<p class="fagverk-kicker">Canonicalt studieløp</p><h4>Fagets læringsstruktur</h4>';
      curriculumSlot.appendChild(heading);
      curriculumSlot.appendChild(oldOverview);
      oldOverview.hidden = false;
    } else if (oldOverview) {
      oldOverview.hidden = true;
    }
  }

  function renderUtforsk(model) {
    const host = document.getElementById('fagverkIaUtforskContent');
    if (!host) return;
    if (!model.places.length) {
      host.innerHTML = '<p class="fagverk-ia-empty">Ingen canonicale stedskoblinger er registrert for dette faget ennå.</p>';
      return;
    }
    const renderPlace = (place) => `<a class="fagverk-ia-place" href="${escapeHtml(place.route)}"><strong>${escapeHtml(place.title)}</strong><span>${escapeHtml(place.intro)}</span><small>Åpne stedets fagverkside →</small></a>`;
    const primary = model.places.slice(0, 12);
    const rest = model.places.slice(12);
    host.innerHTML = `
      <div class="fagverk-ia-place-grid">${primary.map(renderPlace).join('')}</div>
      ${rest.length ? `<details class="fagverk-ia-more"><summary>Vis ${rest.length} flere steder</summary><div class="fagverk-ia-place-grid">${rest.map(renderPlace).join('')}</div></details>` : ''}
    `;
  }

  function renderProgresjon(model, progress) {
    const host = document.getElementById('fagverkIaProgresjonContent');
    if (!host) return;
    const complete = progress.coverage.filter((row) => Number(row?.percent || 0) === 100).length;
    const average = progress.coverage.length
      ? Math.round(progress.coverage.reduce((sum, row) => sum + Number(row?.percent || 0), 0) / progress.coverage.length)
      : 0;
    const domainRows = progress.domainProgress.map((row) => {
      const domain = model.domainsById.get(row.domainId);
      return `<div class="fagverk-ia-progress-row"><span>${escapeHtml(domain?.label || row.domainId)}</span><div><i style="width:${Math.max(0, Math.min(100, Number(row.percent || 0)))}%"></i></div><b>${Number(row.percent || 0)}%</b></div>`;
    }).join('');

    host.innerHTML = `
      <div class="fagverk-ia-progress-summary">
        <article><strong>${progress.points}</strong><span>poeng</span></article>
        <article><strong>${escapeHtml(progress.tier.label)}</strong><span>nivå</span></article>
        <article><strong>${complete}/${model.emners.length}</strong><span>emner fullt dekket</span></article>
        <article><strong>${average}%</strong><span>gjennomsnittlig dekning</span></article>
        <article><strong>${progress.quizHistory.length}</strong><span>fullførte fagquizer</span></article>
        <article><strong>${progress.visitedPlaces}</strong><span>besøkte fagsteder</span></article>
      </div>
      <section class="fagverk-ia-domain-progress"><h4>Dekning per fagområde</h4>${domainRows}</section>
      <div class="fagverk-ia-progress-actions">
        <a href="emner.html">Åpne samlet læringsprogresjon →</a>
        ${model.subject.routes.badge ? `<a href="${escapeHtml(model.subject.routes.badge)}">Åpne merkevisningen →</a>` : ''}
      </div>
    `;
  }

  async function init() {
    const params = new URLSearchParams(global.location.search);
    const subjectId = text(params.get('subject'));
    const domainId = text(params.get('domain'));
    const emneId = text(params.get('emne'));
    const chapterId = text(params.get('chapter'));
    const placeId = text(params.get('place'));

    if (!subjectId || domainId || emneId || chapterId) return;

    try {
      await waitForBaseRender();
      const model = await MODEL.load(subjectId);
      const progress = MODEL.readProgress(model);
      const nav = document.getElementById('fagverkIaNav');
      const root = document.getElementById('fagverkIaRoot');
      if (!nav || !root) throw new Error('Fagverk IA-verter mangler i fagverk.html');

      renderOverview(model, progress);
      renderEmner(model, progress, placeId);
      renderLaerestoff(model, placeId);
      renderUtforsk(model);
      renderProgresjon(model, progress);

      document.body.classList.add('fagverk-ia-v3-root');
      nav.hidden = false;
      root.hidden = false;
    } catch (error) {
      console.error('[fagverk-ia-v3]', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window);
