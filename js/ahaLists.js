(function (root, factory) {
  const shared = typeof module !== "undefined" && module.exports
    ? require("./ahaModules.js")
    : root.HistoryGoAhaModules;
  const api = factory(shared);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.HistoryGoAhaLists = api;
})(typeof window !== "undefined" ? window : globalThis, function (shared) {
  "use strict";

  return shared.createModuleRenderer({
    id: "lists",
    mountId: "aha-lists-module",
    title: "Lists",
    purpose: "Organize saved AHA items.",
    primaryActionLabel: "Open lists",
    emptyState: "No lists yet."
  });
});
