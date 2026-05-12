(function (global) {
  'use strict';
  const M = global.AHAModules;
  const G = global.AHAGroups;
  if (!M) return;
  function render() {
    const articles = M.toArray(M.readJsonStorage('aha_avisa_drafts_v1', []));
    const groups = G?.getActiveGroups ? G.getActiveGroups() : [];
    document.getElementById('avisa-cards').innerHTML = articles.map((article) => `<article class="insight-card"><h3>${M.escapeHtml(article.title || 'Uten tittel')}</h3>${groups.length ? `<div class="group-linker" data-id="${M.escapeHtml(String(article.id || ''))}"><select class="gruppe-select">${groups.map((g) => `<option value="${M.escapeHtml(g.id)}">${M.escapeHtml(g.title || 'Uten navn')}</option>`).join('')}</select><button class="gruppe-knapp" type="button">Legg artikkel i gruppe</button><div class="statuslinje" aria-live="polite"></div></div>` : '<p class="statuslinje">Ingen grupper ennå. <a href="groups.html">Lag en gruppe først.</a></p>'}</article>`).join('') || '<p>Ingen artikkelutkast funnet.</p>';
  }
  document.addEventListener('click', function (event) {
    const btn = event.target.closest('.gruppe-knapp'); if (!btn || !G?.addReferenceToGroupByObject) return;
    const wrapper = btn.closest('.group-linker'); const select = wrapper?.querySelector('.gruppe-select'); const status = wrapper?.querySelector('.statuslinje');
    const articles = M.toArray(M.readJsonStorage('aha_avisa_drafts_v1', [])); const article = articles.find((x) => String(x?.id) === wrapper?.dataset.id);
    if (!article || !select?.value) return;
    const result = G.addReferenceToGroupByObject(select.value, { title: article.title, type: 'article', source: 'aha_avisa', refId: article.id });
    status.textContent = result?.duplicate ? 'Finnes allerede i gruppen' : (result?.ok ? 'Lagt i gruppen' : 'Kunne ikke legges i gruppen');
  });
  global.AHAAvisa = { render };
})(window);
