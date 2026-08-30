// @ts-nocheck
(function installFagverkIaV3(global) {
  'use strict';

  const MODEL = global.HGFagverkSubjectModel;
  if (!MODEL) throw new Error('HGFagverkSubjectModel må lastes før fagverk-ia-v3.js');
  const ROOT_VIEW_IDS = Object.freeze([
    'fagverkIaOversikt',
    'fagverkIaEmner',
    'fagverkIaLaerestoff',
    'fagverkIaUtforsk',
    'fagverkIaProgresjon'
  ]);

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

  function hashId() {
    try {
      return decodeURIComponent(text(global.location.hash).replace(/^#/, ''));
    } catch {
      return text(global.location.hash).replace(/^#/, '');
    }
  }

  function resolveRootView() {
    const targetId = hashId();
    if (ROOT_VIEW_IDS.includes(targetId)) return targetId;
    const target = targetId ? document.getElementById(targetId) : null;
    const owner = target?.closest?.('.fagverk-ia-section');
    return ROOT_VIEW_IDS.includes(owner?.id) ? owner.id : ROOT_VIEW_IDS[0];
  }

  function activateRootView(nav, root, { scrollNestedTarget = false } = {}) {
    const activeViewId = resolveRootView();
    root.querySelectorAll('.fagverk-ia-section').forEach((section) => {
      section.hidden = section.id !== activeViewId;
    });
    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      const active = link.getAttribute('href') === `#${activeViewId}`;
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const nestedTargetId = hashId();
    if (scrollNestedTarget && nestedTargetId && !ROOT_VIEW_IDS.includes(nestedTargetId)) {
      const target = document.getElementById(nestedTargetId);
      if (target?.closest?.(`#${activeViewId}`)) global.setTimeout(() => target.scrollIntoView({ block: 'start' }), 0);
    }
  }

  function installRootNavigation(nav, root) {
    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = text(link.getAttribute('href')).replace(/^#/, '');
        if (!ROOT_VIEW_IDS.includes(targetId)) return;
        event.preventDefault();
        if (hashId() !== targetId) global.history.pushState(null, '', `#${targetId}`);
        activateRootView(nav, root);
      });
    });
    global.addEventListener('hashchange', () => activateRootView(nav, root, { scrollNestedTarget: true }));
    activateRootView(nav, root, { scrollNestedTarget: true });
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
    const domainProgressById = new Map(progress.domainProgress.map((row) => [row.domainId, row]));
    const groups = model.domains.map((domain) => {
      const emners = domain.emneIds.map((id) => model.emnersById.get(id)).filter(Boolean);
      const domainProgress = domainProgressById.get(domain.id) || {};
      const cards = emners.map((emne) => {
        const row = progress.coverageById.get(emne.id) || {};
        const href = MODEL.emneUrl(model.subject.id, domain.id, emne.id, { place: placeId });
        const searchText = [emne.title, emne.definition, emne.whyItMatters, ...emne.concepts].join(' ').toLocaleLowerCase('nb-NO');
        return `<a class="fagverk-ia-emne" href="${escapeHtml(href)}" data-emne-search="${escapeHtml(searchText)}">
          <span><strong>${escapeHtml(emne.title)}</strong><small>${escapeHtml(emne.definition || emne.whyItMatters || domain.label)}</small></span>
          <b>${Number(row.percent || 0)}%</b>
        </a>`;
      }).join('');
      return `<details class="fagverk-ia-emne-group" data-domain-search="${escapeHtml([domain.label, domain.definition].join(' ').toLocaleLowerCase('nb-NO'))}">
        <summary><span><span class="fagverk-kicker">Fagområde</span><strong>${escapeHtml(domain.label)}</strong></span><small>${emners.length} emner · ${Number(domainProgress.percent || 0)}% dekket</small></summary>
        <div class="fagverk-ia-emne-group-body">
          ${domain.definition ? `<p>${escapeHtml(domain.definition)}</p>` : ''}
          <a class="fagverk-ia-domain-link" href="${escapeHtml(MODEL.domainUrl(model.subject.id, domain.id, { place: placeId }))}">Åpne fagområdet →</a>
          <div class="fagverk-ia-emne-list">${cards}</div>
        </div>
      </details>`;
    }).join('');

    host.innerHTML = `
      <label class="fagverk-ia-search" for="fagverkIaEmneSearch"><span>Søk i alle emner</span><input id="fagverkIaEmneSearch" type="search" autocomplete="off" placeholder="Søk etter emne eller begrep"></label>
      <p id="fagverkIaEmneCount" class="fagverk-ia-count">${model.emners.length} emner · ${model.domains.length} fagområder</p>
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
        group.hidden = Boolean(query) && groupVisible === 0;
        if (query && groupVisible > 0) {
          if (!group.open) group.dataset.searchOpened = 'true';
          group.open = true;
        } else if (!query && group.dataset.searchOpened === 'true') {
          group.open = false;
          delete group.dataset.searchOpened;
        }
      });
      count.textContent = query ? `${visible} av ${model.emners.length} emner` : `${model.emners.length} emner · ${model.domains.length} fagområder`;
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

  function renderUtforsk(model, progress) {
    const host = document.getElementById('fagverkIaUtforskContent');
    if (!host) return;
    const renderPlace = (place) => {
      const visited = progress.visited?.has?.(place.id);
      return `<a class="fagverk-ia-place${visited ? ' is-visited' : ''}" href="${escapeHtml(place.route)}" data-place-id="${escapeHtml(place.id)}">
        <strong>${visited ? '<span aria-hidden="true">✓</span> ' : ''}${escapeHtml(place.title)}</strong>
        <span>${escapeHtml(place.intro)}</span>
        <small>${visited ? 'Besøkt · åpne igjen →' : 'Åpne stedets fagverkside →'}</small>
      </a>`;
    };
    const primary = model.places.slice(0, 12);
    const rest = model.places.slice(12);
    const placesHtml = model.places.length
      ? `<div class="fagverk-ia-place-grid">${primary.map(renderPlace).join('')}</div>
        ${rest.length ? `<details class="fagverk-ia-more"><summary>Vis ${rest.length} flere steder</summary><div class="fagverk-ia-place-grid">${rest.map(renderPlace).join('')}</div></details>` : ''}`
      : '<p class="fagverk-ia-empty">Ingen canonicale stedskoblinger er registrert for dette faget ennå.</p>';

    host.innerHTML = `${placesHtml}<div id="fagverkIaCareerSlot" class="fagverk-ia-career-slot"></div>`;

    // Career Knowledge Bridge renderer senere i scriptrekkefølgen bruker de samme DOM-id-ene.
    // Flytt den skjulte verten inn i Utforsk nå, slik at eventuell asynkron rendering ikke
    // oppretter en sjette, løs seksjon under den nye femdelte IA-en.
    const careerSlot = document.getElementById('fagverkIaCareerSlot');
    const careerSection = document.getElementById('fagverkCareerUses');
    if (careerSlot && careerSection && careerSection.parentElement !== careerSlot) careerSlot.appendChild(careerSection);
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
    const quizRows = progress.quizHistory.slice()
      .sort((a, b) => new Date(b?.date || b?.timestamp || 0) - new Date(a?.date || a?.timestamp || 0))
      .slice(0, 12)
      .map((item) => {
        const correct = Number(item?.correctCount || (Array.isArray(item?.correctAnswers) ? item.correctAnswers.length : 0) || 0);
        const total = Number(item?.total || correct || 0);
        const rawDate = item?.date || item?.timestamp;
        const parsedDate = rawDate ? new Date(rawDate) : null;
        const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString('nb-NO') : '';
        const meta = [date, total ? `${correct}/${total} riktige` : ''].filter(Boolean).join(' · ');
        return `<article><strong>${escapeHtml(item?.name || item?.title || item?.id || `${model.subject.title}-quiz`)}</strong>${meta ? `<span>${escapeHtml(meta)}</span>` : ''}</article>`;
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
      <section class="fagverk-ia-quiz-history" aria-labelledby="fagverkIaQuizHistoryTitle">
        <h4 id="fagverkIaQuizHistoryTitle">Fullførte fagquizer</h4>
        <div>${quizRows || '<p class="fagverk-ia-empty">Ingen fagquiz er fullført ennå.</p>'}</div>
      </section>
      <div class="fagverk-ia-progress-actions">
        <a href="emner.html">Åpne samlet læringsprogresjon →</a>
        <a href="profile.html#merker">Åpne merkeprofilen →</a>
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
      renderUtforsk(model, progress);
      renderProgresjon(model, progress);
      installRootNavigation(nav, root);

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
