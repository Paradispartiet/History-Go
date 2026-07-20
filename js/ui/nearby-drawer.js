(() => {
  // js/ui/nearbyDrawer.ts
  var win = window;
  var interactionsBound = false;
  function getPanel() {
    return document.getElementById("nearbyListContainer");
  }
  function getToggle() {
    return document.getElementById("nearbyExploreToggle");
  }
  function isOpen() {
    var _a, _b;
    return (_b = (_a = getPanel()) == null ? void 0 : _a.classList.contains("is-drawer-open")) != null ? _b : false;
  }
  function setOpen(open2) {
    var _a, _b;
    const panel = getPanel();
    if (!panel) return;
    panel.classList.toggle("is-drawer-open", open2);
    panel.classList.toggle("is-drawer-closed", !open2);
    (_a = getToggle()) == null ? void 0 : _a.setAttribute("aria-expanded", open2 ? "true" : "false");
    if (open2) (_b = win.rerenderActiveLeftPanelMode) == null ? void 0 : _b.call(win);
  }
  function open() {
    setOpen(true);
  }
  function close() {
    setOpen(false);
  }
  function toggle() {
    setOpen(!isOpen());
  }
  function bindInteractions() {
    if (interactionsBound) return;
    const panel = getPanel();
    if (!panel) return;
    interactionsBound = true;
    const exploreToggle = getToggle();
    close();
    exploreToggle == null ? void 0 : exploreToggle.addEventListener("click", toggle);
    panel.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const item = target == null ? void 0 : target.closest(".nearby-item");
      if (!item || !panel.contains(item)) return;
      close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !isOpen()) return;
      close();
      exploreToggle == null ? void 0 : exploreToggle.focus();
    });
    document.addEventListener("click", (event) => {
      if (!isOpen()) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panel.contains(target) || (exploreToggle == null ? void 0 : exploreToggle.contains(target))) return;
      close();
    });
  }
  win.HGNearbyDrawer = {
    isOpen,
    setOpen,
    open,
    close,
    toggle,
    bindInteractions
  };
})();
