(() => {
  // js/ui/nearbyBadgesPanel.ts
  var win = window;
  var badgeTapLockedUntil = 0;
  function tUI(key, fallback = "") {
    var _a, _b;
    try {
      return ((_b = (_a = win.HG_I18N) == null ? void 0 : _a.t) == null ? void 0 : _b.call(_a, key, fallback)) || fallback;
    } catch {
      return fallback;
    }
  }
  function tfUI(key, fallback, vars) {
    const template = tUI(key, fallback);
    return String(template).replace(
      /\{(\w+)\}/g,
      (_match, name) => Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
    );
  }
  function escapeHTML(value) {
    return String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function badgeTapIsLocked() {
    const now = Date.now();
    if (now < badgeTapLockedUntil) return true;
    badgeTapLockedUntil = now + 120;
    return false;
  }
  function getCollectedBadgeCount() {
    try {
      const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
      if (!merits || typeof merits !== "object" || Array.isArray(merits)) return 0;
      return Object.keys(merits).length;
    } catch {
      return 0;
    }
  }
  function bindDelegatedSelection(box) {
    if (box.dataset.hgBadgeDelegated === "1") return;
    box.dataset.hgBadgeDelegated = "1";
    box.addEventListener("click", (event) => {
      var _a, _b, _c;
      const target = event.target instanceof Element ? event.target : null;
      const button = target == null ? void 0 : target.closest("[data-badge-id]");
      if (!button || !box.contains(button) || badgeTapIsLocked()) return;
      const next = button.getAttribute("data-badge-id") || "all";
      (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.setActiveBadgeFilter) == null ? void 0 : _b.call(_a, next);
      (_c = win.updateNearbyBadgeFilterButton) == null ? void 0 : _c.call(win);
      render();
    });
  }
  function render() {
    var _a, _b;
    const box = document.getElementById("leftBadgesList");
    if (!(box instanceof HTMLElement)) return;
    bindDelegatedSelection(box);
    const collectedBadgeCount = getCollectedBadgeCount();
    const collectedBadgeText = tfUI(
      "ui.badges.collectedCount",
      "{count} merker samlet",
      { count: collectedBadgeCount }
    );
    const summaryHtml = `<div class="muted" style="font-size:13px;margin:0 0 8px;padding:0 2px;">${escapeHTML(collectedBadgeText)}</div>`;
    const allCategories = Array.isArray(win.CATEGORY_LIST) ? win.CATEGORY_LIST : [];
    if (!allCategories.length) {
      box.innerHTML = `${summaryHtml}<div class="muted">${escapeHTML(tUI("ui.badges.noCategoriesLoaded", "Ingen kategorier lastet."))}</div>`;
      return;
    }
    const activeBadge = ((_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.getActiveBadgeFilter) == null ? void 0 : _b.call(_a)) || "all";
    const categories = activeBadge === "all" ? allCategories : allCategories.filter((category) => String(category.id || "").trim() === activeBadge.trim());
    if (!categories.length) {
      box.innerHTML = `
      ${summaryHtml}
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">\u{1F3C5}</div>
        <div class="hg-empty-guide-title">${escapeHTML(tUI("ui.badges.none", "Ingen merker"))}</div>
        <div class="hg-empty-guide-text">${escapeHTML(tUI("ui.badges.filterHidesAll", "Badgefilteret skjuler alle merker akkurat n\xE5. Trykk badgeknappen for \xE5 vise alle."))}</div>
      </div>
    `;
      return;
    }
    box.innerHTML = summaryHtml + categories.map((category) => {
      const id = escapeHTML(category.id);
      const name = escapeHTML(category.name);
      return `
      <button class="chip ghost" data-badge-id="${id}" style="justify-content:flex-start;width:100%;">
        <img src="bilder/merker/${id}.PNG"
             alt=""
             loading="lazy"
             decoding="async"
             style="width:18px;height:18px;margin-right:8px;border-radius:4px;">
        ${name}
      </button>
    `;
    }).join("");
  }
  var api = { render };
  win.HGNearbyBadgesPanel = api;
  win.renderLeftBadges = render;
})();
