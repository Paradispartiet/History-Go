(function (root, factory) {
  const shared = typeof module !== "undefined" && module.exports
    ? require("./ahaModules.js")
    : root.HistoryGoAhaModules;
  const api = factory(shared);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.HistoryGoAhaGroups = api;
})(typeof window !== "undefined" ? window : globalThis, function (shared) {
  "use strict";

  return shared.createModuleRenderer({
    id: "groups",
    mountId: "aha-groups-module",
    title: "Groups",
    purpose: "Group related AHA material.",
    primaryActionLabel: "Open groups",
    emptyState: "No groups yet."
  });
});
