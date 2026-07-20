(() => {
  // js/ui/left-panel.ts
  var win = window;
  function byId(id) {
    return document.getElementById(id);
  }
  function activeLeftPanelMode() {
    var _a, _b;
    return ((_b = (_a = win.HGLeftPanelMode) == null ? void 0 : _a.getActiveMode) == null ? void 0 : _b.call(_a)) || "nearby";
  }
  function renderActiveLeftPanelModeNow() {
    var _a, _b;
    (_b = (_a = win.HGLeftPanelMode) == null ? void 0 : _a.renderNow) == null ? void 0 : _b.call(_a);
  }
  function rerenderActiveLeftPanelMode() {
    var _a, _b;
    (_b = (_a = win.HGLeftPanelMode) == null ? void 0 : _a.rerender) == null ? void 0 : _b.call(_a);
  }
  function setLeftPanelMode(mode) {
    var _a, _b;
    return ((_b = (_a = win.HGLeftPanelMode) == null ? void 0 : _a.setMode) == null ? void 0 : _b.call(_a, mode)) || "nearby";
  }
  function isNearbyDrawerOpen() {
    var _a, _b;
    return Boolean((_b = (_a = win.HGNearbyDrawer) == null ? void 0 : _a.isOpen) == null ? void 0 : _b.call(_a));
  }
  function openNearbyDrawer() {
    var _a, _b;
    (_b = (_a = win.HGNearbyDrawer) == null ? void 0 : _a.open) == null ? void 0 : _b.call(_a);
  }
  function closeNearbyDrawer() {
    var _a, _b;
    (_b = (_a = win.HGNearbyDrawer) == null ? void 0 : _a.close) == null ? void 0 : _b.call(_a);
  }
  function toggleNearbyDrawer() {
    var _a, _b;
    (_b = (_a = win.HGNearbyDrawer) == null ? void 0 : _a.toggle) == null ? void 0 : _b.call(_a);
  }
  function syncLeftPanelFrame() {
    const root = document.documentElement;
    const styles = win.getComputedStyle(root);
    const visualHeaderHeight = Number.parseFloat(
      styles.getPropertyValue("--hg-visual-header-height")
    );
    let headerHeight = Number.isFinite(visualHeaderHeight) ? visualHeaderHeight : 0;
    if (!headerHeight) {
      const header = document.querySelector("header") || document.querySelector(".site-header");
      if (!header) return;
      headerHeight = header.getBoundingClientRect().bottom;
    }
    headerHeight = Math.max(0, Math.round(headerHeight));
    root.style.setProperty("--hg-header-h", `${headerHeight}px`);
  }
  function bindModeControls(select) {
    select == null ? void 0 : select.addEventListener("change", () => setLeftPanelMode(select.value));
    document.querySelectorAll(".nearby-tab").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.getAttribute("data-leftmode") || "nearby";
        if (select) select.value = mode;
        setLeftPanelMode(mode);
        if (!isNearbyDrawerOpen()) openNearbyDrawer();
      });
    });
  }
  function bindNatureRefreshEvents() {
    const renderNatureWhenActive = () => {
      var _a;
      if (activeLeftPanelMode() === "nature") {
        (_a = win.renderNearbyNature) == null ? void 0 : _a.call(win);
      }
    };
    win.addEventListener("hg:nature-loaded", renderNatureWhenActive);
    win.addEventListener("hg:nature", renderNatureWhenActive);
  }
  function bindFrameSync() {
    syncLeftPanelFrame();
    win.addEventListener("resize", syncLeftPanelFrame);
    const placeCard = byId("placeCard");
    if (placeCard && "ResizeObserver" in win) {
      new ResizeObserver(syncLeftPanelFrame).observe(placeCard);
    }
  }
  function initLeftPanel() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (win.__HG_LEFT_PANEL_INIT_DONE__) return;
    win.__HG_LEFT_PANEL_INIT_DONE__ = true;
    const panel = byId("nearbyListContainer");
    if (!panel) return;
    const selectElement = byId("leftPanelMode");
    const select = selectElement instanceof HTMLSelectElement ? selectElement : null;
    (_b = (_a = win.HGNearbyFilters) == null ? void 0 : _a.initializeFromStorage) == null ? void 0 : _b.call(_a);
    const mode = activeLeftPanelMode();
    if (select) select.value = mode;
    setLeftPanelMode(mode);
    bindModeControls(select);
    (_d = (_c = win.HGNearbyDrawer) == null ? void 0 : _c.bindInteractions) == null ? void 0 : _d.call(_c);
    (_f = (_e = win.HGNearbyBadgesPanel) == null ? void 0 : _e.render) == null ? void 0 : _f.call(_e);
    bindNatureRefreshEvents();
    bindFrameSync();
    (_h = (_g = win.HGNearbyFilterControls) == null ? void 0 : _g.init) == null ? void 0 : _h.call(_g);
  }
  function setNearbyCollapsed(hidden) {
    var _a, _b, _c, _d, _e, _f;
    const wantHidden = Boolean(hidden);
    const shouldHide = ((_b = (_a = win.LayerManager) == null ? void 0 : _a.getMode) == null ? void 0 : _b.call(_a)) === "map" ? wantHidden : false;
    const panel = byId("nearbyListContainer");
    if (!panel) return;
    panel.classList.toggle("is-hidden", shouldHide);
    if (wantHidden) closeNearbyDrawer();
    (_d = (_c = win.HGMap) == null ? void 0 : _c.resize) == null ? void 0 : _d.call(_c);
    (_f = (_e = win.MAP) == null ? void 0 : _e.resize) == null ? void 0 : _f.call(_e);
  }
  win.initLeftPanel = initLeftPanel;
  win.setLeftPanelMode = setLeftPanelMode;
  win.rerenderActiveLeftPanelMode = rerenderActiveLeftPanelMode;
  win.renderActiveLeftPanelModeNow = renderActiveLeftPanelModeNow;
  win.openNearbyDrawer = openNearbyDrawer;
  win.closeNearbyDrawer = closeNearbyDrawer;
  win.toggleNearbyDrawer = toggleNearbyDrawer;
  win.setNearbyCollapsed = setNearbyCollapsed;
  if (typeof win.initPlaceCardCollapse === "function") {
    win.initPlaceCardCollapse = win.initPlaceCardCollapse;
  }
})();
