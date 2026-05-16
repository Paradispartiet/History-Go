(function (global) {
  'use strict';

  function readJsonStorage(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getInsightTimestamp(insight) {
    return (
      insight?.last_updated ||
      insight?.updated_at ||
      insight?.updatedAt ||
      insight?.first_seen ||
      insight?.created_at ||
      insight?.createdAt ||
      insight?.timestamp ||
      ''
    );
  }

  global.AHAModules = {
    readJsonStorage,
    toArray,
    escapeHtml,
    getInsightTimestamp
  };
})(window);
