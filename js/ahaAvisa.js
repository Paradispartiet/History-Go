(function (root, factory) {
  const shared = typeof module !== "undefined" && module.exports
    ? require("./ahaModules.js")
    : root.HistoryGoAhaModules;
  const api = factory(shared);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.HistoryGoAhaAvisa = api;
})(typeof window !== "undefined" ? window : globalThis, function (shared) {
  "use strict";

  return shared.createModuleRenderer({
    id: "avisa",
    mountId: "aha-avisa-module",
    title: "AHAavisa",
    purpose: "Collect drafts and published AHA notes.",
    primaryActionLabel: "Open AHAavisa",
    emptyState: "No AHAavisa notes yet."
  });
});
