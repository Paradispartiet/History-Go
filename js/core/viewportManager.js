(function () {
  const TABLET_DESIGN_WIDTH = 900;
  const TABLET_DESIGN_HEIGHT = 1230;
  const PHONE_DESIGN_WIDTH = 430;
  const PHONE_BREAKPOINT = 520;
  const PHONE_MIN_DESIGN_HEIGHT = 820;

  let shell = null;
  let mapLayer = null;
  let rafId = null;
  let last = { scale: null, x: null, y: null, w: null, h: null };
  let stableViewport = null;
  let lastMode = null;

  function isTextInputActive() {
    const el = document.activeElement;
    if (!el) return false;

    const tag = String(el.tagName || "").toUpperCase();
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      el.isContentEditable === true
    );
  }

  function readViewport() {
    const vv = window.visualViewport;
    if (vv) return { w: vv.width, h: vv.height };
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function getViewport() {
    const current = readViewport();

    // iOS/iPadOS krymper visualViewport når tastaturet åpnes.
    // Appen vår bruker fast design-canvas, så den skal ikke reskaleres
    // bare fordi et inputfelt får fokus.
    if (isTextInputActive() && stableViewport) {
      return stableViewport;
    }

    stableViewport = current;
    return current;
  }

  function getLayout(vw, vh) {
    const isPhone = vw <= PHONE_BREAKPOINT;
    const mode = isPhone ? "phone" : "tablet";
    const designWidth = isPhone ? PHONE_DESIGN_WIDTH : TABLET_DESIGN_WIDTH;
    const designHeight = isPhone
      ? Math.max(PHONE_MIN_DESIGN_HEIGHT, vh)
      : TABLET_DESIGN_HEIGHT;
    return { mode, designWidth, designHeight };
  }

  function calculateScale(vw, vh, designWidth, designHeight) {
    const sx = vw / designWidth;
    const sy = vh / designHeight;
    return Math.min(sx, sy);
  }

  function apply(scale, vw, vh, layout) {
    if (!shell) return;

    const { mode, designWidth, designHeight } = layout;
    const scaledW = designWidth * scale;
    const scaledH = designHeight * scale;

    const x = Math.max(0, (vw - scaledW) / 2);
    const y = 0;

    if (
      last.scale !== null &&
      Math.abs(scale - last.scale) < 0.001 &&
      Math.abs(x - last.x) < 0.5 &&
      Math.abs(y - last.y) < 0.5 &&
      Math.abs(scaledW - last.w) < 0.5 &&
      Math.abs(scaledH - last.h) < 0.5
    ) {
      return;
    }

    // UI-skallet: fortsatt design-canvas som skaleres
    shell.style.width = designWidth + "px";
    shell.style.height = designHeight + "px";
    shell.style.position = "fixed";
    shell.style.top = "0";
    shell.style.left = "0";
    shell.style.transformOrigin = "top left";
    shell.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

    if (lastMode !== mode) {
      document.body.classList.toggle("hg-phone", mode === "phone");
      document.body.classList.toggle("hg-tablet", mode === "tablet");
      lastMode = mode;
    }

    // Kartlaget: IKKE scale-transform, bare samme synlige rektangel
    if (mapLayer) {
      mapLayer.style.position = "fixed";
      mapLayer.style.left = `${x}px`;
      mapLayer.style.top = `${y}px`;
      mapLayer.style.width = `${scaledW}px`;
      mapLayer.style.height = `${scaledH}px`;
      mapLayer.style.transform = "none";
      mapLayer.style.overflow = "hidden";
    }

    window.HGViewport = {
      scale,
      x,
      y,
      mode,
      designWidth,
      designHeight,
      visibleWidth: scaledW,
      visibleHeight: scaledH
    };

    if (window.HGMap?.resize) {
      window.HGMap.resize();
    }

    last = { scale, x, y, w: scaledW, h: scaledH };
  }

  function update() {
    rafId = null;
    const { w, h } = getViewport();
    const layout = getLayout(w, h);
    const scale = calculateScale(w, h, layout.designWidth, layout.designHeight);
    apply(scale, w, h, layout);
  }

  function schedule() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(update);
  }

  function scheduleAfterKeyboardChange() {
    setTimeout(() => {
      stableViewport = null;
      schedule();
    }, 120);
  }

  function init() {
    shell = document.querySelector(".app-shell");
    mapLayer = document.getElementById("mapLayer");
    if (!shell) return;

    update();

    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", scheduleAfterKeyboardChange, { passive: true });

    document.addEventListener("focusin", schedule, { passive: true });
    document.addEventListener("focusout", scheduleAfterKeyboardChange, { passive: true });

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", schedule, { passive: true });
      vv.addEventListener("scroll", schedule, { passive: true });
    }
  }

  window.ViewportManager = { init };
})();
