(() => {
  // js/trivia.ts
  function getTriviaUniverse() {
    return JSON.parse(localStorage.getItem("trivia_universe") || "{}");
  }
  function saveTriviaUniverse(obj) {
    localStorage.setItem("trivia_universe", JSON.stringify(obj));
  }
  function saveTriviaPoint(entry) {
    if (!entry || !entry.category || !entry.id || !entry.trivia) return;
    const uni = getTriviaUniverse();
    if (!uni[entry.category]) {
      uni[entry.category] = {};
    }
    if (!uni[entry.category][entry.id]) {
      uni[entry.category][entry.id] = [];
    }
    const list = uni[entry.category][entry.id];
    let changed = false;
    if (!list.includes(entry.trivia)) {
      list.push(entry.trivia);
      changed = true;
    }
    if (!changed) return;
    saveTriviaUniverse(uni);
    window.dispatchEvent(new Event("updateProfile"));
    if (typeof window.syncHistoryGoToAHA === "function") {
      window.syncHistoryGoToAHA();
    }
  }
  window.getTriviaUniverse = getTriviaUniverse;
  window.saveTriviaPoint = saveTriviaPoint;
})();
//# sourceMappingURL=trivia.js.map
