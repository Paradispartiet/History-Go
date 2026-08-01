// @ts-nocheck
(function installFagverkPage(global) {
  'use strict';

  const MODEL = global.HGFagverkSubjectModel;
  if (!MODEL) throw new Error('HGFagverkSubjectModel må lastes før fagverk.js');
  const CORE = global.HGFagverkSubjectCore;
  if (!CORE) throw new Error('HGFagverkSubjectCore må lastes før fagverk.js');

  const CHAPTER_SELECTORS = [
    '.fagverk-diagnostic',
    '.fagverk-objectives',
    '.fagverk-contents',
    '#fagverkSections',
    '.fagverk-examples',
    '.fagverk-misconceptions',
    '.fagverk-concepts',
    '.fagverk-application',
    '.fagverk-selfcheck',
    '.fagverk-cases',
    '.fagverk-sources'
  ];

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

  function setHidden(selectorOrElement, hidden) {
    const element = typeof selectorOrElement === 'string' ? document.querySelector(selectorOrElement) : selectorOrElement;
    if (element) element.hidden = hidden;
  }

  function hideAllViews() {
    for (const id of ['fagverkSubjectOverview', 'fagverkCanonicalDomain', 'fagverkCanonicalEmne', 'fagverkMethods']) setHidden(`#${id}`, true);
    for (const selector of CHAPTER_SELECTORS) document.querySelectorAll(selector).forEach((element) => { element.hidden = true; });
  }

  function showChapterViews() {
    for (const selector of CHAPTER_SELECTORS) document.querySelectorAll(selector).forEach((element) => { element.hidden = false; });
  }

  function renderHero(kicker, title, subtitle, lead) {
    document.getElementById('fagverkChapterKicker').textContent = text(kicker);
    document.getElementById('fagverkChapterTitle').textContent = text(title);
    document.getElementById('fagverkChapterSubtitle').textContent = text(subtitle);
    document.getElementById('fagverkLead').textContent = text(lead);
  }

  function renderProgress(model, progress) {
    const host = document.getElementById('fagverkSubjectProgress');
    if (!host) return;
    const complete = progress.coverage.filter((row) => Number(row?.percent || 0) === 100).length;
    const average = progress.coverage.length
      ? Math.round(progress.coverage.reduce((sum, row) => sum + Number(row?.percent || 0), 0) / progress.coverage.length)
      : 0;
    host.innerHTML = `
      <p class="fagverk-kicker">Din progresjon</p>
      <div class="fagverk-canonical-progress-grid">
        <div class="fagverk-canonical-progress-card"><strong>${progress.points} poeng</strong><span>${escapeHtml(progress.tier.label)}</span></div>
        <div class="fagverk-canonical-progress-card"><strong>${complete}/${model.emners.length}</strong><span>emner fullt dekket</span></div>
        <div class="fagverk-canonical-progress-card"><strong>${average}%</strong><span>gjennomsnittlig dekning</span></div>
        <div class="fagverk-canonical-progress-card"><strong>${progress.quizHistory.length}</strong><span>fullførte fagquizer</span></div>
      </div>
      ${model.subject.routes.badge ? `<a class="fagverk-map-link" href="${escapeHtml(model.subject.routes.badge)}">Åpne merket →</a>` : ''}
    `;
  }

  function renderDomainNav(model, progress, selectedDomainId, placeId) {
    const host = document.getElementById('fagverkDomainNav');
    if (!host) return;
    const progressById = new Map(progress.domainProgress.map((row) => [row.domainId, row]));
    host.innerHTML = `<p class="fagverk-kicker">Fagområder</p>` + model.domains.map((domain) => {
      const row = progressById.get(domain.id) || {};
      const href = MODEL.domainUrl(model.subject.id, domain.id, { place: placeId });
      return `<a class="${domain.id === selectedDomainId ? 'is-active' : ''}" href="${escapeHtml(href)}">
        <strong>${escapeHtml(domain.label)}</strong>
        <span>${domain.emneIds.length} emner · ${Number(row.percent || 0)}% dekket</span>
      </a>`;
    }).join('');
  }

  function renderChapterNav(model, selectedChapterId, placeId) {
    const host = document.getElementById('fagverkChapterNav');
    if (!host) return;
    if (!model.chapters.length) {
      host.innerHTML = '';
      return;
    }
    host.innerHTML = `<p class="fagverk-kicker">Lærekapitler</p>` + model.chapters.map((chapter) => {
      const href = MODEL.chapterUrl(model.subject.id, chapter.id, { place: placeId });
      return `<a class="fagverk-chapter-link${chapter.id === selectedChapterId ? ' is-active' : ''}" href="${escapeHtml(href)}">
        <strong>${escapeHtml(chapter.title)}</strong>
        <span>${escapeHtml(chapter.subtitle)}</span>
      </a>`;
    }).join('');
  }

  function renderPlaceContext(model, placeId) {
    const host = document.getElementById('fagverkPlaceContext');
    if (!host) return;
    const id = text(placeId);
    if (!id) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }
    const place = model.places.find((item) => item.id === id);
    const title = place?.title || id.replaceAll('_', ' ');
    host.innerHTML = `
      <p class="fagverk-kicker">Du kom fra et sted</p>
      <h2>${escapeHtml(title)}</h2>
      <p>Faget forklarer den generelle kunnskapen. Stedets egen side samler perspektivene rundt akkurat dette stedet.</p>
      <a class="fagverk-map-link" href="${escapeHtml(MODEL.placePageUrl(id))}">Tilbake til stedets fagverkside →</a>
    `;
    host.hidden = false;
  }

  function domainCard(model, domain, progressById, placeId) {
    const row = progressById.get(domain.id) || {};
    return `<a class="fagverk-general-domain-card" href="${escapeHtml(MODEL.domainUrl(model.subject.id, domain.id, { place: placeId }))}">
      <span class="fagverk-kicker">${domain.emneIds.length} emner · ${domain.methodIds.length} metoder</span>
      <strong>${escapeHtml(domain.label)}</strong>
      <span>${escapeHtml(domain.definition)}</span>
      <small>${Number(row.percent || 0)}% dekket →</small>
    </a>`;
  }

  function renderOverview(model, progress, placeId) {
    hideAllViews();
    renderHero('Fagoversikt', model.subject.title, `${model.summary.domainCount} fagområder · ${model.summary.emneCount} emner · ${model.summary.methodCount} metoder`, model.subject.description);
    const host = document.getElementById('fagverkSubjectOverview');
    const progressById = new Map(progress.domainProgress.map((row) => [row.domainId, row]));
    host.innerHTML = `
      <div class="fagverk-general-summary" aria-label="Fagets omfang">
        <div><strong>${model.summary.domainCount}</strong><span>fagområder</span></div>
        <div><strong>${model.summary.emneCount}</strong><span>emner</span></div>
        <div><strong>${model.summary.methodCount}</strong><span>metoder</span></div>
        <div><strong>${model.summary.hookCount}</strong><span>faglige hooks</span></div>
      </div>
      <section>
        <h3>Fagområder</h3>
        <div class="fagverk-general-domain-grid">${model.domains.map((domain) => domainCard(model, domain, progressById, placeId)).join('')}</div>
      </section>
      ${model.chapters.length ? `<section>
        <h3>Lærekapitler</h3>
        <div class="fagverk-general-domain-grid">${model.chapters.map((chapter) => `<a class="fagverk-general-domain-card" href="${escapeHtml(MODEL.chapterUrl(model.subject.id, chapter.id, { place: placeId }))}"><span class="fagverk-kicker">Redigert lærestoff</span><strong>${escapeHtml(chapter.title)}</strong><span>${escapeHtml(chapter.subtitle)}</span><small>Les kapittelet →</small></a>`).join('')}</div>
      </section>` : ''}
      <section>
        <h3>Metoder</h3>
        <p class="fagverk-section-intro">Metodene viser hvordan faget undersøker kilder, steder, systemer og observasjoner.</p>
        <div class="fagverk-general-method-list">${model.methods.map((method) => `<details><summary>${escapeHtml(method.title)}</summary><p>${escapeHtml(method.description)}</p>${method.dataForms.length ? `<h5>Datagrunnlag</h5><ul>${method.dataForms.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${method.procedure.length ? `<h5>Slik arbeider metoden</h5><ol>${method.procedure.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>` : ''}${method.limitations.length ? `<h5>Begrensninger</h5><ul>${method.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}</details>`).join('')}</div>
      </section>
      ${model.places.length ? `<section><h3>Steder å utforske</h3><div class="fagverk-case-grid">${model.places.map((place) => `<a class="fagverk-case" href="${escapeHtml(place.route)}"><strong>${escapeHtml(place.title)}</strong><span>${escapeHtml(place.intro)}</span><small>Åpne stedets fagverkside →</small></a>`).join('')}</div></section>` : ''}
    `;
    host.hidden = false;
  }

  function renderDomain(model, domain, progress, placeId) {
    hideAllViews();
    renderHero('Fagområde', domain.label, `${domain.emneIds.length} emner · ${domain.methodIds.length} metoder`, domain.definition);
    const host = document.getElementById('fagverkCanonicalDomain');
    const methods = domain.methodIds.map((id) => model.methodsById.get(id)).filter(Boolean);
    const emners = domain.emneIds.map((id) => model.emnersById.get(id)).filter(Boolean);
    const chapters = model.chapters.filter((chapter) => chapter.primaryDomainId === domain.id);
    host.innerHTML = `
      <div class="fagverk-canonical-domain-meta"><span>${emners.length} emner</span><span>${methods.length} metoder</span><span>${domain.hookIds.length} hooks</span></div>
      <div class="fagverk-canonical-emne-list">${emners.map((emne) => {
        const row = progress.coverageById.get(emne.id) || {};
        return `<a href="${escapeHtml(MODEL.emneUrl(model.subject.id, domain.id, emne.id, { place: placeId }))}"><span><strong>${escapeHtml(emne.title)}</strong><small>${escapeHtml(emne.definition || emne.whyItMatters)}</small></span><b>${Number(row.percent || 0)}%</b></a>`;
      }).join('')}</div>
      ${chapters.length ? `<section><h4>Lærekapitler i fagområdet</h4><div class="fagverk-general-domain-grid">${chapters.map((chapter) => `<a class="fagverk-general-domain-card" href="${escapeHtml(MODEL.chapterUrl(model.subject.id, chapter.id, { domain: domain.id, place: placeId }))}"><span class="fagverk-kicker">Redigert lærestoff</span><strong>${escapeHtml(chapter.title)}</strong><span>${escapeHtml(chapter.subtitle)}</span><small>Les kapittelet →</small></a>`).join('')}</div></section>` : ''}
      ${methods.length ? `<section><h4>Metoder i fagområdet</h4><div class="fagverk-general-method-list">${methods.map((method) => `<details><summary>${escapeHtml(method.title)}</summary><p>${escapeHtml(method.description)}</p>${method.procedure.length ? `<h5>Slik arbeider metoden</h5><ol>${method.procedure.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>` : ''}${method.limitations.length ? `<h5>Begrensninger</h5><ul>${method.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}</details>`).join('')}</div></section>` : ''}
    `;
    host.hidden = false;
  }

  function renderEmne(model, emne, placeId, selectedConcept) {
    hideAllViews();
    const domain = model.domainsById.get(emne.domainId);
    renderHero('Emne', emne.title, domain?.label || '', emne.definition);
    const host = document.getElementById('fagverkCanonicalEmne');
    const methods = emne.methodIds.map((id) => model.methodsById.get(id)).filter(Boolean);
    const relevantPlaces = model.places.filter((place) => place.emneIds.includes(emne.id));
    const relevantChapters = model.chapters.filter((chapter) => chapter.emneIds.includes(emne.id) || chapter.primaryDomainId === emne.domainId);
    const selected = text(selectedConcept).toLocaleLowerCase('nb-NO');
    host.innerHTML = `
      ${emne.whyItMatters ? `<p><strong>Hvorfor det betyr noe:</strong> ${escapeHtml(emne.whyItMatters)}</p>` : ''}
      <div class="fagverk-canonical-emne-meta">
        <a href="${escapeHtml(MODEL.domainUrl(model.subject.id, emne.domainId, { place: placeId }))}">${escapeHtml(domain?.label || emne.domainId)}</a>
        <span>${emne.level != null ? `Nivå ${escapeHtml(emne.level)}` : 'Canonicalt emne'}</span>
      </div>
      <div class="fagverk-canonical-emne-grid">
        <div class="fagverk-canonical-box"><h4>Kjernespørsmål</h4><ul>${emne.keyQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        <div class="fagverk-canonical-box"><h4>Begreper</h4><div class="fagverk-canonical-underbadges">${emne.concepts.map((item) => `<span${selected && item.toLocaleLowerCase('nb-NO') === selected ? ' class="is-highlighted"' : ''}>${escapeHtml(item)}</span>`).join('')}</div></div>
        <div class="fagverk-canonical-box"><h4>Metoder</h4><ul>${methods.map((method) => `<li><details><summary><strong>${escapeHtml(method.title)}</strong></summary>${method.description ? `<p>${escapeHtml(method.description)}</p>` : ''}${method.procedure.length ? `<ol>${method.procedure.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>` : ''}${method.limitations.length ? `<p><strong>Begrensninger:</strong> ${escapeHtml(method.limitations.join(' · '))}</p>` : ''}</details></li>`).join('')}${emne.methodLabels.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        <div class="fagverk-canonical-box"><h4>Analytiske skiller</h4><ul>${[...emne.conflicts, ...emne.analysisAxes].map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      </div>
      ${relevantChapters.length ? `<section><h4>Relevante lærekapitler</h4><div class="fagverk-general-domain-grid">${relevantChapters.map((chapter) => `<a class="fagverk-general-domain-card" href="${escapeHtml(MODEL.chapterUrl(model.subject.id, chapter.id, { domain: emne.domainId, emne: emne.id, place: placeId }))}"><span class="fagverk-kicker">Redigert lærestoff</span><strong>${escapeHtml(chapter.title)}</strong><span>${escapeHtml(chapter.subtitle)}</span><small>Les kapittelet →</small></a>`).join('')}</div></section>` : ''}
      ${relevantPlaces.length ? `<section><h4>Relevante steder</h4><div class="fagverk-case-grid">${relevantPlaces.map((place) => `<a class="fagverk-case" href="${escapeHtml(place.route)}"><strong>${escapeHtml(place.title)}</strong><span>${escapeHtml(place.intro)}</span><small>Åpne stedets fagverkside →</small></a>`).join('')}</div></section>` : ''}
    `;
    host.hidden = false;
  }

  function renderDetails(hostId, items, numbered = false) {
    const host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML = list(items).map((item, index) => `<details class="fagverk-question"><summary>${numbered ? `<span>${index + 1}</span>` : ''}${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('');
  }

  function renderObjectives(chapter) {
    document.getElementById('fagverkObjectives').innerHTML = list(chapter.learningObjectives).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function renderContents(chapter) {
    document.getElementById('fagverkContents').innerHTML = list(chapter.sections).map((section) => {
      const id = text(section.id) || slug(section.title);
      return `<a href="#${escapeHtml(id)}">${escapeHtml(section.title)}</a>`;
    }).join('');
  }

  function renderSections(chapter) {
    document.getElementById('fagverkSections').innerHTML = list(chapter.sections).map((section) => {
      const id = text(section.id) || slug(section.title);
      return `<section class="fagverk-section" id="${escapeHtml(id)}"><h3>${escapeHtml(section.title)}</h3><div class="fagverk-prose">${list(section.paragraphs).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>${list(section.keyPoints).length ? `<div class="fagverk-keypoints"><h4>Hovedpoenger</h4><ul>${list(section.keyPoints).map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul></div>` : ''}</section>`;
    }).join('');
  }

  function renderChapterCards(hostId, items, renderer) {
    const host = document.getElementById(hostId);
    if (host) host.innerHTML = list(items).map(renderer).join('');
  }

  function renderChapterCases(chapter) {
    const host = document.getElementById('fagverkCases');
    host.innerHTML = list(chapter.relatedPlaces).map((place) => `<a class="fagverk-case" href="${escapeHtml(MODEL.placePageUrl(place.id))}"><strong>${escapeHtml(place.name)}</strong><span>${escapeHtml(place.role)}</span><small>Åpne stedets fagverkside →</small></a>`).join('');
  }

  function renderChapterSources(chapter) {
    document.getElementById('fagverkSources').innerHTML = list(chapter.sources).map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} ↗</a></li>`).join('');
  }

  async function renderChapter(model, chapterMeta, selectedConcept) {
    hideAllViews();
    showChapterViews();
    const chapter = await CORE.hydrateChapter(chapterMeta, fetchJson);
    renderHero(model.subject.title, chapter.title, chapter.subtitle, chapter.lead);
    renderDetails('fagverkDiagnostic', chapter.diagnosticQuestions);
    renderObjectives(chapter);
    renderContents(chapter);
    renderSections(chapter);
    renderChapterCards('fagverkExamples', chapter.workedExamples, (example) => `<article class="fagverk-learning-card"><p class="fagverk-kicker">Arbeidseksempel</p><h4>${escapeHtml(example.title)}</h4><p>${escapeHtml(example.situation)}</p><ol>${list(example.analysis).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></article>`);
    renderChapterCards('fagverkMisconceptions', chapter.commonMisconceptions, (item) => `<article class="fagverk-learning-card fagverk-misconception"><p class="fagverk-kicker">Påstand</p><h4>${escapeHtml(item.claim)}</h4><p>${escapeHtml(item.correction)}</p></article>`);
    const selected = text(selectedConcept).toLocaleLowerCase('nb-NO');
    renderChapterCards('fagverkConceptGrid', chapter.concepts, (concept) => {
      const id = text(concept.id) || slug(concept.term);
      const active = selected && [text(concept.term), text(concept.id)].some((value) => value.toLocaleLowerCase('nb-NO') === selected);
      return `<article class="fagverk-concept${active ? ' is-highlighted' : ''}" id="concept-${escapeHtml(id)}"><h4>${escapeHtml(concept.term)}</h4><p>${escapeHtml(concept.definition)}</p></article>`;
    });
    renderChapterCards('fagverkApplication', chapter.applicationTasks, (item, index) => `<article class="fagverk-learning-card"><p class="fagverk-kicker">Oppgave ${index + 1}</p><h4>${escapeHtml(item.task)}</h4><ul>${list(item.prompts).map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join('')}</ul></article>`);
    renderDetails('fagverkSelfCheck', chapter.selfCheck, true);
    renderChapterCases(chapter);
    renderChapterSources(chapter);
    if (selected) {
      const highlighted = document.querySelector('#fagverkConceptGrid .is-highlighted');
      if (highlighted) global.setTimeout(() => highlighted.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
    }
  }

  async function init() {
    const params = new URLSearchParams(global.location.search);
    const subjectId = text(params.get('subject'));
    const domainId = text(params.get('domain'));
    const emneId = text(params.get('emne'));
    const chapterId = text(params.get('chapter'));
    const placeId = text(params.get('place'));
    const selectedConcept = text(params.get('concept'));
    const loading = document.getElementById('fagverkLoading');
    const content = document.getElementById('fagverkContent');
    const errorBox = document.getElementById('fagverkError');

    try {
      if (!subjectId) throw new Error('Mangler subject i adressen. Åpne faget fra Fagverkforsiden.');
      const model = await MODEL.load(subjectId);
      const domain = domainId ? model.domainsById.get(domainId) : null;
      const emne = emneId ? model.emnersById.get(emneId) : null;
      const chapter = chapterId ? model.chaptersById.get(chapterId) : null;
      if (domainId && !domain) throw new Error(`Ukjent fagområde i ${subjectId}: ${domainId}`);
      if (emneId && !emne) throw new Error(`Ukjent emne i ${subjectId}: ${emneId}`);
      if (emne && domainId && emne.domainId !== domainId) throw new Error(`${emneId} tilhører ikke fagområdet ${domainId}`);
      if (chapterId && !chapter) throw new Error(`Ukjent lærekapittel i ${subjectId}: ${chapterId}`);

      const progress = MODEL.readProgress(model);
      document.title = `${model.subject.title} – History Go Fagverk`;
      document.getElementById('fagverkSubjectTitle').textContent = model.subject.title;
      document.getElementById('fagverkSubjectDescription').textContent = model.subject.description;
      const badgeLink = document.getElementById('fagverkBadgeLink');
      badgeLink.hidden = !model.subject.routes.badge;
      if (model.subject.routes.badge) badgeLink.href = model.subject.routes.badge;
      renderProgress(model, progress);
      renderDomainNav(model, progress, domainId || emne?.domainId || '', placeId);
      renderChapterNav(model, chapterId, placeId);
      renderPlaceContext(model, placeId);

      if (chapter) await renderChapter(model, chapter, selectedConcept);
      else if (emne) renderEmne(model, emne, placeId, selectedConcept);
      else if (domain) renderDomain(model, domain, progress, placeId);
      else renderOverview(model, progress, placeId);

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
