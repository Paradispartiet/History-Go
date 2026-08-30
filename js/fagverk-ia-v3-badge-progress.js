// @ts-nocheck
(function installFagverkIaV3BadgeProgress(global) {
  'use strict';

  const MODEL = global.HGFagverkSubjectModel;
  if (!MODEL) throw new Error('HGFagverkSubjectModel må lastes før fagverk-ia-v3-badge-progress.js');

  const text = (value) => String(value == null ? '' : value).trim();
  const list = (value) => Array.isArray(value) ? value : [];
  const escapeHtml = (value) => String(value == null ? '' : value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function humanize(value) {
    const sentence = text(value).replaceAll('_', ' ').replaceAll('-', ' ');
    return sentence ? sentence.charAt(0).toLocaleUpperCase('nb-NO') + sentence.slice(1) : '';
  }

  async function fetchJson(path) {
    const response = await fetch(new URL(path, document.baseURI), { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${path}`);
    return response.json();
  }

  function underbadgeRows(model, badge, progress) {
    const runtimeManifest = model.source.runtimeManifest || {};
    const labels = runtimeManifest.underbadgeLabels || {};
    const domainsByUnderbadge = runtimeManifest.underbadgeDomains || {};
    return list(badge?.sub).map((id) => {
      const domainIds = list(domainsByUnderbadge[id]).map(text).filter((domainId) => model.domainsById.has(domainId));
      const places = model.places.filter((place) => {
        const source = place?.source || {};
        if (list(source.underbadge_ids || source.underbadgeIds).map(text).includes(text(id))) return true;
        if (!domainIds.length) return false;
        const placeDomainIds = new Set(list(place.emneIds).map((emneId) => model.emnersById.get(emneId)?.domainId).filter(Boolean));
        return domainIds.some((domainId) => placeDomainIds.has(domainId));
      });
      const visitedPlaces = places.filter((place) => progress.visited?.has?.(place.id)).length;
      return { id: text(id), label: text(labels[id]) || humanize(id), domainIds, placeCount: places.length, visitedPlaces };
    }).filter((row) => row.id);
  }

  function renderTierList(tiers, points) {
    return list(tiers).map((tier) => {
      const threshold = Number(tier?.threshold || 0);
      const earned = points >= threshold;
      return `<li class="${earned ? 'is-earned' : ''}"><span>${escapeHtml(tier?.label || threshold)}</span><b>${threshold} poeng</b></li>`;
    }).join('');
  }

  function renderUnderbadges(rows, model) {
    if (!rows.length) return '';
    return `<details class="fagverk-ia-badge-underbadges"><summary>Undermerker <span>${rows.length}</span></summary><div>${rows.map((row) => `<article id="underbadge-${escapeHtml(row.id)}"><strong>${escapeHtml(row.label)}</strong>${row.placeCount ? `<small>${row.visitedPlaces}/${row.placeCount} registrerte fagsteder besøkt</small>` : '<small>Gameplay-undermerke</small>'}${row.domainIds.length ? `<div class="fagverk-ia-underbadge-domains">${row.domainIds.map((domainId) => `<a href="${escapeHtml(MODEL.domainUrl(model.subject.id, domainId))}">${escapeHtml(model.domainsById.get(domainId)?.label || domainId)}</a>`).join('')}</div>` : ''}</article>`).join('')}</div></details>`;
  }

  function removeRedundantLegacyAction(host, model) {
    const subjectProgress = `${model.subject.routes.subject}#fagverkIaProgresjon`;
    host.querySelectorAll('.fagverk-ia-progress-actions a').forEach((link) => {
      if (text(link.getAttribute('href')) === subjectProgress) link.remove();
    });
  }

  function ensureSubjectKnowledgeAction(host, model) {
    const actions = host.querySelector('.fagverk-ia-progress-actions');
    if (!actions) return;
    const href = `knowledge.html?subject=${encodeURIComponent(model.subject.id)}`;
    const exists = [...actions.querySelectorAll('a')].some((link) => text(link.getAttribute('href')) === href);
    if (exists) return;
    const link = document.createElement('a');
    link.href = href;
    link.textContent = 'Åpne fagets kunnskapsprofil →';
    actions.appendChild(link);
  }

  async function init() {
    const params = new URLSearchParams(global.location.search);
    const subjectId = text(params.get('subject'));
    if (!subjectId || params.get('domain') || params.get('emne') || params.get('chapter')) return;

    try {
      const model = await MODEL.load(subjectId);
      const host = document.getElementById('fagverkIaProgresjonContent');
      if (!host) return;
      const progress = MODEL.readProgress(model);
      const badge = await fetchJson(`data/badges/${encodeURIComponent(model.subject.id)}.json`);
      const rows = underbadgeRows(model, badge, progress);
      const image = text(badge?.image);
      const icon = text(badge?.icon) || '◆';
      const currentLabel = text(progress?.tier?.label) || 'Nybegynner';
      const next = progress?.tier?.next || null;
      const nextText = next ? `${Math.max(0, Number(next.threshold || 0) - progress.points)} poeng til ${text(next.label)}` : 'Øverste nivå nådd';

      host.insertAdjacentHTML('afterbegin', `
        <section class="fagverk-ia-badge-card" aria-label="Merket i dette faget">
          <div class="fagverk-ia-badge-identity">
            <div class="fagverk-ia-badge-image">${image ? `<img src="${escapeHtml(image)}" alt="">` : `<span aria-hidden="true">${escapeHtml(icon)}</span>`}</div>
            <div><p class="fagverk-kicker">Merke · gameplay</p><h4>${escapeHtml(badge?.name || model.subject.title)}</h4><p>${escapeHtml(badge?.description || '')}</p></div>
          </div>
          <div class="fagverk-ia-badge-now"><article><strong>${progress.points}</strong><span>poeng</span></article><article><strong>${escapeHtml(currentLabel)}</strong><span>nåværende nivå</span></article><article><strong>${escapeHtml(nextText)}</strong><span>neste nivå</span></article></div>
          ${list(badge?.tiers).length ? `<details class="fagverk-ia-badge-tiers"><summary>Nivåstige <span>${list(badge.tiers).length}</span></summary><ol>${renderTierList(badge.tiers, progress.points)}</ol></details>` : ''}
          ${renderUnderbadges(rows, model)}
        </section>
      `);
      removeRedundantLegacyAction(host, model);
      ensureSubjectKnowledgeAction(host, model);
    } catch (error) {
      console.error('[fagverk-ia-v3-badge-progress]', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else void init();
})(window);
