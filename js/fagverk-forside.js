// @ts-nocheck
(function installFagverkPortal(global) {
  'use strict';

  const PORTAL_URL = 'data/fagverk/fagverk_portal.json';
  const CONTRACT_URL = 'data/categories/category_contract.json';
  const text = (value) => String(value == null ? '' : value).trim();
  const esc = (value) => String(value == null ? '' : value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const fetchJson = async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.json();
  };

  function meritPoints(id) {
    try {
      const map = JSON.parse(localStorage.getItem('merits_by_category') || '{}');
      return Number(map?.[id]?.points || 0);
    } catch {
      return 0;
    }
  }

  function currentTier(badge, points) {
    const tiers = Array.isArray(badge?.tiers) ? badge.tiers : [];
    let label = 'Nybegynner';
    for (const tier of tiers) if (points >= Number(tier?.threshold || 0)) label = text(tier?.label) || label;
    return label;
  }

  async function badgeData(id) {
    try {
      return await fetchJson(`data/badges/${encodeURIComponent(id)}.json`);
    } catch {
      return { id, name: '', description: '', icon: '◆', image: '' };
    }
  }

  function cardHtml(item, label, badge) {
    const id = text(item.id);
    const points = meritPoints(id);
    const tier = currentTier(badge, points);
    const name = text(badge?.name) || text(label) || id;
    const description = text(badge?.description) || `Fagområde i History Go: ${name}.`;
    const image = text(badge?.image);
    const icon = text(badge?.icon) || '◆';
    const subjectPage = text(item.subjectPage);
    const subjectReady = text(item.subjectStatus) === 'materialized' && Boolean(subjectPage);
    const badgePage = text(item.badgePage);
    const integratedBadgeRoute = subjectReady && badgePage === `${subjectPage}#fagverkIaProgresjon`;

    const subjectAction = subjectReady
      ? `<a class="fagverk-portal-action is-primary" href="${esc(subjectPage)}"><strong>Åpne faget →</strong><small>Emner, lærestoff, utforsk og progresjon</small></a>`
      : '<span class="fagverk-portal-action is-pending" aria-disabled="true"><strong>Faget bygges →</strong><small>Fagsiden er ikke materialisert ennå</small></span>';
    const badgeCompatibility = badgePage && !integratedBadgeRoute
      ? `<a class="fagverk-portal-compat" href="${esc(badgePage)}">Åpne eksisterende merkevisning</a>`
      : '';

    return `<article id="fag-${esc(id)}" class="fagverk-portal-card" data-subject="${esc(id)}">
      <div class="fagverk-portal-card-head">
        <div class="fagverk-portal-badge">${image ? `<img src="${esc(image)}" alt="">` : `<span aria-hidden="true">${esc(icon)}</span>`}</div>
        <div><h3>${esc(name)}</h3><div class="fagverk-portal-card-meta">${points} poeng · ${esc(tier)}</div></div>
      </div>
      <p class="fagverk-portal-card-description">${esc(description)}</p>
      <div class="fagverk-portal-actions">${subjectAction}${badgeCompatibility}</div>
    </article>`;
  }

  async function init() {
    const loading = document.getElementById('fagverkPortalLoading');
    const grid = document.getElementById('fagverkPortalGrid');
    const error = document.getElementById('fagverkPortalError');
    try {
      const [portal, contract] = await Promise.all([fetchJson(PORTAL_URL), fetchJson(CONTRACT_URL)]);
      const byId = new Map((portal.categories || []).map((item) => [text(item.id), item]));
      const ids = Array.isArray(contract.fagSubjects) ? contract.fagSubjects : [];
      const missing = ids.filter((id) => !byId.has(text(id)));
      if (missing.length) throw new Error(`Portalregisteret mangler: ${missing.join(', ')}`);
      const rows = await Promise.all(ids.map(async (id) => {
        const item = byId.get(text(id));
        const badge = await badgeData(text(id));
        return cardHtml(item, contract.labels?.[id], badge);
      }));
      grid.innerHTML = rows.join('');
      grid.querySelectorAll('img').forEach((img) => img.addEventListener('error', () => { img.hidden = true; }, { once: true }));
      loading.hidden = true;
      grid.hidden = false;
      error.hidden = true;
    } catch (err) {
      loading.hidden = true;
      grid.hidden = true;
      error.hidden = false;
      error.textContent = `Fagverkforsiden kunne ikke lastes: ${err.message}`;
      console.error('[fagverk-portal]', err);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window);
