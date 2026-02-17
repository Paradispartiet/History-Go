(function () {
  // States:
  // - open:   fully visible (translateY = 0)
  // - peek:   only collapsed strip visible (translateY = pcHeight - collapsedH)
  // - hidden: fully offscreen (translateY = pcHeight)

  let sheet = null;
  let mini = null;
  let collapseBtn = null;

  let pcHeight = 0;       // design px
  let collapsedH = 0;     // design px
  let current = "hidden";

  function pxNumber(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  function readMetrics() {
    if (!sheet) return;

    const cs = getComputedStyle(sheet);

    // height i design px (ikke påvirket av scale på .app-shell)
    pcHeight = pxNumber(cs.height);

    // collapsed-h hentes fra CSS var (--pc-collapsed-h) hvis mulig
    // fallback: 26 (som du har i :root i placeCard.css)
    const varCollapsed = cs.getPropertyValue("--pc-collapsed-h").trim();
    collapsedH = pxNumber(varCollapsed) || 26;

    // safety
    if (collapsedH < 0) collapsedH = 0;
    if (collapsedH > pcHeight) collapsedH = pcHeight;
  }

  function yForState(state) {
    if (state === "open") return 0;
    if (state === "peek") return Math.max(0, pcHeight - collapsedH);
    return pcHeight; // hidden
  }

  function apply(state) {
    if (!sheet) return;

    readMetrics();

    const y = yForState(state);

    // Viktig: kun px i appen
    sheet.style.transform = `translateY(${y}px)`;

    current = state;

    // aria + mini sync
    const hidden = state === "hidden";
    sheet.setAttribute("aria-hidden", hidden ? "true" : "false");

    if (mini) mini.setAttribute("aria-hidden", hidden ? "false" : "true");

    // collapse button glyph (valgfritt, men praktisk)
    if (collapseBtn) collapseBtn.textContent = (state === "open") ? "▾" : "▴";
  }

  function setState(state) {
    if (!sheet) return;
    if (state === current) return;
    apply(state);
  }

  function open() { setState("open"); }
  function peek() { setState("peek"); }
  function hide() { setState("hidden"); }

  function toggle() {
    // Enkel policy:
    // open -> hidden
    // hidden/peek -> open
    if (current === "open") hide();
    else open();
  }

  function onResize() {
    // behold state, men re-apply med ny pcHeight (dersom font/metrics endrer seg)
    apply(current);
  }

  function init() {
    sheet = document.getElementById("placeCard");
    mini = document.getElementById("pcMini");
    collapseBtn = document.getElementById("pcCollapseBtn");

    if (!sheet) return;

    // Start i "hidden" (matcher aria-hidden="true" i HTML)
    apply("hidden");

    if (collapseBtn) collapseBtn.addEventListener("click", toggle);
    if (mini) mini.addEventListener("click", open);

    // Recalc ved resize/orientation
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize);
    }
  }

  window.BottomSheetController = {
    init,
    setState,
    open,
    peek,
    hide,
    toggle,
    getState: () => current
  };
})();
