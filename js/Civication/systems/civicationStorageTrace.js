(function () {
  "use strict";

  var TRACE_KEY = "hg_civi_storage_trace_v1";
  var CRITICAL = {
    hg_active_position_v1: true,
    hg_civi_last_active_position_v1: true,
    hg_civi_state_v1: true,
    hg_civi_inbox_v1: true
  };

  function isCritical(key) {
    return !!CRITICAL[String(key || "")];
  }

  function safeParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function trimValue(v) {
    var s = String(v || "");
    return s.length > 500 ? s.slice(0, 500) + "…" : s;
  }

  function readTrace() {
    return safeParse(localStorage.getItem(TRACE_KEY), []);
  }

  function writeTrace(rows) {
    try {
      localStorage.setItem(TRACE_KEY, JSON.stringify((rows || []).slice(-80)));
    } catch (e) {}
  }

  function addTrace(action, key, value) {
    if (!isCritical(key)) return;

    var rows = readTrace();
    rows.push({
      at: new Date().toISOString(),
      action: action,
      key: String(key || ""),
      value: trimValue(value),
      stack: String(new Error().stack || "").split("\n").slice(2, 8).join("\n")
    });
    writeTrace(rows);
  }

  function patchStorage() {
    if (window.__civiStorageTracePatched) return true;

    var originalSetItem = Storage.prototype.setItem;
    var originalRemoveItem = Storage.prototype.removeItem;
    var originalClear = Storage.prototype.clear;

    Storage.prototype.setItem = function tracedSetItem(key, value) {
      addTrace("setItem", key, value);
      return originalSetItem.call(this, key, value);
    };

    Storage.prototype.removeItem = function tracedRemoveItem(key) {
      addTrace("removeItem", key, localStorage.getItem(key));
      return originalRemoveItem.call(this, key);
    };

    Storage.prototype.clear = function tracedClear() {
      Object.keys(CRITICAL).forEach(function (key) {
        addTrace("clear", key, localStorage.getItem(key));
      });
      return originalClear.call(this);
    };

    window.__civiStorageTracePatched = true;
    return true;
  }

  function getTrace() {
    return readTrace();
  }

  function clearTrace() {
    localStorage.removeItem(TRACE_KEY);
  }

  patchStorage();

  window.CivicationStorageTrace = {
    getTrace: getTrace,
    clearTrace: clearTrace,
    patchStorage: patchStorage
  };
})();
