(function (global) {
  'use strict';

  const M = global.AHAModules;
  const G = global.AHAGroups;
  if (!M) return;

  function formatDate(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Ukjent dato';
    return d.toLocaleString('nb-NO');
  }

  function getSourceIds(insight) {
    const ids = [];
    if (Array.isArray(insight?.source_event_ids)) ids.push(...insight.source_event_ids);
    if (insight?.source_event_id) ids.push(insight.source_event_id);
    if (Array.isArray(insight?.source_ids)) ids.push(...insight.source_ids);
    if (insight?.source_id) ids.push(insight.source_id);
    return Array.from(new Set(ids.filter(Boolean)));
  }

  function getInsightRefId(insight, index) {
    return insight?.id || insight?.base?.id || insight?.source_event_id || insight?.sourceEventId || insight?.source_id || insight?.sourceId || insight?.event_id || insight?.eventId || `insight_idx_${index}`;
  }

  function buildGroupPicker(itemType, itemId, buttonText) {
    if (!G || typeof G.getActiveGroups !== 'function') return '';
    const groups = G.getActiveGroups();
    if (!groups.length) {
      return '<p class="statuslinje">Ingen grupper ennå. <a href="groups.html">Lag en gruppe først.</a></p>';
    }
    const options = groups.map((group) => `<option value="${M.escapeHtml(group.id)}">${M.escapeHtml(group.title || 'Uten navn')}</option>`).join('');
    return `
      <div class="group-linker" data-type="${M.escapeHtml(itemType)}" data-id="${M.escapeHtml(String(itemId))}">
        <select class="gruppe-select">${options}</select>
        <button type="button" class="gruppe-knapp">${M.escapeHtml(buttonText)}</button>
        <div class="statuslinje" aria-live="polite"></div>
      </div>
    `;
  }

  function buildSourceMap(events) {
    const map = new Map();
    for (const event of events) {
      if (event && event.id) map.set(event.id, event);
    }
    return map;
  }

  function render() {
    const chamberRaw = M.readJsonStorage('aha_insight_chamber_v1', {});
    const sourceEvents = M.toArray(M.readJsonStorage('aha_source_events_v1', []));
    const sourceMap = buildSourceMap(sourceEvents);
    const chamberInsights = M.toArray(chamberRaw?.insights);

    const q = (document.getElementById('insight-search')?.value || '').toLowerCase().trim();
    const topicFilter = (document.getElementById('insight-topic-filter')?.value || '').trim();
    const withSourceOnly = Boolean(document.getElementById('insight-source-filter')?.checked);

    const normalized = chamberInsights.map((insight, index) => {
      const sourceIds = getSourceIds(insight);
      const availableSources = sourceIds.map((id) => sourceMap.get(id)).filter(Boolean);
      return { insight, sourceIds, availableSources, insightIndex: index, refId: getInsightRefId(insight, index) };
    });

    let filtered = normalized.filter(({ insight, availableSources }) => {
      if (withSourceOnly && availableSources.length === 0) return false;
      if (topicFilter && (insight?.theme_id || insight?.topic || '') !== topicFilter) return false;
      if (!q) return true;
      const hay = [insight?.title, insight?.summary, insight?.theme_id, ...(insight?.concepts || [])]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

    filtered.sort((a, b) => new Date(M.getInsightTimestamp(b.insight)).getTime() - new Date(M.getInsightTimestamp(a.insight)).getTime());

    const topicSelect = document.getElementById('insight-topic-filter');
    const topics = Array.from(new Set(chamberInsights.map((x) => x?.theme_id || x?.topic).filter(Boolean))).sort();
    topicSelect.innerHTML = '<option value="">Alle tema</option>' + topics.map((t) => `<option value="${M.escapeHtml(t)}">${M.escapeHtml(t)}</option>`).join('');
    if (topicFilter) topicSelect.value = topicFilter;

    document.getElementById('insight-stats').innerHTML = `
      <div class="stat">Viser: <strong>${filtered.length}</strong></div>
      <div class="stat">Totalt: <strong>${chamberInsights.length}</strong></div>
      <div class="stat">Kilder: <strong>${sourceEvents.length}</strong></div>
    `;

    const cardsHtml = filtered.map(({ insight, availableSources, refId, insightIndex }) => {
      const concepts = Array.isArray(insight?.concepts) ? insight.concepts : [];
      const strength = insight?.strength?.total_score ?? 0;
      const evidence = insight?.strength?.evidence_count ?? 0;
      const sourcesHtml = availableSources.length
        ? availableSources.slice(0, 3).map((src) => {
            const preview = src.preview || src.text || src.summary || '';
            return `<li><strong>${M.escapeHtml(src.source_type || 'kilde')}</strong> / ${M.escapeHtml(src.source_app || 'ukjent')}: ${M.escapeHtml(preview).slice(0, 160)}</li>`;
          }).join('')
        : '<li>Ingen kildepreview tilgjengelig.</li>';

      return `
        <article class="insight-card" data-insight-index="${M.escapeHtml(String(insightIndex))}">
          <h3>${M.escapeHtml(insight?.title || 'Uten tittel')}</h3>
          <p class="meta">${formatDate(M.getInsightTimestamp(insight))} · Tema: ${M.escapeHtml(insight?.theme_id || insight?.topic || 'ukjent')}</p>
          <p>${M.escapeHtml(insight?.summary || '')}</p>
          <p><strong>Styrke:</strong> ${M.escapeHtml(String(strength))} (${M.escapeHtml(String(evidence))} signaler)</p>
          <p><strong>Begreper:</strong> ${concepts.map((c) => M.escapeHtml(c)).join(', ') || 'Ingen'}</p>
          <ul>${sourcesHtml}</ul>
          ${buildGroupPicker('insight', refId, 'Legg i gruppe')}
        </article>
      `;
    }).join('');

    document.getElementById('insight-cards').innerHTML = cardsHtml || '<p>Ingen innsikter matcher filtrene.</p>';

    const metaPayload = {
      emneforslag: chamberRaw?.emneforslag || chamberRaw?.topic_suggestions || null,
      merge_suggestions: chamberRaw?.merge_suggestions || null,
      patterns: chamberRaw?.patterns || null,
      meta_insights: chamberRaw?.meta_insights || null
    };
    document.getElementById('insight-meta').innerHTML = `<pre>${M.escapeHtml(JSON.stringify(metaPayload, null, 2))}</pre>`;
  }

  function bindGroupActions() {
    document.addEventListener('click', function (event) {
      const btn = event.target.closest('.gruppe-knapp');
      if (!btn || !G || typeof G.addReferenceToGroupByObject !== 'function') return;
      const wrapper = btn.closest('.group-linker');
      const card = btn.closest('.insight-card');
      if (!wrapper || !card) return;
      const select = wrapper.querySelector('.gruppe-select');
      const status = wrapper.querySelector('.statuslinje');
      const idx = Number(card.dataset.insightIndex);
      const chamberRaw = M.readJsonStorage('aha_insight_chamber_v1', {});
      const insight = M.toArray(chamberRaw?.insights)[idx];
      if (!insight || !select?.value) return;
      const result = G.addReferenceToGroupByObject(select.value, {
        title: insight?.title || 'Uten tittel', type: 'insight', source: 'aha_insights', refId: wrapper.dataset.id, meta: insight?.meta || null
      });
      status.textContent = result?.duplicate ? 'Finnes allerede i gruppen' : (result?.ok ? 'Lagt i gruppen' : 'Kunne ikke legges i gruppen');
    });
  }

  bindGroupActions();
  global.AHAInsights = { render };
})(window);
