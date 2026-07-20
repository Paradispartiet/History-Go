(() => {
  // js/ui/nearbyDrawer.ts
  var win = window;
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
  win.HGNearbyDrawer = {
    isOpen,
    setOpen,
    open,
    close,
    toggle
  };
})();
