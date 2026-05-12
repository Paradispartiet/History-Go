(function (global) {
  'use strict';
  const M = global.AHAModules;
  const G = global.AHAGroups;
  if (!M) return;
  function render() {
    const paths = M.toArray(M.readJsonStorage('aha_paths_v1', []));
    const groups = G?.getActiveGroups ? G.getActiveGroups() : [];
    const cards = paths.map((path) => `<article class="insight-card"><h3>${M.escapeHtml(path.title || 'Uten tittel')}</h3>${groups.length ? `<div class="group-linker" data-id="${M.escapeHtml(String(path.id || ''))}"><select class="gruppe-select">${groups.map((g) => `<option value="${M.escapeHtml(g.id)}">${M.escapeHtml(g.title || 'Uten navn')}</option>`).join('')}</select><button class="gruppe-knapp" type="button">Legg sti i gruppe</button><div class="statuslinje" aria-live="polite"></div></div>` : '<p class="statuslinje">Ingen grupper ennå. <a href="groups.html">Lag en gruppe først.</a></p>'}</article>`).join('');
    document.getElementById('paths-cards').innerHTML = cards || '<p>Ingen stier funnet.</p>';
  }
  document.addEventListener('click', function (event) {
    const btn = event.target.closest('.gruppe-knapp');
    if (!btn || !G?.addReferenceToGroupByObject) return;
    const wrapper = btn.closest('.group-linker'); const select = wrapper?.querySelector('.gruppe-select'); const status = wrapper?.querySelector('.statuslinje');
    const paths = M.toArray(M.readJsonStorage('aha_paths_v1', [])); const path = paths.find((x) => String(x?.id) === wrapper?.dataset.id);
    if (!path || !select?.value) return;
    const result = G.addReferenceToGroupByObject(select.value, { title: path.title, type: 'path', source: 'aha_paths', refId: path.id });
    status.textContent = result?.duplicate ? 'Finnes allerede i gruppen' : (result?.ok ? 'Lagt i gruppen' : 'Kunne ikke legges i gruppen');
  });
  global.AHAPaths = { render };
})(window);
