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
    '.fagverk-editorial',
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
    const curriculum = model.source.curriculum;
    if (model.subject.id === 'historie' && curriculum?.status === 'active_curriculum_navigation') {
      const overviewUrl = `${model.subject.routes.subject}${placeId ? `&place=${encodeURIComponent(placeId)}` : ''}`;
      host.innerHTML = `<p class="fagverk-kicker">Studieløp</p>
        <a href="${escapeHtml(overviewUrl)}#historie-progresjon"><strong>Hva lærer jeg først?</strong><span>Fra grunnlag til fordypning</span></a>
        <a href="${escapeHtml(overviewUrl)}#historie-kronologi"><strong>Kronologisk grunnstamme</strong><span>${curriculum.chronological_spine.length} perioder</span></a>
        <a href="${escapeHtml(overviewUrl)}#historie-tema"><strong>Tematiske fagretninger</strong><span>${curriculum.thematic_fields.length} gjennomgående spor</span></a>
        <a href="${escapeHtml(overviewUrl)}#historie-metode"><strong>Metode og historiografi</strong><span>${curriculum.method_foundation.length} grunnmoduler</span></a>
        <a href="${escapeHtml(overviewUrl)}#historie-geografi"><strong>Geografiske læringsstier</strong><span>${curriculum.geographic_paths.length} skalaer</span></a>
        <details class="fagverk-domain-registry"><summary>Canonicalt fagregister (${model.domains.length})</summary>${model.domains.map((domain) => {
          const row = progressById.get(domain.id) || {};
          const href = MODEL.domainUrl(model.subject.id, domain.id, { place: placeId });
          return `<a class="${domain.id === selectedDomainId ? 'is-active' : ''}" href="${escapeHtml(href)}"><strong>${escapeHtml(domain.label)}</strong><span>${domain.emneIds.length} emner · ${Number(row.percent || 0)}% dekket</span></a>`;
        }).join('')}</details>`;
      return;
    }
    if (model.subject.id === 'politikk' && curriculum?.status === 'active_curriculum_navigation') {
      const overviewUrl = `${model.subject.routes.subject}${placeId ? `&place=${encodeURIComponent(placeId)}` : ''}`;
      host.innerHTML = `<p class="fagverk-kicker">Studieløp</p>
        <a href="${escapeHtml(overviewUrl)}#politikk-progresjon"><strong>Hva lærer jeg først?</strong><span>${curriculum.progression.length} progresjonstrinn</span></a>
        <a href="${escapeHtml(overviewUrl)}#politikk-grunnlag"><strong>Grunnspørsmål</strong><span>${curriculum.foundations.length} analytiske grunnspor</span></a>
        <a href="${escapeHtml(overviewUrl)}#politikk-fagfelt"><strong>Statsvitenskapelige fagfelt</strong><span>${curriculum.disciplinary_fields.length} hovedretninger</span></a>
        <a href="${escapeHtml(overviewUrl)}#politikk-prosess"><strong>Politikkprosessen</strong><span>${curriculum.policy_cycle.length} sammenhengende ledd</span></a>
        <a href="${escapeHtml(overviewUrl)}#politikk-metode"><strong>Metode</strong><span>${curriculum.method_foundation.length} metodemoduler</span></a>
        <a href="${escapeHtml(overviewUrl)}#politikk-niva"><strong>Styringsnivåer</strong><span>${curriculum.governance_scales.length} skalaer</span></a>
        <a href="${escapeHtml(overviewUrl)}#politikk-begreper"><strong>Begrepsverk</strong><span>${model.concepts.length} forklarte oppføringer</span></a>
        <details class="fagverk-domain-registry"><summary>Canonicalt fagregister (${model.domains.length})</summary>${model.domains.map((domain) => {
          const row = progressById.get(domain.id) || {};
          const href = MODEL.domainUrl(model.subject.id, domain.id, { place: placeId });
          return `<a class="${domain.id === selectedDomainId ? 'is-active' : ''}" href="${escapeHtml(href)}"><strong>${escapeHtml(domain.label)}</strong><span>${domain.emneIds.length} emner · ${Number(row.percent || 0)}% dekket</span></a>`;
        }).join('')}</details>`;
      return;
    }
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
        <span>${chapter.role === 'specialization' ? 'Fordypning · ' : ''}${escapeHtml(chapter.subtitle)}</span>
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

  function historyConceptCard(concept, model, placeId, { open = false } = {}) {
    const owner = concept.emneIds.map((id) => model.emnersById.get(id)).find(Boolean);
    const domainLabels = concept.domainIds.map((id) => model.domainsById.get(id)?.label).filter(Boolean);
    const relationIds = [...concept.broaderIds, ...concept.narrowerIds, ...concept.relatedIds].slice(0, 8);
    const relations = relationIds.map((id) => model.conceptsById.get(id)).filter(Boolean);
    return `<details class="fagverk-history-concept" data-concept-id="${escapeHtml(concept.id)}"${open ? ' open' : ''}>
      <summary><strong>${escapeHtml(concept.label)}</strong>${concept.type ? `<span>${escapeHtml(concept.type.replaceAll('_', ' '))}</span>` : ''}</summary>
      <p>${escapeHtml(concept.definition)}</p>
      ${domainLabels.length ? `<small><strong>Fagfelt:</strong> ${escapeHtml(domainLabels.join(' · '))}</small>` : ''}
      ${concept.commonMisuse.length ? `<div class="fagverk-concept-warning"><strong>Vanlig feilbruk</strong><p>${escapeHtml(concept.commonMisuse.join(' '))}</p></div>` : ''}
      ${concept.indicators.length ? `<details><summary>Hva du ser etter i kildene</summary><ul>${concept.indicators.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details>` : ''}
      ${concept.sourceRequirements.length ? `<details><summary>Kildekrav</summary><ul>${concept.sourceRequirements.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details>` : ''}
      ${relations.length ? `<p class="fagverk-concept-relations"><strong>Se også:</strong> ${relations.map((item) => escapeHtml(item.label)).join(' · ')}</p>` : ''}
      ${owner ? `<a class="fagverk-concept-owner" href="${escapeHtml(MODEL.emneUrl(model.subject.id, owner.domainId, owner.id, { place: placeId, concept: concept.id }))}">Les begrepet i emnet ${escapeHtml(owner.title)} →</a>` : ''}
    </details>`;
  }

  function renderHistoryCurriculumOverview(model, progress, placeId) {
    const curriculum = model.source.curriculum;
    const periodGuides = model.source.periodGuides;
    const periodModules = model.source.periodModules;
    const periodGuideById = new Map(list(periodGuides?.guides).map((guide) => [guide.period_id, guide]));
    const periodModuleById = new Map(list(periodModules?.modules).map((module) => [module.module_id, module]));
    const periodCaseById = new Map(list(periodModules?.cases).map((item) => [item.case_id, item]));
    const periodSourceById = new Map(list(periodModules?.sources).map((item) => [item.source_id, item]));
    const host = document.getElementById('fagverkSubjectOverview');
    const statusLabel = { covered: 'Dekket', partial: 'Delvis dekket', missing: 'Mangler fagfelt' };
    const emneLink = (emneId) => {
      const emne = model.emnersById.get(emneId);
      if (!emne) return '';
      return `<a href="${escapeHtml(MODEL.emneUrl(model.subject.id, emne.domainId, emne.id, { place: placeId }))}">${escapeHtml(emne.title)}</a>`;
    };
    const domainLink = (domainId) => {
      const domain = model.domainsById.get(domainId);
      if (!domain) return '';
      return `<a href="${escapeHtml(MODEL.domainUrl(model.subject.id, domain.id, { place: placeId }))}">${escapeHtml(domain.label)}</a>`;
    };
    const profileStatus = (path) => path.active_profile_ids?.length ? `${path.active_profile_ids.length} aktive profil${path.active_profile_ids.length === 1 ? '' : 'er'}` : 'Universell læringssti';
    const learningText = (item, options = {}) => {
      const outcomes = list(item.learning_outcomes);
      const questions = list(item.key_questions);
      const outcomeHeading = options.outcomeHeading || 'Etter denne delen skal du kunne';
      return `${item.overview ? `<p class="fagverk-curriculum-overview">${escapeHtml(item.overview)}</p>` : ''}
        ${outcomes.length ? `<div class="fagverk-curriculum-outcomes"><h4>${escapeHtml(outcomeHeading)}</h4><ul>${outcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join('')}</ul></div>` : ''}
        ${questions.length ? `<details class="fagverk-curriculum-questions"><summary>Nøkkelspørsmål å arbeide med</summary><ul>${questions.map((question) => `<li>${escapeHtml(question)}</li>`).join('')}</ul></details>` : ''}`;
    };
    const renderEntryEmners = (period) => period.entry_emne_ids.length ? `<details class="fagverk-curriculum-entries"><summary>${period.entry_emne_ids.length} kuraterte inngangsemner</summary><div class="fagverk-canonical-underbadges">${period.entry_emne_ids.map(emneLink).join('')}</div></details>` : '';
    const renderPeriodGuide = (period) => {
      const guide = periodGuideById.get(period.id);
      if (!guide) return '';
      return `<div class="fagverk-period-guide">
        <p>${escapeHtml(guide.introduction)}</p>
        <details><summary>Les den sammenhengende periodeoversikten</summary>
          ${guide.sections.map((section) => `<section><h5>${escapeHtml(section.title)}</h5>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('')}
          <div class="fagverk-period-guide-meta"><strong>Sentrale begreper</strong><p>${escapeHtml(guide.core_concepts.join(' · '))}</p><strong>Forbindelser til andre spor</strong><p>${escapeHtml(guide.connections.join(' · '))}</p></div>
        </details>
      </div>`;
    };
    const renderPeriodModule = (period) => {
      const module = periodModuleById.get(period.period_module_id);
      if (!module) return '';
      const moduleCaseIds = [...new Set(module.units.flatMap((unit) => list(unit.case_ids)))];
      const moduleSourceIds = [...new Set(module.units.flatMap((unit) => list(unit.source_ids)))];
      return `<details class="fagverk-period-module"><summary>${module.units.length} kilde- og casebundne læringsenheter</summary>
        <p><strong>Hovedpåstand:</strong> ${escapeHtml(module.thesis)}</p>
        <p><strong>Kildeproblem:</strong> ${escapeHtml(module.historiographical_problem)}</p>
        <div class="fagverk-period-module-units">${module.units.map((unit) => `<article data-period-unit-id="${escapeHtml(unit.unit_id)}"><h5>${escapeHtml(unit.title)}</h5><p>${escapeHtml(unit.summary)}</p><ul>${unit.claims.map((claim) => `<li>${escapeHtml(claim)}</li>`).join('')}</ul><details><summary>Kunnskapssjekk og svar</summary><p><strong>${escapeHtml(unit.knowledge_check.question)}</strong></p><p>${escapeHtml(unit.knowledge_check.answer)}</p></details></article>`).join('')}</div>
        <div class="fagverk-period-module-cases"><h5>Fysiske cases</h5><ul>${moduleCaseIds.map((caseId) => periodCaseById.get(caseId)).filter(Boolean).map((item) => `<li><a href="${escapeHtml(MODEL.placePageUrl(item.place_id))}">${escapeHtml(item.place_id.replaceAll('_', ' '))}</a> – ${escapeHtml(item.use)}</li>`).join('')}</ul></div>
        <details class="fagverk-period-module-sources"><summary>${moduleSourceIds.length} kontrollerbare kilder brukt i modulen</summary><ul>${moduleSourceIds.map((sourceId) => periodSourceById.get(sourceId)).filter(Boolean).map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a><span> – ${escapeHtml(source.publisher)}; ${escapeHtml(source.source_location)}</span></li>`).join('')}</ul></details>
      </details>`;
    };

    hideAllViews();
    renderHero(
      'Historiefaget',
      model.subject.title,
      `${curriculum.chronological_spine.length} perioder · ${curriculum.thematic_fields.length} fagretninger · ${curriculum.method_foundation.length} metodemoduler`,
      'Begynn med tid og kilder, følg den kronologiske hovedlinjen, og bruk deretter tematiske og geografiske spor til fordypning.'
    );
    host.innerHTML = `
      <section class="fagverk-curriculum-introduction" aria-labelledby="historie-intro-title">
        <p class="fagverk-kicker">Slik er faget bygget</p>
        <h3 id="historie-intro-title">${escapeHtml(curriculum.editorial_introduction.heading)}</h3>
        ${curriculum.editorial_introduction.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        <p class="fagverk-curriculum-reading-guide"><strong>Leseguide:</strong> ${escapeHtml(curriculum.editorial_introduction.reading_guide)}</p>
      </section>
      <div class="fagverk-general-summary" aria-label="Historiefagets oppbygning">
        <div><strong>${curriculum.chronological_spine.length}</strong><span>perioder</span></div>
        <div><strong>${curriculum.thematic_fields.length}</strong><span>tematiske spor</span></div>
        <div><strong>${curriculum.method_foundation.length}</strong><span>metodemoduler</span></div>
        <div><strong>${curriculum.geographic_paths.length}</strong><span>geografiske stier</span></div>
      </div>
      <section id="historie-progresjon">
        <h3>Slik lærer du faget</h3>
        <p class="fagverk-section-intro">Studieløpet skiller grunnkurs, metode, tematisk fordypning og geografisk anvendelse. Det canonicale 23 × 10-registeret bevares som innholdsbase, men styrer ikke lenger hovedoversikten.</p>
        <div class="fagverk-curriculum-list">${curriculum.progression.map((stage) => `<article class="fagverk-curriculum-article"><span class="fagverk-kicker">Trinn ${stage.order} · ${escapeHtml(stage.level)}</span><h4>${escapeHtml(stage.label)}</h4><p class="fagverk-curriculum-lead">${escapeHtml(stage.description)}</p>${learningText(stage)}</article>`).join('')}</div>
      </section>
      <section id="historie-kronologi">
        <h3>Kronologisk grunnstamme</h3>
        <p class="fagverk-section-intro">Periodene gir et sammenhengende tidsforløp. De tre tidligere oversiktsgapene har egne læringsmoduler med kilder, fysiske cases og kunnskapssjekker; canonicalregisteret brukes som koblingsbase, ikke som fast innholdskvote.</p>
        <div class="fagverk-curriculum-list fagverk-history-timeline">${curriculum.chronological_spine.map((period) => `<article class="fagverk-curriculum-article is-${escapeHtml(period.coverage_status)}"><span class="fagverk-kicker">${escapeHtml(period.date_label)} · ${escapeHtml(statusLabel[period.coverage_status])} · Periodeguide komplett</span><h4>${escapeHtml(period.label)}</h4><p class="fagverk-curriculum-lead">${escapeHtml(period.description)}</p>${learningText(period)}${renderPeriodGuide(period)}${renderPeriodModule(period)}${renderEntryEmners(period)}${period.gap_action ? `<p class="fagverk-curriculum-gap"><strong>Gjenstår i quiz- og evidenslaget:</strong> ${escapeHtml(period.gap_action)}</p>` : ''}</article>`).join('')}</div>
      </section>
      <section id="historie-tema">
        <h3>Tematiske fagretninger</h3>
        <p class="fagverk-section-intro">Disse perspektivene kan følges gjennom flere perioder. De er ikke konkurrerende hovedperioder.</p>
        <div class="fagverk-curriculum-grid">${curriculum.thematic_fields.map((field) => `<article class="fagverk-curriculum-article"><span class="fagverk-kicker">Fagretning ${field.order}</span><h4>${escapeHtml(field.label)}</h4><p class="fagverk-curriculum-lead">${escapeHtml(field.description)}</p>${learningText(field, { outcomeHeading: 'Dette perspektivet lærer deg å' })}<details class="fagverk-curriculum-entries"><summary>Canonicale fagområder</summary><div class="fagverk-canonical-underbadges">${field.domain_ids.map(domainLink).join('')}</div></details></article>`).join('')}</div>
      </section>
      <section id="historie-metode">
        <h3>Metode og historiografi</h3>
        <p class="fagverk-section-intro">Metode læres som en egen grunnkompetanse og brukes deretter i alle perioder og fagretninger.</p>
        <div class="fagverk-curriculum-list">${curriculum.method_foundation.map((module) => `<article class="fagverk-curriculum-article"><span class="fagverk-kicker">Metodemodul ${module.order}</span><h4>${escapeHtml(module.label)}</h4><p class="fagverk-curriculum-lead">${escapeHtml(module.description)}</p>${learningText(module)}<details class="fagverk-curriculum-entries"><summary>${module.core_method_ids.length} kjernemetoder</summary><ul>${module.core_method_ids.map((methodId) => model.methodsById.get(methodId)).filter(Boolean).map((method) => `<li><strong>${escapeHtml(method.title)}</strong>${method.description ? ` – ${escapeHtml(method.description)}` : ''}</li>`).join('')}</ul></details></article>`).join('')}</div>
      </section>
      <section id="historie-geografi">
        <h3>Geografiske læringsstier</h3>
        <p class="fagverk-section-intro">Geografi er en skala og læringssti, ikke en konkurrent til tidsperioder eller metodefelt.</p>
        <div class="fagverk-curriculum-grid">${curriculum.geographic_paths.map((path) => `<article class="fagverk-curriculum-article"><span class="fagverk-kicker">${escapeHtml(profileStatus(path))}</span><h4>${escapeHtml(path.label)}</h4><p class="fagverk-curriculum-lead">${escapeHtml(path.description)}</p>${learningText(path, { outcomeHeading: 'I denne skalaen skal du kunne' })}</article>`).join('')}</div>
      </section>
      <section id="historie-begreper" class="fagverk-concept-explorer">
        <h3>Historisk begrepsverk</h3>
        <p class="fagverk-section-intro">Alle ${model.concepts.length} canonicale begreper er søkbare. Hver forklaring viser faglig avgrensning, vanlig feilbruk, kildekrav og forbindelser til emner og andre begreper.</p>
        <div class="fagverk-concept-controls">
          <label><span>Søk i begreper og definisjoner</span><input id="historieConceptSearch" type="search" autocomplete="off" placeholder="Søk etter for eksempel periodisering, imperium eller kildekritikk"></label>
          <label><span>Avgrens til fagområde</span><select id="historieConceptDomain"><option value="">Alle fagområder</option>${model.domains.map((domain) => `<option value="${escapeHtml(domain.id)}">${escapeHtml(domain.label)}</option>`).join('')}</select></label>
        </div>
        <p id="historieConceptCount" class="fagverk-concept-count"></p>
        <div id="historieConceptResults" class="fagverk-concept-results"></div>
      </section>
      <section>
        <details class="fagverk-method-registry"><summary>Åpne komplett canonicalt fagregister</summary><p class="fagverk-section-intro">Registeret inneholder alle ${model.summary.domainCount} tekniske fagområder, ${model.summary.emneCount} emner og ${model.summary.methodCount} metoder. Det bevares for koblinger, quizer og evidens, men er ikke pensumets hovedstruktur.</p><div class="fagverk-general-domain-grid">${model.domains.map((domain) => domainCard(model, domain, new Map(progress.domainProgress.map((row) => [row.domainId, row])), placeId)).join('')}</div></details>
      </section>
    `;
    const conceptSearch = document.getElementById('historieConceptSearch');
    const conceptDomain = document.getElementById('historieConceptDomain');
    const conceptCount = document.getElementById('historieConceptCount');
    const conceptResults = document.getElementById('historieConceptResults');
    const updateConceptResults = () => {
      const query = text(conceptSearch?.value).toLocaleLowerCase('nb-NO');
      const domainId = text(conceptDomain?.value);
      const matches = model.concepts.filter((concept) => {
        if (domainId && !concept.domainIds.includes(domainId)) return false;
        if (!query) return true;
        const haystack = [concept.label, concept.definition, concept.type, ...concept.commonMisuse].join(' ').toLocaleLowerCase('nb-NO');
        return haystack.includes(query);
      });
      const visible = matches.slice(0, query || domainId ? 120 : 36);
      conceptCount.textContent = `${matches.length} begrep${matches.length === 1 ? '' : 'er'} funnet${visible.length < matches.length ? ` · viser de første ${visible.length}` : ''}`;
      conceptResults.innerHTML = visible.length
        ? visible.map((concept) => historyConceptCard(concept, model, placeId)).join('')
        : '<p>Ingen begreper samsvarer med søket.</p>';
    };
    conceptSearch?.addEventListener('input', updateConceptResults);
    conceptDomain?.addEventListener('change', updateConceptResults);
    updateConceptResults();
    host.hidden = false;
  }

  function curriculumLearningText(item, outcomeHeading = 'Etter denne delen skal du kunne') {
    const outcomes = list(item.learning_outcomes);
    const questions = list(item.key_questions);
    return `${item.overview ? `<p class="fagverk-curriculum-overview">${escapeHtml(item.overview)}</p>` : ''}
      ${outcomes.length ? `<div class="fagverk-curriculum-outcomes"><h4>${escapeHtml(outcomeHeading)}</h4><ul>${outcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join('')}</ul></div>` : ''}
      ${questions.length ? `<details class="fagverk-curriculum-questions"><summary>Nøkkelspørsmål å arbeide med</summary><ul>${questions.map((question) => `<li>${escapeHtml(question)}</li>`).join('')}</ul></details>` : ''}`;
  }

  function conceptCard(concept, model, placeId, { open = false } = {}) {
    const owner = concept.emneIds.map((id) => model.emnersById.get(id)).find(Boolean);
    const domains = concept.domainIds.map((id) => model.domainsById.get(id)?.label).filter(Boolean);
    const relations = concept.relatedIds.map((id) => model.conceptsById.get(id)).filter(Boolean).slice(0, 8);
    const quality = {
      editorial_chapter: 'Redigert kapitteldefinisjon',
      canonical_hook: 'Canonical fagdefinisjon',
      canonical_emne: 'Canonical emnedefinisjon',
      canonical_method: 'Canonical metodeforklaring',
      editorial_rule_definition: 'Selvstendig fagdefinisjon',
      editorial_reviewed: 'Enkeltvis redaksjonelt gjennomgått'
    }[concept.definitionStatus] || 'Faglig forklaring';
    const reviewSources = list(concept.editorialReview?.sourceReferences);
    return `<details class="fagverk-canonical-concept" data-concept-id="${escapeHtml(concept.id)}"${open ? ' open' : ''}>
      <summary><span><strong>${escapeHtml(concept.label)}</strong><small>${escapeHtml(quality)}</small></span><b>${escapeHtml(concept.type.replaceAll('_', ' '))}</b></summary>
      <div class="fagverk-concept-body">
        <p>${escapeHtml(concept.definition)}</p>
        ${concept.contextualUse ? `<p class="fagverk-concept-context"><strong>Bruk i faget:</strong> ${escapeHtml(concept.contextualUse)}</p>` : ''}
        ${concept.scopeNote ? `<p class="fagverk-concept-scope"><strong>Faglig avgrensning:</strong> ${escapeHtml(concept.scopeNote)}</p>` : ''}
        ${concept.whyItMatters ? `<p><strong>Hvorfor begrepet betyr noe:</strong> ${escapeHtml(concept.whyItMatters)}</p>` : ''}
        ${domains.length ? `<p><strong>Fagfelt:</strong> ${escapeHtml(domains.join(' · '))}</p>` : ''}
        ${concept.distinguishFrom.length ? `<details><summary>Viktige skiller</summary><ul>${concept.distinguishFrom.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details>` : ''}
        ${concept.commonMisuse.length ? `<div class="fagverk-concept-warning"><strong>Vanlig feilbruk</strong><ul>${concept.commonMisuse.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
        ${concept.indicators.length ? `<details><summary>Mekanismer og tegn å undersøke</summary><ul>${concept.indicators.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details>` : ''}
        ${concept.sourceRequirements.length ? `<details><summary>Kilde- og forankringskrav</summary><ul>${concept.sourceRequirements.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details>` : ''}
        ${reviewSources.length ? `<details class="fagverk-concept-review-sources"><summary>Kildespor for begrepsreview</summary>${concept.editorialReview.note ? `<p>${escapeHtml(concept.editorialReview.note)}</p>` : ''}<ul>${reviewSources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a>${source.publisher ? ` · ${escapeHtml(source.publisher)}` : ''}<br><small>${escapeHtml(source.location)}</small></li>`).join('')}</ul></details>` : ''}
        ${concept.keyQuestions.length ? `<details><summary>Analytiske spørsmål</summary><ul>${concept.keyQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details>` : ''}
        ${relations.length ? `<p class="fagverk-concept-relations"><strong>Se også:</strong> ${relations.map((item) => escapeHtml(item.label)).join(' · ')}</p>` : ''}
        ${owner ? `<a class="fagverk-concept-owner" href="${escapeHtml(MODEL.emneUrl(model.subject.id, owner.domainId, owner.id, { place: placeId, concept: concept.id }))}">Les begrepet i emnet ${escapeHtml(owner.title)} →</a>` : ''}
      </div>
    </details>`;
  }

  function renderPolitikkCurriculumOverview(model, progress, placeId) {
    const curriculum = model.source.curriculum;
    const host = document.getElementById('fagverkSubjectOverview');
    const emneLink = (emneId) => {
      const emne = model.emnersById.get(emneId);
      return emne ? `<a href="${escapeHtml(MODEL.emneUrl(model.subject.id, emne.domainId, emne.id, { place: placeId }))}">${escapeHtml(emne.title)}</a>` : '';
    };
    const domainLink = (domainId) => {
      const domain = model.domainsById.get(domainId);
      return domain ? `<a href="${escapeHtml(MODEL.domainUrl(model.subject.id, domain.id, { place: placeId }))}">${escapeHtml(domain.label)}</a>` : '';
    };
    const methodList = (methodIds) => list(methodIds).map((id) => model.methodsById.get(id)).filter(Boolean).map((method) => `<li><strong>${escapeHtml(method.title)}</strong> – ${escapeHtml(method.description)}</li>`).join('');
    const entryLinks = (item) => {
      const domains = list(item.domain_ids).map(domainLink).filter(Boolean);
      const emners = list(item.entry_emne_ids).map(emneLink).filter(Boolean);
      const chapters = list(item.chapter_ids).map((chapterId) => model.chaptersById.get(chapterId)).filter(Boolean);
      return `${domains.length ? `<details class="fagverk-curriculum-entries"><summary>Fagområder</summary><div class="fagverk-canonical-underbadges">${domains.join('')}</div></details>` : ''}
        ${emners.length ? `<details class="fagverk-curriculum-entries"><summary>${emners.length} relevante emner</summary><div class="fagverk-canonical-underbadges">${emners.join('')}</div></details>` : ''}
        ${chapters.length ? `<details class="fagverk-curriculum-entries"><summary>Lærekapitler</summary><div class="fagverk-canonical-underbadges">${chapters.map((chapter) => `<a href="${escapeHtml(MODEL.chapterUrl(model.subject.id, chapter.id, { place: placeId }))}">${escapeHtml(chapter.title)}</a>`).join('')}</div></details>` : ''}`;
    };
    const cards = (items, kicker, outcomeHeading) => `<div class="fagverk-curriculum-grid">${items.map((item, index) => `<article class="fagverk-curriculum-article"><span class="fagverk-kicker">${escapeHtml(kicker)} ${index + 1}</span><h4>${escapeHtml(item.label)}</h4><p class="fagverk-curriculum-lead">${escapeHtml(item.description)}</p>${curriculumLearningText(item, outcomeHeading)}${entryLinks(item)}${item.core_method_ids ? `<details class="fagverk-curriculum-entries"><summary>${item.core_method_ids.length} metoder i modulen</summary><ul>${methodList(item.core_method_ids)}</ul></details>` : ''}</article>`).join('')}</div>`;

    hideAllViews();
    renderHero('Statsvitenskapelig studieløp', model.subject.title, `${curriculum.progression.length} progresjonstrinn · ${curriculum.disciplinary_fields.length} fagfelt · ${curriculum.method_foundation.length} metodemoduler`, 'Begynn med begrep og belegg, bygg grunnforståelsen av makt og demokrati, og følg deretter saker gjennom institusjoner, prosesser og styringsnivåer.');
    host.innerHTML = `
      <section class="fagverk-curriculum-introduction" aria-labelledby="politikk-intro-title">
        <p class="fagverk-kicker">Slik er faget bygget</p>
        <h3 id="politikk-intro-title">${escapeHtml(curriculum.editorial_introduction.heading)}</h3>
        ${curriculum.editorial_introduction.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        <p class="fagverk-curriculum-reading-guide"><strong>Leseguide:</strong> ${escapeHtml(curriculum.editorial_introduction.reading_guide)}</p>
      </section>
      <div class="fagverk-general-summary" aria-label="Politikkfagets oppbygning">
        <div><strong>${model.summary.domainCount}</strong><span>fagområder</span></div>
        <div><strong>${model.summary.emneCount}</strong><span>emner</span></div>
        <div><strong>${model.summary.methodCount}</strong><span>metoder</span></div>
        <div><strong>${model.concepts.length}</strong><span>forklarte begrep</span></div>
      </div>
      <section id="politikk-progresjon"><h3>Slik lærer du faget</h3><p class="fagverk-section-intro">Progresjonen går fra presise begreper og kildekrav til selvstendig forskningsdesign og politisk utredning.</p><div class="fagverk-curriculum-list">${curriculum.progression.map((item, index) => `<article class="fagverk-curriculum-article"><span class="fagverk-kicker">Trinn ${index + 1} · ${escapeHtml(item.level)}</span><h4>${escapeHtml(item.label)}</h4><p class="fagverk-curriculum-lead">${escapeHtml(item.description)}</p>${curriculumLearningText(item)}${entryLinks(item)}</article>`).join('')}</div></section>
      <section id="politikk-grunnlag"><h3>Fagets grunnspørsmål</h3><p class="fagverk-section-intro">Disse spørsmålene går igjen i alle statsvitenskapelige fagfelt og hindrer at faget reduseres til institusjonsnavn eller partimeninger.</p>${cards(curriculum.foundations, 'Grunnspor', 'Etter grunnsporet skal du kunne')}</section>
      <section id="politikk-fagfelt"><h3>Statsvitenskapelige fagfelt</h3><p class="fagverk-section-intro">Fagfeltene organiserer teori og forskning. De tretten canonicale domenene er plassert under disse retningene i stedet for å opptre som tretten konkurrerende hovedfag.</p>${cards(curriculum.disciplinary_fields, 'Fagfelt', 'I dette fagfeltet skal du kunne')}</section>
      <section id="politikk-prosess"><h3>Følg hele politikkprosessen</h3><p class="fagverk-section-intro">Et vedtak forklarer ikke seg selv. Følg saken fra problemdefinisjon og organisering til utforming, gjennomføring, evaluering og tilbakekobling.</p><div class="fagverk-curriculum-list">${curriculum.policy_cycle.map((item, index) => `<article class="fagverk-curriculum-article"><span class="fagverk-kicker">Ledd ${index + 1}</span><h4>${escapeHtml(item.label)}</h4><p class="fagverk-curriculum-lead">${escapeHtml(item.description)}</p>${curriculumLearningText(item)}${entryLinks(item)}</article>`).join('')}</div></section>
      <section id="politikk-metode"><h3>Metodegrunnlag</h3><p class="fagverk-section-intro">Alle 71 canonicale metoder er plassert i seks forståelige moduler. Metoden velges etter påstanden og mekanismen – ikke fordi en etikett høres avansert ut.</p>${cards(curriculum.method_foundation, 'Metodemodul', 'Etter metodemodulen skal du kunne')}</section>
      <section id="politikk-niva"><h3>Styringsnivåer og politiske skalaer</h3><p class="fagverk-section-intro">Samme sak kan ha lokal gjennomføring, nasjonal finansiering, samiske rettighetsforhold, europeiske regler og internasjonale forpliktelser.</p>${cards(curriculum.governance_scales, 'Styringsnivå', 'På dette nivået skal du kunne')}</section>
      <section id="politikk-anvendelse"><h3>Anvendte problemspor</h3><p class="fagverk-section-intro">Problemsporene samler relevante emner på tvers av fagfelt, men beholder kravene til institusjon, mekanisme, metode og dokumentert utfall.</p>${cards(curriculum.applied_tracks, 'Problemspor', 'I dette problemsporet skal du kunne')}</section>
      <section id="politikk-begreper" class="fagverk-concept-explorer">
        <h3>Politisk begrepsverk</h3>
        <p class="fagverk-section-intro">Alle ${model.concepts.length} canonicale begreps- og stikkordsoppføringer er søkbare. Direkte redigerte definisjoner og kontekstuelle emneforklaringer er tydelig merket, slik at begrepsregisteret ikke later som all terminologi er en løs ordbokfasit.</p>
        <div class="fagverk-concept-controls"><label><span>Søk i begreper og forklaringer</span><input id="politikkConceptSearch" type="search" autocomplete="off" placeholder="Søk etter for eksempel representasjon, makt eller policyfeedback"></label><label><span>Avgrens til fagområde</span><select id="politikkConceptDomain"><option value="">Alle fagområder</option>${model.domains.map((domain) => `<option value="${escapeHtml(domain.id)}">${escapeHtml(domain.label)}</option>`).join('')}</select></label></div>
        <p id="politikkConceptCount" class="fagverk-concept-count"></p><div id="politikkConceptResults" class="fagverk-concept-results"></div>
      </section>
      <section><details class="fagverk-method-registry"><summary>Åpne komplett canonicalt fagregister</summary><p class="fagverk-section-intro">Registeret inneholder alle ${model.summary.domainCount} tekniske fagområder, ${model.summary.emneCount} emner og ${model.summary.methodCount} metoder. Det bevares for quizer, evidens og stedskoblinger, men styrer ikke lenger hovedoversikten.</p><div class="fagverk-general-domain-grid">${model.domains.map((domain) => domainCard(model, domain, new Map(progress.domainProgress.map((row) => [row.domainId, row])), placeId)).join('')}</div></details></section>
    `;
    const search = document.getElementById('politikkConceptSearch');
    const domainFilter = document.getElementById('politikkConceptDomain');
    const count = document.getElementById('politikkConceptCount');
    const results = document.getElementById('politikkConceptResults');
    const update = () => {
      const query = text(search?.value).toLocaleLowerCase('nb-NO');
      const domainId = text(domainFilter?.value);
      const matches = model.concepts.filter((concept) => (!domainId || concept.domainIds.includes(domainId)) && (!query || [concept.label, concept.definition, concept.scopeNote, concept.whyItMatters, ...concept.commonMisuse].join(' ').toLocaleLowerCase('nb-NO').includes(query)));
      const visible = matches.slice(0, query || domainId ? 120 : 36);
      count.textContent = `${matches.length} begrep${matches.length === 1 ? '' : 'er'} funnet${visible.length < matches.length ? ` · viser de første ${visible.length}` : ''}`;
      results.innerHTML = visible.length ? visible.map((concept) => conceptCard(concept, model, placeId)).join('') : '<p>Ingen begreper samsvarer med søket.</p>';
    };
    search?.addEventListener('input', update);
    domainFilter?.addEventListener('change', update);
    update();
    host.hidden = false;
  }

  function renderOverview(model, progress, placeId) {
    if (model.subject.id === 'historie' && model.source.curriculum?.status === 'active_curriculum_navigation') {
      renderHistoryCurriculumOverview(model, progress, placeId);
      return;
    }
    if (model.subject.id === 'politikk' && model.source.curriculum?.status === 'active_curriculum_navigation') {
      renderPolitikkCurriculumOverview(model, progress, placeId);
      return;
    }
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
        <div class="fagverk-general-domain-grid">${model.chapters.map((chapter) => `<a class="fagverk-general-domain-card" href="${escapeHtml(MODEL.chapterUrl(model.subject.id, chapter.id, { place: placeId }))}"><span class="fagverk-kicker">${chapter.role === 'specialization' ? 'Faglig fordypning' : 'Canonicalt grunnkapittel'}</span><strong>${escapeHtml(chapter.title)}</strong><span>${escapeHtml(chapter.subtitle)}</span><small>Les kapittelet →</small></a>`).join('')}</div>
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
      ${chapters.length ? `<section><h4>Lærekapitler i fagområdet</h4><div class="fagverk-general-domain-grid">${chapters.map((chapter) => `<a class="fagverk-general-domain-card" href="${escapeHtml(MODEL.chapterUrl(model.subject.id, chapter.id, { domain: domain.id, place: placeId }))}"><span class="fagverk-kicker">${chapter.role === 'specialization' ? 'Faglig fordypning' : 'Canonicalt grunnkapittel'}</span><strong>${escapeHtml(chapter.title)}</strong><span>${escapeHtml(chapter.subtitle)}</span><small>Les kapittelet →</small></a>`).join('')}</div></section>` : ''}
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
    const canonicalConcepts = model.concepts.filter((concept) => concept.emneIds.includes(emne.id));
    const isSelectedConcept = (concept) => selected && [concept.id, concept.label].some((value) => value.toLocaleLowerCase('nb-NO') === selected);
    const renderConceptCard = model.subject.id === 'historie' ? historyConceptCard : conceptCard;
    host.innerHTML = `
      ${emne.whyItMatters ? `<p><strong>Hvorfor det betyr noe:</strong> ${escapeHtml(emne.whyItMatters)}</p>` : ''}
      <div class="fagverk-canonical-emne-meta">
        <a href="${escapeHtml(MODEL.domainUrl(model.subject.id, emne.domainId, { place: placeId }))}">${escapeHtml(domain?.label || emne.domainId)}</a>
        <span>${emne.level != null ? `Nivå ${escapeHtml(emne.level)}` : 'Canonicalt emne'}</span>
      </div>
      <div class="fagverk-canonical-emne-grid">
        <div class="fagverk-canonical-box"><h4>Kjernespørsmål</h4><ul>${emne.keyQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        <div class="fagverk-canonical-box"><h4>Begreper</h4><div class="fagverk-canonical-underbadges">${canonicalConcepts.length ? canonicalConcepts.map((concept) => `<a href="#concept-${escapeHtml(concept.id)}"${isSelectedConcept(concept) ? ' class="is-highlighted"' : ''}>${escapeHtml(concept.label)}</a>`).join('') : emne.concepts.map((item) => `<span${selected && item.toLocaleLowerCase('nb-NO') === selected ? ' class="is-highlighted"' : ''}>${escapeHtml(item)}</span>`).join('')}</div></div>
        <div class="fagverk-canonical-box"><h4>Metoder</h4><ul>${methods.map((method) => `<li><details><summary><strong>${escapeHtml(method.title)}</strong></summary>${method.description ? `<p>${escapeHtml(method.description)}</p>` : ''}${method.procedure.length ? `<ol>${method.procedure.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>` : ''}${method.limitations.length ? `<p><strong>Begrensninger:</strong> ${escapeHtml(method.limitations.join(' · '))}</p>` : ''}</details></li>`).join('')}${emne.methodLabels.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
        <div class="fagverk-canonical-box"><h4>Analytiske skiller</h4><ul>${[...emne.conflicts, ...emne.analysisAxes].map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
      </div>
      ${canonicalConcepts.length ? `<section class="fagverk-emne-concepts"><h4>Begrepene forklart</h4><div class="fagverk-concept-results">${canonicalConcepts.map((concept) => `<div id="concept-${escapeHtml(concept.id)}">${renderConceptCard(concept, model, placeId, { open: isSelectedConcept(concept) })}</div>`).join('')}</div></section>` : ''}
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

  function renderChapterEditorial(chapter) {
    const host = document.getElementById('fagverkEditorial');
    const section = host?.closest('.fagverk-editorial');
    if (!host || !section) return;
    const debate = chapter.historiographicalDebate;
    const hasDebate = debate?.question && list(debate.positions).length;
    const hasContent = list(chapter.causalFramework).length || hasDebate || list(chapter.caseAnchors).length;
    section.hidden = !hasContent;
    host.innerHTML = hasContent ? `
      ${list(chapter.causalFramework).length ? `<article class="fagverk-learning-card"><p class="fagverk-kicker">Årsakskjede</p><h4>Fra forutsetning til historisk utfall</h4><ol>${list(chapter.causalFramework).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></article>` : ''}
      ${hasDebate ? `<article class="fagverk-learning-card"><p class="fagverk-kicker">Tolkningsuenighet</p><h4>${escapeHtml(debate.question)}</h4><ul>${list(debate.positions).map((position) => `<li>${escapeHtml(position)}</li>`).join('')}</ul>${debate.editorialNote ? `<p>${escapeHtml(debate.editorialNote)}</p>` : ''}</article>` : ''}
      ${list(chapter.caseAnchors).length ? `<article class="fagverk-learning-card"><p class="fagverk-kicker">Stedscaser</p><h4>Les sporene mot forklaringen</h4><ul>${list(chapter.caseAnchors).map((place) => `<li><a href="${escapeHtml(MODEL.placePageUrl(place.id))}"><strong>${escapeHtml(place.name)}</strong></a>: ${escapeHtml(place.use)}</li>`).join('')}</ul></article>` : ''}
    ` : '';
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
    renderChapterEditorial(chapter);
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
