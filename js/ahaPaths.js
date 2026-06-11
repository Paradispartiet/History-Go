(function (root, factory) {
  const shared = typeof module !== "undefined" && module.exports
    ? require("./ahaModules.js")
    : root.HistoryGoAhaModules;
  const api = factory(shared);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.HistoryGoAhaPaths = api;
})(typeof window !== "undefined" ? window : globalThis, function (shared) {
  "use strict";

  return shared.createModuleRenderer({
    id: "paths",
    mountId: "aha-paths-module",
    title: "Paths",
    purpose: "Build ordered learning routes.",
    primaryActionLabel: "Open paths",
    emptyState: "No paths yet."
  });
});
