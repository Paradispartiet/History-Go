(function (global) {
  'use strict';

  function safeParse(raw, fallback) {
    if (typeof raw !== 'string') return fallback;
    try {
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function readStorage(key, fallback) {
    try {
      return safeParse(global.localStorage.getItem(key), fallback);
    } catch {
      return fallback;
    }
  }

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function countKnowledgeUniverse(value) {
    if (Array.isArray(value)) return value.length;
    if (!value || typeof value !== 'object') return 0;

    let count = 0;
    Object.values(value).forEach((levelOne) => {
      if (Array.isArray(levelOne)) {
        count += levelOne.length;
        return;
      }
      if (!levelOne || typeof levelOne !== 'object') return;
      Object.values(levelOne).forEach((levelTwo) => {
        if (Array.isArray(levelTwo)) {
          count += levelTwo.length;
        } else if (levelTwo && typeof levelTwo === 'object') {
          count += Object.keys(levelTwo).length;
        }
      });
    });
    return count;
  }

  function getTime(value) {
    return value?.exported_at || value?.exportedAt || value?.updated_at || value?.updatedAt || null;
  }

  function collectHistoryGoStatus() {
    const importPayload = readStorage('aha_import_payload_v1', null);
    const visitedPlaces = readStorage('visited_places', {});
    const peopleCollected = readStorage('people_collected', {});
    const unlocks = readStorage('hg_unlocks_v1', []);
    const progress = readStorage('historygo_progress', null);

    return {
      hasImportPayload: Boolean(importPayload && typeof importPayload === 'object'),
      visitedPlacesCount: Array.isArray(visitedPlaces) ? visitedPlaces.length : Object.keys(visitedPlaces || {}).length,
      peopleCollectedCount: Array.isArray(peopleCollected) ? peopleCollected.length : Object.keys(peopleCollected || {}).length,
      unlocksCount: Array.isArray(unlocks) ? unlocks.length : Object.keys(unlocks || {}).length,
      progressExists: Boolean(progress),
      lastImportAt: getTime(importPayload)
    };
  }

  function collectImportPayloadSummary() {
    const payload = readStorage('aha_import_payload_v1', {});
    return {
      nextupLearningSignalExists: Boolean(payload?.nextup_learning_signal),
      learningLogCount: toArray(payload?.hg_learning_log_v1).length,
      insightEventsCount: toArray(payload?.hg_insights_events_v1).length,
      knowledgeUniverseCount: countKnowledgeUniverse(payload?.knowledge_universe),
      notesCount: toArray(payload?.notes).length,
      dialogsCount: toArray(payload?.dialogs).length,
      payloadKeys: payload && typeof payload === 'object' ? Object.keys(payload) : [],
      exportedAt: getTime(payload)
    };
  }

  function isHistoryGoEvent(event) {
    const sourceType = String(event?.source_type || '');
    return event?.imported === true || event?.source_app === 'historygo' || sourceType.indexOf('historygo') === 0;
  }

  function collectImportedAhaEvents() {
    const events = toArray(readStorage('aha_source_events_v1', []));
    const imported = events.filter(isHistoryGoEvent);
    const sourceTypeCounts = {};
    imported.forEach((event) => {
      const sourceType = String(event?.source_type || 'unknown');
      sourceTypeCounts[sourceType] = (sourceTypeCounts[sourceType] || 0) + 1;
    });

    const insights = readStorage('aha_insight_chamber_v1', {});
    const insightList = toArray(insights?.insights);
    const importedInsightCount = insightList.filter((insight) => {
      const meta = insight?.meta || insight?.metadata || {};
      const sourceType = String(meta?.source_type || insight?.source_type || '');
      return meta?.imported === true || meta?.source_app === 'historygo' || sourceType.indexOf('historygo') === 0;
    }).length;

    return {
      totalCount: imported.length,
      latestEvents: imported.slice(-10).reverse(),
      sourceTypeCounts,
      importedInsightCount
    };
  }

  function render() {
    const status = collectHistoryGoStatus();
    const payload = collectImportPayloadSummary();
    const imported = collectImportedAhaEvents();

    const host = document.getElementById('historygo-status-root');
    if (!host) return;

    const sourceTypeRows = Object.keys(imported.sourceTypeCounts).sort().map(function (key) {
      return '<li><code>' + escapeHtml(key) + '</code>: ' + escapeHtml(imported.sourceTypeCounts[key]) + '</li>';
    }).join('');

    const latestRows = imported.latestEvents.map(function (event) {
      const preview = String(event?.text || event?.title || '').slice(0, 120);
      return '<li class="historygo-import-event-item"><strong>' + escapeHtml(event?.title || event?.source_type || 'Uten tittel') + '</strong><div>' +
        escapeHtml(event?.created_at || 'ukjent tid') + ' · ' + escapeHtml(event?.source_type || 'unknown') + '</div><div>' + escapeHtml(preview) + '</div></li>';
    }).join('');

    host.innerHTML = '' +
      '<section class="historygo-status-card"><h2>History Go i AHA</h2><p>History Go er samlings- og læringsuniverset. AHA leser importert materiale som personlig innsikt.</p></section>' +
      '<section class="historygo-status-card"><h3>Status</h3><ul class="historygo-payload-list">' +
      '<li>Importpayload: ' + (status.hasImportPayload ? 'finnes' : 'finnes ikke') + '</li>' +
      '<li>Besøkte steder: ' + escapeHtml(status.visitedPlacesCount) + '</li>' +
      '<li>Personer samlet: ' + escapeHtml(status.peopleCollectedCount) + '</li>' +
      '<li>Unlocks: ' + escapeHtml(status.unlocksCount) + '</li>' +
      '<li>Progress: ' + (status.progressExists ? 'finnes' : 'finnes ikke') + '</li>' +
      '<li>Siste eksport/importtid: ' + escapeHtml(status.lastImportAt || payload.exportedAt || 'ukjent') + '</li>' +
      '</ul></section>' +
      '<section class="historygo-status-card"><h3>Payload-oppsummering</h3><ul class="historygo-payload-list">' +
      '<li>NextUp learning signal: ' + (payload.nextupLearningSignalExists ? 'finnes' : 'finnes ikke') + '</li>' +
      '<li>Learning log count: ' + escapeHtml(payload.learningLogCount) + '</li>' +
      '<li>Insight events count: ' + escapeHtml(payload.insightEventsCount) + '</li>' +
      '<li>Knowledge universe count: ' + escapeHtml(payload.knowledgeUniverseCount) + '</li>' +
      '<li>Notes count: ' + escapeHtml(payload.notesCount) + '</li>' +
      '<li>Dialogs count: ' + escapeHtml(payload.dialogsCount) + '</li>' +
      '<li>Payload keys: ' + escapeHtml(payload.payloadKeys.join(', ')) + '</li>' +
      '</ul></section>' +
      '<section class="historygo-status-card"><h3>Importerte AHA-events</h3><p>Antall importerte source events: ' + escapeHtml(imported.totalCount) + '</p><ul class="historygo-payload-list">' + (sourceTypeRows || '<li>Ingen importerte source types ennå.</li>') + '</ul><ul class="historygo-import-event-list">' + (latestRows || '<li>Ingen importerte events ennå.</li>') + '</ul></section>' +
      '<section class="historygo-status-card"><h3>Importerte innsikter</h3><p>Antall innsikter med History Go-kilde: ' + escapeHtml(imported.importedInsightCount) + '</p></section>' +
      '<section class="historygo-status-card"><h3>Forklaring</h3><ul class="historygo-payload-list"><li>History Go samler steder, personer, badges og kunnskap.</li><li>AHA importerer dette som signaler.</li><li>AHA lager ikke ny History Go-motor.</li><li>Import skjer bare når brukeren trykker import.</li></ul></section>';
  }

  function refresh() {
    render();
  }

  global.AHAHistoryGoStatus = {
    collectHistoryGoStatus,
    collectImportPayloadSummary,
    collectImportedAhaEvents,
    render,
    refresh
  };
})(window);
