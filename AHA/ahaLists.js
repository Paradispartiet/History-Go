(function (global) {
  'use strict';
  const M = global.AHAModules;
  const G = global.AHAGroups;
  if (!M) return;

  function render() {
    const lists = M.toArray(M.readJsonStorage('aha_lists_v1', []));
    const groups = G?.getActiveGroups ? G.getActiveGroups() : [];
    const emptyGroupHtml = '<p class="statuslinje">Ingen grupper ennå. <a href="groups.html">Lag en gruppe først.</a></p>';

    const html = lists.map((list) => {
      const picker = groups.length ? `<div class="group-linker" data-id="${M.escapeHtml(String(list.id || ''))}"><select class="gruppe-select">${groups.map((g) => `<option value="${M.escapeHtml(g.id)}">${M.escapeHtml(g.title || 'Uten navn')}</option>`).join('')}</select><button class="gruppe-knapp" type="button">Legg liste i gruppe</button><div class="statuslinje" aria-live="polite"></div></div>` : emptyGroupHtml;
      return `<article class="insight-card"><h3>${M.escapeHtml(list.title || 'Uten tittel')}</h3>${picker}</article>`;
    }).join('');

    document.getElementById('lists-cards').innerHTML = html || '<p>Ingen lister funnet.</p>';
  }

  document.addEventListener('click', function (event) {
    const btn = event.target.closest('.gruppe-knapp');
    if (!btn || !G?.addReferenceToGroupByObject) return;
    const wrapper = btn.closest('.group-linker');
    const select = wrapper?.querySelector('.gruppe-select');
    const status = wrapper?.querySelector('.statuslinje');
    if (!wrapper || !select?.value) return;
    const lists = M.toArray(M.readJsonStorage('aha_lists_v1', []));
    const list = lists.find((x) => String(x?.id) === wrapper.dataset.id);
    if (!list) return;
    const result = G.addReferenceToGroupByObject(select.value, { title: list.title, type: 'list', source: 'aha_lists', refId: list.id });
    status.textContent = result?.duplicate ? 'Finnes allerede i gruppen' : (result?.ok ? 'Lagt i gruppen' : 'Kunne ikke legges i gruppen');
  });

  global.AHALists = { render };
})(window);
